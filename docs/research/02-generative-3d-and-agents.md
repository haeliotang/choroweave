# 调研 02：生成式 3D、世界模型与 Agent 世界构建

> 项目：choroweave（意图 → 可执行空间 / 空间超链接）
> 核实口径：**截至 2026-11-07**。所有"已核实"条目均给出来源 URL 与日期；官方声明与第三方实测分开标注；无法核实的一律写"未能核实"，不做补全。
> 证据等级（与 `docs/02-tech-selection.md` 对齐）：**A【官方】**= 官方仓库/许可证/文档/论文；**B【三方】**= 独立媒体、社区复现或第三方评测；**C【推断】**= 基于已核实事实的工程推理；**D【未核实】**= 有线索但未拿到一手证据。

---

## 1. TL;DR（10 条）

1. **3D 资产生成在 2025-12 跨过了一个台阶**：Microsoft **TRELLIS.2**（4B，MIT 许可，代码+权重+训练代码全开）在 H100 上 1024³ 约 17 秒、512³ 约 3 秒、1536³ 约 60 秒，原生输出带 PBR（base/rough/metal/opacity）的 GLB，并支持开放曲面/非流形/内部结构。这是 2026 年少有的同时满足"高质量 + 真开源 + 可商用"三条件的 SOTA 资产模型（另一为基于其 backbone 的 Pixal3D，同样 MIT）。【官方】[TRELLIS.2 README](https://github.com/microsoft/TRELLIS.2)
2. **"Hunyuan3D 是开源模型"必须打补丁**：开源权重只到 **2.1 / Omni / Part**（以及 2.0/2mini/2mv）；**3.0 / 3.1 / 3.5 是腾讯云托管服务，没有公开权重**。开源部分使用 Tencent Hunyuan Community License：**许可证在欧盟、英国、韩国不适用**，且发布日 MAU > 100 万需另行向腾讯申请授权；HY-World 2.0 世界模型使用同构的社区许可（2026-04-15）。【官方】[Hunyuan3D-2.1](https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1)、[LICENSE](https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1/blob/main/LICENSE)
3. **世界模型在 2026 年仍然不能当"多人在线社交空间运行时"**。Google 官方在 Genie 4 页面上明确写下限制：连续交互只有"几分钟"、多用户/多智能体共享环境是"ongoing research challenge"、物体永久性与细节会漂移。实时世界模型（Runway GWM Worlds 2 / Matrix-Game 4.0 / Waypoint-1.5）都是**单视角、单会话的视频流**，没有权威共享状态。【官方】[Genie 4](https://deepmind.google/models/genie/)、[MASS 论文](https://arxiv.org/abs/2608.06257)
4. **"世界模型当视觉层、引擎当状态层"已经是 2026 年的工程共识**：Matrix-Game 4.0（2026-10-15，Apache-2.0 权重）显式采用"可执行引擎管玩法/物理 + 因果视频模型做流式神经渲染"，在 RTX 5080 上 864×480 达 **67 FPS**；Rosebud 也把 LingBot World 2 当视觉层、玩法逻辑留给自己的代码层。【官方】[Matrix-Game](https://github.com/SkyworkAI/Matrix-Game)、【三方】[Rosebud 博客](https://lab.rosebud.ai/blog/rosebud-reactor-video-world-models)
5. **"LLM 一句话生成完整游戏"被 2026 年的基准证伪**：CEGame-Bench（2026-10）让 agent 在 Defold/Godot/Roblox/Unity/Unreal 五个生产引擎上从空项目做完整游戏，平均 295 步、65M tokens，**只有 16% 的运行能通关**，玩法分通常不到一半；而"工程师 + 编码 agent"的参考实现接近满分——差距在 agent 而非工具。【官方】[CEGame-Bench](https://arxiv.org/abs/2610.26098)
6. **多人世界模型已有学术原型，但离生产很远**：Solaris（2026-02）在 Minecraft 采集 1264 万帧多智能体数据训练多视角世界模型；MASS（2026-08）提出"权威共享状态 + 独立渲染"的解耦架构；MultiGen（2026-03）用外部持久记忆做可编辑多人世界。三者都还是论文/研究原型，没有生产级开源栈。【官方】[Solaris](https://arxiv.org/abs/2602.22208)、[MultiGen](https://arxiv.org/abs/2603.06679)
7. **商业授权与成本已经足够便宜，适合做产品**：Marble 官方按 credits 计价（1.1 = 1500 credits、Draft = 150 credits、1.1 Plus = 1500–3000 credits）；第三方按 $1=1250 credits 折算约 **$1.20–1.28/世界**（Draft 约 $0.12，1.1 Plus 最高约 $2.48），HQ 网格导出约 $2.80、最长 1 小时、每小时限 4 次；输出是"2M splats + 10–20 万三角面碰撞网格 + 60 万面贴图网格"的**持久 3D 资产**，不是视频。【官方】[Marble 定价/模型](https://docs.worldlabs.ai/marble/models)、[导出规格](https://docs.worldlabs.ai/marble/export/specs)
8. **3DGS 已经是"用户空间的视觉层"而非几何层**：SPZ（Niantic，2024 年末开源）比 PLY 小约 10×，SPZ 4 用 6 路并行 ZSTD、编码快 3×、支持数千万点；SOG（PlayCanvas）用 zip+WebP 并支持流式 LOD；Marble 默认导出 SPZ，Spark（MIT，Three.js）负责浏览器渲染与流式。【官方】[SPZ 4](https://nianticspatial.com/blog/spz4)、[SuperSplat 格式文档](https://developer.playcanvas.com/user-manual/supersplat/editor/import-export/)
9. **"部件化/结构化生成"是让 AI 资产真正可玩的关键**：Roblox CubePart（2026-05，openrail）按用户给的 parts schema 生成可装配、可驱动动画/物理的部件；Roblox 4D 生成用 schema 把物体拆件并**重定向脚本**；腾讯 Hunyuan3D-Part / HY3D-Bench 的 24 万部件级数据都在往这个方向走。纯整体 mesh 生成无法直接绑定骨架/玩法。【官方】[Roblox Cube](https://github.com/Roblox/cube)、[HY3D-Bench](https://github.com/Tencent-Hunyuan/HY3D-Bench)
10. **对 choroweave 的结论**：2026-11 可行的路线是"**LLM 写受约束的 Spatial-DSL → 确定性布局求解 + kitbash → TRELLIS.2/Pixal3D 生成资产 → 自动碰撞/LOD/装配 → 行为图（L0 KHR_interactivity）编译出玩法 → Babylon.js 多人运行时**"；世界模型只做可选视觉增强（预生成 3DGS 或视觉层），**不做状态权威**。这样每空间生成成本可压在 **$0.5–8**（不含人工兜底），草稿 5–10 分钟、标准 20–40 分钟。

---

## 2. 清单表

### 2.1 3D 资产生成（截至 2026-11）

| 名称 | 机构 | 开源权重？ | 许可证 | 硬件 / 耗时 | 能力边界 | 证据 |
|---|---|---|---|---|---|---|
| **TRELLIS.2**（4B） | Microsoft Research | ✅ 权重+代码+训练代码 | **MIT** | ≥24GB VRAM；H100：512³≈3s / 1024³≈17s / 1536³≈60s | 图→3D，O-Voxel，支持开放曲面/非流形/内部结构；PBR 四通道；导出 GLB（默认 4096 贴图、可 100 万面 decimation） | 【官方】[repo](https://github.com/microsoft/TRELLIS.2)、[arXiv 2512.14692](https://arxiv.org/abs/2512.14692) |
| TRELLIS 1 | Microsoft | ✅ | MIT | ≥16GB VRAM，A100/A6000 验证 | 图/文→3D，SLAT；文本条件弱，官方建议先文生图 | 【官方】[repo](https://github.com/microsoft/TRELLIS) |
| **Hunyuan3D 2.1** | 腾讯混元 | ✅ 权重+训练代码 | Tencent Hunyuan 3D 2.1 Community License（**EU/UK/KR 除外；1M MAU 条款**） | 形状 10GB / 贴图 21GB / 全流程 29GB | 3.3B 形状 + 2B PBR 绘色；图→3D | 【官方】[README](https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1) |
| Hunyuan3D-Omni | 腾讯混元 | ✅ 3.3B | 同上（社区许可） | 10GB VRAM | 额外控制信号：点云/体素/包围盒/骨架姿态 | 【官方】[README](https://github.com/Tencent-Hunyuan/Hunyuan3D-Omni) |
| Hunyuan3D-Part | 腾讯混元 | ✅ | Tencent Hunyuan 3D-Part Community License（2025-09-23，含地域限制） | — | 部件分割 + 部件生成 | 【官方】[repo](https://github.com/Tencent-Hunyuan/Hunyuan3D-Part) |
| Hunyuan3D 3.0 / 3.1 / 3.5 | 腾讯（云服务） | ❌ 无公开权重 | 腾讯云平台条款 | 托管；3.5 约 60s、8K PBR；最高 150 万面 | 文/图/多视图/草图→3D；几何与贴图解耦 | 【官方】[Tencent Cloud 技术文档](https://www.tencentcloud.com/techpedia/148305?lang=en)（2026-09-01 更新）；HF 上无 3.x 权重（本文检索确认） |
| Hunyuan3D-Buffalo 1.0 | 腾讯混元 | ❌ 仅论文 | — | — | 统一多模态 3D 生成/理解/编辑 | 【官方】[repo](https://github.com/Tencent-Hunyuan/Hunyuan3D-Buffalo1.0)（2026-08-05，无代码/权重） |
| **TripoSR** | Tripo / Stability | ✅ | **MIT** | 6GB VRAM；A100 <0.5s | 单图→mesh，低模快速；无 PBR 纹理管线（社区版有） | 【官方】[repo](https://github.com/VAST-AI-Research/TripoSR) |
| TripoSG | VAST | ✅ 1.5B | **MIT** | 8GB VRAM | 单图→高保真形状（2048 latent tokens）；偏形状 | 【官方】[HF](https://huggingface.co/VAST-AI/TripoSG)、[repo](https://github.com/VAST-AI-Research/TripoSG) |
| Stable Fast 3D | Stability AI | ✅（HF gated） | **Stability AI Community License**：年收入 <100 万美元可免费商用（需注册），超过则许可自动终止 | 6GB VRAM；秒级 | 单图→UV 展开 mesh + 材质参数 | 【官方】[repo](https://github.com/Stability-AI/stable-fast-3d)、[LICENSE.md](https://huggingface.co/spaces/stabilityai/stable-fast-3d/blob/main/LICENSE.md) |
| **Pixal3D** | 腾讯 ARC + 清华 | ✅ | **MIT**（HF 元数据另标 `extra_gated_eu_disallowed: true`） | 基于 TRELLIS.2 backbone | 单图像素对齐、"接近重建级"几何 + PBR；SIGGRAPH 2026 | 【官方】[HF 卡](https://huggingface.co/TencentARC/Pixal3D)、[repo](https://github.com/TencentARC/Pixal3D) |
| Sparc3D | 学术（Zhihao Li 等） | ❓未找到公开权重 | — | — | 稀疏可变形 marching cubes（1024³）、Sparconv-VAE；面向高分辨率形状 | 【官方】[arXiv 2505.14521](https://arxiv.org/abs/2505.14521)（2025-05）；开源状态【未核实】 |
| Meshy（meshy-7.1） | Meshy | ❌ SaaS | 商业条款 | 云端；按 credits 计费：图→3D mesh 20、+2K 贴图 30、+8K 35；自动绑定 5、每个动画 3、UV 展开 5 | 生成 + 重拓扑/UV/绑定/动画全套后处理 | 【官方】[定价文档](https://docs.meshy.ai/en/api/pricing)（访问于 2026-11） |
| Rodin Gen-2.5 | Deemos / Hyper3D | ❌ 无权重 | 商业条款（付费计划含商用） | 云端；约 4s 几何、约 5s 带贴图 | 水密 manifold，最高约 1000 万面；8 种导出格式 | 【三方】[对比文（读官方页后整理）](https://triposr.org/blog/rodin-vs-hunyuan3d)（2026-10-08）；官方页未逐一亲验 |
| Roblox Cube 3D v0.5 | Roblox | ✅ | **OpenRAIL**（HF 元数据） | — | 文本→3D token 自回归网格；面向游戏引擎兼容性 | 【官方】[repo](https://github.com/Roblox/cube)、[HF](https://huggingface.co/Roblox/cube3d-v0.5) |
| Roblox CubePart | Roblox | ✅ | **OpenRAIL** | — | 开放词表、**部件可控**生成（按 schema 出多块 mesh） | 【官方】[HF](https://huggingface.co/Roblox/cubepart)、[arXiv 2605.28763](https://arxiv.org/abs/2605.28763)（2026-05） |
| HY3D-Bench | 腾讯混元 | ✅ 数据+基线 | 见仓库 | — | 25.2 万水密全物体 / 24 万部件级 / 12.5 万合成；基线 Hunyuan3D-Shape-v2.1 Small 0.8B | 【官方】[repo](https://github.com/Tencent-Hunyuan/HY3D-Bench)（2026-02-04） |

### 2.2 场景 / 布局生成

| 名称 | 机构/年份 | 开源 | 定位 | 关键结论 | 证据 |
|---|---|---|---|---|---|
| LayoutGPT | 2023-05（NeurIPS'23） | ✅ | LLM 用"类 CSS"计划房间布局 | 开创性但只适合简单室内、无物理/可达性保证 | [arXiv 2305.15393](https://arxiv.org/abs/2305.15393) |
| SceneCraft | 2024-03 | ✅ | LLM agent 写 Blender Python 生成场景 | 代码即场景，可迭代；依赖资产库与渲染反馈，速度慢 | [arXiv 2403.01248](https://arxiv.org/abs/2403.01248) |
| Holodeck / Holodeck 2.0 | 2023-12 / 2025-08 | ✅ | 语言引导的程序化 + 资产检索 | "语言→可步行空间"最早一批；2.0 加视觉语言指导与编辑 | [arXiv 2312.09067](https://arxiv.org/abs/2312.09067)、[2508.05899](https://arxiv.org/abs/2508.05899) |
| ProcTHOR | 2022 | ✅ | 程序化住宅（AI2） | 大规模具身 AI 环境，非视觉保真 | [arXiv 2206.06994](https://arxiv.org/abs/2206.06994) |
| Infinigen / Infinigen Indoors | 2023-06 / 2024-06 | ✅（Blender） | 程序化无限写实自然/室内 | 无 AI 随机性、可精确控制；CPU 渲染极慢 | [arXiv 2306.09310](https://arxiv.org/abs/2306.09310)、[2406.11824](https://arxiv.org/abs/2406.11824) |
| SpatialLM 1.1 | 群核科技（Manycore） | ✅ 0.5B/1B | 点云（可来自单目视频+MASt3R-SLAM）→ 墙/门窗/朝向包围盒结构化布局 | NeurIPS 2025；把"真实房间扫描"变成结构化布局的实用件 | [repo](https://github.com/manycore-research/SpatialLM)、[arXiv 2506.07491](https://arxiv.org/abs/2506.07491) |
| HY-World 2.0 | 腾讯（2026-04-16） | ✅ 权重（2026-05 起分批） | 全景生成 80B + 轨迹规划 + WorldStereo 2.0 17B + WorldMirror 2.0 1.2B → 网格/3DGS 世界 | 目前最完整的"文/图→可导入引擎的 3D 世界"开源管线 | [repo](https://github.com/Tencent-Hunyuan/HY-World-2.0)、[arXiv 2604.14268](https://arxiv.org/abs/2604.14268)；⚠️ 许可是 **Tencent HY-WORLD 2.0 Community License**（2026-04-15，EU/UK/KR 排除 + 1M MAU 条款），见 [LICENSE](https://huggingface.co/apozz/hy-worldmirror-2-bf16/blob/main/LICENSE) |
| WorldClaw | 腾讯（2026-08） | ❌ 仅论文 | Agentic 3D 开放世界大规模生成 | 只有论文+项目页，无代码/权重 | [arXiv 2608.05248](https://arxiv.org/abs/2608.05248) |
| SceneDiffuser（任务清单所指） | — | — | — | ⚠️ 核查纠正：2024–2026 的 SceneDiffuser / SceneDiffuser++ 实为**交通场景仿真**（[2412.12129](https://arxiv.org/abs/2412.12129)、[2506.21976](https://arxiv.org/abs/2506.21976)），与室内布局生成不是同一工作；室内版条目**未能核实** | 见左 |

### 2.3 世界模型

| 名称 | 机构 | 开放程度 | 实时性 / 规格 | 可控性 / 一致性 | 多人 / 持久状态 | 证据 |
|---|---|---|---|---|---|---|
| **Genie 3** | Google DeepMind | 闭源；Project Genie 订阅（2026-01-29 起，美国 AI Ultra） | 720p，20–24 FPS；会话上限 **60 秒** | 文/图 prompt、Nano Banana Pro 先出"World Sketching"、可 remix；官方承认漂移 | ❌ 无多人、无持久状态 | 【官方】[Genie 3 blog](https://deepmind.google/blog/genie-3-a-new-frontier-for-world-models/)（2025-08-05）；【三方】[9to5Google](https://9to5google.com/2026/01/29/google-project-genie/) |
| **Genie 4** | Google DeepMind | 研究预览（2026-10-27 起 trusted testers，随后进 Project Genie/API） | 实时；原生音频与对话；官方称"几分钟"，**TechCrunch 报道为最长约 2 分钟** | 生成中可自然语言改天气/加角色/改镜头 | ❌ 官方列为"ongoing research challenge"；"few minutes" | 【官方】[Genie 4 页面](https://deepmind.google/models/genie/)（含 Limitations 段）；【三方】[TechCrunch](https://techcrunch.com/2026/10/27/googles-genie-4-world-model-adds-audio-more-realistic-worlds-and-real-time-steering/) |
| **Marble**（World Labs） | World Labs → AMD（2026-09-28 宣布收购） | 商业 API | 预览约 30s、Draft ~20s、完整世界约 5min、HQ 网格最长 1h | 输出**持久 3D 资产**：2M splats(+500k 低模)、10–20 万面碰撞网格、60 万面贴图网格、2560×1280 全景；无角色/无动力学 | ❌ 静态环境；多人需自建 | 【官方】[模型/定价](https://docs.worldlabs.ai/marble/models)、[导出规格](https://docs.worldlabs.ai/marble/export/specs)；收购见【三方】[Yahoo Finance](https://finance.yahoo.com/technology/ai/articles/amd-just-bought-research-defines-174221101.html) |
| **Oasis / Lucy**（Decart） | Decart | 闭源 API | Oasis 3（2026-06-10，面向 Physical AI）；Lucy 2.5 实时 30 FPS（2026-07-16）、2.6（2026-11-05）；自研 DOS 2.0 推理栈 | 实时世界编辑/变换；Spatial Memory Codec（2026-10）做长时记忆 | ❌ | 【官方】[decart.ai](https://decart.ai/) |
| **GWM Worlds 2** | Runway | 研究预览 | **720p @24 FPS + 48 kHz 音频**，自回归、无预设时长 | WorldPrompt：持久上下文 + 时间戳事件流（文本动作可指向主体或场景）+ 逐帧相机 | ❌ 单会话；实时质量低于"预编排" | 【官方】[Runway 研究页](https://runway.com/research/introducing-gwm-worlds-2)（2026-09-03） |
| **Matrix-Game 4.0** | Skywork | ✅ 权重（Apache-2.0）+ 三个场景游戏源码 | 引擎管玩法，因果视频做流式神经渲染；**RTX 5080 864×480 达 67 FPS**、5070 Ti 58 FPS | 动作由引擎决定 → 可控性最好的一类 | ❌ 单机；但"引擎 + 神经渲染"架构天然可接网络同步 | 【官方】[repo](https://github.com/SkyworkAI/Matrix-Game)、[HF](https://huggingface.co/Skywork/Matrix-Game-4.0)（2026-10-15） |
| Matrix-Game 2.0 / 3.0 | Skywork | ✅ MIT / 2026-03 | 2.0：1.8B、25 FPS、分钟级；3.0 加长时记忆 | 键鼠→帧级动作注入 | ❌ | 【官方】[HF 2.0](https://huggingface.co/Skywork/Matrix-Game-2.0) |
| **Waypoint-1.5** | Overworld | ✅ Apache-2.0（1.2B 等） | 家族目标 720p/60；360p 档面向 RTX 30 系与 Apple Silicon；512 帧上下文 | 起始图/视频 + 键鼠；本地 Biome 运行时 + 网页流 | ❌ | 【官方】[HF 卡](https://huggingface.co/Overworld/Waypoint-1.5-1B)、[博客](https://over.world/blog/waypoint-1-5)（2026-04-09） |
| **HY-World 1.5 / WorldPlay** | 腾讯 | ✅ 5B/8B 权重+训练代码 | **24 FPS、480P** 流式交互；AR 蒸馏模型显存 28–72GB | 键鼠动作 + 重建上下文记忆；WorldCompass RL 后训练 | ❌ | 【官方】[repo](https://github.com/Tencent-Hunyuan/HY-WorldPlay)、[arXiv 2512.14614](https://arxiv.org/abs/2512.14614) |
| **Hy-Nomas** | 腾讯 | ✅ **Apache-2.0** | 单张 RTX 4090 低显存可跑；多轮文本 + 相机；社区报告 TPU v6e-4 上 720p 实时（0.933s 计算/秒视频）【三方】 | 自由形态多轮编辑 | ❌ | 【官方】[repo](https://github.com/Tencent-Hunyuan/HY-Nomas)（2026-10-21）；【三方】repo 内 Community 段 |
| Hunyuan-GameCraft | 腾讯 | ✅ 社区许可 | 25 FPS 生成 704×1216；最低 24GB、推荐 80GB | 键鼠统一到相机空间 + 混合历史条件 | ❌ | 【官方】[repo](https://github.com/Tencent-Hunyuan/Hunyuan-GameCraft-1.0)、[arXiv 2506.17201](https://arxiv.org/abs/2506.17201) |
| **Solaris**（多人世界模型） | 学术 | 论文 | Minecraft 多视角视频世界模型；1264 万帧多人数据 | 多智能体一致性评测 | ⚠️ 研究原型，非产品 | [arXiv 2602.22208](https://arxiv.org/abs/2602.22208)（2026-02-25） |
| **MASS** | 学术 | 论文 | "权威共享状态（Logic Engine）+ 按需渲染（Rendering Engine）" | 解耦世界动态与视角渲染 | ⚠️ 研究原型 | [arXiv 2608.06257](https://arxiv.org/abs/2608.06257)（2026-08-06） |
| **MultiGen** | 学术 | 论文 | 外部持久记忆（独立于上下文窗口）+ Memory/Observation/Dynamics 三模块 | 可编辑环境 + 共享推理 | ⚠️ 研究原型 | [arXiv 2603.06679](https://arxiv.org/abs/2603.06679)（2026-03-03） |

### 2.4 Agent 驱动构建

| 名称 | 年份 | 机制 | 对 choroweave 的意义 | 证据 |
|---|---|---|---|---|
| Voyager | 2023-05 | LLM 写 JS API 调用（Minecraft），技能库自增长，无梯度 | "LLM→可执行动作"的原型；约束=API 白名单 | [arXiv 2305.16291](https://arxiv.org/abs/2305.16291) |
| Project Sid | 2024-10 | 10–1000+ agent 在 Minecraft 分工/税收/宗教 | 大规模 agent 社会模拟，但环境是 Minecraft 而非生成世界 | [arXiv 2411.00114](https://arxiv.org/abs/2411.00114) |
| Generative Agents | 2023-04 | 记忆流 + 反思 + 计划 | NPC 行为建模基线；不产出可玩几何/玩法 | [arXiv 2304.03442](https://arxiv.org/abs/2304.03442) |
| NVIDIA ACE（2026） | 2026 | **开源 C/C++ Game Agent SDK + UE5 插件**；端侧 ASR/SLM/TTS；Agent/Chat/RAG 三 API；Qwen 3.5 4B；PUBG Ally、Total War: PHARAOH（RAG 1200+ 数据表） | 端侧 AI NPC 的事实标准路线：低延迟、可离线、RAG 接地 | 【官方】[NVIDIA 技术博客](https://developer.nvidia.com/blog/build-on-device-ai-companions-with-the-nvidia-ace-game-agent-sdk-and-unreal-engine-5-plugins/) |
| Inworld（2026） | 2026 | 已明显转向 **TTS/STT/语音到语音 + 推理 API**（按字符/token 计费，含商用许可） | 网站主叙事已从"AI NPC 角色引擎"转为语音/推理；choroweave 若做语音 NPC 可直接买（此为【推断】，来自官网导航与定价页结构） | 【官方】[Inworld 定价](https://inworld.ai/pricing) |
| Convai | 2026 | 会话式 NPC 平台（API/SDK） | 同上，闭源平台 | 【官方】[文档](https://docs.convai.com/api-docs) |
| Rosebud + Reactor | 2026-08 | 代码/资产/机制由 Rosebud 生成；视觉用 LingBot World 2 实时视频（约 16 FPS、亚秒延迟），玩法叠在其上 | **"视频世界模型当视觉层、游戏逻辑另跑"的商用样本** | 【三方】[Rosebud 博客](https://lab.rosebud.ai/blog/rosebud-reactor-video-world-models) |
| Astrocade | 2026-05 | 消费级"一句话做游戏"平台；8 个月 2000 万用户、$56M 融资 | 验证需求侧，不代表可玩深度 | 【官方】[Astrocade 博客](https://www.astrocade.com/blog/astrocade-raises-56m-funding) |
| Bitmagic GDK | 2026-08-27 | 面向 coding agent 的游戏开发套件：TS 引擎源码 vendored、物理/角色/载具/网络、`bitmagic dev` 热重载、**`bitmagic verify` 真浏览器试玩+截图回传**、一键托管 | 2026 年"验证-修复循环"的最佳工程样板 | 【官方】[Bitmagic GDK](https://bitmagic.ai/news/bitmagic-gdk/) |
| Roblox Cube 4D | 2026-02-04 | schema 拆件（Car-5 等）+ **脚本按生成尺寸重定向**；早期访问生成 16 万物体；开发者称 4D 玩家时长 +64% | "部件 schema + 行为重定向"是让生成物可玩的关键 | 【官方】[Roblox 新闻室](https://about.roblox.com/newsroom/2026/02/accelerating-creation-powered-roblox-cube-foundation-model) |
| UEFN MCP | 2026（官方文档） | 编辑器内嵌 MCP server：Verse 读写/编译、Scene Graph 实体、Creative 设备、启动试玩会话、Verse 文件沙盒 | 官方把"编辑器"变成 agent 可操作工具集；Verse 文件沙箱是安全边界 | 【官方】[UEFN MCP 文档](https://dev.epicgames.com/documentation/fortnite/uefn-mcp) |
| CEGame-Bench | 2026-10-19 | 五引擎完整游戏基准：平均 295 步/65M tokens；**通关率 16%** | 量化"artifact→playable gap" | [arXiv 2610.26098](https://arxiv.org/abs/2610.26098) |
| A2Z GameSpec-Bench | 2026-09-30 | 100 份长 GDD、依赖感知契约、逐条需求保真度 | 评测"意图保真"而非"能编译" | [arXiv 2609.39564](https://arxiv.org/abs/2609.39564) |

### 2.5 3DGS / 神经渲染

| 名称 | 类型 | 关键数字 | 对用户空间的价值/代价 | 证据 |
|---|---|---|---|---|
| 3D Gaussian Splatting | 表示 | 实时可微渲染 | 照片级真实、无需重光照；但**无碰撞、无 PBR 光照交互、透明排序伪影** | 【官方】Kerbl et al., SIGGRAPH 2023 |
| SPZ（Niantic） | 压缩格式 | 比 PLY 小约 10×；SPZ 4：6 路并行 ZSTD、编码快约 3×、加载快 1.5–2×、支持 3400 万点 | Web/移动端分发首选 | 【官方】[SPZ 4 博客](https://nianticspatial.com/blog/spz4) |
| SOG（PlayCanvas） | 压缩格式 | zip（meta.json + WebP）；支持 Streamed SOG（`lod-meta.json` + 分块） | 浏览器流式 LOD；SuperSplat 可编辑可导出 | 【官方】[SuperSplat 格式文档](https://developer.playcanvas.com/user-manual/supersplat/editor/import-export/) |
| Spark（World Labs） | 渲染器 | **MIT**，Three.js 3DGS 渲染器；Spark 2.0（2026-04）加 LOD 流式 | choroweave Web 端可直接用 | 【官方】[repo](https://github.com/sparkjsdev/spark) |
| Marble 资产规格 | 商用管线 | 2M splats SPZ（体积按 SPZ≈PLY/10 推算为数十 MB 量级，未实测）、碰撞网格 10–20 万面、视觉网格 60 万面 | "splat 视觉层 + mesh 碰撞层"双资产是标准做法 | 【官方】[导出规格](https://docs.worldlabs.ai/marble/export/specs) |

---

## 3. 逐项分析

### 3.1 3D 资产：2025-12 之后的分水岭

**三个梯队已经很清楚。**

- **第一梯队（质量 + 许可都能上生产）**：TRELLIS.2、Pixal3D。TRELLIS.2 的 4B 模型把"高分辨率 + 任意拓扑 + PBR"放进 MIT 许可，且训练代码全开；1024³ 17 秒意味着**单卡一天可生成约 5000 个 1024³ 资产**（按 24h 连续、含排队保守打 5 折也有 2500 个）。Pixal3D 走"像素反投影"路线，任务书里"从参考图精确重建"的场景应优先用它（SIGGRAPH 2026，MIT）。【官方】[TRELLIS.2](https://github.com/microsoft/TRELLIS.2)、[Pixal3D](https://huggingface.co/TencentARC/Pixal3D)
- **第二梯队（可用但许可有硬约束）**：Hunyuan3D 2.1 / Omni / Part。Omni 的 bbox/骨架/点云控制对"按布局精确摆放"极有价值，但**开源许可把欧盟、英国、韩国整块排除**，且 1M MAU 触发重新授权。对 choroweave 这种"个人服务器联邦、全球用户"的项目，这等于不能作为默认模型，只能作为"非上述地区可选插件"。【官方】[LICENSE](https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1/blob/main/LICENSE)
- **第三梯队（云端/闭源）**：Hunyuan3D 3.x、Meshy、Rodin。它们提供开源栈缺失的后处理（重拓扑、UV、自动绑定、动画、8K PBR），适合"英雄资产"与人工兜底环节，不适合做规模化的默认路径。

**质量与失败模式（工程上最要命的部分）：**

1. **拓扑与 UV 不可直接用于动画**。所有 image-to-3D 输出都是"视觉正确"优先：三角面密度不均、UV 岛碎、接缝处 texel density 不一致。Meshy 把"重拓扑/UV/绑定"做成独立计费 API（UV Unwrap 5 credits、Rigging 5、每动作动画 3）恰好证明这是行业公认的缺口。【官方】[Meshy 定价](https://docs.meshy.ai/en/api/pricing)
2. **可绑定性必须靠"部件化生成"而非整体 mesh**。Roblox CubePart 按 schema 出多块 mesh、Roblox 4D 再用"脚本重定向"适配生成尺寸；UniRig 用统一模型做骨架绑定（2025-04）。二者组合才是"生成→可动"的现实路径。纯整体 mesh + 自动绑定在 2026 年仍是高风险环节。【官方】[CubePart](https://huggingface.co/Roblox/cubepart)、[UniRig arXiv 2504.12451](https://arxiv.org/abs/2504.12451)
3. **水密 ≠ 可玩**。HY3D-Bench 强调"watertight、cleaned、part-level"——说明社区已经意识到数据侧的拓扑质量是瓶颈；但游戏可用还要求碰撞凸包、法线朝向、尺度归一、材质通道可导入引擎，生成模型不保证任何一项。【官方】[HY3D-Bench](https://github.com/Tencent-Hunyuan/HY3D-Bench)
4. **PBR 通道是"看起来对"而非"物理对"**。TRELLIS.2 与 Hunyuan3D 2.1 都能出 base/rough/metal，但**金属/粗糙度缺乏能量守恒校验**，在写实光照下容易"塑料感"。若 choroweave 要求照片级，最终要过一遍材质重打光（人工或 IBL 工具）。

**结论**：资产层已经"够用"，但**"生成即入库"不成立**；必须建"生成 → 质检 → LOD/碰撞/UV 修复 → 入库"的工业化流水线，且质检要自动化（面数、非流形边、UV 重叠、贴图分辨率、AABB 尺度）。

### 3.2 场景/布局：端到端生成还打不过"受约束的程序化 + kitbash"

- **纯 LLM 布局（LayoutGPT 系）**的硬伤是**没有几何可行性保证**：LLM 输出的是语义摆放，墙/门/通道/碰撞要另做求解器。
- **程序化（ProcTHOR/Infinigen）**可控、可复现、免费，但资产风格受限、渲染慢（Infinigen 以 CPU Blender 为主）。
- **2026 年真正能落地的是混合式**：
  `LLM 产出结构化 Space Spec（房间/风格/交互/预算）` → `约束求解器 + 规则生成地形/建筑` → `从资产库 kitbash` → `用生成模型补"特色资产/破旧感/装饰"` → `自动碰撞与导航网格`。
- **HY-World 2.0 提供了"端到端世界"的一条新路**：HY-Pano 2.0（约 80B）出全景 → WorldNav 规划轨迹 → WorldStereo 2.0（约 17B）扩成 3DGS → WorldMirror 2.0（约 1.2B）做多视图重建/合成。它证明"文→可导入引擎的 3D 世界"开源可行，但算力门槛高（80B 全景模型，官方 README 未给显存/时长，**推断需要 8×80GB 级多卡**），且**输出偏"看"而非"玩"**：没有玩法逻辑、没有网络同步、没有语义交互。【官方】[HY-World 2.0](https://github.com/Tencent-Hunyuan/HY-World-2.0)
- **真实空间复刻**应走 SpatialLM：手机视频 → MASt3R-SLAM 点云 → SpatialLM 输出墙体/门窗/朝向包围盒 → 在引擎里重建。这条"扫描→结构化→重装修"的链路比纯生成稳定得多。【官方】[SpatialLM](https://github.com/manycore-research/SpatialLM)

**工程取舍**：`端到端生成`负责"氛围与视觉惊喜"，`程序化 + kitbash` 负责"结构、碰撞、可玩性、可编辑性"。**不要把可玩空间的地基交给生成模型。**

### 3.3 世界模型：2026 年只能做"视觉层 / 预生成"，不能做"运行时"

证据链非常硬：

1. **Google 自己写的限制**（Genie 4 官方页面）：连续交互"a few minutes"；"accurately modeling complex interactions between users, multiple independent agents, and shared environments is an ongoing research challenge"；细节/物体永久性会漂移；文本渲染不可靠；音频精度仍在研究。【官方】[Genie 4](https://deepmind.google/models/genie/)
2. **Project Genie 的产品参数**：60 秒会话、720p、20–24 FPS、仅美国 AI Ultra 订阅者。这是一个"体验 demo"，不是"空间托管服务"。【三方】[9to5Google](https://9to5google.com/2026/01/29/google-project-genie/)
3. **实时世界模型的形态是"视频流"**：Runway GWM Worlds 2（720p/24fps/48kHz、无限时长、WorldPrompt 事件流）、Waypoint-1.5（720p/60 目标、本地消费卡）、HY-World 1.5（480p/24fps）。它们都**没有可查询的世界状态**——你无法问"302 房间现在有几个人"。【官方】[Runway](https://runway.com/research/introducing-gwm-worlds-2)、[Overworld](https://over.world/blog/waypoint-1-5)、[WorldPlay](https://github.com/Tencent-Hunyuan/HY-WorldPlay)
4. **唯一的正确架构已经被产品验证**：Matrix-Game 4.0 把"玩法/物理/输入"放引擎，"画面"放因果视频模型，67 FPS@864×480；Rosebud 用同一思路把 LingBot World 2 当视觉层。**世界模型越强，越应该被塞进渲染管线的末端，而不是状态机的中心。**【官方】[Matrix-Game](https://github.com/SkyworkAI/Matrix-Game)、【三方】[Rosebud](https://lab.rosebud.ai/blog/rosebud-reactor-video-world-models)
5. **多人世界模型只有学术原型**：Solaris（多视角、1264 万帧）、MASS（权威共享状态 + 解耦渲染）、MultiGen（外部持久记忆）。MASS 的摘要直接点出行业痛点："把世界状态与视角相关的视觉 latent 纠缠在一起"会导致算力冗余、视角不一致、扩展性差——这正是 choroweave 若用世界模型做权威状态会遇到的问题。**结论：2026-11 不能把世界模型当多人在线空间运行时；可以作为单机/预生成的视觉增强。**【官方】[MASS](https://arxiv.org/abs/2608.06257)、[Solaris](https://arxiv.org/abs/2602.22208)

**但有一条现实可用的中间路线**：用世界模型**预生成 3DGS/网格**（Marble、HY-World 2.0），再在传统引擎里做多人。这样既得到了"生成世界的观感"，又保留了权威状态、碰撞、网络同步。Marble 的导出规格（splat + 碰撞网格 + 视觉网格）就是为这条路设计的。

### 3.4 Agent 驱动构建：从"写代码"转向"操作工具集 + 验证循环"

**已被验证有效的模式：**

- **API 白名单 + 技能库**：Voyager 让 LLM 只能在给定 JS API 内组合动作。choroweave 的对应物是一个**空间/玩法 DSL**：LLM 只能产出 DSL AST，不直接写引擎代码。
- **Schema + 行为重定向**：Roblox 4D 的 Car-5 schema（body + 四个轮子）+ 按生成尺寸重定向脚本，是"生成物可玩"的最干净解法；CubePart 把 schema 变成开放词表。**choroweave 应把"可交互物体的部件契约"做成一级公民。**【官方】[Roblox](https://about.roblox.com/newsroom/2026/02/accelerating-creation-powered-roblox-cube-foundation-model)
- **工具集化的编辑器（MCP）**：UEFN MCP 把 Verse 读写/编译、场景图、设备、试玩会话暴露成 agent 工具，并明确 **Verse 文件沙盒**限制作用域。这是"LLM 操作宿主引擎"的安全范式；choroweave 的编辑器应原生提供同类 MCP 工具集，而不是让 agent 直接改文件。【官方】[UEFN MCP](https://dev.epicgames.com/documentation/fortnite/uefn-mcp)
- **验证-修复循环是刚需**：Bitmagic GDK 的 `bitmagic verify` 在真浏览器里试玩、截图、把错误丢回 agent；NVIDIA ACE 强调端侧低延迟 + RAG 接地 + 防止 NPC 死循环。**没有闭环验证的代码生成必然失败。**【官方】[Bitmagic](https://bitmagic.ai/news/bitmagic-gdk/)、[ACE](https://developer.nvidia.com/blog/build-on-device-ai-companions-with-the-nvidia-ace-game-agent-sdk-and-unreal-engine-5-plugins/)

**已被量化的失败模式：**

- CEGame-Bench：五引擎、平均 295 步/65M tokens、**通关率 16%**、玩法分不到一半；工程师+编码 agent 的参考实现接近满分 → **失败在长程整合，不在单文件编码**。
- A2Z GameSpec-Bench：用 100 份长 GDD 的"依赖感知契约"衡量**意图保真**，说明"能跑"与"符合设计"是两件事。
- 工程含义：choroweave 的 LLM 层应输出**可验证的中间表示**（Space Spec / 玩法 AST / 契约测试），而不是一次性生成完整工程。【官方】[CEGame-Bench](https://arxiv.org/abs/2610.26098)、[A2Z](https://arxiv.org/abs/2609.39564)

### 3.5 3DGS / 神经渲染：视觉层的"性价比之王"，但不是几何

- **价值**：照片级真实、无需 PBR 重打光、浏览器可跑（Spark/SuperSplat）、压缩后体积可接受（SPZ 比 PLY 小约 10×，Marble 2M splats 的 SPZ 是数十 MB 量级）。
- **代价**：无碰撞（必须配 collider mesh）、无动态光照、透明/排序伪影、编辑困难（改一堵墙要重生成区域）、**资产是"烤死"的观感**。
- **2026 年的成熟度**：SPZ 4 支持数千万点、并行编解码；SOG 支持流式 LOD；Marble 把"SPZ + collider GLB + visual GLB"三件套标准化。**对 choroweave：把 3DGS 作为"观感层/背景层"，把 mesh 作为"交互层"，两套资产同时存在**，这与 Marble 的导出设计一致。【官方】[SPZ 4](https://nianticspatial.com/blog/spz4)、[Marble 规格](https://docs.worldlabs.ai/marble/export/specs)

---

## 4. 对 choroweave 的启示

### 4.1 推荐管线（2026-11 可落地版）

```
意图（自然语言 / tacitweave 偏好）
  │
  ├─[1] 意图编译：LLM → Space Spec（Spatial-DSL 的意图层，JSON Schema）
  │      房间/地形、风格、光照、交互点、传送门、预算、成人/儿童分级
  │      产物必须通过 schema 校验 + 可达性/预算静态检查
  │
  ├─[2] 布局求解：确定性程序化（建筑/地形/道路）+ 约束求解
  │      LLM 只提供"语义约束"，不画坐标
  │      产出：glTF 场景骨架 + 导航网格 + 碰撞体 + 语义标签
  │
  ├─[3] 资产：分层
  │      a. 特色资产：TRELLIS.2（MIT，主）/ Pixal3D（参考图精确重建）
  │      b. 受控摆放资产：Hunyuan3D-Omni（bbox/pose，限非 EU/UK/KR 部署）
  │      c. 部件化可交互资产：Roblox CubePart 思路自建 schema（或直接用其 openrail 权重）
  │      d. 英雄资产/后处理：Meshy / Rodin API（重拓扑、UV、自动绑定、动画）
  │
  ├─[4] 装配：自动碰撞凸包 + LOD + 材质烘焙 + 尺度归一 + 资产库实例化
  │      每件资产必须过"质检门"（面数/非流形/UV 重叠/贴图/包围盒）
  │
  ├─[5] 玩法：LLM → Spatial-DSL（行为图/规则 AST）→ 确定性装配
  │      L0 = KHR_interactivity 行为图（默认，可校验可移植）
  │      L1 = 精选联网模块（参数化）；L2 = 能力沙箱 WASM（P3+）
  │      契约测试 + headless playtest bot（参考 Bitmagic verify / CEGame-Bench 的评测方式）
  │
  ├─[6] 视觉增强（可选）：Marble / HY-World 2.0 预生成 3DGS 背景层
  │      或 Matrix-Game 4.0 式"引擎低模 → 神经渲染"实时视觉层（研究性）
  │
  └─[7] 运行时：Babylon.js 8.x 参考运行时（ADR-04；three.js 仅 view-only）
         + 权威房间服状态 + CHW_portal 传送门/兴趣管理；世界模型不参与状态机
```

### 4.2 每空间成本与耗时（工程估算，标注假设）

假设：H100 按 $2–3/小时（市场价，**未逐一核实**）；资产 1024³、每个 World Bundle 40–120 个特色资产；布局用 LLM 工具循环 20–50 次调用。

| 档位 | 内容 | 生成 GPU 时间 | API 费用 | 总耗时 | 人工兜底 |
|---|---|---|---|---|---|
| **Draft**（可走可看） | 布局 + 20–40 个 512³ 资产 + 无 PBR 修复 + Marble Draft | 约 3–6 GPU·分钟 | ≈$0.2–0.6 | 5–10 分钟 | 无 |
| **Standard**（可玩） | 布局 + 60–120 个 1024³ 资产 + 碰撞/LOD + 轻量 3DGS 背景 | 约 30–60 GPU·分钟 | ≈$2–6 | 20–40 分钟 | 抽检 10–20% 资产 |
| **Hero**（对外展示） | 上述 + 英雄资产 Rodin/Meshy + HQ 网格 + 手工重拓扑/绑定 | 2–6 GPU·小时 | ≈$10–30 | 2–6 小时 | 必须：美术修复、绑定、灯光 |

运行时（多人）：以 Web 引擎为基础，单空间 50–100 CCU 的服务器成本**推算** $5–20/月（普通 CPU 云主机 + 状态同步；不含世界模型推理）。若叠加实时神经渲染，每会话至少需要一张消费级 GPU（Matrix-Game 4.0 在 5080 上 67 FPS），**成本量级直接上一个数量级**。

### 4.3 明确建议：用什么 / 不用什么

**用：**
- **TRELLIS.2** 作为默认资产模型（MIT、质量、速度、PBR、训练代码可微调）。
- **Pixal3D** 做"用户参考图 → 空间内精确复刻"。
- **SpatialLM** 做"实景扫描 → 结构化布局"。
- **Marble API** 做预生成 3DGS 背景层（成本可预测、导出规格清晰），**只买"环境"，不买"世界"**。
- **HY-World 2.0 权重**做自托管世界生成的研究/备份路线，但注意其许可是 **Tencent HY-WORLD 2.0 Community License**（EU/UK/KR 排除 + 1M MAU 条款），与 Hunyuan3D 2.1 同一套地域逻辑，**不能作为全球产品默认**。
- **Roblox CubePart / Hunyuan3D-Part** 作为部件化资产契约的参考实现。
- **NVIDIA ACE（端侧）或 Inworld（云 TTS）** 做 NPC 语音；**Bitmagic verify 式浏览器试玩闭环** 做玩法验证。
- **Spark + SPZ/SOG** 做 Web 端 splat 渲染与流式加载，但只作为 P3 视觉层（Spark 基于 three.js，不进 Babylon 主运行时）。

**不用 / 不作为默认：**
- ❌ **世界模型当运行时/状态权威**（Genie 4 官方限制 + MASS/MultiGen 仍是论文）。
- ❌ **Hunyuan3D 开源权重做全球产品**（EU/UK/KR 排除 + 1M MAU 条款）。
- ❌ **文本→3D 直接产出可绑定角色**：必须走部件化 + 重拓扑/绑定，或直接买 Meshy/Rodin 的绑定 API。
- ❌ **让 LLM 直接生成引擎工程代码上线**（CEGame-Bench 16% 通关率）。
- ❌ **单一 3DGS 几何**（无碰撞、无光照交互）。
- ❌ **把 Hunyuan3D 3.x / Meshy / Rodin 当规模路径**：它们是"英雄资产与后处理"工具，单价和吞吐都不适合每空间上百件。

### 4.4 对"空间超链接/传送门"的直接影响

- **传送门需要"可寻址的权威状态"**，而所有 2026 年的世界模型都不提供。choroweave 的传送门应建立在**引擎侧场景 ID + 资产哈希 + 状态服务**上，splat/视频只做表现。
- **跨服务器互访要求资产格式统一**：glTF 2.0 + KHR 扩展 + SPZ/SOG 是当前唯一同时被 Blender/Unity/Unreal/Three.js 接受的组合。Marble、HY-World 2.0、TRELLIS.2 都能导出 GLB，说明这条路是通的。
- **许可必须按"部署地域"分流**：同一空间在不同地区的个人服务器上，可能必须换用不同资产模型（TRELLIS.2 vs Hunyuan）。这应写进 Space Spec 的元数据，而不是运行期才发现。

---

## 5. 风险与未知

### 5.1 高置信风险

1. **许可地缘风险**：Tencent Hunyuan 系列（3D 2.1/Omni/Part、HY-World 2.0、World 1.0、WorldPlay）许可明确排除 EU/UK/KR，且带 1M MAU 重新授权条款（HY-WORLD 2.0 许可发布日期 2026-04-15）。任何"联邦式个人服务器"都可能落在排除区。**开源权重 ≠ 可自由商用**，必须在选型表里按许可证打标。
2. **供应商锁定**：Marble、Meshy、Rodin、Runway 都是闭源 API。Marble 的母公司 World Labs 已于 2026-09-28 被 AMD 以约 82 亿美元全股票收购（预计 2026 年底完成，待监管批准）——**API 路线、定价与导出条款都存在变更风险**。【三方】[Quartz/Yahoo](https://finance.yahoo.com/technology/ai/articles/amd-acquires-fei-fei-lis-121544620.html)（2026-09-29）、[Yahoo AI 分析](https://finance.yahoo.com/technology/ai/articles/amd-just-bought-research-defines-174221101.html)（2026-10-01）
3. **世界模型迭代速度 > 工程沉淀速度**：Genie 3 → 4 只用 14 个月（60s → 2min、加音频）。把架构押在"世界模型将来会解决多人"上是赌博；押在"引擎 + 可插拔视觉层"上则风险可控。
4. **评测缺口**：截至 2026-11，没有公开的"意图 → 可玩空间"端到端基准。CEGame-Bench 评测的是完整游戏工程，A2Z 评测 GDD 保真度，**都不覆盖"空间体验/社交性"**。choroweave 需要自建评测（可达性、交互覆盖率、意图保真度、多人一致性、生成稳定性）。
5. **训练数据版权**：Objaverse/Objaverse-XL 系训练集（TRELLIS.2 明确用 Objaverse-XL）的资产许可混杂，商用输出可能继承上游风险；这一点各家模型卡均未充分披露，**属于行业性未解问题**。

### 5.2 待核实 / 存疑清单

| 事项 | 状态 |
|---|---|
| Sparc3D 是否公开代码/权重 | **部分核实**：官方仓库存在（https://github.com/lizhihao6/Sparc3D），但 README 只给论文与 Space demo、无 LICENSE 文件、未说明权重下载；按"代码未完整释放"处理 |
| Hunyuan3D 2.5 是否存在开源版本 | **未核实**：HF 官方组织下只有 2.0/2.1/2mini/2mv；2.5 仅见于第三方版本叙述 |
| Inworld 的产品重心是否已从"NPC 引擎"转向语音/推理 | **推断**：依据官网导航与定价页结构（TTS/STT/STS/LLM Inference 为主），未获官方确认 |
| Marble 2M splats 的 SPZ 实际体积 | **推断**：按 SPZ 约为 PLY 1/10 的量级推算为数十 MB，未下载样本实测 |
| WorldClaw 等 2026 新论文的代码释放 | **未核实**：目前只有论文与项目页 |
| AMD 收购 World Labs 的监管结果 | **未定**：2026-09-28 宣布，预计 2026 年底完成；已获第二家媒体（Quartz/Yahoo，2026-09-29）交叉确认 |
| "Project Genie 60 秒限制"是否会在 2027 放宽 | **未知**（官方称在改进 promptable events） |
| 各模型在"游戏可用拓扑"上的定量指标 | **缺失**：没有公开的 retopo 质量/绑定成功率基准 |
| H100 实际租用价格（成本模型输入） | **未逐一核实**：本文按 $2–3/小时市场区间估算 |

### 5.3 需要 choroweave 团队决策的开放问题

1. 首发是否**必须**支持 EU/UK/KR 用户？若必须，默认资产模型只能是 TRELLIS.2 / Pixal3D / TripoSG 系，Hunyuan 只做区域可选。
2. 是否接受"两套资产"（splat 视觉 + mesh 交互）带来的存储/带宽翻倍？
3. 玩法 DSL 的表达力边界：只做"触发器 + 状态机 + 对话"，还是允许玩家写 WASM 脚本？
4. 生成质量的人工兜底预算：每空间允许多少分钟人工？这直接决定 Standard 档能否成立。

---

## 6. 来源列表

### 3D 资产 / 数据

1. TRELLIS.2 官方仓库与 README（MIT、4B、H100 时延表）— https://github.com/microsoft/TRELLIS.2 ｜ arXiv 2512.14692 ｜ 2025-12
2. TRELLIS 1 官方仓库（MIT、16GB）— https://github.com/microsoft/TRELLIS ｜ arXiv 2412.01506
3. Hunyuan3D-2.1 官方仓库（10/21/29GB、PBR、许可）— https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1 ｜ 2025-06-13
4. Tencent Hunyuan 3D 2.1 Community License（EU/UK/KR 排除、1M MAU）— https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1/blob/main/LICENSE
5. Hunyuan3D-Omni 官方仓库（3.3B、10GB、四种控制）— https://github.com/Tencent-Hunyuan/Hunyuan3D-Omni ｜ arXiv 2509.21245 ｜ 2025-09-25
6. Hunyuan3D-Part 官方仓库与许可（2025-09-23）— https://github.com/Tencent-Hunyuan/Hunyuan3D-Part
7. Tencent Cloud：Hunyuan 3D 3.0（1.5M 面、8K PBR、3.5 约 60s）— https://www.tencentcloud.com/techpedia/148305?lang=en ｜ 2026-09-01
8. Hunyuan3D-Buffalo 1.0（仅论文）— https://github.com/Tencent-Hunyuan/Hunyuan3D-Buffalo1.0 ｜ arXiv 2608.02711 ｜ 2026-08
9. TripoSR 官方仓库（MIT、6GB、<0.5s）— https://github.com/VAST-AI-Research/TripoSR ｜ arXiv 2403.02151
10. TripoSG 官方仓库与 HF 卡（MIT、8GB）— https://github.com/VAST-AI-Research/TripoSG ｜ https://huggingface.co/VAST-AI/TripoSG ｜ arXiv 2502.06608 ｜ 2025-02
11. Stable Fast 3D 官方仓库（6GB）与 Stability AI Community License（<$1M 年收入免费商用）— https://github.com/Stability-AI/stable-fast-3d ｜ https://huggingface.co/spaces/stabilityai/stable-fast-3d/blob/main/LICENSE.md ｜ arXiv 2408.00653
12. Pixal3D HF 卡（MIT、SIGGRAPH 2026、EU gating 元数据）— https://huggingface.co/TencentARC/Pixal3D ｜ arXiv 2605.10922
13. Sparc3D 论文与官方仓库（代码/权重释放情况见 §5.2）— https://arxiv.org/abs/2505.14521 ｜ https://github.com/lizhihao6/Sparc3D
14. Meshy API 定价（credits、绑定、UV、动画）— https://docs.meshy.ai/en/api/pricing ｜ 2026-11 访问
15. Rodin / Hyper3D 与 Hunyuan3D 对比（第三方，读官方页后整理）— https://triposr.org/blog/rodin-vs-hunyuan3d ｜ 2026-10-08
16. Roblox Cube 官方仓库（Cube 3D v0.5、CubePart）— https://github.com/Roblox/cube ｜ HF: https://huggingface.co/Roblox/cube3d-v0.5 ｜ https://huggingface.co/Roblox/cubepart ｜ arXiv 2605.28763
17. HY3D-Bench（25.2 万/24 万/12.5 万）— https://github.com/Tencent-Hunyuan/HY3D-Bench ｜ arXiv 2602.03907 ｜ 2026-02-04
18. UniRig（统一骨架绑定）— https://arxiv.org/abs/2504.12451 ｜ 2025-04

### 场景 / 布局

19. LayoutGPT — https://arxiv.org/abs/2305.15393 ｜ 2023-05
20. SceneCraft（LLM agent 写 Blender 代码）— https://arxiv.org/abs/2403.01248 ｜ 2024-03
21. Holodeck — https://arxiv.org/abs/2312.09067 ｜ 2023-12；Holodeck 2.0 — https://arxiv.org/abs/2508.05899 ｜ 2025-08
22. ProcTHOR — https://arxiv.org/abs/2206.06994 ｜ 2022-06
23. Infinigen — https://arxiv.org/abs/2306.09310 ｜ 2023-06；Infinigen Indoors — https://arxiv.org/abs/2406.11824 ｜ 2024-06
24. SpatialLM 官方仓库与论文 — https://github.com/manycore-research/SpatialLM ｜ https://arxiv.org/abs/2506.07491 ｜ NeurIPS 2025
25. HY-World 2.0 官方仓库 — https://github.com/Tencent-Hunyuan/HY-World-2.0 ｜ arXiv 2604.14268 ｜ 2026-04-16 ｜ 许可：Tencent HY-WORLD 2.0 Community License（2026-04-15，EU/UK/KR 排除 + 1M MAU）— https://huggingface.co/apozz/hy-worldmirror-2-bf16/blob/main/LICENSE
26. WorldClaw（仅论文）— https://arxiv.org/abs/2608.05248 ｜ 2026-08
27. SceneDiffuser / SceneDiffuser++（澄清：交通仿真）— https://arxiv.org/abs/2412.12129 ｜ https://arxiv.org/abs/2506.21976

### 世界模型

28. Genie 3 官方博客 — https://deepmind.google/blog/genie-3-a-new-frontier-for-world-models/ ｜ 2025-08-05
29. Genie 4 官方模型页（含 Limitations）— https://deepmind.google/models/genie/ ｜ 2026-10
30. Project Genie 上线（60s、720p、20–24fps、美国 AI Ultra）— https://9to5google.com/2026/01/29/google-project-genie/ ｜ 2026-01-29
31. Genie 4 预览报道（2 分钟一致性、音频、free-form 编辑、进 Project Genie）— https://techcrunch.com/2026/10/27/googles-genie-4-world-model-adds-audio-more-realistic-worlds-and-real-time-steering/ ｜ 2026-10-27；另见 https://dataconomy.com/2026/10/28/google-deepmind-previews-genie-4-world-model/
32. Marble 模型与定价 — https://docs.worldlabs.ai/marble/models ｜ 2026-04-03 更新
33. Marble 导出规格（splat/碰撞/网格/全景）— https://docs.worldlabs.ai/marble/export/specs ｜ 2026-05-21 更新
34. Marble 综述（GA 2025-11-12、API 2026-01、1.1 2026-04、Spark 2.0）— https://invideo.io/blog/world-labs-marble-3d-worlds/ ｜ 2026-08-06
35. AMD 收购 World Labs（$8.2B 全股票，2026-09-28 宣布，预计 2026 年底完成）— https://finance.yahoo.com/technology/ai/articles/amd-acquires-fei-fei-lis-121544620.html ｜ 2026-09-29；分析文 https://finance.yahoo.com/technology/ai/articles/amd-just-bought-research-defines-174221101.html ｜ 2026-10-01
36. Decart 官网（Oasis 3、Lucy 2.5/2.6、DOS 2.0、$300M）— https://decart.ai/ ｜ 2026-11 访问
37. Runway GWM Worlds 2（720p/24fps/48kHz、WorldPrompt）— https://runway.com/research/introducing-gwm-worlds-2 ｜ 2026-09-03
38. Matrix-Game 官方仓库（2.0/3.0/4.0、67 FPS）— https://github.com/SkyworkAI/Matrix-Game ｜ HF: https://huggingface.co/Skywork/Matrix-Game-2.0 ｜ https://huggingface.co/Skywork/Matrix-Game-4.0 ｜ arXiv 2508.13009、2610.27999
39. Waypoint-1.5 官方博客与模型卡（Apache-2.0、1.2B、720p/60 目标）— https://over.world/blog/waypoint-1-5 ｜ https://huggingface.co/Overworld/Waypoint-1.5-1B ｜ 2026-04-09
40. HY-World 1.5 / WorldPlay（24 FPS、480P、28–72GB）— https://github.com/Tencent-Hunyuan/HY-WorldPlay ｜ arXiv 2512.14614 ｜ 2025-12-17
41. Hy-Nomas（Apache-2.0、单 4090、多轮文本+相机）— https://github.com/Tencent-Hunyuan/HY-Nomas ｜ arXiv 2610.36729 ｜ 2026-10-21
42. Hunyuan-GameCraft（24GB 最低/80GB 推荐、25FPS）— https://github.com/Tencent-Hunyuan/Hunyuan-GameCraft-1.0 ｜ arXiv 2506.17201
43. Solaris（多人视频世界模型）— https://arxiv.org/abs/2602.22208 ｜ 2026-02-25
44. MASS（权威共享状态）— https://arxiv.org/abs/2608.06257 ｜ 2026-08-06
45. MultiGen（可编辑多人世界、外部记忆）— https://arxiv.org/abs/2603.06679 ｜ 2026-03-03
46. RAR（时间速率自适应 rollout）— https://arxiv.org/abs/2610.16302 ｜ 2026-10-12

### Agent / 玩法生成

47. Voyager — https://arxiv.org/abs/2305.16291 ｜ 2023-05
48. Project Sid — https://arxiv.org/abs/2411.00114 ｜ 2024-10-31
49. Generative Agents — https://arxiv.org/abs/2304.03442 ｜ 2023-04
50. NVIDIA ACE Game Agent SDK + UE5 插件 — https://developer.nvidia.com/blog/build-on-device-ai-companions-with-the-nvidia-ace-game-agent-sdk-and-unreal-engine-5-plugins/ ｜ 2026
51. Inworld 定价（语音/推理 API、商用许可）— https://inworld.ai/pricing ｜ 2026-11 访问
52. Convai 文档 — https://docs.convai.com/api-docs ｜ 2026-11 访问
53. Rosebud × Reactor（LingBot World 2、约 16 FPS、玩法在代码层）— https://lab.rosebud.ai/blog/rosebud-reactor-video-world-models ｜ 2026-08-31
54. Astrocade（$56M、8 个月 2000 万用户）— https://www.astrocade.com/blog/astrocade-raises-56m-funding ｜ 2026-05-05
55. Bitmagic GDK（coding agent 驱动、`bitmagic verify`）— https://bitmagic.ai/news/bitmagic-gdk/ ｜ 2026-08-27
56. Roblox Cube 介绍（2025-03-17，开源 Cube 3D）— https://about.roblox.com/newsroom/2025/03/introducing-roblox-cube
57. Roblox 4D 生成（schema、脚本重定向、16 万物体）— https://about.roblox.com/newsroom/2026/02/accelerating-creation-powered-roblox-cube-foundation-model ｜ 2026-02-04
58. UEFN MCP 官方文档（Verse/场景图/设备/试玩、文件沙盒）— https://dev.epicgames.com/documentation/fortnite/uefn-mcp
59. CEGame-Bench（五引擎、16% 通关率）— https://arxiv.org/abs/2610.26098 ｜ 2026-10-19
60. A2Z GameSpec-Bench（长 GDD 保真度）— https://arxiv.org/abs/2609.39564 ｜ 2026-09-30
61. V-GameGym（ACL 2026 Findings）— https://aclanthology.org/2026.findings-acl.276/
62. GamePhanes（Godot agent 环境与基准）— https://github.com/GamePhanesStudio/GamePhanes

### 3DGS / 渲染

63. SPZ 4（Niantic，并行 ZSTD、3400 万点）— https://nianticspatial.com/blog/spz4 ｜ 2026
64. PlayCanvas SuperSplat 格式文档（SPZ/SOG/流式 SOG）— https://developer.playcanvas.com/user-manual/supersplat/editor/import-export/ ｜ 2026-11 访问
65. Spark（MIT，Three.js 3DGS 渲染器）— https://github.com/sparkjsdev/spark
66. 3D Gaussian Splatting 原论文 — Kerbl et al., SIGGRAPH 2023

### 与 `docs/02-tech-selection.md` 的一致性

- 本文结论与 ADR-04（Babylon.js 8.x）、ADR-09（骨架优先 + TRELLIS.2 默认、Hunyuan3D 可选）、ADR-11（世界模型/3DGS 不作运行时、P3 评估）一致，未提出冲突选型。
- 术语统一使用：World Bundle / Spatial-DSL / 门户（Portal）/ 节点（Node）；逻辑分层 L0/L1/L2。
- 唯一补充建议：把「部件契约（parts schema）」提升为 Spatial-DSL 的一等字段，用于可交互道具与可绑定角色（依据 Roblox CubePart/4D 与 HY3D-Bench 的部件级证据）。

### 说明

- 本文共进行 **50+ 次检索/抓取**（`web_search`/`web_fetch` 与对官方 README、Hugging Face 模型卡、厂商文档的直接 HTTP 抓取），一手来源优先；第三方来源仅用于补充官方未披露的数字（如第三方实测、行业对比文）。
- 所有"未能核实"的条目已集中在 §5.2，未以推断冒充事实。本文中的成本/耗时表全部标注"工程估算"及其假设。
