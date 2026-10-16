import "server-only";

import { isAxiosError } from "axios";
import { NextResponse } from "next/server";
import { UnauthorizedError } from "@/lib/api";

const TIMEOUT_CODES = new Set(["ECONNABORTED", "ETIMEDOUT"]);

/**
 * Turns a failed backend call into the response for the browser. Each kind of failure gets its own
 * status (and a log line with the cause), so "backend answered 500" and "backend is down" are
 * told apart. Errors that are not backend calls at all are rethrown for Next.js to report as 500.
 */
export function backendErrorResponse(error: unknown): NextResponse {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isAxiosError(error)) {
    throw error;
  }

  const request = `${error.config?.method?.toUpperCase()} ${error.config?.url}`;
  if (error.response) {
    console.error(`Backend answered ${error.response.status} to ${request}`, error.response.data);
    return NextResponse.json({ error: "backend_error" }, { status: 502 });
  }
  if (error.code && TIMEOUT_CODES.has(error.code)) {
    console.error(`Backend did not answer ${request} in time`);
    return NextResponse.json({ error: "backend_timeout" }, { status: 504 });
  }
  console.error(`Backend is unreachable for ${request}: ${error.code ?? error.message}`);
  return NextResponse.json({ error: "backend_unavailable" }, { status: 503 });
}
