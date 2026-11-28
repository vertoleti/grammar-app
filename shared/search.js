/* Search everything for one language from the home page: grammar rules, words, texts, exercises,
   phrasebook situations and writing tasks. Opens as a full-screen panel; data loads on first use. */
(function () {
  const H = window.HUB, L = H.code, R = H.code === 'de' ? '../' : '';
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fold = s => String(s || '').replace(/<[^>]+>/g, '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ё/g, 'е').replace(/ß/g, 'ss');
  const loadJS = src => new Promise(res => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = res; document.head.appendChild(s); });
  const DECKS = L === 'de' ? ['vocabulary/decks/de-core.tsv'] : ['vocabulary/decks/ru-core.tsv', 'vocabulary/decks/ru-levels.tsv'];
  let data = null, loading = null;

  function load() {
    if (loading) return loading;
    loading = Promise.all([
      loadJS(R + `shared/search-${L}.js`),
      window.PHRASES ? null : loadJS('phrases/data.js'),
      window.WRITING ? null : loadJS('writing/tasks.js'),
      Promise.all(DECKS.map(d => fetch(d).then(r => r.ok ? r.text() : '').catch(() => '')))
    ]).then(([, , , decks]) => {
      const words = [];
      decks.forEach(t => { let cols = null; t.split('\n').forEach(l => { if (l.startsWith('#columns:')) cols = l.slice(9).split('\t'); else if (cols && l && !l.startsWith('#')) { const f = l.split('\t'), c = {}; cols.forEach((n, i) => c[n] = f[i] || ''); if (c.term) words.push({ t: c.term, m: c.meaning_en.replace(/<[^>]+>/g, ''), lv: c.cefr }); } }); });
      try { (JSON.parse(localStorage.getItem(H.vp + 'custom') || '[]')).forEach(c => words.push({ t: c.term, m: c.meaning, lv: 'mine' })); } catch (e) {}
      const lines = [];
      (window.CATALOG || []).forEach(x => {
        lines.push({ t: x.ru, s: `${x.en}${x.d ? ' · ' + x.d : ''}`, h: x.href, k: fold(`${x.ru} ${x.en} ${x.d || ''}`) });
        (x.topics || []).forEach(tp => lines.push({ t: tp.name.split(' · ')[0], s: `${x.en} · ${tp.lv}`, h: `${x.href}#${tp.k}`, k: fold(`${tp.name} ${x.en}`) }));
      });
      data = {
        rules: (window.SEARCH_GUIDE || []).map(g => ({ t: g.t, s: g.c ? `${g.c} · ${g.s}` : g.s, h: `grammar/#${g.id}`, k: fold(`${g.t} ${g.t} ${g.c} ${g.x}`), kt: fold(g.t) })),
        words: words.map(w => ({ t: w.t, s: `${w.m}${w.lv ? ' · ' + w.lv : ''}`, h: `dictionary/#${encodeURIComponent(w.t.replace(/́/g, ''))}`, k: fold(`${w.t} ${w.m}`), kt: fold(w.t), lang: L })),
        texts: (window.TEXTS || []).map(t => ({ t: t.title, s: `${t.series ? t.series + ' · ' : ''}${t.lv} · ${t.en}`, h: `reading/#t=${t.id}`, k: fold(`${t.title} ${t.en} ${(t.p || []).map(p => Array.isArray(p) ? p.join(' ') : p).join(' ')}`), kt: fold(t.title + ' ' + t.en), lang: L })),
        phrases: (window.PHRASES || []).flatMap(s => [{ t: s.title, s: `${s.lv} · ${s.en}`, h: `phrases/#s=${s.id}`, k: fold(`${s.title} ${s.en}`), kt: fold(s.title + ' ' + s.en), lang: L }].concat(s.phrases.map(p => ({ t: p[0], s: `${p[1]} · ${s.en}`, h: `phrases/#s=${s.id}`, k: fold(p.join(' ')), lang: L })))),
        writing: (window.WRITING || []).map(w => ({ t: w.title, s: `${w.lv} · ${w.en}`, h: `writing/#w=${w.id}`, k: fold(`${w.title} ${w.en} ${w.task}`), kt: fold(w.title + ' ' + w.en), lang: L })),
        lines
      };
    });
    return loading;
  }
  const GROUPS = [['words', 'Words'], ['rules', 'Grammar rules'], ['lines', 'Exercises'], ['texts', 'Texts'], ['phrases', 'Phrases'], ['writing', 'Writing tasks']];
  function run(q) {
    const terms = fold(q).split(/\s+/).filter(Boolean);
    if (!terms.length) { $('sres').innerHTML = `<p class="note">Search words, grammar rules, texts, phrases and exercises.<br>Try: <button class="slink" data-q="${L === 'de' ? 'Dativ' : 'genitive'}">${L === 'de' ? 'Dativ' : 'genitive'}</button> <button class="slink" data-q="${L === 'de' ? 'Bahnhof' : 'вокзал'}">${L === 'de' ? 'Bahnhof' : 'вокзал'}</button> <button class="slink" data-q="${L === 'de' ? 'weil' : 'aspect'}">${L === 'de' ? 'weil' : 'aspect'}</button></p>`; return; }
    if (!data) { $('sres').innerHTML = '<p class="note">Loading…</p>'; load().then(() => run($('sq').value)); return; }
    const score = x => { if (!terms.every(t => x.k.includes(t))) return -1; const kt = x.kt || fold(x.t); return 1 + (kt.startsWith(terms[0]) ? 3 : 0) + (terms.every(t => kt.includes(t)) ? 2 : 0) - Math.min(0.9, kt.length / 200); };
    let any = false;
    const html = GROUPS.map(([g, name]) => {
      const hits = data[g].map(x => [score(x), x]).filter(a => a[0] >= 0).sort((a, b) => b[0] - a[0]);
      if (!hits.length) return '';
      any = true;
      return `<h3 class="sh">${name} <small>${hits.length}</small></h3><ul class="nxl">${hits.slice(0, 5).map(([, x]) => `<li><a class="nx" href="${x.h}"><span class="nt"><b ${x.lang ? `lang="${x.lang}"` : ''}>${esc(x.t)}</b><small>${esc(x.s.length > 110 ? x.s.slice(0, 110) + '…' : x.s)}</small></span><span class="chev" aria-hidden="true"></span></a></li>`).join('')}</ul>${g === 'words' && hits.length > 5 ? `<p class="note"><a href="dictionary/#${encodeURIComponent(q)}">All ${hits.length} in the dictionary →</a></p>` : ''}`;
    }).join('');
    $('sres').innerHTML = any ? html : `<p class="note">Nothing found for “${esc(q)}”.</p>`;
  }
  function open() { $('srch').hidden = false; document.body.classList.add('noscroll'); $('sq').focus(); run($('sq').value); load(); }
  function close() { $('srch').hidden = true; document.body.classList.remove('noscroll'); }
  $('sbtn').addEventListener('click', open);
  $('sclose').addEventListener('click', close);
  let t = null;
  $('sq').addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => run($('sq').value), 120); });
  $('sres').addEventListener('click', e => { const b = e.target.closest('.slink'); if (b) { $('sq').value = b.dataset.q; run(b.dataset.q); } });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('srch').hidden) close();
    if ((e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) && $('srch').hidden && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); open(); }
  });
  window.__search = { run, load, data: () => data };   // used by the automated tests
})();
