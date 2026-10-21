<?php
require_once __DIR__ . '/../config.php';

$action = $_GET['action'] ?? $_POST['action'] ?? '';

if ($action === 'template') {
    // Generate CSV template for bulk catalogue download
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=svfreshmart_catalogue_template.csv');
    
    $output = fopen('php://output', 'w');
    fputcsv($output, [
        'Product SKU', 'Variant SKU', 'Product Name', 'Quantity', 'Unit', 
        'Selling Price', 'MRP', 'Stock Quantity', 'Stock Status', 'Product Status', 'Category', 'Image URL'
    ]);
    
    // Add existing products as rows
    $products = Database::getProducts(false);
    foreach ($products as $p) {
        if (!empty($p['variations'])) {
            foreach ($p['variations'] as $v) {
                fputcsv($output, [
                    $p['productSku'] ?? '',
                    $v['variantSku'] ?? '',
                    $p['name'] ?? '',
                    $v['quantity'] ?? '',
                    $v['unit'] ?? '',
                    $v['price'] ?? '',
                    $v['mrp'] ?? '',
                    $v['stock'] ?? '',
                    ($v['stock'] > 0 ? 'In Stock' : 'Out of Stock'),
                    (!empty($p['isActive']) ? 'Active' : 'Inactive'),
                    $p['category'] ?? '',
                    $p['imageUrl'] ?? ''
                ]);
            }
        }
    }
    fclose($output);
    exit;
}

header('Content-Type: application/json');
AdminAuth::requirePermission('manage_excel');

$input = json_decode(file_get_contents('php://input'), true) ?? [];

if ($action === 'validate') {
    $rows = $input['rows'] ?? [];
    if (empty($rows)) {
        if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
            $handle = fopen($_FILES['file']['tmp_name'], 'r');
            $header = fgetcsv($handle);
            $rows = [];
            while (($data = fgetcsv($handle)) !== false) {
                if (count($data) >= 8) {
                    $rows[] = [
                        'Product SKU' => $data[0] ?? '',
                        'Variant SKU' => $data[1] ?? '',
                        'Product Name' => $data[2] ?? '',
                        'Quantity' => $data[3] ?? '',
                        'Unit' => $data[4] ?? '',
                        'Selling Price' => $data[5] ?? '',
                        'MRP' => $data[6] ?? '',
                        'Stock Quantity' => $data[7] ?? '',
                        'Stock Status' => $data[8] ?? '',
                        'Product Status' => $data[9] ?? 'Active',
                        'Category' => $data[10] ?? '',
                        'Image URL' => $data[11] ?? ''
                    ];
                }
            }
            fclose($handle);
        }
    }

    if (empty($rows)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No valid rows found in file.']);
        exit;
    }

    $validUnits = ['g', 'kg', 'ml', 'L', 'piece', 'pieces', 'pack', 'box', 'bundle', 'bottle', 'jar'];
    $db = Database::getDb();
    
    // Map existing variations by SKU
    $existingVariants = [];
    foreach ($db['products'] as $p) {
        foreach ($p['variations'] as $v) {
            $existingVariants[$v['variantSku']] = [
                'product' => $p,
                'variation' => $v
            ];
        }
    }

    $diffs = [];
    $errors = [];
    $warnings = [];
    $seenSkus = [];

    foreach ($rows as $idx => $r) {
        $rowNum = $idx + 2;
        $varSku = trim($r['Variant SKU'] ?? '');
        $prodSku = trim($r['Product SKU'] ?? '');
        $unit = strtolower(trim($r['Unit'] ?? ''));
        $price = floatval($r['Selling Price'] ?? 0);
        $mrp = floatval($r['MRP'] ?? $price);
        $stock = intval($r['Stock Quantity'] ?? 0);

        if (empty($varSku)) {
            $errors[] = "Row {$rowNum}: Missing Variant SKU.";
            continue;
        }

        if (isset($seenSkus[$varSku])) {
            $errors[] = "Row {$rowNum}: Duplicate Variant SKU '{$varSku}'.";
            continue;
        }
        $seenSkus[$varSku] = true;

        if (!in_array($unit, $validUnits)) {
            $errors[] = "Row {$rowNum} ({$varSku}): Invalid unit '{$unit}'. Allowed: " . implode(', ', $validUnits);
        }

        if ($price < 0) {
            $errors[] = "Row {$rowNum} ({$varSku}): Selling price cannot be negative.";
        }
        if ($stock < 0) {
            $errors[] = "Row {$rowNum} ({$varSku}): Stock quantity cannot be negative.";
        }

        if (!isset($existingVariants[$varSku])) {
            $warnings[] = "Row {$rowNum} ({$varSku}): SKU not found in database. Will create new entry.";
            $diffs[] = [
                'type' => 'NEW',
                'sku' => $varSku,
                'name' => $r['Product Name'] ?? 'New Item',
                'oldPrice' => null,
                'newPrice' => $price,
                'oldStock' => null,
                'newStock' => $stock
            ];
        } else {
            $old = $existingVariants[$varSku]['variation'];
            $diffs[] = [
                'type' => 'UPDATE',
                'sku' => $varSku,
                'name' => $existingVariants[$varSku]['product']['name'] . ' (' . ($old['label'] ?? '') . ')',
                'oldPrice' => floatval($old['price']),
                'newPrice' => $price,
                'oldStock' => intval($old['stock']),
                'newStock' => $stock
            ];
        }
    }

    echo json_encode([
        'success' => count($errors) === 0,
        'errors' => $errors,
        'warnings' => $warnings,
        'diffs' => $diffs,
        'rowsProcessed' => count($rows),
        'validRows' => count($rows) - count($errors)
    ]);
    exit;
}

if ($action === 'commit') {
    $rows = $input['rows'] ?? [];
    if (empty($rows)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No rows provided to commit.']);
        exit;
    }

    $db = Database::getDb();
    $updatedCount = 0;

    foreach ($rows as $r) {
        $varSku = trim($r['Variant SKU'] ?? '');
        $price = floatval($r['Selling Price'] ?? 0);
        $mrp = floatval($r['MRP'] ?? $price);
        $stock = intval($r['Stock Quantity'] ?? 0);

        foreach ($db['products'] as &$p) {
            foreach ($p['variations'] as &$v) {
                if ($v['variantSku'] === $varSku) {
                    $v['price'] = $price;
                    $v['mrp'] = $mrp;
                    $v['stock'] = $stock;
                    $p['updatedAt'] = date('c');
                    $updatedCount++;
                }
            }
        }
    }

    Database::saveDb($db);
    echo json_encode([
        'success' => true,
        'message' => "Successfully updated {$updatedCount} variations in catalogue.",
        'updatedCount' => $updatedCount
    ]);
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Invalid action']);
