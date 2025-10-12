import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { env } from '@/lib/env';

const ACCESS_CODE = 'HICHAM';
const ACCESS_CODE_EMAIL = process.env.ACCESS_CODE_EMAIL || process.env.NEXT_PUBLIC_ACCESS_CODE_EMAIL || 'hicham@smma-morocco.com';

export async function POST(request: Request) {
  const { code } = (await request.json().catch(() => ({ code: undefined }))) as { code?: string };

  const normalized = typeof code === 'string' ? code.trim().toUpperCase() : '';
  if (normalized !== ACCESS_CODE) {
    return NextResponse.json({ error: 'Invalid access code' }, { status: 401 });
  }

  if (!env.supabaseServiceRoleKey) {
    return NextResponse.json(
      { error: 'Access code login requires SUPABASE_SERVICE_ROLE_KEY to be set on the server.' },
      { status: 500 }
    );
  }

  if (!ACCESS_CODE_EMAIL) {
    return NextResponse.json(
      { error: 'Access code login is not configured. Set ACCESS_CODE_EMAIL to a Supabase user email.' },
      { status: 500 }
    );
  }

  const supabase = supabaseServer();

  const { data: userList, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (listError) {
    console.error('Failed to list Supabase users', listError);
    return NextResponse.json({ error: 'Unable to verify access user' }, { status: 500 });
  }

  let accessUser = userList?.users?.find((user) => user.email?.toLowerCase() === ACCESS_CODE_EMAIL.toLowerCase()) ?? null;

  if (!accessUser) {
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email: ACCESS_CODE_EMAIL,
      password: ACCESS_CODE,
      email_confirm: true,
    });

    if (createError && !createError.message?.toLowerCase().includes('already registered')) {
      console.error('Failed to create access code user', createError);
      return NextResponse.json({ error: 'Unable to provision access user' }, { status: 500 });
    }

    accessUser = created?.user ?? null;

    if (!accessUser) {
      const { data: refreshed } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
      accessUser = refreshed?.users?.find((user) => user.email?.toLowerCase() === ACCESS_CODE_EMAIL.toLowerCase()) ?? null;
    }
  }

  if (!accessUser) {
    return NextResponse.json({ error: 'Access user account could not be located' }, { status: 500 });
  }

  const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
    email: ACCESS_CODE_EMAIL,
    password: ACCESS_CODE,
  });

  if (signInError || !sessionData.session) {
    console.error('Failed to create access session', signInError);
    return NextResponse.json({ error: 'Unable to start access session' }, { status: 500 });
  }

  return NextResponse.json({
    access_token: sessionData.session.access_token,
    refresh_token: sessionData.session.refresh_token,
    user: sessionData.session.user,
  });
}
