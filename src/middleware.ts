// =============================================================================
// Next.js Middleware — Strictly Enforce Authentication across all pages
// =============================================================================

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Always allow internal Next.js assets, public uploads, and auth API endpoints
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/uploads")
  ) {
    return NextResponse.next();
  }

  // 2. Read the Better Auth session cookie
  const sessionCookie = getSessionCookie(request);

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  // 3. STRICT RULE: If not logged in and requesting ANY page other than login/signup, redirect to login
  if (!sessionCookie && !isAuthPage) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/" && pathname !== "/dashboard") {
      loginUrl.searchParams.set("callbackUrl", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 4. If logged in and visiting login or signup page, redirect to dashboard
  if (sessionCookie && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 5. If root / is accessed by authenticated user, send to dashboard
  if (sessionCookie && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

