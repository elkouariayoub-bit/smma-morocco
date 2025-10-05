# SMMA Morocco (MVP Scaffolding)

Stack: Next.js (App Router) + TypeScript + Tailwind (minimal) + Shadcn-style components (local) + Supabase (with Auth) + Gemini AI.

## Quickstart

```bash
pnpm i # or npm i / yarn
cp .env.example .env.local
# fill all environment variables in .env.local

# create tables in Supabase SQL Editor
# 1. Run supabase/schema.sql
# 2. Run supabase/seed.sql (optional, for demo data)

pnpm dev
```

Open http://localhost:3000

### Supabase notes
- Create a project (EU region closest to Morocco recommended).
- Get `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from **Project Settings → API**.
- Get `SUPABASE_JWT_SECRET` from **Project Settings → API → JWT Settings**.
- Get `GEMINI_API_KEY` from Google AI Studio.

### Google OAuth setup
1. Open the [Google Cloud Console](https://console.cloud.google.com) and create a new project (or select an existing one).
2. Enable the **Google+ API** for the project.
3. Navigate to **APIs & Services → Credentials** and choose **Create Credentials → OAuth client ID**.
4. Select **Web application** as the application type and add the authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
5. Copy the generated **Client ID** and **Client Secret** into your environment variables:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
6. Redeploy (or restart) the app so the Better Auth Google integration can pick up the new credentials.

#### Debugging Google provider availability
- After updating credentials, restart your dev server (or redeploy) and clear cached cookies before testing again.
- Visit [`/auth/better`](http://localhost:3000/auth/better) to inspect the live Better Auth configuration. The JSON response lists the enabled providers and whether each required environment variable is loaded.
- Run `npm run debug:auth` locally to print a masked snapshot of the Better Auth environment variables and confirm that Google is registered before you boot Next.js.
- The server logs now emit `[better-auth]` messages every time the Google flow is initialised. If Supabase reports `provider is not enabled`, make sure Google is toggled on inside **Supabase → Authentication → Providers** and that its Client ID/Secret match the values in `.env.local`.

### Deploy on Vercel
1. Push to GitHub.
2. Import repo in Vercel.
3. Add Environment Variables from your `.env.local` file.
4. Deploy.

### Next steps
- **Phase 5 (Done):** Supabase Auth, RLS policies, route protection.
- **Next:** Build out remaining features on this secure foundation.
