---
title: "Codex CLI 能换模型：终端 AI 程序员配置指南"
difficulty: ⭐⭐⭐
date: 2026-06-19
tags: [AI编程, Codex CLI, OpenAI, config.toml, 模型配置]
---

# Codex CLI 能换模型：终端 AI 程序员配置指南

![头图：Codex CLI 模型配置指南，终端里的 AI 程序员](./images/header.png)

> Codex CLI 上手指南
>
> 关注 **AI技趣星球**，一起用技术创造乐趣。
>
> 本文写作时间：2026 年 6 月 19 日。Codex 版本和配置项可能随时调整，动手前以 [OpenAI 官方文档](https://developers.openai.com/codex/config-basic) 为准。

Claude Code、MiMo Code、Codex……AI 编程工具的名字越来越多。

最近有人问我：**OpenAI 的 Codex CLI，到底能不能自己配模型？还是只能绑 ChatGPT 账号？**

我查了官方文档，也对照了社区里 OpenRouter、火山方舟、本地 Ollama 的接入案例。

查完官方文档和社区案例，可以确定：**Codex CLI 支持模型配置。** 配置文件是 `~/.codex/config.toml`，可以换默认模型、加自定义提供商、用 Profile 在不同模型之间切换。

**本文只讲 Codex CLI（终端版）。** 桌面 App、VS Code / Cursor 插件是另一套界面，模型配置行为不完全一样——下文单独说明。

**难度：⭐⭐⭐**

需要会打开终端、编辑一个 TOML 配置文件、设置环境变量。第一次可能要花 15～20 分钟，但不用写代码。

---

## 先分清：CLI、桌面 App、IDE 插件

OpenAI 的 Codex 现在有好几种形态，容易混：

| 形态 | 怎么用 | 本文是否展开 |
|------|--------|-------------|
| **Codex CLI** | 终端里运行 `codex` | ✅ 本文重点 |
| **Codex 桌面 App** | 独立 GUI 客户端 | 只讲配置差异 |
| **Codex IDE 扩展** | VS Code / Cursor 插件 | 只讲配置差异 |

它们**共用** `~/.codex/config.toml` 和 MCP 配置，但**换模型、接第三方 API 的体验并不相同**。

### 官方提供了哪些切换能力？

**有，但主要面向 ChatGPT 登录 + OpenAI 官方模型。**

| 场景 | 官方是否支持 | 怎么用 |
|------|-------------|--------|
| ChatGPT 登录，换 OpenAI 官方模型 | ✅ | 桌面 App 输入框旁的模型选择器；CLI 里 `/model` |
| 改默认模型 | ✅ | `config.toml` 里写 `model = "gpt-5.5"` |
| 接 DeepSeek / GLM / 火山等第三方 | ⚠️ 文档有，体验弱 | `[model_providers.xxx]` 写进 `config.toml` |

官方文档写明：CLI、IDE 插件、桌面 App **共用** `config.toml`，也支持自定义 `model_provider`。但对**桌面 App + 第三方模型**，常见问题包括：

- 用 API Key 登录时，**模型下拉框可能不显示**
- 会话模型存在本地数据库，**不一定完全听 config.toml**
- 很多国产模型只有 Chat Completions 接口，Codex 默认走 **Responses API**，直连容易报 404

下面这张表，是桌面版和 CLI 的实际差异：

| 场景 | 桌面 App | Codex CLI |
|------|----------|-----------|
| ChatGPT 账号登录，换 OpenAI 官方模型 | ✅ 界面里有模型选择器 | ✅ `/model` 或 `config.toml` |
| 改 `config.toml` 里的默认 `model` | ⚠️ 新会话可能被界面/本地缓存覆盖 | ✅ 一般按配置走 |
| 接火山方舟、OpenRouter 等自定义提供商 | ⚠️ 能连，但模型选择器常不显示 | ✅ 推荐用这个 |
| 用 Profile 切换不同模型 | ⚠️ 界面里不好切 | ✅ `--profile` 成熟 |

社区里已有不少反馈（如 [GitHub #16984](https://github.com/openai/codex/issues/16984)、[#10867](https://github.com/openai/codex/issues/10867)）：桌面 App 的会话模型有时存在本地数据库里，**不一定完全听从 `config.toml`**。

**结论：只想用 OpenAI 官方模型，桌面 App 自带选择器就够；想接国产 AI 或第三方网关，优先用 Codex CLI。**

---

### 桌面版接第三方：要不要 CC Switch 或 Codex++？

**不是官方必装项，而是社区增强工具**——主要帮桌面 App 用户补「协议转换」和「可视化切换」。

#### CC Switch 是什么？

[CC Switch](https://github.com/farion1231/cc-switch) 是一个开源桌面工具，用来管理 Codex、Claude Code、Gemini CLI 等工具的 API 供应商。

- 图形界面添加/切换供应商，自动写 `~/.codex/config.toml`
- **v3.16+ 本地路由**：把 Codex 的 Responses 请求转成 Chat Completions，方便接 DeepSeek、GLM、Kimi、火山方舟等
- 切换后通常要 **完全退出桌面 App（macOS 上 Cmd+Q，不是只关窗口）再开**
- 适合：不想手改 TOML、要在多个供应商之间点选切换

我们在《Claude Code 怎么用？普通人也能上手的 AI 编程助手》里也介绍过 CC Switch，Codex 标签页的用法类似。

#### Codex++ 是什么？

[Codex++](https://github.com/BigPizzaV3/CodexPlusPlus)（CodexPlusPlus）是面向 **Codex 桌面 App** 的外部增强启动器，不改 Codex 原始安装文件。

- 通过 CDP 注入增强：插件解锁、会话删除、Markdown 导出等
- **中转注入模式**：把 provider 配置写进 `config.toml`，接第三方 API
- 必须从 **Codex++ 入口** 启动，点原版 Codex 图标增强不会生效
- 适合：主要用桌面 App，想要「外挂式」增强 + 供应商切换

#### 两者怎么选？

| 工具 | 定位 | 适合谁 |
|------|------|--------|
| **CC Switch** | 多工具统一管理 + 本地协议转换 | 同时用 Codex / Claude Code 等，想托盘一键切模型 |
| **Codex++** | Codex 桌面体验增强 + 中转注入 | 只用 Codex 桌面 App，想解锁插件、补 UI 功能 |

不是二选一，有人两个一起用；也有人只用 CLI 手改 `config.toml`，完全不需要它们。

#### 三条路径，对号入座

| 你的情况 | 建议 |
|----------|------|
| 只用 OpenAI 官方模型（ChatGPT 订阅） | 桌面 App 自带选择器即可 |
| 接 DeepSeek / GLM / 火山，且主要用**桌面 App** | CC Switch 或 Codex++ 更省心 |
| 愿意用终端、自己改配置 | **Codex CLI + `config.toml`**，本文下文重点 |

---

## Codex CLI 是什么？

用一句话概括：**OpenAI 出品的终端 AI 编程助手，开源，跑在你电脑上。**

它和 Claude Code、MiMo Code 是同一类产品——你告诉它要做什么，它会：

- 读你的项目文件
- 规划修改方案
- 直接改代码、跑命令、查报错
- 必要时联网搜索或调用 MCP 工具

> **你（提需求）**
> ↓
> **Codex CLI**（读项目 → 规划 → 改文件 → 跑测试）
> ↓
> **你的项目目录**（被修改、被验证）

和 Claude Code 最大的区别：**Codex 是 OpenAI 官方维护的**，ChatGPT Plus / Pro 等订阅里通常包含额度；CLI 还开放了 `config.toml`，让你接第三方模型或国产 AI 网关。

下文所有安装、启动、Profile、命令行示例，**均针对 Codex CLI**。

## 安装：一条命令

前提：本机已装 **Node.js 18+**（建议 22+）。

### Mac / Linux

```bash
npm install -g @openai/codex
```

### Windows

PowerShell 里同样运行上面这条命令；也可以在 WSL2 里装。

装完验证：

```bash
codex --version
```

首次启动运行 `codex`，按提示用 ChatGPT 账号登录，或配置自定义模型提供商（下文会讲）。

---

## 模型配置：CLI 读哪个文件？

Codex 的用户级配置在：

| 系统 | 路径 |
|------|------|
| macOS / Linux | `~/.codex/config.toml` |
| Windows | `%USERPROFILE%\.codex\config.toml` |

项目级还可以放 `.codex/config.toml`，但**模型和提供商相关设置只能写在用户级配置里**——项目文件里写了也会被忽略并提示警告。

配置优先级（高 → 低）：

1. 命令行参数（`--model`、`--config`）
2. 项目 `.codex/config.toml`（不含模型提供商）
3. Profile 文件（`--profile xxx`）
4. 用户 `~/.codex/config.toml`
5. 内置默认值

---

## 最基础：改默认模型

如果你用 ChatGPT 订阅登录 Codex，只想换 OpenAI 自家模型，在 `config.toml` 顶部加一行：

```toml
model = "gpt-5.5"
model_reasoning_effort = "high"
```

会话里也可以随时输入 `/model`，在可用模型列表里切换（CLI 终端内操作）。

临时指定模型（不改配置文件）：

```bash
codex --model gpt-5.5
```

> 桌面 App 用输入框下方的模型选择器；IDE 插件用输入框旁的模型下拉。本文以下示例均在 **CLI 终端** 中操作。

---

## 核心能力：自定义模型提供商

这才是重点。**Codex 通过 `[model_providers.名称]` 块接入任意兼容接口。**

### 配置结构

```toml
# 顶部：默认用哪个提供商、哪个模型
model = "glm-5.2"
model_provider = "volcengine-ark"

# 提供商定义
[model_providers.volcengine-ark]
name = "火山方舟 Coding Plan"
base_url = "https://ark.cn-beijing.volces.com/api/coding/v3"
env_key = "ARK_API_KEY"
wire_api = "responses"
requires_openai_auth = false
```

### 每个字段什么意思

| 字段 | 填什么 |
|------|--------|
| `model` | 模型 ID，必须和提供商文档里的一致 |
| `model_provider` | 指向下面 `[model_providers.xxx]` 的名字 |
| `base_url` | API 地址，不要多余斜杠 |
| `env_key` | 环境变量名，Codex 从这里读 API Key |
| `wire_api` | 协议类型，新版 Codex 默认 `"responses"` |
| `requires_openai_auth` | 第三方提供商设 `false`，跳过 ChatGPT 登录 |

**注意三点：**

1. **API Key 不要写进 TOML 文件**，用环境变量。例如：

```bash
export ARK_API_KEY="你的火山方舟 Key"
```

2. **`openai`、`ollama`、`lmstudio` 这三个 ID 被保留**，不能拿来做自定义提供商。火山方舟请用 `volcengine-ark` 这类新名字。

3. **`wire_api` 要和你的网关匹配**。OpenAI 官方走 `responses`；部分第三方网关只支持 `chat/completions`，接不通时查网关文档或换中转层（如 LiteLLM）。

---

## 实战示例 1：接火山方舟 Coding Plan

如果你已经订阅了火山方舟 Coding Plan（首月 9.9 那类套餐），可以这样配：

**第一步**：在火山方舟控制台创建 API Key。

**第二步**：编辑 `~/.codex/config.toml`：

```toml
model = "glm-5.2"
model_provider = "volcengine-ark"

[model_providers.volcengine-ark]
name = "火山方舟 Coding Plan"
base_url = "https://ark.cn-beijing.volces.com/api/coding/v3"
env_key = "ARK_API_KEY"
wire_api = "responses"
requires_openai_auth = false
```

**第三步**：设置环境变量并启动：

```bash
export ARK_API_KEY="你的Key"
cd 你的项目目录
codex
```

模型 ID 也可以换成 `ark-code-latest`、`doubao-seed-2.0-code`、`deepseek-v3.2` 等，以控制台实时列表为准。

---

## 实战示例 2：接 OpenRouter

OpenRouter 是一个模型聚合网关，一个 Key 能调多家模型。国内访问可能需要特殊网络环境，动手前确认你本机网络可用。

```toml
model = "openai/gpt-5.3-codex"
model_provider = "openrouter"

[model_providers.openrouter]
name = "OpenRouter"
base_url = "https://openrouter.ai/api/v1"
env_key = "OPENROUTER_API_KEY"
wire_api = "responses"
requires_openai_auth = false
```

环境变量：

```bash
export OPENROUTER_API_KEY="你的Key"
```

`model` 值必须是 OpenRouter 上的完整 slug，带厂商前缀，例如 `openai/gpt-5.3-codex`，不能只写 `gpt-5.3-codex`。

---

## 多模型切换：用 Profile

不同任务想用不同模型？Codex 支持 **Profile**——每个 Profile 一个独立配置文件。

例如创建 `~/.codex/volcano.config.toml`：

```toml
model = "glm-5.2"
model_provider = "volcengine-ark"
```

再创建 `~/.codex/openrouter.config.toml`：

```toml
model = "deepseek/deepseek-chat-v3-0324"
model_provider = "openrouter"
```

使用时指定 Profile：

```bash
codex --profile volcano          # 用火山 GLM
codex --profile openrouter       # 用 OpenRouter 上的 DeepSeek
```

提供商定义仍然写在主配置 `~/.codex/config.toml` 里；Profile 文件只覆盖 `model` 和 `model_provider` 等差异项。

---

## 临时覆盖：不改配置文件

只想试一次，可以直接在命令行覆盖：

```bash
export ARK_API_KEY="你的Key"
codex --config model='"glm-5.2"' \
      --config model_provider='"volcengine-ark"'
```

或者：

```bash
codex -c model='"kimi-k2.5"' -c model_provider='"volcengine-ark"'
```

---

## 和 Claude Code、MiMo Code 比，Codex 强在哪？

| 维度 | Codex CLI | Claude Code | MiMo Code |
|------|-----------|-------------|-----------|
| 出品方 | OpenAI | Anthropic | 小米 |
| 开源 | 是（Rust） | 部分 | 是 |
| 模型配置 | `config.toml` + Profile | 配置文件 / 环境变量 | 内置 + `/connect` |
| 订阅 | ChatGPT 计划含额度 | Claude 订阅 / API | 目前限时免费 |
| MCP 支持 | 是，与桌面/IDE 共享配置 | 是 | 部分 |
| 适合谁 | 要接第三方模型、喜欢终端 | Anthropic 用户 | 想零成本试 AI 编程 |

没有绝对「最好」，看你已有哪个账号、哪个模型更顺手。

---

## 常见问题

### 配置了但连不上？

- 检查 `base_url` 是否多了或少了 `/v1`
- 检查环境变量名是否和 `env_key` 一致
- 检查模型 ID 是否和提供商文档完全一致
- 如果报 `/responses` 404，查网关是否支持 Responses API，或尝试 `wire_api = "chat"`

### 每次都要 export Key 太麻烦？

把 `export ARK_API_KEY="..."` 写进 `~/.zshrc` 或 `~/.bashrc`，重启终端生效。更安全的方式是用系统钥匙串或 direnv。

### 桌面 App 用户，能用 CC Switch 代替手改配置吗？

**可以。** CC Switch 本质上也是帮你写 `~/.codex/config.toml`，并附带本地协议转换。切换后记得完全退出桌面 App 再开。若同时想保留 ChatGPT 官方登录，可在 CC Switch 设置里开启「官方认证保留」。

### 配好了 CLI，桌面 App 会自动生效吗？

**不一定。** MCP 等配置通常会同步；但自定义 `model_provider` 时，桌面 App 可能仍走自己的会话模型缓存。**验证第三方模型是否接通，请以 CLI 里 `codex` 跑一条任务为准。**

### 项目里的 `.codex/config.toml` 写了 model_provider 不生效？

这是故意的。模型和提供商属于用户级敏感配置，Codex 只允许写在 `~/.codex/config.toml`，防止项目代码偷偷改你的 API 路由。

---

## 今天小结

- **官方切换** = ChatGPT 登录后换 OpenAI 自家模型，桌面 App 自带选择器；接第三方官方体验不完整。
- **Codex CLI** = 接 DeepSeek、GLM、火山方舟等第三方模型的**首选**，改 `config.toml` 即可。
- **桌面 App 接第三方** = 可选 CC Switch（多工具管理 + 协议转换）或 Codex++（桌面增强 + 中转注入），不是官方内置能力。
- **Profile** = CLI 里快速切换不同模型，不用每次改配置文件。

**一个能立刻做的动作**：终端里运行 `npm install -g @openai/codex`，创建 `~/.codex/config.toml`，先只写一行 `model = "gpt-5.5"` 跑通；确认 CLI 能用，再加 `[model_providers]` 块接入你想试的模型。

终端里的 AI 程序员，**自定义模型这条路线，CLI 比桌面 App 更靠谱。**

---

> 关注 **AI技趣星球**，一起用技术创造乐趣。

---

> 参考资料：
> - [Codex CLI 官方介绍](https://developers.openai.com/codex/cli)
> - [Codex 基础配置](https://developers.openai.com/codex/config-basic)
> - [Codex 高级配置（含 model_providers）](https://developers.openai.com/codex/config-advanced)
> - [OpenRouter × Codex 接入教程](https://openrouter.ai/blog/tutorials/codex-cli-openrouter/)
> - [火山方舟接入三方工具文档](https://www.volcengine.com/docs/82379/2160841)
> - [CC Switch 官方仓库](https://github.com/farion1231/cc-switch)
> - [Codex++（CodexPlusPlus）官方仓库](https://github.com/BigPizzaV3/CodexPlusPlus)
