/**
 * SV Fresh Mart - Core Frontend Application
 * Handles Cart state, variation selection, OTP login, and Bangalore delivery check
 */

const App = {
    cart: [],
    customer: null,
    pincode: '560035',
    freeDeliveryThreshold: 399,

    init() {
        this.loadCart();
        this.loadCustomer();
        this.loadPincode();
        this.bindEvents();
    },

    loadCart() {
        try {
            const saved = localStorage.getItem('svfreshmart_cart');
            this.cart = saved ? JSON.parse(saved) : [];
        } catch (e) {
            this.cart = [];
        }
        this.renderCartUI();
    },

    saveCart() {
        localStorage.setItem('svfreshmart_cart', JSON.stringify(this.cart));
        this.renderCartUI();
    },

    addToCart(productId, variationId, productName, label, unitPrice, mrp, imageUrl, variantSku, maxStock) {
        if (maxStock <= 0) {
            this.showToast('Item is currently Out of Stock', false);
            return;
        }

        const existing = this.cart.find(i => i.variationId === variationId);
        if (existing) {
            if (existing.quantity >= maxStock) {
                this.showToast(`Only ${maxStock} items available in stock`, false);
                return;
            }
            existing.quantity += 1;
        } else {
            this.cart.push({
                productId,
                variationId,
                variantSku: variantSku || '',
                productName,
                label,
                unitPrice: parseFloat(unitPrice),
                mrp: parseFloat(mrp || unitPrice),
                imageUrl: imageUrl || '',
                quantity: 1,
                maxStock: parseInt(maxStock)
            });
        }

        this.saveCart();
        this.showToast(`Added ${productName} (${label}) to basket!`, true);
        this.toggleCartDrawer(true);
    },

    updateCartQuantity(variationId, delta) {
        const item = this.cart.find(i => i.variationId === variationId);
        if (!item) return;

        item.quantity += delta;
        if (item.quantity <= 0) {
            this.cart = this.cart.filter(i => i.variationId !== variationId);
            this.showToast('Item removed from basket', false);
        } else if (item.maxStock && item.quantity > item.maxStock) {
            item.quantity = item.maxStock;
            this.showToast(`Maximum ${item.maxStock} available`, false);
        }

        this.saveCart();
    },

    removeFromCart(variationId) {
        this.cart = this.cart.filter(i => i.variationId !== variationId);
        this.saveCart();
        this.showToast('Item removed', false);
    },

    clearCart() {
        this.cart = [];
        this.saveCart();
    },

    getCartSubtotal() {
        return this.cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    },

    getCartCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    },

    renderCartUI() {
        const count = this.getCartCount();
        const subtotal = this.getCartSubtotal();

        // Update nav and drawer counts
        const navCount = document.getElementById('navCartCount');
        const mobileBadge = document.getElementById('mobileCartBadge');
        const drawerCount = document.getElementById('drawerCartCount');
        const drawerSubtotal = document.getElementById('drawerSubtotal');

        if (navCount) navCount.innerText = count;
        if (mobileBadge) mobileBadge.innerText = count;
        if (drawerCount) drawerCount.innerText = count;
        if (drawerSubtotal) drawerSubtotal.innerText = `₹${subtotal.toFixed(0)}`;

        // Update Free Delivery Progress Bar
        const statusText = document.getElementById('freeDeliveryStatusText');
        const percentText = document.getElementById('freeDeliveryPercent');
        const bar = document.getElementById('freeDeliveryBar');

        if (bar && statusText) {
            const pct = Math.min(100, Math.round((subtotal / this.freeDeliveryThreshold) * 100));
            bar.style.width = `${pct}%`;
            if (percentText) percentText.innerText = `${pct}%`;

            if (subtotal >= this.freeDeliveryThreshold) {
                statusText.innerHTML = '<span class="text-emerald-700 font-bold">🎉 Congratulations! You have unlocked FREE Delivery!</span>';
                bar.classList.replace('bg-emerald-600', 'bg-emerald-500');
            } else {
                const diff = (this.freeDeliveryThreshold - subtotal).toFixed(0);
                statusText.innerText = `Add ₹${diff} more for FREE Bangalore Delivery`;
                bar.classList.replace('bg-emerald-500', 'bg-emerald-600');
            }
        }

        // Render drawer items
        const container = document.getElementById('cartItemsContainer');
        if (container) {
            if (this.cart.length === 0) {
                container.innerHTML = `
                    <div class="py-12 text-center text-gray-400">
                        <i data-lucide="shopping-basket" class="w-16 h-16 mx-auto mb-3 text-gray-300"></i>
                        <p class="text-sm font-semibold text-gray-600">Your basket is empty</p>
                        <p class="text-xs text-gray-400 mt-1">Explore farm-fresh veggies and fruits</p>
                        <a href="/shop" onclick="toggleCartDrawer(false)" class="mt-4 inline-block px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-sm">Start Shopping</a>
                    </div>
                `;
            } else {
                container.innerHTML = this.cart.map(item => `
                    <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <img src="${item.imageUrl}" alt="${item.productName}" class="w-14 h-14 object-cover rounded-lg flex-shrink-0 bg-white">
                        <div class="flex-1 min-w-0">
                            <h4 class="text-xs font-bold text-gray-900 truncate">${item.productName}</h4>
                            <p class="text-[11px] text-emerald-700 font-semibold">${item.label} • ₹${item.unitPrice}</p>
                            <div class="flex items-center gap-2 mt-1">
                                <span class="text-xs font-bold text-gray-900">₹${(item.unitPrice * item.quantity).toFixed(0)}</span>
                                ${item.mrp > item.unitPrice ? `<span class="text-[10px] text-gray-400 line-through">₹${(item.mrp * item.quantity).toFixed(0)}</span>` : ''}
                            </div>
                        </div>
                        <div class="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm">
                            <button onclick="App.updateCartQuantity('${item.variationId}', -1)" class="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded text-sm font-bold">-</button>
                            <span class="text-xs font-bold w-5 text-center">${item.quantity}</span>
                            <button onclick="App.updateCartQuantity('${item.variationId}', 1)" class="w-6 h-6 flex items-center justify-center text-emerald-700 hover:bg-emerald-50 rounded text-sm font-bold">+</button>
                        </div>
                        <button onclick="App.removeFromCart('${item.variationId}')" class="text-gray-300 hover:text-red-500 p-1">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                `).join('');
            }
            if (window.lucide) lucide.createIcons();
        }

        // Trigger custom event for cart page/checkout sync
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart: this.cart, subtotal } }));
    },

    toggleCartDrawer(open) {
        const drawer = document.getElementById('cartDrawer');
        const content = document.getElementById('cartDrawerContent');
        if (!drawer || !content) return;

        if (open) {
            drawer.classList.remove('pointer-events-none', 'opacity-0');
            drawer.classList.add('opacity-100');
            content.classList.remove('translate-x-full');
            content.classList.add('translate-x-0');
            this.renderCartUI();
        } else {
            drawer.classList.add('opacity-0', 'pointer-events-none');
            drawer.classList.remove('opacity-100');
            content.classList.remove('translate-x-0');
            content.classList.add('translate-x-full');
        }
    },

    loadCustomer() {
        fetch('/api/auth.php?action=me')
            .then(res => res.json())
            .then(data => {
                if (data.authenticated && data.customer) {
                    this.customer = data.customer;
                }
            })
            .catch(() => {});
    },

    loadPincode() {
        const p = localStorage.getItem('svfreshmart_pincode') || '560035';
        this.pincode = p;
        const text = document.getElementById('navPincodeText');
        if (text) {
            text.innerHTML = `Deliver to: <strong class="text-gray-900">${p}</strong>`;
        }
    },

    setPincode(p) {
        this.pincode = p;
        localStorage.setItem('svfreshmart_pincode', p);
        this.loadPincode();
    },

    showToast(message, isSuccess = true) {
        const toast = document.getElementById('toastNotification');
        const toastMsg = document.getElementById('toastMessage');
        const toastIcon = document.getElementById('toastIcon');
        if (!toast || !toastMsg) return;

        toastMsg.innerText = message;
        if (toastIcon) {
            toastIcon.setAttribute('data-lucide', isSuccess ? 'check-circle' : 'alert-circle');
            toastIcon.className = `w-4 h-4 ${isSuccess ? 'text-emerald-400' : 'text-red-400'}`;
            if (window.lucide) lucide.createIcons();
        }

        toast.classList.remove('translate-y-24', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');

        setTimeout(() => {
            toast.classList.add('translate-y-24', 'opacity-0');
            toast.classList.remove('translate-y-0', 'opacity-100');
        }, 3000);
    },

    bindEvents() {
        // Expose global helpers
        window.toggleCartDrawer = (open) => this.toggleCartDrawer(open);
        window.openLoginModal = () => openLoginModal();
        window.closeLoginModal = () => closeLoginModal();
        window.openPincodeModal = () => openPincodeModal();
        window.closePincodeModal = () => closePincodeModal();
    }
};

// Variation Selector Handler for Product Cards & Single Product Page
window.selectVariation = function(cardId, variationId, label, price, mrp, stock, sku) {
    const card = document.getElementById(cardId);
    if (!card) return;

    // Update active pill styling
    const pills = card.querySelectorAll('.var-pill');
    pills.forEach(p => {
        p.classList.remove('bg-emerald-600', 'text-white', 'border-emerald-600');
        p.classList.add('bg-white', 'text-gray-700', 'border-gray-300');
    });

    const activePill = card.querySelector(`[data-var-id="${variationId}"]`);
    if (activePill) {
        activePill.classList.remove('bg-white', 'text-gray-700', 'border-gray-300');
        activePill.classList.add('bg-emerald-600', 'text-white', 'border-emerald-600');
    }

    // Update Price & MRP
    const priceEl = card.querySelector('.prod-price');
    const mrpEl = card.querySelector('.prod-mrp');
    const discountEl = card.querySelector('.prod-discount');
    const stockEl = card.querySelector('.prod-stock');
    const addBtn = card.querySelector('.prod-add-btn');

    if (priceEl) priceEl.innerText = `₹${price}`;
    if (mrpEl) {
        if (mrp > price) {
            mrpEl.innerText = `₹${mrp}`;
            mrpEl.style.display = 'inline';
            if (discountEl) {
                const discPct = Math.round(((mrp - price) / mrp) * 100);
                discountEl.innerText = `${discPct}% OFF`;
                discountEl.style.display = 'inline-block';
            }
        } else {
            mrpEl.style.display = 'none';
            if (discountEl) discountEl.style.display = 'none';
        }
    }

    // Update Stock Status
    if (stockEl) {
        if (stock <= 0) {
            stockEl.innerHTML = '<span class="text-red-500 font-semibold">Out of Stock</span>';
        } else if (stock < 10) {
            stockEl.innerHTML = `<span class="text-amber-600 font-semibold">Only ${stock} left!</span>`;
        } else {
            stockEl.innerHTML = '<span class="text-emerald-700 font-semibold">In Stock</span>';
        }
    }

    // Update Add to Cart Button dataset
    if (addBtn) {
        addBtn.setAttribute('data-var-id', variationId);
        addBtn.setAttribute('data-var-label', label);
        addBtn.setAttribute('data-var-price', price);
        addBtn.setAttribute('data-var-mrp', mrp);
        addBtn.setAttribute('data-var-stock', stock);
        addBtn.setAttribute('data-var-sku', sku);

        if (stock <= 0) {
            addBtn.disabled = true;
            addBtn.classList.replace('bg-emerald-600', 'bg-gray-300');
            addBtn.classList.replace('hover:bg-emerald-700', 'cursor-not-allowed');
            addBtn.innerText = 'Out of Stock';
        } else {
            addBtn.disabled = false;
            addBtn.classList.replace('bg-gray-300', 'bg-emerald-600');
            addBtn.classList.replace('cursor-not-allowed', 'hover:bg-emerald-700');
            addBtn.innerText = 'Add to Cart';
        }
    }
};

// OTP Login Modal Logic
let otpTimerInterval = null;

function openLoginModal() {
    const modal = document.getElementById('loginModal');
    const box = document.getElementById('loginModalBox');
    if (!modal) return;
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.classList.add('opacity-100');
    box.classList.remove('scale-95');
    box.classList.add('scale-100');
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    const box = document.getElementById('loginModalBox');
    if (!modal) return;
    modal.classList.add('opacity-0', 'pointer-events-none');
    modal.classList.remove('opacity-100');
    box.classList.add('scale-95');
    box.classList.remove('scale-100');
}

function handleSendOtp() {
    const input = document.getElementById('loginPhoneInput');
    const btn = document.getElementById('sendOtpBtn');
    const phone = input.value.trim();

    if (!phone || phone.length !== 10) {
        App.showToast('Please enter a valid 10-digit mobile number', false);
        return;
    }

    btn.disabled = true;
    btn.innerText = 'Sending OTP...';

    fetch('/api/auth.php?action=send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
    })
    .then(res => res.json())
    .then(data => {
        btn.disabled = false;
        btn.innerText = 'Send OTP';

        if (data.success) {
            App.showToast(data.message, true);
            document.getElementById('otpStepPhone').classList.add('hidden');
            document.getElementById('otpStepVerify').classList.remove('hidden');
            startOtpCooldown(data.cooldown || 60);
        } else {
            App.showToast(data.message || 'Failed to send OTP', false);
        }
    })
    .catch(() => {
        btn.disabled = false;
        btn.innerText = 'Send OTP';
        App.showToast('Network error, please try again', false);
    });
}

function startOtpCooldown(seconds) {
    clearInterval(otpTimerInterval);
    let remaining = seconds;
    const timerEl = document.getElementById('otpTimer');
    const cooldownBox = document.getElementById('otpCooldownText');
    const resendBtn = document.getElementById('otpResendBtn');

    cooldownBox.classList.remove('hidden');
    resendBtn.classList.add('hidden');

    otpTimerInterval = setInterval(() => {
        remaining -= 1;
        if (timerEl) timerEl.innerText = remaining;
        if (remaining <= 0) {
            clearInterval(otpTimerInterval);
            cooldownBox.classList.add('hidden');
            resendBtn.classList.remove('hidden');
        }
    }, 1000);
}

function handleResendOtp() {
    handleSendOtp();
}

function resetLoginToPhone() {
    document.getElementById('otpStepVerify').classList.add('hidden');
    document.getElementById('otpStepPhone').classList.remove('hidden');
    clearInterval(otpTimerInterval);
}

function handleVerifyOtp() {
    const phoneInput = document.getElementById('loginPhoneInput');
    const otpInput = document.getElementById('loginOtpInput');
    const btn = document.getElementById('verifyOtpBtn');

    const phone = phoneInput.value.trim();
    const otp = otpInput.value.trim();

    if (!otp || otp.length < 4) {
        App.showToast('Please enter the 6-digit OTP', false);
        return;
    }

    btn.disabled = true;
    btn.innerText = 'Verifying...';

    fetch('/api/auth.php?action=verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
    })
    .then(res => res.json())
    .then(data => {
        btn.disabled = false;
        btn.innerText = 'Verify & Continue';

        if (data.success) {
            App.showToast('Login successful!', true);
            closeLoginModal();
            setTimeout(() => window.location.reload(), 500);
        } else {
            App.showToast(data.message || 'Invalid OTP', false);
        }
    })
    .catch(() => {
        btn.disabled = false;
        btn.innerText = 'Verify & Continue';
        App.showToast('Verification failed, try again', false);
    });
}

// Pincode Modal
function openPincodeModal() {
    const m = document.getElementById('pincodeModal');
    if (m) {
        m.classList.remove('opacity-0', 'pointer-events-none');
        m.classList.add('opacity-100');
    }
}

function closePincodeModal() {
    const m = document.getElementById('pincodeModal');
    if (m) {
        m.classList.add('opacity-0', 'pointer-events-none');
        m.classList.remove('opacity-100');
    }
}

function handleCheckPincode() {
    const input = document.getElementById('checkPincodeInput');
    const resultBox = document.getElementById('pincodeCheckResult');
    const pin = input.value.trim();

    if (pin.length !== 6) {
        resultBox.className = 'mt-2 text-xs text-red-600 font-semibold block';
        resultBox.innerText = 'Please enter a 6-digit PIN code';
        return;
    }

    resultBox.className = 'mt-2 text-xs text-gray-500 block';
    resultBox.innerText = 'Checking Bangalore availability...';

    fetch(`/api/delivery.php?pincode=${pin}&subtotal=${App.getCartSubtotal()}`)
        .then(res => res.json())
        .then(data => {
            if (data.serviceable) {
                resultBox.className = 'mt-2 text-xs text-emerald-700 font-bold block';
                resultBox.innerHTML = `✅ ${data.message} (${data.areaName})<br><span class="text-[11px] font-normal text-gray-600">Standard Delivery: ₹${data.deliveryFee} • Free over ₹${data.freeDeliveryThreshold}</span>`;
                App.setPincode(pin);
                setTimeout(closePincodeModal, 1500);
            } else {
                resultBox.className = 'mt-2 text-xs text-red-600 font-semibold block';
                resultBox.innerText = `❌ ${data.message}`;
            }
        })
        .catch(() => {
            resultBox.className = 'mt-2 text-xs text-red-600 block';
            resultBox.innerText = 'Unable to check availability at this moment';
        });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
