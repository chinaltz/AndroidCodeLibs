#!/usr/bin/env python3
"""
合规内置音频一键生成（无 Edge-TTS / 无云 API / 无系统 TTS 再分发）。

来源：
  1. 音标（优先）：MIT s5s5/phonics 孤立音素 MP3
  2. 音标（缺口 /ts/ /dz/）：MIT 音素拼接
  3. 音标（MIT 无文件）：Piper 本地 TTS（MIT voice，短提示音占位）
  4. 例词：Piper 本地 TTS（MIT voice）

依赖：
  pip install piper-tts
  ffmpeg（转 mp3）
  curl（下载 MIT 音素）

用法：
  python3 tools/setup_piper_voice.py          # 首次：下载 MIT voice
  python3 tools/generate_compliant_audio.py --force
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOOLS = Path(__file__).resolve().parent
MANIFEST = TOOLS / "phonics_audio_manifest.json"
PHONEME_DIR = ROOT / "src/main/assets/audio/phonemes"
WORD_DIR = ROOT / "src/main/assets/audio/words"
NOTICE = ROOT / "src/main/assets/audio/THIRD_PARTY_NOTICE.md"
MIT_CACHE = TOOLS / ".phonics_audio_cache" / "mit"
VOICE_DIR = TOOLS / "voices" / "en_GB-alan-medium"
PIPER_DIST = TOOLS / "piper_dist"
MIT_BASE = "https://raw.githubusercontent.com/s5s5/phonics/main/public/sound/"

PHONEME_MIT: dict[str, str] = {
    "i_short": "ɪ.mp3",
    "e": "ɛ.mp3",
    "ae": "æ.mp3",
    "u_short": "ʊ.mp3",
    "schwa": "ə.mp3",
    "i_long": "i.mp3",
    "a_long": "ɑ.mp3",
    "o_long": "ɔ.mp3",
    "u_long": "u.mp3",
    "ei": "eɪ.mp3",
    "ai": "aɪ.mp3",
    "oi": "ɔɪ.mp3",
    "au": "aʊ.mp3",
    "p": "p.mp3",
    "t": "t.mp3",
    "k": "k.mp3",
    "f": "f.mp3",
    "th_clear": "θ.mp3",
    "s": "s.mp3",
    "sh": "ʃ.mp3",
    "tsh": "tʃ.mp3",
    "h": "h.mp3",
    "b": "b.mp3",
    "d": "d.mp3",
    "g": "ɡ.mp3",
    "v": "v.mp3",
    "th_voice": "ð.mp3",
    "z": "z.mp3",
    "dzh": "dʒ.mp3",
    "r": "ɹ.mp3",
    "m": "m.mp3",
    "n": "n.mp3",
    "ng": "ŋ.mp3",
    "l": "ɫ.mp3",
    "j": "j.mp3",
    "w": "w.mp3",
    "tr": "tɹ.mp3",
    "dr": "dɹ.mp3",
}

PHONEME_CONCAT: dict[str, list[str]] = {
    "ts": ["t.mp3", "s.mp3"],
    "dz": ["d.mp3", "z.mp3"],
}

# MIT 无独立文件时，Piper 读短提示（开发占位；正式版建议自录）
PHONEME_PIPER_TEXT: dict[str, str] = {
    "v_short": "uh",
    "o_short": "o",
    "er_long": "er",
    "ou": "oh",
    "ia": "ear",
    "ea": "air",
    "ua": "sure",
    "zh": "zh",
}


def piper_bin() -> Path:
    for candidate in (
        TOOLS / "piper_dist" / "piper",
        TOOLS / "piper_dist" / "piper" / "piper",
    ):
        if candidate.exists():
            return candidate
    for root in (TOOLS / "piper_dist",):
        if root.exists():
            found = next((p for p in root.rglob("piper") if p.is_file()), None)
            if found:
                return found
    found = shutil.which("piper")
    if found:
        return Path(found)
    sys.exit(
        "未找到 Piper。请先运行:\n"
        "  python3 tools/setup_piper_voice.py"
    )


def piper_env() -> dict[str, str]:
    env = os.environ.copy()
    if not PIPER_DIST.exists():
        return env
    for p in PIPER_DIST.rglob("piper"):
        if p.is_file():
            lib_dir = p.parent
            prev = env.get("DYLD_LIBRARY_PATH", "")
            env["DYLD_LIBRARY_PATH"] = f"{lib_dir}:{prev}" if prev else str(lib_dir)
            break
    return env


def require_tools() -> None:
    if shutil.which("ffmpeg") is None:
        sys.exit("需要 ffmpeg: brew install ffmpeg")


def voice_files() -> tuple[Path, Path]:
    model = VOICE_DIR / "en_GB-alan-medium.onnx"
    config = VOICE_DIR / "en_GB-alan-medium.onnx.json"
    if not model.exists() or not config.exists():
        sys.exit(
            "未找到 Piper voice。请先运行:\n"
            "  python3 tools/setup_piper_voice.py"
        )
    return model, config


def download_mit(filename: str) -> Path:
    MIT_CACHE.mkdir(parents=True, exist_ok=True)
    cached = MIT_CACHE / filename
    if cached.exists() and cached.stat().st_size > 200:
        return cached
    url = MIT_BASE + urllib.request.quote(filename, safe="")
    curl = shutil.which("curl")
    if curl:
        subprocess.run(
            [curl, "-fsSL", "--retry", "5", url, "-o", str(cached)],
            check=True,
        )
        return cached
    with urllib.request.urlopen(url, timeout=60) as resp:
        cached.write_bytes(resp.read())
    return cached


def wav_to_mp3(wav: Path, mp3: Path) -> None:
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-loglevel",
            "error",
            "-i",
            str(wav),
            "-codec:a",
            "libmp3lame",
            "-qscale:a",
            "4",
            str(mp3),
        ],
        check=True,
    )


def piper_synth(text: str, mp3: Path, model: Path, config: Path) -> None:
    wav = mp3.with_suffix(".wav")
    cmd = [
        sys.executable, "-m", "piper",
        "--model", str(model),
        "--config", str(config),
        "--output_file", str(wav),
    ]
    env = piper_env()
    try:
        subprocess.run(cmd, input=text.encode("utf-8"), check=True, env=env)
    except subprocess.CalledProcessError:
        native = piper_bin()
        if native.exists():
            subprocess.run(
                [str(native), "--model", str(model), "--config", str(config), "--output_file", str(wav)],
                input=text.encode("utf-8"),
                check=True,
                env=env,
            )
        else:
            raise
    wav_to_mp3(wav, mp3)
    wav.unlink(missing_ok=True)


def concat_mit(files: list[str], dest_mp3: Path) -> None:
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise RuntimeError("需要 ffmpeg")
    paths = [download_mit(name) for name in files]
    list_file = dest_mp3.with_suffix(".txt")
    list_file.write_text(
        "".join(f"file '{p.resolve()}'\n" for p in paths),
        encoding="utf-8",
    )
    subprocess.run(
        [
            ffmpeg,
            "-y",
            "-loglevel",
            "error",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(list_file),
            "-codec:a",
            "libmp3lame",
            "-qscale:a",
            "4",
            str(dest_mp3),
        ],
        check=True,
    )
    list_file.unlink(missing_ok=True)


def build_phoneme(pid: str, dest: Path, model: Path, config: Path) -> str:
    if pid in PHONEME_MIT:
        src = download_mit(PHONEME_MIT[pid])
        shutil.copy2(src, dest)
        return f"MIT {PHONEME_MIT[pid]}"
    if pid in PHONEME_CONCAT:
        concat_mit(PHONEME_CONCAT[pid], dest)
        return f"MIT concat {'+'.join(PHONEME_CONCAT[pid])}"
    text = PHONEME_PIPER_TEXT[pid]
    piper_synth(text, dest, model, config)
    return f"Piper MIT voice '{text}'"


def write_notice() -> None:
    NOTICE.write_text(
        """# 内置音频第三方声明

## 音标（phonemes/）

- 主要来源：[s5s5/phonics](https://github.com/s5s5/phonics) `public/sound/*.mp3`
- 许可证：**MIT License**（Copyright (c) 2022 Xiaochao Liu）
- `/ts/`、`/dz/`：由上述 MIT 音素 MP3 拼接
- 少量英式缺口音标（如 `/ʌ/` `/ɒ/` `/ɜː/` 等）：**Piper** 本地合成占位，voice 见下

## 例词（words/）

- 来源：**Piper** 本地 TTS 离线生成
- Voice：`en_GB-alan-medium`（[rhasspy/piper-voices](https://huggingface.co/rhasspy/piper-voices)）
- 引擎：[piper](https://github.com/rhasspy/piper) **MIT License**

## 不包含

- Microsoft Edge-TTS / Azure 神经语音再分发
- macOS 系统 `say` 语音再分发
- 词典 / 网课 / App 解包音频

## 生成命令

```bash
python3 tools/setup_piper_voice.py
python3 tools/generate_compliant_audio.py --force
```

生成记录见 `tools/audio_generation_record.json`。
""",
        encoding="utf-8",
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="覆盖已有 mp3")
    args = parser.parse_args()

    require_tools()
    model, config = voice_files()
    entries = json.loads(MANIFEST.read_text(encoding="utf-8"))
    PHONEME_DIR.mkdir(parents=True, exist_ok=True)
    WORD_DIR.mkdir(parents=True, exist_ok=True)

    record = {"phonemes": {}, "words": {}}

    print(f"=== 音标 ({len(entries)} 个，合规来源）===")
    for item in entries:
        pid = item["id"]
        dest = PHONEME_DIR / f"{pid}.mp3"
        if dest.exists() and not args.force:
            print(f"  skip {pid}")
            continue
        source = build_phoneme(pid, dest, model, config)
        record["phonemes"][pid] = source
        print(f"  {pid:12} {item['symbol']:6} <- {source}")

    words: set[str] = set()
    for item in entries:
        for w in item["words"]:
            words.add(w.lower())

    print(f"\n=== 例词 ({len(words)} 个，Piper MIT voice）===")
    for word in sorted(words):
        dest = WORD_DIR / f"{word}.mp3"
        if dest.exists() and not args.force:
            print(f"  skip {word}")
            continue
        piper_synth(word, dest, model, config)
        record["words"][word] = "Piper en_GB-alan-medium"
        print(f"  {word}")

    meta = {
        "source": "compliant_bundled",
        "mode": "bundled_assets",
        "network": False,
        "phonemes_primary": "MIT s5s5/phonics (https://github.com/s5s5/phonics)",
        "phonemes_gaps": "Piper en_GB-alan-medium (MIT)",
        "words": "Piper en_GB-alan-medium (MIT)",
        "notice": "src/main/assets/audio/THIRD_PARTY_NOTICE.md",
    }
    (ROOT / "src/main/assets/audio/audio_manifest.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    (TOOLS / "audio_generation_record.json").write_text(
        json.dumps(record, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    write_notice()
    print("\n完成。请重新编译 phonicsapp，并在关于页保留 THIRD_PARTY_NOTICE。")


if __name__ == "__main__":
    main()
