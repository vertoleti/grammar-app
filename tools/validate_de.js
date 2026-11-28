// Checks every German grammar line: answers exist, signals appear in the sentence, rules and options exist.
const fs = require('fs');
const LINESJS = fs.readFileSync('shared/lines.js', 'utf8');
let bad = 0, total = 0;
for (const id of ['cases', 'adj', 'verbs', 'prep', 'conn', 'konj', 'adv']) {
  const W = {}, warn = []; const con = { warn: (...a) => warn.push(a.join(' ')) };
  new Function('window', 'console', LINESJS)(W, con);
  new Function('window', 'buildLine', fs.readFileSync(`de/${id}/data.js`, 'utf8'))(W, W.buildLine);
  const E = W.EXERCISE;
  warn.forEach(w => { bad++; console.log(id, 'WARN', w); });
  E.items.forEach((q, n) => {
    total++;
    const p = [];
    if ((q.ru.match(/___/g) || []).length !== 1) p.push('gap count');
    if (!E.topics[q.t]) p.push('topic ' + q.t);
    if (!E.rules[q.rule]) p.push('rule ' + q.rule);
    q.o1.forEach(o => { if (!E.opts[o.kind]) p.push('opt ' + o.kind); });
    if (q.a1 < 0 || q.a1 >= q.o1.length) p.push('a1');
    if (q.a2 < 0 || q.a2 >= q.forms.length) p.push('a2');
    if (q.cue && !q.ru.includes(q.cue)) p.push('cue "' + q.cue + '"');
    const lv = q.lv || E.levels[q.t]; if (!/^[ABC][12]$/.test(lv)) p.push('level ' + lv);
    if (new Set(q.forms).size < 2) p.push('only one distinct form');
    if (p.length) { bad++; console.log(id, n, p.join(', '), '|', q.ru); }
  });
  console.log(id, E.items.length, 'items');
}
const S = {}; new Function('window', fs.readFileSync('de/saetze/data.js', 'utf8'))(S);
S.SENTENCES.M.forEach(m => { const n = (m[1].match(/\{/g) || []).length, [w, r] = m[1].match(/\{([^}]*)\}/)[1].split('|'); if (n !== 1 || w === r) { bad++; console.log('M', m[1]); } });
const T = {}; new Function('window', fs.readFileSync('de/tabellen/data.js', 'utf8'))(T);
T.TABLES.T.forEach(t => t.rows.forEach(r => { if (r.cells.length !== t.cols.length - 1) { bad++; console.log('table', t.key, r.h); } }));
console.log('total', total, 'sentences', S.SENTENCES.S.length, 'mistakes', S.SENTENCES.M.length, 'tables', T.TABLES.T.length, 'problems', bad);
