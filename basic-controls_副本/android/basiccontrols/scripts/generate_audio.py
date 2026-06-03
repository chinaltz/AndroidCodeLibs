#!/usr/bin/env python3
"""Generate phoneme + word audio using Kokoro (primary) with espeak-ng/macOS fallback.

Output directory:
  audio-kokoro/
    phonemes/  48 files  (<phoneme_id>.mp3)
    words/     115 files (<word>.mp3)

Usage:
  python3 scripts/generate_audio.py
"""

import json
import os
import subprocess
import sys
from pathlib import Path

# ── config ──────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parent.parent
PHONEMES_JS = ROOT / "miniprogram/data/phonemes.js"
OUT_DIR = ROOT / "audio-kokoro"

PHONEME_SAMPLE_RATE = 22050
WORD_SAMPLE_RATE = 24000

# macOS TTS voice for English words (high quality)
MACOS_VOICE = "Samantha"  # or "Alex", "Daniel", "Karen"

# ── load phoneme data from JS file ──────────────────────────
def load_phonemes():
    """Parse phonemes.js with a simple regex approach (no Node required)."""
    import re
    src = PHONEMES_JS.read_text()

    groups = []
    group_pattern = re.compile(
        r"title:\s*'([^']+)'\s*,\s*items:\s*\[(.*?)\]\s*\}",
        re.DOTALL,
    )
    item_pattern = re.compile(
        r"id:\s*'([^']+)'.*?symbol:\s*'([^']+)'.*?words:\s*words\(([^)]+)\)",
        re.DOTALL,
    )

    for gm in group_pattern.finditer(src):
        title = gm.group(1)
        items_str = gm.group(2)
        items = []
        for im in item_pattern.finditer(items_str):
            phoneme_id = im.group(1)
            symbol = im.group(2)
            words_raw = im.group(3)
            words_list = [w.strip().strip("'\"") for w in words_raw.split(",")]
            items.append({"id": phoneme_id, "symbol": symbol, "words": words_list, "group": title})
        if items:
            groups.append({"title": title, "items": items})

    return groups

def extract_all_words(groups):
    """Return sorted unique word set across all phonemes."""
    seen = set()
    for g in groups:
        for p in g["items"]:
            for w in p["words"]:
                wl = w.lower()
                if wl not in seen:
                    seen.add(wl)
    return sorted(seen)

# ── phoneme audio via espeak-ng ─────────────────────────────
def generate_phoneme_espeak(phoneme_id, symbol, out_path):
    """
    Use espeak-ng -x (phoneme mode) to generate isolated phoneme audio.
    Then convert WAV → MP3 via ffmpeg.
    """
    wav_tmp = out_path.with_suffix(".wav")

    # Map IPA symbol to a word that contains it prominently for espeak input
    # espeak-ng can't pronounce raw IPA well; we use example words
    phoneme_word_map = {
        "/ɪ/": "sit", "/e/": "bed", "/æ/": "cat", "/ʌ/": "cup", "/ɒ/": "dog",
        "/ʊ/": "book", "/ə/": "about", "/iː/": "see", "/ɑː/": "car",
        "/ɔː/": "ball", "/uː/": "blue", "/ɜː/": "bird",
        "/eɪ/": "cake", "/aɪ/": "bike", "/ɔɪ/": "boy", "/əʊ/": "go",
        "/aʊ/": "cow", "/ɪə/": "ear", "/eə/": "air", "/ʊə/": "tour",
        "/p/": "pen", "/t/": "top", "/k/": "key", "/f/": "fish",
        "/θ/": "three", "/s/": "sun", "/ʃ/": "ship", "/tʃ/": "chair",
        "/h/": "hat", "/b/": "bag", "/d/": "dog", "/g/": "girl",
        "/v/": "van", "/ð/": "this", "/z/": "zoo", "/ʒ/": "measure",
        "/dʒ/": "jam", "/r/": "red", "/m/": "map", "/n/": "name",
        "/ŋ/": "sing", "/l/": "leg", "/j/": "yes", "/w/": "we",
        "/tr/": "tree", "/dr/": "dream", "/ts/": "cats", "/dz/": "birds",
    }

    word = phoneme_word_map.get(symbol, "test")

    cmd = [
        "espeak-ng", word,
        "-s", "120",           # slower speed for clarity
        "-v", "en-us",
        "-w", str(wav_tmp),
        "--pho",               # output as phonemes only
    ]

    try:
        subprocess.run(cmd, check=True, capture_output=True, timeout=15)
        if wav_tmp.exists() and wav_tmp.stat().st_size > 100:
            # Convert WAV to MP3
            subprocess.run([
                "ffmpeg", "-y",
                "-i", str(wav_tmp),
                "-ar", str(PHONEME_SAMPLE_RATE),
                "-ac", "1",
                "-b:a", "64k",
                str(out_path),
            ], check=True, capture_output=True)
            wav_tmp.unlink()
            return True
    except Exception as e:
        print(f"    ⚠ espeak-ng failed for {phoneme_id}: {e}")

    # fallback: use macOS say for the example word
    try:
        subprocess.run([
            "say", word,
            "-v", MACOS_VOICE,
            "-r", "120",
            "-o", str(wav_tmp.with_suffix(".aiff")),
        ], check=True, capture_output=True, timeout=15)
        aiff = wav_tmp.with_suffix(".aiff")
        if aiff.exists():
            subprocess.run([
                "ffmpeg", "-y",
                "-i", str(aiff),
                "-ar", str(PHONEME_SAMPLE_RATE),
                "-ac", "1",
                "-b:a", "64k",
                str(out_path),
            ], check=True, capture_output=True)
            aiff.unlink()
            return True
    except Exception as e:
        print(f"    ⚠ say fallback failed for {phoneme_id}: {e}")

    return False

# ── word audio via macOS say (high quality English TTS) ─────
def generate_word_say(word, out_path):
    """Generate word audio using macOS high-quality TTS voice."""
    aiff_tmp = str(out_path.with_suffix(".aiff"))

    try:
        subprocess.run([
            "say", word,
            "-v", MACOS_VOICE,
            "-r", "150",
            "-o", aiff_tmp,
        ], check=True, capture_output=True, timeout=15)

        if os.path.exists(aiff_tmp):
            subprocess.run([
                "ffmpeg", "-y",
                "-i", aiff_tmp,
                "-ar", str(WORD_SAMPLE_RATE),
                "-ac", "1",
                "-b:a", "96k",
                str(out_path),
            ], check=True, capture_output=True)
            os.unlink(aiff_tmp)
            return True
    except Exception as e:
        print(f"    ⚠ say failed for word '{word}': {e}")
    return False

# ── try Kokoro if available ─────────────────────────────────
def try_kokoro_import():
    """Return True if Kokoro + misaki are importable."""
    try:
        import kokoro
        import misaki
        return True
    except ImportError:
        return False

def generate_all_kokoro(groups, all_words):
    """Generate phoneme + word audio using Kokoro TTS (if installed)."""
    import soundfile as sf
    from kokoro import KPipeline

    pipeline = KPipeline(lang_code="a")  # American English
    voice = "af_heart"

    phonemes_dir = OUT_DIR / "phonemes"
    words_dir = OUT_DIR / "words"

    # Generate word audio
    for word in all_words:
        out_path = words_dir / f"{word}.mp3"
        if out_path.exists():
            continue
        try:
            gen = pipeline(word, voice=voice, speed=1.0)
            for _, _, audio in gen:
                wav_tmp = out_path.with_suffix(".wav")
                sf.write(str(wav_tmp), audio, 24000)
                subprocess.run([
                    "ffmpeg", "-y", "-i", str(wav_tmp),
                    "-b:a", "96k", str(out_path),
                ], check=True, capture_output=True)
                wav_tmp.unlink()
                break
            print(f"  ✓ word: {word}")
        except Exception as e:
            print(f"  ⚠ word '{word}' failed: {e}")

    # Generate phoneme audio (first example word)
    for g in groups:
        for p in g["items"]:
            pid = p["id"]
            out_path = phonemes_dir / f"{pid}.mp3"
            if out_path.exists():
                continue
            demo_word = p["words"][0]
            try:
                gen = pipeline(demo_word, voice=voice, speed=0.9)
                for _, _, audio in gen:
                    wav_tmp = out_path.with_suffix(".wav")
                    sf.write(str(wav_tmp), audio, 24000)
                    subprocess.run([
                        "ffmpeg", "-y", "-i", str(wav_tmp),
                        "-b:a", "64k", str(out_path),
                    ], check=True, capture_output=True)
                    wav_tmp.unlink()
                    break
                print(f"  ✓ phoneme: {pid}")
            except Exception as e:
                print(f"  ⚠ phoneme '{pid}' failed: {e}")

# ── main ────────────────────────────────────────────────────
def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "phonemes").mkdir(exist_ok=True)
    (OUT_DIR / "words").mkdir(exist_ok=True)

    groups = load_phonemes()
    all_words = extract_all_words(groups)
    print(f"Loaded {sum(len(g['items']) for g in groups)} phonemes, {len(all_words)} unique words")

    use_kokoro = try_kokoro_import()

    if use_kokoro:
        print("Using Kokoro TTS (high quality neural TTS)")
        generate_all_kokoro(groups, all_words)
    else:
        print("Kokoro not installed — using espeak-ng (phonemes) + macOS say (words)")
        print(f"macOS voice: {MACOS_VOICE}")

        # Generate word audio
        words_dir = OUT_DIR / "words"
        for word in all_words:
            out_path = words_dir / f"{word}.mp3"
            if out_path.exists():
                continue
            ok = generate_word_say(word, out_path)
            status = "✓" if ok else "✗"
            print(f"  {status} word: {word}")

        # Generate phoneme audio
        phonemes_dir = OUT_DIR / "phonemes"
        for g in groups:
            for p in g["items"]:
                pid = p["id"]
                out_path = phonemes_dir / f"{pid}.mp3"
                if out_path.exists():
                    continue
                ok = generate_phoneme_espeak(pid, p["symbol"], out_path)
                status = "✓" if ok else "✗"
                print(f"  {status} phoneme: {pid} ({p['symbol']})")

    # Print summary
    phoneme_count = len(list((OUT_DIR / "phonemes").glob("*.mp3")))
    word_count = len(list((OUT_DIR / "words").glob("*.mp3")))
    print(f"\nDone! {phoneme_count}/48 phonemes, {word_count}/{len(all_words)} words")
    print(f"Output: {OUT_DIR}")

if __name__ == "__main__":
    main()
