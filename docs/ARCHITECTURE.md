# SDAtlas 架构与数据模型

## 1. 模块边界

```text
speculative_decoding_papers_2026-07.xlsx ─┐
tag.txt ───────────────────────────────────┼─> assets/js/data.js
Reference/*.pdf ───────────────────────────┘           │
                                                       v
                                             assets/js/ui.js
                                               /     |     \
                                      index.js  category.js  explorer.js
                                         |          |           |
                                     index.html category.html explorer.html
```

- `data.js` 是唯一运行时数据源，不含视图逻辑。
- `ui.js` 提供查找、路由、论文卡片、页眉页脚、搜索匹配和 Tooltip。
- 三个页面脚本只负责各自状态与布局，不复制论文字段渲染代码。
- `category.html` 是参数化模板，不为每个分类生成重复文件。
- `explorer.js` 把每一个已选大类别或标签视为一个布尔条件。

## 2. 两套分类不能混用

| 维度 | 数据来源 | 字段 | 用途 |
|---|---|---|---|
| 大类别 | Excel E 列 | `categoryCodes` | 韦恩图、矩阵、分类页、筛选 |
| 小标签 | `tag.txt` | `tagCodes` | 标签卡片、分类页、筛选 |
| 原始描述 | Excel F 列 | `workbookTags` | 只在论文卡片中展示 |

Excel F 列虽然原表表头也叫“标签”，但按需求不能用于小标签分类。因此代码使用 `workbookTags` 这个刻意不同的名字，避免维护时误用。

## 3. 数据结构

### `categories[]`

- `code`：源表使用的稳定集合代号，例如 `A`。
- `id`：可读稳定标识，查询参数也可使用它。
- `name` / `shortName` / `question` / `description`：页面文案。
- `color` / `softColor`：通过 CSS 自定义属性驱动所有视图。

### `tags[]`

- `code`：`tag.txt` 中的稳定代号，例如 `V`。
- `id`：可读稳定标识。
- `name` / `zhName` / `description`：标签解释。
- `color` / `softColor`：标签页与贡献卡片颜色。

### `papers[]`

- `id` / `index`：内部稳定主键与 Excel 行序号。
- `title` / `shortName` / `institutions` / `venue` / `date` / `url`：Excel 对应列。
- `categoryCodes`：Excel E 列拆分后的集合代号。
- `workbookTags`：Excel F 列拆分后的原始条目，仅展示。
- `tagCodes`：依据 `tag.txt` 整理的小标签。
- `categoryContributions`：论文在每个所属大类别区域中的贡献。键必须与 `categoryCodes` 完全一致。
- `tagContributions`：论文在每个小标签下的贡献。键必须与 `tagCodes` 完全一致。
- `localPdf` / `localPdfNote`：本地文件链接或缺失 / 异常说明。

逐类别、逐标签贡献不是一个通用摘要，因为同一篇论文在不同区域承担的作用不同。首页悬停提示和详情页贡献面板都读取同一字段，避免文案分叉。

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

矩阵、标签卡片、筛选选项和详情页全部循环读取数据，无固定 A/B/C 或 D/Q/T/V/R/S/H DOM。

标准韦恩图只在恰有三个大类别时启用。四集合以上会产生过多不可判读的交叠区域，所以 `index.js` 自动按论文的精确成员组合生成区域板。这一退化策略保证新增类别后功能完整，且不要求改页面模板。

## 6. 维护检查

`scripts/validate_catalog.py` 会检查：

1. 分类、标签和论文主键唯一；
2. `index` 连续且与 Excel 行对应；
3. 分类引用存在；
4. 两类贡献键分别与引用集合完全一致；
5. `tag.txt` 定义的标签集合与目录一致；
6. Excel 九列逐字段一致；
7. 本地 PDF 路径存在。

修改目录后应先运行验证脚本，再在浏览器中检查三种页面和移动端布局。
