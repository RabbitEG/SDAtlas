/* Searchable all-papers index; graph and list always share one result set. */
(function () {
  "use strict";

  var ui = window.SDAtlasUI;
  var data = ui.data;
  var state = { query: "", sort: "index", subproblem: "" };

  function renderQuickFilters() {
    document.getElementById("paper-quick-filters").innerHTML = [
      "<button class=\"is-active\" type=\"button\" data-code=\"\">全部</button>"
    ].concat(data.subproblems.map(function (item) {
      return "<button type=\"button\" data-code=\"" + ui.escapeHtml(item.code) + "\" style=\"" +
        ui.itemStyle(item) + "\"><strong>" + ui.escapeHtml(item.code) + "</strong> " +
        ui.escapeHtml(item.shortName) + "</button>";
    })).join("");
  }

  function currentPapers() {
    return ui.sortPapers(data.papers.filter(function (paper) {
      var subproblemMatch = !state.subproblem || paper.subproblemCodes.indexOf(state.subproblem) !== -1;
      return subproblemMatch && ui.paperMatchesText(paper, state.query);
    }), state.sort);
  }

  function render() {
    var papers = currentPapers();
    document.getElementById("papers-count").textContent = papers.length;
    document.getElementById("all-paper-list").innerHTML = papers.length
      ? papers.map(function (paper) {
        return ui.paperCard(paper, state.subproblem ? { subproblem: state.subproblem } : {});
      }).join("")
      : ui.emptyState("没有匹配论文", "请调整搜索词或子问题。",
        "<button class=\"button button-secondary\" id=\"reset-papers\" type=\"button\">显示全部论文</button>");
    if (window.SDAtlasCitationGraph) {
      window.SDAtlasCitationGraph.render(document.getElementById("citation-graph"), papers, {
        title: "当前论文列表的引用关系"
      });
    }
    var reset = document.getElementById("reset-papers");
    if (reset) reset.addEventListener("click", function () {
      state.query = "";
      state.subproblem = "";
      document.getElementById("papers-search").value = "";
      document.querySelectorAll("[data-code]").forEach(function (button) {
        button.classList.toggle("is-active", !button.getAttribute("data-code"));
      });
      render();
    });
  }

  ui.mountChrome("papers");
  renderQuickFilters();
  render();
  document.getElementById("papers-search").addEventListener("input", function (event) {
    state.query = event.target.value.trim();
    render();
  });
  document.getElementById("papers-sort").addEventListener("change", function (event) {
    state.sort = event.target.value;
    render();
  });
  document.getElementById("paper-quick-filters").addEventListener("click", function (event) {
    var button = event.target.closest("[data-code]");
    if (!button) return;
    state.subproblem = button.getAttribute("data-code");
    document.querySelectorAll("[data-code]").forEach(function (candidate) {
      candidate.classList.toggle("is-active", candidate === button);
    });
    render();
  });
  ui.initTooltips();
})();
