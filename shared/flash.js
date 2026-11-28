/* Flashcards: an Anki-style app for one language.
   Views (hash): #decks (home), #study[=LEVEL|mine], #browse, #card=ID, #stats, #settings.
   Scheduling follows Anki's defaults: learning steps 1 and 10 minutes, graduating interval 1 day, easy 4 days,
   starting ease 250 %, lapses relearn in 10 minutes. Progress keys are the same as before (prefix + srs, settings, day, custom).
   Config: window.VOC_CFG { decks, prefix, lang, tts, name, themes, forms }. */
(function () {
  const VC = window.VOC_CFG, L = VC.lang, DE = L === 'de', K = n => VC.prefix + n;
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const strip = s => String(s || '').replace(/<[^>]+>/g, '');
  const bare = s => String(s || '').normalize('NFD').replace(/́/g, '').normalize('NFC');
  const fold = s => bare(strip(s)).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ё/g, 'е').replace(/ß/g, 'ss');
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const MIN = 60000, DAY = 86400000, LEARN = [1, 10], RELEARN = [10];
  const LEVELS = window.CEFR || [], LV = LEVELS.map(l => l.code);
  const THEMES = VC.themes || {};
  const TL = (DE ? 'DE' : 'RU');
  const dk = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const C = window.GRCoach;

  let cards = [], byId = {}, forms = null;
  let srs = LS.get(K('srs'), {});
  let cfg = Object.assign({ levels: LV.slice(), theme: 'all', dir: 'both', perDay: 20, auto: false }, LS.get(K('settings'), {}));
  const saveCfg = () => LS.set(K('settings'), cfg);
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
  const endOfDay = () => { const d = new Date(); d.setHours(23, 59, 59, 999); return d.getTime(); };
  function dayInfo() { const d = LS.get(K('day'), {}); return d.d === today() ? d : { d: today(), n: 0, extra: 0 }; }

  // ---------- decks ----------
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
  function parseTSV(text, fallbackLevel, src) {
    let cols = null; const out = [];
    text.replace(/\r/g, '').split('\n').forEach(l => {
      if (!l.trim()) return;
      if (l.startsWith('#')) { if (l.startsWith('#columns:')) cols = l.slice(9).split('\t').map(s => s.trim()); return; }
      const f = l.split('\t'); let c;
      if (cols) { c = {}; cols.forEach((n, i) => { c[n] = (f[i] || '').trim(); }); }
      else { if (f.length < 2) return; c = { term: f[0].trim(), meaning_en: f[1].trim(), tags: (f[2] || '').trim() }; }
      if (!c.term || !c.meaning_en) return;
      const tags = (c.tags || '').split(/\s+/).filter(Boolean);
      const tagLevel = tags.map(t => t.toUpperCase()).find(t => LV.includes(t));
      const level = LV.includes((c.cefr || '').toUpperCase()) ? c.cefr.toUpperCase() : tagLevel || fallbackLevel;
      const theme = src === 'import' ? 'imported' : (tags.find(t => THEMES[t]) || 'general');
      out.push({ id: c.id || 'imp-' + hash(c.term + '|' + c.meaning_en), term: c.term, kind: c.kind || 'word', cat: c.category || '', gender: c.gender || '', forms: c.forms || '', grammar: c.grammar || '',
        meaning: strip(c.meaning_en), ex: c.example_target || '', exEn: c.example_en || '', mistake: c.common_mistake || '', notes: c.notes || '', ipa: c.ipa || '', level, theme, src, raw: cols ? c : null });
    });
    return out;
  }
  function setCards(list) { cards = []; byId = {}; list.forEach(c => { if (!byId[c.id]) { byId[c.id] = c; cards.push(c); } }); }
  const custom = () => LS.get(K('custom'), []);
  const isMine = c => c.src === 'import' || /^(de-)?my-/.test(c.id);

  // ---------- scheduling ----------
  function next(state, rating, now) {
    const s = state ? Object.assign({}, state) : { q: 'learn', s: 0, ease: 2.5, ivl: 0, lap: 0, reps: 0 };
    if (s.q === 'learn' || s.q === 'relearn') {
      const steps = s.q === 'learn' ? LEARN : RELEARN;
      if (rating === 1) { s.s = 0; s.due = now + steps[0] * MIN; }
      else if (rating === 2) { s.due = now + (s.s === 0 && steps[1] ? (steps[0] + steps[1]) / 2 : steps[s.s] * 1.5) * MIN; }
      else if (rating === 3 && s.s + 1 < steps.length) { s.s++; s.due = now + steps[s.s] * MIN; }
      else { const wasLearn = s.q === 'learn'; s.ivl = rating === 4 ? (wasLearn ? 4 : Math.max(1, s.ivl) + 1) : (wasLearn ? 1 : Math.max(1, s.ivl)); s.q = 'review'; s.s = 0; s.due = now + s.ivl * DAY; }
    } else {
      if (rating === 1) { s.lap++; s.ease = Math.max(1.3, s.ease - 0.2); s.ivl = 1; s.q = 'relearn'; s.s = 0; s.due = now + RELEARN[0] * MIN; }
      else {
        if (rating === 2) { s.ivl = Math.max(s.ivl + 1, Math.round(s.ivl * 1.2)); s.ease = Math.max(1.3, s.ease - 0.15); }
        if (rating === 3) s.ivl = Math.max(s.ivl + 1, Math.round(s.ivl * s.ease));
        if (rating === 4) { s.ivl = Math.max(s.ivl + 1, Math.round(s.ivl * s.ease * 1.3)); s.ease += 0.15; }
        s.due = now + s.ivl * DAY;
      }
    }
    s.reps = (s.reps || 0) + 1; s.m = now; delete s.pin;
    return s;
  }
  function fmt(ms) {
    const m = Math.round(ms / MIN); if (m < 60) return `${Math.max(1, m)} min`;
    const h = m / 60; if (h < 24) return `${Math.round(h)} h`;
    const d = ms / DAY; if (d < 30) return `${Math.round(d)} d`;
    if (d < 365) return `${(d / 30).toFixed(d < 60 ? 1 : 0)} mo`;
    return `${(d / 365).toFixed(1)} y`;
  }

  // ---------- queue ----------
  const dirs = () => cfg.dir === 'both' ? ['r', 'p'] : [cfg.dir];
  const pinned = c => ['r', 'p'].some(d => srs[c.id + '|' + d] && srs[c.id + '|' + d].pin);
  const inScope = (c, scope) => !scope ? ((cfg.levels.includes(c.level) && (cfg.theme === 'all' || c.theme === cfg.theme)) || pinned(c) || isMine(c)) : scope === 'mine' ? isMine(c) : c.level === scope;
  function queue(scope, now = Date.now()) {
    const end = endOfDay(), day = dayInfo(), newLeft = Math.max(0, cfg.perDay + (day.extra || 0) - day.n);
    const learn = [], review = [], fresh = [], ahead = []; let learnToday = 0;
    const touchedToday = id => dirs().some(d => { const s = srs[id + '|' + d]; return s && s.m && new Date(s.m).toDateString() === new Date(now).toDateString(); });
    cards.forEach(c => { if (!inScope(c, scope)) return; dirs().forEach(d => {
      const k = c.id + '|' + d, s = srs[k];
      if (!s) { if (!touchedToday(c.id)) fresh.push(k); return; }
      if (s.q === 'learn' || s.q === 'relearn') { if (s.due <= end) learnToday++; if (s.due <= now) learn.push(k); else if (s.due <= now + 20 * MIN) ahead.push(k); }
      else if (s.due <= end) review.push(k);
    }); });
    const by = (a, b) => srs[a].due - srs[b].due; learn.sort(by); review.sort(by); ahead.sort(by);
    const seen = new Set(), freshOne = []; fresh.forEach(k => { const id = k.split('|')[0]; if (!seen.has(id)) { seen.add(id); freshOne.push(k); } });
    const newCards = freshOne.slice(0, newLeft);
    return { learn, review, newCards, ahead, counts: { n: newCards.length, l: learnToday, r: review.length }, nextDue: Object.values(srs).filter(s => s.due > now).reduce((m, s) => Math.min(m, s.due), Infinity) };
  }
  function status(c) {
    const ss = ['r', 'p'].map(d => srs[c.id + '|' + d]).filter(Boolean);
    if (!ss.length) return 'new';
    if (ss.some(s => s.q !== 'review')) return 'learning';
    return ss.every(s => s.ivl >= 21) ? 'mature' : 'young';
  }
  const hardCard = c => ['r', 'p'].some(d => { const s = srs[c.id + '|' + d]; return s && (s.lap > 0 || s.ease < 2.3); });

  // ---------- logging (for stats) ----------
  function logReview(r, wasNew) {
    const log = LS.get(K('log'), {}), k = dk(), d = log[k] || { r: 0, a: 0, n: 0 };
    d.r++; if (r === 1) d.a++; if (wasNew) d.n++;
    log[k] = d; const ks = Object.keys(log).sort(); while (ks.length > 400) delete log[ks.shift()];
    LS.set(K('log'), log);
  }

  // ---------- audio ----------
  function say(text) {
    if (!('speechSynthesis' in window) || !text) return;
    const u = new SpeechSynthesisUtterance(bare(strip(text))); u.lang = VC.tts;
    const v = speechSynthesis.getVoices().find(x => x.lang && x.lang.toLowerCase().startsWith(L)); if (v) u.voice = v;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  }
  const TTS = 'speechSynthesis' in window;

  // ---------- shell ----------
  const NAV = [['decks', 'Decks', '<rect x="4" y="6" width="13" height="14" rx="2"/><path d="M8 3h10a2 2 0 0 1 2 2v12"/>'], ['browse', 'Browse', '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>'], ['stats', 'Stats', '<path d="M5 20v-6M12 20V9M19 20V4"/>'], ['settings', 'Settings', '<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.4M12 18.8v2.4M4.2 7.5l2 1.2M17.8 15.3l2 1.2M4.2 16.5l2-1.2M17.8 8.7l2-1.2"/>']];
  const inSession = () => { try { return sessionStorage.getItem('gr-session') === '1'; } catch (e) { return false; } };
  const homeHref = () => VC.home + (inSession() ? '#today' : '');
  function frame(view, title, body, opts = {}) {
    document.body.dataset.view = view;
    $('app').innerHTML = `${opts.bare ? '' : `<header class="fc-head"><div class="fc-w"><a class="fc-back" href="${homeHref()}" aria-label="${inSession() ? 'Back to today’s session' : 'Back to the app'}">‹</a><h1>${title}</h1>${opts.right || ''}</div></header>`}
<main class="fc-w fc-main">${body}</main>
${opts.bare ? '' : `<nav class="fc-nav" aria-label="Flashcards">${NAV.map(([k, n, ic]) => `<a href="#${k}" ${view === k ? 'aria-current="page"' : ''}><svg viewBox="0 0 24 24" aria-hidden="true">${ic}</svg>${n}</a>`).join('')}</nav>`}`;
    window.scrollTo(0, 0);
  }
  const num = (n, cls, label) => `<div class="fc-num ${cls}"><b>${n}</b><span>${label}</span></div>`;

  // ---------- decks (home) ----------
  function viewDecks() {
    const q = queue(), due = q.counts.n + q.counts.l + q.counts.r;
    const log = LS.get(K('log'), {}), td = log[dk()] || { r: 0 };
    const deckRow = (scope, name, sub) => {
      const list = cards.filter(c => inScope(c, scope)); if (!list.length) return '';
      const qq = queue(scope), learned = list.filter(c => ['young', 'mature'].includes(status(c))).length, pct = Math.round(learned / list.length * 100);
      return `<li><a class="fc-deck" href="#study=${scope}"><span class="fc-dl">${esc(scope === 'mine' ? '★' : scope)}</span><span class="fc-dt"><b>${esc(name)}</b><small>${esc(sub)} · ${list.length} cards · ${pct}% learned</small><i class="fc-bar"><i style="width:${pct}%"></i></i></span>
<span class="fc-dc"><em class="n">${qq.counts.n}</em><em class="l">${qq.counts.l}</em><em class="r">${qq.counts.r}</em></span></a></li>`;
    };
    const mine = cards.filter(isMine).length;
    const hero = due ? `<div class="fc-hero"><div class="fc-nums">${num(q.counts.n, 'n', 'new')}${num(q.counts.l, 'l', 'learning')}${num(q.counts.r, 'r', 'to review')}</div>
<a class="fc-go" href="#study">Study now <small>${due} card${due > 1 ? 's' : ''}</small></a></div>`
      : `<div class="fc-hero done"><p class="fc-big">All caught up</p><p class="fc-sub">${td.r ? `${td.r} review${td.r > 1 ? 's' : ''} today. ` : ''}${isFinite(q.nextDue) ? `Next card in ${fmt(q.nextDue - Date.now())}.` : ''}</p>
<div class="fc-row"><button class="fc-btn" data-act="more">Learn 10 more new cards</button>${q.ahead.length ? '<a class="fc-btn" href="#study">Study ahead</a>' : ''}</div></div>`;
    frame('decks', VC.name, `${hero}
<h2 class="fc-sh">Decks <small>new · learning · review</small></h2>
<ul class="fc-decks">${LEVELS.map(l => deckRow(l.code, `${l.code} · ${l.en}`, DE && l.de ? l.de : l.ru)).join('')}${mine ? deckRow('mine', 'My cards', 'added by you') : ''}</ul>
<p class="fc-note">“Study now” mixes every deck in your settings (levels: ${cfg.levels.length === LV.length ? 'all' : cfg.levels.join(', ')}${cfg.theme !== 'all' ? ', theme: ' + esc(String(THEMES[cfg.theme] || cfg.theme).split(' · ').pop()) : ''}). Tap a deck to study only that one.</p>`,
      { right: `<a class="fc-icon" href="#settings" aria-label="Settings"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.4M12 18.8v2.4M4.2 7.5l2 1.2M17.8 15.3l2 1.2M4.2 16.5l2-1.2M17.8 8.7l2-1.2"/></svg></a>` });
  }

  // ---------- study ----------
  let S = { scope: '', cur: null, shown: false, undo: [], done: 0 };
  function pickNext() {
    const q = queue(S.scope);
    S.cur = q.learn[0] || q.review[0] || q.newCards[0] || q.ahead[0] || null; S.shown = false; S.q = q;
  }
  function info(c) {
    const g = { m: DE ? 'masculine' : 'masculine', f: 'feminine', n: 'neuter', pl: 'plural' }[c.gender] || '';
    return [c.cat, g].filter(Boolean).join(', ');
  }
  function formTable(c) {
    const f = forms && forms[c.id]; if (!f || !f.r || !f.r.length) return c.forms ? `<div class="fc-sec"><h4>Forms</h4><p lang="${L}">${esc(c.forms)}</p></div>` : '';
    const lab = f.r.some(r => r[0]);
    return `<details class="fc-sec fc-forms"><summary><h4>All forms</h4><span lang="${L}">${esc(c.forms || f.r[0].slice(1).join(' · '))}</span></summary><div class="fc-tw"><table lang="${L}">${f.h.some(Boolean) ? `<thead><tr>${lab ? '<th></th>' : ''}${f.h.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead>` : ''}<tbody>${f.r.map(r => `<tr>${lab ? `<th>${esc(r[0])}</th>` : ''}${r.slice(1).map(x => `<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${(f.x || []).map(x => `<p class="fc-x">${esc(x)}</p>`).join('')}</details>`;
  }
  function viewStudy() {
    if (!S.cur) {
      const q = queue(S.scope);
      frame('study', '', `<div class="fc-studytop"><a class="fc-x" href="#decks" aria-label="Close">✕</a><span></span></div>
<div class="fc-empty"><p class="fc-big">${S.done ? 'Well done!' : 'Nothing due'}</p><p class="fc-sub">${S.done ? `You studied ${S.done} card${S.done > 1 ? 's' : ''}.` : ''} ${isFinite(q.nextDue) ? `The next card is due in ${fmt(q.nextDue - Date.now())}.` : ''}</p>
<div class="fc-row">${inSession() ? `<a class="fc-go" href="${homeHref()}">Back to today’s session</a>` : '<a class="fc-go" href="#decks">Back to decks</a>'}<button class="fc-btn" data-act="more">Learn 10 more</button></div></div>`, { bare: true });
      return;
    }
    const [id, d] = S.cur.split('|'), c = byId[id], s = srs[S.cur], now = Date.now(), q = S.q;
    const state = !s ? 'new' : s.q === 'review' ? 'review' : 'learning';
    const front = d === 'r'
      ? `<p class="fc-term" lang="${L}">${esc(c.term)}</p><p class="fc-info">${esc(info(c))}</p>${TTS ? `<button class="fc-say" data-act="say" aria-label="Listen">▶</button>` : ''}`
      : `<p class="fc-mean">${esc(c.meaning)}</p><p class="fc-info">${esc(info(c))}${info(c) ? ' · ' : ''}in ${DE ? 'German' : 'Russian'}</p>`;
    const back = !S.shown ? '' : `<div class="fc-back-side">
${d === 'r' ? `<p class="fc-mean">${esc(c.meaning)}</p>` : `<p class="fc-term" lang="${L}">${esc(c.term)}</p>${TTS ? `<button class="fc-say" data-act="say" aria-label="Listen">▶</button>` : ''}`}
${formTable(c)}
${c.grammar ? `<div class="fc-sec"><h4>Grammar</h4><p>${esc(c.grammar)}</p></div>` : ''}
${c.ex ? `<div class="fc-sec fc-ex"><h4>Example${TTS ? ` <button class="fc-say sm" data-act="sayex" aria-label="Listen to the example">▶</button>` : ''}</h4><p lang="${L}">${esc(strip(c.ex))}</p>${c.exEn ? `<p class="fc-en">${esc(strip(c.exEn))}</p>` : ''}</div>` : ''}
${c.mistake ? `<div class="fc-sec"><h4>Watch out</h4><p>${esc(strip(c.mistake))}</p></div>` : ''}
${c.notes ? `<div class="fc-sec"><h4>Note</h4><p>${esc(strip(c.notes))}</p></div>` : ''}</div>`;
    const btn = (r, cls, label) => `<button class="fc-rate ${cls}" data-act="rate" data-r="${r}"><b>${label}</b><small>${fmt(next(s, r, now).due - now)}</small></button>`;
    const hint = (+localStorage.getItem('gr-vtaps') || 0) < 6;
    frame('study', '', `<div class="fc-studytop"><a class="fc-x" href="#decks" aria-label="Close">✕</a>
<span class="fc-left"><em class="n${state === 'new' ? ' on' : ''}">${q.counts.n}</em><em class="l${state === 'learning' ? ' on' : ''}">${q.counts.l}</em><em class="r${state === 'review' ? ' on' : ''}">${q.counts.r}</em></span>
<button class="fc-x" data-act="undo" aria-label="Undo" ${S.undo.length ? '' : 'disabled'}>↶</button></div>
<article class="fc-card${S.shown ? ' shown' : ''}" id="fcard"><div class="fc-meta"><span>${c.level}${c.theme && THEMES[c.theme] ? ' · ' + esc(String(THEMES[c.theme]).split(' · ').pop()) : ''}</span><span>${d === 'r' ? `${TL} → EN` : `EN → ${TL}`}</span></div>
<div class="fc-front">${front}</div>${back}<span class="fc-flash" aria-hidden="true"></span></article>
${hint ? `<p class="fc-hint">${S.shown ? 'Double-tap the card for Good · swipe right Good, left Again' : 'Tap the card to see the answer · double-tap if you knew it'}</p>` : ''}
<div class="fc-bottom">${S.shown ? `<div class="fc-rates">${btn(1, 'again', 'Again')}${btn(2, 'hard', 'Hard')}${btn(3, 'good', 'Good')}${btn(4, 'easy', 'Easy')}</div>` : '<button class="fc-show" data-act="show">Show answer</button>'}</div>`, { bare: true });
    if (cfg.auto && !S.shown && d === 'r') say(c.term);
    bindSwipe();
  }
  function show() { if (!S.cur || S.shown) return; S.shown = true; viewStudy(); const c = byId[S.cur.split('|')[0]]; if (cfg.auto && S.cur.endsWith('|p')) say(c.term); }
  function rate(r) {
    if (!S.cur) return;
    const now = Date.now(), wasNew = !srs[S.cur];
    S.undo.push({ k: S.cur, prev: srs[S.cur] ? Object.assign({}, srs[S.cur]) : null, wasNew });
    srs[S.cur] = next(srs[S.cur], r, now); LS.set(K('srs'), srs);
    if (wasNew) { const d = dayInfo(); d.n++; LS.set(K('day'), d); }
    logReview(r, wasNew); if (C) C.logCard();
    S.done++; pickNext(); viewStudy();
  }
  function undo() {
    const u = S.undo.pop(); if (!u) return;
    if (u.prev) srs[u.k] = u.prev; else delete srs[u.k];
    LS.set(K('srs'), srs);
    if (u.wasNew) { const d = dayInfo(); d.n = Math.max(0, d.n - 1); LS.set(K('day'), d); }
    const log = LS.get(K('log'), {}), x = log[dk()]; if (x) { x.r = Math.max(0, x.r - 1); LS.set(K('log'), log); }
    S.done = Math.max(0, S.done - 1); S.cur = u.k; S.shown = true; viewStudy();
  }
  function quick(r, label) {
    const f = document.querySelector('.fc-flash'); if (f) { f.textContent = label; f.className = 'fc-flash on ' + (r === 1 ? 'again' : 'good'); }
    try { localStorage.setItem('gr-vtaps', (+localStorage.getItem('gr-vtaps') || 0) + 1); } catch (e) {}
    setTimeout(() => rate(r), 320);
  }
  // tap = turn; double-tap = Good; swipe right = Good, left = Again
  let tapT = null, lastTap = 0, swiped = false;
  function bindSwipe() {
    const el = $('fcard'); if (!el) return;
    let x0 = null, y0 = null, dx = 0;
    el.addEventListener('touchstart', e => { const t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; dx = 0; swiped = false; }, { passive: true });
    el.addEventListener('touchmove', e => {
      if (x0 === null) return; const t = e.touches[0]; dx = t.clientX - x0; const dy = t.clientY - y0;
      if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) { el.style.transform = `translateX(${dx}px) rotate(${dx / 40}deg)`; el.style.transition = 'none'; el.dataset.sw = dx > 0 ? 'good' : 'again'; el.style.setProperty('--sw', Math.min(1, Math.abs(dx) / 120)); }
    }, { passive: true });
    el.addEventListener('touchend', () => {
      el.style.transition = '';
      if (Math.abs(dx) > 90) { swiped = true; el.style.transform = `translateX(${dx > 0 ? 120 : -120}%)`; setTimeout(() => rate(dx > 0 ? 3 : 1), 160); }
      else { el.style.transform = ''; delete el.dataset.sw; }
      x0 = null;
    });
  }

  // ---------- browse and card detail ----------
  let B = { q: '', f: 'all', shown: 60 };
  function viewBrowse() {
    const cnt = { all: cards.length, new: 0, learning: 0, young: 0, mature: 0, hard: 0, mine: 0 };
    cards.forEach(c => { const s = status(c); cnt[s]++; if (hardCard(c)) cnt.hard++; if (isMine(c)) cnt.mine++; });
    const F = [['all', 'All'], ['new', 'New'], ['learning', 'Learning'], ['young', 'Young'], ['mature', 'Mature'], ['hard', 'Hard'], ['mine', 'Mine']].filter(([k]) => k === 'all' || cnt[k]);
    frame('browse', 'Browse', `<div class="fc-search"><input id="bq" type="search" placeholder="Search ${DE ? 'German' : 'Russian'} or English" value="${esc(B.q)}" autocomplete="off" lang="${L}"></div>
<div class="fc-chips" id="bf">${F.map(([k, n]) => `<button data-f="${k}" aria-pressed="${B.f === k}">${n} <small>${cnt[k]}</small></button>`).join('')}</div>
<ul class="fc-list" id="bl"></ul><button class="fc-btn wide" id="bm" hidden>Show more</button>`);
    list();
    $('bq').addEventListener('input', () => { B.q = $('bq').value; B.shown = 60; list(); });
    $('bf').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; B.f = b.dataset.f; B.shown = 60; $('bf').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); list(); });
    $('bm').addEventListener('click', () => { B.shown += 60; list(); });
  }
  function list() {
    const q = fold(B.q.trim()), now = Date.now();
    const items = cards.filter(c => (B.f === 'all' || (B.f === 'hard' ? hardCard(c) : B.f === 'mine' ? isMine(c) : status(c) === B.f)) && (!q || fold(c.term + ' ' + c.meaning).includes(q)));
    $('bl').innerHTML = items.slice(0, B.shown).map(c => {
      const st = status(c), due = Math.min(...['r', 'p'].map(d => (srs[c.id + '|' + d] || {}).due || Infinity));
      return `<li><a href="#card=${encodeURIComponent(c.id)}"><span class="fc-lt"><b lang="${L}">${esc(c.term)}</b><small>${esc(c.meaning)}</small></span><span class="fc-lr"><i class="fc-st ${st}">${st}</i><small>${c.level}${isFinite(due) ? ' · ' + (due <= now ? 'due' : fmt(due - now)) : ''}</small></span></a></li>`;
    }).join('') || '<li class="fc-none">No cards match.</li>';
    $('bm').hidden = items.length <= B.shown;
  }
  function viewCard(id) {
    const c = byId[id]; if (!c) { location.hash = '#browse'; return; }
    const rows = ['r', 'p'].map(d => { const s = srs[id + '|' + d]; return `<tr><th>${d === 'r' ? `${TL} → EN` : `EN → ${TL}`}</th><td>${!s ? 'new' : s.q === 'review' ? `every ${fmt(s.ivl * DAY)}` : 'learning'}</td><td>${s ? `${s.reps || 0} reviews` : ''}</td><td>${s && s.lap ? `${s.lap} lapse${s.lap > 1 ? 's' : ''}` : ''}</td></tr>`; }).join('');
    frame('browse', '', `<p class="fc-crumb"><a href="#browse">‹ Browse</a></p><article class="fc-card static"><div class="fc-meta"><span>${c.level} · ${esc(String(THEMES[c.theme] || c.theme).split(' · ').pop())}</span><span>${status(c)}</span></div>
<div class="fc-front"><p class="fc-term" lang="${L}">${esc(c.term)}</p><p class="fc-info">${esc(info(c))}</p>${TTS ? '<button class="fc-say" data-act="saycard" aria-label="Listen">▶</button>' : ''}<p class="fc-mean sm">${esc(c.meaning)}</p></div>
<div class="fc-back-side">${formTable(c)}${c.grammar ? `<div class="fc-sec"><h4>Grammar</h4><p>${esc(c.grammar)}</p></div>` : ''}${c.ex ? `<div class="fc-sec fc-ex"><h4>Example</h4><p lang="${L}">${esc(strip(c.ex))}</p><p class="fc-en">${esc(strip(c.exEn))}</p></div>` : ''}
<div class="fc-sec"><h4>Your progress</h4><div class="fc-tw"><table class="plain">${rows}</table></div></div></div></article>
<div class="fc-row"><button class="fc-btn" data-act="learnnow" data-id="${esc(id)}">${pinned(c) ? 'In today’s queue ✓' : 'Study it today'}</button><button class="fc-btn" data-act="reset" data-id="${esc(id)}">Reset progress</button>${isMine(c) ? `<button class="fc-btn danger" data-act="del" data-id="${esc(id)}">Delete card</button>` : ''}</div>`, { right: '' });
    if (!forms) loadForms().then(() => { if (location.hash === '#card=' + encodeURIComponent(id)) viewCard(id); });
  }

  // ---------- stats ----------
  function bars(vals, labels, cls) {
    const mx = Math.max(1, ...vals);
    return `<div class="fc-bars ${cls || ''}">${vals.map((v, i) => `<div><i style="height:${Math.round(v / mx * 100)}%"></i><b>${v || ''}</b><span>${labels[i]}</span></div>`).join('')}</div>`;
  }
  function viewStats() {
    const log = LS.get(K('log'), {}), now = Date.now();
    const st = { new: 0, learning: 0, young: 0, mature: 0 }; cards.forEach(c => st[status(c)]++);
    const tot = cards.length || 1;
    const days14 = [...Array(14)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - 13 + i); return d; });
    const rev = days14.map(d => (log[dk(d)] || {}).r || 0);
    let r30 = 0, a30 = 0; for (let i = 0; i < 30; i++) { const d = new Date(); d.setDate(d.getDate() - i); const x = log[dk(d)]; if (x) { r30 += x.r; a30 += x.a; } }
    const fc = [...Array(7)].map((_, i) => { const s0 = new Date(); s0.setHours(0, 0, 0, 0); const a = s0.getTime() + i * DAY, b = a + DAY; return Object.values(srs).filter(s => s.q === 'review' && (i === 0 ? s.due < b : s.due >= a && s.due < b)).length; });
    const wd = d => d.toLocaleDateString('en', { weekday: 'narrow' });
    let streak = 0; { const d = new Date(); if (!(log[dk(d)] || {}).r) d.setDate(d.getDate() - 1); while ((log[dk(d)] || {}).r) { streak++; d.setDate(d.getDate() - 1); } }
    const td = log[dk()] || { r: 0, a: 0, n: 0 };
    frame('stats', 'Statistics', `<div class="fc-grid4">${num(td.r, '', 'reviews today')}${num(td.n, '', 'new today')}${num(streak, '', 'day streak')}${num(r30 ? Math.round((1 - a30 / r30) * 100) + '%' : '–', '', 'right, 30 days')}</div>
<section class="fc-panel"><h3>Your cards</h3><div class="fc-stack">${['mature', 'young', 'learning', 'new'].map(k => `<i class="${k}" style="flex:${st[k]}"></i>`).join('')}</div>
<ul class="fc-legend">${[['mature', 'Mature', 'interval 3 weeks or more'], ['young', 'Young', 'learned, shorter interval'], ['learning', 'Learning', 'in the learning steps'], ['new', 'New', 'not seen yet']].map(([k, n, s]) => `<li><i class="${k}"></i><b>${st[k]}</b> ${n} <small>${s}</small></li>`).join('')}</ul></section>
<section class="fc-panel"><h3>Reviews, last 14 days</h3>${bars(rev, days14.map(wd))}</section>
<section class="fc-panel"><h3>Due in the next 7 days</h3>${bars(fc, fc.map((_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return i ? wd(d) : 'today'; }), 'fc')}</section>
<section class="fc-panel"><h3>Learned by level</h3><ul class="fc-lvl">${LEVELS.map(l => { const ls = cards.filter(c => c.level === l.code); if (!ls.length) return ''; const n = ls.filter(c => ['young', 'mature'].includes(status(c))).length; return `<li><b>${l.code}</b><i class="fc-bar"><i style="width:${Math.round(n / ls.length * 100)}%"></i></i><span>${n}/${ls.length}</span></li>`; }).join('')}</ul></section>`);
  }

  // ---------- settings ----------
  function viewSettings() {
    const themeCounts = {}; cards.forEach(c => { if (cfg.levels.includes(c.level)) themeCounts[c.theme] = (themeCounts[c.theme] || 0) + 1; });
    const seg = (id, opts, cur) => `<div class="fc-seg" id="${id}">${opts.map(([v, n]) => `<button data-v="${v}" aria-pressed="${String(cur) === String(v)}">${n}</button>`).join('')}</div>`;
    frame('settings', 'Settings', `<section class="fc-panel"><h3>Daily study</h3>
<label class="fc-lab">Card direction</label>${seg('sdir', [['both', 'Both ways'], ['r', `${TL} → EN`], ['p', `EN → ${TL}`]], cfg.dir)}
<label class="fc-lab">New cards per day</label>${seg('snew', [[5, '5'], [10, '10'], [20, '20'], [30, '30'], [50, '50']], cfg.perDay)}
<label class="fc-lab">Levels in “Study now”</label><div class="fc-seg multi" id="slv">${LV.map(l => `<button data-v="${l}" aria-pressed="${cfg.levels.includes(l)}">${l}</button>`).join('')}</div>
<label class="fc-lab">Theme</label><select id="sth" class="fc-select"><option value="all">All themes</option>${Object.keys(THEMES).filter(t => themeCounts[t]).map(t => `<option value="${t}" ${cfg.theme === t ? 'selected' : ''}>${esc(String(THEMES[t]).split(' · ').pop())} (${themeCounts[t]})</option>`).join('')}</select>
<label class="fc-check"><input type="checkbox" id="sauto" ${cfg.auto ? 'checked' : ''}> Read ${DE ? 'German' : 'Russian'} words aloud automatically</label></section>
<section class="fc-panel"><h3>Add cards</h3><form id="addf" class="fc-form"><input id="at" required placeholder="${DE ? 'Wort, e.g. die Brücke' : 'Слово, e.g. мост'}" lang="${L}"><input id="am" required placeholder="Meaning in English"><input id="ae" placeholder="Example sentence (optional)" lang="${L}"><button class="fc-go">Add card</button></form><p class="fc-msg" id="amsg"></p></section>
<section class="fc-panel"><h3>Import from Anki</h3><p class="fc-note">Paste or open an Anki text export (.txt or .tsv). With a <code>#columns:</code> header all fields are kept; otherwise column 1 is ${DE ? 'German' : 'Russian'} and column 2 English.</p>
<input type="file" id="ifile" accept=".txt,.tsv,.csv,text/plain"><textarea id="itext" rows="4" placeholder="${DE ? 'das Haus&#9;house' : 'дом&#9;house'}"></textarea>
<div class="fc-row"><select id="ilevel" class="fc-select">${LEVELS.map(l => `<option ${l.code === 'B1' ? 'selected' : ''}>${l.code}</option>`).join('')}</select><button class="fc-btn" id="ido">Import</button></div><p class="fc-msg" id="imsg"></p></section>
<section class="fc-panel"><h3>Export to Anki</h3><p class="fc-note">Download the words you’ve practised as an Anki file (note type Vocab). Cards keep their id, so importing again updates them in Anki instead of making copies.</p>
<div class="fc-row"><button class="fc-btn" data-x="all">All practised</button><button class="fc-btn" data-x="hard">Only hard</button><button class="fc-btn" data-x="mine">Only mine</button></div><p class="fc-msg" id="xmsg"></p>
<p class="fc-note">The built-in decks: ${VC.decks.map(d => `<a href="${d}" download>${d.split('/').pop()}</a>`).join(', ')}.</p></section>`);
    const segBind = (id, fn) => $(id).addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; fn(b.dataset.v, b); saveCfg(); });
    segBind('sdir', v => { cfg.dir = v; $('sdir').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x.dataset.v === v)); });
    segBind('snew', v => { cfg.perDay = +v; $('snew').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x.dataset.v === v)); });
    segBind('slv', (v, b) => { const on = cfg.levels.includes(v); if (on && cfg.levels.length === 1) return; cfg.levels = on ? cfg.levels.filter(x => x !== v) : LV.filter(x => x === v || cfg.levels.includes(x)); b.setAttribute('aria-pressed', !on); });
    $('sth').addEventListener('change', () => { cfg.theme = $('sth').value; saveCfg(); });
    $('sauto').addEventListener('change', () => { cfg.auto = $('sauto').checked; saveCfg(); });
    $('addf').addEventListener('submit', e => {
      e.preventDefault(); const t = $('at').value.trim(), m = $('am').value.trim(); if (!t || !m) return;
      const id = (DE ? 'de-my-' : 'my-') + hash(t + '|' + m), list = custom();
      if (!list.some(c => c.id === id)) list.push({ id, term: t, kind: /\s/.test(t) ? 'phrase' : 'word', cat: '', gender: '', forms: '', grammar: '', meaning: m, ex: $('ae').value.trim(), exEn: '', mistake: '', notes: 'Added in the flashcards', ipa: '', level: cfg.levels[0] || 'B1', theme: 'imported', src: 'import' });
      LS.set(K('custom'), list); setCards(cards.concat(list));
      $('at').value = ''; $('am').value = ''; $('ae').value = ''; $('amsg').textContent = `Added “${t}”. It’s in the deck “My cards”.`;
    });
    $('ifile').addEventListener('change', async () => { const f = $('ifile').files[0]; if (f) $('itext').value = await f.text(); });
    $('ido').addEventListener('click', () => {
      const got = parseTSV($('itext').value, $('ilevel').value, 'import');
      if (!got.length) { $('imsg').textContent = `No cards found. Each line needs the ${DE ? 'German' : 'Russian'} word, a tab, then English.`; return; }
      const list = custom(), ids = new Set(list.map(c => c.id)); let added = 0;
      got.forEach(c => { if (!ids.has(c.id) && !byId[c.id]) { list.push(c); added++; } });
      LS.set(K('custom'), list); setCards(cards.concat(list));
      $('imsg').textContent = `Imported ${added} card${added === 1 ? '' : 's'}${got.length - added ? ` (${got.length - added} were already here)` : ''}.`; $('itext').value = '';
    });
    document.querySelectorAll('[data-x]').forEach(b => b.addEventListener('click', () => exportAnki(b.dataset.x)));
  }
  const XCOLS = ['term', 'language', 'kind', 'category', 'article', 'gender', 'forms', 'grammar', 'meaning_en', 'example_target', 'example_en', 'common_mistake', 'register', 'cefr', 'frequency', 'notes', 'ipa', 'image', 'audio', 'audio_sentence', 'voice', 'headword', 'partner_word', 'id', 'tags'];
  function exportAnki(which) {
    const rows = [];
    cards.forEach(c => {
      const ss = ['r', 'p'].map(d => srs[c.id + '|' + d]).filter(Boolean);
      if (which === 'mine' ? !isMine(c) : !ss.length) return;
      const hard = hardCard(c), learned = ss.length && ss.every(s => s.q === 'review');
      if (which === 'hard' && !hard) return;
      const r = Object.assign({ term: c.term, language: L, kind: c.kind, category: c.cat, gender: c.gender, forms: c.forms, grammar: c.grammar, meaning_en: c.meaning, example_target: c.ex, example_en: c.exEn, common_mistake: c.mistake, register: '', cefr: c.level, notes: c.notes, ipa: c.ipa, voice: DE ? 'de_DE' : 'ru_RU', id: c.id }, c.raw || {});
      r.tags = [...new Set(String(r.tags || '').split(/\s+/).filter(Boolean).concat(['grammar-app', learned ? 'learned' : ss.length ? 'learning' : 'new'], hard ? ['hard'] : []))].join(' ');
      rows.push(XCOLS.map(k => String(r[k] == null ? '' : r[k]).replace(/[\t\n\r]+/g, ' ')).join('\t'));
    });
    if (!rows.length) { $('xmsg').textContent = which === 'hard' ? 'No hard words yet.' : which === 'mine' ? 'You haven’t added any cards yet.' : 'Study some cards first: only cards you’ve seen are exported.'; return; }
    const head = ['#separator:tab', '#html:true', '#notetype:Vocab', '#deck:Languages::' + (DE ? 'German' : 'Russian'), '#guid column:24', '#tags column:25', '#columns:' + XCOLS.join('\t')];
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([head.concat(rows).join('\n') + '\n'], { type: 'text/tab-separated-values' }));
    a.download = `${DE ? 'german' : 'russian'}-${which}-${dk()}.tsv`; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    $('xmsg').textContent = `Exported ${rows.length} card${rows.length > 1 ? 's' : ''}.`;
  }

  // ---------- routing and events ----------
  let formsP = null;
  const loadForms = () => formsP || (formsP = fetch(VC.forms).then(r => r.ok ? r.json() : {}).catch(() => ({})).then(j => (forms = j)));
  function route() {
    srs = LS.get(K('srs'), {});
    const h = location.hash.slice(1);
    if (h.startsWith('study')) { S = { scope: h.split('=')[1] || '', undo: [], done: 0 }; pickNext(); viewStudy(); if (!forms) loadForms(); }
    else if (h === 'browse') viewBrowse();
    else if (h.startsWith('card=')) viewCard(decodeURIComponent(h.slice(5)));
    else if (h === 'stats') viewStats();
    else if (h === 'settings') viewSettings();
    else viewDecks();
  }
  addEventListener('hashchange', route);
  document.addEventListener('click', e => {
    if (document.body.dataset.view === 'study' && S.cur) {
      if (e.target.closest('#fcard') && !e.target.closest('button, a, summary, details')) {
        if (swiped) { swiped = false; return; }
        const now = Date.now();
        if (now - lastTap < 320) { clearTimeout(tapT); lastTap = 0; quick(3, 'Good ✓'); return; }
        lastTap = now; clearTimeout(tapT);
        tapT = setTimeout(() => show(), 280);
        return;
      }
    }
    const b = e.target.closest('[data-act]'); if (!b) return;
    const a = b.dataset.act, c = S.cur && byId[S.cur.split('|')[0]];
    if (a === 'show') show();
    else if (a === 'rate') rate(+b.dataset.r);
    else if (a === 'undo') undo();
    else if (a === 'say' && c) say(c.term);
    else if (a === 'sayex' && c) say(c.ex);
    else if (a === 'saycard') { const m = location.hash.match(/card=(.+)/); if (m) say(byId[decodeURIComponent(m[1])].term); }
    else if (a === 'more') { const d = dayInfo(); d.extra = (d.extra || 0) + 10; LS.set(K('day'), d); location.hash = '#study'; route(); }
    else if (a === 'learnnow') { const k = b.dataset.id + '|r'; if (!srs[k]) srs[k] = { q: 'learn', s: 0, ease: 2.5, ivl: 0, lap: 0, reps: 0, due: Date.now(), m: Date.now(), pin: true }; else { srs[k].due = Date.now(); srs[k].pin = true; } LS.set(K('srs'), srs); b.textContent = 'In today’s queue ✓'; }
    else if (a === 'reset' && confirm('Reset the progress of this card? It becomes new again.')) { ['r', 'p'].forEach(d => delete srs[b.dataset.id + '|' + d]); LS.set(K('srs'), srs); route(); }
    else if (a === 'del' && confirm('Delete this card?')) { LS.set(K('custom'), custom().filter(x => x.id !== b.dataset.id)); ['r', 'p'].forEach(d => delete srs[b.dataset.id + '|' + d]); LS.set(K('srs'), srs); setCards(cards.filter(x => x.id !== b.dataset.id)); location.hash = '#browse'; }
  });
  document.addEventListener('keydown', e => {
    if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.metaKey || e.ctrlKey || e.altKey) return;
    if (document.body.dataset.view !== 'study' || !S.cur) return;
    if (!S.shown && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); show(); }
    else if (S.shown && /^[1-4]$/.test(e.key)) rate(+e.key);
    else if (S.shown && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); rate(3); }
    else if (e.key === 'z' || e.key === 'u') undo();
  });

  // ---------- start ----------
  $('app').innerHTML = '<p class="fc-loading">Loading cards…</p>';
  Promise.all(VC.decks.map(u => fetch(u).then(r => { if (!r.ok) throw new Error(u); return r.text(); })))
    .then(texts => { setCards(texts.flatMap((t, i) => parseTSV(t, 'B1', 'deck' + i)).concat(custom())); route(); })
    .catch(() => { $('app').innerHTML = '<p class="fc-loading">The cards couldn’t be loaded. Check your connection and reload.</p>'; });
  if (TTS) speechSynthesis.getVoices();
  window.__fc = { cards: () => cards, state: () => S, srs: () => srs };   // used by the automated tests
})();
