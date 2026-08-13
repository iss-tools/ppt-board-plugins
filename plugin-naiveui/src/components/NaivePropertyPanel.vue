<template>
  <div v-if="activeNaiveElement" class="naive-property-panel">
    <div class="panel-header">
      <h3>{{ activeNaiveElement.props?.naiveType || activeNaiveElement.type }} Config</h3>
    </div>
    
    <div class="panel-body">
      <!-- General Canvas Properties -->
      <div class="prop-section">
        <h4>Layout & Canvas</h4>
        <div class="prop-row">
          <label>X</label>
          <input type="number" v-model.number="layout.x" @change="updateLayout" />
        </div>
        <div class="prop-row">
          <label>Y</label>
          <input type="number" v-model.number="layout.y" @change="updateLayout" />
        </div>
        <div class="prop-row">
          <label>Width</label>
          <input type="number" v-model.number="layout.width" @change="updateLayout" />
        </div>
        <div class="prop-row">
          <label>Height</label>
          <input type="number" v-model.number="layout.height" @change="updateLayout" />
        </div>
      </div>

      <!-- Dynamic Props Editor (Raw JSON for now, can be enhanced with schema later) -->
      <div class="prop-section">
        <h4>Component Props</h4>
        <p class="desc">Edit Naive UI specific props</p>
        
        <div v-for="(val, key) in editableProps" :key="key" class="prop-row dynamic-prop">
          <label>{{ key }}</label>
          <input 
            v-if="typeof val === 'string'" 
            type="text" 
            :value="val" 
            @input="updateDynamicProp(key, ($event.target as HTMLInputElement).value)" 
          />
          <input 
            v-else-if="typeof val === 'number'" 
            type="number" 
            :value="val" 
            @input="updateDynamicProp(key, parseFloat(($event.target as HTMLInputElement).value))" 
          />
          <input 
            v-else-if="typeof val === 'boolean'" 
            type="checkbox" 
            :checked="val" 
            @change="updateDynamicProp(key, ($event.target as HTMLInputElement).checked)" 
          />
          <!-- Add a delete button for dynamic props -->
          <button class="btn-icon" @click="removeDynamicProp(key)" title="Remove Prop">🗑️</button>
        </div>

        <!-- Add new prop -->
        <div class="add-prop-row">
          <input type="text" v-model="newPropKey" placeholder="New prop name (e.g. type)" />
          <input type="text" v-model="newPropValue" placeholder="Value" />
          <button @click="addProp">Add</button>
        </div>
      </div>

      <!-- Slots Editor -->
      <div class="prop-section">
        <h4>Slots (Text/HTML)</h4>
        <div class="prop-row dynamic-prop" v-for="(val, key) in editableSlots" :key="key">
          <label>{{ key }}</label>
          <textarea 
            :value="val" 
            @input="updateSlot(key, ($event.target as HTMLTextAreaElement).value)"
            rows="2"
          ></textarea>
        </div>
        <div class="add-prop-row">
          <input type="text" v-model="newSlotKey" placeholder="New slot name (e.g. default)" />
          <button @click="addSlot">Add Slot</button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useCanvasContext } from '@iss-ai/ppt-board';

const ctx = useCanvasContext();

const activeNaiveElement = computed(() => {
  if (!ctx) return null;
  const { state } = ctx;
  if (state.runtime.selectedIds.size === 1) {
    const id = Array.from(state.runtime.selectedIds)[0];
    const el = state.runtime.activeElements.find(e => e.id === id);
    if (el && el.type === 'NaiveWidget') {
      return el;
    }
  }
  return null;
});

// Layout local state for binding
const layout = ref({ x: 0, y: 0, width: 0, height: 0 });

watch(activeNaiveElement, (el) => {
  if (el) {
    layout.value = { 
      x: el.x || 0, 
      y: el.y || 0, 
      width: el.width || 0, 
      height: el.height || 0 
    };
  }
}, { immediate: true, deep: true });

const updateLayout = () => {
  if (activeNaiveElement.value && ctx) {
    ctx.api.elements.update(activeNaiveElement.value.id, {
      x: layout.value.x,
      y: layout.value.y,
      width: layout.value.width,
      height: layout.value.height
    });
  }
};

// --- Props Management ---
const editableProps = computed(() => {
  return activeNaiveElement.value?.props || {};
});

const newPropKey = ref('');
const newPropValue = ref('');

const updateDynamicProp = (key: string | number, value: any) => {
  if (!activeNaiveElement.value || !ctx) return;
  const currentProps = { ...activeNaiveElement.value.props };
  currentProps[key] = value;
  ctx.api.elements.update(activeNaiveElement.value.id, { props: currentProps });
};

const removeDynamicProp = (key: string | number) => {
  if (!activeNaiveElement.value || !ctx) return;
  const currentProps = { ...activeNaiveElement.value.props };
  delete currentProps[key];
  ctx.api.elements.update(activeNaiveElement.value.id, { props: currentProps });
};

const addProp = () => {
  if (newPropKey.value && activeNaiveElement.value && ctx) {
    // Attempt to parse numbers or booleans automatically
    let val: any = newPropValue.value;
    if (val === 'true') val = true;
    else if (val === 'false') val = false;
    else if (!isNaN(Number(val)) && val.trim() !== '') val = Number(val);

    updateDynamicProp(newPropKey.value, val);
    newPropKey.value = '';
    newPropValue.value = '';
  }
};

// --- Slots Management ---
const editableSlots = computed(() => {
  return activeNaiveElement.value?.slots || { default: '' };
});

const newSlotKey = ref('');

const updateSlot = (key: string | number, value: string) => {
  if (!activeNaiveElement.value || !ctx) return;
  const currentSlots = { ...activeNaiveElement.value.slots };
  currentSlots[key] = value;
  ctx.api.elements.update(activeNaiveElement.value.id, { slots: currentSlots });
};

const addSlot = () => {
  if (newSlotKey.value && activeNaiveElement.value && ctx) {
    updateSlot(newSlotKey.value, 'New Slot Content');
    newSlotKey.value = '';
  }
};
</script>

<style scoped>
.naive-property-panel {
  position: absolute;
  right: 10px;
  top: 60px;
  width: 320px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 1000;
  font-family: sans-serif;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}

.panel-header {
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  border-radius: 8px 8px 0 0;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.panel-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.prop-section {
  border: 1px solid #eee;
  padding: 12px;
  border-radius: 6px;
  background: #fafafa;
}

.prop-section h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #555;
  border-bottom: 1px solid #ddd;
  padding-bottom: 4px;
}

.desc {
  font-size: 12px;
  color: #888;
  margin-top: 0;
  margin-bottom: 8px;
}

.prop-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  gap: 8px;
}

.prop-row label {
  width: 80px;
  font-size: 12px;
  color: #444;
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.prop-row input[type="number"],
.prop-row input[type="text"] {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 12px;
  min-width: 0;
}

.prop-row textarea {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 12px;
  min-width: 0;
  resize: vertical;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 2px;
  opacity: 0.6;
}
.btn-icon:hover {
  opacity: 1;
}

.add-prop-row {
  display: flex;
  gap: 4px;
  margin-top: 12px;
}

.add-prop-row input {
  flex: 1;
  padding: 4px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 12px;
  min-width: 0;
}

.add-prop-row button {
  padding: 4px 8px;
  background: #18a058;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}
.add-prop-row button:hover {
  background: #36ad6a;
}
</style>
