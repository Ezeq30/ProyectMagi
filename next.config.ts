import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co", pathname: "/**" },
      {
        protocol: "https",
        hostname: "qaussmsfrffnrcxahtfm.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    localPatterns: [
      { pathname: "/uploads/**" },
      { pathname: "/brand/**" },
      { pathname: "/hero/**" },
      { pathname: "/favicon-32.png" },
      { pathname: "/apple-touch-icon.png" },
    ],
  },
};

export default nextConfig;
