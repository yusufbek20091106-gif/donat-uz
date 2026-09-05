const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PUBLIC_DIR = path.resolve(__dirname, 'public');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(PUBLIC_DIR));

// Aniq marshrutlar
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

app.post('/api/donate', (req, res) => {
  const { username, amount, message, paymentMethod } = req.body;
  const numAmount = parseInt(amount, 10) || 15000;
  const newDonation = {
    id: Date.now(),
    username: username || 'Anonim obunachi',
    amount: numAmount,
    message: message || "Ijodingizga ulkan omad!",
    system: paymentMethod || 'Click / Payme',
    date: new Date().toLocaleTimeString('uz-UZ')
  };
  io.emit('new_donation', newDonation);
  res.json({ success: true, donation: newDonation });
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 DonatUZ Server 0.0.0.0:${PORT} da to'liq va benuqson ishga tushdi`);
});
