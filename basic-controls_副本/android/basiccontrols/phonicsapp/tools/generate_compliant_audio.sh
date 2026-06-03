#!/usr/bin/env bash
# 合规音频一键生成（MIT 音标 + Piper 例词，无 Edge-TTS）
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ ! -f tools/voices/en_GB-alan-medium/en_GB-alan-medium.onnx ]]; then
  python3 tools/setup_piper_voice.py
fi

if ! python3 -c "import piper" 2>/dev/null; then
  echo "安装 Piper（清华 PyPI 镜像）..."
  python3 -m pip install --user piper-tts -i https://pypi.tuna.tsinghua.edu.cn/simple
fi

python3 tools/generate_compliant_audio.py --force "$@"
