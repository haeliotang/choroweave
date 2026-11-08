# Reproduce P0 (external reproduction runbook)

> Audience: a developer who has **never worked on choroweave**. Goal: run the two-node live handshake and report the result, within ~30 minutes. This is the P0-4 gate; G0 is not granted until at least one external reproduction is recorded.
> Chinese: [`../reproduce-p0.md`](../reproduce-p0.md)

## 1. Preflight (2 min)

```bash
git clone https://github.com/haeliotang/choroweave.git
cd choroweave
node scripts/repro-check.mjs
```

Requires Node ≥ 24, pnpm 10.x, `openssl`, Chrome/Chromium and free ports 8443/8444. `repro-check` reports every missing item.

## 2. Install & build (3–5 min)

```bash
pnpm install
pnpm run worlds:build
pnpm build
pnpm tls:fixture
```

`tls:fixture` creates a disposable local CA, certificates for `alice.example`/`hana.example`, test node keys and `trust.json` under `.p0-tls/` (gitignored). **Never use these keys outside this test.**

## 3. Automated verification (5–10 min)

> Candidate runtime baseline: `95f12d8` (tag `p0-rc1`). Record the exact commit you test.

```bash
pnpm test:p0                 # mock conformance: 44/44 (2 worlds × 22)
node scripts/live-conformance.mjs --json-out .p0-reports/live-node.json
node scripts/node-hardening.mjs --json-out .p0-reports/live-hardening.json
P0_LIVE=1 P0_REPORT_OUT=.p0-reports/live-browser.json node scripts/e2e-p0.mjs
node scripts/p0-report.mjs
pnpm perf:p0 --strict        # sampled cold/warm + restart recovery; exits non-zero on budget failure
# LAN/public (requires real deployment; validates DNS + TLS for client/A/B; public rejects private/loopback):
# P0_PERF_REMOTE=1 P0_PERF_PROFILE=lan P0_URL=https://... P0_NODE_A_ORIGIN=https://... P0_NODE_B_ORIGIN=https://... node scripts/perf-p0.mjs --validate-only
```

Expected:

| Suite | Expected |
|---|---|
| mock | 44/44 |
| live-node | 12/12 |
| live-hardening | 5/5 |
| live-browser | 15/15 (10 jumps + rollback + gesture + room-full + budget + whitelist) |
| report | `REPORT: PASS` |

The browser suite starts both HTTPS nodes itself. It maps `alice.example`/`hana.example` to 127.0.0.1 and **pins the two fixture leaf keys via Chrome SPKI** (no global `--ignore-certificate-errors`). Node-side checks validate the CA chain strictly.

## 4. Real deployment (LAN / public)

See [`deploy-real.md`](deploy-real.md). RC3 can do a real **LAN** run with two hosts + reverse proxies and the fixture CA; a real **public** domain requires a deployment profile (new RC) because the viewer and node origins are fixture-bound.

## 5. Manual inspection (optional, 5 min)

```bash
pnpm p0:up
# In another terminal, with hosts mapping + trusted/pinned certs, or reuse the automated browser args.
# Client: https://alice.example:8443/?live=1
curl --cacert .p0-tls/ca.crt --resolve alice.example:8443:127.0.0.1 \
  https://alice.example:8443/.well-known/weave-node.json
```

Controls: `WASD`, mouse drag, `E` to inspect/enter a portal, `Esc` cancel.

## 6. Report back

Open the **External reproduction (P0)** issue form and include (or comment on the tracking issue: <https://github.com/haeliotang/choroweave/issues/1>):
- commit hash and date;
- OS/Node/Chrome versions;
- suite outputs (pass/fail counts) and any error text;
- wall-clock time spent;
- documentation gaps.

If a command fails, quote the exact command and output — that is the most useful contribution.

## 7. Troubleshooting

| Symptom | Fix |
|---|---|
| `EADDRINUSE` on 8443/8444 | stop the existing P0 nodes; test tooling detects conflicts and never kills unrelated processes |
| certificate errors | run `pnpm tls:fixture`, ensure `.p0-tls/` exists; don't reuse an old fixture |
| `failed to load scene` | run `pnpm build` (client dist missing) |
| browser E2E can't find Chrome | set `CHROME_PATH=/path/to/chrome` |
| trust mismatch after a rotation test | re-run `pnpm tls:fixture` to reset fixture identities |

> The `.example` domains and loopback mapping are test-only exceptions. Production keeps blocking public worlds from resolving to localhost/private ranges (SSRF / DNS rebinding).
