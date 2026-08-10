# @iss-ai/plugin-menu

Core UI navigation, canvas controls, and global settings menu.

The core navigational shell and global controls for the application.

### Features
- **Top Menu Navigation**: Global file, edit, and view actions.
- **Bottom Left Controls**: Canvas zoom, pan, and view-port management.
- **Bottom Right Help**: Quick access to keyboard shortcuts and help modals.
- **Global Settings**: Configure canvas background, grid, and snapping options.

## Installation

```bash
npm install @iss-ai/plugin-menu
```

## Usage

This plugin is designed to be used within the `@iss-ai/ppt-board` ecosystem.

```typescript
import { PluginMenu } from '@iss-ai/plugin-menu';

// Register the plugin
board.use(PluginMenu);
```
