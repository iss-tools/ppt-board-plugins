# Vue Canvas Example Plugin

This is a demonstration of the `@iss-ai/vue-canvas` Plugin API. It illustrates how to leverage the highly-extensible `CanvasPluginContext` to interact with the core engine without modifying the internal source code.

## Files

- `index.ts`: The plugin entrypoint containing the lifecycle hooks (`install`, `destroy`).
- `ExampleOverlay.vue`: A Vue component that gets dynamically injected into the canvas view via `ctx.ui.registerOverlay`.

## What it Demonstrates

1. **Event Hijacking**: Uses `ctx.hooks.on` to listen to `change`, `select`, and `language-change` events. Check the browser console to see the logs when you interact with the canvas!
2. **UI Injection**: Demonstrates how to inject a custom Vue component directly into the Canvas rendering loop.
3. **Core API Manipulation**: Shows how to use `ctx.api.addElement()` to mutate the canvas state safely (bypassing Vue reactivity issues).
4. **Toolbar & Context Menu Hooks**: Registers mock configurations for toolbar items and context menus (these will render once the editor toolbar/context-menu UI iterates over `pluginManager.toolbarItems` and `pluginManager.contextMenuItems`).

## How to test it in Playground

To test this plugin, open `/playground/App.vue` or your main editor entry point and register it:

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { CanvasEditor } from '../src';
import { ExamplePlugin } from '../plugins/plugin-katex';

const editorRef = ref();

onMounted(() => {
  // Register the plugin!
  editorRef.value.usePlugin(ExamplePlugin);
});
</script>
```
