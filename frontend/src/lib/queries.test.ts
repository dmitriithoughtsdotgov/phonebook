import { AxiosError, AxiosHeaders, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import { isUnauthorized, rejectedFields } from "./queries";

function httpError(status: number, data: unknown = {}): AxiosError {
  const response = { status, data, headers: {}, config: { headers: new AxiosHeaders() } } as AxiosResponse;
  return new AxiosError(`Request failed with status ${status}`, undefined, undefined, undefined, response);
}

describe("isUnauthorized", () => {
  it("is true only for a 401 response", () => {
    expect(isUnauthorized(httpError(401))).toBe(true);
    expect(isUnauthorized(httpError(403))).toBe(false);
    expect(isUnauthorized(new Error("network"))).toBe(false);
  });
});

describe("rejectedFields", () => {
  it("lists the fields of a 400 validation error", () => {
    expect(rejectedFields(httpError(400, { errors: { number: "invalid", visibility: "required" } }))).toEqual([
      "number",
      "visibility",
    ]);
  });

  it("returns no fields for a 400 without a field map", () => {
    expect(rejectedFields(httpError(400, { error: "invalid_json" }))).toEqual([]);
  });

  it("returns null for any other failure", () => {
    expect(rejectedFields(httpError(502))).toBeNull();
    expect(rejectedFields(new Error("network"))).toBeNull();
  });
});
