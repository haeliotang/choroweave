<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/brand/choroweave-mono-inverse.svg">
    <img src="assets/brand/choroweave-mono.svg" alt="choroweave — portal" width="104">
  </picture>
</p>

# choroweave · 原质之织（中文版）

> **把人的意图即时编译为可执行、可共在、可互访的 3D 空间，并让这些空间像网页一样互相链接。**
> English (primary): [README.md](README.md) · 英文文档入口：[docs/en/](docs/en/README.md) · 仓库：<https://github.com/haeliotang/choroweave>

> **状态（2026-11）：设计阶段 + P0-1/P0-2 加固。** 现已可运行：两个手搭世界、Babylon.js 9 运行器、**两个独立 HTTPS SHP 节点**（签名描述符 + pinned 信任锚 + 一次性 `arrive` token、限流、会话配额、room-full/私有处理、密钥轮换）；mock **44/44**（2×22）、live 节点 **12/12**、加固 **5/5**、live 浏览器 **15/15**（10 次穿越 + 回滚 + 手势 + room-full + 预算 + 白名单），统一报告 PASS（[详情](docs/p0-status.md)）。**P0 已进入 release candidate**（运行时基线 `95f12d8`，tag `p0-rc3`）；外部验证与 LAN/公网性能档案仍待完成。RC/验收拆分：[docs/p0-rc.md](docs/p0-rc.md) · runbook：[docs/reproduce-p0.md](docs/reproduce-p0.md)。参与方式：[CONTRIBUTING.md](CONTRIBUTING.md) · 安全报告：[SECURITY.md](SECURITY.md)。

choroweave 是 **Inceptless** 矩阵中的"空间计算层"项目。它不做一个封闭的元宇宙平台，而是做空间时代的 **编译器 + 超链接协议 + 参考实现**：

| 构件 | 作用 | 一句话类比 |
|---|---|---|
| **Chôra Compiler** | 自然语言/意图 → Spatial-DSL → 可玩世界包 | `HTML 编译器` |
| **Spatial Hyperlink Protocol（SHP）** | 世界描述符、寻址、门户、进入握手、能力协商 | `HTTP + <a>` |
| **Runtime & Node** | Babylon.js 参考运行时 + 可自托管世界节点 | `浏览器 + 服务器` |

> 名字来自柏拉图《蒂迈欧篇》的 **chôra（χώρα）**——介于理念与感官世界之间、容纳万物成形的"母体空间"。编译器的职责，正是把"想法"放进 chôra 里成形。

---

## 30 秒结论（截至 2026-11 的调研判断）

1. **时机成立，但不是"元宇宙"时机，而是"Agent 创作 + 个人空间 + 轻量互联"的时机。** Roblox 2026Q3 DAU 1.38 亿、Minecraft MAU 1.55 亿、VRChat MAU >100 万，证明"在 3D 空间里创造与社交"是真实需求；但 2025 年头显出货同比 **-42.8%**、Vision Pro 全年约 4.5 万台，说明 **VR-first 没有数据支撑**，必须 Web/桌面优先、WebXR 渐进增强。
2. **行业缺的不是生成模型，而是"最后一公里"**：TRELLIS.2（MIT）已能在 H100 上 17 秒生成带 PBR 的 GLB；但 LLM 端到端做"完整可玩游戏"在 2026 年的五引擎基准中通关率仅 **16%**。真正稀缺的是：受约束的空间编译、可验证的世界包、以及把世界连起来的标准。
3. **空间超链接的标准窗口正在打开**：Khronos 的 `KHR_interactivity` 已于 **2026-08-28 ratified**（但只覆盖单用户对象行为）；Metaverse Standards Forum 的 **"Web of Worlds"/X3D 4.1 Anchor** 已提出"链接即传送门"。**现在入场，可以定义/实现缺口，而不是五年后兼容别人。**
4. **单元经济是生死线**：Rec Room（2026-06 停服）、Spatial（2025-07 关闭托管）都死于"托管成本 vs 抽成收入"。choroweave 的答案是 **开放协议 + 自托管节点**：让世界像博客一样可以自己托管，平台不靠 UGC 抽成活着。

---

## 这个仓库现在是什么

**这是一套开发方案（research-grounded plan），不是已完成的代码。** 当前交付物：

| 文档 | 内容 |
|---|---|
| [`docs/00-executive-summary.md`](docs/00-executive-summary.md) | 执行摘要：判断、路径、路线图、资源、指标 |
| [`docs/01-landscape.md`](docs/01-landscape.md) | 开源生态全景与"断层"分析 |
| [`docs/02-tech-selection.md`](docs/02-tech-selection.md) | 技术选型决策矩阵与 14 条 ADR（含与原始设想的差异） |
| [`docs/03-architecture.md`](docs/03-architecture.md) | 系统架构、编译管线、运行时、节点、接口 |
| [`docs/04-spatial-hyperlink-protocol.md`](docs/04-spatial-hyperlink-protocol.md) | SHP v0.1 协议草案（world.json / CHW_portal / 进入握手） |
| [`docs/05-roadmap.md`](docs/05-roadmap.md) | 24 个月路线图、阶段门、资源与 KPI |
| [`docs/06-mvp-spec.md`](docs/06-mvp-spec.md) | Phase 1 MVP 规格与验收测试 |
| [`docs/07-risks-compliance.md`](docs/07-risks-compliance.md) | 风险、许可证、安全、内容治理与合规 |
| [`docs/08-open-source-strategy.md`](docs/08-open-source-strategy.md) | 开源治理、标准路线、社区与可持续模式 |
| [`docs/decisions/`](docs/decisions/README.md) | ADR 索引与变更流程（14 条 ADR 正文在 02） |
| [`docs/research/`](docs/research/) | 四份原始调研（空间网络 / 生成式 3D / 运行时标准 / 市场先例） |
| [`schemas/`](schemas/) | Spatial-DSL、world.json 与 ISS 契约的 JSON Schema（v0.1） |
| [`examples/pixel-rooftop/`](examples/pixel-rooftop/) | 旗舰示例世界"像素天台"的 DSL、签名清单与说明 |
| [`LICENSING.md`](LICENSING.md) | 分层许可、许可历史、双许可、品牌资产 |
| [`CLA.md`](CLA.md) | Inceptless CLA 1.0（逐字） |
| [`docs/deploy-real.md`](docs/deploy-real.md) | 真实 LAN 部署步骤；公网部署阻塞点与 deployment profile 需求 |
| [`docs/g0-evidence.md`](docs/g0-evidence.md) | G0 证据包模板（功能/性能分离、拓扑、部署信息） |
| [`docs/p0-rc.md`](docs/p0-rc.md) | Release Candidate 与 G0 验收清单（运行时基线 `95f12d8`） |
| [`docs/reproduce-p0.md`](docs/reproduce-p0.md) | 外部复现 runbook（P0-4 门禁） |
| [`docs/p0-status.md`](docs/p0-status.md) | P0-1/P0-2 验证报告（mock/live 结果、性能、缺口） |
| [`apps/playground/`](apps/playground/) | Babylon.js P0 运行器：加载 `world.json` + `scene/world.glb`、第一人称漫游、门户穿越与回滚 |
| [`packages/check/`](packages/check/) | `weave-check` CLI + 22 条 SHP 一致性用例与测试 |
| [`worlds/`](worlds/) | 生成的 P0 运行时世界（简单几何体，无生成模型） |
| [`scripts/build-p0-worlds.mjs`](scripts/build-p0-worlds.mjs) | P0 夹具的确定性世界/GLB 生成器 |
| [`fixtures/p0/`](fixtures/p0/README.md) | P0 双世界固定夹具（规范 ID/URL、hosts 映射、10 次跳转脚本） |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | 贡献范围、证据规则、CLA、RFC/ADR 流程 |
| [`SECURITY.md`](SECURITY.md) | 私密漏洞报告与安全范围 |
| [`scripts/validate.mjs`](scripts/validate.mjs) | 零依赖仓库自检（Schema / 示例 / 签名 / 链接） |

快速自检（Node ≥ 18，无需安装依赖）：

```bash
node scripts/validate.mjs --strict
```

> 说明：`docs/internal/` 为写作流程留档，非交付内容，可忽略。

---

## P0 快速开始（P0-1/P0-2 原型）

```bash
pnpm install
pnpm run worlds:build   # 确定性生成 worlds/pixel-rooftop 与 worlds/neon-alley
pnpm dev                # http://localhost:5173
pnpm test:p0            # 清单校验 + 22/22 一致性用例（mock 会话）
pnpm test:live          # live 双节点协议套件（严格 CA）
pnpm test:hardening     # 限流、room-full、私有世界、密钥轮换
pnpm test:e2e           # 走真实门户 UI 的 10 次双向跳转 + 回滚
pnpm report:p0          # 统一 mock/live 一致性报告
pnpm p0:up              # 一键启动双节点
P0_LIVE=1 pnpm build && P0_LIVE=1 pnpm test:e2e   # 同上，但对两个 live HTTPS 节点
```

操作：`WASD` 移动，鼠标拖拽视角，`E` 交互/进门，`Esc` 取消。URL 加 `?world=neon-alley` 进入另一世界；加 `&failPortal=1` 演示回滚。

## 技术基线（一句话版）

- **产物**：World Bundle = glTF 2.0 `.glb` + `KHR_interactivity` 行为图 + `CHW_*` 厂商扩展 + `world.json` + 内容寻址资产。
- **运行时**：Babylon.js 9.x（Apache-2.0），**WebGL2-first**，WebGPU 特性增强；不 fork Hyperfy（GPL-3.0 且主仓低维护，且无跨世界门户原语）。
- **逻辑**：L0 行为图（安全、可移植）/ L1 精选联网小游戏模块 / L2 能力沙箱 WASM（P3+）；不开放任意用户 JS。
- **实时**：WebSocket 房间服（P0-P1）→ WebTransport / WebRTC DataChannel（P2+）+ LiveKit 语音；Matrix 只作可选社交桥。
- **寻址**：HTTPS URL 即世界 ID；`weave://` 仅别名；资产 SHA-256 内容寻址。
- **生成**：骨架优先 + 确定性装配 + TRELLIS.2（MIT）；Hunyuan3D 仅可选（许可排除 EU/UK/KR，1M MAU 条款）。
- **许可证**：分层——应用/运行时 **AGPL-3.0-or-later**，Schema/一致性套件/夹具 **Apache-2.0**，文档 **CC-BY-4.0**；示例资产按各 `world.json`（P0 为 CC-BY-4.0）。见 [`LICENSING.md`](LICENSING.md)。

---

## 与 tacitweave 的关系

**独立仓库、契约式上下游**。tacitweave 负责"懂你"——从用户行为与偏好中提炼 **Implicit Spatial Spec（ISS）**；choroweave 负责"实现与串门"——把 ISS + 显式意图编译成空间，并连成网络。两者不共享代码库、不共享发布节奏，只共享一份可版本化的 JSON 契约（见 [`docs/03-architecture.md`](docs/03-architecture.md) 第 8 节）。

---

## 如何阅读这套方案

- **只想判断值不值得做**：读 [`docs/00-executive-summary.md`](docs/00-executive-summary.md) 与 [`docs/02-tech-selection.md`](docs/02-tech-selection.md) 的"与原始设想的差异"。
- **想参与实现**：读 [`docs/03-architecture.md`](docs/03-architecture.md) → [`docs/04-spatial-hyperlink-protocol.md`](docs/04-spatial-hyperlink-protocol.md) → [`docs/06-mvp-spec.md`](docs/06-mvp-spec.md)。
- **想评估风险/投资**：读 [`docs/05-roadmap.md`](docs/05-roadmap.md) → [`docs/07-risks-compliance.md`](docs/07-risks-compliance.md) → [`docs/08-open-source-strategy.md`](docs/08-open-source-strategy.md)。
- **想核对证据**：从 [`docs/research/`](docs/research/) 进入，每份报告均带来源与"未能核实"清单。

> 所有事实性陈述均标注证据等级（A 一手 / B 第三方 / C 判断），并注明"截至 2026-11 核实"。我们优先给出可证伪的判断，而不是愿景口号。

---

## 状态与许可

- 状态：**方案 v0.1（2026-11）**；协议与 Schema 均为草案，欢迎在 issue/RFC 中挑战。
- **应用/运行时/节点**：AGPL-3.0-or-later（见 [`LICENSE`](LICENSE)）；**Schema、`weave-check`、夹具**：Apache-2.0；**文档**：CC-BY-4.0；**示例资产**：按各 `world.json`（P0 为 CC-BY-4.0）。详见 [`LICENSING.md`](LICENSING.md)。
- 外部贡献须签署 Inceptless CLA（[`CLA.md`](CLA.md)）；签署地址 <https://cla-assistant.io/haeliotang/choroweave>。PR 只有在 CLA 检查（license/cla）通过后才会合并。
- 姊妹项目：tacitweave（默会知识/隐性意图层）。本仓库不包含其代码。
