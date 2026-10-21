<?php
if (!defined('APP_NAME')) exit;
$pageTitle = 'Your Shopping Basket | ' . APP_NAME;
require_once BASE_DIR . '/views/layout/header.php';
?>

<div class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
    <div class="flex items-center justify-between pb-6 border-b border-gray-200 mb-6">
        <div>
            <h1 class="text-2xl font-extrabold text-gray-900 tracking-tight">Shopping Basket</h1>
            <p class="text-xs text-gray-500 mt-0.5">Review your selected farm-fresh vegetables and items</p>
        </div>
        <a href="/shop" class="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>Add More Items</span>
        </a>
    </div>

    <div id="cartPageContainer" class="space-y-6">
        <!-- Rendered via JavaScript -->
    </div>
</div>

<script>
function renderCartPage() {
    const container = document.getElementById('cartPageContainer');
    if (!container) return;

    if (App.cart.length === 0) {
        container.innerHTML = `
            <div class="bg-white rounded-2xl p-12 text-center border border-gray-200">
                <i data-lucide="shopping-cart" class="w-16 h-16 mx-auto mb-3 text-gray-300"></i>
                <h3 class="text-lg font-bold text-gray-900">Your basket is empty</h3>
                <p class="text-xs text-gray-500 mt-1 max-w-sm mx-auto">Add crisp farm chillies, fresh greens, or daily staples to proceed.</p>
                <a href="/shop" class="mt-6 inline-block px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200">Explore Fresh Items</a>
            </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
    }

    const subtotal = App.getCartSubtotal();
    const threshold = App.freeDeliveryThreshold;
    const isFree = (subtotal >= threshold);

    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Items Table -->
            <div class="md:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100 shadow-sm">
                ${App.cart.map(item => `
                    <div class="p-4 flex items-center gap-4">
                        <img src="${item.imageUrl}" alt="${item.productName}" class="w-16 h-16 object-cover rounded-xl bg-gray-50 flex-shrink-0">
                        <div class="flex-1 min-w-0">
                            <h4 class="text-sm font-bold text-gray-900 truncate">${item.productName}</h4>
                            <p class="text-xs text-emerald-700 font-semibold">${item.label} • ₹${item.unitPrice}</p>
                            <p class="text-xs font-bold text-gray-900 mt-1">Total: ₹${(item.unitPrice * item.quantity).toFixed(0)}</p>
                        </div>
                        <div class="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-1">
                            <button onclick="App.updateCartQuantity('${item.variationId}', -1)" class="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white rounded font-bold">-</button>
                            <span class="text-xs font-bold w-6 text-center">${item.quantity}</span>
                            <button onclick="App.updateCartQuantity('${item.variationId}', 1)" class="w-7 h-7 flex items-center justify-center text-emerald-700 hover:bg-white rounded font-bold">+</button>
                        </div>
                        <button onclick="App.removeFromCart('${item.variationId}')" class="text-gray-300 hover:text-red-500 p-1.5">
                            <i data-lucide="trash-2" class="w-5 h-5"></i>
                        </button>
                    </div>
                `).join('')}
            </div>

            <!-- Order Summary Box -->
            <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm h-fit space-y-4">
                <h3 class="font-bold text-gray-900 text-sm pb-3 border-b border-gray-100">Order Summary</h3>
                <div class="flex justify-between text-xs text-gray-600">
                    <span>Items Subtotal:</span>
                    <span class="font-bold text-gray-900">₹${subtotal.toFixed(0)}</span>
                </div>
                <div class="flex justify-between text-xs text-gray-600">
                    <span>Bangalore Delivery:</span>
                    <span class="font-bold ${isFree ? 'text-emerald-700' : 'text-gray-900'}">${isFree ? 'FREE' : 'Calculated at checkout'}</span>
                </div>
                <div class="pt-3 border-t border-gray-100 flex justify-between text-base font-extrabold text-gray-900">
                    <span>Total Estimate:</span>
                    <span class="text-emerald-700">₹${subtotal.toFixed(0)}</span>
                </div>
                <a href="/checkout" class="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-200 transition-all text-center">
                    <span>Proceed to Delivery & Address</span>
                    <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </a>
            </div>
        </div>
    `;

    if (window.lucide) lucide.createIcons();
}

window.addEventListener('cartUpdated', renderCartPage);
document.addEventListener('DOMContentLoaded', renderCartPage);
</script>

<?php require_once BASE_DIR . '/views/layout/footer.php'; ?>
