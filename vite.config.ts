import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: false
      },
      manifest: {
        name: "QC Field Guide",
        short_name: "QC Guide",
        description:
          "Universal construction Quality Control field guide foundation.",
        theme_color: "#0f172a",
        background_color: "#f8fafc",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/pwa.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024
      }
    })
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src")
    }
  },
  test: {
    environment: "jsdom",
    include: ["tests/integration/**/*.{test,spec}.{ts,tsx}"],
    setupFiles: ["src/test/setup.ts"],
    globals: true
  }
});
