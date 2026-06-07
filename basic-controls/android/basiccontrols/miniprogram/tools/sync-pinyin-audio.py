#!/usr/bin/env python3
"""将本地「汉语拼音(mp3)」包同步到小程序 assets，仅使用本地资源。"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOOLS = Path(__file__).resolve().parent
DST = ROOT / "packages/pinyin/assets/audio"
MANIFEST = TOOLS / "pinyin-audio-sources.json"
LOCAL_DEFAULT = Path("/Users/litingzhe/Downloads/汉语拼音(mp3)")
MATERIALS = ROOT / "materials/pinyin-audio-pack"
BITRATE = os.environ.get("PINYIN_AUDIO_BITRATE", "64k")

INITIAL_IDS = [
    "b", "p", "m", "f", "d", "t", "n", "l", "g", "k", "h",
    "j", "q", "x", "zh", "ch", "sh", "r", "z", "c", "s", "y", "w",
]
FINAL_IDS = [
    "a", "o", "e", "i", "u", "v", "ai", "ei", "ui", "ao", "ou", "iu",
    "ie", "ve", "er", "an", "en", "in", "un", "vn", "ang", "eng", "ing", "ong",
]
WHOLE_IDS = [
    "zhi1", "chi1", "shi1", "ri4", "zi1", "ci1", "si1", "yi1", "wu1", "yu1",
    "ye1", "yue1", "yuan1", "yin1", "yun1", "ying1",
]
TEACHING_IDS = INITIAL_IDS + FINAL_IDS + WHOLE_IDS


def require_cmd(name: str) -> None:
    if subprocess.run(["which", name], capture_output=True).returncode != 0:
        raise SystemExit(f"缺少依赖: {name}")


def normalize_key(name: str) -> str:
    text = unicodedata.normalize("NFC", name.lower().replace(".mp3", ""))
    return text.replace("ü", "v")


def load_config() -> dict:
    with MANIFEST.open(encoding="utf-8") as f:
        return json.load(f)


def local_root(cfg: dict) -> Path:
    env = os.environ.get("PINYIN_AUDIO_SRC")
    if env:
        return Path(env)
    configured = cfg.get("localPack", {}).get("path")
    if configured:
        path = Path(configured)
        return path if path.is_absolute() else ROOT / path
    if LOCAL_DEFAULT.is_dir():
        return LOCAL_DEFAULT
    return MATERIALS


def mirror_to_materials(src: Path) -> None:
    if src.resolve() == MATERIALS.resolve():
        return
    if not MATERIALS.exists():
        MATERIALS.mkdir(parents=True, exist_ok=True)
    for sub in ("声母", "韵母", "所有有拼音"):
        src_sub = src / sub
        if not src_sub.is_dir():
            continue
        dst_sub = MATERIALS / sub
        dst_sub.mkdir(parents=True, exist_ok=True)
        for mp3 in src_sub.glob("*.mp3"):
            shutil.copy2(mp3, dst_sub / mp3.name)


class LocalPack:
    def __init__(self, root: Path) -> None:
        self.root = root
        self.initials = root / "声母"
        self.finals = root / "韵母"
        self.syllables = root / "所有有拼音"
        self._final_map = {
            normalize_key(p.name): p for p in self.finals.glob("*.mp3")
        } if self.finals.is_dir() else {}
        self.syllable_ids = {
            p.stem for p in self.syllables.glob("*.mp3")
        } if self.syllables.is_dir() else set()

    def teaching_source(self, audio_id: str) -> Path | None:
        if audio_id in INITIAL_IDS:
            path = self.initials / f"{audio_id}.mp3"
            return path if path.is_file() else None
        if audio_id in FINAL_IDS:
            path = self._final_map.get(normalize_key(audio_id))
            if path:
                return path
            if audio_id == "a":
                alt = self.syllables / "a1.mp3"
                return alt if alt.is_file() else None
            return None
        if audio_id in WHOLE_IDS:
            path = self.syllables / f"{audio_id}.mp3"
            return path if path.is_file() else None
        return None

    def syllable_source(self, audio_id: str) -> Path | None:
        path = self.syllables / f"{audio_id}.mp3"
        return path if path.is_file() else None


def probe_audio(path: Path) -> dict | None:
    result = subprocess.run(
        [
            "ffprobe", "-v", "error",
            "-select_streams", "a:0",
            "-show_entries", "stream=codec_name,sample_rate,channels",
            "-show_entries", "format=duration",
            "-of", "json",
            str(path),
        ],
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        return None
    try:
        data = json.loads(result.stdout)
        stream = (data.get("streams") or [{}])[0]
        return {
            "codec": stream.get("codec_name"),
            "sample_rate": int(stream.get("sample_rate") or 0),
            "channels": int(stream.get("channels") or 0),
        }
    except (ValueError, TypeError):
        return None


def can_copy_direct(src: Path) -> bool:
    meta = probe_audio(src)
    return bool(
        meta
        and meta.get("codec") == "mp3"
        and meta.get("sample_rate") == 22050
        and meta.get("channels") == 1
    )


def convert_one(src: Path, dst: Path) -> None:
    if can_copy_direct(src):
        shutil.copy2(src, dst)
        return
    subprocess.run(
        [
            "ffmpeg", "-y",
            "-i", str(src),
            "-vn",
            "-ac", "1", "-ar", "22050",
            "-codec:a", "libmp3lame", "-b:a", BITRATE,
            str(dst),
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def sync_teaching(local: LocalPack) -> None:
    target = DST / "teaching"
    target.mkdir(parents=True, exist_ok=True)
    missing: list[str] = []

    for old in target.glob("*.mp3"):
        if old.stem not in TEACHING_IDS:
            old.unlink()

    for audio_id in TEACHING_IDS:
        src = local.teaching_source(audio_id)
        dst = target / f"{audio_id}.mp3"
        if not src:
            missing.append(audio_id)
            continue
        convert_one(src, dst)

    print(f"teaching: {len(TEACHING_IDS) - len(missing)}/{len(TEACHING_IDS)}（local-pack）")
    if missing:
        raise SystemExit(f"teaching 缺少: {', '.join(missing)}")


def sync_syllables(local: LocalPack) -> None:
    target = DST / "syllables"
    target.mkdir(parents=True, exist_ok=True)

    for old in target.glob("*.mp3"):
        old.unlink()

    copied = 0
    for audio_id in sorted(local.syllable_ids):
        src = local.syllable_source(audio_id)
        if not src:
            continue
        convert_one(src, target / f"{audio_id}.mp3")
        copied += 1

    print(f"syllables: {copied} 个（local-pack 全量）")


def write_coverage(local: LocalPack) -> None:
    out = TOOLS / "pinyin-audio-coverage.json"
    payload = {
        "source": str(local.root),
        "teachingIds": TEACHING_IDS,
        "syllableIds": sorted(local.syllable_ids),
        "syllableCount": len(local.syllable_ids),
    }
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    require_cmd("ffmpeg")
    require_cmd("ffprobe")
    cfg = load_config()
    root = local_root(cfg)
    if not root.is_dir():
        raise SystemExit(f"未找到本地拼音包: {root}")
    mirror_to_materials(root)
    local = LocalPack(root)
    print(f"本地包: {root}")
    print(f"输出: {DST}")
    sync_teaching(local)
    sync_syllables(local)
    write_coverage(local)
    print("完成。教学音与音节均已替换为本地包资源。")


if __name__ == "__main__":
    main()
