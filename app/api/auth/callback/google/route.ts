import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirectTarget = new URL('/auth/callback', url.origin);
  redirectTarget.search = url.search;
  redirectTarget.hash = url.hash;

  return NextResponse.redirect(redirectTarget.toString());
}
