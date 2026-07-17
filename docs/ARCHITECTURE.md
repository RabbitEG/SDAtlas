# SDAtlas 架构与数据模型

## 1. 构建边界

```text
data/catalog.json（meta + A–E subproblems） ─┐
                                             ├─> scripts/sync_catalog.py
data/papers/<id>.json（每论文一个文件） ──────┘             │
                                                            ├─> data/catalog.generated.json
                                                            └─> assets/js/data.js
                                                                       │
                                                                       v
                                                                 assets/js/ui.js
                                                           /      /      |       \
                                                    index.js category.js papers.js paper.js
                                                                          \
                                                                        explorer.js
```

- `data/catalog.json` 只维护站点元数据和统一子问题定义，不包含论文数组。
- `data/papers/*.json` 是论文事实与 SDAtlas 解读的维护源；一个文件只描述一篇论文。
- `data/paper-template.json` 给出新增论文所需字段和推荐形状。
- `explanations/` 保存可选的单篇论文独立解读 HTML，不参与目录生成；论文通过 `explanationPage` 显式关联。
- `sync_catalog.py` 读取拆分源，检查跨文件引用并生成完整目录。
- `data/catalog.generated.json` 与 `assets/js/data.js` 是同一运行目录的两种包装，均不可手工编辑。
- `ui.js` 负责通用查找、路由、论文卡片、Tooltip 和 MathML；`citation-graph.js` 负责引用前驱闭包、任意深度传递约简、拓扑分层、总线式直角布线、关系提示以及缩放和平移，各页面脚本只管理自身状态与布局。
- `Reference/` 不参与元数据合并；论文通过 `localPdf` 显式链接相应文件，验证器负责检查路径。

这种拆分把“子问题定义”和“单篇论文维护”分离。新增论文只产生一个独立 diff，不会重写大型目录文件；生成物仍为静态页面提供一次性、无请求的完整数据。

## 2. 统一子问题模型

Schema v5 继续使用单一研究问题体系。所有页面、贡献文字和筛选条件都使用同一组 `subproblems`，当前固定为：

| Code | 子问题 | 主要范围 |
|---|---|---|
| A | Draft 生成与建模 | Drafter 架构、特征条件、并行生成与候选分布 |
| B | 候选组织与树搜索 | 候选块、Token Tree、路径评分、扩树与剪枝 |
| C | Verify 策略与效率 | 接受规则、动态长度、节点预算、状态同步与输出等价性 |
| D | 系统优化 | Batch、流水线、调度、内存、KV Cache 与硬件适配 |
| E | Training 优化 | 目标、数据、蒸馏、损失、课程学习与稳定化 |

页面统一称其为“子问题”。`code` 是紧凑、稳定的筛选键，`id` 是可读稳定标识；两者都不应因展示文案调整而改变。

## 3. 源数据结构

### `data/catalog.json`

- `schemaVersion`：当前为 `5`。
- `meta`：标题、更新时间、源目录和生成目录位置、引用口径等站点级信息。
- `subproblems[]`：A–E 定义。每项包含 `code`、`id`、`name`、`shortName`、`question`、`description`、`color` 和 `softColor`。

该文件不包含 `papers`；若出现论文数组，构建与验证都应失败。

### `data/papers/<id>.json`

- `id` / `index`：稳定主键与从 1 开始的连续展示顺序；文件名必须等于 `id`。
- `title` / `shortName` / `authors[]` / `venue` / `date` / `url`：论文书目信息；`date` 统一为 `YYYY-MM`。
- `localPdf`：相对于 `SDAtlas/` 的正确本地 PDF；尚无可用文件时显式写 `null`。
- `explanationPage`：SDAtlas 保留的可选扩展，用于链接站内独立解读 HTML；没有时写 `null`。
- `institutionDetails[]` / `institutionSource`：单位名称、论文署名顺序、解释及论文首页或官方来源。
- `methodOverview`：一至两句话回答“基于什么、改了哪里、目标是什么”。
- `problemStatement`：以 `background`、`priorLimitation`、`goal` 区分问题背景、前序限制和目标。
- `methodComponents[]`：2–5 个合适粒度的方法组件；每项记录 `name`、`stage`、`purpose`、`mechanism` 与 `differenceFromPrior`。
- `characteristics`：用于横向筛选的布尔或枚举特征，包括 Drafter 类型、Draft 方式、候选结构和 Verify 策略等。
- `subproblemContributions`：以 A–E `code` 为键，仅创建论文真正涉及的子问题。
- `training`：紧凑记录 Training 概括、数据和目标；没有独立信息时相应字段写 `null`。
- `evaluation` / `mainResults[]`：分别记录实验覆盖范围和少量可比较的代表性结果。
- `limitations[]`：区分限制类型、说明及 `paper` / `analysis` / `observed-data` 来源性质。
- `relations`：分别记录 `extends`、`comparesAgainst`、`related` 与 `compatibleWith`。本次迁移只对尚未人工细分关系的旧条目使用 `citations` 初始化 `related`；已有人工关系数据保持原样，后续也不再自动同步。
- `citations[]`：站内有向引用目标，与方法关系字段保持独立。
- `reproducibility`：代码、模型、项目页、官方实现判断及当前复现状态。
- `evidence[]`：对重要方法、配置、结果或限制记录可回查的位置。
- `notes[]`：个人研究笔记和临时判断；不重复方法概述。
- `qaNotes[]`：阅读过程中积累的问答对；每项严格包含 `question` 和 `answer`，其中 `answer` 可以为 `null`。
- `provenance`：旧表格行号和单位原始文本，仅用于迁移追踪，不面向普通读者展示。

### 空值与枚举约定

- 已确认存在：填写实际值；已确认不存在：使用 `false` 或空数组。
- 尚未核实的布尔、枚举或文本：使用 `null`，不能用空字符串或擅自写成 `false`。
- 论文不涉及某一子问题：不创建对应的 `subproblemContributions` 键。
- `citations` 决定 CiteGraph 的有向边；`relations` 作为独立的方法关系，在详情页完整展示，并在同一目标同时属于引用时作为边的补充标注。二者仍需独立维护。
- `characteristics`、限制类型、证据类型与复现状态的允许值由 `scripts/validate_catalog.py` 统一检查。

每条贡献必须同时提供：

```json
{
  "A": {
    "summary": "折叠列表中的单句贡献概括。",
    "detail": "展开卡片和论文详情页中的相对详细贡献。"
  }
}
```

`summary` 负责快速浏览，`detail` 负责解释机制、取舍与效果；两者分开维护，避免 UI 从长段落中截断出不完整句子。

## 4. 生成字段

下列字段只存在于生成目录：

- `subproblemCodes`：按 `subproblemContributions` 的键顺序派生；
- `institutions`：按 `institutionDetails.order` 合成，相同顺位用 `、`，不同顺位用 ` → `；
- `citedBy`：反转全站 `citations` 得到，并按引用论文的 `index` 排列。

源文件若手写这些字段，构建会失败。`citedBy`、引用计数和 CiteGraph 结构都只由 `citations` 派生；`relations` 不会凭空生成引用边。

## 5. 引用与论文关系模型

引用边只覆盖当前图谱中的论文，并且必须由论文正文或参考文献核实。边的方向为：

```text
A.citations = [B]  =>  A 引用 B  =>  B.citedBy 自动包含 A
```

外部参考文献不进入 `citations`。无法确认的候选边不应写入；需要保留调查结论时，可用 `notes` 清楚说明“不确定”或“未计入”的原因。

方法关系使用四类有向记录：

| 字段 | 图中提示 | 含义 |
|---|---|---|
| `extends` | 直接扩展 | 方法直接建立在目标论文之上 |
| `comparesAgainst` | 实验比较 | 将目标论文作为主要实验基线 |
| `related` | 相关工作 | 解决相近问题或当前尚未细分的关系 |
| `compatibleWith` | 可组合 | 已有明确组合点的正交方法 |

同一来源和目标可以同时具有多种 relation。详情页分别展示四类方法关系；若该目标也存在于 `citations`，CiteGraph 会在同一引用边上列出全部适用类型。尚未人工细分关系的旧条目以 `citations` 一次性初始化 `related`；已有人工关系分类的条目不参与这次复制，也不会建立永久同步规则。

### 显示层约简与布局

`citation-graph.js` 将页面传入的论文视为根节点，并以全站论文为可选范围递归追踪其 `citations`。因此图中包含根论文及全部已收录引用前驱，但不会加入仅有入边、也就是纯粹在后来引用根论文的工作。随后逐边检查是否存在不使用当前边的任意深度替代引用路径；若存在，则只在本次显示中省略直接边。源数据及生成数据始终保持完整；若引用数据意外形成环，环内边仍会保留。

约简后的图以强连通分量压缩图计算拓扑层级：被引用论文位于左侧，引用来源位于右侧。层内使用多轮重心排序降低交叉；一个来源存在多条显示边时先绘制一段共享总线，再从同一汇合点分出直角路径。跨层连线走节点区域上方或下方的独立通道，尽量避免穿过论文块。透明加宽命中线保证低缩放下仍可悬停或键盘聚焦；放大时显示引用或 relation 字段名。

## 6. 页面职责与路由

- `index.html`：统一子问题总览和主要入口。
- `category.html?id=A`：一个参数化模板覆盖所有子问题；未知 `id` 显示错误状态。
- `papers.html`：全部论文的搜索与折叠列表。
- `paper.html?id=<paper-id>`：展示除 `id`、`index`、`provenance` 等内部维护元数据外的完整读者条目；引用只以计数和 CiteGraph 呈现，不恢复文字清单。
- `explorer.html?subproblem=A,B&mode=intersection`：多选筛选。

筛选状态写入 URL：

- `mode=union`：满足任一已选子问题；
- `mode=intersection`：同时满足所有已选子问题；
- 未选择子问题：显示全部论文；
- 文本搜索作为附加的 AND 条件。

`ui.js` 使用原生 `details` / `summary` 生成通用论文卡片。关闭状态展示论文名、会议、年份、当前语境的 `summary` 和单位；若该论文配置了 `explanationPage`，单位右侧同时显示“论文解读”入口。单篇论文页按 schema v5 分区展示问题、组件、特征、Training、实验、结果、局限、方法关系、复现、证据、阅读问答与笔记；空值显示“未记录”，而非静默漏掉字段。

## 7. 新增论文流程

1. 复制 `data/paper-template.json`，在 `data/papers/` 创建 `<id>.json`。
2. 从论文首页填写书目信息、作者、单位、日期和链接。
3. 从已有可靠记录填写 `methodOverview`、问题陈述、方法组件、特征与子问题贡献；未核实项保留 `null` 或空数组。
4. 再填写 Training、实验范围、代表性结果、限制、方法关系、证据与复现状态。
5. 分别填写已核实的 `citations` 与四类 `relations`；新论文不得把二者机械同步。
6. 链接正确本地 PDF；没有可用文件时将 `localPdf` 写为 `null`。
7. 如有独立解读页，将 HTML 放入 `explanations/` 并填写 `explanationPage`；没有则设为 `null`。
8. 运行 `python3 scripts/update_site.py` 一键同步并验证；需要严格编辑检查时附加 `--with-terminology`。

无需修改页面模板、生成目录或反向引用。

## 8. 自动检查

`scripts/validate_catalog.py` 检查：

1. schema v5、`meta` 与 A–E 子问题定义；
2. 文件名、论文 `id`、连续 `index` 和必要书目信息；
3. 方法问题、组件、通用特征、Training 和实验字段的固定形状与空值规则；
4. 所属子问题存在，且每项贡献同时具有 `summary` / `detail`；
5. 结果、限制、关系、复现、证据和 `qaNotes` 问答对的结构、枚举、URL 与站内 ID；
6. `citations` 无重复、自引或未知目标，并与 `relations` 分开维护；
7. 单位名称、顺位、解释、来源与派生摘要；
8. 本地 PDF 存在或显式为 `null`；可选的 `explanationPage` 指向站内现有 HTML；
9. `subproblemCodes`、`institutions`、`citedBy` 的派生结果；
10. 聚合 JSON 与浏览器运行文件和源数据逐字同步。

`scripts/check_terminology.py` 结构化扫描 `catalog.json` 和全部论文源文件（包括 `qaNotes`）中的 SDAtlas 自有文案，并读取 `scripts/terminology.json` 统一“投机解码”、`Draft` / `Drafter`、`Verify` / `Verifier` 与 `Training`。来源标题、作者名、代码标识符和数学变量保留原文。

日常固定维护流程为：

```bash
python3 scripts/update_site.py
```

底层等价步骤为：

```bash
python3 scripts/sync_catalog.py
python3 scripts/validate_catalog.py
python3 scripts/check_terminology.py
```

CI 或提交前还可运行 `python3 scripts/sync_catalog.py --check`，阻止遗漏生成文件。
