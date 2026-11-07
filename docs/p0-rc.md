# P0 Release Candidate 与外部验证（2026-11-07）

> **运行时基线：** `95f12d8`（2026-11-07）。**RC tag：** `p0-rc1`（指向验证工具提交；其运行时文件与 `95f12d8` 相同，可用 `git diff 95f12d8..p0-rc1 -- apps packages scripts/serve-node.mjs scripts/tls-fixture.mjs worlds` 核对）。
> **SHP v0.1：** 候选冻结——外部验证完成前**不是最终冻结**。
> G0：**未授予**。目标日期 **2027-01-25**。
> English (primary): [`en/p0-rc.md`](en/p0-rc.md)

## 1. 状态拆分

| 状态 | 含义 |
|---|---|
| **工程：完成** | P0-1…P0-4 实现与工具完成；CI 绿；mock/live 套件通过 |
| **RC：候选** | 运行时基线冻结在 `95f12d8`；外部反馈前不加新功能 |
| **G0 验收：未授予** | 缺外部复现；缺 LAN/公网性能档案 |

P0 现在处于 **Release Candidate / External Validation**，不是功能开发阶段。范围冻结：不接生成模型、不做多人同步、不做 Agent、不做中心化发现。

## 2. 证据台账

| 证据 | 结果 | 层级 | 位置 |
|---|---|---|---|
| Mock 一致性 | **44/44**（2 世界 × 22） | mock | `pnpm test:p0` |
| Live 节点协议 | **12/12** | live | `scripts/live-conformance.mjs` |
| Live 加固 | **5/5**（限流、配额、room-full、私有、密钥轮换） | live | `scripts/node-hardening.mjs` |
| Live 浏览器 E2E | **15/15**（10 穿越 + 回滚 + 手势 + room-full + 预算 + 白名单） | live-browser | `scripts/e2e-p0.mjs` |
| 统一报告 | PASS，层级分离 | mock + live | `pnpm report:p0` |
| 覆盖矩阵 | 22 条 × 层级；8 条 mock-only 已披露 | — | `fixtures/p0/coverage.json` |
| 性能 — headed loopback | 冷 p50 **2.82s** / p95 **3.42s**；热 p50 **48ms** / p95 **172ms** | loopback | `scripts/perf-p0.mjs` |
| 性能 — headless loopback | 冷 p50 **4.26s** / p95 **4.59s**；热 p50 **337ms** / p95 **463ms** | loopback | `scripts/perf-p0.mjs` |
| 目标重启恢复 | 重启前回滚 + 重启后重试成功 | loopback | `scripts/perf-p0.mjs` |
| CI | mock + live + 加固 + 浏览器 E2E + 报告 + artifacts | — | GitHub Actions |

性能口径：冷启动**每个样本全新浏览器进程**；热切换同页真实门户 UI。仅 loopback；**LAN/公网档案未测，不作为 G0 证据。**

## 3. 外部验证必须记录

1. 检出 RC tag，记录 commit。
2. 按 runbook 执行：[`reproduce-p0.md`](reproduce-p0.md)。
3. 记录：环境（OS/Node/Chrome）、各套件通过数、耗时、commit、失败输出。
4. 性能：运行 `pnpm perf:p0`（有显示环境时可用 headed），记录 N、冷/热 p50/p95、重启恢复。
5. 条件允许时补测 LAN（第二台主机）与公网（部署节点）档案，并标注档案名。
6. 在跟踪 issue [#1](https://github.com/haeliotang/choroweave/issues/1) 评论，或使用外部复现 issue 表单。

## 4. G0 验收清单

| 条件 | 状态 |
|---|---|
| 两个独立 HTTPS 节点 | ✅ |
| 真实双向穿越 10/10 | ✅ loopback |
| 真实 arrive token、重放/过期拒绝 | ✅ |
| 回滚保留源世界 | ✅ |
| mock 22/22 + live 分层报告 | ✅ |
| CI 自动跑双节点 + 浏览器 E2E | ✅ |
| **外部独立复现** | ⬜ 待完成 |
| **LAN + 公网性能档案** | ⬜ 待完成 |
| **规定档案上冷 p95 <5s / 热 p95 <1.5s** | ✅ loopback headed；⬜ LAN/公网 |
| SHP v0.1 最终冻结 | ⬜ 外部反馈后 |
| G0 评审 | ⬜ 目标 2027-01-25 |

## 5. 冻结策略

- 运行时与协议文件冻结在 RC 基线；G0 前只允许验证工具、文档与测试修复。
- RC 后任何运行时改动都必须打新 RC tag、重跑全部套件，并在外部复现 issue 中明确说明。
- SHP v0.1 是**候选冻结**；最终冻结在外部反馈之后。G0 前的破坏性变更必须附 ADR 与迁移说明。
