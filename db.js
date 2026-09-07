const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.resolve(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const OTPS_FILE = path.join(DATA_DIR, 'otps.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Ensure data files exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([
    {
      id: 'usr_trolluz',
      phone: '+998901234567',
      name: 'TROLL.UZ',
      username: 'trolluz',
      passwordHash: hashPassword('donat123'),
      role: 'creator',
      balance: 1450000,
      avatar: 'https://s3.devspace.uz/tirikchilik/IMG_1699.jpeg?x-id=GetObject',
      bio: "Satirik va ko'ngilochar kontent muallifi",
      createdAt: new Date().toISOString()
    }
  ], null, 2), 'utf8');
}
if (!fs.existsSync(OTPS_FILE)) {
  fs.writeFileSync(OTPS_FILE, JSON.stringify({}, null, 2), 'utf8');
}
if (!fs.existsSync(ORDERS_FILE)) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), 'utf8');
}

// Active sessions memory map: token -> { userId, expiresAt }
const sessions = new Map();

function hashPassword(password) {
  const salt = 'donatuz_salt_secret_2026';
  return crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha256').toString('hex');
}

function normalizePhone(raw) {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 9) return '+998' + digits;
  if (digits.length === 12 && digits.startsWith('998')) return '+' + digits;
  if (digits.length === 13 && digits.startsWith('998')) return '+' + digits.slice(1);
  return '+' + digits;
}

function getUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

function getOtps() {
  try {
    return JSON.parse(fs.readFileSync(OTPS_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function saveOtps(otps) {
  fs.writeFileSync(OTPS_FILE, JSON.stringify(otps, null, 2), 'utf8');
}

function getOrders() {
  try {
    return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
}

const DB = {
  normalizePhone,
  hashPassword,

  findUserByPhone(phone) {
    const norm = normalizePhone(phone);
    return getUsers().find(u => u.phone === norm) || null;
  },

  findUserById(id) {
    return getUsers().find(u => u.id === id) || null;
  },

  findUserByUsername(username) {
    if (!username) return null;
    const clean = username.toLowerCase().trim();
    return getUsers().find(u => (u.username || '').toLowerCase() === clean) || null;
  },

  createUser({ phone, name, username, password, avatar, bio }) {
    const normPhone = normalizePhone(phone);
    const users = getUsers();

    if (users.some(u => u.phone === normPhone)) {
      throw new Error("Ushbu telefon raqami allaqachon ro'yxatdan o'tgan");
    }

    if (username && users.some(u => (u.username || '').toLowerCase() === username.toLowerCase().trim())) {
      throw new Error("Ushbu username band, iltimos boshqasini tanlang");
    }

    const newUser = {
      id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      phone: normPhone,
      name: name.trim(),
      username: username ? username.trim().toLowerCase() : null,
      passwordHash: hashPassword(password),
      role: 'creator',
      balance: 0,
      avatar: avatar || 'https://s3.devspace.uz/tirikchilik/IMG_1699.jpeg?x-id=GetObject',
      bio: bio || "DonatUZ ijodkori",
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);
    return newUser;
  },

  updateUser(id, updates) {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error("Foydalanuvchi topilmadi");

    if (updates.password) {
      updates.passwordHash = hashPassword(updates.password);
      delete updates.password;
    }

    users[idx] = { ...users[idx], ...updates, updatedAt: new Date().toISOString() };
    saveUsers(users);
    return users[idx];
  },

  createOtp(phone) {
    const normPhone = normalizePhone(phone);
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins

    const otps = getOtps();
    otps[normPhone] = {
      code,
      expiresAt,
      attempts: 0,
      createdAt: Date.now()
    };
    saveOtps(otps);

    console.log(`\n================================`);
    console.log(`📲 [SMS GATEWAY SIMULATOR]`);
    console.log(`➡️  Telefon: ${normPhone}`);
    console.log(`🔑  Tasdiqlash kodi: ${code}`);
    console.log(`⏳  Yaroqlilik muddati: 5 daqiqa`);
    console.log(`================================\n`);

    return { code, expiresAt };
  },

  verifyOtp(phone, code) {
    const normPhone = normalizePhone(phone);
    const otps = getOtps();
    const entry = otps[normPhone];

    if (!entry) {
      return { valid: false, message: "Tasdiqlash kodi so'ralmagan yoki muddati tugagan" };
    }

    if (Date.now() > entry.expiresAt) {
      delete otps[normPhone];
      saveOtps(otps);
      return { valid: false, message: "Tasdiqlash kodining muddati tugadi. Yangi kod so'rang." };
    }

    entry.attempts = (entry.attempts || 0) + 1;

    if (entry.attempts > 5) {
      delete otps[normPhone];
      saveOtps(otps);
      return { valid: false, message: "Urinishlar soni ko'payib ketdi. Yangi kod so'rang." };
    }

    if (entry.code !== code.trim()) {
      saveOtps(otps);
      return { valid: false, message: "Kiritilgan SMS kod noto'g'ri" };
    }

    // Success: clear OTP
    delete otps[normPhone];
    saveOtps(otps);
    return { valid: true };
  },

  createSession(user) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
    sessions.set(token, {
      userId: user.id,
      expiresAt
    });
    return token;
  },

  getUserByToken(token) {
    if (!token) return null;
    const session = sessions.get(token);
    if (!session) return null;
    if (Date.now() > session.expiresAt) {
      sessions.delete(token);
      return null;
    }
    return this.findUserById(session.userId);
  },

  destroySession(token) {
    if (token) sessions.delete(token);
  },

  // ==========================================
  // 🛒 MERCH ORDERS
  // ==========================================
  getOrders() {
    return getOrders();
  },

  createOrder({ fullName, phone, address, paymentMethod, items, total, note }) {
    const orders = getOrders();
    const newOrder = {
      id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      fullName: (fullName || 'Mijoz').trim(),
      phone: normalizePhone(phone) || phone,
      address: (address || "O'zbekiston").trim(),
      paymentMethod: paymentMethod || 'Naqd',
      items: Array.isArray(items) ? items : [],
      total: parseInt(total, 10) || 0,
      note: (note || '').trim(),
      status: 'new', // new, processing, delivered, cancelled
      createdAt: new Date().toISOString(),
      date: new Date().toLocaleString('uz-UZ', { dateStyle: 'short', timeStyle: 'short' })
    };

    orders.unshift(newOrder);
    saveOrders(orders);
    return newOrder;
  }
};

module.exports = DB;
