# 复现 P0（外部复现 runbook）

> 读者：**从未参与 choroweave** 的开发者。目标：在约 30 分钟内跑通双节点 live 握手并回报结果。这是 P0-4 门禁；在记录至少 1 次外部复现之前，G0 不授予。
> English (primary): [`en/reproduce-p0.md`](en/reproduce-p0.md)

## 1. 预检（2 分钟）

```bash
git clone https://github.com/haeliotang/choroweave.git
cd choroweave
node scripts/repro-check.mjs
```

需要 Node ≥ 24、pnpm 10.x、`openssl`、Chrome/Chromium，且 8443/8444 空闲。`repro-check` 会逐项报告缺失。

## 2. 安装与构建（3–5 分钟）

```bash
pnpm install
pnpm run worlds:build
pnpm build
pnpm tls:fixture
```

`tls:fixture` 在 `.p0-tls/`（gitignored）生成一次性本地 CA、`alice.example`/`hana.example` 证书、测试节点密钥与 `trust.json`。**这些密钥仅用于测试，不得用于生产。**

## 3. 自动化验证（5–10 分钟）

> 候选运行时基线：`95f12d8`（tag `p0-rc1`）。请记录实际测试的 commit。

```bash
pnpm test:p0                 # mock 一致性：44/44（2 个世界 × 22）
node scripts/live-conformance.mjs --json-out .p0-reports/live-node.json
node scripts/node-hardening.mjs --json-out .p0-reports/live-hardening.json
P0_LIVE=1 P0_REPORT_OUT=.p0-reports/live-browser.json node scripts/e2e-p0.mjs
node scripts/p0-report.mjs
pnpm perf:p0 --strict        # 采样冷/热切换与目标重启恢复；超预算返回非零
# LAN/公网（需真实部署；校验客户端 + 两节点 DNS/TLS；public 拒绝私有/loopback）：
# P0_PERF_REMOTE=1 P0_PERF_PROFILE=lan P0_URL=https://... P0_NODE_A_ORIGIN=https://... P0_NODE_B_ORIGIN=https://... node scripts/perf-p0.mjs --validate-only
```

预期：

| 套件 | 预期 |
|---|---|
| mock | 44/44 |
| live-node | 12/12 |
| live-hardening | 5/5 |
| live-browser | 15/15（10 次穿越 + 回滚 + 手势 + room-full + 预算 + 白名单） |
| report | `REPORT: PASS` |

浏览器套件会自行启动两个 HTTPS 节点；通过 Chrome host-resolver 映射 `.example`，并对两张夹具叶子证书做 **SPKI pin**（不是全局 `--ignore-certificate-errors`）。Node 侧套件严格校验 CA 链。

## 4. 手工检查（可选，5 分钟）

```bash
pnpm p0:up
# 另一个终端：hosts 映射 + 信任/pin 证书，或复用自动化浏览器参数
# 客户端：https://alice.example:8443/?live=1
curl --cacert .p0-tls/ca.crt --resolve alice.example:8443:127.0.0.1 \
  https://alice.example:8443/.well-known/weave-node.json
```

操作：`WASD`、鼠标拖拽、`E` 检查/进门、`Esc` 取消。

## 5. 回报

打开 **External reproduction (P0)** issue 表单（或直接在跟踪 issue <https://github.com/haeliotang/choroweave/issues/1> 下评论），附上：
- commit 与日期；
- OS/Node/Chrome 版本；
- 各套件通过数/失败数及错误文本；
- 实际耗时；
- 文档缺口。

如果某条命令失败，请贴出完整命令与输出——这是最有价值的贡献。

## 故障排查

| 症状 | 处理 |
|---|---|
| 8443/8444 `EADDRINUSE` | 先停掉已有 P0 节点；测试工具只检测冲突，不会杀无关进程 |
| 证书错误 | 重新 `pnpm tls:fixture`，确认 `.p0-tls/` 存在 |
| `failed to load scene` | 先 `pnpm build`（client dist 缺失） |
| E2E 找不到 Chrome | 设置 `CHROME_PATH` |
| 轮换测试后 trust 不匹配 | 重新 `pnpm tls:fixture` 重置夹具身份 |

> `.example` 与 loopback 映射是仅测试例外。生产环境仍阻止公网世界解析到 localhost/私有网段（SSRF / DNS 重绑定）。
