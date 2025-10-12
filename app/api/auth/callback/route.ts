import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { code } = await request.json().catch(() => ({ code: undefined }));

  if (!code || typeof code !== 'string') {
    return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
  }

  const supabase = createRouteHandlerClient({ cookies });
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.json({ error: error.message ?? 'Failed to exchange authorization code' }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
