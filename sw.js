// Offline support for Грамматика. Bump VERSION whenever files change.
const VERSION = 'grammar-v25';
const SHELL = [
  './', 'index.html', 'manifest.webmanifest',
  'verbs-of-motion/', 'verbs-of-motion/index.html',
  'shared/engine.css', 'shared/engine.js', 'shared/progress.js', 'shared/levels.js', 'shared/ui.css', 'shared/ui.js', 'shared/coach.js', 'shared/catalog.js', 'shared/config.js', 'shared/account.js', 'profile/', 'mix/', 'placement/', 'shared/multi.js', 'shared/lookup.js', 'sentences/', 'sentences/data.js', 'sentences/app.js', 'tables/', 'tables/data.js', 'tables/app.js',
  'vocabulary/', 'vocabulary/vocab.js', 'vocabulary/decks/ru-core.tsv', 'vocabulary/decks/ru-levels.tsv',
  'cases/', 'cases/data.js', 'aspect/', 'aspect/data.js', 'numbers/', 'numbers/data.js', 'advanced/', 'advanced/data.js', 'prep/', 'prep/data.js', 'compare/', 'compare/data.js', 'gov/', 'gov/data.js',
  'shared/lang.js', 'shared/theme.css', 'shared/extra.css', 'shared/review.js', 'shared/speech.js', 'shared/reading.js', 'shared/phrases.js', 'shared/exam.js', 'shared/hub.js', 'shared/cloze.js', 'cloze/', 'de/cloze/', 'vocabulary/decks/ru-cloze.json', 'de/vocabulary/decks/de-cloze.json', 'shared/hub.css', 'shared/dictionary.js', 'vocabulary/decks/ru-forms.json', 'de/vocabulary/decks/de-forms.json', 'dictionary/', 'de/dictionary/', 'exam/', 'de/exam/', 'phrases/', 'phrases/data.js', 'de/phrases/', 'de/phrases/data.js', 'reading/', 'reading/texts.js', 'de/reading/', 'de/reading/texts.js', 'review/', 'de/review/', 'de/genus/', 'de/genus/data.js', 'de/genus/app.js', 'shared/guide.css', 'shared/guide-map.js', 'grammar/', 'de/grammar/', 'shared/lines.js', 'shared/catalog-de.js',
  'de/', 'de/vocabulary/', 'de/vocabulary/decks/de-core.tsv', 'de/mix/', 'de/placement/', 'de/saetze/', 'de/saetze/data.js', 'de/tabellen/', 'de/tabellen/data.js',
  'de/verbs/', 'de/verbs/data.js', 'de/cases/', 'de/cases/data.js', 'de/prep/', 'de/prep/data.js', 'de/adj/', 'de/adj/data.js', 'de/conn/', 'de/conn/data.js', 'de/konj/', 'de/konj/data.js', 'de/adv/', 'de/adv/data.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Pages: network first so updates arrive at once, cached copy when offline.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then(hit => hit || caches.match('./')))
    );
    return;
  }

  // Google Fonts: cached copy first, refreshed in the background.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(
      caches.open(VERSION).then(c => c.match(req).then(hit => {
        const net = fetch(req).then(res => { c.put(req, res.clone()); return res; }).catch(() => hit);
        return hit || net;
      }))
    );
    return;
  }

  // Login settings and account code: network first, so a change reaches the app at once.
  if (url.origin === location.origin && /shared\/(config|account)\.js$/.test(url.pathname)) {
    e.respondWith(fetch(req, { cache: 'no-cache' }).then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res; }).catch(() => caches.match(req)));
    return;
  }

  // Own files: cache first.
  if (url.origin === location.origin) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
  }
});
