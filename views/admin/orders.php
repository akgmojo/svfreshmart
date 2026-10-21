<?php
if (!defined('APP_NAME')) exit;
$adminTitle = 'Order Fulfillment & Tracking';
$adminSection = 'orders';
require_once BASE_DIR . '/views/admin/layout-header.php';

$orders = Database::getOrders();
$allowedStatuses = ['Pending Payment', 'Confirmed', 'Processing', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'];
?>

<div class="space-y-6">
    <div class="flex items-center justify-between pb-4 border-b border-gray-800">
        <div>
            <h2 class="text-lg font-bold text-white">Customer Orders (<?= count($orders) ?>)</h2>
            <p class="text-xs text-gray-400 mt-0.5">Manage customer deliveries, address snapshots, and dispatch statuses</p>
        </div>
    </div>

    <div class="space-y-4">
        <?php if (empty($orders)): ?>
            <div class="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center text-gray-400 text-xs">
                No customer orders received yet.
            </div>
        <?php else: ?>
            <?php foreach ($orders as $o): ?>
                <div class="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-800/80">
                        <div>
                            <span class="font-mono text-sm font-bold text-white">#<?= htmlspecialchars($o['orderNumber']) ?></span>
                            <span class="text-xs text-gray-400 ml-2"><?= date('d M Y, h:i A', strtotime($o['createdAt'])) ?></span>
                            <span class="text-xs text-gray-500 block mt-0.5">Customer: <strong><?= htmlspecialchars($o['customerName'] ?? 'Shopper') ?></strong> (+91 <?= htmlspecialchars($o['customerPhone'] ?? '') ?>)</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="text-xs text-gray-400">Status:</span>
                            <select onchange="updateOrderStatus('<?= $o['id'] ?>', this.value)" class="bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1 text-xs font-bold text-emerald-400 focus:outline-none">
                                <?php foreach ($allowedStatuses as $st): ?>
                                    <option value="<?= $st ?>" <?= ($o['orderStatus'] === $st) ? 'selected' : '' ?>><?= $st ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                            <h4 class="font-bold text-gray-300 uppercase tracking-wider text-[10px] mb-2">Delivery Address Snapshot</h4>
                            <div class="text-gray-400 space-y-0.5 bg-gray-950/50 p-3 rounded-xl border border-gray-800/60">
                                <p class="text-white font-semibold"><?= htmlspecialchars($o['deliveryAddress']['name'] ?? $o['customerName']) ?></p>
                                <p><?= htmlspecialchars($o['deliveryAddress']['street']) ?></p>
                                <?php if (!empty($o['deliveryAddress']['landmark'])): ?>
                                    <p class="text-gray-500">Landmark: <?= htmlspecialchars($o['deliveryAddress']['landmark']) ?></p>
                                <?php endif; ?>
                                <p class="text-emerald-400 font-bold"><?= htmlspecialchars($o['deliveryAddress']['area'] ?? 'Bangalore') ?> - <?= htmlspecialchars($o['deliveryAddress']['pincode']) ?></p>
                            </div>
                        </div>

                        <div>
                            <h4 class="font-bold text-gray-300 uppercase tracking-wider text-[10px] mb-2">Order Items (<?= count($o['items']) ?>)</h4>
                            <div class="space-y-1.5 bg-gray-950/50 p-3 rounded-xl border border-gray-800/60 max-h-40 overflow-y-auto">
                                <?php foreach ($o['items'] as $it): ?>
                                    <div class="flex justify-between items-center text-[11px]">
                                        <span class="text-gray-300 truncate pr-2">
                                            <?= htmlspecialchars($it['productName']) ?> (<?= htmlspecialchars($it['label'] ?? '') ?>) × <?= $it['quantity'] ?>
                                        </span>
                                        <span class="font-bold text-white flex-shrink-0">₹<?= $it['subtotal'] ?></span>
                                    </div>
                                <?php endforeach; ?>
                                <div class="pt-2 border-t border-gray-800 flex justify-between font-bold text-white text-xs">
                                    <span>Total (incl. ₹<?= $o['deliveryFee'] ?> delivery):</span>
                                    <span class="text-emerald-400">₹<?= $o['finalTotal'] ?></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
</div>

<script>
function updateOrderStatus(orderId, status) {
    fetch('/api/admin-orders.php?action=update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Order status updated to ' + status);
        } else {
            alert('Failed to update status: ' + (data.message || 'Error'));
        }
    });
}
</script>

<?php require_once BASE_DIR . '/views/admin/layout-footer.php'; ?>
