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
- `ui.js` 负责通用查找、路由、论文卡片、Tooltip 和 MathML；`citation-graph.js` 负责传递约简、拓扑分层、交叉最少化、避让连线以及缩放和平移，各页面脚本只管理自身状态与布局。
- `Reference/` 不参与元数据合并；论文通过 `localPdf` 显式链接相应文件，验证器负责检查路径。

这种拆分把“子问题定义”和“单篇论文维护”分离。新增论文只产生一个独立 diff，不会重写大型目录文件；生成物仍为静态页面提供一次性、无请求的完整数据。

## 2. 统一子问题模型

Schema v4 不再维护两套研究问题体系。所有页面、贡献文字和筛选条件都使用同一组 `subproblems`，当前固定为：

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

- `schemaVersion`：当前为 `4`。
- `meta`：标题、更新时间、源目录和生成目录位置、引用口径等站点级信息。
- `subproblems[]`：A–E 定义。每项包含 `code`、`id`、`name`、`shortName`、`question`、`description`、`color` 和 `softColor`。

该文件不包含 `papers`；若出现论文数组，构建与验证都应失败。

### `data/papers/<id>.json`

- `id`：小写字母、数字和连字符组成的稳定主键，同时也是文件名。
- `index`：从 1 开始的连续展示顺序。
- `title` / `shortName` / `venue` / `date` / `url`：论文书目信息。
- `authors[]`：按论文署名顺序记录的完整作者列表。
- `methodOverview`：独立于具体子问题的一至三句直观方法概述。它应准确说明核心机制，也要让非该分支专家能快速理解。
- `notes[]`：需要向读者披露的核实备注，可为空；不用于替代方法或贡献字段。
- `institutionDetails[]`：规范化单位明细。`name` 是显示名，`order` 是从 1 开始的顺位，`explanation` 说明该单位与作者或工作的关系。同一顺位复用同一 `order`。
- `institutionSource`：单位信息的可追溯 HTTP(S) 来源。
- `subproblemContributions`：以 A–E `code` 为键。键本身就是论文所属子问题集合。
- `citations[]`：站内有向引用的目标论文 `id`。
- `explanationPage`：可选的站内独立解读页路径。省略或设为 `null` 时，列表与详情页均不生成入口。
- `localPdf` / `localPdfNote`：正确本地 PDF 的相对路径；若没有可用文件，则用说明字段替代。
- `provenance`：可选的历史来源或迁移记录，不参与页面子问题展示与核心校验。

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

源文件若手写这些字段，构建会失败。唯一派生规则保证论文列表、详情页和引用图使用相同事实。

## 5. 引用模型

引用边只覆盖当前图谱中的论文，并且必须由论文正文或参考文献核实。边的方向为：

```text
A.citations = [B]  =>  A 引用 B  =>  B.citedBy 自动包含 A
```

外部参考文献不进入 `citations`。无法确认的候选边不应写入；需要保留调查结论时，可用 `notes` 清楚说明“不确定”或“未计入”的原因。这样引用图表达的是可追溯事实，而不是方法相似度。

### 显示层约简与布局

`citation-graph.js` 每次接收当前页面的论文集合后，先构造集合内部的原始边，再逐边检查是否存在不使用该边的替代路径。存在替代路径的边仅从本次渲染中省略；源数据及生成数据保持完整。若数据意外形成环，环内边会保留，避免对非 DAG 图做不唯一的强制约简。

约简后的图以强连通分量压缩图计算拓扑层级：被引用论文位于左侧，引用它的论文位于右侧。层内使用多轮重心排序降低交叉；相邻层连线只经过列间空隙，跨层连线走节点区域上方或下方的独立通道，尽量避免穿过论文块。视口通过 CSS Transform 实现按钮、滚轮和键盘缩放，并支持鼠标或触控拖动平移。

## 6. 页面职责与路由

- `index.html`：统一子问题总览和主要入口。
- `category.html?id=A`：一个参数化模板覆盖所有子问题；未知 `id` 显示错误状态。
- `papers.html`：全部论文的搜索与折叠列表。
- `paper.html?id=<paper-id>`：单篇论文的完整作者、方法概述、贡献、单位、链接、`citations` 与 `citedBy`。
- `explorer.html?subproblem=A,B&mode=intersection`：多选筛选。

筛选状态写入 URL：

- `mode=union`：满足任一已选子问题；
- `mode=intersection`：同时满足所有已选子问题；
- 未选择子问题：显示全部论文；
- 文本搜索作为附加的 AND 条件。

`ui.js` 使用原生 `details` / `summary` 生成通用论文卡片。关闭状态展示论文名、会议、年份、当前语境的 `summary` 和单位；若该论文配置了 `explanationPage`，单位右侧同时显示“论文解读”入口。展开状态补充完整书目信息、作者、单位、`methodOverview` 和相关 `detail`。单篇论文页复用同一批格式化与查找函数，不复制数据。

## 7. 新增论文流程

1. 复制 `data/paper-template.json` 的字段形状，在 `data/papers/` 创建 `<id>.json`。
2. 填写完整作者列表和直观 `methodOverview`。
3. 为每个所属子问题填写 `summary` 与 `detail`。
4. 只加入已核实且已收录的 `citations` 目标。
5. 链接正确本地 PDF；没有时填写 `localPdfNote`。
6. 如有独立解读页，将 HTML 放入 `explanations/` 并填写 `explanationPage`；没有则省略或设为 `null`。
7. 运行同步、目录验证和术语检查。

无需修改页面模板、生成目录或反向引用。

## 8. 自动检查

`scripts/validate_catalog.py` 检查：

1. schema v4、`meta` 与 A–E 子问题定义；
2. 文件名、论文 `id`、连续 `index` 和必要书目信息；
3. `authors`、`notes`、`methodOverview` 的结构；
4. 所属子问题存在，且每项贡献同时具有 `summary` / `detail`；
5. `citations` 无重复、自引或未知目标；
6. 单位名称、顺位、解释、来源与派生摘要；
7. 本地 PDF 存在，或有明确的缺失说明；可选的 `explanationPage` 指向站内现有 HTML；
8. `subproblemCodes`、`institutions`、`citedBy` 的派生结果；
9. 聚合 JSON 与浏览器运行文件和源数据逐字同步。

`scripts/check_terminology.py` 结构化扫描 `catalog.json` 和全部论文源文件中的 SDAtlas 自有文案，并读取 `scripts/terminology.json` 统一“投机解码”、`Draft` / `Drafter`、`Verify` / `Verifier` 与 `Training`。来源标题、作者名、代码标识符和数学变量保留原文。

固定维护流程为：

```bash
python3 scripts/sync_catalog.py
python3 scripts/validate_catalog.py
python3 scripts/check_terminology.py
```

CI 或提交前还可运行 `python3 scripts/sync_catalog.py --check`，阻止遗漏生成文件。
