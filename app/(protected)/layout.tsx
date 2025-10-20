import type { ReactNode } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

import { DashboardLayout } from "@/components/dashboard-layout";

export const dynamic = "force-dynamic";

function normalizeRedirectPath(candidate: string | null): string | null {
  if (!candidate) {
    return null;
  }

  const trimmed = candidate.trim();
  if (!trimmed) {
    return null;
  }

  let path: string;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const url = new URL(trimmed);
      path = url.pathname + url.search;
    } catch {
      return null;
    }
  } else {
    path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  }

  const withoutRouteGroups = path.replace(/\/\([^/]+?\)/g, "");
  return withoutRouteGroups || "/";
}

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const hasCodeSession = cookieStore.get("code-auth")?.value === "true";

  if (!session && !hasCodeSession) {
    const headerList = headers();
    const redirectTarget =
      normalizeRedirectPath(headerList.get("x-invoke-path")) ??
      normalizeRedirectPath(headerList.get("x-matched-path")) ??
      normalizeRedirectPath(headerList.get("next-url")) ??
      normalizeRedirectPath(headerList.get("referer")) ??
      "/dashboard";

    const loginParams = new URLSearchParams({
      next: redirectTarget,
      reason: "redirect",
    });

    redirect(`/login?${loginParams.toString()}`);
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
