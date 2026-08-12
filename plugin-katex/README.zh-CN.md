# @iss-ai/plugin-katex

`vue-canvas` (ppt-board) 的 KaTeX 数学公式插件。提供在画布中通过 LaTeX 语法直接渲染高质量数学公式的能力。

## 核心特性

- **KaTeX 高清渲染:** 使用标准的 LaTeX 语法在幻灯片中插入复杂的数学公式与方程组。
- **极致性能:** 底层搭载 KaTeX 引擎，享受接近服务端级别的极速渲染速度与排版质量。
- **主题兼容:** 完美融入画布引擎，自动适配文字颜色，确保在深浅色背景主题下公式依然清晰可见。

## 安装

```bash
pnpm install @iss-ai/plugin-katex katex naive-ui
```

## 使用方法

在宿主编辑器中注册该插件：

```vue
<template>
  <VueCanvasEditor :plugins="[KatexPlugin]" />
</template>

<script setup>
import { VueCanvasEditor } from '@iss-ai/ppt-board';
import KatexPlugin from '@iss-ai/plugin-katex';
</script>
```

## 开源协议
MIT
