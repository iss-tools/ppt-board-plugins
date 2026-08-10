# @iss-ai/plugin-ai

AI Copilot and intelligent prompt building capabilities for ppt-board.

Provides an intelligent AI Copilot panel for the presentation board. 

### Features
- **AI Chat & Copilot**: Interact with an AI assistant to generate or refine slides.
- **Visual Prompt Builder**: Construct complex prompts visually using `PromptTabVisual`.
- **Multi-Provider Support**: Built-in support for OpenAI, Anthropic, and Gemini APIs.
- **Provider Settings**: Configure your API keys and model preferences directly in the UI.

## Installation

```bash
npm install @iss-ai/plugin-ai
```

## Usage

This plugin is designed to be used within the `@iss-ai/ppt-board` ecosystem.

```typescript
import { PluginAi } from '@iss-ai/plugin-ai';

// Register the plugin
board.use(PluginAi);
```
