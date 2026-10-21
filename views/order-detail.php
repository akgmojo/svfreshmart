<?php
if (!defined('APP_NAME')) exit;
$currentCustomer = CustomerAuth::getCurrentCustomer();

if (!$currentCustomer) {
    header('Location: /');
    exit;
}

$orderId = $routeParams['id'] ?? '';
$order = Database::getOrderById($orderId);

if (!$order) {
    http_response_code(404);
    $pageTitle = 'Order Not Found | ' . APP_NAME;
    require_once BASE_DIR . '/views/layout/header.php';
    echo '<div class="py-20 text-center"><h2 class="text-2xl font-bold text-gray-800">Order Not Found</h2><a href="/account" class="mt-4 inline-block px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold">Back to My Orders</a></div>';
    require_once BASE_DIR . '/views/layout/footer.php';
    exit;
}

// Strictly enforce IDOR protection: Customer A must NEVER see Customer B's order!
if ($order['customerId'] !== $currentCustomer['id']) {
    http_response_code(403);
    $pageTitle = 'Access Denied | ' . APP_NAME;
    require_once BASE_DIR . '/views/layout/header.php';
    echo '<div class="py-20 text-center"><h2 class="text-2xl font-bold text-red-600">Access Denied</h2><p class="text-xs text-gray-500 mt-2">You do not have authorization to access this order.</p><a href="/account" class="mt-4 inline-block px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold">Back to My Orders</a></div>';
    require_once BASE_DIR . '/views/layout/footer.php';
    exit;
}

$pageTitle = 'Order #' . $order['orderNumber'] . ' | ' . APP_NAME;
require_once BASE_DIR . '/views/layout/header.php';

$status = $order['orderStatus'] ?? 'Confirmed';
$allStatuses = ['Confirmed', 'Processing', 'Packed', 'Out for Delivery', 'Delivered'];
$currentIndex = array_search($status, $allStatuses);
if ($currentIndex === false) $currentIndex = 0;
?>

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-8">
    <div class="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <a href="/account" class="hover:text-emerald-700">My Orders</a>
        <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
        <span class="text-gray-900 font-bold">#<?= htmlspecialchars($order['orderNumber']) ?></span>
    </div>

    <!-- Order Header Card -->
    <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
                <span class="text-xs text-emerald-700 font-bold uppercase tracking-wider block">Order Placed Successfully</span>
                <h1 class="text-xl font-extrabold text-gray-900 mt-0.5">Order #<?= htmlspecialchars($order['orderNumber']) ?></h1>
                <p class="text-xs text-gray-400 mt-0.5">Placed on <?= date('d M Y, h:i A', strtotime($order['createdAt'])) ?></p>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 self-start sm:self-auto">
                <?= htmlspecialchars($status) ?>
            </span>
        </div>

        <!-- Order Tracking Timeline -->
        <div class="pt-6">
            <h4 class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Delivery Status Timeline</h4>
            <div class="grid grid-cols-5 gap-2 text-center">
                <?php foreach ($allStatuses as $sIdx => $st): 
                    $isPassed = ($sIdx <= $currentIndex);
                    $isCurrent = ($sIdx === $currentIndex);
                ?>
                    <div class="flex flex-col items-center">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 <?= $isPassed ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-400' ?>">
                            <?= $isPassed ? '✓' : ($sIdx + 1) ?>
                        </div>
                        <span class="text-[10px] font-semibold leading-tight <?= $isCurrent ? 'text-emerald-700 font-bold' : ($isPassed ? 'text-gray-800' : 'text-gray-400') ?>">
                            <?= $st ?>
                        </span>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>

    <!-- Items & Address Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <!-- Items List (2 cols) -->
        <div class="md:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
            <h3 class="text-sm font-bold text-gray-900 pb-3 border-b border-gray-100">Ordered Items</h3>
            <div class="divide-y divide-gray-100">
                <?php foreach ($order['items'] as $item): ?>
                    <div class="py-3 flex justify-between items-center text-xs">
                        <div>
                            <p class="font-bold text-gray-900"><?= htmlspecialchars($item['productName']) ?></p>
                            <p class="text-gray-500 text-[11px]"><?= htmlspecialchars($item['label']) ?> • SKU: <?= htmlspecialchars($item['variantSku']) ?> • Qty: <?= $item['quantity'] ?></p>
                        </div>
                        <span class="font-bold text-gray-900">₹<?= $item['subtotal'] ?></span>
                    </div>
                <?php endforeach; ?>
            </div>

            <!-- Price Breakdown -->
            <div class="pt-4 border-t border-gray-100 space-y-2 text-xs">
                <div class="flex justify-between text-gray-600">
                    <span>Items Subtotal:</span>
                    <span class="font-bold text-gray-900">₹<?= $order['subtotal'] ?></span>
                </div>
                <div class="flex justify-between text-gray-600">
                    <span>Bangalore Delivery Fee:</span>
                    <span class="font-bold text-emerald-700"><?= ($order['deliveryFee'] == 0) ? 'FREE' : '₹' . $order['deliveryFee'] ?></span>
                </div>
                <div class="pt-2 border-t border-gray-100 flex justify-between text-sm font-extrabold text-gray-900">
                    <span>Total Amount:</span>
                    <span class="text-emerald-700">₹<?= $order['finalTotal'] ?></span>
                </div>
            </div>
        </div>

        <!-- Delivery Snapshot (1 col) -->
        <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm h-fit space-y-4">
            <h3 class="text-sm font-bold text-gray-900 pb-3 border-b border-gray-100 flex items-center gap-2">
                <i data-lucide="map-pin" class="w-4 h-4 text-emerald-600"></i>
                <span>Delivery Address</span>
            </h3>

            <div class="text-xs text-gray-600 space-y-1">
                <p class="font-bold text-gray-900"><?= htmlspecialchars($order['deliveryAddress']['name'] ?? $order['customerName']) ?></p>
                <p>+91 <?= htmlspecialchars($order['deliveryAddress']['phone'] ?? $order['customerPhone']) ?></p>
                <p class="mt-2 text-gray-700 leading-relaxed"><?= htmlspecialchars($order['deliveryAddress']['street']) ?></p>
                <?php if (!empty($order['deliveryAddress']['landmark'])): ?>
                    <p class="text-gray-500">Landmark: <?= htmlspecialchars($order['deliveryAddress']['landmark']) ?></p>
                <?php endif; ?>
                <p class="font-semibold text-gray-900 mt-1"><?= htmlspecialchars($order['deliveryAddress']['area'] ?? 'Bangalore') ?>, Bangalore - <?= htmlspecialchars($order['deliveryAddress']['pincode']) ?></p>
            </div>

            <div class="pt-3 border-t border-gray-100">
                <span class="text-[11px] text-gray-400 block mb-0.5">Payment Method:</span>
                <span class="text-xs font-bold text-gray-900"><?= htmlspecialchars($order['paymentMethod'] ?? 'COD') ?> (<?= htmlspecialchars($order['paymentStatus'] ?? 'Pending') ?>)</span>
            </div>
        </div>
    </div>
</div>

<?php require_once BASE_DIR . '/views/layout/footer.php'; ?>
