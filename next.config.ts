import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    return process.env.NODE_ENV === "development"
      ? [
          {
            source: "/api/:path*",
            destination: "https://localhost:5000/api/:path*",
          },
        ]
      : [
          {
            source: "/api/:path*",
            destination: "https://dessy69-new-backend.onrender.com/api/:path*",
          },
        ];
  },
};

export default nextConfig;
