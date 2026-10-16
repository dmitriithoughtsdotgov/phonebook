import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import KeycloakProvider from "next-auth/providers/keycloak";

/** Public issuer URL, as seen by the browser and written into the "iss" claim. */
export const keycloakIssuer = process.env.KEYCLOAK_ISSUER ?? "http://localhost:8080/realms/phonebook";

/**
 * Issuer URL reachable from the Next.js server. Inside Docker this is http://keycloak:8080/...,
 * when running locally it is the same as the public issuer.
 */
const keycloakInternalIssuer = process.env.KEYCLOAK_INTERNAL_ISSUER ?? keycloakIssuer;

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await fetch(`${keycloakInternalIssuer}/protocol/openid-connect/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: process.env.KEYCLOAK_CLIENT_ID!,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
        refresh_token: token.refreshToken!,
      }),
    });
    const refreshed = await response.json();
    if (!response.ok) throw refreshed;

    return {
      ...token,
      accessToken: refreshed.access_token,
      idToken: refreshed.id_token ?? token.idToken,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
      expiresAt: Math.floor(Date.now() / 1000) + refreshed.expires_in,
      error: undefined,
    };
  } catch {
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: keycloakIssuer,
      // Discovery is fetched over the internal network; Keycloak still returns the public
      // authorization endpoint for the browser redirect (see KC_HOSTNAME in docker-compose.yml).
      wellKnown: `${keycloakInternalIssuer}/.well-known/openid-configuration`,
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          idToken: account.id_token,
          expiresAt: account.expires_at,
          username: (profile as { preferred_username?: string } | undefined)?.preferred_username,
        };
      }
      // Refresh a little before the access token actually expires.
      if (token.expiresAt && Date.now() < (token.expiresAt - 30) * 1000) {
        return token;
      }
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      session.user = { ...session.user, username: token.username };
      return session;
    },
  },
};
