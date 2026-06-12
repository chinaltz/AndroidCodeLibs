#!/usr/bin/env python3
"""DEPRECATED: draft-quality Pillow placeholders only.

Commercial images live in:
  content/posts/16-claude-fable-5-claude-code/images/
See images/IMAGES.md for 即梦 prompts to regenerate.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "content/posts/16-claude-fable-5-claude-code/images"

FONT_REG = "/System/Library/Fonts/STHeiti Light.ttc"
FONT_BOLD = "/System/Library/Fonts/STHeiti Medium.ttc"
W, H = 1200, 675


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REG, size)


def gradient_bg(draw: ImageDraw.ImageDraw, img: Image.Image) -> None:
    for y in range(H):
        t = y / H
        r = int(15 + (59 - 15) * t)
        g = int(23 + (130 - 23) * t)
        b = int(42 + (246 - 42) * t)
        draw.line([(0, y), (W, y)], fill=(r, g, b))


def rounded_rect(draw, xy, radius, fill, outline=None):
    x0, y0, x1, y1 = xy
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=2)


def gen_header() -> None:
    img = Image.new("RGB", (W, H))
    draw = ImageDraw.Draw(img)
    gradient_bg(draw, img)

    # decorative circles
    draw.ellipse((880, -40, 1180, 260), fill=(139, 92, 246, 40))
    draw.ellipse((-60, 420, 240, 720), fill=(59, 130, 246, 60))

    # terminal window
    tx0, ty0, tx1, ty1 = 80, 120, 620, 560
    rounded_rect(draw, (tx0, ty0, tx1, ty1), 18, (248, 250, 252), (203, 213, 225))
    for i, c in enumerate([(239, 68, 68), (250, 204, 21), (34, 197, 94)]):
        draw.ellipse((tx0 + 20 + i * 28, ty0 + 18, tx0 + 34 + i * 28, ty0 + 32), fill=c)
    draw.text((tx0 + 120, ty0 + 14), "claude-code", font=font(20), fill=(100, 116, 139))

    lines = [
        ("$ claude", (30, 248, 248)),
        ("/model fable", (30, 248, 248)),
        ("正在读取项目...", (148, 163, 184)),
        ("正在自主执行任务...", (148, 163, 184)),
        ("✓ 3 小时后：方案已生成", (34, 197, 94)),
    ]
    y = ty0 + 70
    for text, color in lines:
        draw.text((tx0 + 24, y), text, font=font(22, bold=text.startswith("$")), fill=color)
        y += 44

    # AI orb
    cx, cy, r = 900, 340, 90
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(139, 92, 246))
    draw.ellipse((cx - r + 18, cy - r + 18, cx + r - 18, cy + r - 18), fill=(167, 139, 250))
    draw.text((cx - 28, cy - 18), "AI", font=font(36, bold=True), fill=(255, 255, 255))

    # small bots
    for i, (bx, by) in enumerate([(780, 180), (1020, 200), (1040, 460), (760, 480)]):
        rounded_rect(draw, (bx, by, bx + 56, by + 40), 8, (59, 130, 246))
        draw.text((bx + 14, by + 8), f"B{i+1}", font=font(16, bold=True), fill=(255, 255, 255))

    # title area
    draw.text((660, 90), "Claude Fable 5", font=font(52, bold=True), fill=(255, 255, 255))
    draw.text((660, 160), "自主扛整块活", font=font(34, bold=True), fill=(191, 219, 254))
    draw.text((660, 520), "技趣星球", font=font(22), fill=(226, 232, 240))

    img.save(OUT / "header.png", quality=92)
    print("saved", OUT / "header.png")


def gen_before_after() -> None:
    img = Image.new("RGB", (W, H), (248, 250, 252))
    draw = ImageDraw.Draw(img)
    mid = W // 2

    # left panel - before
    draw.rectangle((0, 0, mid - 2, H), fill=(254, 242, 242))
    draw.text((60, 50), "以前", font=font(40, bold=True), fill=(185, 28, 28))
    rounded_rect(draw, (50, 120, mid - 50, 280), 12, (255, 255, 255), (252, 165, 165))
    draw.text((70, 145), "你：这段代码怎么改？", font=font(22), fill=(55, 65, 81))
    draw.text((70, 190), "AI：给你一段建议…", font=font(22), fill=(107, 114, 128))
    draw.text((70, 235), "你：复制、粘贴、调试…", font=font(22), fill=(185, 28, 28))

    # stick figure stress
    draw.ellipse((mid - 130, 360, mid - 70, 420), fill=(252, 165, 165))
    draw.line([(mid - 100, 420), (mid - 100, 520)], fill=(185, 28, 28), width=4)
    draw.line([(mid - 130, 460), (mid - 70, 460)], fill=(185, 28, 28), width=4)

    # right panel - after
    draw.rectangle((mid + 2, 0, W, H), fill=(239, 246, 255))
    draw.text((mid + 60, 50), "现在", font=font(40, bold=True), fill=(29, 78, 216))
    rounded_rect(draw, (mid + 50, 120, W - 50, 280), 12, (255, 255, 255), (147, 197, 253))
    draw.text((mid + 70, 145), "你：把这块工作做完", font=font(22), fill=(55, 65, 81))
    draw.text((mid + 70, 190), "AI：好的，我去干了", font=font(22), fill=(29, 78, 216))
    draw.text((mid + 70, 235), "你：喝咖啡，3 小时后收工", font=font(22), fill=(22, 163, 74))

    draw.ellipse((W - 130, 360, W - 70, 420), fill=(147, 197, 253))
    draw.line([(W - 100, 420), (W - 100, 520)], fill=(29, 78, 216), width=4)
    draw.line([(W - 130, 460), (W - 70, 460)], fill=(29, 78, 216), width=4)

    # center arrow
    draw.polygon([(mid - 20, H // 2), (mid + 20, H // 2 - 30), (mid + 20, H // 2 + 30)], fill=(59, 130, 246))
    draw.text((mid - 200, H - 60), "Fable 5：从问答到自主扛事", font=font(24, bold=True), fill=(30, 41, 59))

    img.save(OUT / "scene1-before-after.png", quality=92)
    print("saved", OUT / "scene1-before-after.png")


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    gen_header()
    gen_before_after()
