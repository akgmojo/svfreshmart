<?php
if (!defined('APP_NAME')) exit;
?>
    </main>

    <!-- Value Propositions Banner -->
    <section class="border-t border-b border-gray-200 bg-white py-8 mt-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div class="flex flex-col items-center">
                    <div class="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                        <i data-lucide="sprout" class="w-6 h-6"></i>
                    </div>
                    <h4 class="font-bold text-gray-900 text-sm">Farm-Fresh Harvest</h4>
                    <p class="text-xs text-gray-500 mt-1">Sourced early morning from local Bangalore farms</p>
                </div>
                <div class="flex flex-col items-center">
                    <div class="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                        <i data-lucide="clock" class="w-6 h-6"></i>
                    </div>
                    <h4 class="font-bold text-gray-900 text-sm">2-4 Hr Delivery</h4>
                    <p class="text-xs text-gray-500 mt-1">Fast delivery across Bangalore postal zones</p>
                </div>
                <div class="flex flex-col items-center">
                    <div class="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                        <i data-lucide="badge-percent" class="w-6 h-6"></i>
                    </div>
                    <h4 class="font-bold text-gray-900 text-sm">Mandi Wholesale Rates</h4>
                    <p class="text-xs text-gray-500 mt-1">Honest prices with genuine variation weights</p>
                </div>
                <div class="flex flex-col items-center">
                    <div class="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                        <i data-lucide="shield-check" class="w-6 h-6"></i>
                    </div>
                    <h4 class="font-bold text-gray-900 text-sm">Contactless COD / UPI</h4>
                    <p class="text-xs text-gray-500 mt-1">Pay on delivery after inspecting your veggies</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-400 py-12 text-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div>
                    <div class="flex items-center gap-2 mb-4">
                        <div class="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                            <i data-lucide="leaf" class="w-5 h-5"></i>
                        </div>
                        <span class="text-lg font-bold text-white tracking-tight">SV Fresh Mart</span>
                    </div>
                    <p class="text-xs leading-relaxed text-gray-400">
                        Bangalore's trusted neighbourhood online farm market. Handpicked fresh greens, vegetables, coconuts, and daily staples delivered directly to your doorstep.
                    </p>
                    <div class="mt-4 flex items-center gap-2 text-xs text-emerald-400 font-medium">
                        <i data-lucide="clock" class="w-4 h-4"></i>
                        <span>Order Hours: 6:00 AM – 9:00 PM Daily</span>
                    </div>
                </div>

                <div>
                    <h5 class="text-white font-semibold text-sm mb-3">Bangalore Delivery Zones</h5>
                    <ul class="space-y-1.5 text-xs">
                        <li>Sarjapur Road (560035)</li>
                        <li>HSR Layout (560102)</li>
                        <li>Bellandur (560103)</li>
                        <li>Whitefield (560066)</li>
                        <li>Electronic City (560100)</li>
                        <li>Koramangala (560034)</li>
                    </ul>
                </div>

                <div>
                    <h5 class="text-white font-semibold text-sm mb-3">Customer Support</h5>
                    <ul class="space-y-2 text-xs">
                        <li class="flex items-center gap-2">
                            <i data-lucide="phone" class="w-4 h-4 text-emerald-500"></i>
                            <a href="tel:<?= STORE_PHONE ?>" class="hover:text-white"><?= STORE_PHONE ?></a>
                        </li>
                        <li class="flex items-center gap-2">
                            <i data-lucide="mail" class="w-4 h-4 text-emerald-500"></i>
                            <a href="mailto:<?= STORE_EMAIL ?>" class="hover:text-white"><?= STORE_EMAIL ?></a>
                        </li>
                        <li class="flex items-center gap-2">
                            <i data-lucide="map-pin" class="w-4 h-4 text-emerald-500"></i>
                            <span>Sarjapur Main Road, Bangalore - 560035</span>
                        </li>
                    </ul>
                </div>

                <div>
                    <h5 class="text-white font-semibold text-sm mb-3">Quick Links</h5>
                    <ul class="space-y-1.5 text-xs">
                        <li><a href="/" class="hover:text-white">Home</a></li>
                        <li><a href="/shop" class="hover:text-white">All Fresh Vegetables</a></li>
                        <li><a href="/cart" class="hover:text-white">Shopping Cart</a></li>
                        <li><a href="/account" class="hover:text-white">My Orders & Account</a></li>
                    </ul>
                </div>
            </div>

            <div class="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <p>&copy; <?= date('Y') ?> SV Fresh Mart Bangalore. All rights reserved.</p>
                <p class="text-gray-500">Direct Farm-to-Kitchen in Bangalore, Karnataka, India.</p>
            </div>
        </div>
    </footer>

    <!-- Mobile Sticky Bottom Navigation -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-6 py-2 flex items-center justify-between shadow-lg">
        <a href="/" class="flex flex-col items-center text-xs font-medium text-emerald-700">
            <i data-lucide="home" class="w-5 h-5 mb-0.5"></i>
            <span>Home</span>
        </a>
        <a href="/shop" class="flex flex-col items-center text-xs font-medium text-gray-600 hover:text-emerald-700">
            <i data-lucide="grid" class="w-5 h-5 mb-0.5"></i>
            <span>Shop</span>
        </a>
        <button onclick="toggleCartDrawer(true)" class="relative flex flex-col items-center text-xs font-medium text-gray-600 hover:text-emerald-700">
            <i data-lucide="shopping-bag" class="w-5 h-5 mb-0.5"></i>
            <span>Cart</span>
            <span id="mobileCartBadge" class="absolute -top-1 -right-2 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">0</span>
        </button>
        <a href="/account" class="flex flex-col items-center text-xs font-medium text-gray-600 hover:text-emerald-700">
            <i data-lucide="user" class="w-5 h-5 mb-0.5"></i>
            <span>Account</span>
        </a>
    </nav>

    <?php require_once BASE_DIR . '/views/layout/modals.php'; ?>

    <!-- Core App JS -->
    <script src="/assets/js/app.js"></script>
    <script>
        // Initialize Lucide Icons
        if (window.lucide) {
            lucide.createIcons();
        }
    </script>
</body>
</html>
