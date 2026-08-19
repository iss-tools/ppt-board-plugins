<template>
  <n-config-provider
    v-if="isVisible"
    class="plugin-echarts-settings-overlay"
    :theme="isDarkTheme ? darkTheme : null"
    :class="{ dark: isDarkTheme }"
    :style="panelStyle"
  >
    <div class="panel-container" @mousedown.stop @touchstart.stop>
      <n-tabs type="segment" animated>
        <!-- Chart Settings Tab -->
        <n-tab-pane v-if="isChart" name="chart" :tab="t('echarts.settings.chartTypeTab')">
          <div class="settings-group">
            <n-space vertical>
              <n-text depth="3">{{ t('echarts.settings.basicSettings') }}</n-text>
              <div class="prop-item">
                <span class="prop-label">{{ t('echarts.settings.chartType') }}</span>
                <n-select
                  v-model:value="globalChartType"
                  :options="chartTypeOptions"
                  size="small"
                  style="width: 140px"
                />
              </div>
              <n-text depth="3" style="margin-top: 12px">{{
                t('echarts.settings.dataMapping')
              }}</n-text>
              <n-radio-group v-model:value="seriesLayoutBy" name="layoutByGroup">
                <n-space vertical>
                  <n-radio value="column">
                    {{ t('echarts.settings.mapByColumn') }}
                    <n-text depth="3" style="font-size: 12px">{{
                      t('echarts.settings.colAsX')
                    }}</n-text>
                  </n-radio>
                  <n-radio value="row">
                    {{ t('echarts.settings.mapByRow') }}
                    <n-text depth="3" style="font-size: 12px">{{
                      t('echarts.settings.rowAsX')
                    }}</n-text>
                  </n-radio>
                </n-space>
              </n-radio-group>

              <n-text depth="3" style="margin-top: 12px">{{
                t('echarts.settings.labelSettings')
              }}</n-text>
              <n-space vertical :size="8">
                <n-checkbox v-model:checked="showLabelValue">{{
                  t('echarts.settings.showValue')
                }}</n-checkbox>
                <n-checkbox v-model:checked="showLabelPercent" :disabled="!isPercentSupported">{{
                  t('echarts.settings.showPercent')
                }}</n-checkbox>
                <n-checkbox v-model:checked="showLegend">{{
                  t('echarts.settings.showLegend')
                }}</n-checkbox>
              </n-space>
            </n-space>
          </div>
        </n-tab-pane>

        <!-- Data Editor Tab -->
        <n-tab-pane name="data" :tab="t('echarts.settings.dataEditTab')">
          <div class="settings-group">
            <n-space vertical>
              <n-text depth="3" style="font-size: 12px; margin-bottom: 8px">
                {{ t('echarts.settings.dataPasteTip') }}
              </n-text>
              <n-input
                v-model:value="rawData"
                type="textarea"
                :rows="10"
                placeholder=""
                style="font-family: monospace; font-size: 12px; white-space: pre"
                @blur="onDataUpdate"
              />
              <n-button type="primary" size="small" block @click="onDataUpdate">{{
                t('echarts.settings.applyData')
              }}</n-button>
            </n-space>
          </div>
        </n-tab-pane>
      </n-tabs>
    </div>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  NConfigProvider,
  NTabs,
  NTabPane,
  NSpace,
  NText,
  NSelect,
  NInput,
  NButton,
  NRadioGroup,
  NRadio,
  NCheckbox,
  darkTheme,
  NCollapse,
  NCollapseItem,
} from 'naive-ui';
import { useCanvasContext } from '@iss-ai/ppt-board';
import { useI18n } from '../composables/useI18n';

const ctx = useCanvasContext();
const { t } = useI18n();
const state = ctx.state;

const isDarkTheme = computed(() => state.editor?.theme === 'dark');

const selectedElement = computed(() => {
  if (!state.runtime.selectedIds || state.runtime.selectedIds.size !== 1) return null;
  const selectedId = Array.from(state.runtime.selectedIds)[0];
  const el = state.runtime.activeElements.find((e: any) => e.id === selectedId);
  if (el && (el.type === 'echarts' || el.type === 'e-table')) {
    return el;
  }
  return null;
});

const isVisible = computed(() => {
  return (
    selectedElement.value !== null &&
    (selectedElement.value.type === 'echarts' || selectedElement.value.type === 'etable')
  );
});

const panelStyle = computed(() => {
  const el = selectedElement.value;
  if (!el || !isVisible.value) return {};

  const { scale, offsetX, offsetY, width } = ctx.state.runtime;

  // Calculate position: right side of the element
  let left = (el.x + (el.width || 300)) * scale + offsetX + 16;
  let top = el.y * scale + offsetY;

  const panelWidth = 280;

  // Flip to left side if it overflows the canvas container's right edge
  if (left + panelWidth > width) {
    left = el.x * scale + offsetX - panelWidth - 16;
  }

  return {
    left: `${left}px`,
    top: `${Math.max(16, top)}px`,
    right: 'auto',
    bottom: 'auto',
  };
});

const isChart = computed(() => selectedElement.value?.type === 'echarts');

const chartTypeOptions = computed(() => [
  { label: t('echarts.chartTypes.bar'), value: 'bar' },
  { label: t('echarts.chartTypes.line'), value: 'line' },
  { label: t('echarts.chartTypes.pie'), value: 'pie' },
  { label: t('echarts.chartTypes.scatter'), value: 'scatter' },
  { label: t('echarts.chartTypes.funnel'), value: 'funnel' },
  { label: t('echarts.chartTypes.radar'), value: 'radar' },
  { label: t('echarts.chartTypes.heatmap'), value: 'heatmap' },
  { label: t('echarts.chartTypes.candlestick'), value: 'candlestick' },
]);

const globalChartType = computed({
  get: () => {
    if (!selectedElement.value || selectedElement.value.type !== 'echarts') return 'bar';
    const series = (selectedElement.value.props?.echartsOption as any)?.series;
    if (Array.isArray(series) && series.length > 0) {
      return series[0].type || 'bar';
    }
    return 'bar';
  },
  set: (newType: string) => {
    if (!selectedElement.value) return;
    const currentOption: any = selectedElement.value.props?.echartsOption || { series: [] };

    // We update the first series (or all existing series) to this type
    const newSeries =
      Array.isArray(currentOption.series) && currentOption.series.length > 0
        ? currentOption.series.map((s: any) => ({ ...s, type: newType }))
        : [{ type: newType }];

    ctx.api.elements.update(selectedElement.value.id, {
      props: {
        ...selectedElement.value.props,
        echartsOption: {
          ...currentOption,
          series: newSeries,
        },
      },
    });
  },
});

const seriesLayoutBy = computed({
  get: () => {
    if (!selectedElement.value || selectedElement.value.type !== 'echarts') return 'column';
    return (selectedElement.value.props?.echartsOption as any)?.seriesLayoutBy || 'column';
  },
  set: (newLayout: string) => {
    if (!selectedElement.value) return;
    const currentOption = selectedElement.value.props?.echartsOption || {};

    ctx.api.elements.update(selectedElement.value.id, {
      props: {
        ...selectedElement.value.props,
        echartsOption: {
          ...currentOption,
          seriesLayoutBy: newLayout,
        },
      },
    });
  },
});

const isPercentSupported = computed(() => {
  return globalChartType.value === 'pie' || globalChartType.value === 'funnel';
});

const showLabelValue = computed({
  get: () => selectedElement.value?.props?.custom_showValue !== false,
  set: (val: boolean) => {
    if (!selectedElement.value) return;
    ctx.api.elements.update(selectedElement.value.id, {
      props: {
        ...selectedElement.value.props,
        custom_showValue: val,
      },
    });
  },
});

const showLabelPercent = computed({
  get: () => selectedElement.value?.props?.custom_showPercent !== false,
  set: (val: boolean) => {
    if (!selectedElement.value) return;
    ctx.api.elements.update(selectedElement.value.id, {
      props: {
        ...selectedElement.value.props,
        custom_showPercent: val,
      },
    });
  },
});

const showLegend = computed({
  get: () => {
    if (!selectedElement.value) return true;
    const opt: any = selectedElement.value.props?.echartsOption;
    return opt?.legend?.show !== false;
  },
  set: (val: boolean) => {
    if (!selectedElement.value) return;
    const currentOption: any = selectedElement.value.props?.echartsOption || {};

    ctx.api.elements.update(selectedElement.value.id, {
      props: {
        ...selectedElement.value.props,
        echartsOption: {
          ...currentOption,
          legend: {
            ...(currentOption.legend || { bottom: 0 }),
            show: val,
          },
        },
      },
    });
  },
});

const rawData = ref('');

// Parse dataset.source into TSV text when selection changes
watch(
  selectedElement,
  newEl => {
    if (newEl && (newEl.props?.dataset as any)?.source) {
      const source = (newEl.props!.dataset as any).source as any[][];
      rawData.value = source.map(row => row.join('\t')).join('\n');
    } else {
      rawData.value = '';
    }
  },
  { immediate: true }
);

const onDataUpdate = () => {
  if (!selectedElement.value) return;
  const lines = rawData.value.split('\n');
  const source = lines.map(line => line.split('\t').map(cell => cell.trim()));

  ctx.api.elements.update(selectedElement.value.id, {
    props: {
      ...selectedElement.value.props,
      dataset: { source },
    },
  });
};
</script>

<style scoped>
.plugin-echarts-settings-overlay {
  position: absolute;
  right: 360px; /* offset from the standard properties panel */
  top: 16px;
  width: 280px;
  max-height: calc(100vh - 96px);
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 998;
  pointer-events: auto;
  overflow: hidden;
}

.panel-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding: 12px;
}

.settings-group {
  padding: 8px 0;
}

.prop-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}
.prop-label {
  font-size: 13px;
  color: #666;
}

/* Dark Theme Overrides */
.plugin-echarts-settings-overlay.dark {
  background: #2a2a2a;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  color: #e0e0e0;
}
.plugin-echarts-settings-overlay.dark .prop-label {
  color: #aaa;
}
</style>
