const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');
const DB = require('./db.js');
const Telegram = require('./telegram.js');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PUBLIC_DIR = path.resolve(__dirname, 'public');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(PUBLIC_DIR));

// In-memory data for donations and dashboard
let dashboardState = {
  balance: 1450000,
  count: 14,
  goal: {
    title: "Yangi studiya jihozlari",
    target: 5000000,
    current: 1450000
  },
  settings: {
    alertSound: "coin"
  },
  donations: [
    {
      id: 1,
      username: "Sardorbek",
      amount: 100000,
      message: "Yangi videolar uchun rahmat, zo'r ketyapti!",
      system: "Click",
      date: "Bugun 10:45"
    },
    {
      id: 2,
      username: "Madina",
      amount: 50000,
      message: "Ijodingizga omad!",
      system: "Payme",
      date: "Bugun 09:30"
    },
    {
      id: 3,
      username: "Anonim",
      amount: 25000,
      message: "Choy-poyga deb hisoblang :)",
      system: "Uzum",
      date: "Kecha 22:15"
    }
  ]
};

// ==========================================
// 🔐 AUTH & SMS OTP API ENDPOINTS
// ==========================================

// 1. SMS Kod Yuborish (Send OTP)
app.post('/api/auth/send-otp', (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: "Telefon raqami kiritilmadi" });
    }

    const normPhone = DB.normalizePhone(phone);
    if (!normPhone.match(/^\+998\d{9}$/)) {
      return res.status(400).json({
        success: false,
        message: "O'zbekiston telefon raqami noto'g'ri formatda (+998 XX XXX XX XX)"
      });
    }

    const otp = DB.createOtp(normPhone);
    const existingUser = DB.findUserByPhone(normPhone);

    res.json({
      success: true,
      message: `SMS kod ${normPhone} raqamiga yuborildi`,
      phone: normPhone,
      isRegistered: !!existingUser,
      expiresAt: otp.expiresAt,
      devCode: otp.code
    });
  } catch (err) {
    console.error('Error send-otp:', err);
    res.status(500).json({ success: false, message: "Serverda xatolik yuz berdi" });
  }
});

// 2. SMS Kodni Tasdiqlash (Verify OTP)
app.post('/api/auth/verify-otp', (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ success: false, message: "Telefon va SMS kod kiritilishi shart" });
    }

    const normPhone = DB.normalizePhone(phone);
    const verifyResult = DB.verifyOtp(normPhone, code);

    if (!verifyResult.valid) {
      return res.status(400).json({ success: false, message: verifyResult.message });
    }

    const user = DB.findUserByPhone(normPhone);

    if (user) {
      const token = DB.createSession(user);
      const { passwordHash, ...safeUser } = user;
      return res.json({
        success: true,
        isNewUser: false,
        message: `Xush kelibsiz, ${user.name}!`,
        user: safeUser,
        token
      });
    } else {
      return res.json({
        success: true,
        isNewUser: true,
        phone: normPhone,
        message: "Telefon raqamingiz tasdiqlandi. Ro'yxatdan o'tish uchun ismingiz va parolingizni kiriting."
      });
    }
  } catch (err) {
    console.error('Error verify-otp:', err);
    res.status(500).json({ success: false, message: "Tasdiqlashda xatolik yuz berdi" });
  }
});

// 3. Yangi Foydalanuvchini Ro'yxatdan O'tkazish (Complete Registration)
app.post('/api/auth/register', (req, res) => {
  try {
    const { phone, name, username, password } = req.body;
    if (!phone || !name || !password) {
      return res.status(400).json({ success: false, message: "Barcha maydonlarni to'ldiring" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Parol kamida 6 belgidan iborat bo'lishi kerak" });
    }

    const normPhone = DB.normalizePhone(phone);
    const user = DB.createUser({
      phone: normPhone,
      name: name.trim(),
      username: username ? username.trim() : null,
      password: password
    });

    const token = DB.createSession(user);
    const { passwordHash, ...safeUser } = user;

    res.json({
      success: true,
      message: "Tabriklaymiz! Hisobingiz muvaffaqiyatli yaratildi.",
      user: safeUser,
      token
    });
  } catch (err) {
    console.error('Error register:', err);
    res.status(400).json({ success: false, message: err.message || "Ro'yxatdan o'tishda xatolik" });
  }
});

// 4. Parol Orqali Kirish (Password Login)
app.post('/api/auth/login', (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ success: false, message: "Telefon va parolni kiriting" });
    }

    const normPhone = DB.normalizePhone(phone);
    const user = DB.findUserByPhone(normPhone);

    if (!user || user.passwordHash !== DB.hashPassword(password)) {
      return res.status(401).json({ success: false, message: "Telefon raqam yoki parol noto'g'ri" });
    }

    const token = DB.createSession(user);
    const { passwordHash, ...safeUser } = user;

    res.json({
      success: true,
      message: `Xush kelibsiz, ${user.name}!`,
      user: safeUser,
      token
    });
  } catch (err) {
    console.error('Error login:', err);
    res.status(500).json({ success: false, message: "Kirishda xatolik yuz berdi" });
  }
});

// 5. Joriy Profil Ma'lumotlarini Olish (Get Me)
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ success: false, message: "Avtorizatsiyadan o'tilmagan" });
  }

  const user = DB.getUserByToken(token);
  if (!user) {
    return res.status(401).json({ success: false, message: "Sessiya muddati tugagan" });
  }

  const { passwordHash, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

// 6. Chiqish (Logout)
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (token) DB.destroySession(token);
  res.json({ success: true, message: "Muvaffaqiyatli tizimdan chiqildi" });
});

// ==========================================
// 📊 DASHBOARD & DONATION API ENDPOINTS
// ==========================================
app.get('/api/stats', (req, res) => {
  res.json(dashboardState);
});

app.post('/api/goal', (req, res) => {
  const { title, target } = req.body;
  if (title) dashboardState.goal.title = title;
  if (target) dashboardState.goal.target = parseInt(target, 10) || dashboardState.goal.target;
  io.emit('goal_updated', dashboardState.goal);
  res.json({ success: true, goal: dashboardState.goal });
});

app.post('/api/settings', (req, res) => {
  const { alertSound } = req.body;
  if (alertSound) dashboardState.settings.alertSound = alertSound;
  res.json({ success: true, settings: dashboardState.settings });
});

app.post('/api/donate', async (req, res) => {
  try {
    const { username, amount, message, paymentMethod, creator, youtubeId } = req.body;
    const numAmount = parseInt(amount, 10) || 15000;

    const donation = DB.createDonation({
      username: username || 'Aziz obunachi',
      amount: numAmount,
      message: message || "Ijodingizga ulkan omad!",
      paymentMethod: paymentMethod || 'Click',
      creator: creator || 'trolluz',
      youtubeId: youtubeId || null
    });

    dashboardState.balance += numAmount;
    dashboardState.count += 1;
    dashboardState.goal.current += numAmount;
    dashboardState.donations.unshift(donation);

    console.log(`\n🎉 YANGI DONAT: ${donation.username} -> ${donation.creator} (${donation.amount} UZS) [${donation.system}]`);

    // Socket.io orqali jonli efir vidjetlariga uzatish
    io.emit('new_donation', donation);

    // 🤖 Telegram Bot orqali muallifga zudlik bilan xabarnoma yuborish
    Telegram.sendDonationAlert(donation)
      .then(result => {
        io.emit('telegram_status', { type: 'donation', result });
      })
      .catch(err => {
        console.error('Telegram dispatch error:', err.message);
      });

    res.json({
      success: true,
      message: "Donatingiz muvaffaqiyatli qabul qilindi! Rahmat!",
      donation
    });
  } catch (err) {
    console.error('Error donate:', err);
    res.status(500).json({ success: false, message: "Donat qabul qilishda xatolik yuz berdi" });
  }
});

// ==========================================
// 🤖 TELEGRAM BOT INTEGRATSIYA API
// ==========================================
app.get('/api/telegram/config', (req, res) => {
  try {
    const config = Telegram.loadConfig();
    res.json({
      success: true,
      config: {
        enabled: config.enabled !== false,
        botToken: config.botToken || '',
        chatId: config.chatId || '',
        notifyDonations: config.notifyDonations !== false,
        notifyOrders: config.notifyOrders !== false,
        history: (config.history || []).slice(0, 10)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/telegram/config', (req, res) => {
  try {
    const { botToken, chatId, enabled, notifyDonations, notifyOrders } = req.body;
    const updated = Telegram.saveConfig({
      botToken: (botToken || '').trim(),
      chatId: (chatId || '').trim(),
      enabled: enabled !== false,
      notifyDonations: notifyDonations !== false,
      notifyOrders: notifyOrders !== false
    });

    res.json({
      success: true,
      message: "Telegram bot sozlamalari muvaffaqiyatli saqlandi!",
      config: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/telegram/test', async (req, res) => {
  try {
    const { botToken, chatId } = req.body;
    const testMsg = [
      `🚀 <b>DonatUZ x Telegram Bot integratsiyasi sinovi!</b>`,
      ``,
      `✅ Bot muvaffaqiyatli bog'landi!`,
      `⏰ <b>Vaqt:</b> ${new Date().toLocaleTimeString('uz-UZ')}`,
      ``,
      `Endi sizga har bir yangi donat va market buyurtmasi haqida shu yerga tezkor xabarnoma kelib turadi!`
    ].join('\n');

    const result = await Telegram.sendTelegramMessage(testMsg, { botToken, chatId });
    res.json({ success: result.success, result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 🛒 MERCH MARKET BUYURTMA API
// ==========================================
app.post('/api/orders', async (req, res) => {
  try {
    const { fullName, phone, address, paymentMethod, items, total, note } = req.body;

    if (!fullName || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: "Iltimos, ism, telefon raqam va yetkazib berish manzilini to'liq kiriting"
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Savatchangiz bo'sh. Mahsulot tanlang."
      });
    }

    const order = DB.createOrder({
      fullName,
      phone,
      address,
      paymentMethod,
      items,
      total,
      note
    });

    // Telegram orqali xabar yuborish
    Telegram.sendOrderAlert(order)
      .then(res => console.log('Telegram order notification dispatched'))
      .catch(e => console.error('Telegram order error:', e.message));

    // Dashboardga jonli signal berish
    io.emit('new_order', order);

    res.json({
      success: true,
      message: "Buyurtmangiz qabul qilindi! Tez orada siz bilan bog'lanamiz.",
      orderId: order.id,
      order
    });
  } catch (err) {
    console.error('Error orders:', err);
    res.status(500).json({ success: false, message: "Buyurtma berishda server xatosi" });
  }
});

app.get('/api/orders', (req, res) => {
  try {
    const orders = DB.getOrders();
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 🎁 DONATSIYA TIZIMI (DONATIONS LIST API)
// ==========================================
app.get('/api/donations', (req, res) => {
  try {
    const creator = req.query.creator || null;
    const donations = DB.getDonations(creator);
    res.json({ success: true, donations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 📰 YANGILIKLAR LENTASI API (POSTS & FEED)
// ==========================================
app.get('/api/posts', (req, res) => {
  try {
    const tag = req.query.tag || null;
    const posts = DB.getPosts(tag);
    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/posts', (req, res) => {
  try {
    const { author, authorName, authorHandle, authorAvatar, title, content, image, tag, badge, badgeColor } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "Post matni bo'sh bo'lishi mumkin emas" });
    }

    const newPost = DB.createPost({
      author,
      authorName,
      authorHandle,
      authorAvatar,
      title,
      content,
      image,
      tag,
      badge,
      badgeColor
    });

    io.emit('new_post', newPost);
    res.json({ success: true, message: "Yangi post e'lon qilindi!", post: newPost });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/posts/:id/like', (req, res) => {
  try {
    const post = DB.likePost(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post topilmadi" });
    }
    io.emit('post_liked', { id: post.id, likes: post.likes });
    res.json({ success: true, likes: post.likes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/posts/:id/comment', (req, res) => {
  try {
    const { name, text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Izoh matnini kiriting" });
    }
    const comment = DB.addComment(req.params.id, { name, text });
    if (!comment) {
      return res.status(404).json({ success: false, message: "Post topilmadi" });
    }
    io.emit('new_comment', { postId: req.params.id, comment });
    res.json({ success: true, comment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 🌐 ASOSIY SAHIFALAR VA MARSHRUTLAR
// ==========================================
app.get('/', (req, res) => res.sendFile('index.html', { root: PUBLIC_DIR }));
app.get('/index.html', (req, res) => res.sendFile('index.html', { root: PUBLIC_DIR }));
app.get('/lenta', (req, res) => res.sendFile('feed.html', { root: PUBLIC_DIR }));
app.get('/lenta.html', (req, res) => res.sendFile('feed.html', { root: PUBLIC_DIR }));
app.get('/feed', (req, res) => res.sendFile('feed.html', { root: PUBLIC_DIR }));
app.get('/feed.html', (req, res) => res.sendFile('feed.html', { root: PUBLIC_DIR }));
app.get('/news', (req, res) => res.sendFile('feed.html', { root: PUBLIC_DIR }));
app.get('/news.html', (req, res) => res.sendFile('feed.html', { root: PUBLIC_DIR }));
app.get('/auth', (req, res) => res.sendFile('auth.html', { root: PUBLIC_DIR }));
app.get('/login', (req, res) => res.sendFile('auth.html', { root: PUBLIC_DIR }));
app.get('/registration', (req, res) => res.sendFile('auth.html', { root: PUBLIC_DIR }));
app.get('/authors', (req, res) => res.sendFile('authors.html', { root: PUBLIC_DIR }));
app.get('/market', (req, res) => res.sendFile('market.html', { root: PUBLIC_DIR }));
app.get('/shop', (req, res) => res.sendFile('market.html', { root: PUBLIC_DIR }));
app.get('/instruction', (req, res) => res.sendFile('instruction.html', { root: PUBLIC_DIR }));
app.get('/help', (req, res) => res.sendFile('instruction.html', { root: PUBLIC_DIR }));
app.get('/dashboard', (req, res) => res.sendFile('dashboard.html', { root: PUBLIC_DIR }));
app.get('/dashboard.html', (req, res) => res.sendFile('dashboard.html', { root: PUBLIC_DIR }));
app.get('/creator', (req, res) => res.sendFile('creator.html', { root: PUBLIC_DIR }));
app.get('/trolluz', (req, res) => res.sendFile('creator.html', { root: PUBLIC_DIR }));
app.get('/widget', (req, res) => res.sendFile('widget.html', { root: PUBLIC_DIR }));
app.get('/goal', (req, res) => res.sendFile('goal.html', { root: PUBLIC_DIR }));
app.get('/top', (req, res) => res.sendFile('top.html', { root: PUBLIC_DIR }));

// Har qanday ijodkor profili (masalan: /bezzbets, /chumoli, /yakudza va h.k.)
app.get('/:creator', (req, res) => {
  res.sendFile('creator.html', { root: PUBLIC_DIR });
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 DonatUZ Server 0.0.0.0:${PORT} da to'liq va benuqson ishga tushdi`);
});
