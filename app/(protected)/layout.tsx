import type { ReactNode } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

import { DashboardLayout } from "@/components/dashboard-layout";

export const dynamic = "force-dynamic";

function parsePath(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const url = new URL(trimmed);
      return url.pathname + url.search;
    } catch {
      return null;
    }
  }

  if (!trimmed.startsWith("/")) {
    return `/${trimmed}`;
  }

  return trimmed;
}

function stripRouteGroups(path: string): string {
  const withoutGroups = path.replace(/\/\([^/]+?\)/g, "");
  if (!withoutGroups) {
    return "/";
  }

  return withoutGroups.startsWith("/") ? withoutGroups : `/${withoutGroups}`;
}

function resolveRedirectPath(): string {
  const headerList = headers();
  const candidates = [
    headerList.get("next-url"),
    headerList.get("x-invoke-path"),
    headerList.get("x-matched-path"),
    headerList.get("referer"),
  ];

  for (const candidate of candidates) {
    const parsed = parsePath(candidate);
    if (parsed) {
      return stripRouteGroups(parsed);
    }
  }

  return "/dashboard";
}

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const hasCodeSession = cookieStore.get("code-auth")?.value === "true";

  if (!session && !hasCodeSession) {
    const loginParams = new URLSearchParams({
      next: resolveRedirectPath(),
      reason: "redirect",
    });

    redirect(`/login?${loginParams.toString()}`);
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
