#!/usr/bin/env python3
"""
根据 Markdown 文章生成竖版摘要短视频（9:16 抖音/小红书）
输出: content/posts/<slug>/summary-video.mp4
"""

import sys, os, subprocess, math, colorsys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import io

ROOT = Path(__file__).resolve().parent.parent
POSTS_DIR = ROOT / 'content' / 'posts'
FONT_PATH = '/System/Library/Fonts/Hiragino Sans GB.ttc'
FONT_FALLBACK = '/System/Library/Fonts/STHeiti Light.ttc'

W, H = 1080, 1920  # 9:16 竖版
FPS = 25
DURATION = 30  # 秒

# 颜色方案
BG_GRAY = (18, 22, 30)
WHITE = (255, 255, 255)
BLUE = (59, 130, 246)
BLUE_DARK = (30, 64, 175)
GREEN = (16, 185, 129)
AMBER = (217, 119, 6)
PINK = (219, 39, 119)
CYAN = (8, 145, 178)

SCENES = [
    {"icon": "📱", "text": "做 App", "color": BLUE, "star": 3},
    {"icon": "🌐", "text": "搭网站", "color": GREEN, "star": 2},
    {"icon": "🛠", "text": "写小工具", "color": AMBER, "star": 2},
    {"icon": "🎵", "text": "做音乐", "color": PINK, "star": 1},
    {"icon": "🎬", "text": "做视频", "color": BLUE_DARK, "star": 2},
    {"icon": "✨", "text": "做特效", "color": PINK, "star": 1},
    {"icon": "📝", "text": "写报告", "color": CYAN, "star": 1},
]

def get_font(size):
    try: return ImageFont.truetype(FONT_PATH, size)
    except: return ImageFont.truetype(FONT_FALLBACK, size)

def text_size(draw, text, font):
    bbox = draw.textbbox((0, 0), text, font=font)
    return bbox[2] - bbox[0], bbox[3] - bbox[1]

def draw_centered_text(draw, text, y, font, color=WHITE, max_w=None):
    """居中绘制文字，返回底部y坐标"""
    lines = []
    if max_w:
        words = text.split()
        current = ""
        for w in words:
            test = current + (" " if current else "") + w
            if text_size(draw, test, font)[0] <= max_w:
                current = test
            else:
                lines.append(current)
                current = w
        if current: lines.append(current)
    else:
        lines = text.split('\n')

    line_h = text_size(draw, "A", font)[1] + 4
    for line in lines:
        tw, _ = text_size(draw, line, font)
        draw.text(((W - tw) / 2, y), line, font=font, fill=color)
        y += line_h
    return y + 6

def gradient_xy(draw, w, h, c1, c2, vertical=True):
    """绘制渐变背景"""
    for i in range(w if not vertical else h):
        t = i / (w if not vertical else h)
        r = int(c1[0] + (c2[0] - c1[0]) * t)
        g = int(c1[1] + (c2[1] - c1[1]) * t)
        b = int(c1[2] + (c2[2] - c1[2]) * t)
        if vertical:
            draw.line([(0, i), (w, i)], fill=(r, g, b))
        else:
            draw.line([(i, 0), (i, h)], fill=(r, g, b))

def make_scene_0_title(out_dir):
    """场景0: 标题页 0-3s"""
    imgs = []
    for f in range(int(3 * FPS)):
        t = f / (3 * FPS)
        alpha = min(t * 2, 1.0)
        img = Image.new('RGB', (W, H), BG_GRAY)
        draw = ImageDraw.Draw(img)
        font_title = get_font(72)
        font_sub = get_font(32)

        # "AI" 大字
        y = H // 2 - 180
        draw_centered_text(draw, "AI", y, font_title, BLUE)
        y += 100
        draw_centered_text(draw, "跟普通人没关系？", y, font_title, WHITE)
        y += 100
        draw_centered_text(draw, "它能帮你做这 7 件事", y+20, font_sub, (170,170,170))

        # 底部提示线
        if t > 0.5:
            y2 = H - 120
            draw_centered_text(draw, "全部 · 不需要懂技术 · 现在就能做", y2, get_font(22), (120,120,120))

        imgs.append(img)
    return imgs

def make_scene_1_icons(out_dir):
    """场景1: 7个图标快闪 3-7s"""
    imgs = []
    frames = int(4 * FPS)
    for f in range(frames):
        t = f / frames
        idx = int(t * 7)  # 当前图标索引
        img = Image.new('RGB', (W, H), BG_GRAY)
        draw = ImageDraw.Draw(img)
        font_icon = get_font(120)
        font_label = get_font(42)
        font_title = get_font(28)

        # 标题
        draw_centered_text(draw, "普通人能拿 AI 做什么？", 100, font_title, (150, 150, 150))

        icon_y = H // 2 - 80
        label_y = icon_y + 160

        # 当前大图标
        s = SCENES[idx]
        draw_centered_text(draw, s["icon"], icon_y, font_icon, WHITE)
        draw_centered_text(draw, s["text"], label_y, font_label, s["color"])

        # 星星
        star_y = label_y + 60
        stars = "⭐" * s["star"]
        draw_centered_text(draw, stars, star_y, get_font(24))

        # 进度点
        dots_y = H - 140
        dot_x = W // 2 - 7 * 10
        for i in range(7):
            c = s["color"] if i == idx else (60, 60, 60)
            draw.ellipse([dot_x + i * 28 + 4, dots_y, dot_x + i * 28 + 16, dots_y + 12], fill=c)

        imgs.append(img)
    return imgs

def make_scene_2_rapid(out_dir):
    """场景2-3: 快速切换「做App/搭网站/写工具」7-15s"""
    imgs = []
    frames = int(8 * FPS)
    labels_1 = ["做 App", "搭网站", "写小工具"]
    labels_2 = ["做音乐", "剪视频", "做特效", "写报告"]
    icons_1 = ["📱", "🌐", "🛠"]
    icons_2 = ["🎵", "🎬", "✨", "📝"]
    colors_all = [SCENES[0]["color"], SCENES[1]["color"], SCENES[2]["color"],
                  BLUE_DARK, PINK, PINK, CYAN]

    for f in range(frames):
        t = f / frames
        img = Image.new('RGB', (W, H), BG_GRAY)
        draw = ImageDraw.Draw(img)

        if t < 0.5:
            # 前三项
            sub_t = t * 2
            idx = int(sub_t * 3)
            label = labels_1[idx] if idx < 3 else labels_1[2]
            icon = icons_1[idx] if idx < 3 else icons_1[2]
            color = colors_all[idx] if idx < 3 else colors_all[2]
        else:
            # 后四项
            sub_t = (t - 0.5) * 2
            idx = int(sub_t * 4)
            label = labels_2[idx] if idx < 4 else labels_2[3]
            icon = icons_2[idx] if idx < 4 else icons_2[3]
            color = colors_all[3 + idx] if (3 + idx) < 7 else colors_all[6]

        draw_centered_text(draw, icon, H // 2 - 120, get_font(140), WHITE)
        draw_centered_text(draw, label, H // 2 + 80, get_font(60), color)
        draw_centered_text(draw, "不需要写代码", H // 2 + 160, get_font(28), (150, 150, 150))

        imgs.append(img)
    return imgs

def make_scene_3_stars(out_dir):
    """场景4: 难度星级 15-22s"""
    imgs = []
    frames = int(7 * FPS)
    for f in range(frames):
        t = f / frames
        img = Image.new('RGB', (W, H), BG_GRAY)
        draw = ImageDraw.Draw(img)
        font_title = get_font(36)
        font_star = get_font(48)
        font_desc = get_font(24)

        draw_centered_text(draw, "上手有多难？", 200, font_title, WHITE)

        items = [
            ("⭐⭐⭐", "1 件需要装软件+复制代码", (255, 255, 200)),
            ("⭐⭐", "2 件需要装软件+看5分钟教程", (200, 255, 200)),
            ("⭐", "4 件打开网页就能做", (150, 220, 255)),
        ]

        y = 420
        for stars, desc, color in items:
            # 星级
            draw_centered_text(draw, stars, y, font_star, color)
            # 描述
            draw_centered_text(draw, desc, y + 60, font_desc, (180, 180, 180))
            y += 170

        # 底部大字
        draw_centered_text(draw, "没有一件需要专业知识", H - 220, get_font(32), GREEN)

        draw_centered_text(draw, "零编程 · 纯小白友好", H - 140, get_font(22), (130, 130, 130))

        imgs.append(img)
    return imgs

def make_scene_4_core(out_dir):
    """场景5: 核心心法 22-27s"""
    imgs = []
    frames = int(5 * FPS)
    for f in range(frames):
        t = f / frames
        img = Image.new('RGB', (W, H), BG_GRAY)
        draw = ImageDraw.Draw(img)

        # 大字
        font_big = get_font(64)
        font_mid = get_font(36)
        font_small = get_font(26)

        draw_centered_text(draw, "你只需要做一件事", H // 2 - 160, font_mid, (180, 180, 180))
        draw_centered_text(draw, "描述需求", H // 2 - 50, font_big, BLUE)
        draw_centered_text(draw, "→", H // 2 + 30, get_font(40), WHITE)
        draw_centered_text(draw, "AI 负责实现", H // 2 + 90, font_big, GREEN)

        draw_centered_text(draw, "把想法变成现实，你说就行", H - 200, font_small, (150, 150, 150))

        imgs.append(img)
    return imgs

def make_scene_5_cta(out_dir):
    """场景6: 结尾 CTA 27-30s"""
    imgs = []
    frames = int(3 * FPS)
    for f in range(frames):
        t = f / frames
        img = Image.new('RGB', (W, H), BG_GRAY)
        draw = ImageDraw.Draw(img)
        font_cta = get_font(48)
        font_sub = get_font(30)
        font_hashtag = get_font(24)

        y = H // 2 - 100
        draw_centered_text(draw, "想知道具体怎么做？", y, font_cta, WHITE)
        draw_centered_text(draw, "关注我 · 下期手把手教你", y + 80, font_sub, BLUE)

        y2 = H - 200
        draw_centered_text(draw, "#AI工具 #普通人学AI #干货分享", y2, font_hashtag, (120, 120, 120))

        imgs.append(img)
    return imgs

def generate_video(out_path):
    out_dir = out_path.parent
    tmp_dir = out_dir / '.video_tmp'
    tmp_dir.mkdir(exist_ok=True)

    print("🎬 生成视频帧...")
    all_frames = (
        make_scene_0_title(tmp_dir) +
        make_scene_1_icons(tmp_dir) +
        make_scene_2_rapid(tmp_dir) +
        make_scene_3_stars(tmp_dir) +
        make_scene_4_core(tmp_dir) +
        make_scene_5_cta(tmp_dir)
    )
    print(f"  共 {len(all_frames)} 帧")

    # 调整帧数到 target FPS * DURATION
    target_frames = FPS * DURATION
    if len(all_frames) < target_frames:
        # 复制最后一帧补足
        last = all_frames[-1]
        all_frames.extend([last] * (target_frames - len(all_frames)))
    elif len(all_frames) > target_frames:
        # 均匀抽样
        step = len(all_frames) / target_frames
        all_frames = [all_frames[int(i * step)] for i in range(target_frames)]

    print(f"  编码 {len(all_frames)} 帧 → {out_path.name}...")
    # 用 ffmpeg 将帧序列编码为 MP4
    cmd = [
        'ffmpeg', '-y',
        '-f', 'rawvideo',
        '-vcodec', 'rawvideo',
        '-s', f'{W}x{H}',
        '-pix_fmt', 'rgb24',
        '-r', str(FPS),
        '-i', '-',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-preset', 'medium',
        '-crf', '23',
        '-movflags', '+faststart',
        str(out_path)
    ]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)
    for img in all_frames:
        proc.stdin.write(img.tobytes())
    proc.stdin.close()
    proc.wait()

    # 清理临时文件
    import shutil
    shutil.rmtree(tmp_dir, ignore_errors=True)

    if proc.returncode == 0:
        size_mb = out_path.stat().st_size / 1024 / 1024
        print(f"✅ {out_path.relative_to(ROOT)} ({size_mb:.1f} MB)")
        return True
    else:
        print(f"❌ ffmpeg 编码失败")
        return False

def main():
    if len(sys.argv) < 2:
        print("用法: python3 scripts/gen-video.py <文章目录>")
        sys.exit(1)

    slug = sys.argv[1]
    post_dir = (ROOT / slug).resolve() if not slug.startswith('/') else Path(slug)
    if not (post_dir / 'index.md').exists():
        print(f"找不到文章: {post_dir}")
        sys.exit(1)

    out_path = post_dir / 'summary-video.mp4'
    generate_video(out_path)

if __name__ == '__main__':
    main()
