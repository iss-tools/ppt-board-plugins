# @iss-ai/plugin-my-library

Personal asset library, material drawer, and Excalidraw package parser.

A robust asset management system for saving and reusing components.

### Features
- **Material Drawer**: Browse and drag-and-drop pre-made assets onto your canvas.
- **Personal Library**: Save custom groups or shapes to your personal library for future use.
- **Excalidraw Integration**: Built-in parser to import and use Excalidraw libraries (`.excalidrawlib`).
- **Built-in Mock Data**: Comes with standard libraries like forms, data-viz, and stick-figures.

## Installation

```bash
npm install @iss-ai/plugin-my-library
```

## Usage

This plugin is designed to be used within the `@iss-ai/ppt-board` ecosystem.

```typescript
import { PluginMyLibrary } from '@iss-ai/plugin-my-library';

// Register the plugin
board.use(PluginMyLibrary);
```
