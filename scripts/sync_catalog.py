#!/usr/bin/env python3
"""Build the static SDAtlas runtime from split, maintainable JSON sources.

``data/catalog.json`` stores site metadata and the unified A–E subproblem
taxonomy. Each paper is maintained independently in ``data/papers/<id>.json``.
This script validates their cross-file references, derives reverse citations
and display-only fields, then writes two deterministic build artifacts:

* ``data/catalog.generated.json`` for readers and downstream tools;
* ``assets/js/data.js`` for a browser, including direct ``file://`` use.

Run ``python3 scripts/sync_catalog.py --check`` in CI or before committing.
"""

import argparse
import json
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any, Dict, List


ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = ROOT / "data" / "catalog.json"
PAPERS_DIR = ROOT / "data" / "papers"
AGGREGATE_PATH = ROOT / "data" / "catalog.generated.json"
RUNTIME_PATH = ROOT / "assets" / "js" / "data.js"
RUNTIME_HEADER = """/*
 * AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY.
 *
 * Edit data/catalog.json and data/papers/*.json, then run:
 * python3 scripts/sync_catalog.py
 * The wrapper keeps the static site compatible with direct file:// access.
 */
window.SD_ATLAS_DATA = """


def read_json(path: Path) -> Dict[str, Any]:
    """Read one UTF-8 JSON object and give malformed sources a useful label."""
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"{path.relative_to(ROOT)} must contain a JSON object")
    return value


def load_catalog() -> Dict[str, Any]:
    """Load taxonomy metadata; papers intentionally do not live in this file."""
    catalog = read_json(CATALOG_PATH)
    if not isinstance(catalog.get("subproblems"), list):
        raise ValueError("data/catalog.json must contain a subproblems array")
    if "papers" in catalog:
        raise ValueError("papers must be maintained in data/papers/*.json")
    return catalog


def load_paper_sources() -> List[Dict[str, Any]]:
    """Load independent paper sources in stable index/id order."""
    if not PAPERS_DIR.is_dir():
        raise ValueError("data/papers directory does not exist")
    papers = []  # type: List[Dict[str, Any]]
    for path in sorted(PAPERS_DIR.glob("*.json")):
        paper = read_json(path)
        if path.stem != paper.get("id"):
            raise ValueError(
                f"{path.relative_to(ROOT)} filename must match paper id {paper.get('id')!r}"
            )
        paper["_sourcePath"] = str(path.relative_to(ROOT))
        papers.append(paper)
    return sorted(papers, key=lambda item: (item.get("index", 10**9), item.get("id", "")))


def institution_summary(details: List[Dict[str, Any]]) -> str:
    """Derive the compact institution line from ordered institution records."""
    groups = []  # type: List[List[str]]
    previous_order: Any = object()
    for detail in details:
        order = detail.get("order")
        if order != previous_order:
            groups.append([])
            previous_order = order
        groups[-1].append(str(detail.get("name", "")))
    return " → ".join("、".join(group) for group in groups)


def validate_sources(catalog: Dict[str, Any], papers: List[Dict[str, Any]]) -> None:
    """Reject structural drift before generating a misleading browser catalog."""
    errors = []  # type: List[str]
    subproblems = catalog.get("subproblems", [])
    subproblem_codes = [item.get("code") for item in subproblems]
    paper_ids = [paper.get("id") for paper in papers]
    indices = [paper.get("index") for paper in papers]

    def check(condition: bool, message: str) -> None:
        if not condition:
            errors.append(message)

    check(len(set(subproblem_codes)) == len(subproblem_codes), "subproblem codes must be unique")
    check(None not in subproblem_codes, "every subproblem needs a code")
    check(len(set(item.get("id") for item in subproblems)) == len(subproblems),
          "subproblem ids must be unique")
    check(len(set(paper_ids)) == len(paper_ids), "paper ids must be unique")
    check(len(set(indices)) == len(indices), "paper indices must be unique")
    check(indices == list(range(1, len(papers) + 1)), "paper indices must be the sequence 1..N")

    valid_codes = set(subproblem_codes)
    valid_ids = set(paper_ids)
    required_text = ("id", "title", "shortName", "methodOverview", "venue", "date", "url")
    for paper in papers:
        label = f"#{paper.get('index')} {paper.get('id')}"
        for field in required_text:
            check(bool(str(paper.get(field, "")).strip()), f"{label}: missing {field}")
        check(isinstance(paper.get("authors"), list) and bool(paper.get("authors")),
              f"{label}: authors must be a non-empty array")
        check(isinstance(paper.get("notes"), list), f"{label}: notes must be an array")
        details = paper.get("institutionDetails")
        check(isinstance(details, list) and bool(details),
              f"{label}: institutionDetails must be a non-empty array")

        contributions = paper.get("subproblemContributions")
        check(isinstance(contributions, dict) and bool(contributions),
              f"{label}: subproblemContributions must be a non-empty object")
        if isinstance(contributions, dict):
            check(set(contributions) <= valid_codes,
                  f"{label}: references an unknown subproblem")
            for code, contribution in contributions.items():
                check(isinstance(contribution, dict),
                      f"{label}: contribution {code} must contain summary/detail")
                if isinstance(contribution, dict):
                    check(bool(str(contribution.get("summary", "")).strip()),
                          f"{label}: contribution {code} is missing summary")
                    check(bool(str(contribution.get("detail", "")).strip()),
                          f"{label}: contribution {code} is missing detail")

        citations = paper.get("citations")
        check(isinstance(citations, list), f"{label}: citations must be an array")
        if isinstance(citations, list):
            check(len(citations) == len(set(citations)), f"{label}: duplicate citations")
            check(paper.get("id") not in citations, f"{label}: self-citation is not allowed")
            unknown = set(citations) - valid_ids
            check(not unknown, f"{label}: unknown citation ids {sorted(unknown)}")
        check("citedBy" not in paper, f"{label}: citedBy is generated and must not be source data")
        check("subproblemCodes" not in paper,
              f"{label}: subproblemCodes is generated from subproblemContributions")
        check("institutions" not in paper,
              f"{label}: institutions is generated from institutionDetails")
        check("workbookTags" not in paper, f"{label}: workbookTags has been retired")

    if errors:
        raise ValueError("source validation failed:\n- " + "\n- ".join(errors))


def build_catalog(
    catalog: Dict[str, Any], papers: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """Return the complete deterministic runtime catalog with derived fields."""
    validate_sources(catalog, papers)
    reverse = defaultdict(list)  # type: Dict[str, List[str]]
    for paper in papers:
        for cited_id in paper["citations"]:
            reverse[cited_id].append(paper["id"])

    runtime_papers = []  # type: List[Dict[str, Any]]
    for source in papers:
        paper = {key: value for key, value in source.items() if key != "_sourcePath"}
        paper["subproblemCodes"] = list(paper["subproblemContributions"])
        paper["institutions"] = institution_summary(paper["institutionDetails"])
        paper["citedBy"] = sorted(
            reverse.get(paper["id"], []),
            key=lambda cited_by_id: paper_ids_index(papers, cited_by_id),
        )
        runtime_papers.append(paper)

    result = dict(catalog)
    result["papers"] = runtime_papers
    return result


def paper_ids_index(papers: List[Dict[str, Any]], paper_id: str) -> int:
    """Return a stable source index for a known paper ID."""
    return next(int(paper["index"]) for paper in papers if paper["id"] == paper_id)


def render_aggregate(catalog: Dict[str, Any]) -> str:
    return json.dumps(catalog, ensure_ascii=False, indent=2) + "\n"


def render_runtime(catalog: Dict[str, Any]) -> str:
    return RUNTIME_HEADER + json.dumps(catalog, ensure_ascii=False, indent=2) + ";\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check",
        action="store_true",
        help="fail if generated files are stale; do not write",
    )
    args = parser.parse_args()

    try:
        catalog = build_catalog(load_catalog(), load_paper_sources())
        expected_aggregate = render_aggregate(catalog)
        expected_runtime = render_runtime(catalog)
    except (OSError, ValueError, json.JSONDecodeError) as error:
        print(f"[ERROR] 无法构建论文目录：{error}", file=sys.stderr)
        return 2

    outputs = (
        (AGGREGATE_PATH, expected_aggregate),
        (RUNTIME_PATH, expected_runtime),
    )
    stale = [path for path, expected in outputs
             if not path.exists() or path.read_text(encoding="utf-8") != expected]
    if args.check:
        if stale:
            print("[ERROR] 以下生成文件未同步：")
            for path in stale:
                print(f"- {path.relative_to(ROOT)}")
            print("请运行：python3 scripts/sync_catalog.py")
            return 1
        print("目录同步检查通过：聚合 JSON 与浏览器运行文件均为最新。")
        return 0

    for path, expected in outputs:
        current = path.read_text(encoding="utf-8") if path.exists() else ""
        if current != expected:
            path.write_text(expected, encoding="utf-8")
            print(f"已生成 {path.relative_to(ROOT)}。")
    if not stale:
        print("目录已同步，无需改写生成文件。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
