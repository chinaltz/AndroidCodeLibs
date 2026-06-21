#!/usr/bin/env python3
"""Generate WeChat Search / Kandian card packs for blog posts.

Usage:
  python3 scripts/gen-wechat-search-cards.py content/posts/04-xxx
  python3 scripts/gen-wechat-search-cards.py --all
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
POSTS = ROOT / "content" / "posts"

_FONT_CANDIDATES = [
    (
        "/System/Library/Fonts/STHeiti Light.ttc",
        "/System/Library/Fonts/STHeiti Medium.ttc",
        "/System/Library/Fonts/Menlo.ttc",
    ),
    (
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
    ),
]


def _pick_fonts() -> tuple[str, str, str]:
    for reg, bold, mono in _FONT_CANDIDATES:
        if Path(reg).exists() and Path(bold).exists() and Path(mono).exists():
            return reg, bold, mono
    raise FileNotFoundError("No suitable CJK font bundle found for card generation")


FONT_REG, FONT_BOLD, FONT_MONO = _pick_fonts()
W, H = 1080, 1440


def f(size: int, bold: bool = False, mono: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_MONO if mono else (FONT_BOLD if bold else FONT_REG), size)


def display_len(s: str) -> float:
    return sum(1 if ord(ch) > 127 else 0.55 for ch in s)


def wrap(s: str, max_chars: float) -> list[str]:
    tokens = re.findall(r"[A-Za-z0-9_./+-]+|[\u4e00-\u9fff]|[^\s]", s.strip())
    lines: list[str] = []
    line = ""
    for token in tokens:
        candidate = line + token
        if line and display_len(candidate) > max_chars:
            lines.append(line)
            line = token
        else:
            line = candidate
    if line:
        lines.append(line)
    bad_line_start = "，。！？：；、）】》”’"
    normalized: list[str] = []
    for current in lines:
        while current and current[0] in bad_line_start and normalized:
            normalized[-1] += current[0]
            current = current[1:]
        if current:
            normalized.append(current)
    return normalized


def line_width(draw: ImageDraw.ImageDraw, line: str, font: ImageFont.FreeTypeFont) -> float:
    return draw.textlength(line, font=font)


def wrap_by_width(
    draw: ImageDraw.ImageDraw,
    s: str,
    font: ImageFont.FreeTypeFont,
    max_width: int,
) -> list[str]:
    s = strip_emoji(clean_inline(s))
    if not s:
        return []
    tokens = re.findall(r"[A-Za-z0-9_./+-]+|[\u4e00-\u9fff]|[^\s]", s)
    lines: list[str] = []
    line = ""
    for token in tokens:
        candidate = line + token
        if line and line_width(draw, candidate, font) > max_width:
            lines.append(line)
            line = token
        else:
            line = candidate
    if line:
        lines.append(line)
    bad_line_start = "，。！？：；、）】》”’"
    normalized: list[str] = []
    for current in lines:
        while current and current[0] in bad_line_start and normalized:
            normalized[-1] += current[0]
            current = current[1:]
        if current:
            normalized.append(current)
    return normalized


def block_height(size: int, line_count: int, line_height: float = 1.28) -> int:
    return int(size * line_height * line_count)


def fit_font_size(
    draw: ImageDraw.ImageDraw,
    s: str,
    *,
    bold: bool = False,
    max_width: int,
    max_lines: int,
    start_size: int,
    min_size: int = 24,
    max_height: int | None = None,
    line_height: float = 1.28,
) -> tuple[int, list[str]]:
    for size in range(start_size, min_size - 1, -2):
        font = f(size, bold)
        lines = wrap_by_width(draw, s, font, max_width)
        if len(lines) > max_lines:
            continue
        if max_height is not None and block_height(size, len(lines), line_height) > max_height:
            continue
        return size, lines
    font = f(min_size, bold)
    lines = wrap_by_width(draw, s, font, max_width)[:max_lines]
    while max_height is not None and lines and block_height(min_size, len(lines), line_height) > max_height:
        lines = lines[:-1]
    return min_size, lines


def truncate_chars(s: str, max_chars: int) -> str:
    s = clean_inline(s)
    if display_len(s) <= max_chars:
        return s
    out = ""
    for ch in s:
        if display_len(out + ch) > max_chars - 1:
            break
        out += ch
    return out.rstrip("，。！？：；、 ") + "…"


def clean_inline(s: str) -> str:
    s = re.sub(r"!\[[^\]]*\]\([^)]+\)", "", s)
    s = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", s)
    s = re.sub(r"https?://\S+", "", s)
    s = re.sub(r"[*_`>#|]", "", s)
    s = re.sub(r"&nbsp;", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    for old, new in {
        "微信公众号": "内容平台",
        "公众号": "内容平台",
        "关注": "查看",
        "回复MF": "",
        "回复": "查看",
        "微信搜一搜": "信息流",
        "搜一搜": "信息流",
        "看一看": "信息流",
        "私信": "留言",
        "加群": "交流",
        "福利": "资料",
    }.items():
        s = s.replace(old, new)
    return s


def is_boilerplate(s: str) -> bool:
    return any(token in s for token in ("关注", "回复MF", "本文写作时间", "阅读更多", "评论区"))


def strip_emoji(s: str) -> str:
    def is_emoji(ch: str) -> bool:
        cp = ord(ch)
        return (
            0x1F000 <= cp <= 0x1FAFF
            or 0x2600 <= cp <= 0x27BF
            or 0xFE00 <= cp <= 0xFE0F
            or 0x200D == cp
        )

    return "".join(ch for ch in s if not is_emoji(ch))


def text_block(
    draw: ImageDraw.ImageDraw,
    s: str,
    x: int,
    y: int,
    size: int,
    fill: tuple[int, int, int] | str,
    max_chars: float,
    *,
    bold: bool = False,
    line_height: float = 1.28,
    max_lines: int | None = None,
    max_width: int | None = None,
    max_height: int | None = None,
    auto_fit: bool = False,
) -> int:
    text = strip_emoji(clean_inline(s))
    if not text:
        return y
    if max_width is not None:
        if auto_fit and max_lines is not None:
            size, lines = fit_font_size(
                draw,
                text,
                bold=bold,
                max_width=max_width,
                max_lines=max_lines,
                start_size=size,
                max_height=max_height,
                line_height=line_height,
            )
        else:
            font = f(size, bold)
            lines = wrap_by_width(draw, text, font, max_width)
            if max_lines is not None:
                lines = lines[:max_lines]
            if max_height is not None:
                while lines and block_height(size, len(lines), line_height) > max_height:
                    lines = lines[:-1]
    else:
        lines = wrap(text, max_chars)
        if max_lines is not None:
            lines = lines[:max_lines]
    font = f(size, bold)
    for line in lines:
        draw.text((x, y), line, font=font, fill=fill)
        y += int(size * line_height)
    return y


def rounded(draw: ImageDraw.ImageDraw, box, radius, fill, outline=None, width=1) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def shadow_card(img: Image.Image, box, radius=34, fill=(255, 255, 255, 238), outline=(200, 234, 255, 255)) -> None:
    shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((box[0], box[1] + 14, box[2], box[3] + 14), radius=radius, fill=(24, 95, 160, 24))
    shadow = shadow.filter(ImageFilter.GaussianBlur(20))
    img.alpha_composite(shadow)
    ImageDraw.Draw(img).rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=2)


def draw_orbit(draw: ImageDraw.ImageDraw, box, start: int, end: int, fill, width=3) -> None:
    draw.arc(box, start=start, end=end, fill=fill, width=width)


def draw_planet(draw: ImageDraw.ImageDraw, cx: int, cy: int, r: int, fill, ring=(20, 121, 214, 48)) -> None:
    draw_orbit(draw, (cx - r - 78, cy - r // 2, cx + r + 78, cy + r // 2), 8, 172, ring, 5)
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=fill)
    draw.ellipse((cx - r + 28, cy - r + 34, cx + r - 64, cy + r - 30), fill=(255, 255, 255, 42))
    draw_orbit(draw, (cx - r - 78, cy - r // 2, cx + r + 78, cy + r // 2), 188, 352, ring, 5)


def star_field(draw: ImageDraw.ImageDraw) -> None:
    stars = [
        (93, 170, 3), (166, 248, 2), (330, 116, 2), (558, 210, 3), (698, 122, 2),
        (900, 728, 2), (985, 314, 3), (856, 1048, 2), (188, 1218, 2), (496, 1256, 3),
    ]
    for x, y, r in stars:
        draw.ellipse((x - r, y - r, x + r, y + r), fill=(20, 121, 214, 72))
        draw.line((x - r * 3, y, x + r * 3, y), fill=(20, 121, 214, 42), width=1)
        draw.line((x, y - r * 3, x, y + r * 3), fill=(20, 121, 214, 42), width=1)


def base() -> tuple[Image.Image, ImageDraw.ImageDraw]:
    img = Image.new("RGBA", (W, H), (246, 252, 255, 255))
    draw = ImageDraw.Draw(img)
    for y in range(H):
        t = y / H
        draw.line((0, y, W, y), fill=(int(250 * (1 - t) + 232 * t), int(253 * (1 - t) + 247 * t), int(255 * (1 - t) + 252 * t), 255))
    star_field(draw)
    draw_orbit(draw, (-240, -90, 560, 540), 208, 352, (20, 121, 214, 38), 5)
    draw_orbit(draw, (600, 10, 1320, 670), 165, 330, (67, 207, 199, 42), 5)
    draw_orbit(draw, (540, 1040, 1250, 1610), 188, 350, (255, 209, 102, 58), 6)
    draw_planet(draw, 95, 58, 170, (49, 168, 255, 58), (20, 121, 214, 28))
    draw_planet(draw, 1018, 308, 250, (67, 207, 199, 54), (67, 207, 199, 28))
    draw_planet(draw, 964, 1320, 255, (255, 209, 102, 76), (255, 184, 76, 36))
    for x in range(744, 1040, 24):
        for y in range(170, 460, 24):
            draw.ellipse((x, y, x + 3, y + 3), fill=(20, 121, 214, 32))
    return img, draw


def label(draw: ImageDraw.ImageDraw, text: str, x=72, y=70) -> None:
    font = f(28, True)
    width = int(draw.textlength(text, font=font)) + 64
    rounded(draw, (x, y, x + width, y + 62), 31, (255, 255, 255, 238), (187, 226, 255), 2)
    draw.ellipse((x + 24, y + 23, x + 40, y + 39), fill=(20, 121, 214))
    draw.text((x + 54, y + 14), text, font=font, fill=(20, 121, 214))


def footer(draw: ImageDraw.ImageDraw, no: int, cta: str) -> None:
    text_block(
        draw,
        cta,
        72,
        1304,
        28,
        (28, 61, 100),
        27,
        bold=True,
        max_lines=2,
        max_width=780,
        auto_fit=True,
    )
    draw.ellipse((930, 1272, 1002, 1344), fill=(18, 58, 100))
    draw.text((966, 1317), f"{no:02d}", font=f(27, True), fill="white", anchor="mm")


def chip(draw: ImageDraw.ImageDraw, text: str, x: int, y: int, fill=(18, 58, 100), fg=(238, 249, 255)) -> int:
    font = f(24, True)
    width = int(draw.textlength(text, font=font)) + 42
    rounded(draw, (x, y, x + width, y + 48), 24, fill, None, 1)
    draw.text((x + 21, y + 10), text, font=font, fill=fg)
    return x + width + 14


def info_row(draw: ImageDraw.ImageDraw, no: int, title: str, body: str, y: int) -> int:
    rounded(draw, (112, y, 174, y + 62), 20, (49, 168, 255))
    draw.text((143, y + 31), f"{no:02d}", font=f(23, True), fill="white", anchor="mm")
    text_block(
        draw,
        title,
        204,
        y - 2,
        31,
        (20, 121, 214),
        20,
        bold=True,
        max_lines=1,
        max_width=760,
        auto_fit=True,
    )
    text_block(
        draw,
        body,
        204,
        y + 40,
        26,
        (28, 61, 100),
        27,
        bold=True,
        max_lines=2,
        max_width=760,
        auto_fit=True,
    )
    return y + 120


def codebox(draw: ImageDraw.ImageDraw, box, code: str) -> None:
    code = strip_emoji(clean_inline(code))
    if not code:
        return
    rounded(draw, box, 22, (15, 35, 58), (42, 96, 144), 2)
    draw.text((box[0] + 28, box[1] + 25), code[:38], font=f(32, True, True), fill=(218, 244, 255))


CARD_LIMITS: dict[str, int] = {
    "title": 28,
    "subtitle": 32,
    "conclusion": 56,
    "article_summary.prepare": 40,
    "article_summary.how": 40,
    "article_summary.result": 40,
    "cover.highlight": 48,
    "prepare.heading": 18,
    "prepare.main": 56,
    "prepare.scene": 22,
    "prepare.goal": 22,
    "how.heading": 16,
    "how.item_title": 12,
    "how.item_body": 32,
    "how_tips.heading": 16,
    "how_tips.item": 36,
    "how_tips.highlight": 40,
    "result.heading": 16,
    "result.main": 52,
    "result.item_body": 30,
    "footer": 22,
    "chip": 10,
    # legacy aliases
    "problem.heading": 18,
    "problem.main": 56,
    "steps.heading": 16,
    "steps.item_body": 32,
    "warning.item": 36,
    "summary.row_body": 30,
}

SECTION_ALIASES: dict[str, list[str]] = {
    "prepare": ["prepare", "problem"],
    "how": ["how", "steps"],
    "how_tips": ["how_tips", "warning"],
    "result": ["result", "summary"],
}


def card_block(meta: dict, section: str) -> dict[str, Any]:
    cards = meta.get("cards") or {}
    for key in SECTION_ALIASES.get(section, [section]):
        block = cards.get(key)
        if isinstance(block, dict) and block:
            return block
    return {}


def card_pick(meta: dict, section: str, key: str, default: Any = "") -> Any:
    block = card_block(meta, section)
    summary = meta.get("cards", {}).get("article_summary") or {}
    summary_fallback = {
        "prepare.main": summary.get("prepare"),
        "prepare.goal": summary.get("prepare"),
        "how.heading": summary.get("how"),
        "how.highlight": summary.get("how"),
        "result.main": summary.get("result"),
        "result.highlight": summary.get("result"),
        "cover.highlight": summary.get("result"),
    }
    lookup = f"{section}.{key}"
    value = block.get(key) if key in block and block[key] else summary_fallback.get(lookup, meta.get(key, default))
    limit_key = lookup if lookup in CARD_LIMITS else key
    if isinstance(value, str) and limit_key in CARD_LIMITS:
        return truncate_chars(value, CARD_LIMITS[limit_key])
    return value


def ai_body(md: str) -> str:
    """Skip author preface; card copy should come from the AI/main article body."""
    if "下面是AI 写的" in md:
        return md.split("下面是AI 写的", 1)[1]
    if re.search(r"^自己写的：", md, re.M):
        parts = re.split(r"^---\s*$", md, maxsplit=1, flags=re.M)
        if len(parts) == 2:
            return parts[1]
    return md


def first_paragraph_after_heading(md: str, heading_prefix: str = "") -> str:
    body = ai_body(md)
    sections = re.split(r"^##\s+", body, flags=re.M)
    for section in sections[1:]:
        heading, _, rest = section.partition("\n")
        heading = clean_inline(heading)
        if heading_prefix and not heading.startswith(heading_prefix):
            continue
        for block in re.split(r"\n\s*\n", rest):
            text = clean_inline(block)
            if text and not text.startswith("-") and not text.startswith(">") and len(text) > 12:
                return text
    return ""


def get_meta(post: Path) -> dict:
    md = (post / "index.md").read_text(encoding="utf-8")
    body = ai_body(md)
    title_match = re.search(r"^#\s+(.+)$", body, re.M)
    title = clean_inline(title_match.group(1) if title_match else post.name)
    subtitle = ""
    for line in body.splitlines():
        if line.startswith(">") and "关注" not in line and line.strip() != ">":
            subtitle = clean_inline(line.lstrip("> "))
            break
    conclusion = ""
    m = re.search(r"\*\*一句话结论[:：](.+?)\*\*", body, re.S)
    if m:
        conclusion = clean_inline(m.group(1))
    if not conclusion:
        m = re.search(r"一句话结论[:：](.+)", body)
        if m:
            conclusion = clean_inline(m.group(1).split("\n")[0])
    if not conclusion:
        conclusion = first_paragraph_after_heading(md) or first_paragraph_after_heading(md, "最后")
    if not conclusion:
        paras = [
            clean_inline(x)
            for x in re.split(r"\n\s*\n", body)
            if clean_inline(x) and not x.startswith("#") and not is_boilerplate(clean_inline(x))
        ]
        conclusion = next((p for p in paras if 18 < len(p) < 120), paras[0] if paras else title)
    conclusion = truncate_chars(conclusion, CARD_LIMITS["conclusion"])
    headings = [re.sub(r"^\d+[.、]\s*", "", clean_inline(h)) for h in re.findall(r"^##\s+(.+)$", body, re.M)]
    headings = [h for h in headings if not h.startswith("今天") and not h.startswith("最后")][:6]
    quotes = [clean_inline(q) for q in re.findall(r"^>\s+(.+)$", body, re.M)]
    quotes = [q for q in quotes if q and "关注" not in q and len(q) > 8][:4]
    paras = [
        clean_inline(x)
        for x in re.split(r"\n\s*\n", body)
        if clean_inline(x) and not x.startswith("#") and not is_boilerplate(clean_inline(x))
    ]
    paras = [truncate_chars(p, 80) for p in paras[:6]]
    bullets = [clean_inline(x) for x in re.findall(r"^\s*[-*]\s+(.+)$", body, re.M)]
    bullets = [b for b in bullets if b and not is_boilerplate(b)][:6]
    code = ""
    cm = re.search(r"```(?:bash|text|powershell|json)?\n(.+?)```", body, re.S)
    if cm:
        code = clean_inline(cm.group(1).splitlines()[0])
    pain = ""
    if bullets:
        pain = truncate_chars(bullets[0], CARD_LIMITS["prepare.main"])
    elif headings:
        pain = truncate_chars(headings[0], CARD_LIMITS["prepare.main"])
    else:
        pain = conclusion
    return {
        "slug": post.name,
        "title": title,
        "subtitle": subtitle or "技趣星球图文版",
        "conclusion": conclusion,
        "pain": pain,
        "headings": headings,
        "quotes": quotes,
        "paras": paras,
        "bullets": bullets,
        "code": code,
    }


CONTENT_W = 896  # 1008 - 112 padding



def load_cards_config(post: Path) -> dict[str, Any]:
    path = post / "social" / "wechat-search" / "cards.json"
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def merge_meta(post: Path) -> dict:
    meta = get_meta(post)
    cards = load_cards_config(post)
    meta["cards"] = cards
    for key in ("title", "subtitle", "conclusion", "keywords"):
        if cards.get(key):
            meta[key] = cards[key]
    return meta


def save_card(img: Image.Image, out: Path, idx: int) -> None:
    img.convert("RGB").save(out / f"wechat-card-{idx:02d}.png", quality=96)


def draw_cover(meta: dict) -> Image.Image:
    img, draw = base()
    label(draw, card_pick(meta, "cover", "label", "实用AI卡片"))
    text_block(
        draw,
        card_pick(meta, "cover", "subtitle", meta["subtitle"]),
        72,
        210,
        32,
        (43, 96, 145),
        26,
        bold=True,
        max_lines=2,
        max_width=CONTENT_W,
        auto_fit=True,
    )
    text_block(
        draw,
        card_pick(meta, "cover", "title", meta["title"]),
        72,
        310,
        64,
        (14, 42, 78),
        11.5,
        bold=True,
        line_height=1.1,
        max_lines=3,
        max_width=CONTENT_W,
        auto_fit=True,
    )
    chips = card_pick(meta, "cover", "chips", ["准备做什么", "如何做", "最终结果"])
    colors = [(20, 121, 214), (67, 207, 199), (255, 185, 82)]
    fgs = [(238, 249, 255), (238, 249, 255), (60, 49, 24)]
    x = 72
    for chip_text, fill, fg in zip(chips[:3], colors, fgs):
        x = chip(draw, chip_text, x, 790, fill, fg)
    shadow_card(img, (72, 990, 1008, 1230), radius=34, fill=(24, 102, 170, 232), outline=(146, 212, 255, 255))
    draw = ImageDraw.Draw(img)
    text_block(
        draw,
        card_pick(meta, "cover", "highlight", meta["conclusion"]),
        112,
        1050,
        34,
        (238, 249, 255),
        23,
        bold=True,
        max_lines=3,
        max_width=784,
        auto_fit=True,
    )
    footer(draw, 1, card_pick(meta, "cover", "footer", "5 张图：准备 → 如何做 → 结果"))
    return img


def draw_prepare(meta: dict) -> Image.Image:
    img, draw = base()
    label(draw, card_pick(meta, "prepare", "label", "① 准备做什么"))
    text_block(
        draw,
        card_pick(meta, "prepare", "heading", "先想清楚：你要解决什么问题"),
        72,
        185,
        56,
        (14, 42, 78),
        14,
        bold=True,
        max_lines=2,
        max_width=CONTENT_W,
        max_height=130,
        auto_fit=True,
    )
    shadow_card(img, (72, 340, 1008, 780), radius=34)
    draw = ImageDraw.Draw(img)
    text_block(
        draw,
        card_pick(meta, "prepare", "main", meta.get("pain") or meta["conclusion"]),
        112,
        420,
        40,
        (28, 61, 100),
        22,
        bold=True,
        line_height=1.4,
        max_lines=5,
        max_width=784,
        max_height=320,
        auto_fit=True,
    )
    shadow_card(img, (72, 840, 490, 1060), radius=30, fill=(255, 255, 255, 238), outline=(200, 234, 255, 255))
    shadow_card(img, (526, 840, 1008, 1060), radius=30, fill=(255, 247, 215, 244), outline=(255, 226, 138, 255))
    draw = ImageDraw.Draw(img)
    text_block(draw, "你的场景", 112, 868, 28, (20, 121, 214), 8, bold=True, max_lines=1, max_width=350)
    text_block(
        draw,
        card_pick(meta, "prepare", "scene", meta.get("subtitle") or "有一个具体场景，想照着文章做一遍。"),
        112,
        918,
        28,
        (28, 61, 100),
        13,
        bold=True,
        max_lines=3,
        max_width=350,
        max_height=120,
        auto_fit=True,
    )
    text_block(draw, "本文目标", 570, 868, 28, (116, 86, 16), 8, bold=True, max_lines=1, max_width=350)
    text_block(
        draw,
        card_pick(meta, "prepare", "goal", "读完后知道第一步该准备什么。"),
        570,
        918,
        28,
        (116, 86, 16),
        13,
        bold=True,
        max_lines=3,
        max_width=350,
        max_height=120,
        auto_fit=True,
    )
    footer(draw, 2, card_pick(meta, "prepare", "footer", "先对齐场景和目标，再往下看。"))
    return img


def draw_how(meta: dict) -> Image.Image:
    img, draw = base()
    label(draw, card_pick(meta, "how", "label", "② 如何做"))
    text_block(
        draw,
        card_pick(meta, "how", "heading", "按这 3 步做"),
        72,
        185,
        56,
        (14, 42, 78),
        12,
        bold=True,
        max_lines=2,
        max_width=CONTENT_W,
        auto_fit=True,
    )
    shadow_card(img, (72, 340, 1008, 980), radius=34)
    draw = ImageDraw.Draw(img)
    custom_steps = card_pick(meta, "how", "items", None)
    if custom_steps:
        steps = custom_steps[:3]
    else:
        steps = [
            {"title": h, "body": meta["paras"][i] if i < len(meta["paras"]) else ""}
            for i, h in enumerate((meta["headings"] or ["明确目标", "拆成步骤", "做出小版本"])[:3])
        ]
    y = 400
    for i, step in enumerate(steps[:3], 1):
        title = step["title"] if isinstance(step, dict) else step
        body = step.get("body", "") if isinstance(step, dict) else ""
        if not body and i - 1 < len(meta.get("paras", [])):
            body = meta["paras"][i - 1]
        if not body:
            body = "按正文操作，先跑通最小版本。"
        y = info_row(draw, i, title, body, y)
    footer(draw, 3, card_pick(meta, "how", "footer", "一步一步来，别跳步。"))
    return img


def draw_how_tips(meta: dict) -> Image.Image:
    img, draw = base()
    label(draw, card_pick(meta, "how_tips", "label", "② 如何做 · 要点"))
    text_block(
        draw,
        card_pick(meta, "how_tips", "heading", "做的时候记住这 3 点"),
        72,
        185,
        56,
        (14, 42, 78),
        14,
        bold=True,
        max_lines=2,
        max_width=CONTENT_W,
        auto_fit=True,
    )
    shadow_card(img, (72, 340, 1008, 900), radius=34)
    draw = ImageDraw.Draw(img)
    notes = card_pick(
        meta,
        "how_tips",
        "items",
        (meta["quotes"] or meta["bullets"] or ["不要一上来做太大，先做一个能验证的小版本。"])[:3],
    )
    y = 400
    for i, note in enumerate(notes[:3], 1):
        rounded(draw, (112, y - 8, 166, y + 46), 18, (255, 209, 102))
        draw.text((139, y + 20), str(i), font=f(24, True), fill=(83, 57, 8), anchor="mm")
        text_block(
            draw,
            note,
            190,
            y,
            32,
            (28, 61, 100),
            22,
            bold=True,
            max_lines=2,
            max_width=760,
            auto_fit=True,
        )
        y += 155
    shadow_card(img, (72, 960, 1008, 1100), radius=28, fill=(255, 247, 215, 244), outline=(255, 226, 138, 255))
    draw = ImageDraw.Draw(img)
    text_block(
        draw,
        card_pick(meta, "how_tips", "highlight", "关键一步做对了，后面会省很多时间。"),
        112,
        1000,
        32,
        (116, 86, 16),
        22,
        bold=True,
        max_lines=2,
        max_width=784,
        auto_fit=True,
    )
    footer(draw, 4, card_pick(meta, "how_tips", "footer", "要点比步骤更重要。"))
    return img


def draw_result(meta: dict) -> Image.Image:
    img, draw = base()
    label(draw, card_pick(meta, "result", "label", "③ 最终结果"))
    text_block(
        draw,
        card_pick(meta, "result", "heading", "做完你会得到"),
        72,
        185,
        56,
        (14, 42, 78),
        12,
        bold=True,
        max_lines=2,
        max_width=CONTENT_W,
        auto_fit=True,
    )
    shadow_card(img, (72, 330, 1008, 560), radius=34, fill=(35, 139, 214, 232), outline=(146, 212, 255, 255))
    draw = ImageDraw.Draw(img)
    text_block(
        draw,
        card_pick(meta, "result", "main", meta["conclusion"]),
        112,
        390,
        38,
        (238, 249, 255),
        20,
        bold=True,
        line_height=1.35,
        max_lines=4,
        max_width=784,
        max_height=140,
        auto_fit=True,
    )
    shadow_card(img, (72, 610, 1008, 1100), radius=34)
    draw = ImageDraw.Draw(img)
    rows = card_pick(
        meta,
        "result",
        "items",
        card_pick(
            meta,
            "result",
            "rows",
            [
                {"title": "产出", "body": "一份能照着做的小方案或清单。"},
                {"title": "能力", "body": "知道同类问题下次怎么拆。"},
                {"title": "下一步", "body": "选一个最小场景，今天就开始试。"},
            ],
        ),
    )
    y = 660
    for i, row in enumerate(rows[:3], 1):
        title = row["title"] if isinstance(row, dict) else f"要点{i}"
        body = row.get("body", "") if isinstance(row, dict) else str(row)
        rounded(draw, (112, y - 6, 166, y + 48), 18, (49, 168, 255))
        draw.text((139, y + 22), str(i), font=f(23, True), fill="white", anchor="mm")
        text_block(draw, title, 190, y - 4, 34, (20, 121, 214), 8, bold=True, max_lines=1, max_width=760)
        text_block(
            draw,
            body,
            190,
            y + 42,
            28,
            (28, 61, 100),
            22,
            bold=True,
            max_lines=2,
            max_width=760,
            auto_fit=True,
        )
        y += 145
    footer(draw, 5, card_pick(meta, "result", "footer", "结果导向：做完比看完更重要。"))
    return img


# legacy names for generate()
draw_problem = draw_prepare
draw_steps = draw_how
draw_warning = draw_how_tips
draw_summary = draw_result


def write_upload(meta: dict, out: Path) -> None:
    title = meta["title"]
    summary = meta["conclusion"]
    keywords = meta.get("keywords") or "AI工具, 普通人学AI, AI教程, 技趣星球"
    (out / "UPLOAD.md").write_text(
        f"""# 微信搜一搜 / 看一看图文发布包

文章：{title}

## 素材顺序

上传目录：`social/wechat-search/`

1. `wechat-card-01.png`：封面
2. `wechat-card-02.png`：核心问题
3. `wechat-card-03.png`：照着做步骤
4. `wechat-card-04.png`：关键提醒
5. `wechat-card-05.png`：总结和行动提示（PNG 内不含关注/导流词）

## 搜一搜标题

```text
{title}
```

## 看一看推荐标题

```text
{title[:24]}
```

## 摘要

```text
{summary[:140]}
```

## 图文正文

```text
{summary[:180]}

建议先看图抓重点，再回到正文照着做。
```

> PNG 与搜一搜图文正文均不要写关注/回复/公众号等导流词。

## 公众号导流（仅长文用，勿粘贴进搜一搜图文）

```text
关注 AI技趣星球，一起用技术创造乐趣。
```

## 关键词

```text
{keywords}
```

## 话题标签

```text
#AI工具 #普通人学AI #AI教程 #技趣星球
```

## 发布检查

- [ ] 5 张 PNG 内无：公众号、关注、回复、私信、加群、福利、搜一搜、看一看
- [ ] 封面选择 `wechat-card-01.png`
- [ ] 正文不要公开账号、Key、订阅地址等敏感信息
- [ ] 发布前抽检第 1、3、5 张是否清晰
""",
        encoding="utf-8",
    )


def generate(post: Path) -> None:
    meta = merge_meta(post)
    out = post / "social" / "wechat-search"
    out.mkdir(parents=True, exist_ok=True)
    if not (out / "cards.json").exists():
        print(f"warn: {post.name} missing cards.json — using auto-extracted copy; review before publish")
    for idx, maker in enumerate([draw_cover, draw_problem, draw_steps, draw_warning, draw_summary], 1):
        save_card(maker(meta), out, idx)
    write_upload(meta, out)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("posts", nargs="*", help="post directories")
    parser.add_argument("--all", action="store_true")
    parser.add_argument("--exclude", action="append", default=[])
    args = parser.parse_args()
    if args.all:
        posts = sorted(p for p in POSTS.iterdir() if (p / "index.md").exists())
    else:
        posts = [Path(p) for p in args.posts]
    excluded = set(args.exclude)
    for post in posts:
        if post.name in excluded:
            continue
        generate(post)
        print(f"generated {post / 'social' / 'wechat-search'}")


if __name__ == "__main__":
    main()
