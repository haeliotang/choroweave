# choroweave 开发方案 · 写作规范与跨文档契约（v1）

> 供 Lead 与写作角色（synthesizer / architect / planner）共用。**动笔前必读。**
> 目标读者：资深工程师、开源社区、以及评估是否资助/加入的投资人。语言：简体中文（术语可中英混排）。

## 0. 项目一句话

**choroweave（原质之织）是"空间万维网"的开源基础设施**：把自然语言意图编译为可执行、可多人共在的 3D 空间（World Bundle），并用超链接/门户协议让分散在个人节点上的世界互相串门。

三件套：
1. **Chôra Compiler**：意图 → Spatial-DSL → 可玩世界包（确定性装配 + 生成式资产 + 验证/修复）。
2. **Spatial Hyperlink Protocol（SHP）**：世界描述符、寻址、门户、进入握手、能力协商。
3. **Reference Runtime & Node**：Babylon.js 参考运行时 + 可自托管节点（静态资产 + 房间服务 + 发现）。

明确非目标（写作时要反复强调）：不做封闭元宇宙平台；不做 3A 游戏引擎；不做 VR 硬件/BCI；不做链上资产；不在 P1-P2 做 3DGS/世界模型运行时。

## 1. 术语表（全文必须一致）

| 术语 | 定义 | 英文/标识 |
|---|---|---|
| 世界 | 一个可独立寻址、可进入的空间包 | World |
| 空间 | 用户/Agent 生成的场所（世界的一种） | Space |
| 世界包 | 分发的产物：glb + world.json + 资产 | World Bundle |
| 世界描述符 | `world.json`，世界的清单与入口 | World Manifest |
| 节点 | 托管世界与房间服务的自部署实例 | Node |
| 门户 | 场景内可进入另一世界的实体 | Portal |
| 传送 | 从世界 A 进入世界 B 的完整握手 | Traversal |
| 房间 | 一次多人会话的实时上下文 | Room |
| 节点能力 | 节点支持的可选协议特性 | Node Capabilities |
| 意图规格 | tacitweave 输出的隐性偏好规格 | Implicit Spatial Spec (ISS) |
| 空间 DSL | 编译器中间表示（JSON） | Spatial-DSL |
| 世界编译器 | 把 DSL 编译为 World Bundle 的确定性管线 | Chôra Compiler |
| 一致性套件 | 校验实现是否符合规范的 CLI/测试集 | `weave-check` |

## 2. 命名与身份（必须原样使用）

- 协议名：**Spatial Hyperlink Protocol（SHP）**，版本 v0.1。
- 实时会话协议：**Weave Session Protocol（WSP）**（WebSocket 二进制协议；P0 定义 v0.1）。
- 世界标识：HTTPS URL，形如 `https://alice.example/worlds/rooftop/world.json`；`weave://alice.example/worlds/rooftop` 仅为可注册别名。
- 节点发现：`https://<host>/.well-known/weave-node.json`。
- glTF 厂商扩展前缀：`CHW_`。P0 定义：`CHW_portal`、`CHW_collider`、`CHW_logic`（能力声明）、`CHW_avatar`（P2）。
- 包/模块命名（monorepo）：
  - `@choroweave/dsl`（AST/Schema/校验）
  - `@choroweave/compiler`（管线与 CLI）
  - `@choroweave/assembler`（glb 装配、碰撞体、行为图生成）
  - `@choroweave/provider-trellis` / `-hunyuan` / `-kit`（资产生成 provider）
  - `@choroweave/runtime`（Babylon 封装、行为图宿主、门户切换）
  - `@choroweave/node`（静态托管 + 房间服务 + 发现）
  - `@choroweave/protocol`（SHP/WSP 的 TS 类型与编解码）
  - `@choroweave/check`（一致性套件 CLI）
- 示例世界：`pixel-rooftop`（像素天台，P1 旗舰 demo）。

## 3. 阶段口径（所有文档统一）

| 阶段 | 时间 | 一句话目标 | 退出条件（Exit Criteria） |
|---|---|---|---|
| **P0** 协议验证 | M0-M2 | 手工造两个世界，用一扇门连起来；协议 v0.1 冻结 | 两个自托管节点可互跳；`weave-check` 可验证；无 AI 参与 |
| **P1** 编译器 MVP | M2-M6 | 一句话生成单房间，生成的世界能进入、能交互、能与另一世界互跳 | 20 条评测提示词中 ≥70% 产出可玩世界；热切换 < 1.5s |
| **P2** 多人网络 | M6-M12 | 真人多人房间 + 门户穿越 + 自托管节点 + 化身 | 20 人房间稳定 30 分钟；跨节点串门 demo；规范 v0.5 |
| **P3** 生态与智能体 | M12-M18 | 常驻 Agent、空间演化、社区节点网络 | 100 个公开世界/10 个第三方节点；Agent 接待 demo |
| **P4** 沉浸与标准化 | M18-M24 | WebXR 深度适配、协议 v1.0、治理移交 | Quest 3 原生 72fps；3 个第三方引擎可播放；v1.0 发布 |

> 注意：P0 在原始设想中不存在，但**必须存在**——先用无 AI 的手工世界验证"门户/节点/描述符"协议，否则编译器产出无法验证网络层。

## 4. 技术基线（写作时不得与 [`02-tech-selection.md`](../02-tech-selection.md) 冲突）

- 产物：glTF 2.0 + `KHR_interactivity` + `CHW_*` + `world.json`；资产 SHA-256 内容寻址。
- 运行时：Babylon.js 8.x（Apache-2.0）；WebGL2 必保底，WebGPU 增强；不 fork Hyperfy。
- 逻辑分层：L0 KHR_interactivity（默认）/ L1 精选联网模块（参数化）/ L2 能力沙箱 WASM（P3+）。
- 实时：WebSocket（P0-P1）→ WebRTC DataChannel + LiveKit（P2+）；Matrix 仅可选社交桥。
- 身份：Passkey/OIDC → did:web；无区块链。
- 资产：TRELLIS.2（MIT）默认；Hunyuan3D 可选不默认；Blender 非硬依赖。
- 世界模型/3DGS：P3 评估，非运行时。
- 许可证：代码 Apache-2.0，规范 CC-BY-4.0，示例资产 CC0/CC-BY。

## 5. 文档契约

### 5.1 `docs/01-landscape.md`（synthesizer）
必须包含：① 生态地图（按四层：空间网络/生成式3D/运行时标准/产品市场）；② 12 个关键项目的事实卡（状态/许可证/活跃度/可复用性）；③ 五个"断层"（gap）论证；④ 对 choroweave 的机会窗口判断；⑤ 与 [`02-tech-selection.md`](../02-tech-selection.md) 的 ADR 一一呼应；⑥ 来源表。
写法：先结论后证据；每个项目给出"最后推送/star/许可证/证据链接"；区分"已死/维护中/活跃"。

### 5.2 `docs/03-architecture.md`（architect）
必须包含：① 分层架构图（Mermaid）；② 编译管线（阶段、产物、失败处理、确定性）；③ World Bundle 目录结构与示例；④ 运行时架构（模块、循环、门户切换状态机、网络模型）；⑤ 节点架构（静态/房间/发现/鉴权）；⑥ 接口定义（TS 类型级伪代码，不要求可编译）；⑦ 性能预算表；⑧ 安全边界（不可信输入/资源/UGC/跨节点）；⑨ 与 tacitweave 的 ISS 契约；⑩ 目录结构与里程碑映射。
要求：所有 `CHW_*` 扩展、`world.json` 字段必须与 `04` 和 `schemas/` 完全一致。

### 5.3 `docs/04-spatial-hyperlink-protocol.md`（architect）
必须包含：① 设计原则（web-native、优雅降级、能力协商）；② 世界标识与节点发现；③ `world.json` 字段定义（表）；④ 门户扩展 `CHW_portal` 字段与语义；⑤ 进入握手（时序图 + 状态机 + 失败/回滚）；⑥ 信任与签名（ed25519、manifest 规范化）；⑦ 预览/预取策略与预算；⑧ 隐私（访客身份披露等级、门禁策略）；⑨ 版本兼容与废弃策略；⑩ 与 OMI/Khronos 的演进路径；⑪ 一致性测试用例清单。
要求：协议必须"可在纯 HTTPS 静态托管上工作"（无强制服务端），房间服务为可选增强。

### 5.4 `docs/05-roadmap.md`（planner）
必须包含：① 24 个月甘特（Mermaid 或表格）；② 每阶段：目标/交付物/验收标准/依赖/风险；③ 两条资源情景（3 人小队 / 8-10 人团队）与预算区间；④ 招聘画像；⑤ KPI 仪表盘（每阶段 3-5 个可测指标）；⑥ 关键决策门（Go/No-Go）；⑦ 与 [`06-mvp-spec.md`](../06-mvp-spec.md) 的接口。

### 5.5 `docs/06-mvp-spec.md`（planner）
必须包含：① 目标用户与使用场景（3 个 persona）；② P0/P1 用户故事与验收测试（Given/When/Then）；③ 旗舰 demo 剧本（像素天台 + 传送门，逐步骤）；④ 编译器评测集（20 条提示词 + 评分 rubric）；⑤ 性能/兼容验收表（设备 × 指标）；⑥ 不做清单；⑦ 发布物清单。
要求：验收标准必须可自动化或可人工复现；指标口径与 roadmap 一致。

### 5.6 `docs/07-risks-compliance.md`（planner）
必须包含：① 风险登记表（概率/影响/缓解/触发信号/负责人角色），至少覆盖：技术、标准、供应链/许可证、市场、社区、安全、内容治理、法律（GDPR/COPPA/DSA/未成年人）、BCI 伦理；② 许可证与 SBOM 策略；③ 威胁模型（UGC 行为图、跨节点门户、头像/身份、资产投毒、房间滥用）；④ 内容审核与举报流程（默认私密 + 门禁 + 举报 + 分级）；⑤ 数据最小化与遥测策略；⑥ 应急预案（世界被举报/节点失联/协议漏洞）。

### 5.7 `docs/08-open-source-strategy.md`（planner）
必须包含：① 仓库与包边界；② 贡献流程/RFC/版本策略；③ 标准路线（自研 CHW_ → OMI Stage 1 → Khronos）；④ 社区冷启动（3 个 showcase 世界、创作者计划、Discord/GitHub 运营）；⑤ 生态激励（模板市场/资产包/节点托管）；⑥ 可持续商业模式（托管节点、企业私有部署、支持合同、捐赠）与"不做什么"；⑦ 治理路线（BDFL → 基金会/委员会）；⑧ 发布节奏与发布检查清单。

## 6. 质量红线

1. **不编造**：star 数、发布日期、性能数字、市场数据必须有来源；无法核实写"未能核实"。区分官方声明 / 第三方实测 / 推断（标注 A/B/C，与 02 一致）。
2. **时间口径**：一律写"截至 2026-11 核实"或具体日期；不要写"目前"而不给时点。
3. **不回避分歧**：与原始设想不同的地方要明确写出（可引用 `02` 第 5 节）。
4. **可执行性**：架构/协议/路线图中的每个关键名词都要在术语表或首次出现处定义；参数要有默认值与范围。
5. **一致性**：阶段名（P0-P4）、模块名、扩展名、指标名、ADR 编号必须跨文档一致；引用其他文档用相对链接。
6. **篇幅**：01/03/04 各 350-600 行；05/06/07/08 各 250-450 行；表格优先于长段落。
7. **图表**：Mermaid 可用（架构图/时序图/状态机/甘特），但必须能在 GitHub 渲染。
8. **写完自查**：交叉链接、术语、数字、与 02 的一致性；发现冲突在文档末尾"与 02 的偏差"注明，不要静默修改 ADR。

## 7. 2026-11 关键事实（写作时必须使用，避免踩旧认知）

以下为调研已核实事实（来源见 `docs/research/*.md`），与 02 的 ADR 一致：

1. **KHR_interactivity 已于 2026-08-28 正式 ratified**（不是草案）；2026-07-16 只是提交批准。但仅 **Babylon.js 与 glTF-Sample-Viewer（UX3D）**两个 ratified 级实现；three.js 无执行器；Godot 仅伴生 `KHR_node_visibility`；Unity 仅导出；Needle 运行时仍在 roadmap。
2. **KHR_interactivity 明确"仅单用户、不处理多人联网"，且不支持 UI/任意脚本**。因此"多人共在 + 世界规则 + 传送门"必须由 choroweave 自研（World Protocol + SHP）。
3. **MSF（Metaverse Standards Forum）2026 已有 "Web of Worlds" 议程与 X3D 4.1 WoW Profile（Anchor = 3D 超链接、Inline = 外部场景）**。SHP 必须**对齐该语义**（作为轻量 profile + 门户握手），而不是另起一套语言；在 04 中明确"与 WoW/X3D Anchor 的映射"。
4. **运行时 = Babylon.js（WebGL2-first，WebGPU 特性增强）**；WebGPU-only 在 2027 前不成立（Firefox Linux/Android 未默认、WebXR/WebGPU binding 仍 Editor's Draft、Babylon WebGPU-XR experimental、three.js WebGPU-XR 才刚改为 WebGL 回退）。
5. **visionOS Safari 真支持 WebXR（visionOS 2+ 默认；hand-tracking/transient-pointer）**，但苹果主线是 `<model>` + Immersive API（USDZ）；P4 需双轨。
6. **实时传输**：WebTransport 已是 W3C WD，Chrome 97+/Firefox 114+/Safari 26.4+，caniuse 2026-10 约 92%；WebSocket 用于 P0-P1，WebTransport/WebRTC DataChannel 用于 P2+，LiveKit 负责语音。
7. **Quest 3 官方（Meta Unity 清单）预算**：≤150 draw calls/帧、<100 万三角形/帧、overdraw <2x、纹理显存 500–700MB；浏览器 WebXR 需再乘 0.5–0.7 折减（非官方）。
8. **3DGS**：`KHR_gaussian_splatting` 已 ratified；SPZ 4 / SOG 为事实传输格式；但头显流式与物理结合仍不成熟 → 仍放 P3，作为视觉增强。
9. **生成**：TRELLIS.2（4B，MIT，权重+代码+训练代码全开）H100 上 512³≈3s / 1024³≈17s，直接输出 PBR GLB；Hunyuan3D 3.x 无公开权重，2.1 社区许可**排除 EU/UK/KR 且 1M MAU 条款**；CEGame-Bench（2026-10）显示 LLM 端到端做完整游戏仅 16% 可通关 → 必须"骨架优先 + 模板/套件 + 验证修复"。
10. **场景生成新参考**：HY-World 2.0（腾讯，权重开放但 Tencent 许可）、Marble（商业 API，$1.2–1.3/世界，导出持久 3D 资产）、Matrix-Game 4.0（Apache-2.0 权重，引擎管状态 + 神经渲染视觉层，RTX 5080 上 864×480 67fps）→ 支持"引擎管状态、模型管视觉"的分工判断。

## 8. 交付与回报

- 只写自己被分配的文件（写域见 `internal/plan-outline.md`），不要改别人的文件。
- 完成后给 Lead 发 ≤15 行摘要：文件路径 + 行数 + 三个最关键结论 + 任何与 02 的冲突/待决问题。
- 任务板任务完成后置为 complete。
