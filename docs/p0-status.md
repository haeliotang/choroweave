# P0 实现状态（2026-11-07）

> 范围：**P0-1**（两个世界 + 运行时）、**P0-2**（真实双节点 HTTPS 握手 + 加固）、**P0-3**（统一一致性报告）、**P0-4**（外部复现 runbook；外部执行仍待完成）。
> **P0 验收（外部复现）尚未达成**，G0 仍未授予，目标日期 **2027-01-25**。
> English (primary): [`en/p0-status.md`](en/p0-status.md)

## 已实现

| 构件 | 位置 | 状态 |
|---|---|---|
| 两个确定性手搭世界 | `worlds/*`、`scripts/build-p0-worlds.mjs` | 完成 |
| Babylon.js 9.x 查看器（WebGL2）、第一人称 | `apps/playground/` | 完成 |
| 门户确认 → arrive token → 原子切换 → 回滚 | `apps/playground/src/main.js` | 完成 |
| 两个独立 HTTPS 节点、签名描述符 | `scripts/serve-node.mjs`、`scripts/tls-fixture.mjs` | 完成 |
| 带外 pinned 信任锚 | `.p0-tls/trust.json`（生成） | 完成 |
| 一次性 `arrive` token（世界/会话/nonce/有效期） | `scripts/serve-node.mjs` | 完成 |
| 限流、room-full、私有世界 | `scripts/serve-node.mjs`（`P0_RATE_LIMIT`、`--room-full`、`--private`） | 完成 |
| 密钥轮换流程 | `scripts/rotate-node-key.mjs` | 完成 |
| 一键启动双节点 | `scripts/p0-up.mjs`（`pnpm p0:up`） | 完成 |
| Mock 一致性（22 条 × 2 世界） | `packages/check/` | 完成 |
| Live 节点 / 加固 / 浏览器套件 | `scripts/live-conformance.mjs`、`node-hardening.mjs`、`e2e-p0.mjs` | 完成 |
| 统一一致性报告 | `scripts/p0-report.mjs`、`artifacts/p0-conformance.{json,md}` | 完成 |
| 覆盖矩阵（22 条 × 层级） | `fixtures/p0/coverage.json` | 完成 |
| 外部复现 runbook + 预检 | `docs/en/reproduce-p0.md`、`scripts/repro-check.mjs` | 就绪 |
| CI：mock + live + 加固 + 浏览器 E2E + 报告 | `.github/workflows/p0.yml` | 完成 |

## 复现

```bash
pnpm install && pnpm run worlds:build && pnpm build && pnpm tls:fixture
pnpm test:p0                                   # mock 44/44
node scripts/live-conformance.mjs --json-out .p0-reports/live-node.json
node scripts/node-hardening.mjs --json-out .p0-reports/live-hardening.json
P0_LIVE=1 P0_REPORT_OUT=.p0-reports/live-browser.json node scripts/e2e-p0.mjs
node scripts/p0-report.mjs                     # 统一 mock/live 报告
# 手工检查：pnpm p0:up
```

完整外部复现步骤：[`reproduce-p0.md`](reproduce-p0.md)。

## 结果（2026-11-07，本地）

| 套件 | 结果 | 层级 |
|---|---|---|
| `pnpm test:p0` | **44/44**（2 世界 × 22） | mock |
| `live-conformance` | **12/12** | live（严格 CA） |
| `node-hardening` | **4/4**（限流、room-full、私有、密钥轮换） | live |
| `e2e-p0 --live` | **15/15**（10 次穿越 + 回滚 + 手势 + room-full + 预算 + 白名单） | live 浏览器 |
| 统一报告 | PASS | mock + live，分层标注 |
| 性能（headed，Metal） | 冷启动 **2.47s**，热切换 **p50 47ms / p95 167ms** | 参考值 |
| 性能（headless SwiftShader） | 冷启动 **4.3–6.2s**（运行波动，有时 >5s），热切换 **p50 432ms / p95 542ms** | 参考值 |

性能为单机基线（`fixtures/p0/perf-baseline.json`）；headed 使用硬件加速，但不等于头显/低端设备。G0 目标：热 p95 <1.5s、冷 <5s。热切换稳定达标；**headless 冷启动接近/超过 5s，不能视为通过**——headed 冷启动 2.47s，仍需真实设备复测。

## 覆盖：mock vs live

[`fixtures/p0/coverage.json`](../fixtures/p0/coverage.json) 把 22 条用例映射到各套件。当前 live 覆盖：
- live-node：manifest/描述符/签名、token 签发/消费/重放/过期、错误世界、不可达、超时、信任不匹配。
- live-hardening：限流、room-full、私有世界、密钥轮换。
- live-browser：UI 确认、10 次穿越、回滚、手势守卫、room-full 回退、预取预算、白名单。
- 仅 mock：未知字段容忍、id/URL 警告、摘要不匹配、未签名 carry、版本不匹配、转义、环路守卫、无门户查看器。

**不要把 "22/22" 读成 22 条 live 用例**；22 条是 mock 权威套件，统一报告会明确标注层级。

## 安全/信任说明

- 夹具 CA 与节点密钥均为一次性测试材料；`trust.json` 只是测试 pin，生产不可复用。
- 浏览器 E2E 对两张夹具叶子证书做 Chrome SPKI pin，**没有**使用 `--ignore-certificate-errors`；Node 套件严格校验 CA 链。
- 生产仍阻止公网世界 URL 解析到 localhost/私有网段（SSRF / DNS 重绑定）；`.example` + loopback 是显式测试例外。
- 节点具备按 IP 限流（默认 60/10s）、一次性 token 与密钥轮换流程；配额/滥用分析属于后续工作。

## P0-4 剩余

1. 由**未参与开发**的开发者完成外部复现（runbook 与 issue 表单已就绪，执行待完成）。
2. 然后冻结 SHP v0.1，复核覆盖矩阵并评估 G0。
