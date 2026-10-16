import type { TFunction } from "i18next";
import { isValidPhoneNumber, type CountryCode } from "libphonenumber-js";
import * as yup from "yup";

declare module "yup" {
  interface StringSchema {
    /** A real phone number by the numbering rules of its country; numbers without a +prefix are taken as Czech. */
    phone(defaultCountry?: CountryCode): this;
  }
}

/**
 * A validation error as a translation key plus interpolation values, e.g.
 * `{ key: "validation.max", values: { count: 100 } }`. Kept as plain data rather than text,
 * so a shown error follows a language switch.
 */
export type ErrorMessage = { key: string; values?: Record<string, unknown> };

const message =
  (key: string) =>
  (): ErrorMessage => ({ key });

/**
 * Global yup messages: every schema reports generic, translatable errors, so schemas
 * never contain texts. Imported for its side effect by every module that defines a schema.
 */
yup.setLocale({
  mixed: {
    default: message("validation.invalid"),
    required: message("validation.required"),
    defined: message("validation.required"),
    oneOf: message("validation.oneOf"),
    notType: message("validation.invalid"),
  },
  string: {
    length: ({ length }) => ({ key: "validation.length", values: { count: length } }),
    min: ({ min }) => ({ key: "validation.minLength", values: { count: min } }),
    max: ({ max }) => ({ key: "validation.maxLength", values: { count: max } }),
    matches: message("validation.format"),
    email: message("validation.email"),
    url: message("validation.url"),
  },
  number: {
    min: ({ min }) => ({ key: "validation.min", values: { min } }),
    max: ({ max }) => ({ key: "validation.max", values: { max } }),
    integer: message("validation.integer"),
  },
});

yup.addMethod(yup.string, "phone", function (defaultCountry: CountryCode = "CZ") {
  return this.test("phone", message("validation.phone"), (value) =>
    // Empty values are left to required().
    value ? isValidPhoneNumber(value, defaultCountry) : true,
  );
});

function isErrorMessage(value: unknown): value is ErrorMessage {
  return typeof value === "object" && value !== null && typeof (value as ErrorMessage).key === "string";
}

/** Translates an error produced by yup; plain strings are shown as they are. */
export function translateError(t: TFunction, error: unknown): string {
  if (isErrorMessage(error)) return t(error.key, error.values);
  return typeof error === "string" ? error : t("validation.invalid");
}
