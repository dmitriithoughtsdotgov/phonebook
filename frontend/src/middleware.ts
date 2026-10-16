import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

/**
 * Auth guard: every page requires a signed-in user. Anonymous visitors are sent to /login,
 * which forwards them straight to Keycloak and back to the page they originally asked for.
 * API routes answer 401 instead, since a redirect to an HTML page is useless to fetch().
 */
export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  if (token && !token.error) {
    return NextResponse.next();
  }

  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Everything except the login page itself, NextAuth endpoints, logout and static assets.
  matcher: ["/((?!login|logout|api/auth|_next/static|_next/image|favicon.ico).*)"],
};
