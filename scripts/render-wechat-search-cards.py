#!/usr/bin/env python3
"""Render WeChat Search cards from social/wechat-search/cards.html via headless Chrome.

Usage:
  python3 scripts/render-wechat-search-cards.py content/posts/16-google-io-wwdc-2026-ai-duel
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

MACOS_CHROME_PATHS = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
]


def find_chrome() -> str | None:
    for name in CHROME_CANDIDATES:
        path = shutil.which(name)
        if path:
            return path
    for path in MACOS_CHROME_PATHS:
        if Path(path).exists():
            return path
    return None


def screenshot_playwright(html: Path, out_dir: Path, card: int) -> None:
    from playwright.sync_api import sync_playwright

    url = html.resolve().as_uri() + f"?card={card}"
    out = out_dir / f"wechat-card-{card:02d}.png"
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": W, "height": H})
        page.goto(url, wait_until="networkidle")
        page.screenshot(path=str(out))
        browser.close()
    with Image.open(out) as img:
        if img.size != (W, H):
            resized = img.resize((W, H), Image.Resampling.LANCZOS)
            resized.save(out, quality=96)
    print(f"ok {out.name} (playwright)")


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
    parser.add_argument("post", help="文章目录，如 content/posts/16-google-io-wwdc-2026-ai-duel")
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
        if chrome:
            screenshot(html, out_dir, i, chrome)
        else:
            screenshot_playwright(html, out_dir, i)


if __name__ == "__main__":
    main()
