// FitApp Service Worker — v20260703c
// Strategy: pre-cache app shell on install, stale-while-revalidate for assets,
// network-first for navigation. Works offline indefinitely.

var CACHE = "fitapp-shell-v20260820b";

// App shell — files that must be available offline
var SHELL = [
  "./",
  "./index.html",
  "./alumno/index.html",
  "./coach/index.html",
  "./manifest.json",
  "./styles/global.css",
  "./styles/alumno.css",
  "./styles/coach.css",
  "./js/db.js",
  "./js/shared.js",
  "./js/fitscore.js",
  "./js/ejercicios-default.js",
  "./js/alumno.js",
  "./js/coach.js",
  "./js/pages/inicio.js",
  "./js/pages/nutricion.js",
  "./js/pages/agenda.js",
  "./js/pages/evolucion.js",
  "./js/pages/perfil.js",
  "./js/pages/gym.js",
  "./js/pages/videos.js",
  "./js/pages/fotos.js",
  "./js/pages/habitos.js",
  "./js/pages/mas.js",
  "./js/pages/cardio.js",
  "./js/ejercicio-animaciones.js",
  "./js/pages/editar.js",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/apple-touch-icon.png"
];

// ── Install: pre-cache everything ────────────────────────
self.addEventListener("install", function(event){
  event.waitUntil(
    caches.open(CACHE).then(function(cache){
      // addAll is all-or-nothing; individual failures logged but don't abort
      return Promise.allSettled(SHELL.map(function(url){
        return cache.add(url).catch(function(err){
          console.warn("[SW] Failed to cache:", url, err);
        });
      }));
    }).then(function(){ return self.skipWaiting(); })
  );
});

// ── Activate: delete old caches ───────────────────────────
self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); })
      );
    }).then(function(){ return self.clients.claim(); })
  );
});

// ── Fetch: stale-while-revalidate for same-origin assets ─
self.addEventListener("fetch", function(event){
  var req = event.request;

  // Only handle GET requests
  if(req.method !== "GET") return;

  var url = req.url;

  // Let cross-origin requests (Railway API, Unsplash, Google Fonts, YouTube) go straight to network
  if(url.indexOf(self.location.origin) === -1) return;

  // Navigation requests (loading HTML pages): network first, fallback to cached shell
  if(req.mode === "navigate"){
    event.respondWith(
      fetch(req).catch(function(){
        // Offline: return the cached alumno app shell
        return caches.match("./alumno/index.html")
          .then(function(r){ return r || caches.match("./index.html"); });
      })
    );
    return;
  }

  // All other same-origin GET requests: stale-while-revalidate
  // Serve from cache instantly, update cache in background
  event.respondWith(
    caches.open(CACHE).then(function(cache){
      return cache.match(req).then(function(cached){
        // Fetch fresh copy in background regardless
        var networkFetch = fetch(req).then(function(response){
          if(response && response.ok){
            cache.put(req, response.clone());
          }
          return response;
        }).catch(function(){ return null; });

        // Return cached immediately if available, otherwise wait for network
        return cached || networkFetch;
      });
    })
  );
});

// ── Push notifications ────────────────────────────────────
self.addEventListener("push", function(event){
  var data = {};
  try { data = event.data ? event.data.json() : {}; } catch(e){}
  event.waitUntil(
    self.registration.showNotification(data.title || "FitApp", {
      body: data.body || "",
      icon: self.location.pathname.replace("sw.js","") + "assets/icons/icon-192.png",
      badge: self.location.pathname.replace("sw.js","") + "assets/icons/icon-192.png",
      tag: data.tag || "fitapp",
      data: data
    })
  );
});

self.addEventListener("notificationclick", function(event){
  event.notification.close();
  var base = self.location.pathname.replace("sw.js","");
  event.waitUntil(
    clients.matchAll({ type:"window", includeUncontrolled:true }).then(function(cs){
      for(var i = 0; i < cs.length; i++){
        if(cs[i].url.indexOf(base) > -1 && "focus" in cs[i]) return cs[i].focus();
      }
      return clients.openWindow(base + "alumno/index.html");
    })
  );
});
