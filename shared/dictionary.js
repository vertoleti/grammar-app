/* Dictionary: every word and phrase the app knows for one language (the flashcard decks plus your own cards),
   searchable and filterable, with your learning status. Tap a word for forms, an example, audio, and to learn it. */
(function () {
  const LG = window.GR_L || { code: 'ru', root: '../' }, L = LG.code, DE = L === 'de';
  const ROOT = LG.root || '../', VP = DE ? 'de-voc-' : 'voc-';
  const DECKS = DE ? ['de/vocabulary/decks/de-core.tsv'] : ['vocabulary/decks/ru-core.tsv', 'vocabulary/decks/ru-levels.tsv'];
  const FLASH = '../vocabulary/';
  const S = window.GRSpeech;
  const $ = id => document.getElementById(id);
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const strip = s => String(s || '').replace(/<[^>]+>/g, '');
  const fold = s => strip(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ё/g, 'е').replace(/ß/g, 'ss');
  const ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const PAGE = 60;
  const FORMS = DE ? 'de/vocabulary/decks/de-forms.json' : 'vocabulary/decks/ru-forms.json';
  let forms = null, formsP = null;
  const loadForms = () => formsP || (formsP = fetch(new URL(FORMS, new URL(ROOT, location.href))).then(r => r.ok ? r.json() : {}).catch(() => ({})).then(j => (forms = j)));
  function table(f) {
    if (!f) return '';
    const lab = f.r.some(r => r[0]);
    return `${f.r.length ? `<div class="ftw"><table class="ft" lang="${L}">${f.h.some(Boolean) ? `<thead><tr>${lab ? '<th></th>' : ''}${f.h.map(h => `<th lang="en">${esc(h)}</th>`).join('')}</tr></thead>` : ''}<tbody>${f.r.map(r => `<tr>${lab ? `<th lang="en">${esc(r[0])}</th>` : ''}${r.slice(1).map(x => `<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : ''}${(f.x || []).map(x => `<p class="fx">${esc(x)}</p>`).join('')}`;
  }
  let cards = [], st = { q: '', status: LS.get(VP + 'dict-status', 'all'), lv: LS.get(VP + 'dict-lv', 'all'), open: null, shown: PAGE };

  function parse(t) {
    let cols = null; const out = [];
    t.replace(/\r/g, '').split('\n').forEach(l => {
      if (!l.trim()) return;
      if (l.startsWith('#')) { if (l.startsWith('#columns:')) cols = l.slice(9).split('\t'); return; }
      if (!cols) return;
      const f = l.split('\t'), c = {}; cols.forEach((n, i) => { c[n] = f[i] || ''; });
      if (c.id && c.term) out.push({ id: c.id, term: c.term, kind: c.kind, cat: c.category, art: c.article, forms: c.forms, grammar: c.grammar, meaning: strip(c.meaning_en), ex: c.example_target, exEn: c.example_en, lv: (c.cefr || '').toUpperCase(), notes: c.notes, mistake: c.common_mistake });
    });
    return out;
  }
  async function load() {
    const texts = await Promise.all(DECKS.map(d => fetch(new URL(d, new URL(ROOT, location.href))).then(r => r.ok ? r.text() : '').catch(() => '')));
    const seen = new Set(); cards = [];
    texts.forEach(t => parse(t).forEach(c => { if (!seen.has(c.id)) { seen.add(c.id); cards.push(c); } }));
    LS.get(VP + 'custom', []).forEach(c => cards.push({ id: c.id, term: c.term, kind: c.kind, cat: c.cat, art: c.gender && /^(der|die|das)$/.test(c.gender) ? c.gender : '', forms: c.forms, grammar: c.grammar, meaning: c.meaning, ex: c.ex, exEn: c.exEn, lv: (c.level || '').toUpperCase(), notes: c.notes, mine: true }));
    cards.forEach(c => { c.k = fold(c.term + ' ' + c.meaning + ' ' + (c.forms || '')); c.sk = fold(c.term).replace(/^(der|die|das|sich) /, '').replace(/^[^\p{L}]+/u, ''); });
  }
  function status(c, srs) {
    const e = ['r', 'p'].map(d => srs[c.id + '|' + d]).filter(Boolean);
    if (!e.length) return 'new';
    if (e.some(x => x.q === 'review' && x.ivl >= 21)) return 'known';
    return 'learning';
  }
  const NAMES = { all: 'All', new: 'Not started', learning: 'Learning', known: 'Known', mine: 'Mine' };

  function view() {
    const srs = LS.get(VP + 'srs', {});
    cards.forEach(c => { c.st = status(c, srs); c.pin = ['r', 'p'].some(d => srs[c.id + '|' + d]); });
    const cnt = { all: cards.length, new: 0, learning: 0, known: 0, mine: 0 };
    cards.forEach(c => { cnt[c.st]++; if (c.mine) cnt.mine++; });
    const q = fold(st.q.trim());
    const list = cards.filter(c => (st.lv === 'all' || c.lv === st.lv) && (st.status === 'all' || (st.status === 'mine' ? c.mine : c.st === st.status)) && (!q || c.k.includes(q)))
      .sort((a, b) => q ? (a.sk.startsWith(q) ? 0 : 1) - (b.sk.startsWith(q) ? 0 : 1) || a.sk.localeCompare(b.sk, L) : (ORDER.indexOf(a.lv) - ORDER.indexOf(b.lv)) || a.sk.localeCompare(b.sk, L));
    $('dstat').innerHTML = ['all', 'learning', 'known', 'new', 'mine'].filter(k => k !== 'mine' || cnt.mine).map(k => `<button data-st="${k}" aria-pressed="${st.status === k}">${NAMES[k]} <small>${cnt[k]}</small></button>`).join('');
    $('dlv').innerHTML = ['all', ...ORDER.filter(l => cards.some(c => c.lv === l))].map(l => `<button data-lv="${l}" aria-pressed="${st.lv === l}">${l === 'all' ? 'All levels' : l}</button>`).join('');
    const row = c => {
      const open = st.open === c.id;
      const head = `<button class="dw" data-id="${esc(c.id)}" aria-expanded="${open}"><span class="dt" lang="${L}">${esc(c.term)}</span><span class="dm">${esc(c.meaning)}</span><span class="dl">${c.lv || ''}</span><i class="ds ${c.st}" title="${NAMES[c.st]}"></i></button>`;
      if (!open) return `<li>${head}</li>`;
      const tb = forms && forms[c.id];
      const bits = [tb ? table(tb) : (c.forms && `<p><span class="k">Forms</span> <span lang="${L}">${esc(c.forms)}</span></p>`), c.grammar && `<p><span class="k">Grammar</span> ${esc(c.grammar)}</p>`,
        c.ex && `<p class="dex"><span lang="${L}">${esc(strip(c.ex))}</span>${c.exEn ? `<br><span class="mute">${esc(strip(c.exEn))}</span>` : ''}</p>`,
        c.mistake && `<p><span class="k">Watch out</span> ${esc(strip(c.mistake))}</p>`, c.notes && `<p class="mute">${esc(strip(c.notes))}</p>`].filter(Boolean).join('');
      return `<li class="open">${head}<div class="dd">${bits}<div class="row">${S && S.tts ? `<button class="btn" data-act="say" data-t="${esc(c.term)}">▶ Listen</button>` : ''}${c.pin ? `<span class="okline">${c.st === 'known' ? '✓ Known' : '✓ In your flashcards'}</span>` : `<button class="btn go" data-act="learn" data-id="${esc(c.id)}">Learn this word</button>`}${c.mine ? `<button class="btn" data-act="del" data-id="${esc(c.id)}">Remove</button>` : ''}</div></div></li>`;
    };
    $('dlist').innerHTML = list.slice(0, st.shown).map(row).join('') || `<li class="empty">${q ? `No word matches “${esc(st.q)}”. Add it as your own below.` : 'Nothing here yet.'}</li>`;
    $('dmore').hidden = list.length <= st.shown; $('dmore').textContent = `Show more (${list.length - st.shown})`;
    $('dcount').textContent = `${list.length} of ${cards.length}`;
  }

  function page() {
    $('main').innerHTML = `<section class="xcard dict">
<div class="dsearch"><input id="dq" type="search" placeholder="${DE ? 'Search German or English' : 'Search Russian or English'}" aria-label="Search" autocomplete="off" lang="${L}"><span id="dcount" class="mute"></span></div>
<div class="seg segctl dseg" id="dstat" role="group" aria-label="Status"></div>
<div class="seg segctl dseg" id="dlv" role="group" aria-label="Level"></div>
<ul class="dlist" id="dlist"><li class="empty">Loading…</li></ul>
<button class="btn" id="dmore" hidden></button></section>
<section class="xcard"><details class="refbox" id="dadd"><summary>Add your own word</summary><div class="refin"><form id="daf" class="impf">
<input id="dat" required placeholder="${DE ? 'Wort, e.g. die Stadtbibliothek' : 'Слово, e.g. библиотека'}" lang="${L}" aria-label="Word"><input id="dam" required placeholder="Meaning in English" aria-label="Meaning">
<div class="row"><button class="btn go">Add to dictionary and flashcards</button></div></form></div></details>
<p class="note">Learning happens in the <a href="${FLASH}">flashcards</a>. Words you add while reading also appear here.</p></section>`;
    let t = null;
    $('dq').addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { st.q = $('dq').value; st.shown = PAGE; st.open = null; view(); }, 120); });
    $('dstat').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; st.status = b.dataset.st; LS.set(VP + 'dict-status', st.status); st.shown = PAGE; view(); });
    $('dlv').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; st.lv = b.dataset.lv; LS.set(VP + 'dict-lv', st.lv); st.shown = PAGE; view(); });
    $('dmore').addEventListener('click', () => { st.shown += PAGE; view(); });
    $('dlist').addEventListener('click', e => {
      const a = e.target.closest('[data-act]');
      if (a) {
        if (a.dataset.act === 'say') S.say(a.dataset.t.replace(/[́]/g, ''), L);
        else if (a.dataset.act === 'learn' && window.GRLookup) { window.GRLookup.pin(L, a.dataset.id); view(); }
        else if (a.dataset.act === 'del' && confirm('Remove this word from your dictionary and flashcards?')) {
          LS.set(VP + 'custom', LS.get(VP + 'custom', []).filter(c => c.id !== a.dataset.id));
          const s = LS.get(VP + 'srs', {}); ['r', 'p'].forEach(d => delete s[a.dataset.id + '|' + d]); LS.set(VP + 'srs', s);
          cards = cards.filter(c => c.id !== a.dataset.id); view();
        }
        return;
      }
      const w = e.target.closest('.dw'); if (!w) return;
      st.open = st.open === w.dataset.id ? null : w.dataset.id; view();
      if (st.open && !forms) loadForms().then(view);
    });
    $('daf').addEventListener('submit', e => {
      e.preventDefault(); const w = $('dat').value.trim(), m = $('dam').value.trim(); if (!w || !m || !window.GRLookup) return;
      window.GRLookup.addCustom(L, w, m, '');
      $('dat').value = ''; $('dam').value = ''; st.q = ''; $('dq').value = ''; st.status = 'mine'; st.lv = 'all';
      load().then(view);
    });
  }
  page();
  load().then(() => { const h = decodeURIComponent(location.hash.slice(1)); if (h) { st.q = h; $('dq').value = h; } view(); });
  window.__gr = { cards: () => cards };   // used by the automated tests
})();
