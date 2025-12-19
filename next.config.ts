import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "example.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        // destination:
        //   process.env.NODE_ENV === "production"
        //     ? "https://dessy69-new-backend.onrender.com/api/:path*" // ✅ Production backend
        //     : "https://localhost:5000/api/:path*", // Development backend
        destination: "https://dessy69-new-backend.onrender.com/api/:path*", // ✅ Production backend
      },
    ];
  },
  // Enable HTTPS in development
};

export default nextConfig;
