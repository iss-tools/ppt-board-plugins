<template>
  <img 
    v-if="src && !hasError" 
    :src="src" 
    :title="name" 
    @error="hasError = true" 
    :class="$attrs.class"
  />
  <div 
    v-else 
    :class="[$attrs.class, 'avatar-placeholder']" 
    :style="placeholderStyle"
    :title="name"
  >
    {{ initials }}
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  src?: string;
  name: string;
  userId: string;
}>();

const hasError = ref(false);

watch(() => props.src, () => {
  hasError.value = false;
});

const initials = computed(() => {
  if (!props.name) return '?';
  return props.name.charAt(0).toUpperCase();
});

const placeholderStyle = computed(() => {
  const colors = [
    '#f87171', '#fb923c', '#fbbf24', '#a3e635', '#4ade80', 
    '#2dd4bf', '#38bdf8', '#818cf8', '#a78bfa', '#e879f9', '#f43f5e'
  ];
  let hash = 0;
  for (let i = 0; i < props.userId.length; i++) {
    hash = props.userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % colors.length;
  
  return {
    backgroundColor: colors[colorIndex],
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
  };
});
</script>

<style scoped>
.avatar-placeholder {
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  user-select: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  /* Font size will rely on parent width/height if we use container queries, 
     but typical avatars here are ~24px. So let's scale relative to element size.
     A simple way is to use a fixed em or let css handle it. */
  font-size: 0.6em;
}
</style>
