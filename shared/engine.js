/* Shared engine for the two-step grammar exercises.
   Each exercise page defines window.EXERCISE before loading this file:
   { id, step1, keepOrder1, topics:{key:label}, opts:{kind:{name,use}}, rules:{key:[title, body, example]}, items:[...] }
   Item: { t, ru, en, hint, o1:[{label,kind}], a1, forms:[...], a2, labels:[...]|null, tag, rule, cue, note, fnote } */
{
const EX = window.EXERCISE;
const Q = EX.items;
Q.forEach(q => { q.lv = q.lv || (EX.levels && EX.levels[q.t]) || 'B1'; });
const LEVELS = (window.CEFR || []).filter(l => Q.some(q => q.lv === l.code));
const $ = id => document.getElementById(id);
const shuf = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const norm = s => String(s).toLowerCase().replace(/ё/g, 'е').replace(/[.,!?«»"]/g, '').replace(/\s+/g, ' ').trim();
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
const RM = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
const SIZES = [5, 10, 20, 30, 0];
const TOP = Object.assign({ all: 'All' }, EX.topics, { miss: 'My mistakes' });
const miss = new Set(LS.get(EX.id + '-miss', []));
const seen = new Set(LS.get(EX.id + '-seen', []));
let st, lastScore = [];

$('count').textContent = Q.length;

const cur = () => Q[st.round[st.i]];
const opt = o => EX.opts[o.kind] || { name: o.kind, use: '' };
const optLabel = o => o.label || opt(o).name;

function reveal(el) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  if (r.top > innerHeight * 0.7) window.scrollBy({ top: r.top - 110, behavior: RM.matches ? 'auto' : 'smooth' });
}
function poolFor(t, lv) {
  lv = lv || st.level;
  return Q.map((q, k) => k).filter(k => (lv === 'all' || Q[k].lv === lv) && (t === 'all' || (t === 'miss' ? miss.has(Q[k].ru) : Q[k].t === t)));
}
function enterQ() {
  const q = cur(); if (!q) return;
  st.step = 1; st.p1 = null; st.pickF = null;
  const idx = q.o1.map((_, k) => k);
  st.o1 = EX.keepOrder1 ? idx : shuf(idx);
  const ans = q.forms[q.a2];
  const others = shuf([...new Set(q.forms)].filter(f => f !== ans)).slice(0, 5);
  st.fo = shuf([ans, ...others]);
}
function newRound() {
  const pool = poolFor(st.topic);
  const want = st.size ? Math.min(st.size, pool.length) : pool.length;
  let fresh = pool.filter(k => !seen.has(Q[k].ru));
  if (fresh.length < want) { pool.forEach(k => seen.delete(Q[k].ru)); fresh = pool.slice(); }
  const pick = shuf(fresh).slice(0, want);
  st.round = shuf(pick); st.i = 0; st.res = [];
  enterQ(); st.fx = 'card'; render();
}

function renderControls() {
  $('lvls').innerHTML = `<button id="l-all" data-l="all" aria-pressed="${st.level === 'all'}">All levels<small>${poolFor('all', 'all').length}</small></button>` +
    LEVELS.map(l => `<button id="l-${l.code}" data-l="${l.code}" aria-pressed="${st.level === l.code}" title="${l.en} · ${l.ru} (${l.test})">${l.code}<small>${poolFor('all', l.code).length}</small></button>`).join('');
  $('topics').innerHTML = Object.entries(TOP).map(([k, v]) => `<button id="t-${k}" data-t="${k}" aria-pressed="${k === st.topic}">${v}<small>${poolFor(k).length}</small></button>`).join('');
  document.querySelectorAll('#modes button').forEach(b => b.setAttribute('aria-pressed', b.dataset.m === st.mode));
  $('sizes').innerHTML = SIZES.map(n => `<button id="n-${n || 'all'}" data-n="${n}" aria-pressed="${n === st.size}">${n || 'All'}</button>`).join('');
}
function render() {
  renderControls();
  const n = st.round.length, done = st.res.filter(Boolean);
  const okA = done.filter(r => r.a).length, fd = done.filter(r => r.f !== undefined), okF = fd.filter(r => r.f).length;
  let streak = 0; for (let k = st.res.length - 1; k >= 0; k--) { const r = st.res[k]; if (!r || r.f === undefined) continue; if (r.a && r.f) streak++; else break; }
  const sc = [[`${okA}/${done.length}`, EX.scoreLabel || 'Choices right'], [`${okF}/${fd.length}`, 'Forms right'], [`${streak}`, 'Streak']];
  $('score').innerHTML = sc.map((s, k) => `<div><b class="${lastScore[k] !== undefined && lastScore[k] !== s[0] ? 'bump' : ''}">${s[0]}</b><span>${s[1]}</span></div>`).join('');
  lastScore = sc.map(s => s[0]);
  const pct = n > 1 ? Math.min(st.i, n - 1) / (n - 1) * 100 : 0;
  const tr = $('track');
  if (n <= 15) {
    tr.className = 'track';
    tr.innerHTML = `<div class="rail"><i style="width:${pct}%"></i></div><div class="stops">${st.round.map((_, k) => { const r = st.res[k]; const c = k === st.i && st.i < n ? 'now' : r && r.f !== undefined ? (r.a && r.f ? 'ok' : 'bad') : ''; return `<span class="st ${c}"></span>`; }).join('')}</div>`;
  } else {
    tr.className = 'track long';
    tr.innerHTML = `<div class="rail"><i style="width:${pct}%"></i></div><span class="cnt">Station ${Math.min(st.i + 1, n)} of ${n}</span>`;
  }
  const card = $('card');
  card.innerHTML = !n ? emptyHTML() : st.i >= n ? endHTML() : qHTML();
  if (st.fx === 'card') { card.classList.remove('enter', 'leave'); void card.offsetWidth; card.classList.add('enter'); }
  else card.classList.remove('leave');
  st.fx = null;
}

function emptyHTML() {
  if (st.topic !== 'miss') return `<p class="meta"><span>${TOP[st.topic]}</span></p><p class="ru" style="font-size:24px">No sentences at this level here.</p><p class="en">This topic has no ${st.level} sentences. Pick another level or topic.</p><button class="btn go" data-act="level" data-k="all">Show all levels</button>`;
  return `<p class="meta"><span>My mistakes</span></p><p class="ru" style="font-size:24px">Nothing to review yet.</p><p class="en">Every sentence you get wrong is saved here, and it leaves the list once you answer it fully right.</p><button class="btn go" data-act="topic" data-k="all">Practise all sentences</button>`;
}

function qHTML() {
  const q = cur(), r = st.res[st.i] || {}, fx = st.fx;
  const mark = s => st.step === 3 && q.cue && s.includes(q.cue) ? s.replace(q.cue, `<mark>${q.cue}</mark>`) : s;
  const [a, b] = q.ru.split('___');
  const ans = q.forms[q.a2], right1 = q.o1[q.a1];
  let gap = q.hint ? `<span class="hint">${q.hint}</span>` : '?', gc = '';
  if (st.step === 3) { gap = ans; gc = (r.f ? 'ok' : 'bad') + (fx === 'f' ? ' pop' : ''); }
  const fxc = ok => ok ? ' pop' : ' shake';
  const b1 = st.o1.map((k, n) => {
    const o = q.o1[k]; let c = '';
    if (st.step > 1) { if (k === q.a1) c = 'ok'; else if (k === st.p1) c = 'bad'; }
    if (fx === 'a' && k === st.p1) c += fxc(r.a);
    return `<button class="opt ${c}" data-act="a" data-k="${k}" ${st.step > 1 ? 'disabled' : ''}><kbd>${n + 1}</kbd>${optLabel(o)}</button>`;
  }).join('');
  const quick = st.step > 1 ? `<p class="quick ${r.a ? 'ok' : 'bad'} ${fx === 'a' ? 'in' : ''}">${r.a ? 'Right: ' + optLabel(right1) + '.' : `Not quite: it’s ${optLabel(right1)}.`}${st.step === 2 ? ' <span>The full explanation comes after the form.</span>' : ''}</p>` : '';
  let s2 = '', exp = '';
  if (st.step >= 2) {
    let body;
    if (st.mode === 'pick') {
      body = `<div class="opts">${st.fo.map((f, k) => { let c = ''; if (st.step === 3) { if (f === ans) c = 'ok'; else if (f === st.pickF) c = 'bad'; } if (fx === 'f' && f === st.pickF) c += fxc(r.f); return `<button class="opt ${c}" data-act="f" data-k="${esc(f)}" ${st.step === 3 ? 'disabled' : ''}><kbd>${k + 1}</kbd>${f}</button>`; }).join('')}</div>`;
    } else if (st.step === 2) {
      body = `<form class="type" id="tf"><input id="ans" lang="ru" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" placeholder="Type the form in Cyrillic" aria-label="Your answer"><button class="btn go" type="submit">Check</button></form><p class="note">You can type е instead of ё.</p>`;
    } else body = `<p class="quick ${r.f ? 'ok' : 'bad'}">${r.f ? 'Right: ' : `You wrote “${esc(st.pickF)}”. Correct: `}${ans}.</p>`;
    s2 = `<div class="step ${fx === 'a' ? 'in' : ''}" id="s2"><h2><b>2</b> Choose the form${q.hint ? ` of <em>${q.hint}</em>` : ''}${q.tag ? `<span class="tag">${q.tag}</span>` : ''}</h2>${body}</div>`;
  }
  if (st.step === 3) {
    const R = EX.rules[q.rule], open = st.open;
    const nots = q.o1.map((o, k) => k === q.a1 ? '' : `<li><b>${optLabel(o)}</b>${o.label ? ` (${opt(o).name})` : ''}: ${opt(o).use}</li>`).join('');
    const table = q.labels ? `<table class="par casetbl" aria-label="All forms">${q.labels.map((l, k) => q.forms[k] === undefined ? '' : `<tr class="${k === q.a2 ? 'hit' : q.forms[k] === st.pickF && q.forms[k] !== ans ? 'miss' : ''}"><td>${l}</td><td>${q.forms[k]}</td></tr>`).join('')}</table>` : '';
    exp = `<div class="sum ${fx === 'f' ? 'in' : ''}" id="exp">
<p class="verdict ${r.a ? 'ok' : 'bad'}">${r.a ? '✓' : '✗'} ${EX.step1Short || 'Choice'}: ${optLabel(right1)}${r.a ? '' : ` <span>(you chose ${optLabel(q.o1[st.p1])})</span>`}</p>
<p class="verdict ${r.f ? 'ok' : 'bad'}">${r.f ? '✓' : '✗'} Form: ${ans}${r.f ? '' : ` <span>(you ${st.mode === 'type' ? 'wrote' : 'chose'} “${esc(st.pickF)}”)</span>`}</p>
<p class="rt">${R[0]}</p>
<button class="more" id="more" data-act="more" aria-expanded="${open}" aria-controls="panel"><span>${open ? 'Hide the explanation' : 'Show the full explanation'}</span><i aria-hidden="true"></i></button></div>
<div class="panel ${open ? 'open' : ''}" id="panel" ${open ? '' : 'inert'}><div><div class="exp">
<section><h3>The rule</h3><p class="rt">${R[0]}</p><p>${R[1]}</p><p class="idn">Example: ${R[2]}</p></section>
<section><h3>In this sentence</h3><p>${q.cue ? `Signal: <mark>${q.cue}</mark>. ` : ''}${q.en}${q.note ? ` ${q.note}` : ''}</p></section>
<section><h3>Why ${optLabel(right1)}</h3><p>${right1.label ? `${right1.label} is ${opt(right1).name.split(' · ').pop().toLowerCase()} (${opt(right1).name.split(' · ')[0].toLowerCase()})` : opt(right1).name}: ${opt(right1).use}</p><h3 style="margin-top:12px">Why not the others</h3><ul class="nots">${nots}</ul></section>
<section class="formgrid"><div><h3>The form</h3><p>${q.fnote || ''}</p></div>${table}</section></div></div></div>
<div class="dock"><span>${r.a && r.f ? 'Both right ✓' : (st.i + 1) + ' / ' + st.round.length}</span><button class="btn go" id="next" data-act="next">${st.i + 1 < st.round.length ? 'Next station →' : 'See results'}</button></div>`;
  }
  const L = (window.CEFR || []).find(l => l.code === q.lv);
  return `<div class="meta"><span>${q.lv}${L ? ' · ' + L.en : ''} · ${TOP[q.t]}</span><span>Station ${st.i + 1} of ${st.round.length}</span></div>
<p class="ru" lang="ru">${mark(a)}<span class="gap ${gc}">${gap}</span>${mark(b)}</p><p class="en">${q.en}</p>
<div class="step"><h2><b>1</b> ${EX.step1}</h2><div class="opts">${b1}</div>${quick}</div>${s2}${exp}`;
}

function endHTML() {
  const n = st.round.length;
  const tot = st.res.reduce((s, r) => s + (r.a ? 1 : 0) + (r.f ? 1 : 0), 0);
  const ms = st.round.map((k, j) => ({ q: Q[k], r: st.res[j] })).filter(o => !(o.r.a && o.r.f));
  return `<p class="meta"><span>End of the line</span></p><p class="big">${tot}/${n * 2}</p>
<p>${tot === n * 2 ? 'A perfect ride: every choice and every form right.' : `You got ${st.res.filter(r => r.a).length} of ${n} choices and ${st.res.filter(r => r.f).length} of ${n} forms right.`}</p>
${ms.length ? `<h3 style="font:700 17px 'PT Sans',sans-serif;margin:20px 0 0">Worth another look (saved to My mistakes)</h3><ul class="misses">${ms.map(o => `<li><span lang="ru">${o.q.ru.replace('___', '<b>' + o.q.forms[o.q.a2] + '</b>')}</span><br><span class="note">${o.q.en} Rule: ${EX.rules[o.q.rule][0]}.</span></li>`).join('')}</ul>` : ''}
<button class="btn go" data-act="new" id="again">New round</button>`;
}

function track(q, ok) {
  seen.add(q.ru); LS.set(EX.id + '-seen', [...seen]);
  if (ok) miss.delete(q.ru); else miss.add(q.ru);
  LS.set(EX.id + '-miss', [...miss]);
}
function pickA(k) {
  const q = cur(); st.p1 = k; st.res[st.i] = { a: k === q.a1 }; st.step = 2; st.fx = 'a'; render();
  if (st.mode === 'type') { const i = $('ans'); if (i) i.focus({ preventScroll: true }); }
  reveal($('s2'));
}
function pickF(f) {
  const q = cur();
  st.pickF = f; st.res[st.i].f = norm(f) === norm(q.forms[q.a2]); st.step = 3; st.fx = 'f';
  track(q, st.res[st.i].a && st.res[st.i].f);
  render();
  const nx = $('next'); if (nx) nx.focus({ preventScroll: true });
  reveal($('exp'));
}
function next() {
  if (st.busy) return; st.busy = true;
  const card = $('card');
  const go = () => {
    st.busy = false; st.i++; enterQ(); st.fx = 'card'; render();
    const top = card.getBoundingClientRect().top;
    if (top < 0 || top > innerHeight * 0.5) window.scrollBy({ top: top - 16, behavior: RM.matches ? 'auto' : 'smooth' });
    if (st.i >= st.round.length) { const a = $('again'); if (a) a.focus({ preventScroll: true }); }
  };
  if (RM.matches) go(); else { card.classList.remove('enter'); card.classList.add('leave'); setTimeout(go, 170); }
}
function toggleMore() {
  st.open = !st.open; LS.set('gr-open', st.open);
  const p = $('panel'), b = $('more'); if (!p || !b) return;
  p.classList.toggle('open', st.open); p.toggleAttribute('inert', !st.open);
  b.setAttribute('aria-expanded', st.open); b.querySelector('span').textContent = st.open ? 'Hide the explanation' : 'Show the full explanation';
  if (st.open) setTimeout(() => reveal(p), RM.matches ? 0 : 120);
}
const savePrefs = () => LS.set(EX.id + '-prefs', { topic: st.topic, mode: st.mode });
function setLevel(l) { st.level = l; LS.set('gr-level', l); newRound(); }
function setTopic(t) { st.topic = t; savePrefs(); newRound(); const b = $('t-' + t); if (b) b.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }

$('card').addEventListener('click', e => {
  const b = e.target.closest('button[data-act]'); if (!b || b.disabled) return;
  const a = b.dataset.act;
  if (a === 'a' && st.step === 1) pickA(+b.dataset.k);
  else if (a === 'f' && st.step === 2) pickF(b.dataset.k);
  else if (a === 'next') next();
  else if (a === 'new') newRound();
  else if (a === 'topic') setTopic(b.dataset.k);
  else if (a === 'more') toggleMore();
  else if (a === 'level') setLevel(b.dataset.k);
});
$('card').addEventListener('submit', e => { e.preventDefault(); const v = $('ans').value; if (!v.trim()) return; pickF(v); });
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.metaKey || e.ctrlKey || e.altKey || !st.round.length) return;
  const d = parseInt(e.key, 10);
  if (d >= 1 && d <= 9 && st.i < st.round.length) {
    if (st.step === 1 && st.o1[d - 1] !== undefined) pickA(st.o1[d - 1]);
    else if (st.step === 2 && st.mode === 'pick' && st.fo[d - 1]) pickF(st.fo[d - 1]);
  }
});
$('topics').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setTopic(b.dataset.t); });
$('lvls').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setLevel(b.dataset.l); });
$('modes').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; st.mode = b.dataset.m; savePrefs(); render(); });
$('sizes').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; st.size = +b.dataset.n; LS.set('gr-size', st.size); newRound(); });

const prefs = LS.get(EX.id + '-prefs', {});
const size = LS.get('gr-size', 10);
const lvPref = LS.get('gr-level', 'all');
st = { level: lvPref === 'all' || LEVELS.some(l => l.code === lvPref) ? lvPref : 'all', topic: TOP[prefs.topic] ? prefs.topic : 'all', mode: prefs.mode === 'type' ? 'type' : 'pick', size: SIZES.includes(size) ? size : 10, round: [], i: 0, res: [], step: 1, o1: [], fo: [], p1: null, pickF: null, open: LS.get('gr-open', false) === true };
newRound();
try { if ('serviceWorker' in navigator && window.top === window && location.protocol === 'https:') addEventListener('load', () => navigator.serviceWorker.register('../sw.js', { scope: '../' }).catch(() => {})); } catch (e) {}
}
