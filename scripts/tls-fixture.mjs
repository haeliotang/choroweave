#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Inceptless <support@inceptless.com>
// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * Generate a disposable local CA + certs for the P0 two-node fixture.
 * Test-only: never use these keys or trust anchors in production.
 *
 * Outputs (gitignored) under .p0-tls/:
 *   ca.crt, alice.crt/key, hana.crt/key
 *   nodes/alice.json, nodes/hana.json  (ed25519 node identity, test keys)
 *   trust.json                         (origin -> public JWK + leaf SPKI pin)
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { generateKeyPairSync } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, ".p0-tls");
mkdirSync(join(DIR, "nodes"), { recursive: true });

function sh(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { cwd: DIR, encoding: "utf8", ...opts }).trim();
}

const ORIGINS = {
  alice: "https://alice.example:8443",
  hana: "https://hana.example:8444",
};

// 1) CA
sh("openssl", ["genrsa", "-out", "ca.key", "2048"]);
sh("openssl", ["req", "-x509", "-new", "-nodes", "-key", "ca.key", "-sha256", "-days", "3", "-subj", "/CN=P0 Fixture CA", "-out", "ca.crt"]);

// 2) leaf certs with SAN
for (const host of ["alice", "hana"]) {
  sh("openssl", ["genrsa", "-out", `${host}.key`, "2048"]);
  sh("openssl", ["req", "-new", "-key", `${host}.key`, "-subj", `/CN=${host}.example`, "-out", `${host}.csr`]);
  writeFileSync(
    join(DIR, `${host}.ext`),
   ["basicConstraints=CA:FALSE", "keyUsage=digitalSignature,keyEncipherment", "extendedKeyUsage=serverAuth",
     `subjectAltName=DNS:${host}.example,DNS:localhost,IP:127.0.0.1`].join("\n") + "\n",
  );
  sh("openssl", ["x509", "-req", "-in", `${host}.csr`, "-CA", "ca.crt", "-CAkey", "ca.key", "-CAcreateserial", "-out", `${host}.crt`, "-days", "3", "-sha256", "-extfile", `${host}.ext`]);
}

function spki(crt) {
  return sh("openssl", ["x509", "-in", crt, "-pubkey", "-noout"]).length
    ? sh("bash", ["-lc", `openssl x509 -in ${crt} -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl base64 -A`])
    : "";
}

// 3) test node identities (ed25519) + trust anchors
const anchors = {};
for (const name of ["alice", "hana"]) {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const publicJwk = publicKey.export({ format: "jwk" });
  writeFileSync(join(DIR, "nodes", `${name}.json`), JSON.stringify({ publicJwk, privatePem: privateKey.export({ type: "pkcs8", format: "pem" }) }, null, 2));
  anchors[ORIGINS[name]] = { origin: ORIGINS[name], publicJwk, spkiSha256: spki(`${name}.crt`) };
}
writeFileSync(join(DIR, "trust.json"), JSON.stringify({ fixture: "p0-tls", createdAt: new Date().toISOString(), origins: anchors }, null, 2));

const pins = Object.values(anchors).map((a) => a.spkiSha256).join(",");
console.log(JSON.stringify({ dir: DIR, origins: ORIGINS, spkiPins: pins, ca: join(DIR, "ca.crt") }, null, 2));
