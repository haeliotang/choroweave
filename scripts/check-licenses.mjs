#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Inceptless <support@inceptless.com>
// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * Fail CI on dependency licences that are incompatible with this repository's
 * AGPL/Apache/CC-BY split. Uses pnpm's installed-metadata inventory; does not
 * install or replace dependencies.
 */
import { execFileSync } from "node:child_process";

const ALLOWED = [
  "0BSD", "AGPL-3.0", "AGPL-3.0-only", "AGPL-3.0-or-later",
  "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "CC0-1.0", "CC-BY-4.0",
  "GPL-3.0-or-later", "ISC", "LGPL-2.1-or-later", "LGPL-3.0", "MIT",
  "MPL-2.0", "Unicode-3.0", "Unicode-DFS-2016", "Unlicense", "Zlib",
];
function allowed(expr) {
  const s = expr.trim();
  if (ALLOWED.includes(s)) return true;
  // Parentheses + AND/OR: OR needs one allowed branch, AND needs all branches.
  const ors = s.split(/\s+OR\s+/i);
  if (ors.length > 1) return ors.some((p) => allowed(p.replace(/^\(|\)$/g, "")));
  const ands = s.split(/\s+AND\s+/i);
  if (ands.length > 1) return ands.every((p) => allowed(p.replace(/^\(|\)$/g, "")));
  return false;
}
const raw = execFileSync("pnpm", ["licenses", "list", "--json"], { encoding: "utf8" });
const inventory = JSON.parse(raw);
const bad = [];
let count = 0;
for (const [expr, packages] of Object.entries(inventory)) {
  const ok = allowed(expr);
  count += packages.length;
  if (!ok) bad.push({ license: expr, packages: packages.map((p) => p.name) });
  console.log(`${ok ? "PASS" : "FAIL"}  ${expr}  (${packages.length} package${packages.length === 1 ? "" : "s"})`);
}
console.log(`\nDependency inventory: ${count} packages`);
if (bad.length) {
  console.error("Incompatible licence expressions:");
  for (const b of bad) console.error(`- ${b.license}: ${b.packages.join(", ")}`);
  process.exit(1);
}
console.log("All dependency licences are compatible with the layered policy.");
