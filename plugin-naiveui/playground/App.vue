<template>
  <n-config-provider style="height: 100vh; width: 100vw; overflow: hidden; display: flex; flex-direction: column;">
    <div style="padding: 10px; background: #333; color: white;">
      <h3>Vue Canvas Plugin NaiveUI</h3>
      <p style="font-size: 12px; margin: 0;">Open console to see plugin event logs</p>
      <button @click="printComponents">Print Custom Components</button>
    </div>
    <div style="flex: 1; position: relative; display: flex;">
      <div style="width: 200px; padding: 20px; border-right: 1px solid #555;">
        <n-card title="Native NCard">
          This is a native card rendering!
        </n-card>
      </div>
      <VueCanvasEditor ref="editorRef" :customComponents="{ NaiveWidget, DummyComponent }" style="flex: 1;" />
    </div>
  </n-config-provider>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { NConfigProvider, NCard } from 'naive-ui';
import { VueCanvasEditor } from '@iss-ai/ppt-board';
import { NaiveUIPlugin } from '../src/index';
import NaiveWidget from '../src/components/NaiveWidget.vue';
import normalData from './data/normal.json';

const DummyComponent = {
  render() { return 'DUMMY RENDER WORKS'; }
};

const editorRef = ref<InstanceType<typeof VueCanvasEditor> | null>(null);

const printComponents = () => {
  if (editorRef.value) {
    console.log('Custom Components:', Object.keys(editorRef.value.getCoreEditor().api.elements.customComponents));
    console.log('NaiveWidget:', editorRef.value.getCoreEditor().api.elements.customComponents['NaiveWidget']);
  }
};

const loadNormalData = () => {
  if (editorRef.value) {
    editorRef.value.loadData(normalData);
    editorRef.value.setPresentationMode?.('default');
  }
};
onMounted(() => {
  if (editorRef.value) {
    console.log('typeof NaiveWidget in App.vue is:', typeof NaiveWidget, NaiveWidget);
    loadNormalData()
    editorRef.value.usePlugin?.(NaiveUIPlugin);
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