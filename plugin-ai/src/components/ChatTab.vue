<template>
  <div class="chat-tab">
    <!-- Middle: Chat History -->
    <div class="chat-history" ref="historyRef">
      <n-scrollbar ref="scrollbarRef" class="custom-scroll">
        <div class="messages">
          <div v-for="(msg, idx) in messages" :key="idx" class="message-wrapper"
            :class="{ 'is-user': msg.role === 'user' }">
            <div class="message-bubble">
              <!-- Parsed Content -->
              <template v-for="(part, pIdx) in parseMessageParts(msg.text)" :key="pIdx">
                <!-- Text -->
                <div v-if="part.type === 'text' && part.content.trim()" class="text-content">{{ part.content }}</div>
                
                <!-- Think Blocks -->
                <div v-if="part.type === 'think'" class="think-content custom-scroll">
                  {{ part.content }}
                </div>

                <!-- Data Blocks -->
                <div v-if="part.type === 'data'" class="code-block">
                  <div class="code-header">
                    <span class="code-lang">&lt;json / data&gt;</span>
                    <div class="code-actions">
                      <button class="code-btn" @click="copyToClipboard(part.content)">{{ t('common.copy') }}</button>
                      <button class="code-btn primary" @click="applyCode(part.content)">{{ t('common.apply') }}</button>
                    </div>
                  </div>
                  <div class="code-pre-wrap custom-scroll">
                    <pre><code>{{ part.content }}</code></pre>
                  </div>
                </div>
              </template>

              <!-- Attachments -->
              <div class="attachments" v-if="msg.attachments && msg.attachments.length">
                <div v-for="(att, aIdx) in msg.attachments" :key="aIdx" class="attachment-item">
                  <n-image v-if="att.type === 'image'" :src="att.url" class="img-preview" object-fit="cover" />
                  <div v-else class="file-preview" @click="handleFileClick(att)" style="cursor: pointer;">
                    <span class="file-icon">📄</span>
                    <span class="file-name" style="text-decoration: underline;">{{ att.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </n-scrollbar>
    </div>

    <!-- Bottom: Input Area -->
    <div class="input-area">
      <!-- Attachments Preview for current input -->
      <div class="current-attachments custom-scroll" v-if="currentAttachments.length > 0">
        <div v-for="(att, idx) in currentAttachments" :key="idx" class="att-chip">
          <n-image v-if="att.type === 'image'" :src="att.url" height="24" style="border-radius: 4px;"
            object-fit="cover" />
          <span v-else @click="handleFileClick(att)" style="cursor: pointer;">📄 {{ att.name }}</span>
          <button class="close-btn" @click="removeAttachment(idx)">✕</button>
        </div>
      </div>

      <!-- Toolbar & Input -->
      <div class="input-box" @dragenter.prevent="handleDragEnter" @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave" @drop.prevent="handleDrop" :class="{ 'is-dragging': isDragging }">
        <div class="toolbar">
          <div class="tools-left">
            <!-- History Dropdown -->
            <n-dropdown :options="historyOptions" @select="loadSession" @update:show="handleDropdownShow" placement="top" trigger="click">
              <button class="tool-btn" :title="t('chat.history')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </button>
            </n-dropdown>

            <!-- New Session -->
            <button class="tool-btn" :title="t('chat.new_session')" @click="createNewSession">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>

            <div class="divider"></div>

            <!-- Attachments -->
            <button class="tool-btn" :title="t('chat.upload_file')" @click="triggerUpload('*')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <path
                  d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48">
                </path>
              </svg>
            </button>
            <button class="tool-btn" :title="t('chat.upload_image')" @click="triggerUpload('image/*')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </button>
            <button class="tool-btn" :title="t('chat.add_link')" @click="showLinkModal = true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
            </button>

            <input type="file" ref="fileInputRef" style="display: none" @change="handleFileChange" />
          </div>

          <div class="tools-right">
            <!-- Model Dropdown -->
            <n-dropdown :options="dropdownModelOptions" @select="handleSelectModel" @update:show="handleDropdownShow" placement="top" trigger="click">
              <button class="tool-btn text-btn" :title="selectedModel || '选择模型'">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  style="margin-right: 4px;">
                  <path
                    d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z">
                  </path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
                <span class="truncate-text" style="max-width: 60px;">{{ selectedModel || 'Model' }}</span>
              </button>
            </n-dropdown>

            <!-- Prompt Settings -->
            <button class="tool-btn text-btn" :title="t('chat.settings')" @click="showPromptSettings = true" :class="{ 'active': true }">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  style="margin-right: 4px;">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              <!-- <span class="truncate-text" style="max-width: 60px;">生成设定</span> -->
            </button>
          </div>
        </div>

        <div class="input-wrapper">
          <textarea v-model="inputText" class="chat-input custom-scroll"
            :placeholder="t('chat.placeholder')" @keydown="handleKeydown" @paste="handlePaste"
            rows="2"></textarea>
          <n-dropdown placement="top-end" :options="sendOptions" @select="handleSendOption" trigger="hover">
            <button class="send-btn" @click="handleSend('component')"
              :disabled="isGenerating || (!inputText.trim() && currentAttachments.length === 0)">
            <svg v-if="!isGenerating" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
            <span v-else class="loading-spinner"></span>
          </button>
          </n-dropdown>
        </div>

        <!-- Drag overlay -->
        <div class="drag-overlay" v-if="isDragging">
          <div class="drag-text">{{ t('chat.drag_text') }}</div>
        </div>
      </div>
    </div>

    <!-- Prompt Settings Modal -->
    <PromptSettingsModal v-model:show="showPromptSettings"  :initialStyleConfig="currentStyleConfig"  @confirm="handlePromptSettingsConfirm" />
    
    <!-- Link Modal -->
    <n-modal v-model:show="showLinkModal" preset="dialog" :title="t('chat.link_title')">
      <n-input v-model:value="linkInput" placeholder="https://..." />
      <template #action>
        <button class="custom-btn" @click="showLinkModal = false">{{ t('common.cancel') }}</button>
        <button class="custom-btn primary" @click="handleAddLink" :disabled="isFetchingLink">
          {{ isFetchingLink ? t('chat.link_parsing') : t('chat.link_parse_add') }}
        </button>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore
import agentBasePromptRaw from '../assets/AGENT.md?raw';

import { ref, computed, nextTick, onMounted } from 'vue';
import { NInput, NScrollbar, NModal, NDropdown, NImage, useMessage } from 'naive-ui';
import { useAIStorage } from '../composables/useAIStorage';
import { useI18n } from '../composables/useI18n';
import { api, ChatOptions } from '../api';
import { useCanvasContext } from '@iss-ai/ppt-board';
import PromptSettingsModal from './PromptSettingsModal.vue';

import { buildVisualRequirements } from '../composables/usePromptBuilder';
import { applyPatch, type Operation } from 'fast-json-patch';

const message = useMessage();
const { prompts, providers, currentProviderId, sessions, saveSession, loadData } = useAIStorage();
const ctx = useCanvasContext();
const { t } = useI18n();

// State
const selectedPromptId = ref<string | null>(null);
const selectedModel = ref<string | null>(null);
const inputText = ref('');
const messages = ref<any[]>([]);
const currentAttachments = ref<any[]>([]);
const isGenerating = ref(false);
const isDragging = ref(false);
const showPromptSettings = ref(false);


onMounted(async () => {

  const saved = localStorage.getItem('ai_prompt_settings');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      
      if (parsed.styleConfig) currentStyleConfig.value = parsed.styleConfig;
    } catch (e) {
      console.error('Failed to parse saved prompt settings', e);
    }
  }
});

const currentStyleConfig = ref<any>({
  resolution: '1920x1080',
  aspectRatio: 'auto',
  layout: ['none'],
  colorPalette: ['none'],
  font: ['none'],
  style: ['none'],
  shadow: ['none'],
  textEffect: ['none'],
  shapes: ['none'],
  borderSketch: ['none'],
  fontSize: ['中等 (24-32px)'],
  language: ['Original / 原文'],
  bgm: false,
  supportImage: true,
  supportSound: false
});

const handlePromptSettingsConfirm = (config: { scope: string, styleConfig: any }) => {
  
  currentStyleConfig.value = config.styleConfig;
  
  localStorage.setItem('ai_prompt_settings', JSON.stringify({
    
    styleConfig: currentStyleConfig.value
  }));
  message.success(`已保存设定`);
};

let dragCounter = 0;

const currentSessionId = ref<string | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const showLinkModal = ref(false);
const linkInput = ref('');
const isFetchingLink = ref(false);
const scrollbarRef = ref<any>(null);

const handleDropdownShow = (show: boolean) => {
  if (show) {
    loadData();
  }
};

// Computed
const dropdownPromptOptions = computed(() => {
  const opts = prompts.value.map(p => ({ label: p.name, key: p.id }));
  if (selectedPromptId.value) {
    opts.unshift({ label: t('chat.clear_select'), key: 'clear' });
  }
  return opts;
});

const selectedPromptName = computed(() => {
  if (!selectedPromptId.value) return null;
  return prompts.value.find(p => p.id === selectedPromptId.value)?.name || null;
});

const handleSelectPrompt = (key: string) => {
  if (key === 'clear') {
    selectedPromptId.value = null;
  } else {
    selectedPromptId.value = key;
  }
};

const dropdownModelOptions = computed(() => {
  const pId = currentProviderId.value;
  const p = providers.value.find(x => x.id === pId);
  if (!p) return [{ label: t('chat.empty_provider'), key: 'none', disabled: true }];
  return p.model ? [{ label: p.model, key: p.model }] : [];
});

if (dropdownModelOptions.value.length > 0 && !(dropdownModelOptions.value[0] as any).disabled) {
  selectedModel.value = dropdownModelOptions.value[0].key as string;
}

const handleSelectModel = (key: string) => {
  selectedModel.value = key;
};

// Session Logic
const historyOptions = computed(() => {
  if (sessions.value.length === 0) return [{ label: t('chat.session_empty'), key: 'empty', disabled: true }];
  return sessions.value.map(s => ({ label: s.name, key: s.id }));
});

const loadSession = (key: string) => {
  const session = sessions.value.find(s => s.id === key);
  if (session) {
    messages.value = JSON.parse(JSON.stringify(session.messages));
    currentSessionId.value = session.id;
    message.success(t('chat.session_loaded') + session.name);
    scrollToBottom();
  }
};

const createNewSession = async () => {
  if (messages.value.length > 0) {
    const name = messages.value[0].text ? messages.value[0].text.substring(0, 15) + '...' : `Chat ${new Date().toLocaleTimeString()}`;
    await saveSession({
      id: currentSessionId.value || '',
      name,
      messages: JSON.parse(JSON.stringify(messages.value))
    });
  }

  messages.value = [];
  currentSessionId.value = null;
  message.success(t('chat.session_new'));
};

const autoSaveCurrentSession = async () => {
  if (messages.value.length === 0) return;
  const name = messages.value[0].text ? messages.value[0].text.substring(0, 15) + '...' : `Chat ${new Date().toLocaleTimeString()}`;
  const id = await saveSession({
    id: currentSessionId.value || '',
    name,
    messages: JSON.parse(JSON.stringify(messages.value))
  });
  if (!currentSessionId.value) {
    currentSessionId.value = id;
  }
};

// File Upload Logic
const triggerUpload = (accept: string) => {
  if (fileInputRef.value) {
    fileInputRef.value.accept = accept;
    fileInputRef.value.click();
  }
};

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    for (let i = 0; i < target.files.length; i++) processFile(target.files[i]);
  }
  target.value = '';
};

const handlePaste = (e: ClipboardEvent) => {
  if (e.clipboardData && e.clipboardData.items) {
    for (let i = 0; i < e.clipboardData.items.length; i++) {
      const item = e.clipboardData.items[i];
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) processFile(file);
      }
    }
  }
};

const handleDragOver = (e: DragEvent) => {
  e.dataTransfer!.dropEffect = 'copy';
};

const handleDragEnter = (e: DragEvent) => {
  dragCounter++;
  isDragging.value = true;
};

const handleDragLeave = (e: DragEvent) => {
  dragCounter--;
  if (dragCounter === 0) {
    isDragging.value = false;
  }
};

const handleDrop = (e: DragEvent) => {
  dragCounter = 0;
  isDragging.value = false;
  if (e.dataTransfer && e.dataTransfer.files) {
    const files = e.dataTransfer.files;
    for (let i = 0; i < files.length; i++) {
      processFile(files[i]);
    }
  }
};

const compressImage = (file: File, maxWidth = 1920, quality = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(file);

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (!blob) return resolve(file);
          const compressedFile = new File([blob], file.name, {
            type: file.type || 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        }, file.type || 'image/jpeg', quality);
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

const processFile = async (file: File) => {
  const isImage = file.type.startsWith('image/');
  let targetFile = file;

  if (isImage) {
    // Compress image before attaching
    targetFile = await compressImage(file, 1920, 0.8);
  }

  const url = URL.createObjectURL(targetFile);
  
  const reader = new FileReader();
  if (isImage) {
    reader.readAsDataURL(targetFile);
  } else if (file.type.startsWith('text/') || file.name.endsWith('.json') || file.name.endsWith('.md') || file.name.endsWith('.ts') || file.name.endsWith('.vue')) {
    reader.readAsText(targetFile);
  } else {
    // Unsupported file type for AI ingestion, just add as attachment
    currentAttachments.value.push({
      type: 'file',
      name: targetFile.name,
      url: url,
      file: targetFile
    });
    return;
  }

  reader.onload = (e) => {
    currentAttachments.value.push({
      type: isImage ? 'image' : 'file',
      name: targetFile.name,
      url: url,
      file: targetFile,
      base64: isImage ? e.target?.result : undefined,
      content: !isImage ? e.target?.result : undefined
    });
  };
};

const removeAttachment = (idx: number) => {
  currentAttachments.value.splice(idx, 1);
};

const handleFileClick = (att: any) => {
  if (att.url) {
    window.open(att.url, '_blank');
  } else if (att.content) {
    if (att.name.startsWith('🔗 ')) {
      window.open(att.name.replace('🔗 ', ''), '_blank');
    }
  }
};

// Link Logic
const handleAddLink = async () => {
  if (!linkInput.value) return;
  isFetchingLink.value = true;
  try {
    const res = await fetch(`https://r.jina.ai/${linkInput.value}`);
    const text = await res.text();
    currentAttachments.value.push({
      type: 'file',
      name: `🔗 ${linkInput.value}`,
      content: text
    });
    showLinkModal.value = false;
    linkInput.value = '';
    message.success(t('chat.link_success'));
  } catch (error) {
    message.error(t('chat.link_fail'));
    console.error(error);
  } finally {
    isFetchingLink.value = false;
  }
};


const scrollToBottom = async () => {
  await nextTick();
  if (scrollbarRef.value) {
    scrollbarRef.value.scrollTo({ position: 'bottom' });
  }
};

const mockCanvasModifier = (text: string) => {
  const lower = text.toLowerCase();

  if (lower.includes('添加文字') || lower.includes('add text')) {
    ctx.api.elements.add({
      id: `text_${Date.now()}`,
      type: 'TextElement',
      x: 200, y: 200, width: 300, height: 100,
      props: { text: 'AI Generated Text', style: 'color: #6366f1; font-size: 32px;' }
    });
    return true;
  }

  if (lower.includes('文字特效') || lower.includes('text effect')) {
    const selected = ctx.state.runtime.selectedIds;
    if (selected && selected.size > 0) {
      selected.forEach(id => {
        const el = ctx.state.runtime.activeElements.find(e => e.id === id);
        if (el && el.type === 'TextElement') {
          if (!el.props) el.props = {};
            el.props.style = (el.props.style || '') + 'text-shadow: 2px 2px 4px #ff0000;';
        }
      });
      return true;
    }
  }
  return false;
};

interface MessagePart {
  type: 'text' | 'think' | 'data';
  content: string;
}

const parseMessageParts = (text: string): MessagePart[] => {
  const parts: MessagePart[] = [];
  if (!text) return parts;
  
  let currentText = text;
  
  // 1. First, extract <think> blocks
  let thinkMatch;
  const thinkRegex = /<think>([\s\S]*?)<\/think>/g;
  let lastIndex = 0;
  
  while ((thinkMatch = thinkRegex.exec(currentText)) !== null) {
    const before = currentText.substring(lastIndex, thinkMatch.index);
    if (before.trim()) parts.push({ type: 'text', content: before });
    
    parts.push({ type: 'think', content: thinkMatch[1] });
    lastIndex = thinkRegex.lastIndex;
  }
  
  const remainingAfterThink = currentText.substring(lastIndex);
  if (remainingAfterThink.trim()) {
    parts.push({ type: 'text', content: remainingAfterThink });
  }

  // 2. Extract <data> blocks explicitly
  const withDataParts: MessagePart[] = [];
  for (const part of parts) {
    if (part.type !== 'text') {
      withDataParts.push(part);
      continue;
    }
    
    let content = part.content;
    let dataMatch;
    const dataRegex = /<data>([\s\S]*?)<\/data>/g;
    let dataLastIdx = 0;
    
    while ((dataMatch = dataRegex.exec(content)) !== null) {
      const before = content.substring(dataLastIdx, dataMatch.index);
      if (before.trim()) withDataParts.push({ type: 'text', content: before });
      
      withDataParts.push({ type: 'data', content: dataMatch[1].trim() });
      dataLastIdx = dataRegex.lastIndex;
    }
    
    const remaining = content.substring(dataLastIdx);
    if (remaining.trim()) {
      withDataParts.push({ type: 'text', content: remaining });
    }
  }

  // 3. Process remaining 'text' parts for markdown code blocks or aggressive raw JSON
  const finalParts: MessagePart[] = [];
  
  for (const part of withDataParts) {
    if (part.type !== 'text') {
      finalParts.push(part);
      continue;
    }
    
    let content = part.content;
    
    // Extract markdown code blocks
    const codeRegex = /```(?:json|javascript|js)?\s*([\s\S]*?)```/g;
    let codeMatch;
    let codeLastIdx = 0;
    let foundCode = false;
    
    while ((codeMatch = codeRegex.exec(content)) !== null) {
      foundCode = true;
      const beforeCode = content.substring(codeLastIdx, codeMatch.index);
      
      const beforeTrim = beforeCode.trim();
      if ((beforeTrim.startsWith('{') || beforeTrim.startsWith('[')) && (beforeTrim.includes('"id":') || beforeTrim.includes('"op":'))) {
         finalParts.push({ type: 'data', content: beforeTrim });
      } else if (beforeTrim) {
         finalParts.push({ type: 'text', content: beforeCode });
      }
      
      finalParts.push({ type: 'data', content: codeMatch[1].trim() });
      codeLastIdx = codeRegex.lastIndex;
    }
    
    if (foundCode) {
      const afterCode = content.substring(codeLastIdx);
      if (afterCode.trim()) {
        finalParts.push({ type: 'text', content: afterCode });
      }
    } else {
      const trimContent = content.trim();
      if ((trimContent.startsWith('{') || trimContent.startsWith('[')) && (trimContent.includes('"id":') || trimContent.includes('"op":') || trimContent.includes('"path":'))) {
         finalParts.push({ type: 'data', content: trimContent });
      } else {
         finalParts.push({ type: 'text', content: content });
      }
    }
  }

  return finalParts;
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  message.success('已复制到剪贴板');
};

const applyCode = (jsonStr: string) => {
  try {
    let parsedJson: any = JSON.parse(jsonStr);
    
    // Auto-wrap single patch object into an array
    if (parsedJson && typeof parsedJson === 'object' && !Array.isArray(parsedJson) && parsedJson.op && parsedJson.path) {
      parsedJson = [parsedJson];
    }
    
    if (Array.isArray(parsedJson)) {
      // Patch Mode
      const slideIndex = ctx.state.runtime.currentSlideIndex || 0;
      const currentSlide = ctx.state.document.slides[slideIndex];
      
      const allElementsMap: Record<string, any> = {};
      currentSlide.elements.forEach(el => {
        allElementsMap[el.id] = JSON.parse(JSON.stringify(el));
      });
      
      // Robust sanitize missing leading slashes in paths
      parsedJson.forEach((op: any) => {
        if (op.path && typeof op.path === 'string' && !op.path.startsWith('/')) {
          op.path = '/' + op.path;
        }
      });

      const firstOp = parsedJson[0] as Operation;
      if (firstOp && typeof firstOp.path === 'string' && (firstOp.path.startsWith('/slides') || firstOp.path.startsWith('/options') || firstOp.path.startsWith('/meta'))) {
        const docClone = JSON.parse(JSON.stringify(ctx.state.document));
        applyPatch(docClone, parsedJson as Operation[]);
        ctx.api.project.load(docClone);
        message.success(t('chat.apply_success'));
      } else {
        
        // We mutate allElementsMap in place
        applyPatch(allElementsMap, parsedJson as Operation[]);
        currentSlide.elements = Object.values(allElementsMap);
        
        // Use project.load to ensure the engine completely re-initializes the elements
        const docClone = JSON.parse(JSON.stringify(ctx.state.document));
        ctx.api.project.load(docClone);
        
        message.success(t('chat.apply_component'));
      }
    } else if (typeof parsedJson === 'object' && parsedJson !== null) {
      if (parsedJson.slides) {
        // Full Generation Mode
        if (parsedJson.options && parsedJson.options.theme) {
          ctx.state.editor.theme = parsedJson.options.theme;
        }
        ctx.api.project.load(parsedJson);
        message.success(t('chat.apply_full'));
      } else if (parsedJson.elements) {
        // Single Slide Mode
        if (parsedJson.options && parsedJson.options.theme) {
          ctx.state.editor.theme = parsedJson.options.theme;
        }
        const slideIndex = ctx.state.runtime.currentSlideIndex || 0;
        const currentSlide = ctx.state.document.slides[slideIndex];
        currentSlide.elements = parsedJson.elements;
        
        // Use project.load to ensure the engine completely re-initializes the elements
        const docClone = JSON.parse(JSON.stringify(ctx.state.document));
        ctx.api.project.load(docClone);
        
        message.success(t('chat.apply_single'));
      } else {
        message.error(t('chat.unknown_format'));
      }
    }
  } catch (e: any) {
    console.error('Failed to apply AI JSON', e);
    message.error(t('chat.apply_error'));
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend('component');
  }
};


const sendOptions = computed(() => [
  { label: t('chat.send_single') || '生成单页', key: 'single' },
  { label: t('chat.send_multi') || '生成多页', key: 'multi' },
  { label: t('chat.img2component') || '图片转组件', key: 'img2component' }
]);

const handleSendOption = (key: string) => {
  handleSend(key);
};

const handleSend = async (scope: string = 'component') => {
  const text = inputText.value.trim();
  const attachments = [...currentAttachments.value];

  if (!text && attachments.length === 0) return;

  const providerConfig = providers.value.find(p => p.id === currentProviderId.value);
  if (!providerConfig || !providerConfig.url || !providerConfig.apiKey) {
    message.error(t('chat.empty_provider'));
    return;
  }
  
  if (!selectedModel.value) {
    message.error(t('chat.empty_model'));
    return;
  }

  messages.value.push({ role: 'user', text, attachments });
  inputText.value = '';
  currentAttachments.value = [];
  scrollToBottom();

  isGenerating.value = true;
  
  // Save session immediately so user's message is persisted
  await autoSaveCurrentSession();
  
  // Create an empty AI message placeholder
  const aiMessageIndex = messages.value.length;
  messages.value.push({ role: 'ai', text: '' });
  
  // Format history
  const chatMessages: any[] = [];
  
  let systemContent = '';
  
  // Check if we have selected elements
  const slideIndex = ctx.state.runtime.currentSlideIndex || 0;
  const currentSlide = ctx.state.document.slides[slideIndex];
  const selectedIds = Array.from(ctx.state.runtime.selectedIds);
  let elementsJson = '';
  
  if (selectedIds.length > 0) {
    const selectedElementsMap: Record<string, any> = {};
    currentSlide.elements.forEach(el => {
      if (selectedIds.includes(el.id)) {
        selectedElementsMap[el.id] = el;
      }
    });
    elementsJson = JSON.stringify(selectedElementsMap);
  }
  
  systemContent = agentBasePromptRaw;

  chatMessages.push({ role: 'system', content: systemContent });

  messages.value.forEach((m, idx) => {
    // skip the newly added empty placeholder
    if (idx === aiMessageIndex) return;

    if (m.role === 'ai' && m.text && !m.text.trim()) return; 
    
    let content: any = m.text || '';
    
    if (m.attachments && m.attachments.length > 0) {
      content = [];
      if (m.text) {
        content.push({ type: 'text', text: m.text });
      }
      m.attachments.forEach((att: any) => {
        if (att.type === 'image' && att.base64) {
          content.push({ type: 'image_url', image_url: { url: att.base64 } });
        } else if (att.content) {
          content.push({ type: 'text', text: `\n[文件/链接内容: ${att.name}]\n${att.content}` });
        }
      });
      if (content.length === 1 && content[0].type === 'text') {
        content = content[0].text;
      }
    }
    
    if (m.role !== 'error' && content) {
      // If this is the last user message, append the visual requirements
      if (m.role === 'user' && idx === aiMessageIndex - 1) {
        const reqs = buildVisualRequirements(currentStyleConfig.value, scope, elementsJson);
        if (typeof content === 'string') {
          content += reqs;
        } else if (Array.isArray(content)) {
          const textItem = content.find(item => item.type === 'text');
          if (textItem) {
            textItem.text += reqs;
          } else {
            content.push({ type: 'text', text: reqs });
          }
        }
      }
      
      chatMessages.push({
        role: m.role === 'ai' ? 'assistant' : m.role,
        content
      });
    }
  });

  try {
    const chatOptions: ChatOptions = {
      apiKey: providerConfig.apiKey,
      baseUrl: providerConfig.url,
      model: selectedModel.value,
      messages: chatMessages
    };

    await api.chat(providerConfig.provider, chatOptions, (chunk) => {
      messages.value[aiMessageIndex].text += chunk;
      scrollToBottom();
    });

    // Auto save session after complete
    await autoSaveCurrentSession();
    
    // Auto apply generated data
    const aiText = messages.value[aiMessageIndex].text;
    const parts = parseMessageParts(aiText);
    const dataPart = parts.find(p => p.type === 'data');
    if (dataPart && dataPart.content) {
       message.info('正在自动应用生成的组件到画布...', { duration: 3000 });
       // Add a slight delay for better UX
       setTimeout(() => {
         applyCode(dataPart.content);
       }, 500);
    }
  } catch (error: any) {
    messages.value[aiMessageIndex].text = `[Error]: ${error.message}`;
    messages.value[aiMessageIndex].role = 'error';
    message.error(t('chat.req_fail') + error.message);
  } finally {
    isGenerating.value = false;
  }
};
</script>

<style scoped>
.chat-tab {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-history {
  flex: 1;
  overflow: hidden;
  background: var(--ai-panel-bg);
}

:global(.dark) .chat-history {
  /* background: #222; handled by vars */
}

.messages {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message-wrapper {
  display: flex;
  justify-content: flex-start;
}

.message-wrapper.is-user {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 85%;
  padding: 12px 16px;
  border-radius: 14px;
  border-bottom-left-radius: 4px;
  background: var(--ai-bg);
  border: 1px solid var(--ai-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  font-size: 14px;
  line-height: 1.6;
  color: var(--ai-text);
  word-break: break-word;
  white-space: pre-wrap;
}

.message-wrapper.is-user .message-bubble {
  background: #6366f1;
  color: white;
  border: none;
  border-bottom-left-radius: 14px;
  border-bottom-right-radius: 4px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

:global(.dark) .message-bubble {
  background: #333;
  border-color: #444;
  color: #e0e0e0;
}

:global(.dark) .message-wrapper.is-user .message-bubble {
  background: #4f46e5;
}

/* Code Block (Think & Data) */
.code-block {
  margin: 10px 0;
  border-radius: 8px;
  background: #1e1e1e;
  overflow: hidden;
  border: 1px solid #333;
}

:global(.dark) .code-block {
  background: #000;
  border-color: #222;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  background: var(--ai-code-bg);
  color: #a3a3a3;
  font-size: 12px;
  border-bottom: 1px solid #444;
}

:global(.dark) .code-header {
  background: #111;
  border-bottom-color: var(--ai-text);
}

.code-lang {
  text-transform: uppercase;
}

.code-actions {
  display: flex;
  gap: 6px;
}

.code-btn {
  background: transparent;
  border: 1px solid #555;
  color: #d4d4d4;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.code-btn:hover {
  background: #444;
  color: #fff;
}

.code-btn.primary {
  background: #4f46e5;
  border-color: #4f46e5;
  color: #fff;
}

.code-btn.primary:hover {
  background: #6366f1;
}

.code-pre-wrap {
  max-height: 250px;
  overflow-y: auto;
  overflow-x: auto;
  padding: 12px;
}

.code-pre-wrap pre {
  margin: 0;
  color: #d4d4d4;
  font-family: 'Fira Code', 'Courier New', Courier, monospace;
  font-size: 13px;
  line-height: 1.5;
}

.attachments {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.attachment-item {
  max-width: 100%;
}

:deep(.img-preview) {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  border: 1px solid var(--ai-border);
  cursor: zoom-in;
}

.file-preview {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f3f4f6;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 13px;
  color: #4b5563;
  transition: background 0.2s;
}

.file-preview:hover {
  background: #e5e7eb;
}

.message-wrapper.is-user .file-preview {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.message-wrapper.is-user .file-preview:hover {
  background: rgba(255, 255, 255, 0.25);
}

.input-area {
  padding: 16px;
  background: var(--ai-bg);
  border-top: 1px solid var(--ai-border);
}

:global(.dark) .input-area {
  background: #2a2a2a;
  border-top-color: #444;
}

.input-box {
  position: relative;
  border: 1px solid #d9d9d9;
  border-radius: 12px;
  background: var(--ai-bg);
  transition: border-color 0.2s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}

.input-box:focus-within {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
}

.input-box.is-dragging {
  border-color: #6366f1;
  border-style: dashed;
  background: rgba(99, 102, 241, 0.05);
}

.drag-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  backdrop-filter: blur(2px);
  pointer-events: none;
  /* Prevents flicker */
}

.drag-text {
  color: #6366f1;
  font-weight: bold;
  font-size: 14px;
}

:global(.dark) .input-box {
  background: #333;
  border-color: #444;
}

:global(.dark) .input-box.is-dragging {
  background: rgba(99, 102, 241, 0.15);
}

:global(.dark) .drag-overlay {
  background: rgba(0, 0, 0, 0.6);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  border-bottom: 1px solid #f0f0f0;
}

:global(.dark) .toolbar {
  border-bottom-color: #444;
}

.tools-left {
  display: flex;
  align-items: center;
  gap: 2px;
}

.tools-right {
  display: flex;
  gap: 2px;
}

.divider {
  width: 1px;
  height: 16px;
  background: #e5e5e5;
  margin: 0 6px;
}

:global(.dark) .divider {
  background: #444;
}

.tool-btn {
  background: transparent;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ai-text-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.tool-btn.text-btn {
  width: auto;
  padding: 0 8px;
  font-size: 12px;
  max-width: 100px;
}

.tool-btn.text-btn.active {
  color: #6366f1;
}

.truncate-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tool-btn:hover {
  background: var(--ai-message-bg);
  color: var(--ai-text);
}

:global(.dark) .tool-btn {
  color: #aaa;
}

:global(.dark) .tool-btn:hover {
  background: #444;
  color: #ddd;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  padding: 10px 12px;
  gap: 12px;
}

.chat-input {
  flex: 1;
  border: none;
  outline: none;
  resize: none;
  background: transparent;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  color: var(--ai-text);
  max-height: 120px;
}

:global(.dark) .chat-input {
  color: #e0e0e0;
}

.send-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: #6366f1;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  background: #4f46e5;
  transform: translateY(-1px);
}

.send-btn:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}

:global(.dark) .send-btn:disabled {
  background: #444;
  color: var(--ai-text-muted);
}

.current-attachments {
  display: flex;
  gap: 8px;
  padding-bottom: 12px;
  overflow-x: auto;
}

.att-chip {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: #f3f4f6;
  border-radius: 8px;
  font-size: 12px;
  border: 1px solid #e5e7eb;
}

.att-chip img {
  height: 24px;
  border-radius: 4px;
}

.close-btn {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ff4d4f;
  color: white;
  border: none;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* Modal Button */
.custom-btn {
  height: 34px;
  padding: 0 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid #d9d9d9;
  background: white;
  color: var(--ai-text);
}

.custom-btn:hover {
  border-color: #6366f1;
  color: #6366f1;
}

.custom-btn.primary {
  background: #6366f1;
  border-color: #6366f1;
  color: white;
}

.custom-btn.primary:hover {
  background: #4f46e5;
  border-color: #4f46e5;
}

/* Spinner */
.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

/* Scrollbars */
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

:global(.dark) .custom-scroll::-webkit-scrollbar-thumb {
  background: #555;
}

.think-content {
  max-height: 250px;
  overflow-y: auto;
  font-size: 13px;
  color: var(--ai-text-muted);
  font-style: italic;
  border-left: 3px solid #ddd;
  padding: 4px 0 4px 12px;
  margin: 8px 0;
  background: #fafafa;
  border-radius: 0 4px 4px 0;
  white-space: pre-wrap;
}

:global(.dark) .think-content {
  color: var(--ai-text-muted);
  border-left-color: #555;
  background: #2a2a2a;
}

</style>
