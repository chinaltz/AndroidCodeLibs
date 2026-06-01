#!/usr/bin/env bash
# 从 Android phonicsapp 同步离线音频到小程序 assets
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/../phonicsapp/src/main/assets/audio"
DST="$ROOT/assets/audio"
if [[ ! -d "$SRC/phonemes" ]]; then
  echo "未找到 Android 音频目录: $SRC"
  exit 1
fi
mkdir -p "$DST/phonemes" "$DST/words"
rsync -a --delete "$SRC/phonemes/" "$DST/phonemes/"
rsync -a --delete "$SRC/words/" "$DST/words/"
echo "已同步音频到 $DST"
