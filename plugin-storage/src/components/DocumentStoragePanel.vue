<template>
  <div class="storage-panel-overlay" :class="{ dark: isDark }">
    <n-config-provider :theme="isDark ? darkTheme : null">
      <div class="panel-content">
        <!-- Left: Document List Popover -->
        <n-popover
          trigger="click"
          placement="top-start"
          :show-arrow="true"
          :show="showPopover"
          @update:show="handlePopoverUpdate"
        >
          <template #trigger>
            <div
              style="
                padding: 12px 16px;
                margin: -8px 0 -8px -16px;
                display: flex;
                align-items: center;
                cursor: pointer;
              "
            >
              <n-button
                text
                style="font-size: 14px; font-weight: 500; padding: 0; pointer-events: none"
                class="doc-title-btn"
              >
                {{ currentTitle }}
              </n-button>
            </div>
          </template>

          <div class="doc-list-container">
            <div class="doc-list-items">
              <div
                v-for="doc in filteredDocs"
                :key="doc.id"
                class="doc-item"
                :class="{ active: ctx.state.document.id === doc.id }"
                @click="loadDoc(doc)"
              >
                <span v-if="editingId !== doc.id" class="doc-name">{{
                  doc.meta?.title || t('untitled')
                }}</span>
                <div v-else style="flex: 1; margin-right: 8px" @click.stop>
                  <n-input
                    size="small"
                    :value="editingName"
                    @update:value="val => (editingName = val || '')"
                    @blur="finishEdit(doc)"
                    @keydown.enter="finishEdit(doc)"
                  />
                </div>

                <div class="doc-actions" @click.stop style="display: flex; align-items: center">
                  <n-button
                    v-if="editingId === doc.id"
                    text
                    size="tiny"
                    @click="finishEdit(doc)"
                    :title="t('saveName')"
                    style="margin-right: 4px"
                  >
                    <template #icon>
                      <svg
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        fill="none"
                        stroke="#18a058"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </template>
                  </n-button>
                  <n-button
                    v-else
                    text
                    size="tiny"
                    @click="startEdit(doc)"
                    :title="t('editName')"
                    style="margin-right: 4px"
                  >
                    <template #icon>
                      <svg
                        viewBox="0 0 24 24"
                        width="15"
                        height="15"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                      </svg>
                    </template>
                  </n-button>
                  <n-popconfirm v-if="editingId !== doc.id" @positive-click="deleteDoc(doc)">
                    <template #trigger>
                      <n-button
                        text
                        size="tiny"
                        style="color: #d03050; margin-left: 2px"
                        :title="t('deleteDoc')"
                      >
                        <template #icon>
                          <svg
                            viewBox="0 0 24 24"
                            width="15"
                            height="15"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path
                              d="M19 6v14a2 2 0 0 1-2-2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                            ></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </template>
                      </n-button>
                    </template>
                    {{ t('confirmDelete') }}
                  </n-popconfirm>
                </div>
              </div>
              <div v-if="filteredDocs.length === 0" class="no-docs">{{ t('noDocs') }}</div>
            </div>
            <div class="doc-list-header">
              <n-input
                size="small"
                :value="searchQuery"
                @update:value="val => (searchQuery = val || '')"
                :placeholder="t('search')"
                clearable
              />
              <n-button size="small" @click="createNewDoc" style="margin-left: 8px" type="primary">
                +
              </n-button>
            </div>
          </div>
        </n-popover>

        <!-- Right: Pagination -->
        <div class="pagination-container" v-if="totalPages > 0">
          <n-pagination
            :page="currentPage"
            :page-count="totalPages"
            size="small"
            @update:page="handlePageChange"
          />
          <n-button
            quaternary
            circle
            size="small"
            style="margin-left: 12px; margin-right: 4px"
            @click="removeSlide"
            :disabled="totalPages <= 1"
            :title="t('deleteSlide')"
          >
            <template #icon>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              >
                <path d="M5 12h14"></path>
              </svg>
            </template>
          </n-button>
          <n-button quaternary circle size="small" @click="addSlide" :title="t('addSlide')">
            <template #icon>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              >
                <path d="M12 5v14M5 12h14"></path>
              </svg>
            </template>
          </n-button>

          <div style="width: 1px; height: 16px; background: #ddd; margin: 0 8px"></div>

          <n-dropdown
            trigger="hover"
            placement="top-end"
            :show-arrow="true"
            :options="saveOptions"
            @select="handleSaveMenu"
          >
            <div
              style="
                padding: 12px 16px 12px 8px;
                margin: -8px -16px -8px 0;
                display: flex;
                align-items: center;
                cursor: pointer;
              "
            >
              <n-button
                quaternary
                circle
                size="small"
                :title="t('saveOptions')"
                style="pointer-events: none"
              >
                <template #icon>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    viewBox="0 0 32 32"
                  >
                    <path
                      d="M27.71 9.29l-5-5A1 1 0 0 0 22 4H6a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2V10a1 1 0 0 0-.29-.71zM12 6h8v4h-8zm8 20h-8v-8h8zm2 0v-8a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8H6V6h4v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6.41l4 4V26z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </template>
              </n-button>
            </div>
          </n-dropdown>

          <n-button
            quaternary
            circle
            size="small"
            style="margin-left: 12px"
            @click="exportAllDocs"
            :title="t('exportAll') || '导出全部'"
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
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </template>
          </n-button>
        </div>
      </div>
    </n-config-provider>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, h, defineComponent } from 'vue';
import {
  NConfigProvider,
  NPopover,
  NButton,
  NInput,
  NPopconfirm,
  NPagination,
  NDropdown,
  NIcon,
  darkTheme,
  createDiscreteApi,
} from 'naive-ui';
import { useCanvasContext, useEasyStore } from '@iss-ai/ppt-board';

const ctx = useCanvasContext();
const isDark = computed(() => ctx.state.editor?.theme === 'dark');

import { useI18n } from '../composables/useI18n';

const { t } = useI18n();

const { dialog, message } = createDiscreteApi(['dialog', 'message'], {
  configProviderProps: computed(() => ({
    theme: isDark.value ? darkTheme : undefined,
  })),
});

// Document state
const store = useEasyStore('documents');
const docs = ref<any[]>([]);
const showPopover = ref(false);
const searchQuery = ref('');
const editingId = ref<string | null>(null);
const editingName = ref('');

const currentTitle = computed(() => {
  if (ctx.state.document?.id) {
    return ctx.state.document?.meta?.title || t('untitled');
  }
  return t('pleaseSelect');
});
const filteredDocs = computed(() => {
  if (!searchQuery.value) return docs.value;
  const q = searchQuery.value.toLowerCase();
  return docs.value.filter(d => (d.meta?.title || '').toLowerCase().includes(q));
});

// Pagination state
const totalPages = computed(() => Math.max(1, ctx.state.document?.slides?.length || 1));
const currentPage = computed({
  get: () => (ctx.state.runtime?.currentSlideIndex || 0) + 1,
  set: (val: number) => {
    // Actually set by update:page, but needed for v-model
  },
});

const handlePageChange = (page: number) => {
  if (ctx.api?.presentation?.goSlide) {
    ctx.api.presentation.goSlide(page - 1);
  } else {
    ctx.state.runtime.currentSlideIndex = page - 1;
  }
};

const addSlide = async () => {
  if (!ctx.state.document.slides) ctx.state.document.slides = [];
  ctx.state.document.slides.push({ elements: [] });
  const newIndex = ctx.state.document.slides.length - 1;
  handlePageChange(newIndex + 1);

  if (ctx.api?.project?.saveState) {
    ctx.api.project.saveState();
  }
  await doSave(true);
};

const removeSlide = async () => {
  if (!ctx.state.document.slides || ctx.state.document.slides.length <= 1) return;
  const currentIndex = ctx.state.runtime.currentSlideIndex || 0;
  ctx.state.document.slides.splice(currentIndex, 1);

  let newIndex = currentIndex;
  if (newIndex >= ctx.state.document.slides.length) {
    newIndex = ctx.state.document.slides.length - 1;
  }
  handlePageChange(newIndex + 1);

  if (ctx.api?.project?.saveState) {
    ctx.api.project.saveState();
  }
  await doSave(true);
};

const loadDocs = async () => {
  docs.value = await store.getList();
};

const handlePopoverUpdate = (val: boolean) => {
  showPopover.value = val;
  if (val) {
    loadDocs(); // Fetch latest document list when opening
  }
};

const createNewDoc = async () => {
  if (ctx.api?.project?.clear) {
    ctx.api.project.clear();
  }
  ctx.state.document.id = undefined; // Force new UUID on next save
  if (!ctx.state.document.meta) ctx.state.document.meta = {};

  const title = searchQuery.value.trim() || t('newPresentation');
  ctx.state.document.meta.title = title;

  searchQuery.value = ''; // clear search query
  showPopover.value = false;

  // Save silently
  await doSave();
};

const loadDoc = (doc: any) => {
  if (ctx.api?.project?.load) {
    ctx.api.project.load(doc);
  } else {
    // Fallback if load is not available
    ctx.state.document = doc;
  }
  showPopover.value = false;
};

const startEdit = (doc: any) => {
  editingId.value = doc.id;
  editingName.value = doc.meta?.title || '';
};

const finishEdit = async (doc: any) => {
  if (!editingId.value) return;
  if (doc.meta) doc.meta.title = editingName.value;
  else doc.meta = { title: editingName.value };

  const docToSave = JSON.parse(JSON.stringify(doc));
  await store.save(docToSave); // update in db

  // Also update current state if it's the active document
  if (ctx.state.document.id === doc.id) {
    if (!ctx.state.document.meta) ctx.state.document.meta = {};
    ctx.state.document.meta.title = editingName.value;
  }

  editingId.value = null;
  await loadDocs();
};

const deleteDoc = async (doc: any) => {
  if (doc.id) {
    await store.delete({ id: doc.id });
    await loadDocs();
    if (ctx.state.document.id === doc.id) {
      await createNewDoc();
    }
  }
};

const saveIcon = () =>
  h(
    'svg',
    {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    },
    [
      h('path', { d: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z' }),
      h('polyline', { points: '17 21 17 13 7 13 7 21' }),
      h('polyline', { points: '7 3 7 8 15 8' }),
    ]
  );

const saveAsIcon = () =>
  h(
    'svg',
    {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    },
    [
      h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
      h('polyline', { points: '14 2 14 8 20 8' }),
      h('line', { x1: '12', y1: '18', x2: '12', y2: '12' }),
      h('line', { x1: '9', y1: '15', x2: '15', y2: '15' }),
    ]
  );

const renderIcon = (iconFunc: any) => {
  return () => h(NIcon, null, { default: iconFunc });
};

const saveOptions = computed(() => [
  { label: t('save'), key: 'save', icon: renderIcon(saveIcon) },
  { label: t('saveAs'), key: 'save-as', icon: renderIcon(saveAsIcon) },
]);

const promptForName = (defaultName: string = ''): Promise<string | null> => {
  return new Promise(resolve => {
    let finalVal = defaultName;
    const d = dialog.create({
      title: t('enterDocName'),
      content: () =>
        h(
          defineComponent({
            setup() {
              const val = ref(defaultName);
              return () =>
                h(NInput, {
                  value: val.value,
                  'onUpdate:value': (v: string) => {
                    val.value = v;
                    finalVal = v;
                  },
                  onKeydown: (e: KeyboardEvent) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (!finalVal.trim()) return;
                      d.destroy();
                      resolve(finalVal.trim());
                    }
                  },
                  placeholder: t('docNamePlaceholder'),
                  autofocus: true,
                });
            },
          })
        ),
      positiveText: t('confirm'),
      negativeText: t('cancel'),
      onPositiveClick: () => {
        if (!finalVal.trim()) return false;
        resolve(finalVal.trim());
      },
      onNegativeClick: () => {
        resolve(null);
      },
    });
  });
};

const handleSaveMenu = async (key: string) => {
  if (key === 'save') {
    const isNew = !ctx.state.document.id;
    let title = ctx.state.document?.meta?.title;
    if (
      isNew ||
      !title ||
      title === 'Untitled Document' ||
      title === 'New Presentation' ||
      title === t('untitled') ||
      title === t('newPresentation')
    ) {
      const newName = await promptForName(
        title === 'New Presentation' || title === t('newPresentation') ? '' : title
      );
      if (newName) {
        if (!ctx.state.document.meta) ctx.state.document.meta = {};
        ctx.state.document.meta.title = newName;
        await doSave(false);
      }
    } else {
      await doSave(false);
    }
  } else if (key === 'save-as') {
    const currentName = ctx.state.document?.meta?.title || '';
    const newName = await promptForName(
      currentName === 'New Presentation' || currentName === t('newPresentation')
        ? t('newPresentationCopy')
        : currentName + t('copySuffix')
    );
    if (newName) {
      if (!ctx.state.document.meta) ctx.state.document.meta = {};
      ctx.state.document.meta.title = newName;
      ctx.state.document.id = undefined; // clear id to create a new one
      await doSave(false);
    }
  }
};

const doSave = async (fallbackToDefault: boolean = false) => {
  if (!ctx.state.document.meta) ctx.state.document.meta = {};
  if (!ctx.state.document.meta.title && fallbackToDefault) {
    ctx.state.document.meta.title = t('newPresentation');
  }

  const docData = ctx.api?.project?.get ? ctx.api.project.get() : ctx.state.document;
  const docToSave = JSON.parse(JSON.stringify(docData));
  const isUpdate = !!docToSave.id;
  const saved = await store.save(docToSave);
  ctx.state.document.id = saved.id;
  await loadDocs();

  message.success(isUpdate ? t('saveSuccessUpd') : t('saveSuccessNew'));
};

const handleSave = () => {
  handleSaveMenu('save');
};

const exportAllDocs = async () => {
  try {
    const allDocs = await store.getList();
    if (!allDocs || allDocs.length === 0) {
      message.warning('没有可导出的数据');
      return;
    }
    const jsonStr = JSON.stringify(allDocs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ppt-board-all-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('导出成功');
  } catch (error) {
    console.error('导出全部数据失败:', error);
    message.error('导出失败');
  }
};

onMounted(() => {
  loadDocs();
  if (ctx.hooks?.on) {
    ctx.hooks.on('save', handleSave);
  }
});

onUnmounted(() => {
  if (ctx.hooks?.off) {
    ctx.hooks.off('save', handleSave);
  }
});
</script>

<style scoped>
.storage-panel-overlay {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  background: var(--canvas-panel-bg, #ffffff);
  border: 1px solid var(--canvas-border-color, #e5e7eb);
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 8px 16px;
  display: flex;
  align-items: center;
}

.storage-panel-overlay.dark {
  background: #2a2a2a;
  border-color: #444;
}

.panel-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.doc-dropdown-btn {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.doc-list-container {
  width: 260px;
  max-height: 300px;
  display: flex;
  flex-direction: column;
}

.doc-list-header {
  display: flex;
  align-items: center;
  padding: 8px;
  border-top: 1px solid var(--canvas-border-color, #eee);
}

.storage-panel-overlay.dark .doc-list-header {
  border-top-color: #333;
}

.doc-list-items {
  overflow-y: auto;
  flex: 1;
  padding: 8px 0;
}

.doc-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.doc-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.storage-panel-overlay.dark .doc-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.doc-item.active {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}

.doc-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}

.doc-actions {
  display: flex;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.doc-item:hover .doc-actions {
  opacity: 1;
}

.no-docs {
  padding: 16px;
  text-align: center;
  color: #999;
  font-size: 13px;
}

.pagination-container {
  display: flex;
  align-items: center;
}
</style>
