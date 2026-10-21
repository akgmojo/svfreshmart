<?php
if (!defined('APP_NAME')) exit;
$currentCustomer = CustomerAuth::getCurrentCustomer();
$pageTitle = 'Secure Checkout | ' . APP_NAME;
require_once BASE_DIR . '/views/layout/header.php';
?>

<div class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
    <div class="pb-6 border-b border-gray-200 mb-6">
        <h1 class="text-2xl font-extrabold text-gray-900 tracking-tight">Checkout & Delivery</h1>
        <p class="text-xs text-gray-500 mt-0.5">Bangalore Local Express Delivery (2-4 hours)</p>
    </div>

    <!-- If customer not logged in, show login prompt -->
    <?php if (!$currentCustomer): ?>
        <div class="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-md mx-auto my-8 shadow-sm">
            <div class="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-700">
                <i data-lucide="smartphone" class="w-7 h-7"></i>
            </div>
            <h2 class="text-lg font-bold text-gray-900">Login to Complete Order</h2>
            <p class="text-xs text-gray-500 mt-1 mb-6">Enter your 10-digit mobile number to verify your Bangalore address and track delivery.</p>
            <button onclick="openLoginModal()" class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2">
                <i data-lucide="log-in" class="w-4 h-4"></i>
                <span>Login with Mobile OTP</span>
            </button>
            <p class="text-[11px] text-gray-400 mt-3">Demo mobile number: <strong>9876543210</strong> (OTP: 123456)</p>
        </div>
    <?php else: ?>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <!-- Left: Delivery Address & Payment Form -->
            <div class="md:col-span-2 space-y-6">
                
                <!-- Customer Details Badge -->
                <div class="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                            <i data-lucide="user" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <span class="text-xs text-emerald-800 font-bold block"><?= htmlspecialchars($currentCustomer['name'] ?? 'Bangalore Shopper') ?></span>
                            <span class="text-[11px] text-emerald-600">+91 <?= htmlspecialchars($currentCustomer['phone']) ?></span>
                        </div>
                    </div>
                    <span class="text-[10px] font-bold uppercase tracking-wider bg-emerald-200 text-emerald-800 px-2.5 py-1 rounded-full">
                        Verified
                    </span>
                </div>

                <!-- Delivery Address Form -->
                <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                    <h3 class="text-sm font-bold text-gray-900 flex items-center gap-2 pb-3 border-b border-gray-100">
                        <i data-lucide="map-pin" class="w-4 h-4 text-emerald-600"></i>
                        <span>Bangalore Delivery Address</span>
                    </h3>

                    <div>
                        <label class="block text-xs font-semibold text-gray-700 mb-1">House / Flat / Building / Street *</label>
                        <input type="text" id="chkStreet" placeholder="e.g. Flat 302, Green Glen Layout, Sarjapur Main Road" class="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs font-semibold text-gray-700 mb-1">Landmark (Optional)</label>
                            <input type="text" id="chkLandmark" placeholder="Near Wipro Corporate Office" class="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-gray-700 mb-1">PIN Code (Bangalore 560xxx) *</label>
                            <input type="text" id="chkPincode" maxlength="6" value="560035" onblur="recalculateDelivery()" class="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                        </div>
                    </div>

                    <div id="checkoutDeliveryBadge" class="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
                        <i data-lucide="check-circle" class="w-4 h-4 text-emerald-600 flex-shrink-0"></i>
                        <span id="checkoutDeliveryText">Checking delivery fee...</span>
                    </div>
                </div>

                <!-- Payment Method -->
                <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-3">
                    <h3 class="text-sm font-bold text-gray-900 flex items-center gap-2 pb-3 border-b border-gray-100">
                        <i data-lucide="credit-card" class="w-4 h-4 text-emerald-600"></i>
                        <span>Payment Method</span>
                    </h3>

                    <label class="flex items-center gap-3 p-3 rounded-xl border border-emerald-600 bg-emerald-50/50 cursor-pointer">
                        <input type="radio" name="payment_method" value="COD" checked class="text-emerald-600 focus:ring-emerald-500">
                        <div class="flex-1">
                            <span class="text-xs font-bold text-gray-900 block">Cash on Delivery / UPI upon Delivery</span>
                            <span class="text-[11px] text-gray-500">Pay via Cash, GPay, PhonePe, or Paytm after checking your vegetables</span>
                        </div>
                        <i data-lucide="shield-check" class="w-5 h-5 text-emerald-600"></i>
                    </label>
                </div>
            </div>

            <!-- Right: Order Summary & Place Order -->
            <div class="space-y-4">
                <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                    <h3 class="font-bold text-gray-900 text-sm pb-3 border-b border-gray-100">Order Summary</h3>
                    
                    <div id="checkoutItemsList" class="space-y-2 text-xs divide-y divide-gray-50 max-h-60 overflow-y-auto">
                        <!-- Injected via JavaScript -->
                    </div>

                    <div class="pt-3 border-t border-gray-100 space-y-2 text-xs">
                        <div class="flex justify-between text-gray-600">
                            <span>Subtotal:</span>
                            <span id="chkSubtotal" class="font-bold text-gray-900">₹0</span>
                        </div>
                        <div class="flex justify-between text-gray-600">
                            <span>Delivery Fee:</span>
                            <span id="chkDeliveryFee" class="font-bold text-emerald-700">₹0</span>
                        </div>
                        <div class="pt-2 border-t border-gray-100 flex justify-between text-base font-extrabold text-gray-900">
                            <span>Total Amount:</span>
                            <span id="chkFinalTotal" class="text-emerald-700">₹0</span>
                        </div>
                    </div>

                    <button 
                        type="button" 
                        id="placeOrderBtn" 
                        onclick="handlePlaceOrder()" 
                        class="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-200 transition-all active:scale-98">
                        <i data-lucide="check" class="w-4 h-4"></i>
                        <span>Confirm & Place Order</span>
                    </button>

                    <p class="text-[10px] text-center text-gray-400">
                        By placing your order, you agree to SV Fresh Mart's Bangalore delivery terms.
                    </p>
                </div>
            </div>
        </div>
    <?php endif; ?>
</div>

<script>
let currentDeliveryFee = 0;

function recalculateDelivery() {
    const pin = document.getElementById('chkPincode')?.value.trim() || '560035';
    const subtotal = App.getCartSubtotal();
    const badge = document.getElementById('checkoutDeliveryBadge');
    const text = document.getElementById('checkoutDeliveryText');
    const feeEl = document.getElementById('chkDeliveryFee');
    const totalEl = document.getElementById('chkFinalTotal');

    if (!pin || pin.length !== 6) {
        if (text) text.innerText = 'Please enter a valid 6-digit Bangalore PIN code';
        return;
    }

    fetch(`/api/delivery.php?pincode=${pin}&subtotal=${subtotal}`)
        .then(res => res.json())
        .then(data => {
            if (data.serviceable) {
                currentDeliveryFee = data.deliveryFee;
                if (badge) badge.className = 'p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2';
                if (text) text.innerHTML = `✅ ${data.message} (${data.areaName}) • Slot: ${data.estimatedHours || '2-4 hrs'}`;
                if (feeEl) feeEl.innerText = data.isFree ? 'FREE' : `₹${data.deliveryFee}`;
                if (totalEl) totalEl.innerText = `₹${(subtotal + currentDeliveryFee).toFixed(0)}`;
            } else {
                currentDeliveryFee = 0;
                if (badge) badge.className = 'p-3 bg-red-50 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2';
                if (text) text.innerText = `❌ ${data.message}`;
                if (feeEl) feeEl.innerText = 'N/A';
                if (totalEl) totalEl.innerText = `₹${subtotal.toFixed(0)}`;
            }
        });
}

function renderCheckoutItems() {
    const list = document.getElementById('checkoutItemsList');
    const subtotalEl = document.getElementById('chkSubtotal');
    if (!list) return;

    if (App.cart.length === 0) {
        list.innerHTML = '<p class="text-gray-400 text-center py-4">Your cart is empty.</p>';
        return;
    }

    const sub = App.getCartSubtotal();
    if (subtotalEl) subtotalEl.innerText = `₹${sub.toFixed(0)}`;

    list.innerHTML = App.cart.map(item => `
        <div class="py-2 flex justify-between items-center">
            <div class="min-w-0 pr-2">
                <p class="font-bold text-gray-900 truncate">${item.productName}</p>
                <p class="text-[10px] text-gray-500">${item.label} × ${item.quantity}</p>
            </div>
            <span class="font-bold text-gray-900 flex-shrink-0">₹${(item.unitPrice * item.quantity).toFixed(0)}</span>
        </div>
    `).join('');

    recalculateDelivery();
}

function handlePlaceOrder() {
    const street = document.getElementById('chkStreet')?.value.trim();
    const landmark = document.getElementById('chkLandmark')?.value.trim();
    const pincode = document.getElementById('chkPincode')?.value.trim();
    const btn = document.getElementById('placeOrderBtn');

    if (!street) {
        App.showToast('Please enter your delivery street address', false);
        return;
    }

    if (!pincode || pincode.length !== 6) {
        App.showToast('Please enter a valid 6-digit Bangalore PIN code', false);
        return;
    }

    if (App.cart.length === 0) {
        App.showToast('Your cart is empty', false);
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span>Verifying & Placing Order...</span>';

    fetch('/api/orders.php?action=create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            items: App.cart,
            address: {
                street,
                landmark,
                pincode
            },
            paymentMethod: 'COD'
        })
    })
    .then(res => res.json())
    .then(data => {
        btn.disabled = false;
        btn.innerHTML = '<span>Confirm & Place Order</span>';

        if (data.success && data.order) {
            App.clearCart();
            App.showToast('Order placed successfully!', true);
            window.location.href = `/account/orders/${data.order.id}`;
        } else {
            App.showToast(data.message || 'Failed to place order', false);
        }
    })
    .catch(() => {
        btn.disabled = false;
        btn.innerHTML = '<span>Confirm & Place Order</span>';
        App.showToast('Order processing failed. Please try again.', false);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderCheckoutItems();
});
</script>

<?php require_once BASE_DIR . '/views/layout/footer.php'; ?>
