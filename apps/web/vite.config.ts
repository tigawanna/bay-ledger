import { devtools } from "@tanstack/devtools-vite";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/solid-start/plugin/vite";
import { fileURLToPath } from "node:url";
import viteSolid from "vite-plugin-solid";
import { defineConfig, lazyPlugins } from "vite-plus";
// import analyze from "rollup-plugin-analyzer";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "~": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  plugins: lazyPlugins(() => [
    devtools(),
    tailwindcss(),
    tanstackStart({
      router: {
        routeToken: "layout", // <-- Add this line
      },
    }),
    viteSolid({ ssr: true }),
    // analyze({
    //   // highlight the modules with size > 40kb
    //   filter(moduleObject) {
    //     return moduleObject.size > 10000;
    //   },
    // }),
  ]),
  server: {
    port: 4040,
    proxy: {
      "/lambda": {
        target: "http://localhost:4566",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/lambda/, ""),
      },
    },
  },
});
