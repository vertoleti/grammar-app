/* Progress storage for Грамматика.
   Everything the app remembers lives in localStorage under these prefixes. This file:
   - stamps every write with a time, so two copies can be merged (newest wins);
   - asks the browser to keep the data (persistent storage);
   - exports and imports a backup file;
   - optionally syncs through a private GitHub Gist, so phone and computer share progress.
   Load it before any other script on the page. */
/* Appearance: gr-theme = 'light' | 'dark' | absent (follow the phone). Applied before the page draws. */
try { const t = JSON.parse(localStorage.getItem('gr-theme') || 'null'); if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t; } catch (e) {}
window.GRSetTheme = function (t) { try { if (t === 'light' || t === 'dark') { localStorage.setItem('gr-theme', JSON.stringify(t)); document.documentElement.dataset.theme = t; } else { localStorage.removeItem('gr-theme'); delete document.documentElement.dataset.theme; } } catch (e) {} };
(function () {
  const PREFIXES = ['vom-', 'cases-', 'aspect-', 'numbers-', 'advanced-', 'prep-', 'compare-', 'voc-', 'gr-', 'mix-', 'placement-', 'sent-', 'tables-', 'gov-', 'de-'];
  const META = 'gr-meta', SYNC = 'gr-sync', FILE = 'grammar-app-progress.json';
  const SKIP = new Set([META, SYNC, 'gr-auth']);
  const tracked = k => typeof k === 'string' && !SKIP.has(k) && PREFIXES.some(p => k.startsWith(p));
  let ls; try { ls = window.localStorage; ls.getItem('x'); } catch (e) { ls = null; }
  const listeners = new Set();
  const emit = () => listeners.forEach(f => { try { f(api.status()); } catch (e) {} });
  if (!ls) { window.GRProgress = { available: false, on() {}, status: () => ({ available: false }) }; return; }

  const rawSet = Storage.prototype.setItem;
  const rawRemove = Storage.prototype.removeItem;
  const readJSON = (k, d) => { try { const v = ls.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  let meta = readJSON(META, {});
  let syncCfg = readJSON(SYNC, {});
  let timer = null, busy = false, lastError = '';

  Storage.prototype.setItem = function (k, v) {
    rawSet.call(this, k, v);
    if (this === ls && tracked(k)) { meta[k] = Date.now(); rawSet.call(ls, META, JSON.stringify(meta)); schedule(); }
  };
  Storage.prototype.removeItem = function (k) {
    rawRemove.call(this, k);
    if (this === ls && tracked(k)) { meta[k] = Date.now(); rawSet.call(ls, META, JSON.stringify(meta)); schedule(); }
  };

  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {}); } catch (e) {}

  function keys() { const out = []; for (let i = 0; i < ls.length; i++) { const k = ls.key(i); if (tracked(k)) out.push(k); } return out; }
  function snapshot() {
    const data = {};
    keys().forEach(k => { data[k] = { v: ls.getItem(k), t: meta[k] || 0 }; });
    Object.keys(meta).forEach(k => { if (tracked(k) && !(k in data)) data[k] = { v: null, t: meta[k] }; });
    return { app: 'grammar-app', version: 1, saved: Date.now(), data };
  }
  // Merge one snapshot into this device. Returns true if anything changed here.
  function merge(snap) {
    if (!snap || snap.app !== 'grammar-app' || !snap.data) throw new Error('This is not a Грамматика progress file.');
    let changed = false;
    Object.entries(snap.data).forEach(([k, rec]) => {
      if (!tracked(k) || !rec) return;
      const localT = meta[k] || 0;
      if (k === 'voc-srs' && rec.v && ls.getItem(k)) {
        // Card by card: keep the most recently reviewed version of each card.
        let a, b; try { a = JSON.parse(ls.getItem(k)) || {}; b = JSON.parse(rec.v) || {}; } catch (e) { return; }
        let ch = false;
        Object.entries(b).forEach(([id, c]) => { if (!a[id] || (c.m || 0) > (a[id].m || 0)) { a[id] = c; ch = true; } });
        if (ch) { rawSet.call(ls, k, JSON.stringify(a)); meta[k] = Math.max(localT, rec.t || 0); changed = true; }
        return;
      }
      if ((rec.t || 0) > localT) {
        if (rec.v === null) rawRemove.call(ls, k); else rawSet.call(ls, k, rec.v);
        meta[k] = rec.t; changed = true;
      }
    });
    rawSet.call(ls, META, JSON.stringify(meta));
    return changed;
  }

  // ---------- backup file ----------
  function exportFile() {
    const blob = new Blob([JSON.stringify(snapshot())], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `grammar-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  async function importFile(file) {
    const snap = JSON.parse(await file.text());
    const changed = merge(snap);
    schedule();
    return changed;
  }

  // ---------- GitHub Gist sync ----------
  const GH = 'https://api.github.com';
  async function gh(path, opts = {}) {
    const res = await fetch(GH + path, Object.assign({}, opts, {
      headers: Object.assign({ Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + syncCfg.token, 'X-GitHub-Api-Version': '2022-11-28' }, opts.body ? { 'Content-Type': 'application/json' } : {})
    }));
    if (res.status === 401) throw new Error('GitHub did not accept the token. Check that it is correct and has Gist access.');
    if (res.status === 403 || res.status === 404) throw new Error('The token can’t reach your Gists. Give it the “Gists: read and write” permission.');
    if (!res.ok) throw new Error('GitHub answered ' + res.status + '.');
    return res.status === 204 ? null : res.json();
  }
  async function findGist() {
    if (syncCfg.gist) return syncCfg.gist;
    for (let page = 1; page <= 5; page++) {
      const list = await gh(`/gists?per_page=100&page=${page}`);
      const hit = list.find(g => g.files && g.files[FILE]);
      if (hit) return hit.id;
      if (list.length < 100) break;
    }
    return null;
  }
  async function readRemote(id) {
    const g = await gh('/gists/' + id);
    const f = g.files && g.files[FILE];
    if (!f) return null;
    let text = f.content;
    if (f.truncated && f.raw_url) text = await (await fetch(f.raw_url)).text();
    return JSON.parse(text);
  }
  // an account (shared/account.js) can register itself as the place to sync to
  let remote = null;
  async function syncRemote() {
    busy = true; lastError = ''; emit();
    try {
      const snap = await remote.read();
      const changedHere = snap ? merge(snap) : false;
      await remote.write(snapshot());
      syncCfg.last = Date.now(); rawSet.call(ls, SYNC, JSON.stringify(syncCfg));
      if (changedHere) { window.dispatchEvent(new CustomEvent('gr-progress-merged')); toast(); }
    } catch (e) { lastError = e.message || String(e); }
    busy = false; emit();
  }
  async function sync() {
    if (busy) return;
    if (remote) return syncRemote();
    if (!syncCfg.token) return;
    busy = true; lastError = ''; emit();
    try {
      let id = await findGist(), remote = null;
      if (id) remote = await readRemote(id);
      const changedHere = remote ? merge(remote) : false;
      const body = JSON.stringify({ files: { [FILE]: { content: JSON.stringify(snapshot()) } } });
      if (id) await gh('/gists/' + id, { method: 'PATCH', body });
      else { const g = await gh('/gists', { method: 'POST', body: JSON.stringify({ description: 'Грамматика: Russian grammar app progress', public: false, files: { [FILE]: { content: JSON.stringify(snapshot()) } } }) }); id = g.id; }
      syncCfg.gist = id; syncCfg.last = Date.now();
      rawSet.call(ls, SYNC, JSON.stringify(syncCfg));
      if (changedHere) { window.dispatchEvent(new CustomEvent('gr-progress-merged')); toast(); }
    } catch (e) { lastError = e.message || String(e); }
    busy = false; emit();
  }
  function toast() {
    if (window.GR_NO_TOAST || document.getElementById('gr-toast')) return;
    const d = document.createElement('div');
    d.id = 'gr-toast';
    d.setAttribute('role', 'status');
    d.style.cssText = 'position:fixed;left:50%;bottom:max(16px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:9;display:flex;gap:12px;align-items:center;max-width:calc(100% - 32px);padding:10px 10px 10px 18px;border-radius:999px;background:#141414;color:#fff;font:16px/1.3 "PT Sans",system-ui,sans-serif;box-shadow:0 10px 28px rgba(0,0,0,.25)';
    d.innerHTML = '<span>Progress from your other device has arrived.</span><button style="font:700 15px \'PT Sans\',sans-serif;min-height:40px;padding:4px 16px;border:0;border-radius:999px;background:#fff;color:#141414;cursor:pointer">Refresh</button>';
    d.querySelector('button').onclick = () => location.reload();
    document.body.appendChild(d);
  }
  function schedule() { if (!syncCfg.token && !remote) { emit(); return; } clearTimeout(timer); timer = setTimeout(sync, 4000); emit(); }
  async function connect(token) {
    syncCfg = { token: token.trim() }; rawSet.call(ls, SYNC, JSON.stringify(syncCfg));
    await sync();
    if (lastError) { const err = lastError; syncCfg = {}; rawRemove.call(ls, SYNC); emit(); throw new Error(err); }
  }
  function disconnect() { syncCfg = {}; rawRemove.call(ls, SYNC); lastError = ''; emit(); }

  const api = {
    available: true,
    exportFile, importFile, connect, disconnect, sync, snapshot, merge,
    setRemote(r) { remote = r; if (r) setTimeout(sync, 200); emit(); },
    on(f) { listeners.add(f); f(api.status()); },
    status() {
      return { available: true, keys: keys().length, synced: !!syncCfg.token || !!remote, account: remote ? remote.name : '', last: syncCfg.last || 0, busy, error: lastError };
    }
  };
  window.GRProgress = api;
  // Pull from GitHub when a page opens, and once more when the tab comes back into view.
  if (syncCfg.token) {
    window.addEventListener('load', () => setTimeout(sync, 300));
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && Date.now() - (syncCfg.last || 0) > 60000) sync(); });
  }
})();

/* Where you left off: the last exercise page you opened, for "Continue" on the home page.
   Saved as gr-last (Russian) or de-last (German): { p: folder, h: hash, d: detail, at: time }.
   Pages can set document.body.dataset.where (e.g. the text you're reading) for a better label. */
(function () {
  try {
    const m = location.pathname.match(/\/(de\/)?([a-z-]+)\/(?:index\.html)?$/);
    if (!m || ['de', 'grammar-app', 'profile', 'grammar', 'review', 'exam', 'placement'].includes(m[2])) return;
    const key = m[1] ? 'de-last' : 'gr-last';
    const save = () => { try { localStorage.setItem(key, JSON.stringify({ p: m[2], h: location.hash.replace(/^#/, ''), d: (document.body && document.body.dataset.where) || '', at: Date.now() })); } catch (e) {} };
    addEventListener('DOMContentLoaded', () => setTimeout(save, 300));
    addEventListener('hashchange', () => setTimeout(save, 300));
    addEventListener('pagehide', save);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') save(); });
  } catch (e) {}
})();

/* Today's session: pages opened from the session list (?s=1) point their "All exercises" link back to it. */
(function () {
  try {
    if (/[?&]s=1\b/.test(location.search)) sessionStorage.setItem('gr-session', '1');
    if (sessionStorage.getItem('gr-session') !== '1') return;
    addEventListener('DOMContentLoaded', () => {
      const a = document.querySelector('.home a'); if (!a) return;
      a.textContent = '← Today’s session'; a.href = a.getAttribute('href').split('#')[0] + '#today';
    });
  } catch (e) {}
})();

/* Today's session, step to step: the home page stores the plan; a page that finishes a step calls
   GRSession.offer(element) to show "Next: …" right there. Only active when you came from the session. */
window.GRSession = (function () {
  const get = (k, d) => { try { const v = sessionStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const lget = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const active = () => { try { return sessionStorage.getItem('gr-session') === '1'; } catch (e) { return false; } };
  const isDone = s => (s.k || []).some(k => lget(k) === today());
  const here = h => { try { return new URL(h, location.href).pathname === location.pathname; } catch (e) { return false; } };
  function next() {
    const p = get('gr-session-plan', null); if (!p) return null;
    const i = p.steps.findIndex(s => here(s.h)), order = p.steps.slice(i + 1).concat(p.steps.slice(0, Math.max(0, i)));   // go forward, then wrap round
    const left = order.filter(s => !isDone(s) && !here(s.h));
    return { step: left[0] || null, home: p.home, left: left.length, total: p.steps.length };
  }
  function offer(el) {
    if (!el || !active()) return;
    const n = next(); if (!n) return;
    const old = el.querySelector('.sessnext'); if (old) old.remove();
    const d = document.createElement('div'); d.className = 'sessnext';
    const esc = x => String(x).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    d.innerHTML = n.step
      ? `<p><b>Step done ✓</b> ${n.total - n.left} of ${n.total} in today’s session</p><a class="sessgo" href="${esc(n.step.h)}">Next: ${esc(n.step.t)} →</a><a class="sesshome" href="${esc(n.home)}">Back to Today</a>`
      : `<p><b>Today’s session is complete ✓</b> Well done!</p><a class="sessgo" href="${esc(n.home)}">Back to Today</a>`;
    el.insertBefore(d, el.firstChild);
  }
  return { active, offer, next };
})();
