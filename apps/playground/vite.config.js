// SPDX-FileCopyrightText: 2026 Inceptless <support@inceptless.com>
// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineConfig } from "vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const APP = resolve(fileURLToPath(new URL(".", import.meta.url)));
const ROOT = resolve(APP, "../..");
function gitCommit() {
  if (process.env.CHOROWEAVE_COMMIT) return process.env.CHOROWEAVE_COMMIT;
  try { return execFileSync("git", ["rev-parse", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim(); } catch { return ""; }
}
const SOURCE_URL = process.env.CHOROWEAVE_SOURCE_URL
  || `https://github.com/haeliotang/choroweave${gitCommit() ? `/tree/${gitCommit()}` : ""}`;

export default defineConfig({
  // The two P0 worlds live at the repo root and are served at /pixel-rooftop/...
  publicDir: resolve(ROOT, "worlds"),
  server: { port: 5173, strictPort: true },
  build: { outDir: "dist", emptyOutDir: true },
  define: { __CHOROWEAVE_SOURCE_URL__: JSON.stringify(SOURCE_URL) },
});
