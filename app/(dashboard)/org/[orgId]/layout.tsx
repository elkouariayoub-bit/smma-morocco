import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard-shell";

export default function OrgLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { orgId: string };
}) {
  return (
    <DashboardShell redirectPath={`/org/${params.orgId}/users`}>
      {children}
    </DashboardShell>
  );
}
