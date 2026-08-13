<template>
  <div class="plugin-remark-overlay" v-if="showRemarks">
    
    <!-- Canvas Badges for Element Remarks -->
    <template v-for="badge in canvasBadges" :key="badge.elementId">
      <div 
        class="remark-canvas-badge"
        :style="getBadgeStyle(badge.elementId)"
        @click.stop="handleBadgeClick(badge.elementId, badge.threadId)"
      >
        <div class="avatar-stack">
          <AvatarIcon 
            v-for="user in badge.users.slice(0, 3)" 
            :key="user.userId"
            :src="user.userAvatar" 
            :name="user.userName"
            :userId="user.userId"
            class="badge-avatar"
          />
          <div v-if="badge.users.length > 3" class="badge-more">+{{ badge.users.length - 3 }}</div>
        </div>
      </div>
    </template>
    <!-- Global Right Sidebar -->
    <div class="excal-sidebar" v-if="showSidebar">
      <!-- Search Header -->
      <div class="excal-search-header">
        <div class="search-and-close">
          <div class="search-input-wrapper">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Quick search" v-model="searchQuery" />
            <span class="shortcut-hint">⌘3</span>
          </div>
          <button class="icon-btn close-btn" @click="closeSidebar" title="Close Panel">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>

      <!-- Filter/Actions Bar -->
      <div class="excal-actions-bar filter-bar">
        <span class="filter-label">Filter:</span>
        <div class="colors-row filter-colors">
          <button class="color-btn" :class="{ active: filterColor === '#fee2e2' }" style="background-color: #fee2e2" title="Urgent" @click="toggleFilter('#fee2e2')"></button>
          <button class="color-btn" :class="{ active: filterColor === '#ffedd5' }" style="background-color: #ffedd5" title="High" @click="toggleFilter('#ffedd5')"></button>
          <button class="color-btn" :class="{ active: filterColor === '#fef9c3' }" style="background-color: #fef9c3" title="Medium" @click="toggleFilter('#fef9c3')"></button>
          <button class="color-btn" :class="{ active: filterColor === '#dcfce7' }" style="background-color: #dcfce7" title="Low" @click="toggleFilter('#dcfce7')"></button>
          <button class="color-btn" :class="{ active: filterColor === '#dbeafe' }" style="background-color: #dbeafe" title="Info" @click="toggleFilter('#dbeafe')"></button>
          <div class="filter-divider"></div>
          
          <button class="style-btn" :class="{ active: filterStyles.includes('bold') }" title="Bold" @click="toggleStyleFilter('bold')"><b>B</b></button>
          <button class="style-btn" :class="{ active: filterStyles.includes('strikethrough') }" title="Strikethrough" @click="toggleStyleFilter('strikethrough')"><s>S</s></button>
        </div>
        <button class="text-btn clear-filter-btn" v-if="filterColor || filterStyles.length > 0" @click="clearFilters">Clear</button>
      </div>

      <!-- Global Canvas Remark Input -->
      <div class="global-remark-input">
        <input 
          type="text" 
          :placeholder="remarkPlaceholder" 
          v-model="globalRemarkText"
          @keyup.enter="handleGlobalReply"
        />
        <button v-if="globalRemarkText.trim()" @click="handleGlobalReply">Post</button>
      </div>

      <!-- Threads List -->
      <div class="excal-threads-list" @click="showSortDropdown = false">
        <div v-if="filteredThreads.length === 0" class="empty-state">
          No remarks found.
        </div>

        <div 
          v-for="item in filteredThreads" 
          :key="item.thread.id"
          class="excal-thread-card"
          :class="{ unread: !readThreadIds.has(item.thread.id), expanded: expandedThreadId === item.thread.id }"
          @click="selectAndOpenThread(item.element.id, item.thread.id)"
        >
          <!-- Initiator Comment -->
          <div class="initiator-header">
            <AvatarIcon 
              :src="item.initiator.userAvatar" 
              :name="item.initiator.userName"
              :userId="item.initiator.userId"
              class="initiator-avatar" 
            />
            <div class="initiator-meta">
              <strong>{{ item.initiator.userName }}</strong>
              <span class="badge" v-if="item.element.id === '__canvas_global__'">Canvas</span>
              <span class="badge component-badge" v-else>{{ item.element.type }}</span>
              <div class="meta-right">
                <span class="time" :title="formatAbsoluteTime(item.initiator.timestamp)">{{ formatRelativeTime(item.initiator.timestamp) }}</span>
                <div class="more-actions-wrapper" @click.stop="toggleMoreMenu(item.initiator.id)">
                  <button class="more-btn" title="More Options">⋮</button>
                  <div class="more-actions-menu" v-show="activeMenuId === item.initiator.id" @click.stop>
                    <div class="colors-row">
                      <button class="color-btn" style="background-color: #fee2e2" title="Urgent" @click.stop="handleUpdateStyle(item.element.id, item.thread.id, item.initiator.id, {color: '#fee2e2'})"></button>
                      <button class="color-btn" style="background-color: #ffedd5" title="High" @click.stop="handleUpdateStyle(item.element.id, item.thread.id, item.initiator.id, {color: '#ffedd5'})"></button>
                      <button class="color-btn" style="background-color: #fef9c3" title="Medium" @click.stop="handleUpdateStyle(item.element.id, item.thread.id, item.initiator.id, {color: '#fef9c3'})"></button>
                      <button class="color-btn" style="background-color: #dcfce7" title="Low" @click.stop="handleUpdateStyle(item.element.id, item.thread.id, item.initiator.id, {color: '#dcfce7'})"></button>
                      <button class="color-btn" style="background-color: #dbeafe" title="Info" @click.stop="handleUpdateStyle(item.element.id, item.thread.id, item.initiator.id, {color: '#dbeafe'})"></button>
                      <button class="color-btn clear" title="Clear Color" @click.stop="handleUpdateStyle(item.element.id, item.thread.id, item.initiator.id, {color: undefined})">✖</button>
                    </div>
                    <div class="styles-row">
                      <button class="style-btn" :class="{ active: (item.initiator.style || '').includes('bold') }" @click.stop="handleToggleItemStyle(item.element.id, item.thread.id, item.initiator.id, item.initiator.style, 'bold')"><b>B</b></button>
                      <button class="style-btn" :class="{ active: (item.initiator.style || '').includes('strikethrough') }" @click.stop="handleToggleItemStyle(item.element.id, item.thread.id, item.initiator.id, item.initiator.style, 'strikethrough')"><s>S</s></button>
                      <button class="style-btn" @click.stop="handleToggleItemStyle(item.element.id, item.thread.id, item.initiator.id, item.initiator.style, 'none')">Clear</button>
                    </div>
                    <button 
                      v-if="item.initiator.userId === currentUser?.userId"
                      class="action-btn delete-text-btn" 
                      @click.stop="handleDelete(item.element.id, item.thread.id, item.initiator.id)"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: text-bottom;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="initiator-content" :class="item.initiator.style" :style="{ backgroundColor: item.initiator.color }">
            {{ item.initiator.content }}
          </div>

          <!-- Footer: Participants and Replies (Hide if expanded or no replies) -->
          <div class="thread-footer" v-if="expandedThreadId !== item.thread.id && item.replyCount > 0">
            <div class="participants">
              <AvatarIcon 
                v-for="user in item.participants.slice(0, 3)" 
                :key="user.userId"
                :src="user.userAvatar" 
                :name="user.userName"
                :userId="user.userId"
                class="participant-avatar"
              />
              <span v-if="item.participants.length > 3" class="more-users">
                + {{ item.participants.length - 3 }} users
              </span>
            </div>
            <div class="replies-count" v-if="item.replyCount > 0">
              {{ item.replyCount }} replies
            </div>
          </div>

          <!-- Expanded Thread Content (Inline Replies) -->
          <div v-if="expandedThreadId === item.thread.id" class="expanded-thread-content" @click.stop>
            
            <div class="inline-replies-list" v-if="item.thread.comments.length > 1">
              <div v-for="comment in item.thread.comments.slice(1)" :key="comment.id" class="inline-reply-item">
                <AvatarIcon 
                  :src="comment.userAvatar" 
                  :name="comment.userName"
                  :userId="comment.userId"
                  class="reply-avatar" 
                />
                <div class="reply-body">
                  <div class="reply-meta">
                    <strong>{{ comment.userName }}</strong>
                    <div class="meta-right">
                      <span class="time" :title="formatAbsoluteTime(comment.timestamp)">{{ formatRelativeTime(comment.timestamp) }}</span>
                      <div class="more-actions-wrapper" @click.stop="toggleMoreMenu(comment.id)">
                        <button class="more-btn" title="More Options">⋮</button>
                        <div class="more-actions-menu" v-show="activeMenuId === comment.id" @click.stop>
                          <div class="colors-row">
                            <button class="color-btn" style="background-color: #fee2e2" title="Urgent" @click.stop="handleUpdateStyle(item.element.id, item.thread.id, comment.id, {color: '#fee2e2'})"></button>
                            <button class="color-btn" style="background-color: #ffedd5" title="High" @click.stop="handleUpdateStyle(item.element.id, item.thread.id, comment.id, {color: '#ffedd5'})"></button>
                            <button class="color-btn" style="background-color: #fef9c3" title="Medium" @click.stop="handleUpdateStyle(item.element.id, item.thread.id, comment.id, {color: '#fef9c3'})"></button>
                            <button class="color-btn" style="background-color: #dcfce7" title="Low" @click.stop="handleUpdateStyle(item.element.id, item.thread.id, comment.id, {color: '#dcfce7'})"></button>
                            <button class="color-btn" style="background-color: #dbeafe" title="Info" @click.stop="handleUpdateStyle(item.element.id, item.thread.id, comment.id, {color: '#dbeafe'})"></button>
                            <button class="color-btn clear" title="Clear Color" @click.stop="handleUpdateStyle(item.element.id, item.thread.id, comment.id, {color: undefined})">✖</button>
                          </div>
                          <div class="styles-row">
                            <button class="style-btn" :class="{ active: (comment.style || '').includes('bold') }" @click.stop="handleToggleItemStyle(item.element.id, item.thread.id, comment.id, comment.style, 'bold')"><b>B</b></button>
                            <button class="style-btn" :class="{ active: (comment.style || '').includes('strikethrough') }" @click.stop="handleToggleItemStyle(item.element.id, item.thread.id, comment.id, comment.style, 'strikethrough')"><s>S</s></button>
                            <button class="style-btn" @click.stop="handleToggleItemStyle(item.element.id, item.thread.id, comment.id, comment.style, 'none')">Clear</button>
                          </div>
                          <button 
                            v-if="comment.userId === currentUser?.userId"
                            class="action-btn delete-text-btn" 
                            @click.stop="handleDelete(item.element.id, item.thread.id, comment.id)"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: text-bottom;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="reply-text" :class="comment.style" :style="{ backgroundColor: comment.color }">{{ comment.content }}</div>
                </div>
              </div>
            </div>

            <!-- Reply Input -->
            <div class="inline-reply-box">
              <input 
                :value="replyTexts[item.thread.id] || ''" 
                @input="e => replyTexts[item.thread.id] = (e.target as HTMLInputElement).value"
                placeholder="Type a reply..." 
                @keyup.enter="handleInlineReply(item.element, item.thread.id)"
              />
              <button @click.stop="handleInlineReply(item.element, item.thread.id)">Reply</button>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useCanvasContext, CanvasElementData } from '@iss-ai/ppt-board';
import { useRemarkStore, Comment, RemarkThread } from '../store/useRemarkStore';
import { useRemarkUser } from '../composables/useRemarkUser';
import AvatarIcon from './AvatarIcon.vue';

const ctx = useCanvasContext();
const { state } = ctx;
const remarkStore = useRemarkStore(ctx as any);
const { 
  showRemarks, getElementRemarks, getAllRemarks, addReply, addRemarkThread, deleteComment, updateComment,
  readThreadIds, markAsRead, markAllAsRead 
} = remarkStore;
const { currentUser } = useRemarkUser();

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
};

const handleGlobalClick = () => {
  activeMenuId.value = null;
  showSortDropdown.value = false;
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

  list = list.sort((a, b) => {
    // Pin Canvas remarks to the top
    const aIsCanvas = a.element.id === '__canvas_global__';
    const bIsCanvas = b.element.id === '__canvas_global__';
    if (aIsCanvas && !bIsCanvas) return -1;
    if (!aIsCanvas && bIsCanvas) return 1;

    // Default sort by date (newest first)
    return b.initiator.timestamp - a.initiator.timestamp;
  });

  return list;
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
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
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
  border: 2px solid white;
  margin-right: -8px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
  border: 2px solid white;
  background: #f3f4f6;
  color: #4b5563;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: -8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 0;
}

/* Excalidraw-like Global Sidebar */
.excal-sidebar {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 320px;
  background: #fff;
  box-shadow: -4px 0 24px rgba(0,0,0,0.08);
  border-left: 1px solid #eaeaea;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
  z-index: 1001;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.excal-search-header {
  padding: 16px 16px 8px 16px;
}

.search-and-close {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 8px 12px;
  flex: 1;
}

.close-btn {
  color: #9ca3af;
}
.close-btn:hover {
  color: #ef4444;
  background: #fee2e2;
}

.search-icon {
  width: 16px; height: 16px; color: #9ca3af; margin-right: 8px;
}

.search-input-wrapper input {
  flex: 1;
  border: none; background: transparent; outline: none;
  font-size: 14px; color: #374151;
}

.shortcut-hint {
  font-size: 12px; color: #9ca3af; background: #e5e7eb;
  padding: 2px 6px; border-radius: 4px;
}

.excal-actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid #f3f4f6;
}

.sort-dropdown-container {
  position: relative;
}

.icon-btn {
  background: #f3f4f6; border: none; border-radius: 6px;
  width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #4b5563; transition: background 0.2s;
}
.icon-btn:hover { background: #e5e7eb; }
.icon-btn svg { width: 16px; height: 16px; }

.sort-dropdown {
  position: absolute; top: 100%; left: 0; margin-top: 4px;
  background: #fff; border: 1px solid #e5e7eb; border-radius: 8px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  width: 240px; z-index: 10; padding: 8px 0;
}

.dropdown-item {
  padding: 8px 16px; font-size: 14px; color: #374151; cursor: pointer;
  display: flex; align-items: center;
}
.dropdown-item:hover { background: #f9fafb; }
.dropdown-item .icon { font-size: 12px; margin-right: 8px; color: #9ca3af; }
.dropdown-item .check { margin-left: auto; color: #4f46e5; }

.dropdown-divider {
  height: 1px; background: #f3f4f6; margin: 4px 0;
}

.toggle-item {
  justify-content: space-between;
}
.toggle-switch {
  width: 32px; height: 18px; background: #e5e7eb; border-radius: 10px;
  position: relative; transition: background 0.2s;
}
.toggle-switch.on { background: #10b981; }
.toggle-switch .knob {
  width: 14px; height: 14px; background: #fff; border-radius: 50%;
  position: absolute; top: 2px; left: 2px; transition: transform 0.2s;
}
.toggle-switch.on .knob { transform: translateX(14px); }

.text-btn {
  background: none; border: none; color: #4b5563; font-size: 13px;
  font-weight: 500; cursor: pointer; display: flex; align-items: center;
}
.text-btn:hover { color: #111827; }
.text-btn .check-icon { margin-right: 6px; }

.excal-threads-list {
  flex: 1; overflow-y: auto;
}

.empty-state {
  padding: 40px 20px; text-align: center; color: #9ca3af; font-size: 13px;
}

.global-remark-input {
  display: flex;
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #f3f4f6;
  gap: 8px;
}

.global-remark-input input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  outline: none;
  font-size: 13px;
  background: #fff;
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
  padding: 14px 16px; border-bottom: 1px solid #e5e7eb; cursor: pointer;
  border-left: 3px solid transparent; transition: background 0.1s;
}
.excal-thread-card:hover { background: #f9fafb; }
.excal-thread-card.unread {
  border-left-color: #4f46e5;
  background: #faf5ff;
}
.excal-thread-card.unread:hover { background: #f3ebff; }

.initiator-header {
  display: flex; align-items: center; margin-bottom: 6px;
}

.initiator-avatar {
  width: 22px; height: 22px; border-radius: 50%; border: 1px solid #e5e7eb; margin-right: 8px;
}

.initiator-meta {
  display: flex; align-items: center; font-size: 11px; color: #4b5563; margin-bottom: 4px; flex: 1;
}
.initiator-meta strong { color: #111827; font-weight: 600; }
.initiator-meta .dot { margin: 0 4px; color: #9ca3af; }
.initiator-meta .time { color: #6b7280; font-size: 11px; }
.initiator-meta .meta-right { margin-left: auto; display: flex; align-items: center; gap: 8px; }

.initiator-delete {
  margin-left: auto;
}

.badge {
  background: #e0e7ff;
  color: #4338ca;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  margin-left: 6px;
  font-weight: 600;
}
.component-badge {
  background: #f3f4f6;
  color: #4b5563;
}

.initiator-content {
  font-size: 12px; color: #374151; line-height: 1.5;
  margin-bottom: 10px; padding-left: 30px;
}

.thread-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding-left: 30px;
}

.participants {
  display: flex; align-items: center;
}

.participant-avatar {
  width: 20px; height: 20px; border-radius: 50%;
  border: 2px solid #fff; margin-right: -6px;
  background: #f3f4f6; object-fit: cover;
}

.more-users {
  font-size: 12px; color: #6b7280; margin-left: 12px;
}

.replies-count {
  font-size: 12px; color: #6b7280;
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
  display: flex; gap: 8px;
}

.reply-avatar {
  width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0; border: 1px solid #e5e7eb;
}

.reply-body {
  flex: 1;
}

.reply-meta {
  display: flex; align-items: center; font-size: 11px; color: #4b5563; margin-bottom: 4px;
}
.reply-meta strong { color: #111827; margin-right: 6px; font-size: 12px; }
.reply-meta .meta-right { margin-left: auto; display: flex; align-items: center; gap: 8px; }

.reply-text {
  font-size: 12px; color: #374151; line-height: 1.4; word-break: break-word;
}

.delete-btn {
  background: none; border: none; cursor: pointer; padding: 0;
  font-size: 12px; opacity: 0.5; transition: opacity 0.2s;
}
.delete-btn:hover { opacity: 1; }

.inline-reply-box {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.inline-reply-box input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  outline: none;
  font-size: 12px;
  background: #f9fafb;
}
.inline-reply-box input:focus {
  border-color: #6366f1;
  background: #fff;
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
.initiator-content.bold, .reply-text.bold {
  font-weight: bold;
}
.initiator-content.strikethrough, .reply-text.strikethrough {
  text-decoration: line-through;
  opacity: 0.6;
}
.initiator-content, .reply-text {
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
  color: #6b7280;
  line-height: 1;
}
.more-btn:hover {
  color: #111827;
}
.more-actions-menu {
  display: flex;
  position: absolute;
  right: 0;
  top: 100%;
  background: white;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
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
  border-color: #4b5563;
  transform: scale(1.1);
}
.filter-bar {
  justify-content: flex-start;
  gap: 12px;
}
.filter-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}
.clear-filter-btn {
  margin-left: auto;
  font-size: 12px;
  color: #6b7280;
}
.clear-filter-btn:hover {
  color: #ef4444;
}
.filter-divider {
  width: 1px; height: 16px; background: #e5e7eb; margin: 0 4px;
}
.filter-colors {
  display: flex;
  align-items: center;
}
.filter-colors .style-btn {
  width: 20px; height: 20px; padding: 0; border: none; background: transparent;
  color: #6b7280; display: flex; align-items: center; justify-content: center;
  border-radius: 4px; cursor: pointer; flex: none;
}
.filter-colors .style-btn:hover { background: #f3f4f6; color: #111827; }
.filter-colors .style-btn.active { background: #e5e7eb; color: #111827; }
.color-btn.clear {
  background: white;
  color: #9ca3af;
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
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  color: #374151;
}
.style-btn:hover {
  background: #f3f4f6;
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
