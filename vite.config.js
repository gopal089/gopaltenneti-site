import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    target: "es2020",
    chunkSizeWarningLimit: 900,
    // Two pages: the portfolio and /certificates/.
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        certificates: resolve(import.meta.dirname, "certificates/index.html"),
      },
    },
  },
});
