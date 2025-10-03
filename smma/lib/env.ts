
// FIX: Converted from .env format to a valid TypeScript module exporting environment variables.
export const env = {
  // FIX: Per guidelines, API key is sourced from process.env.API_KEY.
  geminiApiKey: process.env.API_KEY,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};
