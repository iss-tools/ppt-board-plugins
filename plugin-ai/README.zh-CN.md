# @iss-ai/plugin-ai

为 ppt-board 提供的 AI 增强能力与智能 Prompt 构建插件。

为演示白板提供智能 AI 助手面板，助力内容的快速生成与润色。

### 主要功能
- **AI 对话助手**: 通过自然语言与 AI 交互，快速生成或修改幻灯片内容。
- **可视化 Prompt 构建器**: 提供图形化的 Prompt 编排工具，轻松拼装复杂指令。
- **多模型支持**: 内置 OpenAI, Anthropic, 和 Gemini 等主流大模型 API 接入。
- **模型设置与管理**: 支持在界面中快速配置 API Key 与模型偏好。

## 安装

```bash
npm install @iss-ai/plugin-ai
```

## 使用说明

本插件专为 `@iss-ai/ppt-board` 生态系统设计。

```typescript
import { PluginAi } from '@iss-ai/plugin-ai';

// 注册插件
board.use(PluginAi);
```
