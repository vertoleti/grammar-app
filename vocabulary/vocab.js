/* Словарь: Anki-style spaced repetition over Anki TSV decks.
   Scheduling follows Anki's defaults: learning steps 1 and 10 minutes, graduating interval 1 day,
   easy interval 4 days, starting ease 250 %, lapses relearn in 10 minutes and restart at 1 day. */
{
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const bare = s => String(s || '').normalize('NFD').replace(/́/g, '').normalize('NFC');
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
const MIN = 60000, DAY = 86400000;
const LEARN = [1, 10], RELEARN = [10];
// German flashcards set window.VOC_CFG before loading this file; the Russian page uses the defaults.
const VC = Object.assign({ decks: ['decks/ru-core.tsv', 'decks/ru-levels.tsv'], prefix: 'voc-', lang: 'ru', tts: 'ru-RU', themes: null, all: 'Все темы · All', done: 'Готово!', listen: '▶ Listen' }, window.VOC_CFG || {});
const DECKS = VC.decks, K = n => VC.prefix + n;
const LEVELS = window.CEFR;
const LV = LEVELS.map(l => l.code);
const THEMES = VC.themes || {
  basic: 'Основное · Basics', people: 'Люди · People', feelings: 'Чувства · Feelings', health: 'Здоровье · Health',
  society: 'Общество · Society', communication: 'Общение · Communication', abstract: 'Понятия · Ideas', home: 'Дом · Home',
  city: 'Город · City', travel: 'Путешествия · Travel', shopping: 'Покупки · Shopping', food: 'Еда · Food', work: 'Работа · Work',
  study: 'Учёба · Study', time: 'Время · Time', qualities: 'Качества · Qualities', linking: 'Связки · Linking words',
  nature: 'Природа · Nature', economy: 'Экономика · Economy', general: 'Общее · General', imported: 'Импорт · Imported'
};
const PER_DAY = [5, 10, 20, 30, 50];

let cards = [], byId = {};
let srs = LS.get(K('srs'), {});
let cfg = Object.assign({ levels: LV.slice(), theme: 'all', dir: 'both', perDay: 20 }, LS.get(K('settings'), {}));
let cur = null, shown = false;

const today = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
const endOfDay = () => { const d = new Date(); d.setHours(23, 59, 59, 999); return d.getTime(); };
function dayInfo() { const d = LS.get(K('day'), {}); return d.d === today() ? d : { d: today(), n: 0, extra: 0 }; }
const saveCfg = () => LS.set(K('settings'), cfg);

/* ---------- decks ---------- */
function parseTSV(text, fallbackLevel, src) {
  const lines = text.replace(/\r/g, '').split('\n');
  let cols = null; const out = [];
  lines.forEach(l => {
    if (!l.trim()) return;
    if (l.startsWith('#')) { if (l.startsWith('#columns:')) cols = l.slice(9).split('\t').map(s => s.trim()); return; }
    const f = l.split('\t');
    let c;
    if (cols) { c = {}; cols.forEach((n, i) => { c[n] = (f[i] || '').trim(); }); }
    else {
      if (f.length < 2) return;
      c = { term: f[0].trim(), meaning_en: f[1].trim(), tags: (f[2] || '').trim() };
    }
    if (!c.term || !c.meaning_en) return;
    const tags = (c.tags || '').split(/\s+/).filter(Boolean);
    const tagLevel = tags.map(t => t.toUpperCase()).find(t => LV.includes(t));
    const level = LV.includes((c.cefr || '').toUpperCase()) ? c.cefr.toUpperCase() : tagLevel || fallbackLevel;
    const theme = src === 'import' ? 'imported' : (tags.find(t => THEMES[t]) || 'general');
    const id = c.id || 'imp-' + hash(c.term + '|' + c.meaning_en);
    out.push({ id, term: c.term, kind: c.kind || 'word', cat: c.category || '', gender: c.gender || '', forms: c.forms || '', grammar: c.grammar || '',
      meaning: c.meaning_en, ex: c.example_target || '', exEn: c.example_en || '', mistake: c.common_mistake || '', notes: c.notes || '', ipa: c.ipa || '',
      level, theme, src, raw: cols ? c : null });
  });
  return out;
}
function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
function setCards(list) {
  cards = []; byId = {};
  list.forEach(c => { if (!byId[c.id]) { byId[c.id] = c; cards.push(c); } });
  cards.sort((a, b) => LV.indexOf(a.level) - LV.indexOf(b.level));
  $('total').textContent = cards.length;
}

/* ---------- scheduling ---------- */
function next(state, rating, now) {
  const s = state ? Object.assign({}, state) : { q: 'learn', s: 0, ease: 2.5, ivl: 0, lap: 0, reps: 0 };
  if (s.q === 'learn' || s.q === 'relearn') {
    const steps = s.q === 'learn' ? LEARN : RELEARN;
    if (rating === 1) { s.s = 0; s.due = now + steps[0] * MIN; }
    else if (rating === 2) { s.due = now + (s.s === 0 && steps[1] ? (steps[0] + steps[1]) / 2 : steps[s.s] * 1.5) * MIN; }
    else if (rating === 3 && s.s + 1 < steps.length) { s.s++; s.due = now + steps[s.s] * MIN; }
    else {
      const wasLearn = s.q === 'learn';
      s.ivl = rating === 4 ? (wasLearn ? 4 : Math.max(1, s.ivl) + 1) : (wasLearn ? 1 : Math.max(1, s.ivl));
      s.q = 'review'; s.s = 0; s.due = now + s.ivl * DAY;
    }
  } else {
    if (rating === 1) { s.lap++; s.ease = Math.max(1.3, s.ease - 0.2); s.ivl = 1; s.q = 'relearn'; s.s = 0; s.due = now + RELEARN[0] * MIN; }
    else {
      if (rating === 2) { s.ivl = Math.max(s.ivl + 1, Math.round(s.ivl * 1.2)); s.ease = Math.max(1.3, s.ease - 0.15); }
      if (rating === 3) s.ivl = Math.max(s.ivl + 1, Math.round(s.ivl * s.ease));
      if (rating === 4) { s.ivl = Math.max(s.ivl + 1, Math.round(s.ivl * s.ease * 1.3)); s.ease += 0.15; }
      s.due = now + s.ivl * DAY;
    }
  }
  s.reps++; s.m = now;
  return s;
}
function fmt(ms) {
  const m = Math.round(ms / MIN);
  if (m < 60) return `${Math.max(1, m)} min`;
  const h = m / 60; if (h < 24) return `${Math.round(h)} h`;
  const d = ms / DAY; if (d < 30) return `${Math.round(d)} d`;
  if (d < 365) return `${(d / 30).toFixed(d < 60 ? 1 : 0)} mo`;
  return `${(d / 365).toFixed(1)} y`;
}

/* ---------- queue ---------- */
const dirs = () => cfg.dir === 'both' ? ['r', 'p'] : [cfg.dir];
const pinned = c => ['r', 'p'].some(d => srs[c.id + '|' + d] && srs[c.id + '|' + d].pin);   // added from a word lookup: shown whatever the filters
function active() { return cards.filter(c => (cfg.levels.includes(c.level) && (cfg.theme === 'all' || c.theme === cfg.theme)) || pinned(c)); }
function queue(now) {
  const end = endOfDay(), day = dayInfo(), newLeft = Math.max(0, cfg.perDay + (day.extra || 0) - day.n);
  const learn = [], review = [], fresh = [], ahead = [];
  let learnToday = 0;
  const touchedToday = id => dirs().some(d => { const s = srs[id + '|' + d]; return s && s.m && new Date(s.m).toDateString() === new Date(now).toDateString(); });
  active().forEach(c => dirs().forEach(d => {
    const k = c.id + '|' + d, s = srs[k];
    if (!s) { if (!touchedToday(c.id)) fresh.push(k); return; }
    if (s.q === 'learn' || s.q === 'relearn') { if (s.due <= end) learnToday++; if (s.due <= now) learn.push(k); else if (s.due <= now + 20 * MIN) ahead.push(k); }
    else if (s.due <= end) review.push(k);
  }));
  learn.sort((a, b) => srs[a].due - srs[b].due); review.sort((a, b) => srs[a].due - srs[b].due); ahead.sort((a, b) => srs[a].due - srs[b].due);
  // one direction of a new word per day; siblings wait until tomorrow
  const seenIds = new Set(), freshOne = [];
  fresh.forEach(k => { const id = k.split('|')[0]; if (!seenIds.has(id)) { seenIds.add(id); freshOne.push(k); } });
  const newCards = freshOne.slice(0, newLeft);
  return { learn, review, newCards, ahead, counts: { n: newCards.length, l: learnToday, r: review.length } };
}
function pick() {
  const now = Date.now(), q = queue(now);
  cur = q.learn[0] || q.review[0] || q.newCards[0] || q.ahead[0] || null;
  shown = false;
  return q;
}

/* ---------- rendering ---------- */
function renderLevels() {
  $('levels').innerHTML = LEVELS.map(l => {
    const list = cards.filter(c => c.level === l.code);
    const learned = list.filter(c => ['r', 'p'].some(d => srs[c.id + '|' + d] && srs[c.id + '|' + d].q === 'review')).length;
    const pct = list.length ? Math.round(learned / list.length * 100) : 0;
    return `<button class="lv" id="lv-${l.code}" data-l="${l.code}" aria-pressed="${cfg.levels.includes(l.code)}" title="${l.code}: ${l.en} · ${l.ru} (${l.test})"><b>${l.code}</b><span class="nm">${l.en}</span><span class="nm ru">${l.ru}</span><span class="bar"><i style="width:${pct}%"></i></span><span class="ct">${learned} of ${list.length} learned</span></button>`;
  }).join('');
}
function renderControls() {
  const inLv = cards.filter(c => cfg.levels.includes(c.level));
  const counts = {}; inLv.forEach(c => { counts[c.theme] = (counts[c.theme] || 0) + 1; });
  if (cfg.theme !== 'all' && !counts[cfg.theme]) cfg.theme = 'all';
  $('topics').innerHTML = `<button id="t-all" data-t="all" aria-pressed="${cfg.theme === 'all'}">${VC.all}<small>${inLv.length}</small></button>` +
    Object.keys(THEMES).filter(t => counts[t]).map(t => `<button id="t-${t}" data-t="${t}" aria-pressed="${cfg.theme === t}">${THEMES[t]}<small>${counts[t]}</small></button>`).join('');
  document.querySelectorAll('#dirs button').forEach(b => b.setAttribute('aria-pressed', b.dataset.d === cfg.dir));
  $('sizes').innerHTML = PER_DAY.map(n => `<button id="n-${n}" data-n="${n}" aria-pressed="${n === cfg.perDay}">${n}</button>`).join('');
}
function row(label, val) { return val ? `<div class="row"><span>${label}</span><span>${val}</span></div>` : ''; }
function info(c) { return [c.cat, { m: 'masculine', f: 'feminine', n: 'neuter', pl: 'plural', 'm/f': 'common gender' }[c.gender]].filter(Boolean).join(', '); }
function render(q) {
  q = q || queue(Date.now());
  $('counts').innerHTML = `<span class="c-new">${q.counts.n}<small>new</small></span><span class="c-lrn">${q.counts.l}<small>learning</small></span><span class="c-rev">${q.counts.r}<small>to review</small></span>`;
  renderLevels(); renderControls();
  const el = $('card');
  if (!cards.length) { el.innerHTML = '<div class="done"><p>Loading the decks…</p></div>'; return; }
  if (!cfg.levels.length) { el.innerHTML = '<div class="done"><p class="big" style="font-size:40px">Pick a level</p><p>Tap one or more of the levels above to start.</p></div>'; return; }
  if (!cur) {
    const now = Date.now();
    const pending = Object.entries(srs).filter(([k]) => { const id = k.split('|')[0]; return byId[id] && cfg.levels.includes(byId[id].level); }).map(([, s]) => s.due).filter(d => d > now).sort((a, b) => a - b)[0];
    const left = active().some(c => dirs().some(d => !srs[c.id + '|' + d]));
    el.innerHTML = `<div class="done"><p class="big">${VC.done}</p><p>All done for now.${pending ? ` The next card is due in ${fmt(pending - now)}.` : ''}</p>${left ? '<p><button class="btn go" data-act="more">Learn 10 more new cards today</button></p>' : ''}</div>`;
    return;
  }
  const [id, d] = cur.split('|'), c = byId[id], s = srs[cur];
  const lvl = LEVELS.find(l => l.code === c.level);
  const state = !s ? '<span class="st s-new">new</span>' : s.q === 'review' ? '<span class="st s-rev">review</span>' : '<span class="st s-lrn">learning</span>';
  const tts = 'speechSynthesis' in window ? `<button class="say" data-act="say">${VC.listen}</button>` : '';
  const front = d === 'r'
    ? `<p class="term" lang="${VC.lang}">${esc(c.term)}</p><p class="gram">${esc(info(c))}</p>${tts}`
    : `<p class="mean">${esc(c.meaning)}</p><p class="gram">${esc(info(c))} · say it in ${VC.lang === 'de' ? 'German' : 'Russian'}</p>`;
  const back = !shown ? '' : `<div class="back in">
${d === 'r' ? `<p class="mean" style="font-size:clamp(24px,4.5vw,34px)">${esc(c.meaning)}</p>` : `<p class="term" lang="${VC.lang}" style="font-size:clamp(30px,6vw,46px)">${esc(c.term)}</p>${tts}`}
${row('Forms', esc(c.forms))}${row('Grammar', esc(c.grammar))}
${c.ex ? row('Example', `<span class="ex" lang="${VC.lang}">${esc(c.ex)}<small>${esc(c.exEn)}</small></span>${'speechSynthesis' in window ? '<button class="say sm" data-act="sayex">Listen to the example</button>' : ''}`) : ''}
${row('Note', esc(c.notes))}${row('Watch out', esc(c.mistake))}${row('IPA', c.ipa ? '/' + esc(c.ipa) + '/' : '')}</div>`;
  const now = Date.now();
  const btn = (r, cls, label) => `<button class="${cls}" data-act="rate" data-r="${r}">${label}<small>${fmt(next(s, r, now).due - now)}</small></button>`;
  el.innerHTML = `<div class="vtop"><span class="vmeta">${c.level} · ${esc(String(THEMES[c.theme] || c.theme).split(' · ').pop())} · ${state}</span><span class="vmeta">${d === 'r' ? VC.lang.toUpperCase() + ' → EN' : 'EN → ' + VC.lang.toUpperCase()}</span></div>
<div class="face" title="Tap to turn · double-tap = Good">${front}${back}<span class="flash" aria-hidden="true"></span></div>
<div class="actions">${shown ? `<div class="rate">${btn(1, 'again', 'Again')}${btn(2, '', 'Hard')}${btn(3, 'good', 'Good')}${btn(4, '', 'Easy')}</div>` : '<button class="show" data-act="show" id="showbtn">Show answer</button>'}</div>
${tapHint() ? '<p class="taphint2">Tap the card to turn it · double-tap if you knew it (Good)</p>' : ''}`;
}
function renderBrowse() {
  const q = bare($('q').value.trim().toLowerCase());
  const list = cards.filter(c => !q || bare(c.term).toLowerCase().includes(q) || c.meaning.toLowerCase().includes(q));
  const now = Date.now();
  const status = c => {
    const ss = ['r', 'p'].map(d => srs[c.id + '|' + d]).filter(Boolean);
    if (!ss.length) return 'new';
    if (ss.some(s => s.q !== 'review')) return 'learning';
    const due = Math.min(...ss.map(s => s.due));
    return due <= now ? 'due' : 'in ' + fmt(due - now);
  };
  $('blist').innerHTML = list.slice(0, 150).map(c => `<tr><td lang="${VC.lang}"><b>${esc(c.term)}</b></td><td>${esc(c.meaning)}</td><td>${c.level}</td><td>${status(c)}</td></tr>`).join('');
  $('bmore').textContent = list.length > 150 ? `Showing 150 of ${list.length}. Search to narrow it down.` : `${list.length} cards`;
}

/* ---------- actions ---------- */
function rate(r) {
  if (!cur || !shown) return;
  const now = Date.now(), wasNew = !srs[cur];
  srs[cur] = next(srs[cur], r, now);
  LS.set(K('srs'), srs);
  if (wasNew) { const d = dayInfo(); d.n++; LS.set(K('day'), d); }
  if (window.GRCoach) window.GRCoach.logCard();
  const q = pick(); render(q);
  if ($('browse').open) renderBrowse();
}
function show() { if (!cur) return; shown = true; render(); const r = document.querySelector('.rate button.good'); if (r) r.focus({ preventScroll: true }); }
function say(text) {
  if (!cur) return;
  const u = new SpeechSynthesisUtterance(text || bare(byId[cur.split('|')[0]].term));
  u.lang = VC.tts;
  const v = speechSynthesis.getVoices().find(x => x.lang && x.lang.toLowerCase().startsWith(VC.lang));
  if (v) u.voice = v;
  speechSynthesis.cancel(); speechSynthesis.speak(u);
}
/* tap the card to turn it; double-tap = Good (also before turning it) */
function tapHint() { return (+localStorage.getItem('gr-vtaps') || 0) < 6; }
let tapT = null, lastTap = 0;
function goodNow() {
  if (!cur) return;
  const f = document.querySelector('.face .flash');
  if (!shown) { shown = true; }
  try { localStorage.setItem('gr-vtaps', (+localStorage.getItem('gr-vtaps') || 0) + 1); } catch (e) {}
  if (f) { f.textContent = 'Good ✓'; f.classList.add('on'); }
  setTimeout(() => rate(3), 380);
}
$('card').addEventListener('click', e => {
  if (!e.target.closest('button, a, input, select') && e.target.closest('.face')) {
    const now = Date.now();
    if (now - lastTap < 320) { clearTimeout(tapT); lastTap = 0; goodNow(); return; }
    lastTap = now; clearTimeout(tapT);
    tapT = setTimeout(() => { if (!shown) show(); }, 300);
    return;
  }
  const b = e.target.closest('button[data-act]'); if (!b) return;
  const a = b.dataset.act;
  if (a === 'show') show();
  else if (a === 'rate') rate(+b.dataset.r);
  else if (a === 'say') say();
  else if (a === 'sayex') say(byId[cur.split('|')[0]].ex);
  else if (a === 'more') { const d = dayInfo(); d.extra = (d.extra || 0) + 10; LS.set(K('day'), d); render(pick()); }
});
document.addEventListener('keydown', e => {
  if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.metaKey || e.ctrlKey || e.altKey) return;
  if (!cur) return;
  if (!shown && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); show(); }
  else if (shown && /^[1-4]$/.test(e.key)) rate(+e.key);
  else if (shown && e.key === ' ') { e.preventDefault(); rate(3); }
});
$('levels').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  const l = b.dataset.l;
  cfg.levels = cfg.levels.includes(l) ? cfg.levels.filter(x => x !== l) : LV.filter(x => x === l || cfg.levels.includes(x));
  saveCfg(); render(pick());
});
$('topics').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; cfg.theme = b.dataset.t; saveCfg(); render(pick()); });
$('dirs').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; cfg.dir = b.dataset.d; saveCfg(); render(pick()); });
$('sizes').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; cfg.perDay = +b.dataset.n; saveCfg(); render(pick()); });
$('browse').addEventListener('toggle', () => { if ($('browse').open) renderBrowse(); });
$('q').addEventListener('input', renderBrowse);

/* ---------- import ---------- */
$('ilevel').innerHTML = LEVELS.map(l => `<option value="${l.code}" ${l.code === 'B1' ? 'selected' : ''}>${l.code} · ${l.en} · ${l.ru}</option>`).join('');
$('ifile').addEventListener('change', async () => { const f = $('ifile').files[0]; if (f) $('itext').value = await f.text(); });
$('ido').addEventListener('click', () => {
  const got = parseTSV($('itext').value, $('ilevel').value, 'import');
  if (!got.length) { $('imsg').textContent = `No cards found. Each line needs the ${VC.lang === 'de' ? 'German' : 'Russian'} word, a tab, then English.`; return; }
  const custom = LS.get(K('custom'), []), ids = new Set(custom.map(c => c.id));
  let added = 0; got.forEach(c => { if (!ids.has(c.id) && !byId[c.id]) { custom.push(c); added++; } });
  LS.set(K('custom'), custom);
  setCards(cards.concat(custom));
  $('imsg').textContent = `Imported ${added} new cards${got.length - added ? ` (${got.length - added} were already here)` : ''}. They are under the theme “${THEMES.imported}”.`;
  $('itext').value = ''; render(pick());
});
$('iclear').addEventListener('click', () => {
  const custom = LS.get(K('custom'), []);
  if (!custom.length) { $('imsg').textContent = 'There are no imported cards.'; return; }
  if ($('iclear').dataset.sure !== '1') { $('iclear').dataset.sure = '1'; $('iclear').textContent = `Tap again to remove ${custom.length} cards`; return; }
  LS.set(K('custom'), []); $('iclear').dataset.sure = ''; $('iclear').textContent = 'Remove imported cards';
  setCards(cards.filter(c => c.src !== 'import')); $('imsg').textContent = 'Imported cards removed. Your built-in decks and their progress are unchanged.';
  render(pick());
});

/* ---------- export to Anki ---------- */
const XCOLS = ['term', 'language', 'kind', 'category', 'article', 'gender', 'forms', 'grammar', 'meaning_en', 'example_target', 'example_en', 'common_mistake', 'register', 'cefr', 'frequency', 'notes', 'ipa', 'image', 'audio', 'audio_sentence', 'voice', 'headword', 'partner_word', 'id', 'tags'];
function exportAnki(which) {
  const rows = [];
  cards.forEach(c => {
    const ss = ['r', 'p'].map(d => srs[c.id + '|' + d]).filter(Boolean);
    if (!ss.length && !(which === 'mine' && c.src === 'import')) return;
    const hard = ss.some(s => s.lap > 0 || s.ease < 2.3), learned = ss.length && ss.every(s => s.q === 'review');
    if (which === 'hard' && !hard) return;
    if (which === 'mine' && c.src !== 'import') return;
    const r = Object.assign({ term: c.term, language: VC.lang, kind: c.kind, category: c.cat, gender: c.gender, forms: c.forms, grammar: c.grammar, meaning_en: c.meaning, example_target: c.ex, example_en: c.exEn, common_mistake: c.mistake, register: '', cefr: c.level, notes: c.notes, ipa: c.ipa, voice: VC.lang === 'de' ? 'de_DE' : 'ru_RU', id: c.id }, c.raw || {});
    r.tags = [...new Set(String(r.tags || '').split(/\s+/).filter(Boolean).concat(['grammar-app', learned ? 'learned' : ss.length ? 'learning' : 'new'], hard ? ['hard'] : []))].join(' ');
    rows.push(XCOLS.map(k => String(r[k] == null ? '' : r[k]).replace(/[\t\n\r]+/g, ' ')).join('\t'));
  });
  if (!rows.length) { $('xmsg').textContent = which === 'hard' ? 'No hard words yet: a word counts as hard once you have pressed Again on it after learning it.' : which === 'mine' ? 'You have not added any words of your own yet. Tap a word in any exercise to add it.' : 'Practise some flashcards first: only words you have seen are exported.'; return; }
  const head = ['#separator:tab', '#html:true', '#notetype:Vocab', '#deck:Languages::' + (VC.lang === 'de' ? 'German' : 'Russian'), '#guid column:24', '#tags column:25', '#columns:' + XCOLS.join('\t')];
  const blob = new Blob([head.concat(rows).join('\n') + '\n'], { type: 'text/tab-separated-values' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); { const t = new Date(); a.download = `${VC.lang === 'de' ? 'german' : 'russian'}-${which}-${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}.tsv`; }
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  $('xmsg').textContent = `Exported ${rows.length} card${rows.length > 1 ? 's' : ''}. Cards with the same id update the ones already in Anki instead of making copies.`;
}
$('xall').addEventListener('click', () => exportAnki('all'));
$('xhard').addEventListener('click', () => exportAnki('hard'));
$('xmine').addEventListener('click', () => exportAnki('mine'));

/* ---------- start ---------- */
render();
Promise.all(DECKS.map(u => fetch(u).then(r => { if (!r.ok) throw new Error(u); return r.text(); })))
  .then(texts => {
    const base = texts.flatMap((t, i) => parseTSV(t, 'B1', 'deck' + i));
    setCards(base.concat(LS.get(K('custom'), [])));
    render(pick());
  })
  .catch(() => { $('card').innerHTML = '<div class="done"><p>The word lists couldn’t be loaded. Check your connection and reload the page.</p></div>'; });
if ('speechSynthesis' in window) speechSynthesis.getVoices();
try { if ('serviceWorker' in navigator && location.protocol === 'https:') addEventListener('load', () => navigator.serviceWorker.register(((window.GR_L && window.GR_L.root) || '../') + 'sw.js', { scope: (window.GR_L && window.GR_L.root) || '../' }).catch(() => {})); } catch (e) {}
}
