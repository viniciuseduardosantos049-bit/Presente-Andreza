const CACHE_VERSION = "nosso-universo-v1";
const CORE_ASSETS = [
	"/",
	"/index.html",
	"/style.css",
	"/script.js",
	"/manifest.json"
];

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_VERSION).then((cache) => cache.addAll(CORE_ASSETS))
	);
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((keys) =>
			Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)))
		)
	);
	self.clients.claim();
});

self.addEventListener("fetch", (event) => {
	const { request } = event;

	// Nunca intercepta chamadas de API (PDF, salvar mídia etc.) — sempre precisam ir à rede
	if (request.method !== "GET" || new URL(request.url).pathname.startsWith("/api/")) {
		return;
	}

	event.respondWith(
		caches.match(request).then((cached) => {
			const network = fetch(request)
				.then((response) => {
					if (response.ok) {
						caches.open(CACHE_VERSION).then((cache) => cache.put(request, response.clone()));
					}
					return response;
				})
				.catch(() => cached);

			return cached || network;
		})
	);
});
