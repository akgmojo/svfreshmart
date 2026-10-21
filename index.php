<?php
/**
 * SV Fresh Mart - Central Router & Front Controller
 * Native PHP 8 / LiteSpeed / Apache deployment on Hostinger Shared Hosting
 */

require_once __DIR__ . '/config.php';

$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$parsedUrl = parse_url($requestUri);
$path = trim($parsedUrl['path'] ?? '/', '/');

// Pass through static assets
if (!empty($path) && file_exists(BASE_DIR . '/' . $path) && !is_dir(BASE_DIR . '/' . $path) && strpos($path, 'api/') !== 0) {
    return false;
}

// API Routes: /api/products, /api/auth, etc.
if (strpos($path, 'api/') === 0) {
    $apiFile = preg_replace('#^api/#', '', $path);
    $apiFile = preg_replace('#\.php$#', '', $apiFile);
    $target = BASE_DIR . '/api/' . $apiFile . '.php';
    if (file_exists($target)) {
        require_once $target;
        exit;
    }
}

// Robots.txt Handler
if ($path === 'robots.txt') {
    header('Content-Type: text/plain; charset=utf-8');
    echo "User-agent: *\n";
    echo "Allow: /\n";
    echo "Disallow: /admin\n";
    echo "Disallow: /admin/*\n";
    echo "Disallow: /account\n";
    echo "Disallow: /account/*\n";
    echo "Disallow: /checkout\n";
    echo "Disallow: /api/*\n\n";
    echo "Sitemap: https://svfreshmart.com/sitemap.xml\n";
    exit;
}

// Sitemap.xml Handler
if ($path === 'sitemap.xml') {
    header('Content-Type: application/xml; charset=utf-8');
    $products = Database::getProducts(true);
    $categories = Database::getCategories();
    echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
    
    // Core pages
    $staticPages = ['', 'shop', 'cart'];
    foreach ($staticPages as $sp) {
        echo "  <url>\n";
        echo "    <loc>https://svfreshmart.com/{$sp}</loc>\n";
        echo "    <changefreq>daily</changefreq>\n";
        echo "    <priority>" . ($sp === '' ? '1.0' : '0.8') . "</priority>\n";
        echo "  </url>\n";
    }

    // Categories
    foreach ($categories as $cat) {
        $catSlug = strtolower(str_replace(' ', '-', $cat));
        echo "  <url>\n";
        echo "    <loc>https://svfreshmart.com/category/{$catSlug}</loc>\n";
        echo "    <changefreq>daily</changefreq>\n";
        echo "    <priority>0.8</priority>\n";
        echo "  </url>\n";
    }

    // Products
    foreach ($products as $p) {
        echo "  <url>\n";
        echo "    <loc>https://svfreshmart.com/product/" . urlencode($p['slug']) . "</loc>\n";
        echo "    <changefreq>daily</changefreq>\n";
        echo "    <priority>0.9</priority>\n";
        echo "  </url>\n";
    }

    echo '</urlset>';
    exit;
}

// System Diagnostic Endpoint
if ($path === '__diagnostic') {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'ready',
        'engine' => 'PHP ' . PHP_VERSION,
        'serverSoftware' => $_SERVER['SERVER_SOFTWARE'] ?? 'Hostinger/LiteSpeed',
        'documentRoot' => $_SERVER['DOCUMENT_ROOT'] ?? '',
        'databaseConnected' => file_exists(DB_FILE),
        'productsCount' => count(Database::getProducts(false)),
        'bangaloreZonesCount' => count(Database::getZones()),
        'time' => date('c')
    ], JSON_PRETTY_PRINT);
    exit;
}

// Route matching
$routeParams = [];

// Home
if ($path === '' || $path === 'index.php') {
    require_once BASE_DIR . '/views/home.php';
    exit;
}

// Shop
if ($path === 'shop') {
    require_once BASE_DIR . '/views/shop.php';
    exit;
}

// Category: /category/{slug}
if (preg_match('#^category/([^/]+)$#', $path, $matches)) {
    $_GET['category'] = $matches[1];
    require_once BASE_DIR . '/views/shop.php';
    exit;
}

// Single Product: /product/{slug}
if (preg_match('#^product/([^/]+)$#', $path, $matches)) {
    $routeParams['slug'] = $matches[1];
    require_once BASE_DIR . '/views/product.php';
    exit;
}

// Cart
if ($path === 'cart') {
    require_once BASE_DIR . '/views/cart.php';
    exit;
}

// Checkout
if ($path === 'checkout') {
    require_once BASE_DIR . '/views/checkout.php';
    exit;
}

// Account
if ($path === 'account') {
    require_once BASE_DIR . '/views/account.php';
    exit;
}

// Order Detail: /account/orders/{id}
if (preg_match('#^account/orders/([^/]+)$#', $path, $matches)) {
    $routeParams['id'] = $matches[1];
    require_once BASE_DIR . '/views/order-detail.php';
    exit;
}

// Admin Login
if ($path === 'admin/login') {
    require_once BASE_DIR . '/views/admin/login.php';
    exit;
}

// Admin Dashboard
if ($path === 'admin') {
    require_once BASE_DIR . '/views/admin/dashboard.php';
    exit;
}

// Admin Products
if ($path === 'admin/products') {
    require_once BASE_DIR . '/views/admin/products.php';
    exit;
}

// Admin Orders
if ($path === 'admin/orders') {
    require_once BASE_DIR . '/views/admin/orders.php';
    exit;
}

// Admin Zones
if ($path === 'admin/zones') {
    require_once BASE_DIR . '/views/admin/zones.php';
    exit;
}

// Admin Excel
if ($path === 'admin/excel') {
    require_once BASE_DIR . '/views/admin/excel.php';
    exit;
}

// 404 Fallback
http_response_code(404);
$pageTitle = 'Page Not Found | ' . APP_NAME;
require_once BASE_DIR . '/views/layout/header.php';
echo '
<div class="max-w-md mx-auto py-20 px-4 text-center">
    <div class="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
        <i data-lucide="help-circle" class="w-8 h-8"></i>
    </div>
    <h1 class="text-2xl font-extrabold text-gray-900">404 - Page Not Found</h1>
    <p class="text-xs text-gray-500 mt-1 mb-6">The page you requested does not exist or has been moved.</p>
    <a href="/" class="inline-block px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200">Return to Store</a>
</div>';
require_once BASE_DIR . '/views/layout/footer.php';
