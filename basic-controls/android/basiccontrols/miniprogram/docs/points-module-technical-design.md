# 学习星球 · 积分模块 V1 技术设计

## 1. 目标

在现有微信小程序本地多孩子模型上增加**可配置积分模块**：家长自定义加减分项、四种积分样式标准、日上限与规则健康度、周/月/学期目标；孩子侧查看余额、积分墙与目标进度。

技术闭环：

```text
家长配置 rules + goals + settings
  -> PointsService 记录加减分（校验日上限 / 单项上限）
  -> 更新 wallet / ledger / goalProgress
  -> 页面展示余额、积分墙、流水、目标
  -> （可选 V2）学习事件 / 宠物消费接入同一 wallet
```

约束：

- V1 不接服务器。
- 不破坏现有 `doneIds`、`words`、听写等数据。
- **页面不直接改余额**，统一走 `PointsService.record()`。
- 每个孩子数据完全隔离。
- 四种样式为枚举标准，禁止页面硬编码 emoji。

## 2. 推荐目录

```text
miniprogram/
├── config/
│   ├── points-token-styles.js    # 四种样式标准定义
│   ├── points-rule-templates.js  # 默认模板包（primary_daily 等）
│   ├── points-rewards-catalog.js # 简单礼物兑换
│   └── points-defaults.js        # 日上限 12、目标系数、比例指引
├── components/
│   ├── points-token/             # 样式图标渲染（flower/stamp/star/heart）
│   ├── points-record-grid/       # 快速记录网格
│   ├── points-goal-card/         # 目标进度卡片
│   └── points-health-panel/      # 规则健康度面板
├── pages/
│   ├── points-home/              # 积分首页
│   ├── points-record/            # 快速记录
│   ├── points-rules-edit/        # 规则管理
│   ├── points-goals/             # 目标管理
│   ├── points-ledger/            # 积分流水
│   ├── points-onboard/           # 首次引导
│   └── points-help/              # 使用说明
├── utils/
│   ├── points-service.js         # 记录、余额、流水、兑换
│   ├── points-rule-service.js    # 规则 CRUD、健康度计算
│   ├── points-goal-service.js    # 目标 CRUD、进度、归档
│   └── points-migration.js       # schema 升级
└── assets/images/points/
    ├── flower.png                # 可选位图；V1 可用 emoji + CSS
    ├── stamp.png
    ├── star.png
    └── heart.png
```

## 3. 积分样式技术标准

`config/points-token-styles.js`：

```js
module.exports = {
  flower: {
    id: 'flower',
    label: '小红花',
    emoji: '🌸',
    assetKey: 'flower',
    accentColor: '#ff8eae',
    softColor: '#ffe8ef',
  },
  stamp: {
    id: 'stamp',
    label: '小印章',
    emoji: '🔖',
    assetKey: 'stamp',
    accentColor: '#ff9d59',
    softColor: '#fff6d3',
  },
  star: {
    id: 'star',
    label: '小星星',
    emoji: '⭐',
    assetKey: 'star',
    accentColor: '#e99e14',
    softColor: '#fff6d3',
  },
  heart: {
    id: 'heart',
    label: '小心心',
    emoji: '❤️',
    assetKey: 'heart',
    accentColor: '#ff6b8a',
    softColor: '#ffe8ef',
  },
};
```

规范：

| 规则 | 说明 |
|---|---|
| 存储 | `settings.tokenStyle` 仅存 `flower \| stamp \| star \| heart` |
| 渲染 | 页面通过 `points-token` 组件读取配置，禁止散落 `🌸` |
| 切换 | 只改展示，不改 `wallet.balance` 与历史流水 |
| 扩展 | 新增样式只改 config + assets，不改 balance 逻辑 |

## 4. 页面路由

在 `app.json` 主包增加：

```json
{
  "pages": [
    "pages/points-home/index",
    "pages/points-record/index",
    "pages/points-rules-edit/index",
    "pages/points-goals/index",
    "pages/points-ledger/index",
    "pages/points-onboard/index",
    "pages/points-help/index"
  ]
}
```

导航：

- 首页 `pages/map/index`：积分星球 `coming: false`，`path: '/pages/points-home/index'`，stat 展示 `{emoji} {balance}`。
- 未完成 onboard 的孩子跳转 `points-onboard`。
- 规则管理入口仅在家长向区域（积分首页底部 / 长按入口）。

## 5. 存储版本

继续使用 `phonics_progress`，根对象 `schemaVersion: 5`，每个孩子 `childData[childId].points`：

```js
{
  schemaVersion: 5,
  currentChildId: 'child_xxx',
  children: [],
  childData: {
    child_xxx: {
      doneIds: [],
      words: [],
      points: { /* 见 §6 */ }
    }
  }
}
```

迁移：`points-migration.js` 在 `storage.load()` 后调用，`< 5` 时为每个孩子惰性初始化 `points`。

## 6. 数据模型

```js
{
  settings: {
    tokenStyle: 'flower',
    dailyEarnCap: 12,
    penaltyNeedConfirm: true,
    onboardCompleted: true,
  },
  wallet: {
    balance: 42,
    lifetimeEarned: 86,
    lifetimeSpent: 0,
    lifetimePenalty: 12,
  },
  rules: {
    bonus: [
      {
        id: 'bonus_hw',
        name: '按时完成作业',
        value: 2,
        dailyMax: 1,
        note: '',
        enabled: true,
        sortOrder: 1,
        autoTrigger: null,       // V2: 'phonics_first_pass' 等
        createdAt: 1780617600000,
      },
    ],
    penalty: [
      {
        id: 'penalty_sleep',
        name: '拖延睡觉',
        value: 1,
        dailyMax: 1,
        note: '',
        enabled: true,
        sortOrder: 1,
        createdAt: 1780617600000,
      },
    ],
  },
  daily: {
    dateKey: '2026-06-06',
    earnedPoints: 5,
    penaltyPoints: 1,
    countByRuleId: {
      bonus_hw: 1,
    },
    capReached: false,
  },
  goals: {
    weekly: {
      id: 'goal_w_2026w23',
      name: '本周自律星',
      target: 35,
      rewardNote: '周末多玩 30 分钟',
      periodStart: '2026-06-02',
      periodEnd: '2026-06-08',
      status: 'active',
      progressPoints: 12,
    },
    monthly: { /* 同上结构 */ },
    semester: {
      id: 'goal_s_2026spring',
      name: '三年级上学期',
      target: 500,
      rewardNote: '买一本喜欢的书',
      periodStart: '2026-02-17',
      periodEnd: '2026-07-04',
      status: 'active',
      progressPoints: 128,
    },
  },
  tokenWall: [               // 最近样式记录，仅存 delta 序列
    { recordId: 'rec_1', delta: 2, createdAt: 1780617600000 },
  ],
  ledger: [
    {
      id: 'ledger_xxx',
      recordId: 'rec_xxx',
      type: 'earn',          // earn | penalty | spend
      ruleId: 'bonus_hw',
      ruleNameSnapshot: '按时完成作业',
      pointsDelta: 2,
      balanceAfter: 42,
      operator: 'parent',    // parent | child | system
      dateKey: '2026-06-06',
      createdAt: 1780617600000,
    },
  ],
  schemaVersion: 1,
}
```

### 6.1 关键约束

- `wallet.balance >= 0`。
- `ledger.recordId` 在孩子维度唯一。
- `ledger` 最多 300 条；超出丢弃最旧，**不改** `lifetime*` 汇总。
- 规则删除后流水保留 `ruleNameSnapshot`。
- `daily.dateKey` 变更时重置 `daily`（保留 `goals` 周期统计逻辑独立）。

## 7. 规则健康度算法

`points-rule-service.js`：

```js
function calcTheoreticalMax(bonusRules) {
  return bonusRules
    .filter((r) => r.enabled)
    .reduce((sum, r) => sum + r.value * (r.dailyMax || 1), 0);
}

function calcRuleHealth(bonusRules, dailyEarnCap) {
  const theoreticalMax = calcTheoreticalMax(bonusRules);
  const ratio = theoreticalMax / dailyEarnCap;
  if (ratio > 1.3) {
    return {
      status: 'loose',
      theoreticalMax,
      suggestions: buildLooseSuggestions(bonusRules, dailyEarnCap),
    };
  }
  if (ratio < 0.5) {
    return {
      status: 'strict',
      theoreticalMax,
      suggestions: buildStrictSuggestions(bonusRules, dailyEarnCap),
    };
  }
  return { status: 'balanced', theoreticalMax, suggestions: [] };
}
```

建议生成（纯函数，不写库）：

- **偏宽松**：找 `value × dailyMax` 最大的加分项，建议 value - 1 或 dailyMax - 1。
- **偏严格**：建议将最低分值项 +1，或提示增加 1 个 +1 分日常项。

## 8. 目标建议算法

`config/points-defaults.js`：

```js
module.exports = {
  dailyEarnCapDefault: 10,
  goalFactors: {
    weekly: 5 * 0.7,      // 日上限 × 5 × 0.7
    monthly: 4 * 0.9,     // 相对周目标倍数（见 service）
    semester: 4.5,        // 相对月目标倍数
  },
};
```

`points-goal-service.suggestTarget(type, dailyEarnCap, weeklyTarget)`：

```js
const weekly = Math.round(dailyEarnCap * 5 * 0.7);
if (type === 'weekly') return weekly;
if (type === 'monthly') return Math.round(weekly * 4 * 0.9);
return Math.round(weekly * 4 * 0.9 * 4.5);
```

周期边界：

| 类型 | periodStart / periodEnd |
|---|---|
| weekly | 本周一 ~ 本周日（本地时区） |
| monthly | 本月 1 日 ~ 月末 |
| semester | 用户手动设定 |

进度：`goals.*.progressPoints` 在每次 `record()` 后增减（penalty 减少 progress，不低于 0）。

达成：`progressPoints >= target` → `status: 'achieved'`，触发首页庆祝态（local flag，不重复弹）。

## 9. PointsService 核心接口

```js
record(input)                    // 记录加分/减分
getSummary(childId)              // 首页摘要
getWallet(childId)
getLedger(childId, filter)
getTodaySummary(childId)
redeemReward(input)              // V1.1 简单兑换
ensureDailyReset(childId)        // dateKey 变更重置
buildRecordId(parts)
todayKey()
```

### 9.1 record 流程

```js
record({
  childId,
  ruleId,
  ruleType: 'bonus' | 'penalty',
  operator: 'parent',
})
```

```text
ensureDailyReset
  -> 读 rules.bonus|penalty 中 ruleId
  -> 校验 enabled
  -> 校验 daily.countByRuleId[ruleId] < rule.dailyMax（若有）
  -> bonus: 校验 daily.earnedPoints < dailyEarnCap
           pointsDelta = min(rule.value, dailyEarnCap - daily.earnedPoints)
  -> penalty: pointsDelta = min(rule.value, wallet.balance)
  -> 若 pointsDelta <= 0：return { ok: false, reason }
  -> 更新 wallet / daily / goals.progress / tokenWall
  -> 写 ledger（含 ruleNameSnapshot）
  -> trim ledger 300
  -> storage.save 一次写入
  -> return { ok: true, pointsDelta, balanceAfter, goalAchievedIds }
```

### 9.2 返回值

```js
{
  ok: true,
  pointsDelta: 2,
  balanceAfter: 44,
  type: 'earn',
  label: '按时完成作业',
  dailyCapReached: false,
  goalAchieved: ['goal_w_2026w23'],
}
```

## 10. PointsRuleService

```js
listRules(childId, type)
createRule(childId, type, payload)
updateRule(childId, type, ruleId, payload)
deleteRule(childId, type, ruleId)
setTokenStyle(childId, tokenStyle)
setDailyEarnCap(childId, cap)
getRuleHealth(childId)
applyTemplate(childId, templateId)   // onboard 用
```

校验：

- `name` 1~12 字。
- `value` 1~10 整数。
- `dailyMax` 1~5 或 null。
- `dailyEarnCap` 3~30，默认 **12**（见 `points-defaults.js`）。

## 11. PointsGoalService

```js
getGoals(childId)
upsertGoal(childId, type, payload)
archiveGoal(childId, type)
suggestTarget(childId, type)
checkPeriodRollover(childId)     // 周/月到期自动 archived
applyProgress(childId, delta)    // 由 record 内部调用
```

## 12. 组件设计

### 12.1 points-token

| 属性 | 说明 |
|---|---|
| `styleId` | flower / stamp / star / heart |
| `size` | sm / md / lg |
| `showLabel` | 是否显示中文名 |

### 12.2 points-record-grid

| 属性 | 说明 |
|---|---|
| `mode` | bonus / penalty |
| `rules` | 规则数组 |
| `todayCounts` | daily.countByRuleId |
| `capReached` | boolean |

| 事件 | 说明 |
|---|---|
| `record` | `{ ruleId, ruleType }` |

### 12.3 points-goal-card

展示单周期目标进度条、剩余天数、达成态。

### 12.4 points-health-panel

展示 `status`、`theoreticalMax`、`suggestions[]`。

## 13. 页面状态

### 13.1 points-home

`onShow`：

1. `storage.getCurrentChild()`，无孩子 → 返回 map。
2. `!points.settings.onboardCompleted` → redirect onboard。
3. `pointsService.getSummary(childId)`。
4. 若有 `goalAchieved` pending → 展示庆祝 overlay。

### 13.2 points-rules-edit

- 编辑后 debounce 300ms 调用 `getRuleHealth` 刷新面板。
- 样式切换即时预览，点保存写 storage。

### 13.3 points-onboard

步骤：选样式 → 设日上限 → 选模板（可选）→ 设第一个周目标（可选）→ `onboardCompleted: true`。

## 14. 首页 map 集成

```js
const pointsService = require('../../utils/points-service');
const tokenStyles = require('../../config/points-token-styles');

onShow() {
  const child = storage.getCurrentChild();
  const summary = child ? pointsService.getSummary(child.id) : null;
  const style = summary ? tokenStyles[summary.tokenStyle] : tokenStyles.star;
  // planets 中 points:
  // coming: false, path: '/pages/points-home/index',
  // stat: `${style.emoji} ${summary.wallet.balance}`
}
```

## 15. 与学习模块联动（V2 预留）

标准事件结构与旧版 `reward-service` 兼容，但 V1 **不实现**自动发奖。预留：

```js
rules.bonus[].autoTrigger = 'phonics_first_pass';
```

`PointsService.applyAutoEvent(event)` 在 V2 由学习页调用，内部仍走 `record({ operator: 'system' })`。

## 16. 删除孩子

`storage.deleteChild(childId)` 删除 `childData[childId].points` 整对象。

## 17. 测试

### 17.1 单元测试

- `calcTheoreticalMax` / `calcRuleHealth` 三档边界。
- 日上限截断：`rule.value=5` 但只剩 2 额度 → delta=2。
- 减分不超过 balance。
- 单项 dailyMax 生效。
- recordId 幂等（重复 recordId 拒绝）。
- 目标 progress 扣减不为负。
- 周期 rollover 归档。

### 17.2 集成测试

- onboard 完成 → 首页正常。
- 快速记录 → 首页 / 流水 / 目标同步。
- 切换样式 → 图标变、数值不变。
- 切换孩子数据隔离。
- 删除孩子 points 清空。

## 18. 实施顺序

### 阶段 A：底座

1. `points-migration.js` + 数据模型。
2. `points-token-styles.js`、`points-defaults.js`、`points-rule-templates.js`。
3. `points-rule-service.js`、`points-goal-service.js`、`points-service.js`。
4. 单元测试脚本。

### 阶段 B：页面

1. `points-onboard`、`points-home`、`points-record`。
2. `map/index` 入口上线。
3. `points-rules-edit` + 健康度面板。
4. `points-goals`、`points-ledger`、`points-help`。

### 阶段 C：打磨

1. 目标达成庆祝动画。
2. 积分墙渲染优化。
3. 真机触控与性能检查。

## 19. 关键技术决策

| 决策 | 结论 |
|---|---|
| 积分是否页面直改 | 否，统一 `PointsService.record` |
| 样式如何标准化 | config 枚举 + `points-token` 组件 |
| 减分是否允许负余额 | 否，扣至 0 |
| 规则谁可编辑 | 家长向页面；V1 无 PIN |
| wallet 存放 | `childData[childId].points.wallet` |
| storage key | 继续 `phonics_progress`，schemaVersion 5 |
| 日上限 | 默认 **12**，范围 3~30；配合默认模板理论最大约 18，由 cap 截断 |
| 正负比例 | 最大日减分约 4，与 cap 12 约 **3:1**；详见 `points-module-default-rules.md` |
| 默认模板 | `primary_daily` · 配置见 `points-rule-templates.js` |
| 礼物兑换 | `points-rewards-catalog.js`，家长线下兑现 |
| 与学习自动发奖 | V2 预留 autoTrigger，V1 仅手动记录 |
| 流水上限 | 300 条 |

---

**相关文档**

- 默认规则手册：`docs/points-module-default-rules.md`
- 产品需求：`docs/points-module-product-requirements.md`
- 交互原型：`prototypes/points-module-v1/index.html`
