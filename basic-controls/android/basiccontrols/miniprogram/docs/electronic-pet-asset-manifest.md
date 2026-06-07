# 学习星球 · 电子宠物物料总清单

> 更新：2026-06-06  
> 关联：`electronic-pet-art-material-brief.md` · `asset-manifest.json` · `LICENSE.md`  
> 资源目录：`miniprogram/assets/images/pet/`

---

## 1. 商用与品质标准

| 要求 | 执行方式 |
|------|----------|
| **可商用** | 全部素材项目原创；见 `LICENSE.md`，无第三方图库依赖 |
| **非常精美** | 2D 精品儿童 App 级：软胶玩具质感、干净渐变、圆润描边、统一色板 |
| **不能太粗糙** | 禁止线稿占位上线；preview 评审通过后才进入正式导出 |

**色板（与学习星球主题一致）**

| 语义 | 色值 | 用途 |
|------|------|------|
| 晴空蓝 | `#6EC5FF` / `#31A8FF` | 星芽兽·蓝、主按钮 |
| 薄荷绿 | `#7EDCB5` / `#43CFC7` | 星芽兽·绿、成功态 |
| 暖橙黄 | `#FFB86C` / `#FFD166` | 星芽兽·橙、星星积分 |
| 深蓝墨 | `#173A62` / `#1479D6` | 描边、标题 |
| 云白底 | `#DDF4FF` → `#F9FDFF` | 页面背景 |

---

## 2. 当前素材进度

### 2.1 已完成 ✅

| 类别 | 数量 | 位置 | 说明 |
|------|------|------|------|
| **角色参考图** | 5 张 | `previews/` | 蓝/绿/橙待机 + 旧庆祝对照 + 统一骨架庆祝 v2 |
| **场景参考图** | 2 张 | `previews/` | 默认小屋、成长花园 |
| **道具参考图** | 3 张 | `previews/` | 星星饼干、星星发卡、食物玩具合板 |
| **地图图标参考** | 1 张 | `previews/planet_pet_v2_ref.png` | 替换现有 `planet-pet.png` 的方向稿 |
| **UI 矢量图标** | 13 个 | `ui/*.svg` | 可直接用或导出 PNG @2x |
| **透明配饰 PNG** | 13 个 | `accessories/` | 头部、颈部、背部、手持全部完成 |
| **透明食物/玩具 PNG** | 6 个 | `food/` `toys/` | 三种食物、三种玩具全部完成 |
| **动物宠物参考** | 2 张 | `previews/pet_star_fox_*` | 星绒狐待机 + 庆祝 |
| **动作参考补充** | 3 张 | `previews/pet_star_sprout_sky_*` | 进食、玩球、困倦 |
| **物料总览** | 1 张 | `asset-contact-sheet-v2.png` | 角色与 19 个透明物料 QA |
| **授权文件** | 1 | `LICENSE.md` | 商用范围与审核清单 |
| **清单索引** | 1 | `asset-manifest.json` | 机器可读物料状态 |

### 2.2 待制作 ⬜（正式包用）

| 类别 | 计划数量 | 优先级 |
|------|----------|--------|
| 角色动画帧 | 3 色 × 7 动作 × 4–6 帧 ≈ **63–126 张** | P0 |
| 房间背景 | **2 张** 1125×2436 或安全区适配 | P0 |
| 地图星球正式版 | **1 张** 512×512 | P1 |
| 星芽兽想陪伴动作 | **1 张参考 + 动画帧** | P0 |
| 星绒狐其余动作 | **进食/玩球/困倦/想陪伴** | P0 |

---

## 3. 参考图一览（已入库）

### 3.1 星芽兽 · 三种配色待机

| 文件 | 配色 | 状态 |
|------|------|------|
| `previews/pet_star_sprout_sky_idle_ref.png` | 晴空蓝 + 薄荷绿嫩芽 + 星点肚 | ✅ 定稿参考 |
| `previews/pet_star_sprout_mint_idle_ref.png` | 薄荷绿 + 嫩黄嫩芽 | ✅ 定稿参考 |
| `previews/pet_star_sprout_sunset_idle_ref.png` | 暖橙 + 珊瑚粉嫩芽 | ✅ 定稿参考 |

**评审结论：** 满足「圆润水滴 + 星形嫩芽 + 星点腹部」识别点；质感达到精品儿童 App 水准，可进入正式抠图与动画拆分。

### 3.2 动作参考

| 文件 | 动作 | 状态 |
|------|------|------|
| `previews/pet_star_sprout_sky_happy_ref.png` | 旧庆祝图 | ⛔ 骨架漂移，仅保留对照 |
| `previews/pet_star_sprout_sky_happy_v2_ref.png` | 庆祝/升级（举手） | ✅ 统一待机母版骨架 |

**仍缺参考（必须锁定待机母版）：** 吃东西、玩球、困倦、想陪伴。升级可复用 v2 庆祝姿势并补腹部亮度变化。

### 3.3 场景

| 文件 | 用途 | 备注 |
|------|------|------|
| `previews/room_default_ref.png` | 默认宠物小屋 | 偏 3D 精致风；正式版建议压平为 2D 或与角色统一为轻 3D |
| `previews/room_growth_garden_ref.png` | 10 级解锁背景 | 夜花园氛围 ✅ |

### 3.4 道具

| 文件 | 物品 | 状态 |
|------|------|------|
| `previews/food_star_cookie_ref.png` | 星星饼干 | ✅ |
| `previews/accessory_head_star_clip_ref.png` | 星星发卡 | ✅ |
| `previews/pet_items_food_toy_set_ref.png` | 牛奶/果杯/弹弹球 | ✅ 合板，需拆成 3 张独立透明 PNG |

---

## 4. 正式导出规格

### 4.1 角色主体

```text
画布：2048×2048（源）→ 导出 768×768（小屋）/ 256×256（缩略）
格式：PNG-24 透明 或 WebP 无损
描边：#1479D6 或同色深 15%
命名：pet_star_sprout_{color}_{action}_{frame}.png
```

### 4.2 配饰

```text
尺寸：512×512，透明底
锚点：见 art-material-brief §6
命名：accessory_{slot}_{id}.png
```

### 4.3 房间

```text
尺寸：1125×2436（iPhone 安全区）或 750×1334 中心裁切
中央 60% 高度留空给宠物与弹层
命名：room_{id}.png / room_{id}@2x.webp
```

### 4.4 UI 图标

```text
源：ui/*.svg（已完成）
小程序：建议导出 icon_pet_*@48.png @96.png（微信 image 组件不支持 SVG 时）
```

---

## 5. 完整物料表（编码对照用）

### 5.1 角色动画 P0

| assetKey | 帧数 | 预览 | 正式 |
|----------|------|------|------|
| `pet_star_sprout_{sky\|mint\|sunset}_idle` | 4 | sky ✅ | ⬜ |
| `pet_star_sprout_{color}_happy` | 6 | sky ✅ | ⬜ |
| `pet_star_sprout_{color}_eat` | 4 | — | ⬜ |
| `pet_star_sprout_{color}_play` | 4 | — | ⬜ |
| `pet_star_sprout_{color}_sleepy` | 4 | — | ⬜ |
| `pet_star_sprout_{color}_lonely` | 4 | — | ⬜ |
| `pet_star_sprout_{color}_levelup` | 6 | — | ⬜ |

### 5.2 配饰（13）

| ID | 名称 | 槽位 | 预览 |
|----|------|------|------|
| `accessory_head_star_clip` | 星星发卡 | head | ✅ 透明 PNG |
| `accessory_head_explorer_hat` | 探索帽 | head | ✅ 透明 PNG |
| `accessory_head_headphones` | 小耳机 | head | ✅ 透明 PNG |
| `accessory_head_cloud_nightcap` | 云朵睡帽 | head | ✅ 透明 PNG |
| `accessory_neck_mint_bow` | 薄荷领结 | neck | ✅ 透明 PNG |
| `accessory_neck_rainbow_scarf` | 彩条围巾 | neck | ✅ 透明 PNG |
| `accessory_neck_medal` | 学习奖牌 | neck | ✅ 透明 PNG |
| `accessory_back_schoolbag` | 小书包 | back | ✅ 透明 PNG |
| `accessory_back_cloud_cape` | 云朵披风 | back | ✅ 透明 PNG |
| `accessory_back_leaf_wings` | 探索小翅膀 | back | ✅ 透明 PNG |
| `accessory_hand_star_pen` | 星光笔 | hand | ✅ 透明 PNG |
| `accessory_hand_flag` | 小旗 | hand | ✅ 透明 PNG |
| `accessory_hand_magnifier` | 放大镜 | hand | ✅ 透明 PNG |

### 5.3 食物 / 玩具

| ID | 名称 | 预览 |
|----|------|------|
| `food_star_cookie` | 星星饼干 | ✅ 透明 PNG |
| `food_cloud_milk` | 云朵牛奶 | ✅ 透明 PNG |
| `food_rainbow_cup` | 彩虹果杯 | ✅ 透明 PNG |
| `toy_bouncy_ball` | 弹弹球 | ✅ 透明 PNG |
| `toy_puzzle_blocks` | 拼图积木 | ✅ 透明 PNG |
| `toy_bubble_wand` | 泡泡棒 | ✅ 透明 PNG |

### 5.4 动物宠物：星绒狐

| assetKey | 状态 |
|---|---|
| `pet_star_fox_orange_idle_ref` | ✅ 待机母版 |
| `pet_star_fox_orange_happy_ref` | ✅ 庆祝动作 |
| `pet_star_fox_orange_eat` | ⬜ 图片服务恢复后生成 |
| `pet_star_fox_orange_play` | ⬜ 图片服务恢复后生成 |
| `pet_star_fox_orange_sleepy` | ⬜ 图片服务恢复后生成 |
| `pet_star_fox_orange_companion` | ⬜ 图片服务恢复后生成 |

### 5.5 UI 图标（13）— 已全部就绪

`icon_pet_xp` · `icon_pet_star_points` · `icon_pet_hunger` · `icon_pet_mood` · `icon_pet_energy` · `icon_pet_feed` · `icon_pet_play` · `icon_pet_wardrobe` · `icon_pet_shop` · `icon_pet_growth` · `icon_pet_owned` · `icon_pet_equipped` · `icon_pet_level_lock`

---

## 6. 正式化工作流（preview → production）

```text
1. 评审 previews/ 定稿（角色轮廓、色板、风格统一）
2. 抠图：白底 → 透明 PNG（remove.bg 或 PS），检查边缘锯齿
3. 统一画布：脚底基线对齐，便于动画帧拼接
4. 压缩：TinyPNG / sharp，单张 ≤ 250 KB
5. 相似性检查：与皮卡丘、Jigglypuff、Duolingo 猫头鹰等对比
6. 写入 asset-manifest.json status: ready
7. 小程序分包 packages/pet 或 assets/images/pet 引用
```

---

## 7. 生成提示词（续产用）

**角色待机（已验证有效）：**

```text
Professional children's educational app mascot "Star Sprout", original design.
Full body front view, rounded teardrop soft vinyl toy body,
two leaf sprouts on head with one star-shaped leaf, short round limbs,
dark navy oval eyes with dot highlight, gentle smile, star dots on belly,
matte soft toy texture, clean cel-shading, medium rounded outline,
主色[{晴空蓝 #6EC5FF / 薄荷绿 #7EDCB5 / 暖橙 #FFB86C}],
white background, no text, no logo, exquisite polished 2D kids app art.
```

**动作变体：** 在以上基础上仅改姿势 — `happy celebrating arms up` / `eating holding cookie` / `playing with ball` / `sleepy half-closed eyes` / `lonely hands together` / `level up glowing belly`.

**场景：**

```text
Cozy pet home on small asteroid, cream walls, mint floor cushion,
rounded bookshelf left, round window with pastel planets right,
central empty area for character, palette #DDF4FF #43CFC7 #FFD166,
premium 2D kids app background, no text, no characters.
```

---

## 8. 风格统一说明

| 问题 | 建议 |
|------|------|
| 小屋背景偏 3D、角色偏 2D | 正式版二选一：全部轻 3D，或背景重绘为 2D 平涂 |
| 现有 `planet-pet.png` 较简 | 用 `planet_pet_v2_ref.png` 风格替换地图入口 |
| preview 有白底 | 上线前必须透明底；preview 仅作评审 |

---

## 9. 下一步

1. **你确认** 星芽兽三色参考图与统一骨架庆祝 v2 是否定稿  
2. **批量生成** 剩余 4 个 P0 动作参考 + 10 件配饰参考  
3. **抠图导出** preview → `body/` `accessories/` 正式 PNG  
4. **替换** `assets/images/planets/planet-pet.png` 为 v2 正式版  
5. **SVG → PNG** UI 图标导出供小程序使用  

---

## 10. 文件树（当前）

```text
assets/images/pet/
├── LICENSE.md
├── asset-manifest.json
├── previews/          ← 11 张参考图（含 1 张旧庆祝对照）
├── ui/                  ← 13 个 SVG 图标（ready）
├── body/                ← 待正式动画帧
├── accessories/
├── food/
├── toys/
└── rooms/
```
