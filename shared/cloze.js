/* Words in context: a sentence with one word missing; choose the word that fits.
   Sentences come from the flashcard examples and the reading texts (tools/build_cloze.py).
   Words you are learning in the flashcards come first, then words at your level. */
(function () {
  const LG = window.GR_L || { code: 'ru', root: '../' }, L = LG.code, DE = L === 'de';
  const ROOT = LG.root || '../', VP = DE ? 'de-voc-' : 'voc-', P = DE ? 'de-' : 'gr-', ID = DE ? 'de-cloze' : 'cloze';
  const FILES = DE ? { c: 'de/vocabulary/decks/de-cloze.json', d: ['de/vocabulary/decks/de-core.tsv'] } : { c: 'vocabulary/decks/ru-cloze.json', d: ['vocabulary/decks/ru-core.tsv', 'vocabulary/decks/ru-levels.tsv'] };
  const C = window.GRCoach, S = window.GRSpeech;
  const $ = id => document.getElementById(id);
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const shuf = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const url = p => new URL(p, new URL(ROOT, location.href));
  let items = [], meta = {}, st = { round: [], i: 0, ans: null, right: 0, at: 0, size: LS.get(P + 'cloze-size', 10) };

  async function load() {
    const [ci, ...decks] = await Promise.all([fetch(url(FILES.c)).then(r => r.json()).catch(() => []), ...FILES.d.map(d => fetch(url(d)).then(r => r.text()).catch(() => ''))]);
    items = ci;
    decks.forEach(t => { let cols = null; t.split('\n').forEach(l => { if (l.startsWith('#columns:')) cols = l.slice(9).split('\t'); else if (cols && l && !l.startsWith('#')) { const f = l.split('\t'), c = {}; cols.forEach((n, i) => c[n] = f[i] || ''); meta[c.id] = { term: c.term, meaning: c.meaning_en.replace(/<[^>]+>/g, '') }; } }); });
  }
  function newRound() {
    const srs = LS.get(VP + 'srs', {}), stats = C ? C.stats(ID) : {};
    const lvPref = LS.get(DE ? 'de-level' : 'gr-level', 'all'), li = lvPref === 'all' ? 5 : ORDER.indexOf(lvPref);
    const learning = new Set(Object.keys(srs).map(k => k.split('|')[0]));
    const seenRecently = new Set(LS.get(P + 'cloze-seen', []));
    const score = x => (learning.has(x.id) ? 0 : 2) + (ORDER.indexOf(x.lv) <= li ? 0 : 3) + (seenRecently.has(x.id + x.s) ? 4 : 0) + Math.random() * 1.5;
    const picked = [], ids = new Set();
    items.slice().sort((a, b) => score(a) - score(b)).forEach(x => { if (picked.length < st.size && !ids.has(x.id)) { ids.add(x.id); picked.push(x); } });
    st.round = shuf(picked).map(x => {
      const pool = items.filter(y => y.cat === x.cat && y.id !== x.id && y.a.toLowerCase() !== x.a.toLowerCase() && Math.abs(ORDER.indexOf(y.lv) - ORDER.indexOf(x.lv)) <= 1);
      const opts = [x.a]; shuf(pool).forEach(y => { if (opts.length < 4 && !opts.some(o => o.toLowerCase() === y.a.toLowerCase())) opts.push(x.s.startsWith('___') ? y.a[0].toUpperCase() + y.a.slice(1) : (!DE ? y.a.toLowerCase() : y.a)); });
      return Object.assign({ o: shuf(opts) }, x);
    });
    st.i = 0; st.right = 0; st.ans = null; render();
  }
  function render() {
    if (st.i >= st.round.length) return end();
    const q = st.round[st.i], m = meta[q.id] || {}, done = st.ans !== null;
    const full = esc(q.s).replace('___', `<b class="${done ? (st.ans === q.a ? 'gok' : 'gno') : 'gap'}">${done ? esc(q.a) : '&nbsp;'}</b>`);
    $('main').innerHTML = `<section class="xcard cz">
<p class="meta"><span>${done ? `${q.lv} · ${q.src === 'text' ? 'from a reading text' : 'example'}` : ''}</span><span>${st.i + 1} / ${st.round.length}</span></p>
<p class="czs" lang="${L}">${full}</p>
${q.en ? `<p class="czen">${esc(q.en)}</p>` : `<p class="czen">Hint: <i>${esc(m.meaning || '')}</i></p>`}
<div class="opts">${q.o.map(o => `<button class="opt${done ? (o === q.a ? ' ok' : o === st.ans ? ' bad' : '') : ''}" data-act="pick" data-v="${esc(o)}" lang="${L}" ${done ? 'aria-disabled="true"' : ''}>${esc(o)}</button>`).join('')}</div>
${done ? `<div class="fb"><p class="verdict ${st.ans === q.a ? 'ok' : 'bad'}">${st.ans === q.a ? '✓ Correct' : `✗ Answer: <b lang="${L}">${esc(q.a)}</b>`}</p><p class="why"><span lang="${L}">${esc(m.term || '')}</span> · ${esc(m.meaning || '')}</p>
<p class="links">${S && S.tts ? `<button class="linkbtn" data-act="say">▶ Listen</button>` : ''}<a href="../dictionary/#${encodeURIComponent((m.term || '').replace(/́/g, ''))}">In the dictionary</a></p></div>
<div class="dock">${(+localStorage.getItem('gr-taphint') || 0) <= 5 ? '<span class="taphint">Or tap your answer again</span>' : `<span>${st.i + 1} / ${st.round.length}</span>`}<button class="btn go" id="next" data-act="next">${st.i + 1 < st.round.length ? 'Next' : 'See results'}</button></div>` : ''}
</section>`;
  }
  function pick(v) {
    const q = st.round[st.i]; st.ans = v; st.at = Date.now(); const ok = v === q.a; if (ok) st.right++;
    if (C) C.record(ID, 'cloze', ok, q.id);
    const seen = LS.get(P + 'cloze-seen', []); seen.push(q.id + q.s); LS.set(P + 'cloze-seen', seen.slice(-150));
    try { localStorage.setItem('gr-taphint', (+localStorage.getItem('gr-taphint') || 0) + 1); } catch (e) {}
    render();
  }
  function next() { st.i++; st.ans = null; render(); window.scrollTo(0, 0); }
  function end() {
    const pct = Math.round(st.right / (st.round.length || 1) * 100);
    if (C) LS.set(P + 'done-' + ID, C.dkey());
    $('main').innerHTML = `<section class="xcard cz"><div class="xdone"><p class="big">${pct}%</p><p>${st.right} of ${st.round.length} right.</p>
<div class="seg segctl" id="sz" role="group" aria-label="Round size" style="justify-content:center;margin:12px 0">${[10, 20].map(n => `<button data-n="${n}" aria-pressed="${st.size === n}">${n} sentences</button>`).join('')}</div>
<div class="row" style="justify-content:center"><button class="btn go" data-act="again">New round</button><a class="btn" href="../vocabulary/">Flashcards</a></div></div></section>`;
    if (window.GRSession) GRSession.offer(document.querySelector('.cz'));
  }
  $('main').addEventListener('click', e => {
    const b = e.target.closest('[data-act],[data-n]'); if (!b) return;
    if (b.dataset.n) { st.size = +b.dataset.n; LS.set(P + 'cloze-size', st.size); end(); return; }
    const a = b.dataset.act;
    if (a === 'pick') { if (st.ans === null) pick(b.dataset.v); else if (Date.now() - st.at > 400) next(); }
    else if (a === 'next') next();
    else if (a === 'again') newRound();
    else if (a === 'say') { const q = st.round[st.i]; S.say(q.s.replace('___', q.a), L); }
  });
  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.target.tagName === 'INPUT') return;
    const q = st.round[st.i]; if (!q) return;
    const d = parseInt(e.key, 10);
    if (st.ans === null && d >= 1 && d <= q.o.length) pick(q.o[d - 1]);
    else if (st.ans !== null && e.key === 'Enter') next();
  });
  $('main').innerHTML = '<section class="xcard"><p class="note">Loading…</p></section>';
  load().then(newRound);
  window.__gr = { q: () => st.round[st.i], items: () => items };   // used by the automated tests
})();
