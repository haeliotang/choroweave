# choroweave Research 04: Comparable Products, Market Signals, Failure Precedents, and Community Ecosystem
> **Chinese version**: [04-products-market-prior-art.md](../../research/04-products-market-prior-art.md) — Chinese original; this page is its English translation.
>
> **Purpose**: to judge timing, form-factor priority (VR-first vs Web-first), the failure modes that must be avoided first, and the differentiation wedge for choroweave ("compile natural-language intent into walkable / interactive / multi-user 3D scenes + a spatial hyperlink protocol + interconnected personal servers").
>
> **Verification basis**: every "current" figure in this document is labelled "verified as of 2026-11". Search and retrieval took place on 2026-11-07.
>
> **Evidence grading** (used uniformly throughout):
> - **[Official]** = the company/platform's own filings, shareholder letters, official blog, official X/announcements, GitHub API metadata.
> - **[Third-party]** = independent research firms or data providers (IDC, Sensor Tower, Appfigures, the Steam Hardware Survey, Steam concurrent-player trackers, third-party research blogs), or reporting that fully restates a source together with its statistical basis.
> - **[Media-reported]** = news coverage whose original source may not be verifiable (including Bloomberg / CNBC / WSJ items restated second-hand).
> - **[Not verified]** = no primary or credible secondary source could be found; **never used to derive any conclusion**.
>
> **Important methodological note**: this report deliberately separates "user scale" from "commercial loop". In 2025–2026 many 3D platforms hit record user numbers while revenue declined or the product shut down (Roblox, Fortnite, Rec Room all did), so a single MAU figure cannot be the basis for a timing judgment.

---
## 1. TL;DR (10 items)
1. **"The metaverse is dead" is a false premise; "general-purpose 3D social space" is what actually died.** Roblox Q3'26 DAU 138M, quarterly hours near 34B [Official]; Minecraft MAU 155M (all-time high) [Official]; Fortnite about 110–120M MAU [Third-party]. Yet Rec Room (150M cumulative players, $3.5B valuation) shut down permanently on 2026-06-01 [Official], and the VR version of Meta Horizon Worlds was at one point announced for closure [Media-reported]. **The scale is there; the business model is not.**
2. **Rec Room died of its "take-rate structure", not of "not enough users".** The first-party item store leaves ~70 cents per dollar; UGC items leave ~30 cents per dollar; UGC revenue +70% YoY actually kept diluting gross margin; paying users were <2% [Media-reported official data]. The more successful UGC is, the more you lose — the easiest trap for a "spatial internet".
3. **VR hardware fell off a cliff in 2025, it did not recover.** IDC: total 2025 headset shipments forecast at **-42.8%**; Vision Pro only 45,000 units for the year (390,000 in 2024); Quest 1.7M in the first three quarters, -16% YoY [Third-party IDC, via The Register]. Over the same period smart glasses were +211.2%. **"VR-first" has no data support at 2026-11.**
4. **But pure Web-first also has a post-mortem.** Mozilla Hubs (2018–2024-05-31) shut down with 116K avatars / 216K scenes / ~10M visits cumulatively [Official]; Third Room's last commit was 2023-08 [GitHub API]. **The problem is neither "Web" nor "VR"; it is "who pays for the servers".**
5. **VRChat proves a narrow but hard path: modest MAU + high ARPU + strong community + cross-platform.** MAU >1M [Third-party Sensor Tower], peak concurrent 158,192 [Official], 250K+ active communities [Official], creator revenue share up to 50% [Official], mobile launched 2025-10 and explicitly "no VR device required" [Official]. **Its MAU is only a fraction of Rec Room's cumulative players (different bases; magnitude illustration only), yet it is still alive.**
6. **A world model ≠ a world.** Roblox stated in 2026-05 that standalone world models "lack the long-term memory, consistent logic, and structured user input required for a massive multiplayer platform", and therefore chose a hybrid **Engine + Video Model** architecture (Roblox Reality, targeting 4K@60, late 2026–early 2027) [Official]. Marble's output is an **asset package to be imported into Unreal/Unity/Blender** (Gaussian splat + collision mesh), not an operable world [Third-party compilation].
7. **The real state of AI game-generation platforms: real traffic, zero monetization, questionable quality.** Astrocade: 20M "participating users" in 8 months, 5M MAU, 140M plays per month, $56M raised [Official + Third-party Naavik], but **no virtual currency / in-app purchase / subscription has been announced**, and Naavik criticized it as "an aggregation of game demos, clunky controls, lacking progression depth". Publishing delays run up to a week.
8. **Spatial hyperlinks / open spatial architecture already has occupants on the standards and academic side.** The Metaverse Standards Forum (MSF) proposed the **"Web of Worlds (WoW)"** agenda in 2026 — "pages become places, links become portals" — with the **X3D 4.1 WoW Profile** explicitly containing **Anchor (3D hyperlinks)** and **Inline (external scenes)** nodes, implemented by Threedy.io / Virginia Tech [Standards body]; the ISMAR 2026 XWORLDS workshop also has "The Web of Worlds: Towards A Referential Architecture for Open Spatial Worlds" [Academic]. **choroweave's SHP must map to WoW/X3D Anchor semantics rather than inventing another language.**
9. **The open-source metaverse community is "a small toolchain", not "a large community".** Hyperfy 310★/117 forks/30 open issues (repo created 2024-12) [GitHub API]; OMI 329★, last commit 2025-10; Third Room 656★ but stalled for 3 years; the Hubs community edition 2,223★ but with a backlog of 1,224 issues. **"Open source automatically brings an ecosystem" does not hold; a measurable onboarding path must be designed.**
10. **Timing judgment: Web-first + progressive desktop/mobile + optional VR entry is the only path supported by data.** The new 2026 variable is Valve's **Steam Frame** (released 2026-09-15, a SteamOS standalone headset, taking 5.49% of SteamVR and 5th place in its first month) [Third-party Steam survey, via moguravr] — showing that "an open headset in the PC ecosystem" is a small window that is opening, but not the main battlefield.

---
## 2. Product / project inventory
### 2.1 Virtual social / spatial products

| Name | Type | Scale data (verified as of 2026-11) | Relation to choroweave | Evidence |
|---|---|---|---|---|
| **Roblox** | UGC game platform (cross-platform) | Q3'26 DAU **138M** (+12% QoQ); quarterly hours near **34B** (+17% QoQ); revenue **$1.572B** (+15.6% YoY); bookings **$1.7B** (-12% YoY); Q3'26 net loss $230M [Official] | The strongest "space-as-a-platform" reference, and also the biggest squeezer. Its "Roblox Everywhere" (creators can publish Roblox games independently to any app store) directly collides with the "open distribution" narrative | Shareholder letter ex99.1; Q3'26 earnings call |
| **Fortnite / UEFN** | UGC game platform | 650M registered; MAU about 110–120M (Q1'26); 2025 revenue about $6B (analyst consensus) [Third-party]; layoffs of >1,000 in 2026-03; cumulative UEFN creator payouts **$1B** (since 2023, confirmed by Epic 2026-06-17); creator islands account for **47%** of player hours (2026-05; 38% a year earlier) [Third-party + official wording] | Proves "UGC content can eat more than half of a platform's hours", while the platform's own retention is declining | Axis Intelligence 2026-07 compilation; Epic official disclosure |
| **Minecraft** | Sandbox world (no central world graph) | Lifetime sales **425M** (Xbox CEO, 2026-09-26); MAU **155M** (Microsoft earnings call 2025-10-29, all-time high); no official DAU [Official] | Counter-evidence that "a de facto multi-world network forms without any hyperlink protocol" (server addresses = de facto standard), though the UX is crude | Host Havoc 2026 compilation (restating Microsoft executives) |
| **VRChat** | Social VR platform | MAU **>1M**; peak CCU **158,192** (2026-02 Japanese virtual concert); average daily CCU ~100K; 250K+ active communities; creator revenue share up to 50%; Japan users up 3.9×; Steam lifetime downloads >5.3M [Official + Third-party Sensor Tower] | The closest living practice of "portals between worlds" (World links + Portal props), but worlds are hosted on central servers | Official X data (2026-05); Sensor Tower report |
| **Rec Room** | Social VR + UGC | **150M cumulative players**; **$294M** raised, peak valuation **$3.5B**; paying users **<2%**; **permanent shutdown 2026-06-01**; Snap acquired some assets the same day [Official + Media-reported] | **The most important failure example**: cross-platform lowering of barriers → largest scale → worst unit economics → death | Rec Room official announcement; Hypergrid Business; VR陀螺 |
| **Resonite** | Social VR / creation | Steam currently 136 players, 30-day average 155, 30-day peak 298 [Third-party] | The ceiling sample of the "technical idealism" route (NeosVR's successor) | live-player-count.com |
| **Second Life** | Virtual world | 2026 official MAU **not verified** (Linden Lab does not disclose); the platform is still operating | The original paradigm of "personal land + teleport"; proves long-term survival is possible, and also proves its growth ceiling | — |
| **Spatial** | 3D space / galleries | Creator platform (Free/Pro) **terminated 2025-07-27**: world hosting shut down, assets deleted; only enterprise customers retained; the CEO stated plainly that "the cost of hosting and scaling open multiplayer 3D worlds kept rising and no sustainable model could be found" [Official statement, via UploadVR] | **Hits choroweave's core risk directly**: hosting cost | UploadVR |
| **Oncyber** | Web3 virtual gallery | Latest 2026 status **not verified**; was a leader in Web3 spatial showcases in 2022–2023 | The commercialization ceiling of showcase-type spaces | — |
| **Decentraland** | Open virtual world (on-chain land) | Platform still operating (official blog updated through 2026-10); MANA about **$0.089** (ATH ~$5.90, a drop of >98%) [Third-party market data]; the unity-renderer repo archived 2025-09 [GitHub API]; 2026 official DAU **not verified** | The biggest counter-example to the "open + user-owned" narrative: economics before experience | CoinGlass; GitHub API |
| **Mozilla Hubs** | WebXR space | Launched 2018 → announced 2024-02-15 → **shut down 2024-05-31**; cumulatively 115,732 avatars / 215,923 scenes / nearly 10M attendances [Official]; community edition continues (2,223★/1,389 forks/1,224 open issues, last commit 2026-10-29) | The first post-mortem of the Web-first route; also a sample of "community takeover" feasibility | Mozilla official; UploadVR; GitHub API |
| **AltspaceVR** | Social VR | Launched 2015 → acquired by Microsoft 2017 → **shut down 2023-03-10**; SideQuest bought the name rights and planned a "spiritual successor" for autumn 2026 [Media-reported Wikipedia] | The typical path of big-company acquisition → shutdown; the "revival" itself became the selling point | Wikipedia/CNET |
| **Meta Horizon Worlds** | Social VR/mobile | The VR version was announced on 2026-03-19 for closure on 2026-06-15, **retracted 2 days later** (CTO on Instagram, citing users' "heartbroken" feedback); mobile cumulative downloads **45M**, 1.5M added in 2026 (+53% YoY), **total consumer spending only $1.1M** [Media-reported Appfigures]; MAU long below 200K, DAU trough below 900, most users churn within a month [Media-reported WSJ/internal report] | Even the best-capitalized player failed at a "general social world"; mobile has downloads but no revenue | BlockTempo; 17173; VR陀螺 |
| **Hyperfy** | Open-source self-hosted world | 310★ / 117 forks / 30 open issues (repo created 2024-12-22, last commit 2026-04-21) [GitHub API]; free and open source, self-hosted or via hosting providers; v1 once sold worlds one-off as Ethereum NFTs with the code largely closed; docs already cover Blender tooling and AI agent (Eliza OS) integration [Official] | **The precedent most isomorphic to choroweave**: self-hosted worlds + embeddability. Its scale proves "a protocol alone is not enough; out-of-the-box experience is needed" | GitHub API; docs.hyperfy.xyz |

### 2.2 AI-generated worlds / game platforms

| Name | Type | Scale / status (verified as of 2026-11) | Relation to choroweave | Evidence |
|---|---|---|---|---|
| **World Labs · Marble** | Commercial world model | About **$1.23B** raised cumulatively ($230M in 2024-09 at >$1B; a further $1B in 2026-02, including $200M from Autodesk; NVIDIA/AMD/Fidelity participated); TechCrunch reports a valuation near $5B (unconfirmed by the company) [Third-party/media]. Product line: Marble 1.1 Plus / 1.1 / 1.0 / 1.0 Draft; pricing about **$2.48 / $1.20–1.28 / $0.12–0.20 per world**; API 2026-01; 1.1 in 2026-04 | **The most direct technical substitute**: text → persistent 3D scene. But its output is an **asset** (Gaussian splat + 100–200K-triangle collision mesh + walkthrough video) that must be imported into Unreal/Unity/Blender to be operable; browser rendering relies on the open-source Spark (three.js) | invideo 2026-08 compilation; official pricing page |
| **Google DeepMind · Genie 3 / Project Genie** | World model → research prototype | Genie 3 announced 2025-08; **Project Genie launched 2026-01-30**, US only, Google AI Ultra subscribers (18+), a web app; includes World Sketching (with Nano Banana Pro), World Exploration, World Remixing; some Genie 3 capabilities (real-time prompt events) did not make it into the prototype [Official] | Proves the "world model → consumer web experience" path exists, but it is constrained by a **subscription wall + geography + single-player exploration**, so it is not an open spatial internet | blog.google official blog |
| **Decart** | World-model infrastructure | **$300M** raised (led by Radical Ventures) [Official]; product line DOS (inference/training stack), Lucy (immersive experience world model, Lucy 2.0 real-time world transformation), Oasis (physical AI, Oasis 3) [Official] | Offers "real-time video world" as an alternative rendering path; a potential component rather than a competitor | decart.ai/blog |
| **Odyssey** | Interactive world model | Founded 2023; **$310M** raised, **$1.45B** post-money valuation (FT report, via 智东西 / Zhidongxi 2026-06-18); investors include NVIDIA, Natural Capital, In-Q-Tel, Jeff Dean, Elad Gil [Media-reported]. Products: Odyssey-2 (2025-10), Odyssey-2 Pro (API, 720p@22fps real-time), Odyssey-2 Max (3× parameters, 10× compute, private beta; VBench 2 physics 49.67→58.52), Odyssey-3, multi-agent world model [Official] | Explicitly sells "interactive worlds" as an API — potentially a rendering backend for choroweave | odyssey.ml |
| **Overworld · Waypoint** | Real-time generated-world runtime | Waypoint 1.5 (2026-04): **720p@60fps** locally on consumer hardware, plus a 360p tier; training data about 100× v1; local runtime Overworld Biome (EXE installer); Overworld.stream for instant play; Waypoint 2 beta already exists [Official] | Its "local real-time generation" route aligns closely with choroweave's "personal server" philosophy and is worth partnering with or referencing | over.world/blog |
| **Astrocade** | AI UGC game platform | Announced **$56M** on 2026-05-05 (Series B led by Sequoia + Series A led by Sea; Google AI Futures Fund, NVIDIA, LG Tech Ventures etc. participated); officially claims **20M+** participating users in 8 months; Naavik cites **5M MAU / 75K creators / 140M plays per month**; $10M creator fund (threshold: 100K valid plays in 30 days); ~10 minutes per generation, ~2 minutes per edit; **publishing queue can be up to a week** [Official + Third-party] | **The closest consumer validation of "natural language → playable space"**; also exposes the two problems "generation ≠ fun" and "no monetization" | astrocade official blog; Naavik |
| **Roblox Cube / 4D generation** | In-platform generative tooling | Announced **4D generation** beta in 2026-02: not just static 3D but generating **functional** objects (schemas: Car-5 five-mesh car, Body-1 single mesh), and redirecting scripts to the generated object's actual dimensions; the early experience "Wish Master" generated **160K+** objects [Official] | The platform internalizes "generation" as an asset layer instead of competing with a "world protocol" — a layering choroweave should imitate | about.roblox.com |
| **Roblox Reality** | Hybrid architecture (engine + video model) | Disclosed at the 2026-04-30 earnings call, rolling out to creators late 2026–early 2027; target **4K@60Hz**; the Video Model ("Super Upsampler") runs on H200/B200 in edge data centers; **players pay a subscription, creators pay nothing extra**; in 2026-06 the Morpheus AI team (Self Forcing autoregression), Dynamics Lab, and the founder of Lucid AI joined [Official] | **The most important strategic intelligence**: the largest UGC platform judged that a pure world model cannot support a persistent multiplayer world, and chose engine-led rendering with generated pixels. choroweave's layering should match this | gamesbeat; Roblox newsroom |
| **Bitmagic** | AI game development kit | Released the **GDK** on 2026-08-27: aimed at AI coding agents (Claude Code / Codex / Cursor), a TypeScript 3D engine vendored into the project as readable source; `bitmagic dev` hot reload + editor; `bitmagic verify` launches the game in a real browser and verifies with a screenshot; one command publishes to bitmagic.ai (hosted, private by default, discoverable by players on the site); multiplayer + global leaderboards run on Bitmagic servers [Official] | **The clearest sample of "agent-first world creation"** — if choroweave builds a compiler, this route is the direct competitor | bitmagic.ai/news |
| **Rosebud AI** | AI game creation | Consumer-grade AI for making games + Rosebud Play distribution; categories (RPG/platformer/multiplayer/horror…) are complete [Official]; user scale, revenue and retention **not verified** | A peer in generative UGC; lacks verifiable scale data | rosebud.ai |
| **Scenario** | AI game art assets | An asset-generation platform for game studios [Official]; funding/valuation appear only in PitchBook/Crustdata-type database entries, exact figures **not verified** | A supply-chain layer, not a competitor | scenario.com |
| **Tencent HunyuanWorld** | Open-source world generation | HunyuanWorld-1.0 open-sourced (GitHub Tencent-Hunyuan/HunyuanWorld-1.0): generates explorable, interactive 3D worlds from text/images [Official repo]; version 1.1 open-sourced around 2026-03, with media claiming "single-GPU deployment, second-scale 3D world generation" [Media-reported] | Open weights mean "world generation" will commoditize quickly — choroweave should not treat generation quality as its moat | GitHub; ai5g restatement |

### 2.3 Hardware and distribution

| Item | Key data (verified as of 2026-11) | Evidence |
|---|---|---|
| **Meta Quest** | 1.7M units shipped in the first three quarters of 2025, **-16%** YoY; 5.6M units in all of 2024 (about $2.9B revenue) [IDC, via The Register]; Quest-related ad spend **-55%+** YoY in 2025 (Sensor Tower) [Third-party] | The Register (IDC); 17173 |
| **Apple Vision Pro** | **45,000 units** shipped in all of 2025 (zero in the first three quarters, restarting with the M5 version in Q4); 390,000 in 2024 (about $1.4B revenue); at one point halted at the supplier end; IDC forecasts 290,000 units / $636M for 2026 [Third-party IDC]; ad spend **-95%+** YoY [Third-party] | The Register (IDC + Sensor Tower) |
| **Overall VR/MR headsets** | IDC forecasts **-42.8%** shipments for all of 2025 [Third-party] | The Register (IDC) |
| **Smart glasses / AR** | AR/ER market **+211.2%** in 2025; Meta Ray-Ban Display shipped 20,000 units in Q3'25; IDC forecasts a **29.3%** CAGR for smart glasses 2025–2029 [Third-party] | The Register (IDC) |
| **Valve Steam Frame** | Released 2026-09-15; Snapdragon 8-series + SteamOS standalone headset; 100+ "Standalone Verified" games; dual radios + a dedicated Wi-Fi adapter for wireless streaming; lottery-based reservations to deter scalpers; Japan pricing ¥199,980 (256GB) / ¥244,980 (1TB) incl. tax; US starting price media-reported as US$1,059 (**currency and tax basis could not be verified directly from Valve's official page**) [Official + Media-reported] | thisisgame; moguravr |
| **SteamVR share (2026-10)** | Steam Frame **entered the statistics at 5th place with 5.49%** on its first appearance; Quest 2 share **-3.57pp** MoM; for comparison, Valve Index was only 1.46% in its first month and took about 2 years to reach 2nd place [Third-party Steam Hardware Survey, via moguravr/RoadToVR] | moguravr; RoadToVR |
| **Steam concurrency (third-party tracking)** | VRChat 2026-11-07: current 51,397 / 30-day average 45,019 / 30-day peak 67,190 [Third-party]; Resonite: 136 / 155 / 298 [Third-party] | live-player-count.com |

### 2.4 Open-source / standards infrastructure

| Project | Data (GitHub API metadata, as of 2026-11-07) | Reading |
|---|---|---|
| `Hubs-Foundation/hubs` | 2,223★ / 1,389 forks / **1,224 open issues** / created 2017-09-26 / last commit 2026-10-29 / not archived | The community edition is still maintained, but the issue backlog shows **very few core maintainers** |
| `matrix-org/thirdroom` | 656★ / 70 forks / 91 open issues / created 2021-09-21 / **last commit 2023-08-30** | Effectively stalled for nearly 3 years; the "open immersive worlds on Matrix" narrative was not delivered |
| `hyperfy-xyz/hyperfy` | 310★ / 117 forks / 30 open issues / created 2024-12-22 / last commit 2026-04-21 | The fork/star ratio is 0.38, **showing that "deploy your own copy" is the main usage** |
| `omigroup/omigroup` | 329★ / 22 forks / 13 open issues / last commit 2025-10-01 | A standards discussion group, not an implementation project |
| `decentraland/unity-renderer` | 140★ / 95 forks / 188 open issues / **archived** / last commit 2025-09-19 | Client-side strategic retreat |

---
## 3. Item-by-item analysis
### 3.1 Platform side: scale still expanding, but the "platform tax" logic is being restructured by AI
**Roblox: users and hours at record highs, while the revenue structure deteriorates.**
Q3'26 official data: DAU 138M (+12% QoQ), hours near 34B (+17% QoQ), revenue $1.572B (vs $1.360B in Q3'25, +15.6%, calculated by us), net loss $230M. [Official]
But two figures must be read together:
- **Bookings $1.7B, -12% YoY**; Q4'26 guidance is bookings **-10% to -15%** YoY with revenue +4% to +12%. [Official]
- **Developer Exchange Fees were 26% of revenue (Q3'26) vs 31% (Q3'25)**; 24% of bookings vs 22%. [Official]

In other words: Roblox is "trading a smaller creator share for higher revenue recognition", while bookings decline. The company's own explanation is the "high 2025 base" and competitive headwinds from the GTA launch. [Official, earnings call] What is genuinely worth recording for choroweave is the AI-related disclosure:
- **80% of the top 100 games used AI tools in the past month**; **two games created almost entirely by AI (Brainrot, Steal an Egg) entered the Q3 top 20 by concurrency**; **40% of the top 1000 games were published in the past 90 days**. [Official, earnings call]
- 97% of creators who use AI regularly say it accelerated development; during the Build (natural-language creation) alpha "more than 75% of Build ..." (the original sentence was truncated during retrieval, **the full wording is not verified**, and this report does not cite that number).
- Strategically it internalizes "generation" as an asset layer (Cube / 4D generation) rather than outsourcing "the world" to a model.

**What this means for choroweave**: Roblox has already locked down the trio of "game distribution + social graph + generative assets". **Any project positioned as "a better Roblox" will hit a wall head-on.** choroweave's room to exist lies only in what Roblox structurally does not provide: cross-domain addressing, self-hostability, composability, open identity and content portability.

**Fortnite/UEFN: UGC ate half the platform's hours, and the platform itself is ebbing.**
A third-party compilation (Axis Intelligence, 2026-07-07) gives: 650M registered, about 110–120M MAU, about $6B revenue in 2025; **average DAU in 2026-04 was about 869,137, down 42% from the January peak of 2.38M**; layoffs of over 1,000 in 2026-03, with Sweeney stating publicly that "the decline in Fortnite engagement that began in 2025 means we are spending more than we earn". [Third-party / Media-reported]
Meanwhile Epic officially confirmed at Unreal Fest Chicago on 2026-06-17: **cumulative UEFN creator payouts have reached $1B since 2023**; **creator islands accounted for 47% of player hours in 2026-05 (38% a year earlier)**. [Official wording, restated by third parties]

**Reading**: the lifecycle of a UGC platform is not "the platform feeds creators" but "creators take over the platform, and the platform becomes settlement and discovery". This is **structurally favorable** for choroweave — if the protocol layer can carry "cross-platform discovery and settlement", it does not need to own a Roblox-scale platform. Conversely, if choroweave only does the protocol and not discovery, creators will not come.

### 3.2 VR social side: VRChat's "small and hard" vs Rec Room's "big and brittle"
**VRChat (the living sample)**
- Officially announced 2026-05: **peak CCU 158,192** (set by a 2026-02 virtual concert themed on the Netflix anime "超时空辉夜姬"), **average daily CCU ~100K**, **250K+ active communities**, **Japan users up 3.9×**, **creator revenue share up to 50%**, and explicitly promotes "**you can join without a VR device**". [Official]
- Sensor Tower (2026-02): **global MAU >1M**; Steam lifetime downloads >5.3M (since early access in 2017-02); ranked first by average DAU in Steam's "sandbox" sub-genre over the past 12 months; **about 650M visits to the official site in 2025, 37% Japan / 27% US**; mobile launched **2025-10-25**, >270K downloads in the first month, with Japan at 26% (second only to the US). [Third-party]
- New Year CCU record: **148K+** from 2025-12-31 to 2026-01-01 (cited by UploadVR). [Media-reported]
- Third-party Steam tracking (2026-11-07): current 51,397 / 30-day average 45,019 / 30-day peak 67,190. Note this **covers the Steam side only**, excluding Quest and mobile.

**Four reusable conclusions from VRChat for choroweave**:
1. **Inter-world jumps already exist and are heavily used** (World links, Portal props, community-driven "world tours"); it is only that addressing is locked inside a central server. The value of protocolizing is not "inventing portals" but "making portals work across operators".
2. **"No VR required" must be said explicitly.** VRChat actively softened the "you must buy a headset" impression in 2026 — an industry-wide shift in consensus.
3. **The community, not the world, is the unit of retention.** 250K active communities vs 1M MAU means about 4 people per community on average — **this is a "small groups + strong ties" structure**, not a "large world".
4. **Japan is currently the strongest social VR market** (37% of official-site visits). Any global narrative must explain why Japan rose first (IP-driven + concert/doujin culture + mobile penetration).

**Rec Room (the death sample)**
- On 2026-03-31 it officially announced **permanent shutdown on 2026-06-01**; the same day Snap confirmed the acquisition of some assets, with some staff joining Specs Inc. (the Spectacles AR hardware subsidiary). [Official + Media-reported]
- Official wording (via GeekWire): "Despite this popularity, we never quite figured out how to make Rec Room a sustainably profitable business... Our costs always ended up overwhelming the revenue we brought in."
- Financials: **$294M** raised, peak valuation **$3.5B** ($145M Series F led by Coatue, with Sequoia / Index / Madrona participating); two rounds of layoffs in 2025 (16%, 50%). [Media-reported]
- Unit economics (key): **the first-party item store leaves ~70 cents per dollar; for UGC items, after the 30% platform fee and creator share, Rec Room keeps only ~30 cents per dollar**; UGC revenue +70% YoY kept diluting gross margin; **monthly paying users <2%**; RR+ membership $7.99/month. [Media-reported official data]
- Cost of cross-platform: VR + PC + console + mobile in parallel → high bug and maintenance costs; sacrificing VR features to support old phones → core VR users churned; 30% mobile store fee. [Media-reported]
- In 2025 the company said its runway would last into 2029. [Media-reported]

**What this means for choroweave (the single most important point)**:
> If choroweave's reference implementation has to host worlds itself and take a cut, it will repeat Rec Room: **the bigger it gets, the more it loses.** A model where "cost is distributed as worlds spread" must be designed from day one: worlds hosted on personal servers, the protocol layer doing only addressing/identity/settlement, and the reference implementation doing only the client and authoring tools.

**Resonite**: Steam currently 136 players, 30-day average 155 [Third-party]. This is the ceiling of "technical idealism + no business model" — it can persist for a long time but cannot become an ecosystem. **choroweave should not benchmark against Resonite's scale.**

### 3.3 Web / open camp: Hubs' corpse + Spatial's bill + Decentraland's lesson
**Mozilla Hubs (the first Web-first post-mortem)**
- Launched 2018, announced 2024-02-15, **shut down 2024-05-31**: demo servers, subscriptions and community resources ended; Mozilla no longer actively develops or maintains the codebase. [Official]
- Cumulative before shutdown: **115,732 custom avatars, 215,923 scenes, nearly 10M attendances** (official demo servers only). [Official]
- The immediate trigger was **Mozilla's organization-wide layoffs on 2024-02-13**; Hubs Cloud (AWS self-hosting) had already been discontinued in 2023-10. [Official + Media-reported]
- The code was handed to the community: `Hubs-Foundation/hubs` still had commits as of 2026-10-29, but with a backlog of **1,224 open issues**, 2,223★/1,389 forks. [GitHub API]

**The most critical conclusion of this post-mortem is not "WebXR does not work", but**:
> A "private, in-browser, cross-device" 3D space product — even if free, even with the Mozilla brand, even with nearly 10M attendances — **will be the first thing cut when budgets shrink, as long as one single entity bears the hosting cost**.
> Making "personal servers" a first-class citizen is exactly how choroweave addresses this; but it must answer "who pays for the first experience" (see §5).

**Spatial (the direct bill for hosting cost)**
CEO Jinha Lee's public statement reads almost like a risk memo written for choroweave:
> "The cost of hosting and scaling open multiplayer 3D worlds has grown significantly and continues to climb. We explored every alternative: revised pricing models, tiered hosting plans, and partnership structures. Every path forward would have meant passing rising costs directly to you at levels that are not sustainable for independent developers and small studios. We were not able to find a model..."
> — Spatial's creator platform terminated 2025-07-27, world assets deleted, only enterprise customers retained. [Official statement, via UploadVR]

Also worth noting: the social VR game made by Spatial's in-house studio Wooster Games **reached 500K+ DAU in 2025-07** (widely identified as "Animal Company"). [Media-reported]
**Reading**: **"social world platforms" die; "social games" live.** Users will pay/stay for "a scene with gameplay" but not for "an empty space". This is the core clue for choosing choroweave's wedge.

**Decentraland (economics before experience)**
- The platform is still operating (the official blog was updated through the 2026-10 Halloweeks event). [Official]
- MANA about **$0.089**, versus an all-time high of about $5.9 in 2021-11 (third-party market basis; exact figures not verified trade by trade), a drop of >98%. [Third-party market data]
- `decentraland/unity-renderer` is archived (2025-09-19). [GitHub API]
- The widely circulated "Decentraland has 38 daily active users" is a **third-party/media figure from around 2022**; this report **could not verify the official 2026 DAU**. That number should not be used as a 2026 fact, but it remains valid as a symbol of "the on-chain land narrative being severely disconnected from actual usage".
- **Lesson**: land scarcity / token incentives cannot replace "having something to do once you are in". When asset price becomes the main narrative, user growth and experience improvement stop at the same time.

**Hyperfy (the most isomorphic precedent)**
- Free + open source; worlds must be self-hosted or hosted by a provider; v1 was "buy a world once as an Ethereum NFT" with largely closed code; v2 moved to open source + the `.hyp` format + Blender tooling + AI agent (Eliza OS) integration; there is a $HY token. [Official docs]
- 310★ / 117 forks / 30 open issues, created 2024-12-22, last commit 2026-04-21. [GitHub API]
- **The fork-to-star ratio of 0.38** shows that "deploy your own copy" is the main usage — real evidence of "personal server" demand, but also evidence that **no network effect formed**: every fork is an island.
> **Direct implication for choroweave**: Hyperfy proves "self-hosted worlds + a web client" is technically feasible and wanted; it does not prove "how islands interconnect". **The interconnection layer (addressing, identity, discovery, settlement) is precisely the only part choroweave is worth building.**

### 3.4 AI-generated worlds / games: three routes, three limitations
**Route A: world models generate scenes directly (Marble / Genie / Decart / Odyssey / Waypoint)**

| Dimension | Current state |
|---|---|
| Output form | Marble = persistent 3D assets (Gaussian splat + collision mesh + walkthrough video), importable into Unreal/Unity/Blender/Houdini; can export to VR. Genie 3 / Project Genie = real-time generated video-like worlds ("generate the path ahead while walking"). Odyssey / Decart / Waypoint = real-time video-like interactive worlds. |
| Interactivity | The Genie 3 family is "real-time", but **the Project Genie prototype does not include "change the world via live prompts"**. Odyssey-2 Pro 720p@22fps; Waypoint 1.5 720p@60fps (local consumer hardware). Marble is **offline generation** (about 5 minutes per world at the standard tier), walkable afterwards. |
| Multiplayer | **None supports "persistent multi-user co-presence".** Odyssey has shown a "multi-agent world model", but it is still research. |
| Pricing | Marble API: Draft ~$0.12–0.20/world, Standard ~$1.20–1.28, Plus up to ~$2.48. Project Genie is tied to a Google AI Ultra subscription (price not verified) and is US-only. |
| Key limits | ① Insufficient consistency/long-horizon memory; ② no persistent world state; ③ no permission/identity/economy system; ④ output is hard for third parties to edit (except Marble, whose output is standard assets). |

**Roblox's judgment is worth memorizing verbatim** (official newsroom, 2026-06-03):
> "standalone world models, while powerful, fundamentally lack the long-term memory, consistent logic, and structured user input required for a massive multiplayer platform."

And Roblox Reality's technical choices (official + gamesbeat):
- **Hybrid architecture**: the Roblox Engine holds game state and logic, and the **Roblox Video Model generates pixels only** (the "Super Upsampler"); generated content is **subordinate to** what creators define with the engine;
- Target **4K@60Hz**; inference runs in edge data centers (H200/B200);
- **Players pay a subscription** (Baszucki: "Roblox Reality will not be free"), with no extra charge to creators;
- Launch: **late 2026 – early 2027**;
- Creator backlash is evident: "most players and creators prefer Roblox's blocky/cartoon style", and the company admits photoreal creators are a minority.

**What this means for choroweave**: **do not build a world model; build the "landing point" for world models.** Generation capability will commoditize (HunyuanWorld open source, Marble API priced per world, Waypoint running locally), but "how generated scenes get addressed, visited, composed and billed" will not solve itself.

**Route B: consumer AI UGC platforms (Astrocade / Rosebud / Bitmagic)** Astrocade is the most important primary sample of 2026:
- Officially on 2026-05-05: **$56M** (Sequoia led Series B, Sea led Series A; Google AI Futures Fund, NVIDIA, LG Technology Ventures, Dentsu Ventures etc. participated); **20M+ participating users in 8 months**; angel investors include **Roblox CEO David Baszucki and former EA/Unity CEO John Riccitiello**.
- Naavik (third-party deep analysis) adds: **5M MAU, 75K creators, about 140M plays per month**; calls it "the largest disclosed funding round for a consumer AI game platform to date".
- Product form: vertical, TikTok-style feed; natural language → the "AstroBrain" orchestrator dispatches a set of specialized agents (visuals/UI/gameplay logic/animation/music/sound effects) → playable in the browser; about **10 minutes** to generate, **2 minutes** to iterate; **publishing queue can be up to a week**.
- Monetization: **no virtual currency, in-app purchase or subscription disclosed** (only stronger models for selected Discord users).
- Naavik's criticism: "the platform currently feels like **an aggregation of game demos**, the controls are often clunky, and progression depth is limited"; the core question is whether it is actually fun on the player side.

Bitmagic took another route (GDK, 2026-08-27): not aimed at consumers but at **AI coding agents** (Claude Code / Codex / Cursor), vendoring the 3D engine into the project as readable TypeScript source, with `bitmagic verify` letting the agent launch the game in a real browser and self-check via screenshot, and one command publishing to a hosting platform (private by default, discoverable on the site), with multiplayer + leaderboards run on platform servers.

**Reading**:
- Astrocade proves **consumer demand for "natural language → playable" is real and growing extremely fast** (0 → 5M MAU in 8 months).
- But its **retention and monetization are entirely unproven**, and it has been called "an aggregation of demos".
- Bitmagic proves **"agent as creator" is a real workflow**, and it has already solved "hosting + multiplayer + publishing" — **exactly the second half of what choroweave wants to build**.
- **choroweave's window of opportunity**: Astrocade is a closed platform (content cannot be taken away, worlds cannot interconnect); Bitmagic is a toolchain (worlds hosted on your own server). **The "portable + interconnectable" position between them is empty.**

**Route C: in-platform generation (Roblox Cube / 4D generation / open-source HunyuanWorld)**
- Cube's 4D generation is not just "generating meshes" but **generating objects with function**: the schema defines the required meshes (Car-5: body + four wheels), then **redirects scripts to the generated object's actual dimensions**, so wheels turn and the car drives. The early experience has generated 160K+ objects. [Official]
- This is the key engineering bridge between "generation" and "interactivity": **the functional contract (schema) precedes generation**.
- **Direct takeaway for choroweave**: choroweave's "intent → executable space" compilation needs exactly this **schema + script redirection** approach — specify "interactivity" first, then let generative models fill in geometry and appearance.

### 3.5 Hardware and demand side: why it must be Web-first
**2025 was the cliff year for VR hardware (IDC, via The Register, 2026-01-02)**:
- Overall VR/MR headset shipments **-42.8%** (2025 full-year estimate);
- Vision Pro: **45,000 units for the year** (zero in the first three quarters, restarting only in Q4 with the M5 version; 390,000 units / about $1.4B revenue in 2024); at one point halted at the supplier end;
- Quest: **1.7M units** in the first three quarters, **-16%** YoY (5.6M units / about $2.9B for all of 2024);
- Ad spend collapsed in parallel: Vision Pro-related spend **-95%+** YoY, Quest **-55%+** (Sensor Tower);
- Contrast: AR/ER (smart glasses) **+211.2%**, Meta Ray-Ban Display shipped 20,000 units in Q3'25, and IDC forecasts a **29.3%** CAGR for smart glasses 2025–2029.

**The only positive variable in 2026 is Steam Frame**:
- Released 2026-09-15, Snapdragon 8-series + SteamOS standalone headset, 100+ Standalone Verified games, dual radios + a dedicated Wi-Fi adapter for wireless streaming;
- The 2026-10 Steam Hardware Survey **included it for the first time at 5th place, 5.49%**; Quest 2 share -3.57pp MoM (some users may be migrating);
- Comparison baseline: Valve Index was 1.46% in its first month and took about 2 years to reach 2nd place;
- Valve Index has been discontinued; SteamVR Beta 2.19.1 (2026-11-04) significantly improved Quest/PICO streaming quality.
- Pricing: Japan ¥199,980 (256GB) / ¥244,980 (1TB) incl. tax; US media-reported from US$1,059 (**currency and tax basis could not be verified directly from Valve's official page**).

**Three hard facts on the demand side**:
1. **The headset installed base is contracting, not expanding.** Going VR-first in a -42.8% year is equivalent to halving your TAM.
2. **Horizon Worlds' mobile data reveals "download ≠ use ≠ pay"**: 45M cumulative downloads, 1.5M added in 2026 (+53% YoY), and **total consumer spending of only $1.1M**. [Media-reported Appfigures]
3. **But "high-quality social games inside VR" still make money**: Spatial's Wooster Games social VR game reached 500K+ DAU in 2025-07. [Media-reported]

**Conclusion**: **Web-first (browser / desktop / mobile) is the default entry, with VR as an "optional high-fidelity entry" driven by the same world data.** This is not a compromise but the only choice consistent with IDC's data. choroweave's world format must be consumable **both** by three.js-class web renderers and by Unity/Unreal-class engines — Marble's dual output of "Gaussian splat + collision mesh" is exactly the engineering paradigm to borrow.

### 3.6 Open-source and community signals: real heat is "a small toolchain", not "a large community"
- **Hyperfy**: 310★ / 117 forks / 30 open issues / created 2024-12 / last commit 2026-04. fork/star = 0.38 (far above typical projects), showing **deployment demand > attention demand**.
- **Hubs community edition**: 2,223★ / 1,389 forks / **1,224 open issues** / last commit 2026-10-29. The project is alive, but the backlog shows very few core maintainers (at shutdown only 3 Mozilla employees handled the transition).
- **Third Room**: 656★ / last commit **2023-08-30**. Stalled for nearly 3 years. This is the loudest narrative and weakest delivery of "open immersive worlds" (the Matrix ecosystem).
- **OMI (Open Metaverse Interoperability Group)**: 329★ / 22 forks / last commit 2025-10-01; the website copyright still says 2022. **The standardization effort exists but has very little momentum.**
- **Metaverse Standards Forum**: the portal is still online (© 2011–2026), with an "Open Metaverse Browser Initiative" document beneath it.
- **The academic side has already staked the ground**: the ISMAR 2026 XWORLDS workshop features "The Web of Worlds: Towards A Referential Architecture for Open Spatial Worlds" (PDF on the Fraunhofer site). **This means "spatial hyperlinks / referable spaces" has already been named academically, and choroweave must cite it and state its engineering differentiation rather than claim to be first.**

**Reading**:
> The real state of "open source + open protocols" in 2026 is: **a small group of highly technical individuals and small teams maintaining several mutually disconnected toolchains**. No network formed, because **there is no shared addressing and identity**.
> That is both bad news (the community is small) and good news (**the empty slot is obvious**).

**Funding comparison (for timing judgment)**:
| Project | Funding | Note |
|---|---|---|
| World Labs | ~$1.23B ($230M + $1B) | World-model layer; capital is extremely abundant |
| Odyssey | $310M at a $1.45B post-money | Interactive world-model API |
| Decart | $300M | Real-time world transformation |
| Astrocade | $56M | Consumer AI UGC |
| Rec Room | $294M (cumulative) → zero | Social spatial platform |
| Spatial | not verified | Exited the creator platform |

**Conclusion**: "generation capability" has been fully priced by capital (high valuations, compute-intensive, winner-take-all); **"the protocol layer that connects generation results" has barely been invested** — because nobody has yet proved it can charge. That means the funding environment choroweave faces is cold, and also that **there is no strong incumbent**.

### 3.7 Spatial addressing / hyperlinks: the existing occupants

| Source | Content | Meaning for choroweave |
|---|---|---|
| **MSF "Web of Worlds (WoW)" agenda + X3D 4.1 WoW Profile** (2026) | Treats the internet as an addressable, linkable network of spatial experiences ("pages become places, links become portals"); the Profile contains **Anchor (3D hyperlinks)** and **Inline (external scenes)** nodes; the whitepaper is published by MSF, with Threedy.io / Virginia Tech implementing [Standards body] | **The most important benchmark**: SHP should not invent new link primitives but provide "a lightweight profile + a portal entry handshake", with explicit field mappings to Anchor/Inline |
| ISMAR 2026 XWORLDS "The Web of Worlds" | "Towards A Referential Architecture for Open Spatial Worlds" — proposes a **referential architecture** for open spatial worlds | The academic concept already exists; choroweave needs to deliver **a runnable protocol + reference implementation** and cite this work |
| Metaverse Standards Forum · "Open Metaverse Browser Initiative" | A browser-ized metaverse proposal document under the standards body | There is an entry point on the standards side, but no implementation |
| VRChat's World links + Portal | A de facto "world addressing + portal" (centralized) | Users already understand this interaction; choroweave only needs to decouple the operator |
| AltspaceVR's in-world "teleporters" | "In-world portals" existed as early as 2015 | The interaction paradigm is not new; **the protocol is** |
| **OMI glTF extensions** (`omigroup/gltf-extensions`, including the archived `OMI_link`) | The community once defined glTF-layer spatial-link extensions (Phase 0–5); `OMI_link` is archived [Standards body] | Shows "hyperlinks inside glTF" has precedent and failure lessons: **an extension must be small and ignorable (graceful degradation)**; it cannot require the whole industry to implement it |
| Hyperfy's `.hyp` world format | A world as a single exportable file/package | The engineering practice closest to an "addressable world object" |

---
## 4. Failure post-mortems and 8 lessons
### 4.1 Structured comparison of seven failure cases

| Case | Timeline | Surface cause | Structural cause | One-line lesson |
|---|---|---|---|---|
| **Mozilla Hubs** | 2018 → 2024-05-31 | Mozilla's organization-wide layoffs in 2024-02 | Free + one entity bearing all hosting cost; WebXR could not form a paid loop | **A free public space with no payer is always cut first** |
| **AltspaceVR** | 2015 → 2023-03-10 | Microsoft's strategic pivot to Mesh | The acquirer's main business had nothing to do with it; community assets were not portable | **Do not hand your right to exist to an owner for whom this is not the main business** |
| **Rec Room** | 2016 → 2026-06-01 | "Never found a sustainable profit model" | UGC take-rate structure (30¢ vs 70¢) + cross-platform cost + paying rate <2% | **The more successful UGC is, the more you lose = wrong take-rate model, not wrong content** |
| **Spatial (creator platform)** | → 2025-07-27 | Hosting and scaling costs kept rising | Could not pass costs to indie developers without losing them | **The unit hosting cost of "open multiplayer 3D worlds" is the fatal variable** |
| **Meta Horizon Worlds VR** | 2021 → 2026 (announced closure, then retracted) | Insufficient user scale | MAU <200K, DAU trough <900, churn within a month, $1.1M total consumer spending | **Capital cannot substitute for product-market fit; "general social worlds" have no PMF** |
| **Decentraland** | 2017 → still operating | Chronically low activity | Token/land narrative before experience; asset price replaced use value | **Financialization kills the motivation to iterate on the product** |
| **Webaverse** | → 2023 | In 2023-02 attackers posing as investors stole **$4M USDC** (a Rome hotel meeting, Trust Wallet private-key leak) [Media-reported]; around 2023-08 the founder publicly said the company was closing (social-media post; exact date not verified) [Media-reported] | An early project kept all funds in a single hot wallet + depended on "the next round" to survive | **Fund security and cash-flow discipline are preconditions for a protocol project's survival** |

### 4.2 The 8 mistakes choroweave must not repeat
1. **Do not bear the hosting cost of the whole world yourself.** Hubs and Spatial died of the same thing. Worlds must be hosted on user/third-party servers; the protocol layer does only addressing, identity, permissions, discovery and settlement. The reference implementation should default to "local/self-hosted first" and offer "one-click hosting" as a commercial option rather than forcing hosting.
2. **Do not make "UGC take rate" the main revenue.** Rec Room proves that when UGC becomes mainstream content, a 30% retention rate makes the platform lose more as it scales. choroweave should put monetization **outside protocol invariants** (hosting services, discovery slots, certification, enterprise deployment), not on transaction cuts.
3. **Do not build "empty space".** Spatial's social game had 500K+ DAU while the Spatial platform died; Decentraland has land but no activity. **Users stay for "activity/gameplay/events", not for "space".** The wedge must ship with an activity type that people "must come for".
4. **Do not sacrifice the core experience for cross-platform reach.** Rec Room cut VR features to support old phones → core users churned, while the new younger free users did not pay. **Build a tiered world format (fidelity tiers) rather than a downgraded uniform experience.**
5. **Do not treat "open source" as an ecosystem strategy.** Hyperfy has 310★ and fork/star = 0.38, yet worlds are not interconnected. Open source solves "trust and deployability", not "network effects". **Onboarding incentives and discovery mechanisms must be designed explicitly.**
6. **Do not let token/asset prices become the narrative center.** Decentraland's MANA went from ~$5.90 to ~$0.089 (-98%) while the platform experience did not change in ten years. **Financialization replaces product iteration.**
7. **Do not go VR-first in a year when headset shipments are -42.8%.** Nor assume "Vision Pro will bring spatial computing to the mass market": 45,000 units for all of 2025. **VR is one entry point, not the entry point.**
8. **Do not claim "world models will replace engines".** Roblox's engineering judgment (the engine holds state, the model generates pixels only) and Marble's output form (assets, not applications) both say: **the generation layer and the runtime layer must be separated**. If choroweave treats "generation" as its core, it will be commoditized within 12 months (HunyuanWorld is already open source, Marble prices at $0.12/world).

---
## 5. Five conclusions for strategic positioning
### Conclusion 1 | Timing: this is the window for the "protocol layer", not the "platform layer"
- **The platform layer is closed**: Roblox (138M DAU), Fortnite (~110M MAU), Minecraft (155M MAU) and VRChat (1M MAU + a strong community) already occupy the "3D social/game" niche; the failures of Rec Room ($3.5B valuation) and Meta Horizon further show that **a new platform has no room**.
- **The generation layer is priced by capital**: World Labs ~$1.23B, Odyssey $310M, Decart $300M, Astrocade $56M. Generation quality will not be the differentiator.
- **The protocol layer is still empty**: the open-source camp (Hyperfy 310★, OMI 329★, Third Room stalled for 3 years) is disconnected; VRChat's "portal" is locked in central servers; academia (ISMAR 2026 "Web of Worlds") has proposed the concept but has no implementation; standards bodies have documents but no deployment.
- **Basis for the window judgment**: the Steam Frame launch (2026-09) means "an open PC-ecosystem VR entry" has reappeared; smart glasses at +211% mean "lightweight spatial computing" is rising; the shared need of both is **cross-device world addressing**.
> **Action implication**: position 2026-11 → 2027 as "the land-grab period for a protocol + reference implementation", with the goal of becoming **the default spatial addressing scheme** rather than "yet another world platform".

### Conclusion 2 | Wedge: start from "an addressable single-player scene + one action that requires multiple people"
The minimum viable wedge supported by data has three characteristics:
1. **The scene is an "event", not a "space"** (Spatial's social game at 500K DAU vs the platform's death; VRChat's peaks come from concerts; Rec Room's low paying rate is because there is "no reason you must come").
2. **It inherently needs "cross-server"** (otherwise no protocol is needed): e.g. "personal homepage/portfolio space", "small exhibitions/screenings", "asynchronous messages + synchronous gatherings", "cross-community event tours".
3. **Single-player usable, multiplayer as enhancement** (counters the small VR installed base; matches VRChat's "join without VR" direction).

**Suggested concrete wedges (ordered by feasibility)**:
- **A. "Addressable portfolio/exhibition space"**: creators publish 3D works as linkable worlds (one URL, one space), supporting "portal" jumps into others' spaces. Low cost, single-player usable, inherently needs cross-domain addressing, and works well with Marble/generation capabilities.
- **B. "Cross-community event tours"**: protocolize VRChat-style "world tours" — servers of different communities visit each other through standard entry points. Benchmarks real existing user behavior; no new demand needs inventing.
- **C. A developer tool for "AI generation + spatial compilation"**: aimed at agent-first workflows (Bitmagic has proven this route viable), making "intent → space" a version-controllable, self-hostable compiler rather than a consumer app.
> **Wedges not recommended**: general social worlds (Meta has proven no PMF), virtual real estate (Decentraland has proven the financialization trap), VR-only social (insufficient installed base).

### Conclusion 3 | What not to do (negative list, each backed by a post-mortem)
1. **Do not build a centralized world-hosting platform** (cause of death for Hubs / Spatial).
2. **Do not make transaction take rates the main revenue** (Rec Room: 30% UGC vs 70% first-party; the bigger it got, the more it lost).
3. **Do not go VR-first** (IDC 2025 headsets -42.8%; Vision Pro 45,000 units for the year).
4. **Do not build a general social metaverse** (Horizon Worlds: MAU <200K, DAU trough <900, $1.1M total consumer spending).
5. **Do not build on-chain land/token economics** (Decentraland: MANA -98%, experience unchanged for ten years).
6. **Do not build your own world model** (it will be commoditized by HunyuanWorld open source + Marble at $0.12/world; Roblox's conclusion is that the engine holds state and the model generates pixels only).
7. **Do not ship "a pure protocol with no client"** (Hyperfy proved self-hosted worlds are wanted, but also proved there is no network effect without an out-of-the-box experience).
8. **Do not adopt a "kill Roblox" narrative** (head-on competition is unwinnable; build the "cross-domain portability" Roblox structurally does not offer).

### Conclusion 4 | Target users: serve first the creators who "already have 3D content assets but lack distribution"
- **Not** "ordinary consumers who want to socialize" (the Horizon Worlds lesson: they have no clear demand).
- **Not** "UGC developers who want to make money" (Roblox / Fortnite settle and surface content far more efficiently than a new protocol).
- **They are three groups**:
  1. **Independent 3D artists / small studios**: they already have assets (Blender/GLB/Marble output) but lack a "linkable, visitable, exhibitable" space (matching the gap left by Oncyber/Spatial).
  2. **Community organizers** (VRChat's 250K+ communities, Japan's IP-event ecosystem): they lack "cross-community event infrastructure".
  3. **AI-native developers** (Bitmagic/Astrocade users): they already generate content with agents and lack a "self-hostable, portable, interconnectable" runtime.
- **Scale expectation management**: VRChat's 1M MAU + 250K communities is the magnitude of "doing well"; do not use Roblox's 138M as the reference.

### Conclusion 5 | Competitive response: treat both "world models" and "UGC platforms" as upstream/downstream, not as opponents
- **Toward world models (Marble / Genie / Odyssey / Waypoint / Decart)**: position as a **consumer**. Provide a "generation result → addressable world" conversion and hosting pipeline (Marble outputs Gaussian splat + collision mesh, exactly the form a web renderer can consume). As generation gets cheaper, **the value of "what happens after generation" rises**.
- **Toward UGC platforms (Roblox / Fortnite / Astrocade)**: position as an **interoperability target**, not a replacement. Roblox has announced "Roblox Everywhere" (creators can publish Roblox games independently to any app store) — which effectively acknowledges the demand for "distribution outside the platform"; choroweave should provide "unified addressing for cross-platform worlds" so platform content can be reached via external links (even if it is a read-only mirror at first).
- **Toward the open-source camp (Hyperfy / OMI / Third Room / Hubs community edition)**: **merge rather than compete**. Hyperfy's `.hyp` format, the Hubs community-edition client, and OMI's interoperability vocabulary are all reusable parts; choroweave should position itself as "the addressing layer between these islands" and be the first to implement interoperability.
- **The one-sentence differentiator**:
> **"choroweave is not another world; it is the DNS + HTTP between worlds."**

---
## 6. Risks and unknowns
### 6.1 Explicit data gaps (not verified in this report; must not be cited as fact)

| Gap | Note |
|---|---|
| Second Life 2026 MAU / DAU | Linden Lab does not disclose; only that the platform still operates |
| Oncyber's 2026 status | Could not verify whether it still operates or was acquired |
| Decentraland 2026 official DAU | Only the ~2022 "38 DAU" media figure, **not usable as current data** |
| Scenario funding/valuation | Only PitchBook/Crustdata-type database entries; no primary source |
| Rosebud AI user scale and retention | Not disclosed |
| Steam Frame US official price and currency | Only media-reported from US$1,059; Japan pricing is verifiable (¥199,980 / ¥244,980 incl. tax) |
| Google AI Ultra subscription price | The gate for Project Genie; price not verified |
| OMI / Metaverse Standards Forum active member counts and working-group output | Only star counts and portal online status |
| Hyperfy's actual number of hosted worlds and MAU | Not disclosed; only GitHub metrics |
| Rec Room's precise DAU / MAU before shutdown | Only "150M cumulative players" and "paying rate <2%" |

### 6.2 Key risks
1. **The "impossible triangle" of hosting cost**: open (anyone can host) × low cost (users can afford it) × consistent experience (multiplayer sync quality). Spatial's open letter shows this triangle is commercially very hard to satisfy. choroweave must present a cost model (e.g. static world hosting + on-demand instancing, or a P2P/relay hybrid).
2. **Missing discovery mechanisms cause a cold start**: Hyperfy's fork/star = 0.38 shows "deployable" does not equal "someone comes". If the protocol has no discovery layer (index, search, recommendation), worlds fall back to islands.
3. **Security and content governance**: Roblox spends a large share of the cost of its 34B hours/quarter on Trust & Safety (in Q3'26 the related infrastructure and trust-and-safety spend was 16% of revenue, +110bps YoY) [Official]. **If an open protocol does not solve governance, it will be banned by regulators and platforms.**
4. **Identity and asset portability**: every successful platform locks identity inside itself. Open identity (DID / federated identity) still lacks a killer implementation in 2026 (Matrix's Third Room has stalled).
5. **The "metaverse" label as a liability**: media narrative on "the metaverse" was highly negative in 2024–2026 (Horizon shutdown, Rec Room shutdown, Decentraland collapse). **External communication must avoid "metaverse" and use neutral phrasing such as "open addressing of space / a distribution protocol for 3D content".**
6. **Giants casually doing it**: Roblox's "Roblox Everywhere", Google's Project Genie, Valve's Steam Frame ecosystem — any of them could casually provide "cross-world links". choroweave's time window may be 12–24 months.

### 6.3 Questions the next research round must answer
1. VRChat's world-link / Portal usage frequency and cross-community ratio (determines the real strength of "portal" demand).
2. The actual active distribution of Hyperfy-hosted worlds (determines whether "self-hosting" is merely geek behavior).
3. The ranking of distribution pain points for independent 3D artists (determines whether wedge A holds).
4. Existing patents and standard proposals for spatial addressing (to avoid conflict with existing Metaverse Standards Forum work).
5. Differences across China/Japan/Korea markets (Japan accounts for 37% of VRChat official-site visits and is the market most worth validating first).

---
## 7. Source list
### 7.1 Official primary sources
1. Rec Room official announcement "School's Out for Rec Room" — https://blog.recroom.com/posts/schools-out-for-rec-room
2. Roblox Q3 2026 shareholder letter (SEC 8-K exhibit 99.1, 2026-10-29) — http://archive.fast-edgar.com/20261029/AVZRB22COZ22S25Z2MTQ2MZ2OOMNZ22IZ282/ex991-q32026earningsshar.htm
3. Roblox Q3 2026 earnings call transcript (The Motley Fool, 2026-10-30) — https://www.fool.com/earnings/call-transcripts/2026/10/30/roblox-rblx-q3-2026-earnings-call-transcript/
4. Roblox Newsroom "Pioneering AI Founders Join to Accelerate Roblox Reality Vision" (2026-06-03) — https://about.roblox.com/newsroom/2026/06/pioneering-ai-founders-join-to-accelerate-roblox-reality-vision
5. Roblox Newsroom "Accelerating Creation, Powered by Roblox's Cube Foundation Model" (2026-02) — https://about.roblox.com/newsroom/2026/02/accelerating-creation-powered-roblox-cube-foundation-model
6. Mozilla Hubs end-of-support announcement (2024-02-15) — https://support.mozilla.com/en-US/kb/end-support-mozilla-hubs
7. VRChat official user data (2026-05, via IT之家 / ITHome) — https://m.ithome.com/html/948339.htm
8. Google official blog "Project Genie" (2026-01-30) — https://blog.google/intl/ko-kr/company-news/technology/project-genie-kr/
9. World Labs / Marble (compiled by invideo 2026-08, including official pricing and version information) — https://invideo.io/blog/world-labs-marble-3d-worlds/
10. Odyssey "Introducing Odyssey-2 Max" — https://odyssey.ml/introducing-odyssey-2-max
11. Odyssey "The GPT-2 Moment for World Models Is Here" — https://odyssey.ml/the-gpt-2-moment-for-world-models
12. Decart official blog ($300M raise / Lucy 2.0 / Oasis 3) — https://decart.ai/blog
13. Overworld "Waypoint-1.5 Brings Real-Time AI Worlds to Everyday GPUs" — https://over.world/blog/waypoint-1-5
14. Astrocade "Astrocade Raises $56M in New Funding" (2026-05-05) — https://www.astrocade.com/blog/astrocade-raises-56m-funding
15. Bitmagic "Bitmagic launches the GDK" (2026-08-27) — https://bitmagic.ai/news/bitmagic-gdk/
16. Hyperfy docs (Creator FAQ / Hosting / v2) — https://docs.hyperfy.xyz/faq/creator/
17. OMI Group — https://omigroup.org/
18. Metaverse Standards Forum portal (Open Metaverse Browser Initiative) — https://portal.metaverse-standards.org/document/dl/8243
19. Tencent HunyuanWorld-1.0 (GitHub) — https://github.com/Tencent-Hunyuan/HunyuanWorld-1.0
20. Decentraland official blog (updated through 2026-10) — https://decentraland.org/blog/
21. Steam Frame official launch (Steam news) — https://store.steampowered.com/news/group/45479024/view/692020124159311887
22. GitHub API metadata (retrieved 2026-11-07): `hyperfy-xyz/hyperfy`, `Hubs-Foundation/hubs`, `matrix-org/thirdroom`, `omigroup/omigroup`, `decentraland/unity-renderer`

### 7.2 Third-party research / data
23. IDC headset shipment data (via The Register, 2026-01-02) — https://assets.theregister.com/2026/01/02/apple_vision_pro_meta_quest_sales_drop/
24. Steam Hardware Survey · Steam Frame share 5.49% (via moguravr, 2026-10) — https://www.moguravr.com/steam-frame-steam-hardware-survey-5th/
25. Road to VR "Valve Steam Frame Strong Start in Survey" (2026-10) — https://roadtovr.com/valve-steam-frame-strong-start-survey-oct-26/
26. Steam Frame launch and pricing (thisisgame, 2026-09-15) — https://www.thisisgame.com/articles/429970
27. Sensor Tower · VRChat analysis report (via 163/VR陀螺, 2026-02) — https://www.163.com/dy/article/KKS3VBK50526LS4I.html
28. Sensor Tower · VRChat Japan market data (via moguravr, 2026-02-03) — https://www.moguravr.com/vrchat-japan-visitor-market-share-2025/
29. Naavik "Astrocade's $56M Raise, and UGC Platforms' AI-Enabled Future" — https://naavik.co/ai-gaming/astrocades-56m-raise-and-ugc-platforms-ai-enabled-future/
30. Axis Intelligence "Fortnite Statistics 2026" (2026-07-07) — https://axis-intelligence.com/fortnite-statistics/
31. Host Havoc "How Many People Play Minecraft (2026)" (citing Microsoft executives and earnings calls) — https://hosthavoc.com/en-GB/blog/minecraft-statistics
32. Appfigures / IDC data (via 17173, 2026-03-20) — https://news.17173.com/content/03202026/120415362.shtml
33. Steam / Resonite concurrency tracking (third-party, 2026-11-07) — https://live-player-count.com/game/vrchat ; https://live-player-count.com/game/resonite
34. CoinGlass · MANA market data (2026-11) — https://www.coinglass.com/ja/currencies/MANA/historical-data
35. UploadVR "Mozilla Hubs Is Shutting Down, Will Be Handed Off To The Community" (2024-02-16) — https://www.uploadvr.com/mozilla-hubs-shutdown/
36. UploadVR "Spatial Is Discontinuing Its Creator Platform In July" (2025) — https://www.uploadvr.com/spatial-is-discontinuing-its-creator-platform-in-july/
37. GamesBeat "Roblox wants its upcoming Roblox Reality product to balance generative AI with creator control" (2026-05-04) — https://gamesbeat.com/roblox-wants-its-upcoming-roblox-reality-product-to-balance-generative-ai-with-creator-control/
38. ISMAR 2026 XWORLDS "The Web of Worlds: Towards A Referential Architecture for Open Spatial Worlds" (Fraunhofer) — https://websites.fraunhofer.de/xworlds26/2026_ISMAR_TheWebofWorlds-TowardsAReferentialArchitectureforOpenSpatialWorlds.pdf

### 7.3 Media-reported (used only for cross-validation, never as a sole basis)
39. Road to VR "Virtual Hangout 'Rec Room' is Permanently Closing in June, Assets Reportedly Acquired by Snap" — https://roadtovr.com/rec-room-shutdown-snap-acquisition-2026/
40. VR陀螺 (VR Tuoluo) "Rec Room heads for its finale, which 150 million users could not save" (2026-04-04) — https://www.vrtuoluo.net/544984.html
41. Hypergrid Business "Rec Room shuts down after decade and 150 million players" (2026-03, citing GeekWire) — https://www.hypergridbusiness.com/2026/03/rec-room-shuts-down-after-decade-and-150-million-players/
42. VR陀螺 "Meta retracts plan to shut down VR Horizon Worlds" — https://vrtuoluo.net/544897.html
43. BlockTempo "Meta shuts down Horizon Worlds VR: 'Zuckerberg's dream shattered'" (2026-03-19) — https://www.blocktempo.com/meta-horizon-worlds-vr-shutdown-835-billion-loss-zuckerberg-metaverse-ends/
44. VR陀螺 "Record concurrency, an old platform revived: VR social is not over" (2026-09) — https://www.vrtuoluo.net/545929.html
45. 智东西 / 36Kr "Valued at $9.5B, Jensen Huang invested in a world-model startup" (2026-06-18, citing FT) — https://eu.36kr.com/zh/p/3858479782138886
46. Tokenhell "Game Engine Developer Webaverse Suffers A Major Hack" (2023-02-08) — https://tokenhell.com/game-engine-developer-webaverse-suffers-a-major-hack/
47. Wikipedia · AltspaceVR — https://en.wikipedia.org/wiki/AltspaceVR
48. CMSWire "The Metaverse Is Making a Comeback — Just Not the One We Expected" — https://www.cmswire.com/customer-experience/is-the-metaverse-making-a-comeback-in-agentic-commerce/
49. VR陀螺 (VR Tuoluo) "陀螺研究院 (Tuoluo Research Institute) publishes the 2026 H1 Global VR/AR Industry Development Report" — https://www.vrtuoluo.net/545970.html
50. 36Kr/VR陀螺 September 2026 VR/AR and AI glasses industry monthly (monthly funding and new-product counts) — https://www.vrtuoluo.net/546196.html

---
### Appendix A: mapping research conclusions to choroweave phase definitions (P0–P4)

| Phase | Most relevant conclusions of this report | Recommended action |
|---|---|---|
| **P0** protocol validation | The Hubs community edition is "deployable but disconnected" (fork/star 0.38, 1,224 open issues); OMI's `OMI_link` extension is archived; MSF WoW / X3D Anchor already provide semantics | Do only the minimum validation of "two self-hosted nodes + one door"; map SHP fields directly to X3D Anchor/Inline; introduce no AI |
| **P1** compiler MVP | Astrocade proves "intent → playable" demand is real (5M MAU in 8 months) but is criticized as "an aggregation of demos"; Roblox Cube's **schema + script redirection** is the engineering key to "interactivity" | The compile pipeline must produce an "interactivity contract", not just geometry; score the eval set on "is it playable / can it interlink", not just visuals |
| **P2** multiplayer networking | Rec Room's 30¢/70¢ and <2% paying rate; Spatial's open letter on hosting cost; VRChat's "small groups + strong ties" (250K communities / 1M MAU) | Make room services an **optional enhancement** (a purely static HTTPS world can still be entered); design the cost model around "nodes pay for themselves", with no centralized take rate |
| **P3** ecosystem and agents | Hyperfy proves self-hosting demand is real but without network effects; Bitmagic proves agent-first workflows are viable; world models (Marble / Odyssey / Waypoint) should serve as the asset upstream | Build the "world index / discovery" layer (the missing link in the protocol); treat world models only as optional asset providers, not part of the runtime |
| **P4** immersion and standardization | IDC: 2025 headsets -42.8%; Steam Frame's 5.49% debut shows "open PC VR" is a small window rather than the main battlefield; visionOS Safari supports WebXR | WebXR adaptation ranks below "enterable from any browser"; the standards path goes `CHW_` → OMI Stage 1 → MSF / X3D WoW |

> **Consistency with other documents**: this report's judgment that "the engine holds state and the model generates pixels only" is consistent with `writing-spec.md` §7 item 10 (HY-World 2.0 / Marble / Matrix-Game 4.0) and with the MSF WoW / KHR_interactivity conclusions of [Chinese version of 03-runtime-standards.md](../../research/03-runtime-standards.md); the mapping details between SHP and X3D Anchor/Inline are elaborated in [04-spatial-hyperlink-protocol.md](../04-spatial-hyperlink-protocol.md).

### Appendix B: one-line memo
- **The scale is there, the business model is not**: user numbers at Roblox / Fortnite / Minecraft / VRChat prove "3D space" is wanted; the deaths of Rec Room / Hubs / Spatial / Horizon prove that "centralized hosting + losing money for scale" is unsustainable.
- **Hardware is retreating, entry points are shifting**: headsets -42.8%, smart glasses +211%; Steam Frame is the only positive variable.
- **Generation is depreciating, interconnection is appreciating**: world-model funding is 100× that of the "connection layer", yet the connection layer is the empty slot.
- **choroweave in one sentence**: the DNS + HTTP of worlds, not yet another world.
