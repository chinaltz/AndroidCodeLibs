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

复制 checklist 并逐项执行：

```
- [ ] 1. 确认清单（manifest）：id、音标、例词
- [ ] 2. 评估现有 MP3 来源（ffprobe 看 encoder，Lavf 多为 ffmpeg/Edge）
- [ ] 3. 安装依赖：ffmpeg、piper-tts
- [ ] 4. 下载 voice（setup_piper_voice.py，国内走 hf-mirror）
- [ ] 5. 生成：generate_compliant_audio.py --force
- [ ] 6. 写 THIRD_PARTY_NOTICE + audio_generation_record.json
- [ ] 7. 抽查播放：音标须为孤立音素，非整词
- [ ] 8. 重新编译安装 App 验证
```

### 一键命令（phonicsapp）

```bash
cd basic-controls/android/basiccontrols/phonicsapp
./tools/generate_compliant_audio.sh
```

首次若缺 Piper：

```bash
python3 -m pip install --user piper-tts -i https://pypi.tuna.tsinghua.edu.cn/simple
brew install ffmpeg
```

## 国内网络故障速查

| 报错 | 原因 | 处理 |
|------|------|------|
| `huggingface.co port 443` 超时 | 国内直连 HF 不稳定 | **优先 `hf-mirror.com`**（setup 脚本已默认） |
| `github.com` 超时 | GitHub 慢/被墙 | `ghproxy.com` 前缀；或 pip 装 piper-tts 代替二进制 |
| `pip ReadTimeout` | PyPI 慢 | `-i https://pypi.tuna.tsinghua.edu.cn/simple` |
| `libespeak-ng.1.dylib` 缺失 | 只拷了 piper 二进制 | 用 **`python3 -m piper`**（pip 版），或解压完整 piper_dist |
| MIT 音素下载失败 | GitHub raw 超时 | 重试；或手动放到 `tools/.phonics_audio_cache/mit/` |

**原则**：国内环境 **不要死磕 huggingface.co / github.com 直连**；镜像 → pip 替代 → 手动下载 → CI/Linux 生成后提交 mp3。

## 合规检查清单

生成完成后确认：

- [ ] 无 Edge-TTS / Lavf 批量例词（除非用户明确仅临时调试）
- [ ] 音标文件播的是 **孤立音素**，不是例词整读
- [ ] `THIRD_PARTY_NOTICE.md` 含 s5s5 MIT + Piper MIT 声明
- [ ] `audio_manifest.json` 记录来源
- [ ] 8 个英式缺口音标（/ʌ/ /ɒ/ /ɜː/ 等）正式版建议改 **真人短录**

## 扩展到新项目

1. 复制 `phonics_audio_manifest.json` 结构（id / symbol / words）
2. 建立 `PHONEME_MIT` 映射表（开源包文件名 → 本地 id）
3. 缺口音标用 `PHONEME_PIPER_TEXT` 或自录路径
4. 例词统一 Piper 同一 MIT voice，保证音色一致
5. Android：`androidResources { noCompress "mp3" }` 避免 assets 被压缩

## 禁止事项

- 用 Edge-TTS / 云 API 生成后 **提交到 assets 并上架**
- 用例词 MP3 **冒充** 音标 MP3
- 跳过 THIRD_PARTY_NOTICE 直接分发 MIT 素材
- 网络失败时改用 macOS `say` 并当作正式素材

## 交付物

向用户汇报时需包含：

1. **来源表**：每类音频用的许可证
2. **生成命令**：实际跑过的命令
3. **待人工项**：需自录的缺口、需试听抽查的条目
4. **下一步**：重新编译安装 + 模拟器媒体音量提醒

详细步骤见 [reference.md](reference.md)。
