/// <reference lib="esnext" />
/// <reference lib="webworker" /> 

// STATE

const version = 'uf094';
const cacheName = `pwa-cache:${version}`;

// EVENTS

self.addEventListener('install', event => {
  console.log('PWA Installed', version, event);

  startCache(event);

  // Optionally install new service-worker.js immediately
  // self.skipwaiting();
});

self.addEventListener('activate', event => {
  console.log('PWA Active', event);

  dropOldCache(event);

  // Optionally activate new service-worker.js immediately
  // event.waitUntil(self.clients.claim())
});

self.addEventListener('fetch', event => {
  // console.log('PWA Fetch', event.request.url);
  fetchFromCache(event);
});

self.addEventListener('message', event => {
  sendMessage(`pwa:pong:${version}`);
});

// FUNCTIONS

// Cache

function startCache(event) {
  // Bootstrap initial cache if needed
  // event.waitUntil(
  //   caches.open(cacheName)
  //     .then(cache => {
  //       console.log('PWA Cache Created');
  //       return cache.addAll([ '/', '/index.html', '/index.js', '/styles.css', '/icon.png' ]);
  //     })
  // );
}

function dropOldCache(event) {
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (!key.endsWith(version)) {
          console.log('PWA Cache Drop', key);
          return caches.delete(key);
        }
      }));
    })
  );
}

function fetchFromCache(event) {
  const url = new URL(event.request.url);

  if (url.origin !== location.origin) return; // Cache only same-origin
  if (event.request.method !== 'GET') return; // Cache only GET requests
  if (!url.protocol.startsWith('http')) return; // Cache only http/s
  if (url.pathname.startsWith('/api')) return; // Do not cache API calls
  if (['/service-worker.js','/manifest.json'].some(e => url.pathname.endsWith(e))) return; // Do not cache specific files

  // network-first strategy
  event.respondWith(
    fetch(event.request).then(networkResponse => {
      const clonedResponse = networkResponse.clone();
      caches.open(cacheName).then(cache => cache.put(event.request, clonedResponse));
      return networkResponse;
    }).catch(() => caches.match(event.request))
  );

  // // stale-while-revalidate strategy
  // event.respondWith(
  //   caches.match(event.request)
  //     .then(response => {
  //       const fetchPromise = fetch(event.request).then(networkResponse => {
  //         const clonedResponse = networkResponse.clone();
  //         caches.open(cacheName).then(cache => cache.put(event.request, clonedResponse));
  //         return networkResponse;
  //       });

  //       return response ?? fetchPromise; // stale-while-revalidate strategy
  //     })
  // );
}

// Messaging

function sendMessage(msg) {
  self.clients.matchAll().then((clients) =>
    clients.forEach((client) => client.postMessage({ msg })));
}
