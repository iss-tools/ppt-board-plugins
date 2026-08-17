import { ref, computed } from 'vue';
import type { CanvasPluginContext, CanvasElementData } from '@iss-ai/ppt-board';

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: number;
  style?: string; // e.g. 'bold' | 'strikethrough' | 'bold strikethrough' | 'none'
  color?: string;
}

export interface RemarkThread {
  id: string;
  targetId: string; // ID of the element or slide
  x?: number; // relative x position if needed
  y?: number;
  resolved: boolean;
  comments: Comment[];
}

export function useRemarkStore(ctx: CanvasPluginContext | null = null) {
  
  const showRemarks = computed(() => ctx?.state?.editor?.showRemarks ?? false);

  // Local state for unread tracking
  const readThreadIds = ref<Set<string>>(new Set());

  const markAsRead = (threadId: string) => {
    readThreadIds.value.add(threadId);
  };

  const markAllAsRead = () => {
    const all = getAllRemarks();
    Object.values(all).forEach(threads => {
      threads.forEach(t => readThreadIds.value.add(t.id));
    });
  };

  const toggleShowRemarks = () => {
    if (ctx) {
      ctx.hooks.emit('params-change' as any, { showRemarks: !showRemarks.value });
      ctx.state.editor.showRemarks = !showRemarks.value;
    }
  };

  const PLUGIN_NAME = 'vue-canvas-plugin-remark';

  const getAllRemarks = (): Record<string, RemarkThread[]> => {
    if (!ctx) return {};
    return ctx.state?.document?.pluginDatas?.[PLUGIN_NAME]?.remarks || {};
  };

  const getElementRemarks = (element: CanvasElementData): RemarkThread[] => {
    const allRemarks = getAllRemarks();
    return allRemarks[element.id] || [];
  };

  const saveElementRemarks = (targetId: string, threads: RemarkThread[]) => {
    if (!ctx) return;
    const allRemarks = { ...getAllRemarks() };
    allRemarks[targetId] = threads;
    
    if (!ctx.state.document.pluginDatas) {
      ctx.state.document.pluginDatas = {};
    }
    if (!ctx.state.document.pluginDatas[PLUGIN_NAME]) {
      ctx.state.document.pluginDatas[PLUGIN_NAME] = {};
    }
    ctx.state.document.pluginDatas[PLUGIN_NAME].remarks = allRemarks;

    if (ctx.hooks) {
      ctx.hooks.emit('pluginData-change' as any, { 
        pluginName: PLUGIN_NAME, 
        key: 'remarks', 
        value: allRemarks 
      });
    }
  };

  const addRemarkThread = (targetId: string, element: CanvasElementData, initialComment: Comment, x?: number, y?: number) => {
    const threads = getElementRemarks(element);
    const newThread: RemarkThread = {
      id: `thread_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      targetId,
      resolved: false,
      comments: [initialComment],
      x,
      y
    };
    
    saveElementRemarks(targetId, [...threads, newThread]);
  };

  const addReply = (targetId: string, element: CanvasElementData, threadId: string, comment: Comment) => {
    const threads = getElementRemarks(element);
    const threadIndex = threads.findIndex(t => t.id === threadId);
    if (threadIndex === -1) return;

    const updatedThread = { ...threads[threadIndex], comments: [...threads[threadIndex].comments, comment] };
    const newRemarks = [...threads];
    newRemarks[threadIndex] = updatedThread;

    saveElementRemarks(targetId, newRemarks);
  };

  const resolveThread = (targetId: string, element: CanvasElementData, threadId: string) => {
    const threads = getElementRemarks(element);
    const threadIndex = threads.findIndex(t => t.id === threadId);
    if (threadIndex === -1) return;

    const updatedThread = { ...threads[threadIndex], resolved: true };
    const newRemarks = [...threads];
    newRemarks[threadIndex] = updatedThread;

    saveElementRemarks(targetId, newRemarks);
  };

  const deleteComment = (targetId: string, threadId: string, commentId: string) => {
    // Note: Since element is needed for getElementRemarks, we mock it or pass element. 
    // Wait, getElementRemarks uses element.id, so we can just pass { id: targetId } as CanvasElementData
    const threads = getElementRemarks({ id: targetId } as CanvasElementData);
    const threadIndex = threads.findIndex(t => t.id === threadId);
    if (threadIndex === -1) return;

    const thread = threads[threadIndex];
    const newComments = thread.comments.filter(c => c.id !== commentId);
    
    const newRemarks = [...threads];
    if (newComments.length === 0) {
      newRemarks.splice(threadIndex, 1);
    } else {
      newRemarks[threadIndex] = { ...thread, comments: newComments };
    }
    
    saveElementRemarks(targetId, newRemarks);
  };

  const updateComment = (targetId: string, threadId: string, commentId: string, partial: Partial<Comment>) => {
    const threads = getElementRemarks({ id: targetId } as CanvasElementData);
    const threadIndex = threads.findIndex(t => t.id === threadId);
    if (threadIndex === -1) return;

    const thread = threads[threadIndex];
    const commentIndex = thread.comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) return;

    const updatedComment = { ...thread.comments[commentIndex], ...partial };
    const newComments = [...thread.comments];
    newComments[commentIndex] = updatedComment;
    
    const newRemarks = [...threads];
    newRemarks[threadIndex] = { ...thread, comments: newComments };
    
    saveElementRemarks(targetId, newRemarks);
  };

  return {
    showRemarks,
    toggleShowRemarks,
    getAllRemarks,
    getElementRemarks,
    addRemarkThread,
    addReply,
    resolveThread,
    deleteComment,
    updateComment,
    readThreadIds,
    markAsRead,
    markAllAsRead,
  };
}
