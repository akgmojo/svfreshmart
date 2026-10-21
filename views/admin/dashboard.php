<?php
if (!defined('APP_NAME')) exit;
$adminTitle = 'Store Performance Dashboard';
$adminSection = 'dashboard';
require_once BASE_DIR . '/views/admin/layout-header.php';

$orders = Database::getOrders();
$products = Database::getProducts(false);

$totalOrders = count($orders);
$totalRevenue = 0.0;
$todayOrders = 0;
$todayRevenue = 0.0;
$pendingOrders = 0;
$deliveredOrders = 0;
$todayDate = date('Y-m-d');

foreach ($orders as $o) {
    $totalRevenue += floatval($o['finalTotal'] ?? 0);
    if (substr($o['createdAt'] ?? '', 0, 10) === $todayDate) {
        $todayOrders++;
        $todayRevenue += floatval($o['finalTotal'] ?? 0);
    }
    $st = $o['orderStatus'] ?? '';
    if ($st === 'Confirmed' || $st === 'Processing' || $st === 'Pending Payment') {
        $pendingOrders++;
    } elseif ($st === 'Delivered') {
        $deliveredOrders++;
    }
}

$outOfStockCount = 0;
$lowStockCount = 0;
foreach ($products as $p) {
    foreach ($p['variations'] as $v) {
        if ($v['stock'] <= 0) $outOfStockCount++;
        elseif ($v['stock'] < 10) $lowStockCount++;
    }
}
?>

<!-- Metric KPI Cards -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <div class="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-sm">
        <div class="flex items-center justify-between text-gray-400 mb-2">
            <span class="text-xs font-semibold uppercase tracking-wider">Today's Sales</span>
            <i data-lucide="indian-rupee" class="w-4 h-4 text-emerald-400"></i>
        </div>
        <p class="text-2xl font-black text-white">₹<?= number_format($todayRevenue, 0) ?></p>
        <p class="text-[11px] text-gray-500 mt-1"><?= $todayOrders ?> orders placed today</p>
    </div>

    <div class="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-sm">
        <div class="flex items-center justify-between text-gray-400 mb-2">
            <span class="text-xs font-semibold uppercase tracking-wider">Pending Orders</span>
            <i data-lucide="clock" class="w-4 h-4 text-amber-400"></i>
        </div>
        <p class="text-2xl font-black text-amber-400"><?= $pendingOrders ?></p>
        <p class="text-[11px] text-gray-500 mt-1">Requires packing / dispatch</p>
    </div>

    <div class="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-sm">
        <div class="flex items-center justify-between text-gray-400 mb-2">
            <span class="text-xs font-semibold uppercase tracking-wider">Inventory Alerts</span>
            <i data-lucide="alert-triangle" class="w-4 h-4 text-red-400"></i>
        </div>
        <p class="text-2xl font-black text-red-400"><?= $outOfStockCount ?></p>
        <p class="text-[11px] text-gray-500 mt-1"><?= $lowStockCount ?> variations low in stock (<10)</p>
    </div>

    <div class="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-sm">
        <div class="flex items-center justify-between text-gray-400 mb-2">
            <span class="text-xs font-semibold uppercase tracking-wider">Total Delivered</span>
            <i data-lucide="check-circle" class="w-4 h-4 text-emerald-400"></i>
        </div>
        <p class="text-2xl font-black text-white"><?= $deliveredOrders ?></p>
        <p class="text-[11px] text-gray-500 mt-1">Lifetime total: ₹<?= number_format($totalRevenue, 0) ?></p>
    </div>
</div>

<!-- Recent Orders Section -->
<div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm mb-8">
    <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-bold text-white flex items-center gap-2">
            <i data-lucide="shopping-bag" class="w-4 h-4 text-emerald-500"></i>
            <span>Recent Orders</span>
        </h3>
        <a href="/admin/orders" class="text-xs text-emerald-400 hover:underline">View All Orders &rarr;</a>
    </div>

    <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
            <thead>
                <tr class="text-gray-400 border-b border-gray-800 pb-2">
                    <th class="py-2.5 px-3">Order Number</th>
                    <th class="py-2.5 px-3">Customer</th>
                    <th class="py-2.5 px-3">Bangalore Area</th>
                    <th class="py-2.5 px-3">Items</th>
                    <th class="py-2.5 px-3">Total</th>
                    <th class="py-2.5 px-3">Status</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-800/60 text-gray-300">
                <?php if (empty($orders)): ?>
                    <tr><td colspan="6" class="text-center py-6 text-gray-500">No orders received yet.</td></tr>
                <?php else: ?>
                    <?php foreach (array_slice($orders, 0, 5) as $ord): ?>
                        <tr>
                            <td class="py-3 px-3 font-mono font-bold text-white">#<?= htmlspecialchars($ord['orderNumber']) ?></td>
                            <td class="py-3 px-3"><?= htmlspecialchars($ord['customerName'] ?? 'Customer') ?></td>
                            <td class="py-3 px-3"><?= htmlspecialchars($ord['deliveryAddress']['area'] ?? 'Bangalore') ?> (<?= htmlspecialchars($ord['deliveryAddress']['pincode']) ?>)</td>
                            <td class="py-3 px-3"><?= count($ord['items']) ?> items</td>
                            <td class="py-3 px-3 font-bold text-white">₹<?= $ord['finalTotal'] ?></td>
                            <td class="py-3 px-3">
                                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 border border-emerald-800 text-emerald-300">
                                    <?= htmlspecialchars($ord['orderStatus'] ?? 'Confirmed') ?>
                                </span>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<?php require_once BASE_DIR . '/views/admin/layout-footer.php'; ?>
