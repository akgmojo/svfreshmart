<?php
if (!defined('APP_NAME')) exit;
$adminTitle = 'Product Catalog & Variation Management';
$adminSection = 'products';
require_once BASE_DIR . '/views/admin/layout-header.php';

$products = Database::getProducts(false); // get all products including inactive
?>

<div class="space-y-6">
    <div class="flex items-center justify-between pb-4 border-b border-gray-800">
        <div>
            <h2 class="text-lg font-bold text-white">Product Catalogue & Variations</h2>
            <p class="text-xs text-gray-400 mt-0.5">Manage weight/unit variations, prices, MRP, and inventory stock</p>
        </div>
        <button onclick="openProductModal()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950 flex items-center gap-1.5 transition-all">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>Add New Product</span>
        </button>
    </div>

    <!-- Products Accordion / List -->
    <div class="space-y-4">
        <?php foreach ($products as $p): ?>
            <div class="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-sm">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800/80">
                    <div class="flex items-center gap-3">
                        <img src="<?= htmlspecialchars($p['imageUrl']) ?>" alt="<?= htmlspecialchars($p['name']) ?>" class="w-12 h-12 rounded-xl object-cover bg-gray-800 flex-shrink-0">
                        <div>
                            <h3 class="text-sm font-bold text-white"><?= htmlspecialchars($p['name']) ?></h3>
                            <p class="text-xs text-gray-400 font-mono">Product SKU: <strong class="text-emerald-400"><?= htmlspecialchars($p['productSku']) ?></strong> • Category: <?= htmlspecialchars($p['category']) ?></p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="px-2.5 py-1 rounded-full text-xs font-bold <?= !empty($p['isActive']) ? 'bg-emerald-950 border border-emerald-800 text-emerald-300' : 'bg-red-950 border border-red-800 text-red-300' ?>">
                            <?= !empty($p['isActive']) ? 'Active' : 'Inactive' ?>
                        </span>
                        <button onclick="toggleProductStatus('<?= $p['id'] ?>')" class="text-xs text-gray-400 hover:text-white underline">
                            Toggle Status
                        </button>
                    </div>
                </div>

                <!-- Variations Table -->
                <div class="mt-4 overflow-x-auto">
                    <table class="w-full text-left text-xs">
                        <thead>
                            <tr class="text-gray-400 border-b border-gray-800/60 pb-2">
                                <th class="py-2 px-2">Variant SKU</th>
                                <th class="py-2 px-2">Weight / Unit</th>
                                <th class="py-2 px-2">Selling Price (₹)</th>
                                <th class="py-2 px-2">MRP (₹)</th>
                                <th class="py-2 px-2">Stock Qty</th>
                                <th class="py-2 px-2">Status</th>
                                <th class="py-2 px-2 text-right">Quick Save</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-800/40 text-gray-300">
                            <?php foreach ($p['variations'] as $v): ?>
                                <tr id="var-row-<?= $v['id'] ?>">
                                    <td class="py-2 px-2 font-mono font-bold text-white"><?= htmlspecialchars($v['variantSku']) ?></td>
                                    <td class="py-2 px-2 text-emerald-400 font-semibold"><?= htmlspecialchars($v['label']) ?></td>
                                    <td class="py-2 px-2">
                                        <input type="number" step="0.5" id="price-<?= $v['id'] ?>" value="<?= $v['price'] ?>" class="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-xs font-bold">
                                    </td>
                                    <td class="py-2 px-2">
                                        <input type="number" step="0.5" id="mrp-<?= $v['id'] ?>" value="<?= $v['mrp'] ?>" class="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-xs">
                                    </td>
                                    <td class="py-2 px-2">
                                        <input type="number" id="stock-<?= $v['id'] ?>" value="<?= $v['stock'] ?>" class="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-xs font-bold">
                                    </td>
                                    <td class="py-2 px-2">
                                        <span class="text-[11px] font-semibold <?= ($v['stock'] > 0) ? 'text-emerald-400' : 'text-red-400' ?>">
                                            <?= ($v['stock'] > 0) ? 'In Stock' : 'Out of Stock' ?>
                                        </span>
                                    </td>
                                    <td class="py-2 px-2 text-right">
                                        <button onclick="saveVariationQuick('<?= $p['id'] ?>', '<?= $v['id'] ?>')" class="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[11px] font-bold transition-colors">
                                            Save
                                        </button>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</div>

<script>
function toggleProductStatus(id) {
    fetch('/api/admin-products.php?action=toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            window.location.reload();
        }
    });
}

function saveVariationQuick(productId, variationId) {
    const price = parseFloat(document.getElementById(`price-${variationId}`).value);
    const mrp = parseFloat(document.getElementById(`mrp-${variationId}`).value);
    const stock = parseInt(document.getElementById(`stock-${variationId}`).value);

    // Fetch full product first, modify variation, save back
    fetch(`/api/products.php?id=${productId}`)
        .then(res => res.json())
        .then(data => {
            if (data.success && data.product) {
                const prod = data.product;
                const targetVar = prod.variations.find(v => v.id === variationId);
                if (targetVar) {
                    targetVar.price = price;
                    targetVar.mrp = mrp;
                    targetVar.stock = stock;

                    fetch('/api/admin-products.php?action=save', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ product: prod })
                    })
                    .then(r => r.json())
                    .then(resData => {
                        if (resData.success) {
                            alert('Variation updated successfully!');
                        } else {
                            alert('Failed to update variation: ' + (resData.message || 'Error'));
                        }
                    });
                }
            }
        });
}
</script>

<?php require_once BASE_DIR . '/views/admin/layout-footer.php'; ?>
