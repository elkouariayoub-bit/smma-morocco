// lib/env.ts
// Split runtime environment into values intended for the server
// and values intended for the browser. Client-side code should
// only rely on NEXT_PUBLIC_* variables.
export const env = {
  // Server-only (do NOT expose to client)
  geminiApiKey: process.env.GEMINI_API_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  betterAuthSecret: process.env.BETTER_AUTH_SECRET,
  betterAuthUrl: process.env.BETTER_AUTH_URL,

  // Client (NEXT_PUBLIC_*) — safe to bundle for browser
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  // Optional canonical origin for constructing redirect URLs
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
};

function assertEnv() {
  const missing: string[] = [];

  // The browser bundle should only require the NEXT_PUBLIC_* keys.
  if (!env.supabaseUrl) missing.push('supabaseUrl');
  if (!env.supabaseAnonKey) missing.push('supabaseAnonKey');

  // Only assert server-only variables when running on the server.
  if (typeof window === 'undefined') {
    if (!env.geminiApiKey) missing.push('geminiApiKey');
    // service role key is optional but recommended for server DB actions
    if (!env.supabaseServiceRoleKey) {
      // don't force it, but log a note in the thrown message if other things missing
    }
  }

  if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
}

assertEnv();
