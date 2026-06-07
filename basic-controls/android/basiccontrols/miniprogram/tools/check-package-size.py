#!/usr/bin/env python3
"""Estimate WeChat miniprogram upload size using project.config.json packOptions.ignore."""

from __future__ import annotations

import fnmatch
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAIN_LIMIT = 2 * 1024 * 1024
SUB_LIMIT = 2 * 1024 * 1024
TOTAL_LIMIT = 20 * 1024 * 1024


def load_ignore_rules():
    config_path = os.path.join(ROOT, "project.config.json")
    with open(config_path, "r", encoding="utf-8") as handle:
        config = json.load(handle)
    return config.get("packOptions", {}).get("ignore", [])


def ignored(rel: str, rules) -> bool:
    rel = rel.replace("\\", "/")
    for rule in rules:
        kind = rule.get("type")
        value = rule.get("value", "")
        if kind == "folder":
            prefix = value.rstrip("/")
            if rel == prefix or rel.startswith(prefix + "/"):
                return True
        elif kind == "glob":
            if fnmatch.fnmatch(rel, value):
                return True
    return False


def load_subpackages():
    app_path = os.path.join(ROOT, "app.json")
    with open(app_path, "r", encoding="utf-8") as handle:
        app = json.load(handle)
    return app.get("subpackages", [])


def scan_package(prefix: str, rules):
    total = 0
    files = []
    for dirpath, dirnames, filenames in os.walk(os.path.join(ROOT, prefix) if prefix else ROOT):
        dirnames[:] = [name for name in dirnames if name not in {".git", "node_modules", ".cache"}]
        for filename in filenames:
            abs_path = os.path.join(dirpath, filename)
            rel = os.path.relpath(abs_path, ROOT).replace("\\", "/")
            if prefix and not (rel == prefix or rel.startswith(prefix + "/")):
                continue
            if not prefix:
                # main package scan below handles subtraction
                pass
            if ignored(rel, rules):
                continue
            size = os.path.getsize(abs_path)
            total += size
            files.append((size, rel))
    return total, sorted(files, reverse=True)


def main():
    rules = load_ignore_rules()
    subpackages = load_subpackages()
    sub_roots = [item["root"].rstrip("/") for item in subpackages]

    all_total, all_files = scan_package("", rules)
    sub_total = 0
    sub_breakdown = []
    for root in sub_roots:
        size, _ = scan_package(root, rules)
        sub_total += size
        sub_breakdown.append((root, size))

    main_total = 0
    main_files = []
    for size, rel in all_files:
        if any(rel == root or rel.startswith(root + "/") for root in sub_roots):
            continue
        main_total += size
        main_files.append((size, rel))

    print("Upload size estimate (after packOptions.ignore)\n")
    print(f"Main package: {main_total / 1024 / 1024:.2f} MB  limit 2.00 MB  {'OK' if main_total <= MAIN_LIMIT else 'OVER'}")
    for root, size in sub_breakdown:
        print(f"Subpackage {root}: {size / 1024 / 1024:.2f} MB  limit 2.00 MB  {'OK' if size <= SUB_LIMIT else 'OVER'}")
    print(f"Total: {(main_total + sub_total) / 1024 / 1024:.2f} MB  limit 20.00 MB  {'OK' if main_total + sub_total <= TOTAL_LIMIT else 'OVER'}")
    print("\nTop main files:")
    for size, rel in main_files[:15]:
        print(f"  {size / 1024:6.1f} KB  {rel}")

    if main_total > MAIN_LIMIT or any(size > SUB_LIMIT for _, size in sub_breakdown):
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
