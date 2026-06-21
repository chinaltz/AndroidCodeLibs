# 发布适配清单 · Codex CLI 模型配置

> 审核时间：2026-06-19  
> 文章路径：`content/posts/23-codex-cli-model-config-guide/index.md`

---

## 流水线进度（8 步）

| 步骤 | 状态 | 说明 |
|------|------|------|
| ① 选题确认 | ✅ | Codex CLI 能否换模型 + 桌面版/CC Switch 选型 |
| ② 初稿 | ✅ | 已写入 `index.md`，约 4200 字 |
| ③ 风格润色 | ✅ | 口语化、表格清晰、无「先说人话」套话 |
| ④ 比喻注入 | ✅ | 终端 AI 程序员、需求→执行流程图 |
| ⑤ 标题选定 | ✅ | **Codex CLI 能换模型：终端 AI 程序员配置指南** |
| ⑥ 配图方案 | ⚠️ | 头图 `header.png` 已有；无正文场景图；搜一搜 5 卡未生成 |
| ⑦ 终审质检 | ✅ | 见下方审查报告；必改项已合入 `index.md` |
| ⑧ 发布就绪 | ✅ | HTML + DOCX 已导出（`npm run convert`） |

**当前结论：公众号长文可发；搜一搜卡/小红书短图文为可选项。无需公网图链。**

---

## 审查报告

### 总体评分

文章定位清晰（CLI 为主、桌面版/CC Switch 作选型附录），配置步骤可照做，边界说明充分。结构略长但层次合理。发布前已补结尾关注引导、OpenRouter 网络提醒，并去掉「结论先说」模板句。**可直接公众号首发。**

### 各维度检查结果

| 维度 | 结果 | 问题说明 |
|------|------|----------|
| 原则1：人话优先 | ✅ | CLI/桌面/IDE 先分形态；TOML 字段有表格解释 |
| 原则2：解决问题优先 | ✅ | 开篇即回答「能不能配模型」；三条路径对号入座 |
| 原则3：不制造焦虑 | ✅ | 无「不会就完蛋」；强调可选工具、CLI 非唯一解 |
| 原则4：明确边界 | ✅ | 桌面 App 限制、Responses API、wire_api 踩坑均有说明 |
| 原则5：带走东西 | ✅ | 小结 + 安装/配置/action；缺独立提示词块（教程文可接受） |
| 模板结构 | ✅ | 标题、场景、结论、步骤、FAQ、小结、行动建议齐全 |
| 语气 | ⚠️ | 表格内 ✅⚠️ 较多（信息图式，可保留）；已无「结论先说」 |
| 敏感词 | ✅ | 无翻墙/VPN；OpenRouter 已加「特殊网络环境」提醒 |
| 跨文章链接 | ✅ | 《Claude Code 怎么用？…》为纯文本，无相对路径 |
| 配图 | ⚠️ | 仅有头图；无终端截图（可选补，非阻塞） |
| 关注引导 | ✅ | 开头 + 结尾均已写「关注 AI技趣星球，一起用技术创造乐趣」 |

### 修改优先级

**🔴 必须改（阻塞发布）**

1. ~~删「结论先说」模板句~~ → 已改为自然表述
2. ~~结尾补关注引导~~ → 已补
3. ~~OpenRouter 网络边界~~ → 已加一句提醒

**🟡 建议改（改后更好）**

1. 补 1～2 张截图：`config.toml` 编辑界面、CLI 里 `/model` 或跑通后的终端（增强可信度）
2. 生成微信搜一搜 5 卡：`python3 scripts/render-wechat-search-cards.py content/posts/23-codex-cli-model-config-guide`
3. Profile 示例文件名：`volcano.config.toml` 对应 `codex --profile volcano`，读者可能困惑——可在 FAQ 加一句「Profile 名 = 文件名去掉 `.config.toml`」

**🟢 锦上添花**

1. 小红书 3～5 张要点卡（CLI vs 桌面、三条路径、火山配置三行）
2. 抖音 60 秒口播：「Codex 能换模型吗？能，但桌面版和 CLI 不一样」

### 快速改动清单

1. ~~终审三项必改~~ → 已完成
2. 浏览器打开 `index.html` 预览排版
3. 公众号上传 `images/header.png` 作封面
4. （可选）生成搜一搜卡后按 `UPLOAD.md` 上传

---

## 标题方案

### 当前主标题

**Codex CLI 能换模型：终端 AI 程序员配置指南**

### 备选（备用）

| 排名 | 标题 |
|------|------|
| 1 | Codex CLI 能换模型：终端 AI 程序员配置指南（当前） |
| 2 | Codex 能换 DeepSeek 和 GLM 吗？CLI 配置一篇讲清楚 |
| 3 | 别搞混 Codex 桌面版和 CLI：换模型走哪条路？ |

---

## 多平台适配

### 公众号（首发）

**摘要（≤120 字）：**

OpenAI Codex 能自己配模型吗？能。本文聚焦 Codex CLI：用 `config.toml` 接火山方舟、OpenRouter 等第三方；并说明桌面 App、CC Switch、Codex++ 各自适合谁。含安装命令与完整配置示例。

**封面：** 使用 `images/header.png`（2560×1440，公众号后台可裁 2.35:1）

**话题标签：** Codex、AI编程、OpenAI、config.toml、DeepSeek、技趣星球

**发布方式：**

1. 封面/头图上传素材库
2. 打开 `index.html` → 一键复制正文
3. 或用 Wechatsync 同步

---

### 知乎

**适合问题：**

- Codex CLI 怎么配置自定义模型？
- Codex 桌面版和 CLI 换模型有什么区别？
- CC Switch 和 Codex++ 哪个好用？

**开头：** 可直接用正文前两段 + 「查完官方文档和社区案例，可以确定：Codex CLI 支持模型配置。」

**话题：** 人工智能、OpenAI、AI 编程、Codex、大模型

---

### 掘金 / CSDN

**标签：** Codex、OpenAI、AI Agent、config.toml、CLI

**提示：** 保留 TOML 代码块和 Profile 命令；标题可加「实操」：Codex CLI 自定义 model_providers 配置指南

---

### 小红书（要点）

| 卡片 | 文案 |
|------|------|
| 1 | Codex 能换模型吗？能，但 CLI 和桌面版不一样 |
| 2 | 官方模型：桌面 App 点选就行 |
| 3 | 国产 AI：优先 Codex CLI + config.toml |
| 4 | 桌面用户：CC Switch 或 Codex++ |
| 5 | 今晚试：`npm i -g @openai/codex` + 改 config.toml |

---

## 发布前检查清单

### 内容

- [x] 标题吸引目标读者
- [x] 开头 3 句有场景/问题
- [x] 有可照做配置示例（火山 + OpenRouter）
- [x] 有小结 + 行动建议
- [x] 开头 + 结尾关注引导（新规范文案）
- [x] 无敏感词
- [x] 外链为官方/GitHub，有效
- [x] 无相对路径跨文链接
- [x] 无即梦/制作备注残留

### 素材

- [x] `images/header.png`
- [ ] 终端/config 截图（可选）
- [ ] 搜一搜 5 卡（可选）
- [ ] 公众号封面裁切版（发布时上传）

### 导出

- [x] `npm run convert` → `index.html` + `.docx`
- [x] 写作日期 2026-06-19

### 多平台

- [ ] 公众号首发
- [ ] 知乎 + 掘金 + CSDN
- [ ] 小红书短图文（可选）

---

## 推荐发布命令

```bash
# 导出 HTML + DOCX（当前标准流程，本地嵌图）
npm run convert content/posts/23-codex-cli-model-config-guide

# 搜一搜卡（可选）
python3 scripts/render-wechat-search-cards.py content/posts/23-codex-cli-model-config-guide
```

---

## 建议发布顺序

```
今天：index.html 预览 → 公众号首发
 ↓
次日：知乎 + 掘金 + CSDN（技术向保留代码块）
 ↓
可选：小红书要点卡 + 搜一搜图文
```
