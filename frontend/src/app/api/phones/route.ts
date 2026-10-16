import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { createPhone, fetchPhones } from "@/lib/api";
import { authOptions } from "@/lib/auth";
import { backendErrorResponse } from "@/lib/backendErrors";

export const dynamic = "force-dynamic";

/**
 * The browser's API for phone numbers (used by React Query). The browser never sees the Keycloak
 * access token: it stays in the encrypted session cookie and is attached here, on the server.
 * The backend validates every request, so bodies are passed on unchanged.
 */
async function withAccessToken(handler: (accessToken: string) => Promise<Response>): Promise<Response> {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken || session.error) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    return await handler(session.accessToken);
  } catch (e) {
    return backendErrorResponse(e);
  }
}

export function GET() {
  return withAccessToken(async (accessToken) => NextResponse.json(await fetchPhones(accessToken)));
}

export async function POST(request: NextRequest) {
  const phone = await request.json().catch(() => undefined);
  if (phone === undefined) {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  return withAccessToken(async (accessToken) => {
    const result = await createPhone(accessToken, phone);
    return result.ok
      ? new NextResponse(null, { status: 201 })
      : NextResponse.json({ errors: result.errors }, { status: 400 });
  });
}
