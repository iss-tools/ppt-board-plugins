# @iss-ai/plugin-echarts

`vue-canvas` (ppt-board) 的 ECharts 官方插件。提供在画布中直接插入、渲染与编辑交互式 ECharts 图表和数据表格的强大能力。

## 核心特性

- **交互式图表:** 无缝嵌入 ECharts 丰富的图表库（支持柱状图、折线图、饼图、散点图、漏斗图、雷达图、热力图、K线图）。
- **表格数据编辑:** 附带原生的数据表格元素 (`ETableElement`) 以及用于修改数据的浮动属性面板。
- **智能粘贴解析:** 自动监听并解析从电子表格（Excel、Google Sheets 等）复制粘贴的 TSV 格式数据，并智能提示用户一键插入为图表或表格。
- **动态暗黑主题:** 深度集成宿主编辑器的暗黑模式。当画布切换为暗色主题时，图表的背景、文字颜色以及表格的单元格配色会自动过渡到优雅的暗黑风格。
- **全量国际化 (i18n):** 提供中英文无缝切换的支持，所有设置面板、弹窗、操作提示均会跟随宿主编辑器的语言状态实时更新。

## 安装

```bash
pnpm install @iss-ai/plugin-echarts echarts naive-ui
```

## 使用方法

在宿主编辑器的启动入口注册该插件：

```vue
<template>
  <VueCanvasEditor :language="editorLanguage" :plugins="[EChartsPlugin]" />
</template>

<script setup>
import { VueCanvasEditor } from '@iss-ai/ppt-board';
import EChartsPlugin from '@iss-ai/plugin-echarts';
</script>
```

## 开源协议
MIT
