"use client"; // not required but harmless here

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const config = {
  // Exclude Next internals, static files, and API webhooks
  matcher: ["/((?!_next|.*\\..*|api/stripe/webhook).*)"],
};

export default async function middleware(req: NextRequest) {
  // Lightweight guards/redirects only. No server/DB calls here.
  return NextResponse.next();
}
