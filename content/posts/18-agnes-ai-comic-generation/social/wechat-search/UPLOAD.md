# 搜一搜 / 看一看图文发布包

文章：Agnes 无限期免费：普通人接入实测

> 由 `social/wechat-search/cards.html` + Chrome 截图生成。PNG 内禁止关注/公众号等导流词。

## 素材顺序

上传目录：`social/wechat-search/`

| 文件 | 内容 |
|------|------|
| `wechat-card-01.png` | 封面：标题 + 三条能力线 + 来源 |
| `wechat-card-02.png` | 核心问题：Trae/WorkBuddy 能接 vs Qoder 不能 |
| `wechat-card-03.png` | 接入三步 + Trae 配置截图 |
| `wechat-card-04.png` | 边界：视频排队、生图气泡、Key 安全 |
| `wechat-card-05.png` | 总结 3 件事 + 立刻可做 |

## 搜一搜标题

```text
Agnes 无限期免费：普通人接入实测，文本生图怎么接？
```

## 看一看推荐标题

```text
Agnes 免费多模态接入实测
```

## 摘要

```text
Agnes 文本、生图、视频多模态 API 对个人免费开放。Trae 和 WorkBuddy 能接，5 张图搞懂拿 Key、配模型、打包生图 Skill，以及视频排队的坑。
```

## 图文正文

```text
Agnes 对个人免费开放文本问答、图片生成和视频生成。我实测问答和生图顺利，视频卡在排队。

建议按 01→05 顺序看图，再回到长文看四格漫画实测与 curl 示例。
```

## 公众号导流（仅长文用，勿粘贴进搜一搜图文）

```text
技趣星球 · 用技术创造乐趣。
```

## 关键词

```text
Agnes AI, 免费生图, API Key, Trae CN, WorkBuddy, 多模态, 四格漫画, 技趣星球
```

## 话题标签

```text
#AgnesAI #免费生图 #Trae #WorkBuddy #多模态AI #技趣星球
```

## 发布检查

- [ ] 5 张图按 01→05 顺序上传
- [ ] 封面选 `wechat-card-01.png`
- [ ] 5 张 PNG 内无：公众号、关注、回复、留言、进社群、资料、搜一搜、看一看

## 重新生成

```bash
python3 scripts/render-wechat-search-cards.py content/posts/18-agnes-ai-comic-generation
```

编辑文案先改 `social/wechat-search/cards.html`，再执行上面命令重新截图。
