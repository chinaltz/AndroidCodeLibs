#!/usr/bin/env python3
"""Render WeChat Search cards from social/wechat-search/cards.html via headless Chrome.

Usage:
  python3 scripts/render-wechat-search-cards.py content/posts/18-google-io-wwdc-2026-ai-duel
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image

W, H = 1080, 1440

CHROME_CANDIDATES = [
    "google-chrome",
    "google-chrome-stable",
    "chromium",
    "chromium-browser",
]


def find_chrome() -> str:
    for name in CHROME_CANDIDATES:
        path = shutil.which(name)
        if path:
            return path
    raise RuntimeError("未找到 Chrome/Chromium，无法截图 cards.html")


def screenshot(html: Path, out_dir: Path, card: int, chrome: str) -> None:
    url = html.resolve().as_uri() + f"?card={card}"
    out = out_dir / f"wechat-card-{card:02d}.png"
    cmd = [
        chrome,
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--force-device-scale-factor=1",
        f"--window-size={W},{H}",
        f"--screenshot={out}",
        url,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0 or not out.exists():
        raise RuntimeError(
            f"截图失败 card={card}\nstdout: {result.stdout}\nstderr: {result.stderr}"
        )
    with Image.open(out) as img:
        if img.size != (W, H):
            resized = img.resize((W, H), Image.Resampling.LANCZOS)
            resized.save(out, quality=96)
    print(f"ok {out.name}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Render WeChat Search card PNGs from cards.html")
    parser.add_argument("post", help="文章目录，如 content/posts/18-google-io-wwdc-2026-ai-duel")
    args = parser.parse_args()

    post = Path(args.post).resolve()
    html = post / "social/wechat-search/cards.html"
    out_dir = post / "social/wechat-search"
    if not html.exists():
        print(f"缺少 {html}", file=sys.stderr)
        sys.exit(1)

    chrome = find_chrome()
    out_dir.mkdir(parents=True, exist_ok=True)
    for i in range(1, 6):
        screenshot(html, out_dir, i, chrome)


if __name__ == "__main__":
    main()
