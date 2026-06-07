#!/usr/bin/env bash
# 拼音音频同步入口：调用 Python 脚本按需拉取 audio-cmn + yanyu 回退。
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec python3 "$ROOT/tools/sync-pinyin-audio.py" "$@"
