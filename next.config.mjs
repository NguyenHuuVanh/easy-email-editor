import path from "path";
const nextConfig = {
  // Disable React strict mode to avoid hydration warnings from legacy libraries
  reactStrictMode: false,

  // Turbopack configuration for Next.js 16
  turbopack: {
    resolveAlias: {
      react: "./node_modules/react",
      "react-dom": "./node_modules/react-dom",
    },
  },
  // Webpack configuration (fallback)
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      react: path.resolve("./node_modules/react"),
      "react-dom": path.resolve("./node_modules/react-dom"),
    };
    return config;
  },
};
export default nextConfig;
