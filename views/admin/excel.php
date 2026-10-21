<?php
if (!defined('APP_NAME')) exit;
$adminTitle = 'Excel Bulk Catalogue Operations';
$adminSection = 'excel';
require_once BASE_DIR . '/views/admin/layout-header.php';
?>

<div class="space-y-6">
    <div class="flex items-center justify-between pb-4 border-b border-gray-800">
        <div>
            <h2 class="text-lg font-bold text-white">Excel Bulk Catalogue Management</h2>
            <p class="text-xs text-gray-400 mt-0.5">Download current catalogue template, edit prices & stock, validate, preview changes, and commit updates</p>
        </div>
        <a href="/api/admin-excel.php?action=template" class="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950 flex items-center gap-1.5 transition-all">
            <i data-lucide="download" class="w-4 h-4"></i>
            <span>Download CSV Template</span>
        </a>
    </div>

    <!-- Upload Card -->
    <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 class="text-sm font-bold text-white flex items-center gap-2">
            <i data-lucide="upload" class="w-4 h-4 text-emerald-400"></i>
            <span>Upload Edited Catalogue (CSV)</span>
        </h3>
        
        <p class="text-xs text-gray-400 leading-relaxed">
            Columns supported: <code class="text-emerald-400">Product SKU, Variant SKU, Product Name, Quantity, Unit, Selling Price, MRP, Stock Quantity, Stock Status, Product Status, Category, Image URL</code>.
            Supported units: <code class="text-emerald-400">g, kg, ml, L, piece, pieces, pack, box, bundle, bottle, jar</code>.
        </p>

        <div class="flex items-center gap-4">
            <input type="file" id="catalogueFileInput" accept=".csv" class="text-xs text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-700 file:text-white hover:file:bg-emerald-600">
            <button onclick="handleValidateCatalogue()" id="validateBtn" class="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-bold transition-colors">
                Validate & Preview Diff
            </button>
        </div>

        <div id="validationStatus" class="hidden p-4 rounded-xl text-xs"></div>
    </div>

    <!-- Diff Preview Container -->
    <div id="diffContainer" class="hidden bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-gray-800">
            <div>
                <h3 class="text-sm font-bold text-white">Preview Catalogue Modifications</h3>
                <p class="text-xs text-gray-400 mt-0.5" id="diffSummaryText">Review price and inventory changes before updating live store</p>
            </div>
            <button onclick="handleCommitCatalogue()" id="commitBtn" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950 transition-all">
                Confirm & Apply Changes to Database
            </button>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
                <thead>
                    <tr class="text-gray-400 border-b border-gray-800 bg-gray-950/40">
                        <th class="py-2.5 px-3">Type</th>
                        <th class="py-2.5 px-3">Variant SKU</th>
                        <th class="py-2.5 px-3">Item Name</th>
                        <th class="py-2.5 px-3">Old Price</th>
                        <th class="py-2.5 px-3">New Price</th>
                        <th class="py-2.5 px-3">Old Stock</th>
                        <th class="py-2.5 px-3">New Stock</th>
                    </tr>
                </thead>
                <tbody id="diffTableBody" class="divide-y divide-gray-800/60 text-gray-300">
                    <!-- Injected dynamically -->
                </tbody>
            </table>
        </div>
    </div>
</div>

<script>
let parsedRows = [];

function handleValidateCatalogue() {
    const fileInput = document.getElementById('catalogueFileInput');
    const statusBox = document.getElementById('validationStatus');
    const diffContainer = document.getElementById('diffContainer');
    const diffBody = document.getElementById('diffTableBody');

    if (!fileInput.files || fileInput.files.length === 0) {
        alert('Please choose a CSV file first');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const text = e.target.result;
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        if (lines.length < 2) {
            alert('File contains no data rows');
            return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        parsedRows = [];

        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
            if (cols.length >= 8) {
                const rowObj = {};
                headers.forEach((h, idx) => {
                    rowObj[h] = cols[idx] || '';
                });
                parsedRows.push(rowObj);
            }
        }

        // Send to backend validation
        fetch('/api/admin-excel.php?action=validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rows: parsedRows })
        })
        .then(res => res.json())
        .then(data => {
            statusBox.classList.remove('hidden');
            if (data.success) {
                statusBox.className = 'p-4 rounded-xl text-xs bg-emerald-950/60 border border-emerald-800 text-emerald-300';
                statusBox.innerHTML = `✅ Validation Passed: ${data.validRows} rows ready. ${data.warnings.length} warnings.`;

                // Render diffs
                diffContainer.classList.remove('hidden');
                document.getElementById('diffSummaryText').innerText = `${data.diffs.length} variations evaluated`;
                
                diffBody.innerHTML = data.diffs.map(d => {
                    const priceChanged = (d.oldPrice !== d.newPrice);
                    const stockChanged = (d.oldStock !== d.newStock);
                    return `
                        <tr class="hover:bg-gray-800/40">
                            <td class="py-2 px-3 font-bold ${d.type === 'NEW' ? 'text-emerald-400' : 'text-blue-400'}">${d.type}</td>
                            <td class="py-2 px-3 font-mono font-bold text-white">${d.sku}</td>
                            <td class="py-2 px-3">${d.name}</td>
                            <td class="py-2 px-3">${d.oldPrice !== null ? `₹${d.oldPrice}` : '-'}</td>
                            <td class="py-2 px-3 ${priceChanged ? 'text-amber-400 font-bold' : ''}">₹${d.newPrice}</td>
                            <td class="py-2 px-3">${d.oldStock !== null ? d.oldStock : '-'}</td>
                            <td class="py-2 px-3 ${stockChanged ? 'text-emerald-400 font-bold' : ''}">${d.newStock}</td>
                        </tr>
                    `;
                }).join('');
            } else {
                statusBox.className = 'p-4 rounded-xl text-xs bg-red-950/60 border border-red-800 text-red-300';
                statusBox.innerHTML = `❌ Validation Errors (${data.errors.length}):<br>` + data.errors.join('<br>');
                diffContainer.classList.add('hidden');
            }
        });
    };

    reader.readAsText(file);
}

function handleCommitCatalogue() {
    if (!confirm('Are you sure you want to commit these catalogue changes to the live store database?')) {
        return;
    }

    const btn = document.getElementById('commitBtn');
    btn.disabled = true;
    btn.innerText = 'Applying Updates...';

    fetch('/api/admin-excel.php?action=commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: parsedRows })
    })
    .then(res => res.json())
    .then(data => {
        btn.disabled = false;
        btn.innerText = 'Confirm & Apply Changes to Database';
        if (data.success) {
            alert(data.message);
            window.location.reload();
        } else {
            alert('Failed to commit updates: ' + (data.message || 'Error'));
        }
    });
}
</script>

<?php require_once BASE_DIR . '/views/admin/layout-footer.php'; ?>
