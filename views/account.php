<?php
if (!defined('APP_NAME')) exit;
$currentCustomer = CustomerAuth::getCurrentCustomer();

if (!$currentCustomer) {
    header('Location: /');
    exit;
}

$pageTitle = 'My Account & Orders | ' . APP_NAME;
require_once BASE_DIR . '/views/layout/header.php';

$orders = Database::getOrders($currentCustomer['id']);
?>

<div class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 mb-8">
        <div>
            <h1 class="text-2xl font-extrabold text-gray-900 tracking-tight">My Account</h1>
            <p class="text-xs text-gray-500 mt-0.5">Welcome back, <?= htmlspecialchars($currentCustomer['name'] ?? 'Shopper') ?> (+91 <?= htmlspecialchars($currentCustomer['phone']) ?>)</p>
        </div>
        <button onclick="handleLogout()" class="px-4 py-2 border border-gray-300 hover:border-red-300 hover:bg-red-50 text-gray-700 hover:text-red-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors self-start">
            <i data-lucide="log-out" class="w-4 h-4"></i>
            <span>Logout</span>
        </button>
    </div>

    <!-- Orders Section -->
    <div class="space-y-6">
        <h2 class="text-base font-bold text-gray-900 flex items-center gap-2">
            <i data-lucide="package" class="w-5 h-5 text-emerald-600"></i>
            <span>My Order History (<?= count($orders) ?>)</span>
        </h2>

        <?php if (empty($orders)): ?>
            <div class="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
                <i data-lucide="shopping-bag" class="w-12 h-12 mx-auto mb-3 text-gray-300"></i>
                <h3 class="text-sm font-bold text-gray-800">No orders placed yet</h3>
                <p class="text-xs text-gray-500 mt-1 max-w-xs mx-auto">Explore fresh vegetables and enjoy free same-day delivery across Bangalore.</p>
                <a href="/shop" class="mt-4 inline-block px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm">Start Shopping</a>
            </div>
        <?php else: ?>
            <div class="space-y-4">
                <?php foreach ($orders as $order): 
                    $status = $order['orderStatus'] ?? 'Confirmed';
                    $statusColor = ($status === 'Delivered') ? 'bg-emerald-100 text-emerald-800' : 
                                   (($status === 'Cancelled') ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800');
                ?>
                    <div class="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:border-emerald-300 transition-colors">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                            <div>
                                <span class="font-mono text-xs font-bold text-gray-900">#<?= htmlspecialchars($order['orderNumber']) ?></span>
                                <span class="text-xs text-gray-400 ml-2"><?= date('d M Y, h:i A', strtotime($order['createdAt'])) ?></span>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="text-xs px-2.5 py-0.5 rounded-full font-bold <?= $statusColor ?>">
                                    <?= htmlspecialchars($status) ?>
                                </span>
                                <a href="/account/orders/<?= urlencode($order['id']) ?>" class="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1">
                                    <span>View Details</span>
                                    <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
                                </a>
                            </div>
                        </div>

                        <!-- Items List Preview -->
                        <div class="py-3 divide-y divide-gray-50">
                            <?php foreach ($order['items'] as $item): ?>
                                <div class="py-1.5 flex justify-between items-center text-xs">
                                    <span class="text-gray-800">
                                        <?= htmlspecialchars($item['productName']) ?> 
                                        <span class="text-emerald-700 font-semibold">(<?= htmlspecialchars($item['label'] ?? '') ?>)</span> 
                                        <span class="text-gray-400">× <?= $item['quantity'] ?></span>
                                    </span>
                                    <span class="font-bold text-gray-900">₹<?= $item['subtotal'] ?></span>
                                </div>
                            <?php endforeach; ?>
                        </div>

                        <div class="pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                            <span class="text-gray-500">Payment: <strong><?= htmlspecialchars($order['paymentMethod'] ?? 'COD') ?></strong></span>
                            <span class="text-sm font-extrabold text-gray-900">Total: <span class="text-emerald-700">₹<?= $order['finalTotal'] ?></span></span>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>
</div>

<script>
function handleLogout() {
    fetch('/api/auth.php?action=logout')
        .then(() => {
            App.showToast('Logged out successfully', true);
            window.location.href = '/';
        });
}
</script>

<?php require_once BASE_DIR . '/views/layout/footer.php'; ?>
