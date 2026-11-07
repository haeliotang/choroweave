# Architecture Decision Records (ADR)

The 13 ADRs for plan v0.1 live in [`../02-tech-selection.md`](../02-tech-selection.md) §1 (summary table) and §3 (per-decision rationale): context, evidence, cost, review signals and open questions.

Chinese version: [`README.zh-CN.md`](README.zh-CN.md).

## Change process

1. **Propose** — add `ADR-<4-digit-id>-<kebab-title>.md` in this directory with: context, options, decision, evidence (A/B/C), impact, review signals.
2. **Review** — discuss in an issue/RFC; for breaking protocol changes, update the version and deprecation policy in [`../04-spatial-hyperlink-protocol.md`](../04-spatial-hyperlink-protocol.md).
3. **Merge** — update this index and the summary table in `02-tech-selection.md`; when superseding an ADR, explicitly reference the replaced ID (never silently rewrite history).
4. **Record** — archive gate (G0–G4) KPI snapshots and decisions here (see [`../05-roadmap.md`](../05-roadmap.md) §5.3).

## Index

| ADR | Topic | Location |
|---|---|---|
| ADR-01 | Independent incubation; contract with tacitweave | `02` §1/§3 |
| ADR-02 | World Bundle artifact format | `02` §3 |
| ADR-03 | Three-layer logic (L0/L1/L2) | `02` §3 |
| ADR-04 | Babylon.js reference runtime, WebGL2-first | `02` §3 |
| ADR-0004 rev.1 | Babylon.js 9.x runtime (supersedes the 8.x version statement) | [`ADR-0004-babylonjs-9.md`](ADR-0004-babylonjs-9.md) |
| ADR-05 | HTTPS URL addressing | `02` §3 |
| ADR-06 | SHP aligned with MSF WoW, `CHW_portal` | `02` §3 |
| ADR-07 | WebTransport/WebRTC realtime, Matrix only as social bridge | `02` §3 |
| ADR-08 | Passkey/OIDC → did:web, no blockchain | `02` §3 |
| ADR-09 | Skeleton-first compiler, TRELLIS.2 | `02` §3 |
| ADR-10 | Rapier physics and collider strategy | `02` §3 |
| ADR-11 | World models/3DGS are not the runtime | `02` §3 |
| ADR-12 | Licensing and conformance governance; open-source boundary | `02` §3 |
| ADR-13 | Rust core, Web-native runtime (post-G0, no P0 change) | `02` §3 · [`ADR-0013-rust-core-web-native-runtime.md`](ADR-0013-rust-core-web-native-runtime.md) |
