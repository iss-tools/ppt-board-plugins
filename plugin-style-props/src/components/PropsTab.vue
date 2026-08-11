<template>
  <div class="props-tab-container">
    <n-collapse :default-expanded-names="['common', 'props', 'style']">
      <!-- 常用属性 -->
      <n-collapse-item :title="t('tabs.common_props_common')" name="common">
        <n-form size="small" label-placement="left" label-width="80">
          <n-form-item label="ID">
            <n-input v-model:value="commonAttrs.id" @change="updateAttr('id', commonAttrs.id)" :placeholder="t('tabs.element_id')" />
          </n-form-item>
          <n-form-item :label="t('tabs.element_name')">
            <n-input v-model:value="commonAttrs.name" @change="updateAttr('name', commonAttrs.name)" placeholder="" />
          </n-form-item>
          <n-form-item :label="t('tabs.element_description')">
            <n-input v-model:value="commonAttrs.description" @change="updateAttr('description', commonAttrs.description)" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" placeholder="" />
          </n-form-item>
          <n-form-item :label="t('tabs.radius')">
            <div style="display: flex; align-items: center; width: 100%;">
              <n-slider v-model:value="styleAttrs.borderRadius" :min="0" :max="100" :step="1" @update:value="v => updateStyleAttr('border-radius', v + 'px')" style="flex: 1;" />
              <n-input-number v-model:value="styleAttrs.borderRadius" size="small" :min="0" :max="100" @update:value="v => updateStyleAttr('border-radius', v + 'px')" style="width: 70px; margin-left: 10px;" />
            </div>
          </n-form-item>
          <n-form-item :label="t('tabs.line_height')">
            <div style="display: flex; align-items: center; width: 100%;">
              <n-slider v-model:value="styleAttrs.lineHeight" :min="0.5" :max="3" :step="0.1" @update:value="v => updateStyleAttr('line-height', v)" style="flex: 1;" />
              <n-input-number v-model:value="styleAttrs.lineHeight" size="small" :min="0.5" :max="3" :step="0.1" @update:value="v => updateStyleAttr('line-height', v ?? 1)" style="width: 70px; margin-left: 10px;" />
            </div>
          </n-form-item>
          <n-form-item :label="t('tabs.letter_spacing')">
            <div style="display: flex; align-items: center; width: 100%;">
              <n-slider v-model:value="styleAttrs.letterSpacing" :min="-5" :max="30" :step="1" @update:value="v => updateStyleAttr('letter-spacing', v + 'px')" style="flex: 1;" />
              <n-input-number v-model:value="styleAttrs.letterSpacing" size="small" :min="-5" :max="30" @update:value="v => updateStyleAttr('letter-spacing', (v ?? 0) + 'px')" style="width: 70px; margin-left: 10px;" />
            </div>
          </n-form-item>
          <n-form-item :label="t('tabs.shadow')">
            <n-input v-model:value="styleAttrs.boxShadow" @change="updateStyleAttr('box-shadow', styleAttrs.boxShadow)" placeholder="0 4px 6px rgba(0,0,0,0.1)" />
          </n-form-item>

        </n-form>
      </n-collapse-item>

      <!-- 内联 Style 编辑 -->
      <n-collapse-item :title="t('tabs.inline_style_raw_json')" name="style">
        <n-input
          v-model:value="styleText"
          type="textarea"
          :placeholder="t('tabs.color_red_or_json')"
          @change="updateStyle"
          :autosize="{ minRows: 4, maxRows: 10 }"
          class="code-input"
        />
      </n-collapse-item>

      <!-- 组件 Props 编辑 -->
      <n-collapse-item :title="t('tabs.component_props_data')" name="props">
        <n-input
          v-model:value="propsText"
          type="textarea"
          :placeholder="t('tabs.text_hello_or_plain')"
          @change="updateProps"
          :autosize="{ minRows: 4, maxRows: 10 }"
          class="code-input"
        />
      </n-collapse-item>

      <!-- 组件 Methods 数据 -->
      <n-collapse-item :title="t('tabs.component_methods_data')" name="methods">
        <n-input
          v-model:value="methodsText"
          type="textarea"
          placeholder="{ &quot;onClick&quot;: &quot;handleClick&quot; }"
          @change="updateMethods"
          :autosize="{ minRows: 4, maxRows: 10 }"
          class="code-input"
        />
      </n-collapse-item>

      <!-- 组件 Events 数据 -->
      <n-collapse-item :title="t('tabs.component_events_data')" name="events">
        <n-input
          v-model:value="eventsText"
          type="textarea"
          placeholder="{ &quot;change&quot;: &quot;onChange&quot; }"
          @change="updateEvents"
          :autosize="{ minRows: 4, maxRows: 10 }"
          class="code-input"
        />
      </n-collapse-item>

      <!-- 组件 Model 数据 -->
      <n-collapse-item :title="t('tabs.component_model_data')" name="model">
        <n-input
          v-model:value="modelText"
          type="textarea"
          placeholder="{ &quot;value&quot;: &quot;myValue&quot; }"
          @change="updateModel"
          :autosize="{ minRows: 4, maxRows: 10 }"
          class="code-input"
        />
      </n-collapse-item>
    </n-collapse>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '../composables/useI18n';
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { NCollapse, NCollapseItem, NForm, NFormItem, NInput, NSlider, NInputNumber } from 'naive-ui';
import { useCanvasContext, CanvasEventNames } from '@iss-ai/ppt-board';

const props = defineProps<{
  elements: any[]
}>();

const ctx = useCanvasContext();
const { t } = useI18n();
const pluginApi = ctx.api;

const commonAttrs = ref({
  id: '',
  name: '',
  description: ''
});

const styleAttrs = ref({
  boxShadow: '',
  borderRadius: 0,
  lineHeight: 1.5,
  letterSpacing: 0
});

const propsText = ref('');
const styleText = ref('');
const methodsText = ref('');
const eventsText = ref('');
const modelText = ref('');

// 同步当前选中的元素的属性到面板
const syncFromElements = () => {
  if (props.elements.length === 0) return;
  const first = props.elements[0];

  const elProps = first.props || {};
  commonAttrs.value.id = first.id || '';
  commonAttrs.value.name = first.name || '';
  commonAttrs.value.description = first.description || '';

  let parsedStyle: Record<string, any> = {};
  if (typeof elProps.style === 'string') {
    parsedStyle = elProps.style.split(';').reduce((acc: any, pair: string) => {
      const [k, v] = pair.split(':');
      if (k && v) acc[k.trim()] = v.trim();
      return acc;
    }, {});
  } else if (typeof elProps.style === 'object' && elProps.style !== null) {
    parsedStyle = elProps.style;
  }

  styleAttrs.value.boxShadow = parsedStyle['box-shadow'] || parsedStyle.boxShadow || '';
  styleAttrs.value.borderRadius = parseInt(parsedStyle['border-radius'] || parsedStyle.borderRadius || '0') || 0;
  styleAttrs.value.lineHeight = parseFloat(parsedStyle['line-height'] || parsedStyle.lineHeight || '1.5') || 1.5;
  styleAttrs.value.letterSpacing = parseInt(parsedStyle['letter-spacing'] || parsedStyle.letterSpacing || '0') || 0;

  const customProps = { ...elProps };
  delete customProps.id;
  delete customProps.style; 
  delete customProps.bgm;
  delete customProps.animationIn;
  delete customProps.audioIn;
  delete customProps.animationEmphasis;
  delete customProps.audioEmphasis;
  delete customProps.animationOut;
  delete customProps.audioOut;
  delete customProps.delay;
  delete customProps.duration;

  if (Object.keys(customProps).length > 0) {
    propsText.value = typeof customProps === 'object' ? JSON.stringify(customProps, null, 2) : String(customProps);
  } else {
    propsText.value = '';
  }

  if (typeof elProps.style === 'string') {
    styleText.value = elProps.style;
  } else if (typeof elProps.style === 'object' && elProps.style !== null) {
    styleText.value = JSON.stringify(elProps.style, null, 2);
  } else {
    styleText.value = '';
  }

  const elMethods = first.methods || {};
  if (Object.keys(elMethods).length > 0) {
    methodsText.value = typeof elMethods === 'object' ? JSON.stringify(elMethods, null, 2) : String(elMethods);
  } else {
    methodsText.value = '';
  }

  const elEvents = first.events || {};
  if (Object.keys(elEvents).length > 0) {
    eventsText.value = typeof elEvents === 'object' ? JSON.stringify(elEvents, null, 2) : String(elEvents);
  } else {
    eventsText.value = '';
  }

  const elModel = first.model || {};
  if (Object.keys(elModel).length > 0) {
    modelText.value = typeof elModel === 'object' ? JSON.stringify(elModel, null, 2) : String(elModel);
  } else {
    modelText.value = '';
  }
};

watch(() => props.elements, syncFromElements, { deep: true, immediate: true });

const updateAttr = (key: string, value: string) => {
  if (!pluginApi || !pluginApi.elements || !pluginApi.elements.update) return;

  props.elements.forEach(el => {
    if (key === 'id') {
      pluginApi.elements.update(el.id, { id: value });
    } else if (key === 'name') {
      pluginApi.elements.update(el.id, { name: value });
    } else if (key === 'description') {
      pluginApi.elements.update(el.id, { description: value });
    } else {
      const newProps = { ...(el.props || {}) };
      if (value) {
        newProps[key] = value;
      } else {
        delete newProps[key];
      }
      pluginApi.elements.update(el.id, { props: newProps });
    }
  });
};

const updateStyleAttr = (key: string, value: string | number) => {
  if (!pluginApi || !pluginApi.elements || !pluginApi.elements.update) return;

  props.elements.forEach(el => {
    const newProps = { ...(el.props || {}) };
    let parsedStyle: Record<string, any> = {};
    
    if (typeof newProps.style === 'string') {
      parsedStyle = newProps.style.split(';').reduce((acc: any, pair: string) => {
        const [k, v] = pair.split(':');
        if (k && v) acc[k.trim()] = v.trim();
        return acc;
      }, {});
    } else if (typeof newProps.style === 'object' && newProps.style !== null) {
      parsedStyle = { ...newProps.style };
    }

    if (value !== null && value !== '' && value !== undefined) {
      parsedStyle[key] = value;
    } else {
      delete parsedStyle[key];
    }
    
    if (typeof newProps.style === 'string') {
      newProps.style = Object.entries(parsedStyle).map(([k, v]) => `${k}: ${v}`).join('; ');
    } else {
      newProps.style = parsedStyle;
    }
    
    pluginApi.elements.update(el.id, { props: newProps });
  });
};

const updateProps = () => {
  if (!pluginApi || !pluginApi.elements || !pluginApi.elements.update) return;

  let parsedProps: any = {};
  try {
    if (propsText.value.trim()) {
      parsedProps = JSON.parse(propsText.value);
    }
  } catch (e) {
    console.warn('Props JSON parse error', e);
    return;
  }

  props.elements.forEach(el => {
    const newProps = { ...(el.props || {}) };

    Object.keys(newProps).forEach(k => {
      if (!['id', 'class', 'src', 'href', 'placeholder', 'style', 'bgm', 'animationIn', 'audioIn', 'animationEmphasis', 'audioEmphasis', 'animationOut', 'audioOut', 'delay', 'duration'].includes(k)) {
        delete newProps[k];
      }
    });

    Object.assign(newProps, parsedProps);
    pluginApi.elements.update(el.id, { props: newProps });
  });
};

const updateStyle = () => {
  if (!pluginApi || !pluginApi.elements || !pluginApi.elements.update) return;

  props.elements.forEach(el => {
    const newProps = { ...(el.props || {}) };
    const text = styleText.value.trim();
    if (text) {
      if (text.startsWith('{') && text.endsWith('}')) {
        try {
          newProps.style = JSON.parse(text);
        } catch(e) {
          newProps.style = text;
        }
      } else {
        newProps.style = text;
      }
    } else {
      delete newProps.style;
    }
    pluginApi.elements.update(el.id, { props: newProps });
  });
};

const updateMethods = () => {
  if (!pluginApi || !pluginApi.elements || !pluginApi.elements.update) return;

  let parsed: any = {};
  try {
    if (methodsText.value.trim()) {
      parsed = JSON.parse(methodsText.value);
    }
  } catch (e) {
    console.warn('Methods JSON parse error', e);
    return;
  }

  props.elements.forEach(el => {
    pluginApi.elements.update(el.id, { methods: parsed });
  });
};

const updateEvents = () => {
  if (!pluginApi || !pluginApi.elements || !pluginApi.elements.update) return;

  let parsed: any = {};
  try {
    if (eventsText.value.trim()) {
      parsed = JSON.parse(eventsText.value);
    }
  } catch (e) {
    console.warn('Events JSON parse error', e);
    return;
  }

  props.elements.forEach(el => {
    pluginApi.elements.update(el.id, { events: parsed });
  });
};

const updateModel = () => {
  if (!pluginApi || !pluginApi.elements || !pluginApi.elements.update) return;

  let parsed: any = {};
  try {
    if (modelText.value.trim()) {
      parsed = JSON.parse(modelText.value);
    }
  } catch (e) {
    console.warn('Model JSON parse error', e);
    return;
  }

  props.elements.forEach(el => {
    pluginApi.elements.update(el.id, { model: parsed });
  });
};

onMounted(() => {
  if (ctx.hooks) {
    ctx.hooks.on(CanvasEventNames.CHANGE, syncFromElements);
  }
});

onUnmounted(() => {
  if (ctx.hooks) {
    ctx.hooks.off(CanvasEventNames.CHANGE, syncFromElements);
  }
});
</script>

<style scoped>
.props-tab-container {
  padding: 8px 0;
}
.code-input {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
}

/* Dark Theme Overrides */
.dark, :host-context(.dark) {
  --canvas-panel-bg: #2c2c2c;
  --canvas-btn-bg: #3a3a3a;
  --canvas-btn-hover-bg: #4a4a4a;
  --canvas-border-color: #555;
  --canvas-text-color: #e0e0e0;
  --canvas-text-muted: #aaa;
  --canvas-input-bg: #1e1e1e;
}


</style>
