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
  } catch (e) {
    console.error('Auth state sync error:', e);
  }
});
