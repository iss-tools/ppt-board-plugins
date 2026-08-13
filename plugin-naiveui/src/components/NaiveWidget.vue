<template>
  <component
    v-if="resolvedComponent"
    :is="resolvedComponent"
    v-bind="filteredProps"
    style="width: 100%; height: 100%;"
  >
    <!-- Pass down all slots -->
    <template v-for="(content, name) in element?.slots" :key="name" #[name]>
      <span v-if="typeof content === 'string'" v-html="content" style="white-space: pre-wrap"></span>
    </template>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import * as NaiveUI from 'naive-ui';
import type { CanvasElementData } from '@iss-ai/ppt-board';

const props = defineProps<{
  element: CanvasElementData;
  isEditing?: boolean;
}>();

// Resolve the actual Naive UI component
const resolvedComponent = computed(() => {
  const type = props.element?.props?.naiveType || props.element?.type;
  if (!type) return 'div'; // Fallback
  
  // Try to find it in the imported NaiveUI module
  const comp = (NaiveUI as any)[type];
  if (comp) return comp;
  
  // If not found, return the string (Vue will try to resolve globally or render as HTML tag)
  return type;
});

// Filter out our internal props so they don't pollute the DOM/Vue warnings
const filteredProps = computed(() => {
  if (!props.element?.props) return {};
  const { naiveType, ...rest } = props.element.props;
  return rest;
});
</script>

<style scoped>
.naive-widget-wrapper {
  display: flex;
  flex-direction: column;
}
/* Ensure the inner component fills the wrapper if possible, or respects its own size */
.naive-widget-wrapper > * {
  flex: 1;
}
</style>
