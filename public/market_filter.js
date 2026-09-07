// DonatUZ Market — Real-time Search, Category, and Author Filter System
(function () {
  'use strict';

  // --- 1. CSS INJECTION ---
  const style = document.createElement('style');
  style.id = 'donatuz-market-filter-styles';
  style.innerHTML = `
    /* Author List Card Hover & Active States */
    .market-author {
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
      cursor: pointer !important;
      border: 1.5px solid transparent !important;
      user-select: none !important;
    }
    .market-author:hover {
      transform: translateX(4px) !important;
      border-color: #e2e8f0 !important;
      background: #f8fafc !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
    }
    .market-author.author-selected {
      border-color: #ffc000 !important;
      background: #fffdf5 !important;
      transform: translateX(6px) !important;
      box-shadow: 0 4px 16px rgba(255, 192, 0, 0.25) !important;
    }
    .market-author.author-selected .font-weight-bold {
      color: #0f172a !important;
    }

    /* "All Authors" Reset Pill */
    .btn-all-authors {
      width: 100%;
      background: #0f172a;
      color: #ffc000;
      border: none;
      border-radius: 12px;
      padding: 10px 14px;
      font-size: 13.5px;
      font-weight: 800;
      margin-bottom: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.15);
    }
    .btn-all-authors:hover {
      background: #1e293b;
      transform: translateY(-1px);
    }
    .btn-all-authors.active {
      background: linear-gradient(135deg, #ffc000 0%, #f59e0b 100%);
      color: #0f172a;
      box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35);
    }

    /* Counter Badge */
    .market-results-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 18px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      margin-bottom: 16px;
      font-size: 14px;
      font-weight: 700;
      color: #334155;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
    }
    .market-results-count {
      color: #0f172a;
      background: #fef08a;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 800;
    }

    /* Empty state */
    .market-empty-state {
      text-align: center;
      padding: 60px 20px;
      background: #ffffff;
      border-radius: 20px;
      border: 1.5px dashed #cbd5e1;
      grid-column: 1 / -1;
      width: 100%;
      margin: 20px 0;
    }
    .market-empty-icon {
      font-size: 48px;
      margin-bottom: 12px;
    }
    .market-empty-text {
      font-size: 17px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 6px;
    }
    .market-empty-sub {
      font-size: 14px;
      color: #64748b;
      margin-bottom: 18px;
    }
    .market-btn-reset {
      background: #ffc000;
      color: #0f172a;
      font-weight: 800;
      border: none;
      padding: 10px 22px;
      border-radius: 12px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    /* Product Hidden */
    .product-hidden {
      display: none !important;
    }
  `;
  document.head.appendChild(style);

  // Author to merch tags mapping for realistic browsing
  const authorMerchMap = {
    'tchk': ['hayot', 'futbolka', 'orzu', 'sevgi'],
    'troll.uz': ['hayot', 'sevgi', 'kepka', 'katakli'],
    'chumolilar': ['kepka', 'futbolka', 'ilhom'],
    'yakudza': ['orzu', 'katakli', 'ko\'ylak'],
    'kunduziy': ['hayot', 'ilhom', 'kepka'],
    'alixonov timur': ['ko\'ylak', 'polo', 'katakli'],
    'konsta': ['ilhom', 'sevgi', 'orzu', 'futbolka'],
    'shahzoda_abdusalom': ['sevgi', 'hayot'],
    'akbar yusupov': ['kepka', 'ko\'ylak'],
    'nmagap': ['katakli', 'hayot', 'orzu']
  };

  let currentSearch = '';
  let currentAuthor = null;
  let currentCategory = 'all';

  function getProductCards() {
    const cards = [];
    const elements = document.querySelectorAll('.v-col-sm-4.v-col-xxl-3.v-col-6');

    elements.forEach((wrapper, idx) => {
      const card = wrapper.querySelector('.v-card');
      if (!card) return;

      const titleEl = card.querySelector('.font-weight-medium');
      const categoryEl = card.querySelector('.text-caption');
      const priceEl = card.querySelector('.font-weight-bold');

      const title = titleEl ? titleEl.innerText.trim().toLowerCase() : '';
      const category = categoryEl ? categoryEl.innerText.trim().toLowerCase() : '';
      const price = priceEl ? parseInt(priceEl.innerText.replace(/[^\d]/g, ''), 10) || 0 : 0;

      cards.push({
        element: wrapper,
        title,
        category,
        price,
        index: idx
      });
    });

    return cards;
  }

  function applyFilter() {
    const products = getProductCards();
    if (products.length === 0) return;

    let visibleCount = 0;
    const query = currentSearch.toLowerCase().trim();

    products.forEach(p => {
      let matchesSearch = true;
      let matchesCategory = true;
      let matchesAuthor = true;

      // 1. Text Search Query
      if (query) {
        matchesSearch = p.title.includes(query) || 
                        p.category.includes(query) || 
                        p.price.toString().includes(query);
      }

      // 2. Category Filter
      if (currentCategory !== 'all') {
        if (currentCategory === 'futbolka') {
          matchesCategory = p.category.includes('futbolka');
        } else if (currentCategory === 'kepka') {
          matchesCategory = p.category.includes('kepka');
        } else if (currentCategory === 'polo') {
          matchesCategory = p.category.includes('polo') || p.title.includes('ko\'ylak');
        }
      }

      // 3. Author Filter
      if (currentAuthor) {
        const allowedKeywords = authorMerchMap[currentAuthor] || [];
        matchesAuthor = allowedKeywords.some(kw => p.title.includes(kw) || p.category.includes(kw));
      }

      if (matchesSearch && matchesCategory && matchesAuthor) {
        p.element.classList.remove('product-hidden');
        p.element.style.setProperty('display', '', 'important');
        visibleCount++;
      } else {
        p.element.classList.add('product-hidden');
        p.element.style.setProperty('display', 'none', 'important');
      }
    });

    // Update or create result counter banner
    updateBanner(visibleCount, products.length);
  }

  function updateBanner(visibleCount, totalCount) {
    let banner = document.getElementById('marketResultsBanner');
    const container = document.querySelector('.v-col-lg-9.v-col-12 .v-card.v-card--flat');
    if (!container) return;

    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'marketResultsBanner';
      banner.className = 'market-results-banner';
      container.parentNode.insertBefore(banner, container);
    }

    let authorText = currentAuthor ? ` | Ijodkor: <span style="color:#f59e0b;">${currentAuthor.toUpperCase()}</span>` : '';
    let categoryText = currentCategory !== 'all' ? ` | Kategoriya: <span>${currentCategory}</span>` : '';

    banner.innerHTML = `
      <div class="d-flex align-center gap-2">
        <span>🛒 Merch mahsulotlari${authorText}${categoryText}</span>
      </div>
      <div>
        <span class="market-results-count">${visibleCount} / ${totalCount} ta ko'rsatilmoqda</span>
      </div>
    `;

    // Handle empty state
    let emptyState = document.getElementById('marketEmptyState');
    const row = container.querySelector('.v-row--dense');

    if (visibleCount === 0) {
      if (!emptyState && row) {
        emptyState = document.createElement('div');
        emptyState.id = 'marketEmptyState';
        emptyState.className = 'market-empty-state';
        emptyState.innerHTML = `
          <div class="market-empty-icon">🔍</div>
          <div class="market-empty-text">Ushbu so'rov bo'yicha mahsulot topilmadi</div>
          <div class="market-empty-sub">Boshqa so'z bilan qidirib ko'ring yoki barcha mahsulotlarni oching.</div>
          <button type="button" class="market-btn-reset" id="btnResetFilter">Barcha mahsulotlarni ko'rish</button>
        `;
        row.appendChild(emptyState);

        emptyState.querySelector('#btnResetFilter').addEventListener('click', resetAllFilters);
      }
      if (emptyState) emptyState.style.display = 'block';
    } else {
      if (emptyState) emptyState.style.display = 'none';
    }
  }

  function resetAllFilters() {
    currentSearch = '';
    currentAuthor = null;
    currentCategory = 'all';

    const searchInput = document.querySelector('#input-9');
    if (searchInput) searchInput.value = '';

    document.querySelectorAll('.market-author').forEach(a => a.classList.remove('author-selected'));
    const allBtn = document.querySelector('.btn-all-authors');
    if (allBtn) allBtn.classList.add('active');

    applyFilter();
  }

  // --- 2. WIRE SEARCH INPUT ---
  function setupSearch() {
    const searchInput = document.querySelector('#input-9');
    if (!searchInput) return;

    searchInput.setAttribute('placeholder', "Mahsulot qidirish (futbolka, kepka, sevgi)...");

    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      applyFilter();
    });

    const searchBtn = searchInput.closest('.v-input').querySelector('button');
    if (searchBtn) {
      searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        applyFilter();
      });
    }
  }

  // --- 3. WIRE AUTHOR CARDS ON LEFT PANEL ---
  function setupAuthorsList() {
    const authorCards = document.querySelectorAll('.market-author');
    if (authorCards.length === 0) return;

    // Check if we already injected "All Authors" button
    const listParent = authorCards[0].closest('.v-item-group');
    if (!listParent || listParent.querySelector('.btn-all-authors')) return;

    const allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.className = 'btn-all-authors active';
    allBtn.innerHTML = `
      <span>🌟 Barcha mualliflar</span>
      <span style="font-size:12px; background:rgba(255,255,255,0.2); padding:2px 8px; border-radius:10px;">${authorCards.length}</span>
    `;

    allBtn.addEventListener('click', () => {
      authorCards.forEach(a => a.classList.remove('author-selected'));
      allBtn.classList.add('active');
      currentAuthor = null;
      applyFilter();
    });

    // Insert right before first author
    const firstAuthorWrapper = authorCards[0].closest('.pa-1');
    if (firstAuthorWrapper && firstAuthorWrapper.parentNode) {
      firstAuthorWrapper.parentNode.insertBefore(allBtn, firstAuthorWrapper);
    }

    authorCards.forEach(card => {
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        const nameEl = card.querySelector('.font-weight-bold');
        const authorName = nameEl ? nameEl.innerText.trim().toLowerCase() : '';

        authorCards.forEach(a => a.classList.remove('author-selected'));
        allBtn.classList.remove('active');

        if (currentAuthor === authorName) {
          // Deselect
          currentAuthor = null;
          allBtn.classList.add('active');
        } else {
          card.classList.add('author-selected');
          currentAuthor = authorName;
        }

        applyFilter();
      });
    });
  }

  // --- 4. WIRE CATEGORY SELECTION ---
  function setupCategoryDropdown() {
    const catInput = document.querySelector('#input-12');
    if (!catInput) return;

    const wrapper = catInput.closest('.v-field');
    if (!wrapper) return;

    // Make field clickable to cycle through categories
    const categories = [
      { id: 'all', title: 'Все (Barchasi)' },
      { id: 'futbolka', title: 'Futbolkalar' },
      { id: 'kepka', title: 'Kepkalar' },
      { id: 'polo', title: 'Polo & Ko\'ylaklar' }
    ];

    let currentIdx = 0;
    const textSpan = wrapper.querySelector('.v-select__selection') || wrapper.querySelector('.v-field__input');

    wrapper.style.cursor = 'pointer';
    wrapper.addEventListener('click', (e) => {
      e.preventDefault();
      currentIdx = (currentIdx + 1) % categories.length;
      const selected = categories[currentIdx];
      currentCategory = selected.id;

      if (textSpan) {
        textSpan.innerHTML = `<span class="pr-1" style="opacity: 0.6;">Kategoriya: </span> <b>${selected.title}</b>`;
      }
      applyFilter();
    });
  }

  // --- 5. INITIALIZATION ---
  function init() {
    setupSearch();
    setupAuthorsList();
    setupCategoryDropdown();
    applyFilter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-run shortly to catch any delayed render
  setTimeout(init, 300);
  setTimeout(init, 1000);
})();
