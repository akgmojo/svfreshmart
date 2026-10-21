<?php
if (!defined('APP_NAME')) exit;
$currentCustomer = CustomerAuth::getCurrentCustomer();
$categories = Database::getCategories();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title><?= htmlspecialchars($pageTitle ?? APP_NAME . ' | Bangalore Grocery') ?></title>
    <meta name="description" content="<?= htmlspecialchars($pageDescription ?? APP_TAGLINE) ?>">
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        emerald: {
                            50: '#ecfdf5',
                            100: '#d1fae5',
                            600: '#059669',
                            700: '#047857',
                            800: '#065f46'
                        }
                    }
                }
            }
        }
    </script>
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <link rel="icon" href="/favicon.ico" type="image/x-icon">
    <style>
        [x-cloak] { display: none !important; }
        .glass-header { background: rgba(255, 255, 255, 0.96); backdrop-filter: blur(10px); }
    </style>
</head>
<body class="bg-gray-50 text-gray-800 flex flex-col min-h-screen antialiased pb-16 md:pb-0">

    <!-- Top Announcement Bar (Bangalore Focus) -->
    <div class="bg-emerald-800 text-emerald-100 text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
        <i data-lucide="truck" class="w-4 h-4"></i>
        <span>Farm-Fresh Delivery in <strong>Bangalore</strong> • Free Delivery on orders over ₹399 • 2-4 Hour Express Slots</span>
    </div>

    <!-- Main Navigation Bar -->
    <header class="sticky top-0 z-40 glass-header border-b border-gray-200 shadow-sm transition-all">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16 gap-4">
                
                <!-- Logo -->
                <a href="/" class="flex items-center gap-2.5 flex-shrink-0">
                    <div class="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-200">
                        <i data-lucide="leaf" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <span class="text-xl font-bold tracking-tight text-gray-900 block leading-tight">SV <span class="text-emerald-600">Fresh Mart</span></span>
                        <span class="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold block">Bangalore Daily</span>
                    </div>
                </a>

                <!-- Bangalore Pincode Selector -->
                <button onclick="openPincodeModal()" class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:border-emerald-500 text-xs text-gray-700 transition-colors shadow-sm">
                    <i data-lucide="map-pin" class="w-4 h-4 text-emerald-600"></i>
                    <span id="navPincodeText">Deliver to: <strong class="text-gray-900">560035 (Sarjapur)</strong></span>
                    <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-gray-400"></i>
                </button>

                <!-- Search Bar -->
                <div class="flex-1 max-w-md hidden sm:block">
                    <form action="/shop" method="GET" class="relative">
                        <input type="text" name="search" value="<?= htmlspecialchars($_GET['search'] ?? '') ?>" placeholder="Search fresh vegetables, coconut, greens..." class="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-gray-50 focus:bg-white transition-all">
                        <i data-lucide="search" class="w-4 h-4 text-gray-400 absolute left-3.5 top-3"></i>
                    </form>
                </div>

                <!-- Navigation Actions -->
                <div class="flex items-center gap-3">
                    
                    <!-- Customer Account / Login -->
                    <div id="authNavContainer">
                        <?php if ($currentCustomer): ?>
                            <a href="/account" class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 transition-colors">
                                <i data-lucide="user" class="w-5 h-5 text-emerald-600"></i>
                                <span class="hidden lg:inline"><?= htmlspecialchars($currentCustomer['name'] ?? 'My Account') ?></span>
                            </a>
                        <?php else: ?>
                            <button onclick="openLoginModal()" class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors">
                                <i data-lucide="log-in" class="w-4 h-4"></i>
                                <span>Login</span>
                            </button>
                        <?php endif; ?>
                    </div>

                    <!-- Cart Trigger Button -->
                    <button onclick="toggleCartDrawer(true)" class="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-md shadow-emerald-200 transition-all active:scale-95">
                        <i data-lucide="shopping-bag" class="w-5 h-5"></i>
                        <span class="hidden sm:inline">Cart</span>
                        <span id="navCartCount" class="bg-white text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">0</span>
                    </button>
                </div>
            </div>

            <!-- Mobile Search Bar (Below Header on small screens) -->
            <div class="sm:hidden pb-3 pt-1">
                <form action="/shop" method="GET" class="relative">
                    <input type="text" name="search" value="<?= htmlspecialchars($_GET['search'] ?? '') ?>" placeholder="Search fresh vegetables, chillies..." class="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm bg-gray-50 focus:bg-white">
                    <i data-lucide="search" class="w-4 h-4 text-gray-400 absolute left-3 top-2.5"></i>
                </form>
            </div>
        </div>
    </header>

    <!-- Main Content Slot -->
    <main class="flex-grow">
