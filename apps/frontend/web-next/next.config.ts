import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@budget/composition-web-auth-client",
    "@budget/adapters-auth-supabase",
    "@budget/usecases",
    "@budget/domain",
    "@budget/ports",
  ],
};

export default nextConfig;
