import { defineConfig, searchForWorkspaceRoot } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Source alias for great HMR
      "@charades/shared": path.resolve(__dirname, "../../packages/shared/src"),
    },
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    proxy: { "/api": { target: "http://127.0.0.1:8000", changeOrigin: true } },
    fs: {
      // IMPORTANT: include the workspace root (default) AND web root AND shared
      allow: [
        searchForWorkspaceRoot(process.cwd()),
        __dirname, // apps/web
        path.resolve(__dirname, "../../packages/shared"),
      ],
    },
  },
});
