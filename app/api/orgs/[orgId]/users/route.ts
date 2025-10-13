import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { getOptionalSupabaseAdminClient } from "@/lib/supabaseAdmin";

type RouteContext = { params: { orgId: string } };

export async function GET(_request: Request, { params }: RouteContext) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Supabase credentials are not configured" }, { status: 500 });
  }

  const cookieStore = cookies();

  const sb = createServerClient(supabaseUrl, supabaseAnonKey, {
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
