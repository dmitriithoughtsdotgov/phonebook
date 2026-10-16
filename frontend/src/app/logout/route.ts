import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { keycloakIssuer } from "@/lib/auth";

/**
 * Ends both the local NextAuth session and the Keycloak SSO session, otherwise the next
 * "Sign in" would silently log the same user back in.
 */
export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const logoutUrl = new URL(`${keycloakIssuer}/protocol/openid-connect/logout`);
  logoutUrl.searchParams.set("post_logout_redirect_uri", `${appUrl}/login?loggedOut=1`);
  if (token?.idToken) {
    logoutUrl.searchParams.set("id_token_hint", token.idToken);
  } else {
    logoutUrl.searchParams.set("client_id", process.env.KEYCLOAK_CLIENT_ID!);
  }

  const response = NextResponse.redirect(logoutUrl, 303);
  for (const cookie of req.cookies.getAll()) {
    if (cookie.name.includes("next-auth.session-token")) {
      response.cookies.delete(cookie.name);
    }
  }
  return response;
}
