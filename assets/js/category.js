/* One parameterized page for every A–E subproblem. */
(function () {
  "use strict";

  var ui = window.SDAtlasUI;
  var data = ui.data;
  var params = new URLSearchParams(window.location.search);
  var rawId = params.get("id") || data.subproblems[0].code;
  var item = ui.getSubproblem(rawId);
  var papers = item ? ui.papersForSubproblem(item.code) : [];

  function relatedLinks() {
    if (!item) return "";
    return data.subproblems.filter(function (candidate) {
      return candidate.code !== item.code;
    }).map(function (candidate) {
      var count = papers.filter(function (paper) {
        return paper.subproblemCodes.indexOf(candidate.code) !== -1;
      }).length;
      return { item: candidate, count: count };
    }).filter(function (entry) { return entry.count > 0; })
      .sort(function (a, b) { return b.count - a.count; })
      .map(function (entry) {
        return "<a style=\"" + ui.itemStyle(entry.item) + "\" href=\"" +
          ui.subproblemHref(entry.item.code) + "\"><span>" + ui.escapeHtml(entry.item.code) +
          " · " + ui.escapeHtml(entry.item.shortName) + "</span><em>" + entry.count + "</em></a>";
      }).join("");
  }

  function renderHero() {
    var hero = document.getElementById("category-hero");
    if (!item) {
      hero.innerHTML = "<div class=\"page-shell invalid-category\"><p class=\"section-index\">UNKNOWN SUBPROBLEM</p>" +
        "<h1>找不到这个子问题</h1><p>链接中的标识不存在，可能已经被数据维护者修改。</p>" +
        "<a class=\"button button-primary\" href=\"index.html\">返回论文索引</a></div>";
      return;
    }

    document.title = item.code + " · " + item.name + " · SDAtlas";
    hero.style.setProperty("--detail-color", item.color);
    hero.style.setProperty("--detail-soft", item.softColor);
    hero.innerHTML = [
      "<div class=\"detail-hero__wash\" aria-hidden=\"true\"></div>",
      "<div class=\"page-shell\"><nav class=\"breadcrumb\" aria-label=\"面包屑\"><a href=\"index.html\">论文索引</a><span>/</span><span>" +
        ui.escapeHtml(item.code) + "</span></nav>",
      "<div class=\"detail-hero__grid\"><div class=\"detail-identity\">",
      "<p class=\"section-index\">SUBPROBLEM</p>",
      "<div class=\"detail-title-row\"><span class=\"detail-code\">" + ui.escapeHtml(item.code) + "</span><div>",
      "<h1>" + ui.escapeHtml(item.name) + "</h1>",
      "<p class=\"detail-question math-rich-text\">" + ui.renderMathText(item.question) + "</p>",
      "</div></div><p class=\"detail-description math-rich-text\">" +
        ui.renderMathText(item.description) + "</p>",
      "<div class=\"detail-actions\"><a class=\"button button-primary\" href=\"" +
        ui.explorerHref({ subproblems: [item.code], mode: "intersection" }) +
        "\">在组合筛选中打开</a><a class=\"text-link\" href=\"papers.html\">全部论文</a></div></div>",
      "<aside class=\"detail-summary\"><div class=\"detail-count\"><strong>" + papers.length +
        "</strong><span>篇相关论文</span></div><div class=\"related-sets\"><span>同时涉及的子问题</span>" +
        relatedLinks() + "</div></aside></div></div>"
    ].join("");
  }

  function renderGraph(result) {
    var container = document.getElementById("citation-graph");
    if (!container || !window.SDAtlasCitationGraph) return;
    window.SDAtlasCitationGraph.render(container, result, {
      title: item ? item.name + "的论文关系" : "论文关系"
    });
  }

  function renderPapers(query) {
    var result = item ? papers.filter(function (paper) {
      return ui.paperMatchesText(paper, query);
    }) : [];
    var list = document.getElementById("paper-list");
    var resultLine = document.getElementById("result-line");
    if (!item) {
      list.innerHTML = ui.emptyState("没有可展示的论文", "该子问题不存在。",
        "<a class=\"button button-primary\" href=\"index.html\">返回论文索引</a>");
      resultLine.textContent = "";
      renderGraph([]);
      return;
    }
    resultLine.textContent = query
      ? "搜索“" + query + "” · 显示 " + result.length + " / " + papers.length + " 篇"
      : "共 " + result.length + " 篇论文";
    list.innerHTML = result.length
      ? result.map(function (paper) {
        return ui.paperCard(paper, { subproblem: item.code });
      }).join("")
      : ui.emptyState("当前搜索没有结果", "没有匹配标题、作者、单位或方法的论文。",
        "<button class=\"button button-secondary\" type=\"button\" id=\"reset-search\">清除搜索</button>");
    renderGraph(result);
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
