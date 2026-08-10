# @iss-ai/plugin-cooperation

Real-time collaboration, cursor tracking, and state sync via Ably & WebRTC.

Enables multiplayer real-time collaboration for your presentation board.

### Features
- **Real-Time State Sync**: Seamlessly synchronize canvas state and shapes across multiple clients using Ably.
- **Live Cursors & Selections**: See what other users are selecting and where their cursors are in real-time.
- **WebRTC P2P Support**: Built-in capabilities to fall back or upgrade to WebRTC Peer-to-Peer connections for lower latency.
- **Presence Management**: Track active users currently editing the document.

## Installation

```bash
npm install @iss-ai/plugin-cooperation
```

## Usage

This plugin is designed to be used within the `@iss-ai/ppt-board` ecosystem.

```typescript
import { PluginCooperation } from '@iss-ai/plugin-cooperation';

// Register the plugin
board.use(PluginCooperation);
```
