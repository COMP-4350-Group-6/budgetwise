import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@budget/composition-web-auth-client",
    "@budget/adapters-auth-supabase",
    "@budget/usecases",
    "@budget/domain",
    "@budget/ports",
  ],
  
  // Redirect root to /home - auth is handled by ProtectedLayoutClient
  async redirects() {
    return [
      {
        source: "/",
        destination: "/home",
        permanent: false, // 307 redirect (not cached)
      },
    ];
  },
};

export default nextConfig;
