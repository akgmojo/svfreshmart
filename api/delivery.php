<?php
require_once __DIR__ . '/../config.php';
header('Content-Type: application/json');

$pincode = $_GET['pincode'] ?? $_POST['pincode'] ?? '';
$subtotal = floatval($_GET['subtotal'] ?? $_POST['subtotal'] ?? 0);

if (empty($pincode)) {
    http_response_code(400);
    echo json_encode(['serviceable' => false, 'message' => 'Pincode is required']);
    exit;
}

$check = DeliveryService::checkPincode($pincode);

if ($subtotal > 0 && $check['serviceable']) {
    $feeCalc = DeliveryService::calculateDeliveryFee($subtotal, $pincode);
    $check['deliveryFee'] = $feeCalc['fee'];
    $check['isFree'] = $feeCalc['isFree'];
    $check['allowed'] = $feeCalc['allowed'];
    if (!$feeCalc['allowed']) {
        $check['minOrderNotice'] = $feeCalc['message'];
    }
}

echo json_encode($check);
