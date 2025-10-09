import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function HomePage() {
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
