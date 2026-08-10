import { AIProtocol } from './types';
import { OpenAIProtocol } from './openai';
import { AnthropicProtocol } from './anthropic';
import { GeminiProtocol } from './gemini';

export * from './types';

export const getProtocol = (providerId: string): AIProtocol => {
  const normalizedId = providerId.toLowerCase();
  if (normalizedId === 'anthropic') {
    return AnthropicProtocol;
  }
  if (normalizedId === 'gemini') {
    return GeminiProtocol;
  }
  // Default to OpenAI compatible format for OpenAI, DeepSeek, Qwen, Moonshot, Zhipu, Ollama, Custom, etc.
  return OpenAIProtocol;
};

export const api = {
  fetchModels: async (providerId: string, apiKey: string, baseUrl: string) => {
    const protocol = getProtocol(providerId);
    return await protocol.fetchModels(apiKey, baseUrl);
  },
  chat: async (providerId: string, options: import('./types').ChatOptions, onUpdate: (chunk: string) => void) => {
    const protocol = getProtocol(providerId);
    return await protocol.chat(options, onUpdate);
  }
};
