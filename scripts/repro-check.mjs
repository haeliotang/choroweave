#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Inceptless <support@inceptless.com>
// SPDX-License-Identifier: AGPL-3.0-or-later
/** Preflight for an external P0 reproduction (no project knowledge required). */
import { existsSync, readFileSync } from "node:fs";
import { createServer } from "node:net";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const checks = [];
const check = (name, ok, detail = "") => { checks.push({ name, ok, detail }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`); };

const major = Number(process.versions.node.split(".")[0]);
check("Node >= 24", major >= 24, process.version);
try { execFileSync("pnpm", ["--version"], { stdio: "ignore" }); check("pnpm available", true); } catch { check("pnpm available", false, "install pnpm 10.x"); }
try { execFileSync("openssl", ["version"], { stdio: "ignore" }); check("openssl available", true); } catch { check("openssl available", false, "needed by tls-fixture"); }
check("workspace package.json", existsSync(join(ROOT, "package.json")));
check("TLS fixture present (run pnpm tls:fixture)", existsSync(join(ROOT, ".p0-tls/trust.json")), "optional: reproduce will generate it");
check("built client (run pnpm build)", existsSync(join(ROOT, "apps/playground/dist/index.html")));
const chrome = process.env.CHROME_PATH || ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium"].find((p) => existsSync(p));
check("Chrome/Chromium found", Boolean(chrome), chrome || "set CHROME_PATH");

const ports = await Promise.all([8443, 8444].map((port) => new Promise((resolve) => {
  const s = createServer();
  s.once("error", () => resolve({ port, free: false }));
  s.once("listening", () => s.close(() => resolve({ port, free: true })));
  s.listen(port, "127.0.0.1");
})));
for (const { port, free } of ports) check(`port ${port} free`, free, free ? "" : "stop the running P0 nodes first");

const failed = checks.filter((c) => !c.ok);
console.log(`\nPREFLIGHT: ${failed.length === 0 ? "PASS" : "FAIL"} (${checks.length - failed.length}/${checks.length})`);
process.exit(failed.length ? 1 : 0);
