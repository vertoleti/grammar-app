/* Speech for reading and phrasebook pages: read aloud (speechSynthesis) and a speaking check (speech recognition).
   Recognition exists in Chrome, Edge and Safari (iPhone: needs Siri & Dictation switched on). */
window.GRSpeech = (function () {
  const LANG = { ru: 'ru-RU', de: 'de-DE' };
  const TTS = 'speechSynthesis' in window;
  const REC = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  let voices = {};
  const pick = () => { if (!TTS) return; const all = speechSynthesis.getVoices(); ['ru', 'de'].forEach(l => { const v = all.filter(x => x.lang && x.lang.toLowerCase().startsWith(l)); voices[l] = v.find(x => /google|milena|yuri|katya|anna|helena|markus|petra/i.test(x.name)) || v[0] || null; }); };
  if (TTS) { pick(); speechSynthesis.onvoiceschanged = pick; }
  function say(text, lang, slow, onend) {
    if (!TTS) return false;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = LANG[lang] || lang; if (voices[lang]) u.voice = voices[lang]; u.rate = slow ? 0.65 : 0.92;
    if (onend) u.onend = onend;
    speechSynthesis.speak(u); return true;
  }
  function stop() { if (TTS) speechSynthesis.cancel(); }
  // Resolves with what was heard (best alternative), rejects with a readable message.
  function listen(lang) {
    return new Promise((res, rej) => {
      if (!REC) return rej(new Error('Speech recognition isn’t available in this browser. On iPhone use Safari with Siri & Dictation switched on; on a computer use Chrome or Edge.'));
      const r = new REC(); r.lang = LANG[lang] || lang; r.interimResults = false; r.maxAlternatives = 3; r.continuous = false;
      let done = false;
      r.onresult = e => { done = true; const alts = [...e.results[0]].map(a => a.transcript); res(alts); };
      r.onerror = e => { done = true; rej(new Error(e.error === 'not-allowed' ? 'The microphone is blocked. Allow it for this site in your browser settings.' : e.error === 'no-speech' ? 'Nothing heard. Tap the microphone and speak right away.' : 'Recognition failed (' + e.error + ').')); };
      r.onend = () => { if (!done) rej(new Error('Nothing heard. Tap the microphone and speak right away.')); };
      try { r.start(); } catch (e) { rej(e); }
    });
  }
  const norm = s => String(s).toLowerCase().replace(/ё/g, 'е').replace(/ß/g, 'ss').replace(/[^\p{L}\p{N}\s-]/gu, ' ').replace(/\s+/g, ' ').trim();
  // Which words of the target were recognised (order-tolerant, each heard word used once)
  function score(target, heardAlts) {
    const words = target.split(/\s+/).filter(Boolean);
    let best = null;
    (Array.isArray(heardAlts) ? heardAlts : [heardAlts]).forEach(h => {
      const pool = norm(h).split(' ');
      const marks = words.map(w => { const k = norm(w); if (!k) return { w, ok: true }; const i = pool.indexOf(k); if (i >= 0) { pool.splice(i, 1); return { w, ok: true }; } return { w, ok: false }; });
      const n = marks.filter(m => norm(m.w)).length || 1, ok = marks.filter(m => m.ok && norm(m.w)).length;
      const r = { marks, pct: Math.round(ok / n * 100), heard: h };
      if (!best || r.pct > best.pct) best = r;
    });
    return best;
  }
  // ---------- speaking practice for one sentence ----------
  // With speech recognition (Safari, Chrome): the words that were recognised turn green, the rest red.
  // Without it (e.g. the iPhone home-screen app): record yourself, then compare with the model voice.
  const CAN_RECORD = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  let useRecord = !REC, active = null;
  const esc = x => String(x).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const anc = btn => btn._anchor || btn;
  function note(btn, text) {
    const a = anc(btn); let n = a.nextElementSibling; if (!n || !n.classList.contains('sp-msg')) { n = document.createElement('span'); n.className = 'sp-msg'; a.after(n); }
    n.textContent = text; clearTimeout(n._t); n._t = setTimeout(() => n.remove(), 6000);
  }
  function panel(btn, url, target, lang, onScore) {
    const a = anc(btn); let p = a.nextElementSibling; while (p && p.classList.contains('sp-msg')) p = p.nextElementSibling;
    if (!p || !p.classList.contains('sp-rec')) { p = document.createElement('span'); p.className = 'sp-rec'; a.after(p); }
    p.innerHTML = `<button type="button" data-sp="me">▶ You</button>${TTS ? '<button type="button" data-sp="model">▶ Model</button>' : ''}<button type="button" data-sp="ok">✓ Sounded right</button><button type="button" data-sp="again">↺ Again</button>`;
    const audio = new Audio(url);
    p.onclick = e => {
      const b = e.target.closest('[data-sp]'); if (!b) return; e.stopPropagation();
      const k = b.dataset.sp;
      if (k === 'me') { stop(); audio.currentTime = 0; audio.play().catch(() => {}); }
      else if (k === 'model') { audio.pause(); say(target, lang, false); }
      else if (k === 'ok') { onScore(true, 100); p.innerHTML = '<span class="sp-ok">✓</span>'; btn.textContent = '✓'; }
      else if (k === 'again') { onScore(false, 0); p.remove(); practice(btn, target, lang, null, onScore); }
    };
  }
  async function record(btn, target, lang, onScore) {
    if (active) { active.stop(); return; }
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch (e) { note(btn, 'The microphone is blocked. Allow it in Settings → Safari → Microphone (or for this app).'); return; }
    const mime = ['audio/mp4', 'audio/webm', 'audio/ogg'].find(m => window.MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) || '';
    const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined), chunks = [];
    rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    rec.onstop = () => {
      stream.getTracks().forEach(t => t.stop()); clearTimeout(timer); active = null;
      btn.textContent = '🎤'; btn.classList.remove('sp-on');
      { const m = anc(btn).nextElementSibling; if (m && m.classList.contains('sp-msg')) m.remove(); }
      if (!chunks.length) { note(btn, 'Nothing was recorded. Tap 🎤, read the sentence, then tap ■.'); return; }
      panel(btn, URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || mime || 'audio/mp4' })), target, lang, onScore);
    };
    const timer = setTimeout(() => { if (rec.state === 'recording') rec.stop(); }, 20000);
    active = { stop: () => { if (rec.state === 'recording') rec.stop(); } };
    stop(); rec.start(); btn.textContent = '■'; btn.classList.add('sp-on');
    note(btn, 'Recording… read the sentence, then tap ■');
  }
  // host: the element holding the sentence (its words get marked); onScore(ok, pct)
  async function practice(btn, target, lang, host, onScore, anchor) {
    if (anchor) btn._anchor = anchor;
    if (useRecord || !REC) {
      if (!CAN_RECORD) { note(btn, 'Speaking practice needs a microphone. On iPhone open the app in Safari.'); return; }
      return record(btn, target, lang, onScore);
    }
    btn.textContent = '…'; btn.disabled = true;
    try {
      const heard = await listen(lang), r = score(target, heard);
      if (host) host.innerHTML = r.marks.map(m => `<span class="${m.ok ? 'wok' : 'wno'}">${esc(m.w)}</span>`).join(' ');
      btn.textContent = r.pct >= 80 ? '✓' : '🎤'; btn.title = `${r.pct}% recognised. Heard: ${r.heard}`;
      note(btn, `${r.pct}% recognised`);
      onScore(r.pct >= 80, r.pct);
    } catch (e) {
      btn.textContent = '🎤';
      if (/not-allowed|service|network|available/i.test(e.message) && CAN_RECORD) { useRecord = true; note(btn, 'Word checking isn’t available here, so record yourself instead: tap 🎤 again.'); }
      else note(btn, e.message);
    }
    btn.disabled = false;
  }
  const mode = () => (REC && !useRecord) ? 'check' : CAN_RECORD ? 'record' : 'none';

  return { tts: TTS, rec: !!REC, say, stop, listen, score, practice, mode };
})();
