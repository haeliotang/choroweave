# Research 02: Generative 3D, World Models, and Agent-Driven World Building

> Project: choroweave (intent → executable space / spatial hyperlinks)
> Verification basis: **verified as of 2026-11-07**. Every "verified" entry gives a source URL and date; official claims and third-party measurements are labeled separately; anything that cannot be verified is written as "not verified" and not filled in.
> Runtime note: ADR-04 said Babylon.js 8.x at research time; the implementation uses 9.x — see [`ADR-0004-babylonjs-9.md`](../../decisions/ADR-0004-babylonjs-9.md).
> Evidence grades (aligned with [`02-tech-selection.md`](../02-tech-selection.md)): **A [official]** = official repository/license/docs/paper; **B [third-party]** = independent media, community reproduction, or third-party evaluation; **C [inference]** = engineering reasoning based on verified facts; **D [not verified]** = there is a lead but no first-hand evidence.
> Related: [Chinese version](../../research/02-generative-3d-and-agents.md) · [00 Executive Summary](../00-executive-summary.md) · [02 Tech Selection](../02-tech-selection.md) · [03 Architecture](../03-architecture.md) · [spatial-dsl schema](../../../schemas/spatial-dsl.schema.json) · [implicit-spatial-spec schema](../../../schemas/implicit-spatial-spec.schema.json) · [pixel-rooftop example](../../../examples/pixel-rooftop) · [README](../../../README.md)

---

## 1. TL;DR (10 items)

1. **3D asset generation crossed a threshold in 2025-12**: Microsoft **TRELLIS.2** (4B, MIT license, code + weights + training code all open) takes about 17 s for 1024³ on an H100, about 3 s for 512³, and about 60 s for 1536³; it natively outputs GLB with PBR (base/rough/metal/opacity) and supports open surfaces/non-manifold/internal structures. This is one of the few SOTA asset models in 2026 that simultaneously satisfies "high quality + truly open source + commercially usable" (the other is Pixal3D, built on its backbone, also MIT). [official] [TRELLIS.2 README](https://github.com/microsoft/TRELLIS.2)
2. **"Hunyuan3D is an open-source model" needs a correction**: open weights only go up to **2.1 / Omni / Part** (plus 2.0/2mini/2mv); **3.0 / 3.1 / 3.5 are Tencent Cloud hosted services with no public weights**. The open-source part uses the Tencent Hunyuan Community License: **the license does not apply in the EU, UK, or South Korea**, and if MAU > 1 million on the release date you must request separate authorization from Tencent; the HY-World 2.0 world model uses an isomorphic community license (2026-04-15). [official] [Hunyuan3D-2.1](https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1), [LICENSE](https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1/blob/main/LICENSE)
3. **World models still cannot serve as a "multiplayer online social space runtime" in 2026**. Google itself states the limits on the Genie 4 page: continuous interaction lasts only "a few minutes", multi-user/multi-agent shared environments are an "ongoing research challenge", and object permanence and detail drift. Real-time world models (Runway GWM Worlds 2 / Matrix-Game 4.0 / Waypoint-1.5) are all **single-view, single-session video streams** with no authoritative shared state. [official] [Genie 4](https://deepmind.google/models/genie/), [MASS paper](https://arxiv.org/abs/2608.06257)
4. **"World model as the visual layer, engine as the state layer" is already the 2026 engineering consensus**: Matrix-Game 4.0 (2026-10-15, Apache-2.0 weights) explicitly adopts "an executable engine owns gameplay/physics + a causal video model does streaming neural rendering", reaching **67 FPS** at 864×480 on an RTX 5080; Rosebud also uses LingBot World 2 as the visual layer and leaves gameplay logic to its own code layer. [official] [Matrix-Game](https://github.com/SkyworkAI/Matrix-Game), [third-party] [Rosebud blog](https://lab.rosebud.ai/blog/rosebud-reactor-video-world-models)
5. **"An LLM generates a complete game from one sentence" was falsified by the 2026 benchmarks**: CEGame-Bench (2026-10) had agents build complete games from an empty project on five production engines — Defold/Godot/Roblox/Unity/Unreal — averaging 295 steps and 65M tokens, and **only 16% of runs could be completed**; gameplay scores were usually below half. The "engineer + coding agent" reference implementation was near full marks — the gap is in the agent, not the tooling. [official] [CEGame-Bench](https://arxiv.org/abs/2610.26098)
6. **Multiplayer world models have academic prototypes but are far from production**: Solaris (2026-02) trained a multi-view world model on 12.64 million frames of multi-agent data collected in Minecraft; MASS (2026-08) proposed a decoupled architecture of "authoritative shared state + independent rendering"; MultiGen (2026-03) used external persistent memory for an editable multiplayer world. All three are still papers/research prototypes, with no production-grade open-source stack. [official] [Solaris](https://arxiv.org/abs/2602.22208), [MultiGen](https://arxiv.org/abs/2603.06679)
7. **Commercial licensing and cost are cheap enough for a product**: Marble prices officially in credits (1.1 = 1500 credits, Draft = 150 credits, 1.1 Plus = 1500–3000 credits); a third party converts at $1 = 1250 credits to about **$1.20–1.28/world** (Draft about $0.12, 1.1 Plus up to about $2.48), HQ mesh export about $2.80, up to 1 hour, limited to 4 times per hour; the output is a **persistent 3D asset** of "2M splats + a 100k–200k triangle collision mesh + a 600k-face textured mesh", not video. [official] [Marble pricing/models](https://docs.worldlabs.ai/marble/models), [export specs](https://docs.worldlabs.ai/marble/export/specs)
8. **3DGS is already the "visual layer of user space", not the geometry layer**: SPZ (Niantic, open-sourced in late 2024) is about 10× smaller than PLY; SPZ 4 uses 6-way parallel ZSTD, encodes 3× faster, and supports tens of millions of points; SOG (PlayCanvas) uses zip+WebP and supports streamed LOD; Marble exports SPZ by default, and Spark (MIT, Three.js) handles browser rendering and streaming. [official] [SPZ 4](https://nianticspatial.com/blog/spz4), [SuperSplat format docs](https://developer.playcanvas.com/user-manual/supersplat/editor/import-export/)
9. **"Part-based/structured generation" is the key to making AI assets actually playable**: Roblox CubePart (2026-05, openrail) generates parts that can be assembled and driven by animation/physics according to a user-supplied parts schema; Roblox 4D generation uses a schema to split objects and **retarget scripts**; Tencent Hunyuan3D-Part / HY3D-Bench's 240k part-level data all move in this direction. Pure monolithic mesh generation cannot directly bind skeletons/gameplay. [official] [Roblox Cube](https://github.com/Roblox/cube), [HY3D-Bench](https://github.com/Tencent-Hunyuan/HY3D-Bench)
10. **Conclusion for choroweave**: the viable route as of 2026-11 is "**LLM writes a constrained Spatial-DSL → deterministic layout solving + kitbash → TRELLIS.2/Pixal3D asset generation → automatic collision/LOD/assembly → behavior graph (L0 KHR_interactivity) compiled into gameplay → Babylon.js multiplayer runtime**"; world models only provide optional visual enhancement (pre-generated 3DGS or a visual layer) and **are not the state authority**. This keeps per-space generation cost at **$0.5–8** (excluding manual fallback), with drafts in 5–10 minutes and standard in 20–40 minutes.

---

## 2. Inventory tables

### 2.1 3D asset generation (as of 2026-11)

| Name | Organization | Open weights? | License | Hardware / latency | Capability boundary | Evidence |
|---|---|---|---|---|---|---|
| **TRELLIS.2** (4B) | Microsoft Research | ✅ weights + code + training code | **MIT** | ≥24GB VRAM; H100: 512³≈3s / 1024³≈17s / 1536³≈60s | Image→3D, O-Voxel, supports open surfaces/non-manifold/internal structures; PBR four channels; exports GLB (4096 texture by default, decimation up to 1M faces) | [official] [repo](https://github.com/microsoft/TRELLIS.2), [arXiv 2512.14692](https://arxiv.org/abs/2512.14692) |
| TRELLIS 1 | Microsoft | ✅ | MIT | ≥16GB VRAM, validated on A100/A6000 | Image/text→3D, SLAT; weak text conditioning, official advice is text→image first | [official] [repo](https://github.com/microsoft/TRELLIS) |
| **Hunyuan3D 2.1** | Tencent Hunyuan | ✅ weights + training code | Tencent Hunyuan 3D 2.1 Community License (**EU/UK/KR excluded; 1M MAU clause**) | shape 10GB / texture 21GB / full pipeline 29GB | 3.3B shape + 2B PBR texturing; image→3D | [official] [README](https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1) |
| Hunyuan3D-Omni | Tencent Hunyuan | ✅ 3.3B | same as above (community license) | 10GB VRAM | Additional control signals: point cloud/voxel/bounding box/skeleton pose | [official] [README](https://github.com/Tencent-Hunyuan/Hunyuan3D-Omni) |
| Hunyuan3D-Part | Tencent Hunyuan | ✅ | Tencent Hunyuan 3D-Part Community License (2025-09-23, with regional restrictions) | — | Part segmentation + part generation | [official] [repo](https://github.com/Tencent-Hunyuan/Hunyuan3D-Part) |
| Hunyuan3D 3.0 / 3.1 / 3.5 | Tencent (cloud service) | ❌ no public weights | Tencent Cloud platform terms | Hosted; 3.5 about 60s, 8K PBR; up to 1.5M faces | Text/image/multi-view/sketch→3D; geometry and texture decoupled | [official] [Tencent Cloud tech docs](https://www.tencentcloud.com/techpedia/148305?lang=en) (updated 2026-09-01); no 3.x weights on HF (confirmed by this search) |
| Hunyuan3D-Buffalo 1.0 | Tencent Hunyuan | ❌ paper only | — | — | Unified multimodal 3D generation/understanding/editing | [official] [repo](https://github.com/Tencent-Hunyuan/Hunyuan3D-Buffalo1.0) (2026-08-05, no code/weights) |
| **TripoSR** | Tripo / Stability | ✅ | **MIT** | 6GB VRAM; A100 <0.5s | Single image→mesh, fast low-poly; no PBR texture pipeline (the community version has one) | [official] [repo](https://github.com/VAST-AI-Research/TripoSR) |
| TripoSG | VAST | ✅ 1.5B | **MIT** | 8GB VRAM | Single image→high-fidelity shape (2048 latent tokens); shape-oriented | [official] [HF](https://huggingface.co/VAST-AI/TripoSG), [repo](https://github.com/VAST-AI-Research/TripoSG) |
| Stable Fast 3D | Stability AI | ✅ (HF gated) | **Stability AI Community License**: free commercial use under $1M annual revenue (registration required), license terminates automatically above that | 6GB VRAM; seconds | Single image→UV-unwrapped mesh + material parameters | [official] [repo](https://github.com/Stability-AI/stable-fast-3d), [LICENSE.md](https://huggingface.co/spaces/stabilityai/stable-fast-3d/blob/main/LICENSE.md) |
| **Pixal3D** | Tencent ARC + Tsinghua | ✅ | **MIT** (HF metadata also marks `extra_gated_eu_disallowed: true`) | Based on the TRELLIS.2 backbone | Single-image pixel-aligned, "near-reconstruction-grade" geometry + PBR; SIGGRAPH 2026 | [official] [HF card](https://huggingface.co/TencentARC/Pixal3D), [repo](https://github.com/TencentARC/Pixal3D) |
| Sparc3D | Academia (Zhihao Li et al.) | ❓ no public weights found | — | — | Sparse deformable marching cubes (1024³), Sparconv-VAE; aimed at high-resolution shapes | [official] [arXiv 2505.14521](https://arxiv.org/abs/2505.14521) (2025-05); open-source status [not verified] |
| Meshy (meshy-7.1) | Meshy | ❌ SaaS | commercial terms | Cloud; billed in credits: image→3D mesh 20, +2K texture 30, +8K 35; auto-rig 5, per animation 3, UV unwrap 5 | Generation + full retopo/UV/rigging/animation post-processing suite | [official] [pricing docs](https://docs.meshy.ai/en/api/pricing) (accessed 2026-11) |
| Rodin Gen-2.5 | Deemos / Hyper3D | ❌ no weights | commercial terms (paid plans include commercial use) | Cloud; about 4s geometry, about 5s with texture | Watertight manifold, up to about 10M faces; 8 export formats | [third-party] [comparison article (compiled after reading official pages)](https://triposr.org/blog/rodin-vs-hunyuan3d) (2026-10-08); official pages not individually verified |
| Roblox Cube 3D v0.5 | Roblox | ✅ | **OpenRAIL** (HF metadata) | — | Text→3D token autoregressive mesh; aimed at game-engine compatibility | [official] [repo](https://github.com/Roblox/cube), [HF](https://huggingface.co/Roblox/cube3d-v0.5) |
| Roblox CubePart | Roblox | ✅ | **OpenRAIL** | — | Open vocabulary, **part-controllable** generation (multiple mesh pieces per schema) | [official] [HF](https://huggingface.co/Roblox/cubepart), [arXiv 2605.28763](https://arxiv.org/abs/2605.28763) (2026-05) |
| HY3D-Bench | Tencent Hunyuan | ✅ data + baselines | see repo | — | 252k watertight full objects / 240k part-level / 125k synthetic; baseline Hunyuan3D-Shape-v2.1 Small 0.8B | [official] [repo](https://github.com/Tencent-Hunyuan/HY3D-Bench) (2026-02-04) |

### 2.2 Scene / layout generation

| Name | Organization/year | Open source | Positioning | Key conclusion | Evidence |
|---|---|---|---|---|---|
| LayoutGPT | 2023-05 (NeurIPS'23) | ✅ | LLM plans room layouts in a "CSS-like" way | Pioneering but only suited to simple interiors, with no physics/reachability guarantees | [arXiv 2305.15393](https://arxiv.org/abs/2305.15393) |
| SceneCraft | 2024-03 | ✅ | LLM agent writes Blender Python to generate scenes | Code as scene, iterable; depends on an asset library and render feedback, slow | [arXiv 2403.01248](https://arxiv.org/abs/2403.01248) |
| Holodeck / Holodeck 2.0 | 2023-12 / 2025-08 | ✅ | Language-guided procedural + asset retrieval | One of the earliest "language→walkable space"; 2.0 adds vision-language guidance and editing | [arXiv 2312.09067](https://arxiv.org/abs/2312.09067), [2508.05899](https://arxiv.org/abs/2508.05899) |
| ProcTHOR | 2022 | ✅ | Procedural homes (AI2) | Large-scale embodied-AI environments, not visual fidelity | [arXiv 2206.06994](https://arxiv.org/abs/2206.06994) |
| Infinigen / Infinigen Indoors | 2023-06 / 2024-06 | ✅ (Blender) | Procedural infinite photoreal natural/indoor | No AI randomness, precise control; CPU rendering is extremely slow | [arXiv 2306.09310](https://arxiv.org/abs/2306.09310), [2406.11824](https://arxiv.org/abs/2406.11824) |
| SpatialLM 1.1 | Manycore | ✅ 0.5B/1B | Point cloud (can come from monocular video + MASt3R-SLAM) → structured layout of walls/doors/windows/oriented bounding boxes | NeurIPS 2025; a practical component for turning "real room scans" into structured layouts | [repo](https://github.com/manycore-research/SpatialLM), [arXiv 2506.07491](https://arxiv.org/abs/2506.07491) |
| HY-World 2.0 | Tencent (2026-04-16) | ✅ weights (in batches from 2026-05) | Panorama generation 80B + trajectory planning + WorldStereo 2.0 17B + WorldMirror 2.0 1.2B → mesh/3DGS world | Currently the most complete open-source "text/image→engine-importable 3D world" pipeline | [repo](https://github.com/Tencent-Hunyuan/HY-World-2.0), [arXiv 2604.14268](https://arxiv.org/abs/2604.14268); ⚠️ license is the **Tencent HY-WORLD 2.0 Community License** (2026-04-15, EU/UK/KR excluded + 1M MAU clause), see [LICENSE](https://huggingface.co/apozz/hy-worldmirror-2-bf16/blob/main/LICENSE) |
| WorldClaw | Tencent (2026-08) | ❌ paper only | Agentic large-scale 3D open-world generation | Only a paper + project page, no code/weights | [arXiv 2608.05248](https://arxiv.org/abs/2608.05248) |
| SceneDiffuser (as named in the task list) | — | — | — | ⚠️ Verification correction: the 2024–2026 SceneDiffuser / SceneDiffuser++ are actually **traffic-scene simulation** ([2412.12129](https://arxiv.org/abs/2412.12129), [2506.21976](https://arxiv.org/abs/2506.21976)), not the same work as indoor layout generation; the indoor entry is **not verified** | see left |

### 2.3 World models

| Name | Organization | Openness | Real-time / specs | Controllability / consistency | Multiplayer / persistent state | Evidence |
|---|---|---|---|---|---|---|
| **Genie 3** | Google DeepMind | closed source; Project Genie subscription (from 2026-01-29, US AI Ultra) | 720p, 20–24 FPS; session cap **60 seconds** | text/image prompt, Nano Banana Pro first produces "World Sketching", remixable; official acknowledgment of drift | ❌ no multiplayer, no persistent state | [official] [Genie 3 blog](https://deepmind.google/blog/genie-3-a-new-frontier-for-world-models/) (2025-08-05); [third-party] [9to5Google](https://9to5google.com/2026/01/29/google-project-genie/) |
| **Genie 4** | Google DeepMind | research preview (trusted testers from 2026-10-27, later into Project Genie/API) | real-time; native audio and dialogue; officially "a few minutes", **TechCrunch reports about 2 minutes max** | can change weather/add characters/change camera with natural language during generation | ❌ officially listed as an "ongoing research challenge"; "few minutes" | [official] [Genie 4 page](https://deepmind.google/models/genie/) (includes a Limitations section); [third-party] [TechCrunch](https://techcrunch.com/2026/10/27/googles-genie-4-world-model-adds-audio-more-realistic-worlds-and-real-time-steering/) |
| **Marble** (World Labs) | World Labs → AMD (acquisition announced 2026-09-28) | commercial API | preview about 30s, Draft ~20s, full world about 5min, HQ mesh up to 1h | outputs a **persistent 3D asset**: 2M splats (+500k low-poly), 100k–200k face collision mesh, 600k-face textured mesh, 2560×1280 panorama; no characters/no dynamics | ❌ static environment; multiplayer must be built yourself | [official] [models/pricing](https://docs.worldlabs.ai/marble/models), [export specs](https://docs.worldlabs.ai/marble/export/specs); acquisition per [third-party] [Yahoo Finance](https://finance.yahoo.com/technology/ai/articles/amd-just-bought-research-defines-174221101.html) |
| **Oasis / Lucy** (Decart) | Decart | closed-source API | Oasis 3 (2026-06-10, aimed at Physical AI); Lucy 2.5 real-time 30 FPS (2026-07-16), 2.6 (2026-11-05); in-house DOS 2.0 inference stack | real-time world editing/transformation; Spatial Memory Codec (2026-10) for long-horizon memory | ❌ | [official] [decart.ai](https://decart.ai/) |
| **GWM Worlds 2** | Runway | research preview | **720p @24 FPS + 48 kHz audio**, autoregressive, no preset duration | WorldPrompt: persistent context + timestamped event stream (text actions can target a subject or the scene) + per-frame camera | ❌ single session; real-time quality below "pre-orchestrated" | [official] [Runway research page](https://runway.com/research/introducing-gwm-worlds-2) (2026-09-03) |
| **Matrix-Game 4.0** | Skywork | ✅ weights (Apache-2.0) + source for three scene games | engine owns gameplay, causal video does streaming neural rendering; **RTX 5080 864×480 at 67 FPS**, 5070 Ti 58 FPS | actions decided by the engine → the most controllable class | ❌ single machine; but the "engine + neural rendering" architecture can naturally take network sync | [official] [repo](https://github.com/SkyworkAI/Matrix-Game), [HF](https://huggingface.co/Skywork/Matrix-Game-4.0) (2026-10-15) |
| Matrix-Game 2.0 / 3.0 | Skywork | ✅ MIT / 2026-03 | 2.0: 1.8B, 25 FPS, minute-scale; 3.0 adds long-horizon memory | keyboard/mouse → frame-level action injection | ❌ | [official] [HF 2.0](https://huggingface.co/Skywork/Matrix-Game-2.0) |
| **Waypoint-1.5** | Overworld | ✅ Apache-2.0 (1.2B etc.) | family target 720p/60; the 360p tier targets RTX 30 series and Apple Silicon; 512-frame context | start image/video + keyboard/mouse; local Biome runtime + web streaming | ❌ | [official] [HF card](https://huggingface.co/Overworld/Waypoint-1.5-1B), [blog](https://over.world/blog/waypoint-1-5) (2026-04-09) |
| **HY-World 1.5 / WorldPlay** | Tencent | ✅ 5B/8B weights + training code | **24 FPS, 480P** streaming interaction; AR distilled model 28–72GB VRAM | keyboard/mouse actions + reconstructed context memory; WorldCompass RL post-training | ❌ | [official] [repo](https://github.com/Tencent-Hunyuan/HY-WorldPlay), [arXiv 2512.14614](https://arxiv.org/abs/2512.14614) |
| **Hy-Nomas** | Tencent | ✅ **Apache-2.0** | runs on a single RTX 4090 at low VRAM; multi-turn text + camera; community reports 720p real-time on TPU v6e-4 (0.933s compute per second of video) [third-party] | free-form multi-turn editing | ❌ | [official] [repo](https://github.com/Tencent-Hunyuan/HY-Nomas) (2026-10-21); [third-party] Community section in the repo |
| Hunyuan-GameCraft | Tencent | ✅ community license | 25 FPS generating 704×1216; minimum 24GB, recommended 80GB | keyboard/mouse unified into camera space + hybrid history conditioning | ❌ | [official] [repo](https://github.com/Tencent-Hunyuan/Hunyuan-GameCraft-1.0), [arXiv 2506.17201](https://arxiv.org/abs/2506.17201) |
| **Solaris** (multiplayer world model) | Academia | paper | Minecraft multi-view video world model; 12.64M frames of multiplayer data | multi-agent consistency evaluation | ⚠️ research prototype, not a product | [arXiv 2602.22208](https://arxiv.org/abs/2602.22208) (2026-02-25) |
| **MASS** | Academia | paper | "authoritative shared state (Logic Engine) + on-demand rendering (Rendering Engine)" | decouples world dynamics from view rendering | ⚠️ research prototype | [arXiv 2608.06257](https://arxiv.org/abs/2608.06257) (2026-08-06) |
| **MultiGen** | Academia | paper | external persistent memory (independent of the context window) + Memory/Observation/Dynamics modules | editable environments + shared reasoning | ⚠️ research prototype | [arXiv 2603.06679](https://arxiv.org/abs/2603.06679) (2026-03-03) |

### 2.4 Agent-driven building

| Name | Year | Mechanism | Significance for choroweave | Evidence |
|---|---|---|---|---|
| Voyager | 2023-05 | LLM writes JS API calls (Minecraft), self-growing skill library, no gradients | prototype of "LLM→executable actions"; constraint = API allowlist | [arXiv 2305.16291](https://arxiv.org/abs/2305.16291) |
| Project Sid | 2024-10 | 10–1000+ agents with division of labor/taxes/religion in Minecraft | large-scale agent social simulation, but the environment is Minecraft, not a generated world | [arXiv 2411.00114](https://arxiv.org/abs/2411.00114) |
| Generative Agents | 2023-04 | memory stream + reflection + planning | baseline for NPC behavior modeling; does not produce playable geometry/gameplay | [arXiv 2304.03442](https://arxiv.org/abs/2304.03442) |
| NVIDIA ACE (2026) | 2026 | **open-source C/C++ Game Agent SDK + UE5 plugin**; on-device ASR/SLM/TTS; Agent/Chat/RAG APIs; Qwen 3.5 4B; PUBG Ally, Total War: PHARAOH (RAG over 1200+ data tables) | the de facto route for on-device AI NPCs: low latency, offline-capable, RAG-grounded | [official] [NVIDIA tech blog](https://developer.nvidia.com/blog/build-on-device-ai-companions-with-the-nvidia-ace-game-agent-sdk-and-unreal-engine-5-plugins/) |
| Inworld (2026) | 2026 | has clearly shifted to **TTS/STT/speech-to-speech + inference API** (billed per character/token, including commercial license) | the site's main narrative has moved from "AI NPC character engine" to voice/inference; choroweave can buy directly if it does voice NPCs (this is an [inference], from site navigation and pricing-page structure) | [official] [Inworld pricing](https://inworld.ai/pricing) |
| Convai | 2026 | conversational NPC platform (API/SDK) | same as above, closed platform | [official] [docs](https://docs.convai.com/api-docs) |
| Rosebud + Reactor | 2026-08 | code/assets/mechanics generated by Rosebud; visuals use LingBot World 2 real-time video (about 16 FPS, sub-second latency), gameplay layered on top | **a commercial example of "video world model as the visual layer, game logic running separately"** | [third-party] [Rosebud blog](https://lab.rosebud.ai/blog/rosebud-reactor-video-world-models) |
| Astrocade | 2026-05 | consumer "one-sentence game making" platform; 20M users in 8 months, $56M funding | validates demand, does not represent playable depth | [official] [Astrocade blog](https://www.astrocade.com/blog/astrocade-raises-56m-funding) |
| Bitmagic GDK | 2026-08-27 | game development kit for coding agents: vendored TS engine source, physics/characters/vehicles/networking, `bitmagic dev` hot reload, **`bitmagic verify` real-browser playtest + screenshot feedback**, one-click hosting | the best 2026 engineering template for the "verify-fix loop" | [official] [Bitmagic GDK](https://bitmagic.ai/news/bitmagic-gdk/) |
| Roblox Cube 4D | 2026-02-04 | schema-based part splitting (Car-5 etc.) + **scripts retargeted to generated dimensions**; early access generated 160k objects; developer says 4D player time +64% | "part schema + behavior retargeting" is the key to making generated objects playable | [official] [Roblox newsroom](https://about.roblox.com/newsroom/2026/02/accelerating-creation-powered-roblox-cube-foundation-model) |
| UEFN MCP | 2026 (official docs) | in-editor MCP server: Verse read/write/compile, Scene Graph entities, Creative devices, starting playtest sessions, Verse file sandbox | the vendor turns the "editor" into an agent-operable toolset; the Verse file sandbox is the security boundary | [official] [UEFN MCP docs](https://dev.epicgames.com/documentation/fortnite/uefn-mcp) |
| CEGame-Bench | 2026-10-19 | five-engine complete-game benchmark: average 295 steps/65M tokens; **16% completion rate** | quantifies the "artifact→playable gap" | [arXiv 2610.26098](https://arxiv.org/abs/2610.26098) |
| A2Z GameSpec-Bench | 2026-09-30 | 100 long GDDs, dependency-aware contracts, per-requirement fidelity | evaluates "intent fidelity" rather than "can it compile" | [arXiv 2609.39564](https://arxiv.org/abs/2609.39564) |

### 2.5 3DGS / neural rendering

| Name | Type | Key numbers | Value/cost for user space | Evidence |
|---|---|---|---|---|
| 3D Gaussian Splatting | representation | real-time differentiable rendering | photoreal, no relighting needed; but **no collision, no PBR light interaction, transparency sorting artifacts** | [official] Kerbl et al., SIGGRAPH 2023 |
| SPZ (Niantic) | compression format | about 10× smaller than PLY; SPZ 4: 6-way parallel ZSTD, ~3× faster encoding, 1.5–2× faster loading, supports 34M points | first choice for web/mobile distribution | [official] [SPZ 4 blog](https://nianticspatial.com/blog/spz4) |
| SOG (PlayCanvas) | compression format | zip (meta.json + WebP); supports Streamed SOG (`lod-meta.json` + chunks) | browser streamed LOD; SuperSplat can edit and export | [official] [SuperSplat format docs](https://developer.playcanvas.com/user-manual/supersplat/editor/import-export/) |
| Spark (World Labs) | renderer | **MIT**, Three.js 3DGS renderer; Spark 2.0 (2026-04) adds LOD streaming | directly usable on choroweave's web side | [official] [repo](https://github.com/sparkjsdev/spark) |
| Marble asset specs | commercial pipeline | 2M splats SPZ (size inferred at SPZ≈PLY/10 to be tens of MB, not measured), collision mesh 100k–200k faces, visual mesh 600k faces | the dual asset "splat visual layer + mesh collision layer" is standard practice | [official] [export specs](https://docs.worldlabs.ai/marble/export/specs) |

---

## 3. Item-by-item analysis

### 3.1 3D assets: the watershed after 2025-12

**Three tiers are now clear.**

- **Tier 1 (quality + license both production-ready)**: TRELLIS.2, Pixal3D. TRELLIS.2's 4B model puts "high resolution + arbitrary topology + PBR" under an MIT license, with training code fully open; 17 seconds at 1024³ means **a single GPU can generate about 5000 1024³ assets per day** (assuming 24h continuous; even a conservative 50% discount including queueing gives 2500). Pixal3D takes the "pixel back-projection" route and should be preferred for the "precise reconstruction from a reference image" scenario in the brief (SIGGRAPH 2026, MIT). [official] [TRELLIS.2](https://github.com/microsoft/TRELLIS.2), [Pixal3D](https://huggingface.co/TencentARC/Pixal3D)
- **Tier 2 (usable but with hard license constraints)**: Hunyuan3D 2.1 / Omni / Part. Omni's bbox/skeleton/point-cloud control is extremely valuable for "precise placement according to layout", but the **open-source license excludes the EU, UK, and South Korea entirely**, and 1M MAU triggers re-licensing. For a project like choroweave — "federated personal servers, global users" — this means it cannot be the default model, only an "optional plugin outside those regions". [official] [LICENSE](https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1/blob/main/LICENSE)
- **Tier 3 (cloud/closed source)**: Hunyuan3D 3.x, Meshy, Rodin. They provide post-processing the open-source stack lacks (retopo, UV, auto-rigging, animation, 8K PBR), suited to "hero assets" and manual fallback stages, not to a scaled default path.

**Quality and failure modes (the part that matters most in engineering):**

1. **Topology and UVs are not directly usable for animation**. All image-to-3D outputs prioritize "looking right": uneven triangle density, fragmented UV islands, inconsistent texel density at seams. Meshy making "retopo/UV/rigging" separately billed APIs (UV Unwrap 5 credits, Rigging 5, per-animation 3) is precisely proof that this is an industry-recognized gap. [official] [Meshy pricing](https://docs.meshy.ai/en/api/pricing)
2. **Rigging must rely on "part-based generation", not a monolithic mesh**. Roblox CubePart emits multiple mesh pieces per schema, and Roblox 4D then uses "script retargeting" to fit the generated dimensions; UniRig uses a unified model for skeleton binding (2025-04). The combination of the two is the realistic path from "generated" to "animatable". Pure monolithic mesh + auto-rigging remains a high-risk step in 2026. [official] [CubePart](https://huggingface.co/Roblox/cubepart), [UniRig arXiv 2504.12451](https://arxiv.org/abs/2504.12451)
3. **Watertight ≠ playable**. HY3D-Bench emphasizes "watertight, cleaned, part-level" — showing the community already realizes data-side topology quality is the bottleneck; but game usability also requires collision hulls, normal orientation, scale normalization, and material channels importable into engines, and generative models guarantee none of these. [official] [HY3D-Bench](https://github.com/Tencent-Hunyuan/HY3D-Bench)
4. **PBR channels are "look right" rather than "physically right"**. Both TRELLIS.2 and Hunyuan3D 2.1 can output base/rough/metal, but **metal/roughness lack energy-conservation validation**, which easily looks "plastic" under realistic lighting. If choroweave demands photorealism, a material relighting pass (manual or IBL tools) is ultimately required.

**Conclusion**: the asset layer is already "good enough", but **"generated = ready to catalog" does not hold**; you must build an industrialized pipeline of "generate → QC → LOD/collision/UV repair → catalog", and the QC must be automated (face count, non-manifold edges, UV overlap, texture resolution, AABB scale).

### 3.2 Scene/layout: end-to-end generation still loses to "constrained procedural + kitbash"

- **Pure LLM layout (LayoutGPT family)** has the hard flaw of **no geometric feasibility guarantee**: the LLM outputs semantic placement, while walls/doors/passages/collision need a separate solver.
- **Procedural (ProcTHOR/Infinigen)** is controllable, reproducible, and free, but asset style is limited and rendering is slow (Infinigen is mostly CPU Blender).
- **What can actually land in 2026 is the hybrid**:
  `LLM produces a structured Space Spec (rooms/style/interactions/budget)` → `constraint solver + rules generate terrain/buildings` → `kitbash from the asset library` → `use generative models to add "signature assets/wear/decor"` → `automatic collision and navmesh`.
- **HY-World 2.0 offers a new route to "end-to-end worlds"**: HY-Pano 2.0 (about 80B) produces panoramas → WorldNav plans trajectories → WorldStereo 2.0 (about 17B) expands into 3DGS → WorldMirror 2.0 (about 1.2B) does multi-view reconstruction/synthesis. It proves that "text→engine-importable 3D world" is open-source feasible, but the compute bar is high (an 80B panorama model; the official README gives no VRAM/latency, **inferred to need 8×80GB-class multi-GPU**), and **the output is more for "looking" than "playing"**: no gameplay logic, no network sync, no semantic interaction. [official] [HY-World 2.0](https://github.com/Tencent-Hunyuan/HY-World-2.0)
- **Real-space reproduction** should go through SpatialLM: phone video → MASt3R-SLAM point cloud → SpatialLM outputs walls/doors/windows/oriented bounding boxes → rebuild in the engine. This "scan→structure→redecorate" chain is far more stable than pure generation. [official] [SpatialLM](https://github.com/manycore-research/SpatialLM)

**Engineering trade-off**: `end-to-end generation` handles "atmosphere and visual surprise", `procedural + kitbash` handles "structure, collision, playability, editability". **Do not hand the foundation of a playable space to a generative model.**

### 3.3 World models: in 2026 they can only be a "visual layer / pre-generation", not a "runtime"

The evidence chain is very hard:

1. **Limits written by Google itself** (Genie 4 official page): continuous interaction "a few minutes"; "accurately modeling complex interactions between users, multiple independent agents, and shared environments is an ongoing research challenge"; detail/object permanence drift; text rendering unreliable; audio fidelity still under research. [official] [Genie 4](https://deepmind.google/models/genie/)
2. **Project Genie's product parameters**: 60-second sessions, 720p, 20–24 FPS, US AI Ultra subscribers only. This is an "experience demo", not a "space hosting service". [third-party] [9to5Google](https://9to5google.com/2026/01/29/google-project-genie/)
3. **Real-time world models take the form of "video streams"**: Runway GWM Worlds 2 (720p/24fps/48kHz, unlimited duration, WorldPrompt event stream), Waypoint-1.5 (720p/60 target, local consumer GPUs), HY-World 1.5 (480p/24fps). They all **have no queryable world state** — you cannot ask "how many people are in room 302 right now". [official] [Runway](https://runway.com/research/introducing-gwm-worlds-2), [Overworld](https://over.world/blog/waypoint-1-5), [WorldPlay](https://github.com/Tencent-Hunyuan/HY-WorldPlay)
4. **The only correct architecture has already been validated by products**: Matrix-Game 4.0 puts "gameplay/physics/input" in the engine and "pixels" in a causal video model, at 67 FPS@864×480; Rosebud uses the same idea with LingBot World 2 as the visual layer. **The stronger the world model, the more it belongs at the end of the rendering pipeline, not at the center of the state machine.** [official] [Matrix-Game](https://github.com/SkyworkAI/Matrix-Game), [third-party] [Rosebud](https://lab.rosebud.ai/blog/rosebud-reactor-video-world-models)
5. **Multiplayer world models exist only as academic prototypes**: Solaris (multi-view, 12.64M frames), MASS (authoritative shared state + decoupled rendering), MultiGen (external persistent memory). MASS's abstract names the industry pain point directly: "entangling world state with view-dependent visual latents" causes compute redundancy, view inconsistency, and poor scalability — exactly the problem choroweave would hit if it used a world model as authoritative state. **Conclusion: as of 2026-11, a world model cannot be a multiplayer online space runtime; it can be a visual enhancement for single-player/pre-generated content.** [official] [MASS](https://arxiv.org/abs/2608.06257), [Solaris](https://arxiv.org/abs/2602.22208)

**But there is a realistic middle route**: use a world model to **pre-generate 3DGS/meshes** (Marble, HY-World 2.0), then do multiplayer in a traditional engine. This gets "the look of a generated world" while keeping authoritative state, collision, and network sync. Marble's export spec (splat + collision mesh + visual mesh) is designed exactly for this route.

### 3.4 Agent-driven building: from "writing code" to "operating a toolset + verification loop"

**Patterns already validated:**

- **API allowlist + skill library**: Voyager lets the LLM combine actions only within a given JS API. choroweave's counterpart is a **spatial/gameplay DSL**: the LLM can only produce DSL ASTs, not engine code directly.
- **Schema + behavior retargeting**: Roblox 4D's Car-5 schema (body + four wheels) + scripts retargeted to generated dimensions is the cleanest solution for "generated objects are playable"; CubePart turns the schema into an open vocabulary. **choroweave should make the "part contract for interactable objects" a first-class citizen.** [official] [Roblox](https://about.roblox.com/newsroom/2026/02/accelerating-creation-powered-roblox-cube-foundation-model)
- **Toolset-ized editor (MCP)**: UEFN MCP exposes Verse read/write/compile, scene graph, devices, and playtest sessions as agent tools, and explicitly constrains scope with the **Verse file sandbox**. This is the safety paradigm for "LLM operates a host engine"; choroweave's editor should natively provide the same class of MCP toolset instead of letting the agent edit files directly. [official] [UEFN MCP](https://dev.epicgames.com/documentation/fortnite/uefn-mcp)
- **The verify-fix loop is mandatory**: Bitmagic GDK's `bitmagic verify` plays in a real browser, takes screenshots, and throws errors back to the agent; NVIDIA ACE emphasizes on-device low latency + RAG grounding + preventing NPC loops. **Code generation without closed-loop verification necessarily fails.** [official] [Bitmagic](https://bitmagic.ai/news/bitmagic-gdk/), [ACE](https://developer.nvidia.com/blog/build-on-device-ai-companions-with-the-nvidia-ace-game-agent-sdk-and-unreal-engine-5-plugins/)

**Failure modes already quantified:**

- CEGame-Bench: five engines, average 295 steps/65M tokens, **16% completion rate**, gameplay score below half; the engineer + coding agent reference implementation was near full marks → **failure is in long-horizon integration, not single-file coding**.
- A2Z GameSpec-Bench: measures **intent fidelity** with dependency-aware contracts over 100 long GDDs, showing that "runs" and "matches the design" are two different things.
- Engineering implication: choroweave's LLM layer should output **verifiable intermediate representations** (Space Spec / gameplay AST / contract tests), not a complete project in one shot. [official] [CEGame-Bench](https://arxiv.org/abs/2610.26098), [A2Z](https://arxiv.org/abs/2609.39564)

### 3.5 3DGS / neural rendering: the "best value" visual layer, but not geometry

- **Value**: photoreal, no PBR relighting needed, runs in the browser (Spark/SuperSplat), acceptable compressed size (SPZ about 10× smaller than PLY; Marble's 2M splats as SPZ is on the order of tens of MB).
- **Cost**: no collision (a collider mesh is required), no dynamic lighting, transparency/sorting artifacts, hard to edit (changing one wall requires regenerating a region), and **assets have a "baked-in" look**.
- **2026 maturity**: SPZ 4 supports tens of millions of points and parallel encoding/decoding; SOG supports streamed LOD; Marble standardizes the "SPZ + collider GLB + visual GLB" trio. **For choroweave: treat 3DGS as the "look/background layer" and meshes as the "interaction layer", keeping both asset sets**, consistent with Marble's export design. [official] [SPZ 4](https://nianticspatial.com/blog/spz4), [Marble specs](https://docs.worldlabs.ai/marble/export/specs)

---

## 4. Implications for choroweave

### 4.1 Recommended pipeline (a version that can land as of 2026-11)

```
Intent (natural language / tacitweave preferences)
  │
  ├─[1] Intent compilation: LLM → Space Spec (intent layer of Spatial-DSL, JSON Schema)
  │      rooms/terrain, style, lighting, interaction points, portals, budget, adult/child rating
  │      output must pass schema validation + reachability/budget static checks
  │
  ├─[2] Layout solving: deterministic procedural (buildings/terrain/roads) + constraint solving
  │      the LLM only supplies "semantic constraints", it does not draw coordinates
  │      output: glTF scene skeleton + navmesh + colliders + semantic labels
  │
  ├─[3] Assets: layered
  │      a. signature assets: TRELLIS.2 (MIT, primary) / Pixal3D (precise reconstruction from a reference image)
  │      b. controlled-placement assets: Hunyuan3D-Omni (bbox/pose, non-EU/UK/KR deployment only)
  │      c. part-based interactive assets: build a schema in-house following Roblox CubePart (or use its openrail weights directly)
  │      d. hero assets/post-processing: Meshy / Rodin API (retopo, UV, auto-rig, animation)
  │
  ├─[4] Assembly: automatic collision hulls + LOD + material baking + scale normalization + asset-library instancing
  │      every asset must pass a "QC gate" (face count/non-manifold/UV overlap/texture/bounding box)
  │
  ├─[5] Gameplay: LLM → Spatial-DSL (behavior graph/rule AST) → deterministic assembly
  │      L0 = KHR_interactivity behavior graph (default, verifiable, portable)
  │      L1 = curated networked modules (parameterized); L2 = capability-sandboxed WASM (P3+)
  │      contract tests + headless playtest bot (following Bitmagic verify / CEGame-Bench's evaluation approach)
  │
  ├─[6] Visual enhancement (optional): Marble / HY-World 2.0 pre-generated 3DGS background layer
  │      or a Matrix-Game 4.0-style "engine low-poly → neural rendering" real-time visual layer (research)
  │
  └─[7] Runtime: Babylon.js 8.x reference runtime (ADR-04; three.js is view-only)
         + authoritative room-server state + CHW_portal portals/interest management; world models do not participate in the state machine
```

### 4.2 Per-space cost and latency (engineering estimate, with assumptions stated)

Assumptions: H100 at $2–3/hour (market price, **not individually verified**); assets at 1024³, 40–120 signature assets per World Bundle; layout uses 20–50 LLM tool-loop calls.

| Tier | Contents | Generation GPU time | API cost | Total latency | Manual fallback |
|---|---|---|---|---|---|
| **Draft** (walkable and viewable) | layout + 20–40 512³ assets + no PBR repair + Marble Draft | about 3–6 GPU·minutes | ≈$0.2–0.6 | 5–10 minutes | none |
| **Standard** (playable) | layout + 60–120 1024³ assets + collision/LOD + lightweight 3DGS background | about 30–60 GPU·minutes | ≈$2–6 | 20–40 minutes | spot-check 10–20% of assets |
| **Hero** (external showcase) | the above + hero assets Rodin/Meshy + HQ mesh + manual retopo/rigging | 2–6 GPU·hours | ≈$10–30 | 2–6 hours | required: art fixes, rigging, lighting |

Runtime (multiplayer): on a web engine, the server cost for 50–100 CCU per space is **estimated** at $5–20/month (an ordinary CPU cloud host + state sync; excluding world-model inference). If real-time neural rendering is added, each session needs at least one consumer GPU (Matrix-Game 4.0 at 67 FPS on a 5080), and **the cost jumps by an order of magnitude**.

### 4.3 Explicit recommendations: what to use / what not to use

**Use:**
- **TRELLIS.2** as the default asset model (MIT, quality, speed, PBR, training code available for fine-tuning).
- **Pixal3D** for "user reference image → precise in-space reproduction".
- **SpatialLM** for "real-scene scan → structured layout".
- **Marble API** for pre-generated 3DGS background layers (predictable cost, clear export specs); **buy only the "environment", not the "world"**.
- **HY-World 2.0 weights** as a research/backup route for self-hosted world generation, but note its license is the **Tencent HY-WORLD 2.0 Community License** (EU/UK/KR excluded + 1M MAU clause), the same regional logic as Hunyuan3D 2.1, **so it cannot be the global product default**.
- **Roblox CubePart / Hunyuan3D-Part** as reference implementations of part-based asset contracts.
- **NVIDIA ACE (on-device) or Inworld (cloud TTS)** for NPC voice; a **Bitmagic-verify-style browser playtest loop** for gameplay validation.
- **Spark + SPZ/SOG** for web-side splat rendering and streamed loading, but only as a P3 visual layer (Spark is built on three.js and does not enter the Babylon main runtime).

**Do not use / not as default:**
- ❌ **World models as runtime/state authority** (Genie 4's official limits + MASS/MultiGen are still papers).
- ❌ **Hunyuan3D open weights for a global product** (EU/UK/KR exclusion + 1M MAU clause).
- ❌ **Text→3D directly producing a riggable character**: go through part-based generation + retopo/rigging, or buy Meshy/Rodin's rigging API.
- ❌ **Letting an LLM generate engine project code and ship it directly** (CEGame-Bench 16% completion rate).
- ❌ **A single 3DGS geometry** (no collision, no light interaction).
- ❌ **Treating Hunyuan3D 3.x / Meshy / Rodin as the scale path**: they are "hero asset and post-processing" tools, and neither unit price nor throughput suits hundreds of items per space.

### 4.4 Direct impact on "spatial hyperlinks/portals"

- **A portal needs "addressable authoritative state"**, which none of the 2026 world models provides. choroweave's portal should be built on **engine-side scene ID + asset hash + state service**, with splats/video only as presentation.
- **Cross-server visits require a unified asset format**: glTF 2.0 + KHR extensions + SPZ/SOG is currently the only combination accepted by Blender/Unity/Unreal/Three.js at the same time. Marble, HY-World 2.0, and TRELLIS.2 can all export GLB, showing this route works.
- **Licensing must be split by "deployment region"**: the same space on personal servers in different regions may have to switch asset models (TRELLIS.2 vs Hunyuan). This should be written into the Space Spec metadata, not discovered at runtime.

---

## 5. Risks and unknowns

### 5.1 High-confidence risks

1. **License geo-risk**: the Tencent Hunyuan family (3D 2.1/Omni/Part, HY-World 2.0, World 1.0, WorldPlay) explicitly excludes the EU/UK/KR and carries a 1M MAU re-licensing clause (HY-WORLD 2.0 license release date 2026-04-15). Any "federated personal server" may fall in the excluded zone. **Open weights ≠ freely commercially usable**; this must be marked per license in the selection table.
2. **Vendor lock-in**: Marble, Meshy, Rodin, and Runway are all closed APIs. Marble's parent World Labs was acquired by AMD on 2026-09-28 for about $8.2B in an all-stock deal (expected to close by end of 2026, pending regulatory approval) — **the API route, pricing, and export terms all carry change risk**. [third-party] [Quartz/Yahoo](https://finance.yahoo.com/technology/ai/articles/amd-acquires-fei-fei-lis-121544620.html) (2026-09-29), [Yahoo AI analysis](https://finance.yahoo.com/technology/ai/articles/amd-just-bought-research-defines-174221101.html) (2026-10-01)
3. **World-model iteration speed > engineering accumulation speed**: Genie 3 → 4 took only 14 months (60s → 2min, plus audio). Betting the architecture on "world models will solve multiplayer someday" is a gamble; betting on "engine + pluggable visual layer" is controllable risk.
4. **Evaluation gap**: as of 2026-11 there is no public end-to-end "intent → playable space" benchmark. CEGame-Bench evaluates complete game projects and A2Z evaluates GDD fidelity; **neither covers "spatial experience/sociality"**. choroweave needs to build its own evaluation (reachability, interaction coverage, intent fidelity, multiplayer consistency, generation stability).
5. **Training-data copyright**: the Objaverse/Objaverse-XL family of training sets (TRELLIS.2 explicitly uses Objaverse-XL) has mixed asset licenses, and commercial outputs may inherit upstream risk; no model card discloses this adequately — **it is an industry-wide unsolved problem**.

### 5.2 Items to verify / open questions

| Item | Status |
|---|---|
| Whether Sparc3D releases code/weights publicly | **partially verified**: an official repo exists (https://github.com/lizhihao6/Sparc3D), but the README only gives the paper and a Space demo, there is no LICENSE file, and weight downloads are not described; treated as "code not fully released" |
| Whether an open-source Hunyuan3D 2.5 exists | **not verified**: the official HF org only has 2.0/2.1/2mini/2mv; 2.5 appears only in third-party version narratives |
| Whether Inworld's product focus has shifted from "NPC engine" to voice/inference | **[inference]**: based on site navigation and pricing-page structure (mainly TTS/STT/STS/LLM Inference), no official confirmation |
| Actual SPZ size of Marble's 2M splats | **[inference]**: inferred at SPZ ≈ 1/10 of PLY to be tens of MB; no sample downloaded and measured |
| Code release for 2026 papers such as WorldClaw | **not verified**: currently only papers and project pages |
| Regulatory outcome of AMD's acquisition of World Labs | **undecided**: announced 2026-09-28, expected to close by end of 2026; cross-confirmed by a second outlet (Quartz/Yahoo, 2026-09-29) |
| Whether the "Project Genie 60-second limit" will be relaxed in 2027 | **unknown** (officially said to be improving promptable events) |
| Quantitative metrics for "game-usable topology" across models | **missing**: no public retopo-quality/rigging-success-rate benchmark |
| Actual H100 rental price (cost-model input) | **not individually verified**: this document estimates at the $2–3/hour market range |

### 5.3 Open questions that need a choroweave team decision

1. Must the launch **support EU/UK/KR users**? If so, the default asset models can only be the TRELLIS.2 / Pixal3D / TripoSG family, with Hunyuan as a regional option only.
2. Do we accept the storage/bandwidth doubling from "two asset sets" (splat visuals + mesh interaction)?
3. Expressiveness boundary of the gameplay DSL: only "triggers + state machines + dialogue", or allow players to write WASM scripts?
4. Manual fallback budget for generation quality: how many minutes of human work per space? This directly determines whether the Standard tier is viable.

---

## 6. Source list

### 3D assets / data

1. TRELLIS.2 official repo and README (MIT, 4B, H100 latency table) — https://github.com/microsoft/TRELLIS.2 ｜ arXiv 2512.14692 ｜ 2025-12
2. TRELLIS 1 official repo (MIT, 16GB) — https://github.com/microsoft/TRELLIS ｜ arXiv 2412.01506
3. Hunyuan3D-2.1 official repo (10/21/29GB, PBR, license) — https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1 ｜ 2025-06-13
4. Tencent Hunyuan 3D 2.1 Community License (EU/UK/KR excluded, 1M MAU) — https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1/blob/main/LICENSE
5. Hunyuan3D-Omni official repo (3.3B, 10GB, four control signals) — https://github.com/Tencent-Hunyuan/Hunyuan3D-Omni ｜ arXiv 2509.21245 ｜ 2025-09-25
6. Hunyuan3D-Part official repo and license (2025-09-23) — https://github.com/Tencent-Hunyuan/Hunyuan3D-Part
7. Tencent Cloud: Hunyuan 3D 3.0 (1.5M faces, 8K PBR, 3.5 about 60s) — https://www.tencentcloud.com/techpedia/148305?lang=en ｜ 2026-09-01
8. Hunyuan3D-Buffalo 1.0 (paper only) — https://github.com/Tencent-Hunyuan/Hunyuan3D-Buffalo1.0 ｜ arXiv 2608.02711 ｜ 2026-08
9. TripoSR official repo (MIT, 6GB, <0.5s) — https://github.com/VAST-AI-Research/TripoSR ｜ arXiv 2403.02151
10. TripoSG official repo and HF card (MIT, 8GB) — https://github.com/VAST-AI-Research/TripoSG ｜ https://huggingface.co/VAST-AI/TripoSG ｜ arXiv 2502.06608 ｜ 2025-02
11. Stable Fast 3D official repo (6GB) and Stability AI Community License (free commercial use under $1M annual revenue) — https://github.com/Stability-AI/stable-fast-3d ｜ https://huggingface.co/spaces/stabilityai/stable-fast-3d/blob/main/LICENSE.md ｜ arXiv 2408.00653
12. Pixal3D HF card (MIT, SIGGRAPH 2026, EU gating metadata) — https://huggingface.co/TencentARC/Pixal3D ｜ arXiv 2605.10922
13. Sparc3D paper and official repo (code/weights release status see §5.2) — https://arxiv.org/abs/2505.14521 ｜ https://github.com/lizhihao6/Sparc3D
14. Meshy API pricing (credits, rigging, UV, animation) — https://docs.meshy.ai/en/api/pricing ｜ accessed 2026-11
15. Rodin / Hyper3D vs Hunyuan3D comparison (third-party, compiled after reading official pages) — https://triposr.org/blog/rodin-vs-hunyuan3d ｜ 2026-10-08
16. Roblox Cube official repo (Cube 3D v0.5, CubePart) — https://github.com/Roblox/cube ｜ HF: https://huggingface.co/Roblox/cube3d-v0.5 ｜ https://huggingface.co/Roblox/cubepart ｜ arXiv 2605.28763
17. HY3D-Bench (252k/240k/125k) — https://github.com/Tencent-Hunyuan/HY3D-Bench ｜ arXiv 2602.03907 ｜ 2026-02-04
18. UniRig (unified skeleton binding) — https://arxiv.org/abs/2504.12451 ｜ 2025-04

### Scenes / layout

19. LayoutGPT — https://arxiv.org/abs/2305.15393 ｜ 2023-05
20. SceneCraft (LLM agent writes Blender code) — https://arxiv.org/abs/2403.01248 ｜ 2024-03
21. Holodeck — https://arxiv.org/abs/2312.09067 ｜ 2023-12; Holodeck 2.0 — https://arxiv.org/abs/2508.05899 ｜ 2025-08
22. ProcTHOR — https://arxiv.org/abs/2206.06994 ｜ 2022-06
23. Infinigen — https://arxiv.org/abs/2306.09310 ｜ 2023-06; Infinigen Indoors — https://arxiv.org/abs/2406.11824 ｜ 2024-06
24. SpatialLM official repo and paper — https://github.com/manycore-research/SpatialLM ｜ https://arxiv.org/abs/2506.07491 ｜ NeurIPS 2025
25. HY-World 2.0 official repo — https://github.com/Tencent-Hunyuan/HY-World-2.0 ｜ arXiv 2604.14268 ｜ 2026-04-16 ｜ license: Tencent HY-WORLD 2.0 Community License (2026-04-15, EU/UK/KR excluded + 1M MAU) — https://huggingface.co/apozz/hy-worldmirror-2-bf16/blob/main/LICENSE
26. WorldClaw (paper only) — https://arxiv.org/abs/2608.05248 ｜ 2026-08
27. SceneDiffuser / SceneDiffuser++ (clarification: traffic simulation) — https://arxiv.org/abs/2412.12129 ｜ https://arxiv.org/abs/2506.21976

### World models

28. Genie 3 official blog — https://deepmind.google/blog/genie-3-a-new-frontier-for-world-models/ ｜ 2025-08-05
29. Genie 4 official model page (including Limitations) — https://deepmind.google/models/genie/ ｜ 2026-10
30. Project Genie launch (60s, 720p, 20–24fps, US AI Ultra) — https://9to5google.com/2026/01/29/google-project-genie/ ｜ 2026-01-29
31. Genie 4 preview coverage (2-minute consistency, audio, free-form editing, coming to Project Genie) — https://techcrunch.com/2026/10/27/googles-genie-4-world-model-adds-audio-more-realistic-worlds-and-real-time-steering/ ｜ 2026-10-27; see also https://dataconomy.com/2026/10/28/google-deepmind-previews-genie-4-world-model/
32. Marble models and pricing — https://docs.worldlabs.ai/marble/models ｜ updated 2026-04-03
33. Marble export specs (splat/collision/mesh/panorama) — https://docs.worldlabs.ai/marble/export/specs ｜ updated 2026-05-21
34. Marble overview (GA 2025-11-12, API 2026-01, 1.1 2026-04, Spark 2.0) — https://invideo.io/blog/world-labs-marble-3d-worlds/ ｜ 2026-08-06
35. AMD acquires World Labs ($8.2B all-stock, announced 2026-09-28, expected to close by end of 2026) — https://finance.yahoo.com/technology/ai/articles/amd-acquires-fei-fei-lis-121544620.html ｜ 2026-09-29; analysis piece https://finance.yahoo.com/technology/ai/articles/amd-just-bought-research-defines-174221101.html ｜ 2026-10-01
36. Decart site (Oasis 3, Lucy 2.5/2.6, DOS 2.0, $300M) — https://decart.ai/ ｜ accessed 2026-11
37. Runway GWM Worlds 2 (720p/24fps/48kHz, WorldPrompt) — https://runway.com/research/introducing-gwm-worlds-2 ｜ 2026-09-03
38. Matrix-Game official repo (2.0/3.0/4.0, 67 FPS) — https://github.com/SkyworkAI/Matrix-Game ｜ HF: https://huggingface.co/Skywork/Matrix-Game-2.0 ｜ https://huggingface.co/Skywork/Matrix-Game-4.0 ｜ arXiv 2508.13009, 2610.27999
39. Waypoint-1.5 official blog and model card (Apache-2.0, 1.2B, 720p/60 target) — https://over.world/blog/waypoint-1-5 ｜ https://huggingface.co/Overworld/Waypoint-1.5-1B ｜ 2026-04-09
40. HY-World 1.5 / WorldPlay (24 FPS, 480P, 28–72GB) — https://github.com/Tencent-Hunyuan/HY-WorldPlay ｜ arXiv 2512.14614 ｜ 2025-12-17
41. Hy-Nomas (Apache-2.0, single 4090, multi-turn text + camera) — https://github.com/Tencent-Hunyuan/HY-Nomas ｜ arXiv 2610.36729 ｜ 2026-10-21
42. Hunyuan-GameCraft (24GB minimum/80GB recommended, 25FPS) — https://github.com/Tencent-Hunyuan/Hunyuan-GameCraft-1.0 ｜ arXiv 2506.17201
43. Solaris (multiplayer video world model) — https://arxiv.org/abs/2602.22208 ｜ 2026-02-25
44. MASS (authoritative shared state) — https://arxiv.org/abs/2608.06257 ｜ 2026-08-06
45. MultiGen (editable multiplayer worlds, external memory) — https://arxiv.org/abs/2603.06679 ｜ 2026-03-03
46. RAR (time-rate adaptive rollout) — https://arxiv.org/abs/2610.16302 ｜ 2026-10-12

### Agent / gameplay generation

47. Voyager — https://arxiv.org/abs/2305.16291 ｜ 2023-05
48. Project Sid — https://arxiv.org/abs/2411.00114 ｜ 2024-10-31
49. Generative Agents — https://arxiv.org/abs/2304.03442 ｜ 2023-04
50. NVIDIA ACE Game Agent SDK + UE5 plugin — https://developer.nvidia.com/blog/build-on-device-ai-companions-with-the-nvidia-ace-game-agent-sdk-and-unreal-engine-5-plugins/ ｜ 2026
51. Inworld pricing (voice/inference API, commercial license) — https://inworld.ai/pricing ｜ accessed 2026-11
52. Convai docs — https://docs.convai.com/api-docs ｜ accessed 2026-11
53. Rosebud × Reactor (LingBot World 2, about 16 FPS, gameplay in the code layer) — https://lab.rosebud.ai/blog/rosebud-reactor-video-world-models ｜ 2026-08-31
54. Astrocade ($56M, 20M users in 8 months) — https://www.astrocade.com/blog/astrocade-raises-56m-funding ｜ 2026-05-05
55. Bitmagic GDK (coding-agent driven, `bitmagic verify`) — https://bitmagic.ai/news/bitmagic-gdk/ ｜ 2026-08-27
56. Roblox Cube introduction (2025-03-17, open-source Cube 3D) — https://about.roblox.com/newsroom/2025/03/introducing-roblox-cube
57. Roblox 4D generation (schema, script retargeting, 160k objects) — https://about.roblox.com/newsroom/2026/02/accelerating-creation-powered-roblox-cube-foundation-model ｜ 2026-02-04
58. UEFN MCP official docs (Verse/scene graph/devices/playtest, file sandbox) — https://dev.epicgames.com/documentation/fortnite/uefn-mcp
59. CEGame-Bench (five engines, 16% completion) — https://arxiv.org/abs/2610.26098 ｜ 2026-10-19
60. A2Z GameSpec-Bench (long-GDD fidelity) — https://arxiv.org/abs/2609.39564 ｜ 2026-09-30
61. V-GameGym (ACL 2026 Findings) — https://aclanthology.org/2026.findings-acl.276/
62. GamePhanes (Godot agent environment and benchmark) — https://github.com/GamePhanesStudio/GamePhanes

### 3DGS / rendering

63. SPZ 4 (Niantic, parallel ZSTD, 34M points) — https://nianticspatial.com/blog/spz4 ｜ 2026
64. PlayCanvas SuperSplat format docs (SPZ/SOG/streamed SOG) — https://developer.playcanvas.com/user-manual/supersplat/editor/import-export/ ｜ accessed 2026-11
65. Spark (MIT, Three.js 3DGS renderer) — https://github.com/sparkjsdev/spark
66. 3D Gaussian Splatting original paper — Kerbl et al., SIGGRAPH 2023

### Consistency with [`02-tech-selection.md`](../02-tech-selection.md)

- This document's conclusions are consistent with ADR-04 (Babylon.js 8.x), ADR-09 (skeleton-first + TRELLIS.2 default, Hunyuan3D optional), and ADR-11 (world models/3DGS not as runtime, P3 evaluation); no conflicting selection is proposed.
- Terminology is unified as: World Bundle / Spatial-DSL / Portal / Node; logical layers L0/L1/L2.
- The only additional recommendation: promote the "parts schema" to a first-class field of Spatial-DSL, for interactable props and riggable characters (based on part-level evidence from Roblox CubePart/4D and HY3D-Bench).

### Note

- This document involved **50+ searches/fetches** (`web_search`/`web_fetch` plus direct HTTP fetches of official READMEs, Hugging Face model cards, and vendor docs), prioritizing first-hand sources; third-party sources are used only to supplement numbers the official sources did not disclose (e.g., third-party measurements, industry comparison articles).
- All "not verified" items are collected in §5.2 and are not passed off as fact through inference. Every cost/latency table in this document is labeled "engineering estimate" together with its assumptions.
