# 音标星球音频来源方案

## 一键生成（推荐 · 合规）

```bash
cd basic-controls/android/basiccontrols/phonicsapp
./tools/generate_compliant_audio.sh
```

详细步骤见 **[docs/AUDIO_PRODUCTION.md](docs/AUDIO_PRODUCTION.md)**。

来源：

- 音标：MIT [s5s5/phonics](https://github.com/s5s5/phonics) + Piper 缺口占位
- 例词：Piper `en_GB-alan-medium`（MIT）
- **不含** Edge-TTS / 云 API

旧脚本 `generate_bundled_audio.sh` 已转发到合规脚本。

## 结论

一期要求：

- 音频内置
- 免费
- 不侵权
- 纯单机

最稳方案仍然是：

```text
项目自录音频 → 签署录音授权 → 放入 assets/audio → 随 App 打包
```

如果一定要用 TTS 生成文件，推荐只使用**本地开源 TTS**，不要使用公共云 API 作为正式素材来源。

## 为什么不推荐公共 API

公共 TTS API 常见问题：

1. 免费额度不是永久免费，后续可能收费或限流。
2. 输出音频是否允许“保存后内置到 App 分发”，取决于服务条款。
3. API 供应商可能变更条款。
4. 儿童学习产品需要稳定音色和清晰发音，公共免费接口质量不可控。
5. 一旦依赖线上 API，就不再是纯单机。

## Android 系统 TTS 可以做什么

Android `TextToSpeech` 支持 `synthesizeToFile`，可以把文本合成为文件。

适合：

- 开发阶段占位
- 用户本机临时生成
- 辅助验证播放流程

不适合：

- 作为正式内置音频来源
- 把生成文件保存后随 App 分发

原因：不同手机使用的 TTS 引擎和声音包不同，授权也不同。我们无法统一确认再分发权。

## 推荐的 TTS 备选：Piper 本地生成

Piper 是本地 TTS 引擎，原 `rhasspy/piper` 项目是 MIT License；`rhasspy/piper-voices` 在 Hugging Face 上标注 MIT。使用前仍要逐个确认具体 voice/model card，因为有些第三方声音来自 CC BY 或其他数据集，需要署名或有额外限制。

合规使用条件：

1. 只下载许可证明确允许商用和分发的 voice。
2. 优先选 Public Domain / CC0 / MIT 的 voice。
3. 保存 voice 下载链接、模型卡、许可证截图。
4. 保存生成脚本和输入文本，保证可追溯。
5. 不使用 voice cloning，不模仿名人、老师、主播或儿童真实声音。

## Piper 生成流程

### 1. 准备本地工具

示例：

```bash
pipx install piper-tts
```

如果 macOS 安装失败，改用 Linux/CI/Docker 生成音频，再把生成结果提交到项目。

### 2. 准备 voice

只允许使用许可证明确的 voice，例如：

```text
voice: en_US-xxx
license: MIT / CC0 / Public Domain
source: 保存模型页 URL
```

不要只看“平台可下载”，必须看 voice/model card。

### 3. 生成音频

建议生成 `.wav` 后再转 `.mp3` 或 `.m4a`。

```bash
piper \
  --model path/to/voice.onnx \
  --config path/to/voice.onnx.json \
  --output_file src/main/assets/audio/words/cat.wav \
  <<< "cat"
```

## 音标音频的现实问题

TTS 对普通单词表现较好，但对 `/æ/`、`/θ/`、`/ð/` 这种单独音标不一定稳定。

所以建议：

- 音标标准音：优先自录。
- 例词音频：可以考虑 Piper 本地生成，但必须检查发音质量和许可证。
- 过关题音频：优先复用音标标准音和例词音频。

## 最小落地方案

第一批只录或生成 10 个音标：

- `/ɪ/`
- `/e/`
- `/æ/`
- `/ʌ/`
- `/ɒ/`
- `/ʊ/`
- `/ə/`
- `/iː/`
- `/ɑː/`
- `/ɔː/`

每个音标：

- 1 条标准音
- 3 条例词

共 40 条音频。先验证孩子是否能听懂、愿意跟读，再补齐完整 192 条。

## 文件放置规则

```text
src/main/assets/audio/
├── phonemes/
│   ├── ae.mp3
│   └── ...
└── words/
    ├── cat.mp3
    └── ...
```

代码已按这个目录读取。文件不存在时只提示“音频待录制”，不会联网。

## 授权记录模板

每批音频必须保存一份记录：

```text
批次：
日期：
来源：自录 / Piper / CC0
录音人或模型名称：
许可证：
来源链接：
允许用途：免费使用 / 商用 / 修改 / 分发 / App 内置
备注：
```

如果是自录，录音人确认：

```text
我授权“音标星球”项目永久、免费、可商用地使用、复制、修改、剪辑和分发这些录音。
```

