/* Exam mode in the style of ТРКИ (Russian) / Goethe-Zertifikat (German): a timed mock exam at one level with
   four scored parts: grammar, vocabulary, reading, listening. Nothing is marked until you hand in.
   Page provides: window.ALL (line data), window.TEXTS (reading texts), window.PHRASES (phrasebook), GRLookup (decks). */
(function () {
  const LG = window.GR_L || { code: 'ru' }, L = LG.code, DE = L === 'de', P = DE ? 'de-' : 'gr-';
  const ALL = window.ALL || [], TEXTS = window.TEXTS || [], PB = window.PHRASES || [], C = window.GRCoach, S = window.GRSpeech;
  const $ = id => document.getElementById(id);
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const shuf = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const ORDER = ['A1', 'A2', 'B1', 'B2', 'C1'];
  const NAME = DE
    ? { A1: 'Goethe-Zertifikat A1 (Start Deutsch 1)', A2: 'Goethe-Zertifikat A2', B1: 'Goethe-Zertifikat B1', B2: 'Goethe-Zertifikat B2', C1: 'Goethe-Zertifikat C1' }
    : { A1: 'ТЭУ · Элементарный уровень', A2: 'ТБУ · Базовый уровень', B1: 'ТРКИ-1 · Первый уровень', B2: 'ТРКИ-2 · Второй уровень', C1: 'ТРКИ-3 · Третий уровень' };
  const PASS = DE ? 60 : 66;                       // Goethe: 60 % per module; ТРКИ: 66 % per subtest
  const MIN = { A1: 25, A2: 30, B1: 35, B2: 40, C1: 45 };
  const PARTS = [
    { k: 'gram', name: DE ? 'Grammatik · Grammar' : 'Грамматика · Grammar', n: 15 },
    { k: 'voc', name: DE ? 'Wortschatz · Vocabulary' : 'Лексика · Vocabulary', n: 10 },
    { k: 'read', name: DE ? 'Lesen · Reading' : 'Чтение · Reading' },
    { k: 'listen', name: DE ? 'Hören · Listening' : 'Аудирование · Listening', n: 8 }];
  const HIST = P + 'exams';
  let ex = null, timer = null;

  // ---------- building an exam ----------
  const lvOf = (E, q) => q.lv || (E.levels || {})[q.t] || 'B1';
  function gramItems(level) {
    const li = ORDER.indexOf(level), pool = [];
    ALL.forEach(E => E.items.forEach(q => {
      const i = ORDER.indexOf(lvOf(E, q)); if (i < 0 || i > li || !q.forms || q.a2 == null || !/___/.test(q.ru)) return;
      pool.push({ E, q, w: i === li ? 3 : i === li - 1 ? 2 : 1 });
    }));
    const ranked = shuf(pool).sort((a, b) => b.w - a.w + (Math.random() - .5) * 2.5), picked = [], seen = new Set();
    ranked.forEach(p => { if (picked.length < 15 && !seen.has(p.E.id + p.q.t)) { seen.add(p.E.id + p.q.t); picked.push(p); } });   // one per topic first
    ranked.forEach(p => { if (picked.length < 15 && !picked.includes(p)) picked.push(p); });                                     // then fill up
    return shuf(picked).map(({ E, q }) => {
      const right = q.forms[q.a2], wrong = shuf([...new Set(q.forms.filter(f => f && f !== right))]).slice(0, 3);
      return { kind: 'gram', line: E.id, topic: q.t, stem: q.ru, hint: q.hint, en: q.en, o: shuf([right, ...wrong]), a: right, why: q.cue ? q.cue + ' → ' + right : '' };
    });
  }
  async function vocItems(level) {
    if (!window.GRLookup) return [];
    const cards = (await window.GRLookup.load(L)).filter(c => !c.mine && c.meaning && c.term);
    const li = ORDER.indexOf(level);
    const at = cards.filter(c => { const i = ORDER.indexOf((c.level || '').toUpperCase()); return i >= 0 && i <= li && i >= li - 1; });
    const src = at.length >= 20 ? at : cards;
    const clean = m => String(m).replace(/<[^>]+>/g, '').split(/;|\n/)[0].trim();
    return shuf(src).slice(0, 10).map((c, n) => {
      const others = shuf(src.filter(x => x.id !== c.id && clean(x.meaning) !== clean(c.meaning))).slice(0, 3);
      return n % 2
        ? { kind: 'voc', stem: clean(c.meaning), stemLang: 'en', o: shuf([c.term, ...others.map(x => x.term)]), a: c.term, q: 'Which word means this?' }
        : { kind: 'voc', stem: c.term, stemLang: L, o: shuf([clean(c.meaning), ...others.map(x => clean(x.meaning))]), a: clean(c.meaning), oLang: 'en', q: 'What does it mean?' };
    });
  }
  function readItems(level) {
    let ts = TEXTS.filter(t => t.lv === level && t.q && t.q.length);
    if (ts.length < 2) ts = ts.concat(TEXTS.filter(t => t.q && Math.abs(ORDER.indexOf(t.lv) - ORDER.indexOf(level)) === 1));
    return shuf(ts).slice(0, 2).map(t => ({ kind: 'read', text: t, qs: t.q.map(x => ({ stem: x.q, o: x.o, a: x.o[x.a] })) }));
  }
  function listenItems(level) {
    const li = ORDER.indexOf(level);
    let pool = []; PB.forEach(s => { const i = ORDER.indexOf(s.lv); if (i <= li + 1) s.phrases.forEach(p => pool.push({ s, p })); });
    if (pool.length < 12) PB.forEach(s => s.phrases.forEach(p => pool.push({ s, p })));
    return shuf(pool).slice(0, 8).map(({ s, p }) => {
      const others = shuf(s.phrases.filter(x => x !== p)).slice(0, 3).map(x => x[1]);
      return { kind: 'listen', say: p[0], o: shuf([p[1], ...others]), a: p[1], plays: 0 };
    });
  }
  async function build(level) {
    const parts = { gram: gramItems(level), voc: await vocItems(level), read: readItems(level), listen: S && S.tts ? listenItems(level) : [] };
    return { level, start: Date.now(), end: Date.now() + MIN[level] * 60000, part: 0, parts, ans: {}, done: false };
  }

  // ---------- views ----------
  function home() {
    stopTimer();
    const h = LS.get(HIST, []), lv = LS.get(LG.levelKey || (P + 'level'), 'B1');
    const def = ORDER.includes(lv) ? lv : 'B1';
    $('main').innerHTML = `<section class="xcard"><h2>${DE ? 'Prüfungstraining · Mock exam' : 'Пробный экзамен · Mock exam'}</h2>
<p class="note">A timed practice exam in the style of ${DE ? 'the Goethe-Zertifikat' : 'ТРКИ, the Russian state test for foreigners'}. Four scored parts; you see the answers only after you hand in. Pass mark: <b>${PASS}%</b> in every part, as in the real exam.</p>
<div class="seg segctl" id="xl" role="group" aria-label="Level">${ORDER.map(l => `<button data-l="${l}" aria-pressed="${l === def}">${l}</button>`).join('')}</div>
<p class="exname" id="xn">${esc(NAME[def])}</p>
<ol class="plan">${PARTS.map(p => `<li>${esc(p.name)}${p.k === 'gram' ? ' · 15 questions' : p.k === 'voc' ? ' · 10 questions' : p.k === 'read' ? ' · 2 texts' : S && S.tts ? ' · 8 recordings, each can be played twice' : ' · not available: this browser can’t play speech'}</li>`).join('')}</ol>
<p class="note" id="xt">Time: ${MIN[def]} minutes. Writing and speaking aren’t scored here; practise speaking in Reading and the Phrasebook.</p>
<div class="row"><button class="btn go" id="xs">Start the exam</button></div></section>
${h.length ? `<section class="xcard"><h2>History</h2><ul class="tl">${h.slice(0, 12).map(r => `<li><div><b>${r.level} · ${r.pct}% ${r.pass ? '· passed' : '· not yet'}</b><span>${new Date(r.at).toLocaleDateString()} · ${PARTS.map(p => r.parts[p.k] != null ? p.name.split(' · ').pop() + ' ' + r.parts[p.k] + '%' : '').filter(Boolean).join(' · ')}</span></div><span class="${r.pass ? 'up' : 'down'}">${r.pass ? '✓' : '✗'}</span></li>`).join('')}</ul></section>` : ''}`;
    let level = def;
    $('xl').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; level = b.dataset.l; $('xl').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); $('xn').textContent = NAME[level]; $('xt').firstChild.textContent = `Time: ${MIN[level]} minutes. `; });
    $('xs').addEventListener('click', async () => { $('xs').disabled = true; $('xs').textContent = 'Preparing…'; ex = await build(level); LS.set(P + 'exam-now', null); startTimer(); show(); });
  }
  const parts = () => PARTS.filter(p => p.k === 'read' ? ex.parts.read.length : ex.parts[p.k].length);
  const opt = (key, o, lang, sel, res) => `<button class="opt${sel ? ' sel' : ''}${res || ''}" data-act="pick" data-q="${esc(key)}" data-v="${esc(o)}" lang="${lang}" ${ex.done ? 'disabled' : ''}>${esc(o)}</button>`;
  const mark = (key, o, a) => { if (!ex.done) return ''; const v = ex.ans[key]; return o === a ? ' ok' : o === v ? ' bad' : ''; };
  function question(key, n, stem, stemLang, o, a, oLang, extra) {
    return `<li class="xq"><p lang="${stemLang}">${extra || ''}${esc(stem)}</p><div class="opts">${o.map(x => opt(key, x, oLang, ex.ans[key] === x, mark(key, x, a))).join('')}</div>${ex.done && ex.ans[key] !== a ? `<p class="note">${ex.ans[key] == null ? 'Not answered. ' : ''}Answer: <b lang="${oLang}">${esc(a)}</b></p>` : ''}</li>`;
  }
  function partView(p) {
    const k = p.k, items = ex.parts[k];
    if (k === 'gram') return `<p class="note">Choose the form that fits the gap.</p><ol class="qs">${items.map((q, i) => question('gram' + i, i, q.stem.replace('___', '_____'), L, q.o, q.a, L, '') + (ex.done ? `<p class="note xen" lang="en">${esc(q.en)}</p>` : '')).join('')}</ol>`;
    if (k === 'voc') return `<ol class="qs">${items.map((q, i) => question('voc' + i, i, q.stem, q.stemLang, q.o, q.a, q.oLang || L, `<small class="note">${q.q}</small><br>`)).join('')}</ol>`;
    if (k === 'read') return items.map((r, ti) => `<article class="xtext" lang="${L}"><h3>${esc(r.text.title)}</h3>${r.text.p.map(x => `<p>${esc(Array.isArray(x) ? x[0] : x)}</p>`).join('')}</article><ol class="qs">${r.qs.map((q, i) => { const ql = /^(What|Where|How|Why|Who|When|Which|Is|Does|Do)\b/.test(q.stem) ? 'en' : L; return question(`read${ti}-${i}`, i, q.stem, ql, q.o, q.a, ql); }).join('')}</ol>`).join('');
    if (k === 'listen') return `<p class="note">Play each recording (at most twice) and choose what it means.</p><ol class="qs">${items.map((q, i) => `<li class="xq"><p><button class="btn" data-act="hear" data-i="${i}" ${!ex.done && q.plays >= 2 ? 'disabled' : ''}>▶ Play${ex.done ? '' : ` (${2 - q.plays} left)`}</button>${ex.done ? ` <span lang="${L}">${esc(q.say)}</span>` : ''}</p><div class="opts">${q.o.map(x => opt('listen' + i, x, 'en', ex.ans['listen' + i] === x, mark('listen' + i, x, q.a))).join('')}</div>${ex.done && ex.ans['listen' + i] !== q.a ? `<p class="note">Answer: <b>${esc(q.a)}</b></p>` : ''}</li>`).join('')}</ol>`;
  }
  function count(k) {
    const keys = k === 'read' ? ex.parts.read.flatMap((r, ti) => r.qs.map((q, i) => [`read${ti}-${i}`, q.a])) : ex.parts[k].map((q, i) => [k + i, q.a]);
    return { n: keys.length, answered: keys.filter(([x]) => ex.ans[x] != null).length, right: keys.filter(([x, a]) => ex.ans[x] === a).length };
  }
  function show() {
    const ps = parts(), p = ps[ex.part], last = ex.part === ps.length - 1;
    const tabs = `<div class="seg segctl xtabs" id="xp" role="group" aria-label="Part">${ps.map((x, i) => { const c = count(x.k); return `<button data-p="${i}" aria-pressed="${i === ex.part}">${x.name.split(' · ').pop()}${ex.done ? ` ${Math.round(c.right / c.n * 100)}%` : ` ${c.answered}/${c.n}`}</button>`; }).join('')}</div>`;
    const top = ex.done ? result(ps) : `<div class="xbar"><span>${ex.level} · ${esc(NAME[ex.level])}</span><b id="clock"></b></div>`;
    $('main').innerHTML = `${top}<section class="xcard exam">${tabs}<h2>${esc(p.name)}</h2>${partView(p)}
<div class="row">${ex.part > 0 ? '<button class="btn" data-act="prev">← Back</button>' : ''}${!last ? '<button class="btn go" data-act="next">Next part →</button>' : ex.done ? '<button class="btn go" data-act="home">Done</button>' : '<button class="btn go" data-act="submit">Hand in</button>'}</div></section>`;
    tick();
  }
  function result(ps) {
    const rows = ps.map(p => ({ p, c: count(p.k) })), pass = rows.every(r => r.c.right / r.c.n * 100 >= PASS);
    return `<section class="xcard xres ${pass ? 'pass' : 'fail'}"><p class="big">${pass ? (DE ? 'Bestanden' : 'Сдано') : (DE ? 'Noch nicht bestanden' : 'Пока не сдано')}</p>
<p class="note">${pass ? `You reached at least ${PASS}% in every part at ${ex.level}.` : `You need ${PASS}% in every part. Review the marked answers below, then practise the weak part.`}</p>
<div class="nums4">${rows.map(({ p, c }) => `<div><b class="${c.right / c.n * 100 >= PASS ? 'up' : 'down'}">${Math.round(c.right / c.n * 100)}%</b><span>${p.name.split(' · ').pop()}<br>${c.right}/${c.n}</span></div>`).join('')}</div>
<p class="note">${ps.some(p => p.k === 'gram') ? 'Grammar answers also count toward the coach, so missed ones come back in Mistake review.' : ''}</p></section>`;
  }
  function submit(auto) {
    if (!auto) {
      const open = parts().reduce((a, p) => { const c = count(p.k); return a + c.n - c.answered; }, 0);
      if (open && !confirm(`${open} question${open > 1 ? 's are' : ' is'} still unanswered. Hand in anyway?`)) return;
    }
    stopTimer(); ex.done = true; ex.part = 0;
    if (C) ex.parts.gram.forEach((q, i) => { if (ex.ans['gram' + i] != null) C.record(q.line, q.topic, ex.ans['gram' + i] === q.a, q.stem); });
    const ps = parts(), r = {}; ps.forEach(p => { const c = count(p.k); r[p.k] = Math.round(c.right / c.n * 100); });
    const tot = ps.reduce((a, p) => a + count(p.k).right, 0), all = ps.reduce((a, p) => a + count(p.k).n, 0);
    const h = LS.get(HIST, []); h.unshift({ at: Date.now(), level: ex.level, parts: r, pct: Math.round(tot / all * 100), pass: ps.every(p => r[p.k] >= PASS), mins: Math.round((Date.now() - ex.start) / 60000) }); LS.set(HIST, h.slice(0, 50));
    if (C) C.record(DE ? 'de-exam' : 'exam', 'exam', h[0].pass, 'exam:' + ex.level + ':' + h[0].at);
    show(); window.scrollTo(0, 0);
  }
  // ---------- timer ----------
  function startTimer() { stopTimer(); timer = setInterval(tick, 1000); }
  function stopTimer() { if (timer) clearInterval(timer); timer = null; }
  function tick() {
    const el = $('clock'); if (!el || !ex || ex.done) return;
    const left = Math.max(0, ex.end - Date.now()), m = Math.floor(left / 60000), s = Math.floor(left / 1000) % 60;
    el.textContent = `${m}:${String(s).padStart(2, '0')}`; el.classList.toggle('low', left < 5 * 60000);
    if (!left) { alert('Time is up. Your answers are handed in.'); submit(true); }
  }

  document.addEventListener('click', e => {
    if (!ex) return;
    const t = e.target.closest('[data-p]'); if (t && $('xp') && $('xp').contains(t)) { ex.part = +t.dataset.p; show(); window.scrollTo(0, 0); return; }
    const b = e.target.closest('[data-act]'); if (!b || !$('main').contains(b)) return;
    const a = b.dataset.act;
    if (a === 'pick' && !ex.done) { ex.ans[b.dataset.q] = b.dataset.v; b.parentNode.querySelectorAll('.opt').forEach(x => x.classList.toggle('sel', x === b)); const tb = $('xp').querySelector('[aria-pressed="true"]'), p = parts()[ex.part], c = count(p.k); if (tb) tb.textContent = `${p.name.split(' · ').pop()} ${c.answered}/${c.n}`; }
    else if (a === 'hear') { const q = ex.parts.listen[+b.dataset.i]; if (!ex.done) { if (q.plays >= 2) return; q.plays++; b.textContent = `▶ Play (${2 - q.plays} left)`; if (q.plays >= 2) b.disabled = true; } S.say(q.say, L); }
    else if (a === 'next') { ex.part++; show(); window.scrollTo(0, 0); }
    else if (a === 'prev') { ex.part--; show(); window.scrollTo(0, 0); }
    else if (a === 'submit') submit(false);
    else if (a === 'home') { ex = null; home(); window.scrollTo(0, 0); }
  });
  window.__gr = { exam: () => ex };   // used by the automated tests
  home();
})();
