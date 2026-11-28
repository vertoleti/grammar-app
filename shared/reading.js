/* Reading: graded texts with questions, your own imported texts, tap-a-word lookup (shared/lookup.js),
   listening (read aloud) and a speaking check per sentence (shared/speech.js). Data: window.TEXTS. */
(function () {
  const LG = window.GR_L || { code: 'ru' }, L = LG.code, P = L === 'de' ? 'de-' : 'gr-', ID = L === 'de' ? 'de-read' : 'read';
  const T = window.TEXTS || [], C = window.GRCoach, S = window.GRSpeech;
  const $ = id => document.getElementById(id);
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const WORDS = s => (String(s).match(/[\p{L}́-]+/gu) || []).length;
  const split = p => p.split(/(?<=[.!?…»])\s+(?=[\p{Lu}«„"–—-])/u);
  const DE = L === 'de';
  const TX = { mine: DE ? 'Meine Texte · My texts' : 'Мои тексты · My texts', lib: DE ? 'Texte · Texts' : 'Тексты · Texts' };

  let st = { level: LS.get(P + 'read-level', 'all'), open: null, tr: false, speak: false, playing: false };
  const mine = () => LS.get(P + 'texts', []);
  const done = () => LS.get(P + 'read-done', {});
  const byId = id => T.find(t => t.id === id) || mine().find(t => t.id === id);

  // ---------- story series ----------
  function series() {
    const names = [...new Set(T.filter(t => t.series).map(t => t.series))], d = done();
    return names.map(n => {
      const eps = T.filter(t => t.series === n).sort((a, b) => a.ep - b.ep), nx = eps.find(t => d[t.id] === undefined), nDone = eps.filter(t => d[t.id] !== undefined).length;
      return `<section class="xcard series"><h2><span lang="${L}">${esc(n)}</span> <small>a story in ${eps.length} episodes, ${eps[0].lv} to ${eps[eps.length - 1].lv}</small></h2>
${nx ? `<a class="btn go snext" href="#t=${encodeURIComponent(nx.id)}">${nDone ? `Continue with episode ${nx.ep}` : 'Start with episode 1'}</a>` : '<p class="note">You’ve read the whole story.</p>'}
<ol class="eps">${eps.map(t => `<li class="${d[t.id] !== undefined ? 'done' : t === nx ? 'now' : ''}"><a href="#t=${encodeURIComponent(t.id)}"><span class="epn">${d[t.id] !== undefined ? '✓' : t.ep}</span><span><b lang="${L}">${esc(t.title)}</b><small>${t.lv} · ${esc(t.en)}</small></span></a></li>`).join('')}</ol></section>`;
    }).join('');
  }

  // ---------- library ----------
  function library() {
    const d = done(), my = mine();
    const lv = ['all', ...ORDER.filter(l => T.some(t => t.lv === l))];
    const item = t => `<li><a href="#t=${encodeURIComponent(t.id)}"><b lang="${L}">${esc(t.title)}</b><span>${t.lv ? t.lv + ' · ' : ''}${WORDS((t.p || []).map(x => Array.isArray(x) ? x[0] : x).join(' '))} words${t.en ? ' · ' + esc(t.en) : ''}</span></a>${d[t.id] !== undefined ? `<span class="up">${typeof d[t.id] === 'number' ? '✓ ' + d[t.id] + '%' : '✓ read'}</span>` : ''}</li>`;
    $('main').innerHTML = `<section class="xcard"><h2>${TX.mine}</h2>
${my.length ? `<ul class="tl">${my.map(item).join('')}</ul>` : '<p class="note">Paste an article, a chapter or a song text. Tap any word in it to look it up and add it to your flashcards.</p>'}
<details class="refbox" id="imp" style="margin-top:12px"><summary>Import a text</summary><div class="refin">
<form id="impf" class="impf"><input id="it" placeholder="Title" required maxlength="120" aria-label="Title">
<select id="il" aria-label="Level"><option value="">Level (optional)</option>${ORDER.map(l => `<option>${l}</option>`).join('')}</select>
<textarea id="ix" rows="8" required placeholder="${DE ? 'Text auf Deutsch einfügen…' : 'Вставьте текст на русском…'}" aria-label="Text" lang="${L}"></textarea>
<div class="row"><button class="btn go">Save text</button><label class="btn" for="if">Open a .txt file</label><input type="file" id="if" accept=".txt,text/plain" hidden></div></form></div></details></section>
${series()}<section class="xcard"><h2>${TX.lib} <small>graded A1 to C1, with questions</small></h2>
<div class="seg segctl" id="rl" role="group" aria-label="Level">${lv.map(l => `<button data-l="${l}" aria-pressed="${st.level === l}">${l === 'all' ? 'All' : l}</button>`).join('')}</div>
<ul class="tl" style="margin-top:12px">${T.filter(t => !t.series && (st.level === 'all' || t.lv === st.level)).map(item).join('')}</ul></section>`;
    $('rl').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; st.level = b.dataset.l; LS.set(P + 'read-level', st.level); library(); });
    $('impf').addEventListener('submit', e => {
      e.preventDefault();
      const text = $('ix').value.trim(); if (!text) return;
      const t = { id: 'my-' + Date.now().toString(36), title: $('it').value.trim() || 'My text', lv: $('il').value, p: text.split(/\n\s*\n|\r\n\s*\r\n/).map(x => x.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean), mine: true };
      const all = mine(); all.unshift(t); LS.set(P + 'texts', all);
      location.hash = 't=' + encodeURIComponent(t.id);
    });
    $('if').addEventListener('change', () => { const f = $('if').files[0]; if (!f) return; f.text().then(x => { $('ix').value = x; if (!$('it').value) $('it').value = f.name.replace(/\.txt$/i, ''); }); });
  }

  // ---------- reader ----------
  function reader(t) {
    S.stop(); st.playing = false; document.body.dataset.where = t.title;
    const paras = (t.p || []).map(x => Array.isArray(x) ? x : [x, '']);
    const hasTr = paras.some(x => x[1]);
    let sid = 0;
    const body = paras.map(([txt, en]) => `<p class="para">${split(txt).map(s => `<span class="sent" data-s="${sid++}">${esc(s)}</span>${st.speak ? ` <button class="mic" data-act="mic" data-s="${sid - 1}" aria-label="Read this sentence aloud">🎤</button>` : ''}`).join(' ')}</p>${hasTr && st.tr ? `<p class="paraen">${esc(en)}</p>` : ''}`).join('');
    const q = t.q || [], d = done();
    $('main').innerHTML = `<p class="back"><a href="#">← ${DE ? 'Alle Texte · All texts' : 'Все тексты · All texts'}</a></p>
<article class="xcard reader" lang="${L}"><p class="meta"><span>${t.lv || ''}${t.mine ? (t.lv ? ' · ' : '') + 'my text' : ''}</span><span>${WORDS(paras.map(x => x[0]).join(' '))} words</span></p>
<h2 class="rtitle">${esc(t.title)}</h2>${t.en ? `<p class="note" lang="en">${esc(t.en)}</p>` : ''}
<div class="rtools" lang="en">${S.tts ? `<button class="btn" data-act="play">${st.playing ? 'Stop' : '▶ Listen'}</button>` : ''}${hasTr ? `<button class="btn" data-act="tr" aria-pressed="${st.tr}">${st.tr ? 'Hide translation' : 'Translation'}</button>` : ''}${S.tts ? `<button class="btn" data-act="dict" aria-pressed="${!!st.dict}">${st.dict ? 'Stop dictation' : '✎ Dictation'}</button>` : ''}<button class="btn" data-act="speak" aria-pressed="${st.speak}">${st.speak ? 'Stop speaking practice' : '🎤 Speaking practice'}</button>${t.mine ? '<button class="btn" data-act="del">Delete</button>' : ''}</div>
${st.speak ? `<p class="note" lang="en">${S.mode() === 'check' ? 'Tap 🎤 after a sentence, then read it aloud. Words that weren’t recognised turn red.' : S.mode() === 'whisper' ? 'Tap 🎤, read the sentence aloud, then tap ■. The app checks your words on the phone; words it didn’t recognise turn red.' : S.mode() === 'record' ? 'Tap 🎤, read the sentence aloud, then tap ■. Compare yourself with the model, or let the app check your words.' : 'This browser doesn’t let the page use the microphone. ' + S.diag()}</p>` : ''}
${st.dict ? dictView(paras) : `<div class="rtext">${body}</div>`}
<p class="note" lang="en">Tap a word to look it up, or select several words to save a phrase.</p>
<div class="rdone" lang="en">${d[t.id] !== undefined ? `<p><b>✓ Completed</b>${typeof d[t.id] === 'number' ? ` · ${d[t.id]}% of the questions right` : ''}</p><button class="btn" data-act="unread">Mark as not read</button>` : `<button class="btn go" data-act="markread">✓ Mark as read</button>`}${nextIn(t) ? `<a class="btn" href="#t=${encodeURIComponent(nextIn(t).id)}">Next: ${esc(nextIn(t).title)} →</a>` : ''}</div></article>
${q.length && !st.dict ? `<section class="xcard" lang="en"><h2>${DE ? 'Fragen · Questions' : 'Вопросы · Questions'}${typeof d[t.id] === 'number' ? ` <small>last time ${d[t.id]}%</small>` : ''}</h2><ol class="qs">${q.map((x, i) => `<li><p lang="${L}">${esc(x.q)}</p><div class="opts">${x.o.map((o, k) => `<button class="opt" data-act="ans" data-q="${i}" data-k="${k}" lang="${L}">${esc(o)}</button>`).join('')}</div></li>`).join('')}</ol><p id="qres" class="note"></p></section>` : ''}`;
    st.answers = {};
  }
  function answer(t, i, k) {
    if (st.answers[i] !== undefined) return;
    const x = t.q[i], ok = k === x.a; st.answers[i] = ok;
    document.querySelectorAll(`.opt[data-q="${i}"]`).forEach(b => { b.disabled = true; const kk = +b.dataset.k; if (kk === x.a) b.classList.add('ok'); else if (kk === k) b.classList.add('bad'); });
    if (C) C.record(ID, 'reading', ok, t.id + '#' + i);
    const n = Object.keys(st.answers).length;
    if (n === t.q.length) {
      const pct = Math.round(Object.values(st.answers).filter(Boolean).length / n * 100);
      const d = done(); d[t.id] = pct; LS.set(P + 'read-done', d); if (C) LS.set(P + 'done-read', C.dkey());
      setTimeout(() => window.GRSession && GRSession.offer($('qres').parentNode), 0);
      $('qres').innerHTML = `<b>${pct}%</b> right. ${pct === 100 ? 'Well understood.' : 'Re-read the paragraph with the answer, or turn on the translation.'}`;
    }
  }
  // the next text: the next episode of a story, otherwise the next unread text at the same level
  function nextIn(t) {
    const d = done();
    if (t.series) return T.find(x => x.series === t.series && x.ep === t.ep + 1) || null;
    return T.find(x => !x.series && x.id !== t.id && x.lv === t.lv && d[x.id] === undefined) || null;
  }
  function markRead(t, on) {
    const d = done();
    if (on) { if (d[t.id] === undefined) d[t.id] = 'read'; if (C) LS.set(P + 'done-read', C.dkey()); }
    else delete d[t.id];
    LS.set(P + 'read-done', d); reader(t);
    if (on && window.GRSession) GRSession.offer(document.querySelector('.rdone'));
  }
  function play(t) {
    if (st.playing) { S.stop(); st.playing = false; document.querySelectorAll('.sent.now').forEach(x => x.classList.remove('now')); render(); return; }
    const sents = [...document.querySelectorAll('.rtext .sent')]; let i = 0;
    st.playing = true; const b = document.querySelector('[data-act="play"]'); if (b) b.textContent = 'Stop';
    const step = () => {
      document.querySelectorAll('.sent.now').forEach(x => x.classList.remove('now'));
      if (!st.playing || i >= sents.length) { st.playing = false; const b = document.querySelector('[data-act="play"]'); if (b) b.textContent = '▶ Listen'; return; }
      const s = sents[i++]; s.classList.add('now'); S.say(s.textContent, L, false, step);
    };
    step();
  }
  function mic(btn) {
    const s = document.querySelector(`.sent[data-s="${btn.dataset.s}"]`); if (!s) return;
    const target = s.dataset.t || s.textContent; s.dataset.t = target;
    S.practice(btn, target, L, s, ok => { if (C) C.record(ID, 'speaking', ok, 'say:' + target.slice(0, 60)); });
  }

  // ---------- dictation: listen to each sentence and type it ----------
  const allSents = paras => paras.flatMap(([txt]) => split(txt));
  const nrm = w => (LG.norm ? LG.norm(w) : w.toLowerCase()).replace(/ё/g, 'е').replace(/[^\p{L}\p{N}-]/gu, '');
  function compare(target, typed) {
    const T = target.split(/\s+/).filter(Boolean), A = typed.split(/\s+/).filter(Boolean).map(nrm);
    const t = T.map(nrm), n = t.length, m = A.length, D = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) D[i][j] = t[i] && t[i] === A[j] ? D[i + 1][j + 1] + 1 : Math.max(D[i + 1][j], D[i][j + 1]);
    const ok = new Array(n).fill(false); let i = 0, j = 0;
    while (i < n && j < m) { if (t[i] && t[i] === A[j]) { ok[i] = true; i++; j++; } else if (D[i + 1][j] >= D[i][j + 1]) i++; else j++; }
    const counted = t.filter(Boolean).length || 1, right = ok.filter((x, k) => x && t[k]).length;
    return { marks: T.map((w, k) => ({ w, ok: ok[k] || !t[k] })), pct: Math.round(right / counted * 100) };
  }
  function dictView(paras) {
    const ss = allSents(paras), d = st.dict;
    if (d.i >= ss.length) {
      const pct = Math.round(d.res.reduce((a, b) => a + b, 0) / (d.res.length || 1));
      return `<div class="dict-box" lang="en"><p class="big">${pct}%</p><p class="note">of the words right across ${d.res.length} sentences.</p><div class="row"><button class="btn go" data-act="dagain">Again</button><button class="btn" data-act="dict">Back to the text</button></div></div>`;
    }
    const s = ss[d.i], r = d.check;
    return `<div class="dict-box"><p class="meta" lang="en"><span>Sentence ${d.i + 1} of ${ss.length}</span><span>${d.res.length ? Math.round(d.res.reduce((a, b) => a + b, 0) / d.res.length) + '% so far' : ''}</span></p>
<div class="row" lang="en"><button class="btn" data-act="dplay">▶ Play</button><button class="btn" data-act="dslow">Slowly</button></div>
<textarea id="dtype" rows="3" lang="${L}" placeholder="${DE ? 'Schreib, was du hörst…' : 'Напишите, что слышите…'}" autocomplete="off" autocapitalize="sentences" spellcheck="false" ${r ? 'readonly' : ''}>${esc(d.typed || '')}</textarea>
${r ? `<p class="dres">${r.marks.map(m => `<span class="${m.ok ? 'wok' : 'wno'}">${esc(m.w)}</span>`).join(' ')}</p><p class="note" lang="en">${r.pct}% of the words right${r.pct < 100 ? '. Red words were missing or misspelt.' : '.'}</p>` : ''}
<div class="row" lang="en">${r ? `<button class="btn go" data-act="dnext">${d.i + 1 < ss.length ? 'Next sentence' : 'Finish'}</button>` : '<button class="btn go" data-act="dcheck">Check</button><button class="btn" data-act="dskip">Skip</button>'}</div></div>`;
  }
  function dictAct(t, a) {
    const paras = (t.p || []).map(x => Array.isArray(x) ? x : [x, '']), ss = allSents(paras), d = st.dict;
    if (a === 'dplay' || a === 'dslow') { S.say(ss[d.i], L, a === 'dslow'); return; }
    if (a === 'dcheck') { d.typed = $('dtype').value; d.check = compare(ss[d.i], d.typed); d.res.push(d.check.pct); if (C) C.record(ID, 'dictation', d.check.pct >= 80, 'dict:' + ss[d.i].slice(0, 60)); }
    else if (a === 'dskip' || a === 'dnext') { if (a === 'dskip') d.res.push(0); d.i++; d.check = null; d.typed = ''; if (d.i >= ss.length && C) LS.set(P + 'done-dict', C.dkey()); }
    else if (a === 'dagain') st.dict = { i: 0, res: [] };
    reader(t);
    if (st.dict && st.dict.i >= ss.length && window.GRSession) GRSession.offer(document.querySelector('.dict-box'));
    const ta = $('dtype'); if (ta && !st.dict.check) { ta.focus({ preventScroll: true }); if (a === 'dnext' || a === 'dagain' || a === 'dskip') S.say(ss[st.dict.i], L); }
  }

  function render() {
    const m = location.hash.match(/^#t=(.+)$/), t = m && byId(decodeURIComponent(m[1]));
    st.dict = null;
    if (t) reader(t); else { S.stop(); st.playing = false; document.body.dataset.where = ''; library(); }
    window.scrollTo(0, 0);
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b || !$('main').contains(b)) return;
    const m = location.hash.match(/^#t=(.+)$/), t = m && byId(decodeURIComponent(m[1])); if (!t) return;
    const a = b.dataset.act;
    if (a === 'ans') answer(t, +b.dataset.q, +b.dataset.k);
    else if (a === 'play') play(t);
    else if (a === 'tr') { st.tr = !st.tr; reader(t); }
    else if (a === 'speak') { st.speak = !st.speak; reader(t); }
    else if (a === 'markread') markRead(t, true);
    else if (a === 'unread') markRead(t, false);
    else if (a === 'dict') { st.dict = st.dict ? null : { i: 0, res: [] }; st.speak = false; reader(t); if (st.dict) { const ss = allSents((t.p || []).map(x => Array.isArray(x) ? x : [x, ''])); S.say(ss[0], L); } }
    else if (/^d(play|slow|check|skip|next|again)$/.test(a)) dictAct(t, a);
    else if (a === 'mic') mic(b);
    else if (a === 'del' && confirm('Delete this text?')) { LS.set(P + 'texts', mine().filter(x => x.id !== t.id)); location.hash = ''; }
  });
  addEventListener('hashchange', render);
  window.__gr = { texts: () => T };   // used by the automated tests
  render();
})();
