<?php
/**
 * Database Handler for SV Freshmart
 * Thread-safe JSON database with atomic file locking
 */

class Database {
    private static $filePath = DB_FILE;

    public static function getDb() {
        if (!file_exists(self::$filePath)) {
            self::initDefaultDb();
        }
        $fp = fopen(self::$filePath, 'r');
        if (!$fp) {
            return [];
        }
        flock($fp, LOCK_SH);
        $content = stream_get_contents($fp);
        flock($fp, LOCK_UN);
        fclose($fp);

        $data = json_decode($content, true);
        return is_array($data) ? $data : [];
    }

    public static function saveDb($data) {
        $fp = fopen(self::$filePath, 'c+');
        if (!$fp) {
            return false;
        }
        if (flock($fp, LOCK_EX)) {
            ftruncate($fp, 0);
            fwrite($fp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
            fflush($fp);
            flock($fp, LOCK_UN);
            fclose($fp);
            return true;
        }
        fclose($fp);
        return false;
    }

    public static function getProducts($onlyActive = true) {
        $db = self::getDb();
        $products = $db['products'] ?? [];
        if (!$onlyActive) {
            return $products;
        }
        return array_values(array_filter($products, function($p) {
            return !empty($p['isActive']);
        }));
    }

    public static function getProductBySlug($slug) {
        $products = self::getProducts(false);
        foreach ($products as $p) {
            if (($p['slug'] ?? '') === $slug) {
                return $p;
            }
        }
        return null;
    }

    public static function getProductById($id) {
        $products = self::getProducts(false);
        foreach ($products as $p) {
            if (($p['id'] ?? '') === $id) {
                return $p;
            }
        }
        return null;
    }

    public static function saveProduct($product) {
        $db = self::getDb();
        $found = false;
        foreach ($db['products'] as &$p) {
            if ($p['id'] === $product['id']) {
                $p = $product;
                $found = true;
                break;
            }
        }
        if (!$found) {
            $db['products'][] = $product;
        }
        return self::saveDb($db);
    }

    public static function getCategories() {
        $products = self::getProducts(true);
        $cats = [];
        foreach ($products as $p) {
            $c = $p['category'] ?? 'General';
            if (!in_array($c, $cats)) {
                $cats[] = $c;
            }
        }
        return $cats;
    }

    public static function getZones() {
        $db = self::getDb();
        return $db['zones'] ?? [];
    }

    public static function getZoneByPincode($pincode) {
        $pincode = trim($pincode);
        $zones = self::getZones();
        foreach ($zones as $z) {
            if ($z['pincode'] === $pincode) {
                return $z;
            }
        }
        return null;
    }

    public static function saveZone($zone) {
        $db = self::getDb();
        $found = false;
        foreach ($db['zones'] as &$z) {
            if ($z['pincode'] === $zone['pincode']) {
                $z = $zone;
                $found = true;
                break;
            }
        }
        if (!$found) {
            $db['zones'][] = $zone;
        }
        return self::saveDb($db);
    }

    public static function getOrders($customerId = null) {
        $db = self::getDb();
        $orders = $db['orders'] ?? [];
        if ($customerId !== null) {
            return array_values(array_filter($orders, function($o) use ($customerId) {
                return ($o['customerId'] ?? '') === $customerId;
            }));
        }
        return $orders;
    }

    public static function getOrderById($id) {
        $orders = self::getOrders();
        foreach ($orders as $o) {
            if (($o['id'] ?? '') === $id || ($o['orderNumber'] ?? '') === $id) {
                return $o;
            }
        }
        return null;
    }

    public static function saveOrder($order) {
        $db = self::getDb();
        $found = false;
        foreach ($db['orders'] as &$o) {
            if ($o['id'] === $order['id']) {
                $o = $order;
                $found = true;
                break;
            }
        }
        if (!$found) {
            array_unshift($db['orders'], $order);
        }
        return self::saveDb($db);
    }

    public static function getCustomers() {
        $db = self::getDb();
        return $db['customers'] ?? [];
    }

    public static function getCustomerById($id) {
        $customers = self::getCustomers();
        foreach ($customers as $c) {
            if (($c['id'] ?? '') === $id) {
                return $c;
            }
        }
        return null;
    }

    public static function getCustomerByPhone($phone) {
        $phone = preg_replace('/[^0-9]/', '', $phone);
        if (strlen($phone) === 12 && substr($phone, 0, 2) === '91') {
            $phone = substr($phone, 2);
        }
        $customers = self::getCustomers();
        foreach ($customers as $c) {
            $cPhone = preg_replace('/[^0-9]/', '', $c['phone'] ?? '');
            if ($cPhone === $phone) {
                return $c;
            }
        }
        return null;
    }

    public static function saveCustomer($customer) {
        $db = self::getDb();
        $found = false;
        if (!isset($db['customers'])) {
            $db['customers'] = [];
        }
        foreach ($db['customers'] as &$c) {
            if ($c['id'] === $customer['id']) {
                $c = $customer;
                $found = true;
                break;
            }
        }
        if (!$found) {
            $db['customers'][] = $customer;
        }
        return self::saveDb($db);
    }

    public static function getAdmins() {
        $db = self::getDb();
        return $db['admins'] ?? [];
    }

    public static function getAdminByUsername($username) {
        $admins = self::getAdmins();
        foreach ($admins as $a) {
            if (strcasecmp($a['username'] ?? '', $username) === 0) {
                return $a;
            }
        }
        return null;
    }

    private static function initDefaultDb() {
        // Will initialize with empty tables if file does not exist
        $defaults = [
            'products' => [],
            'orders' => [],
            'customers' => [],
            'zones' => [],
            'auditLogs' => [],
            'admins' => [
                [
                    'id' => 'admin-super',
                    'username' => 'admin',
                    'name' => 'SV Super Admin',
                    'role' => 'Super Admin',
                    'passwordHash' => password_hash('admin@SVFresh2026!', PASSWORD_BCRYPT),
                    'isActive' => true,
                    'createdAt' => date('c')
                ]
            ]
        ];
        self::saveDb($defaults);
    }
}
