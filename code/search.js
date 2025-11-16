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
    // Wait until window.data is available (products.js loaded)
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
      this.searchResultsBody.innerHTML = '<p class="text-muted">No products found.</p>';
    } else {
      results.forEach(p => {
        let imgPath = p.img;
        if (!window.location.pathname.includes("/Pages/")) imgPath = imgPath.replace("../", "");

        const linkPath = `${window.location.pathname.includes("/Pages/") ? "" : "Pages/"}product-detail.html?id=${p.id}&category=${p.category}`;
        const item = document.createElement('div');
        item.className = 'search-result-item d-flex align-items-center mb-2';
        item.innerHTML = `
          <a href="${linkPath}" class="d-flex align-items-center text-decoration-none text-dark">
            <img src="${imgPath}" alt="${p.title}" class="me-2" style="width:50px; height:50px; object-fit:cover; border-radius:5px;">
            <div>
              <div>${p.title}</div>
              <small class="text-muted">${p.price}</small>
            </div>
          </a>
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
