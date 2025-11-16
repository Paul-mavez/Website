// search.js
class SearchManager {
  constructor() {
    this.searchInput = document.getElementById('searchInput');
    this.searchIcon = document.getElementById('searchIcon');
    this.searchResultsSidebar = document.getElementById('searchResultsSidebar');
    this.searchResultsBody = document.getElementById('searchResultsBody');
    this.searchOverlay = document.getElementById('searchOverlay');
    this.searchBox = document.querySelector('.search-box');

    this.allProducts = [];
    this.isMobile = window.innerWidth <= 768;

    this.waitForData().then(() => this.setupEvents());
    this.setupMobileEvents();
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
    this.searchIcon.addEventListener('click', (e) => {
      if (this.isMobile) {
        e.preventDefault();
        this.toggleMobileSearch();
      } else {
        this.showSidebar();
      }
    });
    
    document.getElementById('closeSearchResults')?.addEventListener('click', () => this.hideSidebar());
    this.searchOverlay?.addEventListener('click', () => this.hideSidebar());

    // Close search when pressing escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideSidebar();
        if (this.isMobile) {
          this.closeMobileSearch();
        }
      }
    });
  }

  setupMobileEvents() {
    if (!this.isMobile) return;

    // Create close button for mobile search
    const closeBtn = document.createElement('button');
    closeBtn.className = 'search-close-btn';
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    closeBtn.style.display = 'none';
    this.searchBox.appendChild(closeBtn);

    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeMobileSearch();
    });

    // Close search when clicking on a result (mobile)
    document.addEventListener('click', (e) => {
      if (e.target.closest('.search-result-item')) {
        this.closeMobileSearch();
      }
    });

    // Update mobile state on resize
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 768;
    });
  }

  toggleMobileSearch() {
    if (this.searchBox.classList.contains('mobile-expanded')) {
      this.closeMobileSearch();
    } else {
      this.openMobileSearch();
    }
  }

  openMobileSearch() {
    this.searchBox.classList.add('mobile-expanded');
    this.searchOverlay?.classList.add('active');
    
    // Show close button
    const closeBtn = this.searchBox.querySelector('.search-close-btn');
    if (closeBtn) closeBtn.style.display = 'block';
    
    // Focus on input
    setTimeout(() => {
      this.searchInput.focus();
    }, 100);
  }

  closeMobileSearch() {
    this.searchBox.classList.remove('mobile-expanded');
    this.searchOverlay?.classList.remove('active');
    this.hideSidebar();
    
    // Hide close button
    const closeBtn = this.searchBox.querySelector('.search-close-btn');
    if (closeBtn) closeBtn.style.display = 'none';
    
    // Blur input
    this.searchInput.blur();
  }

  performSearch() {
    const query = this.searchInput.value.toLowerCase().trim();
    this.searchResultsBody.innerHTML = '';

    if (!query) {
      this.hideSidebar();
      return;
    }

    const results = this.allProducts.filter(p => 
      p.title.toLowerCase().includes(query) ||
      (p.category && p.category.toLowerCase().includes(query)) ||
      (p.description && p.description.toLowerCase().includes(query))
    );

    if (results.length === 0) {
      this.searchResultsBody.innerHTML = `
        <div class="no-results">
          <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 10px; opacity: 0.5;"></i>
          <div>No products found for "${query}"</div>
          <div style="font-size: 0.9rem; margin-top: 5px; opacity: 0.7;">Try different keywords</div>
        </div>
      `;
    } else {
      results.forEach(p => {
        let imgPath = p.img;
        if (!window.location.pathname.includes("/Pages/")) {
          imgPath = imgPath.replace("../", "");
        }

        const linkPath = `${window.location.pathname.includes("/Pages/") ? "" : "Pages/"}product-detail.html?id=${p.id}&category=${p.category}`;

        const item = document.createElement('a');
        item.href = linkPath;
        item.className = 'search-result-item';
        item.innerHTML = `
          <img src="${imgPath}" alt="${p.title}" class="search-result-img" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTUiIGhlaWdodD0iNTUiIHZpZXdCb3g9IjAgMCA1NSA1NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjU1IiBoZWlnaHQ9IjU1IiByeD0iMTAiIGZpbGw9IiM4N0NFRUIiIGZpbGwtb3BhY2l0eT0iMC4xIi8+CjxwYXRoIGQ9Ik0zMi41IDI1LjVDMzIuNSAyNi44ODA3IDMxLjM4MDcgMjggMzAgMjhDMjguNjE5MyAyOCAyNy41IDI2Ljg4MDcgMjcuNSAyNS41QzI3LjUgMjQuMTE5MyAyOC42MTkzIDIzIDMwIDIzQzMxLjM4MDcgMjMgMzIuNSAyNC4xMTkzIDMyLjUgMjUuNVpNMzUgMzUuNUMzNSAzNi4zMjg0IDM0LjMyODQgMzcgMzMuNSAzN0gyMS41QzIwLjY3MTYgMzcgMjAgMzYuMzI4NCAyMCAzNS41VjI0LjVDMjAgMjMuNjcxNiAyMC42NzE2IDIzIDIxLjUgMjNIMzMuNUMzNC4zMjg0IDIzIDM1IDIzLjY3MTYgMzUgMjQuNVYzNS41Wk0zMy41IDIxSDIxLjVDMTkuNTY4NSAyMSAxOCAyMi41Njg1IDE4IDI0LjVWMzUuNUMxOCAzNy40MzE1IDE5LjU2ODUgMzkgMjEuNSAzOUgzMy41QzM1LjQzMTUgMzkgMzcgMzcuNDMxNSAzNyAzNS41VjI0LjVDMzcgMjIuNTY4NSAzNS40MzE1IDIxIDMzLjUgMjFaIiBmaWxsPSIjODdDRUVCIiBmaWxsLW9wYWNpdHk9IjAuMyIvPgo8L3N2Zz4K'">
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SearchManager();
});

// Handle page navigation and re-initialization
if (window.MutationObserver) {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput && !window.searchManagerInitialized) {
          window.searchManagerInitialized = true;
          new SearchManager();
        }
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}
