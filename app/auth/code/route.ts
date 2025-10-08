import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ACCESS_CODE = 'AYOUB';
const CODE_SESSION_COOKIE = 'code-auth';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function POST(request: Request) {
  let submittedCode: string | undefined;
  try {
    const payload = await request.json();
    submittedCode = typeof payload?.code === 'string' ? payload.code.trim() : undefined;
  } catch (error) {
    // Ignore JSON parsing errors and handle as invalid payload below
  }

  if (submittedCode !== ACCESS_CODE) {
    return NextResponse.json(
      { ok: false, error: { message: 'Invalid access code' } },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: CODE_SESSION_COOKIE,
    value: 'true',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });

  return response;
}

export async function GET() {
  const hasSession = cookies().get(CODE_SESSION_COOKIE)?.value === 'true';

  if (!hasSession) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: CODE_SESSION_COOKIE,
    value: '',
    path: '/',
    expires: new Date(0),
  });
  return response;
}
