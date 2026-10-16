import { parsePhoneNumberFromString } from "libphonenumber-js";

/**
 * Readable form of a number the backend stores in E.164 (`+420777123456` → `+420 777 123 456`).
 * Anything that cannot be parsed is shown unchanged rather than hidden.
 */
export function formatPhone(e164: string): string {
  return parsePhoneNumberFromString(e164)?.formatInternational() ?? e164;
}
