<template>
  <div class="provider-tab">
    <div class="content custom-scroll">
      <div class="style-panel-overlay">
        
        <div class="group-header">{{ t("provider.basic_info") }}</div>
        <div class="section">
          <div class="section-title">{{ t("provider.name") }}</div>
          <n-input v-model:value="formData.name" :placeholder="t('provider.name_placeholder')" />
        </div>

        <div class="group-divider"></div>
        <div class="group-header">{{ t("provider.provider_settings") }}</div>

        <div class="section">
          <div class="section-title">{{ t("provider.select_provider") }}</div>
          <n-select v-model:value="formData.provider" :options="presetProviders" filterable :placeholder="t('provider.select_provider_placeholder')" />
        </div>

        <div class="group-divider"></div>
        <div class="group-header">{{ t("provider.api_credentials") }}</div>

        <div class="section">
          <div class="section-title">{{ t("provider.api_url") }}</div>
          <n-input v-model:value="formData.url" placeholder="https://api.openai.com/v1" />
        </div>

        <div class="section">
          <div class="section-title">{{ t("provider.api_key") }}</div>
          <n-input v-model:value="formData.apiKey" type="password" show-password-on="click" placeholder="sk-..." />
        </div>

        <div class="section">
          <div class="section-title">{{ t("provider.model_select") }}</div>
          <div style="display: flex; gap: 4px;">
            <n-select v-model:value="formData.model" :options="dropdownModelOptions" filterable tag :placeholder="t('provider.model_select_placeholder')" style="flex: 1" />
            <n-tooltip placement="top">
              <template #trigger>
                <button class="custom-btn" style="padding: 0 8px;" @click="fetchModels" :disabled="isFetchingModels">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="{ 'spin-anim': isFetchingModels }"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                </button>
              </template>
              {{ t("provider.fetch_from_url") }}
            </n-tooltip>
          </div>
        </div>

      </div>
    </div>

    <div class="footer">
      <div style="flex: 1;">
        <n-dropdown :options="dropdownProviderOptions" @select="onSelectProvider" :arrow="false" placement="top-start"
          trigger="click">
          <button class="custom-btn" style="width: 100%; justify-content: flex-start; text-align: left;">
            {{ currentProviderName || t('provider.new_provider') }}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              style="margin-left: auto;">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </n-dropdown>
      </div>

      <n-tooltip placement="top">
        <template #trigger>
          <button class="custom-btn primary" @click="handleSave" style="padding: 0 8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
          </button>
        </template>
        {{ t('common.save') }}
      </n-tooltip>

      <n-tooltip placement="top">
        <template #trigger>
          <button class="custom-btn" @click="handleSaveAs" :disabled="!isEditing" style="padding: 0 8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </template>
        {{ t('provider.save_as') }}
      </n-tooltip>

      <n-tooltip placement="top">
        <template #trigger>
          <button class="custom-btn danger" @click="handleDelete" :disabled="!isEditing" style="padding: 0 8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </template>
        {{ t('provider.delete_config') }}
      </n-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { NInput, NDropdown, NTooltip, NSelect, useMessage } from 'naive-ui';
import { api } from '../api';
import { useAIStorage, type AIProvider } from '../composables/useAIStorage';
import { useI18n } from '../composables/useI18n';

const message = useMessage();
const { t } = useI18n();
const { providers, currentProviderId, addProvider, updateProvider, deleteProvider } = useAIStorage();

const presetProviders = [
  { label: 'OpenAI (openai)', value: 'openai', defaultUrl: 'https://api.openai.com/v1' },
  { label: 'Anthropic (anthropic)', value: 'anthropic', defaultUrl: 'https://api.anthropic.com/v1' },
  { label: 'Google Gemini (gemini)', value: 'gemini', defaultUrl: 'https://generativelanguage.googleapis.com' },
  { label: 'DeepSeek (deepseek)', value: 'deepseek', defaultUrl: 'https://api.deepseek.com/v1' },
  { label: 'Ollama (ollama)', value: 'ollama', defaultUrl: 'http://127.0.0.1:11434/v1' },
  { label: 'Qwen / 通义千问 (qwen)', value: 'qwen', defaultUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1' },
  { label: 'Moonshot / 月之暗面 (moonshot)', value: 'moonshot', defaultUrl: 'https://api.moonshot.cn/v1' },
  { label: 'Zhipu / 智谱清言 (zhipu)', value: 'zhipu', defaultUrl: 'https://open.bigmodel.cn/api/paas/v4' },
  { label: 'Baichuan / 百川智能 (baichuan)', value: 'baichuan', defaultUrl: 'https://api.baichuan-ai.com/v1' },
  { label: 'Minimax / 稀宇科技 (minimax)', value: 'minimax', defaultUrl: 'https://api.minimax.chat/v1' },
  { label: 'SiliconFlow / 硅基流动 (siliconflow)', value: 'siliconflow', defaultUrl: 'https://api.siliconflow.cn/v1' },
  { label: 'Groq (groq)', value: 'groq', defaultUrl: 'https://api.groq.com/openai/v1' },
  { label: 'Custom API (custom)', value: 'custom', defaultUrl: '' },
];

const modelMap: Record<string, string[]> = {
  openai: ['gpt-5.6-sol', 'gpt-5.6-terra', 'gpt-5.6-luna', 'gpt-5', 'gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  gemini: ['gemini-3.1-pro', 'gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
  anthropic: ['claude-5-opus', 'claude-5-sonnet', 'claude-5-fable', 'claude-3-5-sonnet-20240620', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
  deepseek: ['deepseek-v4-pro', 'deepseek-v4-flash', 'deepseek-chat', 'deepseek-coder'],
  qwen: ['qwen-3.8-max', 'qwen-3.8-27b', 'qwen-max', 'qwen-plus', 'qwen-turbo', 'qwen-long', 'qwen2-72b-instruct'],
  moonshot: ['kimi-k3', 'kimi-k2.7-code', 'kimi-k2.6', 'moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
  zhipu: ['glm-5.2', 'glm-5.1', 'glm-5v-turbo', 'glm-5', 'glm-4', 'glm-4-flash', 'glm-4v', 'glm-3-turbo'],
  ollama: ['llama-4', 'llama3.1', 'llama3', 'qwen-3.8-27b', 'qwen2', 'gemma-3', 'gemma2', 'mistral', 'mistral-nemo'],
  minimax: ['abab7-chat', 'abab6.5-chat', 'abab6.5s-chat'],
  baichuan: ['Baichuan5', 'Baichuan4', 'Baichuan3-Turbo'],
  groq: ['llama-4-70b', 'llama-3.1-70b-versatile', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
  siliconflow: ['deepseek-ai/deepseek-v4-flash', 'deepseek-ai/DeepSeek-V2-Chat', 'Qwen/qwen-3.8-27b', 'Qwen/Qwen2-72B-Instruct', 'ZhipuAI/glm-5.2', 'THUDM/glm-4-9b-chat']
};

const defaultForm = (): Omit<AIProvider, 'id'> => ({
  name: 'New Provider',
  provider: 'openai',
  url: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-4o',
});

const formData = ref<Omit<AIProvider, 'id'>>(defaultForm());
const isEditing = computed(() => !!currentProviderId.value);

const dropdownProviderOptions = computed(() => {
  const opts = providers.value.map(p => ({
    label: p.name,
    key: p.id,
  }));
  opts.unshift({ label: t('provider.new_config'), key: 'new' });
  return opts;
});

const currentProviderName = computed(() => {
  if (!currentProviderId.value) return null;
  return providers.value.find(p => p.id === currentProviderId.value)?.name || null;
});

const dynamicModels = ref<string[]>([]);
const isFetchingModels = ref(false);

const dropdownModelOptions = computed(() => {
  if (dynamicModels.value.length > 0) {
    return dynamicModels.value.map(m => ({ label: m, value: m }));
  }
  const models = modelMap[formData.value.provider] || [];
  return models.map(m => ({ label: m, value: m }));
});

const fetchModels = async () => {
  if (!formData.value.url) {
    message.warning(t('provider.req_url'));
    return;
  }

  isFetchingModels.value = true;
  try {
    const models = await api.fetchModels(formData.value.provider, formData.value.apiKey, formData.value.url);
    if (models.length > 0) {
      dynamicModels.value = models;
      message.success(t('provider.fetch_success', { count: models.length }));
    } else {
      message.warning(t('provider.fetch_empty'));
    }
  } catch (err: any) {
    message.error(t('provider.fetch_error') + err.message);
  } finally {
    isFetchingModels.value = false;
  }
};

watch(currentProviderId, (newId) => {
  dynamicModels.value = [];
  if (newId) {
    const p = providers.value.find(x => x.id === newId);
    if (p) {
      formData.value = { ...p };
    }
  } else {
    formData.value = defaultForm();
  }
}, { immediate: true });

// Auto select default model when provider changes if model isn't in list
watch(() => formData.value.provider, (newProvider, oldProvider) => {
  const models = modelMap[newProvider];
  if (models && !models.includes(formData.value.model)) {
    formData.value.model = models[0] || '';
  }
  
  if (oldProvider !== undefined) {
    const preset = presetProviders.find(p => p.value === newProvider);
    if (preset && preset.defaultUrl) {
      const knownUrls = presetProviders.map(p => p.defaultUrl).filter(Boolean);
      if (!formData.value.url || knownUrls.includes(formData.value.url)) {
        formData.value.url = preset.defaultUrl;
      }
    }
  }
});

const onSelectProvider = (val: string) => {
  if (val === 'new') {
    createNew();
  } else {
    currentProviderId.value = val;
  }
};

const createNew = () => {
  currentProviderId.value = '';
  formData.value = defaultForm();
};

const handleSave = () => {
  if (!formData.value.name || !formData.value.apiKey) {
    message.warning(t('provider.req_name_key'));
    return;
  }
  if (isEditing.value) {
    updateProvider(currentProviderId.value, formData.value);
    message.success(t('provider.update_success'));
  } else {
    const newId = addProvider(formData.value);
    currentProviderId.value = newId;
    message.success(t('provider.save_success'));
  }
};

const handleSaveAs = () => {
  if (!formData.value.name || !formData.value.apiKey) return;
  const newForm = { ...formData.value, name: formData.value.name + ' (Copy)' };
  const newId = addProvider(newForm);
  currentProviderId.value = newId;
  message.success(t('provider.save_as_success'));
};

const handleDelete = () => {
  if (isEditing.value) {
    deleteProvider(currentProviderId.value);
    message.success(t('provider.delete_success'));
  }
};
</script>

<style scoped>
.provider-tab {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
}


.content {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.spin-anim {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eaeaea;
}



/* Custom UI Components inspired by StyleTab.vue */
.style-panel-overlay {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.group-header {
  font-size: 13px;
  font-weight: 600;
  color: var(--ai-text);
  margin: 12px 0 8px 0;
  padding-left: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.group-header:first-child {
  margin-top: 0;
}

.group-divider {
  height: 1px;
  background-color: var(--ai-border);
  margin: 12px 0;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.section-title {
  font-size: 12px;
  color: var(--ai-text-muted);
  padding-left: 4px;
}

.icon-group {
  display: flex;
  background: var(--ai-panel-bg);
  border-radius: 8px;
  padding: 2px;
  gap: 2px;
}

.icon-group.wrap {
  flex-wrap: wrap;
  background: transparent;
  padding: 0;
  gap: 6px;
}

.icon-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--ai-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-btn.text-btn {
  width: auto;
  min-width: 44px;
  padding: 0 12px;
  font-size: 13px;
  background: var(--ai-panel-bg);
  display: flex;
  gap: 6px;
}

.icon-btn:hover {
  background: var(--ai-hover);
  color: var(--ai-text);
}

.icon-btn.active {
  background: var(--ai-primary-bg, #e0e7ff);
  color: var(--ai-primary);
  font-weight: 500;
}

.provider-icon {
  font-size: 14px;
}

/* Custom Flat Buttons for forms */
.custom-btn {
  height: 34px;
  padding: 0 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid var(--ai-border);
  background: var(--ai-bg);
  color: var(--ai-text);
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.custom-btn:hover {
  border-color: var(--ai-primary);
  color: #6366f1;
}

.custom-btn.primary {
  background: var(--ai-primary);
  border-color: var(--ai-primary);
  color: white;
}

.custom-btn.primary:hover {
  background: #4f46e5;
  border-color: var(--ai-primary);
}

.custom-btn.danger {
  color: var(--ai-danger);
  border-color: var(--ai-danger);
}

.custom-btn.danger:hover {
  background: #fef2f2;
  border-color: var(--ai-danger);
}

.custom-btn:disabled {
  background: var(--ai-panel-bg);
  border-color: #d9d9d9;
  color: var(--ai-text-muted);
  cursor: not-allowed;
}

/* Dark mode tweaks */




























/* Custom Scrollbar */
.custom-scroll::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}


</style>
