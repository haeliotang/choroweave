# choroweave Open-Source Strategy: Repositories, Governance, Standards and a Sustainable Model

> Status: Draft v0.1 · Baseline date **2026-11-07** · Audience: contributors, community, funders, prospective hosting-service customers
> Conventions: stage names, module names and metric names are consistent with [`05-roadmap.md`](05-roadmap.md) §5.1, [`02-tech-selection.md`](02-tech-selection.md) and `internal/writing-spec.md`; market figures come from [`research/04`](research/04-products-market-prior-art.md) and carry evidence grades (**[official] / [third-party] / [media report]**); pricing and costs are **engineering estimates (C)** using the same assumptions as [`07`](07-risks-compliance.md) §3.
> Boundary: this document owns **repositories / contribution / standards / community / commercialization / governance**; risks, licensing, security and compliance are in [`07`](07-risks-compliance.md).
> Chinese version: [`../08-open-source-strategy.md`](../08-open-source-strategy.md)

---

## 0. One-page conclusion

1. **The positioning is not a platform — it is "DNS + HTTP for worlds".** Success does not depend on how many worlds we host, but on how many of **other people's** worlds and nodes are connected through SHP ([`00`](00-executive-summary.md) §5). Every design decision therefore takes "implementable by a third party" as its first principle.
2. **The protocol is free forever, the reference implementation is Apache-2.0, and the moat is the conformance suite.** As with glTF/Khronos: the barrier in protocol projects is not code but "verifiable conformance + ecosystem adoption" (02 ADR-12).
3. **No UGC take rate, no centralized hosting monopoly, no paid certification monopoly.** Rec Room (UGC take 30¢ vs first-party 70¢, paid rate <2%) and Spatial (hosting-cost open letter) have already shown that both paths lead to death [official + media report].
4. **Sustainable revenue comes only from "services", never from "licenses"**: hosting-node service, enterprise private deployment, support contracts, training, donations/sponsorship. The protocol, SDK, conformance suite and migration tools are free forever and self-hostable.
5. **The standards path has three stages**: `CHW_` in-house (P0) → OMI Stage 1/W3C CG (submitted from P1) → MSF "Web of Worlds"/Khronos glTF (P2–P4). Align with X3D 4.1 WoW's **Anchor (3D hyperlink) / Inline (external scene)** semantics; do not invent another spatial language.
6. **Cold start acquires users with "exhibition spaces" and retains them with "event crawls"** (consistent with `00` §5): 3 showcase worlds (Pixel Rooftop / Cliff Tavern / Dungeon Puzzle) + 10 creators + validation with a Japan-first community + a biweekly GitHub/Discord rhythm.

---

## 1. Positioning, narrative and differentiation

### 1.1 One sentence and three messages

> **choroweave is the "HTML compiler + HTTP + browser" of the spatial era**: it compiles intent into playable world bundles, and uses SHP to link worlds on personal nodes to each other like web pages.

External communication uses only three messages (30-second version):
1. **Worlds are addressable like web pages**: one URL = one world; linkable, cacheable, self-hostable.
2. **Compile, don't hand-build**: one sentence → skeleton-first deterministic assembly → a verifiable world bundle (not "AI generates a video").
3. **It is not our platform**: the protocol and reference implementation are open source; your world lives on your server; we take no cut and hold no content.

**Banned words** (banned as the primary narrative): metaverse, virtual real estate, on-chain assets, brain-computer interface, world models replacing engines. Reason: the 2024–2026 media narrative turned these words into liabilities (the Horizon Worlds shutdown turmoil, the Rec Room shutdown, Decentraland MANA down >98% [third-party]).

### 1.2 Differentiation (not "a better X", but "the connection between Xs")

| Competitor/reference | What it is | What we do not do | Our position |
|---|---|---|---|
| Roblox / Fortnite | Closed UGC platforms (138M DAU / 110–120M MAU) [official + third-party] | We do not build "a better Roblox" | Build **cross-platform portability**: World Bundles export to glTF/VRM and can be linked externally |
| Astrocade | Consumer AI game platform (5M MAU, monetization undisclosed) [third-party] | No feed-style consumption platform | Build a **self-hostable + interconnectable** compiler and node |
| Bitmagic GDK | Agent-first game SDK (2026-08-27) [official] | Not "another agent toolchain" | Fill in **inter-world addressing/portals/identity** (Bitmagic worlds are hosted on its own servers) |
| Marble / World Labs | Text/image → persistent 3D assets ($0.12–2.48/world) [third-party] | No world model | Be the **landing layer after generation**: addressable, enterable, composable |
| VRChat | Centralized social VR (MAU >1M, 250k+ communities) [official + third-party] | No general social platform | Build **portals across operators** (VRChat's doors are locked to its central servers) |
| Hyperfy / OMI / Hubs CE | Self-hosted worlds / interoperability vocabulary / community client | No fork (Hyperfy is GPL-3.0; Hubs is an Elixir re-stack) | Build the **addressing layer between islands**, the first implementation to interoperate |

> Basis for this judgement: the platform niche is full, the generation layer is already priced by capital (World Labs raised ~$1.23B [third-party/media]), and **the protocol layer is still empty** ([`research/04`](research/04-products-market-prior-art.md) §5 conclusion 1).

### 1.3 Definition of success (not MAU)

| Dimension | Metric | P1 | P2 | P3 | P4 |
|---|---|---|---|---|---|
| Protocol adoption | Third-party runtimes passing conformance | 1 (in-house) | 1 | 2 | ≥3 |
| Network size | Public worlds / third-party nodes | 3 / 0 | 30 / 3 | 100 / 10 | 500 / 50 |
| Network density | Cross-domain portal links (weekly) | — | 50 | 500 | 5,000 |
| Portability | Worlds successfully exported to third-party engines | 10 (internal) | 100 | 1,000 | 10,000 |

> Targets are consistent with [`05`](05-roadmap.md) §5.1 and `00` §8; the values are engineering plans (C); "cross-domain portal links" is a new observational metric (counted from P2, requiring nodes to opt in and report aggregates).

---

## 2. Repository and package boundaries

### 2.1 Repository topology

| Repository | Contents | License | Visibility | Publishing |
|---|---|---|---|---|
| `choroweave/choroweave` | **Main monorepo**: all `@choroweave/*` packages + documentation | Apache-2.0 (docs CC-BY-4.0) | Public | npm (`@choroweave/*`), Docker |
| `choroweave/spec` | SHP/WSP specification text, conformance cases, `CHW_*` extension definitions, OMI/MSF mapping docs | CC-BY-4.0 | Public | Spec version tags (v0.1/v0.5/v1.0) |
| `choroweave/weave-check` | Conformance-suite CLI (independently installable) | Apache-2.0 | Public | npm + static binaries |
| `choroweave/examples` | `pixel-rooftop`, `cliff-tavern`, `dungeon-puzzle` plus templates/kits | Example worlds CC0/CC-BY; kits CC-BY | Public | With release tags |
| `choroweave/registry` | Optional world index/discovery protocol and reference implementation (P3) | Apache-2.0 | Public | Standalone service image |
| `choroweave/hosted` | The **operations layer** of the hosting service (billing, multi-tenancy, audit console, invoicing) | Private by default | Private | Not an open-source deliverable |

**Open-source boundary principles**:
1. **The protocol, compiler, runtime, node, validation suite and migration tools are all open source**, and fully self-hostable (no "crippled open-source edition").
2. Only the "hosting-service operations layer" (billing/multi-tenancy/audit console) may be private; but its **data-export and migration APIs must be publicly documented**, guaranteeing users can leave without pain (the anti-lock-in commitment, see §7.5).
3. No open-core feature bait: the hosting service sells **operations, SLA, compliance and support**, not a license.

### 2.2 Packages and dependency direction (strategic view)

| Package | Responsibility | Dependency direction | Maintainer |
|---|---|---|---|
| `@choroweave/dsl` | Spatial-DSL AST / JSON Schema / validation | No internal dependencies | CL |
| `@choroweave/compiler` | Compile pipeline + CLI (`build/preview/publish/eval`) | dsl, assembler, provider-*, check | CL |
| `@choroweave/assembler` | glb assembly, colliders, LOD, behavior-graph generation | dsl | CL/RL |
| `@choroweave/provider-trellis` / `-hunyuan` / `-kit` | Asset-generation providers (pluggable) | No internal dependencies (protocol-isolated) | CL |
| `@choroweave/protocol` | SHP/WSP types and codecs | No internal dependencies | SL |
| `@choroweave/runtime` | Babylon wrapper, behavior-graph host, portal switching, input abstraction | protocol, dsl (types) | RL |
| `@choroweave/node` | Static hosting + room service + discovery + auth | protocol, runtime (types only) | SL |
| `@choroweave/check` | Conformance suite (`weave-check`) | dsl, protocol | SL |

**Hard rules**: `protocol` depends on nothing above it; `dsl` does not depend on the runtime; provider packages must never be reverse-depended on by `runtime`; all cross-package types pass through the public schemas of `protocol`/`dsl`. If the dependency direction is broken, CI fails.

### 2.3 Consistency with [`03-architecture.md`](03-architecture.md)

This table is the **strategic view**; the final directory structure, package split and milestone mapping take **03 §11 as the single source of truth**. If 03 conflicts with this document after finalization, this document aligns within 48 hours and records the change in §12, without editing 03.

### 2.4 Boundary with tacitweave

- Separate repository, separate release cadence (ADR-01); **no shared codebase**.
- Contract: `schemas/implicit-spatial-spec.schema.json` (ISS) is versioned; choroweave P1 uses a **mock ISS** and connects to the real ISS in P2 (consistent with `00` §10).
- Any ISS field change needs a mutually recognized RFC; choroweave must not depend on tacitweave's runtime.

---

## 3. Contribution process, RFCs and versioning

### 3.1 Contributor ladder

| Level | Requirement | Rights | Obligations |
|---|---|---|---|
| **User** | Uses/deploys | Open issues | Follow the code of conduct |
| **Contributor** | ≥1 merged PR | Open PRs | DCO sign-off |
| **Reviewer** | ≥5 merged PRs and one area of ownership | Review PRs | Respond to assignments within 7 days |
| **Maintainer** | 6 months of sustained contribution + nomination by an existing maintainer | Merge rights, RFC votes | Quarterly maintenance report |
| **Technical committee** | See §8 | Specification/architecture decisions | Conflict adjudication |

### 3.2 PR requirements

- Every commit needs a **DCO** sign-off (`Signed-off-by`); no CLA (lowering the barrier; trademarks and specification copyright are held by the project, see §8.4).
- Required to pass: unit/integration tests, `weave-check` self-check, license scan, SBOM diff, formatting, documentation updates.
- Changes need a **changeset** (version and description); changes affecting the protocol/worlds must include conformance cases.
- Generation/asset-related PRs must include `provenance` and a license declaration; example worlds must pass the budget check.

### 3.3 RFC process (specification RFCs in `choroweave/spec`, implementation RFCs in the monorepo `rfcs/` — directory per [`03`](03-architecture.md) §11.1)

| Stage | Content | Time limit |
|---|---|---|
| 0 Proposal | Issue template: problem/motivation/compatibility/alternatives/security impact | — |
| 1 Draft | `rfcs/NNNN-title.md`, including schema changes and a migration path | 2 weeks of comment |
| 2 Final comment | Enter lazy consensus | 7 days |
| 3 Accept/reject | Maintainers + technical committee (specification RFCs) vote | Announced within 7 days |
| 4 Implement | Reference implementation + conformance cases | With the release |

**What triggers an RFC**: adding/removing/changing `world.json`/SHP/WSP fields; semantic changes to `CHW_*` extensions; semantic changes to conformance cases; license/governance changes. **What does not**: internal refactors, CLI output format (but a changeset is required).

### 3.4 Versioning

| Object | Scheme | Compatibility promise |
|---|---|---|
| npm packages | SemVer; during `0.x`, minor versions may break (announced explicitly) | After 1.0, breaking changes need a major + 12 months of parallel support |
| SHP/WSP specification | `v0.1` (P0) → `v0.5` (P2) → `v1.0` (P4) | After spec v1.0: deprecated fields kept for ≥2 minors (≥12 months) |
| `CHW_*` extensions | Separate `version` field; unknown extensions **must be ignored gracefully** | Add-only; breaking semantics use a new extension name |
| World bundles | `world.json.engineVersion` + asset content hashes | Provide an "old bundle → new bundle" migration CLI; flag what cannot be auto-upgraded |

**Compatibility matrix**: at each specification release, `weave-check` generates a compatibility matrix (node/runtime/spec versions × pass status) published with the release.

### 3.5 Release cadence

- **Trunk-based**: `main` is always releasable; long-lived branches must be named `release/x.y` and created by maintainers.
- **Monthly minor** (first Tuesday of each month), **quarterly release train** (including spec/examples/docs as a whole); security fixes are hotfixed at any time.
- Every release: SBOM (CycloneDX) + artifact SHA-256 + license report + conformance results + changelog (two versions: user-facing and implementer-facing).

---

## 4. Standards path: `CHW_` → OMI → MSF/Khronos

### 4.1 Three stages

| Stage | Action | Target | Timing | Success criterion |
|---|---|---|---|---|
| 1 | `CHW_portal`/`world.json` built in-house and shipped (P0–P2) | Own ecosystem | M0–M12 | ≥3 third-party nodes use the same fields |
| 2 | Submit to **OMI Stage 1** (W3C Metaverse Interoperability CG; requires W3C CLA + JSON Schema + at least one implementation + sample assets) | OMI / W3C CG | Submitted from P1, reach Stage 1 before P3 | PR merged, Stage 1 status publicly listed |
| 3 | Submit mapping documents to **MSF "Web of Worlds"** and **Khronos glTF** (aligned with glTF 2.1 external-reference semantics) | MSF / Khronos | P3–P4 | Cited / placed on a working-group agenda |

> Basis: OMI currently has no portal extension (`OMI_link` is archived) and `OMI_spawn_point` is still Stage 1 [official]; MSF proposed Web of Worlds in 2026 with the X3D 4.1 WoW Profile (Anchor/Inline) [standards body]; glTF 2.1's external references/multi-file composition is the natural carrier for "cross-server scenes" ([`research/03`](research/03-runtime-standards.md) §3.1). **Do not wait for the standard** (OMI needs at least 1–2 years to finish Stages 3–5), but **always align semantics**.

### 4.2 Mapping table (the draft for the standards submission)

| choroweave concept | X3D 4.1 WoW Profile | OMI | Notes |
|---|---|---|---|
| World identity (HTTPS URL → `world.json`) | Addressable scene (Inline target) | Reuses `OMI_spawn_point` semantics | The primary name is the URL; `weave://` is only an alias |
| `CHW_portal` (portal node) | **Anchor (3D hyperlink)** | None (`OMI_link` archived) | Adds "entry handshake/trust/prefetch/rollback" |
| World Bundle external scene reference | **Inline (external scene)** | — | Aligned with glTF 2.1 external references |
| `CHW_collider` | — | Subset of `OMI_physics_shape` semantics | Not a dependency (KHR_physics is still a Review Draft) |
| `CHW_logic` (capability declaration) | — | — | Used for node capability negotiation |
| `CHW_avatar` (P2) | — | — | glTF humanoid first; evaluate VRM in P2 |
| Entry handshake (arrive / session token) | — (undefined by WoW) | — | choroweave's fill-in, and the focus of the submission |

### 4.3 Submission checklist

1. The JSON Schema + conformance cases (≥10) for `CHW_portal`, plus a reference-implementation report (Babylon + a third-party viewer).
2. A field-level mapping document against X3D Anchor/Inline (with differences and migration advice).
3. A minimal spec draft for the "entry handshake" (security model, failure semantics, privacy levels).
4. A citation of ISMAR 2026 "The Web of Worlds: Towards A Referential Architecture for Open Spatial Worlds" with a note on engineering differences (**no claim of priority**; see [`research/04`](research/04-products-market-prior-art.md) §3.7).
5. A conformance report (≥2 independent implementations passing).

### 4.4 What we will not do

- Invent another spatial language (SHP is a profile, not a new format).
- Propose the DSL as a public standard (the DSL is the compiler's internal IR, 02 ADR-02/03); the public contract is the World Bundle + `world.json`.
- Promise a standards timetable (the OMI/Khronos cadence is not ours to control); externally we commit only to "submit and implement".

---

## 5. Community cold start

### 5.1 Three showcase worlds (consistent with the `00` §11 choices)

| World | Type | Role | Corresponding wedge | Success signal |
|---|---|---|---|---|
| **Pixel Rooftop** (`pixel-rooftop`) | Personal space + radio + door | Flagship demo: one sentence → enter → interact → visit a neighbor | P1 exhibition/personal space | Demo video 10k views; 10 creators replicate it |
| **Cliff Tavern** (`cliff-tavern`) | Event venue (8–20 people) | The "event node" for P2 cross-community event crawls | P2 crawls | ≥1 real event per month; cross-community participation ≥30% |
| **Dungeon Puzzle** (`dungeon-puzzle`) | L0 behavior-graph gameplay + multi-door routes | Proves "gameplay without scripts"; a developer template | Developer-tools line | Reused as a template by 3 third-party worlds |

All three worlds are released under CC0/CC-BY, with source (DSL + manifest + kit) public and forkable into your own world.

### 5.2 Creator program (first 10 creators)

| What we give | What we ask | What we do not do |
|---|---|---|
| Early compiler access, 1:1 support, a showcase front-page slot, hosting credits, a small creation fund (estimate $500–2,000 per person, C) | ≥1 public world per month; permission to show their name; bug reports | **No exclusivity**, no exclusive-content requirement, no content buy-out, no take rate |

Selection criteria: independent artists with existing 3D assets (Blender/GLB/Marble output), small studios and community organizers (matching [`06`](06-mvp-spec.md) personas A/B). **Japan first**: 37% of VRChat website visits come from Japan [third-party] and the Japanese IP-event ecosystem is mature; but we do not build a "Japan-only" narrative.

### 5.3 Channels and rhythm

- **GitHub**: the main venue (issues/PRs/RFCs); a "demo day" every two weeks (online, 30 minutes: one world + one technical update).
- **Discord**: split channels (`#showcase`/`#help`/`#dev`/`#standards`); no "customer-support" promise; mutual help is encouraged.
- **Docs site**: quick start (30 minutes) + compiler manual + node operations manual + the specification.
- **Release rhythm**: one public demo + one technical blog post at every gate (G0–G4); no chasing of news cycles.

### 5.4 Launch narrative (one sentence → three minutes)

- One sentence: **"DNS + HTTP between worlds."**
- Three-minute structure: ① the problem (works can only be looked at, not walked into; worlds are locked inside platforms; platforms close); ② the demo (one sentence → walk in → push a door into another world); ③ the claim (open protocol, self-hosted worlds, portable; we take no cut).
- Material discipline: every number carries an evidence grade and a date; never cite "not verified" data ([`research/04`](research/04-products-market-prior-art.md) §6.1); never claim to have "invented spatial hyperlinks" — cite MSF WoW and ISMAR 2026 explicitly.

### 5.5 Cold-start KPIs (consistent with 05)

`W1R` week-2 return rate (P2 ≥15%, P3 ≥25%, P4 ≥35%), public worlds / third-party nodes (P3 100/10, P4 500/50), cross-domain portal links, creator-program retention (≥7 of 10 still publishing after 6 months).

---

## 6. Ecosystem incentives (not driven by take rates)

| Incentive | Form | Purpose | Cost (estimate, C) |
|---|---|---|---|
| **Templates and kits** | 10 official templates, a kit library (rooms/doors/furniture/lighting) | Lower the creation barrier; guarantee proportion and collision | Labor (1 person × 3 months) |
| **Asset packs** | CC0/CC-BY asset packs (shipped with each release) | Let "zero-asset users" ship something too | Generation cost $100–500/pack |
| **Hosting directory** | List third-party hosters/community nodes (free listing) | Give non-operators a path, without monopolizing hosting | 0 (directory) |
| **Creation fund** | Small grants (estimate $500–2,000 per project) | Seed the first showcases and templates | $5k–20k/year |
| **Event support** | Hosting tools + traffic slots for crawl events | Create a "must attend" reason (event-driven retention) | Operations labor |
| **Contributor incentives** | Credit, conference travel, swag, maintainer stipends (from P3) | Reduce single-point dependency (R-25/R-26) | $10k–30k/year (estimate) |

**Principle**: incentives reward only "connections" (new worlds, new nodes, new templates, new implementations), never "revenue". No "in-platform transaction take rate" as a revenue or incentive source.

---

## 7. Sustainable model (business model)

### 7.1 Explicitly not doing (each with an autopsy report)

| Not doing | Evidence | Consequence |
|---|---|---|
| ❌ UGC transaction take rate as the main revenue | Rec Room: first-party items keep ~70¢/$, UGC items keep only ~30¢/$, paid rate <2%; the more successful UGC is, the more it loses [media report of official data] | The bigger the scale, the bigger the loss |
| ❌ Centralized hosting monopoly | Mozilla Hubs shut down 2024-05-31; Spatial closed its creator platform 2025-07-27 (hosting cost) [official] | Cost borne by a single entity, cut first when budgets shrink |
| ❌ Paid "official certification" / license fees | Protocol adoption depends on unconditional verifiability; paid certification encourages fragmentation | Ecosystem fragmentation |
| ❌ On-chain assets/tokens/land | Decentraland MANA down >98%; unity-renderer archived [third-party/GitHub API] | Financialization replaces product iteration |
| ❌ Selling user data/advertising | Conflicts with private by default and minor protection | Compliance and trust collapse |

### 7.2 Four revenue lines

| Revenue line | Customer | What's included | Indicative pricing (estimate, C) | Start |
|---|---|---|---|---|
| **Hosting node service** | Creators/communities who cannot operate servers | One-click hosting (TLS/domain/backup/monitoring/upgrades), optional custom domain | **$9–29/world/month** (includes 20 GB egress + 1 room); enterprise tier $99–299/month | Pilot at end of P2, general availability in P3 |
| **Enterprise private deployment** | Brands/schools/museums/enterprises | Private node + SSO + audit + offline asset pipeline + training | **$15k–80k/project** (one-off) + 20% annual support | P3 |
| **Support contract / SLA** | Organizations with live events, hosters | Response times, version support, migration assistance, security advisories | **$5k–50k/year** | P3 |
| **Training and content services** | Teams/institutions | Workshops, template customization, showcase production | **$2k–15k/project** | P3–P4 |
| **Donations/sponsorship** | Community/foundations/corporate sponsors | No consideration, or brand exposure | Any amount | From P1 (GitHub Sponsors/Open Collective) |

> Pricing is consistent with the cost assumptions in [`07`](07-risks-compliance.md) §3: base hosting cost per world is $1.3–6.5/month (10–1000 worlds, estimate), so a $9–29/month hosting service has gross-margin room; but we **do not aim** to profit from hosting scale (avoiding the fixed-cost trap that Hubs/Spatial fell into).

### 7.3 Revenue vs. cost (illustrative, estimates)

- Hosting service: monthly cost per world $1.3–6.5 (including room-server share), priced $9–29 → gross margin roughly 55%–80% (excluding labor and support).
- Enterprise deployment: $15k–80k one-off, delivery labor about 2–6 person-weeks → margin depends on customization depth; **no unbounded customization**.
- Support contracts: 15%–25% of annual fees, covering part of the time of 1–2 maintainers.
- **Break-even illustration**: a 3-person squad costs $45k–65k/month ([`05`](05-roadmap.md) §4.1); hosting 300 worlds × $19/month ≈ $5.7k/month covers only 10%. So **early funding comes mainly from donations/grants + enterprise deployment**; hosting is the long-term base, not an early lifeline. "Hosting revenue" must not be written into early financial assumptions.

### 7.4 Open-source vs. commercial boundary (anti-lock-in commitment)

1. The protocol, SDK, node, validation and migration tools are free forever and self-hostable; **core functionality is never limited for non-payers**.
2. The hosting service provides **one-click export** (World Bundle + identity + logs) and a **migration-to-self-hosted-node** script; the export API is publicly documented.
3. No "data hostages" (the world bundle format is open glTF + JSON); users are not restricted from hosting their worlds elsewhere.
4. The project takes no cut of "world content" transactions; if third-party hosters offer value-added services, they set their own prices.

### 7.5 Separation of governance and business

The commercial entity (hosting/support) is separate from the open-source project (protocol/governance): commercial decisions must not change protocol semantics; protocol changes go through the §3.3 RFC process, and the commercial party has no extra veto. The governance path is in §8.

---

## 8. Governance

### 8.1 Three phases

| Phase | Timing | Decision structure | Trigger for upgrade |
|---|---|---|---|
| **BDFL** | P0–P2 (M0–M12) | Project lead (PL) has final say; a technical committee (3 people: TL/SL/CL) advises | ≥5 external maintainers, or ≥10 third-party nodes |
| **Committee** | P3 (M12–M18) | Technical committee of 5–7 people (including ≥2 external maintainers); specification changes need a 2/3 majority | The committee runs stably for ≥6 months; ≥2 commercial hosters exist |
| **Foundation** | P4 onward (M18+) | An independent foundation or affiliation with an existing organization (candidates: MSF membership path, W3C CG, a Software Freedom Conservancy-like body); charter, trademark, fund custody | Charter signed before G4 |

### 8.2 Decision rights

| Matter | BDFL phase | Committee phase | Foundation phase |
|---|---|---|---|
| Code merges | Maintainers | Maintainers | Maintainers |
| Specification semantics (SHP/WSP/`CHW_*`) | PL + technical committee | Technical committee 2/3 | Technical committee + community review |
| Trademark/brand usage | PL | Committee | Foundation |
| Funds/grants | PL | Committee | Foundation board |
| Code of conduct/conflicts | PL | Committee (with external representatives) | Foundation |
| Commercial service pricing | Commercial entity | Commercial entity (protocol-independent) | Commercial entity (with disclosure) |

### 8.3 Code of conduct and security response

- Adopt a Contributor Covenant-style code of conduct; violations are handled by the committee, with a public appeals path.
- `security.txt` + a private disclosure channel; security advisories and CVE (if needed) follow the process in [`07`](07-risks-compliance.md) §10.
- Transparency: quarterly community report (contributor count, PR response time, reports/actions, where the money went).

### 8.4 Trademark and conformance (no fees)

- The name "choroweave / 原质之织" and the logo are held by the project/foundation; third parties may state "compatible with SHP vX" but must not imply official endorsement.
- **Conformance certification is free and self-service** (run `weave-check` and publish the report); no paid certification and no "official certification" gate. This is a precondition for protocol adoption (consistent with §7.1).

---

## 9. Release checklist

| Category | Check | Owner | Gate |
|---|---|---|---|
| Legal | License scan 0 forbidden items; SBOM generated; provenance complete; no GPL/AGPL in core | TL/LG | Blocking |
| Specification | `weave-check` passes; conformance cases updated; compatibility matrix generated | SL | Blocking |
| Security | Dependency CVE high/critical = 0 (or a recorded exception); no keys in the repo; privacy policy updated | SL | Blocking |
| Quality | Tests pass; performance regression ≤15%; eval set (P1+) meets targets | CL/RL | Blocking |
| Documentation | README/quick start/CLI manual/migration guide updated; relative links reachable; terminology consistent | CO | Blocking |
| Artifacts | npm packages, Docker image, examples, SBOM, SHA-256 manifest, changelog (user version/implementer version) | TL | Blocking |
| Community | Release announcement, demo day, Discord announcement, contributor thanks | CO | Non-blocking but must be completed within 48h |
| Compliance | If a new region/data flow is involved, legal confirmation | LG | Blocking |

---

## 10. Boundary with 07

| Matter | 08 (this document) | 07 |
|---|---|---|
| Hosting service | Product/pricing/contract shape (§7.2) | Terms obligations, DSA, liability boundary (07 §6.5/§8) |
| Standards submission | Path/deliverables/timing (§4) | Licensing and legal constraints (07 §4) |
| Governance | Structure/decision rights/trademark (§8) | Security-response process, incident response (07 §10) |
| Community incentives | Program and budget (§6) | Content ratings/minors (07 §6) |
| Business-model risk | Revenue lines and anti-lock-in (§7) | Unit-economics stress test and red lines (07 §3) |

---

## 11. Consistency check and deviations vs. 02/03

| Check | Result |
|---|---|
| Module/package names | Consistent with `internal/writing-spec.md` §2 (`@choroweave/*`, `pixel-rooftop`); `cliff-tavern`/`dungeon-puzzle` are new examples from `00` §11 and must be registered in 03's directory structure |
| Licensing | Consistent: code Apache-2.0 / spec CC-BY-4.0 / examples CC0-CC-BY (ADR-12) |
| Standards path | `CHW_` → OMI Stage 1 → MSF/Khronos is consistent with ADR-06 and `research/03` §3.8 |
| Business model | "No UGC take rate / no centralized hosting monopoly" is consistent with `research/04` §5 conclusion 3 and `00` §9 |
| **Deviation 1 (resolved)** | This document proposed that the "hosting-service operations layer may be private"; the Lead has written this back into the "open-source boundary" clause of [`02`](02-tech-selection.md) ADR-12; the anti-lock-in commitment in §7.4 is the implementation detail |
| **Deviation 2** | The private boundary of the `hosted` repo is in tension with the "fully open source" narrative; recommended external phrasing is "core fully open source; the hosting operations layer may be closed but data is migratable", to avoid being called open core |
| Open question | The foundation affiliation (new entity vs. an MSF/W3C CG membership path) must be decided before G3 ([`05`](05-roadmap.md) §9.2) |

---

## 12. Change log and first-90-days actions

**Change log**: v0.1 (2026-11-07), first draft.

**First 90 days (M0–M3) action table**

| Week | Action | Output | Owner |
|---|---|---|---|
| W1–2 | Create the `choroweave/spec` repo and RFC templates; publish the SHP v0.1 draft | Spec + a working RFC process | SL |
| W2–4 | Finalize the three showcase worlds (Pixel Rooftop / Cliff Tavern / Dungeon Puzzle); creator-program recruitment page | Shortlist + expressions of interest | CO |
| W3–6 | Land the open-source repo structure (monorepo + CI + license/SBOM checks) | CI green | TL |
| W4–8 | Launch narrative package (the technical blog post "DNS and HTTP for Worlds" + a 3-minute demo script) | Blog + video script | CO/PL |
| W6–10 | OMI submission prep: `CHW_portal` Schema + conformance cases + first mapping draft | Submission draft (internal review) | SL/LG |
| W8–12 | Discord/GitHub cold start: demo day #1, 20 good-first-issues | ≥5 first external contributors | CO |
| W10–12 | Commercial-boundary document: hosting-service terms draft (aligned with 07 §6.5) | Terms v0 | LG/FO |
