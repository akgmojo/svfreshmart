<?php
if (!defined('APP_NAME')) exit;
$pageTitle = 'SV Fresh Mart | Farm-Fresh Vegetables & Daily Essentials in Bangalore';
$pageDescription = 'Order farm-fresh vegetables, chillies, coconut, and daily staples delivered directly to your kitchen in Bangalore within 2-4 hours.';
require_once BASE_DIR . '/views/layout/header.php';

$allProducts = Database::getProducts(true);
$categories = Database::getCategories();
?>

<!-- Hero Banner -->
<section class="relative bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 text-white overflow-hidden py-12 md:py-16">
    <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-700/80 text-emerald-200 border border-emerald-600/50 mb-4 shadow-sm">
                    <i data-lucide="map-pin" class="w-3.5 h-3.5"></i>
                    <span>Bangalore Local Grocery Express</span>
                </span>
                <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                    Direct Farm-to-Kitchen <br>
                    <span class="text-emerald-400">Fresh Vegetables & Staples</span>
                </h1>
                <p class="mt-4 text-sm sm:text-base text-emerald-100 max-w-lg leading-relaxed">
                    Handpicked daily from Malur & Kolar farms. Crisp chillies, fresh greens, farm coconuts, and premium grains at honest mandi prices.
                </p>
                <div class="mt-6 flex flex-wrap items-center gap-3">
                    <a href="/shop" class="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm shadow-lg shadow-emerald-900/50 transition-all flex items-center gap-2">
                        <span>Order Fresh Veggies</span>
                        <i data-lucide="arrow-right" class="w-4 h-4"></i>
                    </a>
                    <button onclick="openPincodeModal()" class="px-4 py-3 rounded-xl bg-emerald-800/80 hover:bg-emerald-700/80 border border-emerald-600 text-xs font-semibold text-emerald-100 transition-colors flex items-center gap-2">
                        <i data-lucide="truck" class="w-4 h-4 text-emerald-400"></i>
                        <span>Check Bangalore Delivery</span>
                    </button>
                </div>
            </div>
            
            <div class="hidden md:flex justify-end">
                <div class="relative bg-emerald-800/40 border border-emerald-700/50 rounded-2xl p-6 backdrop-blur-sm max-w-sm w-full shadow-2xl">
                    <div class="flex items-center justify-between pb-4 border-b border-emerald-700/50">
                        <div>
                            <span class="text-xs text-emerald-300 font-semibold uppercase tracking-wider block">Today's Harvest</span>
                            <span class="text-lg font-bold text-white block">Morning Batch Ready</span>
                        </div>
                        <span class="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
                    </div>
                    <div class="py-4 space-y-3 text-xs text-emerald-100">
                        <div class="flex justify-between items-center">
                            <span>Fresh Green Chilli (50g – 500g)</span>
                            <span class="font-bold text-white">from ₹10</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span>Farm Coconut (Pollachi 1-5 Pcs)</span>
                            <span class="font-bold text-white">from ₹35</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span>Sona Masoori Rice (1kg – 10kg)</span>
                            <span class="font-bold text-white">from ₹70</span>
                        </div>
                    </div>
                    <div class="pt-3 border-t border-emerald-700/50 flex items-center justify-between text-xs text-emerald-300">
                        <span>Delivery Slot: 2:00 PM – 4:00 PM</span>
                        <span class="font-bold text-white">Bangalore Only</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Category Filter Pills -->
<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
    <div class="bg-white rounded-2xl p-3 shadow-md border border-gray-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <a href="/shop" class="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-sm flex items-center gap-1.5">
            <i data-lucide="layers" class="w-4 h-4"></i>
            <span>All Categories</span>
        </a>
        <?php foreach ($categories as $cat): ?>
            <a href="/category/<?= urlencode(strtolower(str_replace(' ', '-', $cat))) ?>" class="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 border border-gray-200 hover:border-emerald-300 transition-colors">
                <?= htmlspecialchars($cat) ?>
            </a>
        <?php endforeach; ?>
    </div>
</section>

<!-- Featured Products Section -->
<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div class="flex items-center justify-between mb-6">
        <div>
            <h2 class="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Today's Fresh Daily Essentials</h2>
            <p class="text-xs sm:text-sm text-gray-500 mt-0.5">Select your exact weight or unit pack for instant pricing</p>
        </div>
        <a href="/shop" class="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
            <span>View All</span>
            <i data-lucide="chevron-right" class="w-4 h-4"></i>
        </a>
    </div>

    <!-- Product Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <?php foreach ($allProducts as $p): 
            $defaultVar = $p['variations'][0] ?? null;
            if (!$defaultVar) continue;
            $cardId = 'prod-card-' . $p['id'];
            $defaultPrice = floatval($defaultVar['price']);
            $defaultMrp = floatval($defaultVar['mrp'] ?? $defaultPrice);
            $hasDiscount = ($defaultMrp > $defaultPrice);
            $discountPct = $hasDiscount ? round((($defaultMrp - $defaultPrice) / $defaultMrp) * 100) : 0;
            $isOutOfStock = ($defaultVar['stock'] <= 0);
        ?>
            <div id="<?= $cardId ?>" class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
                
                <!-- Image & Badges -->
                <div class="relative bg-gray-100 aspect-square overflow-hidden">
                    <a href="/product/<?= urlencode($p['slug']) ?>">
                        <img src="<?= htmlspecialchars($p['imageUrl']) ?>" alt="<?= htmlspecialchars($p['name']) ?>" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                    </a>
                    <span class="absolute top-2.5 left-2.5 bg-emerald-700 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                        <?= htmlspecialchars($p['category']) ?>
                    </span>
                    <span class="prod-discount absolute top-2.5 right-2.5 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm" style="<?= $hasDiscount ? '' : 'display:none;' ?>">
                        <?= $discountPct ?>% OFF
                    </span>
                </div>

                <!-- Product Info -->
                <div class="p-4 flex-1 flex flex-col justify-between">
                    <div>
                        <a href="/product/<?= urlencode($p['slug']) ?>">
                            <h3 class="font-bold text-gray-900 text-sm hover:text-emerald-700 transition-colors line-clamp-1">
                                <?= htmlspecialchars($p['name']) ?>
                            </h3>
                        </a>
                        <p class="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                            <?= htmlspecialchars($p['description']) ?>
                        </p>

                        <!-- Variation Selector Pills -->
                        <div class="mt-3">
                            <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Select Weight / Unit:</span>
                            <div class="flex flex-wrap gap-1.5">
                                <?php foreach ($p['variations'] as $vIdx => $v): 
                                    $isActiveVar = ($vIdx === 0);
                                    $vPrice = floatval($v['price']);
                                    $vMrp = floatval($v['mrp'] ?? $vPrice);
                                    $vStock = intval($v['stock']);
                                ?>
                                    <button 
                                        type="button"
                                        data-var-id="<?= $v['id'] ?>"
                                        onclick="selectVariation('<?= $cardId ?>', '<?= $v['id'] ?>', '<?= htmlspecialchars($v['label']) ?>', <?= $vPrice ?>, <?= $vMrp ?>, <?= $vStock ?>, '<?= htmlspecialchars($v['variantSku']) ?>')"
                                        class="var-pill text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all <?= $isActiveVar ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-500' ?>">
                                        <?= htmlspecialchars($v['label']) ?>
                                    </button>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    </div>

                    <!-- Price & Add to Cart -->
                    <div class="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                        <div>
                            <div class="flex items-baseline gap-1.5">
                                <span class="prod-price text-lg font-extrabold text-gray-900">₹<?= $defaultPrice ?></span>
                                <span class="prod-mrp text-xs text-gray-400 line-through" style="<?= $hasDiscount ? '' : 'display:none;' ?>">₹<?= $defaultMrp ?></span>
                            </div>
                            <div class="prod-stock text-[10px]">
                                <?php if ($isOutOfStock): ?>
                                    <span class="text-red-500 font-semibold">Out of Stock</span>
                                <?php elseif ($defaultVar['stock'] < 10): ?>
                                    <span class="text-amber-600 font-semibold">Only <?= $defaultVar['stock'] ?> left!</span>
                                <?php else: ?>
                                    <span class="text-emerald-700 font-semibold">In Stock</span>
                                <?php endif; ?>
                            </div>
                        </div>

                        <button 
                            type="button"
                            class="prod-add-btn px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm active:scale-95 <?= $isOutOfStock ? 'bg-gray-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' ?>"
                            <?= $isOutOfStock ? 'disabled' : '' ?>
                            data-var-id="<?= $defaultVar['id'] ?>"
                            data-var-label="<?= htmlspecialchars($defaultVar['label']) ?>"
                            data-var-price="<?= $defaultPrice ?>"
                            data-var-mrp="<?= $defaultMrp ?>"
                            data-var-stock="<?= $defaultVar['stock'] ?>"
                            data-var-sku="<?= htmlspecialchars($defaultVar['variantSku']) ?>"
                            onclick="App.addToCart('<?= $p['id'] ?>', this.getAttribute('data-var-id'), '<?= htmlspecialchars(addslashes($p['name'])) ?>', this.getAttribute('data-var-label'), this.getAttribute('data-var-price'), this.getAttribute('data-var-mrp'), '<?= htmlspecialchars($p['imageUrl']) ?>', this.getAttribute('data-var-sku'), this.getAttribute('data-var-stock'))">
                            <?= $isOutOfStock ? 'Out of Stock' : 'Add to Cart' ?>
                        </button>
                    </div>

                </div>
            </div>
        <?php endforeach; ?>
    </div>
</section>

<?php require_once BASE_DIR . '/views/layout/footer.php'; ?>
