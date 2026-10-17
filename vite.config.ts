/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  // Served from https://wayansam.github.io/dn-overview/
  base: "/dn-overview/",
  build: {
    // Keep CRA's output folder so the gh-pages deploy script is unchanged.
    outDir: "build",
  },
  server: {
    port: 3000,
    open: true,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  },
});
