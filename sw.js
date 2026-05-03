// RidePilot Service Worker
// Version bump on each release to force cache refresh.
const VERSION = 'ridepilot-v8.33.1';
const CORE_ASSETS = [
  './',
  './ridepilot_pro.html',
  './manifest.json',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png'
];

// On install: cache core assets so the app opens offline.
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(VERSION).then(cache => cache.addAll(CORE_ASSETS))
  );
});

// On activate: drop old caches.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(n => n !== VERSION).map(n => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

// On fetch: cache-first for core assets, network-first for everything else.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Only handle same-origin GETs
  if (event.request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).catch(() => {
        // Offline + uncached → return main HTML as fallback
        return caches.match('./ridepilot_pro.html');
      });
    })
  );
});

// Listen for messages from the page asking us to schedule a notification.
// The page posts: { type: 'schedule', id, title, body, fireAt }
// We use setTimeout inside the SW (limited reliability — SW can sleep, but
// when active will fire). For robust late-fire: showNotification on demand
// when the page becomes visible.
const _scheduled = new Map();
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'schedule') {
    cancelScheduled(data.id);
    const delay = Math.max(0, data.fireAt - Date.now());
    const handle = setTimeout(() => {
      self.registration.showNotification(data.title || 'RidePilot', {
        body: data.body || '',
        icon: './icon-192.png',
        badge: './icon-192.png',
        tag: data.id,
        renotify: true,
        requireInteraction: false,
        vibrate: [200, 100, 200],
        data: { id: data.id }
      });
      _scheduled.delete(data.id);
    }, delay);
    _scheduled.set(data.id, handle);
  } else if (data.type === 'cancel') {
    cancelScheduled(data.id);
  } else if (data.type === 'cancelAll') {
    for (const h of _scheduled.values()) clearTimeout(h);
    _scheduled.clear();
  }
});

function cancelScheduled(id) {
  const h = _scheduled.get(id);
  if (h) {
    clearTimeout(h);
    _scheduled.delete(id);
  }
}

// When user taps a notification → focus/open the app.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      // Reuse an existing window if open
      for (const c of clients) {
        if ('focus' in c) return c.focus();
      }
      // Otherwise open the app
      if (self.clients.openWindow) {
        return self.clients.openWindow('./ridepilot_pro.html');
      }
    })
  );
});
