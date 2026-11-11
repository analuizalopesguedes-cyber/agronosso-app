/* Service worker do AgroNosso: deixa o app abrir sem internet. */
const VERSAO = 'agronosso-v1.0.0';
const CASCA = [
  './',
  './index.html',
  './css/estilo.css',
  './js/icones.js',
  './js/dados.js',
  './js/analisador.js',
  './js/voz.js',
  './js/app.js',
  './manifest.webmanifest',
  './assets/logo-agronosso.svg',
  './assets/icone-192.png',
  './assets/icone-512.png',
  './assets/apple-touch-icon.png',
  './assets/favicon-32.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(CASCA)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((chaves) => Promise.all(chaves.filter((k) => k !== VERSAO).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Arquivos do próprio app: usa o que está guardado e atualiza por trás.
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(req, { ignoreSearch: true }).then((guardado) => {
        const rede = fetch(req)
          .then((resp) => {
            if (resp.ok) caches.open(VERSAO).then((c) => c.put(req, resp.clone()));
            return resp;
          })
          .catch(() => guardado || caches.match('./index.html'));
        return guardado || rede;
      }),
    );
    return;
  }

  // Fontes e leitor de letras (OCR): guarda depois da primeira vez, para não gastar dados de novo.
  const externos = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net', 'unpkg.com', 'tessdata.projectnaptha.com'];
  if (externos.includes(url.hostname)) {
    e.respondWith(
      caches.open(VERSAO + '-externo').then((c) =>
        c.match(req).then((guardado) => {
          if (guardado) return guardado;
          return fetch(req).then((resp) => {
            if (resp.ok || resp.type === 'opaque') c.put(req, resp.clone());
            return resp;
          });
        }),
      ),
    );
  }
});
