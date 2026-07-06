var CACHE_NAME = "fitapp-v20260703";

self.addEventListener("install", function(event){
  // Skip waiting so the new SW activates immediately
  self.skipWaiting();
});

self.addEventListener("activate", function(event){
  // Delete ALL old caches on activate
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

// Network-first strategy: always try network, fallback to cache
// This ensures updates are always delivered
self.addEventListener("fetch", function(event){
  // Skip non-GET and cross-origin API requests
  if(event.request.method !== "GET") return;
  var url = event.request.url;
  if(url.indexOf("railway.app") > -1 || url.indexOf("unsplash.com") > -1) return;

  event.respondWith(
    fetch(event.request).then(function(response){
      // Cache a copy of successful responses
      if(response.ok){
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, clone); });
      }
      return response;
    }).catch(function(){
      // Offline fallback: serve from cache
      return caches.match(event.request);
    })
  );
});

// ── Push Notifications ────────────────────────────────────
self.addEventListener("push", function(event){
  var data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || "FitApp", {
      body: data.body || "",
      icon: "/assets/icons/icon-192.png",
      badge: "/assets/icons/icon-192.png",
      tag: data.tag || "fitapp",
      data: data
    })
  );
});

self.addEventListener("notificationclick", function(event){
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type:"window" }).then(function(cs){
      if(cs.length) return cs[0].focus();
      return clients.openWindow("./alumno/index.html");
    })
  );
});
