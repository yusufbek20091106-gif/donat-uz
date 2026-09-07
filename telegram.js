const fs = require('fs');
const path = require('path');
const https = require('https');

const CONFIG_FILE = path.resolve(__dirname, 'data', 'telegram_config.json');

// Default config
const defaultConfig = {
  enabled: true,
  botToken: process.env.TELEGRAM_BOT_TOKEN || '',
  chatId: process.env.TELEGRAM_CHAT_ID || '',
  notifyDonations: true,
  notifyOrders: true,
  history: []
};

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf8');
      return { ...defaultConfig, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error('[Telegram] Config read error:', err.message);
  }
  return { ...defaultConfig };
}

function saveConfig(newConfig) {
  try {
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const current = loadConfig();
    const merged = { ...current, ...newConfig };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), 'utf8');
    return merged;
  } catch (err) {
    console.error('[Telegram] Config save error:', err.message);
    throw err;
  }
}

// Low-level send message via Telegram Bot API
function sendTelegramMessage(text, options = {}) {
  return new Promise((resolve) => {
    const config = loadConfig();
    const botToken = options.botToken || config.botToken;
    const chatId = options.chatId || config.chatId;

    const logEntry = {
      id: Date.now(),
      time: new Date().toLocaleTimeString('uz-UZ'),
      chatId: chatId || '(Kiritilmagan)',
      text: text.replace(/<[^>]+>/g, ''), // Plain preview
      status: 'pending'
    };

    if (!botToken || !chatId) {
      console.log(`\n📢 [TELEGRAM BOT SIMULATOR]`);
      console.log(`➡️  Chat ID: ${chatId || '(Bog\'lanmagan)'}`);
      console.log(`💬  Xabar:\n${text}\n`);
      logEntry.status = 'simulated';
      logEntry.note = 'Bot Token yoki Chat ID ulanmagan (Simulyator rejimi)';
      appendHistory(config, logEntry);
      return resolve({ success: true, simulated: true, message: 'Simulyatsiya qilindi' });
    }

    const payload = JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });

    const reqOptions = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${botToken}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 8000
    };

    const req = https.request(reqOptions, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.ok) {
            console.log(`✅ [Telegram] Xabar ${chatId} ga yuborildi!`);
            logEntry.status = 'delivered';
            appendHistory(config, logEntry);
            resolve({ success: true, delivered: true, data: parsed.result });
          } else {
            console.error(`❌ [Telegram] API xatolik:`, parsed.description);
            logEntry.status = 'failed';
            logEntry.note = parsed.description;
            appendHistory(config, logEntry);
            resolve({ success: false, error: parsed.description });
          }
        } catch (e) {
          logEntry.status = 'failed';
          logEntry.note = e.message;
          appendHistory(config, logEntry);
          resolve({ success: false, error: e.message });
        }
      });
    });

    req.on('error', (e) => {
      console.error(`❌ [Telegram] Tarmoq xatosi:`, e.message);
      logEntry.status = 'failed';
      logEntry.note = e.message;
      appendHistory(config, logEntry);
      resolve({ success: false, error: e.message });
    });

    req.on('timeout', () => {
      req.destroy();
      logEntry.status = 'timeout';
      logEntry.note = 'Vaqt tugadi (Timeout)';
      appendHistory(config, logEntry);
      resolve({ success: false, error: 'Telegram API timeout' });
    });

    req.write(payload);
    req.end();
  });
}

function appendHistory(config, entry) {
  try {
    if (!config.history) config.history = [];
    config.history.unshift(entry);
    if (config.history.length > 30) config.history = config.history.slice(0, 30);
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
  } catch (err) {
    // silent
  }
}

// 1. Yangi donat haqida xabarnoma
async function sendDonationAlert(donation) {
  const config = loadConfig();
  if (!config.enabled || !config.notifyDonations) return { skipped: true };

  const amountStr = (donation.amount || 0).toLocaleString('uz-UZ');
  const message = [
    `🎉 <b>Tabriklaymiz! Sizga yangi donat kelib tushdi!</b>`,
    ``,
    `👤 <b>Kimdan:</b> ${donation.username || 'Anonim'}`,
    `💰 <b>Summa:</b> ${amountStr} so'm`,
    `💬 <b>Xabar:</b> <i>"${donation.message || 'Xabarsiz'}"</i>`,
    `💳 <b>To'lov tizimi:</b> ${donation.system || 'Click / Payme'}`,
    `⏰ <b>Vaqt:</b> ${donation.date || new Date().toLocaleTimeString('uz-UZ')}`,
    ``,
    `🔗 <b>DonatUZ Platformasi</b>`
  ].join('\n');

  return await sendTelegramMessage(message);
}

// 2. Yangi Merch Buyurtmasi haqida xabarnoma
async function sendOrderAlert(order) {
  const config = loadConfig();
  if (!config.enabled || !config.notifyOrders) return { skipped: true };

  const totalStr = (order.total || 0).toLocaleString('uz-UZ');
  const itemsText = (order.items || []).map(i => `• ${i.title} (${i.quantity} dona × ${(i.price || 0).toLocaleString('uz-UZ')} so'm)`).join('\n');

  const message = [
    `🛍 <b>Yangi Merch Buyurtmasi! (#${order.id})</b>`,
    ``,
    `👤 <b>Buyurtmachi:</b> ${order.fullName}`,
    `📞 <b>Telefon:</b> ${order.phone}`,
    `📍 <b>Manzil:</b> ${order.address}`,
    `💳 <b>To'lov turi:</b> ${order.paymentMethod || 'Naqd'}`,
    order.note ? `📝 <b>Izoh:</b> ${order.note}` : '',
    ``,
    `📦 <b>Buyurtma tarkibi:</b>`,
    itemsText,
    ``,
    `💵 <b>Jami to'lov:</b> <b>${totalStr} so'm</b>`,
    `⏰ <b>Vaqt:</b> ${order.date || new Date().toLocaleTimeString('uz-UZ')}`,
    ``,
    `⚡ <i>Buyurtmani tezda yetkazib berish bo'limiga yuboring!</i>`
  ].filter(Boolean).join('\n');

  return await sendTelegramMessage(message);
}

module.exports = {
  loadConfig,
  saveConfig,
  sendTelegramMessage,
  sendDonationAlert,
  sendOrderAlert
};
