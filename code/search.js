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
    // Wait until products.js has loaded window.data
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
      this.searchResultsBody.innerHTML = '<p class="text-muted text-center my-3">No products found.</p>';
    } else {
      const resultsContainer = document.createElement('div');
      resultsContainer.className = 'row g-2'; // grid for spacing

      results.forEach(p => {
        // Fix image paths for index.html vs Pages/*.html
        let imgPath = p.img;
        if (!window.location.pathname.includes("/Pages/")) imgPath = imgPath.replace("../", "");

        const linkPath = `${window.location.pathname.includes("/Pages/") ? "" : "Pages/"}product-detail.html?id=${p.id}&category=${p.category}`;

        const col = document.createElement('div');
        col.className = 'col-12';

        col.innerHTML = `
          <a href="${linkPath}" class="d-flex align-items-center text-decoration-none text-dark p-2 border rounded hover-shadow">
            <img src="${imgPath}" alt="${p.title}" class="me-3" style="width:60px; height:60px; object-fit:cover; border-radius:5px;">
            <div class="flex-grow-1">
              <div class="fw-semibold">${p.title}</div>
              <small class="text-muted">${p.price}</small>
            </div>
          </a>
        `;

        resultsContainer.appendChild(col);
      });

      this.searchResultsBody.appendChild(resultsContainer);
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
