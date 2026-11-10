// SPDX-FileCopyrightText: 2026 Inceptless <support@inceptless.com>
// SPDX-License-Identifier: Apache-2.0
/**
 * Minimal SHP world.json validator for P0.
 * Intentionally hand-written (zero deps) and scoped to the fields exercised by
 * the 22 conformance cases; the canonical schema remains schemas/world-manifest.schema.json.
 */

const CHW = ["CHW_portal", "CHW_collider", "CHW_logic", "CHW_avatar"];
const HANDOFF = ["same-instance", "cross-instance", "new-session"];
const CONFIRM = ["always", "once", "never"];
const PREFETCH = ["none", "gaze", "proximity", "eager"];
const RATINGS = ["general", "teen", "mature"];
const TARGET_SCHEME = /^https:\/\/[^\s]+$/;

const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
const isStr = (v) => typeof v === "string" && v.length > 0;
const isPos = (v) => Array.isArray(v) && v.length === 3 && v.every((n) => typeof n === "number");

export function validateManifest(manifest, { distributionUrl } = {}) {
  const errors = [];
  const warnings = [];
  const err = (m) => errors.push(m);
  const warn = (m) => warnings.push(m);

  if (!isObj(manifest)) return { errors: ["manifest must be an object"], warnings };
  if (manifest.schemaVersion !== "0.1") err("schemaVersion must be 0.1");
  if (!TARGET_SCHEME.test(manifest.id || "")) err("id must be an https URL");
  if (distributionUrl && manifest.id !== distributionUrl) warn(`id (${manifest.id}) differs from distribution URL (${distributionUrl})`);
  if (!isStr(manifest.title)) err("title is required");
  if (!isStr(manifest.author?.name)) err("author.name is required");
  if (!isStr(manifest.license)) err("license is required");
  if (!isStr(manifest.createdAt)) err("createdAt is required");
  if (manifest.protocol?.name !== "SHP") err("protocol.name must be SHP");
  if (manifest.protocol?.version !== "0.1") {
    errors.push(`unsupported SHP version ${manifest.protocol?.version ?? "(missing)"} (major mismatch)`);
  }
  if (!/^scene\/[A-Za-z0-9._/-]+\.glb$/.test(manifest.entry?.scene || "")) err("entry.scene must be scene/*.glb");
  if (manifest.entry?.format !== "gltf-2.0") err("entry.format must be gltf-2.0");
  if (!isStr(manifest.spawn?.node)) err("spawn.node is required");
  if (!isPos(manifest.spawn?.position)) err("spawn.position must be [x,y,z]");
  if (!Array.isArray(manifest.assets)) err("assets must be an array");

  const caps = manifest.capabilities;
  if (!isObj(caps)) err("capabilities is required");
  else {
    if (caps.interactivity?.extension !== "KHR_interactivity") err("capabilities.interactivity.extension must be KHR_interactivity");
    if (!Array.isArray(caps.extensions) || caps.extensions.length === 0) err("capabilities.extensions must be non-empty");
    else {
      for (const e of caps.extensions) if (!CHW.includes(e)) warn(`unknown extension ${e} (must be ignored, not fatal)`);
      if (!caps.extensions.includes("CHW_portal") && Array.isArray(manifest.portals) && manifest.portals.length > 0) {
        warn("portals present but CHW_portal is not declared in capabilities.extensions");
      }
    }
    if (!Number.isInteger(caps.maxPlayers) || caps.maxPlayers < 1 || caps.maxPlayers > 64) err("capabilities.maxPlayers must be 1..64");
    if (!isObj(caps.audio)) err("capabilities.audio is required");
    if (!isObj(caps.avatar)) err("capabilities.avatar is required");
    if (!Number.isFinite(caps.sync?.rateHz) || caps.sync.rateHz < 1 || caps.sync.rateHz > 30) err("capabilities.sync.rateHz must be 1..30");
    if (!Array.isArray(caps.sync?.whitelist) || caps.sync.whitelist.length === 0) err("capabilities.sync.whitelist must be non-empty");
    else {
      const re = /^\/(nodes\/\{[A-Za-z_][A-Za-z0-9_]*\}\/[A-Za-z0-9_]+|extensions\/CHW_logic\/props\/[A-Za-z_][A-Za-z0-9_]*)(\/[A-Za-z0-9_]+)*$/;
      for (const p of caps.sync.whitelist) if (!re.test(p)) err(`sync.whitelist pointer invalid: ${p}`);
    }
  }

  const budget = manifest.perf?.budget;
  if (!isObj(budget)) err("perf.budget is required");
  else {
    for (const [k, min, max] of [["triangles", 1000, 5_000_000], ["drawCalls", 8, 2000], ["textureMB", 8, 2048], ["firstByteKB", 256, 15360]]) {
      const v = budget[k];
      if (typeof v !== "number" || v < min || v > max) err(`perf.budget.${k} must be ${min}..${max}`);
    }
  }

  if (!RATINGS.includes(manifest.moderation?.rating)) err("moderation.rating must be general|teen|mature");
  if (typeof manifest.moderation?.allowGuests !== "boolean") err("moderation.allowGuests must be boolean");

  const portals = manifest.portals;
  if (!Array.isArray(portals)) err("portals must be an array");
  else {
    const ids = new Set();
    for (const [i, p] of portals.entries()) {
      const at = `portals[${i}]`;
      if (!isObj(p)) { err(`${at} must be an object`); continue; }
      if (!/^[a-z][a-z0-9_]{1,63}$/.test(p.id || "")) err(`${at}.id invalid`);
      else if (ids.has(p.id)) err(`${at}.id duplicated`);
      else ids.add(p.id);
      if (!/^[a-z][a-z0-9_]{1,63}$/.test(p.entity || "")) err(`${at}.entity invalid`);
      if (!TARGET_SCHEME.test(p.target?.url || "")) err(`${at}.target.url must be https`);
      if (p.target?.sha256 && !/^[a-f0-9]{64}$/.test(p.target.sha256)) err(`${at}.target.sha256 invalid`);
      if (!isPos(p.anchor?.position)) err(`${at}.anchor.position invalid`);
      if (!isStr(p.anchor?.spawnNode)) err(`${at}.anchor.spawnNode is required`);
      if (!HANDOFF.includes(p.handoff)) err(`${at}.handoff must be ${HANDOFF.join("|")}`);
      if (!CONFIRM.includes(p.policy?.confirm)) err(`${at}.policy.confirm invalid`);
      if (!Array.isArray(p.policy?.carry)) err(`${at}.policy.carry must be an array`);
      if (typeof p.policy?.allowGuests !== "boolean") err(`${at}.policy.allowGuests must be boolean`);
      if (!PREFETCH.includes(p.policy?.prefetch)) err(`${at}.policy.prefetch invalid`);
      if (p.policy?.maxPrefetchBytes !== undefined && (typeof p.policy.maxPrefetchBytes !== "number" || p.policy.maxPrefetchBytes < 0)) {
        err(`${at}.policy.maxPrefetchBytes invalid`);
      }
      if (p.version !== "0.1") err(`${at}.version must be 0.1`);
      if (p.preview && typeof p.preview.image !== "string") err(`${at}.preview.image invalid`);
    }
  }

  return { errors, warnings };
}

/** HTML escape for preview cards (WC-SHP-021). */
export function escapeText(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/** Reject targets that are not public https endpoints (WC-SHP-008). */
export function isEnterableTarget(url) {
  if (!TARGET_SCHEME.test(url || "")) return false;
  let host;
  try {
    host = new URL(url).hostname;
  } catch {
    return false;
  }
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) return false;
  if (/^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(host)) return false;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return false;
  if (/^\[?::1\]?$/.test(host)) return false;
  return true;
}
