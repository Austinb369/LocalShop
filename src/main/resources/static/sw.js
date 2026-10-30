/**
 * LocalShop PWA - Service Worker (sw.js)
 *
 * Estrategia: Network-First con fallback a caché.
 *   1. Intenta obtener el recurso de la red.
 *   2. Si tiene éxito, almacena en caché la respuesta fresca.
 *   3. Si la red falla (offline), devuelve la versión cacheada.
 *
 * En el evento 'install' se pre-cachean los recursos del App Shell.
 */

const CACHE_NAME    = 'localshop-pwa-v1';
const APP_SHELL_ASSETS = [
    '/',
    '/manifest.json',
    '/css/app.css',
    '/js/app.js',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css',
    '/images/icon-192.png',
    '/images/icon-512.png'
];

/* ============================================
   EVENTO INSTALL: Pre-cachear el App Shell
   ============================================ */
self.addEventListener('install', event => {
    console.log('[SW] Instalando Service Worker v1...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[SW] Pre-cacheando recursos del App Shell...');
            // addAll puede fallar si algún recurso falla; usamos add individual
            // para mayor resiliencia (p. ej. si CDN no está disponible).
            const cachePromises = APP_SHELL_ASSETS.map(url =>
                cache.add(url).catch(err =>
                    console.warn(`[SW] No se pudo cachear: ${url}`, err)
                )
            );
            return Promise.all(cachePromises);
        }).then(() => {
            console.log('[SW] App Shell cacheado correctamente ✅');
            // Fuerza la activación inmediata sin esperar otras pestañas
            return self.skipWaiting();
        })
    );
});

/* ============================================
   EVENTO ACTIVATE: Limpiar cachés antiguas
   ============================================ */
self.addEventListener('activate', event => {
    console.log('[SW] Activando Service Worker v1...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => {
                        console.log('[SW] Eliminando caché antigua:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => {
            console.log('[SW] Activado y caché limpiada ✅');
            // Toma el control inmediatamente de todas las páginas en alcance
            return self.clients.claim();
        })
    );
});

/* ============================================
   EVENTO FETCH: Estrategia Network-First
   ============================================ */
self.addEventListener('fetch', event => {
    // Solo interceptar peticiones GET
    if (event.request.method !== 'GET') return;

    // No interceptar peticiones a la consola H2 ni API de autenticación
    const url = new URL(event.request.url);
    if (url.pathname.startsWith('/h2-console')) return;

    event.respondWith(
        fetch(event.request)
            .then(networkResponse => {
                // Red disponible: clonar y cachear respuesta fresca
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                // Red no disponible: devolver desde caché
                console.log('[SW] Sin red, sirviendo desde caché:', event.request.url);
                return caches.match(event.request).then(cachedResponse => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // Si no hay caché tampoco, devolver respuesta de error amigable
                    if (event.request.headers.get('accept').includes('text/html')) {
                        return new Response(
                            `<!DOCTYPE html>
                            <html lang="es">
                            <head>
                                <meta charset="UTF-8">
                                <title>Sin conexión - LocalShop PWA</title>
                                <meta name="viewport" content="width=device-width, initial-scale=1">
                                <style>
                                    body { font-family: sans-serif; background: #0d0d1a; color: #f0f0ff;
                                           display: flex; align-items: center; justify-content: center;
                                           height: 100vh; margin: 0; text-align: center; }
                                    h1 { color: #6c63ff; } p { color: #a8a8c8; }
                                </style>
                            </head>
                            <body>
                                <div>
                                    <h1>📴 Sin conexión</h1>
                                    <p>No hay conexión a internet y este recurso no está en caché.</p>
                                    <p>Regresa cuando tengas conexión o abre la página principal.</p>
                                </div>
                            </body>
                            </html>`,
                            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
                        );
                    }
                });
            })
    );
});

console.log('[SW] Service Worker script parseado ✅');
