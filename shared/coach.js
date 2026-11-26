/* The coach: remembers how you do on every topic, decides when a topic is mastered,
   builds "Recommended" rounds that skip what you already know and bring in the next level,
   and tells you what to do next. Stats live in localStorage as "<exercise>-stats". */
(function () {
  const ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const KEEP = 12;            // remember the last 12 answers per topic
  const MASTER = 0.85, GOOD = 0.65, MIN_MASTER = 8;
  const get = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  function stats(id) { return get(id + '-stats', {}); }
  function record(id, topic, ok) {
    const s = stats(id), t = s[topic] || { n: 0, ok: 0, r: '' };
    t.n++; if (ok) t.ok++;
    t.r = (t.r + (ok ? '1' : '0')).slice(-KEEP);
    t.t = Date.now();
    s[topic] = t; set(id + '-stats', s);
  }
  // state of one topic: new, started (too few answers), weak, good, mastered
  function state(id, topic, s) {
    const t = (s || stats(id))[topic];
    if (!t || !t.n) return { n: 0, pct: null, st: 'new' };
    const r = t.r || '', acc = r.length ? [...r].filter(c => c === '1').length / r.length : 0;
    const pct = Math.round(acc * 100);
    let st = r.length < 4 ? 'started' : acc >= MASTER && r.length >= MIN_MASTER ? 'mastered' : acc >= GOOD ? 'good' : 'weak';
    return { n: t.n, pct, st, last: t.t };
  }
  const solid = st => st === 'good' || st === 'mastered';
  const LABEL = { new: 'not started', started: 'just started', weak: 'needs work', good: 'good', mastered: 'mastered' };

  // topics present in a list of items, with their level (the most common level of their items)
  function topicsOf(items) {
    const m = {};
    items.forEach(q => { (m[q.t] = m[q.t] || {}); m[q.t][q.lv] = (m[q.t][q.lv] || 0) + 1; });
    return Object.entries(m).map(([t, lv]) => ({ t, lv: Object.entries(lv).sort((a, b) => b[1] - a[1])[0][0] }));
  }
  // which levels a recommended round may use: the chosen level, plus the next one once it is solid
  function frontier(id, items, level) {
    const s = stats(id), tops = topicsOf(items);
    const lvls = ORDER.filter(l => tops.some(x => x.lv === l));
    const solidAt = l => tops.filter(x => x.lv === l).every(x => solid(state(id, x.t, s).st));
    let base = level !== 'all' && lvls.includes(level) ? level : (lvls.find(l => !solidAt(l)) || lvls[lvls.length - 1]);
    const allowed = level === 'all' ? lvls.filter(l => ORDER.indexOf(l) <= ORDER.indexOf(base)) : [base];
    let up = null;
    if (solidAt(base)) { up = lvls.find(l => ORDER.indexOf(l) > ORDER.indexOf(base)) || null; if (up) allowed.push(up); }
    return { base, allowed, up };
  }
  // pick `want` item indices for a recommended round
  function smartPick(id, items, want, seen, level) {
    const s = stats(id), fr = frontier(id, items, level);
    const W = { weak: 4, started: 3, new: 2.5, good: 1.2, mastered: 0.15 };
    const pool = [];
    items.forEach((q, k) => {
      if (!fr.allowed.includes(q.lv)) return;
      const st = state(id, q.t, s).st;
      let w = W[st];
      if (fr.up && q.lv === fr.up) w *= 1.6;         // push towards the next level
      if (seen && seen.has(q.ru)) w *= 0.35;           // prefer sentences not seen yet
      pool.push({ k, w });
    });
    const out = [];
    while (out.length < want && pool.length) {
      const total = pool.reduce((a, b) => a + b.w, 0);
      let r = Math.random() * total, i = 0;
      while (i < pool.length - 1 && (r -= pool[i].w) > 0) i++;
      out.push(pool[i].k); pool.splice(i, 1);
    }
    return { picks: out, frontier: fr };
  }
  // what to do next inside one exercise
  function nextStep(id, items, names, level) {
    const s = stats(id), tops = topicsOf(items).map(x => Object.assign(x, state(id, x.t, s)));
    const weak = tops.filter(x => x.st === 'weak').sort((a, b) => a.pct - b.pct)[0];
    const fr = frontier(id, items, level);
    const fresh = tops.filter(x => x.st === 'new' && fr.allowed.includes(x.lv)).sort((a, b) => ORDER.indexOf(a.lv) - ORDER.indexOf(b.lv))[0];
    if (weak) return { kind: 'weak', topic: weak.t, text: `${names[weak.t]} needs work (${weak.pct}% right lately).` };
    if (fr.up && fresh && fresh.lv === fr.up) return { kind: 'up', topic: fresh.t, level: fr.up, text: `${fr.base} is solid here. Move on to ${fr.up}: ${names[fresh.t]}.` };
    if (fresh) return { kind: 'new', topic: fresh.t, text: `Next new topic: ${names[fresh.t]} (${fresh.lv}).` };
    if (fr.up) return { kind: 'up', level: fr.up, text: `${fr.base} is solid here. Move on to ${fr.up}.` };
    const notMastered = tops.filter(x => x.st !== 'mastered').sort((a, b) => (a.pct ?? 0) - (b.pct ?? 0))[0];
    if (notMastered) return { kind: 'polish', topic: notMastered.t, text: `Polish ${names[notMastered.t]} to master it.` };
    return { kind: 'done', text: 'Everything in this exercise is mastered. Try a harder line on the home page.' };
  }
  // estimate a CEFR level from a catalog of lines -> topics with levels
  function estimate(catalog) {
    const per = {};
    let answers = 0;
    catalog.filter(x => x.topics).forEach(line => {
      const s = stats(line.id);
      line.topics.forEach(tp => {
        const st = state(line.id, tp.k, s);
        answers += st.n;
        (per[tp.lv] = per[tp.lv] || { total: 0, solid: 0, mastered: 0, started: 0 });
        per[tp.lv].total++;
        if (solid(st.st)) per[tp.lv].solid++;
        if (st.st === 'mastered') per[tp.lv].mastered++;
        if (st.n) per[tp.lv].started++;
      });
    });
    let reached = null;
    for (const l of ORDER) { const p = per[l]; if (!p) continue; if (p.solid / p.total >= 0.7) reached = l; else break; }
    const working = ORDER.find(l => per[l] && (!reached || ORDER.indexOf(l) > ORDER.indexOf(reached))) || null;
    return { reached, working, per, answers };
  }
  window.GRCoach = { ORDER, LABEL, stats, record, state, solid, topicsOf, frontier, smartPick, nextStep, estimate };
})();
