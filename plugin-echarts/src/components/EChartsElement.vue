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

  const userOptions: any = props.element.props?.echartsOption || {};
  const dataset: any = props.element.props?.dataset || null;

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

  const showValue = props.element.props?.custom_showValue !== false;
  const showPercent = props.element.props?.custom_showPercent !== false;

  const generatedSeries = Array.from({ length: numSeries }).map(() => {
    const s: any = {
      type: seriesType,
      seriesLayoutBy: layoutBy
    };
    
    // Auto-show percentage for charts that natively support it ({d})
    if (seriesType === 'pie' || seriesType === 'funnel') {
      s.label = {
        show: true,
        formatter: function(params: any) {
          let val = params.value;
          if (Array.isArray(val)) {
            // ECharts maps a specific dimension to the pie value
            const encodeIdx = params.encode?.value?.[0];
            val = encodeIdx !== undefined ? val[encodeIdx] : val[1];
          }
          
          let res = params.name;
          if (showValue) res += `: ${val}`;
          if (showPercent) res += ` (${params.percent}%)`;
          return res;
        }
      };
    } else {
      if (showValue && seriesType !== 'candlestick' && seriesType !== 'heatmap' && seriesType !== 'radar') {
        s.label = { show: true };
      }
    }
    return s;
  });

  const finalOptions: echarts.EChartsCoreOption = {
    ...defaultChartOptions,
    ...userOptions,
    series: generatedSeries
  };

  // Remove cartesian axes for polar/non-cartesian charts to prevent errors
  const nonCartesianTypes = ['pie', 'radar', 'funnel', 'sunburst', 'treemap'];
  if (nonCartesianTypes.includes(seriesType)) {
    delete finalOptions.xAxis;
    delete finalOptions.yAxis;
  }

  // Auto-generate radar config if missing
  if (seriesType === 'radar' && !finalOptions.radar) {
    let indicators: any[] = [];
    if (dataset && Array.isArray(dataset.source) && dataset.source.length > 1) {
      if (layoutBy === 'row') {
        // Categories are in the first row (cols 1..N)
        const headers = dataset.source[0];
        indicators = headers.slice(1).map((name: string) => ({ name: name || '?' }));
      } else {
        // Categories are in the first column (rows 1..N)
        indicators = dataset.source.slice(1).map((row: any[]) => ({ name: row[0] || '?' }));
      }
    }
    if (indicators.length === 0) {
      indicators = [{ name: 'A' }, { name: 'B' }, { name: 'C' }];
    }
    finalOptions.radar = { indicator: indicators };
  }

  // Auto-generate visualMap and transform data for heatmap
  if (seriesType === 'heatmap') {
    finalOptions.xAxis = { type: 'category' };
    finalOptions.yAxis = { type: 'category' };
    
    let min = 0;
    let max = 100;
    
    if (dataset && Array.isArray(dataset.source) && dataset.source.length > 1) {
      const xData: string[] = [];
      const yData: string[] = [];
      const heatmapData: [number, number, number][] = [];
      
      if (layoutBy === 'row') {
         const headers = dataset.source[0];
         for (let i = 1; i < headers.length; i++) xData.push(headers[i]);
         for (let i = 1; i < dataset.source.length; i++) {
            yData.push(dataset.source[i][0]);
            for (let j = 1; j < dataset.source[i].length; j++) {
               const val = Number(dataset.source[i][j]);
               heatmapData.push([j - 1, i - 1, isNaN(val) ? 0 : val]);
            }
         }
      } else {
         const headers = dataset.source[0];
         for (let i = 1; i < headers.length; i++) yData.push(headers[i]);
         for (let i = 1; i < dataset.source.length; i++) {
            xData.push(dataset.source[i][0]);
            for (let j = 1; j < dataset.source[i].length; j++) {
               const val = Number(dataset.source[i][j]);
               heatmapData.push([i - 1, j - 1, isNaN(val) ? 0 : val]);
            }
         }
      }

      (finalOptions.xAxis as any).data = xData;
      (finalOptions.yAxis as any).data = yData;
      
      finalOptions.series = [{
         type: 'heatmap',
         data: heatmapData,
         label: { show: true }
      }];
      
      const values = heatmapData.map(item => item[2]);
      if (values.length > 0) {
        min = Math.min(...values);
        max = Math.max(...values);
      }
      
      // Delete dataset so ECharts uses our mapped series data directly
      delete finalOptions.dataset;
    }

    if (!finalOptions.visualMap) {
      finalOptions.visualMap = {
        min,
        max,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '0%'
      };
    }
  } else if (seriesType === 'candlestick') {
    // Candlestick needs exactly 4 values per category: [open, close, lowest, highest]
    finalOptions.xAxis = { type: 'category' };
    finalOptions.yAxis = { type: 'value' };
    
    if (dataset && Array.isArray(dataset.source) && dataset.source.length > 1) {
      const xData: string[] = [];
      const kData: [number, number, number, number][] = [];
      
      if (layoutBy === 'row') {
        const headers = dataset.source[0];
        for (let i = 1; i < headers.length; i++) xData.push(headers[i]);
        
        for (let j = 1; j < headers.length; j++) {
           const open = Number(dataset.source[1]?.[j]) || 0;
           const close = Number(dataset.source[2]?.[j]) || open;
           const lowest = Number(dataset.source[3]?.[j]) || Math.min(open, close);
           const highest = Number(dataset.source[4]?.[j]) || Math.max(open, close);
           kData.push([open, close, lowest, highest]);
        }
      } else {
        for (let i = 1; i < dataset.source.length; i++) {
           xData.push(dataset.source[i][0]);
           const open = Number(dataset.source[i][1]) || 0;
           const close = Number(dataset.source[i][2]) || open;
           const lowest = Number(dataset.source[i][3]) || Math.min(open, close);
           const highest = Number(dataset.source[i][4]) || Math.max(open, close);
           kData.push([open, close, lowest, highest]);
        }
      }
      
      (finalOptions.xAxis as any).data = xData;
      finalOptions.series = [{
         type: 'candlestick',
         data: kData
      }];
      delete finalOptions.dataset;
    }
  } else if (dataset) {
    finalOptions.dataset = dataset;
  }

  // Merge the user option's series overrides (if any) onto the generated series
  if (userOptions.series && Array.isArray(userOptions.series)) {
    if ((seriesType === 'heatmap' || seriesType === 'candlestick') && Array.isArray(finalOptions.series) && finalOptions.series.length > 0) {
      // For heatmap and candlestick, we have a single manually constructed series. Merge user options onto it without losing data.
      finalOptions.series[0] = {
        ...finalOptions.series[0],
        ...(userOptions.series[0] || {})
      };
    } else {
      finalOptions.series = generatedSeries.map((s, i) => ({
        ...s,
        ...(userOptions.series[i] || userOptions.series[0] || {})
      }));
    }
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
