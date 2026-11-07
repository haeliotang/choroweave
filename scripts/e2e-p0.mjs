#!/usr/bin/env node
/**
 * P0 e2e check: boot the playground in headless Chrome, traverse 10 times
 * (bidirectional) and verify rollback on a simulated target failure.
 *
 * Requires a running dev server:  pnpm dev
 * Optional env: P0_URL (default http://localhost:5173/), CHROME_PATH.
 */
import { chromium } from "playwright-core";
import { existsSync } from "node:fs";

const BASE = process.env.P0_URL || "http://localhost:5173/";
const CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);
const executablePath = CANDIDATES.find((p) => existsSync(p));
if (!executablePath) {
  console.error("e2e: no Chrome/Chromium found; set CHROME_PATH");
  process.exit(2);
}

const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ["--no-sandbox", "--enable-unsafe-swiftshader", "--use-angle=swiftshader"],
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error" && !m.text().includes("favicon")) errors.push(m.text());
});

const status = () => page.evaluate(() => window.__P0__?.status() ?? null);
const waitFor = (needle) =>
  page.waitForFunction((n) => window.__P0__?.status().world?.includes(n), needle, { timeout: 20000 });

let failed = 0;
const report = { jumps: [], rollback: null, pageErrors: errors };

try {
  await page.goto(BASE, { waitUntil: "load", timeout: 20000 });
  await waitFor("pixel-rooftop");
  console.log("boot: pixel-rooftop OK");

  for (let i = 1; i <= 10; i++) {
    const from = await status();
    const started = Date.now();
    await page.evaluate(() => {
      const p = window.__P0__.traverse();
      p && p.catch(() => {});
    });
    const expected = from.world.includes("pixel-rooftop") ? "neon-alley" : "pixel-rooftop";
    await waitFor(expected);
    const elapsed = Date.now() - started;
    const now = await status();
    const ok = now.world.includes(expected) && elapsed < 5000;
    if (!ok) failed++;
    report.jumps.push({ n: i, from: from.world, to: now.world, elapsedMs: elapsed, ok });
    console.log(`jump ${String(i).padStart(2, "0")}: ${ok ? "PASS" : "FAIL"} ${elapsed}ms`);
  }

  // Rollback: simulated target offline must keep the source world and state.
  await page.goto(`${BASE}?failPortal=1`, { waitUntil: "load", timeout: 20000 });
  await waitFor("pixel-rooftop");
  const before = await status();
  const traversed = await page.evaluate(async () => {
    try {
      await window.__P0__.traverse();
      return "resolved";
    } catch {
      return "rejected";
    }
  });
  await page.waitForTimeout(500);
  const after = await status();
  const toast = await page.locator("#toast").textContent();
  report.rollback = { before: before.world, after: after.world, traversed, toast };
  const rollbackOk = after.world === before.world && traversed === "rejected" && toast.includes("traversal failed");
  if (!rollbackOk) failed++;
  console.log(`rollback: ${rollbackOk ? "PASS" : "FAIL"}`);
} catch (err) {
  failed++;
  console.error("e2e error:", err.message);
} finally {
  report.pageErrors = errors;
  await browser.close();
}

console.log(`\nRESULT: ${failed === 0 ? "PASS" : "FAIL"} (${10 - report.jumps.filter((j) => !j.ok).length}/10 jumps, rollback ${report.rollback ? (failed === 0 ? "PASS" : "see report") : "n/a"})`);
if (failed) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(1);
}
