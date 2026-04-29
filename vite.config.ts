import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    proxy: {
      "/openai-proxy": {
        target: "https://api.openai.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/openai-proxy/, ""),
      },
    },
  },
});

