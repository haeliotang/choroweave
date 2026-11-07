# P0 release candidate & external validation (2026-11-07)

> **Runtime baseline:** `95f12d8` (2026-11-07). **RC tag:** `p0-rc1` (points at the validation-tooling commit whose runtime files are identical to `95f12d8`; verify with `git diff 95f12d8..p0-rc1 -- apps packages scripts/serve-node.mjs scripts/tls-fixture.mjs worlds`).
> **SHP v0.1:** candidate freeze — **not final** until external validation completes.
> G0: **not granted**. Target date **2027-01-25**.
> Chinese: [`../p0-rc.md`](../p0-rc.md)

## 1. Status split

| Status | Meaning |
|---|---|
| **Engineering: complete** | P0-1…P0-4 implementation and tooling done; CI green; mock/live suites pass |
| **RC: candidate** | runtime baseline frozen at `95f12d8`; no new features before external feedback |
| **G0 acceptance: not granted** | external reproduction pending; LAN/public performance profiles pending |

P0 is now in **Release Candidate / External Validation**, not feature development. Scope is frozen: no generative models, no multiplayer sync, no agents, no hosted discovery.

## 2. Evidence ledger

| Evidence | Result | Layer | Location |
|---|---|---|---|
| Mock conformance | **44/44** (2 worlds × 22) | mock | `pnpm test:p0` |
| Live node protocol | **12/12** | live | `scripts/live-conformance.mjs` |
| Live hardening | **5/5** (rate, quota, room-full, private, key rotation) | live | `scripts/node-hardening.mjs` |
| Live browser E2E | **15/15** (10 jumps + rollback + gesture + room-full + budget + whitelist) | live-browser | `scripts/e2e-p0.mjs` |
| Unified report | PASS, layers separated | mock + live | `pnpm report:p0` |
| Coverage matrix | 22 cases × layers; 8 mock-only disclosed | — | `fixtures/p0/coverage.json` |
| Performance — headed loopback | cold p50 **2.82 s** / p95 **3.42 s**; warm p50 **48 ms** / p95 **172 ms** | loopback | `scripts/perf-p0.mjs` |
| Performance — headless loopback | cold p50 **4.26 s** / p95 **4.59 s**; warm p50 **337 ms** / p95 **463 ms** | loopback | `scripts/perf-p0.mjs` |
| Target restart recovery | rollback before restart + successful retry after restart | loopback | `scripts/perf-p0.mjs` |
| CI | mock + live + hardening + browser E2E + report + artifacts | — | GitHub Actions |

Performance notes: cold start uses a **fresh browser process** per sample; warm uses one page and the real portal UI. Loopback only. **LAN and public-network profiles are not measured** and are not claimed as G0 evidence.

## 3. What external validation must record

1. Checkout the RC tag and confirm the commit hash.
2. Run the reproduction runbook: [`reproduce-p0.md`](reproduce-p0.md).
3. Record: environment (OS/Node/Chrome), pass/fail counts, wall-clock time, commit hash, any failure output.
4. For performance: run `pnpm perf:p0` (headed if a display is available) and record N, cold/warm p50/p95, restart recovery.
5. If possible, run one LAN profile (second host) and one public profile (deployed nodes); label each run.
6. Comment on tracking issue [#1](https://github.com/haeliotang/choroweave/issues/1) or open the external reproduction issue form.

## 4. G0 acceptance checklist

| Criterion | Status |
|---|---|
| two independent HTTPS nodes | ✅ |
| real bidirectional traversal 10/10 | ✅ loopback |
| real arrive tokens, replay/expiry rejected | ✅ |
| rollback preserves source | ✅ |
| mock 22/22 + live layers separately reported | ✅ |
| CI auto-runs live nodes + browser E2E | ✅ |
| **external independent reproduction** | ⬜ pending |
| **LAN + public performance profiles** | ⬜ pending |
| **cold p95 < 5 s / warm p95 < 1.5 s on required profiles** | ✅ loopback headed; ⬜ LAN/public |
| SHP v0.1 final freeze | ⬜ after feedback |
| G0 review | ⬜ 2027-01-25 target |

## 5. Freeze policy

- Runtime and protocol files are frozen at the RC baseline; only validation tooling, docs, and test fixes may land before G0.
- Any runtime change after the RC requires a new RC tag, re-running all suites, and an explicit note in the external reproduction issue.
- SHP v0.1 is a **candidate freeze**; final freeze follows external feedback. Breaking changes before G0 are allowed only with an ADR and a documented migration.
