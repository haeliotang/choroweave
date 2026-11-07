# P0 实现状态（2026-11-07）

> 范围：**P0-1**（两个世界 + 最小运行时）与 **P0-2**（真实双节点 HTTPS 握手）。**P0 验收尚未达成**（外部复现未完成），G0 仍未授予，目标日期 **2027-01-25**。
> English (primary): [`en/p0-status.md`](en/p0-status.md)

## 已实现

| 构件 | 位置 | 状态 |
|---|---|---|
| 两个手搭世界（简单几何体，确定性生成） | `worlds/pixel-rooftop/`、`worlds/neon-alley/`、`scripts/build-p0-worlds.mjs` | 完成 |
| Babylon.js 9.x 查看器（WebGL2）、第一人称漫游 | `apps/playground/` | 完成 |
| 门户确认 → token → 原子切换 → 回滚 | `apps/playground/src/main.js` | 完成 |
| 两个独立 HTTPS 节点、签名节点描述符 | `scripts/serve-node.mjs`、`scripts/tls-fixture.mjs` | 完成 |
| 一次性短期 `arrive` token（绑定世界/会话/nonce，拒绝重放与过期） | `scripts/serve-node.mjs` | 完成 |
| 信任锚（固定节点公钥，仅测试） | `.p0-tls/trust.json`（生成物） | 完成 |
| Mock 一致性套件（22 条） | `packages/check/` | 完成 |
| Live 节点一致性套件 | `scripts/live-conformance.mjs` | 完成 |
| 走真实门户 UI 的浏览器 E2E | `scripts/e2e-p0.mjs` | 完成 |
| CI：构建 + mock + live + 浏览器 E2E | `.github/workflows/p0.yml` | 完成 |

## 复现命令

```bash
pnpm install
pnpm run worlds:build
pnpm build

# 1) mock 一致性：两个世界各 22/22
pnpm test:p0

# 2) live 节点协议：严格 CA 校验、真实 token
node scripts/live-conformance.mjs

# 3) live 浏览器 E2E：真实 UI 确认、10 次穿越 + 回滚
P0_LIVE=1 node scripts/e2e-p0.mjs
```

Live 夹具使用 `.p0-tls/` 下的本地证书（`scripts/tls-fixture.mjs` 生成）、Chrome host-resolver 映射 `alice.example`/`hana.example`，并对两张叶子证书做**显式 SPKI pin**；不使用 `--ignore-certificate-errors`。Node 侧 live 套件严格校验 CA 链。`.example` 域名与 127.0.0.1 映射是**仅测试例外**。

## 结果（2026-11-07，本地）

| 套件 | 结果 | 模式 |
|---|---|---|
| `pnpm test:p0` mock 一致性 | `pixel-rooftop` 与 `neon-alley` 各 **22/22** | mock 会话 |
| `node scripts/live-conformance.mjs` | **12/12** live 协议用例 | live（双 HTTPS 节点，严格 CA） |
| `P0_LIVE=1 node scripts/e2e-p0.mjs` | **10/10** 双向 UI 穿越 + 回滚 PASS | live（浏览器） |
| live 预取预算 / 同步白名单 | 预算中止 PASS；非白名单指针拒绝 | live（浏览器运行时） |
| 冷启动（打开→可操作） | **≈ 4.9s**（headless Chrome + SwiftShader，本地） | 参考值 |
| 热切换 | **p50 ≈ 375ms、p95 ≈ 475ms** | 参考值 |

性能口径：单机、headless 软件渲染、未分设备档位；仅用于对照 G0（`HHT` p95 <1.5s、`CST` p95 <5s——本地均达标，但冷启动接近上限，需在真实硬件复测）。

## mock 与 live 的区分

| 层 | Mock（`packages/check`） | Live（`scripts/live-conformance.mjs`） | Live 浏览器（`scripts/e2e-p0.mjs`） |
|---|---|---|---|
| 握手状态机 / 错误码 | 是（22 条） | token 签发/消费/重放/过期/错误世界/不可达/超时/信任不匹配 | 真实 UI 确认 + 穿越 |
| 描述符签名 / 信任锚 | 单元级 ed25519/JCS | 签名描述符 + pinned key | 浏览器 WebCrypto 校验 |
| 预取预算 / 同步白名单 | 单元级 | — | 运行时 `prefetchTest` / `tryWritePointer` |
| 回滚 | 单元级 | — | 停掉 Node B，源世界状态保留 |

22 条 mock 用例保留为快速单元测试；live 套件独立报告。**不要把 "22/22" 读成 "22 条 live 用例"。**

## 本阶段安全/信任说明

- 夹具节点密钥与 TLS CA 均为测试期生成，**不是生产身份**；`trust.json` 只是夹具的带外 pin。
- 生产运行时仍阻止任意公网世界访问 localhost/私有网络；只有显式 `.example` 夹具通过测试信任锚放行（SSRF / DNS 重绑定防护）。
- 节点目前签发不透明一次性 token（绑定世界+会话+nonce+有效期）；尚未实现限流、配额、密钥轮换。

## 剩余缺口

1. **P0-2**：节点限流/密钥轮换；干净机器一键启动；真实桌面硬件复测冷/热性能。
2. **P0-3**：把剩余的 mock 用例尽可能绑到真实节点/运行时；统一 live conformance 报告格式。
3. **P0-4**：由未参与开发的开发者完成外部复现（issue 表单已就绪）；然后冻结 SHP v0.1 并评估 G0。
