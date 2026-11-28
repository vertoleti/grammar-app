/* Tap a word (Russian or German) in an exercise or a reading text: see it in that language's flashcard decks
   and add it to your flashcards with one tap, or add it as your own card. Inflected words are matched to the
   closest dictionary form, so those results are suggestions. */
(function () {
  const ROOT = new URL('../', document.currentScript.src);
  const CFG = {
    ru: { decks: ['vocabulary/decks/ru-core.tsv', 'vocabulary/decks/ru-levels.tsv'], prefix: 'voc-', word: /[А-Яа-яЁё́-]/, has: /[А-Яа-яЁё]/, level: 'gr-level', vocab: 'Словарь · Vocabulary' },
    de: { decks: ['de/vocabulary/decks/de-core.tsv'], prefix: 'de-voc-', word: /[A-Za-zÄÖÜäöüß-]/, has: /[A-Za-zÄÖÜäöüß]/, level: 'de-level', vocab: 'Wortschatz · Vocabulary' }
  };
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const bare = s => String(s || '').normalize('NFD').replace(/́/g, '').normalize('NFC');
  const key = s => bare(s).toLowerCase().replace(/ё/g, 'е');
  const base = s => key(s).replace(/^(der|die|das|sich) /, '');
  const cache = {}, loading = {};

  function load(lang) {
    if (cache[lang]) return Promise.resolve(cache[lang]);
    if (loading[lang]) return loading[lang];
    const C = CFG[lang];
    loading[lang] = Promise.all(C.decks.map(d => fetch(new URL(d, ROOT)).then(r => r.ok ? r.text() : '').catch(() => ''))).then(texts => {
      const cards = [];
      texts.forEach(t => {
        let cols = null;
        t.replace(/\r/g, '').split('\n').forEach(l => {
          if (!l.trim()) return;
          if (l.startsWith('#')) { if (l.startsWith('#columns:')) cols = l.slice(9).split('\t'); return; }
          if (!cols) return;
          const f = l.split('\t'), c = {}; cols.forEach((n, i) => { c[n] = f[i] || ''; });
          if (c.term && c.id) cards.push({ id: c.id, term: c.term, k: key(c.term), b: base(c.term), meaning: c.meaning_en, level: c.cefr, forms: c.forms, grammar: c.grammar });
        });
      });
      LS.get(C.prefix + 'custom', []).forEach(c => cards.push({ id: c.id, term: c.term, k: key(c.term), b: base(c.term), meaning: c.meaning, level: c.level, mine: true }));
      return (cache[lang] = cards);
    });
    return loading[lang];
  }
  function find(cards, w, lang) {
    const k = key(w);
    const exact = cards.filter(c => c.k === k || c.b === k || c.k.split(/[ ,]+/).includes(k) || key(c.forms || '').split(/[ ,.;]+/).includes(k));
    if (exact.length) return { exact: true, list: exact.slice(0, 4) };
    const min = lang === 'de' ? Math.max(4, Math.ceil(k.length * 0.6)) : Math.max(3, k.length - 4);
    for (let n = k.length - 1; n >= min; n--) {
      const stem = k.slice(0, n);
      const hits = cards.filter(c => !c.b.includes(' ') && c.b.startsWith(stem) && c.b.length <= k.length + 3);
      if (hits.length) return { exact: false, list: hits.sort((a, b) => Math.abs(a.b.length - k.length) - Math.abs(b.b.length - k.length)).slice(0, 3) };
    }
    return { exact: false, list: [] };
  }
  const srs = lang => LS.get(CFG[lang].prefix + 'srs', {});
  const has = (lang, id) => { const s = srs(lang); return !!(s[id + '|r'] || s[id + '|p']); };
  function pin(lang, id) {
    const k = CFG[lang].prefix + 'srs', s = LS.get(k, {}), now = Date.now();
    if (!s[id + '|r']) s[id + '|r'] = { q: 'learn', s: 0, ease: 2.5, ivl: 0, lap: 0, reps: 0, due: now, m: now, pin: true };
    else { s[id + '|r'].pin = true; s[id + '|r'].m = now; }
    LS.set(k, s);
    document.dispatchEvent(new CustomEvent('gr-word-added', { detail: { lang, id } }));
  }
  function addCustom(lang, word, meaning, sentence) {
    const C = CFG[lang], custom = LS.get(C.prefix + 'custom', []), id = (lang === 'de' ? 'de-my-' : 'my-') + key(word).replace(/\s+/g, '-');
    if (!custom.some(c => c.id === id)) custom.push({ id, term: word, kind: /\s/.test(word) ? 'phrase' : 'word', cat: '', gender: '', forms: '', grammar: '', meaning, ex: sentence || '', exEn: '', mistake: '', notes: 'Added while reading or practising', ipa: '', level: (String(LS.get(C.level, 'B1')) || 'B1').replace('all', 'B1'), theme: 'imported', src: 'import' });
    LS.set(C.prefix + 'custom', custom); pin(lang, id);
    if (cache[lang]) cache[lang].push({ id, term: word, k: key(word), b: base(word), meaning, mine: true });
  }
  window.GRLookup = { addCustom, load, key };

  // ---------- popover ----------
  let box = null, ctx = null;
  function ensureBox() {
    if (box) return box;
    const st = document.createElement('style');
    st.textContent = `.lk{position:fixed;z-index:60;left:50%;bottom:calc(16px + env(safe-area-inset-bottom));transform:translateX(-50%);width:min(440px,calc(100vw - 24px));background:var(--surface,#fff);color:var(--ink);border:1px solid var(--line);border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.22);padding:16px 18px;font:16px Inter,system-ui,sans-serif}
.lk h3{font:650 21px Inter,sans-serif;margin:0 30px 6px 0}.lk .x{position:absolute;right:8px;top:8px;width:40px;height:40px;border:0;background:none;color:var(--mute);font-size:24px;cursor:pointer}
.lk ul{list-style:none;margin:0;padding:0}.lk li{display:flex;gap:10px;align-items:center;justify-content:space-between;padding:8px 0;border-top:1px solid var(--line)}
.lk li b{font-size:17px}.lk li small{display:block;color:var(--mute);font-size:13px}.lk .add{flex:none;font:inherit;font-size:14px;min-height:38px;padding:4px 14px;border-radius:10px;border:1px solid var(--line);background:var(--surface,#fff);color:var(--ink);cursor:pointer}
.lk .add.done{border-color:transparent;color:var(--ok);cursor:default}.lk .note{color:var(--mute);font-size:13px;margin:6px 0 0}.lk form{display:flex;gap:8px;margin-top:8px;flex-wrap:wrap}.lk input,.lk select{font:inherit;min-height:40px;padding:4px 10px;border:1px solid var(--line);border-radius:10px;background:var(--bg);color:var(--ink)}.lk input{flex:1;min-width:0}
.lk a{color:inherit}`;
    document.head.appendChild(st);
    box = document.createElement('div'); box.className = 'lk'; box.hidden = true; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Word lookup');
    document.body.appendChild(box);
    box.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.classList.contains('x')) close();
      else if (b.dataset.id && !b.classList.contains('done')) { pin(ctx.lang, b.dataset.id); b.textContent = 'Added ✓'; b.classList.add('done'); }
    });
    box.addEventListener('submit', e => {
      e.preventDefault();
      const m = box.querySelector('input').value.trim(); if (!m) return;
      const art = box.querySelector('select'), w = (art && art.value ? art.value + ' ' : '') + ctx.word;
      addCustom(ctx.lang, w, m, ctx.sentence);
      box.querySelector('form').outerHTML = '<p class="note">Added to your flashcards ✓</p>';
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    return box;
  }
  function close() { if (box) box.hidden = true; }
  function show(lang, word, sentence) {
    ensureBox(); ctx = { lang, word, sentence };
    box.hidden = false;
    box.innerHTML = `<button class="x" aria-label="Close">×</button><h3 lang="${lang}">${esc(word)}</h3><p class="note">Looking it up…</p>`;
    load(lang).then(cards => {
      const r = find(cards, word, lang);
      const items = r.list.map(c => `<li><span><b lang="${lang}">${esc(c.term)}</b> <small>${esc(c.meaning)}${c.level ? ' · ' + esc(c.level) : ''}${c.grammar ? ' · ' + esc(c.grammar) : ''}</small></span><button class="add${has(lang, c.id) ? ' done' : ''}" data-id="${esc(c.id)}">${has(lang, c.id) ? 'In flashcards' : '+ Flashcards'}</button></li>`).join('');
      const wik = `<a href="https://en.wiktionary.org/wiki/${encodeURIComponent(lang === 'de' && /^[A-ZÄÖÜ]/.test(word) ? word : key(word))}#${lang === 'de' ? 'German' : 'Russian'}" target="_blank" rel="noopener">Wiktionary</a>`;
      const artSel = lang === 'de' && /^[A-ZÄÖÜ]/.test(word) ? `<select aria-label="Article"><option value="">–</option><option>der</option><option>die</option><option>das</option></select>` : '';
      box.innerHTML = `<button class="x" aria-label="Close">×</button><h3 lang="${lang}">${esc(word)}</h3>
${items ? `${r.exact ? '' : '<p class="note">Not in the decks in this form. Closest dictionary forms:</p>'}<ul>${items}</ul>` : '<p class="note">This word is not in the flashcard decks yet.</p>'}
${r.exact ? '' : `<form>${artSel}<input placeholder="Meaning in English" aria-label="Meaning in English"><button class="add">Add as my card</button></form>`}
<p class="note">Look it up: ${wik}. Added words appear in ${CFG[lang].vocab}.</p>`;
    });
  }

  // ---------- find the tapped word ----------
  function wordAt(x, y, C) {
    let node, off;
    if (document.caretPositionFromPoint) { const p = document.caretPositionFromPoint(x, y); if (!p) return null; node = p.offsetNode; off = p.offset; }
    else if (document.caretRangeFromPoint) { const r = document.caretRangeFromPoint(x, y); if (!r) return null; node = r.startContainer; off = r.startOffset; }
    if (!node || node.nodeType !== 3) return null;
    const t = node.textContent; let a = off, b = off;
    while (a > 0 && C.word.test(t[a - 1])) a--;
    while (b < t.length && C.word.test(t[b])) b++;
    const w = t.slice(a, b).replace(/^-+|-+$/g, '');
    return w.length > 1 && C.has.test(w) ? w : null;
  }
  document.addEventListener('click', e => {
    if (box && box.contains(e.target)) return;
    const host = e.target.closest('[lang="ru"],[lang="de"]');
    if (!host || e.target.closest('button, a, input, textarea, select, label, .tile, .wtok, .gap, .art, .hid') || !host.closest('#card, .misses, .reader, .pb')) { close(); return; }
    if (String(window.getSelection && window.getSelection()).length > 1) return;
    const lang = host.getAttribute('lang'), C = CFG[lang]; if (!C) return;
    const w = wordAt(e.clientX, e.clientY, C); if (!w) { close(); return; }
    const sentenceEl = e.target.closest('.sent') || host;
    show(lang, w, sentenceEl.textContent.trim().replace(/\s+/g, ' '));
  });
})();
