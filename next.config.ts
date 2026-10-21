import type { NextConfig } from "next";

/**
 * Auth links carry single-use tokens in the query string. Keep those pages
 * out of caches, out of search indexes, and out of referrer headers.
 */
const tokenPageHeaders = [
  { key: "Cache-Control", value: "no-store, max-age=0" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/reset-password",
        headers: tokenPageHeaders,
      },
      {
        source: "/verify",
        headers: tokenPageHeaders,
      },
    ];
  },
};

export default nextConfig;
