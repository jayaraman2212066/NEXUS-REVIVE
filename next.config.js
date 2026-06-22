/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['sharp', 'tesseract.js', '@xenova/transformers', '@prisma/client', 'prisma'],
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  
  transpilePackages: ['@tsparticles/react', '@tsparticles/slim'],
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Include Prisma files in function bundle
  outputFileTracing: true,
  
  webpack: (config, { isServer, webpack }) => {
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
    
    // Handle Prisma engine binaries
    if (isServer) {
      config.externals = [...(config.externals || []), '_http_common'];
    }
    
    // Override pdf-parse to use lib directly and skip test code in index.js
    config.resolve.alias['pdf-parse'] = require.resolve('pdf-parse/lib/pdf-parse.js');
    
    // Ignore test directories
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /\/test\//,
      })
    );
    
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /\.test\.(js|ts|tsx)$/,
      })
    );
    
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
