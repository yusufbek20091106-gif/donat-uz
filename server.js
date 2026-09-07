const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');
const DB = require('./db.js');

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

app.post('/api/donate', (req, res) => {
  const { username, amount, message, paymentMethod, youtubeUrl } = req.body;
  const numAmount = parseInt(amount, 10) || 15000;
  const newDonation = {
    id: Date.now(),
    username: username || 'Anonim obunachi',
    amount: numAmount,
    message: message || "Ijodingizga ulkan omad!",
    system: paymentMethod || 'Click / Payme',
    youtubeUrl: youtubeUrl || '',
    date: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
  };

  dashboardState.balance += numAmount;
  dashboardState.count += 1;
  dashboardState.goal.current += numAmount;
  dashboardState.donations.unshift(newDonation);

  io.emit('new_donation', newDonation);
  res.json({ success: true, donation: newDonation });
});

// ==========================================
// 🌐 ASOSIY SAHIFALAR VA MARSHRUTLAR
// ==========================================
app.get('/', (req, res) => res.sendFile('index.html', { root: PUBLIC_DIR }));
app.get('/index.html', (req, res) => res.sendFile('index.html', { root: PUBLIC_DIR }));
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
