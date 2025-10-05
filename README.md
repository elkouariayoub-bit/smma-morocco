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

### Deploy on Vercel
1. Push to GitHub.
2. Import repo in Vercel.
3. Add Environment Variables from your `.env.local` file.
4. Deploy.

### Next steps
- **Phase 5 (Done):** Supabase Auth, RLS policies, route protection.
- **Next:** Build out remaining features on this secure foundation.
