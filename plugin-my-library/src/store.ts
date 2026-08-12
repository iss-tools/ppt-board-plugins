import { reactive, ref } from 'vue';
import type { CanvasElementData, CanvasPluginContext } from '@iss-ai/ppt-board';
import { useEasyStore } from '@iss-ai/ppt-board';

export interface LibraryComponent {
  id?: string;
  name: string;
  packageName?: string;
  data: CanvasElementData | CanvasElementData[];
  createdAt: number;
}

export const pluginState = reactive({
  isPanelVisible: false,
  isDrawerVisible: false,
  libraryUrl: '/data/library',
  pendingImportUrl: '',
});

export const personalComponents = ref<LibraryComponent[]>([]);
export const importedComponents = ref<LibraryComponent[]>([]);

let pluginCtx: CanvasPluginContext | null = null;
const personalStore = useEasyStore<LibraryComponent>('plugin_my_library_personal');
const importedStore = useEasyStore<LibraryComponent>('plugin_my_library_imported');

export const initStore = async (ctx: CanvasPluginContext) => {
  pluginCtx = ctx;

  try {
    const pList = await personalStore.getList();
    // sort by createdAt desc if necessary, or DB does it
    personalComponents.value = pList.sort((a, b) => b.createdAt - a.createdAt);

    const iList = await importedStore.getList();
    importedComponents.value = iList.sort((a, b) => b.createdAt - a.createdAt);
  } catch (err) {
    console.error('[MyLibraryPlugin] Failed to load data from indexedDB:', err);
  }
};

export const addPersonalComponent = async (elements: CanvasElementData[]) => {
  if (!elements || elements.length === 0) return;

  const arr = JSON.parse(JSON.stringify(elements)) as CanvasElementData[];

  // Calculate bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  arr.forEach(el => {
    minX = Math.min(minX, el.x);
    minY = Math.min(minY, el.y);
    maxX = Math.max(maxX, el.x + (el.width || 100));
    maxY = Math.max(maxY, el.y + (el.height || 100));
  });

  // Re-center elements so their bounding box origin is at (0,0)
  arr.forEach(el => {
    el.x = el.x - minX;
    el.y = el.y - minY;
  });

  const first = arr[0];
  const name = arr.length > 1 
    ? `组 (${arr.length} 个元素)` 
    : (first.type === 'TextElement' ? (first.props?.text as string) || 'Text' : first.type);

  const component: LibraryComponent = {
    name,
    data: arr.length === 1 ? arr[0] : arr,
    createdAt: Date.now(),
  };

  try {
    const savedItem = await personalStore.save(component as any);
    personalComponents.value.unshift(savedItem);
  } catch (err) {
    console.error('Failed to save personal component:', err);
  }
};

export const deletePersonalComponent = async (id: string) => {
  try {
    await personalStore.delete({ id });
    personalComponents.value = personalComponents.value.filter(c => c.id !== id);
  } catch (err) {
    console.error('Failed to delete personal component:', err);
  }
};

export const deleteImportedComponent = async (id: string) => {
  try {
    await importedStore.delete({ id });
    importedComponents.value = importedComponents.value.filter(c => c.id !== id);
  } catch (err) {
    console.error('Failed to delete imported component:', err);
  }
};

export const addImportedComponents = async (components: LibraryComponent[], packageName: string = '未命名素材库') => {
  const newComps = components.map(c => {
    // Drop 'id' so the DB can generate a clean unique one
    const { id, ...rest } = c;
    rest.packageName = packageName;
    // Strip Vue proxies to prevent IndexedDB DataCloneError
    return JSON.parse(JSON.stringify(rest));
  });
  
  try {
    console.log('[store] Saving to DB:', newComps);
    
    // Remove existing components with the same packageName to avoid duplicates
    const existing = importedComponents.value.filter(c => c.packageName === packageName);
    for (const old of existing) {
      if (old.id) {
        await importedStore.delete({ id: old.id });
      }
    }
    // Update local state by removing the old components
    importedComponents.value = importedComponents.value.filter(c => c.packageName !== packageName);

    const savedItems: LibraryComponent[] = [];
    for (const comp of newComps) {
      const saved = await importedStore.save(comp as any);
      savedItems.push(saved);
    }
    console.log('[store] Saved items from DB:', savedItems);
    importedComponents.value = [...savedItems, ...importedComponents.value];
    console.log('[store] New importedComponents length:', importedComponents.value.length);
  } catch (err) {
    console.error('Failed to save imported components:', err);
  }
};
