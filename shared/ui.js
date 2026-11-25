/* Turns <aside class="ctrls" data-sheet> into a bottom sheet on phones (with a summary bar above
   the question) and leaves it as a sidebar on computers. Each setting is a <section class="grp">
   whose buttons use aria-pressed; the summary follows whatever is pressed. */
(function () {
  const panel = document.querySelector('.ctrls[data-sheet]');
  if (!panel) return;
  const host = document.querySelector('.maincol') || panel.parentNode;
  const wide = window.matchMedia ? matchMedia('(min-width: 1100px)') : { matches: false, addEventListener() {} };

  panel.classList.add('sheet');
  panel.id = panel.id || 'sheet';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Settings');
  const head = document.createElement('div');
  head.className = 'sheethead';
  head.innerHTML = '<span class="handle" aria-hidden="true"></span><h2>Settings · Настройки</h2><button class="done" type="button">Done</button>';
  panel.prepend(head);

  const bar = document.createElement('div');
  bar.className = 'setbar';
  bar.innerHTML = '<div class="sumchips" aria-label="Current settings"></div><button class="setbtn" type="button" aria-haspopup="dialog" aria-controls="' + panel.id + '" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2.2"/><circle cx="10" cy="17" r="2.2"/></svg><span>Settings</span></button>';
  host.prepend(bar);
  const chips = bar.querySelector('.sumchips'), btn = bar.querySelector('.setbtn');

  const back = document.createElement('div');
  back.className = 'backdrop';
  document.body.appendChild(back);

  let lastFocus = null;
  function open(groupIdx) {
    if (wide.matches) return;
    lastFocus = document.activeElement;
    panel.classList.add('open'); back.classList.add('open'); document.body.classList.add('noscroll');
    btn.setAttribute('aria-expanded', 'true');
    const g = groupIdx != null ? panel.querySelectorAll('.grp')[groupIdx] : null;
    setTimeout(() => {
      if (g) g.scrollIntoView({ block: 'nearest' });
      const t = (g || panel).querySelector('button[aria-pressed="true"]') || head.querySelector('.done');
      if (t) t.focus({ preventScroll: true });
    }, 60);
  }
  function close() {
    if (!panel.classList.contains('open')) return;
    panel.classList.remove('open'); back.classList.remove('open'); document.body.classList.remove('noscroll');
    btn.setAttribute('aria-expanded', 'false');
    panel.style.transform = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  btn.addEventListener('click', () => open());
  head.querySelector('.done').addEventListener('click', close);
  back.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); }, true);
  wide.addEventListener && wide.addEventListener('change', close);

  // drag the sheet down by its header to close it
  let y0 = null;
  head.addEventListener('touchstart', e => { y0 = e.touches[0].clientY; panel.style.transition = 'none'; }, { passive: true });
  head.addEventListener('touchmove', e => { if (y0 == null) return; const dy = Math.max(0, e.touches[0].clientY - y0); panel.style.transform = `translateY(${dy}px)`; }, { passive: true });
  head.addEventListener('touchend', e => {
    if (y0 == null) return;
    const dy = e.changedTouches[0].clientY - y0; y0 = null;
    panel.style.transition = ''; panel.style.transform = '';
    if (dy > 70) close();
  });

  // summary chips mirror the pressed buttons
  const label = b => { const t = [...b.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim(); return t || b.textContent.trim(); };
  function summary() {
    const groups = [...panel.querySelectorAll('.grp')];
    chips.innerHTML = groups.map((g, i) => {
      const p = g.querySelector('button[aria-pressed="true"]');
      if (!p) return '';
      let v = label(p);
      if (/^(all|все)/i.test(v) && g.dataset.all) v = g.dataset.all;
      else v = (g.dataset.fmt || '{v}').replace('{v}', v);
      return `<button type="button" data-g="${i}">${v.replace(/</g, '&lt;')}</button>`;
    }).join('');
  }
  chips.addEventListener('click', e => { const b = e.target.closest('button'); if (b) open(+b.dataset.g); });
  let pending = false;
  new MutationObserver(() => { if (pending) return; pending = true; requestAnimationFrame(() => { pending = false; summary(); }); })
    .observe(panel, { subtree: true, childList: true, attributes: true, attributeFilter: ['aria-pressed'] });
  summary();
})();
