# @iss-ai/plugin-my-library

个人素材库、组件抽屉及 Excalidraw 素材解析插件。

强大的素材管理系统，用于保存、复用和拖拽图形组件。

### 主要功能
- **素材抽屉**: 浏览内置素材包，支持直接拖拽到画布中使用。
- **个人素材库**: 允许用户将自定义的图形组合保存到个人库中，跨文档复用。
- **Excalidraw 兼容**: 内置解析器，支持导入并使用 Excalidraw 素材包。
- **丰富的内置资产**: 默认提供表单、数据可视化、火柴人等常用素材集合。

## 安装

```bash
npm install @iss-ai/plugin-my-library
```

## 使用说明

本插件专为 `@iss-ai/ppt-board` 生态系统设计。

```typescript
import { PluginMyLibrary } from '@iss-ai/plugin-my-library';

// 注册插件
board.use(PluginMyLibrary);
```
