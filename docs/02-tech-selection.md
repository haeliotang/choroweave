# choroweave 技术选型：决策记录与证据（v0.2）

> **English (primary):** [`docs/en/02-tech-selection.md`](en/02-tech-selection.md) · 本页为中文版（Chinese version）。

> 状态：草案 · 截至 **2026-11-07** 核实 · 面向实现团队、开源社区与投资人
> 证据等级：**A** = 一手规范/官方文档/仓库元数据；**B** = 第三方实测或权威媒体报道；**C** = 工程判断/社区讨论。关键结论均标注等级；无法证实者标 `未知`。
> 配套：[`01-landscape.md`](01-landscape.md)（生态全景）、[`03-architecture.md`](03-architecture.md)（架构落地）、[`04-spatial-hyperlink-protocol.md`](04-spatial-hyperlink-protocol.md)（协议草案）、[`research/`](research/)（四份原始调研）。

---

## 1. 一页结论（ADR 总表）

choroweave 的技术路径压缩为 12 条决策。若只读一段：

> **我们不做"另一个引擎/平台"，而做"空间万维网"的三件套：可执行世界包（World Bundle）、门户/空间链接协议（SHP）、参考运行时与自托管节点。**
> 运行时押注 **KHR_interactivity（2026-08-28 已 ratified）+ Babylon.js**，但只把它限定在"资产内对象行为"——多人共在、世界规则、传送门**必须自研**。
> 寻址押注 **HTTPS URL**（而不是自定义 scheme 或链上地址），链接语义**对齐 MSF "Web of Worlds"/X3D Anchor**（而不是另造一套空间语言）。
> 生成押注 **骨架优先（Spatial-DSL + 确定性装配）+ TRELLIS.2（MIT）**，因为 LLM 端到端生成完整游戏在 2026 年的公开基准里只有 **16%** 通关率。
> 多人押注 **WebTransport/WebRTC + 自建房间服**（而不是 Matrix 事件流）。
> 主动放弃短期诱惑：**VR-first、3DGS 流式大世界、世界模型运行时、WebGPU-only**。

| # | 决策 | 主要证据 | 置信度 |
|---|---|---|---|
| ADR-01 | choroweave 独立孵化；与 tacitweave 以 **Implicit Spatial Spec（ISS）** 契约衔接，不合并仓库 | 技术栈/社区/演进节奏异构；ISS 可独立版本化 | 高 |
| ADR-02 | 世界产物 = **World Bundle**：glTF 2.0 `.glb` + `KHR_interactivity` + `CHW_*` 厂商扩展 + `world.json` + 内容寻址资产；**不是**私有场景格式 | glTF 是唯一多引擎/多工具消费的 3D 交付格式（A） | 高 |
| ADR-03 | 逻辑三层：**L0** KHR_interactivity（对象行为，标准）/ **L1** 精选联网小游戏模块（参数化）/ **L2** 能力沙箱 WASM（P3+）；规范明确 L0 **仅单用户、无 UI/脚本** | Khronos 规范 + Babylon 文档（A） | 高 |
| ADR-04 | 参考运行时 = **Babylon.js 8.x（Apache-2.0）**，**WebGL2-first**，WebGPU 特性增强；three.js 仅 3DGS/嵌入支线；**不 fork Hyperfy** | Babylon + glTF-SampleViewer 是仅有的两个 ratified 级实现（A） | 高 |
| ADR-05 | 世界标识 = **HTTPS URL（指向 `world.json`）**；`weave://` 仅可注册别名；资产 SHA-256 内容寻址 + CDN | 可点击/可缓存/可索引；自定义 scheme 无法在聊天工具直接打开（C） | 高 |
| ADR-06 | **SHP = MSF "Web of Worlds" 对齐的轻量 profile + `CHW_portal` 门户扩展 + 进入握手**；不等待 OMI（无 portal 扩展） | MSF/X3D 4.1 WoW Anchor/Inline（A/B）；OMI 扩展清单（A） | 高 |
| ADR-07 | 实时层：WebSocket 房间服（P0-P1）→ **WebTransport / WebRTC DataChannel**（P2+）+ LiveKit 语音；Matrix 仅可选社交桥，**不承载位姿** | WebTransport 92% caniuse（B）；Matrix 为异步事件 DAG（A/C） | 高 |
| ADR-08 | 身份 = **Passkey/OIDC** 起步 → `did:web` 可移植加强；**不引入区块链/代币**；头像先 glTF，P2 再 VRM | 降低入门/合规成本；无链上需求证据（C） | 中高 |
| ADR-09 | 编译器 = **骨架优先（Spatial-DSL + 确定性装配）+ LLM 规划 + 验证/修复循环**；资产默认 **TRELLIS.2（MIT）**；Hunyuan3D 仅可选 | TRELLIS.2 MIT（A）；CEGame-Bench 16% 通关（A/B） | 高 |
| ADR-10 | 物理 = **Rapier（Apache-2.0/WASM）**；碰撞体自动生成 + `OMI_physics_shape` 语义子集 + `CHW_collider` 兜底；KHR_physics 仍是 Review Draft，不能依赖 | Khronos registry（A）；OMI Stage 1（A） | 中高 |
| ADR-11 | 世界模型与 3DGS **不作多人持久运行时**；3DGS 虽已有 ratified 的 `KHR_gaussian_splatting`，仍排 P3 作视觉增强 | Genie 4 官方限制（A）；Marble 导出持久资产（A）；头显流式成本（B/C） | 中高 |
| ADR-12 | 许可证：**代码 Apache-2.0 / 规范 CC-BY-4.0 / 示例资产 CC0-CC-BY**；以 **一致性测试套件** 为治理核心 | 协议采用度取决于可自由商用 + 可验证（C） | 高 |

---

## 2. 评估方法与证据纪律

| 维度 | 权重 | 含义 |
|---|---|---|
| 标准对齐度 | 25% | 产物能否被第三方引擎/工具消费，而非锁定我们 |
| 生态与人才 | 15% | 库/工具/文档/可招聘开发者 |
| 性能与设备覆盖 | 15% | WebGL2 保底、WebGPU 增强、Quest/visionOS 可达 |
| 许可证与治理 | 10% | 能否被商业项目采用而不传染 |
| 维护活跃度 | 15% | 上游是否活跃、是否被少数人单点依赖 |
| 6 个月可行性 | 10% | 小团队能否做出可演示 MVP |
| 未来 3 年演化 | 10% | 是否随标准/硬件演进受益 |

**证据纪律**：优先规范原文、官方文档、GitHub API 元数据、厂商新闻稿；第三方文章只在交叉验证后引用并显式标注。所有 GitHub 数据为 2026-11-07 通过 REST API 读取；调研中 10 项无法从一手来源确认的事实集中列在 [`research/03`](research/03-runtime-standards.md) 的"未能核实"清单，实现时不得假设。

---

## 3. 关键决策详解

### ADR-02 / ADR-03：世界包与"逻辑三层"

**问题**：生成的"空间"交付成什么？私有引擎场景格式不可移植；纯 glTF 只有外观；玩法若写成宿主 JS，UGC 安全边界即失守。

**证据**：
- Khronos 2026-07-16 宣布 `KHR_interactivity` 提交批准；规范正文 Status 为 **"Complete, Ratified by the Khronos Group"**，批准日 **2026-08-28**（A：规范正文 + 扩展注册表；Khronos 未单独发 ratification 新闻稿，这是"仍在批准中"误读的来源）。
- Babylon.js 官方文档提供加载、校验、执行、Flow Graph 编辑、**无损导出**；未知附加扩展操作保留为 typed no-op（A：[Babylon KHR_interactivity 文档](https://github.com/BabylonJS/Documentation/blob/master/content/features/featuresDeepDive/importers/glTF/khrInteractivity.md)）。
- **规范边界**（A）：仅面向**单用户**、不处理多用户联网；不支持 UI、不支持任意脚本；行为图图灵完备但需要运行时限流。因此"多人共在 + 传送门 + 世界规则"**不在标准覆盖范围**，必须由 SHP/World Protocol 自研。
- 截止 2026-11，ratified 级实现只有 **Babylon.js** 与 **glTF-Sample-Viewer（UX3D）**；Unity 仅导出、Godot 仅伴生 `KHR_node_visibility`、three.js 无执行器（A/B）。

**决策**：
1. World Bundle 的**对象级交互**（点击播放/开关门/拾取/触发器/简单状态机）编译为 `KHR_interactivity` 行为图，作为可移植基线；宿主不执行资产内任意 JS。
2. **Spatial-DSL 是编译器内部 IR，不是公开标准**。公开契约是 World Bundle + `world.json`；DSL 允许随编译器版本演进（这是避免"规范未定先冻结 DSL"的关键）。对第三方编译器作者，提供"World Bundle 生成 SDK"而非要求实现 DSL。
3. L1（联网小游戏：五子棋、答题、钓鱼等）以**参数化官方模块**提供，避免 P2 阶段开放任意用户逻辑；L2（沙箱 WASM + 能力白名单）在 P3 提供，能力包含"读房间状态、发自定义事件、改声明过的属性"，同步白名单用 **glTF Object Model 的 JSON Pointer 路径**表达。

**代价**：L0 表达力有限（做不了复杂 RPG 逻辑）；L1 需要持续投入游戏模块；L2 的沙箱与网络确定性是长期工程。但这三层让"安全"与"可移植"从第一天成立。

**复盘信号**：若 2027 上半年 Godot/Unity 官方实现 KHR_interactivity 播放，则 L0 的采用红利放大，应加大"资产市场可移植"投入；若 Babylon 实现出现系统性一致性缺陷，再评估自研执行器。

---

### ADR-04：运行时为什么是 Babylon.js，以及"不做 WebGPU-only"

**候选与证据**：

| 候选 | 关键证据 | 结论 |
|---|---|---|
| **Babylon.js 8.x** | Apache-2.0；唯一 ratified 级 KHR_interactivity 通用引擎（加载/执行/Flow Graph/无损导出）；WebGL2+WebGPU 双后端；WebXR 成熟；Flow Graph 可视化调试（A） | **P0-P4 主运行时** |
| three.js | MIT、生态最大；但 **无 KHR_interactivity 执行器**；WebGPU+XR 仍是半成品：2026-04 才把"WebGPU 下 XR 直接抛错"改为自动回退 WebGL（PR #33497），XR framebuffer 仍在重构（#33154）（B） | 3DGS/嵌入支线 |
| PlayCanvas | WebGPU/3DGS 强（SuperSplat/SOG），但无 KHR_interactivity；适合资产优化与 3DGS 工具链（B） | 资产管线 |
| Hyperfy v2 | `hyperfy-xyz/hyperfy`：GPL-3.0，310 stars；v0.16.0 发布于 2025-12-18，main 分支此后无提交、dev 分支最后活动 2026-04-21（A）。是唯一 shipped 的自托管 Web 世界引擎，但**主仓低维护 + GPL-3.0 + 无跨世界门户原语** | 只借鉴设计，不 fork |
| Third Room | `matrix-org/thirdroom`：Apache-2.0，656 stars，最后 push 2023-08-30（A） | 只作历史参考 |
| 自研引擎 | 6 个月内无法同时覆盖 WebXR/WebGPU/物理/动画/行为图/编辑器 | 明确不做 |

**决策**：
- 参考运行时基于 Babylon.js 8.x，**WebGL2-first**（默认），WebGPU 通过特性探测用于桌面高质量预览、3DGS、后处理与计算密集效果；**XR 会话内默认 WebGL2**，因为 WebXR/WebGPU Binding 仍是 Editor's Draft、头显浏览器 WebGPU 状态未能核实、Babylon 的 WebGPU-XR 自标 experimental（A/B）。
- 在 Babylon 之上做 **Runtime Adapter**（场景加载、输入抽象、状态白名单、门户生命周期、化身/网络接口），目标是"3 个月内可替换为 three.js 适配器"，避免锁死。

**性能预算（写入引擎启动检查）**：

| 档位 | 设备 | 三角形/帧 | Draw calls | 纹理显存 | 首包 | 单空间 | 目标 |
|---|---|---|---|---|---|---|---|
| XR-Low | Pico 4 / Quest 2 | 20–30 万 | 40–60 | ≤300 MB | ≤5 MB | ≤15 MB | 72 Hz |
| **XR-Mid** | **Quest 3** | **30–50 万** | **50–80** | ≤400 MB | ≤8 MB | ≤30 MB | 72–90 Hz |
| XR-Apple | visionOS Safari | 50–80 万（估） | 60–100 | 未核实 | ≤8 MB | ≤30 MB | 90 Hz |
| Desktop | PC/笔记本 | 200–500 万 | 200–500 | ≤2 GB | ≤15 MB | ≤80 MB | 60 fps |

> XR 档位是在 Meta 官方原生预算（≤150 draw calls、<100 万三角形、纹理 500–700MB）上乘 0.5–0.7 的工程折减，**非官方数据**；visionOS/3DGS 必须实机标定。

---

### ADR-05 / ADR-06：门户为什么是"URL + 描述符 + WoW 对齐的扩展"

**问题**：如何让"推门进入朋友的世界"像点击链接一样自然，又不发明一套没人实现的协议？

**证据**：
- **MSF（Metaverse Standards Forum）2026 已提出 "Web of Worlds"**："pages become places, links become portals"；配套 **X3D 4.1 WoW Profile** 明确含 **Anchor（3D 超链接）** 与 **Inline（外部场景）** 节点，Threedy.io / Virginia Tech 在实现（A/B：MSF 白皮书、Web3D 博客）。
- glTF 侧：**没有 ratified 的空间链接扩展**。OMI 无 portal 扩展；`OMI_link` 已归档；`OMI_spawn_point` 仍 Stage 1（A）。
- 万维网经验：可点击、可缓存、可索引、可跨实现的是 URL/HTTP/HTML，而不是任何单一客户端（C，战略判断）。

**决策**：
1. **SHP 定位为 "Web of Worlds 的一个可实现 profile"**，不是新语言：语义上映射 WoW 的 Anchor（"链接即传送门"）/ Inline（外部场景），工程上补足 WoW 尚未定义的**进入握手、能力协商、信任、预取预算、失败回滚**。
2. **世界标识就是 HTTPS URL**：`https://alice.example/worlds/rooftop/world.json`；节点用 `/.well-known/weave-node.json` 声明能力与房间服务端点。
3. **门户是普通 glTF 节点 + `CHW_portal` 扩展**，最小字段对齐调研建议：`target`（URL/内容哈希）、`anchor`（节点 + 变换）、`handoff`（`same-instance` / `cross-instance` / `new-session`）、`policy`（权限/资源预算）、`version`。
4. **进入是一次有明确阶段的握手**：邻近预取 → 校验签名/能力 → 用户确认（可配免确认）→ 加入目标房间 → 保存化身状态 → 场景原子切换 → 失败回滚。指标：热切换 < 1.5s、冷启动 < 5s。
5. **扩展即降级**：不支持 `CHW_portal` 的查看器把它当普通装饰物，仍能浏览世界——符合 glTF 未知扩展忽略的哲学。

**与标准组织的关系**：先用 `CHW_` 前缀快速迭代并向 MSF/Web3D 社区提交映射文档；`OMI_spawn_point` 语义优先复用；**不等待标准化**（OMI 走完 Stage 3-5 至少 1-2 年）。

---

### ADR-07：实时多人为什么不是 Matrix

**证据与推理**：
- Matrix 面向**异步消息与状态事件（DAG）**，适合聊天/房间状态/权限；E2EE 与联邦复制带来延迟与写放大（A：Matrix 规范定位；C：实时性判断）。
- 多人空间需要 10-20Hz 位姿、确定性插值、丢包/乱序处理、低延迟语音；由 **WebTransport（QUIC datagram）** 或 WebRTC DataChannel 承载更合适。WebTransport 已是 W3C WD，Chrome 97+/Firefox 114+/Safari 26.4+，caniuse 2026-10 约 92%（B）。
- Third Room 核心仓 2023-08 后停更，**没有公开证据**表明 Matrix 实时同步被工程解决（A + C）。

**决策**：
- **P0-P1**：单房间 WebSocket 权威服务器（Node + 二进制协议，快照+增量，客户端插值），20 人以内。
- **P2+**：位姿/事件走 **WebTransport**（不可用时回退 WebRTC DataChannel 或 WebSocket）；语音走 LiveKit（Apache-2.0，自托管）。
- **Matrix 位置**：可选"社交桥"——世界关注、留言、活动通知、身份映射，不承载实时状态。
- **同步白名单**：网络层只允许修改 `world.json` 声明的可同步属性（JSON Pointer），防止 UGC 任意改场景。

---

### ADR-09：编译器为什么"骨架优先"

**问题**：LLM 直接一句话生成可玩空间，最容易在比例、连通性、碰撞、玩法可判定性上翻车。

**证据**：
- **CEGame-Bench（2026-10）**：让 agent 在 Defold/Godot/Roblox/Unity/Unreal 五个生产引擎从空项目做完整游戏，平均 295 步、65M tokens，**只有 16% 的运行能通关**；而"工程师 + 编码 agent"的参考实现接近满分——差距在 agent 而非工具（A/B：[arXiv 2610.26098](https://arxiv.org/abs/2610.26098)）。
- **TRELLIS.2（4B，MIT，权重+代码+训练代码全开）**：H100 上 512³≈3s、1024³≈17s、1536³≈60s，原生输出带 PBR 四通道的 GLB，可 decimation 到百万面级（A：[repo](https://github.com/microsoft/TRELLIS.2)）。
- **Hunyuan3D 开源只到 2.1/Omni/Part**；3.0/3.1/3.5 为云服务无权重；社区许可**排除 EU/UK/KR** 且 **1M MAU** 触发重新授权（A：[LICENSE](https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1/blob/main/LICENSE)）。
- **部件化生成**正成为可玩资产关键：Roblox CubePart（OpenRAIL）按 parts schema 生成可装配部件；HY3D-Bench 有 24 万部件级数据（A）。

**决策**：
1. **两段式编译**：LLM 只产出受 JSON Schema 约束的 Spatial-DSL；确定性编译器负责布局求解、装配、碰撞、LOD、行为图生成与校验。LLM 不生成二进制、不写渲染代码。
2. **骨架优先**：房间/墙体/门窗/灯光优先取尺寸精确的模块化套件（保证比例与碰撞）；特征道具才调用生成模型。
3. **部件（parts）是 Spatial-DSL 一等字段**：实体 = 语义部件集合 + 装配约束 + 可交互属性，便于骨架绑定、碰撞生成与后续玩法（吸收 gen3d 调研建议）。
4. **验证-修复循环**：Schema → 语义校验（连通性、出生点可达、门户可达、预算）→ 装配后 glTF Validator + KHR_interactivity 严格校验（Babylon `strictValidation`）→ 结构化诊断回填 LLM（≤N 次）→ 仍失败降级模板世界。
5. **资产默认 TRELLIS.2（MIT）**；Pixal3D（MIT，像素对齐）作为备选；Hunyuan3D 仅作"用户自配 provider"，**不作默认分发依赖**（地域/MAU/法务）。
6. **成本预期**：每空间约 **$0.5–8**（工程估算，不含人工兜底），draft 5–10 分钟、standard 20–40 分钟；必须用评测集持续测量。

---

### ADR-10 / ADR-11：物理、3DGS 与"不做清单"

**物理**：`KHR_physics_rigid_bodies` / `KHR_collision_shapes` 仍是 **Review Draft**，`OMI_physics_*` 多为 Stage 1 且仅 Godot 插件实现（A）→ **不能依赖标准**。参考运行时用 **Rapier**（Apache-2.0、WASM、包体小、维护活跃；见 [`01-landscape.md`](01-landscape.md)），碰撞体以包围盒/凸包自动生成 + 简化凸分解；持久化字段用 `OMI_physics_shape` 语义子集，`CHW_collider` 兜底；**Blender 不是硬依赖**（仅可选离线精修）。

**3DGS**：`KHR_gaussian_splatting` 已 ratified（2026，具体日期未核实），SPZ 4（Niantic）与 SOG（PlayCanvas）是事实传输格式，Marble 默认导出 SPZ（A/B）。但头显上 1M splat≈19–21MB、流式 LOD 仍在 SPZ v5 roadmap，且与物理/交互分离（B/C）。→ **P3 作视觉增强**（"扫描真实场所/美术背景"），P1-P2 不投入。

**世界模型**：Genie 4（2026-10）官方承认多用户共享环境仍是研究挑战、会话仅几分钟、会漂移；Marble 输出的是**持久 3D 资产**而非运行时；Matrix-Game 4.0 验证了"引擎管状态/物理 + 神经渲染视觉层"的工程分工（A/B）。→ 只作内容生成与视觉层，**不作状态权威**。

**身份**：Passkey/OIDC 起步 → `did:web`（域名即身份，与自托管节点天然契合）；不引入钱包/代币。头像 P1 用 glTF 人形替身，P2 评估 VRM/`CHW_avatar`。

---

### ADR-12：许可证、治理与"护城河是测试套件"

- **代码 Apache-2.0**（含专利授权，适合商业宿主集成）；**规范 CC-BY-4.0**（可自由实现/商用，需署名）；**示例资产 CC0/CC-BY**。
- 禁止把 GPL/AGPL 代码复制进核心包（Hyperfy 的 GPL-3.0 是典型风险）；CI 做 license/SBOM 检查。
- **开源边界**：核心协议、参考实现、Schema 与 conformance 套件全开源；**托管运营层（SaaS）允许闭源/私有化部署**，但必须提供数据导出与迁移、承诺不做锁定（细节见 [`08-open-source-strategy.md`](08-open-source-strategy.md) §7）。这是"可持续但不抽成"的边界。
- 模型与生成资产记录 **provenance**（模型名/版本/许可证/参数），随 World Bundle 发布；Hunyuan 类许可限制在 provider 层隔离。
- **一致性套件 `weave-check` 是核心资产**：验证 `world.json`、glTF、行为图、门户、预算、安全策略；任何声称兼容 SHP 的实现都应能跑通它。协议类项目的护城河不是代码，而是"可验证的一致性 + 生态采用"。

---

## 4. 选型矩阵（加权）

评分 1-5（5 最佳），权重见第 2 节。

| 候选 | 标准对齐 | 生态人才 | 性能覆盖 | 许可证 | 维护活跃 | 6个月可行性 | 3年演化 | 加权 |
|---|---|---|---|---|---|---|---|---|
| **Babylon.js 8 + KHR_interactivity（WebGL2-first）** | 5 | 3.5 | 4 | 5 | 4 | 4 | 5 | **4.48** |
| three.js + 自研行为图执行器 | 2.5 | 5 | 4 | 5 | 5 | 2 | 3 | **3.68** |
| PlayCanvas + 自研行为图 | 2 | 3 | 4.5 | 4.5 | 4 | 2 | 3 | **3.13** |
| Hyperfy v2 | 2 | 2 | 4 | 2（GPL） | 2（停更） | 3 | 2 | **2.35** |
| Third Room | 2 | 1 | 3 | 5 | 1 | 2 | 1 | **2.10** |
| 自研 Web 引擎 | 3 | 2 | 3 | 5 | — | 1 | 3 | **2.70** |

> 权重与评分为工程判断（C），用于暴露取舍而非替代决策。Babylon 的优势集中在"标准对齐 + 许可证 + 演化"；three.js 的优势是生态与人才，但无法在 P1 内补齐行为图执行器。

---

## 5. 与原始设想的差异（必须显式说明）

| 原始假设 | 修正 | 依据 |
|---|---|---|
| Third Room 是"最接近空间万维网、可作底座"的活跃项目 | **已实质停更**（核心仓 2023-08 后无提交）；可借鉴理念，不可依赖 | GitHub API（A） |
| Hyperfy 可作"轻量 Web 空间框架/底座" | 主仓 **GPL-3.0** 且 main 自 2025-12 后无提交（v0.16.0 后进入低维护）；fork 会把许可证与维护风险带入核心 | GitHub API（A） |
| Matrix 可用于多人状态同步与传送 | 适合异步社交/身份，**不适合位姿级实时同步**；实时层用 WebTransport/WebRTC/WS | 规范定位 + 工程判断（A/C） |
| KHR_interactivity 是"未来标准，先自研" | **2026-08-28 已 ratified**，Babylon 已完整播放；应立即押注对象行为层 | Khronos 规范 + Babylon 文档（A） |
| KHR_interactivity 可承载完整玩法/多人 | 规范**明确仅单用户、无 UI/脚本**；多人+门户+世界规则必须自研 | Khronos 规范（A） |
| 自研一套空间超链接协议 | 应先对齐 **MSF "Web of Worlds"/X3D Anchor**，SHP 只补握手/信任/预取等空白 | MSF/X3D（A/B） |
| Spatial-DSL 应作为公开标准 | DSL 先作为**编译器内部 IR**；公开契约是 World Bundle + world.json | 工程判断（C） |
| 3DGS 神经流式是 P1 关键卖点 | `KHR_gaussian_splatting` 已 ratified，但头显成本/流式/物理未成熟；**P3 视觉增强** | 调研结论（B/C） |
| 以 VR 头显为第一入口 | Web/桌面优先，WebXR 渐进增强；visionOS 需 WebXR + `<model>`/Immersive API 双轨 | 市场/运行时调研（A/B） |
| 生成管线依赖 Blender 无头烘焙 | 不作硬依赖；碰撞体管线内自动生成，Blender 仅可选精修 | 部署/CI 成本（C） |
| 用自定义 scheme 做世界地址 | 主标识用 **HTTPS URL**；自定义 scheme 只作别名 | 可点击性/可缓存性（C） |
| 一句话生成完整游戏是可行的产品承诺 | 2026 基准显示仅 16% 通关；必须骨架优先 + 模板 + 验证修复 | CEGame-Bench（A/B） |

---

## 6. 尚未决（Open Questions）

| 问题 | 影响 | 解决方式 | 截止 |
|---|---|---|---|
| Quest/Pico 浏览器 WebGPU 可用性 | 是否能在 XR 内用 WebGPU | 真机 A/B + 版本说明季度复核 | P1 |
| visionOS 对 Hit Test/Anchors/Depth/Lighting 的逐项支持 | Apple 生态入口 | 真机测试 | P2 |
| VRM 在 Babylon 的加载方案与维护性 | 头像系统 | 社区 loader 评估 + 自研兜底 | P2 |
| LiveKit/Pion/WebTransport 在头显浏览器的 RTT/CPU | 多人方案 | 20 人房间压测 | P2 |
| Hunyuan3D 许可证地域/MAU 条款 | 是否作可选 provider | 法务审阅 | P1 |
| glTF 2.1（多文件组合/外部场景）发布节奏 | 与 SHP Inline 语义合并 | 跟踪 Khronos Town Hall（2026-11-17） | P1 |
| `KHR_gaussian_splatting` 压缩扩展 | 3DGS 视觉层 | 跟踪 Khronos | P3 |

---

## 7. 参考（按证据等级）

**A 级（一手）**
- Khronos, *glTF Interactivity Extension Submitted for Ratification*, 2026-07-16. https://www.khronos.org/news/press/gltf-interactivity-extension-submitted-for-ratification
- Khronos glTF 规范 `KHR_interactivity`（Status: Complete, Ratified；2026-08-28）. https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_interactivity
- Babylon.js 文档, *KHR_interactivity*. https://github.com/BabylonJS/Documentation/blob/master/content/features/featuresDeepDive/importers/glTF/khrInteractivity.md
- MSF "Web of Worlds" / X3D 4.1 WoW Profile. https://www.web3d.org/new/blog/how-web-worlds-x3dweb3d-and-metaverse-standards-forum-tie-together
- OMI glTF Extensions README（扩展阶段表；无 portal）. https://github.com/omigroup/gltf-extensions
- `microsoft/TRELLIS.2`（MIT，4B，PBR GLB）. https://github.com/microsoft/TRELLIS.2
- `Tencent-Hunyuan/Hunyuan3D-2.1` LICENSE（EU/UK/KR 排除 + 1M MAU）. https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1/blob/main/LICENSE
- GitHub REST API 元数据（访问 2026-11-07）：thirdroom（Apache-2.0，pushed 2023-08-30）、hyperfy（GPL-3.0，pushed 2026-04-21）、TRELLIS/TRELLIS.2（MIT）。
- caniuse *WebGPU*（2026-10）、*WebTransport*（2026-10）。

**B 级（第三方实测/报道）**
- CEGame-Bench（arXiv 2610.26098），2026-10：LLM 端到端游戏通关率 16%。
- BitSoul3D（2026-08-16）引擎支持分层：Babylon 完整、three.js 仅加载、Unity 仅导出、Godot 部分、UE5 未确认。
- three.js PR #33497 / #33154：WebGPU + XR 仍在演进。
- Genie 4 官方页面 Limitations；Marble 定价/导出规格；Matrix-Game 4.0（Apache-2.0）。

**C 级（工程判断/战略推理）**
- URL vs 自定义 scheme、Matrix 不适合实时、骨架优先生成的可控性、DSL 作为内部 IR、一致性套件作为护城河等判断，属团队推断，已在正文标注。
