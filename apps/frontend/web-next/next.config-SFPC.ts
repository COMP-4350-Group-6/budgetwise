import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@budget/composition-web-auth-client",
    "@budget/adapters-auth-supabase",
    "@budget/usecases",
    "@budget/domain",
    "@budget/ports",
  ],
};

 
initOpenNextCloudflareForDev();
export default nextConfig;
