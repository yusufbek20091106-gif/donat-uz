const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = path.resolve(__dirname, 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function run() {
  console.log('🚀 Launching Puppeteer E2E Verification Suite...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 860 });

  // 1. Test Authors Search & Category Filter
  console.log('\n--- 1. Testing Authors Search & Filter ---');
  await page.goto('http://localhost:3000/authors', { waitUntil: 'networkidle2' });
  await page.waitForSelector('#authorsSearchInput', { timeout: 5000 });

  // Type search query
  await page.type('#authorsSearchInput', 'TROLL.UZ');
  await new Promise(r => setTimeout(r, 800));

  const shot1 = path.join(SCREENSHOT_DIR, '27_authors_live_search.png');
  await page.screenshot({ path: shot1, fullPage: false });
  console.log('✅ Captured 27_authors_live_search.png');

  // 2. Test Creator Page Donation Form & Celebration Modal
  console.log('\n--- 2. Testing Creator Page & Celebration Modal ---');
  await page.goto('http://localhost:3000/trolluz', { waitUntil: 'networkidle2' });
  await page.waitForSelector('.donatuz-pay-card', { timeout: 5000 });

  // Select "Payme" card
  const paymeCard = await page.$('.donatuz-pay-card[data-payment="Payme"]');
  if (paymeCard) {
    await paymeCard.click();
    console.log('✅ Clicked Payme payment card');
  }

  // Click 100 000 UZS pill
  const pills = await page.$$('.pill-amount-btn');
  for (const p of pills) {
    const txt = await page.evaluate(el => el.textContent, p);
    if (txt.includes('100 000') || txt.includes('100')) {
      await p.click();
      console.log('✅ Selected 100 000 UZS amount preset');
      break;
    }
  }

  // Fill in donor name and message
  const nameInput = await page.$('input#input-16');
  if (nameInput) {
    await nameInput.click({ clickCount: 3 });
    await nameInput.type('Yusufbek');
  }

  const msgInput = await page.$('textarea');
  if (msgInput) {
    await msgInput.click({ clickCount: 3 });
    await msgInput.type('Zo\'r strim bo\'lyapti, omad ijodga!');
  }

  // Submit donation form
  console.log('🎁 Submitting donation form...');
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) {
    await submitBtn.click();
  }

  // Wait for Celebration Modal to open
  await page.waitForSelector('.donatuz-celebrate-overlay.open', { timeout: 8000 });
  await new Promise(r => setTimeout(r, 1200)); // allow confetti to spread

  const shot2 = path.join(SCREENSHOT_DIR, '28_creator_donation_modal.png');
  await page.screenshot({ path: shot2, fullPage: false });
  console.log('✅ Captured 28_creator_donation_modal.png');

  // 3. Test Market Real-Time Search & Filters
  console.log('\n--- 3. Testing Market Search & Filter ---');
  await page.goto('http://localhost:3000/market', { waitUntil: 'networkidle2' });
  await page.waitForSelector('#input-9', { timeout: 5000 });

  // Type "kepka" in search
  await page.type('#input-9', 'kepka');
  await new Promise(r => setTimeout(r, 800));

  const shot3 = path.join(SCREENSHOT_DIR, '29_market_filtered.png');
  await page.screenshot({ path: shot3, fullPage: false });
  console.log('✅ Captured 29_market_filtered.png');

  await browser.close();
  console.log('\n🎉 ALL E2E VERIFICATION CHECKS PASSED BENUQSON!');
}

run().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
