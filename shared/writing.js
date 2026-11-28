/* Writing practice: a task, the points to cover, useful phrases, a word count, then a check:
   which points your text seems to cover (a rough keyword check you confirm yourself) and a model answer.
   Drafts are saved as you type. Data: window.WRITING. */
(function () {
  const LG = window.GR_L || { code: 'ru' }, L = LG.code, DE = L === 'de', P = DE ? 'de-' : 'gr-', ID = DE ? 'de-writing' : 'writing';
  const W = window.WRITING || [], C = window.GRCoach;
  const $ = id => document.getElementById(id);
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const KEY = P + 'writing';
  const all = () => LS.get(KEY, {});
  const words = s => (String(s).match(/[\p{L}\d][\p{L}\d'’-]*/gu) || []).length;
  let st = { checked: false, ticks: {} };

  function list() {
    const d = all();
    $('main').innerHTML = `<section class="xcard"><h2>${DE ? 'Schreiben' : 'Письмо'} · Writing <small>a task, then a model answer to compare</small></h2>
<ul class="tl">${W.map(t => { const x = d[t.id]; return `<li><a href="#w=${t.id}"><b lang="${L}">${esc(t.title)}</b><span>${t.lv} · ${esc(t.en)} · ${t.words[0]}–${t.words[1]} words</span></a>${x && x.done ? `<span class="up">✓ ${x.score}/${t.points.length}</span>` : x && x.text ? '<span class="note">draft</span>' : ''}</li>`; }).join('')}</ul></section>`;
  }

  function task(t) {
    const d = all(), x = d[t.id] || {}, txt = x.text || '';
    document.body.dataset.where = t.title;
    $('main').innerHTML = `<p class="back"><a href="#">← ${DE ? 'Alle Aufgaben · All tasks' : 'Все задания · All tasks'}</a></p>
<section class="xcard wr"><p class="meta"><span>${t.lv}</span><span>${t.words[0]}–${t.words[1]} words</span></p>
<h2 class="rtitle" lang="${L}">${esc(t.title)}</h2><p class="wtask">${esc(t.task)}</p>
<h3 class="wh">Cover these points</h3>
<ul class="wpts">${t.points.map((p, i) => `<li class="${st.checked ? (st.ticks[i] ? 'hit' : 'miss') : ''}"><label><input type="checkbox" data-i="${i}" ${st.checked ? '' : 'disabled'} ${st.ticks[i] ? 'checked' : ''}><span>${esc(p.t)}</span></label></li>`).join('')}</ul>
<details class="refbox"><summary>Useful phrases</summary><div class="refin"><ul class="wph">${t.phrases.map(([a, b]) => `<li><span lang="${L}">${esc(a)}</span><small>${esc(b)}</small></li>`).join('')}</ul></div></details>
<textarea id="wt" rows="10" lang="${L}" placeholder="${DE ? 'Schreib hier…' : 'Пишите здесь…'}" spellcheck="true">${esc(txt)}</textarea>
<p class="wc" id="wc"></p>
<div class="row">${st.checked ? '' : '<button class="btn go" data-act="check">Check my text</button>'}${txt && !st.checked ? '<button class="btn" data-act="clear">Start again</button>' : ''}</div>
${st.checked ? result(t, txt) : ''}</section>`;
    count(t);
  }
  function count(t) {
    const n = words($('wt').value), [a, b] = t.words, el = $('wc');
    el.textContent = `${n} word${n === 1 ? '' : 's'}${n < a ? ` · aim for ${a}–${b}` : n > b * 1.25 ? ' · a bit long, try to tighten it' : ' · good length'}`;
    el.className = 'wc' + (n >= a && n <= b * 1.25 ? ' ok' : '');
  }
  function check(t) {
    const low = $('wt').value.toLowerCase();
    st.ticks = {}; t.points.forEach((p, i) => { st.ticks[i] = p.k.some(k => low.includes(k.toLowerCase())); });
    st.checked = true; save(t); task(t);
  }
  function result(t, txt) {
    const n = Object.values(st.ticks).filter(Boolean).length, wc = words(txt), [a, b] = t.words;
    return `<div class="fb wres"><p class="verdict">${n} of ${t.points.length} points found${wc < a ? ' · a little short' : ''}</p>
<p class="why">The tick marks are a rough guess from key words. Tick or untick a point yourself, then compare with the model answer.</p>
<details class="refbox" open><summary>Model answer</summary><div class="refin reader" lang="${L}"><p class="wmodel">${esc(t.model)}</p><p class="note" lang="en">${words(t.model)} words · tap any word to look it up.</p></div></details>
<div class="row"><button class="btn go" data-act="done">Save result</button><button class="btn" data-act="edit">Keep editing</button></div></div>`;
  }
  function save(t, done) {
    const d = all(), x = d[t.id] || {};
    x.text = $('wt') ? $('wt').value : x.text; x.at = Date.now();
    if (done) { x.done = true; x.score = Object.values(st.ticks).filter(Boolean).length; }
    d[t.id] = x; LS.set(KEY, d);
  }

  const cur = () => { const m = location.hash.match(/^#w=(.+)$/); return m && W.find(t => t.id === m[1]); };
  function render() { st = { checked: false, ticks: {} }; const t = cur(); if (t) task(t); else { document.body.dataset.where = ''; list(); } window.scrollTo(0, 0); }
  let timer = null;
  document.addEventListener('input', e => { if (e.target.id !== 'wt') return; const t = cur(); if (!t) return; count(t); clearTimeout(timer); timer = setTimeout(() => save(t), 500); });
  document.addEventListener('change', e => { const i = e.target.dataset && e.target.dataset.i; if (i === undefined) return; st.ticks[i] = e.target.checked; e.target.closest('li').className = e.target.checked ? 'hit' : 'miss'; const v = document.querySelector('.wres .verdict'); const t = cur(); if (v && t) v.textContent = `${Object.values(st.ticks).filter(Boolean).length} of ${t.points.length} points covered`; });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b || !$('main').contains(b)) return;
    const t = cur(); if (!t) return;
    const a = b.dataset.act;
    if (a === 'check') { if (!$('wt').value.trim()) { $('wt').focus(); return; } check(t); }
    else if (a === 'edit') { st.checked = false; task(t); $('wt').focus(); }
    else if (a === 'clear' && confirm('Delete your draft and start again?')) { const d = all(); delete d[t.id]; LS.set(KEY, d); render(); }
    else if (a === 'done') {
      save(t, true);
      const n = Object.values(st.ticks).filter(Boolean).length;
      if (C) { C.record(ID, 'writing', n >= Math.ceil(t.points.length * 0.75), t.id); LS.set(P + 'done-writing', C.dkey()); }
      b.textContent = 'Saved ✓'; b.disabled = true;
    }
  });
  addEventListener('hashchange', render);
  window.__gr = { tasks: () => W };   // used by the automated tests
  render();
})();
