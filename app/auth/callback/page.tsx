import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AuthCallbackClient from "./AuthCallbackClient";

export const dynamic = "force-dynamic";

interface CallbackPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function AuthCallbackPage({ searchParams }: CallbackPageProps) {
  const code = typeof searchParams?.code === "string" ? searchParams.code : null;

  if (code) {
    try {
      const supabase = createServerComponentClient({ cookies });
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Error exchanging auth code for session", error);
        redirect(`/login?message=${encodeURIComponent(error.message ?? "Sign-in failed")}`);
      }
    } catch (error) {
      console.error("Unexpected auth callback error", error);
      redirect(`/login?message=${encodeURIComponent("Unexpected auth error")}`);
    }

    redirect("/composer");
  }

  return <AuthCallbackClient />;
}
