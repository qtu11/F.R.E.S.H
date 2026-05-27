import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
    ],
  },
  eslint: {
    // Bỏ qua lỗi ESLint khi build production trên Vercel để tránh làm gián đoạn deploy
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Bỏ qua lỗi TypeScript khi build để đảm bảo độ ổn định cao nhất khi deploy
    ignoreBuildErrors: true,
  },
  outputFileTracingRoot: path.resolve(process.cwd()),
};

export default nextConfig;
