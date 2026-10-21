<?php
require_once __DIR__ . '/../config.php';
header('Content-Type: application/json');

$action = $_GET['action'] ?? $_POST['action'] ?? '';
$input = json_decode(file_get_contents('php://input'), true) ?? [];

switch ($action) {
    case 'login':
        $username = $_POST['username'] ?? $input['username'] ?? '';
        $password = $_POST['password'] ?? $input['password'] ?? '';
        $res = AdminAuth::login($username, $password);
        if (!$res['success']) {
            http_response_code(401);
        }
        echo json_encode($res);
        break;

    case 'me':
        $user = AdminAuth::getCurrentAdmin();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['authenticated' => false]);
        } else {
            echo json_encode(['authenticated' => true, 'user' => $user]);
        }
        break;

    case 'logout':
        echo json_encode(AdminAuth::logout());
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'Invalid action']);
        break;
}
