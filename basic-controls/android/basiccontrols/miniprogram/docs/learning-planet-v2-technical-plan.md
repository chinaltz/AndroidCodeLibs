# 音标星球二期 · 技术方案实现文档

## 1. 技术目标

在现有微信小程序基础上扩展二期能力：

- 多孩子本地档案。
- 每个孩子独立音标进度、生字、错字、听写记录。
- 错字重复错误计数。
- 本地听写提醒。
- 字词转语音辅助听写播报。
- A4 默写纸图片导出，后续扩展 Word/PDF。

约束：

- 不接服务器。
- 不做账号。
- 不上传孩子数据。
- 继续使用现有基础组件库。

说明：本期只接听写 TTS。语音转文字和图片转文字后续版本再做。生产环境接入云 TTS 时需要轻量服务端或云函数代理，小程序端不能直接暴露云厂商密钥。当前没有后台时，只允许做本机调测配置，密钥保存在小程序本机 storage，不提交到仓库。

## 2. 现有基础

当前小程序目录：

```text
basic-controls/android/basiccontrols/miniprogram/
├── pages/map
├── pages/learn
├── pages/check
├── pages/settings
├── data/phonemes.js
├── utils/storage.js
└── basic-controls/components/
```

现有存储：

```js
const KEY = 'phonics_progress';
```

当前只存全局 `doneIds`、主题和语言。二期需要升级为带版本号、多孩子分区的数据结构。

## 3. 推荐页面结构

新增页面：

```text
pages/children/index          # 孩子管理与切换
pages/textbook-dictation/index # 按课本听写
pages/words/index             # 生字积累
pages/words/add               # 统一添加入口：手动、按课本；语音/拍照后续预留
pages/words/edit              # 新增/编辑生字
pages/words/import            # 语音/图片识别结果确认
pages/mistakes/index          # 错字本
pages/dictation/index         # 听写提醒与选字
pages/dictation/player        # TTS 播报和间隔设置
pages/worksheet/index         # A4 默写纸预览与导出
```

调整页面：

- `pages/map/index`：顶部增加当前孩子切换，进度从当前孩子读取。
- `pages/check/index`：过关结果写入当前孩子的音标进度；如果后续接入听写结果，也走当前孩子。
- `pages/settings/index`：增加孩子管理、本地数据导出、清空数据入口。

`app.json` 增加：

```json
{
  "pages": [
    "pages/map/index",
    "pages/learn/index",
    "pages/check/index",
    "pages/children/index",
    "pages/textbook-dictation/index",
    "pages/words/index",
    "pages/words/add",
    "pages/words/edit",
    "pages/words/import",
    "pages/mistakes/index",
    "pages/dictation/index",
    "pages/dictation/player",
    "pages/worksheet/index",
    "pages/settings/index"
  ]
}
```

## 4. 存储结构

新 key：

```js
const KEY = 'phonics_learning_planet_v2';
```

结构：

```json
{
  "version": 2,
  "currentChildId": "child_1710000000000",
  "children": [
    {
      "id": "child_1710000000000",
      "nickname": "小宝",
      "createdAt": 1710000000000,
      "updatedAt": 1710000000000
    }
  ],
  "childData": {
    "child_1710000000000": {
      "phonics": {
        "doneIds": ["ae", "p"],
        "lastLearnedAt": 1710000000000,
        "lastCheckById": {
          "ae": {
            "result": "passed",
            "updatedAt": 1710000000000
          }
        }
      },
      "characters": [
        {
          "id": "character_1710000000001",
          "text": "候",
          "wrongCount": 2,
          "status": "待复习",
          "createdAt": 1710000000001,
          "updatedAt": 1710000000003,
          "lastWrongAt": 1710000000003
        }
      ],
      "words": [
        {
          "id": "word_1710000000002",
          "text": "时候",
          "pinyin": "shi hou",
          "sourceId": "rj-yw-g1a-u2-l3",
          "sourceLabel": "一年级上 · 第二单元 · 第三课",
          "unknownCharacterRefs": [
            {
              "characterId": "character_1710000000001",
              "text": "候"
            }
          ],
          "needsDictation": true,
          "createdAt": 1710000000002,
          "updatedAt": 1710000000003,
          "lastPracticedAt": null
        }
      ],
      "dictations": [
        {
          "id": "dictation_1710000000004",
          "title": "本周听写",
          "itemIds": ["word_1710000000002"],
          "createdAt": 1710000000004,
          "finishedAt": null
        }
      ]
    }
  },
  "settings": {
    "themeKey": "sky",
    "language": "zh-CN"
  }
}
```

### 4.1 字词关联模型

实际实现采用两个集合：

```json
{
  "characters": [
    {
      "id": "character_hou",
      "text": "候",
      "wrongCount": 2,
      "status": "待复习",
      "lastWrongAt": 1710000000000
    }
  ],
  "words": [
    {
      "id": "word_shihou",
      "text": "时候",
      "pinyin": "shi hou",
      "unknownCharacterRefs": [
        {
          "characterId": "character_hou",
          "text": "候"
        }
      ],
      "needsDictation": true
    }
  ]
}
```

约束：

- `characters.text` 在单个孩子数据内唯一。
- `words` 一条记录对应一个完整听写词。
- `unknownCharacterRefs` 保存听写词到不会字的关联。
- 没有关联的 `words` 是普通听写准备词。
- “又错一次”通过词的 `unknownCharacterRefs` 找到字符记录并增加 `wrongCount`。
- 列表展示时反向聚合，可得到“候关联：时候、等候”。

旧版 `mistakes` 集合不再作为独立真相源，后续迁移时转换为 `characters + words + unknownCharacterRefs`，避免同一错误在多个集合重复维护。

批量录入页使用临时队列，不需要单独落盘：

```js
{
  candidateWords: ["时候", "游泳", "慢慢"],
  clickQueue: ["慢慢", "时候"],
  activeWord: "慢慢",
  characterStates: [
    { index: 0, character: "慢", status: "unknown" },
    { index: 1, character: "慢", status: "known" }
  ]
}
```

- `clickQueue` 按点击顺序追加，禁止重复。
- `characterStates.status` 取值为 `pending | known | unknown`。
- 每次保存当前字后寻找下一个 `pending`。
- 没有 `pending` 时生成一条完整 `word`，并将所有 `unknown` 字转换为 `unknownCharacterRefs`。
- 保存完成后从队列移除当前词，继续处理队首词。

## 5. 听写 TTS API 方案

### 5.1 本期范围和 API 选型结论

本期先不做语音转文字和图片转文字。ASR/OCR 相关页面只保留后续版本方案，不进入本期实现。

截至 2026-06-05，国内可用且适合 MVP 的 TTS 优先级如下：

| 排名 | 推荐服务 | 免费额度判断 | 接入建议 |
|------|----------|--------------|----------|
| 1 | 腾讯云语音合成 TTS | 官方免费资源包文档说明新用户可领取基础/精品音色免费资源包，示例为 600 万调用字符、3 个月有效期。 | 首选。听写是短词播报，缓存后额度更够用。 |
| 2 | 微软 Azure AI Speech TTS | 官方免费层通常为每月 50 万计费字符；中文汉字按 2 个字符计费，实际约 25 万汉字/月。中国大陆生产环境建议评估 Azure 中国区账号和可用区域。 | 长期备选。免费层按月续，适合低频稳定使用；账号和接入门槛高于国内云。 |
| 3 | 讯飞在线语音合成 | 官方文档说明创建应用后默认每日 500 次。 | 备选。中文效果好，但日次数限制更明显。 |
| 4 | 百度智能云语音合成 | 官方文档说明各语音接口有免费调用量，具体额度以控制台为准。 | 备选兜底。接入前确认账号当前免费额度。 |

参考官方入口：

- 腾讯云语音合成：https://cloud.tencent.com/document/product/1073
- Azure AI Speech 定价：https://azure.microsoft.com/pricing/details/cognitive-services/speech-services/
- 百度智能云语音技术：https://cloud.baidu.com/product/speech
- 讯飞开放平台在线语音合成：https://www.xfyun.cn/doc/tts/online_tts/API.html

首版推荐：

```text
文字转声音：腾讯云 TTS
```

原因：

- 国内访问稳定。
- 免费资源包额度相对大，适合 MVP 验证。
- 小程序、云函数、Node 服务端都有成熟签名示例。
- 听写播报不是高并发场景，首版更看重稳定、额度和易接入。
- 微软 Azure 免费层适合做长期低频兜底，但中国大陆可用性要走 Azure 中国区或做网络合规评估。

### 5.2 安全边界

生产环境不能在小程序端直连云厂商 API。

推荐结构：

```text
小程序
  ↓ 发送待播报字词文本
轻量代理服务或云函数
  ↓ 携带 SecretId / SecretKey 调云 API
云厂商 TTS
  ↓ 返回音频地址或音频二进制
代理服务
  ↓ 返回可播放音频
小程序听写播报页
```

### 5.2.1 当前前端调测实现

当前阶段没有后台，先实现“小程序本机临时配置 + 前端签名调用腾讯云 TTS”。

落地范围：

- `pages/dictation-player/index`：听写播报页，支持播报间隔、重复次数、TTS 本机配置。
- `utils/tencent-sign.js`：纯 JS 实现 TC3-HMAC-SHA256 签名，避免引入 Node crypto。
- `utils/tencent-tts.js`：调用腾讯云 `TextToVoice`，把返回 base64 写入小程序临时 mp3 文件。
- `config/tts.js`：只保存公开默认参数，不保存 SecretId / SecretKey。
- SecretId / SecretKey 通过听写页配置弹层写入 `wx.setStorageSync('dictation_tts_config')`。

注意：

- 这只是 MVP 调测方案，不是正式发布方案。
- 不把真实 SecretId / SecretKey 写入代码、文档、Git 历史或截图。
- `.gitignore` 已预留 `**/config/tts.local.js`，如果后续必须做本地文件配置，也不能提交真实密钥。
- 上线前必须把签名和密钥迁到云函数或服务端，并给接口加频控、文本长度限制和缓存。
- 音标星球继续使用 `utils/audio.js` 播放内置音频，TTS 能力新增在 `utils/tencent-tts.js`，不改旧音标学习链路。

腾讯云 TTS 调用参数：

```json
{
  "Action": "TextToVoice",
  "Version": "2019-08-23",
  "Region": "ap-guangzhou",
  "Text": "时候",
  "SessionId": "dictation_...",
  "ModelType": 1,
  "VoiceType": 101001,
  "Codec": "mp3",
  "Speed": 0,
  "Volume": 0
}
```

听写页播放流程：

```text
字词星球选择字词
  ↓
写入本机 dictation_queue
  ↓
进入 pages/dictation-player/index
  ↓
按 repeatCount 调 TTS 合成并播放
  ↓
等待 intervalSeconds
  ↓
播放下一词
```

代理服务职责：

- 保存云厂商密钥。
- 做接口签名。
- 做基础频控，避免免费额度被刷。
- 记录 TTS 调用字符数、调用次数和缓存命中率。
- 免费额度接近上限时停止新合成，回退到手动听写。
- 过滤不需要上传的孩子信息。
- 统一返回小程序需要的数据结构。

### 5.3 接口草案

```ts
type RecognizeSpeechRequest = {
  childId: string;
  filePath: string;
  durationMs: number;
};

type RecognizeImageRequest = {
  childId: string;
  filePath: string;
};

type RecognitionResult = {
  importType: 'speech' | 'image';
  rawText: string;
  confidence?: number;
  groups: RecognitionGroup[];
};

type RecognitionGroup = {
  groupIndex: number;
  groupTitle: string;
  rawText: string;
  candidates: WordCandidate[];
};

type WordCandidate = {
  text: string;
  pinyin?: string;
  groupIndex?: number;
  groupTitle?: string;
  sourceId?: string;
  sourceLabel?: string;
  unknownScope: 'whole_word' | 'chars';
  unknownChars: Array<{ index: number; char: string }>;
  dictationOnly: boolean;
};

type SynthesizeDictationRequest = {
  text: string;
  speed: 'slow' | 'normal';
  voice: 'female_child_friendly' | 'male_child_friendly';
};
```

### 5.4 识别结果选词

处理流程：

```text
ASR/OCR rawText
  ↓
识别失败或部分失败时保留已有 rawText，允许继续录音/补拍/手动粘贴
  ↓
清理空白、去掉无关标点
  ↓
按换行、段落、明显提示词拆成多组
  ↓
家长选择处理某一组、整组加入听写或忽略整组
  ↓
按换行、顿号、逗号、句号、空格切分
  ↓
过滤过短/重复候选
  ↓
优先展示多字词，提供只看多字词/全选听写/清空
  ↓
按本地教材库匹配出处
  ↓
进入确认页
  ↓
家长选择整个词不会写、某些字不会写，或仅作为听写准备词
  ↓
保存字词
```

词语规则：

- 单字：默认 `unknownScope = 'whole_word'`。
- 2-8 字词语：必须让家长确认 `whole_word` 或 `chars`。
- `chars` 模式记录字下标，避免重复字无法区分，例如“慢慢”的第一个“慢”和第二个“慢”。
- `dictationOnly = true` 的候选只加入本次听写，不增加错误次数。
- 新增不会写的字词默认 `wrongCount = 1`。
- 识别文本可以手动编辑，候选词重新生成。
- 多组文本保留 `groupIndex` 和 `groupTitle`，方便回看来源和批量撤销。
- “整组加入听写”只设置 `dictationOnly = true`，除非家长进一步标记不会写的字。
- “忽略本组”只影响本次确认，不删除原始识别文本。

### 5.5 听写 TTS 播报

配置字段：

```json
{
  "dictationPlayback": {
    "intervalSeconds": 8,
    "repeatCount": 2,
    "speed": "slow",
    "voice": "female_child_friendly"
  }
}
```

播放流程：

```text
选择听写字词
  ↓
检查本地是否已有 TTS 缓存
  ↓
没有缓存则调用 TTS 代理合成
  ↓
按 repeatCount 播放当前词
  ↓
等待 intervalSeconds
  ↓
播放下一个词
```

实现注意：

- 词语播报只读词语本身，不读“拼音”和“答案”。
- 可选第二遍读法：“请写：慢慢”，但默认只读词语，避免影响听写。
- TTS 音频按 `text + voice + speed` 生成缓存 key。
- 播放失败时降级为页面文本提示，不阻塞听写流程。

## 6. 存储 API 设计

建议将 `utils/storage.js` 拆成兼容层 + 二期业务 API。

保留旧方法：

- `getCompleted()`
- `setCompleted(ids)`
- `getThemeKey()`
- `setThemeKey(key)`
- `getLanguage()`
- `setLanguage(code)`

新增方法：

```js
function loadStore()
function saveStore(store)
function migrateIfNeeded()

function getChildren()
function getCurrentChild()
function createChild(nickname)
function updateChild(childId, patch)
function switchChild(childId)
function deleteChild(childId)

function getCurrentChildData()
function getCompletedForCurrentChild()
function setCompletedForCurrentChild(ids)

function listWords(childId)
function upsertWord(childId, input)
function markWordMastered(childId, wordId)
function getWordWeekGroups(childId)

function listMistakes(childId)
function addOrIncrementMistake(childId, input)
function incrementMistake(childId, mistakeId)
function markMistakeMastered(childId, mistakeId)

function getDictationReminders(childId, now)
function markPracticed(childId, itemRefs, practicedAt)
```

兼容原则：

- 如果检测到旧 `phonics_progress.doneIds`，首次迁移时创建一个默认孩子“孩子”，把旧进度迁进去。
- 主题和语言迁到 `settings`。
- 迁移完成后不删除旧 key，先保留一个版本，避免回滚时数据丢失。

## 6.1 按周分组的全部生词列表

目标：字词星球除了“待复习/高频错字”等练习视图，还要有一个不受筛选影响的“全部生词 · 按周分组”列表。

分组规则：

- 根据 `createdAt` 计算 `weekKey`，格式建议为 `YYYY-WNN`。
- UI 展示时可把最近两周显示为“本周”“上周”，更早显示为“2026 第 21 周”。
- 手动、语音、拍照、按课本添加的字词都进入周分组。
- `dictationOnly = true` 的词也进入周分组，但不计入待练数量。

分组数据：

```ts
type WordWeekGroup = {
  weekKey: string;
  weekLabel: string;
  count: number;
  pendingCount: number;
  words: WordItem[];
};
```

页面能力：

- 展示每周总数和待练数量。
- 展示本周词语预览。
- 支持按汉字、词语、拼音、课文来源搜索。
- 支持跨周勾选字词，形成临时听写队列。
- 支持“听写本周”和“生成默写纸”。
- 支持“听写已选”，只把已选字词传入听写播报页。

搜索建议：

- 本地数据量可控时直接在小程序端过滤。
- 过滤字段：`text`、`pinyin`、`sourceLabel`、`weekLabel`。
- 搜索不改变原始周分组，只影响可见项和搜索结果区。
- 已选项用 `selectedWordIds` 存在页面状态里，不直接写入持久存储。

## 7. 错字计数算法

输入：

```js
{
  text: '慢',
  pinyin: 'man',
  source: '听写'
}
```

处理：

1. 对 `text` 做 trim。
2. 在当前孩子的 `mistakes` 中查找相同 `text` 且 `status !== 'deleted'` 的记录。
3. 找到则：
   - `wrongCount += 1`
   - `lastWrongAt = now`
   - `updatedAt = now`
   - 如果传入了新拼音或来源，补齐空字段，不覆盖家长手动编辑过的非空字段。
4. 找不到则新增：
   - `wrongCount = 1`
   - `status = 'practice'`
   - `createdAt = now`
   - `lastWrongAt = now`

## 8. 听写提醒算法

建议首版使用简单规则，不引入复杂间隔重复。

```js
function reminderLevel(item, now) {
  const baseTime = item.lastPracticedAt || item.lastWrongAt || item.createdAt;
  const days = Math.floor((now - baseTime) / DAY);

  if (item.status === 'mastered') return 'none';
  if (item.wrongCount >= 3 && days >= 1) return 'important';
  if (days >= 3) return 'due';
  return 'none';
}
```

首页统计：

- `importantCount`：高频错字该复习。
- `dueCount`：普通久未复习。
- `previewItems`：按 important、wrongCount、days 排序取前 5 个。

## 9. 拼音生成方案

首版建议：

- 自动生成参考拼音，允许家长手动修正。
- 对单字和常见词语使用本地小型拼音映射表自动补全。
- 多音字只给参考候选，并在 UI 上允许编辑。
- 不再让家长单独选择音调，音调由文字转拼音能力自动生成。
- 手动录入页面只展示参考拼音输入框，不展示 1-4 声选择器。

目录：

```text
data/pinyin.js
```

接口：

```js
function getPinyinCandidates(text)
function guessPinyin(text)
```

注意：

- 不要联网调用拼音 API。
- 多音字不要假装完全准确，产品文案使用“自动参考拼音，可手动修改”。

## 9.1 内置教材生字库

新增本地数据文件：

```text
data/textbook-words.sample.json   # JSON 结构样例
data/textbook-words.js            # 小程序运行期可 require 的轻量数据
data/textbook-dictation.catalog.sample.json # 1-6 年级按课本听写大 JSON 骨架
```

JSON 结构：

```json
{
  "version": 1,
  "publisher": "人教版/统编版",
  "books": [
    {
      "grade": 1,
      "volume": "上",
      "bookId": "rj-yw-g1a",
      "units": [
        {
          "unitNo": 1,
          "unitTitle": "第一单元",
          "lessons": [
            {
              "lessonNo": 1,
              "lessonTitle": "第一课",
              "sourceId": "rj-yw-g1a-u1-l1",
              "sourceLabel": "一年级上 · 第一单元 · 第一课",
              "verified": false,
              "words": [
                { "text": "天", "pinyin": "tian", "tone": 1 }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

字词记录需要新增来源字段：

```json
{
  "text": "慢",
  "pinyin": "man",
  "tone": 4,
  "sourceId": "rj-yw-g1a-u1-l1",
  "sourceLabel": "一年级上 · 第一单元 · 第一课"
}
```

实现建议：

- 首版用本地静态 JS/JSON，避免网络依赖。
- UI 使用 picker 选择教材来源，点击本课生字后自动填充字、拼音、声调。
- 全量 1-6 年级数据拆分为按年级分包或懒加载数据，避免主包过大。
- 每条课文数据保留 `verified`，只有人工核对过的内容才进入正式发布包。
- 教材数据涉及版本和版权边界，正式商用前需要确认是否允许完整内置分发；无法确认时，只内置家长自录数据或开放导入。

### 9.2 按课本听写大 JSON

`textbook-dictation.catalog.sample.json` 使用一个大 JSON 统一描述 1-6 年级、12 册、单元、课文、生字和课内/不超纲生词。

核心结构：

```json
{
  "books": [
    {
      "bookId": "rj-yw-g1a",
      "grade": 1,
      "volume": "上",
      "title": "一年级上",
      "units": [
        {
          "unitNo": 1,
          "unitTitle": "第一单元",
          "lessons": [
            {
              "lessonId": "rj-yw-g1a-u1-l1",
              "lessonTitle": "第一课",
              "sourceLabel": "一年级上 · 第一单元 · 第一课",
              "verified": false,
              "newCharacters": [
                { "text": "天", "pinyin": "tian", "tone": 1 }
              ],
              "lessonWords": [
                {
                  "text": "天地",
                  "pinyin": "tian di",
                  "source": "lesson",
                  "withinGrade": true
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

字段规则：

- `newCharacters`：本课生字表，只放单字。
- `lessonWords`：听写词语，可以来自课文，也可以是由已学字组成的不超纲词。
- `source`：`lesson` 表示课文中出现；`within_grade` 表示不超纲扩展词。
- `withinGrade`：默认只展示 true；false 只用于数据校验和人工复核。
- `verified`：只有 true 的课文进入正式发布包。

运行期建议：

- MVP 可以直接 require 一个大 JSON。
- 数据量增大后按 `grade + volume` 拆分为 12 个 JSON，进入课本听写页时懒加载。
- 构建时增加校验脚本：检查重复字词、空拼音、未核对课文、`withinGrade: false` 被错误打包。
- 正式数据不从网上爬教材内容；只使用人工录入、授权数据或家长本地导入数据。

## 10. A4 默写纸导出方案

### 9.1 图片导出

微信小程序首版优先做 Canvas 图片导出。

流程：

```text
选择字词
  ↓
生成 A4 逻辑布局
  ↓
Canvas 绘制标题、拼音、练习格、日期
  ↓
wx.canvasToTempFilePath
  ↓
wx.saveImageToPhotosAlbum 或 wx.shareFileMessage
```

推荐尺寸：

```js
const A4 = {
  width: 1240,
  height: 1754,
  paddingX: 88,
  paddingY: 92
};
```

布局：

- 12 个：2 列 x 6 行，适合大格。
- 16 个：2 列 x 8 行。
- 20 个：2 列 x 10 行。
- 24 个：3 列 x 8 行，适合短字词。

练习块：

```js
{
  x,
  y,
  width,
  height,
  pinyinLineHeight: 40,
  writingBoxHeight: 92
}
```

绘制规则：

- 标题居中。
- 孩子昵称、日期放标题下方。
- 拼音使用 32px。
- 默写线使用 2px 灰色。
- 字格可选，默认只画下划线，避免打印太花。
- 长词超过 4 字时整行展示，不参与 3 列布局。

### 9.2 Word/PDF 导出

微信小程序端直接生成 DOCX/PDF 成本高。建议分阶段：

V2.0：

- 只保证图片导出。
- 图片可保存、转发、打印。

V2.1：

- DOCX：使用模板化 XML 或轻量 docx writer，在小程序本地生成 `.docx` 临时文件。
- PDF：优先由 Canvas 图片转 PDF，如果小程序端文件能力不足，先不承诺。

产品文案建议：

```text
先保存为图片。需要 Word/PDF 时，可以在后续版本生成可编辑文件。
```

如果必须首版支持三种格式：

- 图片：小程序内完成。
- Word：小程序内生成简易 DOCX。
- PDF：Canvas 图片嵌入 PDF，需单独评估包体和兼容性。

## 11. UI 组件使用

继续使用现有基础组件：

| 场景 | 组件 |
|------|------|
| 顶部栏 | `bc-top-bar` |
| 页面入口/内容容器 | `bc-card` |
| 主按钮 | `bc-button` |
| 状态标签 | `bc-chip` |
| 进度 | `bc-progress` |
| 警示提示 | `bc-alert` |
| 底部主操作 | `bc-sticky-footer` |
| 底部导航 | `bc-bottom-tab` |

需要新增或扩展的组件：

| 组件 | 用途 | 备注 |
|------|------|------|
| `child-switcher` | 首页孩子切换 | 业务组件，不放基础库 |
| `textbook-picker` | 年级/册别/单元/课文选择 | 业务组件，可复用到新增字词页 |
| `word-row` | 生字/错字列表项 | 业务组件 |
| `word-import-review` | 识别结果候选词确认 | 支持词语内标记不会写的字 |
| `dictation-player` | 听写播报和间隔控制 | 业务组件，封装播放队列 |
| `worksheet-preview` | A4 预览 | 业务组件，内部使用 Canvas |

不建议新增基础组件，除非多个业务页面都复用且语义稳定。

## 12. 开发顺序

1. 存储结构升级和迁移。
2. 孩子管理页。
3. 首页孩子切换和音标进度按孩子隔离。
4. 生字积累 CRUD。
5. 错字本和又错一次计数。
6. 教材出处匹配，匹配不到时标为“日常”。
7. 字词星球统一添加入口：本期手动、按课本；语音/拍照仅展示后续预留。
8. 全部生词按周分组列表。
9. 按课本听写页和 1-6 年级大 JSON 骨架。
10. 听写提醒计算和首页展示。
11. 云函数或轻量代理接入腾讯云 TTS。
12. 听写播报、间隔配置、用量统计和 TTS 缓存。
14. A4 默写纸图片导出。
15. 设置页增加数据导出和清空入口。

## 13. 测试清单

多孩子：

- 新增第一个孩子后自动设为当前孩子。
- 两个孩子音标进度互不影响。
- 切换孩子后首页统计、生字、错字全部刷新。

错字：

- 第一次写错新增错字。
- 同一个字又错一次只增加计数，不新增重复项。
- 标记已掌握后不再进入提醒。

按周分组：

- 全部生词列表能按“本周、上周、更早周”分组。
- 分组内包含手动、按课本添加的字词；语音/拍照添加后续版本接入后也进入分组。
- 每个分组能显示总数、待练数量和词语预览。
- 点击“听写本周”时只取该周字词进入听写队列。
- 能搜索汉字、词语、拼音、课文来源。
- 能跨周选择多个字词，点击“听写已选”进入听写队列。

提醒：

- 3 天未练习的普通字进入提醒。
- 高频错字 1 天未练习进入重点提醒。
- 听写后提醒数量下降。

按课本听写：

- 能切换 1-6 年级和上下册。
- 能按单元、课文展示本课生字和课内/不超纲生词。
- 勾选字词后保存的记录包含 `bookId`、`unitNo`、`lessonId`、`sourceLabel`。
- `verified: false` 的课文在正式构建中不能进入默认候选。
- `withinGrade: false` 的词语默认隐藏。

智能录入：

- 字词星球只有一个添加入口，本期可选择手动或按课本；语音/拍照显示后续预留，不进入流程。
- 手动录入不展示音调选择器，保存参考拼音即可。
- 新增不会写的字词默认错 1 次。
- 语音/拍照识别本期不实现，只保留后续方案文档。
- 识别文本修改后候选词重新生成。
- 2 字以上词语必须能选择“整个词不会写”或“指定字不会写”。
- 多文字识别结果可以快速移除候选、只看多字词、全选听写。
- 听写准备词可以不增加错误次数。
- 保存候选词后继续执行教材出处匹配，未匹配时显示“日常”。

听写播报：

- 能配置词语间隔、重复次数和语速。
- TTS 合成结果按 `text + voice + speed` 缓存。
- 播放队列能按配置等待后播放下一个词。
- TTS 失败时不影响查看听写列表和生成默写纸。

导出：

- 12、16、20、24 项都能生成图片。
- 小屏手机 A4 预览不溢出。
- 保存相册失败时有明确提示。

兼容迁移：

- 旧 `phonics_progress.doneIds` 能迁入默认孩子。
- 旧主题和语言设置不丢失。
- 没有任何旧数据时能正常创建新孩子。
