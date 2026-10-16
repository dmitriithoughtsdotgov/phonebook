import type { TFunction } from "i18next";
import { describe, expect, it } from "vitest";
import { translateError } from "./validation";

// Echoes the key and values, so tests see exactly what would be looked up.
const t = ((key: string, values?: object) => (values ? `${key} ${JSON.stringify(values)}` : key)) as TFunction;

describe("translateError", () => {
  it("translates a yup error by its key and values", () => {
    expect(translateError(t, { key: "validation.maxLength", values: { count: 100 } })).toBe(
      'validation.maxLength {"count":100}',
    );
  });

  it("shows a plain string unchanged", () => {
    expect(translateError(t, "Already translated")).toBe("Already translated");
  });

  it.each([undefined, null, 42, { notKey: true }])("falls back to a generic message for %o", (error) => {
    expect(translateError(t, error)).toBe("validation.invalid");
  });
});
