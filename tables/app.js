/* Tables line: fill in conjugation and declension tables. Data in data.js (window.TABLES). */
{
const LG = window.GR_L || { code: 'ru', levelKey: 'gr-level', how: '${LG.how}', typeNote: 'ё can be typed as е.', norm: s => String(s).toLowerCase().replace(/ё/g, 'е') };
const D = window.TABLES, COACH = window.GRCoach, ID = LG.code === 'ru' ? 'tables' : LG.code + '-tables';
const $ = id => document.getElementById(id);
const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
const shuf = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const norm = s => LG.norm(s).replace(/[^\p{L} -]/gu, '').replace(/\s+/g, ' ').trim();
const ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const TOP = D.TOP || { smart: 'Рекомендуем · Recommended', pres: 'Спряжение · Present and future', past: 'Прошедшее время · Past tense', noun: 'Склонение · Nouns', pron: 'Местоимения · Pronouns' };
const GAPS = { some: 'A few gaps', half: 'Half', all: 'Whole table' };
const SIZES = [3, 5, 10];
const CASES = ['Nominative', 'Genitive', 'Dative', 'Accusative', 'Instrumental', 'Prepositional'];
const CS = ['Им.', 'Род.', 'Дат.', 'Вин.', 'Твор.', 'Пред.'];
const PERS = ['я', 'ты', 'он / она', 'мы', 'вы', 'они'];

// each table: {t: topic, lv, key, title, sub, cols:[header...], rows:[{h, cells:[answer|null...]}], given:[[r,c]...]}
const T = D.T ? D.T.slice() : [];
if (D.V) D.V.forEach(([lv, inf, en, asp, ...f]) => {
  const fut = asp === 'pf';
  T.push({ t: 'pres', lv, key: 'pres:' + inf, title: inf, sub: `${en} · ${fut ? 'perfective: future tense' : 'present tense'}`, cols: ['', fut ? 'Future' : 'Present'], rows: PERS.map((p, i) => ({ h: p, cells: [f[i]] })) });
  T.push({ t: 'past', lv, key: 'past:' + inf, title: inf, sub: `${en} · past tense`, cols: ['', 'Past'], rows: [['он', f[6]], ['она', f[7]], ['оно', f[7].replace(/а$/, 'о')], ['они', f[8]]].map(([h, v]) => ({ h, cells: [v] })) });
});
if (D.N) D.N.forEach(([lv, nom, en, ...f]) => T.push({ t: 'noun', lv, key: 'noun:' + nom, title: nom, sub: en, cols: ['', 'Singular', 'Plural'], rows: CASES.map((c, i) => ({ h: `${CS[i]} <small>${c}</small>`, cells: [f[i], f[i + 6]] })), lock: [[0, 0]] }));
if (D.P) T.push({ t: 'pron', lv: 'A2', key: 'pron:all', title: 'я, ты, он…', sub: 'personal pronouns · after a preposition он, она, они add н-: у него, к ней, о них', cols: ['', ...CS.slice(1)], rows: D.P.map(r => ({ h: r[0], cells: r.slice(1) })) });

// ---------- state ----------
const lvPref = LS.get(LG.levelKey, 'all'), prefs = LS.get(ID + '-prefs', {});
const hashT = decodeURIComponent(location.hash.slice(1));
let st = { level: lvPref === 'all' || ORDER.includes(lvPref) ? lvPref : 'all', topic: TOP[hashT] ? hashT : TOP[prefs.topic] ? prefs.topic : 'smart', gaps: GAPS[prefs.gaps] ? prefs.gaps : 'some', size: SIZES.includes(prefs.size) ? prefs.size : 5, round: [], i: 0, res: [], done: false };
const seen = new Set(LS.get(ID + '-seen', []));
const poolFor = t => T.map((x, k) => k).filter(k => (t === 'smart' || T[k].t === t) && (st.level === 'all' || T[k].lv === st.level || (T[k].t === 'pron' && ORDER.indexOf(st.level) >= 1)));
function newRound() {
  let pool = poolFor(st.topic); if (!pool.length) pool = T.map((x, k) => k).filter(k => st.topic === 'smart' || T[k].t === st.topic);
  const due = new Set(COACH ? COACH.dueReviews(ID) : []), s = COACH ? COACH.stats(ID) : {}, W = { weak: 3, started: 2, new: 2, good: 1, mastered: 0.4 };
  const w = pool.map(k => { let x = due.has(T[k].key) ? 10 : 1; if (COACH && st.topic === 'smart') x *= W[COACH.state(ID, T[k].t, s).st] || 1; if (seen.has(T[k].key)) x *= 0.3; return { k, w: x }; });
  const out = []; while (out.length < st.size && w.length) { const tot = w.reduce((a, b) => a + b.w, 0); let r = Math.random() * tot, i = 0; while (i < w.length - 1 && (r -= w[i].w) > 0) i++; out.push(w[i].k); w.splice(i, 1); }
  st.round = out; st.i = 0; st.res = []; st.done = false; st.before = {};
  if (COACH) Object.keys(TOP).slice(1).forEach(t => { st.before[t] = COACH.state(ID, t, s).pct; });
  setup(); render(true);
}
const cur = () => T[st.round[st.i]];
function setup() {
  const x = cur(); st.checked = false; st.vals = {}; if (!x) return;
  const cells = []; x.rows.forEach((r, ri) => r.cells.forEach((c, ci) => { if (c && !(x.lock || []).some(([a, b]) => a === ri && b === ci)) cells.push(ri + ':' + ci); }));
  const n = st.gaps === 'all' ? cells.length : st.gaps === 'half' ? Math.ceil(cells.length / 2) : Math.min(cells.length, x.t === 'noun' ? 4 : x.t === 'pron' ? 6 : 3);
  st.blank = new Set(shuf(cells).slice(0, n));
}
const okCell = (ans, v) => ans.split('/').some(a => norm(a) === norm(v));

function check() {
  const x = cur(); if (!x || st.checked) return;
  document.querySelectorAll('#card input[data-c]').forEach(i => { st.vals[i.dataset.c] = i.value; });
  let right = 0; st.blank.forEach(c => { const [r, k] = c.split(':').map(Number); if (okCell(x.rows[r].cells[k], st.vals[c] || '')) right++; });
  st.checked = true; st.res[st.i] = { ok: right === st.blank.size, right, n: st.blank.size };
  if (COACH) COACH.record(ID, x.t, st.res[st.i].ok, x.key);
  seen.add(x.key); LS.set(ID + '-seen', [...seen]);
  render();
}
function next() { st.i++; if (st.i >= st.round.length) st.done = true; setup(); render(true); }

// ---------- rendering ----------
function renderControls() {
  const cnt = l => T.filter(x => (st.topic === 'smart' || x.t === st.topic) && (l === 'all' || x.lv === l)).length;
  $('lvls').innerHTML = `<button data-l="all" aria-pressed="${st.level === 'all'}">All<small>${cnt('all')}</small></button>` + ORDER.filter(l => T.some(x => x.lv === l)).map(l => `<button data-l="${l}" aria-pressed="${st.level === l}">${l}<small>${cnt(l)}</small></button>`).join('');
  const s = COACH ? COACH.stats(ID) : {};
  $('topics').innerHTML = Object.entries(TOP).map(([k, v]) => { const m = k !== 'smart' && COACH ? COACH.state(ID, k, s) : null; return `<button data-t="${k}" aria-pressed="${k === st.topic}"${m ? ` data-st="${m.st}"` : ''}>${v}<small>${poolFor(k).length}${m && m.pct !== null ? ' · ' + m.pct + '%' : ''}</small></button>`; }).join('');
  $('gaps').innerHTML = Object.entries(GAPS).map(([k, v]) => `<button data-g="${k}" aria-pressed="${k === st.gaps}">${v}</button>`).join('');
  $('sizes').innerHTML = SIZES.map(n => `<button data-n="${n}" aria-pressed="${n === st.size}">${n}</button>`).join('');
}
function render(anim) {
  renderControls();
  const n = st.round.length, done = st.res.filter(Boolean), ok = done.filter(r => r.ok).length, cells = done.reduce((a, r) => a + r.right, 0), all = done.reduce((a, r) => a + r.n, 0);
  $('score').innerHTML = `<div><b>${ok}/${done.length}</b><span>Tables</span></div><div><b>${cells}/${all}</b><span>Forms</span></div>`;
  const pct = n > 1 ? Math.min(st.i, n - 1) / (n - 1) * 100 : 0;
  $('track').innerHTML = `<div class="rail"><i style="width:${pct}%"></i></div><div class="stops">${st.round.map((_, k) => `<span class="st ${k === st.i && !st.done ? 'now' : st.res[k] ? (st.res[k].ok ? 'ok' : 'bad') : ''}"></span>`).join('')}</div>`;
  const card = $('card');
  card.innerHTML = !n ? '<p>No tables for this level. Choose another level.</p>' : st.done ? endHTML() : qHTML();
  if (anim) { card.classList.remove('enter'); void card.offsetWidth; card.classList.add('enter'); }
  if (!st.done && !st.checked) { const f = card.querySelector('input'); if (f && matchMedia('(hover:hover)').matches) f.focus(); }
  else if (st.checked) { const b = $('next'); if (b && matchMedia('(hover:hover)').matches) b.focus(); }
}
function qHTML() {
  const x = cur(), r = st.res[st.i];
  const cell = (v, ri, ci) => {
    const id = ri + ':' + ci;
    if (!v) return '<td class="na">—</td>';
    if (!st.blank.has(id)) return `<td lang="${LG.code}">${esc(v.split('/')[0])}</td>`;
    if (!st.checked) return `<td><input data-c="${id}" lang="${LG.code}" autocomplete="off" autocapitalize="none" spellcheck="false" aria-label="${esc(x.rows[ri].h.replace(/<[^>]+>/g, ''))} ${esc(x.cols[ci + 1])}"></td>`;
    const u = st.vals[id] || '', good = okCell(v, u);
    return `<td class="${good ? 'c-ok' : 'c-bad'}" lang="${LG.code}">${good ? esc(v.split('/')[0]) : `${u ? `<s>${esc(u)}</s> ` : ''}<b>${esc(v.replace('/', ' / '))}</b>`}</td>`;
  };
  return `<div class="meta"><span>${x.lv} · ${TOP[x.t].split(' · ')[1]}</span><span>Table ${st.i + 1} of ${st.round.length}</span></div>
<p class="ru tt" lang="${LG.code}">${esc(x.title)}</p><p class="en">${esc(x.sub)}</p>
<form id="f" class="tblform"><div class="tbl"><table class="fill"><thead><tr>${x.cols.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody>${x.rows.map((row, ri) => `<tr><th scope="row" lang="${LG.code}">${row.h}</th>${row.cells.map((v, ci) => cell(v, ri, ci)).join('')}</tr>`).join('')}</tbody></table></div>
${st.checked ? '' : `<div class="row"><button class="btn go">Check</button><span class="note">Tab or Enter moves to the next gap. ${LG.code === 'ru' ? 'ё can be typed as е.' : LG.typeNote}</span></div>`}</form>
${st.checked ? `<p class="verdict ${r.ok ? 'ok' : 'bad'}">${r.ok ? '✓ All right' : `✗ ${r.right} of ${r.n} right`}</p><div class="dock"><span>${r.ok ? 'Right ✓' : (st.i + 1) + ' / ' + st.round.length}</span><button class="btn go" id="next" data-act="next">${st.i + 1 < st.round.length ? 'Next table →' : 'See results'}</button></div>` : ''}`;
}
function endHTML() {
  const n = st.round.length, ok = st.res.filter(r => r && r.ok).length, s = COACH ? COACH.stats(ID) : {};
  const used = [...new Set(st.round.map(k => T[k].t))];
  const rows = COACH ? used.map(t => { const a = COACH.state(ID, t, s), b = st.before[t]; const d = b === null || b === undefined || a.pct === null ? '' : a.pct > b ? ` <span class="up">▲ ${a.pct - b}</span>` : a.pct < b ? ` <span class="down">▼ ${b - a.pct}</span>` : ''; return `<li><span>${TOP[t]}</span><span class="mstate" data-st="${a.st}"><b>${a.pct === null ? '—' : a.pct + '%'}</b>${d} · ${COACH.LABEL[a.st]}</span></li>`; }).join('') : '';
  const miss = st.round.filter((k, j) => !st.res[j] || !st.res[j].ok).map(k => T[k].title);
  return `<p class="meta"><span>End of the line</span></p><p class="big">${ok}/${n}</p><p>${ok === n ? 'Every table complete.' : `Worth another go: ${miss.map(esc).join(', ')}. They come back in later rounds.`}</p>
${rows ? `<h3 class="rh">${LG.how}</h3><ul class="mlist">${rows}</ul>` : ''}
<div class="row" style="margin-top:16px"><button class="btn go" data-act="new">New round</button>${st.gaps !== 'all' ? `<button class="btn" data-act="harder">More gaps</button>` : ''}<a class="btn" href="../">All exercises</a></div>`;
}

// ---------- events ----------
document.addEventListener('submit', e => { if (e.target.id === 'f') { e.preventDefault(); check(); } });
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.dataset.c) {
    const ins = [...document.querySelectorAll('#card input[data-c]')], i = ins.indexOf(e.target);
    if (i < ins.length - 1) { e.preventDefault(); ins[i + 1].focus(); }
  } else if (e.key === 'Enter' && st.checked && !st.done && e.target.tagName !== 'BUTTON') { e.preventDefault(); next(); }
});
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b || !$('card').contains(b)) return;
  if (b.dataset.act === 'next') next();
  else if (b.dataset.act === 'new') newRound();
  else if (b.dataset.act === 'harder') { st.gaps = st.gaps === 'some' ? 'half' : 'all'; save(); newRound(); }
});
const save = () => LS.set(ID + '-prefs', { topic: st.topic, gaps: st.gaps, size: st.size });
$('topics').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; st.topic = b.dataset.t; save(); history.replaceState(null, '', '#' + st.topic); newRound(); });
$('lvls').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; st.level = b.dataset.l; LS.set(LG.levelKey, st.level); newRound(); });
$('gaps').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; st.gaps = b.dataset.g; save(); newRound(); });
$('sizes').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; st.size = +b.dataset.n; save(); newRound(); });
window.addEventListener('gr-progress-merged', () => render());
$('count').textContent = T.length;
window.__gr = { table: () => cur(), blanks: () => [...st.blank] };   // used by the automated tests
newRound();
}
