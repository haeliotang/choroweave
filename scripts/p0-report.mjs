#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Inceptless <support@inceptless.com>
// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * Unified P0-3 conformance report.
 * Aggregates: mock 22 (two worlds), live node protocol, live hardening, live browser.
 * Writes artifacts/p0-conformance.{json,md}; exits non-zero if any suite fails.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORTS = process.env.P0_REPORTS_DIR || join(ROOT, ".p0-reports");
const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const out = arg("--out", join(ROOT, "artifacts", "p0-conformance"));

// Mock: run the existing CLI for both worlds (keeps the mock suite the source of truth).
const worlds = ["pixel-rooftop", "neon-alley"];
const mockWorlds = worlds.map((w) => {
  const json = execFileSync(process.execPath, [join(ROOT, "packages/check/src/cli.mjs"), join(ROOT, "worlds", w), "--conformance", "--json"], { encoding: "utf8" });
  const r = JSON.parse(json);
  return { world: w, passed: r.conformance.passed, total: r.conformance.total, ok: r.ok };
});

function read(name) {
  const p = join(REPORTS, name);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, "utf8"));
}
const liveNode = read("live-node.json");
const hardening = read("live-hardening.json");
const browser = read("live-browser.json");

const suites = [];
suites.push({
  id: "mock-conformance",
  layer: "mock",
  passed: mockWorlds.reduce((a, w) => a + w.passed, 0),
  total: mockWorlds.reduce((a, w) => a + w.total, 0),
  ok: mockWorlds.every((w) => w.ok),
  detail: "2 worlds × 22 cases (mock session)",
});
if (liveNode) {
  const passed = liveNode.results.filter((r) => r.ok).length;
  suites.push({ id: "live-node", layer: "live", passed, total: liveNode.results.length, ok: passed === liveNode.results.length, detail: "descriptors, tokens, replay, expiry, unreachable, timeout, trust" });
} else suites.push({ id: "live-node", layer: "live", passed: 0, total: 0, ok: false, detail: "missing .p0-reports/live-node.json" });
if (hardening) {
  const passed = hardening.results.filter((r) => r.ok).length;
  suites.push({ id: "live-hardening", layer: "live", passed, total: hardening.results.length, ok: passed === hardening.results.length, detail: "rate limit, session quota, room-full, private world, key rotation" });
} else suites.push({ id: "live-hardening", layer: "live", passed: 0, total: 0, ok: false, detail: "missing .p0-reports/live-hardening.json" });
if (browser) {
  const checks = [
    ...browser.jumps.map((j) => j.ok),
    Boolean(browser.rollback?.before && browser.rollback.before === browser.rollback.after),
    browser.gesture?.code === "E_GESTURE_REQUIRED" && browser.gesture?.unchanged === true,
    browser.roomFull?.singlePlayer === true,
    browser.liveChecks?.budget?.ok === false,
    browser.liveChecks?.write?.allowed?.ok === true && browser.liveChecks?.write?.denied?.ok === false,
  ];
  suites.push({ id: "live-browser", layer: "live-browser", passed: checks.filter(Boolean).length, total: checks.length, ok: checks.every(Boolean), detail: "10 jumps, rollback, gesture, room-full, prefetch budget, whitelist" });
} else suites.push({ id: "live-browser", layer: "live-browser", passed: 0, total: 0, ok: false, detail: "missing .p0-reports/live-browser.json" });

const report = {
  schema: "p0-conformance-report/0.1",
  generatedAt: new Date().toISOString(),
  layers: ["mock", "live", "live-browser"],
  suites,
  mockWorlds,
  ok: suites.every((s) => s.ok),
};

mkdirSync(dirname(out), { recursive: true });
writeFileSync(`${out}.json`, JSON.stringify(report, null, 2) + "\n");
const lines = [
  "# P0 conformance report",
  "",
  `Generated: ${report.generatedAt}`,
  "",
  "| Suite | Layer | Passed | Total | Result | Detail |",
  "|---|---|---:|---:|---|---|",
  ...suites.map((s) => `| ${s.id} | ${s.layer} | ${s.passed} | ${s.total} | ${s.ok ? "PASS" : "FAIL"} | ${s.detail} |`),
  "",
  "> Mock and live suites are separate. The 22-case mock suite is not a claim of 22 live cases.",
];
writeFileSync(`${out}.md`, lines.join("\n") + "\n");
for (const s of suites) console.log(`${s.ok ? "PASS" : "FAIL"}  ${s.layer.padEnd(12)} ${s.id.padEnd(18)} ${s.passed}/${s.total}`);
console.log(`\nREPORT: ${report.ok ? "PASS" : "FAIL"} -> ${out}.json / .md`);
process.exit(report.ok ? 0 : 1);
