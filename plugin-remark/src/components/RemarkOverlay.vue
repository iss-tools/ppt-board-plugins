<template>
  <div class="plugin-remark-overlay" v-if="showRemarks">
    
    <!-- Canvas Indicators -->
    <template v-for="item in activeElementsWithRemarks" :key="item.element.id">
      <!-- Glowing Border Highlight -->
      <div 
        class="remark-element-highlight"
        :style="getHighlightStyle(item.element)"
      ></div>

      <!-- Container for Avatar Stack and Local Panel -->
      <div 
        class="remark-cluster-container"
        :style="getClusterStyle(item.element)"
        @click.stop
      >
        <div class="avatar-stack" @click="toggleElementPanel(item.element.id)">
          <AvatarIcon 
            v-for="user in getUniqueUsers(item.threads)" 
            :key="user.userId"
            :src="user.userAvatar" 
            :name="user.userName"
            :userId="user.userId"
            class="avatar-item"
          />
        </div>

        <!-- The Popover Panel -->
        <div v-if="activeElementId === item.element.id" class="thread-panel">
          <div class="thread-header">
            <span>Remarks</span>
            <button class="close-btn" @click="activeElementId = null">×</button>
          </div>
          
          <div class="comments-list">
            <template v-for="thread in item.threads" :key="thread.id">
              <div v-for="comment in thread.comments" :key="comment.id" class="comment-item">
                <AvatarIcon 
                  :src="comment.userAvatar" 
                  :name="comment.userName"
                  :userId="comment.userId"
                  class="comment-avatar" 
                />
                <div class="comment-body">
                  <div class="comment-meta">
                    <strong>{{ comment.userName }}</strong>
                    <div class="meta-right">
                      <span class="time">{{ formatRelativeTime(comment.timestamp) }}</span>
                      <button 
                        v-if="comment.userId === currentUser?.userId"
                        class="delete-btn" 
                        @click="handleDelete(item.element.id, thread.id, comment.id)"
                        title="Delete remark"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div class="comment-text">{{ comment.content }}</div>
                </div>
              </div>
            </template>
          </div>

          <div class="reply-box">
            <input 
              :value="replyTexts[item.element.id] || ''" 
              @input="e => replyTexts[item.element.id] = (e.target as HTMLInputElement).value"
              placeholder="Type a remark..." 
              @keyup.enter="handleElementReply(item.element)"
            />
            <button @click="handleElementReply(item.element)">Send</button>
          </div>
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
      <div class="excal-actions-bar">
        <div class="sort-dropdown-container">
          <button class="icon-btn" @click="showSortDropdown = !showSortDropdown">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
          </button>
          
          <!-- Dropdown -->
          <div class="sort-dropdown" v-if="showSortDropdown" @click.stop>
            <div class="dropdown-item" @click="sortBy = 'date'; showSortDropdown = false">
              <span class="icon">↑↓</span> Sort by date
              <span v-if="sortBy === 'date'" class="check">✓</span>
            </div>
            <div class="dropdown-item" @click="sortBy = 'unread'; showSortDropdown = false">
              <span class="icon">↑↓</span> Sort by unread
              <span v-if="sortBy === 'unread'" class="check">✓</span>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item toggle-item" @click="showResolved = !showResolved">
              <span>Show resolved comments</span>
              <div class="toggle-switch" :class="{ on: showResolved }"><div class="knob"></div></div>
            </div>
          </div>
        </div>

        <button class="text-btn" @click="markAllAsRead">
          <span class="check-icon">✓</span> Mark all as read
        </button>
      </div>

      <!-- Global Canvas Remark Input -->
      <div class="global-remark-input">
        <input 
          type="text" 
          placeholder="Add a remark for the entire canvas..." 
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
          :class="{ unread: !readThreadIds.has(item.thread.id) }"
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
              <span class="dot">•</span>
              <span class="time">{{ formatRelativeTime(item.initiator.timestamp) }}</span>
            </div>
          </div>
          
          <div class="initiator-content">
            {{ item.initiator.content }}
          </div>

          <!-- Footer: Participants and Replies -->
          <div class="thread-footer">
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useCanvasContext, CanvasElementData } from '@iss-ai/ppt-board';
import { useRemarkStore, Comment, RemarkThread } from '../store/useRemarkStore';
import { useRemarkUser } from '../composables/useRemarkUser';
import AvatarIcon from './AvatarIcon.vue';

const ctx = useCanvasContext();
const { state } = ctx;
const remarkStore = useRemarkStore(ctx as any);
const { 
  showRemarks, getElementRemarks, addReply, addRemarkThread, deleteComment, 
  readThreadIds, markAsRead, markAllAsRead 
} = remarkStore;
const { currentUser } = useRemarkUser();

const forceClosedSidebar = ref(false);
const activeElementId = ref<string | null>(null);
const replyTexts = ref<Record<string, string>>({});
const globalRemarkText = ref('');

// Sidebar State
const searchQuery = ref('');
const showSortDropdown = ref(false);
const sortBy = ref<'date' | 'unread'>('date');
const showResolved = ref(false);

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

const toggleElementPanel = (elementId: string) => {
  if (activeElementId.value === elementId) {
    activeElementId.value = null;
  } else {
    activeElementId.value = elementId;
    // Mark all threads for this element as read when opening local panel
    const threads = getElementRemarks({ id: elementId } as any);
    threads.forEach(t => markAsRead(t.id));
  }
};

const showSidebar = computed(() => {
  if (!showRemarks.value) return false;
  return !forceClosedSidebar.value;
});

const closeSidebar = () => {
  forceClosedSidebar.value = true;
};

// Canvas Indicators: Elements that have remarks
const activeElementsWithRemarks = computed(() => {
  const elements = state.runtime.activeElements || [];
  return elements.map(element => {
    const threads = getElementRemarks(element).filter(t => !t.resolved);
    return { element, threads };
  }).filter(item => item.threads.length > 0);
});

// Unified Flat List of Threads
const allCanvasThreads = computed(() => {
  const elements = state.runtime.activeElements || [];
  const list: Array<{ element: CanvasElementData, thread: RemarkThread, initiator: Comment, participants: any[], replyCount: number }> = [];
  
  // Add global canvas remarks
  const globalElement = { id: '__canvas_global__', type: 'canvas' } as CanvasElementData;
  const globalThreads = getElementRemarks(globalElement);
  globalThreads.forEach(thread => {
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

    list.push({ element: globalElement, thread, initiator, participants, replyCount });
  });

  // Add element remarks
  elements.forEach(element => {
    const threads = getElementRemarks(element);
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

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(item => {
      return item.thread.comments.some(c => 
        c.content.toLowerCase().includes(q) || 
        c.userName.toLowerCase().includes(q)
      );
    });
  }

  list = list.sort((a, b) => {
    if (sortBy.value === 'unread') {
      const aUnread = !readThreadIds.value.has(a.thread.id);
      const bUnread = !readThreadIds.value.has(b.thread.id);
      if (aUnread && !bUnread) return -1;
      if (!aUnread && bUnread) return 1;
    }
    // Fallback or default sort by date (newest first)
    return b.initiator.timestamp - a.initiator.timestamp;
  });

  return list;
});

const selectAndOpenThread = (elementId: string, threadId: string) => {
  markAsRead(threadId);
  if (elementId !== '__canvas_global__') {
    ctx.selection?.setSelection([elementId]);
    activeElementId.value = elementId; // open local popover
  }
  forceClosedSidebar.value = false;
};

const getUniqueUsers = (threads: RemarkThread[]) => {
  const all = threads.flatMap(t => t.comments);
  const seen = new Set();
  return all.filter(c => {
    if (seen.has(c.userId)) return false;
    seen.add(c.userId);
    return true;
  }).slice(0, 5); // Show max 5 avatars in stack
};

const getHighlightStyle = (element: CanvasElementData) => {
  const { scale, offsetX, offsetY } = state.runtime;
  const left = element.x * scale + offsetX;
  const top = element.y * scale + offsetY;
  const w = (element.width || 0) * scale;
  const h = (element.height || 0) * scale;
  return {
    left: `${left - 4}px`,
    top: `${top - 4}px`,
    width: `${w + 8}px`,
    height: `${h + 8}px`,
    position: 'absolute' as const,
    border: '2px solid rgba(99, 102, 241, 0.6)',
    boxShadow: '0 0 10px rgba(99, 102, 241, 0.4)',
    borderRadius: '6px',
    pointerEvents: 'none' as const,
    transition: 'all 0.2s',
  };
};

const getClusterStyle = (element: CanvasElementData) => {
  const { scale, offsetX, offsetY } = state.runtime;
  const left = (element.x + (element.width || 0)) * scale + offsetX;
  const top = element.y * scale + offsetY;
  return {
    left: `${left}px`,
    top: `${top}px`,
    position: 'absolute' as const,
  };
};

const handleElementReply = (element: CanvasElementData) => {
  const text = replyTexts.value[element.id];
  if (!text || !text.trim() || !currentUser.value) return;
  
  const comment: Comment = {
    id: `comment_${Date.now()}`,
    userId: currentUser.value.userId,
    userName: currentUser.value.name,
    userAvatar: currentUser.value.avatar,
    content: text.trim(),
    timestamp: Date.now()
  };

  const threads = getElementRemarks(element).filter(t => !t.resolved);
  if (threads.length > 0) {
    addReply(element.id, element, threads[0].id, comment);
    markAsRead(threads[0].id);
  } else {
    addRemarkThread(element.id, element, comment);
  }

  replyTexts.value[element.id] = '';
};

const handleGlobalReply = () => {
  if (!globalRemarkText.value.trim() || !currentUser.value) return;
  const element = { id: '__canvas_global__', type: 'canvas' } as CanvasElementData;
  const comment: Comment = {
    id: `comment_${Date.now()}`,
    userId: currentUser.value.userId,
    userName: currentUser.value.name,
    userAvatar: currentUser.value.avatar,
    content: globalRemarkText.value.trim(),
    timestamp: Date.now()
  };
  addRemarkThread(element.id, element, comment);
  globalRemarkText.value = '';
};

const handleDelete = (elementId: string, threadId: string, commentId: string) => {
  deleteComment(elementId, threadId, commentId);
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

.remark-element-highlight {
  z-index: 999;
}

.remark-cluster-container {
  pointer-events: auto;
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
}

.avatar-stack {
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  transition: transform 0.2s;
}

.avatar-stack:hover {
  transform: scale(1.1);
}

.avatar-item {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid #fff;
  background-color: #f0f0f0;
  margin-right: -10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  object-fit: cover;
}

/* Popover Panel Styles */
.thread-panel {
  position: absolute;
  top: 36px;
  left: 0;
  width: 300px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  border: 1px solid #eee;
  display: flex;
  flex-direction: column;
  color: #333;
  z-index: 1001;
  font-family: sans-serif;
  cursor: default;
}

.thread-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
  font-weight: bold;
  font-size: 14px;
}

.close-btn {
  background: none; border: none; font-size: 18px; cursor: pointer; color: #999;
}
.close-btn:hover { color: #333; }

.comments-list {
  max-height: 250px;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-item {
  display: flex;
  gap: 8px;
}

.comment-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #eee;
}

.comment-body {
  flex: 1;
  background: #f9f9f9;
  padding: 8px;
  border-radius: 6px;
  border-top-left-radius: 0;
}

.comment-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  font-size: 12px;
}
.comment-meta strong { color: #333; }
.meta-right { display: flex; align-items: center; gap: 8px; }
.comment-meta .time { color: #999; font-size: 11px; }

.delete-btn {
  background: none; border: none; cursor: pointer; padding: 0;
  font-size: 12px; opacity: 0.5; transition: opacity 0.2s;
}
.delete-btn:hover { opacity: 1; }

.comment-text {
  font-size: 13px;
  line-height: 1.4;
  color: #444;
  word-break: break-word;
}

.reply-box {
  display: flex;
  padding: 12px;
  border-top: 1px solid #eee;
  gap: 8px;
  background: #fafafa;
}

.reply-box input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  outline: none;
  font-size: 13px;
  transition: border-color 0.2s;
}
.reply-box input:focus {
  border-color: #6366f1;
}
.reply-box button {
  background: #6366f1;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}
.reply-box button:hover {
  background: #4f46e5;
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
  font-size: 12px; color: #4b5563; display: flex; align-items: center;
}
.initiator-meta strong { color: #111827; font-weight: 600; }
.initiator-meta .dot { margin: 0 4px; color: #9ca3af; }
.initiator-meta .time { color: #6b7280; font-size: 11px; }

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
</style>
