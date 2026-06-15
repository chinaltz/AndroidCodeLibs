#!/usr/bin/env python3
"""Backward-compatible wrapper for 16-google-io-wwdc-2026-ai-duel cards."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
POST = "content/posts/16-google-io-wwdc-2026-ai-duel"
RENDER = ROOT / "scripts/render-wechat-search-cards.py"

if __name__ == "__main__":
    sys.exit(subprocess.call([sys.executable, str(RENDER), POST]))
