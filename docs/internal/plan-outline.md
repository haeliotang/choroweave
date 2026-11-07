# choroweave 开发方案 · 内部大纲（Lead 用，已归档至 docs/internal/（流程留档））

> 状态：2026-11-07。本文件是编排与交付清单，不是最终交付物。

## 1. 最终交付物树

```
README.md                                  # 项目定位 + 文档导航 + 30 秒结论（Lead）
docs/00-executive-summary.md               # 执行摘要：判断/路径/路线图/资源/指标（Lead）
docs/01-landscape.md                       # 开源生态全景与断层（synthesizer，基于 4 份调研）
docs/02-tech-selection.md                  # 技术选型决策矩阵 + ADR（Lead）
docs/03-architecture.md                    # 系统架构：分层、数据流、接口、包结构（architect）
docs/04-spatial-hyperlink-protocol.md      # SHP v0.1 协议草案（architect）
docs/05-roadmap.md                         # 24 个月路线图（planner）
docs/06-mvp-spec.md                        # Phase 1 MVP 规格与验收测试（planner）
docs/07-risks-compliance.md                # 风险/许可证/安全/合规/内容治理（planner）
docs/08-open-source-strategy.md            # 开源治理/社区/标准/商业化（planner）
docs/research/01..04-*.md                  # 4 份原始调研（4 名 surveyor）
schemas/spatial-dsl.schema.json            # Spatial-DSL v0.1（architect）
schemas/world-manifest.schema.json         # world.json v0.1（architect）
examples/pixel-rooftop/*                   # 示例世界 DSL + manifest + 说明（architect）
scripts/validate.mjs                       # schema/示例/链接自检脚本（architect；Lead 运行）
```

## 2. 写作分工与写域（互不重叠）

| 角色 | 文件写域 |
|---|---|
| Lead | README.md、docs/00、docs/02、docs/internal/plan-outline.md |
| synthesizer | docs/01-landscape.md |
| architect | docs/03、docs/04、schemas/*、examples/*、scripts/validate.mjs |
| planner | docs/05、docs/06、docs/07、docs/08 |
| surveyor ×4 | docs/research/0X（已完成） |

## 3. 核心判断（供各写作角色引用，均需在 02 中有证据）

1. Third Room 已实质停更（核心仓 2023-08 后无提交），不可作底座；Hyperfy v2 主仓 2026-04 后停更且 GPL-3.0，不可直接 fork 进 Apache-2.0 项目。
2. KHR_interactivity 已进入/完成批准流程，Babylon.js 是当前唯一完整 playback 的引擎；因此参考运行时选 Babylon.js 8.x（Apache-2.0），three.js 仅作可选轻量查看器。
3. 寻址用 HTTPS URL + `world.json`；不发明不可点击的自定义 scheme 作为主标识。门户用 glTF vendor extension `CHW_portal` + 描述符握手；OMI 无 portal 扩展（仅有 spawn_point / physics 等，且成熟度 Stage 1-2）。
4. 实时多人状态不走 Matrix（事件 DAG/延迟不适合位姿同步）；Matrix/ATProto 仅作可选社交/身份桥。实时层用 WebSocket（Phase 1）→ WebRTC DataChannel/LiveKit（Phase 2+）。
5. 逻辑分层：L0 KHR_interactivity（安全、可移植）；L1 精选联网小游戏模块（参数化）；L2 能力沙箱 WASM（Phase 3+）。不开放任意 JS。
6. 生成管线：骨架优先（Spatial-DSL + 确定性装配）+ 套件库 + TRELLIS.2（MIT）资产；Hunyuan3D 许可证非 OSI，默认不作为分发依赖；不把 Blender 设为硬依赖。
7. 世界模型（Genie/Marble 类）与 3DGS 只作生成/视觉层，不作多人持久运行时（Phase 1-2 不投入）。
8. 许可证：代码 Apache-2.0、规范 CC-BY-4.0、示例资产 CC0/CC-BY；全部产物带 provenance。
9. MVP 楔子：个人空间 + 两世界传送门 demo（先协议，后多人；先单机，后联网）。
10. 性能与兼容：WebGL2 必保底，WebGPU 渐进增强；Quest 3 72fps 预算写入架构文档。

## 4. 需要研究补齐的点（Phase 2 写作时核查）

- [ ] KHR_interactivity 是否已正式 ratified（Babylon 文档称 ratified；需 Khronos registry/新闻确认）
- [ ] visionOS Safari WebXR 实际支持状态；Quest Browser WebGPU/WebXR 现状
- [ ] Hunyuan3D 许可证条款（地域/MAU/商用）与 TRELLIS.2 权重许可证
- [ ] Rapier vs PhysX(WASM) 包体/性能/维护活跃度
- [ ] LiveKit/WebRTC DataChannel 在 WebXR 头显浏览器的可用性
- [ ] VRM 在 Babylon.js 的加载方案（官方/社区 loader 维护状态）
- [ ] Hyperfy v1/v2 许可证历史（v1 是否 MIT）与社区活跃度
- [ ] 3DGS glTF 扩展（KHR_gaussian_splatting）状态
- [ ] 2025-2026 VR 头显装机/使用数据（决定 Web-first 论证强度）

## 5. 质量门（合稿前 Lead 执行）

1. 每份文档：结论有来源、区分事实/判断、无编造数字；"截至 2026-11 核实"标注。
2. 跨文档一致性：ADR 编号、模块名（choroweave-compiler 等）、阶段名（P0-P4）、指标口径一致。
3. `docs/04` 协议与 `schemas/*` 字段一致；`examples/pixel-rooftop` 通过 schema 校验。
4. `scripts/validate.mjs` 可运行（node），输出通过；README 链接全部可达（相对路径存在）。
5. 中文表达统一：术语表（世界/空间/节点/门户/传送门/World Bundle/Spatial-DSL）在 README 定义一次。
6. 与用户原始设想差异清单完整（02 第 5 节），不掩盖分歧。
