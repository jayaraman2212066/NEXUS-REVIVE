import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Storage initialization now handled in api-init.ts (Node.js runtime)
  // Middleware runs in Edge Runtime, no filesystem access needed here
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
