<?php
if (!defined('APP_NAME')) exit;
$currentAdmin = AdminAuth::requirePermission('view_dashboard');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($adminTitle ?? 'Admin Portal') ?> | SV Fresh Mart</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body class="bg-gray-950 text-gray-100 flex min-h-screen font-sans antialiased">

    <!-- Admin Sidebar -->
    <aside class="w-64 bg-gray-900 border-r border-gray-800 flex flex-col flex-shrink-0 z-30">
        <!-- Logo -->
        <div class="h-16 flex items-center gap-3 px-6 border-b border-gray-800">
            <div class="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-950">
                <i data-lucide="leaf" class="w-5 h-5"></i>
            </div>
            <div>
                <span class="font-bold text-white tracking-tight text-sm block">SV Fresh Mart</span>
                <span class="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase block">Admin Control</span>
            </div>
        </div>

        <!-- Admin Role Badge -->
        <div class="p-4 mx-4 my-4 rounded-xl bg-gray-800/60 border border-gray-700/60 flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-400 flex items-center justify-center text-xs font-bold">
                <i data-lucide="shield" class="w-4 h-4"></i>
            </div>
            <div class="min-w-0 flex-1">
                <p class="text-xs font-bold text-white truncate"><?= htmlspecialchars($currentAdmin['name']) ?></p>
                <p class="text-[10px] text-emerald-400 font-mono"><?= htmlspecialchars($currentAdmin['role']) ?></p>
            </div>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 px-4 space-y-1.5 text-xs font-semibold">
            <a href="/admin" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors <?= ($adminSection === 'dashboard') ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800' ?>">
                <i data-lucide="layout-dashboard" class="w-4 h-4"></i>
                <span>Dashboard</span>
            </a>

            <?php if (AdminAuth::hasPermission('view_products') || AdminAuth::hasPermission('manage_products')): ?>
                <a href="/admin/products" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors <?= ($adminSection === 'products') ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800' ?>">
                    <i data-lucide="layers" class="w-4 h-4"></i>
                    <span>Products & Variations</span>
                </a>
            <?php endif; ?>

            <?php if (AdminAuth::hasPermission('view_orders') || AdminAuth::hasPermission('manage_orders')): ?>
                <a href="/admin/orders" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors <?= ($adminSection === 'orders') ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800' ?>">
                    <i data-lucide="shopping-bag" class="w-4 h-4"></i>
                    <span>Orders & Fulfillment</span>
                </a>
            <?php endif; ?>

            <?php if (AdminAuth::hasPermission('manage_excel')): ?>
                <a href="/admin/excel" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors <?= ($adminSection === 'excel') ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800' ?>">
                    <i data-lucide="file-spreadsheet" class="w-4 h-4"></i>
                    <span>Excel Bulk Catalogue</span>
                </a>
            <?php endif; ?>

            <?php if (AdminAuth::hasPermission('manage_zones')): ?>
                <a href="/admin/zones" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors <?= ($adminSection === 'zones') ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800' ?>">
                    <i data-lucide="map-pin" class="w-4 h-4"></i>
                    <span>Bangalore Zones</span>
                </a>
            <?php endif; ?>
        </nav>

        <!-- Bottom Logout & Storefront Link -->
        <div class="p-4 border-t border-gray-800 space-y-2">
            <a href="/" target="_blank" class="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                <i data-lucide="external-link" class="w-4 h-4 text-emerald-500"></i>
                <span>View Live Store</span>
            </a>
            <button onclick="handleAdminLogout()" class="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors">
                <i data-lucide="log-out" class="w-4 h-4"></i>
                <span>Logout</span>
            </button>
        </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header class="h-16 bg-gray-900 border-b border-gray-800 px-8 flex items-center justify-between">
            <h2 class="text-base font-bold text-white"><?= htmlspecialchars($adminTitle ?? 'Dashboard') ?></h2>
            <div class="flex items-center gap-3 text-xs text-gray-400">
                <span>Bangalore Store Node: <strong class="text-emerald-400">Online</strong></span>
            </div>
        </header>
        <main class="p-8 flex-1">
