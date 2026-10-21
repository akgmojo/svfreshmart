<?php
require_once __DIR__ . '/../config.php';
header('Content-Type: application/json');

$slug = $_GET['slug'] ?? '';
$id = $_GET['id'] ?? '';
$category = $_GET['category'] ?? '';
$search = trim($_GET['search'] ?? '');

if (!empty($slug)) {
    $p = Database::getProductBySlug($slug);
    if ($p) {
        echo json_encode(['success' => true, 'product' => $p]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Product not found']);
    }
    exit;
}

if (!empty($id)) {
    $p = Database::getProductById($id);
    if ($p) {
        echo json_encode(['success' => true, 'product' => $p]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Product not found']);
    }
    exit;
}

$products = Database::getProducts(true);

// Filter by category
if (!empty($category) && $category !== 'All') {
    $products = array_values(array_filter($products, function($p) use ($category) {
        return strcasecmp($p['category'] ?? '', $category) === 0;
    }));
}

// Search
if (!empty($search)) {
    $searchLower = mb_strtolower($search);
    $products = array_values(array_filter($products, function($p) use ($searchLower) {
        $nameMatch = strpos(mb_strtolower($p['name'] ?? ''), $searchLower) !== false;
        $skuMatch = strpos(mb_strtolower($p['productSku'] ?? ''), $searchLower) !== false;
        $descMatch = strpos(mb_strtolower($p['description'] ?? ''), $searchLower) !== false;
        
        $varMatch = false;
        if (!empty($p['variations'])) {
            foreach ($p['variations'] as $v) {
                if (strpos(mb_strtolower($v['variantSku'] ?? ''), $searchLower) !== false) {
                    $varMatch = true;
                    break;
                }
            }
        }
        return $nameMatch || $skuMatch || $descMatch || $varMatch;
    }));
}

$categories = Database::getCategories();

echo json_encode([
    'success' => true,
    'total' => count($products),
    'categories' => $categories,
    'products' => $products
]);
