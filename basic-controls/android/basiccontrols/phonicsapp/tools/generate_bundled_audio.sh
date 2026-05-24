#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if ! python3 -c "import edge_tts" 2>/dev/null; then
  python3 -m pip install --user edge-tts
fi
# 1) 全部用孤立 IPA 重生成（纠正「读整词」错误）
python3 tools/generate_bundled_audio.py --phonemes --force --ipa-only
# 2) 若 tools/.phonics_audio_cache/mit 里已有文件，覆盖为 MIT Articulatory 音质
python3 - <<'PY'
import shutil, subprocess
from pathlib import Path
import sys
sys.path.insert(0, "tools")
from generate_bundled_audio import PHONEME_MIT, PHONEME_CONCAT, MIT_CACHE, PHONEME_DIR

for pid, name in PHONEME_MIT.items():
    src = MIT_CACHE / name
    if src.exists() and src.stat().st_size > 200:
        shutil.copy2(src, PHONEME_DIR / f"{pid}.mp3")
for pid, parts in PHONEME_CONCAT.items():
    paths = [MIT_CACHE / p for p in parts]
    if all(p.exists() for p in paths):
        dest = PHONEME_DIR / f"{pid}.mp3"
        lst = dest.with_suffix(".txt")
        lst.write_text("".join(f"file '{p.resolve()}'\n" for p in paths))
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0",
             "-i", str(lst), "-c", "copy", str(dest)],
            check=True,
        )
        lst.unlink(missing_ok=True)
print("MIT 缓存已合并（如有）")
PY
echo "完成。请重新编译 phonicsapp。"
