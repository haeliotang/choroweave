# G0 evidence bundle (template)

> Use this template when proposing G0. **Do not grant G0 from a topology check alone.** All four artifacts below are required, tied to one RC commit.
> Chinese: [`../g0-evidence.md`](../g0-evidence.md)

## 1. RC identity

| Field | Value |
|---|---|
| RC tag | `p0-rc3` |
| Runtime baseline | `95f12d8` |
| Tag commit | `33815a0` (tooling/docs; runtime diff vs `95f12d8` must be empty) |
| Evidence commit | `<commit containing this bundle>` |
| Rule | If runtime files changed, a new RC tag and a full re-run are required |

## 2. Deployment information

| Endpoint | URL | Host/provider | DNS answers | TLS issuer / expiry |
|---|---|---|---|---|
| Client | | | | |
| Node A (`pixel-rooftop`) | | | | |
| Node B (`neon-alley`) | | | | |

Include: how nodes were launched, world directories, trust anchors, and whether TLS certificates were publicly trusted (recommended) or a documented private CA was used.

## 3. Functional reproduction (external developer)

| Field | Value |
|---|---|
| Tester (not a project member) | |
| Date / OS / Node / Chrome | |
| RC commit tested | |
| Wall-clock time (clone → report) | |
| Mock conformance | `44/44`? |
| Live node protocol | `12/12`? |
| Live hardening | `5/5`? |
| Live browser E2E | `15/15`? |
| Unified report | PASS? |
| Functional result | **PASS / FAIL** |
| Failure output / gaps | |

This field records **protocol functionality only**. A software-rendered browser that misses the cold-start budget can still reproduce functionality; record that separately below.

## 4. Performance reproduction (environment-specific)

| Field | Value |
|---|---|
| Profile | loopback / LAN / public |
| Client host + network | |
| Browser + renderer | |
| Nodes deployed | |
| Cold samples (N) and p50/p95 | |
| Warm samples (N) and p50/p95 | |
| Restart recovery (rollback + retry) | PASS / FAIL |
| `perf-p0 --strict` result | PASS / FAIL |
| Report path (`perf-p0-*.json`) | |
| Performance result | **PASS / FAIL** |

Rules:

- `--validate-only PASS` proves DNS/TLS reachability and address classification only. It **does not** prove the browser used the expected network path, nor that the endpoints serve the correct Choroweave worlds/SHP service, nor that performance targets are met.
- Public profile requires non-private/non-loopback DNS answers for client/A/B; LAN requires non-loopback. The report must include `remoteTopology`.
- Strict mode requires both warm/cold budgets and **rollback + retry** for restart recovery.
- Performance pass is environment-specific; a headless/software-GL cold-start miss is not a functional failure, and a functional pass is not a performance pass.

## 5. Artifacts to attach / link

1. `remoteTopology` JSON (from `perf-p0` report) — DNS addresses + TLS protocol/cipher/authorized for client/A/B.
2. Deployment details: origins, hosting, certificate issuer, how to reach the nodes.
3. Browser performance report (`perf-p0-<profile>-<headed|headless>.json`).
4. Unified conformance report (`artifacts/p0-conformance.json` / `.md`) and CI run URL.
5. External reproduction record: Issue [#1](https://github.com/haeliotang/choroweave/issues/1) comment or reproduction issue form.

## 6. G0 sign-off checklist

- [ ] RC commit recorded and runtime diff vs `95f12d8` is empty
- [ ] External developer (not project member) functional reproduction recorded
- [ ] Functional and performance results recorded **separately**
- [ ] LAN and public profiles sampled with topology reports (or explicitly declared out of scope by G0 review)
- [ ] Strict performance targets met on the required profiles, or an explicit waiver recorded
- [ ] Topology, deployment, browser perf, and conformance artifacts linked
- [ ] SHP v0.1 final freeze decision recorded after external feedback
