// app/api/ai/posts/route.ts
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET() {
  const supabase = await supabaseServer();

  // You can’t read user_id in a simple route without a cookie/session;
  // but for simplicity we’ll return all (for your own dev account) or filter later.
  const { data, error } = await supabase
    .from('scheduled_posts')
    .select('*')
    .order('scheduled_at', { ascending: true });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}

export async function POST(req: Request) {
  const supabase = await supabaseServer();
  const body = await req.json();
  const { platform, caption, image_url, scheduled_at, user_id } = body;

  if (!platform || !caption || !scheduled_at || !user_id) {
    return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('scheduled_posts')
    .insert([{ platform, caption, image_url: image_url ?? null, scheduled_at, user_id }])
    .select()
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}
