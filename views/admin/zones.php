<?php
if (!defined('APP_NAME')) exit;
$adminTitle = 'Bangalore Delivery Zones';
$adminSection = 'zones';
require_once BASE_DIR . '/views/admin/layout-header.php';

$zones = Database::getZones();
?>

<div class="space-y-6">
    <div class="flex items-center justify-between pb-4 border-b border-gray-800">
        <div>
            <h2 class="text-lg font-bold text-white">Bangalore Delivery Zones & Pincodes</h2>
            <p class="text-xs text-gray-400 mt-0.5">Configure delivery fees, free delivery threshold, and serviceable PIN codes</p>
        </div>
        <button onclick="openNewZoneModal()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950 flex items-center gap-1.5 transition-all">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>Add Bangalore Pincode</span>
        </button>
    </div>

    <!-- Zones Table -->
    <div class="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <table class="w-full text-left text-xs">
            <thead>
                <tr class="text-gray-400 border-b border-gray-800 bg-gray-950/40">
                    <th class="py-3 px-4">PIN Code</th>
                    <th class="py-3 px-4">Area / Locality</th>
                    <th class="py-3 px-4">Delivery Fee (₹)</th>
                    <th class="py-3 px-4">Free Delivery Over (₹)</th>
                    <th class="py-3 px-4">Min Order (₹)</th>
                    <th class="py-3 px-4">Status</th>
                    <th class="py-3 px-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-800/60 text-gray-300">
                <?php foreach ($zones as $z): ?>
                    <tr>
                        <td class="py-3 px-4 font-mono font-bold text-emerald-400"><?= htmlspecialchars($z['pincode']) ?></td>
                        <td class="py-3 px-4 font-bold text-white"><?= htmlspecialchars($z['areaName'] ?? 'Bangalore') ?></td>
                        <td class="py-3 px-4">₹<?= $z['deliveryFee'] ?? 35 ?></td>
                        <td class="py-3 px-4 text-emerald-300 font-semibold">₹<?= $z['freeDeliveryThreshold'] ?? 399 ?></td>
                        <td class="py-3 px-4">₹<?= $z['minOrderValue'] ?? 149 ?></td>
                        <td class="py-3 px-4">
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold <?= !empty($z['isServiceable']) ? 'bg-emerald-950 border border-emerald-800 text-emerald-300' : 'bg-red-950 border border-red-800 text-red-300' ?>">
                                <?= !empty($z['isServiceable']) ? 'Active (Deliverable)' : 'Inactive' ?>
                            </span>
                        </td>
                        <td class="py-3 px-4 text-right">
                            <button onclick="editZone('<?= $z['pincode'] ?>', '<?= htmlspecialchars(addslashes($z['areaName'] ?? '')) ?>', <?= $z['deliveryFee'] ?? 35 ?>, <?= $z['freeDeliveryThreshold'] ?? 399 ?>, <?= $z['minOrderValue'] ?? 149 ?>)" class="text-xs text-emerald-400 hover:underline">
                                Edit
                            </button>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<script>
function editZone(pincode, areaName, fee, threshold, minOrder) {
    const newFee = prompt(`Update delivery fee for ${pincode} (${areaName}):`, fee);
    if (newFee === null) return;

    fetch('/api/admin-zones.php?action=save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            zone: {
                pincode,
                areaName,
                deliveryFee: parseFloat(newFee),
                freeDeliveryThreshold: threshold,
                minOrderValue: minOrder,
                isServiceable: true
            }
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Zone updated successfully!');
            window.location.reload();
        }
    });
}

function openNewZoneModal() {
    const pin = prompt('Enter 6-digit Bangalore PIN code (e.g. 560102):');
    if (!pin || pin.length !== 6) return;
    const area = prompt('Enter Bangalore Area Name (e.g. HSR Layout Sector 2):');
    if (!area) return;

    fetch('/api/admin-zones.php?action=save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            zone: {
                pincode: pin,
                areaName: area,
                deliveryFee: 35,
                freeDeliveryThreshold: 399,
                minOrderValue: 149,
                isServiceable: true
            }
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Bangalore Zone added successfully!');
            window.location.reload();
        }
    });
}
</script>

<?php require_once BASE_DIR . '/views/admin/layout-footer.php'; ?>
