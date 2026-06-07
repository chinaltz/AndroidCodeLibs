# AiToEarn 怎么用？一个人也能做多平台内容发布

![头图：AiToEarn 多平台内容发布上手指南](./images/header.png)

> AiToEarn 上手指南
>
> 技趣星球 · 用技术创造乐趣

你写完一篇笔记，准备发出去。

小红书要改标题。

抖音要换封面比例。

B 站还要再写一段简介。

视频号、公众号、快手……每个平台一套规矩。

发完一圈，半小时没了。

更麻烦的是，发完不等于有人看。评论要回，热点要跟，商家推广任务还要单独对接。

这就是 [AiToEarn](https://github.com/yikart/AiToEarn) 想帮你省掉的那堆重复活。

它是一个开源的 AI 内容营销工具，GitHub 上已有 1.8 万+ Star。口号很直白：**Monetize · Publish · Engage · Create**——赚钱、发布、互动、创作，四件事串成一条线。

**一句话结论：AiToEarn 不是又一个聊天 AI，而是一个能帮你「写内容 → 发多平台 → 管互动 → 接推广任务」的内容工作台。普通人最省事的入口，就是直接打开网站用。**

难度：⭐ 到 ⭐⭐⭐⭐（看你怎么用，下面会标清楚）

---

## 先说人话：AiToEarn 像「内容外卖调度台」

你可以把它想成外卖平台上的商家后台。

以前你自己跑堂：炒菜、打包、送外卖、回评价，全靠自己。

AiToEarn 帮你拆成四个岗位：

| 岗位 | 干什么 | 你得到什么 |
|------|--------|------------|
| **Create** 创作 | 写文案、出图、剪视频、批量生成草稿 | 不用每个平台从头写一遍 |
| **Publish** 发布 | 一键发到抖音、小红书、B站、视频号、TikTok、YouTube 等 | 不用登录十个后台逐个传 |
| **Engage** 互动 | 自动点赞、回评论、挖高转化留言 | 不用守着手机刷评论 |
| **Monetize** 赚钱 | 接商家推广任务，按成交/互动/播放量结算 | 内容不只是发着玩 |

它面向的人很清晰：**一人公司、自媒体、小品牌、想靠内容变现的普通人**。

官网有两个地址：

- 国内用户：[aitoearn.cn](https://aitoearn.cn/)
- 国际用户：[aitoearn.ai](https://aitoearn.ai/)

下面按「从易到难」讲五种用法。你可以先挑一种跑通，别一上来全试。

---

## 五种用法，一张表先看懂

| 方式 | 适合谁 | 要装东西吗 | 难度 |
|------|--------|------------|------|
| ① 打开网站直接用 | 所有人 | 不需要 | ⭐ |
| ② 在 Cursor / Claude 里用 MCP | 已经在用 AI 助手的人 | 配一次 MCP | ⭐⭐ |
| ③ 在龙虾 OpenClaw 里用 | 有 OpenClaw 服务器的用户 | 装一个插件 | ⭐⭐ |
| ④ Docker 私有化部署 | 想数据放自己服务器的团队 | 要服务器 + Docker | ⭐⭐⭐⭐ |
| ⑤ 源码开发 | 开发者二次开发 | 要 Node.js 开发环境 | ⭐⭐⭐⭐⭐ |

> 方式 ②③④ 都需要先拿 **API Key**。下面会单独讲，只要拿一次，后面通用。

---

## 第一步：注册账号，拿到 API Key

不管你用哪种方式，建议先把 Key 拿到手。

**难度：⭐**

### 操作步骤

1. 打开 [aitoearn.cn](https://aitoearn.cn/)（国内）或 [aitoearn.ai](https://aitoearn.ai/)（海外）
2. 注册并登录
3. 点左侧菜单 **设置**
4. 找到 **API Key**，点「创建」
5. 复制生成的 Key，存到备忘录里

![获取 API Key](./images/scene1-api-key.png)

### 两个容易踩的坑

**环境和 Key 必须匹配。**

- 在 `aitoearn.cn` 注册的 Key，只能配国内地址
- 在 `aitoearn.ai` 注册的 Key，只能配国际地址

配错了会报 `401`，很多人卡在这里。

**Key 别发群里、别贴截图。**

它相当于你的账号钥匙，泄露了别人能代你操作。

---

## ② 最推荐普通人：打开网站直接用

**难度：⭐**

这是零门槛入口。浏览器打开就能用，不用装 Docker，不用配 MCP。

### 第一天建议这样走

**1. 绑定你的社媒账号**

进后台后，先把常用平台连上，比如小红书、抖音、B站、视频号。

第一次绑定要走平台授权登录，跟平时「用微信登录某 App」差不多。

**2. 试一次 Create：让 AI 帮你出草稿**

在创作区告诉它你要什么，比如：

```text
帮我写一篇小红书笔记：
主题：普通人怎么用 AI 整理周报
风格：口语化，像朋友聊天
字数：500 字左右
结尾给一个能立刻照做的小动作
```

它会生成文案，你还可以让它扩写、缩写、加标签、配图。

**3. 试一次 Publish：一条内容发多个平台**

内容满意后，选要发的平台，设发布时间。

支持日历排期——你可以周日晚上把下周的帖子都排好，不用每天手动发。

**4. 有余力再试 Engage**

这部分需要装 AiToEarn 的浏览器插件。

装好后，它能帮你在已绑定的平台上做批量点赞、收藏、关注，还能用 AI 生成评论回复。

### 适合你的日常节奏

| 你的情况 | 建议用法 |
|----------|----------|
| 每周发 2-3 条笔记 | 网站 + 日历排期 |
| 刚起步，还在试选题 | 先用 Create 批量出 10 条草稿挑最好的 |
| 有商家找推广 | 去 Monetize 区看 CPS/CPE/CPM 任务 |
| 评论太多回不过来 | 再装浏览器插件，开 AI 回复 |

---

## ③ 已经在用 Cursor 或 Claude？接上 MCP 更省事

**难度：⭐⭐**

AiToEarn 支持 MCP 协议。意思是：你不用切网页，直接在 Cursor 里跟 AI 说「帮我发小红书」，它就能调 AiToEarn 的能力。

这跟我们在《MCP：就是我们日常使用的 Type-C 接口》里讲的一样——AI 终于能接「发布内容」这根线了。

### 前置条件

- 已拿到 API Key（见上文）
- Cursor 或 Claude Desktop 已安装

### Cursor 配置步骤

1. 打开 Cursor → **Settings** → **MCP**
2. 添加一个新 MCP Server
3. 填入下面信息（国内用户把地址换成 `aitoearn.cn` 版）：

```text
MCP 地址：https://aitoearn.ai/api/unified/mcp
认证 Header：x-api-key: 你的API-Key
```

4. 保存，看到 AiToEarn 工具列表出来就成功了

### Claude Desktop 配置

找到 `claude_desktop_config.json`，加入：

```json
{
  "mcpServers": {
    "aitoearn": {
      "type": "http",
      "url": "https://aitoearn.ai/api/unified/mcp",
      "headers": {
        "x-api-key": "你的API-Key"
      }
    }
  }
}
```

国内用户把 `aitoearn.ai` 换成 `aitoearn.cn`，Key 也要用国内站申请的。

### 配好后，你可以直接这样跟 AI 说

**写内容并发出去：**

```text
用 AiToEarn 帮我：
1. 写一篇关于「周末宅家 AI 学习清单」的小红书笔记，口语化，300 字
2. 生成 5 个标签
3. 排期到明天晚上 8 点发布
```

**查推广任务：**

```text
用 AiToEarn 帮我看看现在有什么适合科技博主的推广任务，
按 CPE 结算优先，列出任务名、要求和预估收益方式。
```

**批量铺内容：**

```text
用 AiToEarn 批量生成 3 条抖音短视频脚本：
主题都是「一人公司怎么用 AI 省时间」，
每条风格不同：干货型、故事型、吐槽型。
生成后先存草稿，不要直接发布。
```

### MCP 地址速查

| 环境 | MCP 地址 | SSE 地址 |
|------|----------|----------|
| 国内版 | `https://aitoearn.cn/api/unified/mcp` | `https://aitoearn.cn/api/unified/sse` |
| 国际版 | `https://aitoearn.ai/api/unified/mcp` | `https://aitoearn.ai/api/unified/sse` |

---

## ④ 有 OpenClaw（龙虾）？在终端装个插件

**难度：⭐⭐**

如果你已经在用 OpenClaw，可以在服务器终端装 AiToEarn 插件，直接在龙虾里接推广赚钱任务。

### 操作步骤

1. 先拿到 API Key
2. 在**服务器终端**执行：

```bash
npx -y @aitoearn/openclaw-plugin-cli
```

3. 首次运行会让你选环境（国内 / 国际）并输入 API Key
4. 装完后，在 OpenClaw 里就能看到 AiToEarn 任务

环境和 Key 不匹配同样会 401，注意选对。

---

## ⑤ 想自己部署？Docker 三条命令

**难度：⭐⭐⭐⭐**

适合小团队想把数据放自己服务器上。不需要手动装数据库。

### 基础部署

```bash
git clone https://github.com/yikart/AiToEarn.git
cd AiToEarn
docker compose up -d
```

浏览器打开 [http://localhost:8080](http://localhost:8080) 就能用。

### 强烈建议：配置 Relay

自己部署后，发布内容仍要登录抖音、小红书等平台。

这些平台的开发者账号申请很麻烦。配 **Relay** 可以借用官方凭据完成授权，你不用自己去各平台申请开发者资质。

在 `docker-compose.yml` 的 `aitoearn-server` 服务里加：

```yaml
RELAY_SERVER_URL: https://aitoearn.ai/api
RELAY_API_KEY: 你的API-Key
RELAY_CALLBACK_URL: http://localhost:8080/api/plat/relay-callback
```

国内 Key 把 `RELAY_SERVER_URL` 改成 `https://aitoearn.cn/api`。

然后重启：

```bash
docker compose restart aitoearn-server
```

更完整的生产环境配置见仓库里的 [DOCKER_DEPLOYMENT_CN.md](https://github.com/yikart/AiToEarn/blob/main/DOCKER_DEPLOYMENT_CN.md)。

---

## 四个核心能力，分别干什么

### Create：内容创作 Agent

你只管说需求，它调模型帮你出活。

- **视频**：可调 Grok、Veo、Seedance 等视频模型，还能翻译、剪辑
- **图文**：可调 Nano Banana 等图片模型
- **批量**：一次下发多条任务，适合矩阵号铺量

最新 2.4 版还支持 HappyHorse 1.0、Seedance 2.0，草稿批量生成、多模型选择、参考图/视频。

### Publish：一键全网分发

覆盖国内：抖音、快手、B站、小红书、视频号、微信公众号

覆盖海外：TikTok、YouTube、Facebook、Instagram、Threads、X、Pinterest、LinkedIn

还能用日历统一排期，像管日程一样管发布。

### Engage：互动运营 Agent

靠浏览器插件实现：

- 批量点赞、收藏、关注
- AI 生成评论回复
- 识别「求链接」「怎么买」等高转化评论
- 监测品牌相关讨论

### Monetize：内容变现

创作者可以接商家推广任务，三种结算方式：

| 模式 | 含义 | 适合 |
|------|------|------|
| **CPS** | 按成交额结算 | 带货、种草转化强的内容 |
| **CPE** | 按互动量结算 | 评论、点赞多的内容 |
| **CPM** | 按播放量结算 | 曝光型、流量型内容 |

---

## 一条完整实操路径：从 0 到发出第一篇

假设你是一个刚起步的小红书博主，每周能挤出 2 小时。

**第 1 步：注册 + 绑号（15 分钟）**

打开 aitoearn.cn，注册，绑定小红书账号。

**第 2 步：用 Create 出 3 条草稿（20 分钟）**

```text
我是职场新人博主，帮我写 3 篇小红书笔记草稿：
1. 主题：AI 帮我写周报
2. 主题：普通人怎么选 AI 工具
3. 主题：我的一周 AI 学习安排
每篇 400 字，口语化，各带 5 个标签建议。
```

挑最顺眼的一条，微调两句。

**第 3 步：Publish 排期（5 分钟）**

选小红书，设明天中午 12:30 发。先感受「排期发布」的节奏。

**第 4 步：观察数据，再决定要不要开 Engage**

如果评论开始多了，再装浏览器插件，开 AI 回复。别一上来就全自动，先人工看几天回复质量。

**第 5 步：有稳定流量后，看 Monetize 任务**

去任务市场挑符合你账号调性的推广，优先选你本来就会买的品类，别硬接违和的广告。

---

## 常见误区和边界

**误区 1：装完就能躺赚**

AiToEarn 省的是重复操作时间，不是替你思考。

选题、人设、真实体验，还是得你来。AI 出的是草稿，不是成品。

**误区 2：全自动互动可以无限刷**

平台对异常互动有风控。建议先小范围试，回复内容人工抽查，别一上来就大批量自动操作。

**误区 3：所有平台一次搞定就完事**

不同平台用户口味不同。AiToEarn 能帮你分发，但同一篇原文硬发十个平台，效果往往一般。

最好让它「一稿多改」，而不是「一稿多发」。

**误区 4：变现任务来者不拒**

CPS/CPE/CPM 任务要看账号调性。科技号去接美妆硬广，粉丝会跑。

---

## 和其他工具怎么选

| 你的需求 | 更合适的方向 |
|----------|--------------|
| 只想偶尔发一条，平台不多 | 手动发就行，不必上工具 |
| 多平台分发 + 排期 + 互动 | AiToEarn 很对口 |
| 在 Cursor 里写代码顺便管内容 | AiToEarn MCP + Cursor |
| 只要 AI 写文案，不涉及发布 | 普通 ChatGPT / Claude 够用 |
| 想完全私有化、团队自用 | AiToEarn Docker 自部署 |

开源地址：[github.com/yikart/AiToEarn](https://github.com/yikart/AiToEarn)（MIT 协议，可自由研究代码）

---

## 今天的小结

今天只需要记住 4 件事：

- AiToEarn 是「创作 → 发布 → 互动 → 变现」一条龙，不是聊天玩具
- 普通人先从网站入口跑通，难度最低
- 用 MCP / OpenClaw / Docker 前，先去设置页拿 API Key，环境和 Key 要匹配
- 工具省的是重复劳动，选题和真实感还得你自己来

如果你现在就想试，打开 [aitoearn.cn](https://aitoearn.cn/)，注册后把这段话贴进创作区：

```text
我是【你的身份，比如职场妈妈/自由职业者/小店主】，
帮我写一篇【平台名，比如小红书】笔记：
主题：【你想聊的事】
要求：口语化、短段落、500 字以内、结尾给一个能立刻做的小动作
再给我 5 个标签建议
```

生成满意了，绑号、排期、发出你的第一篇。

先跑通一条，再谈多平台和变现，比一上来贪多要稳得多。
