# 音标星球二期 · 技术方案实现文档

## 1. 技术目标

在现有微信小程序基础上扩展二期能力：

- 多孩子本地档案。
- 每个孩子独立音标进度、生字、错字、听写记录。
- 错字重复错误计数。
- 本地听写提醒。
- 听写列表管理和按间隔顺序播放。
- A4 默写纸图片导出，后续扩展 Word/PDF。

约束：

- 不接服务器。
- 不做账号。
- 不上传孩子数据。
- 继续使用现有基础组件库。

说明：产品和数据层不依赖具体语音厂商，不保存云服务密钥，也不在听写页面展示服务商信息。播放能力通过可替换的语音适配层提供。

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
pages/dictation/list          # 本次听写列表增删改
pages/dictation/player        # 播放和间隔设置
pages/dictation/correction    # 逐词批改和具体错字选择
pages/dictation/result        # 听写结果和再次听写错词
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
          "correctCount": 4,
          "dictationCount": 6,
          "status": "待复习",
          "createdAt": 1710000000001,
          "updatedAt": 1710000000003,
          "lastWrongAt": 1710000000003,
          "lastCorrectAt": 1710000000002
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
          "dictationCount": 6,
          "correctCount": 4,
          "wrongCount": 2,
          "createdAt": 1710000000002,
          "updatedAt": 1710000000003,
          "lastPracticedAt": null
        }
      ],
      "dictations": [
        {
          "id": "dictation_1710000000004",
          "title": "本周听写",
          "sourceType": "mistake",
          "sourceLabel": "错词听写",
          "status": "playing",
          "itemIds": ["word_1710000000002"],
          "createdAt": 1710000000004,
          "finishedAt": null,
          "gradedAt": null
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

批量录入页使用临时字符队列，不需要单独落盘：

```js
{
  wordList: ["时候", "游泳", "慢慢"],
  queuedItems: [
    { id: "时候__0", word: "时候", index: 0, char: "时", status: "known" },
    { id: "时候__1", word: "时候", index: 1, char: "候", status: "unknown" }
  ]
}
```

- 输入文本按空格、逗号、顿号、标点和换行拆分为 `wordList`。
- 每个字符使用 `word + "__" + index` 作为临时唯一标识，重复字不能使用 `indexOf` 推导下标。
- 点击灰色字块时按点击顺序追加到 `queuedItems`，禁止重复追加。
- `queuedItems.status` 取值为 `pending | known | unknown`。
- 保存条件一：涉及的每个词，其全部字符都已进入 `queuedItems`。
- 保存条件二：`queuedItems` 中不存在 `pending`。
- 两个条件同时满足时才展示并响应保存按钮。
- 保存时按 `word` 分组，每个完整词生成一条 `words` 记录。
- 每组中 `unknown` 字按原始 `index` 生成 `unknownChars`，并转换为 `unknownCharacterRefs`。
- 手动录入不提供来源选择，内部统一记录 `sourceType = "manual"` 与 `sourceLabel = "手动录入"`。
- 保存完成后刷新已保存词汇列表，并同步到字词星球的生字词库。

### 4.2 听写记录与批改快照

听写不能只保存 `itemIds`。词语后续可能被编辑或删除，因此每次听写需要保存当时的文本和关联快照：

```ts
type DictationStatus = 'ready' | 'playing' | 'awaiting_grade' | 'graded' | 'cancelled';
type GradeResult = 'pending' | 'correct' | 'wrong';

type DictationSession = {
  id: string;
  childId: string;
  status: DictationStatus;
  intervalSeconds: number;
  repeatCount: number;
  items: Array<{
    wordId?: string;
    text: string;
    pinyin?: string;
    addedFrom: 'mistake' | 'textbook' | 'library' | 'manual' | 'retry';
    sourceLabel?: string;
    linkedCharacterIds: string[];
    result: GradeResult;
    wrongChars: Array<{
      index: number;
      char: string;
      characterId?: string;
    }>;
  }>;
  startedAt?: number;
  finishedAt?: number;
  gradedAt?: number;
  gradingRevision: number;
};
```

约束：

- 同一听写列表允许混合多种来源，每一项用 `addedFrom` 记录加入位置。
- `items` 保存听写开始时的快照，批改时不依赖当前词库文本。
- 听写开始前允许增删改 `items`；开始后锁定快照，不再同步字词库变化。
- 编辑列表项只更新当前会话副本，不覆盖 `words` 原记录。
- 相同 `wordId` 不能重复加入；没有 `wordId` 时按规范化 `text` 去重。
- `wrongChars` 使用 `index + char` 标识，正确处理“慢慢”这类重复字。
- `status = graded` 且 `gradedAt` 非空表示已结算，普通保存请求必须拒绝重复结算。
- 如后续支持修改已保存结果，必须先按上一版快照反向撤销计数，再应用新结果，并递增 `gradingRevision`。

## 5. 听写列表与播放方案

### 5.1 统一听写列表

所有选词入口都只做一件事：把完整词语加入当前孩子的临时听写列表。

```text
课本选词 / 错词推荐 / 字词库勾选 / 手动添加
  ↓
addItemsToDictationDraft
  ↓
统一听写列表
  ↓
增删改并确认
  ↓
创建正式听写会话
```

草稿结构：

```ts
type DictationDraftItem = {
  draftItemId: string;
  wordId?: string;
  text: string;
  pinyin?: string;
  sourceId?: string;
  sourceLabel?: string;
  addedFrom: 'mistake' | 'textbook' | 'library' | 'manual' | 'retry';
  linkedCharacterIds: string[];
  createdAt: number;
};

type DictationDraft = {
  childId: string;
  items: DictationDraftItem[];
  updatedAt: number;
};
```

列表操作：

- 新增：合并新选词并保持原加入顺序。
- 删除：只删除草稿项，不删除教材数据或 `words` 记录。
- 编辑：创建并修改本次听写副本，不回写 `words`。
- 去重：优先按 `wordId` 去重；无 `wordId` 时按去空格后的 `text` 去重。
- 清空：清除当前孩子的听写草稿。
- 开始：校验至少 1 项后，把草稿复制成 `DictationSession.items` 并锁定。

建议存储键：

```text
dictation_draft:{childId}
```

### 5.2 播放适配层

播放页面不感知具体语音厂商、密钥或网络协议，只依赖统一接口：

```ts
interface DictationSpeechAdapter {
  prepare(text: string, options: PlaybackOptions): Promise<PlayableAudio>;
  play(audio: PlayableAudio): Promise<void>;
  stop(): void;
}
```

具体实现可以后续替换为系统朗读、离线音频或其他合规语音能力，但不能影响听写列表、批改和统计的数据结构。

配置字段：

```json
{
  "dictationPlayback": {
    "intervalSeconds": 8,
    "repeatCount": 2,
    "speed": "slow"
  }
}
```

播放流程：

```text
从听写列表创建会话快照
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
- 播放失败时降级为页面文本提示，不阻塞听写流程。
- 启动队列时复制并固定 `intervalSeconds` 和 `repeatCount`，本轮播放不再读取可变页面状态。
- 间隔从当前词最后一遍音频的 `onEnded` 之后开始计算，最后一个词播放后不再额外等待。
- 暂停、退出页面或开始新队列时取消旧定时器，并用 `runId` 阻止旧异步任务回写“听写完成”。

### 5.3 听写批改与统计结算

结算入口接收完整的 `DictationSession.items`，必须在一次本地存储事务中完成。

```ts
type SaveDictationGradeInput = {
  sessionId: string;
  items: Array<{
    wordId?: string;
    result: 'correct' | 'wrong';
    wrongChars: Array<{ index: number; char: string }>;
  }>;
};
```

校验：

1. 会话必须属于当前孩子，状态必须为 `awaiting_grade`。
2. 每个听写项都必须有 `correct` 或 `wrong` 结果。
3. `wrong` 项至少包含一个 `wrongChars`，`correct` 项的 `wrongChars` 必须为空。
4. `index` 必须落在词语文本范围内，并且 `text[index] === char`。
5. 同一项内使用 `index` 去重，不能只按汉字去重。

原子结算规则：

```text
加载 session、words、characters
  ↓
校验 session 未结算
  ↓
逐个更新 word 的 dictationCount / correctCount / wrongCount
  ↓
正确词：其已关联不会字 correctCount +1
  ↓
错误词：选中的具体字 wrongCount +1；不存在则新增并建立关联
  ↓
错误词中已关联但本次未选中的不会字 correctCount +1
  ↓
写入 session.items 批改结果
  ↓
session.status = graded，写入 gradedAt
  ↓
一次 saveStore 持久化
```

统计字段：

```ts
type CharacterStats = {
  wrongCount: number;
  correctCount: number;
  dictationCount: number;
  lastWrongAt?: number;
  lastCorrectAt?: number;
  lastPracticedAt?: number;
};

type WordStats = CharacterStats;
```

`dictationCount` 每次只增加 1，且必须满足：

```text
dictationCount = correctCount + wrongCount
```

普通字本次写对时不创建 `characters` 记录；只有被标为错字时才新增。这样不会字库仍只包含真正需要复习的字。

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

function createDictationSession(childId, input)
function getDictationSession(childId, sessionId)
function markDictationAwaitingGrade(childId, sessionId, finishedAt)
function saveDictationGrade(childId, input)
function listDictationHistory(childId)
function createRetryQueueFromSession(childId, sessionId)
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
- 支持跨周勾选字词，加入统一听写列表。
- 支持“听写本周”和“生成默写纸”。
- 支持“听写已选”，只把已选字词传入听写播报页。

搜索建议：

- 本地数据量可控时直接在小程序端过滤。
- 过滤字段：`text`、`pinyin`、`sourceLabel`、`weekLabel`。
- 搜索不改变原始周分组，只影响可见项和搜索结果区。
- 已选项用 `selectedWordIds` 存在页面状态里，不直接写入持久存储。

## 7. 错字计数与听写批改算法

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
   - `correctCount = 0`
   - `dictationCount = 1`
   - `status = 'practice'`
   - `createdAt = now`
   - `lastWrongAt = now`

听写批改必须使用第 5.6 节的会话结算，不直接循环调用“又错一次”。原因是批改还需要同步更新正确次数、词语次数和会话状态，并保证整次保存幂等。

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

课本筛选状态：

```ts
type TextbookScopeMode = 'single_lesson' | 'multiple_lessons' | 'whole_unit';

type TextbookSelection = {
  grade: number;
  volume: '上' | '下';
  unitId: string;
  mode: TextbookScopeMode;
  lessonIds: string[];
};
```

级联规则：

- 修改 `grade` 或 `volume`：重新加载对应分册，清空原 `unitId` 和 `lessonIds`，默认定位第一单元第一课。
- 修改 `unitId`：课文列表只读取当前单元，清空其他单元的选择。
- `single_lesson`：`lessonIds` 最多 1 项。
- `multiple_lessons`：允许选择当前单元的多个课文，至少 1 项。
- `whole_unit`：`lessonIds` 自动等于当前单元全部可用课文 ID，UI 不再逐课取消。
- 只有 `verified: true` 的课文可进入正式选择结果。

汇总算法：

```text
根据 lessonIds 读取课文
  ↓
合并 newCharacters 和 lessonWords
  ↓
按 text 去重
  ↓
为每个结果保留 sourceRefs[]
  ↓
生成页面汇总和待勾选列表
```

来源结构：

```ts
type TextbookSourceRef = {
  bookId: string;
  unitId: string;
  lessonId: string;
  sourceLabel: string;
};
```

同一个字或词在多篇课文中出现时只生成一个候选项，但 `sourceRefs` 保留全部来源，加入听写列表时随快照保存。

运行期建议：

- MVP 可以直接加载一个大 JS 数据模块。
- 数据量增大后按 `grade + volume` 拆分为 12 个 JS 模块，选择年级和册别后再加载对应分册。
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
11. 统一听写草稿列表和增删改。
12. 播放适配层、间隔配置和暂停恢复。
13. 听写批改与统计结算。
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
- 点击“听写本周”时只取该周字词进入听写列表。
- 能搜索汉字、词语、拼音、课文来源。
- 能跨周选择多个字词，点击“听写已选”进入听写列表。

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
- 2 字以上词语必须逐字选择“会 / 不会”，并按原始下标保存不会字。
- 多文字识别结果可以快速移除候选、只看多字词、全选听写。
- 听写准备词可以不增加错误次数。
- 保存候选词后继续执行教材出处匹配，未匹配时显示“日常”。

听写列表与播放：

- 课本、错词、字词库和手动新增都能加入同一个听写列表。
- 相同词语不会重复加入。
- 删除列表项不删除字词库原记录。
- 编辑列表项只修改本次听写副本。
- 空列表不能开始听写。
- 能配置词语间隔、重复次数和语速。
- 播放队列能按配置等待后播放下一个词。
- 播放能力不可用时不影响查看、修改听写列表和生成默写纸。

导出：

- 12、16、20、24 项都能生成图片。
- 小屏手机 A4 预览不溢出。
- 保存相册失败时有明确提示。

兼容迁移：

- 旧 `phonics_progress.doneIds` 能迁入默认孩子。
- 旧主题和语言设置不丢失。
- 没有任何旧数据时能正常创建新孩子。
