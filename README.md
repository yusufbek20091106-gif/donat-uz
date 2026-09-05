# DonatUZ — O'zbekiston Ijodkorlari va Dasturchilari uchun Donat Platformasi 🌟

**DonatUZ** — o'zbek blogerlari, ijodkorlari va dasturchilarini to'g'ridan-to'g'ri qo'llab-quvvatlash uchun mo'ljallangan zamonaviy, tezkor va qulay veb-platforma.

---

## 🚀 Asosiy Imkoniyatlar

- **Mualliflar katalogi (`/authors`):** Sevimli ijodkorlarni qidirish, saralash va ularni darhol qo'llash imkoniyati (`Qo'llash ↗`).
- **Mualliflik profillari (`/trolluz` va b.):** Shaxsiy avatarlar, ijtimoiy tarmoq havolalari (Instagram, YouTube, Telegram), donat summasini tanlash va izoh qoldirish.
- **Ijodkorlar Marketi (`/market`):** Blogerlar va mualliflarning rasmiy merchi va mahsulotlari savdosi.
- **Zamonaviy Motion UI:**
  - Alohida ajratilgan va silliq mikro-animatsiyali `Kirish ➔` tugmasi.
  - Noqulaylik tug'dirmaydigan mayin `Muallif bo'lish` kapsulasi.
  - Taktil hover va press animatsiyali muallif kartalari.
- **100% O'zbekcha Mahalliylashtirish:** Qonunchilik va foydalanuvchi qoidalariga mos toza o'zbek tili.

---

## 🛠 Texnologiyalar

- **Backend:** Node.js & Express.js
- **Frontend:** HTML5, Modern CSS3, Vanilla JavaScript, Vuetify UI & Material Design Icons
- **Assets:** SVG piktogrammalar va optimallashtirilgan media fayllar

---

## 💻 Loyihani Mahalliy Ishga Tushirish

Loyihani o'z kompyuteringizda ishga tushirish uchun quyidagi qadamlarni bajaring:

```bash
# 1. Repozitoriyani klonlash
git clone https://github.com/yusufbek20091106-gif/donat-uz.git
cd donat-uz

# 2. Bog'liqliklarni o'rnatish
npm install

# 3. Serverni ishga tushirish
node server.js
```

Brauzerda oching:
👉 **`http://localhost:3000/`**

---

## 📂 Loyiha Tuzilishi

```text
donat-uz/
├── public/                  # Barcha sahifalar va statik resurslar
│   ├── index.html           # Bosh sahifa
│   ├── authors.html         # Mualliflar katalogi
│   ├── market.html          # Merch do'koni
│   ├── creator.html         # Muallif bo'lish va shaxsiy sahifa ochish
│   ├── instruction.html     # Foydalanish yo'riqnomasi
│   ├── auth.html            # Tizimga kirish va ro'yxatdan o'tish
│   └── assets/              # Rasmlar, ikonlar, uslublar va skriptlar
├── server.js                # Express routing va statik server
├── package.json             # Loyiha konfiguratsiyasi
├── .gitignore               # Git istisnolari
└── README.md                # Loyiha hujjati
```

---

## 🤝 Qanday Hissa Qo'shish Mumkin (Contributing)?

1. Loyihani `Fork` qiling yoki to'g'ridan-to'g'ri yangi branch oching:
   ```bash
   git checkout -b feature/yangi-funksiya
   ```
2. O'zgarishlaringizni kiriting va commit qiling:
   ```bash
   git commit -m "feat: yangi dizayn va funksiyalar qo'shildi"
   ```
3. O'zgarishlarni branchga yuboring:
   ```bash
   git push origin feature/yangi-funksiya
   ```
4. `Pull Request` (PR) oching. Barcha takliflar ko'rib chiqiladi va loyihaga qo'shiladi!
