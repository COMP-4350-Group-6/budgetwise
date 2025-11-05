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

export const makeUuid = (): IdPort => ({ ulid: () => {
  if (typeof crypto?.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const buffer = new Uint8Array(16);
  crypto.getRandomValues(buffer);
  // basic UUID v4 formatting
  buffer[6] = (buffer[6] & 0x0f) | 0x40;
  buffer[8] = (buffer[8] & 0x3f) | 0x80;
  const hex = [...buffer].map(b => b.toString(16).padStart(2, "0"));
  return `${hex.slice(0,4).join("")}-${hex.slice(4,6).join("")}-${hex.slice(6,8).join("")}-${hex.slice(8,10).join("")}-${hex.slice(10,16).join("")}`;
}});