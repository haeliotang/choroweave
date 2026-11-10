# G0 证据包（模板）

> 提议 G0 时使用本模板。**不能仅凭拓扑检查授予 G0。** 以下四类证据必须齐全，并绑定同一个 RC commit。
> English (primary): [`en/g0-evidence.md`](en/g0-evidence.md)

## 1. RC 身份

| 字段 | 值 |
|---|---|
| RC tag | `p0-rc3` |
| 运行时基线 | `95f12d8` |
| Tag commit | `33815a0`（工具/文档；相对 `95f12d8` 的运行时 diff 必须为空） |
| 证据 commit | `<包含本证据包的 commit>` |
| 规则 | 若运行时文件变化，必须新 RC tag 并全量重跑 |

## 2. 部署信息

| 端点 | URL | 主机/托管 | DNS 解析结果 | TLS 签发者/有效期 |
|---|---|---|---|---|
| Client | | | | |
| Node A（`pixel-rooftop`） | | | | |
| Node B（`neon-alley`） | | | | |

附：节点启动方式、世界目录、信任锚，以及 TLS 是否为公共 CA（推荐）或有文档的私有 CA。

## 3. 功能复现（外部开发者）

| 字段 | 值 |
|---|---|
| 测试者（非项目成员） | |
| 日期 / OS / Node / Chrome | |
| 测试的 RC commit | |
| 实际耗时（clone → report） | |
| Mock 一致性 | `44/44`？ |
| Live 节点协议 | `12/12`？ |
| Live 加固 | `5/5`？ |
| Live 浏览器 E2E | `15/15`？ |
| 统一报告 | PASS？ |
| 功能结论 | **PASS / FAIL** |
| 失败输出/文档缺口 | |

本栏只记录**协议功能**。软件渲染导致冷启动超标的浏览器仍可能功能复现成功，性能结果需在下一栏单独记录。

## 4. 性能复现（环境相关）

| 字段 | 值 |
|---|---|
| 档案 | loopback / LAN / public |
| 客户端主机 + 网络 | |
| 浏览器 + 渲染器 | |
| 节点部署 | |
| 冷启动样本数 N 与 p50/p95 | |
| 热切换样本数 N 与 p50/p95 | |
| 重启恢复（回滚 + 重试） | PASS / FAIL |
| `perf-p0 --strict` 结果 | PASS / FAIL |
| 报告路径（`perf-p0-*.json`） | |
| 性能结论 | **PASS / FAIL** |

规则：

- `--validate-only PASS` 只证明 DNS/TLS 可达与地址分类，**不证明**浏览器走了预期网络路径，也不证明端点提供正确的 Choroweave 世界/SHP 服务，更不证明性能达标。
- public 要求 client/A/B 的解析结果均非私有/非 loopback；LAN 要求非 loopback；报告必须含 `remoteTopology`。
- strict 同时要求冷/热预算与重启恢复的**回滚 + 重试**。
- 性能通过是环境相关的：headless/软件渲染冷启动超标不等于功能失败；功能通过也不等于性能通过。

## 5. 需附上的证据

1. `perf-p0` 报告中的 `remoteTopology`（client/A/B 的 DNS 地址与 TLS 协议/cipher/authorized）。
2. 部署信息：origins、托管、证书签发者、节点访问方式。
3. 浏览器性能报告（`perf-p0-<profile>-<headed|headless>.json`）。
4. 统一一致性报告（`artifacts/p0-conformance.json` / `.md`）与 CI run URL。
5. 外部复现记录：Issue [#1](https://github.com/haeliotang/choroweave/issues/1) 评论或复现 issue 表单。

## 6. G0 签署清单

- [ ] 记录 RC commit，且相对 `95f12d8` 运行时 diff 为空
- [ ] 外部开发者（非项目成员）功能复现已记录
- [ ] 功能与性能结果**分开**记录
- [ ] LAN 与公网档案已采样并附拓扑报告（或 G0 评审明确声明不在范围）
- [ ] 规定档案上的 strict 性能目标已达成，或有明确豁免记录
- [ ] 拓扑、部署、浏览器性能、一致性证据均已链接
- [ ] 外部反馈后记录 SHP v0.1 最终冻结决定


## RC4 记录（2026-11-10 追加）

- `p0-rc4` 的运行时基线是 `854f114`，取代 `p0-rc3`。
- 原因：许可切换修改了运行时文件（SPDX 头、`/source` 与查看器 Source 链接）。
- G0 证据必须绑定 `p0-rc4`；`p0-rc3` 仅保留为历史证据，不再作为当前基线。
