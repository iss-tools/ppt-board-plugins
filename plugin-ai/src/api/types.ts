export interface AIChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | any[];
}

export interface ChatOptions {
  apiKey: string;
  baseUrl: string;
  model: string;
  messages: AIChatMessage[];
}

export interface AIProtocol {
  fetchModels(apiKey: string, baseUrl: string): Promise<string[]>;
  chat(options: ChatOptions, onUpdate: (chunk: string) => void): Promise<void>;
}
