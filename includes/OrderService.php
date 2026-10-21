<?php
/**
 * Order Processing & Inventory Management Service
 * Strictly enforces server-side pricing, variation-level inventory decrement, and address snapshotting
 */

class OrderService {
    public static function createOrder($customer, $cartItems, $address, $paymentMethod = 'COD') {
        if (empty($cartItems) || !is_array($cartItems)) {
            return ['success' => false, 'message' => 'Your cart is empty.'];
        }

        if (empty($address['pincode'])) {
            return ['success' => false, 'message' => 'Delivery pincode is required.'];
        }

        // Verify Bangalore delivery
        $pincode = $address['pincode'];
        $deliveryCheck = DeliveryService::checkPincode($pincode);
        if (!$deliveryCheck['serviceable']) {
            return ['success' => false, 'message' => $deliveryCheck['message']];
        }

        $db = Database::getDb();
        $productsMap = [];
        foreach ($db['products'] as &$p) {
            $productsMap[$p['id']] = &$p;
        }

        $validatedItems = [];
        $subtotal = 0.0;
        $priceChanges = [];

        // 1. Validate every item against live database
        foreach ($cartItems as $item) {
            $prodId = $item['productId'] ?? '';
            $varId = $item['variationId'] ?? '';
            $qty = intval($item['quantity'] ?? 1);

            if ($qty <= 0) continue;

            if (!isset($productsMap[$prodId])) {
                return ['success' => false, 'message' => "Product no longer available: {$item['name']}"];
            }

            $product = &$productsMap[$prodId];
            if (empty($product['isActive'])) {
                return ['success' => false, 'message' => "Product is currently inactive: {$product['name']}"];
            }

            // Find variation
            $targetVar = null;
            $varIndex = -1;
            foreach ($product['variations'] as $idx => &$v) {
                if ($v['id'] === $varId || $v['variantSku'] === ($item['variantSku'] ?? '')) {
                    $targetVar = &$v;
                    $varIndex = $idx;
                    break;
                }
            }

            if (!$targetVar || empty($targetVar['isActive'])) {
                return ['success' => false, 'message' => "Selected variation not available for {$product['name']}"];
            }

            // Check stock
            if ($targetVar['stock'] < $qty) {
                return [
                    'success' => false,
                    'message' => "Insufficient stock for {$product['name']} ({$targetVar['label']}). Only {$targetVar['stock']} available."
                ];
            }

            $unitPrice = floatval($targetVar['price']);
            $lineTotal = $unitPrice * $qty;
            $subtotal += $lineTotal;

            $validatedItems[] = [
                'productId' => $product['id'],
                'productName' => $product['name'],
                'productSku' => $product['productSku'] ?? '',
                'variationId' => $targetVar['id'],
                'variantSku' => $targetVar['variantSku'] ?? '',
                'label' => $targetVar['label'] ?? '',
                'quantity' => $qty,
                'unit' => $targetVar['unit'] ?? '',
                'unitPrice' => $unitPrice,
                'mrp' => floatval($targetVar['mrp'] ?? $unitPrice),
                'subtotal' => $lineTotal,
                '_ref' => &$targetVar // for stock decrement
            ];
        }

        if (empty($validatedItems)) {
            return ['success' => false, 'message' => 'No valid items to order.'];
        }

        // Check minimum order value
        $deliveryResult = DeliveryService::calculateDeliveryFee($subtotal, $pincode);
        if (!$deliveryResult['allowed']) {
            return ['success' => false, 'message' => $deliveryResult['message']];
        }

        $deliveryFee = $deliveryResult['fee'];
        $finalTotal = $subtotal + $deliveryFee;

        // 2. Decrement stock atomically
        foreach ($validatedItems as &$vi) {
            $vi['_ref']['stock'] -= $vi['quantity'];
            unset($vi['_ref']); // Remove reference before saving
        }

        // 3. Create Order Record
        $orderNumber = 'SVF-' . strtoupper(date('ymd')) . '-' . rand(1000, 9999);
        $orderId = 'ord-' . bin2hex(random_bytes(6));

        $newOrder = [
            'id' => $orderId,
            'orderNumber' => $orderNumber,
            'customerId' => $customer['id'],
            'customerName' => $customer['name'] ?? 'Bangalore Customer',
            'customerPhone' => $customer['phone'] ?? '',
            'items' => $validatedItems,
            'subtotal' => $subtotal,
            'deliveryFee' => $deliveryFee,
            'tax' => 0.0,
            'discount' => 0.0,
            'finalTotal' => $finalTotal,
            'paymentMethod' => $paymentMethod,
            'paymentStatus' => ($paymentMethod === 'COD' ? 'Pending' : 'Paid'),
            'orderStatus' => 'Confirmed',
            'deliveryAddress' => [
                'name' => $address['name'] ?? $customer['name'],
                'phone' => $address['phone'] ?? $customer['phone'],
                'street' => $address['street'] ?? '',
                'landmark' => $address['landmark'] ?? '',
                'area' => $deliveryResult['areaName'] ?? 'Bangalore',
                'city' => 'Bangalore',
                'pincode' => $pincode
            ],
            'createdAt' => date('c'),
            'updatedAt' => date('c')
        ];

        // Save order and update products in database
        array_unshift($db['orders'], $newOrder);
        Database::saveDb($db);

        return [
            'success' => true,
            'message' => 'Order placed successfully!',
            'order' => $newOrder
        ];
    }

    public static function updateOrderStatus($orderId, $newStatus) {
        $allowed = ['Pending Payment', 'Confirmed', 'Processing', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled', 'Refunded'];
        if (!in_array($newStatus, $allowed)) {
            return ['success' => false, 'message' => 'Invalid status'];
        }

        $db = Database::getDb();
        $found = false;
        foreach ($db['orders'] as &$o) {
            if ($o['id'] === $orderId || $o['orderNumber'] === $orderId) {
                $o['orderStatus'] = $newStatus;
                $o['updatedAt'] = date('c');
                $found = true;
                break;
            }
        }

        if ($found) {
            Database::saveDb($db);
            return ['success' => true, 'message' => "Order updated to {$newStatus}"];
        }
        return ['success' => false, 'message' => 'Order not found'];
    }
}
