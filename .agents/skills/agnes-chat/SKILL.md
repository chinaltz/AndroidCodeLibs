---
name: agnes-chat
description: 使用 Agnes-2.0-Flash 文本模型进行对话。免费无限量，支持中英文，1M 超长上下文窗口。适合需要大量 Token 消耗的任务（长文总结、代码生成、翻译等）。
argument-hint: "[你的问题或任务描述]"
---

# Agnes Chat 文本助手

使用 Agnes-2.0-Flash 文本模型通过 API 进行对话。该模型免费无限量，支持 1M 超长上下文窗口，适合需要大量 Token 消耗的场景。

## API 配置

- **Endpoint**: `https://apihub.agnes-ai.com/v1/chat/completions`
- **Model**: `agnes-2.0-flash`
- **API Key**: `sk-fOUhHg4nDplF8Pk6PCMZIk20S753kHSWfUp2LjRhBl9kMjge`
- **认证方式**: Bearer Token

## 使用方式

将用户的问题或任务发送给 Agnes 模型，返回回答。

**请求格式：**
```bash
curl -s https://apihub.agnes-ai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-fOUhHg4nDplF8Pk6PCMZIk20S753kHSWfUp2LjRhBl9kMjge" \
  -d '{
    "model": "agnes-2.0-flash",
    "messages": [
      {"role": "system", "content": "你是一个有帮助的AI助手"},
      {"role": "user", "content": "用户的问题"}
    ],
    "max_tokens": 2000
  }'
```

**响应格式：**
```json
{
  "choices": [
    {
      "message": {
        "content": "模型的回答",
        "role": "assistant"
      }
    }
  ],
  "usage": {
    "prompt_tokens": 100,
    "completion_tokens": 200,
    "total_tokens": 300
  }
}
```

## 执行流程

1. 接收用户的问题或任务
2. 构建 messages 数组（可包含 system prompt 优化输出）
3. 调用 API 获取回答
4. 解析 response 中的 content 字段
5. 将回答直接展示给用户

## 适用场景

- **长文总结**：扔一篇长文章让它总结要点
- **代码生成**：生成代码片段或完整项目文件
- **翻译**：大段文本中英互译
- **创意写作**：故事、文案、标题等
- **数据分析**：解析 JSON/CSV 数据并给出洞察
- **多轮对话**：复杂问题的逐步推理

## 参数说明

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `model` | 模型名称 | `agnes-2.0-flash` |
| `messages` | 对话消息数组 | 必填 |
| `max_tokens` | 最大输出 token 数 | 2000 |
| `temperature` | 创造性（0-2，越高越随机） | 0.7 |
| `top_p` | 核采样参数 | 1.0 |

## 注意事项

- 免费无限量使用，不限 Token
- 支持 1M 超长上下文窗口
- 响应速度快，通常 1-3 秒
- 支持中英文
- OpenAI 兼容接口格式
