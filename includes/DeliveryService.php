<?php
/**
 * Bangalore Delivery Service
 * Validates Bangalore delivery zones, minimum order value, and free delivery thresholds
 */

class DeliveryService {
    public static function checkPincode($pincode) {
        $p = preg_replace('/[^0-9]/', '', $pincode);
        if (strlen($p) !== 6) {
            return [
                'serviceable' => false,
                'pincode' => $p,
                'message' => 'Please enter a valid 6-digit Indian Postal PIN code.'
            ];
        }

        // Must start with 560 (Bangalore postal circle)
        if (substr($p, 0, 3) !== '560') {
            return [
                'serviceable' => false,
                'pincode' => $p,
                'message' => 'Delivery currently available exclusively in Bangalore (PIN codes starting with 560xxx).'
            ];
        }

        $zone = Database::getZoneByPincode($p);
        if ($zone && !empty($zone['isServiceable'])) {
            return [
                'serviceable' => true,
                'pincode' => $p,
                'areaName' => $zone['areaName'] ?? 'Bangalore Zone',
                'deliveryFee' => floatval($zone['deliveryFee'] ?? 35),
                'freeDeliveryThreshold' => floatval($zone['freeDeliveryThreshold'] ?? 399),
                'minOrderValue' => floatval($zone['minOrderValue'] ?? 149),
                'estimatedHours' => $zone['estimatedHours'] ?? 'Same Day (2-4 hrs)',
                'message' => 'Delivery available in ' . ($zone['areaName'] ?? 'your area') . '!'
            ];
        }

        // Default Bangalore fallback zone if starts with 560
        return [
            'serviceable' => true,
            'pincode' => $p,
            'areaName' => 'Greater Bangalore',
            'deliveryFee' => 40.0,
            'freeDeliveryThreshold' => 499.0,
            'minOrderValue' => 199.0,
            'estimatedHours' => 'Next Slot (3-5 hrs)',
            'message' => 'Delivery available in Bangalore!'
        ];
    }

    public static function calculateDeliveryFee($subtotal, $pincode) {
        $check = self::checkPincode($pincode);
        if (!$check['serviceable']) {
            return [
                'allowed' => false,
                'fee' => 0,
                'message' => $check['message']
            ];
        }

        if ($subtotal < $check['minOrderValue']) {
            return [
                'allowed' => false,
                'fee' => $check['deliveryFee'],
                'message' => "Minimum order value is ₹{$check['minOrderValue']}. Please add more items."
            ];
        }

        $fee = ($subtotal >= $check['freeDeliveryThreshold']) ? 0.0 : $check['deliveryFee'];
        return [
            'allowed' => true,
            'fee' => $fee,
            'isFree' => ($fee === 0.0),
            'freeThreshold' => $check['freeDeliveryThreshold'],
            'areaName' => $check['areaName']
        ];
    }
}
