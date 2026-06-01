---
name: kuikly-phonics-migration
description: 音标星球 Kuikly 迁移助手。用于把 Android 基础组件、微信小程序组件和音标星球业务迁移到 Kuikly/KMP，覆盖 shared 目录结构、主题 token、国际化 JSON、48 音标数据、内置音频、录音/播放 Module、多端目标 Android/iOS/鸿蒙/H5/微信小程序/PC 的迁移边界。
---

# 音标星球 Kuikly 迁移助手

## 使用顺序

1. 同时使用官方 Kuikly Skills：
   - `kuikly-ui-framework`：页面、组件、布局、路由。
   - `kuikly-assets-resource`：内置音频和图标资源。
   - `kuikly-expand-api`：播放、录音、存储等平台能力。
   - `kuikly-multi-module-config`：拆分基础组件和业务模块。
2. 先迁移跨端业务模型，再迁移 UI 组件，最后接入平台 Module。
3. 不要把 Android View 或微信小程序 WXML/WXSS 逐行翻译；以 Kuikly commonMain 为唯一业务源。

## 目标模块

```text
kuikly/
├── shared/                 # Kuikly/KMP 业务模块
│   └── src/commonMain/
│       ├── kotlin/com/techfun/phonics/
│       │   ├── controls/   # 基础组件迁移
│       │   ├── data/       # 48 音标、例词、题库
│       │   ├── modules/    # Audio/Recorder/Storage Module 封装
│       │   ├── theme/      # sky/night/mint/sunrise token
│       │   └── pages/      # Map/Learn/Check/Settings
│       └── assets/
│           ├── audio/
│           └── common/
├── androidApp/             # Android Kuikly 宿主
├── miniApp/                # 微信小程序 Kuikly 宿主 dist
├── iosApp/                 # 后续 iOS 宿主
├── ohosApp/                # 后续鸿蒙宿主
└── h5App/                  # 后续 PC/Web 宿主
```

## 第一阶段范围

- 基础组件：Button、Card、TopBar、BottomTab、Chip、Progress、Alert。
- 业务页面：首页音标地图、学习页、过关检查页、设置页、主题页、语言页。
- 平台能力：音频播放、录音、轻量存储。
- 资源：复用现有合规 MP3，放入 `shared/src/commonMain/assets/audio`。

## 迁移原则

- 主题和文案继续使用项目内 JSON/token，不使用 Android/iOS 原生国际化。
- 音频仍保持离线内置，遵守 `compliant-app-audio` 的合规规则。
- 首页音标点击只播放，底部“开始学习”进入学习页。
- 滚动区域必须由 Kuikly Flex/LazyColumn 确定高度，不能写死状态栏和底部安全区。
- 录音不是 commonMain 直接调用平台 API，必须通过 Kuikly Module。
- 微信小程序和 H5/PC 可以先以 Kuikly Web/Miniapp Beta 作为验证目标，保留当前原生小程序作为回退版本。

## 验证

- Android：先保证现有 `:phonicsapp:assembleDebug` 不受迁移目录影响。
- Kuikly：新增 Gradle 工程后分别验证 `shared` JS bundle、Android 宿主、miniApp dist。
- 功能抽查：48 音标列表、单音标播放、例词播放、三题过关、录音回放、主题切换、语言切换。
