import { defineConfig } from "vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const APP = resolve(fileURLToPath(new URL(".", import.meta.url)));
const ROOT = resolve(APP, "../..");

export default defineConfig({
  // The two P0 worlds live at the repo root and are served at /pixel-rooftop/...
  publicDir: resolve(ROOT, "worlds"),
  server: { port: 5173, strictPort: true },
  build: { outDir: "dist", emptyOutDir: true },
});
