# 内置音频第三方声明

## 音标（phonemes/）

- 当前 48 个音标 MP3 已全部替换为用户提供的 `/Users/litingzhe/Downloads/基础音标_mp3_mp4.zip` 音频。
- 映射来源：压缩包内 `01.zip` 至 `48.zip` 的同名主音频 `NN/NN.mp3`。
- 处理方式：使用 `ffmpeg` 转为 mono、22.05 kHz、32 kbps MP3，去除元数据，降低包体积。
- 状态：需项目侧确认并留存可内置分发授权或来源说明；这些音标文件当前不再按 MIT/Piper 来源声明。

## 例词（words/）

- 来源：**Piper** 本地 TTS 离线生成
- Voice：`en_GB-alan-medium`（[rhasspy/piper-voices](https://huggingface.co/rhasspy/piper-voices)）
- 引擎：[piper](https://github.com/rhasspy/piper) **MIT License**

## 不包含

- Microsoft Edge-TTS / Azure 神经语音再分发
- macOS 系统 `say` 语音再分发
- 词典 / 网课 / App 解包音频

## 手动替换项

- 全部 48 个音标：用户提供 `基础音标_mp3_mp4.zip`，按传统 48 音标编号和项目 48 音标 id 映射覆盖。
- 已覆盖目录：Android `phonicsapp`、原生微信小程序、Kuikly shared、Kuikly miniApp dist、`audio-kokoro`。
- 状态：需项目侧确认并留存可内置分发授权。

## 生成命令

```bash
ditto -x -k /Users/litingzhe/Downloads/基础音标_mp3_mp4.zip /tmp/phonics_audio_zip
ffmpeg -i NN.mp3 -vn -map_metadata -1 -ac 1 -ar 22050 -codec:a libmp3lame -b:a 32k {phoneme_id}.mp3
```

生成记录见 `tools/audio_generation_record.json`。
