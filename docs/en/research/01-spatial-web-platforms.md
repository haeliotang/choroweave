# 01 · Spatial Web Platforms, Portals/Gateways, Identity, and Multiplayer State Sync

> Subject: choroweave (compiling natural-language intent into "executable space" + a spatial hyperlink/portal protocol + a federated 3D World Wide Web)
> Verification basis: **verified as of 2026-11** (crawl date 2026-11-07, timezone Asia/Katmandu). Stars/license/last commit are as captured that day.
> Method: GitHub REST API (`api.github.com/repos/...`) + GitHub HTML/atom feeds + direct capture of official docs and specification text; 40+ searches/fetches in total.
> Status labels: **shipped** (released and usable) / **demo** (runnable demo exists) / **announced** (announcement only) / **abandoned** (no longer maintained / given up) / **not verified**.
> Related: [Chinese version](../../research/01-spatial-web-platforms.md) · [00 Executive Summary](../00-executive-summary.md) · [01 Landscape](../01-landscape.md) · [02 Tech Selection](../02-tech-selection.md) · [04 Spatial Hyperlink Protocol](../04-spatial-hyperlink-protocol.md) · [world-manifest schema](../../../schemas/world-manifest.schema.json) · [pixel-rooftop example](../../../examples/pixel-rooftop) · [README](../../../README.md)

---

## 1. TL;DR

1. **Third Room has effectively stopped**: `matrix-org/thirdroom` last commit 2023-07-11, zero releases, 91 open issues/PRs; the website still returns 200 but is only an SPA shell. It is a "design reference", not a project that can serve as a foundation. [S1][S2]
2. **The portal standard is a vacuum, not a red ocean**: Third Room's `MX_portal` extension is marked DEPRECATED (use `OMI_link` instead), and `OMI_link` itself was subsequently moved into the OMI repo's `Archived/` directory; to date OMI has **no** `OMI_portal` extension. [S4][S5][S6]
3. **Hyperfy v2 is the only open-source world engine that is "released, self-hostable, web-native, with app scripting + physics + VRM avatars + voice"**, v0.16.0 released 2025-12-18; but the license is **GPL-3.0**, a hard constraint for choroweave (either "loosely coupled hosting" or "everything GPL"). [S10][S11]
4. **Hyperfy's main branch has had no commits since 2025-12-18**, and the dev branch's last activity was 2026-04-21; the team is still active in its React framework `firebolt` (commit on 2026-11-06) — that is, "maintained but low-tempo, not in an expansion phase". [S10][S12]
5. **Mozilla Hubs is not dead; it came back**: the Hubs Foundation continues to maintain `Hubs-Foundation/hubs` under MPL-2.0 (2223★, master last commit 2026-08-23, repo still pushed on 2026-10-29), and has published a Community Edition self-hosting option plus 2026 operations announcements. [S20][S21]
6. **Hubs has already implemented a de facto "room portal"**: Spoke's `Link` element can put any room URL into the scene as a door; the official docs say "place the link element where you want your **portal** to the other room"; pasting a room URL in-site also generates a "Visit Room" link. [S24]
7. **The Matrix route actually became viable in 2026, but Third Room did not live to see it**: on 2026-10-22 Element announced that **MatrixRTC has landed** (decentralized, E2EE, scalable multi-party VoIP), explicitly retracing "we went FreeSWITCH → Jitsi → P2P mesh (Third Room and the first Element Call) → waterfall SFU → MatrixRTC". [S30]
8. **Vircadia is no longer a metaverse project**: vircadia.com (2026-11-07) now calls itself "The reactivity layer for games", selling PostgreSQL world state, anti-cheat, and OAuth 2.0; its open-source `vircadia-native-core` last release stopped at 2024-03-04. [S40][S41]
9. **Webaverse is terminated and JanusXR is a code fossil**: `webaverse/app` last pushed 2022-12-20, and webaverse.com now 301s to upstreet.ai; JanusWeb (MIT) last commit 2018-05-30, janus-server 2023-08-22 — even though janusxr.org still calls itself "3D webspaces interconnected by portals", it is in fact the **conceptually closest** predecessor to choroweave. [S42][S43][S44]
10. **What is truly reusable is "parts", not "platforms"**: LiveKit (Apache-2.0, 22075★, still committing on 2026-11-07) for voice/data, Colyseus (MIT) or a Hyperfy-style in-house authoritative WebSocket server for state, VRM/three-vrm (MIT) for avatars, `/.well-known` + DID-style handles for discovery and identity; **no existing project can serve directly as choroweave's foundation**.

---

## 2. Project / protocol inventory table

> Stars and last commit are values captured on 2026-11-07; dates in the "Recent activity" column are the last commit or last release date. Reusability is a subjective score (1 = readable only, 5 = can be depended on directly).

| Project | Recent activity | License | Tech stack | Relation to choroweave | Reusability | Evidence |
|---|---|---|---|---|---|---|
| **Third Room** (`matrix-org/thirdroom`) | commit 2023-07-11 / push 2023-08-30, no releases | Apache-2.0 | three.js + bitECS + Rapier (WASM) + Matrix (hydrogen-sdk/Olm) + in-house WebSG (WASM scripting) + React/Vite; engine codename Manifold | The most complete attempt at a "3D World Wide Web on Matrix"; no longer maintained, design reference only | 2 | [S1][S2][S3] |
| Third Room `MX_portal` extension | docs frozen with the repo in 2023 | Apache-2.0 (with the repo) | glTF node extension: `uri` supports `http(s)://` and `matrix:`, paired with `OMI_collider` as a trigger | A **direct precedent** for spatial hyperlinks, but DEPRECATED | 3 (as a spec draft) | [S4][S5] |
| **OMI glTF extensions** (`omigroup/gltf-extensions`) | commit 2026-09-21 (`OMI_environment_sky`) | W3C Software & Document License | glTF 2.0 vendor extensions: spawn_point / seat / physics_* / audio / environment / vehicle_* | The most reusable standards vehicle for the spatial description layer; **no portal** | 3 | [S6][S7] |
| **Hyperfy v2** (`hyperfy-xyz/hyperfy`) | release v0.16.0 = 2025-12-18; dev branch 2026-04-21 | **GPL-3.0** | Node server + three.js 0.173 + PhysX (WASM) + LiveKit voice + better-sqlite3/Postgres + Fastify WS + msgpack + SES sandbox + three-vrm | The only shipped self-hosted web world engine; GPL limits how it can be reused | 4 (as a host) / 2 (as a codebase) | [S10][S11][S16] |
| **Hyperfy v1** (`docs.hyperfy.io`) | v1 docs still online, code superseded by v2; old apps archived in `hyperfy-apps` | not verified (v1 repo location unconfirmed; old apps archived) | React hooks SDK (`useWorld`) + Ethereum world NFTs | "World as NFT" route, the opposite of choroweave's open-protocol goal | 1 | [S17][S18] |
| **Mozilla Hubs / Hubs CE** (`Hubs-Foundation/hubs`) | master commit 2026-08-23; push 2026-10-29; CE deploy scripts v2.1.1 (2026-09-08) | **MPL-2.0** | A-Frame + three.js + Spoke scene editor + Blender add-on; Reticulum (Phoenix/Elixir, WebSocket + Phoenix Channels + PostgreSQL); WebRTC audio/video via `dialog` | Active, forkable, already has a "room Link portal" UX; backend is a heavy stack | 3 | [S20][S21][S22][S23][S24] |
| **Webaverse** (`webaverse/app`) | last push 2022-12-20; webaverse.com → upstreet.ai | MIT | Web client (three.js family) | Failure case: pivoted from an open metaverse to AI world tools | 1 | [S42] |
| **Vircadia** (`vircadia/vircadia-native-core`) | last release 2024-03-04; push 2025-07-01 | Apache-2.0 | Native C++/Qt client + server | Has pivoted to a game-state backend; the open-source metaverse line stopped | 1 | [S40][S41] |
| **Overte** (`overte-org/overte`) | release 2026.10.1 = 2026-10-24; push 2026-11-04 | Apache-2.0 | C++/Qt native desktop + VR, JS scripting, 256 km² world/server, fully self-hosted | An active **non-web** open-source virtual world; its "one server, one world" deployment model is worth borrowing | 2 | [S45][S46] |
| **JanusXR / JanusWeb** (`janusvr/*`) | janusweb 2018-05-30; janus-server 2023-08-22; janusxr.org still online | MIT | WebGL/JS client + Node presence server; "web pages as 3D spaces, interconnected by portals" | The **conceptually closest** predecessor to choroweave; the code is fossilized | 1 (ideas 4) | [S44][S47][S48] |
| **Decentraland** (`decentraland/godot-explorer`) | commit 2026-11-04; old Unity client archived 2026-06-01 | Apache-2.0 | Godot 4.6.2 + Rust core, SDK7, LiveKit spatial voice, Ethereum wallet | A live case of Unity → Godot migration; not a web client | 2 | [S49][S50] |
| **MatrixRTC** (MSC4143/4195/4196) | product landing 2026-10-22 (Element announcement) | spec Apache-2.0; implementation AGPL-3.0 | In-room slot/membership events + multi-SFU (LiveKit) transport + E2EE | A ready-made paradigm for the "spatial session/presence" model; not world-state transport | 3 | [S30][S31][S32] |
| **LiveKit** | commit 2026-11-07 | Apache-2.0 | Go + Pion WebRTC SFU, ships a JS SDK, data channels, TURN replacement | First-choice self-hosted component for voice + low-latency data channels | 5 | [S33][S34] |
| **Colyseus** | commit 2026-11-07 | MIT | Node.js authoritative multiplayer framework, rooms + schema state sync | Can serve as the state-sync skeleton for an in-house engine | 4 | [S35] |
| **Nakama** | commit 2026-11-05 | Apache-2.0 | Go game backend: accounts/social/matchmaking/storage/realtime | Identity + social graph + matchmaking are directly usable, but it is heavy | 3 | [S36] |
| **WebTransport** | — | W3C standard / MDN docs | HTTP/3 + QUIC, streams + datagrams | Since 2026-03 "Baseline 2026 newly available"; a viable next-generation state transport | 3 | [S37] |
| **DID / AT Protocol** | atproto commit 2026-11-06 | dual-licensed MIT + Apache-2.0 (README verified) [S61]; DID is a W3C standard | handle (DNS) → DID (did:plc/did:web) → DID Document (public keys + services) | The best paradigm for choroweave's identity layer: human-readable name + cryptographic ID + `.well-known` resolution | 4 | [S38][S61] |
| **Nostr** | NIPs commit 2026-11-06; `nostr-protocol/nostr` 2025-06-27 | not verified (NIPs have no unified license field) | relays + events + secp256k1 keys; NIP-05 maps human-readable names via DNS | Worth borrowing: "key as identity + DNS name mapping", but the relay model does not fit 3D sessions | 2 | [S39] |
| **VRM / three-vrm** | three-vrm commit 2026-10-22 | MIT (three-vrm); the VRM spec is maintained by the VRM Consortium | glTF-derived humanoid avatar format + three.js runtime | Use directly for the avatar layer | 5 | [S51][S52] |
| **IPFS / Kubo** | commit 2026-09-27 | dual-licensed MIT + Apache-2.0 (contributions before 2019-05 are MIT-only, LICENSE verified) [S62] | CID content addressing + DHT + gateways | Good for validating/caching "immutable scene bundles", not for the primary address name | 2 | [S53] |

---

## 3. Item-by-item analysis

### 3.1 Third Room: the most complete design, the most thorough shutdown (abandoned)

Third Room was an official project of the Matrix.org Foundation, aiming to "run open, decentralized immersive worlds on Matrix". Technically it was very serious: the Manifold engine used **bitECS + three.js**, physics used `@dimforge/rapier3d-compat` (WASM), the render thread and game thread were separated through `SharedArrayBuffer`/`Atomics` (targeting 120 Hz rendering + 60 Hz logic), on the Matrix side `@thirdroom/hydrogen-view-sdk` + Olm handled identity and E2EE, and the scripting layer was an in-house **Web Scene Graph (WebSG)** — a "DOM-style API that copies the glTF data model", callable from JS or any language compiled to WASM, with a Monaco editor for in-site programming. [S1][S2][S3]

But the activity data is brutal: **last commit 2023-07-11** (PR #648, a physics body handle fix), then more than 3 years of zero commits, zero releases, 91 open issues/PRs; `pushed_at` 2023-08-30 is only a leftover branch. [S1] The site `thirdroom.io` still returns 200, but the body is only an SPA shell, which cannot prove the backend is still serving (**not verified** whether it is available). No official "project stopped" announcement was found — repository activity is the only evidence of an "effective shutdown".

Neither of its two protocol bets landed: the README bet networking/voice on **MSC3401** (Native Group VoIP), but the `proposals/` directory of the `matrix-spec-proposals` main branch has **no 3401 file** (that section only has 4143/4195/4196 and other MatrixRTC proposals); the **MSC3815 "Worlds"** it initiated (`m.world` room type + `m.world` state event, describing a 3D scene via `scene_url`/`script_url`/`base_scene`) is still a draft with `[WIP]` in its title, and never entered the main branch either. [S2][S8][S9] This matters a great deal for choroweave: **the "Matrix room as world" path was never closed at the standards level**.

As a foundation: not viable. As a design reference: WebSG's "glTF-mirroring API + WASM sandbox", MSC3815's "world = room + state events", and the product intuition that "worlds can be traversed quickly by switching rooms" are all worth copying into choroweave's design docs.

### 3.2 Portal precedents: `MX_portal` → `OMI_link` → archived, a clear failure chain (standards vacuum)

This is the most counter-intuitive and also the most critical finding of this research. Third Room really did define a portal extension: **`MX_portal`** attaches to any node, its `uri` property supports `http://`, `https://`, and the **`matrix:`** protocol, and together with `OMI_collider` as a trigger, "interacting with the portal makes the client navigate to the resource pointed to by uri"; known implementations listed Third Room and the Third Room Unity Exporter. [S4] Note a URI like `matrix:r/terra-1:thirdroom.io` — in essence this is a "spatial hyperlink".

But the document's current status is: **DEPRECATED. Use OMI_link instead.** [S4] And although OMI's `OMI_link` (Stage 1 draft) defines a more general `uri` (supporting relative paths, fragments, `https://...?autojoin=true#portal1`, and even treating `vrchat://launch?id=...` as a legal example), it never got a JSON Schema (the README says `TODO`) and never reached Stage 2; it was then moved from the active directory to `extensions/2.0/Archived/OMI_link`, archived together with `OMI_collider` and `OMI_personality`. [S5][S6][S7]

In other words: **as of today, the number of public glTF-level "spatial hyperlink" standards is zero**. OMI's active extensions are `OMI_spawn_point` (Stage 1 draft), `OMI_seat` (Stage 2, the highest maturity), `OMI_physics_*` (Stage 1), and the audio/environment/vehicle series; there is **no `OMI_portal`**. [S6][S7] For choroweave this is good news (an empty standards slot) and bad news (no ready-made semantics to inherit; you must define the "cross-server travel handshake" yourself).

### 3.3 Hyperfy v2: the only self-hosted web world that runs, but GPL-3.0 (shipped)

Hyperfy v2 is a world engine where a single Node process serves as both "authoritative server + client asset server": in `src/core` you can see `Socket.js`/`packets.js` (WebSocket + msgpack network packets), `loadPhysX.js` + `physx-js-webidl.wasm` (PhysX compiled to WASM), `lockdown.js` (SES sandbox; the official docs say "Apps run inside their own secure environment"), and `storage.js` (knex + better-sqlite3/Postgres). Dependencies also include `livekit-client@2.9.9` / `livekit-server-sdk@2.11.0` (voice), `@pixiv/three-vrm` (VRM avatars), `three@0.173`, `n8ao`/`postprocessing`, and `@anthropic-ai/sdk`/`openai` (v0.16's AI app generation feature). [S10][S11][S16]

The scripting model is its most valuable part: an App runs in a sandbox and can only see globals `app`, `props`, `fetch`, `num`, `Vector3/Quaternion/Euler/Matrix4`; `app.state` is authoritative state "sent with the initial snapshot when a new client connects"; `app.send(name, data)` sends events across the network; `world` exposes `networkId`, `isServer/isClient`, `add/remove/attach`, `enter/leave` events, `raycast`, `getPlayer/getPlayers`; `player.teleport(position, rotationY)` is an **in-world** teleport. [S12][S13][S14] The package format `.hyp` is a custom binary: 4-byte little-endian header length + JSON header (`blueprint` + `assets` metadata) + sequentially concatenated asset bytes. [S15]

But there is **no cross-world portal primitive**: the ref index only has Action/Anchor/App/Audio/Avatar/Collider/Group/LOD/Material/Mesh/Node/Num/Player/Props/rigidbody/UI/World, with no Portal/WorldLink; the App API also has no navigation capability (under the SES lockdown the App global has no `window`), and `player.teleport` only works within the current world. That is, building a portal on Hyperfy v2 requires changing core client code, not just writing an App. [S12][S14]

Release cadence: v0.8.0 (2025-02-22) → v0.16.0 (2025-12-18), 10 releases in total, after which the **main branch has no commits**, and dev runs to 2026-04-21 ("Add Light node" PR #157, dependency audit patch PR #159). The only high-frequency activity in the org is `firebolt` (React framework, 131★, commit on 2026-11-06). [S10][S12] Conclusion: **shipped, usable, but in a low-cadence maintenance phase**.

The license is **GPL-3.0** (LICENSE text verified). [S10][S11] The implications for choroweave are expanded in §4: you can "host Hyperfy worlds as a separate process/separate URL and talk over the protocol", but you cannot link Hyperfy code into a reference implementation that is to be released under Apache/MIT, unless the entire reference implementation is also GPL-3.0.

### 3.4 Hyperfy v1: the previous generation of world-as-NFT (abandoned / superseded by v2)

`docs.hyperfy.io` is still the v1 documentation, and its first sentence is "Hyperfy is a virtual world engine that lets you own, build and trade entire worlds in the metaverse. **All worlds live on the Ethereum blockchain** and can be freely traded on the open market."; the SDK is React hooks style (`useWorld()` returns an engine handle with `isServer`), and a world = an on-chain asset + a set of hosted scene assets, which can be "freely traded on the open market". [S17][S18]

v2 was a complete rebuild: the org keeps `hyperfy-ref` ("the old reference repo for what is now Hyperfy V2") and `hyperfy-apps` ("Catalog of hyperfy v2 apps (.hyp files) + **archive of v1 apps**"), and v1 apps can now only exist as an archive. [S19] This shows the team itself concluded that v1's architecture (on-chain worlds + React runtime) did not work, and only then pivoted to "self-hosted Node worlds + .hyp sandboxed apps".

The lesson for choroweave is direct: **making "worlds" tradable on-chain assets degrades "spatial hyperlinks" into "asset jumps"** — what you can link is a commodity owned by someone else, not a space that can be freely deployed. But v2 still keeps the `$HYPER` token and DAO docs (Token/DAO/Proposals in the docs.hyperfy.xyz navigation), which shows the team has not fully left the crypto-asset narrative — this is a brand risk for "open-source infrastructure for ordinary users", and choroweave must draw a clear line if it builds a host adapter.

### 3.5 Mozilla Hubs: misjudged as "dead", actually the healthiest open-source web metaverse (shipped/active)

Hubs was started by Mozilla; in 2024 Mozilla announced it was leaving and the community formed the **Hubs Foundation** to take over. The official year-end recap is blunt: "At the start of 2024... there was a team of paid employees maintaining it... Then came the news that Mozilla was leaving and it was up to the community if Hubs would continue on. And continue on it did!", and it lists 2024 milestones such as "shutdown announcement / farewell party". [S21] (Mozilla's official support page `support.mozilla.org/kb/end-support-mozilla-hubs` exists, but the 2026-11-07 crawl was blocked by a JS challenge; **body text not verified**.)

Evidence from 2026 shows it is alive: the official News page has **2026-10-29** "The Recent Node And PHP Security Vulnerabilities", **2026-09-08** "Kubernetes 1.34+ Issues" and the "CE deploy scripts v2.1.1 release"; GitHub `Hubs-Foundation/hubs` has 2223★, MPL-2.0, master last commit **2026-08-23** ("Remove the last bits of Mozilla branding"), and the repo was still pushed on 2026-10-29. [S20][S21][S22] Tech stack: A-Frame + three.js + Spoke scene editor + Blender add-on; the backend **Reticulum** (Phoenix/Elixir, "hybrid game-networking and web API server", WebSocket + Phoenix Channels pub/sub + PostgreSQL) handles entity state, audio/video/screen sharing go through `dialog` + `DialogAdapter`; the client networking layer uses networked-aframe. [S22][S23][S24]

The most copyable part is its portal implementation: the official doc **"Linking Hubs Rooms"** teaches you to place a `Link` element in Spoke — the exact words are "Place the link element where you want your **portal** to the other room", or simply paste another room's URL inside a room, and Hubs automatically generates a room screenshot card and a "Visit Room" link. [S24] This is the **already-live**, most mature open implementation of "in-space hyperlinks", but its semantics stop at URL navigation: no cross-instance identity handoff, no state carrying, no protocol.

The license is **MPL-2.0** (file-level copyleft), far friendlier than GPL for "forking a reference client". The downside is that the backend is a heavy Elixir/Phoenix stack, so the self-hosting bar is higher than Hyperfy's single Node process.

### 3.6 Terminated and pivoted: Webaverse, Vircadia (abandoned / pivoted)

**Webaverse**: `webaverse/app` 376★, MIT, but last push **2022-12-20**; visiting `webaverse.com` on 2026-11-07 301s to **upstreet.ai**, a commercial product of "AI wiki + generated characters/scenes + NPCs + editor". [S42][S43] Conclusion: the original open-source Webaverse is terminated (**abandoned**), and the company pivoted to AI world tools. The lesson it leaves the industry: tying an "open metaverse client" to a crypto-asset economy means that once the funding/token narrative breaks, engineering investment drops to zero overnight.

**Vircadia**: `vircadia-native-core` 542★, Apache-2.0, last release 2024-03-04 "Atlas", after which the repo has only sporadic commits (2025-07-01). [S41] And vircadia.com's current pitch is "The reactivity layer for games" — PostgreSQL world state, transactions/rollback/triggers, anti-cheat, "Define your entire world in SQL", OAuth 2.0, containerized deployment, still labeled Apache-2.0. [S40] This is another counter-intuitive finding: **Vircadia no longer does the metaverse**; it has become game backend infrastructure (**pivoted**). The implication for choroweave: if "world state" can be abstracted into a table, the commercial value of "space" actually lands on backend capabilities such as state consistency/anti-cheat — exactly what choroweave should delegate to LiveKit/an in-house authoritative server rather than invent itself.

### 3.7 Still alive and already fossilized: Overte, Decentraland, JanusXR (shipped / abandoned mix)

**Overte** (**shipped/active**): a European-association fork in the Vircadia/High Fidelity lineage, 283★, Apache-2.0, **still releasing actively** (2026.10.1 = 2026-10-24, previous 2026.04.1 = 2026-06-13, still committing on 2026-11-04). It is a native C++/Qt desktop + VR application, emphasizing "hundreds of users simultaneously / 256 km² worlds / fully self-hosted / JS scripting engine". [S45][S46] For a web-stack choroweave, only the deployment model and the boundary of "one server hosts one world" are worth borrowing.

**Decentraland** (**shipped/migrating**): the old Unity client `decentraland/unity-renderer` was **archived on 2026-06-01** (Apache-2.0, last commit 2025-01-24); the new client `decentraland/godot-explorer` (Apache-2.0, 18★, commit on 2026-11-04) uses **Godot 4.6.2 + Rust**, and supports desktop/mobile/VR, SDK7, **LiveKit spatial voice**, and an Ethereum wallet. [S49][S50] Reference value: it confirms that "LiveKit for spatial voice" is the industry default, and also shows that "web client" is not the only route — if choroweave only does web, it gives up this already-validated cross-platform path.

**JanusXR / JanusWeb** (**abandoned, but conceptually a direct ancestor**): its website (still online on 2026-11-07) calls itself "re-imagines webpages as collaborative 3D webspaces **interconnected by portals**", and sells "embed any web page into a 3D portal widget" as a feature — **conceptually this is choroweave's direct ancestor**. But at the code level: `janusvr/janusweb` (MIT) last commit **2018-05-30**, `janusvr/janus-server` (MIT, presence server) last commit **2023-08-22**. [S44][S47][S48] Conclusion: the ideas are usable, the code is not; its failure also suggests that "web pages as spaces + portal interconnection" was already done in 2015-2018, and choroweave must create a generational gap in the **compiler pipeline** (natural language → space) and **identity continuity**.

### 3.8 Closed-source references: Resonite / VRChat / Rec Room / Roblox (closed source)

**Resonite / Neos VR**: the Resonite website (online on 2026-11-07) is a commercial product with a subscription, closed source; Neos VR is its predecessor. **License and user counts not verified**; it serves only as a closed-source reference: they prove that "high-fidelity social VR + creator economy" can be commercialized, but that has nothing to do with open protocols.

**VRChat / Rec Room / Roblox**. VRChat is Unity + Udon scripting + a closed platform, with world/avatar uploads through the official SDK; Roblox's **`TeleportService`** is the standard in-platform implementation of teleporting across places, supporting `TeleportData` to carry data and `ReserveServer` to reserve instances. [S54] This is a mature API design for "cross-space teleport + state carrying", worth copying the shape of, but it only works inside Roblox's cloud. What the three have in common: **teleport/portals are in-platform privileges**, never opened up as a cross-platform protocol. Specific DAU/concurrency numbers are **not verified** here (no second-hand numbers cited).

### 3.9 OMI: standards are moving, but precisely "portal" is missing (active standards work)

OMI (Open Metaverse Interoperability Group)'s glTF extension repo has 58★, uses the **W3C Software and Document License**, and was still committing in 2026 (last 2026-09-21, a sky-rotation fix for `OMI_environment_sky`). [S6] Its process sits under the **W3C Metaverse Interoperability Community Group**, in 5 Stages (Stage 1 = sketch + at least one champion; Stage 2 = complete JSON Schema + at least one implementation + sample asset). [S7]

Measured maturity (reading each README's Status section on 2026-11-07):
- `OMI_seat`: **Stage 2** (currently the highest);
- `OMI_physics_body` / `OMI_physics_gravity` / `OMI_physics_joint` / `OMI_physics_shape`: **Stage 1**;
- `OMI_spawn_point`: **Stage 1 Draft** (three optional fields `title`/`team`/`group`, attached to a node, using the node transform as the spawn point);
- `OMI_link`: **Stage 1**, and already moved into `Archived/`;
- `OMI_portal` does not exist. [S6][S7][S25]

The implication for choroweave: **`OMI_spawn_point` + `OMI_physics_*` + `OMI_seat` are already enough as the standards foundation for "spatial executability"** (spawn points, rigid bodies, collision, seats), while the "portal" layer is blank. A reasonable path: build `CHW_portal` in-house (or directly revive/rewrite the semantics of `OMI_link`) → ship it inside choroweave first → then submit a PR as OMI Stage 1 (the W3C CLA is a hard gate) → pursue Khronos in the long run. Note that OMI Stage 2 requires "at least one implementation + accessible sample assets", which is actually an advantage for choroweave with a reference implementation.

### 3.10 Matrix (part 1): world state should not travel as Matrix events (shipped, but usage is constrained)

**(a) State sync.** Matrix room state is a **persisted, federated-replicated, eventually consistent** event DAG, suitable for "what this world is" (scene URL, permissions, members), not for "where someone is this frame" (pose at dozens of times per second). Third Room's choice confirms this: it put **game networking** on WebRTC connections (README: "WebRTC connections for voice and game networking are established over Matrix"), and Matrix only handled signaling, asset hosting (mxc://), identity, E2EE, text chat, and permissions. [S2] In other words: **Third Room never ran real-time state through Matrix state events**.

This also explains why MSC3815 stayed WIP: it defines "what the world is" (`m.world` room type, `scene_url`, `script_url`, `base_scene`), not "what is happening inside the world". [S9] Conclusion for choroweave: Matrix's **room model** can be analogized to a "space manifest", but real-time state must go over a separate low-latency channel; do not stuff 20 Hz state into room events just to "reuse Matrix".

### 3.11 Matrix (part 2): MatrixRTC closed the voice/data gap in 2026, but the scale is still tens of people

**(b) Voice/RTC.** Matrix's 1:1 VoIP has long been in the spec (TURN server discovery etc.), but group calls relied on MSC3401 for a long time and were never merged. [S2][S8] It was only redesigned when **MSC4143 "MatrixRTC"** appeared: a general framework — E2EE + transports + **applications** (explicitly citing "a call, a shared document, or a **real-time game**") + **slots** (room state declaring which application types are allowed and their config) + **membership** (`m.rtc.member` events recording who joined which slot and with which transport) + sessions (implicitly formed by overlapping member times). [S31] **MSC4195** defines LiveKit as an optional transport: a multi-SFU architecture where each homeserver can run 0..N SFUs, members publish to their own SFU and subscribe to the publisher's SFU, with SFU discovery and token acquisition over federation, and no SFU election. [S32]

**(c) Landing and scale.** Element's 2026-10-22 announcement says MatrixRTC is "finally here", "the world's first decentralized, E2EE, scalable multi-party VoIP protocol"; it gives scale figures: **about 50 people for ESS Community / ordinary Synapse deployments, about 200 for ESS Pro**; E2EE is on by default; connect2x's Tammy is an independent implementation and interoperates across vendors; and a non-WebRTC cSFU is being explored. [S30] This is **vendor self-reporting, not third-party load testing**, but it has direct reference value for capacity planning: **tens of people per world** is the current engineering reality, not thousands.

**(d) E2EE and federation cost.** MatrixRTC's E2EE reuses the room/device message primitives, and media is encrypted with transport-specific encryption when passing through the SFU; the price is that every homeserver that wants to "start a call" has to deploy an SFU (Element's 2025-04 announcement says outright that self-hosted homeservers must add the MatrixRTC/LiveKit backend themselves). [S29][S30] For choroweave: **federation is not free**; every node has to run an SFU + TURN, and operational complexity is significantly higher than "one Node process".

**(e) Standards status.** As of 2026-11-07, searching `spec.matrix.org/latest` and `/unstable` body text for `rtc_foci`/`livekit`/MSC4143 returned no hits — that is, **the product has shipped, but the spec body has not been merged yet** (the crawl build may also be lagging; merge schedule **not verified**). [S56]

Conclusion: **do not treat Matrix as a world-state bus; you can treat MatrixRTC's slot/membership model as a conceptual template for "spatial session/presence"**, and implementing with LiveKit directly is simpler.

### 3.12 LiveKit / WebRTC / Colyseus / Nakama / WebTransport (shipped/active)

**LiveKit** (Apache-2.0, 22075★, still committing on 2026-11-07) is a distributed WebRTC SFU in Go + Pion, officially positioned as "realtime infrastructure for voice, video, and AI agents", offering a JS SDK, data channels, room permission tokens, and self-hosting. [S33][S34] It has already been validated by three products: Hyperfy v2 (voice), the Decentraland Godot client (spatial voice), and Element Call (MatrixRTC's reference transport). [S10][S50][S30] For choroweave: **voice + low-latency data channels can bet directly on LiveKit**, and it naturally fits the "one room token per space" model.

**Colyseus** (MIT, 7519★, 2026-11-07) is a Node.js authoritative multiplayer framework whose core is room + schema state-patch sync. [S35] If you want to "build your own world server", it is more general than Hyperfy's kernel and less work than writing from scratch; the downside is that it was not designed for 3D scene graphs, so you have to wire in three.js yourself.

**Nakama** (Apache-2.0, 13683★, 2026-11-05) is a game backend written in Go: accounts/social graph/groups/chat/matchmaking/leaderboards/storage/runtime scripts (Lua/TS/Go). [S36] Suitable as a "cross-world account and social layer", but too heavy as a real-time world server.

**WebTransport**: MDN explicitly marks it **Baseline 2026, "Since March 2026, this feature works across the latest devices and browser versions"**, based on HTTP/3 + QUIC, supporting multiple streams, unidirectional streams, out-of-order and unreliable datagrams (UDP-like). [S37] For choroweave this is a reasonable reservation for "next-generation state transport": use WebSocket + LiveKit data now, keep the interface abstracted, and switch when WebTransport is widespread.

### 3.13 Identity: DID/ATProto is the best-fitting shape, Nostr second, VRM only solves avatars (standards)

choroweave's identity needs have three layers: **stable ID** (not lost when changing servers), **human-readable name** (shareable, memorable), **public key/service discovery** (verify signatures, find home). AT Protocol's model maps almost item by item: a handle is a DNS name, resolved via DNS TXT or **HTTP well-known** into a DID (supporting `did:plc` and `did:web`), and the DID is then resolved into a DID Document (containing public keys and service addresses); the official docs explicitly list these requirements: ID stability, public key distribution, key rotation, service discovery, readability, portability. [S38] This three-part "DNS name ↔ cryptographic ID ↔ document" scheme maps neatly onto choroweave's `alice.example.com` ↔ `did:web:alice.example.com` ↔ `https://alice.example.com/.well-known/choroweave`.

**Nostr**'s NIP-05 is a lightweight version of the same idea (using DNS to map public keys to `name@domain`), but Nostr's relay/event model is oriented toward message broadcasting and does not fit real-time 3D sessions; and NIP-04 has been marked deprecated (moving to NIP-17). [S39] Borrow "key as identity"; do not adopt it wholesale.

**DID** itself is a W3C standard (`did:web` only needs one HTTPS document to be self-hosted, a great fit for personal-server scenarios). This crawl of `w3.org/TR/did-core/` was blocked by Cloudflare (**body text not verified**), but the atproto docs explicitly cite DID as a W3C standard and describe the `did:plc`/`did:web` implementations, which serves as indirect evidence. [S38]

**VRM**: the VRM Consortium maintains the "3D humanoid avatar file format for VR", based on glTF; `pixiv/three-vrm` (MIT, 2253★, commit 2026-10-22) is the de facto web runtime, and Hyperfy v2 already depends on it directly. [S51][S52] The avatar layer does not need to be built in-house.

### 3.14 Discovery and addressing: `.well-known` first, content addressing only as a "verification layer" (standards)

**HTTPS + `.well-known`**: RFC 8615 defines the reserved `/.well-known/` prefix (2019-05, Standards Track). [S55] Matrix already uses `/.well-known/matrix/client` for server discovery (clients find the homeserver base_url from a domain) — a mature "domain as entry point" paradigm. [S56] ATProto likewise uses well-known to resolve handle→DID. [S38] For choroweave: `https://<domain>/.well-known/choroweave` returning a world manifest (world list, entry scene URL, capability declarations, identity endpoint) is the most natural and most "personal server"-narrative-consistent option; **no custom scheme is needed**.

Problems with custom schemes (`web+xr://`, `matrix:`): browser support and UX for `registerProtocolHandler` are limited, and cross-device sharing degrades to text; `MX_portal` does support `matrix:`, but that is a convenience inside the Matrix client ecosystem, not a passport for the web ecosystem. [S4] Recommendation: **primary addressing uses HTTPS URLs; an optional scheme is only syntactic sugar**.

**Content addressing (IPFS/CID)**: a CID is a "content identifier", and the official docs specifically stress "CIDs are not file hashes" (it contains encoding/hash algorithm and other metadata). [S53] The advantages are immutability, verifiability, and natural deduplication; the disadvantage is that **addressing does not equal availability** — it needs pinning/gateways/DHT supply, cold content is far less available than a CDN, and semantics like "latest version" require an extra IPNS/contract layer. For choroweave: **use the domain as the world's primary name and a CID as the content name of the scene bundle** (`scene: ipfs://bafy...` + an HTTPS mirror in `world.json`), which gets verifiability without betting availability on a pinning service. The Kubo repo has 17174★ and was still committing on 2026-09-27, but operational realities like gateway rate limits have to be covered by yourself (**specific metrics not verified**).

**Self-hosting cost**: Hyperfy's official self-hosting docs give the paths Fly.io / VPS / DigitalOcean / Oracle / Coolify, and the `fly.toml` example only needs a few variables such as `NODE_ENV`, `WORLD`, `PORT`. [S57] Combined with the "single Node process + SQLite" architecture, one can judge that **one world ≈ one small VPS**; but specific price tiers are **not verified** here (Hetzner/DO pages are JS-rendered). Overte's "256 km²/single server" and Hubs' Reticulum mesh show that "many people" and "large land" are two different scaling dimensions.

---

## 4. Implications and recommendations for choroweave

### 4.1 The trade-off between three routes (direct reuse / fork / in-house)

**Route A: use Hyperfy v2 as the host (loosely coupled, without modifying its code)**
- Approach: each choroweave space = one Hyperfy world instance (separate domain/separate process); choroweave only defines the "world manifest + portal + identity handoff" protocol, and clients enter by URL navigation or iframe/new tab.
- Pros: **works today** (physics, VRM, voice, WebXR, app scripting all present); no GPL contagion (process/network boundary calls).
- Cons: constrained by Hyperfy's UX and script sandbox (cannot navigate to another world from an App; a portal must be added in the core layer); no cross-world state carrying inside the world; the brand and governance of the GPL world are not controlled by choroweave.
- Fit: **MVP / demo stage**, to prove the "spatial compilation + spatial hyperlink" experience loop as fast as possible.

**Route B: fork Hubs (MPL-2.0)**
- Approach: use `Hubs-Foundation/hubs` as the reference client, keep Spoke's `Link`/room model, and upgrade "Link" into a protocolized portal (with identity handoff).
- Pros: MPL-2.0 file-level copyleft — if you modify a file you must open-source that file, but you can combine it with non-MPL code; the A-Frame ecosystem is mature; there is already a shipped link UX.
- Cons: the Elixir/Phoenix backend is heavy and the self-hosting bar is high; the client code is old (Node 16 build baseline); the Hubs community is slow (no commits on master after 2026-08); it does not match an "Agent generates space" pipeline (Spoke is a manual editor).
- Fit: when you want a "mature client + forkable"; not recommended as the sole foundation.

**Route C: build a thin reference implementation in-house (recommended)**
- Approach: fork no engine; write a **~10k–20k line** reference client + world server yourself, covering only the main line "spatial compilation → glTF scene + manifest → roaming → portal → identity handoff", and delegate everything else to standard parts: three.js (rendering), Rapier or PhysX-WASM (physics), LiveKit (voice/data), VRM/three-vrm (avatars), `.well-known` + DID (discovery/identity), OMI extensions (scene semantics).
- Pros: clean license (can be Apache-2.0); protocol and implementation are separated, matching the "protocol + reference implementation" positioning; "portal semantics" can be a first-class citizen instead of a patch inside someone else's engine.
- Cons: the most work; you have to hit the physics/network/VRM pitfalls yourself (but Hyperfy's architecture can be read as a "public reference implementation"; note only that GPL constrains copying code, not learning API shapes — **confirm the exact legal boundary with counsel; this document is not legal advice**).

**Explicit recommendation**: choroweave's **protocol layer** should be its own repo (Apache-2.0 or CC-BY-4.0), the **reference implementation** should use Route C, and the **demo environment** should use Route A (Hyperfy as an optional host backend, declared through the `engine` field in the world manifest). **Do not** use Third Room or Hyperfy as the foundation: the former is dead, and the latter's GPL would contaminate your reference implementation.

### 4.2 Design recommendations for the portal protocol (`CHW_portal`)

Since the standard is a vacuum, get the semantics right the first time. Suggested minimal core:

1. **Scene side (glTF extension)**: `CHW_portal` attaches to a node with fields `uri` (required, absolute HTTPS URL; optional `#spawn` fragment), `title`, `mode` (`travel` / `mirror` / `preview`), `handoff` (`none` / `identity` / `identity+state`); the trigger reuses `OMI_physics_body`'s trigger or `OMI_collider`. This stays field-shape-compatible with `MX_portal`/`OMI_link`, minimizing migration cost when merging into OMI later. [S4][S5]
2. **Discovery side**: `GET https://<host>/.well-known/choroweave` → world manifest (`worlds[]`, `entry`, `capabilities`, `identity_endpoint`, `portal_policy`). Follow Matrix/ATProto's well-known practice. [S55][S56][S38]
3. **Travel handshake (the genuinely new thing)**: a portal is not "open a URL" but "a cross-server jump with credentials". Suggest `POST /portal/arrive`, carrying: the source world's signed claim (`did:web` signature), the user's DID, a target spawn hint, an optional state fragment (e.g., inventory/avatar appearance), and the target world returns a one-time session token. This keeps "URLs are shareable" while answering "who am I, where do I come from, what do I bring".
4. **Failure semantics**: when the target is offline, degrade to "static preview + revisit later" (cache the last known scene bundle by CID). This is the legitimate use of IPFS as a "verification/degradation layer".
5. **Do not** do cross-world real-time state sync in v1 (putting people from two worlds into the same physical space); start with "jump + identity continuity", the boundary validated by Hubs/Roblox/VRChat. [S24][S54]

### 4.3 Recommended combination of identity and state

- **Identity**: `did:web` (self-hosted, `https://<domain>/.well-known/did.json`) + DNS handle (`alice.example.com`) + optional ATProto interop (map the handle to an existing `did:plc`). **Do not** use a Matrix ID as the primary identity: it is bound to a homeserver, `@alice:matrix.org` breaks when changing servers, which conflicts with the goal of "personal servers can move".
- **Avatars**: VRM 0.x/1.0 + three-vrm, reused directly; do not invent a format.
- **Voice/data**: LiveKit (Apache-2.0), one room per space, tokens issued by the world server; reserve a WebTransport backend abstraction (Baseline since 2026-03). [S33][S37]
- **World state**: an in-house WebSocket + binary (msgpack/flatbuffers) authoritative server, 20–30 Hz tick + client interpolation; reference Hyperfy's `app.state` snapshot and `app.send` event model. [S12] If you want to save effort, Colyseus can serve as the skeleton. [S35]
- **Spatial session/presence model**: conceptually borrow MatrixRTC's slot/membership ("who is in this space, present over which transport"), but do not introduce Matrix in the implementation. [S31]

### 4.4 License strategy

| Layer | Recommended license | Rationale |
|---|---|---|
| Protocol/spec text | CC-BY-4.0 or W3C Software & Document License | Consistent with OMI, easier to submit to the W3C CG later [S6] |
| Reference implementation | Apache-2.0 | Consistent with the Third Room/Overte/LiveKit ecosystem, business-friendly |
| Optional Hyperfy adapter | separate process + GPL-3.0 (each complies on its own) | process boundary isolates, avoiding GPL contagion [S10] |
| Sample world content | CC0 / CC-BY | lowers friction for derivative works |

---

## 5. Risks and unknowns

1. **The "portal standards vacuum" is both an opportunity and a trap**: no precedent means you must define URI semantics, the security model (malicious portal phishing), and cross-domain identity trust yourself; the likely reason `OMI_link` was archived is that "URI semantics are left to the implementation", which makes standardization impossible — choroweave should hard-code a `uri` allowlist (https only + optional did) and signature verification in v1.
2. **The legal boundary of Hyperfy's GPL-3.0** (whether process isolation is enough, whether App scripts count as derivative works) is **not verified by counsel**; this document is not legal advice. If Route A becomes a core dependency, seek written clarification or a commercial license from the Hyperfy team early.
3. **Hyperfy's maintenance cadence**: no commits on main after 2025-12, dev until 2026-04; the team's energy is on `firebolt`. If you depend on its protocol evolution (e.g., an official portal), you may wait forever. Its 2H 2026 roadmap is **not verified**.
4. **Hubs' sustainability**: it relies on volunteers + donations, and in 2024 it even closed hosting providers like Virtual Link Hosting; MPL-2.0 means forkable, not maintained. Its 2027 plans are **not verified**.
5. **MatrixRTC's standards status**: the product shipped (2026-10-22), but no MSC4143 text was found in the spec body; and 50/200 people is a vendor figure, with **no independent load test**. If you go the Matrix route, design capacity for "tens of people per world".
6. **Consumer platform data is entirely not verified**: DAU/concurrency for VRChat/Rec Room/Roblox, Resonite's subscriber count, Decentraland's daily actives — no citable first-hand numbers were obtained this time (search results are second-hand aggregations, not cited per the task requirements). If needed, check each company's IR pages/official blogs.
7. **IPFS availability risk**: content addressing does not guarantee content is online; pinning service cost and gateway rate limits are operational realities. **Specific data not verified**.
8. **WebTransport ecosystem**: only Baseline since 2026-03; datagram behavior in Safari/Firefox and proxy/CDN support still need real testing (**not verified**).
9. **VRM's "spatialization" gap**: VRM only solves humanoid avatars, not "IK/lip-sync/expression sync for avatars in multiplayer scenes"; Hyperfy and VRChat each implement their own. If choroweave does not build this, there will be an experience gap where "the avatar shows up but the motion looks unnatural".
10. **Out of scope**: the pipeline for Agent-generated 3D content (text→glTF), the spatial compiler, and tacitweave's preference-modeling interface are not covered in depth here; in addition, **the current state of Resonite/Neos and Voxels/Cryptovoxels was only verified at the site level, with insufficient repo-level evidence**.

---

## 6. Source list

> All access dates: **2026-11-07** (unless otherwise noted). Stars/commit dates are as captured that day.

| ID | Source | URL |
|---|---|---|
| S1 | matrix-org/thirdroom repo (API: 656★, Apache-2.0, pushed 2023-08-30, 91 open issues) | https://github.com/matrix-org/thirdroom |
| S2 | Third Room README (MSC3401, MSC3815, Manifold engine, Apache-2.0) | https://github.com/matrix-org/thirdroom/blob/main/README.md |
| S3 | Third Room developer docs (WebSG, self-hosting, TURN) | https://thirdroom.io/docs/guides/developers.html |
| S4 | `MX_portal` extension (DEPRECATED, uri supports http/https/matrix:) | https://github.com/matrix-org/thirdroom/blob/main/docs/gltf/MX_portal/README.md |
| S5 | OMI `Archived/OMI_link` (Stage 1, uri semantics left to implementations, Schema TODO) | https://github.com/omigroup/gltf-extensions/blob/main/extensions/2.0/Archived/OMI_link/README.md |
| S6 | OMI gltf-extensions repo (W3C Software & Document License, commit 2026-09-21) | https://github.com/omigroup/gltf-extensions |
| S7 | OMI glTF extension index and Stage process (Available / Archived lists) | https://github.com/omigroup/gltf-extensions/blob/main/extensions/2.0/index.md ; https://github.com/omigroup/gltf-extensions/blob/main/README.md |
| S8 | MSC3401 Native Group VoIP (draft PR; no 3401 file in the main branch `proposals/`) | https://github.com/matrix-org/matrix-spec-proposals/pull/3401 |
| S9 | MSC3815 Worlds (`m.world` room type/state event, WIP draft) | https://github.com/matrix-org/matrix-spec-proposals/pull/3815 |
| S10 | hyperfy-xyz/hyperfy (310★, GPL-3.0, releases up to v0.16.0) | https://github.com/hyperfy-xyz/hyperfy |
| S11 | Hyperfy package.json (three 0.173, livekit 2.9.9, ses, better-sqlite3, three-vrm) | https://github.com/hyperfy-xyz/hyperfy/blob/main/package.json |
| S12 | Hyperfy Scripts docs (World/App/Node hierarchy, SES sandbox) | https://docs.hyperfy.xyz/docs/scripts/ |
| S13 | Hyperfy World API (networkId, isServer/isClient, raycast, getPlayers) | https://docs.hyperfy.xyz/ref/world/ |
| S14 | Hyperfy Player API (teleport(position, rotationY)) | https://docs.hyperfy.xyz/ref/player/ |
| S15 | Hyperfy `.hyp` format (4-byte header length + JSON header + assets) | https://docs.hyperfy.xyz/docs/hyp-format/ |
| S16 | Hyperfy CHANGELOG (v0.16.0 changes, AI app, XR, voice options) | https://github.com/hyperfy-xyz/hyperfy/blob/main/CHANGELOG.md |
| S17 | Hyperfy v1 docs ("All worlds live on the Ethereum blockchain") | https://docs.hyperfy.io/ |
| S18 | Hyperfy v1 `useWorld()` SDK | https://docs.hyperfy.io/sdk/ref/use-world |
| S19 | hyperfy-ref / hyperfy-apps (v1→v2 migration evidence) | https://github.com/hyperfy-xyz/hyperfy-ref ; https://github.com/hyperfy-xyz/hyperfy-apps |
| S20 | Hubs Foundation site (2026-09/10 news, A-Frame/three.js/Spoke/Blender) | https://hubsfoundation.org/ |
| S21 | Hubs Foundation 2024 year-end recap (Mozilla exit, community takeover) | https://hubsfoundation.org/posts/505/2024-year-end-recap-and-announcements/ |
| S22 | Hubs-Foundation/hubs (2223★, MPL-2.0, master last commit 2026-08-23) | https://github.com/Hubs-Foundation/hubs |
| S23 | Hubs networking docs (Reticulum/Phoenix Channels, dialog handles WebRTC) | https://docs.hubsfoundation.org/dev-client-networking |
| S24 | Hubs "Linking Hubs Rooms" (Spoke Link element = portal to the other room) | https://docs.hubsfoundation.org/creators-linking-rooms |
| S25 | OMI_spawn_point (Stage 1 Draft) | https://github.com/omigroup/gltf-extensions/blob/main/extensions/2.0/OMI_spawn_point/README.md |
| S26 | OMI_seat (Stage 2, highest maturity) | https://github.com/omigroup/gltf-extensions/blob/main/extensions/2.0/OMI_seat/README.md |
| S27 | OMI_physics_body (Stage 1) | https://github.com/omigroup/gltf-extensions/blob/main/extensions/2.0/OMI_physics_body/README.md |
| S28 | OMI org README (W3C Metaverse Interoperability CG, Stage process) | https://github.com/omigroup/omigroup |
| S29 | Element 2025-04-04: self-hosted homeservers need their own MatrixRTC/LiveKit backend | https://element.io/blog/end-to-end-encrypted-voice-and-video-for-self-hosted-community-users/ |
| S30 | Element 2026-10-22: MatrixRTC lands (50/200 people, E2EE, Third Room P2P mesh history) | https://element.io/blog/operator-i-need-an-exit-from-big-tech-calls/ |
| S31 | MSC4143 MatrixRTC framework (E2EE/transports/applications/slots/membership) | https://github.com/matrix-org/matrix-spec-proposals/blob/main/proposals/4143-matrix-rtc.md |
| S32 | MSC4195 LiveKit transport (multi-SFU publish/subscribe model) | https://github.com/matrix-org/matrix-spec-proposals/blob/main/proposals/4195-matrixrtc-livekit.md |
| S33 | livekit/livekit (22075★, Apache-2.0, Go + Pion) | https://github.com/livekit/livekit |
| S34 | LiveKit docs | https://docs.livekit.io/home/ |
| S35 | colyseus/colyseus (7519★, MIT, authoritative multiplayer framework) | https://github.com/colyseus/colyseus |
| S36 | heroiclabs/nakama (13683★, Apache-2.0) | https://github.com/heroiclabs/nakama |
| S37 | MDN WebTransport API (Baseline 2026, available since 2026-03) | https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API |
| S38 | AT Protocol Identity (handle→DID→DID Document, DNS/well-known resolution) | https://atproto.com/guides/identity |
| S39 | Nostr NIPs (NIP-05 DNS mapping; NIP-04 deprecated) | https://github.com/nostr-protocol/nips |
| S40 | Vircadia site ("The reactivity layer for games", PostgreSQL world state) | https://vircadia.com/ |
| S41 | vircadia-native-core (542★, Apache-2.0, last release 2024-03-04) | https://github.com/vircadia/vircadia-native-core |
| S42 | webaverse/app (376★, MIT, last push 2022-12-20; webaverse.com → upstreet.ai) | https://github.com/webaverse/app ; https://webaverse.com/ |
| S43 | The previous-generation Webaverse org (465 repos) | https://github.com/webaverse |
| S44 | JanusXR site ("3D webspaces interconnected by portals") | https://www.janusxr.org/ |
| S45 | overte-org/overte (283★, Apache-2.0, release 2026.10.1) | https://github.com/overte-org/overte |
| S46 | Overte README (256 km², JS scripting, fully self-hosted) | https://overte.org/ |
| S47 | janusvr/janusweb (17★, MIT, last commit 2018-05-30) | https://github.com/janusvr/janusweb |
| S48 | janusvr/janus-server (80★, MIT, last commit 2023-08-22) | https://github.com/janusvr/janus-server |
| S49 | decentraland/godot-explorer (Apache-2.0, Godot 4.6.2 + Rust, LiveKit voice) | https://github.com/decentraland/godot-explorer |
| S50 | decentraland/unity-renderer (archived 2026-06-01) | https://github.com/decentraland/unity-renderer |
| S51 | VRM official site (3D humanoid avatar format for VR) | https://vrm.dev/en/ |
| S52 | pixiv/three-vrm (2253★, MIT, commit 2026-10-22) | https://github.com/pixiv/three-vrm |
| S53 | IPFS docs: Content Identifiers (CIDs) ("CIDs are not file hashes") | https://docs.ipfs.tech/concepts/content-addressing/ |
| S54 | Roblox `TeleportService` (cross-place teleport + TeleportData + ReserveServer) | https://create.roblox.com/docs/reference/engine/classes/TeleportService |
| S55 | RFC 8615 Well-Known URIs (2019-05, Standards Track) | https://www.rfc-editor.org/rfc/rfc8615.html |
| S56 | Matrix Client-Server API: Server Discovery / `/.well-known/matrix/client` | https://spec.matrix.org/latest/client-server-api/#server-discovery |
| S57 | Hyperfy self-hosting docs (Fly.io / VPS / DigitalOcean / Oracle / Coolify) | https://docs.hyperfy.xyz/hosting/self/ |
| S58 | Resonite site (commercial subscription, closed source) | https://resonite.com/ |
| S59 | Khronos glTF 2.0 specification repo (root of the glTF extension system) | https://github.com/KhronosGroup/glTF |
| S60 | ipfs/kubo (17174★, commit 2026-09-27) | https://github.com/ipfs/kubo |
| S61 | atproto README: dual-licensed MIT + Apache-2.0 | https://github.com/bluesky-social/atproto/blob/main/README.md |
| S62 | ipfs/kubo LICENSE: MIT-only → dual MIT/Apache-2.0 migration note | https://github.com/ipfs/kubo/blob/master/LICENSE |

---

### Appendix: items not verified in this document (to avoid mis-citation)

- The body of Mozilla Hubs' official shutdown page (`support.mozilla.org` was blocked by a JS challenge), and the exact date of Mozilla's shutdown.
- Whether Third Room has an official "paused/terminated" announcement; whether the `thirdroom.io` backend is still serving.
- The final license and archival location of the Hyperfy v1 repo; the actual governance status of the `$HYPER` token and DAO.
- The 2027 roadmaps and team sizes of Hyperfy / Hubs.
- The merge schedule of MSC4143 on `spec.matrix.org`; third-party load-test data for MatrixRTC.
- First-hand user data for VRChat / Rec Room / Roblox / Resonite / Decentraland.
- Specific price tiers for Hetzner / DigitalOcean (pages are JS-rendered).
- The body of `w3.org/TR/did-core/` (blocked by Cloudflare); a unified license for Nostr NIPs.
- All "can it serve as a foundation" conclusions are engineering judgments and contain no legal advice; consult counsel for the exact compliance boundaries of GPL/MPL.
