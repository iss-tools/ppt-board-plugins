# @iss-ai/plugin-katex

A plugin for `vue-canvas` (ppt-board) that provides high-quality math formula rendering using KaTeX.

## Features

- **KaTeX Rendering:** Insert complex mathematical formulas and equations directly into your slides with LaTeX syntax.
- **High Performance:** Utilizes KaTeX for fast, server-side-like rendering speeds.
- **Theming Compatibility:** Integrates with the canvas engine to ensure formulas are clearly visible across different background themes.

## Installation

```bash
pnpm install @iss-ai/plugin-katex katex naive-ui
```

## Usage

```vue
<template>
  <VueCanvasEditor :plugins="[KatexPlugin]" />
</template>

<script setup>
import { VueCanvasEditor } from '@iss-ai/ppt-board';
import KatexPlugin from '@iss-ai/plugin-katex';
</script>
```

## License
MIT
