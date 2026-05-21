import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Typed routes for type-safe navigation
  typedRoutes: true,

  // Enable experimental features for production-grade performance
  experimental: {
    // Optimize package imports for faster builds
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "recharts",
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "date-fns",
    ],
  },

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google OAuth avatars
      },
      {
        protocol: "https",
        hostname: "utfs.io", // UploadThing files
      },
      {
        protocol: "https",
        hostname: "uploadthing.com",
      },
    ],
  },

  // Server external packages (Prisma needs native bindings)
  serverExternalPackages: ["@prisma/client", "prisma"],

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
