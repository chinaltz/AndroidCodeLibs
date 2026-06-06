# 拼音星球 V1 · 技术设计文档

## 1. 设计目标

在不破坏现有音标星球和字词星球的前提下，增加一套独立的拼音学习链路：

```text
拼音地图 -> 单项学习 -> 自由拼读 -> 三题过关 -> 当前孩子进度
```

实现优先复用：

- `bc-top-bar`
- `bc-card`
- `bc-button`
- `bc-chip`
- `bc-progress`
- `utils/audio.js`
- 现有录音权限和回放流程

## 2. 页面结构

```text
packages/pinyin/pages/index                # 拼音星球地图
packages/pinyin/pages/pinyin-learn/index   # 单项学习
packages/pinyin/pages/pinyin-blend/index   # 自由拼读
packages/pinyin/pages/pinyin-check/index   # 三题过关
```

路由参数：

```text
/packages/pinyin/pages/pinyin-learn/index?id=initial_b
/packages/pinyin/pages/pinyin-check/index?id=initial_b
/packages/pinyin/pages/pinyin-blend/index?initial=m&final=a
```

## 3. 数据结构

### 3.1 学习项

```js
{
  id: 'initial_b',
  kind: 'initial',
  symbol: 'b',
  groupId: 'lips',
  order: 1,
  audioId: 'bo1',
  audioMode: 'teaching_name',
  mouthTip: '双唇先闭紧，再突然放开，气流较弱。',
  compareIds: ['initial_p'],
  examples: [
    { display: 'b + a = ba', syllableId: 'ba1', tone: 1 },
    { display: 'b + o = bo', syllableId: 'bo1', tone: 1 }
  ]
}
```

`audioMode`：

- `teaching_name`：声母/韵母教学名称音。
- `syllable`：完整音节。
- `self_recorded`：项目真人自录。

### 3.2 分组

```js
{
  id: 'lips',
  title: '嘴唇小队',
  description: 'i u ü 和 b p m f',
  itemIds: ['final_i', 'final_u', 'final_v', 'initial_b']
}
```

### 3.3 拼读组合

```js
{
  initial: 'm',
  final: 'a',
  displayBase: 'ma',
  audioIds: {
    1: 'ma1',
    2: 'ma2',
    3: 'ma3',
    4: 'ma4'
  }
}
```

合法组合不要通过字符串猜测，使用静态表或构建期生成表。

## 4. 推荐目录

```text
miniprogram/
├── data/
│   ├── pinyin-units.js
│   ├── pinyin-combinations.js
│   └── pinyin-tones.js
├── packages/pinyin/
│   ├── pages/
│   │   ├── index.*
│   │   ├── pinyin-learn/
│   │   ├── pinyin-blend/
│   │   └── pinyin-check/
│   └── assets/audio/
│       ├── teaching/
│       ├── syllables/
│       ├── THIRD_PARTY_NOTICE.md
│       └── audio-manifest.json
└── utils/
    ├── audio.js
    └── pinyin-learning.js
```

## 5. 存储设计

当前 `doneIds` 属于音标星球，拼音不能复用该字段。

建议每个孩子的数据增加：

```js
{
  pinyinDoneIds: [],
  pinyinLastUnitId: '',
  pinyinMistakes: {
    initial_b: 2,
    final_eng: 1
  },
  pinyinPracticeLog: [
    {
      unitId: 'initial_b',
      correctCount: 2,
      wrongCount: 1,
      completedAt: 1780000000000
    }
  ]
}
```

存储 API：

```js
getPinyinCompleted(childId)
setPinyinCompleted(ids, childId)
getPinyinLastUnit(childId)
setPinyinLastUnit(id, childId)
recordPinyinMistake(unitId, childId)
appendPinyinPracticeLog(result, childId)
```

## 6. 音频设计

### 6.1 路径

```js
function pinyinTeachingPath(audioId) {
  return `/packages/pinyin/assets/audio/teaching/${audioId}.mp3`;
}

function pinyinSyllablePath(audioId) {
  return `/packages/pinyin/assets/audio/syllables/${audioId}.mp3`;
}
```

### 6.2 首版物料策略

1. 评审阶段使用已整理的 Unlicense 拼音音节候选包。
2. 声母使用小学教学名称音映射，例如 `b -> bo1`。
3. 韵母 `i/u/ü` 使用 `yi1/wu1/yu1` 作为名称音候选。
4. `o`、`eng` 候选仓库缺少合适的独立文件，必须真人补录。
5. 上线前由普通话教师统一试听，重点检查声母名称音是否符合本地教材口径。
6. 正式儿童产品优先使用同一发音人全量自录，开源包作为开发和回归基准。

### 6.3 音频规格

- MP3。
- 单声道。
- 22.05 kHz。
- 32-48 kbps。
- 峰值建议 -3 dBFS。
- 头尾静音各 80-150 ms。
- 单文件建议 0.4-1.5 秒。

### 6.4 包体控制

完整候选仓库约 34 MB，不应直接全部进入主包。

V1 建议：

- 拼音页面和音频全部放入 `packages/pinyin` 分包。
- 当前教学名称音 44 个，拼读/示例音节 197 个。
- 当前分包约 1.8 MB，低于微信单分包 2 MB 上限。
- 自由拼读只展示已内置四声音频的 33 组组合。
- 完整合法组合表保留在数据层，后续补音频后再逐步开放。

## 7. 声调显示

不要通过手写字符串替换声调符号。

建议实现：

```js
applyToneMark('ma', 3) // mǎ
applyToneMark('gui', 4) // guì
```

标调规则：

1. 有 `a` 标在 `a`。
2. 没有 `a`，有 `o/e` 标在 `o/e`。
3. `i/u` 并列时标在后一个字母。
4. `ü` 保留两点并添加声调。

数据层同时保存：

```js
{
  numbered: 'ma3',
  marked: 'mǎ',
  base: 'ma',
  tone: 3
}
```

## 8. 自由拼读

### 8.1 合法组合表

```js
const COMBINATIONS = {
  b: ['a', 'o', 'ai', 'ei', 'ao', 'an', 'en', 'ang', 'eng', 'i'],
  m: ['a', 'o', 'e', 'i', 'u', 'ai', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ing'],
  j: ['i', 'ia', 'ie', 'iao', 'iu', 'ian', 'in', 'iang', 'ing', 'ü', 'üe', 'üan', 'ün']
};
```

首版必须使用人工核对的数据表，不能生成不存在的音节。

### 8.2 特殊拼写转换

```text
j/q/x + ü  -> ju/qu/xu
j/q/x + üe -> jue/que/xue
i 零声母   -> yi
u 零声母   -> wu
ü 零声母   -> yu
```

UI 同时展示拆分和规范写法：

```text
j + ü -> ju
```

## 9. 过关逻辑

复用音标星球三步结构，但题库独立：

```js
{
  unitId: 'initial_b',
  listenOptions: ['b', 'p', 'm'],
  blendOptions: ['ba', 'pa', 'ma'],
  recordPrompt: '请跟读 b'
}
```

完成条件：

- 听辨题正确。
- 拼读题正确。
- 已完成一次录音。

错误记录只用于后续推荐，不阻塞孩子继续学习。

## 10. 开发顺序

1. 建立 `pinyin-units.js` 和 63 项内容校验。
2. 增加独立拼音进度存储。
3. 完成拼音地图。
4. 接入教学名称音。
5. 完成单项学习页。
6. 完成三题过关。
7. 完成自由拼读和合法组合表。
8. 加入音频声明、生成记录和试听验收表。

## 11. 测试清单

### 数据

- 声母 23 项、韵母 24 项、整体认读 16 项。
- ID 无重复。
- 每项 `audioId` 对应文件存在。
- 每个示例音节存在于合法组合表。
- 四声标调结果正确。

### 功能

- 切换孩子后进度独立。
- 音标完成数不受拼音进度影响。
- 连续点击音频不会叠音。
- 录音权限拒绝后有明确恢复入口。
- 离线模式全部核心页面可用。

### 真机

- `üǖǘǚǜ` 显示无缺字。
- 低端 Android 连续播放无明显卡顿。
- iPhone 静音模式下符合现有产品播放策略。
- 小程序分包体积和首次加载时间达标。
