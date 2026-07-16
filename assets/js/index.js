/* Homepage: derive both taxonomies and every view directly from data.js. */
(function () {
  "use strict";

  var ui = window.SDAtlasUI;
  var data = ui.data;

  function paperRegionPill(paper, codes) {
    var tooltip = codes.map(function (code) {
      return ui.getCategory(code).shortName + "：" + ui.categoryContribution(paper, code);
    }).join("\n");
    return "<a class=\"region-paper\" href=\"" + ui.escapeHtml(paper.url) +
      "\" target=\"_blank\" rel=\"noopener\" data-tooltip=\"" + ui.escapeHtml(tooltip) +
      "\">" + ui.escapeHtml(paper.shortName) + "</a>";
  }

  function renderStats() {
    document.getElementById("hero-stats").innerHTML = [
      [data.papers.length, "篇论文"],
      [data.categories.length, "个大类别"],
      [data.tags.length, "个小标签"]
    ].map(function (stat) {
      return "<div><dt>" + stat[0] + "</dt><dd>" + stat[1] + "</dd></div>";
    }).join("");
  }

  function renderLegend() {
    document.getElementById("category-legend").innerHTML = data.categories.map(function (category) {
      var count = ui.papersForCategory(category.code).length;
      return [
        "<a class=\"category-legend__item\" style=\"" + ui.itemStyle(category) + "\" href=\"" +
          ui.categoryHref(category.code) + "\">",
        "<span class=\"category-legend__code\">" + ui.escapeHtml(category.code) + "</span>",
        "<span><strong>" + ui.escapeHtml(category.name) + "</strong><small>" + ui.escapeHtml(category.question) + "</small></span>",
        "<em>" + count + "</em></a>"
      ].join("");
    }).join("");
  }

  function subsets(items) {
    var result = [];
    for (var mask = 1; mask < Math.pow(2, items.length); mask += 1) {
      var group = items.filter(function (_, index) { return mask & (1 << index); });
      result.push(group);
    }
    return result.sort(function (a, b) {
      return a.length - b.length || items.indexOf(a[0]) - items.indexOf(b[0]);
    });
  }

  function sameCodes(paper, codes) {
    return paper.categoryCodes.length === codes.length && codes.every(function (code) {
      return paper.categoryCodes.indexOf(code) !== -1;
    });
  }

  function regionHref(codes) {
    return codes.length === 1
      ? ui.categoryHref(codes[0])
      : ui.explorerHref({ major: codes, mode: "intersection" });
  }

  function renderThreeSetVenn(categories) {
    var codes = categories.map(function (item) { return item.code; });
    var layoutClasses = [
      "region--one", "region--two", "region--three",
      "region--one-two", "region--one-three", "region--two-three", "region--all"
    ];
    var orderedSubsets = [
      [codes[0]], [codes[1]], [codes[2]],
      [codes[0], codes[1]], [codes[0], codes[2]], [codes[1], codes[2]], codes
    ];
    var circles = categories.map(function (category, index) {
      return "<div class=\"venn-circle venn-circle--" + (index + 1) + "\" style=\"" +
        ui.itemStyle(category) + "\" aria-hidden=\"true\"></div>";
    }).join("");
    var circleLabels = categories.map(function (category, index) {
      return [
        "<a class=\"venn-set-label venn-set-label--" + (index + 1) + "\" style=\"" +
          ui.itemStyle(category) + "\" href=\"" + ui.categoryHref(category.code) + "\">",
        "<span>" + ui.escapeHtml(category.code) + "</span><strong>" + ui.escapeHtml(category.shortName) + "</strong></a>"
      ].join("");
    }).join("");
    var regions = orderedSubsets.map(function (codesForRegion, index) {
      var papers = data.papers.filter(function (paper) { return sameCodes(paper, codesForRegion); });
      var paperHtml = papers.length
        ? papers.map(function (paper) { return paperRegionPill(paper, codesForRegion); }).join("")
        : "<span class=\"empty-region\">暂无论文</span>";
      return [
        "<section class=\"venn-region " + layoutClasses[index] + (papers.length ? "" : " is-empty") + "\">",
        "<a class=\"region-title\" href=\"" + regionHref(codesForRegion) + "\"><strong>" +
          ui.escapeHtml(ui.regionLabel(codesForRegion.join(""))) + "</strong><span>" + papers.length + "</span></a>",
        "<div class=\"region-paper-list\">" + paperHtml + "</div></section>"
      ].join("");
    }).join("");

    return [
      "<div class=\"venn-stage\" aria-label=\"三大类别韦恩图\">",
      circles, circleLabels, regions,
      "<p class=\"venn-hint\"><span aria-hidden=\"true\">↗</span> 悬停论文名查看分区贡献 · 点击区域标题进入筛选</p>",
      "</div>"
    ].join("");
  }

  /* More than three sets do not form a readable Venn diagram. The fallback is
     still generated from exact membership sets, so new categories remain usable. */
  function renderScalableRegionBoard() {
    var groups = new Map();
    data.papers.forEach(function (paper) {
      var region = ui.exactRegion(paper);
      if (!groups.has(region)) groups.set(region, []);
      groups.get(region).push(paper);
    });
    return [
      "<div class=\"region-board-note\"><strong>交叠区域板</strong><p>大类别超过三个，已自动切换为可扩展的精确区域视图。</p></div>",
      "<div class=\"region-board\">",
      Array.from(groups.entries()).map(function (entry) {
        var codes = entry[0].split("");
        return "<section><a class=\"region-title\" href=\"" + regionHref(codes) + "\"><strong>" +
          ui.escapeHtml(ui.regionLabel(entry[0])) + "</strong><span>" + entry[1].length + "</span></a><div class=\"region-paper-list\">" +
          entry[1].map(function (paper) { return paperRegionPill(paper, codes); }).join("") + "</div></section>";
      }).join(""),
      "</div>"
    ].join("");
  }

  function renderVenn() {
    document.getElementById("venn-view").innerHTML = data.categories.length === 3
      ? renderThreeSetVenn(data.categories)
      : renderScalableRegionBoard();
  }

  function renderTable() {
    var categoryHeads = data.categories.map(function (category) {
      return "<th scope=\"col\"><a style=\"" + ui.itemStyle(category) + "\" href=\"" +
        ui.categoryHref(category.code) + "\"><span>" + ui.escapeHtml(category.code) + "</span>" +
        ui.escapeHtml(category.shortName) + "</a></th>";
    }).join("");
    var rows = data.papers.map(function (paper) {
      var cells = data.categories.map(function (category) {
        if (paper.categoryCodes.indexOf(category.code) === -1) {
          return "<td class=\"matrix-empty\"><span aria-label=\"不属于此类\">—</span></td>";
        }
        return "<td><a class=\"matrix-hit\" style=\"" + ui.itemStyle(category) + "\" href=\"" +
          ui.categoryHref(category.code) + "\" data-tooltip=\"" +
          ui.escapeHtml(ui.categoryContribution(paper, category.code)) + "\"><span aria-hidden=\"true\"></span><b class=\"sr-only\">属于" +
          ui.escapeHtml(category.name) + "</b></a></td>";
      }).join("");
      var region = ui.exactRegion(paper);
      return [
        "<tr><td class=\"matrix-paper\"><span class=\"row-index\">" + String(paper.index).padStart(2, "0") + "</span>",
        "<a href=\"" + ui.escapeHtml(paper.url) + "\" target=\"_blank\" rel=\"noopener\" data-tooltip=\"" +
          ui.escapeHtml(ui.combinedCategoryContribution(paper)) + "\"><strong>" + ui.escapeHtml(paper.shortName) +
          "</strong><small>" + ui.escapeHtml(paper.title) + "</small></a></td>",
        "<td class=\"matrix-meta\"><strong>" + ui.escapeHtml(paper.venue) + "</strong><small>" + ui.escapeHtml(paper.date) + "</small></td>",
        cells,
        "<td><a class=\"region-code\" href=\"" + regionHref(region.split("")) + "\">" +
          ui.escapeHtml(ui.regionLabel(region)) + "</a></td></tr>"
      ].join("");
    }).join("");
    document.getElementById("table-view").innerHTML = [
      "<div class=\"matrix-wrap\"><table class=\"category-matrix\"><thead><tr>",
      "<th scope=\"col\">论文</th><th scope=\"col\">版本 / 时间</th>", categoryHeads,
      "<th scope=\"col\">精确区域</th></tr></thead><tbody>", rows, "</tbody></table></div>"
    ].join("");
  }

  function renderTags() {
    document.getElementById("tag-grid").innerHTML = data.tags.map(function (tag) {
      var papers = ui.papersForTag(tag.code);
      return [
        "<article class=\"tag-card\" style=\"" + ui.itemStyle(tag) + "\">",
        "<header><a href=\"" + ui.tagHref(tag.code) + "\"><span class=\"tag-letter\">" + ui.escapeHtml(tag.code) + "</span>",
        "<span><strong>" + ui.escapeHtml(tag.name) + "</strong><small>" + ui.escapeHtml(tag.zhName) + "</small></span>",
        "<em>" + papers.length + "</em></a></header>",
        "<p>" + ui.escapeHtml(tag.description) + "</p>",
        "<div class=\"tag-paper-list\">",
        papers.map(function (paper) {
          return "<a href=\"" + ui.escapeHtml(paper.url) + "\" target=\"_blank\" rel=\"noopener\" data-tooltip=\"" +
            ui.escapeHtml(ui.tagContribution(paper, tag.code)) + "\">" + ui.escapeHtml(paper.shortName) + "</a>";
        }).join(""),
        "</div><a class=\"tag-card__more\" href=\"" + ui.tagHref(tag.code) + "\">查看该标签全部论文 <span aria-hidden=\"true\">→</span></a>",
        "</article>"
      ].join("");
    }).join("");
  }

  function initViewSwitch() {
    var buttons = document.querySelectorAll("[data-view]");
    var panels = { venn: document.getElementById("venn-view"), table: document.getElementById("table-view") };
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var view = button.getAttribute("data-view");
        buttons.forEach(function (item) {
          var selected = item === button;
          item.classList.toggle("is-active", selected);
          item.setAttribute("aria-pressed", String(selected));
        });
        Object.keys(panels).forEach(function (key) { panels[key].hidden = key !== view; });
      });
    });
  }

  ui.mountChrome("atlas");
  renderStats();
  renderLegend();
  renderVenn();
  renderTable();
  renderTags();
  initViewSwitch();
  ui.initTooltips();
})();
