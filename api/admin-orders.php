<?php
require_once __DIR__ . '/../config.php';
header('Content-Type: application/json');

$action = $_GET['action'] ?? $_POST['action'] ?? 'list';
$input = json_decode(file_get_contents('php://input'), true) ?? [];

if ($action === 'list') {
    AdminAuth::requirePermission('view_orders');
    $orders = Database::getOrders();
    echo json_encode(['success' => true, 'orders' => $orders]);
    exit;
}

AdminAuth::requirePermission('manage_orders');

if ($action === 'update-status') {
    $orderId = $input['orderId'] ?? $_POST['orderId'] ?? '';
    $status = $input['status'] ?? $_POST['status'] ?? '';
    $res = OrderService::updateOrderStatus($orderId, $status);
    if (!$res['success']) {
        http_response_code(400);
    }
    echo json_encode($res);
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Invalid action']);
