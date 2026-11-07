#!/usr/bin/env node
/**
 * weave-check v0 (P0): validate a World Bundle and run the 22 SHP conformance cases.
 *
 *   weave-check ./worlds/pixel-rooftop
 *   weave-check ./worlds/neon-alley --conformance --json
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { validateManifest } from "./manifest.mjs";
import { verifyManifestSignature } from "./signature.mjs";
import { runConformance } from "./cases.mjs";

const args = process.argv.slice(2);
const path = args.find((a) => !a.startsWith("-"));
const asJson = args.includes("--json");
const conformance = args.includes("--conformance");
const strict = args.includes("--strict");

if (!path) {
  console.error("usage: weave-check <world-dir> [--conformance] [--json] [--strict]");
  process.exit(2);
}

let manifest;
try {
  manifest = JSON.parse(readFileSync(join(path, "world.json"), "utf8"));
} catch (err) {
  console.error(`weave-check: cannot read ${join(path, "world.json")}: ${err.message}`);
  process.exit(2);
}

const v = validateManifest(manifest, { distributionUrl: manifest.id });
const sig = verifyManifestSignature(manifest);
const cases = conformance ? runConformance(manifest) : [];
const failedCases = cases.filter((c) => !c.ok);
const errors = [...v.errors];
if (!sig.ok) errors.push(`signature: ${sig.reason}`);

const report = {
  world: path,
  id: manifest.id,
  ok: errors.length === 0 && failedCases.length === 0,
  manifest: { errors: v.errors, warnings: v.warnings, signature: sig },
  conformance: { total: cases.length, passed: cases.length - failedCases.length, failed: failedCases.map((c) => c.id), cases },
};

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`weave-check ${path}`);
  console.log(`  manifest: ${v.errors.length === 0 ? "OK" : "FAIL"}${v.warnings.length ? ` (${v.warnings.length} warning)` : ""}`);
  for (const w of v.warnings) console.log(`    warn: ${w}`);
  for (const e of v.errors) console.log(`    error: ${e}`);
  console.log(`  signature: ${sig.ok ? "OK" : "FAIL"} — ${sig.reason}`);
  if (conformance) {
    console.log(`  conformance: ${report.conformance.passed}/${report.conformance.total}`);
    for (const c of cases) console.log(`    ${c.ok ? "PASS" : "FAIL"}  ${c.id} [${c.level}]  ${c.detail}`);
  }
  console.log(`  RESULT: ${report.ok ? "PASS" : "FAIL"}`);
}

process.exit(report.ok ? 0 : 1);
