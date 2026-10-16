import "server-only";

import axios, { isAxiosError } from "axios";

/** HTTP client for the Java backend, called only from the Next.js server. */
const backend = axios.create({
  baseURL: process.env.BACKEND_URL ?? "http://localhost:8081",
  timeout: 10_000,
});

export type Visibility = "PRIVATE" | "SHARED";

export type Phone = {
  id: number;
  number: string;
  label: string | null;
  visibility: Visibility;
  ownerUsername: string;
  mine: boolean;
  createdAt: string;
};

export type NewPhone = {
  number: string;
  label: string;
  visibility: Visibility;
};

export class UnauthorizedError extends Error {}

export type ValidationErrors = Partial<Record<keyof NewPhone, string>>;

/** Backend's RFC 7807 problem details; validation failures also list the rejected fields. */
type Problem = { detail?: string; errors?: ValidationErrors };

// An expired or invalid token surfaces as UnauthorizedError, so callers can send the user to sign in.
backend.interceptors.response.use(undefined, (error) =>
  Promise.reject(isAxiosError(error) && error.response?.status === 401 ? new UnauthorizedError() : error),
);

function auth(accessToken: string) {
  return { headers: { Authorization: `Bearer ${accessToken}` } };
}

export async function fetchPhones(accessToken: string): Promise<Phone[]> {
  const { data } = await backend.get<Phone[]>("/api/phones", auth(accessToken));
  return data;
}

export async function createPhone(
  accessToken: string,
  phone: NewPhone,
): Promise<{ ok: true } | { ok: false; errors: ValidationErrors }> {
  try {
    await backend.post("/api/phones", phone, auth(accessToken));
    return { ok: true };
  } catch (e) {
    if (isAxiosError<Problem>(e) && e.response?.status === 400) {
      return { ok: false, errors: e.response.data.errors ?? {} };
    }
    throw e;
  }
}
