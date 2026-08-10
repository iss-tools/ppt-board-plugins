# @iss-ai/plugin-storage

基于 Dexie 的本地数据库及文档持久化管理插件。

负责演示文档的保存、读取与持久化管理。

### 主要功能
- **IndexedDB 本地持久化**: 深度集成 `Dexie`，将文档安全地存储在浏览器本地数据库中。
- **文档管理面板**: 提供新建、复制、重命名、删除等完整的文档管理功能。
- **自动保存机制**: 管理状态快照，确保用户的编辑进度不会丢失。

## 安装

```bash
npm install @iss-ai/plugin-storage
```

## 使用说明

本插件专为 `@iss-ai/ppt-board` 生态系统设计。

```typescript
import { PluginStorage } from '@iss-ai/plugin-storage';

// 注册插件
board.use(PluginStorage);
```
