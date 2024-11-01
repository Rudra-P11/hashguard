/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hashguard.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.hashguard.com',
        pathname: '/**',
      },
    ],
  },
  trailingSlash: true,
};

export default nextConfig;
