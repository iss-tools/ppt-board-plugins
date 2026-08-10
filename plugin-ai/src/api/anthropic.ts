import { AIProtocol, ChatOptions, AIChatMessage } from './types';

export const AnthropicProtocol: AIProtocol = {
  async fetchModels(apiKey: string, baseUrl: string): Promise<string[]> {
    // Anthropic API generally does not provide a public /v1/models endpoint that works with standard API keys.
    // We return a hardcoded list of common models. If the user uses a proxy (like OneAPI), they might support /v1/models.
    // Let's try fetching first, if it fails, fallback to hardcoded.
    let url = baseUrl.trim();
    if (url.endsWith('/messages') || url.endsWith('/v1/messages')) {
      url = url.split('/messages')[0];
    } else if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }

    try {
      const res = await fetch(`${url}/models`, {
        headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.data && Array.isArray(data.data)) {
          return data.data.map((m: any) => m.id);
        }
      }
    } catch (e) {
      // ignore
    }

    // Fallback standard models
    return [
      'claude-3-5-sonnet-20240620',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307'
    ];
  },

  async chat(options: ChatOptions, onUpdate: (chunk: string) => void): Promise<void> {
    let url = options.baseUrl.trim();
    if (!url.endsWith('/messages')) {
      url = url.endsWith('/') ? `${url}messages` : `${url}/messages`;
    }

    // Anthropic format expects 'system' at the top level, not in messages
    let systemPrompt = '';
    const anthropicMessages: any[] = [];
    
    options.messages.forEach((m) => {
      if (m.role === 'system') {
        if (typeof m.content === 'string') systemPrompt += m.content + '\n';
      } else {
        // Map roles. Anthropic only supports user/assistant
        anthropicMessages.push({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        });
      }
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': options.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: options.model,
        messages: anthropicMessages,
        system: systemPrompt ? systemPrompt : undefined,
        stream: true,
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder('utf-8');
    if (!reader) throw new Error('No readable stream');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.trim().startsWith('data: ')) {
          const dataStr = line.replace('data: ', '').trim();
          try {
            const data = JSON.parse(dataStr);
            if (data.type === 'content_block_delta' && data.delta && data.delta.text) {
              onUpdate(data.delta.text);
            }
          } catch (e) {
            // ignore
          }
        }
      }
    }
  }
};
