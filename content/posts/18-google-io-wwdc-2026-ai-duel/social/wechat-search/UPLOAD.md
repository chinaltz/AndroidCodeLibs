# 微信搜一搜 / 看一看图文发布包

文章：5月谷歌、6月苹果又更新了：AI 能自己跑腿，Siri 也大改版，跟我们有什么关系？

> 由 `social/wechat-search/cards.html` + Chrome 截图生成。PNG 内禁止关注/公众号等导流词。

## 素材顺序

上传目录：`social/wechat-search/`

| 文件 | 内容 |
|------|------|
| `wechat-card-01.png` | 封面：标题 + 5/19 I/O、6/8 WWDC 时间线 + 来源标注 |
| `wechat-card-02.png` | 核心问题：跟我们有什么关系 + 谷歌/苹果各 3 要点 |
| `wechat-card-03.png` | 速览：两场发布三个要点（事实校对版） |
| `wechat-card-04.png` | 边界提醒：上线时间、地区语言、订阅、国内用法 |
| `wechat-card-05.png` | 总结：记住 3 件事 + 立刻可做（PNG 内不含关注/导流词） |

## 搜一搜标题

```text
5月谷歌、6月苹果又更新了：AI 能自己跑腿，Siri 也大改版，跟我们有什么关系？
```

## 看一看推荐标题

```text
5月谷歌6月苹果又更新了
```

## 摘要

```text
5 月 Google I/O、6 月 Apple WWDC 刚结束。谷歌押 AI 智能体自己跑腿，苹果大改 Siri AI。5 张图搞懂跟我们有什么关系。
```

## 图文正文

```text
5 月 Google I/O、6 月 Apple WWDC 刚结束。谷歌押 AI 智能体自己跑腿，苹果大改 Siri AI。

建议按 01→05 顺序看图，再回到长文看完整对比表。
```

> PNG 与搜一搜图文正文均**不要**写关注/回复/公众号等导流词，否则易拒审。公众号长文导流见下方单独区块。

## 公众号导流（仅长文用，勿粘贴进搜一搜图文）

```text
关注微信公众号 AI技趣星球，回复MF 一起用技术创造乐趣。
```

## 关键词

```text
Google I/O, WWDC, Siri AI, 谷歌苹果发布会, AI智能体, Gemini, 普通人学AI, 技趣星球
```

## 话题标签

```text
#GoogleIO #WWDC #SiriAI #AI智能体 #谷歌苹果 #技趣星球
```

## 发布检查

- [ ] 5 张图按 01→05 顺序上传
- [ ] 封面选 `wechat-card-01.png`
- [ ] 抽检 03、04 数字与日期是否与正文一致
- [ ] 5 张 PNG 内无：公众号、关注、回复、私信、加群、福利、搜一搜、看一看

## 重新生成

```bash
python3 scripts/render-wechat-search-cards.py content/posts/18-google-io-wwdc-2026-ai-duel
# 或兼容旧命令：
python3 scripts/gen-wechat-cards-google-wwdc.py
```

编辑文案先改 `social/wechat-search/cards.html`，再执行上面命令重新截图。
