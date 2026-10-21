<?php
require_once __DIR__ . '/../config.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? $_POST['action'] ?? '';

// Support JSON input
$input = json_decode(file_get_contents('php://input'), true) ?? [];
$phone = $_POST['phone'] ?? $input['phone'] ?? '';
$otp = $_POST['otp'] ?? $input['otp'] ?? '';

switch ($action) {
    case 'send-otp':
        $res = CustomerAuth::sendOtp($phone);
        if (!$res['success']) http_response_code(400);
        echo json_encode($res);
        break;

    case 'verify-otp':
        $res = CustomerAuth::verifyOtp($phone, $otp);
        if (!$res['success']) http_response_code(400);
        echo json_encode($res);
        break;

    case 'me':
        $customer = CustomerAuth::getCurrentCustomer();
        if (!$customer) {
            http_response_code(401);
            echo json_encode(['authenticated' => false, 'customer' => null]);
        } else {
            echo json_encode(['authenticated' => true, 'customer' => $customer]);
        }
        break;

    case 'logout':
        echo json_encode(CustomerAuth::logout());
        break;

    case 'save-address':
        $customer = CustomerAuth::requireAuth();
        $address = $input['address'] ?? $_POST['address'] ?? [];
        if (empty($address['pincode']) || empty($address['street'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Street and Pincode are required.']);
            exit;
        }

        if (!isset($customer['addresses'])) {
            $customer['addresses'] = [];
        }

        $addressId = $address['id'] ?? ('addr-' . bin2hex(random_bytes(4)));
        $address['id'] = $addressId;

        // If marked default, unmark others
        if (!empty($address['isDefault'])) {
            foreach ($customer['addresses'] as &$a) {
                $a['isDefault'] = false;
            }
        }

        $found = false;
        foreach ($customer['addresses'] as &$a) {
            if ($a['id'] === $addressId) {
                $a = $address;
                $found = true;
                break;
            }
        }
        if (!$found) {
            $customer['addresses'][] = $address;
        }

        $customer['updatedAt'] = date('c');
        Database::saveCustomer($customer);
        echo json_encode(['success' => true, 'message' => 'Address saved successfully', 'customer' => $customer]);
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'Invalid action']);
        break;
}
