# SDAtlas

一个零依赖、可直接静态部署的投机解码论文导航站。它提供：

- 大类别的韦恩图 / 论文矩阵切换；
- 来自 `tag.txt` 的 D / Q / T / V / R / S / H 小标签导航；
- 查询参数驱动的大类别与小标签详情页；
- 大类别、小标签混合多选的并集 / 交集筛选；
- 默认折叠的论文摘要卡片：先展示标题、会议、年份和当前分类创新，展开后再显示详情；
- Excel 九列、区域贡献、逐标签贡献以及本地 PDF 链接的完整展示。

## 打开方式

可以直接双击 `index.html`。为了获得与部署环境最接近的行为，建议在仓库根目录运行：

```bash
python3 -m http.server 8000 --directory SDAtlas
```

然后打开 `http://localhost:8000/`。

## 页面

- `index.html`：分类总览、韦恩图、论文矩阵和小标签卡片。
- `category.html?kind=major&id=A`：大类别详情。
- `category.html?kind=tag&id=V`：小标签详情。
- `explorer.html`：多选条件的并集 / 交集筛选。

详情页没有为每个分类复制一份 HTML。新增分类后，只要数据引用有效，链接和详情页就会自动生成。

## 数据口径

- 大类别只读取 Excel E 列的 A / B / C。
- 小标签只读取 `tag.txt` 中定义的 D / Q / T / V / R / S / H。
- Excel F 列保存在 `workbookTags`，仅作为源表原始条目展示，不参与小标签导航或筛选。
- `Reference/` 内 PDF 通过相对路径直接链接。`Reference/EAGLE.pdf` 实际是 Fused3S，并非 EAGLE，所以站点明确提示而不提供错误链接。

运行数据检查：

```bash
python3 SDAtlas/scripts/validate_catalog.py
python3 SDAtlas/scripts/check_terminology.py
```

两个检查脚本都只使用 Python 标准库。目录检查会验证所有主键、分类引用、逐项贡献、本地 PDF，并把目录中的九个字段逐条与 Excel 比对；术语检查会读取可维护词表，检查站点自有文案中是否混入禁用译法或错误大小写。论文原标题、Excel F 列原始条目和公式变量不在自动替换范围内。

站点术语统一使用“投机解码”、`Draft` / `Drafter` 与 `Verify` / `Verifier`。规范、替换表和例外范围见 [`docs/TERMINOLOGY.md`](docs/TERMINOLOGY.md)，机器可读词表位于 [`scripts/terminology.json`](scripts/terminology.json)。

## 扩展数据

唯一目录入口是 `assets/js/data.js`。它是一个 JavaScript 全局赋值，但赋值右侧保持严格 JSON，因此既支持 `file://`，又能被验证脚本读取。

### 新增论文

在 `papers` 末尾添加对象，并提供：

- 稳定且唯一的 `id` 与连续 `index`；
- Excel 九列对应字段；
- `categoryCodes` 与逐项 `categoryContributions`；
- `tagCodes` 与逐项 `tagContributions`；
- 可用时填写相对于 `SDAtlas/` 页面的 `localPdf`。

页面会自动更新计数、韦恩区域、矩阵、标签卡片、详情页和筛选结果。

### 新增小标签

1. 在 `tags` 中添加元数据与稳定 `code`。
2. 在论文的 `tagCodes` 中引用。
3. 为每个引用补上同名 `tagContributions`。

筛选器、标签总览和详情页不需要修改。

### 新增大类别

1. 在 `categories` 中添加元数据与稳定 `code`。
2. 在论文的 `categoryCodes` 中引用。
3. 为每个引用补上同名 `categoryContributions`。

三个大类别时首页使用韦恩图；类别数量不为三个时，代码自动使用“精确交叠区域板”，避免四集合以上的韦恩图不可读。表格视图始终按任意类别数动态生成。

更完整的模块边界和字段说明见 [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)。
