/* =========================================================

   MY MONE — SERVICE WORKER

   - Працює офлайн

   - Файли застосунку: спочатку мережа (оновлення приходять самі),

     якщо мережі нема — кеш

   - Іконки: спочатку кеш

   Щоб примусово оновити всім — змін версію CACHE_NAME.

   ========================================================= */

const CACHE_NAME = "my-mone-simple-oc-v6";

const APP_FILES = [

    "./",

    "./index.html",

    "./style.css",

    "./app.js",

    "./manifest.json",

    "./icons/icon-192.png",

    "./icons/icon-512.png",

    "./icons/icon-512-maskable.png",

    "./icons/apple-touch-icon.png"

];

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME).then(cache =>

            /* Кожен файл окремо: якщо одного бракує, решта все одно кешується */

            Promise.all(

                APP_FILES.map(file =>

                    cache.add(file).catch(() => null)

                )

            )

        )

    );

    self.skipWaiting();

});

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()

            .then(keys =>

                Promise.all(

                    keys

                        .filter(key => key !== CACHE_NAME)

                        .map(key => caches.delete(key))

                )

            )

            .then(() => self.clients.claim())

    );

});

function putInCache(request, response) {

    if (!response || response.status !== 200 || response.type !== "basic") {

        return;

    }

    const copy = response.clone();

    caches.open(CACHE_NAME).then(cache => cache.put(request, copy));

}

self.addEventListener("fetch", event => {

    const request = event.request;

    if (request.method !== "GET") return;

    const url = new URL(request.url);

    /* Чіпаємо лише свій домен */

    if (url.origin !== self.location.origin) return;

    const isIcon = url.pathname.includes("/icons/");

    if (isIcon) {

        event.respondWith(

            caches.match(request).then(cached =>

                cached ||

                fetch(request).then(response => {

                    putInCache(request, response);

                    return response;

                })

            )

        );

        return;

    }

    /* Network-first для сторінки, CSS, JS, manifest */

    event.respondWith(

        fetch(request)

            .then(response => {

                putInCache(request, response);

                return response;

            })

            .catch(() =>

                caches.match(request, { ignoreSearch: true }).then(cached => {

                    if (cached) return cached;

                    if (request.mode === "navigate") {

                        return caches.match("./index.html");

                    }

                    return Response.error();

                })

            )

    );

});

