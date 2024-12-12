mapboxgl.accessToken = 'pk.eyJ1IjoieXV0bGF2cyIsImEiOiJjbTJ2ZHY1NG4wYTFoMmtva3JldnVnenphIn0.1oJ9gUkwzxggBA2d60cgHg';
const map = new mapboxgl.Map({
    container: 'map',  // 地図を表示するdivのID
    style: 'mapbox://styles/mapbox/streets-v11',  // ベースの地図スタイル
    center: [139.6917, 35.6895],  // 初期表示位置（東京）
    zoom: 10  // ズームレベル
});

// 共通スタイルの設定
const buttonStyle = {
    position: 'absolute',
    padding: '10px',
    zIndex: '999',
    backgroundColor: 'white',  // ボタンの背景色
    color: 'black',  // 文字色
    border: '1px solid #ddd',  // ボーダー
    borderRadius: '5px',  // 角丸
    cursor: 'pointer',  // カーソル
};

// 衛星画像切り替えボタン
const satelliteToggle = document.createElement('button');
satelliteToggle.textContent = '衛星画像';
satelliteToggle.style.top = '90px';
satelliteToggle.style.left = '10px';
Object.assign(satelliteToggle.style, buttonStyle);
satelliteToggle.addEventListener('click', () => {
    const currentStyle = map.getStyle().sprite;
    if (currentStyle.includes('streets-v11')) {
        map.setStyle('mapbox://styles/mapbox/satellite-v9');
        satelliteToggle.textContent = '通常地図';
    } else {
        map.setStyle('mapbox://styles/mapbox/streets-v11');
        satelliteToggle.textContent = '衛星画像';
    }
});
document.body.appendChild(satelliteToggle);

// 現在位置を取得して地図の中心を設定
navigator.geolocation.getCurrentPosition(
    (position) => {
        const { longitude, latitude } = position.coords;
        map.setCenter([longitude, latitude]);
        new mapboxgl.Marker() // 現在位置をマーカーで表示
            .setLngLat([longitude, latitude])
            .addTo(map);
    },
    (error) => {
        console.error('現在位置の取得に失敗しました:', error);
    },
    {
        enableHighAccuracy: true, // 高精度モード
    }
);

// 2地点間の距離を計算する関数（Haversine式）
function calculateDistance(lon1, lat1, lon2, lat2) {
    const R = 6371; // 地球の半径（km）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // 距離（km）
}

// 現在位置を取得して表示範囲を制限
navigator.geolocation.getCurrentPosition(
    (position) => {
        const currentLon = position.coords.longitude;
        const currentLat = position.coords.latitude;

        // 地図の中心を現在位置に設定
        map.setCenter([currentLon, currentLat]);
        map.setZoom(12); // ズームレベルを適切に設定

        // 半径15kmの移動可能範囲を計算
        const bounds = calculateBounds(currentLat, currentLon, 15); // 15km以内の範囲を計算

        // 地図の移動範囲を制限
        map.setMaxBounds(bounds);

        // マーカーを現在位置に追加
        new mapboxgl.Marker().setLngLat([currentLon, currentLat]).addTo(map);
    },
    (error) => {
        console.error('現在位置の取得に失敗しました:', error);
    },
    {
        enableHighAccuracy: true, // 高精度モード
    }
);

// 半径を基に移動可能範囲を計算する関数
function calculateBounds(lat, lon, radius) {
    const R = 6371; // 地球の半径（km）
    const latRad = lat * Math.PI / 180;
    const lonRad = lon * Math.PI / 180;

    // 半径を緯度、経度の範囲に変換
    const deltaLat = radius / R;
    const deltaLon = radius / (R * Math.cos(latRad));

    // 緯度経度の上下左右の範囲を計算
    const minLat = lat - deltaLat * 180 / Math.PI;
    const maxLat = lat + deltaLat * 180 / Math.PI;
    const minLon = lon - deltaLon * 180 / Math.PI;
    const maxLon = lon + deltaLon * 180 / Math.PI;

    return [[minLon, minLat], [maxLon, maxLat]]; // [西端、南端] と [東端、北端] の範囲
}

// リロードボタンを作成
const reloadButton = document.createElement('button');
reloadButton.textContent = '再読み込み';
reloadButton.style.top = '90px';
reloadButton.style.left = '90px';
Object.assign(reloadButton.style, buttonStyle);

// ボタンがクリックされたときにページをリロード
reloadButton.addEventListener('click', () => {
    location.reload();  // ページをリロード
});

// ボタンをページに追加
document.body.appendChild(reloadButton);
