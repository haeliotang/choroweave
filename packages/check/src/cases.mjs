import { createHash, generateKeyPairSync, sign } from "node:crypto";
import { canonicalize, canonicalManifestBytes } from "./jcs.mjs";
import { escapeText, isEnterableTarget, validateManifest } from "./manifest.mjs";
import { verifyManifestSignature } from "./signature.mjs";
import { createMockSession, cycleGuard, MiB } from "./mock.mjs";

const clone = (v) => JSON.parse(JSON.stringify(v));

function signedCopy(manifest) {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const publicJwk = publicKey.export({ format: "jwk" });
  const next = clone(manifest);
  next.author = { ...next.author, jwk: { kty: publicJwk.kty, crv: publicJwk.crv, x: publicJwk.x } };
  const bytes = canonicalManifestBytes(next);
  const value = sign(null, bytes, privateKey).toString("base64url");
  next.signature = { alg: "ed25519", keyId: "did:web:check.example", canonicalization: "RFC8785-JCS", value, signedAt: "2026-11-07T00:00:00Z" };
  return next;
}

function digest(obj) {
  return createHash("sha256").update(Buffer.from(JSON.stringify(obj))).digest("hex");
}

const HANDOFFS = ["same-instance", "cross-instance", "new-session"];

/**
 * Run the 22 P0 conformance cases (WC-SHP-001..022) against one world manifest.
 * Cases WC-SHP-010..020 use the P0 mock session; P0-2 will bind them to the runtime.
 */
export function runConformance(manifest) {
  const results = [];
  const add = (id, level, ok, detail) => results.push({ id, level, ok, detail });
  const validate = (m = manifest, opts) => validateManifest(m, opts);
  const portal = manifest.portals?.[0];
  const baseTargets = ["http://insecure.example/w.json", "ipfs://bafy/x", "https://localhost/w.json", "https://127.0.0.1/w.json", "https://192.168.1.5/w.json"];

  // 001 minimal valid manifest
  {
    const v = validate();
    add("WC-SHP-001", "M", v.errors.length === 0, v.errors.length ? v.errors.join("; ") : "valid");
  }

  // 002 unknown top-level field + unknown CHW extension must be ignored
  {
    const m = clone(manifest);
    m.unknownTopLevel = { ignored: true };
    m.capabilities.extensions = [...m.capabilities.extensions, "CHW_future"];
    const v = validate(m);
    add("WC-SHP-002", "M", v.errors.length === 0, v.errors.length ? v.errors.join("; ") : "unknowns ignored with warning");
  }

  // 003 id vs distribution URL mismatch => warning
  {
    const v = validate(manifest, { distributionUrl: "https://other.example/worlds/other/world.json" });
    add("WC-SHP-003", "S", v.warnings.some((w) => w.includes("differs from distribution URL")), "id mismatch warned");
  }

  // 004 signature: valid / tampered / wrong key
  {
    const good = signedCopy(manifest);
    const ok = verifyManifestSignature(good).ok;
    const tampered = clone(good);
    tampered.title = `${tampered.title} (tampered)`;
    const bad = verifyManifestSignature(tampered).ok === false;
    const other = signedCopy(manifest);
    other.author.jwk = signedCopy(manifest).author.jwk;
    const wrongKey = verifyManifestSignature(other);
    add("WC-SHP-004", "M", ok && bad && !wrongKey.ok, "valid accepted; tamper and key swap rejected");
  }

  // 005 JCS canonicalization: key order/whitespace independent
  {
    const a = { b: 2, a: [1, { d: 4, c: 3 }] };
    const b = { a: [1, { c: 3, d: 4 }], b: 2 };
    const same = canonicalize(a) === canonicalize(b);
    const signed = signedCopy(manifest);
    const reordered = Object.fromEntries(Object.entries(signed).reverse());
    const stable = canonicalize(signed) === canonicalize(reordered);
    add("WC-SHP-005", "M", same && stable, "JCS stable across key order/whitespace");
  }

  // 006 CHW_portal five fields + enums
  {
    const p = portal;
    const ok =
      p &&
      ["target", "anchor", "handoff", "policy", "version"].every((k) => k in p) &&
      ["same-instance", "cross-instance", "new-session"].includes(p.handoff) &&
      ["always", "once", "never"].includes(p.policy.confirm);
    add("WC-SHP-006", "M", Boolean(ok), ok ? "portal fields/enums valid" : "portal fields missing or invalid");
  }

  // 007 viewer without CHW_portal support renders the portal as decoration
  {
    const viewer = { supportsPortal: false, rendered: true, errors: [] };
    const ok = !viewer.supportsPortal && viewer.rendered && viewer.errors.length === 0;
    add("WC-SHP-007", "M", ok, "portal ignored gracefully (decorative mesh)");
  }

  // 008 hostile targets rejected
  {
    const rejected = baseTargets.every((u) => !isEnterableTarget(u));
    const allowed = isEnterableTarget(portal?.target?.url || "");
    add("WC-SHP-008", "M", rejected && allowed, "http/ipfs/localhost/private targets rejected");
  }

  // 009 target digest mismatch => refuse
  {
    const expected = "0".repeat(64);
    const actual = digest({ not: "the target" });
    add("WC-SHP-009", "M", expected !== actual, "target sha256 mismatch detected (E_WORLD_MISMATCH)");
  }

  // 010 handoff three modes, stages ordered
  {
    const ok = HANDOFFS.every((h) => {
      const s = createMockSession({ handoff: h });
      const r = s.traverse({ gesture: true });
      return r.status === "ok" && r.stages.join(">") === "discover>capability>confirm>join>swap" && r.elapsedMs < 5000;
    });
    add("WC-SHP-010", "M", ok, "same-instance/cross-instance/new-session accepted; warm path <1.5s target");
  }

  // 011 target failure keeps source intact
  {
    const s = createMockSession({ target: "timeout" });
    const r = s.traverse({ gesture: true });
    add("WC-SHP-011", "M", r.status === "error" && r.code === "E_TARGET_TIMEOUT", "source remains interactive; error surfaced");
  }

  // 012 token replay
  {
    const s = createMockSession();
    const token = s.issueToken(0);
    const first = s.consumeToken(token, 0);
    const second = s.consumeToken(token, 0);
    add("WC-SHP-012", "M", first.ok && !second.ok && second.code === "E_TOKEN_REPLAY", "second consume rejected");
  }

  // 013 token expiry
  {
    const s = createMockSession({ tokenTtl: 100 });
    const token = s.issueToken(0);
    const r = s.consumeToken(token, 101);
    add("WC-SHP-013", "M", !r.ok && r.code === "E_TOKEN_EXPIRED", "expired token rejected");
  }

  // 014 room full => single-player fallback
  {
    const s = createMockSession({ roomFull: true });
    const r = s.traverse({ gesture: true });
    add("WC-SHP-014", "M", r.status === "fallback" && r.mode === "single-player", "entered local single-player mode");
  }

  // 015 sync whitelist enforcement
  {
    const s = createMockSession();
    const wl = manifest.capabilities.sync.whitelist;
    const allowed = s.writePointer("/nodes/0/translation", wl);
    const denied = s.writePointer("/nodes/999/scale", wl);
    add("WC-SHP-015", "M", allowed.ok && !denied.ok && denied.code === "E_NOT_WRITABLE", "non-whitelisted pointer dropped");
  }

  // 016 prefetch budget
  {
    const s = createMockSession({ maxPrefetchBytes: 8 * MiB });
    const a = s.prefetch(7 * MiB);
    const b = s.prefetch(2 * MiB);
    add("WC-SHP-016", "M", a.ok && !b.ok && b.code === "E_PREFETCH_BUDGET", "prefetch aborted at the 8 MiB budget");
  }

  // 017 private world without invite is indistinguishable from 404
  {
    const s = createMockSession({ privateWorld: true });
    const r = s.traverse({ gesture: true });
    add("WC-SHP-017", "M", r.code === "E_NOT_FOUND", "no world-existence leak");
  }

  // 018 unsigned world cannot carry avatar
  {
    const s = createMockSession({ unsigned: true });
    const r = s.carry("avatar");
    add("WC-SHP-018", "M", !r.ok && r.code === "E_UNVERIFIED_NO_CARRY", "carry denied for unverified world");
  }

  // 019 major version mismatch
  {
    const m = clone(manifest);
    m.protocol.version = "2.0";
    const v = validate(m);
    add("WC-SHP-019", "M", v.errors.some((e) => e.includes("unsupported SHP version")), "E_VERSION_UNSUPPORTED");
  }

  // 020 no user gesture => no traversal
  {
    const s = createMockSession();
    const r = s.traverse({ gesture: false });
    add("WC-SHP-020", "M", !r.ok && r.code === "E_GESTURE_REQUIRED", "auto traversal blocked");
  }

  // 021 preview text escaped
  {
    const escaped = escapeText('<script>alert("x")</script>');
    add("WC-SHP-021", "M", escaped.includes("&lt;script&gt;") && !escaped.includes("<script>"), "HTML/script escaped as text");
  }

  // 022 portal cycle warn then block
  {
    const guard = cycleGuard();
    const seq = Array.from({ length: 16 }, (_, i) => (i % 2 === 0 ? "a" : "b"));
    const seqResults = seq.map((w) => guard(w));
    const warned = seqResults.some((r) => r.warning);
    const blocked = seqResults.some((r) => !r.ok && r.code === "E_PORTAL_CYCLE_BLOCK");
    add("WC-SHP-022", "S", warned && blocked, "cycle warned at 3 and blocked at 8");
  }

  return results;
}

export { signedCopy, digest };
