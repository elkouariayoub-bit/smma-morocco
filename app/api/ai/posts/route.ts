// app/api/ai/posts/route.ts
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

function getServerClient() {
  try {
    return supabaseServer();
  } catch (error: any) {
    throw new Error(error?.message || 'Supabase server client is not configured.');
  }
}

export async function GET() {
  try {
    const supabase = getServerClient();

    const { data, error } = await supabase
      .from('scheduled_posts')
      .select('*')
      .order('scheduled_at', { ascending: true });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'Supabase client unavailable' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = getServerClient();
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

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'Supabase client unavailable' }, { status: 500 });
  }
}
