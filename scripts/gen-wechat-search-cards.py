#!/usr/bin/env python3
"""Generate WeChat Search / Kandian card packs for blog posts.

Usage:
  python3 scripts/gen-wechat-search-cards.py content/posts/04-xxx
  python3 scripts/gen-wechat-search-cards.py --all
"""

from __future__ import annotations

import argparse
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
POSTS = ROOT / "content" / "posts"
FONT_REG = "/System/Library/Fonts/STHeiti Light.ttc"
FONT_BOLD = "/System/Library/Fonts/STHeiti Medium.ttc"
FONT_MONO = "/System/Library/Fonts/Menlo.ttc"
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
) -> int:
    lines = wrap(strip_emoji(clean_inline(s)), max_chars)
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
    text_block(draw, cta, 72, 1304, 28, (28, 61, 100), 27, bold=True, max_lines=2)
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
    text_block(draw, title, 204, y - 2, 31, (20, 121, 214), 20, bold=True, max_lines=1)
    text_block(draw, body, 204, y + 40, 26, (28, 61, 100), 27, bold=True, max_lines=2)
    return y + 120


def codebox(draw: ImageDraw.ImageDraw, box, code: str) -> None:
    code = strip_emoji(clean_inline(code))
    if not code:
        return
    rounded(draw, box, 22, (15, 35, 58), (42, 96, 144), 2)
    draw.text((box[0] + 28, box[1] + 25), code[:38], font=f(32, True, True), fill=(218, 244, 255))


def get_meta(post: Path) -> dict:
    md = (post / "index.md").read_text(encoding="utf-8")
    title = clean_inline(re.search(r"^#\s+(.+)$", md, re.M).group(1))
    subtitle = ""
    for line in md.splitlines():
        if line.startswith(">") and "关注" not in line and line.strip() != ">":
            subtitle = clean_inline(line)
            break
    conclusion = ""
    m = re.search(r"\*\*一句话结论[:：](.+?)\*\*", md, re.S)
    if m:
        conclusion = clean_inline(m.group(1))
    if not conclusion:
        paras = [
            clean_inline(x)
            for x in re.split(r"\n\s*\n", md)
            if clean_inline(x) and not x.startswith("#") and not is_boilerplate(clean_inline(x))
        ]
        conclusion = next((p for p in paras if len(p) > 22), title)
    headings = [re.sub(r"^\d+[.、]\s*", "", clean_inline(h)) for h in re.findall(r"^##\s+(.+)$", md, re.M)]
    headings = [h for h in headings if not h.startswith("今天") and not h.startswith("最后")][:6]
    quotes = [clean_inline(q) for q in re.findall(r"^>\s+(.+)$", md, re.M)]
    quotes = [q for q in quotes if q and "关注" not in q and len(q) > 8][:4]
    paras = [
        clean_inline(x)
        for x in re.split(r"\n\s*\n", md)
        if clean_inline(x) and not x.startswith("#") and not is_boilerplate(clean_inline(x))
    ]
    bullets = [clean_inline(x) for x in re.findall(r"^\s*[-*]\s+(.+)$", md, re.M)]
    bullets = [b for b in bullets if b and not is_boilerplate(b)][:6]
    code = ""
    cm = re.search(r"```(?:bash|text|powershell|json)?\n(.+?)```", md, re.S)
    if cm:
        code = clean_inline(cm.group(1).splitlines()[0])
    return {
        "slug": post.name,
        "title": title,
        "subtitle": subtitle or "技趣星球图文版",
        "conclusion": conclusion,
        "headings": headings,
        "quotes": quotes,
        "paras": paras[:6],
        "bullets": bullets,
        "code": code,
    }


def save_card(img: Image.Image, out: Path, idx: int) -> None:
    img.convert("RGB").save(out / f"wechat-card-{idx:02d}.png", quality=96)


def draw_cover(meta: dict) -> Image.Image:
    img, draw = base()
    label(draw, "实用AI卡片")
    text_block(draw, meta["subtitle"], 72, 210, 32, (43, 96, 145), 26, bold=True, max_lines=2)
    text_block(draw, meta["title"], 72, 326, 66, (14, 42, 78), 11.5, bold=True, line_height=1.08, max_lines=4)
    x = 72
    x = chip(draw, "5张图速览", x, 790, (20, 121, 214))
    x = chip(draw, "适合收藏", x, 790, (67, 207, 199))
    chip(draw, "步骤清楚", x, 790, (255, 185, 82), (60, 49, 24))
    shadow_card(img, (72, 990, 1008, 1230), radius=34, fill=(24, 102, 170, 232), outline=(146, 212, 255, 255))
    draw = ImageDraw.Draw(img)
    text_block(draw, "先抓重点，再看步骤。把复杂工具拆成普通人能照着做的小动作。", 112, 1050, 34, (238, 249, 255), 23, bold=True, max_lines=3)
    footer(draw, 1, "先看重点，再做第一步。")
    return img


def draw_problem(meta: dict) -> Image.Image:
    img, draw = base()
    label(draw, "这篇解决什么")
    text_block(draw, "先抓住一个核心问题", 72, 185, 58, (14, 42, 78), 13, bold=True, max_lines=2)
    shadow_card(img, (72, 365, 1008, 760), radius=34)
    draw = ImageDraw.Draw(img)
    text_block(draw, meta["conclusion"], 112, 435, 36, (28, 61, 100), 24, bold=True, line_height=1.42, max_lines=5)
    shadow_card(img, (72, 820, 490, 1110), radius=30, fill=(255, 255, 255, 238), outline=(200, 234, 255, 255))
    shadow_card(img, (526, 820, 1008, 1110), radius=30, fill=(255, 247, 215, 244), outline=(255, 226, 138, 255))
    draw = ImageDraw.Draw(img)
    text_block(draw, "为什么值得看", 112, 875, 34, (20, 121, 214), 12, bold=True, max_lines=1)
    text_block(draw, "少绕路，先知道这件事能不能帮你落地。", 112, 940, 29, (28, 61, 100), 14, bold=True, max_lines=3)
    text_block(draw, "判断标准", 570, 875, 34, (116, 86, 16), 12, bold=True, max_lines=1)
    text_block(draw, "读完能不能立刻做一个小动作，而不是只收藏。", 570, 940, 29, (116, 86, 16), 15, bold=True, max_lines=3)
    footer(draw, 2, "不要只收藏，先完成一个小动作。")
    return img


def draw_steps(meta: dict) -> Image.Image:
    img, draw = base()
    label(draw, "照着做")
    text_block(draw, "把文章拆成 3 步", 72, 185, 60, (14, 42, 78), 13, bold=True)
    shadow_card(img, (72, 360, 1008, 890), radius=34)
    draw = ImageDraw.Draw(img)
    steps = (meta["headings"] or ["先明确目标", "再让 AI 给方案", "最后做一个小版本"])[:3]
    details = (meta["paras"] or ["先照着文章跑一遍，不要一开始追求完整。"])[:3]
    y = 430
    for i, step in enumerate(steps, 1):
        body = details[i - 1] if i - 1 < len(details) else "按正文步骤操作，先跑通最小版本。"
        y = info_row(draw, i, step, body, y)
    shadow_card(img, (72, 965, 1008, 1165), radius=34, fill=(35, 139, 214, 232), outline=(146, 212, 255, 255))
    draw = ImageDraw.Draw(img)
    text_block(draw, "这张卡保留行动路径：先跑通，再优化，最后复用到自己的场景。", 112, 1025, 34, (238, 249, 255), 23, bold=True, max_lines=3)
    footer(draw, 3, "先跑通小版本，再慢慢加功能。")
    return img


def draw_warning(meta: dict) -> Image.Image:
    img, draw = base()
    label(draw, "关键提醒")
    text_block(draw, "最容易忽略的地方", 72, 185, 60, (14, 42, 78), 13, bold=True)
    shadow_card(img, (72, 355, 1008, 1085), radius=34)
    draw = ImageDraw.Draw(img)
    notes = (meta["quotes"] or meta["bullets"] or ["不要一上来做太大，先做一个能验证的小版本。", "涉及账号、隐私、费用，先确认再操作。", "AI 能帮你省力，但不能替你负责。"])[:4]
    y = 430
    for i, note in enumerate(notes[:4], 1):
        rounded(draw, (112, y - 8, 166, y + 46), 18, (255, 209, 102))
        draw.text((139, y + 20), str(i), font=f(24, True), fill=(83, 57, 8), anchor="mm")
        text_block(draw, note, 190, y, 30, (28, 61, 100), 24, bold=True, max_lines=2)
        y += 142
    shadow_card(img, (72, 1120, 1008, 1230), radius=28, fill=(255, 247, 215, 244), outline=(255, 226, 138, 255))
    draw = ImageDraw.Draw(img)
    text_block(draw, "先确认：账号、费用、隐私、能否回退。", 112, 1154, 32, (116, 86, 16), 24, bold=True, max_lines=2)
    footer(draw, 4, "边界清楚，操作才稳。")
    return img


def draw_summary(meta: dict) -> Image.Image:
    img, draw = base()
    label(draw, "最后带走")
    text_block(draw, "这篇文章怎么用", 72, 185, 60, (14, 42, 78), 13, bold=True)
    shadow_card(img, (72, 350, 1008, 570), radius=34)
    shadow_card(img, (72, 625, 1008, 845), radius=34)
    shadow_card(img, (72, 900, 1008, 1120), radius=34)
    shadow_card(img, (72, 1168, 1008, 1268), radius=30, fill=(35, 139, 214, 232), outline=(146, 212, 255, 255))
    draw = ImageDraw.Draw(img)
    text_block(draw, "适合谁", 112, 395, 38, (20, 121, 214), bold=True, max_chars=10)
    text_block(draw, "想用 AI 做点真实东西，但不想先啃一堆术语的人。", 112, 460, 31, (28, 61, 100), 24, bold=True, max_lines=2)
    text_block(draw, "先做什么", 112, 670, 38, (20, 121, 214), bold=True, max_chars=10)
    text_block(draw, "从一个小场景开始，照着正文跑通，再改成自己的版本。", 112, 735, 31, (28, 61, 100), 25, bold=True, max_lines=2)
    text_block(draw, "带走什么", 112, 945, 38, (20, 121, 214), bold=True, max_chars=10)
    text_block(draw, "一套可复用的判断方法：先看成本，再看步骤，最后看边界。", 112, 1010, 31, (28, 61, 100), 25, bold=True, max_lines=2)
    text_block(draw, "看完这 5 张，再选一个最小场景动手试。", 112, 1198, 31, (238, 249, 255), 27, bold=True, max_lines=2)
    footer(draw, 5, "把一个小场景做出来。")
    return img


def write_upload(meta: dict, out: Path) -> None:
    title = meta["title"]
    summary = meta["conclusion"]
    keywords = "AI工具, 普通人学AI, AI教程, 技趣星球"
    (out / "UPLOAD.md").write_text(
        f"""# 微信搜一搜 / 看一看图文发布包

文章：{title}

## 素材顺序

上传目录：`social/wechat-search/`

1. `wechat-card-01.png`：封面
2. `wechat-card-02.png`：核心问题
3. `wechat-card-03.png`：照着做步骤
4. `wechat-card-04.png`：关键提醒
5. `wechat-card-05.png`：总结和关注引导

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

关注微信公众号 AI技趣星球，回复MF 一起用技术创造乐趣。
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

- [ ] 5 张图按文件名顺序上传
- [ ] 封面选择 `wechat-card-01.png`
- [ ] 正文不要公开账号、Key、订阅地址等敏感信息
- [ ] 发布前抽检第 1、3、5 张是否清晰
""",
        encoding="utf-8",
    )


def generate(post: Path) -> None:
    meta = get_meta(post)
    out = post / "social" / "wechat-search"
    out.mkdir(parents=True, exist_ok=True)
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
