/* Boolean set explorer for mixed major-category and tag selections. */
(function () {
  "use strict";

  var ui = window.SDAtlasUI;
  var data = ui.data;
  var params = new URLSearchParams(window.location.search);
  var state = {
    major: new Set(),
    tags: new Set(),
    mode: params.get("mode") === "intersection" ? "intersection" : "union",
    query: "",
    sort: "index"
  };

  function parseSelection(name, resolver, target) {
    var raw = params.get(name);
    if (!raw) return;
    raw.split(",").forEach(function (value) {
      var item = resolver(value);
      if (item) target.add(item.code);
    });
  }

  parseSelection("major", ui.getCategory, state.major);
  parseSelection("tag", ui.getTag, state.tags);

  function optionMarkup(item, type, count) {
    var selected = (type === "major" ? state.major : state.tags).has(item.code);
    var id = "filter-" + type + "-" + item.code;
    var title = type === "major"
      ? item.name
      : item.name + " · " + item.zhName;
    var subtitle = type === "major" ? item.question : item.description;
    return [
      "<label class=\"filter-option\" style=\"" + ui.itemStyle(item) + "\" for=\"" + id + "\">",
      "<input id=\"" + id + "\" type=\"checkbox\" data-filter-type=\"" + type + "\" value=\"" +
        ui.escapeHtml(item.code) + "\"" + (selected ? " checked" : "") + ">",
      "<span class=\"option-check\" aria-hidden=\"true\"></span><span class=\"option-code\">" +
        ui.escapeHtml(item.code) + "</span><span class=\"option-copy\"><strong>" + ui.escapeHtml(title) +
        "</strong><small class=\"math-rich-text\">" + ui.renderMathText(subtitle) +
        "</small></span><em>" + count + "</em></label>"
    ].join("");
  }

  function renderOptions() {
    document.getElementById("major-options").innerHTML = data.categories.map(function (item) {
      return optionMarkup(item, "major", ui.papersForCategory(item.code).length);
    }).join("");
    document.getElementById("tag-options").innerHTML = data.tags.map(function (item) {
      return optionMarkup(item, "tag", ui.papersForTag(item.code).length);
    }).join("");
    var modeInput = document.querySelector("input[name=\"mode\"][value=\"" + state.mode + "\"]");
    if (modeInput) modeInput.checked = true;
  }

  function selectedCodes() {
    return Array.from(state.major).concat(Array.from(state.tags));
  }

  function matchesFilters(paper) {
    var checks = [];
    state.major.forEach(function (code) { checks.push(paper.categoryCodes.indexOf(code) !== -1); });
    state.tags.forEach(function (code) { checks.push(paper.tagCodes.indexOf(code) !== -1); });
    if (!checks.length) return true;
    return state.mode === "intersection"
      ? checks.every(Boolean)
      : checks.some(Boolean);
  }

  function sortedPapers(papers) {
    return papers.slice().sort(function (a, b) {
      if (state.sort === "newest") return b.date.localeCompare(a.date) || a.index - b.index;
      if (state.sort === "name") return a.shortName.localeCompare(b.shortName, "en") || a.index - b.index;
      return a.index - b.index;
    });
  }

  function filterChip(item, type) {
    return "<button class=\"active-filter-chip\" type=\"button\" style=\"" + ui.itemStyle(item) +
      "\" data-remove-type=\"" + type + "\" data-remove-code=\"" + ui.escapeHtml(item.code) +
      "\"><strong>" + ui.escapeHtml(item.code) + "</strong><span>" +
      ui.escapeHtml(type === "major" ? item.shortName : item.name) + "</span><i aria-hidden=\"true\">×</i></button>";
  }

  function renderActiveFilters() {
    var container = document.getElementById("active-filters");
    var chips = [];
    state.major.forEach(function (code) { chips.push(filterChip(ui.getCategory(code), "major")); });
    state.tags.forEach(function (code) { chips.push(filterChip(ui.getTag(code), "tag")); });
    if (!chips.length) {
      container.innerHTML = "<span class=\"all-papers-note\"><i aria-hidden=\"true\"></i> 全部论文</span>";
      return;
    }
    var relation = state.mode === "intersection" ? "且 · AND" : "或 · OR";
    container.innerHTML = "<span class=\"relation-badge\">" + relation + "</span>" + chips.join("");
  }

  function updateUrl() {
    var next = new URLSearchParams();
    if (state.major.size) next.set("major", Array.from(state.major).join(","));
    if (state.tags.size) next.set("tag", Array.from(state.tags).join(","));
    if (selectedCodes().length) next.set("mode", state.mode);
    var query = next.toString();
    try {
      window.history.replaceState(null, "", window.location.pathname + (query ? "?" + query : ""));
    } catch (error) {
      /* Some hardened file:// environments disallow replaceState; filtering still works. */
    }
  }

  function renderResults() {
    var matched = sortedPapers(data.papers.filter(function (paper) {
      return matchesFilters(paper) && ui.paperMatchesText(paper, state.query);
    }));
    document.getElementById("result-count").textContent = matched.length;
    document.getElementById("explorer-results").innerHTML = matched.length
      ? matched.map(function (paper) {
        return ui.paperCard(paper, {
          filters: {
            majorCodes: Array.from(state.major),
            tagCodes: Array.from(state.tags),
            mode: state.mode
          }
        });
      }).join("")
      : ui.emptyState("没有匹配论文", state.mode === "intersection"
        ? "当前交集没有匹配论文。"
        : "当前并集与搜索条件没有匹配论文。",
        "<button class=\"button button-secondary\" type=\"button\" id=\"empty-clear\">清除全部条件</button>");
    var emptyClear = document.getElementById("empty-clear");
    if (emptyClear) emptyClear.addEventListener("click", clearAll);
    renderActiveFilters();
    updateUrl();
  }

  function syncCheckboxes() {
    document.querySelectorAll("[data-filter-type]").forEach(function (input) {
      var set = input.getAttribute("data-filter-type") === "major" ? state.major : state.tags;
      input.checked = set.has(input.value);
    });
  }

  function clearAll() {
    state.major.clear();
    state.tags.clear();
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
    if (input.matches("[data-filter-type]")) {
      var set = input.getAttribute("data-filter-type") === "major" ? state.major : state.tags;
      if (input.checked) set.add(input.value); else set.delete(input.value);
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
    var set = button.getAttribute("data-remove-type") === "major" ? state.major : state.tags;
    set.delete(button.getAttribute("data-remove-code"));
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
