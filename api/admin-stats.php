<?php
require_once __DIR__ . '/../config.php';
header('Content-Type: application/json');

AdminAuth::requirePermission('view_dashboard');

$orders = Database::getOrders();
$products = Database::getProducts(false);

$totalOrders = count($orders);
$totalRevenue = 0.0;
$todayOrders = 0;
$todayRevenue = 0.0;
$pendingOrders = 0;
$deliveredOrders = 0;
$outForDelivery = 0;

$todayDate = date('Y-m-d');

foreach ($orders as $o) {
    $totalRevenue += floatval($o['finalTotal'] ?? 0);
    $orderDate = substr($o['createdAt'] ?? '', 0, 10);
    if ($orderDate === $todayDate) {
        $todayOrders++;
        $todayRevenue += floatval($o['finalTotal'] ?? 0);
    }
    $status = $o['orderStatus'] ?? '';
    if ($status === 'Confirmed' || $status === 'Processing' || $status === 'Pending Payment') {
        $pendingOrders++;
    } elseif ($status === 'Out for Delivery') {
        $outForDelivery++;
    } elseif ($status === 'Delivered') {
        $deliveredOrders++;
    }
}

$lowStockCount = 0;
$outOfStockCount = 0;

foreach ($products as $p) {
    if (!empty($p['variations'])) {
        foreach ($p['variations'] as $v) {
            $stock = intval($v['stock'] ?? 0);
            if ($stock <= 0) {
                $outOfStockCount++;
            } elseif ($stock < 10) {
                $lowStockCount++;
            }
        }
    }
}

echo json_encode([
    'success' => true,
    'stats' => [
        'todayOrders' => $todayOrders,
        'todayRevenue' => $todayRevenue,
        'totalOrders' => $totalOrders,
        'totalRevenue' => $totalRevenue,
        'pendingOrders' => $pendingOrders,
        'outForDelivery' => $outForDelivery,
        'deliveredOrders' => $deliveredOrders,
        'lowStock' => $lowStockCount,
        'outOfStock' => $outOfStockCount,
        'totalProducts' => count($products)
    ]
]);
