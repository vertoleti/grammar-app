/* Tap any Russian word in an exercise to see it in the flashcard decks and add it to your flashcards.
   Inflected words are matched to their dictionary form by the longest shared beginning, so results
   for an inflected word are suggestions. Words not in the decks can be added as your own cards. */
(function () {
  const BASE = new URL('../vocabulary/', document.currentScript.src);
  const DECKS = ['decks/ru-core.tsv', 'decks/ru-levels.tsv'];
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const bare = s => String(s || '').normalize('NFD').replace(/́/g, '').normalize('NFC');
  const key = s => bare(s).toLowerCase().replace(/ё/g, 'е');
  const WORD = /[А-Яа-яЁё́-]/;
  let cards = null, loading = null;

  function load() {
    if (cards) return Promise.resolve(cards);
    if (loading) return loading;
    loading = Promise.all(DECKS.map(d => fetch(new URL(d, BASE)).then(r => r.ok ? r.text() : '').catch(() => ''))).then(texts => {
      cards = [];
      texts.forEach(t => {
        let cols = null;
        t.replace(/\r/g, '').split('\n').forEach(l => {
          if (!l.trim()) return;
          if (l.startsWith('#')) { if (l.startsWith('#columns:')) cols = l.slice(9).split('\t'); return; }
          if (!cols) return;
          const f = l.split('\t'), c = {}; cols.forEach((n, i) => { c[n] = f[i] || ''; });
          if (c.term && c.id) cards.push({ id: c.id, term: c.term, k: key(c.term), meaning: c.meaning_en, level: c.cefr, forms: c.forms, grammar: c.grammar });
        });
      });
      LS.get('voc-custom', []).forEach(c => cards.push({ id: c.id, term: c.term, k: key(c.term), meaning: c.meaning, level: c.level, mine: true }));
      return cards;
    });
    return loading;
  }
  function find(w) {
    const k = key(w);
    const exact = cards.filter(c => c.k === k || c.k.split(/[ ,]+/).includes(k) || key(c.forms || '').split(/[ ,.;]+/).includes(k));
    if (exact.length) return { exact: true, list: exact.slice(0, 4) };
    for (let n = k.length - 1; n >= Math.max(3, k.length - 4); n--) {
      const stem = k.slice(0, n);
      const hits = cards.filter(c => !c.k.includes(' ') && c.k.startsWith(stem) && c.k.length <= k.length + 3);
      if (hits.length) return { exact: false, list: hits.sort((a, b) => Math.abs(a.k.length - k.length) - Math.abs(b.k.length - k.length)).slice(0, 3) };
    }
    return { exact: false, list: [] };
  }
  const srs = () => LS.get('voc-srs', {});
  const has = id => { const s = srs(); return !!(s[id + '|r'] || s[id + '|p']); };
  function pin(id) {
    const s = srs(), now = Date.now();
    if (!s[id + '|r']) s[id + '|r'] = { q: 'learn', s: 0, ease: 2.5, ivl: 0, lap: 0, reps: 0, due: now, m: now, pin: true };
    else { s[id + '|r'].pin = true; s[id + '|r'].m = now; }
    LS.set('voc-srs', s);
  }

  // ---------- popover ----------
  let box = null, ctx = null;
  function ensureBox() {
    if (box) return box;
    const st = document.createElement('style');
    st.textContent = `.lk{position:fixed;z-index:60;left:50%;bottom:calc(16px + env(safe-area-inset-bottom));transform:translateX(-50%);width:min(440px,calc(100vw - 24px));background:var(--bg);color:var(--ink);border:2px solid var(--line);border-radius:18px;box-shadow:0 12px 40px rgba(0,0,0,.25);padding:16px 18px;font:17px "PT Sans",sans-serif}
.lk h3{font:700 22px "PT Sans",sans-serif;margin:0 26px 6px 0}.lk .x{position:absolute;right:8px;top:8px;width:40px;height:40px;border:0;background:none;color:var(--mute);font-size:24px;cursor:pointer}
.lk ul{list-style:none;margin:0;padding:0}.lk li{display:flex;gap:10px;align-items:center;justify-content:space-between;padding:8px 0;border-top:1px solid var(--line)}
.lk li b{font-size:18px}.lk li small{display:block;color:var(--mute);font-size:14px}.lk .add{flex:none;font:inherit;font-size:15px;min-height:40px;padding:4px 14px;border-radius:999px;border:2px solid var(--line);background:var(--bg);color:var(--ink);cursor:pointer}
.lk .add.done{border-color:transparent;color:var(--ok);cursor:default}.lk .note{color:var(--mute);font-size:14px;margin:6px 0 0}.lk form{display:flex;gap:8px;margin-top:8px}.lk input{flex:1;min-width:0;font:inherit;min-height:42px;padding:4px 12px;border:2px solid var(--line);border-radius:12px;background:var(--bg);color:var(--ink)}
.lk a{color:inherit}`;
    document.head.appendChild(st);
    box = document.createElement('div'); box.className = 'lk'; box.hidden = true; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Word lookup');
    document.body.appendChild(box);
    box.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.classList.contains('x')) close();
      else if (b.dataset.id && !b.classList.contains('done')) { pin(b.dataset.id); b.textContent = 'Added ✓'; b.classList.add('done'); }
    });
    box.addEventListener('submit', e => {
      e.preventDefault();
      const m = box.querySelector('input').value.trim(); if (!m) return;
      const custom = LS.get('voc-custom', []), id = 'my-' + key(ctx.word);
      if (!custom.some(c => c.id === id)) custom.push({ id, term: ctx.word.toLowerCase(), kind: 'word', cat: '', gender: '', forms: '', grammar: '', meaning: m, ex: ctx.sentence, exEn: '', mistake: '', notes: 'Added while practising grammar', ipa: '', level: (LS.get('gr-level', 'B1') || 'B1').replace('all', 'B1'), theme: 'imported', src: 'import' });
      LS.set('voc-custom', custom); pin(id);
      if (cards) cards.push({ id, term: ctx.word, k: key(ctx.word), meaning: m, mine: true });
      box.querySelector('form').outerHTML = '<p class="note">Added to your flashcards ✓</p>';
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    return box;
  }
  function close() { if (box) box.hidden = true; }
  function show(word, sentence) {
    ensureBox(); ctx = { word, sentence };
    box.hidden = false;
    box.innerHTML = `<button class="x" aria-label="Close">×</button><h3 lang="ru">${esc(word)}</h3><p class="note">Looking it up…</p>`;
    load().then(() => {
      const r = find(word);
      const items = r.list.map(c => `<li><span><b lang="ru">${esc(c.term)}</b> <small>${esc(c.meaning)}${c.level ? ' · ' + esc(c.level) : ''}${c.grammar ? ' · ' + esc(c.grammar) : ''}</small></span><button class="add${has(c.id) ? ' done' : ''}" data-id="${esc(c.id)}">${has(c.id) ? 'In flashcards' : '+ Flashcards'}</button></li>`).join('');
      const wik = `<a href="https://en.wiktionary.org/wiki/${encodeURIComponent(key(word))}#Russian" target="_blank" rel="noopener">Wiktionary</a>`;
      box.innerHTML = `<button class="x" aria-label="Close">×</button><h3 lang="ru">${esc(word)}</h3>
${items ? `${r.exact ? '' : '<p class="note">Not in the decks in this form. Closest dictionary forms:</p>'}<ul>${items}</ul>` : '<p class="note">This word is not in the flashcard decks yet.</p>'}
${r.exact ? '' : `<form><input placeholder="Meaning in English, to add “${esc(word.toLowerCase())}” as your own card" aria-label="Meaning in English"><button class="add">Add</button></form>`}
<p class="note">More: ${wik}. Words you add appear in Словарь · Vocabulary.</p>`;
    });
  }

  // ---------- find the tapped word ----------
  function wordAt(x, y) {
    let node, off;
    if (document.caretPositionFromPoint) { const p = document.caretPositionFromPoint(x, y); if (!p) return null; node = p.offsetNode; off = p.offset; }
    else if (document.caretRangeFromPoint) { const r = document.caretRangeFromPoint(x, y); if (!r) return null; node = r.startContainer; off = r.startOffset; }
    if (!node || node.nodeType !== 3) return null;
    const t = node.textContent; let a = off, b = off;
    while (a > 0 && WORD.test(t[a - 1])) a--;
    while (b < t.length && WORD.test(t[b])) b++;
    const w = t.slice(a, b).replace(/^-+|-+$/g, '');
    return w.length > 1 && /[А-Яа-яЁё]/.test(w) ? { w, node } : null;
  }
  document.addEventListener('click', e => {
    if (box && box.contains(e.target)) return;
    const host = e.target.closest('[lang="ru"]');
    if (!host || e.target.closest('button, a, input, textarea, label, .tile, .wtok, .gap') || !host.closest('#card, .misses')) { close(); return; }
    if (String(window.getSelection && window.getSelection()).length > 1) return;
    const hit = wordAt(e.clientX, e.clientY); if (!hit) { close(); return; }
    show(hit.w, host.textContent.trim().replace(/\s+/g, ' '));
  });
})();
