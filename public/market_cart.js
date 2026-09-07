// DonatUZ Market — Shopping Cart & Checkout System
(function () {
  'use strict';

  // --- 1. CSS STYLING INJECTION ---
  const style = document.createElement('style');
  style.id = 'donatuz-market-cart-styles';
  style.innerHTML = `
    /* Cart Button in Header */
    .cart-icon-btn {
      position: relative !important;
      background: #f8fafc !important;
      border: 1.5px solid #e2e8f0 !important;
      border-radius: 12px !important;
      width: 44px !important;
      height: 44px !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
    }
    .cart-icon-btn:hover {
      background: #f1f5f9 !important;
      border-color: #cbd5e1 !important;
      transform: translateY(-2px) scale(1.05) !important;
    }
    .cart-badge {
      position: absolute;
      top: -6px;
      right: -6px;
      background: #ef4444;
      color: #ffffff;
      font-size: 11px;
      font-weight: 800;
      min-width: 20px;
      height: 20px;
      line-height: 20px;
      text-align: center;
      border-radius: 999px;
      padding: 0 4px;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
      animation: badgePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      z-index: 10;
    }
    @keyframes badgePop {
      0% { transform: scale(0); }
      70% { transform: scale(1.25); }
      100% { transform: scale(1); }
    }

    /* Product Card "Savatchaga qo'shish" Button */
    .btn-add-to-cart {
      width: 100%;
      margin-top: 12px;
      background: #f8fafc;
      color: #0f172a;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      padding: 10px 14px;
      font-size: 13.5px;
      font-weight: 800;
      letter-spacing: -0.2px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }
    .btn-add-to-cart:hover {
      background: linear-gradient(135deg, #ffc000 0%, #f59e0b 100%);
      border-color: transparent;
      color: #0f172a;
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(245, 158, 11, 0.35);
    }
    .btn-add-to-cart:active {
      transform: translateY(1px) scale(0.97);
    }
    .btn-add-to-cart.btn-added {
      background: #10b981 !important;
      border-color: #10b981 !important;
      color: #ffffff !important;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35) !important;
    }

    /* Backdrop Overlay */
    .cart-drawer-overlay, .checkout-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(6px);
      z-index: 99998;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }
    .cart-drawer-overlay.active, .checkout-modal-overlay.active {
      opacity: 1;
      visibility: visible;
    }

    /* Cart Drawer (Sliding Panel from Right) */
    .cart-drawer {
      position: fixed;
      top: 0;
      right: -460px;
      width: 100%;
      max-width: 440px;
      height: 100vh;
      background: #ffffff;
      box-shadow: -10px 0 35px rgba(0, 0, 0, 0.15);
      z-index: 99999;
      display: flex;
      flex-direction: column;
      transition: right 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
    }
    .cart-drawer.active {
      right: 0;
    }

    .cart-drawer-header {
      padding: 20px 24px;
      border-bottom: 1.5px solid #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #ffffff;
    }
    .cart-drawer-title {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .cart-drawer-close {
      background: #f1f5f9;
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #64748b;
      font-size: 18px;
      transition: all 0.2s;
    }
    .cart-drawer-close:hover {
      background: #e2e8f0;
      color: #0f172a;
      transform: rotate(90deg);
    }

    .cart-drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* Item Card inside Cart */
    .cart-item-card {
      display: flex;
      gap: 14px;
      padding: 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      align-items: center;
      transition: border-color 0.2s;
    }
    .cart-item-card:hover {
      border-color: #cbd5e1;
    }
    .cart-item-img {
      width: 68px;
      height: 68px;
      border-radius: 12px;
      object-fit: cover;
      background: #ffffff;
      border: 1px solid #e2e8f0;
    }
    .cart-item-info {
      flex: 1;
      min-width: 0;
    }
    .cart-item-title {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .cart-item-price {
      font-size: 14px;
      font-weight: 800;
      color: #f59e0b;
    }
    .cart-item-stepper {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
    }
    .cart-step-btn {
      width: 26px;
      height: 26px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #0f172a;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }
    .cart-step-btn:hover {
      background: #f1f5f9;
      border-color: #94a3b8;
    }
    .cart-step-val {
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
      min-width: 20px;
      text-align: center;
    }
    .cart-item-del {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 6px;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .cart-item-del:hover {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.08);
    }

    /* Empty Cart State */
    .cart-empty-view {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
      gap: 12px;
    }
    .cart-empty-icon {
      width: 72px;
      height: 72px;
      background: #f1f5f9;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      margin-bottom: 4px;
    }
    .cart-empty-title {
      font-size: 17px;
      font-weight: 800;
      color: #0f172a;
    }
    .cart-empty-subtitle {
      font-size: 13px;
      color: #64748b;
      max-width: 260px;
    }

    /* Cart Drawer Footer */
    .cart-drawer-footer {
      padding: 20px 24px;
      border-top: 1.5px solid #f1f5f9;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .cart-summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 13.5px;
      color: #64748b;
    }
    .cart-summary-total {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      border-top: 1px dashed #cbd5e1;
      padding-top: 10px;
    }
    .cart-total-amount {
      font-size: 22px;
      color: #f59e0b;
    }

    .btn-checkout-primary {
      width: 100%;
      background: linear-gradient(135deg, #ffc000 0%, #f59e0b 100%);
      color: #0f172a;
      font-weight: 800;
      font-size: 15px;
      padding: 14px 20px;
      border-radius: 14px;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      box-shadow: 0 6px 20px rgba(245, 158, 11, 0.38);
      transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .btn-checkout-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 26px rgba(245, 158, 11, 0.5);
    }

    /* Checkout Modal */
    .checkout-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.92);
      width: 92%;
      max-width: 520px;
      max-height: 90vh;
      overflow-y: auto;
      background: #ffffff;
      border-radius: 24px;
      padding: 28px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
      z-index: 99999;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
    }
    .checkout-modal.active {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
      visibility: visible;
    }
    .checkout-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .checkout-title {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
    }
    .form-field {
      margin-bottom: 14px;
    }
    .form-field label {
      display: block;
      font-size: 12.5px;
      font-weight: 700;
      color: #475569;
      margin-bottom: 6px;
    }
    .form-input {
      width: 100%;
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px 14px;
      font-size: 14px;
      color: #0f172a;
      outline: none;
      transition: border 0.2s;
      box-sizing: border-box;
    }
    .form-input:focus {
      border-color: #f59e0b;
      background: #ffffff;
    }

    .payment-options {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 6px;
    }
    .pay-btn-label {
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      padding: 10px 8px;
      text-align: center;
      cursor: pointer;
      font-size: 12.5px;
      font-weight: 700;
      color: #475569;
      background: #f8fafc;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .pay-btn-label input { display: none; }
    .pay-btn-label.selected {
      border-color: #f59e0b;
      background: #fffbeb;
      color: #b45309;
    }

    /* Notification Toast */
    .cart-toast {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: #0f172a;
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 14px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
      z-index: 100000;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      font-weight: 700;
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .cart-toast.active {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }

    /* Success Screen */
    .checkout-success-view {
      text-align: center;
      padding: 20px 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .success-icon-badge {
      width: 76px;
      height: 76px;
      background: rgba(16, 185, 129, 0.12);
      color: #10b981;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 38px;
    }
    .order-id-tag {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 6px 14px;
      border-radius: 8px;
      font-family: monospace;
      font-weight: 800;
      font-size: 16px;
      color: #0f172a;
      letter-spacing: 0.5px;
    }
  `;
  document.head.appendChild(style);

  // --- 2. CART STATE IN LOCALSTORAGE ---
  const CART_KEY = 'donatuz_cart_items';
  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateCartUI();
  }

  function addToCart(product) {
    const cart = getCart();
    const existing = cart.find(item => item.id === product.id || item.title === product.title);

    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      cart.push({
        id: product.id || 'p_' + Date.now(),
        title: product.title,
        price: product.price,
        img: product.img,
        quantity: 1
      });
    }

    saveCart(cart);
    showToast(`🛒 "${product.title}" savatchaga qo'shildi!`);
  }

  function updateQuantity(id, delta) {
    let cart = getCart();
    const item = cart.find(i => i.id === id);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter(i => i.id !== id);
    }
    saveCart(cart);
  }

  function removeItem(id) {
    let cart = getCart();
    cart = cart.filter(i => i.id !== id);
    saveCart(cart);
  }

  function clearCart() {
    saveCart([]);
  }

  // --- 3. DOM INJECTION FOR OVERLAYS & MODALS ---
  function initDOM() {
    // Backdrop Overlay for Drawer
    const drawerOverlay = document.createElement('div');
    drawerOverlay.id = 'cartDrawerOverlay';
    drawerOverlay.className = 'cart-drawer-overlay';
    drawerOverlay.onclick = closeCartDrawer;
    document.body.appendChild(drawerOverlay);

    // Cart Drawer
    const drawer = document.createElement('div');
    drawer.id = 'cartDrawer';
    drawer.className = 'cart-drawer';
    drawer.innerHTML = `
      <div class="cart-drawer-header">
        <div class="cart-drawer-title">
          <span>🛒 Savatcha</span>
          <span id="cartDrawerCount" style="font-size:13px; color:#64748b; font-weight:600;">(0 ta)</span>
        </div>
        <button class="cart-drawer-close" onclick="window.DonatUZCart.closeDrawer()">✕</button>
      </div>
      <div class="cart-drawer-body" id="cartItemsList">
        <!-- Rendered dynamically -->
      </div>
      <div class="cart-drawer-footer" id="cartFooter">
        <div class="cart-summary-row">
          <span>Mahsulotlar summasi:</span>
          <span id="cartSubtotal" style="font-weight:700; color:#0f172a;">0 so'm</span>
        </div>
        <div class="cart-summary-row">
          <span>Yetkazib berish (O'zbekiston bo'ylab):</span>
          <span style="font-weight:700; color:#10b981;">Bepul</span>
        </div>
        <div class="cart-summary-total">
          <span>Jami to'lov:</span>
          <span class="cart-total-amount" id="cartGrandTotal">0 so'm</span>
        </div>
        <button class="btn-checkout-primary" onclick="window.DonatUZCart.openCheckout()">
          <span>Buyurtma berish</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
        </button>
      </div>
    `;
    document.body.appendChild(drawer);

    // Checkout Modal Backdrop Overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'checkoutModalOverlay';
    modalOverlay.className = 'checkout-modal-overlay';
    modalOverlay.onclick = closeCheckoutModal;
    document.body.appendChild(modalOverlay);

    // Checkout Modal
    const modal = document.createElement('div');
    modal.id = 'checkoutModal';
    modal.className = 'checkout-modal';
    modal.innerHTML = `
      <div id="checkoutFormContent">
        <div class="checkout-modal-header">
          <div class="checkout-title">🛍 Buyurtmani rasmiylashtirish</div>
          <button class="cart-drawer-close" onclick="window.DonatUZCart.closeCheckout()">✕</button>
        </div>

        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px; padding:12px 16px; margin-bottom:16px; font-size:13px;">
          <div style="color:#64748b; margin-bottom:4px;">Buyurtma xulosasi:</div>
          <div style="display:flex; justify-content:space-between; font-weight:800; color:#0f172a;">
            <span id="modalOrderSummary">0 ta mahsulot</span>
            <span id="modalOrderTotal" style="color:#f59e0b; font-size:15px;">0 so'm</span>
          </div>
        </div>

        <form id="orderForm" onsubmit="window.DonatUZCart.submitOrder(event)">
          <div class="form-field">
            <label>Ism va familiyangiz *</label>
            <input type="text" id="orderFullName" class="form-input" placeholder="Masalan: Azizbek Rahimiy" required />
          </div>

          <div class="form-field">
            <label>Telefon raqamingiz *</label>
            <input type="tel" id="orderPhone" class="form-input" placeholder="+998 90 123 45 67" required />
          </div>

          <div class="form-field">
            <label>Yetkazib berish manzili (Shahar, tuman, ko'cha, uy) *</label>
            <textarea id="orderAddress" class="form-input" rows="2" placeholder="Masalan: Toshkent sh., Chilonzor tumani, 9-mavze, 14-uy, 25-xonadon" required style="resize:vertical;"></textarea>
          </div>

          <div class="form-field">
            <label>To'lov usulini tanlang *</label>
            <div class="payment-options">
              <label class="pay-btn-label selected" id="payLabelClick">
                <input type="radio" name="paymentType" value="Click" checked onchange="window.DonatUZCart.selectPay('Click')">
                <span>⚡ Click</span>
              </label>
              <label class="pay-btn-label" id="payLabelPayme">
                <input type="radio" name="paymentType" value="Payme" onchange="window.DonatUZCart.selectPay('Payme')">
                <span>💳 Payme</span>
              </label>
              <label class="pay-btn-label" id="payLabelCash">
                <input type="radio" name="paymentType" value="Naqd" onchange="window.DonatUZCart.selectPay('Naqd')">
                <span>💵 Naqd</span>
              </label>
            </div>
          </div>

          <div class="form-field">
            <label>Kuryer uchun izoh (ixtiyoriy)</label>
            <input type="text" id="orderNote" class="form-input" placeholder="Masalan: Kod domofon: 45K" />
          </div>

          <button type="submit" id="btnSubmitOrder" class="btn-checkout-primary" style="margin-top:14px;">
            <span>Buyurtmani tasdiqlash ✓</span>
          </button>
        </form>
      </div>

      <!-- Success Screen View -->
      <div id="checkoutSuccessContent" style="display:none;" class="checkout-success-view">
        <div class="success-icon-badge">✓</div>
        <div style="font-size:20px; font-weight:800; color:#0f172a;">Buyurtmangiz qabul qilindi!</div>
        <div class="order-id-tag" id="successOrderId">ORD-000000</div>
        <p style="font-size:13.5px; color:#64748b; max-width:380px; line-height:1.5;">
          Rahmat! Sizning buyurtmangiz backend tizimiga saqlandi va ijodkorga Telegram orqali xabar yuborildi. Operatorimiz tez orada siz bilan bog'lanadi.
        </p>
        <button class="btn-checkout-primary" style="width:auto; padding:10px 24px; margin-top:8px;" onclick="window.DonatUZCart.closeCheckout()">
          <span>Davom etish</span>
        </button>
      </div>
    `;
    document.body.appendChild(modal);

    // Toast element
    const toast = document.createElement('div');
    toast.id = 'cartToast';
    toast.className = 'cart-toast';
    document.body.appendChild(toast);
  }

  // --- 4. TOAST NOTIFICATION ---
  let toastTimer = null;
  function showToast(msg) {
    const toast = document.getElementById('cartToast');
    if (!toast) return;
    toast.innerText = msg;
    toast.classList.add('active');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('active');
    }, 2500);
  }

  // --- 5. UI UPDATERS ---
  function updateCartUI() {
    const cart = getCart();
    const totalCount = cart.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    // Update Header Badge
    let badge = document.getElementById('cartBadge');
    if (!badge) {
      const headerCartBtn = document.querySelector('.cart-icon-btn');
      if (headerCartBtn) {
        badge = document.createElement('span');
        badge.id = 'cartBadge';
        badge.className = 'cart-badge';
        headerCartBtn.appendChild(badge);
        headerCartBtn.href = 'javascript:void(0);';
        headerCartBtn.onclick = (e) => {
          e.preventDefault();
          openCartDrawer();
        };
      }
    }

    if (badge) {
      if (totalCount > 0) {
        badge.innerText = totalCount;
        badge.style.display = 'block';
      } else {
        badge.style.display = 'none';
      }
    }

    // Update Drawer
    const countSpan = document.getElementById('cartDrawerCount');
    if (countSpan) countSpan.innerText = `(${totalCount} ta)`;

    const itemsList = document.getElementById('cartItemsList');
    const footer = document.getElementById('cartFooter');

    if (!itemsList) return;

    if (cart.length === 0) {
      itemsList.innerHTML = `
        <div class="cart-empty-view">
          <div class="cart-empty-icon">🛍</div>
          <div class="cart-empty-title">Savatchangiz bo'sh</div>
          <div class="cart-empty-subtitle">Do'kondagi o'zingizga ma'qul mahsulotlarni tanlab, savatchaga qo'shishingiz mumkin.</div>
        </div>
      `;
      if (footer) footer.style.display = 'none';
    } else {
      if (footer) footer.style.display = 'flex';
      itemsList.innerHTML = cart.map(item => `
        <div class="cart-item-card">
          <img src="${item.img || 'https://tirikchilik.uz/assets/Cart-3924b81c.svg'}" class="cart-item-img" />
          <div class="cart-item-info">
            <div class="cart-item-title" title="${item.title}">${item.title}</div>
            <div class="cart-item-price">${Number(item.price).toLocaleString('uz-UZ')} so'm</div>
            <div class="cart-item-stepper">
              <button class="cart-step-btn" onclick="window.DonatUZCart.updateQuantity('${item.id}', -1)">−</button>
              <span class="cart-step-val">${item.quantity}</span>
              <button class="cart-step-btn" onclick="window.DonatUZCart.updateQuantity('${item.id}', 1)">+</button>
            </div>
          </div>
          <button class="cart-item-del" title="O'chirish" onclick="window.DonatUZCart.removeItem('${item.id}')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      `).join('');

      const subtotalEl = document.getElementById('cartSubtotal');
      const grandTotalEl = document.getElementById('cartGrandTotal');
      const formatted = Number(totalPrice).toLocaleString('uz-UZ') + ' so\'m';
      if (subtotalEl) subtotalEl.innerText = formatted;
      if (grandTotalEl) grandTotalEl.innerText = formatted;
    }

    // Update modal summary if open
    const summaryCount = document.getElementById('modalOrderSummary');
    const summaryTotal = document.getElementById('modalOrderTotal');
    if (summaryCount) summaryCount.innerText = `${totalCount} ta mahsulot`;
    if (summaryTotal) summaryTotal.innerText = Number(totalPrice).toLocaleString('uz-UZ') + ' so\'m';
  }

  // --- 6. DRAWER & MODAL CONTROLS ---
  function openCartDrawer() {
    updateCartUI();
    document.getElementById('cartDrawer').classList.add('active');
    document.getElementById('cartDrawerOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartDrawerOverlay');
    if (drawer) drawer.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function openCheckoutModal() {
    const cart = getCart();
    if (cart.length === 0) {
      showToast("Iltimos, avval mahsulot tanlang!");
      return;
    }
    closeCartDrawer();
    document.getElementById('checkoutFormContent').style.display = 'block';
    document.getElementById('checkoutSuccessContent').style.display = 'none';
    document.getElementById('checkoutModal').classList.add('active');
    document.getElementById('checkoutModalOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';

    // Autofill logged-in user if available
    try {
      const stored = localStorage.getItem('donatuz_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.name && !document.getElementById('orderFullName').value) {
          document.getElementById('orderFullName').value = u.name;
        }
        if (u.phone && !document.getElementById('orderPhone').value) {
          document.getElementById('orderPhone').value = u.phone;
        }
      }
    } catch {}
  }

  function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    const overlay = document.getElementById('checkoutModalOverlay');
    if (modal) modal.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  let selectedPayment = 'Click';
  function selectPayment(type) {
    selectedPayment = type;
    document.querySelectorAll('.pay-btn-label').forEach(el => el.classList.remove('selected'));
    const label = document.getElementById('payLabel' + type);
    if (label) label.classList.add('selected');
  }

  // --- 7. ORDER SUBMISSION TO BACKEND ---
  async function submitOrder(e) {
    e.preventDefault();
    const btn = document.getElementById('btnSubmitOrder');
    const fullName = document.getElementById('orderFullName').value.trim();
    const phone = document.getElementById('orderPhone').value.trim();
    const address = document.getElementById('orderAddress').value.trim();
    const note = document.getElementById('orderNote').value.trim();
    const cart = getCart();

    if (cart.length === 0) {
      alert("Savatchangiz bo'sh!");
      return;
    }

    const total = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    btn.disabled = true;
    btn.innerHTML = '<span>Yuborilmoqda...</span>';

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phone,
          address,
          note,
          paymentMethod: selectedPayment,
          items: cart,
          total
        })
      });

      const data = await response.json();

      if (data.success) {
        // Clear cart
        clearCart();

        // Show success screen
        document.getElementById('checkoutFormContent').style.display = 'none';
        document.getElementById('successOrderId').innerText = data.orderId || 'ORD-MUOFFAQIYATLI';
        document.getElementById('checkoutSuccessContent').style.display = 'flex';
      } else {
        alert('Xatolik: ' + (data.message || 'Buyurtma saqlanmadi'));
      }
    } catch (err) {
      console.error('Submit order error:', err);
      alert('Server bilan bog\'lanishda xatolik yuz berdi');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span>Buyurtmani tasdiqlash ✓</span>';
    }
  }

  // --- 8. ATTACH BUTTONS TO PRODUCT CARDS IN MARKET ---
  function decorateProductCards() {
    // Find product card containers
    const cards = document.querySelectorAll('.v-card');

    cards.forEach((card, idx) => {
      // Exclude author cards or wrapper cards
      if (card.classList.contains('market-author') || card.closest('.market-author')) return;

      const priceSpan = card.querySelector('.font-weight-bold');
      const uzsSpan = Array.from(card.querySelectorAll('span')).find(s => s.innerText && s.innerText.includes('UZS'));
      const titleSpan = card.querySelector('.font-weight-medium');
      const imgEl = card.querySelector('img');

      if (priceSpan && uzsSpan && titleSpan && !card.querySelector('.btn-add-to-cart')) {
        const rawPriceText = priceSpan.innerText.replace(/[^\d]/g, '');
        const price = parseInt(rawPriceText, 10) || 150000;
        const title = titleSpan.innerText.trim();
        const categorySpan = card.querySelector('.text-caption');
        const fullTitle = (categorySpan ? categorySpan.innerText.trim() + ' — ' : '') + title;
        const img = imgEl ? imgEl.src : '';

        const product = {
          id: 'prod_' + idx,
          title: fullTitle,
          price: price,
          img: img
        };

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-add-to-cart';
        btn.innerHTML = `<span>Savatchaga qo'shish 🛒</span>`;
        btn.onclick = (e) => {
          e.stopPropagation();
          addToCart(product);
          btn.classList.add('btn-added');
          btn.innerHTML = `<span>Qo'shildi ✓</span>`;
          setTimeout(() => {
            btn.classList.remove('btn-added');
            btn.innerHTML = `<span>Savatchaga qo'shish 🛒</span>`;
          }, 1400);
        };

        const container = card.querySelector('.v-container') || card;
        container.appendChild(btn);
      }
    });
  }

  // Public API
  window.DonatUZCart = {
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    openDrawer: openCartDrawer,
    closeDrawer: closeCartDrawer,
    openCheckout: openCheckoutModal,
    closeCheckout: closeCheckoutModal,
    selectPay: selectPayment,
    submitOrder
  };

  // Init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initDOM();
      decorateProductCards();
      updateCartUI();
    });
  } else {
    initDOM();
    decorateProductCards();
    updateCartUI();
  }

  // Re-check cards after short delay in case Vue boots or images finish
  setTimeout(decorateProductCards, 500);
  setTimeout(decorateProductCards, 1500);
})();
