# P0 release candidate & external validation (2026-11-07)

> **Runtime baseline:** `854f114` (2026-11-10, after the licensing switch). **RC tag:** `p0-rc4` (supersedes `p0-rc3`; the licensing switch changed runtime files: SPDX headers and the §13 Source endpoint). Verify with `git diff 854f114..p0-rc4 -- apps packages scripts/serve-node.mjs scripts/tls-fixture.mjs worlds schemas`; `p0-rc3` remains a historical RC and is no longer the current baseline.
> **SHP v0.1:** candidate freeze — **not final** until external validation completes.
> G0: **not granted**. Target date **2027-01-25**.
> Chinese: [`../p0-rc.md`](../p0-rc.md)

## 1. Status split

| Status | Meaning |
|---|---|
| **Engineering: complete** | P0-1…P0-4 implementation and tooling done; CI green; mock/live suites pass |
| **RC: candidate** | runtime baseline frozen at `854f114`; no new features before external feedback |
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
| Performance — headed loopback (strict) | cold p50 **2.48 s** / p95 **3.44 s**; warm p50 **51 ms** / p95 **141 ms**; strict PASS | loopback | `scripts/perf-p0.mjs --strict` |
| Performance — headless loopback (strict) | cold p95 **5.02 s** → strict FAIL; warm p95 **639 ms** | loopback | `scripts/perf-p0.mjs --strict` |
| Target restart recovery | rollback before restart + successful retry after restart | loopback | `scripts/perf-p0.mjs` |
| CI | mock + live + hardening + browser E2E + report + artifacts (functional suites only; **not** headed strict perf) | — | GitHub Actions |

Performance notes: cold start uses a **fresh browser process** per sample; warm uses one page and the real portal UI. `--strict` exits non-zero on budget failure and now requires **both** rollback-before-restart and retry-after-restart. Remote profiles are only accepted after **DNS resolution + TLS verification of the client and both node endpoints**; the report records addresses/TLS details, and `--validate-only` performs just that check. Public rejects any private/loopback resolution; LAN rejects loopback. Loopback only: headed passes, headless fails the cold gate. **LAN/public are not measured by CI.**

## 3. What external validation must record

1. Checkout the RC tag and confirm the commit hash.
2. Run the reproduction runbook: [`reproduce-p0.md`](reproduce-p0.md).
3. Record: environment (OS/Node/Chrome), pass/fail counts, wall-clock time, commit hash, any failure output.
4. For performance: run `pnpm perf:p0 --strict` (headed if a display is available) and record N, cold/warm p50/p95, restart recovery. For LAN/public: first run `P0_PERF_REMOTE=1 P0_PERF_PROFILE=lan P0_URL=... P0_NODE_A_ORIGIN=... P0_NODE_B_ORIGIN=... node scripts/perf-p0.mjs --validate-only`, then re-run without `--validate-only` (public rejects private/loopback resolutions).
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

## 5. G0 evidence bundle

Use [`g0-evidence.md`](g0-evidence.md) when proposing G0. Required artifacts: RC identity, deployment information, external functional reproduction, environment-specific performance reproduction, `remoteTopology`, browser perf report, unified conformance report. **`--validate-only PASS` alone is not evidence of performance or correct SHP service.** External reproduction records functionality and performance separately.

Topology validation proves DNS/TLS reachability and address classification for the configured endpoints; it does not prove the browser used the expected network path or that the endpoints serve the correct Choroweave worlds.

## 6. Freeze policy

- Runtime and protocol files are frozen at the RC baseline; only validation tooling, docs, and test fixes may land before G0.
- Any runtime change after the RC requires a new RC tag, re-running all suites, and an explicit note in the external reproduction issue.
- SHP v0.1 is a **candidate freeze**; final freeze follows external feedback. Breaking changes before G0 are allowed only with an ADR and a documented migration.
