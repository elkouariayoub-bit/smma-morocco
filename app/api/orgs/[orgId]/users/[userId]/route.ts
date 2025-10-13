import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

import { createRouteClient } from "../route";

type RouteContext = { params: { orgId: string; userId: string } };

export async function DELETE(_request: Request, { params }: RouteContext) {
  let sb;

  try {
    sb = createRouteClient();
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Supabase credentials are not configured" },
      { status: 500 },
    );
  }

  const { data: me, error: meError } = await sb
    .from("memberships")
    .select("role")
    .eq("organization_id", params.orgId)
    .limit(1);

  if (meError) {
    return NextResponse.json({ error: meError.message }, { status: 400 });
  }

  const myRole = me?.[0]?.role as string | undefined;

  if (!myRole || !["OWNER", "ADMIN"].includes(myRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let supabaseAdmin;

  try {
    supabaseAdmin = getSupabaseAdminClient();
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Supabase admin client unavailable" },
      { status: 500 },
    );
  }

  const { error } = await supabaseAdmin
    .from("memberships")
    .delete()
    .eq("organization_id", params.orgId)
    .eq("user_id", params.userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
