const CACHE_NAME = 'wa-kontak-app-v1';

// Daftar semua file yang akan disimpan agar bisa dibuka offline
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Pasang Service Worker dan simpan aset
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Hapus cache lama saat ada pembaruan
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
                  .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Tangani permintaan jaringan
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Tampilkan dari cache jika ada, jika tidak ambil dari jaringan
        return cachedResponse || fetch(event.request)
          .then(networkResponse => {
            // Simpan aset baru ke cache
            if (event.request.method === 'GET' && event.request.url.startsWith('http')) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Jika jaringan mati dan file tidak ada di cache
            if (event.request.destination === 'document') {
              return new Response('<h1>Aplikasi dalam mode offline</h1>', {
                headers: { 'Content-Type': 'text/html' }
              });
            }
          });
      })
  );
});
