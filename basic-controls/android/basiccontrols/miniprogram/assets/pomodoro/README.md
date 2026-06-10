# 番茄钟 · 商用 UI 切图

蓝天星球风格，与小程序 `#DDF4FF / #31A8FF / #FFD166` 色板一致。

| 文件 | 尺寸 | 用途 |
|------|------|------|
| `compass-ring.png` | 640×640 | 罗盘外环（刻度圈） |
| `compass-face.png` | 420×420 | 中心表盘底 |
| `compass-pointer.png` | 120×160 | 顶部固定指针 |
| `compass-knob.png` | 128×128 | 外圈旋转抓手 |
| `mascot-tomato.png` | 512×512 | 番茄君 mascot（3D 可爱风） |
| `icon-mute.png` | 128×128 | 静音 |
| `icon-timer.png` | 128×128 | 计时 |
| `icon-alarm.png` | 320×320 | 闹钟弹层 |

首页入口图标：`/assets/icons/module-pomodoro.png`（3D 粘土风，与每日任务卡片一致）

高保真原型：`docs/kids-ui/pomodoro-compass-mockup.png`

## 重新生成切图

```bash
cd basic-controls/android/basiccontrols/miniprogram
node scripts/gen-pomodoro-assets.mjs
```

儿童向蓝天星球配色：橙黄抓手、金色指针、可爱番茄君 mascot。

## 罗盘交互

- 顶部 **金色指针固定**，外圈 **旋转** 对齐刻度
- 范围 **5–90 分钟**，步进 **5 分钟**，松手吸附
- 计时进行中表盘锁定，进度以 `conic-gradient` 外环展示
