# 真实 LAN / 公网部署接入（RC3）

> 范围：把 P0 双节点握手跑在真实主机上，并把结果纳入 G0 证据包。
> English (primary): [`en/deploy-real.md`](en/deploy-real.md)
> 当前候选：`p0-rc3`；运行时 `95f12d8`。**RC3 是夹具绑定实现**，公网部署前请先看 §4。

## 1. 拓扑

```
浏览器（客户端机器）
   │  https://alice.example:8443（客户端 + Node A + pixel-rooftop）
   ├──────────────► Node A ── 反向代理 :8443 ── 内部 Node :9443
   │  https://hana.example:8444（Node B + neon-alley）
   └──────────────► Node B ── 反向代理 :8444 ── 内部 Node :9444
```

- Node A 提供构建后的 viewer、`/p0/trust.json`、描述符和 `pixel-rooftop`。
- Node B 提供描述符和 `neon-alley`。
- TLS 在反向代理终止；Node A/B 可继续只监听 `127.0.0.1`（不要直接暴露）。
- RC3 运行时把主机名/端口写死为 `alice.example:8443`、`hana.example:8444`，所以 LAN 验证用 `.example` + 本地 DNS/hosts 是可行的；公网真实域名不可直接使用。

## 2. LAN 部署（RC3 可直接做，不改运行时）

### 2.1 两台主机准备

```bash
# 构建机
pnpm install
pnpm run worlds:build
pnpm build
pnpm tls:fixture          # 测试专用 CA/证书/节点密钥/trust.json

# 复制到 Node A、Node B：scripts/、worlds/、apps/playground/dist、.p0-tls/、package 文件
```

两台主机的 `.p0-tls/` 必须一致。它们是**测试凭据**，不要用于生产。

### 2.2 各主机启动节点（只监听 loopback）

Node A：

```bash
node scripts/serve-node.mjs \
  --name alice --port 9443 \
  --origin https://alice.example:8443 \
  --peer https://hana.example:8444 \
  --client-dist apps/playground/dist
```

Node B：

```bash
node scripts/serve-node.mjs \
  --name hana --port 9444 \
  --origin https://hana.example:8444 \
  --peer https://alice.example:8443
```

内部端口 9443/9444 可自选；外部 origin 必须保持 `:8443`/`:8444`，因为 RC3 viewer 写死了这两个 origin。防火墙不要暴露 9443/9444。

### 2.3 各主机反向代理

Caddy 示例（Node A；Node B 换成 hana/8444/9444）：

```caddyfile
https://alice.example:8443 {
  tls /path/to/.p0-tls/alice.crt /path/to/.p0-tls/alice.key
  reverse_proxy https://127.0.0.1:9443 {
    transport http {
      tls_insecure_skip_verify
    }
  }
}
```

nginx 等价：

```nginx
server {
  listen 8443 ssl;
  server_name alice.example;
  ssl_certificate     /path/to/.p0-tls/alice.crt;
  ssl_certificate_key /path/to/.p0-tls/alice.key;
  location / {
    proxy_pass https://127.0.0.1:9443;
    proxy_ssl_verify off;
    proxy_set_header Host $host;
  }
}
```

LAN 验证可使用夹具证书（客户端安装夹具 CA 或用 SPKI pin），也可签发自己的 LAN CA 并同步更新 `.p0-tls/trust.json`。外部 origin 字符串必须保持 `https://alice.example:8443` / `https://hana.example:8444`。

### 2.4 客户端 DNS / hosts

```text
192.168.1.10 alice.example
192.168.1.11 hana.example
```

换成实际 LAN IP。Node 的 DNS 查询与 Chrome 都必须能解析；单客户端用 `/etc/hosts` 足够。浏览器安装 `.p0-tls/ca.crt`，或在自动化参数里用 `--ignore-certificate-errors-spki-list=<pin>`（不要作为全局浏览器设置）。

### 2.5 验证

```bash
# 在客户端
curl --cacert .p0-tls/ca.crt --resolve alice.example:8443:192.168.1.10 \
  https://alice.example:8443/.well-known/weave-node.json
curl --cacert .p0-tls/ca.crt --resolve hana.example:8444:192.168.1.11 \
  https://hana.example:8444/.well-known/weave-node.json
```

然后跑远程性能驱动：

```bash
export P0_PERF_REMOTE=1 P0_PERF_PROFILE=lan
export P0_URL=https://alice.example:8443/
export P0_NODE_A_ORIGIN=https://alice.example:8443
export P0_NODE_B_ORIGIN=https://hana.example:8444
export P0_HOST_RESOLVER="MAP alice.example 192.168.1.10,MAP hana.example 192.168.1.11"
export P0_SPKI_PINS="<alice-pin>,<hana-pin>"   # pnpm tls:fixture 输出
export P0_PERF_CA=.p0-tls/ca.crt                # Node 侧 TLS 探测

node scripts/perf-p0.mjs --validate-only        # 只验证 client/A/B 的 DNS + TLS
node scripts/perf-p0.mjs --strict               # 真实采样；超预算返回非零
```

`--validate-only` 通过只证明 DNS/TLS 可达与地址分类，**不证明**浏览器走了预期网络路径、端点提供正确世界，或性能达标。

## 3. G0 要记录什么

使用 [`g0-evidence.md`](g0-evidence.md)，附上：

1. 部署信息：两个 origin、主机/IP、代理、证书签发者、DNS 解析方式。
2. `perf-p0` 报告的 `remoteTopology`（client/A/B 地址 + TLS 协议/cipher/authorized）。
3. 浏览器性能报告（`perf-p0-lan-headed.json` / headless），N、冷/热 p50/p95、重启恢复。
4. 外部开发者功能复现：套件通过数 + 统一报告。
5. RC commit/tag 与 CI run。

## 4. 公网部署：RC3 的阻塞点与所需改动

RC3 无法直接服务真实公网域名，原因如下：

| 阻塞点 | 位置 |
|---|---|
| Viewer 写死 `alice.example:8443` / `hana.example:8444` | `apps/playground/src/main.js`（`LIVE`） |
| 节点 ID/世界映射固定为 alice/hana | `scripts/serve-node.mjs`（`worldId`、`did:web`） |
| `.example` 保留、夹具 CA 不被公网信任 | 测试夹具 |
| Node 只绑定 `127.0.0.1` | `scripts/serve-node.mjs`（`server.listen`） |
| Manifest 重写固定 `.example` origins | `scripts/serve-node.mjs`（`ORIGINS`） |

**公网验证需要 deployment profile**（计划为新 RC，例如 RC4；它会改运行时文件，因此必须新 tag + 全量重跑）：

1. 客户端 origin 提供 `/p0/deployment.json`（或扩展 `/p0/trust.json`）：
   ```json
   {
     "worlds": {
       "pixel-rooftop": "https://alice.example.org/worlds/pixel-rooftop/world.json",
       "neon-alley": "https://hana.example.org/worlds/neon-alley/world.json"
     },
     "origins": {
       "https://alice.example.org": { "publicJwk": { "...": "..." }, "spkiSha256": "..." },
       "https://hana.example.org":  { "publicJwk": { "...": "..." }, "spkiSha256": "..." }
     }
   }
   ```
2. Viewer bootstrap 读取 `worlds`，替代硬编码映射（协议行为不变）。
3. `serve-node` 支持 `--origin`、`--world`、`--peer-origin`、`--cert`、`--key`、`--node-key`、`--trust-file`、`--bind`/`--http`（反代后），并按部署映射重写 manifest。
4. 生产身份生成器创建 ed25519 节点密钥 + trust anchors（不是夹具 CA）；真实 TLS 证书（Let's Encrypt 或自有 CA）在代理 443/8443 终止。
5. 然后用同一 `perf-p0` 远程驱动 + 真实 origin；公网可信证书无需 host resolver/SPKI pin。

在该 profile 落地前，**不要用 RC3 声称公网性能证据**。公网运行是新 RC 决策，不是配置微调。

## 5. 运维检查

- [ ] 防火墙只开放代理端口（8443/8444 或 443）；内部节点端口保持 loopback。
- [ ] 时钟同步（token TTL 很短，`expiresAt` 是毫秒）。
- [ ] 限流/配额：`P0_RATE_LIMIT`（默认 60/10s）、`P0_SESSION_QUOTA`（默认 3/10min）、`P0_TOKEN_TTL_MS`（默认 5000）。
- [ ] TLS 1.2+；不使用全局 `--ignore-certificate-errors`。
- [ ] 信任锚带外分发并 pin；不复用夹具密钥。
- [ ] 备份节点密钥；夹具的 `rotate-node-key.mjs` 不适用于生产轮换（生产轮换需 deployment profile 流程）。
- [ ] 访问日志 + 错误监控；token 是不透明凭据，不要记录。
