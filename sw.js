// Service Worker para CEIN - Centro de Negocios e Inversiones
// Version 1.0.0

const CACHE_NAME = 'cein-cache-v1';
const RUNTIME_CACHE = 'cein-runtime-v1';

// Archivos críticos para cachear durante la instalación
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/init.js',
  '/images/logo.png',
  '/manifest.json'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching recursos');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[Service Worker] Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de fetch: Network First con fallback a Cache
self.addEventListener('fetch', (event) => {
  // Solo cachear peticiones GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignorar peticiones a APIs externas (Supabase, Google Analytics, etc.)
  const url = new URL(event.request.url);
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('googletagmanager.com') ||
    url.hostname.includes('google-analytics.com') ||
    url.hostname.includes('pravatar.cc')
  ) {
    return;
  }

  event.respondWith(
    caches.open(RUNTIME_CACHE).then((cache) => {
      return fetch(event.request)
        .then((response) => {
          // Cachear respuestas exitosas
          if (response && response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        })
        .catch(() => {
          // Si falla la red, intentar obtener del cache
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }

            // Si no está en cache, devolver página offline para navegación
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
        });
    })
  );
});

// Listener para mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
