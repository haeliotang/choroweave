// SPDX-FileCopyrightText: 2026 Inceptless <support@inceptless.com>
// SPDX-License-Identifier: Apache-2.0
import { createHash, createPublicKey, verify as cryptoVerify } from "node:crypto";
import { canonicalManifestBytes } from "./jcs.mjs";

export function sha256Hex(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function b64uToBuf(s) {
  return Buffer.from(String(s).replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

/**
 * Verify an SHP ed25519 signature (RFC 8032) over RFC 8785 JCS bytes.
 * Returns { ok, reason } instead of throwing so callers can report diagnostics.
 */
export function verifyManifestSignature(manifest) {
  if (!manifest?.signature) return { ok: true, reason: "unsigned (allowed; unverified world)" };
  const sig = manifest.signature;
  if (sig.alg !== "ed25519") return { ok: false, reason: `unsupported alg ${sig.alg}` };
  if (sig.canonicalization && sig.canonicalization !== "RFC8785-JCS") {
    return { ok: false, reason: `unsupported canonicalization ${sig.canonicalization}` };
  }
  const jwk = manifest.author?.jwk;
  if (!jwk || jwk.kty !== "OKP" || jwk.crv !== "Ed25519") {
    return { ok: false, reason: "missing author ed25519 jwk" };
  }
  let key;
  try {
    key = createPublicKey({ key: { kty: "OKP", crv: "Ed25519", x: jwk.x }, format: "jwk" });
  } catch (err) {
    return { ok: false, reason: `invalid jwk: ${err.message}` };
  }
  try {
    const ok = cryptoVerify(null, canonicalManifestBytes(manifest), key, b64uToBuf(sig.value));
    return ok ? { ok: true, reason: "signature valid" } : { ok: false, reason: "signature mismatch" };
  } catch (err) {
    return { ok: false, reason: `signature error: ${err.message}` };
  }
}

export function digestOfManifest(manifest) {
  return sha256Hex(Buffer.from(JSON.stringify(manifest), "utf8"));
}
