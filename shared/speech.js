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
  return { tts: TTS, rec: !!REC, say, stop, listen, score };
})();
