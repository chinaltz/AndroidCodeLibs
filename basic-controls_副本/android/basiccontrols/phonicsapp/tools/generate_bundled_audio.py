#!/usr/bin/env python3
"""
生成内置音频：48 音标（孤立音素）+ 例词。

音标规则（与「读整词」区分）：
  1. 优先 MIT s5s5/phonics 的 IPA 命名单独音素 MP3
  2. /ts/ /dz/ 由两个辅音 MP3 拼接
  3. 英式缺口（/ʌ/ /ɒ/ /ɜː/ /əʊ/ /ɪə/ /eə/ /ʊə/）用 Edge-TTS + SSML <phoneme>

例词：Edge-TTS 英式 Sonia 读单词。

用法:
  python3 tools/generate_bundled_audio.py --phonemes --force
  python3 tools/generate_bundled_audio.py --words
  python3 tools/generate_bundled_audio.py --force   # 音标 + 例词
"""

from __future__ import annotations

import argparse
import asyncio
import json
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

try:
    import edge_tts
except ImportError:
    print("音标与例词生成需要: pip install edge-tts", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = Path(__file__).resolve().parent / "phonics_audio_manifest.json"
PHONEME_DIR = ROOT / "src/main/assets/audio/phonemes"
WORD_DIR = ROOT / "src/main/assets/audio/words"
MIT_CACHE = Path(__file__).resolve().parent / ".phonics_audio_cache" / "mit"
MIT_BASE = "https://raw.githubusercontent.com/s5s5/phonics/main/public/sound/"
VOICE = "en-GB-SoniaNeural"

# id -> MIT 文件名（孤立音素，非整词）
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
    "zh": "ʒ.mp3",
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

# id -> 两个 MIT 文件拼接
PHONEME_CONCAT: dict[str, list[str]] = {
    "ts": ["t.mp3", "s.mp3"],
    "dz": ["d.mp3", "z.mp3"],
}

# id -> IPA（英式 SSML，MIT 无对应文件）
PHONEME_IPA: dict[str, str] = {
    "v_short": "ʌ",
    "o_short": "ɒ",
    "er_long": "ɜː",
    "ou": "əʊ",
    "ia": "ɪə",
    "ea": "eə",
    "ua": "ʊə",
}


def all_mit_filenames() -> set[str]:
    names = set(PHONEME_MIT.values())
    for parts in PHONEME_CONCAT.values():
        names.update(parts)
    return names


def download_mit(filename: str) -> Path:
    MIT_CACHE.mkdir(parents=True, exist_ok=True)
    cached = MIT_CACHE / filename
    if cached.exists() and cached.stat().st_size > 200:
        return cached
    url = MIT_BASE + urllib.request.quote(filename, safe="")
    errors: list[str] = []
    curl = shutil.which("curl")
    if curl:
        result = subprocess.run(
            [
                curl,
                "-fsSL",
                "--retry",
                "8",
                "--retry-delay",
                "3",
                "--connect-timeout",
                "30",
                "--max-time",
                "120",
                url,
                "-o",
                str(cached),
            ],
            capture_output=True,
            text=True,
        )
        if result.returncode == 0 and cached.exists() and cached.stat().st_size > 200:
            return cached
        if result.stderr:
            errors.append(result.stderr.strip())
    for attempt in range(3):
        try:
            with urllib.request.urlopen(url, timeout=120) as resp:
                cached.write_bytes(resp.read())
            if cached.stat().st_size > 200:
                return cached
        except Exception as err:
            errors.append(str(err))
            time.sleep(3 * (attempt + 1))
    raise RuntimeError(errors[-1] if errors else f"download failed: {filename}")


def prefetch_mit_cache() -> None:
    print("预下载 MIT 音素缓存…")
    for name in sorted(all_mit_filenames()):
        try:
            download_mit(name)
            print(f"  ok {name}")
        except Exception as err:
            print(f"  miss {name}: {err}")


def concat_mit(files: list[str], dest: Path) -> None:
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise RuntimeError("拼接音标需要 ffmpeg")
    paths = [download_mit(name) for name in files]
    list_file = dest.with_suffix(".txt")
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
            "-c",
            "copy",
            str(dest),
        ],
        check=True,
    )
    list_file.unlink(missing_ok=True)


async def synth_ipa(ipa: str, dest: Path) -> None:
    ssml = (
        f'<speak version="1.0" xml:lang="en-GB">'
        f'<voice name="{VOICE}">'
        f'<phoneme alphabet="ipa" ph="{ipa}">a</phoneme>'
        f"</voice></speak>"
    )
    await edge_tts.Communicate(ssml, voice=VOICE).save(str(dest))


async def synth_word(word: str, dest: Path) -> None:
    await edge_tts.Communicate(word, voice=VOICE).save(str(dest))


def symbol_to_ipa(symbol: str) -> str:
    return symbol.strip().strip("/")


async def build_phoneme(pid: str, symbol: str, dest: Path) -> str:
    if pid in PHONEME_MIT:
        try:
            src = download_mit(PHONEME_MIT[pid])
            shutil.copy2(src, dest)
            return f"MIT {PHONEME_MIT[pid]}"
        except Exception as err:
            ipa = PHONEME_IPA.get(pid) or symbol_to_ipa(symbol)
            await synth_ipa(ipa, dest)
            return f"IPA /{ipa}/ (MIT 失败)"
    if pid in PHONEME_CONCAT:
        try:
            concat_mit(PHONEME_CONCAT[pid], dest)
            return f"concat {'+'.join(PHONEME_CONCAT[pid])}"
        except Exception:
            ipa = symbol_to_ipa(symbol)
            await synth_ipa(ipa, dest)
            return f"IPA /{ipa}/ (concat 失败)"
    ipa = PHONEME_IPA.get(pid) or symbol_to_ipa(symbol)
    await synth_ipa(ipa, dest)
    return f"IPA /{ipa}/"


async def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="覆盖已有文件")
    parser.add_argument("--phonemes", action="store_true", help="只生成音标")
    parser.add_argument("--words", action="store_true", help="只生成例词")
    parser.add_argument(
        "--ipa-only",
        action="store_true",
        help="全部音标用 Edge IPA 合成（网络差时用）",
    )
    parser.add_argument(
        "--prefetch-mit",
        action="store_true",
        help="仅预下载 MIT 缓存",
    )
    args = parser.parse_args()
    if args.prefetch_mit:
        prefetch_mit_cache()
        return
    if not args.phonemes and not args.words:
        args.phonemes = True
        args.words = True

    entries = json.loads(MANIFEST.read_text(encoding="utf-8"))
    PHONEME_DIR.mkdir(parents=True, exist_ok=True)
    WORD_DIR.mkdir(parents=True, exist_ok=True)

    if args.phonemes:
        print(f"=== 音标 ({len(entries)} 个，孤立音素）===")
        for item in entries:
            pid = item["id"]
            dest = PHONEME_DIR / f"{pid}.mp3"
            if dest.exists() and not args.force:
                print(f"  skip {pid}")
                continue
            try:
                if args.ipa_only:
                    ipa = PHONEME_IPA.get(pid) or symbol_to_ipa(item["symbol"])
                    await synth_ipa(ipa, dest)
                    source = f"IPA /{ipa}/"
                else:
                    source = await build_phoneme(pid, item["symbol"], dest)
                print(f"  {pid:12} {item['symbol']:6} <- {source}")
            except Exception as err:
                print(f"  FAIL {pid}: {err}", file=sys.stderr)
                raise

    if args.words:
        words: set[str] = set()
        for item in entries:
            for w in item["words"]:
                words.add(w.lower())
        print(f"\n=== 例词 ({len(words)} 个) ===")
        for word in sorted(words):
            dest = WORD_DIR / f"{word}.mp3"
            if dest.exists() and not args.force:
                print(f"  skip {word}")
                continue
            await synth_word(word, dest)
            print(f"  {word}")

    meta = {
        "source": "dev_bundled",
        "mode": "bundled_assets",
        "network": False,
        "phonemes": "MIT s5s5/phonics isolated IPA + Edge SSML (en-GB) for UK gaps",
        "words": f"edge-tts {VOICE}",
        "note": "音标为孤立音素，非整词。开发占位。",
    }
    (ROOT / "src/main/assets/audio/audio_manifest.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print("\n完成。请重新编译 phonicsapp。")


if __name__ == "__main__":
    asyncio.run(main())
