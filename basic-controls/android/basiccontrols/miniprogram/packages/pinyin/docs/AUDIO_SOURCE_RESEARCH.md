# 拼音音频来源调研

调研时间：2026-06-06

## 采用来源

### hugolpz/audio-cmn（当前主来源）

- 地址：<https://github.com/hugolpz/audio-cmn>
- 许可证：CC BY-SA
- 录音：Chen Wang（1707 音节，64k 品质）
- 用途：46 个教学音 + 197 个四声音节（主音色）
- 同步：`miniprogram/tools/sync-pinyin-audio.sh`

### byhow/yanyu（回退）

- 地址：<https://github.com/byhow/yanyu>
- 许可证：MIT
- 用途：仅 `teaching/o.mp3`、`teaching/eng.mp3`（无声调韵母）

### davinfifield / yanyu 全量（已替换）

- 说明：yanyu TTS 音色与部分呼读音（如 fo2）听感不佳；已由 audio-cmn 真人录音替换

## 未采用来源

- `shikangkai/Chinese-Pinyin-Audio`：音频较全，但仓库没有明确许可证。
- `zispace/hanyu-pinyin-audio`：聚合多个网站和仓库，来源授权不统一。
- `vaebe/pinyin-audio`：包含声母、韵母和整体认读音节，但没有明确许可证。
- 在线词典、教学网站和商业 App：不下载、不解包，避免再分发侵权。

## 包体策略

小程序分包只保留课程会直接使用的教学音和示例音。完整音节库不全部内置，
后续应上传到项目自有对象存储，按音节远程播放并做本地缓存。
