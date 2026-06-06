# 音标星球二期 · 字词星球原型

## 打开方式

浏览器直接打开：

```
prototypes/phonics-learning-planet-v2/index.html
```

---

## 一、产品范围

| 模块 | 状态 | 说明 |
|------|------|------|
| 添加孩子 / Onboarding | ✅ 原型完成 | 选头像、输昵称、保存进首页 |
| 首页 | ✅ 原型完成 | 孩子信息、今日数据、星球入口 |
| 音标星球 | ✅ 原型完成 | 48 音标地图（保留 V1 闭环） |
| 字词星球 | ✅ 原型完成 | 见下方详细说明 |
| 孩子管理 | ✅ 原型完成 | 添加、切换、编辑昵称 |
| 听写列表 | ✅ 原型完成 | 课本/错词/字词库统一加入，支持增删改 |
| 听写播放 | ✅ 原型完成 | 间隔、重复次数、速度 |
| 听写批改 | ✅ 原型完成 | 逐词正确/错误、选择具体错字、结果结算 |
| 错字统计 | ✅ 原型完成 | 折线图 + 错字排行 |
| A4 默写纸 | ✅ 原型完成 | 范围选择、预览、导出入口 |
| 拼音星球 | 🔜 Coming soon | |
| 积分星球 | 🔜 Coming soon | |

---

## 二、字词星球 · 交互方案

### 2.1 字词列表页（`wordPlanet`）

- 顶部数据卡：待复习数、今日听写数、最高错次
- 快捷入口：添加字词 / 课本听写 / 听写列表
- **不会的字**：关联词语、错误次数（动态更新）
- **听写词列表**：filter 栏（待复习 / 高频错字 / 已掌握 / 本周新增）
- **全部生字词库**：按周分组，支持搜索

### 2.2 批量录入页（`wordEdit`）

#### 录入流程

```
① 输入框输入词语（逗号/顿号/空格分隔）
        ↓
② 所有字自动平铺展开（char-pool）
        ↓
③ 点击某个字 → 加入下方「判断列表」
        ↓
④ 对每个字选择「会」或「不会」
        ↓
⑤ 所有字都判断完 → 出现「保存」按钮
        ↓
⑥ 点保存 → 写入已保存列表 + 不会字库
   已保存的字在平铺区变灰不可再点
```

#### 字平铺区（`char-pool`）

| 状态 | 样式 |
|------|------|
| 默认（未选） | 灰色边框，可点击 |
| 已加入判断队列（`in-queue`） | 蓝色边框，不可重复点击 |
| 已保存（`is-saved`） | 浅灰，disabled |

#### 判断列表（`judge-list`）

每行结构：`[字图标]  [会]  [不会]`

- 点「会」→ 字图标变绿，按钮高亮
- 点「不会」→ 字图标变红，按钮高亮
- 所有行都选完后，末尾追加「保存」全宽按钮

#### 保存逻辑

- 按词分组（同一词的多个字一起处理）
- 不会字 → 写入「不会的字」关联表，错误次数 +1
- 整词 → 写入「已保存词汇」列表（带颜色标记）
- 全部会写 → 标注「仅听写」
- 保存后判断列表清空，可继续添加下一批字

### 2.3 课本听写页（`textbookDictation`）

- 依次选年级 / 册别 / 单元
- 课文范围支持“某一课 / 选择几课 / 整个单元”
- 当前选择会实时展示范围摘要和汇总字词数量
- 展示本课生字 + 课内/不超纲生词
- 勾选后加入听写 或 保存到字词库

### 2.4 听写列表与批改闭环

```
从课本 / 错词 / 字词库选择
  → 加入统一听写列表
  → 增删改并确认
  → 听写播放
  → 逐词批改
  → 错误词选择具体错字
  → 保存结果
  → 只重听本次错词
```

- `dictationList`：本次听写列表，统一承接各处选词并提供增删改。
- `dictationPlayer`：播报设置和队列。
- `dictationCorrection`：完整词正确/错误判断，错误时选择具体字。
- `dictationResult`：展示已有错字计数变化、新增错字和再次听写入口。
- 原型中的批改按钮和具体错字按钮可点击切换状态。

---

## 三、数据模型（原型级）

```
字 (Character)
  - char: string          // 汉字
  - word: string          // 所属词
  - status: 'pending' | 'known' | 'unknown'
  - saved: boolean

词 (Word)
  - word: string
  - chars: Character[]
  - unknownChars: string[]  // 不会字列表

不会字关联 (unknownRelations)
  - [字]: { wrongCount: number, correctCount: number, words: string[] }

听写记录 (DictationSession)
  - status: 'ready' | 'playing' | 'awaiting_grade' | 'graded'
  - items: DictationItem[]

批改项 (DictationItem)
  - text: string
  - addedFrom: 'mistake' | 'textbook' | 'library' | 'manual' | 'retry'
  - result: 'pending' | 'correct' | 'wrong'
  - wrongChars: Array<{ index: number, char: string }>
```

---

## 四、UI 组件映射

原型按现有小程序基础组件语义设计，正式实现时复用：

```
basic-controls/android/basiccontrols/miniprogram/basic-controls/components/
```

| 原型元素 | 对应组件 |
|----------|----------|
| `.card` | `bc-card` |
| `.btn` | `bc-button` |
| `.chip` | `bc-chip` |
| `.progress` | `bc-progress` |
| `.topbar` | `bc-top-bar` |

---

## 五、原型约束

- 所有交互为前端模拟，无真实数据持久化
- 拼音显示为占位文字「自动生成拼音」，实际需接入拼音库
- 听写播放为 UI 模拟，语音能力通过独立适配层实现，不在产品原型中绑定厂商
- 图片导出为 UI 入口，实际需接入 Canvas / html2canvas
