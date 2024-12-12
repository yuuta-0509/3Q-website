<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$host = 'mysql310.phy.lolipop.lan';
$username = 'LAA1533835';
$password = '7dwswQRd6epu';
$dbname = 'LAA1533835-message';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $pdo->query("SELECT latitude, longitude, description FROM markers");
    $markers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($markers);
} catch (PDOException $e) {
    echo json_encode(["error" => "データベース接続エラー: " . $e->getMessage()]);
}
