import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import path from "path";
import { injectHtml } from "vite-plugin-html";

export default defineConfig({
  server: {
    fs: {
      strict: false,
    },
  },
  resolve: {
    alias: {
      "easy-email-editor/lib/style.css": path.resolve(
        __dirname,
        "package.json",
      ),
      "easy-email-extensions/lib/style.css": path.resolve(
        __dirname,
        "package.json",
      ),
      "overlayscrollbars/css/OverlayScrollbars.css": path.resolve(
        "./node_modules/overlayscrollbars/styles/overlayscrollbars.css",
      ),
      react: path.resolve("./node_modules/react"),
      "react-dom": path.resolve("./node_modules/react-dom"),
      "react-final-form": path.resolve(
        __dirname,
        "./node_modules/react-final-form",
      ),
      "@demo": path.resolve(__dirname, "./src"),
      "@extensions": path.resolve("./packages/easy-email-extensions/src"),
      "@core": path.resolve("./packages/easy-email-core/src"),
      "@arco-themes": path.resolve("./node_modules/@arco-themes"),
      "@arco-design/web-react/dist/css/arco.css": path.resolve(
        "./node_modules/@arco-design/web-react/dist/css/arco.css",
      ),
      "@arco-design/web-react": path.resolve(
        "./node_modules/@arco-design/web-react",
      ),
      "final-form": path.resolve("./node_modules/final-form"),
      "final-form-arrays": path.resolve("./node_modules/final-form-arrays"),
      "final-form-set-field-touched": path.resolve(
        "./node_modules/final-form-set-field-touched",
      ),
      "react-final-form-arrays": path.resolve(
        "./node_modules/react-final-form-arrays",
      ),
      "react-codemirror2": path.resolve("./node_modules/react-codemirror2"),
      "react-color": path.resolve("./node_modules/react-color"),
      "react-use": path.resolve("./node_modules/react-use"),
      codemirror: path.resolve("./node_modules/codemirror"),
      "codemirror/lib/codemirror.css": path.resolve(
        "./node_modules/codemirror/lib/codemirror.css",
      ),
      "codemirror/theme/material.css": path.resolve(
        "./node_modules/codemirror/theme/material.css",
      ),
      "codemirror/theme/neat.css": path.resolve(
        "./node_modules/codemirror/theme/neat.css",
      ),
      "codemirror/mode/xml/xml.js": path.resolve(
        "./node_modules/codemirror/mode/xml/xml.js",
      ),
      "is-hotkey": path.resolve("./node_modules/is-hotkey"),
      lodash: path.resolve("./node_modules/lodash"),
      "mjml-browser": path.resolve("./node_modules/mjml-browser"),
      overlayscrollbars: path.resolve("./node_modules/overlayscrollbars"),
      "overlayscrollbars-react": path.resolve(
        "./node_modules/overlayscrollbars-react",
      ),
      "@": path.resolve("./packages/easy-email-editor/src"),
      "easy-email-core": path.resolve(
        "./packages/easy-email-core/src/index.tsx",
      ),
      "easy-email-editor/lib/locales.json": path.resolve(
        "./packages/easy-email-editor/public/locales.json",
      ),
      "easy-email-localization": path.resolve(
        "./packages/easy-email-localization",
      ),
      "easy-email-editor": path.resolve(
        "./packages/easy-email-editor/src/index.tsx",
      ),
      "easy-email-extensions": path.resolve(
        "./packages/easy-email-extensions/src/index.tsx",
      ),
    },
  },

  define: {},
  esbuild: {
    jsxInject: 'import "@arco-design/web-react/dist/css/arco.css";',
  },
  build: {
    minify: "terser",
    manifest: true,
    sourcemap: true,
    target: "es2015",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/\/node_modules\/html2canvas\/.*/.test(id)) {
            return "html2canvas";
          }
          if (/\/node_modules\/lodash\/.*/.test(id)) {
            return "lodash";
          }
          if (/\/node_modules\/mjml-browser\/.*/.test(id)) {
            return "mjml-browser";
          }
          if (/easy-email.*/.test(id)) {
            return "easy-email-editor";
          }
        },
      },
    },
  },
  css: {
    modules: {
      localsConvention: "dashes",
    },
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
      less: {
        javascriptEnabled: true,
      },
    },
  },
  plugins: [
    reactRefresh(),

    injectHtml({
      data: {
        buildTime: `<meta name="updated-time" content="${new Date().toUTCString()}" />`,
      },
    }),
  ].filter(Boolean),
});
