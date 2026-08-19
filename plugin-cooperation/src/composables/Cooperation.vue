<template>
  <div class="cooperation-plugin-overlay">
    <!-- Remote Selections Layer -->
    <div v-if="isConnected" class="pointer-events-none absolute inset-0 overflow-hidden z-[90]">
      <div v-for="(sel, i) in remoteSelections" :key="i" :style="sel.style">
        <!-- Selection name badge -->
        <div
          class="absolute -top-[20px] left-[-2px] px-1.5 py-0 bg-[#ff4d4f] text-white text-[10px] font-medium rounded shadow-sm whitespace-nowrap flex items-center gap-1"
        >
          <img v-if="sel.avatar" :src="sel.avatar" class="w-3 h-3 rounded-full object-cover" />
          {{ sel.name || sel.clientId.substring(0, 8) }}
        </div>
      </div>
    </div>

    <!-- Cursors Overlay Layer -->
    <div v-if="isConnected" class="pointer-events-none absolute inset-0 overflow-hidden z-[100]">
      <div
        v-for="(user, id) in remoteUsers"
        :key="id"
        v-show="user.x !== undefined && user.y !== undefined"
        class="absolute transition-all duration-150 ease-out flex flex-col items-start"
        :style="{
          transform: `translate(${(user.x || 0) * scale + offsetX}px, ${(user.y || 0) * scale + offsetY}px)`,
        }"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style="filter: drop-shadow(1px 2px 3px rgba(0, 0, 0, 0.2)); transform: rotate(-15deg)"
        >
          <path
            d="M4 2L20 12L12 14L9 22L4 2Z"
            fill="#ff4d4f"
            stroke="white"
            stroke-width="2"
            stroke-linejoin="round"
          />
        </svg>
        <div
          class="mt-1 ml-4 px-2 py-0.5 bg-[#ff4d4f] text-white text-[11px] font-medium rounded-full shadow-md whitespace-nowrap flex items-center gap-1"
        >
          <img v-if="user.avatar" :src="user.avatar" class="w-4 h-4 rounded-full object-cover" />
          {{ user.name || user.clientId.substring(0, 8) }}
        </div>
      </div>
    </div>

    <!-- Main toggle button in the top right -->
    <button
      class="cooperation-toggle"
      :class="{ dark: isDark }"
      :title="isConnected ? t('cooperationConnected') : t('cooperationInvite')"
      @click="toggleWindow"
    >
      <svg
        v-if="isConnected"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#10b981"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="18" cy="5" r="3"></circle>
        <circle cx="6" cy="12" r="3"></circle>
        <circle cx="18" cy="19" r="3"></circle>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
      </svg>
      <svg
        v-else
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="18" cy="5" r="3"></circle>
        <circle cx="6" cy="12" r="3"></circle>
        <circle cx="18" cy="19" r="3"></circle>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
      </svg>
    </button>

    <!-- The popup window (Unconnected State) -->
    <div v-if="showWindow && !isConnected" class="cooperation-window" :class="themeClass">
      <n-button
        text
        class="absolute top-4 right-4 transition z-10"
        :class="isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'"
        @click="showWindow = false"
      >
        <n-icon size="20">
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
        </n-icon>
      </n-button>

      <div class="p-8 text-center pt-10">
        <h3 class="text-xl font-bold text-[#6965db] mb-2">{{ t('cooperationTitle') }}</h3>
        <p class="text-sm mb-4" :class="isDark ? 'text-gray-300' : 'text-gray-700'">
          {{ t('inviteDescription') }}
        </p>
        <p
          class="text-[13px] mb-8 px-2 leading-relaxed"
          :class="isDark ? 'text-gray-400' : 'text-gray-500'"
        >
          {{ t('privacyNotice') }}
        </p>

        <n-button type="primary" color="#6965db" block size="large" @click="handleStartSession">
          <template #icon>
            <n-icon
              ><svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polygon points="5 3 19 12 5 21 5 3"></polygon></svg
            ></n-icon>
          </template>
          <span class="font-medium">{{ t('startSession') }}</span>
        </n-button>
      </div>
    </div>

    <!-- Connected State Modal -->
    <n-modal
      v-model:show="showSessionModal"
      preset="card"
      class="w-[720px] max-w-[95vw] overflow-y-auto max-h-[90vh]"
      :title="t('modalTitle')"
      :theme-overrides="isDark ? { color: '#1e1e1e', textColor: '#fff' } : undefined"
    >
      <div class="flex flex-col md:flex-row gap-6 p-2">
        <!-- Left: Edit Link -->
        <div class="flex-1 space-y-4">
          <h3 class="font-bold text-lg m-0" :class="isDark ? 'text-gray-200' : 'text-gray-800'">
            {{ t('editSessionTitle') }}
          </h3>
          <p class="text-sm m-0 min-h-[40px]" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
            {{ t('editSessionDesc') }}
          </p>

          <div
            class="flex justify-center p-6 rounded-xl border"
            :class="isDark ? 'bg-[#2a2a2a] border-[#333]' : 'bg-[#f8f9fa] border-gray-100'"
          >
            <n-qr-code
              :value="editUrl"
              :size="180"
              color="#6965db"
              :background="isDark ? '#2a2a2a' : '#f8f9fa'"
            />
          </div>

          <div>
            <label
              class="block text-xs font-bold mb-1"
              :class="isDark ? 'text-gray-400' : 'text-gray-500'"
              >{{ t('sessionLink') }}</label
            >
            <n-input-group>
              <n-input
                :value="editUrl"
                readonly
                size="large"
                :style="isDark ? 'background: #2a2a2a; color: #fff' : 'background: #f8f9fa'"
                :bordered="false"
              />
              <n-button type="primary" color="#6965db" size="large" @click="copyUrl(editUrl)">
                <template #icon>
                  <n-icon
                    ><svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg
                  ></n-icon>
                </template>
                {{ t('copyBtn') }}
              </n-button>
            </n-input-group>
          </div>
        </div>

        <n-divider vertical class="hidden md:block h-auto mx-0" />

        <!-- Right: View Link -->
        <div class="flex-1 space-y-4">
          <h3 class="font-bold text-lg m-0" :class="isDark ? 'text-gray-200' : 'text-gray-800'">
            {{ t('viewSessionTitle') }}
          </h3>
          <p class="text-sm m-0 min-h-[40px]" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
            {{ t('viewSessionDesc') }}
          </p>

          <div
            class="flex justify-center p-6 rounded-xl border"
            :class="isDark ? 'bg-[#2a2a2a] border-[#333]' : 'bg-[#f8f9fa] border-gray-100'"
          >
            <n-qr-code
              :value="viewUrl"
              :size="180"
              color="#475569"
              :background="isDark ? '#2a2a2a' : '#f8f9fa'"
            />
          </div>

          <div>
            <label
              class="block text-xs font-bold mb-1"
              :class="isDark ? 'text-gray-400' : 'text-gray-500'"
              >{{ t('shareLink') }}</label
            >
            <n-input-group>
              <n-input
                :value="viewUrl"
                readonly
                size="large"
                :style="isDark ? 'background: #2a2a2a; color: #fff' : 'background: #f8f9fa'"
                :bordered="false"
              />
              <n-button type="primary" color="#475569" size="large" @click="copyUrl(viewUrl)">
                <template #icon>
                  <n-icon
                    ><svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg
                  ></n-icon>
                </template>
                {{ t('copyBtn') }}
              </n-button>
            </n-input-group>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between items-center w-full pt-2">
          <div
            class="text-sm flex items-center gap-1"
            :class="isDark ? 'text-gray-400' : 'text-gray-500'"
          >
            {{ t('encryptionNotice') }}
          </div>
          <n-button
            :color="isDark ? '#4a1d1d' : '#fef2f2'"
            :text-color="isDark ? '#fc8181' : '#ef4444'"
            class="border-red-200"
            @click="disconnectAndClose"
          >
            {{ t('stopSession') }}
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  NButton,
  NIcon,
  NDivider,
  NInput,
  NInputGroup,
  NModal,
  NQrCode,
  createDiscreteApi,
} from 'naive-ui';
import { ablySync, pluginCtx } from '../store';
import { useI18n } from './useI18n';

const { message } = createDiscreteApi(['message']);
const { t } = useI18n();

const isDark = computed(() => pluginCtx?.state.editor.theme === 'dark');
const themeClass = computed(() => (isDark.value ? 'theme-dark' : 'theme-light'));

const scale = computed(() => pluginCtx?.state.runtime.scale || 1);
const offsetX = computed(() => pluginCtx?.state.runtime.offsetX || 0);
const offsetY = computed(() => pluginCtx?.state.runtime.offsetY || 0);

const remoteUsers = computed(() => ablySync?.remoteUsers.value || {});

const remoteSelections = computed(() => {
  const result: { clientId: string; name?: string; avatar?: string; style: any }[] = [];
  const elements = pluginCtx?.state.runtime.activeElements || [];
  const elementsMap = new Map(elements.map((el: any) => [el.id, el]));

  for (const [id, user] of Object.entries(remoteUsers.value)) {
    if (user.selectedIds && user.selectedIds.length > 0) {
      if (user.selectedIds.length === 1) {
        const selId = user.selectedIds[0];
        const el = elementsMap.get(selId);
        if (el && el.width !== undefined && el.height !== undefined) {
          result.push({
            clientId: user.clientId,
            name: user.name,
            avatar: user.avatar,
            style: {
              left: `${el.x * scale.value + offsetX.value}px`,
              top: `${el.y * scale.value + offsetY.value}px`,
              width: `${el.width * scale.value}px`,
              height: `${el.height * scale.value}px`,
              transform: `rotate(${el.rotation || 0}deg)`,
              border: `2px solid #ff4d4f`,
              position: 'absolute',
              pointerEvents: 'none',
              boxSizing: 'border-box',
            },
          });
        }
      } else {
        // Multiple elements selected: compute union bounding box (AABB)
        let minX = Infinity,
          minY = Infinity,
          maxX = -Infinity,
          maxY = -Infinity;
        let hasValidEl = false;

        for (const selId of user.selectedIds) {
          const el = elementsMap.get(selId);
          if (el && el.width !== undefined && el.height !== undefined) {
            hasValidEl = true;
            const rotation = el.rotation || 0;
            if (rotation === 0) {
              minX = Math.min(minX, el.x);
              minY = Math.min(minY, el.y);
              maxX = Math.max(maxX, el.x + el.width);
              maxY = Math.max(maxY, el.y + el.height);
            } else {
              const rad = (rotation * Math.PI) / 180;
              const cos = Math.cos(rad);
              const sin = Math.sin(rad);
              const points = [
                { x: 0, y: 0 },
                { x: el.width, y: 0 },
                { x: el.width, y: el.height },
                { x: 0, y: el.height },
              ];
              for (const p of points) {
                // Assuming top-left pivot
                const rx = el.x + p.x * cos - p.y * sin;
                const ry = el.y + p.x * sin + p.y * cos;
                minX = Math.min(minX, rx);
                minY = Math.min(minY, ry);
                maxX = Math.max(maxX, rx);
                maxY = Math.max(maxY, ry);
              }
            }
          }
        }

        if (hasValidEl) {
          result.push({
            clientId: user.clientId,
            name: user.name,
            avatar: user.avatar,
            style: {
              left: `${minX * scale.value + offsetX.value}px`,
              top: `${minY * scale.value + offsetY.value}px`,
              width: `${(maxX - minX) * scale.value}px`,
              height: `${(maxY - minY) * scale.value}px`,
              border: `2px solid #ff4d4f`,
              position: 'absolute',
              pointerEvents: 'none',
              boxSizing: 'border-box',
            },
          });
        }
      }
    }
  }
  return result;
});

const showWindow = ref(false);
const showSessionModal = ref(false);

const localKey = ref(
  Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10)
);

const isConnected = computed(() => ablySync?.isConnected.value);
const sessionKey = computed(() => ablySync?.sessionKey.value);
const sessionChannelId = computed(() => ablySync?.sessionChannelId.value);

const editUrl = computed(() => {
  if (!isConnected.value) return '';
  const url = new URL(window.location.href);
  url.hash = `?session=${sessionChannelId.value}&key=${sessionKey.value}&role=edit`;
  return url.toString();
});

const viewUrl = computed(() => {
  if (!isConnected.value) return '';
  const url = new URL(window.location.href);
  url.hash = `?session=${sessionChannelId.value}&key=${sessionKey.value}&role=view`;
  return url.toString();
});

function toggleWindow() {
  if (isConnected.value) {
    showSessionModal.value = true;
    showWindow.value = false;
  } else {
    showWindow.value = !showWindow.value;
    showSessionModal.value = false;
  }
}

function generateChannelId() {
  return 'room_' + Math.random().toString(36).substring(2, 10);
}

function handleStartSession() {
  if (!ablySync) return;
  const channelId = generateChannelId();
  // Host always starts as 'edit' mode
  ablySync.connect(channelId, localKey.value, 'edit');

  // Close small popup and open big modal
  showWindow.value = false;
  showSessionModal.value = true;
}

function disconnectAndClose() {
  ablySync?.disconnect();
  // Generate a new random key for the next session
  localKey.value =
    Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
  showSessionModal.value = false;
}

function copyUrl(urlStr: string) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(urlStr)
      .then(() => {
        message.success(t('copySuccessMsg'));
      })
      .catch(err => {
        console.error('Copy failed', err);
        message.error(t('copyFailedMsg'));
      });
  } else {
    // Fallback for non-secure contexts (e.g. LAN HTTP)
    try {
      const textArea = document.createElement('textarea');
      textArea.value = urlStr;

      // Avoid scrolling to bottom
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.position = 'fixed';

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand('copy');
      if (successful) {
        message.success(t('copySuccessMsg'));
      } else {
        message.error(t('copyFailedMsg'));
      }
      document.body.removeChild(textArea);
    } catch (err) {
      console.error('Fallback copy failed', err);
      message.error(t('copyFailedMsg'));
    }
  }
}
</script>

<style scoped>
.cooperation-plugin-overlay {
  /* position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 99; */
}

.cooperation-toggle {
  position: absolute;
  top: 32px;
  right: 64px;
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
  z-index: 10;
}

.cooperation-toggle.dark {
  --canvas-panel-bg: #2c2c2c;
  --canvas-border-color: #444;
  --canvas-text-color: #e0e0e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.cooperation-toggle:hover {
  background: var(--canvas-btn-hover-bg, #f1f3f5);
}

.cooperation-toggle.dark:hover {
  --canvas-btn-hover-bg: #3a3a3a;
}

.cooperation-window {
  position: absolute;
  top: 16px;
  right: 160px;
  width: 360px;
  pointer-events: auto;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
}

.cooperation-window.theme-light {
  background: #ffffff;
}

.cooperation-window.theme-dark {
  background: #1e1e1e;
  border-color: #333;
}

@media (max-width: 768px) {
  .cooperation-window {
    top: 80px;
    right: 16px;
    width: calc(100vw - 96px);
    max-width: 360px;
  }
}
</style>
