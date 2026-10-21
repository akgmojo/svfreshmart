<?php
if (!defined('APP_NAME')) exit;
$selectedCategory = $_GET['category'] ?? 'All';
$searchQuery = trim($_GET['search'] ?? '');

$pageTitle = 'Shop Fresh Vegetables & Staples | ' . APP_NAME;
$pageDescription = 'Browse all daily vegetables, greens, chillies, and groceries for fast home delivery in Bangalore.';
require_once BASE_DIR . '/views/layout/header.php';

$allProducts = Database::getProducts(true);

// Filter category
if (!empty($selectedCategory) && $selectedCategory !== 'All') {
    $allProducts = array_values(array_filter($allProducts, function($p) use ($selectedCategory) {
        $cSlug = strtolower(str_replace(' ', '-', $p['category'] ?? ''));
        $targetSlug = strtolower(str_replace(' ', '-', $selectedCategory));
        return $cSlug === $targetSlug || strcasecmp($p['category'] ?? '', $selectedCategory) === 0;
    }));
}

// Search filter
if (!empty($searchQuery)) {
    $q = mb_strtolower($searchQuery);
    $allProducts = array_values(array_filter($allProducts, function($p) use ($q) {
        return strpos(mb_strtolower($p['name'] ?? ''), $q) !== false ||
               strpos(mb_strtolower($p['productSku'] ?? ''), $q) !== false ||
               strpos(mb_strtolower($p['category'] ?? ''), $q) !== false;
    }));
}
?>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    
    <!-- Breadcrumb & Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
            <div class="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <a href="/" class="hover:text-emerald-700">Home</a>
                <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
                <span class="text-gray-900 font-medium">Shop</span>
                <?php if ($selectedCategory !== 'All'): ?>
                    <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
                    <span class="text-emerald-700 font-bold"><?= htmlspecialchars(ucwords(str_replace('-', ' ', $selectedCategory))) ?></span>
                <?php endif; ?>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                <?= htmlspecialchars(!empty($searchQuery) ? "Search Results for '{$searchQuery}'" : ($selectedCategory !== 'All' ? ucwords(str_replace('-', ' ', $selectedCategory)) : 'All Fresh Grocery Items')) ?>
            </h1>
        </div>
        <span class="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
            Showing <?= count($allProducts) ?> items
        </span>
    </div>

    <!-- Category Nav Filter Tabs -->
    <div class="py-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <a href="/shop" class="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all <?= ($selectedCategory === 'All') ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-gray-700 border border-gray-200 hover:border-emerald-300' ?>">
            All Items
        </a>
        <?php foreach ($categories as $cat): 
            $catSlug = strtolower(str_replace(' ', '-', $cat));
            $isActive = (strtolower(str_replace(' ', '-', $selectedCategory)) === $catSlug);
        ?>
            <a href="/shop?category=<?= urlencode($catSlug) ?>" class="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all <?= $isActive ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-gray-700 border border-gray-200 hover:border-emerald-300' ?>">
                <?= htmlspecialchars($cat) ?>
            </a>
        <?php endforeach; ?>
    </div>

    <!-- Product Grid -->
    <?php if (empty($allProducts)): ?>
        <div class="py-16 text-center bg-white rounded-2xl border border-gray-200 my-6">
            <i data-lucide="search-x" class="w-16 h-16 mx-auto text-gray-300 mb-3"></i>
            <h3 class="text-base font-bold text-gray-800">No matching products found</h3>
            <p class="text-xs text-gray-500 mt-1 max-w-sm mx-auto">Try searching for other items like green chilli, coconut, tomato, or clear your filters.</p>
            <a href="/shop" class="mt-4 inline-block px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm">View All Products</a>
        </div>
    <?php else: ?>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-6">
            <?php foreach ($allProducts as $p): 
                $defaultVar = $p['variations'][0] ?? null;
                if (!$defaultVar) continue;
                $cardId = 'shop-prod-' . $p['id'];
                $defaultPrice = floatval($defaultVar['price']);
                $defaultMrp = floatval($defaultVar['mrp'] ?? $defaultPrice);
                $hasDiscount = ($defaultMrp > $defaultPrice);
                $discountPct = $hasDiscount ? round((($defaultMrp - $defaultPrice) / $defaultMrp) * 100) : 0;
                $isOutOfStock = ($defaultVar['stock'] <= 0);
            ?>
                <div id="<?= $cardId ?>" class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
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
                                <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Weight / Unit:</span>
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
    <?php endif; ?>
</div>

<?php require_once BASE_DIR . '/views/layout/footer.php'; ?>
