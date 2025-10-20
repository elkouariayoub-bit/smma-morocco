import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const config = {
  // Exclude Next internals, static files, and API webhooks
  matcher: ["/((?!_next|.*\\..*|api/stripe/webhook).*)"],
};

export function middleware(_request: NextRequest) {
  return NextResponse.next();
}
