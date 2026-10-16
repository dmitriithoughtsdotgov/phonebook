import { describe, expect, it } from "vitest";
import { formatPhone } from "./phoneFormat";

describe("formatPhone", () => {
  it.each([
    ["+420777123456", "+420 777 123 456"],
    ["+442079460958", "+44 20 7946 0958"],
    ["+16502530000", "+1 650 253 0000"],
  ])("formats %s as %s", (e164, formatted) => {
    expect(formatPhone(e164)).toBe(formatted);
  });

  it("shows a value it cannot parse unchanged", () => {
    expect(formatPhone("234234")).toBe("234234");
  });
});
