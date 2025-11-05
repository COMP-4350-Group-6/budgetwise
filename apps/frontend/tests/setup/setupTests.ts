import "@testing-library/jest-dom";
import { vi, beforeEach } from "vitest";
import { config } from "dotenv";
config({ path: ".env.local" });
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    prefetch: vi.fn(),
  }),
}));


beforeEach(() => {
  vi.spyOn(window.localStorage.__proto__, "setItem");
  vi.spyOn(window.localStorage.__proto__, "getItem");
  vi.spyOn(window.localStorage.__proto__, "removeItem");
});
