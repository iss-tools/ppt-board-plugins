<template>
  <div class="menu-plugin-container">
    <input ref="fileInputRef" type="file" accept=".json,application/json" multiple style="display: none"
      @change="handleFileChange" />
    <n-config-provider :theme="isDark ? darkTheme : null">
      <div style="display: flex; gap: 8px; align-items: center;">
        <n-dropdown v-if="!isSearchActive" trigger="click" :options="menuOptions" @select="handleSelect"
          placement="bottom-start">
          <n-button strong secondary circle class="menu-toggle-btn">
            <template #icon>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </template>
          </n-button>
        </n-dropdown>

        <n-button v-else strong secondary circle class="menu-toggle-btn active-search-btn" @click="closeSearch">
          <template #icon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </template>
        </n-button>

        <n-input v-if="isSearchActive" ref="searchInputRef" v-model:value="searchQuery"
          :placeholder="t('menu.searchPlaceholder')" clearable
          style="width: 240px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" @input="doSearch">
          <template #prefix>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" style="color: var(--n-icon-color);">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </template>
        </n-input>
      </div>
      <HelpModal v-model="isHelpOpen" />
    </n-config-provider>
  </div>
</template>

<script setup lang="ts">
import { h, computed, ref } from 'vue';
import { NConfigProvider, NDropdown, NButton, NSelect, NPopover, NInput, NPopconfirm, darkTheme, createDiscreteApi } from 'naive-ui';
import { useCanvasContext, useEasyStore } from '@iss-ai/ppt-board';
import ColorPickerPanel from './components/ColorPickerPanel.vue';
import CanvasSettingsPanel from './components/CanvasSettingsPanel.vue';
import HelpModal from './components/HelpModal.vue';
import { useI18n } from './composables/useI18n';

const ctx = useCanvasContext();
const pptStore = useEasyStore('documents');
const { t } = useI18n();
const isDark = computed(() => ctx.state.editor?.theme === 'dark');
const fileInputRef = ref<HTMLInputElement | null>(null);
const isHelpOpen = ref(false);

const { dialog, message } = createDiscreteApi(['dialog', 'message'], {
  configProviderProps: computed(() => ({
    theme: isDark.value ? darkTheme : undefined
  }))
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
  const matchedIds = elements.filter((el: any) => {
    return JSON.stringify(el).toLowerCase().includes(lowerQuery);
  }).map((el: any) => el.id);

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
  return () => h('div', { innerHTML: svgString, style: 'width:18px; height:18px; display:flex; align-items:center; color: inherit;' })
}

// SVG Icons
const sunSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
const moonSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
const monitorSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`;

const menuOptions = computed(() => [
  {
    label: t('menu.open'),
    key: 'open',
    icon: renderRawIcon(`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`),
    extra: 'Cmd+O'
  },
  {
    label: t('menu.saveTo'),
    key: 'save',
    icon: renderRawIcon(`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`)
  },
  {
    label: t('menu.export'),
    key: 'export',
    icon: renderRawIcon(`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`),
    extra: 'Cmd+Shift+E'
  },
  {
    label: t('menu.exportAll'),
    key: 'export_all_db',
    icon: renderRawIcon(`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>`)
  },
  {
    label: t('menu.find'),
    key: 'find',
    icon: renderRawIcon(`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`),
    extra: 'Cmd+F'
  },
  {
    key: 'help',
    label: t('menu.help'),
    icon: renderRawIcon(`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`)
  },
  {
    key: 'reset_custom',
    type: 'render',
    render: () => {
      return h('div', {
        class: "menu-custom-row", style: "justify-content: flex-start; gap: 8px;",
        onClick: (e: Event) => e.stopPropagation()
      }, [
        h(NPopconfirm, {
          onPositiveClick: () => {
            ctx.api?.project?.clear?.();
            // Close the dropdown by simulating a click outside, or we just let user click away
            document.body.click();
          },
          positiveText: t('menu.confirmReset'),
          negativeText: t('menu.cancel'),
          placement: 'right'
        }, {
          trigger: () => h('div', { style: "display: flex; align-items: center; gap: 8px; width: 100%; color: var(--n-text-color); font-weight: 400;" }, [
            renderRawIcon(`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`)(),
            h('span', null, t('menu.reset'))
          ]),
          default: () => t('menu.resetWarning')
        })
      ])
    }
  },
  {
    type: 'divider',
    key: 'd1'
  },
  {
    label: t('menu.github'),
    key: 'github',
    icon: renderRawIcon(`<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`)
  },
  {
    type: 'divider',
    key: 'd2'
  },
  {
    key: 'language_custom',
    type: 'render',
    render: () => {
      return h('div', {
        class: "menu-custom-row",
        onClick: (e: Event) => e.stopPropagation()
      }, [
        h('span', null, t('menu.language')),
        h('div', { style: 'width: 120px;' }, [
          h(NSelect, {
            size: 'small',
            value: ctx.state.editor?.language || 'zh',
            options: [
              { label: t('menu.zh'), value: 'zh' },
              { label: t('menu.en'), value: 'en' }
            ],
            onUpdateValue: (val: string) => {
              (ctx.api?.editor as any)?.setLanguage?.(val);
            }
          })
        ])
      ])
    }
  },
  {
    key: 'theme_custom',
    type: 'render',
    render: () => {
      const currentTheme = ctx.state.editor?.theme || 'light';
      return h('div', {
        class: "menu-custom-row",
        onClick: (e: Event) => e.stopPropagation()
      }, [
        h('span', null, t('menu.theme')),
        h('div', { style: "display: flex; gap: 4px; background: var(--n-border-color); border-radius: 12px; padding: 2px;" }, [
          h('div', {
            class: ["menu-theme-btn", { active: currentTheme === "light" }],
            onClick: () => {
              ctx.api?.editor?.setParams?.({ theme: 'light' });
              setCanvasBackground('#ffffff');
            }
          }, [renderRawIcon(sunSvg)()]),
          h('div', {
            class: ["menu-theme-btn", { active: currentTheme === "dark" }],
            onClick: () => {
              ctx.api?.editor?.setParams?.({ theme: 'dark' });
              setCanvasBackground('#121212');
            }
          }, [renderRawIcon(moonSvg)()]),
          h('div', {
            class: ["menu-theme-btn", { active: (currentTheme as any) === "auto" }],
            onClick: () => {
              ctx.api?.editor?.setParams?.({ theme: 'auto' as any });
              const isSystemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
              setCanvasBackground(isSystemDark ? '#121212' : '#ffffff');
            }
          }, [renderRawIcon(monitorSvg)()])
        ])
      ]);
    }
  },
  {
    key: 'bg_custom',
    type: 'render',
    render: () => {
      const currentBg = ctx.state.document?.config?.background || '#ffffff';

      return h('div', {
        class: "menu-custom-row",
        onClick: (e: Event) => e.stopPropagation()
      }, [
        h('span', null, t('menu.canvasBg')),
        h(NPopover, {
          trigger: 'click',
          placement: 'right-start',
          showArrow: true,
          onClickoutside: (e: Event) => e.stopPropagation()
        }, {
          trigger: () => h('div', {
            class: "menu-settings-btn"
          }, [
            renderRawIcon(`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`)()
          ]),
          default: () => h(CanvasSettingsPanel)
        })
      ]);
    }
  }
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

      if (Array.isArray(parsed) && parsed.length > 0 && (parsed[0].slides || parsed[0].documentData)) {
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
              slides: parsed
            };
          } else {
            // Array of CanvasElementData
            elements = parsed;
            documentData = {
              config: { ratio: 'auto', background: '#ffffff' },
              slides: [{ elements }]
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
              config: parsed.options || { ratio: '16:9', background: parsed.backgroundColor || '#ffffff' },
              slides: [{ elements }]
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
      positiveText: '确定'
    });
  } finally {
    if (fileInputRef.value) fileInputRef.value.value = '';
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
    ctx.api?.project?.export?.({ format: 'png', download: true });
  } else if (key === 'export_all_db') {
    pptStore.getList().then(allData => {
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
    }).catch(err => {
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
    window.open('https://github.com/iss-tools/ppt-board', '_blank');
  }
};
</script>

<style scoped>
.menu-plugin-container {
  position: absolute;
  top: 32px;
  left: 32px;
  z-index: 99;
}

.menu-toggle-btn {
  width: 40px;
  height: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
</style>
