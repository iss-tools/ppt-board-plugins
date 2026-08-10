# @iss-ai/plugin-style-props

全能属性检查器、样式编辑、时间轴与动画配置插件。

编辑器右侧的核心属性检查器面板。

### 主要功能
- **样式选项卡 (Style)**: 调整填充色、描边、透明度等基础视觉属性。
- **属性选项卡 (Props)**: 根据当前选中的元素类型，动态展示可配置的高级属性。
- **动画配置 (Animation)**: 为元素添加进入、强调、退出等丰富动画（基于 Anime.js / Animate.css）。
- **时间轴 (Timeline)**: 编排动画顺序、调整时长，以及管理元素的图层层级。
- **音频与字体**: 管理内置的音效资源与自定义特殊字体。

## 安装

```bash
npm install @iss-ai/plugin-style-props
```

## 使用说明

本插件专为 `@iss-ai/ppt-board` 生态系统设计。

```typescript
import { PluginStyleProps } from '@iss-ai/plugin-style-props';

// 注册插件
board.use(PluginStyleProps);
```
