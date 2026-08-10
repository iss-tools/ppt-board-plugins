<template>
  <div class="example-plugin-overlay">
    <div class="header">
      <h4>💡 Example Plugin</h4>
    </div>
    <div class="content">
      <p>I am a floating UI overlay injected by a plugin!</p>
      <div class="actions">
        <button @click="handleClick">Test Action</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCanvasContext } from '@iss-ai/ppt-board';

const { api } = useCanvasContext();

const zoomIn = () => {
  api?.editor?.setScale(Math.min(3, 1 + 0.1));
};

const zoomOut = () => {
  api?.editor?.setScale(Math.max(0.1, 1 - 0.1));
};

const handleClick = () => {
  if (api && api.elements) {
    api.elements.add({
      id: `rect_${Date.now()}`,
      type: 'div',
      x: 150,
      y: 150,
      width: 200,
      height: 100,
      props: {
        text: 'This is test!!!',
        style: 'background-color: #ffcc00; border: 2px solid #333; border-radius: 8px; color: black; font-weight: bold;'
      }
    });
    alert('Added a Golden Rectangle from Overlay using Plugin API!');
  } else {
    alert('Hello from the injected overlay! (Plugin API not found)');
  }
};
</script>

<style scoped>
.example-plugin-overlay {
  position: absolute;
  bottom: 30px;
  right: 30px;
  width: 250px;
  background: var(--canvas-panel-bg, #2a2a2a);
  border: 1px solid var(--canvas-border-color, #444);
  color: var(--canvas-text-color, #eee);
  border-radius: 8px;
  z-index: 9999;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: sans-serif;
}

.header {
  background: rgba(255, 255, 255, 0.05);
  padding: 10px 15px;
  border-bottom: 1px solid var(--canvas-border-color, #444);
}

.header h4 {
  margin: 0;
  font-size: 14px;
}

.content {
  padding: 15px;
}

.content p {
  font-size: 12px;
  margin: 0 0 15px 0;
  line-height: 1.4;
  opacity: 0.8;
}

.actions button {
  background: var(--canvas-active-color, #007bff);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  width: 100%;
  transition: opacity 0.2s;
}

.actions button:hover {
  opacity: 0.9;
}
</style>
