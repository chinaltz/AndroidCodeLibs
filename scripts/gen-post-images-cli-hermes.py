#!/usr/bin/env python3
"""Generate draft header + scene images for post 19 (CLI / OpenClaw / Hermes)."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "content/posts/17-dingtalk-feishu-cli-openclaw-hermes/images"

FONT_REG = "/System/Library/Fonts/STHeiti Light.ttc"
FONT_BOLD = "/System/Library/Fonts/STHeiti Medium.ttc"
W, H = 1200, 675


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REG, size)


def gradient_bg(draw: ImageDraw.ImageDraw, img: Image.Image) -> None:
    for y in range(H):
        t = y / H
        r = int(15 + (37 - 15) * t)
        g = int(23 + (99 - 23) * t)
        b = int(42 + (235 - 42) * t)
        draw.line([(0, y), (W, y)], fill=(r, g, b))


def rounded_rect(draw, xy, radius, fill, outline=None):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=2)


def gen_header() -> None:
    img = Image.new("RGB", (W, H))
    draw = ImageDraw.Draw(img)
    gradient_bg(draw, img)

    draw.ellipse((900, -30, 1180, 250), fill=(139, 92, 246))
    draw.ellipse((-50, 400, 220, 670), fill=(59, 130, 246))

    # terminal
    tx0, ty0, tx1, ty1 = 70, 130, 580, 560
    rounded_rect(draw, (tx0, ty0, tx1, ty1), 18, (248, 250, 252), (203, 213, 225))
    for i, c in enumerate([(239, 68, 68), (250, 204, 21), (34, 197, 94)]):
        draw.ellipse((tx0 + 20 + i * 28, ty0 + 18, tx0 + 34 + i * 28, ty0 + 32), fill=c)
    draw.text((tx0 + 110, ty0 + 14), "terminal", font=font(20), fill=(100, 116, 139))

    lines = [
        ("$ dws calendar event list", (30, 64, 175)),
        ("$ lark-cli +doc create ...", (30, 64, 175)),
        ("→ JSON 输出，AI 能读懂", (22, 163, 74)),
    ]
    y = ty0 + 80
    for text, color in lines:
        draw.text((tx0 + 24, y), text, font=font(22, bold=text.startswith("$")), fill=color)
        y += 52

    # tool badges
    badges = [("dws", 700, 140), ("lark-cli", 820, 140), ("OpenClaw", 700, 220), ("Hermes", 880, 220)]
    for label, bx, by in badges:
        rounded_rect(draw, (bx, by, bx + 130, by + 44), 10, (255, 255, 255, 200), (191, 219, 254))
        draw.text((bx + 16, by + 10), label, font=font(20, bold=True), fill=(29, 78, 216))

    draw.text((640, 320), "钉钉 · 飞书 CLI 开源", font=font(44, bold=True), fill=(255, 255, 255))
    draw.text((640, 390), "AI 终于能替你查日程、发消息", font=font(28), fill=(191, 219, 254))
    draw.text((640, 520), "技趣星球", font=font(22), fill=(226, 232, 240))

    img.save(OUT / "header.png", quality=92)
    print("saved", OUT / "header.png")


def gen_cli_stack() -> None:
    img = Image.new("RGB", (W, H), (248, 250, 252))
    draw = ImageDraw.Draw(img)

    draw.text((60, 40), "三层怎么配合？", font=font(38, bold=True), fill=(30, 41, 59))

    layers = [
        ("IM 入口", "OpenClaw", "钉钉 / 飞书里 @ 机器人", (239, 246, 255), (29, 78, 216)),
        ("办公 CLI", "dws · lark-cli", "查日历 · 发消息 · 跑审批", (240, 253, 244), (22, 163, 74)),
        ("长期成长", "Hermes", "重复流程越跑越顺", (254, 243, 255), (124, 58, 237)),
    ]
    y = 120
    for title, name, desc, bg, accent in layers:
        rounded_rect(draw, (60, y, W - 60, y + 130), 16, bg, accent)
        draw.text((90, y + 22), title, font=font(22), fill=(100, 116, 139))
        draw.text((90, y + 52), name, font=font(34, bold=True), fill=accent)
        draw.text((90, y + 92), desc, font=font(22), fill=(55, 65, 81))
        y += 150

    draw.text((60, H - 50), "CLI 是手 · OpenClaw 是前台 · Hermes 是记忆", font=font(24, bold=True), fill=(59, 130, 246))

    img.save(OUT / "scene1-cli-stack.png", quality=92)
    print("saved", OUT / "scene1-cli-stack.png")


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    gen_header()
    gen_cli_stack()
