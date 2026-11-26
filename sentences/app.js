/* Sentences line: translate, word order, dictation, find the mistake. Data in data.js (window.SENTENCES). */
{
const D = window.SENTENCES, COACH = window.GRCoach, ID = 'sent';
const $ = id => document.getElementById(id);
const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
const shuf = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const norm = s => String(s).toLowerCase().replace(/ё/g, 'е').replace(/[.,!?;:«»"“”()]/g, ' ').replace(/\s[—–-]\s/g, ' ').replace(/\s+/g, ' ').trim();
const words = s => norm(s).split(' ').filter(Boolean);
const ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const MODES = { tr: 'Перевод · Translate', order: 'Порядок слов · Word order', dict: 'Диктант · Dictation', err: 'Найди ошибку · Find the mistake' };
const TOP = Object.assign({ smart: 'Рекомендуем · Recommended' }, MODES);
const TTS = 'speechSynthesis' in window;
const SIZES = [5, 10, 20];

// every question: {m: mode, lv, key, ...}
const Q = [];
D.S.forEach(([lv, en, ru, ...alt]) => {
  const vars = [ru, ...alt];
  Q.push({ m: 'tr', lv, en, ru, vars, key: 'tr:' + ru });
  if (words(ru).length >= 3 && words(ru).length <= 12) Q.push({ m: 'order', lv, en, ru, vars, key: 'order:' + ru });
  Q.push({ m: 'dict', lv, en, ru, vars: [ru], key: 'dict:' + ru });
});
D.M.forEach(([lv, s, why]) => {
  const toks = s.match(/\{[^}]*\}[.,!?]*|[^\s{]+/g);
  let bad = -1, wrong = '', right = '';
  const shown = toks.map((t, i) => { const m = t.match(/^\{([^|]*)\|([^}]*)\}(.*)$/); if (!m) return t; bad = i; wrong = m[1]; right = m[2]; return m[1] + m[3]; });
  const fixed = toks.map((t, i) => i === bad ? t.replace(/^\{[^|]*\|([^}]*)\}/, '$1') : t).join(' ');
  Q.push({ m: 'err', lv, toks: shown, bad, wrong, right, ru: fixed, why, key: 'err:' + fixed });
});
const MSTATS = Object.keys(MODES);

// ---------- matching ----------
const lev = (a, b) => { const d = Array.from({ length: a.length + 1 }, (_, i) => [i]); for (let j = 1; j <= b.length; j++) d[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; };
const typo = (a, b) => a !== b && Math.min(a.length, b.length) >= 5 && lev(a, b) === 1;
// align user words u to target words t (LCS, typos count as a match)
function align(u, t) {
  const n = u.length, m = t.length, L = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  const eq = (a, b) => a === b || typo(a, b);
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = eq(u[i], t[j]) ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out = []; let i = 0, j = 0;
  while (i < n && j < m) {
    if (eq(u[i], t[j])) { out.push({ k: u[i] === t[j] ? 'ok' : 'typo', u: u[i], t: t[j] }); i++; j++; }
    else if (L[i + 1][j] >= L[i][j + 1]) out.push({ k: 'extra', u: u[i++] });
    else out.push({ k: 'miss', t: t[j++] });
  }
  while (i < n) out.push({ k: 'extra', u: u[i++] });
  while (j < m) out.push({ k: 'miss', t: t[j++] });
  return { out, score: L[0][0] };
}
const bag = a => a.slice().sort().join(' ');
function check(answer, vars, freeOrder) {
  const u = words(answer);
  let best = null;
  for (const v of vars) {
    const t = words(v);
    if (u.join(' ') === t.join(' ')) return { ok: true, how: 'exact', v };
    if (freeOrder && bag(u) === bag(t)) return { ok: true, how: 'order', v };
    const a = align(u, t), typos = a.out.filter(x => x.k === 'typo').length, wrong = a.out.filter(x => x.k === 'extra' || x.k === 'miss').length;
    if (!wrong && typos) return { ok: true, how: 'typo', v, a };
    const sc = a.score - wrong * 0.01;
    if (!best || sc > best.sc) best = { ok: false, v, a, sc };
  }
  return best;
}
const diffHTML = a => a.out.map(x => x.k === 'ok' ? `<span>${esc(x.u)}</span>` : x.k === 'typo' ? `<span class="w-typo" title="spelling">${esc(x.u)}<small>${esc(x.t)}</small></span>` : x.k === 'extra' ? `<del>${esc(x.u)}</del>` : `<ins>${esc(x.t)}</ins>`).join(' ');

// ---------- speech ----------
let voice = null;
const pickVoice = () => { if (!TTS) return; const v = speechSynthesis.getVoices().filter(x => /^ru/i.test(x.lang)); voice = v.find(x => /google|milena|yuri|katya/i.test(x.name)) || v[0] || null; };
if (TTS) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
function say(text, slow) { if (!TTS) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'ru-RU'; if (voice) u.voice = voice; u.rate = slow ? 0.6 : 0.9; speechSynthesis.speak(u); }

// ---------- rounds ----------
const lvPref = LS.get('gr-level', 'all'), prefs = LS.get(ID + '-prefs', {});
const hashT = decodeURIComponent(location.hash.slice(1));
let st = { level: lvPref === 'all' || ORDER.includes(lvPref) ? lvPref : 'all', topic: TOP[hashT] ? hashT : TOP[prefs.topic] ? prefs.topic : 'smart', size: SIZES.includes(LS.get('gr-size', 10)) ? LS.get('gr-size', 10) : 10, round: [], i: 0, res: [], done: false };
if (!TTS && st.topic === 'dict') st.topic = 'tr';
const seen = new Set(LS.get(ID + '-seen', []));
const inLevel = q => st.level === 'all' || q.lv === st.level;
function poolFor(t) { return Q.map((q, k) => k).filter(k => (t === 'smart' || Q[k].m === t) && (TTS || Q[k].m !== 'dict') && inLevel(Q[k])); }
function newRound() {
  let pool = poolFor(st.topic);
  if (!pool.length) pool = Q.map((q, k) => k).filter(k => st.topic === 'smart' || Q[k].m === st.topic);
  const due = new Set(COACH ? COACH.dueReviews(ID) : []), s = COACH ? COACH.stats(ID) : {};
  const W = { weak: 3, started: 2, new: 2, good: 1, mastered: 0.5 };
  const w = pool.map(k => { const q = Q[k]; let x = due.has(q.key) ? 10 : 1; if (COACH && st.topic === 'smart') x *= W[COACH.state(ID, q.m, s).st] || 1; if (seen.has(q.key)) x *= 0.3; return { k, w: x }; });
  const out = [];
  while (out.length < st.size && w.length) { const tot = w.reduce((a, b) => a + b.w, 0); let r = Math.random() * tot, i = 0; while (i < w.length - 1 && (r -= w[i].w) > 0) i++; out.push(w[i].k); w.splice(i, 1); }
  st.round = out; st.i = 0; st.res = []; st.done = false; st.before = {};
  if (COACH) MSTATS.forEach(m => { st.before[m] = COACH.state(ID, m, s).pct; });
  fresh(); render(true);
}
function fresh() { st.ans = []; st.bank = null; st.typed = ''; st.result = null; st.pick = null; }
const cur = () => Q[st.round[st.i]];

// ---------- answering ----------
function submit(text) {
  const q = cur(); if (!q || st.result) return;
  if (q.m === 'order') { const r = check(text, q.vars.filter(v => bag(words(v)) === bag(words(text))), false); st.result = r && r.ok ? r : { ok: false, v: q.ru, a: align(words(text), words(q.ru)) }; }
  else st.result = check(text, q.vars, q.m === 'tr');
  st.typed = text; st.res[st.i] = { ok: st.result.ok }; render();
}
function pickWord(i) {
  const q = cur(); if (!q || st.result) return;
  st.pick = i; st.result = { ok: i === q.bad }; st.res[st.i] = { ok: st.result.ok }; render();
}
function commit() {   // the answer is recorded when you move on, so “count it as right” can still change it
  const q = cur(), r = st.res[st.i];
  if (!q || !r || r.saved) return;
  r.saved = true;
  if (COACH) COACH.record(ID, q.m, r.ok, q.key);
  seen.add(q.key); LS.set(ID + '-seen', [...seen]);
}
function next() { commit(); st.i++; fresh(); if (st.i >= st.round.length) st.done = true; render(true); }
function override() { const r = st.res[st.i]; if (!r || r.saved) return; r.ok = true; st.result.ok = true; st.result.how = 'self'; render(); }

// ---------- rendering ----------
function renderControls() {
  $('lvls').innerHTML = `<button data-l="all" aria-pressed="${st.level === 'all'}">All<small>${Q.filter(q => st.topic === 'smart' || q.m === st.topic).length}</small></button>` +
    ORDER.filter(l => Q.some(q => q.lv === l)).map(l => `<button data-l="${l}" aria-pressed="${st.level === l}">${l}<small>${Q.filter(q => q.lv === l && (st.topic === 'smart' || q.m === st.topic)).length}</small></button>`).join('');
  const s = COACH ? COACH.stats(ID) : {};
  $('topics').innerHTML = Object.entries(TOP).map(([k, v]) => { const m = MODES[k] && COACH ? COACH.state(ID, k, s) : null; const off = k === 'dict' && !TTS; return `<button data-t="${k}" aria-pressed="${k === st.topic}"${m ? ` data-st="${m.st}"` : ''}${off ? ' disabled title="Your browser has no Russian voice"' : ''}>${v}<small>${poolFor(k).length}${m && m.pct !== null ? ' · ' + m.pct + '%' : ''}</small></button>`; }).join('');
  $('sizes').innerHTML = SIZES.map(n => `<button data-n="${n}" aria-pressed="${n === st.size}">${n}</button>`).join('');
}
function render(anim) {
  renderControls();
  const n = st.round.length, done = st.res.filter(Boolean), ok = done.filter(r => r.ok).length;
  let streak = 0; for (let k = st.res.length - 1; k >= 0; k--) { if (!st.res[k]) continue; if (st.res[k].ok) streak++; else break; }
  $('score').innerHTML = `<div><b>${ok}/${done.length}</b><span>Right</span></div><div><b>${streak}</b><span>Streak</span></div>`;
  const pct = n > 1 ? Math.min(st.i, n - 1) / (n - 1) * 100 : 0;
  $('track').className = 'track';
  $('track').innerHTML = `<div class="rail"><i style="width:${pct}%"></i></div><div class="stops">${st.round.map((_, k) => `<span class="st ${k === st.i && !st.done ? 'now' : st.res[k] ? (st.res[k].ok ? 'ok' : 'bad') : ''}"></span>`).join('')}</div>`;
  const card = $('card');
  card.innerHTML = !n ? '<p>No sentences for this level and exercise. Choose another level.</p>' : st.done ? endHTML() : qHTML();
  if (anim) { card.classList.remove('enter'); void card.offsetWidth; card.classList.add('enter'); }
  const q = cur();
  if (!st.done && q && !st.result) {
    const inp = $('ans'); if (inp && matchMedia('(hover:hover)').matches) inp.focus();
    if (anim && q.m === 'dict') setTimeout(() => say(q.ru), 350);
  } else if (st.result) { const b = $('next'); if (b && matchMedia('(hover:hover)').matches) b.focus(); }
}
function qHTML() {
  const q = cur(), r = st.result;
  const meta = `<div class="meta"><span>${q.lv}${r ? ' · ' + MODES[q.m].split(' · ')[1] : ''}</span><span>Station ${st.i + 1} of ${st.round.length}</span></div>`;
  let body = '', fb = '';
  if (q.m === 'tr') {
    body = `<p class="en big-en">${esc(q.en)}</p><h2 class="ask">Translate into Russian</h2>` + (r ? '' : `<form class="type" id="f"><input id="ans" lang="ru" autocomplete="off" autocapitalize="sentences" spellcheck="false" placeholder="Напишите по-русски…" value="${esc(st.typed)}"><button class="btn go">Check</button></form>`);
  } else if (q.m === 'dict') {
    body = `<div class="listen"><button class="btn go" data-act="say">Listen · Слушать</button><button class="btn" data-act="slow">Slower</button></div><h2 class="ask">Write what you hear</h2>` + (r ? '' : `<form class="type" id="f"><input id="ans" lang="ru" autocomplete="off" autocapitalize="sentences" spellcheck="false" placeholder="Пишите…"><button class="btn go">Check</button></form>`);
  } else if (q.m === 'order') {
    if (!st.bank) { const t = q.ru.replace(/[.,!?]/g, '').split(/\s+/).filter(w => w && !/^[—–-]$/.test(w)); if (!/^(Анна|Москв|Санкт|Петербург|Россия)/.test(t[0])) t[0] = t[0].toLowerCase(); let b; do { b = shuf(t.map((w, i) => ({ w, i }))); } while (t.length > 2 && b.every((x, k) => x.i === k)); st.bank = b; }
    const used = new Set(st.ans);
    body = `<p class="en big-en">${esc(q.en)}</p><h2 class="ask">Put the words in order</h2>
<div class="build${r ? '' : ' live'}" id="build" aria-label="Your sentence">${st.ans.length ? st.ans.map(i => `<button class="tile" data-act="out" data-i="${i}" ${r ? 'disabled' : ''}>${esc(st.bank[i].w)}</button>`).join('') : '<span class="ph">Tap the words below</span>'}</div>
${r ? '' : `<div class="bank">${st.bank.map((x, i) => `<button class="tile" data-act="in" data-i="${i}" ${used.has(i) ? 'disabled aria-hidden="true"' : ''}>${esc(x.w)}</button>`).join('')}</div>
<div class="row"><button class="btn" data-act="clear">Clear</button><button class="btn go" data-act="check" ${st.ans.length === st.bank.length ? '' : 'disabled'}>Check</button></div>`}`;
  } else {
    body = `<h2 class="ask">Tap the word with the mistake</h2><p class="ru errline" lang="ru">${q.toks.map((t, i) => `<button class="wtok ${r ? (i === q.bad ? 'bad' : i === st.pick ? 'miss' : '') : ''}" data-act="w" data-i="${i}" ${r ? 'disabled' : ''}>${esc(t)}</button>`).join(' ')}</p>${r ? '' : `<p class="note">Exactly one word is wrong. ${q.lv === 'A1' || q.lv === 'A2' ? 'Look at agreement and case endings.' : ''}</p>`}`;
  }
  if (r) {
    if (q.m === 'err') fb = `<p class="verdict ${r.ok ? 'ok' : 'bad'}">${r.ok ? '✓ Found it:' : '✗ The mistake was'} <s>${esc(q.wrong)}</s> → <b>${esc(q.right)}</b></p><p class="ru" lang="ru">${esc(q.ru)}</p><p class="rt">${esc(q.why)}</p>`;
    else {
      const how = { exact: 'Right', order: 'Right (another word order, also fine)', typo: 'Right, with a small spelling slip', self: 'Counted as right' }[r.how] || '';
      const yours = q.m === 'order' ? st.ans.map(i => st.bank[i].w).join(' ') : st.typed;
      fb = r.ok ? `<p class="verdict ok">✓ ${how}</p>${r.how === 'typo' ? `<p class="diff" lang="ru">${diffHTML(r.a)}</p>` : ''}<p class="ru" lang="ru">${esc(r.v)}</p>${q.vars.length > 1 && q.m === 'tr' ? `<p class="note">Also right: ${q.vars.filter(v => v !== r.v).map(esc).join(' · ')}</p>` : ''}`
        : `<p class="verdict bad">✗ Not quite</p><p class="diff" lang="ru">${diffHTML(r.a)}</p><p class="note">Crossed out: not needed · green: missing or correct form</p><p class="ru" lang="ru">${esc(r.v)}</p>${q.m === 'tr' && q.vars.length > 1 ? `<p class="note">Also right: ${q.vars.filter(v => v !== r.v).map(esc).join(' · ')}</p>` : ''}${q.m === 'tr' ? `<p><button class="btn" data-act="self">My answer was right too</button></p>` : ''}`;
      if (q.m === 'dict') fb += `<p class="en">${esc(q.en)}</p>`;
    }
    fb += `${TTS && q.m !== 'dict' ? `<p><button class="btn" data-act="say">Listen</button></p>` : TTS ? `<p><button class="btn" data-act="say">Listen again</button></p>` : ''}
<div class="dock"><span>${r.ok ? 'Right ✓' : (st.i + 1) + ' / ' + st.round.length}</span><button class="btn go" id="next" data-act="next">${st.i + 1 < st.round.length ? 'Next station →' : 'See results'}</button></div>`;
  }
  return meta + body + `<div class="sum in">${fb}</div>`;
}
function endHTML() {
  const n = st.round.length, ok = st.res.filter(r => r && r.ok).length, s = COACH ? COACH.stats(ID) : {};
  const used = [...new Set(st.round.map(k => Q[k].m))];
  const rows = COACH ? used.map(m => { const a = COACH.state(ID, m, s), b = st.before[m]; const d = b === null || b === undefined || a.pct === null ? '' : a.pct > b ? ` <span class="up">▲ ${a.pct - b}</span>` : a.pct < b ? ` <span class="down">▼ ${b - a.pct}</span>` : ''; return `<li><span>${MODES[m]}</span><span class="mstate" data-st="${a.st}"><b>${a.pct === null ? '—' : a.pct + '%'}</b>${d} · ${COACH.LABEL[a.st]}</span></li>`; }).join('') : '';
  const miss = st.round.map((k, j) => ({ q: Q[k], r: st.res[j] })).filter(o => !o.r || !o.r.ok);
  return `<p class="meta"><span>End of the line</span></p><p class="big">${ok}/${n}</p><p>${ok === n ? 'A clean run.' : `${n - ok} to look at again. Mistakes come back in later rounds.`}</p>
${rows ? `<h3 class="rh">How you’re doing · Ваш уровень</h3><ul class="mlist">${rows}</ul>` : ''}
${miss.length ? `<h3 class="rh">Worth another look</h3><ul class="misses">${miss.map(o => `<li><span lang="ru">${esc(o.q.ru)}</span>${o.q.en ? `<br><span class="note">${esc(o.q.en)}</span>` : `<br><span class="note">${esc(o.q.why)}</span>`}</li>`).join('')}</ul>` : ''}
<div class="row" style="margin-top:16px"><button class="btn go" data-act="new">New round</button><a class="btn" href="../">All exercises</a></div>`;
}

// ---------- events ----------
document.addEventListener('submit', e => { if (e.target.id === 'f') { e.preventDefault(); const v = $('ans').value.trim(); if (v) submit(v); } });
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b || !$('card').contains(b)) return;
  const a = b.dataset.act, q = cur();
  if (a === 'in') { st.ans.push(+b.dataset.i); render(); }
  else if (a === 'out') { st.ans = st.ans.filter(i => i !== +b.dataset.i); render(); }
  else if (a === 'clear') { st.ans = []; render(); }
  else if (a === 'check') submit(st.ans.map(i => st.bank[i].w).join(' '));
  else if (a === 'w') pickWord(+b.dataset.i);
  else if (a === 'say') say(q.ru);
  else if (a === 'slow') say(q.ru, true);
  else if (a === 'self') override();
  else if (a === 'next') next();
  else if (a === 'new') newRound();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && st.result && !st.done && e.target.tagName !== 'BUTTON') { e.preventDefault(); next(); }
  else if (e.key === 'Enter' && cur() && cur().m === 'order' && !st.result && st.bank && st.ans.length === st.bank.length) submit(st.ans.map(i => st.bank[i].w).join(' '));
});
$('topics').addEventListener('click', e => { const b = e.target.closest('button'); if (!b || b.disabled) return; st.topic = b.dataset.t; LS.set(ID + '-prefs', { topic: st.topic }); history.replaceState(null, '', '#' + st.topic); newRound(); });
$('lvls').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; st.level = b.dataset.l; LS.set('gr-level', st.level); newRound(); });
$('sizes').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; st.size = +b.dataset.n; LS.set('gr-size', st.size); newRound(); });
window.addEventListener('gr-progress-merged', () => render());
$('count').textContent = D.S.length + D.M.length;
window.__gr = { answer: () => { const q = cur(); return q.m === 'err' ? q.bad : q.ru; }, mode: () => cur() && cur().m };   // used by the automated tests
newRound();
}
