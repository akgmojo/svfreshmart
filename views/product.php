<?php
if (!defined('APP_NAME')) exit;

$slug = $routeParams['slug'] ?? '';
$product = Database::getProductBySlug($slug);

if (!$product) {
    http_response_code(404);
    $pageTitle = 'Product Not Found | ' . APP_NAME;
    require_once BASE_DIR . '/views/layout/header.php';
    echo '<div class="py-20 text-center"><h2 class="text-2xl font-bold text-gray-800">Product Not Found</h2><p class="text-sm text-gray-500 mt-2">The requested vegetable or item is no longer available.</p><a href="/shop" class="mt-4 inline-block px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold">Browse Catalog</a></div>';
    require_once BASE_DIR . '/views/layout/footer.php';
    exit;
}

$defaultVar = $product['variations'][0] ?? null;
$defaultPrice = floatval($defaultVar['price'] ?? 0);
$defaultMrp = floatval($defaultVar['mrp'] ?? $defaultPrice);
$hasDiscount = ($defaultMrp > $defaultPrice);
$discountPct = $hasDiscount ? round((($defaultMrp - $defaultPrice) / $defaultMrp) * 100) : 0;
$isOutOfStock = empty($defaultVar['stock']) || $defaultVar['stock'] <= 0;

$pageTitle = htmlspecialchars($product['name']) . ' - Buy Online in Bangalore | ' . APP_NAME;
$pageDescription = htmlspecialchars($product['description']);

require_once BASE_DIR . '/views/layout/header.php';
?>

<!-- Schema.org Product JSON-LD for Rich Snippets -->
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": <?= json_encode($product['name']) ?>,
  "image": [<?= json_encode($product['imageUrl']) ?>],
  "description": <?= json_encode($product['description']) ?>,
  "sku": <?= json_encode($defaultVar['variantSku'] ?? $product['productSku']) ?>,
  "offers": {
    "@type": "Offer",
    "url": "https://svfreshmart.com/product/<?= urlencode($product['slug']) ?>",
    "priceCurrency": "INR",
    "price": "<?= $defaultPrice ?>",
    "availability": "<?= $isOutOfStock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock' ?>",
    "itemCondition": "https://schema.org/NewCondition"
  }
}
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <a href="/" class="hover:text-emerald-700">Home</a>
        <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
        <a href="/shop" class="hover:text-emerald-700">Shop</a>
        <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
        <a href="/category/<?= urlencode(strtolower(str_replace(' ', '-', $product['category']))) ?>" class="hover:text-emerald-700"><?= htmlspecialchars($product['category']) ?></a>
        <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
        <span class="text-gray-900 font-medium truncate"><?= htmlspecialchars($product['name']) ?></span>
    </div>

    <div id="single-product-wrapper" class="grid grid-cols-1 md:grid-cols-2 gap-10 items-start bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm">
        
        <!-- Image Box -->
        <div class="relative bg-gray-50 rounded-2xl overflow-hidden aspect-square border border-gray-100 flex items-center justify-center">
            <img src="<?= htmlspecialchars($product['imageUrl']) ?>" alt="<?= htmlspecialchars($product['name']) ?>" class="w-full h-full object-cover">
            <span class="absolute top-4 left-4 bg-emerald-700 text-white text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full shadow-md">
                <?= htmlspecialchars($product['category']) ?>
            </span>
            <span class="prod-discount absolute top-4 right-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md" style="<?= $hasDiscount ? '' : 'display:none;' ?>">
                <?= $discountPct ?>% OFF
            </span>
        </div>

        <!-- Product Details -->
        <div>
            <span class="text-xs font-bold uppercase tracking-wider text-emerald-700">Farm Fresh Bangalore</span>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
                <?= htmlspecialchars($product['name']) ?>
            </h1>
            <p class="text-xs text-gray-400 mt-0.5">SKU: <span id="currentSkuDisplay" class="font-mono"><?= htmlspecialchars($defaultVar['variantSku'] ?? $product['productSku']) ?></span></p>

            <!-- Price Container -->
            <div class="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                <div>
                    <div class="flex items-baseline gap-2">
                        <span class="prod-price text-3xl font-extrabold text-gray-900">₹<?= $defaultPrice ?></span>
                        <span class="prod-mrp text-sm text-gray-400 line-through" style="<?= $hasDiscount ? '' : 'display:none;' ?>">₹<?= $defaultMrp ?></span>
                    </div>
                    <p class="text-[11px] text-gray-500 mt-0.5">Inclusive of all local taxes</p>
                </div>
                <div class="prod-stock text-right">
                    <?php if ($isOutOfStock): ?>
                        <span class="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Out of Stock</span>
                    <?php elseif ($defaultVar['stock'] < 10): ?>
                        <span class="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Only <?= $defaultVar['stock'] ?> left!</span>
                    <?php else: ?>
                        <span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">In Stock (Farm Fresh)</span>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Variation Selector -->
            <div class="mt-6">
                <label class="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                    Choose Pack Size / Weight:
                </label>
                <div class="flex flex-wrap gap-2">
                    <?php foreach ($product['variations'] as $vIdx => $v): 
                        $isActive = ($vIdx === 0);
                        $vPrice = floatval($v['price']);
                        $vMrp = floatval($v['mrp'] ?? $vPrice);
                        $vStock = intval($v['stock']);
                    ?>
                        <button 
                            type="button"
                            data-var-id="<?= $v['id'] ?>"
                            onclick="selectSingleProductVar('<?= $v['id'] ?>', '<?= htmlspecialchars($v['label']) ?>', <?= $vPrice ?>, <?= $vMrp ?>, <?= $vStock ?>, '<?= htmlspecialchars($v['variantSku']) ?>')"
                            class="var-pill px-4 py-2 rounded-xl text-xs font-bold border transition-all <?= $isActive ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-500' ?>">
                            <?= htmlspecialchars($v['label']) ?> - ₹<?= $vPrice ?>
                        </button>
                    <?php endforeach; ?>
                </div>
            </div>

            <!-- Description -->
            <div class="mt-6">
                <h4 class="text-xs font-bold uppercase tracking-wider text-gray-900 mb-1.5">Description & Origin</h4>
                <p class="text-sm text-gray-600 leading-relaxed">
                    <?= nl2br(htmlspecialchars($product['description'])) ?>
                </p>
            </div>

            <!-- Delivery Guarantees -->
            <div class="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 space-y-2 text-xs text-emerald-900">
                <div class="flex items-center gap-2">
                    <i data-lucide="truck" class="w-4 h-4 text-emerald-700"></i>
                    <span>Delivery in Bangalore within <strong>2-4 Hours</strong></span>
                </div>
                <div class="flex items-center gap-2">
                    <i data-lucide="refresh-cw" class="w-4 h-4 text-emerald-700"></i>
                    <span>No questions asked replacement on doorstep inspection</span>
                </div>
            </div>

            <!-- Action CTA -->
            <div class="mt-6 pt-6 border-t border-gray-100 flex items-center gap-4">
                <button 
                    type="button"
                    id="singleAddBtn"
                    class="flex-1 py-3.5 px-6 rounded-xl font-bold text-sm text-white transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 <?= $isOutOfStock ? 'bg-gray-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' ?>"
                    <?= $isOutOfStock ? 'disabled' : '' ?>
                    data-var-id="<?= $defaultVar['id'] ?>"
                    data-var-label="<?= htmlspecialchars($defaultVar['label']) ?>"
                    data-var-price="<?= $defaultPrice ?>"
                    data-var-mrp="<?= $defaultMrp ?>"
                    data-var-stock="<?= $defaultVar['stock'] ?>"
                    data-var-sku="<?= htmlspecialchars($defaultVar['variantSku']) ?>"
                    onclick="App.addToCart('<?= $product['id'] ?>', this.getAttribute('data-var-id'), '<?= htmlspecialchars(addslashes($product['name'])) ?>', this.getAttribute('data-var-label'), this.getAttribute('data-var-price'), this.getAttribute('data-var-mrp'), '<?= htmlspecialchars($product['imageUrl']) ?>', this.getAttribute('data-var-sku'), this.getAttribute('data-var-stock'))">
                    <i data-lucide="shopping-bag" class="w-5 h-5"></i>
                    <span><?= $isOutOfStock ? 'Out of Stock' : 'Add to Basket' ?></span>
                </button>
            </div>
        </div>
    </div>
</div>

<script>
function selectSingleProductVar(varId, label, price, mrp, stock, sku) {
    selectVariation('single-product-wrapper', varId, label, price, mrp, stock, sku);
    const skuDisplay = document.getElementById('currentSkuDisplay');
    if (skuDisplay) skuDisplay.innerText = sku;
}
</script>

<?php require_once BASE_DIR . '/views/layout/footer.php'; ?>
