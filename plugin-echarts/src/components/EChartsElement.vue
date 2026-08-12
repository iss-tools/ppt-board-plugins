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

  let seriesType = 'bar';
  if (userOptions.series && Array.isArray(userOptions.series) && userOptions.series.length > 0) {
    seriesType = userOptions.series[0].type || 'bar';
  }

  // Read custom layout property
  const layoutBy = userOptions.seriesLayoutBy === 'row' ? 'row' : 'column';

  // Auto-detect number of series needed based on dataset columns/rows
  let numSeries = 1;
  if (dataset && Array.isArray(dataset.source) && dataset.source.length > 0) {
    if (layoutBy === 'row') {
      const numRows = dataset.source.length;
      numSeries = Math.max(1, numRows - 1);
    } else {
      const numColumns = dataset.source[0].length;
      numSeries = Math.max(1, numColumns - 1);
    }
  }

  // Pie charts usually only need 1 series unless customized (multiple rings)
  if (seriesType === 'pie') {
    numSeries = 1;
  }

  const generatedSeries = Array.from({ length: numSeries }).map(() => ({
    type: seriesType,
    seriesLayoutBy: layoutBy
  }));

  const finalOptions: echarts.EChartsCoreOption = {
    ...defaultChartOptions,
    ...userOptions,
    series: generatedSeries
  };

  if (dataset) {
    finalOptions.dataset = dataset;
  }

  // Merge the user option's series overrides (if any) onto the generated series
  if (userOptions.series && Array.isArray(userOptions.series)) {
    finalOptions.series = generatedSeries.map((s, i) => ({
      ...s,
      ...(userOptions.series[i] || userOptions.series[0] || {})
    }));
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
