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

### Deploy on Vercel
1. Push to GitHub.
2. Import repo in Vercel.
3. Add Environment Variables from your `.env.local` file.
4. Deploy.

### Next steps
- **Phase 5 (Done):** Supabase Auth, RLS policies, route protection.
- **Next:** Build out remaining features on this secure foundation.
