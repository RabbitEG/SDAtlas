/* Boolean explorer for the unified A–E subproblem taxonomy. */
(function () {
  "use strict";

  var ui = window.SDAtlasUI;
  var data = ui.data;
  var params = new URLSearchParams(window.location.search);
  var state = {
    subproblems: new Set(),
    mode: params.get("mode") === "intersection" ? "intersection" : "union",
    query: "",
    sort: "index"
  };

  var initial = params.get("subproblem") || params.get("question") || "";
  initial.split(",").filter(Boolean).forEach(function (value) {
    var item = ui.getSubproblem(value);
    if (item) state.subproblems.add(item.code);
  });

  function optionMarkup(item) {
    var selected = state.subproblems.has(item.code);
    var id = "filter-subproblem-" + item.code;
    return [
      "<label class=\"filter-option\" style=\"" + ui.itemStyle(item) + "\" for=\"" + id + "\">",
      "<input id=\"" + id + "\" type=\"checkbox\" data-subproblem value=\"" +
        ui.escapeHtml(item.code) + "\"" + (selected ? " checked" : "") + ">",
      "<span class=\"option-check\" aria-hidden=\"true\"></span><span class=\"option-code\">" +
        ui.escapeHtml(item.code) + "</span><span class=\"option-copy\"><strong>" +
        ui.escapeHtml(item.name) + "</strong><small class=\"math-rich-text\">" +
        ui.renderMathText(item.question) + "</small></span><em>" +
        ui.papersForSubproblem(item.code).length + "</em></label>"
    ].join("");
  }

  function renderOptions() {
    document.getElementById("subproblem-options").innerHTML = data.subproblems.map(optionMarkup).join("");
    var modeInput = document.querySelector("input[name=\"mode\"][value=\"" + state.mode + "\"]");
    if (modeInput) modeInput.checked = true;
  }

  function matchesFilters(paper) {
    var checks = Array.from(state.subproblems).map(function (code) {
      return paper.subproblemCodes.indexOf(code) !== -1;
    });
    if (!checks.length) return true;
    return state.mode === "intersection" ? checks.every(Boolean) : checks.some(Boolean);
  }

  function renderActiveFilters() {
    var container = document.getElementById("active-filters");
    if (!state.subproblems.size) {
      container.innerHTML = "<span class=\"all-papers-note\"><i aria-hidden=\"true\"></i> 全部论文</span>";
      return;
    }
    var relation = state.mode === "intersection" ? "且 · AND" : "或 · OR";
    var chips = Array.from(state.subproblems).map(function (code) {
      var item = ui.getSubproblem(code);
      return "<button class=\"active-filter-chip\" type=\"button\" style=\"" + ui.itemStyle(item) +
        "\" data-remove-code=\"" + ui.escapeHtml(code) + "\"><strong>" + ui.escapeHtml(code) +
        "</strong><span>" + ui.escapeHtml(item.shortName) + "</span><i aria-hidden=\"true\">×</i></button>";
    });
    container.innerHTML = "<span class=\"relation-badge\">" + relation + "</span>" + chips.join("");
  }

  function updateUrl() {
    var next = new URLSearchParams();
    if (state.subproblems.size) next.set("subproblem", Array.from(state.subproblems).join(","));
    if (state.subproblems.size) next.set("mode", state.mode);
    var query = next.toString();
    try {
      window.history.replaceState(null, "", window.location.pathname + (query ? "?" + query : ""));
    } catch (error) {
      /* Some hardened file:// environments disallow replaceState. */
    }
  }

  function renderGraph(papers) {
    if (window.SDAtlasCitationGraph) {
      window.SDAtlasCitationGraph.render(document.getElementById("citation-graph"), papers, {
        title: "当前筛选结果的引用关系"
      });
    }
  }

  function matchedPapers() {
    return ui.sortPapers(data.papers.filter(function (paper) {
      return matchesFilters(paper) && ui.paperMatchesText(paper, state.query);
    }), state.sort);
  }

  function renderResults() {
    var matched = matchedPapers();
    document.getElementById("result-count").textContent = matched.length;
    document.getElementById("explorer-results").innerHTML = matched.length
      ? matched.map(function (paper) {
        return ui.paperCard(paper, {
          filters: { subproblemCodes: Array.from(state.subproblems), mode: state.mode }
        });
      }).join("")
      : ui.emptyState("没有匹配论文", state.mode === "intersection"
        ? "当前交集没有匹配论文。"
        : "当前并集与搜索条件没有匹配论文。",
        "<button class=\"button button-secondary\" type=\"button\" id=\"empty-clear\">清除全部条件</button>");
    renderGraph(matched);
    renderActiveFilters();
    updateUrl();
    var emptyClear = document.getElementById("empty-clear");
    if (emptyClear) emptyClear.addEventListener("click", clearAll);
  }

  function syncCheckboxes() {
    document.querySelectorAll("[data-subproblem]").forEach(function (input) {
      input.checked = state.subproblems.has(input.value);
    });
  }

  function clearAll() {
    state.subproblems.clear();
    state.query = "";
    document.getElementById("result-search").value = "";
    syncCheckboxes();
    renderResults();
  }

  ui.mountChrome("explorer");
  renderOptions();
  renderResults();

  document.querySelector(".filter-panel").addEventListener("change", function (event) {
    var input = event.target;
    if (input.matches("[data-subproblem]")) {
      if (input.checked) state.subproblems.add(input.value);
      else state.subproblems.delete(input.value);
      renderResults();
    }
    if (input.name === "mode") {
      state.mode = input.value;
      renderResults();
    }
  });

  document.getElementById("active-filters").addEventListener("click", function (event) {
    var button = event.target.closest("[data-remove-code]");
    if (!button) return;
    state.subproblems.delete(button.getAttribute("data-remove-code"));
    syncCheckboxes();
    renderResults();
  });
  document.getElementById("clear-filters").addEventListener("click", clearAll);
  document.getElementById("result-search").addEventListener("input", function (event) {
    state.query = event.target.value.trim();
    renderResults();
  });
  document.getElementById("result-sort").addEventListener("change", function (event) {
    state.sort = event.target.value;
    renderResults();
  });
  ui.initTooltips();
})();
