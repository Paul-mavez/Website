// Determine the correct path to products.json
function getProductsPath() {
  const currentPath = window.location.pathname;
  if (currentPath.includes('/Pages/')) {
    return '../products.json';
  } else {
    return 'products.json';
  }
}

// Then use it:
fetch(getProductsPath())
  .then(res => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  })
  .then(products => {
    // Your existing code here...
    window.data = products;
    window.breastPumpProducts = products.pump || [];
    window.breastfeedingProducts = products.feeding || [];
    window.babyProducts = products.baby || [];
    window.mamaProducts = products.mama || [];

    const pumpsContainer = document.getElementById('pumpsContainer');
    const feedingContainer = document.getElementById('feedingContainer');
    const babyContainer = document.getElementById('babyContainer');
    const mamaContainer = document.getElementById('mamaContainer');

    // Helper function to create product cards
    function createProductCard(p, category) {
      const card = document.createElement('div');
      card.className = 'col-6 col-md-3';

      // Fix image paths for index.html
      let imgSrc = p.img;
      if (!window.location.pathname.includes('/Pages/')) {
        // If we're on index.html, remove the ../ from image paths
        imgSrc = p.img.replace('../', '');
      }

      card.innerHTML = `
        <div class="card product-card" data-id="${p.id}" data-category="${category}">
          <div class="product-image">
            <a href="Pages/product-detail.html?id=${p.id}&category=${category}" style="display: block;">
              <img src="${imgSrc}" alt="${p.title}">
            </a>
            <button class="add-to-cart">
              <i class="fas fa-cart-plus"></i> Add to Cart
            </button>
          </div>
          <a href="Pages/product-detail.html?id=${p.id}&category=${category}" class="product-title">
            ${p.title}
          </a>
          <p class="product-price">${p.price}</p>
        </div>
      `;

      return card;
    }

    // Render products by category
    if (pumpsContainer) window.breastPumpProducts.forEach(p => pumpsContainer.appendChild(createProductCard(p, 'pump')));
    if (feedingContainer) window.breastfeedingProducts.forEach(p => feedingContainer.appendChild(createProductCard(p, 'feeding')));
    if (babyContainer) window.babyProducts.forEach(p => babyContainer.appendChild(createProductCard(p, 'baby')));
    if (mamaContainer) window.mamaProducts.forEach(p => mamaContainer.appendChild(createProductCard(p, 'mama')));
  })
  .catch(err => {
    console.error('Error loading products:', err);
    // Show user-friendly error message
    const containers = [
      document.getElementById('pumpsContainer'),
      document.getElementById('feedingContainer'), 
      document.getElementById('babyContainer'),
      document.getElementById('mamaContainer')
    ].filter(Boolean);
    
    containers.forEach(container => {
      container.innerHTML = '<div class="col-12 text-center text-muted"><p>Products failed to load. Please refresh the page.</p></div>';
    });
  });
