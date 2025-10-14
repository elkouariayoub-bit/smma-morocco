import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

type RouteContext = { params: { orgId: string } };

export function createRouteClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase credentials are not configured");
  }

  const cookieStore = cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options?: Record<string, any>) {
        cookieStore.set({
          name,
          value,
          path: "/",
          ...(options ?? {}),
        } as any);
      },
      remove(name: string, options?: Record<string, any>) {
        cookieStore.set({
          name,
          value: "",
          path: "/",
          maxAge: 0,
          ...(options ?? {}),
        } as any);
      },
    },
  });

}

export async function GET(_: Request, { params }: RouteContext) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options?: Record<string, any>) {
          cookieStore.set({
            name,
            value,
            path: "/",
            ...(options ?? {}),
          } as any);
        },
        remove(name: string, options?: Record<string, any>) {
          cookieStore.set({
            name,
            value: "",
            path: "/",
            maxAge: 0,
            ...(options ?? {}),
          } as any);
        },
      },
    },
  );

  const { data: members, error } = await supabase
    .from("memberships")
    .select("id, role, user_id, users:auth.users!inner(id, email)")
    .eq("organization_id", params.orgId);

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("seat_limit")
    .eq("organization_id", params.orgId)
    .maybeSingle();

  return Response.json({
    members: members ?? [],
    seatLimit: subscription?.seat_limit ?? 0,
    seatsUsed: members?.length ?? 0,
  });
}

export async function POST(req: Request, { params }: RouteContext) {
  let sb;

  try {
    sb = createRouteClient();
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Supabase credentials are not configured" }, { status: 500 });
  }

  const body = (await req.json()) as { email?: string; role?: "OWNER" | "ADMIN" | "MEMBER" };
  const email = body?.email?.trim();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const requestedRole = body.role;
  if (requestedRole && requestedRole.toLowerCase() === "editor") {
    return NextResponse.json({ error: "You don’t have permission to manage users" }, { status: 403 });
  }

  const role = (requestedRole && ["OWNER", "ADMIN", "MEMBER"].includes(requestedRole))
    ? requestedRole
    : "MEMBER";

  const { data: me, error: meError } = await sb
    .from("memberships")
    .select("role")
    .eq("organization_id", params.orgId)
    .limit(1);

  if (meError) {
    return NextResponse.json({ error: meError.message }, { status: 400 });
  }

  const myRole = me?.[0]?.role as string | undefined;
  const normalizedRole = myRole?.toLowerCase();

  if (normalizedRole === "editor") {
    return NextResponse.json({ error: "You don’t have permission to manage users" }, { status: 403 });
  }

  if (!normalizedRole || !["owner", "admin"].includes(normalizedRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let supabaseAdmin;
  try {
    supabaseAdmin = getSupabaseAdminClient();
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Supabase admin client unavailable" }, { status: 500 });
  }

  const { data: listedUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1,
    ...(email ? { email } : {}),
  } as any);

  if (listError) {
    return NextResponse.json({ error: listError.message }, { status: 400 });
  }

  let userId = listedUsers?.users?.[0]?.id as string | undefined;

  if (!userId) {
    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: false,
    });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    userId = created.user?.id;
  }

  if (!userId) {
    return NextResponse.json({ error: "Failed to resolve user identifier" }, { status: 500 });
  }

  const { error: membershipError } = await supabaseAdmin
    .from("memberships")
    .insert([{ user_id: userId, organization_id: params.orgId, role }]);

  if (membershipError) {
    return NextResponse.json({ error: membershipError.message }, { status: 402 });
  }

  return NextResponse.json({ ok: true });
}
