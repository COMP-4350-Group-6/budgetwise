import type { IdPort } from "@budget/ports";
import { monotonicFactory } from "ulid";

// Use Web Crypto API compatible with Cloudflare Workers
function webCryptoRandom(): number {
  const buffer = new Uint8Array(1);
  crypto.getRandomValues(buffer);
  return buffer[0] / 0xff;
}

const mono = monotonicFactory(webCryptoRandom);
export const makeUlid = (): IdPort => ({ ulid: () => mono() });
