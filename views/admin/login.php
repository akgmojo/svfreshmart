<?php
if (!defined('APP_NAME')) exit;
if (AdminAuth::getCurrentAdmin()) {
    header('Location: /admin');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Portal Login | SV Fresh Mart</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body class="bg-gray-950 text-gray-100 min-h-screen flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl relative">
        <div class="text-center mb-8">
            <div class="w-14 h-14 bg-emerald-950 border border-emerald-800/80 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-lg shadow-emerald-950">
                <i data-lucide="shield-check" class="w-8 h-8"></i>
            </div>
            <h1 class="text-2xl font-black tracking-tight text-white">SV Fresh Mart Admin</h1>
            <p class="text-xs text-gray-400 mt-1">Authorized store management & inventory access only</p>
        </div>

        <form id="adminLoginForm" onsubmit="handleAdminLogin(event)" class="space-y-4">
            <div>
                <label class="block text-xs font-semibold text-gray-400 mb-1.5">Username</label>
                <div class="relative">
                    <i data-lucide="user" class="w-4 h-4 text-gray-500 absolute left-3.5 top-3"></i>
                    <input type="text" id="adminUser" required placeholder="admin" class="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                </div>
            </div>

            <div>
                <label class="block text-xs font-semibold text-gray-400 mb-1.5">Password</label>
                <div class="relative">
                    <i data-lucide="lock" class="w-4 h-4 text-gray-500 absolute left-3.5 top-3"></i>
                    <input type="password" id="adminPass" required placeholder="••••••••••••" class="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                </div>
            </div>

            <div id="loginError" class="p-3 bg-red-950/50 border border-red-800/50 rounded-xl text-xs text-red-400 hidden"></div>

            <button type="submit" id="adminLoginBtn" class="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-950 transition-all flex items-center justify-center gap-2">
                <span>Sign In to Dashboard</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </button>
        </form>

        <div class="mt-8 pt-6 border-t border-gray-800/80 text-center text-[11px] text-gray-500">
            <p>Role-Based Access Control • Server-Side Authorized</p>
            <p class="mt-1 text-gray-600">Default Super Admin: <strong>admin</strong> / <strong>admin@SVFresh2026!</strong></p>
        </div>
    </div>

    <script>
    if (window.lucide) lucide.createIcons();

    function handleAdminLogin(e) {
        e.preventDefault();
        const username = document.getElementById('adminUser').value.trim();
        const password = document.getElementById('adminPass').value.trim();
        const errBox = document.getElementById('loginError');
        const btn = document.getElementById('adminLoginBtn');

        btn.disabled = true;
        btn.innerText = 'Authenticating...';
        errBox.classList.add('hidden');

        fetch('/api/admin-auth.php?action=login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        .then(res => res.json())
        .then(data => {
            btn.disabled = false;
            btn.innerText = 'Sign In to Dashboard';

            if (data.success) {
                window.location.href = '/admin';
            } else {
                errBox.innerText = data.message || 'Invalid credentials';
                errBox.classList.remove('hidden');
            }
        })
        .catch(() => {
            btn.disabled = false;
            btn.innerText = 'Sign In to Dashboard';
            errBox.innerText = 'Network error. Please try again.';
            errBox.classList.remove('hidden');
        });
    }
    </script>
</body>
</html>
