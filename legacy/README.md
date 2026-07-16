# Legacy source snapshots

这里保存构建合并目录时使用的原始来源快照，不参与浏览器运行时加载：

- `speculative_decoding_papers_2026-07.xlsx`：Excel A–I 列原始论文信息；
- `tag.txt`：D / Q / T / V / R / S / H 子问题及逐论文贡献。

页面数据的维护入口是 `../data/catalog.json`，运行时文件是由它生成的
`../assets/js/data.js`。两个原始文件仍由校验脚本读取，用于检查目录没有
偏离 Excel 九列内容和子问题来源。
