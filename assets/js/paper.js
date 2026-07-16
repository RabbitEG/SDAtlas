/* Parameterized reader-facing paper detail page. */
(function () {
  "use strict";

  var ui = window.SDAtlasUI;
  var params = new URLSearchParams(window.location.search);
  var paper = ui.getPaper(params.get("id") || "");
  var root = document.getElementById("paper-page");

  function notes() {
    if (!paper.notes.length) return "<p class=\"empty-note\">暂无研究笔记。</p>";
    return "<ul class=\"paper-page-notes\">" + paper.notes.map(function (note) {
      return "<li class=\"math-rich-text\">" + ui.renderMathText(note) + "</li>";
    }).join("") + "</ul>";
  }

  function actions() {
    var explanation = paper.explanationPage
      ? "<a class=\"button button-secondary\" href=\"" + ui.escapeHtml(paper.explanationPage) +
        "\">论文解读 <span aria-hidden=\"true\">→</span></a>"
      : "";
    var localPdf = paper.localPdf
      ? "<a class=\"button button-secondary\" href=\"" + ui.escapeHtml(paper.localPdf) +
        "\" target=\"_blank\" rel=\"noopener\">本地 PDF <span aria-hidden=\"true\">↗</span></a>"
      : "";
    return "<a class=\"button button-primary\" href=\"" + ui.escapeHtml(paper.url) +
      "\" target=\"_blank\" rel=\"noopener\">论文页面 <span aria-hidden=\"true\">↗</span></a>" +
      explanation + localPdf;
  }

  function renderGraph() {
    if (!window.SDAtlasCitationGraph) return;
    var ids = [paper.id].concat(paper.citations, paper.citedBy);
    var seen = new Set();
    var ego = ids.filter(function (id) {
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    }).map(ui.getPaper).filter(Boolean);
    window.SDAtlasCitationGraph.render(document.getElementById("citation-graph"), ego, {
      title: paper.shortName + " 的引用关系",
      focusId: paper.id
    });
  }

  function render() {
    if (!paper) {
      document.title = "找不到论文 · SDAtlas";
      root.innerHTML = "<section class=\"section page-shell\">" +
        ui.emptyState("找不到这篇论文", "链接中的论文 ID 不存在。",
          "<a class=\"button button-primary\" href=\"papers.html\">浏览全部论文</a>") + "</section>";
      return;
    }

    document.title = paper.shortName + " · SDAtlas";
    root.innerHTML = [
      "<section class=\"paper-page-hero\"><div class=\"page-shell\">",
      "<nav class=\"breadcrumb\" aria-label=\"面包屑\"><a href=\"index.html\">论文索引</a><span>/</span>" +
        "<a href=\"papers.html\">全部论文</a><span>/</span><span>" + ui.escapeHtml(paper.shortName) + "</span></nav>",
      "<div class=\"paper-page-hero__grid\"><div><p class=\"section-index\">PAPER PROFILE</p>",
      "<h1>" + ui.escapeHtml(paper.shortName) + "</h1><p class=\"paper-page-title math-rich-text\">" +
        ui.renderMathText(paper.title) + "</p>",
      "<div class=\"author-list author-list--hero\">" + paper.authors.map(function (author) {
        return "<span>" + ui.escapeHtml(author) + "</span>";
      }).join("") + "</div></div>",
      "<aside class=\"paper-page-meta\"><div><span>会议 / 版本</span><strong>" + ui.escapeHtml(paper.venue) +
        "</strong></div><div><span>时间</span><strong>" + ui.escapeHtml(paper.date) +
        "</strong></div><div><span>引用 / 被引用</span><strong>" + paper.citations.length + " / " +
        paper.citedBy.length + "</strong></div><div class=\"paper-page-actions\">" + actions() + "</div></aside>",
      "</div></div></section>",

      "<section class=\"section page-shell paper-reading-grid\"><div class=\"paper-reading-main\">",
      "<article class=\"paper-reading-section\"><p class=\"section-index\">METHOD OVERVIEW</p>" +
        "<h2>直观方法概述</h2><p class=\"paper-lead math-rich-text\">" +
        ui.renderMathText(paper.methodOverview) + "</p></article>",
      "<article class=\"paper-reading-section\"><p class=\"section-index\">SUBPROBLEMS</p>" +
        "<h2>子问题与贡献</h2><div class=\"contribution-grid contribution-grid--paper\">" +
        ui.contributionPanels(paper) + "</div></article>",
      "<article class=\"paper-reading-section\"><p class=\"section-index\">NOTES</p><h2>研究笔记</h2>" +
        notes() + "</article></div>",
      "<aside class=\"paper-reading-aside\"><section><p class=\"section-index\">INSTITUTIONS</p>" +
        "<h2>相关单位</h2>" + ui.institutionList(paper) + "</section><section><p class=\"section-index\">INDEX</p>" +
        "<h2>所属子问题</h2><div class=\"chip-row\">" + ui.subproblemBadges(paper) + "</div></section></aside></section>",

      "<section class=\"section section--tinted paper-citation-area\"><div class=\"page-shell\">",
      "<header class=\"section-heading\"><p class=\"section-index\">CITATION GRAPH</p><h2>引用关系</h2>" +
        "<p>图中从右向左表示引用方向，并自动省略可由其他路径表达的传递边。</p></header>",
      "<div id=\"citation-graph\"></div>",
      "</div></section>"
    ].join("");
    renderGraph();
  }

  ui.mountChrome("papers");
  render();
  ui.initTooltips();
})();
