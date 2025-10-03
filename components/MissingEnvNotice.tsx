import type { EnvKey } from '@/lib/env';

type MissingEnvNoticeProps = {
  missing: EnvKey[];
  title?: string;
  description?: string;
  hint?: string;
};

export function MissingEnvNotice({
  missing,
  title = 'Required environment variables are missing',
  description = 'The application cannot connect to Supabase or Gemini until these variables are configured.',
  hint = 'Add the variables in Vercel → Settings → Environment Variables (or your local .env.local) and redeploy.',
}: MissingEnvNoticeProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-50 text-center px-6 py-16">
      <div className="space-y-3 max-w-xl">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {missing.map((envVar) => (
          <code
            key={envVar}
            className="rounded-md bg-gray-900/90 px-3 py-1.5 text-sm font-mono text-white shadow-sm"
          >
            {envVar}
          </code>
        ))}
      </div>
      <p className="text-sm text-gray-500 max-w-xl leading-relaxed">{hint}</p>
    </div>
  );
}
