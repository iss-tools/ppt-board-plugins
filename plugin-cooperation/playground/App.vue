<template>
  <div style="height: 100vh; width: 100vw; overflow: hidden; display: flex; flex-direction: column;">
    <div style="padding: 10px; background: #333; color: white;">
      <h3>Vue Canvas Plugin Example</h3>
      <p style="font-size: 12px; margin: 0;">Open console to see plugin event logs</p>
    </div>
    <div style="flex: 1; position: relative;">
      <VueCanvasEditor ref="editorRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { VueCanvasEditor } from '@iss-ai/ppt-board';
import { createCooperationPlugin } from '../src/index';
import normalData from './data/normal.json';

const editorRef = ref<InstanceType<typeof VueCanvasEditor> | null>(null);

// @ts-ignore
const ablyApiKey = import.meta.env.VITE_ABLY_API_KEY;
const CooperationPlugin = createCooperationPlugin({ useP2P: true, ablyApiKey });

const loadNormalData = () => {
  if (editorRef.value) {
    editorRef.value.loadData(normalData);
    editorRef.value.setPresentationMode?.('default');
  }
};
onMounted(() => {
  if (editorRef.value) {
    loadNormalData()
    editorRef.value.usePlugin?.(CooperationPlugin);
  }
});
</script>

<style>
body {
  margin: 0;
  font-family: sans-serif;
  background-color: #1a1a1a;
}
</style>