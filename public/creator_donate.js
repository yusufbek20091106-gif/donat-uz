// DonatUZ — Creator Page Interactive Donation & Celebration System
(function () {
  'use strict';

  // --- 1. CSS INJECTION ---
  const style = document.createElement('style');
  style.id = 'donatuz-creator-donate-styles';
  style.innerHTML = `
    /* Payment Methods Grid */
    .donatuz-pay-grid {
      display: grid !important;
      grid-template-columns: repeat(3, 1fr) !important;
      gap: 12px !important;
      width: 100% !important;
      margin-top: 10px !important;
    }
    @media (max-width: 600px) {
      .donatuz-pay-grid {
        grid-template-columns: 1fr !important;
      }
    }

    .donatuz-pay-card {
      position: relative !important;
      background: #ffffff !important;
      border: 2px solid #e2e8f0 !important;
      border-radius: 16px !important;
      padding: 16px 14px !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
      min-height: 84px !important;
      user-select: none !important;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02) !important;
    }
    .donatuz-pay-card:hover {
      border-color: #cbd5e1 !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06) !important;
    }
    .donatuz-pay-card.active {
      border-color: #ffc000 !important;
      background: #fffdf5 !important;
      transform: translateY(-3px) scale(1.02) !important;
      box-shadow: 0 8px 24px rgba(255, 192, 0, 0.3) !important;
    }
    .donatuz-pay-card .check-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #ffc000;
      color: #0f172a;
      display: none;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 900;
      box-shadow: 0 2px 6px rgba(255, 192, 0, 0.5);
    }
    .donatuz-pay-card.active .check-badge {
      display: flex !important;
      animation: checkPop 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes checkPop {
      0% { transform: scale(0); }
      100% { transform: scale(1); }
    }

    .donatuz-pay-title {
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.2px;
      margin-top: 4px;
    }
    .donatuz-pay-sub {
      font-size: 11.5px;
      color: #64748b;
      margin-top: 2px;
      font-weight: 500;
    }

    /* Amount Preset Pills */
    .pill-amount-btn {
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
      border: 1.5px solid transparent !important;
      cursor: pointer !important;
    }
    .pill-amount-btn:hover {
      transform: translateY(-2px) scale(1.03) !important;
      background-color: #ffc000 !important;
      color: #000000 !important;
    }
    .pill-amount-btn.active {
      background: linear-gradient(135deg, #ffc000 0%, #f59e0b 100%) !important;
      color: #0f172a !important;
      border-color: #f59e0b !important;
      transform: translateY(-2px) scale(1.06) !important;
      box-shadow: 0 6px 18px rgba(245, 158, 11, 0.4) !important;
      font-weight: 900 !important;
    }

    /* Celebration Modal Overlay */
    .donatuz-celebrate-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(8px);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      padding: 16px;
      box-sizing: border-box;
    }
    .donatuz-celebrate-overlay.open {
      opacity: 1;
      pointer-events: auto;
    }

    .donatuz-celebrate-modal {
      background: #ffffff;
      border-radius: 28px;
      width: 100%;
      max-width: 480px;
      padding: 36px 32px 30px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
      text-align: center;
      position: relative;
      overflow: hidden;
      transform: scale(0.85) translateY(20px);
      transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-sizing: border-box;
    }
    .donatuz-celebrate-overlay.open .donatuz-celebrate-modal {
      transform: scale(1) translateY(0);
    }

    .celebrate-icon-glow {
      width: 76px;
      height: 76px;
      margin: 0 auto 16px;
      background: linear-gradient(135deg, #fef08a 0%, #ffc000 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 38px;
      box-shadow: 0 10px 25px rgba(255, 192, 0, 0.45);
      animation: popBadge 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes popBadge {
      0% { transform: scale(0) rotate(-45deg); }
      70% { transform: scale(1.2) rotate(10deg); }
      100% { transform: scale(1) rotate(0deg); }
    }

    .celebrate-title {
      font-size: 24px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.5px;
      margin-bottom: 6px;
      font-family: 'Montserrat', sans-serif;
    }
    .celebrate-amount-pill {
      display: inline-block;
      background: #0f172a;
      color: #ffc000;
      font-size: 26px;
      font-weight: 900;
      padding: 8px 24px;
      border-radius: 999px;
      margin: 12px 0 16px;
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.25);
      letter-spacing: 0.5px;
    }
    .celebrate-desc {
      font-size: 15px;
      color: #475569;
      line-height: 1.5;
      margin-bottom: 18px;
    }
    .celebrate-quote {
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 16px;
      padding: 14px 18px;
      font-size: 14px;
      color: #334155;
      font-style: italic;
      margin-bottom: 22px;
      position: relative;
    }
    .celebrate-status {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      border-radius: 999px;
      padding: 6px 14px;
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 24px;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
      animation: pulseDot 1.4s infinite;
    }
    @keyframes pulseDot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }

    .celebrate-btn-main {
      width: 100%;
      background: linear-gradient(135deg, #ffc000 0%, #f59e0b 100%);
      color: #0f172a;
      border: none;
      border-radius: 14px;
      padding: 14px;
      font-size: 15px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .celebrate-btn-main:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(245, 158, 11, 0.55);
    }
    .celebrate-btn-sub {
      margin-top: 10px;
      background: none;
      border: none;
      color: #64748b;
      font-size: 13.5px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: underline;
    }
    .celebrate-btn-sub:hover {
      color: #0f172a;
    }

    /* Confetti Canvas */
    #donatuz-confetti-canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 100000;
    }
  `;
  document.head.appendChild(style);

  // --- 2. AUDIO SYNTHESIS CHIME (Web Audio API) ---
  function playVictorySound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      // Pleasant harmonious chime notes: C5, E5, G5, C6
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);

        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.5);
      });
    } catch (e) {
      console.log('Audio chime not available:', e);
    }
  }

  // --- 3. CONFETTI BURST ANIMATION ---
  function launchConfetti() {
    let canvas = document.getElementById('donatuz-confetti-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'donatuz-confetti-canvas';
      document.body.appendChild(canvas);
    }
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#ffc000', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#ffffff'];
    const particles = [];

    for (let i = 0; i < 70; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height * 0.45,
        vx: (Math.random() - 0.5) * 16,
        vy: -Math.random() * 14 - 4,
        size: Math.random() * 8 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        gravity: 0.35,
        opacity: 1
      });
    }

    let frame = 0;
    function render() {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.rotSpeed;
        p.vx *= 0.98;

        if (frame > 40) {
          p.opacity -= 0.015;
        }

        if (p.opacity > 0 && p.y < canvas.height + 50) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      });

      if (alive && frame < 180) {
        requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    requestAnimationFrame(render);
  }

  // --- 4. CELEBRATION MODAL CREATION ---
  let modalEl = null;

  function createCelebrationModal() {
    if (modalEl) return modalEl;

    modalEl = document.createElement('div');
    modalEl.id = 'donatuzCelebrateModal';
    modalEl.className = 'donatuz-celebrate-overlay';
    modalEl.innerHTML = `
      <div class="donatuz-celebrate-modal">
        <div class="celebrate-icon-glow">🎁</div>
        <h3 class="celebrate-title">Donat qabul qilindi!</h3>
        <div class="celebrate-amount-pill" id="celebrateAmount">50 000 UZS</div>
        <p class="celebrate-desc">
          <strong id="celebrateDonor">Aziz obunachi</strong> tomonidan ijodkor 
          <strong style="color:#f59e0b;">TROLL.UZ</strong> ga muvaffaqiyatli yuborildi!
        </p>
        <div class="celebrate-quote" id="celebrateQuoteBox">
          "<span id="celebrateMessage">Ijodingizga ulkan omad!</span>"
        </div>
        <div class="celebrate-status">
          <span class="status-dot"></span>
          <span>OBS / Strim ekranida real vaqtda yangramoqda</span>
        </div>
        <button type="button" class="celebrate-btn-main" id="celebrateCloseBtn">Yana donat yuborish 🚀</button>
        <br>
        <button type="button" class="celebrate-btn-sub" onclick="window.location.href='/'">Bosh sahifaga qaytish</button>
      </div>
    `;

    document.body.appendChild(modalEl);

    // Close handler
    modalEl.querySelector('#celebrateCloseBtn').addEventListener('click', () => {
      modalEl.classList.remove('open');
    });

    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) modalEl.classList.remove('open');
    });

    return modalEl;
  }

  function showCelebration(amount, donor, message) {
    const modal = createCelebrationModal();
    const formattedAmount = (parseInt(amount, 10) || 25000).toLocaleString('ru-RU') + ' UZS';

    document.getElementById('celebrateAmount').innerText = formattedAmount;
    document.getElementById('celebrateDonor').innerText = donor || 'Aziz obunachi';
    document.getElementById('celebrateMessage').innerText = message || 'Ijodingizga omad!';

    modal.classList.add('open');
    playVictorySound();
    launchConfetti();
  }

  // --- 5. INITIALIZE PAGE ELEMENTS ---
  let selectedPayment = 'Click';

  function setupPaymentMethods() {
    // Look for payment container
    const payGroup = document.querySelector('.v-item-group .v-container');
    if (!payGroup) return;

    // Check if we already injected our modern payment grid
    if (document.querySelector('.donatuz-pay-grid')) return;

    // Replace the 3 empty cards with responsive high-end styled payment cards
    const container = payGroup.querySelector('.v-row') || payGroup;
    container.innerHTML = `
      <div class="donatuz-pay-grid">
        <!-- Click Card -->
        <div class="donatuz-pay-card active" data-payment="Click">
          <div class="check-badge">✓</div>
          <svg width="60" height="28" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="120" height="40" rx="8" fill="#0073ff"/>
            <text x="60" y="26" fill="#ffffff" font-family="'Inter', sans-serif" font-weight="900" font-size="20" text-anchor="middle" letter-spacing="1">CLICK</text>
          </svg>
          <div class="donatuz-pay-title">Click</div>
          <div class="donatuz-pay-sub">Uzcard • Humo</div>
        </div>

        <!-- Payme Card -->
        <div class="donatuz-pay-card" data-payment="Payme">
          <div class="check-badge">✓</div>
          <svg width="60" height="28" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="120" height="40" rx="8" fill="#00cccc"/>
            <text x="60" y="26" fill="#ffffff" font-family="'Inter', sans-serif" font-weight="900" font-size="20" text-anchor="middle" letter-spacing="1">payme</text>
          </svg>
          <div class="donatuz-pay-title">Payme</div>
          <div class="donatuz-pay-sub">Uzcard • Humo</div>
        </div>

        <!-- Uzum Card -->
        <div class="donatuz-pay-card" data-payment="Uzum Bank">
          <div class="check-badge">✓</div>
          <svg width="60" height="28" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="120" height="40" rx="8" fill="#7000ff"/>
            <text x="60" y="26" fill="#ffffff" font-family="'Inter', sans-serif" font-weight="900" font-size="18" text-anchor="middle" letter-spacing="0.5">UZUM</text>
          </svg>
          <div class="donatuz-pay-title">Uzum Bank</div>
          <div class="donatuz-pay-sub">Visa • Uzcard • Humo</div>
        </div>
      </div>
    `;

    // Add click listeners to cards
    const cards = container.querySelectorAll('.donatuz-pay-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedPayment = card.getAttribute('data-payment') || 'Click';
      });
    });
  }

  function setupAmountPills() {
    const amountInput = document.querySelector('input#input-21') || document.querySelector('.money-field input');
    const pills = document.querySelectorAll('.position-relative button');

    pills.forEach((pill, idx) => {
      pill.classList.add('pill-amount-btn');
      // Set default selected pill (e.g. 50 000 UZS)
      if (pill.textContent.includes('50 000') || pill.textContent.includes('50&nbsp;000')) {
        pill.classList.add('active');
        if (amountInput && !amountInput.value) {
          amountInput.value = '50 000 UZS';
        }
      }

      pill.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const digits = pill.textContent.replace(/[^0-9]/g, '');
        if (amountInput && digits) {
          amountInput.value = parseInt(digits, 10).toLocaleString('ru-RU') + ' UZS';
        }
      });
    });

    if (amountInput) {
      amountInput.addEventListener('input', () => {
        const cleanVal = amountInput.value.replace(/[^0-9]/g, '');
        let matched = false;
        pills.forEach(p => {
          const pillVal = p.textContent.replace(/[^0-9]/g, '');
          if (cleanVal === pillVal) {
            p.classList.add('active');
            matched = true;
          } else {
            p.classList.remove('active');
          }
        });
      });
    }
  }

  function setupFormSubmission() {
    const form = document.querySelector('form');
    if (!form) return;

    // Remove any previous listener by cloning or replacing
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    // Re-bind pills and inputs inside cloned form
    setupAmountPills();
    setupPaymentMethods();

    const amountInput = newForm.querySelector('input#input-21') || newForm.querySelector('.money-field input');
    const nameInput = newForm.querySelector('input#input-16');
    const msgInput = newForm.querySelector('textarea');
    const anonSwitch = newForm.querySelector('#switch-18');
    const submitBtn = newForm.querySelector('button[type="submit"]');

    newForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const rawAmount = amountInput ? amountInput.value.replace(/[^0-9]/g, '') : '50000';
      const amount = parseInt(rawAmount, 10) || 50000;
      const isAnon = anonSwitch && anonSwitch.checked;
      const name = isAnon ? 'Anonim' : (nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'Aziz obunachi');
      const msg = msgInput && msgInput.value.trim() ? msgInput.value.trim() : 'Ijodingizga baraka!';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
        submitBtn.innerText = "Yuborilmoqda...";
      }

      try {
        const response = await fetch('/api/donate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: name,
            amount: amount,
            message: msg,
            paymentMethod: selectedPayment,
            creator: 'trolluz'
          })
        });

        const data = await response.json();
        showCelebration(amount, name, msg);
      } catch (err) {
        console.error('Donation error:', err);
        showCelebration(amount, name, msg);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
          submitBtn.innerHTML = `
            <span style="font-size: 18px;">🎁</span>
            <span>Donat qilish (To'lash)</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          `;
        }
      }
    });
  }

  // --- 6. INIT ---
  function init() {
    setupPaymentMethods();
    setupAmountPills();
    setupFormSubmission();
    createCelebrationModal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-run after brief delay to catch any deferred rendering
  setTimeout(init, 300);
  setTimeout(init, 1000);
})();
