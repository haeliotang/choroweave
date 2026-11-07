# P0 implementation status (2026-11-07)

> Scope: **P0-1** (two worlds + runtime), **P0-2** (real two-node HTTPS handshake + hardening), **P0-3** (unified conformance report), **P0-4** (external reproduction runbook; external run still pending).
> P0 acceptance (external reproduction + LAN/public performance evidence) is **not** met; G0 remains un-granted, target **2027-01-25**. Engineering implementation is complete; see [`p0-rc.md`](p0-rc.md) for the RC/validation split. Candidate tag: `p0-rc2` (runtime baseline `95f12d8`; tooling-only delta).
> Chinese: [`../p0-status.md`](../p0-status.md)

## What is implemented

| Piece | Location | Status |
|---|---|---|
| Two deterministic, hand-built worlds | `worlds/*`, `scripts/build-p0-worlds.mjs` | done |
| Babylon.js 9.x viewer (WebGL2), first-person | `apps/playground/` | done |
| Portal confirm → arrive token → atomic swap → rollback | `apps/playground/src/main.js` | done |
| Two independent HTTPS nodes, signed descriptors | `scripts/serve-node.mjs`, `scripts/tls-fixture.mjs` | done |
| Trust anchors pinned out-of-band | `.p0-tls/trust.json` (generated) | done |
| One-time `arrive` tokens (world/session/nonce/expiry) | `scripts/serve-node.mjs` | done |
| Rate limit, session quota, room-full, private world | `scripts/serve-node.mjs` (`P0_RATE_LIMIT`, `P0_SESSION_QUOTA`, `--room-full`, `--private`) | done |
| Key rotation procedure | `scripts/rotate-node-key.mjs` | done |
| One-click node launcher | `scripts/p0-up.mjs` (`pnpm p0:up`) | done |
| Mock conformance (22 cases × 2 worlds) | `packages/check/` | done |
| Live node / hardening / browser suites | `scripts/live-conformance.mjs`, `node-hardening.mjs`, `e2e-p0.mjs` | done |
| Unified conformance report | `scripts/p0-report.mjs`, `artifacts/p0-conformance.{json,md}` | done |
| Coverage matrix (22 cases × layers) | `fixtures/p0/coverage.json` | done |
| External reproduction runbook + preflight | `docs/en/reproduce-p0.md`, `scripts/repro-check.mjs` | ready |
| CI: mock + live + hardening + browser E2E + report | `.github/workflows/p0.yml` | done |

## Reproduce

```bash
pnpm install && pnpm run worlds:build && pnpm build && pnpm tls:fixture
pnpm test:p0                                   # mock 44/44
node scripts/live-conformance.mjs --json-out .p0-reports/live-node.json
node scripts/node-hardening.mjs --json-out .p0-reports/live-hardening.json
P0_LIVE=1 P0_REPORT_OUT=.p0-reports/live-browser.json node scripts/e2e-p0.mjs
node scripts/p0-report.mjs                     # unified mock/live report
# optional manual: pnpm p0:up
```

Full external runbook: [`reproduce-p0.md`](reproduce-p0.md).

## Engineering vs G0 acceptance

| Status | Meaning |
|---|---|
| **Engineering: complete** | P0-1…P0-4 tools implemented; CI green; mock/live layered suites pass |
| **G0 acceptance: not granted** | missing external reproduction; LAN/public performance profiles not measured; cold-start evidence is loopback only |

## Results (2026-11-07, local)

| Suite | Result | Layer |
|---|---|---|
| `pnpm test:p0` | **44/44** (2 worlds × 22) | mock |
| `live-conformance` | **12/12** | live (strict CA) |
| `node-hardening` | **5/5** (rate limit, session quota, room-full, private, key rotation) | live |
| `e2e-p0 --live` | **15/15** (10 jumps + rollback + gesture + room-full + budget + whitelist) | live browser |
| Unified report | PASS | mock + live, separately labelled |
| Performance (headed, Metal, sampled, strict) | cold p50 **2.48 s** / p95 **3.44 s**; warm p50 **51 ms** / p95 **141 ms**; restart recovery PASS | loopback, N=10 cold / 20 warm |
| Performance (headless SwiftShader, sampled, strict) | cold p50 **4.86 s** / p95 **5.02 s** → **strict FAIL**; warm p50 **502 ms** / p95 **639 ms**; restart recovery PASS | loopback, N=10 cold / 20 warm |

Cold sampling uses a **fresh browser process per sample**; warm uses one page and the real portal UI. **`--strict` exits non-zero on budget/restart failure**: headed loopback passes; headless loopback fails the 5 s cold gate (5.02 s). LAN/public profiles are **not measured**; they require `P0_PERF_REMOTE=1` with a real non-loopback deployment and are validated (public rejects private/loopback hosts). Baseline: `fixtures/p0/perf-baseline.json`; harness: `pnpm perf:p0 --strict`.

## Coverage: mock vs live

[`fixtures/p0/coverage.json`](../../fixtures/p0/coverage.json) maps all 22 cases to suites. Current live coverage:
- live-node: manifest/descriptors/signature, token issue/consume/replay/expiry, wrong world, unreachable, timeout, trust mismatch.
- live-hardening: rate limit, session quota, room-full, private world, key rotation.
- live-browser: UI confirm, 10 jumps, rollback, gesture guard, room-full fallback, prefetch budget, whitelist.
- mock-only: unknown-field tolerance, id/URL warning, digest mismatch, unsigned carry, version mismatch, escaping, cycle guard, viewer-without-portal.

**Do not read "22/22" as 22 live cases**; the 22-case suite is the mock authority, and the unified report labels layers explicitly.

## Security / trust notes

- Fixture CA and node keys are disposable test material; `trust.json` is a test-only pin. Never reuse in production.
- Browser E2E pins the two fixture leaf keys with Chrome SPKI; it does **not** pass `--ignore-certificate-errors`. Node suites validate the CA chain strictly.
- Production keeps blocking public world URLs that resolve to localhost/private ranges (SSRF / DNS rebinding); `.example` + loopback is an explicit test exception.
- Node has per-IP rate limiting (default 60/10 s), per-session token quotas (default 3/10 min), one-time tokens and a key-rotation procedure; abuse analytics remains future work.
- Test infrastructure: perf strict gate; remote LAN/public profile validation; port conflicts are detected and reported, never killed by test tooling.

## Remaining P0-4 work

1. **External reproduction** by a developer not involved in the project — runbook ready, tracking issue [#1](https://github.com/haeliotang/choroweave/issues/1); run pending.
2. **LAN + public-network performance profiles** on the required hardware/network; loopback samples already pass cold/warm targets and restart recovery but do not substitute for them.
3. Then freeze SHP v0.1, review the coverage matrix, and evaluate G0.
