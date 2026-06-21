/** @type {import('next').NextConfig} */
const nextConfig = {
  // NOTE: Do NOT use output:'standalone' on Vercel — Vercel manages its own output
  
  experimental: {
    serverComponentsExternalPackages: ['sharp', 'tesseract.js', '@xenova/transformers', '@prisma/client', 'prisma'],
  },
  
  webpack: (config, { isServer }) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    return config;
  },
  
  async rewrites() {
    const processorApiUrl = process.env.PROCESSOR_API_URL || 'http://localhost:8000';
    
    return [
      {
        source: '/api/processor/:path*',
        destination: `${processorApiUrl}/:path*`,
      },
    ];
  },
  
  async headers() {
    return [
      {
        source: '/api/progress/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-transform' },
          { key: 'Connection', value: 'keep-alive' },
          { key: 'Content-Type', value: 'text/event-stream' },
          { key: 'X-Accel-Buffering', value: 'no' },
        ],
      },
      {
        source: '/api/processor/:path*',
        headers: [
          { key: 'X-Accel-Buffering', value: 'no' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
  
  serverRuntimeConfig: {
    maxRequestBodySize: '50mb',
  },
  
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'nexusrevive.com' },
      { protocol: 'https', hostname: 'www.nexusrevive.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
};

module.exports = nextConfig;
