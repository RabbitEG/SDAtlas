/* Query-driven category page: one template supports every current/future set. */
(function () {
  "use strict";

  var ui = window.SDAtlasUI;
  var data = ui.data;
  var params = new URLSearchParams(window.location.search);
  var kind = params.get("kind") === "tag" ? "tag" : "major";
  var rawId = params.get("id") || (kind === "tag" ? data.tags[0].code : data.categories[0].code);
  var item = kind === "tag" ? ui.getTag(rawId) : ui.getCategory(rawId);
  var papers = item
    ? (kind === "tag" ? ui.papersForTag(item.code) : ui.papersForCategory(item.code))
    : [];

  function relatedItems() {
    var pool = kind === "major" ? data.tags : data.categories;
    return pool.map(function (candidate) {
      var count = papers.filter(function (paper) {
        return (kind === "major" ? paper.tagCodes : paper.categoryCodes).indexOf(candidate.code) !== -1;
      }).length;
      return { item: candidate, count: count };
    }).filter(function (entry) { return entry.count > 0; })
      .sort(function (a, b) { return b.count - a.count; });
  }

  function relatedLinks() {
    return relatedItems().map(function (entry) {
      var candidate = entry.item;
      var href = kind === "major" ? ui.tagHref(candidate.code) : ui.categoryHref(candidate.code);
      var label = kind === "major"
        ? candidate.code + " · " + candidate.name
        : candidate.code + " · " + candidate.shortName;
      return "<a style=\"" + ui.itemStyle(candidate) + "\" href=\"" + href + "\"><span>" +
        ui.escapeHtml(label) + "</span><em>" + entry.count + "</em></a>";
    }).join("");
  }

  function renderHero() {
    var hero = document.getElementById("category-hero");
    if (!item) {
      hero.innerHTML = "<div class=\"page-shell invalid-category\"><p class=\"section-index\">UNKNOWN CATEGORY</p>" +
        "<h1>找不到这个分类</h1><p>链接中的分类标识不存在，可能已经被数据维护者修改。</p>" +
        "<a class=\"button button-primary\" href=\"index.html\">返回分类图谱</a></div>";
      return;
    }

    /* Draft / Verify are intentionally kept in English. Avoid repeating the
       term when the localized label already starts with the canonical name. */
    var title = item.name;
    if (kind === "tag") {
      title = item.zhName.indexOf(item.name) === 0
        ? item.zhName
        : item.name + " · " + item.zhName;
    }
    var description = kind === "major" ? item.description : item.description + "。";
    var source = kind === "major" ? "大类别 · EXCEL E 列" : "小标签 · TAG.TXT";
    var explorer = kind === "major"
      ? ui.explorerHref({ major: [item.code], mode: "intersection" })
      : ui.explorerHref({ tags: [item.code], mode: "intersection" });

    document.title = item.code + " · " + title + " · SDAtlas";
    hero.style.setProperty("--detail-color", item.color);
    hero.style.setProperty("--detail-soft", item.softColor);
    hero.innerHTML = [
      "<div class=\"detail-hero__wash\" aria-hidden=\"true\"></div>",
      "<div class=\"page-shell\"><nav class=\"breadcrumb\" aria-label=\"面包屑\"><a href=\"index.html\">分类图谱</a><span>/</span><span>" +
        ui.escapeHtml(item.code) + "</span></nav>",
      "<div class=\"detail-hero__grid\"><div class=\"detail-identity\">",
      "<p class=\"section-index\">" + ui.escapeHtml(source) + "</p>",
      "<div class=\"detail-title-row\"><span class=\"detail-code\">" + ui.escapeHtml(item.code) + "</span><div>",
      "<h1>" + ui.escapeHtml(title) + "</h1>",
      (kind === "major" ? "<p class=\"detail-question\">" + ui.escapeHtml(item.question) + "</p>" : ""),
      "</div></div><p class=\"detail-description\">" + ui.escapeHtml(description) + "</p>",
      "<div class=\"detail-actions\"><a class=\"button button-primary\" href=\"" + explorer +
        "\">在组合筛选中打开</a><a class=\"text-link\" href=\"index.html\">返回总览</a></div></div>",
      "<aside class=\"detail-summary\"><div class=\"detail-count\"><strong>" + papers.length +
        "</strong><span>篇相关论文</span></div><div class=\"related-sets\"><span>同时涉及的" +
        (kind === "major" ? "小标签" : "大类别") + "</span>" + relatedLinks() + "</div></aside>",
      "</div></div>"
    ].join("");
  }

  function renderPapers(query) {
    var result = item ? papers.filter(function (paper) { return ui.paperMatchesText(paper, query); }) : [];
    var list = document.getElementById("paper-list");
    var resultLine = document.getElementById("result-line");
    if (!item) {
      list.innerHTML = ui.emptyState("没有可展示的论文", "请返回图谱并选择一个现有分类。",
        "<a class=\"button button-primary\" href=\"index.html\">返回分类图谱</a>");
      resultLine.textContent = "";
      return;
    }
    resultLine.textContent = query
      ? "搜索“" + query + "” · 显示 " + result.length + " / " + papers.length + " 篇"
      : "按源表顺序显示 " + result.length + " 篇论文；卡片默认折叠，展开后可查看 Excel 的 9 个字段与详细贡献。";
    list.innerHTML = result.length
      ? result.map(function (paper) { return ui.paperCard(paper, { kind: kind, id: item.code }); }).join("")
      : ui.emptyState("当前搜索没有结果", "换一个标题、简称、单位或标签关键词试试。",
        "<button class=\"button button-secondary\" type=\"button\" id=\"reset-search\">清除搜索</button>");
    var reset = document.getElementById("reset-search");
    if (reset) reset.addEventListener("click", function () {
      document.getElementById("list-search").value = "";
      renderPapers("");
    });
  }

  ui.mountChrome("atlas");
  renderHero();
  renderPapers("");
  document.getElementById("list-search").addEventListener("input", function (event) {
    renderPapers(event.target.value.trim());
  });
  ui.initTooltips();
})();
