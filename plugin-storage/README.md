# @iss-ai/plugin-storage

Local database and document persistence management using Dexie.

Handles saving, loading, and persistence of your presentation documents.

### Features
- **IndexedDB Persistence**: Uses `Dexie` to save documents locally in the browser.
- **Document Management**: Create new, duplicate, rename, or delete presentations.
- **Auto-save**: Ensures your progress is never lost by managing state snapshots.

## Installation

```bash
npm install @iss-ai/plugin-storage
```

## Usage

This plugin is designed to be used within the `@iss-ai/ppt-board` ecosystem.

```typescript
import { PluginStorage } from '@iss-ai/plugin-storage';

// Register the plugin
board.use(PluginStorage);
```
