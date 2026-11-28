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
const LG = window.GR_L || { code: 'ru', tts: 'ru-RU', root: '../', levelKey: 'gr-level', smart: 'Рекомендуем · Recommended', all: 'Все темы · All topics', miss: 'Мои ошибки · My mistakes', how: 'How you’re doing · Ваш уровень', listen: 'Listen · Слушать', typeHint: 'Type the form in Cyrillic', typeNote: 'You can type е instead of ё.', norm: s => String(s).toLowerCase().replace(/ё/g, 'е') };
const norm = s => LG.norm(s).replace(/[.,!?«»"„“]/g, '').replace(/\s+/g, ' ').trim();
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
const RM = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
const SIZES = [5, 10, 20, 30, 0];
const TOP = Object.assign({ smart: EX.smartName || LG.smart, all: LG.all }, EX.topics, { miss: LG.miss });
const COACH = window.GRCoach;
const NAMES = Object.assign({}, EX.topics);
const miss = new Set(LS.get(EX.id + '-miss', []));
const seen = new Set(LS.get(EX.id + '-seen', []));
let st, lastScore = [];

$('count').textContent = Q.length;

const cur = () => Q[st.round[st.i]];
const ONE = () => { const q = cur(); return !EX.twoStepOnly && !(q && q.two) && st.steps !== 'two'; };
const GP = q => q.gp !== undefined ? q.gp : !!EX.gapPrefix;
const TTS = 'speechSynthesis' in window;
function say(text, slow) {
  if (!TTS) return;
  const u = new SpeechSynthesisUtterance(text.replace(/\u0301/g, ''));
  u.lang = LG.tts; u.rate = slow ? 0.7 : 0.95;
  const v = speechSynthesis.getVoices().find(x => x.lang && x.lang.toLowerCase().startsWith(LG.code));
  if (v) u.voice = v;
  speechSynthesis.cancel(); speechSynthesis.speak(u);
}
if (TTS) speechSynthesis.getVoices();
const spoken = q => q.ru.replace('___', full(q));
const full = q => (GP(q) ? optLabel(q.o1[q.a1]) + ' ' : '') + q.forms[q.a2];
const opt = o => EX.opts[o.kind] || { name: o.kind, use: '' };
const optLabel = o => o.label || opt(o).name;
const optHTML = o => { const t = optLabel(o); const i = t.indexOf(' · '); return i < 0 ? t : `<span lang="${LG.code}">${t.slice(0, i)}</span><small class="en2">${t.slice(i + 3)}</small>`; };

function reveal(el) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  if (r.top > innerHeight * 0.7) window.scrollBy({ top: r.top - 110, behavior: RM.matches ? 'auto' : 'smooth' });
}
function poolFor(t, lv) {
  lv = lv || st.level;
  return Q.map((q, k) => k).filter(k => (lv === 'all' || Q[k].lv === lv) && (t === 'all' || t === 'smart' || (t === 'miss' ? miss.has(Q[k].ru) : Q[k].t === t)));
}
function enterQ() {
  st.showEn = false;
  const q = cur(); if (!q) return;
  st.step = ONE() ? 2 : 1; st.p1 = null; st.pickF = null;
  const idx = q.o1.map((_, k) => k);
  st.o1 = (q.ko !== undefined ? q.ko : EX.keepOrder1) ? idx : shuf(idx);
  const ans = q.forms[q.a2];
  if (ONE() && GP(q)) {
    // one step with prepositions: mix wrong prepositions with wrong case forms
    const p = optLabel(q.o1[q.a1]), right = p + ' ' + ans;
    const wrongP = q.o1.filter((_, k) => k !== q.a1).map(o => optLabel(o) + ' ' + ans);
    const wrongF = shuf([...new Set(q.forms)].filter(f => f !== ans)).slice(0, 3).map(f => p + ' ' + f);
    st.fo = shuf([right, ...[...new Set([...wrongP, ...wrongF])].filter(x => x !== right).slice(0, 5)]);
  } else {
    const alt = ONE() && q.alt ? q.alt.filter(f => f !== ans) : [];
    const others = [...alt, ...shuf([...new Set(q.forms)].filter(f => f !== ans && !alt.includes(f)))].slice(0, 5);
    st.fo = shuf([ans, ...others]);
  }
}
function newRound() {
  let pick;
  st.frontier = null;
  if (st.topic === 'smart' && EX.pick) {
    const r = EX.pick(st.size || 15, seen, st.level); pick = r.picks || r; st.frontier = r.frontier || null;
  } else if (st.topic === 'smart' && COACH) {
    const want = st.size || 20;
    const r = COACH.smartPick(EX.id, Q, want, seen, st.level);
    pick = r.picks; st.frontier = r.frontier;
  } else {
    const pool = poolFor(st.topic);
    const want = st.size ? Math.min(st.size, pool.length) : pool.length;
    let fresh = pool.filter(k => !seen.has(Q[k].ru));
    if (fresh.length < want) { pool.forEach(k => seen.delete(Q[k].ru)); fresh = pool.slice(); }
    pick = shuf(fresh).slice(0, want);
  }
  st.round = EX.keepOrder && st.topic === 'smart' ? pick : shuf(pick); st.i = 0; st.res = [];
  if (COACH) { st.before = {}; st.round.forEach(k => { const q = Q[k], id = q.ex || EX.id, t = q.ot || q.t; st.before[id + ':' + t] = COACH.state(id, t).pct; }); }
  enterQ(); st.fx = 'card'; render();
}

function renderControls() {
  $('lvls').innerHTML = `<button id="l-all" data-l="all" aria-pressed="${st.level === 'all'}">All<small>${poolFor('all', 'all').length}</small></button>` +
    LEVELS.map(l => `<button id="l-${l.code}" data-l="${l.code}" aria-pressed="${st.level === l.code}" title="${l.en} · ${l.ru} (${l.test})">${l.code}<small>${poolFor('all', l.code).length}</small></button>`).join('');
  const cs = COACH ? COACH.stats(EX.id) : {};
  $('topics').innerHTML = Object.entries(TOP).map(([k, v]) => {
    const real = EX.topics[k], m = real && COACH && !EX.multi ? COACH.state(EX.id, k, cs) : null;
    const extra = m && m.pct !== null ? ` · ${m.pct}%` : '';
    return `<button id="t-${k}" data-t="${k}" aria-pressed="${k === st.topic}"${m ? ` data-st="${m.st}" title="${COACH.LABEL[m.st]}"` : ''}>${v}<small>${poolFor(k).length}${extra}</small></button>`;
  }).join('');
  document.querySelectorAll('#modes button').forEach(b => b.setAttribute('aria-pressed', b.dataset.m === st.mode));
  const stp = $('steps');
  if (stp) { stp.closest('.grp').hidden = !!EX.twoStepOnly; stp.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.s === (st.steps === 'two' ? 'two' : 'one'))); }
  document.querySelectorAll('#ens button').forEach(b => b.setAttribute('aria-pressed', b.dataset.e === st.en));
  $('sizes').innerHTML = SIZES.map(n => `<button id="n-${n || 'all'}" data-n="${n}" aria-pressed="${n === st.size}">${n || 'All'}</button>`).join('');
}
function render() {
  renderControls();
  const n = st.round.length, done = st.res.filter(Boolean);
  const okA = done.filter(r => r.a).length, fd = done.filter(r => r.f !== undefined), okF = fd.filter(r => r.f).length;
  let streak = 0; for (let k = st.res.length - 1; k >= 0; k--) { const r = st.res[k]; if (!r || r.f === undefined) continue; if (r.a && r.f) streak++; else break; }
  const sc = ONE() ? [[`${okF}/${fd.length}`, 'Right'], [`${streak}`, 'Streak']] : [[`${okA}/${done.length}`, EX.scoreLabel || 'Choices right'], [`${okF}/${fd.length}`, 'Forms right'], [`${streak}`, 'Streak']];
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
  if (st.fx === 'card') { card.classList.remove('enter', 'leave'); void card.offsetWidth; card.classList.add('enter'); if (st.mode === 'listen' && st.i < n && cur()) setTimeout(() => say(spoken(cur())), 350); }
  else card.classList.remove('leave');
  st.fx = null;
}

function emptyHTML() {
  if (st.topic === 'smart') return `<p class="meta"><span>${TOP.smart}</span></p><p class="ru" style="font-size:24px">Nothing to recommend at this level.</p><p class="en">Pick another level, or practise all topics.</p><button class="btn go" data-act="level" data-k="all">Show all levels</button>`;
  if (st.topic !== 'miss') return `<p class="meta"><span>${TOP[st.topic]}</span></p><p class="ru" style="font-size:24px">No sentences at this level here.</p><p class="en">This topic has no ${st.level} sentences. Pick another level or topic.</p><button class="btn go" data-act="level" data-k="all">Show all levels</button>`;
  return `<p class="meta"><span>My mistakes</span></p><p class="ru" style="font-size:24px">Nothing to review yet.</p><p class="en">Every sentence you get wrong is saved here, and it leaves the list once you answer it fully right.</p><button class="btn go" data-act="topic" data-k="all">Practise all sentences</button>`;
}

function guideHref(q) {
  const map = ((window.GUIDE_MAP || {})[LG.code]) || {}, id = q.ex || EX.id, t = q.ot || q.t;
  const a = map[id + ':' + t] || map[id] || '';
  return LG.root + (LG.code === 'ru' ? '' : LG.code + '/') + 'grammar/' + (a ? '#' + a : '');
}
const shortName = o => ((o.label && opt(o).name !== o.label) ? o.label : opt(o).name).split(' · ').pop();
function qHTML() {
  const q = cur(), r = st.res[st.i] || {}, fx = st.fx;
  const mark = s => st.step === 3 && q.cue && s.includes(q.cue) ? s.replace(q.cue, `<mark>${q.cue}</mark>`) : s;
  const [a, b] = q.ru.split('___');
  const one = ONE(), ans = one ? full(q) : q.forms[q.a2], right1 = q.o1[q.a1];
  let gap = q.hint ? `<span class="hint">${q.hint}</span>` : '?', gc = '';
  if (st.step === 3) { gap = full(q); gc = (r.f ? 'ok' : 'bad') + (fx === 'f' ? ' pop' : ''); }
  const fxc = ok => ok ? ' pop' : ' shake';
  const b1 = st.o1.map((k, n) => {
    const o = q.o1[k]; let c = '';
    if (st.step > 1) { if (k === q.a1) c = 'ok'; else if (k === st.p1) c = 'bad'; }
    if (fx === 'a' && k === st.p1) c += fxc(r.a);
    return `<button class="opt ${c}" data-act="a" data-k="${k}" ${st.step > 1 ? 'disabled' : ''}><kbd>${n + 1}</kbd>${optHTML(o)}</button>`;
  }).join('');
  const quick = st.step > 1 ? `<p class="quick ${r.a ? 'ok' : 'bad'} ${fx === 'a' ? 'in' : ''}">${r.a ? 'Right: ' + optLabel(right1) + '.' : `Not quite: it’s ${optLabel(right1)}.`}</p>` : '';
  let s2 = '', exp = '';
  if (st.step >= 2) {
    let body;
    if (st.mode !== 'type') {
      body = `<div class="opts">${st.fo.map((f, k) => { let c = ''; if (st.step === 3) { if (f === ans) c = 'ok'; else if (f === st.pickF) c = 'bad'; } if (fx === 'f' && f === st.pickF) c += fxc(r.f); return `<button class="opt ${c}" data-act="f" data-k="${esc(f)}" ${st.step === 3 ? 'disabled' : ''}><kbd>${k + 1}</kbd>${f}</button>`; }).join('')}</div>`;
    } else if (st.step === 2) {
      body = `<form class="type" id="tf"><input id="ans" lang="${LG.code}" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" placeholder="${LG.typeHint}" aria-label="Your answer"><button class="btn go" type="submit">Check</button></form><p class="note">${LG.typeNote}</p>`;
    } else body = `<p class="quick ${r.f ? 'ok' : 'bad'}">${r.f ? 'Right: ' : `You wrote “${esc(st.pickF)}”. Correct: `}${ans}.</p>`;
    s2 = one ? `<div class="step one" id="s2">${body}</div>` : `<div class="step ${fx === 'a' ? 'in' : ''}" id="s2"><h2><b>2</b> Choose the form${q.hint ? ` of <em>${q.hint}</em>` : ''}${q.tag && st.step === 3 ? `<span class="tag">${q.tag}</span>` : ''}</h2>${body}</div>`;
  }
  if (st.step === 3) {
    const R = EX.rules[q.rule], open = st.open;
    const nots = q.o1.map((o, k) => k === q.a1 ? '' : `<li><b>${optLabel(o)}</b>${o.label && opt(o).name !== o.label ? ` (${opt(o).name})` : ''}: ${opt(o).use}</li>`).join('');
    const table = q.labels ? `<table class="par casetbl" aria-label="All forms">${q.labels.map((l, k) => q.forms[k] === undefined ? '' : `<tr class="${k === q.a2 ? 'hit' : q.forms[k] === st.pickF && q.forms[k] !== ans ? 'miss' : ''}"><td>${l}</td><td>${q.forms[k]}</td></tr>`).join('')}</table>` : '';
    const ok = one ? r.f : (r.a && r.f);
    const shown = one || r.a ? ans : shortName(right1) + (r.f ? '' : ' · ' + ans);
    // one short, specific reason: the signal word, then the item's own note or the first sentence of its form note
    const first = t => (String(t || '').match(/^.*?[.!?](\s|$)/) || [String(t || '')])[0].trim();
    const need = /^Needed/.test(q.fnote || '') ? first(q.fnote).replace(/\s*\([^)]*\)/g, '') : '';
    const why = [q.cue ? `<mark>${q.cue}</mark> → ${shortName(right1)}.` : '', q.note ? first(q.note) : need || R[0] + '.'].filter(Boolean).join(' ');
    exp = `<div class="fb ${fx === 'f' ? 'in' : ''}" id="exp">
<p class="verdict ${ok ? 'ok' : 'bad'}">${ok ? '✓ Correct' : `✗ Answer: <b>${shown}</b>`}</p>${ok ? '' : `<p class="why">${why}</p>`}
<p class="links"><a href="${guideHref(q)}" target="_blank" rel="noopener">Rule: ${R[0]}</a><button id="more" type="button" data-act="more" aria-expanded="${open}" aria-controls="panel"><span>${open ? 'Hide details' : 'Details'}</span></button></p></div>
<div class="panel ${open ? 'open' : ''}" id="panel" ${open ? '' : 'inert'}><div><div class="exp">
<section><h3>The rule</h3><p class="rt">${R[0]}</p><p>${R[1]}</p><p class="idn">Example: ${R[2]}</p></section>
<section><h3>In this sentence</h3><p>${q.cue ? `Signal: <mark>${q.cue}</mark>. ` : ''}${q.en}${q.note ? ` ${q.note}` : ''}</p></section>
<section><h3>Why ${optLabel(right1)}</h3><p>${right1.label && opt(right1).name !== right1.label ? `${right1.label} is ${opt(right1).name.split(' · ').pop().toLowerCase()} (${opt(right1).name.split(' · ')[0].toLowerCase()})` : opt(right1).name}: ${opt(right1).use}</p><h3 style="margin-top:12px">Why not the others</h3><ul class="nots">${nots}</ul></section>
<section class="formgrid"><div><h3>The form</h3><p>${q.fnote || ''}</p></div>${table}</section></div></div></div>
<div class="dock"><span>${st.i + 1} / ${st.round.length}</span><button class="btn go" id="next" data-act="next">${st.i + 1 < st.round.length ? 'Next' : 'See results'}</button></div>`;
  }
  const L = (window.CEFR || []).find(l => l.code === q.lv);
  const up = st.topic === 'smart' && st.frontier && st.frontier.up && st.i === 0 && st.step === (one ? 2 : 1) ? `<p class="coachline">${st.frontier.base} is solid here, so this round adds ${st.frontier.up} sentences.</p>` : '';
  const enLine = st.step === 3 || st.en === 'always' || st.showEn ? `<p class="en">${q.en}</p>` : `<button class="entog" type="button" data-act="en">Show translation</button>`;
  return `${up}<div class="meta"><span>${st.step === 3 ? (EX.label ? EX.label(q) : (NAMES[q.t] || TOP[q.t])) + ' · ' + q.lv : ''}</span><span>${st.i + 1} / ${st.round.length}</span></div>
${st.mode === 'listen' && st.step < 3 && TTS ? `<div class="listen"><button class="btn go" data-act="say">${LG.listen}</button><button class="btn" data-act="slow">Slower</button><span class="note">Pick the form you hear. The sentence appears after you answer.</span></div>` : `<p class="ru" lang="${LG.code}">${mark(a)}<span class="gap ${gc}">${gap}</span>${mark(b)}</p>${enLine}${st.mode === 'listen' && TTS ? `<p><button class="btn" data-act="say">Listen again</button></p>` : ''}`}
${one ? '' : `<div class="step"><h2><b>1</b> ${q.s1 || EX.step1}</h2><div class="opts">${b1}</div>${quick}</div>`}${s2}${exp}`;
}

function endHTML() {
  if (EX.end) return EX.end(st.round.map(k => Q[k]), st.res);
  const n = st.round.length;
  const one = ONE(), right = st.res.filter(r => r.a && r.f).length;
  const tot = one ? right : st.res.reduce((s, r) => s + (r.a ? 1 : 0) + (r.f ? 1 : 0), 0), max = one ? n : n * 2;
  const ms = st.round.map((k, j) => ({ q: Q[k], r: st.res[j] })).filter(o => !(o.r.a && o.r.f));
  return `<p class="meta"><span>End of the line</span></p><p class="big">${tot}/${max}</p>
<p>${tot === max ? 'A perfect ride: every answer right.' : one ? `You got ${right} of ${n} right.` : `You got ${st.res.filter(r => r.a).length} of ${n} choices and ${st.res.filter(r => r.f).length} of ${n} forms right.`}</p>
${ms.length ? `<h3 style="font:700 17px 'PT Sans',sans-serif;margin:20px 0 0">Worth another look (saved to My mistakes)</h3><ul class="misses">${ms.map(o => `<li><span lang="${LG.code}">${o.q.ru.replace('___', '<b>' + full(o.q) + '</b>')}</span><br><span class="note">${o.q.en} Rule: ${EX.rules[o.q.rule][0]}.</span></li>`).join('')}</ul>` : ''}
${report()}
<div class="btns" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:16px"><button class="btn go" data-act="new" id="again">${st.topic === 'smart' ? 'Next recommended round' : 'New round'}</button>${nextButtons()}</div>`;
}
function report() {
  if (!COACH) return '';
  const keys = [...new Set(st.round.map(k => { const q = Q[k]; return (q.ex || EX.id) + ':' + (q.ot || q.t); }))];
  const nameOf = key => { const q = Q[st.round.find(k => ((Q[k].ex || EX.id) + ':' + (Q[k].ot || Q[k].t)) === key)]; return EX.label ? EX.label(q) : NAMES[q.t]; };
  const rows = keys.map(key => {
    const [id, t] = key.split(':'), a = COACH.state(id, t), b = st.before ? st.before[key] : null;
    const ch = b === null || b === undefined ? '' : a.pct > b ? ' up' : a.pct < b ? ' down' : '';
    return `<li><span>${nameOf(key)}</span><span class="mstate" data-st="${a.st}">${b === null || b === undefined ? '' : b + '% → '}<b class="${ch}">${a.pct}%</b> · ${COACH.LABEL[a.st]}</span></li>`;
  }).join('');
  const nx = EX.multi ? null : COACH.nextStep(EX.id, Q, NAMES, st.level);
  st.next = nx;
  return `<h3 class="rh">${LG.how}</h3><ul class="mlist">${rows}</ul>${nx ? `<p class="coachline">${nx.text}</p>` : ''}${EX.after ? EX.after() : ''}`;
}
function nextButtons() {
  const nx = st.next; if (!nx) return '';
  if (nx.kind === 'up') return `<button class="btn" data-act="up" data-k="${nx.level}">Move up to ${nx.level}</button>`;
  if (nx.topic && nx.topic !== st.topic) return `<button class="btn" data-act="topic" data-k="${nx.topic}">Practise ${NAMES[nx.topic].split(' · ')[0]}</button>`;
  return '';
}

function track(q, ok) {
  if (COACH) COACH.record(q.ex || EX.id, q.ot || q.t, ok, q.ru);
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
  if (ONE()) {
    const ok = norm(f) === norm(full(q)) || (GP(q) && st.mode === 'type' && norm(f) === norm(q.forms[q.a2]));
    st.p1 = q.a1; st.res[st.i] = { a: ok, f: ok };
  } else st.res[st.i].f = norm(f) === norm(q.forms[q.a2]);
  st.pickF = f; st.step = 3; st.fx = 'f';
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
  st.open = !st.open; LS.set('gr-details', st.open);
  const p = $('panel'), b = $('more'); if (!p || !b) return;
  p.classList.toggle('open', st.open); p.toggleAttribute('inert', !st.open);
  b.setAttribute('aria-expanded', st.open); b.querySelector('span').textContent = st.open ? 'Hide details' : 'Details';
  if (st.open) setTimeout(() => reveal(p), RM.matches ? 0 : 120);
}
const savePrefs = () => LS.set(EX.id + '-prefs', { topic: st.topic, mode: st.mode });
function setLevel(l) { st.level = l; LS.set(LG.levelKey, l); newRound(); }
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
  else if (a === 'en') { st.showEn = true; render(); }
  else if (a === 'say' || a === 'slow') { const q = cur(); if (q) say(spoken(q), a === 'slow'); }
  else if (a === 'level') setLevel(b.dataset.k);
  else if (a === 'up') { st.topic = 'smart'; savePrefs(); setLevel(b.dataset.k); }
});
$('card').addEventListener('submit', e => { e.preventDefault(); const v = $('ans').value; if (!v.trim()) return; pickF(v); });
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.metaKey || e.ctrlKey || e.altKey || !st.round.length) return;
  const d = parseInt(e.key, 10);
  if (d >= 1 && d <= 9 && st.i < st.round.length) {
    if (st.step === 1 && st.o1[d - 1] !== undefined) pickA(st.o1[d - 1]);
    else if (st.step === 2 && st.mode !== 'type' && st.fo[d - 1]) pickF(st.fo[d - 1]);
  }
});
$('topics').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setTopic(b.dataset.t); });
$('lvls').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setLevel(b.dataset.l); });
if ($('steps')) $('steps').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; st.steps = b.dataset.s; LS.set('gr-steps', st.steps); newRound(); });
$('modes').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; st.mode = b.dataset.m; savePrefs(); render(); });
if ($('ens')) $('ens').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; st.en = b.dataset.e; LS.set('gr-en', st.en); render(); });
$('sizes').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; st.size = +b.dataset.n; LS.set('gr-size', st.size); newRound(); });

const prefs = LS.get(EX.id + '-prefs', {});
const size = LS.get('gr-size', 10);
const lvPref = LS.get(LG.levelKey, 'all');
const hashT = decodeURIComponent((location.hash || '').slice(1));
st = { level: lvPref === 'all' || LEVELS.some(l => l.code === lvPref) ? lvPref : 'all', topic: EX.lockTopic ? 'smart' : TOP[hashT] ? hashT : TOP[prefs.topic] ? prefs.topic : 'smart', mode: ['type', 'listen'].includes(prefs.mode) ? prefs.mode : 'pick', size: SIZES.includes(size) ? size : 10, round: [], i: 0, res: [], step: 1, o1: [], fo: [], p1: null, pickF: null, open: LS.get('gr-details', false) === true, en: LS.get('gr-en', 'after') === 'always' ? 'always' : 'after', showEn: false, steps: LS.get('gr-steps', 'one') === 'two' ? 'two' : 'one' };
newRound();
try { if ('serviceWorker' in navigator && window.top === window && location.protocol === 'https:') addEventListener('load', () => navigator.serviceWorker.register(LG.root + 'sw.js', { scope: LG.root }).catch(() => {})); } catch (e) {}
window.__gr = { answer: () => full(cur()) };   // used by the automated tests
}
