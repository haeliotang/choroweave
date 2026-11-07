# 架构决策记录（ADR，中文版）

English (primary): [`README.md`](README.md)。

当前 v0.1 方案的 13 条 ADR 记录在 [`../02-tech-selection.md`](../02-tech-selection.md) 的 §1（总表）与 §3（逐条论证），包括背景、证据、代价、复盘信号与未决问题。

## 变更流程

1. **提案**：在本目录新建 `ADR-<四位编号>-<kebab-title>.md`，包含：背景、选项、决策、证据（A/B/C）、影响、复盘信号。
2. **评审**：在 issue/RFC 中讨论；涉及协议破坏性变更时同步更新 [`../04-spatial-hyperlink-protocol.md`](../04-spatial-hyperlink-protocol.md) 的版本与废弃策略。
3. **合并**：更新本索引与 `02-tech-selection.md` 的总表；如推翻既有 ADR，在新 ADR 中显式引用被替代编号（不要静默修改历史）。
4. **记录**：阶段门（G0–G4）的 KPI 快照与决策一并归档到本目录（见 [`../05-roadmap.md`](../05-roadmap.md) §5.3）。

## 索引

| ADR | 主题 | 位置 |
|---|---|---|
| ADR-01 | 独立孵化、与 tacitweave 契约衔接 | `02` §1/§3 |
| ADR-02 | World Bundle 产物格式 | `02` §3 |
| ADR-03 | 逻辑三层（L0/L1/L2） | `02` §3 |
| ADR-04 | Babylon.js 参考运行时、WebGL2-first | `02` §3 |
| ADR-0004 rev.1 | Babylon.js 9.x 运行时（替代 8.x 版本表述） | [`ADR-0004-babylonjs-9.md`](ADR-0004-babylonjs-9.md) |
| ADR-05 | HTTPS URL 寻址 | `02` §3 |
| ADR-06 | SHP 对齐 MSF WoW、`CHW_portal` | `02` §3 |
| ADR-07 | WebTransport/WebRTC 实时层，Matrix 仅社交桥 | `02` §3 |
| ADR-08 | Passkey/OIDC → did:web，无区块链 | `02` §3 |
| ADR-09 | 骨架优先编译器、TRELLIS.2 | `02` §3 |
| ADR-10 | Rapier 物理与碰撞体策略 | `02` §3 |
| ADR-11 | 世界模型/3DGS 非运行时 | `02` §3 |
| ADR-12 | 许可证与一致性治理；开源边界 | `02` §3 |
| ADR-13 | Rust core、Web-native runtime（G0 后，P0 不变） | `02` §3 · [`ADR-0013-rust-core-web-native-runtime.md`](ADR-0013-rust-core-web-native-runtime.md) |
