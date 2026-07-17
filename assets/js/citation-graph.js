/*
 * Interactive paper-relation graph shared by every SDAtlas result page.
 *
 * Source relations are never rewritten here. For each visible result set, the
 * component performs a display-only, relation-aware transitive reduction:
 * when A -> C is already implied by an A -> B -> ... -> C path of the same
 * relation type, the direct A -> C stroke is omitted. The remaining graph is
 * layered so relation sources sit to the right of their targets.
 */
(function () {
  "use strict";

  var graphSequence = 0;
  var RELATION_DEFINITIONS = [
    { key: "extends", label: "直接扩展" },
    { key: "comparesAgainst", label: "实验比较" },
    { key: "related", label: "相关工作" },
    { key: "compatibleWith", label: "可组合" }
  ];

  function relationDefinition(key) {
    for (var index = 0; index < RELATION_DEFINITIONS.length; index += 1) {
      if (RELATION_DEFINITIONS[index].key === key) return RELATION_DEFINITIONS[index];
    }
    return { key: key, label: key };
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function finiteNumber(value, fallback) {
    var number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : fallback;
  }

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
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
    if (options && typeof options.paperHref === "function") return options.paperHref(paper);
    return "paper.html?id=" + encodeURIComponent(paper.id);
  }

  function comparePapers(left, right) {
    return Number(left.index || 0) - Number(right.index || 0) ||
      paperLabel(left).localeCompare(paperLabel(right), "en") ||
      String(left.id).localeCompare(String(right.id), "en");
  }

  function normalizePapers(papers) {
    var seen = new Set();
    return (Array.isArray(papers) ? papers : []).filter(function (paper) {
      if (!paper || paper.id == null) return false;
      var id = String(paper.id).trim();
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    }).slice().sort(comparePapers);
  }

  function pathExists(adjacency, startId, targetId, skippedEdge, relationType) {
    var stack = [startId];
    var visited = new Set([startId]);
    while (stack.length) {
      var current = stack.pop();
      var nextEdges = adjacency.get(current) || [];
      for (var index = 0; index < nextEdges.length; index += 1) {
        var edge = nextEdges[index];
        if (edge === skippedEdge) continue;
        if (relationType && edge.relationTypes.indexOf(relationType) === -1) continue;
        var nextId = String(edge.target.id);
        if (nextId === targetId) return true;
        if (!visited.has(nextId)) {
          visited.add(nextId);
          stack.push(nextId);
        }
      }
    }
    return false;
  }

  function transitiveReduction(nodes, rawEdges) {
    var adjacency = new Map();
    nodes.forEach(function (paper) { adjacency.set(String(paper.id), []); });
    rawEdges.forEach(function (edge) {
      adjacency.get(String(edge.source.id)).push(edge);
    });

    return rawEdges.filter(function (edge) {
      var sourceId = String(edge.source.id);
      var targetId = String(edge.target.id);
      /*
       * Cyclic graphs have no unique transitive reduction. Preserve edges
       * whose endpoints are mutually reachable and reduce the acyclic part.
       */
      return edge.relationTypes.some(function (relationType) {
        if (pathExists(adjacency, targetId, sourceId, null, relationType)) return true;
        return !pathExists(adjacency, sourceId, targetId, edge, relationType);
      });
    });
  }

  function collapseReciprocalRelatedEdges(rawEdges) {
    var edgeByKey = new Map();
    rawEdges.forEach(function (edge) { edgeByKey.set(edge.key, edge); });
    return rawEdges.filter(function (edge) {
      /*
       * `related` is symmetric in meaning. If both source files record the
       * same pure relation, draw it once so the display graph remains
       * layerable from right to left. The stable paper order only chooses
       * the visible arrow direction; neither source relation is rewritten.
       */
      if (edge.relationTypes.length !== 1 || edge.relationTypes[0] !== "related") {
        return true;
      }
      var reverse = edgeByKey.get(String(edge.target.id) + "->" + String(edge.source.id));
      if (!reverse || reverse.relationTypes.length !== 1 ||
          reverse.relationTypes[0] !== "related") return true;
      return comparePapers(edge.source, edge.target) > 0;
    });
  }

  function buildGraph(papers) {
    var paperById = new Map();
    papers.forEach(function (paper) { paperById.set(String(paper.id), paper); });
    var rawEdges = [];
    var externalCount = 0;

    papers.forEach(function (paper) {
      var sourceId = String(paper.id);
      var edgeByTarget = new Map();
      var relations = paper.relations && typeof paper.relations === "object"
        ? paper.relations : null;
      var hasStructuredRelations = relations && RELATION_DEFINITIONS.some(function (definition) {
        return Array.isArray(relations[definition.key]);
      });
      var definitions = hasStructuredRelations
        ? RELATION_DEFINITIONS
        : [{ key: "related", label: "相关工作", fallback: true }];

      definitions.forEach(function (definition) {
        var references = definition.fallback
          ? (Array.isArray(paper.citations) ? paper.citations : [])
          : relations[definition.key];
        if (!Array.isArray(references)) return;
        references.forEach(function (reference) {
          var targetId = referenceId(reference);
          if (!targetId || targetId === sourceId) return;
          var edge = edgeByTarget.get(targetId);
          if (!edge) {
            edge = {
              source: paper,
              targetId: targetId,
              relationTypes: [],
              key: sourceId + "->" + targetId
            };
            edgeByTarget.set(targetId, edge);
          }
          if (edge.relationTypes.indexOf(definition.key) === -1) {
            edge.relationTypes.push(definition.key);
          }
        });
      });

      edgeByTarget.forEach(function (edge, targetId) {
        if (!paperById.has(targetId)) {
          externalCount += 1;
          return;
        }
        edge.target = paperById.get(targetId);
        rawEdges.push(edge);
      });
    });

    rawEdges.sort(function (left, right) {
      return comparePapers(left.source, right.source) || comparePapers(left.target, right.target);
    });
    var directionalEdges = collapseReciprocalRelatedEdges(rawEdges);
    var edges = transitiveReduction(papers, directionalEdges);
    var outgoing = new Map();
    var incoming = new Map();
    edges.forEach(function (edge) {
      var sourceId = String(edge.source.id);
      var targetId = String(edge.target.id);
      outgoing.set(sourceId, (outgoing.get(sourceId) || 0) + 1);
      incoming.set(targetId, (incoming.get(targetId) || 0) + 1);
    });
    return {
      nodes: papers,
      rawEdges: rawEdges,
      edges: edges,
      prunedCount: rawEdges.length - edges.length,
      externalCount: externalCount,
      outgoing: outgoing,
      incoming: incoming
    };
  }

  function stronglyConnectedComponents(graph) {
    var adjacency = new Map();
    graph.nodes.forEach(function (paper) { adjacency.set(String(paper.id), []); });
    graph.edges.forEach(function (edge) {
      adjacency.get(String(edge.source.id)).push(String(edge.target.id));
    });
    var nextIndex = 0;
    var indices = new Map();
    var lowLinks = new Map();
    var stack = [];
    var onStack = new Set();
    var components = [];

    function visit(id) {
      indices.set(id, nextIndex);
      lowLinks.set(id, nextIndex);
      nextIndex += 1;
      stack.push(id);
      onStack.add(id);
      (adjacency.get(id) || []).forEach(function (targetId) {
        if (!indices.has(targetId)) {
          visit(targetId);
          lowLinks.set(id, Math.min(lowLinks.get(id), lowLinks.get(targetId)));
        } else if (onStack.has(targetId)) {
          lowLinks.set(id, Math.min(lowLinks.get(id), indices.get(targetId)));
        }
      });
      if (lowLinks.get(id) !== indices.get(id)) return;
      var component = [];
      var member = "";
      do {
        member = stack.pop();
        onStack.delete(member);
        component.push(member);
      } while (member !== id);
      components.push(component);
    }

    graph.nodes.forEach(function (paper) {
      var id = String(paper.id);
      if (!indices.has(id)) visit(id);
    });
    return components;
  }

  function rankGraph(graph) {
    var components = stronglyConnectedComponents(graph);
    var componentById = new Map();
    components.forEach(function (component, componentIndex) {
      component.forEach(function (id) { componentById.set(id, componentIndex); });
    });
    var componentOutgoing = components.map(function () { return new Set(); });
    graph.edges.forEach(function (edge) {
      var sourceComponent = componentById.get(String(edge.source.id));
      var targetComponent = componentById.get(String(edge.target.id));
      if (sourceComponent !== targetComponent) {
        componentOutgoing[sourceComponent].add(targetComponent);
      }
    });
    var rankMemo = new Map();
    function componentRank(componentIndex) {
      if (rankMemo.has(componentIndex)) return rankMemo.get(componentIndex);
      var rank = 0;
      componentOutgoing[componentIndex].forEach(function (targetComponent) {
        rank = Math.max(rank, componentRank(targetComponent) + 1);
      });
      rankMemo.set(componentIndex, rank);
      return rank;
    }
    var rankById = new Map();
    graph.nodes.forEach(function (paper) {
      var id = String(paper.id);
      rankById.set(id, componentRank(componentById.get(id)));
    });
    return rankById;
  }

  function neighborMaps(graph) {
    var outgoing = new Map();
    var incoming = new Map();
    graph.nodes.forEach(function (paper) {
      outgoing.set(String(paper.id), []);
      incoming.set(String(paper.id), []);
    });
    graph.edges.forEach(function (edge) {
      var sourceId = String(edge.source.id);
      var targetId = String(edge.target.id);
      outgoing.get(sourceId).push(targetId);
      incoming.get(targetId).push(sourceId);
    });
    return { outgoing: outgoing, incoming: incoming };
  }

  function normalizedOrder(layers) {
    var order = new Map();
    layers.forEach(function (layer) {
      var denominator = Math.max(1, layer.papers.length);
      layer.papers.forEach(function (paper, row) {
        order.set(String(paper.id), (row + 0.5) / denominator);
      });
    });
    return order;
  }

  function sortLayer(layer, neighbors, order) {
    var previous = new Map();
    layer.papers.forEach(function (paper, index) {
      previous.set(String(paper.id), index);
    });
    layer.papers.sort(function (left, right) {
      function score(paper) {
        var values = (neighbors.get(String(paper.id)) || [])
          .filter(function (id) { return order.has(id); })
          .map(function (id) { return order.get(id); });
        if (!values.length) return null;
        return values.reduce(function (sum, value) { return sum + value; }, 0) / values.length;
      }
      var leftScore = score(left);
      var rightScore = score(right);
      if (leftScore != null && rightScore != null && leftScore !== rightScore) {
        return leftScore - rightScore;
      }
      if (leftScore != null && rightScore == null) return -1;
      if (rightScore != null && leftScore == null) return 1;
      return previous.get(String(left.id)) - previous.get(String(right.id)) ||
        comparePapers(left, right);
    });
  }

  function orderedLayers(graph, rankById) {
    var maximumRank = 0;
    graph.nodes.forEach(function (paper) {
      maximumRank = Math.max(maximumRank, rankById.get(String(paper.id)) || 0);
    });
    var layers = [];
    for (var rank = 0; rank <= maximumRank; rank += 1) {
      layers.push({ rank: rank, papers: [] });
    }
    graph.nodes.forEach(function (paper) {
      layers[rankById.get(String(paper.id)) || 0].papers.push(paper);
    });
    layers.forEach(function (layer) { layer.papers.sort(comparePapers); });
    var maps = neighborMaps(graph);
    for (var iteration = 0; iteration < 10; iteration += 1) {
      var order = normalizedOrder(layers);
      for (var leftToRight = 1; leftToRight < layers.length; leftToRight += 1) {
        sortLayer(layers[leftToRight], maps.outgoing, order);
        order = normalizedOrder(layers);
      }
      for (var rightToLeft = layers.length - 2; rightToLeft >= 0; rightToLeft -= 1) {
        sortLayer(layers[rightToLeft], maps.incoming, order);
        order = normalizedOrder(layers);
      }
    }
    return layers;
  }

  function assignOuterRoutes(graph, layers, rankById) {
    var rowById = new Map();
    var layerSize = new Map();
    layers.forEach(function (layer) {
      layer.papers.forEach(function (paper, row) {
        rowById.set(String(paper.id), row);
        layerSize.set(String(paper.id), layer.papers.length);
      });
    });
    var candidates = graph.edges.filter(function (edge) {
      var span = Math.abs(
        (rankById.get(String(edge.source.id)) || 0) -
        (rankById.get(String(edge.target.id)) || 0)
      );
      return span !== 1;
    }).sort(function (left, right) {
      var leftSpan = Math.abs(
        (rankById.get(String(left.source.id)) || 0) -
        (rankById.get(String(left.target.id)) || 0)
      );
      var rightSpan = Math.abs(
        (rankById.get(String(right.source.id)) || 0) -
        (rankById.get(String(right.target.id)) || 0)
      );
      return rightSpan - leftSpan || left.key.localeCompare(right.key);
    });
    var routes = new Map();
    var topCount = 0;
    var bottomCount = 0;
    candidates.forEach(function (edge) {
      function rowPosition(paper) {
        var id = String(paper.id);
        return (rowById.get(id) + 0.5) / Math.max(1, layerSize.get(id));
      }
      var average = (rowPosition(edge.source) + rowPosition(edge.target)) / 2;
      var side = average <= 0.5 ? "top" : "bottom";
      if (side === "top" && topCount > bottomCount + 2) side = "bottom";
      if (side === "bottom" && bottomCount > topCount + 2) side = "top";
      var lane = side === "top" ? topCount++ : bottomCount++;
      routes.set(edge, { side: side, lane: lane });
    });
    return { routes: routes, topCount: topCount, bottomCount: bottomCount };
  }

  function portOffsets(graph, positions, nodeHeight) {
    var result = new Map();
    graph.edges.forEach(function (edge) {
      result.set(edge, { source: 0, target: 0 });
    });
    function apply(groups, side) {
      groups.forEach(function (edges) {
        edges.sort(function (left, right) {
          var leftPaper = side === "source" ? left.target : left.source;
          var rightPaper = side === "source" ? right.target : right.source;
          var leftPosition = positions.get(String(leftPaper.id));
          var rightPosition = positions.get(String(rightPaper.id));
          return leftPosition.y - rightPosition.y || leftPosition.x - rightPosition.x;
        });
        var span = Math.min(nodeHeight * 0.52, Math.max(0, edges.length - 1) * 8);
        edges.forEach(function (edge, index) {
          var offset = edges.length === 1 ? 0 : -span / 2 + span * index / (edges.length - 1);
          result.get(edge)[side] = offset;
        });
      });
    }
    var bySource = new Map();
    var byTarget = new Map();
    graph.edges.forEach(function (edge) {
      var sourceId = String(edge.source.id);
      var targetId = String(edge.target.id);
      if (!bySource.has(sourceId)) bySource.set(sourceId, []);
      if (!byTarget.has(targetId)) byTarget.set(targetId, []);
      bySource.get(sourceId).push(edge);
      byTarget.get(targetId).push(edge);
    });
    apply(bySource, "source");
    apply(byTarget, "target");
    return result;
  }

  function layoutGraph(graph, options) {
    options = options || {};
    var nodeWidth = finiteNumber(options.nodeWidth, 150);
    var nodeHeight = finiteNumber(options.nodeHeight, 70);
    var columnGap = finiteNumber(options.columnGap, 28);
    var rowGap = finiteNumber(options.rowGap, 14);
    var paddingX = finiteNumber(options.paddingX, 32);
    var laneGap = finiteNumber(options.laneGap, 12);
    var rankById = rankGraph(graph);
    var layers = orderedLayers(graph, rankById);
    var outer = assignOuterRoutes(graph, layers, rankById);
    var paddingTop = 32 + outer.topCount * laneGap;
    var paddingBottom = 32 + outer.bottomCount * laneGap;
    var maximumRows = Math.max.apply(null, [1].concat(layers.map(function (layer) {
      return layer.papers.length;
    })));
    var contentHeight = maximumRows * nodeHeight + Math.max(0, maximumRows - 1) * rowGap;
    var positions = new Map();
    layers.forEach(function (layer, column) {
      var columnHeight = layer.papers.length * nodeHeight +
        Math.max(0, layer.papers.length - 1) * rowGap;
      var offsetY = (contentHeight - columnHeight) / 2;
      layer.papers.forEach(function (paper, row) {
        positions.set(String(paper.id), {
          x: paddingX + column * (nodeWidth + columnGap),
          y: paddingTop + offsetY + row * (nodeHeight + rowGap),
          width: nodeWidth,
          height: nodeHeight,
          column: column,
          row: row
        });
      });
    });
    var width = paddingX * 2 + Math.max(1, layers.length) * nodeWidth +
      Math.max(0, layers.length - 1) * columnGap;
    var height = paddingTop + contentHeight + paddingBottom;
    return {
      layers: layers,
      positions: positions,
      rankById: rankById,
      outerRoutes: outer.routes,
      ports: portOffsets(graph, positions, nodeHeight),
      width: Math.max(420, width),
      height: Math.max(230, height),
      nodeWidth: nodeWidth,
      nodeHeight: nodeHeight,
      columnGap: columnGap,
      laneGap: laneGap,
      paddingTop: paddingTop,
      contentBottom: paddingTop + contentHeight
    };
  }

  function orthogonalPath(points) {
    return points.map(function (point, index) {
      return (index ? " L " : "M ") + point.x + " " + point.y;
    }).join("");
  }

  function edgePoints(edge, layout) {
    var source = layout.positions.get(String(edge.source.id));
    var target = layout.positions.get(String(edge.target.id));
    if (!source || !target) return [];
    var offsets = layout.ports.get(edge) || { source: 0, target: 0 };
    var sourceY = source.y + source.height / 2 + offsets.source;
    var targetY = target.y + target.height / 2 + offsets.target;
    if (source.column === target.column) {
      var sideX = source.x + source.width + Math.min(46, layout.columnGap * 0.42);
      return [
        { x: source.x + source.width, y: sourceY },
        { x: sideX, y: sourceY },
        { x: sideX, y: targetY },
        { x: target.x + target.width, y: targetY }
      ];
    }
    var sourceIsRight = source.column > target.column;
    var sourceX = sourceIsRight ? source.x : source.x + source.width;
    var targetX = sourceIsRight ? target.x + target.width : target.x;
    var span = Math.abs(source.column - target.column);
    if (span === 1) {
      var middleX = (sourceX + targetX) / 2;
      return [
        { x: sourceX, y: sourceY },
        { x: middleX, y: sourceY },
        { x: middleX, y: targetY },
        { x: targetX, y: targetY }
      ];
    }
    var route = layout.outerRoutes.get(edge) || { side: "top", lane: 0 };
    var sourceLaneX = sourceIsRight
      ? source.x - Math.min(40, layout.columnGap * 0.36)
      : source.x + source.width + Math.min(40, layout.columnGap * 0.36);
    var targetLaneX = sourceIsRight
      ? target.x + target.width + Math.min(40, layout.columnGap * 0.36)
      : target.x - Math.min(40, layout.columnGap * 0.36);
    var laneY = route.side === "top"
      ? layout.paddingTop - 18 - route.lane * layout.laneGap
      : layout.contentBottom + 18 + route.lane * layout.laneGap;
    return [
      { x: sourceX, y: sourceY },
      { x: sourceLaneX, y: sourceY },
      { x: sourceLaneX, y: laneY },
      { x: targetLaneX, y: laneY },
      { x: targetLaneX, y: targetY },
      { x: targetX, y: targetY }
    ];
  }

  function routeMidpoint(points) {
    var segments = [];
    var total = 0;
    for (var index = 1; index < points.length; index += 1) {
      var start = points[index - 1];
      var end = points[index];
      var dx = end.x - start.x;
      var dy = end.y - start.y;
      var length = Math.sqrt(dx * dx + dy * dy);
      segments.push({ start: start, end: end, length: length });
      total += length;
    }
    var remaining = total / 2;
    for (var segmentIndex = 0; segmentIndex < segments.length; segmentIndex += 1) {
      var segment = segments[segmentIndex];
      if (remaining <= segment.length || segmentIndex === segments.length - 1) {
        var ratio = segment.length ? remaining / segment.length : 0;
        return {
          x: segment.start.x + (segment.end.x - segment.start.x) * ratio,
          y: segment.start.y + (segment.end.y - segment.start.y) * ratio
        };
      }
      remaining -= segment.length;
    }
    return points[0] || { x: 0, y: 0 };
  }

  function relationTypeText(edge, detailed) {
    return edge.relationTypes.map(function (type) {
      var definition = relationDefinition(type);
      return detailed ? "relations." + definition.key + "（" + definition.label + "）" : definition.key;
    }).join(detailed ? "、" : " / ");
  }

  function edgesMarkup(graph, layout, markerId) {
    return graph.edges.map(function (edge) {
      var sourceId = String(edge.source.id);
      var targetId = String(edge.target.id);
      var sourcePosition = layout.positions.get(sourceId);
      var targetPosition = layout.positions.get(targetId);
      var routeClass = Math.abs(sourcePosition.column - targetPosition.column) === 1
        ? "" : " is-outer-route";
      var points = edgePoints(edge, layout);
      var path = orthogonalPath(points);
      var midpoint = routeMidpoint(points);
      var typeText = relationTypeText(edge, true);
      var shortTypeText = relationTypeText(edge, false);
      var label = paperLabel(edge.source) + " → " + paperLabel(edge.target) + "｜" + typeText;
      var typeClasses = edge.relationTypes.map(function (type) {
        return " relation-" + type;
      }).join("");
      return [
        "<g class=\"citation-graph__edge-group" + routeClass + typeClasses +
          "\" data-source=\"" + escapeHtml(sourceId) + "\" data-target=\"" +
          escapeHtml(targetId) + "\" data-relation-types=\"" +
          escapeHtml(edge.relationTypes.join(",")) + "\">",
        "<path class=\"citation-graph__edge" + routeClass + "\" d=\"" + path +
          "\" marker-end=\"url(#" + markerId + ")\"><title>" +
          escapeHtml(label) + "</title></path>",
        "<path class=\"citation-graph__edge-hit\" d=\"" + path +
          "\" tabindex=\"0\" role=\"img\" aria-label=\"" + escapeHtml(label) +
          "\" data-edge-label=\"" + escapeHtml(label) + "\"><title>" +
          escapeHtml(label) + "</title></path>",
        "<text class=\"citation-graph__edge-relation\" x=\"" + midpoint.x + "\" y=\"" +
          (midpoint.y - 5) + "\" text-anchor=\"middle\">" + escapeHtml(shortTypeText) + "</text>",
        "</g>"
      ].join("");
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
        "<a class=\"" + className + "\" data-paper-id=\"" + escapeHtml(id) +
          "\" href=\"" + escapeHtml(paperHref(paper, options)) + "\"",
        " style=\"left:" + position.x + "px;top:" + position.y + "px;width:" +
          position.width + "px;height:" + position.height + "px\"",
        " aria-label=\"" + escapeHtml(aria) + "\" title=\"" + escapeHtml(fullTitle) + "\">",
        "<strong>" + escapeHtml(shortName) + "</strong><time>" +
          escapeHtml(paperDate(paper)) + "</time></a>"
      ].join("");
    }).join("");
  }

  function resolveContainer(container) {
    if (typeof container === "string") return document.querySelector(container);
    return container;
  }

  function initializeInteraction(target, layout, options) {
    var viewport = target.querySelector(".citation-graph__viewport");
    var world = target.querySelector(".citation-graph__world");
    var controls = target.querySelector(".citation-graph__controls");
    var zoomValue = target.querySelector(".citation-graph__zoom-value");
    var edgeTooltip = target.querySelector(".citation-graph__edge-tooltip");
    if (!viewport || !world || !controls) return function () {};
    var minimumScale = finiteNumber(options.minScale, 0.18);
    var maximumScale = finiteNumber(options.maxScale, 2.4);
    var state = { x: 0, y: 0, scale: 1 };
    var drag = null;
    var resizeObserver = null;
    var frame = 0;
    var relationLabelScale = finiteNumber(options.relationLabelScale, 1.05);

    function apply() {
      world.style.transform = "translate(" + state.x + "px," + state.y + "px) scale(" +
        state.scale + ")";
      if (zoomValue) zoomValue.textContent = Math.round(state.scale * 100) + "%";
      viewport.classList.toggle("is-detail-scale", state.scale >= relationLabelScale);
    }
    function edgeHitTarget(event) {
      return event.target && event.target.closest
        ? event.target.closest(".citation-graph__edge-hit") : null;
    }
    function hideEdgeTooltip(mode) {
      if (!edgeTooltip) return;
      if (mode && edgeTooltip.getAttribute("data-mode") !== mode) return;
      edgeTooltip.hidden = true;
      edgeTooltip.removeAttribute("data-mode");
    }
    function showEdgeTooltip(hit, clientX, clientY, mode) {
      if (!edgeTooltip || !hit) return;
      var rectangle = viewport.getBoundingClientRect();
      edgeTooltip.textContent = hit.getAttribute("data-edge-label") || hit.getAttribute("aria-label") || "";
      edgeTooltip.hidden = false;
      edgeTooltip.setAttribute("data-mode", mode);
      var maximumX = Math.max(8, rectangle.width - edgeTooltip.offsetWidth - 8);
      var maximumY = Math.max(8, rectangle.height - edgeTooltip.offsetHeight - 8);
      edgeTooltip.style.left = clamp(clientX - rectangle.left + 12, 8, maximumX) + "px";
      edgeTooltip.style.top = clamp(clientY - rectangle.top + 14, 8, maximumY) + "px";
    }
    function onEdgePointerMove(event) {
      if (drag) return;
      var hit = edgeHitTarget(event);
      if (hit) {
        showEdgeTooltip(hit, event.clientX, event.clientY, "pointer");
      } else {
        hideEdgeTooltip("pointer");
      }
    }
    function onEdgeFocusIn(event) {
      var hit = edgeHitTarget(event);
      if (!hit) return;
      var rectangle = hit.getBoundingClientRect();
      showEdgeTooltip(hit, rectangle.left + rectangle.width / 2,
        rectangle.top + rectangle.height / 2, "focus");
    }
    function onEdgeFocusOut(event) {
      if (edgeHitTarget(event)) hideEdgeTooltip("focus");
    }
    function onEdgePointerLeave() {
      hideEdgeTooltip("pointer");
    }
    function zoomAt(nextScale, clientX, clientY) {
      hideEdgeTooltip();
      nextScale = clamp(nextScale, minimumScale, maximumScale);
      var rectangle = viewport.getBoundingClientRect();
      var localX = clientX - rectangle.left;
      var localY = clientY - rectangle.top;
      var worldX = (localX - state.x) / state.scale;
      var worldY = (localY - state.y) / state.scale;
      state.x = localX - worldX * nextScale;
      state.y = localY - worldY * nextScale;
      state.scale = nextScale;
      apply();
    }
    function zoomFromCenter(factor) {
      var rectangle = viewport.getBoundingClientRect();
      zoomAt(state.scale * factor, rectangle.left + rectangle.width / 2,
        rectangle.top + rectangle.height / 2);
    }
    function readableScale() {
      if (options.readableScale != null) {
        return finiteNumber(options.readableScale, 0.66);
      }
      if (viewport.clientWidth >= 1000) return 0.66;
      if (viewport.clientWidth >= 720) return 0.61;
      if (viewport.clientWidth >= 480) return 0.54;
      return 0.48;
    }
    function fit(preferReadable) {
      var availableWidth = Math.max(1, viewport.clientWidth - 34);
      var availableHeight = Math.max(1, viewport.clientHeight - 34);
      var fitted = Math.min(1, availableWidth / layout.width,
        availableHeight / layout.height);
      var desired = preferReadable && fitted < 1
        ? Math.max(fitted, readableScale())
        : fitted;
      state.scale = clamp((preferReadable ? Math.round(desired * 100) :
        Math.floor(desired * 100)) / 100, minimumScale, maximumScale);
      state.x = Math.round((viewport.clientWidth - layout.width * state.scale) / 2);
      state.y = Math.round((viewport.clientHeight - layout.height * state.scale) / 2);
      apply();
    }
    function onWheel(event) {
      event.preventDefault();
      zoomAt(state.scale * Math.exp(-event.deltaY * 0.0015), event.clientX, event.clientY);
    }
    function onPointerDown(event) {
      if (event.button !== 0 || event.target.closest(
        ".citation-graph__node, .citation-graph__edge-hit")) return;
      hideEdgeTooltip();
      drag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
      viewport.setPointerCapture(event.pointerId);
      viewport.classList.add("is-dragging");
    }
    function onPointerMove(event) {
      if (!drag || drag.pointerId !== event.pointerId) return;
      state.x += event.clientX - drag.x;
      state.y += event.clientY - drag.y;
      drag.x = event.clientX;
      drag.y = event.clientY;
      apply();
    }
    function finishPointer(event) {
      if (!drag || drag.pointerId !== event.pointerId) return;
      drag = null;
      viewport.classList.remove("is-dragging");
      if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    }
    function onKeyDown(event) {
      var handled = true;
      if (event.key === "ArrowLeft") state.x -= 38;
      else if (event.key === "ArrowRight") state.x += 38;
      else if (event.key === "ArrowUp") state.y -= 38;
      else if (event.key === "ArrowDown") state.y += 38;
      else if (event.key === "+" || event.key === "=") zoomFromCenter(1.18);
      else if (event.key === "-") zoomFromCenter(1 / 1.18);
      else if (event.key === "0") fit(false);
      else handled = false;
      if (handled) {
        event.preventDefault();
        apply();
      }
    }
    function onControlClick(event) {
      var button = event.target.closest("[data-graph-action]");
      if (!button) return;
      var action = button.getAttribute("data-graph-action");
      if (action === "zoom-in") zoomFromCenter(1.22);
      if (action === "zoom-out") zoomFromCenter(1 / 1.22);
      if (action === "fit") fit(false);
    }

    viewport.addEventListener("wheel", onWheel, { passive: false });
    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointermove", onEdgePointerMove);
    viewport.addEventListener("pointerleave", onEdgePointerLeave);
    viewport.addEventListener("pointerup", finishPointer);
    viewport.addEventListener("pointercancel", finishPointer);
    viewport.addEventListener("keydown", onKeyDown);
    viewport.addEventListener("focusin", onEdgeFocusIn);
    viewport.addEventListener("focusout", onEdgeFocusOut);
    controls.addEventListener("click", onControlClick);
    frame = window.requestAnimationFrame(function () { fit(true); });
    if (typeof ResizeObserver === "function") {
      var previousWidth = 0;
      resizeObserver = new ResizeObserver(function (entries) {
        var width = entries[0] ? entries[0].contentRect.width : viewport.clientWidth;
        if (Math.abs(width - previousWidth) < 1) return;
        previousWidth = width;
        fit(true);
      });
      resizeObserver.observe(viewport);
    }
    return function () {
      window.cancelAnimationFrame(frame);
      if (resizeObserver) resizeObserver.disconnect();
      viewport.removeEventListener("wheel", onWheel);
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointermove", onPointerMove);
      viewport.removeEventListener("pointermove", onEdgePointerMove);
      viewport.removeEventListener("pointerleave", onEdgePointerLeave);
      viewport.removeEventListener("pointerup", finishPointer);
      viewport.removeEventListener("pointercancel", finishPointer);
      viewport.removeEventListener("keydown", onKeyDown);
      viewport.removeEventListener("focusin", onEdgeFocusIn);
      viewport.removeEventListener("focusout", onEdgeFocusOut);
      controls.removeEventListener("click", onControlClick);
    };
  }

  function render(container, papers, options) {
    var target = resolveContainer(container);
    if (!target || typeof target.innerHTML !== "string") {
      throw new TypeError("SDAtlasCitationGraph.render requires a DOM container");
    }
    if (typeof target._citationGraphCleanup === "function") target._citationGraphCleanup();
    options = options || {};
    var normalized = normalizePapers(papers);
    var graph = buildGraph(normalized);
    var layout = layoutGraph(graph, options);
    graphSequence += 1;
    var titleId = "citation-graph-title-" + graphSequence;
    var markerId = "citation-arrow-" + graphSequence;
    var title = options.title || "当前集合的论文关系";
    var emptyMessage = normalized.length
      ? "当前集合中暂无已记录的内部论文关系。"
      : "当前集合没有可展示的论文。";
    var viewport = normalized.length ? [
      "<div class=\"citation-graph__interactionbar\"><div class=\"citation-graph__controls\" " +
        "role=\"group\" aria-label=\"论文关系图缩放控制\">",
      "<button type=\"button\" data-graph-action=\"zoom-out\" aria-label=\"缩小论文关系图\">−</button>",
      "<output class=\"citation-graph__zoom-value\" aria-live=\"polite\">100%</output>",
      "<button type=\"button\" data-graph-action=\"zoom-in\" aria-label=\"放大论文关系图\">＋</button>",
      "<button class=\"citation-graph__fit\" type=\"button\" data-graph-action=\"fit\">适配</button>",
      "</div></div>",
      "<div class=\"citation-graph__viewport\" tabindex=\"0\"",
      " aria-label=\"论文关系图；拖动可平移，滚轮、加减键或按钮可缩放，方向键可移动；悬停或聚焦连线可查看关系类型\">",
      "<div class=\"citation-graph__world\" style=\"width:" + layout.width +
        "px;height:" + layout.height + "px\">",
      "<svg class=\"citation-graph__svg\" viewBox=\"0 0 " + layout.width + " " + layout.height +
        "\" width=\"" + layout.width + "\" height=\"" + layout.height +
        "\" role=\"group\" aria-label=\"论文关系连线\">",
      "<defs><marker id=\"" + markerId +
        "\" markerWidth=\"5\" markerHeight=\"5\" refX=\"4.6\" refY=\"2.5\" orient=\"auto\" markerUnits=\"strokeWidth\">",
      "<path class=\"citation-graph__arrow\" d=\"M 0 0 L 5 2.5 L 0 5 z\"></path></marker></defs>",
      edgesMarkup(graph, layout, markerId), "</svg>",
      nodesMarkup(graph, layout, options),
      "</div><div class=\"citation-graph__edge-tooltip\" role=\"tooltip\" hidden></div></div>"
    ].join("") : "";
    target.innerHTML = [
      "<section class=\"citation-graph\" aria-labelledby=\"" + titleId + "\">",
      "<header class=\"citation-graph__header\"><div><p>PRUNED RELATION GRAPH</p><h2 id=\"" +
        titleId + "\">" + escapeHtml(title) + "</h2></div>",
      "<dl class=\"citation-graph__stats\"><div><dt>论文</dt><dd>" + normalized.length +
        "</dd></div><div><dt>显示边</dt><dd>" + graph.edges.length +
      "</dd></div><div><dt>已约简</dt><dd>" + graph.prunedCount + "</dd></div></dl></header>",
      "<p class=\"citation-graph__legend\"><span aria-hidden=\"true\">右 → 左</span> " +
        "右侧论文指向左侧论文；同类型 relation 的传递边与双向 related 重复边仅在显示层省略。</p>",
      graph.edges.length ? "" : "<p class=\"citation-graph__notice\">" +
        escapeHtml(emptyMessage) + "</p>",
      viewport,
      graph.externalCount ? "<p class=\"citation-graph__outside\">另有 <strong>" +
        graph.externalCount + "</strong> 条已记录关系指向当前集合之外。</p>" : "",
      "</section>"
    ].join("");
    target._citationGraphCleanup = normalized.length
      ? initializeInteraction(target, layout, options)
      : function () {};
    return {
      nodeCount: normalized.length,
      rawEdgeCount: graph.rawEdges.length,
      edgeCount: graph.edges.length,
      prunedCount: graph.prunedCount,
      externalCount: graph.externalCount,
      nodes: normalized.slice(),
      edges: graph.edges.slice()
    };
  }

  window.SDAtlasCitationGraph = { render: render };
})();
