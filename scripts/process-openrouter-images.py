#!/usr/bin/env python3

from pathlib import Path
from shutil import copy2

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "content/posts/21-openrouter-rankings-guide/images"
SOURCE = IMAGES / "source"
GENERATED = Path(
    "/Users/litingzhe/.codex/generated_images/"
    "019ec5c5-8aa8-7e03-8e1b-f1e4e8091f17/"
    "ig_001373d19cdefe4c016a2ff32ce2448191bde32c15ac7209f8.png"
)
FONT = "/System/Library/Fonts/STHeiti Medium.ttc"


def fit_font(draw, text, max_width, start_size):
    size = start_size
    while size > 24:
        font = ImageFont.truetype(FONT, size)
        if draw.textbbox((0, 0), text, font=font)[2] <= max_width:
            return font
        size -= 2
    return ImageFont.truetype(FONT, size)


def rounded_panel(draw, box, radius, fill, outline, width):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def build_header():
    SOURCE.mkdir(exist_ok=True)
    source = SOURCE / "header-art-source.png"
    if not source.exists():
        copy2(GENERATED, source)

    with Image.open(source) as image:
        image = image.convert("RGB")
        image = image.resize((2560, 1440), Image.Resampling.LANCZOS)

    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    shadow = Image.new("RGBA", image.size, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle(
        (118, 270, 1188, 1090),
        radius=68,
        fill=(20, 121, 214, 45),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(22))
    overlay.alpha_composite(shadow)

    draw = ImageDraw.Draw(overlay)
    rounded_panel(
        draw,
        (100, 245, 1170, 1065),
        68,
        (255, 255, 255, 232),
        (200, 234, 255, 255),
        7,
    )
    rounded_panel(
        draw,
        (175, 330, 590, 410),
        40,
        (255, 247, 215, 255),
        (255, 209, 102, 255),
        3,
    )

    pill_font = fit_font(draw, "2026 年 6 月实测", 350, 40)
    draw.text(
        (382, 370),
        "2026 年 6 月实测",
        anchor="mm",
        font=pill_font,
        fill=(54, 93, 130),
    )

    openrouter_font = fit_font(draw, "OpenRouter", 850, 104)
    ranking_font = fit_font(draw, "排行榜", 850, 124)
    subtitle_font = fit_font(draw, "热门模型与 AI 工具怎么选", 850, 58)
    footer_font = fit_font(draw, "模型榜 · 工具调用榜 · 免费模型", 850, 39)

    draw.text((175, 500), "OpenRouter", font=openrouter_font, fill=(23, 58, 98))
    draw.text((175, 630), "排行榜", font=ranking_font, fill=(20, 121, 214))
    draw.text(
        (175, 795),
        "热门模型与 AI 工具怎么选",
        font=subtitle_font,
        fill=(54, 93, 130),
    )
    draw.line((175, 895, 1010, 895), fill=(67, 207, 199), width=12)
    draw.text(
        (175, 950),
        "模型榜 · 工具调用榜 · 免费模型",
        font=footer_font,
        fill=(54, 93, 130),
    )

    image = Image.alpha_composite(image.convert("RGBA"), overlay).convert("RGB")
    image.save(IMAGES / "header.png", quality=96)


def optimize_screenshot(name, crop):
    path = IMAGES / name
    SOURCE.mkdir(exist_ok=True)
    original = SOURCE / name.replace(".png", "-original.png")
    if not original.exists():
        copy2(path, original)

    with Image.open(original) as image:
        image = image.convert("RGB").crop(crop)
        scale = 1800 / image.width
        image = image.resize(
            (1800, round(image.height * scale)),
            Image.Resampling.LANCZOS,
        )
        image = image.filter(ImageFilter.UnsharpMask(radius=1.2, percent=125, threshold=3))

    margin = 30
    canvas = Image.new(
        "RGB",
        (image.width + margin * 2, image.height + margin * 2),
        "#F6FBFF",
    )
    canvas.paste(image, (margin, margin))

    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle(
        (4, 4, canvas.width - 5, canvas.height - 5),
        radius=24,
        outline="#C8EAFF",
        width=4,
    )
    canvas.save(path, quality=96)


def main():
    build_header()
    optimize_screenshot("model-leaderboard.png", (105, 115, 1170, 650))
    optimize_screenshot("tool-calls.png", (105, 65, 1170, 655))
    optimize_screenshot("top-apps.png", (105, 65, 1170, 620))
    optimize_screenshot("free-models.png", (135, 65, 1185, 715))


if __name__ == "__main__":
    main()
