# 像素天台 · Pixel Rooftop（P1 旗舰示例世界）

> 一个像素风格的日式公寓天台：黄昏、混凝土矮墙、一张低桌与红色坐垫凳，桌上放着一台老式收音机——点击播放 Lo-Fi；北墙上有一扇发光的门，通往另一个世界「夜行小巷」。
> 规格来源：[`docs/04-spatial-hyperlink-protocol.md`](../../docs/04-spatial-hyperlink-protocol.md)（SHP v0.1）、[`docs/03-architecture.md`](../../docs/03-architecture.md)（World Bundle 与运行时）。

## 这个目录是什么

| 文件 | 作用 |
|---|---|
| [`world.json`](world.json) | 世界描述符（World Manifest），SHP 的公开契约。已用**演示用 ed25519 密钥签名**（私钥签发后即丢弃）。 |
| [`world.dsl.json`](world.dsl.json) | 编译器中间表示（Spatial-DSL）源文件，`parts` 为一等字段；含 tacitweave ISS 快照与可复现的 `inputHash`。 |
| `README.md` | 本说明。 |

**本目录只含 JSON 源**：`scene/world.glb`、`assets/*.glb`、`assets/*.ogg`、`preview/*.webp` 由 Chôra Compiler 生成，不随"方案仓库"分发。因此 `world.json` 中的资产摘要是**占位内容摘要**，其规则见下节；`scripts/validate.mjs` 会验证该规则与签名，而不是验证未生成的文件。

## 如何进入（P0 手工路径，无编译器）

1. 用 Chôra Compiler（P1 起）生成 bundle 后，或手工把本目录 + 生成的二进制放到静态服务器：
   ```
   https://<host>/worlds/pixel-rooftop/world.json
   https://<host>/worlds/pixel-rooftop/scene/world.glb
   https://<host>/worlds/pixel-rooftop/assets/…
   ```
2. 用参考运行时（P0 起）打开 `https://<host>/worlds/pixel-rooftop/world.json`；纯静态托管即可，**不需要房间服务**（单人模式）。
3. 出生点在 `spawn_default`（天台南侧，面向北）；走进门前的 2.5m 感应区会触发「夜行小巷」的预取；点击门进入传送（`handoff: cross-instance`）。

## 体验脚本（对应 docs/06 的旗舰 demo）

| 步骤 | 操作 | 期望 |
|---|---|---|
| 1 | 进入世界 | 黄昏暖光，城市底噪（`ambient_hum`，进入后 1s 淡入） |
| 2 | 看向低桌上的收音机 | 收音机可被选中（`play_lofi` 绑定 `onSelect`） |
| 3 | 点击收音机 | 播放 Lo-Fi（`audio/lofi_loop.ogg`，180s），旋钮材质变化 |
| 4 | 点击串灯 | 暖色串灯开/关（`lightsOn` 进入同步白名单） |
| 5 | 走近发光的门 | 2.5m 内触发预取（manifest + 预览图 + 场景壳，≤8 MiB） |
| 6 | 点击门 | 确认卡片显示目标域 `hana.example` → 握手 → 进入「夜行小巷」 |
| 7 | 目标不可达 | 源世界保持可交互，提示错误码；不黑屏（回滚） |

## 生成（P1 起的预期命令，当前尚未实现）

```bash
# 需要编译器与 provider（TRELLIS.2 权重默认 MIT）；本仓库当前不含实现代码
chora compile ./world.dsl.json --out ./bundle --tier standard --sign ./key.json
```

编译后由 S9 `emit` 写入真实资产摘要、`entry.sha256`、`bundleDigest`，并用作者密钥重新签名（替换本目录的演示签名）。`world.dsl.json` 与 `world.json` 的字段/枚举/跨字段一致性由 [`scripts/validate.mjs`](../../scripts/validate.mjs) 校验。

## 关键数字

| 项 | 值 |
|---|---|
| 实体 / 语义 parts | 14 / 29 |
| 交互 | 5（`play_lofi`、`toggle_string_lights`、`preview_neon_alley`、`enter_neon_alley`、`ambient_hum`） |
| 门户 | 1（`door_to_neon_alley`，`handoff: cross-instance`） |
| 性能预算 | 18 万三角形 / 60 draw calls / 240 MB 纹理 / 首包 6.2 MB（XR-Mid 档） |
| 容量假设 | `maxPlayers: 20`（P2 目标：20 人稳定 30 分钟） |
| ISS 置信度 | 0.72（lighting/acoustic 为 observed，socialDensity 为 inferred） |
| 许可证 | 世界内容 CC-BY-4.0；生成资产 CC0-1.0（见 `world.json.assets[].license`） |

## 资产摘要的占位规则（本示例专用）

方案仓库不携带二进制。当 `assets[].[].path` / `portal.preview.image` 指向的文件不存在时，`sha256` 按以下规则生成并被 `scripts/validate.mjs` 验证：

```
placeholderDigest(path) = sha256( UTF-8( "choroweave-example-placeholder\n" + path ) )
```

真实构建时，S6 `generate` 用文件字节的 SHA-256 替换它——**该规则不属于 SHP 协议**，仅用于让"签名清单 + 无二进制"的示例仓库保持可验证。`bytes` 字段是构建前的预估大小，构建后以实际为准。

## 校验与回归

```bash
node ../../scripts/validate.mjs        # 仓库自检：schema / 示例 / 链接 / ADR / 签名
```

P1 起本世界同时作为 [`weave-check`](../../docs/04-spatial-hyperlink-protocol.md) 的回归样本（门户、握手、能力协商、预取预算、回滚）。当前一致性用例清单见 SHP §12。

## 隐私与门禁

示例世界为 `open` 门禁、`general` 分级、允许访客；ISS 快照仅存在于 `world.dsl.json`（`privacy.shareWithNode: false`），不会上传给节点。演示签名使用的私钥已丢弃，仅用于验证"签名可机读"，**不可用于任何生产身份**。
