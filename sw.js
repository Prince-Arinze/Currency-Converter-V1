// Initial cache name
var cacheName = 'currency-converter1'; 

// Files to be cached
var cacheFiles = [
  './',
  './index.html',
  './bootstrap.min.css',
  './index.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css',
  './js/app.js',
  './js/idb.js',
  'https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js',
  './manifest.json',
  './logo.jpg',
  './img/bg.jpg'
]


self.addEventListener('install', function(event) {
    console.log('ServiceWorker Installed');

    // event.waitUntil Delays the event until the Promise is resolved or rejected
    event.waitUntil(

      // Open the cache
      caches.open(cacheName).then(function(cache) {

        // Add all the initialized files to the cache
      console.log('ServiceWorker Caching cacheFiles');
      return cache.addAll(cacheFiles);
      })
  ); // the end of event.waitUntil
});


self.addEventListener('activate', function(event) {
    console.log('ServiceWorker Activated');

    event.waitUntil(

      // Getting all the cache keys (cacheName)
    caches.keys().then(function(cacheNames) {
      return Promise.all(cacheNames.map(function(CacheName1) {

        // Check if a cached item is saved under a previous cacheName
        if (CacheName1 !== cacheName) {

          // Delete that cached file
          console.log('ServiceWorker Deleting duplicate cache file from cache - ', CacheName1);
          return caches.delete(CacheName1);
        }
      }));
    })
  ); // end of event.waitUntil

});


self.addEventListener('fetch', function(event) {
  console.log('ServiceWorker Fetching', event.request.url);

  // event.respondWidth Responds to the fetch event
  event.respondWith(

    // Check in cache for the request being made
    caches.match(event.request)


      .then(function(res) {

        // If the request is in the cache
        if (res) {
          console.log("Yes ServiceWorker Found in Cache", event.request.url, res);
          // Return the cached version
          return res;
        }

        // If the request is NOT in the cache, fetch and cache

        var clonedRequest = event.request.clone();
        return fetch(clonedRequest)
          .then(function(response) {

            if (!response) {
              console.log("ServiceWorker No response from fetch ")
              return response;
            }

            var clonedResponse = response.clone();

            //  Open the cache
            caches.open(cacheName).then(function(cache) {

              // Put the fetched response in the cache
              cache.put(event.request, clonedResponse);
              console.log('ServiceWorker New Data Cached', event.request.url);

              // Return the response
              return response;
      
                }); // end of caches.open

          })
          .catch(function(err) {
            console.log('ServiceWorker Error In Fetching & Caching New Data: ', err);
          });


      }) // end caches.match(e.request)
  ); // end of event.respondWith
});
