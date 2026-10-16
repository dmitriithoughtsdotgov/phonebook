import { AxiosError, AxiosHeaders, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UnauthorizedError } from "./api";
import { backendErrorResponse } from "./backendErrors";

const config = { method: "get", url: "/api/phones", headers: new AxiosHeaders() } as InternalAxiosRequestConfig;

function axiosError(code?: string, status?: number): AxiosError {
  const response = status ? ({ status, data: {}, headers: {}, config } as AxiosResponse) : undefined;
  return new AxiosError("failed", code, config, undefined, response);
}

describe("backendErrorResponse", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ["an expired token", new UnauthorizedError(), 401, "unauthorized"],
    ["an error answer", axiosError(AxiosError.ERR_BAD_RESPONSE, 500), 502, "backend_error"],
    ["a timeout", axiosError(AxiosError.ECONNABORTED), 504, "backend_timeout"],
    ["a refused connection", axiosError("ECONNREFUSED"), 503, "backend_unavailable"],
  ])("maps %s to %i", async (_, error, status, code) => {
    const response = backendErrorResponse(error);
    expect(response.status).toBe(status);
    expect(await response.json()).toEqual({ error: code });
  });

  it("logs every failure except an expired session", () => {
    backendErrorResponse(new UnauthorizedError());
    expect(console.error).not.toHaveBeenCalled();

    backendErrorResponse(axiosError(AxiosError.ERR_BAD_RESPONSE, 500));
    expect(console.error).toHaveBeenCalledWith("Backend answered 500 to GET /api/phones", {});
  });

  it("rethrows errors that are not backend calls", () => {
    const bug = new TypeError("bug");
    expect(() => backendErrorResponse(bug)).toThrow(bug);
  });
});
