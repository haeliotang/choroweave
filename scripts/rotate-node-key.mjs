#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Inceptless <support@inceptless.com>
// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * Rotate a fixture node's ed25519 identity and update the pinned trust anchors.
 * The node must be restarted to load the new key (descriptor signature changes).
 *
 *   node scripts/rotate-node-key.mjs --name alice
 */
import { readFileSync, writeFileSync } from "node:fs";
import { generateKeyPairSync, createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TLS = join(ROOT, ".p0-tls");
const args = process.argv.slice(2);
const name = (() => { const i = args.indexOf("--name"); return i >= 0 ? args[i + 1] : "alice"; })();
const origin = name === "alice" ? "https://alice.example:8443" : "https://hana.example:8444";

const { publicKey, privateKey } = generateKeyPairSync("ed25519");
const publicJwk = publicKey.export({ format: "jwk" });
const keyFile = join(TLS, "nodes", `${name}.json`);
const old = JSON.parse(readFileSync(keyFile, "utf8"));
writeFileSync(keyFile, JSON.stringify({ publicJwk, privatePem: privateKey.export({ type: "pkcs8", format: "pem" }) }, null, 2));

const trustFile = join(TLS, "trust.json");
const trust = JSON.parse(readFileSync(trustFile, "utf8"));
const oldX = trust.origins[origin].publicJwk.x;
trust.origins[origin].publicJwk = publicJwk;
trust.originPublicKeys = trust.originPublicKeys || {};
trust.originPublicKeys[origin] = { current: publicJwk.x, rotatedFrom: oldX, rotatedAt: new Date().toISOString() };
writeFileSync(trustFile, JSON.stringify(trust, null, 2));

const fingerprint = createHash("sha256").update(publicJwk.x).digest("hex").slice(0, 16);
console.log(JSON.stringify({ name, origin, oldX, newX: publicJwk.x, fingerprint, note: "restart the node to load the rotated key", oldKeyFile: old.publicJwk.x }, null, 2));
