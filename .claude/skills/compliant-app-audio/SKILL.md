---
name: compliant-app-audio
description: >-
  为 Android/iOS 应用规划并生成可内置分发的合规离线音频（MIT 素材 + Piper 本地 TTS），
  评估侵权风险、替换 Edge-TTS/云 API/系统 TTS，处理 HuggingFace/GitHub 国内超时、
  Piper 依赖缺失等故障。用户提到内置音频、音标/例词 MP3、音频合规、TTS 再分发、
  hf-mirror、Piper、phonicsapp 时使用。
argument-hint: "[模块路径，如 phonicsapp]"
---

# 合规 App 内置音频

## 目标

产出 **可随 App 打包分发** 的离线 MP3，满足：

- 有明确许可证（MIT / 自录授权 / 项目自有）
- 不依赖 Edge-TTS、Azure、Google Cloud 等 **生成后再内置**
- 不用 macOS `say`、系统 TTS **导出再打包**
- 不解包词典/网课/App 音频

## 决策树（先选来源）

```
需要内置音频？
├─ 孤立音素/音标 → 优先 MIT 开源包（如 s5s5/phonics）或自录
├─ 单词/句子   → Piper 本地 TTS（MIT voice）或自录
├─ 缺口音标    → 自录 > Piper 短音占位 > 禁止用整词冒充音素
└─ 仅开发占位  → 可临时用系统 TTS，但不得提交/上架
```

| 来源 | 许可证 | 能否内置 | 备注 |
|------|--------|----------|------|
| s5s5/phonics 音素 | MIT | ✅ | 保留 MIT 声明 |
| Piper + piper-voices | MIT | ✅ | 本地离线生成 |
| 团队自录 | 自有 | ✅ | 最稳，儿童产品推荐 |
| Edge-TTS / 云 API | 服务条款限制 | ❌ | 不宜正式打包 |
| macOS say / 系统 TTS | 系统许可 | ❌ | 仅本地调试 |

## 本仓库参考实现

模块：`basic-controls/android/basiccontrols/phonicsapp/`

| 路径 | 用途 |
|------|------|
| `tools/generate_compliant_audio.sh` | 一键生成 |
| `tools/generate_compliant_audio.py` | MIT 音标 + Piper 例词 |
| `tools/setup_piper_voice.py` | 下载 voice（优先 hf-mirror） |
| `tools/phonics_audio_manifest.json` | 48 音标 + 例词清单 |
| `docs/AUDIO_PRODUCTION.md` | 详细生产文档 |
| `src/main/assets/audio/THIRD_PARTY_NOTICE.md` | 第三方声明 |

输出：`assets/audio/phonemes/`、`assets/audio/words/`、`audio_manifest.json`

## 标准工作流

```
- [ ] 1. 确认清单（manifest）
- [ ] 2. 评估现有 MP3 来源（ffprobe 看 encoder）
- [ ] 3. 安装依赖：ffmpeg、piper-tts
- [ ] 4. 下载 voice（setup_piper_voice.py，国内走 hf-mirror）
- [ ] 5. 生成：generate_compliant_audio.py --force
- [ ] 6. 写 THIRD_PARTY_NOTICE + audio_generation_record.json
- [ ] 7. 抽查：音标须为孤立音素
- [ ] 8. 重新编译安装 App
```

### 一键命令（phonicsapp）

```bash
cd basic-controls/android/basiccontrols/phonicsapp
./tools/generate_compliant_audio.sh
```

## 国内网络故障速查

| 报错 | 处理 |
|------|------|
| `huggingface.co port 443` 超时 | 优先 **hf-mirror.com** |
| `github.com` 超时 | ghproxy；或 pip 装 piper-tts |
| `pip ReadTimeout` | 清华 PyPI 镜像 |
| `libespeak-ng.1.dylib` 缺失 | 用 `python3 -m piper` |

## 禁止事项

- Edge-TTS / 云 API 生成后提交 assets 上架
- 例词 MP3 冒充音标 MP3
- 跳过 MIT 第三方声明

详细步骤见同目录 [reference.md](reference.md)。
