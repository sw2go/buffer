// sw.js

importScripts('/db.js');

self.addEventListener('install', event => {
  // Just ensure DB/cache exists, no need to preload
  event.waitUntil(caches.open('my-cache'));
});

self.addEventListener('activate', event => {
  // Take control immediately
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  console.log("fetsch " + url)
  if (url.pathname.startsWith("/download/")) {
    event.respondWith(
      (async () => {
        const key = url.pathname.replace("/download/", "");
        const blob = await DB().readFromIndexedDB("files", key);
        if (blob) {
          return new Response(blob, {
            headers: { "Content-Type": blob.type }
          });
        } else {
          return new Response(key + "Not found", { status: 404 });
        }
      })()
    );
  }
});
