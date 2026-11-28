/* Builds window.EXERCISE from a compact text table. One item per line:
   topic|sentence with ___|English|hint|choices|answer|forms|form answer|rule|signal|note|level
   - choices: step-1 option kinds separated by ; (empty = spec.kinds)
   - answer: the right kind (name or index)
   - forms: candidate forms separated by ; . If spec.parallel is set, forms follow spec.kinds order
     and the right form is the one at the answer's position, unless "form answer" says otherwise.
   - level: optional, overrides spec.levels[topic]. Lines starting with # are comments. */
window.buildLine = function (spec) {
  const items = [];
  spec.data.split('\n').forEach((l, n) => {
    l = l.trim(); if (!l || l[0] === '#') return;
    const f = l.split('|');
    if (f.length < 9) { console.warn('line', n, 'has', f.length, 'fields:', l); return; }
    const [t, ru, en, hint, ch, ans, forms, fa, rule, cue, note, lv] = f.map(x => (x || '').trim());
    const kinds = ch ? ch.split(';').map(s => s.trim()) : spec.kinds;
    const a1 = /^\d+$/.test(ans) ? +ans : kinds.indexOf(ans);
    const fl = forms.split(';').map(s => s.trim());
    const a2 = fa !== '' ? (/^\d+$/.test(fa) ? +fa : fl.indexOf(fa)) : spec.parallel ? a1 : 0;
    if (a1 < 0 || a2 < 0 || a2 >= fl.length) console.warn('bad answer on line', n, l);
    const q = { t, ru, en, hint, o1: kinds.map(k => ({ kind: k })), a1, forms: fl, a2, rule, cue, note, tag: '' };
    if (lv) q.lv = lv;
    if (spec.parallel && spec.labels) q.labels = kinds.map(k => spec.opts[k].name.split(' · ')[0]);
    q.fnote = spec.fnote ? spec.fnote(q) : '';
    items.push(q);
  });
  window.EXERCISE = Object.assign({}, spec, { items, data: undefined });
  return window.EXERCISE;
};
