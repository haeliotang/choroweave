# choroweave 调研 03：运行时、开放标准与设备支持

> **English (primary):** [`docs/en/research/03-runtime-standards.md`](../en/research/03-runtime-standards.md) · 本页为中文版（Chinese version）。

> **核实口径**：截至 **2026-11-07**。所有"已 ratified / 草案 / 实验性 / 默认开启"的判定，均以当日可访问的官方页面为准；
> 无法从一手来源确认的，一律标注 **"未能核实"**，不做推测性补全。
> 版本号与日期均来自一手页面；二手媒体仅用于交叉印证。
> 本报告的核心问题：**该不该押注 KHR_interactivity？是否 WebGPU-only？运行时底座选谁？VR 设备现在能承载什么？**

---

## 1. TL;DR（10 条，含 3 条决策建议）

**事实层**

1. **KHR_interactivity 已经是正式标准，不是草案。** 2026-07-16 Khronos 宣布"提交批准"，**2026-08-28 正式 ratified**；glTF 仓库规范正文 Status 写明 "Complete, Ratified by the Khronos Group"，扩展注册表 README 也已列入 Ratified 列表。宣传层面 Khronos 在 7–9 月**没有**单独发 ratification 新闻稿，容易让外部误读为"仍在批准中"。[S1][S2][S3]
2. **但 ratified ≠ 生态成熟。** Khronos 官方口径：Babylon.js 与 glTF-Sample-Viewer（UX3D）是**"前两个满足 ratified 要求的独立实现"**；UnityGLTF 只覆盖导出侧，Needle Engine 运行时在 2026-07 仍是 roadmap，three.js / PlayCanvas / Wonderland / Ambit **均未核实到任何官方支持**。[S4][S5][S6][S7]
3. **KHR_interactivity 的能力边界被普遍高估。** 规范明确规定 **"只面向单用户，不处理多用户联网复杂度"**，且不支持 UI、不支持任意脚本；行为图是图灵完备的，但需要运行时限流。**它不能承载"多人共在"与"空间传送门"，这两层必须由 choroweave 自己定义。**[S2]
4. **WebXR 仍不是"Web 标准平台级能力"。** MDN 直接标注 *Limited availability / Experimental*（非 Baseline）；caniuse 2026-10 数据为 78.02%，Safari（macOS/iOS）仍默认关闭。**能用的是 Chromium 系 + Quest Browser + visionOS Safari 这三类。**[S8][S9]
5. **visionOS Safari 的 WebXR 是"真支持，但苹果另有主线"。** visionOS 2 起 Safari 支持 WebXR（visionOS 1.x 需 Feature Flag），支持 transient-pointer 自然输入与 hand-tracking，Safari 27（2026-09）还为 WebXR Layers 加了 texture-array projection layers；**但苹果真正的空间 Web 主线是 `<model>` 元素 + Immersive API（USDZ 为中心）**，Safari 27 把 `<model>` 推到 iOS/iPadOS/macOS，并新增网站级沉浸环境。[S10][S11][S12][S13]
6. **WebGPU 在 2026 已"三桌面引擎默认开启"，但离"XR 可用"还差一层。** Chrome/Edge 113+、Safari 26（macOS/iOS/visionOS）默认开启；Firefox 仅 Windows/macOS 默认开（141/145/147），Linux 仍在 Nightly；**WebXR/WebGPU Binding 仍是 W3C Editor's Draft，三大引擎没有一家把 WebGPU 形态的 XR 作为生产路径**。three.js 甚至在 2026-04 才把"WebGPU 下 XR 直接报错"改成"自动回退到 WebGL"。[S14][S15][S16][S17]
7. **Quest 3 的官方性能基线（Meta 自家 Unity 检查清单）：≤150 draw calls/帧、<100 万三角形/帧、overdraw <2x、纹理显存约 500–700MB。这是原生引擎预算，浏览器 WebXR 必须在此基础上再打折。** 所以"网页即开即玩"的可达上限是**风格化美术 + 烘焙光照 + 1M 三角形级 + 数十 MB 级首包**，不是"网页里跑 3A 开放世界"。[S18]

**决策层（详见第 4 节）**

8. **要押注 KHR_interactivity，但只押"资产内行为"这一层**：把它作为"可携带的对象级交互"标准（开关门、动画触发、简单状态机），**不要**把它当世界逻辑/联网/传送门协议；同时自研一层轻量的"世界规则 + 空间链接"协议（与 MSF "Web of Worlds"/X3D Anchor 对齐）。
9. **运行时底座建议 Babylon.js 优先，不是 three.js。** 它是唯一 ratified 级 playback + Flow Graph 编辑器 + 无损导出的实现；three.js 在 WebGPU+XR 上是"半成品 + 回退方案"，WebGPU 只适合做 3DGS/后处理实验支线。PlayCanvas 适合作为 3DGS/WebGPU 资产管线（SuperSplat）而非主运行时。
10. **不要 WebGPU-only，至少到 2027 都要 WebGL2-first。** 理由：Firefox Linux/Android 未默认、头显浏览器 WebGPU 状态不明、WebXR/WebGPU binding 仍是草案、Babylon 的 WebGPU-XR 自身标注 experimental。渲染策略应为 **WebGL2 默认 + WebGPU 特性探测后启用**。

---

## 2. 标准/技术清单表

> 状态口径：**Ratified**（Khronos 正式）/ **Draft/Proposal**（规范阶段）/ **Vendor**（厂商扩展）/ **Browser**（浏览器能力，按 MDN/caniuse）/ **未核实**。
> 可用性口径：★ 可直接用 ／ ◐ 可用但有明显限制 ／ ○ 仅作备选 ／ ✕ 当前不建议。

| 项目 | 截至 2026-11 状态 | 实现/支持情况 | 对 choroweave 可用性 | 证据 |
|---|---|---|---|---|
| glTF 2.0.1 | 现行规范 | 全行业事实标准 | ★ 唯一合理资产底座 | [S3] |
| glTF 2.1 | **未发布**；2026-11-17 Town Hall 宣讲 | 向后兼容；多文件组合、逐节点包围体、缩略图、64-bit GLB | ◐ 关注（多文件组合与"传送门/外部场景"直接相关） | [S19] |
| **KHR_interactivity** | **Ratified（2026-08-28）** | Babylon.js 完整 playback；SampleViewer 完整；UnityGLTF 导出；Behave 授权；Android XR/ Magic Leap 宣布将支持 | ◐ 押注"资产内行为"，不承担世界逻辑 | [S1][S2][S4][S5] |
| KHR_node_visibility / selectability / hoverability | Ratified | Godot（visibility）、Babylon.js | ★ 可作交互伴生小能力 | [S3][S20] |
| KHR_gaussian_splatting | **Ratified**（2026 年；具体日期未核实） | CesiumJS、Cesium Native、JSplat、3dgs_ply2gltf | ★ 3DGS 的 glTF 归档格式；压缩扩展待补 | [S21] |
| KHR_physics_rigid_bodies | **Review Draft**（PR #2424，未 ratified） | 未见主流运行时 | ✕ 不能依赖；物理自带 | [S3] |
| KHR_collision_shapes | Review Draft（PR #2370） | 同上 | ✕ 不能依赖 | [S3] |
| KHR_audio_graph | **Proposal**（PR #2421） | 无 | ✕ 自研空间音频 | [S3] |
| KHR_audio_emitter | 未 ratified（PR #2137 长期挂起） | three.js/Godot 有 WIP 分支 | ○ 仅参考 | [S3][S27] |
| KHR_texture_basisu（KTX2/BasisU） | Ratified | 主流引擎全支持 | ★ 必用 | [S3] |
| KHR_draco_mesh_compression | Ratified | 主流引擎全支持 | ★ 必用（几何） | [S3] |
| EXT_meshopt_compression | Ratified | 主流引擎全支持 | ★ 必用（缓冲压缩） | [S3] |
| MSFT_lod | **Vendor 扩展**（未 ratified） | 支持情况未逐条核实 | ○ 用自研 LOD 树更稳 | [S3] |
| OMI_physics_body / OMI_seat / OMI_spawn_point 等 | 多为 **Stage 1–2**；OMI_link 已归档 | 实际只有 Godot 实现（插件） | ○ 可参考语义，不依赖 | [S27] |
| WebXR Device API | W3C **CR**（caniuse）但 MDN 标 *Experimental/Limited* | Chrome/Edge 79+、Quest Browser、visionOS Safari | ◐ 必用，但只能覆盖 Chromium + Quest + visionOS | [S8][S9] |
| WebXR Layers | W3C WD | 三家均在实现；Safari 27 加 texture-array projection layers | ◐ 可用（是 XR 性能关键） | [S13] |
| WebXR Hand Input / Hit Test / Anchors / Depth / Lighting | 多为 **Editor's Draft / WD** | Chrome(Android/ARCore) 较全；visionOS/Quest 部分 | ◐ 逐个 feature-detect | [S8][S22] |
| WebXR/WebGPU Binding | **Editor's Draft** | 无生产浏览器确认 | ✕ 不规划 | [S22] |
| WebGPU | 浏览器默认开启（Chrome/Safari/Firefox 部分平台） | 见 3.4 矩阵 | ◐ 特性探测后启用，非唯一后端 | [S14][S15] |
| WebTransport | W3C WD；Chrome 97+/Firefox 114+/Safari 26.4+ | 92.37%（caniuse 2026-10） | ★ 多人同步首选传输 | [S23] |
| WebRTC DataChannel | 事实标准 | 全平台 | ★ 兜底与 P2P | （通用能力） |
| 3D Tiles | OGC 社区标准（Cesium 主导） | CesiumJS 等 | ○ 地理级流式参考，非通用方案 | [S24] |
| MPEG-I Scene Description（ISO/IEC 23090-14） | 第 1/2 版已发布；2026 仍在出 Amendment | 无主流 Web 运行时 | ○ 标准化观察项 | [S25] |
| SPZ 4 | 事实标准（Niantic 开源，2026-05-05） | Babylon.js、WASM/TS 库、Adobe | ★ 3DGS 传输格式 | [S26] |
| SOG / Streamed SOG | 事实标准（PlayCanvas 开源） | PlayCanvas 引擎与 SuperSplat | ★ 3DGS 传输格式（WebP 系） | [S28] |
| MSF "Web of Worlds" | 2026 白皮书 + 博客，X3D 4.1 WoW Profile | Threedy.io / Virginia Tech 实现中 | ★ 传送门/空间链接的对标标准 | [S29][S30] |
| 非侵入式 BCI | 消费级 EEG 存在但带宽低；侵入式在临床 | 无消费级高带宽输入 | ✕ 不作为 Phase 4 承诺，改为多模态输入 | [S31][S32] |

---

## 3. 逐项分析

### 3.1 glTF 生态：2.0 → 2.1，以及"最关键的那一个扩展"

#### 3.1.1 版本动向（核实）

- 现行版本仍是 **glTF 2.0.1**（registry 页面明确：每次向后兼容修订只递增 patch 号）。[S3]
- **glTF 2.1 尚未发布**。Khronos 计划在 **2026-11-17** 的 Town Hall 系统介绍 2.1：定位"聚焦的向后兼容修订"，核心能力是**多文件场景组合（外部 glTF 引用/打包）**、逐节点包围体与隐式形状、场景结构澄清、缩略图、**64-bit 二进制容器（解除 GLB 体积上限）**。这是 glTF 历史上第一次正面处理"场景由多个资产组成"。[S19]
- 相关项目 **glTF External References 仍在 Proposal 阶段**（Khronos 扩展注册表"in-progress projects"）。[S3]
- **对 choroweave 的直接意义**：2.1 的"外部引用/多文件组合"恰好是"跨服务器空间互链"的天然承载点；如果 choroweave 自研 portal 清单，应尽量设计与 2.1 外部引用语义兼容，避免 2027 年返工。

#### 3.1.2 KHR_interactivity 的真实状态（本次核实的关键结论）

**时间线（全部一手来源）**

| 日期 | 事件 | 来源 |
|---|---|---|
| 2026-02-03 | KHR_gaussian_splatting 发 Release Candidate（对照） | [S21] |
| 2026-07-16 | Khronos 新闻："KHR_interactivity **Submitted for Ratification**" | [S1] |
| 2026-07-16 | 新闻中 Babylon 的引语用 "**upcoming ratification**"，说明当时尚未完成 | [S1] |
| 2026-08-28 | **正式 ratified** | [S4][S2] |
| 2026-09-17 | Safari 27 发布（与本扩展无关，用于时间锚点） | [S13] |
| 2026-10-13 | Khronos 网络研讨会："since its ratification on **August 28, 2026**"；并点名"**Babylon.js 与 SampleViewer 是前两个满足 ratified 要求的独立实现**" | [S4] |
| 2026-11-07 | glTF 仓库规范正文 Status：**"Complete, Ratified by the Khronos Group"**；扩展注册表 Ratified 列表包含 `KHR_interactivity` | [S2][S3] |

**结论**：**已 ratified，不是草案。** 但注意两个"口径坑"：
1. Khronos 新闻/新闻稿列表在 2026-07-16 之后到 2026-09-15 之间**没有**单独发布 ratification 新闻稿（press 列表可查），因此只看新闻页会误判"还在批准中"。
2. Babylon.js 官方文档（内容是 ratified 后写的）多处使用 "ratified specification"，可作为第三方交叉印证。[S5]

**规范能力边界（必须写进 ADR）**

- 行为图 = 数据流 + 控制流节点；支持事件、变量、`flow/*` 控制流、`math/*`、`pointer/*`（JSON Pointer 读写 glTF Object Model）。
- **图灵完备**，官方也承认这一点，因此安全模型是"执行时限流 + 静态/动态限制"，而非"不可表达危险逻辑"。[S2]
- **明确排除**：UI 呈现、任意脚本；**明确声明 "This extension is for single user experiences only and does not deal with any of the complexity involved in multi-user networked experiences."**。[S2]
- 扩展机制：可引用 `KHR_node_selectability` / `KHR_node_hoverability` / `KHR_node_visibility` 定义的操作；不支持的扩展操作退化为 no-op（可优雅降级）。[S1][S2]
- 设计目标含"web-based experiences"与安全沙箱，这与 choroweave 的开放世界诉求一致。[S1]

#### 3.1.3 实现盘点（严格区分"播放/运行时"与"导出/授权"）

| 实现方 | 类型 | 状态（截至 2026-11） | 证据 |
|---|---|---|---|
| **Babylon.js** | 运行时播放 + 编辑器 | ★ 完整：加载/校验/执行 Flow Graph、`GetKHRInteractivityImportResult` 检查、Flow Graph Editor 导入、**无损导出**（可表示的编辑）；不支持自由创作新图 | [S5] |
| **glTF-Sample-Viewer（UX3D）** | 参考查看器 | ★ 完整（"前两个独立实现"之一） | [S4] |
| **UnityGLTF（Needle/PrefrontalCortex）** | 导出器 | ★ 导出侧（CHANGELOG：Editor export support for KHR_interactivity 等） | [S6] |
| **Needle Engine** | 运行时 | ◐ 2026-07 官方口径为 **"on the roadmap"**；2026-11 是否已发布**未能核实** | [S1] |
| **Behave（UX3D）** | 授权工具 | ★ 研讨会列为主力创作工具 | [S4] |
| **Magic Leap** | Unity 运行时 | ★ "completed runtime playback engine built on UnityGLTF"（新闻口径，未独立验证） | [S1] |
| **Google Android XR（Jetpack XR SDK）** | 平台 | ◐ "will support glTF interactivity playback"（未来时） | [S1] |
| **Amazon** | 授权工具 | ◐ "functional prototype" | [S1] |
| **three.js** | 运行时 | ✕ **未核实到官方 executor**；不在 ratification 实现清单；社区有实验性双向映射项目（rudyBear/gltf-interactivity-bidirectional），成熟度未核实 | [S4][S33] |
| **PlayCanvas** | 运行时 | ✕ 未核实到支持（其 2026 重心是 WebGPU + 3DGS） | [S34] |
| **Wonderland Engine** | 运行时 | ✕ 未核实到支持（2025-12 发布重点是 XR Interaction 库与 WebGPU 渲染选项） | [S35] |
| **Ambit** | 运行时 | ✕ **未能核实到任何 KHR_interactivity 相关证据** | — |
| **Godot** | 引擎 | ◐ 仅伴生扩展：`KHR_node_visibility` 已实现并保留导入可见性；未见 interactivity 执行 | [S20] |

> **对 Lead 四条主张的复核**：① "Babylon 只有它完整 playback" → **基本成立**（加上 SampleViewer，严格说是"两个 ratification 级实现，Babylon 是唯一带编辑器/导出的通用引擎"）；② "three.js 仅 load-only（无 executor）" → **成立**，更准确说是"无官方支持，连 load 侧也只把它们当普通扩展忽略"；③ "Unity 仅 Needle 导出；Godot 部分；UE5 未确认" → **成立/无法确认**（UE5 在 Khronos 新闻与 Babylon 文档中均未出现）；④ three.js WebGPURenderer+XR 重构 → **成立**，见 3.4。

#### 3.1.4 物理、音频、压缩、LOD、OMI

- **物理**：`KHR_physics_rigid_bodies`（Review Draft，PR #2424）与 `KHR_collision_shapes`（Review Draft，PR #2370）**都未 ratified**。Blender 侧已有第三方 `khr-physics-rigid-bodies` 插件进入 approval queue，说明工具链在动，但**不能作为标准依赖**。[S3]
- **音频**：`KHR_audio_graph` 仅 **Proposal**（PR #2421）；`KHR_audio_emitter` 长期未 ratified。choroweave 的空间音频必须自研（Web Audio + HRTF）。[S3][S27]
- **压缩三件套**：`KHR_draco_mesh_compression`、`KHR_texture_basisu`（KTX2/BasisU）、`EXT_meshopt_compression` 均为 **Ratified**，是"网页即开即玩"的工程底座，建议全部默认开启。[S3]
- **LOD**：`MSFT_lod` 仍是 **Vendor 扩展**，未进 Khronos ratified 列表；跨引擎一致性差。建议自研分块 LOD 树（参考 3D Tiles/SPZ v5 规划）。[S3]
- **OMI 兼容性**：OMI 的 glTF 扩展多数停在 Stage 0–2，**实际只有 Godot 通过插件实现** `OMI_physics_body`/`OMI_physics_shape`/`OMI_seat`/`OMI_spawn_point`；`OMI_collider`、`OMI_link`、`OMI_personality` 已归档。这意味着**"空间链接/传送门"在 OMI 里曾经有提案（OMI_link），但已废弃**——choroweave 如果要做 portal 协议，目前没有可依赖的现成标准。[S27]

### 3.2 WebXR：能力与支持矩阵

**规范层**（W3C Immersive Web WG，活跃）：WebXR Device API 为 **CR**，AR Module 为 CR，Gamepads 为 WD；Layers / Hand Input / Hit Test / Depth Sensing / Lighting Estimation / Anchors / Plane Detection 为 Editor's Draft 或 WD；**WebXR/WebGPU Binding Module Level 1 仍是 Editor's Draft**。[S22]

**工作组活跃度**：2026-05-19/20 在 Apple 纽约办公室开 F2F；2026-10-26~30 参加 TPAC 2026（都柏林）。说明 WebXR 标准仍在推进，但**推进速度慢于厂商自有方案**。[S22]

**设备/浏览器矩阵（截至 2026-11）**

| 能力 | Chrome/Edge 桌面 | Chrome Android | Quest Browser | Pico Browser | visionOS Safari | 备注 |
|---|---|---|---|---|---|---|
| `immersive-vr` | ✓（需 XR 设备） | ✓ | ✓ | ✓ | ✓（visionOS 2+ 默认） | visionOS 1.x 需 Feature Flag |
| `immersive-ar` | △ | ✓（ARCore） | 未核实 | 未核实 | 未核实 | AR 模块为 CR |
| WebXR Layers | ✓ | ✓ | ✓ | 未核实 | ✓（Safari 27 起支持 texture-array projection） | XR 性能关键 |
| Hand Input | ✕ | △ | ✓ | 未核实 | ✓（+ transient-pointer） | visionOS 输入模型特殊，见 3.3 |
| Hit Test | ✕ | ✓ | 未核实 | 未核实 | 未核实 | 需 feature-detect |
| Anchors | ✕ | ✓ | 未核实 | 未核实 | 未核实 | 需 feature-detect |
| Depth Sensing | ✕ | ✓ | 未核实 | 未核实 | 未核实 | 需 feature-detect |
| Lighting Estimation | ✕ | ✓ | 未核实 | 未核实 | 未核实 | 需 feature-detect |
| WebXR/WebGPU 绑定 | ✕ | ✕ | ✕ | ✕ | ✕ | 仅 Editor's Draft |

> 标注说明：✓ = 有一手/权威文档支持；△ = 部分设备/部分版本；"未核实" = 本轮未找到一手兼容表，**禁止在实现中假设可用**。
> 通用结论：**WebXR 的真实可用面 = Chromium 系（含 Quest Browser） + visionOS Safari**；桌面 Safari 与 Firefox 不构成本代产品的目标平台。[S8][S9]

**SteamVR/PC VR**：SteamVR 本身不提供完整的 WebXR 浏览器；PC VR 用户实际路径是"桌面 Chrome/Edge + SteamVR 的 OpenXR 运行时"。choroweave 若要覆盖 PC VR，应把"浏览器 + 桌面 OpenXR"当作独立测试通道，而不是"头显内浏览器"。（SteamVR 内建浏览器 WebXR 支持**未能核实**。）

### 3.3 visionOS Safari 的真实状态（重点核实项）

**结论：真支持，但"默认开启 + 特性子集 + 苹果另有主线"，三件事要分开说。**

1. **WebXR 在 visionOS 上可用**。visionOS 1.1 时 Safari 以 Feature Flag 形式提供测试（Settings > Apps > Safari > Advanced > Feature Flags > WebXR Device API）；**visionOS 2 宣布正式支持**（WebKit 官方博客原文："Apple announced WebXR support with visionOS 2"），visionOS 1.2 仍需手动开启。[S10][S36]
2. **输入模型与其它平台不同**：默认是 **transient-pointer（眼动瞄准 + 捏合确认）**，`inputSources` 在捏合前为空；同时支持 `hand-tracking`（需在 `requestSession` 里声明 feature 并由用户授权），此时前两个 inputSource 是 hand tracked-pointers，transient-pointer 排在其后。**three.js 常见示例只读 index 0/1，在 visionOS 上会点不到东西**（WebKit 官方明确点名）。这对运行时抽象层是硬性要求：**输入源不能用固定索引**。[S10]
3. **在持续演进**：Safari 27（2026-09-17）为 WebXR Layers 增加了 `textureType: "texture-array"` 的 projection layer 支持，说明苹果并未放弃 WebXR。[S13]
4. **但苹果的空间 Web 主线是另一套**：`<model>` 元素（visionOS 26 默认开启，USDZ 为中心，支持 environmentmap/stagemode；Safari 27 起下放到 iOS/iPadOS/macOS，并支持 `<source>` 回退到 glb）+ **Immersive API**（类 Fullscreen API，在 visionOS 上从 `<model>` 进入网站级沉浸环境；Safari 27 取代早期 Spatial Backdrop 开发者预览）。[S11][S12]
5. **战略含义**：choroweave 若在 visionOS 上只做 WebXR，会与苹果自家"模型元素 + 沉浸环境"路线形成双轨；建议 **WebXR 为主、`<model>` + Immersive API 作为 visionOS 增强降级路径**（例如门户预览、单资产展示）。这不是技术偏好，而是渠道风险对冲。

### 3.4 WebGPU：支持矩阵与引擎成熟度

**浏览器矩阵（gpuweb 官方 Implementation Status + caniuse 2026-10 交叉核实）**

| 浏览器/平台 | 状态 | 备注 |
|---|---|---|
| Chrome/Edge 桌面（Mac/Win/ChromeOS） | ✅ 113+ | Dawn 实现 |
| Chrome Android | ✅ 121+（ARM/Qualcomm/Intel，Android 12+） | Imagination Android 16+ |
| Chrome Linux | ✅ Intel Gen12+ 144；NVIDIA Wayland 147 | 其它需 flag |
| **Safari 26+（macOS/iOS/iPadOS/visionOS）** | ✅ **默认开启** | caniuse 桌面标 "partial"，iOS 标 supported |
| Firefox Windows | ✅ 141（2025-07） | wgpu |
| Firefox macOS 26+ | ✅ 145；全部 macOS 147 | |
| **Firefox Linux** | 👷 Nightly（Mozilla 称"2026 年内发布"） | **未默认** |
| **Firefox Android** | 👷 需 flag | **未默认** |
| Quest Browser / Pico Browser | **未能核实** | 基于 Chromium，但版本与开关由厂商控制 |

**全局可用率**：caniuse 2026-10 为 86.83%（+1.8% = 88.63%）。但"可用率"掩盖了**头部设备差异**：Firefox Linux/Android 与头显浏览器仍是空白。[S14][S15]

**引擎侧成熟度**

- **Babylon.js**：WebGPU 自 5.0（2022-05）起支持，2024 年核心 shader 重写为原生 WGSL；**WebGPU-XR 仍是 experimental**，依赖 `XRGPUBinding`，要求 `xrCompatible: true` + 先启用 WebXR Layers，且**无法在场景创建后从 WebGPU 切换到 WebGL**。[S16]
- **three.js**：`three/webgpu` 的 `WebGPURenderer` 可用，但 **WebGPU 下的 WebXR 直到 2026-04 才从"直接抛错"改为"自动回退 WebGL"**（PR #33497，Meta 工程师 Rik Cabanier 提交）；另一条 2026-03 的 PR #33154 还在重构 WebXR 的 framebuffer cache。结论：**three.js 的 WebGPU+XR 不是生产路径**。[S17][S37]
- **PlayCanvas**：引擎 1.62（2023）起支持 WebGPU，2024 年进编辑器；但 2026 年的重心是 3DGS（SuperSplat 2026-09 整体重建在 WebGPU 上、流式 LOD）。**未见 KHR_interactivity 支持。**[S34]

**对 3DGS 的意义**：WebGPU 的 compute shader + storage buffer 让"GPU 排序 / 分块 LOD / 后处理"成为可能；WebGL2 路径只能靠 CPU 排序 + instancing，规模上不去。**但 WebXR 内用 WebGPU 目前无标准绑定**，所以 3DGS 的 XR 形态短期只能走 WebGL2 或"大厅用 WebGPU、进 XR 回退 WebGL"。

### 3.5 性能预算：设备现在到底能承载什么

**一手数据（Meta 官方 Unity 性能检查清单，Quest 系列）**：[S18]

| 指标 | Quest 2 | **Quest 3 / Meta VR Glasses** |
|---|---|---|
| Draw calls / 帧 | 50–100 | **≤150** |
| 三角形 / 帧 | < 750K | **< 1M** |
| Overdraw | < 2x 平均 | < 2x 平均 |
| 总可用 RAM | ~1.5 GB | **~2 GB** |
| 纹理显存 | ~300–500 MB | **~500–700 MB** |
| 网格显存 | ~100–200 MB | ~150–300 MB |
| 纹理压缩 | ASTC 6x6（UI 4x4） | 同左 |

> 注意：这是**原生 Unity/URP** 的预算。浏览器 WebXR 还要额外承担 Chromium GPU 进程、JS 主线程、合成器与 WebGL 驱动开销，**实际可用预算要再打 5–7 折**（工程估计，需在 Quest 3 实测校准）。Pico 4（XR2 Gen1，2022 年硬件）应比 Quest 3 再低一档。

**"网页即开即玩"的可达画面上限（工程判断，非官方数据）**

- 首包（HTML+JS+wasm+首个空间壳）：**≤ 5–8 MB**（4G/弱网 3–5 秒内可交互）
- 单空间资产：**10–40 MB**（KTX2 + meshopt + 实例化），配合门户预取
- 三角形：**30–50 万/帧**（Quest 3 WebXR 起点），draw calls **50–80**
- 3DGS：单场景 **100 万–300 万 splat** 是现实上限（1M splat 的 SPZ 约 19–21 MB，见 3.7）；大规模必须分块 + LOD + 流式
- 视觉目标：**风格化、烘焙光照、少量动态光、无实时阴影级联**；实时 PBR 全屏光照 + 高模 + 大世界 = 不可达

**WASM/JS 沙盒开销（结论性判断）**

- WASM 计算接近原生（物理 60Hz、动画采样、图执行没问题），但**每帧 JS↔WASM 边界调用**与主线程单线程模型才是瓶颈；需要 Worker + OffscreenCanvas + SharedArrayBuffer（依赖 COOP/COEP 跨源隔离）。
- 多线程 WASM（Jolt multithread、Rapier parallelism）在浏览器里默认不可用，需站点配置交叉隔离头；头显浏览器是否支持 COOP/COEP **未核实**，这直接决定"物理能不能多线程"。
- WebXR 的渲染循环必须与 `requestAnimationFrame`/`XRSession.requestAnimationFrame` 对齐，**不能把渲染丢到 Worker**（WebGL 上下文在主线程；WebGPU 可用 OffscreenCanvas 但 XR 绑定未标准化）。

### 3.6 物理引擎与网络模型

**物理引擎对比（面向 Web/WebXR + 服务端复用）**

| 引擎 | 形态 | 优势 | 风险 | 建议 |
|---|---|---|---|---|
| **Rapier** | Rust → WASM/JS（官方 `@dimforge`） | 性能好、可选 SIMD/并行、**可选跨平台确定性**、官方维护 | 包体较大（未核实精确值） | ★ 主选（尤其需要"服务端 Rust + 客户端 WASM 同源"） |
| **Jolt** | C++ → WASM/asm.js（JoltPhysics.js，MIT） | 质量高、7 种构建（含多线程）、被 GDevelop/Babylon 插件采用 | JS 绑定是"几乎全量 C++ 接口"，学习曲线陡；多线程需隔离头 | ★ 备选/高保真场景 |
| **PhysX（physx-js / physx-js-webidl）** | C++ → WASM（Emscripten/WebIDL） | 工业级特性全 | 体积大、维护与文档弱（活跃度未核实） | ○ 不推荐新项目 |
| **Ammo.js** | Bullet → asm.js/WASM | 历史生态大（three.js 示例） | 维护低速、性能一般 | ✕ 新项目不用 |

> 证据：Rapier [S39]、Jolt [S40]、PhysX（physx-js-webidl）[S41]；Ammo.js 为历史项目，本轮未单独取证，其"维护低速"属社区共识性判断（未核实 2026 提交活跃度）。

**多人网络模型**

- **权威服务器 vs 客户端权威**：开放世界 + 跨服务器传送门 + 用户生成内容 ⇒ **必须服务器权威**（客户端只做预测/插值），否则传送/资产/权限无法防作弊。
- **传输层**：**WebTransport 首选**（HTTP/3，支持不可靠 datagram + 多流；caniuse 2026-10 = 92.37%，Safari 26.4+/Chrome 97+/Firefox 114+），WebRTC DataChannel 兜底（P2P/语音），WebSocket 仅作控制面。头显浏览器对 WebTransport 的支持**未核实**，需实测。
- **状态同步与 KHR_interactivity 的关系**：由于规范明确"仅单用户"，**行为图的状态不能直接联网同步**。可行做法：choroweave 定义"可复制属性白名单"（glTF Object Model 的 JSON Pointer 路径），服务端只同步白名单内的 pointer 值 + 自定义变量，行为图在本地的执行结果通过 pointer 变化被网络层捕获。这是把标准扩展成多人体验的关键工程点，也是自研价值所在。

### 3.7 流式传输与 3DGS

- **渐进式 glTF**：GLB 单缓冲 + `EXT_meshopt_compression`（支持 fallback）已能实现"先粗后细"；真正的"边下边玩"仍需自定义分块（按节点/材质/包围盒切片）+ HTTP Range。
- **3D Tiles**：OGC 社区标准，tileset 树 + LOD + glTF 内容，适合地理级数据；对"室内/社交空间"过重，但**其 tile 树 + 内容寻址思路值得照搬**。[S24]
- **MPEG-I Scene Description（ISO/IEC 23090-14）**：第 1、2 版已发布；2026 年仍在做 Amendment（沉浸式音频/场景理解/高级媒体格式），并持续注册 Khronos glTF 扩展。**没有主流 Web 运行时**，短期不采。[S25]
- **3DGS 格式现状（2026 关键变化）**：
  - **KHR_gaussian_splatting 已 ratified**：把 splat 存为 `POINTS` 图元 + 自定义属性（ROTATION/SCALE/OPACITY/SH_*），不支持时可退化为点云；明确设计为"可被压缩扩展继续扩展"。[S21]
  - **SPZ 4（Niantic，2026-05-05）**：6 路并行 ZSTD 流替代单 GZip，编码快 3–5x、加载快 1.5–2x、仍比 PLY 小 10x；32 字节明文头；引入 vendor 扩展链；SH degree 4。基准：1.0M 点 = 18.9 MB、TTR 238ms；3.6M 点 = 65.7 MB、TTR 844ms；7.1M 点 = 128 MB、1.66s。**v5 路线图明确写 "Streaming and progressive loading / Spatial chunking and LOD"——即流式尚未完成。**[S26]
  - **SOG / Streamed SOG（PlayCanvas）**：WebP 图集 + meta.json，通常比 PLY 小 15–20x；已提供 "Streamed SOG" 文档，说明 PlayCanvas 已把"分块流式"产品化。[S28]
  - **结论**：3DGS 的"传输格式"已收敛到 SPZ/SOG 两个事实标准，"glTF 内表示"收敛到 KHR_gaussian_splatting；但**压缩扩展与流式 LOD 仍是 2026–2027 的进行时**，choroweave 应自己做 chunk 索引 + 预取，而不是等标准。
- **CDN/内容寻址工程实践**：内容哈希命名 + immutable cache + Range 请求 + HTTP/3 多路复用 + 门户邻接预取。没有标准，但这是"跨服务器空间互链"的必要工程层。

### 3.8 标准组织动态（2025–2026 活跃度）

- **Khronos**：非常活跃——KHR_interactivity ratified（2026-08-28）、KHR_gaussian_splatting ratified、glTF 2.1 Town Hall（2026-11-17）、Vulkanised 2027 与 Real-Time Shading Symposium 2027 公布、2026-09-15 成立欧洲实体 Khronos AISBL。[S1][S3][S19][S38]
- **W3C Immersive Web WG**：活跃但节奏慢（见 3.2）；2026 年 5 月 Apple 纽约 F2F、10 月 TPAC 2026 都柏林。[S22]
- **Metaverse Standards Forum（MSF）**：活跃，且出现了**与 choroweave 高度同构的议程**——"**Web of Worlds（WoW）**"：把互联网视为可寻址、可链接的空间体验网络，"pages become places, links become portals"；配套 **X3D 4.1 WoW Profile**，明确包含 **Anchor（3D hyperlinks）** 与 **Inline（external scenes）** 节点；白皮书由 MSF 发布，Threedy.io / Virginia Tech 在实现。[S29][S30]
- **OMI（Open Metaverse Interoperability）**：glTF 扩展子组仍在每周开会，但产出停留在 Stage 0–2；`OMI_link`（最接近"传送门"的提案）**已归档**。[S27]
- **BCI（非侵入式）**：消费级 EEG（Muse/Emotiv/Neurable 类）存在，但带宽与稳定性只到"状态/注意力"级别；高带宽侵入式（Neuralink 等）处于**临床试验/医疗适应症**阶段，不是消费输入设备。**近期真正可用的"神经邻近输入"是 sEMG 腕带与眼动+捏合（visionOS 已商用）**。[S31][S32][S10]
  - 对路线图的约束：**Phase 4 不应把"非侵入式 BCI 输入"写成承诺**，建议改成"多模态输入（眼动/手势/语音/EMG）"，BCI 仅作为研究观察项。

---

## 4. 决策建议（ADR 级）

### 4.1 是否押注 KHR_interactivity？

**押注，但限定在"资产内行为层"。**

- ✅ 值得押注的理由：已 ratified（2026-08-28）、有 Babylon 完整实现与 SampleViewer 参考实现、有测试资产仓库、设计上"安全 + 可降级 + 可扩展"、与 glTF 2.1 的多文件场景方向一致。[S1][S2][S4]
- ❌ 不能押注的部分：**多人同步**（规范明确单用户）、**UI/复杂脚本**（明确排除）、**传送门/空间链接**（无标准，OMI_link 已归档）、**世界级规则**（图灵完备但受运行时限流，不适合业务逻辑）。
- 建议架构：**"KHR_interactivity（对象行为） + choroweave World Protocol（世界/联网/链接）"双层**。对象行为用标准图；世界规则用 TS/WASM 模块（由 host 注入受限 API），避免把业务塞进图里导致不可移植。
- 落地顺序：先用 Babylon.js 的 `KHR_interactivity` 导入/执行做 v0.1 的"可交互物体"；用 Flow Graph Editor 做可视化调试；用 SampleViewer 做一致性回归。**不要自研 DSL 编译器作为 v1**——等 World Protocol 稳定后再评估是否需要 DSL 提升授权体验。

### 4.2 运行时底座建议

| 候选 | 结论 | 理由 |
|---|---|---|
| **Babylon.js** | ★ **v0.1 主运行时** | 唯一 ratified 级 KHR_interactivity 播放 + 编辑器 + 无损导出；WebGPU/WebGL 双后端；WebXR 成熟度高；有 Flow Graph 可视化。[S5][S16] |
| **three.js** | ◐ 渲染/3DGS 支线 | 生态最大、3DGS/后处理实验快；但 **WebGPU+XR 仍是半成品**（#33497 回退方案、#33154 重构中），且无 KHR_interactivity executor。[S17][S37] |
| **PlayCanvas** | ○ 资产管线 | WebGPU/3DGS 强（SuperSplat），但无 KHR_interactivity；适合做"资产优化 + 3DGS 工具链"而非主运行时。[S34] |
| **自研引擎** | ✕ 不建议 | 与标准/引擎生态对抗，成本远超收益；choroweave 的护城河应在"空间协议 + 生成管线"，不在渲染器。 |

> 工程建议：在 Babylon 之上做一层 **Runtime Adapter**（场景加载、输入抽象、状态白名单、portal 生命周期），保持"3 个月内可换 three.js 适配器"的抽象度，避免锁死。

### 4.3 是否 WebGPU-only？

**明确：不做 WebGPU-only。**

- Firefox Linux/Android 未默认（Mozilla 称 Linux 2026 年内发布，Android 仍在 flag）；Quest/Pico 浏览器 WebGPU **未能核实**；WebXR/WebGPU binding 仍是 **Editor's Draft**；Babylon 的 WebGPU-XR 是 experimental；three.js 的 WebGPU-XR 才刚有 WebGL 回退。[S14][S15][S16][S17]
- 推荐策略：**WebGL2 默认 + WebGPU 特性探测增强**。WebGPU 路径先用于：非 XR 的高端桌面预览、3DGS 渲染、后处理/计算密集效果；XR 会话内默认 WebGL2，待 WebXR/WebGPU binding 进 CR 且 Quest 浏览器明确支持后再切换。
- 监控指标：`navigator.gpu` 存在性 + `XRSession` 是否暴露 `XRGPUBinding` + Quest Browser 版本说明（季度复核）。

### 4.4 性能预算表（建议写入引擎启动检查）

| 档位 | 设备 | 三角形/帧 | Draw calls | 纹理显存 | 首包 | 单空间 | 目标帧率 |
|---|---|---|---|---|---|---|---|
| XR-Low | Pico 4 / Quest 2 | 20–30 万 | 40–60 | ≤300 MB | ≤5 MB | ≤15 MB | 72 Hz |
| XR-Mid | **Quest 3** | **30–50 万** | **50–80** | ≤400 MB | ≤8 MB | ≤30 MB | 72–90 Hz |
| XR-Apple | visionOS Safari | 50–80 万（估） | 60–100 | 未核实 | ≤8 MB | ≤30 MB | 90 Hz |
| Desktop | PC/笔记本 | 200–500 万 | 200–500 | ≤2 GB | ≤15 MB | ≤80 MB | 60 fps |
| 3DGS 附加 | Quest 3 | — | — | — | — | 100–300 万 splat | 72 Hz |

> 表中 XR-Low/Mid 是在 Meta 原生预算上乘 0.5–0.7 的工程折减（**非官方数据**）；visionOS 与 3DGS 行为**必须实机标定**，当前仅作规划上限。

### 4.5 传送门/空间链接协议建议

- **不要等标准**：KHR_interactivity 不含链接，OMI_link 已归档，glTF 2.1 外部引用仍 Proposal。
- **对齐 MSF "Web of Worlds" 与 X3D Anchor/Inline 语义**（"链接即传送门"的既有标准语言），choroweave 定义最小 portal manifest：`target`（URL/内容哈希）、`anchor`（glTF 节点 + 变换）、`handoff`（进入方式：同实例/跨实例/新会话）、`policy`（权限、资源预算）、`version`。
- 工程上：portal 清单用 JSON + 内容哈希；跨服务器握手用 WebTransport/HTTPS；资产用内容寻址 + 预取。[S29][S30]

### 4.6 12 个月路线建议（摘要）

1. Q4 2026–Q1 2027：Babylon + WebGL2 做 v0.1（一个空间 + KHR_interactivity 物体 + 单人漫游 + WebXR）。
2. Q1–Q2 2027：World Protocol v0（portal manifest + 内容寻址 + 预取），服务器权威同步（WebTransport）。
3. Q2–Q3 2027：3DGS 支线（SPZ/SOG 分块 + WebGPU 非 XR 渲染），以及 visionOS `<model>` 降级路径。
4. 持续：季度复核 WebXR/WebGPU binding、Quest Browser WebGPU、glTF 2.1 发布、KHR_physics 状态。

---

## 5. 风险与未知

### 5.1 高风险

| 风险 | 影响 | 缓解 |
|---|---|---|
| KHR_interactivity 生态只有 2 个 ratification 级实现 | 资产工具链窄、跨引擎一致性未经大规模验证 | 以 Babylon 为参考实现；建立跨引擎回归资产集（SampleViewer + Babylon） |
| 规范"仅单用户" + 无链接标准 | 多人共在/传送门必须自研，标准红利有限 | 自研 World Protocol；与 MSF WoW 对齐，争取后续标准化 |
| 苹果空间 Web 双轨（WebXR vs model/Immersive API） | visionOS 渠道策略不确定 | WebXR 为主 + `<model>`/Immersive API 增强层 |
| WebGPU-XR 未标准化 + 头显浏览器支持不明 | 3DGS/高端渲染无法在 XR 内兑现 | WebGL2 保底；WebGPU 仅非 XR 增强 |
| Quest 3 浏览器性能无官方预算 | 早期 demo 可能"看起来能跑、实际掉帧" | 先做性能标定场景（draw call/三角形/overdraw 探针），再定美术规范 |
| 3DGS 流式未完成（SPZ v5 roadmap） | 大场景加载时间不可控 | 自研 chunk + LOD 索引；限制单空间 splat 数 |
| BCI 被写进路线图 | 交付风险与叙事风险 | 改为多模态输入；BCI 仅研究观察 |

### 5.2 明确的"未能核实"清单（实现时禁止假设）

1. Quest Browser / Pico Browser 的 **WebGPU 默认状态与版本**。
2. visionOS Safari 对 **Hit Test / Anchors / Depth Sensing / Lighting Estimation** 的逐项支持。
3. Quest/Pico 对 **WebXR AR 模块**（passthrough、plane detection）的完整度。
4. **three.js / PlayCanvas / Wonderland / Ambit** 是否存在非官方 KHR_interactivity 插件（社区项目存在但成熟度未核实）。
5. **Needle Engine** 运行时是否已在 2026-11 前发布 KHR_interactivity 支持。
6. **MSFT_lod** 的 2026 年跨引擎支持现状。
7. 头显浏览器是否支持 **COOP/COEP**（决定 WASM 多线程与 SharedArrayBuffer）。
8. KHR_gaussian_splatting 的**精确 ratification 日期**（README 写 Ratified，但未找到对应新闻稿）。
9. SteamVR 内建浏览器对 WebXR 的支持。
10. 各引擎 **WASM 物理包体**的精确 gzip 后体积（本轮未测）。

### 5.3 被夸大的说法（需要在对外叙事中修正）

| 流行说法 | 实际 |
|---|---|
| "KHR_interactivity 已 ratified，所以交互标准成熟了" |  ratified 只代表规范定稿。**实现只有 2 个 ratification 级**，授权工具以 UnityGLTF/Behave 为主，three.js/PlayCanvas/Godot 都不支持执行。 |
| "glTF 现在能做完整交互应用了" | 规范明确排除 UI、任意脚本、多用户；只适合"资产内行为"。 |
| "WebXR 是跨平台 Web 标准" | MDN 标 *Experimental / Limited availability*，非 Baseline；Safari 桌面/iOS 默认关闭；实际只有 Chromium + Quest + visionOS。 |
| "WebGPU 2026 全面可用" | Firefox Linux/Android 未默认；WebXR/WebGPU binding 仍是 Editor's Draft；三大引擎的 WebGPU-XR 都是 experimental。 |
| "visionOS 全面支持 WebXR" | 支持，但输入模型是 transient-pointer/hand-tracking 的子集，且苹果主线是 `<model>` + Immersive API。功能矩阵官方未逐项公开。 |
| "KHR_physics 已经有物理标准" | 仍是 **Review Draft**（PR #2424），不能依赖。 |
| "3DGS 可以直接塞进 VR 大世界" | 1M splat≈19–21MB（SPZ），3.6M≈66MB，7.1M≈128MB；排序与 overdraw 成本高，且流式 LOD 仍在 roadmap。 |
| "BCI 很快能作为输入" | 非侵入式只到状态级；侵入式在临床。近期现实是眼动/手势/语音/sEMG。 |

---

## 6. 来源列表（按主题）

**glTF / Khronos 标准**

- [S1] Khronos 新闻稿（2026-07-16）"glTF Interactivity Extension Submitted for Ratification"：<https://www.khronos.org/news/press/gltf-interactivity-extension-submitted-for-ratification>
- [S2] KHR_interactivity 规范正文（Status: Complete, Ratified）：<https://raw.githubusercontent.com/KhronosGroup/glTF/main/extensions/2.0/Khronos/KHR_interactivity/Specification.adoc>
- [S3] glTF 扩展注册表（Ratified / In-progress / Vendor 列表）：<https://raw.githubusercontent.com/KhronosGroup/glTF/main/extensions/README.md>
- [S4] Khronos 网络研讨会页（2026-10-13，含 "ratification on August 28, 2026" 与"前两个独立实现"）：<https://www.khronos.org/events/practical-introduction-to-interactivity-in-gltf>
- [S5] Babylon.js 官方文档 KHR_interactivity（ratified 表述、加载/执行/编辑器/无损导出）：<https://raw.githubusercontent.com/BabylonJS/Documentation/master/content/features/featuresDeepDive/importers/glTF/khrInteractivity.md>
- [S6] UnityGLTF CHANGELOG（KHR_interactivity 导出支持）：<https://github.com/KhronosGroup/UnityGLTF/blob/main/CHANGELOG.md>
- [S7] Khronos glTF 仓库 Khronos 扩展目录（含 KHR_gaussian_splatting / node_* 等）：<https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos>
- [S19] glTF 2.1 Town Hall（2026-11-17，多文件组合/包围体/64-bit GLB）：<https://www.khronos.org/events/gltf-2.1-town-hall>
- [S20] Godot `KHR_node_visibility` PR #93722：<https://github.com/godotengine/godot/pull/93722>
- [S21] KHR_gaussian_splatting 规范 README（Ratified；Known Implementations）：<https://raw.githubusercontent.com/KhronosGroup/glTF/main/extensions/2.0/Khronos/KHR_gaussian_splatting/README.md>
- [S33] three.js 社区 KHR_interactivity 双向映射实验（非官方）：<https://github.com/rudybear/gltf-interactivity-bidirectional>
- [S38] Khronos 2026-09-15 成立欧洲实体新闻：<https://www.khronos.org/news/press>

**WebXR / W3C**

- [S8] MDN WebXR Device API（Limited availability / Experimental）：<https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API>
- [S9] caniuse WebXR（2026-10 数据，78.02%）：<https://caniuse.com/webxr>
- [S22] W3C Immersive Web WG（规范状态、TPAC 2026、F2F 记录）：<https://www.w3.org/immersive-web/>
- [S36] WebKit 博客（visionOS 2 WebXR 支持说明）：<https://webkit.org/blog/15421/try-out-your-website-in-the-spatial-web/>

**visionOS / Apple**

- [S10] WebKit 博客 "Introducing Natural Input for WebXR in Apple Vision Pro"（transient-pointer / hand-tracking / 索引 0-1 坑）：<https://webkit.org/blog/15162/introducing-natural-input-for-webxr-in-apple-vision-pro/>
- [S11] WebKit 博客（visionOS 26 HTML model element 默认开启）：<https://webkit.org/blog/17118/a-step-into-the-spatial-web-the-html-model-element-in-apple-vision-pro/>
- [S12] WWDC26 "Explore immersive website environments in visionOS"（Immersive API）：<https://developer.apple.com/videos/play/wwdc2026/320/>
- [S13] WebKit "WebKit Features for Safari 27.0"（WebXR texture-array layers、model 元素下放、Immersive API）：<https://webkit.org/blog/18325/webkit-features-for-safari-27-0/>

**WebGPU**

- [S14] gpuweb 官方 Implementation Status：<https://github.com/gpuweb/gpuweb/wiki/Implementation-Status>
- [S15] caniuse WebGPU（2026-10）：<https://caniuse.com/webgpu>
- [S16] Babylon.js WebGPU 支持文档（含 WebGPU-XR experimental）：<https://raw.githubusercontent.com/BabylonJS/Documentation/master/content/setup/support/webGPU.md>
- [S17] three.js PR #33497 "WebGPURenderer: Add fallback for XR with WebGPU"：<https://github.com/mrdoob/three.js/pull/33497>
- [S37] three.js PR #33154 "Simplification of the frame buffer cache for WebXR"：<https://github.com/mrdoob/three.js/pull/33154>

**性能 / 物理 / 网络**

- [S18] Meta 官方 Unity VR 性能检查清单（draw calls/三角形/显存/overdraw）：<https://raw.githubusercontent.com/meta-quest/agentic-tools/main/skills/hz-unity-code-review/references/performance-checklist.md>
- [S39] Rapier 官网（WASM/JS、确定性、SIMD/并行）：<https://rapier.rs/>
- [S40] JoltPhysics.js README（7 种构建、多线程、采用方）：<https://github.com/jrouwe/JoltPhysics.js>
- [S41] physx-js-webidl（PhysX WASM 绑定）：<https://github.com/JeffreyCastellano/physx-js-webidl>
- [S23] caniuse WebTransport（2026-10，92.37%）：<https://caniuse.com/webtransport>

**流式 / 3DGS / 标准组织 / BCI**

- [S24] OGC 3D Tiles 标准页：<https://www.ogc.org/standards/3dtiles/>
- [S25] MPEG-I Scene Description（ISO/IEC 23090-14）标准页与 2026 会议文档：<https://www.mpegstandards.org/standards/MPEG-I/14/>
- [S26] Niantic "SPZ 4 is here"（2026-05-05，基准数据与 v5 路线图）：<https://www.nianticspatial.com/en/blog/spz4>
- [S27] OMI glTF 扩展仓库 README（Phase 0–5、支持表、OMI_link 归档）：<https://raw.githubusercontent.com/omigroup/gltf-extensions/main/README.md>
- [S28] PlayCanvas SOG 格式规范（含 Streamed SOG 文档入口）：<https://developer.playcanvas.com/user-manual/gaussian-splatting/formats/sog/>
- [S29] Web3D/Anita Havele（2026-07-12）"Web of Worlds、X3D/Web3D 与 MSF"：<https://www.web3d.org/new/blog/how-web-worlds-x3dweb3d-and-metaverse-standards-forum-tie-together>
- [S30] MSF 新闻室：<https://metaverse-standards.org/news/>
- [S31] Wikipedia "Brain–computer interface"（作为 BCI 分类与成熟度的概览性参考）：<https://en.wikipedia.org/wiki/Brain%E2%80%93computer_interface>
- [S32] 2026 年 BCI 综述（信息驱动型 BCI，仅检索到题录、未获取全文）：<https://www.sciencedirect.com/science/article/abs/pii/S157401372600136X>
- [S34] PlayCanvas 博客（WebGPU / SuperSplat / 3DGS 动态）：<https://blog.playcanvas.com/tags/webgpu/>
- [S35] Wonderland Engine 1.5.1 发布说明（2025-12-25）：<https://wonderlandengine.com/news/release-1.5.1/>

---

### 附：本报告的自查清单

- [x] 区分"规范草案"与"已 ratified"：KHR_interactivity（ratified 2026-08-28）、KHR_physics（Review Draft）、KHR_audio_graph（Proposal）、WebXR/WebGPU Binding（Editor's Draft）、WebGPU（浏览器能力，非 W3C REC）。
- [x] 区分"实验性 flag"与"默认开启"：Firefox Linux WebGPU 仍 Nightly；visionOS 1.x WebXR 需 flag、visionOS 2+ 默认；Safari 26 WebGPU 默认；Quest 浏览器状态标注未核实。
- [x] 所有关键结论均有 URL；无法核实的 10 项集中列在 5.2。
- [x] 交叉验证 Lead 提供的 4 条事实：全部采纳并修正口径（见 3.1.3、3.2、3.4）。
- [x] 未使用未核实百分比/版本号；二手推测均明确标注"工程估计"。
