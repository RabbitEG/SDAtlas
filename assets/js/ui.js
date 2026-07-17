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

  /*
   * Formulae in the source material use compact paper-style notation such as
   * L_gen, r^(i−1), Σ_r and ‖p_d−p_t‖₁. Keep that source text searchable and
   * validation-friendly, then turn only the reader-facing copy into native
   * MathML. This works offline and does not make the static site depend on a
   * third-party renderer.
   *
   * New catalogue copy may also mark an expression explicitly as \(...\).
   * The registry below covers compound expressions already present in the
   * aligned dataset; the fallback recognises scripted tokens and Greek symbols.
   */
  var MATH_EXPRESSIONS = [
    "ΔLogits=W₂·SiLU(W₁[Hidden State; Causal State])",
    "R(T)=c_T·L_tree/(C_Draft+C_Verify)",
    "ΔJ=α·ΔC_target/ΔC_spec−C_target/C_spec",
    "c_k=σ(wᵀ[h_k;W₁[x_{k−1}]])",
    "C_Verify=γ(exp(δ|T|^ρ)−1)",
    "L=(1−λₜ)L_final+λₜL_base",
    "q_reach/(λ₁+λ₂·depth)",
    "λ_t=0.6^(t−1)",
    "max(r^(i−1), r_min)",
    "1−½‖p_d−p_t‖₁",
    "B=Σ_r(1+ℓ_r)",
    "∏_{i≤j}c_i",
    "C_Draft=λ|T|",
    "E_sub(T,n)−E",
    "⟨k₁,…,k_m⟩",
    "(level+1)^−0.7",
    "γ₀=4.5",
    "τ·SPS(B)",
    "B_Verify/b",
    "0.1/0.9/1.0",
    "N/(1−r)",
    "0.9^level",
    "0.8^k",
    "K·T_D",
    "K=8",
    "r_min=0.2",
    "r=0.7",
    "Σp̂",
    "SPS(B)",
    "O(B log B)",
    "O(nV+d)",
    "O(V+d)",
    "O(NK)",
    "O(kB)",
    "O(N)",
    "top-s_k",
    "L_gen",
    "L_acc",
    "N_max",
    "N_pool",
    "L_tree",
    "B_Verify",
    "T_D"
  ].sort(function (a, b) { return b.length - a.length; });

  var SUBSCRIPT_CHARACTERS = {
    "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4",
    "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9",
    "ₐ": "a", "ₑ": "e", "ₕ": "h", "ᵢ": "i", "ⱼ": "j",
    "ₖ": "k", "ₗ": "l", "ₘ": "m", "ₙ": "n", "ₒ": "o",
    "ₚ": "p", "ᵣ": "r", "ₛ": "s", "ₜ": "t"
  };

  var SUPERSCRIPT_CHARACTERS = {
    "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4",
    "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9",
    "⁺": "+", "⁻": "−", "ᵀ": "T"
  };

  function isIdentifierStart(character) {
    return /[A-Za-z\u0370-\u03ff\u2113]/.test(character || "");
  }

  function isIdentifierPart(character) {
    return /[A-Za-z\u0370-\u03ff\u2113\u0300-\u036f]/.test(character || "");
  }

  function matchingDelimiter(source, start, opening, closing) {
    var depth = 0;
    for (var index = start; index < source.length; index += 1) {
      if (source[index] === opening) depth += 1;
      if (source[index] === closing) {
        depth -= 1;
        if (depth === 0) return index;
      }
    }
    return -1;
  }

  function mathIdentifier(name) {
    if (name === "Σ") return "<mo>∑</mo>";
    if (name === "∏" || name === "∑") return "<mo>" + escapeHtml(name) + "</mo>";
    if (name.indexOf("\u0302") !== -1) {
      var unaccented = name.replace(/\u0302/g, "");
      return "<mover accent=\"true\"><mi>" + escapeHtml(unaccented) +
        "</mi><mo>^</mo></mover>";
    }
    if (/^[\u0370-\u03ff\u2113][A-Za-z]+$/.test(name)) {
      return "<mrow><mi>" + escapeHtml(name[0]) + "</mi><mi mathvariant=\"normal\">" +
        escapeHtml(name.slice(1)) + "</mi></mrow>";
    }
    if (name.length > 1 && /^[A-Za-z]+$/.test(name)) {
      return "<mi mathvariant=\"normal\">" + escapeHtml(name) + "</mi>";
    }
    return "<mi>" + escapeHtml(name) + "</mi>";
  }

  function decodedScript(characters, map) {
    return characters.split("").map(function (character) {
      return map[character] || character;
    }).join("");
  }

  function readMathScript(source, start) {
    var first = source[start];
    var pairs = { "{": "}", "(": ")" };
    if (pairs[first]) {
      var end = matchingDelimiter(source, start, first, pairs[first]);
      if (end !== -1) {
        return { value: source.slice(start + 1, end), next: end + 1 };
      }
    }

    var tail = source.slice(start);
    var match = tail.match(/^[+\-−]?\d+(?:\.\d+)?|^[A-Za-z\u0370-\u03ff\u2113]+/);
    if (match) return { value: match[0], next: start + match[0].length };
    return { value: first || "", next: start + 1 };
  }

  function attachMathScripts(atom, source, start) {
    var index = start;
    var subscript = null;
    var superscript = null;

    while (index < source.length) {
      var character = source[index];
      if (character === "_" || character === "^") {
        var script = readMathScript(source, index + 1);
        if (character === "_") subscript = parseMathRow(script.value);
        else superscript = parseMathRow(script.value);
        index = script.next;
        continue;
      }
      if (SUBSCRIPT_CHARACTERS[character]) {
        var subCharacters = "";
        while (SUBSCRIPT_CHARACTERS[source[index]]) {
          subCharacters += source[index];
          index += 1;
        }
        subscript = parseMathRow(decodedScript(subCharacters, SUBSCRIPT_CHARACTERS));
        continue;
      }
      if (SUPERSCRIPT_CHARACTERS[character]) {
        var superCharacters = "";
        while (SUPERSCRIPT_CHARACTERS[source[index]]) {
          superCharacters += source[index];
          index += 1;
        }
        superscript = parseMathRow(decodedScript(superCharacters, SUPERSCRIPT_CHARACTERS));
        continue;
      }
      break;
    }

    if (subscript && superscript) {
      atom = "<msubsup>" + atom + "<mrow>" + subscript + "</mrow><mrow>" +
        superscript + "</mrow></msubsup>";
    } else if (subscript) {
      atom = "<msub>" + atom + "<mrow>" + subscript + "</mrow></msub>";
    } else if (superscript) {
      atom = "<msup>" + atom + "<mrow>" + superscript + "</mrow></msup>";
    }
    return { html: atom, next: index };
  }

  function parseMathRow(source) {
    var output = [];
    var index = 0;
    var delimiterPairs = { "(": ")", "[": "]", "⟨": "⟩" };

    while (index < source.length) {
      var character = source[index];
      if (/\s/.test(character)) {
        output.push("<mspace width=\"0.22em\"></mspace>");
        index += 1;
        continue;
      }

      if (delimiterPairs[character]) {
        var closing = delimiterPairs[character];
        var groupEnd = matchingDelimiter(source, index, character, closing);
        if (groupEnd !== -1) {
          var grouped = "<mrow><mo fence=\"true\">" + escapeHtml(character) + "</mo>" +
            parseMathRow(source.slice(index + 1, groupEnd)) +
            "<mo fence=\"true\">" + escapeHtml(closing) + "</mo></mrow>";
          var scriptedGroup = attachMathScripts(grouped, source, groupEnd + 1);
          output.push(scriptedGroup.html);
          index = scriptedGroup.next;
          continue;
        }
      }

      if (character === "|" || character === "‖") {
        var normEnd = source.indexOf(character, index + 1);
        if (normEnd !== -1) {
          var norm = "<mrow><mo fence=\"true\">" + escapeHtml(character) + "</mo>" +
            parseMathRow(source.slice(index + 1, normEnd)) +
            "<mo fence=\"true\">" + escapeHtml(character) + "</mo></mrow>";
          var scriptedNorm = attachMathScripts(norm, source, normEnd + 1);
          output.push(scriptedNorm.html);
          index = scriptedNorm.next;
          continue;
        }
      }

      if (/\d/.test(character) || (character === "." && /\d/.test(source[index + 1] || ""))) {
        var numberMatch = source.slice(index).match(/^\d+(?:\.\d+)?/);
        var number = numberMatch ? numberMatch[0] : character;
        var scriptedNumber = attachMathScripts("<mn>" + escapeHtml(number) + "</mn>", source, index + number.length);
        output.push(scriptedNumber.html);
        index = scriptedNumber.next;
        continue;
      }

      if (character === "Σ" || character === "∑" || character === "∏") {
        var scriptedOperator = attachMathScripts(mathIdentifier(character), source, index + 1);
        output.push(scriptedOperator.html);
        index = scriptedOperator.next;
        continue;
      }

      if (isIdentifierStart(character)) {
        var end = index + 1;
        while (isIdentifierPart(source[end])) end += 1;
        var identifier = source.slice(index, end);
        var scriptedIdentifier = attachMathScripts(mathIdentifier(identifier), source, end);
        output.push(scriptedIdentifier.html);
        index = scriptedIdentifier.next;
        continue;
      }

      if (character === "½") output.push("<mn>½</mn>");
      else if (character === "-") output.push("<mo>−</mo>");
      else output.push("<mo>" + escapeHtml(character) + "</mo>");
      index += 1;
    }
    return output.join("");
  }

  function renderFormula(expression) {
    return "<math class=\"math-inline\" aria-label=\"" + escapeHtml(expression) +
      "\"><mrow>" + parseMathRow(expression) + "</mrow></math>";
  }

  function renderMathText(value) {
    var source = String(value == null ? "" : value);
    var fragments = [];

    function stash(expression) {
      var marker = "\uE000" + fragments.length + "\uE001";
      fragments.push(renderFormula(expression));
      return marker;
    }

    source = source.replace(/\\\((.+?)\\\)/g, function (_, expression) {
      return stash(expression);
    });
    MATH_EXPRESSIONS.forEach(function (expression) {
      if (source.indexOf(expression) !== -1) {
        source = source.split(expression).join(stash(expression));
      }
    });

    source = source.replace(
      /(?:[A-Za-z\u0370-\u03ff\u2113∑∏]+|\d+(?:\.\d+)?)(?:(?:_(?:\{[^{}]+\}|[A-Za-z0-9]+))|(?:\^(?:\{[^{}]+\}|\([^()]+\)|[A-Za-z0-9\u0370-\u03ff.+−-]+)))+/g,
      function (expression) { return stash(expression); }
    );
    source = source.replace(
      /[A-Za-z\u0370-\u03ff\u2113]+[₀-₉ₐₑₕᵢⱼₖₗₘₙₒₚᵣₛₜ⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ᵀ]+/g,
      function (expression) { return stash(expression); }
    );
    source = source.replace(/[A-Za-z]\u0302/g, function (expression) { return stash(expression); });
    source = source.replace(/[\u0370-\u03ff\u2113][A-Za-z]*/g, function (expression) {
      return stash(expression);
    });

    return escapeHtml(source).replace(/\uE000(\d+)\uE001/g, function (_, index) {
      return fragments[Number(index)] || "";
    });
  }

  function normalize(value) {
    return String(value == null ? "" : value)
      .trim()
      .toLocaleLowerCase("zh-CN");
  }

  function itemStyle(item) {
    return "--item-color:" + item.color + ";--item-soft:" + item.softColor;
  }

  function emptyState(title, body, actionHtml) {
    return [
      "<div class=\"empty-state\"><div class=\"empty-state__mark\" aria-hidden=\"true\">∅</div>",
      "<h2>" + escapeHtml(title) + "</h2><p>" + escapeHtml(body) + "</p>",
      actionHtml || "", "</div>"
    ].join("");
  }

  function initTooltips() {
    if (document.getElementById("atlas-tooltip")) return;
    var tooltip = document.createElement("div");
    var activeTarget = null;
    tooltip.className = "atlas-tooltip math-rich-text";
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
      tooltip.innerHTML = renderMathText(content);
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
    renderMathText: renderMathText,
    normalize: normalize,
    itemStyle: itemStyle,
    emptyState: emptyState,
    initTooltips: initTooltips
  };
})();
/*
 * Schema v5 application layer.
 *
 * The formula renderer above remains deliberately independent from the data
 * model. This layer exposes the single A–E subproblem taxonomy, internal paper
 * routes and shared paper-list components used by every v4 page.
 */
(function () {
  "use strict";

  var ui = window.SDAtlasUI;
  var data = ui.data;

  function getSubproblem(codeOrId) {
    var key = ui.normalize(codeOrId);
    return data.subproblems.find(function (item) {
      return ui.normalize(item.code) === key || ui.normalize(item.id) === key ||
        ui.normalize(item.name) === key || ui.normalize(item.shortName) === key;
    }) || null;
  }

  function getPaper(id) {
    var key = ui.normalize(id);
    return data.papers.find(function (paper) { return ui.normalize(paper.id) === key; }) || null;
  }

  function paperHref(id) {
    return "paper.html?id=" + encodeURIComponent(id);
  }

  function subproblemHref(code) {
    return "category.html?id=" + encodeURIComponent(code);
  }

  function explorerHref(options) {
    options = options || {};
    var params = new URLSearchParams();
    var codes = options.subproblems || options.questions || [];
    if (codes.length) params.set("subproblem", codes.join(","));
    if (options.mode) params.set("mode", options.mode);
    var query = params.toString();
    return "explorer.html" + (query ? "?" + query : "");
  }

  function papersForSubproblem(code) {
    return data.papers.filter(function (paper) {
      return paper.subproblemCodes.indexOf(code) !== -1;
    });
  }

  function subproblemContribution(paper, code) {
    return paper.subproblemContributions[code] || {
      summary: "该论文没有此子问题的贡献说明。",
      detail: "该论文没有此子问题的贡献说明。"
    };
  }

  function subproblemBadges(paper, highlightedCode) {
    return paper.subproblemCodes.map(function (code) {
      var item = getSubproblem(code);
      var matched = code === highlightedCode ? " is-matched" : "";
      return [
        "<a class=\"category-badge" + matched + "\" style=\"" + ui.itemStyle(item) + "\" href=\"" +
          subproblemHref(code) + "\" data-tooltip=\"" +
          ui.escapeHtml(subproblemContribution(paper, code).summary) + "\">",
        "<span class=\"badge-code\">" + ui.escapeHtml(code) + "</span>",
        "<span>" + ui.escapeHtml(item.shortName) + "</span></a>"
      ].join("");
    }).join("");
  }

  function institutionList(paper) {
    var details = paper.institutionDetails || [];
    var previousOrder = null;
    var chips = details.map(function (item) {
      var order = Number(item.order);
      var separator = previousOrder !== null && previousOrder !== order
        ? "<span class=\"institution-arrow\" aria-hidden=\"true\">→</span>"
        : "";
      previousOrder = order;
      return [
        separator,
        "<span class=\"institution-chip\" tabindex=\"0\" data-order=\"" + ui.escapeHtml(order) + "\"",
        " data-tooltip=\"顺位 " + ui.escapeHtml(order) + "｜" + ui.escapeHtml(item.explanation) + "\">",
        "<span class=\"institution-chip__order\" aria-hidden=\"true\">" + ui.escapeHtml(order) + "</span>",
        "<span>" + ui.escapeHtml(item.name) + "</span></span>"
      ].join("");
    }).join("");
    var source = paper.institutionSource
      ? "<a class=\"institution-source\" href=\"" + ui.escapeHtml(paper.institutionSource) +
        "\" target=\"_blank\" rel=\"noopener\">单位来源 <span aria-hidden=\"true\">↗</span></a>"
      : "";
    return "<div class=\"institution-list\" aria-label=\"论文相关单位\">" + chips +
      "</div>" + (source ? "<div class=\"institution-meta\">" + source + "</div>" : "");
  }

  function contributionPanels(paper, highlightedCode) {
    return paper.subproblemCodes.map(function (code) {
      var item = getSubproblem(code);
      var contribution = subproblemContribution(paper, code);
      var active = code === highlightedCode ? " is-highlighted" : "";
      return [
        "<article class=\"contribution-panel" + active + "\" style=\"" + ui.itemStyle(item) + "\">",
        "<a class=\"contribution-label\" href=\"" + subproblemHref(code) + "\"><span>" +
          ui.escapeHtml(code) + "</span>" + ui.escapeHtml(item.name) + "</a>",
        "<p class=\"contribution-summary math-rich-text\">" +
          ui.renderMathText(contribution.summary) + "</p>",
        "<div class=\"contribution-detail math-rich-text\"><p>" +
          ui.renderMathText(contribution.detail).replace(/\n\n/g, "</p><p>") + "</p></div>",
        "</article>"
      ].join("");
    }).join("");
  }

  function contextualContribution(paper, options) {
    options = options || {};
    var codes = [];
    if (options.subproblem) codes = [options.subproblem];
    if (options.filters && options.filters.subproblemCodes) {
      codes = options.filters.subproblemCodes.slice();
    }
    codes = codes.filter(function (code) { return paper.subproblemCodes.indexOf(code) !== -1; });
    if (!codes.length) return paper.methodOverview;
    return codes.map(function (code) {
      var item = getSubproblem(code);
      return item.shortName + "：" + subproblemContribution(paper, code).summary;
    }).join("；");
  }

  function authorsMarkup(paper) {
    return (paper.authors || []).map(function (author) {
      return "<span>" + ui.escapeHtml(author) + "</span>";
    }).join("");
  }

  function notesMarkup(paper) {
    if (!paper.notes || !paper.notes.length) return "<p class=\"empty-note\">暂无研究笔记。</p>";
    return "<ul class=\"paper-notes\">" + paper.notes.map(function (note) {
      return "<li class=\"math-rich-text\">" + ui.renderMathText(note) + "</li>";
    }).join("") + "</ul>";
  }

  function explanationLink(paper, className) {
    if (!paper.explanationPage) return "";
    return "<a class=\"" + className + "\" href=\"" +
      ui.escapeHtml(paper.explanationPage) + "\">论文解读 <span aria-hidden=\"true\">→</span></a>";
  }

  function paperCard(paper, options) {
    options = options || {};
    var highlightedCode = options.subproblem || null;
    var context = contextualContribution(paper, options);
    var detailHref = paperHref(paper.id);
    return [
      "<details class=\"paper-card\" data-paper-id=\"" + ui.escapeHtml(paper.id) + "\">",
      "<summary class=\"paper-card__summary\"><span class=\"paper-summary__layout\">",
      "<span class=\"paper-summary__content\"><span class=\"paper-summary__topline\">",
      "<span class=\"paper-summary__title\" role=\"heading\" aria-level=\"3\">" +
        ui.escapeHtml(paper.shortName) + "</span>",
      "<span class=\"paper-summary__datum paper-summary__venue\"><small>会议</small><strong>" +
        ui.escapeHtml(paper.venue) + "</strong></span>",
      "<time class=\"paper-summary__datum paper-summary__date\" datetime=\"" + ui.escapeHtml(paper.date) +
        "\"><small>时间</small><strong>" + ui.escapeHtml(paper.date) + "</strong></time>",
      "<span class=\"paper-context-summary\"><strong>贡献</strong><span class=\"math-rich-text\">" +
        ui.renderMathText(context) + "</span></span></span>",
      "<span class=\"paper-summary__secondline\">",
      "<span class=\"paper-summary__institutions\"><strong>相关单位</strong><span>" +
        ui.escapeHtml(paper.institutions) + "</span></span>",
      explanationLink(paper, "paper-summary__explanation"),
      "</span></span>",
      "<span class=\"paper-summary__toggle\" aria-hidden=\"true\"><span class=\"when-closed\">展开</span>" +
        "<span class=\"when-open\">收起</span><i></i></span>",
      "</span></summary><div class=\"paper-card__details\">",
      "<section class=\"paper-data-grid paper-overview-grid\" aria-label=\"论文信息\">",
      "<div class=\"paper-field paper-field--full paper-field--row-end\"><span class=\"field-label\">标题</span>" +
        "<p class=\"paper-expanded-title math-rich-text\">" + ui.renderMathText(paper.title) + "</p></div>",
      "<div class=\"paper-field paper-field--full paper-field--row-end\"><span class=\"field-label\">作者</span>" +
        "<div class=\"author-list\">" + authorsMarkup(paper) + "</div></div>",
      "<div class=\"paper-field paper-field--full paper-field--row-end\"><span class=\"field-label\">子问题</span>" +
        "<div class=\"chip-row\">" + subproblemBadges(paper, highlightedCode) + "</div></div>",
      "<div class=\"paper-field paper-field--full paper-field--row-end paper-field--institutions\">" +
        "<span class=\"field-label\">相关单位</span>" + institutionList(paper) + "</div>",
      "<div class=\"paper-field paper-field--full paper-field--row-end\"><span class=\"field-label\">直观方法概述</span>" +
        "<p class=\"math-rich-text\">" + ui.renderMathText(paper.methodOverview) + "</p></div>",
      "<div class=\"paper-field paper-field--full paper-field--row-end\"><span class=\"field-label\">笔记</span>" +
        notesMarkup(paper) + "</div></section>",
      "<section class=\"paper-contributions\" aria-label=\"子问题贡献\">",
      "<div class=\"section-mini-title\"><span>SUBPROBLEM CONTRIBUTIONS</span><strong>详细贡献</strong></div>",
      "<div class=\"contribution-grid\">" + contributionPanels(paper, highlightedCode) + "</div></section>",
      "<footer class=\"paper-card__footer\"><a class=\"button button-primary\" href=\"" + detailHref +
        "\">查看论文详情 <span aria-hidden=\"true\">→</span></a>" +
        "<span class=\"citation-counts\">引用 " + paper.citations.length + " · 被引用 " +
        paper.citedBy.length + "</span></footer>",
      "</div></details>"
    ].join("");
  }

  function paperMatchesText(paper, query) {
    var q = ui.normalize(query);
    if (!q) return true;
    var contributionText = paper.subproblemCodes.map(function (code) {
      var item = getSubproblem(code);
      var contribution = subproblemContribution(paper, code);
      return [code, item.name, item.shortName, item.description,
        contribution.summary, contribution.detail].join(" ");
    }).join(" ");
    var institutionText = (paper.institutionDetails || []).map(function (item) {
      return [item.name, item.explanation].join(" ");
    }).join(" ");
    return ui.normalize([
      paper.index, paper.id, paper.title, paper.shortName, (paper.authors || []).join(" "),
      paper.methodOverview, (paper.notes || []).join(" "), paper.institutions,
      institutionText, paper.venue, paper.date, contributionText
    ].join(" ")).indexOf(q) !== -1;
  }

  function sortPapers(papers, sort) {
    return papers.slice().sort(function (a, b) {
      if (sort === "newest") return b.date.localeCompare(a.date) || a.index - b.index;
      if (sort === "name") return a.shortName.localeCompare(b.shortName, "en") || a.index - b.index;
      if (sort === "citations") return b.citedBy.length - a.citedBy.length || a.index - b.index;
      return a.index - b.index;
    });
  }

  function siteHeader(active) {
    function navLink(href, key, label) {
      return "<a href=\"" + href + "\"" + (active === key ? " aria-current=\"page\"" : "") +
        ">" + label + "</a>";
    }
    return [
      "<a class=\"skip-link\" href=\"#main-content\">跳到主要内容</a>",
      "<div class=\"site-header__inner\"><a class=\"brand\" href=\"index.html\" aria-label=\"返回 SDAtlas 首页\">",
      "<span class=\"brand-mark\" aria-hidden=\"true\"><i></i><i></i><i></i></span>",
      "<span><strong>SDAtlas</strong><small>SPECULATIVE DECODING</small></span></a>",
      "<nav class=\"site-nav\" aria-label=\"主导航\">",
      navLink("index.html", "atlas", "论文索引"),
      navLink("papers.html", "papers", "全部论文"),
      navLink("explorer.html", "explorer", "组合筛选"),
      "<a href=\"" + ui.escapeHtml(data.meta.catalogFile) + "\" download>合并数据</a>",
      "</nav></div>"
    ].join("");
  }

  function siteFooter() {
    return [
      "<div class=\"footer-grid\"><a class=\"brand brand--footer\" href=\"index.html\">",
      "<span class=\"brand-mark\" aria-hidden=\"true\"><i></i><i></i><i></i></span>",
      "<span><strong>SDAtlas</strong><small>RESEARCH NAVIGATOR</small></span></a>",
      "<p>投机解码论文的子问题、方法与引用关系索引。</p>",
      "<p class=\"footer-meta\">DATASET · " + ui.escapeHtml(data.meta.updated) + "<br>SCHEMA · v" +
        ui.escapeHtml(data.schemaVersion) + "</p></div>"
    ].join("");
  }

  function mountChrome(active) {
    var header = document.getElementById("site-header");
    var footer = document.getElementById("site-footer");
    if (header) header.innerHTML = siteHeader(active);
    if (footer) footer.innerHTML = siteFooter();
  }

  /* Override the v3 data-specific APIs while retaining formula and tooltip helpers. */
  ui.getSubproblem = getSubproblem;
  ui.getPaper = getPaper;
  ui.paperHref = paperHref;
  ui.subproblemHref = subproblemHref;
  ui.explorerHref = explorerHref;
  ui.papersForSubproblem = papersForSubproblem;
  ui.subproblemContribution = subproblemContribution;
  ui.subproblemBadges = subproblemBadges;
  ui.institutionList = institutionList;
  ui.contributionPanels = contributionPanels;
  ui.contextualContribution = contextualContribution;
  ui.paperCard = paperCard;
  ui.paperMatchesText = paperMatchesText;
  ui.sortPapers = sortPapers;
  ui.mountChrome = mountChrome;

  /* Links inside <summary> navigate normally without also toggling the card. */
  document.addEventListener("click", function (event) {
    var target = event.target;
    var link = target && target.closest ? target.closest(".paper-summary__explanation") : null;
    if (link) event.stopPropagation();
  });
})();
