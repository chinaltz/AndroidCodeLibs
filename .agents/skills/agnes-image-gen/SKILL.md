---
name: agnes-image-gen
description: 使用 Agnes-Image-2.1-Flash 模型生成图片。支持文生图、图生图、图像编辑。免费无限量调用。
argument-hint: "[图片描述提示词，或贴入图片URL进行图生图/编辑]"
---

# Agnes Image 生成器

使用 Agnes-Image-2.1-Flash 模型通过 API 生成图片。该模型免费无限量，支持多种风格（写实、动漫、水墨、3D 等）和图像编辑（表情修改、背景替换、风格迁移等）。

## API 配置

- **Endpoint**: `https://apihub.agnes-ai.com/v1/images/generations`
- **Model**: `agnes-image-2.1-flash`
- **API Key**: 从环境变量 `AGNES_API_KEY` 读取，或使用用户提供的 Key
- **认证方式**: Bearer Token

## 使用方式

### 文生图（Text-to-Image）

用户提供图片描述，调用 API 生成图片。

**请求格式：**
```bash
curl -s https://apihub.agnes-ai.com/v1/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AGNES_API_KEY" \
  -d '{
    "model": "agnes-image-2.1-flash",
    "prompt": "用户的图片描述提示词",
    "n": 1,
    "size": "1024x1024"
  }'
```

**支持的尺寸：**
- `1024x1024`（1:1 正方形，默认）
- `1024x1536`（2:3 竖版）
- `1536x1024`（3:2 横版）
- `768x1024`（3:4）
- `1024x768`（4:3）

**响应格式：**
```json
{
  "created": 1234567890,
  "data": [
    {
      "url": "https://platform-outputs.agnes-ai.space/images/..."
    }
  ]
}
```

### 图生图 / 图像编辑（Image-to-Image）

用户提供原图 URL + 编辑指令。

**请求格式：**
```bash
curl -s https://apihub.agnes-ai.com/v1/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AGNES_API_KEY" \
  -d '{
    "model": "agnes-image-2.1-flash",
    "prompt": "编辑指令，如：将背景换成蓝色纯色，生成证件照",
    "image": "原图URL",
    "n": 1,
    "size": "1024x1024"
  }'
```

## 执行流程

1. 确认用户需求：文生图 or 图生图/编辑
2. 如果用户给了中文描述，直接使用（模型支持中文提示词）
3. 如果描述模糊，帮用户补充细节（风格、光影、构图、氛围等）
4. 调用 API 生成图片
5. 返回图片 URL 给用户，并附上使用的提示词

## 提示词优化建议

生成高质量图片的提示词结构：
```
[主体描述] + [风格关键词] + [光影/氛围] + [技术参数]
```

**风格关键词示例：**
- 写实摄影：`写实摄影风格，浅景深，自然光`
- 日系动漫：`日系动漫插画风格，柔和色调`
- 中国水墨：`中国传统水墨画风格，留白，墨色浓淡`
- 赛博朋克：`赛博朋克风格，霓虹灯光，雨夜反射`
- 3D 渲染：`Blender 3D 渲染，等距视角，低多边形`
- 油画：`古典油画风格，伦勃朗光影`
- 扁平设计：`现代扁平设计，几何图形，明快色彩`

## 注意事项

- API Key: `sk-fOUhHg4nDplF8Pk6PCMZIk20S753kHSWfUp2LjRhBl9kMjge`
- 模型免费无限量使用，无需担心额度
- 生成速度约 15-20 秒/张
- 图片 URL 有有效期，建议及时下载保存
- 支持中英文提示词，中文效果也不错
