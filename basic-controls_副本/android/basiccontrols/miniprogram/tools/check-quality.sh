#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
MAX_BYTES=$((200 * 1024))

oversized="$(
  find "$ROOT_DIR" -type f \( \
    -iname '*.mp3' -o -iname '*.aac' -o -iname '*.m4a' -o -iname '*.wav' -o \
    -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.webp' -o -iname '*.gif' \
  \) -size +200k -print
)"

if [[ -n "$oversized" ]]; then
  echo "Found media files larger than 200K:"
  while IFS= read -r file; do
    [[ -z "$file" ]] && continue
    size="$(du -h "$file" | awk '{print $1}')"
    echo "  $size  ${file#$ROOT_DIR/}"
  done <<< "$oversized"
  exit 1
fi

media_count="$(
  find "$ROOT_DIR" -type f \( \
    -iname '*.mp3' -o -iname '*.aac' -o -iname '*.m4a' -o -iname '*.wav' -o \
    -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.webp' -o -iname '*.gif' \
  \) | wc -l | tr -d ' '
)"

echo "Quality media check passed: $media_count media files, none larger than 200K."
