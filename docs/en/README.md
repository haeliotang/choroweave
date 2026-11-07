# choroweave documentation (English)

> **English-first edition.** Chinese originals are kept at [`docs/`](../) with a language banner; every English doc links back to its Chinese counterpart.
> The research reports are available in English under [`research/`](research/); Chinese originals live at [`docs/research/`](research/).

## Plan documents

| Document | Contents |
|---|---|
| [`00-executive-summary.md`](00-executive-summary.md) | Executive summary: timing, path, roadmap, resourcing, KPIs, top risks |
| [`01-landscape.md`](01-landscape.md) | Open-source landscape: four layers, five gaps, 2026–2028 window |
| [`02-tech-selection.md`](02-tech-selection.md) | 12 ADRs, decision matrix, deviations from the original vision |
| [`03-architecture.md`](03-architecture.md) | Compiler pipeline, runtime, node, interfaces, performance budgets |
| [`04-spatial-hyperlink-protocol.md`](04-spatial-hyperlink-protocol.md) | SHP v0.1: `world.json`, `CHW_portal`, traversal handshake, trust |
| [`05-roadmap.md`](05-roadmap.md) | 24-month roadmap (P0–P4), gates, resourcing, KPI dictionary |
| [`06-mvp-spec.md`](06-mvp-spec.md) | MVP spec, user stories, 20-prompt eval set, acceptance tests |
| [`07-risks-compliance.md`](07-risks-compliance.md) | Risk register, licensing, security, content governance, compliance |
| [`08-open-source-strategy.md`](08-open-source-strategy.md) | Governance, standards path, community, sustainable model |

## Research reports

| Report | Contents |
|---|---|
| [`research/01-spatial-web-platforms.md`](research/01-spatial-web-platforms.md) | Spatial networks, portals, identity, realtime state |
| [`research/02-generative-3d-and-agents.md`](research/02-generative-3d-and-agents.md) | Generative 3D, world models, agent-built worlds |
| [`research/03-runtime-standards.md`](research/03-runtime-standards.md) | glTF / KHR_interactivity / WebXR / WebGPU / device support |
| [`research/04-products-market-prior-art.md`](research/04-products-market-prior-art.md) | Comparable products, market signals, failure post-mortems |

## Supporting artifacts

- [`../decisions/README.md`](../decisions/README.md) — ADR index and change process.
- [`../../schemas/world-manifest.schema.json`](../../schemas/world-manifest.schema.json) — `world.json` JSON Schema.
- [`../../schemas/spatial-dsl.schema.json`](../../schemas/spatial-dsl.schema.json) — Spatial-DSL JSON Schema.
- [`../../schemas/implicit-spatial-spec.schema.json`](../../schemas/implicit-spatial-spec.schema.json) — tacitweave ISS contract.
- [`p0-status.md`](p0-status.md) — P0-1/P0-2 verification report (mock vs live).
- [`../../examples/pixel-rooftop/`](../../examples/pixel-rooftop/) — signed example world.
- [`../../scripts/validate.mjs`](../../scripts/validate.mjs) — zero-dependency repo self-check.

```bash
node scripts/validate.mjs --strict
```

## Reading paths

- **Should we build this?** → `00` + the "deviations from the original vision" section of `02`.
- **Implementing:** `03` → `04` → `06`.
- **Risk / investment:** `05` → `07` → `08`.
- **Evidence:** start with `research/`.

> Evidence grades: **A** = primary source, **B** = third-party test/report, **C** = engineering judgement. Plan documents use **(A)/(B)/(C)**; research reports keep their source-style labels **[official] / [third-party] / [media-reported]** (mapping to A / B / B–C). All facts are dated "verified as of 2026-11"; unverifiable claims are marked *not verified*.
