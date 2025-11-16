// checkout.js - Checkout page functionality
class CheckoutManager {
    constructor() {
        this.cartManager = cartManager;
        this.init();
    }

    init() {
        this.displayOrderSummary();
        this.setupEventListeners();
        this.updateOrderTotal();
    }

    displayOrderSummary() {
        const summaryItems = document.getElementById('summaryItems');
        const cart = this.cartManager.cart;

        if (cart.length === 0) {
            summaryItems.innerHTML = '<p class="text-muted">Your cart is empty</p>';
            this.updateOrderTotal();
            return;
        }

        summaryItems.innerHTML = cart.map(item => `
            <div class="summary-item" data-id="${item.id}" data-category="${item.category}">
                <div class="item-image">
                    <img src="${item.img}" alt="${item.title}">
                </div>
                <div class="item-details">
                    <h6>${item.title}</h6>
                    <p class="item-price">${item.price}</p>
                </div>
                <div class="item-quantity">
                    <span>Qty: ${item.quantity}</span>
                    <button class="btn-remove">Delete</button>
                </div>
            </div>
        `).join('');

        // Add delete button functionality
        summaryItems.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemDiv = e.target.closest('.summary-item');
                const id = parseInt(itemDiv.dataset.id);
                const category = itemDiv.dataset.category;

                // Remove from cart array
                this.cartManager.removeFromCart(id, category);

                // Remove from DOM
                itemDiv.remove();

                // Update totals
                this.updateOrderTotal();

                // Show toast
                this.cartManager.showToast('Item removed from cart', 'success');

                // Show empty message if cart is empty
                if (this.cartManager.cart.length === 0) {
                    summaryItems.innerHTML = '<p class="text-muted">Your cart is empty</p>';
                }
            });
        });
    }

    updateOrderTotal() {
        const subtotal = this.cartManager.getCartTotal();
        const shipping = subtotal > 0 ? 150.00 : 0;
        const total = subtotal + shipping;

        // Format currency (₱)
        const formatCurrency = (num) => num.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' });

        document.getElementById('subtotal').textContent = formatCurrency(subtotal);
        document.getElementById('shipping').textContent = formatCurrency(shipping);
        document.getElementById('total').textContent = formatCurrency(total);
    }

    setupEventListeners() {
        // Place order button
        const placeOrderBtn = document.getElementById('placeOrderBtn');
        if (placeOrderBtn) {
            placeOrderBtn.addEventListener('click', () => {
                if (this.validateForm()) {
                    const orderDetails = {
                        orderNumber: 'SNG-' + Date.now(),
                        date: new Date().toLocaleDateString(),
                        total: document.getElementById('total').textContent,
                        items: this.cartManager.cart
                    };
                    localStorage.setItem('lastOrder', JSON.stringify(orderDetails));

                    // Clear cart and redirect
                    this.cartManager.clearCart();
                    window.location.href = 'successfully.html';
                }
            });
        }
    }

    validateForm() {
        const requiredFields = document.querySelectorAll('input[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.style.borderColor = 'red';
            } else {
                field.style.borderColor = '';
            }
        });

        if (!isValid) {
            this.cartManager.showToast('Please fill in all required fields', 'error');
        }

        return isValid;
    }
}

// Initialize checkout when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('checkout.html')) {
        new CheckoutManager();
    }
});
    