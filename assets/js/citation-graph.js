/*
 * Zero-dependency citation graph for SDAtlas result sets.
 *
 * Usage:
 *   SDAtlasCitationGraph.render(container, papers, options);
 *
 * Source data owns only forward `citations` references. An edge is rendered as
 * "citing paper -> cited paper" and only when both endpoints are present in
 * the supplied papers array. References outside that set are counted without
 * introducing nodes that would blur the current result boundary.
 */
(function () {
  "use strict";

  var graphSequence = 0;

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function finiteNumber(value, fallback) {
    var number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : fallback;
  }

  function referenceId(reference) {
    if (typeof reference === "string" || typeof reference === "number") {
      return String(reference).trim();
    }
    if (!reference || typeof reference !== "object") return "";
    return String(reference.id || reference.paperId || reference.targetId || "").trim();
  }

  function paperDate(paper) {
    var value = String(paper && paper.date || "").trim();
    return /^\d{4}(?:-\d{2})?$/.test(value) ? value : "日期未知";
  }

  function paperLabel(paper) {
    return String(paper.shortName || paper.title || paper.id || "未命名论文");
  }

  function paperHref(paper, options) {
    if (options && typeof options.paperHref === "function") {
      return options.paperHref(paper);
    }
    return "paper.html?id=" + encodeURIComponent(paper.id);
  }

  function comparePapers(left, right) {
    var leftDate = paperDate(left);
    var rightDate = paperDate(right);
    if (leftDate === "日期未知" && rightDate !== "日期未知") return 1;
    if (rightDate === "日期未知" && leftDate !== "日期未知") return -1;
    return leftDate.localeCompare(rightDate) ||
      Number(left.index || 0) - Number(right.index || 0) ||
      paperLabel(left).localeCompare(paperLabel(right), "en");
  }

  function normalizePapers(papers) {
    var seen = new Set();
    return (Array.isArray(papers) ? papers : []).filter(function (paper) {
      if (!paper || paper.id == null) return false;
      var id = String(paper.id).trim();
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    }).map(function (paper) {
      /* Keep the original object intact; callers may reuse it for their list. */
      return paper;
    }).sort(comparePapers);
  }

  function buildGraph(papers) {
    var paperById = new Map();
    papers.forEach(function (paper) { paperById.set(String(paper.id), paper); });

    var edges = [];
    var externalCount = 0;
    var outgoing = new Map();
    var incoming = new Map();

    papers.forEach(function (paper) {
      var sourceId = String(paper.id);
      var seenTargets = new Set();
      /* `citations` is the schema-v4 field. Accept the earlier `cites` spelling
         as a harmless compatibility fallback for callers with cached data. */
      var references = Array.isArray(paper.citations)
        ? paper.citations
        : (Array.isArray(paper.cites) ? paper.cites : []);
      references.forEach(function (reference) {
        var targetId = referenceId(reference);
        if (!targetId || targetId === sourceId || seenTargets.has(targetId)) return;
        seenTargets.add(targetId);
        if (!paperById.has(targetId)) {
          externalCount += 1;
          return;
        }
        edges.push({ source: paper, target: paperById.get(targetId) });
        outgoing.set(sourceId, (outgoing.get(sourceId) || 0) + 1);
        incoming.set(targetId, (incoming.get(targetId) || 0) + 1);
      });
    });

    edges.sort(function (left, right) {
      return comparePapers(left.source, right.source) || comparePapers(left.target, right.target);
    });
    return {
      nodes: papers,
      edges: edges,
      externalCount: externalCount,
      outgoing: outgoing,
      incoming: incoming
    };
  }

  function layoutGraph(graph, options) {
    options = options || {};
    var nodeWidth = finiteNumber(options.nodeWidth, 132);
    var nodeHeight = finiteNumber(options.nodeHeight, 58);
    var columnGap = finiteNumber(options.columnGap, 76);
    var rowGap = finiteNumber(options.rowGap, 18);
    var paddingX = finiteNumber(options.paddingX, 24);
    var paddingTop = finiteNumber(options.paddingTop, 66);
    var paddingBottom = finiteNumber(options.paddingBottom, 25);
    var columns = [];
    var columnByDate = new Map();

    graph.nodes.forEach(function (paper) {
      var date = paperDate(paper);
      if (!columnByDate.has(date)) {
        var column = { date: date, papers: [] };
        columnByDate.set(date, column);
        columns.push(column);
      }
      columnByDate.get(date).papers.push(paper);
    });

    var positions = new Map();
    var maxRows = 1;
    columns.forEach(function (column, columnIndex) {
      maxRows = Math.max(maxRows, column.papers.length);
      column.papers.forEach(function (paper, rowIndex) {
        positions.set(String(paper.id), {
          x: paddingX + columnIndex * (nodeWidth + columnGap),
          y: paddingTop + rowIndex * (nodeHeight + rowGap),
          width: nodeWidth,
          height: nodeHeight,
          column: columnIndex,
          row: rowIndex
        });
      });
    });

    var naturalWidth = paddingX * 2 + Math.max(1, columns.length) * nodeWidth +
      Math.max(0, columns.length - 1) * columnGap;
    var naturalHeight = paddingTop + maxRows * nodeHeight +
      Math.max(0, maxRows - 1) * rowGap + paddingBottom;
    return {
      columns: columns,
      positions: positions,
      width: Math.max(360, naturalWidth),
      height: Math.max(170, naturalHeight),
      nodeWidth: nodeWidth,
      nodeHeight: nodeHeight,
      axisY: 38
    };
  }

  function edgePath(edge, layout) {
    var source = layout.positions.get(String(edge.source.id));
    var target = layout.positions.get(String(edge.target.id));
    if (!source || !target) return "";

    var sourceY = source.y + source.height / 2;
    var targetY = target.y + target.height / 2;
    if (source.column === target.column) {
      var sameColumnX = source.x + source.width;
      var bend = sameColumnX + 34 + Math.abs(source.row - target.row) * 4;
      return "M " + sameColumnX + " " + sourceY +
        " C " + bend + " " + sourceY + ", " + bend + " " + targetY +
        ", " + sameColumnX + " " + targetY;
    }

    var targetIsLeft = target.x < source.x;
    var sourceX = targetIsLeft ? source.x : source.x + source.width;
    var targetX = targetIsLeft ? target.x + target.width : target.x;
    var middleX = (sourceX + targetX) / 2;
    return "M " + sourceX + " " + sourceY +
      " C " + middleX + " " + sourceY + ", " + middleX + " " + targetY +
      ", " + targetX + " " + targetY;
  }

  function axisMarkup(layout) {
    if (!layout.columns.length) return "";
    var firstX = layout.positions.get(String(layout.columns[0].papers[0].id)).x + layout.nodeWidth / 2;
    var lastColumn = layout.columns[layout.columns.length - 1];
    var lastX = layout.positions.get(String(lastColumn.papers[0].id)).x + layout.nodeWidth / 2;
    var line = "<line class=\"citation-graph__axis-line\" x1=\"" + firstX + "\" y1=\"" +
      layout.axisY + "\" x2=\"" + lastX + "\" y2=\"" + layout.axisY + "\"></line>";
    var ticks = layout.columns.map(function (column) {
      var position = layout.positions.get(String(column.papers[0].id));
      var x = position.x + layout.nodeWidth / 2;
      return "<line class=\"citation-graph__axis-tick\" x1=\"" + x + "\" y1=\"" +
        (layout.axisY - 4) + "\" x2=\"" + x + "\" y2=\"" +
        (layout.axisY + 7) + "\"></line>";
    }).join("");
    return line + ticks;
  }

  function timeLabelsMarkup(layout) {
    return layout.columns.map(function (column) {
      var position = layout.positions.get(String(column.papers[0].id));
      var center = position.x + layout.nodeWidth / 2;
      return "<span class=\"citation-graph__time\" style=\"left:" + center +
        "px\">" + escapeHtml(column.date) + "</span>";
    }).join("");
  }

  function edgesMarkup(graph, layout, markerId) {
    return graph.edges.map(function (edge) {
      var label = paperLabel(edge.source) + " 引用了 " + paperLabel(edge.target);
      return "<path class=\"citation-graph__edge\" d=\"" + edgePath(edge, layout) +
        "\" marker-end=\"url(#" + markerId + ")\"><title>" +
        escapeHtml(label) + "</title></path>";
    }).join("");
  }

  function nodesMarkup(graph, layout, options) {
    var focusId = options && options.focusId != null ? String(options.focusId) : "";
    return graph.nodes.map(function (paper) {
      var id = String(paper.id);
      var position = layout.positions.get(id);
      var shortName = paperLabel(paper);
      var fullTitle = String(paper.title || shortName);
      var degree = (graph.outgoing.get(id) || 0) + (graph.incoming.get(id) || 0);
      var className = "citation-graph__node" + (focusId === id ? " is-focused" : "") +
        (degree === 0 ? " is-isolated" : "");
      var aria = shortName + "，" + paperDate(paper) + "。进入论文详情";
      return [
        "<a class=\"" + className + "\" href=\"" + escapeHtml(paperHref(paper, options)) + "\"",
        " style=\"left:" + position.x + "px;top:" + position.y + "px;width:" +
          position.width + "px;min-height:" + position.height + "px\"",
        " aria-label=\"" + escapeHtml(aria) + "\" title=\"" + escapeHtml(fullTitle) + "\">",
        "<strong>" + escapeHtml(shortName) + "</strong><time>" +
          escapeHtml(paperDate(paper)) + "</time></a>"
      ].join("");
    }).join("");
  }

  function relationsMarkup(graph, options) {
    var label = graph.edges.length ? "文字版引用关系（" + graph.edges.length + "）" : "文字版引用关系";
    var content = graph.edges.length
      ? "<ol>" + graph.edges.map(function (edge) {
        return "<li><a href=\"" + escapeHtml(paperHref(edge.source, options)) + "\">" +
          escapeHtml(paperLabel(edge.source)) + "</a><span aria-label=\"引用了\"> → </span>" +
          "<a href=\"" + escapeHtml(paperHref(edge.target, options)) + "\">" +
          escapeHtml(paperLabel(edge.target)) + "</a></li>";
      }).join("") + "</ol>"
      : "<p>当前集合中暂无已记录的内部引用。</p>";
    return "<details class=\"citation-graph__relations\"><summary>" +
      escapeHtml(label) + "</summary>" + content + "</details>";
  }

  function resolveContainer(container) {
    if (typeof container === "string") return document.querySelector(container);
    return container;
  }

  function render(container, papers, options) {
    var target = resolveContainer(container);
    if (!target || typeof target.innerHTML !== "string") {
      throw new TypeError("SDAtlasCitationGraph.render requires a DOM container");
    }

    options = options || {};
    var normalized = normalizePapers(papers);
    var graph = buildGraph(normalized);
    var layout = layoutGraph(graph, options);
    graphSequence += 1;
    var titleId = "citation-graph-title-" + graphSequence;
    var markerId = "citation-arrow-" + graphSequence;
    var title = options.title || "当前集合引用关系";
    var emptyMessage = normalized.length
      ? "当前集合中暂无已记录的内部引用；论文节点仍按发表时间排列。"
      : "当前集合没有可展示的论文。";

    var viewport = normalized.length ? [
      "<div class=\"citation-graph__viewport\" tabindex=\"0\" aria-label=\"引用关系图，可横向滚动\">",
      "<div class=\"citation-graph__canvas\" style=\"width:" + layout.width + "px;height:" + layout.height + "px\">",
      "<svg class=\"citation-graph__svg\" viewBox=\"0 0 " + layout.width + " " + layout.height +
        "\" width=\"" + layout.width + "\" height=\"" + layout.height + "\" aria-hidden=\"true\">",
      "<defs><marker id=\"" + markerId + "\" markerWidth=\"8\" markerHeight=\"8\" refX=\"7\" refY=\"4\" orient=\"auto\" markerUnits=\"strokeWidth\">",
      "<path class=\"citation-graph__arrow\" d=\"M 0 0 L 8 4 L 0 8 z\"></path></marker></defs>",
      axisMarkup(layout), edgesMarkup(graph, layout, markerId), "</svg>",
      timeLabelsMarkup(layout), nodesMarkup(graph, layout, options),
      "</div></div>"
    ].join("") : "";

    target.innerHTML = [
      "<section class=\"citation-graph\" aria-labelledby=\"" + titleId + "\">",
      "<header class=\"citation-graph__header\"><div><p>DIRECTED CITATION GRAPH</p><h2 id=\"" +
        titleId + "\">" + escapeHtml(title) + "</h2></div>",
      "<dl class=\"citation-graph__stats\"><div><dt>论文</dt><dd>" + normalized.length +
        "</dd></div><div><dt>内部引用</dt><dd>" + graph.edges.length +
        "</dd></div><div><dt>指向集合外</dt><dd>" + graph.externalCount + "</dd></div></dl></header>",
      "<p class=\"citation-graph__legend\"><span aria-hidden=\"true\">A → B</span> 表示 A 引用了 B；图中只绘制当前结果集内部的引用。</p>",
      graph.edges.length ? "" : "<p class=\"citation-graph__notice\">" + escapeHtml(emptyMessage) + "</p>",
      viewport,
      graph.externalCount ? "<p class=\"citation-graph__outside\">另有 <strong>" +
        graph.externalCount + "</strong> 条已记录引用指向当前集合之外。</p>" : "",
      relationsMarkup(graph, options),
      "</section>"
    ].join("");

    return {
      nodeCount: normalized.length,
      edgeCount: graph.edges.length,
      externalCount: graph.externalCount,
      nodes: normalized.slice(),
      edges: graph.edges.slice()
    };
  }

  window.SDAtlasCitationGraph = { render: render };
})();
