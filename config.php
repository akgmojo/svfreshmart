<?php
/**
 * SV Freshmart - Configuration & Bootstrap
 * Bangalore Local Grocery Store
 */

if (session_status() === PHP_SESSION_NONE) {
    // Set secure session cookie parameters
    session_set_cookie_params([
        'lifetime' => 86400 * 30, // 30 days
        'path' => '/',
        'domain' => '',
        'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    session_start();
}

define('APP_NAME', 'SV Fresh Mart');
define('APP_TAGLINE', 'Farm-Fresh Vegetables & Daily Essentials in Bangalore');
define('STORE_CITY', 'Bangalore');
define('STORE_PHONE', '+91 98765 43210');
define('STORE_EMAIL', 'support@svfreshmart.com');
define('BASE_DIR', __DIR__);
define('DATA_DIR', BASE_DIR . '/data');
define('DB_FILE', DATA_DIR . '/svfreshmart_db.json');

// Ensure data directory exists
if (!is_dir(DATA_DIR)) {
    mkdir(DATA_DIR, 0755, true);
}

// Error reporting for production / development
ini_set('display_errors', '0');
error_reporting(E_ALL);
ini_set('log_errors', '1');
ini_set('error_log', BASE_DIR . '/data/php_error.log');

// Autoload helper classes
require_once BASE_DIR . '/includes/Database.php';
require_once BASE_DIR . '/includes/CustomerAuth.php';
require_once BASE_DIR . '/includes/AdminAuth.php';
require_once BASE_DIR . '/includes/DeliveryService.php';
require_once BASE_DIR . '/includes/OrderService.php';
