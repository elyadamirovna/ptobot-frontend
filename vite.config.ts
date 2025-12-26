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
        name: "PTObot Reports",
        short_name: "PTObot",
        start_url: "/",
        display: "standalone",
        theme_color: "#0b1226",
        background_color: "#0b1226",
        icons: [],
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
