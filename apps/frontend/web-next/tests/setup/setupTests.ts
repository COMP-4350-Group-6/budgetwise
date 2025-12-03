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
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {});
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => null);
  vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {});
});
