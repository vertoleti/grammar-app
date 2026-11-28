// Builds shared/catalog.js: every line, its topics, their CEFR levels and sentence counts.
// The home page and the coach read it. Run from the repo root after changing any data:  node tools/build_catalog.js
const fs = require('fs');
const LINES = [
  { id: 'vom', href: 'verbs-of-motion/', n: 1, c: '#d4202c', ru: 'Глаголы движения', en: 'Verbs of motion', d: 'Pick the verb, then the form', group: 'verbs' },
  { id: 'aspect', href: 'aspect/', n: 3, c: '#0a68b0', ru: 'Вид глагола', en: 'Verb aspect', d: 'Imperfective or perfective, then the form', group: 'verbs', src: 'aspect' },
  { id: 'cases', href: 'cases/', n: 2, c: '#1f8a3b', ru: 'Падежи', en: 'Cases', d: 'Pick the case, then the form', group: 'nouns', src: 'cases' },
  { id: 'prep', href: 'prep/', n: 7, c: '#8d5b2d', ru: 'Предлоги', en: 'Prepositions', d: 'Pick the preposition, then the case form', group: 'nouns', src: 'prep' },
  { id: 'numbers', href: 'numbers/', n: 4, c: '#c25e00', ru: 'Числа', en: 'Numbers', d: '1, 2–4, 5+: age, time, money, quantity', group: 'nouns', src: 'numbers' },
  { id: 'compare', href: 'compare/', n: 8, c: '#c2185b', ru: 'Сравнение и краткие формы', en: 'Comparison and short forms', d: 'Comparatives, superlatives, short adjectives, adverbs', group: 'adj', src: 'compare' },
  { id: 'advanced', href: 'advanced/', n: 5, c: '#7a2a8c', ru: 'Продвинутый уровень', en: 'Advanced grammar', d: 'Participles, verbal adverbs, -ся verbs, бы and чтобы', group: 'adv', src: 'advanced' },
  { id: 'read', href: 'reading/', n: 12, c: '#00796b', ru: 'Чтение', en: 'Reading', d: 'Graded texts with questions, your own texts, speaking', group: 'practice', practice: 'reading', dir: 'reading' },
  { id: 'gov', href: 'gov/', n: 11, c: '#9a7b00', ru: 'Управление', en: 'Government', d: 'Cases after verbs and formal prepositions (B2–C2)', group: 'adv', src: 'gov' },
  { id: 'sent', href: 'sentences/', n: 9, c: '#3949ab', ru: 'Предложения', en: 'Sentences', d: 'Translate, word order, dictation, find the mistake', group: 'practice', practice: 'sentences' },
  { id: 'tables', href: 'tables/', n: 10, c: '#5d7a00', ru: 'Таблицы', en: 'Tables', d: 'Fill in conjugation and declension tables', group: 'practice', practice: 'tables' },
  { id: 'voc', href: 'vocabulary/', n: 6, c: '#00897b', ru: 'Словарь', en: 'Vocabulary', d: 'Anki-style flashcards with spaced repetition', group: 'vocab', vocab: true }
];
const out = [];
for (const L of LINES) {
  const line = Object.assign({}, L);
  delete line.src;
  if (L.src) {
    const window = {};
    new Function('window', fs.readFileSync(`${L.src}/data.js`, 'utf8'))(window);
    const E = window.EXERCISE, cnt = {};
    E.items.forEach(q => { cnt[q.t] = (cnt[q.t] || 0) + 1; });
    line.topics = Object.keys(E.topics).map(k => ({ k, name: E.topics[k], lv: E.levels[k], count: cnt[k] || 0 }));
    line.total = E.items.length;
  } else if (L.id === 'vom') {
    const h = fs.readFileSync('verbs-of-motion/index.html', 'utf8');
    const top = eval('(' + h.match(/const TOP=(\{[^\n]*?\});/)[1] + ')');
    const tlv = eval('(' + h.match(/const TLV=(\{[^\n]*?\});/)[1] + ')');
    const rows = h.match(/const DATA=`([\s\S]*?)`;/)[1].split('\n').filter(Boolean), cnt = {};
    rows.forEach(r => { const t = r.split('|')[0]; cnt[t] = (cnt[t] || 0) + 1; });
    line.topics = Object.keys(tlv).map(k => ({ k, name: top[k], lv: tlv[k], count: cnt[k] || 0 }));
    line.total = rows.length;
  } else if (L.practice === 'reading') {
    const W = {}; new Function('window', fs.readFileSync(`${L.dir}/texts.js`, 'utf8'))(W);
    line.modes = [{ k: 'reading', name: 'Reading' }, { k: 'speaking', name: 'Speaking' }]; line.total = W.TEXTS.length; line.unit = 'texts';
    line.levels = {}; W.TEXTS.forEach(t => { line.levels[t.lv] = (line.levels[t.lv] || 0) + 1; });
  } else if (L.practice === 'sentences') {
    const window = {}; new Function('window', fs.readFileSync('sentences/data.js', 'utf8'))(window);
    const D = window.SENTENCES;
    line.modes = [{ k: 'tr', name: 'Перевод · Translate' }, { k: 'order', name: 'Порядок слов · Word order' }, { k: 'dict', name: 'Диктант · Dictation' }, { k: 'err', name: 'Найди ошибку · Find the mistake' }];
    line.total = D.S.length + D.M.length; line.unit = 'sentences';
    line.levels = {}; [...D.S, ...D.M].forEach(x => { line.levels[x[0]] = (line.levels[x[0]] || 0) + 1; });
  } else if (L.practice === 'tables') {
    const window = {}; new Function('window', fs.readFileSync('tables/data.js', 'utf8'))(window);
    const D = window.TABLES;
    line.modes = [{ k: 'pres', name: 'Спряжение · Present and future' }, { k: 'past', name: 'Прошедшее время · Past tense' }, { k: 'noun', name: 'Склонение · Nouns' }, { k: 'pron', name: 'Местоимения · Pronouns' }];
    line.total = D.V.length + D.N.length + 1; line.unit = 'verbs, nouns and pronouns';
    line.levels = {}; [...D.V, ...D.N].forEach(x => { line.levels[x[0]] = (line.levels[x[0]] || 0) + 1; });
  } else if (L.practice === 'genus') {
    const W = {}; new Function('window', fs.readFileSync(`${L.dir}/data.js`, 'utf8'))(W);
    line.modes = [{ k: 'genus', name: 'der · die · das' }]; line.levels = {}; line.total = 0; line.unit = 'nouns';
    Object.values(W.GENUS).forEach(g => Object.entries(g).forEach(([l, t]) => { const n = t.trim().split('\n').length; line.levels[l] = (line.levels[l] || 0) + n; line.total += n; }));
  } else if (L.vocab) {
    const lv = {};
    ['vocabulary/decks/ru-core.tsv', 'vocabulary/decks/ru-levels.tsv'].forEach(f => fs.readFileSync(f, 'utf8').split('\n').filter(l => l && !l.startsWith('#')).forEach(l => { const c = l.split('\t')[13]; lv[c] = (lv[c] || 0) + 1; }));
    line.levels = lv;
    line.total = Object.values(lv).reduce((a, b) => a + b, 0);
  }
  out.push(line);
}
fs.writeFileSync('shared/catalog.js', '/* Generated by tools/build_catalog.js. Do not edit by hand. */\nwindow.CATALOG = ' + JSON.stringify(out, null, 1) + ';\n');
const g = out.filter(x => x.topics);
console.log('lines', out.length, 'grammar topics', g.reduce((a, x) => a + x.topics.length, 0), 'grammar sentences', g.reduce((a, x) => a + x.total, 0));

// ---------- German: shared/catalog-de.js ----------
const DE = [
  { id: 'de-verbs', href: 'verbs/', n: 1, c: '#0a68b0', ru: 'Verben & Zeiten', en: 'Verbs and tenses', d: 'Present, modals, Perfekt, participles, Präteritum', group: 'verbs', src: 'de/verbs' },
  { id: 'de-cases', href: 'cases/', n: 2, c: '#1f8a3b', ru: 'Fälle & Artikel', en: 'Cases and articles', d: 'Nominative, accusative, dative, genitive', group: 'nouns', src: 'de/cases' },
  { id: 'de-prep', href: 'prep/', n: 3, c: '#8d5b2d', ru: 'Präpositionen', en: 'Prepositions', d: 'Which case after which preposition', group: 'nouns', src: 'de/prep' },
  { id: 'de-adj', href: 'adj/', n: 4, c: '#c2185b', ru: 'Adjektivendungen', en: 'Adjective endings', d: 'Weak, mixed and strong declension', group: 'adj', src: 'de/adj' },
  { id: 'de-conn', href: 'conn/', n: 5, c: '#c25e00', ru: 'Satzbau & Konnektoren', en: 'Word order and connectors', d: 'weil, denn, deshalb: where the verb goes', group: 'syntax', src: 'de/conn' },
  { id: 'de-konj', href: 'konj/', n: 6, c: '#7a2a8c', ru: 'Konjunktiv II & Passiv', en: 'Subjunctive and passive', d: 'würde, hätte, wäre; wird gebaut, wurde gebaut', group: 'adv', src: 'de/konj' },
  { id: 'de-adv', href: 'adv/', n: 7, c: '#9a7b00', ru: 'Fortgeschritten', en: 'Advanced grammar', d: 'Konjunktiv I, verbs with prepositions, participles (B2–C2)', group: 'adv', src: 'de/adv' },
  { id: 'de-sent', href: 'saetze/', n: 8, c: '#3949ab', ru: 'Sätze', en: 'Sentences', d: 'Translate, word order, dictation, find the mistake', group: 'practice', practice: 'sentences', dir: 'de/saetze' },
  { id: 'de-tables', href: 'tabellen/', n: 9, c: '#5d7a00', ru: 'Tabellen', en: 'Tables', d: 'Fill in conjugation and declension tables', group: 'practice', practice: 'tables', dir: 'de/tabellen' },
  { id: 'de-read', href: 'reading/', n: 12, c: '#00796b', ru: 'Lesen', en: 'Reading', d: 'Graded texts with questions, your own texts, speaking', group: 'practice', practice: 'reading', dir: 'de/reading' },
  { id: 'de-genus', href: 'genus/', n: 11, c: '#1f8a3b', ru: 'der · die · das', en: 'Noun genders', d: 'A fast drill for the article of 275 common nouns', group: 'practice', practice: 'genus', dir: 'de/genus' },
  { id: 'de-voc', href: 'vocabulary/', n: 10, c: '#00897b', ru: 'Wortschatz', en: 'Vocabulary', d: 'Flashcards with spaced repetition', group: 'vocab', vocab: true, decks: ['de/vocabulary/decks/de-core.tsv'] }
];
const LINESJS = fs.readFileSync('shared/lines.js', 'utf8');
const de = [];
for (const L of DE) {
  const line = Object.assign({}, L); delete line.src; delete line.dir; delete line.decks;
  if (L.src) {
    const W = {}; new Function('window', LINESJS)(W);
    new Function('window', 'buildLine', fs.readFileSync(`${L.src}/data.js`, 'utf8'))(W, W.buildLine);
    const E = W.EXERCISE, cnt = {};
    E.items.forEach(q => { cnt[q.t] = (cnt[q.t] || 0) + 1; });
    line.topics = Object.keys(E.topics).map(k => ({ k, name: E.topics[k], lv: E.levels[k], count: cnt[k] || 0 }));
    line.total = E.items.length;
  } else if (L.practice === 'reading') {
    const W = {}; new Function('window', fs.readFileSync(`${L.dir}/texts.js`, 'utf8'))(W);
    line.modes = [{ k: 'reading', name: 'Reading' }, { k: 'speaking', name: 'Speaking' }]; line.total = W.TEXTS.length; line.unit = 'texts';
    line.levels = {}; W.TEXTS.forEach(t => { line.levels[t.lv] = (line.levels[t.lv] || 0) + 1; });
  } else if (L.practice === 'sentences') {
    const W = {}; new Function('window', fs.readFileSync(`${L.dir}/data.js`, 'utf8'))(W);
    const D = W.SENTENCES;
    line.modes = [{ k: 'tr', name: 'Übersetzen · Translate' }, { k: 'order', name: 'Satzbau · Word order' }, { k: 'dict', name: 'Diktat · Dictation' }, { k: 'err', name: 'Fehler finden · Find the mistake' }];
    line.total = D.S.length + D.M.length; line.unit = 'sentences';
    line.levels = {}; [...D.S, ...D.M].forEach(x => { line.levels[x[0]] = (line.levels[x[0]] || 0) + 1; });
  } else if (L.practice === 'tables') {
    const W = {}; new Function('window', fs.readFileSync(`${L.dir}/data.js`, 'utf8'))(W);
    const D = W.TABLES;
    line.modes = Object.keys(D.TOP).filter(k => k !== 'smart').map(k => ({ k, name: D.TOP[k] }));
    line.total = D.T.length; line.unit = 'tables';
    line.levels = {}; D.T.forEach(x => { line.levels[x.lv] = (line.levels[x.lv] || 0) + 1; });
  } else if (L.vocab) {
    const lv = {};
    L.decks.forEach(f => fs.readFileSync(f, 'utf8').split('\n').filter(l => l && !l.startsWith('#')).forEach(l => { const c = l.split('\t')[13]; lv[c] = (lv[c] || 0) + 1; }));
    line.levels = lv; line.total = Object.values(lv).reduce((a, b) => a + b, 0);
  }
  de.push(line);
}
fs.writeFileSync('shared/catalog-de.js', '/* Generated by tools/build_catalog.js. Do not edit by hand. */\nwindow.CATALOG = ' + JSON.stringify(de, null, 1) + ';\n');
const dg = de.filter(x => x.topics);
console.log('German lines', de.length, 'grammar topics', dg.reduce((a, x) => a + x.topics.length, 0), 'grammar sentences', dg.reduce((a, x) => a + x.total, 0));
