const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.resolve(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const OTPS_FILE = path.join(DATA_DIR, 'otps.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const DONATIONS_FILE = path.join(DATA_DIR, 'donations.json');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');

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
if (!fs.existsSync(DONATIONS_FILE)) {
  fs.writeFileSync(DONATIONS_FILE, JSON.stringify([
    {
      id: 'don_init_1',
      username: 'Javohir',
      amount: 50000,
      message: 'Zo\'r video bo\'libdi, yangilarini kutyapmiz!',
      creator: 'trolluz',
      system: 'Click',
      date: 'Bugun, 11:42',
      createdAt: new Date().toISOString()
    },
    {
      id: 'don_init_2',
      username: 'Anvar aka',
      amount: 100000,
      message: 'Ijodingizga ulkan omad!',
      creator: 'trolluz',
      system: 'Payme',
      date: 'Kecha, 20:15',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ], null, 2), 'utf8');
}
if (!fs.existsSync(POSTS_FILE)) {
  fs.writeFileSync(POSTS_FILE, JSON.stringify([
    {
      id: 'post_donatuz_v2',
      author: 'donatuz_team',
      authorName: 'DonatUZ Rasmiy',
      authorHandle: '@donatuz_official',
      authorAvatar: 'https://tirikchilik.uz/assets/LogoIcon-4c66e927.svg',
      badge: 'Rasmiy Yangilanish',
      badgeColor: '#ffc000',
      tag: 'Yangilik',
      title: 'DonatUZ 2.0 Katta Yangilanishi Ishga Tushirildi! 🚀',
      content: 'Hurmatli ijodkorlar va obunachilar! DonatUZ platformasi yangi bosqichga qadam qo\'ydi:\n\n✨ Branded To\'lov Kartalari: Click, Payme va Uzum Bank kartalari orqali donat yuborish;\n🛒 Merch Do\'koni: Futbolkalar, kepkalar va eksklyuziv suvenirlar savatchasi hamda to\'liq yetkazib berish buyurtma formasi;\n🤖 Telegram Bot Integratsiyasi: Har bir donat va buyurtma soniyalarda ijodkorning Telegramiga to\'liq ma\'lumotlar bilan yetib boradi;\n🔍 Jonli Qidiruv va Toifalar: Ijodkorlar va merchlarni bir harfdanoq saralash;\n🎶 G\'alaba Sintezatori va Bayramona Konfetti: Donat tushganda haqiqiy Web Audio g\'alaba ohangi va tabrik modali.\n\nIjodingizni birgalikda yuksaklarga ko\'taramiz!',
      image: 'https://tirikchilik.uz/assets/Main1-18bf3998.png',
      likes: 142,
      comments: [
        { id: 'c1', name: 'Javohir', text: 'To\'lov kartalari dizayni juda chiroyli chiqibdi, barakalla!', time: '10 daqiqa oldin' },
        { id: 'c2', name: 'Timur', text: 'Telegram botga tezkor xabar kelishi super qulay ekan!', time: '5 daqiqa oldin' }
      ],
      createdAt: new Date().toISOString(),
      timeAgo: '15 daqiqa oldin'
    },
    {
      id: 'post_trolluz_1',
      author: 'trolluz',
      authorName: 'TROLL.UZ',
      authorHandle: '@trolluz',
      authorAvatar: 'https://s3.devspace.uz/tirikchilik/IMG_1699.jpeg?x-id=GetObject',
      badge: 'Ijodkor',
      badgeColor: '#38bdf8',
      tag: 'Sahna orti',
      title: 'Yangi ko\'rsatuvimiz montaj jarayonida! 🎬',
      content: 'Hammaga salom! Yangi katta satirik videomiz ssenariysi bitdi va hozir montaj stolida. Sahna ortidagi eng qiziqarli voqealar va kadrlarni birinchi bo\'lib aynan shu yangiliklar lentamizda e\'lon qilamiz. Bizni qo\'llab-quvvatlayotgan har bir saxiy yurtdoshimizga cheksiz minnatdorchilik bildiramiz!',
      image: '',
      likes: 89,
      comments: [
        { id: 'c3', name: 'Otabek', text: 'Premyerani intizorlik bilan kutyapmiz, omad!', time: '1 soat oldin' }
      ],
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      timeAgo: '1 soat oldin'
    },
    {
      id: 'post_konsta_1',
      author: 'konsta',
      authorName: 'Konsta',
      authorHandle: '@konsta',
      authorAvatar: 'https://s3.devspace.uz/tirikchilik/production/avatar/94183624_22106680_avatar.jpeg',
      badge: 'Musiqa',
      badgeColor: '#a855f7',
      tag: 'Eksklyuziv',
      title: 'Yangi albomdan jonli akustik parcha 🎧',
      content: 'Studiyada tuni bilan ishlab, yangi albomdagi eng yurakka yaqin treklardan birining akustik versiyasini yakunladik. DonatUZ orqali ijodimizga qanot berayotgan muxlislarimiz uchun yaqin kunlarda audio parchani taqdim etamiz. O\'zingizni asrang!',
      image: '',
      likes: 115,
      comments: [
        { id: 'c4', name: 'Madina', text: 'Konsta, har bir trekingiz haqiqiy she\'riyat!', time: '2 soat oldin' }
      ],
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      timeAgo: '2 soat oldin'
    },
    {
      id: 'post_chumolilar_1',
      author: 'chumolilar',
      authorName: 'Chumolilar',
      authorHandle: '@chumolilar',
      authorAvatar: 'https://s3.devspace.uz/tirikchilik/IMG_0225.jpeg?x-id=GetObject',
      badge: 'Strim',
      badgeColor: '#22c55e',
      tag: 'Strim',
      title: 'Bugun soat 20:00 da jonli strimda uchrashamiz! 🔥',
      content: 'Do\'stlar, bugun kechki payt YouTube va Twitch platformalarida jonli efir qilamiz! DonatUZ yangi OBS strim vidjetini ulab qo\'ydik — yuborgan har bir donatingiz va xabaringiz to\'g\'ridan-to\'g\'ri efirda aks etadi. Kirib salomlashib turinglar!',
      image: '',
      likes: 64,
      comments: [],
      createdAt: new Date(Date.now() - 18000000).toISOString(),
      timeAgo: '5 soat oldin'
    }
  ], null, 2), 'utf8');
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

function getDonations() {
  try {
    return JSON.parse(fs.readFileSync(DONATIONS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveDonations(donations) {
  fs.writeFileSync(DONATIONS_FILE, JSON.stringify(donations, null, 2), 'utf8');
}

function getPosts() {
  try {
    return JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function savePosts(posts) {
  fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf8');
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
  },

  // ==========================================
  // 🎁 DONATIONS
  // ==========================================
  getDonations(creator = null) {
    const list = getDonations();
    if (!creator) return list;
    const clean = creator.toLowerCase().replace(/[^a-z0-9_]/g, '');
    return list.filter(d => (d.creator || '').toLowerCase().replace(/[^a-z0-9_]/g, '') === clean);
  },

  createDonation({ username, amount, message, paymentMethod, creator, youtubeId }) {
    const donations = getDonations();
    const numAmount = parseInt(amount, 10) || 5000;
    const targetCreator = (creator || 'trolluz').toLowerCase().replace(/[^a-z0-9_]/g, '');

    const newDonation = {
      id: 'don_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      username: (username || 'Aziz obunachi').trim(),
      amount: numAmount,
      message: (message || '').trim(),
      system: paymentMethod || 'Click',
      creator: targetCreator,
      youtubeId: youtubeId || null,
      createdAt: new Date().toISOString(),
      date: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
    };

    donations.unshift(newDonation);
    saveDonations(donations);

    // Muallif balansini oshirish
    const users = getUsers();
    const user = users.find(u => (u.username || '').toLowerCase() === targetCreator || u.id === 'usr_' + targetCreator);
    if (user) {
      user.balance = (user.balance || 0) + numAmount;
      saveUsers(users);
    }

    return newDonation;
  },

  // ==========================================
  // 📰 YANGILIKLAR LENTASI (NEWS FEED & POSTS)
  // ==========================================
  getPosts(tag = null) {
    const list = getPosts();
    if (!tag || tag === 'all' || tag === 'barchasi') return list;
    return list.filter(p => (p.tag || '').toLowerCase() === tag.toLowerCase());
  },

  createPost({ author, authorName, authorHandle, authorAvatar, title, content, image, tag, badge, badgeColor }) {
    const posts = getPosts();
    const newPost = {
      id: 'post_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      author: author || 'foydalanuvchi',
      authorName: authorName || 'DonatUZ Muallifi',
      authorHandle: authorHandle || ('@' + (author || 'muallif')),
      authorAvatar: authorAvatar || 'https://tirikchilik.uz/assets/LogoIcon-4c66e927.svg',
      badge: badge || 'Ijodkor',
      badgeColor: badgeColor || '#ffc000',
      tag: tag || 'Yangilik',
      title: (title || '').trim(),
      content: (content || '').trim(),
      image: image || '',
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString(),
      timeAgo: 'Hozirgina'
    };

    posts.unshift(newPost);
    savePosts(posts);
    return newPost;
  },

  likePost(postId) {
    const posts = getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return null;

    post.likes = (post.likes || 0) + 1;
    savePosts(posts);
    return post;
  },

  addComment(postId, { name, text }) {
    const posts = getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return null;

    if (!Array.isArray(post.comments)) post.comments = [];
    const newComment = {
      id: 'c_' + Date.now().toString(36),
      name: (name || 'Muxlis').trim(),
      text: (text || '').trim(),
      time: 'Hozirgina'
    };

    post.comments.push(newComment);
    savePosts(posts);
    return newComment;
  }
};

module.exports = DB;
