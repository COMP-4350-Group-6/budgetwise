"use client";

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { ApiProvider, useApiFetch } from "./useApi";

// Mock the config
vi.mock("@/lib/config", () => ({
  getApiUrl: () => "https://api.example.com",
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("useApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useApiFetch hook", () => {
    it("throws error when used outside provider", () => {
      expect(() => {
        renderHook(() => useApiFetch());
      }).toThrow("useApiFetch must be used within an ApiProvider");
    });

    it("returns apiFetch function when used within provider", () => {
      const { result } = renderHook(() => useApiFetch(), {
        wrapper: ApiProvider,
      });

      expect(typeof result.current).toBe("function");
    });
  });

  describe("apiFetch function", () => {
    it("makes successful API call", async () => {
      const mockResponse = { data: "test" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      const { result } = renderHook(() => useApiFetch(), {
        wrapper: ApiProvider,
      });

      const response = await result.current("/test");

      expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      expect(response).toEqual(mockResponse);
    });

    it("adds v1 prefix for versioned routes", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

      const { result } = renderHook(() => useApiFetch(), {
        wrapper: ApiProvider,
      });

      await result.current("/transactions");

      expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/v1/transactions", expect.any(Object));
    });

    it("does not add v1 prefix for non-versioned routes", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

      const { result } = renderHook(() => useApiFetch(), {
        wrapper: ApiProvider,
      });

      await result.current("/health");

      expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/health", expect.any(Object));
    });

    it("handles 204 responses correctly", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: () => Promise.reject(new Error("No content")),
      });

      const { result } = renderHook(() => useApiFetch(), {
        wrapper: ApiProvider,
      });

      const response = await result.current("/test");

      expect(response).toBeUndefined();
    });

    it("throws error for non-ok responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: "Server error" }),
      });

      const { result } = renderHook(() => useApiFetch(), {
        wrapper: ApiProvider,
      });

      await expect(result.current("/test")).rejects.toThrow("Server error");
    });

    it("throws authentication error for 401 when auth required", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({}),
      });

      const { result } = renderHook(() => useApiFetch(), {
        wrapper: ApiProvider,
      });

      await expect(result.current("/test", {}, true)).rejects.toThrow(
        "Authentication required - please log in again"
      );
    });

    it("handles custom headers", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

      const { result } = renderHook(() => useApiFetch(), {
        wrapper: ApiProvider,
      });

      await result.current("/test", {
        headers: { "X-Custom": "value" },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/test",
        expect.objectContaining({
          headers: {
            "Content-Type": "application/json",
            "X-Custom": "value",
          },
        })
      );
    });

    it("passes through request options", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

      const { result } = renderHook(() => useApiFetch(), {
        wrapper: ApiProvider,
      });

      await result.current("/test", {
        method: "POST",
        body: JSON.stringify({ data: "test" }),
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/test",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ data: "test" }),
        })
      );
    });

    it("handles JSON parsing errors gracefully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.reject(new Error("Invalid JSON")),
      });

      const { result } = renderHook(() => useApiFetch(), {
        wrapper: ApiProvider,
      });

      const response = await result.current("/test");

      expect(response).toBeUndefined();
    });
  });
});