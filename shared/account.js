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
  async function verify(email, code) {
    const b = await call('/auth/v1/verify', { method: 'POST', body: JSON.stringify({ type: 'email', email: email.trim(), token: code.trim() }) });
    save(b); attach();
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
})();
