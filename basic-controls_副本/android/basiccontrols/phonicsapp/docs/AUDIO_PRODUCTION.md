# 合规内置音频 · 生产指南

目标：**48 音标 + 全部例词** 均可随 App 分发，无 Edge-TTS / 云 API / 解包音频风险。

## 来源一览

| 类型 | 来源 | 许可证 | 能否内置 |
|------|------|--------|----------|
| 音标（大部分） | [s5s5/phonics](https://github.com/s5s5/phonics) | **MIT** | ✅ |
| 音标 `/ts/` `/dz/` | MIT 音素拼接 | MIT | ✅ |
| 音标（8 个英式缺口） | Piper 本地短音 | **MIT**（voice + 引擎） | ✅ 占位 |
| 例词 | Piper `en_GB-alan-medium` | **MIT** | ✅ |
| 自录音 | 团队录制 + 授权书 | 项目自有 | ✅ 最推荐正式版 |

## 一键生成

```bash
cd basic-controls/android/basiccontrols/phonicsapp

# 首次
python3 -m pip install piper-tts
brew install ffmpeg   # 若无

# 下载 MIT voice + 生成全部 mp3
./tools/generate_compliant_audio.sh
```

输出：

```text
src/main/assets/audio/
├── phonemes/*.mp3      # 48 个
├── words/*.mp3         # 115 个（去重）
├── audio_manifest.json
└── THIRD_PARTY_NOTICE.md
```

## 分步说明

### 1. 安装工具

| 工具 | 用途 |
|------|------|
| `piper-tts` | 本地离线 TTS（MIT） |
| `ffmpeg` | wav → mp3 |
| `curl` | 下载 MIT 音素 / voice 模型 |

### 2. 下载 Piper 音色（仅首次）

```bash
python3 tools/setup_piper_voice.py
```

默认：`en_GB-alan-medium`（英式男声，[piper-voices MIT](https://huggingface.co/rhasspy/piper-voices)）。

### 3. 生成音频

```bash
python3 tools/generate_compliant_audio.py --force
```

- `--force`：覆盖已有 mp3（全量替换 Edge-TTS 旧文件时用）

### 4. 试听与验收

1. 重新编译安装 `phonicsapp`
2. 抽查：短元音 `/æ/`、双元音 `/aɪ/`、辅音 `/θ/`、例词 `cat`
3. 8 个 Piper 占位音标若不满意 → **自录替换**对应 `phonemes/*.mp3` 即可，无需改代码

### 5. 上架前

- 保留 `THIRD_PARTY_NOTICE.md`（App 关于页或文档目录引用）
- 保留 `tools/audio_generation_record.json`（生成记录）
- 正式儿童产品建议：**缺口 8 音标改真人短录**

## 8 个建议自录音标（可选升级）

| id | 音标 | 当前占位 |
|----|------|----------|
| v_short | /ʌ/ | Piper "uh" |
| o_short | /ɒ/ | Piper "o" |
| er_long | /ɜː/ | Piper "er" |
| ou | /əʊ/ | Piper "oh" |
| ia | /ɪə/ | Piper "ear" |
| ea | /eə/ | Piper "air" |
| ua | /ʊə/ | Piper "sure" |
| zh | /ʒ/ | Piper "zh" |

自录后覆盖 `src/main/assets/audio/phonemes/{id}.mp3`，更新 `audio_generation_record.json` 备注为 `self_recorded`。

## 不要使用的来源

- Edge-TTS / Azure / 谷歌云 **生成后内置**
- macOS `say`、手机系统 TTS **导出再打包**
- 词典 App、网课、网盘课程 **解包 MP3**

## 故障排查

| 问题 | 处理 |
|------|------|
| `未找到 Piper voice` | 运行 `setup_piper_voice.py` |
| MIT 下载超时 | 多试几次；或浏览器下载 zip 放到 `.phonics_audio_cache/mit/` |
| `huggingface.co` 超时 | **国内正常**，改用 `hf-mirror.com`（脚本已默认优先镜像） |
| Piper 缺 `libespeak-ng` | 推荐 `pip install piper-tts -i https://pypi.tuna.tsinghua.edu.cn/simple` |
| Piper 发音怪 | 例词一般可用；音标缺口改自录 |
| macOS pip 失败 | 在 Linux CI / Docker 生成后提交 mp3 |
