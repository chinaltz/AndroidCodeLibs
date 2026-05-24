# 内置音频第三方声明

## 音标（phonemes/）

- 主要来源：[s5s5/phonics](https://github.com/s5s5/phonics) `public/sound/*.mp3`
- 许可证：**MIT License**（Copyright (c) 2022 Xiaochao Liu）
- `/ts/`、`/dz/`：由上述 MIT 音素 MP3 拼接
- 少量英式缺口音标（如 `/ʌ/` `/ɒ/` `/ɜː/` 等）：**Piper** 本地合成占位，voice 见下

## 例词（words/）

- 来源：**Piper** 本地 TTS 离线生成
- Voice：`en_GB-alan-medium`（[rhasspy/piper-voices](https://huggingface.co/rhasspy/piper-voices)）
- 引擎：[piper](https://github.com/rhasspy/piper) **MIT License**

## 不包含

- Microsoft Edge-TTS / Azure 神经语音再分发
- macOS 系统 `say` 语音再分发
- 词典 / 网课 / App 解包音频

## 生成命令

```bash
python3 tools/setup_piper_voice.py
python3 tools/generate_compliant_audio.py --force
```

生成记录见 `tools/audio_generation_record.json`。
