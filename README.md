# SDAtlas

一个零依赖、可直接静态部署的投机解码论文导航站。它提供：

- 宏观类别的韦恩图 / 论文矩阵切换；
- 来自归档源文件 [`legacy/tag.txt`](legacy/tag.txt) 的 D / Q / T / V / R / S / H 子问题导航；
- 查询参数驱动的宏观类别与子问题详情页；
- 宏观类别、子问题混合多选的并集 / 交集筛选；
- 默认折叠的论文摘要卡片：首行横向展示简称、会议、时间和贡献，第二行展示相关单位；
- 展开后展示标题、宏观类别、子问题、单位说明、详细贡献以及论文 / 本地 PDF 链接。
- 以浏览器原生 MathML 显示贡献文字中的上下标、求和、乘积、范数和复合公式，无需联网加载公式库。

## 打开方式

可以直接双击 `index.html`。为了获得与部署环境最接近的行为，建议在仓库根目录运行：

```bash
python3 -m http.server 8000 --directory SDAtlas
```

然后打开 `http://localhost:8000/`。

## 页面

- `index.html`：论文索引、韦恩图、论文矩阵和子问题卡片。
- `category.html?kind=major&id=A`：宏观类别详情。
- `category.html?kind=tag&id=V`：子问题详情。
- `explorer.html`：多选条件的并集 / 交集筛选。

详情页没有为每个分类复制一份 HTML。新增分类后，只要数据引用有效，链接和详情页就会自动生成。

## 数据口径

- [`data/catalog.json`](data/catalog.json) 是归档 Excel 与 `legacy/tag.txt` 对齐后的唯一维护源；页面使用的 `assets/js/data.js` 由它确定性生成。
- 宏观类别只读取 Excel E 列的 A / B / C。
- 子问题只读取 `legacy/tag.txt` 中定义的 D / Q / T / V / R / S / H。
- Excel F 列保存在 `workbookTags`，供后台校验与既有文本搜索使用，不在论文卡片中展示，也不参与子问题导航或分类筛选。
- Excel D 列原值保存在 `workbookInstitutions`；校正后的单位摘要、逐单位顺位、说明和论文来源分别保存在 `institutions`、`institutionDetails` 与 `institutionSource`。
- `Reference/` 内 PDF 通过相对路径直接链接。`Reference/EAGLE.pdf` 实际是 Fused3S，并非 EAGLE，所以站点明确提示而不提供错误链接。

修改合并目录后，先生成浏览器运行文件，再运行检查：

```bash
python3 SDAtlas/scripts/sync_catalog.py
python3 SDAtlas/scripts/validate_catalog.py
python3 SDAtlas/scripts/check_terminology.py
```

三个脚本都只使用 Python 标准库。同步脚本把 JSON 包装为支持 `file://` 的 `data.js`；目录检查会验证所有主键、分类引用、逐项贡献、单位顺位、逐单位说明、来源、本地 PDF，并把九列源值逐条与 Excel 比对；术语检查会读取可维护词表，检查站点自有文案中是否混入禁用译法或错误大小写。论文原标题、Excel F 列原始条目和公式变量不在自动替换范围内。

站点术语统一使用“投机解码”、`Draft` / `Drafter` 与 `Verify` / `Verifier`。规范、替换表和例外范围见 [`docs/TERMINOLOGY.md`](docs/TERMINOLOGY.md)，机器可读词表位于 [`scripts/terminology.json`](scripts/terminology.json)。

## 扩展数据

唯一人工维护入口是 [`data/catalog.json`](data/catalog.json)。不要直接编辑 `assets/js/data.js`；后者是静态页面的生成产物。原始 Excel 与 `tag.txt` 统一保存在 [`legacy/`](legacy/) 供追溯和校验，避免与页面入口混放。

### 新增论文

在 `papers` 末尾添加对象，并提供：

- 稳定且唯一的 `id` 与连续 `index`；
- Excel 九列对应字段，其中 D 列原值写入 `workbookInstitutions`；
- 更新后的 `institutions`、逐单位 `institutionDetails` 与 `institutionSource`；
- `categoryCodes` 与逐项 `categoryContributions`；
- `tagCodes` 与逐项 `tagContributions`；
- 可用时填写相对于 `SDAtlas/` 页面的 `localPdf`。

运行 `python3 scripts/sync_catalog.py` 后，页面会自动更新计数、韦恩区域、矩阵、子问题卡片、详情页和筛选结果。

`institutionDetails` 中每项必须包含唯一的 `name`、从 1 开始且非降序的 `order`、以及用于 Tooltip 的 `explanation`。同一顺位的单位使用相同 `order`；`institutions` 则按“同顺位用 `、`、不同顺位用 `→`”生成摘要。验证器会阻止摘要与明细漂移。

贡献文字中的常见论文记法（例如 `L_gen`、`r^(i−1)`、`Σ_r`）会在展示层转换为 MathML，目录中的原始文字仍可搜索和校验。新增更复杂的表达式时，可在 `assets/js/ui.js` 的 `MATH_EXPRESSIONS` 中登记完整片段；无需修改各页面模板。

### 新增子问题

1. 在 `tags` 中添加元数据与稳定 `code`。
2. 在论文的 `tagCodes` 中引用。
3. 为每个引用补上同名 `tagContributions`。

筛选器、子问题总览和详情页不需要修改。

### 新增宏观类别

1. 在 `categories` 中添加元数据与稳定 `code`。
2. 在论文的 `categoryCodes` 中引用。
3. 为每个引用补上同名 `categoryContributions`。

三个宏观类别时首页使用韦恩图；类别数量不为三个时，代码自动使用“精确交叠区域板”，避免四集合以上的韦恩图不可读。表格视图始终按任意类别数动态生成。

更完整的模块边界和字段说明见 [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)。
