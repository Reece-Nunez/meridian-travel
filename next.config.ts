import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable server-side rendering for Amplify
  output: 'standalone',

  // Ensure environment variables are accessible in API routes
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  // Amplify-specific configuration
  serverExternalPackages: ['@supabase/supabase-js'],

  // Add headers to prevent caching issues
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
