import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { getOptionalSupabaseAdminClient, getSupabaseAdminClient } from "@/lib/supabaseAdmin";

type RouteContext = { params: { orgId: string } };

function createRouteClient() {
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

export async function GET(_request: Request, { params }: RouteContext) {
  let sb;

  try {
    sb = createRouteClient();
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Supabase credentials are not configured" }, { status: 500 });
  }

  const { data: members, error } = await sb
    .from("memberships")
    .select("id, role, user_id, users:auth.users!inner(id, email)")
    .eq("organization_id", params.orgId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  let seatLimit = 0;

  const admin = getOptionalSupabaseAdminClient();

  if (admin) {
    const { data: subscription, error: subscriptionError } = await admin
      .from("subscriptions")
      .select("seat_limit")
      .eq("organization_id", params.orgId)
      .maybeSingle();

    if (!subscriptionError && subscription?.seat_limit != null) {
      seatLimit = subscription.seat_limit;
    }
  } else {
    const { data: subscription } = await sb
      .from("subscriptions")
      .select("seat_limit")
      .eq("organization_id", params.orgId)
      .maybeSingle();

    if (subscription?.seat_limit != null) {
      seatLimit = subscription.seat_limit;
    }
  }

  return NextResponse.json({
    members: members ?? [],
    seatLimit,
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

  const role = body.role ?? "MEMBER";

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
    return NextResponse.json({ error: error.message ?? "Supabase admin client unavailable" }, { status: 500 });
  }

  const { data: existingUser, error: existingUserError } = await supabaseAdmin
    .from("auth.users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingUserError) {
    return NextResponse.json({ error: existingUserError.message }, { status: 400 });
  }

  let userId = existingUser?.id as string | undefined;

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
