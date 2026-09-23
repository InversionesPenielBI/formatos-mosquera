/* Service worker de "Formatos de Proceso - Mosquera".
   Dos trabajos:
   1. Hace que Chrome pueda instalar la página como aplicación.
   2. Guarda una copia de la página para que abra aunque el internet esté
      lento o caído (los datos sí necesitan internet).
   Siempre intenta primero la red: si hay versión nueva, esa se usa.
   Al publicar cambios grandes, sube el número de VERSION. */
const VERSION = 'formatos-v1';
const BASICOS = ['./', 'index.html', 'compartido/estilos.css', 'compartido/entorno.js',
                 'logo.png', 'logosl.png', 'manifest.webmanifest'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(VERSION).then(c => Promise.allSettled(BASICOS.map(u => c.add(u)))));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  // Solo la propia página: Google (cuentas, Sheets) nunca se guarda
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then(r => {
        const copia = r.clone();
        caches.open(VERSION).then(c => c.put(req, copia)).catch(() => {});
        return r;
      })
      .catch(() => caches.match(req).then(r => r || caches.match('index.html')))
  );
});
