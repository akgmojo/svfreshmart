<?php
require_once __DIR__ . '/../config.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? $_POST['action'] ?? 'list';
$input = json_decode(file_get_contents('php://input'), true) ?? [];

if ($action === 'list') {
    AdminAuth::requirePermission('view_products');
    $products = Database::getProducts(false); // return all, including inactive
    echo json_encode(['success' => true, 'products' => $products]);
    exit;
}

// For mutations, require manage_products
AdminAuth::requirePermission('manage_products');

switch ($action) {
    case 'save':
        $product = $input['product'] ?? $_POST['product'] ?? [];
        if (empty($product['name']) || empty($product['productSku'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Product Name and SKU are required']);
            exit;
        }

        if (empty($product['id'])) {
            $product['id'] = 'prod-' . bin2hex(random_bytes(4));
            $product['createdAt'] = date('c');
        }
        $product['updatedAt'] = date('c');

        // Create slug if empty
        if (empty($product['slug'])) {
            $product['slug'] = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $product['name'])));
        }

        // Validate variations
        if (empty($product['variations']) || !is_array($product['variations'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'At least one product variation is required']);
            exit;
        }

        foreach ($product['variations'] as &$v) {
            if (empty($v['id'])) {
                $v['id'] = 'var-' . bin2hex(random_bytes(4));
            }
            $v['price'] = floatval($v['price'] ?? 0);
            $v['mrp'] = floatval($v['mrp'] ?? $v['price']);
            $v['stock'] = intval($v['stock'] ?? 0);
            $v['isActive'] = !empty($v['isActive']);
        }

        Database::saveProduct($product);
        echo json_encode(['success' => true, 'message' => 'Product saved successfully', 'product' => $product]);
        break;

    case 'toggle':
        $id = $input['id'] ?? $_POST['id'] ?? '';
        $product = Database::getProductById($id);
        if (!$product) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Product not found']);
            exit;
        }
        $product['isActive'] = empty($product['isActive']);
        $product['updatedAt'] = date('c');
        Database::saveProduct($product);
        echo json_encode(['success' => true, 'isActive' => $product['isActive']]);
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'Invalid action']);
        break;
}
