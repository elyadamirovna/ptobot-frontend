import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import * as path from "path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico"],
      manifest: {
        name: "РБК СтройИнвест",
        short_name: "РБК Строй",
        start_url: "/",
        display: "standalone",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        navigateFallback: "/offline.html",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
