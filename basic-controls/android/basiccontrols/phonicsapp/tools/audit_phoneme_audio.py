#!/usr/bin/env python3
"""Audit bundled phoneme MP3 files against the 48-phoneme manifest."""

from __future__ import annotations

import hashlib
import importlib.util
import json
import subprocess
import sys
from pathlib import Path

TOOLS = Path(__file__).resolve().parent
ROOT = TOOLS.parent
PROJECT = ROOT.parent
MANIFEST = TOOLS / "phonics_audio_manifest.json"
AUDIO_ROOTS = [
    ROOT / "src/main/assets/audio/phonemes",
    PROJECT / "miniprogram/assets/audio/phonemes",
    PROJECT / "kuikly/shared/src/commonMain/assets/audio/phonemes",
    PROJECT / "kuikly/miniApp/dist/assets/audio/phonemes",
]
REPORT = ROOT / "docs/PHONEME_AUDIO_AUDIT.md"


def load_generator():
    spec = importlib.util.spec_from_file_location("generate_compliant_audio", TOOLS / "generate_compliant_audio.py")
    if spec is None or spec.loader is None:
        raise RuntimeError("cannot load generate_compliant_audio.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def probe(path: Path) -> tuple[float, int]:
    data = json.loads(
        subprocess.check_output(
            [
                "ffprobe",
                "-v",
                "error",
                "-show_entries",
                "format=duration,size",
                "-of",
                "json",
                str(path),
            ],
            text=True,
        )
    )
    fmt = data["format"]
    return float(fmt.get("duration", 0)), int(fmt.get("size", 0))


def source_for(pid: str, gen) -> str:
    if pid == "zh":
        return "Manual replacement `ybmp3.rar/n3.mp3` (`对应文件.doc`: `ʒ=n3`)"
    if pid in gen.PHONEME_MIT:
        return f"MIT isolated `{gen.PHONEME_MIT[pid]}`"
    if pid in gen.PHONEME_CONCAT:
        return "MIT concat `" + "+".join(gen.PHONEME_CONCAT[pid]) + "`"
    if pid in gen.PHONEME_TRIM:
        filename, start, duration = gen.PHONEME_TRIM[pid]
        return f"MIT trim `{filename}` {start:.2f}-{start + duration:.2f}s"
    if pid in gen.PHONEME_PIPER_IPA:
        return f"Piper IPA `[[{gen.PHONEME_PIPER_IPA[pid]}]]`"
    return "UNKNOWN"


def risk_for(pid: str, symbol: str, duration: float, gen) -> str:
    if pid == "zh":
        return "needs-license-record: manual source"
    if pid in gen.PHONEME_PIPER_IPA:
        return "needs-listen: synthetic IPA"
    if pid in gen.PHONEME_TRIM:
        return "needs-listen: trimmed source"
    if pid in gen.PHONEME_CONCAT:
        return "needs-listen: concatenated source"
    if symbol.endswith("ː/") and duration < 0.5:
        return "check: long vowel short duration"
    return "pass"


def main() -> int:
    gen = load_generator()
    entries = json.loads(MANIFEST.read_text(encoding="utf-8"))
    ids = [item["id"] for item in entries]
    errors: list[str] = []
    rows: list[dict[str, str | float | int]] = []

    if len(ids) != 48:
        errors.append(f"manifest has {len(ids)} phonemes, expected 48")
    duplicated = sorted({pid for pid in ids if ids.count(pid) > 1})
    if duplicated:
        errors.append(f"duplicated ids: {', '.join(duplicated)}")

    for root in AUDIO_ROOTS:
        if not root.exists():
            errors.append(f"missing audio root: {root}")
            continue
        files = sorted(root.glob("*.mp3"))
        if len(files) != 48:
            errors.append(f"{root} has {len(files)} mp3 files, expected 48")
        for pid in ids:
            if not (root / f"{pid}.mp3").exists():
                errors.append(f"missing {pid}.mp3 in {root}")

    base = AUDIO_ROOTS[0]
    for item in entries:
        pid = item["id"]
        symbol = item["symbol"]
        path = base / f"{pid}.mp3"
        duration, size = probe(path)
        digest = sha256(path)
        for root in AUDIO_ROOTS[1:]:
            other = root / f"{pid}.mp3"
            if other.exists() and sha256(other) != digest:
                errors.append(f"hash mismatch: {pid}.mp3 in {root}")
        source = source_for(pid, gen)
        if source == "UNKNOWN":
            errors.append(f"unknown source mapping for {pid}")
        rows.append(
            {
                "id": pid,
                "symbol": symbol,
                "duration": duration,
                "size": size,
                "source": source,
                "status": risk_for(pid, symbol, duration, gen),
            }
        )

    risky = [row for row in rows if row["status"] != "pass"]
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(
        "# 音标音频审计报告\n\n"
        "## 结论\n\n"
        f"- 清单音标数：{len(ids)} / 48\n"
        f"- 已检查资源目录：{len(AUDIO_ROOTS)} 个\n"
        f"- 机器校验错误：{len(errors)} 个\n"
        f"- 需人工听辨项：{len(risky)} 个\n\n"
        "机器校验覆盖：id 唯一性、48 个文件存在性、Android/小程序/Kuikly 四端 hash 一致性、"
        "来源映射、时长和大小读取。\n\n"
        "## 需人工听辨项\n\n"
        + (
            "\n".join(
                f"- `{row['id']}` {row['symbol']}：{row['source']}，{row['duration']:.3f}s，{row['status']}"
                for row in risky
            )
            if risky
            else "- 无\n"
        )
        + "\n\n## 全量表\n\n"
        "| id | IPA | 时长 | 大小 | 来源 | 状态 |\n"
        "| --- | --- | ---: | ---: | --- | --- |\n"
        + "\n".join(
            f"| `{row['id']}` | {row['symbol']} | {row['duration']:.3f}s | {row['size']} | {row['source']} | {row['status']} |"
            for row in rows
        )
        + "\n",
        encoding="utf-8",
    )

    if errors:
        print("FAILED")
        for error in errors:
            print(error)
        print(f"report: {REPORT}")
        return 1
    print(f"PASS: {len(rows)} phonemes audited; {len(risky)} items require human listening")
    print(f"report: {REPORT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
