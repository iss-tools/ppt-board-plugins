<template>
  <div class="vue-canvas-etable-element" :style="wrapperStyle">
    <table class="etable">
      <thead v-if="headers.length > 0">
        <tr>
          <th v-for="(col, index) in headers" :key="index">{{ col }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
          <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CanvasElementData } from '@iss-ai/ppt-board';

const props = defineProps<{
  element: CanvasElementData;
  isEditing: boolean;
}>();

const emit = defineEmits<{
  (e: 'update', props: Record<string, any>, isTransient?: boolean): void;
  (e: 'finishEdit'): void;
}>();

const wrapperStyle = computed(() => {
  return {
    width: '100%',
    height: '100%',
    overflow: 'auto',
    backgroundColor: (props.element.props?.backgroundColor as string) || '#ffffff',
  };
});

const datasetSource = computed<any[][]>(() => {
  const ds = props.element.props?.dataset;
  if (ds && Array.isArray(ds.source)) {
    return ds.source;
  }
  return [
    ['Header 1', 'Header 2', 'Header 3'],
    ['Row 1', 'Data', 'Data'],
    ['Row 2', 'Data', 'Data']
  ]; // Fallback mock data
});

const headers = computed(() => {
  if (datasetSource.value.length > 0) {
    return datasetSource.value[0];
  }
  return [];
});

const rows = computed(() => {
  if (datasetSource.value.length > 1) {
    return datasetSource.value.slice(1);
  }
  return [];
});
</script>

<style scoped>
.vue-canvas-etable-element {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 8px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.etable {
  width: 100%;
  border-collapse: collapse;
  font-family: sans-serif;
  font-size: 14px;
}

.etable th,
.etable td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
  white-space: nowrap;
}

.etable th {
  background-color: #f2f2f2;
  font-weight: bold;
}

.etable tr:nth-child(even) {
  background-color: #f9f9f9;
}

.etable tr:hover {
  background-color: #f1f1f1;
}
</style>
