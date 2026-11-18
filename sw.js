/* Service worker do AgroNosso: deixa o app abrir sem internet
   e pega a versão nova assim que ela é publicada. */
const VERSAO = 'agronosso-v1.7.0';
const EXTERNO = 'agronosso-externo'; // fontes e leitor de letras: não apaga ao atualizar (economiza dados)
const CASCA = [
  './',
  './index.html',
  './css/estilo.css',
  './js/icones.js',
  './js/dados.js',
  './js/analisador.js',
  './js/audios.js',
  './js/voz.js',
  './js/app.js',
  './manifest.webmanifest',
  './assets/logo-agronosso.svg',
  './assets/logo-agronosso-claro.svg',
  './assets/icone-192.png',
  './assets/icone-512.png',
  './assets/apple-touch-icon.png',
  './assets/favicon-32.png',
];

self.addEventListener('install', (e) => {
  // cache: 'reload' busca sempre do servidor, sem pegar arquivo velho do navegador
  e.waitUntil(
    caches.open(VERSAO)
      .then((c) => c.addAll(CASCA.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((chaves) => Promise.all(chaves.filter((k) => k !== VERSAO && k !== EXTERNO).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Arquivos do próprio app: tenta a internet primeiro (versão mais nova).
  // Sem internet ou com sinal muito fraco, usa o que está guardado.
  if (url.origin === self.location.origin) {
    e.respondWith((async () => {
      const cache = await caches.open(VERSAO);
      try {
        const controle = new AbortController();
        const tempo = setTimeout(() => controle.abort(), 4000); // sinal fraco: não espera mais que 4 s
        const resp = await fetch(req, { cache: 'no-cache', signal: controle.signal });
        clearTimeout(tempo);
        if (resp.ok) cache.put(req, resp.clone());
        return resp;
      } catch (erro) {
        return (await cache.match(req, { ignoreSearch: true }))
          || (req.mode === 'navigate' ? cache.match('./index.html') : Response.error());
      }
    })());
    return;
  }

  // Fontes e leitor de letras (OCR): guarda depois da primeira vez, para não gastar dados de novo.
  const externos = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net', 'unpkg.com', 'tessdata.projectnaptha.com'];
  if (externos.includes(url.hostname)) {
    e.respondWith(
      caches.open(EXTERNO).then((c) =>
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
