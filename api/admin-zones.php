<?php
require_once __DIR__ . '/../config.php';
header('Content-Type: application/json');

$action = $_GET['action'] ?? $_POST['action'] ?? 'list';
$input = json_decode(file_get_contents('php://input'), true) ?? [];

if ($action === 'list') {
    AdminAuth::requirePermission('manage_zones');
    $zones = Database::getZones();
    echo json_encode(['success' => true, 'zones' => $zones]);
    exit;
}

AdminAuth::requirePermission('manage_zones');

if ($action === 'save') {
    $zone = $input['zone'] ?? $_POST['zone'] ?? [];
    if (empty($zone['pincode'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Pincode is required']);
        exit;
    }
    $zone['deliveryFee'] = floatval($zone['deliveryFee'] ?? 35);
    $zone['freeDeliveryThreshold'] = floatval($zone['freeDeliveryThreshold'] ?? 399);
    $zone['minOrderValue'] = floatval($zone['minOrderValue'] ?? 149);
    $zone['isServiceable'] = !empty($zone['isServiceable']);

    Database::saveZone($zone);
    echo json_encode(['success' => true, 'message' => 'Zone saved successfully', 'zone' => $zone]);
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Invalid action']);
