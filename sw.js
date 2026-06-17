var CACHE_NAME = "fitapp-coach-alumno-v20260616-1";
var ASSETS = [
  "./index.html",
  "./styles/global.css",
  "./alumno/index.html",
  "./styles/alumno.css",
  "./coach/index.html",
  "./styles/coach.css",
  "./js/db.js",
  "./js/shared.js",
  "./js/alumno.js",
  "./js/coach.js"
];

self.addEventListener("install", function(event){
  event.waitUntil(caches.open(CACHE_NAME).then(function(cache){ return cache.addAll(ASSETS); }));
});

self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE_NAME; }).map(function(k){ return caches.delete(k); }));
    })
  );
});

self.addEventListener("fetch", function(event){
  event.respondWith(
    caches.match(event.request).then(function(cached){
      return cached || fetch(event.request).catch(function(){ return cached; });
    })
  );
});
