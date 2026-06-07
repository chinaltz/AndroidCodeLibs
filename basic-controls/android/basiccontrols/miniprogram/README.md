# 音标星球 · 微信小程序

与 Android `phonicsapp` 同层，功能对齐：

- 48 音标学习地图
- 单音标学习 + 例词播放
- 3 题过关检查（听音 / 看词 / 跟读）
- 设置：主题（天空白天 / 星空夜晚）、多语言
- 纯离线（音频内置）

## 目录结构

```text
miniprogram/
├── basic-controls/          # 基础组件库（对应 Android basiccontrols）
│   ├── components/          # bc-button / bc-card / bc-top-bar …
│   ├── theme/               # sky + night 主题 token
│   └── i18n/                # local.json 文案
├── pages/                   # 音标星球页面
├── data/phonemes.js         # 48 音标数据
├── utils/                   # 音频 / 题库 / 存储
└── packages/phonics-media/assets/  # 音标离线 MP3（分包：phonemes/ + words/）
```

## 快速开始

1. 用 **微信开发者工具** 打开本目录 `miniprogram/`
2. 将 `project.config.json` 里的 `appid` 改成你的小程序 AppID
3. 同步音频：

```bash
chmod +x tools/sync-audio.sh
./tools/sync-audio.sh
```

4. 编译预览

## 提交前质量检查

```bash
./tools/check-quality.sh
```

当前检查项：

- 图片和音频单文件不超过 200K
- `app.json` 已开启 `lazyCodeLoading: requiredComponents`，用于组件按需注入

## 已实现组件（Phase 1）

| 组件 | Android 对应 |
|------|----------------|
| `bc-button` | BasicButton |
| `bc-card` | BasicCardView |
| `bc-top-bar` | BasicTopBarView |
| `bc-bottom-tab` | BasicBottomTabView |
| `bc-progress` | BasicProgressView |
| `bc-alert` | BasicAlertView |
| `bc-chip` | 进度标签 chip |

## 与 Android 差异

- 录音使用 `wx.getRecorderManager()`
- 音频播放使用 `InnerAudioContext`
- 主题切换后 `wx.reLaunch` 刷新全局样式

## 音频说明

小程序包体限制下，开发阶段可先同步部分音频测试；正式发布建议：

- 主包放常用音标，其余走分包或云存储（若后续扩展）
- 音标音频路径：`/packages/phonics-media/assets/phonemes/{id}.mp3`
