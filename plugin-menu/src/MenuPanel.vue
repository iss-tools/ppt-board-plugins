<template>
  <div class="menu-plugin-container">
    <input
      ref="fileInputRef"
      type="file"
      accept=".json,application/json"
      multiple
      style="display: none"
      @change="handleFileChange"
    />
    <input
      ref="pptxInputRef"
      type="file"
      accept=".pptx"
      style="display: none"
      @change="handlePptxChange"
    />
    <n-config-provider :theme="isDark ? darkTheme : null">
      <div style="display: flex; gap: 8px; align-items: center">
        <n-dropdown
          v-if="!isSearchActive"
          trigger="click"
          :options="menuOptions"
          @select="handleSelect"
          placement="bottom-start"
        >
          <n-button strong secondary circle class="menu-toggle-btn">
            <template #icon>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </template>
          </n-button>
        </n-dropdown>

        <n-button
          v-else
          strong
          secondary
          circle
          class="menu-toggle-btn active-search-btn"
          @click="closeSearch"
        >
          <template #icon>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </template>
        </n-button>

        <n-input
          v-if="isSearchActive"
          ref="searchInputRef"
          v-model:value="searchQuery"
          :placeholder="t('menu.searchPlaceholder')"
          clearable
          style="width: 240px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)"
          @input="doSearch"
        >
          <template #prefix>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="color: var(--n-icon-color)"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </template>
        </n-input>
      </div>

      <!-- Mobile Bottom Bar -->
      <div v-if="ctx.state?.runtime?.isMobile" class="mobile-bottom-bar" :class="{ dark: isDark }">
        <n-button strong secondary circle class="menu-toggle-btn" @click="undo">
          <template #icon>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 7v6h6"></path>
              <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
            </svg>
          </template>
        </n-button>
        <n-button strong secondary circle class="menu-toggle-btn" @click="redo">
          <template #icon>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 7v6h-6"></path>
              <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"></path>
            </svg>
          </template>
        </n-button>
        <n-dropdown
          trigger="click"
          :options="mobileOtherOptions"
          @select="handleOtherSelect"
          placement="top"
        >
          <n-button strong secondary circle class="menu-toggle-btn">
            <template #icon>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="19" cy="12" r="1"></circle>
                <circle cx="5" cy="12" r="1"></circle>
              </svg>
            </template>
          </n-button>
        </n-dropdown>
      </div>

      <HelpModal v-model="isHelpOpen" />
    </n-config-provider>
  </div>
</template>

<script setup lang="ts">
import { h, computed, ref } from 'vue';
import {
  NConfigProvider,
  NDropdown,
  NButton,
  NSelect,
  NPopover,
  NInput,
  NPopconfirm,
  darkTheme,
  createDiscreteApi,
} from 'naive-ui';
import { useCanvasContext, useEasyStore } from '@iss-ai/ppt-board';
import ColorPickerPanel from './components/ColorPickerPanel.vue';
import CanvasSettingsPanel from './components/CanvasSettingsPanel.vue';
import HelpModal from './components/HelpModal.vue';
import { useI18n } from './composables/useI18n';
import { importPptx } from './utils/pptx-import';
import { exportPptx } from './utils/pptx-export';

const ctx = useCanvasContext();
const pptStore = useEasyStore('documents');
const { t } = useI18n();
const isDark = computed(() => ctx.state.editor?.theme === 'dark');
const fileInputRef = ref<HTMLInputElement | null>(null);
const pptxInputRef = ref<HTMLInputElement | null>(null);
const isHelpOpen = ref(false);
const isFullscreen = ref(!!document.fullscreenElement);

document.addEventListener('fullscreenchange', () => {
  isFullscreen.value = !!document.fullscreenElement;
});

const { dialog, message } = createDiscreteApi(['dialog', 'message'], {
  configProviderProps: computed(() => ({
    theme: isDark.value ? darkTheme : undefined,
  })),
});

const isSearchActive = ref(false);
const searchQuery = ref('');
const searchInputRef = ref<any>(null);

const setCanvasBackground = (bg: string) => {
  if (ctx.state.document?.config) {
    ctx.state.document.config.background = bg;
  }
  if (typeof (ctx.api?.editor as any)?.setBackground === 'function') {
    (ctx.api?.editor as any).setBackground(bg);
  } else if (typeof ctx.api?.editor?.setParams === 'function') {
    ctx.api.editor.setParams({ background: bg } as any);
  }
  document.documentElement.style.setProperty('--canvas-bg', bg);
};

const undo = () => {
  if (ctx.history && ctx.history.undo) {
    ctx.history.undo();
  }
};

const redo = () => {
  if (ctx.history && ctx.history.redo) {
    ctx.history.redo();
  }
};

const mobileOtherOptions = computed(() => [
  {
    label: t('controls.resetZoom') || '100%',
    key: 'reset_zoom',
    icon: renderRawIcon(
      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>`
    ),
  },
  {
    label: t('controls.zoomIn') || '放大',
    key: 'zoom_in',
    icon: renderRawIcon(
      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`
    ),
  },
  {
    label: t('controls.zoomOut') || '缩小',
    key: 'zoom_out',
    icon: renderRawIcon(
      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`
    ),
  },
  {
    type: 'divider',
    key: 'd_other_1',
  },
  {
    label: t('controls.previewCurrent') || '当前页演示',
    key: 'preview_current',
    icon: renderRawIcon(
      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`
    ),
  },
  {
    label: t('controls.previewPPT') || '从头演示',
    key: 'preview_ppt',
    icon: renderRawIcon(
      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h20"></path><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"></path><path d="m7 21 5-5 5 5"></path></svg>`
    ),
  },
  {
    label: isFullscreen.value ? (t('settings.exitFullscreen') || '退出全屏') : (t('settings.fullscreen') || '全屏'),
    key: 'fullscreen',
    icon: renderRawIcon(
      isFullscreen.value
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>`
    ),
  },
  {
    label: t('controls.help') || '帮助',
    key: 'help',
    icon: renderRawIcon(
      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`
    ),
  },
]);

const handleOtherSelect = (key: string) => {
  switch (key) {
    case 'reset_zoom':
      if (ctx.api?.editor?.setScale) ctx.api.editor.setScale(1);
      if (ctx.state?.runtime) {
        ctx.state.runtime.offsetX = 0;
        ctx.state.runtime.offsetY = 0;
      }
      break;
    case 'zoom_in':
      if (ctx.api?.editor?.setScale && ctx.state?.runtime) {
        ctx.api.editor.setScale(Math.min(3, ctx.state.runtime.scale + 0.1));
      }
      break;
    case 'zoom_out':
      if (ctx.api?.editor?.setScale && ctx.state?.runtime) {
        ctx.api.editor.setScale(Math.max(0.1, ctx.state.runtime.scale - 0.1));
      }
      break;
    case 'preview_current':
      if (ctx.api?.presentation?.start) {
        ctx.api.presentation.start({ autoPlay: true, presentationMode: 'ppt' });
      } else {
        ctx.api?.editor?.setParams?.({ mode: 'preview' });
      }
      break;
    case 'preview_ppt':
      if (ctx.api?.presentation?.start) {
        ctx.api.presentation.start({ autoPlay: true, presentationMode: 'ppt', startSlide: 0 });
      } else {
        ctx.api?.editor?.setParams?.({ mode: 'preview' });
      }
      break;
    case 'fullscreen':
      if (!document.fullscreenElement) {
        document.documentElement
          .requestFullscreen()
          .then(() => {
            ctx.api?.editor?.setParams?.({ fullScreen: true });
          })
          .catch(() => {});
      } else {
        document
          .exitFullscreen()
          .then(() => {
            ctx.api?.editor?.setParams?.({ fullScreen: false });
          })
          .catch(() => {});
      }
      break;
    case 'help':
      isHelpOpen.value = true;
      break;
  }
};

const doSearch = (query: string) => {
  searchQuery.value = query;
  if (!query) {
    if (ctx.selection && typeof (ctx.selection as any).setSelection === 'function') {
      (ctx.selection as any).setSelection([]);
    }
    return;
  }

  const elements = ctx.api?.elements?.get?.() || [];
  const lowerQuery = query.toLowerCase();
  const matchedIds = elements
    .filter((el: any) => {
      return JSON.stringify(el).toLowerCase().includes(lowerQuery);
    })
    .map((el: any) => el.id);

  if (matchedIds.length > 0) {
    if (ctx.selection && typeof (ctx.selection as any).setSelection === 'function') {
      (ctx.selection as any).setSelection(matchedIds);
    } else if (ctx.state?.runtime?.selectedIds) {
      ctx.state.runtime.selectedIds.clear();
      matchedIds.forEach((id: string) => ctx.state.runtime.selectedIds.add(id));
    }
  } else {
    if (ctx.selection && typeof (ctx.selection as any).setSelection === 'function') {
      (ctx.selection as any).setSelection([]);
    }
  }
};

const closeSearch = () => {
  isSearchActive.value = false;
  searchQuery.value = '';
  doSearch('');
};

const renderRawIcon = (svgString: string) => {
  return () =>
    h('div', {
      innerHTML: svgString,
      style: 'width:18px; height:18px; display:flex; align-items:center; color: inherit;',
    });
};

// SVG Icons
const sunSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
const moonSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
const monitorSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`;

const menuOptions = computed(() => [
  {
    label: t('menu.open'),
    key: 'open',
    icon: renderRawIcon(
      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`
    ),
    extra: 'Cmd+O',
  },
  {
    label: t('menu.saveTo'),
    key: 'save',
    icon: renderRawIcon(
      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`
    ),
  },
  {
    label: t('menu.export'),
    key: 'export',
    icon: renderRawIcon(
      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`
    ),
    extra: 'Cmd+Shift+E',
  },
  {
    label: t('menu.importPptx') || '导入 PPTX',
    key: 'import_pptx',
    icon: renderRawIcon(
      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>`
    ),
  },
  {
    label: t('menu.exportPptx') || '导出 PPTX',
    key: 'export_pptx',
    icon: renderRawIcon(
      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`
    ),
  },
  {
    label: t('menu.exportAll'),
    key: 'export_all_db',
    icon: renderRawIcon(
      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>`
    ),
  },
  {
    label: t('menu.find'),
    key: 'find',
    icon: renderRawIcon(
      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`
    ),
    extra: 'Cmd+F',
  },
  {
    key: 'help',
    label: t('menu.help'),
    icon: renderRawIcon(
      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`
    ),
  },
  {
    key: 'reset_custom',
    type: 'render',
    render: () => {
      return h(
        'div',
        {
          class: 'menu-custom-row',
          style: 'justify-content: flex-start; gap: 8px;',
          onClick: (e: Event) => e.stopPropagation(),
        },
        [
          h(
            NPopconfirm,
            {
              onPositiveClick: () => {
                ctx.api?.project?.clear?.();
                // Close the dropdown by simulating a click outside, or we just let user click away
                document.body.click();
              },
              positiveText: t('menu.confirmReset'),
              negativeText: t('menu.cancel'),
              placement: 'right',
            },
            {
              trigger: () =>
                h(
                  'div',
                  {
                    style:
                      'display: flex; align-items: center; gap: 8px; width: 100%; color: var(--n-text-color); font-weight: 400;',
                  },
                  [
                    renderRawIcon(
                      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`
                    )(),
                    h('span', null, t('menu.reset')),
                  ]
                ),
              default: () => t('menu.resetWarning'),
            }
          ),
        ]
      );
    },
  },
  {
    type: 'divider',
    key: 'd1',
  },
  {
    label: t('menu.github'),
    key: 'github',
    icon: renderRawIcon(
      `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`
    ),
  },
  {
    label: t('menu.about'),
    key: 'about',
    icon: renderRawIcon(
      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
    ),
  },
  {
    label: t('menu.privacy'),
    key: 'privacy',
    icon: renderRawIcon(
      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`
    ),
  },
  {
    label: t('menu.terms'),
    key: 'terms',
    icon: renderRawIcon(
      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`
    ),
  },
  {
    type: 'divider',
    key: 'd2',
  },
  {
    key: 'language_custom',
    type: 'render',
    render: () => {
      return h(
        'div',
        {
          class: 'menu-custom-row',
          onClick: (e: Event) => e.stopPropagation(),
        },
        [
          h('span', null, t('menu.language')),
          h('div', { style: 'width: 120px;' }, [
            h(NSelect, {
              size: 'small',
              value: ctx.state.editor?.language || 'zh',
              options: [
                { label: t('menu.zh'), value: 'zh' },
                { label: t('menu.en'), value: 'en' },
              ],
              onUpdateValue: (val: string) => {
                (ctx.api?.editor as any)?.setLanguage?.(val);
              },
            }),
          ]),
        ]
      );
    },
  },
  {
    key: 'theme_custom',
    type: 'render',
    render: () => {
      const currentTheme = ctx.state.editor?.theme || 'light';
      return h(
        'div',
        {
          class: 'menu-custom-row',
          onClick: (e: Event) => e.stopPropagation(),
        },
        [
          h('span', null, t('menu.theme')),
          h(
            'div',
            {
              style:
                'display: flex; gap: 4px; background: var(--n-border-color); border-radius: 12px; padding: 2px;',
            },
            [
              h(
                'div',
                {
                  class: ['menu-theme-btn', { active: currentTheme === 'light' }],
                  onClick: () => {
                    ctx.api?.editor?.setParams?.({ theme: 'light' });
                    setCanvasBackground('#ffffff');
                  },
                },
                [renderRawIcon(sunSvg)()]
              ),
              h(
                'div',
                {
                  class: ['menu-theme-btn', { active: currentTheme === 'dark' }],
                  onClick: () => {
                    ctx.api?.editor?.setParams?.({ theme: 'dark' });
                    setCanvasBackground('#121212');
                  },
                },
                [renderRawIcon(moonSvg)()]
              ),
              h(
                'div',
                {
                  class: ['menu-theme-btn', { active: (currentTheme as any) === 'auto' }],
                  onClick: () => {
                    ctx.api?.editor?.setParams?.({ theme: 'auto' as any });
                    const isSystemDark =
                      window.matchMedia &&
                      window.matchMedia('(prefers-color-scheme: dark)').matches;
                    setCanvasBackground(isSystemDark ? '#121212' : '#ffffff');
                  },
                },
                [renderRawIcon(monitorSvg)()]
              ),
            ]
          ),
        ]
      );
    },
  },
  {
    key: 'bg_custom',
    type: 'render',
    render: () => {
      const PRESET_BGS = ['#ffffff', '#f8f9fa', '#f1f8ff', '#fffbeb', '#fff5f5'];
      const currentBg = ctx.state.document?.config?.background || '#ffffff';

      return h(
        'div',
        {
          class: 'menu-custom-row',
          onClick: (e: Event) => e.stopPropagation(),
        },
        [
          h('span', null, t('menu.canvasBg')),
          h('div', { style: 'display: flex; gap: 4px; align-items: center;' }, [
            ...PRESET_BGS.map(bg =>
              h('div', {
                class: ['menu-bg-swatch', { active: currentBg === bg }],
                style: `background: ${bg};`,
                onClick: () => setCanvasBackground(bg),
              })
            ),
            h('div', {
              style:
                'width: 1px; height: 12px; background: var(--canvas-border-color, #e5e5e5); margin: 0 4px;',
            }),
            h(
              NPopover,
              {
                trigger: 'click',
                placement: 'right-start',
                showArrow: true,
                onClickoutside: (e: Event) => e.stopPropagation(),
              },
              {
                trigger: () =>
                  h('div', {
                    class: ['menu-bg-swatch', 'colorpicker-swatch'],
                    style: `background: ${PRESET_BGS.includes(currentBg) ? '#ffffff' : currentBg};`,
                  }),
                default: () =>
                  h(ColorPickerPanel, {
                    modelValue: currentBg,
                    'onUpdate:modelValue': (c: string) => setCanvasBackground(c),
                  }),
              }
            ),
          ]),
        ]
      );
    },
  },
  {
    key: 'settings_custom',
    type: 'render',
    render: () => {
      return h(
        'div',
        {
          class: 'menu-custom-row',
          onClick: (e: Event) => e.stopPropagation(),
        },
        [
          h('span', null, t('menu.settings')),
          h(
            NPopover,
            {
              trigger: 'click',
              placement: 'right-start',
              showArrow: true,
              onClickoutside: (e: Event) => e.stopPropagation(),
            },
            {
              trigger: () =>
                h(
                  'div',
                  {
                    class: 'menu-settings-btn',
                  },
                  [
                    renderRawIcon(
                      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`
                    )(),
                  ]
                ),
              default: () => h(CanvasSettingsPanel),
            }
          ),
        ]
      );
    },
  },
]);

const handleFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const files = input.files;
  if (!files || files.length === 0) return;

  try {
    let importedCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        (parsed[0].slides || parsed[0].documentData)
      ) {
        // Handle DB export array
        for (const doc of parsed) {
          let actualDoc = doc;
          // Backward compatibility with previous wrong export wrapper
          if (doc.documentData) {
            actualDoc = doc.documentData;
            if (!actualDoc.meta) actualDoc.meta = {};
            if (doc.name && !actualDoc.meta.title) actualDoc.meta.title = doc.name;
          }

          delete actualDoc.createTime;
          delete actualDoc.updateTime;

          await pptStore.save(actualDoc);
          importedCount++;
        }
      } else {
        let elements: any[] = [];
        let documentData: any = null;

        if (Array.isArray(parsed)) {
          if (parsed.length > 0 && parsed[0].elements !== undefined) {
            // Array of CanvasSlideData
            documentData = {
              config: { ratio: 'auto', background: '#ffffff' },
              slides: parsed,
            };
          } else {
            // Array of CanvasElementData
            elements = parsed;
            documentData = {
              config: { ratio: 'auto', background: '#ffffff' },
              slides: [{ elements }],
            };
          }
        } else if (parsed && typeof parsed === 'object') {
          if (Array.isArray(parsed.elements)) {
            elements = parsed.elements;
          } else if (Array.isArray(parsed.data)) {
            elements = parsed.data;
          }

          if (parsed.config && parsed.slides) {
            documentData = parsed;
          } else {
            documentData = {
              config: parsed.options || {
                ratio: '16:9',
                background: parsed.backgroundColor || '#ffffff',
              },
              slides: [{ elements }],
            };
          }
        }

        if (documentData) {
          let name = file.name.replace(/\.json$/i, '');
          if (documentData.meta && documentData.meta.name) {
            name = documentData.meta.name;
          }
          if (!documentData.meta) {
            documentData.meta = {};
          }
          if (!documentData.meta.title) {
            documentData.meta.title = name;
          }

          const saved = await pptStore.save(documentData);
          importedCount++;

          if (files.length === 1 && ctx.api?.project?.load) {
            documentData.id = saved.id;
            ctx.api.project.load(documentData);
            // After loading, ensure current document id is updated in state for DocumentStoragePanel
            if (ctx.state.document) {
              ctx.state.document.id = saved.id;
            }
          }
        }
      }
    }

    if (importedCount > 1 || files.length > 1) {
      message.success(`成功导入 ${importedCount} 个设计到数据库。`);
    } else if (importedCount === 1) {
      message.success(`文件已加载并保存到数据库。`);
    }
  } catch (err) {
    console.error('[MenuPanel] Failed to load JSON:', err);
    dialog.error({
      title: '加载失败',
      content: 'JSON 文件加载失败，请检查文件格式。',
      positiveText: '确定',
    });
  } finally {
    if (fileInputRef.value) fileInputRef.value.value = '';
  }
};

const handlePptxChange = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const files = input.files;
  if (!files || files.length === 0) return;

  try {
    message.info('正在解析 PPTX，这可能需要一点时间...');
    const documentData = await importPptx(files[0]);
    const saved = await pptStore.save(documentData);

    if (ctx.api?.project?.load) {
      documentData.id = saved.id;
      ctx.api.project.load(documentData);
      if (ctx.state.document) {
        ctx.state.document.id = saved.id;
      }
    }
    message.success('PPTX 导入成功');
  } catch (err) {
    console.error('[MenuPanel] Failed to import PPTX:', err);
    dialog.error({
      title: '导入失败',
      content: 'PPTX 解析失败，请检查文件格式。',
      positiveText: '确定',
    });
  } finally {
    if (pptxInputRef.value) pptxInputRef.value.value = '';
  }
};

const handleSelect = (key: string | number) => {
  if (key === 'open') {
    fileInputRef.value?.click();
  } else if (key === 'save') {
    if (ctx.state?.document) {
      const jsonStr = JSON.stringify(ctx.state.document, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ppt-board-data-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  } else if (key === 'export') {
    ctx.api?.project?.export?.({ format: 'jpeg', quality: 0.85, download: true });
  } else if (key === 'import_pptx') {
    pptxInputRef.value?.click();
  } else if (key === 'export_pptx') {
    if (ctx.state?.document) {
      message.info('正在导出 PPTX...');
      exportPptx(ctx.state.document)
        .then(() => {
          message.success('PPTX 导出成功');
        })
        .catch(err => {
          message.error('导出失败: ' + (err as Error).message);
        });
    }
  } else if (key === 'export_all_db') {
    pptStore
      .getList()
      .then(allData => {
        if (!allData || allData.length === 0) {
          message.info('数据库中目前没有设计数据。');
          return;
        }
        const jsonStr = JSON.stringify(allData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vue-canvas-all-db-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        message.success(`成功导出 ${allData.length} 个设计。`);
      })
      .catch(err => {
        console.error('Failed to export all DB data:', err);
        message.error('导出数据库数据时发生错误。');
      });
  } else if (key === 'find') {
    isSearchActive.value = true;
    setTimeout(() => {
      searchInputRef.value?.focus();
    }, 100);
  } else if (key === 'help') {
    isHelpOpen.value = true;
  } else if (key === 'github') {
    window.open('https://github.com/iss-tools/ppt-board-web', '_blank');
  } else if (key === 'about') {
    openAbout();
  } else if (key === 'privacy') {
    dialog.info({
      title: t('menu.privacy'),
      style: 'width: 600px;',
      content: () =>
        h(
          'div',
          {
            style:
              'font-size: 14px; line-height: 1.6; white-space: pre-wrap; max-height: 60vh; overflow-y: auto; padding-right: 8px;',
          },
          t('about.privacyContent')
        ),
      positiveText: t('menu.confirm'),
    });
  } else if (key === 'terms') {
    dialog.info({
      title: t('menu.terms'),
      style: 'width: 600px;',
      content: () =>
        h(
          'div',
          {
            style:
              'font-size: 14px; line-height: 1.6; white-space: pre-wrap; max-height: 60vh; overflow-y: auto; padding-right: 8px;',
          },
          t('about.termsContent')
        ),
      positiveText: t('menu.confirm'),
    });
  }
};

const openAbout = () => {
  dialog.info({
    title: t('menu.about'),
    style: 'width: 500px;',
    content: () =>
      h('div', { style: 'display: flex; flex-direction: column; gap: 12px; margin-top: 12px;' }, [
        h('div', { style: 'display: flex; align-items: center; gap: 12px;' }, [
          h(
            'div',
            {
              style:
                'background: var(--n-primary-color, #6366f1); color: white; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold;',
            },
            'P'
          ),
          h('div', null, [
            h(
              'h3',
              { style: 'margin: 0; font-size: 18px; color: var(--n-text-color);' },
              t('about.title')
            ),
            h(
              'p',
              { style: 'margin: 4px 0 0; font-size: 13px; color: var(--n-text-color-3);' },
              t('about.subtitle')
            ),
          ]),
        ]),
        h(
          'p',
          { style: 'margin: 0; font-size: 14px; line-height: 1.6; color: var(--n-text-color-2);' },
          t('about.desc')
        ),
        h(
          'h4',
          { style: 'margin: 8px 0 0; font-size: 15px; color: var(--n-text-color);' },
          t('about.featuresTitle')
        ),
        h(
          'ul',
          {
            style:
              'margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6; color: var(--n-text-color-2); display: flex; flex-direction: column; gap: 4px;',
          },
          [
            h('li', null, [
              h('strong', null, t('about.f1Title')),
              h('span', null, t('about.f1Desc')),
            ]),
            h('li', null, [
              h('strong', null, t('about.f2Title')),
              h('span', null, t('about.f2Desc')),
            ]),
            h('li', null, [
              h('strong', null, t('about.f3Title')),
              h('span', null, t('about.f3Desc')),
            ]),
            h('li', null, [
              h('strong', null, t('about.f4Title')),
              h('span', null, t('about.f4Desc')),
            ]),
          ]
        ),
      ]),
    positiveText: t('about.github'),
    onPositiveClick: () => window.open('https://github.com/iss-tools/ppt-board', '_blank'),
  });
};
</script>

<style scoped lang="scss">
.menu-plugin-container {
  position: absolute;
  top: 32px;
  left: 32px;
  z-index: 99;
}

.menu-toggle-btn {
  width: 40px;
  height: 40px;
  // box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mobile-bottom-bar {
  position: fixed;
  bottom: 76px;
  right: 8px;
  display: flex;
  padding: 2px 2px;
  z-index: 100;
  .menu-toggle-btn {
    background-color: #fff;
  }
}

.mobile-bottom-bar.dark {
  background: #2c2c2c;
  border-color: #444;
  .menu-toggle-btn {
    background-color: #2c2c2c;
  }
}
</style>

<style>
.menu-custom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  cursor: pointer;
  gap: 16px;
  font-weight: 400 !important;
  color: var(--n-text-color);
  transition: background-color 0.2s;
}

.menu-custom-row:hover {
  background-color: var(--n-option-color-hover);
}

.menu-theme-btn {
  padding: 4px 10px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: var(--n-text-color);
}

.menu-theme-btn:hover {
  background-color: var(--n-border-color);
}

.menu-theme-btn.active {
  background-color: var(--n-primary-color, #6366f1);
  color: #fff;
}

.menu-settings-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: var(--n-border-color);
  color: var(--n-text-color);
}

.menu-settings-btn:hover {
  background-color: var(--n-primary-color-hover, rgba(128, 128, 128, 0.3));
  color: var(--n-text-color);
}

.menu-bg-swatch {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1.5px solid var(--n-border-color, #e5e5e5);
  cursor: pointer;
  transition: all 0.2s;
  box-sizing: border-box;
}

.menu-bg-swatch:hover {
  transform: scale(1.1);
}

.menu-bg-swatch.active {
  border-color: var(--n-primary-color, #6366f1);
  box-shadow: 0 0 0 1px var(--n-primary-color, #6366f1);
}

.colorpicker-swatch {
  border-style: dashed;
}
</style>
