import * as Ably from 'ably';
import { ref, onUnmounted, watch } from 'vue';
import type { CanvasPluginContext } from '@iss-ai/ppt-board';
import { createDiscreteApi } from 'naive-ui';
import { useWebRTC } from './useWebRTC';

const { message } = createDiscreteApi(['message']);

export interface RemoteUser {
  clientId: string;
  x?: number;
  y?: number;
  selectedIds?: string[];
  name?: string;
  avatar?: string;
}

export function useAblySync(ctx: CanvasPluginContext, options?: { useP2P?: boolean; ablyApiKey?: string }) {
  const useP2P = options?.useP2P !== false; // Default true
  const isConnected = ref(false);
  const isSyncing = ref(false); // Flag to prevent echo
  const currentMode = ref<'edit' | 'view' | 'none'>('none');
  const sessionChannelId = ref('');
  const sessionKey = ref('');

  // --- WebRTC Setup ---
  const handleP2PData = (clientId: string, data: any) => {
    console.log('[WebRTC Received]', clientId, data);
    if (data.type === 'presence') {
      remoteUsers.value[clientId] = {
        ...remoteUsers.value[clientId],
        clientId,
        ...data.payload
      };
    } else if (data.type === 'sync-delta') {
      const payload = data.payload;
      isSyncing.value = true;
      if (payload.action === 'update' && payload.id && payload.props) {
        ctx.api.elements.update(payload.id, payload.props, true);
      } else if (payload.action === 'add' && payload.element) {
        ctx.api.elements.add(payload.element, true);
      } else if (payload.action === 'remove' && payload.ids) {
        ctx.api.elements.remove(payload.ids, true);
      } else if (payload.action === 'pluginData') {
        if (!ctx.state.document.pluginDatas) ctx.state.document.pluginDatas = {};
        if (!ctx.state.document.pluginDatas[payload.pluginName]) ctx.state.document.pluginDatas[payload.pluginName] = {};
        if (!payload.key) {
          ctx.state.document.pluginDatas[payload.pluginName] = payload.value;
        } else {
          ctx.state.document.pluginDatas[payload.pluginName][payload.key] = payload.value;
        }
      }
      setTimeout(() => { isSyncing.value = false; }, 30);
    } else if (data.type === 'sync-full-state') {
      isSyncing.value = true;
      ctx.state.runtime.activeElements = data.payload.elements;
      if (data.payload.pluginDatas) {
        ctx.state.document.pluginDatas = data.payload.pluginDatas;
      }
      setTimeout(() => { isSyncing.value = false; }, 30);
    } else if (data.type === 'sync-history-save') {
      // Remote user finished an action that requires a history snapshot.
      // Save local state to history without broadcasting to prevent infinite loop.
      ctx.api.project.saveState(true);
    }
  };
  
  const webrtc = useWebRTC(handleP2PData);

  const remoteUsers = ref<Record<string, RemoteUser>>({});

  let ablyClient: Ably.Realtime | null = null;
  let channel: Ably.RealtimeChannel | null = null;
  const mySenderId = Math.random().toString(36).substring(2);

  let lastPointerSync = 0;
  const POINTER_THROTTLE_MS = 50;

  async function connect(channelId: string, key: string, role: 'edit' | 'view') {
    const apiKey = options?.ablyApiKey;
    if (!apiKey) {
      message.error('ABLY_API_KEY is not configured in Plugin Options');
      return;
    }

    try {
      ablyClient = new Ably.Realtime({ key: apiKey, clientId: mySenderId });
      
      // Pad or truncate key to 32 bytes (256 bits) for AES encryption
      let validKey = key;
      if (validKey.length < 32) {
         validKey = validKey.padEnd(32, '0');
      } else if (validKey.length > 32) {
         validKey = validKey.substring(0, 32);
      }
      
      // Ably expects base64 encoded key for AES-256 E2E Encryption
      const b64Key = btoa(validKey);

      let cipherParams;
      // WebCrypto is only available in secure contexts (HTTPS or localhost)
      const isSecureContext = window.isSecureContext && window.crypto && window.crypto.subtle;

      if (!isSecureContext) {
        message.warning('当前环境不支持 WebCrypto (如局域网 HTTP)，已降级为非加密传输进行测试');
      } else {
        if (Ably.Realtime.Crypto) {
          cipherParams = Ably.Realtime.Crypto.getDefaultParams({ key: b64Key });
        } else {
          cipherParams = { key: b64Key };
        }
      }

      const channelOptions = cipherParams ? { cipher: cipherParams } : undefined;
      channel = ablyClient.channels.get(channelId, channelOptions);
      
      currentMode.value = role;
      sessionChannelId.value = channelId;
      sessionKey.value = key;
      
      if (role === 'view') {
        // Enforce preview mode
        ctx.api.editor.setDisablePan(false);
        ctx.api.editor.setMode('preview');
      }

      // --- Presence: Cursors and Selection ---
      channel.presence.subscribe(['present', 'enter', 'update'], (member) => {
        if (member.clientId === mySenderId) return;
        remoteUsers.value[member.clientId] = {
          clientId: member.clientId,
          ...(member.data || {})
        };
        
        // Initiate WebRTC connection if a new user enters and we are using P2P
        if (useP2P && (member.action === 'enter' || member.action === 'present')) {
          // Both sides receive enter for each other, but only lexicographically smaller initiates to prevent glare
          if (mySenderId < member.clientId) {
            webrtc.initiateConnection(
              member.clientId,
              (offer) => channel!.publish('webrtc-offer', { target: member.clientId, offer }),
              (candidate) => channel!.publish('webrtc-candidate', { target: member.clientId, candidate })
            );
          }
        }
      });

      channel.presence.subscribe('leave', (member) => {
        delete remoteUsers.value[member.clientId];
        webrtc.removePeer(member.clientId);
      });
      
      // Update lockedIds in core state when remote selections change
      watch(remoteUsers, (users) => {
        const locked = new Set<string>();
        for (const user of Object.values(users)) {
          if (user.selectedIds) {
            user.selectedIds.forEach(id => locked.add(id));
          }
        }
        if (ctx.state.runtime.lockedIds) {
           ctx.state.runtime.lockedIds.clear();
           locked.forEach(id => ctx.state.runtime.lockedIds?.add(id));
        } else {
           ctx.state.runtime.lockedIds = locked;
        }
      }, { deep: true });

      // Enter presence with initial empty state
      channel.presence.enter({});

      // --- WebRTC Signaling ---
      if (useP2P) {
        channel.subscribe('webrtc-offer', async (msg) => {
          if (!msg.clientId || msg.clientId === mySenderId || msg.data?.target !== mySenderId) return;
          await webrtc.handleOffer(
            msg.clientId, 
            msg.data.offer,
            (answer) => channel!.publish('webrtc-answer', { target: msg.clientId, answer }),
            (candidate) => channel!.publish('webrtc-candidate', { target: msg.clientId, candidate })
          );
        });
        
        channel.subscribe('webrtc-answer', async (msg) => {
          if (!msg.clientId || msg.clientId === mySenderId || msg.data?.target !== mySenderId) return;
          await webrtc.handleAnswer(msg.clientId, msg.data.answer);
        });
        
        channel.subscribe('webrtc-candidate', async (msg) => {
          if (!msg.clientId || msg.clientId === mySenderId || msg.data?.target !== mySenderId) return;
          await webrtc.handleCandidate(msg.clientId, msg.data.candidate);
        });

      }

      // --- Delta Sync: Elements ---
      channel.subscribe('sync-delta', (msg) => {
        if (msg.clientId === mySenderId) return;
        
        const data = msg.data;
        if (data && data.action) {
          isSyncing.value = true;
          
          if (data.action === 'update' && data.id && data.props) {
            ctx.api.elements.update(data.id, data.props, true);
          } else if (data.action === 'add' && data.element) {
            // Pass true to skipHistory during remote sync
            ctx.api.elements.add(data.element, true);
          } else if (data.action === 'remove' && data.ids) {
            ctx.api.elements.remove(data.ids, true);
          } else if (data.action === 'pluginData') {
            if (!ctx.state.document.pluginDatas) ctx.state.document.pluginDatas = {};
            if (!ctx.state.document.pluginDatas[data.pluginName]) ctx.state.document.pluginDatas[data.pluginName] = {};
            if (!data.key) {
              ctx.state.document.pluginDatas[data.pluginName] = data.value;
            } else {
              ctx.state.document.pluginDatas[data.pluginName][data.key] = data.value;
            }
          }
          
          // Wait a tick before unlocking to prevent local echo
          setTimeout(() => {
            isSyncing.value = false;
          }, 30);
        }
      });
      
      channel.subscribe('sync-history-save', () => {
        // Remote user finished an action that requires a history snapshot.
        // Save local state to history without broadcasting to prevent infinite loop.
        ctx.api.project.saveState(true);
      });
      
      // --- Full State Sync (New Join & Undo/Redo) ---
      channel.subscribe('request-full-state', (msg) => {
        if (!msg.clientId || msg.clientId === mySenderId) return;
        // The host (or everyone) replies with the current state to the requester
        if (Object.keys(remoteUsers.value).length === 0 || mySenderId < msg.clientId) {
          channel!.publish('sync-full-state', { 
            target: msg.clientId, 
            elements: ctx.state.runtime.activeElements,
            pluginDatas: ctx.state.document.pluginDatas 
          });
        }
      });
      
      channel.subscribe('sync-full-state', (msg) => {
        if (msg.clientId === mySenderId || (msg.data.target && msg.data.target !== mySenderId)) return;
        isSyncing.value = true;
        ctx.state.runtime.activeElements = msg.data.elements;
        if (msg.data.pluginDatas) {
          ctx.state.document.pluginDatas = msg.data.pluginDatas;
        }
        setTimeout(() => { isSyncing.value = false; }, 30);
      });

      // Request full state when joining
      setTimeout(() => {
        channel!.publish('request-full-state', {});
      }, 500);

      ablyClient.connection.on('connected', () => {
        isConnected.value = true;
      });
      
      ablyClient.connection.on('disconnected', () => {
        isConnected.value = false;
      });
      
      ablyClient.connection.on('closed', () => {
        isConnected.value = false;
      });
      
      console.log(`Connected to Ably channel ${channelId} in ${role} mode.`);
    } catch (error: any) {
      console.error('Ably connection error:', error);
      message.error(`无法连接到协作服务: ${error.message || error}`);
    }
  }
  
  function disconnect() {
    if (ablyClient) {
      ablyClient.close();
      ablyClient = null;
    }
    webrtc.cleanup();
    channel = null;
    isConnected.value = false;
    currentMode.value = 'none';
    sessionChannelId.value = '';
    sessionKey.value = '';
    remoteUsers.value = {};
  }

  let lastAblyTransientUpdate = 0;

  // --- Local Event Hooks (Broadcasts) ---
  const broadcastDelta = (action: 'add' | 'update' | 'remove', payload: any, skipHistory: boolean = false) => {
    if (!channel || currentMode.value !== 'edit' || isSyncing.value) return;
    
    // Broadcast ALL actions via WebRTC for instant UI feedback (if connected)
    if (useP2P) {
      console.log('[WebRTC Broadcast]', action, payload, 'skipHistory:', skipHistory);
      webrtc.broadcast({ type: 'sync-delta', payload: { action, ...payload } });
    }
    
    // If skipHistory is true, this is a high-frequency transient update (like typing, dragging)
    // NEVER fallback to Ably for high-frequency transient updates if WebRTC is enabled.
    const isTransientUpdate = skipHistory;

    if (useP2P && isTransientUpdate) {
      return; 
    }

    // Fallback/Reliable channel for structural changes (add/remove/text edits) ONLY
    console.log('[Ably Publish]', action, payload);
    channel.publish('sync-delta', { action, ...payload });
  };

  // --- Presence Throttling ---
  let lastPresenceUpdate = 0;
  let presenceUpdateTimer: any = null;
  const presenceState: Partial<RemoteUser> = {};
  
  // Try to load remark user for identity
  try {
    const remarkUserRaw = localStorage.getItem('ppt_board_remark_user');
    if (remarkUserRaw) {
      const remarkUser = JSON.parse(remarkUserRaw);
      if (remarkUser.name) presenceState.name = remarkUser.name;
      if (remarkUser.avatar) presenceState.avatar = remarkUser.avatar;
    }
  } catch(e) {}

  function updatePresence(data: Partial<RemoteUser>) {
    if (!channel || !isConnected.value) return;
    Object.assign(presenceState, data);
    
    const now = Date.now();
    const timeSinceLast = now - lastPresenceUpdate;
    
    if (timeSinceLast > 100) {
      // Send immediately if enough time has passed
      if (presenceUpdateTimer) {
        clearTimeout(presenceUpdateTimer);
        presenceUpdateTimer = null;
      }
      if (useP2P) {
        webrtc.broadcast({ type: 'presence', payload: presenceState });
        // Do NOT fallback to Ably for high-frequency pointer movements if WebRTC is enabled
      } else {
        channel?.presence.update(presenceState).catch(err => console.error('Presence update failed:', err));
      }
      
      lastPresenceUpdate = now;
    } else {
      // Otherwise, schedule it to run at the end of the throttle window
      if (!presenceUpdateTimer) {
        presenceUpdateTimer = setTimeout(() => {
          if (useP2P) {
            webrtc.broadcast({ type: 'presence', payload: presenceState });
          } else {
            channel?.presence.update(presenceState).catch(err => console.error('Presence update failed:', err));
          }
          
          lastPresenceUpdate = Date.now();
          presenceUpdateTimer = null;
        }, 100 - timeSinceLast);
      }
    }
  }

  // Bind to context hooks
  const onElementUpdate = (id: string, props: any, skipHistory: boolean = false) => broadcastDelta('update', { id, props }, skipHistory);
  const onElementAdd = (element: any, skipHistory: boolean = false) => broadcastDelta('add', { element }, skipHistory);
  const onElementRemove = (ids: string | string[], skipHistory: boolean = false) => broadcastDelta('remove', { ids }, skipHistory);
  const onElementMove = (id: string, x: number, y: number) => broadcastDelta('update', { id, props: { x, y } }, true);
  
  const onElementRotate = (id: string, rotation: number) => broadcastDelta('update', { id, props: { rotation } }, true);
  const onElementResize = (id: string, width: number, height: number) => {
    const el = ctx.state.runtime.activeElements.find(e => e.id === id);
    if (el) {
       // Also sync props (which contains points) since resize might modify them
       broadcastDelta('update', { id, props: { width, height, props: el.props } }, true);
    }
  };

  const onPointerMove = (coords: { x: number, y: number }) => {
    const now = Date.now();
    if (now - lastPointerSync > POINTER_THROTTLE_MS) {
      updatePresence({ x: coords.x, y: coords.y });
      lastPointerSync = now;
    }
  };

  const onSelect = (selectedIds: string[]) => {
    updatePresence({ selectedIds });
  };

  const onDeselect = () => {
    updatePresence({ selectedIds: [] });
  };
  
  const onHistoryRestore = (elements: any) => {
    if (!channel || currentMode.value !== 'edit' || isSyncing.value) return;
    // Broadcast full state to everyone when a local undo/redo happens
    channel.publish('sync-full-state', { 
      elements, 
      pluginDatas: ctx.state.document.pluginDatas 
    });
  };
  
  const onHistorySave = () => {
    if (!channel || currentMode.value !== 'edit' || isSyncing.value) return;
    const payload = { type: 'sync-history-save', payload: {} };
    if (useP2P) {
      webrtc.broadcast(payload);
    }
    channel.publish('sync-history-save', {});
  };

  const onPluginDataChange = (data: { pluginName: string, key: string, value: any }) => {
    if (!channel || currentMode.value !== 'edit' || isSyncing.value) return;
    broadcastDelta('pluginData' as any, data, true); // use true to skip history if needed
  };

  ctx.hooks.on('element:update', onElementUpdate);
  ctx.hooks.on('element:add', onElementAdd);
  ctx.hooks.on('element:remove', onElementRemove);
  ctx.hooks.on('element:move', onElementMove);
  ctx.hooks.on('element:rotate', onElementRotate);
  ctx.hooks.on('element:resize', onElementResize);
  ctx.hooks.on('pointer:move', onPointerMove);
  ctx.hooks.on('select', onSelect);
  ctx.hooks.on('deselect', onDeselect);
  ctx.hooks.on('history:restore', onHistoryRestore);
  ctx.hooks.on('history:save', onHistorySave);
  ctx.hooks.on('pluginData-change' as any, onPluginDataChange);

  onUnmounted(() => {
    ctx.hooks.off('element:update', onElementUpdate);
    ctx.hooks.off('element:add', onElementAdd);
    ctx.hooks.off('element:remove', onElementRemove);
    ctx.hooks.off('element:move', onElementMove);
    ctx.hooks.off('element:rotate', onElementRotate);
    ctx.hooks.off('element:resize', onElementResize);
    ctx.hooks.off('pointer:move', onPointerMove);
    ctx.hooks.off('select', onSelect);
    ctx.hooks.off('deselect', onDeselect);
    ctx.hooks.off('history:restore', onHistoryRestore);
    ctx.hooks.off('pluginData-change' as any, onPluginDataChange);
    disconnect();
  });

  return {
    isConnected,
    currentMode,
    sessionChannelId,
    sessionKey,
    remoteUsers,
    connect,
    disconnect,
  };
}
