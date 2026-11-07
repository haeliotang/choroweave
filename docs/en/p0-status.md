# P0 implementation status (2026-11-07)

> Scope: **P0-1** (two worlds + runtime), **P0-2** (real two-node HTTPS handshake + hardening), **P0-3** (unified conformance report), **P0-4** (external reproduction runbook; external run still pending).
> P0 acceptance (external reproduction) is **not** met; G0 remains un-granted, target **2027-01-25**.
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
| Rate limit, room-full, private world | `scripts/serve-node.mjs` (`P0_RATE_LIMIT`, `--room-full`, `--private`) | done |
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

## Results (2026-11-07, local)

| Suite | Result | Layer |
|---|---|---|
| `pnpm test:p0` | **44/44** (2 worlds × 22) | mock |
| `live-conformance` | **12/12** | live (strict CA) |
| `node-hardening` | **4/4** (rate limit, room-full, private, key rotation) | live |
| `e2e-p0 --live` | **15/15** (10 jumps + rollback + gesture + room-full + budget + whitelist) | live browser |
| Unified report | PASS | mock + live, separately labelled |
| Performance (headed, Metal) | cold **2.47 s**, warm **p50 47 ms / p95 167 ms** | indicative |
| Performance (headless SwiftShader) | cold **4.3–6.2 s** (run variance; sometimes >5 s), warm **p50 432 ms / p95 542 ms** | indicative |

Performance is a single-machine baseline (`fixtures/p0/perf-baseline.json`); headed uses hardware acceleration but is not a headset/low-end benchmark. G0 targets: warm p95 < 1.5 s, cold p95 < 5 s. Warm is comfortably met; **headless cold start is near/over 5 s and must not be treated as a pass** — headed cold is 2.47 s and real-device measurements are still required.

## Coverage: mock vs live

[`fixtures/p0/coverage.json`](../../fixtures/p0/coverage.json) maps all 22 cases to suites. Current live coverage:
- live-node: manifest/descriptors/signature, token issue/consume/replay/expiry, wrong world, unreachable, timeout, trust mismatch.
- live-hardening: rate limit, room-full, private world, key rotation.
- live-browser: UI confirm, 10 jumps, rollback, gesture guard, room-full fallback, prefetch budget, whitelist.
- mock-only: unknown-field tolerance, id/URL warning, digest mismatch, unsigned carry, version mismatch, escaping, cycle guard, viewer-without-portal.

**Do not read "22/22" as 22 live cases**; the 22-case suite is the mock authority, and the unified report labels layers explicitly.

## Security / trust notes

- Fixture CA and node keys are disposable test material; `trust.json` is a test-only pin. Never reuse in production.
- Browser E2E pins the two fixture leaf keys with Chrome SPKI; it does **not** pass `--ignore-certificate-errors`. Node suites validate the CA chain strictly.
- Production keeps blocking public world URLs that resolve to localhost/private ranges (SSRF / DNS rebinding); `.example` + loopback is an explicit test exception.
- Node has per-IP rate limiting (default 60/10 s), one-time tokens and a key-rotation procedure; quotas/abuse analytics are future work.

## Remaining P0-4 work

1. **External reproduction** by a developer not involved in the project — runbook ready, tracking issue [#1](https://github.com/haeliotang/choroweave/issues/1); run pending.
2. Then freeze SHP v0.1, review the coverage matrix, and evaluate G0.
