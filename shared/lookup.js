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
  function addCustom(lang, word, meaning, sentence, extra) {
    const C = CFG[lang], custom = LS.get(C.prefix + 'custom', []), id = (lang === 'de' ? 'de-my-' : 'my-') + key(word).replace(/\s+/g, '-');
    const x = extra || {}, phrase = /\s/.test(word.replace(/^(der|die|das) /, ''));
    if (!custom.some(c => c.id === id)) custom.push({ id, term: word, kind: phrase ? 'phrase' : 'word', cat: phrase ? 'phrase' : (x.cat || ''), gender: x.gender || '', forms: x.forms || '', grammar: x.grammar || '', meaning, ex: sentence || '', exEn: x.exEn || '', mistake: '', notes: x.notes || 'Added while reading or practising', ipa: '', level: (String(LS.get(C.level, 'B1')) || 'B1').replace('all', 'B1'), theme: 'imported', src: 'import' });
    LS.set(C.prefix + 'custom', custom); pin(lang, id);
    if (cache[lang]) cache[lang].push({ id, term: word, k: key(word), b: base(word), meaning, mine: true });
  }

  // ---------- meaning suggestions (like LingQ): your decks first, then Wiktionary, then a translation service ----------
  const MC = 'gr-meaning-cache';
  const withTimeout = (url, ms = 6000) => { const a = new AbortController(); const t = setTimeout(() => a.abort(), ms); return fetch(url, { signal: a.signal }).finally(() => clearTimeout(t)); };
  const clean = h => String(h || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
  const FORM = /\b(inflection|plural|singular|genitive|dative|accusative|instrumental|prepositional|locative|nominative|participle|past|present|imperative|feminine|masculine|neuter|comparative|superlative|first-person|second-person|third-person|form|short)\b.*\bof\s+([\p{L}́-]+(?:\s[\p{L}́-]+)?)/iu;
  async function wiktionary(lang, text) {
    const t = bare(text), tries = [...new Set([t, t.toLowerCase(), t[0].toUpperCase() + t.slice(1)])];
    for (const w of tries) {
      try {
        const r = await withTimeout(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(w.replace(/ /g, '_'))}?redirect=true`);
        if (!r.ok) continue;
        const j = await r.json(), entries = j[lang] || [];
        if (!entries.length) continue;
        const out = { means: [], lemma: '', pos: entries[0].partOfSpeech || '' };
        entries.forEach(en => (en.definitions || []).forEach(d => {
          const g = clean(d.definition); if (!g) return;
          const f = g.match(FORM);
          if (f && !out.lemma && g.length < 140) { out.lemma = f[2].replace(/[:.]$/, ''); out.formOf = g.replace(/:$/, ''); return; }
          if (g.length <= 90) out.means.push(g.replace(/\.$/, ''));
        }));
        if (out.means.length || out.lemma) return out;
      } catch (e) {}
    }
    return null;
  }
  async function translate(lang, text) {
    try {
      const r = await withTimeout(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(bare(text))}&langpair=${lang}|en`);
      if (!r.ok) return [];
      const j = await r.json(), out = [];
      const add = t => { t = clean(t); if (t && t.length <= 80 && key(t) !== key(text) && !/MYMEMORY|QUERY LENGTH/i.test(t)) out.push(t.replace(/\.$/, '')); };
      add(j.responseData && j.responseData.translatedText);
      (j.matches || []).filter(m => (m.quality == null || +m.quality >= 50) && m.translation).slice(0, 6).forEach(m => add(m.translation));
      return out;
    } catch (e) { return []; }
  }
  // returns { list: [{ m, src }], lemma, formOf }
  async function suggest(lang, text, deckMeanings) {
    const k = lang + ':' + key(text), cached = LS.get(MC, {});
    let web = cached[k];
    if (!web) {
      const [w, t] = await Promise.all([wiktionary(lang, text), translate(lang, text)]);
      web = { w: w ? w.means : [], lemma: w ? w.lemma : '', formOf: w ? w.formOf : '', t };
      if (web.w.length || web.t.length || web.lemma) { cached[k] = web; const ks = Object.keys(cached); if (ks.length > 300) delete cached[ks[0]]; LS.set(MC, cached); }
    }
    const seen = new Set(), list = [];
    const push = (m, src) => { const kk = key(m).replace(/[^\p{L}\d ]/gu, ''); if (m && !seen.has(kk)) { seen.add(kk); list.push({ m, src }); } };
    (deckMeanings || []).forEach(m => push(m, 'deck'));
    web.w.slice(0, 4).forEach(m => push(m, 'Wiktionary'));
    web.t.slice(0, 3).forEach(m => push(m, 'translation'));
    return { list: list.slice(0, 6), lemma: web.lemma, formOf: web.formOf };
  }
  // chips under a meaning input; onPick(meaning)
  function chips(el, res, onPick, onLemma) {
    if (!el) return;
    if (!res.list.length && !res.lemma) { el.innerHTML = '<span class="lk-none">No suggestions (offline?). Type your own meaning.</span>'; return; }
    el.innerHTML = (res.lemma ? `<p class="lk-lemma">${esc(res.formOf || 'Form of ' + res.lemma)} <button type="button" data-lemma="${esc(res.lemma)}">Add “${esc(res.lemma)}” instead</button></p>` : '') +
      res.list.map(x => `<button type="button" class="lk-chip" data-m="${esc(x.m)}">${esc(x.m)}<small>${x.src}</small></button>`).join('');
    el.onclick = e => { const b = e.target.closest('button'); if (!b) return; e.preventDefault(); e.stopPropagation(); if (b.dataset.m) onPick(b.dataset.m, b); else if (b.dataset.lemma && onLemma) onLemma(b.dataset.lemma); };
  }
  window.GRLookup = { addCustom, load, key, pin, suggest, chips };
  window.GRMeanings = { suggest, chips };

  // ---------- popover: one word, or several words as a phrase ----------
  let box = null, ctx = null;
  const CSS = `.lk{position:fixed;z-index:60;left:50%;bottom:calc(12px + env(safe-area-inset-bottom));transform:translateX(-50%);width:min(460px,calc(100vw - 20px));max-height:min(78vh,640px);overflow-y:auto;background:var(--surface,#fff);color:var(--ink);border:1px solid var(--line);border-radius:18px;box-shadow:0 16px 48px rgba(0,0,0,.25);padding:16px 18px 14px;font:16px Inter,system-ui,sans-serif}
.lk h3{font:650 22px/1.25 Inter,sans-serif;margin:0 40px 2px 0}.lk .x{position:absolute;right:8px;top:8px;width:40px;height:40px;border:0;background:none;color:var(--mute);font-size:24px;cursor:pointer}
.lk .lk-ext{display:flex;gap:6px;margin:8px 0 4px;flex-wrap:wrap}.lk .lk-ext button{font:600 13px Inter,sans-serif;min-height:34px;padding:0 12px;border-radius:999px;border:1px solid var(--line);background:var(--surface,#fff);color:var(--ink);cursor:pointer}
.lk .lk-ext button[aria-pressed=true]{background:var(--ink);color:var(--surface);border-color:var(--ink)}
.lk ul{list-style:none;margin:8px 0 0;padding:0}.lk li{display:flex;gap:10px;align-items:center;justify-content:space-between;padding:8px 0;border-top:1px solid var(--line)}
.lk li b{font-size:17px}.lk li small{display:block;color:var(--mute);font-size:13px}.lk .add{flex:none;font:600 14px Inter,sans-serif;min-height:38px;padding:4px 14px;border-radius:10px;border:1px solid var(--line);background:var(--surface,#fff);color:var(--ink);cursor:pointer}
.lk .add.done{border-color:transparent;color:var(--ok);cursor:default}.lk .note{color:var(--mute);font-size:13px;margin:8px 0 0}
.lk form{display:grid;gap:8px;margin-top:10px}.lk .row2{display:flex;gap:8px}.lk input,.lk select{font:16px Inter,sans-serif;min-height:42px;padding:4px 12px;border:1px solid var(--line);border-radius:10px;background:var(--bg);color:var(--ink)}.lk input{flex:1;min-width:0}
.lk .go{min-height:44px;border:0;border-radius:12px;background:var(--ink);color:var(--surface);font:600 15px Inter,sans-serif;cursor:pointer}
.lk-sugs{display:flex;flex-wrap:wrap;gap:6px}.lk-chip{display:inline-flex;flex-direction:column;align-items:flex-start;text-align:left;font:500 14px Inter,sans-serif;padding:6px 10px;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--ink);cursor:pointer;max-width:100%}
.lk-chip small{font-size:10px;color:var(--mute);text-transform:uppercase;letter-spacing:.04em}.lk-chip[aria-pressed=true]{border-color:var(--ok);background:var(--okbg)}
.lk-none,.lk-wait{font-size:13px;color:var(--mute)}.lk-lemma{margin:0 0 6px;font-size:13px;color:var(--mute);width:100%}.lk-lemma button{font:600 13px Inter,sans-serif;border:0;background:none;color:var(--blue);padding:0;cursor:pointer;text-decoration:underline}
.lk-sel{background:var(--mark);border-radius:3px}
.lk a{color:inherit}`;
  function ensureBox() {
    if (box) return box;
    const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    box = document.createElement('div'); box.className = 'lk'; box.hidden = true; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Word lookup');
    document.body.appendChild(box);
    box.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.classList.contains('x')) close();
      else if (b.dataset.ext) extend(b.dataset.ext);
      else if (b.dataset.id && !b.classList.contains('done')) { pin(ctx.lang, b.dataset.id); b.textContent = 'Added ✓'; b.classList.add('done'); }
    });
    box.addEventListener('submit', e => {
      e.preventDefault();
      const m = box.querySelector('#lkm').value.trim(); if (!m) { box.querySelector('#lkm').focus(); return; }
      const art = box.querySelector('#lka'), w = (art && art.value ? art.value + ' ' : '') + ctx.text;
      addCustom(ctx.lang, w, m, ctx.sentence, { gender: art && art.value ? { der: 'm', die: 'f', das: 'n' }[art.value] : '', notes: document.title ? 'From: ' + document.title : '' });
      box.querySelector('form').outerHTML = `<p class="note" style="color:var(--ok);font-weight:600">Added to your flashcards ✓ <span style="font-weight:400;color:var(--mute)">· with this sentence as the example</span></p>`;
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    return box;
  }
  function close() { if (box) box.hidden = true; unmark(); ctx = null; }

  // the sentence as words, so a phrase can grow word by word
  function tokens(s) { const out = [], re = /[\p{L}́’'-]+/gu; let m; while ((m = re.exec(s))) out.push({ w: m[0], a: m.index, b: m.index + m[0].length }); return out; }
  function phraseText() { const t = ctx.toks; return ctx.sentence.slice(t[ctx.i].a, t[ctx.j].b); }
  function extend(dir) {
    if (!ctx) return;
    if (dir === 'next' && ctx.j < ctx.toks.length - 1) ctx.j++;
    else if (dir === 'prev' && ctx.i > 0) ctx.i--;
    else if (dir === 'less' && ctx.j > ctx.i) ctx.j--;
    else if (dir === 'tap') { ctx.tapMode = !ctx.tapMode; }
    render();
  }
  // highlight the chosen words in the text
  let marked = [];
  function unmark() { marked.forEach(m => { const p = m.parentNode; if (p) { p.replaceChild(document.createTextNode(m.textContent), m); p.normalize(); } }); marked = []; }
  function mark() {
    unmark(); if (!ctx || !ctx.el) return;
    const t = ctx.toks, a = t[ctx.i].a, b = t[ctx.j].b;
    const walker = document.createTreeWalker(ctx.el, NodeFilter.SHOW_TEXT); let pos = 0, n; const parts = [];
    while ((n = walker.nextNode())) { const len = n.textContent.length, s0 = Math.max(a, pos), e0 = Math.min(b, pos + len); if (s0 < e0) parts.push([n, s0 - pos, e0 - pos]); pos += len; }
    parts.forEach(([node, s0, e0]) => { const r = document.createRange(); r.setStart(node, s0); r.setEnd(node, e0); const m = document.createElement('mark'); m.className = 'lk-sel'; try { r.surroundContents(m); marked.push(m); } catch (e) {} });
  }
  function render() {
    const lang = ctx.lang, text = phraseText(), multi = ctx.j > ctx.i;
    ctx.text = text; mark();
    ensureBox(); box.hidden = false;
    const seq = ++ctx.seq;
    if (ctx.tapMode) {   // stay small so the text stays visible while you pick the last word
      box.innerHTML = `<button class="x" aria-label="Close">×</button><h3 lang="${lang}">${esc(text)} …</h3><p class="note">Tap the last word of the phrase in the text.</p><div class="lk-ext"><button data-ext="tap" aria-pressed="true">Cancel</button></div>`;
      return;
    }
    const artSel = lang === 'de' && !multi && /^[A-ZÄÖÜ]/.test(text) && ctx.i > 0 ? `<select id="lka" aria-label="Article"><option value="">–</option><option>der</option><option>die</option><option>das</option></select>` : '';
    box.innerHTML = `<button class="x" aria-label="Close">×</button><h3 lang="${lang}">${esc(text)}</h3>
<div class="lk-ext">${ctx.i > 0 ? '<button data-ext="prev">‹ Word before</button>' : ''}${ctx.j < ctx.toks.length - 1 ? '<button data-ext="next">Next word ›</button>' : ''}${multi ? '<button data-ext="less">− Last word</button>' : ''}<button data-ext="tap" aria-pressed="${!!ctx.tapMode}">${ctx.tapMode ? 'Tap the last word of the phrase…' : 'Make a phrase'}</button></div>
<div id="lkdeck"></div>
<form><label class="note" style="margin:0">Meaning</label><div class="row2">${artSel}<input id="lkm" placeholder="Meaning in English" aria-label="Meaning in English" autocomplete="off"></div>
<div class="lk-sugs" id="lksug"><span class="lk-wait">Finding meanings…</span></div><button class="go">Add ${multi ? 'phrase' : 'word'} to my flashcards</button></form>
<p class="note">The sentence becomes the card’s example. Look it up: <a href="https://en.wiktionary.org/wiki/${encodeURIComponent(bare(lang === 'de' && /^[A-ZÄÖÜ]/.test(text) && ctx.i > 0 ? text : text.toLowerCase()).replace(/ /g, '_'))}#${lang === 'de' ? 'German' : 'Russian'}" target="_blank" rel="noopener">Wiktionary</a></p>`;
    load(lang).then(cards => {
      if (!ctx || seq !== ctx.seq) return;
      const r = find(cards, text, lang);
      const deckMeans = r.list.map(c => String(c.meaning || '').replace(/<[^>]+>/g, ''));
      if (r.list.length) box.querySelector('#lkdeck').innerHTML = `${r.exact ? '' : '<p class="note">In your decks (closest forms):</p>'}<ul>${r.list.map(c => `<li><span><b lang="${lang}">${esc(c.term)}</b> <small>${esc(c.meaning)}${c.level ? ' · ' + esc(c.level) : ''}</small></span><button class="add${has(lang, c.id) ? ' done' : ''}" data-id="${esc(c.id)}">${has(lang, c.id) ? 'In flashcards' : '+ Flashcards'}</button></li>`).join('')}</ul>`;
      suggest(lang, text, r.exact ? deckMeans : []).then(res => {
        if (!ctx || seq !== ctx.seq) return;
        chips(box.querySelector('#lksug'), res, (m, b) => { const inp = box.querySelector('#lkm'); inp.value = m; box.querySelectorAll('.lk-chip').forEach(x => x.setAttribute('aria-pressed', x === b)); },
          lemma => { ctx.text = lemma; box.querySelector('h3').textContent = lemma; box.querySelector('#lksug').innerHTML = '<span class="lk-wait">Finding meanings…</span>'; suggest(lang, lemma, []).then(r2 => chips(box.querySelector('#lksug'), r2, m => { box.querySelector('#lkm').value = m; })); });
      });
    });
  }
  function show(lang, el, offset, sentence) {
    const toks = tokens(sentence), i = Math.max(0, toks.findIndex(t => offset >= t.a && offset <= t.b));
    ctx = { lang, el, sentence, toks, i, j: i, seq: 0, tapMode: false };
    render();
  }

  // ---------- find the tapped word ----------
  function caret(x, y) {
    if (document.caretPositionFromPoint) { const p = document.caretPositionFromPoint(x, y); return p && { node: p.offsetNode, off: p.offset }; }
    if (document.caretRangeFromPoint) { const r = document.caretRangeFromPoint(x, y); return r && { node: r.startContainer, off: r.startOffset }; }
    return null;
  }
  function offsetIn(el, node, off) { const r = document.createRange(); r.setStart(el, 0); r.setEnd(node, off); return r.toString().length; }
  document.addEventListener('click', e => {
    if (!e.target.isConnected || (box && box.contains(e.target))) return;   // clicks inside the popover (even on a button it just replaced)
    const host = e.target.closest('[lang="ru"],[lang="de"]');
    if (!host || e.target.closest('button, a, input, textarea, select, label, .tile, .wtok, .gap, .art, .hid') || !host.closest('#card, .misses, .reader, .pb')) { close(); return; }
    if (String(window.getSelection && window.getSelection()).trim().includes(' ')) return;   // a selection is handled below
    const lang = host.getAttribute('lang'), C = CFG[lang]; if (!C) return;
    const c = caret(e.clientX, e.clientY); if (!c || !c.node || c.node.nodeType !== 3) { close(); return; }
    const t = c.node.textContent; if (!C.word.test(t[c.off] || '') && !C.word.test(t[c.off - 1] || '')) { close(); return; }
    const sentenceEl = e.target.closest('.sent') || host;
    // phrase mode: a tap in the same sentence extends the phrase to that word
    if (ctx && ctx.tapMode && ctx.el === sentenceEl) {
      unmark(); const off = offsetIn(sentenceEl, ...(() => { const c2 = caret(e.clientX, e.clientY); return [c2.node, c2.off]; })());
      const k = ctx.toks.findIndex(tk => off >= tk.a && off <= tk.b);
      if (k >= 0) { if (k < ctx.i) ctx.i = k; else ctx.j = k; ctx.tapMode = false; render(); }
      return;
    }
    unmark();
    const c2 = caret(e.clientX, e.clientY); if (!c2) return;
    const off = offsetIn(sentenceEl, c2.node, c2.off);
    show(lang, sentenceEl, off, sentenceEl.textContent);
  });
  // select several words (long-press and drag on a phone): open the phrase
  function fromSelection() {
    const sel = window.getSelection && window.getSelection(); if (!sel || sel.isCollapsed || !sel.rangeCount) return;
    const txt = String(sel).trim(); if (!txt.includes(' ') || txt.split(/\s+/).length > 10) return;
    const r = sel.getRangeAt(0), anc = r.commonAncestorContainer.nodeType === 3 ? r.commonAncestorContainer.parentNode : r.commonAncestorContainer;
    const host = anc.closest && anc.closest('[lang="ru"],[lang="de"]'); if (!host || !host.closest('#card, .misses, .reader, .pb')) return;
    const el = anc.closest('.sent') || host, lang = host.getAttribute('lang'); if (!CFG[lang]) return;
    unmark();
    const a = offsetIn(el, r.startContainer, r.startOffset), b = offsetIn(el, r.endContainer, r.endOffset);
    const toks = tokens(el.textContent), i = toks.findIndex(t => t.b > a), j = toks.length - 1 - [...toks].reverse().findIndex(t => t.a < b);
    if (i < 0 || j < i) return;
    sel.removeAllRanges();
    ctx = { lang, el, sentence: el.textContent, toks, i, j, seq: 0, tapMode: false }; render();
  }
  document.addEventListener('mouseup', () => setTimeout(fromSelection, 10));
  document.addEventListener('touchend', () => setTimeout(fromSelection, 350));
})();
