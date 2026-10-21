<?php
if (!defined('APP_NAME')) exit;
?>
        </main>
    </div>

    <script>
    if (window.lucide) lucide.createIcons();

    function handleAdminLogout() {
        fetch('/api/admin-auth.php?action=logout')
            .then(() => {
                window.location.href = '/admin/login';
            });
    }
    </script>
</body>
</html>
