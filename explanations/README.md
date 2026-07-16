# 论文独立解读页

此目录保存可选的单篇论文 HTML 解读。论文源文件通过相对于 `SDAtlas/` 的
`explanationPage` 字段关联，例如：

```json
"explanationPage": "explanations/DFlash.html"
```

没有独立解读页时省略该字段或设为 `null`，页面不会渲染空入口。为保证直接通过
`file://` 打开也能工作，建议每个解读页使用自包含 HTML；如需附带资源，应放在本目录
下的论文专属子目录，并使用相对路径引用。
