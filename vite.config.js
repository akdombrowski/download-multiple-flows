import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
/** @type {import('vite').UserConfig} */
export default defineConfig({
  plugins: [react()],
  base: "/download-multiple-flows/",
  build: {
    outDir: "docs"
  }
});
