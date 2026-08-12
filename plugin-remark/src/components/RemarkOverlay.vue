<template>
  <div class="plugin-remark-overlay" v-if="showRemarks">
    <template v-for="item in remarkItems" :key="item.element.id">
      <!-- Glowing Border Highlight for Elements with Remarks -->
      <div 
        v-if="item.threads.length > 0"
        class="remark-element-highlight"
        :style="getHighlightStyle(item.element)"
      ></div>

      <!-- Container for Avatar Stack and Panel -->
      <div 
        class="remark-cluster-container"
        :style="getClusterStyle(item.element)"
        @click.stop
      >
        <!-- The Avatar Stack -->
        <div 
          v-if="item.threads.length > 0"
          class="avatar-stack" 
          @click="toggleElementPanel(item.element.id)"
        >
          <img 
            v-for="user in getUniqueUsers(item.threads)" 
            :key="user.userId"
            :src="user.userAvatar" 
            :title="user.userName"
            class="avatar-item"
          />
        </div>

        <!-- The Popover Panel -->
        <div v-if="isPanelOpen(item.element.id, item.isSelected)" class="thread-panel">
          <div class="thread-header">
            <span>Remarks</span>
            <button class="close-btn" @click="closePanel(item.element.id)">×</button>
          </div>
          
          <div class="comments-list">
            <div v-if="item.threads.length === 0" class="empty-state">
              No remarks yet. Add one below!
            </div>
            <div v-for="comment in getAllComments(item.threads)" :key="comment.id" class="comment-item">
              <img :src="comment.userAvatar" class="comment-avatar" />
              <div class="comment-body">
                <div class="comment-meta">
                  <strong>{{ comment.userName }}</strong>
                  <span class="time">{{ formatTime(comment.timestamp) }}</span>
                </div>
                <div class="comment-text">{{ comment.content }}</div>
              </div>
            </div>
          </div>

          <div class="reply-box">
            <input 
              :value="replyTexts[item.element.id] || ''" 
              @input="e => replyTexts[item.element.id] = (e.target as HTMLInputElement).value"
              placeholder="Reply..." 
              @keyup.enter="handleElementReply(item.element)"
            />
            <button @click="handleElementReply(item.element)">Send</button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useCanvasContext, CanvasElementData } from '@iss-ai/ppt-board';
import { useRemarkStore, Comment, RemarkThread } from '../store/useRemarkStore';
import { useRemarkUser } from '../composables/useRemarkUser';

const ctx = useCanvasContext();
const { state } = ctx;
const remarkStore = useRemarkStore(ctx as any);
const { showRemarks, getElementRemarks, addReply, addRemarkThread } = remarkStore;
const { currentUser } = useRemarkUser();

const activeElementId = ref<string | null>(null);
const forceClosed = ref<Set<string>>(new Set());
const replyTexts = ref<Record<string, string>>({});

// Computed list of elements that have remarks or are selected
const remarkItems = computed(() => {
  const elements = state.runtime.activeElements || [];
  return elements.map(element => {
    const isSelected = state.runtime.selectedIds.has(element.id);
    const threads = getElementRemarks(element).filter(t => !t.resolved);
    return { element, threads, isSelected };
  }).filter(item => item.threads.length > 0 || item.isSelected);
});

// Watch selection to clear forceClosed so selecting again opens it
watch(() => state.runtime.selectedIds, (newVal) => {
  newVal.forEach(id => forceClosed.value.delete(id));
}, { deep: true });

const isPanelOpen = (elementId: string, isSelected: boolean) => {
  if (forceClosed.value.has(elementId)) return false;
  return isSelected || activeElementId.value === elementId;
};

const toggleElementPanel = (elementId: string) => {
  if (isPanelOpen(elementId, state.runtime.selectedIds.has(elementId))) {
    closePanel(elementId);
  } else {
    activeElementId.value = elementId;
    forceClosed.value.delete(elementId);
  }
};

const closePanel = (elementId: string) => {
  forceClosed.value.add(elementId);
  if (activeElementId.value === elementId) {
    activeElementId.value = null;
  }
};

const getAllComments = (threads: RemarkThread[]) => {
  const all = threads.flatMap(t => t.comments);
  return all.sort((a, b) => a.timestamp - b.timestamp);
};

const getUniqueUsers = (threads: RemarkThread[]) => {
  const comments = getAllComments(threads);
  const seen = new Set();
  return comments.filter(c => {
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
  } else {
    addRemarkThread(element.id, element, comment);
  }

  replyTexts.value[element.id] = '';
};

const formatTime = (ts: number) => {
  const d = new Date(ts);
  return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
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

.empty-state {
  text-align: center;
  color: #888;
  font-size: 13px;
  padding: 20px 0;
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
  margin-bottom: 4px;
  font-size: 12px;
}
.comment-meta strong { color: #333; }
.comment-meta .time { color: #999; }

.comment-text {
  font-size: 13px;
  line-height: 1.4;
  word-break: break-word;
}

.reply-box {
  display: flex;
  padding: 12px;
  border-top: 1px solid #f0f0f0;
  gap: 8px;
}

.reply-box input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
}
.reply-box input:focus {
  border-color: #18a058;
}
.reply-box button {
  background: #18a058;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}
.reply-box button:hover {
  background: #36ad6a;
}
</style>
