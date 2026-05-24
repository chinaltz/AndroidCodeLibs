#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 /path/to/voice.onnx /path/to/voice.onnx.json"
  exit 1
fi

MODEL="$1"
CONFIG="$2"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT/src/main/assets/audio/words"

mkdir -p "$OUT_DIR"

WORDS=(
  sit pig fish
  pen red bed
  cat bag apple
  cup sun bus
  dog box hot
  book good look
  about teacher sofa
  see tree green
  car star park
  ball door four
)

for word in "${WORDS[@]}"; do
  out="$OUT_DIR/${word}.wav"
  if [[ -f "$out" ]]; then
    echo "skip $out"
    continue
  fi
  echo "generate $out"
  printf "%s\n" "$word" | piper --model "$MODEL" --config "$CONFIG" --output_file "$out"
done

echo "Done. Review pronunciation manually before converting/committing."
