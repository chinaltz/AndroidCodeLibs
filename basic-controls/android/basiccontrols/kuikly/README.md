# 音标星球 Kuikly 迁移

这个目录用于把现有 Android `phonicsapp`、Android 基础组件库 `basiccontrols`、微信小程序 `miniprogram` 逐步迁移到 Kuikly/KMP。

当前策略：

- `shared/src/commonMain` 放跨端业务、组件、主题、文案和页面。
- Android/iOS/鸿蒙/H5/微信小程序只保留宿主、平台 Module 和打包配置。
- 现有 Android 与微信小程序继续保留，直到 Kuikly 版本覆盖核心流程。

已接入的 Kuikly AI 能力：

- 上游 KuiklyUI-AI Skills 已同步到仓库 `.agents/skills/kuikly-*`。
- 项目专用 Skill：`.agents/skills/kuikly-phonics-migration`。

第一阶段迁移范围：

- 基础组件：Button、Card、TopBar、BottomTab、Chip、Progress、Alert。
- 页面：首页、学习页、过关检查、设置、主题选择、语言选择。
- Module：音频播放、录音、存储。
- 资源：复用现有合规离线音频。
