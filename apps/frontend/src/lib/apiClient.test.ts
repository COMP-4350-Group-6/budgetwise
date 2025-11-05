import { apiFetch } from "@/lib/apiClient";
import { authClient } from "@/lib/authContainer";
import { vi, describe, it, expect, beforeEach } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof global.fetch;

vi.mock("@/lib/authContainer", () => ({
  authClient: {
    getSessionToken: vi.fn(),
  },
}));

describe("apiFetch", () => {
  const endpoint = "/users";
  const API_URL = "https://api.test.com";

  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    (process.env as unknown as Record<string, string>).NEXT_PUBLIC_API_URL = API_URL;
  });

  it("uses NEXT_PUBLIC_API_URL if defined", async () => {
    const mockData = { ok: true };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await apiFetch(endpoint);

    expect(result).toEqual(mockData);
    expect(mockFetch).toHaveBeenCalledWith(
      `${API_URL}${endpoint}`,
      expect.objectContaining({
        headers: { "Content-Type": "application/json" },
      })
    );
  });

  it("falls back to localhost when NEXT_PUBLIC_API_URL is undefined", async () => {
  delete (process.env as unknown as Record<string, string>)["NEXT_PUBLIC_API_URL"];

    const mockData = { msg: "local ok" };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await apiFetch("/ping");
    expect(result).toEqual(mockData);
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8787/ping",
      expect.any(Object)
    );
  });

  it("adds Authorization header when authRequired is true", async () => {
  vi.mocked(authClient.getSessionToken).mockResolvedValueOnce("abc123");
    const mockData = { id: 1 };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await apiFetch(endpoint, {}, true);
    expect(result).toEqual(mockData);

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers).toMatchObject({
      "Content-Type": "application/json",
      Authorization: "Bearer abc123",
    });
  });

  it("throws error with server 'error' message when available", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: "Invalid request" }),
    });

    await expect(apiFetch(endpoint)).rejects.toThrow("Invalid request");
  });

  it("throws generic error when response json fails to parse", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("invalid JSON");
      },
    });

    await expect(apiFetch(endpoint)).rejects.toThrow(
      "Request failed with status 500"
    );
  });

  it("merges custom headers correctly", async () => {
    const mockData = { ok: true };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    await apiFetch(endpoint, {
      method: "POST",
      headers: { "X-Custom": "value" },
      body: JSON.stringify({ name: "Bryce" }),
    });

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers).toMatchObject({
      "Content-Type": "application/json",
      "X-Custom": "value",
    });
  });
});
