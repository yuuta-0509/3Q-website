const CACHE_NAME = 'dynamic-cache-v1';

// インストール時に基本的なリソースをキャッシュ
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                '/',
                'index.html',
                'styles.css',
                'map.js',
                'app_icon.png',
            ]);
        })
    );
});

// フェッチイベントの処理
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // 成功したリクエストをキャッシュに追加
                const clonedResponse = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, clonedResponse);
                });
                return response;
            })
            .catch(() => {
                // ネットワークエラー時にキャッシュから取得
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    } else {
                        // キャッシュがない場合は何もしない
                        return new Response('オフライン状態でデータを取得できません。', {
                            status: 503,
                            statusText: 'Service Unavailable',
                        });
                    }
                });
            })
    );
});
