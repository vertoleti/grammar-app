/* der / die / das trainer. Every noun has a box (0–5); low boxes come back more often. */
(function () {
  const G = window.GENUS, C = window.GRCoach, ID = 'de-genus';
  const $ = id => document.getElementById(id);
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const ART = { m: 'der', f: 'die', n: 'das' };
  const N = [];
  Object.entries(G).forEach(([g, lv]) => Object.entries(lv).forEach(([l, txt]) => txt.trim().split('\n').forEach(line => { const [w, pl, en] = line.split('|'); N.push({ w, pl, en, g, lv: l }); })));

  // Endings that predict the gender, checked in this order
  const RULES = [
    [/(chen|lein)$/, 'n', 'Nouns in -chen and -lein are always neuter.'],
    [/(ung|heit|keit|schaft|ion|tät|ei|ik|ur|ie)$/, 'f', w => `Nouns in -${(w.match(/(ung|heit|keit|schaft|ion|tät|ei|ik|ur|ie)$/) || [])[1]} are feminine.`],
    [/erin$/, 'f', 'Nouns for women in -in are feminine.'],
    [/(ment|um|ma)$/, 'n', w => `Most nouns in -${(w.match(/(ment|um|ma)$/) || [])[1]} are neuter.`],
    [/(ling|ismus|or|ig|ich|ant|ent|ist)$/, 'm', w => `Nouns in -${(w.match(/(ling|ismus|or|ig|ich|ant|ent|ist)$/) || [])[1]} are masculine.`],
    [/^(Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag|Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember|Frühling|Sommer|Herbst|Winter|Regen|Schnee|Wind)$/, 'm', 'Days, months, seasons and weather are masculine.'],
    [/e$/, 'f', 'Most nouns in -e are feminine (but not all: der Kollege, das Auge, der Käse).'],
    [/^(Ge)/, 'n', 'Many nouns starting with Ge- are neuter.']
  ];
  const ruleFor = x => { for (const [re, g, t] of RULES) if (re.test(x.w)) return { g, t: typeof t === 'function' ? t(x.w) : t, hit: g === x.g }; return null; };
  const ORDER = ['A1', 'A2', 'B1'];

  const box = LS.get('de-genus-box', {});
  let st = { level: LS.get('de-genus-level', 'all'), set: [], i: 0, res: [], picked: null };
  const pool = () => N.filter(x => st.level === 'all' || x.lv === st.level);
  function newRound() {
    const p = pool(), w = p.map(x => ({ x, w: [8, 5, 3, 2, 1, 0.5][Math.min(5, box[x.w] || 0)] * (box[x.w] === undefined ? 1.2 : 1) }));
    const out = []; while (out.length < 20 && w.length) { const tot = w.reduce((a, b) => a + b.w, 0); let r = Math.random() * tot, i = 0; while (i < w.length - 1 && (r -= w[i].w) > 0) i++; out.push(w[i].x); w.splice(i, 1); }
    st.set = out; st.i = 0; st.res = []; st.picked = null; render();
  }
  function answer(g) {
    const x = st.set[st.i]; if (!x || st.picked) return;
    const ok = g === x.g; st.picked = g; st.res[st.i] = ok;
    box[x.w] = ok ? Math.min(5, (box[x.w] || 0) + 1) : 0; LS.set('de-genus-box', box);
    if (C) C.record(ID, 'genus', ok, x.w);
    render();
    if (ok) setTimeout(() => { if (st.picked && st.set[st.i] === x) next(); }, 650);
  }
  function next() { st.i++; st.picked = null; render(); }

  function render() {
    const n = st.set.length, done = st.res.filter(r => r !== undefined), ok = done.filter(Boolean).length;
    $('score').innerHTML = `<div><b>${ok}/${done.length}</b><span>Right</span></div><div><b>${N.filter(x => (box[x.w] || 0) >= 3).length}</b><span>Known</span></div>`;
    $('track').innerHTML = `<div class="rail"><i style="width:${n ? Math.min(st.i, n) / n * 100 : 0}%"></i></div>`;
    $('lvls').innerHTML = ['all', ...ORDER].map(l => `<button data-l="${l}" aria-pressed="${st.level === l}">${l === 'all' ? 'All' : l}<small>${N.filter(x => l === 'all' || x.lv === l).length}</small></button>`).join('');
    const card = $('card');
    if (st.i >= n) {
      const miss = st.set.filter((x, i) => !st.res[i]);
      card.innerHTML = `<p class="meta"><span>Round complete</span></p><p class="big">${ok}/${n}</p>${miss.length ? `<h3 class="rh">To remember</h3><ul class="glist">${miss.map(x => `<li><b>${ART[x.g]} ${x.w}</b> <span>${x.en}</span></li>`).join('')}</ul>` : '<p>Every article right.</p>'}<div class="row" style="margin-top:16px"><button class="btn go" data-act="new">New round</button><a class="btn" href="../">All exercises</a></div>`;
      return;
    }
    const x = st.set[st.i], r = st.res[st.i], rule = ruleFor(x);
    const btn = g => { let c = ''; if (st.picked) { if (g === x.g) c = 'ok'; else if (g === st.picked) c = 'bad'; } return `<button class="art ${c}" data-g="${g}" ${st.picked ? 'disabled' : ''}>${ART[g]}</button>`; };
    card.innerHTML = `<div class="meta"><span>${st.picked ? x.lv : ''}</span><span>${st.i + 1} / ${n}</span></div>
<p class="gnoun" lang="de">${x.w}</p><p class="en">${x.en}</p>
<div class="arts">${btn('m')}${btn('f')}${btn('n')}</div>
${st.picked ? `<div class="fb"><p class="verdict ${r ? 'ok' : 'bad'}">${r ? '✓' : '✗'} <b>${ART[x.g]} ${x.w}</b>${x.pl !== '–' ? ` · die ${x.pl}` : ''}</p>${!r ? `<p class="why">${rule && rule.hit ? rule.t : rule ? `No reliable rule: ${rule.t.replace(/\.$/, '')}, yet this one is ${ART[x.g]}. Learn it with its article.` : 'No ending rule for this one: learn it with its article.'}</p>` : ''}${!r ? `<div class="dock"><span>${st.i + 1} / ${n}</span><button class="btn go" id="next" data-act="next">Next</button></div>` : ''}</div>` : ''}`;
    if (!r && st.picked && matchMedia('(hover:hover)').matches) { const b = $('next'); if (b) b.focus(); }
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('.art'); if (a && $('card').contains(a)) return answer(a.dataset.g);
    const b = e.target.closest('[data-act]'); if (!b) return;
    if (b.dataset.act === 'next') next(); else if (b.dataset.act === 'new') newRound();
  });
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    const k = { '1': 'm', '2': 'f', '3': 'n', r: 'm', e: 'f', s: 'n' }[e.key.toLowerCase()];
    if (k && !st.picked) answer(k); else if (e.key === 'Enter' && st.picked) next();
  });
  $('lvls').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; st.level = b.dataset.l; LS.set('de-genus-level', st.level); newRound(); });
  window.__gr = { noun: () => st.set[st.i] };   // used by the automated tests
  newRound();
})();
