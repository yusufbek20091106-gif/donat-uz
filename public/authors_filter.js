// DonatUZ Authors Catalog — Real-time Search & Filter System
(function() {
  'use strict';

  const style = document.createElement('style');
  style.id = 'donatuz-authors-filter-styles';
  style.innerHTML = `
    .authors-filter-container {
      max-width: 900px;
      margin: 10px auto 25px auto;
      padding: 0 16px;
      font-family: 'Inter', sans-serif;
    }
    .authors-search-wrapper {
      position: relative;
      width: 100%;
      margin-bottom: 14px;
    }
    .authors-search-input {
      width: 100%;
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 14px;
      padding: 13px 20px 13px 46px;
      font-size: 15px;
      color: #0f172a;
      outline: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      box-sizing: border-box;
    }
    .authors-search-input:focus {
      border-color: #ffc000;
      box-shadow: 0 4px 16px rgba(255, 192, 0, 0.25);
    }
    .authors-search-icon {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
      pointer-events: none;
    }
    .authors-category-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }
    .category-chip {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid transparent;
      border-radius: 20px;
      padding: 6px 14px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      user-select: none;
    }
    .category-chip:hover {
      background: #e2e8f0;
      color: #0f172a;
      transform: translateY(-1px);
    }
    .category-chip.active {
      background: #0f172a;
      color: #ffc000;
      border-color: #0f172a;
      box-shadow: 0 3px 10px rgba(15, 23, 42, 0.25);
    }
    .authors-result-count {
      font-size: 13px;
      color: #64748b;
      margin-left: auto;
      font-weight: 600;
    }
    .author-hidden {
      display: none !important;
    }
    .authors-empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #64748b;
      font-size: 15px;
    }
    .authors-empty-state button {
      margin-top: 10px;
      background: #ffc000;
      color: #000;
      border: none;
      padding: 8px 18px;
      border-radius: 10px;
      font-weight: 700;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);

  // Author categories mapping
  const authorCategories = {
    'troll.uz': 'vines',
    'chumolilar': 'vines',
    'bezzbets': 'vines',
    'doppi twins': 'vines',
    'kunduziy': 'vines',
    'konsta': 'music',
    'yakudza': 'gaming',
    'alimoff': 'media',
    'bekipedia': 'education',
    'urikguli': 'media',
    'muhrim': 'media',
    'abdullajon': 'vines'
  };

  function init() {
    // Find authors list container
    const authorRows = document.querySelectorAll('main a[href*="trolluz"]');
    if (!authorRows || authorRows.length === 0) return;

    // Find insertion point right above the authors list
    const mainContainer = document.querySelector('main .v-container');
    if (!mainContainer) return;

    // Create Search and Filter component
    const filterDiv = document.createElement('div');
    filterDiv.className = 'authors-filter-container';
    filterDiv.innerHTML = `
      <div class="authors-search-wrapper">
        <svg class="authors-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" id="authorsSearchInput" class="authors-search-input" placeholder="Muallif yoki ijodkorni qidiring (masalan: TROLL.UZ, Konsta, Yakudza)..." />
      </div>
      <div class="authors-category-chips">
        <button type="button" class="category-chip active" data-cat="all">🌟 Barchasi</button>
        <button type="button" class="category-chip" data-cat="vines">🎭 Vaynerlar</button>
        <button type="button" class="category-chip" data-cat="music">🎵 Musiqa</button>
        <button type="button" class="category-chip" data-cat="media">🎙 Media & Podkast</button>
        <button type="button" class="category-chip" data-cat="gaming">🎮 Strim & O'yinlar</button>
        <span class="authors-result-count" id="authorsResultCount">Jami: ${authorRows.length} ta muallif</span>
      </div>
      <div id="authorsEmptyState" class="authors-empty-state" style="display:none;">
        <div style="font-size:32px; margin-bottom:8px;">🔍</div>
        <div>Ushbu so'rov bo'yicha hech qanday muallif topilmadi.</div>
        <button type="button" onclick="document.getElementById('authorsSearchInput').value=''; window.DonatUZAuthorsFilter.applyFilter();">Barcha mualliflarni ko'rish</button>
      </div>
    `;

    // Insert filter before the first author row parent
    const firstAuthor = authorRows[0].closest('.v-spacer');
    if (firstAuthor && firstAuthor.parentNode) {
      firstAuthor.parentNode.insertBefore(filterDiv, firstAuthor);
    }

    let activeCategory = 'all';

    function applyFilter() {
      const query = (document.getElementById('authorsSearchInput')?.value || '').toLowerCase().trim();
      let visibleCount = 0;

      authorRows.forEach(row => {
        const nameEl = row.querySelector('.font-weight-medium');
        const name = (nameEl ? nameEl.innerText : row.innerText).toLowerCase().trim();
        const parentWrapper = row.closest('.v-spacer');

        // Check query match
        const matchesQuery = !query || name.includes(query);

        // Check category match
        let matchesCat = true;
        if (activeCategory !== 'all') {
          const cat = Object.keys(authorCategories).find(k => name.includes(k));
          matchesCat = cat ? authorCategories[cat] === activeCategory : false;
        }

        if (matchesQuery && matchesCat) {
          if (parentWrapper) parentWrapper.classList.remove('author-hidden');
          visibleCount++;
        } else {
          if (parentWrapper) parentWrapper.classList.add('author-hidden');
        }
      });

      const countEl = document.getElementById('authorsResultCount');
      if (countEl) countEl.innerText = `${visibleCount} ta muallif`;

      const emptyState = document.getElementById('authorsEmptyState');
      if (emptyState) {
        emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    }

    // Bind search input
    const searchInput = document.getElementById('authorsSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', applyFilter);
    }

    // Bind category chips
    const chips = filterDiv.querySelectorAll('.category-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeCategory = chip.dataset.cat;
        applyFilter();
      });
    });

    window.DonatUZAuthorsFilter = { applyFilter };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
