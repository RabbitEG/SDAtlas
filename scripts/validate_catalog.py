#!/usr/bin/env python3
"""Validate the merged SDAtlas catalog, sources and browser synchronization.

Only Python's standard library is used. Run from either the repository root or
the SDAtlas directory:

    python3 SDAtlas/scripts/validate_catalog.py
    python3 scripts/validate_catalog.py
"""

import json
import re
import sys
import zipfile
from pathlib import Path
from typing import List
from xml.etree import ElementTree as ET

from sync_catalog import render_runtime


ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = ROOT / "data" / "catalog.json"
RUNTIME_CATALOG_PATH = ROOT / "assets" / "js" / "data.js"
WORKBOOK_PATH = ROOT / "speculative_decoding_papers_2026-07.xlsx"
TAG_PATH = ROOT / "tag.txt"
XML_NS = {"x": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


class Validation:
    def __init__(self) -> None:
        self.errors = []  # type: List[str]
        self.warnings = []  # type: List[str]

    def check(self, condition: bool, message: str) -> None:
        if not condition:
            self.errors.append(message)

    def warn(self, condition: bool, message: str) -> None:
        if not condition:
            self.warnings.append(message)


def load_catalog() -> dict:
    return json.loads(CATALOG_PATH.read_text(encoding="utf-8"))


def cell_text(cell: ET.Element) -> str:
    if cell.get("t") == "inlineStr":
        return "".join(node.text or "" for node in cell.findall(".//x:t", XML_NS))
    value = cell.find("x:v", XML_NS)
    return value.text if value is not None and value.text is not None else ""


def column_index(reference: str) -> int:
    letters = re.match(r"[A-Z]+", reference)
    if not letters:
        raise ValueError(f"Invalid cell reference: {reference}")
    result = 0
    for char in letters.group(0):
        result = result * 26 + ord(char) - ord("A") + 1
    return result - 1


def read_workbook_rows() -> List[List[str]]:
    with zipfile.ZipFile(WORKBOOK_PATH) as archive:
        root = ET.fromstring(archive.read("xl/worksheets/sheet1.xml"))
    rows = []  # type: List[List[str]]
    for row in root.findall(".//x:sheetData/x:row", XML_NS):
        values = [""] * 9
        for cell in row.findall("x:c", XML_NS):
            index = column_index(cell.get("r", ""))
            if index < len(values):
                values[index] = cell_text(cell)
        rows.append(values)
    return rows


def normalize_tag_list(value: str) -> List[str]:
    return [part.strip() for part in value.split("；") if part.strip()]


def institution_summary(details: List[dict]) -> str:
    """Build the user-facing ordered summary from normalized institution rows."""
    groups = []  # type: List[List[str]]
    current_order = None
    for item in details:
        order = item.get("order")
        if order != current_order:
            groups.append([])
            current_order = order
        groups[-1].append(str(item.get("name", "")))
    return " → ".join("、".join(group) for group in groups)


def validate_catalog(catalog: dict, rows: List[List[str]]) -> Validation:
    result = Validation()
    categories = catalog.get("categories", [])
    tags = catalog.get("tags", [])
    papers = catalog.get("papers", [])
    category_codes = {item.get("code") for item in categories}
    tag_codes = {item.get("code") for item in tags}

    result.check(catalog.get("schemaVersion", 0) >= 3, "合并目录 schemaVersion 必须至少为 3")
    result.check(catalog.get("meta", {}).get("catalogFile") == "data/catalog.json",
                 "meta.catalogFile 必须指向唯一维护源 data/catalog.json")
    result.check(
        RUNTIME_CATALOG_PATH.read_text(encoding="utf-8") == render_runtime(catalog),
        "assets/js/data.js 未与 data/catalog.json 同步；请运行 scripts/sync_catalog.py",
    )

    result.check(len(category_codes) == len(categories), "大类别 code 必须唯一")
    result.check(len({item.get("id") for item in categories}) == len(categories), "大类别 id 必须唯一")
    result.check(len(tag_codes) == len(tags), "小标签 code 必须唯一")
    result.check(len({item.get("id") for item in tags}) == len(tags), "小标签 id 必须唯一")
    result.check(len({paper.get("id") for paper in papers}) == len(papers), "论文 id 必须唯一")
    result.check(len({paper.get("index") for paper in papers}) == len(papers), "论文 index 必须唯一")
    result.check([paper.get("index") for paper in papers] == list(range(1, len(papers) + 1)),
                 "论文应按源表 index 1..N 排列")

    tag_text = TAG_PATH.read_text(encoding="utf-8")
    source_codes = set(re.findall(r"^([A-Z])：", tag_text, re.M))
    result.check(source_codes == tag_codes,
                 f"合并目录标签 {sorted(tag_codes)} 与 tag.txt 定义 {sorted(source_codes)} 不一致")

    result.check(len(rows) - 1 == len(papers),
                 f"Excel 有 {len(rows) - 1} 篇，合并目录有 {len(papers)} 篇")

    for paper in papers:
        label = f"#{paper.get('index')} {paper.get('shortName')}"
        paper_categories = set(paper.get("categoryCodes", []))
        paper_tags = set(paper.get("tagCodes", []))
        category_notes = set(paper.get("categoryContributions", {}))
        tag_notes = set(paper.get("tagContributions", {}))

        result.check(bool(paper_categories), f"{label}: 至少需要一个大类别")
        result.check(paper_categories <= category_codes, f"{label}: 引用了不存在的大类别")
        result.check(paper_tags <= tag_codes, f"{label}: 引用了不存在的小标签")
        result.check(category_notes == paper_categories,
                     f"{label}: categoryContributions 必须逐项对应 categoryCodes")
        result.check(tag_notes == paper_tags,
                     f"{label}: tagContributions 必须逐项对应 tagCodes")
        result.check(bool(paper.get("workbookTags")), f"{label}: 缺少 Excel F 列原始描述")
        result.check(bool(re.fullmatch(r"\d{4}-\d{2}", paper.get("date", ""))),
                     f"{label}: date 必须是 YYYY-MM")
        result.check(str(paper.get("url", "")).startswith(("https://", "http://")),
                     f"{label}: 论文链接格式无效")

        institution_details = paper.get("institutionDetails", [])
        institution_orders = [item.get("order") for item in institution_details]
        institution_names = [item.get("name") for item in institution_details]
        numeric_orders = [value for value in institution_orders if isinstance(value, int)]
        result.check(bool(institution_details), f"{label}: 缺少 institutionDetails")
        result.check(len(numeric_orders) == len(institution_orders) and all(value > 0 for value in numeric_orders),
                     f"{label}: 每个单位的 order 必须是正整数")
        result.check(institution_orders == sorted(numeric_orders),
                     f"{label}: 单位必须按 order 非降序排列")
        if numeric_orders:
            result.check(sorted(set(numeric_orders)) == list(range(1, max(numeric_orders) + 1)),
                         f"{label}: 单位 order 必须从 1 连续编号")
        result.check(len(set(institution_names)) == len(institution_names) and all(institution_names),
                     f"{label}: 单位名称必须非空且在论文内唯一")
        result.check(all(str(item.get("explanation", "")).strip() for item in institution_details),
                     f"{label}: 每个单位都必须有悬浮解释")
        result.check(paper.get("institutions") == institution_summary(institution_details),
                     f"{label}: institutions 摘要必须由 institutionDetails 顺序生成")
        result.check("未知" not in str(paper.get("institutions", "")),
                     f"{label}: 更新后的单位信息不能保留“未知”占位符")
        result.check(str(paper.get("institutionSource", "")).startswith(("https://", "http://")),
                     f"{label}: institutionSource 必须是可追溯的论文来源链接")

        if paper.get("localPdf"):
            result.check((ROOT / paper["localPdf"]).resolve().is_file(),
                         f"{label}: 本地 PDF 不存在：{paper['localPdf']}")
        else:
            result.warn(bool(paper.get("localPdfNote")), f"{label}: 无本地 PDF，也没有说明")

        index = paper.get("index")
        if not isinstance(index, int) or index >= len(rows):
            continue
        source = rows[index]
        comparisons = [
            (str(index), source[0], "序号"),
            (paper.get("title"), source[1], "论文完整标题"),
            (paper.get("shortName"), source[2], "简称"),
            (paper.get("workbookInstitutions"), source[3], "相关单位（Excel D 列原值）"),
            ("+".join(paper.get("categoryCodes", [])), source[4], "大类别 E 列"),
            (paper.get("venue"), source[6], "会议 / 版本"),
            (paper.get("date"), source[7], "时间"),
            (paper.get("url"), source[8], "论文链接"),
        ]
        for actual, expected, field in comparisons:
            result.check(actual == expected,
                         f"{label}: {field} 与 Excel 不一致（data={actual!r}, excel={expected!r}）")
        result.check(paper.get("workbookTags") == normalize_tag_list(source[5]),
                     f"{label}: Excel F 列原始描述与源表不一致")

    return result


def main() -> int:
    try:
        catalog = load_catalog()
        rows = read_workbook_rows()
        result = validate_catalog(catalog, rows)
    except Exception as error:  # A malformed source should fail loudly but readably.
        print(f"[ERROR] 无法执行验证：{error}", file=sys.stderr)
        return 2

    for warning in result.warnings:
        print(f"[WARN] {warning}")
    for error in result.errors:
        print(f"[ERROR] {error}")

    if result.errors:
        print(f"\n验证失败：{len(result.errors)} 个错误，{len(result.warnings)} 个提醒。")
        return 1

    print(
        f"验证通过：{len(catalog['papers'])} 篇论文、"
        f"{len(catalog['categories'])} 个大类别、{len(catalog['tags'])} 个小标签；"
        "Excel 九列源值、tag.txt 标签、单位明细与运行文件均一致。"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
