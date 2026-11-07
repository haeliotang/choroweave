# 01 · 空间网络平台、门户/传送门、身份与多人状态同步

> 调研对象：choroweave（把自然语言意图编译为「可执行空间」+ 空间超链接/传送门协议 + 联邦式 3D 万维网）
> 核实口径：**截至 2026-11 核实**（抓取日 2026-11-07，时区 Asia/Katmandu）。星数/许可证/最后提交均以当日抓取为准。
> 方法：GitHub REST API（`api.github.com/repos/...`）+ GitHub HTML/atom 订阅 + 官方文档与规范原文抓取，共 40+ 次检索/抓取。
> 状态标注：**shipped**（已发布可用）/ **demo**（有可运行演示）/ **announced**（仅公告）/ **abandoned**（停更/放弃）/ **未能核实**。

---

## 1. TL;DR

1. **Third Room 已实质停更**：`matrix-org/thirdroom` 最后提交 2023-07-11，无任何 release，91 个未关闭 issue/PR；官网仍返回 200 但只是 SPA 外壳。它是"设计参考"而非"可作底座"的项目。[S1][S2]
2. **门户/传送门标准是真空，不是红海**：Third Room 的 `MX_portal` 扩展已标记 DEPRECATED（改用 `OMI_link`），而 `OMI_link` 本身随后被移入 OMI 仓库的 `Archived/` 目录；OMI 至今**没有** `OMI_portal` 扩展。[S4][S5][S6]
3. **Hyperfy v2 是唯一"已发布、自托管、Web 原生、带 app 脚本 + 物理 + VRM 头像 + 语音"的开源世界引擎**，v0.16.0 发布于 2025-12-18；但许可证是 **GPL-3.0**，对 choroweave 是硬约束（只能"松耦合托管"或"整体 GPL"）。[S10][S11]
4. **Hyperfy 主仓 main 分支自 2025-12-18 后无提交**，dev 分支最后活动 2026-04-21；团队仍活跃在其 React 框架 `firebolt`（2026-11-06 有提交）——即"维护但低节奏、非扩张期"。[S10][S12]
5. **Mozilla Hubs 没死，反而复活了**：Hubs Foundation 以 MPL-2.0 继续维护 `Hubs-Foundation/hubs`（2223★，master 最后提交 2026-08-23，2026-10-29 仍有仓库推送），并发布 Community Edition 自托管方案与 2026 年运维公告。[S20][S21]
6. **Hubs 已经实现了事实上的"房间传送门"**：Spoke 的 `Link` 元素可以把任意房间 URL 放进场景当门，官方文档原话是"place the link element where you want your **portal** to the other room"；站内粘贴房间 URL 还会生成"Visit Room"链接。[S24]
7. **Matrix 路线在 2026 年反而变得可行，但 Third Room 没等到**：Element 2026-10-22 宣布 **MatrixRTC 落地**（去中心化、E2EE、多方可扩展 VoIP），明确回顾"我们走过 FreeSWITCH → Jitsi → P2P mesh（Third Room 与初代 Element Call）→ waterfall SFU → MatrixRTC"。[S30]
8. **Vircadia 已不是元宇宙项目**：vircadia.com（2026-11-07）现在自称"The reactivity layer for games"，卖点是 PostgreSQL 世界状态、反作弊、OAuth 2.0；其开源 `vircadia-native-core` 最后一个 release 停在 2024-03-04。[S40][S41]
9. **Webaverse 已终止、JanusXR 代码化石**：`webaverse/app` 最后推送 2022-12-20，webaverse.com 现 301 到 upstreet.ai；JanusWeb（MIT）最后提交 2018-05-30、janus-server 2023-08-22——尽管 janusxr.org 仍自称"由 portals 互联的 3D webspaces"，它其实是**概念上最接近 choroweave** 的先驱。[S42][S43][S44]
10. **技术选型上真正可复用的是"零件"而非"平台"**：LiveKit（Apache-2.0，22075★，2026-11-07 仍在提交）做语音/数据、Colyseus（MIT）或 Hyperfy 式自研 WebSocket 权威服做状态、VRM/three-vrm（MIT）做头像、`/.well-known` + DID 式 handle 做发现与身份；**没有任何现成项目可以直接当 choroweave 的底座**。

---

## 2. 项目 / 协议清单表

> 星数与最后提交为 2026-11-07 抓取值；"最近活动"列中日期为最后提交或最后 release 日期。可复用性为主观评分（1=仅可读，5=可直接依赖）。

| 项目 | 最近活动 | 许可证 | 技术栈 | 与 choroweave 关系 | 可复用性 | 证据 |
|---|---|---|---|---|---|---|
| **Third Room** (`matrix-org/thirdroom`) | 提交 2023-07-11 / push 2023-08-30，无 release | Apache-2.0 | three.js + bitECS + Rapier(WASM) + Matrix(hydrogen-sdk/Olm) + 自研 WebSG(WASM 脚本) + React/Vite；引擎代号 Manifold | 最接近"Matrix 上的 3D 万维网"的完整尝试；已停更，只能取设计 | 2 | [S1][S2][S3] |
| Third Room `MX_portal` 扩展 | 文档最后随仓库 2023 冻结 | Apache-2.0（随仓库） | glTF node 扩展：`uri` 支持 `http(s)://` 与 `matrix:`，配 `OMI_collider` 做触发器 | 空间超链接的**直接先例**，但已 DEPRECATED | 3（当规范草稿） | [S4][S5] |
| **OMI glTF 扩展** (`omigroup/gltf-extensions`) | 提交 2026-09-21（`OMI_environment_sky`） | W3C Software & Document License | glTF 2.0 vendor 扩展：spawn_point / seat / physics_* / audio / environment / vehicle_* | 空间描述层最可复用的标准载体；**无 portal** | 3 | [S6][S7] |
| **Hyperfy v2** (`hyperfy-xyz/hyperfy`) | release v0.16.0 = 2025-12-18；dev 分支 2026-04-21 | **GPL-3.0** | Node 服务端 + three.js 0.173 + PhysX(WASM) + LiveKit 语音 + better-sqlite3/Postgres + Fastify WS + msgpack + SES 沙箱 + three-vrm | 唯一 shipped 的自托管 Web 世界引擎；GPL 限制复用方式 | 4（作宿主）/2（作代码库） | [S10][S11][S16] |
| **Hyperfy v1** (`docs.hyperfy.io`) | v1 文档仍在，代码被 v2 取代；旧 app 归档在 `hyperfy-apps` | 未能核实（v1 仓库位置未确认；旧 app 已归档） | React hooks SDK（`useWorld`）+ Ethereum 世界 NFT | "世界即 NFT"路线，与 choroweave 的开放协议目标相反 | 1 | [S17][S18] |
| **Mozilla Hubs / Hubs CE** (`Hubs-Foundation/hubs`) | master 提交 2026-08-23；push 2026-10-29；CE 部署脚本 v2.1.1（2026-09-08） | **MPL-2.0** | A-Frame + three.js + Spoke 场景编辑器 + Blender add-on；Reticulum（Phoenix/Elixir，WebSocket + Phoenix Channels + PostgreSQL）；WebRTC 音视频走 `dialog` | 活跃、可 fork、已有"房间 Link 传送门"UX；后端是重栈 | 3 | [S20][S21][S22][S23][S24] |
| **Webaverse** (`webaverse/app`) | 最后 push 2022-12-20；webaverse.com → upstreet.ai | MIT | Web 客户端（three.js 系） | 失败案例：从开放元宇宙转向 AI 世界工具 | 1 | [S42] |
| **Vircadia** (`vircadia/vircadia-native-core`) | 最后 release 2024-03-04；push 2025-07-01 | Apache-2.0 | 原生 C++/Qt 客户端 + 服务端 | 已转型为游戏状态后端，元宇宙开源线停止 | 1 | [S40][S41] |
| **Overte** (`overte-org/overte`) | release 2026.10.1 = 2026-10-24；push 2026-11-04 | Apache-2.0 | C++/Qt 原生桌面+VR，JS 脚本，256km² 世界/服务器，完全自托管 | 活跃的**非 Web** 开源虚拟世界；可借鉴"单服务器世界"部署模型 | 2 | [S45][S46] |
| **JanusXR / JanusWeb** (`janusvr/*`) | janusweb 2018-05-30；janus-server 2023-08-22；janusxr.org 仍在线 | MIT | WebGL/JS 客户端 + Node presence server；"网页即 3D 空间，由 portals 互联" | **概念最接近** choroweave 的先驱，代码已成化石 | 1（思想 4） | [S44][S47][S48] |
| **Decentraland** (`decentraland/godot-explorer`) | 提交 2026-11-04；旧 Unity 客户端 2026-06-01 归档 | Apache-2.0 | Godot 4.6.2 + Rust 核心，SDK7，LiveKit 空间语音，以太坊钱包 | 从 Unity 迁 Godot 的活案例；非 Web 客户端 | 2 | [S49][S50] |
| **MatrixRTC**（MSC4143/4195/4196） | 产品落地 2026-10-22（Element 公告） | 规范 Apache-2.0；实现 AGPL-3.0 | 房间内 slot/membership 事件 + 多 SFU（LiveKit）传输 + E2EE | "空间会话/在场"模型的现成范式；不是世界状态传输 | 3 | [S30][S31][S32] |
| **LiveKit** | 提交 2026-11-07 | Apache-2.0 | Go + Pion WebRTC 的 SFU，自带 JS SDK、data channel、TURN 替代 | 语音 + 低延迟数据通道的首选自托管件 | 5 | [S33][S34] |
| **Colyseus** | 提交 2026-11-07 | MIT | Node.js 权威多人框架，房间 + schema 状态同步 | 可作为"自研引擎"的状态同步骨架 | 4 | [S35] |
| **Nakama** | 提交 2026-11-05 | Apache-2.0 | Go 游戏后端：账号/社交/匹配/存储/实时 | 身份+社交图+匹配可直接用，但重 | 3 | [S36] |
| **WebTransport** | — | W3C 标准/MDN 文档 | HTTP/3 + QUIC，流 + 数据报 | 2026-03 起 "Baseline 2026 newly available"，可作下一代状态传输 | 3 | [S37] |
| **DID / AT Protocol** | atproto 提交 2026-11-06 | 双许可 MIT + Apache-2.0（README 已核实）[S61]；DID 为 W3C 标准 | handle(DNS) → DID(did:plc/did:web) → DID Document（公钥+服务） | choroweave 身份层的最佳范式：人类可读名 + 密码学 ID + `.well-known` 解析 | 4 | [S38][S61] |
| **Nostr** | NIPs 提交 2026-11-06；`nostr-protocol/nostr` 2025-06-27 | 未能核实（NIPs 无统一 license 字段） | 中继 + 事件 + secp256k1 密钥；NIP-05 用 DNS 映射人类可读名 | 可借鉴"密钥即身份 + DNS 名映射"，但中继模型不适合 3D 会话 | 2 | [S39] |
| **VRM / three-vrm** | three-vrm 提交 2026-10-22 | MIT（three-vrm）；VRM 规范由 VRM Consortium 维护 | glTF 派生的 humanoid 头像格式 + three.js 运行时 | 头像层直接用 | 5 | [S51][S52] |
| **IPFS / Kubo** | 提交 2026-09-27 | 双许可 MIT + Apache-2.0（2019-05 前贡献为 MIT-only，LICENSE 已核实）[S62] | CID 内容寻址 + DHT + 网关 | 适合做"不可变场景包"的校验/缓存，不适合做寻址主名 | 2 | [S53] |

---

## 3. 逐项分析

### 3.1 Third Room：最完整的设计，最彻底的停摆（abandoned）

Third Room 是 Matrix.org Foundation 的官方项目，目标是"在 Matrix 上跑开放、去中心化的沉浸式世界"。技术上它非常认真：引擎 Manifold 用 **bitECS + three.js**，物理用 `@dimforge/rapier3d-compat`（WASM），渲染线程与游戏线程通过 `SharedArrayBuffer`/`Atomics` 分离（目标 120Hz 渲染 + 60Hz 逻辑），Matrix 侧用 `@thirdroom/hydrogen-view-sdk` + Olm 做身份与 E2EE，脚本层是自研的 **Web Scene Graph (WebSG)**——一个"照抄 glTF 数据模型的 DOM 式 API"，可从 JS 或任意编译到 WASM 的语言调用，并配了 Monaco 编辑器做站内编程。[S1][S2][S3]

但活跃度数据很残酷：**最后提交 2023-07-11**（PR #648，物理 body handle 修复），此后 3 年多零提交、零 release、91 个未关闭 issue/PR；`pushed_at` 2023-08-30 只是分支残留。[S1] 官网 `thirdroom.io` 仍返回 200，但正文只有 SPA 外壳，无法证明后端仍在服务（**未能核实**可用性）。没有找到官方"停止项目"的公告——只能以仓库活动作为"实质停更"的证据。

它的两个协议赌注也都没落地：README 把联网/语音押在 **MSC3401**（Native Group VoIP）上，但 `matrix-spec-proposals` 主分支 `proposals/` 目录中**没有 3401 文件**（同区段只有 4143/4195/4196 等 MatrixRTC 提案）；它发起的 **MSC3815 "Worlds"**（`m.world` 房间类型 + `m.world` 状态事件，用 `scene_url`/`script_url`/`base_scene` 描述 3D 场景）至今是标题带 `[WIP]` 的草案，也未进入主分支。[S2][S8][S9] 这一点对 choroweave 非常重要：**"Matrix 房间即世界"这条路，标准层面从未闭合**。

作为底座：不可行。作为设计参考：WebSG 的"glTF 镜像 API + WASM 沙箱"、MSC3815 的"世界=房间+状态事件"、以及"世界可快速通过换房间穿行"的产品直觉，都值得抄进 choroweave 的设计文档。

### 3.2 门户先例：`MX_portal` → `OMI_link` → 归档，一条清晰的失败链（标准真空）

这是本次调研最反直觉、也最关键的发现。Third Room 曾经真的定义了传送门扩展：**`MX_portal`** 挂在任意 node 上，`uri` 属性支持 `http://`、`https://` 与 **`matrix:`** 协议，配合 `OMI_collider` 作为触发器，"与传送门交互会让客户端导航到 uri 指向的资源"；已知实现列出 Third Room 与 Third Room Unity Exporter。[S4] 注意 `matrix:r/terra-1:thirdroom.io` 这种 URI——它本质就是"空间超链接"。

但这份文档现在的状态是：**DEPRECATED. Use OMI_link instead.**[S4] 而 OMI 的 `OMI_link`（Stage 1 草案）虽然定义了更通用的 `uri`（支持相对路径、fragment、`https://...?autojoin=true#portal1`，甚至把 `vrchat://launch?id=...` 当合法示例），却始终没有 JSON Schema（README 里写 `TODO`），也从未进入 Stage 2；随后它被从活跃目录移到 `extensions/2.0/Archived/OMI_link`，与 `OMI_collider`、`OMI_personality` 一起归档。[S5][S6][S7]

也就是说：**到今天为止，公开的 glTF 层级"空间超链接"标准为零**。OMI 活跃的扩展是 `OMI_spawn_point`（Stage 1 草案）、`OMI_seat`（Stage 2，最高成熟度）、`OMI_physics_*`（Stage 1）、音频/环境/载具系列，**没有 `OMI_portal`**。[S6][S7] 对 choroweave 这是好消息（标准空位），也是坏消息（没有现成的语义可继承，必须自己定义"跨服务器旅行的握手"）。

### 3.3 Hyperfy v2：唯一能跑的自托管 Web 世界，但 GPL-3.0（shipped）

Hyperfy v2 是一个 Node 进程同时承担"权威服务器 + 客户端资源服务"的世界引擎：`src/core` 里能看到 `Socket.js`/`packets.js`（WebSocket + msgpack 网络包）、`loadPhysX.js` + `physx-js-webidl.wasm`（PhysX 编译到 WASM）、`lockdown.js`（SES 沙箱，官方文档原话"Apps run inside their own secure environment"）、`storage.js`（knex + better-sqlite3/Postgres）。依赖里还有 `livekit-client@2.9.9` / `livekit-server-sdk@2.11.0`（语音）、`@pixiv/three-vrm`（VRM 头像）、`three@0.173`、`n8ao`/`postprocessing`、`@anthropic-ai/sdk`/`openai`（v0.16 的 AI 生 app 功能）。[S10][S11][S16]

脚本模型是它最有价值的部分：App 运行在沙箱里，只能看到 `app`、`props`、`fetch`、`num`、`Vector3/Quaternion/Euler/Matrix4` 这些全局；`app.state` 是"新客户端连接时随初始快照下发"的权威状态；`app.send(name, data)` 跨网络发事件；`world` 暴露 `networkId`、`isServer/isClient`、`add/remove/attach`、`enter/leave` 事件、`raycast`、`getPlayer/getPlayers`；`player.teleport(position, rotationY)` 是**世界内**瞬移。[S12][S13][S14] 打包格式 `.hyp` 是自定义二进制：4 字节小端 header 长度 + JSON header（`blueprint` + `assets` 元数据）+ 顺序拼接的资源字节。[S15]

但**没有跨世界传送门原语**：ref 索引里只有 Action/Anchor/App/Audio/Avatar/Collider/Group/LOD/Material/Mesh/Node/Num/Player/Props/rigidbody/UI/World，没有 Portal/WorldLink；App API 也没有导航能力（SES lockdown 下 App 全局无 `window`），`player.teleport` 只在当前世界内生效。也就是说，在 Hyperfy v2 上做传送门必须改核心客户端代码，不能只写 App。[S12][S14]

版本节奏：v0.8.0 (2025-02-22) → v0.16.0 (2025-12-18) 共 10 个 release，之后 **main 分支无提交**，dev 分支到 2026-04-21（"Add Light node" PR #157、依赖审计补丁 PR #159）。org 里唯一高频活跃的是 `firebolt`（React 框架，131★，2026-11-06 有提交）。[S10][S12] 结论：**shipped、可用、但进入低节奏维护期**。

许可证是 **GPL-3.0**（已核验 LICENSE 文本）。[S10][S11] 对 choroweave 的含义在 §4 展开：可以"以独立进程/独立 URL 的方式托管 Hyperfy 世界，通过协议对话"，但不能把 Hyperfy 代码链进一个要 Apache/MIT 发布的参考实现，除非整个参考实现也 GPL-3.0。

### 3.4 Hyperfy v1：世界即 NFT 的上一代（abandoned / 已被 v2 取代）

`docs.hyperfy.io` 仍是 v1 文档，第一句就是"Hyperfy is a virtual world engine that lets you own, build and trade entire worlds in the metaverse. **All worlds live on the Ethereum blockchain** and can be freely traded on the open market."；SDK 是 React hooks 风格（`useWorld()` 返回带 `isServer` 的引擎句柄），世界 = 链上资产 + 一组被托管的场景资源，可"在开放市场上自由交易"。[S17][S18]

v2 是一次彻底的推倒重来：org 里保留 `hyperfy-ref`（"the old reference repo for what is now Hyperfy V2"）与 `hyperfy-apps`（"Catalog of hyperfy v2 apps (.hyp files) + **archive of v1 apps**"），v1 的 app 只能以归档形式存在。[S19] 这说明团队自己承认 v1 的架构（链上世界 + React 运行时）走不通，才转向"自托管 Node 世界 + .hyp 沙箱 app"。

对 choroweave 的教训很直接：**把"世界"做成可交易的链上资产，会让"空间超链接"退化成"资产跳转"**——你能链接的是别人拥有的一件商品，而不是一个可自由部署的空间。但 v2 仍保留 `$HYPER` 代币与 DAO 文档（docs.hyperfy.xyz 导航里的 Token/DAO/Proposals），说明团队并未完全脱离加密资产叙事——这对"面向普通用户的开源基础设施"是品牌风险，choroweave 若做宿主适配需要明确切割。

### 3.5 Mozilla Hubs：被误判为"已死"，其实是最健康的开源 Web 元宇宙（shipped/active）

Hubs 由 Mozilla 启动，2024 年 Mozilla 宣布退出、社区成立 **Hubs Foundation** 接手。官方年终回顾写得很直白："At the start of 2024... there was a team of paid employees maintaining it... Then came the news that Mozilla was leaving and it was up to the community if Hubs would continue on. And continue on it did!"，并列出"停服公告 / 送别派对"等 2024 大事记。[S21]（Mozilla 官方支持页 `support.mozilla.org/kb/end-support-mozilla-hubs` 存在，但 2026-11-07 抓取被 JS 挑战拦截，**正文未能核实**。）

2026 年的证据显示它活着：官网 News 有 **2026-10-29**"The Recent Node And PHP Security Vulnerabilities"、**2026-09-08**"Kubernetes 1.34+ Issues"与"CE 部署脚本 v2.1.1 发布"；GitHub `Hubs-Foundation/hubs` 2223★、MPL-2.0、master 最后提交 **2026-08-23**（"Remove the last bits of Mozilla branding"）、仓库在 2026-10-29 仍有推送。[S20][S21][S22] 技术栈：A-Frame + three.js + Spoke 场景编辑器 + Blender add-on；后端 **Reticulum**（Phoenix/Elixir，"hybrid game-networking and web API server"，WebSocket + Phoenix Channels pub/sub + PostgreSQL）负责实体状态，音视频/屏幕共享走 `dialog` + `DialogAdapter`；客户端网络层用 networked-aframe。[S22][S23][S24]

最值得抄的是它的"传送门"实现：官方文档 **"Linking Hubs Rooms"** 教你在 Spoke 里放 `Link` 元素——原话是"Place the link element where you want your **portal** to the other room"，或者直接在房间里粘贴另一个房间的 URL，Hubs 会自动生成房间截图卡片和 "Visit Room" 链接。[S24] 这是**已上线**的、"空间内超链接"最成熟的开放实现，但它的语义止于 URL 跳转：没有跨实例身份交接、没有状态携带、没有协议。

许可证 **MPL-2.0**（文件级 copyleft），对"fork 一个参考客户端"比 GPL 友好得多。缺点是后端是 Elixir/Phoenix 重栈，自托管门槛高于 Hyperfy 的单 Node 进程。

### 3.6 已终止与已转型：Webaverse、Vircadia（abandoned / pivoted）

**Webaverse**：`webaverse/app` 376★、MIT，但最后推送 **2022-12-20**；2026-11-07 访问 `webaverse.com` 会 301 到 **upstreet.ai**，后者是"AI wiki + 生成角色/场景 + NPC + 编辑器"的商业产品。[S42][S43] 结论：原开源 Webaverse 已终止（**abandoned**），公司转向 AI 世界工具。它留给行业的教训是：把"开放元宇宙客户端"和"加密资产经济"绑在一起，一旦融资/代币叙事断裂，工程投入会瞬间归零。

**Vircadia**：`vircadia-native-core` 542★、Apache-2.0，最后一版 release 是 2024-03-04 "Atlas"，此后仓库仅零星提交（2025-07-01）。[S41] 而 vircadia.com 现在的主打是"The reactivity layer for games"——PostgreSQL 世界状态、事务/回滚/触发器、反作弊、"Define your entire world in SQL"、OAuth 2.0、容器化部署，仍标注 Apache-2.0。[S40] 这是本次调研另一个颠覆直觉的发现：**Vircadia 已经不做元宇宙了**，它转成了游戏后端基础设施（**pivoted**）。对 choroweave 的启示：如果"世界状态"能被抽象成一张表，"空间"的商业价值反而落在状态一致性/反作弊这类后端能力上——这正是 choroweave 应该交给 LiveKit/自研权威服、而不是自己发明的东西。

### 3.7 仍然活着的与已成化石的：Overte、Decentraland、JanusXR（shipped / abandoned 混合）

**Overte**（**shipped/活跃**）：Vircadia/High Fidelity 血脉的欧洲协会 fork，283★、Apache-2.0，**仍在活跃发版**（2026.10.1 = 2026-10-24，上一版 2026.04.1 = 2026-06-13，2026-11-04 仍有提交）。它是原生 C++/Qt 桌面+VR 应用，强调"hundreds of users simultaneously / 256km² 世界 / 完全自托管 / JS 脚本引擎"。[S45][S46] 对 Web 技术栈的 choroweave 只能借鉴部署模型与"单服务器承载一个世界"的边界。

**Decentraland**（**shipped/迁移中**）：旧 Unity 客户端 `decentraland/unity-renderer` 于 **2026-06-01 被归档**（Apache-2.0，最后提交 2025-01-24）；新客户端 `decentraland/godot-explorer`（Apache-2.0，18★，2026-11-04 有提交）用 **Godot 4.6.2 + Rust**，支持桌面/移动/VR、SDK7、**LiveKit 空间语音**、以太坊钱包。[S49][S50] 参考价值：它验证了"LiveKit 做空间语音"是行业默认解，也说明"Web 客户端"不是唯一路线——choroweave 若只做 Web，等于放弃了这条已验证的跨端路径。

**JanusXR / JanusWeb**（**abandoned，但概念是直系祖先**）：其官网（2026-11-07 仍在线）自称"re-imagines webpages as collaborative 3D webspaces **interconnected by portals**"，并把"任意网页嵌入 3D portal widget"当卖点——**概念上这是 choroweave 的直系祖先**。但代码层面：`janusvr/janusweb`（MIT）最后提交 **2018-05-30**，`janusvr/janus-server`（MIT，presence server）最后提交 **2023-08-22**。[S44][S47][S48] 结论：思想可用，代码不可用；它的失败也提示"网页即空间 + 门户互联"在 2015-2018 年就有人做过，choroweave 必须在**编译管线**（自然语言→空间）和**身份延续**上做出代差。

### 3.8 闭源参照：Resonite / VRChat / Rec Room / Roblox（closed source）

**Resonite / Neos VR**：Resonite 官网（2026-11-07 在线）是带订阅制的商业产品，闭源；Neos VR 为其前身。**许可证与用户数未能核实**，仅作闭源参照：它们证明"高保真社交 VR + 创作者经济"可以商业化，但与开放协议无关。

**VRChat / Rec Room / Roblox**。VRChat 是 Unity + Udon 脚本 + 闭源平台，世界/头像上传走官方 SDK；Roblox 的 **`TeleportService`** 是平台内跨 place 传送的标准实现，支持 `TeleportData` 携带数据、`ReserveServer` 预留实例。[S54] 这是一个成熟的"跨空间传送 + 状态携带"API 设计，值得 choroweave 抄接口形状，但它只在 Roblox 云内有效。三家共同点：**传送/传送门是平台内特权**，从未开放为跨平台协议。具体 DAU/并发数本次**未能核实**（不引用二手数字）。

### 3.9 OMI：标准在推进，但恰恰缺"门户"（active standards work）

OMI（Open Metaverse Interoperability Group）的 glTF 扩展仓库 58★，采用 **W3C Software and Document License**，2026 年仍在提交（最后 2026-09-21，`OMI_environment_sky` 的天空旋转修复）。[S6] 其流程挂在 **W3C Metaverse Interoperability Community Group** 下，分 5 个 Stage（Stage 1 = 草图 + 至少一个 champion；Stage 2 = 完整 JSON Schema + 至少一个实现 + 样例资产）。[S7]

实测成熟度（2026-11-07 读取各 README 的 Status 段）：
- `OMI_seat`：**Stage 2**（目前最高）；
- `OMI_physics_body` / `OMI_physics_gravity` / `OMI_physics_joint` / `OMI_physics_shape`：**Stage 1**；
- `OMI_spawn_point`：**Stage 1 Draft**（`title`/`team`/`group` 三个可选字段，挂在 node 上，用节点变换当出生点）；
- `OMI_link`：**Stage 1**，且已移入 `Archived/`；
- 不存在 `OMI_portal`。[S6][S7][S25]

对 choroweave 的启示：**`OMI_spawn_point` + `OMI_physics_*` + `OMI_seat` 已经足够作为"空间可执行性"的标准底座**（出生点、刚体、碰撞、座位），而"门户"这一层是空白。合理路径是：自研 `CHW_portal`（或直接复活/重写 `OMI_link` 的语义）→ 先在 choroweave 内 shipped → 再按 OMI Stage 1 提 PR（W3C CLA 是硬门槛）→ 长期争取进 Khronos。注意 OMI 的 Stage 2 要求"至少一个实现 + 可访问样例资产"，这对有参考实现的 choroweave 反而是优势。

### 3.10 Matrix（一）：世界状态不该走 Matrix 事件（shipped，但用法受限）

**(a) 状态同步。** Matrix 的房间状态是**持久化、联邦复制、最终一致**的事件 DAG，适合"这个世界是什么"（场景 URL、权限、成员），不适合"某人这一帧在哪"（每秒数十次的姿态）。Third Room 的选择印证了这一点：它把**游戏联网**放在 WebRTC 连接上（README："WebRTC connections for voice and game networking are established over Matrix"），Matrix 只负责信令、资产托管（mxc://）、身份、E2EE、文字聊天与权限。[S2] 换句话说：**Third Room 从未用 Matrix 状态事件跑实时状态**。

这也解释了 MSC3815 为什么停留在 WIP：它定义的是"世界是什么"（`m.world` 房间类型、`scene_url`、`script_url`、`base_scene`），而不是"世界里正在发生什么"。[S9] 对 choroweave 的结论：Matrix 的**房间模型**可以类比"空间清单"，但实时状态必须另走一条低延迟通道；不要为了"复用 Matrix"而把 20Hz 的状态塞进 room event。

### 3.11 Matrix（二）：MatrixRTC 在 2026 年补齐了语音/数据，量级仍是几十人

**(b) 语音/RTC。** Matrix 的 1:1 VoIP 早已在 spec 里（TURN 服务器发现等），但群组通话长期靠 MSC3401，一直没合并。[S2][S8] 直到 **MSC4143 "MatrixRTC"** 出现才重新设计：它是一个通用框架——E2EE + transports + **applications**（明确举例"a call, a shared document, or a **real-time game**"）+ **slots**（房间状态里声明允许哪类应用及配置）+ **membership**（`m.rtc.member` 事件记录谁加入了哪个 slot、用什么 transport）+ sessions（靠成员时间重叠隐式形成）。[S31] **MSC4195** 定义 LiveKit 作为可选 transport：多 SFU 架构，每个 homeserver 可跑 0..N 个 SFU，成员向自己的 SFU 发布、向发布者的 SFU 订阅，通过 federation 做 SFU 发现与 token 获取，无需 SFU 选举。[S32]

**(c) 落地与规模。** Element 2026-10-22 公告称 MatrixRTC "finally here"，是"世界首个去中心化、E2EE、多方可扩展 VoIP 协议"；并给出规模口径：**ESS Community / 普通 Synapse 部署约 50 人，ESS Pro 约 200 人**；E2EE 默认开启；connect2x 的 Tammy 已独立实现，可跨厂商互通；并在探索非 WebRTC 的 cSFU。[S30] 这是**厂商自述、非第三方压测**，但对容量规划有直接参考价值：**几十人/世界**是当前工程现实，不是几千人。

**(d) E2EE 与联邦成本。** MatrixRTC 的 E2EE 复用房间/设备消息原语，媒体经 SFU 时用 transport 专属加密；代价是每个想"发起通话"的 homeserver 都得部署 SFU（Element 2025-04 公告直言自建 homeserver 需自补 MatrixRTC/LiveKit 后端）。[S29][S30] 对 choroweave：**联邦不是免费的**，每个节点都要跑 SFU + TURN，运维复杂度显著高于"一个 Node 进程"。

**(e) 标准状态。** 截至 2026-11-07，我用 `spec.matrix.org/latest` 与 `/unstable` 的正文检索 `rtc_foci`/`livekit`/MSC4143 均无命中——即**产品已发布，但规范正文尚未合并**（也可能抓取构建滞后，**未能核实**合并排期）。[S56]

结论：**不要把 Matrix 当世界状态总线；可以把 MatrixRTC 的 slot/membership 模型当作"空间会话/在场"的概念模板**，实现上直接用 LiveKit 更简单。

### 3.12 LiveKit / WebRTC / Colyseus / Nakama / WebTransport（shipped/active）

**LiveKit**（Apache-2.0，22075★，2026-11-07 仍在提交）是 Go + Pion 的分布式 WebRTC SFU，官方定位"realtime infrastructure for voice, video, and AI agents"，提供 JS SDK、data channel、房间权限 token、可自托管。[S33][S34] 它已经被三个产品验证：Hyperfy v2（语音）、Decentraland Godot 客户端（空间语音）、Element Call（MatrixRTC 的参考 transport）。[S10][S50][S30] 对 choroweave：**语音 + 低延迟数据通道可以直接押 LiveKit**，而且它与"每个空间一个房间 token"的模型天然契合。

**Colyseus**（MIT，7519★，2026-11-07）是 Node.js 权威多人框架，核心是 room + schema 状态补丁同步。[S35] 如果你要"自研世界服务器"，它比 Hyperfy 的内核更通用、比从零写更省事；缺点是它不是为 3D 场景图设计的，需要自己接 three.js。

**Nakama**（Apache-2.0，13683★，2026-11-05）是 Go 写的游戏后端：账号/社交图/群组/聊天/匹配/排行榜/存储/运行时脚本（Lua/TS/Go）。[S36] 适合做"跨世界的账号与社交层"，但作为实时世界服务器太重。

**WebTransport**：MDN 明确标注 **Baseline 2026，"Since March 2026, this feature works across the latest devices and browser versions"**，基于 HTTP/3 + QUIC，支持多流、单向流、乱序与不可靠数据报（UDP-like）。[S37] 对 choroweave 是"下一代状态传输"的合理预留：现在用 WebSocket + LiveKit data，接口抽象好，等 WebTransport 普及再切。

### 3.13 身份：DID/ATProto 是最贴合的形状，Nostr 次之，VRM 只解决头像（standards）

choroweave 的身份需求有三层：**稳定 ID**（换服务器不丢）、**人类可读名**（可分享、可记忆）、**公钥/服务发现**（验签、找家）。AT Protocol 的模型几乎逐条对应：handle 是 DNS 名，通过 DNS TXT 或 **HTTP well-known** 解析为 DID（支持 `did:plc` 与 `did:web`），DID 再解析为 DID Document（含公钥与服务地址）；官方明确列出这些要求：ID 稳定、公钥分发、密钥轮换、服务发现、可读性、可移植性。[S38] 这套"DNS 名 ↔ 密码学 ID ↔ 文档"的三段式，正好可以映射成 choroweave 的 `alice.example.com` ↔ `did:web:alice.example.com` ↔ `https://alice.example.com/.well-known/choroweave`。

**Nostr** 的 NIP-05 是同一个思路的轻量版（用 DNS 把公钥映射成 `name@domain`），但 Nostr 的中继/事件模型面向消息广播，不适合实时 3D 会话；且 NIP-04 已被标记 deprecated（转向 NIP-17）。[S39] 可借鉴"密钥即身份"，不建议整体采用。

**DID** 本身是 W3C 标准（`did:web` 只需一个 HTTPS 文档即可自托管，非常适合个人服务器场景）。本次抓取 `w3.org/TR/did-core/` 被 Cloudflare 拦截（**正文未能核实**），但 atproto 文档明确引用 DID 为 W3C 标准并说明 `did:plc`/`did:web` 两种实现，可作为间接证据。[S38]

**VRM**：VRM Consortium 维护的"3D humanoid avatar file format for VR"，基于 glTF；`pixiv/three-vrm`（MIT，2253★，2026-10-22 提交）是 Web 端事实标准运行时，Hyperfy v2 已直接依赖。[S51][S52] 头像层不必自研。

### 3.14 发现与寻址：`.well-known` 优先，内容寻址只做"校验层"（standards）

**HTTPS + `.well-known`**：RFC 8615 定义了 `/.well-known/` 这个保留前缀（2019-05，Standards Track）。[S55] Matrix 已经用 `/.well-known/matrix/client` 做服务器发现（客户端从域名找到 homeserver base_url），这是"域名即入口"的成熟范式。[S56] ATProto 同样用 well-known 解析 handle→DID。[S38] 对 choroweave：`https://<domain>/.well-known/choroweave` 返回世界清单（世界列表、入口场景 URL、能力声明、身份端点），是最自然、最符合"个人服务器"叙事的方案；**不需要自定义 scheme**。

自定义 scheme（`web+xr://`、`matrix:`）的问题：浏览器对 `registerProtocolHandler` 的支持与体验都有限，跨设备分享会退化成文本；`MX_portal` 虽支持 `matrix:`，但那是 Matrix 客户端生态内的便利，不是 Web 生态的通行证。[S4] 建议：**主寻址用 HTTPS URL，可选 scheme 仅作语法糖**。

**内容寻址（IPFS/CID）**：CID 是"内容标识符"，官方文档特别强调"CIDs are not file hashes"（它含编码/哈希算法等元数据）。[S53] 优点是不可变、可校验、天然去重；缺点是**寻址不等于可用**——需要 pinning/网关/DHT 供给，冷内容的可用性远低于 CDN，且"最新版本"这类语义要额外一层 IPNS/合约。对 choroweave：**世界的主名用域名，场景包的内容名用 CID**（`world.json` 里写 `scene: ipfs://bafy...` + HTTPS 镜像），既拿到可校验性，又不把可用性押在 pin 服务上。Kubo 仓库 17174★、2026-09-27 仍在提交，但网关限速等运维现实需自己兜底（**具体指标未能核实**）。

**自托管成本**：Hyperfy 官方自托管文档给出的路径是 Fly.io / VPS / DigitalOcean / Oracle / Coolify，`fly.toml` 示例里只需要 `NODE_ENV`、`WORLD`、`PORT` 等几个变量。[S57] 结合"单 Node 进程 + SQLite"的架构，可以判断**一个世界 ≈ 一台小规格 VPS**；但具体价格档位本次**未能核实**（Hetzner/DO 页面为 JS 渲染）。Overte 的"256km²/单服务器"、Hubs 的 Reticulum mesh 则说明"人多"和"地大"是两种不同的扩容维度。

---

## 4. 对 choroweave 的启示与推荐

### 4.1 三条路线的取舍（直接复用 / 分支 / 自研）

**路线 A：以 Hyperfy v2 为宿主（松耦合，不改其代码）**
- 做法：每个 choroweave 空间 = 一个 Hyperfy 世界实例（独立域名/独立进程），choroweave 只定义"世界清单 + 门户 + 身份交接"协议，客户端以 URL 跳转或 iframe/新标签方式进入。
- 优点：**今天就能跑**（物理、VRM、语音、WebXR、app 脚本全都有）；不传染 GPL（进程/网络边界调用）。
- 缺点：受限于 Hyperfy 的 UX 与脚本沙箱（无法从 App 内导航到另一个世界，必须在核心层加 portal）；世界内没有跨世界状态携带；GPL 世界的品牌与治理不受 choroweave 控制。
- 适合：**MVP / demo 阶段**，用最快速度证明"空间编译 + 空间超链接"的体验闭环。

**路线 B：fork Hubs（MPL-2.0）**
- 做法：以 `Hubs-Foundation/hubs` 为参考客户端，保留 Spoke 的 `Link`/房间模型，把"Link"升级成协议化的 portal（带身份交接）。
- 优点：MPL-2.0 文件级 copyleft，改文件就得开源该文件，但可以与非 MPL 代码组合；A-Frame 生态成熟；已有 shipped 的链接 UX。
- 缺点：Elixir/Phoenix 后端重、自托管门槛高；客户端代码年代久（Node 16 构建基线）；Hubs 社区节奏慢（master 2026-08 后无提交）；与"Agent 生成空间"的管线不匹配（Spoke 是手工编辑器）。
- 适合：想要"成熟客户端 + 可 fork"时；不建议作为唯一底座。

**路线 C：自研薄参考实现（推荐）**
- 做法：不 fork 任何引擎，自己写一个 **~1–2 万行**的参考客户端 + 世界服务器，只做"空间编译 → glTF 场景 + 清单 → 可漫游 → 门户 → 身份交接"这条主线，其余全部交给标准件：three.js（渲染）、Rapier 或 PhysX-WASM（物理）、LiveKit（语音/数据）、VRM/three-vrm（头像）、`.well-known` + DID（发现/身份）、OMI 扩展（场景语义）。
- 优点：许可证干净（可 Apache-2.0）；协议与实现分离，符合"协议 + 参考实现"的定位；能把"portal 语义"做成第一等公民，而不是在别人的引擎里打补丁。
- 缺点：工作量最大；物理/网络/VRM 的坑要自己踩（但 Hyperfy 的架构可以当"公开的参考实现"来读，只需注意 GPL 只约束复制代码，不约束学习 API 形状——**具体法律边界请法务确认，本文不构成法律意见**）。

**明确建议**：choroweave 的**协议层**独立成仓库（Apache-2.0 或 CC-BY-4.0），**参考实现**用路线 C，**演示环境**用路线 A（Hyperfy 作为可选宿主后端，通过"世界清单里的 `engine` 字段"声明）。**不要**把 Third Room 或 Hyperfy 当底座：前者已死，后者的 GPL 会污染你的参考实现。

### 4.2 门户协议（`CHW_portal`）的设计建议

既然标准是真空，就把语义一次做对。建议最小核心：

1. **场景侧（glTF 扩展）**：`CHW_portal` 挂在 node 上，字段 `uri`（必需，HTTPS 绝对 URL；可选 `#spawn` fragment）、`title`、`mode`（`travel` / `mirror` / `preview`）、`handoff`（`none` / `identity` / `identity+state`）；触发器复用 `OMI_physics_body` 的 trigger 或 `OMI_collider`。这与 `MX_portal`/`OMI_link` 的字段形状保持兼容，未来合并进 OMI 的迁移成本最低。[S4][S5]
2. **发现侧**：`GET https://<host>/.well-known/choroweave` → 世界清单（`worlds[]`、`entry`、`capabilities`、`identity_endpoint`、`portal_policy`）。参考 Matrix/ATProto 的 well-known 实践。[S55][S56][S38]
3. **旅行握手（真正的新东西）**：门户不是"打开一个 URL"，而是"一次带凭证的跨服务器跳转"。建议 `POST /portal/arrive`，携带：源世界的签名声明（`did:web` 签名）、用户 DID、目标 spawn 提示、可选的状态片段（如背包/化身外观），目标世界返回一次性 session token。这样既保留"URL 可分享"，又解决"我是谁、我从哪来、我带什么"。
4. **失败语义**：目标离线时降级为"静态预览 + 稍后再访"（用 CID 缓存最后已知场景包）。这是把 IPFS 当"校验/降级层"的正当用法。
5. **不要**在 v1 做跨世界的实时状态同步（把两个世界的人放进同一物理空间）；先做"跳转 + 身份延续"，这是 Hubs/Roblox/VRChat 都验证过的可行边界。[S24][S54]

### 4.3 身份与状态的推荐组合

- **身份**：`did:web`（自托管，`https://<domain>/.well-known/did.json`）+ DNS handle（`alice.example.com`）+ 可选 ATProto 互认（把 handle 映射到已有 `did:plc`）。**不要**把 Matrix ID 当主身份：它绑定 homeserver，`@alice:matrix.org` 换服务器就断，与"个人服务器可搬家"的目标冲突。
- **头像**：VRM 0.x/1.0 + three-vrm，直接复用，不发明格式。
- **语音/数据**：LiveKit（Apache-2.0），一个空间一个 room，token 由世界服务器签发；预留 WebTransport 后端抽象（2026-03 已 Baseline）。[S33][S37]
- **世界状态**：自研 WebSocket + 二进制（msgpack/flatbuffers）权威服务器，20–30Hz tick + 客户端插值；参考 Hyperfy 的 `app.state` 快照与 `app.send` 事件模型。[S12] 若想省事，Colyseus 可作骨架。[S35]
- **空间会话/在场模型**：概念上借 MatrixRTC 的 slot/membership（"谁在这个空间、以什么 transport 在场"），实现上不引入 Matrix。[S31]

### 4.4 许可证策略

| 层 | 建议许可证 | 理由 |
|---|---|---|
| 协议/规范文本 | CC-BY-4.0 或 W3C Software & Document License | 与 OMI 一致，便于日后提交 W3C CG [S6] |
| 参考实现 | Apache-2.0 | 与 Third Room/Overte/LiveKit 生态一致，商业友好 |
| 可选 Hyperfy 适配器 | 独立进程 + GPL-3.0（各自遵守） | 进程边界隔离，避免 GPL 传染 [S10] |
| 示例世界内容 | CC0 / CC-BY | 降低二次创作摩擦 |

---

## 5. 风险与未知

1. **"门户标准真空"既是机会也是陷阱**：没有先例意味着你要自己定义 URI 语义、安全模型（恶意 portal 钓鱼）、跨域身份信任；`OMI_link` 之所以归档，很可能就是因为"URI 语义交给实现"导致无法标准化——建议 choroweave 在 v1 就把 `uri` 白名单（仅 https + 可选 did）和签名校验写死。
2. **Hyperfy GPL-3.0 的法律边界**（进程隔离是否足够、App 脚本是否算衍生）**未经法务核实**，本文不构成法律意见。若路线 A 变成核心依赖，建议尽早取得 Hyperfy 团队的书面澄清或商业授权。
3. **Hyperfy 维护节奏**：main 分支 2025-12 后无提交，dev 到 2026-04；团队精力在 `firebolt`。若你依赖它的协议演进（比如官方 portal），可能等不到。**未能核实**其 2026 下半年路线图。
4. **Hubs 的可持续性**：靠志愿者 + 捐赠，2024 年还关闭了 Virtual Link Hosting 这类托管商；MPL-2.0 可 fork 但不等于有人维护。**未能核实**其 2027 年计划。
5. **MatrixRTC 的规范状态**：产品已发布（2026-10-22），但 spec 正文未检出 MSC4143 文本；且 50/200 人是厂商口径，**未做独立压测**。若走 Matrix 路线，容量要按"几十人/世界"设计。
6. **消费级平台数据全部未能核实**：VRChat/Rec Room/Roblox 的 DAU/并发、Resonite 的订阅数、Decentraland 的日活，本次都没有取到可引用的一手数字（搜索结果是二手聚合，按任务要求不引用）。需要的话应查各公司 IR 页面/官方博客。
7. **IPFS 可用性风险**：内容寻址不保证内容在线；pin 服务成本与网关限速是运维现实。**具体数据未能核实**。
8. **WebTransport 生态**：2026-03 才 Baseline，Safari/Firefox 的 datagram 行为与代理/CDN 支持仍需实测（**未能核实**）。
9. **VRM 的"空间化"缺口**：VRM 只解决人形头像，不解决"化身在多人场景中的 IK/口型/表情同步"，Hyperfy 与 VRChat 都是各自实现；choroweave 若不自研，会出现"头像能显示但动作不自然"的体验落差。
10. **未覆盖范围**：Agent 生成 3D 内容的管线（text→glTF）、空间编译器、tacitweave 的偏好建模接口，本文未深入；另外 **Resonite/Neos、Voxels/Cryptovoxels 的现状只做了站点级核实，仓库级证据不足**。

---

## 6. 来源列表

> 全部访问日期：**2026-11-07**（除特别注明）。星数/提交日期为当日抓取。

| 编号 | 来源 | URL |
|---|---|---|
| S1 | matrix-org/thirdroom 仓库（API：656★、Apache-2.0、pushed 2023-08-30、91 open issues） | https://github.com/matrix-org/thirdroom |
| S2 | Third Room README（MSC3401、MSC3815、Manifold 引擎、Apache-2.0） | https://github.com/matrix-org/thirdroom/blob/main/README.md |
| S3 | Third Room 开发者文档（WebSG、自托管、TURN） | https://thirdroom.io/docs/guides/developers.html |
| S4 | `MX_portal` 扩展（DEPRECATED，uri 支持 http/https/matrix:） | https://github.com/matrix-org/thirdroom/blob/main/docs/gltf/MX_portal/README.md |
| S5 | OMI `Archived/OMI_link`（Stage 1，uri 语义交给实现，Schema TODO） | https://github.com/omigroup/gltf-extensions/blob/main/extensions/2.0/Archived/OMI_link/README.md |
| S6 | OMI gltf-extensions 仓库（W3C Software & Document License，2026-09-21 提交） | https://github.com/omigroup/gltf-extensions |
| S7 | OMI glTF 扩展索引与 Stage 流程（Available / Archived 列表） | https://github.com/omigroup/gltf-extensions/blob/main/extensions/2.0/index.md ； https://github.com/omigroup/gltf-extensions/blob/main/README.md |
| S8 | MSC3401 Native Group VoIP（草案 PR，主分支 `proposals/` 无 3401 文件） | https://github.com/matrix-org/matrix-spec-proposals/pull/3401 |
| S9 | MSC3815 Worlds（`m.world` 房间类型/状态事件，WIP 草案） | https://github.com/matrix-org/matrix-spec-proposals/pull/3815 |
| S10 | hyperfy-xyz/hyperfy（310★、GPL-3.0、releases 至 v0.16.0） | https://github.com/hyperfy-xyz/hyperfy |
| S11 | Hyperfy package.json（three 0.173、livekit 2.9.9、ses、better-sqlite3、three-vrm） | https://github.com/hyperfy-xyz/hyperfy/blob/main/package.json |
| S12 | Hyperfy Scripts 文档（World/App/Node 层级，SES 沙箱） | https://docs.hyperfy.xyz/docs/scripts/ |
| S13 | Hyperfy World API（networkId、isServer/isClient、raycast、getPlayers） | https://docs.hyperfy.xyz/ref/world/ |
| S14 | Hyperfy Player API（teleport(position, rotationY)） | https://docs.hyperfy.xyz/ref/player/ |
| S15 | Hyperfy `.hyp` 格式（4 字节 header 长度 + JSON header + 资源） | https://docs.hyperfy.xyz/docs/hyp-format/ |
| S16 | Hyperfy CHANGELOG（v0.16.0 变更、AI app、XR、语音选项） | https://github.com/hyperfy-xyz/hyperfy/blob/main/CHANGELOG.md |
| S17 | Hyperfy v1 文档（"All worlds live on the Ethereum blockchain"） | https://docs.hyperfy.io/ |
| S18 | Hyperfy v1 `useWorld()` SDK | https://docs.hyperfy.io/sdk/ref/use-world |
| S19 | hyperfy-ref / hyperfy-apps（v1→v2 迁移证据） | https://github.com/hyperfy-xyz/hyperfy-ref ； https://github.com/hyperfy-xyz/hyperfy-apps |
| S20 | Hubs Foundation 官网（2026-09/10 新闻、A-Frame/three.js/Spoke/Blender） | https://hubsfoundation.org/ |
| S21 | Hubs Foundation 2024 年终回顾（Mozilla 退出、社区接手） | https://hubsfoundation.org/posts/505/2024-year-end-recap-and-announcements/ |
| S22 | Hubs-Foundation/hubs（2223★、MPL-2.0、master 最后提交 2026-08-23） | https://github.com/Hubs-Foundation/hubs |
| S23 | Hubs 网络文档（Reticulum/Phoenix Channels、dialog 负责 WebRTC） | https://docs.hubsfoundation.org/dev-client-networking |
| S24 | Hubs "Linking Hubs Rooms"（Spoke Link 元素 = portal to the other room） | https://docs.hubsfoundation.org/creators-linking-rooms |
| S25 | OMI_spawn_point（Stage 1 Draft） | https://github.com/omigroup/gltf-extensions/blob/main/extensions/2.0/OMI_spawn_point/README.md |
| S26 | OMI_seat（Stage 2，最高成熟度） | https://github.com/omigroup/gltf-extensions/blob/main/extensions/2.0/OMI_seat/README.md |
| S27 | OMI_physics_body（Stage 1） | https://github.com/omigroup/gltf-extensions/blob/main/extensions/2.0/OMI_physics_body/README.md |
| S28 | OMI 组织 README（W3C Metaverse Interoperability CG、Stage 流程） | https://github.com/omigroup/omigroup |
| S29 | Element 2025-04-04：自建 homeserver 需自备 MatrixRTC/LiveKit 后端 | https://element.io/blog/end-to-end-encrypted-voice-and-video-for-self-hosted-community-users/ |
| S30 | Element 2026-10-22：MatrixRTC 落地（50/200 人、E2EE、Third Room P2P mesh 历史） | https://element.io/blog/operator-i-need-an-exit-from-big-tech-calls/ |
| S31 | MSC4143 MatrixRTC 框架（E2EE/transports/applications/slots/membership） | https://github.com/matrix-org/matrix-spec-proposals/blob/main/proposals/4143-matrix-rtc.md |
| S32 | MSC4195 LiveKit transport（多 SFU 发布订阅模型） | https://github.com/matrix-org/matrix-spec-proposals/blob/main/proposals/4195-matrixrtc-livekit.md |
| S33 | livekit/livekit（22075★、Apache-2.0、Go + Pion） | https://github.com/livekit/livekit |
| S34 | LiveKit 文档 | https://docs.livekit.io/home/ |
| S35 | colyseus/colyseus（7519★、MIT、权威多人框架） | https://github.com/colyseus/colyseus |
| S36 | heroiclabs/nakama（13683★、Apache-2.0） | https://github.com/heroiclabs/nakama |
| S37 | MDN WebTransport API（Baseline 2026，2026-03 起可用） | https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API |
| S38 | AT Protocol Identity（handle→DID→DID Document，DNS/well-known 解析） | https://atproto.com/guides/identity |
| S39 | Nostr NIPs（NIP-05 DNS 映射；NIP-04 deprecated） | https://github.com/nostr-protocol/nips |
| S40 | Vircadia 官网（"The reactivity layer for games"、PostgreSQL 世界状态） | https://vircadia.com/ |
| S41 | vircadia-native-core（542★、Apache-2.0、最后 release 2024-03-04） | https://github.com/vircadia/vircadia-native-core |
| S42 | webaverse/app（376★、MIT、最后推送 2022-12-20；webaverse.com → upstreet.ai） | https://github.com/webaverse/app ； https://webaverse.com/ |
| S43 | 上一代 Webaverse 组织（465 个仓库） | https://github.com/webaverse |
| S44 | JanusXR 官网（"3D webspaces interconnected by portals"） | https://www.janusxr.org/ |
| S45 | overte-org/overte（283★、Apache-2.0、release 2026.10.1） | https://github.com/overte-org/overte |
| S46 | Overte README（256km²、JS 脚本、完全自托管） | https://overte.org/ |
| S47 | janusvr/janusweb（17★、MIT、最后提交 2018-05-30） | https://github.com/janusvr/janusweb |
| S48 | janusvr/janus-server（80★、MIT、最后提交 2023-08-22） | https://github.com/janusvr/janus-server |
| S49 | decentraland/godot-explorer（Apache-2.0、Godot 4.6.2 + Rust、LiveKit 语音） | https://github.com/decentraland/godot-explorer |
| S50 | decentraland/unity-renderer（2026-06-01 归档） | https://github.com/decentraland/unity-renderer |
| S51 | VRM 官方网站（3D humanoid avatar format for VR） | https://vrm.dev/en/ |
| S52 | pixiv/three-vrm（2253★、MIT、2026-10-22 提交） | https://github.com/pixiv/three-vrm |
| S53 | IPFS 文档：Content Identifiers (CIDs)（"CIDs are not file hashes"） | https://docs.ipfs.tech/concepts/content-addressing/ |
| S54 | Roblox `TeleportService`（跨 place 传送 + TeleportData + ReserveServer） | https://create.roblox.com/docs/reference/engine/classes/TeleportService |
| S55 | RFC 8615 Well-Known URIs（2019-05，Standards Track） | https://www.rfc-editor.org/rfc/rfc8615.html |
| S56 | Matrix Client-Server API：Server Discovery / `/.well-known/matrix/client` | https://spec.matrix.org/latest/client-server-api/#server-discovery |
| S57 | Hyperfy 自托管文档（Fly.io / VPS / DigitalOcean / Oracle / Coolify） | https://docs.hyperfy.xyz/hosting/self/ |
| S58 | resonite 官网（商业订阅制，闭源） | https://resonite.com/ |
| S59 | Khronos glTF 2.0 规范仓库（glTF 扩展体系的根） | https://github.com/KhronosGroup/glTF |
| S60 | ipfs/kubo（17174★，2026-09-27 提交） | https://github.com/ipfs/kubo |
| S61 | atproto README：dual-licensed MIT + Apache-2.0 | https://github.com/bluesky-social/atproto/blob/main/README.md |
| S62 | ipfs/kubo LICENSE：MIT-only → dual MIT/Apache-2.0 迁移说明 | https://github.com/ipfs/kubo/blob/master/LICENSE |

---

### 附：本文未能核实清单（避免误引）

- Mozilla Hubs 官方停服页正文（`support.mozilla.org` 被 JS 挑战拦截）、Mozilla 停服的精确日期。
- Third Room 是否有官方"暂停/终止"公告；`thirdroom.io` 后端是否仍在服务。
- Hyperfy v1 仓库的最终许可证与归档位置；`$HYPER` 代币与 DAO 的实际治理状态。
- Hyperfy / Hubs 的 2027 路线图与团队规模。
- MSC4143 在 `spec.matrix.org` 的合并排期；MatrixRTC 的第三方压测数据。
- VRChat / Rec Room / Roblox / Resonite / Decentraland 的一手用户数据。
- Hetzner / DigitalOcean 的具体价格档位（页面为 JS 渲染）。
- `w3.org/TR/did-core/` 正文（Cloudflare 拦截）；Nostr NIPs 的统一许可证。
- 所有"能否作为底座"的结论均为工程判断，不含法律意见；GPL/MPL 的具体合规边界请咨询法务。
