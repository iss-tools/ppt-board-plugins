<template>
  <div class="plugin-remark-overlay" :class="{ 'remark-theme-dark': isDarkTheme }" v-if="showRemarks">

    <!-- Canvas Badges for Element Remarks -->
    <template v-for="badge in canvasBadges" :key="badge.elementId">
      <div class="remark-canvas-badge" :style="getBadgeStyle(badge.elementId)"
        @click.stop="handleBadgeClick(badge.elementId, badge.threadId)">
        <div class="avatar-stack">
          <AvatarIcon v-for="user in badge.users.slice(0, 3)" :key="user.userId" :src="user.userAvatar"
            :name="user.userName" :userId="user.userId" class="badge-avatar" />
          <div v-if="badge.users.length > 3" class="badge-more">+{{ badge.users.length - 3 }}</div>
        </div>
      </div>
    </template>
    <!-- Global Right Sidebar -->
    <div class="excal-sidebar" :class="{ 'remark-theme-dark': isDarkTheme }" v-if="showSidebar">
      <!-- Search Header -->
      <div class="excal-search-header">
        <div class="search-and-close">
          <div class="user-profile-trigger" @click.stop="toggleProfileMenu">
            <AvatarIcon :src="currentUser?.avatar || ''" :name="currentUser?.name || ''"
              :userId="currentUser?.userId || ''" class="trigger-avatar" />
            <!-- Profile Settings Popover -->
            <div class="profile-popover" v-if="showProfileMenu" @click.stop>
              <div class="profile-avatar-large" @click.stop="shuffleAvatar" title="Click to randomly change avatar">
                <AvatarIcon :src="currentUser?.avatar || ''" :name="currentUser?.name || ''"
                  :userId="currentUser?.userId || ''" class="large-avatar" />
                <div class="shuffle-overlay">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21L21.5 8"></path>
                  </svg>
                </div>
              </div>
              <div class="profile-actions">
                <span class="upload-link" @click="triggerUpload">{{ t('remark.uploadCustom') }}</span>
              </div>
              <input type="file" ref="fileInput" @change="handleFileUpload" accept="image/*" style="display: none;" />
              <div class="profile-name-input" style="display: flex; gap: 4px; align-items: center;">
                <input type="text" v-model="tempUserName" @blur="saveUserName" @keyup.enter="saveUserName"
                  :placeholder="t('remark.yourName')" />
                <button class="icon-btn" @click.stop="randomizeName" :title="t('remark.randomizeName')"
                  style="width: 28px; height: 28px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21L21.5 8"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div class="search-input-wrapper">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" :placeholder="t('remark.quickSearch')" v-model="searchQuery" />
            <span class="shortcut-hint">⌘3</span>
          </div>
          <button class="icon-btn close-btn" @click="closeSidebar" :title="t('remark.closePanel')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Filter/Actions Bar -->
      <div class="excal-actions-bar filter-bar">
        <span class="filter-label">{{ t('remark.filter') }}</span>
        <div class="colors-row filter-colors">
          <button class="color-btn" :class="{ active: filterColor === '#fee2e2' }" style="background-color: #fee2e2"
            :title="t('remark.urgent')" @click="toggleFilter('#fee2e2')"></button>
          <button class="color-btn" :class="{ active: filterColor === '#ffedd5' }" style="background-color: #ffedd5"
            :title="t('remark.high')" @click="toggleFilter('#ffedd5')"></button>
          <button class="color-btn" :class="{ active: filterColor === '#fef9c3' }" style="background-color: #fef9c3"
            :title="t('remark.medium')" @click="toggleFilter('#fef9c3')"></button>
          <button class="color-btn" :class="{ active: filterColor === '#dcfce7' }" style="background-color: #dcfce7"
            :title="t('remark.low')" @click="toggleFilter('#dcfce7')"></button>
          <button class="color-btn" :class="{ active: filterColor === '#dbeafe' }" style="background-color: #dbeafe"
            :title="t('remark.info')" @click="toggleFilter('#dbeafe')"></button>
          <div class="filter-divider"></div>

          <button class="style-btn" :class="{ active: filterStyles.includes('bold') }" :title="t('remark.bold')"
            @click="toggleStyleFilter('bold')"><b>B</b></button>
          <button class="style-btn" :class="{ active: filterStyles.includes('strikethrough') }"
            :title="t('remark.strikethrough')" @click="toggleStyleFilter('strikethrough')"><s>S</s></button>
        </div>
        <div class="filter-actions-right" style="display: flex; gap: 8px; margin-left: auto; align-items: center;">
          <button class="text-btn clear-filter-btn" v-if="filterColor || filterStyles.length > 0"
            @click="clearFilters">{{
              t('remark.clear') }}</button>

          <div class="sort-dropdown-container">
            <button class="icon-btn" @click.stop="toggleViewMenu" :title="t('remark.viewOptions')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            <div class="sort-dropdown" v-if="showViewMenu" @click.stop>
              <div class="dropdown-item" @click="setViewMode('time-desc')">
                <span class="icon">↓</span> {{ t('remark.newestFirst') }}
                <svg v-if="viewMode === 'time-desc'" class="check" width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div class="dropdown-item" @click="setViewMode('time-asc')">
                <span class="icon">↑</span> {{ t('remark.oldestFirst') }}
                <svg v-if="viewMode === 'time-asc'" class="check" width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div class="dropdown-divider"></div>
              <div class="dropdown-item" @click="setViewMode('grouped')">
                <span class="icon">⊞</span> {{ t('remark.groupByComponent') }}
                <svg v-if="viewMode === 'grouped'" class="check" width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Global Canvas Remark Input -->
      <div class="global-remark-input">
        <input type="text" :placeholder="t('remark.addRemarkAs', { name: currentUser?.name || 'User' })"
          v-model="globalRemarkText" @keyup.enter="handleGlobalReply" />
        <button v-if="globalRemarkText.trim()" @click="handleGlobalReply">{{ t('remark.post') }}</button>
      </div>

      <!-- Threads List -->
      <div class="excal-threads-list" @click="showViewMenu = false">
        <div v-if="displayList.length === 0" class="empty-state">
          {{ t('remark.noRemarks') }}
        </div>

        <template v-for="row in displayList" :key="row.type === 'header' ? row.id : row.item.thread.id">
          <div v-if="row.type === 'header'" class="group-header">
            {{ row.title }}
          </div>
          <template v-else v-for="item in [row.item]" :key="item.thread.id">
            <div class="excal-thread-card"
              :class="{ unread: !readThreadIds.has(item.thread.id), expanded: expandedThreadId === item.thread.id }"
              @click="selectAndOpenThread(item.element.id, item.thread.id)">
              <!-- Initiator Comment -->
              <div class="initiator-header">
                <AvatarIcon :src="item.initiator.userAvatar" :name="item.initiator.userName"
                  :userId="item.initiator.userId" class="initiator-avatar" />
                <div class="initiator-meta">
                  <strong>{{ item.initiator.userName }}</strong>
                  <span class="badge" v-if="item.element.id === '__canvas_global__'">Canvas</span>
                  <span class="badge component-badge" v-else>{{ item.element.type }}</span>
                  <div class="meta-right">
                    <span class="time" :title="formatAbsoluteTime(item.initiator.timestamp)">{{
                      formatRelativeTime(item.initiator.timestamp) }}</span>
                    <div class="more-actions-wrapper" @click.stop="toggleMoreMenu(item.initiator.id)">
                      <button class="more-btn" :title="t('remark.moreOptions')">⋮</button>
                      <div class="more-actions-menu" v-show="activeMenuId === item.initiator.id" @click.stop>
                        <div class="colors-row">
                          <button class="color-btn" style="background-color: #fee2e2" :title="t('remark.urgent')"
                            @click.stop="handleUpdateStyle(item.element.id, item.thread.id, item.initiator.id, { color: '#fee2e2' })"></button>
                          <button class="color-btn" style="background-color: #ffedd5" :title="t('remark.high')"
                            @click.stop="handleUpdateStyle(item.element.id, item.thread.id, item.initiator.id, { color: '#ffedd5' })"></button>
                          <button class="color-btn" style="background-color: #fef9c3" :title="t('remark.medium')"
                            @click.stop="handleUpdateStyle(item.element.id, item.thread.id, item.initiator.id, { color: '#fef9c3' })"></button>
                          <button class="color-btn" style="background-color: #dcfce7" :title="t('remark.low')"
                            @click.stop="handleUpdateStyle(item.element.id, item.thread.id, item.initiator.id, { color: '#dcfce7' })"></button>
                          <button class="color-btn" style="background-color: #dbeafe" :title="t('remark.info')"
                            @click.stop="handleUpdateStyle(item.element.id, item.thread.id, item.initiator.id, { color: '#dbeafe' })"></button>
                          <button class="color-btn clear" :title="t('remark.clearColor')"
                            @click.stop="handleUpdateStyle(item.element.id, item.thread.id, item.initiator.id, { color: undefined })">✖</button>
                        </div>
                        <div class="styles-row">
                          <button class="style-btn" :class="{ active: (item.initiator.style || '').includes('bold') }"
                            @click.stop="handleToggleItemStyle(item.element.id, item.thread.id, item.initiator.id, item.initiator.style, 'bold')"><b>B</b></button>
                          <button class="style-btn"
                            :class="{ active: (item.initiator.style || '').includes('strikethrough') }"
                            @click.stop="handleToggleItemStyle(item.element.id, item.thread.id, item.initiator.id, item.initiator.style, 'strikethrough')"><s>S</s></button>
                          <button class="style-btn"
                            @click.stop="handleToggleItemStyle(item.element.id, item.thread.id, item.initiator.id, item.initiator.style, 'none')">{{
                              t('remark.clear') }}</button>
                        </div>
                        <button v-if="item.initiator.userId === currentUser?.userId" class="action-btn delete-text-btn"
                          @click.stop="handleDelete(item.element.id, item.thread.id, item.initiator.id)">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            style="margin-right: 4px; vertical-align: text-bottom;">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2">
                            </path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg> {{ t('remark.delete') }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="initiator-content" :class="item.initiator.style"
                :style="{ backgroundColor: item.initiator.color }">
                {{ item.initiator.content }}
              </div>

              <!-- Footer: Participants and Replies (Hide if expanded or no replies) -->
              <div class="thread-footer" v-if="expandedThreadId !== item.thread.id && item.replyCount > 0">
                <div class="participants">
                  <AvatarIcon v-for="user in item.participants.slice(0, 3)" :key="user.userId" :src="user.userAvatar"
                    :name="user.userName" :userId="user.userId" class="participant-avatar" />
                  <span v-if="item.participants.length > 3" class="more-users">
                    + {{ item.participants.length - 3 }} {{ t('remark.users') }}
                  </span>
                </div>
                <div class="replies-count" v-if="item.replyCount > 0">
                  {{ item.replyCount }} {{ t('remark.replies') }}
                </div>
              </div>

              <!-- Expanded Thread Content (Inline Replies) -->
              <div v-if="expandedThreadId === item.thread.id" class="expanded-thread-content" @click.stop>

                <div class="inline-replies-list" v-if="item.thread.comments.length > 1">
                  <div v-for="comment in item.thread.comments.slice(1)" :key="comment.id" class="inline-reply-item">
                    <AvatarIcon :src="comment.userAvatar" :name="comment.userName" :userId="comment.userId"
                      class="reply-avatar" />
                    <div class="reply-body">
                      <div class="reply-meta">
                        <strong>{{ comment.userName }}</strong>
                        <div class="meta-right">
                          <span class="time" :title="formatAbsoluteTime(comment.timestamp)">{{
                            formatRelativeTime(comment.timestamp) }}</span>
                          <div class="more-actions-wrapper" @click.stop="toggleMoreMenu(comment.id)">
                            <button class="more-btn" :title="t('remark.moreOptions')">⋮</button>
                            <div class="more-actions-menu" v-show="activeMenuId === comment.id" @click.stop>
                              <div class="colors-row">
                                <button class="color-btn" style="background-color: #fee2e2" :title="t('remark.urgent')"
                                  @click.stop="handleUpdateStyle(item.element.id, item.thread.id, comment.id, { color: '#fee2e2' })"></button>
                                <button class="color-btn" style="background-color: #ffedd5" :title="t('remark.high')"
                                  @click.stop="handleUpdateStyle(item.element.id, item.thread.id, comment.id, { color: '#ffedd5' })"></button>
                                <button class="color-btn" style="background-color: #fef9c3" :title="t('remark.medium')"
                                  @click.stop="handleUpdateStyle(item.element.id, item.thread.id, comment.id, { color: '#fef9c3' })"></button>
                                <button class="color-btn" style="background-color: #dcfce7" :title="t('remark.low')"
                                  @click.stop="handleUpdateStyle(item.element.id, item.thread.id, comment.id, { color: '#dcfce7' })"></button>
                                <button class="color-btn" style="background-color: #dbeafe" :title="t('remark.info')"
                                  @click.stop="handleUpdateStyle(item.element.id, item.thread.id, comment.id, { color: '#dbeafe' })"></button>
                                <button class="color-btn clear" :title="t('remark.clearColor')"
                                  @click.stop="handleUpdateStyle(item.element.id, item.thread.id, comment.id, { color: undefined })">✖</button>
                              </div>
                              <div class="styles-row">
                                <button class="style-btn" :class="{ active: (comment.style || '').includes('bold') }"
                                  @click.stop="handleToggleItemStyle(item.element.id, item.thread.id, comment.id, comment.style, 'bold')"><b>B</b></button>
                                <button class="style-btn"
                                  :class="{ active: (comment.style || '').includes('strikethrough') }"
                                  @click.stop="handleToggleItemStyle(item.element.id, item.thread.id, comment.id, comment.style, 'strikethrough')"><s>S</s></button>
                                <button class="style-btn"
                                  @click.stop="handleToggleItemStyle(item.element.id, item.thread.id, comment.id, comment.style, 'none')">{{
                                    t('remark.clear') }}</button>
                              </div>
                              <button v-if="comment.userId === currentUser?.userId" class="action-btn delete-text-btn"
                                @click.stop="handleDelete(item.element.id, item.thread.id, comment.id)">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                  style="margin-right: 4px; vertical-align: text-bottom;">
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path
                                    d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2">
                                  </path>
                                  <line x1="10" y1="11" x2="10" y2="17"></line>
                                  <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg> {{ t('remark.delete') }}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="reply-text" :class="comment.style" :style="{ backgroundColor: comment.color }">{{
                        comment.content }}</div>
                    </div>
                  </div>
                </div>

                <!-- Reply Input -->
                <div class="inline-reply-box">
                  <input :value="replyTexts[item.thread.id] || ''"
                    @input="e => replyTexts[item.thread.id] = (e.target as HTMLInputElement).value"
                    :placeholder="t('remark.typeReply')"
                    @keyup.enter="handleInlineReply(item.element, item.thread.id)" />
                  <button @click.stop="handleInlineReply(item.element, item.thread.id)">{{ t('remark.reply') }}</button>
                </div>
              </div>
            </div>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useCanvasContext, CanvasElementData } from '@iss-ai/ppt-board';
import { useRemarkStore, Comment, RemarkThread } from '../store/useRemarkStore';
import { useRemarkUser } from '../composables/useRemarkUser';
import { useI18n } from '../composables/useI18n';
import AvatarIcon from './AvatarIcon.vue';

const ctx = useCanvasContext();
const { state } = ctx;
const remarkStore = useRemarkStore(ctx as any);
const {
  showRemarks, getElementRemarks, getAllRemarks, addReply, addRemarkThread, deleteComment, updateComment,
  readThreadIds, markAsRead, markAllAsRead
} = remarkStore;
const { currentUser, updateUser, generateRandomName } = useRemarkUser();
const { t } = useI18n();
const isDarkTheme = computed(() => ctx.state?.editor?.theme === 'dark');

const forceClosedSidebar = ref(false);
const expandedThreadId = ref<string | null>(null);
const replyTexts = ref<Record<string, string>>({});
const globalRemarkText = ref('');

// Sidebar State
const searchQuery = ref('');
const showSortDropdown = ref(false);
const activeMenuId = ref<string | null>(null);
const filterColor = ref<string | null>(null);
const filterStyles = ref<string[]>([]);
const showResolved = ref(false);

const showProfileMenu = ref(false);
const tempUserName = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value;
  if (showProfileMenu.value && currentUser.value) {
    tempUserName.value = currentUser.value.name;
    activeMenuId.value = null; // hide other menus
    showViewMenu.value = false;
  }
};

const viewMode = ref<'time-desc' | 'time-asc' | 'grouped'>('time-desc');
const showViewMenu = ref(false);

const toggleViewMenu = () => {
  showViewMenu.value = !showViewMenu.value;
  activeMenuId.value = null;
  showProfileMenu.value = false;
};

const setViewMode = (mode: 'time-desc' | 'time-asc' | 'grouped') => {
  viewMode.value = mode;
  showViewMenu.value = false;
};

const shuffleAvatar = () => {
  const randomId = Math.floor(Math.random() * 50) + 1;
  const newAvatar = `/avatar/scenery_${randomId}.jpg`;
  updateUser({ avatar: newAvatar });
};

const triggerUpload = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 200;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        } else if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          updateUser({ avatar: compressedDataUrl });
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }
  if (target) {
    target.value = '';
  }
};

const saveUserName = () => {
  if (tempUserName.value.trim() && tempUserName.value !== currentUser.value?.name) {
    updateUser({ name: tempUserName.value.trim() });
  }
};

const randomizeName = () => {
  tempUserName.value = generateRandomName();
  saveUserName();
};

const toggleFilter = (color: string) => {
  filterColor.value = filterColor.value === color ? null : color;
};

const toggleStyleFilter = (style: string) => {
  if (filterStyles.value.includes(style)) {
    filterStyles.value = filterStyles.value.filter(s => s !== style);
  } else {
    filterStyles.value.push(style);
  }
};

const clearFilters = () => {
  filterColor.value = null;
  filterStyles.value = [];
};

const toggleMoreMenu = (id: string) => {
  activeMenuId.value = activeMenuId.value === id ? null : id;
  showProfileMenu.value = false;
};

const handleGlobalClick = () => {
  activeMenuId.value = null;
  showSortDropdown.value = false;
  showProfileMenu.value = false;
  showViewMenu.value = false;
};

onMounted(() => {
  document.addEventListener('click', handleGlobalClick);
});

onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick);
});

// Open sidebar when selection changes (if not force closed)
ctx.hooks.on('selection:change', () => {
  // Only auto-open if a real component is selected
  if (state.runtime.selectedIds.size > 0) {
    forceClosedSidebar.value = false;
  }
});

// Watch showRemarks to auto-open the panel when remarks are turned on
watch(() => showRemarks.value, (newVal) => {
  if (newVal) {
    forceClosedSidebar.value = false;
  }
});

// Removed toggleElementPanel since local popovers are gone


const showSidebar = computed(() => {
  if (!showRemarks.value) return false;
  return !forceClosedSidebar.value;
});

const closeSidebar = () => {
  forceClosedSidebar.value = true;
};

// We no longer need activeElementsWithRemarks for canvas indicators


// Unified Flat List of Threads
const allCanvasThreads = computed(() => {
  const list: Array<{ element: CanvasElementData, thread: RemarkThread, initiator: Comment, participants: any[], replyCount: number }> = [];
  const all = getAllRemarks();

  Object.entries(all).forEach(([targetId, threads]) => {
    let element: CanvasElementData;
    if (targetId === '__canvas_global__') {
      element = { id: '__canvas_global__', type: 'canvas' } as CanvasElementData;
    } else {
      const ids = targetId.split(',');
      if (ids.length > 1) {
        element = { id: targetId, type: `Multiple (${ids.length})` } as CanvasElementData;
      } else {
        const found = state.runtime.activeElements.find(e => e.id === targetId);
        element = found ? { id: targetId, type: found.type } as CanvasElementData : { id: targetId, type: 'Element' } as CanvasElementData;
      }
    }

    threads.forEach(thread => {
      if (thread.comments.length === 0) return;
      if (!showResolved.value && thread.resolved) return;

      const initiator = thread.comments[0];
      const replyCount = thread.comments.length - 1;

      const seen = new Set();
      const participants = thread.comments.filter(c => {
        if (seen.has(c.userId)) return false;
        seen.add(c.userId);
        return true;
      });

      list.push({ element, thread, initiator, participants, replyCount });
    });
  });

  return list;
});

// Filtered and Sorted Threads
const filteredThreads = computed(() => {
  let list = allCanvasThreads.value;

  if (state.runtime.selectedIds.size > 0) {
    const selectedArray = Array.from(state.runtime.selectedIds);
    list = list.filter(item => {
      if (item.element.id === '__canvas_global__') return true;
      const ids = item.element.id.split(',');
      return ids.some(id => selectedArray.includes(id));
    });
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(item => {
      return item.thread.comments.some(c =>
        c.content.toLowerCase().includes(q) ||
        c.userName.toLowerCase().includes(q)
      );
    });
  }

  if (filterColor.value) {
    list = list.filter(item => {
      return item.thread.comments.some(c => c.color === filterColor.value);
    });
  }

  if (filterStyles.value.length > 0) {
    list = list.filter(item => {
      return item.thread.comments.some(c => {
        const cStyles = (c.style || '').split(' ');
        return filterStyles.value.every(s => cStyles.includes(s));
      });
    });
  }

  return list;
});

const displayList = computed(() => {
  const list = [...filteredThreads.value];

  if (viewMode.value === 'time-desc' || viewMode.value === 'time-asc') {
    list.sort((a, b) => {
      const aIsCanvas = a.element.id === '__canvas_global__';
      const bIsCanvas = b.element.id === '__canvas_global__';
      if (aIsCanvas && !bIsCanvas) return -1;
      if (!aIsCanvas && bIsCanvas) return 1;

      return viewMode.value === 'time-desc'
        ? b.initiator.timestamp - a.initiator.timestamp
        : a.initiator.timestamp - b.initiator.timestamp;
    });

    return list.map(item => ({ type: 'thread', item, id: '' }));
  } else if (viewMode.value === 'grouped') {
    const groups: Record<string, typeof list> = {};
    list.forEach(item => {
      const id = item.element.id;
      if (!groups[id]) groups[id] = [];
      groups[id].push(item);
    });

    const result: any[] = [];

    const keys = Object.keys(groups).sort((a, b) => {
      if (a === '__canvas_global__') return -1;
      if (b === '__canvas_global__') return 1;
      return a.localeCompare(b);
    });

    keys.forEach(key => {
      const title = key === '__canvas_global__' ? t('remark.canvasRemarks') : `${t('remark.element')}: ${key.substring(0, 8)}`;
      result.push({ type: 'header', id: `header_${key}`, title, item: null });
      groups[key].sort((a, b) => b.initiator.timestamp - a.initiator.timestamp);
      groups[key].forEach(item => {
        result.push({ type: 'thread', item, id: '' });
      });
    });

    return result;
  }
  return [];
});

const selectAndOpenThread = (elementId: string, threadId: string) => {
  markAsRead(threadId);
  if (elementId !== '__canvas_global__') {
    const ids = elementId.split(',');
    ctx.selection?.setSelection(ids);
  }

  if (expandedThreadId.value === threadId) {
    expandedThreadId.value = null; // Toggle collapse
  } else {
    expandedThreadId.value = threadId; // Expand
  }
  forceClosedSidebar.value = false;
};

const remarkPlaceholder = computed(() => {
  if (state.runtime.selectedIds.size > 0) {
    return "Add a component remark...";
  }
  return "Add a canvas remark...";
});

const handleInlineReply = (element: CanvasElementData, threadId: string) => {
  const text = replyTexts.value[threadId];
  if (!text || !text.trim() || !currentUser.value) return;

  const comment: Comment = {
    id: `comment_${Date.now()}`,
    userId: currentUser.value.userId,
    userName: currentUser.value.name,
    userAvatar: currentUser.value.avatar,
    content: text.trim(),
    timestamp: Date.now()
  };

  addReply(element.id, element, threadId, comment);
  markAsRead(threadId);

  replyTexts.value[threadId] = '';
};

const handleGlobalReply = () => {
  if (!globalRemarkText.value.trim() || !currentUser.value) return;

  const comment: Comment = {
    id: `comment_${Date.now()}`,
    userId: currentUser.value.userId,
    userName: currentUser.value.name,
    userAvatar: currentUser.value.avatar,
    content: globalRemarkText.value.trim(),
    timestamp: Date.now()
  };

  const selectedIds = Array.from(state.runtime.selectedIds);
  if (selectedIds.length > 0) {
    // Add remark to the selected components
    const targetId = selectedIds.join(',');
    const typeStr = selectedIds.length > 1 ? `Multiple (${selectedIds.length})` : state.runtime.activeElements.find(e => e.id === selectedIds[0])?.type || 'Element';
    const element = { id: targetId, type: typeStr } as CanvasElementData;
    addRemarkThread(targetId, element, comment);
  } else {
    // Add to global canvas
    const element = { id: '__canvas_global__', type: 'canvas' } as CanvasElementData;
    addRemarkThread(element.id, element, comment);
  }

  globalRemarkText.value = '';
};

const handleDelete = (targetId: string, threadId: string, commentId: string) => {
  deleteComment(targetId, threadId, commentId);
  activeMenuId.value = null;
};

const handleUpdateStyle = (targetId: string, threadId: string, commentId: string, partial: Partial<Comment>) => {
  updateComment(targetId, threadId, commentId, partial);
  activeMenuId.value = null;
};

const handleToggleItemStyle = (targetId: string, threadId: string, commentId: string, currentStyle: string | undefined, toggleStyleName: string) => {
  if (toggleStyleName === 'none') {
    handleUpdateStyle(targetId, threadId, commentId, { style: 'none' });
    return;
  }
  let styles = (currentStyle || '').split(' ').filter(s => s && s !== 'none');
  if (styles.includes(toggleStyleName)) {
    styles = styles.filter(s => s !== toggleStyleName);
  } else {
    styles.push(toggleStyleName);
  }
  handleUpdateStyle(targetId, threadId, commentId, { style: styles.join(' ') as any });
};

// Canvas Badges logic
const canvasBadges = computed(() => {
  const groups = new Map<string, { elementId: string, threadId: string, users: any[] }>();

  for (const t of allCanvasThreads.value) {
    if (t.element.id === '__canvas_global__') continue;

    const targetIds = t.element.id.split(',');
    targetIds.forEach(id => {
      if (!groups.has(id)) {
        groups.set(id, {
          elementId: id,
          threadId: t.thread.id,
          users: []
        });
      }

      const group = groups.get(id)!;
      t.thread.comments.forEach(c => {
        if (!group.users.find(u => u.userId === c.userId)) {
          group.users.push({ userId: c.userId, userName: c.userName, userAvatar: c.userAvatar });
        }
      });
    });
  }

  return Array.from(groups.values());
});

const getBadgeStyle = (elementId: string): Record<string, any> => {
  const el = state.runtime.activeElements.find((e: CanvasElementData) => e.id === elementId);
  if (!el) return { display: 'none' };

  const scale = state.runtime.scale;
  const x = el.x * scale + state.runtime.offsetX;
  const y = el.y * scale + state.runtime.offsetY;
  const w = (el.width || 0) * scale;

  return {
    position: 'absolute',
    left: `${x + w - 12}px`,
    top: `${y - 12}px`,
    zIndex: 100,
    pointerEvents: 'auto'
  };
};

const handleBadgeClick = (elementId: string, threadId: string) => {
  if (forceClosedSidebar.value) {
    forceClosedSidebar.value = false;
  }
  selectAndOpenThread(elementId, threadId);
};

// Utilities
const formatAbsoluteTime = (ts: number) => {
  return new Date(ts).toLocaleString();
};

const formatRelativeTime = (ts: number) => {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'a moment ago';
  if (mins < 60) return `${mins} mins ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hours ago`;
  const days = Math.floor(hrs / 24);
  return `${days} days ago`;
};
</script>

<style scoped>
.plugin-remark-overlay {
  --remark-bg: #fff;
  --remark-text: #374151;
  --remark-text-secondary: #4b5563;
  --remark-text-muted: #9ca3af;
  --remark-border: #e5e7eb;
  --remark-border-light: #f3f4f6;
  --remark-hover: #f3f4f6;
  --remark-bg-secondary: #f9fafb;
  --remark-shadow: rgba(0, 0, 0, 0.08);
  --remark-popover-shadow: rgba(0, 0, 0, 0.1);
  --remark-input-bg: #f3f4f6;
  --remark-overlay: rgba(255, 255, 255, 0.8);
  --remark-unread-bg: #faf5ff;
  --remark-unread-hover: #f3ebff;
  --remark-badge-bg: #e0e7ff;
  --remark-badge-text: #4338ca;
  --remark-input-bg: #f3f4f6;
  --remark-time: #6b7280;

}

.plugin-remark-overlay.remark-theme-dark {
  --remark-bg: #1e1e1e;
  --remark-text: #e5e5e5;
  --remark-text-secondary: #a3a3a3;
  --remark-text-muted: #737373;
  --remark-border: #3f3f46;
  --remark-border-light: #27272a;
  --remark-hover: #27272a;
  --remark-bg-secondary: #18181b;
  --remark-shadow: rgba(0, 0, 0, 0.5);
  --remark-popover-shadow: rgba(0, 0, 0, 0.4);
  --remark-input-bg: #27272a;
  --remark-overlay: rgba(0, 0, 0, 0.6);
  --remark-unread-bg: #2d2438;
  --remark-unread-hover: #3b2c4d;
  --remark-badge-bg: #1e1b4b;
  --remark-badge-text: #818cf8;
  --remark-input-bg: #27272a;
  --remark-time: #9ca3af;

}

.plugin-remark-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1000;
}

.remark-canvas-badge {
  pointer-events: auto;
}

.remark-canvas-badge .avatar-stack {
  display: flex;
  flex-direction: row-reverse;
  cursor: pointer;
}

.remark-canvas-badge .badge-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--remark-bg);
  margin-right: -16px;
  background-color: var(--remark-bg);
  box-shadow: 0 2px 4px var(--remark-shadow);
  transition: transform 0.2s;
}

.remark-canvas-badge .badge-avatar:hover {
  transform: translateY(-2px);
  z-index: 10;
}

.remark-canvas-badge .badge-more {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--remark-bg);
  background: var(--remark-hover);
  color: var(--remark-text-secondary);
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: -16px;
  box-shadow: 0 2px 4px var(--remark-shadow);
  z-index: 0;
}

/* Excalidraw-like Global Sidebar */
.excal-sidebar {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 320px;
  background: var(--remark-bg);
  box-shadow: -4px 0 24px var(--remark-shadow);
  border-left: 1px solid var(--remark-border);
  display: flex;
  flex-direction: column;
  pointer-events: auto;
  z-index: 1001;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.excal-search-header {
  padding: 12px 16px 8px 16px;
}

.search-and-close {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background: var(--remark-hover);
  border-radius: 8px;
  padding: 6px 10px;
  flex: 1;
}

.close-btn {
  color: var(--remark-text-muted);
}

.close-btn:hover {
  color: #ef4444;
  background: #fee2e2;
}

.search-icon {
  width: 16px;
  height: 16px;
  color: var(--remark-text-muted);
  margin-right: 8px;
}

.search-input-wrapper input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  color: var(--remark-text);
}

.shortcut-hint {
  font-size: 12px;
  color: var(--remark-text-muted);
  background: var(--remark-border);
  padding: 2px 6px;
  border-radius: 4px;
}

.excal-actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid var(--remark-border-light);
}

.sort-dropdown-container {
  position: relative;
}

.icon-btn {
  background: transparent;
  border: none;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--remark-text-secondary);
  transition: background 0.2s;
}

.icon-btn:hover {
  background: var(--remark-border);
}

.icon-btn svg {
  width: 16px;
  height: 16px;
}

.sort-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: var(--remark-bg);
  border: 1px solid var(--remark-border);
  border-radius: 8px;
  box-shadow: 0 10px 25px -5px var(--remark-popover-shadow), 0 8px 10px -6px var(--remark-popover-shadow);
  width: 240px;
  z-index: 10;
  padding: 8px 0;
}

.dropdown-item {
  padding: 8px 16px;
  font-size: 14px;
  color: var(--remark-text);
  cursor: pointer;
  display: flex;
  align-items: center;
}

.dropdown-item:hover {
  background: var(--remark-bg-secondary);
}

.dropdown-item .icon {
  font-size: 12px;
  margin-right: 8px;
  color: var(--remark-text-muted);
}

.dropdown-item .check {
  margin-left: auto;
  color: #4f46e5;
}

.dropdown-divider {
  height: 1px;
  background: var(--remark-hover);
  margin: 4px 0;
}

.toggle-item {
  justify-content: space-between;
}

.toggle-switch {
  width: 32px;
  height: 18px;
  background: var(--remark-border);
  border-radius: 10px;
  position: relative;
  transition: background 0.2s;
}

.toggle-switch.on {
  background: #10b981;
}

.toggle-switch .knob {
  width: 14px;
  height: 14px;
  background: var(--remark-bg);
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.2s;
}

.toggle-switch.on .knob {
  transform: translateX(14px);
}

.text-btn {
  background: none;
  border: none;
  color: var(--remark-text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.text-btn:hover {
  color: var(--remark-text);
}

.text-btn .check-icon {
  margin-right: 6px;
}

.excal-threads-list {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 16px;
}

.group-header {
  padding: 12px 16px 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--remark-text-muted);
  letter-spacing: 0.5px;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: var(--remark-text-muted);
  font-size: 13px;
}

.global-remark-input {
  display: flex;
  align-items: center;
  margin: 12px 16px;
  background: var(--remark-hover);
  border-radius: 8px;
  padding: 4px 4px 4px 12px;
}

.user-profile-trigger {
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-profile-trigger .trigger-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid transparent;
  transition: border-color 0.2s;
}

.user-profile-trigger:hover .trigger-avatar {
  border-color: #6366f1;
}

.profile-popover {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  background: var(--remark-bg);
  border: 1px solid var(--remark-border);
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  padding: 16px;
  width: 200px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.profile-avatar-large {
  position: relative;
  width: 64px;
  height: 64px;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
}

.profile-avatar-large .large-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.profile-avatar-large .shuffle-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.profile-avatar-large:hover .shuffle-overlay {
  opacity: 1;
}

.profile-actions {
  font-size: 12px;
  margin-top: -8px;
}

.upload-link {
  color: #6366f1;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.2s;
}

.upload-link:hover {
  color: #4f46e5;
}

.profile-name-input {
  width: 100%;
}

.profile-name-input input {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--remark-border);
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
  outline: none;
  background: var(--remark-input-bg);
  color: var(--remark-text);
}

.profile-name-input input:focus {
  border-color: #6366f1;
  background: var(--remark-bg);
}

.global-remark-input input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid var(--remark-border);
  border-radius: 4px;
  outline: none;
  font-size: 13px;
  background: var(--remark-bg);
  color: var(--remark-text);
}

.global-remark-input input:focus {
  border-color: #6366f1;
}

.global-remark-input button {
  background: #6366f1;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
}

.excal-thread-card {
  padding: 14px 16px;
  border-bottom: 1px solid var(--remark-border);
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: background 0.1s;
}

.excal-thread-card:hover {
  background: var(--remark-bg-secondary);
}

.excal-thread-card.unread {
  border-left-color: #4f46e5;
  background: var(--remark-unread-bg);
}

.excal-thread-card.unread:hover {
  background: var(--remark-unread-hover);
}

.initiator-header {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.initiator-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px solid var(--remark-border);
  margin-right: 8px;
}

.initiator-meta {
  display: flex;
  align-items: center;
  font-size: 11px;
  color: var(--remark-text-secondary);
  margin-bottom: 4px;
  flex: 1;
}

.initiator-meta strong {
  color: var(--remark-text);
  font-weight: 600;
}

.initiator-meta .dot {
  margin: 0 4px;
  color: var(--remark-text-muted);
}

.initiator-meta .time {
  color: var(--remark-time);
  font-size: 11px;
}

.initiator-meta .meta-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

.initiator-delete {
  margin-left: auto;
}

.badge {
  background: var(--remark-badge-bg);
  color: var(--remark-badge-text);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  margin-left: 6px;
  font-weight: 600;
}

.component-badge {
  background: var(--remark-hover);
  color: var(--remark-text-secondary);
}

.initiator-content {
  font-size: 12px;
  color: var(--remark-text);
  line-height: 1.5;
  margin-bottom: 10px;
  padding-left: 30px;
}

.thread-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 30px;
}

.participants {
  display: flex;
  align-items: center;
}

.participant-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--remark-bg);
  margin-right: -6px;
  background: var(--remark-hover);
  object-fit: cover;
}

.more-users {
  font-size: 12px;
  color: var(--remark-time);
  margin-left: 12px;
}

.replies-count {
  font-size: 12px;
  color: var(--remark-time);
}

.expanded-thread-content {
  margin-top: 12px;
  border-top: 1px dashed #e5e7eb;
  padding-top: 12px;
}

.inline-replies-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
  padding-left: 12px;
  border-left: 2px solid #f3f4f6;
}

.inline-reply-item {
  display: flex;
  gap: 8px;
}

.reply-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1px solid var(--remark-border);
}

.reply-body {
  flex: 1;
}

.reply-meta {
  display: flex;
  align-items: center;
  font-size: 11px;
  color: var(--remark-text-secondary);
  margin-bottom: 4px;
}

.reply-meta strong {
  color: var(--remark-text);
  margin-right: 6px;
  font-size: 12px;
}

.reply-meta .meta-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

.reply-text {
  font-size: 12px;
  color: var(--remark-text);
  line-height: 1.4;
  word-break: break-word;
}

.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 12px;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.delete-btn:hover {
  opacity: 1;
}

.inline-reply-box {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.inline-reply-box input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid var(--remark-border);
  border-radius: 4px;
  outline: none;
  font-size: 12px;
  background: var(--remark-bg-secondary);
}

.inline-reply-box input:focus {
  border-color: #6366f1;
  background: var(--remark-bg);
}

.inline-reply-box button {
  background: #6366f1;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
}

/* Comment styling */
.initiator-content.bold,
.reply-text.bold {
  font-weight: bold;
}

.initiator-content.strikethrough,
.reply-text.strikethrough {
  text-decoration: line-through;
  opacity: 0.6;
}

.initiator-content,
.reply-text {
  padding: 4px;
  border-radius: 4px;
}

/* More Actions Menu */
.more-actions-wrapper {
  position: relative;
  display: inline-block;
}

.more-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 8px;
  font-size: 16px;
  color: var(--remark-time);
  line-height: 1;
}

.more-btn:hover {
  color: var(--remark-text);
}

.more-actions-menu {
  display: flex;
  position: absolute;
  right: 0;
  top: 100%;
  background: var(--remark-bg);
  border: 1px solid var(--remark-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  z-index: 100;
  padding: 8px;
  min-width: 150px;
  flex-direction: column;
  gap: 8px;
}

.colors-row {
  display: flex;
  gap: 6px;
  justify-content: space-between;
}

.color-btn {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-btn.active {
  border-color: var(--remark-text-secondary);
  transform: scale(1.1);
}

.filter-bar {
  justify-content: flex-start;
  gap: 12px;
}

.filter-label {
  font-size: 13px;
  color: var(--remark-time);
  font-weight: 500;
}

.clear-filter-btn {
  margin-left: auto;
  font-size: 12px;
  color: var(--remark-time);
}

.clear-filter-btn:hover {
  color: #ef4444;
}

.filter-divider {
  width: 1px;
  height: 16px;
  background: var(--remark-border);
  margin: 0 4px;
}

.filter-colors {
  display: flex;
  align-items: center;
}

.filter-colors .style-btn {
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--remark-time);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  flex: none;
}

.filter-colors .style-btn:hover {
  background: var(--remark-hover);
  color: var(--remark-text);
}

.filter-colors .style-btn.active {
  background: var(--remark-border);
  color: var(--remark-text);
}

.color-btn.clear {
  background: var(--remark-bg);
  color: var(--remark-text-muted);
  font-size: 10px;
}

.color-btn:hover {
  transform: scale(1.1);
}

.styles-row {
  display: flex;
  gap: 6px;
  justify-content: space-between;
}

.style-btn {
  flex: 1;
  padding: 4px;
  border: 1px solid var(--remark-border);
  background: var(--remark-bg-secondary);
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  color: var(--remark-text);
}

.style-btn:hover {
  background: var(--remark-hover);
}

.action-btn.delete-text-btn {
  width: 100%;
  text-align: left;
  padding: 6px;
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  border-radius: 4px;
  font-size: 12px;
}

.action-btn.delete-text-btn:hover {
  background: #fef2f2;
}
</style>
