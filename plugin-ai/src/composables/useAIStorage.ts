import { ref, watch, onMounted } from 'vue';
import { useEasyStore } from '@iss-ai/ppt-board';

export interface AIProvider {
  id: string;
  name: string;
  provider: string; // e.g., 'openai', 'gemini', 'anthropic'
  url: string;
  apiKey: string;
  model: string;
}

export interface AIPromptStyle {
  resolution?: string;
  aspectRatio?: string;
  style?: string[];
  layout?: string[];
  colorPalette?: string[];
  bgm?: boolean;
  supportImage?: boolean;
  supportSound?: boolean;
  shapes?: string[];
  shadow?: string[];
  textEffect?: string[];
  font?: string[];
  fontSize?: string[];
  language?: string[];
  borderSketch?: string[];
  pageRange?: [number, number];
}

export interface AIPromptTemplate {
  audience?: string[];
  pageCount?: number;
  theme?: string[];
  goal?: string[];
  structure?: string[];
  constraints?: string[];
}

export interface AIPrompt {
  id: string;
  name: string;
  template?: AIPromptTemplate;
  styleConfig: AIPromptStyle;
  fullPrompt: string;
  storyboardPrompt?: string;
}

export interface AIChatSession {
  id: string;
  name: string;
  messages: any[];
  updateTime?: Date;
}

export function useAIStorage() {
  const providerStore = useEasyStore<AIProvider>('ai_providers');
  const promptStore = useEasyStore<AIPrompt>('ai_prompts');
  const sessionStore = useEasyStore<AIChatSession>('ai_chat_sessions');
  const configStore = useEasyStore<{ id: string; value: string }>('ai_config');

  const providers = ref<AIProvider[]>([]);
  const prompts = ref<AIPrompt[]>([]);
  const sessions = ref<AIChatSession[]>([]);
  const currentProviderId = ref<string>('');
  const currentPromptId = ref<string>('');

  const loadData = async () => {
    try {
      providers.value = await providerStore.getList();
      prompts.value = await promptStore.getList();
      
      // Load sessions sorted by updateTime descending
      const loadedSessions = await sessionStore.getList({ sort: { updateTime: 'desc' } });
      sessions.value = loadedSessions || [];
      
      const pid = await configStore.getInfo({ id: 'currentProviderId' });
      if (pid) currentProviderId.value = pid.value;
      const prid = await configStore.getInfo({ id: 'currentPromptId' });
      if (prid) currentPromptId.value = prid.value;
    } catch (e) {
      console.warn('Failed to load AI storage from Dexie', e);
    }
  };

  onMounted(() => {
    loadData();
  });

  watch(currentProviderId, (val) => {
    configStore.save({ id: 'currentProviderId', value: val });
  });

  watch(currentPromptId, (val) => {
    configStore.save({ id: 'currentPromptId', value: val });
  });

  const addProvider = (provider: Omit<AIProvider, 'id'>) => {
    const id = `provider_${Date.now()}`;
    const newProvider = { ...provider, id };
    const plainProvider = JSON.parse(JSON.stringify(newProvider));
    providers.value.push(plainProvider);
    providerStore.save(plainProvider);
    return id;
  };

  const updateProvider = (id: string, provider: Partial<AIProvider>) => {
    const idx = providers.value.findIndex(p => p.id === id);
    if (idx > -1) {
      const updated = JSON.parse(JSON.stringify({ ...providers.value[idx], ...provider }));
      providers.value[idx] = updated;
      providerStore.save(updated);
    }
  };

  const deleteProvider = (id: string) => {
    providers.value = providers.value.filter(p => p.id !== id);
    providerStore.delete({ id });
    if (currentProviderId.value === id) {
      currentProviderId.value = '';
    }
  };

  const addPrompt = (prompt: Omit<AIPrompt, 'id'>) => {
    const id = `prompt_${Date.now()}`;
    const newPrompt = { ...prompt, id };
    const plainPrompt = JSON.parse(JSON.stringify(newPrompt));
    prompts.value.push(plainPrompt);
    promptStore.save(plainPrompt);
    return id;
  };

  const updatePrompt = (id: string, prompt: Partial<AIPrompt>) => {
    const idx = prompts.value.findIndex(p => p.id === id);
    if (idx > -1) {
      const updated = JSON.parse(JSON.stringify({ ...prompts.value[idx], ...prompt }));
      prompts.value[idx] = updated;
      promptStore.save(updated);
    }
  };

  const deletePrompt = (id: string) => {
    prompts.value = prompts.value.filter(p => p.id !== id);
    promptStore.delete({ id });
    if (currentPromptId.value === id) {
      currentPromptId.value = '';
    }
  };

  const saveSession = async (session: Omit<AIChatSession, 'id'> | AIChatSession) => {
    let id = (session as AIChatSession).id;
    if (!id) {
      id = `session_${Date.now()}`;
    }
    const newSession = { ...session, id, updateTime: new Date() };
    
    const existingIdx = sessions.value.findIndex(s => s.id === id);
    if (existingIdx > -1) {
      sessions.value[existingIdx] = newSession;
      // move to top
      sessions.value.splice(existingIdx, 1);
      sessions.value.unshift(newSession);
    } else {
      sessions.value.unshift(newSession); // add to top
    }
    
    await sessionStore.save(newSession);
    
    // Check limit (6 sessions)
    if (sessions.value.length > 6) {
      const oldest = sessions.value.pop();
      if (oldest) {
        await sessionStore.delete({ id: oldest.id });
      }
    }
    
    return id;
  };

  const deleteSession = async (id: string) => {
    sessions.value = sessions.value.filter(s => s.id !== id);
    await sessionStore.delete({ id });
  };

  return {
    providers,
    prompts,
    sessions,
    currentProviderId,
    currentPromptId,
    addProvider,
    updateProvider,
    deleteProvider,
    addPrompt,
    updatePrompt,
    deletePrompt,
    saveSession,
    deleteSession,
    loadData,
  };
}
