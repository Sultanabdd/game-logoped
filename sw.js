const CACHE_NAME = 'roblox-logoped-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './game.js',
    './manifest.json',
    './assets/1.jpeg',
    './assets/2.jpeg',
    './assets/3.jpeg',
    './assets/4.jpeg',
    './assets/5.jpeg',
    './assets/6.jpeg',
    './assets/7.jpeg',
    './assets/8.jpeg',
    './assets/9.jpeg',
    './assets/10.jpeg',
    './assets/11.jpeg',
    './assets/12.jpeg',
    './assets/13.jpeg',
    './assets/14.jpeg',
    './assets/15.jpeg',
    './assets/16.jpeg',
    './assets/17.jpeg',
    './assets/18.jpeg',
    'https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&display=swap'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone).catch(() => {});
                    });
                }
                return networkResponse;
            }).catch(() => {
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
