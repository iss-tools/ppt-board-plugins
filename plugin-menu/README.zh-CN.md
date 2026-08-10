# @iss-ai/plugin-menu

提供全局菜单、画布控制底栏与帮助面板的核心 UI 插件。

为应用提供核心的导航外壳与全局控制界面。

### 主要功能
- **顶部菜单栏**: 提供文件管理、编辑、视图等全局操作入口。
- **左下角画布控制**: 提供画布缩放、平移及视图复位等快捷操作。
- **右下角帮助面板**: 快速查看快捷键列表与帮助指引。
- **全局设置**: 配置画布背景、网格对齐、吸附等基础选项。

## 安装

```bash
npm install @iss-ai/plugin-menu
```

## 使用说明

本插件专为 `@iss-ai/ppt-board` 生态系统设计。

```typescript
import { PluginMenu } from '@iss-ai/plugin-menu';

// 注册插件
board.use(PluginMenu);
```
