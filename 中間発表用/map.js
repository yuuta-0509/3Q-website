if ("serviceWorker" in navigator) {
    console.log("test")
} else {
    console.log("err")
}

mapboxgl.accessToken = 'pk.eyJ1IjoieXV0bGF2cyIsImEiOiJjbTJ2ZHY1NG4wYTFoMmtva3JldnVnenphIn0.1oJ9gUkwzxggBA2d60cgHg';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11', // デフォルトスタイル
    center: [139.6917, 35.6895],
    zoom: 10
});

let currentMarker = null;

// 現在地の取得とズーム設定
navigator.geolocation.getCurrentPosition((position) => {
    map.setCenter([position.coords.longitude, position.coords.latitude]);
    map.setZoom(15);
}, (err) => {
    alert('現在位置の取得に失敗しました。'+ err);
    console.log(err.code, "space", err.message)
});

// 衛星画像切り替えボタンの作成
const satelliteToggle = document.createElement('button');
satelliteToggle.textContent = '衛星画像';
satelliteToggle.style.position = 'absolute';
satelliteToggle.style.top = '10px';
satelliteToggle.style.right = '10px';
satelliteToggle.style.padding = '10px';
satelliteToggle.style.zIndex = '999';
satelliteToggle.style.backgroundColor = 'white';
satelliteToggle.style.border = '1px solid #ddd';
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

// マップクリック時の処理（ピン追加）
map.on('click', (event) => {
    const clickedElement = event.originalEvent.target;
    
    // ピンがクリックされた場合は新しいピンを追加しない
    if (clickedElement.classList.contains('mapboxgl-marker')) {
        return;
    }

    const latitude = event.lngLat.lat;
    const longitude = event.lngLat.lng;

    const marker = new mapboxgl.Marker()
        .setLngLat([longitude, latitude])
        .addTo(map);

    marker.getElement().addEventListener('click', () => {
        currentMarker = marker;
        showInfoBox(latitude, longitude);
    });

    saveMarker(latitude, longitude, "防災ポイント");
});

// マーカー保存機能
function saveMarker(latitude, longitude, description) {
    fetch("save_marker.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `latitude=${latitude}&longitude=${longitude}&description=${encodeURIComponent(description)}`
    }).then(response => response.json())
      .then(data => console.log("保存成功: ", data))
      .catch(error => console.error("エラー: ", error));
}

// ピン情報表示用の情報ボックス
function showInfoBox(latitude, longitude) {
    const infoBox = document.getElementById('infoBox') || document.createElement('div');
    infoBox.id = 'infoBox';
    infoBox.style.position = 'absolute';
    infoBox.style.top = '50px';
    infoBox.style.right = '10px';
    infoBox.style.padding = '10px';
    infoBox.style.backgroundColor = 'white';
    infoBox.style.border = '1px solid #ddd';
    infoBox.innerHTML = `
        <h3>ピン情報</h3>
        <p>緯度: ${latitude}</p>
        <p>経度: ${longitude}</p>
        <button id="deleteBtn">削除</button>
    `;
    document.body.appendChild(infoBox);

    document.getElementById('deleteBtn').onclick = () => deleteMarker(latitude, longitude);
}

// マーカー削除機能
function deleteMarker(latitude, longitude) {
    if (confirm("このピンを削除しますか？")) {
        currentMarker.remove();

        fetch("delete_marker.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `latitude=${latitude}&longitude=${longitude}`
        }).then(response => response.json())
          .then(data => {
              alert("削除成功");
              document.getElementById('infoBox').remove();
          })
          .catch(error => console.error("エラー: ", error));
    }
}

// ページ読み込み時のマーカー表示
window.onload = function() {
    fetch("load_markers.php")
        .then(response => response.json())
        .then(data => {
            data.forEach(marker => {
                const mapMarker = new mapboxgl.Marker()
                    .setLngLat([marker.longitude, marker.latitude])
                    .addTo(map);

                mapMarker.getElement().addEventListener('click', () => {
                    currentMarker = mapMarker;
                    showInfoBox(marker.latitude, marker.longitude);
                });
            });
        })
        .catch(error => console.error("エラー: ", error));
};
