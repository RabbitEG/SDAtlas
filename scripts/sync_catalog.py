#!/usr/bin/env python3
"""Generate the browser catalog from the canonical merged JSON file.

The website must keep working when opened directly through ``file://``. A
browser cannot reliably fetch a sibling JSON file in that mode, so the human-
maintained ``data/catalog.json`` is wrapped in one global assignment for the
runtime. Never edit ``assets/js/data.js`` by hand.

Usage::

    python3 scripts/sync_catalog.py
    python3 scripts/sync_catalog.py --check
"""

import argparse
import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = ROOT / "data" / "catalog.json"
RUNTIME_PATH = ROOT / "assets" / "js" / "data.js"
RUNTIME_HEADER = """/*
 * AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY.
 *
 * Edit data/catalog.json, then run: python3 scripts/sync_catalog.py
 * The wrapper keeps the static site compatible with direct file:// access.
 */
window.SD_ATLAS_DATA = """


def load_catalog() -> dict:
    """Load and minimally type-check the canonical catalog."""
    catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    if not isinstance(catalog, dict) or not isinstance(catalog.get("papers"), list):
        raise ValueError("data/catalog.json must contain an object with a papers array")
    return catalog


def render_runtime(catalog: dict) -> str:
    """Return the deterministic JavaScript wrapper for a catalog object."""
    body = json.dumps(catalog, ensure_ascii=False, indent=2)
    return RUNTIME_HEADER + body + ";\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check",
        action="store_true",
        help="fail if assets/js/data.js is not synchronized; do not write",
    )
    args = parser.parse_args()

    try:
        expected = render_runtime(load_catalog())
    except (OSError, ValueError, json.JSONDecodeError) as error:
        print(f"[ERROR] 无法读取合并目录：{error}", file=sys.stderr)
        return 2

    current = RUNTIME_PATH.read_text(encoding="utf-8") if RUNTIME_PATH.exists() else ""
    if args.check:
        if current != expected:
            print("[ERROR] assets/js/data.js 未与 data/catalog.json 同步。")
            print("请运行：python3 scripts/sync_catalog.py")
            return 1
        print("目录同步检查通过：assets/js/data.js 与 data/catalog.json 一致。")
        return 0

    if current == expected:
        print("目录已同步，无需改写 assets/js/data.js。")
        return 0

    RUNTIME_PATH.write_text(expected, encoding="utf-8")
    print("已由 data/catalog.json 生成 assets/js/data.js。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
