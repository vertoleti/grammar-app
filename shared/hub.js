/* Home page for one language: five tabs (Today, Grammar, Words, Reading, Progress).
   Today opens with "Continue where you left off", then today's goal and up to three next steps.
   Config: window.HUB (keys and names for this language). Data: CATALOG, GRCoach, TEXTS. */
(function () {
  const H = window.HUB, $ = id => document.getElementById(id);
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const C = window.GRCoach, CAT = window.CATALOG, ORDER = C.ORDER, TEXTS = window.TEXTS || [];
  const GRAM = CAT.filter(x => x.topics), VOC = CAT.find(x => x.vocab), PRAC = CAT.filter(x => x.practice);
  const by = p => CAT.find(x => x.practice === p);
  const READ = by('reading'), PB = by('phrases'), EXAM = by('exam'), GENUS = by('genus'), CLOZE = by('cloze'), WRITE = by('writing');
  const SKILLS = PRAC.filter(x => x.practice === 'sentences' || x.practice === 'tables');
  const short = n => String(n).split(' · ')[0];
  const ago = t => { const s = Math.round((Date.now() - t) / 1000); return s < 90 ? 'just now' : s < 3600 ? Math.round(s / 60) + ' min ago' : s < 86400 ? Math.round(s / 3600) + ' h ago' : s < 172800 ? 'yesterday' : Math.round(s / 86400) + ' days ago'; };
  const lvName = c => { const l = (window.CEFR || []).find(x => x.code === c); return l ? l.en : ''; };
  const level = () => LS.get(H.levelKey, 'all');

  // ---------- data ----------
  function vocab() {
    const s = LS.get(H.vp + 'srs', {}), now = Date.now(), end = new Date(); end.setHours(23, 59, 59, 999);
    let due = 0; const learned = new Set(), started = new Set();
    Object.entries(s).forEach(([k, v]) => { const id = k.split('|')[0]; started.add(id); if (v.q === 'review') learned.add(id); if ((v.q === 'review' && v.due <= end.getTime()) || (v.q !== 'review' && v.due <= now + 20 * 60000)) due++; });
    return { due, learned: learned.size, started: started.size };
  }
  const readDone = () => LS.get(H.read + 'read-done', {});
  function nextText() {
    const lv = level(), d = readDone(), want = lv === 'all' ? null : lv;
    const pool = TEXTS.filter(t => d[t.id] === undefined);
    return pool.find(t => t.lv === want) || pool.find(t => !want || ORDER.indexOf(t.lv) >= ORDER.indexOf(want)) || pool[0] || null;
  }
  function lineState(L) {
    const s = C.stats(L.id), st = L.topics.map(t => C.state(L.id, t.k, s));
    return { st, mastered: st.filter(x => x.st === 'mastered').length, started: st.filter(x => x.n).length };
  }
  function weekAnswers() {
    const log = LS.get('gr-log', {}); let n = 0; const d = new Date();
    for (let i = 0; i < 7; i++) { const k = C.dkey(d), x = log[k]; if (x) n += (x.a || 0) + (x.c || 0); d.setDate(d.getDate() - 1); }
    return n;
  }

  // ---------- "continue" and suggestions ----------
  const EXTRA = { mix: { ru: H.mix, en: 'Daily mix', c: '#1b1b1f', n: '★' }, dictionary: { ru: H.dict, en: 'Dictionary', c: '#7b5ea7', n: 'Aa' } };
  function lastPlace() {
    const l = LS.get(H.last, null); if (!l || Date.now() - l.at > 60 * 86400000) return null;
    const e = CAT.find(x => x.href === l.p + '/'), x = e || EXTRA[l.p]; if (!x) return null;
    let note = '';
    if (e && e.topics) { const s = lineState(e); note = `${s.mastered} of ${e.topics.length} topics mastered`; }
    else if (e && e.vocab) { const v = vocab(); note = v.due ? `${v.due} card${v.due > 1 ? 's' : ''} due` : `${v.learned} words learned`; }
    else if (e && e.practice === 'reading') { note = `${Object.keys(readDone()).length} of ${TEXTS.length} texts done`; }
    return { c: x.c, n: x.n, title: x.ru, en: x.en, detail: l.d, href: l.p + '/' + (l.h ? '#' + l.h : ''), at: l.at, note };
  }
  function suggestions(est) {
    const out = [], lvl = level(), target = lvl !== 'all' ? lvl : (est.working || 'A1'), v = vocab();
    if (!LS.get(H.placedKey, null) && est.answers < 40) out.push({ c: '#1b1b1f', n: '?', title: 'Find your level', why: 'Placement test: 16 questions, skips what you already know', href: 'placement/' });
    const dueN = GRAM.reduce((a, L) => a + C.dueReviews(L.id).length, 0);
    out.push({ c: '#1b1b1f', n: '★', title: 'Daily mix', why: (dueN ? `${dueN} mistake${dueN > 1 ? 's' : ''} to review, then` : 'About 10 minutes:') + ' your weakest grammar', href: 'mix/' });
    if (v.due) out.push({ c: VOC.c, n: VOC.n, title: `${v.due} flashcard${v.due > 1 ? 's' : ''} due`, why: 'Review them today, while they’re fresh', href: VOC.href });
    const all = []; GRAM.forEach(L => { const s = C.stats(L.id); L.topics.forEach(t => all.push(Object.assign({ L, t }, C.state(L.id, t.k, s)))); });
    const weak = all.filter(x => x.st === 'weak').sort((a, b) => a.pct - b.pct)[0];
    if (weak) out.push({ c: weak.L.c, n: weak.L.n, title: `Strengthen ${short(weak.t.name)}`, why: `${weak.pct}% right lately · ${weak.L.en}`, href: `${weak.L.href}#${weak.t.k}`, level: weak.t.lv });
    const atT = all.filter(x => x.t.lv === target && x.t.count);
    const fresh = atT.find(x => x.st === 'new');
    const nextLv = ORDER[ORDER.indexOf(target) + 1];
    if (atT.length && atT.every(x => C.solid(x.st)) && nextLv && all.some(x => x.t.lv === nextLv)) out.push({ c: '#1b1b1f', n: nextLv, title: `Move up to ${nextLv}`, why: `All ${target} grammar is solid`, href: '#', setLevel: nextLv });
    else if (fresh) out.push({ c: fresh.L.c, n: fresh.L.n, title: `New: ${short(fresh.t.name)}`, why: `${target} · ${fresh.L.en}`, href: `${fresh.L.href}#${fresh.t.k}`, level: target });
    const nt = nextText(); if (nt && READ) out.push({ c: READ.c, n: READ.n, title: `Read: ${nt.title}`, why: `${nt.lv} · ${nt.en}`, href: `${READ.href}#t=${nt.id}`, lang: H.code });
    if (!v.started) out.push({ c: VOC.c, n: VOC.n, title: 'Start the flashcards', why: `${VOC.total} words, spaced repetition`, href: VOC.href });
    return out;
  }
  const sugItem = x => `<li><a class="nx" href="${x.href}" style="--c:${x.c}" ${x.level ? `data-level="${x.level}"` : ''} ${x.setLevel ? `data-set="${x.setLevel}"` : ''}><span class="nd">${esc(x.n)}</span><span class="nt"><b ${x.lang ? `lang="${x.lang}"` : ''}>${esc(x.title)}</b><small>${esc(x.why)}</small></span><span class="chev" aria-hidden="true"></span></a></li>`;

  // ---------- cards ----------
  function lineCard(L) {
    const s = lineState(L), lvs = ORDER.filter(c => L.topics.some(t => t.lv === c));
    return `<a class="lc" href="${L.href}" style="--c:${L.c}"><span class="nd">${L.n}</span><span class="lt"><b lang="${H.code}">${esc(L.ru)}</b><small>${esc(L.en)} · ${lvs[0]}${lvs.length > 1 ? '–' + lvs[lvs.length - 1] : ''}</small></span>
<span class="bar" aria-hidden="true">${s.st.map(x => `<i class="${x.st === 'new' ? '' : x.st}"></i>`).join('')}</span><span class="lf">${s.started ? `${s.mastered} of ${L.topics.length} topics mastered` : `${L.topics.length} topics`}</span></a>`;
  }
  function pracCard(L, sub) {
    const s = C.stats(L.id), ms = (L.modes || []).map(m => C.state(L.id, m.k, s)), n = ms.reduce((a, x) => a + x.n, 0);
    return `<a class="lc" href="${L.href}" style="--c:${L.c}"><span class="nd">${L.n}</span><span class="lt"><b lang="${H.code}">${esc(L.ru)}</b><small>${esc(L.en)}${L.total ? ` · ${L.total} ${L.unit}` : ''}</small></span><span class="lf">${sub || (n ? `${n} answers so far` : esc(L.d || ''))}</span></a>`;
  }
  function simpleCard(href, c, n, title, en, sub) {
    return `<a class="lc" href="${href}" style="--c:${c}"><span class="nd">${n}</span><span class="lt"><b lang="${H.code}">${esc(title)}</b><small>${esc(en)}</small></span><span class="lf">${sub}</span></a>`;
  }

  // ---------- tabs ----------
  const TABS = ['today', 'grammar', 'words', 'reading', 'progress'];
  function show(t, scroll) {
    if (!TABS.includes(t)) t = 'today';
    TABS.forEach(k => { $('t-' + k).hidden = k !== t; const b = document.querySelector(`.tabs [data-tab="${k}"]`); if (b) b.setAttribute('aria-current', k === t ? 'page' : 'false'); });
    if (scroll) window.scrollTo(0, 0);
  }
  addEventListener('hashchange', () => show(location.hash.slice(1), true));

  // ---------- draw ----------
  function draw() {
    const est = C.estimate(GRAM); C.logLevel(est); C.snapshot(GRAM.concat(PRAC));
    const pf = C.profile(), td = C.today(), sk = C.streak(), v = vocab(), fr = Math.min(1, td.done / td.goal), R = 15, LN = 2 * Math.PI * R;
    $('me').innerHTML = `<svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="${R}" fill="none" stroke="var(--line)" stroke-width="3"/><circle cx="18" cy="18" r="${R}" fill="none" stroke="var(--ok)" stroke-width="3" stroke-linecap="round" stroke-dasharray="${LN}" stroke-dashoffset="${LN * (1 - fr)}" transform="rotate(-90 18 18)"/><text x="18" y="22.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">${esc((pf.name || H.me).slice(0, 1).toUpperCase())}</text></svg>`;
    $('me').title = `Profile · today ${td.done} of ${td.goal}`;

    // Today
    const last = lastPlace(), sg = suggestions(est);
    let hero;
    if (last) hero = `<a class="hero" href="${last.href}" style="--c:${last.c}"><span class="eyebrow">Continue where you left off · ${ago(last.at)}</span><span class="hrow"><span class="nd big">${esc(last.n)}</span><span class="ht"><b lang="${H.code}">${esc(last.title)}</b><small>${esc(last.en)}${last.detail ? ` · <span lang="${H.code}">${esc(last.detail)}</span>` : ''}</small></span></span>${last.note ? `<span class="hnote">${esc(last.note)}</span>` : ''}<span class="hbtn">Continue</span></a>`;
    else { const f = sg.shift(); hero = `<a class="hero" href="${f.href}" style="--c:${f.c}"><span class="eyebrow">${est.answers ? 'Suggested next' : 'Start here'}</span><span class="hrow"><span class="nd big">${esc(f.n)}</span><span class="ht"><b>${esc(f.title)}</b><small>${esc(f.why)}</small></span></span><span class="hbtn">Start</span></a>`; }
    $('hero').innerHTML = hero;
    const lastHref = last && last.href.split('#')[0];
    const rest = sg.filter(x => !lastHref || x.href.split('#')[0] !== lastHref).slice(0, 3);
    $('goal').innerHTML = `<div class="gtxt"><b>${td.met ? 'Daily goal reached' : `${td.done} of ${td.goal}`}</b><span>${td.met ? `${td.done} answers today` : 'answers today'}</span></div><div class="gbar"><i style="width:${Math.round(fr * 100)}%"></i></div><div class="gstreak"><b>${sk.now}</b><span>day streak</span></div>`;
    $('sugs').innerHTML = rest.map(sugItem).join('');

    // Grammar
    const lvl = level();
    $('lvrow').innerHTML = `<button data-l="all" aria-pressed="${lvl === 'all'}">All</button>` + (window.CEFR || []).map(l => `<button data-l="${l.code}" aria-pressed="${lvl === l.code}">${l.code}</button>`).join('');
    const order = H.groups.map(g => g[0]);
    $('gram').innerHTML = H.groups.map(([k, name]) => { const ls = GRAM.filter(L => L.group === k); return ls.length ? `<h3 class="sh">${esc(name)}</h3><div class="cards">${ls.map(lineCard).join('')}</div>` : ''; }).join('') +
      (GRAM.some(L => !order.includes(L.group)) ? `<div class="cards">${GRAM.filter(L => !order.includes(L.group)).map(lineCard).join('')}</div>` : '');
    $('skills').innerHTML = SKILLS.map(L => pracCard(L)).join('');

    // Words
    const dictN = LS.get(H.vp + 'custom', []).length;
    $('words').innerHTML = `<a class="lc wide" href="${VOC.href}" style="--c:${VOC.c}"><span class="nd">${VOC.n}</span><span class="lt"><b lang="${H.code}">${esc(VOC.ru)}</b><small>Flashcards · spaced repetition</small></span>
<span class="bar" aria-hidden="true"><i class="mastered" style="flex:${v.learned}"></i><i class="started" style="flex:${Math.max(0, v.started - v.learned)}"></i><i style="flex:${Math.max(1, VOC.total - v.started)}"></i></span><span class="lf">${v.due ? `<b class="due">${v.due} due today</b> · ` : ''}${v.learned} learned · ${v.started} started · ${VOC.total} in the decks</span></a>` +
      simpleCard('dictionary/', '#7b5ea7', 'Aa', H.dict, 'Dictionary · every word, searchable', `${VOC.total + dictN} words${dictN ? ` · ${dictN} of your own` : ''}`) +
      (CLOZE ? pracCard(CLOZE, `${CLOZE.total} sentences · learning words first`) : '') +
      (GENUS ? pracCard(GENUS, `${GENUS.total} nouns · ending rules`) : '');

    // Reading
    const nt = nextText(), d = readDone(), my = LS.get(H.read + 'texts', []).length;
    $('rnext').innerHTML = nt ? `<a class="hero slim" href="${READ.href}#t=${nt.id}" style="--c:${READ.c}"><span class="eyebrow">Next text for you · ${nt.lv}</span><span class="ht"><b lang="${H.code}">${esc(nt.title)}</b><small>${esc(nt.en)} · questions, audio, tap words to save them</small></span><span class="hbtn">Read</span></a>` : '';
    $('reading').innerHTML = pracCard(READ, `${Object.keys(d).filter(k => TEXTS.some(t => t.id === k)).length} of ${TEXTS.length} texts done${my ? ` · ${my} of your own` : ''} · import your own`) + (WRITE ? pracCard(WRITE, `${Object.values(LS.get(H.read + 'writing', {})).filter(x => x.done).length} of ${WRITE.total} tasks done · model answers`) : '') + (PB ? pracCard(PB, `${PB.total} situations · phrases, dialogues, speaking`) : '');

    // Progress
    const rI = est.reached ? ORDER.indexOf(est.reached) : -1, wI = est.working ? ORDER.indexOf(est.working) : -1, wp = est.working && est.per[est.working];
    $('lvl').innerHTML = `<div class="lvtop"><div><span class="eyebrow">Grammar level</span><p class="lvbig">${est.reached || '—'}</p><small>${est.reached ? lvName(est.reached) : 'Answer a few rounds to get an estimate'}</small></div>
<div class="ladder2">${ORDER.map((c, i) => `<span class="${i <= rI ? 'done' : i === wI ? 'now' : ''}">${c}</span>`).join('')}</div></div>
${wp ? `<p class="note">Working on <b>${est.working}</b>: ${wp.solid} of ${wp.total} topics solid. A level counts as reached at 70%.</p>` : ''}`;
    $('nums').innerHTML = [[sk.now, 'day streak', `best ${sk.best}`], [weekAnswers(), 'answers', 'last 7 days'], [v.learned, 'words learned', `${v.started} started`], [Object.keys(d).length, 'texts read', `${READ ? TEXTS.length : 0} available`]]
      .map(([n, a, b]) => `<div><b>${n}</b><span>${a}</span><small>${b}</small></div>`).join('');
    const exams = LS.get(H.exams, []);
    $('plinks').innerHTML = [
      ['review/', 'Weekly review', 'This week against last, and a plan'],
      [H.profile, 'Charts and daily goal', 'Answers per day, level over time'],
      [EXAM ? EXAM.href : 'exam/', `Mock exam · ${H.examName}`, exams[0] ? `Last: ${exams[0].level} · ${exams[0].pct}% ${exams[0].pass ? 'passed' : ''}` : 'Timed, A1 to C1'],
      ['placement/', 'Placement test', LS.get(H.placedKey, null) ? 'Retake it to update your level' : 'Find your level in 16 questions']
    ].map(([h, t, s]) => `<li><a class="nx" href="${h}"><span class="nt"><b>${t}</b><small>${s}</small></span><span class="chev" aria-hidden="true"></span></a></li>`).join('');
    $('map').innerHTML = ORDER.filter(c => GRAM.some(L => L.topics.some(t => t.lv === c))).map(c => `<div class="mrow"><b>${c}</b><div class="chips">${GRAM.flatMap(L => { const s = C.stats(L.id); return L.topics.filter(t => t.lv === c).map(t => { const m = C.state(L.id, t.k, s); return `<a class="chip ${m.st === 'new' ? '' : m.st}" href="${L.href}#${t.k}" data-level="${c}">${esc(short(t.name))}</a>`; }); }).join('')}</div></div>`).join('');
  }

  // ---------- events ----------
  document.addEventListener('click', e => {
    const a = e.target.closest('a[data-level],a[data-set]'); if (!a) return;
    if (a.dataset.set) { LS.set(H.levelKey, a.dataset.set); if (a.getAttribute('href') === '#') { e.preventDefault(); draw(); } }
    else LS.set(H.levelKey, a.dataset.level);
  });
  $('lvrow').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; LS.set(H.levelKey, b.dataset.l); const v = LS.get(H.vp + 'settings', {}); v.levels = b.dataset.l === 'all' ? (window.CEFR || []).map(l => l.code) : [b.dataset.l]; LS.set(H.vp + 'settings', v); draw(); });
  document.querySelectorAll('.langs a').forEach(a => a.addEventListener('click', () => LS.set('gr-lang', a.dataset.lang)));
  window.GR_NO_TOAST = true;
  addEventListener('gr-progress-merged', draw);
  addEventListener('pageshow', e => { if (e.persisted) draw(); });

  // settings: appearance, backup, sync, install
  const box = document.querySelector('.themepick');
  if (box) { const cur = () => document.documentElement.dataset.theme || 'auto'; const mark = () => box.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.th === cur())); mark(); box.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; window.GRSetTheme(b.dataset.th); mark(); }); }
  const P = window.GRProgress;
  if (P && P.available) {
    P.on(s => { $('sstate').textContent = s.error ? `sync problem: ${s.error}` : s.busy ? 'syncing…' : s.synced ? 'saved and synced' : 'saved on this device'; $('sync-off').hidden = s.synced; $('sync-on').hidden = !s.synced; });
    $('bexp').onclick = () => { P.exportFile(); $('bmsg').textContent = 'Backup downloaded.'; };
    $('bimp').onchange = async () => { const f = $('bimp').files[0]; if (!f) return; try { const ch = await P.importFile(f); $('bmsg').textContent = ch ? 'Progress restored.' : 'This device already had everything in that file.'; draw(); } catch (e) { $('bmsg').textContent = e.message || 'That file couldn’t be read.'; } $('bimp').value = ''; };
    $('bcon').onclick = async () => { const t = $('tok').value.trim(); if (!t) return; $('smsg').textContent = 'Connecting…'; try { await P.connect(t); $('tok').value = ''; $('smsg').textContent = 'Connected.'; draw(); } catch (e) { $('smsg').textContent = e.message; } };
    $('bsync').onclick = async () => { await P.sync(); draw(); };
    $('bdis').onclick = () => { P.disconnect(); $('smsg').textContent = 'This device no longer syncs through GitHub.'; };
  } else $('sstate').textContent = 'this browser is blocking saved data';
  let deferred = null; const ib = $('install');
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; ib.hidden = false; });
  ib.addEventListener('click', async () => { if (!deferred) return; deferred.prompt(); try { await deferred.userChoice; } catch (e) {} deferred = null; ib.hidden = true; });
  try { if ('serviceWorker' in navigator && location.protocol === 'https:') addEventListener('load', () => navigator.serviceWorker.register(H.sw, H.code === 'de' ? { scope: '../' } : undefined).catch(() => {})); } catch (e) {}

  draw();
  show(location.hash === '#settings' ? 'progress' : location.hash.slice(1));
  if (location.hash === '#settings' || location.hash === '#progress-settings') { const f = $('fold-data'); if (f) f.open = true; }
})();
