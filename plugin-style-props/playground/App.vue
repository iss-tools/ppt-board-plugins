<template>
  <div style="height: 100vh; width: 100vw; overflow: hidden; display: flex; flex-direction: column;">

    <div style="flex: 1; position: relative;">
      <VueCanvasEditor ref="editorRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { VueCanvasEditor } from '@iss-ai/ppt-board';
import { StylePropsPlugin } from '../src/index';
import normalData from './data/normal.json';

const editorRef = ref<InstanceType<typeof VueCanvasEditor> | null>(null);

const loadNormalData = () => {
  if (editorRef.value) {
    editorRef.value.loadData(normalData);
    editorRef.value.setPresentationMode?.('default');
  }
};
onMounted(() => {
  if (editorRef.value) {
    loadNormalData()
    editorRef.value.setLanguage('zh')
    editorRef.value.usePlugin?.(StylePropsPlugin);
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