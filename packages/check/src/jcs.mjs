// SPDX-FileCopyrightText: 2026 Inceptless <support@inceptless.com>
// SPDX-License-Identifier: Apache-2.0
/**
 * RFC 8785 (JCS) canonical JSON — sufficient subset for SHP manifests.
 * Numbers are serialized with ECMAScript Number::toString (JCS requirement).
 */

function canonicalValue(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalValue).join(",")}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalValue(value[k])}`).join(",")}}`;
}

export function canonicalize(value) {
  return canonicalValue(value);
}

/** Canonical bytes of a manifest with the signature field excluded (SHP §7). */
export function canonicalManifestBytes(manifest) {
  const { signature, ...rest } = manifest;
  return Buffer.from(canonicalize(rest), "utf8");
}
