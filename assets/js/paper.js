/* Parameterized, reader-facing paper record page. */
(function () {
  "use strict";

  var ui = window.SDAtlasUI;
  var params = new URLSearchParams(window.location.search);
  var paper = ui.getPaper(params.get("id") || "");
  var root = document.getElementById("paper-page");

  var CHARACTERISTIC_FIELDS = [
    ["requiresTraining", "需要 Training", "boolean"],
    ["drafterType", "Drafter 类型"],
    ["draftGeneration", "Draft 生成方式"],
    ["candidateStructure", "候选结构"],
    ["verificationStrategy", "Verify 策略"],
    ["usesTargetFeatures", "使用 Target 特征", "boolean"],
    ["dynamicDraftLength", "动态 Draft 长度", "boolean"],
    ["dynamicVerifyLength", "动态 Verify 长度", "boolean"],
    ["lossless", "无损", "boolean"]
  ];

  var EVALUATION_FIELDS = [
    ["targetModels", "Target 模型"],
    ["benchmarks", "评测基准"],
    ["baselines", "对比方法"],
    ["metrics", "指标"],
    ["hardware", "硬件"],
    ["frameworks", "框架"]
  ];

  var RELATION_FIELDS = [
    ["extends", "直接扩展"],
    ["comparesAgainst", "实验比较"],
    ["related", "相关工作"],
    ["compatibleWith", "可组合"]
  ];

  function missingMarkup(label) {
    return "<span class=\"record-empty\">" + ui.escapeHtml(label || "未记录") + "</span>";
  }

  function hasText(value) {
    return typeof value === "string" && Boolean(value.trim());
  }

  function richText(value, className) {
    if (!hasText(value)) return missingMarkup();
    var paragraphs = ui.renderMathText(value).split(/\n\n+/).map(function (paragraph) {
      return "<p>" + paragraph.replace(/\n/g, "<br>") + "</p>";
    }).join("");
    return "<div class=\"math-rich-text " + (className || "") + "\">" + paragraphs + "</div>";
  }

  function chipList(values) {
    if (!Array.isArray(values) || !values.length) return missingMarkup();
    return "<div class=\"record-chip-list\">" + values.map(function (value) {
      return "<span>" + ui.escapeHtml(value) + "</span>";
    }).join("") + "</div>";
  }

  function booleanValue(value) {
    if (value === true) return "<span class=\"record-boolean is-yes\">是</span>";
    if (value === false) return "<span class=\"record-boolean is-no\">否</span>";
    return missingMarkup("未核实");
  }

  function textValue(value) {
    return hasText(value)
      ? "<span class=\"math-rich-text\">" + ui.renderMathText(value) + "</span>"
      : missingMarkup();
  }

  function definitionGrid(entries, className) {
    return "<dl class=\"record-definition-grid " + (className || "") + "\">" +
      entries.map(function (entry) {
        return "<div><dt>" + ui.escapeHtml(entry[0]) + "</dt><dd>" + entry[1] +
          "</dd></div>";
      }).join("") + "</dl>";
  }

  function recordSection(id, kicker, title, body, description) {
    return [
      "<section class=\"paper-record-section\" id=\"" + ui.escapeHtml(id) + "\">",
      "<header class=\"paper-record-section__header\"><p class=\"section-index\">" +
      ui.escapeHtml(kicker) + "</p><h2>" + ui.escapeHtml(title) + "</h2>",
      description ? "<p>" + ui.escapeHtml(description) + "</p>" : "",
      "</header>", body, "</section>"
    ].join("");
  }

  function notesMarkup() {
    if (!Array.isArray(paper.notes) || !paper.notes.length) return missingMarkup("暂无研究笔记");
    return "<ol class=\"paper-record-list paper-record-list--notes\">" +
      paper.notes.map(function (note) {
        return "<li>" + richText(note) + "</li>";
      }).join("") + "</ol>";
  }

  function qaNotesMarkup() {
    var qaNotes = Array.isArray(paper.qaNotes) ? paper.qaNotes : [];
    if (!qaNotes.length) return missingMarkup("暂无阅读问答");
    return "<div class=\"qa-note-list\">" + qaNotes.map(function (item, index) {
      return [
        "<article class=\"qa-note\"><header><span>Q", String(index + 1), "</span></header>",
        "<div class=\"qa-note__row qa-note__question\"><strong>Q</strong>",
        richText(item.question), "</div>",
        "<div class=\"qa-note__row qa-note__answer\"><strong>A</strong>",
        hasText(item.answer) ? richText(item.answer) : missingMarkup("待回答"),
        "</div></article>"
      ].join("");
    }).join("") + "</div>";
  }

  function actions() {
    var links = [
      "<a class=\"button button-primary\" href=\"" + ui.escapeHtml(paper.url) +
      "\" target=\"_blank\" rel=\"noopener\">论文页面 <span aria-hidden=\"true\">↗</span></a>"
    ];
    if (paper.explanationPage) {
      links.push("<a class=\"button button-secondary\" href=\"" +
        ui.escapeHtml(paper.explanationPage) + "\">论文解读专题页 <span aria-hidden=\"true\">→</span></a>");
    }
    if (paper.localPdf) {
      links.push("<a class=\"button button-secondary\" href=\"" +
        ui.escapeHtml(paper.localPdf) + "\" target=\"_blank\" rel=\"noopener\">本地 PDF " +
        "<span aria-hidden=\"true\">↗</span></a>");
    }
    return links.join("");
  }

  function problemMarkup() {
    var statement = paper.problemStatement || {};
    return definitionGrid([
      ["研究背景", richText(statement.background)],
      ["既有局限", richText(statement.priorLimitation)],
      ["研究目标", richText(statement.goal)]
    ], "record-definition-grid--prose");
  }

  function methodComponentsMarkup() {
    var components = Array.isArray(paper.methodComponents) ? paper.methodComponents : [];
    if (!components.length) return missingMarkup("暂无独立方法组件记录");
    return "<div class=\"method-component-grid\">" + components.map(function (component, index) {
      return [
        "<article class=\"method-component\"><header><span>", String(index + 1), "</span><div><h3>",
        ui.escapeHtml(component.name || "未命名组件"), "</h3><p>",
        hasText(component.stage) ? ui.escapeHtml(component.stage) : "阶段未记录", "</p></div></header>",
        definitionGrid([
          ["作用", richText(component.purpose)],
          ["机制", richText(component.mechanism)],
          ["相对既有方法", richText(component.differenceFromPrior)]
        ], "record-definition-grid--component"),
        "</article>"
      ].join("");
    }).join("") + "</div>";
  }

  function characteristicsMarkup() {
    var characteristics = paper.characteristics || {};
    return definitionGrid(CHARACTERISTIC_FIELDS.map(function (field) {
      return [field[1], field[2] === "boolean"
        ? booleanValue(characteristics[field[0]])
        : textValue(characteristics[field[0]])];
    }), "record-definition-grid--compact");
  }

  function trainingEvaluationMarkup() {
    var training = paper.training || {};
    var evaluation = paper.evaluation || {};
    return [
      "<div class=\"record-split\"><section><h3>Training</h3>",
      definitionGrid([
        ["概括", richText(training.summary)],
        ["数据", richText(training.data)],
        ["目标函数", richText(training.objective)]
      ], "record-definition-grid--prose"),
      "</section><section><h3>Evaluation</h3>",
      definitionGrid(EVALUATION_FIELDS.map(function (field) {
        return [field[1], chipList(evaluation[field[0]])];
      }), "record-definition-grid--evaluation"),
      "</section></div>"
    ].join("");
  }

  function resultsMarkup() {
    var results = Array.isArray(paper.mainResults) ? paper.mainResults : [];
    if (!results.length) return missingMarkup("暂无代表性结果记录");
    return "<div class=\"result-card-grid\">" + results.map(function (result, index) {
      return [
        "<article class=\"result-card\"><header><span>RESULT ", String(index + 1), "</span><strong>",
        hasText(result.result) ? ui.escapeHtml(result.result) : "未记录", "</strong></header>",
        definitionGrid([
          ["指标", textValue(result.metric)],
          ["条件", richText(result.condition)],
          ["比较", richText(result.comparison)],
          ["来源位置", textValue(result.source)]
        ], "record-definition-grid--result"),
        "</article>"
      ].join("");
    }).join("") + "</div>";
  }

  function limitationsMarkup() {
    var limitations = Array.isArray(paper.limitations) ? paper.limitations : [];
    if (!limitations.length) return missingMarkup("暂无局限记录");
    return "<div class=\"limitation-list\">" + limitations.map(function (item) {
      return "<article><header><strong>" + ui.escapeHtml(item.type || "未分类") +
        "</strong><span>" + ui.escapeHtml(item.sourceType || "来源未记录") + "</span></header>" +
        richText(item.description) + "</article>";
    }).join("") + "</div>";
  }

  function paperLinks(ids) {
    if (!Array.isArray(ids) || !ids.length) return missingMarkup();
    return "<div class=\"record-paper-links\">" + ids.map(function (id) {
      var target = ui.getPaper(id);
      var label = target ? target.shortName : id;
      return "<a href=\"" + ui.escapeHtml(ui.paperHref(id)) + "\">" +
        ui.escapeHtml(label) + "</a>";
    }).join("") + "</div>";
  }

  function relationsMarkup() {
    var relations = paper.relations || {};
    return definitionGrid(RELATION_FIELDS.map(function (field) {
      return [field[1], paperLinks(relations[field[0]])];
    }), "record-definition-grid--relations");
  }

  function reproducibilityMarkup() {
    var reproducibility = paper.reproducibility || {};
    var statusLabels = {
      "not-checked": "尚未检查",
      "not-reproduced": "尚未复现",
      "partial": "部分复现",
      "reproduced": "已复现"
    };
    function externalLink(url, label) {
      return hasText(url)
        ? "<a class=\"record-external-link\" href=\"" + ui.escapeHtml(url) +
        "\" target=\"_blank\" rel=\"noopener\">" + ui.escapeHtml(label) +
        " <span aria-hidden=\"true\">↗</span></a>"
        : missingMarkup();
    }
    var reproductionNotes = Array.isArray(reproducibility.notes) && reproducibility.notes.length
      ? "<ul class=\"paper-record-list\">" + reproducibility.notes.map(function (note) {
        return "<li>" + richText(note) + "</li>";
      }).join("") + "</ul>" : missingMarkup();
    return definitionGrid([
      ["代码", externalLink(reproducibility.codeUrl, "代码仓库")],
      ["模型", externalLink(reproducibility.modelUrl, "模型页面")],
      ["项目主页", externalLink(reproducibility.projectPage, "项目主页")],
      ["官方实现", booleanValue(reproducibility.officialImplementation)],
      ["复现状态", textValue(statusLabels[reproducibility.status] || reproducibility.status)],
      ["复现说明", reproductionNotes]
    ], "record-definition-grid--reproducibility");
  }

  function evidenceMarkup() {
    var evidence = Array.isArray(paper.evidence) ? paper.evidence : [];
    if (!evidence.length) return missingMarkup("暂无证据定位记录");
    return "<div class=\"evidence-list\">" + evidence.map(function (item, index) {
      return [
        "<article><header><span>", String(index + 1), "</span><strong>",
        ui.escapeHtml(item.type || "evidence"), "</strong></header>",
        richText(item.claim),
        "<footer><span>定位</span><strong>",
        hasText(item.location) ? ui.escapeHtml(item.location) : "未记录", "</strong></footer></article>"
      ].join("");
    }).join("") + "</div>";
  }

  function institutionsMarkup() {
    var details = Array.isArray(paper.institutionDetails) ? paper.institutionDetails : [];
    var cards = details.length ? details.map(function (item) {
      return "<article class=\"institution-record\"><span>" + ui.escapeHtml(item.order) +
        "</span><div><h3>" + ui.escapeHtml(item.name) + "</h3>" +
        richText(item.explanation) + "</div></article>";
    }).join("") : missingMarkup();
    var source = paper.institutionSource
      ? "<a class=\"record-external-link\" href=\"" + ui.escapeHtml(paper.institutionSource) +
      "\" target=\"_blank\" rel=\"noopener\">单位信息来源 <span aria-hidden=\"true\">↗</span></a>"
      : missingMarkup("单位来源未记录");
    return "<div class=\"institution-record-list\">" + cards + "</div><div class=\"institution-record-source\">" +
      source + "</div>";
  }

  function sidebarMarkup() {
    var links = [
      ["overview", "研究概览"], ["components", "方法组件"], ["profile", "技术画像"],
      ["contributions", "子问题贡献"], ["training-evaluation", "Training 与评测"],
      ["results", "主要结果"], ["limitations", "局限"], ["relations", "方法关系"],
      ["reproducibility", "复现"], ["evidence", "证据定位"], ["qa-notes", "阅读问答"],
      ["notes", "研究笔记"],
      ["citation-graph-section", "引用脉络"]
    ];
    return [
      "<aside class=\"paper-record-sidebar\"><nav aria-label=\"论文条目目录\"><p class=\"section-index\">RECORD INDEX</p>",
      links.map(function (link) {
        return "<a href=\"#" + link[0] + "\">" + ui.escapeHtml(link[1]) + "</a>";
      }).join(""), "</nav>",
      "<section><p class=\"section-index\">SUBPROBLEMS</p><div class=\"chip-row\">",
      ui.subproblemBadges(paper), "</div></section>",
      "<section><p class=\"section-index\">INSTITUTIONS</p>", institutionsMarkup(), "</section></aside>"
    ].join("");
  }

  function renderGraph() {
    if (!window.SDAtlasCitationGraph) return;
    window.SDAtlasCitationGraph.render(document.getElementById("citation-graph"), [paper], {
      title: paper.shortName + " 的引用前驱",
      focusId: paper.id,
      allPapers: ui.data.papers
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
    var mainSections = [
      recordSection("overview", "RESEARCH OVERVIEW", "研究概览",
        "<div class=\"record-lead\">" + richText(paper.methodOverview) + "</div>" + problemMarkup()),
      recordSection("components", "METHOD COMPONENTS", "方法组件", methodComponentsMarkup()),
      recordSection("profile", "TECHNICAL PROFILE", "技术画像", characteristicsMarkup()),
      recordSection("contributions", "SUBPROBLEM CONTRIBUTIONS", "子问题与贡献",
        "<div class=\"contribution-grid contribution-grid--paper\">" + ui.contributionPanels(paper) + "</div>"),
      recordSection("training-evaluation", "TRAINING & EVALUATION", "Training 与评测",
        trainingEvaluationMarkup()),
      recordSection("results", "MAIN RESULTS", "主要结果", resultsMarkup()),
      recordSection("limitations", "LIMITATIONS", "局限与适用边界", limitationsMarkup()),
      recordSection("relations", "METHOD RELATIONS", "方法关系", relationsMarkup(),
        "这里展示结构化方法关系；引用关系仅在下方 CiteGraph 中呈现。"),
      recordSection("reproducibility", "REPRODUCIBILITY", "复现信息", reproducibilityMarkup()),
      recordSection("evidence", "EVIDENCE", "证据定位", evidenceMarkup()),
      recordSection("qa-notes", "Q&A NOTES", "阅读问答", qaNotesMarkup(),
        "用于保存阅读过程中产生的问题与随后得到的回答。"),
      recordSection("notes", "NOTES", "研究笔记", notesMarkup())
    ].join("");

    root.innerHTML = [
      "<section class=\"paper-page-hero\"><div class=\"page-shell\">",
      "<nav class=\"breadcrumb\" aria-label=\"面包屑\"><a href=\"index.html\">论文索引</a><span>/</span>",
      "<a href=\"papers.html\">全部论文</a><span>/</span><span>", ui.escapeHtml(paper.shortName), "</span></nav>",
      "<div class=\"paper-page-hero__grid\"><div><p class=\"section-index\">PAPER RECORD</p>",
      "<h1>", ui.escapeHtml(paper.shortName), "</h1><p class=\"paper-page-title math-rich-text\">",
      ui.renderMathText(paper.title), "</p><div class=\"author-list author-list--hero\">",
      paper.authors.map(function (author) { return "<span>" + ui.escapeHtml(author) + "</span>"; }).join(""),
      "</div></div><aside class=\"paper-page-meta\"><div><span>会议 / 版本</span><strong>",
      ui.escapeHtml(paper.venue), "</strong></div><div><span>时间</span><strong>",
      ui.escapeHtml(paper.date), "</strong></div><div><span>站内引用 / 被引用</span><strong>",
      String(paper.citations.length), " / ", String(paper.citedBy.length),
      "</strong></div><div class=\"paper-page-actions\">", actions(), "</div></aside></div></div></section>",

      "<section class=\"paper-record-area\"><div class=\"page-shell paper-record-layout\">",
      sidebarMarkup(), "<main class=\"paper-record-main\">", mainSections, "</main></div></section>",

      "<section class=\"section section--tinted paper-citation-area\" id=\"citation-graph-section\"><div class=\"page-shell\">",
      "<header class=\"section-heading\"><p class=\"section-index\">CITATION GRAPH</p><h2>引用前驱</h2>",
      "<p>仅从本论文向其引用的既有论文递归展开，不加入只在后来引用本论文的工作。</p></header>",
      "<div id=\"citation-graph\"></div></div></section>"
    ].join("");
    renderGraph();
  }

  ui.mountChrome("papers");
  render();
  ui.initTooltips();
})();
