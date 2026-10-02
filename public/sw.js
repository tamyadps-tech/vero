// Service worker mínimo: só existe pra tornar o app instalável e mostrar
// uma página própria quando não tem internet. Não cacheia dado nenhum
// (sessões, financeiro, CRM) de propósito — esse painel é sempre dado ao
// vivo, cache agressivo aqui significaria mostrar número errado pro
// profissional.

const CACHE_NAME = "vero-offline-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Só intercepta navegação de página (não API, não assets) — tudo o
  // resto vai direto pra rede, sem passar pelo service worker.
  if (event.request.mode !== "navigate") return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(OFFLINE_URL))
  );
});
