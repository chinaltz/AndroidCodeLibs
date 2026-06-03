# 音标星球二期 · 技术方案实现文档

## 1. 技术目标

在现有微信小程序基础上扩展二期能力：

- 多孩子本地档案。
- 每个孩子独立音标进度、生字、错字、听写记录。
- 错字重复错误计数。
- 本地听写提醒。
- A4 默写纸图片导出，后续扩展 Word/PDF。

约束：

- 不接服务器。
- 不做账号。
- 不上传孩子数据。
- 继续使用现有基础组件库。

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
pages/words/index             # 生字积累
pages/words/edit              # 新增/编辑生字
pages/mistakes/index          # 错字本
pages/dictation/index         # 听写提醒与选字
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
    "pages/words/index",
    "pages/words/edit",
    "pages/mistakes/index",
    "pages/dictation/index",
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
      "words": [
        {
          "id": "word_1710000000001",
          "text": "慢",
          "pinyin": "man",
          "source": "语文课本",
          "group": "一年级下",
          "status": "practice",
          "createdAt": 1710000000001,
          "updatedAt": 1710000000001,
          "lastPracticedAt": null
        }
      ],
      "mistakes": [
        {
          "id": "mistake_1710000000002",
          "text": "慢",
          "pinyin": "man",
          "source": "听写",
          "wrongCount": 2,
          "status": "practice",
          "createdAt": 1710000000002,
          "updatedAt": 1710000000003,
          "lastWrongAt": 1710000000003,
          "lastPracticedAt": null
        }
      ],
      "dictations": [
        {
          "id": "dictation_1710000000004",
          "title": "本周听写",
          "itemIds": ["word_1710000000001", "mistake_1710000000002"],
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

## 5. 存储 API 设计

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

## 6. 错字计数算法

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

## 7. 听写提醒算法

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

## 8. 拼音生成方案

首版建议：

- 允许家长手动输入拼音。
- 对单字使用本地小型拼音映射表自动补全。
- 多音字只给第一个候选，并在 UI 上允许编辑。

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

## 9. A4 默写纸导出方案

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

## 10. UI 组件使用

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
| `word-row` | 生字/错字列表项 | 业务组件 |
| `worksheet-preview` | A4 预览 | 业务组件，内部使用 Canvas |

不建议新增基础组件，除非多个业务页面都复用且语义稳定。

## 11. 开发顺序

1. 存储结构升级和迁移。
2. 孩子管理页。
3. 首页孩子切换和音标进度按孩子隔离。
4. 生字积累 CRUD。
5. 错字本和又错一次计数。
6. 听写提醒计算和首页展示。
7. A4 默写纸图片导出。
8. 设置页增加数据导出和清空入口。

## 12. 测试清单

多孩子：

- 新增第一个孩子后自动设为当前孩子。
- 两个孩子音标进度互不影响。
- 切换孩子后首页统计、生字、错字全部刷新。

错字：

- 第一次写错新增错字。
- 同一个字又错一次只增加计数，不新增重复项。
- 标记已掌握后不再进入提醒。

提醒：

- 3 天未练习的普通字进入提醒。
- 高频错字 1 天未练习进入重点提醒。
- 听写后提醒数量下降。

导出：

- 12、16、20、24 项都能生成图片。
- 小屏手机 A4 预览不溢出。
- 保存相册失败时有明确提示。

兼容迁移：

- 旧 `phonics_progress.doneIds` 能迁入默认孩子。
- 旧主题和语言设置不丢失。
- 没有任何旧数据时能正常创建新孩子。
