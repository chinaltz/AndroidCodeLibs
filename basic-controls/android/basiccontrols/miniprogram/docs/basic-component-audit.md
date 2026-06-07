# 小程序基础组件使用审计

## 审计范围

- 主包 `pages/`
- 分包 `packages/`
- 页面 `usingComponents` 声明
- WXML 中的自定义组件标签
- 原生 `button`、`input`、`textarea` 使用点

## 审计结论

1. 所有页面声明的自定义组件都来自 `/basic-controls/components/`。
2. 项目中没有第三方 UI 组件、页面私有组件或 `wx://not-found` 占位组件。
3. 首页任务“开始”已改用 `bc-button`，颜色由主题的 `brandPrimary` 和 `brandDark` 控制。
4. 添加孩子页“保存孩子”已改用 `bc-button`。
5. 首页和设置页统一使用 `bc-bottom-tab`。

## 基础组件清单

- `bc-alert`
- `bc-amount`
- `bc-bottom-tab`
- `bc-button`
- `bc-card`
- `bc-chip`
- `bc-choice-card`
- `bc-choice-chip`
- `bc-icon-button`
- `bc-input`
- `bc-key-value-label`
- `bc-notification`
- `bc-pin-input`
- `bc-progress`
- `bc-stepper`
- `bc-sticky-footer`
- `bc-text-link`
- `bc-top-bar`

## 保留的原生控件

`pages/input-diagnostic/index` 保留原生 `input`、`textarea` 和 `button`。

这是专门用于复现和定位 iPad 输入法卡死的诊断页面。若替换成 `bc-input` 或其他封装组件，将无法区分问题来自原生控件、组件封装还是页面业务逻辑，因此不纳入业务页面组件统一改造。

基础组件内部允许使用小程序原生控件。例如 `bc-input` 内部根据场景使用原生 `input` 和 `textarea`，对业务页面仍提供统一的主题、事件和属性接口。
