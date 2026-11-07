# choroweave · 原质之织

> **Compile human intent into executable, co-present, hyperlinked 3D worlds.**
> An open, web-native fabric for the spatial web.
>
> 中文版：[README.zh-CN.md](README.zh-CN.md) · Repository: <https://github.com/haeliotang/choroweave>

> **Status (2026-11): design stage + P0-1/P0-2 hardening.** Runnable now: two hand-built worlds, a Babylon.js 9 playground, **two independent HTTPS SHP nodes** with signed descriptors + pinned trust anchors + one-time `arrive` tokens, rate limiting, session quotas, room-full/private handling and key rotation; mock **44/44** (2×22), live node **12/12**, hardening **5/5**, live browser **15/15** (10 jumps + rollback + gesture + room-full + budget + whitelist), unified report PASS ([details](docs/en/p0-status.md)). **P0 is now a release candidate** (runtime baseline `95f12d8`, tag `p0-rc1`); external validation + LAN/public performance profiles are still pending. RC/acceptance split: [docs/en/p0-rc.md](docs/en/p0-rc.md) · runbook: [docs/en/reproduce-p0.md](docs/en/reproduce-p0.md). Contributing: [CONTRIBUTING.md](CONTRIBUTING.md) · Security: [SECURITY.md](SECURITY.md).

choroweave is the spatial-computing layer of the **Inceptless** project family. It is *not* another closed metaverse platform: it builds the **compiler, the hyperlink protocol, and the reference implementation** for a web of worlds.

| Pillar | Job | Analogy |
|---|---|---|
| **Chôra Compiler** | Natural language / intent → Spatial-DSL → playable World Bundle | an `HTML compiler` |
| **Spatial Hyperlink Protocol (SHP)** | World manifests, addressing, portals, traversal handshake, capability negotiation | `HTTP + <a>` |
| **Runtime & Node** | Babylon.js reference runtime + self-hostable world node | a `browser + server` |

> The name comes from Plato's **chôra (χώρα)** in *Timaeus* — the formless "receptacle" between ideas and the sensible world, in which everything takes shape. The compiler's job is exactly to put an idea into chôra and let it become a world.

---

## 30-second verdict (as of Nov 2026)

1. **The timing is real — but it is not a "metaverse" moment.** It is an *agent creation + personal space + lightweight interconnection* moment. Roblox had **138M DAU** in Q3 2026, Minecraft **155M MAU**, VRChat **>1M MAU**; yet headset shipments fell **−42.8%** in 2025 (IDC) and Vision Pro shipped only **~45k units**. **There is no data for VR-first**: build for web/desktop first, add WebXR progressively.
2. **The missing piece is not generation — it is the last mile.** TRELLIS.2 (MIT) produces a PBR-ready GLB in **~17 s** on an H100; but LLM agents making a *complete playable game* pass only **16%** of runs in the 2026 CEGame-Bench (five production engines). What is scarce: constrained spatial compilation, verifiable world bundles, and a standard to connect worlds.
3. **The spatial-hyperlink window is opening.** Khronos ratified `KHR_interactivity` on **2026-08-28** (object-level behaviors only; explicitly single-user, no UI/arbitrary scripts). The Metaverse Standards Forum's **"Web of Worlds"/X3D 4.1 Anchor** has proposed "links become portals". Meanwhile the portal standard is a *vacuum*: `MX_portal` was deprecated → `OMI_link` was archived → there is no `OMI_portal`. **Entering now means defining the gap, not compat-shimming it five years later.**
4. **Unit economics is the life-or-death line.** Rec Room shut down on **2026-06-01** (UGC take-rate structure); Spatial closed its hosting platform on **2025-07-27** (hosting cost). choroweave's answer: **open protocol + self-hosted nodes** — worlds should be hostable like blogs, and the project must not live off UGC take rates.

All claims are evidence-graded (A = primary source, B = third-party test/report, C = engineering judgement) and dated "verified as of 2026-11" inside the docs; unverifiable items are explicitly marked *not verified*.

---

## What this repository is

**This is a research-grounded development plan, not finished code.** Deliverables:

| Document | Contents |
|---|---|
| [`docs/en/00-executive-summary.md`](docs/en/00-executive-summary.md) | Executive summary: judgments, path, roadmap, resourcing, KPIs |
| [`docs/en/01-landscape.md`](docs/en/01-landscape.md) | Open-source landscape: four layers, five gaps, 2026–2028 window |
| [`docs/en/02-tech-selection.md`](docs/en/02-tech-selection.md) | 12 ADRs, technical decision matrix, **deviations from the original vision** |
| [`docs/en/03-architecture.md`](docs/en/03-architecture.md) | System architecture: compiler pipeline, runtime, node, interfaces |
| [`docs/en/04-spatial-hyperlink-protocol.md`](docs/en/04-spatial-hyperlink-protocol.md) | SHP v0.1: `world.json`, `CHW_portal`, traversal handshake, trust |
| [`docs/en/05-roadmap.md`](docs/en/05-roadmap.md) | 24-month roadmap (P0–P4), gates, resourcing, KPI dictionary |
| [`docs/en/06-mvp-spec.md`](docs/en/06-mvp-spec.md) | Phase-1 MVP spec, user stories, 20-prompt eval set, acceptance tests |
| [`docs/en/07-risks-compliance.md`](docs/en/07-risks-compliance.md) | Risks, licensing, security, content governance, compliance |
| [`docs/en/08-open-source-strategy.md`](docs/en/08-open-source-strategy.md) | Governance, standards path, community, sustainable model |
| [`docs/decisions/`](docs/decisions/README.md) | ADR index and change process |
| [`docs/`](docs/) | Chinese originals (00–08 + research) with language banners |
| [`docs/en/research/`](docs/en/research/) | Four primary research reports (spatial networks / generative 3D / runtime standards / market) |
| [`schemas/`](schemas/) | JSON Schemas for Spatial-DSL, `world.json`, and the tacitweave ISS contract |
| [`examples/pixel-rooftop/`](examples/pixel-rooftop/) | The flagship example world ("pixel rooftop"), DSL + signed manifest |
| [`docs/en/p0-rc.md`](docs/en/p0-rc.md) | Release Candidate + G0 acceptance checklist (runtime baseline `95f12d8`) |
| [`docs/en/reproduce-p0.md`](docs/en/reproduce-p0.md) | External reproduction runbook (P0-4 gate) |
| [`docs/en/p0-status.md`](docs/en/p0-status.md) | P0-1/P0-2 verification report (mock vs live results, perf, gaps) |
| [`apps/playground/`](apps/playground/) | Babylon.js P0 viewer: loads `world.json` + `scene/world.glb`, first-person roaming, portal traversal with rollback |
| [`packages/check/`](packages/check/) | `weave-check` CLI + 22 SHP conformance cases + tests |
| [`worlds/`](worlds/) | Generated P0 runtime worlds (simple geometry, no generative models) |
| [`scripts/build-p0-worlds.mjs`](scripts/build-p0-worlds.mjs) | Deterministic world/GLB builder for the P0 fixtures |
| [`fixtures/p0/`](fixtures/p0/README.md) | Frozen two-world P0 fixtures (canonical IDs/URLs, hosts mapping, 10-jump script) |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Contribution scope, evidence rules, DCO, RFC/ADR process |
| [`SECURITY.md`](SECURITY.md) | Private vulnerability reporting and security scope |
| [`scripts/validate.mjs`](scripts/validate.mjs) | Zero-dependency repo self-check (schemas, example, signatures, links) |

> **Language note:** the plan is **English-first**. English documents live under [`docs/en/`](docs/en/); the Chinese originals remain under [`docs/`](docs/) with a language banner. A full Chinese README is at [`README.zh-CN.md`](README.zh-CN.md).

Quick self-check (Node ≥ 18, no install needed):

```bash
node scripts/validate.mjs --strict
```

---

## P0 quick start (P0-1/P0-2 prototype)

```bash
pnpm install
pnpm run worlds:build   # deterministic: worlds/pixel-rooftop + worlds/neon-alley
pnpm dev                # http://localhost:5173
pnpm test:p0            # manifests + 22/22 conformance cases (mock session)
pnpm test:live          # live two-node protocol suite (strict CA)
pnpm test:hardening     # rate limit, room-full, private world, key rotation
pnpm test:e2e           # 10 bidirectional jumps + rollback via the real portal UI
pnpm report:p0          # unified mock/live conformance report
pnpm p0:up              # one-click two-node launcher
P0_LIVE=1 pnpm build && P0_LIVE=1 pnpm test:e2e   # same, against two live HTTPS nodes
```

Controls: `WASD` move, mouse drag to look, `E` interact / enter portal, `Esc` cancel. Append `?world=neon-alley` to boot the other world; append `&failPortal=1` to demo the rollback path.

## Technical baseline (one line per layer)

- **Artifact** — World Bundle = glTF 2.0 `.glb` + `KHR_interactivity` behavior graphs + `CHW_*` vendor extensions + `world.json` + content-addressed assets.
- **Runtime** — Babylon.js 9.x (Apache-2.0), **WebGL2-first**, WebGPU as progressive enhancement; we do **not** fork Hyperfy (GPL-3.0, low-maintenance main repo, no cross-world portal primitive).
- **Logic** — L0 `KHR_interactivity` (safe, portable) / L1 curated networked mini-game modules (parameterized) / L2 capability-sandboxed WASM (P3+). No arbitrary user JS.
- **Realtime** — WebSocket room server (P0–P1) → WebTransport / WebRTC DataChannel (P2+) + LiveKit voice; Matrix is only an optional social bridge, never a pose-sync bus.
- **Addressing** — an HTTPS URL *is* the world ID; `weave://` is only an alias; assets are SHA-256 content-addressed.
- **Generation** — skeleton-first + deterministic assembly + **TRELLIS.2 (MIT)**; Hunyuan3D is opt-in only (license excludes EU/UK/KR and has a 1M-MAU clause).
- **Licenses** — code Apache-2.0, specification CC-BY-4.0, example assets CC0/CC-BY.

---

## Relationship to tacitweave

**Separate repositories, contract-based upstream/downstream.** *tacitweave* models what the user cannot fully articulate (aesthetic preferences, routines, unspoken atmosphere) and emits an **Implicit Spatial Spec (ISS)**. *choroweave* merges ISS with explicit intent, compiles it into a world, and connects worlds into a network. The two share no code and no release cadence — only a versioned JSON contract ([`schemas/implicit-spatial-spec.schema.json`](schemas/implicit-spatial-spec.schema.json), described in [`docs/en/03-architecture.md`](docs/en/03-architecture.md) §8).

---

## How to read this plan

- **Deciding whether this is worth doing** → [`docs/en/00-executive-summary.md`](docs/en/00-executive-summary.md) and the "deviations from the original vision" section of [`docs/en/02-tech-selection.md`](docs/en/02-tech-selection.md).
- **Want to implement** → [`docs/en/03-architecture.md`](docs/en/03-architecture.md) → [`docs/en/04-spatial-hyperlink-protocol.md`](docs/en/04-spatial-hyperlink-protocol.md) → [`docs/en/06-mvp-spec.md`](docs/en/06-mvp-spec.md).
- **Assessing risk / investing** → [`docs/en/05-roadmap.md`](docs/en/05-roadmap.md) → [`docs/en/07-risks-compliance.md`](docs/en/07-risks-compliance.md) → [`docs/en/08-open-source-strategy.md`](docs/en/08-open-source-strategy.md).
- **Checking the evidence** → start at [`docs/en/research/`](docs/en/research/); every report has sources and an explicit "not verified" list.

---

## Status and licenses

- Status: **plan v0.1 (Nov 2026)**; protocol and schemas are drafts — challenges via issues/RFCs are welcome.
- Code (future): Apache-2.0 ([`LICENSE`](LICENSE)); specification: CC-BY-4.0; example assets: CC0/CC-BY.
- Sister project: **tacitweave** (tacit knowledge / implicit intent layer). This repository contains none of its code.

---

## 中文摘要

choroweave（原质之织）是 **Inceptless** 体系中的"空间计算层"：把人的意图编译为可执行、可共在、可互访的 3D 世界包（World Bundle），用一套对齐 MSF "Web of Worlds" 的空间超链接协议（SHP）把个人节点上的世界连成网络，并提供 Babylon.js 参考运行时与可自托管节点。它不做封闭平台、不做 3A 引擎、不做 VR 硬件。

**四个判断**：① 需求真实但"通用 3D 社交平台"已死（Roblox 1.38 亿 DAU、Minecraft 1.55 亿 MAU；Rec Room 2026-06 停服）；② 生成在贬值、装配与验证在升值（TRELLIS.2 17 秒出 GLB，但 LLM 端到端游戏通关率仅 16%）；③ 标准窗口正在打开（`KHR_interactivity` 2026-08-28 ratified，但仅单用户；门户标准是真空）；④ 单元经济是生死线（Spatial 因托管成本关闭），答案是开放协议 + 自托管。

**路线**：P0 无 AI 的双世界门户验证（M0–M2）→ P1 编译器 MVP → P2 多人+节点 → P3 Agent/生态 → P4 v1.0+WebXR；3 人小队约 $1.1–1.6M / 24 个月。

完整中文版见 [`README.zh-CN.md`](README.zh-CN.md)；全部方案文档（中文）从 [`docs/en/00-executive-summary.md`](docs/en/00-executive-summary.md) 开始。
