import { describe, expect, it } from "vitest";
import { phoneSchema } from "./phoneSchema";

const valid = { number: "+420 777 123 456", label: "Office", visibility: "PRIVATE" };

async function errorsOf(values: object): Promise<Record<string, unknown>> {
  try {
    await phoneSchema.validate(values, { abortEarly: false });
    return {};
  } catch (e) {
    const { inner } = e as { inner: { path: string; message: unknown }[] };
    return Object.fromEntries(inner.map((i) => [i.path, i.message]));
  }
}

describe("phoneSchema", () => {
  it.each(["+420 777 123 456", "777 123 456", "00420777123456", "+44 20 7946 0958"])("accepts %s", async (number) => {
    expect(await errorsOf({ ...valid, number })).toEqual({});
  });

  it.each(["234234", "+420 123 456 789", "not a number"])("rejects %s as not a phone number", async (number) => {
    expect(await errorsOf({ ...valid, number })).toEqual({ number: { key: "validation.phone" } });
  });

  it("requires the number and a known visibility", async () => {
    expect(await errorsOf({ number: "  ", visibility: "PUBLIC" })).toEqual({
      number: { key: "validation.required" },
      visibility: { key: "validation.oneOf" },
    });
  });

  it("limits the label to 100 characters, as the backend does", async () => {
    expect(await errorsOf({ ...valid, label: "x".repeat(101) })).toEqual({
      label: { key: "validation.maxLength", values: { count: 100 } },
    });
  });

  it("trims values and defaults a missing label to an empty string", () => {
    expect(phoneSchema.cast({ number: " 777 123 456 ", visibility: "SHARED" })).toEqual({
      number: "777 123 456",
      label: "",
      visibility: "SHARED",
    });
  });
});
