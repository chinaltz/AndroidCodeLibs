# Basic Controls Sample Coverage

Last checked: 2026-05-28

Component contract: `basic-controls/component_contract.json`

| Platform | Sample coverage | Notes |
| --- | ---: | --- |
| React Web | 25 / 25 | 学习 Tab 已改为分组列表；每个组件是一个列表项；每个组件有独立 hash 页面；详情页只展示可看的使用案例、API 标签和技术栈同步标签。 |
| Vue Web | 25 / 25 | 与 React Web 同步：分组列表入口、组件独立页面、只展示可看案例，不展示代码片段。 |
| Android Native | 25 / 25 | 学习页已改为分组列表；每个组件可进入独立详情页；详情页只展示 Android View 可看案例。 |
| Kuikly | 25 / 25 | 学习页已改为分组列表；每个组件可进入独立详情页；当前不具备真实交互的组件用视觉样例占位。 |
| Flutter | 25 / 25 | 已补齐同一套 `Tsp` 组件前缀；学习页为分组列表；每个组件有独立详情案例。 |
| iOS SwiftUI | 25 / 25 | 学习页已改为分组列表；每个组件可进入独立详情页；详情页只展示 SwiftUI 可看案例。 |
| React Native | 25 / 25 | 已迁入当前工程 `basic-controls/react-native/base-widgets/src/starPlanet`；学习页已改为分组列表；每个组件可进入独立详情页。 |

The Web samples are the current reference for full API coverage. Each component has a hash-addressable visual example page such as `web/react/sample/index.html#Button` and `web/vue/sample/index.html#Button`.

Parity status:

- Done now: React Web, Vue Web, Android Native, iOS SwiftUI, Flutter, Kuikly and React Native.
- Remaining risk: Kuikly 的部分平台能力组件当前仍是视觉样例占位，等扩展 Module 接入后再替换为真实交互。
