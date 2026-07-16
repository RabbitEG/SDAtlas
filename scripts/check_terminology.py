#!/usr/bin/env python3
"""Check SDAtlas-authored prose against the maintained terminology table.

Only Python's standard library is used. Run from either the repository root or
the SDAtlas directory:

    python3 SDAtlas/scripts/check_terminology.py
    python3 scripts/check_terminology.py

The checker deliberately excludes paper titles and ``workbookTags`` because
they reproduce source material. It also excludes code identifiers and formula
subscripts, while checking every catalog field that is rendered as SDAtlas
prose.
"""

import json
import re
import sys
from pathlib import Path
from typing import Dict, Iterable, List, Tuple


ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = ROOT / "data" / "catalog.json"
RUNTIME_CATALOG_PATH = ROOT / "assets" / "js" / "data.js"
GLOSSARY_PATH = ROOT / "scripts" / "terminology.json"
TAG_PATH = ROOT / "tag.txt"


def load_catalog() -> dict:
    return json.loads(CATALOG_PATH.read_text(encoding="utf-8"))


def iter_catalog_prose(catalog: dict) -> Iterable[Tuple[str, str]]:
    """Yield only authored, user-facing prose; source fields stay untouched."""
    meta = catalog.get("meta", {})
    yield "meta.subtitle", str(meta.get("subtitle", ""))
    ordering = meta.get("institutionOrdering", {})
    yield "meta.institutionOrdering.note", str(ordering.get("note", ""))

    for index, category in enumerate(catalog.get("categories", [])):
        for field in ("name", "shortName", "question", "description"):
            yield f"categories[{index}].{field}", str(category.get(field, ""))

    for index, tag in enumerate(catalog.get("tags", [])):
        for field in ("name", "zhName", "description"):
            yield f"tags[{index}].{field}", str(tag.get(field, ""))

    for index, paper in enumerate(catalog.get("papers", [])):
        # title, workbookTags, institutions, venue and URL are source fields.
        for field in ("categoryContributions", "tagContributions"):
            for code, text in paper.get(field, {}).items():
                yield f"papers[{index}].{field}.{code}", str(text)
        if paper.get("localPdfNote"):
            yield f"papers[{index}].localPdfNote", str(paper["localPdfNote"])
        for detail_index, detail in enumerate(paper.get("institutionDetails", [])):
            yield (
                f"papers[{index}].institutionDetails[{detail_index}].explanation",
                str(detail.get("explanation", "")),
            )


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
            errors.append(
                f"{label}: 英文术语 {match.group(0)!r} 应写作 {expected!r}"
            )
    return errors


def check_text_file(
    path: Path,
    fragments: Iterable[str],
    case_map: Dict[str, str] = None,
    formula_exceptions: bool = False,
) -> List[str]:
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

    if case_map:
        for number, line in enumerate(source.splitlines(), 1):
            # These two standalone tokens are the visualized T_draft/T_verify
            # subscripts in the source note, not prose.
            if formula_exceptions and line.strip() in {"draft", "verify"}:
                continue
            errors.extend(
                check_english_case(f"{path.relative_to(ROOT)}:{number}", line, case_map)
            )
    return errors


def main() -> int:
    try:
        glossary = json.loads(GLOSSARY_PATH.read_text(encoding="utf-8"))
        catalog = load_catalog()
        ui_fragments = glossary["uiForbiddenFragments"]
        global_fragments = [item["find"] for item in glossary["globalReplacements"][:3]]
        case_map = glossary["englishCase"]
    except (KeyError, OSError, ValueError, json.JSONDecodeError) as error:
        print(f"[ERROR] 无法执行术语检查：{error}", file=sys.stderr)
        return 2

    errors = []  # type: List[str]
    for label, text in iter_catalog_prose(catalog):
        errors.extend(check_fragments(f"data/catalog.json:{label}", text, ui_fragments))
        errors.extend(check_english_case(f"data/catalog.json:{label}", text, case_map))

    errors.extend(check_text_file(TAG_PATH, ui_fragments, case_map, formula_exceptions=True))

    # HTML and rendering scripts contain authored interface prose. CSS is not
    # scanned because it has no rendered copy; data.js was checked structurally.
    for path in sorted(ROOT.glob("*.html")):
        errors.extend(check_text_file(path, ui_fragments))
    for path in sorted((ROOT / "assets" / "js").glob("*.js")):
        if path != RUNTIME_CATALOG_PATH:
            errors.extend(check_text_file(path, ui_fragments))

    # Documentation uses “验证” legitimately for data validation, so only the
    # globally forbidden translations of speculative decoding are checked here.
    documentation = [ROOT / "README.md"] + [
        path for path in sorted((ROOT / "docs").glob("*.md"))
        if path.name != "TERMINOLOGY.md"  # This guide must name forbidden examples.
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
        "Draft / Drafter 与 Verify / Verifier。"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
