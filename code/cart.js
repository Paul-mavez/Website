console.log("✅ cart.js loaded successfully!");

class CartManager {
    constructor() {
        this.cart = this.getCartFromStorage();
        this.init();
    }

    init() {
        this.updateCartCount();
        this.setupEventListeners();
    }

    getCartFromStorage() {
        const cart = localStorage.getItem('snuggleCart');
        return cart ? JSON.parse(cart) : [];
    }

    saveCartToStorage() {
        localStorage.setItem('snuggleCart', JSON.stringify(this.cart));
    }

   addToCart(product, quantity = 1, event = null, productImg = null) {
    const existingItem = this.cart.find(item => item.id === product.id && item.category === product.category);

    if (existingItem) existingItem.quantity += quantity;
    else this.cart.push({ ...product, quantity });

    this.saveCartToStorage();
    this.updateCartCount();

    // Flying animation
    if (event) this.showAddToCartAnimation(event, product.img, productImg);

    // Toast
    this.showToast(`${product.title} added to cart!`, 'success');
}

    removeFromCart(productId, category) {
        this.cart = this.cart.filter(item => !(item.id === productId && item.category === category));
        this.saveCartToStorage();
        this.updateCartCount();
    }

    updateQuantity(productId, category, quantity) {
        const item = this.cart.find(item => item.id === productId && item.category === category);
        if (item) {
            if (quantity <= 0) this.removeFromCart(productId, category);
            else item.quantity = quantity;
            this.saveCartToStorage();
        }
        this.updateCartCount();
    }

    getCartCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => {
            const price = parseFloat(item.price.replace('₱', '').replace(',', ''));
            return total + (price * item.quantity);
        }, 0);
    }

    updateCartCount() {
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = this.getCartCount();
        });
    }

 


        // Toast Notification
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#87cfeb8a' : '#ff000079'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10001;
            transform: translateX(400px);
            transition: transform 0.5s ease;
        `;

        document.body.appendChild(toast);
        setTimeout(() => toast.style.transform = 'translateX(0)', 50);
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => toast.parentNode?.removeChild(toast), 300);
        }, 3000);
    }

    setupEventListeners() {
        document.addEventListener('click', e => {
            if (e.target.classList.contains('add-to-cart')) {
                const productCard = e.target.closest('.product-card');
                const product = {
                    id: parseInt(productCard.dataset.id),
                    title: productCard.querySelector('.product-title').textContent,
                    price: productCard.querySelector('.product-price').textContent,
                    img: productCard.querySelector('img').src,
                    category: productCard.dataset.category
                };
                this.addToCart(product, 1, e);
            }
        });
    }

    clearCart() {
        this.cart = [];
        this.saveCartToStorage();
        this.updateCartCount();
    }
}

window.cartManager = new CartManager();
