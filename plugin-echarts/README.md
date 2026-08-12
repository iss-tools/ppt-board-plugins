# @iss-ai/plugin-echarts

A plugin for `vue-canvas` (ppt-board) that provides robust support for inserting, rendering, and editing ECharts components and Data Tables directly on the canvas.

## Features

- **Interactive ECharts:** Seamlessly embed rich ECharts (Bar, Line, Pie, Scatter, Funnel, Radar, Heatmap, Candlestick).
- **Tabular Data Editing:** Includes a built-in Data Table element (`ETableElement`) and floating properties panel.
- **Smart Paste:** Automatically detects TSV data pasted from spreadsheets (Excel, Google Sheets) and prompts the user to insert it as a Chart or Table.
- **Dynamic Theming:** Deep integration with host themes. Automatically transitions chart elements and table backgrounds to dark mode when the canvas switches to dark mode.
- **Internationalization (i18n):** Full English (en) and Chinese (zh) support for all UI text, settings panels, and prompts.

## Installation

```bash
pnpm install @iss-ai/plugin-echarts echarts naive-ui
```

## Usage

```vue
<template>
  <VueCanvasEditor :language="editorLanguage" :plugins="[EChartsPlugin]" />
</template>

<script setup>
import { VueCanvasEditor } from '@iss-ai/ppt-board';
import EChartsPlugin from '@iss-ai/plugin-echarts';
</script>
```

## License
MIT
