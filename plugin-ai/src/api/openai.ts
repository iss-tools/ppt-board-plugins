import { AIProtocol, ChatOptions } from './types';

export const OpenAIProtocol: AIProtocol = {
  async fetchModels(apiKey: string, baseUrl: string): Promise<string[]> {
    let url = baseUrl.trim();
    if (url.endsWith('/chat/completions')) {
      url = url.replace('/chat/completions', '');
    } else if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }

    const res = await fetch(`${url}/models`, {
      headers: {
        'Authorization': apiKey ? `Bearer ${apiKey}` : ''
      }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const data = await res.json();

    if (data && data.data && Array.isArray(data.data)) {
      return data.data.map((m: any) => m.id);
    } else if (data && data.models && Array.isArray(data.models)) {
      // Ollama format compatibility
      return data.models.map((m: any) => m.name);
    }
    
    throw new Error('未知的模型列表格式 (Unknown model list format)');
  },

  async chat(options: ChatOptions, onUpdate: (chunk: string) => void): Promise<void> {
    let url = options.baseUrl.trim();
    if (!url.endsWith('/chat/completions')) {
      url = url.endsWith('/') ? `${url}chat/completions` : `${url}/chat/completions`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${options.apiKey}`
      },
      body: JSON.stringify({
        model: options.model,
        messages: options.messages,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder('utf-8');
    if (!reader) throw new Error('No readable stream');

    let hasStartedReasoning = false;
    let hasFinishedReasoning = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.trim().startsWith('data: ')) {
          const dataStr = line.replace('data: ', '').trim();
          if (dataStr === '[DONE]') break;
          try {
            const data = JSON.parse(dataStr);
            if (data.choices && data.choices[0].delta) {
              const delta = data.choices[0].delta;
              
              if (delta.reasoning_content) {
                if (!hasStartedReasoning) {
                  onUpdate('<think>\n');
                  hasStartedReasoning = true;
                }
                onUpdate(delta.reasoning_content);
              }
              
              if (delta.content !== undefined && delta.content !== null) {
                if (hasStartedReasoning && !hasFinishedReasoning) {
                  onUpdate('\n</think>\n');
                  hasFinishedReasoning = true;
                }
                onUpdate(delta.content);
              }
            }
          } catch (e) {
            // ignore parse errors for partial chunks
          }
        }
      }
    }
  }
};
