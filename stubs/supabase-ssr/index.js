const { createClient } = require('@supabase/supabase-js');

function normalizeCookies(adapter) {
  if (!adapter) return undefined;
  if (adapter.get && adapter.set) {
    return adapter;
  }
  return undefined;
}

function createBrowserClient(supabaseUrl, supabaseKey, options) {
  return createClient(supabaseUrl, supabaseKey, options);
}

function createServerClient(supabaseUrl, supabaseKey, config = {}) {
  const { cookies, options } = config;
  const client = createClient(supabaseUrl, supabaseKey, options);
  const cookieAdapter = normalizeCookies(cookies);

  if (cookieAdapter && client?.auth?.onAuthStateChange) {
    client.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        cookieAdapter.remove?.('sb-access-token');
        cookieAdapter.remove?.('sb-refresh-token');
        return;
      }
      if (session.access_token) {
        cookieAdapter.set('sb-access-token', session.access_token, {
          path: '/',
          secure: true,
          sameSite: 'lax'
        });
      }
      if (session.refresh_token) {
        cookieAdapter.set('sb-refresh-token', session.refresh_token, {
          path: '/',
          secure: true,
          sameSite: 'lax'
        });
      }
    });
  }

  return client;
}

function createServerComponentClient({ supabaseUrl, supabaseKey, cookies, cookieOptions, options }) {
  const adapter = cookies
    ? {
        get(name) {
          const value = cookies.get?.(name);
          if (typeof value === 'string') return value;
          return value?.value;
        },
        set(name, value, opts) {
          const finalOptions = { path: '/', ...(cookieOptions || {}), ...(opts || {}) };
          cookies.set?.(name, value, finalOptions);
        },
        remove(name, opts) {
          const finalOptions = { path: '/', ...(cookieOptions || {}), ...(opts || {}), maxAge: 0 };
          cookies.set?.(name, '', finalOptions);
        }
      }
    : undefined;

  return createServerClient(supabaseUrl, supabaseKey, { cookies: adapter, options });
}

module.exports = {
  createBrowserClient,
  createServerClient,
  createServerComponentClient
};
