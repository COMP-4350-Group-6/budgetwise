import "dotenv/config"; // <-- Add this line at the very top

import { describe, it, expect } from "vitest";
import { makeSupabaseAuthClient } from "@budget/adapters-auth-supabase";

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || "";
const TEST_EMAIL = process.env.SUPABASE_TEST_EMAIL || "";
const TEST_PASSWORD = process.env.SUPABASE_TEST_PASSWORD || "";

const shouldRun = !!SUPABASE_URL && !!SUPABASE_PUBLISHABLE_KEY;

// Minimal integration test against a real Supabase project, gated by env vars.
// It only exercises getMe unauthenticated behavior to avoid creating data.
describe.skipIf(!shouldRun)("Supabase auth adapter (integration)", () => {
  it("getMe returns null when not signed in (real Supabase)", async () => {
    const client = makeSupabaseAuthClient({
      supabaseUrl: SUPABASE_URL,
      supabaseAnonKey: SUPABASE_PUBLISHABLE_KEY,
    });

    const me = await client.getMe();
    expect(me).toBeNull();
  });

  it.skipIf(!TEST_EMAIL || !TEST_PASSWORD)("login and logout succeed with test credentials", async () => {
    const client = makeSupabaseAuthClient({
      supabaseUrl: SUPABASE_URL,
      supabaseAnonKey: SUPABASE_PUBLISHABLE_KEY,
    });

    await client.login({ email: TEST_EMAIL, password: TEST_PASSWORD });
    const meAfterLogin = await client.getMe();
    expect(meAfterLogin && meAfterLogin.email).toBe(TEST_EMAIL);

    await client.logout();
    const meAfterLogout = await client.getMe();
    expect(meAfterLogout).toBeNull();
  });
});


