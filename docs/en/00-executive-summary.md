# choroweave Executive Summary

> Version v0.1 · 2026-11 · Based on four first-hand research reports ([`research/`](research/); English translations; Chinese originals under `../research/`) and 12 ADRs ([`02-tech-selection.md`](02-tech-selection.md))
> Audience: founders / investors / first contributors. Every number is tagged with an evidence grade; estimates are explicitly labeled "estimate".
> Chinese version: [`../00-executive-summary.md`](../00-executive-summary.md)

---

## 1. In One Sentence

**choroweave is the "HTML compiler + HTTP + browser" of the spatial era**: it compiles natural-language intent into playable, co-present 3D world bundles (World Bundle), links worlds hosted on personal nodes into a network through a hyperlink protocol (SHP) aligned with MSF's "Web of Worlds", and ships a self-hostable reference runtime and node. It is not a new metaverse platform; it builds **the protocols and tools between platforms**.

---

## 2. Why Now (Five Validated Judgments)

| # | Judgment | Key evidence | Implication for us |
|---|---|---|---|
| 1 | **Demand is real, but the "general-purpose 3D social platform" model is dead** | Roblox 2026Q3 DAU **138 million**, quarterly hours near **34 billion**, revenue **$1.572 billion**; Minecraft MAU **155 million**; VRChat MAU **>1 million**, peak CCU **158,192**. Meanwhile Rec Room (150 million cumulative players, $3.5 billion peak valuation) **shut down on 2026-06-01**; Spatial **ended hosting in 2025-07**, its CEO stating plainly that it "could not find a sustainable model for hosting costs" (A/B) | Don't build "yet another platform"; build protocols and tools that let individuals and communities host their own worlds |
| 2 | **The generation layer is depreciating; the interconnection layer is appreciating** | TRELLIS.2 (MIT) already generates PBR GLBs on an H100 in **17 seconds**; yet an LLM doing a complete game end to end passes only **16%** of runs on the five-engine benchmark CEGame-Bench; World Labs raised about **$1.23 billion**, and Marble charges **$1.2–2.5** per world (A/B) | Generation will be commoditized; **verifiable spatial compilation + consistency + distribution** is the scarce asset |
| 3 | **The standards window is opening, and the gap is clear** | `KHR_interactivity` was **ratified on 2026-08-28**, but the spec explicitly covers **single-user** only, with no UI/scripting; OMI has no portal extension (`OMI_link` is archived); in 2026 MSF proposed the **"Web of Worlds"**, and the X3D 4.1 WoW Profile defines **Anchor (3D hyperlinks) / Inline (external scenes)** (A) | SHP should **align with WoW semantics and add handshake/trust/prefetch/rollback**; bet directly on KHR_interactivity for object behavior |
| 4 | **VR-first is not supported by data** | IDC: 2025 headset shipments **-42.8%**; Vision Pro about **45 thousand units** for the year (390 thousand in 2024); Quest **-16%** over the first three quarters; smart glasses **+211.2%** over the same period; the only positive variable is Steam Frame (5.49% of SteamVR in its 2026-09 launch month) (B) | **Web/desktop first, progressive WebXR**; visionOS follows a dual track of WebXR + `<model>`/Immersive API |
| 5 | **AI generation alone is not enough; "skeleton + validation" is mandatory** | 2026 engineering consensus: Roblox Reality uses "engine holds state + video model generates pixels only"; Matrix-Game 4.0 is isomorphic; TRELLIS.2 produces assets, not gameplay (A/B) | The LLM emits only a constrained Spatial-DSL; deterministic assembly + validate-and-repair loop; the engine owns state |

---

## 3. What We Do / What We Don't

**In scope**
1. **Chôra Compiler**: intent/ISS → Spatial-DSL (internal IR) → deterministic assembly → World Bundle; includes 6 validation categories and a repair loop.
2. **Spatial Hyperlink Protocol (SHP v0.1)**: HTTPS world addressing, `world.json`, the `CHW_portal` portal extension, entry handshake, capability negotiation, signatures and access gating, prefetch budget.
3. **Reference runtime + self-hosted node**: Babylon.js 9.x (WebGL2-first), WebSocket rooms (P1) → WebTransport/WebRTC (P2+), the `weave-check` conformance suite.
4. **Samples and templates**: 3 showcase worlds including pixel rooftop + modular kit library + official mini-game modules (L1).

**Out of scope (recorded in the roadmap and risk documents)**
- No 3A engine / no in-house web engine; no Hyperfy fork (GPL-3.0 and no longer updated).
- No centralized hosting monopoly; no UGC transaction fees as the primary revenue (the Rec Room lesson).
- No VR-first, no on-chain land/tokens, no in-house world model.
- No 3DGS streamed large worlds in P1-P2 (`KHR_gaussian_splatting` is ratified but remains a P3 visual enhancement).
- No promise of "one sentence generates a complete game" (the 2026 benchmark passes only 16%).

---

## 4. Technical Path (Summary of 12 ADRs)

| Layer | Choice | Rejected alternative |
|---|---|---|
| World bundle | glTF 2.0 + `KHR_interactivity` + `CHW_*` + `world.json` + content addressing | Proprietary scene format, pure video world model |
| Interaction | L0 behavior graph (default) / L1 curated networked modules / L2 sandboxed WASM (P3+) | Open arbitrary JS, business logic crammed into the behavior graph |
| Runtime | **Babylon.js 9.x (Apache-2.0, WebGL2-first)** + Runtime Adapter | three.js (no behavior-graph executor), in-house engine |
| Addressing/linking | **HTTPS URL** + `.well-known` + `CHW_portal`, semantics aligned with MSF WoW/X3D Anchor | Custom scheme, on-chain addresses, inventing another spatial language |
| Realtime | WebSocket (P1) → **WebTransport / WebRTC DataChannel** (P2+) + LiveKit voice | Matrix for realtime state, centralized game servers |
| Identity | Passkey/OIDC → `did:web`; no blockchain | Wallets/tokens, platform account lock-in |
| Generation | **Skeleton-first + deterministic assembly + TRELLIS.2 (MIT)**; Hunyuan3D optional only | End-to-end black-box generation, hard Blender dependency |
| Physics | **Rapier** + automatic colliders + `CHW_collider` fallback | KHR_physics (still a Review Draft) |
| License | Code Apache-2.0 / spec CC-BY-4.0 / examples CC0-CC-BY | GPL contagion, default dependency on non-OSI models |

Detailed reasoning is in [`02-tech-selection.md`](02-tech-selection.md); its §5 itemizes **divergences from the original idea** (Third Room discontinued, Hyperfy GPL, Matrix unsuitable for pose synchronization, KHR_interactivity single-user only, VR-first unsupported, etc.).

---

## 5. Product Wedge

Market evidence shows: **users stay for events, not for spaces** (VRChat's peak comes from virtual concerts; Spatial's platform closed while its social game still had ~500k DAU). Hence two steps:

1. **P1 acquisition wedge: addressable exhibition/portfolio spaces** — creators generate a "3D link-in-bio" in one sentence (pixel rooftop, personal gallery, small shop) and share a single link on existing social platforms. Low barrier, shareable, fast content supply.
2. **P2 retention wedge: cross-community event tours** — worlds from multiple creators/communities are linked by portals into "event routes" (exhibitions, concerts, puzzle nights), with events driving return visits. This is the minimum viable form of "world hopping".

**Positioning narrative**: not "another VRChat/Rec Room" but **"the DNS + HTTP + compiler between worlds"**; our success depends on how many **other people's** worlds and nodes connect through SHP.

---

## 6. 24-Month Roadmap (Summary)

| Phase | Time | Goal | Exit criteria (Gate) |
|---|---|---|---|
| **P0 Protocol validation** | M0–M2 (gate **2027-01-25**) | Hand-build two worlds, nodes traverse both ways; SHP v0.1 + `weave-check`; zero AI | G0: bidirectional traversal **10/10**, `weave-check` **22/22**, ≥1 external developer reproduction, zero generative calls |
| **P1 Compiler MVP** | M2-M6 | One sentence → a playable single-room world; entry, object interaction, two-world traversal; flagship demo | G1: ≥70% of 20 evaluations playable, hot switch <1.5s, desktop 60fps |
| **P2 Multiplayer networking** | M6-M12 | 20-person rooms, WebTransport, one-click self-hosted node deployment, avatars/access gating | G2: 20 people stable for 30 minutes, cross-node traversal demo, spec v0.5 |
| **P3 Ecosystem and agents** | M12-M18 | Resident Agent reception, spatial evolution, community node network, 3DGS visual experiments | G3: 100 public worlds / 10 third-party nodes, next-week return rate ≥25% |
| **P4 Immersion and standardization** | M18-M24 | Deep WebXR adaptation (Quest 3 72fps), protocol v1.0, governance handover | G4: v1.0, 3 third-party runtimes pass conformance, visionOS dual track usable |

> Critical sequencing correction: **P0 must precede the compiler**. Validate portals/nodes/manifests first with hand-built worlds and no AI; otherwise there is no way to tell whether the compiler's output can "enter the network".

---

## 7. Resources and Budget (Estimate)

| Scenario | Team | Monthly cost (estimate) | 24 months (estimate) | Notes |
|---|---|---|---|---|
| Lean | 3 FTE + 0.5 design/community | **$45k–65k/month** | **$1.1–1.6M** | 1 runtime/graphics, 1 compiler/ML, 1 protocol/backend; outsourced art; GPU on demand |
| Standard | 8–10 FTE | **$140k–200k/month** | **$3.4–4.8M** | Adds technical art, community, DevRel, QA, security/compliance |

Cost drivers: people (~70%), GPU/model calls ($2k–8k per month during P1, linear in world-generation volume), infrastructure (node hosting/CDN, $500–3k/month, growing with public worlds). **Unit economics must be measured from P1**: target cost per world < $8 (estimate); bandwidth cost per 1,000 visits must stay below $1.

---

## 8. Key Metrics (KPI)

| Dimension | Metric | P1 | P2 | P3 | P4 |
|---|---|---|---|---|---|
| Compilation quality | 20-eval "playable" pass rate | ≥70% | ≥85% | ≥90% | ≥95% |
| Compilation speed | Generation time p50 (draft / standard) | ≤10 / ≤20 min | ≤8 / ≤15 min | ≤5 / ≤10 min | ≤3 / ≤8 min |
| Generation cost | Cost per standard world (CPW) | ≤$8 | ≤$6 | ≤$4 | ≤$3 |
| Network experience | Portal hot-switch time p95 | <1.5s | <1.2s | <1.0s | <0.8s |
| Multiplayer | 20-person room stable duration | — | ≥30 min | ≥60 min | ≥120 min |
| Ecosystem | Public worlds / third-party nodes | 3 / 0 | 30 / 3 | 100 / 10 | 500 / 50 |
| Retention | Next-week return rate (visitors) | — | ≥15% | ≥25% | ≥35% |
| Compatibility | Third-party runtimes passing conformance | 1 (in-house) | 1 | 2 | ≥3 |

---

## 9. Key Risks and Hedges (Top 6)

| Risk | Evidence | Hedge |
|---|---|---|
| **Unit economics failure** (most fatal) | Spatial shut down hosting; Rec Room shut down because of its UGC revenue-share structure (A/B) | Open protocol + self-hosted nodes externalize costs; revenue from hosting services/enterprise deployments/support, not revenue share; measure bandwidth/GPU cost per world from P1 |
| **Insufficient VR demand** | 2025 headset shipments -42.8%; Vision Pro 45 thousand units (B) | Web/desktop first; progressive WebXR; visionOS dual track; Steam Frame as an observation point for open PC headsets |
| **Platform squeeze** (Roblox/Fortnite/Astrocade/Bitmagic/Marble) | Roblox DAU 138 million; Astrocade $56M, 5M MAU; Bitmagic GDK aimed at AI agents (A/B) | Don't fight head-on: build "portable world bundles + cross-platform links + self-hosting"; interoperate with platforms (export glTF/VRM) instead of opposing them |
| **Standards captured by big vendors** | MSF WoW already has an agenda; KHR_interactivity already adopted by Babylon and others (A) | Submit CHW_ to OMI/MSF early; establish a de facto standard through the conformance suite and reference implementation; keep the "lightweight profile" position |
| **Security/content governance incident** | UGC + cross-node + strangers entering private spaces (C) | Private by default + access gating (open/ring/allowlist/private) + behavior-graph sandbox (no JS) + reporting/rating + signatures and asset verification; complete threat model and red team before P2 |
| **Generation quality below expectations** | CEGame-Bench 16% completion (A/B) | Skeleton-first + template fallback + human fallback; eval-set-driven iteration; no promise that "any idea succeeds on the first try" |

---

## 10. Relationship to Inceptless / tacitweave

- **Independent project, independent repository, independent release cadence** (avoid stuffing a 3D engine into a cognitive-science project).
- **Contractual upstream/downstream**: tacitweave outputs the **Implicit Spatial Spec (ISS)** (implicit preferences such as aesthetics/lighting/sound/privacy/interaction style); choroweave merges it with explicit intent and compiles.
- **ISS schema versioning** ([`schemas/implicit-spatial-spec.schema.json`](../../schemas/implicit-spatial-spec.schema.json)), both sides can evolve independently; P1 uses a mock ISS, P2 integrates for real.
- Priority: **P0/P1 do not depend on tacitweave**, avoiding the death spiral of both sides not being ready at once.

---

## 11. Next 30 Days Action List

1. **Freeze SHP v0.1**: `world.json` and `CHW_portal` fields, the entry handshake state machine, signature rules (review this week).
2. **Build the P0 two-world demo**: two statically hosted `.glb` + `world.json` pairs, one portal; verify "hot switch <1.5s".
3. **Get the Babylon + KHR_interactivity minimal loop running**: official `KHR_interactivity` test assets + Flow Graph debugging + behavior-graph validation.
4. **Land `weave-check` v0**: 5 validation categories (manifest/glTF/behavior graph/portal/budget) + CI.
5. **Build evaluation set v0**: 20 prompts + scoring rubric (playability/proportion/collision/performance/aesthetics/safety), using existing TRELLIS.2 assets to establish a human baseline.
6. **Pick the 3 showcase world topics** and gauge creator collaboration interest (pixel rooftop / cliff tavern / dungeon puzzle).
7. **Legal/licensing**: Hunyuan3D terms, TRELLIS.2/Pixal3D weight licenses, provenance of example assets, Apache-2.0/CC-BY-4.0 release checks.
8. **External narrative**: a technical manifesto, "The DNS and HTTP of Worlds", plus a playable demo link (desktop first).

---

**Related documents**: [`01-landscape.md`](01-landscape.md) · [`02-tech-selection.md`](02-tech-selection.md) · [`03-architecture.md`](03-architecture.md) · [`04-spatial-hyperlink-protocol.md`](04-spatial-hyperlink-protocol.md) · [`05-roadmap.md`](05-roadmap.md) · [`06-mvp-spec.md`](06-mvp-spec.md) · [`07-risks-compliance.md`](07-risks-compliance.md) · [`08-open-source-strategy.md`](08-open-source-strategy.md)
