# SDAtlas 架构与数据模型

## 1. 模块边界

```text
legacy/speculative_decoding_papers_2026-07.xlsx ─┐
legacy/tag.txt ───────────────────────────────────┼─> data/catalog.json（唯一维护源）
单位与来源说明 ────────────────────────────┘              │
                                                         │ sync_catalog.py
                                                         v
Reference/*.pdf ──────────────────────────────> assets/js/data.js（生成物）
                                                         │
                                                         v
                                               assets/js/ui.js
                                                 /     |     \
                                        index.js  category.js  explorer.js
                                           |          |           |
                                       index.html category.html explorer.html
```

- `data/catalog.json` 是唯一人工维护的数据源，合并 `legacy/` 中的 Excel 条目、`tag.txt` 子问题 / 贡献和单位增强信息。
- `sync_catalog.py` 确定性生成 `data.js`；它是唯一运行时数据源，但不是编辑入口。
- `ui.js` 提供查找、路由、论文卡片、页眉页脚、搜索匹配、Tooltip，以及零依赖的内联 MathML 渲染。
- 三个页面脚本只负责各自状态与布局，不复制论文字段渲染代码。
- `category.html` 是参数化模板，不为每个分类生成重复文件。
- `explorer.js` 把每一个已选宏观类别或子问题视为一个布尔条件。
- `ui.js` 使用原生 `details` / `summary` 生成论文卡片；关闭状态首行横排简称、会议、时间和贡献概括，单位独占第二行；展开后只渲染对读者有价值的完整论文信息和详细贡献区。
- `renderMathText()` 在输出 HTML 前先转义原文，再只把已识别的公式片段变成原生 MathML；数据层仍保存可搜索、可与 `legacy/tag.txt` 对齐的原始记法。复合公式集中登记在 `MATH_EXPRESSIONS`，常见下标、上标和希腊字母由回退规则自动识别。
- `paper-details.css` 只负责分类页和筛选页的折叠卡片，避免与首页图谱布局互相耦合。

## 2. 两套分类不能混用

| 维度 | 数据来源 | 字段 | 用途 |
|---|---|---|---|
| 宏观类别 | Excel E 列 | `categoryCodes` | 韦恩图、矩阵、分类页、筛选 |
| 子问题 | `legacy/tag.txt` | `tagCodes` | 子问题卡片、分类页、筛选 |
| 原始描述 | Excel F 列 | `workbookTags` | 后台追溯、校验与既有文本搜索，不进入 UI |
| 原始单位 | Excel D 列 | `workbookInstitutions` | 后台追溯、数据校验与既有文本搜索，不进入 UI |
| 校正单位 | 论文作者单位信息 | `institutionDetails` | 排序展示、Tooltip、搜索 |

Excel F 列的原始表头为“标签”，但它不能用于子问题分类。因此代码使用 `workbookTags` 这个刻意不同的名字，避免维护时误用。

## 3. 数据结构

### `categories[]`

- `code`：源表使用的稳定集合代号，例如 `A`。
- `id`：可读稳定标识，查询参数也可使用它。
- `name` / `shortName` / `question` / `description`：页面文案。
- `color` / `softColor`：通过 CSS 自定义属性驱动所有视图。

### `tags[]`

- `code`：`legacy/tag.txt` 中的稳定代号，例如 `V`。
- `id`：可读稳定标识。
- `name` / `zhName` / `description`：子问题解释。
- `color` / `softColor`：子问题页与贡献卡片颜色。

### `papers[]`

- `id` / `index`：内部稳定主键与 Excel 行序号。
- `title` / `shortName` / `venue` / `date` / `url`：Excel 对应列。
- `workbookInstitutions`：Excel D 列的逐字原值，不作为校正单位展示。
- `institutions`：按 `order` 合成的单位摘要；相同 `order` 用 `、`，不同 `order` 用 `→`。
- `institutionDetails[]`：规范化单位明细。`name` 是显示名，`order` 是从 1 开始的展示顺序，`explanation` 是单位说明。相同层级的单位复用同一个 `order`。
- `institutionSource`：用于校正单位信息的论文页面或论文 PDF。
- `categoryCodes`：Excel E 列拆分后的集合代号。
- `workbookTags`：Excel F 列拆分后的原始条目，仅供后台追溯、校验与既有文本搜索。
- `tagCodes`：依据 `legacy/tag.txt` 整理的子问题。
- `categoryContributions`：论文在每个所属宏观类别中的贡献。键必须与 `categoryCodes` 完全一致。
- `tagContributions`：论文在每个子问题下的贡献。键必须与 `tagCodes` 完全一致。
- `localPdf` / `localPdfNote`：本地文件链接或缺失 / 异常说明。

逐宏观类别、逐子问题贡献不是一个通用摘要，因为同一篇论文在不同区域承担的作用不同。首页与详情页读取同一字段，避免文案分叉。

## 4. 路由

分类详情页支持：

```text
category.html?kind=major&id=A
category.html?kind=tag&id=V
```

`id` 可以是 `code` 或数据中的可读 `id`。未知分类会展示错误状态，不会抛出脚本异常。

组合筛选页把状态编码进 URL：

```text
explorer.html?major=A,B&tag=T,H&mode=intersection
```

- `union`：满足任意一个已选条件。
- `intersection`：同时满足每一个已选条件。
- 未选条件：显示全部论文。
- 文本搜索始终作为附加的 AND 条件。

因此链接可以被收藏、复制或从韦恩交叠区域直接打开。

## 5. 视图可扩展性

矩阵、子问题卡片、筛选选项和详情页全部循环读取数据，无固定 A/B/C 或 D/Q/T/V/R/S/H DOM。

标准韦恩图只在恰有三个宏观类别时启用。四集合以上会产生过多不可判读的交叠区域，所以 `index.js` 自动按论文的精确成员组合生成区域板。这一退化策略保证新增类别后功能完整，且不要求改页面模板。

## 6. 维护检查

`scripts/validate_catalog.py` 会检查：

1. 宏观类别、子问题和论文主键唯一；
2. `index` 连续且与 Excel 行对应；
3. 分类引用存在；
4. 两类贡献键分别与引用集合完全一致；
5. `legacy/tag.txt` 定义的子问题集合与目录一致；
6. Excel 九列源值逐字段一致；
7. 单位名称、连续顺位、说明、来源和摘要生成规则完整；
8. `assets/js/data.js` 与合并目录逐字同步；
9. 本地 PDF 路径存在。

`scripts/check_terminology.py` 会读取 `scripts/terminology.json`，检查站点自有文案是否统一使用“投机解码”、`Draft` / `Drafter` 和 `Verify` / `Verifier`。论文原标题、Excel F 列原始条目和公式变量保留原文，完整规范见 [`TERMINOLOGY.md`](TERMINOLOGY.md)。

修改目录后的固定流程是：

```bash
python3 scripts/sync_catalog.py
python3 scripts/validate_catalog.py
python3 scripts/check_terminology.py
```

之后再在浏览器中检查三种页面和移动端布局。CI 或提交前检查可用 `python3 scripts/sync_catalog.py --check` 阻止忘记生成运行文件。
