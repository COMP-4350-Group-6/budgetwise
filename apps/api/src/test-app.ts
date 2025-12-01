/**
 * Test helpers for API route tests.
 * This file creates a test app instance using in-memory repositories.
 * It provides a reset() function for test isolation between test cases.
 */

import { makeContainer } from "@budget/composition-cloudflare-worker";
import { createApp } from "./app";
import { createAppDeps } from "./deps";

// Create a single container instance for all tests (in-memory mode)
const testContainer = makeContainer();

// Create the app with test dependencies
const deps = createAppDeps(testContainer);
export const app = createApp(deps);

/**
 * Reset all in-memory repositories for test isolation.
 * Call this in beforeEach() to ensure tests don't affect each other.
 */
export function resetTestData(): void {
  testContainer.reset();
}

// For backwards compatibility with existing tests that use `container.reset()`
export const container = {
  reset: resetTestData,
};
