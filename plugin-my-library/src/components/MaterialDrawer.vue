<template>
  <n-drawer v-model:show="pluginState.isDrawerVisible" :width="400" placement="right">
    <n-drawer-content :title="t('browseLibrary')" closable :native-scrollbar="false">
      <div class="drawer-container" :class="{ dark: isDarkTheme }">
        <div class="drawer-header-actions">
          <n-input v-model:value="searchQuery" :placeholder="t('searchPlaceholder')" clearable class="search-input" />
          <n-button type="primary" @click="showExcalidrawModal = true" class="import-ex-btn">{{ t('importBtn') }} Excalidraw</n-button>
        </div>

        <div v-if="loading" class="loading-state">
          <n-spin size="medium" />
          <p>{{ t('loadingMaterials') }}</p>
        </div>

        <div v-else class="package-list">
          <div v-if="filteredPackages.length === 0" class="empty-state">{{ t('noMaterialsFound') }}</div>
          <div v-for="pkg in filteredPackages" :key="pkg.id" class="package-card">
            <div class="pkg-header">
              <h3 class="pkg-title">{{ pkg.name }}</h3>
              <span class="pkg-author">by {{ pkg.author }}</span>
            </div>
            <p class="pkg-desc">{{ pkg.description }}</p>

            <div class="pkg-preview">
              <div class="preview-item" v-for="item in pkg.components.slice(0, 7)" :key="item.id">
                <ComponentPreview :data="item.data" :boxSize="32" />
              </div>
              <div class="preview-item more" v-if="pkg.components.length > 7">
                +{{ pkg.components.length - 7 }}
              </div>
            </div>

            <button class="import-btn" @click="handleImport(pkg)">
              {{ t('importBtn') }} ({{ pkg.components.length }})
            </button>
          </div>
        </div>
      </div>

    </n-drawer-content>
  </n-drawer>

  <NModal v-model:show="showExcalidrawModal" :title="t('importExcalidrawLibrary')" :style="{ width: '600px' }">
    <div class="excalidraw-modal-content">
      <h3 style="margin-top: 0;">{{ t('importExcalidrawLibrary') }}</h3>
      <p style="font-size: 13px; color: #666;">{{ t('excalidrawUrlHelp') }}</p>

      <NInput v-model:value="excalidrawUrl" placeholder="https://..." clearable />

      <div v-if="previewPackage" class="preview-section">
        <h4 class="preview-title">{{ t('parseSuccessTitle', { name: previewPackage.name, count: previewPackage.components.length }) }}</h4>
        <div class="preview-grid">
          <div class="preview-grid-item" v-for="item in previewPackage.components" :key="item.id">
            <ComponentPreview :data="item.data" :boxSize="40" />
          </div>
        </div>
      </div>

      <div class="modal-actions" style="margin-top: 16px; display: flex; justify-content: flex-end; gap: 8px;">
        <NButton @click="closeExcalidrawModal">{{ t('cancel') }}</NButton>
        <NButton v-if="!previewPackage" type="primary" :loading="isFetching" @click="handlePreviewExcalidraw">{{ t('parsePreview') }}
        </NButton>
        <NButton v-else type="primary" @click="handleConfirmImportExcalidraw">{{ t('confirmImport') }}</NButton>
      </div>
    </div>
  </NModal>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { NDrawer, NDrawerContent, NSpin, useMessage, NInput, NButton, NModal } from 'naive-ui';
import { useCanvasContext, ComponentPreview } from '@iss-ai/ppt-board';
import { pluginState, addImportedComponents, type LibraryComponent } from '../store';
import { parseExcalidrawLibrary, type MockPackage } from '../utils/excalidraw-parser';
import { useI18n } from '../composables/useI18n';

const { t } = useI18n();
const ctx = useCanvasContext();
const message = useMessage();
const loading = ref(true);

const isDarkTheme = computed(() => ctx.state?.editor?.theme === 'dark');

const mockPackages = ref<MockPackage[]>([]);

onMounted(async () => {
  // Simulate network request or dynamic loading
  try {
    const { loadMockPackages } = await import('../data/mockPackages');
    const packages = await loadMockPackages();
    
    mockPackages.value = packages;
    loading.value = false;
  } catch (error) {
    console.error('Failed to load mock data:', error);
    loading.value = false;
  }
});

const searchQuery = ref('');
const showExcalidrawModal = ref(false);
const excalidrawUrl = ref('');
const isFetching = ref(false);
const previewPackage = ref<MockPackage | null>(null);

const closeExcalidrawModal = () => {
  showExcalidrawModal.value = false;
  previewPackage.value = null;
  excalidrawUrl.value = '';
};

watch(excalidrawUrl, () => {
  if (previewPackage.value) {
    previewPackage.value = null;
  }
});

const filteredPackages = computed(() => {
  if (!searchQuery.value) return mockPackages.value;
  const q = searchQuery.value.toLowerCase();
  return mockPackages.value.filter(pkg => pkg.name.toLowerCase().includes(q));
});

const handleImport = (pkg: MockPackage) => {
  addImportedComponents(pkg.components, pkg.name);
  message.success(t('importSuccessMsg', { name: pkg.name }));
  pluginState.isDrawerVisible = false;
};

const handlePreviewExcalidraw = async () => {
  if (!excalidrawUrl.value) {
    message.warning(t('enterExcalidrawUrl'));
    return;
  }

  isFetching.value = true;
  previewPackage.value = null;
  try {
    const res = await fetch(excalidrawUrl.value);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    // Attempt to extract a good name from the URL or fall back
    const urlParts = excalidrawUrl.value.split('/');
    const fallbackName = urlParts[urlParts.length - 1].replace('.excalidrawlib', '');

    const parsedPkg = parseExcalidrawLibrary(json, fallbackName || t('excalidrawLibrary'));

    if (!parsedPkg) {
      throw new Error(t('invalidExcalidrawFormat'));
    }

    previewPackage.value = parsedPkg;
    message.success(t('parseSuccessMsg', { count: parsedPkg.components.length }));
  } catch (err: any) {
    console.error(err);
    message.error(t('fetchError', { error: err.message }));
  } finally {
    isFetching.value = false;
  }
};

const handleConfirmImportExcalidraw = () => {
  if (!previewPackage.value) return;
  addImportedComponents(previewPackage.value.components, previewPackage.value.name);
  message.success(t('confirmImportSuccessMsg', { name: previewPackage.value.name, count: previewPackage.value.components.length }));
  closeExcalidrawModal();
  pluginState.isDrawerVisible = false;
};
</script>

<style scoped>
.drawer-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.drawer-header-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.search-input {
  flex: 1;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #868e96;
  gap: 12px;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #868e96;
}

.package-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.package-card {
  border: 1px solid var(--canvas-border-color, #e9ecef);
  border-radius: 8px;
  padding: 16px;
  background: var(--canvas-panel-bg, #fff);
  transition: box-shadow 0.2s;
}

.package-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.drawer-container.dark .package-card,
:host-context(.dark) .package-card {
  --canvas-panel-bg: #2c2c2c;
  --canvas-border-color: #444;
}

.pkg-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
}

.pkg-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--canvas-text-color, #333);
}

.drawer-container.dark .pkg-title,
:host-context(.dark) .pkg-title {
  color: #e0e0e0;
}

.pkg-author {
  font-size: 12px;
  color: #868e96;
}

.drawer-container.dark .pkg-author,
:host-context(.dark) .pkg-author {
  color: #aaa;
}

.pkg-desc {
  margin: 0 0 16px 0;
  font-size: 13px;
  color: #495057;
  line-height: 1.5;
}

.drawer-container.dark .pkg-desc,
:host-context(.dark) .pkg-desc {
  color: #aaa;
}

.pkg-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.preview-item {
  width: 32px;
  height: 32px;
  background: #f8f9fa;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #495057;
  font-size: 14px;
  font-weight: bold;
}

.drawer-container.dark .preview-item,
:host-context(.dark) .preview-item {
  background: #3a3a3a;
  color: #e0e0e0;
}

.preview-item.more {
  font-size: 12px;
  color: #868e96;
}

.drawer-container.dark .preview-item.more,
:host-context(.dark) .preview-item.more {
  color: #aaa;
}

.import-btn {
  width: 100%;
  padding: 8px;
  background: rgba(92, 124, 250, 0.1);
  color: #5c7cfa;
  border: 1px solid rgba(92, 124, 250, 0.2);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.import-btn:hover {
  background: rgba(92, 124, 250, 0.2);
}

.excalidraw-modal-content {
  padding: 16px;
  background: var(--canvas-bg-color, #fff);
  border-radius: 8px;
}

.preview-section {
  margin-top: 20px;
  border-top: 1px solid #e9ecef;
  padding-top: 16px;
}

.preview-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #495057;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 4px;
}

.preview-grid-item {
  aspect-ratio: 1;
  background: #f8f9fa;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.dark .preview-section,
:host-context(.dark) .preview-section {
  border-color: #444;
}

.dark .preview-title,
:host-context(.dark) .preview-title {
  color: #ced4da;
}

.dark .preview-grid-item,
:host-context(.dark) .preview-grid-item {
  background: #3a3a3a;
}
</style>
