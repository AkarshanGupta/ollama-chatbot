const fetch = require('node-fetch');

class OllamaClient {
  constructor(baseUrl = process.env.OLLAMA_BASE_URL, model = process.env.OLLAMA_MODEL) {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async generateStream(prompt, onChunk, onError, onComplete) {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const reader = response.body;
      let buffer = '';

      reader.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              if (data.response) {
                onChunk(data.response);
              }
              if (data.done) {
                onComplete();
                return;
              }
            } catch (parseError) {
              console.error('Error parsing Ollama response:', parseError);
            }
          }
        }
      });

      reader.on('error', (error) => {
        onError(error);
      });

      reader.on('end', () => {
        onComplete();
      });

      return reader;
    } catch (error) {
      onError(error);
      throw error;
    }
  }

  async generate(prompt) {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
  }
}

module.exports = OllamaClient;