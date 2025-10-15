// Shared container singleton for API routes
import { makeContainer } from "@budget/composition-cloudflare-worker";

// Instantiate once to share in-memory repos across requests
export const container = makeContainer();