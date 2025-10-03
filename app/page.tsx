import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getMissingEnvVars } from "@/lib/env";
import { MissingEnvNotice } from "@/components/MissingEnvNotice";

export default async function HomePage() {
  const missingSupabase = getMissingEnvVars(['supabaseUrl', 'supabaseAnonKey']);

  if (missingSupabase.length) {
    return (
      <MissingEnvNotice
        missing={missingSupabase}
        title="Supabase environment variables are missing"
        description="The landing page checks Supabase to determine whether to redirect authenticated users. Configure the variables to continue."
      />
    );
  }

  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    redirect('/composer');
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 bg-gray-50">
      <h1 className="text-4xl font-bold tracking-tight">SMMA Morocco</h1>
      <p className="text-gray-600 max-w-md text-center">
        Lightweight social media management. Composer, queue, drafts, and basic analytics, powered by AI.
      </p>
      <div className="flex gap-3">
        <Link href="/login"><Button>Sign In / Sign Up</Button></Link>
      </div>
    </main>
  );
}
