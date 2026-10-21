<?php
require_once __DIR__ . '/../config.php';
header('Content-Type: application/json');

$action = $_GET['action'] ?? $_POST['action'] ?? '';
$input = json_decode(file_get_contents('php://input'), true) ?? [];

switch ($action) {
    case 'create':
        $customer = CustomerAuth::requireAuth();
        $cartItems = $input['items'] ?? $_POST['items'] ?? [];
        $address = $input['address'] ?? $_POST['address'] ?? [];
        $paymentMethod = $input['paymentMethod'] ?? $_POST['paymentMethod'] ?? 'COD';

        $result = OrderService::createOrder($customer, $cartItems, $address, $paymentMethod);
        if (!$result['success']) {
            http_response_code(400);
        }
        echo json_encode($result);
        break;

    case 'list':
        $customer = CustomerAuth::requireAuth();
        // IDOR check: Strictly filter orders by authenticated customer's ID!
        $orders = Database::getOrders($customer['id']);
        echo json_encode([
            'success' => true,
            'orders' => $orders
        ]);
        break;

    case 'get':
        $customer = CustomerAuth::requireAuth();
        $orderId = $_GET['id'] ?? '';
        if (empty($orderId)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Order ID is required']);
            exit;
        }

        $order = Database::getOrderById($orderId);
        if (!$order) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Order not found']);
            exit;
        }

        // IDOR check: Customer A must NEVER access Customer B's order!
        if ($order['customerId'] !== $customer['id']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Forbidden: You do not have permission to view this order.']);
            exit;
        }

        echo json_encode(['success' => true, 'order' => $order]);
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'Invalid action']);
        break;
}
