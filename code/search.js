// search.js
class SearchManager {
  constructor() {
    this.searchInput = document.getElementById('searchInput');
    this.searchIcon = document.getElementById('searchIcon');
    this.searchResultsSidebar = document.getElementById('searchResultsSidebar');
    this.searchResultsBody = document.getElementById('searchResultsBody');
    this.searchOverlay = document.getElementById('searchOverlay');
    this.closeSearchResults = document.getElementById('closeSearchResults');

    this.allProducts = [];

    // Dynamically set base URL
    this.BASE_URL = window.location.pathname.includes('index.html') || window.location.pathname === '/' 
      ? './'
      : '../';

    this.init();
  }

  init() {
    this.loadAllProducts();

    if (this.searchInput) {
      this.searchInput.addEventListener('input', this.handleSearch.bind(this));
      this.searchInput.addEventListener('focus', this.handleFocus.bind(this));
      this.searchInput.addEventListener('keypress', e => { if (e.key === 'Enter') this.performSearch(); });
    }

    if (this.searchIcon) this.searchIcon.addEventListener('click', this.toggleSearchSidebar.bind(this));
    if (this.closeSearchResults) this.closeSearchResults.addEventListener('click', this.hideSearchResults.bind(this));
    if (this.searchOverlay) this.searchOverlay.addEventListener('click', this.hideSearchResults.bind(this));

    document.addEventListener('keydown', e => { if (e.key === 'Escape') this.hideSearchResults(); });
    document.addEventListener('click', e => {
      if (!this.searchInput?.contains(e.target) &&
          !this.searchResultsSidebar.contains(e.target) &&
          !this.searchIcon.contains(e.target)) {
        this.hideSearchResults();
      }
    });
  }

  loadAllProducts() {
    this.allProducts = [
      ...(window.breastPumpProducts || []),
      ...(window.breastfeedingProducts || []),
      ...(window.babyProducts || []),
      ...(window.mamaProducts || []),
    ];

    if (this.allProducts.length === 0) {
      console.warn("⚠️ No global products found. Check if products.js loaded first.");
    }
  }

  handleFocus() { if (this.searchInput.value.trim().length > 0) this.performSearch(); }

  handleSearch(e) {
    const query = e.target.value.trim();
    if (query.length > 0) this.performSearch();
    else this.hideSearchResults();
  }

  toggleSearchSidebar() {
    const isActive = this.searchResultsSidebar.classList.contains('active');
    if (isActive) this.hideSearchResults();
    else { this.showSearchResults(); this.searchInput?.focus(); }
  }

  performSearch() {
    const query = this.searchInput?.value.trim().toLowerCase() || '';
    if (!query) { this.hideSearchResults(); return; }

    const results = this.allProducts.filter(p =>
      p.title.toLowerCase().includes(query) ||
      (p.category && p.category.toLowerCase().includes(query))
    );

    this.displaySearchResults(results, query);
    this.showSearchResults();
  }

  displaySearchResults(results, query) {
    if (results.length === 0) {
      this.searchResultsBody.innerHTML = `
        <div class="no-results">
          <i class="fas fa-search"></i>
          <h5>No products found</h5>
          <p>No results found for "<strong>${query}</strong>"</p>
          <p class="text-muted">Try another keyword</p>
        </div>
      `;
      return;
    }

    const resultsHTML = results.map(p => `
      <a href="${this.BASE_URL}Pages/product-detail.html?id=${p.id}&category=${p.category || 'pump'}" class="search-result-item">
        <img src="${this.BASE_URL}${p.img}" alt="${p.title}" class="search-result-img">
        <div class="search-result-info">
          <div class="search-result-title">${p.title}</div>
          <div class="search-result-price">${p.price}</div>
          <div class="search-result-category">${p.category || 'Uncategorized'}</div>
        </div>
        <i class="fas fa-chevron-right text-muted"></i>
      </a>
    `).join('');

    this.searchResultsBody.innerHTML = `
      <div class="mb-3">
        <p class="text-muted">Found ${results.length} product${results.length > 1 ? 's' : ''} for "<strong>${query}</strong>"</p>
      </div>
      ${resultsHTML}
    `;
  }

  showSearchResults() { this.searchResultsSidebar.classList.add('active'); this.searchOverlay.classList.add('active'); }
  hideSearchResults() { this.searchResultsSidebar.classList.remove('active'); this.searchOverlay.classList.remove('active'); }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => new SearchManager(), 100);
});
