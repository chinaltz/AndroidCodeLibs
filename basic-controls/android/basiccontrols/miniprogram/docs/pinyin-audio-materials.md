# 拼音星球 · 音频物料调研与合规方案

## 1. 结论

首版可使用以下组合：

| 用途 | 建议来源 | 状态 |
|---|---|---|
| 开发原型、音节试听 | `davinfifield/mp3-chinese-pinyin-sound` | 可用，Unlicense |
| 23 声母教学名称音 | 从候选库映射 `bo1/po1/...` | 需教师抽听 |
| 24 韵母教学名称音 | 从候选库映射大部分条目 | `o`、`eng` 需补录 |
| 16 整体认读音节 | 候选库一声音频 | 可用，需统一音色抽听 |
| 正式儿童产品 | 同一位普通话教师全量自录 | 最推荐 |

不建议把 1,632 个文件全部打进小程序。首版只整理学习项和高频拼读所需音频。

## 2. 已核验候选

### 2.1 mp3-chinese-pinyin-sound

- 项目：<https://github.com/davinfifield/mp3-chinese-pinyin-sound>
- 核验提交：`aa25ecce7b7fb02757b2c2b8e3c01aa975812edc`
- 提交日期：2014-04-11
- 许可证：Unlicense / public domain dedication
- 文件数量：1,632 个 MP3
- 音节基数：约 400
- 原始体积：约 34 MB
- 原始规格：MP3、单声道、44.1 kHz、约 128 kbps
- 常见时长：约 0.6-1.3 秒

优点：

- 文件名直接使用数字声调，例如 `ma1.mp3`、`ma2.mp3`。
- 大部分普通话合法音节覆盖四声。
- 许可证清晰，允许修改和商业使用。
- 适合自由拼读和听辨题。

限制：

- 不是专门为小学拼音字母表录制。
- 不提供纯辅音文件。
- 轻声覆盖很少，仅发现少量 `*5.mp3`。
- `o1.mp3`、`eng1.mp3` 不存在。
- 音色和教材口径仍需人工试听，许可证清晰不等于教学质量已验收。

## 3. 教学名称音映射

### 3.1 声母

```text
b=bo1   p=po1   m=mo1   f=fo2
d=de2   t=te4   n=ne4   l=le4
g=ge1   k=ke1   h=he1
j=ji1   q=qi1   x=xi1
zh=zhi1 ch=chi1 sh=shi1 r=ri4
z=zi1   c=ci1   s=si1
y=yi1   w=wu1
```

这些是“教学名称音候选”，不是把辅音声学上切成完全孤立的音素。是否采用 `fo1/fo2`、`de/te/ne/le` 的具体声调，应由项目采用的教材和普通话教师统一确认。

### 3.2 韵母

```text
a=a1      o=待自录   e=e1
i=yi1     u=wu1     ü=yu1
ai=ai1    ei=ei1    ui=wei1
ao=ao1    ou=ou1    iu=you1
ie=ye1    üe=yue1   er=er2
an=an1    en=en1    in=yin1
un=wen1   ün=yun1
ang=ang1  eng=待自录 ing=ying1 ong=weng1
```

### 3.3 整体认读

```text
zhi1 chi1 shi1 ri4 zi1 ci1 si1
yi1 wu1 yu1 ye1 yue1 yuan1 yin1 yun1 ying1
```

## 4. 项目内评审物料包

目录：

```text
materials/pinyin-audio/
├── LICENSE
├── manifest.json
└── mp3/
```

该目录用于产品和教师试听，不是正式发布资产。

当前整理：

- 63 个学习项映射。
- 44 个可复用的唯一候选 MP3。
- `o`、`eng` 标记为 `self_record_required`。

正式接入目录：

```text
packages/pinyin/assets/audio/teaching/
packages/pinyin/assets/audio/syllables/
```

并增加：

```text
packages/pinyin/assets/audio/THIRD_PARTY_NOTICE.md
packages/pinyin/assets/audio/audio-manifest.json
```

## 5. 真人补录清单

### 最低补录

- `o`
- `eng`

### 推荐全量重录

- 23 声母教学名称音。
- 24 韵母。
- 16 整体认读音节。
- 四声示范 `ā á ǎ à`。
- 易混音对比：`b/p`、`d/t`、`n/l`、`z/zh`、`c/ch`、`s/sh`、`an/ang`、`en/eng`、`in/ing`。

录音要求：

- 发音人：普通话一级乙等及以上优先，或小学语文教师。
- 环境：安静房间，同一麦克风、同一距离。
- 原始格式：WAV，48 kHz，24 bit，单声道。
- 每条读 3 遍，后期选择最佳一遍。
- 不添加背景音乐和混响。
- 留存《声音素材录制与使用授权书》。

## 6. 统一处理命令

候选文件转为小程序规格：

```bash
ffmpeg -i source.mp3 \
  -vn -map_metadata -1 \
  -ac 1 -ar 22050 \
  -codec:a libmp3lame -b:a 32k \
  output.mp3
```

检查：

```bash
ffprobe -v error \
  -show_entries format=duration,bit_rate:stream=codec_name,sample_rate,channels \
  -of default=nw=1 output.mp3
```

## 7. 其他来源评估

| 来源 | 结论 |
|---|---|
| Wikimedia Commons / Lingua Libre | 可补单个音节，但每个文件许可证和发音人不同，需要逐文件署名，不适合作为统一主音色 |
| Mozilla Common Voice | 适合语音识别训练，不是整理好的拼音字母教学音频 |
| 云 TTS / Edge-TTS | 可做临时开发试听，不建议生成后打包分发 |
| 系统 TTS / macOS `say` | 只用于本地调试，不作为正式素材 |
| 词典、网课、教材配套 App | 未取得授权不得提取或内置 |

## 8. 上线前检查

- [ ] 63 个学习项均有可播放文件。
- [ ] `o`、`eng` 已由真人补录。
- [ ] 同一组音频响度和头尾静音一致。
- [ ] 教师完成全量试听并签字确认。
- [ ] `THIRD_PARTY_NOTICE.md` 包含仓库、提交和 Unlicense 文本。
- [ ] 自录音频已归档授权书和录音日期。
- [ ] 没有 Edge-TTS、系统 TTS 或来源不明文件混入发布目录。
