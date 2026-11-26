/* Builds one combined exercise from every line's data (window.ALL, filled by the page),
   for the Daily mix and the placement test. Verbs of motion is not included: its forms are
   generated on its own page. */
(function () {
  const ALL = window.ALL || [], CAT = window.CATALOG || [], COACH = window.GRCoach;
  const shuf = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const items = [], opts = {}, rules = {}, topics = {};
  ALL.forEach(E => {
    const line = CAT.find(c => c.id === E.id) || { ru: E.id, en: '' };
    topics[E.id] = `${line.ru} · ${line.en}`;
    Object.entries(E.opts).forEach(([k, v]) => { opts[E.id + ':' + k] = v; });
    Object.entries(E.rules).forEach(([k, v]) => { rules[E.id + ':' + k] = v; });
    E.items.forEach(q => items.push(Object.assign({}, q, {
      ex: E.id, ot: q.t, t: E.id, lv: q.lv || E.levels[q.t], tname: E.topics[q.t], line: line.ru,
      rule: E.id + ':' + q.rule, o1: q.o1.map(o => ({ label: o.label, kind: E.id + ':' + o.kind })),
      gp: !!E.gapPrefix, two: !!E.twoStepOnly, s1: E.step1, s1s: E.step1Short, ko: !!E.keepOrder1
    })));
  });
  const label = q => `${q.line}: ${q.tname}`;
  const ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  function mixPick(want, seen, level) {
    const out = [], ids = ALL.map(E => E.id);
    // 1. grammar mistakes that are due come first (up to a third of the round)
    const due = [];
    ids.forEach(id => { const d = new Set(COACH.dueReviews(id)); items.forEach((q, k) => { if (q.ex === id && d.has(q.ru)) due.push(k); }); });
    out.push(...shuf(due).slice(0, Math.ceil(want / 3)));
    // 2. then one recommended question per line in turn, lines with most to learn first
    const open = id => { const s = COACH.stats(id); return [...new Set(items.filter(q => q.ex === id).map(q => q.ot))].filter(t => !COACH.solid(COACH.state(id, t, s).st)).length; };
    const order = ids.slice().sort((a, b) => open(b) - open(a));
    let i = 0, guard = 0;
    while (out.length < want && guard++ < want * 6) {
      const id = order[i++ % order.length];
      const sub = items.map((q, k) => k).filter(k => items[k].ex === id && !out.includes(k));
      const r = COACH.smartPick(id, sub.map(k => Object.assign({}, items[k], { t: items[k].ot })), 1, seen, level);
      if (r.picks.length) out.push(sub[r.picks[0]]);
    }
    return { picks: shuf(out) };
  }
  function flashcardsDue() {
    let n = 0; try { const s = JSON.parse(localStorage.getItem('voc-srs') || '{}'), end = new Date(); end.setHours(23, 59, 59, 999); Object.values(s).forEach(v => { if (v.due <= end.getTime()) n++; }); } catch (e) {}
    return n;
  }

  window.buildMix = function () {
    window.EXERCISE = {
      id: 'mix', multi: true, step1: 'Which rule?', step1Short: 'Rule', scoreLabel: 'Rules right', smartName: 'Ежедневно · Daily mix',
      topics, levels: {}, opts, rules, items, label, pick: mixPick,
      after() { const n = flashcardsDue(); return n ? `<p class="coachline">You also have ${n} flashcard${n > 1 ? 's' : ''} due today. <a href="../vocabulary/">Review them →</a></p>` : ''; }
    };
  };

  // ---------- placement test ----------
  const PER = 4, LEVELS = ['A1', 'A2', 'B1', 'B2'];
  function placePick() {
    const out = [];
    LEVELS.forEach(l => {
      const pool = shuf(items.map((q, k) => k).filter(k => items[k].lv === l && !items[k].two));
      const seenT = new Set(), got = [];
      pool.forEach(k => { const key = items[k].ex + items[k].ot; if (got.length < PER && !seenT.has(key)) { seenT.add(key); got.push(k); } });
      pool.forEach(k => { if (got.length < PER && !got.includes(k)) got.push(k); });
      out.push(...got);
    });
    return { picks: out };
  }
  function placeEnd(qs, res) {
    const per = {};
    qs.forEach((q, i) => { (per[q.lv] = per[q.lv] || { n: 0, ok: 0 }); per[q.lv].n++; if (res[i] && res[i].a && res[i].f) per[q.lv].ok++; });
    let placed = null;
    for (const l of LEVELS) { const p = per[l]; if (p && p.ok / p.n >= 0.75) placed = l; else break; }
    const next = placed ? ORDER[Math.min(ORDER.indexOf(placed) + 1, ORDER.length - 1)] : 'A1';
    window.__placed = { placed, next };
    const rows = LEVELS.map(l => { const p = per[l] || { n: 0, ok: 0 }; const pass = p.n && p.ok / p.n >= 0.75; return `<li><span>${l}</span><span class="mstate" data-st="${pass ? 'mastered' : p.ok ? 'weak' : 'new'}"><b>${p.ok} of ${p.n}</b> · ${pass ? 'solid' : 'not yet'}</span></li>`; }).join('');
    return `<p class="meta"><span>Placement test · Тест на уровень</span></p>
<p class="big">${placed || 'A1'}</p>
<p>${placed ? `Your grammar is solid up to <b>${placed}</b>. The app will start you on <b>${next}</b> and treat the topics up to ${placed} as known, so you don’t repeat what you already know.` : 'Start at A1: the basics need a little work first. The coach will move you up as soon as they are solid.'}</p>
<ul class="mlist">${rows}</ul>
<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:16px"><button class="btn go" id="accept" onclick="window.acceptPlacement()">Start at ${next}</button><a class="btn" href="../">Back home without changes</a></div>`;
  }
  window.acceptPlacement = function () {
    const p = window.__placed || { placed: null, next: 'A1' };
    try {
      localStorage.setItem('gr-level', JSON.stringify(p.next));
      const v = JSON.parse(localStorage.getItem('voc-settings') || '{}'); v.levels = [p.next]; localStorage.setItem('voc-settings', JSON.stringify(v));
      if (p.placed) {
        const upTo = ORDER.indexOf(p.placed);
        CAT.filter(L => L.topics).forEach(L => {
          const key = L.id + '-stats', s = JSON.parse(localStorage.getItem(key) || '{}'); let ch = false;
          L.topics.forEach(t => { if (ORDER.indexOf(t.lv) <= upTo && !(s[t.k] && s[t.k].n)) { s[t.k] = { n: 7, ok: 6, r: '1111110', t: Date.now(), placed: true }; ch = true; } });
          if (ch) localStorage.setItem(key, JSON.stringify(s));
        });
      }
      localStorage.setItem('gr-placed', JSON.stringify({ at: Date.now(), level: p.placed || '' }));
    } catch (e) {}
    location.href = '../';
  };
  window.buildPlacement = function () {
    window.EXERCISE = {
      id: 'placement', multi: true, step1: 'Which rule?', step1Short: 'Rule', smartName: 'Тест на уровень · Placement test',
      topics, levels: {}, opts, rules, items, label, pick: placePick, keepOrder: true, lockTopic: true, end: placeEnd
    };
  };
})();
