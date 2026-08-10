# @iss-ai/plugin-style-props

Comprehensive properties inspector, timeline, and animation editor.

The main properties inspector panel on the right side of the editor.

### Features
- **Style Tab**: Modify colors, strokes, opacity, and other visual properties.
- **Props Tab**: Context-aware properties based on the selected element type.
- **Animation Picker**: Apply entrance, emphasis, and exit animations (powered by Anime.js / Animate.css).
- **Timeline Tab**: Sequence animations, adjust durations, and manage visual layering.
- **Audio & Fonts**: Manage embedded audio assets and custom fonts.

## Installation

```bash
npm install @iss-ai/plugin-style-props
```

## Usage

This plugin is designed to be used within the `@iss-ai/ppt-board` ecosystem.

```typescript
import { PluginStyleProps } from '@iss-ai/plugin-style-props';

// Register the plugin
board.use(PluginStyleProps);
```
