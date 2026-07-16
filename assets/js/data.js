/*
 * AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY.
 *
 * Edit data/catalog.json and data/papers/*.json, then run:
 * python3 scripts/sync_catalog.py
 * The wrapper keeps the static site compatible with direct file:// access.
 */
window.SD_ATLAS_DATA = {
  "schemaVersion": 4,
  "meta": {
    "title": "Speculative Decoding Atlas",
    "shortTitle": "SDAtlas",
    "subtitle": "投机解码研究子问题图谱",
    "updated": "2026-07",
    "catalogFile": "data/catalog.generated.json",
    "paperDirectory": "data/papers",
    "paperTemplate": "data/paper-template.json",
    "citationScope": "引用关系仅记录当前图谱收录论文之间、经论文正文或参考文献核实的有向边。"
  },
  "subproblems": [
    {
      "code": "A",
      "id": "draft-generation",
      "name": "Draft 生成与建模",
      "shortName": "Draft 生成",
      "question": "怎样以更低开销产生更准确的候选 Token？",
      "description": "关注 Drafter 架构、特征条件、并行生成方式与候选分布建模；Training 目标本身归入 E。",
      "color": "#d95f45",
      "softColor": "#f8ddd4"
    },
    {
      "code": "B",
      "id": "candidate-organization",
      "name": "候选组织与树搜索",
      "shortName": "候选组织",
      "question": "怎样把有限候选预算分配给更可能被接受的路径？",
      "description": "关注候选块、Token Tree、路径评分、扩树与剪枝，使一次 Verify 覆盖更多高价值分支。",
      "color": "#238077",
      "softColor": "#d6ece8"
    },
    {
      "code": "C",
      "id": "verification",
      "name": "Verify 策略与效率",
      "shortName": "Verify",
      "question": "怎样减少无效 Verify 并保持正确的接受与采样语义？",
      "description": "专门关注 Verify 的输入组织、动态长度、节点预算、接受规则、状态同步与输出等价性。",
      "color": "#3c5fa5",
      "softColor": "#dce4f5"
    },
    {
      "code": "D",
      "id": "systems-optimization",
      "name": "系统优化",
      "shortName": "系统优化",
      "question": "怎样把算法收益转化为硬件和服务环境中的端到端加速？",
      "description": "关注流水线、Batch、调度、内存与 KV Cache、设备映射、运行时实现及硬件适配。",
      "color": "#2f708c",
      "softColor": "#d9eaf0"
    },
    {
      "code": "E",
      "id": "training-optimization",
      "name": "Training 优化",
      "shortName": "Training",
      "question": "怎样通过目标、数据与训练策略提升 Drafter 的能力和稳定性？",
      "description": "关注蒸馏、多 Token 目标、数据构造、损失设计、课程学习、稳定化与低成本 Training。",
      "color": "#8255a2",
      "softColor": "#eadff0"
    }
  ],
  "papers": [
    {
      "id": "medusa",
      "index": 1,
      "title": "Medusa: Simple LLM Inference Acceleration Framework with Multiple Decoding Heads",
      "shortName": "Medusa",
      "authors": [
        "Tianle Cai",
        "Yuhong Li",
        "Zhengyang Geng",
        "Hongwu Peng",
        "Jason D. Lee",
        "Deming Chen",
        "Tri Dao"
      ],
      "methodOverview": "在冻结的 Target 上增加多个并行预测未来 Token 的 Head，将各 Head 的候选组合成 Token Tree，再用一次 Tree Attention 完成 Verify。它省去了独立 Drafter，可直观理解为让同一个模型一次提出多条短续写，再统一验收。",
      "notes": [],
      "institutionDetails": [
        {
          "name": "普林斯顿大学",
          "order": 1,
          "explanation": "共同一作及资深作者所属单位，列为主要贡献单位。"
        },
        {
          "name": "Together AI",
          "order": 1,
          "explanation": "共同一作及资深作者所属单位，列为主要贡献单位。"
        },
        {
          "name": "伊利诺伊大学厄巴纳-香槟分校",
          "order": 2,
          "explanation": "共同一作及资深作者所属单位，列为第二顺位。"
        },
        {
          "name": "卡内基梅隆大学",
          "order": 3,
          "explanation": "其他作者所属单位。"
        },
        {
          "name": "康涅狄格大学",
          "order": 4,
          "explanation": "其他作者所属单位。"
        }
      ],
      "institutionSource": "https://arxiv.org/pdf/2401.10774",
      "subproblemContributions": {
        "A": {
          "summary": "在 Target 最后一层隐藏状态上挂接 K 个带 SiLU 与残差连接的单层 Head，第 k 个 Head 直接预测第 t+k+1 个 Token；它们复用同一份 Target 表征，与原 LM Head 一起并行提出 K+1 个位置，无需维护独立 Drafter。",
          "detail": "在 Target 最后一层隐藏状态上挂接 K 个带 SiLU 与残差连接的单层 Head，第 k 个 Head 直接预测第 t+k+1 个 Token；它们复用同一份 Target 表征，与原 LM Head 一起并行提出 K+1 个位置，无需维护独立 Drafter。Medusa-1 冻结 Target 只训练 Heads，Medusa-2 则以专门的联合微调配方进一步提高远期预测准确率。\n\nK 个轻量 Head 直接读取同一个 Target 隐藏状态，并行给出多个远期 Token 分布，以一次共享主干计算替代独立 Drafter 的逐 Token 前向。Target 处理候选树所得的隐藏状态又可直接供下一轮 Heads 生成候选，避免重复提取主干特征。\n\n各未来位置不只保留单个预测，而是让多个高概率候选竞争最长可接受前缀；可采用严格 rejection sampling 保持 Target 分布，也可用 Target 条件概率与熵共同设阈值的 typical acceptance 接纳合理 Token，在允许近似采样时换取更长的接受序列。"
        },
        "B": {
          "summary": "每个 Head 保留 top-s_k 预测，并按未来位置的笛卡尔积自顶向下组成共享前缀的 Token Tree；Tree Attention 只允许节点关注其祖先并相应重设位置编码，使 Target 一次前向即可并行 Verify 多条候选路径。",
          "detail": "每个 Head 保留 top-s_k 预测，并按未来位置的笛卡尔积自顶向下组成共享前缀的 Token Tree；Tree Attention 只允许节点关注其祖先并相应重设位置编码，使 Target 一次前向即可并行 Verify 多条候选路径。论文还用校准集估计不同 Head、不同预测名次的准确率，在节点预算内构造非均匀稀疏树，以提高期望接受长度。\n\n先在校准集上统计第 k 个 Head 的第 i 名预测的单项准确率，再把一条路径的准确率近似为沿途节点准确率之积。构树时从根开始反复加入与当前树相连且估计准确率最高的节点，从而在相同节点预算内得到偏向高命中路径的稀疏树。"
        },
        "C": {
          "summary": "Tree Attention 只允许候选节点关注其祖先并重设位置编码，使 Target 一次前向即可并行 Verify 多条路径；严格 rejection sampling 可保持 Target 分布，typical acceptance 则在允许近似采样时换取更长接受序列。",
          "detail": "Tree Attention 只允许候选节点关注其祖先并重设位置编码，使 Target 一次前向即可并行 Verify 多条路径；严格 rejection sampling 可保持 Target 分布，typical acceptance 则在允许近似采样时换取更长接受序列。"
        },
        "E": {
          "summary": "Medusa-1 冻结 Target，对各未来偏移的交叉熵按 λ_k（实践中取 0.8^k）加权；Medusa-2 再加入原始 next-token 损失，并以差分学习率和先 Heads、后联合的 warmup 防止破坏 Target 能力。",
          "detail": "Medusa-1 冻结 Target，对各未来偏移的交叉熵按 λ_k（实践中取 0.8^k）加权；Medusa-2 再加入原始 next-token 损失，并以差分学习率和先 Heads、后联合的 warmup 防止破坏 Target 能力。缺少原训练数据时，可让 Target 自生成响应训练 Heads，并用原模型分布到当前主干分布的 KL 项进行自蒸馏。"
        }
      },
      "citations": [
        "specinfer"
      ],
      "venue": "ICML 2024",
      "date": "2024-01",
      "url": "https://proceedings.mlr.press/v235/cai24b.html",
      "provenance": {
        "legacyWorkbookRow": 1,
        "workbookInstitutions": "美国卡内基梅隆大学（CMU）、Meta"
      },
      "localPdf": "../Reference/Medusa.pdf",
      "subproblemCodes": [
        "A",
        "B",
        "C",
        "E"
      ],
      "institutions": "普林斯顿大学、Together AI → 伊利诺伊大学厄巴纳-香槟分校 → 卡内基梅隆大学 → 康涅狄格大学",
      "citedBy": [
        "mtp",
        "eagle",
        "eagle-2",
        "eagle-3",
        "beagle",
        "pard",
        "diffuspec",
        "dflash",
        "dflare",
        "domino",
        "dspark",
        "opt-tree",
        "dart",
        "ddtree",
        "taps",
        "smart",
        "ptd",
        "speculative-speculative-decoding",
        "batch-speculative-decoding-done-right",
        "specextend",
        "openpangu-npu-speculative-decoding",
        "lever"
      ]
    },
    {
      "id": "mtp",
      "index": 2,
      "title": "Better & Faster Large Language Models via Multi-token Prediction",
      "shortName": "MTP",
      "authors": [
        "Fabian Gloeckle",
        "Badr Youbi Idrissi",
        "Baptiste Rozière",
        "David Lopez-Paz",
        "Gabriel Synnaeve"
      ],
      "methodOverview": "在共享主干上设置多个相互独立的预测 Head，同时预测接下来的若干 Token。多 Token Training 目标既能强化中间表示，也让模型具备用于自投机解码的并行未来预测能力。",
      "notes": [],
      "institutionDetails": [
        {
          "name": "Meta FAIR",
          "order": 1,
          "explanation": "全部作者的主要单位。"
        },
        {
          "name": "巴黎高科路桥学院 CERMICS",
          "order": 2,
          "explanation": "其中一位共同一作的联合单位。"
        },
        {
          "name": "巴黎萨克雷大学 LISN",
          "order": 3,
          "explanation": "其中一位共同一作的联合单位。"
        }
      ],
      "institutionSource": "https://arxiv.org/pdf/2404.19737",
      "subproblemContributions": {
        "A": {
          "summary": "以共享 Transformer 主干、n 个独立 Transformer 层预测 Head 和共享 unembedding 矩阵组成多 Token 预测器，每个 Head 从同一上下文表征预测第 i 个未来 Token。",
          "detail": "以共享 Transformer 主干、n 个独立 Transformer 层预测 Head 和共享 unembedding 矩阵组成多 Token 预测器，每个 Head 从同一上下文表征预测第 i 个未来 Token。训练时把这些未来位置纳入预训练目标；推理时既可丢弃附加 Heads 按普通 next-token 模式运行，也可保留它们执行 greedy 自投机解码。\n\n一次主干前向产生共享上下文表征，n 个独立 Head 随后并行提出连续未来位置，无需额外 Drafter；主 next-token Head 再并行 Verify 这段块候选。该自投机路径在保留完整 Target 能力的同时，把原本串行的多步生成合并为更少的模型前向。\n\n附加 Heads 不是在既有 next-token 模型上事后拟合，而是在预训练阶段与主干共同学习全部未来目标，因此远期 Head 的候选准确率更高。多 Token 目标还强化对长程依赖和关键 choice point 的建模，在大模型及代码生成中尤其改善候选质量。"
        },
        "B": {
          "summary": "各 Head 的 top-1 预测可组成长度为 n 的块候选，供论文实际采用的 greedy blockwise 自投机解码一次并行 Verify。",
          "detail": "各 Head 的 top-1 预测可组成长度为 n 的块候选，供论文实际采用的 greedy blockwise 自投机解码一次并行 Verify。论文也明确这些 Heads 可将各位置的 top-k 输出接入 Medusa 式 Tree Attention，但候选树算法本身并非该工作的新增机制。"
        },
        "E": {
          "summary": "在每个语料位置，对 n 个未来 Token 的独立条件分布求交叉熵之和，并让所有目标共同反向更新共享主干，使训练信号不再只偏向局部 next-token 模式。",
          "detail": "在每个语料位置，对 n 个未来 Token 的独立条件分布求交叉熵之和，并让所有目标共同反向更新共享主干，使训练信号不再只偏向局部 next-token 模式。训练实现依次执行各 Head 的前向与反向、累计主干梯度并及时释放词表 logits，把峰值显存从 O(nV+d) 降至 O(V+d)，且不增加训练时长。"
        }
      },
      "citations": [
        "medusa"
      ],
      "venue": "ICML 2024",
      "date": "2024-04",
      "url": "https://proceedings.mlr.press/v235/gloeckle24a.html",
      "provenance": {
        "legacyWorkbookRow": 2,
        "workbookInstitutions": "Meta FAIR"
      },
      "localPdf": "../Reference/MTP.pdf",
      "subproblemCodes": [
        "A",
        "B",
        "E"
      ],
      "institutions": "Meta FAIR → 巴黎高科路桥学院 CERMICS → 巴黎萨克雷大学 LISN",
      "citedBy": [
        "pard",
        "dflare",
        "dspark"
      ]
    },
    {
      "id": "eagle",
      "index": 3,
      "title": "EAGLE: Speculative Sampling Requires Rethinking Feature Uncertainty",
      "shortName": "EAGLE",
      "authors": [
        "Yuhui Li",
        "Fangyun Wei",
        "Chao Zhang",
        "Hongyang Zhang"
      ],
      "methodOverview": "不直接在离散 Token 空间 Draft，而是在 Target 倒数第二层的 Feature 空间自回归预测；同时引入错位一个位置的 Token 序列来消除 Feature 不确定性，最后再把 Feature 映射回 Token。",
      "notes": [],
      "institutionDetails": [
        {
          "name": "北京大学",
          "order": 1,
          "explanation": "一作及主要作者所属单位。"
        },
        {
          "name": "滑铁卢大学",
          "order": 2,
          "explanation": "通讯作者所属单位。"
        },
        {
          "name": "Vector Institute",
          "order": 2,
          "explanation": "通讯作者所属单位。"
        },
        {
          "name": "微软研究院",
          "order": 3,
          "explanation": "其他作者所属单位。"
        }
      ],
      "institutionSource": "https://arxiv.org/pdf/2401.15077",
      "subproblemContributions": {
        "A": {
          "summary": "冻结整个 Target，复用其 Embedding 与 LM Head；将 LM Head 前的 Feature 和向前错一位的已采样 Token embedding 拼接，经 FC 降维与单个 Transformer decoder layer 自回归预测下一 Feature，再由 Target LM Head 采样 Draft Token。",
          "detail": "冻结整个 Target，复用其 Embedding 与 LM Head；将 LM Head 前的 Feature 和向前错一位的已采样 Token embedding 拼接，经 FC 降维与单个 Transformer decoder layer 自回归预测下一 Feature，再由 Target LM Head 采样 Draft Token。预测 Feature 与实际采样 Token 会回灌下一步，使这个轻量 Drafter 能连续外推 Target 的内部状态，同时显式消除采样结果带来的 Feature 分支歧义。\n\nFeature 序列比离散 Token 序列更规则，但下一 Feature 取决于上一步究竟采样了哪个 Token；把提前一步的真实采样结果作为条件后，同一 Feature 上下文的多分支不确定性被转化为更确定的回归问题。预测 Feature 再复用 Target LM Head 生成候选分布，显著提高 Draft 接受率。"
        },
        "E": {
          "summary": "只训练轻量 Autoregression Head：以 Smooth L1 回归 Target 的下一 Feature，并用 0.1 权重的交叉熵对齐真实与预测 Feature 经 Target LM Head 得到的 Token 分布。",
          "detail": "只训练轻量 Autoregression Head：以 Smooth L1 回归 Target 的下一 Feature，并用 0.1 权重的交叉熵对齐真实与预测 Feature 经 Target LM Head 得到的 Token 分布。训练时向 Target Feature 注入 U(-0.1, 0.1) 均匀噪声以模拟多步 Draft 的误差累积；使用固定 ShareGPT 数据即可训练，无需为每个 Target 另行生成蒸馏答案。"
        }
      },
      "citations": [
        "medusa",
        "specinfer"
      ],
      "venue": "ICML 2024",
      "date": "2024-01",
      "url": "https://proceedings.mlr.press/v235/li24bt.html",
      "provenance": {
        "legacyWorkbookRow": 3,
        "workbookInstitutions": "清华大学、美国加州大学圣塔芭芭拉分校（UCSB）"
      },
      "localPdfNote": "Reference/EAGLE.pdf 实际是 Fused3S 论文，与本条标题不一致，因此不提供错误的本地链接。",
      "subproblemCodes": [
        "A",
        "E"
      ],
      "institutions": "北京大学 → 滑铁卢大学、Vector Institute → 微软研究院",
      "citedBy": [
        "eagle-2",
        "eagle-3",
        "beagle",
        "pard",
        "diffuspec",
        "specdiff-2",
        "dflash",
        "dflare",
        "domino",
        "dspark",
        "opt-tree",
        "dart",
        "ddtree",
        "taps",
        "smart",
        "ptd",
        "speculative-speculative-decoding",
        "batch-speculative-decoding-done-right",
        "specextend",
        "openpangu-npu-speculative-decoding",
        "lever"
      ]
    },
    {
      "id": "eagle-2",
      "index": 4,
      "title": "EAGLE-2: Faster Inference of Language Models with Dynamic Draft Trees",
      "shortName": "EAGLE-2",
      "authors": [
        "Yuhui Li",
        "Fangyun Wei",
        "Chao Zhang",
        "Hongyang Zhang"
      ],
      "methodOverview": "根据当前上下文动态构造 Draft Tree。每条路径的价值由沿途 Token 置信度连乘得到，算法先扩展高价值节点，再从全局保留固定预算内、前缀闭合的最优树。",
      "notes": [],
      "institutionDetails": [
        {
          "name": "北京大学",
          "order": 1,
          "explanation": "一作及主要作者所属单位。"
        },
        {
          "name": "滑铁卢大学",
          "order": 2,
          "explanation": "通讯作者所属单位。"
        },
        {
          "name": "Vector Institute",
          "order": 2,
          "explanation": "通讯作者所属单位。"
        },
        {
          "name": "微软研究院",
          "order": 3,
          "explanation": "其他作者所属单位。"
        }
      ],
      "institutionSource": "https://arxiv.org/pdf/2406.16858",
      "subproblemContributions": {
        "B": {
          "summary": "保持 EAGLE 的特征级 Drafter、训练和推理方式不变，利用其校准良好的 Token 置信度作为接受率的低成本代理。",
          "detail": "保持 EAGLE 的特征级 Drafter、训练和推理方式不变，利用其校准良好的 Token 置信度作为接受率的低成本代理。EAGLE-2 将节点自身与所有祖先的置信度连乘为 path value，近似该 Token 连同全部前缀最终被接受的概率，因此无需额外树策略模型或再训练即可进行上下文感知的 Draft 选择。\n\n扩树阶段每轮通过 Tree Attention 并行展开当前层 path value 最高的 top-k 节点，让树形随上下文难度而变化；多轮扩展后，再对全树节点按 path value 全局重排并保留 top-m，避免深层已扩节点挤掉更有价值的浅层节点。由于子节点 value 不超过父节点，所选节点天然保持连通，随后可展平并用祖先可见掩码交给 Target 一次 Verify。\n\nEAGLE Drafter 的局部置信度与实际接受率高度校准，但单节点置信度没有计入前缀被拒后整条后缀失效的风险。EAGLE-2 因而用沿根路径的置信度乘积评估全局接受概率，优先保留每一级前缀都更可能命中的分支。\n\n把固定 Draft Tree 改成“按层扩展、全树重排”的两阶段动态树：先按 path value 选择当前层 top-k 节点继续生长，再从所有深度选出全局 top-m 节点；value 相同则优先浅节点。该规则在固定树节点数下随上下文重新分配分支宽度和深度，并保证最终候选仍是一棵连通树。"
        },
        "C": {
          "summary": "全局重排只让 path value 最高的 m 个连通节点进入 Verify，低收益分支不会占用 Target 的节点预算；展平后构造 Tree Attention 掩码，使每个 Token 仅能看到祖先并由 Target 一次并行处理。",
          "detail": "全局重排只让 path value 最高的 m 个连通节点进入 Verify，低收益分支不会占用 Target 的节点预算；展平后构造 Tree Attention 掩码，使每个 Token 仅能看到祖先并由 Target 一次并行处理。接受阶段仍沿用标准投机解码的 rejection sampling 规则且不放宽条件，因此动态选树不改变 Target 的输出分布。"
        }
      },
      "citations": [
        "medusa",
        "eagle"
      ],
      "venue": "EMNLP 2024",
      "date": "2024-06",
      "url": "https://aclanthology.org/2024.emnlp-main.422/",
      "provenance": {
        "legacyWorkbookRow": 4,
        "workbookInstitutions": "清华大学、美国加州大学圣塔芭芭拉分校（UCSB）"
      },
      "localPdf": "../Reference/EAGLE2.pdf",
      "subproblemCodes": [
        "B",
        "C"
      ],
      "institutions": "北京大学 → 滑铁卢大学、Vector Institute → 微软研究院",
      "citedBy": [
        "eagle-3",
        "beagle",
        "pard",
        "diffuspec",
        "specdiff-2",
        "dflash",
        "dflare",
        "domino",
        "dspark",
        "dart",
        "ddtree",
        "taps",
        "smart",
        "ptd",
        "speculative-speculative-decoding",
        "batch-speculative-decoding-done-right",
        "specextend",
        "lever"
      ]
    },
    {
      "id": "eagle-3",
      "index": 5,
      "title": "EAGLE-3: Scaling up Inference Acceleration of Large Language Models via Training-Time Test",
      "shortName": "EAGLE-3",
      "authors": [
        "Yuhui Li",
        "Fangyun Wei",
        "Chao Zhang",
        "Hongyang Zhang"
      ],
      "methodOverview": "从 Feature 回归转为直接预测 Token，并融合 Target 的浅层、中层和深层 Feature。Training-Time Test 在 Training 时模拟多步 Rollout，使训练分布更贴近真正的投机解码过程。",
      "notes": [],
      "institutionDetails": [
        {
          "name": "北京大学",
          "order": 1,
          "explanation": "一作的双重单位之一，与滑铁卢大学共同主导。"
        },
        {
          "name": "滑铁卢大学",
          "order": 1,
          "explanation": "一作的双重单位之一，与北京大学共同主导。"
        },
        {
          "name": "Vector Institute",
          "order": 2,
          "explanation": "作者单位之一，按给定口径列于共同主导单位之后。"
        },
        {
          "name": "微软研究院",
          "order": 3,
          "explanation": "其他作者所属单位。"
        }
      ],
      "institutionSource": "https://proceedings.neurips.cc/paper_files/paper/2025/hash/c7b5a35ea98b62512a869c19ea7b03cb-Abstract-Conference.html",
      "subproblemContributions": {
        "A": {
          "summary": "针对 EAGLE 的特征回归约束限制模型表达能力与数据扩展收益的问题，EAGLE-3 去掉特征预测损失，让单层 Transformer Drafter 直接预测 Token，并将 Target 低、中、高层隐状态拼接后经全连接层融合为输入。",
          "detail": "针对 EAGLE 的特征回归约束限制模型表达能力与数据扩展收益的问题，EAGLE-3 去掉特征预测损失，让单层 Transformer Drafter 直接预测 Token，并将 Target 低、中、高层隐状态拼接后经全连接层融合为输入。训练时再回灌 Drafter 自身输出、用特制注意力掩码模拟多步 Rollout，使这一特征融合结构能适应真实的自回归 Draft。\n\n摆脱必须拟合 Target 顶层特征的约束后，Drafter 可直接为 Token 预测优化；同时融合低、中、高层语义，避免只用偏向下一 Token Logit 的顶层特征来预测更远位置。更高且随 Rollout 步数基本稳定的接受率还允许把动态 Draft Tree 深度由 6 提至 8。"
        },
        "E": {
          "summary": "Training-Time Test 在训练中把每轮 Drafter 输出作为下一轮输入，并用树状依赖注意力掩码一次模拟 5 步推理，以训练数据 Token 监督各步预测。",
          "detail": "Training-Time Test 在训练中把每轮 Drafter 输出作为下一轮输入，并用树状依赖注意力掩码一次模拟 5 步推理，以训练数据 Token 监督各步预测。该目标移除特征回归损失后可从扩大的 ShareGPT、UltraChat 等数据持续获益，论文使用约为 EAGLE 8 倍的数据观察到此前架构没有的数据扩展规律。"
        }
      },
      "citations": [
        "medusa",
        "eagle",
        "eagle-2"
      ],
      "venue": "NeurIPS 2025",
      "date": "2025-03",
      "url": "https://proceedings.neurips.cc/paper_files/paper/2025/hash/c7b5a35ea98b62512a869c19ea7b03cb-Abstract-Conference.html",
      "provenance": {
        "legacyWorkbookRow": 5,
        "workbookInstitutions": "清华大学"
      },
      "localPdf": "../Reference/EAGLE3.pdf",
      "subproblemCodes": [
        "A",
        "E"
      ],
      "institutions": "北京大学、滑铁卢大学 → Vector Institute → 微软研究院",
      "citedBy": [
        "beagle",
        "pard",
        "diffuspec",
        "specdiff-2",
        "dflash",
        "dflare",
        "domino",
        "dspark",
        "dart",
        "ddtree",
        "taps",
        "smart",
        "speculative-speculative-decoding",
        "batch-speculative-decoding-done-right",
        "specextend",
        "lever"
      ]
    },
    {
      "id": "beagle",
      "index": 6,
      "title": "Cross-Attention Speculative Decoding",
      "shortName": "Beagle / Budget EAGLE",
      "authors": [
        "Wei Zhong",
        "Manasa Bharadwaj",
        "Yixiao Wang",
        "Yipeng Ji",
        "Chul Lee"
      ],
      "methodOverview": "让 Drafter 通过 Cross-Attention 读取固定的 Target 上下文，而不是依赖紧耦合的 Self-Attention 或逐层 Feature 融合。两阶段 Block-Attention Training 降低多步模拟的显存开销。",
      "notes": [],
      "institutionDetails": [
        {
          "name": "LG电子多伦多人工智能实验室",
          "order": 1,
          "explanation": "全部作者均来自该实验室。"
        }
      ],
      "institutionSource": "https://arxiv.org/html/2505.24544v3",
      "subproblemContributions": {
        "A": {
          "summary": "Beagle 用单层 Cross-Attention 加 MLP 构造 Drafter：当前 Token Embedding 形成 Query，Target 顶层隐状态或 Drafter 自回归产生的状态形成 Key/Value，并以遮蔽对角线及未来位置的因果掩码生成候选。",
          "detail": "Beagle 用单层 Cross-Attention 加 MLP 构造 Drafter：当前 Token Embedding 形成 Query，Target 顶层隐状态或 Drafter 自回归产生的状态形成 Key/Value，并以遮蔽对角线及未来位置的因果掩码生成候选。Query 与 Key/Value 分处低、高层表示空间，因此无需 EAGLE 式池化、特征复制与拼接；推理时追加缓存的 Key/Value，并沿用 EAGLE-2 的动态 Draft Tree。\n\n去掉自注意力子层、辅助池化/融合层以及高层状态的反复复制拼接，既减少注意力参数与训练开销，也改善推理时的内存局部性。Drafter 只需缓存并追加 Cross-Attention 的 Key/Value，在每轮投机解码结束后恢复为 Target 的真实状态。\n\n早期训练用逆 Block-Attention 同时预测多个未来 Token，把更远位置的信息压入 Drafter 状态；后期则回灌自预测 Key/Value，按真实自回归路径优化即时下一 Token。两阶段分别改善后续位置与中段 Token 的接受率，使简化后的 Cross-Attention Drafter 在相同 ShareGPT 数据规模上达到与 EAGLE-v2 相当的接受长度。"
        },
        "E": {
          "summary": "前 10 个 Epoch 以局部未来 Key 全遮蔽的 Block-Attention 并行优化多 Token 目标，后 10 个 Epoch 原位更新自预测 Key 并按接受长度对逐步损失加权；两阶段还保留隐状态蒸馏正则以稳定收敛。",
          "detail": "前 10 个 Epoch 以局部未来 Key 全遮蔽的 Block-Attention 并行优化多 Token 目标，后 10 个 Epoch 原位更新自预测 Key 并按接受长度对逐步损失加权；两阶段还保留隐状态蒸馏正则以稳定收敛。Cross-Attention 模拟无需随步数展开新的 Query，因而保持近似常量训练显存，3 步模拟可在单张 24 GiB GPU 上训练 7B Target 的 Drafter。"
        }
      },
      "citations": [
        "medusa",
        "eagle",
        "eagle-2",
        "eagle-3",
        "specinfer"
      ],
      "venue": "arXiv",
      "date": "2025-05",
      "url": "https://arxiv.org/abs/2505.24544",
      "provenance": {
        "legacyWorkbookRow": 6,
        "workbookInstitutions": "清华大学"
      },
      "localPdf": "../Reference/BEAGLE.pdf",
      "subproblemCodes": [
        "A",
        "E"
      ],
      "institutions": "LG电子多伦多人工智能实验室",
      "citedBy": []
    },
    {
      "id": "pard",
      "index": 7,
      "title": "PARD: Accelerating LLM Inference with Low-Cost PARallel Draft Model Adaptation",
      "shortName": "PARD",
      "authors": [
        "Zihao An",
        "Huajun Bai",
        "Ziqiong Liu",
        "Dong Li",
        "Emad Barsoum"
      ],
      "methodOverview": "把已有小型自回归模型低成本改造成一次预测多个位置的并行 Drafter，使同一个 Drafter 可以服务一族 Target。Conditional Drop-token 在 Training 时跳过部分不必要 Token，同时维持 KV Prefix 的完整性。",
      "notes": [],
      "institutionDetails": [
        {
          "name": "AMD",
          "order": 1,
          "explanation": "全部作者的主要单位。"
        },
        {
          "name": "清华大学",
          "order": 2,
          "explanation": "共同一作胡佳俊的联合单位。"
        }
      ],
      "institutionSource": "https://arxiv.org/pdf/2504.18583",
      "subproblemContributions": {
        "A": {
          "summary": "PARD 从同系列中能力较强的小型自回归模型出发，用 Mask Token 代替块内的未来依赖，使各位置只条件于已知前缀和占位符，从而在一次 Drafter 前向中并行提出多个未来 Token。",
          "detail": "PARD 从同系列中能力较强的小型自回归模型出发，用 Mask Token 代替块内的未来依赖，使各位置只条件于已知前缀和占位符，从而在一次 Drafter 前向中并行提出多个未来 Token。它不读取 Target 特征，只需低成本适配系列中最小模型，一个 Drafter 即可复用于同系列不同规模的 Target；COD 训练又通过保留完整前缀 KV 状态把适配成本从 O(NK) 降至 O(N)。\n\n以共享 Mask Token 占据未来位置后，各候选之间不再互相依赖，K 个 Token 可由一次并行前向提出，将 Drafter 开销从 K 次前向的 K·T_D 降为 T_D。该设计的 Draft 显存带宽开销不随 K 增长，并可直接接入 vLLM 的链式投机解码。\n\nPARD 继承同系列预训练小模型的语言能力，而非从头训练轻量预测头；COD 优先保留更关键的近端预测并确保每个样本的前缀 KV 上下文完整，以在稀疏训练下维持多位置候选质量。所有位置共享同一 Mask Token 还比位置专属 ID 提高预测一致性，并支持推理时使用大于训练值的 Draft 长度。"
        },
        "E": {
          "summary": "Mask 训练原本要把长度 N 的样本展开为 K 个预测子任务；COD 对第 i 个子任务按 max(r^(i−1), r_min) 保留位置，且只保留拥有完整前缀 Key/Value 的 Token，将训练量压到小于 N/(1−r)。",
          "detail": "Mask 训练原本要把长度 N 的样本展开为 K 个预测子任务；COD 对第 i 个子任务按 max(r^(i−1), r_min) 保留位置，且只保留拥有完整前缀 Key/Value 的 Token，将训练量压到小于 N/(1−r)。论文采用 K=8、r=0.7、r_min=0.2，在不降低最终推理速度的前提下较完整 Mask 训练提速约 3 倍，并省去为每个 Target 分别训练 Drafter 的成本。"
        }
      },
      "citations": [
        "medusa",
        "mtp",
        "eagle",
        "eagle-2",
        "eagle-3",
        "specinfer"
      ],
      "venue": "ICLR 2026",
      "date": "2025-04",
      "url": "https://openreview.net/forum?id=XbOyv7iVGL",
      "provenance": {
        "legacyWorkbookRow": 7,
        "workbookInstitutions": "香港中文大学（深圳）、其他合作单位"
      },
      "localPdf": "../Reference/PARD.pdf",
      "subproblemCodes": [
        "A",
        "E"
      ],
      "institutions": "AMD → 清华大学",
      "citedBy": [
        "dflash",
        "domino",
        "dspark",
        "ddtree"
      ]
    },
    {
      "id": "diffuspec",
      "index": 8,
      "title": "DiffuSpec: Unlocking Diffusion Language Models for Speculative Decoding",
      "shortName": "DiffuSpec",
      "authors": [
        "Guanghao Li",
        "Zhihui Fu",
        "Min Fang",
        "Qibin Zhao",
        "Ming Tang",
        "Chun Yuan",
        "Jun Wang"
      ],
      "methodOverview": "复用预训练扩散语言模型，一次产生多个位置的候选 Token 网格；Causal-consistency Path Search 从中抽取满足自回归因果关系的路径，ADL 再根据历史接受情况动态调整 Draft 长度。",
      "notes": [],
      "institutionDetails": [
        {
          "name": "清华大学深圳国际研究生院",
          "order": 1,
          "explanation": "一作和通讯作者分布于两所主导单位，双方共同主导。"
        },
        {
          "name": "南方科技大学",
          "order": 1,
          "explanation": "一作和通讯作者分布于两所主导单位，双方共同主导。"
        },
        {
          "name": "OPPO研究院",
          "order": 2,
          "explanation": "其他作者所属单位。"
        }
      ],
      "institutionSource": "https://arxiv.org/pdf/2510.02358",
      "subproblemContributions": {
        "A": {
          "summary": "DiffuSpec 直接复用预训练扩散语言模型作为 Drafter，在前缀后追加 k 个 Mask，并以一次默认的去噪精炼前向同时产生各位置的候选分布与 Token Lattice，避免自回归 Drafter 为每个 Token 单独前向。",
          "detail": "DiffuSpec 直接复用预训练扩散语言模型作为 Drafter，在前缀后追加 k 个 Mask，并以一次默认的去噪精炼前向同时产生各位置的候选分布与 Token Lattice，避免自回归 Drafter 为每个 Token 单独前向。为接入标准投机采样，它通过遮蔽块内其余位置构造逐位置的左到右条件概率，Target 架构无需修改。\n\nDream-7B 等扩散 Drafter 可在一次去噪精炼前向中并行填充整个 Mask 块，无需按 Token 串行调用；现成 DLM 可作为插件替换标准接口中的自回归 Drafter。论文固定单步精炼，因为增加精炼步数虽能提高接受长度，却会以额外前向显著侵蚀实际吞吐。"
        },
        "B": {
          "summary": "CPS 从每个位置的 Top-M 候选出发，按累计概率质量自适应剪枝、始终保留 EOS，并在首个 EOS 处停止扩展；随后以 DLM Log 概率和 3-gram 因果分数的加权和进行左到右束搜索。",
          "detail": "CPS 从每个位置的 Top-M 候选出发，按累计概率质量自适应剪枝、始终保留 EOS，并在首个 EOS 处停止扩展；随后以 DLM Log 概率和 3-gram 因果分数的加权和进行左到右束搜索。它不把各位置边际 Top-1 生硬拼接，而是选择因果连贯路径，将 Drafter 与 AR Verifier 的首次失配推向更后位置。"
        },
        "C": {
          "summary": "ADL 分别对原始扩散候选首个 EOS 前的生成长度 L_gen 和 Verify 后的连续接受长度 L_acc 做指数滑动平均；当接受进度跟上生成进度时小幅扩长，否则按 L_gen 回缩，并把下一轮长度限制在预设上下界。",
          "detail": "ADL 分别对原始扩散候选首个 EOS 前的生成长度 L_gen 和 Verify 后的连续接受长度 L_acc 做指数滑动平均；当接受进度跟上生成进度时小幅扩长，否则按 L_gen 回缩，并把下一轮长度限制在预设上下界。这样可避开固定长 Draft 过短限制进度、过长产生漂移并增加无效 Verify 的两端浪费。"
        }
      },
      "citations": [
        "medusa",
        "eagle",
        "eagle-2",
        "eagle-3",
        "specinfer"
      ],
      "venue": "Findings of ACL 2026",
      "date": "2025-09",
      "url": "https://aclanthology.org/2026.findings-acl.1048/",
      "provenance": {
        "legacyWorkbookRow": 8,
        "workbookInstitutions": "香港中文大学（深圳）、其他合作单位"
      },
      "localPdf": "../Reference/DiffuSpec.pdf",
      "subproblemCodes": [
        "A",
        "B",
        "C"
      ],
      "institutions": "清华大学深圳国际研究生院、南方科技大学 → OPPO研究院",
      "citedBy": [
        "dflash",
        "dflare",
        "domino",
        "dspark",
        "dart",
        "speculative-speculative-decoding"
      ]
    },
    {
      "id": "specdiff-2",
      "index": 9,
      "title": "SpecDiff-2: Scaling Diffusion Drafter Alignment For Faster Speculative Decoding",
      "shortName": "SpecDiff-2",
      "authors": [
        "Jameson Sandler",
        "Jacob K. Christopher",
        "Thomas Hartvigsen",
        "Ferdinando Fioretto"
      ],
      "methodOverview": "使用离散扩散模型一次生成整个候选块，并通过 Streak-Distillation 或 Self-Selection 让冻结的自回归 Verifier 帮助校准 Drafter；推理时挑选预期接受长度最高的候选。",
      "notes": [],
      "institutionDetails": [
        {
          "name": "美国弗吉尼亚大学计算机科学系",
          "order": 1,
          "explanation": "全部作者均来自该单位。"
        }
      ],
      "institutionSource": "https://arxiv.org/pdf/2511.00606",
      "subproblemContributions": {
        "A": {
          "summary": "以预训练掩码离散扩散模型为 Drafter，在论文配置的一次去噪前向中并行输出 γ 个位置的边缘分布，使 Draft 时延主要取决于去噪步数而非候选长度。",
          "detail": "以预训练掩码离散扩散模型为 Drafter，在论文配置的一次去噪前向中并行输出 γ 个位置的边缘分布，使 Draft 时延主要取决于去噪步数而非候选长度。Streak-Distillation 用冻结 AR Verifier 的续写对整段可接受 Prefix 做训练对齐；推理时 Self-Selection 从同一组边缘分布采样 K 条候选，并按 Verifier 估计的期望接受 Token 数选择最佳路径。\n\n预训练掩码扩散 Drafter 对整段 Mask 窗口只做一次去噪前向，所有位置同时得到 Token 边缘分布；同一组分布还能近乎不增加神经网络前向成本地独立采样 K 条候选，消除自回归逐 Token Draft。"
        },
        "B": {
          "summary": "Self-Selection 从扩散边缘分布廉价采样 K 条候选，以 Tree-Style Attention 并行取得 Verifier 的逐 Prefix 概率，并按期望可接受 Token 数选择最佳路径后再执行无损 Verify，把额外 Verifier 计算直接换成更长的接受序列。",
          "detail": "Self-Selection 从扩散边缘分布廉价采样 K 条候选，以 Tree-Style Attention 并行取得 Verifier 的逐 Prefix 概率，并按期望可接受 Token 数选择最佳路径后再执行无损 Verify，把额外 Verifier 计算直接换成更长的接受序列。"
        },
        "E": {
          "summary": "冻结 Verifier，仅微调预训练扩散 Drafter；Streak-Distillation 在 Verifier 生成的教师续写上最大化各 Prefix 的 Draft 概率乘积之和，使目标直接对应期望连续接受 Token 数，而非逐位置平均对齐。",
          "detail": "冻结 Verifier，仅微调预训练扩散 Drafter；Streak-Distillation 在 Verifier 生成的教师续写上最大化各 Prefix 的 Draft 概率乘积之和，使目标直接对应期望连续接受 Token 数，而非逐位置平均对齐。Qwen 对齐语料由 Verifier 在 GSM8K、Alpaca 与 LiveCodeBench 提示上采样的续写混合而成。"
        }
      },
      "citations": [
        "eagle",
        "eagle-2",
        "eagle-3"
      ],
      "venue": "MLSys 2026",
      "date": "2025-11",
      "url": "https://arxiv.org/abs/2511.00606",
      "provenance": {
        "legacyWorkbookRow": 9,
        "workbookInstitutions": "美国加州大学圣塔芭芭拉分校（UCSB）等"
      },
      "localPdf": "../Reference/SpecDiff2.pdf",
      "subproblemCodes": [
        "A",
        "B",
        "E"
      ],
      "institutions": "美国弗吉尼亚大学计算机科学系",
      "citedBy": [
        "dflash",
        "dflare",
        "dspark",
        "dart"
      ]
    },
    {
      "id": "dflash",
      "index": 10,
      "title": "DFlash: Block Diffusion for Flash Speculative Decoding",
      "shortName": "DFlash",
      "authors": [
        "Jian Chen",
        "Yesheng Liang",
        "Zhijian Liu"
      ],
      "methodOverview": "轻量级 Block-Diffusion Drafter 用一次前向同时预测一个 Token Block，并注入由 Target 多层 KV 融合得到的上下文。位置加权 Training 重点保护靠前 Token。",
      "notes": [],
      "institutionDetails": [
        {
          "name": "美国加州大学圣迭戈分校（UC San Diego）",
          "order": 1,
          "explanation": "全部作者均来自该校。"
        }
      ],
      "institutionSource": "https://arxiv.org/pdf/2602.06036",
      "subproblemContributions": {
        "A": {
          "summary": "以 Target 每轮产生的 Decode Token 为干净锚点，轻量 Block-Diffusion Drafter 在一次双向块注意力前向中并行补全其后的 B−1 个 Mask Token；论文主要配置为 5 层、块长 16。",
          "detail": "以 Target 每轮产生的 Decode Token 为干净锚点，轻量 Block-Diffusion Drafter 在一次双向块注意力前向中并行补全其后的 B−1 个 Mask Token；论文主要配置为 5 层、块长 16。Target 前向时从浅到深均匀选取 5 层 Hidden State，经拼接投影后作为持久上下文注入每个 Drafter 层的 K/V，配合 Target 重生成响应、随机锚块和位置加权损失提高接受长度。\n\n每轮把上一轮 Target 产生的 Bonus Token 作为干净锚点，将其后 B−1 个位置全部置为 Mask，并由 Block-Diffusion Drafter 一次前向并行补全；Draft 成本不再随候选 Token 数线性增加，可在较深的 5 层 Drafter 上使用块长 16。\n\n从 Target 浅层到深层均匀选取 5 层 Hidden State，拼接压缩成上下文特征，并作为持久 K/V 注入每个 Drafter 层；相比只在输入端融合，这能避免 Target 信息随深度稀释，使轻量 Drafter 的接受长度随层数有效增长。"
        },
        "E": {
          "summary": "用 Nemotron Post-Training Dataset V2 与 CodeAlpaca 的约 80 万条提示，由各 Target 重新生成训练响应；每个序列随机采样锚点并遮蔽后续 B−1 个位置，以块间隔离、块内双向的 Sparse Attention 一次训练多个块。",
          "detail": "用 Nemotron Post-Training Dataset V2 与 CodeAlpaca 的约 80 万条提示，由各 Target 重新生成训练响应；每个序列随机采样锚点并遮蔽后续 B−1 个位置，以块间隔离、块内双向的 Sparse Attention 一次训练多个块。冻结共享的 Target Embedding 与 LM Head，仅更新 Drafter Transformer，并用随位置指数衰减的交叉熵强调会门控整段接受 Prefix 的前部 Token。"
        }
      },
      "citations": [
        "medusa",
        "eagle",
        "eagle-2",
        "eagle-3",
        "pard",
        "diffuspec",
        "specdiff-2"
      ],
      "venue": "ICML 2026",
      "date": "2026-02",
      "url": "https://arxiv.org/abs/2602.06036",
      "explanationPage": "explanations/DFlash.html",
      "provenance": {
        "legacyWorkbookRow": 10,
        "workbookInstitutions": "中国科学院计算技术研究所、其他合作单位"
      },
      "localPdf": "../Reference/DFlash.pdf",
      "subproblemCodes": [
        "A",
        "E"
      ],
      "institutions": "美国加州大学圣迭戈分校（UC San Diego）",
      "citedBy": [
        "dflare",
        "domino",
        "dspark",
        "ddtree",
        "taps",
        "smart",
        "speculative-speculative-decoding"
      ]
    },
    {
      "id": "dflare",
      "index": 11,
      "title": "DFlare: Scaling Up Draft Capacity for Block Diffusion Speculative Decoding",
      "shortName": "DFlare",
      "authors": [
        "Jiebin Zhang",
        "Zhenghan Yu",
        "Song Liu",
        "Eugene J. Yu",
        "Zheng Li",
        "Dawei Zhu",
        "Jiangshan Duo",
        "Weimin Xiong",
        "Yifan Song",
        "Guanghua Yu",
        "Jianchen Zhu",
        "Sujian Li"
      ],
      "methodOverview": "在 DFlash 基础上，让每个 Drafter Layer 从更广泛的 Target Layer 中学习独立融合权重，并使用异构 KV Projection；配合更深 Drafter、更多数据和渐进式损失提升容量。",
      "notes": [],
      "institutionDetails": [
        {
          "name": "北京大学计算机学院",
          "order": 1,
          "explanation": "一作、通讯作者及多数作者所属单位。"
        },
        {
          "name": "腾讯",
          "order": 2,
          "explanation": "其他作者所属单位。"
        }
      ],
      "institutionSource": "https://arxiv.org/pdf/2606.02091",
      "subproblemContributions": {
        "A": {
          "summary": "沿用 DFlash 的单次 Block-Diffusion Draft，但以 Adaptive Layer Fusion 为每个 Drafter 层学习一组 Softmax 标量权重，分别融合更广的 Target 层（Qwen 配置为 9 层），再用异构 K/V Projection 分离 Target 上下文与 Drafter 状态的表示空间。",
          "detail": "沿用 DFlash 的单次 Block-Diffusion Draft，但以 Adaptive Layer Fusion 为每个 Drafter 层学习一组 Softmax 标量权重，分别融合更广的 Target 层（Qwen 配置为 9 层），再用异构 K/V Projection 分离 Target 上下文与 Drafter 状态的表示空间。层特异条件使 Qwen Drafter 可稳定扩展到 7 层；约 240 万条 Target 重生成训练样本和渐进位置损失进一步释放扩容后的能力。\n\n保留锚 Token 后 B−1 个 Mask 位置一次前向补全的 Block-Diffusion 流程；Adaptive Layer Fusion 仅新增 D×T 个标量权重（7 层 Drafter、9 个 Target 层时为 63 个），归一化权重可在训练后预计算，因此丰富逐层条件几乎不增加推理时延。\n\n每个 Drafter 层对所选 Target Hidden State 学习独立的 Softmax 加权和并做 RMSNorm，同时为 Target 上下文和演化中的 Drafter 状态设置两套 K/V Projection；不同层因而能专门吸收不同深度的知识，避免 DFlash 共享 FC 特征造成的深度饱和。"
        },
        "E": {
          "summary": "将 Nemotron V2、CodeAlpaca 与 Step-3.5-Flash-SFT 扩展为约 240 万条提示，并用对应 Target 在温度 0.6 下重生成响应，训练规模是 DFlash 的 3 倍。",
          "detail": "将 Nemotron V2、CodeAlpaca 与 Step-3.5-Flash-SFT 扩展为约 240 万条提示，并用对应 Target 在温度 0.6 下重生成响应，训练规模是 DFlash 的 3 倍。Qwen 训练从 γ₀=4.5 逐步增大指数位置权重的衰减参数，先聚焦决定接受链的前部 Token，再逐渐提高困难后缀的训练权重。"
        }
      },
      "citations": [
        "medusa",
        "mtp",
        "eagle",
        "eagle-2",
        "eagle-3",
        "diffuspec",
        "specdiff-2",
        "dflash",
        "specinfer"
      ],
      "venue": "arXiv",
      "date": "2026-06",
      "url": "https://arxiv.org/abs/2606.02091",
      "provenance": {
        "legacyWorkbookRow": 11,
        "workbookInstitutions": "北京大学、腾讯"
      },
      "localPdf": "../Reference/DFlare.pdf",
      "subproblemCodes": [
        "A",
        "E"
      ],
      "institutions": "北京大学计算机学院 → 腾讯",
      "citedBy": [
        "dspark"
      ]
    },
    {
      "id": "domino",
      "index": 12,
      "title": "Domino: Decoupling Causal Modeling from Autoregressive Drafting in Speculative Decoding",
      "shortName": "Domino",
      "authors": [
        "Jianuo Huang",
        "Yaojie Zhang",
        "Qituan Zhang",
        "Hao Lin",
        "Hanlin Xu",
        "Linfeng Zhang"
      ],
      "methodOverview": "并行 Backbone 先给出整个 Block 的边缘分布，随后一个廉价的因果 Head 根据已经选中的 Prefix 逐步修正后续 Logit，相当于用一次并行预测打底，再用很小的串行模块恢复 Token 间依赖。",
      "notes": [],
      "institutionDetails": [
        {
          "name": "上海交通大学 EPIC Lab",
          "order": 1,
          "explanation": "两位共同一作和通讯作者所属单位。"
        },
        {
          "name": "华中科技大学软件学院",
          "order": 2,
          "explanation": "其他作者所属单位。"
        },
        {
          "name": "电子科技大学",
          "order": 3,
          "explanation": "其他作者所属单位。"
        },
        {
          "name": "复旦大学",
          "order": 4,
          "explanation": "其他作者所属单位。"
        },
        {
          "name": "华为",
          "order": 5,
          "explanation": "其他作者所属单位。"
        }
      ],
      "institutionSource": "https://arxiv.org/pdf/2605.29707",
      "subproblemContributions": {
        "A": {
          "summary": "以 5 层 DFlash 为并行 Backbone，在一次前向中为 16-Token 块生成 Hidden State，并通过冻结的 Target LM Head 得到 Base Logits；随后 1024 维 GRU 顺序汇总已选 Prefix Token，再由 256 维低秩头给每个位置添加 Logit 残差。",
          "detail": "以 5 层 DFlash 为并行 Backbone，在一次前向中为 16-Token 块生成 Hidden State，并通过冻结的 Target LM Head 得到 Base Logits；随后 1024 维 GRU 顺序汇总已选 Prefix Token，再由 256 维低秩头给每个位置添加 Logit 残差。这样只让轻量修正分支承担块内因果建模，配合 Teacher Forcing 与 Base-Anchored Curriculum 避免因果头绕过并拖垮并行 Backbone。\n\n昂贵的 5 层 Backbone 和全词表 Target LM Head 对整个块只并行执行一次，顺序部分仅保留 GRU 与低秩 Logit 残差头，避免逐 Token 重跑 Transformer 和完整 LM Head；融合 Triton Kernel 与 CUDA Graph 后，Domino Head 时延由 2.64 ms 降至 1.20 ms。\n\nGRU 将已经采样的 Prefix Token 编码为因果状态，低秩头据此计算 ΔLogits=W₂·SiLU(W₁[Hidden State; Causal State]) 并残差修正并行 Base Logits，使后续候选重新依赖块内 Prefix，而不牺牲 Backbone 的并行性。"
        },
        "D": {
          "summary": "通过融合 Triton Kernel 与 CUDA Graph 压低轻量顺序修正模块的运行时开销，使并行 Backbone 的算法优势能够转化为端到端加速。",
          "detail": "通过融合 Triton Kernel 与 CUDA Graph 压低轻量顺序修正模块的运行时开销，使并行 Backbone 的算法优势能够转化为端到端加速。"
        },
        "E": {
          "summary": "因果 Encoder 使用 Ground-Truth Prefix 的 Teacher Forcing，针对只有此前 Token 已被接受时才有意义的修正区间；同时令 L=(1−λₜ)L_final+λₜL_base 并将 λₜ 从 1 线性退火到 0，先稳固并行 Base Distribution、再学习最终残差，防止修正头走捷径导致 Backbone 崩塌。",
          "detail": "因果 Encoder 使用 Ground-Truth Prefix 的 Teacher Forcing，针对只有此前 Token 已被接受时才有意义的修正区间；同时令 L=(1−λₜ)L_final+λₜL_base 并将 λₜ 从 1 线性退火到 0，先稳固并行 Base Distribution、再学习最终残差，防止修正头走捷径导致 Backbone 崩塌。训练响应由冻结 Target 在 142 万条 PerfectBlend 提示上重新生成，两个损失都使用前重后轻的指数位置权重。"
        }
      },
      "citations": [
        "medusa",
        "eagle",
        "eagle-2",
        "eagle-3",
        "pard",
        "diffuspec",
        "dflash",
        "specinfer",
        "dart"
      ],
      "venue": "arXiv",
      "date": "2026-05",
      "url": "https://arxiv.org/abs/2605.29707",
      "provenance": {
        "legacyWorkbookRow": 12,
        "workbookInstitutions": "未知（arXiv作者团队）"
      },
      "localPdf": "../Reference/Domino.pdf",
      "subproblemCodes": [
        "A",
        "D",
        "E"
      ],
      "institutions": "上海交通大学 EPIC Lab → 华中科技大学软件学院 → 电子科技大学 → 复旦大学 → 华为",
      "citedBy": [
        "dspark"
      ]
    },
    {
      "id": "dspark",
      "index": 13,
      "title": "DSpark: Confidence-Scheduled Speculative Decoding with Semi-Autoregressive Generation",
      "shortName": "DSpark",
      "authors": [
        "Xin Cheng",
        "Xingkai Yu",
        "Chenze Shao",
        "Jiashi Li",
        "Yunfan Xiong",
        "Yi Qian",
        "Jiaqi Zhu",
        "Shirong Ma",
        "Xiaokang Zhang",
        "Jiasheng Ye",
        "Qinyu Chen",
        "Chengqi Deng",
        "Jiping Yu",
        "Damai Dai",
        "Zhengyan Zhang",
        "Yixuan Wei",
        "Yixuan Tan",
        "Wenkai Yang",
        "Runxin Xu",
        "Yu Wu",
        "Zhean Xu",
        "Xuanyu Wang",
        "Muyang Chen",
        "Rui Tian",
        "Xiao Bi",
        "Zhewen Hao",
        "Shaoyuan Chen",
        "Huanqi Cao",
        "Wentao Zhang",
        "Anyi Xu",
        "Huishuai Zhang",
        "Dongyan Zhao",
        "Wenfeng Liang"
      ],
      "methodOverview": "并行 Backbone 负责整体候选，廉价 Markov/RNN 串行模块补回 Prefix 依赖；额外的置信度 Head 估计 Prefix 能存活到多远，调度器再按实时负载和 SPS 为每个请求分配 Verify 长度。",
      "notes": [],
      "institutionDetails": [
        {
          "name": "深度求索（DeepSeek-AI）",
          "order": 1,
          "explanation": "五位共同一作中的四位、绝大多数作者及温风梁所属单位。"
        },
        {
          "name": "北京大学",
          "order": 2,
          "explanation": "其他作者所属单位。"
        }
      ],
      "institutionSource": "https://arxiv.org/pdf/2607.05147",
      "subproblemContributions": {
        "A": {
          "summary": "先让 DFlash 式并行 Backbone 在一次前向中产出整块 Hidden State 与 Base Logits，再以低秩一阶 Markov Head（默认）或带完整 Prefix 状态的 RNN Head 左到右加入转移偏置并采样。",
          "detail": "先让 DFlash 式并行 Backbone 在一次前向中产出整块 Hidden State 与 Base Logits，再以低秩一阶 Markov Head（默认）或带完整 Prefix 状态的 RNN Head 左到右加入转移偏置并采样。昂贵计算仍与块长近似解耦，轻量顺序环节却让第 k 个候选显式依赖已选 Prefix，从而抑制独立并行预测的多模态碰撞与 Suffix Decay。\n\nDFlash 式 Backbone 对整块只前向一次，顺序部分仅用 rank-256 的两次词表投影（Markov Head）或单门控 RNN 更新转移 Logit，不必为每个候选重复 Transformer Rollout。实验中块长从 4 扩到 16 时，相对纯并行 DFlash 的整轮时延仅增加 0.2%–1.3%（Batch Size 128）。\n\n顺序 Head 把上一枚已采样 Token（RNN 版本还累积完整块内 Prefix 与对应 Backbone Hidden State）映射为词表转移偏置，与每个位置的 Base Logits 相加后再采样，使候选沿已经选定的语义分支继续，而非对所有可能前驱取边缘分布。该机制保留并行 Backbone 的首 Token 容量，同时显著缓解后部条件接受率衰减。"
        },
        "C": {
          "summary": "Confidence Head 用 c_k=σ(wᵀ[h_k;W₁[x_{k−1}]]) 估计条件接受率，STS 对 ∏_{i≤j}c_i 逐位置温度校准，使累计概率可用于估算期望接受数而不只是候选排序。",
          "detail": "Confidence Head 用 c_k=σ(wᵀ[h_k;W₁[x_{k−1}]]) 估计条件接受率，STS 对 ∏_{i≤j}c_i 逐位置温度校准，使累计概率可用于估算期望接受数而不只是候选排序。调度器据此截去低存活率 Suffix，并以一次 Profiling 得到的 SPS(B) 表在 Batch 内联合选择各请求的 Verify 长度，避免把 Target Batch 容量耗在高拒绝风险节点上。"
        },
        "D": {
          "summary": "Serving 时以总 Verify Token 数 B=Σ_r(1+ℓ_r) 表示实时负载，沿全局存活概率顺序增量查询 SPS(B)，低负载可分配更长 Prefix、高负载则自动收缩。",
          "detail": "Serving 时以总 Verify Token 数 B=Σ_r(1+ℓ_r) 表示实时负载，沿全局存活概率顺序增量查询 SPS(B)，低负载可分配更长 Prefix、高负载则自动收缩。DeepSeek-V4 生产实现把两轮前的置信度仅用于预估下一步容量 K、当前候选仍按最新分数选择 Top-K，并将不同请求的变长 Token 摊平、用 Sparse Attention Marker 传递依赖，从而兼容 ZOS 与 CUDA Graph。"
        },
        "E": {
          "summary": "Target、共享 Embedding 与 LM Head 全程冻结；从每条 Target 序列随机抽取多个 Anchor 组成 γ-Token Block，只更新并行 Backbone、顺序模块和 Confidence Head。",
          "detail": "Target、共享 Embedding 与 LM Head 全程冻结；从每条 Target 序列随机抽取多个 Anchor 组成 γ-Token Block，只更新并行 Backbone、顺序模块和 Confidence Head。训练将位置指数加权的 Cross-Entropy、Draft/Target 分布总变差和置信度 BCE 以 0.1/0.9/1.0 组合，前部位置权重更高；其中总变差直接对应理论接受率，置信度软标签同为 1−½‖p_d−p_t‖₁。"
        }
      },
      "citations": [
        "medusa",
        "mtp",
        "eagle",
        "eagle-2",
        "eagle-3",
        "pard",
        "diffuspec",
        "specdiff-2",
        "dflash",
        "dflare",
        "domino",
        "specinfer",
        "dart",
        "ddtree",
        "taps"
      ],
      "venue": "arXiv",
      "date": "2026-07",
      "url": "https://arxiv.org/abs/2607.05147",
      "provenance": {
        "legacyWorkbookRow": 13,
        "workbookInstitutions": "未知（arXiv作者团队）"
      },
      "localPdf": "../Reference/DSpark.pdf",
      "subproblemCodes": [
        "A",
        "C",
        "D",
        "E"
      ],
      "institutions": "深度求索（DeepSeek-AI） → 北京大学",
      "citedBy": []
    },
    {
      "id": "specinfer",
      "index": 14,
      "title": "SpecInfer: Accelerating Large Language Model Serving with Tree-based Speculative Inference and Verification",
      "shortName": "SpecInfer",
      "authors": [
        "Xupeng Miao",
        "Gabriele Oliaro",
        "Zhihao Zhang",
        "Xinhao Cheng",
        "Zeyu Wang",
        "Zhengxin Zhang",
        "Rae Ying Yee Wong",
        "Alan Zhu",
        "Lijie Yang",
        "Xiaoxiang Shi",
        "Chunan Shi",
        "Zhuoming Chen",
        "Daiyaan Arfeen",
        "Reyna Abhyankar",
        "Zhihao Jia"
      ],
      "methodOverview": "把一个或多个小型投机模型产生的候选合并为共享 Prefix 的 Token Tree，再由 Target 通过 Tree Attention 一次 Verify 整棵树；同时覆盖服务调度、分布式执行和模型卸载。",
      "notes": [],
      "institutionDetails": [
        {
          "name": "卡内基梅隆大学",
          "order": 1,
          "explanation": "四位共同一作、末位作者及绝大多数作者所属单位。"
        },
        {
          "name": "清华大学",
          "order": 2,
          "explanation": "其他作者所属单位。"
        },
        {
          "name": "斯坦福大学",
          "order": 3,
          "explanation": "其他作者所属单位。"
        },
        {
          "name": "上海交通大学",
          "order": 4,
          "explanation": "其他作者所属单位。"
        },
        {
          "name": "北京大学",
          "order": 5,
          "explanation": "其他作者所属单位。"
        },
        {
          "name": "加州大学圣迭戈分校",
          "order": 6,
          "explanation": "其他作者所属单位。"
        }
      ],
      "institutionSource": "https://arxiv.org/pdf/2305.09781",
      "subproblemContributions": {
        "B": {
          "summary": "单个 SSM 按预设扩展向量 ⟨k₁,…,k_m⟩ 逐层取 Top-k，在模型内部扩大候选分支；也可让多个经残差样本 Boost-Tuning 的 SSM 并行提出树，再按完整 Root-to-node Token Sequence 合并相同 Prefix。",
          "detail": "单个 SSM 按预设扩展向量 ⟨k₁,…,k_m⟩ 逐层取 Top-k，在模型内部扩大候选分支；也可让多个经残差样本 Boost-Tuning 的 SSM 并行提出树，再按完整 Root-to-node Token Sequence 合并相同 Prefix。这样既去除多条候选序列的公共前缀重复，又同时利用单模型 Top-k 多样性与跨模型互补性，而不是只 Verify 一条候选链。\n\nExpansion-based 构树用固定向量指定每个 Draft 步为各节点扩展多少个 Top-k 后继，以单个 SSM 的候选多样性换取更高覆盖；Merge-based 构树则把多个 SSM 的 Root-to-node 序列取并集并折叠公共 Prefix。多个 SSM 依次在前一模型未命中的 Prompt 上做无监督 Boost-Tuning，因此合并树聚合的是互补而非简单重复的候选。"
        },
        "C": {
          "summary": "Tree Attention 令每个节点的输出严格等于其 Root-to-node 序列单独解码的结果；拓扑 Mask 屏蔽兄弟分支、共享 KV Cache 消除公共 Prefix 重算，使整树在一次 Target Pass 中并行 Verify。",
          "detail": "Tree Attention 令每个节点的输出严格等于其 Root-to-node 序列单独解码的结果；拓扑 Mask 屏蔽兄弟分支、共享 KV Cache 消除公共 Prefix 重算，使整树在一次 Target Pass 中并行 Verify。Greedy 模式沿命中子树取最长路径，随机模式 MSS 逐候选接受或拒绝并重整残差分布；论文证明其拒绝率不高于 Naive Sampling，且输出分布与 Target 完全一致。"
        },
        "D": {
          "summary": "Request Manager 按 Iteration 而非整请求调度并执行 Continuous Batching；小 SSM 以 Data Parallel 分布到 GPU，多个 SSM 可同时运行，大模型则结合节点内 Tensor Parallel 与节点间 Pipeline Parallel，管理器只交换 Token 并完成树合并与接受判定。",
          "detail": "Request Manager 按 Iteration 而非整请求调度并执行 Continuous Batching；小 SSM 以 Data Parallel 分布到 GPU，多个 SSM 可同时运行，大模型则结合节点内 Tensor Parallel 与节点间 Pipeline Parallel，管理器只交换 Token 并完成树合并与接受判定。整树一次推进多枚 Token，因而在分布式场景减少跨 GPU 解码轮次，在 Offloading 场景减少 CPU DRAM↔GPU HBM 权重搬运轮次；其收益主要来自低并发下可用于树 Verify 的闲置 GPU 算力。"
        }
      },
      "citations": [],
      "venue": "ASPLOS 2024",
      "date": "2023-05",
      "url": "https://dl.acm.org/doi/10.1145/3620666.3651335",
      "provenance": {
        "legacyWorkbookRow": 14,
        "workbookInstitutions": "美国加州大学圣迭戈分校（UCSD）、其他合作单位"
      },
      "localPdfNote": "Reference 目录中没有与 SpecInfer 对应的本地 PDF。",
      "subproblemCodes": [
        "B",
        "C",
        "D"
      ],
      "institutions": "卡内基梅隆大学 → 清华大学 → 斯坦福大学 → 上海交通大学 → 北京大学 → 加州大学圣迭戈分校",
      "citedBy": [
        "medusa",
        "eagle",
        "beagle",
        "pard",
        "diffuspec",
        "dflare",
        "domino",
        "dspark",
        "ddtree",
        "taps",
        "smart",
        "ptd",
        "speculative-speculative-decoding",
        "batch-speculative-decoding-done-right",
        "specextend",
        "openpangu-npu-speculative-decoding",
        "lever"
      ]
    },
    {
      "id": "opt-tree",
      "index": 15,
      "title": "OPT-Tree: Speculative Decoding with Adaptive Draft Tree Structure",
      "shortName": "OPT-Tree",
      "authors": [
        "Jikai Wang",
        "Yi Su",
        "Juntao Li",
        "Qingrong Xia",
        "Zi Ye",
        "Xinyu Duan",
        "Zhefeng Wang",
        "Min Zhang"
      ],
      "methodOverview": "将一条路径上 Drafter 的条件概率连乘，得到节点被接受的近似概率；随后在节点预算内选择使概率总和最大的前缀闭合树，使目标直接对应预期接受 Token 数。",
      "notes": [],
      "institutionDetails": [
        {
          "name": "苏州大学计算机科学与技术研究所",
          "order": 1,
          "explanation": "两位共同一作、通讯作者和末位作者所属单位。"
        },
        {
          "name": "华为云",
          "order": 2,
          "explanation": "其他作者所属单位。"
        }
      ],
      "institutionSource": "https://aclanthology.org/2025.tacl-1.8/",
      "subproblemContributions": {
        "B": {
          "summary": "对任意自回归 Drafter，OPT-Tree 将每个节点沿 Root 路径的概率乘积 p̂ 视作该 Prefix 的命中概率，并把期望接受长度近似为全树 Σp̂。",
          "detail": "对任意自回归 Drafter，OPT-Tree 将每个节点沿 Root 路径的概率乘积 p̂ 视作该 Prefix 的命中概率，并把期望接受长度近似为全树 Σp̂。每个 Draft 步在当前叶节点的后继分布中选全局 p̂ 最大的 n 个节点扩下一层，停止后再从累计搜索树取 p̂ 最大的 n 个节点；这些节点必然组成含 Root 的子树，在给定节点预算下最大化该目标，并随当前上下文重新形成树形。\n\n以 Drafter 概率沿路径连乘得到节点 p̂，再将所有候选节点的 p̂ 求和作为期望接受长度代理；扩树与最终 Top-n 选择都按 p̂ 全局排序。父节点 p̂ 必不小于子节点，因此选出的高分节点天然保持连通，在相同节点数下可随上下文把宽度和深度分配给更可能命中的分支。"
        },
        "C": {
          "summary": "Verify 端只接收最终 n 节点子树，并用对应 Tree Attention Mask 在一次 Target 前向中取得每个节点的后继，返回最长命中分支再加一枚 Target Token；共享 Prefix 只占一个节点。",
          "detail": "Verify 端只接收最终 n 节点子树，并用对应 Tree Attention Mask 在一次 Target 前向中取得每个节点的后继，返回最长命中分支再加一枚 Target Token；共享 Prefix 只占一个节点。n 可按 Target 与 GPU 的并行平台选取，δ 又在 Draft 深度上剔除期望增益低于额外 Draft 时间比的层，避免更深树的额外开销抵消接受收益。"
        }
      },
      "citations": [
        "medusa",
        "eagle"
      ],
      "venue": "TACL 2025",
      "date": "2024-06",
      "url": "https://aclanthology.org/2025.tacl-1.8/",
      "provenance": {
        "legacyWorkbookRow": 15,
        "workbookInstitutions": "未知（arXiv作者团队）"
      },
      "localPdf": "../Reference/OPTTree.pdf",
      "subproblemCodes": [
        "B",
        "C"
      ],
      "institutions": "苏州大学计算机科学与技术研究所 → 华为云",
      "citedBy": [
        "ddtree",
        "specextend",
        "lever"
      ]
    },
    {
      "id": "dart",
      "index": 16,
      "title": "DART: Diffusion-Inspired Speculative Decoding for Fast LLM Inference",
      "shortName": "DART",
      "authors": [
        "Fuliang Liu",
        "Xue Li",
        "Ketai Zhao",
        "Yinxi Gao",
        "Ziyan Zhou",
        "Zhonghui Zhang",
        "Zhibin Wang",
        "Wanchun Dou",
        "Sheng Zhong",
        "Chen Tian"
      ],
      "methodOverview": "从 Target Hidden State 出发，通过一个轻量模块同时预测多个被 Mask 的未来位置，再利用 N-gram 语义约束把独立候选剪枝成连贯的 Token Tree。",
      "notes": [],
      "institutionDetails": [
        {
          "name": "南京大学新型软件技术全国重点实验室",
          "order": 1,
          "explanation": "一作的联合单位、通讯作者及多数作者所属单位。"
        },
        {
          "name": "阿里巴巴集团",
          "order": 2,
          "explanation": "其他作者所属单位。"
        }
      ],
      "institutionSource": "https://arxiv.org/pdf/2601.19278",
      "subproblemContributions": {
        "A": {
          "summary": "在每轮 Target Prefill/Verify 后，DART 拼接低、中、高三层 Hidden State 并投影，再与右移的 Target Token Embedding 组合为 Prefix 表征，追加 d−1 个可训练 [MASK]；单个定制 Transformer Decoder Layer 在严格 Causal Mask 下通过 Shifted Logits Prediction 一次给出 d 个未来位置分布。",
          "detail": "在每轮 Target Prefill/Verify 后，DART 拼接低、中、高三层 Hidden State 并投影，再与右移的 Target Token Embedding 组合为 Prefix 表征，追加 d−1 个可训练 [MASK]；单个定制 Transformer Decoder Layer 在严格 Causal Mask 下通过 Shifted Logits Prediction 一次给出 d 个未来位置分布。它既不做扩散模型的迭代去噪或双向修正，也不做自回归 Drafter Rollout，因此 Draft Forward 开销不随 d 线性增长。\n\n一个定制 Decoder Layer 复用 Target 多层 Hidden State，在 Prefix 后附加 d−1 个 [MASK]，一次前向同时产出 d 个位置的 Logits；无需逐 Token 重跑 Drafter，也无需维护自回归 Drafter 的 KV Cache。论文在 Qwen3-14B 上测得 Draft Forward 为 1.5 ms，较 EAGLE3 的自回归 Drafter 降低 6.8 倍。\n\nShifted Logits 把 Prefix 最后一位的输出解释为第一枚候选、后续 [MASK] 输出依次右移，强化最关键的首位置预测；Prefix-Isolated Sparse Mask 又允许一次训练多个 Prefix/未来块而不泄漏未来真值。目标以 λ_t=0.6^(t−1) 加权 Draft 对 Target 分布的 KL，避免远期噪声压过前部接受率；推理时 3-gram 连贯性分数再抑制独立位置的冲突组合。"
        },
        "B": {
          "summary": "对每个并行位置的 Logits 先取 Top-25，再将 Draft Log-Probability 与当前部分序列的 3-gram 条件概率合成扩展分数；Logit 权重按 0.9^level 衰减、N-gram 权重为 0.5，组合结果再乘 (level+1)^−0.7，Beam 只保留 20 条活跃序列，最终从全局扩展树选 59 个最高分节点。",
          "detail": "对每个并行位置的 Logits 先取 Top-25，再将 Draft Log-Probability 与当前部分序列的 3-gram 条件概率合成扩展分数；Logit 权重按 0.9^level 衰减、N-gram 权重为 0.5，组合结果再乘 (level+1)^−0.7，Beam 只保留 20 条活跃序列，最终从全局扩展树选 59 个最高分节点。该 Continuity-Aware Pruning 用外部 Dolma 3 Mix Trie 排除独立位置拼接出的不连贯路径，并把指数候选空间压成可一次 Tree Attention Verify 的紧凑树。\n\n第 i 层从对应位置 Logits 取 25 个候选，并把模型 Log-Probability、3-gram 条件概率与深度权重合成路径分数；每层用 Beam Width 20 截断活跃部分序列，最后从所有已扩节点保留全局 Top-59。这样树宽由联合分数而非各位置笛卡尔积决定，既保留多个高概率 Prefix，又把 Target 的 Tree Attention Verify 规模固定在 59 个节点内。"
        }
      },
      "citations": [
        "medusa",
        "eagle",
        "eagle-2",
        "eagle-3",
        "diffuspec",
        "specdiff-2"
      ],
      "venue": "arXiv",
      "date": "2026-01",
      "url": "https://arxiv.org/abs/2601.19278",
      "provenance": {
        "legacyWorkbookRow": 16,
        "workbookInstitutions": "未知（arXiv作者团队）"
      },
      "localPdf": "../Reference/DART.pdf",
      "subproblemCodes": [
        "A",
        "B"
      ],
      "institutions": "南京大学新型软件技术全国重点实验室 → 阿里巴巴集团",
      "citedBy": [
        "domino",
        "dspark",
        "ddtree",
        "taps"
      ]
    },
    {
      "id": "ddtree",
      "index": 17,
      "title": "Accelerating Speculative Decoding with Block Diffusion Draft Trees",
      "shortName": "DDTree",
      "authors": [
        "Liran Ringel",
        "Yaniv Romano"
      ],
      "methodOverview": "利用 DFlash 为各位置给出的边缘概率，通过 Best-First Search 在节点预算下选择代理路径概率最高的候选，并用仅允许访问祖先的 Attention Mask 一次 Verify 整棵树。",
      "notes": [],
      "institutionDetails": [
        {
          "name": "以色列理工学院（Technion）计算机科学系",
          "order": 1,
          "explanation": "主要作者所在院系；与下一顺位院系同属以色列理工学院。"
        },
        {
          "name": "以色列理工学院（Technion）电气与计算机工程系",
          "order": 2,
          "explanation": "其他作者所在院系；两个院系实际属于同一个学校级机构。"
        }
      ],
      "institutionSource": "https://arxiv.org/pdf/2604.12989",
      "subproblemContributions": {
        "B": {
          "summary": "保留 DFlash 单次 Block-Diffusion 前向给出的逐位置边缘分布，不再将其压成一条 Top-1 序列；DDTree 以这些边缘分布的乘积构造因子化路径概率，并把替代期望接受长度分解为树中各前缀的概率质量之和。",
          "detail": "保留 DFlash 单次 Block-Diffusion 前向给出的逐位置边缘分布，不再将其压成一条 Top-1 序列；DDTree 以这些边缘分布的乘积构造因子化路径概率，并把替代期望接受长度分解为树中各前缀的概率质量之和。在固定节点预算内，Best-First Search 直接选出概率最高且自动保持前缀闭合的候选树，无需额外 Drafter 前向或外部 N-gram 评分。\n\n把深度 d 的节点表示为各位置候选名次组成的元组，其分数是对应边缘概率乘积；Max-Heap 每弹出一个最高分前缀，只加入它的下一兄弟与最优孩子。该算法在 O(B log B) 时间内恢复 B 个最高概率前缀，并严格优化因子化 Draft 分布下的替代目标，而非声称获得不可用的 Target 路径概率。"
        },
        "C": {
          "summary": "将所选树展平后按深度赋予 Position ID，并用仅允许节点关注根、祖先和自身的 Tree Attention Mask，在一次 Target 前向中为所有分支计算分数。",
          "detail": "将所选树展平后按深度赋予 Position ID，并用仅允许节点关注根、祖先和自身的 Tree Attention Mask，在一次 Target 前向中为所有分支计算分数。Verifier 随 Target 自身的解码规则沿匹配子节点行走，首个未匹配 Token 成为下一轮 Bonus Token，KV Cache 只保留已接受路径。\n\n整棵候选树仅触发一次 Target 前向；祖先可见掩码隔离不同分支，节点预算 B 则直接限制进入 Verify 的 Token 数。匹配结束后压缩 KV Cache 到被接受的根到叶路径，使多分支覆盖不会污染后续上下文。"
        }
      },
      "citations": [
        "medusa",
        "eagle",
        "eagle-2",
        "eagle-3",
        "pard",
        "dflash",
        "specinfer",
        "opt-tree",
        "dart"
      ],
      "venue": "arXiv",
      "date": "2026-04",
      "url": "https://arxiv.org/abs/2604.12989",
      "provenance": {
        "legacyWorkbookRow": 17,
        "workbookInstitutions": "未知（arXiv作者团队）"
      },
      "localPdf": "../Reference/DDTree.pdf",
      "subproblemCodes": [
        "B",
        "C"
      ],
      "institutions": "以色列理工学院（Technion）计算机科学系 → 以色列理工学院（Technion）电气与计算机工程系",
      "citedBy": [
        "dspark",
        "taps"
      ]
    },
    {
      "id": "taps",
      "index": 18,
      "title": "TAPS: Target-Aware Prefix Tree Selection for Diffusion-Drafted Speculative Decoding",
      "shortName": "TAPS",
      "authors": [
        "Zhuoyu Wang",
        "Junnan Huang",
        "Xinyu Chen"
      ],
      "methodOverview": "Training 一个轻量 Target-Aware Scorer 来估计每条边在 Target 下被接受的条件概率，沿 Prefix 连乘后选出紧凑的前缀闭合子树。",
      "notes": [],
      "institutionDetails": [
        {
          "name": "香港科技大学（广州）",
          "order": 1,
          "explanation": "全部作者均来自该校。"
        }
      ],
      "institutionSource": "https://arxiv.org/pdf/2606.00487",
      "subproblemContributions": {
        "B": {
          "summary": "先从扩散 Drafter 每个位置的 Top-K Token 组成大候选池，再由轻量 Target-Aware Scorer 为每条父子边估计“已到达父节点时接受该孩子”的条件概率；沿根路径连乘后得到节点可达概率，因而会压低错误 Prefix 下看似高置信的后代。",
          "detail": "先从扩散 Drafter 每个位置的 Top-K Token 组成大候选池，再由轻量 Target-Aware Scorer 为每条父子边估计“已到达父节点时接受该孩子”的条件概率；沿根路径连乘后得到节点可达概率，因而会压低错误 Prefix 下看似高置信的后代。选择器再按可达收益与深度成本从高到低保留节点及全部祖先，形成紧凑、前缀闭合的子树。\n\n从最多 N_pool 个扩散边缘候选出发，按路径可达概率除以深度相关成本进行贪心选点；每次加入节点时同时补齐祖先，保证结果始终是可供 Tree Attention 使用的连通前缀树。树大小由 N_max 与效用阈值共同控制，而不是机械耗尽固定预算。\n\nScorer 读取父子 Token、边深度、子 Token 的 Draft Log Probability 与该位置熵，并在兄弟节点间做 Softmax，预测 Target 的局部条件偏好。它用离线记录的 Target Verify 轨迹蒸馏：KL 项学习已到达 Prefix 的局部分布，BCE 项校准沿路径累乘的可达概率，推理时无需调用 Target 进行选树。"
        },
        "C": {
          "summary": "将“祖先全部通过后该节点才有用”显式纳入 Verify 分配，避免高边缘概率但 Prefix 已不可达的后代占用 Target 计算。",
          "detail": "将“祖先全部通过后该节点才有用”显式纳入 Verify 分配，避免高边缘概率但 Prefix 已不可达的后代占用 Target 计算。λ₁建模逐节点 Tree Attention 开销，λ₂惩罚较深且 KV 复用机会更低的节点，τ 则在剩余节点收益不足时终止扩树。"
        }
      },
      "citations": [
        "medusa",
        "eagle",
        "eagle-2",
        "eagle-3",
        "dflash",
        "specinfer",
        "dart",
        "ddtree"
      ],
      "venue": "arXiv",
      "date": "2026-05",
      "url": "https://arxiv.org/abs/2606.00487",
      "provenance": {
        "legacyWorkbookRow": 18,
        "workbookInstitutions": "未知（arXiv作者团队）"
      },
      "localPdf": "../Reference/TAPS.pdf",
      "subproblemCodes": [
        "B",
        "C"
      ],
      "institutions": "香港科技大学（广州）",
      "citedBy": [
        "dspark"
      ]
    },
    {
      "id": "smart",
      "index": 19,
      "title": "SMART: When is it Actually Worth Expanding a Speculative Tree?",
      "shortName": "SMART",
      "authors": [
        "Lifu Wang",
        "Pan Zhou"
      ],
      "methodOverview": "使用实际测得的 Draft 与 Verify 延迟曲线，在运行时比较增加候选节点的边际收益和成本；只有预计能降低端到端延迟时才扩树。",
      "notes": [],
      "institutionDetails": [
        {
          "name": "新加坡管理大学",
          "order": 1,
          "explanation": "全部作者均来自该校。"
        }
      ],
      "institutionSource": "https://arxiv.org/pdf/2604.09731",
      "subproblemContributions": {
        "B": {
          "summary": "把候选树目标从最大化概率或接受长度改为最大化端到端加速比 R(T)=c_T·L_tree/(C_Draft+C_Verify)，其中 L_tree 由根到叶 Prefix 的累积接受概率估计。",
          "detail": "把候选树目标从最大化概率或接受长度改为最大化端到端加速比 R(T)=c_T·L_tree/(C_Draft+C_Verify)，其中 L_tree 由根到叶 Prefix 的累积接受概率估计。运行时逐层生成各活跃节点的 Top-k 孩子，仅当候选的边际收益—成本比高于当前整棵树的加速比时保留，从而让树形同时适应上下文难度和系统成本。\n\n每层为活跃节点产生 Top-k 候选，以 Drafter 的累积概率估计新增节点带来的接受长度，再用 ΔJ=α·ΔC_target/ΔC_spec−C_target/C_spec 判断是否保留；折扣 α 修正 Drafter 对 Target 接受率的乐观偏差。扩展在达到最大深度、节点预算或没有合格候选时停止，贪心构树复杂度为 O(kB)。"
        },
        "C": {
          "summary": "Verify 节点不再由固定宽度和深度预先决定，而是只接收预计能提高全局端到端加速比的分支。",
          "detail": "Verify 节点不再由固定宽度和深度预先决定，而是只接收预计能提高全局端到端加速比的分支。总预算 B_Verify 还把工作区限制在设备 Verify 时延曲线较平坦的区域，减少大树在计算饱和时引入的超线性 Verify 开销。"
        },
        "D": {
          "summary": "以当前 Batch Size 将设备级 Verify 预算均分为每条序列的树预算，并让每个请求再根据自身候选置信度逐节点扩展或剪枝。",
          "detail": "以当前 Batch Size 将设备级 Verify 预算均分为每条序列的树预算，并让每个请求再根据自身候选置信度逐节点扩展或剪枝。该训练无关的运行时控制器不改 Drafter、Target 或 Verify 规则，可作为 EAGLE、MSD、DFlash 等已有投机解码管线的插件。\n\n分别用 C_Draft=λ|T| 与 C_Verify=γ(exp(δ|T|^ρ)−1) 拟合指定 GPU 上的 Draft 和 Verify 时延，再用曲线导数估算新增节点的硬件边际成本。设备只需少量预分析前向即可重拟合参数，因此控制策略能反映不同 GPU 的算力、带宽与 Batch 饱和转折点。"
        }
      },
      "citations": [
        "medusa",
        "dflash",
        "eagle",
        "eagle-2",
        "eagle-3",
        "specinfer"
      ],
      "venue": "ECCV 2026",
      "date": "2026-04",
      "url": "https://arxiv.org/abs/2604.09731",
      "provenance": {
        "legacyWorkbookRow": 19,
        "workbookInstitutions": "未知（arXiv作者团队）"
      },
      "localPdf": "../Reference/SMART.pdf",
      "subproblemCodes": [
        "B",
        "C",
        "D"
      ],
      "institutions": "新加坡管理大学",
      "citedBy": []
    },
    {
      "id": "ptd",
      "index": 20,
      "title": "Unlocking Parallelism in Autoregressive Language Models via Speculative Decoding with Progressive Tree Drafting",
      "shortName": "PTD",
      "authors": [
        "Zipeng Gao",
        "Zhi Zheng",
        "Qingrong Xia",
        "Junda Lin",
        "Ziwei Zhao",
        "Tong Xu",
        "Zhefeng Wang",
        "Enhong Chen"
      ],
      "methodOverview": "不引入独立 Drafter，而是通过渐进式树结构引导 Target 在一次前向中探索多条路径，并逐阶段剪枝，在候选多样性、连贯性和 Verify 成本间取得平衡。",
      "notes": [],
      "institutionDetails": [
        {
          "name": "中国科学技术大学认知智能全国重点实验室",
          "order": 1,
          "explanation": "一作、通讯作者及多数作者所属单位。"
        },
        {
          "name": "华为技术有限公司",
          "order": 2,
          "explanation": "其他作者所属单位。"
        }
      ],
      "institutionSource": "https://arxiv.org/pdf/2607.10661",
      "subproblemContributions": {
        "A": {
          "summary": "不增加独立 Drafter、预测头或训练过程，而是通过树形输入与 Attention Mask 调用 Target 的内生预测能力；同一次前向并行产生 AR Next Token、为所有 Draft Tree 节点生成孩子，并为已缓存候选计算 Verify 结果。",
          "detail": "不增加独立 Drafter、预测头或训练过程，而是通过树形输入与 Attention Mask 调用 Target 的内生预测能力；同一次前向并行产生 AR Next Token、为所有 Draft Tree 节点生成孩子，并为已缓存候选计算 Verify 结果。这样免去额外模型的训练、对齐与跨模型通信。"
        },
        "B": {
          "summary": "把 Target 自身的候选生成组织为持续演化的 Draft Tree：每个节点只关注祖先、Position ID 由路径深度确定，因此一次模型前向可同时为当前所有节点追加孩子并探索多条语义路径。",
          "detail": "把 Target 自身的候选生成组织为持续演化的 Draft Tree：每个节点只关注祖先、Position ID 由路径深度确定，因此一次模型前向可同时为当前所有节点追加孩子并探索多条语义路径。树以最大孩子数限制宽度，超过深度阈值时用滑动窗口式 Stepwise Pruning 保留最早加入的孩子及其后代；所得子树再按共同根递归合并进候选缓存，兼顾前缀复用、分支多样性和连贯性。\n\n用共享 Prefix 的树替代彼此独立且高度重复的线性分支；种子节点启动不同语义方向，此后每轮为所有现有节点并行追加一个孩子。Width Control 抑制过度分叉，Stepwise Pruning 在树过深时删除陈旧兄弟分支，保留下来的语义子树按同根递归合并到 Candidate Pool。"
        },
        "C": {
          "summary": "从 Candidate Pool 检索与当前 Prefix 匹配的树，复用仅祖先可见掩码和树深 Position ID，在联合 Target 前向中并行 Verify 各节点。",
          "detail": "从 Candidate Pool 检索与当前 Prefix 匹配的树，复用仅祖先可见掩码和树深 Position ID，在联合 Target 前向中并行 Verify 各节点。贪心解码递归沿 Target 预测命中的孩子接受；采样解码则对兄弟候选做无放回抽样与重新归一化，以保持原始采样分布。"
        }
      },
      "citations": [
        "medusa",
        "eagle",
        "eagle-2",
        "specinfer"
      ],
      "venue": "COLM 2026",
      "date": "2026-07",
      "url": "https://arxiv.org/abs/2607.10661",
      "provenance": {
        "legacyWorkbookRow": 20,
        "workbookInstitutions": "未知（arXiv作者团队）"
      },
      "localPdf": "../Reference/PTD.pdf",
      "subproblemCodes": [
        "A",
        "B",
        "C"
      ],
      "institutions": "中国科学技术大学认知智能全国重点实验室 → 华为技术有限公司",
      "citedBy": []
    },
    {
      "id": "speculative-speculative-decoding",
      "index": 21,
      "title": "Speculative Speculative Decoding",
      "shortName": "Saguaro / SSD",
      "authors": [
        "Tanishq Kumar",
        "Tri Dao",
        "Avner May"
      ],
      "methodOverview": "在 Target 执行 Verify 的同时，Drafter 预判 Verify 可能出现的若干结果，并提前为这些结果继续计算后续 Draft；实际结果若命中预判集合，就能立即复用预计算结果。Saguaro 是针对这一重叠执行模式优化的实现。",
      "notes": [],
      "institutionDetails": [
        {
          "name": "斯坦福大学",
          "order": 1,
          "explanation": "第一作者兼通讯作者 Tanishq Kumar 所属单位。"
        },
        {
          "name": "Together AI",
          "order": 2,
          "explanation": "末位作者 Avner May 所属单位，Tri Dao 亦具有该单位署名。"
        },
        {
          "name": "普林斯顿大学",
          "order": 3,
          "explanation": "Tri Dao 的高校单位。"
        }
      ],
      "institutionSource": "https://arxiv.org/pdf/2603.03251",
      "subproblemContributions": {
        "A": {
          "summary": "让 Drafter 针对多个可能的接受长度和 Bonus Token 提前生成下一轮 Draft。",
          "detail": "让 Drafter 针对多个可能的接受长度和 Bonus Token 提前生成下一轮 Draft，命中缓存时可将下一轮 Draft 延迟基本隐藏。"
        },
        "D": {
          "summary": "以异步双设备流水线重叠 Draft 与 Verify，并用预推测缓存处理可能的 Verify 结果。",
          "detail": "提出 Speculative Speculative Decoding：在 Target Verify 当前轮时，由独立硬件上的 Drafter 预测可能的 Verify 结果，并提前生成对应的下一轮 Draft。系统设计异步 Draft–Verify 流水线、Saguaro Cache 和随 Batch Size 变化的 Cache Miss 回退策略，消除两阶段之间的同步等待。"
        }
      },
      "citations": [
        "medusa",
        "eagle",
        "eagle-2",
        "eagle-3",
        "diffuspec",
        "dflash",
        "specinfer"
      ],
      "venue": "ICLR 2026 Poster",
      "date": "2026-03",
      "url": "https://openreview.net/forum?id=aL1Wnml9Ef",
      "localPdf": "../Reference/Speculative_Speculative_Decoding.pdf",
      "provenance": {
        "workbookInstitutions": "斯坦福大学 → Together AI → 普林斯顿大学"
      },
      "subproblemCodes": [
        "A",
        "D"
      ],
      "institutions": "斯坦福大学 → Together AI → 普林斯顿大学",
      "citedBy": []
    },
    {
      "id": "batch-speculative-decoding-done-right",
      "index": 22,
      "title": "Batch Speculative Decoding Done Right",
      "shortName": "Batch SD Done Right",
      "authors": [
        "Ranran Haoran Zhang",
        "Soumik Dey",
        "Ashirbad Mishra",
        "Hansi Wu",
        "Binbin Li",
        "Rui Zhang"
      ],
      "methodOverview": "从 Position ID、Attention Mask 和 KV Cache 的同步不变量出发，EQSPEC 保证不等长 Batch 投机解码的正确性；EXSPEC 使用滑动请求池动态组合相同长度序列，减少反复对齐产生的实际开销。",
      "notes": [],
      "institutionDetails": [
        {
          "name": "宾夕法尼亚州立大学",
          "order": 1,
          "explanation": "第一作者 Ranran Haoran Zhang 和末位通讯作者 Rui Zhang 所属单位，负责论文的主要方法与学术主导。"
        },
        {
          "name": "eBay",
          "order": 2,
          "explanation": "第二至第五作者所属单位，并提供公开代码仓库及工业系统协作。"
        }
      ],
      "institutionSource": "https://arxiv.org/pdf/2510.22876",
      "subproblemContributions": {
        "C": {
          "summary": "形式化 Batch Verify 后的矩形对齐与各项状态同步条件，以保持输出等价。",
          "detail": "形式化 Verify 后的矩形对齐、Position ID 连续性、Attention Mask 和 KV Cache 同步条件，提出保证状态同步的 EQSPEC，避免批量 Verify 产生错误输出。"
        },
        "D": {
          "summary": "以跨 Batch 同长度分组降低 Ragged Tensor 的反复对齐开销。",
          "detail": "系统研究 Batch Speculative Decoding 的 Ragged Tensor 正确性问题，并提出 EXSPEC 跨 Batch 调度机制，将长度相同的活跃序列动态组成批次，减少 Unpad–Append–Repad 和状态重对齐开销。"
        }
      },
      "citations": [
        "medusa",
        "eagle",
        "eagle-2",
        "eagle-3",
        "specinfer"
      ],
      "venue": "arXiv",
      "date": "2025-10",
      "url": "https://arxiv.org/abs/2510.22876",
      "localPdf": "../Reference/Batch_Speculative_Decoding_Done_Right.pdf",
      "provenance": {
        "workbookInstitutions": "宾夕法尼亚州立大学 → eBay"
      },
      "subproblemCodes": [
        "C",
        "D"
      ],
      "institutions": "宾夕法尼亚州立大学 → eBay",
      "citedBy": []
    },
    {
      "id": "specextend",
      "index": 23,
      "title": "SpecExtend: A Drop-in Enhancement for Speculative Decoding of Long Sequences",
      "shortName": "SpecExtend",
      "authors": [
        "Jungyoub Cha",
        "Hyunjong Kim",
        "Sungzoon Cho"
      ],
      "methodOverview": "面向长上下文的免 Training 增强方案：Prefill 使用 FlashAttention，Verify 使用 Hybrid Tree Attention；Cross-model Retrieval 再根据 Target 的 Attention Score，只为 Drafter 保留最有用的上下文 KV。",
      "notes": [],
      "institutionDetails": [
        {
          "name": "首尔大学",
          "order": 1,
          "explanation": "全部作者均来自首尔大学；Hyunjong Kim 为通讯作者。"
        }
      ],
      "institutionSource": "https://aclanthology.org/2026.findings-acl.2153.pdf",
      "subproblemContributions": {
        "A": {
          "summary": "利用 Target 的 Attention Score 筛选 Drafter 最相关的上下文 KV。",
          "detail": "提出 Cross-model Retrieval，利用 Target Verify 阶段的 Attention Score，为 Drafter 筛选并保留最相关的上下文 KV，从而同时提高长上下文下的 Draft 准确率和速度。"
        },
        "D": {
          "summary": "以 FlashAttention、Hybrid Tree Attention 和压缩后的 Draft KV Cache 优化长上下文流程。",
          "detail": "将 FlashAttention 用于 Target 与 Draft 的 Prefill，使用 Hybrid Tree Attention 加速树状 Verify，并以 Drop-in 方式同时优化 Prefill、Draft 和 Verify 阶段；方案不要求重新 Training 现有 Drafter。"
        }
      },
      "citations": [
        "medusa",
        "eagle",
        "eagle-2",
        "eagle-3",
        "specinfer",
        "opt-tree"
      ],
      "venue": "Findings of ACL 2026",
      "date": "2025-05",
      "url": "https://aclanthology.org/2026.findings-acl.2153/",
      "localPdf": "../Reference/SpecExtend.pdf",
      "provenance": {
        "workbookInstitutions": "首尔大学"
      },
      "subproblemCodes": [
        "A",
        "D"
      ],
      "institutions": "首尔大学",
      "citedBy": []
    },
    {
      "id": "openpangu-npu-speculative-decoding",
      "index": 24,
      "title": "Accelerating OpenPangu Inference on NPU via Speculative Decoding",
      "shortName": "OpenPangu NPU SD",
      "authors": [
        "Yuntao Dai",
        "Jing Wu",
        "Hang Gu",
        "Teng Wang"
      ],
      "methodOverview": "将 Medusa 风格的轻量多 Head 预测改造成适合 NPU 静态图的固定 Token Tree 与 Tree Attention，并配合零拷贝检索；重点解决长序列推理中的显存与带宽瓶颈。",
      "notes": [],
      "institutionDetails": [
        {
          "name": "中国科学技术大学软件学院",
          "order": 1,
          "explanation": "全部作者均来自中国科学技术大学软件学院。"
        }
      ],
      "institutionSource": "https://arxiv.org/pdf/2603.03383",
      "subproblemContributions": {
        "B": {
          "summary": "将动态候选树改造成可离线预计算的静态树拓扑。",
          "detail": "将 Medusa 的动态候选树改造成可离线预计算的静态树拓扑，并用固定 Attention Mask、Tree Indices 与祖先可见关系表示父子依赖，使 Tree Attention 能在静态图中执行。"
        },
        "D": {
          "summary": "面向 NPU 静态 Shape 和显式内存管理完成端到端执行适配。",
          "detail": "完成 Medusa 在 NPU PyTorch 生态中的端到端适配，通过静态图、零拷贝路径提取和算子兼容性改造降低动态控制流开销，并解决图重编译、CPU 回退与长上下文内存带宽瓶颈。"
        }
      },
      "citations": [
        "medusa",
        "eagle",
        "specinfer"
      ],
      "venue": "arXiv",
      "date": "2026-03",
      "url": "https://arxiv.org/abs/2603.03383",
      "localPdf": "../Reference/Accelerating_OpenPangu_Inference_on_NPU_via_Speculative_Decoding.pdf",
      "provenance": {
        "workbookInstitutions": "中国科学技术大学软件学院"
      },
      "subproblemCodes": [
        "B",
        "D"
      ],
      "institutions": "中国科学技术大学软件学院",
      "citedBy": []
    },
    {
      "id": "lever",
      "index": 25,
      "title": "Lever: Speculative LLM Inference on Smartphones",
      "shortName": "Lever",
      "authors": [
        "Tuowei Wang",
        "Fengzu Li",
        "Yanfan Sun",
        "Wei Gao",
        "Ju Ren"
      ],
      "methodOverview": "面向手机异构硬件，让小型 Drafter 驻留 DRAM、Target 驻留 Flash；使用同时考虑 I/O 与计算成本的 Token Tree 目标和 Early-Exit 预测提前剪除低价值分支，并在 CPU 与 NPU 间流水化执行。",
      "notes": [],
      "institutionDetails": [
        {
          "name": "清华大学",
          "order": 1,
          "explanation": "第一作者 Tuowei Wang、第二作者 Fengzu Li 和末位通讯作者 Ju Ren 所属单位，承担论文的主要方法与系统设计。"
        },
        {
          "name": "北京航空航天大学",
          "order": 2,
          "explanation": "第三作者 Yanfan Sun 所属单位。"
        },
        {
          "name": "匹兹堡大学",
          "order": 2,
          "explanation": "第四作者 Wei Gao 所属单位。"
        }
      ],
      "institutionSource": "https://arxiv.org/pdf/2605.16786",
      "subproblemContributions": {
        "B": {
          "summary": "以包含 Flash I/O 与移动端计算成本的 Gain–Cost 目标动态扩展候选树。",
          "detail": "根据移动端 Flash I/O、Draft 计算和 Target Verify 成本，以预期输出 Token 数与周期延迟的收益成本比动态构造候选树，不再只追求概率或接受长度最大化。"
        },
        "C": {
          "summary": "利用 Target 中间隐藏状态在完整 Verify 前保守剪除低收益分支。",
          "detail": "在 Target 中间层附加轻量预测器进行 Early-Exit 分支评分，在完整 Verify 前保守剪除低价值路径，同时保留完整 Target 作为最终接受裁决者。"
        },
        "D": {
          "summary": "联合设计 DRAM–Flash 存储布局与 CPU–NPU 执行映射。",
          "detail": "面向手机有限 DRAM、低 Flash 带宽和有限 NPU 并行能力，让 Drafter 常驻 DRAM、Target 权重驻留 Flash，将批量 Transformer 运算映射到 NPU，并仅沿接受路径在 CPU 执行必要的输出投影。"
        }
      },
      "citations": [
        "medusa",
        "eagle",
        "eagle-2",
        "eagle-3",
        "specinfer",
        "opt-tree"
      ],
      "venue": "arXiv",
      "date": "2026-05",
      "url": "https://arxiv.org/abs/2605.16786",
      "localPdf": "../Reference/Lever.pdf",
      "provenance": {
        "workbookInstitutions": "清华大学 → 北京航空航天大学、匹兹堡大学"
      },
      "subproblemCodes": [
        "B",
        "C",
        "D"
      ],
      "institutions": "清华大学 → 北京航空航天大学、匹兹堡大学",
      "citedBy": []
    }
  ]
};
