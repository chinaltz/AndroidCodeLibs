#!/usr/bin/env python3
"""下载 Piper CLI（MIT）+ en_GB-alan-medium voice（MIT）。"""

from __future__ import annotations

import os
import platform
import shutil
import stat
import subprocess
import sys
import tarfile
import tempfile
import urllib.request
from pathlib import Path

TOOLS = Path(__file__).resolve().parent
PIPER_DIST = TOOLS / "piper_dist"
VOICE = "en_GB-alan-medium"
VOICE_DIR = TOOLS / "voices" / VOICE
PIPER_VERSION = "2023.11.14-2"

PIPER_ASSETS = {
    ("Darwin", "arm64"): "piper_macos_aarch64.tar.gz",
    ("Darwin", "x86_64"): "piper_macos_x64.tar.gz",
    ("Linux", "x86_64"): "piper_linux_x86_64.tar.gz",
    ("Linux", "aarch64"): "piper_linux_aarch64.tar.gz",
}

VOICE_BASES = [
    "https://hf-mirror.com/rhasspy/piper-voices/resolve/main/en/en_GB/alan/medium",
    "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_GB/alan/medium",
]


def download(url: str, dest: Path, timeout_sec: int = 180) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    urls = [url]
    if "github.com" in url:
        urls.append(f"https://ghproxy.com/{url}")
    if "huggingface.co" in url:
        urls.insert(0, url.replace("huggingface.co", "hf-mirror.com"))
    curl = shutil.which("curl")
    last_err: Exception | None = None
    for attempt_url in urls:
        if dest.exists():
            dest.unlink(missing_ok=True)
        if curl:
            for extra in (["--http1.1"], []):
                try:
                    subprocess.run(
                        [
                            curl,
                            "-fSL",
                            "--retry",
                            "5",
                            "--retry-delay",
                            "2",
                            "--connect-timeout",
                            "30",
                            "--max-time",
                            str(timeout_sec),
                            *extra,
                            attempt_url,
                            "-o",
                            str(dest),
                        ],
                        check=True,
                    )
                    if dest.stat().st_size > 1000:
                        print(f"  OK {dest.name} ({dest.stat().st_size // 1024} KB) <- {attempt_url.split('/')[2]}")
                        return
                except subprocess.CalledProcessError as exc:
                    last_err = exc
                    continue
        try:
            with urllib.request.urlopen(attempt_url, timeout=timeout_sec) as resp:
                dest.write_bytes(resp.read())
            if dest.stat().st_size > 1000:
                print(f"  OK {dest.name} ({dest.stat().st_size // 1024} KB)")
                return
        except Exception as exc:
            last_err = exc
    if last_err:
        raise last_err
    raise RuntimeError(f"下载失败: {url}")


def find_piper_executable() -> Path | None:
    if not PIPER_DIST.exists():
        return None
    for p in PIPER_DIST.rglob("piper"):
        if p.is_file() and os.access(p, os.X_OK):
            return p
    for p in PIPER_DIST.rglob("piper"):
        if p.is_file():
            return p
    return None


def setup_piper_cli() -> Path:
    key = (platform.system(), platform.machine())
    asset = PIPER_ASSETS.get(key)
    if not asset:
        sys.exit(f"不支持的平台: {key}，请手动安装 piper 并加入 PATH")
    existing = find_piper_executable()
    if existing and (existing.parent / "libespeak-ng.1.dylib").exists():
        return existing
    url = f"https://github.com/rhasspy/piper/releases/download/{PIPER_VERSION}/{asset}"
    print(f"下载 Piper CLI: {url}")
    if PIPER_DIST.exists():
        shutil.rmtree(PIPER_DIST)
    with tempfile.TemporaryDirectory() as tmp:
        archive = Path(tmp) / asset
        download(url, archive)
        with tarfile.open(archive, "r:gz") as tf:
            tf.extractall(PIPER_DIST)
        candidates = [
            p for p in PIPER_DIST.rglob("piper")
            if p.is_file() and os.access(p, os.X_OK)
        ]
        if not candidates:
            candidates = [p for p in PIPER_DIST.rglob("piper") if p.is_file()]
        if not candidates:
            sys.exit("解压后未找到 piper 可执行文件")
        piper_bin = candidates[0]
    piper_bin.chmod(piper_bin.stat().st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)
    return piper_bin


def setup_voice() -> tuple[Path, Path]:
    VOICE_DIR.mkdir(parents=True, exist_ok=True)
    model = VOICE_DIR / f"{VOICE}.onnx"
    config = VOICE_DIR / f"{VOICE}.onnx.json"
    for name in (f"{VOICE}.onnx", f"{VOICE}.onnx.json"):
        dest = VOICE_DIR / name
        if dest.exists() and dest.stat().st_size > 1000:
            continue
        last_err: Exception | None = None
        for base in VOICE_BASES:
            url = f"{base}/{name}"
            print(f"下载 voice: {url}")
            try:
                download(url, dest, timeout_sec=600 if name.endswith(".onnx") else 120)
                break
            except Exception as exc:
                last_err = exc
                dest.unlink(missing_ok=True)
        else:
            if last_err:
                raise last_err
    return model, config


def main() -> None:
    piper = setup_piper_cli()
    model, config = setup_voice()
    print(f"\nPiper CLI: {piper}")
    print(f"Voice:     {model}")
    print(f"Config:    {config}")
    print("\n许可证: piper + piper-voices 均为 MIT。运行 generate_compliant_audio.py 生成音频。")


if __name__ == "__main__":
    main()
