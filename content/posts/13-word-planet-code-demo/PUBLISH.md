# 发布包 · 13-word-planet-code-demo

## 文章信息

| 项 | 内容 |
|----|------|
| 标题 | 字词星球使用说明：从选词到听写批改，一篇讲清楚 |
| 类型 | 产品使用说明 + 作者手写前言 |
| 难度 | ⭐ |
| 引流 | 关注微信公众号 **AI技趣星球**，回复 **MF** |
| 关联 | 上一篇《我用 AI 设计字词星球》 |

## 公众号版

**摘要（≤120 字）**

字词星球错字听写功能已上线。这篇是实操说明：怎么选词、怎么播报、怎么批改记账、怎么备份数据。文内附分段动图，跟着点一遍就能走通。

**封面建议**

- 复用 `12-word-planet-product-prototype/images/header-v2.png`，或新做 16:9 蓝天星球风封面
- 标题压字：字词星球使用说明

**话题标签**

`#亲子教育` `#听写` `#小学生` `#小程序` `#AI编程`

**发布步骤**

1. `npm run convert content/posts/13-word-planet-code-demo`
2. 浏览器打开 `index.html` → 一键复制正文
3. 封面单独上传素材库
4. GIF 动图：公众号对 GIF 支持不稳定，若粘贴后不动，把 5 张 `demo-*.gif` 逐张上传素材库后插入

## 知乎版

**开头引导**

> 关注微信公众号 **AI技趣星球**，回复 MF 获取学习星球小程序与更多实操教程。

**话题**

`小学语文` `听写` `家庭教育` `微信小程序` `AI 辅助开发`

**导入**

配置 `image-upload.config.json` 后：

```bash
npm run publish:post -- content/posts/13-word-planet-code-demo
npm run convert:published -- content/posts/13-word-planet-code-demo
```

导入 `index.published.md`（公网图链版）。

## 掘金 / CSDN 版

**标签**

`小程序` `产品设计` `亲子` `前端`

**摘要**

零小程序经验，用 AI 协作做出字词听写模块。这篇不讲代码，只讲功能怎么用：听写列表、课本选词、播报批改、错字库、数据备份。

## 小红书要点卡（3:4 竖图文案）

```
字词星球听写上线了 ✅
今晚带娃听写照着这篇点

① 学习星球 → 字词听写
② 课文选词 / 错字复习 / 手动录入
③ 调间隔 → 播报 → 批改 → 记错字
④ 设置里导出备份，换手机不丢数据

动图在公众号长文里
关注 AI技趣星球 回复 MF
```

## 发布检查清单

- [x] 手写开篇结构完整（自己写的 / --- / 下面是AI 写的）
- [x] 5 段实操 GIF 已嵌入
- [x] 小程序码已加入
- [x] 已知限制（TTS 额度、无语音拍照录入、课本差异、本地备份）已写明
- [x] HTML + DOCX 已生成（`npm run convert`）
- [ ] `image-upload.config.json` 已配置（多平台公网图）
- [ ] `npm run publish:post` 正式上传图链
- [ ] 公众号封面图上传素材库
- [ ] 首发微信公众号，次日同步知乎/掘金

## 本地命令

```bash
# 公众号预览（本地图）
npm run convert content/posts/13-word-planet-code-demo

# 多平台发布（需 image-upload.config.json）
npm run publish:post -- content/posts/13-word-planet-code-demo
```
