# 音标星球二期 · 多孩子与默写练习原型

## 范围

这个原型用于评审二期产品方向：

- 本地孩子档案。
- 首页孩子切换。
- 生字积累。
- 错字本和错误次数。
- 久未听写提醒。
- A4 默写纸导出入口。

## 打开方式

浏览器打开：

```text
prototypes/phonics-learning-planet-v2/index.html
```

## 交互

顶部标签可切换：

- 首页
- 孩子
- 生字
- 错字
- 默写纸

按钮交互只模拟关键状态，不连接真实小程序数据。

## UI 约束

原型按现有小程序基础组件语义设计：

- 顶部栏对应 `bc-top-bar`
- 内容块对应 `bc-card`
- 主操作对应 `bc-button`
- 状态对应 `bc-chip`
- 进度对应 `bc-progress`
- 提醒对应 `bc-alert`

正式实现时优先复用 `basic-controls/android/basiccontrols/miniprogram/basic-controls/components/`。
