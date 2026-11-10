# choroweave Risks, Licensing, Security and Compliance

> Status: Draft v0.1 · Baseline date **2026-11-07** · Audience: implementation team, funders, legal/security advisors, node operators
> Discipline: risk IDs `R-01…R-26` are referenced by the phases and gates in [`05`](05-roadmap.md); threat IDs `T-01…T-10`; all market figures come from [`research/04`](research/04-products-market-prior-art.md) with evidence grades **[official]** (A) / **[third-party]** (B) / **[media report]** (B–C); engineering estimates are marked **(estimate, C)**; anything that cannot be verified is written as "not verified".
> Boundary: this document owns **risk / license / security / compliance / content governance / incident response**; the business model and governance structure are in [`08`](08-open-source-strategy.md), and the intersection of the two is §11.
> Chinese version: [`../07-risks-compliance.md`](../07-risks-compliance.md)

---

## 0. One-page conclusion

1. **The most lethal risk is not technology — it is unit economics.** Spatial's stated public reason for closing its creator platform was that "the hosting and scaling costs of open multi-user 3D worlds keep rising and no sustainable model could be found" [official statement, relayed via UploadVR]; Rec Room shut down permanently on **2026-06-01** despite 150M cumulative players and a $3.5B peak valuation [official]. Both point to one conclusion: **whoever bears the hosting cost of worlds bears the risk of death**. The countermeasure is written into the protocol from day one (self-hosted nodes + an optional hosting service), see §3.
2. **The second risk is demand-side mismatch.** 2025 VR/MR headset shipments are projected at **-42.8%**, Vision Pro at ~**45k units** for the year, and Quest at **-16%** year over year in the first three quarters [third-party IDC]. No VR-first path is supported by the data; choroweave's P0–P3 all default to web/desktop entry ([`05`](05-roadmap.md) §1.2).
3. **The third risk is platform squeeze and the time window.** Roblox Q3'26 DAU **138M**; Astrocade **20M+ participating users in 8 months / 5M MAU / $56M raised**; Bitmagic GDK aimed directly at coding agents; Marble pushing "text → persistent 3D asset" to **$0.12–2.48/world** [official + third-party]. Window estimate: 12–24 months ([`research/04`](research/04-products-market-prior-art.md) §6.2).
4. **Supply-chain risk is a certainty**: the Hunyuan3D open weights (2.1/Omni/Part) and HY-World 2.0's community license **exclude EU/UK/KR** and carry a **1M MAU re-licensing** clause [official]; Hyperfy is **GPL-3.0** with a low-maintenance main repo [GitHub API]. Both are excluded from the default path by 02's ADRs, but they must be **continuously** isolated at the provider layer and in CI (§4).
5. **Security and governance are the entry ticket for an open protocol.** Roblox's trust-and-safety spend in Q3'26 was **16% of revenue (+110bps YoY)** [official] — governance is not a moral cost, it is an operating cost. choroweave's approach is "private by default + access gates + reporting + ratings + a node liability boundary"; the protocol does not host content (§5–§6).
6. **Legal is designed around "data minimization + private by default + role separation"**: GDPR/COPPA/DSA obligations fall as far as possible on node operators (the content-responsible party) and on hosting-service contracts; if a public-facing generative service launches in China, filing and security assessment must be evaluated separately (§7–§8). **No BCI commitments** — only multimodal input (§9).

---

## 1. Roles and responsibility codes

| Code | Role | Responsibility in this document |
|---|---|---|
| PL | Project lead | Final decision on risk acceptance/transfer; chairs gate reviews |
| TL | Tech lead | Technical risk mitigation, architecture-level security decisions |
| CL | Compiler/generation lead | R-03 generation quality, R-07/R-09 generation licensing and provenance |
| RL | Runtime lead | R-01/R-04/R-05 runtime and performance, R-17 behavior-graph sandbox |
| SL | Protocol/security lead | R-18/R-19/R-20/R-21 threat model, security response |
| CO | Community/operations | R-14/R-15/R-22 community and content governance, report queue |
| LG | External legal counsel | R-07/R-08/R-09/R-23 licensing and legal opinions (this document is not legal advice) |
| FO | Finance/operations | R-11 unit economics, R-25 cash flow |
| EX | External security auditor | P4 audit, SBOM review |

---

## 2. Risk register

> Probability/impact are **current judgement (C)** and are updated at each gate review; a "trigger signal" is an observable event, not an assumption.

### 2.1 Technology and runtime (R-01…R-06)

| ID | Risk | Probability | Impact | Mitigation | Trigger signal | Owner |
|---|---|---|---|---|---|---|
| **R-01** | The `KHR_interactivity` ecosystem is too narrow: as of 2026-11 only Babylon.js and glTF-Sample-Viewer have ratified-level implementations; three.js/PlayCanvas/Godot have no executor [official Khronos workshop] | High | Medium | Babylon as the only primary runtime; maintain a cross-engine regression asset set; Flow Graph visual debugging; do not treat L0 as world logic | Third-party engines still have no executor; Babylon shows systematic conformance defects | RL |
| **R-02** | Multi-user sync + portal traversal + self-built avatar complexity exceeds a small team (precedent: Third Room stopped updating after 2023-08; MSC3815 is still WIP) | High | High | P0 ships only the portal state machine; the P2 room server is capped at 20 CCU; sync whitelist (JSON Pointer); use the Colyseus skeleton if necessary | 20-person load tests keep failing mid-P2; the sync bug count does not converge | SL/RL |
| **R-03** | Generation quality misses "playable": CEGame-Bench end-to-end completion rate is only **16%** across five engines (mean 295 steps/65M tokens) [official]; Astrocade is criticized by Naavik as "an aggregator of game demos" [third-party] | High | High | Skeleton-first + kit + verify-repair loop ≤3 rounds + template fallback; `PR-20` gate; no promise that "any idea works first time" | `PR-20` <50%; first-pass rate `FPR` <40%; eval variance >1.5 points | CL |
| **R-04** | No official performance budget for headset browsers: Quest 3's ≤150 draw calls/<1M triangles is a native Unity budget; browser WebXR needs a further 0.5–0.7 multiplier (engineering estimate) [official budget + C] | Medium-high | Medium | Compile-time budget check (`weave-check --budget`) + runtime probes + automatic LOD degradation; calibrate all three tiers on device before P4 | Quest 3 measured frame-time p95 >20% over budget; dropped-frame rate >10% | RL |
| **R-05** | WebGPU-XR is not standardized: the WebXR/WebGPU Binding is still an Editor's Draft, Babylon's WebGPU-XR is self-labeled experimental, and the WebGPU status of Quest/Pico browsers is not verified | High | Medium | **WebGL2-first**; WebGPU only as a non-XR enhancement; quarterly review | A browser ships production WebGPU-XR support; or headset browsers enable WebGPU by default | RL |
| **R-06** | 3DGS/neural rendering is over-promised: SPZ v5 streaming LOD is still on the roadmap and 1M splats ≈19–21 MB [official]; real-time neural rendering raises cost by an order of magnitude | Medium | Medium | 3DGS is scheduled only as a P3 visual enhancement and only as pre-generated background layers; it never enters the runtime state machine (ADR-11) | Someone writes 3DGS/world models into a "P1 selling point" or a quote | PL/RL |

### 2.2 Supply chain and licensing (R-07…R-10)

| ID | Risk | Probability | Impact | Mitigation | Trigger signal | Owner |
|---|---|---|---|---|---|---|
| **R-07** | Hard constraints in the Hunyuan licenses: Hunyuan3D 2.1/Omni/Part and HY-World 2.0 exclude **EU/UK/KR** and trigger re-licensing at **1M MAU**; 3.x has no public weights [official LICENSE] | High (certain) | High | Default is `provider-trellis` (TRELLIS.2, MIT); `provider-hunyuan` is optional, off by default, its weights are not distributed with npm, with geofencing + MAU monitoring + legal review | The default provider list changes; EU/UK/KR traffic share >0.5%; registered users approach 1M | CL/LG |
| **R-08** | GPL/AGPL contamination: Hyperfy v2 is **GPL-3.0** [GitHub API]; copying any of it into a core package would force the reference implementation to GPL | Medium | High | No fork; only adapters behind a "separate process + network/protocol boundary" (each under its own license); CI license scan is a hard block; legal opinion on the boundary (this document is not legal advice) | GPL/AGPL appears in the dependency tree; a contributor PR contains GPL code | TL/LG |
| **R-09** | Upstream copyright and training-data risk for generated assets: TRELLIS.2 explicitly uses Objaverse-XL; training-set licensing is mixed and commercial output may inherit upstream risk (an industry-wide unsolved problem; model cards under-disclose it) [official + C] | Medium | Medium-high | Record `provenance` (model/version/license/parameters/source) with every World Bundle; the official showcase uses only CC0/CC-BY inputs; hosting ToS require users to warrant their asset rights; enterprise deployments may use internally trained models | A DMCA/takedown notice arrives; an enterprise customer asks for copyright indemnity | CL/LG |
| **R-10** | Dependency supply chain: npm poisoning, upstream abandonment (the Hyperfy main repo has had no commits since 2025-12), build-machine compromise | Medium | High | Lockfile + dependency admission list + controlled upgrades via Renovate + SBOM diff + release signing (npm provenance) + least-privilege CI | `pnpm audit` reports high; upstream unmaintained for 6 months | TL/SL |

### 2.3 Market and unit economics (R-11…R-16)

| ID | Risk | Probability | Impact | Mitigation | Trigger signal | Owner |
|---|---|---|---|---|---|---|
| **R-11** | Unit-economics failure (the #1 killer): hosting cost rises with scale while revenue does not. Spatial's open letter and Rec Room's 30¢/70¢ structure are direct evidence [official + media report] | Medium-high | Fatal | The protocol bears no hosting cost; self-hosting by default; monetization only "hosting service / enterprise deployment / support" ([`08`](08-open-source-strategy.md) §7); cost red lines in §3 | Monthly hosting cost per world > revenue; room-open rate >40% with still no paid conversion | FO/PL |
| **R-12** | Insufficient VR demand: 2025 headset shipments **-42.8%**, Vision Pro 45k for the year, Quest -16%; smart glasses +211.2% over the same period [third-party IDC] | High | Medium-high | Web/desktop first; progressive WebXR enhancement; visionOS dual-track; Steam Frame (SteamVR **5.49%** in its launch month) as an observation point only [third-party] | Someone proposes a "VR-first" product or fundraising narrative; headset channels become the growth bottleneck | PL |
| **R-13** | Platform squeeze: Roblox (138M DAU, "Roblox Everywhere"), Fortnite/UEFN (creators account for 47% of time), Astrocade (5M MAU), Bitmagic (agent-first GDK), Marble ($0.12–2.48/world) [official + third-party] | High | High | Do not build "a better Roblox"; build cross-domain portability + self-hosting + platform interoperability (glTF/VRM export); claim the position within 12–24 months | Any giant ships a "cross-world link / exportable world" standard; a platform opens UGC export | PL |
| **R-14** | The "metaverse" label is a liability: the 2024–2026 media narrative is strongly negative (Rec Room/Horizon/Decentraland) | High | Medium | Use "open addressing for space / a distribution protocol for 3D content / DNS+HTTP between worlds" consistently; ban "metaverse" as the primary narrative | "Metaverse platform" wording appears in a launch or fundraising deck | CO |
| **R-15** | Missing discovery causes cold start: Hyperfy has 310★ and a fork/star ratio of 0.38, showing that "deployable" ≠ "people come" [GitHub API] | High | High | P3 discover/index + showcase + creator program ([`08`](08-open-source-strategy.md) §5); node health and event calendar as optional protocol fields | Median 7-day entries for public worlds <10; third-party nodes <5 | CO |
| **R-16** | Standards captured/absorbed by big vendors: the MSF WoW agenda already exists and `KHR_interactivity` is already adopted; giants can add cross-world links incidentally | Medium | Medium-high | Submit `CHW_` mappings to OMI Stage 1 and MSF early; establish the de facto standard through the conformance suite and reference implementation; keep the "lightweight profile" position | A big vendor publishes an incompatible portal spec; a competing portal proposal appears at OMI | TL/PL |

### 2.4 Security, content governance and law (R-17…R-24)

| ID | Risk | Probability | Impact | Mitigation | Trigger signal | Owner |
|---|---|---|---|---|---|---|
| **R-17** | UGC behavior-graph abuse: `KHR_interactivity` is Turing-complete and the spec requires runtime throttling [official]; a malicious graph can exhaust CPU/memory and read or write JSON Pointers out of bounds | Medium-high | High | Execution quotas (nodes/instructions/duration) + static validation (no undeclared extension references) + JSON Pointer whitelist + capability negotiation; L2 WASM arrives in P3 and is off by default | A behavior graph pushes frame time >100ms or OOMs a node; out-of-bounds pointer writes | RL/SL |
| **R-18** | Portal phishing and cross-node trust: forged targets, lookalike domains, auto-confirm by default, abused cross-origin identity handoff | High | High | The target domain is **always visible**; https-only (optional DID); manifest signature (ed25519) + content hash; confirmation by default (auto-confirm configurable but must be explicitly enabled); portal `policy` allowlist; rollback on failure | Complaints about "auto-redirect to an unknown domain"; signature verification failure rate rises | SL |
| **R-19** | Identity forgery and key management: `did:web` depends on domain + TLS; domain takeover, key leakage or replay means identity compromise | Medium | High | Passkey preferred (device-bound); `did:web` key rotation and revocation; separate node and user signing keys; random login challenge; second confirmation for sensitive operations | Domain takeover incident; anomalous-login/replay alerts | SL |
| **R-20** | Asset poisoning: malicious GLBs (parser vulnerabilities, oversized assets, decompression bombs, embedded external URLs triggering SSRF, texture decode bombs) | Medium-high | High | Validation on both upload and load; size and dimension caps; disable external references and scripts; parse in an isolated Worker/process; CSP + sandboxed iframe; content-hash pinning | Parser crash/OOM; external request logs appear; CVE advisory | SL |
| **R-21** | Room abuse: harassment/stalking, access-gate bypass, resource exhaustion, malicious WSP packets | High | Medium | Room permission model (open/ring/allowlist/private); mute/kick/ban; rate limits and packet-size caps; per-room resource quotas; audit logs | Report rate rises; abnormal CPU/bandwidth for a single room | SL/CO |
| **R-22** | Content governance and minors: an open protocol does not mean governance-free; Roblox's T&S spend at **16% of revenue (+110bps)** [official] shows the cost is real | High | High | Private by default + access gates + reporting + ratings + minor protection (§5–§6); the node liability boundary written into hosting ToS | A regulator inquiry; media coverage of an incident involving minors; a node receives a flood of reports | CO/LG |
| **R-23** | Legal compliance: GDPR (self-hosting blurs controller/processor), COPPA (<13), DSA (notice-and-action), China (generative-AI filing/security assessment, minors, cross-border data) | Medium | High | Data minimization + private by default + role separation (§7–§8); DPA/privacy-policy/reporting-process templates; in China, self-hosting only by default, no public-facing generative API | Formal operations in the EU/US/China; an enterprise customer asks for a compliance questionnaire | LG/PL |
| **R-24** | BCI ethics and narrative risk: non-invasive EEG reaches only the state level and invasive BCI is clinical; putting BCI on the roadmap creates both delivery and ethical risk [official/review] | Medium | Medium | **No BCI input commitment**; P4 does multimodal only (eye tracking/gestures/voice/sEMG); no neural or physiological data collection; the narrative states "no neural interface" | "Brain-computer interface" appears as a selling point in fundraising or launch materials; someone asks to collect EEG | PL |

### 2.5 Organization and community (R-25…R-26)

| ID | Risk | Probability | Impact | Mitigation | Trigger signal | Owner |
|---|---|---|---|---|---|---|
| **R-25** | Team/funding: single points of failure and runway; Webaverse shut down in 2023 after its funds were stolen and funding stopped [media report] | Medium | High | A 3-person squad runs to G1 before deciding on expansion ([`05`](05-roadmap.md) §4.1); diversified custody + multisig; quarterly runway review; two people familiar with every critical module | Runway <9 months; a core member leaves | PL/FO |
| **R-26** | Community/contributor attrition: open-source metaverse communities are "small toolchains", not "big communities"; the Hubs community edition has **1,224 open issues** backlogged [GitHub API], showing maintainers are scarce | Medium-high | Medium | Contributor ladder + good-first-issue + biweekly community call + explicit RFC response SLA ([`08`](08-open-source-strategy.md) §3); do not promise interfaces that cannot be maintained | External PR response >7 days; two consecutive months with no external contributions | CO |

---

## 3. Unit economics stress test (estimates)

> Everything here is an **engineering estimate (C)**, meant to expose the cost structure, not to forecast finances; unit prices were not individually verified.

### 3.1 Assumptions

| Parameter | Value | Basis/notes |
|---|---|---|
| World Bundle size | 30 MB for the standard tier | XR-Mid "per space ≤30 MB" budget ([`02`](02-tech-selection.md) §3) |
| Average egress per visit | **8 MB** | First visit 30 MB, repeat visit 3 MB, first visits ~20% (meshopt/KTX2 compression + CDN cache); this assumption makes "bandwidth <$1 per 1,000 visits" hold (§3.4) |
| Visits per world per month | 500 | Long-tail median; top worlds 10k+ |
| Egress unit price | $0.06/GB | CDN/object-storage range $0.02–0.12/GB (not price-verified) |
| Static hosting | $0–5/world/month | Small object storage + free tier is often 0 |
| Room server | $5–20/world/month | CPU cloud host at the 50–100 CCU level; derived in [`research/02`](research/02-generative-3d-and-agents.md) §4.2 |
| Room-open rate | 20% | P2 early is dominated by event worlds |
| Voice (LiveKit) | ≈$0.4/open room/month | 40 kbps/person × 20 people × 20 h ≈ 7.2 GB; negligible |
| Generation (one-off) | $2–6/world | Standard tier; H100 $2–3/h (not individually price-verified) |

### 3.2 Scale table (10 / 100 / 1000 worlds)

| Scale | Static egress/month | Room servers/month | Index/ops/month | Total/month (estimate) | Per world/month | One-off generation cost |
|---|---|---|---|---|---|---|
| **10** | 10×500×8MB = **40 GB** ≈ $2.4 | 2 open worlds × $5–20 = $10–40 | $0–20 | **$13–65** | $1.3–6.5 | $20–60 |
| **100** | 400 GB ≈ $24 | 20 × $5–20 = $100–400 | $30–80 | **$154–504** | $1.5–5.0 | $200–600 |
| **1000** | 4 TB ≈ $240 | 200 × $5–20 = $1,000–4,000 | $100–300 | **$1.3k–4.5k** | $1.3–4.5 | $2k–6k |

**How to read this**: static hosting and bandwidth are the **minor** cost items; room servers (worlds with people present at the same time) dominate, and they grow with the **room-open rate**, not the world count. This is exactly the cost structure that killed Spatial — **it is not that traffic is expensive; it is that "continuously available multi-user instances" are expensive**.

### 3.3 Comparison calculations against Rec Room/Spatial

- **Take-rate model example (estimate)**: a world with 100 monthly actives, a **2%** paid-conversion rate (Rec Room measured <2% [media report of official data]) and ARPPU $5/month → $10 monthly GMV. Under the UGC-item structure the platform keeps only about **30 cents per dollar** (after a 30% store fee + creator share) → the platform gets **$3/month**; if that world opens rooms, hosting costs $2–6/month, plus a governance share → **gross margin roughly -$3 to +$1**. Conclusion: **below a 2% paid rate a take rate cannot cover hosting + governance**; the bigger it gets, the more it loses (Rec Room's UGC revenue +70% actually diluted margin).
- **Spatial comparison**: the CEO said outright that "hosting and scaling costs keep rising... every path means passing the rising costs directly on to independent developers and small studios, which is not sustainable" [official statement, relayed via UploadVR]. choroweave's countermeasure is not "cheaper hosting" but **moving hosting responsibility out to node operators**, with the project providing only the protocol, the reference implementation and an optional hosting service.
- **Conclusion**: choroweave's revenue model must be weakly correlated with "the number of worlds" and strongly correlated with "services that are hosted" ([`08`](08-open-source-strategy.md) §7). The protocol itself is free forever.

### 3.4 Sensitivity and red lines

| Variable | Baseline | Worse case | Impact | Response |
|---|---|---|---|---|
| Egress unit price | $0.06/GB | 3× ($0.18/GB) | 1000 worlds: $240→$720/month | Acceptable; multi-CDN price comparison, Range + immutable cache |
| Visits | 500/world/month | 10× | 1000 worlds egress $2.4k/month | Still below room servers; requires content addressing + edge cache |
| Room-open rate | 20% | 60% | 1000 worlds room servers $3k–12k/month | **Main risk**; at 40% start commercializing the hosting service |
| Generation tier | Standard $2–6 | Hero $10–30 | 1000 worlds one-off $10k–30k | Restrict the Hero tier to manual/paid add-on |
| Neural rendering in the runtime | not doing | 1 GPU per session (2 hours) | per session $0.6–1.6 ($0.3–0.8/h × 2h); 200 sessions/month ≈ **$120–320/world/month** | **Red line: forbidden on the default path** (ADR-11) |

**Three hard red lines**: ① the protocol/project bears **no** default hosting cost per world; ② **bandwidth cost <$1 per 1,000 visits** (8 GB × $0.06 = $0.48, leaving 2× headroom); ③ when the room-open rate exceeds 40%, paid hosting conversion must already exist — otherwise pause recruitment of new event nodes.

---

## 4. Licensing, SBOM and supply chain

### 4.1 Layered licensing (ADR-14, supersedes ADR-12 licensing)

| Layer | License | Notes |
|---|---|---|
| Apps/runtime/node/CLI | **AGPL-3.0-or-later** | Network use must offer corresponding source; commercial hosting can request a commercial licence |
| Schemas / `weave-check` / fixtures | **Apache-2.0** | Lets third parties implement and verify the contract independently |
| Specification text (SHP/WSP) and documentation | **CC-BY-4.0** | Free to implement/commercialize, attribution required |
| Example worlds and official assets | **CC0 / CC-BY** (labeled per item) | Lowers friction for derivative work |
| Default model weights (TRELLIS.2 / Pixal3D) | **MIT** | Not distributed with the package; downloaded on demand at runtime with provenance recorded |
| Optional providers (Hunyuan / HY-World) | Tencent community license (**EU/UK/KR excluded + 1M MAU**) | Optional only, off by default, isolated in provider packages, never a core dependency |
| Third-party host adapters (Hyperfy, etc.) | Their own licenses (Hyperfy = **GPL-3.0**) | Separate process/network boundary only; no code copying |

### 4.2 Dependency admission rules

| Level | Licenses | Handling |
|---|---|---|
| **Allowed** | AGPL-3.0-or-later, Apache-2.0, MIT, BSD-2/3, ISC, 0BSD, Unlicense, CC0, CC-BY | Automatic pass, recorded in the SBOM |
| **Needs review** | MPL-2.0 (file-level copyleft), LGPL (dynamic linking only), CC-BY-SA, OpenRAIL (model/asset layer only) | Signed off by both TL and LG, recorded in [`docs/decisions/`](../decisions/README.md) |
| **Forbidden in core** | Third-party GPL-2.0-only, SSPL, BUSL, and any model licence restricting commercial use/geography/MAU as a **default** dependency (the project's own AGPL is allowed) | CI hard-fails; exceptions need PL sign-off and public disclosure |

### 4.3 Hunyuan / Tencent-family license isolation (R-07)

1. The default provider is `provider-trellis` (MIT); `provider-hunyuan` requires **explicit enablement** by the user and is not installed by default.
2. Weights are not distributed with the npm package; at runtime they are downloaded from a user-configured source and hash-verified.
3. Built-in geofencing: the provider is disabled by default for EU/UK/KR egress regions (judged from the node's egress IP/region configuration; this is **not a reliable geofence and needs legal confirmation**).
4. MAU monitoring: the project's own services complete legal review and a fallback plan (TRELLIS.2/Pixal3D) before approaching **1M MAU**.
5. HY-World 2.0 has an isomorphic license → research/self-hosted backup only, never the default generation path.

### 4.4 Asset provenance (mandatory for generated assets)

```json
"provenance": [{
  "kind": "asset",
  "tool": "trellis2",
  "version": "…",
  "license": "MIT",
  "source": "local|marble|user-upload",
  "input_rights": "user-declared|cc0",
  "seed": 42,
  "sha256": "…"
}]
```
`weave-check` treats missing provenance as a **warning** from P1 and as an **error** from P2 (newly published worlds).

### 4.5 SBOM and release gates

- Every release produces a **CycloneDX SBOM** + artifact SHA-256 manifest + license scan report, archived with the release.
- Five pre-release checks: ① license scan (0 forbidden items); ② manual review of the SBOM diff against the previous version; ③ model weights not shipped with the package; ④ provenance covers 100% of new assets; ⑤ CVE scan high/critical = 0 (or a recorded exception).
- Release signing: npm provenance / Sigstore (from P2), image signing (cosign).

---

## 5. Threat model

### 5.1 Assets and trust boundaries

- **Assets**: user identities and keys, world bundles (`world.json`/`.glb`/signatures), node hosts and certificates, room servers, the reference runtime, the build chain and CI, generation-provider credentials, telemetry data.
- **Boundaries**: browser sandbox ↔ world content ↔ local node ↔ cross-node ↔ generation provider ↔ project services.
- **Trust assumptions**: world content is **untrusted**; nodes are **semi-trusted** (self-hosted; capabilities can be declared but not verified); user identity is **anonymous by default** (unless explicitly logged in); the generation provider is an **external data-egress point**.

### 5.2 Threat table

| ID | Threat | Adversary | Impact | Control | Residual risk |
|---|---|---|---|---|---|
| **T-01** | Malicious behavior graph: infinite loops / resource exhaustion / undeclared JSON Pointer privilege escalation | World author | Node hangs, unauthorized state changes | Execution quotas (nodes/instructions/duration) + static validation + pointer whitelist + capability negotiation | Medium (Turing-complete; not fully decidable statically) |
| **T-02** | Portal phishing: forged targets, lookalike domains, inducing auto-confirm | Malicious world author | Users enter scam/malicious worlds, credentials leak | Target domain visible; https-only; manifest signature; confirmation by default; `policy` allowlist | Medium |
| **T-03** | Identity forgery/replay: domain takeover, key leakage, replayed logins | External attacker | Impersonation, asset theft | Passkey; `did:web` rotation/revocation; random challenge; separate node/user keys | Low–medium |
| **T-04** | Asset poisoning: malicious GLB, decompression bombs, external-URL SSRF, texture bombs | World author | Node/client RCE or OOM, internal network probing | Size/dimension caps; no external references; isolated parsing; CSP; content hashes | Medium |
| **T-05** | Cross-node attacks: malformed WSP packets, connection floods, forged room state | Node operator/external | Room server crash, state contamination | Packet-size and rate limits; schema validation; server authority; auditing | Medium |
| **T-06** | Room abuse: harassment, stalking, access-gate bypass | Entrant | User safety, community churn | Permission model, mute/kick/ban, reporting, audit logs | Medium |
| **T-07** | Content smuggling: bypassing moderation with assets/text/models (including minor-related risk) | Malicious user | Regulatory and brand risk | Ratings + reporting + spot checks + hash blocklist (no full scanning) | Medium-high |
| **T-08** | Supply chain: npm poisoning, upstream abandonment, build-machine compromise | External | Large-scale implant | Lockfile, admission list, SBOM, signing, least-privilege CI | Medium |
| **T-09** | Privacy: telemetry de-anonymization, IP leakage, node log abuse | Node/external | Users tracked | Data minimization, aggregated reporting, retention limits, no biometric collection | Low–medium |
| **T-10** | Generation-provider data leakage: prompts/assets uploaded to a third party | Provider/external | Creative leakage, compliance | Local generation by default (TRELLIS.2); explicit provider choice; notice before upload; enterprise private deployment | Medium |

### 5.3 Control mapping (summary)

| Control | Threats covered | Delivery phase |
|---|---|---|
| Manifest signature + content addressing | T-02/T-04/T-05 | P0 |
| Behavior-graph quotas + static validation | T-01 | P0 (validation) / P1 (execution quotas) |
| Portal domain visibility + default confirmation + policy | T-02 | P0 |
| Asset parsing isolation and caps | T-04 | P1 |
| Room permissions/reporting/audit | T-06/T-07 | P2 |
| SBOM + signing + admission list | T-08 | Continuous from P1 |
| Data minimization + aggregated telemetry | T-09 | From P1 |
| Explicit provider choice + local default | T-10 | P1 |

> The protocol-layer threat list with per-item mitigations (gates, signatures, prefetch budgets, error codes) is in [`04`](04-spatial-hyperlink-protocol.md) §13; this section's angle is **operations, ecosystem and compliance** (who is responsible, when to act), and does not repeat protocol details.

---

## 6. Content governance and reporting

### 6.1 Private by default and access-gate tiers (same vocabulary as [`04`](04-spatial-hyperlink-protocol.md) §8.3)

| Gate | Who can enter | Signature requirement | Minimum identity disclosure | Default confirmation | When to use |
|---|---|---|---|---|---|
| `private` | Holds a single-use invite token and is on the allowlist | MUST | `persistent` | always | **✅ default for new worlds** (unpublished work/home/minor-oriented events) |
| `allowlist` | Domains/DIDs explicitly listed in the node's `trust.allowlist` | MUST | `persistent` | always (first visit) | Private communities, client previews |
| `ring` | DIDs/domains with a vouch chain to the node operator (default depth=2) | MUST | `pseudonymous` | once | Cross-community crawls, invite-only events |
| `open` | Anyone with the URL | SHOULD | `anonymous` | once | Public exhibitions/showcase (must be explicitly chosen) |

- **Discoverability is separate**: `world.json` may carry an optional `indexing` declaration (from P3), **not indexed by default**; access gates and indexing are orthogonal (e.g. `open` but not indexed = reachable via link, not searchable).
- **Unsigned worlds** are treated as `unverified` ([`04`](04-spatial-hyperlink-protocol.md) §8.3): a persistent banner, carry disabled, prefetch budget halved; **a bad signature must be rejected** — only "no signature" may degrade.
- **Visitor identity** is `anonymous` by default; upgrades are requested only for `ring` and above, must be triggered by a user gesture, and must state "what is disclosed to whom" (04 §8.4).
- Private by default is both the product default and the compliance default (minors, likeness, unpublished work).

### 6.2 Content ratings

| `moderation.rating` | Display name | Applies to | Requirements |
|---|---|---|---|
| `general` (default) | All ages | All ages | No violence/horror/adult content; no unsolicited outbound links; accessible to minors |
| `teen` | Teen | 13–17 (per jurisdiction) | Mild conflict/horror elements; age gate required |
| `mature` | Adult 18+ | Adults | Not indexed by default; age gate + node policy; **minors must not enter**; excluded from the default crawl stream |

Ratings are **world-level** metadata (`world.json.moderation.rating`; [`04`](04-spatial-hyperlink-protocol.md) §5.1 defines `general|teen|mature`), declared by the author + spot-checked; nodes may **tighten** restrictions but must not go below the protocol minimum.

### 6.3 Reporting and handling flow

```
Visitor (in-world report button)
  → Node operator report queue (evidence pack: world URL, time, screenshot, report category)
  → Triage within 24h (automated dedupe + human triage)
  → Action within 72h: hide / add access gate / downgrade rating / take down / ban account / escalate (severe)
  → Author appeal (7 days) → review (CO + 1 external community representative)
  → Record + quarterly transparency report (reports / actions / median time)
```

The protocol layer defines only the `report` endpoint and the evidence-pack format (P3), **not a unified content standard** — the standard is set by node operators and local law; official showcase worlds follow the strictest standard.

### 6.4 Protection of minors

- Age gate: verified at sign-up/entry to `Teen`/`Adult`; under 13 (COPPA) / under 16 (some jurisdictions) unavailable by default or requiring parental consent.
- Private by default + no public indexing; no stranger direct messages (P2 explicitly does not do DMs; chat stays in-room).
- No personal data from minors; no biometric data; no behavior-based advertising.
- Node operators must commit to minor-protection duties in their hosting ToS (template completed before P3).

### 6.5 Node operator liability boundary

- **Protocol neutrality**: SHP does not host content and does not provide globally unified moderation.
- **Reference-implementation nodes**: the node operator is the content-responsible party (like a Mastodon instance admin); official docs provide a "minimum governance checklist" (report entry, ratings, access gates, log retention, minor policy).
- **Hosting service**: contracts specify the notice-and-action process, the DSA contact and transparency-reporting duties (the ToS in [`08`](08-open-source-strategy.md) §7).

---

## 7. Data minimization, telemetry and privacy

| Data | Collected? | Purpose | Retention | Shared |
|---|---|---|---|---|
| Passkey public key / `did:web` identifier | Collected locally by the node | Identity and access gates | Lifetime of the account | Not shared |
| Email/phone | **Not collected** (P1–P2); optional for the hosting service | Billing/account recovery | Service period | Not shared |
| Access logs (IP/UA) | Locally by the node operator | Security and abuse handling | Recommended ≤7 days | Not aggregated to the project |
| Performance metrics (frame time/load/CST) | Opt-in only, aggregated | Performance regression | 30 days | Published in aggregate |
| Behavior graphs/interaction events | Not collected | — | — | — |
| User assets and prompts | Not collected (local generation by default) | — | — | Except provider calls (explicitly chosen) |
| Biometric/neural data | **Never collected** | — | — | — |
| Minors' data | **Not collected** | — | — | — |

- Telemetry is **off** by default; enabling requires explicit consent and can be turned off at any time; data is aggregated and de-identified before reporting.
- Privacy policy and DPA template (hosting service) are completed before P2 (LG).
- Self-hosted nodes: the project never touches their data; the docs require node operators to meet their own GDPR and similar obligations.

---

## 8. Legal compliance mapping

| Regulation/jurisdiction | Applies when | Main obligations | Our design | To-do (phase) |
|---|---|---|---|---|
| **GDPR** (EU/EEA) | EU users or nodes | Legal basis, data minimization, DPIA (high risk/minors), SCCs, right to erasure | Data minimization + private by default + node operator as controller / hosting service as processor | DPA template + processing records + privacy policy (P2) |
| **UK GDPR** | UK users | As GDPR + ICO registration; note the Hunyuan license excludes the UK | As GDPR; provider region restrictions | Same as above (P2) |
| **COPPA** (US) | Collecting data from children <13 | Parental consent, no behavioral ads, deletion | Age gate + no collection + no ads | Age-gate implementation + parental-consent flow (P2) |
| **DSA** (EU) | Acting as an intermediary/hosting service | Notice-and-action, transparency reports, contact point, minor protection | Reporting flow + ratings + quarterly reports | Reporting flow (P3) + report template |
| **China** (if applicable) | Providing generative AI / online services to the Chinese public | Generative-AI service filing and security assessment, content moderation, minor protection, cross-border data | **Self-hosting only** by default; no generative API in China; no proactive operation of a content service | Legal assessment on whether to launch (before P2); if launching, a separate compliance plan |
| Japan APPI | 37% of VRChat website visits come from Japan [third-party] | Personal-information protection, cross-border transfer | Data minimization; no personal data transferred to Japan | Assessment before entering the Japanese market (P3) |
| Open-source license compliance | All code/assets | Apache/CC-BY/MIT obligations, SBOM | §4 | Continuous |

> This document **does not constitute legal advice**; before P1, LG must issue a written opinion on the Hunyuan/GPL boundaries (R-08/R-07).

---

## 9. BCI ethics

- **No commitment**: P4 does not list "BCI input"; it does multimodal input only (eye tracking/gestures/voice/sEMG), aligned with the off-the-shelf capabilities of visionOS transient-pointer and Quest hand-tracking ([`research/03`](research/03-runtime-standards.md) §3.8).
- **No collection**: neural signals, EEG and physiological parameters (heart rate/electrodermal activity) are never collected, even if future hardware makes them available.
- **If researched in future**: requires independent ethics review (IRB level) + explicit consent + local processing + no use for profiling/advertising; and it never enters the core protocol.
- **Narrative**: external materials state clearly "no brain-computer interface, no neural data"; descriptions of "immersion" focus on vision, hearing and interaction.

---

## 10. Incident response playbook

| Event | Trigger signal | 0–1 hour | 1–24 hours | 1–7 days | Owner |
|---|---|---|---|---|---|
| **World reported (severe: minors/illegal content)** | A severe category appears in the report queue | Hide the world immediately + preserve evidence | Notify the author (if safe) + escalate (if legally required) | Review, appeals, transparency record | CO/SL |
| **Node unreachable/compromised** | Health check fails, abnormal outbound traffic | Remove from the index + degrade portals to a static preview | Notify the operator, isolate evidence, recommend key rotation | Root-cause analysis, restore or retire | SL |
| **Protocol vulnerability (signature/portal/handshake)** | Security report/audit finding | Assess blast radius + disable affected features (feature flag) | Publish a security advisory + mitigation (WAF/policy) | Patch + CVE + forced-upgrade window | SL/TL |
| **Key leakage (node/project signing key)** | Anomalous signatures, key alert | Revoke + rotate + announce | Re-sign manifests, notify downstream | Post-mortem + process fix | SL |
| **Supply-chain poisoning** | SBOM diff / CI anomaly / CVE | Freeze releases + roll back to a known-good version | Scope inventory + user notification | Replace the dependency + audit report | TL/SL |
| **Generated-content incident (copyright/harmful)** | DMCA/complaint/report | Take down the content + stop the relevant provider | Legal assessment + user notification | Policy revision + eval-set additions | CL/LG |
| **Compliance inquiry (regulator)** | Inquiry letter received | Legal takes over, freeze related data | Provide materials, pause affected features if needed | Remediation + report | LG/PL |
| **Funding/runway alert** | Projected runway <9 months | Freeze non-critical spend | Evaluate the shrink-to-3-person scenario | Decide continue/pivot/close (including open-source handover) | PL/FO |

---

## 11. Boundary with 08

| Matter | 07 (this document) | 08 |
|---|---|---|
| Hosting-service terms, DSA duties | Defines obligations and processes (§6.5/§8) | Defines the product, pricing and contract shape (§7) |
| Foundation/governance | Security-response process and liability boundary (§10) | Governance structure, BDFL → committee → foundation (§8) |
| Standards submission | Legal and licensing constraints (§4) | Submission cadence, OMI/MSF path and conformance (§4) |
| Creator program | Content ratings and minor constraints (§6) | Program design, incentives and community operations (§5–§6) |
| Business-model risk | Unit economics and red lines (§3) | Revenue-line choices and "what we won't do" (§7) |

---

## 12. Risk review and gate hooks

| Gate | Risks that must be closed/verified | Evidence |
|---|---|---|
| **G0** | R-18 portal trust model, R-19 simplified identity, R-02 state machine, R-10 dependency admission | Threat model v0.1 + `weave-check` security cases |
| **G1** | R-03 generation quality, R-07 license isolation, R-09 provenance, R-04 desktop performance, R-11 first cost measurement | Eval report + license scan + cost ledger |
| **G2** | R-02 sync, R-04 headset performance, R-17 behavior-graph quotas, R-21 room abuse, R-22/R-23 governance and legal baseline | 20-person load test + red-team report + reporting flow + privacy policy |
| **G3** | R-15 discovery/cold start, R-22 governance operations, R-23 DSA, R-24 BCI narrative, R-26 community | 100 worlds/10 nodes + transparency report + crisis drill |
| **G4** | R-04/R-05 measured XR performance, R-11 cost-model recheck, R-16 standards submission, R-23 full legal review, R-25 runway | Device-matrix report + SBOM + OMI submission receipt + legal opinion |

**Review cadence**: a full-table review at every gate; R-07/R-08/R-09/R-23 are reviewed quarterly; any member may raise a new risk, and PL assigns its severity within 2 weeks.

---

## 13. Evidence index (key sources cited in this document)

- Rec Room shutdown announcement (2026-06-01), UGC take rate 30¢/70¢, paid rate <2%: `research/04` §1/§3.2 [official + media report]
- Spatial creator platform termination (2025-07-27) and the CEO's open letter: `research/04` §3.3 [official, relayed via UploadVR]
- Roblox Q3'26 data and T&S spend at 16% of revenue: `research/04` §3.1 [official]
- IDC 2025 headsets **-42.8%**, Vision Pro 45k units, Quest -16%: `research/04` §3.5 [third-party]
- Astrocade $56M / 5M MAU / 20M users in 8 months; Bitmagic GDK; Marble pricing: `research/04` §3.4 [official + third-party]
- CEGame-Bench 16% completion: `research/02` §1/§3.4 [official]
- Hunyuan3D 2.1 LICENSE (EU/UK/KR + 1M MAU), HY-World 2.0 isomorphic license: `research/02` §2.1/§5.1 [official]
- Hyperfy GPL-3.0 and maintenance cadence: `research/01` §3.3 [GitHub API]
- `KHR_interactivity` single-user / no UI / no scripts, only two ratified implementations: `research/03` §3.1 [official]
- Quest 3 native performance budget and browser derating: `research/03` §3.5 [official + C]
- 3DGS size/streaming status: `research/03` §3.7 [official]
- BCI maturity: `research/03` §3.8 [official + review]
- Webaverse fund theft and shutdown: `research/04` §4.1 [media report]
