/*
 * AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY.
 *
 * Edit data/catalog.json and data/papers/*.json, then run:
 * python3 scripts/sync_catalog.py
 * The wrapper keeps the static site compatible with direct file:// access.
 */
window.SD_ATLAS_DATA = {
  "schemaVersion": 5,
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
      "venue": "ICML 2024",
      "date": "2024-01",
      "url": "https://proceedings.mlr.press/v235/cai24b.html",
      "localPdf": "../Reference/Medusa.pdf",
      "explanationPage": null,
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
      "methodOverview": "在冻结的 Target 上增加多个并行预测未来 Token 的 Head，将各 Head 的候选组合成 Token Tree，再用一次 Tree Attention 完成 Verify。它省去了独立 Drafter，可直观理解为让同一个模型一次提出多条短续写，再统一验收。",
      "problemStatement": {
        "background": "自回归 LLM 每轮完整前向通常只生成一个 Token，解码过程受显存带宽限制：模型参数需要反复从 HBM 搬运到计算单元，而现代加速器的大量算力没有被充分利用。投机解码通过一次 Target 前向并行验证多个候选 Token，能够提高单次参数读取所完成的有效工作量。",
        "priorLimitation": "传统投机解码需要额外获得、训练、维护和部署一个小型 Drafter。独立 Drafter 不仅可能与 Target 存在分布偏移，在张量并行或分布式 Serving 中还会引入额外的模型放置、通信和缓存管理复杂度。仅提出单条候选链又无法充分利用 Target 一次前向的并行能力，而标准 rejection sampling 在非零 Temperature 下还可能因 Drafter 与 Target 的独立采样而频繁拒绝候选。",
        "goal": "不再维护独立 Drafter，而是在原始 LLM 上附加少量未来 Token 预测 Head，并将多个位置的高概率输出组织成共享前缀树，使 Target 能在一次 Tree Attention 前向中验证多条续写。与此同时，提供冻结 Target 的 Medusa-1、联合微调的 Medusa-2、自蒸馏和 typical acceptance，以覆盖低成本无损加速与更高近似加速两类部署需求。"
      },
      "methodComponents": [
        {
          "name": "Medusa Heads",
          "stage": "Candidate generation",
          "purpose": "直接复用 Target 已经计算出的隐藏状态，并行预测多个未来位置，避免训练和部署独立 Drafter。",
          "mechanism": "在 Target 最后一层隐藏状态 h_t 上增加 K 个单层预测 Head。原始 LM Head 预测位置 t+1，第 k 个 Medusa Head 预测位置 t+k+1。每个 Head 由带残差连接的 SiLU 前馈层和词表投影组成：先计算 SiLU(W1·h_t)+h_t，再通过 W2 输出词表分布。W2 从原始 LM Head 初始化，W1 初始化为零，使新增 Head 初始行为接近原模型。",
          "differenceFromPrior": "传统投机解码使用单独的小语言模型逐 Token Draft；Medusa 将 Drafter 压缩为直接挂在 Target Hidden State 上的多个轻量预测头，不需要第二套 Transformer 主干。"
        },
        {
          "name": "Token Tree Construction",
          "stage": "Candidate organization",
          "purpose": "从每个未来位置的不确定分布中保留多种可能续写，提高至少一条路径被 Target 接受的概率。",
          "mechanism": "第 k 个 Head 保留 top-s_k 个 Token，最基础的构树方式对不同位置的候选做笛卡尔积，并将共享前缀合并为 Token Tree。论文进一步在校准集上统计不同 Head、不同预测名次的单项准确率，将路径准确率近似为沿途节点准确率之积，并在固定节点预算下贪心加入当前可扩展节点中估计准确率最高者，得到非均匀稀疏树。",
          "differenceFromPrior": "单链投机解码每轮只尝试一种未来；普通稠密笛卡尔积树则会迅速膨胀。Medusa 用共享前缀和离线校准得到的稀疏树，在候选覆盖率与 Verify 成本之间取折中。"
        },
        {
          "name": "Tree Attention",
          "stage": "Parallel target verification",
          "purpose": "在不把每条续写扩展成独立 Batch 样本的情况下，让 Target 一次处理整棵候选树。",
          "mechanism": "将树中所有节点展平为一个序列，并构造祖先约束 Attention Mask：每个候选节点只能关注自身路径上的祖先节点，不能看到兄弟分支或其他路径。各节点的位置编号也按照其在路径中的真实深度重新设置。Target 因而可在一次前向中并行计算所有树节点的 Logits，并选择最长可接受路径。",
          "differenceFromPrior": "标准 Causal Attention 只能表达单条线性历史；逐条验证又会复制公共前缀并扩大 Batch。Tree Attention 显式编码树形因果关系，使公共前缀只计算和存储一次。"
        },
        {
          "name": "Rejection Sampling and Typical Acceptance",
          "stage": "Candidate acceptance",
          "purpose": "分别支持严格保持 Target 分布的无损模式，以及更重视实际生成质量和接受长度的近似模式。",
          "mechanism": "严格模式沿用投机解码的 rejection sampling，根据 Target 与候选分布执行接受和残差采样，可保持原始 Target 分布。Typical acceptance 则直接检查候选 Token 在 Target 下是否足够合理，其阈值为 min(ε, δ·exp(-H(p_target)))；分布熵越高，可接受候选范围越宽。系统在所有路径中选择满足规则的最长前缀，并保证每轮至少由原 LM Head 推进一个 Token。",
          "differenceFromPrior": "标准 rejection sampling 即使 Drafter 与 Target 分布相同，也可能因双方独立随机采样而拒绝候选。Typical acceptance 不追求逐分布严格一致，而是接受 Target 认为典型且合理的续写，以换取更长前缀。"
        },
        {
          "name": "Medusa-1 and Medusa-2 Training",
          "stage": "Training",
          "purpose": "分别提供不修改原模型能力的低成本训练方案，以及通过联合适配提高远期 Token 预测准确率的高性能方案。",
          "mechanism": "Medusa-1 冻结 Target，只训练未来 Token Heads，并以随预测距离衰减的权重组合各 Head 的交叉熵。Medusa-2 在该目标之外保留原 LM Head 的 next-token loss，同时采用 Target 与 Heads 的差分学习率，并先只训练 Heads、再逐步进行联合训练，避免初始较大的 Head 梯度破坏 Target。",
          "differenceFromPrior": "直接把多 Token Loss 与原模型一起从头联合微调会降低原模型质量。Medusa-2 通过保留原始目标、降低主干学习率和两阶段 Warmup，专门控制这一训练冲突。"
        },
        {
          "name": "Self-Distillation",
          "stage": "Training data construction",
          "purpose": "在原 SFT 数据不可获得或模型经历过 RLHF、训练数据已无法代表当前输出分布时，为 Medusa Heads 构造对齐数据。",
          "mechanism": "先从相近领域的公开数据集中取得 Prompt，再让 Target 自己生成 Response，形成与当前模型输出风格一致的训练集。Medusa-2 自蒸馏时，主干不只拟合生成出的离散 Token，还通过 KL Loss 对齐冻结原模型的完整 next-token 分布。使用 LoRA 时可通过关闭 Adapter 得到 Teacher，无需同时在显存中维护第二份完整模型。",
          "differenceFromPrior": "直接使用原始公开标签可能与经过 SFT 或 RLHF 后的模型分布不一致；自蒸馏让训练监督来自被加速模型自身，并用分布级约束减少联合训练造成的能力漂移。"
        }
      ],
      "characteristics": {
        "requiresTraining": true,
        "drafterType": "multi-head",
        "draftGeneration": "parallel",
        "candidateStructure": "tree",
        "verificationStrategy": "tree-attention-prefix",
        "usesTargetFeatures": true,
        "dynamicDraftLength": false,
        "dynamicVerifyLength": false,
        "lossless": true
      },
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
      "training": {
        "summary": "Medusa-1 冻结 Target，对各未来偏移的交叉熵按 λ_k（实践中取 0.8^k）加权；Medusa-2 再加入原始 next-token 损失，并以差分学习率和先 Heads、后联合的 warmup 防止破坏 Target 能力。",
        "data": "Vicuna-7B-v1.5 和 Vicuna-13B-v1.5 使用与其 SFT 分布一致的 ShareGPT 数据训练两个 Epoch；论文给出的 Medusa-1 示例使用约 60K 条 ShareGPT 样本。对于无法获得原训练数据的 Vicuna-33B 和经历过对齐训练的 Zephyr-7B，先从 ShareGPT 或 UltraChat 等公开数据取得 Prompt，再由对应 Target 自行生成约 100K 量级的 Response 作为自蒸馏数据。训练序列只对 Assistant Response 部分计算监督损失。",
        "objective": "Medusa-1 的目标为 L=Σ_k[-λ_k log p_t^(k)(y_{t+k+1})]，其中实践中 λ_k 取 0.8^k。Medusa-2 使用原 LM Head 的 next-token Cross-Entropy 加 λ_0 倍 Medusa-1 Loss，并给 Target 主干和新增 Heads 设置不同学习率；论文实现中 Heads 学习率约为主干的四倍，并先冻结主干训练 Heads，再进行联合 Warmup。自蒸馏版本还加入 KL(p_original||p_current) 约束主干分布，可借助 LoRA 在关闭 Adapter 时取得冻结 Teacher。实验通常训练五个 Head，并结合 LoRA、QLoRA、Cosine Learning-Rate Schedule 和 8-bit AdamW。"
      },
      "evaluation": {
        "targetModels": [
          "Vicuna-7B-v1.5",
          "Vicuna-13B-v1.5",
          "Vicuna-33B",
          "Zephyr-7B-Beta"
        ],
        "benchmarks": [
          "MT-Bench",
          "AlpacaEval"
        ],
        "baselines": [
          "Vanilla Hugging Face autoregressive decoding",
          "Speculative Decoding with standalone small draft models",
          "Direct joint fine-tuning without Medusa-2 warmup",
          "Medusa-1 Heads without Tree Attention",
          "Dense Cartesian-product tree configurations",
          "Greedy decoding",
          "Standard random sampling"
        ],
        "metrics": [
          "End-to-end wall-clock speedup",
          "Tokens per second",
          "Acceleration rate",
          "Per-step overhead",
          "MT-Bench GPT-4 judge score",
          "Accepted continuation length",
          "Generation quality"
        ],
        "hardware": [
          "NVIDIA A100 PCIe",
          "NVIDIA A100 80GB PCIe",
          "NVIDIA A40",
          "NVIDIA RTX A6000"
        ],
        "frameworks": [
          "Hugging Face Transformers",
          "PyTorch",
          "torch.compile",
          "Axolotl"
        ]
      },
      "mainResults": [
        {
          "condition": "Vicuna-7B-v1.5，MT-Bench，Batch Size=1",
          "metric": "End-to-end Wall-clock Speedup",
          "result": "Medusa-1 为 2.18×，Medusa-2 为 2.83×。",
          "comparison": "Medusa-2 通过联合适配主干提高了远期 Head 准确率，相比只训练 Heads 的 Medusa-1 进一步加速约 30%。",
          "source": "Figure 3; Table 2"
        },
        {
          "condition": "Vicuna-13B-v1.5，MT-Bench，Batch Size=1",
          "metric": "End-to-end Wall-clock Speedup",
          "result": "Medusa-1 为 2.33×，Medusa-2 为 2.83×。",
          "comparison": "相对默认 Hugging Face 自回归实现，两种训练方式都超过 2×，联合训练保持与 7B 模型近似的 2.83× 加速。",
          "source": "Figure 3"
        },
        {
          "condition": "Vicuna-7B，MT-Bench 质量评测",
          "metric": "GPT-4 Judge Score",
          "result": "Baseline、直接联合微调、Medusa-1 和 Medusa-2 分别为 6.17、5.925、6.23 和 6.18。",
          "comparison": "未经保护的直接联合微调明显损害质量；Medusa-2 的 Combined Loss、差分学习率和两阶段 Warmup 基本恢复了原模型质量。",
          "source": "Table 2"
        },
        {
          "condition": "四个 Medusa-2 模型，MT-Bench",
          "metric": "Speedup and Acceleration Rate",
          "result": "Vicuna-7B、Zephyr-7B、Vicuna-13B 和 Vicuna-33B 的 Speedup 分别为 2.83×、2.66×、2.83× 和 2.35×；对应 Acceleration Rate 为 3.47、3.14、3.51 和 3.01。",
          "comparison": "论文中的独立 Drafter speculative decoding 在可比较模型上约为 1.47×–1.60×，Medusa 的多头树验证取得更高加速。",
          "source": "Table 1"
        },
        {
          "condition": "Vicuna-7B Medusa-2，MT-Bench 八个任务类别",
          "metric": "Category-wise Speedup",
          "result": "Humanities、Reasoning、Roleplay、Writing、STEM、Math、Coding 和 Extraction 分别约为 2.58×、2.58×、2.70×、2.72×、2.77×、3.01×、3.29× 和 3.62×。",
          "comparison": "结构化程度较高的 Extraction、Coding 和 Math 获得更长的可接受前缀，而开放式 Humanities 和 Reasoning 的加速相对较低。",
          "source": "Figure 3"
        },
        {
          "condition": "Vicuna-7B Medusa-2，Writing 与 Roleplay 子集，候选树消融",
          "metric": "Tree Efficiency",
          "result": "约 64 个节点的校准稀疏树可获得高于部分 256 节点稠密树的 Acceleration Rate。",
          "comparison": "继续增加候选节点时，接受长度收益逐渐饱和，但矩阵乘和 Attention 成本持续增加，实际 Tokens/s 反而下降。",
          "source": "Figure 4"
        },
        {
          "condition": "Vicuna-7B，逐步加入 Medusa 组件",
          "metric": "Component Contribution",
          "result": "仅使用 Medusa-1 Heads 约 1.5×；加入 Tree Attention 约 1.9×；使用优化稀疏树约 2.2×；改用 Medusa-2 联合训练后约 2.8×。",
          "comparison": "结果表明加速并非只来自多 Token Head，候选树组织、Tree Attention 和联合训练均提供了独立收益。",
          "source": "Table 3"
        },
        {
          "condition": "AlpacaEval",
          "metric": "Tokens per Second and Speedup",
          "result": "Vicuna-7B 从 37.07 提升至 106.76 tokens/s（2.88×）；Vicuna-13B 从 29.01 提升至 91.54（3.16×）；Vicuna-33B 从 17.87 提升至 40.43（2.26×）；Zephyr-7B 从 34.21 提升至 99.50（2.91×）。",
          "comparison": "不同模型规模和不同训练来源上均获得 2× 以上端到端加速，但自蒸馏的 Vicuna-33B 收益相对较低。",
          "source": "Appendix F, Table 4"
        },
        {
          "condition": "Vicuna-7B Medusa-2，Temperature=0.7，MT-Bench Writing 与 Roleplay",
          "metric": "Typical Acceptance Trade-off",
          "result": "随着 ε 从 0.01 增大到 0.25，生成质量总体提高而 Acceleration Rate 下降；在较合适阈值下，质量接近标准随机采样，同时保持高于普通逐 Token 解码的速度。",
          "comparison": "Typical acceptance 明确体现了质量与加速的可调折中，但不再保证逐分布与原 Target 完全一致。",
          "source": "Figure 5"
        }
      ],
      "limitations": [
        {
          "type": "losslessness",
          "description": "Medusa 并非所有配置都严格无损。只有冻结原 Target 的 Medusa-1 配合标准 rejection sampling 时，才能保持原始 Target 参数和输出分布；typical acceptance 主动放宽接受规则，Medusa-2 又会修改 Target 主干，因此两者只能表述为保持相近生成质量，而非严格分布等价。",
          "sourceType": "analysis"
        },
        {
          "type": "serving",
          "description": "论文的核心端到端实验主要针对 Batch Size=1 的本地部署场景，没有系统评估高并发 Continuous Batching 下的吞吐、Tail Latency、Ragged Tree 管理和 KV Cache 开销。候选树会提高单请求算术强度，但也可能占用原本用于扩大 Batch 的计算容量。",
          "sourceType": "paper"
        },
        {
          "type": "candidate-cost",
          "description": "候选节点数量不能无脑扩大。论文的树消融显示，Acceleration Rate 随节点数增加趋于饱和，而实际 Tokens/s 会因矩阵乘和 Attention 从 Memory-bound 转向 Compute-bound 而下降，因此树规模必须针对模型和硬件调优。",
          "sourceType": "paper"
        },
        {
          "type": "static-policy",
          "description": "Head 数量、各 Head 的 top-k 和稀疏树结构主要通过离线校准确定，推理时基本固定，没有根据当前 Prompt 难度、Head 置信度、请求类型或实时系统负载动态调整 Draft Depth 和 Verify Budget。",
          "sourceType": "analysis"
        },
        {
          "type": "calibration",
          "description": "优化树将不同 Head、不同预测名次的准确率视为近似独立，并使用校准集统计得到的全局准确率估计路径命中率。不同领域、Temperature 或模型输出分布发生变化时，这些静态统计可能失配。",
          "sourceType": "analysis"
        },
        {
          "type": "training-stability",
          "description": "Medusa-2 对训练配方敏感。论文中直接联合训练使 Vicuna-7B 的 MT-Bench 分数从 6.17 降至 5.925，只有加入原始 next-token Loss、差分学习率和两阶段 Warmup 后才恢复到 6.18。",
          "sourceType": "observed-data"
        },
        {
          "type": "parameter-overhead",
          "description": "虽然 Medusa 不需要第二个 Transformer Drafter，但每个 Head 仍包含一个映射到完整词表的 d×V 投影矩阵。随着 Hidden Dimension、Vocabulary Size 或 Head 数量增加，模型权重、显存占用和分布式通信开销并非可以忽略。",
          "sourceType": "analysis"
        },
        {
          "type": "evaluation",
          "description": "主评测集中在 Vicuna 和 Zephyr 系列聊天模型以及 MT-Bench、AlpacaEval，缺少对现代大词表模型、长上下文、工具调用、高并发 Serving 和严格代码执行正确率的系统验证。MT-Bench 质量还依赖 GPT-4 Judge，存在评审模型偏差。",
          "sourceType": "analysis"
        },
        {
          "type": "reproducibility",
          "description": "论文给出了 Medusa-1 单张 A100 的训练示例和附录中的 A100、A40、A6000 Roofline 分析，但主文各项 Wall-clock Speedup 的完整硬件、内核版本和端到端测量环境披露有限，跨框架直接复现实验数值需要额外对齐。",
          "sourceType": "paper"
        }
      ],
      "relations": {
        "extends": [],
        "comparesAgainst": [],
        "related": [
          "specinfer"
        ],
        "compatibleWith": []
      },
      "citations": [
        "specinfer"
      ],
      "reproducibility": {
        "codeUrl": "https://github.com/FasterDecoding/Medusa",
        "modelUrl": "https://huggingface.co/FasterDecoding",
        "projectPage": "https://sites.google.com/view/medusa-llm",
        "officialImplementation": true,
        "status": "not-reproduced",
        "notes": [
          "官方仓库提供 Medusa-1、Medusa-2、Self-Distillation、训练及推理代码，并采用 Apache-2.0 License。",
          "作者在 FasterDecoding Hugging Face 组织下发布了多个 Vicuna 和 Zephyr 对应的 Medusa-1、Medusa-2 权重。",
          "官方独立实现主要面向单 GPU、Batch Size=1；TensorRT-LLM、Hugging Face TGI 和 RTP-LLM 等推理框架另有 Medusa 集成。",
          "本站尚未记录一组严格复现论文 MT-Bench、AlpacaEval 和树结构消融结果的完整环境、命令与数值，因此状态标为 not-reproduced。"
        ]
      },
      "evidence": [
        {
          "claim": "Medusa 通过附加多个未来 Token 预测 Head，避免获得、训练和部署独立 Drafter，并以 Tree Attention 一次验证多条候选。",
          "location": "Abstract and Section 1, Pages 1–2",
          "type": "method"
        },
        {
          "claim": "第 k 个 Medusa Head 读取 Target 最后一层 Hidden State，使用带 SiLU 和残差连接的单层网络预测位置 t+k+1。",
          "location": "Section 2.1.1, Page 3",
          "type": "method"
        },
        {
          "claim": "各 Head 的 top-s_k 候选通过笛卡尔积形成共享前缀树，树节点只能关注其祖先，位置编码按路径深度重新设置。",
          "location": "Section 2.1.2 and Figure 2, Pages 3–4",
          "type": "method"
        },
        {
          "claim": "Medusa-1 冻结 Target，并使用按未来预测距离加权的多 Head Cross-Entropy，实践中 λ_k 取类似 0.8^k 的衰减。",
          "location": "Section 2.2.1, Page 4",
          "type": "training"
        },
        {
          "claim": "Medusa-2 将原始 next-token Loss 与 Medusa Loss 联合，并使用差分学习率和 Heads Warmup 保护主干能力。",
          "location": "Section 2.2.2, Pages 4–5",
          "type": "training"
        },
        {
          "claim": "Typical acceptance 根据 Target Token 概率和分布熵设定阈值，并从所有候选中选择最长可接受前缀。",
          "location": "Section 2.3.1, Page 5",
          "type": "verification"
        },
        {
          "claim": "缺少原始数据时，可由 Target 自生成响应；Medusa-2 再以原模型分布的 KL Loss 进行自蒸馏，并可借助 LoRA 避免保存第二份 Teacher。",
          "location": "Section 2.3.2, Page 6",
          "type": "training"
        },
        {
          "claim": "优化树在校准集上估计 Head 与预测名次准确率，并在节点预算下贪心加入估计贡献最高的可连接节点。",
          "location": "Section 2.3.3, Page 6; Appendix C",
          "type": "method"
        },
        {
          "claim": "Vicuna-7B 和 Vicuna-13B 上，Medusa-1 分别达到 2.18× 和 2.33×，Medusa-2 均达到约 2.83×。",
          "location": "Section 3.1 and Figure 3, Page 7",
          "type": "result"
        },
        {
          "claim": "直接联合微调降低 Vicuna-7B 质量，而两阶段 Medusa-2 将 MT-Bench 分数恢复到与 Baseline 接近，同时达到 2.83× Speedup。",
          "location": "Section 3.3.3 and Table 2, Page 9",
          "type": "ablation"
        },
        {
          "claim": "稀疏优化树能用明显少于稠密树的节点取得更高 Acceleration Rate，但候选过多会降低实际 Tokens/s。",
          "location": "Section 3.3.1 and Figure 4, Page 8",
          "type": "ablation"
        },
        {
          "claim": "AlpacaEval 上四个模型均达到超过 2× 的端到端加速，Vicuna-13B 的报告值最高，为 3.16×。",
          "location": "Appendix F, Figure 8 and Table 4, Page 15",
          "type": "result"
        },
        {
          "claim": "论文附录对 A100-80GB-PCIe、A40 和 A6000 上的线性层与 Attention 运算进行 Roofline 分析，以解释候选规模和 Batch Size 对性能的影响。",
          "location": "Appendix G, Pages 15–27",
          "type": "system"
        }
      ],
      "notes": [
        "论文中的 Acceleration Rate 指每次 Target 解码步骤平均推进的 Token 数；端到端 Speedup 还需除以处理候选树带来的单步 Overhead，因此二者不能直接等同。",
        "论文经验上认为最多训练五个 Medusa Head 已经足够；经过稀疏树优化后，实际推理有时只需启用前三个或四个 Head，多余 Head 可直接忽略。",
        "Tree Attention 不是额外调用一个 Verifier：候选树本身直接送入原 Target，Target 计算出的 Hidden State 和 Logits还可供下一轮 Medusa Heads 继续生成候选。",
        "Medusa 的多 Head 预测在未来位置之间彼此独立，候选树只是枚举不同组合，并没有让后部 Head 条件化于某个实际选中的前部 Token；树分支用于缓解这种多模态不确定性，而不是消除它。",
        "严格 rejection sampling 与 typical acceptance 应当分开记录：前者保证 Target 分布不变，后者是一种质量近似保持、但可接受更多合理 Token 的工程折中。",
        "Medusa-1 的核心价值是冻结 Target 后低成本接入和严格保留模型能力；Medusa-2 的核心价值是牺牲参数完全不变这一条件，换取更准确的远期 Head 和更高 Speedup。",
        "候选树结构不能只追求更大的平均接受长度。论文的 Roofline 与树消融表明，候选过多会将原本 Memory-bound 的解码推向 Compute-bound，导致真实 Tokens/s 下降。",
        "论文主要研究 Batch Size=1，不应把其约 2.3×–2.8× 的低并发结果直接外推为高并发在线 Serving 的吞吐提升。"
      ],
      "qaNotes": [],
      "provenance": {
        "legacyWorkbookRow": 1,
        "workbookInstitutions": "美国卡内基梅隆大学（CMU）、Meta"
      },
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
      "venue": "ICML 2024",
      "date": "2024-04",
      "url": "https://proceedings.mlr.press/v235/gloeckle24a.html",
      "localPdf": "../Reference/MTP.pdf",
      "explanationPage": null,
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
      "methodOverview": "在共享主干上设置多个相互独立的预测 Head，同时预测接下来的若干 Token。多 Token Training 目标既能强化中间表示，也让模型具备用于自投机解码的并行未来预测能力。",
      "problemStatement": {
        "background": "主流自回归 LLM 采用 teacher forcing 的 next-token prediction 训练：每个位置只监督下一个 Token，推理时却必须基于模型自身生成结果逐 Token 展开。该训练方式容易优先拟合局部、低难度模式，并使推理保持严格串行。",
        "priorLimitation": "标准 next-token 目标对决定后续走向的关键 choice point 监督不足，样本效率和长程依赖学习能力有限；既有多 Token 工作多集中于序列到序列预训练或事后微调加速，缺少在十亿级自回归 LLM 上进行等参数、等计算预算的大规模预训练验证。朴素实现还会同时物化 n 份词表 Logits，使显存从 O(V+d) 膨胀到 O(nV+d)。",
        "goal": "把多个未来位置直接纳入 LLM 预训练目标，在不增加训练时间和峰值显存的前提下提高生成、代码与算法推理能力；同时复用附加 Heads 构造无需独立 Drafter 的自投机解码路径。"
      },
      "methodComponents": [
        {
          "name": "共享主干与独立未来预测 Heads",
          "stage": "Model architecture",
          "purpose": "让同一上下文表示同时承载多个未来位置的预测信息，并避免为每个预测距离复制完整模型。",
          "mechanism": "共享 Transformer 主干 f_s 根据历史 x_{1:t} 产生表示 z_t；n 个独立 Transformer 输出 Head f_{h_i} 分别预测 x_{t+i}，所有 Heads 共用同一 unembedding 矩阵 f_u。第一个 Head 仍是标准 next-token Head，其余 Heads 作为未来位置辅助预测器。",
          "differenceFromPrior": "不同于仅监督 x_{t+1} 的标准语言模型，也不同于复制 n 份 residual stream 的早期多目标结构；MTP 用单一共享主干和轻量独立 Heads 完成等参数预算下的多步监督。"
        },
        {
          "name": "多 Token 联合预训练目标",
          "stage": "Pretraining objective",
          "purpose": "把训练信号从局部 next-token 模式扩展到多个未来位置，强化对长程后果和关键决策点的表示。",
          "mechanism": "在每个语料位置同时最小化 n 个未来 Token 的交叉熵之和：L_n = -Σ_t Σ_{i=1}^n log P_θ(x_{t+i}|x_{1:t})。所有目标共同更新共享主干，各 Head 学习对应预测距离的条件分布。",
          "differenceFromPrior": "附加 Heads 不是在训练完成的 next-token 模型上事后拟合，而是在预训练阶段与主干联合优化，因此既改变主干表示，也显著提高远期 Head 的候选准确率。"
        },
        {
          "name": "显存无额外开销的 Head 级反向调度",
          "stage": "Training execution",
          "purpose": "避免多 Head 的全词表 Logits 与梯度同时驻留，保持与 next-token 训练相近的峰值显存和训练时间。",
          "mechanism": "主干前向后，依次执行每个 Head 的前向和反向，将梯度累计到共享主干；当前 Head 的 Logits 和梯度在进入下一个 Head 前释放，最后再对主干执行累计梯度反向。峰值显存由 O(nV+d) 降至 O(V+d)。",
          "differenceFromPrior": "朴素并行实现会同时物化 n 份词表张量；该执行顺序只长期保存 d 维主干梯度，论文实验表明不会增加训练时长。"
        },
        {
          "name": "基于附加 Heads 的自投机解码",
          "stage": "Inference",
          "purpose": "在不加载独立小模型的情况下，将多个串行 Target 前向压缩为一次候选生成和一次块验证。",
          "mechanism": "一次共享主干前向后，各未来 Head 并行给出连续位置的 top-1 Token，组成固定长度线性候选块；随后采用 greedy blockwise self-speculative decoding，由 next-token Head 并行验证并提交最长匹配前缀。各位置 top-k 结果也可接入 Medusa 式 Tree Attention。",
          "differenceFromPrior": "与外置 Drafter 不同，候选直接来自 Target 自身的附加 Heads；与只为加速而后训练预测头的方法相比，Heads 已在预训练阶段参与表示学习，候选质量更高。"
        }
      ],
      "characteristics": {
        "requiresTraining": true,
        "drafterType": "multi-head self-speculative",
        "draftGeneration": "parallel",
        "candidateStructure": "chain",
        "verificationStrategy": "fixed-prefix",
        "usesTargetFeatures": true,
        "dynamicDraftLength": false,
        "dynamicVerifyLength": false,
        "lossless": true
      },
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
      "training": {
        "summary": "在每个语料位置，对 n 个未来 Token 的独立条件分布求交叉熵之和，并让所有目标共同反向更新共享主干，使训练信号不再只偏向局部 next-token 模式。",
        "data": "大规模代码预训练覆盖 0.3B–13B 模型：规模实验至少使用 91B Tokens，7B 代码模型进一步训练至约 200B、500B 和 1T Tokens；Byte-level 7B 模型使用约 314B Bytes（约 116B Token 等价量）。自然语言 7B 模型使用约 200B 和 500B Tokens。另在 CodeContests、九个摘要数据集、儿童故事/图书混合语料及合成多项式算术任务上进行微调或受控实验。论文未公开大规模预训练语料的完整来源与配比。",
        "objective": "核心目标为 L_n = -Σ_t Σ_{i=1}^n log P_θ(x_{t+i}|x_{1:t})，即对 n 个预测距离的交叉熵等权求和并联合更新共享主干。实现上逐 Head 前向/反向并累计主干梯度，将峰值显存从 O(nV+d) 降至 O(V+d)。训练统一采用 Adam（β1=0.9，β2=0.95）、0.1 解耦权重衰减、线性 Warmup 与余弦衰减；除 CodeContests 微调外梯度范数裁剪为 1.0。"
      },
      "evaluation": {
        "targetModels": [
          "从头训练的 Decoder-only Transformer：0.3B、0.6B、1.3B、3B、6.7B（7B）和 13B",
          "7B Token-level 代码模型：n=1/2/4/6/8，训练规模约 200B、500B 和 1T Tokens",
          "7B Byte-level 代码模型：n=1/8/16/32，训练约 314B Bytes",
          "7B 自然语言模型：n=1/2/4，训练约 200B 和 500B Tokens",
          "1M–1B 小型 Transformer，用于归纳能力和合成算法推理实验"
        ],
        "benchmarks": [
          "MBPP",
          "HumanEval",
          "APPS/Intro",
          "CodeContests",
          "ARC Challenge",
          "COPA",
          "HellaSwag",
          "Natural Questions",
          "PIQA",
          "SIQA",
          "TriviaQA",
          "GSM8K",
          "BigPatent",
          "CNN/DailyMail",
          "Multi-News",
          "OrangeSum",
          "pn-summary",
          "SAMSum",
          "ThaiSum",
          "WikiSummary",
          "XSum",
          "儿童故事归纳测试",
          "F7[X]/(X^5) 多项式算术任务",
          "Wikipedia、Books 与 Held-out Code 自投机解码测试集"
        ],
        "baselines": [
          "等参数、等训练 Token 与等计算预算的标准 next-token prediction 模型（n=1）",
          "CodeContests 中从 next-token 预训练模型直接微调的基线",
          "合成任务中的更大 next-token 模型，用于比较扩大模型规模与更换训练目标的收益"
        ],
        "metrics": [
          "pass@1 / pass@10 / pass@100 / pass@1000",
          "任务准确率与 induction success",
          "ROUGE-1 / ROUGE-2 / ROUGE-3 / ROUGE-L / ROUGE-Lsum 的 Precision、Recall 与 F1",
          "相对自回归解码 Speedup",
          "Tokens per forward",
          "训练峰值显存与训练时间",
          "In-domain / Out-of-domain 算法推理准确率"
        ],
        "hardware": [
          "NVIDIA A100-80GB",
          "NVIDIA H100",
          "全文全部实验合计约 500K GPU-hours"
        ],
        "frameworks": [
          "xFormers（heterogeneous-batch greedy self-speculative decoding）"
        ]
      },
      "mainResults": [
        {
          "condition": "13B 代码模型，等参数与等训练预算",
          "metric": "HumanEval / MBPP solved problems",
          "result": "HumanEval 多解决约 12% 的问题，MBPP 多解决约 17% 的问题。",
          "comparison": "相对标准 next-token prediction 基线。",
          "source": "Abstract; Section 3.1; Figure 3"
        },
        {
          "condition": "7B、约 200B Token 代码预训练，n=4",
          "metric": "MBPP 与 HumanEval pass@1 / pass@10 / pass@100",
          "result": "MBPP 为 33.8 / 55.9 / 76.9，基线为 30.0 / 53.8 / 73.7；HumanEval 为 24.0 / 40.1 / 66.1，基线为 22.8 / 36.4 / 62.0。",
          "comparison": "绝对提升分别为 MBPP +3.8 / +2.1 / +3.2 个百分点，HumanEval +1.2 / +3.7 / +4.1 个百分点。",
          "source": "Section 3.4; Table 1"
        },
        {
          "condition": "7B Byte-level 模型，约 313B Bytes，n=8",
          "metric": "MBPP 与 HumanEval pass@1",
          "result": "MBPP 从 19.3 提升至 32.3，HumanEval 从 18.1 提升至 21.8。",
          "comparison": "相对 next-byte 基线分别多解决约 67% 和 20% 的问题。",
          "source": "Section 3.3; Table 1"
        },
        {
          "condition": "7B、4-token 模型，greedy 自投机解码，最大 Batch Size 42",
          "metric": "相对解码 Speedup / Tokens per forward",
          "result": "Code 达到 3.05× / 3.50，Wikipedia 达到 2.74× / 3.12，Books 达到 2.67× / 3.09。",
          "comparison": "相对同 Batch Size 的标准自回归解码；Speedup 在测试 Batch 范围内基本稳定。",
          "source": "Section 3.2; Appendix A, Figure S10 and Table S2"
        },
        {
          "condition": "7B Byte-level 模型，n=8，Batch Size 16",
          "metric": "自投机解码 Speedup / Tokens per forward",
          "result": "使用 8 个 Heads 时达到 6.39× Speedup，并平均每次前向推进 7.04 Bytes。",
          "comparison": "相对单 Head 自回归 Byte-level 解码。",
          "source": "Section 3.2–3.3; Appendix A, Table S3"
        },
        {
          "condition": "7B 代码模型，约 1T Tokens、约 4 Epochs，n=4",
          "metric": "MBPP pass@1 / HumanEval pass@100",
          "result": "仍分别保持 +2.4 和 +3.2 个百分点的提升。",
          "comparison": "相对相同数据与训练轮数的 next-token 模型；多数其他指标接近，优势较 200B Token 时缩小。",
          "source": "Section 3.5; Table 1"
        },
        {
          "condition": "7B 自然语言模型，200B / 500B Tokens",
          "metric": "九个摘要数据集平均 ROUGE-L F1",
          "result": "200B 时 n=2 / n=4 相对基线提升 +0.51 / +0.46；500B 时提升 +0.28 / +0.31。",
          "comparison": "多 Token 训练在生成式摘要上稳定优于 next-token 基线，但随数据增加差距缩小。",
          "source": "Section 3.7; Figure 6; Appendix H, Tables S8–S10"
        },
        {
          "condition": "受控归纳与多项式算术实验",
          "metric": "Induction success 与 In/Out-of-domain accuracy",
          "result": "2-token 目标显著促进 30M 及以下模型形成归纳能力；多 Token 训练在不同算术难度上均提高准确率，尤其改善分布外泛化。",
          "comparison": "在多项式任务中，从 next-token 改为 multi-token 的收益大于把模型从 30M 扩大到 100M。",
          "source": "Sections 4.1–4.2; Figures 7–8 and S16"
        }
      ],
      "limitations": [
        {
          "type": "规模敏感",
          "description": "收益不是小模型上的普遍规律：300M 和 600M 代码模型在多项 pass@k 指标上可能低于 next-token 基线，优势主要在 3B 以上逐渐出现。",
          "sourceType": "paper"
        },
        {
          "type": "任务与数据量敏感",
          "description": "7B 自然语言模型在选择题和似然型基准上没有稳定提升，4-token 模型还会回退；GSM8K 上 n=2 在 200B Tokens 时领先，但到 500B Tokens 后顺序反转，n=4 全程较差。",
          "sourceType": "paper"
        },
        {
          "type": "预测窗口需要手工选择",
          "description": "最优 n 随任务、语料分布和 Tokenization 改变：Token-level 代码的 MBPP/HumanEval 倾向 n=4，APPS/Intro 倾向 n=6，Byte-level 倾向 n=8。论文未给出自动选择机制，并将其列为未来工作。",
          "sourceType": "paper"
        },
        {
          "type": "块内依赖未显式建模",
          "description": "各未来 Head 都从同一历史表示独立预测，后续位置不条件于本轮已经采样的前序 Draft Token；因此线性块本质上是位置边缘预测的拼接，可能出现跨位置不一致。论文只指出可兼容 Medusa Tree Attention，没有新增依赖建模或选树算法。",
          "sourceType": "analysis"
        },
        {
          "type": "推理解码范围有限",
          "description": "端到端加速实验采用 greedy blockwise self-speculative decoding，主要证明确定性解码下与 Target greedy 输出一致；论文没有系统评测随机采样式 rejection sampling、动态 Draft/Verify 长度或生产级 Serving 吞吐。",
          "sourceType": "analysis"
        },
        {
          "type": "复现成本与资产缺失",
          "description": "全文实验约消耗 500K A100-80GB/H100 GPU-hours；论文及官方 PMLR、arXiv 页面未提供官方代码、模型权重或项目页，大规模预训练语料来源也未完整披露，完整复现门槛很高。",
          "sourceType": "analysis"
        }
      ],
      "relations": {
        "extends": [],
        "comparesAgainst": [],
        "related": [
          "medusa"
        ],
        "compatibleWith": [
          "medusa"
        ]
      },
      "citations": [
        "medusa"
      ],
      "reproducibility": {
        "codeUrl": null,
        "modelUrl": null,
        "projectPage": null,
        "officialImplementation": false,
        "status": "not-reproduced",
        "notes": [
          "论文、PMLR 页面和 arXiv 页面均未提供官方实现、模型权重或独立项目页。",
          "论文公开了模型结构、训练规模、优化器配置、主要超参数、评测协议及自投机解码表格，但未公开完整预训练数据构成和训练代码。",
          "推理部分明确使用 xFormers 实现 heterogeneous-batch greedy self-speculative decoding，可据此进行非官方复现。",
          "全文报告的总实验计算量约为 500K GPU-hours，硬件为 A100-80GB 与 H100。"
        ]
      },
      "evidence": [
        {
          "claim": "MTP 使用共享 Transformer 主干、n 个独立 Transformer 输出 Head 与共享 unembedding 矩阵，同时预测多个未来位置。",
          "location": "p. 2, Section 2, Figure 1",
          "type": "method"
        },
        {
          "claim": "逐 Head 前向与反向、累计主干梯度，可把峰值显存从 O(nV+d) 降至 O(V+d)，且不增加运行时间。",
          "location": "pp. 2–3, Section 2, Figure 2",
          "type": "method"
        },
        {
          "claim": "附加 Heads 可用于无需独立 Drafter 的 blockwise self-speculative decoding，并可兼容 Medusa 式 Tree Attention。",
          "location": "pp. 2–3, Section 2, Inference",
          "type": "method"
        },
        {
          "claim": "多 Token 训练的收益随模型规模扩大而增强，13B 模型在 HumanEval 和 MBPP 上分别多解决约 12% 和 17% 的问题。",
          "location": "p. 1 Abstract; p. 3 Section 3.1 and Figure 3",
          "type": "result"
        },
        {
          "claim": "7B、200B Token 与 Byte-level 代码模型的详细 pass@k 结果，以及 n 随任务变化的最优设置。",
          "location": "p. 4, Table 1, Sections 3.3–3.5",
          "type": "result"
        },
        {
          "claim": "4-token 模型在 Code/Wikipedia/Books 上实现约 3.05×/2.74×/2.67× 自投机加速；8-byte 模型用 8 Heads 达到 6.39×。",
          "location": "Appendix A, Figure S10 and Tables S2–S3 (PDF pp. 13–14)",
          "type": "result"
        },
        {
          "claim": "自然语言选择题基准没有稳定收益，4-token 模型回退；摘要生成则获得小幅稳定 ROUGE 提升。",
          "location": "pp. 5–6, Section 3.7; Appendix G–I",
          "type": "limitation"
        },
        {
          "claim": "多 Token 目标促进小模型形成 induction capability，并在合成多项式任务上改善分布外算法推理。",
          "location": "pp. 6–7, Sections 4.1–4.2, Figures 7–8",
          "type": "result"
        },
        {
          "claim": "作者将自动选择 n、联合优化词表大小及 embedding-space 辅助目标列为未来工作；全文实验约消耗 500K GPU-hours。",
          "location": "p. 9, Conclusion, Future Work and Environmental Impact",
          "type": "limitation"
        }
      ],
      "notes": [
        "Q：MTP 的核心贡献到底是投机解码，还是新的训练目标？\nA：核心是多 Token 预训练目标。自投机解码是该结构带来的附加能力；即使推理时丢弃未来 Heads，只保留 next-token Head，主干仍可能因多步监督而获得更好的生成与推理能力。",
        "Q：多个 Head 是不是像自回归 Drafter 一样，后一个预测会看到前一个 Draft Token？\nA：不是。各 Head 都只读取同一历史上下文的主干表示，并分别预测第 i 个未来位置；论文中的线性候选块是这些独立位置预测的 top-1 拼接，因此块内没有显式因果依赖。",
        "Q：为什么它能称为 lossless 自投机解码？\nA：论文实际采用 greedy blockwise 验证：Target 的 next-token Head 重新计算候选位置，只提交与 Target greedy 选择连续一致的最长前缀，因此结果与普通 greedy 解码一致；这不等于论文已经完整验证所有随机采样配置。"
      ],
      "qaNotes": [],
      "provenance": {
        "legacyWorkbookRow": 2,
        "workbookInstitutions": "Meta FAIR"
      },
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
      "venue": "ICML 2024",
      "date": "2024-01",
      "url": "https://proceedings.mlr.press/v235/li24bt.html",
      "localPdf": null,
      "explanationPage": null,
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
      "methodOverview": "不直接在离散 Token 空间 Draft，而是在 Target 倒数第二层的 Feature 空间自回归预测；同时引入错位一个位置的 Token 序列来消除 Feature 不确定性，最后再把 Feature 映射回 Token。",
      "problemStatement": {
        "background": null,
        "priorLimitation": null,
        "goal": null
      },
      "methodComponents": [],
      "characteristics": {
        "requiresTraining": null,
        "drafterType": null,
        "draftGeneration": null,
        "candidateStructure": null,
        "verificationStrategy": null,
        "usesTargetFeatures": null,
        "dynamicDraftLength": null,
        "dynamicVerifyLength": null,
        "lossless": null
      },
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
      "training": {
        "summary": "只训练轻量 Autoregression Head：以 Smooth L1 回归 Target 的下一 Feature，并用 0.1 权重的交叉熵对齐真实与预测 Feature 经 Target LM Head 得到的 Token 分布。",
        "data": null,
        "objective": null
      },
      "evaluation": {
        "targetModels": [],
        "benchmarks": [],
        "baselines": [],
        "metrics": [],
        "hardware": [],
        "frameworks": []
      },
      "mainResults": [],
      "limitations": [],
      "relations": {
        "extends": [],
        "comparesAgainst": [],
        "related": [
          "medusa",
          "specinfer"
        ],
        "compatibleWith": []
      },
      "citations": [
        "medusa",
        "specinfer"
      ],
      "reproducibility": {
        "codeUrl": null,
        "modelUrl": null,
        "projectPage": null,
        "officialImplementation": null,
        "status": "not-checked",
        "notes": []
      },
      "evidence": [],
      "notes": [],
      "qaNotes": [],
      "provenance": {
        "legacyWorkbookRow": 3,
        "workbookInstitutions": "清华大学、美国加州大学圣塔芭芭拉分校（UCSB）"
      },
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
      "venue": "EMNLP 2024",
      "date": "2024-06",
      "url": "https://aclanthology.org/2024.emnlp-main.422/",
      "localPdf": "../Reference/EAGLE2.pdf",
      "explanationPage": null,
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
      "methodOverview": "根据当前上下文动态构造 Draft Tree。每条路径的价值由沿途 Token 置信度连乘得到，算法先扩展高价值节点，再从全局保留固定预算内、前缀闭合的最优树。",
      "problemStatement": {
        "background": null,
        "priorLimitation": null,
        "goal": null
      },
      "methodComponents": [],
      "characteristics": {
        "requiresTraining": null,
        "drafterType": null,
        "draftGeneration": null,
        "candidateStructure": null,
        "verificationStrategy": null,
        "usesTargetFeatures": null,
        "dynamicDraftLength": null,
        "dynamicVerifyLength": null,
        "lossless": null
      },
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
      "training": {
        "summary": null,
        "data": null,
        "objective": null
      },
      "evaluation": {
        "targetModels": [],
        "benchmarks": [],
        "baselines": [],
        "metrics": [],
        "hardware": [],
        "frameworks": []
      },
      "mainResults": [],
      "limitations": [],
      "relations": {
        "extends": [],
        "comparesAgainst": [],
        "related": [
          "medusa",
          "eagle"
        ],
        "compatibleWith": []
      },
      "citations": [
        "medusa",
        "eagle"
      ],
      "reproducibility": {
        "codeUrl": null,
        "modelUrl": null,
        "projectPage": null,
        "officialImplementation": null,
        "status": "not-checked",
        "notes": []
      },
      "evidence": [],
      "notes": [],
      "qaNotes": [],
      "provenance": {
        "legacyWorkbookRow": 4,
        "workbookInstitutions": "清华大学、美国加州大学圣塔芭芭拉分校（UCSB）"
      },
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
      "venue": "NeurIPS 2025",
      "date": "2025-03",
      "url": "https://proceedings.neurips.cc/paper_files/paper/2025/hash/c7b5a35ea98b62512a869c19ea7b03cb-Abstract-Conference.html",
      "localPdf": "../Reference/EAGLE3.pdf",
      "explanationPage": null,
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
      "methodOverview": "从 Feature 回归转为直接预测 Token，并融合 Target 的浅层、中层和深层 Feature。Training-Time Test 在 Training 时模拟多步 Rollout，使训练分布更贴近真正的投机解码过程。",
      "problemStatement": {
        "background": "EAGLE 系列通过复用 Target 模型内部 Feature，让一个极轻量的 Drafter 比独立小模型更准确地生成候选 Token；EAGLE-2 又以 Drafter 置信度构造上下文相关的动态候选树，提高固定验证预算的利用率。",
        "priorLimitation": "原始 EAGLE 要求 Drafter 同时拟合 Target 顶层 Feature 和 Token 分布。Feature 回归是额外约束，限制了 Drafter 的表达能力，使扩大训练数据后收益很快饱和；若直接删除 Feature Loss，训练时使用真实 Target Feature、测试时回灌 Drafter 自身输出又会造成严重的 Train-Test Distribution Shift。此外，Target 顶层 Feature 主要服务下一 Token Logit，只依赖它难以预测更远位置。",
        "goal": "移除 Feature 回归约束并直接优化 Token 预测，同时在训练阶段显式模拟真实多步 Draft Rollout；再融合 Target 低、中、高层语义，使轻量 Drafter 能稳定利用更大训练数据，提高多步接受率、动态树深度和端到端推理速度。"
      },
      "methodComponents": [
        {
          "name": "Direct Token Prediction",
          "stage": "Draft objective",
          "purpose": "解除 Feature 回归对 Drafter 表达能力和数据扩展收益的限制。",
          "mechanism": "删除 EAGLE 中将 Drafter 输出拟合到 Target 顶层 Feature 的 Feature Prediction Loss，只保留经 Target LM Head 得到的 Token Prediction 目标。Drafter 输出不再必须落入某个指定 Target Feature 空间，可直接为候选 Token 分布优化。",
          "differenceFromPrior": "EAGLE 和 HASS 都保留 Feature Prediction Constraint，并在 Feature 空间执行自回归；EAGLE-3 改为直接预测 Token。"
        },
        {
          "name": "Multi-Layer Feature Fusion",
          "stage": "Target conditioning",
          "purpose": "为多步未来 Token 预测提供比单一顶层 Feature 更丰富的语法、语义和下一 Token 信息。",
          "mechanism": "从 Target 模型提取低层、中层和高层 Hidden States，在每个上下文位置拼接为 3k 维向量，再通过全连接层压回 k 维，形成融合 Feature g。该 Feature 与已采样 Token Embedding 拼接、投影后输入单层 Transformer Decoder。",
          "differenceFromPrior": "EAGLE、EAGLE-2、Medusa 和 HASS 主要复用 LM Head 前的顶层 Feature；EAGLE-3 改为融合低、中、高三个层级。"
        },
        {
          "name": "Training-Time Test",
          "stage": "Training",
          "purpose": "消除删除 Feature Loss 后，训练阶段真实 Feature 输入与测试阶段 Drafter 自回归输出之间的分布偏移。",
          "mechanism": "训练中执行 5 步模拟 Rollout：每一步将 Drafter 生成的中间表示和采样 Token 回灌为下一步输入，并使用树状依赖的特制 Attention Mask 一次组织多轮分支；每个模拟位置仍以训练序列中的真实下一 Token 为监督。",
          "differenceFromPrior": "普通 Teacher Forcing 只让 Drafter 看到真实 Target Feature；EAGLE-3 在训练时直接执行与测试一致的自回归输入回灌。HASS 也模拟多步过程，但仍保留 Feature 回归约束且只使用顶层 Feature。"
        },
        {
          "name": "Context-Aware Dynamic Draft Tree",
          "stage": "Candidate construction",
          "purpose": "将更稳定的多步 Token 预测转化为更高的候选覆盖率，同时避免静态树在不同上下文中浪费验证节点。",
          "mechanism": "直接继承 EAGLE-2 的置信度驱动动态 Draft Tree：在 Draft 阶段扩展多个候选并按置信度剪枝，保持与 EAGLE-2 相同的节点预算；由于后续位置接受率更稳定，最大树深由 6 提高到 8。",
          "differenceFromPrior": "EAGLE 和 Medusa 使用预定义、上下文无关的静态树；动态树本身来自 EAGLE-2，EAGLE-3 的贡献是提高 Drafter 质量并允许更深扩展。"
        }
      ],
      "characteristics": {
        "requiresTraining": true,
        "drafterType": "feature-assisted-autoregressive",
        "draftGeneration": "autoregressive",
        "candidateStructure": "dynamic-tree",
        "verificationStrategy": "tree-attention",
        "usesTargetFeatures": true,
        "dynamicDraftLength": false,
        "dynamicVerifyLength": false,
        "lossless": true
      },
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
      "training": {
        "summary": "Training-Time Test 在训练中把每轮 Drafter 输出作为下一轮输入，并用树状依赖注意力掩码一次模拟 5 步推理，以训练数据 Token 监督各步预测。",
        "data": "通用 Drafter 使用约 68K 条 ShareGPT 和约 464K 条 UltraChat-200K Prompt，共约 532K 条；不直接使用数据集原始 Response，而是调用对应 Target 模型重新生成训练 Response。DeepSeek-R1-Distill-LLaMA-8B 的 Drafter 额外加入 OpenThoughts-114k-math。论文总体训练数据规模约为原始 EAGLE 的 8 倍。",
        "objective": "移除 Feature Prediction Loss，仅以真实下一 Token 监督经 Target LM Head 输出的 Token 分布；训练中模拟 5 步 Training-Time Test Rollout 并回灌 Drafter 自身输出。优化器为 AdamW，β=(0.9, 0.95)，学习率 5e-5，Gradient Clipping 0.5。"
      },
      "evaluation": {
        "targetModels": [
          "Vicuna-13B",
          "LLaMA-3.1-8B-Instruct",
          "LLaMA-3.3-70B-Instruct",
          "DeepSeek-R1-Distill-LLaMA-8B"
        ],
        "benchmarks": [
          "MT-Bench",
          "HumanEval",
          "GSM8K",
          "Alpaca",
          "CNN/Daily Mail"
        ],
        "baselines": [
          "Autoregressive Decoding",
          "Standard Speculative Sampling",
          "PLD",
          "Medusa",
          "Lookahead",
          "Hydra",
          "HASS",
          "EAGLE",
          "EAGLE-2"
        ],
        "metrics": [
          "Speedup Ratio",
          "Average Acceptance Length",
          "Position-wise Conditional Acceptance Rate",
          "Serving Throughput"
        ],
        "hardware": [
          "NVIDIA A100",
          "NVIDIA RTX 3090",
          "NVIDIA H100",
          "16× NVIDIA A100（70B Drafter 训练）"
        ],
        "frameworks": [
          "Hugging Face Transformers",
          "PyTorch",
          "SGLang v0.4.4",
          "vLLM"
        ]
      },
      "mainResults": [
        {
          "condition": "Vicuna-13B，Temperature=0，五个基准宏平均",
          "metric": "Speedup Ratio / Average Acceptance Length",
          "result": "5.51× / 6.62",
          "comparison": "EAGLE-2 为 4.22× / 4.83；EAGLE-3 的平均速度提升约 30.6%。",
          "source": "Table 1"
        },
        {
          "condition": "Vicuna-13B，HumanEval，Temperature=0",
          "metric": "Speedup Ratio / Average Acceptance Length",
          "result": "6.47× / 7.54",
          "comparison": "为论文报告的最高端到端速度与接受长度；摘要将最高速度概括为 6.5×。",
          "source": "Table 1"
        },
        {
          "condition": "LLaMA-3.1-8B-Instruct，Temperature=0，五个基准宏平均",
          "metric": "Speedup Ratio / Average Acceptance Length",
          "result": "4.44× / 6.23",
          "comparison": "EAGLE-2 为 3.23× / 4.11，HASS 为 3.42× / 4.37。",
          "source": "Table 1"
        },
        {
          "condition": "LLaMA-3.3-70B-Instruct，Temperature=0，五个基准宏平均",
          "metric": "Speedup Ratio / Average Acceptance Length",
          "result": "4.12× / 5.88",
          "comparison": "EAGLE-2 为 2.85× / 3.78。",
          "source": "Table 1"
        },
        {
          "condition": "DeepSeek-R1-Distill-LLaMA-8B，Temperature=0，五个基准宏平均",
          "metric": "Speedup Ratio / Average Acceptance Length",
          "result": "4.16× / 5.84",
          "comparison": "EAGLE-2 为 3.26× / 3.92；在 GSM8K 上 EAGLE-3 达到 5.01× / 6.93，额外数学训练数据使该任务成为此模型的最优项。",
          "source": "Table 1"
        },
        {
          "condition": "LLaMA-3.1-8B-Instruct，MT-Bench，训练数据从 1× ShareGPT 扩展到 8×",
          "metric": "Data Scaling",
          "result": "EAGLE-3 的 Speedup 约从 3.7× 持续升至 4.4×，Acceptance Length 约从 5.2 升至 6.1。",
          "comparison": "EAGLE-2 和 HASS 的曲线基本饱和，说明移除 Feature Constraint 后才出现明显的数据扩展收益。",
          "source": "Figure 2; Figure 8"
        },
        {
          "condition": "LLaMA-3.1-8B-Instruct，MT-Bench / GSM8K，Temperature=0",
          "metric": "Architecture Ablation",
          "result": "MT-Bench 从 EAGLE-2 的 3.16×/4.05，提高到去除 Feature Constraint 的 3.82×/5.37，再提高到融合多层 Feature 的 4.40×/6.13；GSM8K 对应为 3.39×/4.24 → 3.77×/5.22 → 4.48×/6.23。",
          "comparison": "两项架构修改均产生独立增益，多层 Feature Fusion 的增益在 MT-Bench 上更明显。",
          "source": "Table 2"
        },
        {
          "condition": "LLaMA-3.1-8B-Instruct，MT-Bench，SGLang v0.4.4，单张 H100",
          "metric": "Serving Throughput",
          "result": "Batch Size=64 时为无投机 Baseline 的 1.38×；Batch Size=1 时吞吐为 373.25 tokens/s。",
          "comparison": "Batch Size=1 的无投机 SGLang 为 158.34 tokens/s，EAGLE-2 为 244.10 tokens/s；EAGLE 在 Batch Size=64 时仅为 0.99×。",
          "source": "Tables 3–4"
        },
        {
          "condition": "LLaMA-3.1-8B-Instruct，MT-Bench，vLLM，RTX 3090",
          "metric": "Large-Batch Throughput",
          "result": "Batch Size 2–56 的相对吞吐依次为 1.75×、1.68×、1.58×、1.49×、1.42×、1.36×、1.21×、1.01×。",
          "comparison": "EAGLE 从 Batch Size=32 起低于无投机 Baseline，而 EAGLE-3 到 Batch Size=56 仍未跌破 1×。",
          "source": "Table 5"
        }
      ],
      "limitations": [
        {
          "type": "evaluation-scale",
          "description": "受 GPU 资源限制，论文只评测到 70B Target，没有验证在更大 Dense 或 MoE 模型上的接受率、训练成本和端到端收益。",
          "sourceType": "paper"
        },
        {
          "type": "training-cost",
          "description": "每个 Target 都需要单独训练 Drafter；论文训练 LLaMA-3.3-70B 的 EAGLE-3 Head 使用 16 张 A100，持续约两周。扩大数据能够继续提升性能，但也直接提高 Target 重生成和 Drafter 训练成本。",
          "sourceType": "paper"
        },
        {
          "type": "algorithmic",
          "description": "候选 Token 仍由单层 Transformer Drafter 多步自回归生成，Draft 延迟随 Rollout 深度增长。EAGLE-3 提高的是每一步的准确率和可用树深，并没有消除串行 Draft 本身。",
          "sourceType": "analysis"
        },
        {
          "type": "model-access",
          "description": "方法需要读取 Target 的低、中、高层 Hidden States，并为具体 Target 训练匹配的 Drafter；对于不暴露中间表示的闭源 API，不能直接作为外挂式黑盒加速器。",
          "sourceType": "analysis"
        },
        {
          "type": "serving-evidence",
          "description": "SGLang 与 vLLM 的大 Batch 实验都关闭了候选树，只使用长度 3 或 2 的短链，因此这些吞吐结果证明了 EAGLE-3 Head 的 Serving 适配性，但不能直接代表完整动态 Draft Tree 在大并发下的成本。",
          "sourceType": "paper"
        },
        {
          "type": "reporting",
          "description": "论文的 NeurIPS Checklist 声称限制见 Section 6，但 Section 6 实际只有结论，没有单独、系统地讨论方法限制；对适用边界的说明主要散落在实验设置中。",
          "sourceType": "analysis"
        }
      ],
      "relations": {
        "extends": [
          "eagle",
          "eagle-2"
        ],
        "comparesAgainst": [
          "medusa",
          "eagle",
          "eagle-2",
          "hass"
        ],
        "related": [
          "medusa",
          "eagle",
          "eagle-2"
        ],
        "compatibleWith": []
      },
      "citations": [
        "medusa",
        "eagle",
        "eagle-2"
      ],
      "reproducibility": {
        "codeUrl": "https://github.com/SafeAILab/EAGLE",
        "modelUrl": "https://huggingface.co/yuhuili/EAGLE3-LLaMA3.1-Instruct-8B",
        "projectPage": null,
        "officialImplementation": true,
        "status": "not-reproduced",
        "notes": [
          "官方 SafeAILab/EAGLE 仓库同时维护 EAGLE、EAGLE-2 和 EAGLE-3，实现中通过 --use_eagle3 启用 EAGLE-3。",
          "官方 Hugging Face 账号 yuhuili 发布了 LLaMA-3.1-8B、LLaMA-3.3-70B、Vicuna-13B 和 DeepSeek-R1-Distill-LLaMA-8B 等 EAGLE-3 Checkpoint。",
          "论文给出了主要优化器、学习率、Training-Time Test 步数、数据来源、硬件和各基线设置，但本文档尚未进行独立复现。"
        ]
      },
      "evidence": [
        {
          "claim": "EAGLE 的 Feature Prediction Constraint 限制 Drafter 表达能力，使扩大训练数据的收益很快饱和。",
          "location": "Abstract; Section 1, Figures 2–4, Pages 1–3",
          "type": "motivation"
        },
        {
          "claim": "EAGLE-3 删除 Feature Prediction Loss，改为直接预测 Token，并融合 Target 的低、中、高层 Feature。",
          "location": "Section 1; Section 3.1, Figures 3 and 5, Pages 3–5",
          "type": "method"
        },
        {
          "claim": "Training-Time Test 将 Drafter 输出回灌为下一步输入，并通过特制 Attention Mask 模拟多步测试过程。",
          "location": "Section 3.2, Figure 6, Pages 5–6",
          "type": "training"
        },
        {
          "claim": "EAGLE-3 继承 EAGLE-2 的上下文感知动态 Draft Tree，并将最大深度由 6 提高到 8。",
          "location": "Section 2.2, Page 4; Appendix A, Page 12",
          "type": "candidate-structure"
        },
        {
          "claim": "通用训练数据由约 68K ShareGPT 和约 464K UltraChat-200K 组成，Response 由 Target 重生成；推理模型额外使用 OpenThoughts-114k-math。",
          "location": "Section 4 Implementation, Page 7",
          "type": "training"
        },
        {
          "claim": "EAGLE-3 在四类 Target、五个任务和 Temperature 0/1 设置下显著超过 EAGLE-2，最高达到 6.47× Speedup 和 7.54 Average Acceptance Length。",
          "location": "Table 1, Page 7",
          "type": "result"
        },
        {
          "claim": "去除 Feature Constraint 和融合多层 Feature 均能独立提高 Speedup 与 Acceptance Length。",
          "location": "Section 4.2, Table 2, Page 8",
          "type": "ablation"
        },
        {
          "claim": "在单张 H100 的 SGLang 中，EAGLE-3 在 Batch Size=64 仍达到 1.38× 吞吐；Batch Size=1 为 373.25 tokens/s。",
          "location": "Section 4.3, Tables 3–4, Pages 8–9",
          "type": "system"
        },
        {
          "claim": "vLLM 实验中 EAGLE-3 到 Batch Size=56 仍保持 1.01×，而 EAGLE 在更早的 Batch Size 下已经低于 Baseline。",
          "location": "Section 4.4, Table 5, Page 9",
          "type": "system"
        },
        {
          "claim": "70B EAGLE-3 Head 的训练使用 16 张 A100，持续约两周；论文未测试超过 70B 的 Target。",
          "location": "Section 4 Models and Implementation, Pages 6–7",
          "type": "limitation"
        }
      ],
      "notes": [
        "EAGLE-3 的核心不是简单把 Feature Prediction 改成 Token Prediction；单独删除 Feature Loss 会让第二步接受率崩溃，Training-Time Test 才是使 Direct Token Prediction 可用于多步 Draft 的关键闭环。",
        "论文的“数据 Scaling Law”主要在 LLaMA-3.1-8B + MT-Bench 上展示。它证明该架构在该设置下能继续吃数据，但不能直接推出所有 Target、任务和更大数据规模都按相同比例增长。",
        "最高 6.5× 来自 Vicuna-13B 的 HumanEval 单项；更具代表性的宏平均为 Vicuna-13B 5.51×、LLaMA-3.1-8B 4.44×、LLaMA-3.3-70B 4.12×、DeepSeek-R1-Distill-LLaMA-8B 4.16×。",
        "EAGLE-3 提高接受长度后把动态树最大深度从 6 提到 8，但节点预算保持不变。提升来自更可靠的深层路径，而不是无上限扩大验证树。",
        "SGLang 和 vLLM 的大 Batch 实验采用短 Chain 而非完整动态 Tree；阅读吞吐数字时应区分 Drafter Head 本身的收益与 Tree Verification 的额外成本。",
        "从技术谱系看，EAGLE-3 解决的是 Feature Drafter 的表达约束和训练分布错位，仍属于自回归 Draft 路线；后续并行或半自回归工作针对的是其串行 Draft 延迟这一不同瓶颈。"
      ],
      "qaNotes": [],
      "provenance": {
        "legacyWorkbookRow": 5,
        "workbookInstitutions": "清华大学"
      },
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
      "venue": "arXiv",
      "date": "2025-05",
      "url": "https://arxiv.org/abs/2505.24544",
      "localPdf": "../Reference/BEAGLE.pdf",
      "explanationPage": null,
      "institutionDetails": [
        {
          "name": "LG电子多伦多人工智能实验室",
          "order": 1,
          "explanation": "全部作者均来自该实验室。"
        }
      ],
      "institutionSource": "https://arxiv.org/html/2505.24544v3",
      "methodOverview": "让 Drafter 通过 Cross-Attention 读取固定的 Target 上下文，而不是依赖紧耦合的 Self-Attention 或逐层 Feature 融合。两阶段 Block-Attention Training 降低多步模拟的显存开销。",
      "problemStatement": {
        "background": "高性能投机解码通常训练一个与 Target 紧密对齐的轻量 Drafter，并通过自回归候选生成与树形并行验证提高每轮接受长度。其端到端收益同时取决于 Drafter 的预测准确度、Draft 开销和 Verify 开销。",
        "priorLimitation": "EAGLE 等主流方法使用 Self-Attention 同时处理低层 Token Embedding 与高层 Target Hidden State，需要额外的 Pooling、Feature Fusion、复制和拼接操作；非标准组件增加模型集成复杂度和显存移动。仅用一步 NTP 又无法覆盖 Drafter 在推理中反复依赖自身预测状态造成的分布偏移，而完整 Training-Time Test 会随模拟步数增加训练时间和显存。",
        "goal": "以最小化的 Cross-Attention Drafter 取代紧耦合 Self-Attention 结构，在不使用辅助 Pooling 或 Fusion 层的情况下达到与 EAGLE-v2 同量级的接受长度和速度，并通过两阶段训练降低多步推理模拟的训练成本与显存需求。"
      },
      "methodComponents": [
        {
          "name": "Minimal Cross-Attention Drafter",
          "stage": "Draft modeling",
          "purpose": "用标准且更易集成的注意力结构连接 Token 输入与 Target 高层表示。",
          "mechanism": "Drafter 仅包含一层 Cross-Attention 和一个 MLP。当前 Token Embedding 产生 Query，Target 顶层 Hidden State 或 Drafter 已预测的高层状态产生 Key/Value；注意力掩码同时遮蔽对角线和未来位置，使位置 i 只能读取 j<i 的状态。输出再通过共享词表空间的 LM Head 预测下一 Token。",
          "differenceFromPrior": "EAGLE 使用 Self-Attention 处理异质的 Token Embedding 与 Target Feature，并依赖额外 Pooling、复制和拼接；Beagle 通过分离 Q 与 K/V 的来源直接处理两类表示，移除这些辅助组件和约一半注意力参数。"
        },
        {
          "name": "Append-Only Cross-Attention KV Cache",
          "stage": "Autoregressive drafting",
          "purpose": "降低逐步 Draft 时的状态复制、拼接和内存移动。",
          "mechanism": "推理时复用历史 Cross-Attention K/V；每预测一个新高层状态，只向 Drafter KV Cache 追加对应 K/V，而无需重新生成全部 Query 或复制完整 Target Feature。当前投机轮结束后，丢弃未被 Target 确认的预测状态，将 Cache 恢复为仅含真实 Target 状态。",
          "differenceFromPrior": "EAGLE 在每个 Draft Step 复制并拼接高层状态作为下一步输入；Beagle 采用追加式 K/V 更新，改善内存局部性。"
        },
        {
          "name": "Early-Stage Inverse Block-Attention",
          "stage": "Training epochs 1–10",
          "purpose": "以一次并行训练覆盖多个未来位置，并将更远 Token 信息压入 Drafter 表示。",
          "mechanism": "把序列按带随机 Offset 的固定窗口划分；窗口内每个 Query 都遮蔽该窗口的全部局部未来 Key，因此同一上下文状态需并行预测未来 1 到 k 个位置。所有 Query 均参与反向传播，Early Loss 对各 Lookahead Token 的 Target 分布交叉熵求和。",
          "differenceFromPrior": "一步 NTP 只优化即时下一 Token；逐步 TTT 则需要为每个模拟步骤展开计算。该阶段用 Block-Attention 一次处理多个未来目标，训练吞吐更高。"
        },
        {
          "name": "Late-Stage In-Place Simulation",
          "stage": "Training epochs 11–20",
          "purpose": "对齐真实自回归 Draft 中依赖自身预测状态的推理轨迹。",
          "mechanism": "在窗口内将上一步预测的高层状态原位写入 Key/Value，并扩展注意力掩码，使后续预测读取已生成状态；Cross-Attention 不需要随模拟步数新增 Query，训练显存近似保持常量。Late Loss 仅监督每个模拟步骤的即时下一 Token，并按该步骤对期望接受长度的贡献赋予 k−i+1 权重。",
          "differenceFromPrior": "Self-Attention TTT 通常同时展开 Query 和 Hidden State，显存随步数增长；Beagle 只原位追加预测 Key，三步模拟可在单张 24 GiB GPU 上训练 7B Target 的 Drafter。"
        },
        {
          "name": "EAGLE-2 Dynamic Draft Tree",
          "stage": "Candidate construction and verification",
          "purpose": "在固定 Verify 节点预算内组织多条高概率候选路径。",
          "mechanism": "推理阶段沿用 EAGLE-2 的动态 Draft Tree 与 Tree Attention；论文对齐配置为最大深度 1+6、Top-k=10、每轮最多 60 个候选节点，再由 Target 在一次前向中并行验证。",
          "differenceFromPrior": "该组件直接复用 EAGLE-2 的候选组织与验证策略，不是 Beagle 的主要结构创新；论文创新集中在 Cross-Attention Drafter 和两阶段训练。"
        }
      ],
      "characteristics": {
        "requiresTraining": true,
        "drafterType": "cross-attention-transformer",
        "draftGeneration": "autoregressive",
        "candidateStructure": "dynamic-tree",
        "verificationStrategy": "tree-attention",
        "usesTargetFeatures": true,
        "dynamicDraftLength": false,
        "dynamicVerifyLength": false,
        "lossless": true
      },
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
      "training": {
        "summary": "在 ShareGPT 上训练 20 个 Epoch：前 10 个 Epoch 使用并行多 Token 的 Early-Stage Inverse Block-Attention，后 10 个 Epoch 使用原位回灌预测 Key 的 Late-Stage Simulation。正式配置采用 Context Length 2048、Batch Size 16、TF32 权重训练、AdamW、3e-5 恒定学习率、2000 Step Warmup 和 0.5 Gradient Norm；Target Hidden States 预先离线生成并以半精度保存。",
        "data": "仅使用 ShareGPT，包含 6 万余条 ChatGPT 与用户的多轮对话，以便和 EAGLE、Medusa、Clover-2 等相近数据规模的基线公平比较。训练所需 Target Hidden States 离线预计算，以减少训练时间和显存。",
        "objective": "Early Loss 在随机 Offset 的长度 k 窗口内，让每个上下文状态并行匹配未来 1…k 个 Target Token 分布；Late Loss 按真实自回归路径原位模拟多个步骤，仅优化各步即时下一 Token，并以 k−i+1 近似其对期望接受长度的贡献。两阶段均加入 Target Hidden State 的 Gaussian Noise N(0,0.2) 和系数 10 的 Hidden-State Distillation/Regression Loss；正式配置 Early Window k=5、Late Simulation Steps s=4。"
      },
      "evaluation": {
        "targetModels": [
          "Vicuna-7B",
          "LLaMA-2-7B",
          "LLaMA-3-7B（按论文标注）"
        ],
        "benchmarks": [
          "MT-Bench",
          "GSM8K",
          "CNN/DailyMail（1000-sample subset）"
        ],
        "baselines": [
          "Autoregressive Decoding",
          "HuggingFace TGI + LLaMA/Vicuna-68M Drafter",
          "Medusa",
          "Self-Speculative Decoding",
          "Clover-2",
          "EAGLE-v1",
          "EAGLE-v2"
        ],
        "metrics": [
          "Tokens per Second",
          "End-to-end Speedup",
          "Average Acceptance Length",
          "Per-position Acceptance Rate",
          "GPU Peak Memory"
        ],
        "hardware": [
          "NVIDIA A6000 Ada",
          "NVIDIA A10G on Amazon AWS",
          "Single 24 GiB GPU for three-step training feasibility"
        ],
        "frameworks": [
          "HuggingFace Transformers",
          "PyTorch Eager Mode",
          "HuggingFace Text Generation Inference",
          "pytorch:2.6.0-cuda11.8-cudnn9-runtime"
        ]
      },
      "mainResults": [
        {
          "condition": "Vicuna-7B，NVIDIA A6000 Ada，MT-Bench，Batch Size 1 Greedy Decoding",
          "metric": "Speed / Speedup / Acceptance Length / Peak Memory",
          "result": "104.6 tokens/s / 3.0× / 4.1 / 13.5 GiB",
          "comparison": "EAGLE-v2 为 103.4 tokens/s / 2.9× / 4.0 / 14.5 GiB；该任务上 Beagle 略快且少用约 1.0 GiB 显存。",
          "source": "Table 1"
        },
        {
          "condition": "LLaMA-2-7B，NVIDIA A6000 Ada，MT-Bench 与 GSM8K",
          "metric": "End-to-end Speedup and Peak Memory",
          "result": "MT-Bench 3.0×、GSM8K 3.2×；峰值显存分别为 13.5 GiB 和 13.2 GiB",
          "comparison": "EAGLE-v2 的速度同为 3.0× 和 3.2×，但峰值显存为 15.5 GiB 和 15.4 GiB；Beagle 在相同速度下节省约 2 GiB。",
          "source": "Table 1"
        },
        {
          "condition": "LLaMA-3，NVIDIA A6000 Ada，三个基准",
          "metric": "End-to-end Speedup and Peak Memory",
          "result": "MT-Bench/GSM8K/CNN-Daily 分别为 2.5×/2.6×/2.0×，峰值显存 15.7/15.5/16.0 GiB",
          "comparison": "EAGLE-v2 分别为 2.5×/2.6×/2.1×，峰值显存 17.8/17.7/18.1 GiB；速度基本持平，Beagle 少用约 2.1–2.2 GiB。",
          "source": "Table 1"
        },
        {
          "condition": "LLaMA-2-7B，NVIDIA A10G，GSM8K",
          "metric": "Speed / Speedup / Acceptance Length / Peak Memory",
          "result": "43.5 tokens/s / 3.3× / 4.4 / 13.2 GiB",
          "comparison": "EAGLE-v2 为 42.8 tokens/s / 3.2× / 4.4 / 15.4 GiB；低档 GPU 上仍保持相同接受长度和更低显存。",
          "source": "Table 2"
        },
        {
          "condition": "A6000 Ada 与 A10G 的总体评测",
          "metric": "GPU Peak Memory",
          "result": "Beagle 的峰值显存通常接近无投机解码 Target Baseline",
          "comparison": "论文总结 EAGLE-v2 相对 Target 额外消耗约 10%–15% GPU Memory，而 Beagle 的额外显存较小。",
          "source": "Section 5.2; Tables 1–2"
        },
        {
          "condition": "MT-Bench，训练目标消融",
          "metric": "Average Acceptance Length",
          "result": "由单步 NTP 改为 Early-Stage Multi-token Prediction 后约增加 0.3；再加入 Late-Stage Exact Simulation 后再增加约 0.3",
          "comparison": "两阶段对接受长度的收益近似叠加；更多模拟步骤主要改善中后部 Draft Token。",
          "source": "Figure 10; Appendix A.4"
        },
        {
          "condition": "MT-Bench，Early-Stage Window Size 从 1 调至 5",
          "metric": "Inference Speed and Position-wise Acceptance",
          "result": "Window=3 在该消融中取得最高最终推理速度",
          "comparison": "增大窗口能减缓后部 Token 接受率衰减，但过大的窗口会牺牲最关键的第一 Token 准确率。",
          "source": "Figure 4; Section 5.3"
        },
        {
          "condition": "Draft Runtime Decomposition，动态树配置",
          "metric": "End-to-end Speed",
          "result": "关闭新预测 Hidden State 的显式 Concatenation，速度最多下降约 3%",
          "comparison": "在内存搬移代价高的设备上，可用轻微速度损失换取更简单的追加式实现。",
          "source": "Figure 11; Appendix A.4"
        }
      ],
      "limitations": [
        {
          "type": "modeling-assumption",
          "description": "Late Loss 的理论解释假设并行预测的第 i 个未来 Token 准确率按几何规律衰减；论文承认该假设不一定严格符合真实观测，因此其接受长度代理的理论推导更接近解释性近似，而非严格的数据生成模型。",
          "sourceType": "paper"
        },
        {
          "type": "evaluation-scope",
          "description": "实验限定为 Batch Size 1 的 Greedy、Lossless Decoding；高并发吞吐、Sampling 模式和生产级 Serving 优化均未评估，并被明确留作后续工作。",
          "sourceType": "paper"
        },
        {
          "type": "comparison",
          "description": "为保持训练数据规模一致，论文没有比较使用约 8 倍数据的 EAGLE-v3，也没有比较全程采用更昂贵 Training-Time Test 的方法，因此结论只能支持“同数据预算下的架构替代”，不能代表当时绝对最强速度。",
          "sourceType": "paper"
        },
        {
          "type": "scaling",
          "description": "受计算资源和公开 Checkpoint 限制，Target 仅覆盖约 7B 级 Vicuna、LLaMA-2 和 LLaMA-3；没有验证更大 Dense/MoE 模型、长上下文或多模态模型上的扩展性。",
          "sourceType": "paper"
        },
        {
          "type": "latency",
          "description": "Beagle 在推理阶段仍是逐 Token 自回归 Drafter，Draft 延迟会随树深和步数增长；它主要减少结构与内存开销，并未消除 EAGLE 路线的串行 Draft 瓶颈。",
          "sourceType": "analysis"
        },
        {
          "type": "evidence",
          "description": "Beagle 并非在所有任务上都优于 EAGLE-v2：例如 A6000 Ada 的 Vicuna-GSM8K 和 CNN-Daily 上分别为 3.1×、2.4×，低于 EAGLE-v2 的 3.4×、2.6×。论文证据更准确地支持“性能同档且显存更低”，而不是全面提速。",
          "sourceType": "observed-data"
        },
        {
          "type": "configuration",
          "description": "Figure 4 的 MT-Bench 消融显示 Early Window=3 的最终速度最佳，但 Appendix A.3 的正式训练配置使用 k=5；论文没有充分解释为何主配置没有采用该消融最优值，跨模型超参数稳健性仍不清楚。",
          "sourceType": "observed-data"
        }
      ],
      "relations": {
        "extends": [
          "eagle-2"
        ],
        "comparesAgainst": [
          "medusa",
          "eagle",
          "eagle-2"
        ],
        "related": [
          "medusa",
          "eagle",
          "eagle-2",
          "eagle-3",
          "specinfer"
        ],
        "compatibleWith": []
      },
      "citations": [
        "medusa",
        "eagle",
        "eagle-2",
        "eagle-3",
        "specinfer"
      ],
      "reproducibility": {
        "codeUrl": null,
        "modelUrl": null,
        "projectPage": null,
        "officialImplementation": false,
        "status": "not-checked",
        "notes": [
          "论文未提供公开代码仓库、模型权重或独立项目页。",
          "论文给出了主要软件环境与训练超参数：HuggingFace Transformers、PyTorch Eager Mode、pytorch:2.6.0-cuda11.8-cudnn9-runtime、Context Length 2048、AdamW 和两阶段训练配置，但仍不足以替代官方实现。"
        ]
      },
      "evidence": [
        {
          "claim": "Beagle 用单层 Cross-Attention + MLP 取代 EAGLE 的 Self-Attention、Pooling 与复制拼接结构。",
          "location": "Figure 1; Section 4.1, Pages 4–5",
          "type": "method"
        },
        {
          "claim": "Cross-Attention 的 Query 来自 Token Embedding，Key/Value 来自 Target 真实状态或 Drafter 自预测状态，并使用遮蔽对角线及未来位置的因果掩码。",
          "location": "Equations 1–2; Section 4.1, Page 4",
          "type": "method"
        },
        {
          "claim": "推理时只追加预测状态的 K/V，并在一轮投机解码结束后把 Drafter Cache 恢复为 Target 真实状态。",
          "location": "Section 4.1, Page 5",
          "type": "system"
        },
        {
          "claim": "训练前半程使用 Inverse Block-Attention 并行预测多个未来 Token，后半程原位回灌预测 Key 进行自回归模拟，后者无需随步数展开新 Query。",
          "location": "Section 4.2; Figure 2, Pages 5–6",
          "type": "training"
        },
        {
          "claim": "正式训练使用 ShareGPT、20 个 Epoch、前后各 10 个 Epoch；Target States 离线生成，推理使用 BF16，训练权重使用 TF32。",
          "location": "Section 5.1, Page 7",
          "type": "training"
        },
        {
          "claim": "主要训练超参数包括 Context Length 2048、Batch Size 16、AdamW Betas=(0.9,0.95)、Learning Rate=3e-5、Warmup=2000 Steps、Gradient Norm=0.5、Early Window k=5 和 Simulation Steps s=4。",
          "location": "Appendix A.3, Pages 13–14",
          "type": "configuration"
        },
        {
          "claim": "A6000 Ada 上，Beagle 在三个 Target 和三个数据集上总体达到与 EAGLE-v2 相同量级的速度与接受长度，同时显著降低峰值显存。",
          "location": "Table 1; Section 5.2, Pages 7–8",
          "type": "result"
        },
        {
          "claim": "A10G 上的补充实验同样显示 Beagle 与 EAGLE-v2 速度接近，而峰值显存通常低约 1–2 GiB。",
          "location": "Appendix A.1, Table 2, Page 12",
          "type": "result"
        },
        {
          "claim": "两阶段训练分别带来约 0.3 的平均接受长度增益，增加模拟步数主要改善更远的候选位置。",
          "location": "Appendix A.4; Figure 10, Pages 14–15",
          "type": "ablation"
        },
        {
          "claim": "论文明确限制在单 Batch 贪心解码和小规模 Target，并未比较数据规模更大的 EAGLE-v3。",
          "location": "Section 5.1, Page 6; Section 7, Pages 9–10",
          "type": "limitation"
        }
      ],
      "notes": [],
      "qaNotes": [],
      "provenance": {
        "legacyWorkbookRow": 6,
        "workbookInstitutions": "清华大学"
      },
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
      "venue": "ICLR 2026",
      "date": "2025-04",
      "url": "https://openreview.net/forum?id=XbOyv7iVGL",
      "localPdf": "../Reference/PARD.pdf",
      "explanationPage": null,
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
      "methodOverview": "把已有小型自回归模型低成本改造成一次预测多个位置的并行 Drafter，使同一个 Drafter 可以服务一族 Target。Conditional Drop-token 在 Training 时跳过部分不必要 Token，同时维持 KV Prefix 的完整性。",
      "problemStatement": {
        "background": "自回归 LLM 每次前向通常只生成一个 Token，解码过程受模型权重和 KV Cache 的重复读取限制，容易成为 Memory-bound 瓶颈。投机解码使用较小的 Drafter 提前提出多个候选，再由 Target 一次并行验证，在保持 Target 输出分布不变的前提下减少昂贵的 Target 前向次数。",
        "priorLimitation": "Target-dependent 方法如 Medusa 和 EAGLE 利用 Target Hidden State、输出特征或内部层，虽然能提高 Draft 准确率，但每个 Target 变体通常都需要单独训练和部署 Drafter。Vanilla Speculative Decoding 的独立小模型可以跨同系列 Target 复用，但生成 K 个候选需要执行 K 次自回归前向，Draft 延迟和显存带宽开销随 K 线性增长。直接采用 Mask-Predict 又会把长度 N 的训练样本扩展为约 K·N 个训练 Token，使低成本适配失去意义。",
        "goal": "将已有的高质量小型自回归模型低成本适配为 Target-independent Parallel Drafter，使其通过一次前向并行预测多个未来 Token，并能复用于同一模型系列的不同规模 Target；同时通过保持 Prefix KV 完整性的稀疏训练机制，将 Mask 适配成本从 O(NK) 压缩到近似 O(N)。"
      },
      "methodComponents": [
        {
          "name": "Family-Level Target-Independent Draft Model",
          "stage": "Draft model selection and deployment",
          "purpose": "避免为每个 Target 规模分别训练一套 Drafter，降低模型适配、权重管理和部署成本。",
          "mechanism": "从目标模型系列中选择能力较强的最小自回归模型作为基础 Drafter，例如使用 LLaMA3.2-1B 服务 LLaMA3 系列、Qwen2.5-0.5B 服务 Qwen 系列。适配过程不读取特定 Target 的 Hidden State、Logits 或中间层参数，因此训练后的 Drafter 可以在共享 Tokenizer 和词表的同系列 Target 之间复用。",
          "differenceFromPrior": "Medusa、EAGLE 和 ParallelSpec 等方法把 Drafter 与某个具体 Target 的参数或特征绑定，需要随 Target 重新训练；PARD 保留 Vanilla Speculative Decoding 的模型解耦性，但进一步消除了其自回归 Draft 的顺序开销。"
        },
        {
          "name": "Shared-Mask Parallel Drafting",
          "stage": "Draft generation",
          "purpose": "将生成 K 个候选所需的 Drafter 前向次数从 K 次降低为一次，使 Draft 延迟和权重带宽开销基本不再随 K 线性增加。",
          "mechanism": "在已知上下文后放置多个共享同一 Token ID 的 Mask Placeholder。第 k 个预测位置只条件于原始已知前缀以及其前面的 Mask Token，而不依赖同一轮其他位置实际采样出的候选。所有位置的 Logits 在一次 Drafter 前向中同时计算，形成一条长度为 K 的候选链。",
          "differenceFromPrior": "Vanilla Speculative Decoding 必须用小模型逐 Token 自回归 Draft；PARD 采用与 Mask-Predict 类似的并行因子分解，但 Drafter 是独立的小模型，不需要把 Target 本身改造成并行预测模型。"
        },
        {
          "name": "Inference-Consistent Mask-Token Training",
          "stage": "Training",
          "purpose": "让普通自回归模型学习不同预测距离的 Next-k Token 分布，并确保训练时的可见上下文与推理时一致。",
          "mechanism": "将每条长度为 N 的训练序列展开为 K 个独立子任务：第一个子任务执行标准 Next-token Prediction，后续第 k 个子任务用 k−1 个 Mask Token 替代最近的未来依赖，并预测第 k 个未来 Token。通过专门构造 Input ID、Position ID、Label 和 Attention Mask，使每个监督位置只能访问推理阶段实际可用的前缀和 Mask Placeholder；各子任务均使用交叉熵训练。",
          "differenceFromPrior": "普通自回归训练只覆盖 Next-token Prediction；直接复制序列进行完整 Mask 训练虽然能获得并行预测能力，但输入 Token 数会由 N 上升到约 K·N，训练开销过高。"
        },
        {
          "name": "Conditional Drop-token",
          "stage": "Training data processing",
          "purpose": "在不破坏每个监督位置 Prefix KV 上下文的条件下，减少后部 Next-k 子任务中的冗余 Token，从而压缩训练计算量。",
          "mechanism": "第 i 个预测子任务按 max(r^(i−1), r_min) 的比例保留 Token，越远期的预测保留比例越低。候选 Token 只有在其所有必要 Prefix Key/Value 均被保留时才允许进入训练，随后重新压紧 Input ID、Label、Position ID 和 Attention Mask。默认设置为 K=8、r=0.7、r_min=0.2。",
          "differenceFromPrior": "无约束的随机 Drop-token 可能删除某个监督位置依赖的 Prefix KV，造成训练与推理条件不一致；COD 将 Prefix 完整性作为保留约束，并把理论训练复杂度从 O(NK) 降低到 O(N)。"
        }
      ],
      "characteristics": {
        "requiresTraining": true,
        "drafterType": "adapted-autoregressive-small-lm",
        "draftGeneration": "parallel",
        "candidateStructure": "chain",
        "verificationStrategy": "fixed-prefix",
        "usesTargetFeatures": false,
        "dynamicDraftLength": false,
        "dynamicVerifyLength": false,
        "lossless": true
      },
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
      "training": {
        "summary": "Mask 训练原本要把长度 N 的样本展开为 K 个预测子任务；COD 对第 i 个子任务按 max(r^(i−1), r_min) 保留位置，且只保留拥有完整前缀 Key/Value 的 Token，将训练量压到小于 N/(1−r)。",
        "data": "不同模型系列采用对应的指令与推理数据。LLaMA3 使用 Magpie-Llama-3.1-Pro-1M 和 Evol-CodeAlpaca；Qwen2.5 使用 Magpie-Qwen2-Pro-1M 和 Evol-CodeAlpaca；DeepSeek-R1-Qwen 使用 OpenR1-Math-220K、OpenThoughts-114K 和 Chinese-DeepSeek-R1-Distill-Data-110K。LLaMA3 与 Qwen 配置会使用对应模型重新生成部分或全部 Answer，以提高训练数据与模型系列输出分布的一致性。训练在 8 张 AMD Instinct MI250X 上通过 TRL 执行 4 个 Epoch；LLaMA3、DeepSeek-R1-Qwen 和 Qwen 的最大序列长度分别为 512、1024 和 512。",
        "objective": "将训练拆成 K 个 Next-k Token Prediction 子任务，并对每个有效监督位置使用交叉熵。第一个子任务沿用标准自回归 Next-token Loss；第 k>1 个子任务将最近的 k−1 个真实未来 Token 替换为共享 Mask Token，使监督条件与并行推理一致。COD 按 max(r^(k−1), r_min) 稀疏保留各子任务 Token，并保证每个保留监督位置拥有完整 Prefix KV。主实验使用 K=8、r=0.7、r_min=0.2；优化器为 AdamW，LLaMA3、DeepSeek-R1-Qwen 和 Qwen 的学习率分别为 1e−5、3e−5 和 8e−5。"
      },
      "evaluation": {
        "targetModels": [
          "Qwen2-7B",
          "Qwen2.5-3B",
          "Qwen2.5-7B",
          "Qwen2.5-14B",
          "LLaMA3-8B",
          "LLaMA3.1-8B",
          "LLaMA3.3-70B",
          "DeepSeek-R1-Distill-Qwen-7B",
          "DeepSeek-R1-Distill-Qwen-14B"
        ],
        "benchmarks": [
          "HumanEval",
          "GSM8K",
          "MATH500",
          "SpecBench"
        ],
        "baselines": [
          "Autoregressive Decoding",
          "Vanilla Speculative Decoding",
          "EAGLE",
          "EAGLE-3"
        ],
        "metrics": [
          "Tokens Per Second",
          "End-to-end Speedup",
          "Acceptance Rate",
          "Draft Memory Bandwidth Consumption",
          "Training Time",
          "Training Cost in PFLOPs per 1M Tokens"
        ],
        "hardware": [
          "8× AMD Instinct MI250X for training",
          "NVIDIA A100-40GB for evaluation"
        ],
        "frameworks": [
          "TRL",
          "vLLM",
          "Hugging Face Transformers",
          "Transformers+ with torch.compile and static KV cache"
        ]
      },
      "mainResults": [
        {
          "condition": "LLaMA3.1-8B，HumanEval，vLLM，单张 A100-40GB",
          "metric": "Tokens Per Second / End-to-end Speedup",
          "result": "264.88 tokens/s，3.63×",
          "comparison": "Vanilla Speculative Decoding 为 155.47 tokens/s、2.13×；EAGLE 为 136.05 tokens/s、1.86×；EAGLE-3 为 233.43 tokens/s、3.19×。PARD 吞吐约为 EAGLE 的 1.95 倍、EAGLE-3 的 1.13–1.15 倍。",
          "source": "Table 1"
        },
        {
          "condition": "LLaMA3.1-8B，HumanEval、GSM8K 与 SpecBench 宏平均，vLLM",
          "metric": "Average Tokens Per Second / Average Speedup",
          "result": "219.15 tokens/s，3.00×",
          "comparison": "EAGLE-3 为 193.86 tokens/s、2.65×；Vanilla Speculative Decoding 为 134.28 tokens/s、1.84×。",
          "source": "Table 1"
        },
        {
          "condition": "Qwen2.5-14B，HumanEval、GSM8K 与 SpecBench 宏平均，vLLM",
          "metric": "Average Tokens Per Second / Average Speedup",
          "result": "151.59 tokens/s，3.71×",
          "comparison": "Vanilla Speculative Decoding 为 121.05 tokens/s、2.97×。PARD 在 HumanEval 和 GSM8K 上分别达到 4.44× 与 4.45×。",
          "source": "Table 1"
        },
        {
          "condition": "LLaMA3.3-70B，HumanEval、GSM8K 与 SpecBench 宏平均，vLLM",
          "metric": "Average Tokens Per Second / Average Speedup",
          "result": "84.29 tokens/s，3.49×",
          "comparison": "EAGLE-3 为 77.88 tokens/s、3.22×；Vanilla Speculative Decoding 为 70.31 tokens/s、2.91×。同一个 LLaMA 系列 PARD Drafter 可同时用于 8B 和 70B Target。",
          "source": "Table 1"
        },
        {
          "condition": "DeepSeek-R1-Distill-Qwen 系列，HumanEval、GSM8K 与 MATH500 宏平均",
          "metric": "Average Tokens Per Second / Average Speedup",
          "result": "7B 为 190.75 tokens/s、2.51×；14B 为 122.50 tokens/s、3.01×",
          "comparison": "对应 Vanilla Speculative Decoding 分别为 116.54 tokens/s、1.54×和 91.34 tokens/s、2.24×。",
          "source": "Appendix Table 6"
        },
        {
          "condition": "LLaMA3.1-8B，比较 PARD、EAGLE 与 EAGLE-3",
          "metric": "Acceptance Rate",
          "result": "HumanEval 的 1-token/4-token Acceptance Rate 为 0.93/0.90；GSM8K 为 0.88/0.85",
          "comparison": "EAGLE-3 对应为 HumanEval 0.87/0.85、GSM8K 0.82/0.79；EAGLE 对应为 0.83/0.72 和 0.79/0.66。",
          "source": "Table 2"
        },
        {
          "condition": "LLaMA3.1-8B，BF16，Draft Length k=4、6、8",
          "metric": "Draft Memory Bandwidth Consumption",
          "result": "PARD 始终为 2.48 GB",
          "comparison": "EAGLE 和 EAGLE-3 分别随 k 从 5.94 GB 增长到 8.90 GB 和 11.88 GB；PARD 一次并行前向使模型权重读取量基本不随 Draft Length 增长。",
          "source": "Table 3"
        },
        {
          "condition": "以 LLaMA3-70B 为 Target，按每 100 万训练 Token 估算适配成本",
          "metric": "Total Training Cost",
          "result": "PARD 为 20.22 PFLOPs",
          "comparison": "EAGLE 为 149.20 PFLOPs，EAGLE-3 为 204.40 PFLOPs；论文据此估算 PARD 的训练效率约为 EAGLE 的 7 倍、EAGLE-3 的 10 倍。",
          "source": "Appendix A"
        },
        {
          "condition": "DeepSeek-R1-Qwen-7B 消融，OpenR1-Math-220K 的 93K 子集训练一轮，MATH500 测试",
          "metric": "Conditional Drop-token Training Efficiency",
          "result": "r=0.7、r_min=0.2 时训练速度提高约 3 倍，同时保持近似相同的最终解码吞吐",
          "comparison": "进一步降低保留率可以缩短训练时间，但过度 Drop 会降低推理性能。",
          "source": "Figure 5(a)"
        },
        {
          "condition": "LLaMA3.1-8B，HumanEval，vLLM，Batch Size 从 1 增长到 16",
          "metric": "End-to-end Speedup",
          "result": "Batch Size 1/2/4/8/16 时分别为 3.63×、3.16×、2.59×、1.90×和 1.33×",
          "comparison": "并发增大后系统由 Memory-bound 转向 Compute-bound，PARD 的相对收益持续下降，但在 Batch Size 16 时仍保留 1.33× 加速。",
          "source": "Appendix Table 5"
        },
        {
          "condition": "Shared Mask Token 与不同训练/推理 K 的消融",
          "metric": "Draft-length Extrapolation",
          "result": "共享 Mask ID 的吞吐为 221.97 tokens/s，高于位置专属 Mask ID 的 218.05 tokens/s；K_train≥8 后结果趋于稳定，最佳 K_infer 为 12",
          "comparison": "共享 Mask ID 允许推理时使用大于训练值的 K，但论文仍通过离线搜索手动选择 K，并未实现按请求动态调度。",
          "source": "Section 4.3 and Figure 5(b)"
        }
      ],
      "limitations": [
        {
          "type": "algorithmic",
          "description": "同一块内的候选位置只条件于共享前缀和 Mask Placeholder，不会基于该轮已经实际采样出的前部候选重新条件化。一次并行前向因此消除了顺序延迟，但也放弃了显式的块内 Token Dependency Modeling，后部候选可能出现一致性下降。",
          "sourceType": "analysis"
        },
        {
          "type": "generalization",
          "description": "论文中的 Target Independence 是模型系列级复用，而不是任意 Target 通用。Drafter 与 Target 仍需共享兼容的 Tokenizer、词表和语言建模分布；LLaMA、Qwen 与 DeepSeek-R1-Qwen 分别训练了不同的 PARD 模型。",
          "sourceType": "paper"
        },
        {
          "type": "training-cost",
          "description": "PARD 不是 Training-free 方法。每个模型系列仍需对一个完整的小型自回归模型进行 Fine-tuning，并准备与该系列匹配的指令数据；LLaMA3 和 Qwen 配置还会使用 Target 系列模型重新生成训练 Answer。",
          "sourceType": "paper"
        },
        {
          "type": "training-stability",
          "description": "COD 的保留率需要在训练速度和候选质量之间调节。论文消融明确显示，保留率过低虽然进一步减少训练时间，但会降低最终推理性能，因此 3 倍加速依赖于 r=0.7、r_min=0.2 这一经验折中。",
          "sourceType": "paper"
        },
        {
          "type": "scheduling",
          "description": "主方法使用链式候选和预先选择的固定 K，没有根据请求难度、接受概率或当前系统负载动态调整 Draft/Verify Length。虽然共享 Mask ID 支持 K_infer>K_train，但最佳 K=12 来自离线笛卡尔积搜索，而不是在线调度器。",
          "sourceType": "paper"
        },
        {
          "type": "system",
          "description": "PARD 的优势主要来自减少 Memory-bound Draft 的权重读取。当 Batch Size 从 1 增加到 16、系统逐渐转为 Compute-bound 时，LLaMA3.1-8B HumanEval 加速从 3.63×下降到 1.33×，峰值单请求数据不能直接代表高并发 Serving 收益。",
          "sourceType": "observed-data"
        },
        {
          "type": "evaluation",
          "description": "主实验集中在代码、数学和 SpecBench，并主要使用单张 A100-40GB；没有系统评估长上下文、持续动态 Batch、真实线上请求分布或多 GPU Serving。训练最大序列长度也仅为 512或1024。",
          "sourceType": "observed-data"
        },
        {
          "type": "baseline",
          "description": "论文没有对 ParallelSpec、BiTA 和 PaSS 进行同框实验，附录说明原因是实现约束，只给出了概念性对比。因此 PARD 相对其他 Target-dependent Parallel Drafter 的端到端优势缺乏直接实验控制。",
          "sourceType": "paper"
        },
        {
          "type": "candidate-structure",
          "description": "所有论文实验均采用 Chain Attention。论文指出 Tree Attention 与 PARD 正交并可组合，但没有实现或测量树结构带来的接受长度增益及额外 Verify 成本。",
          "sourceType": "paper"
        }
      ],
      "relations": {
        "extends": [],
        "comparesAgainst": [
          "eagle",
          "eagle-3"
        ],
        "related": [
          "medusa",
          "mtp",
          "eagle",
          "eagle-2",
          "eagle-3",
          "specinfer"
        ],
        "compatibleWith": [
          "specinfer"
        ]
      },
      "citations": [
        "medusa",
        "mtp",
        "eagle",
        "eagle-2",
        "eagle-3",
        "specinfer"
      ],
      "reproducibility": {
        "codeUrl": "https://github.com/AMD-AGI/PARD",
        "modelUrl": "https://huggingface.co/collections/amd/pard",
        "projectPage": "https://www.amd.com/en/developer/resources/technical-articles/accelerating-generative-llms-interface-with-parallel-draft-model-pard.html",
        "officialImplementation": true,
        "status": "not-reproduced",
        "notes": [
          "官方 GitHub 仓库提供 PARD-1 的训练代码、Transformers+ 推理配置以及 vLLM 使用说明，许可证为 MIT。",
          "官方 Hugging Face Collection 已发布 LLaMA3、LLaMA4、DeepSeek-R1-Qwen、Qwen2.5 和 Qwen3 系列的 PARD-1 Drafter 权重。",
          "论文训练使用 AMD MI250X，最终主表使用 NVIDIA A100-40GB；严格复现时需要区分训练硬件、论文 vLLM 版本以及当前仓库更新后的 vLLM V1 结果。",
          "本站尚未记录一组从数据处理、COD 训练到 Table 1 和 Table 6 全部数值均严格对齐的本地复现实验，因此状态标记为 not-reproduced。"
        ]
      },
      "evidence": [
        {
          "claim": "PARD 将 Target-independent 小型自回归 Drafter 适配为一次前向预测多个未来 Token 的 Parallel Drafter。",
          "location": "Abstract and Section 1, Pages 1–3; Figure 3 and Section 3.1, Pages 4–5",
          "type": "method"
        },
        {
          "claim": "PARD 使用 Mask Placeholder 切断块内实际候选之间的依赖，使 K 个位置能够在一次 Drafter 前向中并行计算。",
          "location": "Section 3.1, Equations 6–7, Page 5",
          "type": "method"
        },
        {
          "claim": "Mask Training 将序列展开为多个 Next-k 子任务，并通过专用 Attention Mask 保持训练条件与推理条件一致。",
          "location": "Section 3.2.1 and Figure 4, Pages 5–6",
          "type": "training"
        },
        {
          "claim": "COD 按几何衰减保留后部子任务 Token，并保证每个保留位置拥有完整的 Prefix KV，使训练复杂度由 O(NK) 降到 O(N)。",
          "location": "Section 3.2.2, Equations 9–11, Page 6; Appendix B, Pages 15–16",
          "type": "training"
        },
        {
          "claim": "主训练配置使用 K=8、r=0.7、r_min=0.2，在 8 张 MI250X 上通过 TRL 训练 4 个 Epoch。",
          "location": "Section 4.1, Page 7; Appendix Table 4, Page 17",
          "type": "configuration"
        },
        {
          "claim": "PARD 在 LLaMA3.1-8B HumanEval 上达到 264.88 tokens/s 和 3.63× 加速，高于 EAGLE-3 的 233.43 tokens/s 和 3.19×。",
          "location": "Table 1, Page 7",
          "type": "result"
        },
        {
          "claim": "PARD 在 LLaMA3.1-8B 上同时取得更高 Acceptance Rate 和不随 Draft Length 增长的固定 Draft Bandwidth Consumption。",
          "location": "Tables 2–3, Page 8",
          "type": "result"
        },
        {
          "claim": "r=0.7、r_min=0.2 的 COD 设置将训练提速约 3 倍，而 Shared Mask ID 支持 K_infer 大于 K_train。",
          "location": "Section 4.3 and Figure 5, Pages 8–9",
          "type": "ablation"
        },
        {
          "claim": "以 LLaMA3-70B 为 Target 的估算中，PARD 训练成本为 20.22 PFLOPs/1M Tokens，显著低于 EAGLE 和 EAGLE-3。",
          "location": "Appendix A, Page 15",
          "type": "training-cost"
        },
        {
          "claim": "Batch Size 从 1 增至 16 时，PARD 在 LLaMA3.1-8B HumanEval 上的加速由 3.63×下降到 1.33×。",
          "location": "Appendix Table 5, Page 17",
          "type": "system"
        },
        {
          "claim": "论文最终结果基于 vLLM，并另外实现了使用 torch.compile 与 Static KV Cache 的 Transformers+；Chain Attention 是默认候选结构。",
          "location": "Appendix F and Table 7, Pages 17–18",
          "type": "implementation"
        },
        {
          "claim": "论文未直接实验比较 ParallelSpec、BiTA 和 PaSS，只在附录中给出 Target Independence 的概念性对比。",
          "location": "Appendix G and Table 8, Page 18",
          "type": "evaluation"
        }
      ],
      "notes": [
        "PARD 虽然采用 Mask Token 并一次并行预测一个未来块，但它不是从零训练的扩散语言模型，也不执行多轮去噪；其本质是经过 Next-k Mask 适配的小型自回归语言模型。",
        "Target-independent 需要按模型系列理解：同一个 LLaMA Drafter 可服务 LLaMA3 的多个规模，同一个 Qwen Drafter可服务多个 Qwen Target，但不能直接把 LLaMA Drafter 接到 Qwen Target。",
        "PARD 的并行因子分解降低了 Draft Latency，但候选位置之间看不到该轮实际采样出的前序 Token。这是它与自回归 Drafter 最关键的质量—延迟交换。",
        "所有未来位置共享同一个 Mask Token ID，而不是使用 m0、m1、m2 等独立词表项。消融显示共享 ID 略微提高吞吐，并使模型可以在推理时外推到大于 K_train 的 K。",
        "COD 不是随意删除训练 Token：一个监督位置只有在其所需的全部前缀 KV 都存在时才能保留，否则会造成 Attention Context 不完整。",
        "论文主训练使用 K_train=8，但消融中的最佳 K_infer=12。这里的外推能力只说明模型能接受更长的 Mask Block，不代表 K 会自动适应任务或系统负载。",
        "PARD 的 Draft Bandwidth 对 K 近似恒定，是因为模型权重只需在一次并行前向中读取；这不意味着整个投机轮次的 Target Verify 成本也与 K 无关。",
        "Tree Attention 被论文视为正交扩展。PARD 本身只解决 Drafter 的并行生成和训练成本，不负责多分支候选组织或动态 Verify 调度。"
      ],
      "qaNotes": [],
      "provenance": {
        "legacyWorkbookRow": 7,
        "workbookInstitutions": "香港中文大学（深圳）、其他合作单位"
      },
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
      "venue": "Findings of ACL 2026",
      "date": "2025-09",
      "url": "https://aclanthology.org/2026.findings-acl.1048/",
      "localPdf": "../Reference/DiffuSpec.pdf",
      "explanationPage": null,
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
      "methodOverview": "复用预训练扩散语言模型，一次产生多个位置的候选 Token 网格；Causal-consistency Path Search 从中抽取满足自回归因果关系的路径，ADL 再根据历史接受情况动态调整 Draft 长度。",
      "problemStatement": {
        "background": "自回归 LLM 必须逐 Token 顺序解码，生成 K 个 Token 需要执行 K 次串行前向。投机解码通过让较快的 Drafter 先提出一段候选，再由 Target 在一次前向中并行验证，从而在保持 Target 解码行为的同时降低平均 Token 延迟；实际收益同时取决于 Draft 吞吐、候选接受长度和 Verify 成本。",
        "priorLimitation": "多数投机解码方法仍使用自回归 Drafter，每增加一个候选 Token 都需要额外执行一次 Drafter 前向，Draft 阶段本身仍受串行依赖限制。预训练扩散语言模型虽然可以并行预测整个 Mask 块，但其双向条件化只给出各位置的联合上下文边际分布，逐位置 Top-1 直接拼接可能形成不符合左到右因果关系的序列；同时，扩散 Draft 必须预先指定块长，固定长度会在过短限制推进量和过长增加漂移、EOS Padding 与无效验证之间产生冲突。",
        "goal": "在不训练新 Drafter、不修改 Target 架构的条件下，把现成扩散语言模型接入标准投机解码接口；从并行产生的 Token Lattice 中寻找更符合 AR Verifier 的因果路径，并根据在线生成与接受反馈动态选择 Draft 长度，从而同时提高接受长度和端到端 Wall-clock Speedup。"
      },
      "methodComponents": [
        {
          "name": "Pretrained DLM Parallel Drafter",
          "stage": "Draft generation",
          "purpose": "利用扩散语言模型的块级并行能力，以一次前向代替自回归 Drafter 的多次串行前向。",
          "mechanism": "给定当前 Prefix 和 Draft 长度 k_t，在 Prefix 后追加 k_t 个 Mask Token。预训练 DLM 对整个 Mask 块执行并行去噪，并输出每个未来位置的候选分布及 Top-M Token 集合。虽然 DLM 原生支持多轮迭代精炼，DiffuSpec 默认只执行一次 Refinement Forward，以避免额外去噪步骤吞噬推理收益。",
          "differenceFromPrior": "标准小型 AR Drafter 生成 k_t 个 Token 通常需要 k_t 次顺序前向；DiffuSpec 直接复用现成的 Dream-7B 等 DLM，在不额外训练 Draft Adapter 的情况下并行产生整个候选块。"
        },
        {
          "name": "Left-to-Right Probability Adapter",
          "stage": "Drafter–verifier interface",
          "purpose": "把原生双向条件化的 DLM 分布转换成标准投机采样接口可以使用的逐位置 Proposal Probability。",
          "mechanism": "对于候选块中的第 i 个位置，使用仅保留原始 Prefix、并将块内待预测位置置为 Mask 的输入读取该位置分布，构造 q_phi^L2R 代理概率。Target 随后仍按标准 Acceptance Ratio 或 Greedy Matching 逐位置处理候选，因此无需修改其网络结构。",
          "differenceFromPrior": "AR Drafter 天然提供严格左到右条件概率；DLM 输出的是共享双向上下文下的逐位置分布。该适配层保持标准 Drafter–Verifier 概率接口，但得到的是近似的左到右代理，而不是真正基于已选候选 Prefix 重新计算的路径条件概率。"
        },
        {
          "name": "Causal-Consistency Path Search",
          "stage": "Candidate organization",
          "purpose": "避免把每个位置的局部 Top-1 生硬拼接成因果不连贯的候选，提高首次 Draft–Target 失配发生的位置。",
          "mechanism": "从每个位置的 Top-M 候选开始，保留累计概率质量达到阈值 tau 的最小候选集合，并用 M_max 限制分支数；EOS 始终保留，路径遇到首个 EOS 后停止扩展。对路径 pi 使用 DLM Log Probability 与因果代理 Log Probability 的加权和评分，再以 Beam Size B 执行左到右 Beam Search。论文默认使用 3-gram KenLM 作为因果代理，lambda=0.5、B=3、tau=0.8、M_max=15。",
          "differenceFromPrior": "普通扩散式 Draft 可直接采用各位置 Argmax，忽略不同位置候选之间的因果兼容性；CPS 显式保留 Token Lattice，并在 Verify 前利用轻量因果分数选择一条更适合 AR Target 的链，而不需要重新训练 DLM。"
        },
        {
          "name": "Adaptive Draft-Length Controller",
          "stage": "Online draft scheduling",
          "purpose": "针对不同 Prompt 和不同生成阶段自适应寻找 Draft 长度的速度—接受率甜点，减少固定块长造成的不足 Draft 或过度 Draft。",
          "mechanism": "从 CPS 前的原始 DLM Draft 中计算首个 EOS 之前的生成长度 L_gen，并在 Verify 后获得连续接受长度 L_acc；分别对两者执行指数滑动平均。当平均接受进度能够跟上平均生成进度时，在 L_gen 基础上增加 delta，否则按当前生成长度回缩，最后裁剪到 [k_min, k_max]。默认 k_min=20、k_max=30、delta=10、rho=0.5。",
          "differenceFromPrior": "固定 k 无法适应不同样本的可预测性；Minions 式控制器主要依赖接受反馈，而 ADL 同时观察 DLM 实际在 EOS 前生成了多少有效内容以及其中多少被 Target 接受。"
        },
        {
          "name": "Serving-Compatible Four-Stage Pipeline",
          "stage": "End-to-end decoding",
          "purpose": "在不改动 Target 架构的前提下，将 DLM Draft、路径搜索和长度控制接入标准投机解码流程。",
          "mechanism": "每轮依次执行 DLM Draft、CPS 路径抽取、Target Parallel Verification 和 ADL 长度更新。Target 只通过候选 Token 与 Proposal Probability 接口参与验证；在 Temperature=0 的 Greedy Verification 下，无论 CPS 选择何种候选，首个不匹配位置都会由 Target 自身的 Greedy Token 修正，因此输出逐 Token 等同于普通 Target Greedy Decoding。",
          "differenceFromPrior": "方法不要求给 Target 增加预测头、修改 Attention 或重新训练参数；与 EAGLE、Medusa 等依赖附加模型结构或专门训练的方案相比，核心改动集中在 Drafter 侧和轻量前后处理模块。"
        }
      ],
      "characteristics": {
        "requiresTraining": false,
        "drafterType": "pretrained-diffusion-language-model",
        "draftGeneration": "single-pass-parallel",
        "candidateStructure": "token-lattice-to-chain",
        "verificationStrategy": "standard-block-verification",
        "usesTargetFeatures": false,
        "dynamicDraftLength": true,
        "dynamicVerifyLength": false,
        "lossless": true
      },
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
      "training": {
        "summary": "DiffuSpec 本身是 Training-free 方法，不训练新的 Drafter、Target 或控制器，而是直接复用公开的预训练 Dream-7B。CPS 和 ADL 都是无可训练参数的推理时模块；仅作为因果代理的 3-gram KenLM 需要离线拟合。",
        "data": "方法没有专门的神经网络训练数据。主实验使用公开的 Dream-7B、Qwen2.5-32B 等 Checkpoint。Appendix A 说明 3-gram KenLM 只使用各任务的训练划分拟合，避免测试集泄漏；正文则将其概括为在离线文本语料上训练后跨任务复用。",
        "objective": "DiffuSpec 不引入新的优化目标。论文为完整性给出了预训练 DLM 的标准目标：随机腐化干净序列，并在被腐化位置使用 Token-wise Cross-Entropy 恢复原 Token。该目标描述 DLM 的既有训练方式，不是 DiffuSpec 实验中重新执行的训练流程。"
      },
      "evaluation": {
        "targetModels": [
          "Qwen2.5-32B",
          "Qwen3-32B",
          "Qwen2.5-Coder-32B"
        ],
        "benchmarks": [
          "Spec-Bench",
          "MT-Bench",
          "WMT-style Machine Translation",
          "CNN/DailyMail",
          "Natural Questions",
          "GSM8K",
          "DPR over Wikipedia",
          "HumanEval"
        ],
        "baselines": [
          "Autoregressive Greedy Decoding",
          "Lookahead Decoding",
          "Prompt Lookup Decoding",
          "Token Recycling",
          "SAMD",
          "EAGLE-2",
          "EAGLE-3",
          "Speculative Sampling",
          "SpecDiff",
          "Minions-style Length Controller"
        ],
        "metrics": [
          "Mean Accepted Tokens",
          "End-to-end Wall-clock Speedup",
          "Tokens per Second",
          "MT-Bench Pairwise Win Rate",
          "BLEU",
          "ROUGE-L",
          "Exact Match",
          "F1",
          "Task Accuracy",
          "Per-stage Wall-clock Time"
        ],
        "hardware": [
          "Single NVIDIA A100 80GB",
          "11 CPU Cores",
          "100GB System RAM"
        ],
        "frameworks": [
          "PyTorch 2.6.0",
          "Spec-Bench Evaluation Harness",
          "KenLM"
        ]
      },
      "mainResults": [
        {
          "condition": "Qwen2.5-32B Target、Dream-7B Drafter，Spec-Bench 六类任务，Temperature=0、Batch Size=1",
          "metric": "Mean Accepted Tokens / End-to-end Speedup",
          "result": "6.99 / 3.08×",
          "comparison": "取得全部方法中的最高宏平均结果；EAGLE-3 为 4.28 / 2.80×，SpecDiff 为 6.05 / 2.69×，SPS 为 6.18 / 1.67×。",
          "source": "Table 1"
        },
        {
          "condition": "Qwen2.5-32B + Dream-7B，Spec-Bench 分任务结果",
          "metric": "Wall-clock Speedup",
          "result": "MT 3.09×；Translation 3.38×；Summarization 2.41×；QA 3.03×；Math 4.02×；RAG 2.38×",
          "comparison": "DiffuSpec 在 MT、Translation、QA 和 Math 上取得表中最高速度；开放式或检索任务的收益明显低于数学与翻译任务。",
          "source": "Table 1"
        },
        {
          "condition": "相同 Qwen2.5-32B Target、Dream-7B Drafter 与运行配置",
          "metric": "Comparison with Diffusion Baseline",
          "result": "DiffuSpec 为 6.99 MAT / 3.08×，SpecDiff 为 6.05 MAT / 2.69×",
          "comparison": "加入 CPS 和 ADL 后，Mean-MAT 提升 0.94，Mean-Speedup 提升 0.39×。",
          "source": "Section 5.1 and Table 1"
        },
        {
          "condition": "CPS 与 ADL 组件消融，Spec-Bench 宏平均",
          "metric": "Mean Accepted Tokens / Mean Speedup",
          "result": "CPS+ADL：6.99 / 3.08×；仅 CPS：6.95 / 2.98×；仅 ADL：6.43 / 2.73×；均关闭：6.05 / 2.69×",
          "comparison": "CPS 贡献了主要接受长度提升，ADL 的独立接受收益较小，但能进一步把候选质量转化为端到端速度。",
          "source": "Table 2"
        },
        {
          "condition": "固定 Draft Length 与 ADL 比较，所有配置保留 CPS",
          "metric": "Mean Accepted Tokens / Mean Speedup",
          "result": "k=10：5.53 / 2.74×；k=20：6.56 / 2.98×；k=30：6.49 / 2.98×；k=50：6.51 / 2.91×；k=100：6.69 / 2.78×；ADL：6.99 / 3.08×",
          "comparison": "更长的固定 Draft 能提高 MAT，但速度在 k=20–30 后下降；ADL 同时取得最高 MAT 和最高 Speedup。",
          "source": "Appendix D, Table 5"
        },
        {
          "condition": "扩散 Refinement Step S 从 1 增加到 10",
          "metric": "Mean Accepted Tokens / Mean Speedup",
          "result": "MAT 从 6.99 增加到 7.33，但 Speedup 从 3.08× 降至 0.93×",
          "comparison": "额外去噪确实改善候选质量，却因重复执行 7B DLM 前向而直接抹掉投机解码收益，因此主配置固定 S=1。",
          "source": "Section 5.3, Figure 5"
        },
        {
          "condition": "异构 Tokenizer：Qwen3-32B Target；DiffuSpec 使用 Dream-7B，SPS 使用 Qwen2.5-7B",
          "metric": "Mean Accepted Tokens / Mean Speedup",
          "result": "DiffuSpec：3.02 / 1.42×；SPS：2.91 / 1.03×",
          "comparison": "在需要 Vocabulary Adapter 映射概率的设置下，DiffuSpec 仍保持更高速度，但收益明显低于同 Tokenizer 的主实验。",
          "source": "Appendix E, Table 6"
        },
        {
          "condition": "DREAM-CODER-7B Drafter + Qwen2.5-Coder-32B Target，HumanEval",
          "metric": "Mean Accepted Tokens / Mean Speedup",
          "result": "10.94 / 5.35×",
          "comparison": "SPS 的 MAT 更高，为 11.33，但速度仅 2.14×；SAMD 为 5.24 / 5.29×。DiffuSpec 以略高于 SAMD 的 5.35× 取得最高 Wall-clock Speedup。",
          "source": "Appendix F, Table 7"
        },
        {
          "condition": "Qwen2.5-32B + Dream-7B 主实验的分阶段计时",
          "metric": "CPS Search Overhead",
          "result": "CPS 平均仅占每轮 Wall-clock Time 的约 1.1%",
          "comparison": "主要成本仍来自 DLM Draft 和 Target Verification，说明小 Beam 的 Lattice Search 本身不是端到端瓶颈。",
          "source": "Section 5.1, Figure 4"
        }
      ],
      "limitations": [
        {
          "type": "model-availability",
          "description": "方法依赖现成的预训练扩散语言模型。论文明确指出，公开 DLM Checkpoint 在模型尺寸、领域和语言覆盖上仍远少于小型自回归 Drafter；缺少合适 DLM 时仍需额外执行蒸馏或轻量适配。",
          "sourceType": "paper"
        },
        {
          "type": "resource-cost",
          "description": "Training-free 不等于低资源。主配置使用 Dream-7B 作为 Drafter，参数量和显存占用远高于 EAGLE Head 或 DFlash 一类轻量 Drafter；单次 DLM 前向虽然并行，但在显存受限、较小 Target 或高并发 Serving 中可能不具备良好的成本优势。",
          "sourceType": "analysis"
        },
        {
          "type": "losslessness",
          "description": "论文的严格无损保证只适用于 Temperature=0 的 Greedy Verification。CPS 通过 Beam/MAP Search 选择候选，而不是从 Acceptance Ratio 中使用的同一 Proposal Distribution 采样；因此在 Temperature>0 时，经典投机采样的无偏分布恢复证明不直接成立，论文将其明确视为近似或启发式扩展。",
          "sourceType": "paper"
        },
        {
          "type": "causal-modeling",
          "description": "CPS 使用 3-gram KenLM 评价局部因果连贯性，难以建模长距离语义、代码作用域或复杂推理依赖。Beam Search 只是在固定候选 Lattice 中重新选路，无法让后部 DLM 分布真正条件化于已选择的前部 Token。",
          "sourceType": "analysis"
        },
        {
          "type": "system-evaluation",
          "description": "主实验仅在单张 A100、Batch Size=1 上进行，没有报告 Continuous Batching、高并发吞吐、不同 Context Length 或多卡 Serving。ADL 也只依据单请求生成与接受反馈，不感知 Target Batch Capacity、硬件吞吐曲线或系统负载。",
          "sourceType": "paper"
        },
        {
          "type": "generalization",
          "description": "主实验集中在 Qwen2.5-32B + Dream-7B 这一组同生态模型。论文通过异构 Tokenizer 和 Coder 模型补充了两个附录实验，但尚未系统覆盖更多 Target 规模、DLM 家族、语言或生产流量分布。",
          "sourceType": "observed-data"
        },
        {
          "type": "controller",
          "description": "ADL 调整的是下一轮 Draft Length，而不是独立的 Verify Budget；主配置还把长度限制在较窄的 [20, 30] 范围。它无法像负载感知调度器那样，在已经生成长候选后根据 Batch 状态裁剪低价值 Verify Suffix。",
          "sourceType": "analysis"
        },
        {
          "type": "reproducibility",
          "description": "论文和当前官方条目未提供作者官方代码仓库或独立项目页。虽然公开了模型名称、硬件、软件版本与主要超参数，但 CPS、Probability Adapter、Tokenizer Mapping 和 Timing Harness 仍需复现者自行实现。",
          "sourceType": "observed-data"
        },
        {
          "type": "documentation",
          "description": "正文称 3-gram KenLM 在离线文本语料上训练并跨任务复用，而 Appendix A 又称其分别拟合各数据集训练划分。两处关于 Causal Proxy 训练数据的口径不完全一致，会影响严格复现实验配置。",
          "sourceType": "observed-data"
        }
      ],
      "relations": {
        "extends": [],
        "comparesAgainst": [
          "eagle-2",
          "eagle-3"
        ],
        "related": [
          "medusa",
          "eagle",
          "eagle-2",
          "eagle-3",
          "specinfer"
        ],
        "compatibleWith": []
      },
      "citations": [
        "medusa",
        "eagle",
        "eagle-2",
        "eagle-3",
        "specinfer"
      ],
      "reproducibility": {
        "codeUrl": null,
        "modelUrl": null,
        "projectPage": null,
        "officialImplementation": false,
        "status": "not-reproduced",
        "notes": [
          "论文复用公开的 Dream-7B、Qwen2.5-32B 和 Spec-Bench，但未给出专属于 DiffuSpec 的官方代码或模型仓库。",
          "论文提供了 PyTorch 2.6.0、单张 A100 80GB、Batch Size 1、KV Cache、Temperature 0 及 CPS/ADL 的主要超参数，可以据此自行实现核心算法。",
          "异构 Tokenizer 实验依赖概率空间 Vocabulary Adapter，但论文没有给出对应实现细节或完整映射配置。",
          "本站尚未记录一组严格复现 Table 1、Table 2 与 Appendix Table 5–7 的环境、命令和结果，因此状态标记为 not-reproduced。"
        ]
      },
      "evidence": [
        {
          "claim": "DiffuSpec 是 Training-free 框架，直接复用预训练 DLM，以一次前向并行产生多 Token Draft，并保持标准 AR Verifier 接口。",
          "location": "Abstract; Sections 1 and 4.1, Pages 1–4",
          "type": "method"
        },
        {
          "claim": "CPS 对各位置候选执行累计概率质量剪枝、EOS 保留和首 EOS 截断，再结合 DLM 与因果代理分数进行 Beam Search。",
          "location": "Section 4.2 and Figure 3, Page 5",
          "type": "method"
        },
        {
          "claim": "ADL 根据首个 EOS 前的 L_gen 和 Verify 后的 L_acc 的指数滑动平均更新下一轮 Draft Length。",
          "location": "Section 4.3, Pages 5–6",
          "type": "method"
        },
        {
          "claim": "在 Temperature=0 下，DiffuSpec 的最终输出逐 Token 等同于 Target 的普通 Greedy Decoding。",
          "location": "Proposition 4.1, Section 4.4, Page 6; Appendix H, Pages 14–15",
          "type": "guarantee"
        },
        {
          "claim": "主实验使用 Qwen2.5-32B Target、Dream-7B Drafter、单张 A100 80GB、PyTorch 2.6.0、Batch Size 1 和单步 Refinement。",
          "location": "Section 5, Pages 6–7; Appendix A, Page 12",
          "type": "configuration"
        },
        {
          "claim": "默认 CPS/ADL 参数为 k_min=20、k_max=30、B=3、tau=0.8、M_max=15、lambda=0.5、delta=10 和 rho=0.5。",
          "location": "Section 5, Page 7; Appendix A, Page 12",
          "type": "configuration"
        },
        {
          "claim": "DiffuSpec 在 Spec-Bench 上达到 6.99 Mean-MAT 和 3.08× Mean-Speedup，优于 EAGLE-3、SPS、SpecDiff 和其他基线。",
          "location": "Table 1 and Section 5.1, Page 7",
          "type": "result"
        },
        {
          "claim": "组件消融显示 CPS 对接受长度贡献更大，ADL 进一步改善速度；二者结合取得 6.99 MAT 和 3.08× Speedup。",
          "location": "Section 5.2 and Table 2, Pages 7–8",
          "type": "ablation"
        },
        {
          "claim": "增加 DLM Refinement Step 会提高 MAT，但 S=10 时 Speedup 降至 0.93×，因此主实验采用 S=1。",
          "location": "Section 5.3 and Figure 5, Page 8",
          "type": "ablation"
        },
        {
          "claim": "ADL 相比 k=10、20、30、50、100 的固定长度策略同时取得最高 Mean-MAT 和 Mean-Speedup。",
          "location": "Appendix D, Table 5, Pages 12–13",
          "type": "result"
        },
        {
          "claim": "异构 Tokenizer 设置下 DiffuSpec 达到 3.02 MAT 和 1.42× Speedup；Coder 设置的 HumanEval 实验达到 10.94 MAT 和 5.35× Speedup。",
          "location": "Appendices E–F, Tables 6–7, Page 13",
          "type": "result"
        },
        {
          "claim": "在随机采样解码下，CPS 的搜索分布与 Acceptance Ratio 使用的 Proposal Distribution 不一致，因此经典无偏性证明不直接适用。",
          "location": "Appendix H.3, Page 15",
          "type": "limitation"
        }
      ],
      "notes": [
        "论文的 MAT 对应连续被接受的 Draft Prefix 长度，不包含 Target 在拒绝位置产生的修正或 Bonus Token；不能直接与把 Bonus Token 计入 Acceptance Length 的论文横向对数值。",
        "DiffuSpec 的 Candidate Structure 最终仍是一条 Chain。Token Lattice 和 Beam Search 用于 Verify 前选路，并没有像 Medusa、SpecInfer 或 DDTree 那样把多条分支同时送入 Target 验证。",
        "所谓 Left-to-Right Probability 是由 DLM 边际分布构造的代理接口，而不是根据已经选择的候选 Prefix 逐步重新运行 DLM 得到的严格 AR Factorization。",
        "默认只执行一次扩散 Refinement。DiffuSpec 的关键不是让 DLM 完成高质量独立生成，而是让它以最低前向次数提出足以被更强 AR Target 筛选的候选。",
        "ADL 属于动态 Draft Length，而不是动态 Verify Length。每轮 Target 仍验证 CPS 最终给出的整条候选，缺少面向 Batch Serving 的独立 Verify Suffix 裁剪。",
        "论文主结果中的最高任务加速是 Math 的 4.02×，而摘要使用的是较保守的“up to 3×”概括；附录 Coder 实验则进一步报告了 5.35×。",
        "与 DFlash 的路线区别很直接：DiffuSpec 不训练 Drafter、使用完整的 7B 预训练 DLM，并靠推理时 CPS/ADL 修正；DFlash 训练小型 Target-conditioned Block-Diffusion Drafter，以更低模型开销直接提高并行 Draft 质量。",
        "正文与 Appendix A 对 3-gram KenLM 的训练语料描述存在差异，严格复现时应优先检查作者后续代码或向作者确认。"
      ],
      "qaNotes": [],
      "provenance": {
        "legacyWorkbookRow": 8,
        "workbookInstitutions": "香港中文大学（深圳）、其他合作单位"
      },
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
      "venue": "MLSys 2026",
      "date": "2025-11",
      "url": "https://arxiv.org/abs/2511.00606",
      "localPdf": "../Reference/SpecDiff2.pdf",
      "explanationPage": null,
      "institutionDetails": [
        {
          "name": "美国弗吉尼亚大学计算机科学系",
          "order": 1,
          "explanation": "全部作者均来自该单位。"
        }
      ],
      "institutionSource": "https://arxiv.org/pdf/2511.00606",
      "methodOverview": "使用离散扩散模型一次生成整个候选块，并通过 Streak-Distillation 或 Self-Selection 让冻结的自回归 Verifier 帮助校准 Drafter；推理时挑选预期接受长度最高的候选。",
      "problemStatement": {
        "background": "投机解码通过轻量 Drafter 先提出多个未来 Token，再由大规模自回归 Target/Verifier 一次并行评分并提交最长可接受前缀，在保持 Target 输出分布不变的前提下降低逐 Token 解码延迟。端到端速度主要受 Draft 延迟和每轮连续接受 Token 数共同制约。",
        "priorLimitation": "现有高质量 Drafter 多为自回归结构，候选长度增加时必须执行更多顺序前向，限制了并行性；而原始 SpecDiff 虽用离散扩散一次并行生成整个块，但扩散模型学习的是整段联合去噪分布，自回归 Verifier 依据因果 Prefix 逐位置决策，两者局部条件分布错位，导致后部 Token 接受率快速下降。常规逐位置或 AR 风格蒸馏主要优化靠近 Prefix 的位置，也没有直接对应投机解码所需的连续接受长度。",
        "goal": "同时解决 Draft 串行开销和 Diffusion Drafter–AR Verifier 错位：以预训练离散扩散模型低延迟并行生成长候选块，在训练阶段直接优化期望连续接受长度，并在推理阶段利用 Verifier 从多个廉价采样候选中选择预期吞吐最高的一条，同时保持无损输出。"
      },
      "methodComponents": [
        {
          "name": "Single-Step Masked Diffusion Drafting",
          "stage": "Draft generation",
          "purpose": "消除自回归 Drafter 按 Token 顺序执行前向的延迟，使长候选窗口可以在固定数量的去噪步骤内生成。",
          "mechanism": "在当前 Prefix 后放置 γ 个 Mask Token，由预训练 Masked Discrete Diffusion LM 对所有位置同时输出边缘分布 q1,…,qγ。主实验只执行 1 个去噪步骤；DiffuCoder 使用 γ=32，DiffuLLaMA 使用 γ=16，因此 Draft 成本主要取决于去噪步数，而非候选长度。",
          "differenceFromPrior": "传统 SpS、EAGLE 和 EAGLE-2 需要自回归展开候选或候选树；原始 SpecDiff 已具备并行扩散 Draft，但没有解决其与 AR Verifier 的 Prefix 条件错位。"
        },
        {
          "name": "Streak-Distillation",
          "stage": "Train-time alignment",
          "purpose": "让扩散 Drafter 的训练目标直接对应投机解码的期望连续接受 Token 数，而不是把各位置视为等价的独立分类任务。",
          "mechanism": "冻结 Verifier P，从其自回归续写轨迹 x1:γ∼P(·|s) 取得教师 Token；对 Drafter 在同一 Prefix 下并行输出的边缘概率 qj(xj|s) 优化 E[Σm=1…γ Πj=1…m qj(xj|s)]。前部位置会出现在更多 Prefix 乘积中，因而自然获得更高权重；实际训练对该期望执行梯度上升或最小化其负值。",
          "differenceFromPrior": "AR-Distillation 通常只对齐下一 Token，扩展版 DistillSpec 又对整个窗口做近似均匀平均；两者都没有保留连续接受事件的乘积结构，容易过度优化后部孤立位置或只改善最前部位置。"
        },
        {
          "name": "Low-Cost Parallel Multi-Draft Sampling",
          "stage": "Test-time candidate generation",
          "purpose": "在不重复执行扩散模型前向的情况下增加候选多样性，为 Verifier 提供更可能长距离匹配的路径。",
          "mechanism": "一次扩散去噪得到所有位置的边缘分布后，从相同的 {qj} 独立采样 K 条长度为 γ 的候选链。神经网络前向成本对固定 γ 近似为 O(1)，增加 K 主要引入廉价采样和后续 Verifier 评分开销。",
          "differenceFromPrior": "自回归多路径方法需要逐层扩树，Draft 计算随生成节点数增加；SpecDiff-2 复用一次并行边缘分布即可产生多条候选。"
        },
        {
          "name": "Self-Selection Acceptance",
          "stage": "Test-time alignment and candidate selection",
          "purpose": "将有限的 Verifier 计算用于选择预期连续接受长度最高的候选，而不是随机验证单条扩散样本。",
          "mechanism": "用 Tree-Style Attention 将 K 条候选的共享 Prefix 和重复节点压平，在一次 Verifier 前向中取得每条路径的逐 Prefix 概率。对候选 x(k) 计算 τk=Σm=1…γ Πj=1…m P(xj(k)|s◦x<j(k))，选择 τk 最大的路径，再复用已缓存的 Verifier 概率执行接受。",
          "differenceFromPrior": "EAGLE-2 等方法由自回归 Drafter动态扩树；SpecDiff-2 不把扩散 Drafter改造成树生成器，而是在一次边缘分布上采样多链，并以直接对应期望吞吐的 Verifier 分数选择一条。"
        },
        {
          "name": "Lossless Greedy-Acceptance",
          "stage": "Verification",
          "purpose": "在候选已经由 Verifier 参与选择的情况下仍恢复 Verifier 原始分布，并解除对 Drafter 校准概率和共享 Tokenizer 的依赖。",
          "mechanism": "对选中路径的第 i 个 Token，以 Verifier 概率 P(xi|Prefix) 作为 Bernoulli 接受概率；若拒绝，则从将该候选 Token 概率置零后重新归一化的 Verifier 分布中采样替代 Token，并终止后续 Draft。该混合过程对每个位置的边缘分布等于 P，且排序阶段的 Verifier Logits 可直接缓存复用。",
          "differenceFromPrior": "标准投机采样使用 min(1,p/q) 并从正残差 p−q 采样，需要 Drafter 与 Verifier 提供同词表且概率可比较；Greedy-Acceptance 只依赖 Verifier 概率，因此可扩展到跨 Tokenizer 或未校准的扩散 Drafter。"
        }
      ],
      "characteristics": {
        "requiresTraining": true,
        "drafterType": "pretrained-masked-discrete-diffusion",
        "draftGeneration": "parallel-multi-draft",
        "candidateStructure": "multiple-chains-with-selection",
        "verificationStrategy": "self-selection-greedy-acceptance",
        "usesTargetFeatures": true,
        "dynamicDraftLength": false,
        "dynamicVerifyLength": false,
        "lossless": true
      },
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
      "training": {
        "summary": "冻结 Verifier，仅微调预训练扩散 Drafter；Streak-Distillation 在 Verifier 生成的教师续写上最大化各 Prefix 的 Draft 概率乘积之和，使目标直接对应期望连续接受 Token 数，而非逐位置平均对齐。",
        "data": "Qwen2.5-14B/72B 对齐语料由对应 Verifier 在 GSM8K、Alpaca 和 LiveCodeBench Prompt 上以 Temperature=1.0 生成续写：共使用 128 个 Prompt，每个 Prompt 最多采样 32 条 Completion，三类数据各约占 1/3。LLaMA-2-13B 使用按 50:50 混合的 Llamatoloka/beemo 与 UltraFeedback，并筛选 LLaMA-2-13B-Chat 生成的回答；LLaMA-2-70B 使用 togethercomputer/llama-instruct 中筛选出的 LLaMA-2-70B Completion。评测集 Math-500、HumanEval 与 GPQA 不参与微调。",
        "objective": "冻结 AR Verifier P，仅更新预训练扩散 Drafter Qdiff。对每个 Prefix s 和由 P 采样的教师续写 x1:γ，最大化 Streak-Distillation 目标 E[Σm=1…γ Πj=1…m qj(xj|s;θ)]，等价于用可微代理直接提高整段 Prefix 的期望接受长度。主要扩展实验训练至 60,000 Step，报告成本不超过 75 A100 GPU-hours；与 DistillSpec 的对照在 40,000 Step、约 50 GPU-hours下进行。论文附录描述了 PEFT/LoRA 的加载与合并流程，但未给出统一的优化器、学习率、Batch Size 或 LoRA Rank。"
      },
      "evaluation": {
        "targetModels": [
          "Qwen2.5-72B-Instruct",
          "LLaMA-2-70B-Chat",
          "Qwen2.5-14B-Instruct",
          "LLaMA-2-13B-Chat"
        ],
        "benchmarks": [
          "Math-500",
          "HumanEval",
          "GPQA"
        ],
        "baselines": [
          "Autoregressive Decoding",
          "Speculative Sampling (SpS)",
          "EAGLE",
          "EAGLE-2",
          "SpecDiff",
          "DistillSpec"
        ],
        "metrics": [
          "End-to-end Wall-clock Speedup",
          "Tokens per Second",
          "Average Accepted Streak / Tokens per Draft",
          "Position-wise Acceptance Rate",
          "Accuracy under Fixed Wall-time Reasoning Budget",
          "Training GPU-hours"
        ],
        "hardware": [
          "NVIDIA A100 80GB (single GPU for 13B/14B experiments)",
          "2× NVIDIA A100 80GB (70B/72B experiments)",
          "x86_64 Linux CPU node with at least 256GB RAM"
        ],
        "frameworks": [
          "PyTorch 2.3+",
          "Transformers 4.46.x",
          "PEFT",
          "Hugging Face Datasets"
        ]
      },
      "mainResults": [
        {
          "condition": "Qwen2.5-72B-Instruct 与 LLaMA-2-70B-Chat，Temperature=0/1，Math-500、HumanEval、GPQA 全部设置平均",
          "metric": "End-to-end Wall-clock Speedup",
          "result": "4.22×",
          "comparison": "EAGLE-2 对应平均约 3.22×，SpecDiff-2 提升约 31%；平均 Tokens per Draft 约为 5.90。",
          "source": "Table 2; Section 7.1"
        },
        {
          "condition": "Qwen2.5-72B-Instruct，Temperature=0，三个基准宏平均",
          "metric": "Speedup / Average Accepted Streak",
          "result": "4.29× / 5.98 Tokens",
          "comparison": "EAGLE-2 为 2.94× / 4.41，EAGLE 为 2.24× / 3.30，SpS 为 1.70× / 1.77。",
          "source": "Table 2"
        },
        {
          "condition": "Qwen2.5-72B-Instruct，Temperature=1，HumanEval",
          "metric": "Speedup / Average Accepted Streak",
          "result": "5.51× / 7.71 Tokens",
          "comparison": "EAGLE-2 为 3.15× / 4.77；这是主表中的最高单项加速。",
          "source": "Table 2"
        },
        {
          "condition": "LLaMA-2-70B-Chat，Temperature=1，三个基准宏平均",
          "metric": "Speedup / Average Accepted Streak",
          "result": "4.27× / 5.98 Tokens",
          "comparison": "EAGLE-2 为 3.52× / 4.76。",
          "source": "Table 2"
        },
        {
          "condition": "70B/72B Verifier，Math 与代码任务对比开放式 GPQA",
          "metric": "Domain-wise Average Speedup",
          "result": "Math/Code 平均 4.71×；GPQA 平均 3.24×",
          "comparison": "EAGLE-2 分别为 3.43× 和 2.80×；SpecDiff-2 的相对优势从结构化任务约 37% 收窄到开放式问答约 16%。",
          "source": "Section 7.1"
        },
        {
          "condition": "Math-500，Greedy Decoding，对齐前后比较",
          "metric": "Alignment Ablation",
          "result": "Qwen2.5-72B 从 3.19× 提升到 4.62×（+44.8%）；Qwen2.5-14B 从 2.51× 提升到 3.65×（+45.5%）",
          "comparison": "训练与测试对齐把原始 SpecDiff 的吞吐提高约 40%–50%。",
          "source": "Table 3"
        },
        {
          "condition": "Streak-Distillation 与 Self-Selection 分项扩展",
          "metric": "Train-time / Test-time Scaling",
          "result": "Streak-Distillation 平均带来约 +30% Speedup；Self-Selection 再增加约 +15%，在 K=8、Draft Temperature=2.0 时最高额外约 +20%",
          "comparison": "60K 训练 Step 内已超过 EAGLE-2 吞吐，最高约 +32%；低温 0.1 因候选缺少多样性而几乎不随 K 扩展。",
          "source": "Figures 5 and 7; Section 7.3"
        },
        {
          "condition": "Qwen2.5-72B-Instruct，Math-500，15 秒 Chain-of-Thought 墙钟预算",
          "metric": "Accuracy under Fixed Wall-time",
          "result": "相对原始自回归模型准确率提升 63%，相对未对齐 SpecDiff 再提升 11%",
          "comparison": "加速把相同墙钟预算转换为更多可用推理 Token；该结果不是改变模型分布后的质量提升，而是有限时间内完成更多推理。",
          "source": "Figure 6; Section 7.2"
        },
        {
          "condition": "DiffuCoder + Qwen2.5-14B，后部 Draft 位置",
          "metric": "Position-wise Acceptance",
          "result": "Streak-Distillation 在后部位置的接受率平均约为 AR-Distillation 的 3.2×",
          "comparison": "AR 风格目标的收益集中在窗口前部并随位置迅速衰减；Streak 目标能覆盖完整 Draft Window。",
          "source": "Figure 2; Section 3"
        },
        {
          "condition": "Qwen2.5-14B，Temperature=0，HumanEval",
          "metric": "Speedup / Average Accepted Streak",
          "result": "6.17× / 10.8 Tokens",
          "comparison": "虽然接受长度极高，但 7B Drafter 对 14B Verifier 已明显过大；论文将小 Verifier 结果作为 Drafter 尺寸失配的补充分析，而非统一最优配置。",
          "source": "Table 4; Appendix A"
        }
      ],
      "limitations": [
        {
          "type": "theory",
          "description": "Greedy-Acceptance 虽被证明能恢复 Verifier 分布，但论文没有系统分析其在概率误校准、不同 Verifier Temperature 下的方差、最坏情况接受率及与候选选择偏差的交互；这些仍被列为开放问题。",
          "sourceType": "paper"
        },
        {
          "type": "model-scaling",
          "description": "DiffuCoder-7B 与 DiffuLLaMA-7B 的尺寸主要由当时可用的高质量开源 DLM 决定，而非由 Verifier–Drafter 最优比例推导。对 13B/14B Verifier，7B Drafter 比 EAGLE 系 Drafter 大 20 倍以上，Draft Latency 已不具竞争力；LLaMA-2-13B 上多项结果低于 EAGLE-2。",
          "sourceType": "paper"
        },
        {
          "type": "memory-and-latency",
          "description": "采用 7B 级 Drafter 并为 K 条候选执行 Tree-Style Verifier 评分，模型内存和 Verify Token 数都明显高于轻量并行 Drafter。70B/72B 实验需要两张 A100 80GB；K 增大时收益只有约 15%–20%，并非免费扩展。",
          "sourceType": "observed-data"
        },
        {
          "type": "hyperparameter",
          "description": "Diffusion Step、候选窗口 γ、采样温度和并行候选数 K 都是固定或离线选择的：DiffuCoder 使用 γ=32、DiffuLLaMA 使用 γ=16，主配置仅 1 个去噪步骤。最优值依赖 Drafter、任务和候选多样性，方法没有按请求动态调整 Draft Length 或 Verify Budget。",
          "sourceType": "paper"
        },
        {
          "type": "system",
          "description": "论文只在 A100 上做离线单请求式墙钟评测，没有报告高并发 Serving、不同 Batch、长上下文、量化模型或生产推理引擎中的吞吐–延迟曲线，因此 5× 左右峰值不能直接外推到在线部署。",
          "sourceType": "analysis"
        },
        {
          "type": "evaluation",
          "description": "主评测仅覆盖 Math-500、HumanEval 和 GPQA 三个数据集及 Qwen2.5/LLaMA-2 两个模型家族；论文明确称无法在其环境中复现 EAGLE-3，因此最强自回归对照停留在 EAGLE-2。",
          "sourceType": "paper"
        },
        {
          "type": "reproducibility",
          "description": "论文附录详细描述了硬件、软件、模型加载、Tree Mask 与日志流程，但没有给出官方代码仓库、训练脚本、对齐 Checkpoint 或完整训练超参数；Streak-Distillation 的优化器、学习率、Batch Size 和 LoRA 配置无法从论文完整恢复。",
          "sourceType": "paper"
        },
        {
          "type": "hardware",
          "description": "作者指出面向扩散长块的高效 Kernel 和 KV Cache 支持仍不足。Self-Selection 需要构造并缓存分支树 Attention Mask；当 K×γ 增大时，Mask、Verifier Forward 与缓存裁剪可能成为新的系统瓶颈。",
          "sourceType": "paper"
        },
        {
          "type": "generalization",
          "description": "论文展示了评测集与微调集数据集级别不重合，但 Qwen 对齐语料仍来自数学、指令和代码三类相近任务；对其他语言、长上下文、工具调用和更开放的生成分布是否保持同等对齐收益尚未验证。",
          "sourceType": "analysis"
        }
      ],
      "relations": {
        "extends": [],
        "comparesAgainst": [
          "eagle",
          "eagle-2"
        ],
        "related": [
          "eagle",
          "eagle-2",
          "eagle-3"
        ],
        "compatibleWith": []
      },
      "citations": [
        "eagle",
        "eagle-2",
        "eagle-3"
      ],
      "reproducibility": {
        "codeUrl": null,
        "modelUrl": null,
        "projectPage": null,
        "officialImplementation": false,
        "status": "not-released",
        "notes": [
          "论文与 arXiv 页面未提供 SpecDiff-2 官方代码、对齐模型或项目主页；当前可检索的 NSF 论文记录也标注 Code not available。",
          "Appendix B 给出了 PyTorch/Transformers 版本、A100 配置、Tree-Style Attention Mask、KV Cache 处理和数据流，但缺少可直接执行的仓库、命令与完整训练超参数。",
          "实现基于预训练 DiffuCoder-7B 与 DiffuLLaMA-7B，并描述了 PEFT/LoRA Adapter 的 CPU 合并路径；这些基础模型不等同于作者发布的 SpecDiff-2 对齐 Checkpoint。"
        ]
      },
      "evidence": [
        {
          "claim": "SpecDiff-2 将投机解码瓶颈拆为自回归 Draft 串行性与 Drafter–Verifier 错位，并分别以离散扩散和双阶段对齐解决。",
          "location": "Abstract and Section 1, Pages 1–2",
          "type": "motivation"
        },
        {
          "claim": "Masked Diffusion Drafter 在一个去噪步骤内同时输出整个 γ 长窗口的边缘分布，Draft 成本主要随去噪步数而非窗口长度变化。",
          "location": "Section 4, Page 3; Appendix A.2–A.3",
          "type": "method"
        },
        {
          "claim": "Streak-Distillation 最大化所有可接受 Prefix 的 Drafter 概率乘积之和，保留了连续接受长度的 Product-of-Accepts 结构。",
          "location": "Section 5.1, Equations 4–6, Pages 4–5",
          "type": "training"
        },
        {
          "claim": "Self-Selection 从一次扩散边缘分布采样 K 条候选，用 Verifier 的逐 Prefix 概率计算期望接受长度并选择最大者。",
          "location": "Section 5.2, Algorithm 1 and Equation 7, Pages 5–6",
          "type": "method"
        },
        {
          "claim": "Greedy-Acceptance 只依赖 Verifier 概率，拒绝时从排除候选 Token 的归一化 Verifier 分布采样，从而保持输出无损并允许跨 Tokenizer Drafter。",
          "location": "Section 5.2, Pages 5–6; Appendix C.1",
          "type": "verification"
        },
        {
          "claim": "主实验使用 Qwen2.5-72B/LLaMA-2-70B 及其 7B 扩散 Drafter，补充实验使用 Qwen2.5-14B/LLaMA-2-13B；评测为 Math-500、HumanEval 和 GPQA。",
          "location": "Section 6 and Table 1, Pages 6–7",
          "type": "evaluation"
        },
        {
          "claim": "全部 70B/72B、两种 Temperature 和三个基准的平均加速为 4.22×，较 EAGLE-2 平均约提升 31%。",
          "location": "Table 2 and Section 7.1, Page 7",
          "type": "result"
        },
        {
          "claim": "Math-500 上对齐后的 SpecDiff-2 相对未对齐 SpecDiff 在 Qwen2.5-72B 和 14B 上分别提升 44.8% 和 45.5%。",
          "location": "Table 3 and Section 7.3, Page 9",
          "type": "result"
        },
        {
          "claim": "在 15 秒 Math-500 推理预算下，SpecDiff-2 相对 Vanilla 提升 63% 准确率，相对未对齐 SpecDiff 提升 11%。",
          "location": "Figure 6 and Section 7.2, Page 8",
          "type": "result"
        },
        {
          "claim": "训练数据、软件版本、A100 硬件和 Tree-Style Attention 实现细节在附录中给出，但官方代码和 Checkpoint 未随论文提供。",
          "location": "Appendix B.1–B.8, Pages 15–17",
          "type": "reproducibility"
        }
      ],
      "notes": [
        "Table 2 的正文列名是 Math-500、HumanEval 和 GPQA，但表注误写为 Math-500、LiveCodeBench 和 MT-Bench；本条目的评测字段按正文、表头和 Section 6 记录为前者。",
        "Table 2 的 Tokens per Draft 按论文惯例包含 Verifier 额外生成的 1 个 Bonus Token，因此不能与只统计 Drafter Accepted Tokens 的工作直接横向比较。",
        "论文脚注说明 EAGLE-3 在作者环境中无法复现，因此主表没有 EAGLE-3 数值；其只保留在引用与相关工作中。",
        "附录部分图表使用 SpecDiff-2.0 命名，指代同一套 Streak-Distillation + Self-Selection 方法，并非独立版本。",
        "Self-Selection 的候选在实现中可用 Tree-Style Attention 合并评分，但最终只选择并验证一条链；因此 candidateStructure 记录为 multiple-chains-with-selection，而不是持续提交多分支树。"
      ],
      "qaNotes": [],
      "provenance": {
        "legacyWorkbookRow": 9,
        "workbookInstitutions": "美国加州大学圣塔芭芭拉分校（UCSB）等"
      },
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
      "venue": "ICML 2026",
      "date": "2026-02",
      "url": "https://arxiv.org/abs/2602.06036",
      "localPdf": "../Reference/DFlash.pdf",
      "explanationPage": "explanations/DFlash.html",
      "institutionDetails": [
        {
          "name": "美国加州大学圣迭戈分校（UC San Diego）",
          "order": 1,
          "explanation": "全部作者均来自该校。"
        }
      ],
      "institutionSource": "https://arxiv.org/pdf/2602.06036",
      "methodOverview": "轻量级 Block-Diffusion Drafter 用一次前向同时预测一个 Token Block，并注入由 Target 多层 KV 融合得到的上下文。位置加权 Training 重点保护靠前 Token。",
      "problemStatement": {
        "background": "自回归 LLM 每生成一个 Token 都需要一次顺序前向，解码阶段延迟高且 GPU 利用率不足。投机解码可让轻量 Drafter 先提出多个候选，再由 Target 在一次前向中并行验证；其端到端收益取决于 Draft 延迟、接受长度和 Verify 成本之间的平衡。",
        "priorLimitation": "EAGLE-3 等高质量 Drafter 仍按 Token 自回归生成，Draft 成本随候选长度线性增长，只能使用很浅的网络和较短候选。已有扩散式方案要么使用数十亿参数的 Drafter 并执行较重的搜索或去噪，内存与延迟开销过高；要么使用缺少 Target 内部特征的小模型并行预测，接受长度有限。仅在 Drafter 输入端融合 Target 特征时，条件信息还会随网络加深而稀释。",
        "goal": "构建一个足够轻量、但能充分利用 Target 内部知识的 Block-Diffusion Drafter，使多个候选 Token 能以一次前向并行产生，同时保持较高接受长度，并通过标准投机验证保证最终输出分布与 Target 原始解码完全一致。"
      },
      "methodComponents": [
        {
          "name": "Multi-Layer Target Context Fusion",
          "stage": "Target prefill and verification",
          "purpose": "从 Target 的内部表示中提取比最终 Logits 更丰富的上下文与未来 Token 线索，为轻量 Drafter 提供高质量条件信息。",
          "mechanism": "从 Target 的浅层到深层均匀选取 5 层 Hidden State，按 Token 位置拼接，经共享投影 Wc 压缩到 Drafter Hidden Dimension，并执行 RMSNorm，形成紧凑的 Target Context Feature。Target 每次 Prefill 或 Verify 后产生的新 Hidden State 会继续扩展这份上下文。",
          "differenceFromPrior": "无条件的小型扩散 Drafter 必须从 Token 历史中独立重建 Target 的推理结果；EAGLE-3 式方法则主要把 Target Feature 与 Token Embedding 在输入端融合，条件信息可能随 Drafter 深度增加而被稀释。"
        },
        {
          "name": "Persistent KV Injection",
          "stage": "Draft attention",
          "purpose": "让每个 Drafter 层都能直接访问同一份 Target Context，避免 Target 信息只在输入层出现后逐层衰减。",
          "mechanism": "在第 i 个 Drafter 层中，候选块状态产生 Query；Target Context 与候选块状态分别经过该层 K/V Projection 后沿序列维拼接。Target Context 仅作为附加 KV Entry，不经过 Drafter 的 Query、Attention Output、残差更新或 FFN，并被缓存在 Drafter KV Cache 中跨轮复用。",
          "differenceFromPrior": "输入融合只在 Drafter 的第一层注入 Target Feature；DFlash 则在每个 Drafter 层的 Attention 中持续注入 Target KV，使接受长度能随 Drafter 深度更稳定地增长。"
        },
        {
          "name": "Single-Pass Block-Diffusion Drafting",
          "stage": "Draft generation",
          "purpose": "解除候选长度与 Draft 前向次数之间的线性绑定，在低 Draft 延迟下使用更深的 Drafter 和更大的候选块。",
          "mechanism": "每轮以 Target 产生的 Decode/Bonus Token 作为干净锚点，在其后放置 B−1 个 Mask Token。块内位置执行双向 Attention，并共同访问完整 Target Context；经过 5 层 Drafter 后复用 Target LM Head，一次前向并行得到所有 Mask 位置的 Token 分布并采样出一条候选链。主要 Qwen 配置使用 Block Size 16。",
          "differenceFromPrior": "自回归 Drafter 需要为每个候选 Token 分别执行前向，成本近似随候选长度增长；DiffuSpec、SpecDiff-2 等方案使用更大的扩散 Drafter或更重的推理过程，而 DFlash 将去噪压缩为一次轻量前向。"
        },
        {
          "name": "Speculative-Aligned Block Training",
          "stage": "Training",
          "purpose": "让训练输入结构与实际 Draft 场景一致，并优先提高决定最长接受前缀的早期位置准确率。",
          "mechanism": "仅保留数据集 Prompt，并由对应 Target 重新生成 Response；从每条 Response 随机采样多个 Anchor Position，把 Anchor 之后 B−1 个位置遮蔽。多个 Mask Block 通过块间隔离、块内双向的 Sparse Attention 在一次前后向中联合训练。损失使用 w_k=exp(−(k−1)/γ) 的位置加权交叉熵，冻结 Target、共享 Token Embedding 和 LM Head，只更新 Drafter Transformer 与上下文投影。",
          "differenceFromPrior": "标准 Block Diffusion 通常按固定边界切块并随机遮蔽块内位置，也不会专门强调最长接受前缀；DFlash 改为随机干净锚点加连续后缀 Mask，并对靠前位置赋予更高损失权重。"
        }
      ],
      "characteristics": {
        "requiresTraining": true,
        "drafterType": "block-diffusion",
        "draftGeneration": "parallel",
        "candidateStructure": "chain",
        "verificationStrategy": "fixed-prefix",
        "usesTargetFeatures": true,
        "dynamicDraftLength": false,
        "dynamicVerifyLength": false,
        "lossless": true
      },
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
      "training": {
        "summary": "用 Nemotron Post-Training Dataset V2 与 CodeAlpaca 的约 80 万条提示，由各 Target 重新生成训练响应；每个序列随机采样锚点并遮蔽后续 B−1 个位置，以块间隔离、块内双向的 Sparse Attention 一次训练多个块。",
        "data": "约 80 万条 Prompt，来源为 NVIDIA Nemotron Post-Training Dataset V2 与 CodeAlpaca。论文不直接使用原始 Response，而是由每个对应 Target 模型重新生成训练响应，以缩小 Drafter 训练分布与 Target 实际输出分布之间的偏差。默认最大序列长度为 3072，Qwen3-Coder 为 4096；每条序列随机采样 512 个 Anchor Position。",
        "objective": "对每个 Mask Block 的 B−1 个预测位置使用交叉熵，并设置指数衰减位置权重 w_k=exp(−(k−1)/γ)，优先优化会决定整段接受前缀的靠前 Token。Block Size 16、10、8 分别使用 γ=7、5、4。Target 模型、共享 Token Embedding 与 LM Head 全部冻结，仅训练 Drafter Transformer 和 Target Context Projection；使用 AdamW 训练 6 个 Epoch，学习率 6e−4、Gradient Clipping 1.0、Cosine Schedule 与 0.04 Warmup Ratio。"
      },
      "evaluation": {
        "targetModels": [
          "Qwen3-4B",
          "Qwen3-8B",
          "Qwen3-Coder-30B-A3B-Instruct",
          "LLaMA-3.1-8B-Instruct",
          "Qwen3.5-4B",
          "Qwen3.5-9B",
          "Qwen3.5-35B-A3B",
          "Qwen3.5-27B",
          "Qwen3-Coder-Next",
          "GPT-OSS-20B",
          "GPT-OSS-120B"
        ],
        "benchmarks": [
          "GSM8K",
          "MATH-500",
          "AIME25",
          "GPQA",
          "HumanEval",
          "MBPP",
          "LiveCodeBench",
          "MT-Bench",
          "Alpaca",
          "HotpotQA",
          "Qasper",
          "GovReport"
        ],
        "baselines": [
          "Autoregressive Decoding",
          "EAGLE-3",
          "Native MTP"
        ],
        "metrics": [
          "Average Acceptance Length",
          "End-to-end Decoding Speedup",
          "Serving Throughput",
          "Draft Latency"
        ],
        "hardware": [
          "NVIDIA H200",
          "NVIDIA B200"
        ],
        "frameworks": [
          "Transformers",
          "SGLang",
          "vLLM"
        ]
      },
      "mainResults": [
        {
          "condition": "Qwen3-4B，Temperature=0，GSM8K、MATH-500、AIME25、HumanEval、MBPP、LiveCodeBench 与 MT-Bench 宏平均",
          "metric": "End-to-end Decoding Speedup",
          "result": "4.91×",
          "comparison": "EAGLE-3 在 16 节点和 60 节点配置下分别为 1.81× 与 2.08×；DFlash 相对 EAGLE-3 (16) 的平均速度约为 2.7 倍。",
          "source": "Table 1"
        },
        {
          "condition": "Qwen3-4B，Temperature=0，七个基准宏平均",
          "metric": "Average Acceptance Length",
          "result": "6.54",
          "comparison": "EAGLE-3 在 16 节点和 60 节点配置下分别为 3.05 与 3.48；DFlash 在更低 Verify 预算下仍取得更长接受前缀。",
          "source": "Table 1"
        },
        {
          "condition": "Qwen3-8B，Temperature=0，七个基准宏平均",
          "metric": "End-to-end Decoding Speedup",
          "result": "4.86×",
          "comparison": "EAGLE-3 在 16 节点和 60 节点配置下分别为 1.76× 与 2.02×；DFlash 相对 EAGLE-3 (16) 的平均速度约为 2.8 倍。",
          "source": "Table 1"
        },
        {
          "condition": "Qwen3-8B，Temperature=0，七个基准宏平均",
          "metric": "Average Acceptance Length",
          "result": "6.49",
          "comparison": "EAGLE-3 在 16 节点和 60 节点配置下分别为 2.96 与 3.40。",
          "source": "Table 1"
        },
        {
          "condition": "Qwen3-8B Thinking Mode，Temperature=0",
          "metric": "Reasoning-model Speedup / Acceptance Length",
          "result": "GPQA 4.17× / 5.17；MATH-500 4.64× / 5.82；AIME25 4.51× / 5.74",
          "comparison": "相对无投机解码 Baseline 均保持约 4.2×–4.6× 加速，说明长推理轨迹下并行 Draft 的收益仍然成立。",
          "source": "Table 2"
        },
        {
          "condition": "Qwen3-8B，Math500，SGLang + FlashAttention-4，单张 B200",
          "metric": "Serving Throughput",
          "result": "Concurrency=1 时 1175 tokens/s、5.1×；Concurrency=32 时 16076 tokens/s、2.8×；Average Acceptance Length 为 8.01",
          "comparison": "对应 Autoregressive Baseline 分别为 230 与 5694 tokens/s；并发增大后仍有吞吐收益，但相对加速比下降。",
          "source": "Table 3"
        },
        {
          "condition": "Qwen3.5-27B Drafter 从 4K Base 通过 1.6K 条 LongAlign-10K 样本微调后，在 16K Context 上测试",
          "metric": "Long-context Average Acceptance Length",
          "result": "HotpotQA 由 3.61 提升到 6.05；Qasper 由 3.57 提升到 6.00；GovReport 由 2.67 提升到 3.81",
          "comparison": "少量长上下文适配显著逆转 Base Drafter 随 Context Length 增长的接受长度退化。",
          "source": "Table 4"
        },
        {
          "condition": "Qwen3-4B，5 层 Drafter，Block Size 8，比较每层 KV Injection 与仅输入端 Feature Fusion",
          "metric": "KV Injection Ablation",
          "result": "GSM8K 为 4.2 / 3.3× 对 3.5 / 2.9×；HumanEval 为 4.0 / 3.2× 对 3.5 / 2.9×；MT-Bench 为 3.0 / 2.2× 对 2.6 / 2.0×（Acceptance Length / Speedup）",
          "comparison": "在三个任务上，逐层 KV Injection 均优于只在输入端融合 Target Feature。",
          "source": "Table 9"
        }
      ],
      "limitations": [
        {
          "type": "algorithmic",
          "description": "一次 Block-Diffusion 前向输出的是各未来位置的并行分布，并在同一轮内直接采样一条候选链；后部位置不会基于已经实际采样出的前部 Token 再做条件化，因此仍可能出现后缀一致性下降和多模态组合冲突。",
          "sourceType": "analysis"
        },
        {
          "type": "system",
          "description": "论文使用固定 Block Size 和固定最长前缀 Verify。较大的候选块在大 Batch 或 Compute-bound 场景会增加无效验证成本；论文明确将根据系统状态自适应调整 Block Size 留作未来工作。",
          "sourceType": "paper"
        },
        {
          "type": "generalization",
          "description": "默认在约 4K Context 上训练的 Drafter 在更长上下文中接受长度明显下降。论文通过 1.6K 条长上下文样本微调恢复性能，但这仍意味着长 Context 部署需要额外适配，而不是直接零样本泛化。",
          "sourceType": "paper"
        },
        {
          "type": "training-cost",
          "description": "增加 Drafter 层数能够提高接受长度，但也会增加 Draft Latency；论文中 8 层模型的接受长度高于 5 层模型，平均速度却更低。提取更多 Target Hidden Features 还会使离线特征缓存与训练存储开销近似线性增加。",
          "sourceType": "paper"
        },
        {
          "type": "evaluation",
          "description": "主实验没有直接比较 DiffuSpec、SpecDiff-2、TiDAR 等其他扩散式投机解码方法，论文给出的原因是当时缺少可用的开源实现，因此“扩散 Drafter 中的最优性”证据弱于其对 EAGLE-3 的比较。",
          "sourceType": "paper"
        },
        {
          "type": "deployment",
          "description": "方法要求 Target 暴露多层 Hidden State，并在 Drafter 每层维护额外 Target KV Entry；这比只接受 Token Logits 的通用投机解码接口更侵入，需要推理引擎对 Hidden-State Extraction、双模型 KV Cache 和 Verify 后缓存裁剪进行专门集成。",
          "sourceType": "analysis"
        },
        {
          "type": "evidence",
          "description": "最高 6× 左右加速主要出现在低并发、数学或代码等较可预测任务；在开放式对话和高并发下，加速明显降低。例如 Qwen3-8B Math500 在 SGLang 上从 Concurrency=1 的 5.1× 降至 Concurrency=32 的 2.8×，说明单点峰值不能直接代表所有 Serving 负载。",
          "sourceType": "observed-data"
        }
      ],
      "relations": {
        "extends": [],
        "comparesAgainst": [],
        "related": [
          "medusa",
          "eagle",
          "eagle-2",
          "eagle-3",
          "pard",
          "diffuspec",
          "specdiff-2"
        ],
        "compatibleWith": []
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
      "reproducibility": {
        "codeUrl": "https://github.com/z-lab/dflash",
        "modelUrl": "https://hf.co/collections/z-lab/dflash",
        "projectPage": "https://dflash.z-lab.ai",
        "officialImplementation": true,
        "status": "not-reproduced",
        "notes": [
          "论文首页提供官方 Code、Models 与 Project Page，代码仓库和预训练 Drafter 均由作者团队维护。",
          "官方实现覆盖训练、Transformers 推理及 Serving 集成；论文还报告了 SGLang 与 vLLM 的端到端结果。",
          "本站尚未记录一组严格复现论文 Table 1–3 的完整环境、命令与数值，因此状态标为 not-reproduced。"
        ]
      },
      "evidence": [
        {
          "claim": "DFlash 用轻量 Block-Diffusion Drafter 在一次前向中并行生成候选块，并通过标准投机验证保持 Target 输出分布不变。",
          "location": "Abstract and Section 1, Pages 1–2; Section 3.1, Page 3",
          "type": "method"
        },
        {
          "claim": "Target 的 5 层 Hidden State 被拼接、投影并归一化为 Context Feature，再作为额外 KV Entry 注入每个 Drafter 层。",
          "location": "Section 4.1 and Figure 2, Page 4; Appendix A.3, Page 12",
          "type": "method"
        },
        {
          "claim": "主要 Qwen 配置使用 5 层 Drafter、Block Size 16，并从 Target 的第二层到倒数第三层之间均匀选取 5 层特征。",
          "location": "Section 5, Page 6",
          "type": "configuration"
        },
        {
          "claim": "训练使用约 80 万条 Nemotron Post-Training Dataset V2 与 CodeAlpaca Prompt，并由对应 Target 重新生成 Response。",
          "location": "Section 5, Page 6",
          "type": "training"
        },
        {
          "claim": "随机 Anchor、块内双向且块间隔离的 Sparse Attention、位置衰减交叉熵以及冻结共享 Embedding/LM Head 构成核心训练流程。",
          "location": "Section 4.2 and Figure 4, Page 5; Appendix A.1 and A.5, Pages 12–13",
          "type": "training"
        },
        {
          "claim": "Qwen3-4B 与 Qwen3-8B 在 Temperature=0 时分别达到 4.91×/6.54 和 4.86×/6.49 的平均 Speedup/Acceptance Length。",
          "location": "Table 1, Page 6",
          "type": "result"
        },
        {
          "claim": "Thinking Mode 下，Qwen3-4B 与 Qwen3-8B 在 GPQA、MATH-500、AIME25 上保持约 3.6×–4.6× 加速。",
          "location": "Section 5.2 and Table 2, Page 7",
          "type": "result"
        },
        {
          "claim": "SGLang Serving 实验在单张 B200 上测试 Concurrency 1–32，并报告 Qwen3-8B Math500 最高 5.1× 加速。",
          "location": "Section 5.3 and Table 3, Page 7",
          "type": "system"
        },
        {
          "claim": "用 1.6K 条 LongAlign-10K 样本微调后，Qwen3.5-27B Drafter 在最长 32K Context 上显著恢复接受长度。",
          "location": "Section 5.4 and Table 4, Pages 7–8",
          "type": "result"
        },
        {
          "claim": "消融结果表明 5 层在速度与质量间最优、更多 Target Feature 提高接受长度、Block Size 16 可向较小测试块泛化、KV Injection 优于 Input Fusion。",
          "location": "Sections 5.5.2–5.5.5 and Tables 6–9, Pages 8–9",
          "type": "ablation"
        }
      ],
      "notes": [
        "论文中的 Average Acceptance Length τ 包含 Target 在每轮 Verify 后生成的 Bonus Token；因此 τ=1 表示 Draft Token 全部未被接受，但该轮仍由 Target 推进了一个 Token。",
        "论文的 Block Size B 包含一个干净的 Target Decode/Bonus Token 和其后的 B−1 个 Mask 位置；主要 Block Size 16 对应一次并行预测 15 个新 Draft Token。",
        "DFlash 虽使用 Block Diffusion 命名，但 Draft 阶段不是多轮迭代去噪，而是把推测过程压缩为一次前向；其本质更接近由 Target Feature 强条件化的单步 Mask Block Predictor。",
        "更深并不必然更快：Table 6 中 8 层模型接受长度最高，但 5 层模型平均 Speedup 更优，说明 Drafter Capacity 必须和 Draft Latency 一起评估。",
        "Block Size 16 训练出的模型可较好地缩短到 Block Size 8 推理，反向从 8 扩到 16 的泛化较差；这为后续动态 Draft Length 提供了基础，但论文本身没有实现调度器。",
        "Appendix A.3 估算 Qwen3.5-35B-A3B 配置的额外 Target Feature Projection 参数约为 42 MB，相比约 70 GB Target 很小；但长期 KV、引擎接口和 Batch Verify 成本仍需在真实 Serving 中单独核算。",
        "DFlash 主要优化 Drafter 的速度与质量，和 DDTree/TAPS 的候选树组织、DSpark 的半自回归依赖建模与动态 Verify 调度基本正交。"
      ],
      "qaNotes": [],
      "provenance": {
        "legacyWorkbookRow": 10,
        "workbookInstitutions": "中国科学院计算技术研究所、其他合作单位"
      },
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
      "venue": "arXiv",
      "date": "2026-06",
      "url": "https://arxiv.org/abs/2606.02091",
      "localPdf": "../Reference/DFlare.pdf",
      "explanationPage": null,
      "institutionDetails": [
        {
          "name": "北京大学计算机学院",
          "order": 1,
          "explanation": "论文单位 1；一作 Jiebin Zhang、通讯作者 Sujian Li 及多数作者所属单位。"
        },
        {
          "name": "腾讯",
          "order": 2,
          "explanation": "论文单位 2；Song Liu、Guanghua Yu 和 Jianchen Zhu 所属单位。"
        }
      ],
      "institutionSource": "https://arxiv.org/pdf/2606.02091",
      "methodOverview": "在 DFlash 基础上，以逐 Drafter 层的 Target Hidden State 自适应融合和异构 KV Projection 解除共享条件表示造成的容量瓶颈，使更深的 Block-Diffusion Drafter 能继续受益于更多 Target 知识和更大训练数据。",
      "problemStatement": {
        "background": "Block-Diffusion Drafter 能在一次前向中并行预测一个候选块，Draft 延迟不会随候选长度线性增长，因此比自回归 Drafter 更有条件通过增加网络深度提升预测能力。",
        "priorLimitation": "DFlash 将少量 Target Layer Hidden States 通过一个 FC 层融合为单一表示，并将同一份 Target Context 注入所有 Drafter 层；同时，Target Context 与 Drafter 内部状态共用 KV Projection。这限制了不同 Drafter 层的差异化表达，使增加 Drafter 深度或 Target 特征层数时收益逐渐饱和。",
        "goal": "增强每个 Drafter 层独立提取和利用 Target 知识的能力，解除 Block-Diffusion Drafter 的深度扩展瓶颈，并通过扩大模型容量和训练规模提高接受长度与端到端推理速度。"
      },
      "methodComponents": [
        {
          "name": "Adaptive Layer Fusion",
          "stage": "Draft conditioning",
          "purpose": "为不同 Drafter 层提供差异化且更丰富的 Target 条件信息。",
          "mechanism": "每个 Drafter 层学习一组独立的 Softmax 标量权重，对多个 Target Layer Hidden States 加权求和并执行 RMSNorm。融合权重在训练完成后可以预计算；Qwen 配置使用 7 个 Drafter 层和 9 个 Target 特征层，仅需 7×9=63 个融合标量。",
          "differenceFromPrior": "DFlash 将多个 Target Hidden States 拼接后通过一个 FC 层生成单一共享表示，并把相同表示注入所有 Drafter 层。"
        },
        {
          "name": "Heterogeneous KV Projections",
          "stage": "Draft attention",
          "purpose": "避免 Target 语义上下文与 Drafter 内部状态被迫共用同一表示空间。",
          "mechanism": "在每个 Drafter 层中，Target Context 使用专用的 Target K/V Projection，Target Decode Token 与 Mask 位置的 Drafter 状态使用另一套 Draft K/V Projection；两类 KV 随后拼接，由候选块位置产生的 Query 统一访问。",
          "differenceFromPrior": "DFlash 让 Target Context、Target Decode Token 和 Drafter Mask State 共用相同的 K/V Projection。"
        },
        {
          "name": "Progressive Position-Weighted Loss",
          "stage": "Training",
          "purpose": "兼顾决定接受前缀的早期位置和更难预测的后缀位置。",
          "mechanism": "继续使用随位置指数衰减的 Token 预测损失，但让衰减参数 γ 随训练进程增大。Qwen 配置从 γ₀=4.5 开始，每个 Epoch 增加 1，使训练早期重点优化前部 Token，后期逐步提高尾部 Token 的相对权重。",
          "differenceFromPrior": "DFlash 在整个训练过程中使用固定的 γ，较小的 γ 容易忽视尾部位置，较大的 γ 又会减慢关键前部位置的收敛。"
        }
      ],
      "characteristics": {
        "requiresTraining": true,
        "drafterType": "block-diffusion",
        "draftGeneration": "parallel",
        "candidateStructure": "chain",
        "verificationStrategy": "fixed-prefix",
        "usesTargetFeatures": true,
        "dynamicDraftLength": false,
        "dynamicVerifyLength": false,
        "lossless": true
      },
      "subproblemContributions": {
        "A": {
          "summary": "通过逐 Drafter 层的 Target 特征融合和异构 KV Projection，解除 DFlash 的共享条件瓶颈，使 Block-Diffusion Drafter 能稳定扩展到更深结构。",
          "detail": "每个 Drafter 层分别学习对多个 Target Layer Hidden States 的 Softmax 加权组合，并将融合结果经 RMSNorm 后作为该层独有的 Target Context。Target Context 与 Drafter Block 使用独立的 K/V Projection，从而获得不同的表示子空间。\n\n推理流程仍沿用 DFlash：以一个 Target Decode Token 和 B−1 个 Mask 位置作为输入，一次 Drafter 前向并行生成单条候选链，再由 Target 验证最长连续前缀。Qwen 配置将 Drafter 扩展至 7 层、Block Size 设为 16，并从 Target 的第二层到倒数第三层之间均匀选取 9 层特征。"
        },
        "E": {
          "summary": "将 Target 重生成训练数据扩大至约 240 万条，并采用渐进位置加权损失，先优化关键前缀位置，再逐步加强困难后缀。",
          "detail": "训练数据来自 NVIDIA Nemotron Post-Training Dataset V2、CodeAlpaca 和 Step-3.5-Flash-SFT。论文仅保留原始 Prompt，并使用对应 Target 模型在 Temperature=0.6 下重新生成 Response，使 Drafter 的训练分布与 Target 输出分布对齐。\n\nQwen 配置采用随训练进程增大的位置权重衰减参数：训练早期集中优化最影响接受长度的前部位置，后期逐步拉平权重分布，提高尾部位置的训练强度。"
        }
      },
      "training": {
        "summary": "冻结 Target 模型以及共享的 Token Embedding 和 LM Head，训练 DFlare Drafter、逐层融合权重和异构 KV Projection。完整训练运行 6 个 Epoch，使用 AdamW、6e-4 学习率、Cosine Schedule、0.04 Warmup Ratio、最大序列长度 3072，并从每条序列随机采样 512 个 Anchor Position。",
        "data": "约 240 万条 Prompt，来源为 NVIDIA Nemotron Post-Training Dataset V2、CodeAlpaca 和 Step-3.5-Flash-SFT。所有 Response 均由对应 Target 模型以 Temperature=0.6 重新生成，训练时只预测重生成的 Response Token。完整训练使用 Global Batch Size 64。",
        "objective": "采用按候选块位置加权的 Token 预测损失，位置权重为指数衰减形式。Qwen 配置从 γ₀=4.5 开始，每个 Epoch 将 γ 增加 1；GPT-OSS-20B 因 Block Size 仅为 8，全程固定 γ=4。"
      },
      "evaluation": {
        "targetModels": [
          "Qwen3-4B",
          "Qwen3-8B",
          "GPT-OSS-20B"
        ],
        "benchmarks": [
          "GSM8K",
          "MATH500",
          "AIME25",
          "HumanEval",
          "MBPP",
          "MT-Bench"
        ],
        "baselines": [
          "Autoregressive Decoding",
          "EAGLE-3",
          "DFlash"
        ],
        "metrics": [
          "Average Acceptance Length",
          "End-to-end Wall-clock Speedup",
          "Serving Throughput"
        ],
        "hardware": [
          "NVIDIA H20"
        ],
        "frameworks": [
          "Transformers",
          "SGLang"
        ]
      },
      "mainResults": [
        {
          "condition": "Qwen3-4B，Temperature=0，六个基准宏平均",
          "metric": "End-to-end Wall-clock Speedup",
          "result": "5.52×",
          "comparison": "DFlash 为 4.99×，DFlare 相对提升约 10.6%。",
          "source": "Table 1"
        },
        {
          "condition": "Qwen3-4B，Temperature=0，六个基准宏平均",
          "metric": "Average Acceptance Length",
          "result": "7.47",
          "comparison": "DFlash 为 6.47，DFlare 相对提升约 15.5%。",
          "source": "Table 1"
        },
        {
          "condition": "Qwen3-8B，Temperature=0，六个基准宏平均",
          "metric": "End-to-end Wall-clock Speedup",
          "result": "5.46×",
          "comparison": "DFlash 为 5.05×，DFlare 相对提升约 8.1%。",
          "source": "Table 1"
        },
        {
          "condition": "Qwen3-8B，Temperature=0，六个基准宏平均",
          "metric": "Average Acceptance Length",
          "result": "7.33",
          "comparison": "DFlash 为 6.39，DFlare 相对提升约 14.7%。",
          "source": "Table 1"
        },
        {
          "condition": "GPT-OSS-20B，Temperature=0，六个基准宏平均",
          "metric": "End-to-end Wall-clock Speedup",
          "result": "3.91×",
          "comparison": "DFlash 为 3.71×，DFlare 相对提升约 5.4%。",
          "source": "Table 1"
        },
        {
          "condition": "GPT-OSS-20B，Temperature=0，六个基准宏平均",
          "metric": "Average Acceptance Length",
          "result": "4.93",
          "comparison": "DFlash 为 4.66，DFlare 相对提升约 5.8%。",
          "source": "Table 1"
        },
        {
          "condition": "Qwen3-8B，Temperature=0，训练数据从 270K 扩展到 800K 和 2.4M，六个基准宏平均",
          "metric": "Data Scaling",
          "result": "Speedup 从 3.74× 提升至 4.97× 和 5.46×；Acceptance Length 从 4.90 提升至 6.59 和 7.33。",
          "comparison": "结果显示扩大 Target 重生成数据仍能持续释放更深 Drafter 的容量。",
          "source": "Figure 1; Table 6"
        },
        {
          "condition": "Qwen3-8B，GSM8K，SGLang，单张 H20，Concurrency=16",
          "metric": "Serving Throughput",
          "result": "1828.7 tokens/s",
          "comparison": "DFlash 为 1045.5 tokens/s，Autoregressive Baseline 为 1046.9 tokens/s。",
          "source": "Table 3"
        },
        {
          "condition": "Qwen3-4B，GSM8K、HumanEval 与 MT-Bench 平均，结构消融实验",
          "metric": "Component Ablation",
          "result": "完整 DFlare 的平均 Speedup/Acceptance Length 为 3.37×/4.52；移除 Softmax、异构 KV Projection、渐进位置损失后分别为 3.31×/4.47、3.35×/4.48、3.34×/4.47；融合后额外增加 FC 层为 3.35×/4.51。",
          "comparison": "移除三项核心设计均会降低整体表现，其中去掉 Softmax 的下降最大；额外增加 FC 层没有提高平均接受长度。",
          "source": "Table 2"
        }
      ],
      "limitations": [
        {
          "type": "training-cost",
          "description": "更深的 Drafter 和约 240 万条训练语料导致训练成本较高。完整训练使用 32 张 GPU；论文报告 Qwen3-8B Drafter 约需 160 小时墙钟时间，Qwen3-4B 和 GPT-OSS-20B 分别约需 100 小时和 90 小时。",
          "sourceType": "paper"
        },
        {
          "type": "evaluation",
          "description": "论文认为继续扩大训练数据可能进一步提高接受长度，但受计算资源限制，没有验证超过 240 万条数据后的扩展趋势。",
          "sourceType": "paper"
        },
        {
          "type": "algorithmic",
          "description": "DFlare 仍一次并行生成单条候选链，后部位置不会根据已经实际采样出的前部 Token 重新条件化，因此没有从根本上解决并行 Drafter 的后缀一致性和多模态碰撞问题。",
          "sourceType": "analysis"
        },
        {
          "type": "system",
          "description": "使用固定 Block Size 和固定最长前缀验证，没有根据请求难度、置信度或实时 Serving 负载动态调整 Draft Length 或 Verify Length。",
          "sourceType": "analysis"
        },
        {
          "type": "evidence",
          "description": "主结果同时扩大了 Drafter 深度、Target 特征层数和训练数据，并引入多个新组件，因此整体提升不能全部归因于 Adaptive Layer Fusion；各单项组件在结构消融中的独立收益相对有限。",
          "sourceType": "analysis"
        },
        {
          "type": "latency",
          "description": "Qwen3-8B 上，DFlare 相对 DFlash 的平均接受长度提升约 14.7%，但端到端速度仅提升约 8.1%。更深的 Drafter 及新增的逐层 Target 特征处理和异构 KV Projection 增加了每轮 Draft 成本，抵消了部分接受长度收益。",
          "sourceType": "analysis"
        },
        {
          "type": "evidence",
          "description": "Appendix A.4 概括称 DFlare 在 GSM8K 和 HumanEval 的所有并发设置下均取得最高吞吐，但 Table 3 中 HumanEval、Concurrency=1 时 DFlare 为 554.5 tokens/s，略低于 DFlash 的 561.1 tokens/s，因此该概括并不严格成立。",
          "sourceType": "observed-data"
        }
      ],
      "relations": {
        "extends": [
          "dflash"
        ],
        "comparesAgainst": [
          "eagle-3",
          "dflash"
        ],
        "related": [
          "diffuspec",
          "specdiff-2",
          "dspark"
        ],
        "compatibleWith": [
          "ddtree"
        ]
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
      "reproducibility": {
        "codeUrl": "https://github.com/Tencent/AngelSlim",
        "modelUrl": null,
        "projectPage": null,
        "officialImplementation": true,
        "status": "not-reproduced",
        "notes": [
          "论文代码集成在腾讯 AngelSlim 仓库中。",
          "主要软件依赖包括 torch 2.9.1、transformers 4.57.1、datasets 4.8.4、sglang 0.5.6 和 numpy 2.4.3。"
        ]
      },
      "evidence": [
        {
          "claim": "DFlash 的共享 Target Context 限制不同 Drafter 层的专门化，并导致深度扩展收益饱和。",
          "location": "Section 1, Pages 1–2; Section 3.1, Page 3",
          "type": "method"
        },
        {
          "claim": "DFlare 为每个 Drafter 层学习独立的 Target Layer 融合权重，并分离 Target 与 Draft 的 KV Projection。",
          "location": "Sections 4.1–4.2, Figure 2, Pages 5–6",
          "type": "method"
        },
        {
          "claim": "渐进位置加权损失随训练过程增大 γ，使优化重点从前部位置逐步扩展到后部位置。",
          "location": "Section 4.3, Page 6",
          "type": "training"
        },
        {
          "claim": "Qwen 配置使用 7 个 Drafter 层、Block Size 16，并从 9 个 Target 层提取 Hidden Features。",
          "location": "Section 5.1, Page 6",
          "type": "configuration"
        },
        {
          "claim": "训练数据规模约为 240 万条，Response 由对应 Target 在 Temperature=0.6 下重新生成。",
          "location": "Section 5.1, Page 6; Appendix A.1, Page 11",
          "type": "training"
        },
        {
          "claim": "DFlare 在 Qwen3-4B、Qwen3-8B 和 GPT-OSS-20B 上分别达到 5.52×、5.46× 和 3.91× 的贪心解码平均速度。",
          "location": "Table 1, Page 7",
          "type": "result"
        },
        {
          "claim": "完整 2.4M 数据训练使用 32 张 GPU，Qwen3-8B Drafter 约需 160 小时墙钟时间。",
          "location": "Appendix A.3, Page 11",
          "type": "training"
        },
        {
          "claim": "Appendix A.4 声称 DFlare 在全部并发设置下吞吐最高，但 Table 3 显示 HumanEval、Concurrency=1 时 DFlare 的 554.5 tokens/s 略低于 DFlash 的 561.1 tokens/s。",
          "location": "Appendix A.4 and Table 3, Pages 11–12",
          "type": "system"
        },
        {
          "claim": "结构消融中，移除 Softmax、异构 KV Projection 或渐进位置损失都会降低平均速度和接受长度；额外增加 FC 层没有改善平均接受长度。",
          "location": "Section 6.3, Table 2, Page 8",
          "type": "ablation"
        }
      ],
      "notes": [],
      "qaNotes": [],
      "provenance": {
        "legacyWorkbookRow": 11,
        "workbookInstitutions": "北京大学、腾讯"
      },
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
      "venue": "arXiv",
      "date": "2026-05",
      "url": "https://arxiv.org/abs/2605.29707",
      "localPdf": "../Reference/Domino.pdf",
      "explanationPage": null,
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
      "methodOverview": "并行 Backbone 先给出整个 Block 的边缘分布，随后一个廉价的因果 Head 根据已经选中的 Prefix 逐步修正后续 Logit，相当于用一次并行预测打底，再用很小的串行模块恢复 Token 间依赖。",
      "problemStatement": {
        "background": "投机解码的端到端收益取决于 Draft 质量与 Draft 成本的平衡：自回归 Drafter 能显式利用块内 Prefix 依赖，但生成 γ 个候选需要逐 Token 执行 Drafter；并行 Drafter 可一次前向生成整个候选块，却缺少对已经实际选中 Token 的条件化。",
        "priorLimitation": "自回归 Drafter 需要重复执行 Transformer Rollout 和全词表 LM Head，串行开销随候选长度增长；DFlash 等块并行 Drafter 虽显著降低 Draft 延迟，但各位置主要基于共享上下文独立预测，容易发生多模态混合与 Suffix Decay，后部候选接受率下降。",
        "goal": "把昂贵的表示建模保留在一次并行 Backbone 前向中，只用轻量串行模块恢复块内因果依赖，在接近并行 Drafter 延迟的同时获得更高接受长度和端到端速度。"
      },
      "methodComponents": [
        {
          "name": "Parallel Draft Backbone",
          "stage": "Parallel Draft",
          "purpose": "一次性完成候选块的大部分表示计算，并为后续轻量因果修正提供 Base Hidden State 与 Base Logits。",
          "mechanism": "采用 5 层 DFlash 式并行 Backbone，以 Target 上一轮产生的 Anchor Token 和 Mask Block 为输入，一次非自回归前向生成整个 16-Token Block 的 Hidden State；冻结的 Target LM Head 对所有位置并行计算 Base Logits。",
          "differenceFromPrior": "区别于 EAGLE-3 等自回归 Drafter，不为每个候选 Token 重复执行 Draft Transformer；相较原始 DFlash，Backbone 输出不再直接作为最终候选分布，而是交给 Domino Head 做 Prefix 条件修正。"
        },
        {
          "name": "GRU Causal Encoder",
          "stage": "Sequential Causal Correction",
          "purpose": "以很低的串行成本汇总当前候选块内已经采样的 Prefix Token。",
          "mechanism": "对第 i 个候选位置，1024 维 GRU 顺序读取此前 Draft Token 的 Embedding，形成 Prefix 相关状态 S_{i−1}；该状态把已选语义路径传给后续位置，但不重新执行完整 Transformer。",
          "differenceFromPrior": "并行 Drafter 的后部位置通常只看到共享块上下文，无法依据已经实际采样出的前部 Token 改写预测；标准自回归 Drafter 虽能条件化 Prefix，却需要高成本的逐步模型前向。"
        },
        {
          "name": "Low-Rank Logit Correction Head",
          "stage": "Sequential Causal Correction",
          "purpose": "把 Prefix 状态转化为对并行 Base Logits 的廉价残差修正。",
          "mechanism": "将位置 Hidden State H_i 与 Causal State S_{i−1} 拼接，经 256 维低秩瓶颈计算 ΔL_i=W₂·SiLU(W₁[H_i;S_{i−1}])，最终以 L_i=L_i^base+ΔL_i 采样候选 Token。",
          "differenceFromPrior": "修正在 Logit Space 完成，避免每次因果更新后重新运行完整 LM Head；若在 Hidden Space 修正，则会把昂贵的全词表输出投影重新引入串行路径。"
        },
        {
          "name": "Teacher-Forced Causal Encoding",
          "stage": "Training",
          "purpose": "让因果分支专门学习投机验证真正会使用的已接受 Prefix 区间。",
          "mechanism": "训练时向 GRU 输入 Ground-Truth Prefix Token Embedding，而不是早期训练阶段噪声较大的自生成 Prefix。因为第 i 个候选只有在此前 Token 均被 Target 接受时才会影响接受长度，这一监督与 Accepted-Prefix Regime 对齐。",
          "differenceFromPrior": "EAGLE-3 式 Training-Time Test 会把自生成结果回灌到后续步骤；Domino 认为错误 Prefix 到正确下一 Token 的映射不属于真实数据分布，且在首个拒绝后不会被实际使用。"
        },
        {
          "name": "Base-Anchored Curriculum",
          "stage": "Training",
          "purpose": "防止拿到干净 Prefix 的修正分支走捷径，导致并行 Backbone 的 Base Distribution 退化。",
          "mechanism": "联合优化 Base Logits 与最终修正 Logits，采用 L=(1−λ_t)L_final+λ_tL_base，并将 λ_t 在训练期间从 1 线性退火到 0；两个交叉熵损失均使用 w_k=exp(−k/γ) 的位置权重。",
          "differenceFromPrior": "若从训练开始只优化最终 Logits，因果 Head 可能承担过多预测任务并使 Backbone Loss 崩塌；课程策略先稳固并行底座，再逐步把优化重心移向残差修正。"
        },
        {
          "name": "Fused Domino Runtime",
          "stage": "Runtime Optimization",
          "purpose": "压低轻量串行 Head 的 Kernel Launch 与 Python 调度开销。",
          "mechanism": "使用融合 Triton Kernel 实现 Domino Head 的修正循环，并通过 CUDA Graphs 固化执行路径；论文设置下 Head 延迟由 2.64 ms 降至 1.20 ms。",
          "differenceFromPrior": "仅有轻量网络并不自动等于低实际延迟；未经融合的细粒度串行算子会被启动开销吞掉，因此需要专门的 Kernel 与执行图优化。"
        }
      ],
      "characteristics": {
        "requiresTraining": true,
        "drafterType": "semi-autoregressive",
        "draftGeneration": "semi-autoregressive",
        "candidateStructure": "chain",
        "verificationStrategy": "fixed-prefix",
        "usesTargetFeatures": true,
        "dynamicDraftLength": false,
        "dynamicVerifyLength": false,
        "lossless": true
      },
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
      "training": {
        "summary": "因果 Encoder 使用 Ground-Truth Prefix 的 Teacher Forcing，针对只有此前 Token 已被接受时才有意义的修正区间；同时令 L=(1−λₜ)L_final+λₜL_base 并将 λₜ 从 1 线性退火到 0，先稳固并行 Base Distribution、再学习最终残差，防止修正头走捷径导致 Backbone 崩塌。",
        "data": "使用 mlabonne/open-perfectblend 的 142 万条 Instruction Prompt，覆盖 Chat、Math、Code 和通用指令跟随；不直接使用原始 Response，而由对应冻结 Target 模型重新生成。输入最大长度 3072，Draft Block Size 为 16。",
        "objective": "联合优化位置加权的最终分布交叉熵 L_final 与并行 Base Distribution 交叉熵 L_base：L=(1−λ_t)L_final+λ_tL_base，λ_t 在训练期间由 1 线性退火至 0；两项损失均使用 w_k=exp(−k/γ) 强调会门控整段接受 Prefix 的前部位置。Target 全程冻结；Draft 模块训练 3 个 Epoch，采用 AdamW、6×10⁻⁴ 学习率、零 Weight Decay、1.0 Gradient Clip、Cosine Schedule、0.04 Warmup Ratio、BF16 与 FSDP。"
      },
      "evaluation": {
        "targetModels": [
          "Qwen3-4B",
          "Qwen3-8B"
        ],
        "benchmarks": [
          "GSM8K",
          "MATH-500",
          "AIME25",
          "HumanEval",
          "MBPP",
          "LiveCodeBench",
          "MT-Bench",
          "Alpaca"
        ],
        "baselines": [
          "Autoregressive Decoding",
          "EAGLE-3",
          "DFlash",
          "DART",
          "FR-Spec"
        ],
        "metrics": [
          "Average Acceptance Length",
          "End-to-end Decoding Speedup",
          "Serving Throughput",
          "Per-step Latency"
        ],
        "hardware": [
          "NVIDIA A100-SXM4-80GB"
        ],
        "frameworks": [
          "Transformers",
          "SGLang",
          "Triton",
          "CUDA Graphs"
        ]
      },
      "mainResults": [
        {
          "condition": "Qwen3-4B，Temperature=0，八个基准宏平均，16-Token Draft Block",
          "metric": "End-to-end Decoding Speedup",
          "result": "5.47×",
          "comparison": "DFlash 为 4.70×，Domino 相对提升约 16.4%。",
          "source": "Table 1"
        },
        {
          "condition": "Qwen3-4B，Temperature=0，八个基准宏平均，16-Token Draft Block",
          "metric": "Average Acceptance Length",
          "result": "7.08",
          "comparison": "DFlash 为 6.11，Domino 相对提升约 15.9%。",
          "source": "Table 1"
        },
        {
          "condition": "Qwen3-8B，Temperature=0，八个基准宏平均，16-Token Draft Block",
          "metric": "End-to-end Decoding Speedup",
          "result": "5.49×",
          "comparison": "DFlash 为 4.66×，Domino 相对提升约 17.8%。",
          "source": "Table 1"
        },
        {
          "condition": "Qwen3-8B，Temperature=0，八个基准宏平均，16-Token Draft Block",
          "metric": "Average Acceptance Length",
          "result": "7.17",
          "comparison": "DFlash 为 6.06，Domino 相对提升约 18.3%。",
          "source": "Table 1"
        },
        {
          "condition": "Qwen3-4B，Temperature=1，八个基准宏平均",
          "metric": "End-to-end Decoding Speedup",
          "result": "4.61×",
          "comparison": "DFlash 为 4.03×；对应 Average Acceptance Length 从 5.33 提升至 6.00。",
          "source": "Table 1"
        },
        {
          "condition": "Qwen3-8B，Temperature=1，八个基准宏平均",
          "metric": "End-to-end Decoding Speedup",
          "result": "4.46×",
          "comparison": "DFlash 为 3.96×；对应 Average Acceptance Length 从 5.18 提升至 5.91。",
          "source": "Table 1"
        },
        {
          "condition": "Qwen3-8B，GSM8K，SGLang，Concurrency=2",
          "metric": "Serving Throughput",
          "result": "942 tokens/s",
          "comparison": "DFlash 为 672 tokens/s，Autoregressive Baseline 为 184 tokens/s；Domino 达到 5.1× Baseline Throughput。",
          "source": "Table 2"
        },
        {
          "condition": "Qwen3-8B，ShareGPT 同数据训练，Temperature=0，固定 16-Token Draft Budget",
          "metric": "Domino Head Ablation",
          "result": "Average Acceptance Length 由 3.49 提升至 4.19，Average Speedup 由 2.84× 提升至 3.31×。",
          "comparison": "关闭或开启同一模型的 Causal Correction Branch，隔离了 Domino Head 本身的收益。",
          "source": "Table 4; Table 6"
        },
        {
          "condition": "Qwen3-8B，ShareGPT 同数据训练，Training Strategy Ablation",
          "metric": "Average Acceptance Length",
          "result": "TTT 为 3.80，Teacher Forcing 为 3.96，Teacher Forcing + Base-Anchored Curriculum 为 4.19。",
          "comparison": "Teacher Forcing 提供更有效的因果监督，Curriculum 进一步避免并行 Backbone 崩塌。",
          "source": "Figure 4"
        },
        {
          "condition": "A100、Context Length=1024、16-Token Draft Budget 的 Figure 1 延迟设置",
          "metric": "Domino Head Latency",
          "result": "2.64 ms 降至 1.20 ms",
          "comparison": "融合 Triton Kernel 与 CUDA Graphs 后，减少 Kernel Launch 和 Python-Level Overhead。",
          "source": "Section 4.3; Figure 1"
        }
      ],
      "limitations": [
        {
          "type": "training-cost",
          "description": "论文目标是推理加速，不是降低 Drafter Training 或 Fine-tuning 成本；Domino 仍需针对相应 Target 训练附加 Draft 模块。",
          "sourceType": "paper"
        },
        {
          "type": "deployment",
          "description": "当前实现主要适配 SGLang，与其他 Serving Framework 的兼容性尚未系统评估。",
          "sourceType": "paper"
        },
        {
          "type": "generalization",
          "description": "实际速度会随内存带宽、计算能力和 Kernel 效率而变化，部署到不同硬件平台时可能需要额外的针对性优化。",
          "sourceType": "paper"
        },
        {
          "type": "algorithmic",
          "description": "Domino 仍使用固定长度的单条候选链和固定 Prefix Verify，没有利用候选树，也不根据请求难度、候选置信度或 Serving 负载动态调整 Draft/Verify 长度。",
          "sourceType": "analysis"
        }
      ],
      "relations": {
        "extends": [
          "dflash"
        ],
        "comparesAgainst": [
          "eagle-3",
          "dflash",
          "dart"
        ],
        "related": [
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
        "compatibleWith": []
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
      "reproducibility": {
        "codeUrl": "https://github.com/jianuo-huang/Domino",
        "modelUrl": "https://huggingface.co/collections/Huang2020/domino",
        "projectPage": null,
        "officialImplementation": true,
        "status": "not-reproduced",
        "notes": [
          "论文首页提供官方 GitHub 代码仓库和 Hugging Face 模型集合。",
          "Appendix A.1 给出训练 Epoch、GPU、Batch Size、Optimizer、Learning Rate、Warmup、精度和 FSDP 配置。",
          "主实验直接使用公开的 EAGLE-3、DART 与 DFlash Checkpoint；论文另以 ShareGPT 同数据训练进行结构受控对比。"
        ]
      },
      "evidence": [
        {
          "claim": "自回归 Drafter 的 Prefix 条件建模质量较强，但串行 Draft 执行昂贵；并行 Drafter 延迟低，却削弱块内因果依赖。",
          "location": "Abstract; Section 1, Pages 1–2",
          "type": "method"
        },
        {
          "claim": "Domino 以并行 Backbone 一次生成整块 Hidden State 和 Base Logits，再用 GRU 与低秩 Logit Residual 顺序修正。",
          "location": "Section 4.1 and Figure 3, Pages 4–5",
          "type": "method"
        },
        {
          "claim": "默认配置使用 5 层并行 Backbone、16-Token Block、1024 维 GRU 和 256 维低秩修正空间。",
          "location": "Section 5.1, Page 6",
          "type": "configuration"
        },
        {
          "claim": "Teacher Forcing 对 Ground-Truth Prefix 编码，Base-Anchored Curriculum 将 λ_t 从 1 线性退火到 0。",
          "location": "Section 4.2, Pages 5–6",
          "type": "training"
        },
        {
          "claim": "融合 Triton Kernel 与 CUDA Graphs 将 Domino Head 延迟从 2.64 ms 降至 1.20 ms。",
          "location": "Section 4.3, Page 6",
          "type": "system"
        },
        {
          "claim": "训练使用 142 万条 Open-PerfectBlend Prompt，由对应 Target 重生成 Response；完整配置为 3 Epoch、8 张 A100-SXM4-80GB、Global Batch Size 16。",
          "location": "Section 5.1, Page 6; Appendix A.1, Pages 10–11",
          "type": "training"
        },
        {
          "claim": "Temperature=0 时，Domino 在 Qwen3-4B 和 Qwen3-8B 上的八基准平均速度分别为 5.47× 和 5.49×。",
          "location": "Table 1, Page 7",
          "type": "result"
        },
        {
          "claim": "在 SGLang 高并发实验中，Domino 在 Qwen3-4B 与 Qwen3-8B 的 GSM8K、MBPP 上整体高于 EAGLE-3 和 DFlash。",
          "location": "Table 2, Page 7",
          "type": "system"
        },
        {
          "claim": "Teacher Forcing 与 Base-Anchored Curriculum 将平均接受长度从 TTT 的 3.80 依次提高到 3.96 和 4.19。",
          "location": "Figure 4, Page 8",
          "type": "ablation"
        },
        {
          "claim": "论文明确列出 Training Cost、其他 Serving Framework 兼容性和跨硬件速度差异三类限制。",
          "location": "Section 7, Page 9",
          "type": "limitation"
        }
      ],
      "notes": [
        "标题中的“Decoupling”不是把 Draft 完全变成无串行过程：候选 Token 仍左到右采样，但串行路径只保留 GRU 与低秩 Logit Correction，不再逐 Token 重跑 Transformer 和完整 LM Head。",
        "Domino 选择在 Logit Space 做残差修正是关键工程取舍；Hidden-Space Correction 会要求每一步重新执行完整 Target LM Head，直接破坏低开销目标。",
        "Figure 1 的统一 16-Token Budget 对比中，Domino 相比 DFlash 仅增加 56M 参数（+5.3%）和约 2.8% 的整轮 Draft-Verify 延迟，却将接受长度提高 16.6%、端到端速度提高 12.3%。",
        "Table 1 的主结果使用公开 Baseline Checkpoint，可能混入 Training Data 差异；Table 3 的 ShareGPT 同数据实验才是更干净的架构对照。",
        "Domino 主要解决 Draft 质量与串行成本的矛盾，不处理候选树选择、动态 Verify Budget 或 Batch-Aware Scheduling。"
      ],
      "qaNotes": [],
      "provenance": {
        "legacyWorkbookRow": 12,
        "workbookInstitutions": "未知（arXiv作者团队）"
      },
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
      "venue": "arXiv",
      "date": "2026-07",
      "url": "https://arxiv.org/abs/2607.05147",
      "localPdf": "../Reference/DSpark.pdf",
      "explanationPage": null,
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
      "methodOverview": "并行 Backbone 负责整体候选，廉价 Markov/RNN 串行模块补回 Prefix 依赖；额外的置信度 Head 估计 Prefix 能存活到多远，调度器再按实时负载和 SPS 为每个请求分配 Verify 长度。",
      "problemStatement": {
        "background": "投机解码通过廉价 Drafter 一次提出多个候选 Token，再由 Target 模型在一次前向中并行验证连续 Prefix，以减少生成每个 Token 所需的 Target 前向次数。并行 Drafter 可在一次前向中生成长候选块，使 Draft 延迟近似不随块长线性增加；但最终加速还同时取决于候选接受长度和 Target Verify 对 Serving Batch 容量的占用。",
        "priorLimitation": "纯并行 Drafter 的各位置无法根据块内已经实际采样的前部 Token 进行条件化，容易把多条合理语义路径混合成不连贯序列，造成后部条件接受率快速下降，即 Multi-modal Collision 与 Suffix Decay。另一方面，固定验证整个长候选块会把 Target Batch 容量浪费在高拒绝风险的尾部 Token 上；静态置信度阈值又无法反映低负载时额外 Verify 几乎免费、高负载时额外 Verify 会挤占其他请求容量的差异。",
        "goal": "在保留并行 Backbone 高吞吐和深层建模容量的同时，以极低成本恢复块内 Prefix 依赖，并根据候选存活概率、实时 Batch 负载和硬件 SPS 曲线动态分配每个请求的 Verify 长度，从而同时提高接受长度、减少无效验证，并在保持 Target 输出分布不变的前提下最大化系统级 Token Throughput。"
      },
      "methodComponents": [
        {
          "name": "DFlash-based Parallel Backbone",
          "stage": "Draft generation",
          "purpose": "承担候选生成中的主要计算，在一次前向中提供整块 Hidden States 与 Base Logits，使昂贵 Draft 计算近似不随候选块长度线性增长。",
          "mechanism": "以 DFlash 的 Block-Diffusion Drafter 为基础，对 Anchor Token 与 γ−1 个 Mask Token 执行一次双向块注意力前向，得到 γ 个位置的 Hidden State h₁…hγ 和 Base Logits U₁…Uγ。离线实验使用 5 层 Backbone；生产版 DeepSeek-V4 Drafter 则使用 3 个带 mHC 的 MoE 层和长度 128 的 Sliding-Window Attention。",
          "differenceFromPrior": "原始 DFlash 输入一个 Anchor 加 γ 个 Mask，只预测 Mask 位置；DSpark 将 Anchor 本身也视为第一个预测位置，使 γ 个输入位置直接产生 γ 组 Draft Logits，在基本保持质量的同时减少一次块位置计算。"
        },
        {
          "name": "Lightweight Sequential Block",
          "stage": "Draft generation",
          "purpose": "在不重复执行 Transformer Rollout 的情况下，为后部候选显式补回对已采样 Prefix 的依赖，缓解并行生成的多模态碰撞和 Suffix Decay。",
          "mechanism": "逐位置将 Prefix-dependent Transition Bias Bₖ 加到并行 Backbone 的 Base Logits Uₖ 上，再从 Softmax(Uₖ+Bₖ) 左到右采样。默认 Markov Head 仅依赖上一枚 Token，以 rank-256 的 W₁W₂ 低秩分解近似词表转移矩阵；可选 RNN Head 还将历史状态、上一 Token Embedding 和当前位置 Backbone Hidden State输入单门控循环更新，从而累积完整块内 Prefix。",
          "differenceFromPrior": "纯 DFlash 的每个位置只输出独立边缘分布；传统自回归 Drafter 则需要为每个候选重复执行较重的 Transformer 前向。DSpark 只串行执行廉价词表投影或单门控状态更新，将主要计算继续留在并行 Backbone 中。"
        },
        {
          "name": "Conditional Acceptance Confidence Head",
          "stage": "Verification estimation",
          "purpose": "估计候选 Token 在此前 Prefix 已全部接受的条件下继续通过 Target Verify 的概率，为按请求裁剪候选尾部提供可学习信号。",
          "mechanism": "对每个位置输出 cₖ=σ(wᵀ[hₖ;W₁[xₖ₋₁]])，输入由 Backbone Hidden State 和前一 Draft Token 的 Markov Embedding 拼接而成。监督软标签为 cₖ*=1−½‖pₖᵈ−pₖᵗ‖₁，即 Draft 与 Target 分布总变差所对应的理论逐步接受率。",
          "differenceFromPrior": "常见置信度启发式通常只要求分数能排序候选质量；DSpark 需要概率的绝对数值来计算 Prefix 累计存活率和期望接受长度，因此直接学习与理论接受概率对应的软标签。"
        },
        {
          "name": "Sequential Temperature Scaling",
          "stage": "Confidence calibration",
          "purpose": "修正 Confidence Head 的系统性过度自信，使累计 Prefix 存活概率能够可靠参与硬件吞吐量计算。",
          "mechanism": "将位置 j 的 Prefix 存活率写为 aⱼ=∏ᵢ≤ⱼcᵢ，并在独立验证集上从左到右逐位置搜索温度系数；每次固定已校准的前部位置，选择使当前累计概率 Expected Calibration Error 最小的温度。温度缩放保持原有排序，但校准概率绝对值。",
          "differenceFromPrior": "单个静态温度或未校准置信度无法保证多个条件概率连乘后的 Prefix 概率仍准确；STS 直接针对每个 Prefix 深度的累计存活概率顺序校准。"
        },
        {
          "name": "Hardware-Aware Prefix Scheduler",
          "stage": "Target verification scheduling",
          "purpose": "在一个 Serving Batch 内联合决定各请求的 Verify Prefix 长度，把有限 Target Batch 容量分配给预期收益最高的候选 Token。",
          "mechanism": "初始化时 Profiling 引擎在不同 Verify Token Batch Size B 下的 SPS(B) 曲线。运行时计算每个请求各 Prefix 位置的累计存活率 aᵣ,ⱼ，按 aᵣ,ⱼ 全局降序逐个加入候选；每加入一个 Token，更新总 Verify Batch B、期望接受数 τ 和预计吞吐 Θ=τ·SPS(B)，选择吞吐最高时对应的每请求 Prefix 长度。理论算法在 Θ 首次下降时立即停止，以避免未来 Token 影响此前 Token 的准入决策。",
          "differenceFromPrior": "固定 Verify 长度忽略请求难度，静态置信度阈值又忽略系统负载；DSpark 同时考虑数据侧 Prefix 存活率和系统侧 SPS 容量曲线，并在整个 Batch 中联合分配而不是逐请求独立决策。"
        },
        {
          "name": "Asynchronous Production Scheduler",
          "stage": "Production serving scheduling",
          "purpose": "在不阻塞 GPU Pipeline 的前提下兼容 Zero-Overhead Scheduling、持续 CUDA Graph Replay 和离散非平滑的真实 SPS 曲线。",
          "mechanism": "使用两轮前的置信度结果预估下一轮可容纳的总候选数 K，但当前轮具体选择哪些候选仍依据最新累计置信度执行 Top-K。由于 K 只依赖历史信息，生产实现可移除理论算法面对非平滑 SPS 曲线时容易陷入局部最优的 Early Stop，并进行完整吞吐搜索，而不会让当前 Token 的取值反向影响自身准入。",
          "differenceFromPrior": "同步执行理论调度会等待当前轮结束并打断 GPU 流水线；直接对当前 Token 事后全局搜索又会产生 Selection Bias。两轮延迟的容量预测形成因果屏障，在兼容生产调度基础设施的同时维持 Lossless。"
        },
        {
          "name": "Flattened Variable-Length Verification",
          "stage": "Production target execution",
          "purpose": "避免不同请求 Verify 长度不一致所导致的 Padding、负载不均和 GPU 利用率下降。",
          "mechanism": "将 Batch 内各请求的所有 Verify Token 摊平为统一物理 Token 流，Kernel 对其等价处理；逻辑上的序列边界和块内因果关系通过 Sparse Attention Marker Tensor 传递。DeepSeek-V4 中仅需修改 Index-Attention 与 Compress Kernel，即可支持动态变长 Prefix。",
          "differenceFromPrior": "传统 Decode Kernel 假设每个请求 Query Length 固定，直接处理 Ragged Prefix 会产生大量 Padding 或复杂重排；DSpark 将物理执行与逻辑序列跟踪解耦。"
        },
        {
          "name": "Scalable Draft Training Pipeline",
          "stage": "Production training",
          "purpose": "降低大规模 Target–Draft 联合监督中的全词表通信、长上下文显存占用和 Padding 开销。",
          "mechanism": "不在并行 Worker 间传输 V≈10⁵ 的 Target Logits，而只传输 LM Head 前的 Hidden States，并在 Drafter Worker 上仅对采样 Anchor 位置执行 LM Head Projection，使单 Token 通信复杂度降为 O(d)。同时从长序列固定采样若干 Anchor，将独立预测块密集打包，并以 Token-level Attention Indices 表达跨序列和跨 Anchor 的因果隔离。",
          "differenceFromPrior": "直接传输完整 Target Logits 带来显著带宽压力；按原始文档长度训练又会让 Drafter 成本和 Padding 随上下文增长。Anchor-bounded Packing 将 Drafter 训练成本与完整 Target Context 长度解耦。"
        }
      ],
      "characteristics": {
        "requiresTraining": true,
        "drafterType": "semi-autoregressive block-diffusion",
        "draftGeneration": "parallel backbone with lightweight sequential correction",
        "candidateStructure": "chain",
        "verificationStrategy": "confidence-scheduled dynamic prefix",
        "usesTargetFeatures": true,
        "dynamicDraftLength": false,
        "dynamicVerifyLength": true,
        "lossless": true
      },
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
      "training": {
        "summary": "Target、共享 Embedding 与 LM Head 全程冻结；从每条 Target 序列随机抽取多个 Anchor 组成 γ-Token Block，只更新并行 Backbone、顺序模块和 Confidence Head。",
        "data": "离线实验使用 Open-PerfectBlend 的 130 万条 Prompt，其中 Chat、Math、Code 和 Instruction Following 分别约占 17.6%、39.4%、38.9% 和 4.1%。仅保留原始 Prompt，并由每个对应 Target 模型使用推荐采样参数重新生成 Response；数据生成和评测均采用 Non-thinking Mode。每个 Drafter 训练 10 个 Epoch，并从每条 Target 序列随机采样多个 Anchor，构造 γ-Token 训练块。DeepSeek-V4 生产版所用训练语料及规模未披露。",
        "objective": "三个目标均使用位置权重 wₖ=exp(−(k−1)/γ)：交叉熵 Lce 监督正确 Token；总变差匹配损失 Ltv=Σwₖ‖pₖᵈ−pₖᵗ‖₁ 直接提高理论接受率；置信度 BCE Lconf 使用 cₖ*=1−½‖pₖᵈ−pₖᵗ‖₁ 作为软标签。总损失为 L=0.1Lce+0.9Ltv+1.0Lconf。Target、共享 Token Embedding 和 LM Head 保持冻结，仅训练并行 Backbone、Sequential Block 与 Confidence Head；训练完成后再在 Held-out Validation Set 上执行 STS 校准。"
      },
      "evaluation": {
        "targetModels": [
          "Qwen3-4B",
          "Qwen3-8B",
          "Qwen3-14B",
          "Gemma4-12B",
          "DeepSeek-V4-Flash (preview)",
          "DeepSeek-V4-Pro (preview)"
        ],
        "benchmarks": [
          "GSM8K",
          "MATH500",
          "AIME25",
          "MBPP",
          "HumanEval",
          "Live-CodeBench",
          "MT-Bench",
          "Alpaca",
          "Arena-Hard",
          "DeepSeek-V4 Live User Traffic"
        ],
        "baselines": [
          "Eagle3",
          "DFlash",
          "MTP-1"
        ],
        "metrics": [
          "Average Accepted Length",
          "Position-wise Conditional Acceptance",
          "Acceptance Rate",
          "Per-round Engine Latency",
          "ROC-AUC",
          "Expected Calibration Error",
          "Aggregate Output Throughput",
          "Per-user Generation Speed",
          "Average Verification Budget"
        ],
        "hardware": [
          "离线 Qwen3/Gemma4 实验：论文未披露具体 GPU 型号",
          "DeepSeek-V4 线上生产 GPU 集群：论文未披露具体 GPU 型号"
        ],
        "frameworks": [
          "DeepSpec",
          "HAI-LLM",
          "DeepSeek-V4 Production Serving Engine",
          "Zero-Overhead Scheduling",
          "CUDA Graph",
          "Sparse Attention"
        ]
      },
      "mainResults": [
        {
          "condition": "Qwen3-4B，Temperature=1.0，固定 Draft Block Size 7，九个离线基准宏平均",
          "metric": "Average Accepted Length",
          "result": "4.73",
          "comparison": "Eagle3 为 3.61，DFlash 为 4.06；DSpark 分别相对提升 30.9% 和 16.3%。",
          "source": "Table 1"
        },
        {
          "condition": "Qwen3-8B，Temperature=1.0，固定 Draft Block Size 7，九个离线基准宏平均",
          "metric": "Average Accepted Length",
          "result": "4.81",
          "comparison": "Eagle3 为 3.80，DFlash 为 4.07；DSpark 分别相对提升 26.7% 和 18.4%。",
          "source": "Table 1"
        },
        {
          "condition": "Qwen3-14B，Temperature=1.0，固定 Draft Block Size 7，九个离线基准宏平均",
          "metric": "Average Accepted Length",
          "result": "4.78",
          "comparison": "Eagle3 为 3.68，DFlash 为 4.04；DSpark 分别相对提升 30.0% 和 18.3%。",
          "source": "Table 1"
        },
        {
          "condition": "Gemma4-12B，Temperature=1.0，固定 Draft Block Size 7，九个离线基准宏平均",
          "metric": "Average Accepted Length",
          "result": "4.66",
          "comparison": "Eagle3 为 4.38，DFlash 为 4.02；按 Table 1 数值计算，DSpark 分别相对提升约 6.6% 和 16.1%，说明效果可跨模型家族迁移。",
          "source": "Table 1"
        },
        {
          "condition": "四个 Target、九个离线基准，共 36 个 Target–Benchmark 组合",
          "metric": "Accepted Length Ranking",
          "result": "36/36 项均为最高",
          "comparison": "DSpark 在表中每个模型和任务上都同时超过 Eagle3 与 DFlash。",
          "source": "Table 1"
        },
        {
          "condition": "Qwen3-4B，Draft Block Size 7，Drafter 深度消融",
          "metric": "Parameter Efficiency",
          "result": "2-layer DSpark 已在全部九个基准上超过 5-layer DFlash",
          "comparison": "说明局部顺序建模带来的序列一致性收益，高于单纯继续堆叠纯并行 Drafter 层。",
          "source": "Figure 3"
        },
        {
          "condition": "Qwen3-4B，5-layer Drafter，将输入块长扩展至 16，即 γ=15 个预测位置",
          "metric": "Long-block Accepted Length Gain and Latency",
          "result": "相对 DFlash 在 Math、Code、Chat 上分别提升约 30%、26% 和 22%；完整轮次延迟仅增加 0.2%–1.3%",
          "comparison": "随着候选块加长，DFlash 的 Suffix Decay 使边际收益快速下降，而 DSpark 的优势继续扩大。延迟在 Batch Size 128、Context Length 512–4096 的均值上测量。",
          "source": "Figure 4"
        },
        {
          "condition": "Qwen3-4B，离线 Confidence Threshold Sweep",
          "metric": "Acceptance Rate",
          "result": "Math 由 76.9% 升至 92.5%，Code 由 67.6% 升至 92.0%，Chat 由 45.7% 升至 95.7%",
          "comparison": "置信度越高，Confidence Head 越能裁掉最终会被拒绝的尾部 Token；高熵 Chat 的裁剪最明显。",
          "source": "Figure 5"
        },
        {
          "condition": "Qwen3-4B，Alpaca，Prefix 位置 1、3、5、7",
          "metric": "Confidence Discrimination and Calibration",
          "result": "ROC-AUC 约为 0.81–0.90；STS 将原始 3%–8% 的 ECE 降至平均约 1%",
          "comparison": "原始 Confidence Head 排序能力较强但明显过度自信，STS 使累计存活率可用于吞吐量估计。",
          "source": "Figure 6"
        },
        {
          "condition": "DeepSeek-V4-Flash (preview)，Live User Traffic",
          "metric": "Throughput–Interactivity Pareto Frontier",
          "result": "80 tok/s/user SLA 下 Aggregate Throughput 提升 51%；匹配实用吞吐水平时 Per-user Generation Speed 提升 60%–85%",
          "comparison": "在严格的 120 tok/s/user SLA 下，MTP-1 已接近容量崩溃，DSpark 的名义吞吐提升为 661%；论文明确将该数值解释为可行 Interactivity Frontier 的扩展，而非一般性的稳定倍数提升。",
          "source": "Figure 7"
        },
        {
          "condition": "DeepSeek-V4-Pro (preview)，Live User Traffic",
          "metric": "Throughput–Interactivity Pareto Frontier",
          "result": "35 tok/s/user SLA 下 Aggregate Throughput 提升 52%；匹配系统容量时 Per-user Generation Speed 提升 57%–78%",
          "comparison": "在严格的 50 tok/s/user SLA 下名义吞吐提升为 406%，同样主要反映 MTP-1 在该约束下进入低并发退化区间。",
          "source": "Figure 7"
        },
        {
          "condition": "DeepSeek-V4-Flash 少于约 200 个并发请求、V4-Pro 少于约 150 个并发请求的常见生产负载",
          "metric": "Dynamic Verification Budget",
          "result": "平均每请求 Verify Budget 由 MTP-1 的固定 2 个 Token 扩展到约 4–6 个 Token，并在并发继续升高时自动收缩",
          "comparison": "低负载时利用空闲 Target Compute 换取更长接受 Prefix；高负载时裁掉低置信度候选，避免吞吐量因 Verify Batch 膨胀而塌陷。",
          "source": "Figure 8"
        }
      ],
      "limitations": [
        {
          "type": "fixed-draft-cost",
          "description": "Prefix Scheduler 只能减少 Target 侧无效 Verify，无法回收并行 Backbone 生成完整 γ-Token 初始块的固定成本。对于天然接受率很低的复杂请求，这部分 Draft Compute 会被直接浪费；论文提出未来可加入 Difficulty-aware Draft Early Exit。",
          "sourceType": "paper"
        },
        {
          "type": "public-evaluation",
          "description": "公开 Qwen3/Gemma4 离线实验为隔离 Drafter 质量而关闭 Hardware-Aware Scheduler，只报告 Accepted Length、置信度和局部延迟分析，没有给出完整公开模型上的端到端 Speedup 或并发吞吐结果。",
          "sourceType": "analysis"
        },
        {
          "type": "hardware-disclosure",
          "description": "论文没有披露离线实验和 DeepSeek-V4 生产部署所使用的具体 GPU 型号、集群规模与底层硬件配置，因此公开结果难以直接转换为可复现的绝对时延或算力成本。",
          "sourceType": "analysis"
        },
        {
          "type": "production-reproducibility",
          "description": "最强的 Serving 结果来自未完全公开的 DeepSeek-V4 Preview、HAI-LLM、ZOS、定制 Sparse Attention Kernel 和真实用户流量。公开 DeepSpec 能复现离线 Draft 质量，但不能完整复现论文的生产 Pareto Frontier。",
          "sourceType": "analysis"
        },
        {
          "type": "scheduler-assumption",
          "description": "理论吞吐目标将引擎 SPS 主要视为总 Verify Token 数 B 的函数，弱化了各请求 Context Length 差异。论文依据 Decode 负载均衡和常见上下文长度远低于极端长度来论证该近似，但在超长上下文或负载不均场景中可能不再成立。",
          "sourceType": "paper"
        },
        {
          "type": "asynchronous-lag",
          "description": "生产调度使用两轮前的置信度预测下一轮容量 K。它消除了同步调度停顿并形成因果屏障，但当请求集合、系统负载或候选难度在短时间内突变时，容量估计可能存在两轮滞后。",
          "sourceType": "analysis"
        },
        {
          "type": "sequential-modeling-capacity",
          "description": "默认 Markov Head 只建模相邻 Token 的一阶转移，无法显式记住更长 Prefix；RNN Head 能累积完整历史，但论文观察到其额外接受收益较小、实现和部署复杂度更高，因此没有作为默认生产方案。",
          "sourceType": "analysis"
        },
        {
          "type": "candidate-structure",
          "description": "DSpark 每轮仍生成并验证一条候选链，没有利用 Candidate Tree 同时覆盖多条可能语义分支；同时它始终先生成完整最大块，只动态调整 Verify Length，而不是根据难度动态缩短 Draft Backbone 本身的计算。",
          "sourceType": "analysis"
        }
      ],
      "relations": {
        "extends": [
          "dflash"
        ],
        "comparesAgainst": [
          "eagle-3",
          "dflash",
          "mtp"
        ],
        "related": [
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
        "compatibleWith": [
          "dflare"
        ]
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
      "reproducibility": {
        "codeUrl": "https://github.com/deepseek-ai/DeepSpec",
        "modelUrl": "https://huggingface.co/collections/deepseek-ai/deepspec",
        "projectPage": "https://github.com/deepseek-ai/DeepSpec",
        "officialImplementation": true,
        "status": "not-reproduced",
        "notes": [
          "官方 DeepSpec 提供数据准备、Target Response 重生成、Target Cache 构建、Drafter 训练和离线评测脚本，并同时实现 DSpark、DFlash 与 Eagle3。",
          "官方发布了 Table 1 对应的 Qwen3-4B、Qwen3-8B、Qwen3-14B 和 Gemma4-12B 的 DSpark、DFlash 与 Eagle3 Checkpoint。",
          "DeepSpec 默认训练配置假设单节点 8 张 GPU；减少 GPU 数量时需要调整 CUDA_VISIBLE_DEVICES。",
          "仓库提示默认 Qwen3-4B 数据准备产生的 Target Cache 约为 38 TB，复现的主要门槛不只是训练显存，也包括大规模存储与 Target 数据生成成本。",
          "论文还声明发布 DeepSeek-V4-Flash 与 DeepSeek-V4-Pro Preview 的 DSpark Checkpoint，但完整 HAI-LLM 和生产 Serving Stack 未开源，因此线上调度结果不能仅依靠 DeepSpec 完整复现。"
        ]
      },
      "evidence": [
        {
          "claim": "纯并行 Drafter 缺少块内 Token 依赖，导致 Multi-modal Collision、Suffix Decay 和后部接受率下降；固定长块 Verify 在高并发下浪费 Target Batch 容量。",
          "location": "Abstract; Section 1, Pages 1–3",
          "type": "problem"
        },
        {
          "claim": "DSpark 使用 DFlash 式并行 Backbone，并将 Anchor 位置改为第一个预测位置，使 γ 个输入位置直接产生 γ 组 Draft Logits。",
          "location": "Section 3.1, Page 5",
          "type": "method"
        },
        {
          "claim": "默认 Markov Head 使用 rank-256 的低秩转移矩阵；可选 RNN Head 维护完整块内 Prefix 状态。",
          "location": "Section 3.1, Page 6",
          "type": "method"
        },
        {
          "claim": "Confidence Head 根据 Backbone Hidden State 与上一 Draft Token Embedding 预测条件接受率，软标签由 Draft–Target Total Variation Distance 得到。",
          "location": "Section 3.2.1, Page 7",
          "type": "method"
        },
        {
          "claim": "STS 从左到右逐位置校准累计 Prefix 存活概率，以满足吞吐调度对概率绝对值而非仅排序的要求。",
          "location": "Section 3.2.1, Page 7",
          "type": "method"
        },
        {
          "claim": "Hardware-Aware Prefix Scheduler 使用一次 Profiling 得到的 SPS(B) 表，并最大化期望系统吞吐 Θ=τ·SPS(B)。",
          "location": "Section 3.2.2 and Algorithm 1, Pages 8–9",
          "type": "method"
        },
        {
          "claim": "理论 Scheduler 必须满足 Non-anticipating Property；Early Stop 防止未来候选影响此前 Token 的准入并保持 Target 分布。",
          "location": "Section 3.2.2, Page 9; Appendix A, Pages 32–33",
          "type": "correctness"
        },
        {
          "claim": "训练联合使用位置加权 Cross-Entropy、Total Variation Matching 和 Confidence BCE，权重分别为 0.1、0.9 和 1.0。",
          "location": "Section 3.3, Pages 9–10",
          "type": "training"
        },
        {
          "claim": "离线训练使用 130 万条 Open-PerfectBlend Prompt，由对应 Target 重生成响应，并在 Non-thinking Mode 下训练 10 个 Epoch。",
          "location": "Section 4.1, Page 10",
          "type": "training"
        },
        {
          "claim": "DSpark 在 Qwen3-4B、8B、14B 和 Gemma4-12B 的全部九个离线基准上均取得最高 Accepted Length。",
          "location": "Table 1, Page 11",
          "type": "result"
        },
        {
          "claim": "长块实验中，DSpark 相对 DFlash 的接受长度优势随块长扩大，而完整轮次延迟只增加 0.2%–1.3%。",
          "location": "Figure 4 and Section 4.3.2, Pages 13–14",
          "type": "result"
        },
        {
          "claim": "Confidence Head 可大量裁剪最终会被拒绝的 Token；STS 将原始 3%–8% 的 ECE 降至约 1%。",
          "location": "Figures 5–6 and Section 4.3.3, Pages 14–15",
          "type": "result"
        },
        {
          "claim": "DeepSeek-V4 生产 Drafter 使用 3 个 MoE 层、mHC、128 Sliding-Window Attention、最大 γ=5 和 Markov Head。",
          "location": "Section 5.1, Page 16",
          "type": "configuration"
        },
        {
          "claim": "生产调度使用两轮前置信度预测容量 K，当前轮仍按最新累计置信度执行 Top-K，并借助历史信息形成因果屏障。",
          "location": "Section 5.2, Pages 16–17",
          "type": "system"
        },
        {
          "claim": "生产 Kernel 将不同请求的变长 Verify Token 摊平，并以 Sparse Attention Marker 表达逻辑依赖。",
          "location": "Section 5.3, Page 17",
          "type": "system"
        },
        {
          "claim": "在 DeepSeek-V4 Live Traffic 中，DSpark 将匹配吞吐水平下的单用户生成速度提高 60%–85% 和 57%–78%。",
          "location": "Figures 7–8 and Section 5.4, Pages 17–19",
          "type": "result"
        },
        {
          "claim": "论文明确指出固定的完整块 Draft 成本无法被 Prefix Scheduler 回收，低接受率请求可能浪费这部分计算。",
          "location": "Limitations, Page 19",
          "type": "limitation"
        }
      ],
      "notes": [
        "论文中的 Accepted Length 和 Acceptance Rate 默认包含 Target 在每轮额外生成的 Bonus Token，比较外部工作时需要先统一指标口径。",
        "Table 1 为刻意关闭 Confidence Scheduler 后的纯 Drafter 质量比较：Temperature=1.0、Chain-based Drafting、Block Size 7、Non-thinking Mode，不能直接视为生产调度后的端到端速度。",
        "离线默认 DSpark 为 5 层 DFlash Backbone 加 Markov Head；生产 DSpark-5 则为 3 层 MoE Backbone、γ=5。两部分使用的模型架构、块长和工作负载不同，不能把离线接受长度和线上 TPS 直接一一对应。",
        "Figure 7 中 661% 和 406% 的严格 SLA 吞吐提升看起来极大，但原因之一是 MTP-1 已进入接近失效的低并发区。论文自身也不把它们解释为常规负载下的稳定倍数加速。",
        "RNN Head 理论上能够利用完整块内 Prefix，但实验只表现出边际额外收益，主要出现在较长块；默认采用部署更简单的 Markov Head。",
        "DSpark 的关键不只是把 Draft 做得更准，而是把 Expected Accepted Tokens 与硬件 SPS 曲线相乘进行系统级决策。单独观察平均接受长度会漏掉其最核心的高并发收益。",
        "compatibleWith 中列出 DFlare 属于结构层面的正交兼容判断：DFlare 优化并行 Backbone 的 Target 条件注入，DSpark 优化其后部 Prefix 建模和 Verify 调度；论文没有直接实验验证两者组合。",
        "公开 DeepSpec 已足以检查算法、训练目标和 Table 1 Checkpoint，但生产部分仍依赖未公开模型、真实流量与定制 Kernel，复现状态因此记为 not-reproduced，而不是 fully-reproducible。"
      ],
      "qaNotes": [
        {
          "question": "Prefix Scheduler 省下的只是 Verify 开销，而没有减少 Drafter 那次前向的开销吗？",
          "answer": "是。\n\nDSpark 会先让并行 Backbone 完整生成 γ 个候选，再由 Scheduler 选择其中前 ℓ 个送给 Target Verify。\n\n因此它实现的是：\n\n完整 Draft，选择性 Verify。\n\n它减少的是 Target 需要处理的 Verify Token 数量，尤其能缓解高并发下的 Batch 容量占用；但后面未被 Verify 的 γ−ℓ 个候选，其 Draft 计算已经发生，无法回收。"
        },
        {
          "question": "为什么不能提前预测 ℓ，只生成需要的候选长度？",
          "answer": "可以做，但不能直接使用现在的 Confidence Scheduler。\n\n当前第 k 个位置的置信度依赖：\n\n* Backbone 已经算出的 Hidden State h_k；\n* 实际采样出的前一个 Draft Token x_{k−1}。\n\n也就是说，准确判断“这条具体候选 Prefix 能活多远”时，完整并行前向基本已经结束了。\n\n若把预测提前，只能根据 Context、Anchor 和历史信息估计整体难度，信息更少，容易把长度预测错。此外，动态长度还会破坏固定 Shape、CUDA Graph 和并行执行效率。\n\n核心矛盾是：\n\n越早决策，越能省 Draft 计算，但信息越少；越晚决策，判断越准，但计算已经做完。\n\n较现实的方向是先预测粗粒度长度档位，例如 γ∈{4,8,16}，而不是逐 Token 动态停止。"
        },
        {
          "question": "SPS 只建模为 Verify Batch Token 数 (B) 的函数，会不会过于粗糙？实际速度不是还受上下文长度、其他负载、显存、温度和通信等因素影响吗？",
          "answer": "理论上会受影响，但在固定生产部署中，这个近似通常合理。\n\n模型、设备、并行策略、Kernel 和资源分配在上线前基本固定，无关负载也通常被隔离；上下文长度等变量则通过 Decode Load Balance 尽量拉平。此时，调度器真正会大幅改变、且直接影响一轮 Verify 成本的主要变量，就是总 Verify Token 数：\n\nB=Σᵣ(1+ℓᵣ)\n\n因此，离线 Profiling 得到的 SPS(B) 并不是完整性能模型，而是受控环境下的主导变量代理。它不要求精确预测每次延迟，只要能正确刻画“继续增加 Verify Token 后，吞吐大致如何变化”，就足以辅助选择 Verify 长度。\n\n适用边界也很明确：若存在超长上下文严重失衡、动态模型共置、频繁降频或通信拥塞，就需要把 SPS 扩展成包含 Context Bucket 和运行时状态的多维或在线模型。"
        },
        {
          "question": "为什么生产调度要用两轮前的置信度来预测当前轮容量 (K)？当前轮或上一轮的信息不能直接用吗？",
          "answer": "根本原因是 ZOS 要提前准备下一轮，不能等置信度出来后再停下来调度。\n\n普通同步实现可以直接使用当前轮置信度：\n\n当前轮 Draft\n→ 得到当前 Confidence\n→ 计算 K\n→ 组织 Verify Batch\n→ 执行 Verify\n\n但这样 GPU 必须等待容量搜索和 Batch 重组，会产生调度气泡。\n\nZOS 希望第 t 轮结束后，第 t+1 轮立刻启动。因此在第 t 轮执行期间，Kₜ₊₁ 就必须已经确定并完成准备。可第 t 轮的置信度通常要到该轮接近结束时才完整可用，已经来不及参与准备；所以它使用更早、已经稳定可用的信息：\n\ncₜ₋₂ → Kₜ\n\n可以理解为：\n\n第 t−2 轮 Confidence 已就绪\n        ↓\n第 t−1 轮执行期间，异步计算并准备 Kₜ\n        ↓\n第 t 轮直接启动\n\n所以“两轮滞后”主要来自当前生产流水线的提前准备窗口，并非算法数学上必然要求两轮：\n\n用当前轮信息：可以，但会同步停顿；\n用上一轮信息：理论上可能，但在该实现中来得太晚，无法完全隐藏调度；\n用三轮前信息：也能运行，但信息更旧，没必要。\n\n生产方案通常让两轮前的信息只决定总容量 K，再用当前置信度选择本轮具体保留的 Top-K 候选。代价是负载或候选难度突然变化时，容量调整会存在两轮滞后。"
        }
      ],
      "provenance": {
        "legacyWorkbookRow": 13,
        "workbookInstitutions": "未知（arXiv作者团队）"
      },
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
      "venue": "ASPLOS 2024",
      "date": "2023-05",
      "url": "https://dl.acm.org/doi/10.1145/3620666.3651335",
      "localPdf": null,
      "explanationPage": null,
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
      "methodOverview": "把一个或多个小型投机模型产生的候选合并为共享 Prefix 的 Token Tree，再由 Target 通过 Tree Attention 一次 Verify 整棵树；同时覆盖服务调度、分布式执行和模型卸载。",
      "problemStatement": {
        "background": null,
        "priorLimitation": null,
        "goal": null
      },
      "methodComponents": [],
      "characteristics": {
        "requiresTraining": null,
        "drafterType": null,
        "draftGeneration": null,
        "candidateStructure": null,
        "verificationStrategy": null,
        "usesTargetFeatures": null,
        "dynamicDraftLength": null,
        "dynamicVerifyLength": null,
        "lossless": null
      },
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
      "training": {
        "summary": null,
        "data": null,
        "objective": null
      },
      "evaluation": {
        "targetModels": [],
        "benchmarks": [],
        "baselines": [],
        "metrics": [],
        "hardware": [],
        "frameworks": []
      },
      "mainResults": [],
      "limitations": [],
      "relations": {
        "extends": [],
        "comparesAgainst": [],
        "related": [],
        "compatibleWith": []
      },
      "citations": [],
      "reproducibility": {
        "codeUrl": null,
        "modelUrl": null,
        "projectPage": null,
        "officialImplementation": null,
        "status": "not-checked",
        "notes": []
      },
      "evidence": [],
      "notes": [],
      "qaNotes": [],
      "provenance": {
        "legacyWorkbookRow": 14,
        "workbookInstitutions": "美国加州大学圣迭戈分校（UCSD）、其他合作单位"
      },
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
      "venue": "TACL 2025",
      "date": "2024-06",
      "url": "https://aclanthology.org/2025.tacl-1.8/",
      "localPdf": "../Reference/OPTTree.pdf",
      "explanationPage": null,
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
      "methodOverview": "将一条路径上 Drafter 的条件概率连乘，得到节点被接受的近似概率；随后在节点预算内选择使概率总和最大的前缀闭合树，使目标直接对应预期接受 Token 数。",
      "problemStatement": {
        "background": "投机解码让低成本 Drafter 生成多个候选 Token，再由 Target 在一次前向中并行验证。将多条候选序列组织为共享 Prefix 的树，可以减少重复节点，并在固定 Verify Token 数下覆盖更多可能的生成路径。",
        "priorLimitation": "已有方法主要采用单条或多条候选序列，以及 Binary Tree、EAGLE Tree 等人工设定的固定树形。序列候选会重复计算公共 Prefix；固定树虽然消除了部分重复，却不会根据当前上下文和 Drafter 的概率分布调整宽度与深度，因此在有限节点预算下通常不能最大化本轮的接受长度。",
        "goal": "为任意自回归 Drafter 构造逐解码轮变化的自适应候选树，在固定节点预算内最大化近似期望接受长度，并通过停止阈值平衡更深 Draft 带来的接受收益与额外 Drafter 前向开销。"
      },
      "methodComponents": [
        {
          "name": "Prefix Acceptance Probability Surrogate",
          "stage": "Candidate scoring",
          "purpose": "把一棵候选树的结构质量转化为可由 Drafter 输出直接计算的期望接受长度目标。",
          "mechanism": "对于树中节点 v，将从 Root 到该节点路径上的 Drafter 条件概率连乘，得到 Prefix Probability p̂(v)。论文用 p̂(v) 近似该 Prefix 能通过 Target 验证的概率，并证明近似期望接受长度可写为 E(A)=Σv∈T p̂(v)，即树中全部节点 Prefix Probability 的总和。",
          "differenceFromPrior": "固定树结构不利用当前轮的 Token Probability；OPT-Tree 将候选节点的路径概率直接纳入树结构优化，使树形能够随输入上下文和 Drafter 分布逐轮变化。"
        },
        {
          "name": "Global Probability-Guided Tree Expansion",
          "stage": "Draft-tree construction",
          "purpose": "在不枚举完整指数级候选空间的情况下，搜索高概率的候选 Prefix。",
          "mechanism": "以当前输入最后一个 Token 作为 Root。每个 Draft Step 对当前最深层节点执行一次 Drafter 推理，从所有叶节点的后继分布中按完整路径概率 p̂ 全局选择最多 n 个高分节点加入下一层。树的深度逐步增加，而每层只保留最可能贡献期望接受长度的候选。",
          "differenceFromPrior": "Binary Tree 或 EAGLE Tree预先固定每层分支数；OPT-Tree 不固定宽度分配，而是在所有现有分支之间按完整 Prefix Probability 竞争节点预算。"
        },
        {
          "name": "Prefix-Closed Top-n Subtree Selection",
          "stage": "Candidate pruning",
          "purpose": "从累计搜索树中提取固定节点预算下使 E(A) 最大的有效候选树。",
          "mechanism": "Draft 结束后，从累计树中选择 p̂ 最大的 n 个非 Root 节点。由于任意父节点的 p̂ 不小于其子节点，若子节点进入 Top-n，其父节点也必然进入，因此最终节点天然构成包含 Root 的前缀闭合子树。论文据此给出：在搜索深度固定时，完整候选树中 p̂ 最大的 n 个节点组成目标 Topt。",
          "differenceFromPrior": "常规剪枝往往需要额外连通性修复或预定义树模板；该选择规则利用路径概率的单调性，使全局 Top-n 排序自动满足树的前缀闭合约束。"
        },
        {
          "name": "Gain-Aware Dynamic Draft Depth",
          "stage": "Draft stopping",
          "purpose": "避免为了很小的期望接受长度增益继续执行昂贵的自回归 Drafter 前向。",
          "mechanism": "随着 Draft Step 增加，固定预算最优子树的 Esub(T,n) 单调不减。算法仅当本次扩深带来的 Esub 增量超过阈值 δ 时继续 Draft；δ 应设置在 μ 与 1 之间，其中 μ 为一次 Drafter Step 时间与一次 Target Decoding Step 时间之比。实验中不同 Drafter 的最佳 δ 不同，例如 LLaMA-2-68M 和 EAGLE 分别在约 0.2 与 0.8 时取得最高速度。",
          "differenceFromPrior": "仅最大化接受长度会偏向过深的树，却忽略自回归 Draft 成本；OPT-Tree 将边际期望收益与实际 Draft 时间比例结合，动态决定本轮树深。"
        },
        {
          "name": "Tree-Attention Parallel Verification",
          "stage": "Target verification",
          "purpose": "在一次 Target 前向中验证整棵自适应候选树，同时保持原始 Target 解码结果。",
          "mechanism": "为最终 Topt 生成对应的 Tree Attention Mask；同层节点共享 Position Index，每个节点只能访问 Root 和自身祖先。Target 一次并行计算所有节点的后继分布，验证阶段沿 Target 的实际输出查找最长命中分支，并在已接受 Draft Prefix 后额外提交一个 Target 生成的 Token。",
          "differenceFromPrior": "Verify 机制沿用无损 Tree Verification，但输入树不再是固定模板，而是根据当前 Drafter 概率即时构造的 OPT-Tree。"
        }
      ],
      "characteristics": {
        "requiresTraining": false,
        "drafterType": "autoregressive",
        "draftGeneration": "autoregressive-tree-search",
        "candidateStructure": "adaptive-tree",
        "verificationStrategy": "tree-attention-longest-prefix",
        "usesTargetFeatures": false,
        "dynamicDraftLength": true,
        "dynamicVerifyLength": false,
        "lossless": true
      },
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
      "training": {
        "summary": "OPT-Tree 本身是 Training-Free 的推理时树构造算法，不新增模型参数，也不要求为树选择器准备训练数据。它直接复用现有自回归 Drafter 的下一 Token 分布；实验覆盖普通小型 LLaMA/Vicuna Drafter 和已训练的 EAGLE Drafter。",
        "data": "无需 OPT-Tree 专用训练数据。主实验直接使用已有 Target 与 Drafter Checkpoint。仅 Sequoia 对照组额外使用 200 条 C4 样本离线确定固定树结构，该数据不属于 OPT-Tree 的训练或校准流程。",
        "objective": "没有可学习损失函数。推理时的组合优化目标是在节点预算 n 下最大化 E(A)=Σv∈T p̂(v)，其中 p̂(v) 是 Root 到节点 v 的 Drafter 条件概率乘积；Draft 深度则由 Esub 的边际增益是否超过阈值 δ 决定。"
      },
      "evaluation": {
        "targetModels": [
          "LLaMA-2-7B",
          "LLaMA-2-13B",
          "LLaMA-2-70B",
          "Vicuna-33B"
        ],
        "benchmarks": [
          "MT-Bench",
          "GSM8K"
        ],
        "baselines": [
          "Autoregressive Decoding",
          "Binary Tree",
          "EAGLE Tree",
          "Sequoia"
        ],
        "metrics": [
          "Mean Acceptance Length",
          "Tokens per Second",
          "End-to-end Speedup",
          "Expected–Actual Acceptance Correlation",
          "Tree-operation Wall-clock Overhead"
        ],
        "hardware": [
          "NVIDIA GeForce RTX 4090",
          "NVIDIA L20",
          "4× NVIDIA A100 PCIe 40GB"
        ],
        "frameworks": [
          "论文未明确说明具体软件框架"
        ]
      },
      "mainResults": [
        {
          "condition": "LLaMA-2-70B Target、LLaMA-2-7B Drafter，MT-Bench，Temperature=0",
          "metric": "Mean Acceptance Length / Tokens per Second / Speedup",
          "result": "7.74 / 11.65 tokens/s / 1.85×",
          "comparison": "Binary Tree 为 4.84 / 11.05 tokens/s / 1.76×；EAGLE Tree 为 4.97 / 11.35 tokens/s / 1.80×。OPT-Tree 在相同模型组合下显著提高接受长度。",
          "source": "Table 1"
        },
        {
          "condition": "LLaMA-2-70B Target、LLaMA-2-7B Drafter，GSM8K，Temperature=0",
          "metric": "Mean Acceptance Length / Tokens per Second / Speedup",
          "result": "7.62 / 12.10 tokens/s / 1.90×",
          "comparison": "Binary Tree 为 4.85 / 11.20 tokens/s / 1.76×；EAGLE Tree 为 4.98 / 11.51 tokens/s / 1.80×。",
          "source": "Table 2"
        },
        {
          "condition": "LLaMA-2-13B Target、LLaMA-2-1B Drafter，MT-Bench，Temperature=0",
          "metric": "Mean Acceptance Length / Tokens per Second / Speedup",
          "result": "5.20 / 43.40 tokens/s / 1.62×",
          "comparison": "Binary Tree 为 3.95 / 37.37 tokens/s / 1.39×；EAGLE Tree 为 4.25 / 40.12 tokens/s / 1.50×。",
          "source": "Table 1"
        },
        {
          "condition": "LLaMA-2-70B Target、EAGLE Drafter，GSM8K，Temperature=0",
          "metric": "Maximum reported End-to-end Speedup",
          "result": "3.21×，Mean Acceptance Length 为 4.55，生成速度为 20.50 tokens/s",
          "comparison": "Vanilla Autoregressive Decoding 为 6.38 tokens/s；固定 EAGLE Tree 为 3.20×、3.91 Mean Acceptance Length 和 20.42 tokens/s。该组合取得论文报告的最高约 3.2× 加速，但相对固定 EAGLE Tree 的速度增量较小。",
          "source": "Table 2"
        },
        {
          "condition": "约 8000 个解码步骤，四组 Target–Drafter 组合",
          "metric": "Correlation between E(A) and Actual Acceptance Length",
          "result": "近似期望 E(A) 与实际接受长度 A 呈明显正相关",
          "comparison": "高密度区域基本沿对角线分布；Drafter 越强，分布越向高 E(A)、高 A 区域移动。LLaMA-2-70B + LLaMA-2-7B 中可观察到 E(A)=14、A=15 等长接受样本。",
          "source": "Figure 5"
        },
        {
          "condition": "LLaMA-2-70B Target、LLaMA-2-7B Drafter，扩大候选树节点预算",
          "metric": "Tree-size Scaling",
          "result": "500 节点时 Mean Acceptance Length 达到约 10，并在超过 500 节点时仍呈增长趋势",
          "comparison": "Sequoia 的接受长度在约 150 节点后趋于稳定；OPT-Tree 在更大节点预算下继续增长。不过，500 节点在论文使用的 A100 PCIe 40GB 平台上 Verify 成本过高，未能带来端到端加速。",
          "source": "Figure 6; Section 4.3"
        },
        {
          "condition": "四组模型，50 节点，A100 GPU，Temperature=0",
          "metric": "Tree-operation Overhead",
          "result": "最小模型组合中，树初始化、更新、Top-n 选择和 Attention Mask 构造合计占单轮时间的 6.3%",
          "comparison": "树操作成本基本不随 Target 与 Drafter 参数规模增长，因此在 LLaMA-2-70B + LLaMA-2-7B 等大模型组合中占比接近可忽略。",
          "source": "Figure 7; Section 4.4"
        },
        {
          "condition": "LLaMA-2-7B Target、EAGLE Drafter，MT-Bench，Temperature=1",
          "metric": "Non-greedy Mean Acceptance Length / Tokens per Second / Speedup",
          "result": "4.07 / 125.79 tokens/s / 2.42×",
          "comparison": "使用固定 EAGLE Tree 时为 3.37 / 101.63 tokens/s / 1.96×。随机采样会削弱 Drafter 概率与接受事件的相关性，但 OPT-Tree 仍保持明显加速。",
          "source": "Table 3; Figure 9"
        }
      ],
      "limitations": [
        {
          "type": "surrogate-objective",
          "description": "OPT-Tree 用 Drafter 的路径概率乘积近似 Prefix 被 Target 接受的概率，但两者并不完全相等。论文只能通过统计相关性支持该代理目标，而不能保证最大化 Σp̂ 必然最大化真实 Target 接受长度。",
          "sourceType": "paper"
        },
        {
          "type": "sampling",
          "description": "算法优先扩展 Drafter 概率最高的节点，因此主要优势建立在高 Drafter Probability 与 Target Acceptance 正相关之上。Temperature 升高后随机采样扩大低概率 Token 的影响，Mean Acceptance Length 和 Tokens/s 整体下降。",
          "sourceType": "paper"
        },
        {
          "type": "draft-latency",
          "description": "OPT-Tree 面向自回归 Drafter，每增加一层树深都需要额外执行一次 Drafter 前向。树通常比 Binary Tree 和 EAGLE Tree 更深，因此接受长度的大幅提升不一定等比例转化为 Tokens/s，需要针对模型和硬件调节 δ。",
          "sourceType": "paper"
        },
        {
          "type": "verification-cost",
          "description": "节点预算 n 在一轮内仍是固定超参数，论文从 25、50 和 60 中按模型与 GPU 选择。扩大节点数会增加 Target Verify 成本；500 节点虽然让 LLaMA-2-70B 的接受长度达到约 10，但在 4×A100 PCIe 40GB 上无法获得实际加速。",
          "sourceType": "paper"
        },
        {
          "type": "applicability",
          "description": "树构造依赖自回归 Drafter 为不同 Prefix 分别输出条件分布，并需要按树深执行多轮 Draft。它不能直接利用一次前向只给出各位置边缘分布的并行或 Block-Diffusion Drafter；这类 Drafter 需要 DDTree 等后续适配方法。",
          "sourceType": "analysis"
        },
        {
          "type": "system-integration",
          "description": "部署需要实现动态树输入、Position ID、Tree Attention Mask、分支 KV Cache 管理及 Verify 后缓存裁剪。普通仅支持单条 Candidate Chain 的投机解码接口不能直接运行 OPT-Tree。",
          "sourceType": "analysis"
        },
        {
          "type": "evaluation",
          "description": "实验集中于 LLaMA-2、Vicuna、MT-Bench 和 GSM8K，主要采用单请求离线解码；没有评估现代 Serving 场景中的动态 Batch、并发吞吐、长上下文或请求间节点预算分配，因此最高 3.2× 不能直接外推到生产负载。",
          "sourceType": "analysis"
        },
        {
          "type": "evidence",
          "description": "论文报告的最大 3.21× 速度来自 OPT-Tree 配合 EAGLE Drafter，但相同组合的固定 EAGLE Tree 已达到 3.20×。这说明某些高性能组合中，OPT-Tree 对接受长度的提升可能被额外 Draft 深度和树构造成本几乎完全抵消。",
          "sourceType": "observed-data"
        }
      ],
      "relations": {
        "extends": [],
        "comparesAgainst": [
          "eagle"
        ],
        "related": [
          "medusa",
          "eagle",
          "eagle-2",
          "specinfer",
          "ddtree",
          "taps"
        ],
        "compatibleWith": [
          "eagle"
        ]
      },
      "citations": [
        "medusa",
        "eagle"
      ],
      "reproducibility": {
        "codeUrl": "https://github.com/Jikai0Wang/OPT-Tree",
        "modelUrl": null,
        "projectPage": null,
        "officialImplementation": true,
        "status": "not-reproduced",
        "notes": [
          "论文摘要提供作者维护的官方 OPT-Tree 代码仓库。",
          "OPT-Tree 本身不需要重新训练模型，但复现实验需要准备对应的 LLaMA-2、Vicuna 或 EAGLE Target–Drafter Checkpoint。",
          "论文未在正文中明确记录完整的软件框架、依赖版本和端到端运行命令。",
          "本站尚未记录一组严格复现 Table 1–3 与 Figure 5–9 的完整环境和数值。"
        ]
      },
      "evidence": [
        {
          "claim": "已有候选序列会重复计算公共 Prefix，而固定启发式树不能针对每轮输入最大化接受长度。",
          "location": "Section 1 and Figure 1, Pages 1–2",
          "type": "motivation"
        },
        {
          "claim": "节点 Prefix Probability p̂ 等于 Root 路径上的 Drafter 条件概率乘积，近似期望接受长度可化简为全树节点 p̂ 之和。",
          "location": "Section 3, Equations 2–4 and Figure 4, Pages 3–4",
          "type": "method"
        },
        {
          "claim": "固定搜索深度下，p̂ 最大的 n 个节点天然构成包含 Root 的前缀闭合最优子树。",
          "location": "Algorithm 1 and Theorem 3.1, Page 4",
          "type": "method"
        },
        {
          "claim": "Esub 随 Draft Step 单调不减，并通过 δ∈[μ,1] 的停止条件权衡接受收益与额外 Drafter 时间。",
          "location": "Theorem 3.2 and Algorithm 1, Page 4; Section 4.5, Page 7",
          "type": "method"
        },
        {
          "claim": "最终候选树通过 Tree Attention 在一次 Target 前向中验证，并返回最长命中分支加一个 Target Token。",
          "location": "Algorithm 2 and Figure 2, Pages 2 and 4",
          "type": "verification"
        },
        {
          "claim": "主实验使用 LLaMA-2-7B、13B、70B 和 Vicuna-33B，在 MT-Bench 与 GSM8K 上比较 Binary、EAGLE 和 OPT-Tree。",
          "location": "Section 4.1 and Tables 1–2, Pages 5–6",
          "type": "evaluation"
        },
        {
          "claim": "论文最高报告约 3.2× 无损加速，且 OPT-Tree 在所有主实验模型组合中取得最高 Mean Acceptance Length。",
          "location": "Tables 1–2 and Section 4.1, Pages 5–6",
          "type": "result"
        },
        {
          "claim": "LLaMA-2-70B + LLaMA-2-7B 在 500 节点时达到约 10 的 Mean Acceptance Length，但当前 A100 平台上的 Verify 成本使其不能加速。",
          "location": "Section 4.3 and Figure 6, Page 7",
          "type": "result"
        },
        {
          "claim": "最小模型组合中的树操作时间占比为 6.3%，并随 Target 与 Drafter 规模增大而降低。",
          "location": "Section 4.4 and Figure 7, Page 7",
          "type": "system"
        },
        {
          "claim": "Temperature=1 时接受长度和速度普遍下降，但 OPT-Tree 仍能相对自回归解码和固定 EAGLE Tree 保持加速。",
          "location": "Section 4.6, Table 3 and Figure 9, Pages 7–8",
          "type": "result"
        }
      ],
      "notes": [],
      "qaNotes": [],
      "provenance": {
        "legacyWorkbookRow": 15,
        "workbookInstitutions": "未知（arXiv作者团队）"
      },
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
      "venue": "arXiv",
      "date": "2026-01",
      "url": "https://arxiv.org/abs/2601.19278",
      "localPdf": "../Reference/DART.pdf",
      "explanationPage": null,
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
      "methodOverview": "从 Target Hidden State 出发，通过一个轻量模块同时预测多个被 Mask 的未来位置，再利用 N-gram 语义约束把独立候选剪枝成连贯的 Token Tree。",
      "problemStatement": {
        "background": "投机解码通过轻量 Drafter 先提出多个未来 Token，再由 Target 在一次前向中并行验证并接受最长合法前缀；其端到端收益同时取决于候选接受长度与 Draft 阶段自身的延迟。",
        "priorLimitation": "EAGLE3 等高质量模型式 Drafter 仍需按 Token 多步自回归 Rollout，Draft Forward 约占总推理时间的 20%–40%，候选越长顺序开销越高。纯 N-gram 或检索式方法虽然 Draft 很快，但接受长度偏低；直接使用 Dream7B 一类大规模双向 dLLM 又存在模型过重、因果条件不匹配、Tokenizer 兼容性和模型可获得性问题。并行预测各未来位置还会隐式形成指数规模的候选组合，并产生跨位置不连贯路径。",
        "goal": "构建一个与 Target 紧耦合的轻量单层并行 Drafter，在严格 Prefix 条件和因果 Mask 下用一次前向预测多个未来位置分布，再以低开销的连续性约束压缩为可验证 Token Tree，从而在保持 Target 原始输出分布不变的前提下降低 Draft 瓶颈。"
      },
      "methodComponents": [
        {
          "name": "Multi-Layer Target Feature and Shifted Embedding Fusion",
          "stage": "Target prefill and verification",
          "purpose": "复用 Target 已完成前向时产生的内部知识，为单层 Drafter 提供比最终 Token Logits 更丰富的 Prefix 表征。",
          "mechanism": "在每轮 Target Prefill 或 Verify 后，抽取第 1 层、第 (L/2−1) 层和第 (L−4) 层 Hidden State，按位置拼接后经全连接层投影为紧凑特征 g；再与右移一位的 Target Token Embedding 拼接形成 Prefix 输入 z。Embedding 保持冻结，特征投影参与训练。",
          "differenceFromPrior": "普通小模型 Drafter 需要仅从 Token 历史重建 Target 的推理结果；独立大规模 dLLM 则计算和显存成本过高。DART 直接消费 Target 的多层特征，同时保持 Drafter 只有一个定制 Decoder Layer。"
        },
        {
          "name": "Single-Pass Causal Masked Drafting with Shifted Logits",
          "stage": "Draft generation",
          "purpose": "消除自回归 Drafter 随 Draft Length 线性增加的多次前向，并重点提高决定整段接受的第一枚候选准确率。",
          "mechanism": "在 Prefix 后追加 d−1 个可训练 Mask 表征，使用严格 Causal Attention 经过一个定制 Transformer Decoder Layer，一次得到 d 个未来位置的 Logits。Prefix 最后一位输出解释为第 1 枚候选，后续 Mask 位置输出依次右移预测下一位置；不执行迭代去噪、双向修正或逐 Token Rollout，也不维护自回归 Drafter KV Cache。",
          "differenceFromPrior": "EAGLE3 每生成一层候选都要重复执行轻量 Drafter；标准 dLLM 依赖多轮双向去噪。DART 借用 Masked Parallel Prediction 的形式，但保留严格因果条件并将整个 Draft Block 压缩为一次前向。"
        },
        {
          "name": "Prefix-Shared Masked Training and Annealed KL",
          "stage": "Training",
          "purpose": "让训练结构与推理时的 Prefix 条件并行预测一致，并避免远期高不确定性监督压过更关键的早期位置。",
          "mechanism": "从同一训练序列构造多个不同 Prefix 的未来块，使用 Prefix-Isolated Sparse Attention：原始序列内部因果可见，每个 Mask Block 只能访问对应 Prefix，块内保持因果，块间完全隔离；借助 FlexAttention 一次前后向训练多个 Prefix。目标为 Target 分布到 Drafter 分布的逐位置 KL，权重 λ_t=γ^(t−1)，默认 γ=0.6。",
          "differenceFromPrior": "离散 One-Hot 监督无法表达 Target 的完整概率分布；均匀权重又会让低可靠的远期位置主导优化。DART 用位置退火的分布蒸馏直接服务投机接受率，并专门保护靠前预测。"
        },
        {
          "name": "Continuity-Aware N-gram Tree Pruning",
          "stage": "Candidate construction and verification",
          "purpose": "从各位置独立 Logits 隐含的指数候选空间中选出紧凑且语言上连贯的路径，控制 Tree Attention Verify 的节点预算。",
          "mechanism": "每个未来位置先取 Top-25 Token；扩展部分序列时，把 Draft Log-Probability 与 Dolma 3 Mix 构建的 3-gram 条件概率组合，Logit 权重按 0.9^level 衰减、N-gram 权重固定为 0.5，并乘 (level+1)^−0.7。每层只保留 Beam Width 20，最后从全局扩展节点中选 Top-59 构成 Token Tree，再由 Target 用 Tree Attention 一次验证。",
          "differenceFromPrior": "Lookahead 等方法把 N-gram 直接当作 Drafter，接受率受限；DART 只让 N-gram 充当并行 Logits 的连续性过滤器，使主要概率信息仍来自 Target-Conditioned Drafter。"
        }
      ],
      "characteristics": {
        "requiresTraining": true,
        "drafterType": "diffusion-inspired single-layer masked predictor",
        "draftGeneration": "parallel",
        "candidateStructure": "token-tree",
        "verificationStrategy": "tree-attention",
        "usesTargetFeatures": true,
        "dynamicDraftLength": false,
        "dynamicVerifyLength": false,
        "lossless": true
      },
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
      "training": {
        "summary": "使用 ShareGPT 与 UltraChat 过滤后的约 28 万条样本，对每个 Target 单独训练一个单层 DART Drafter；同一序列内并行构造多个 Prefix/未来 Mask Block，并以块间隔离的 Sparse Causal Attention 联合训练。",
        "data": "训练数据来自 ShareGPT 与 UltraChat，过滤后约 280K 条，与 EAGLE3 使用相同数据源。默认 Context Length 为 6400、Draft Length 为 8；Drafter 输入使用 Target 第 1 层、第 (num_layers/2−1) 层和第 (num_layers−4) 层 Hidden State。训练 3 个 Epoch，使用 AdamW、学习率 2e−5、β=(0.9,0.999)、Gradient Clipping 0.5、Cosine Annealing 与 Linear Warmup，并在 8×NVIDIA H20-3e 上完成。",
        "objective": "对未来第 t 个位置最小化 KL(qθ(·|x1:n+t−1) || pφ(·|x1:n,t))，其中 Drafter 只条件于 Prefix x1:n，而教师分布来自 Target 在真实前缀上的输出；位置权重 λ_t=γ^(t−1)，默认 γ=0.6，以强调早期 Token。训练时 Target 与共享 Embedding 冻结，更新多层特征 FC Projection、定制 Decoder Layer、LM Head 和可训练 Mask Representation；Prefix-Isolated FlexAttention 防止不同未来块互相泄漏真值。"
      },
      "evaluation": {
        "targetModels": [
          "Qwen3-1.7B",
          "Qwen3-4B",
          "Qwen3-8B",
          "Qwen3-14B",
          "Qwen3-32B",
          "LLaMA2-Chat-7B"
        ],
        "benchmarks": [
          "MT-Bench",
          "HumanEval",
          "Alpaca",
          "MATH-500",
          "CodeAlpaca",
          "LiveCodeBench",
          "MBPP"
        ],
        "baselines": [
          "Autoregressive Decoding",
          "EAGLE3",
          "Standard Speculative Sampling (SPS)",
          "Medusa",
          "Hydra",
          "Lookahead",
          "PLD"
        ],
        "metrics": [
          "End-to-end Throughput Speedup",
          "Average Acceptance Length",
          "Draft Forward Latency",
          "Tree Search Latency",
          "Position-wise Hit@1/Hit@10 Accuracy",
          "Tokens per Second"
        ],
        "hardware": [
          "8×NVIDIA H20-3e 141GB",
          "NVIDIA A100-40GB"
        ],
        "frameworks": [
          "PyTorch 2.8.0",
          "SpecForge / SGLang",
          "FlexAttention",
          "C++ / OpenMP"
        ]
      },
      "mainResults": [
        {
          "condition": "全部 Qwen3 规模与七个任务，Batch Size=1；Temperature=0，另在 Qwen3-14B/32B 上测试 Temperature=1",
          "metric": "End-to-end Throughput Speedup",
          "result": "2.03×–3.44×",
          "comparison": "相对 EAGLE3 平均提高约 30%；最高单项为 Qwen3-14B 的 CodeAlpaca 3.44×。",
          "source": "Abstract, Figure 2 and Table 1"
        },
        {
          "condition": "Qwen3-4B，Temperature=0，七个基准宏平均",
          "metric": "Mean Speedup / Average Acceptance Length",
          "result": "2.87× / 3.87",
          "comparison": "EAGLE3 为 2.12× / 3.54；DART 在相近接受长度下依靠更低 Draft 开销获得更高端到端速度。",
          "source": "Table 1"
        },
        {
          "condition": "Qwen3-14B，Temperature=0，CodeAlpaca",
          "metric": "End-to-end Throughput Speedup",
          "result": "3.44×",
          "comparison": "EAGLE3 为 2.08×，相对提升约 65%。",
          "source": "Table 1 and Section 5.2"
        },
        {
          "condition": "LLaMA2-Chat-7B，Temperature=0，七个基准宏平均",
          "metric": "Mean Speedup / Average Acceptance Length",
          "result": "2.85× / 4.08",
          "comparison": "Hydra 为 2.66× / 3.55，Medusa 为 2.24× / 2.68，Lookahead 为 1.61× / 1.81，PLD 为 1.74× / 1.92。",
          "source": "Table 1"
        },
        {
          "condition": "Qwen3-14B，单轮 Draft–Verify，H20-3e",
          "metric": "Drafting Latency",
          "result": "Draft Forward 1.5 ms，Tree Search 2.0 ms",
          "comparison": "Draft Forward 相对 EAGLE3 的 10.2 ms 快 6.8×，相对 SPS 的 80.0 ms 快 53.3×；三者 Verify 约为 27.8/27.8/26.3 ms。",
          "source": "Figure 5"
        },
        {
          "condition": "Qwen3-4B，HumanEval、Alpaca、MATH-500 与 CodeAlpaca",
          "metric": "N-gram Pruning Ablation on Average Acceptance Length",
          "result": "加入 3-gram 后分别达到 3.63、3.26、3.37、4.59",
          "comparison": "相对不使用 N-gram 分别提高 0.50、0.50、0.48、0.74。",
          "source": "Table 2"
        },
        {
          "condition": "Qwen3-4B，相同训练配置，比较 Shifted 与 Unshifted Logits",
          "metric": "Future-position Prediction Accuracy",
          "result": "第 1/2/3 位置 Hit@1 为 71.1%/41.0%/27.6%，Hit@10 为 93.2%/76.7%/65.9%",
          "comparison": "Unshifted 的 Hit@1 为 57.7%/38.1%/25.1%；首位置提升最明显，为 13.4 个百分点。",
          "source": "Table 3"
        },
        {
          "condition": "Qwen3-4B，HumanEval，Annealed KL 系数消融",
          "metric": "Average Acceptance Length",
          "result": "γ=0.6 时 τ=3.63，为测试设置中最高",
          "comparison": "γ=0.5/0.7/0.8/0.9/1.0 时分别为 3.59/3.57/3.54/3.52/3.48，说明强调早期位置优于无退火监督。",
          "source": "Table 4"
        },
        {
          "condition": "Qwen3-4B，HumanEval，H20-3e，Batch Size 从 2 增至 64",
          "metric": "Throughput Speedup",
          "result": "DART 从 2.16× 下降到 1.45×",
          "comparison": "EAGLE3 同期从 1.84× 下降到 1.22×；虽然大 Batch 下相对收益收缩，DART 在全部测试 Batch Size 上仍更高。",
          "source": "Table 5 and Table 6"
        },
        {
          "condition": "单张 NVIDIA A100-40GB，Qwen3-1.7B/4B/8B/14B，七个基准宏平均",
          "metric": "Cross-platform Mean Speedup",
          "result": "DART 分别为 2.74×、2.83×、2.83×、2.84×",
          "comparison": "对应 EAGLE3 为 2.21×、2.22×、2.33×、2.19×，整体仍约高 30%。",
          "source": "Table 8 and Appendix F"
        }
      ],
      "limitations": [
        {
          "type": "deployment-memory",
          "description": "Continuity-Aware Pruning 依赖外部 3-gram Trie。完整 Qwen3/LLaMA2 版本约含 13 亿节点、占 43.5 GB 磁盘，并在推理时占用约 100 GB CPU RAM；虽然可跨进程共享且查询约 6 μs，但这明显提高了部署门槛。",
          "sourceType": "paper"
        },
        {
          "type": "algorithmic",
          "description": "单次并行输出本质上是各未来位置在同一 Prefix 下的边缘分布，后部位置不会条件化于本轮已经选出的前部候选。DART 依靠表层 3-gram 纠正跨位置冲突，但没有直接学习路径条件接受概率，因此树评分与 Target 的真实路径分布仍存在代理偏差。",
          "sourceType": "analysis"
        },
        {
          "type": "adaptivity",
          "description": "主配置固定 Draft Length=8、每位置 Top-25、Beam Width=20 和 Tree Size=59，不会按请求难度、任务类型、Target 尺度或实时系统负载动态调整 Draft/Verify 预算。",
          "sourceType": "paper"
        },
        {
          "type": "serving-scalability",
          "description": "随着 Batch Size 增大，Target Verify 更趋 Compute-bound，投机收益持续下降；Qwen3-8B 在 Batch Size 48/64 时仅约 1.03×/1.01×，说明该设计主要优势仍集中在低并发或 Memory-bound Decode 场景。",
          "sourceType": "observed-data"
        },
        {
          "type": "training-cost",
          "description": "DART 不是 Training-Free：每个 Target 需要单独训练并保存 Drafter，训练还依赖 Target 多层 Hidden State 与完整概率分布监督。论文默认使用 8 张 H20-3e、约 28 万样本和 3 个 Epoch。",
          "sourceType": "paper"
        },
        {
          "type": "evaluation",
          "description": "主实验集中在 Qwen3 与 LLaMA2-Chat-7B，并主要使用 H20-3e/A100；论文未覆盖更多模型家族、MoE Target 或真实在线多租户 Serving。对 DiffuSpec 与 SpecDiff 也因实现未开源而未做直接比较。",
          "sourceType": "paper"
        },
        {
          "type": "system-integration",
          "description": "方法要求 Target 暴露指定中间层 Hidden State，并额外集成自定义 Tree Attention、C++/OpenMP Tree Search、NUMA 绑核和 CPU Trie；它比仅接受 Token/Logits 的通用投机解码接口更侵入。",
          "sourceType": "analysis"
        },
        {
          "type": "latency-balance",
          "description": "Tree Search 本身约需 2.0 ms，甚至高于 1.5 ms 的 Drafter Forward。对更小 Target、较快硬件或更大 Batch，这部分固定 CPU 侧开销占比可能上升，论文没有展示取消外部 Trie 后的完整端到端替代方案。",
          "sourceType": "observed-data"
        }
      ],
      "relations": {
        "extends": [],
        "comparesAgainst": [
          "medusa",
          "eagle-3"
        ],
        "related": [
          "medusa",
          "eagle",
          "eagle-2",
          "eagle-3",
          "diffuspec",
          "specdiff-2"
        ],
        "compatibleWith": []
      },
      "citations": [
        "medusa",
        "eagle",
        "eagle-2",
        "eagle-3",
        "diffuspec",
        "specdiff-2"
      ],
      "reproducibility": {
        "codeUrl": "https://github.com/fvliang/DART",
        "modelUrl": "https://huggingface.co/fvliang",
        "projectPage": null,
        "officialImplementation": true,
        "status": "not-reproduced",
        "notes": [
          "官方仓库已提供完整推理代码、C++ N-gram Tree Search、Gradio/Python API 示例及 Apache-2.0 License。",
          "官方 Hugging Face 账号提供 Qwen3-1.7B、4B、8B、14B、32B 的 DART 权重和 Qwen3 N-gram Trie；ModelScope 也提供对应镜像。",
          "论文给出了训练超参数、FlexAttention Mask 伪代码、N-gram 构建与 Tree Pruning 参数，但本站尚未记录一组严格复现 Table 1/5/8 的完整命令和数值，因此状态标为 not-reproduced。",
          "未发现独立于论文页和代码仓库之外的官方 Project Page。"
        ]
      },
      "evidence": [
        {
          "claim": "DART 以 Target 多层 Hidden State 和右移 Token Embedding 构造 Prefix 表征，并用单个定制 Decoder Layer 一次预测 d 个未来位置 Logits。",
          "location": "Section 3.2 and Figure 3, Pages 3–4",
          "type": "method"
        },
        {
          "claim": "DART 使用严格 Causal Mask、Shifted Logits Prediction，不执行迭代去噪或双向修正，Draft Forward 成本不随候选长度线性增加。",
          "location": "Sections 3.1–3.2, Page 4",
          "type": "method"
        },
        {
          "claim": "Prefix-Shared Masked Training 通过块间隔离、块内因果的 Sparse Attention 一次训练多个 Prefix，并使用 FlexAttention 加速。",
          "location": "Section 3.3 and Figure 4, Page 5; Appendix B, Pages 11–12",
          "type": "training"
        },
        {
          "claim": "训练目标为位置退火 KL，λ_t=γ^(t−1)，默认 γ=0.6；消融中该设置在 HumanEval 上取得最高 τ=3.63。",
          "location": "Section 3.3, Page 5; Table 4, Page 8",
          "type": "training"
        },
        {
          "claim": "训练数据来自 ShareGPT 与 UltraChat，过滤后约 280K 条；默认 Context Length 6400、Draft Length 8、训练 3 Epoch。",
          "location": "Appendix B.2, Pages 11–12",
          "type": "configuration"
        },
        {
          "claim": "Continuity-Aware Tree Pruning 使用 Top-25、Beam Width 20、Tree Size 59，并融合 Draft Logit、3-gram 与深度权重。",
          "location": "Section 4 and Algorithm 1, Page 6; Appendix D, Pages 13–14",
          "type": "method"
        },
        {
          "claim": "外部 3-gram 基于 Dolma 3 Mix 构建，约 13 亿节点、43.5 GB 磁盘、推理时约 100 GB CPU RAM，Warmup 后单次查询约 6 μs。",
          "location": "Appendix C and Figure 7, Pages 12–13",
          "type": "system"
        },
        {
          "claim": "DART 在七个基准上取得 2.03×–3.44× 加速，相对 EAGLE3 平均提高约 30%，Qwen3-14B CodeAlpaca 上提高约 65%。",
          "location": "Abstract, Page 1; Section 5.2 and Table 1, Page 7",
          "type": "result"
        },
        {
          "claim": "Qwen3-14B 上 Draft Forward 为 1.5 ms、Tree Search 为 2.0 ms，Draft Forward 相对 EAGLE3 和 SPS 分别快 6.8× 与 53.3×。",
          "location": "Figure 5 and Section 5.2, Pages 6–7",
          "type": "result"
        },
        {
          "claim": "N-gram、Shifted Logits 和 Annealed KL 均通过消融提升接受长度或早期位置准确率。",
          "location": "Tables 2–4 and Section 5.3, Page 8",
          "type": "ablation"
        },
        {
          "claim": "大 Batch 下 DART 仍优于 EAGLE3，但相对加速随 Batch Size 增大而下降；A100-40GB 上仍保持约 30% 的平均优势。",
          "location": "Table 5, Page 8; Tables 6–8 and Appendices E–F, Pages 14–15",
          "type": "system"
        },
        {
          "claim": "官方实现与 Qwen3 多尺度 Drafter/N-gram 权重已公开。",
          "location": "Paper Abstract, Page 1; Official GitHub README and Hugging Face author page",
          "type": "reproducibility"
        }
      ],
      "notes": [],
      "qaNotes": [],
      "provenance": {
        "legacyWorkbookRow": 16,
        "workbookInstitutions": "未知（arXiv作者团队）"
      },
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
      "venue": "arXiv",
      "date": "2026-04",
      "url": "https://arxiv.org/abs/2604.12989",
      "localPdf": "../Reference/DDTree.pdf",
      "explanationPage": null,
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
      "methodOverview": "利用 DFlash 为各位置给出的边缘概率，通过 Best-First Search 在节点预算下选择代理路径概率最高的候选，并用仅允许访问祖先的 Attention Mask 一次 Verify 整棵树。",
      "problemStatement": {
        "background": "Block-Diffusion Drafter 能在一次前向中并行输出多个未来位置的 Token 分布，从而避免自回归 Drafter 随 Draft 长度线性增长的串行成本。DFlash 已利用这种能力一次生成完整 Token Block，但其一次前向实际上提供的是每个未来位置的完整边缘分布，而不只是一条确定序列。",
        "priorLimitation": "Vanilla DFlash 将逐位置分布压缩为一条 Top-1 Draft 轨迹，每轮只 Verify 这一条路径，大量次优但仍可能被 Target 选中的候选没有得到利用。直接扩展更多路径又会快速增加 Verify 节点数；同时，一次并行前向只提供逐位置边缘概率，无法获得依赖具体前缀的 Target 路径条件概率，因此不能直接优化真实 Target 分布下的期望接受长度。",
        "goal": "在不增加 Drafter 前向次数、也不引入外部 N-gram 评分器的前提下，从一次 Block-Diffusion 前向的边缘分布中构造紧凑、前缀闭合的候选树；在固定节点预算内最大化可计算的替代期望接受长度，并通过一次 Target 前向完成整棵树的无损 Verify。"
      },
      "methodComponents": [
        {
          "name": "逐位置边缘分布保留",
          "stage": "Draft 输出读取",
          "purpose": "保留单次 DFlash 前向中除 Top-1 Token 之外的候选信息，为多路径覆盖提供概率基础。",
          "mechanism": "给定上一轮 Bonus Token 和 Mask Block，DFlash 一次前向输出未来 L 个位置的 Logits，并分别归一化为边缘分布 q_i。DDTree不立即采样成一条序列，而是保留各位置按概率排序的候选 Token 及其概率。",
          "differenceFromPrior": "Vanilla DFlash 每个位置只选择一个 Token 并组成单链；DDTree利用同一次前向已经产生的完整逐位置分布，不增加额外 Drafter 计算。"
        },
        {
          "name": "因子化路径概率与替代接受目标",
          "stage": "候选评分",
          "purpose": "在缺少 Target 路径条件概率时，为候选前缀建立可计算且具有明确含义的排序目标。",
          "mechanism": "将一条长度为 d 的前缀 u 的代理概率定义为 q(u)=∏_{i=1}^{d}q_i(u_i)，即在 Block-Diffusion 逐位置边缘分布诱导的因子化分布 Q 下的前缀概率。论文证明，任意前缀闭合树在 Q 下的期望接受长度等于树内所有节点前缀概率之和，因此固定预算下应选择概率最高的 B 个前缀。",
          "differenceFromPrior": "该最优性只针对 Drafter 因子化分布 Q 下的替代目标，不声称恢复不可获得的 Target 路径概率；目标形式继承 OPT-Tree 的期望接受长度思想，但所有概率由一次并行 Drafter 前向获得。"
        },
        {
          "name": "Best-First Heap 候选树构造",
          "stage": "候选组织",
          "purpose": "避免枚举指数规模的所有 Token 前缀，以较低开销恢复节点预算内概率最高的前缀集合。",
          "mechanism": "用各位置候选 Token 的概率名次表示一个前缀，并以对数路径概率作为 Max-Heap 分数。从全 Top-1 前缀开始，每次弹出当前最高分节点后，只加入其下一个兄弟和概率最高的孩子。弹出 B 次后得到 B 个最高概率前缀；由于父前缀概率总不低于子前缀，结果自动满足前缀闭合。Heap 阶段时间复杂度为 O(B log B)。",
          "differenceFromPrior": "自回归树方法通常需要按树深执行多次 Drafter 前向；DART 还使用外部 N-gram 连贯性评分和运行时 Trie。DDTree只依赖一次 DFlash 前向的概率，不需要额外模型调用或外部评分结构。"
        },
        {
          "name": "Tree Attention Verify 与 KV Cache 压缩",
          "stage": "Target Verify",
          "purpose": "在一次 Target 前向中同时计算所有候选分支，并确保不同分支之间不会发生信息泄漏。",
          "mechanism": "将候选树展平为 Token 序列，按节点深度设置 Position ID，并构造仅允许节点访问历史 KV Cache、根节点、祖先节点和自身的 Attention Mask。Target 一次前向为所有节点产生分布，随后按 Target 自身的贪心或采样规则沿匹配子节点行走；首个不在树中的 Target Token 成为下一轮 Bonus Token，KV Cache 只保留已接受路径。",
          "differenceFromPrior": "相较 DFlash 的单链 Verify，DDTree在同一轮覆盖多条候选路径；相较无约束的多分支验证，祖先可见 Mask 隔离各分支，固定节点预算则直接限制 Target Verify 成本。"
        }
      ],
      "characteristics": {
        "requiresTraining": false,
        "drafterType": "block-diffusion",
        "draftGeneration": "parallel",
        "candidateStructure": "adaptive-tree",
        "verificationStrategy": "tree-verification",
        "usesTargetFeatures": true,
        "dynamicDraftLength": false,
        "dynamicVerifyLength": false,
        "lossless": true
      },
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
      "training": {
        "summary": "DDTree 本身是 Training-Free 的候选组织与 Verify 算法，不新增可训练参数，直接复用已经训练完成的 DFlash Drafter checkpoint。",
        "data": "不使用额外 Training 数据。论文实验直接加载与 Qwen3-4B、Qwen3-8B 和 Qwen3-Coder-30B-A3B-Instruct 配套的官方 DFlash checkpoints。",
        "objective": "不存在参数学习目标；运行时优化的是因子化 Draft 分布 Q 下的替代期望接受长度，即最大化候选树中所有前缀概率质量之和。"
      },
      "evaluation": {
        "targetModels": [
          "Qwen3-4B",
          "Qwen3-8B",
          "Qwen3-Coder-30B-A3B-Instruct"
        ],
        "benchmarks": [
          "MATH-500",
          "GSM8K",
          "AIME 2024",
          "AIME 2025",
          "HumanEval",
          "MBPP",
          "LiveCodeBench",
          "SWE-bench Lite",
          "MT-Bench",
          "Alpaca"
        ],
        "baselines": [
          "Autoregressive decoding",
          "Vanilla DFlash"
        ],
        "metrics": [
          "End-to-end speedup relative to autoregressive decoding",
          "Mean acceptance length τ including the Target-generated Bonus Token",
          "Acceptance length histogram",
          "Node-budget versus speedup and acceptance-length tradeoff"
        ],
        "hardware": [
          "8× NVIDIA H200 GPUs"
        ],
        "frameworks": [
          "Hugging Face Transformers",
          "PyTorch scaled dot product attention for Target Tree Attention",
          "FlashAttention-2 for the DFlash Drafter"
        ]
      },
      "mainResults": [
        {
          "condition": "10 个数据集、3 个目标模型、温度 0.0 与 1.0，共 60 个数据集–模型–温度设置",
          "metric": "端到端加速比与平均接受长度 τ",
          "result": "DFlash+DDTree 在 Table 1 的 60 个设置中全部优于 Vanilla DFlash。",
          "comparison": "提升覆盖数学推理、代码生成、软件工程、通用指令与对话任务，并同时出现在贪心解码和温度采样中。",
          "source": "Section 5.2；Table 1"
        },
        {
          "condition": "Qwen3-8B，MATH-500，temperature=0.0",
          "metric": "端到端加速比 / 平均接受长度 τ",
          "result": "DDTree 达到 7.52× / 10.73。",
          "comparison": "Vanilla DFlash 为 5.56× / 7.79。",
          "source": "Table 1"
        },
        {
          "condition": "Qwen3-Coder-30B-A3B-Instruct，HumanEval，temperature=0.0",
          "metric": "端到端加速比 / 平均接受长度 τ",
          "result": "DDTree 达到 8.22× / 10.72，为论文表格中的最高加速结果。",
          "comparison": "Vanilla DFlash 为 6.09× / 8.02。",
          "source": "Figure 1；Table 1"
        },
        {
          "condition": "Qwen3-4B，Alpaca，temperature=0.0",
          "metric": "端到端加速比 / 平均接受长度 τ",
          "result": "DDTree 达到 3.32× / 5.35。",
          "comparison": "Vanilla DFlash 为 2.03× / 3.11，说明多分支覆盖在开放式对话任务上仍能带来明显收益。",
          "source": "Table 1"
        },
        {
          "condition": "Qwen3-8B，MATH-500，temperature=0.0，节点预算从 16 增至 1024",
          "metric": "节点预算–接受长度–端到端加速权衡",
          "result": "接受长度随节点预算持续上升，但端到端加速在约 256–512 个节点时达到峰值；继续增至 1024 后 Verify 开销开始压过接受长度收益。",
          "comparison": "预算为 16 时 DDTree 已能在相近概念预算下超过只验证一条长度 16 序列的 Vanilla DFlash。",
          "source": "Section 5.3；Figure 3"
        },
        {
          "condition": "Qwen3-8B，MATH-500，temperature=0.0，DDTree 节点预算 B=512",
          "metric": "接受长度分布",
          "result": "DDTree 显著减少低于 4 的短接受轮次，并提高完整接受长度 16 的出现频率。",
          "comparison": "相较 Vanilla DFlash，概率质量整体向更长接受 Prefix 移动，因此生成相同 Token 数所需的 Target Verify 轮次更少。",
          "source": "Section 5.4；Figure 4"
        }
      ],
      "limitations": [
        {
          "type": "algorithmic",
          "description": "Best-First Search 的最优性仅针对由逐位置边缘概率诱导的因子化 Draft 分布 Q，以及该分布下的替代期望接受长度；它不保证所选树对真实 Target 路径条件分布最优。",
          "sourceType": "paper"
        },
        {
          "type": "latency",
          "description": "更大的节点预算虽然通常能提高接受长度，但会直接增加 Target Verify 的 Token 数；实验中预算增至 1024 后，额外 Verify 开销已经可能降低端到端加速。",
          "sourceType": "paper"
        },
        {
          "type": "deployment",
          "description": "最优节点预算依赖具体模型、数据、硬件与实现。论文结果为每个数据集–模型–温度组合从多个候选预算中选择最佳值，并未提供面向实时负载的动态预算调度器。",
          "sourceType": "analysis"
        },
        {
          "type": "deployment",
          "description": "FlashAttention-2 不支持论文所需的非标准 Tree Attention 模式，因此 Target 侧使用标准 PyTorch scaled dot product attention；这会限制其在高度优化 Serving 框架中的直接性能与集成便利性。",
          "sourceType": "paper"
        },
        {
          "type": "evaluation",
          "description": "评测集中在 Qwen3 系列的三个目标模型和 NVIDIA H200 离线环境，没有报告其他模型家族、其他加速器、长上下文、高并发 Batch Serving 或线上负载下的效果。",
          "sourceType": "analysis"
        }
      ],
      "relations": {
        "extends": [
          "dflash",
          "opt-tree"
        ],
        "comparesAgainst": [
          "dflash"
        ],
        "related": [
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
        "compatibleWith": []
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
      "reproducibility": {
        "codeUrl": "https://github.com/liranringel/ddtree",
        "modelUrl": "https://huggingface.co/collections/z-lab/dflash",
        "projectPage": "https://liranringel.github.io/ddtree/",
        "officialImplementation": true,
        "status": "code-available",
        "notes": [
          "官方仓库提供 DDTree 与 DFlash 推理实现、benchmark.py、run_benchmark.sh、绘图脚本和 LaTeX 表格生成脚本。",
          "仓库面向启用 CUDA 的 PyTorch 环境，依赖可通过 requirements.txt 安装，并可用 run_benchmark.sh 运行论文实验。",
          "DDTree 不发布独立训练权重；modelUrl 指向论文实验所复用的官方 DFlash checkpoint 集合。",
          "官方代码采用 MIT License。"
        ]
      },
      "evidence": [
        {
          "claim": "Vanilla DFlash 每轮只 Verify 一条轨迹，未充分利用单次 Block-Diffusion 前向产生的多个可能延续。",
          "location": "Introduction，第 2 页",
          "type": "method"
        },
        {
          "claim": "单次 Block-Diffusion 前向提供的是各位置边缘分布，而不是依赖已选择前缀的路径条件分布。",
          "location": "Section 3，Equation 1–2，第 4 页",
          "type": "method"
        },
        {
          "claim": "因子化分布 Q 下的期望接受长度可分解为候选树内所有前缀概率质量之和。",
          "location": "Section 4.2，Proposition 1，Equation 8，第 7 页",
          "type": "method"
        },
        {
          "claim": "固定节点预算下，概率最高的 B 个前缀自动形成前缀闭合树，并对替代目标最优。",
          "location": "Section 4.2，Proposition 2，第 7 页",
          "type": "method"
        },
        {
          "claim": "Best-First Heap 通过加入下一兄弟和最优孩子恢复最高概率前缀，复杂度为 O(B log B)。",
          "location": "Section 4.3，Algorithm 1、Proposition 3 与 Remark 2，第 8–9 页",
          "type": "method"
        },
        {
          "claim": "候选树通过祖先可见 Tree Attention 在一次 Target 前向中 Verify，之后 KV Cache 只保留接受路径。",
          "location": "Section 4.4，第 9 页",
          "type": "system"
        },
        {
          "claim": "实验覆盖三个 Qwen3 目标模型、十个 Benchmark、温度 0.0 和 1.0，并在 8 张 H200 GPU 上运行。",
          "location": "Section 5.1，第 10 页；Appendix B，第 17 页",
          "type": "configuration"
        },
        {
          "claim": "DDTree 在全部 60 个数据集–模型–温度设置中均提升 Vanilla DFlash。",
          "location": "Section 5.2；Table 1，第 10–11 页",
          "type": "result"
        },
        {
          "claim": "接受长度随节点预算增加，但端到端加速在中间预算达到峰值，继续扩树会受 Verify 成本限制。",
          "location": "Section 5.3；Figure 3，第 11 页",
          "type": "ablation"
        },
        {
          "claim": "DDTree 将接受长度分布推向更长 Prefix，并显著提高完整接受长度 16 的比例。",
          "location": "Section 5.4；Figure 4，第 11–12 页",
          "type": "result"
        },
        {
          "claim": "Target Tree Attention 使用 PyTorch SDPA，因为 FlashAttention-2 不支持所需树状 Attention Pattern。",
          "location": "Appendix B，第 17 页",
          "type": "limitation"
        },
        {
          "claim": "论文提供官方 Project Page 和代码仓库，仓库包含运行 Benchmark 及生成论文图表的脚本。",
          "location": "论文第 1 页 Project Page / Code 链接；官方 GitHub README",
          "type": "system"
        }
      ],
      "notes": [
        "论文中的“最优候选树”必须带上限定：它是在因子化 Draft 分布 Q 与固定节点预算下对替代目标最优，不是对真实 Target 路径分布最优。",
        "DDTree本质上不提升 DFlash Drafter 的单点预测能力，而是把原本被丢弃的边缘分布概率质量重新组织成可 Verify 的多分支覆盖。",
        "论文表格中的 DDTree 数值对每个数据集、模型和温度选用了 {16, 32, 64, 128, 256, 512, 1024} 中的最佳节点预算，不能直接视为无需调参的固定部署配置。",
        "节点预算控制的是一次 Target 前向中被 Verify 的树节点总数；树的形状随每轮 Draft 概率变化，但论文没有动态改变每轮节点预算。"
      ],
      "qaNotes": [],
      "provenance": {
        "legacyWorkbookRow": 17,
        "workbookInstitutions": "未知（arXiv作者团队）"
      },
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
      "venue": "arXiv",
      "date": "2026-05",
      "url": "https://arxiv.org/abs/2606.00487",
      "localPdf": "../Reference/TAPS.pdf",
      "explanationPage": null,
      "institutionDetails": [
        {
          "name": "香港科技大学（广州）",
          "order": 1,
          "explanation": "全部作者均来自该校。"
        }
      ],
      "institutionSource": "https://arxiv.org/pdf/2606.00487",
      "methodOverview": "Training 一个轻量 Target-Aware Scorer 来估计每条边在 Target 下被接受的条件概率，沿 Prefix 连乘后选出紧凑的前缀闭合子树。",
      "problemStatement": {
        "background": "Block-Diffusion Drafter 能在一次前向中并行预测多个未来位置，显著压低 Draft 阶段延迟；但当 Draft 变得足够便宜后，端到端瓶颈会转移到 Target Verify。单路径验证成本低，却限制平均接受长度；大规模 Token Tree 虽能覆盖更多候选路径，却会显著增加 Tree Attention 和 Target 前向成本。",
        "priorLimitation": "DFlash 每轮只验证一条序列，没有充分利用扩散 Drafter 在各位置输出的多个候选。DDTree 虽将这些边缘分布扩展成树，却主要按各位置的 Marginal Probability 选择节点，没有考虑树验证的 Prefix-Conditioned 性质：只有祖先全部通过时，后代节点才可能被访问。因此，错误 Prefix 下具有较高边缘概率的后代仍可能占用 Verify 预算。与此同时，固定扩大树节点预算会产生明显的边际收益递减，更多接受 Token 未必足以抵消更高的 Target Verify 延迟。",
        "goal": "学习 Target 在具体 Prefix 下的接受偏好，将扩散 Drafter 的逐位置边缘置信度转换为路径条件可达概率，并在节点预算与验证成本约束下动态选择紧凑的前缀闭合子树，以提高期望接受收益与 Target 计算成本之间的比值，同时保持投机解码的无损性质。"
      },
      "methodComponents": [
        {
          "name": "Marginal Candidate Pool Construction",
          "description": "沿用 DFlash 类 Block-Diffusion Drafter，在一次前向中产生未来 d 个位置的 Marginal Logits。每个位置保留 Top-K Token，并将这些局部候选组合成最多包含 N_pool 个节点的大型候选树。该阶段只负责提供高召回候选池，不直接决定最终需要验证的树。"
        },
        {
          "name": "Target-Aware Edge Scorer",
          "description": "对每条父子边 u→v 预测条件接受概率 q_cond(u→v)=Pr(accept v | reach u)。Scorer 输入包括父 Token、子 Token、边深度、子 Token 的 Draft Log Probability，以及该位置的预测熵；同一父节点的所有子节点经过 Sibling-Wise Softmax，表示在已经到达该父 Prefix 时 Target 对各候选孩子的相对偏好。"
        },
        {
          "name": "Path Reach Probability Propagation",
          "description": "将根节点到当前节点路径上的条件概率连乘，得到 q_reach(v)=∏q_cond。该分数表示节点真正能在 Verify 过程中被访问的概率，会自然压低错误或低概率 Prefix 下的所有后代，而不是把每个位置的 Token 独立排序。"
        },
        {
          "name": "Cost-Aware Adaptive Prefix Tree Selection",
          "description": "为每个候选节点定义 utility(v)=q_reach(v)/(λ₁+λ₂·depth(v))。其中 λ₁刻画 Tree Attention 的逐节点固定成本，λ₂惩罚更深、KV Cache 复用机会更低的节点。选择器按 Utility 贪心加入节点，并同步补齐全部祖先，保证结果始终为根连通的 Prefix-Closed Subtree；达到 N_max 或剩余节点 Utility 低于阈值 τ 时停止。"
        },
        {
          "name": "Dynamic Verification Budget",
          "description": "最终树大小随当前上下文难度变化。高置信轮次中更多节点超过阈值，树会接近节点预算；低置信轮次中只保留少量高收益节点，避免机械耗尽固定 Verify 预算。论文主实验中，TAPS 动态剪枝后平均约验证 64 个树节点。"
        },
        {
          "name": "Tree-Attention Verification",
          "description": "将最终选出的前缀闭合子树交给 Target Model，通过 Tree Attention 在一次前向中并行计算所有保留分支。解码时沿 Target 实际选择的路径逐层匹配并提交最长可接受 Prefix。TAPS 只改变 Verify 前的候选选择，不修改 Target 分布。"
        },
        {
          "name": "Path-Aware Offline Distillation",
          "description": "离线运行 Target Verify 并记录接受轨迹，以 Target 实际接受路径监督轻量 Scorer。训练同时学习每个已到达 Prefix 下的局部子节点分布，并校准沿完整路径累乘得到的 Reach Probability；推理阶段不需要为选树额外调用 Target Model。"
        }
      ],
      "characteristics": {
        "requiresTraining": true,
        "drafterType": "Block-Diffusion Drafter（实验中沿用对应的 DFlash Drafter）",
        "draftGeneration": "固定 Block 长度的一次前向并行生成；每个未来位置输出 Marginal Distribution，并取 Top-K 构造候选池",
        "candidateStructure": "Target-Aware、动态大小、前缀闭合的 Token Tree",
        "verificationStrategy": "对动态选出的子树执行单次 Tree-Attention Target 前向，并沿 Target 路径接受最长 Prefix",
        "usesTargetFeatures": true,
        "dynamicDraftLength": false,
        "dynamicVerifyLength": true,
        "lossless": true
      },
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
      "training": {
        "summary": "只训练额外的轻量 Target-Aware Scorer；底层 DFlash Drafter 与 Target Model 不需要因 TAPS 重新训练。Scorer 通过离线蒸馏 Target Verify 轨迹，学习局部条件接受概率及完整 Prefix 的累计可达概率。",
        "data": "离线收集的 Target Model 验证轨迹。每条轨迹包含扩散候选树、各已到达 Prefix 下的 Target 局部偏好、Target 实际接受路径及各节点是否可达的监督标签。论文未披露训练轨迹的具体来源、样本数量、数据划分、优化器或训练轮数。",
        "objective": "L_TAPS = Σ_{j∈P} D_KL(p_T^j || q_θ^j) + λ Σ_{v∈T} BCE(r̂_v, q_v^reach)。KL 项在实际到达的 Prefix 上蒸馏 Target 对兄弟候选的局部条件分布；BCE 项校准由各边条件概率连乘得到的路径 Reach Probability，使训练目标直接对应紧凑子树能否覆盖 Target 接受路径。"
      },
      "evaluation": {
        "targetModels": [
          "Qwen3-4B",
          "Qwen3-8B",
          "LLaMA-3.1-8B-Instruct"
        ],
        "benchmarks": [
          "AIME25",
          "GSM8K",
          "MATH500",
          "HumanEval",
          "LiveCodeBench",
          "MBPP",
          "MT-Bench"
        ],
        "baselines": [
          "Vanilla Autoregressive Decoding",
          "EAGLE-3",
          "DFlash",
          "DDTree"
        ],
        "metrics": [
          "End-to-End Decoding Speedup",
          "Average Acceptance Length τ",
          "End-to-End Throughput",
          "Target Verification Latency",
          "Tree Selection Overhead",
          "Average Verification Node Count",
          "Acceptance Length under Matched Node Budget"
        ],
        "hardware": [
          "NVIDIA A40-48GB GPU",
          "NVIDIA A800-SXM4-80GB GPU"
        ],
        "frameworks": [
          "单请求、Batch Size = 1 的研究原型",
          "论文未披露具体底层推理框架；明确说明尚未集成 vLLM 或 SGLang"
        ]
      },
      "mainResults": [
        {
          "metric": "跨模型与硬件平均加速",
          "value": "5.44×",
          "context": "在 Qwen3-4B、Qwen3-8B、LLaMA-3.1-8B-Instruct，以及 A40、A800 两个平台的六组平均结果上，TAPS 的平均端到端加速为 5.44×；相对 DFlash 和 DDTree 分别提高 1.36× 与 1.74×。"
        },
        {
          "metric": "最高端到端加速",
          "value": "7.90×",
          "context": "在 NVIDIA A40 上的 Qwen3-4B + MATH500 设置中达到 7.90× 无损加速，平均接受长度 τ=9.11。"
        },
        {
          "metric": "A40 · Qwen3-4B 平均结果",
          "value": "6.73× speedup，τ=7.92",
          "context": "七个基准平均；DFlash 为 4.91×、τ=6.00，DDTree 为 3.50×、τ=8.90。TAPS 接受长度略低于 512 节点 DDTree，但端到端速度明显更高。"
        },
        {
          "metric": "A40 · Qwen3-8B 平均结果",
          "value": "6.14× speedup，τ=7.91",
          "context": "七个基准平均；DFlash 为 4.86×、τ=6.03，DDTree 为 2.65×、τ=8.95。"
        },
        {
          "metric": "A40 · LLaMA-3.1-8B-Instruct 平均结果",
          "value": "3.87× speedup，τ=5.74",
          "context": "七个基准平均；DFlash 为 2.99×、τ=4.19，DDTree 为 1.61×、τ=6.47。"
        },
        {
          "metric": "A800 · Qwen3-4B 平均结果",
          "value": "5.91× speedup，τ=7.89",
          "context": "七个基准平均；DFlash 为 4.24×、τ=5.69，DDTree 为 5.13×、τ=8.89。"
        },
        {
          "metric": "A800 · Qwen3-8B 平均结果",
          "value": "5.72× speedup，τ=7.83",
          "context": "七个基准平均；DFlash 为 4.03×、τ=5.48，DDTree 为 3.48×、τ=8.88。"
        },
        {
          "metric": "A800 · LLaMA-3.1-8B-Instruct 平均结果",
          "value": "4.28× speedup，τ=5.75",
          "context": "七个基准平均；DFlash 为 2.97×、τ=4.20，DDTree 为 2.39×、τ=6.48。"
        },
        {
          "metric": "相同节点预算下的接受长度",
          "value": "6.93 → 7.92，提升 14.2%",
          "context": "TAPS 主实验动态树平均约包含 64 个 Verify 节点。将 DDTree 同样限制为 64 个节点后，在 Qwen3-4B 七个数据集上的平均接受长度由 DDTree 的 6.93 提升至 TAPS 的 7.92，说明收益并非来自更大的树。"
        },
        {
          "metric": "Target Verify 延迟",
          "value": "TAPS 1.57 s",
          "context": "在 Qwen3-8B、A800、七个数据集平均设置中，论文报告 DFlash、DDTree、TAPS 的验证阶段延迟分别为 2.32 s、2.88 s 和 1.57 s。TAPS 额外选树开销为 0.083 s，仅占总端到端时间约 4.2%。"
        },
        {
          "metric": "Path-Conditional Scorer 消融",
          "value": "平均接受长度下降 4.8%",
          "context": "移除 Scorer、退化为按 Drafter Marginal Confidence 选树后，七个基准的接受长度下降 2.6%–7.4%，平均下降 4.8%。"
        },
        {
          "metric": "Cost-Aware Dynamic Pruning 消融",
          "value": "接受长度平均下降 13.3%，吞吐平均下降 11.7%",
          "context": "保留 Target-Aware Scorer 但移除按接受收益与 Verify 成本进行的动态剪枝后，接受长度下降 10.2%–16.7%，吞吐下降 8.7%–15.1%。"
        }
      ],
      "limitations": [
        {
          "name": "仅评估 Greedy Decoding",
          "description": "全部实验采用 temperature=0。此时 Scorer 标签可定义为候选 Token 是否等于 Target 的唯一 Greedy Token；在 Sampling-Based Decoding 中，同一位置可能有多个 Token 随 Target 采样结果被接受，需要重新设计或校准 Scorer 标签以及剪枝效用目标。"
        },
        {
          "name": "缺少 Batched Serving 验证",
          "description": "当前实现是 Batch Size=1 的单请求研究原型，尚未接入 vLLM 或 SGLang。动态树在 Continuous Batching、Paged Attention、KV-Cache 管理和请求调度下会形成不同的实际成本曲线，因此单请求实验不能直接等价为生产吞吐收益。"
        },
        {
          "name": "受候选池召回率限制",
          "description": "TAPS 只优化 Candidate Selection，不提高底层 Diffusion Drafter 的预测质量。如果 Target 偏好的 Token 未进入各位置 Top-K 候选，尤其是在分布外 Prompt 上，后续 Scorer 和剪枝策略无法将其恢复。"
        },
        {
          "name": "训练细节披露不完整",
          "description": "论文给出了 Scorer 特征与损失函数，但没有披露训练轨迹规模、训练数据来源、Scorer 的完整网络结构、优化器、学习率、训练轮数、N_pool、N_max、λ₁、λ₂、τ 等主要超参数，独立复现实验仍需要参考随附代码。"
        },
        {
          "name": "成本模型较为简化",
          "description": "节点 Utility 使用 λ₁+λ₂·depth(v) 近似验证开销，主要建模逐节点 Tree Attention 成本与深层节点较低的 KV 复用价值，没有显式纳入 Batch 形状、Context Length、硬件 Kernel 离散性能区间或 Serving 负载。"
        }
      ],
      "relations": {
        "extends": [
          "dflash",
          "ddtree"
        ],
        "comparesAgainst": [
          "eagle-3",
          "dflash",
          "ddtree"
        ],
        "related": [
          "medusa",
          "eagle",
          "eagle-2",
          "eagle-3",
          "dflash",
          "specinfer",
          "dart",
          "ddtree"
        ],
        "compatibleWith": [
          "dflash"
        ]
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
      "reproducibility": {
        "codeUrl": "https://anonymous.4open.science/r/TAPS-EMNLP2026-53DD",
        "modelUrl": null,
        "projectPage": "https://anonymous.4open.science/r/TAPS-EMNLP2026-53DD",
        "officialImplementation": true,
        "status": "anonymous-code-available",
        "notes": [
          "论文首页给出了作者匿名发布的 4open.science 实现地址。",
          "未给出独立的 Hugging Face 模型或 Scorer Checkpoint 地址。",
          "论文说明当前实现仅为单请求研究原型，尚未集成 vLLM 或 SGLang。",
          "正文未披露完整训练配置和树选择超参数，复现时需要以匿名代码仓库为准。"
        ]
      },
      "evidence": [
        {
          "source": "Abstract / Figure 2",
          "claim": "TAPS 在三个 Target 模型和两种 GPU 平台上的平均加速为 5.44×，相对 DFlash 和 DDTree 分别提高 1.36× 与 1.74×，最高达到 7.9×。"
        },
        {
          "source": "Figure 3(a)",
          "claim": "Target 实际接受 Token 在 DFlash Marginal Top-8 中的覆盖率约为 99%，说明主要问题通常不是局部候选缺失，而是正确 Token 被放在错误 Prefix 下。"
        },
        {
          "source": "Figure 3(b)",
          "claim": "即使每个位置的 Top-8 候选几乎覆盖正确 Token，受预算限制的前缀树在后部位置仍出现约 10%–15% 的正确 Token 覆盖损失。"
        },
        {
          "source": "Figure 3(c)",
          "claim": "将树预算从 64 增至 512 个节点时，Verify 延迟从约 33 ms 增至约 81 ms，而单位 Verify 成本带来的收益持续下降。"
        },
        {
          "source": "Section 4.2 / Equation 1–2",
          "claim": "TAPS 在边上建模 q_cond(u→v)，再沿根路径连乘为 q_reach(v)，从机制上区分局部高概率与真正能够到达的高价值节点。"
        },
        {
          "source": "Section 4.3 / Equation 3 / Algorithm 1",
          "claim": "选择器按 q_reach(v)/(λ₁+λ₂·depth(v)) 贪心选点，同时加入全部祖先，并在达到 N_max 或 Utility 阈值 τ 时停止。"
        },
        {
          "source": "Section 4.4 / Equation 4",
          "claim": "Scorer 使用局部 Target 分布的 KL 蒸馏与路径 Reach Probability 的 BCE 校准联合训练。"
        },
        {
          "source": "Table 2",
          "claim": "在所有三种 Target、两种 GPU 和七个数据集的组合中，TAPS 都取得最高的平均端到端 Speedup。"
        },
        {
          "source": "Figure 6",
          "claim": "Qwen3-8B+A800 设置下，TAPS 将论文报告的验证阶段延迟降至 1.57 s，选树本身只增加 0.083 s、约占端到端时间 4.2%。"
        },
        {
          "source": "Figure 7",
          "claim": "相同约 64 节点预算下，TAPS 将 Qwen3-4B 的七数据集平均接受长度从 DDTree 的 6.93 提升至 7.92。"
        },
        {
          "source": "Figure 8",
          "claim": "移除 Path-Conditional Scorer 后，接受长度平均下降 4.8%。"
        },
        {
          "source": "Figure 9",
          "claim": "移除 Cost-Aware Dynamic Pruning 后，接受长度和吞吐平均分别下降 13.3% 与 11.7%。"
        },
        {
          "source": "Limitations",
          "claim": "作者明确限定当前结果为 temperature=0、单请求原型，并指出 Sampling、生产级 Batched Serving 和候选池召回是后续工作。"
        }
      ],
      "notes": [
        "TAPS 的核心不是生成更大的树，而是在扩散 Drafter 已给出的候选池中更聪明地分配 Target Verify 预算。",
        "其 Target-Aware 性来自对 Target Verify 轨迹的离线蒸馏；推理选树阶段不需要额外执行 Target Model。",
        "与 DDTree 的本质差异是：DDTree 使用 Drafter Marginal Probability 的因子化代理目标，TAPS 学习 Prefix-Conditioned Target Acceptance，并显式计算整条路径的 Reach Probability。",
        "TAPS 不改造 DFlash 的 Drafter 结构，因此可与提高 Draft Quality 的方法叠加；其主要贡献落在 B 候选组织和 C Verify 策略。",
        "动态的是最终 Verify Tree 的节点数和形状，不是底层 Diffusion Draft Block 的长度。Qwen3 使用 Block Size 16，LLaMA-3.1-8B-Instruct 使用 Block Size 10。",
        "论文报告的无损性质来自标准投机解码与 Tree Attention 验证过程；当前实证范围仅覆盖 Greedy Decoding。"
      ],
      "qaNotes": [],
      "provenance": {
        "legacyWorkbookRow": 18,
        "workbookInstitutions": "未知（arXiv作者团队）"
      },
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
      "venue": "ECCV 2026",
      "date": "2026-04",
      "url": "https://arxiv.org/abs/2604.09731",
      "localPdf": "../Reference/SMART.pdf",
      "explanationPage": null,
      "institutionDetails": [
        {
          "name": "新加坡管理大学",
          "order": 1,
          "explanation": "全部作者均来自该校。"
        }
      ],
      "institutionSource": "https://arxiv.org/pdf/2604.09731",
      "methodOverview": "使用实际测得的 Draft 与 Verify 延迟曲线，在运行时比较增加候选节点的边际收益和成本；只有预计能降低端到端延迟时才扩树。",
      "problemStatement": {
        "background": null,
        "priorLimitation": null,
        "goal": null
      },
      "methodComponents": [],
      "characteristics": {
        "requiresTraining": null,
        "drafterType": null,
        "draftGeneration": null,
        "candidateStructure": null,
        "verificationStrategy": null,
        "usesTargetFeatures": null,
        "dynamicDraftLength": null,
        "dynamicVerifyLength": null,
        "lossless": null
      },
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
      "training": {
        "summary": null,
        "data": null,
        "objective": null
      },
      "evaluation": {
        "targetModels": [],
        "benchmarks": [],
        "baselines": [],
        "metrics": [],
        "hardware": [],
        "frameworks": []
      },
      "mainResults": [],
      "limitations": [],
      "relations": {
        "extends": [],
        "comparesAgainst": [],
        "related": [
          "medusa",
          "dflash",
          "eagle",
          "eagle-2",
          "eagle-3",
          "specinfer"
        ],
        "compatibleWith": []
      },
      "citations": [
        "medusa",
        "dflash",
        "eagle",
        "eagle-2",
        "eagle-3",
        "specinfer"
      ],
      "reproducibility": {
        "codeUrl": null,
        "modelUrl": null,
        "projectPage": null,
        "officialImplementation": null,
        "status": "not-checked",
        "notes": []
      },
      "evidence": [],
      "notes": [],
      "qaNotes": [],
      "provenance": {
        "legacyWorkbookRow": 19,
        "workbookInstitutions": "未知（arXiv作者团队）"
      },
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
      "venue": "COLM 2026",
      "date": "2026-07",
      "url": "https://arxiv.org/abs/2607.10661",
      "localPdf": "../Reference/PTD.pdf",
      "explanationPage": null,
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
      "methodOverview": "不引入独立 Drafter，而是通过渐进式树结构引导 Target 在一次前向中探索多条路径，并逐阶段剪枝，在候选多样性、连贯性和 Verify 成本间取得平衡。",
      "problemStatement": {
        "background": null,
        "priorLimitation": null,
        "goal": null
      },
      "methodComponents": [],
      "characteristics": {
        "requiresTraining": null,
        "drafterType": null,
        "draftGeneration": null,
        "candidateStructure": null,
        "verificationStrategy": null,
        "usesTargetFeatures": null,
        "dynamicDraftLength": null,
        "dynamicVerifyLength": null,
        "lossless": null
      },
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
      "training": {
        "summary": null,
        "data": null,
        "objective": null
      },
      "evaluation": {
        "targetModels": [],
        "benchmarks": [],
        "baselines": [],
        "metrics": [],
        "hardware": [],
        "frameworks": []
      },
      "mainResults": [],
      "limitations": [],
      "relations": {
        "extends": [],
        "comparesAgainst": [],
        "related": [
          "medusa",
          "eagle",
          "eagle-2",
          "specinfer"
        ],
        "compatibleWith": []
      },
      "citations": [
        "medusa",
        "eagle",
        "eagle-2",
        "specinfer"
      ],
      "reproducibility": {
        "codeUrl": null,
        "modelUrl": null,
        "projectPage": null,
        "officialImplementation": null,
        "status": "not-checked",
        "notes": []
      },
      "evidence": [],
      "notes": [],
      "qaNotes": [],
      "provenance": {
        "legacyWorkbookRow": 20,
        "workbookInstitutions": "未知（arXiv作者团队）"
      },
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
      "venue": "ICLR 2026 Poster",
      "date": "2026-03",
      "url": "https://openreview.net/forum?id=aL1Wnml9Ef",
      "localPdf": "../Reference/Speculative_Speculative_Decoding.pdf",
      "explanationPage": null,
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
      "methodOverview": "在 Target 执行 Verify 的同时，Drafter 预判 Verify 可能出现的若干结果，并提前为这些结果继续计算后续 Draft；实际结果若命中预判集合，就能立即复用预计算结果。Saguaro 是针对这一重叠执行模式优化的实现。",
      "problemStatement": {
        "background": null,
        "priorLimitation": null,
        "goal": null
      },
      "methodComponents": [],
      "characteristics": {
        "requiresTraining": null,
        "drafterType": null,
        "draftGeneration": null,
        "candidateStructure": null,
        "verificationStrategy": null,
        "usesTargetFeatures": null,
        "dynamicDraftLength": null,
        "dynamicVerifyLength": null,
        "lossless": null
      },
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
      "training": {
        "summary": null,
        "data": null,
        "objective": null
      },
      "evaluation": {
        "targetModels": [],
        "benchmarks": [],
        "baselines": [],
        "metrics": [],
        "hardware": [],
        "frameworks": []
      },
      "mainResults": [],
      "limitations": [],
      "relations": {
        "extends": [],
        "comparesAgainst": [],
        "related": [
          "medusa",
          "eagle",
          "eagle-2",
          "eagle-3",
          "diffuspec",
          "dflash",
          "specinfer"
        ],
        "compatibleWith": []
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
      "reproducibility": {
        "codeUrl": null,
        "modelUrl": null,
        "projectPage": null,
        "officialImplementation": null,
        "status": "not-checked",
        "notes": []
      },
      "evidence": [],
      "notes": [],
      "qaNotes": [],
      "provenance": {
        "legacyWorkbookRow": null,
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
      "venue": "arXiv",
      "date": "2025-10",
      "url": "https://arxiv.org/abs/2510.22876",
      "localPdf": "../Reference/Batch_Speculative_Decoding_Done_Right.pdf",
      "explanationPage": null,
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
      "methodOverview": "从 Position ID、Attention Mask 和 KV Cache 的同步不变量出发，EQSPEC 保证不等长 Batch 投机解码的正确性；EXSPEC 使用滑动请求池动态组合相同长度序列，减少反复对齐产生的实际开销。",
      "problemStatement": {
        "background": null,
        "priorLimitation": null,
        "goal": null
      },
      "methodComponents": [],
      "characteristics": {
        "requiresTraining": null,
        "drafterType": null,
        "draftGeneration": null,
        "candidateStructure": null,
        "verificationStrategy": null,
        "usesTargetFeatures": null,
        "dynamicDraftLength": null,
        "dynamicVerifyLength": null,
        "lossless": null
      },
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
      "training": {
        "summary": null,
        "data": null,
        "objective": null
      },
      "evaluation": {
        "targetModels": [],
        "benchmarks": [],
        "baselines": [],
        "metrics": [],
        "hardware": [],
        "frameworks": []
      },
      "mainResults": [],
      "limitations": [],
      "relations": {
        "extends": [],
        "comparesAgainst": [],
        "related": [
          "medusa",
          "eagle",
          "eagle-2",
          "eagle-3",
          "specinfer"
        ],
        "compatibleWith": []
      },
      "citations": [
        "medusa",
        "eagle",
        "eagle-2",
        "eagle-3",
        "specinfer"
      ],
      "reproducibility": {
        "codeUrl": null,
        "modelUrl": null,
        "projectPage": null,
        "officialImplementation": null,
        "status": "not-checked",
        "notes": []
      },
      "evidence": [],
      "notes": [],
      "qaNotes": [],
      "provenance": {
        "legacyWorkbookRow": null,
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
      "venue": "Findings of ACL 2026",
      "date": "2025-05",
      "url": "https://aclanthology.org/2026.findings-acl.2153/",
      "localPdf": "../Reference/SpecExtend.pdf",
      "explanationPage": null,
      "institutionDetails": [
        {
          "name": "首尔大学",
          "order": 1,
          "explanation": "全部作者均来自首尔大学；Hyunjong Kim 为通讯作者。"
        }
      ],
      "institutionSource": "https://aclanthology.org/2026.findings-acl.2153.pdf",
      "methodOverview": "面向长上下文的免 Training 增强方案：Prefill 使用 FlashAttention，Verify 使用 Hybrid Tree Attention；Cross-model Retrieval 再根据 Target 的 Attention Score，只为 Drafter 保留最有用的上下文 KV。",
      "problemStatement": {
        "background": null,
        "priorLimitation": null,
        "goal": null
      },
      "methodComponents": [],
      "characteristics": {
        "requiresTraining": null,
        "drafterType": null,
        "draftGeneration": null,
        "candidateStructure": null,
        "verificationStrategy": null,
        "usesTargetFeatures": null,
        "dynamicDraftLength": null,
        "dynamicVerifyLength": null,
        "lossless": null
      },
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
      "training": {
        "summary": null,
        "data": null,
        "objective": null
      },
      "evaluation": {
        "targetModels": [],
        "benchmarks": [],
        "baselines": [],
        "metrics": [],
        "hardware": [],
        "frameworks": []
      },
      "mainResults": [],
      "limitations": [],
      "relations": {
        "extends": [],
        "comparesAgainst": [],
        "related": [
          "medusa",
          "eagle",
          "eagle-2",
          "eagle-3",
          "specinfer",
          "opt-tree"
        ],
        "compatibleWith": []
      },
      "citations": [
        "medusa",
        "eagle",
        "eagle-2",
        "eagle-3",
        "specinfer",
        "opt-tree"
      ],
      "reproducibility": {
        "codeUrl": null,
        "modelUrl": null,
        "projectPage": null,
        "officialImplementation": null,
        "status": "not-checked",
        "notes": []
      },
      "evidence": [],
      "notes": [],
      "qaNotes": [],
      "provenance": {
        "legacyWorkbookRow": null,
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
      "venue": "arXiv",
      "date": "2026-03",
      "url": "https://arxiv.org/abs/2603.03383",
      "localPdf": "../Reference/Accelerating_OpenPangu_Inference_on_NPU_via_Speculative_Decoding.pdf",
      "explanationPage": null,
      "institutionDetails": [
        {
          "name": "中国科学技术大学软件学院",
          "order": 1,
          "explanation": "全部作者均来自中国科学技术大学软件学院。"
        }
      ],
      "institutionSource": "https://arxiv.org/pdf/2603.03383",
      "methodOverview": "将 Medusa 风格的轻量多 Head 预测改造成适合 NPU 静态图的固定 Token Tree 与 Tree Attention，并配合零拷贝检索；重点解决长序列推理中的显存与带宽瓶颈。",
      "problemStatement": {
        "background": "投机解码可以让轻量 Drafter 一次预测多个未来 Token，再由 Target 模型并行验证，从而减少大型自回归模型的串行 Decode 次数。Medusa 进一步复用 Target 模型的 Hidden State，通过多个轻量预测 Head 和 Token Tree 避免部署独立 Drafter，适合资源受限的推理环境。",
        "priorLimitation": "原始 Medusa 实现依赖运行时生成候选树、动态 Attention Mask、可变 Shape、Host 侧路径重建和频繁的 CPU–Device 同步。这些动态控制流与 NPU 强调静态 Shape、整图编译和显式内存管理的执行模式不匹配，容易触发图重编译、CPU 回退、额外数据搬运和算子碎片化。随着序列长度增加，Tree Verification 还会受到 KV Cache 访问和内存带宽增长的制约。",
        "goal": "在不改变 OpenPangu 输出质量的前提下，将 Medusa 式多 Token 投机解码完整迁移到 NPU，使用固定候选树、静态 Tree Attention 和设备侧零拷贝路径提取消除动态执行开销，并评估不同上下文长度下 NPU 与 GPU 的端到端加速表现。"
      },
      "methodComponents": [
        {
          "name": "Lightweight Medusa Heads",
          "stage": "Draft generation",
          "purpose": "在不引入独立 Drafter 模型的情况下并行预测多个未来 Token。",
          "mechanism": "在 OpenPangu 最后一层 Transformer 的 Hidden State 后附加 K 个并行 Medusa Head。每个 Head 由轻量残差 MLP 和共享词表投影构成，分别预测当前位置之后不同偏移量的 Token；Target Backbone 在训练期间保持冻结，最终配置使用 5 个预测 Head。",
          "differenceFromPrior": "相比使用独立小模型逐 Token 自回归生成草稿，该设计直接复用 OpenPangu 已计算出的 Target Hidden State，并在一次 Head 前向中产生多个未来位置的分布。"
        },
        {
          "name": "Self-Distilled Multi-Head Training",
          "stage": "Training",
          "purpose": "让多个预测 Head 与 OpenPangu 自身的输出分布对齐，并避免特殊控制 Token 缺失造成的训练–推理偏差。",
          "mechanism": "使用 ShareGPT Query 驱动 OpenPangu 生成 Response 和监督信号，并以位置衰减的多 Head 交叉熵联合训练各预测 Head。论文依次扩展至 2K、10K 和 50K 样本；最终版本保留 OpenPangu 使用的特殊控制 Token，并训练 5 个 Head。",
          "differenceFromPrior": "直接使用通用对话数据中的原始 Response 容易与 Target 模型分布不一致，且移除特殊 Token 会破坏 OpenPangu 的模板和状态控制；自蒸馏改为学习 Target 自己产生的序列。"
        },
        {
          "name": "Offline Static Token Tree",
          "stage": "Candidate organization",
          "purpose": "将运行时动态候选树转换为 NPU 可提前编译的固定计算图。",
          "mechanism": "离线确定候选树拓扑，并预计算固定的 Tree Indices、节点深度、父子关系和祖先可见关系。推理初始化时直接加载这些常量 Tensor，后续各轮仅替换候选 Token 值，不改变树节点数量和 Tensor Shape。",
          "differenceFromPrior": "原始 Medusa 会根据各 Head 的实时概率和 Top-k 组合动态生成候选树，树结构、节点数和索引可能逐轮变化，难以在 NPU 上保持单一静态图。"
        },
        {
          "name": "Static Tree Attention",
          "stage": "Verification",
          "purpose": "在一次 Target 前向中并行验证固定候选树，同时满足 NPU 的静态 Shape 要求。",
          "mechanism": "预计算形状固定的 medusa_attn_mask，使每个候选节点只能访问历史上下文、树根、自己的祖先和自身；Tree Indices 将展平后的树节点映射至正确的 Position ID 与 KV Cache 位置。Target 模型由此可在一个静态图中同时计算所有候选分支。",
          "differenceFromPrior": "避免在每轮推理中根据候选树重新构造 Attention Mask、Position ID 和可变长度输入，也减少动态图分支和图重编译。"
        },
        {
          "name": "Zero-Copy Path Retrieval",
          "stage": "Acceptance and cache update",
          "purpose": "消除验证完成后由 CPU 重建接受路径所造成的同步和数据搬运。",
          "mechanism": "为所有候选路径预计算固定的 retrieve_indices，形状为候选路径数乘以最大路径长度。验证后直接在 NPU 内存中使用 Gather 类操作提取各路径的 Target Logits、匹配结果和最终接受路径，不将中间树结构传回 Host。",
          "differenceFromPrior": "传统实现通常在 CPU 上遍历树节点、处理指针和重排路径，再将结果传回加速器；零拷贝路径将该过程改为设备侧固定索引操作。"
        },
        {
          "name": "NPU Operator and Graph Adaptation",
          "stage": "System integration",
          "purpose": "使完整 Medusa Draft–Verify 流程在 NPU PyTorch 生态中稳定执行。",
          "mechanism": "围绕静态 Shape、算子支持、设备驻留 Tensor、固定索引和图编译约束改写 Medusa 推理路径，避免不受支持的动态操作触发 CPU 回退，并将候选生成、Tree Attention、路径提取和 KV Cache 更新串联为端到端 NPU 流程。",
          "differenceFromPrior": "原始实现主要面向 CUDA/GPU 的动态图执行习惯，没有针对 NPU 的图编译、Host–Device 同步成本和静态内存布局进行专门设计。"
        }
      ],
      "characteristics": {
        "requiresTraining": true,
        "drafterType": "multi-head",
        "draftGeneration": "parallel",
        "candidateStructure": "tree",
        "verificationStrategy": "tree-verification",
        "usesTargetFeatures": true,
        "dynamicDraftLength": false,
        "dynamicVerifyLength": false,
        "lossless": true
      },
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
      "training": {
        "summary": "冻结 OpenPangu Backbone，仅训练附加的 Medusa Heads。最终配置使用 5 个 Head，以 AdamW、1e-3 学习率、Global Batch Size 64 和 FP16 训练，并通过位置衰减权重联合优化不同预测距离的 Token 预测任务。",
        "data": "以 ShareGPT Query 为输入，由 OpenPangu-7B 自行生成 Response 和蒸馏监督。论文比较了 2K、10K 和 50K 三种数据规模；最终 50K 配置保留模型所需的特殊控制 Token，以降低模板和输出分布偏差。",
        "objective": "对第 k 个 Medusa Head 的未来 Token 预测计算交叉熵，并按预测距离赋予递减权重后求和。优化目标是在优先保证前部 Head 准确率的同时，让较远位置的 Head 学习 OpenPangu 自身的未来 Token 分布。"
      },
      "evaluation": {
        "targetModels": [
          "openPangu-Embedded-7B-V1.1"
        ],
        "benchmarks": [
          "Decode-length sweep (128, 256, 384, 512, 1024)"
        ],
        "baselines": [
          "Standard Autoregressive Decoding",
          "Same Medusa design on NVIDIA RTX A6000"
        ],
        "metrics": [
          "End-to-end Speedup",
          "Accept Rate",
          "Overhead Ratio",
          "Medusa Head Top-1 Accuracy",
          "Training Time"
        ],
        "hardware": [
          "Ascend 910B NPU",
          "Kunpeng 920 CPU",
          "NVIDIA RTX A6000"
        ],
        "frameworks": [
          "NPU PyTorch",
          "Transformers",
          "CUDA 11.8"
        ]
      },
      "mainResults": [
        {
          "condition": "OpenPangu-7B Medusa Head 训练，2K 数据、3 Heads、无自蒸馏且不保留特殊 Token",
          "metric": "Head Top-1 Accuracy",
          "result": "Head 1 为 62.40%，Head 2 为 42.00%",
          "comparison": "作为小规模基础配置，训练耗时为 7.45 小时。",
          "source": "Table 2"
        },
        {
          "condition": "OpenPangu-7B Medusa Head 训练，50K 自蒸馏数据、5 Heads，并保留特殊 Token",
          "metric": "Head Top-1 Accuracy",
          "result": "Head 1 为 74.60%，Head 2 为 54.10%",
          "comparison": "相较 2K 配置分别提高 12.20 和 12.10 个百分点；相较 10K 自蒸馏配置的 67.80% 和 49.30% 也继续提高。完整训练耗时为 65.70 小时。",
          "source": "Table 2"
        },
        {
          "condition": "openPangu-Embedded-7B-V1.1，Ascend 910B，Decode Step 分别为 128、256、384、512 和 1024",
          "metric": "End-to-end Speedup",
          "result": "1.35×、1.26×、1.12×、1.10×、0.95×",
          "comparison": "同一 Medusa 方案在 NVIDIA RTX A6000 上分别为 0.97×、0.90×、0.89×、0.85× 和 0.79×；NPU 在短序列上取得正加速，但到 1024 时已低于自回归基线。",
          "source": "Figure 3"
        },
        {
          "condition": "openPangu-Embedded-7B-V1.1，Ascend 910B，Decode Step 从 128 增加至 1024",
          "metric": "Accept Rate and Overhead Ratio",
          "result": "Accept Rate 仅从约 1.78 降至 1.65，而 Overhead Ratio 从约 1.32 增至 1.77",
          "comparison": "接受长度下降有限，但每轮 Tree Verification 成本随上下文增长明显上升，使速度从 1.35× 下降到 0.95×，说明主要瓶颈转向 KV Cache 访问和内存带宽。",
          "source": "Figures 3–4; Section 4.3"
        },
        {
          "condition": "短序列 NPU 推理，Decode Step=128",
          "metric": "Peak Reported Speedup",
          "result": "1.35×",
          "comparison": "论文将该结果作为 OpenPangu-7B 在 NPU 上相对标准自回归解码的主要端到端加速结果。",
          "source": "Abstract; Figure 3"
        }
      ],
      "limitations": [
        {
          "type": "long-context",
          "description": "加速随序列长度快速衰减：Decode Step 从 128 增长至 1024 时，NPU Speedup 从 1.35× 降至 0.95×。接受长度变化不大，主要问题是长 KV Cache 下 Tree Attention 和多候选验证的内存访问成本非线性增长。",
          "sourceType": "paper"
        },
        {
          "type": "candidate-rigidity",
          "description": "为了适配静态图，候选树拓扑、节点预算和 Attention Mask 均被固定，无法根据当前 Head 概率、Prompt 难度或实时负载动态调整树宽、树深和验证预算，可能浪费验证计算。",
          "sourceType": "analysis"
        },
        {
          "type": "evaluation",
          "description": "实验主要覆盖一个 7B OpenPangu 模型和序列长度扫描，没有报告标准 NLP 基准上的输出一致性、不同采样温度、并发 Serving、Batch Size 扩展或其他模型规模，因此结论的模型与工作负载覆盖面有限。",
          "sourceType": "analysis"
        },
        {
          "type": "comparison",
          "description": "跨硬件比较使用 NVIDIA RTX A6000 上的同类实现，但没有与经过深度优化的 CUDA Medusa、EAGLE 系列、SpecInfer 或主流 Serving 框架中的实现进行等硬件对照，不能据此判断 NPU 相对最新 GPU 系统的绝对竞争力。",
          "sourceType": "analysis"
        },
        {
          "type": "training-cost",
          "description": "方案需要为 OpenPangu 单独训练 Target-Specific Medusa Heads。最终 50K 自蒸馏配置耗时约 65.7 小时，且训练数据必须正确保留模型的特殊控制 Token；迁移至其他 Target 模型时通常需要重新蒸馏和训练。",
          "sourceType": "paper"
        },
        {
          "type": "reproducibility",
          "description": "论文未完整给出 Ascend 软件栈版本、精确 NPU 数量、Tree Topology 配置、各 Head Top-k、评测 Prompt 集和图编译参数，这些设置会明显影响静态树的验证开销和实际速度。",
          "sourceType": "observed-data"
        },
        {
          "type": "evidence",
          "description": "论文 Figure 3 报告 Decode Step=128 和 256 时 NPU Speedup 为 1.35× 和 1.26×，而官方仓库 README 当前表格给出 1.32× 和 1.13×，并额外报告 Decode Length=64 时为 1.43×。两组结果可能来自不同代码版本或测试口径，不能直接混合使用。",
          "sourceType": "observed-data"
        }
      ],
      "relations": {
        "extends": [
          "medusa"
        ],
        "comparesAgainst": [],
        "related": [
          "medusa",
          "eagle",
          "specinfer"
        ],
        "compatibleWith": []
      },
      "citations": [
        "medusa",
        "eagle",
        "specinfer"
      ],
      "reproducibility": {
        "codeUrl": "https://github.com/wujing215/OpenPangu7B-with-Medusa",
        "modelUrl": "https://huggingface.co/Ivy0525/openPangu7B-with-Medusa",
        "projectPage": null,
        "officialImplementation": true,
        "status": "not-reproduced",
        "notes": [
          "官方仓库包含 OpenPangu–Medusa 模型兼容层、Medusa Head 训练脚本、DeepSpeed 配置和 NPU 推理 Benchmark。",
          "官方 README 提供从 Hugging Face 加载 OpenPangu7B-with-Medusa 权重的方式；模型仓库同时包含基础模型分片和独立 Medusa LM Head 权重。",
          "仓库针对 NPU 预计算固定 Attention Mask、Tree Index 和路径索引，以减少运行时 Host–Device 交互。",
          "官方 README 的部分速度数字与论文 Figure 3 不完全一致；本条目的 mainResults 以论文 arXiv v1 图表为主，README 数字仅作为复现版本差异记录。"
        ]
      },
      "evidence": [
        {
          "claim": "NPU 的静态 Shape、整图编译和显式内存管理模式与原始 Medusa 的动态树构造、动态控制流和 Host 侧路径处理存在冲突。",
          "location": "Sections 1 and 2.3, Pages 1–3",
          "type": "problem"
        },
        {
          "claim": "方法在冻结的 OpenPangu Backbone 后附加多个轻量 Medusa Head，并以位置衰减的多 Head Token 预测损失进行训练。",
          "location": "Section 3.1, Page 3",
          "type": "method"
        },
        {
          "claim": "候选树拓扑、medusa_attn_mask 和 tree_indices 被离线预计算并作为固定 Tensor 加载，使 Tree Attention 能在静态图中执行。",
          "location": "Section 3.2, Figure 2, Page 4",
          "type": "method"
        },
        {
          "claim": "固定 retrieve_indices 配合设备侧 Gather 操作完成接受路径提取，避免 CPU 指针遍历和额外 Host–Device 数据复制。",
          "location": "Section 3.2, Page 4",
          "type": "system"
        },
        {
          "claim": "实验模型为 openPangu-Embedded-7B-V1.1，NPU 服务器由 Kunpeng 920 主机承载，并使用 NVIDIA RTX A6000 作为跨架构对照。",
          "location": "Section 4.1, Pages 4–5",
          "type": "configuration"
        },
        {
          "claim": "最终 50K 自蒸馏、5-Head、保留特殊 Token 的配置取得 74.60% 和 54.10% 的前两个 Head Top-1 Accuracy。",
          "location": "Section 4.2, Table 2, Page 5",
          "type": "training"
        },
        {
          "claim": "Ascend 910B 在 Decode Step=128 时达到 1.35× 端到端加速，但随着长度增加，在 1024 时下降至 0.95×。",
          "location": "Figure 3, Page 6",
          "type": "result"
        },
        {
          "claim": "长序列下 Accept Rate 仅小幅下降，而 Overhead Ratio 明显增加，论文将其归因于长 KV Cache 带来的内存带宽和访问开销。",
          "location": "Section 4.3, Figure 4, Pages 6–7",
          "type": "analysis"
        },
        {
          "claim": "论文公开了官方实现，仓库同时提供训练、NPU 推理和 Hugging Face 模型权重入口。",
          "location": "Abstract, Page 1; Official GitHub README",
          "type": "reproducibility"
        }
      ],
      "notes": [
        "该工作的主要贡献是将已有 Medusa 算法重构为 NPU 友好的静态执行形式，而不是提出新的投机接受规则或新的 Drafter 建模范式。",
        "论文结果表明静态图改造能消除明显的软件执行障碍，但并未解决长上下文下多候选验证本身带来的内存流量增长。",
        "主结果采用论文 arXiv v1 的 Figure 3 数值；官方仓库 README 中不同测试口径的结果未并入主结果。"
      ],
      "qaNotes": [],
      "provenance": {
        "legacyWorkbookRow": null,
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
      "venue": "arXiv",
      "date": "2026-05",
      "url": "https://arxiv.org/abs/2605.16786",
      "localPdf": "../Reference/Lever.pdf",
      "explanationPage": null,
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
      "methodOverview": "面向手机异构硬件，让小型 Drafter 驻留 DRAM、Target 驻留 Flash；使用同时考虑 I/O 与计算成本的 Token Tree 目标和 Early-Exit 预测提前剪除低价值分支，并在 CPU 与 NPU 间流水化执行。",
      "problemStatement": {
        "background": null,
        "priorLimitation": null,
        "goal": null
      },
      "methodComponents": [],
      "characteristics": {
        "requiresTraining": null,
        "drafterType": null,
        "draftGeneration": null,
        "candidateStructure": null,
        "verificationStrategy": null,
        "usesTargetFeatures": null,
        "dynamicDraftLength": null,
        "dynamicVerifyLength": null,
        "lossless": null
      },
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
      "training": {
        "summary": null,
        "data": null,
        "objective": null
      },
      "evaluation": {
        "targetModels": [],
        "benchmarks": [],
        "baselines": [],
        "metrics": [],
        "hardware": [],
        "frameworks": []
      },
      "mainResults": [],
      "limitations": [],
      "relations": {
        "extends": [],
        "comparesAgainst": [],
        "related": [
          "medusa",
          "eagle",
          "eagle-2",
          "eagle-3",
          "specinfer",
          "opt-tree"
        ],
        "compatibleWith": []
      },
      "citations": [
        "medusa",
        "eagle",
        "eagle-2",
        "eagle-3",
        "specinfer",
        "opt-tree"
      ],
      "reproducibility": {
        "codeUrl": null,
        "modelUrl": null,
        "projectPage": null,
        "officialImplementation": null,
        "status": "not-checked",
        "notes": []
      },
      "evidence": [],
      "notes": [],
      "qaNotes": [],
      "provenance": {
        "legacyWorkbookRow": null,
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
