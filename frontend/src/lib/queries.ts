import axios, { isAxiosError } from "axios";
import type { NewPhone, Phone, ValidationErrors } from "@/lib/api";

/** HTTP client for this app's own API routes (src/app/api), used in the browser. */
const api = axios.create({ baseURL: "/api" });

/** React Query keys, shared by the server prefetch and the browser. */
export const phoneKeys = {
  all: ["phones"] as const,
};

/** True when the request failed because the session has expired. */
export function isUnauthorized(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 401;
}

/** Fields the backend rejected, or null when the request failed for another reason. */
export function rejectedFields(error: unknown): (keyof NewPhone)[] | null {
  if (isAxiosError<{ errors?: ValidationErrors }>(error) && error.response?.status === 400) {
    return Object.keys(error.response.data.errors ?? {}) as (keyof NewPhone)[];
  }
  return null;
}

/** Phone list, served by src/app/api/phones/route.ts. */
export async function getPhones(): Promise<Phone[]> {
  const { data } = await api.get<Phone[]>("/phones");
  return data;
}

export async function postPhone(phone: NewPhone): Promise<void> {
  await api.post("/phones", phone);
}
