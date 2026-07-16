/* Shared routing, rendering and accessibility helpers for every SDAtlas page. */
(function () {
  "use strict";

  var data = window.SD_ATLAS_DATA;
  if (!data) throw new Error("data.js must be loaded before ui.js");

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalize(value) {
    return String(value == null ? "" : value)
      .trim()
      .toLocaleLowerCase("zh-CN");
  }

  function getCategory(codeOrId) {
    var key = normalize(codeOrId);
    return data.categories.find(function (item) {
      return normalize(item.code) === key || normalize(item.id) === key || normalize(item.name) === key;
    }) || null;
  }

  function getTag(codeOrId) {
    var key = normalize(codeOrId);
    return data.tags.find(function (item) {
      return normalize(item.code) === key || normalize(item.id) === key ||
        normalize(item.name) === key || normalize(item.zhName) === key;
    }) || null;
  }

  function categoryHref(code) {
    return "category.html?kind=major&id=" + encodeURIComponent(code);
  }

  function tagHref(code) {
    return "category.html?kind=tag&id=" + encodeURIComponent(code);
  }

  function explorerHref(options) {
    var params = new URLSearchParams();
    options = options || {};
    if (options.major && options.major.length) params.set("major", options.major.join(","));
    if (options.tags && options.tags.length) params.set("tag", options.tags.join(","));
    if (options.mode) params.set("mode", options.mode);
    var query = params.toString();
    return "explorer.html" + (query ? "?" + query : "");
  }

  function itemStyle(item) {
    return "--item-color:" + item.color + ";--item-soft:" + item.softColor;
  }

  function exactRegion(paper) {
    return data.categories
      .map(function (category) { return category.code; })
      .filter(function (code) { return paper.categoryCodes.indexOf(code) !== -1; })
      .join("");
  }

  function regionLabel(codes) {
    return String(codes).split("").join(" ∩ ");
  }

  function papersForCategory(code) {
    return data.papers.filter(function (paper) { return paper.categoryCodes.indexOf(code) !== -1; });
  }

  function papersForTag(code) {
    return data.papers.filter(function (paper) { return paper.tagCodes.indexOf(code) !== -1; });
  }

  function categoryContribution(paper, code) {
    return paper.categoryContributions[code] || "该论文没有此宏观类别的贡献说明。";
  }

  function tagContribution(paper, code) {
    return paper.tagContributions[code] || "该论文没有此子问题的贡献说明。";
  }

  function combinedCategoryContribution(paper) {
    return paper.categoryCodes.map(function (code) {
      var category = getCategory(code);
      return category.shortName + "：" + categoryContribution(paper, code);
    }).join("\n");
  }

  function categoryBadges(paper) {
    return paper.categoryCodes.map(function (code) {
      var category = getCategory(code);
      return [
        "<a class=\"category-badge\" style=\"" + itemStyle(category) + "\" href=\"" + categoryHref(code) + "\"",
        " data-tooltip=\"" + escapeHtml(categoryContribution(paper, code)) + "\">",
        "<span class=\"badge-code\">" + escapeHtml(code) + "</span>",
        "<span>" + escapeHtml(category.shortName) + "</span></a>"
      ].join("");
    }).join("");
  }

  function researchTagLinks(paper, highlightedCode) {
    return paper.tagCodes.map(function (code) {
      var tag = getTag(code);
      var matched = code === highlightedCode ? " is-matched" : "";
      return [
        "<a class=\"research-tag" + matched + "\" style=\"" + itemStyle(tag) + "\" href=\"" + tagHref(code) + "\"",
        " data-tooltip=\"" + escapeHtml(tagContribution(paper, code)) + "\">",
        "<strong>" + escapeHtml(code) + "</strong><span>" + escapeHtml(tag.name) + "</span></a>"
      ].join("");
    }).join("");
  }

  /*
   * Institution records are maintained as ordered, independently explainable
   * entries in data/catalog.json. Reusing the site's delegated tooltip keeps
   * mouse, keyboard and touch-adjacent focus behavior consistent with tags.
   */
  function institutionList(paper) {
    var details = paper.institutionDetails || [];
    if (!details.length) return "<p>" + escapeHtml(paper.institutions) + "</p>";

    var previousOrder = null;
    var chips = details.map(function (item) {
      var order = Number(item.order);
      var separator = previousOrder !== null && previousOrder !== order
        ? "<span class=\"institution-arrow\" aria-hidden=\"true\">→</span>"
        : "";
      previousOrder = order;
      return [
        separator,
        "<span class=\"institution-chip\" tabindex=\"0\" data-order=\"" + escapeHtml(order) + "\"",
        " data-tooltip=\"顺位 " + escapeHtml(order) + "｜" + escapeHtml(item.explanation) + "\">",
        "<span class=\"institution-chip__order\" aria-hidden=\"true\">" + escapeHtml(order) + "</span>",
        "<span>" + escapeHtml(item.name) + "</span></span>"
      ].join("");
    }).join("");
    var sourceLink = paper.institutionSource
      ? "<a class=\"institution-source\" href=\"" + escapeHtml(paper.institutionSource) +
        "\" target=\"_blank\" rel=\"noopener\">单位依据 <span aria-hidden=\"true\">↗</span></a>"
      : "";
    return [
      "<div class=\"institution-list\" aria-label=\"论文相关单位\">" + chips + "</div>",
      sourceLink ? "<div class=\"institution-meta\">" + sourceLink + "</div>" : ""
    ].join("");
  }

  function categoryContributionPanels(paper, highlightedCode) {
    return paper.categoryCodes.map(function (code) {
      var category = getCategory(code);
      var active = code === highlightedCode ? " is-highlighted" : "";
      return [
        "<article class=\"contribution-panel" + active + "\" style=\"" + itemStyle(category) + "\">",
        "<a class=\"contribution-label\" href=\"" + categoryHref(code) + "\"><span>" +
          escapeHtml(code) + "</span>" + escapeHtml(category.name) + "</a>",
        "<p>" + escapeHtml(categoryContribution(paper, code)) + "</p>",
        "</article>"
      ].join("");
    }).join("");
  }

  function tagContributionPanels(paper, highlightedCode) {
    return paper.tagCodes.map(function (code) {
      var tag = getTag(code);
      var active = code === highlightedCode ? " is-highlighted" : "";
      return [
        "<article class=\"tag-contribution" + active + "\" style=\"" + itemStyle(tag) + "\">",
        "<a href=\"" + tagHref(code) + "\"><strong>" + escapeHtml(code) + "</strong>",
        "<span>" + escapeHtml(tag.name) + " · " + escapeHtml(tag.zhName) + "</span></a>",
        "<p>" + escapeHtml(tagContribution(paper, code)) + "</p>",
        "</article>"
      ].join("");
    }).join("");
  }

  /*
   * Contribution text is maintained directly in categoryContributions and
   * tagContributions. Normalize whitespace for the closed card, but preserve
   * every sentence instead of manufacturing a shortened copy with an ellipsis.
   */
  function completeContribution(value) {
    return String(value == null ? "" : value).replace(/\s+/g, " ").trim();
  }

  function paperContextSummary(paper, options) {
    options = options || {};
    var parts = [];
    var label = "贡献";

    function addMajor(code) {
      if (paper.categoryCodes.indexOf(code) === -1) return;
      var category = getCategory(code);
      if (!category) return;
      parts.push(category.shortName + "：" + completeContribution(categoryContribution(paper, code)));
    }

    function addTag(code) {
      if (paper.tagCodes.indexOf(code) === -1) return;
      var tag = getTag(code);
      if (!tag) return;
      parts.push(tag.name + "：" + completeContribution(tagContribution(paper, code)));
    }

    if (options.kind === "major") {
      addMajor(options.id);
    } else if (options.kind === "tag") {
      addTag(options.id);
    } else if (options.filters) {
      var majorCodes = options.filters.majorCodes || [];
      var tagCodes = options.filters.tagCodes || [];
      if (majorCodes.length || tagCodes.length) {
        majorCodes.forEach(addMajor);
        tagCodes.forEach(addTag);
      }
    }

    /* No active explorer filters (or a stale unmatched option): summarize the
       paper through its maintained major-category notes. */
    if (!parts.length) paper.categoryCodes.forEach(addMajor);

    return {
      label: label,
      text: parts.join("；")
    };
  }

  /*
   * A paper card is a native, keyboard-operable disclosure. The closed summary
   * is optimized for comparison: short name, venue, date and contextual
   * contribution stay on the first row, while institutions occupy the second.
   * Source-management fields remain in the catalog for validation and search,
   * but are deliberately absent from the reader-facing expanded view.
   */
  function paperCard(paper, options) {
    options = options || {};
    var major = options.kind === "major" ? options.id : null;
    var tagCode = options.kind === "tag" ? options.id : null;
    var summary = paperContextSummary(paper, options);
    var localLink = paper.localPdf
      ? "<a class=\"button button-secondary\" href=\"" + escapeHtml(paper.localPdf) +
        "\" target=\"_blank\" rel=\"noopener\">本地 PDF <span aria-hidden=\"true\">↗</span></a>"
      : "";
    var localNote = paper.localPdfNote
      ? "<span class=\"source-note\" tabindex=\"0\" data-tooltip=\"" + escapeHtml(paper.localPdfNote) +
        "\">本地文件说明</span>"
      : "";

    return [
      "<details class=\"paper-card\" data-paper-id=\"" + escapeHtml(paper.id) + "\">",
      "<summary class=\"paper-card__summary\"><span class=\"paper-summary__layout\">",
      "<span class=\"paper-summary__content\"><span class=\"paper-summary__topline\">",
      "<span class=\"paper-summary__title\" role=\"heading\" aria-level=\"2\">" +
        escapeHtml(paper.shortName) + "</span>",
      "<span class=\"paper-summary__datum paper-summary__venue\"><small>会议</small><strong>" +
        escapeHtml(paper.venue) + "</strong></span>",
      "<time class=\"paper-summary__datum paper-summary__date\" datetime=\"" +
        escapeHtml(paper.date) + "\"><small>时间</small><strong>" +
        escapeHtml(paper.date) + "</strong></time>",
      "<span class=\"paper-context-summary\"><strong>" + escapeHtml(summary.label) +
        "</strong><span>" + escapeHtml(summary.text) + "</span></span></span>",
      "<span class=\"paper-summary__institutions\"><strong>相关单位</strong><span>" +
        escapeHtml(paper.institutions) + "</span></span></span>",
      "<span class=\"paper-summary__toggle\" aria-hidden=\"true\"><span class=\"when-closed\">展开全部信息</span>" +
        "<span class=\"when-open\">收起详细信息</span><i></i></span>",
      "</span></summary><div class=\"paper-card__details\">",
      "<section class=\"paper-data-grid paper-overview-grid\" aria-label=\"论文信息\">",
      "<div class=\"paper-field paper-field--full paper-field--row-end\"><span class=\"field-label\">标题</span><p>" +
        escapeHtml(paper.title) + "</p></div>",
      "<div class=\"paper-field\"><span class=\"field-label\">宏观类别</span><div class=\"chip-row\">" +
        categoryBadges(paper) + "</div></div>",
      "<div class=\"paper-field paper-field--row-end\"><span class=\"field-label\">子问题</span>" +
        "<div class=\"chip-row\">" + researchTagLinks(paper, tagCode) + "</div></div>",
      "<div class=\"paper-field paper-field--full paper-field--row-end paper-field--institutions\"><span class=\"field-label\">相关单位</span>" +
        institutionList(paper) + "</div>",
      "<div class=\"paper-field\"><span class=\"field-label\">会议 / 版本</span><p>" + escapeHtml(paper.venue) + "</p></div>",
      "<div class=\"paper-field paper-field--row-end\"><span class=\"field-label\">发表时间</span><p>" + escapeHtml(paper.date) + "</p></div>",
      "<div class=\"paper-field paper-field--full paper-field--row-end paper-field--link\"><span class=\"field-label\">论文链接</span><a href=\"" +
        escapeHtml(paper.url) + "\" target=\"_blank\" rel=\"noopener\">" + escapeHtml(paper.url) + "</a></div>",
      "</section>",
      "<section class=\"paper-contributions\" aria-label=\"贡献说明\">",
      "<div class=\"section-mini-title\"><span>MACRO PERSPECTIVES</span><strong>宏观视角</strong></div>",
      "<div class=\"contribution-grid\">" + categoryContributionPanels(paper, major) + "</div>",
      "<div class=\"section-mini-title section-mini-title--tags\"><span>SUBPROBLEMS</span><strong>子问题解析</strong></div>",
      "<div class=\"tag-contribution-grid\">" + tagContributionPanels(paper, tagCode) + "</div>",
      "</section>",
      "<footer class=\"paper-card__footer\"><a class=\"button button-primary\" href=\"" + escapeHtml(paper.url) +
        "\" target=\"_blank\" rel=\"noopener\">论文页面 <span aria-hidden=\"true\">↗</span></a>" +
        localLink + localNote + "</footer>",
      "</div></details>"
    ].join("");
  }

  function paperMatchesText(paper, query) {
    var q = normalize(query);
    if (!q) return true;
    var institutionText = (paper.institutionDetails || []).map(function (item) {
      return [item.name, item.order, item.explanation].join(" ");
    }).join(" ");
    var categoryNames = paper.categoryCodes.map(function (code) {
      var item = getCategory(code);
      return item.name + " " + item.shortName;
    });
    var tagNames = paper.tagCodes.map(function (code) {
      var item = getTag(code);
      return [code, item.name, item.zhName, item.description].join(" ");
    });
    return normalize([
      paper.index, paper.title, paper.shortName, paper.institutions,
      paper.workbookInstitutions, institutionText,
      paper.venue, paper.date, paper.url, paper.categoryCodes.join(" "),
      paper.workbookTags.join(" "), paper.tagCodes.join(" "),
      categoryNames.join(" "), tagNames.join(" ")
    ].join(" ")).indexOf(q) !== -1;
  }

  function emptyState(title, body, actionHtml) {
    return [
      "<div class=\"empty-state\"><div class=\"empty-state__mark\" aria-hidden=\"true\">∅</div>",
      "<h2>" + escapeHtml(title) + "</h2><p>" + escapeHtml(body) + "</p>",
      actionHtml || "", "</div>"
    ].join("");
  }

  function siteHeader(active) {
    function navLink(href, key, label) {
      return "<a href=\"" + href + "\"" + (active === key ? " aria-current=\"page\"" : "") + ">" + label + "</a>";
    }
    return [
      "<a class=\"skip-link\" href=\"#main-content\">跳到主要内容</a>",
      "<div class=\"site-header__inner\"><a class=\"brand\" href=\"index.html\" aria-label=\"返回 SDAtlas 首页\">",
      "<span class=\"brand-mark\" aria-hidden=\"true\"><i></i><i></i><i></i></span>",
      "<span><strong>SDAtlas</strong><small>SPECULATIVE DECODING</small></span></a>",
      "<nav class=\"site-nav\" aria-label=\"主导航\">",
      navLink("index.html", "atlas", "论文索引"),
      navLink("explorer.html", "explorer", "组合筛选"),
      "<a href=\"" + escapeHtml(data.meta.catalogFile) + "\" download>合并数据</a>",
      "</nav></div>"
    ].join("");
  }

  function siteFooter() {
    return [
      "<div class=\"footer-grid\"><a class=\"brand brand--footer\" href=\"index.html\">",
      "<span class=\"brand-mark\" aria-hidden=\"true\"><i></i><i></i><i></i></span>",
      "<span><strong>SDAtlas</strong><small>RESEARCH NAVIGATOR</small></span></a>",
      "<p>投机解码论文的宏观类别、子问题与贡献索引。</p>",
      "<p class=\"footer-meta\">DATASET · " + escapeHtml(data.meta.updated) + "<br>SCHEMA · v" +
        escapeHtml(data.schemaVersion) + "</p></div>"
    ].join("");
  }

  function mountChrome(active) {
    var header = document.getElementById("site-header");
    var footer = document.getElementById("site-footer");
    if (header) header.innerHTML = siteHeader(active);
    if (footer) footer.innerHTML = siteFooter();
  }

  function initTooltips() {
    if (document.getElementById("atlas-tooltip")) return;
    var tooltip = document.createElement("div");
    var activeTarget = null;
    tooltip.className = "atlas-tooltip";
    tooltip.id = "atlas-tooltip";
    tooltip.setAttribute("role", "tooltip");
    tooltip.hidden = true;
    document.body.appendChild(tooltip);

    function position() {
      if (!activeTarget || tooltip.hidden) return;
      var rect = activeTarget.getBoundingClientRect();
      var tooltipRect = tooltip.getBoundingClientRect();
      var left = rect.left + rect.width / 2 - tooltipRect.width / 2;
      left = Math.max(12, Math.min(left, window.innerWidth - tooltipRect.width - 12));
      var top = rect.top - tooltipRect.height - 12;
      if (top < 12) top = rect.bottom + 12;
      tooltip.style.left = Math.round(left) + "px";
      tooltip.style.top = Math.round(top) + "px";
    }

    function show(target) {
      var content = target && target.getAttribute("data-tooltip");
      if (!content) return;
      activeTarget = target;
      tooltip.textContent = content;
      tooltip.hidden = false;
      target.setAttribute("aria-describedby", tooltip.id);
      requestAnimationFrame(position);
    }

    function hide(target) {
      if (target && activeTarget !== target) return;
      if (activeTarget) activeTarget.removeAttribute("aria-describedby");
      activeTarget = null;
      tooltip.hidden = true;
    }

    document.addEventListener("mouseover", function (event) {
      var target = event.target.closest && event.target.closest("[data-tooltip]");
      if (target && !target.contains(event.relatedTarget)) show(target);
    });
    document.addEventListener("mouseout", function (event) {
      var target = event.target.closest && event.target.closest("[data-tooltip]");
      if (target && !target.contains(event.relatedTarget)) hide(target);
    });
    document.addEventListener("focusin", function (event) {
      var target = event.target.closest && event.target.closest("[data-tooltip]");
      if (target) show(target);
    });
    document.addEventListener("focusout", function (event) {
      var target = event.target.closest && event.target.closest("[data-tooltip]");
      if (target) hide(target);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") hide();
    });
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
  }

  window.SDAtlasUI = {
    data: data,
    escapeHtml: escapeHtml,
    normalize: normalize,
    getCategory: getCategory,
    getTag: getTag,
    categoryHref: categoryHref,
    tagHref: tagHref,
    explorerHref: explorerHref,
    itemStyle: itemStyle,
    exactRegion: exactRegion,
    regionLabel: regionLabel,
    papersForCategory: papersForCategory,
    papersForTag: papersForTag,
    categoryContribution: categoryContribution,
    tagContribution: tagContribution,
    combinedCategoryContribution: combinedCategoryContribution,
    categoryBadges: categoryBadges,
    researchTagLinks: researchTagLinks,
    paperContextSummary: paperContextSummary,
    paperCard: paperCard,
    paperMatchesText: paperMatchesText,
    emptyState: emptyState,
    mountChrome: mountChrome,
    initTooltips: initTooltips
  };
})();
