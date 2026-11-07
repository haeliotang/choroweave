# choroweave Technology Selection: Decision Records and Evidence (v0.2)

> Status: draft · verified as of **2026-11-07** · for the implementation team, open-source community, and investors
> Evidence grades: **A** = primary specifications / official documentation / repository metadata; **B** = third-party measurement or authoritative media reporting; **C** = engineering judgment / community discussion. Every key conclusion carries a grade; anything that cannot be substantiated is marked `unknown`.
> Companions: [`01-landscape.md`](01-landscape.md) (ecosystem landscape), [`03-architecture.md`](03-architecture.md) (architecture in practice), [`04-spatial-hyperlink-protocol.md`](04-spatial-hyperlink-protocol.md) (protocol draft), [`research/`](research/) (four original research reports).
> Chinese version: [`../02-tech-selection.md`](../02-tech-selection.md)

---

## 1. One-page conclusion (ADR master table)

The choroweave technical path compresses into 12 decisions. If you read only one paragraph:

> **We are not building "another engine/platform" but the three-piece kit of the "spatial World Wide Web": an executable World Bundle, a portal/spatial hyperlink protocol (SHP), and a reference runtime plus self-hosted node.**
> Runtime bet: **KHR_interactivity (ratified 2026-08-28) + Babylon.js**, but confined to "object behavior inside an asset" — co-presence, world rules, and portals **must be built in-house**.
> Addressing bet: **HTTPS URL** (not a custom scheme or an on-chain address); link semantics **align with MSF "Web of Worlds" / X3D Anchor** (not a newly invented spatial language).
> Generation bet: **skeleton-first (Spatial-DSL + deterministic assembly) + TRELLIS.2 (MIT)**, because end-to-end LLM generation of a complete game achieved only a **16%** completion rate on public 2026 benchmarks.
> Multiplayer bet: **WebTransport/WebRTC + a self-built room server** (not Matrix event streams).
> We deliberately forgo short-term temptations: **VR-first, 3DGS streamed large worlds, world-model runtimes, WebGPU-only**.

| # | Decision | Primary evidence | Confidence |
|---|---|---|---|
| ADR-01 | choroweave incubates independently; it connects to tacitweave through the **Implicit Spatial Spec (ISS)** contract, without merging repositories | Heterogeneous tech stack/community/evolution cadence; ISS can be versioned independently | High |
| ADR-02 | The world artifact = **World Bundle**: glTF 2.0 `.glb` + `KHR_interactivity` + `CHW_*` vendor extensions + `world.json` + content-addressed assets; **not** a private scene format | glTF is the only 3D delivery format consumed by multiple engines/tools (A) | High |
| ADR-03 | Three logic layers: **L0** KHR_interactivity (object behavior, standard) / **L1** curated networked mini-game modules (parameterized) / **L2** capability-sandboxed WASM (P3+); the specification explicitly scopes L0 to **single-user, no UI/scripting** | Khronos specification + Babylon documentation (A) | High |
| ADR-04 | Reference runtime = **Babylon.js 9.x (Apache-2.0; ADR-0004 rev.1)**, **WebGL2-first**, with WebGPU as feature enhancement; three.js only for 3DGS/embedding side branches; **do not fork Hyperfy** | Babylon + glTF-SampleViewer are the only two ratified-grade implementations (A) | High |
| ADR-05 | World identity = **HTTPS URL (pointing at `world.json`)**; `weave://` is a registrable alias only; assets are SHA-256 content-addressed + CDN | Clickable/cacheable/indexable; custom schemes cannot be opened directly in chat tools (C) | High |
| ADR-06 | **SHP = a lightweight profile aligned with MSF "Web of Worlds" + the `CHW_portal` portal extension + an entry handshake**; do not wait for OMI (no portal extension) | MSF/X3D 4.1 WoW Anchor/Inline (A/B); OMI extension list (A) | High |
| ADR-07 | Real-time layer: WebSocket room server (P0-P1) → **WebTransport / WebRTC DataChannel** (P2+) + LiveKit voice; Matrix only as an optional social bridge, **never carrying pose** | WebTransport 92% caniuse (B); Matrix is an asynchronous event DAG (A/C) | High |
| ADR-08 | Identity = **Passkey/OIDC** to start → `did:web` for portable reinforcement; **no blockchain/tokens**; avatars as glTF first, VRM at P2 | Lowers onboarding/compliance cost; no evidence of an on-chain requirement (C) | Medium-high |
| ADR-09 | Compiler = **skeleton-first (Spatial-DSL + deterministic assembly) + LLM planning + validate-and-repair loop**; default asset model **TRELLIS.2 (MIT)**; Hunyuan3D optional only | TRELLIS.2 MIT (A); CEGame-Bench 16% completion (A/B) | High |
| ADR-10 | Physics = **Rapier (Apache-2.0/WASM)**; automatic collider generation + a semantic subset of `OMI_physics_shape` + `CHW_collider` as fallback; KHR_physics is still a Review Draft and cannot be depended on | Khronos registry (A); OMI Stage 1 (A) | Medium-high |
| ADR-11 | World models and 3DGS **are not used as a multiplayer persistent runtime**; although `KHR_gaussian_splatting` is now ratified, 3DGS is deferred to P3 as visual enhancement | Genie 4 official limitations (A); Marble exports persistent assets (A); headset streaming cost (B/C) | Medium-high |
| ADR-12 | Licensing: **code Apache-2.0 / specification CC-BY-4.0 / example assets CC0-CC-BY**; the **conformance suite** is the governance core | Protocol adoption depends on free commercial use + verifiability (C) | High |

---

## 2. Evaluation method and evidence discipline

| Dimension | Weight | Meaning |
|---|---|---|
| Standards alignment | 25% | Can third-party engines/tools consume the artifact, rather than being locked to us? |
| Ecosystem and talent | 15% | Libraries/tools/docs/hireable developers |
| Performance and device coverage | 15% | WebGL2 floor, WebGPU enhancement, Quest/visionOS reachable |
| License and governance | 10% | Can commercial projects adopt it without copyleft contagion? |
| Maintenance activity | 15% | Is upstream active, or dependent on a single point of failure? |
| 6-month feasibility | 10% | Can a small team produce a demonstrable MVP? |
| 3-year evolution | 10% | Does it benefit from evolving standards/hardware? |

**Evidence discipline**: prioritize specification text, official documentation, GitHub API metadata, and vendor press releases; third-party articles are cited only after cross-validation and are explicitly labeled. All GitHub data was read through the REST API on 2026-11-07; the 10 facts that could not be confirmed from primary sources during research are collected in the "unverified" list in [`research/03`](research/03-runtime-standards.md) and must not be assumed during implementation.

---

## 3. Key decisions in detail

### ADR-02 / ADR-03: the world package and the "three logic layers"

**Problem**: what does the generated "space" get delivered as? Private engine scene formats are not portable; pure glTF has appearance only; and if gameplay is written as host JS, the UGC safety boundary is immediately lost.

**Evidence**:
- On 2026-07-16 Khronos announced that `KHR_interactivity` was submitted for ratification; the specification body's Status reads **"Complete, Ratified by the Khronos Group"**, with a ratification date of **2026-08-28** (A: specification body + extension registry; Khronos issued no separate ratification press release, which is the source of the "still being ratified" misreading).
- Babylon.js official documentation covers loading, validation, execution, Flow Graph editing, and **lossless export**; unknown additional extension operations are preserved as typed no-ops (A: [Babylon KHR_interactivity documentation](https://github.com/BabylonJS/Documentation/blob/master/content/features/featuresDeepDive/importers/glTF/khrInteractivity.md)).
- **Specification boundaries** (A): it targets **single-user** scenarios only and does not handle multi-user networking; it supports neither UI nor arbitrary scripting; behavior graphs are Turing-complete but require runtime throttling. Therefore "multi-user co-presence + portals + world rules" is **outside the standard's coverage** and must be built by SHP/World Protocol.
- As of 2026-11 the only ratified-grade implementations are **Babylon.js** and **glTF-Sample-Viewer (UX3D)**; Unity only exports, Godot only ships the companion `KHR_node_visibility`, and three.js has no executor (A/B).

**Decision**:
1. **Object-level interaction** in the World Bundle (click to play / open a door / pick up / triggers / simple state machines) is compiled into `KHR_interactivity` behavior graphs as the portable baseline; the host does not execute arbitrary JS inside assets.
2. **Spatial-DSL is an internal compiler IR, not a public standard**. The public contract is the World Bundle + `world.json`; the DSL may evolve with compiler versions (this is the key to avoiding "freezing a DSL before the spec exists"). For third-party compiler authors, we offer a "World Bundle generation SDK" rather than requiring them to implement the DSL.
3. L1 (networked mini-games: gomoku, quiz, fishing, etc.) is delivered as **parameterized official modules**, avoiding open-ended user logic during P2; L2 (sandboxed WASM + capability allowlist) arrives at P3, with capabilities covering "read room state, emit custom events, modify declared properties", and the sync whitelist expressed as **glTF Object Model JSON Pointer paths**.

**Cost**: L0 has limited expressiveness (cannot do complex RPG logic); L1 requires continuous investment in game modules; L2's sandbox and network determinism are long-term engineering. But these three layers make "safe" and "portable" true from day one.

**Review signals**: if Godot/Unity ship official KHR_interactivity playback in H1 2027, the adoption dividend of L0 grows and we should invest more in "asset-market portability"; if Babylon's implementation shows systematic conformance defects, then re-evaluate building our own executor.

---

### ADR-04: why the runtime is Babylon.js, and why "not WebGPU-only"

**Candidates and evidence**:

| Candidate | Key evidence | Conclusion |
|---|---|---|
| **Babylon.js 9.x** | Apache-2.0; the only ratified-grade general engine for KHR_interactivity (load/execute/Flow Graph/lossless export); dual WebGL2+WebGPU backends; mature WebXR; Flow Graph visual debugging (A) | **P0-P4 primary runtime** |
| three.js | MIT, largest ecosystem; but **no KHR_interactivity executor**; WebGPU+XR is still half-finished: only in 2026-04 was "XR under WebGPU throws directly" changed to automatic WebGL fallback (PR #33497), and the XR framebuffer is still being refactored (#33154) (B) | 3DGS/embedding side branch |
| PlayCanvas | Strong WebGPU/3DGS (SuperSplat/SOG), but no KHR_interactivity; suited to asset optimization and 3DGS tooling (B) | Asset pipeline |
| Hyperfy v2 | `hyperfy-xyz/hyperfy`: GPL-3.0, 310 stars; v0.16.0 released 2025-12-18, main branch has had no commits since, dev branch last active 2026-04-21 (A). The only shipped self-hosted Web world engine, but **low maintenance on the main repo + GPL-3.0 + no cross-world portal primitive** | Learn from the design only, do not fork |
| Third Room | `matrix-org/thirdroom`: Apache-2.0, 656 stars, last push 2023-08-30 (A) | Historical reference only |
| Build our own engine | Cannot cover WebXR/WebGPU/physics/animation/behavior graphs/editor within 6 months | Explicitly not doing it |

**Decision**:
- The reference runtime is based on Babylon.js 9.x, **WebGL2-first** (default), with WebGPU used through feature detection for high-quality desktop preview, 3DGS, post-processing, and compute-heavy effects; **WebGL2 is the default inside XR sessions**, because the WebXR/WebGPU Binding is still an Editor's Draft, headset-browser WebGPU status could not be verified, and Babylon labels its own WebGPU-XR support experimental (A/B).
- Build a **Runtime Adapter** on top of Babylon (scene loading, input abstraction, state whitelist, portal lifecycle, avatar/network interfaces), with the goal of being "replaceable with a three.js adapter within 3 months", avoiding lock-in.

**Performance budget (written into the engine startup check)**:

| Tier | Device | Triangles/frame | Draw calls | Texture VRAM | First payload | Per space | Target |
|---|---|---|---|---|---|---|---|
| XR-Low | Pico 4 / Quest 2 | 200k–300k | 40–60 | ≤300 MB | ≤5 MB | ≤15 MB | 72 Hz |
| **XR-Mid** | **Quest 3** | **300k–500k** | **50–80** | ≤400 MB | ≤8 MB | ≤30 MB | 72–90 Hz |
| XR-Apple | visionOS Safari | 500k–800k (est.) | 60–100 | unverified | ≤8 MB | ≤30 MB | 90 Hz |
| Desktop | PC/laptop | 2M–5M | 200–500 | ≤2 GB | ≤15 MB | ≤80 MB | 60 fps |

> The XR tiers are engineering discounts of 0.5–0.7 applied to Meta's official native budgets (≤150 draw calls, <1M triangles, 500–700 MB textures), **not official data**; visionOS/3DGS must be calibrated on device.

---

### ADR-05 / ADR-06: why a portal is "URL + descriptor + a WoW-aligned extension"

**Problem**: how do we make "push open the door into a friend's world" as natural as clicking a link, without inventing a protocol that nobody implements?

**Evidence**:
- **MSF (Metaverse Standards Forum) proposed "Web of Worlds" in 2026**: "pages become places, links become portals"; the accompanying **X3D 4.1 WoW Profile** explicitly includes **Anchor (3D hyperlink)** and **Inline (external scene)** nodes, with Threedy.io / Virginia Tech implementing them (A/B: MSF white paper, Web3D blog).
- On the glTF side: **there is no ratified spatial linking extension**. OMI has no portal extension; `OMI_link` is archived; `OMI_spawn_point` is still Stage 1 (A).
- World Wide Web experience: what is clickable, cacheable, indexable, and cross-implementation is URL/HTTP/HTML, not any single client (C, strategic judgment).

**Decision**:
1. **SHP positions itself as "an implementable profile of Web of Worlds"**, not a new language: semantically it maps WoW's Anchor ("a link is a portal") / Inline (external scene), and engineering-wise it fills in what WoW has not yet defined — **entry handshake, capability negotiation, trust, prefetch budget, failure rollback**.
2. **The world identity is simply an HTTPS URL**: `https://alice.example/worlds/rooftop/world.json`; nodes declare capabilities and room-service endpoints at `/.well-known/weave-node.json`.
3. **A portal is an ordinary glTF node + a `CHW_portal` extension**, with minimal fields aligned to the research recommendation: `target` (URL/content hash), `anchor` (node + transform), `handoff` (`same-instance` / `cross-instance` / `new-session`), `policy` (permissions/resource budget), `version`.
4. **Entry is a handshake with explicit stages**: proximity prefetch → verify signature/capabilities → user confirmation (configurable to skip) → join the target room → save avatar state → atomic scene switch → rollback on failure. Metrics: warm traversal < 1.5s, cold start < 5s.
5. **An extension is a degradation path**: viewers that do not support `CHW_portal` treat it as an ordinary decoration and can still browse the world — consistent with glTF's philosophy of ignoring unknown extensions.

**Relationship with standards bodies**: use the `CHW_` prefix to iterate quickly and submit mapping documents to the MSF/Web3D community; reuse `OMI_spawn_point` semantics first; **do not wait for standardization** (OMI needs at least 1–2 years to complete Stages 3-5).

---

### ADR-07: why real-time multiplayer is not Matrix

**Evidence and reasoning**:
- Matrix targets **asynchronous messages and state events (DAG)**, suited to chat/room state/permissions; E2EE and federation replication bring latency and write amplification (A: Matrix specification positioning; C: real-time judgment).
- Multiplayer spaces need 10–20 Hz pose, deterministic interpolation, packet-loss/reordering handling, and low-latency voice; **WebTransport (QUIC datagram)** or WebRTC DataChannel is a better fit. WebTransport is a W3C WD, shipping in Chrome 97+/Firefox 114+/Safari 26.4+, at roughly 92% caniuse coverage as of 2026-10 (B).
- The Third Room core repo has been dormant since 2023-08, and there is **no public evidence** that Matrix real-time synchronization has been solved in engineering terms (A + C).

**Decision**:
- **P0-P1**: a single-room WebSocket authoritative server (Node + binary protocol, snapshot + delta, client interpolation), up to 20 people.
- **P2+**: pose/events go over **WebTransport** (falling back to WebRTC DataChannel or WebSocket when unavailable); voice goes over LiveKit (Apache-2.0, self-hosted).
- **Matrix's place**: an optional "social bridge" — world follows, guestbook messages, event notifications, identity mapping — never carrying real-time state.
- **Sync whitelist**: the network layer may only modify syncable properties declared in `world.json` (JSON Pointer), preventing UGC from arbitrarily changing the scene.

---

### ADR-09: why the compiler is "skeleton-first"

**Problem**: generating a playable space from a single LLM sentence is most likely to fail on proportions, connectivity, collision, and gameplay decidability.

**Evidence**:
- **CEGame-Bench (2026-10)**: agents build complete games from an empty project in five production engines (Defold/Godot/Roblox/Unity/Unreal), averaging 295 steps and 65M tokens, with **only 16% of runs completing the game**; the "engineer + coding agent" reference implementation scores near perfect — the gap is the agent, not the tooling (A/B: [arXiv 2610.26098](https://arxiv.org/abs/2610.26098)).
- **TRELLIS.2 (4B, MIT, weights + code + training code fully open)**: on an H100, 512³ ≈ 3s, 1024³ ≈ 17s, 1536³ ≈ 60s, natively outputting GLB with four PBR channels, decimatable to the million-triangle level (A: [repo](https://github.com/microsoft/TRELLIS.2)).
- **Hunyuan3D open source stops at 2.1/Omni/Part**; 3.0/3.1/3.5 are cloud services with no weights; the community license **excludes the EU/UK/KR** and **triggers re-licensing at 1M MAU** (A: [LICENSE](https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1/blob/main/LICENSE)).
- **Part-based generation** is becoming key to playable assets: Roblox CubePart (OpenRAIL) generates assemblable parts per a parts schema; HY3D-Bench has 240k part-level samples (A).

**Decision**:
1. **Two-stage compilation**: the LLM only produces a JSON-Schema-constrained Spatial-DSL; a deterministic compiler handles layout solving, assembly, collision, LOD, behavior-graph generation, and validation. The LLM does not generate binaries or write rendering code.
2. **Skeleton-first**: rooms/walls/doors/windows/lighting prefer dimensionally exact modular kits (guaranteeing proportions and collision); only feature props call generative models.
3. **Parts are a first-class Spatial-DSL field**: an entity = a set of semantic parts + assembly constraints + interactive properties, which simplifies skeleton binding, collider generation, and later gameplay (incorporating the gen3d research recommendation).
4. **Validate-and-repair loop**: Schema → semantic validation (connectivity, spawn reachability, portal reachability, budget) → post-assembly glTF Validator + strict `KHR_interactivity` validation (Babylon `strictValidation`) → structured diagnostics fed back to the LLM (≤N times) → still failing, degrade to a template world.
5. **Assets default to TRELLIS.2 (MIT)**; Pixal3D (MIT, pixel-aligned) as a backup; Hunyuan3D only as a "user-configured provider", **never a default distribution dependency** (region/MAU/legal).
6. **Cost expectation**: about **$0.5–8 per space** (engineering estimate, excluding human fallback), 5–10 minutes for draft and 20–40 minutes for standard; this must be measured continuously with an evaluation set.

---

### ADR-10 / ADR-11: physics, 3DGS, and the "not-doing list"

**Physics**: `KHR_physics_rigid_bodies` / `KHR_collision_shapes` are still **Review Draft**, and most `OMI_physics_*` extensions are Stage 1 with only a Godot plugin implementing them (A) → **we cannot depend on the standard**. The reference runtime uses **Rapier** (Apache-2.0, WASM, small bundle, actively maintained; see [`01-landscape.md`](01-landscape.md)), with colliders auto-generated as bounding boxes/convex hulls plus simplified convex decomposition; persisted fields use a semantic subset of `OMI_physics_shape`, with `CHW_collider` as fallback; **Blender is not a hard dependency** (optional offline refinement only).

**3DGS**: `KHR_gaussian_splatting` is ratified (2026, exact date unverified), SPZ 4 (Niantic) and SOG (PlayCanvas) are de facto transport formats, and Marble exports SPZ by default (A/B). But on headsets 1M splats ≈ 19–21 MB, streamed LOD is still on the SPZ v5 roadmap, and it is separate from physics/interaction (B/C). → **P3 as visual enhancement** ("scanning real places / art backdrops"), no investment in P1-P2.

**World models**: Genie 4 (2026-10) officially acknowledges that shared multi-user environments remain a research challenge, sessions last only minutes, and drift occurs; Marble outputs **persistent 3D assets**, not a runtime; Matrix-Game 4.0 validated the engineering split of "engine owns state/physics + neural rendering owns the visual layer" (A/B). → Used only for content generation and the visual layer, **never as the state authority**.

**Identity**: Passkey/OIDC to start → `did:web` (the domain is the identity, a natural fit for self-hosted nodes); no wallets/tokens. Avatars use glTF humanoid stand-ins at P1, with VRM/`CHW_avatar` evaluated at P2.

---

### ADR-12: licensing, governance, and "the moat is the test suite"

- **Code Apache-2.0** (includes a patent grant, suited to commercial host integration); **specification CC-BY-4.0** (free to implement/commercialize, with attribution); **example assets CC0/CC-BY**.
- Copying GPL/AGPL code into core packages is forbidden (Hyperfy's GPL-3.0 is a typical risk); CI runs license/SBOM checks.
- **Open-source boundary**: the core protocol, reference implementation, schemas, and conformance suite are fully open source; the **hosted operations layer (SaaS) may be closed-source/privately deployed**, but must offer data export and migration and commit to no lock-in (details in [`08-open-source-strategy.md`](08-open-source-strategy.md) §7). This is the "sustainable but no rent-taking" boundary.
- Models and generated assets record **provenance** (model name/version/license/parameters), published with the World Bundle; Hunyuan-style license restrictions are isolated at the provider layer.
- **The conformance suite `weave-check` is a core asset**: it validates `world.json`, glTF, behavior graphs, portals, budgets, and security policy; any implementation claiming SHP compatibility should be able to pass it. The moat of a protocol project is not code but "verifiable conformance + ecosystem adoption".

---

## 4. Selection matrix (weighted)

Scores 1-5 (5 best), weights as in section 2.

| Candidate | Standards alignment | Ecosystem talent | Performance coverage | License | Maintenance | 6-month feasibility | 3-year evolution | Weighted |
|---|---|---|---|---|---|---|---|---|
| **Babylon.js 9 + KHR_interactivity (WebGL2-first)** | 5 | 3.5 | 4 | 5 | 4 | 4 | 5 | **4.48** |
| three.js + in-house behavior-graph executor | 2.5 | 5 | 4 | 5 | 5 | 2 | 3 | **3.68** |
| PlayCanvas + in-house behavior graph | 2 | 3 | 4.5 | 4.5 | 4 | 2 | 3 | **3.13** |
| Hyperfy v2 | 2 | 2 | 4 | 2 (GPL) | 2 (dormant) | 3 | 2 | **2.35** |
| Third Room | 2 | 1 | 3 | 5 | 1 | 2 | 1 | **2.10** |
| In-house Web engine | 3 | 2 | 3 | 5 | — | 1 | 3 | **2.70** |

> Weights and scores are engineering judgment (C), used to expose trade-offs rather than replace the decision. Babylon's advantages concentrate in "standards alignment + license + evolution"; three.js's advantage is ecosystem and talent, but the behavior-graph executor cannot be filled in within P1.

---

## 5. Differences from the original assumptions (must be stated explicitly)

| Original assumption | Correction | Basis |
|---|---|---|
| Third Room is "the active project closest to a spatial World Wide Web, usable as a foundation" | **Effectively dormant** (no core-repo commits after 2023-08); learn from its ideas, do not depend on it | GitHub API (A) |
| Hyperfy can serve as a "lightweight Web space framework/foundation" | Main repo is **GPL-3.0** and main has had no commits since 2025-12 (low maintenance after v0.16.0); forking would carry license and maintenance risk into the core | GitHub API (A) |
| Matrix can handle multiplayer state sync and teleportation | Good for asynchronous social/identity, **not for pose-level real-time sync**; the real-time layer uses WebTransport/WebRTC/WS | Specification positioning + engineering judgment (A/C) |
| KHR_interactivity is a "future standard, so build our own first" | **Ratified on 2026-08-28**, and Babylon already plays it fully; we should bet on the object-behavior layer now | Khronos specification + Babylon documentation (A) |
| KHR_interactivity can carry full gameplay/multiplayer | The specification **explicitly covers single-user, no UI/scripting**; multiplayer + portals + world rules must be built in-house | Khronos specification (A) |
| Invent our own spatial hyperlink protocol | Align with **MSF "Web of Worlds"/X3D Anchor** first; SHP fills only gaps such as handshake/trust/prefetch | MSF/X3D (A/B) |
| Spatial-DSL should be a public standard | DSL starts as an **internal compiler IR**; the public contract is World Bundle + world.json | Engineering judgment (C) |
| 3DGS neural streaming is a key P1 selling point | `KHR_gaussian_splatting` is ratified, but headset cost/streaming/physics are immature; **P3 visual enhancement** | Research conclusion (B/C) |
| VR headsets as the first entry point | Web/desktop first, WebXR progressive enhancement; visionOS needs both WebXR and `<model>`/Immersive API tracks | Market/runtime research (A/B) |
| The generation pipeline depends on headless Blender baking | Not a hard dependency; colliders are generated in-pipeline, Blender is optional refinement only | Deployment/CI cost (C) |
| Use a custom scheme for world addresses | Primary identity is an **HTTPS URL**; custom schemes are aliases only | Clickability/cacheability (C) |
| One-sentence generation of a complete game is a viable product promise | 2026 benchmarks show only 16% completion; skeleton-first + templates + validation-repair is mandatory | CEGame-Bench (A/B) |

---

## 6. Open Questions

| Question | Impact | Resolution path | Deadline |
|---|---|---|---|
| WebGPU availability in Quest/Pico browsers | Whether WebGPU can be used inside XR | On-device A/B + quarterly review of release notes | P1 |
| visionOS per-item support for Hit Test/Anchors/Depth/Lighting | Apple ecosystem entry | On-device testing | P2 |
| VRM loading approach and maintainability in Babylon | Avatar system | Community loader evaluation + in-house fallback | P2 |
| LiveKit/Pion/WebTransport RTT/CPU in headset browsers | Multiplayer approach | 20-person room stress test | P2 |
| Hunyuan3D license region/MAU clauses | Whether to offer it as an optional provider | Legal review | P1 |
| glTF 2.1 (multi-file composition/external scenes) release cadence | Merge with SHP Inline semantics | Follow the Khronos Town Hall (2026-11-17) | P1 |
| `KHR_gaussian_splatting` compression extension | 3DGS visual layer | Follow Khronos | P3 |

---

## 7. References (by evidence grade)

**Grade A (primary)**
- Khronos, *glTF Interactivity Extension Submitted for Ratification*, 2026-07-16. https://www.khronos.org/news/press/gltf-interactivity-extension-submitted-for-ratification
- Khronos glTF specification `KHR_interactivity` (Status: Complete, Ratified; 2026-08-28). https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_interactivity
- Babylon.js documentation, *KHR_interactivity*. https://github.com/BabylonJS/Documentation/blob/master/content/features/featuresDeepDive/importers/glTF/khrInteractivity.md
- MSF "Web of Worlds" / X3D 4.1 WoW Profile. https://www.web3d.org/new/blog/how-web-worlds-x3dweb3d-and-metaverse-standards-forum-tie-together
- OMI glTF Extensions README (extension stage table; no portal). https://github.com/omigroup/gltf-extensions
- `microsoft/TRELLIS.2` (MIT, 4B, PBR GLB). https://github.com/microsoft/TRELLIS.2
- `Tencent-Hunyuan/Hunyuan3D-2.1` LICENSE (EU/UK/KR exclusion + 1M MAU). https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1/blob/main/LICENSE
- GitHub REST API metadata (accessed 2026-11-07): thirdroom (Apache-2.0, pushed 2023-08-30), hyperfy (GPL-3.0, pushed 2026-04-21), TRELLIS/TRELLIS.2 (MIT).
- caniuse *WebGPU* (2026-10), *WebTransport* (2026-10).

**Grade B (third-party measurement/reporting)**
- CEGame-Bench (arXiv 2610.26098), 2026-10: end-to-end LLM game completion rate 16%.
- BitSoul3D (2026-08-16) engine support tiers: Babylon full, three.js load-only, Unity export-only, Godot partial, UE5 unconfirmed.
- three.js PR #33497 / #33154: WebGPU + XR still evolving.
- Genie 4 official page Limitations; Marble pricing/export specs; Matrix-Game 4.0 (Apache-2.0).

**Grade C (engineering judgment/strategic reasoning)**
- Judgments such as URL vs custom scheme, Matrix being unsuitable for real time, the controllability of skeleton-first generation, DSL as internal IR, and the conformance suite as a moat are team inferences and are marked as such in the body text.

**Supporting material**
- ADR index and change process: [`decisions/README.md`](../decisions/README.md) · root overview: [`README.md`](../../README.md).
