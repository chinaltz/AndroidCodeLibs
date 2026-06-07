# 积分星球 V1 · 交互原型

## 打开方式

浏览器直接打开 `index.html`，推荐宽度 ≥ 1100px。

## 原型范围

对应 PRD：`miniprogram/docs/points-module-product-requirements.md`  
默认规则：`miniprogram/docs/points-module-default-rules.md`

| 屏幕 | 说明 |
|---|---|
| 积分首页 | 样式余额、今日摘要、周期目标、积分墙 |
| 快速记录 | 加分/减分网格，模拟点击记录 |
| 规则管理 | 样式切换、日上限、加减分项编辑、规则健康度 |
| 目标管理 | 周/月/学期目标设定与进度 |
| 积分流水 | 记录列表与筛选 |

## 交互说明

- 左侧导航切换屏幕
- 右侧说明面板随屏幕更新
- 快速记录会更新余额、流水、目标进度
- 规则管理中修改日上限或加分项会实时刷新「规则健康度」
- 样式可在四选一之间切换，全局图标同步变化

## 与技术设计对应关系

| 原型元素 | 技术字段 |
|---|---|
| 🌸⭐🔖❤️ | `tokenStyle: flower \| stamp \| star \| heart` |
| 日上限 | `settings.dailyEarnCap` |
| 加分项卡片 | `rules.bonus[]` |
| 减分项卡片 | `rules.penalty[]` |
| 理论最大日获得 | `ruleHealth.theoreticalMax` |
| 周/月/学期目标 | `goals.weekly \| monthly \| semester` |
