<template>
  <div class="vue-canvas-echarts-element" :style="wrapperStyle">
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import type { CanvasElementData } from '@iss-ai/ppt-board';
import * as echarts from 'echarts';

const props = defineProps<{
  element: CanvasElementData;
  isEditing: boolean;
}>();

const emit = defineEmits<{
  (e: 'update', props: Record<string, any>, isTransient?: boolean): void;
  (e: 'finishEdit'): void;
}>();

const chartRef = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

const wrapperStyle = computed(() => {
  return {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: (props.element.props?.backgroundColor as string) || 'transparent',
  };
});

const defaultChartOptions = {
  tooltip: {},
  xAxis: { type: 'category' },
  yAxis: {},
  series: [{ type: 'bar' }]
};

const renderChart = () => {
  if (!chartRef.value) return;
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value);
  }

  const userOptions = props.element.props?.echartsOption || {};
  const dataset = props.element.props?.dataset || null;

  const finalOptions: echarts.EChartsCoreOption = {
    ...defaultChartOptions,
    ...userOptions,
  };

  if (dataset) {
    finalOptions.dataset = dataset;
  }

  chartInstance.setOption(finalOptions, true);
};

onMounted(() => {
  nextTick(() => {
    renderChart();
  });
});

watch(
  () => [props.element.width, props.element.height],
  () => {
    if (chartInstance) {
      chartInstance.resize();
    }
  }
);

watch(
  () => props.element.props,
  () => {
    renderChart();
  },
  { deep: true }
);

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});
</script>

<style scoped>
.vue-canvas-echarts-element {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}
.chart-container {
  width: 100%;
  height: 100%;
}
</style>
