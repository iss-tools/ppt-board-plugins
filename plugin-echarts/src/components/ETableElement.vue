<template>
  <div class="vue-canvas-etable-element" :class="{ 'is-editing': isEditing, 'dark': isDark }" :style="wrapperStyle">
    <table class="etable">
      <thead v-if="headers.length > 0">
        <tr>
          <th v-for="(col, colIndex) in headers" :key="colIndex"
              :contenteditable="isEditing"
              @blur="onCellBlur($event, 0, colIndex)"
              @keydown.enter.prevent="($event.target as HTMLElement)?.blur()">
            {{ col }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
          <td v-for="(cell, colIndex) in row" :key="colIndex"
              :contenteditable="isEditing"
              @blur="onCellBlur($event, rowIndex + 1, colIndex)"
              @keydown.enter.prevent="($event.target as HTMLElement)?.blur()">
            {{ cell }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCanvasContext } from '@iss-ai/ppt-board';
import type { CanvasElementData } from '@iss-ai/ppt-board';

const props = defineProps<{
  element: CanvasElementData;
  isEditing: boolean;
}>();

const emit = defineEmits<{
  (e: 'update', props: Record<string, any>, isTransient?: boolean): void;
  (e: 'finishEdit'): void;
}>();

const ctx = useCanvasContext();
const isDark = computed(() => ctx.state.editor?.theme === 'dark');

const wrapperStyle = computed(() => {
  return {
    width: '100%',
    height: '100%',
    overflow: 'auto',
    backgroundColor: (props.element.props?.backgroundColor as string) || (isDark.value ? 'transparent' : '#ffffff'),
    color: (props.element.props?.color as string) || (isDark.value ? '#e0e0e0' : '#333333'),
  };
});

const datasetSource = computed<any[][]>(() => {
  const ds: any = props.element.props?.dataset;
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

const onCellBlur = (e: Event, rIdx: number, cIdx: number) => {
  const target = e.target as HTMLElement;
  const newValue = target.innerText.trim();
  
  if (newValue !== datasetSource.value[rIdx][cIdx]) {
    // Clone array
    const newDataset = datasetSource.value.map(row => [...row]);
    newDataset[rIdx][cIdx] = newValue;
    
    emit('update', {
      dataset: { source: newDataset }
    }, false);
  }
};
</script>

<style scoped>
.vue-canvas-etable-element {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 8px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: box-shadow 0.2s, outline 0.2s;
}

.vue-canvas-etable-element.is-editing {
  outline: 2px solid #00ccff;
  box-shadow: 0 4px 12px rgba(0, 204, 255, 0.3);
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

/* Dark Theme Overrides */
.vue-canvas-etable-element.dark .etable th,
.vue-canvas-etable-element.dark .etable td {
  border-color: #444444;
}

.vue-canvas-etable-element.dark .etable th {
  background-color: #333333;
  color: #eeeeee;
}

.vue-canvas-etable-element.dark .etable tr:nth-child(even) {
  background-color: rgba(255, 255, 255, 0.05);
}

.vue-canvas-etable-element.dark .etable tr:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
