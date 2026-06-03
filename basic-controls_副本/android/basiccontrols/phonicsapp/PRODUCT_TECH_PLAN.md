# 音标星球 Android MVP

## 一期产品范围

只做纯单机学习闭环：

```text
48 音标学习地图 → 单音标学习页 → 3 题过关检查 → 点亮关卡
```

暂不做：

- 登录账号
- 家长端
- 付费
- 排行榜
- 老师/班级端
- 线上词库
- AI 语音评分

## 技术实现

- Module：`:phonicsapp`
- 类型：Android application
- UI：Java + classic Android View
- 组件依赖：`:basiccontrols`
- 本地进度：`SharedPreferences`
- 音频播放：`MediaPlayer`
- 网络：不声明 `INTERNET` 权限

## 星球 UI 风格

遵循技趣星球蓝天星球风格：

- 蓝天白云背景
- 云朵白卡片
- 天蓝主色
- 阳光黄高亮
- 青色成功反馈
- 圆润卡片和胶囊按钮

基础按钮、卡片、提示条、徽标、进度条优先复用 `basiccontrols`。

## 音频策略

正式音频只允许两类来源：

1. 项目自录，并保存录音授权。
2. 明确 CC0 / Public Domain 的音频，并保存来源和许可证明。

禁止来源：

- 词典网站抓取
- 教材 App 提取
- 网课/视频截取
- 未确认授权的 Wikimedia/Wiktionary 音频
- 任意线上 TTS 服务批量生成后直接商用

一期代码只从 `assets/audio/` 播放内置音频。文件不存在时提示“音频待录制”，不会联网下载。

目录：

```text
src/main/assets/audio/
├── phonemes/
├── words/
├── README.md
└── audio_manifest.json
```

## 后续录音清单

最小正式包：

- 48 个音标标准音
- 每个音标 3 个例词
- 总计约 192 条短音频

建议先录 10 个音标做可用性测试，再补齐完整 48 音标。
