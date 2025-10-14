import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

type RouteContext = { params: { orgId: string; userId: string } };

export async function DELETE(_request: Request, { params }: RouteContext) {
  const supabaseAdmin = getSupabaseAdminClient();

  const { error } = await supabaseAdmin
    .from("memberships")
    .delete()
    .match({ organization_id: params.orgId, user_id: params.userId });

  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ success: true });
}
