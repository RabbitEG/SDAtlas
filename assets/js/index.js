/* Homepage: render the single A–E subproblem model directly from data.js. */
(function () {
  "use strict";

  var ui = window.SDAtlasUI;
  var data = ui.data;

  if (!Array.isArray(data.subproblems) || !Array.isArray(data.papers)) {
    throw new Error("The homepage requires data.subproblems and data.papers");
  }

  function papersForSubproblem(code) {
    if (typeof ui.papersForSubproblem === "function") {
      return ui.papersForSubproblem(code);
    }
    return data.papers.filter(function (paper) {
      return (paper.subproblemCodes || []).indexOf(code) !== -1;
    });
  }

  function subproblemContribution(paper, code) {
    var contribution = typeof ui.subproblemContribution === "function"
      ? ui.subproblemContribution(paper, code)
      : (paper.subproblemContributions || {})[code];

    if (typeof contribution === "string") {
      return { summary: contribution, detail: contribution };
    }
    contribution = contribution || {};
    return {
      summary: contribution.summary || contribution.detail || "暂无贡献概括。",
      detail: contribution.detail || contribution.summary || "暂无详细说明。"
    };
  }

  function paperHref(id) {
    return typeof ui.paperHref === "function"
      ? ui.paperHref(id)
      : "paper.html?id=" + encodeURIComponent(id);
  }

  function subproblemHref(code) {
    return typeof ui.subproblemHref === "function"
      ? ui.subproblemHref(code)
      : "explorer.html?subproblem=" + encodeURIComponent(code);
  }

  function renderStats() {
    var paperCount = data.papers.length;
    var subproblemCount = data.subproblems.length;
    document.getElementById("hero-stats").innerHTML = [
      [paperCount, "篇论文"],
      [subproblemCount, "个子问题"]
    ].map(function (stat) {
      return "<div><dt>" + stat[0] + "</dt><dd>" + stat[1] + "</dd></div>";
    }).join("");

    document.getElementById("hero-paper-count").textContent = paperCount;
    document.querySelectorAll(".route-paper-count").forEach(function (element) {
      element.textContent = paperCount;
    });
  }

  function renderPaperTile(paper, subproblem) {
    var contribution = subproblemContribution(paper, subproblem.code);
    var year = String(paper.date || "").slice(0, 4);
    return [
      "<a class=\"question-paper\" href=\"" + ui.escapeHtml(paperHref(paper.id)) + "\"",
      " data-tooltip=\"" + ui.escapeHtml(contribution.summary) + "\"",
      " aria-label=\"查看 " + ui.escapeHtml(paper.shortName) + " 的论文详情\">",
      "<strong>" + ui.escapeHtml(paper.shortName) + "</strong>",
      "<small>" + ui.escapeHtml(year) + "</small>",
      "</a>"
    ].join("");
  }

  function renderSubproblemCard(subproblem) {
    var papers = papersForSubproblem(subproblem.code);
    var style = ui.itemStyle(subproblem);
    return [
      "<article class=\"question-card\" style=\"" + style + "\">",
      "<header class=\"question-card__header\">",
      "<a class=\"question-card__identity\" href=\"" + ui.escapeHtml(subproblemHref(subproblem.code)) + "\">",
      "<span class=\"question-card__code\">" + ui.escapeHtml(subproblem.code) + "</span>",
      "<span><small>SUBPROBLEM " + ui.escapeHtml(subproblem.code) + "</small>",
      "<strong>" + ui.escapeHtml(subproblem.name) + "</strong></span></a>",
      "<span class=\"question-card__count\"><strong>" + papers.length + "</strong><small>篇论文</small></span>",
      "</header>",
      "<p class=\"question-card__question math-rich-text\">" + ui.renderMathText(subproblem.question) + "</p>",
      "<p class=\"question-card__description math-rich-text\">" + ui.renderMathText(subproblem.description) + "</p>",
      "<div class=\"question-card__papers\" aria-label=\"" + ui.escapeHtml(subproblem.name) + "的论文\">",
      papers.map(function (paper) { return renderPaperTile(paper, subproblem); }).join(""),
      "</div>",
      "<a class=\"question-card__more\" href=\"" + ui.escapeHtml(subproblemHref(subproblem.code)) + "\">",
      "查看此子问题 <span aria-hidden=\"true\">→</span></a>",
      "</article>"
    ].join("");
  }

  function renderSubproblems() {
    document.getElementById("subproblem-grid").innerHTML = data.subproblems
      .map(renderSubproblemCard)
      .join("");
  }

  function updateFooterCopy() {
    var footerCopy = document.querySelector(".footer-grid > p:not(.footer-meta)");
    if (footerCopy) footerCopy.textContent = "投机解码论文的五个子问题与贡献索引。";
  }

  ui.mountChrome("atlas");
  updateFooterCopy();
  renderStats();
  renderSubproblems();
  ui.initTooltips();
})();
