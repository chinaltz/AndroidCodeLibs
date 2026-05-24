# 合规 App 内置音频 · 参考细节

## phonicsapp 音标来源映射

40 个来自 MIT s5s5/phonics，2 个拼接，8 个 Piper 占位：

| 缺口 id | 音标 | Piper 占位文本 |
|---------|------|----------------|
| v_short | /ʌ/ | uh |
| o_short | /ɒ/ | o |
| er_long | /ɜː/ | er |
| ou | /əʊ/ | oh |
| ia | /ɪə/ | ear |
| ea | /eə/ | air |
| ua | /ʊə/ | sure |
| zh | /ʒ/ | zh |

`/ts/` = `t.mp3` + `s.mp3`；`/dz/` = `d.mp3` + `z.mp3`

## 检测现有 MP3 是否 Edge-TTS

```bash
ffprobe -hide_banner path/to/file.mp3 2>&1 | grep -i encoder
# Lavf 常见于 ffmpeg 转码的 Edge-TTS 输出
```

## setup_piper_voice 镜像策略

1. Voice：`hf-mirror.com` 优先，其次 `huggingface.co`
2. Piper CLI：GitHub + `ghproxy.com` 备选
3. 推荐引擎：`pip install piper-tts` + `python3 -m piper`（避免 dylib 问题）

Voice 默认：`en_GB-alan-medium`（约 60MB）

## 自录替换流程

1. 录制 0.3–0.8s 孤立音素 WAV/MP3
2. 覆盖 `assets/audio/phonemes/{id}.mp3`
3. 更新 `tools/audio_generation_record.json` 该 id 为 `self_recorded`
4. 无需改 Java/Kotlin 播放代码（路径按 id 不变）

## Android 播放注意

- MediaPlayer 读 assets：先 copy 到 cache 再 play，避免过早 close descriptor
- 模拟器无声：检查媒体音量、是否重装 APK
- `noCompress "mp3"` in `build.gradle` 的 androidResources

## 许可证文案模板

`THIRD_PARTY_NOTICE.md` 至少包含：

- s5s5/phonics MIT（Copyright 2022 Xiaochao Liu）
- Piper + rhasspy/piper-voices MIT
- 生成命令与日期（可选）

## 常见用户诉求 → 动作

| 用户说 | 动作 |
|--------|------|
| 全部换成无风险音频 | 跑合规脚本 + 替换 Edge 文件 |
| 音标播成整词 | 检查 phonemes 是否误用 words；重跑 MIT 映射 |
| HuggingFace 超时 | hf-mirror + 勿反复直连 |
| 模拟器没声音 | 播放逻辑 + 音量，非素材问题 |
| 上架儿童 App | 缺口音标改自录 + 完整 NOTICE |
