import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: [
    "easy-email-editor",
    "easy-email-core",
    "easy-email-extensions",
    "@arco-design/web-react",
    "@arco-themes/react-easy-email-theme",
    "@arco-themes/react-easy-email-theme-green",
    "@arco-themes/react-easy-email-theme-purple",
    "overlayscrollbars",
    "overlayscrollbars-react",
    "react-codemirror2",
    "react-color",
    "react-use",
  ],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@demo": path.resolve(__dirname, "./src"),
    };
    return config;
  },

  sassOptions: {
    silenceDeprecations: ["legacy-js-api"],
  },
};

export default nextConfig;
