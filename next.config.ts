import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "partyboatsusa.com" },
      { hostname: "zpphkvcmasdoyqtigwth.supabase.co" },
    ],
  },
};

export default nextConfig;
