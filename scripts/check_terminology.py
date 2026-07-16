#!/usr/bin/env python3
"""Check schema-v4 SDAtlas prose against the maintained terminology table.

The checker reads taxonomy prose from ``data/catalog.json`` and paper prose
from every ``data/papers/*.json`` source. Generated catalog files are skipped
because checking them again would only duplicate source diagnostics. Paper
titles, author names, venue names, URLs and code identifiers retain their
source spelling.

Run from either the repository root or the SDAtlas directory:

    python3 SDAtlas/scripts/check_terminology.py
    python3 scripts/check_terminology.py
"""

import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, Iterable, List, Tuple


ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = ROOT / "data" / "catalog.json"
PAPERS_DIR = ROOT / "data" / "papers"
RUNTIME_CATALOG_PATH = ROOT / "assets" / "js" / "data.js"
GLOSSARY_PATH = ROOT / "scripts" / "terminology.json"


def read_object(path: Path) -> Dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"{path.relative_to(ROOT)} 必须是 JSON object")
    return value


def iter_catalog_prose(catalog: Dict[str, Any]) -> Iterable[Tuple[str, str]]:
    """Yield user-facing taxonomy prose while excluding identifiers."""
    meta = catalog.get("meta", {})
    if isinstance(meta, dict):
        for field in ("title", "shortTitle", "subtitle", "citationScope"):
            yield f"meta.{field}", str(meta.get(field, ""))

    subproblems = catalog.get("subproblems", [])
    if not isinstance(subproblems, list):
        return
    for index, subproblem in enumerate(subproblems):
        if not isinstance(subproblem, dict):
            continue
        for field in ("name", "shortName", "question", "description"):
            yield f"subproblems[{index}].{field}", str(subproblem.get(field, ""))


def iter_paper_prose(path: Path, paper: Dict[str, Any]) -> Iterable[Tuple[str, str]]:
    """Yield only SDAtlas-authored prose from one independently maintained paper."""
    prefix = str(path.relative_to(ROOT))
    yield f"{prefix}:methodOverview", str(paper.get("methodOverview", ""))

    notes = paper.get("notes", [])
    if isinstance(notes, list):
        for index, note in enumerate(notes):
            yield f"{prefix}:notes[{index}]", str(note)

    contributions = paper.get("subproblemContributions", {})
    if isinstance(contributions, dict):
        for code, contribution in contributions.items():
            if not isinstance(contribution, dict):
                continue
            for field in ("summary", "detail"):
                yield (
                    f"{prefix}:subproblemContributions.{code}.{field}",
                    str(contribution.get(field, "")),
                )

    details = paper.get("institutionDetails", [])
    if isinstance(details, list):
        for index, detail in enumerate(details):
            if isinstance(detail, dict):
                yield (
                    f"{prefix}:institutionDetails[{index}].explanation",
                    str(detail.get("explanation", "")),
                )

    if paper.get("localPdfNote"):
        yield f"{prefix}:localPdfNote", str(paper["localPdfNote"])


def line_number(source: str, offset: int) -> int:
    return source.count("\n", 0, offset) + 1


def check_fragments(label: str, text: str, fragments: Iterable[str]) -> List[str]:
    return [f"{label}: 禁用写法 {fragment!r}" for fragment in fragments if fragment in text]


def check_english_case(label: str, text: str, case_map: Dict[str, str]) -> List[str]:
    errors = []  # type: List[str]
    alternatives = "|".join(re.escape(term) for term in sorted(case_map, key=len, reverse=True))
    pattern = re.compile(rf"(?<![A-Za-z])(?:{alternatives})(?![A-Za-z])", re.I)
    for match in pattern.finditer(text):
        expected = case_map[match.group(0).lower()]
        if match.group(0) != expected:
            errors.append(f"{label}: 英文术语 {match.group(0)!r} 应写作 {expected!r}")
    return errors


def check_text_file(path: Path, fragments: Iterable[str]) -> List[str]:
    """Scan static prose files for unambiguous forbidden Chinese fragments."""
    errors = []  # type: List[str]
    source = path.read_text(encoding="utf-8")
    for fragment in fragments:
        start = 0
        while True:
            offset = source.find(fragment, start)
            if offset < 0:
                break
            errors.append(
                f"{path.relative_to(ROOT)}:{line_number(source, offset)}: 禁用写法 {fragment!r}"
            )
            start = offset + len(fragment)
    return errors


def main() -> int:
    try:
        glossary = read_object(GLOSSARY_PATH)
        catalog = read_object(CATALOG_PATH)
        ui_fragments = glossary["uiForbiddenFragments"]
        global_fragments = [item["find"] for item in glossary["globalReplacements"][:3]]
        case_map = glossary["englishCase"]
        if not isinstance(ui_fragments, list) or not isinstance(case_map, dict):
            raise ValueError("terminology.json 的规则类型无效")
    except (KeyError, OSError, ValueError, json.JSONDecodeError) as error:
        print(f"[ERROR] 无法执行术语检查：{error}", file=sys.stderr)
        return 2

    errors = []  # type: List[str]
    for label, prose in iter_catalog_prose(catalog):
        errors.extend(check_fragments(f"data/catalog.json:{label}", prose, ui_fragments))
        errors.extend(check_english_case(f"data/catalog.json:{label}", prose, case_map))

    try:
        paper_paths = sorted(PAPERS_DIR.glob("*.json"))
        if not paper_paths:
            raise ValueError("data/papers 中没有论文源文件")
        for path in paper_paths:
            paper = read_object(path)
            for label, prose in iter_paper_prose(path, paper):
                errors.extend(check_fragments(label, prose, ui_fragments))
                errors.extend(check_english_case(label, prose, case_map))
    except (OSError, ValueError, json.JSONDecodeError) as error:
        print(f"[ERROR] 无法读取论文源文件：{error}", file=sys.stderr)
        return 2

    # HTML and non-generated rendering scripts contain authored UI copy. Their
    # code identifiers are intentionally not subjected to English case checks.
    for path in sorted(ROOT.glob("*.html")):
        errors.extend(check_text_file(path, ui_fragments))
    for path in sorted((ROOT / "assets" / "js").glob("*.js")):
        if path != RUNTIME_CATALOG_PATH:
            errors.extend(check_text_file(path, ui_fragments))

    # General documentation may legitimately discuss data “验证”. Only the
    # unambiguous obsolete translations of speculative decoding are scanned.
    documentation = [ROOT / "README.md"] + [
        path for path in sorted((ROOT / "docs").glob("*.md"))
        if path.name != "TERMINOLOGY.md"
    ]
    for path in documentation:
        errors.extend(check_text_file(path, global_fragments))

    for error in errors:
        print(f"[ERROR] {error}")

    if errors:
        print(f"\n术语检查失败：{len(errors)} 处不一致。")
        return 1

    print(
        "术语检查通过：中文统一为“投机解码”，流程术语统一为 "
        "Draft / Drafter、Verify / Verifier 与 Training。"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
