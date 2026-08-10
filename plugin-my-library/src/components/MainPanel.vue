<template>
  <div class="my-library-overlay">
    <!-- 悬浮的入口按钮 -->
    <button class="library-toggle-btn" :class="{ dark: isDarkTheme }"
      @click="pluginState.isPanelVisible = !pluginState.isPanelVisible" :title="t('libraryTitle')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
      </svg>
    </button>

    <!-- 面板本身 -->
    <div v-show="pluginState.isPanelVisible" class="my-library-panel" :class="{ dark: isDarkTheme }">
      <div class="panel-header-icons">
        <div class="header-left">
          <button class="icon-tab-btn" :class="{ active: activeMainTab === 'search' }" @click="activeMainTab = 'search'" title="图标库">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
          <button class="icon-tab-btn" :class="{ active: activeMainTab === 'library' }" @click="activeMainTab = 'library'" :title="t('libraryTitle')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
          </button>
        </div>
        <div class="header-right">
          <button class="close-btn" @click="pluginState.isPanelVisible = false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>

      <div class="library-toolbar" v-show="activeMainTab === 'library'">
        <div class="search-bar-wrap">
          <div class="search-input">
            <n-input v-model:value="searchQuery" :placeholder="t('searchPlaceholder')" clearable size="small" style="width: 100%">
              <template #prefix>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </template>
            </n-input>
          </div>
          <n-dropdown trigger="click" :options="dropdownOptions" @select="handleDropdownSelect" placement="bottom-end">
            <button class="more-btn" :disabled="selectedItemIds.length === 0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
              <span v-if="selectedItemIds.length > 0" class="badge">{{ selectedItemIds.length }}</span>
            </button>
          </n-dropdown>
        </div>
      </div>

      <div class="panel-content custom-scroll" v-show="activeMainTab === 'library'">
        <!-- 个人组件区域 -->
        <div class="section-header">
          <h3 class="section-title">{{ t('libraryTitle') }}</h3>
          <button v-if="hasCanvasSelection" class="add-btn" :title="t('addSelectionTitle')"
            @click="saveCurrentSelection">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            {{ t('addSelection') }}
          </button>
        </div>

        <div v-if="filteredPersonal.length === 0" class="empty-state">
          {{ t('emptyPersonal') }}
        </div>
        <div class="grid-container" v-else>
          <LibraryItem v-for="item in filteredPersonal" :key="item.id!" :item="item"
            :isSelected="selectedItemIds.includes(item.id!)" @toggle-select="toggleSelect" @insert="handleInsert" />
        </div>

        <div class="divider"></div>

        <!-- 导入组件区域 -->
        <div class="section-header">
          <h3 class="section-title">{{ t('importedTitle') }}</h3>
        </div>
        <div class="empty-state" v-if="Object.keys(groupedImported).length === 0">
          {{ t('emptyImported') }}
        </div>
        <div class="imported-groups" v-else>
          <div v-for="(items, pkgName) in groupedImported" :key="pkgName" class="imported-group">
            <div class="group-header" @click="togglePackage(pkgName as string)">
              <div class="group-header-left">
                <svg class="chevron-icon" :class="{ 'is-collapsed': collapsedPackages.includes(pkgName as string) }"
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
                <span class="group-title">{{ pkgName }}</span>
              </div>
              <button class="delete-pkg-btn" @click.stop="deletePackage(pkgName as string)"
                :title="t('deletePackageTitle')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
            <div class="grid-container" v-show="!collapsedPackages.includes(pkgName as string)">
              <LibraryItem v-for="item in items" :key="item.id!" :item="item"
                :isSelected="selectedItemIds.includes(item.id!)" @toggle-select="toggleSelect" @insert="handleInsert" />
            </div>
          </div>
        </div>
      </div>

      <div class="panel-content iframe-content" v-if="activeMainTab === 'search'">
        <iframe src="https://xicons.org/" frameborder="0" width="100%" height="100%" allow="clipboard-read; clipboard-write"></iframe>
      </div>

      <div class="panel-footer" v-show="activeMainTab === 'library'">
        <button class="browse-btn" @click="pluginState.isDrawerVisible = true">
          {{ t('browseLibrary') }}
        </button>
      </div>
    </div> <!-- Close my-library-panel -->

    <!-- Material Drawer -->
    <MaterialDrawer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue';
import { NInput, NDropdown, useMessage } from 'naive-ui';
import { useCanvasContext } from '@iss-ai/ppt-board';
import { pluginState, personalComponents, importedComponents, addPersonalComponent, deletePersonalComponent, deleteImportedComponent } from '../store';
import { useI18n } from '../composables/useI18n';
import LibraryItem from './LibraryItem.vue';
import MaterialDrawer from './MaterialDrawer.vue';

const { t } = useI18n();
const ctx = useCanvasContext();
const message = useMessage();
const isPersonalCollapsed = ref(false);
const isImportedCollapsed = ref(false);
const collapsedPackages = ref<string[]>([]);
const searchQuery = ref('');
const selectedItemIds = ref<string[]>([]);
const activeMainTab = ref('library');

const isDarkTheme = computed(() => ctx.state?.editor?.theme === 'dark');

const hasCanvasSelection = computed(() => {
  return ctx.state?.runtime?.selectedIds && ctx.state.runtime.selectedIds.size > 0;
});

const filteredPersonal = computed(() => {
  if (!searchQuery.value) return personalComponents.value;
  const q = searchQuery.value.toLowerCase();
  return personalComponents.value.filter(c => c.name.toLowerCase().includes(q));
});

const filteredImported = computed(() => {
  if (!searchQuery.value) return importedComponents.value;
  const q = searchQuery.value.toLowerCase();
  return importedComponents.value.filter(c => c.name.toLowerCase().includes(q));
});

const groupedImported = computed(() => {
  const groups: Record<string, any[]> = {};
  filteredImported.value.forEach(c => {
    const pkg = c.packageName || t('unnamedLibrary');
    if (!groups[pkg]) groups[pkg] = [];
    groups[pkg].push(c);
  });
  return groups;
});

const toggleSelect = (id: string) => {
  const index = selectedItemIds.value.indexOf(id);
  if (index === -1) {
    selectedItemIds.value.push(id);
  } else {
    selectedItemIds.value.splice(index, 1);
  }
};

const dropdownOptions = computed(() => [
  {
    label: t('deleteSelected'),
    key: 'delete',
    icon: () => {
      return h('span', {
        innerHTML: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`
      });
    }
  }
]);

const deleteSelected = () => {
  selectedItemIds.value.forEach(id => {
    if (personalComponents.value.some(c => c.id === id)) {
      deletePersonalComponent(id);
    } else {
      deleteImportedComponent(id);
    }
  });
  selectedItemIds.value = [];
};

const deletePackage = (pkgName: string) => {
  const itemsToDelete = importedComponents.value.filter(c => (c.packageName || t('unnamedLibrary')) === pkgName);
  itemsToDelete.forEach(item => {
    if (item.id) deleteImportedComponent(item.id);
  });
  // Clean up selected state
  selectedItemIds.value = selectedItemIds.value.filter(id => !itemsToDelete.some(c => c.id === id));
};

const togglePackage = (pkgName: string) => {
  const index = collapsedPackages.value.indexOf(pkgName);
  if (index === -1) {
    collapsedPackages.value.push(pkgName);
  } else {
    collapsedPackages.value.splice(index, 1);
  }
};

const handleDropdownSelect = (key: string) => {
  if (key === 'delete') {
    deleteSelected();
    message.success(t('deleteSuccess'));
  }
};

const saveCurrentSelection = () => {
  if (!hasCanvasSelection.value) return;
  const selectedIds = Array.from(ctx.state.runtime.selectedIds);
  if (selectedIds.length === 0) return;

  const activeElements = ctx.state.runtime.activeElements || [];
  const targetElements = activeElements.filter((el: any) => selectedIds.includes(el.id));

  if (targetElements.length > 0) {
    addPersonalComponent(targetElements);
    message.success(t('saveSuccess'));
  } else {
    message.error(t('saveError'));
  }
};

const handleInsert = (itemId: string) => {
  const item = personalComponents.value.find(c => c.id === itemId) || importedComponents.value.find(c => c.id === itemId);
  if (!item) return;

  try {
    const elData = JSON.parse(JSON.stringify(item.data));
    const elementsToInsert = Array.isArray(elData) ? elData : [elData];

    // Attempt to center it on the current viewport
    const scale = ctx.state.runtime?.scale || 1;
    const offsetX = ctx.state.runtime?.offsetX || 0;
    const offsetY = ctx.state.runtime?.offsetY || 0;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const centerX = (viewportWidth / 2 - offsetX) / scale;
    const centerY = (viewportHeight / 2 - offsetY) / scale;

    // Calculate group bounding box center offset
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    elementsToInsert.forEach((el: any) => {
      minX = Math.min(minX, el.x || 0);
      minY = Math.min(minY, el.y || 0);
      maxX = Math.max(maxX, (el.x || 0) + (el.width || 100));
      maxY = Math.max(maxY, (el.y || 0) + (el.height || 100));
    });

    const groupW = maxX - minX;
    const groupH = maxY - minY;

    const baseOffsetX = centerX - groupW / 2;
    const baseOffsetY = centerY - groupH / 2;

    const newGroupId = elementsToInsert.length > 1 ? `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : undefined;

    elementsToInsert.forEach((el: any) => {
      el.id = `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      el.x = (el.x || 0) + baseOffsetX;
      el.y = (el.y || 0) + baseOffsetY;
      if (newGroupId) {
        el.groupId = newGroupId;
      } else {
        delete el.groupId; // Ensure single items don't inherit old group IDs
      }
      ctx.api.elements.add(el);
    });

    message.success('已快速插入');
  } catch (e) {
    console.error(e);
  }
};
</script>

<style scoped>
.my-library-overlay {
  /* position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 999; */
}

.library-toggle-btn {
  position: absolute;
  top: 32px;
  right: 16px;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--canvas-panel-bg, #ffffff);
  border: 1px solid var(--canvas-border-color, #e9ecef);
  color: var(--canvas-text-color, #495057);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  pointer-events: auto;
  transition: all 0.2s;
  z-index: 99;
}

.library-toggle-btn.dark {
  --canvas-panel-bg: #2c2c2c;
  --canvas-border-color: #444;
  --canvas-text-color: #e0e0e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.library-toggle-btn:hover {
  background: var(--canvas-btn-hover-bg, #f1f3f5);
}

.library-toggle-btn.dark:hover {
  --canvas-btn-hover-bg: #3a3a3a;
}

.my-library-panel {
  position: absolute;
  top: 16px;
  /* Right below top */
  right: 64px;
  /* Left of the toggle button */
  width: 300px;
  height: calc(100vh - 32px);
  background: var(--canvas-panel-bg, #ffffff);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  border: 1px solid var(--canvas-border-color, #e9ecef);
  overflow: hidden;
  font-family: system-ui, -apple-system, sans-serif;
  pointer-events: auto;
  z-index: 999;
}

.dark.my-library-panel,
:host-context(.dark) .my-library-panel {
  --canvas-panel-bg: #2c2c2c;
  --canvas-border-color: #444;
  --canvas-text-color: #e0e0e0;
  --canvas-text-muted: #aaa;
  --canvas-btn-bg: #3a3a3a;
  --canvas-btn-hover-bg: #4a4a4a;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.panel-header-icons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--canvas-border-color, #e9ecef);
}

.header-left {
  display: flex;
  gap: 8px;
}

.icon-tab-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 6px;
  color: var(--canvas-text-muted, #868e96);
  cursor: pointer;
  transition: all 0.2s;
}

.icon-tab-btn:hover {
  background: var(--canvas-btn-hover-bg, #f1f3f5);
  color: var(--canvas-text-color, #495057);
}

.icon-tab-btn.active {
  background: var(--canvas-btn-hover-bg, #e9ecef);
  color: #5c7cfa;
}

.dark .icon-tab-btn.active {
  color: #748ffc;
}

.library-toolbar {
  padding: 12px 16px 0;
}

.search-bar-wrap {
  display: flex;
  gap: 8px;
  align-items: center;
}

.search-input {
  flex: 1;
}

/* Optimize Search Input for Light Mode */
.search-input :deep(.n-input) {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  transition: all 0.2s;
}

.search-input :deep(.n-input:not(.n-input--disabled):hover) {
  background-color: #ffffff;
  border-color: #ced4da;
}

.search-input :deep(.n-input.n-input--focus) {
  background-color: #ffffff;
  border-color: #5c7cfa;
  box-shadow: 0 0 0 2px rgba(92, 124, 250, 0.15);
}

.search-input :deep(.n-input .n-input__input-el) {
  color: #495057;
}

.search-input :deep(.n-input .n-input__placeholder) {
  color: #adb5bd;
}

.search-input :deep(.n-input .n-input__prefix svg) {
  color: #868e96;
}

/* Dark Mode Overrides */
.dark.my-library-panel .search-input :deep(.n-input),
:host-context(.dark) .my-library-panel .search-input :deep(.n-input) {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.09);
}

.dark.my-library-panel .search-input :deep(.n-input:not(.n-input--disabled):hover),
:host-context(.dark) .my-library-panel .search-input :deep(.n-input:not(.n-input--disabled):hover) {
  background-color: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
}

.dark.my-library-panel .search-input :deep(.n-input.n-input--focus),
:host-context(.dark) .my-library-panel .search-input :deep(.n-input.n-input--focus) {
  background-color: rgba(0, 0, 0, 0.2);
  border-color: #5c7cfa;
  box-shadow: 0 0 0 2px rgba(92, 124, 250, 0.25);
}

.dark.my-library-panel .search-input :deep(.n-input .n-input__input-el),
:host-context(.dark) .my-library-panel .search-input :deep(.n-input .n-input__input-el) {
  color: #e0e0e0;
}

.dark.my-library-panel .search-input :deep(.n-input .n-input__placeholder),
:host-context(.dark) .my-library-panel .search-input :deep(.n-input .n-input__placeholder) {
  color: #6c757d;
}

.dark.my-library-panel .search-input :deep(.n-input .n-input__prefix svg),
:host-context(.dark) .my-library-panel .search-input :deep(.n-input .n-input__prefix svg) {
  color: #adb5bd;
}

.more-btn {
  position: relative;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: var(--canvas-btn-bg, #f1f3f5);
  border-radius: 6px;
  color: var(--canvas-text-color, #495057);
  cursor: pointer;
  transition: all 0.2s;
}

.more-btn:hover:not(:disabled),
.close-btn:hover {
  background: var(--canvas-btn-hover-bg, #e9ecef);
}

.more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.close-btn {
  position: relative;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 6px;
  color: var(--canvas-text-color, #495057);
  cursor: pointer;
  transition: all 0.2s;
}

.badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #339af0;
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 5px;
  border-radius: 10px;
  line-height: 1;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.iframe-content {
  padding: 0;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.section-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #5c7cfa;
  /* Excalidraw purple-ish */
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  padding: 4px 8px;
  background: rgba(92, 124, 250, 0.1);
  color: #5c7cfa;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.add-btn:hover {
  background: rgba(92, 124, 250, 0.2);
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}

.imported-groups {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
  user-select: none;
}

.group-header:hover {
  background: var(--canvas-btn-hover-bg, #f1f3f5);
}

.group-header-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.chevron-icon {
  color: var(--canvas-text-muted, #868e96);
  transition: transform 0.2s;
}

.chevron-icon.is-collapsed {
  transform: rotate(-90deg);
}

.group-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--canvas-text-color, #495057);
}

.delete-pkg-btn {
  background: transparent;
  border: none;
  color: #adb5bd;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.delete-pkg-btn:hover {
  background: rgba(250, 82, 82, 0.1);
  color: #fa5252;
}

.dark .group-title,
:host-context(.dark) .group-title {
  color: #ced4da;
}

.dark .delete-pkg-btn,
:host-context(.dark) .delete-pkg-btn {
  color: #6c757d;
}

.dark .delete-pkg-btn:hover,
:host-context(.dark) .delete-pkg-btn:hover {
  background: rgba(250, 82, 82, 0.2);
  color: #ff8787;
}

.empty-state {
  font-size: 12px;
  color: var(--canvas-text-muted, #868e96);
  text-align: center;
  padding: 20px 0;
  background: var(--canvas-btn-bg, #f8f9fa);
  border-radius: 8px;
  border: 1px dashed var(--canvas-border-color, #dee2e6);
}

.divider {
  height: 1px;
  background: var(--canvas-border-color, #e9ecef);
  margin: 8px 0;
}

.panel-footer {
  padding: 16px;
  border-top: 1px solid var(--canvas-border-color, #e9ecef);
}

.browse-btn {
  width: 100%;
  padding: 10px;
  background: #5c7cfa;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.browse-btn:hover {
  background: #4c6ef5;
}

/* Scrollbar */
.custom-scroll::-webkit-scrollbar {
  width: 4px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}
</style>
