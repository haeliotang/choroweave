# choroweave 执行摘要

> **English (primary):** [`docs/en/00-executive-summary.md`](en/00-executive-summary.md) · 本页为中文版（Chinese version）。

> 版本 v0.1 · 2026-11 · 基于四份一手调研（`docs/research/`）与 12 条 ADR（`docs/02-tech-selection.md`）
> 读者：创始人/投资人/首批贡献者。全文数字均标证据等级；估算明确标注"估算"。

---

## 1. 一句话

**choroweave 是空间时代的"HTML 编译器 + HTTP + 浏览器"**：把自然语言意图编译成可玩、可共在的 3D 世界包（World Bundle），用一套对齐 MSF "Web of Worlds" 的超链接协议（SHP）把个人节点上的世界连成网络，并给出可自托管的参考运行时与节点。它不做一个新的元宇宙平台，而做**平台之间的协议与工具**。

---

## 2. 为什么是现在（五个已验证的判断）

| # | 判断 | 关键证据 | 对我们的含义 |
|---|---|---|---|
| 1 | **需求真实存在，但"通用 3D 社交平台"模式已死** | Roblox 2026Q3 DAU **1.38 亿**、单季时长近 **340 亿小时**、收入 **$15.72 亿**；Minecraft MAU **1.55 亿**；VRChat MAU **>100 万**、峰值 CCU **158,192**。另一方面 Rec Room（1.5 亿累计玩家、$35 亿峰值估值）**2026-06-01 停服**；Spatial **2025-07 关闭托管**，CEO 明言"托管成本找不到可持续模型"（A/B） | 不要做"又一个平台"；做让个人/社区自己托管世界的协议与工具 |
| 2 | **生成层在贬值，互联层在升值** | TRELLIS.2（MIT）已能在 H100 上 **17 秒**生成带 PBR 的 GLB；但 LLM 端到端做完整游戏在五引擎基准 CEGame-Bench 中通关率仅 **16%**；World Labs 融资约 **$12.3 亿**、Marble 每世界 **$1.2–2.5**（A/B） | 生成能力会商品化，**可验证的空间编译 + 一致性 + 分发**才是稀缺资产 |
| 3 | **标准窗口正在打开，且缺口明确** | `KHR_interactivity` **2026-08-28 ratified**，但规范明确**仅单用户**、无 UI/脚本；OMI 没有 portal 扩展（`OMI_link` 已归档）；MSF 2026 提出 **"Web of Worlds"**，X3D 4.1 WoW Profile 定义 **Anchor（3D 超链接）/Inline（外部场景）**（A） | SHP 应**对齐 WoW 语义、补握手/信任/预取/回滚**；对象行为直接押注 KHR_interactivity |
| 4 | **VR-first 没有数据支撑** | IDC：2025 年头显出货 **-42.8%**；Vision Pro 全年约 **4.5 万台**（2024 年 39 万台）；Quest 前三季度 **-16%**；同期智能眼镜 **+211.2%**；唯一正向变量是 Steam Frame（2026-09 首发月占 SteamVR **5.49%**）（B） | **Web/桌面优先，WebXR 渐进增强**；visionOS 走 WebXR + `<model>`/Immersive API 双轨 |
| 5 | **单机 AI 生成不够，必须"骨架 + 验证"** | 2026 年工程共识：Roblox 的 Roblox Reality 采用"引擎持状态 + 视频模型只生成像素"；Matrix-Game 4.0 同构；TRELLIS.2 负责资产而非玩法（A/B） | LLM 只产出受约束的 Spatial-DSL；确定性装配 + 验证/修复循环；引擎管状态 |

---

## 3. 我们做什么 / 不做什么

**做（In scope）**
1. **Chôra Compiler**：意图/ISS → Spatial-DSL（内部 IR）→ 确定性装配 → World Bundle；含 6 类校验与修复循环。
2. **Spatial Hyperlink Protocol（SHP v0.1）**：HTTPS 世界寻址、`world.json`、`CHW_portal` 门户扩展、进入握手、能力协商、签名与门禁、预取预算。
3. **参考运行时 + 自托管节点**：Babylon.js 9.x（WebGL2-first）、WebSocket 房间（P1）→ WebTransport/WebRTC（P2+）、`weave-check` 一致性套件。
4. **示例与模板**：像素天台等 3 个 showcase 世界 + 模块化套件库 + 官方小游戏模块（L1）。

**不做（Out of scope，写进路线图与风险文档）**
- 不做 3A 引擎/自研 Web 引擎；不 fork Hyperfy（GPL-3.0 且停更）。
- 不做中心化托管垄断、不做 UGC 交易抽成为主收入（Rec Room 教训）。
- 不做 VR-first、不做链上土地/代币、不做自己的世界模型。
- P1-P2 不做 3DGS 流式大世界（`KHR_gaussian_splatting` 已 ratified，但仍排 P3 视觉增强）。
- 不承诺"一句话生成完整游戏"（2026 基准仅 16% 通关）。

---

## 4. 技术路径（12 条 ADR 摘要）

| 层 | 选择 | 放弃的替代 |
|---|---|---|
| 世界包 | glTF 2.0 + `KHR_interactivity` + `CHW_*` + `world.json` + 内容寻址 | 私有场景格式、纯视频世界模型 |
| 交互 | L0 行为图（默认）/ L1 精选联网模块 / L2 沙箱 WASM（P3+） | 开放任意 JS、把业务逻辑塞进行为图 |
| 运行时 | **Babylon.js 9.x（Apache-2.0，WebGL2-first）** + Runtime Adapter | three.js（无行为图执行器）、自研引擎 |
| 寻址/链接 | **HTTPS URL** + `.well-known` + `CHW_portal`，语义对齐 MSF WoW/X3D Anchor | 自定义 scheme、链上地址、另造空间语言 |
| 实时 | WebSocket（P1）→ **WebTransport / WebRTC DataChannel**（P2+）+ LiveKit 语音 | Matrix 实时状态、中心化游戏服 |
| 身份 | Passkey/OIDC → `did:web`；无区块链 | 钱包/代币、平台账号锁定 |
| 生成 | **骨架优先 + 确定性装配 + TRELLIS.2（MIT）**；Hunyuan3D 仅可选 | 端到端黑盒生成、Blender 硬依赖 |
| 物理 | **Rapier** + 自动碰撞体 + `CHW_collider` 兜底 | KHR_physics（仍是 Review Draft） |
| 许可证 | 代码 Apache-2.0 / 规范 CC-BY-4.0 / 示例 CC0-CC-BY | GPL 传染、非 OSI 模型默认依赖 |

详细论证见 [`02-tech-selection.md`](02-tech-selection.md)，其中第 5 节逐条列出**与原始设想的差异**（Third Room 停更、Hyperfy GPL、Matrix 不适合位姿同步、KHR_interactivity 仅单用户、VR-first 不成立等）。

---

## 5. 产品楔子（Wedge）

市场证据显示：**用户为事件停留，不为空间停留**（VRChat 峰值来自虚拟演唱会；Spatial 平台关闭但其社交游戏仍有 ~50 万 DAU）。因此分两步：

1. **P1 获客楔子：可寻址的展陈/作品集空间**——创作者用一句话生成"3D link-in-bio"（像素天台、个人展厅、小店），一条链接分享到现有社交平台。低门槛、可传播、内容供给快。
2. **P2 留存楔子：跨社区活动巡游**——多个创作者/社区的世界通过门户连成"活动路线"（展览、音乐会、解谜夜），以事件驱动回访。这正是"串门"的最小可行形态。

**定位叙事**：不是"另一个 VRChat/Rec Room"，而是 **"世界之间的 DNS + HTTP + 编译器"**；我们成功与否，取决于有多少**别人的**世界和节点用 SHP 连起来。

---

## 6. 24 个月路线图（摘要）

| 阶段 | 时间 | 目标 | 退出条件（Gate） |
|---|---|---|---|
| **P0 协议验证** | M0–M2（门禁 **2027-01-25**） | 手工造两个世界、节点互跳；SHP v0.1 + `weave-check`；零 AI | G0：双向传送 **10/10**、`weave-check` **22/22**、≥1 名外部开发者复现、0 次生成调用 |
| **P1 编译器 MVP** | M2-M6 | 一句话→单房间可玩世界；进入、对象交互、两世界互跳；旗舰 demo | G1：20 条评测 ≥70% 可玩、热切换 <1.5s、桌面 60fps |
| **P2 多人网络** | M6-M12 | 20 人房间、WebTransport、自托管节点一键部署、化身/门禁 | G2：20 人稳定 30 分钟、跨节点串门 demo、规范 v0.5 |
| **P3 生态与智能体** | M12-M18 | 常驻 Agent 接待、空间演化、社区节点网络、3DGS 视觉实验 | G3：100 个公开世界 / 10 个第三方节点、次周回访 ≥25% |
| **P4 沉浸与标准化** | M18-M24 | WebXR 深度适配（Quest 3 72fps）、协议 v1.0、治理移交 | G4：v1.0、3 个第三方运行时通过 conformance、visionOS 双轨可用 |

> 关键顺序修正：**P0 必须先于编译器**。先用无 AI 的手工世界验证门户/节点/描述符，否则无法判断编译器产出是否"可进入网络"。

---

## 7. 资源与预算（估算）

| 情景 | 团队 | 月成本（估算） | 24 个月（估算） | 说明 |
|---|---|---|---|---|
| 精益 | 3 FTE + 0.5 设计/社区 | **$45k–65k/月** | **$1.1–1.6M** | 运行时/图形 1、编译器/ML 1、协议/后端 1；外包美术；GPU 用按量 |
| 标准 | 8–10 FTE | **$140k–200k/月** | **$3.4–4.8M** | 增加技术美术、社区、DevRel、QA、安全/合规 |

成本驱动：人力（~70%）、GPU/模型调用（P1 期每月 $2k–8k，随世界生成量线性）、基础设施（节点托管/CDN，$500–3k/月，随公开世界增长）。**单位经济必须从 P1 开始测量**：每世界生成成本目标 < $8（估算），每 1000 次访问的带宽成本必须低于 $1。

---

## 8. 关键指标（KPI）

| 维度 | 指标 | P1 | P2 | P3 | P4 |
|---|---|---|---|---|---|
| 编译质量 | 20 条评测"可玩"通过率 | ≥70% | ≥85% | ≥90% | ≥95% |
| 编译速度 | 生成耗时 p50（draft / standard） | ≤10 / ≤20 min | ≤8 / ≤15 min | ≤5 / ≤10 min | ≤3 / ≤8 min |
| 生成成本 | 标准世界单次成本（CPW） | ≤$8 | ≤$6 | ≤$4 | ≤$3 |
| 网络体验 | 门户热切换耗时 p95 | <1.5s | <1.2s | <1.0s | <0.8s |
| 多人 | 20 人房间稳定时长 | — | ≥30 min | ≥60 min | ≥120 min |
| 生态 | 公开世界 / 第三方节点 | 3 / 0 | 30 / 3 | 100 / 10 | 500 / 50 |
| 留存 | 次周回访率（访问者） | — | ≥15% | ≥25% | ≥35% |
| 兼容 | 通过 conformance 的第三方运行时 | 1（自研） | 1 | 2 | ≥3 |

---

## 9. 主要风险与对冲（Top 6）

| 风险 | 证据 | 对冲 |
|---|---|---|
| **单元经济失败**（最致命） | Spatial 关闭托管；Rec Room 因 UGC 抽成结构停服（A/B） | 开放协议 + 自托管节点把成本外移；收入来自托管服务/企业部署/支持，不靠抽成；P1 起按世界测量带宽/GPU 成本 |
| **VR 需求不足** | 2025 头显出货 -42.8%；Vision Pro 4.5 万台（B） | Web/桌面优先；WebXR 渐进；visionOS 双轨；Steam Frame 作为开放 PC 头显观察点 |
| **平台挤压**（Roblox/Fortnite/Astrocade/Bitmagic/Marble） | Roblox DAU 1.38 亿；Astrocade $56M、5M MAU；Bitmagic GDK 面向 AI agent（A/B） | 不打正面：做"可携带的世界包 + 跨平台链接 + 自托管"；与平台互操作（导出 glTF/VRM）而非对抗 |
| **标准被大厂接管** | MSF WoW 已有议程；KHR_interactivity 已被 Babylon 等采用（A） | 早期提交 CHW_ 到 OMI/MSF；以 conformance 套件与参考实现建立事实标准；保持"轻量 profile"定位 |
| **安全/内容治理事故** | UGC + 跨节点 + 陌生人进入私人空间（C） | 默认私密 + 门禁（open/ring/allowlist/private）+ 行为图沙箱（无 JS）+ 举报/分级 + 签名与资产校验；P2 前完成威胁模型与红队 |
| **生成质量不达预期** | CEGame-Bench 16% 通关（A/B） | 骨架优先 + 模板降级 + 人工兜底；评测集驱动迭代；不承诺"任意想法一次成功" |

---

## 10. 与 Inceptless / tacitweave 的关系

- **独立项目、独立仓库、独立发布节奏**（避免把 3D 引擎塞进认知科学项目）。
- **契约式上下游**：tacitweave 输出 **Implicit Spatial Spec（ISS）**（审美/光线/声音/隐私/交互风格等隐性偏好）；choroweave 把它与显式意图合并编译。
- **ISS Schema 版本化**（`schemas/implicit-spatial-spec.schema.json`），双方可独立演进；P1 用 mock ISS，P2 再接入。
- 优先级：**P0/P1 不依赖 tacitweave**，避免上下游同时未就绪的死亡螺旋。

---

## 11. 未来 30 天行动清单

1. **冻结 SHP v0.1**：`world.json` 与 `CHW_portal` 字段、进入握手状态机、签名规范（本周内评审）。
2. **搭 P0 双世界 demo**：两个静态托管的 `.glb` + `world.json`，一个门户；验证"热切换 <1.5s"。
3. **跑通 Babylon + KHR_interactivity 最小闭环**：`KHR_interactivity` 官方测试资产 + Flow Graph 调试 + 行为图校验。
4. **落地 `weave-check` v0**：manifest/glTF/行为图/门户/预算 5 类校验 + CI。
5. **建评测集 v0**：20 条提示词 + 评分 rubric（可玩/比例/碰撞/性能/美感/安全），用现成 TRELLIS.2 出资产做人工基线。
6. **确定 3 个 showcase 世界选题**与创作者合作意向（像素天台/悬崖酒馆/地牢解谜）。
7. **法务/许可**：Hunyuan3D 条款、TRELLIS.2/Pixal3D 权重许可、示例资产来源、Apache-2.0/CC-BY-4.0 发布检查。
8. **对外叙事**：一篇《世界的 DNS 与 HTTP》技术宣言 + 可玩 demo 链接（desktop 优先）。

---

**相关文档**：[`01-landscape.md`](01-landscape.md) · [`02-tech-selection.md`](02-tech-selection.md) · [`03-architecture.md`](03-architecture.md) · [`04-spatial-hyperlink-protocol.md`](04-spatial-hyperlink-protocol.md) · [`05-roadmap.md`](05-roadmap.md) · [`06-mvp-spec.md`](06-mvp-spec.md) · [`07-risks-compliance.md`](07-risks-compliance.md) · [`08-open-source-strategy.md`](08-open-source-strategy.md)
