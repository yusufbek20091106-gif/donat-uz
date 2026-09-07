const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', '..', '..', 'scratch', 'donat-uz', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const OTPS_FILE = path.join(DATA_DIR, 'otps.json');

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

// DB Methods
const DB = {
  normalizePhone,
  hashPassword,

  findUserByPhone(phone) {
    const norm = normalizePhone(phone);
    return getUsers().find(u => u.phone === norm);
  },

  findUserById(id) {
    return getUsers().find(u => u.id === id);
  },

  findUserByUsername(username) {
    return getUsers().find(u => u.username.toLowerCase() === username.toLowerCase());
  },

  createUser({ phone, name, username, password, role = 'creator' }) {
    const users = getUsers();
    const normPhone = normalizePhone(phone);

    if (users.some(u => u.phone === normPhone)) {
      throw new Error("Ushbu telefon raqami allaqachon ro'yxatdan o'tgan");
    }

    const cleanUsername = (username || name || 'user')
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '') || ('user_' + Date.now().toString().slice(-4));

    const newUser = {
      id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      phone: normPhone,
      name: name || cleanUsername,
      username: cleanUsername,
      passwordHash: hashPassword(password),
      role: role,
      balance: 0,
      avatar: 'https://tirikchilik.uz/assets/default_avatar-706f3630.svg',
      bio: "DonatUZ da yangi ijodkor",
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);
    return newUser;
  },

  createOtp(phone) {
    const normPhone = normalizePhone(phone);
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = Date.now() + 3 * 60 * 1000; // 3 minutes

    const otps = getOtps();
    otps[normPhone] = {
      code,
      expiresAt,
      attempts: 0
    };
    saveOtps(otps);

    // Terminal log simulating SMS Gateway dispatch
    console.log(`\n======================================================`);
    console.log(`📨 [SMS GATEWAY] XABAR YUBORILDI:`);
    console.log(`📱 Raqam: ${normPhone}`);
    console.log(`🔑 Tasdiqlash kodi: [ ${code} ]`);
    console.log(`⏱ Amal qilish vaqti: 3 daqiqa`);
    console.log(`======================================================\n`);

    return { code, expiresAt };
  },

  verifyOtp(phone, code) {
    const normPhone = normalizePhone(phone);
    const otps = getOtps();
    const record = otps[normPhone];

    if (!record) {
      return { valid: false, message: "Kodni avval so'rang (SMS yuborilmagan)" };
    }

    if (Date.now() > record.expiresAt) {
      delete otps[normPhone];
      saveOtps(otps);
      return { valid: false, message: "SMS kod muddati tugagan. Qaytadan so'rang." };
    }

    if (record.attempts >= 5) {
      delete otps[normPhone];
      saveOtps(otps);
      return { valid: false, message: "Urinishlar soni tugadi. Qaytadan kod so'rang." };
    }

    if (record.code !== code.trim()) {
      record.attempts += 1;
      saveOtps(otps);
      return { valid: false, message: `Noto'g'ri kod. ${5 - record.attempts} ta urinish qoldi.` };
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
  }
};

module.exports = DB;
