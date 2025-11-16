// product-detail.js

class ProductDetailManager {
  constructor() {
    this.product = null;
    document.addEventListener("DOMContentLoaded", () => this.init());
  }

  async init() {
    const { id, category } = Object.fromEntries(new URLSearchParams(location.search));
    if (!id || !category) return this.showError("Product not found");

    try {
      const response = await fetch("../products.json");
      const data = await response.json();
      const list = data[category];
      if (!list) return this.showError("Category not found");

      this.product = list.find(p => p.id === parseInt(id));
      if (!this.product) return this.showError("Product not found");

      this.renderProduct();
      this.setupEvents();
      if (window.cartManager) window.cartManager.updateCartCount();
    } catch (err) {
      console.error(err);
      this.showError("Error loading product details");
    }
  }

  renderProduct() {
    const p = this.product;
    document.getElementById("productDetailContainer").innerHTML = `
      <div class="col-md-6 mb-4">
        <div class="product-image-container">
          <img src="${p.img}" alt="${p.title}" class="product-image img-fluid" />
        </div>
      </div>
      <div class="col-md-6">
        <h2 class="fw-bold mb-2">${p.title}</h2>
        <div class="text-warning mb-3">
          ${'<i class="fas fa-star"></i>'.repeat(4)}
          <i class="fas fa-star-half-alt"></i>
          <small class="text-muted ms-2">(128 reviews)</small>
        </div>
        <p class="fs-4 fw-semibold mb-3" style="color: black;">${p.price}</p>


        <div class="mb-3 text-muted"><i class="fas fa-shield-alt me-2"></i>2-Year Warranty</div>

        <div class="d-flex align-items-center  mb-4">
          <label class="me-3 fw-semibold">Quantity:</label>
          <div class="d-flex align-items-center border rounded px-2">
            <button class="quantity-btn" id="decreaseQty">−</button>
            <input type="number" id="quantity" value="1" min="1" readonly class="mx-2 " style="width: 60px; color: black; text-align: center; background: #fff; border: 1px solid #ccc; border-radius: 8px;">
            <button class="quantity-btn" id="increaseQty">+</button>
          </div>
        </div>

        <button class="btn btn-primary-custom w-100 mb-4" id="addToCartBtn">
          <i class="fas fa-cart-plus me-2"></i>Add to Cart
        </button>

        <h5 class="fw-bold mb-2">Highlights</h5>
        <ul class="list-unstyled">
          <li><i class="fas fa-check check me-2"></i>Premium materials</li>
          <li><i class="fas fa-check check me-2"></i>Easy to clean</li>
          <li><i class="fas fa-check check me-2"></i>Baby-safe design</li>
        </ul>
      </div>

      

      <div class="col-12 mt-5">
        <ul class="nav nav-tabs" id="productTabs">
          <li class="nav-item"><button class="nav-link active" data-tab="desc">Description</button></li>
          <li class="nav-item"><button class="nav-link" data-tab="specs">Specifications</button></li>
        </ul>

        <div class="border border-top-0 rounded-bottom p-4">
          <div id="tab-desc">
            <h4>Description</h4>
            <p>${p.title} is designed for ultimate comfort, safety, and convenience.</p>
          </div>
          <div id="tab-specs" class="d-none">
            <h4>Specifications</h4>
            <table class="table">
              <tr><td>Product</td><td>${p.title}</td></tr>
              <tr><td>Category</td><td>${p.category}</td></tr>
              <tr><td>Price</td><td>${p.price}</td></tr>
              <tr><td>Warranty</td><td>2 years</td></tr>
            </table>
          </div>
        </div>
      </div>
    `;

    this.setupTabs();
  }

  setupEvents() {
    document.addEventListener("click", (e) => {
      if (e.target.id === "decreaseQty") this.changeQty(-1);
      if (e.target.id === "increaseQty") this.changeQty(1);
      if (e.target.id === "addToCartBtn" || e.target.closest("#addToCartBtn")) this.addToCart(e);
    });
  }

  changeQty(amount) {
    const input = document.getElementById("quantity");
    let val = parseInt(input.value) + amount;
    if (val < 1) val = 1;
    input.value = val;
  }

addToCart(event) {
    if (!this.product) return;
    const qty = parseInt(document.getElementById("quantity").value);
    const item = { ...this.product, quantity: qty };

    const productImg = document.querySelector(".product-image-container img"); // explicitly select image

    if (window.cartManager) {
        window.cartManager.addToCart(item, qty, event, productImg); // pass image element
    } else {
        this.addToLocalStorageDirectly(item);
        this.showToast(`${this.product.title} added to cart!`, "success");
    }
}




// ✅ Direct localStorage fallback method
addToLocalStorageDirectly(item) {
  try {
    const cart = JSON.parse(localStorage.getItem('snuggleCart')) || [];
    const existingItemIndex = cart.findIndex(cartItem => 
      cartItem.id === item.id && cartItem.category === item.category
    );

    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += item.quantity;
    } else {
      cart.push(item);
    }

    localStorage.setItem('snuggleCart', JSON.stringify(cart));
    
    // Update cart count display
    const totalCount = cart.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(element => {
      element.textContent = totalCount;
    });
    
    console.log('✅ Item added to localStorage directly:', item);
  } catch (error) {
    console.error('❌ Error adding to localStorage:', error);
  }
}

  setupTabs() {
    document.querySelectorAll("[data-tab]").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-tab]").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        document.querySelectorAll("[id^='tab-']").forEach(tab => tab.classList.add("d-none"));
        document.getElementById(`tab-${btn.dataset.tab}`).classList.remove("d-none");
      });
    });
  }

  showError(msg) {
    document.getElementById("productDetailContainer").innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
        <h3>${msg}</h3>
        <p>Please go back and try again.</p>
        <button class="btn btn-primary" onclick="history.back()">Go Back</button>
      </div>
    `;
  }

  // ✅ Sky Blue Toast (same as cart.js)
  showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <i class="fas ${type === "success" ? "fa-check-circle" : "fa-info-circle"}"></i>
        <span>${message}</span>
      </div>
    `;

    toast.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: ${type === "success" ? "#87CEEB" : "#FF0000"};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10001;
      transform: translateX(400px);
      transition: transform 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transform = "translateX(0)";
    }, 100);

    setTimeout(() => {
      toast.style.transform = "translateX(400px)";
      setTimeout(() => {
        if (toast.parentNode) document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }
}

new ProductDetailManager();