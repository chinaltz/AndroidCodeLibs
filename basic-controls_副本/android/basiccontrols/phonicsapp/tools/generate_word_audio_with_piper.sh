#!/usr/bin/env bash
# 用 Piper MIT voice 批量生成 manifest 中全部例词
set -euo pipefail
if [[ $# -lt 2 ]]; then
  echo "Usage: $0 /path/to/en_GB-alan-medium.onnx /path/to/en_GB-alan-medium.onnx.json"
  echo "或先运行: python3 tools/setup_piper_voice.py"
  exit 1
fi

MODEL="$1"
CONFIG="$2"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT/src/main/assets/audio/words"
PIPER="${ROOT}/tools/bin/piper"
if [[ ! -x "$PIPER" ]]; then
  PIPER="$(command -v piper || true)"
fi
if [[ -z "$PIPER" ]]; then
  echo "未找到 piper，请先 python3 tools/setup_piper_voice.py"
  exit 1
fi

mkdir -p "$OUT_DIR"
mapfile -t WORDS < <(python3 - <<'PY'
import json
from pathlib import Path
entries = json.loads(Path("tools/phonics_audio_manifest.json").read_text())
words = sorted({w.lower() for e in entries for w in e["words"]})
print("\n".join(words))
PY
)

for word in "${WORDS[@]}"; do
  wav="$OUT_DIR/${word}.wav"
  mp3="$OUT_DIR/${word}.mp3"
  echo "generate $word"
  printf "%s\n" "$word" | "$PIPER" --model "$MODEL" --config "$CONFIG" --output_file "$wav"
  ffmpeg -y -loglevel error -i "$wav" -codec:a libmp3lame -qscale:a 4 "$mp3"
  rm -f "$wav"
done

echo "Done. 115 例词已生成到 $OUT_DIR"
