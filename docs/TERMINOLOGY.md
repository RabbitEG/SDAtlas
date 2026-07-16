# SDAtlas 术语规范

## 1. 标准写法

| 概念 | 中文正文 / UI 标准写法 | 角色或派生词 | 不使用 |
|---|---|---|---|
| speculative decoding | 投机解码 | 英文语境可写 Speculative Decoding | 推测解码、推测式解码、预测解码 |
| draft | Draft | Drafter、Drafting | 草稿、草稿器，以及流程语境中的小写 draft / drafter |
| verify | Verify | Verifier、Verification | 把流程术语翻译成“验证”，以及流程语境中的小写 verify / verifier |
| training | Training | `Training-Time` 等复合写法 | 英文流程名中的 training / Training-time |

`Draft` 和 `Verify` 是投机解码中的专有阶段名，可以与中文组合，例如“Draft 质量”“Verify 预算”“并行 Verify”。指代承担相应角色的模型时，使用 `Drafter` 和 `Verifier`。

`Training` 用于统一子问题名称及英文流程术语；普通中文正文仍可自然使用“训练”，无需全部改成英文。

一般意义的“验证”不需要改写，例如“运行目录验证脚本”“验证字段是否完整”。判断标准是该词是否指 Verifier 检查候选 Token 的流程阶段。

## 2. 快速替换表

机器可读规则位于 [`../scripts/terminology.json`](../scripts/terminology.json)。常见替换如下：

| 查找 | 替换为 |
|---|---|
| 推测解码 / 推测式解码 / 预测解码 | 投机解码 |
| 草稿生成 / 草稿质量 / 草稿效率 | Draft 生成 / Draft 质量 / Draft 效率 |
| 草稿器 | Drafter |
| 验证效率 / 验证调度 | Verify 效率 / Verify 调度 |
| 验证预算 / 验证节点 / 验证成本 / 验证规模 | Verify 预算 / Verify 节点 / Verify 成本 / Verify 规模 |
| 并行验证 / 无效验证 | 并行 Verify / 无效 Verify |
| training-time / Training-time | Training-Time |

替换“草稿”或“验证”这类短词时必须人工复核上下文，不能把“验证脚本”等一般用语机械替换。中文“训练”也不是禁用词；检查器只校正英文 `Training` 的大小写。

## 3. 检查范围

术语检查器结构化扫描 schema v4 的人工维护源：

- `data/catalog.json` 中的站点元数据与 A–E 子问题文案；
- 所有 `data/papers/*.json` 中的 `methodOverview`、`notes`、单位解释；
- 每个 `subproblemContributions.<code>.summary` 与 `.detail`；
- HTML 和非生成 JavaScript 中可明确判定的禁用中文写法；
- 除本页外的项目文档中的旧投机解码译法。

生成的 `data/catalog.generated.json` 与 `assets/js/data.js` 不重复扫描，因为其文案来自上述源文件。

## 4. 保留原文的范围

以下内容出于来源忠实性、数学惯例或代码稳定性保留原文：

- `papers[].title` 的论文原始英文标题；
- 作者名、会议名、URL 和来源元数据；
- `T_draft` / `T_verify` 等公式变量；
- `id`、文件名、JSON 键、查询参数和其他代码标识符。

论文原标题中即使出现 `Drafting`、`Verification` 或其他大小写，也不据此改写标题。站点自写的直观方法概述、贡献、备注、子问题定义和 UI 文案不属于例外。

## 5. 自动检查

从仓库根目录运行：

```bash
python3 SDAtlas/scripts/check_terminology.py
```

或在 `SDAtlas/` 内运行：

```bash
python3 scripts/check_terminology.py
```

检查器只依赖 Python 标准库，并从 `scripts/terminology.json` 读取禁用片段、快速替换和英文大小写规则。修改数据后的推荐顺序是：

```bash
python3 scripts/sync_catalog.py
python3 scripts/validate_catalog.py
python3 scripts/check_terminology.py
```
