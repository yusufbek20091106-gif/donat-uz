document.addEventListener('DOMContentLoaded', () => {
  try {
    const userStr = localStorage.getItem('donatuz_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const firstName = user.name ? user.name.split(' ')[0] : 'Kabinet';
      
      const kirishBtns = document.querySelectorAll('.btn-kirish-special, a[href="/auth"], a[href="/login"]');
      kirishBtns.forEach(btn => {
        if (btn.classList.contains('btn-kirish-special') || btn.textContent.includes('Kirish')) {
          btn.href = '/dashboard';
          btn.title = `${user.name} boshqaruv paneli`;
          btn.innerHTML = `<span>Kabinet (${firstName})</span> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
        }
      });
    }

    // Sync cart badge across all pages
    const cartStr = localStorage.getItem('donatuz_cart_items');
    if (cartStr) {
      const items = JSON.parse(cartStr);
      const count = (items || []).reduce((s, i) => s + (i.quantity || 1), 0);
      const cartBtn = document.querySelector('.cart-icon-btn');
      if (cartBtn && count > 0) {
        let b = cartBtn.querySelector('.cart-badge');
        if (!b) {
          b = document.createElement('span');
          b.className = 'cart-badge';
          b.style.cssText = 'position:absolute;top:-6px;right:-6px;background:#ef4444;color:#fff;font-size:11px;font-weight:800;min-width:20px;height:20px;line-height:20px;text-align:center;border-radius:999px;padding:0 4px;border:2px solid #fff;box-shadow:0 2px 6px rgba(239,68,68,0.4);';
          cartBtn.style.position = 'relative';
          cartBtn.appendChild(b);
        }
        b.innerText = count;
      }
    }
  } catch (e) {
    console.error('Auth state sync error:', e);
  }
});
