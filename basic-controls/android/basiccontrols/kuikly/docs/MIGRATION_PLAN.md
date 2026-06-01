# Kuikly 迁移计划

## 现状

- Android 基础组件：Java View 实现，集中在 `basiccontrols/src/main/java/com/techskillplanet/basiccontrols/widget`。
- Android 音标应用：单 Activity，依赖 `basiccontrols`，音频内置在 assets。
- 微信小程序：已有同功能实现，组件在 `miniprogram/basic-controls`，音频内置。

## 目标

用 Kuikly `shared/commonMain` 承载业务和 UI，一套代码覆盖 Android、iOS、鸿蒙、H5/PC、微信小程序。

## 模块切分

| 迁移项 | Kuikly 目标 |
|---|---|
| BasicButton / bc-button | `controls/PhonicsButton.kt` |
| BasicCardView / bc-card | `controls/PhonicsCard.kt` |
| BasicTopBarView / bc-top-bar | `controls/PhonicsTopBar.kt` |
| BasicBottomTabView / bc-bottom-tab | `controls/PhonicsBottomTab.kt` |
| BasicProgressView / bc-progress | `controls/PhonicsProgress.kt` |
| BasicAlertView / bc-alert | `controls/PhonicsAlert.kt` |
| theme token | `theme/PhonicsTheme.kt` |
| local.json | `i18n/PhonicsStrings.kt` |
| data/phonemes.js | `data/PhonemeData.kt` |
| audio.js / Android MediaPlayer | `modules/AudioModule.kt` + 平台实现 |
| RecorderManager / Android recorder | `modules/RecorderModule.kt` + 平台实现 |

## 阶段

1. 建立 Kuikly shared 源码骨架，不接入宿主。
2. 迁移纯 Kotlin 数据、主题、文案、题库逻辑。
3. 迁移基础组件和页面 UI。
4. 建立 Audio/Recorder/Storage Module 协议。
5. Android 宿主接 KuiklyRender，先打开首页。
6. miniApp 宿主生成 dist，与现有小程序对照。
7. iOS/鸿蒙/H5 按 Kuikly 官方 QuickStart 补宿主。

## 保留约束

- 首页音标点击只播放，底部按钮才进入学习页。
- 音频离线内置，不使用云 API。
- 国际化继续使用业务 JSON/key 思路。
- 录音、播放、存储都走 Module，不在 commonMain 写平台 API。
