/**
 * P0 mock session used by the conformance suite.
 * It models the SHP traversal contract (not a network stack); P0-2 wires the
 * same assertions to the real runtime.
 */

export const MiB = 1024 * 1024;

export function createMockSession(opts = {}) {
  const cfg = {
    target: "ok", // ok | 404 | timeout | signature-invalid | version-unsupported
    handoff: "cross-instance",
    tokenTtl: 1000,
    roomFull: false,
    privateWorld: false,
    unsigned: false,
    carryAvatar: true,
    gestureRequired: true,
    maxPrefetchBytes: 8 * MiB,
    ...opts,
  };
  const issued = new Map();
  const consumed = new Set();
  const written = [];
  let prefetched = 0;
  let nonce = 0;

  return {
    cfg,
    issueToken(now = 0) {
      nonce += 1;
      const token = `tok-${nonce}`;
      issued.set(token, { exp: now + cfg.tokenTtl, used: false });
      return token;
    },
    traverse({ gesture = true, now = 0, token } = {}) {
      if (cfg.gestureRequired && !gesture) return { status: "error", code: "E_GESTURE_REQUIRED" };
      if (cfg.target === "404") return { status: "error", code: "E_TARGET_NOT_FOUND" };
      if (cfg.target === "timeout") return { status: "error", code: "E_TARGET_TIMEOUT" };
      if (cfg.target === "signature-invalid") return { status: "error", code: "E_SIGNATURE_INVALID" };
      if (cfg.target === "version-unsupported") return { status: "error", code: "E_VERSION_UNSUPPORTED" };
      if (cfg.privateWorld) return { status: "error", code: "E_NOT_FOUND" }; // indistinguishable from 404
      if (token && !this.consumeToken(token, now).ok) return { status: "error", code: "E_TOKEN_REPLAY" };
      if (cfg.roomFull) return { status: "fallback", mode: "single-player", stages: ["discover", "capability", "confirm", "local-session"] };
      const stages = ["discover", "capability", "confirm", "join", "swap"];
      return { status: "ok", stages, handoff: cfg.handoff, elapsedMs: cfg.handoff === "new-session" ? 4800 : 1360 };
    },
    consumeToken(token, now = 0) {
      const rec = issued.get(token);
      if (!rec) return { ok: false, code: "E_TOKEN_UNKNOWN" };
      if (rec.used) return { ok: false, code: "E_TOKEN_REPLAY" };
      if (now > rec.exp) return { ok: false, code: "E_TOKEN_EXPIRED" };
      rec.used = true;
      consumed.add(token);
      return { ok: true };
    },
    writePointer(pointer, whitelist) {
      const allowed = whitelist.some((p) => matchPointer(p, pointer));
      if (!allowed) return { ok: false, code: "E_NOT_WRITABLE" };
      written.push(pointer);
      return { ok: true };
    },
    prefetch(bytes) {
      if (prefetched + bytes > cfg.maxPrefetchBytes) {
        return { ok: false, code: "E_PREFETCH_BUDGET", accepted: cfg.maxPrefetchBytes - prefetched };
      }
      prefetched += bytes;
      return { ok: true, accepted: bytes };
    },
    get prefetched() {
      return prefetched;
    },
    get written() {
      return written.slice();
    },
    carry(kind) {
      if (cfg.unsigned) return { ok: false, code: "E_UNVERIFIED_NO_CARRY" };
      if (kind === "avatar" && !cfg.carryAvatar) return { ok: false, code: "E_CARRY_DENIED" };
      return { ok: true };
    },
  };
}

function matchPointer(pattern, pointer) {
  const pre = pattern.match(/^\/nodes\/\{([A-Za-z_][A-Za-z0-9_]*)\}\//);
  if (pre) {
    const suffix = pattern.split("/").slice(3).join("/");
    return new RegExp(`^/nodes/\\d+/` + suffix + "$").test(pointer);
  }
  return pattern === pointer;
}

/** Portal cycle detector used by WC-SHP-022. */
export function cycleGuard(visitLimitWarn = 3, visitLimitBlock = 8) {
  const visits = new Map();
  return function visit(worldId) {
    const n = (visits.get(worldId) || 0) + 1;
    visits.set(worldId, n);
    if (n >= visitLimitBlock) return { ok: false, code: "E_PORTAL_CYCLE_BLOCK" };
    if (n >= visitLimitWarn) return { ok: true, warning: "E_PORTAL_CYCLE_WARN" };
    return { ok: true };
  };
}
