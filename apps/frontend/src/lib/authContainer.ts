"use client";

import { makeWebAuthClientContainer } from "@budget/composition-web-auth-client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

export const authContainer = makeWebAuthClientContainer({
  supabaseUrl,
  supabasePublishableKey,
});

export const authUsecases = authContainer.usecases.auth;
export const authClient = authContainer.ports.auth;


