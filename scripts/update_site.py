#!/usr/bin/env python3
"""Synchronize and validate SDAtlas after editing paper JSON files.

Default usage from anywhere inside or outside the project::

    python3 scripts/update_site.py

Add ``--with-terminology`` when an editorial terminology audit should also be
treated as a required check. The default workflow remains suitable for quick
updates to personal notes and Q&A text.
"""

import argparse
import subprocess
import sys
from pathlib import Path
from typing import List, Sequence, Tuple


ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / "scripts"


def run_step(label: str, arguments: Sequence[str]) -> int:
    """Run one project script with the current Python interpreter."""
    print(f"\n== {label} ==", flush=True)
    completed = subprocess.run(
        [sys.executable] + list(arguments),
        cwd=str(ROOT),
    )
    if completed.returncode:
        print(f"\n[ERROR] {label}失败。", file=sys.stderr)
    return completed.returncode


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--with-terminology",
        action="store_true",
        help="额外运行术语检查，并在术语不一致时返回失败",
    )
    args = parser.parse_args()

    sync_status = run_step("同步网页数据", [str(SCRIPTS / "sync_catalog.py")])
    if sync_status:
        return sync_status

    steps = [
        ("复查生成物一致性", [str(SCRIPTS / "sync_catalog.py"), "--check"]),
        ("验证论文目录", [str(SCRIPTS / "validate_catalog.py")]),
    ]  # type: List[Tuple[str, List[str]]]
    if args.with_terminology:
        steps.append(("检查编辑术语", [str(SCRIPTS / "check_terminology.py")]))

    failures = []  # type: List[str]
    for label, command in steps:
        status = run_step(label, command)
        if status:
            failures.append(label)

    if failures:
        print("\n[ERROR] 网页数据已经同步，但以下检查未通过：" +
              "、".join(failures), file=sys.stderr)
        return 1

    print("\n[OK] SDAtlas 网页数据已同步，结构、目录和生成物检查均通过。")
    if not args.with_terminology:
        print("需要严格编辑检查时运行：python3 scripts/update_site.py --with-terminology")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
