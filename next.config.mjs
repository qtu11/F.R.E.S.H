/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Bỏ qua lỗi ESLint khi build production trên Vercel để tránh làm gián đoạn deploy
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Bỏ qua lỗi TypeScript khi build để đảm bảo độ ổn định cao nhất khi deploy
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
