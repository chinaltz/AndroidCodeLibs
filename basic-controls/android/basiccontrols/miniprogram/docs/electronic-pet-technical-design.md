# 学习星球 · 电子宠物模块 V1 技术设计

## 1. 目标

在现有微信小程序本地多孩子模型上增加电子宠物模块，并把音标、拼音、听写的完成事件统一接入奖励系统。

技术闭环：

```text
学习模块产生标准事件
  -> RewardService 幂等结算
  -> 更新 XP / 星星积分 / 今日任务
  -> PetService 计算等级与状态
  -> 页面展示奖励和宠物反馈
```

约束：

- V1 不接服务器。
- 不破坏现有 `doneIds`、字词和听写数据。
- 不让页面直接修改积分余额。
- 所有物品、等级和奖励规则使用静态配置。
- 每个孩子的数据完全隔离。

## 2. 推荐目录

```text
miniprogram/
├── config/
│   ├── pet-levels.js
│   ├── pet-rewards.js
│   └── pet-shop.js
├── data/
│   └── pet-catalog.js
├── pages/
│   ├── pet-adopt/
│   ├── pet-home/
│   ├── pet-tasks/
│   ├── pet-wardrobe/
│   ├── pet-shop/
│   └── pet-growth/
├── utils/
│   ├── pet-service.js
│   ├── reward-service.js
│   ├── daily-task-service.js
│   └── pet-migration.js
└── assets/images/pet/
    ├── body/
    ├── accessories/
    ├── food/
    ├── toys/
    ├── rooms/
    └── ui/
```

## 3. 页面路由

```json
{
  "pages": [
    "pages/pet-adopt/index",
    "pages/pet-home/index",
    "pages/pet-tasks/index",
    "pages/pet-wardrobe/index",
    "pages/pet-shop/index",
    "pages/pet-growth/index"
  ]
}
```

导航规则：

- 从首页进入时，未领养跳 `pet-adopt`，已领养跳 `pet-home`。
- 学习结算页使用轻量奖励弹层，不强制跳宠物页。
- 商店购买返回装扮间时携带 `itemId`，只做高亮，不自动穿戴。

## 4. 存储版本

当前项目仍使用 `phonics_progress`。宠物模块建议先在同一根对象中增加 `schemaVersion` 和每个孩子的 `pet`，避免同步迁移所有现有页面。

```js
{
  schemaVersion: 3,
  currentChildId: 'child_xxx',
  children: [],
  childData: {
    child_xxx: {
      doneIds: [],
      words: [],
      characters: [],
      pinyinDoneIds: [],
      pet: {}
    }
  },
  settings: {}
}
```

迁移原则：

1. 没有 `schemaVersion` 的数据视为旧版本。
2. 读取宠物数据时惰性初始化，不批量改写所有孩子。
3. 旧的学习字段保持原位。
4. 每次迁移先复制对象再写入，迁移失败保留旧数据。

## 5. 宠物数据模型

```js
{
  profile: {
    adopted: true,
    petId: 'pet_xxx',
    speciesId: 'star_sprout',
    colorId: 'sky_blue',
    name: '芽芽',
    adoptedAt: 1780617600000
  },
  progression: {
    level: 3,
    xp: 126,
    lifetimeXp: 126,
    lastLevelUpAt: 1780704000000,
    claimedLevelRewards: [2, 3]
  },
  wallet: {
    starPoints: 94,
    lifetimeEarned: 154,
    lifetimeSpent: 60
  },
  status: {
    hunger: 72,
    mood: 84,
    energy: 65,
    lastDailyDecayDate: '2026-06-05'
  },
  inventory: {
    ownedItemIds: ['toy_bouncy_ball', 'head_star_clip'],
    consumables: {
      food_star_cookie: 2
    }
  },
  equipped: {
    head: 'head_star_clip',
    neck: '',
    back: '',
    hand: '',
    room: 'room_default'
  },
  daily: {
    date: '2026-06-05',
    taskIds: ['learn_one', 'dictation_five', 'cross_module'],
    progressByTaskId: {
      learn_one: 1,
      dictation_five: 0,
      cross_module: 1
    },
    completedTaskIds: ['learn_one'],
    rewardPointsGranted: 13,
    rewardXpGranted: 8,
    completedModuleIds: ['phonics']
  },
  milestones: {
    unlockedIds: ['first_phonics_pass'],
    recentIds: ['first_phonics_pass']
  },
  ledger: [
    {
      id: 'ledger_xxx',
      eventId: 'phonics:first_pass:ae:child_xxx',
      type: 'earn',
      source: 'phonics_first_pass',
      xpDelta: 12,
      pointsDelta: 8,
      createdAt: 1780617600000
    }
  ],
  schemaVersion: 1
}
```

`speciesId` 首版枚举：

```js
star_sprout // 星芽兽，支持 sky / mint / sunset
star_fox    // 星绒狐，V1 仅支持 orange
```

配饰目录共用，但每个物品需在适配配置中声明两个宠物的锚点：

```js
anchors: {
  star_sprout: { x: 0.5, y: 0.22, scale: 1 },
  star_fox: { x: 0.5, y: 0.18, scale: 0.92 }
}
```

### 5.1 关键约束

- `progression.xp` 和 `lifetimeXp` V1 保持一致，预留未来赛季但不实现。
- `wallet.starPoints >= 0`。
- `ownedItemIds` 只存永久物品；消耗品放 `consumables`。
- `equipped` 中的物品必须已拥有且槽位匹配。
- `ledger.eventId` 在单个孩子下唯一。
- `ledger` 最多保留 200 条，超出后保留聚合总数和最近记录。

## 6. 静态配置

### 6.1 等级

```js
module.exports = [
  { level: 1, totalXp: 0, rewardPoints: 0, unlockIds: [] },
  { level: 2, totalXp: 40, rewardPoints: 10, unlockIds: ['feature_play'] },
  { level: 3, totalXp: 100, rewardPoints: 15, unlockIds: ['feature_wardrobe'] },
  { level: 4, totalXp: 180, rewardPoints: 15, unlockIds: ['head_star_clip'] }
];
```

运行时通过累计 XP 查表，不使用浮点公式。

### 6.2 商品

```js
{
  id: 'head_star_clip',
  type: 'accessory',
  slot: 'head',
  title: '星星发卡',
  price: 80,
  minLevel: 4,
  assetKey: 'accessory_head_star_clip',
  tags: ['starter', 'blue']
}
```

### 6.3 奖励规则

```js
{
  eventType: 'phonics_check_completed',
  variant: 'first_pass',
  xp: 12,
  points: 8,
  dailyLimit: null,
  dedupeScope: 'child_item_lifetime'
}
```

配置和业务代码分开，便于后续调整经济系统。

## 7. 标准学习事件

各学习页面不直接调用 `addPoints(8)`，只提交事实：

```js
{
  eventId: 'phonics:first_pass:ae:child_xxx',
  type: 'phonics_check_completed',
  childId: 'child_xxx',
  moduleId: 'phonics',
  itemId: 'ae',
  result: 'passed',
  isFirstPass: true,
  completedAt: 1780617600000,
  metadata: {
    correctCount: 3,
    totalCount: 3
  }
}
```

拼音：

```js
{
  type: 'pinyin_check_completed',
  moduleId: 'pinyin',
  itemId: 'initial_b',
  result: 'passed',
  isFirstPass: true
}
```

听写：

```js
{
  type: 'dictation_completed',
  moduleId: 'dictation',
  itemId: 'dictation_xxx',
  result: 'completed',
  metadata: {
    itemCount: 8,
    reviewedByParent: false
  }
}
```

## 8. RewardService

公共接口：

```js
grantLearningReward(event)
getRewardPreview(event)
hasGranted(eventId, childId)
getLedger(childId, options)
```

处理流程：

```text
验证 childId 和 event
  -> 查询 ledger.eventId
  -> 已存在：返回原结算结果
  -> 匹配奖励配置
  -> 检查每日奖励上限
  -> 计算 XP / 积分
  -> 更新钱包和经验
  -> 处理升级
  -> 更新今日任务
  -> 写入 ledger
  -> 一次性保存完整 childData
```

返回值：

```js
{
  granted: true,
  duplicated: false,
  xpDelta: 12,
  pointsDelta: 8,
  oldLevel: 2,
  newLevel: 3,
  levelUpRewards: [
    { level: 3, points: 15, unlockIds: ['feature_wardrobe'] }
  ],
  completedDailyTaskIds: ['learn_one']
}
```

### 8.1 幂等

必须先根据 `eventId` 查流水。页面重进、网络恢复回调或双击按钮都返回同一结果。

事件 ID 生成规则：

```text
首次过关：module:first_pass:itemId:childId
每日复习：module:review:itemId:childId:YYYY-MM-DD
听写完成：dictation:completed:dictationId:childId
今日首次学习：daily:first_learning:childId:YYYY-MM-DD
```

## 9. PetService

公共接口：

```js
getPetState(childId)
adoptPet(input, childId)
renamePet(name, childId)
applyDailyReset(childId, date)
feedPet(foodId, childId)
playWithPet(toyId, childId)
purchaseItem(itemId, childId)
equipItem(itemId, childId)
unequipSlot(slot, childId)
```

### 9.1 购买事务

```text
读取最新宠物数据
  -> 校验商品存在
  -> 校验等级
  -> 校验未拥有
  -> 校验余额
  -> 扣积分
  -> 加入库存
  -> 写支出流水
  -> 保存
```

任何一步失败都不修改余额。

### 9.2 喂养事务

- 状态已满时先返回，不消耗。
- 有库存则扣库存。
- 无库存且允许直接购买时，购买和使用在同一次保存中完成。
- 新手免费喂养使用唯一事件 ID，不进入普通每日免费逻辑。

## 10. 今日任务服务

```js
getOrCreateDailyTasks(childId, date, capabilities)
applyLearningEventToTasks(event, petData)
claimTaskReward(taskId, childId)
```

推荐任务奖励在完成时自动入账，因此 `claimTaskReward` 只用于兼容未来手动领取，不作为 V1 页面主流程。

任务生成输入：

```js
{
  phonicsEnabled: true,
  pinyinEnabled: false,
  dictationEnabled: true,
  completedCounts: {
    phonics: 18,
    pinyin: 0
  }
}
```

生成规则：

- 1 个快速学习任务。
- 1 个当前最需要的模块任务。
- 1 个跨模块或复习任务。
- 不生成用户无数据可完成的任务。

## 11. 页面状态设计

### 11.1 pet-home

`onShow`：

1. 读取当前孩子。
2. 未领养时 `redirectTo pet-adopt`。
3. 执行一次 `applyDailyReset`。
4. 读取今日任务和最近目标。
5. 组合身体、配饰和状态资源。

页面只保存临时动画态：

```js
{
  reaction: 'idle',
  modal: '',
  selectedItemId: '',
  isSubmitting: false
}
```

### 11.2 奖励弹层

奖励弹层可做通用组件：

```text
components/learning-reward
```

属性：

- `xpDelta`
- `pointsDelta`
- `levelUp`
- `petName`
- `reactionAsset`

事件：

- `close`
- `goPet`

## 12. 资源组合

V1 推荐分层渲染，不为每件配饰导出整只宠物合成图：

```text
room background
  -> pet body/state image
  -> back accessory
  -> neck accessory
  -> head accessory
  -> hand accessory
  -> foreground decoration
```

每个配饰配置统一锚点：

```js
{
  anchor: {
    x: 0.5,
    y: 0.22,
    scale: 1
  }
}
```

如果首版只用固定正面姿势，可先使用一套全局锚点。进入多动作动画后，需要按动作定义锚点或将配饰一起制作到动画帧中。

## 13. 性能与包体

- 宠物首页首屏资源建议小于 800 KB。
- PNG/WebP 单张控制在 150-250 KB。
- 商店缩略图使用独立小图，不加载大图。
- 动画首版优先 4-6 帧 WebP 或序列帧，避免视频。
- 房间背景和非首屏配饰放分包或首次进入商店时加载。
- 资源清单带版本号，缺失时回退默认身体和房间。

## 14. 测试

### 14.1 单元测试

- 奖励规则匹配。
- 每日上限。
- 重复事件幂等。
- 等级查表和跨多级升级。
- 购买余额校验。
- 已满状态不消费。
- 穿戴槽位校验。
- 日期回拨和跨日温和重置。

### 14.2 集成测试

- 音标过关 -> 奖励 -> 宠物首页更新。
- 拼音过关与音标事件 ID 不冲突。
- 听写 4/5/10 项对应正确奖励档位。
- 切换孩子后钱包、宠物和库存隔离。
- 删除孩子后宠物数据同步删除。
- 升级过程中关闭页面，重进不重复奖励。

### 14.3 真机检查

- 低端 Android 首次进入加载时间。
- iOS/Android 透明 PNG 边缘。
- 微信缓存清理后的引导。
- 44 px 以上触控区域。
- 配饰在不同屏幕尺寸下不漂移。

## 15. 实施顺序

### 阶段 A：数据和奖励底座

1. 增加宠物存储模型和迁移。
2. 实现等级、商品、奖励静态配置。
3. 实现 RewardService 幂等流水。
4. 给音标结算接入标准事件。
5. 为拼音和听写预留/接入事件。

### 阶段 B：最小宠物体验

1. 领养页。
2. 宠物小屋。
3. XP、积分和状态展示。
4. 喂养和默认玩具。
5. 学习奖励弹层。

### 阶段 C：装扮和长期目标

1. 商店。
2. 背包和穿戴。
3. 等级解锁。
4. 成长手册。
5. 资源缺失降级和完整测试。

## 16. 关键技术决策

| 决策 | 结论 |
|---|---|
| 积分是否由页面直接修改 | 否，统一走 RewardService/PetService |
| 经验能否消费 | 否 |
| 状态是否实时按分钟下降 | 否，只在跨日首次进入时温和处理 |
| 奖励是否手动领取 | 学习奖励自动入账 |
| 商品是否随机 | 否，固定价格购买 |
| 配饰是否导出整宠物图 | 否，V1 固定姿势分层叠加 |
| 是否新建独立 storage key | 暂不，先扩展现有每孩子数据 |
