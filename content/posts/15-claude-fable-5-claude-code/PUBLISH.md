# 发布适配清单 · Claude Fable 5

> 审核时间：2026-06-10 
> 文章路径：`content/posts/15-claude-fable-5-claude-code/index.md`

---

## 流水线进度（8 步）

| 步骤 | 状态 | 说明 |
|------|------|------|
| ① 选题确认 | ✅ | 热点解读 + 普通人视角；读者：白领/创作者/小开发者 |
| ② 初稿 | ✅ | 已写入 `index.md`，约 1700 字 |
| ③ 风格润色 | ✅ | 口语化、短句、无「先说人话」套话 |
| ④ 比喻注入 | ✅ | 问朋友 / 资深同事 / 曲速引擎 |
| ⑤ 标题选定 | ⚠️ | 见下方 TOP 3，发布前确认一版 |
| ⑥ 配图方案 | ⚠️ | 正文图 `header.png` / `scene1-before-after.png` 仍缺；搜一搜 5 卡已生成 |
| ⑦ 终审质检 | ✅ | 已按审查意见改 `index.md` |
| ⑧ 发布就绪 | ⚠️ | HTML + DOCX 已导出；待补正文图后跑 `publish:post` |

**当前结论：正文与搜一搜卡就绪；补 2 张正文图后即可多平台发布。**

---

## 审查报告

### 总体评分

文章结构完整、来源可追溯、普通人能读懂核心变化。主要卡点：**配图缺失**、正文内残留**制作提示词**（发布前应删）。时效性强，建议 **6 月 22 日前** 首发。

### 各维度检查结果

| 维度 | 结果 | 问题说明 |
|------|------|----------|
| 原则1：人话优先 | ✅ | Fable/Mythos 用表格和 ASCII 框解释清楚 |
| 原则2：解决问题优先 | ✅ | 开头痛点明确；非程序员有 3 个场景 |
| 原则3：不制造焦虑 | ✅ | 无「不会就完蛋」；强调可选、限时免费 |
| 原则4：明确边界 | ✅ | 定价、护栏降档、yeekal 劝普通用户别硬上 Workflow |
| 原则5：带走东西 | ✅ | 小结 + 3 个提示词 + 今晚可试的一条 |
| 模板结构 | ⚠️ | 缺独立「一句话结论」行；有「今天只需要记住」模板句 |
| 语气 | ✅ | 无敏感套话；emoji 仅 📁×2，未超标 |
| 敏感词 | ✅ | 无网络工具/网络工具/梯子等词 |
| 跨文章链接 | ✅ | 仅纯文本引用《Claude Code 怎么用？…》，无相对路径 |
| 配图 | ❌ | `header.png`、`scene1-before-after.png` 不存在 |
| 发布规范 | ⚠️ | 正文含即梦提示词与 `📁 保存路径`，发布前须删除 |

### 修改优先级

**🔴 必须改（阻塞发布）**

1. **生成并放入 2 张图**：`images/header.png`、`images/scene1-before-after.png`（可用正文即梦提示词）
2. **删正文内制作备注**：第 55–64 行、第 97–105 行的即梦提示词与保存路径块（图就位后删除）
3. **跑导出命令**：`npm run publish:post -- content/posts/15-claude-fable-5-claude-code`

**🟡 建议改（改后更好）**

1. 小结标题「今天只需要记住 3 件事」→「读完后带走这 3 点」
2. 开头第 17 行前加一行独立结论：`一句话结论：Claude Fable 5 让 AI 从「回答问题」变成「独自扛住整块工作」。`
3. 场景二提示词含「搜索小红书」——Fable 5 未必能实时爬取，加注「需配合联网工具或自行粘贴素材」

**🟢 锦上添花**

1. 补一张 ASCII 基准对比表截图或 `overview.png` 信息图（少图策略下可省略）
2. 生成搜一搜 5 卡：`social/wechat-search/cards.json` + 脚本

### 快速改动清单

1. 即梦生成 `header.png` + `scene1-before-after.png` 放入 `images/`
2. 删除正文中两段 `📁` 提示词块
3. 确认主标题（见下）
4. 执行 `npm run publish:post -- content/posts/15-claude-fable-5-claude-code`
5. 公众号后台上传封面 + 正文图，用 `index.html` 一键复制

---

## 标题方案

### 推荐主标题（当前）

**Claude Fable 5 来了：AI 从「帮你干活」升级成「替你扛事」**

### 备选 TOP 3

| 排名 | 标题 | 公式 |
|------|------|------|
| 1 ⭐ | Claude Fable 5 来了：AI 从「帮你干活」升级成「替你扛事」 | 变化对比 |
| 2 | 别搜 Claude Code 5 了：Anthropic 真正发的是 Fable 5 | 反常识 |
| 3 | 6 月 22 日前免费：Claude 最强模型普通人能试什么？ | 时效 + 利益 |

### 短标题（小红书/头条）

- Claude 又发新模型，普通人该关心什么？
- AI 能通宵干活了，你要不要试？

---

## 多平台适配

### 公众号（首发）

**摘要（≤120 字）：**

Anthropic 6 月 9 日发布 Claude Fable 5，不是「Claude Code 5」。核心变化：AI 能长时间自主干活。Pro/Max 用户 6 月 22 日前可免费试。本文用大白话讲清名字、强弱、花钱和今晚就能试的提示词。

**封面建议：**

蓝紫渐变 + 终端窗口 + 紫色 AI 助手指挥小机器人。标题压字：「Claude Fable 5 / AI 替你扛事」。尺寸 900×383。

**话题标签：**

Claude、AI工具、普通人学AI、Claude Code、大模型

**发布方式：**

1. 图片上传素材库
2. 浏览器打开 `index.html` → 一键复制正文
3. 或用 Wechatsync 同步

---

### 知乎

**适合问题：**

- Claude Fable 5 和 Opus 4.8 有什么区别？
- Claude Code 怎么用 Fable 5？
- Anthropic Mythos 级模型普通人能用吗？

**开头引导：**

先说结论：官方没有「Claude Code 5」，新模型叫 Claude Fable 5，属于 Mythos 级。最大变化不是分数高了几个点，而是 AI 能独自扛住长任务——给它目标，你可以走开几小时。

**话题：**

人工智能、Claude、大语言模型、AI 编程、Anthropic

---

### 掘金 / CSDN

**技术标签：**

Claude、Anthropic、AI Agent、Claude Code、大模型

**发布提示：**

- 保留 `/model fable` 命令块和 FrontierCode 对比表
- 标题可用：《别搜 Claude Code 5 了：Fable 5 接入 Claude Code 实操指南》
- CSDN 摘要加关键词：Mythos、Dynamic Workflows、Fable 5 定价

---

### 简书 / 博客园

直接使用 `index.published.md`（跑 `publish:post` 后）或 `index.md`。

---

### 小红书（要点卡片）

| 卡片 | 文案 |
|------|------|
| 1 封面 | Claude 新模型来了 / 不是 Code 5，是 Fable 5 |
| 2 | 3 个名字：Fable=公开版，Mythos=高权限版，Code=工具 |
| 3 | 强在哪：能通宵干活，不是只会聊天 |
| 4 | 限时免费：6/22 前 Pro 用户不加价 |
| 5 | 今晚试：`/model fable` + 让 AI 先出方案别直接改代码 |

话题：#Claude #AI工具 #程序员 #自媒体工具 #大模型

---

### 抖音 / 快手（60–90 秒脚本）

```
【钩子 3s】Claude 又发新模型了，但名字把你绕晕了？

【痛点 10s】很多人搜 Claude Code 5——官方根本没这产品。
真正的新东西叫 Fable 5。

【干货 30s】三个点：
1. AI 从回答问题，变成能独自干几小时
2. 6月22日前，付费用户免费试
3. 有 Claude Code 的，终端输入 /model fable

【收尾 10s】强模型也烧钱，从小任务试起。
详情见置顶图文。
```

---

## 发布前检查清单

### 内容

- [x] 标题吸引非技术读者
- [x] 开头 3 句有场景感
- [x] 有可复用提示词（≥3 个）
- [x] 有小结 + 行动建议
- [x] 无导流口令文案（正文）
- [x] 无敏感词
- [x] 权威链接有效
- [x] 删除正文内即梦制作备注
- [x] 场景二提示词加联网说明
- [x] 小结改为「读完后带走这 3 点」

### 素材

- [ ] `images/header.png`
- [ ] `images/scene1-before-after.png`
- [ ] 公众号封面 900×383
- [x] 搜一搜 5 卡（`social/wechat-search/wechat-card-01~05.png`）
- [ ] 小红书竖图 3:4（可选）

### 导出

- [x] `npm run convert` → `index.html` + `.docx`
- [ ] `npm run publish:post`（待正文图就位后）
- [ ] 检查 `index.published.md` 图链
- [x] 检查 `index.html` 已生成
- [x] 检查 `.docx` 已生成

### 多平台

- [ ] 公众号首发
- [ ] 同日/次日：知乎 + 掘金 + CSDN
- [ ] Wechatsync 已授权
- [ ] 小红书改短图文版
- [x] 搜一搜图文包（见 `social/wechat-search/UPLOAD.md`）

---

## 推荐发布命令

```bash
# 1. 预览图链替换（可选）
npm run upload:images -- content/posts/15-claude-fable-5-claude-code --dry-run

# 2. 正式上传 + 导出 HTML/DOCX/published.md
npm run publish:post -- content/posts/15-claude-fable-5-claude-code

# 仅本地预览（不上传图）
npm run convert -- content/posts/15-claude-fable-5-claude-code
```

---

## 建议发布顺序

```
今天/明天：补齐 2 张图 → 删制作备注 → publish:post
 ↓
公众号首发（抢 6/22 前时效）
 ↓
知乎 + 掘金 + CSDN（同日或次日）
 ↓
小红书要点卡 + 抖音短脚本
```
