/* Login with a 6-digit email code (Supabase Auth), and automatic saving of all progress
   into one row of the "progress" table. Works from the home-screen app on iPhone because
   it uses a code, not a link. Needs shared/config.js and shared/progress.js. */
(function () {
  const C = window.GR_CONFIG || {};
  const URL_ = (C.supabaseUrl || '').replace(/\/$/, ''), KEY = C.supabaseKey || '';
  const AUTH = 'gr-auth';
  const enabled = !!(URL_ && KEY);
  const get = () => { try { return JSON.parse(localStorage.getItem(AUTH) || 'null'); } catch (e) { return null; } };
  const put = v => { try { if (v) localStorage.setItem(AUTH, JSON.stringify(v)); else localStorage.removeItem(AUTH); } catch (e) {} };
  let session = get();
  const listeners = new Set();
  const emit = () => listeners.forEach(f => { try { f(api.status()); } catch (e) {} });

  async function call(path, opts = {}, auth) {
    const headers = Object.assign({ apikey: KEY, 'Content-Type': 'application/json' }, opts.headers || {});
    if (auth) headers.Authorization = 'Bearer ' + (await token());
    const res = await fetch(URL_ + path, Object.assign({}, opts, { headers }));
    const text = await res.text();
    let body = null; try { body = text ? JSON.parse(text) : null; } catch (e) { body = text; }
    if (!res.ok) {
      const msg = body && (body.msg || body.error_description || body.message || body.error);
      if (res.status === 429) throw new Error('Too many codes requested. Wait a minute and try again.');
      throw new Error(msg ? String(msg) : 'The server answered ' + res.status + '.');
    }
    return body;
  }
  function save(b) {
    session = { access: b.access_token, refresh: b.refresh_token, exp: Date.now() + (b.expires_in || 3600) * 1000, id: b.user && b.user.id, email: b.user && b.user.email };
    put(session); emit();
  }
  async function token() {
    if (!session) throw new Error('Not signed in.');
    if (Date.now() < session.exp - 60000) return session.access;
    const b = await call('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: JSON.stringify({ refresh_token: session.refresh }) });
    save(b); return session.access;
  }
  async function sendCode(email) {
    await call('/auth/v1/otp', { method: 'POST', body: JSON.stringify({ email: email.trim(), create_user: true }) });
  }
  // Accepts the 6-digit code, or the sign-in link from the email pasted in. On the free plan Supabase's
  // emails contain only a link, and on iPhone a link would open Safari instead of the home-screen app,
  // so the link is read here and never opened.
  function fromLink(text) {
    const m = String(text).match(/https?:\/\/\S+/); if (!m) return null;
    try { const u = new URL(m[0].replace(/[)>\]"']+$/, '')); const t = u.searchParams.get('token') || u.searchParams.get('token_hash'); return t ? { token_hash: t, type: u.searchParams.get('type') || 'magiclink' } : null; } catch (e) { return null; }
  }
  async function verify(email, input) {
    const link = fromLink(input);
    const body = link ? { type: link.type, token_hash: link.token_hash } : { type: 'email', email: email.trim(), token: String(input).replace(/\s/g, '') };
    const b = await call('/auth/v1/verify', { method: 'POST', body: JSON.stringify(body) });
    if (!b.user) b.user = await call('/auth/v1/user', { method: 'GET', headers: { Authorization: 'Bearer ' + b.access_token } });
    save(b); attach();
  }
  // If the link was opened in a browser instead, Supabase sends you back here with the session in the address.
  async function fromRedirect() {
    const h = new URLSearchParams(location.hash.slice(1));
    if (!enabled || !h.get('access_token') || !h.get('refresh_token')) return;
    history.replaceState(null, '', location.pathname + location.search);
    try {
      const user = await call('/auth/v1/user', { method: 'GET', headers: { Authorization: 'Bearer ' + h.get('access_token') } });
      save({ access_token: h.get('access_token'), refresh_token: h.get('refresh_token'), expires_in: +h.get('expires_in') || 3600, user }); attach();
    } catch (e) {}
  }
  function signOut() {
    if (session) call('/auth/v1/logout', { method: 'POST' }, true).catch(() => {});
    session = null; put(null);
    if (window.GRProgress && window.GRProgress.setRemote) window.GRProgress.setRemote(null);
    emit();
  }
  const remote = {
    name: 'account',
    async read() {
      const rows = await call(`/rest/v1/progress?select=data&user_id=eq.${session.id}`, { method: 'GET' }, true);
      return rows && rows[0] && rows[0].data && rows[0].data.app ? rows[0].data : null;
    },
    async write(snap) {
      await call('/rest/v1/progress?on_conflict=user_id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ user_id: session.id, data: snap, updated_at: new Date().toISOString() }) }, true);
    }
  };
  function attach() { if (enabled && session && window.GRProgress && window.GRProgress.setRemote) window.GRProgress.setRemote(remote); }
  const api = {
    enabled, sendCode, verify, signOut,
    status: () => ({ enabled, signedIn: !!session, email: session ? session.email : '' }),
    on(f) { listeners.add(f); f(api.status()); }
  };
  window.GRAccount = api;
  attach();
  fromRedirect();
})();
