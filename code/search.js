// search.js
class SearchManager {
  constructor() {
    this.searchInput = document.getElementById('searchInput');
    this.searchIcon = document.getElementById('searchIcon');
    this.searchResultsSidebar = document.getElementById('searchResultsSidebar');
    this.searchResultsBody = document.getElementById('searchResultsBody');
    this.searchOverlay = document.getElementById('searchOverlay');

    this.allProducts = [];

    this.waitForData().then(() => this.setupEvents());
  }

  async waitForData() {
    while (!window.data) {
      await new Promise(r => setTimeout(r, 50));
    }

    const products = window.data;
    this.allProducts = [
      ...(products.pump || []),
      ...(products.feeding || []),
      ...(products.baby || []),
      ...(products.mama || [])
    ];
  }

  setupEvents() {
    if (!this.searchInput) return;

    this.searchInput.addEventListener('input', () => this.performSearch());
    this.searchIcon.addEventListener('click', () => this.showSidebar());
    document.getElementById('closeSearchResults')?.addEventListener('click', () => this.hideSidebar());
    this.searchOverlay?.addEventListener('click', () => this.hideSidebar());
  }

  performSearch() {
    const query = this.searchInput.value.toLowerCase().trim();
    this.searchResultsBody.innerHTML = '';

    if (!query) {
      this.hideSidebar();
      return;
    }

    const results = this.allProducts.filter(p => p.title.toLowerCase().includes(query));

    if (results.length === 0) {
      this.searchResultsBody.innerHTML = `<div class="no-results">No products found.</div>`;
    } else {
      results.forEach(p => {
        let imgPath = p.img;
        if (!window.location.pathname.includes("/Pages/")) imgPath = imgPath.replace("../", "");

        const linkPath = `${window.location.pathname.includes("/Pages/") ? "" : "Pages/"}product-detail.html?id=${p.id}&category=${p.category}`;

        const item = document.createElement('a');
        item.href = linkPath;
        item.className = 'search-result-item';
        item.innerHTML = `
          <img src="${imgPath}" alt="${p.title}" class="search-result-img">
          <div>
            <div class="search-result-title">${p.title}</div>
            <div class="search-result-price">${p.price}</div>
            <div class="search-result-category">${p.category}</div>
          </div>
        `;

        this.searchResultsBody.appendChild(item);
      });
    }

    this.showSidebar();
  }

  showSidebar() {
    this.searchResultsSidebar?.classList.add('active');
    this.searchOverlay?.classList.add('active');
  }

  hideSidebar() {
    this.searchResultsSidebar?.classList.remove('active');
    this.searchOverlay?.classList.remove('active');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new SearchManager();
});
