# ADR-0004 rev. 1 — Babylon.js 9.x as the reference runtime

- **Status:** accepted (2026-11-07)
- **Supersedes:** the "Babylon.js 8.x" version statement in [ADR-04](../02-tech-selection.md) (decision logic unchanged)
- **Related:** ADR-04 (runtime choice), ADR-02/03 (world bundle, behavior layer), [`docs/03-architecture.md`](../03-architecture.md)

## Context

ADR-04 selected Babylon.js because it is one of the two ratification-grade implementations of `KHR_interactivity` (the other being glTF-Sample-Viewer) and is Apache-2.0. It named **8.x** at plan time (2026‑11 research snapshot).

When P0‑1 was implemented, the current Babylon release line was **9.x** (`@babylonjs/core` / `@babylonjs/loaders` 9.35.0 at install time). The implementation also had to adapt to a 9.x API change: `SceneLoader.LoadAssetContainerAsync(rootUrl, filename, …)` became the module-level `LoadAssetContainerAsync(source, scene, …)`. After the adapter, the P0 runtime loads both worlds, plays `KHR_interactivity` assets, and passes the P0 suites.

Keeping the plan at 8.x while shipping 9.x would create exactly the code/spec divergence the project is trying to avoid.

## Decision

- Use **Babylon.js 9.x** (`^9.35.0`, pinned by `pnpm-lock.yaml`) as the reference runtime for P0–P4.
- Keep **WebGL2 as the guaranteed floor** and WebGPU as feature-enhanced (unchanged from ADR-04).
- Do **not** fork Babylon; keep the Runtime Adapter boundary so a future engine change remains possible.
- Treat 9.x compatibility as an explicit gate: upgrades must pass the mock conformance suite, the live node suite, and the browser E2E before merge.

## Evidence

At commit `1432da2` + P0‑2 changes (2026‑11‑07), with Babylon 9.35.0:

- `pnpm test:p0` → 22/22 conformance cases for both worlds (mock session).
- `node scripts/live-conformance.mjs` → 12/12 live cases (two HTTPS nodes, signed descriptors, token issue/consume/replay/expiry).
- `P0_LIVE=1 node scripts/e2e-p0.mjs` → 10/10 live bidirectional jumps, rollback PASS; warm traversal p50 ≈ 375 ms / p95 ≈ 475 ms, cold start ≈ 4.9 s (local headless Chrome/SwiftShader; indicative only).
- `pnpm build` → viewer built with `@babylonjs/core` 9.35.0.
- The `KHR_interactivity`/glTF loader path is unchanged; the failure was an API call‑shape change in `SceneLoader`, fixed in the Runtime Adapter (`LoadAssetContainerAsync`).

Evidence grade: **A** for repository/build/test results, **B** for local performance figures (single machine, headless software GL; not a device benchmark).

## Impact

- Documentation, README and the runtime now all say **9.x**; the research reports remain a historical 2026‑11 snapshot and are not rewritten.
- No protocol, bundle-format or API impact: `KHR_interactivity` and glTF remain the contract.
- Upgrade risk is contained by the three test suites above; a future major (10.x) needs its own ADR revision.

## Review signals

- If Babylon 9.x regresses `KHR_interactivity` playback or WebGL2 compatibility, pin to the last good minor and reopen ADR-04.
- If a second ratified-grade runtime appears (e.g., Godot/Unity playback), reassess the runtime choice rather than assuming Babylon indefinitely.
