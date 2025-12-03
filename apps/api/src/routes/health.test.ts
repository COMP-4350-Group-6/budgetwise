import { describe, it, expect } from "vitest";
import { health } from "../routes/health";

describe("Health Route", () => {
  it("should return ok status", async () => {
    const req = new Request("http://localhost/health");
    const res = await health.fetch(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ ok: true });
  });

  it("should handle different HTTP methods", async () => {
    const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"];

    for (const method of methods) {
      const req = new Request("http://localhost/health", { method });
      const res = await health.fetch(req);

      if (method === "GET") {
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data).toEqual({ ok: true });
      } else {
        // Hono returns 404 for undefined routes/methods
        expect(res.status).toBe(404);
      }
    }
  });
});