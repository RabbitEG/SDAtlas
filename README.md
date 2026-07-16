# SDAtlas

SDAtlas 是一个零依赖、可直接静态部署的投机解码论文图谱。站点以统一的 A–E“子问题”组织论文，同时提供完整论文目录、单篇论文页、站内引用关系和组合筛选。

主要功能包括：

- 首页按 A–E 子问题浏览代表论文及贡献概括；
- 子问题详情页展示该问题下的全部论文；
- `papers.html` 提供可搜索、可折叠的完整论文目录；
- `paper.html` 集中展示单篇论文的作者、直观方法概述、单位、详细贡献、引用与被引用关系；
- 组合筛选页支持对子问题进行多选，并按并集或交集筛选；
- 折叠论文卡片展示论文名、会议、年份和当前语境下的贡献概括，展开后再展示完整信息；
- 浏览器原生 MathML 渲染贡献文字中的公式，无需联网加载公式库。

## 打开方式

可以直接打开 `index.html`。为了获得与部署环境最接近的行为，建议在仓库根目录运行：

```bash
python3 -m http.server 8000 --directory SDAtlas
```

然后访问 `http://localhost:8000/`。

## 页面与路由

- `index.html`：A–E 子问题导航与站点入口。
- `category.html?id=A`：参数化子问题详情页；`id` 可使用子问题 `code` 或稳定 `id`。
- `papers.html`：全部论文列表。
- `paper.html?id=medusa`：单篇论文详情与站内引用关系。
- `explorer.html?subproblem=A,B&mode=intersection`：组合筛选页。

详情页使用参数化模板，因此新增论文或调整论文所属子问题时，不需要复制 HTML。

## Schema v4 数据结构

人工维护的数据分为两层：

- [`data/catalog.json`](data/catalog.json) 只保存 `schemaVersion`、站点 `meta` 和统一的 `subproblems` 定义；
- [`data/papers/`](data/papers/) 中每篇论文各有一个 `<id>.json`，互不耦合，适合独立新增、审阅和维护。

[`data/catalog.generated.json`](data/catalog.generated.json) 与 `assets/js/data.js` 都是生成物，不应直接编辑。同步脚本会读取元数据和所有论文源文件，补充派生字段后确定性地生成这两个文件：前者方便程序与读者使用，后者兼容浏览器直接通过 `file://` 打开。

### 论文源文件

新增论文时，以 [`data/paper-template.json`](data/paper-template.json) 为模板，在 `data/papers/` 新建与论文 `id` 同名的 JSON。核心字段包括：

- `id` / `index`：稳定主键与连续展示顺序；文件名必须与 `id` 一致；
- `title` / `shortName` / `venue` / `date` / `url`：书目信息；
- `authors[]`：完整作者列表；
- `methodOverview`：一至三句话的学术但直观的方法概述，供论文总览和详情页使用；
- `notes[]`：经过核实、需要额外告知读者的备注，可为空；
- `institutionDetails[]` / `institutionSource`：单位顺位、解释和来源；
- `subproblemContributions`：论文涉及的 A–E 子问题及对应贡献；
- `citations[]`：当前图谱范围内由该论文指向被引用论文的有向边；
- `explanationPage`：可选的站内论文解读 HTML，相对于 `SDAtlas/`；未提供或设为 `null` 时不显示入口；
- `localPdf`：相对于 `SDAtlas/` 的本地 PDF 路径。没有正确本地文件时改用 `localPdfNote` 说明原因。

每条 `subproblemContributions.<code>` 都包含两种粒度：

- `summary`：折叠卡片和 Tooltip 使用的概括性贡献；
- `detail`：论文展开区域与详情页使用的相对详细说明。

`subproblemCodes`、`institutions` 和 `citedBy` 不写入论文源文件。它们分别由贡献键、单位明细和全站 `citations` 自动派生，避免维护两份会漂移的数据。独立解读页统一放在 [`explanations/`](explanations/)；建议使用自包含 HTML，文件名可以与论文简称一致。

### 引用口径

`citations` 只记录当前图谱已收录论文之间、经论文正文或参考文献核实的关系。方向为：若论文 A 的 `citations` 包含 B，则表示“A 引用 B”。构建时会自动在 B 的 `citedBy` 中加入 A。

没有收录到图谱的外部参考文献不写入该数组；尚不能确定的引用也不应猜测，可在 `notes` 中说明核实状态。

## 修改与检查

修改 `data/catalog.json` 或任一论文源文件后运行：

```bash
python3 scripts/sync_catalog.py
python3 scripts/validate_catalog.py
python3 scripts/check_terminology.py
```

三个脚本只依赖 Python 标准库：

- `sync_catalog.py` 读取拆分源文件，派生反向引用、单位摘要和子问题代码，并更新两份生成物；
- `validate_catalog.py` 检查 schema v4、A–E 定义、主键与索引、`summary/detail`、作者、备注、引用、单位、本地 PDF、可选解读页以及生成物同步状态；
- `check_terminology.py` 检查元数据、每篇论文的自有文案和界面文案是否遵循统一术语。

提交前可以额外运行：

```bash
python3 scripts/sync_catalog.py --check
```

该命令只检查生成物是否过期，不会写文件。

站点统一使用“投机解码”、`Draft` / `Drafter`、`Verify` / `Verifier` 和 `Training`。规范、快速替换表与来源例外见 [`docs/TERMINOLOGY.md`](docs/TERMINOLOGY.md)，机器可读词表位于 [`scripts/terminology.json`](scripts/terminology.json)。更完整的模块边界与字段说明见 [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)。
