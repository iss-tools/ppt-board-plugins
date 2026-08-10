# @iss-ai/plugin-cooperation

基于 Ably 与 WebRTC 的实时协同编辑与光标追踪插件。

为您的演示白板提供多人实时协同编辑能力。

### 主要功能
- **实时状态同步**: 基于 Ably 提供低延迟的画布状态、图形数据同步。
- **实时光标与选中状态**: 在画布上实时显示其他协作成员的光标位置及选中的元素。
- **WebRTC P2P 支持**: 支持 WebRTC 点对点直连，在部分场景下提供更低延迟的同步体验。
- **在线状态感知 (Presence)**: 实时追踪和显示当前文档的在线用户列表。

## 安装

```bash
npm install @iss-ai/plugin-cooperation
```

## 使用说明

本插件专为 `@iss-ai/ppt-board` 生态系统设计。

```typescript
import { PluginCooperation } from '@iss-ai/plugin-cooperation';

// 注册插件
board.use(PluginCooperation);
```
