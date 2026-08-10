<template>
  <n-config-provider :theme="isDarkTheme ? darkTheme : null">
    <n-message-provider>
      <Cooperation />
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { NConfigProvider, darkTheme, NMessageProvider } from 'naive-ui';
import { useCanvasContext } from '@iss-ai/ppt-board';
import Cooperation from './composables/Cooperation.vue';

const ctx = useCanvasContext();
const isDarkTheme = computed(() => ctx.state?.editor?.theme === 'dark');
</script>
