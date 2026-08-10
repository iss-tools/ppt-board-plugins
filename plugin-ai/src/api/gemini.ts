import { AIProtocol, ChatOptions } from './types';

export const GeminiProtocol: AIProtocol = {
  async fetchModels(apiKey: string, baseUrl: string): Promise<string[]> {
    let url = baseUrl.trim();
    if (url.endsWith('/')) url = url.slice(0, -1);
    
    // Gemini standard base: https://generativelanguage.googleapis.com
    // Endpoint: /v1beta/models
    if (!url.includes('/v1beta/models')) {
       url = `${url}/v1beta/models`;
    }

    const res = await fetch(`${url}?key=${apiKey}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    
    const data = await res.json();
    if (data && data.models && Array.isArray(data.models)) {
      // Return model IDs (e.g., 'gemini-1.5-pro') by stripping 'models/' prefix
      return data.models.map((m: any) => m.name.replace('models/', ''));
    }
    
    throw new Error('未知的模型列表格式');
  },

  async chat(options: ChatOptions, onUpdate: (chunk: string) => void): Promise<void> {
    let url = options.baseUrl.trim();
    if (url.endsWith('/')) url = url.slice(0, -1);

    // Format: https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent?key={key}
    // Remove /v1beta/models if user provided it to avoid duplication
    if (url.endsWith('/v1beta/models')) {
      url = url.replace('/v1beta/models', '');
    }
    
    let modelName = options.model;
    if (modelName.startsWith('models/')) {
        modelName = modelName.replace('models/', '');
    }

    const endpoint = `${url}/v1beta/models/${modelName}:streamGenerateContent?key=${options.apiKey}`;

    // Format messages
    const contents: any[] = [];
    let systemInstruction: any = undefined;

    options.messages.forEach((m) => {
      if (m.role === 'system') {
        if (typeof m.content === 'string') {
          systemInstruction = { parts: [{ text: m.content }] };
        }
      } else {
        const parts: any[] = [];
        if (Array.isArray(m.content)) {
          m.content.forEach((part) => {
            if (part.type === 'text') {
              parts.push({ text: part.text });
            } else if (part.type === 'image_url' && part.image_url?.url) {
              // Extract mimeType and base64 from data URI
              const match = part.image_url.url.match(/^data:(image\/[a-z]+);base64,(.*)$/);
              if (match) {
                parts.push({
                  inlineData: {
                    mimeType: match[1],
                    data: match[2]
                  }
                });
              }
            }
          });
        } else {
          parts.push({ text: m.content });
        }
        
        contents.push({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts
        });
      }
    });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder('utf-8');
    if (!reader) throw new Error('No readable stream');

    // Gemini streaming format is a JSON array of objects with 'candidates'
    // It's sent in chunks, but we need to parse pieces. 
    // Usually it streams JSON array like: [ { ... }, { ... } ]
    // Each chunk might be part of JSON.
    // However, Gemini REST API uses SSE format if you append `alt=sse` to the url!
    // Let's use alt=sse because it's much easier to parse.
    const sseEndpoint = `${endpoint}&alt=sse`;
    
    const sseResponse = await fetch(sseEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, systemInstruction })
    });

    if (!sseResponse.ok) {
      throw new Error(`HTTP ${sseResponse.status}: ${await sseResponse.text()}`);
    }

    const sseReader = sseResponse.body?.getReader();
    if (!sseReader) return;

    while (true) {
      const { done, value } = await sseReader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.trim().startsWith('data: ')) {
          const dataStr = line.replace('data: ', '').trim();
          try {
            const data = JSON.parse(dataStr);
            if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
              const textChunk = data.candidates[0].content.parts.map((p: any) => p.text).join('');
              if (textChunk) onUpdate(textChunk);
            }
          } catch (e) {
            // ignore
          }
        }
      }
    }
  }
};
