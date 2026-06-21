#!/usr/bin/env python3
"""
Generate a complete Douyin-ready asset pack for a post.

Usage:
  npm run build:video -- content/posts/<slug>
  python3 scripts/gen-video.py content/posts/<slug>

Outputs:
  content/posts/<slug>/social/douyin/douyin-summary-video.mp4
  content/posts/<slug>/social/douyin/douyin-summary-video.with-audio.mp4
  content/posts/<slug>/social/douyin/douyin-cover.png
  content/posts/<slug>/social/douyin/douyin-subtitles.srt
  content/posts/<slug>/social/douyin/douyin-script.md
  content/posts/<slug>/social/UPLOAD.md
"""

from __future__ import annotations

import re
import shutil
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
W, H = 1080, 1920
FPS = 24
DEFAULT_DURATION = 33.0

BG = (18, 22, 30)
PANEL = (30, 38, 52)
WHITE = (255, 255, 255)
MUTED = (166, 176, 194)
BLUE = (66, 133, 244)
GREEN = (20, 184, 166)
AMBER = (245, 158, 11)
PINK = (236, 72, 153)

FONT_CANDIDATES = [
    "/System/Library/Fonts/Hiragino Sans GB.ttc",
    "/System/Library/Fonts/STHeiti Light.ttc",
    "/System/Library/Fonts/PingFang.ttc",
    "/Library/Fonts/Arial Unicode.ttf",
]


@dataclass
class Scene:
    start: float
    end: float
    visual: str
    voice: str
    subtitle: str


def get_font(size: int) -> ImageFont.FreeTypeFont:
    for path in FONT_CANDIDATES:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def text_size(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont) -> tuple[int, int]:
    box = draw.textbbox((0, 0), text, font=font)
    return box[2] - box[0], box[3] - box[1]


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont, max_width: int) -> list[str]:
    text = re.sub(r"\s+", " ", text.strip())
    if not text:
        return []

    lines: list[str] = []
    current = ""
    for char in text:
        test = current + char
        if text_size(draw, test, font)[0] <= max_width or not current:
            current = test
        else:
            lines.append(current)
            current = char
    if current:
        lines.append(current)
    return lines


def draw_center(
    draw: ImageDraw.ImageDraw,
    text: str,
    y: int,
    font: ImageFont.ImageFont,
    fill: tuple[int, int, int] = WHITE,
    max_width: int = 900,
    line_gap: int = 16,
) -> int:
    lines = wrap_text(draw, text, font, max_width)
    line_h = text_size(draw, "字", font)[1] + line_gap
    for line in lines:
        tw, _ = text_size(draw, line, font)
        draw.text(((W - tw) / 2, y), line, font=font, fill=fill)
        y += line_h
    return y


def draw_pill(draw: ImageDraw.ImageDraw, text: str, x: int, y: int, fill: tuple[int, int, int]) -> None:
    font = get_font(30)
    tw, th = text_size(draw, text, font)
    pad_x, pad_y = 26, 12
    draw.rounded_rectangle(
        [x, y, x + tw + pad_x * 2, y + th + pad_y * 2],
        radius=18,
        fill=fill,
    )
    draw.text((x + pad_x, y + pad_y - 2), text, font=font, fill=WHITE)


def time_to_seconds(value: str) -> tuple[float, float]:
    cleaned = value.strip().replace("－", "-").replace("~", "-").replace("—", "-")
    parts = [p.strip() for p in cleaned.split("-")]
    if len(parts) != 2:
        raise ValueError(f"Invalid time range: {value}")
    return float(parts[0]), float(parts[1])


def seconds_to_srt_time(value: float) -> str:
    millis = int(round(value * 1000))
    hours = millis // 3_600_000
    millis %= 3_600_000
    minutes = millis // 60_000
    millis %= 60_000
    seconds = millis // 1000
    millis %= 1000
    return f"{hours:02d}:{minutes:02d}:{seconds:02d},{millis:03d}"


def read_title(post_dir: Path) -> str:
    md = post_dir / "index.md"
    for line in md.read_text(encoding="utf-8").splitlines():
        if line.startswith("# "):
            return line[2:].strip()
    return post_dir.name.replace("-", " ")


def read_first_bold_summary(post_dir: Path) -> str:
    text = (post_dir / "index.md").read_text(encoding="utf-8")
    match = re.search(r"\*\*(一句话结论[:：].+?)\*\*", text)
    if match:
        return match.group(1)
    for line in text.splitlines():
        line = line.strip()
        if line and not line.startswith(("#", "!", "|", ">", "`", "-", "╔", "║", "╚")):
            return re.sub(r"[*_`]", "", line)
    return "普通人也能上手的 AI 实操内容。"


def default_scenes(post_dir: Path) -> list[Scene]:
    title = read_title(post_dir)
    summary = read_first_bold_summary(post_dir).replace("一句话结论：", "").replace("一句话结论:", "")
    short_title = title if len(title) <= 28 else title[:27] + "…"
    short_summary = summary if len(summary) <= 46 else summary[:45] + "…"
    return [
        Scene(0, 3.5, "开场标题卡", f"今天用大白话讲清楚：{short_title}", short_title),
        Scene(3.5, 7.5, "痛点卡", "如果你也觉得 AI 很火，但不知道和自己有什么关系，这条先收藏。", "AI 很火，但到底怎么用？"),
        Scene(7.5, 12.5, "结论卡", short_summary, short_summary),
        Scene(12.5, 18.5, "方法卡", "记住一个简单方法：先说背景，再说任务，最后说你要的标准。", "背景 + 任务 + 标准"),
        Scene(18.5, 25.5, "避坑卡", "不要只问一句帮我写点东西。要求越清楚，AI 越容易给出能用的结果。", "要求越清楚，结果越能用"),
        Scene(25.5, 33, "关注引导卡", "关注 AI技趣星球，继续看普通人也能照做的 AI 实操教程。", "关注 AI技趣星球"),
    ]


def parse_script(script_path: Path) -> list[Scene]:
    if not script_path.exists():
        return []

    scenes: list[Scene] = []
    in_table = False
    for raw in script_path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if line.startswith("| 秒数 ") and "口播" in line:
            in_table = True
            continue
        if not in_table:
            continue
        if not line.startswith("|"):
            if scenes:
                break
            continue
        if re.match(r"^\|\s*-+", line):
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        if len(cells) < 4:
            continue
        try:
            start, end = time_to_seconds(cells[0])
        except ValueError:
            continue
        scenes.append(Scene(start, end, cells[1], cells[2], cells[3]))
    return scenes


def make_script_markdown(post_dir: Path, scenes: list[Scene]) -> str:
    title = read_title(post_dir)
    duration = scenes[-1].end if scenes else DEFAULT_DURATION
    voice = "\n\n".join(scene.voice for scene in scenes)
    rows = "\n".join(
        f"| {scene.start:g}-{scene.end:g} | {scene.visual} | {scene.voice} | {scene.subtitle} |"
        for scene in scenes
    )
    return f"""# 抖音短视频脚本 · {title}

时长：约 {duration:g} 秒
比例：9:16
素材：`douyin-summary-video.with-audio.mp4` + `douyin-cover.png`

## 分镜脚本

| 秒数 | 画面 | 口播 | 字幕 |
|------|------|------|------|
{rows}

## 完整口播词

```text
{voice}
```

## 发布标题

```text
{title[:30]}
```

## 发布文案

```text
{read_first_bold_summary(post_dir)}

关注 AI技趣星球，一起用技术创造乐趣。一起看普通人也能照做的 AI 实操教程。

#AI #人工智能 #普通人学AI #AI工具 #科技干货
```
"""


def make_srt(scenes: list[Scene]) -> str:
    blocks = []
    for index, scene in enumerate(scenes, start=1):
        blocks.append(
            f"{index}\n"
            f"{seconds_to_srt_time(scene.start)} --> {seconds_to_srt_time(scene.end)}\n"
            f"{scene.subtitle}"
        )
    return "\n\n".join(blocks) + "\n"


def make_upload_markdown(post_dir: Path) -> str:
    title = read_title(post_dir)
    return f"""# 多平台上传清单 · {title}

## 抖音短视频

上传目录：`social/douyin/`

上传素材：

- `douyin-summary-video.with-audio.mp4`：9:16 竖屏短视频，带静音音轨，优先上传这个
- `douyin-summary-video.mp4`：无音轨备份版
- `douyin-cover.png`：9:16 封面图
- `douyin-script.md`：口播、字幕、发布文案
- `douyin-subtitles.srt`：外挂字幕，可导入剪映

剪映处理：

- [ ] 导入 `douyin-summary-video.with-audio.mp4`
- [ ] 复制 `douyin-script.md` 的完整口播词，使用文本朗读 / AI 配音生成口播
- [ ] 导入 `douyin-subtitles.srt`
- [ ] 添加低音量 BGM，口播音量高于 BGM
- [ ] 导出 1080p、9:16、MP4

发布检查：

- [ ] 口播能听清
- [ ] 字幕没有贴到底部按钮区
- [ ] 封面选择 `douyin-cover.png`
- [ ] 标题、文案、话题标签已复制
"""


def create_card(scene: Scene, title: str, index: int, total: int) -> Image.Image:
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    accent = [BLUE, GREEN, AMBER, PINK][index % 4]
    draw.rectangle([0, 0, W, 18], fill=accent)
    draw_pill(draw, "AI技趣星球", 72, 84, accent)
    draw_pill(draw, f"{index + 1}/{total}", W - 210, 84, PANEL)

    draw_center(draw, scene.visual, 250, get_font(44), MUTED, 860)

    main = scene.subtitle if scene.subtitle else scene.voice
    y = draw_center(draw, main, 610, get_font(72), WHITE, 880, 22)

    if scene.voice and scene.voice != main:
        draw_center(draw, scene.voice, max(y + 70, 1020), get_font(38), MUTED, 840, 18)

    draw.rounded_rectangle([86, H - 340, W - 86, H - 190], radius=30, fill=PANEL)
    draw_center(draw, "普通人也能照做的 AI 实操教程", H - 296, get_font(36), WHITE, 820)
    draw_center(draw, "关注 AI技趣星球 一起用技术创造乐趣", H - 244, get_font(30), MUTED, 820)
    return img


def create_cover(post_dir: Path, cover_path: Path, scenes: list[Scene]) -> None:
    title = read_title(post_dir)
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, 0, W, 24], fill=BLUE)
    draw.rectangle([0, H - 24, W, H], fill=GREEN)
    draw_pill(draw, "AI 入门", 76, 100, BLUE)
    draw_center(draw, title, 460, get_font(78), WHITE, 880, 22)
    if scenes:
        draw_center(draw, scenes[0].subtitle, 900, get_font(44), MUTED, 820, 18)
    draw.rounded_rectangle([96, 1260, W - 96, 1470], radius=34, fill=PANEL)
    draw_center(draw, "大白话讲清楚", 1310, get_font(48), WHITE, 800)
    draw_center(draw, "普通人学 AI", 1380, get_font(38), GREEN, 800)
    draw_center(draw, "AI技趣星球", H - 190, get_font(38), MUTED, 860)
    img.save(cover_path)


def generate_video(video_path: Path, scenes: list[Scene]) -> None:
    duration = scenes[-1].end if scenes else DEFAULT_DURATION
    total_frames = int(round(duration * FPS))
    title = "AI技趣星球"

    cmd = [
        "ffmpeg",
        "-y",
        "-f",
        "rawvideo",
        "-vcodec",
        "rawvideo",
        "-s",
        f"{W}x{H}",
        "-pix_fmt",
        "rgb24",
        "-r",
        str(FPS),
        "-i",
        "-",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-preset",
        "medium",
        "-crf",
        "23",
        "-movflags",
        "+faststart",
        str(video_path),
    ]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)
    assert proc.stdin is not None

    for frame in range(total_frames):
        t = frame / FPS
        scene_index = next(
            (i for i, scene in enumerate(scenes) if scene.start <= t < scene.end),
            len(scenes) - 1,
        )
        img = create_card(scenes[scene_index], title, scene_index, len(scenes))
        proc.stdin.write(img.tobytes())

    proc.stdin.close()
    proc.wait()
    if proc.returncode != 0:
        raise RuntimeError("ffmpeg video encoding failed")


def add_silent_audio(video_path: Path, output_path: Path, duration: float) -> None:
    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        str(video_path),
        "-f",
        "lavfi",
        "-t",
        f"{duration:g}",
        "-i",
        "anullsrc=channel_layout=stereo:sample_rate=44100",
        "-shortest",
        "-c:v",
        "copy",
        "-c:a",
        "aac",
        "-b:a",
        "64k",
        str(output_path),
    ]
    result = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if result.returncode != 0:
        raise RuntimeError("ffmpeg audio muxing failed")


def ensure_tools() -> None:
    if shutil.which("ffmpeg") is None:
        raise RuntimeError("需要先安装 ffmpeg，才能生成 mp4")


def main() -> None:
    if len(sys.argv) < 2:
        print("用法: python3 scripts/gen-video.py <文章目录>")
        sys.exit(1)

    ensure_tools()

    arg = Path(sys.argv[1])
    post_dir = arg if arg.is_absolute() else (ROOT / arg)
    post_dir = post_dir.resolve()
    if not (post_dir / "index.md").exists():
        print(f"找不到文章 index.md: {post_dir}")
        sys.exit(1)

    social_dir = post_dir / "social"
    douyin_dir = social_dir / "douyin"
    douyin_dir.mkdir(parents=True, exist_ok=True)

    script_path = douyin_dir / "douyin-script.md"
    scenes = parse_script(script_path) or default_scenes(post_dir)

    if not script_path.exists():
        script_path.write_text(make_script_markdown(post_dir, scenes), encoding="utf-8")
    (douyin_dir / "douyin-subtitles.srt").write_text(make_srt(scenes), encoding="utf-8")
    upload_path = social_dir / "UPLOAD.md"
    if not upload_path.exists():
        upload_path.write_text(make_upload_markdown(post_dir), encoding="utf-8")

    cover_path = douyin_dir / "douyin-cover.png"
    video_path = douyin_dir / "douyin-summary-video.mp4"
    audio_video_path = douyin_dir / "douyin-summary-video.with-audio.mp4"

    print("生成封面...")
    create_cover(post_dir, cover_path, scenes)
    print("生成竖版视频...")
    generate_video(video_path, scenes)
    print("添加静音音轨...")
    add_silent_audio(video_path, audio_video_path, scenes[-1].end)

    for path in [cover_path, video_path, audio_video_path, script_path, douyin_dir / "douyin-subtitles.srt", upload_path]:
        size = path.stat().st_size / 1024 / 1024
        print(f"OK {path.relative_to(ROOT)} ({size:.2f} MB)")


if __name__ == "__main__":
    main()
