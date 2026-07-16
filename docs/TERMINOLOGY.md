# SDAtlas 术语规范

## 1. 站点标准写法

| 概念 | 中文正文 / UI 标准写法 | 角色或派生词 | 不使用 |
|---|---|---|---|
| speculative decoding | 投机解码 | 英文语境可写 Speculative Decoding | 推测解码、推测式解码、预测解码 |
| draft | Draft | Drafter、Drafting | 草稿、草稿器，以及正文中的小写 draft / drafter |
| verify | Verify | Verifier、Verification | 把流程术语翻译成“验证”，以及正文中的小写 verify / verifier |

`Draft` 和 `Verify` 是投机解码流程中的专有阶段名。它们可以与中文组合，例如“Draft 质量”“Verify 预算”“并行 Verify”。指代模型角色时分别使用 `Drafter` 和 `Verifier`。

一般意义的“验证”不需要改写，例如“运行数据验证脚本”“验证字段是否完整”。判断标准是：该词是否指投机解码中由 Target / Verifier 检查候选 Token 的阶段。

## 2. 快速替换表

机器可读的替换表位于 [`../scripts/terminology.json`](../scripts/terminology.json)。常见替换如下：

| 查找 | 替换为 |
|---|---|
| 推测解码 / 推测式解码 / 预测解码 | 投机解码 |
| 草稿生成 / 草稿质量 / 草稿效率 | Draft 生成 / Draft 质量 / Draft 效率 |
| 草稿器 | Drafter |
| 验证效率 / 验证调度 | Verify 效率 / Verify 调度 |
| 验证预算 / 验证节点 / 验证成本 / 验证规模 | Verify 预算 / Verify 节点 / Verify 成本 / Verify 规模 |
| 并行验证 / 无效验证 | 并行 Verify / 无效 Verify |

替换“草稿”或“验证”这类短词时必须复核上下文，不能对维护文档中的“验证脚本”等一般用语做全局机械替换。

## 3. 保留原文的范围

以下内容属于来源忠实性或代码稳定性要求，不做术语改写：

- `papers[].title` 的论文原始英文标题；
- `papers[].workbookTags` 的 Excel F 列原始条目；
- `legacy/tag.txt` 中单独成行的 `draft` / `verify` 和 HTML 的 `T_draft` / `T_verify` 公式变量；
- `id`、查询参数、文件名等代码标识符。

页面自有的宏观类别名称、子问题解释、逐宏观类别贡献、逐子问题贡献和静态文案不属于例外，必须使用标准写法。

## 4. 自动检查

从仓库根目录运行：

```bash
python3 SDAtlas/scripts/check_terminology.py
```

检查器只依赖 Python 标准库，并从 `scripts/terminology.json` 读取规则。它会结构化读取唯一维护源 `data/catalog.json`，因此允许论文原标题和 Excel 原始字段保留来源用词，同时检查所有会被页面渲染的 SDAtlas 自有贡献文案与单位说明。修改目录时应先同步运行文件，再执行检查：

```bash
python3 SDAtlas/scripts/sync_catalog.py
python3 SDAtlas/scripts/validate_catalog.py
```
