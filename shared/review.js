/* Weekly review: what you practised, what changed since last week, what is due, and a plan. */
(function () {
  const C = window.GRCoach, CAT = window.CATALOG || [], LG = window.GR_L || { code: 'ru', levelKey: 'gr-level', vocPrefix: 'voc-' };
  const $ = id => document.getElementById(id);
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } } };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const GRAM = CAT.filter(L => L.topics), PRAC = CAT.filter(L => L.practice), VOC = CAT.find(L => L.vocab);
  const short = n => String(n).split(' · ')[0];
  const en = n => String(n).split(' · ').pop();
  const href = (L, k) => '../' + L.href + (k ? '#' + k : '');

  // ---------- activity ----------
  const log = LS.get('gr-log', {}), goal = C.profile().goal;
  const monday = (off) => { const d = new Date(); d.setHours(0, 0, 0, 0); const wd = (d.getDay() + 6) % 7; d.setDate(d.getDate() - wd + off * 7); return d; };
  const days = start => [...Array(7)].map((_, i) => { const d = new Date(start); d.setDate(d.getDate() + i); return d; });
  const sum = ds => ds.reduce((a, d) => { const e = log[C.dkey(d)] || {}; a.a += e.a || 0; a.ok += e.ok || 0; a.c += e.c || 0; if ((e.a || 0) + (e.c || 0) > 0) a.days++; return a; }, { a: 0, ok: 0, c: 0, days: 0 });
  const thisW = days(monday(0)), lastW = days(monday(-1));
  const T = sum(thisW), P = sum(lastW), today = new Date(); today.setHours(0, 0, 0, 0);
  const elapsed = Math.max(1, thisW.filter(d => d <= today).length);
  const avg = Math.round((T.a + T.c) / elapsed), acc = T.a ? Math.round(T.ok / T.a * 100) : null, accP = P.a ? Math.round(P.ok / P.a * 100) : null;
  const delta = (a, b, unit = '') => b === null || b === undefined ? '' : a > b ? `<span class="up">▲ ${a - b}${unit}</span>` : a < b ? `<span class="down">▼ ${b - a}${unit}</span>` : '<span class="same">same</span>';
  const max = Math.max(goal, ...thisW.map(d => { const e = log[C.dkey(d)] || {}; return (e.a || 0) + (e.c || 0); }));
  const WD = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const bars = thisW.map((d, i) => { const e = log[C.dkey(d)] || {}, n = (e.a || 0) + (e.c || 0); return `<div class="bar${d > today ? ' future' : ''}${+d === +today ? ' now' : ''}"><i style="height:${Math.round(n / max * 100)}%"></i><span>${WD[i]}</span><b>${n || ''}</b></div>`; }).join('');
  const sk = C.streak();
  $('week').innerHTML = `<div class="nums4">
<div><b>${T.a + T.c}</b><span>answers and cards ${delta(T.a + T.c, P.a + P.c)}</span></div>
<div><b>${acc === null ? '—' : acc + '%'}</b><span>grammar answers right ${acc === null ? '' : delta(acc, accP, ' pts')}</span></div>
<div><b>${T.days}/7</b><span>days practised ${delta(T.days, P.days)}</span></div>
<div><b>${sk.now}</b><span>day streak · best ${sk.best}</span></div></div>
<div class="bars" aria-label="Answers per day this week">${bars}<em style="bottom:calc(22px + ${Math.round(goal / max * 100)} * 1.28px)">goal ${goal}</em></div>
<p class="note">Both languages count toward your daily goal. Last week: ${P.a + P.c} answers and cards on ${P.days} days.</p>`;

  // ---------- what changed ----------
  const snaps = C.snapshot(GRAM.concat(PRAC)), wks = Object.keys(snaps).sort(), wk = C.weekKey(), prevK = wks.filter(k => k < wk).pop();
  const name = key => { const [id, k] = [key.slice(0, key.lastIndexOf(':')), key.slice(key.lastIndexOf(':') + 1)]; const L = CAT.find(x => x.id === id); if (!L) return null; const t = (L.topics || L.modes || []).find(x => x.k === k); return t ? { L, t, label: `${en(t.name)}`, line: short(L.ru) } : null; };
  let changed = '';
  if (!prevK) changed = '<p class="note">The comparison starts next week: this week’s scores are saved now, so next week you’ll see which topics improved.</p>';
  else {
    const cur = snaps[wk] || {}, prev = snaps[prevK] || {}, ups = [], downs = [], mast = [];
    Object.entries(cur).forEach(([k, v]) => { const o = prev[k]; if (v.p === null) return; if (v.st === 'mastered' && (!o || o.st !== 'mastered')) mast.push(k); if (o && o.p !== null) { if (v.p - o.p >= 10) ups.push([k, v.p - o.p, v.p]); if (o.p - v.p >= 10) downs.push([k, o.p - v.p, v.p]); } else if (!o) ups.push([k, null, v.p]); });
    const li = ([k, d, p], cls) => { const n = name(k); return n ? `<li><a href="${href(n.L, n.t.k)}"><b>${esc(n.label)}</b><span>${esc(n.line)}</span></a><span class="${cls}">${d === null ? 'new · ' + p + '%' : (cls === 'up' ? '▲ ' : '▼ ') + d + ' → ' + p + '%'}</span></li>` : ''; };
    ups.sort((a, b) => (b[1] || 0) - (a[1] || 0)); downs.sort((a, b) => b[1] - a[1]);
    changed = (mast.length ? `<h3>Newly mastered</h3><ul class="tl">${mast.map(k => li([k, 0, cur[k].p], 'up').replace('▲ 0 → ', '')).join('')}</ul>` : '') +
      (ups.length ? `<h3>Improved</h3><ul class="tl">${ups.slice(0, 6).map(x => li(x, 'up')).join('')}</ul>` : '') +
      (downs.length ? `<h3>Slipped</h3><ul class="tl">${downs.slice(0, 4).map(x => li(x, 'down')).join('')}</ul>` : '') ||
      '<p class="note">No big changes since last week. Practise a few rounds and they’ll show here.</p>';
  }
  $('changed').innerHTML = changed;

  // ---------- due now ----------
  const srs = LS.get(LG.vocPrefix + 'srs', {}), end = new Date(); end.setHours(23, 59, 59, 999);
  const cardsDue = Object.values(srs).filter(v => v.due <= end.getTime()).length;
  const mistakes = GRAM.concat(PRAC).reduce((a, L) => a + C.dueReviews(L.id).length, 0);
  $('due').innerHTML = `<ul class="tl">
<li><a href="../${VOC ? VOC.href : 'vocabulary/'}"><b>${cardsDue} flashcard${cardsDue === 1 ? '' : 's'} due today</b><span>spaced repetition works best on time</span></a></li>
<li><a href="../mix/"><b>${mistakes} grammar mistake${mistakes === 1 ? '' : 's'} due</b><span>they come back in the daily mix after 1, 3, 7 and 21 days</span></a></li></ul>`;

  // ---------- plan ----------
  const est = C.estimate(GRAM), lvl = LS.get(LG.levelKey, 'all'), target = lvl !== 'all' ? lvl : (est.working || 'A1');
  const all = []; GRAM.forEach(L => { const s = C.stats(L.id); L.topics.forEach(t => all.push(Object.assign({ L, t }, C.state(L.id, t.k, s)))); });
  const weak = all.filter(x => x.n >= 4 && x.pct !== null && x.pct < 65).sort((a, b) => a.pct - b.pct).slice(0, 3);
  const fresh = all.filter(x => x.t.lv === target && x.st === 'new' && x.t.count).slice(0, 2);
  const plan = [];
  plan.push(`<li><a href="../mix/"><b>Every day: the daily mix</b><span>about 10 minutes: due mistakes first, then your weakest topics</span></a></li>`);
  if (VOC) plan.push(`<li><a href="../${VOC.href}"><b>Every day: flashcards</b><span>clear what’s due, then up to your new-card limit</span></a></li>`);
  weak.forEach(x => plan.push(`<li><a href="${href(x.L, x.t.k)}"><b>Focus: ${esc(en(x.t.name))}</b><span>${x.pct}% right lately · ${esc(short(x.L.ru))} · read the rule in the guide first</span></a></li>`));
  fresh.forEach(x => plan.push(`<li><a href="${href(x.L, x.t.k)}"><b>New at ${target}: ${esc(en(x.t.name))}</b><span>${esc(short(x.L.ru))}</span></a></li>`));
  if (!LS.get(LG.placedKey || 'gr-placed', null) && est.answers < 40) plan.push(`<li><a href="../placement/"><b>Take the placement test</b><span>16 questions; it skips the topics you already know</span></a></li>`);
  if (T.days >= 2 && avg < goal * 0.7) plan.push(`<li><a href="${LG.root || '../'}profile/"><b>Make the goal fit your week</b><span>you averaged ${avg} a day against a goal of ${goal}. A smaller goal you hit every day beats a big one you miss</span></a></li>`);
  else if (T.days >= 4 && avg > goal * 1.4) plan.push(`<li><a href="${LG.root || '../'}profile/"><b>Raise your daily goal</b><span>you averaged ${avg} a day, well above your goal of ${goal}</span></a></li>`);
  $('plan').innerHTML = `<ol class="tl plan">${plan.join('')}</ol>`;
})();
