# choroweave 调研 04：同类产品、市场信号、失败先例与社区生态

> **调研目的**：为 choroweave（"把自然语言意图编译为可漫游 / 可交互 / 多人共在的 3D 场景 + 空间超链接协议 + 个人服务器互联"）判断时机、形态优先级（VR-first vs Web-first）、必须先避开的失败模式、以及差异化楔子。
>
> **核实口径**：本文件所有"当前"数据均标注为「截至 2026-11 核实」。检索与抓取发生在 2026-11-07。
>
> **证据分级**（全文统一使用）：
> - **【官方】** = 公司 / 平台自身财报、股东信、官方博客、官方 X/公告、GitHub API 元数据。
> - **【第三方】** = 独立研究机构或数据商（IDC、Sensor Tower、Appfigures、Steam 硬件调查、Steam 并发追踪站、第三方研究博客），或经媒体完整转述且给出统计口径者。
> - **【媒体转述】** = 新闻媒体报道，原始出处可能不可核验（含 Bloomberg / CNBC / WSJ 被二手转述的情况）。
> - **【未能核实】** = 明确未能找到一手或可信二手来源，**不用于任何结论推导**。
>
> **重要方法论说明**：本报告刻意区分"用户规模"与"商业闭环"。2025–2026 年大量 3D 平台在用户规模创历史新高的同时收入下滑或关停（Roblox、Fortnite、Rec Room 均是），因此单一 MAU 数字不能作为时机判断依据。

---

## 1. TL;DR（10 条）

1. **"元宇宙已死"是伪命题，"通用 3D 社交空间"才是真死。** Roblox Q3'26 DAU 1.38 亿、季度时长近 340 亿小时【官方】；Minecraft MAU 1.55 亿（历史新高）【官方】；Fortnite 约 1.1–1.2 亿 MAU【第三方】。但同时 Rec Room（1.5 亿累计玩家、$3.5B 估值）2026-06-01 永久停服【官方】，Meta Horizon Worlds VR 版一度宣布关停【媒体转述】。**规模在，商业模式不在。**
2. **Rec Room 的死亡原因是"抽成结构"，不是"用户不够"。** 第一方道具平台留 ~70 美分/美元，UGC 道具留 ~30 美分/美元；UGC 收入同比 +70% 反而持续稀释毛利；付费用户占比 <2%【媒体转述官方数据】。UGC 越成功越亏损——这是"空间互联网"最容易踩的陷阱。
3. **VR 硬件在 2025 年是断崖，不是回暖。** IDC：2025 年头显总出货预计 **-42.8%**；Vision Pro 全年仅 4.5 万台（2024 年 39 万台）；Quest 前三季度 170 万台、同比 -16%【第三方 IDC，经 The Register 转述】。同期智能眼镜 +211.2%。**"VR-first"在 2026-11 没有任何数据支撑。**
4. **但纯 Web-first 也有尸检报告。** Mozilla Hubs（2018–2024-05-31）关停，累计 11.6 万头像 / 21.6 万场景 / ~1000 万人次【官方】；Third Room 最后一提交停在 2023-08【GitHub API】。**问题不在"Web"或"VR"，在"谁来付服务器钱"。**
5. **VRChat 证明了一条窄而硬的活路：小 MAU + 高 ARPU + 强社区 + 跨端。** MAU >100 万【第三方 Sensor Tower】、峰值同时在线 158,192【官方】、25 万+ 活跃社区【官方】、创作者分成最高 50%【官方】、2025-10 上线移动端并明说"不需要 VR 设备"【官方】。**它的 MAU 只是 Rec Room 累计玩家的零头（口径不同，仅作量级示意），但它还活着。**
6. **世界模型 ≠ 世界。** Roblox 在 2026-05 明确表态：独立的 world model "缺乏长期记忆、一致逻辑、以及大规模多人平台所需的结构化用户输入"，因此走 **Engine + Video Model 混合架构**（Roblox Reality，目标 4K@60，2026 年底–2027 初）【官方】。Marble 的输出是**要导入 Unreal/Unity/Blender 的资产包**（Gaussian splat + 碰撞网格），不是可运营的世界【第三方整理】。
7. **AI 生成游戏平台的真实状态：流量真实、变现为零、质量存疑。** Astrocade 8 个月 2000 万"参与用户"、5M MAU、月 1.4 亿次游玩、$56M 融资【官方 + 第三方 Naavik】，但**未公布任何虚拟货币 / 内购 / 订阅**，且被 Naavik 批评为"游戏 demo 的聚合体、操作笨拙、缺少进程深度"。发行延迟长达一周。
8. **空间超链接 / 开放空间架构已经有人在标准与学术侧占位。** Metaverse Standards Forum（MSF）2026 已提出 **"Web of Worlds（WoW）"** 议程——"pages become places, links become portals"，配套 **X3D 4.1 WoW Profile** 明确含 **Anchor（3D 超链接）** 与 **Inline（外部场景）** 节点，Threedy.io / Virginia Tech 在实现【标准组织】；ISMAR 2026 XWORLDS workshop 亦有《The Web of Worlds: Towards A Referential Architecture for Open Spatial Worlds》【学术】。**choroweave 的 SHP 必须映射到 WoW/X3D Anchor 语义，而不是另造一套语言。**
9. **开源元宇宙社区是"小工具链"，不是"大社区"。** Hyperfy 310★/117 fork/30 open issues（2024-12 建仓）【GitHub API】；OMI 329★、最后提交 2025-10；Third Room 656★ 但停滞 3 年；Hubs 社区版 2,223★ 但积压 1,224 个 issue。**"开源会自然带来生态"不成立；需要设计可计量的接入路径。**
10. **时机判断：Web-first + 桌面/移动渐进 + 可选 VR 进入，是唯一被数据支持的路径。** 2026 年新增变量是 Valve **Steam Frame**（2026-09-15 发布，SteamOS 独立头显，首发月即占 SteamVR 5.49%、排名第 5）【第三方 Steam 调查，经 moguravr 转述】——说明"PC 生态的开放头显"是一个正在打开的小窗口，但不是主战场。

---

## 2. 产品 / 项目清单表

### 2.1 虚拟社交 / 空间产品

| 名称 | 类型 | 规模数据（截至 2026-11 核实） | 与 choroweave 的关系 | 证据 |
|---|---|---|---|---|
| **Roblox** | UGC 游戏平台（跨端） | Q3'26 DAU **1.38 亿**（+12% QoQ）；季度时长近 **340 亿小时**（+17% QoQ）；收入 **$15.72 亿**（+15.6% YoY）；bookings **$17 亿**（-12% YoY）；Q3'26 净亏 $2.30 亿【官方】 | 最强"空间即平台"参照物；也是最大挤压者。其"Roblox Everywhere"（创作者可把 Roblox 游戏独立发行到任意应用商店）直接冲撞"开放分发"叙事 | 股东信 ex99.1；Q3'26 电话会 |
| **Fortnite / UEFN** | UGC 游戏平台 | 6.5 亿注册；MAU 约 1.1–1.2 亿（Q1'26）；2025 收入约 $60 亿（分析师共识）【第三方】；2026-03 裁员 >1000 人；UEFN 创作者累计分成 **$10 亿**（2023 起，Epic 2026-06-17 确认）；创作者岛屿占 **47%** 玩家时长（2026-05，去年 38%）【第三方 + 官方口径】 | 证明"UGC 内容可以吃掉平台一半以上时长"，但平台自身留存在下滑 | Axis Intelligence 2026-07 汇总；Epic 官方披露 |
| **Minecraft** | 沙盒世界（无中心世界图） | 累计销量 **4.25 亿**（Xbox CEO，2026-09-26）；MAU **1.55 亿**（微软 2025-10-29 财报电话会，历史新高）；无官方 DAU【官方】 | 反证"不需要超链接协议也能形成事实上的多世界网络"（服务器地址 = 事实标准），但用户体验粗糙 | Host Havoc 2026 汇总（转述微软高管） |
| **VRChat** | 社交 VR 平台 | MAU **>100 万**；峰值 CCU **158,192**（2026-02 日系虚拟演唱会）；日均 CCU ~10 万；25 万+ 活跃社区；创作者分成最高 50%；日本用户增长 3.9×；Steam 累计下载 >530 万【官方 + 第三方 Sensor Tower】 | 最接近"世界间传送门"的现存实践（World 链接 + Portal 道具），但世界托管在中心服务器 | 官方 X 数据（2026-05）；Sensor Tower 报告 |
| **Rec Room** | 社交 VR + UGC | 累计 **1.5 亿玩家**；融资 **$2.94 亿**，峰值估值 **$35 亿**；付费用户占比 **<2%**；**2026-06-01 永久停服**；Snap 同日收购部分资产【官方 + 媒体转述】 | **最重要的失败范例**：跨端降门槛 → 规模最大 → 单位经济最差 → 死亡 | Rec Room 官方公告；Hypergrid Business；VR陀螺 |
| **Resonite** | 社交 VR / 创作 | Steam 当前 136 人、30 日均 155、30 日峰值 298【第三方】 | 技术理想主义路线（NeosVR 继任者）的天花板样本 | live-player-count.com |
| **Second Life** | 虚拟世界 | 2026 年官方 MAU **未能核实**（Linden Lab 不公开）；平台仍在运营 | "个人土地 + 传送"的原始范式；证明长期存活的可能，也证明其增长上限 | — |
| **Spatial** | 3D 空间 / 画廊 | 创作者平台（Free/Pro）**2025-07-27 终止**，世界托管关闭、资产删除；仅保留企业客户；CEO 明言"开放多人 3D 世界的托管与扩容成本持续上升，找不到可持续模型"【官方声明，经 UploadVR 转述】 | **直接命中 choroweave 的核心风险**：托管成本 | UploadVR |
| **Oncyber** | Web3 虚拟画廊 | 2026 年最新状态**未能核实**；2022–2023 曾为 Web3 空间展示头部 | 展示型空间的商业化天花板 | — |
| **Decentraland** | 开放虚拟世界（链上土地） | 平台仍运营（官方博客更新至 2026-10）；MANA 约 **$0.089**（ATH ~$5.90，跌幅 >98%）【第三方行情】；unity-renderer 仓库 2025-09 归档【GitHub API】；2026 官方 DAU **未能核实** | "开放 + 用户拥有"叙事的最大反面教材：经济模型先于体验 | CoinGlass；GitHub API |
| **Mozilla Hubs** | WebXR 空间 | 2018 上线 → 2024-02-15 宣布 → **2024-05-31 关停**；累计 115,732 头像 / 215,923 场景 / 近 1000 万人次参会【官方】；社区版延续（2,223★/1,389 fork/1,224 open issues，最后提交 2026-10-29） | Web-first 路线的第一份尸检；也是"社区接手"可行性的样本 | Mozilla 官方；UploadVR；GitHub API |
| **AltspaceVR** | 社交 VR | 2015 上线 → 2017 被微软收购 → **2023-03-10 关停**；SideQuest 买下名称权，计划 2026 秋推"精神续作"【媒体转述 Wikipedia】 | 大厂收购 → 关停的典型路径；"复活"本身成为卖点 | Wikipedia/CNET |
| **Meta Horizon Worlds** | 社交 VR/移动 | VR 版 2026-03-19 宣布 2026-06-15 关停，**2 天后撤回**（CTO Instagram，称因用户"心碎"反馈）；移动端累计下载 **4500 万**、2026 年新增 150 万（+53% YoY）、**消费者总支出仅 $110 万**【媒体转述 Appfigures】；MAU 长期 <20 万、DAU 低谷 <900、多数用户一月内流失【媒体转述 WSJ/内部报告】 | 资本最雄厚的玩家也没做成"通用社交世界"；移动端有下载无收入 | BlockTempo；17173；VR陀螺 |
| **Hyperfy** | 开源自托管世界 | 310★ / 117 fork / 30 open issues（建仓 2024-12-22，最后提交 2026-04-21）【GitHub API】；免费开源、自托管或托管商；v1 曾以以太坊 NFT 一次性售卖世界、代码基本闭源；文档已支持 Blender 工具与 AI Agent（Eliza OS）接入【官方】 | **与 choroweave 最同构的先例**：自托管世界 + 可嵌入。规模证明"只有协议不够，还需要开箱即用" | GitHub API；docs.hyperfy.xyz |

### 2.2 AI 生成世界 / 游戏平台

| 名称 | 类型 | 规模 / 状态（截至 2026-11 核实） | 与 choroweave 的关系 | 证据 |
|---|---|---|---|---|
| **World Labs · Marble** | 商业世界模型 | 融资累计约 **$12.3 亿**（2024-09 $2.3 亿 @ >$10 亿；2026-02 追加 $10 亿，含 Autodesk $2 亿；NVIDIA/AMD/Fidelity 参投）；TechCrunch 称估值约 $50 亿（公司未确认）【第三方/媒体】。产品线：Marble 1.1 Plus / 1.1 / 1.0 / 1.0 Draft；价格约 **$2.48 / $1.20–1.28 / $0.12–0.20 每世界**；API 2026-01；1.1 于 2026-04 | **最直接的技术替代路径**：文本→持久 3D 场景。但其输出是**资产**（Gaussian splat + 10–20 万三角形碰撞网格 + 漫游视频），要导入 Unreal/Unity/Blender 才可运营；浏览器渲染靠开源 Spark（three.js） | invideo 2026-08 整理；官方定价页 |
| **Google DeepMind · Genie 3 / Project Genie** | 世界模型 → 研究原型 | Genie 3 于 2025-08 公布；**Project Genie 于 2026-01-30 上线**，仅美国、Google AI Ultra 订阅用户（18+），Web 应用；含 World Sketching（接 Nano Banana Pro）、World Exploration、World Remixing；Genie 3 的部分能力（实时 prompt 事件）未进入原型【官方】 | 证明"世界模型 → 消费级 Web 体验"的路径存在，但被**订阅墙 + 地域 + 单人探索**限制，不构成开放空间互联网 | blog.google 官方博客 |
| **Decart** | 世界模型基础设施 | 融资 **$3 亿**（Radical Ventures 领投）【官方】；产品线 DOS（推理/训练栈）、Lucy（沉浸体验世界模型，Lucy 2.0 实时世界变换）、Oasis（物理 AI，Oasis 3）【官方】 | 提供"实时视频世界"这一替代渲染路径；与 choroweave 是潜在零件而非竞品 | decart.ai/blog |
| **Odyssey** | 交互式世界模型 | 成立 2023；融资 **$3.1 亿**，投后估值 **$14.5 亿**（FT 报道，经智东西转述 2026-06-18）；投资方含 NVIDIA、Natural Capital、In-Q-Tel、Jeff Dean、Elad Gil【媒体转述】。产品：Odyssey-2（2025-10）、Odyssey-2 Pro（API，720p@22fps 实时）、Odyssey-2 Max（3× 参数、10× 算力、私有 beta；VBench 2 physics 49.67→58.52）、Odyssey-3、多智能体世界模型【官方】 | 明确把"可交互世界"作为 API 出售——未来可能是 choroweave 的渲染后端之一 | odyssey.ml |
| **Overworld · Waypoint** | 实时生成世界运行时 | Waypoint 1.5（2026-04）：**720p@60fps** 在消费级硬件本地运行，另有 360p 档；训练数据约为 v1 的 100×；本地运行时 Overworld Biome（EXE 安装）；Overworld.stream 即时体验；Waypoint 2 beta 已存在【官方】 | "本地实时生成"路线与 choroweave"个人服务器"哲学高度一致，值得作为合作/参照 | over.world/blog |
| **Astrocade** | AI UGC 游戏平台 | 2026-05-05 宣布 **$56M**（Sequoia 领投 B 轮 + Sea 领投 A 轮；Google AI Futures Fund、NVIDIA、LG Tech Ventures 等参投）；官方称 8 个月 **2000 万+** 参与用户；Naavik 引述 **5M MAU / 7.5 万创作者 / 月 1.4 亿次游玩**；$10M 创作者基金（门槛：30 天内 10 万次有效游玩）；单次生成约 10 分钟、修改约 2 分钟；**发行排期可长达一周**【官方 + 第三方】 | **最接近"自然语言→可玩空间"的消费级验证**；同时暴露"生成 ≠ 有趣"与"无变现"两大问题 | astrocade 官方博客；Naavik |
| **Roblox Cube / 4D 生成** | 平台内生成式工具 | 2026-02 公布 **4D 生成** beta：不止静态 3D，而是生成**具备功能**的物体（schema：Car-5 五网格车、Body-1 单网格），并把脚本重定向到生成物体的实际尺寸；早期体验《Wish Master》生成 **16 万+** 物体【官方】 | 平台把"生成"内化为"资产层"，不与"世界协议"竞争——这是 choroweave 应该模仿的分层 | about.roblox.com |
| **Roblox Reality** | 混合架构（引擎 + 视频模型） | 2026-04-30 财报会披露，2026 年底–2027 初向创作者推出；目标 **4K@60Hz**；Video Model（"Super Upsampler"）在边缘数据中心用 H200/B200；**玩家付费订阅，创作者不额外付费**；2026-06 引入 Morpheus AI 团队（Self Forcing 自回归化）、Dynamics Lab、Lucid AI 创始人【官方】 | **最重要的战略情报**：最大 UGC 平台判断"纯 world model 无法支撑持久多人世界"，选择 Engine 主导 + 生成像素。choroweave 的分层设计应与此一致 | gamesbeat；Roblox newsroom |
| **Bitmagic** | AI 游戏开发套件 | 2026-08-27 发布 **GDK**：面向 AI 编码代理（Claude Code / Codex / Cursor），TypeScript 3D 引擎以可读源码形式 vendor 进项目；`bitmagic dev` 热重载 + 编辑器；`bitmagic verify` 真实浏览器启动游戏并截图验证；一条命令发布到 bitmagic.ai（托管、默认私有、可被站内玩家发现）；多人 + 全球排行榜由 Bitmagic 服务器承载【官方】 | **"Agent-first 世界创作"的最清晰样本**——choroweave 若做编译器，直接竞争者会是这条路线 | bitmagic.ai/news |
| **Rosebud AI** | AI 游戏创作 | 消费级 AI 做游戏 + Rosebud Play 分发；分类（RPG/平台/多人/恐怖…）齐全【官方】；用户规模、收入、留存 **未能核实** | 生成式 UGC 的同类；缺可核实规模数据 | rosebud.ai |
| **Scenario** | AI 游戏美术资产 | 面向游戏工作室的资产生成平台【官方】；融资/估值仅见 PitchBook/Crustdata 类数据库条目，具体数字 **未能核实** | 供应链层，非竞品 | scenario.com |
| **腾讯混元世界 HunyuanWorld** | 开源世界生成 | HunyuanWorld-1.0 开源（GitHub Tencent-Hunyuan/HunyuanWorld-1.0）：从文字/图像生成可探索交互 3D 世界【官方仓库】；1.1 版本 2026-03 前后开源，媒体称"单卡部署、秒级生成 3D 世界"【媒体转述】 | 开源权重意味着"世界生成"会快速商品化——choroweave 不应把生成质量当作护城河 | GitHub；ai5g 转述 |

### 2.3 硬件与分发

| 项目 | 关键数据（截至 2026-11 核实） | 证据 |
|---|---|---|
| **Meta Quest** | 2025 前三季度出货 170 万台，同比 **-16%**；2024 全年 560 万台（约 $29 亿收入）【IDC，经 The Register 转述】；2025 年 Quest 相关广告投放同比 **-55%+**（Sensor Tower）【第三方】 | The Register（IDC）；17173 |
| **Apple Vision Pro** | 2025 全年出货 **45,000 台**（前三季度 0 台，Q4 以 M5 版重启）；2024 年 39 万台（约 $14 亿收入）；供应商端一度停产；IDC 预测 2026 年 29 万台 / $6.36 亿【第三方 IDC】；广告投放同比 **-95%+**【第三方】 | The Register（IDC + Sensor Tower） |
| **整体 VR/MR 头显** | IDC 预计 2025 年全年出货 **-42.8%**【第三方】 | The Register（IDC） |
| **智能眼镜 / AR** | 2025 年 AR/ER 市场 **+211.2%**；Meta Ray-Ban Display Q3'25 出货 2 万台；IDC 预测智能眼镜 2025–2029 CAGR **29.3%**【第三方】 | The Register（IDC） |
| **Valve Steam Frame** | 2026-09-15 发布；骁龙 8 系 + SteamOS 独立头显；100+ "Standalone Verified" 游戏；双无线电 + 专用 Wi-Fi 适配器做无线串流；随机抽签预约防黄牛；日区含税 ¥199,980（256GB）/ ¥244,980（1TB）；美区起售价媒体转述为 US$1,059（**币种/含税口径未能从 Valve 官方页直接核实**）【官方 + 媒体转述】 | thisisgame；moguravr |
| **SteamVR 份额（2026-10）** | Steam Frame **首次进入统计即第 5 名、份额 5.49%**；Quest 2 份额环比 **-3.57pp**；对比：Valve Index 首月仅 1.46%，用了约 2 年才到第 2 名【第三方 Steam 硬件调查，经 moguravr/RoadToVR 转述】 | moguravr；RoadToVR |
| **Steam 并发（第三方追踪）** | VRChat 2026-11-07：当前 51,397 / 30 日均 45,019 / 30 日峰值 67,190【第三方】；Resonite：136 / 155 / 298【第三方】 | live-player-count.com |

### 2.4 开源 / 标准基础设施

| 项目 | 数据（GitHub API 元数据，截至 2026-11-07） | 判读 |
|---|---|---|
| `Hubs-Foundation/hubs` | 2,223★ / 1,389 fork / **1,224 open issues** / 建仓 2017-09-26 / 最后提交 2026-10-29 / 未归档 | 社区版仍在维护，但 issue 积压说明**核心维护者极少** |
| `matrix-org/thirdroom` | 656★ / 70 fork / 91 open issues / 建仓 2021-09-21 / **最后提交 2023-08-30** | 已实质停滞近 3 年；Matrix 上的"开放沉浸世界"叙事未兑现 |
| `hyperfy-xyz/hyperfy` | 310★ / 117 fork / 30 open issues / 建仓 2024-12-22 / 最后提交 2026-04-21 | fork/star 比高达 0.38，**说明"自己部署一份"是主要用法** |
| `omigroup/omigroup` | 329★ / 22 fork / 13 open issues / 最后提交 2025-10-01 | 标准化讨论组，非实现项目 |
| `decentraland/unity-renderer` | 140★ / 95 fork / 188 open issues / **已归档** / 最后提交 2025-09-19 | 客户端战略收缩 |

---

## 3. 逐项分析

### 3.1 平台侧：规模仍在扩张，但"平台税"逻辑正在被 AI 重构

**Roblox：用户与时长创新高，收入结构却在恶化。**
Q3'26 官方数据：DAU 1.38 亿（+12% QoQ）、时长近 340 亿小时（+17% QoQ）、收入 $15.72 亿（对比 Q3'25 $13.60 亿，+15.6%，自行计算）、净亏 $2.30 亿。【官方】
但两个数字必须一起读：
- **bookings $17 亿，同比 -12%**；Q4'26 指引 bookings 同比 **-10%~-15%**，收入 +4%~12%。【官方】
- **Developer Exchange Fees 占收入 26%（Q3'26）vs 31%（Q3'25）**；占 bookings 24% vs 22%。【官方】

也就是说：Roblox 在"用更少的创作者分成换更高的收入确认"，同时 bookings 在下滑。公司自己给的解释是"2025 年高基数"与 GTA 发售的竞争逆风。【官方，电话会】

真正值得 choroweave 记下的是 AI 相关披露：
- **80% 的 Top 100 游戏在过去一个月使用了 AI 工具**；**两款几乎完全由 AI 创作的游戏（Brainrot、Steal an Egg）进入 Q3 并发前 20**；**Top 1000 游戏中 40% 是过去 90 天发布的**。【官方，电话会】
- 97% 经常使用 AI 的创作者称其加速了开发；Build（自然语言创作）alpha 期间"超过 75% 的 Build ..."（原文句子在抓取中被截断，**完整口径未能核实**，本报告不引用该数字）。
- 战略上把"生成"**内化**为资产层（Cube / 4D 生成），而不是把"世界"外包给模型。

**对 choroweave 的含义**：Roblox 已经把"游戏分发 + 社交图谱 + 生成式资产"三件套锁死。**任何以"做更好的 Roblox"为定位的项目都会正面撞墙**。choroweave 的生存空间只能在 Roblox 结构上不提供的部分：跨域寻址、可自托管、可组合、开放身份与内容可携带。

**Fortnite/UEFN：UGC 吃掉了平台一半时长，平台自身在退潮。**
第三方汇总（Axis Intelligence，2026-07-07）给出：6.5 亿注册、约 1.1–1.2 亿 MAU、2025 年约 $60 亿收入；**2026 年 4 月日均 DAU 约 869,137，较 1 月峰值 238 万下降 42%**；2026-03 裁员超 1000 人，Sweeney 公开称"从 2025 年开始的 Fortnite 参与度下滑，意味着我们花得比赚得多"。【第三方 / 媒体转述】
同时 Epic 官方在 2026-06-17 Unreal Fest Chicago 确认：**UEFN 创作者累计分成自 2023 年起达 $10 亿**；**创作者岛屿在 2026-05 占据 47% 的玩家时长（去年 38%）**。【官方口径，经第三方转述】

**判读**：UGC 平台的生命周期不是"平台养创作者"，而是"创作者接管平台，平台变成结算与发现层"。这对 choroweave 是**结构性利好**——如果协议层能承担"跨平台的发现与结算"，就不需要自己拥有一个 Roblox 量级的平台。但反过来，若 choroweave 只做协议不做发现，创作者不会来。

### 3.2 VR 社交侧：VRChat 的"小而硬" vs Rec Room 的"大而脆"

**VRChat（活着的样本）**
- 官方 2026-05 公布：**峰值 CCU 158,192**（2026-02 的 Netflix 动画《超时空辉夜姬》主题虚拟演唱会创下）、**日均 CCU ~10 万**、**25 万+ 活跃社区**、**日本用户增长 3.9×**、**创作者分成最高 50%**，并明确宣传"**无需 VR 设备也能加入**"。【官方】
- Sensor Tower（2026-02）：**全球 MAU >100 万**；Steam 累计下载 >530 万（2017-02 抢先体验起）；过去 12 个月在 Steam"沙盒"子类型中日均 DAU 第一；**2025 年官网访问量约 6.5 亿次，日本 37% / 美国 27%**；移动版 **2025-10-25** 上线，首月下载 >27 万，日本占 26%（仅次于美国）。【第三方】
- 跨年 CCU 纪录：2025-12-31 → 2026-01-01 达 **14.8 万+**（UploadVR 引述）。【媒体转述】
- 第三方 Steam 追踪（2026-11-07）：当前 51,397 / 30 日均 45,019 / 30 日峰值 67,190。注意这**只含 Steam 端**，不含 Quest 与移动端。

**VRChat 给 choroweave 的四条可复用结论**：
1. **世界间跳转已经存在且被大量使用**（World 链接、Portal 道具、社区驱动的"世界巡游"），只是寻址被锁在中心服务器内。协议化的价值不是"发明传送门"，而是"让传送门跨运营方"。
2. **"不需要 VR"必须明说**。VRChat 官方在 2026 年主动弱化"必须买头显"的印象——这是行业共识转向。
3. **社区，而不是世界，是留存单位**。25 万个活跃社区 vs 100 万 MAU，意味着平均每个社区约 4 人——**这是"小群 + 强关系"的结构**，不是"大世界"。
4. **日本是当前最强的社交 VR 市场**（官网访问 37%）。任何全球化叙事都要解释为什么日本先起来（IP 驱动 + 演唱会/同人文化 + 移动端渗透）。

**Rec Room（死亡样本）**
- 2026-03-31 官方宣布 **2026-06-01 永久停服**；同日 Snap 确认收购部分资产，部分员工加入 Specs Inc.（Spectacles AR 硬件子公司）。【官方 + 媒体转述】
- 官方原话（GeekWire 转述）：「Despite this popularity, we never quite figured out how to make Rec Room a sustainably profitable business... Our costs always ended up overwhelming the revenue we brought in.」
- 财务：融资 **$2.94 亿**，峰值估值 **$35 亿**（$1.45 亿 F 轮，Coatue 领投，Sequoia / Index / Madrona 参投）；2025 年两轮裁员（16%、50%）。【媒体转述】
- 单位经济（关键）：**第一方道具平台留 ~70 美分/美元；UGC 道具在扣掉 30% 平台费 + 创作者分成后，Rec Room 仅留 ~30 美分/美元**；UGC 收入同比 +70% 反而持续稀释毛利；**月付费用户占比 <2%**；RR+ 会员 $7.99/月。【媒体转述官方数据】
- 跨端代价：VR + PC + 主机 + 移动四端并行 → Bug 与维护成本高企；为兼容旧手机牺牲 VR 功能 → 核心 VR 用户流失；移动端 30% 抽成。【媒体转述】
- 2025 年时公司称 runway 可支撑到 2029 年。【媒体转述】

**对 choroweave 的含义（最重要的一条）**：
> 如果 choroweave 的参考实现需要自己托管世界并抽成，它会重演 Rec Room：**规模越大越亏**。必须从第一天设计"成本随世界扩散而分摊"的模型：世界托管在个人服务器上、协议层只做寻址/身份/结算、参考实现只做客户端与创作工具。

**Resonite**：Steam 当前 136 人、30 日均 155【第三方】。这是"技术理想主义 + 无商业模型"的天花板——可以长期存在，但无法成为生态。**choroweave 不应对标 Resonite 的规模。**

### 3.3 Web / 开放阵营：Hubs 的尸体 + Spatial 的账单 + Decentraland 的教训

**Mozilla Hubs（Web-first 第一份尸检）**
- 2018 上线，2024-02-15 宣布，**2024-05-31 关停** demo 服务器、订阅与社区资源；Mozilla 不再主动开发或维护代码库。【官方】
- 关停前累计：**115,732 个自定义头像、215,923 个场景、近 1000 万人次参会**（仅统计官方 demo 服务器）。【官方】
- 直接触发因素是 **2024-02-13 的 Mozilla 全组织裁员**；Hubs Cloud（AWS 自助托管）早在 2023-10 就宣布停止提供。【官方 + 媒体转述】
- 代码交给社区：`Hubs-Foundation/hubs` 至 2026-10-29 仍有提交，但积压 **1,224 个 open issue**、2,223★/1,389 fork。【GitHub API】

**这条尸检的最关键结论不是"WebXR 不行"，而是**：
> 一个"私有、浏览器内、跨设备"的 3D 空间产品，即使免费、即使有 Mozilla 品牌、即使有 1000 万人次使用，**只要托管成本由单一主体承担，就必然在预算收缩时第一个被砍**。
> choroweave 若把"个人服务器"作为一等公民，正是在解决这个问题；但必须回答"谁来为第一次体验付费"（详见 §5）。

**Spatial（托管成本的直接账单）**
CEO Jinha Lee 的公开声明几乎是给 choroweave 写的风险提示：
> 「The cost of hosting and scaling open multiplayer 3D worlds has grown significantly and continues to climb. We explored every alternative: revised pricing models, tiered hosting plans, and partnership structures. Every path forward would have meant passing rising costs directly to you at levels that are not sustainable for independent developers and small studios. We were not able to find a model...」
> ——Spatial 创作者平台 2025-07-27 终止，世界资产删除，仅保留企业客户。【官方声明，经 UploadVR 转述】

同时值得注意：Spatial 的自研工作室 Wooster Games 做的社交 VR 游戏 **2025-07 已达 50 万+ DAU**（业界普遍指向《Animal Company》）。【媒体转述】
**判读**：**"社交世界平台"死，"社交游戏"活。** 用户愿意为"有玩法的场景"付费/停留，不愿意为"空的空间"付费。这是 choroweave 楔子选择的核心线索。

**Decentraland（经济模型先于体验）**
- 平台仍在运营（官方博客更新到 2026-10 的 Halloweeks 活动）。【官方】
- MANA 约 **$0.089**，相对 2021-11 历史最高约 $5.9（第三方行情口径，具体数值未逐笔核实）跌幅 >98%。【第三方行情】
- `decentraland/unity-renderer` 已归档（2025-09-19）。【GitHub API】
- 广泛流传的"Decentraland 日活 38 人"是 **2022 年前后的第三方/媒体口径**，本报告**未能核实 2026 年官方 DAU**。该数字不应被当作 2026 年的事实使用，但它作为"链上土地叙事与真实使用严重脱节"的符号仍然有效。
- **教训**：土地稀缺性 / 代币激励不能替代"进来有事可做"。当资产价格成为主要叙事，用户增长与体验改进会同时停止。

**Hyperfy（最同构的先例）**
- 免费 + 开源；世界需自托管或由托管商托管；v1 曾是"以太坊 NFT 一次性购买世界"、代码基本闭源；v2 转向开源 + `.hyp` 格式 + Blender 工具 + AI Agent（Eliza OS）接入；有 $HY 代币。【官方文档】
- 310★ / 117 fork / 30 open issues，建仓 2024-12-22，最后提交 2026-04-21。【GitHub API】
- **fork 数与 star 数之比 0.38**，说明"自行部署一份"是主要使用方式——这正是"个人服务器"需求的真实证据，但也说明**没有形成网络效应**：每个 fork 都是孤岛。

> **对 choroweave 的直接启示**：Hyperfy 证明了"自托管世界 + Web 客户端"技术上可行且有人要；它没有证明的是"孤岛如何互联"。**互联层（寻址、身份、发现、结算）正是 choroweave 唯一值得做的部分。**

### 3.4 AI 生成世界 / 游戏：三条路线，三种局限

**路线 A：世界模型直接生成场景（Marble / Genie / Decart / Odyssey / Waypoint）**

| 维度 | 现状 |
|---|---|
| 输出形态 | Marble = 持久 3D 资产（Gaussian splat + 碰撞网格 + 漫游视频），可导入 Unreal/Unity/Blender/Houdini；可导出 VR。Genie 3 / Project Genie = 实时生成的视频式世界（"走路时实时生成前方路径"）。Odyssey / Decart / Waypoint = 实时视频式交互世界。 |
| 交互性 | Genie 3 系列"实时"，但 **Project Genie 原型未包含"实时 prompt 改世界"** 的能力。Odyssey-2 Pro 720p@22fps；Waypoint 1.5 720p@60fps（本地消费级硬件）。Marble 是**离线生成**（标准档约 5 分钟/世界），生成后可漫游。 |
| 多人 | **全部不支持"多人持久共在"**。Odyssey 已展示"多智能体世界模型"，但仍是研究阶段。 |
| 定价 | Marble API：Draft ~$0.12–0.20/世界，标准 ~$1.20–1.28，Plus 最高 ~$2.48。Project Genie 绑 Google AI Ultra 订阅（价格未能核实），仅美国。 |
| 关键限制 | ① 一致性/长时程记忆不足；② 无持久世界状态；③ 无权限/身份/经济系统；④ 输出难以被第三方编辑（Marble 除外，其输出是标准资产）。 |

**Roblox 的判断值得逐字记住**（官方 newsroom，2026-06-03）：
> 「standalone world models, while powerful, fundamentally lack the long-term memory, consistent logic, and structured user input required for a massive multiplayer platform.」

以及 Roblox Reality 的技术选择（官方 + gamesbeat）：
- **混合架构**：Roblox Engine 持有游戏状态与逻辑，**Roblox Video Model 只生成像素**（"Super Upsampler"），生成内容**从属于**创作者用引擎定义的内容；
- 目标 **4K@60Hz**；推断放在边缘数据中心（H200/B200）；
- **玩家付费订阅**（Baszucki：「Roblox Reality will not be free」），创作者端不加价；
- 上线时间：**2026 年底 – 2027 年初**；
- 创作者反弹明显："多数玩家和创作者更喜欢 Roblox 的方块/卡通风格"，公司承认做 photoreal 的创作者是少数。

**对 choroweave 的含义**：**不要做世界模型，做世界模型的"落地点"。** 生成能力会商品化（HunyuanWorld 开源、Marble API 按世界计费、Waypoint 本地运行），但"生成的场景如何被寻址、被访问、被组合、被计费"不会自动解决。

**路线 B：消费级 AI UGC 平台（Astrocade / Rosebud / Bitmagic）**

Astrocade 是 2026 年最重要的一手样本：
- 2026-05-05 官方：**$56M**（Sequoia 领投 Series B、Sea 领投 Series A；Google AI Futures Fund、NVIDIA、LG Technology Ventures、Dentsu Ventures 等参投）；**8 个月 2000 万+ 参与用户**；天使投资人包括 **Roblox CEO David Baszucki、前 EA/Unity CEO John Riccitiello**。
- Naavik（第三方深度分析）补充：**5M MAU、7.5 万创作者、月约 1.4 亿次游玩**；称其为"消费级 AI 游戏平台迄今最大的一笔披露融资"。
- 产品形态：垂直、TikTok 式信息流；自然语言 → "AstroBrain" 编排器调度一组专用 agent（视觉/UI/玩法逻辑/动画/音乐/音效）→ 浏览器内可玩；约 **10 分钟**生成、**2 分钟**迭代；**发行排期可长达一周**。
- 变现：**未披露任何虚拟货币、内购或订阅**（仅有面向 Discord 精选用户的更强模型）。
- Naavik 的批评：「平台目前感觉像是**游戏 demo 的聚合体**，操作常常笨拙，进程深度有限」；核心问题是"玩家侧到底好不好玩"。

Bitmagic 走了另一条路（2026-08-27 GDK）：不面向消费者，而面向 **AI 编码代理**（Claude Code / Codex / Cursor），把 3D 引擎以可读 TypeScript 源码 vendor 进项目，`bitmagic verify` 让 agent 在真实浏览器里启动游戏并截图自检，一条命令发布到托管平台（默认私有、可被站内发现），多人 + 排行榜由平台服务器承载。

**判读**：
- Astrocade 证明**"自然语言 → 可玩"的消费需求真实存在且增长极快**（0→5M MAU 用 8 个月）。
- 但它的**留存与变现完全未证明**，且被指"demo 聚合体"。
- Bitmagic 证明**"agent 作为创作者"是真实工作流**，且它已经解决了"托管 + 多人 + 发布"——**这正是 choroweave 想做的后半段**。
- **choroweave 的机会窗口**：Astrocade 是封闭平台（内容不能带走、世界不能互联），Bitmagic 是工具链（世界托管在自己的服务器）。**两者之间"可携带 + 可互联"的位置是空的。**

**路线 C：平台内生成（Roblox Cube / 4D 生成 / HunyuanWorld 开源）**
- Cube 的 4D 生成不只是"生成网格"，而是**生成具备功能的物体**：schema 定义必需网格（Car-5：车身 + 四轮），再**把脚本重定向到生成物体的实际尺寸**，使轮子能转、车能开。早期体验已生成 16 万+ 物体。【官方】
- 这是"生成"与"可交互"之间的关键工程桥梁：**功能契约（schema）先于生成**。
- **对 choroweave 的直接借鉴**：choroweave 的"意图 → 可执行空间"编译，最需要的正是这种 **schema + 脚本重定向** 思路——把"可交互性"规格化，再让生成模型填充几何与外观。

### 3.5 硬件与需求侧：为什么必须是 Web-first

**2025 年是 VR 硬件的断崖年（IDC，经 The Register 转述，2026-01-02）**：
- 整体 VR/MR 头显出货 **-42.8%**（2025 全年预估）；
- Vision Pro：**全年 45,000 台**（前三季度 0 台，Q4 才以 M5 版重启；2024 年为 39 万台 / 约 $14 亿收入）；一度在供应商端停产；
- Quest：前三季度 **170 万台**，同比 **-16%**（2024 年全年 560 万台 / 约 $29 亿）；
- 广告投放同步塌陷：Vision Pro 相关投放同比 **-95%+**、Quest **-55%+**（Sensor Tower）；
- 对照：AR/ER（智能眼镜）**+211.2%**，Meta Ray-Ban Display Q3'25 出货 2 万台，IDC 预测智能眼镜 2025–2029 CAGR **29.3%**。

**2026 年的唯一正向变量是 Steam Frame**：
- 2026-09-15 发布，骁龙 8 系 + SteamOS 独立头显，100+ Standalone Verified 游戏，双无线电 + 专用 Wi-Fi 适配器做无线串流；
- 2026-10 Steam 硬件调查**首次纳入即第 5 名、5.49%**；Quest 2 份额环比 -3.57pp（部分用户可能迁移）；
- 对比基准：Valve Index 首月 1.46%，用了约 2 年才到第 2 名；
- Valve Index 已停产；SteamVR Beta 2.19.1（2026-11-04）显著改善 Quest/PICO 串流画质。
- 价格：日区含税 ¥199,980（256GB）/ ¥244,980（1TB）；美区媒体转述 US$1,059 起（**未能从 Valve 官方页直接核实币种与含税口径**）。

**需求侧的三个硬事实**：
1. **头显装机量在收缩，不是在扩张**。-42.8% 的年份做 VR-first 等于把 TAM 砍掉一半。
2. **Horizon Worlds 的移动端数据揭示了"下载 ≠ 使用 ≠ 付费"**：4500 万累计下载，2026 年新增 150 万（+53% YoY），**消费者总支出仅 $110 万**。【媒体转述 Appfigures】
3. **但"VR 内的高质量社交游戏"仍在赚钱**：Spatial 旗下 Wooster Games 的社交 VR 游戏 2025-07 达 50 万+ DAU。【媒体转述】

**结论**：**Web-first（浏览器 / 桌面 / 移动）为默认入口，VR 作为"可选的高保真入口"由同一个世界数据驱动。** 这不是妥协，而是与 IDC 数据一致的唯一选择。choroweave 的世界格式必须**同时**能被 three.js 类 Web 渲染器和 Unity/Unreal 类引擎消费——Marble 的"Gaussian splat + 碰撞网格"双输出正是可借鉴的工程范式。

### 3.6 开源与社区信号：真实热度是"小工具链"，不是"大社区"

- **Hyperfy**：310★ / 117 fork / 30 open issues / 建仓 2024-12 / 最后提交 2026-04。fork/star = 0.38（远高于一般项目），说明**部署需求 > 关注需求**。
- **Hubs 社区版**：2,223★ / 1,389 fork / **1,224 open issues** / 最后提交 2026-10-29。项目活着，但 issue 积压说明核心维护者极少（Hubs 关停时只有 3 名 Mozilla 员工负责过渡）。
- **Third Room**：656★ / 最后提交 **2023-08-30**。已停滞近 3 年。这是"开放沉浸世界"叙事最响但落地最弱的一例（Matrix 生态）。
- **OMI（Open Metaverse Interoperability Group）**：329★ / 22 fork / 最后提交 2025-10-01；官网版权仍标 2022。**标准化努力存在但动能很弱。**
- **Metaverse Standards Forum**：门户仍在线（© 2011–2026），下有 "Open Metaverse Browser Initiative" 文档。
- **学术侧已经占位**：ISMAR 2026 XWORLDS workshop 出现《The Web of Worlds: Towards A Referential Architecture for Open Spatial Worlds》（Fraunhofer 站点 PDF）。**这说明"空间超链接 / 可引用空间"在学术上已被命名，choroweave 必须引用并给出工程化差异，而不是宣称首创。**

**判读**：
> "开源 + 开放协议"在 2026 年的真实状态是：**一小群高度技术化的个人与小团队，在维护若干互不连通的工具链**。没有形成网络，因为**没有共享的寻址与身份**。
> 这既是坏消息（社区很小），也是好消息（**空位很清楚**）。

**融资对照（判断时机）**：
| 项目 | 融资 | 说明 |
|---|---|---|
| World Labs | ~$12.3 亿（$2.3 亿 + $10 亿） | 世界模型层，资本极度充裕 |
| Odyssey | $3.1 亿 @ $14.5 亿投后 | 交互世界模型 API |
| Decart | $3 亿 | 实时世界变换 |
| Astrocade | $5600 万 | 消费级 AI UGC |
| Rec Room | $2.94 亿（累计）→ 归零 | 社交空间平台 |
| Spatial | 未能核实 | 已退出创作者平台 |

**结论**："生成能力"已被资本充分定价（估值高、算力密集、赢家通吃）；**"连接生成结果的协议层"几乎没有被投资**——因为还没有人证明它能收费。这既意味着 choroweave 面对的融资环境偏冷，也意味着**没有强势在位者**。

### 3.7 空间寻址 / 超链接：已有的占位者

| 来源 | 内容 | 对 choroweave 的意义 |
|---|---|---|
| **MSF "Web of Worlds（WoW）" 议程 + X3D 4.1 WoW Profile**（2026） | 把互联网视为可寻址、可链接的空间体验网络（"pages become places, links become portals"）；Profile 含 **Anchor（3D 超链接）** 与 **Inline（外部场景）** 节点；白皮书由 MSF 发布，Threedy.io / Virginia Tech 实现中【标准组织】 | **最重要的对标物**：SHP 不应新造链接原语，而应给出"轻量 profile + 门户进入握手"，并明确与 Anchor/Inline 的字段映射 |
| ISMAR 2026 XWORLDS《The Web of Worlds》 | "Towards A Referential Architecture for Open Spatial Worlds" —— 提出面向开放空间世界的**可引用架构** | 学术概念已被提出；choroweave 需要给出**可运行的协议 + 参考实现**，并引用该文 |
| Metaverse Standards Forum · "Open Metaverse Browser Initiative" | 标准组织下的浏览器化元宇宙提案文档 | 标准侧有入口，但无实现 |
| VRChat 的 World 链接 + Portal | 事实上的"世界寻址 + 传送门"（中心化） | 用户已经理解这个交互；choroweave 只需把运营方解耦 |
| AltspaceVR 的 in-world "teleporters" | 2015 年就有"世界内传送门" | 交互范式不新，**协议才是新的** |
| **OMI glTF 扩展**（`omigroup/gltf-extensions`，含已归档的 `OMI_link`） | 社区曾定义 glTF 层的空间链接扩展（Phase 0–5），`OMI_link` 已归档【标准组织】 | 说明"在 glTF 里做超链接"已有先例与失败教训：**扩展必须小而可忽略（graceful degradation）**，不能要求全行业实现 |
| Hyperfy 的 `.hyp` 世界格式 | 世界作为可导出的单一文件/包 | 最接近"可寻址世界对象"的工程实践 |

---

## 4. 失败先例复盘与 8 条教训

### 4.1 七个失败案例的结构化对比

| 案例 | 时间 | 表面原因 | 结构原因 | 一句话教训 |
|---|---|---|---|---|
| **Mozilla Hubs** | 2018 → 2024-05-31 | Mozilla 2024-02 全组织裁员 | 免费 + 单一主体承担全部托管成本；WebXR 无法形成付费闭环 | **没有付费方的免费公共空间，一定先被砍** |
| **AltspaceVR** | 2015 → 2023-03-10 | 微软战略转向 Mesh | 收购方的主业与它无关；社区资产不可携带 | **不要把生存权交给一个不以此为主业的所有者** |
| **Rec Room** | 2016 → 2026-06-01 | "没找到可持续盈利模式" | UGC 抽成结构（30¢ vs 70¢）+ 跨端成本 + 付费率 <2% | **UGC 越成功越亏 = 抽成模型错了，不是内容错了** |
| **Spatial（创作者平台）** | → 2025-07-27 | 托管与扩容成本持续上升 | 无法把成本转嫁给独立开发者而不失去他们 | **"开放多人 3D 世界"的单位托管成本是致命变量** |
| **Meta Horizon Worlds VR** | 2021 → 2026（一度宣布关停后撤回） | 用户规模不足 | MAU <20 万、DAU 低谷 <900、一月内流失、消费者总支出 $110 万 | **资本不能替代产品市场契合；"通用社交世界"没有 PMF** |
| **Decentraland** | 2017 → 仍在运营 | 活跃度长期低迷 | 代币/土地叙事优先于体验；资产价格取代了使用价值 | **金融化会杀死产品迭代的动机** |
| **Webaverse** | → 2023 | 2023-02 被伪装成投资人的攻击者盗走 **$4M USDC**（罗马酒店会面、Trust Wallet 私钥泄露）【媒体转述】；2023 年 8 月前后创始人公开表示关闭公司（社交媒体贴文，具体日期未能核实）【媒体转述】 | 早期项目把全部资金放在单一热钱包 + 依赖"下一轮融资"续命 | **资金安全与现金流纪律是协议项目的生存前提** |

### 4.2 choroweave 不应重复的 8 个错误

1. **不要自己承担全世界的托管成本。** Hubs 与 Spatial 的死因是同一件事。世界必须托管在用户/第三方服务器上，协议层只做寻址、身份、权限、发现、结算。参考实现应默认"本地/自托管优先"，并提供"一键托管"的商业选项而不是强制托管。
2. **不要把"UGC 抽成"当作主收入。** Rec Room 证明：当 UGC 成为主流内容，30% 的留存率会让平台在规模扩张时亏损扩大。choroweave 应把变现放在**协议不变量之外**（托管服务、发现位、认证、企业部署），而不是交易抽成。
3. **不要做"空的空间"。** Spatial 旗下社交游戏 50 万+ DAU，而 Spatial 平台本身死掉；Decentraland 有地无活动。**用户为"活动/玩法/事件"停留，不为"空间"停留。** 楔子必须自带一个"非来不可"的活动类型。
4. **不要为了跨端牺牲核心体验。** Rec Room 为兼容旧手机砍掉 VR 功能 → 核心用户流失，而新增的低龄免费用户不付费。**要做分层的世界格式（保真度分级），而不是降级的统一体验。**
5. **不要把"开源"当作生态策略。** Hyperfy 310★ 且 fork/star=0.38，但世界互不连通。开源只解决"信任与可部署"，不解决"网络效应"。**必须显式设计接入激励与发现机制。**
6. **不要让代币/资产价格成为叙事中心。** Decentraland 的 MANA 从 ~$5.90 到 ~$0.089（-98%），而平台体验十年未变。**金融化会替代产品迭代。**
7. **不要在 VR 装机量 -42.8% 的年份做 VR-first。** 也不能假设"Vision Pro 会带来空间计算大众市场"：2025 年全年 4.5 万台。**VR 是入口之一，不是入口。**
8. **不要宣称"世界模型会取代引擎"。** Roblox 的工程判断（Engine 持状态、Model 只生成像素）与 Marble 的输出形态（资产而非应用）都说明：**生成层与运行时层必须分离**。choroweave 若把"生成"当作核心，会在 12 个月内被商品化（HunyuanWorld 已开源、Marble 按 $0.12/世界计价）。

---

## 5. 给战略定位的 5 条结论

### 结论 1｜时机：现在是"协议层"的窗口，不是"平台层"的窗口
- **平台层已关闭**：Roblox（1.38 亿 DAU）、Fortnite（~1.1 亿 MAU）、Minecraft（1.55 亿 MAU）、VRChat（100 万 MAU + 强社区）已占满"3D 社交/游戏"的生态位；Rec Room（$3.5B 估值）与 Meta Horizon 的失败进一步说明**新平台没有立足空间**。
- **生成层已被资本定价**：World Labs ~$12.3 亿、Odyssey $3.1 亿、Decart $3 亿、Astrocade $5600 万。生成质量不会是差异化。
- **协议层仍空**：开源阵营（Hyperfy 310★、OMI 329★、Third Room 停更 3 年）互不连通；VRChat 的"传送门"锁在中心服务器；学术（ISMAR 2026《Web of Worlds》）已提出概念但无实现；标准组织有文档但无落地。
- **窗口期的判断依据**：Steam Frame 上市（2026-09）意味着"开放 PC 生态的 VR 入口"重新出现；智能眼镜 +211% 意味着"轻量空间计算"在起来；两者的共同需求是**跨设备的世界寻址**。
> **行动含义**：把 2026-11 → 2027 定位为"协议 + 参考实现的抢位期"，目标是成为**默认的空间寻址方案**，而不是成为"又一个世界平台"。

### 结论 2｜楔子：从"可寻址的单人场景 + 一个必须多人才能玩的动作"切入
数据支持的最小可行楔子有三个特征：
1. **场景是"事件"而非"空间"**（Spatial 的社交游戏 50 万 DAU vs 平台死亡；VRChat 的峰值来自演唱会；Rec Room 的付费率低是因为"没有非来不可的理由"）。
2. **天然需要"跨服务器"**（否则不需要协议）：例如"个人主页/作品集空间"、"小型展览/放映"、"异步留言 + 同步聚会"、"跨社区的活动巡游"。
3. **单人也可用，多人是增强**（对抗 VR 装机量不足；符合 VRChat "无需 VR 也能加入"的方向）。

**建议的具体楔子（按可行性排序）**：
- **A. "可寻址的作品集/展陈空间"**：创作者把 3D 作品发布为可链接的世界（一个 URL 一个空间），支持"传送门"跳转到他人空间。低成本、单人可用、天然需要跨域寻址、与 Marble/生成能力协同好。
- **B. "跨社区的活动巡游"**：把 VRChat 式"世界巡游"协议化——不同社区的服务器通过标准入口互相串门。对标真实存在的用户行为，不需要新造需求。
- **C. "AI 生成 + 空间编译"的开发者工具**：面向 agent-first 工作流（Bitmagic 已证明这条路可行），把"意图 → 空间"做成可版本控制、可自托管的编译器，而不是消费级 App。
> **不建议的楔子**：通用社交世界（Meta 已证明无 PMF）、虚拟地产（Decentraland 已证明金融化陷阱）、VR 专用社交（装机量不足）。

### 结论 3｜不做什么（负面清单，每条都有尸检报告支撑）
1. **不做中心化世界托管平台**（Hubs / Spatial 死因）。
2. **不做交易抽成作为主收入**（Rec Room：UGC 抽成 30% vs 第一方 70%，规模越大越亏）。
3. **不做 VR-first**（IDC 2025 头显 -42.8%；Vision Pro 全年 4.5 万台）。
4. **不做通用社交元宇宙**（Horizon Worlds：MAU <20 万、DAU 低谷 <900、消费者总支出 $110 万）。
5. **不做链上土地/代币经济**（Decentraland：MANA -98%，体验十年未变）。
6. **不做自己的世界模型**（会被 HunyuanWorld 开源 + Marble $0.12/世界商品化；Roblox 的结论是 Engine 持状态、Model 只生成像素）。
7. **不做"纯协议无客户端"**（Hyperfy 证明了自托管世界有需求，但也证明了没有开箱即用体验就没有网络效应）。
8. **不做"杀死 Roblox"的叙事**（正面竞争无胜算；应做 Roblox 结构上不提供的"跨域可携带"）。

### 结论 4｜目标用户：先服务"已经有 3D 内容资产、缺分发"的创作者
- **不是**"想社交的普通消费者"（Horizon Worlds 的教训：他们没有明确需求）。
- **不是**"想赚钱的 UGC 开发者"（Roblox / Fortnite 的结算与发现效率远高于新协议）。
- **是**三类人：
  1. **独立 3D 艺术家 / 小型工作室**：已有资产（Blender/GLB/Marble 输出），缺"可链接、可访问、可布展"的空间（对标 Oncyber/Spatial 留下的空位）。
  2. **社区组织者**（VRChat 25 万+ 社区、日本 IP 活动生态）：缺"跨社区的活动基础设施"。
  3. **AI-native 开发者**（Bitmagic/Astrocade 用户）：已经在用 agent 生成内容，缺"可自托管、可携带、可互联"的运行时。
- **规模预期管理**：VRChat 100 万 MAU + 25 万社区是"活得好"的量级；不要以 Roblox 的 1.38 亿为参照。

### 结论 5｜竞争应对：把"世界模型"和"UGC 平台"都当成上游/下游，而不是对手
- **对世界模型（Marble / Genie / Odyssey / Waypoint / Decart）**：定位为**消费方**。提供一个"生成结果 → 可寻址世界"的转换与托管管线（Marble 输出 Gaussian splat + 碰撞网格，正好是可被 Web 渲染器消费的形态）。当生成变便宜，**"生成之后怎么办"的价值上升**。
- **对 UGC 平台（Roblox / Fortnite / Astrocade）**：定位为**互操作对象**，而不是替代品。Roblox 已宣布 "Roblox Everywhere"（创作者可把 Roblox 游戏独立发行到任意应用商店）——这实际上承认了"平台外分发"的需求；choroweave 应提供"跨平台世界的统一寻址"，让平台内容可以被外部链接访问（哪怕初期是只读镜像）。
- **对开源阵营（Hyperfy / OMI / Third Room / Hubs 社区版）**：**优先合并而不是竞争**。Hyperfy 的 `.hyp` 格式、Hubs 的社区版客户端、OMI 的互操作词汇表都是可复用的零件；choroweave 应把自己定位为"这些孤岛之间的寻址层"，并第一个实现互操作。
- **差异化的一句话**：
> **"choroweave 不是另一个世界，是世界之间的 DNS + HTTP。"**

---

## 6. 风险与未知

### 6.1 明确的数据缺口（本报告未能核实，不应被引用为事实）
| 缺口 | 说明 |
|---|---|
| Second Life 2026 MAU / DAU | Linden Lab 不公开；仅知平台仍运营 |
| Oncyber 2026 状态 | 未能核实是否仍在运营/被收购 |
| Decentraland 2026 官方 DAU | 仅有 2022 年前后的"38 DAU"媒体口径，**不可作为当前数据** |
| Scenario 融资/估值 | 仅见 PitchBook/Crustdata 类数据库条目，无一手来源 |
| Rosebud AI 用户规模与留存 | 未披露 |
| Steam Frame 美区官方定价与币种 | 仅媒体转述 US$1,059 起；日区价格可核实（含税 ¥199,980 / ¥244,980） |
| Google AI Ultra 订阅价格 | Project Genie 的准入门槛，价格未核实 |
| OMI / Metaverse Standards Forum 的活跃成员数与工作组成果 | 仅有星标数与门户在线状态 |
| Hyperfy 托管世界的实际数量与月活 | 未披露；仅知 GitHub 指标 |
| Rec Room 关停前的精确 DAU / MAU | 仅有"1.5 亿累计玩家"与"付费率 <2%" |

### 6.2 关键风险
1. **托管成本的"不可能三角"**：开放（任何人可托管） × 低成本（用户付得起） × 体验一致（多人同步质量）。Spatial 的公开信说明这个三角在商业上极难成立。choroweave 必须给出成本模型（例如：世界静态托管 + 按需实例化、或 P2P/中继混合）。
2. **发现机制缺失导致冷启动**：Hyperfy 的 fork/star=0.38 说明"能部署"不等于"有人来"。协议若不含发现层（索引、搜索、推荐），世界会退回孤岛。
3. **安全与内容治理**：Roblox 把 350 亿小时/季度中的大量成本放在 Trust & Safety（Q3'26 相关基础设施与信任安全支出占收入 16%，同比 +110bps）【官方】。**开放协议若不解决治理，会被监管与平台封禁。**
4. **身份与资产可携带**：所有成功平台都把身份锁在平台内。开放身份（DID / 联邦身份）在 2026 年仍缺杀手级实现（Matrix 的 Third Room 已停滞）。
5. **"元宇宙"标签的负资产**：媒体叙事在 2024–2026 年对"元宇宙"高度负面（Horizon 关停、Rec Room 关停、Decentraland 崩盘）。**对外沟通必须避免使用"元宇宙"，改用"空间的开放寻址 / 3D 内容的分发协议"等中性表述。**
6. **巨头顺手做掉**：Roblox 的 "Roblox Everywhere"、Google 的 Project Genie、Valve 的 Steam Frame 生态，任何一方都可能顺手提供"跨世界链接"。choroweave 的时间窗可能是 12–24 个月。

### 6.3 需要下一轮调研回答的问题
1. VRChat 的世界链接 / Portal 使用频率与跨社区比例（决定"传送门"需求的真实强度）。
2. Hyperfy 托管世界的实际活跃分布（决定"自托管"是否只是极客行为）。
3. 独立 3D 艺术家的分发痛点排序（决定楔子 A 是否成立）。
4. 空间寻址的既有专利与标准提案（避免与 Metaverse Standards Forum 的既有工作冲突）。
5. 中国/日本/韩国市场的差异（日本占 VRChat 官网访问 37%，是最值得先验证的市场）。

---

## 7. 来源列表

### 7.1 官方一手来源
1. Rec Room 官方公告《School's Out for Rec Room》 — https://blog.recroom.com/posts/schools-out-for-rec-room
2. Roblox Q3 2026 股东信（SEC 8-K 附件 99.1，2026-10-29） — http://archive.fast-edgar.com/20261029/AVZRB22COZ22S25Z2MTQ2MZ2OOMNZ22IZ282/ex991-q32026earningsshar.htm
3. Roblox Q3 2026 财报电话会记录（The Motley Fool，2026-10-30） — https://www.fool.com/earnings/call-transcripts/2026/10/30/roblox-rblx-q3-2026-earnings-call-transcript/
4. Roblox Newsroom《Pioneering AI Founders Join to Accelerate Roblox Reality Vision》（2026-06-03） — https://about.roblox.com/newsroom/2026/06/pioneering-ai-founders-join-to-accelerate-roblox-reality-vision
5. Roblox Newsroom《Accelerating Creation, Powered by Roblox's Cube Foundation Model》（2026-02） — https://about.roblox.com/newsroom/2026/02/accelerating-creation-powered-roblox-cube-foundation-model
6. Mozilla Hubs 结束支持公告（2024-02-15） — https://support.mozilla.com/en-US/kb/end-support-mozilla-hubs
7. VRChat 官方用户数据（2026-05，经 IT之家转述） — https://m.ithome.com/html/948339.htm
8. Google 官方博客《Project Genie》（2026-01-30） — https://blog.google/intl/ko-kr/company-news/technology/project-genie-kr/
9. World Labs / Marble（经 invideo 2026-08 整理，含官方定价与版本信息） — https://invideo.io/blog/world-labs-marble-3d-worlds/
10. Odyssey《Introducing Odyssey-2 Max》 — https://odyssey.ml/introducing-odyssey-2-max
11. Odyssey《The GPT-2 Moment for World Models Is Here》 — https://odyssey.ml/the-gpt-2-moment-for-world-models
12. Decart 官方博客（$300M 融资 / Lucy 2.0 / Oasis 3） — https://decart.ai/blog
13. Overworld《Waypoint-1.5 Brings Real-Time AI Worlds to Everyday GPUs》 — https://over.world/blog/waypoint-1-5
14. Astrocade《Astrocade Raises $56M in New Funding》（2026-05-05） — https://www.astrocade.com/blog/astrocade-raises-56m-funding
15. Bitmagic《Bitmagic launches the GDK》（2026-08-27） — https://bitmagic.ai/news/bitmagic-gdk/
16. Hyperfy 文档（Creator FAQ / Hosting / v2） — https://docs.hyperfy.xyz/faq/creator/
17. OMI Group — https://omigroup.org/
18. Metaverse Standards Forum 门户（Open Metaverse Browser Initiative） — https://portal.metaverse-standards.org/document/dl/8243
19. Tencent HunyuanWorld-1.0（GitHub） — https://github.com/Tencent-Hunyuan/HunyuanWorld-1.0
20. Decentraland 官方博客（更新至 2026-10） — https://decentraland.org/blog/
21. Steam Frame 官方发布（Steam 新闻） — https://store.steampowered.com/news/group/45479024/view/692020124159311887
22. GitHub API 元数据（2026-11-07 抓取）：`hyperfy-xyz/hyperfy`、`Hubs-Foundation/hubs`、`matrix-org/thirdroom`、`omigroup/omigroup`、`decentraland/unity-renderer`

### 7.2 第三方研究 / 数据
23. IDC 头显出货数据（经 The Register 转述，2026-01-02） — https://assets.theregister.com/2026/01/02/apple_vision_pro_meta_quest_sales_drop/
24. Steam 硬件调查 · Steam Frame 份额 5.49%（经 moguravr 转述，2026-10） — https://www.moguravr.com/steam-frame-steam-hardware-survey-5th/
25. Road to VR《Valve Steam Frame Strong Start in Survey》（2026-10） — https://roadtovr.com/valve-steam-frame-strong-start-survey-oct-26/
26. Steam Frame 发布与定价（thisisgame，2026-09-15） — https://www.thisisgame.com/articles/429970
27. Sensor Tower · VRChat 分析报告（经 163/VR陀螺转述，2026-02） — https://www.163.com/dy/article/KKS3VBK50526LS4I.html
28. Sensor Tower · VRChat 日本市场数据（经 moguravr 转述，2026-02-03） — https://www.moguravr.com/vrchat-japan-visitor-market-share-2025/
29. Naavik《Astrocade's $56M Raise, and UGC Platforms' AI-Enabled Future》 — https://naavik.co/ai-gaming/astrocades-56m-raise-and-ugc-platforms-ai-enabled-future/
30. Axis Intelligence《Fortnite Statistics 2026》（2026-07-07） — https://axis-intelligence.com/fortnite-statistics/
31. Host Havoc《How Many People Play Minecraft (2026)》（引微软高管与财报电话会） — https://hosthavoc.com/en-GB/blog/minecraft-statistics
32. Appfigures / IDC 数据（经 17173 转述，2026-03-20） — https://news.17173.com/content/03202026/120415362.shtml
33. Steam / Resonite 并发追踪（第三方，2026-11-07） — https://live-player-count.com/game/vrchat ；https://live-player-count.com/game/resonite
34. CoinGlass · MANA 行情（2026-11） — https://www.coinglass.com/ja/currencies/MANA/historical-data
35. UploadVR《Mozilla Hubs Is Shutting Down, Will Be Handed Off To The Community》（2024-02-16） — https://www.uploadvr.com/mozilla-hubs-shutdown/
36. UploadVR《Spatial Is Discontinuing Its Creator Platform In July》（2025） — https://www.uploadvr.com/spatial-is-discontinuing-its-creator-platform-in-july/
37. GamesBeat《Roblox wants its upcoming Roblox Reality product to balance generative AI with creator control》（2026-05-04） — https://gamesbeat.com/roblox-wants-its-upcoming-roblox-reality-product-to-balance-generative-ai-with-creator-control/
38. ISMAR 2026 XWORLDS《The Web of Worlds: Towards A Referential Architecture for Open Spatial Worlds》（Fraunhofer） — https://websites.fraunhofer.de/xworlds26/2026_ISMAR_TheWebofWorlds-TowardsAReferentialArchitectureforOpenSpatialWorlds.pdf

### 7.3 媒体转述（仅用于交叉验证，不作单一依据）
39. Road to VR《Virtual Hangout 'Rec Room' is Permanently Closing in June, Assets Reportedly Acquired by Snap》 — https://roadtovr.com/rec-room-shutdown-snap-acquisition-2026/
40. VR陀螺《1.5 亿用户也救不了的 Rec Room 走向落幕》（2026-04-04） — https://www.vrtuoluo.net/544984.html
41. Hypergrid Business《Rec Room shuts down after decade and 150 million players》（2026-03，引 GeekWire） — https://www.hypergridbusiness.com/2026/03/rec-room-shuts-down-after-decade-and-150-million-players/
42. VR陀螺《Meta 撤回 VR 版 Horizon Worlds 停运计划》 — https://vrtuoluo.net/544897.html
43. BlockTempo《Meta 關閉 Horizon Worlds VR「祖克柏夢碎」》（2026-03-19） — https://www.blocktempo.com/meta-horizon-worlds-vr-shutdown-835-billion-loss-zuckerberg-metaverse-ends/
44. VR陀螺《在线人数新高、老牌平台重启，VR 社交还没有结束》（2026-09） — https://www.vrtuoluo.net/545929.html
45. 智东西/36Kr《估值 95 亿，黄仁勋投了一家世界模型创企》（2026-06-18，引 FT） — https://eu.36kr.com/zh/p/3858479782138886
46. Tokenhell《Game Engine Developer Webaverse Suffers A Major Hack》（2023-02-08） — https://tokenhell.com/game-engine-developer-webaverse-suffers-a-major-hack/
47. Wikipedia · AltspaceVR — https://en.wikipedia.org/wiki/AltspaceVR
48. CMSWire《The Metaverse Is Making a Comeback — Just Not the One We Expected》 — https://www.cmswire.com/customer-experience/is-the-metaverse-making-a-comeback-in-agentic-commerce/
49. VR陀螺《陀螺研究院发布〈2026 年上半年全球 VR/AR 产业发展报告〉》 — https://www.vrtuoluo.net/545970.html
50. 36Kr/VR陀螺 2026 年 9 月 VR/AR 与 AI 眼镜行业月报（月融资额与新品数） — https://www.vrtuoluo.net/546196.html

---

### 附录 A：调研结论与 choroweave 阶段口径（P0–P4）的对应

| 阶段 | 本报告最相关的调研结论 | 行动建议 |
|---|---|---|
| **P0** 协议验证 | Hubs 社区版"能部署但互不连通"（fork/star 0.38、1,224 open issues）；OMI `OMI_link` 扩展已归档；MSF WoW / X3D Anchor 已给出语义 | 只做"两个自托管节点 + 一扇门"的最小验证；SHP 字段直接映射 X3D Anchor/Inline；不引入 AI |
| **P1** 编译器 MVP | Astrocade 证明"意图→可玩"需求真实（8 个月 5M MAU），但被批"demo 聚合体"；Roblox Cube 的 **schema + 脚本重定向** 是"可交互"的工程关键 | 编译管线必须产出"可交互契约"而不只是几何；评测集按"是否可玩 / 可否互跳"打分，而非只看画面 |
| **P2** 多人网络 | Rec Room 的 30¢/70¢ 与付费率 <2%；Spatial 的托管成本公开信；VRChat 的"小群 + 强关系"（25 万社区 / 100 万 MAU） | 房间服务做成**可选增强**（纯静态 HTTPS 也能进世界）；成本模型按"节点自付"设计，不做中心化抽成 |
| **P3** 生态与智能体 | Hyperfy 证明自托管需求真实但无网络效应；Bitmagic 证明 agent-first 工作流已成立；世界模型（Marble / Odyssey / Waypoint）应作为资产上游 | 建"世界索引 / 发现"层（协议缺失的那一环）；世界模型只作为可选资产 provider，不进运行时 |
| **P4** 沉浸与标准化 | IDC：2025 头显 -42.8%；Steam Frame 首发 5.49% 说明"开放 PC VR"是小窗口而非主战场；visionOS Safari 支持 WebXR | WebXR 适配优先级低于"任意浏览器可进入"；标准路线走 `CHW_` → OMI Stage 1 → MSF / X3D WoW |

> **与其他文档的一致性**：本报告的"引擎持状态、模型只生成像素"判断与 `_writing-spec.md` §7 第 10 条（HY-World 2.0 / Marble / Matrix-Game 4.0）以及 `docs/research/03-runtime-standards.md` 的 MSF WoW / KHR_interactivity 结论一致；SHP 与 X3D Anchor/Inline 的映射细节由 `04-spatial-hyperlink-protocol.md` 展开。

### 附录 B：一句话备忘
- **规模在，商业模式不在**：Roblox / Fortnite / Minecraft / VRChat 的用户数证明"3D 空间"有需求；Rec Room / Hubs / Spatial / Horizon 的死亡证明"中心化托管 + 亏损换规模"不可持续。
- **硬件在退，入口在变**：头显 -42.8%，智能眼镜 +211%；Steam Frame 是唯一正向变量。
- **生成在贬值，互联在升值**：世界模型融资额是"连接层"的 100 倍，但连接层才是空位。
- **choroweave 的一句话定位**：世界的 DNS + HTTP，而不是又一个世界。
