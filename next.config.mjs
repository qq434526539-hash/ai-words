/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 第一版暂不引入 ESLint 配置，构建时跳过 lint（后续可补）
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
