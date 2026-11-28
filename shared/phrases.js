/* Situation phrasebook: key phrases (listen, say, save as flashcard), a dialogue (listen or role-play),
   and a short drill (meaning → phrase, listening → meaning). Data: window.PHRASES. */
(function () {
  const LG = window.GR_L || { code: 'ru' }, L = LG.code, DE = L === 'de', P = DE ? 'de-' : 'gr-', ID = DE ? 'de-phrases' : 'phrases';
  const D = window.PHRASES || [], C = window.GRCoach, S = window.GRSpeech;
  const $ = id => document.getElementById(id);
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const ME = DE ? 'Sie' : 'Вы';
  const TABS = [['p', 'Phrases'], ['d', 'Dialogue'], ['x', 'Drill']];
  let st = { tab: 'p', en: LS.get(P + 'pb-en', true), role: false, playing: false, drill: null };
  const done = () => LS.get(P + 'pb-done', {});
  const saved = () => new Set((LS.get((DE ? 'de-voc-' : 'voc-') + 'custom', [])).map(c => c.term));

  // ---------- list ----------
  function list() {
    const d = done();
    $('main').innerHTML = `<section class="xcard"><h2>${DE ? 'Situationen · Situations' : 'Ситуации · Situations'} <small>phrases, a dialogue and a drill each</small></h2>
<ul class="tl">${D.map(s => `<li><a href="#s=${s.id}"><b lang="${L}">${esc(s.title)}</b><span>${s.lv} · ${esc(s.en)} · ${s.phrases.length} phrases</span></a>${d[s.id] !== undefined ? `<span class="up">✓ ${d[s.id]}%</span>` : ''}</li>`).join('')}</ul></section>`;
  }

  // ---------- situation ----------
  const playBtn = (t, i) => S.tts ? `<button class="mic" data-act="say" data-t="${esc(t)}" aria-label="Listen">▶</button>` : '';
  const micBtn = (t, i) => `<button class="mic" data-act="mic" data-i="${i}" data-t="${esc(t)}" aria-label="Say it">🎤</button>`;
  function situation(s) {
    S.stop(); st.playing = false;
    const head = `<p class="back"><a href="#">← ${DE ? 'Alle Situationen · All situations' : 'Все ситуации · All situations'}</a></p>
<section class="xcard pb" lang="${L}"><p class="meta"><span>${s.lv}</span><span lang="en">${esc(s.en)}</span></p><h2 class="rtitle">${esc(s.title)}</h2>
<div class="seg segctl" id="tabs" role="group" aria-label="Section" lang="en">${TABS.map(([k, n]) => `<button data-tab="${k}" aria-pressed="${st.tab === k}">${n}</button>`).join('')}</div>`;
    let body = '';
    if (st.tab === 'p') {
      const sv = saved();
      body = `<div class="rtools" lang="en"><button class="btn" data-act="en" aria-pressed="${st.en}">${st.en ? 'Hide English' : 'Show English'}</button></div>
<ul class="plist">${s.phrases.map(([t, e], i) => `<li><div><span class="sent" data-i="${i}">${esc(t)}</span>${st.en ? `<small lang="en">${esc(e)}</small>` : ''}</div><span class="pbtn">${playBtn(t)}${micBtn(t, i)}<button class="mic" data-act="card" data-i="${i}" aria-label="Add to flashcards" title="Add to flashcards">${sv.has(t) ? '✓' : '＋'}</button></span></li>`).join('')}</ul>
<p class="note" lang="en">▶ listen · 🎤 say it and see which words were recognised · ＋ save the phrase as a flashcard. Tap a single word to look it up.</p>`;
    } else if (st.tab === 'd') {
      body = `<div class="rtools" lang="en">${S.tts ? `<button class="btn" data-act="play">${st.playing ? 'Stop' : '▶ Play dialogue'}</button>` : ''}<button class="btn" data-act="role" aria-pressed="${st.role}">${st.role ? 'Show my lines' : '🎭 Role-play'}</button><button class="btn" data-act="en" aria-pressed="${st.en}">${st.en ? 'Hide English' : 'Show English'}</button></div>
${st.role ? `<p class="note" lang="en">Your lines (${ME}) are hidden. Play the dialogue; it pauses at your turn. Say your line with 🎤, or tap the line to reveal it.</p>` : ''}
<ol class="dlg">${s.dialog.map(([who, t, e], i) => { const me = who === ME, hide = st.role && me; return `<li class="${me ? 'me' : ''}"><b>${esc(who)}</b><div><span class="sent${hide ? ' hid' : ''}" data-i="${i}" ${hide ? 'data-act="reveal"' : ''}>${hide ? '· · ·' : esc(t)}</span>${st.en ? `<small lang="en">${esc(e)}</small>` : ''}</div><span class="pbtn">${hide ? '' : playBtn(t)}${me ? micBtn(t, 'd' + i) : ''}</span></li>`; }).join('')}</ol>`;
    } else body = drillView(s);
    $('main').innerHTML = head + body + '</section>';
  }

  // ---------- drill ----------
  function newDrill(s) {
    const qs = shuffle(s.phrases.map((p, i) => i)).slice(0, 8).map((i, n) => ({ i, kind: n % 2 ? 'listen' : 'pick' }));
    if (!S.tts) qs.forEach(q => q.kind = 'pick');
    return { sid: s.id, qs, n: 0, right: 0, ans: null };
  }
  function drillView(s) {
    if (!st.drill || st.drill.sid !== s.id) st.drill = newDrill(s);
    const dr = st.drill;
    if (dr.n >= dr.qs.length) {
      const pct = Math.round(dr.right / dr.qs.length * 100), d = done(); d[s.id] = pct; LS.set(P + 'pb-done', d);
      return `<div class="xdone" lang="en"><p class="big">${pct}%</p><p>${dr.right} of ${dr.qs.length} right. ${pct >= 80 ? 'You’re ready for this situation.' : 'Go over the phrases once more, then try again.'}</p><button class="btn go" data-act="again">Again</button></div>`;
    }
    const q = dr.qs[dr.n], [t, e] = s.phrases[q.i];
    const others = shuffle(s.phrases.map((p, i) => i).filter(i => i !== q.i)).slice(0, 3);
    if (!dr.opts) dr.opts = shuffle([q.i, ...others]);
    const pick = q.kind === 'pick';
    const prompt = pick ? `<p class="dq" lang="en">${esc(e)}</p><p class="note" lang="en">Which phrase says this?</p>`
      : `<p class="dq"><button class="btn" data-act="say" data-t="${esc(t)}">▶ Listen</button> <button class="btn" data-act="slow" data-t="${esc(t)}">Slowly</button></p><p class="note" lang="en">What does it mean?</p>`;
    const opt = i => { const [ot, oe] = s.phrases[i], cls = dr.ans === null ? '' : i === q.i ? ' ok' : i === dr.ans ? ' bad' : ''; return `<button class="opt${cls}" data-act="opt" data-k="${i}" ${dr.ans !== null ? 'aria-disabled="true"' : ''} lang="${pick ? L : 'en'}">${esc(pick ? ot : oe)}</button>`; };
    return `<p class="meta" lang="en"><span>${dr.n + 1} / ${dr.qs.length}</span><span>${dr.right} right</span></p>${prompt}<div class="opts">${dr.opts.map(opt).join('')}</div>
${dr.ans !== null ? `<p class="note" lang="${L}">${esc(t)} — <span lang="en">${esc(e)}</span></p><div class="row"><button class="btn go" data-act="next">Next</button></div>` : ''}`;
  }
  function choose(s, k) {
    const dr = st.drill; if (dr.ans !== null) return;
    const q = dr.qs[dr.n], ok = k === q.i; dr.ans = k; dr.at = Date.now(); if (ok) dr.right++;
    if (C) C.record(ID, 'phrases', ok, s.id + ':' + s.phrases[q.i][0].slice(0, 50));
    if (q.kind === 'pick' && S.tts) S.say(s.phrases[q.i][0], L);
    situation(s);
  }

  // ---------- audio ----------
  function playDialog(s) {
    if (st.playing) { S.stop(); st.playing = false; situation(s); return; }
    const items = [...document.querySelectorAll('.dlg li')]; let i = 0;
    st.playing = true; const b = document.querySelector('[data-act="play"]'); if (b) b.textContent = 'Stop';
    const step = () => {
      document.querySelectorAll('.dlg .now').forEach(x => x.classList.remove('now'));
      if (!st.playing || i >= items.length) { st.playing = false; const b = document.querySelector('[data-act="play"]'); if (b) b.textContent = '▶ Play dialogue'; return; }
      const li = items[i], [who, t] = s.dialog[i]; i++; li.querySelector('.sent').classList.add('now');
      if (st.role && who === ME) { const b = document.querySelector('[data-act="play"]'); if (b) b.textContent = '▶ Continue'; st.playing = false; st.resume = step; return; }
      S.say(t, L, false, step);
    };
    if (st.resume) { const r = st.resume; st.resume = null; st.playing = true; r(); return; }
    step();
  }
  async function mic(btn, s) {
    const target = btn.dataset.t, row = btn.closest('li'), span = row && row.querySelector('.sent');
    btn.textContent = '…'; btn.disabled = true;
    try {
      const heard = await S.listen(L), r = S.score(target, heard);
      if (span) { span.classList.remove('hid'); span.removeAttribute('data-act'); span.innerHTML = r.marks.map(m => `<span class="${m.ok ? 'wok' : 'wno'}">${esc(m.w)}</span>`).join(' '); }
      btn.textContent = r.pct >= 80 ? '✓' : '🎤'; btn.title = `${r.pct}% recognised. Heard: ${r.heard}`;
      if (C) C.record(ID, 'speaking', r.pct >= 80, 'say:' + target.slice(0, 60));
    } catch (e) { btn.textContent = '🎤'; alert(e.message); }
    btn.disabled = false;
  }

  function cur() { const m = location.hash.match(/^#s=(.+)$/); return m && D.find(s => s.id === m[1]); }
  function render() { const s = cur(); if (s) situation(s); else { S.stop(); st.playing = false; list(); } window.scrollTo(0, 0); }
  document.addEventListener('click', e => {
    const s = cur(); if (!s) return;
    const tb = e.target.closest('[data-tab]'); if (tb) { st.tab = tb.dataset.tab; st.resume = null; situation(s); return; }
    const b = e.target.closest('[data-act]'); if (!b || !$('main').contains(b)) return;
    const a = b.dataset.act;
    if (a === 'say') S.say(b.dataset.t, L);
    else if (a === 'slow') S.say(b.dataset.t, L, true);
    else if (a === 'mic') mic(b, s);
    else if (a === 'en') { st.en = !st.en; LS.set(P + 'pb-en', st.en); situation(s); }
    else if (a === 'role') { st.role = !st.role; st.resume = null; S.stop(); st.playing = false; situation(s); }
    else if (a === 'play') playDialog(s);
    else if (a === 'reveal') { e.stopImmediatePropagation(); const [, t] = s.dialog[+b.dataset.i]; b.textContent = t; b.classList.remove('hid'); b.removeAttribute('data-act'); }
    else if (a === 'card') { const [t, en] = s.phrases[+b.dataset.i]; if (window.GRLookup) { window.GRLookup.addCustom(L, t, en, s.title); b.textContent = '✓'; } }
    else if (a === 'opt') { if (st.drill.ans === null) choose(s, +b.dataset.k); else if (Date.now() - st.drill.at > 400) { st.drill.n++; st.drill.ans = null; st.drill.opts = null; situation(s); } }
    else if (a === 'next') { st.drill.n++; st.drill.ans = null; st.drill.opts = null; situation(s); }
    else if (a === 'again') { st.drill = null; situation(s); }
  });
  addEventListener('hashchange', () => { st.drill = null; st.resume = null; st.tab = 'p'; render(); });
  window.__gr = { data: () => D, drill: () => st.drill };   // used by the automated tests
  render();
})();
