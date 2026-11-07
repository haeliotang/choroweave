# choroweave Research 03: Runtimes, Open Standards, and Device Support

> **Chinese version**: [03-runtime-standards.md](../../research/03-runtime-standards.md) — Chinese original; this page is its English translation.
>
> **Verification basis**: as of **2026-11-07**. Every judgment of "ratified / draft / experimental / enabled by default" follows the official pages reachable on that date;
> anything that cannot be confirmed from a primary source is marked **"not verified"**, with no speculative gap-filling.
> Version numbers and dates all come from primary pages; secondary media is used only for cross-checking.
> The core questions of this report: **Should we bet on KHR_interactivity? Should we be WebGPU-only? Which runtime foundation? What can VR devices actually carry today?**

---

## 1. TL;DR (10 items, including 3 decision recommendations)

**Facts**

1. **KHR_interactivity is already a formal standard, not a draft.** On 2026-07-16 Khronos announced it was "submitted for ratification", and it was **formally ratified on 2026-08-28**; the specification body in the glTF repository states Status "Complete, Ratified by the Khronos Group", and the extension-registry README also lists it among Ratified. On the publicity side, Khronos issued **no** separate ratification press release between July and September, which easily makes outsiders misread it as "still being ratified". [S1][S2][S3]
2. **But ratified ≠ mature ecosystem.** In Khronos's own wording, Babylon.js and glTF-Sample-Viewer (UX3D) are **"the first two independent implementations meeting the ratified requirements"**; UnityGLTF covers only the export side; the Needle Engine runtime was still on the roadmap as of 2026-07; and **no official support could be verified** for three.js / PlayCanvas / Wonderland / Ambit. [S4][S5][S6][S7]
3. **KHR_interactivity's capability boundary is widely overestimated.** The specification explicitly states it is **"for single user experiences only and does not deal with any of the complexity involved in multi-user networked experiences"**, and it supports neither UI nor arbitrary scripting; the behavior graph is Turing-complete, so it needs runtime throttling. **It cannot carry "multi-user co-presence" or "spatial portals" — choroweave must define both of those layers itself.** [S2]
4. **WebXR is still not a "platform-level Web standard".** MDN directly marks it *Limited availability / Experimental* (not Baseline); caniuse shows 78.02% for 2026-10, and Safari (macOS/iOS) still ships it off by default. **What actually works is Chromium-based browsers + Quest Browser + visionOS Safari.** [S8][S9]
5. **WebXR on visionOS Safari is "genuine support, but Apple has a different main line".** Safari has supported WebXR since visionOS 2 (visionOS 1.x needed a feature flag), with transient-pointer natural input and hand tracking; Safari 27 (2026-09) even added texture-array projection layers for WebXR Layers. **But Apple's real spatial-web main line is the `<model>` element + Immersive API (USDZ-centric)**: Safari 27 brought `<model>` to iOS/iPadOS/macOS and added site-level immersive environments. [S10][S11][S12][S13]
6. **WebGPU in 2026 is "on by default in three desktop engines", but still one layer short of "usable in XR".** Chrome/Edge 113+, Safari 26 (macOS/iOS/visionOS) enable it by default; Firefox enables it by default only on Windows/macOS (141/145/147), with Linux still in Nightly; **the WebXR/WebGPU Binding is still a W3C Editor's Draft, and none of the three engines treats WebGPU-mode XR as a production path**. three.js even only changed "XR under WebGPU throws an error" to "automatically fall back to WebGL" in 2026-04. [S14][S15][S16][S17]
7. **Quest 3's official performance baseline (Meta's own Unity checklist): ≤150 draw calls/frame, <1M triangles/frame, overdraw <2x, texture VRAM about 500–700MB. This is a native-engine budget, and browser WebXR must discount it further.** So the reachable ceiling for "instant play in a web page" is **stylized art + baked lighting + 1M-triangle scale + tens-of-MB initial payload**, not "a AAA open world running in a page". [S18]

**Decisions (details in Section 4)**

8. **Bet on KHR_interactivity, but only on the "in-asset behavior" layer**: treat it as the standard for "portable object-level interaction" (opening doors, triggering animations, simple state machines), and **do not** treat it as world logic / networking / portal protocol; simultaneously build a lightweight in-house "world rules + spatial links" protocol (aligned with MSF's "Web of Worlds"/X3D Anchor).
9. **For the runtime foundation, prefer Babylon.js over three.js.** It is the only implementation with ratified-grade playback + a Flow Graph editor + lossless export; three.js on WebGPU+XR is "half-finished + fallback", and WebGPU is only suitable for 3DGS/post-processing experiment branches. PlayCanvas fits as a 3DGS/WebGPU asset pipeline (SuperSplat) rather than the main runtime.
10. **Do not go WebGPU-only; stay WebGL2-first at least through 2027.** Reasons: Firefox on Linux/Android does not default to it, headset-browser WebGPU status is unknown, the WebXR/WebGPU binding is still a draft, and Babylon's WebGPU-XR labels itself experimental. The rendering strategy should be **WebGL2 by default + enable after WebGPU feature detection**.

---

## 2. Standard / technology inventory

> Status terms: **Ratified** (formal Khronos) / **Draft/Proposal** (specification stage) / **Vendor** (vendor extension) / **Browser** (browser capability, per MDN/caniuse) / **Not verified**.
> Usability terms: ★ usable directly ／ ◐ usable but with clear limits ／ ○ fallback only ／ ✕ not recommended now.

| Item | Status as of 2026-11 | Implementation/support | Usability for choroweave | Evidence |
|---|---|---|---|---|
| glTF 2.0.1 | Current specification | De facto industry standard | ★ The only reasonable asset foundation | [S3] |
| glTF 2.1 | **Not released**; to be presented at the 2026-11-17 Town Hall | Backward compatible; multi-file composition, per-node bounding volumes, thumbnails, 64-bit GLB | ◐ Watch (multi-file composition bears directly on "portals/external scenes") | [S19] |
| **KHR_interactivity** | **Ratified (2026-08-28)** | Full playback in Babylon.js; complete in SampleViewer; UnityGLTF export; Behave authoring; Android XR / Magic Leap announced future support | ◐ Bet on "in-asset behavior", do not let it carry world logic | [S1][S2][S4][S5] |
| KHR_node_visibility / selectability / hoverability | Ratified | Godot (visibility), Babylon.js | ★ Usable as small companion interaction capabilities | [S3][S20] |
| KHR_gaussian_splatting | **Ratified** (2026; exact date not verified) | CesiumJS, Cesium Native, JSplat, 3dgs_ply2gltf | ★ glTF archive format for 3DGS; compression extension still to come | [S21] |
| KHR_physics_rigid_bodies | **Review Draft** (PR #2424, not ratified) | No mainstream runtime seen | ✕ Cannot depend on it; ship our own physics | [S3] |
| KHR_collision_shapes | Review Draft (PR #2370) | Same as above | ✕ Cannot depend on it | [S3] |
| KHR_audio_graph | **Proposal** (PR #2421) | None | ✕ Build spatial audio in-house | [S3] |
| KHR_audio_emitter | Not ratified (PR #2137 pending for a long time) | three.js/Godot have WIP branches | ○ Reference only | [S3][S27] |
| KHR_texture_basisu (KTX2/BasisU) | Ratified | Supported by all mainstream engines | ★ Must use | [S3] |
| KHR_draco_mesh_compression | Ratified | Supported by all mainstream engines | ★ Must use (geometry) | [S3] |
| EXT_meshopt_compression | Ratified | Supported by all mainstream engines | ★ Must use (buffer compression) | [S3] |
| MSFT_lod | **Vendor extension** (not ratified) | Support not verified item by item | ○ Better to use our own LOD tree | [S3] |
| OMI_physics_body / OMI_seat / OMI_spawn_point etc. | Mostly **Stage 1–2**; OMI_link archived | In practice only Godot implements them (via plugin) | ○ Semantics worth referencing, do not depend | [S27] |
| WebXR Device API | W3C **CR** (caniuse) but MDN marks *Experimental/Limited* | Chrome/Edge 79+, Quest Browser, visionOS Safari | ◐ Must use, but only covers Chromium + Quest + visionOS | [S8][S9] |
| WebXR Layers | W3C WD | All three vendors implementing; Safari 27 adds texture-array projection layers | ◐ Usable (it is key to XR performance) | [S13] |
| WebXR Hand Input / Hit Test / Anchors / Depth / Lighting | Mostly **Editor's Draft / WD** | Chrome (Android/ARCore) more complete; visionOS/Quest partial | ◐ Feature-detect one by one | [S8][S22] |
| WebXR/WebGPU Binding | **Editor's Draft** | No production browser confirmed | ✕ Do not plan on it | [S22] |
| WebGPU | Enabled by default in browsers (Chrome/Safari/Firefox on some platforms) | See the 3.4 matrix | ◐ Enable after feature detection, not the only backend | [S14][S15] |
| WebTransport | W3C WD; Chrome 97+/Firefox 114+/Safari 26.4+ | 92.37% (caniuse 2026-10) | ★ First choice for multiplayer sync transport | [S23] |
| WebRTC DataChannel | De facto standard | All platforms | ★ Fallback and P2P | (generic capability) |
| 3D Tiles | OGC community standard (led by Cesium) | CesiumJS etc. | ○ Reference for geographic-scale streaming, not a general solution | [S24] |
| MPEG-I Scene Description (ISO/IEC 23090-14) | Editions 1/2 published; still issuing Amendments in 2026 | No mainstream web runtime | ○ Standards-watch item | [S25] |
| SPZ 4 | De facto standard (open-sourced by Niantic, 2026-05-05) | Babylon.js, WASM/TS libraries, Adobe | ★ 3DGS transport format | [S26] |
| SOG / Streamed SOG | De facto standard (open-sourced by PlayCanvas) | PlayCanvas engine and SuperSplat | ★ 3DGS transport format (WebP family) | [S28] |
| MSF "Web of Worlds" | 2026 whitepaper + blog, X3D 4.1 WoW Profile | Being implemented by Threedy.io / Virginia Tech | ★ The benchmark standard for portals/spatial linking | [S29][S30] |
| Non-invasive BCI | Consumer EEG exists but low bandwidth; invasive is clinical | No consumer high-bandwidth input | ✕ Not a Phase 4 commitment; switch to multimodal input | [S31][S32] |

---

## 3. Item-by-item analysis

### 3.1 The glTF ecosystem: 2.0 → 2.1, and "the one most critical extension"

#### 3.1.1 Version movement (verified)

- The current version is still **glTF 2.0.1** (the registry page states explicitly that each backward-compatible revision only increments the patch number). [S3]
- **glTF 2.1 has not been released.** Khronos plans to introduce 2.1 systematically at the **2026-11-17** Town Hall: positioned as a "focused, backward-compatible revision", with core capabilities of **multi-file scene composition (external glTF references/packaging)**, per-node bounding volumes and implicit shapes, scene-structure clarification, thumbnails, and a **64-bit binary container (removing the GLB size ceiling)**. This is the first time in glTF's history that "a scene composed of multiple assets" is addressed head-on. [S19]
- The related project **glTF External References is still in the Proposal stage** (Khronos extension registry "in-progress projects"). [S3]
- **Direct significance for choroweave**: 2.1's "external references / multi-file composition" is precisely a natural carrier for "cross-server spatial interlinking"; if choroweave designs its own portal manifest, it should stay as compatible as possible with 2.1 external-reference semantics to avoid rework in 2027.

#### 3.1.2 The real status of KHR_interactivity (the key finding of this verification)

**Timeline (all primary sources)**

| Date | Event | Source |
|---|---|---|
| 2026-02-03 | KHR_gaussian_splatting issues a Release Candidate (for comparison) | [S21] |
| 2026-07-16 | Khronos news: "KHR_interactivity **Submitted for Ratification**" | [S1] |
| 2026-07-16 | Babylon's quote in the same news uses "**upcoming ratification**", showing it was not yet complete | [S1] |
| 2026-08-28 | **Formally ratified** | [S4][S2] |
| 2026-09-17 | Safari 27 released (unrelated to this extension; used as a time anchor) | [S13] |
| 2026-10-13 | Khronos webinar: "since its ratification on **August 28, 2026**"; and names "**Babylon.js and SampleViewer as the first two independent implementations meeting the ratified requirements**" | [S4] |
| 2026-11-07 | glTF repository specification Status: **"Complete, Ratified by the Khronos Group"**; the extension registry's Ratified list includes `KHR_interactivity` | [S2][S3] |

**Conclusion**: **ratified, not a draft.** But note two "wording traps":
1. Khronos's news/press list **did not** publish a standalone ratification press release between 2026-07-16 and 2026-09-15 (the press list confirms this), so reading only the news page leads to the wrong judgment that it is "still being ratified".
2. Babylon.js official documentation (written after ratification) uses "ratified specification" in several places, which serves as third-party cross-confirmation. [S5]

**Specification capability boundary (must go into the ADR)**

- Behavior graph = data-flow + control-flow nodes; supports events, variables, `flow/*` control flow, `math/*`, `pointer/*` (JSON Pointer reads/writes against the glTF Object Model).
- **Turing-complete**, as the specification itself acknowledges, so the safety model is "runtime throttling + static/dynamic limits", not "dangerous logic cannot be expressed". [S2]
- **Explicitly excluded**: UI presentation and arbitrary scripting; it **explicitly declares "This extension is for single user experiences only and does not deal with any of the complexity involved in multi-user networked experiences."** [S2]
- Extension mechanism: it may reference operations defined by `KHR_node_selectability` / `KHR_node_hoverability` / `KHR_node_visibility`; unsupported extension operations degrade to no-ops (graceful degradation is possible). [S1][S2]
- Design goals include "web-based experiences" and a safe sandbox, which aligns with choroweave's open-world requirements. [S1]

#### 3.1.3 Implementation inventory (strictly separating "playback/runtime" from "export/authoring")

| Implementer | Type | Status (as of 2026-11) | Evidence |
|---|---|---|---|
| **Babylon.js** | Runtime playback + editor | ★ Complete: loads/validates/executes Flow Graphs, `GetKHRInteractivityImportResult` checks, Flow Graph Editor import, **lossless export** (of representable edits); does not support authoring arbitrary new graphs | [S5] |
| **glTF-Sample-Viewer (UX3D)** | Reference viewer | ★ Complete (one of the "first two independent implementations") | [S4] |
| **UnityGLTF (Needle/PrefrontalCortex)** | Exporter | ★ Export side (CHANGELOG: "Editor export support for KHR_interactivity", etc.) | [S6] |
| **Needle Engine** | Runtime | ◐ Official position as of 2026-07 was **"on the roadmap"**; whether it shipped by 2026-11 is **not verified** | [S1] |
| **Behave (UX3D)** | Authoring tool | ★ Named in the webinar as the primary authoring tool | [S4] |
| **Magic Leap** | Unity runtime | ★ "completed runtime playback engine built on UnityGLTF" (news wording, not independently verified) | [S1] |
| **Google Android XR (Jetpack XR SDK)** | Platform | ◐ "will support glTF interactivity playback" (future tense) | [S1] |
| **Amazon** | Authoring tool | ◐ "functional prototype" | [S1] |
| **three.js** | Runtime | ✕ **No official executor verified**; not on the ratification implementation list; the community has an experimental bidirectional-mapping project (rudyBear/gltf-interactivity-bidirectional) of unverified maturity | [S4][S33] |
| **PlayCanvas** | Runtime | ✕ No support verified (its 2026 focus is WebGPU + 3DGS) | [S34] |
| **Wonderland Engine** | Runtime | ✕ No support verified (its 2025-12 release focus was the XR Interaction library and a WebGPU rendering option) | [S35] |
| **Ambit** | Runtime | ✕ **No KHR_interactivity-related evidence could be verified at all** | — |
| **Godot** | Engine | ◐ Companion extensions only: `KHR_node_visibility` is implemented and import visibility is preserved; no interactivity execution seen | [S20] |

> **Re-check of the Lead's four claims**: ① "Babylon is the only one with full playback" → **broadly holds** (counting SampleViewer, strictly it is "two ratification-grade implementations, with Babylon the only general-purpose engine that also has an editor/export"); ② "three.js is load-only (no executor)" → **holds**, or more precisely "no official support; even on the load side it merely ignores them as ordinary extensions"; ③ "Unity is Needle-export-only; Godot partial; UE5 unconfirmed" → **holds/cannot be confirmed** (UE5 appears in neither the Khronos news nor the Babylon documentation); ④ three.js WebGPURenderer+XR refactor → **holds**, see 3.4.

#### 3.1.4 Physics, audio, compression, LOD, OMI

- **Physics**: `KHR_physics_rigid_bodies` (Review Draft, PR #2424) and `KHR_collision_shapes` (Review Draft, PR #2370) are **both unratified**. On the Blender side a third-party `khr-physics-rigid-bodies` plugin has entered the approval queue, showing the toolchain is moving, but **it cannot be a standard dependency**. [S3]
- **Audio**: `KHR_audio_graph` is only a **Proposal** (PR #2421); `KHR_audio_emitter` has long been unratified. choroweave's spatial audio must be built in-house (Web Audio + HRTF). [S3][S27]
- **The compression trio**: `KHR_draco_mesh_compression`, `KHR_texture_basisu` (KTX2/BasisU) and `EXT_meshopt_compression` are all **Ratified** and are the engineering foundation of "instant play in a page"; we recommend enabling all of them by default. [S3]
- **LOD**: `MSFT_lod` is still a **Vendor extension**, not on Khronos's ratified list; cross-engine consistency is poor. We recommend an in-house chunked LOD tree (per the 3D Tiles/SPZ v5 plans). [S3]
- **OMI compatibility**: most OMI glTF extensions stop at Stage 0–2, and **in practice only Godot implements** `OMI_physics_body`/`OMI_physics_shape`/`OMI_seat`/`OMI_spawn_point` (via plugin); `OMI_collider`, `OMI_link` and `OMI_personality` are archived. This means **"spatial linking/portals" once had a proposal in OMI (OMI_link), but it is deprecated** — if choroweave wants a portal protocol, there is currently no ready standard to depend on. [S27]

### 3.2 WebXR: capabilities and support matrix

**Specification layer** (W3C Immersive Web WG, active): WebXR Device API is **CR**, the AR Module is CR, Gamepads is WD; Layers / Hand Input / Hit Test / Depth Sensing / Lighting Estimation / Anchors / Plane Detection are Editor's Drafts or WDs; **WebXR/WebGPU Binding Module Level 1 is still an Editor's Draft**. [S22]

**Working-group activity**: F2F at Apple's New York office on 2026-05-19/20; TPAC 2026 (Dublin) on 2026-10-26~30. This shows the WebXR standard is still advancing, but **slower than vendors' own solutions**. [S22]

**Device/browser matrix (as of 2026-11)**

| Capability | Chrome/Edge desktop | Chrome Android | Quest Browser | Pico Browser | visionOS Safari | Notes |
|---|---|---|---|---|---|---|
| `immersive-vr` | ✓ (needs an XR device) | ✓ | ✓ | ✓ | ✓ (visionOS 2+ default) | visionOS 1.x needs a feature flag |
| `immersive-ar` | △ | ✓ (ARCore) | not verified | not verified | not verified | AR Module is CR |
| WebXR Layers | ✓ | ✓ | ✓ | not verified | ✓ (texture-array projection since Safari 27) | Key to XR performance |
| Hand Input | ✕ | △ | ✓ | not verified | ✓ (+ transient-pointer) | visionOS input model is special, see 3.3 |
| Hit Test | ✕ | ✓ | not verified | not verified | not verified | Needs feature detection |
| Anchors | ✕ | ✓ | not verified | not verified | not verified | Needs feature detection |
| Depth Sensing | ✕ | ✓ | not verified | not verified | not verified | Needs feature detection |
| Lighting Estimation | ✕ | ✓ | not verified | not verified | not verified | Needs feature detection |
| WebXR/WebGPU binding | ✕ | ✕ | ✕ | ✕ | ✕ | Editor's Draft only |

> Legend: ✓ = backed by a primary/authoritative document; △ = some devices/some versions; "not verified" = no primary compatibility table found in this round, **do not assume availability in the implementation**.
> General conclusion: **the genuinely available surface of WebXR = Chromium-based browsers (including Quest Browser) + visionOS Safari**; desktop Safari and Firefox are not target platforms for this generation of product. [S8][S9]

**SteamVR/PC VR**: SteamVR itself does not provide a complete WebXR browser; the actual path for PC VR users is "desktop Chrome/Edge + SteamVR's OpenXR runtime". If choroweave wants to cover PC VR, it should treat "browser + desktop OpenXR" as a separate test channel rather than "in-headset browser". (WebXR support in SteamVR's built-in browser is **not verified**.)

### 3.3 The real state of visionOS Safari (a key verification item)

**Conclusion: genuine support, but "on by default + a feature subset + Apple has another main line" — three things that must be stated separately.**

1. **WebXR is available on visionOS.** In visionOS 1.1, Safari offered a test build behind a feature flag (Settings > Apps > Safari > Advanced > Feature Flags > WebXR Device API); **visionOS 2 announced official support** (WebKit's own blog: "Apple announced WebXR support with visionOS 2"), while visionOS 1.2 still required manual enabling. [S10][S36]
2. **The input model differs from other platforms**: the default is **transient-pointer (gaze to aim + pinch to confirm)**, and `inputSources` is empty before the pinch; `hand-tracking` is also supported (it must be declared as a feature in `requestSession` and authorized by the user), in which case the first two inputSources are hand tracked-pointers and transient-pointer follows. **Common three.js examples read only index 0/1, so on visionOS they cannot click anything** (WebKit calls this out explicitly). This is a hard requirement for the runtime abstraction layer: **input sources must not use fixed indices**. [S10]
3. **It keeps evolving**: Safari 27 (2026-09-17) added `textureType: "texture-array"` projection-layer support for WebXR Layers, showing Apple has not abandoned WebXR. [S13]
4. **But Apple's spatial-web main line is a different stack**: the `<model>` element (on by default in visionOS 26, USDZ-centric, supporting environmentmap/stagemode; from Safari 27 down to iOS/iPadOS/macOS, with `<source>` fallback to glb) + the **Immersive API** (Fullscreen-API-like, entering a site-level immersive environment from `<model>` on visionOS; Safari 27 replaces the earlier Spatial Backdrop developer preview). [S11][S12]
5. **Strategic implication**: if choroweave does only WebXR on visionOS, it will run on a second track alongside Apple's own "model element + immersive environment" route; we recommend **WebXR as the main path, with `<model>` + Immersive API as the visionOS enhanced-degradation path** (e.g. portal previews, single-asset display). This is not a technical preference but a channel-risk hedge.

### 3.4 WebGPU: support matrix and engine maturity

**Browser matrix (gpuweb's official Implementation Status + caniuse 2026-10, cross-verified)**

| Browser/platform | Status | Notes |
|---|---|---|
| Chrome/Edge desktop (Mac/Win/ChromeOS) | ✅ 113+ | Dawn implementation |
| Chrome Android | ✅ 121+ (ARM/Qualcomm/Intel, Android 12+) | Imagination Android 16+ |
| Chrome Linux | ✅ Intel Gen12+ 144; NVIDIA Wayland 147 | Others need a flag |
| **Safari 26+ (macOS/iOS/iPadOS/visionOS)** | ✅ **on by default** | caniuse marks desktop as "partial", iOS as supported |
| Firefox Windows | ✅ 141 (2025-07) | wgpu |
| Firefox macOS 26+ | ✅ 145; all macOS 147 | |
| **Firefox Linux** | 👷 Nightly (Mozilla says "release within 2026") | **not default** |
| **Firefox Android** | 👷 needs a flag | **not default** |
| Quest Browser / Pico Browser | **not verified** | Chromium-based, but version and flags are vendor-controlled |

**Global availability**: caniuse 2026-10 shows 86.83% (+1.8% = 88.63%). But "availability" masks **differences among leading devices**: Firefox Linux/Android and headset browsers remain gaps. [S14][S15]

**Engine-side maturity**

- **Babylon.js**: WebGPU supported since 5.0 (2022-05); core shaders rewritten to native WGSL in 2024; **WebGPU-XR is still experimental**, depends on `XRGPUBinding`, requires `xrCompatible: true` + WebXR Layers enabled first, and **cannot switch from WebGPU to WebGL after the scene is created**. [S16]
- **three.js**: `WebGPURenderer` from `three/webgpu` works, but **WebXR under WebGPU only changed from "throws" to "automatically falls back to WebGL" in 2026-04** (PR #33497, submitted by Meta engineer Rik Cabanier); another 2026-03 PR #33154 was still refactoring the WebXR framebuffer cache. Conclusion: **three.js's WebGPU+XR is not a production path**. [S17][S37]
- **PlayCanvas**: WebGPU supported since engine 1.62 (2023), reached the editor in 2024; but its 2026 focus is 3DGS (SuperSplat fully rebuilt on WebGPU in 2026-09, streamed LOD). **No KHR_interactivity support seen.** [S34]

**Significance for 3DGS**: WebGPU's compute shaders + storage buffers make "GPU sorting / chunked LOD / post-processing" possible; the WebGL2 path can only rely on CPU sorting + instancing and does not scale. **But there is currently no standard binding for using WebGPU inside WebXR**, so in the short term 3DGS in XR can only go through WebGL2, or "WebGPU in the lobby, fall back to WebGL in XR".

### 3.5 Performance budgets: what devices can actually carry today

**Primary data (Meta's official Unity performance checklist, Quest series)**: [S18]

| Metric | Quest 2 | **Quest 3 / Meta VR Glasses** |
|---|---|---|
| Draw calls / frame | 50–100 | **≤150** |
| Triangles / frame | < 750K | **< 1M** |
| Overdraw | < 2x average | < 2x average |
| Total usable RAM | ~1.5 GB | **~2 GB** |
| Texture VRAM | ~300–500 MB | **~500–700 MB** |
| Mesh VRAM | ~100–200 MB | ~150–300 MB |
| Texture compression | ASTC 6x6 (UI 4x4) | Same |

> Note: these are **native Unity/URP** budgets. Browser WebXR additionally carries the Chromium GPU process, the JS main thread, the compositor and WebGL driver overhead, so **the actually usable budget must be discounted further to 50–70%** (engineering estimate, to be calibrated by measurement on Quest 3). Pico 4 (XR2 Gen1, 2022 hardware) should be one tier below Quest 3.

**Reachable visual ceiling for "instant play in a page" (engineering judgment, not official data)**

- Initial payload (HTML+JS+wasm+first spatial shell): **≤ 5–8 MB** (interactive within 3–5 s on 4G/weak networks)
- Per-space assets: **10–40 MB** (KTX2 + meshopt + instancing), with portal prefetch
- Triangles: **300–500K/frame** (Quest 3 WebXR starting point), draw calls **50–80**
- 3DGS: **1M–3M splats** per scene is the realistic ceiling (1M splats in SPZ is about 19–21 MB, see 3.7); large scale requires chunking + LOD + streaming
- Visual goals: **stylized, baked lighting, few dynamic lights, no real-time shadow cascades**; real-time full-screen PBR lighting + high-poly + a large world = unreachable

**WASM/JS sandbox overhead (concluding judgment)**

- WASM compute is close to native (physics at 60Hz, animation sampling, graph execution are fine), but **per-frame JS↔WASM boundary calls** and the single-threaded main thread are the real bottlenecks; Workers + OffscreenCanvas + SharedArrayBuffer are needed (depending on COOP/COEP cross-origin isolation).
- Multi-threaded WASM (Jolt multithread, Rapier parallelism) is unavailable by default in browsers and requires site-configured cross-origin isolation headers; whether headset browsers support COOP/COEP is **not verified**, and that directly determines "whether physics can be multi-threaded".
- The WebXR render loop must align with `requestAnimationFrame`/`XRSession.requestAnimationFrame`; **rendering cannot be moved to a Worker** (the WebGL context lives on the main thread; WebGPU can use OffscreenCanvas, but the XR binding is not standardized).

### 3.6 Physics engines and networking models

**Physics engine comparison (for Web/WebXR + server-side reuse)**

| Engine | Form | Strengths | Risks | Recommendation |
|---|---|---|---|---|
| **Rapier** | Rust → WASM/JS (official `@dimforge`) | Good performance, optional SIMD/parallelism, **optional cross-platform determinism**, officially maintained | Large bundle (exact size not verified) | ★ Primary choice (especially when "server-side Rust + client WASM from one source" is needed) |
| **Jolt** | C++ → WASM/asm.js (JoltPhysics.js, MIT) | High quality, 7 build variants (including multithreaded), adopted by GDevelop/Babylon plugins | JS bindings are "almost the entire C++ interface", steep learning curve; multithreading needs isolation headers | ★ Backup / high-fidelity scenes |
| **PhysX (physx-js / physx-js-webidl)** | C++ → WASM (Emscripten/WebIDL) | Full industrial-grade feature set | Large size, weak maintenance and docs (activity not verified) | ○ Not recommended for new projects |
| **Ammo.js** | Bullet → asm.js/WASM | Large historical ecosystem (three.js examples) | Slow maintenance, mediocre performance | ✕ Do not use in new projects |

> Evidence: Rapier [S39], Jolt [S40], PhysX (physx-js-webidl) [S41]; Ammo.js is a legacy project not separately sourced in this round — "slow maintenance" is a community-consensus judgment (2026 commit activity not verified).

**Multiplayer networking model**

- **Authoritative server vs client authority**: open world + cross-server portals + user-generated content ⇒ **server authority is mandatory** (clients only predict/interpolate); otherwise teleporting/assets/permissions cannot be protected against cheating.
- **Transport layer**: **WebTransport first** (HTTP/3, unreliable datagrams + multiple streams; caniuse 2026-10 = 92.37%, Safari 26.4+/Chrome 97+/Firefox 114+), WebRTC DataChannel as fallback (P2P/voice), WebSocket for the control plane only. Headset-browser support for WebTransport is **not verified** and needs measurement.
- **State sync and KHR_interactivity**: because the specification says "single user only", **behavior-graph state cannot be networked directly**. A workable approach: choroweave defines a "replicable-property allowlist" (JSON Pointer paths into the glTF Object Model); the server syncs only the pointer values and custom variables on the allowlist, and behavior-graph execution results are captured by the network layer as pointer changes. This is the key engineering point that extends the standard into a multi-user experience, and where the in-house value lies.

### 3.7 Streaming and 3DGS

- **Progressive glTF**: a single GLB buffer + `EXT_meshopt_compression` (with fallback support) already delivers "coarse first, fine later"; true "play while downloading" still needs custom chunking (slicing by node/material/bounding box) + HTTP Range.
- **3D Tiles**: OGC community standard, tileset tree + LOD + glTF content, suited to geographic-scale data; too heavy for "indoor/social spaces", but **its tile tree + content-addressing idea is worth copying**. [S24]
- **MPEG-I Scene Description (ISO/IEC 23090-14)**: editions 1 and 2 published; still issuing Amendments in 2026 (immersive audio/scene understanding/advanced media formats) and continuously registering Khronos glTF extensions. **No mainstream web runtime**, so not adopted in the short term. [S25]
- **Current state of 3DGS formats (key 2026 changes)**:
  - **KHR_gaussian_splatting is ratified**: it stores splats as `POINTS` primitives with custom attributes (ROTATION/SCALE/OPACITY/SH_*), degrading to a point cloud when unsupported; explicitly designed to be further extended by compression extensions. [S21]
  - **SPZ 4 (Niantic, 2026-05-05)**: six parallel ZSTD streams replace a single GZip — encoding 3–5x faster, loading 1.5–2x faster, still 10x smaller than PLY; 32-byte plaintext header; introduces a vendor extension chain; SH degree 4. Benchmarks: 1.0M points = 18.9 MB, TTR 238ms; 3.6M points = 65.7 MB, TTR 844ms; 7.1M points = 128 MB, 1.66s. **The v5 roadmap explicitly lists "Streaming and progressive loading / Spatial chunking and LOD" — i.e. streaming is not done yet.** [S26]
  - **SOG / Streamed SOG (PlayCanvas)**: WebP atlases + meta.json, typically 15–20x smaller than PLY; "Streamed SOG" documentation already exists, showing PlayCanvas has productized "chunked streaming". [S28]
  - **Conclusion**: 3DGS's "transport format" has converged on two de facto standards, SPZ/SOG, and "representation inside glTF" has converged on KHR_gaussian_splatting; but **compression extensions and streamed LOD remain work in progress through 2026–2027**, so choroweave should build its own chunk index + prefetch rather than wait for the standard.
- **CDN/content-addressing engineering practice**: content-hash naming + immutable cache + Range requests + HTTP/3 multiplexing + portal-adjacency prefetch. There is no standard, but this is the necessary engineering layer for "cross-server spatial interlinking".

### 3.8 Standards-body activity (2025–2026)

- **Khronos**: very active — KHR_interactivity ratified (2026-08-28), KHR_gaussian_splatting ratified, glTF 2.1 Town Hall (2026-11-17), Vulkanised 2027 and Real-Time Shading Symposium 2027 announced, European entity Khronos AISBL founded 2026-09-15. [S1][S3][S19][S38]
- **W3C Immersive Web WG**: active but slow-paced (see 3.2); Apple New York F2F in May 2026 and TPAC 2026 Dublin in October. [S22]
- **Metaverse Standards Forum (MSF)**: active, and an agenda **highly isomorphic to choroweave** has appeared — "**Web of Worlds (WoW)**": treating the internet as an addressable, linkable network of spatial experiences, "pages become places, links become portals"; accompanied by the **X3D 4.1 WoW Profile**, which explicitly includes **Anchor (3D hyperlinks)** and **Inline (external scenes)** nodes; the whitepaper is published by MSF, with Threedy.io / Virginia Tech implementing. [S29][S30]
- **OMI (Open Metaverse Interoperability)**: the glTF extension subgroup still meets weekly, but output stays at Stage 0–2; `OMI_link` (the proposal closest to "portals") is **archived**. [S27]
- **BCI (non-invasive)**: consumer EEG (Muse/Emotiv/Neurable class) exists, but bandwidth and stability only reach "state/attention" level; high-bandwidth invasive systems (Neuralink etc.) are at the **clinical trial/medical indication** stage and are not consumer input devices. **The genuinely usable "neural-adjacent input" in the near term is sEMG wristbands plus eye tracking + pinch (already commercial on visionOS)**. [S31][S32][S10]
  - Constraint on the roadmap: **Phase 4 should not promise "non-invasive BCI input"**; we suggest changing it to "multimodal input (gaze/gesture/voice/EMG)", with BCI as a research-watch item only.

---

## 4. Decision recommendations (ADR level)

### 4.1 Should we bet on KHR_interactivity?

**Yes — but limited to the "in-asset behavior layer".**

- ✅ Reasons to bet: ratified (2026-08-28); a complete Babylon implementation plus the SampleViewer reference implementation; a test-asset repository; designed to be "safe + degradable + extensible"; consistent with glTF 2.1's multi-file scene direction. [S1][S2][S4]
- ❌ What cannot be bet on: **multi-user sync** (the specification is explicitly single-user), **UI/complex scripting** (explicitly excluded), **portals/spatial links** (no standard; OMI_link archived), and **world-level rules** (Turing-complete but throttled at runtime, unsuitable for business logic).
- Suggested architecture: **two layers — "KHR_interactivity (object behavior) + choroweave World Protocol (world/networking/linking)"**. Object behavior uses the standard graph; world rules use TS/WASM modules (with a restricted API injected by the host), avoiding stuffing business logic into graphs where it becomes non-portable.
- Sequencing: first use Babylon.js's `KHR_interactivity` import/execution for the v0.1 "interactive object"; use the Flow Graph Editor for visual debugging; use SampleViewer for consistency regression. **Do not build an in-house DSL compiler as v1** — wait until the World Protocol stabilizes, then evaluate whether a DSL is needed to improve the authoring experience.

### 4.2 Runtime foundation recommendation

| Candidate | Conclusion | Rationale |
|---|---|---|
| **Babylon.js** | ★ **v0.1 main runtime** | The only ratified-grade KHR_interactivity playback + editor + lossless export; WebGPU/WebGL dual backend; high WebXR maturity; Flow Graph visualization. [S5][S16] |
| **three.js** | ◐ Rendering/3DGS branch | Largest ecosystem, fast 3DGS/post-processing experiments; but **WebGPU+XR is still half-finished** (#33497 fallback, #33154 under refactor) and there is no KHR_interactivity executor. [S17][S37] |
| **PlayCanvas** | ○ Asset pipeline | Strong on WebGPU/3DGS (SuperSplat), but no KHR_interactivity; suits "asset optimization + 3DGS toolchain" rather than the main runtime. [S34] |
| **In-house engine** | ✕ Not recommended | Fighting the standard/engine ecosystem costs far more than it gains; choroweave's moat should be "spatial protocol + generation pipeline", not a renderer. |

> Engineering advice: build a **Runtime Adapter** layer on top of Babylon (scene loading, input abstraction, state allowlist, portal lifecycle), and keep the abstraction level such that "the three.js adapter can be swapped in within 3 months", avoiding lock-in.

### 4.3 Should we be WebGPU-only?

**Explicitly: no WebGPU-only.**

- Firefox Linux/Android do not default to it (Mozilla says Linux this year, Android still behind a flag); WebGPU in Quest/Pico browsers is **not verified**; the WebXR/WebGPU binding is still an **Editor's Draft**; Babylon's WebGPU-XR is experimental; three.js's WebGPU-XR has only just gained a WebGL fallback. [S14][S15][S16][S17]
- Recommended strategy: **WebGL2 by default + WebGPU enhancement after feature detection**. Use the WebGPU path first for: non-XR high-end desktop previews, 3DGS rendering, post-processing/compute-heavy effects; inside XR sessions default to WebGL2, and only switch once the WebXR/WebGPU binding reaches CR and Quest Browser explicitly supports it.
- Monitoring indicators: presence of `navigator.gpu` + whether `XRSession` exposes `XRGPUBinding` + Quest Browser release notes (reviewed quarterly).

### 4.4 Performance budget table (recommended for the engine startup check)

| Tier | Device | Triangles/frame | Draw calls | Texture VRAM | Initial payload | Per space | Target frame rate |
|---|---|---|---|---|---|---|---|
| XR-Low | Pico 4 / Quest 2 | 200–300K | 40–60 | ≤300 MB | ≤5 MB | ≤15 MB | 72 Hz |
| XR-Mid | **Quest 3** | **300–500K** | **50–80** | ≤400 MB | ≤8 MB | ≤30 MB | 72–90 Hz |
| XR-Apple | visionOS Safari | 500–800K (est.) | 60–100 | not verified | ≤8 MB | ≤30 MB | 90 Hz |
| Desktop | PC/laptop | 2–5M | 200–500 | ≤2 GB | ≤15 MB | ≤80 MB | 60 fps |
| 3DGS add-on | Quest 3 | — | — | — | — | 1–3M splats | 72 Hz |

> XR-Low/Mid in this table are engineering reductions of the native Meta budget by ×0.5–0.7 (**not official data**); visionOS and 3DGS behavior **must be calibrated on device** and are currently planning ceilings only.

### 4.5 Portal/spatial-link protocol recommendation

- **Do not wait for a standard**: KHR_interactivity contains no linking, OMI_link is archived, and glTF 2.1 external references are still a Proposal.
- **Align with MSF "Web of Worlds" and X3D Anchor/Inline semantics** (the existing standard language for "a link is a portal"), and have choroweave define a minimal portal manifest: `target` (URL/content hash), `anchor` (glTF node + transform), `handoff` (entry mode: same instance/cross instance/new session), `policy` (permissions, resource budget), `version`.
- Engineering: portal manifests as JSON + content hash; cross-server handshake over WebTransport/HTTPS; assets content-addressed + prefetched. [S29][S30]

### 4.6 12-month roadmap recommendation (summary)

1. Q4 2026–Q1 2027: v0.1 with Babylon + WebGL2 (one space + KHR_interactivity objects + single-user roaming + WebXR).
2. Q1–Q2 2027: World Protocol v0 (portal manifest + content addressing + prefetch), server-authoritative sync (WebTransport).
3. Q2–Q3 2027: 3DGS branch (SPZ/SOG chunking + non-XR WebGPU rendering), and the visionOS `<model>` degradation path.
4. Ongoing: quarterly review of the WebXR/WebGPU binding, Quest Browser WebGPU, glTF 2.1 release, and KHR_physics status.

---

## 5. Risks and unknowns

### 5.1 High risks

| Risk | Impact | Mitigation |
|---|---|---|
| KHR_interactivity has only 2 ratification-grade implementations | Narrow asset toolchain; cross-engine consistency not validated at scale | Use Babylon as the reference implementation; build a cross-engine regression asset set (SampleViewer + Babylon) |
| Specification is "single user only" + no linking standard | Multi-user co-presence/portals must be built in-house; standard leverage is limited | Build the World Protocol in-house; align with MSF WoW and push for later standardization |
| Apple's dual spatial-web tracks (WebXR vs model/Immersive API) | visionOS channel strategy is uncertain | WebXR as the main path + a `<model>`/Immersive API enhancement layer |
| WebGPU-XR not standardized + headset browser support unclear | 3DGS/high-end rendering cannot be delivered inside XR | WebGL2 as the floor; WebGPU only for non-XR enhancement |
| No official performance budget for Quest 3 browsers | Early demos may "look like they run while actually dropping frames" | Build performance-calibration scenes first (draw call/triangle/overdraw probes), then set art rules |
| 3DGS streaming unfinished (SPZ v5 roadmap) | Load time for large scenes is uncontrollable | In-house chunk + LOD index; cap splats per space |
| BCI written into the roadmap | Delivery risk and narrative risk | Switch to multimodal input; BCI as research watch only |

### 5.2 Explicit "not verified" list (do not assume when implementing)

1. The **WebGPU default state and version** of Quest Browser / Pico Browser.
2. Item-by-item support of visionOS Safari for **Hit Test / Anchors / Depth Sensing / Lighting Estimation**.
3. Quest/Pico completeness for the **WebXR AR module** (passthrough, plane detection).
4. Whether **three.js / PlayCanvas / Wonderland / Ambit** have unofficial KHR_interactivity plugins (community projects exist, maturity not verified).
5. Whether **Needle Engine**'s runtime shipped KHR_interactivity support before 2026-11.
6. The 2026 state of **MSFT_lod** cross-engine support.
7. Whether headset browsers support **COOP/COEP** (which determines WASM multithreading and SharedArrayBuffer).
8. The **exact ratification date** of KHR_gaussian_splatting (the README says Ratified, but no corresponding press release was found).
9. WebXR support in SteamVR's built-in browser.
10. The exact gzipped size of each engine's **WASM physics bundle** (not measured this round).

### 5.3 Overstated claims (to correct in external narrative)

| Popular claim | Reality |
|---|---|
| "KHR_interactivity is ratified, so the interaction standard is mature" | Ratified only means the specification is final. **There are only 2 ratification-grade implementations**, authoring tools are mainly UnityGLTF/Behave, and three.js/PlayCanvas/Godot do not support execution. |
| "glTF can now do full interactive applications" | The specification explicitly excludes UI, arbitrary scripting and multi-user; it only suits "in-asset behavior". |
| "WebXR is a cross-platform Web standard" | MDN marks it *Experimental / Limited availability*, not Baseline; Safari desktop/iOS ship it off by default; in practice only Chromium + Quest + visionOS. |
| "WebGPU is fully available in 2026" | Firefox Linux/Android do not default to it; the WebXR/WebGPU binding is still an Editor's Draft; all three engines' WebGPU-XR is experimental. |
| "visionOS fully supports WebXR" | It supports it, but the input model is a subset of transient-pointer/hand-tracking, and Apple's main line is `<model>` + Immersive API. The feature matrix is not published item by item. |
| "KHR_physics already provides a physics standard" | It is still a **Review Draft** (PR #2424) and cannot be depended on. |
| "3DGS can be dropped straight into a large VR world" | 1M splats ≈ 19–21MB (SPZ), 3.6M ≈ 66MB, 7.1M ≈ 128MB; sorting and overdraw costs are high, and streamed LOD is still on the roadmap. |
| "BCI will soon work as input" | Non-invasive only reaches state level; invasive is clinical. The near-term reality is gaze/gesture/voice/sEMG. |

---

## 6. Source list (by theme)

**glTF / Khronos standards**

- [S1] Khronos press release (2026-07-16) "glTF Interactivity Extension Submitted for Ratification": <https://www.khronos.org/news/press/gltf-interactivity-extension-submitted-for-ratification>
- [S2] KHR_interactivity specification text (Status: Complete, Ratified): <https://raw.githubusercontent.com/KhronosGroup/glTF/main/extensions/2.0/Khronos/KHR_interactivity/Specification.adoc>
- [S3] glTF extension registry (Ratified / In-progress / Vendor lists): <https://raw.githubusercontent.com/KhronosGroup/glTF/main/extensions/README.md>
- [S4] Khronos webinar page (2026-10-13, with "ratification on August 28, 2026" and "the first two independent implementations"): <https://www.khronos.org/events/practical-introduction-to-interactivity-in-gltf>
- [S5] Babylon.js official docs, KHR_interactivity (ratified wording, loading/execution/editor/lossless export): <https://raw.githubusercontent.com/BabylonJS/Documentation/master/content/features/featuresDeepDive/importers/glTF/khrInteractivity.md>
- [S6] UnityGLTF CHANGELOG (KHR_interactivity export support): <https://github.com/KhronosGroup/UnityGLTF/blob/main/CHANGELOG.md>
- [S7] Khronos glTF repository Khronos extensions directory (including KHR_gaussian_splatting / node_*): <https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos>
- [S19] glTF 2.1 Town Hall (2026-11-17, multi-file composition/bounding volumes/64-bit GLB): <https://www.khronos.org/events/gltf-2.1-town-hall>
- [S20] Godot `KHR_node_visibility` PR #93722: <https://github.com/godotengine/godot/pull/93722>
- [S21] KHR_gaussian_splatting specification README (Ratified; Known Implementations): <https://raw.githubusercontent.com/KhronosGroup/glTF/main/extensions/2.0/Khronos/KHR_gaussian_splatting/README.md>
- [S33] three.js community KHR_interactivity bidirectional-mapping experiment (unofficial): <https://github.com/rudybear/gltf-interactivity-bidirectional>
- [S38] Khronos news on founding its European entity, 2026-09-15: <https://www.khronos.org/news/press>

**WebXR / W3C**

- [S8] MDN WebXR Device API (Limited availability / Experimental): <https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API>
- [S9] caniuse WebXR (2026-10 data, 78.02%): <https://caniuse.com/webxr>
- [S22] W3C Immersive Web WG (spec status, TPAC 2026, F2F records): <https://www.w3.org/immersive-web/>
- [S36] WebKit blog (visionOS 2 WebXR support): <https://webkit.org/blog/15421/try-out-your-website-in-the-spatial-web/>

**visionOS / Apple**

- [S10] WebKit blog "Introducing Natural Input for WebXR in Apple Vision Pro" (transient-pointer / hand-tracking / the index 0-1 pitfall): <https://webkit.org/blog/15162/introducing-natural-input-for-webxr-in-apple-vision-pro/>
- [S11] WebKit blog (visionOS 26 HTML model element on by default): <https://webkit.org/blog/17118/a-step-into-the-spatial-web-the-html-model-element-in-apple-vision-pro/>
- [S12] WWDC26 "Explore immersive website environments in visionOS" (Immersive API): <https://developer.apple.com/videos/play/wwdc2026/320/>
- [S13] WebKit "WebKit Features for Safari 27.0" (WebXR texture-array layers, model element down to other platforms, Immersive API): <https://webkit.org/blog/18325/webkit-features-for-safari-27-0/>

**WebGPU**

- [S14] gpuweb official Implementation Status: <https://github.com/gpuweb/gpuweb/wiki/Implementation-Status>
- [S15] caniuse WebGPU (2026-10): <https://caniuse.com/webgpu>
- [S16] Babylon.js WebGPU support docs (including experimental WebGPU-XR): <https://raw.githubusercontent.com/BabylonJS/Documentation/master/content/setup/support/webGPU.md>
- [S17] three.js PR #33497 "WebGPURenderer: Add fallback for XR with WebGPU": <https://github.com/mrdoob/three.js/pull/33497>
- [S37] three.js PR #33154 "Simplification of the frame buffer cache for WebXR": <https://github.com/mrdoob/three.js/pull/33154>

**Performance / physics / networking**

- [S18] Meta official Unity VR performance checklist (draw calls/triangles/VRAM/overdraw): <https://raw.githubusercontent.com/meta-quest/agentic-tools/main/skills/hz-unity-code-review/references/performance-checklist.md>
- [S39] Rapier website (WASM/JS, determinism, SIMD/parallelism): <https://rapier.rs/>
- [S40] JoltPhysics.js README (7 build variants, multithreading, adopters): <https://github.com/jrouwe/JoltPhysics.js>
- [S41] physx-js-webidl (PhysX WASM bindings): <https://github.com/JeffreyCastellano/physx-js-webidl>
- [S23] caniuse WebTransport (2026-10, 92.37%): <https://caniuse.com/webtransport>

**Streaming / 3DGS / standards bodies / BCI**

- [S24] OGC 3D Tiles standard page: <https://www.ogc.org/standards/3dtiles/>
- [S25] MPEG-I Scene Description (ISO/IEC 23090-14) standard page and 2026 meeting documents: <https://www.mpegstandards.org/standards/MPEG-I/14/>
- [S26] Niantic "SPZ 4 is here" (2026-05-05, benchmark data and v5 roadmap): <https://www.nianticspatial.com/en/blog/spz4>
- [S27] OMI glTF extensions repository README (Phase 0–5, support table, OMI_link archived): <https://raw.githubusercontent.com/omigroup/gltf-extensions/main/README.md>
- [S28] PlayCanvas SOG format specification (with the Streamed SOG doc entry point): <https://developer.playcanvas.com/user-manual/gaussian-splatting/formats/sog/>
- [S29] Web3D/Anita Havele (2026-07-12) "Web of Worlds, X3D/Web3D and MSF": <https://www.web3d.org/new/blog/how-web-worlds-x3dweb3d-and-metaverse-standards-forum-tie-together>
- [S30] MSF newsroom: <https://metaverse-standards.org/news/>
- [S31] Wikipedia "Brain–computer interface" (used as an overview reference for BCI taxonomy and maturity): <https://en.wikipedia.org/wiki/Brain%E2%80%93computer_interface>
- [S32] 2026 BCI review (information-driven BCI; only the bibliographic record was retrieved, full text not obtained): <https://www.sciencedirect.com/science/article/abs/pii/S157401372600136X>
- [S34] PlayCanvas blog (WebGPU / SuperSplat / 3DGS news): <https://blog.playcanvas.com/tags/webgpu/>
- [S35] Wonderland Engine 1.5.1 release notes (2025-12-25): <https://wonderlandengine.com/news/release-1.5.1/>

---

### Appendix: Self-check list for this report

- [x] Distinguish "specification draft" from "ratified": KHR_interactivity (ratified 2026-08-28), KHR_physics (Review Draft), KHR_audio_graph (Proposal), WebXR/WebGPU Binding (Editor's Draft), WebGPU (a browser capability, not a W3C REC).
- [x] Distinguish "experimental flag" from "on by default": Firefox Linux WebGPU still Nightly; visionOS 1.x WebXR needs a flag, visionOS 2+ default; Safari 26 WebGPU default; Quest browser status marked not verified.
- [x] Every key conclusion has a URL; the 10 items that could not be verified are collected in 5.2.
- [x] Cross-validated the 4 facts supplied by the Lead: all adopted, with wording corrected (see 3.1.3, 3.2, 3.4).
- [x] No unverified percentages or version numbers were used; secondary inferences are all explicitly labelled "engineering estimate".
