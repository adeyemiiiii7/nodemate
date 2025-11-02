import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseLLMProvider } from './base-llm';
import { LLMMessage, LLMResponse } from '../../types';
import { PROVIDER_CONFIGS } from '../../constants/providers';

export class GeminiProvider extends BaseLLMProvider {
  private client: GoogleGenerativeAI;

  constructor(apiKey: string, model: string = PROVIDER_CONFIGS.gemini.defaultModel) {
    super(apiKey, model, 'gemini');
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async chat(
    messages: LLMMessage[],
    systemPrompt?: string,
    temperature: number = 0.7
  ): Promise<LLMResponse> {
    try {
      this.validateMessages(messages);
      
      const model = this.client.getGenerativeModel({ model: this.model });
      
      // Convert messages to Gemini format
      const history = this.convertMessagesToGeminiFormat(messages, systemPrompt);
      const lastMessage = messages[messages.length - 1];

      const chat = model.startChat({
        history: history.slice(0, -1), // All but the last message
        generationConfig: {
          temperature,
          maxOutputTokens: PROVIDER_CONFIGS.gemini.maxTokens
        }
      });

      const result = await chat.sendMessage(lastMessage.content);
      const response = await result.response;
      const text = response.text();

      return {
        content: text,
        usage: {
          promptTokens: 0, // Gemini doesn't provide token counts in the same way
          completionTokens: 0,
          totalTokens: 0
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Gemini API error: ${error.message}`);
      }
      throw new Error('Unknown Gemini API error');
    }
  }

  async *stream(
    messages: LLMMessage[],
    systemPrompt?: string,
    temperature: number = 0.7
  ): AsyncGenerator<string, void, unknown> {
    try {
      this.validateMessages(messages);
      
      const model = this.client.getGenerativeModel({ model: this.model });
      
      const history = this.convertMessagesToGeminiFormat(messages, systemPrompt);
      const lastMessage = messages[messages.length - 1];

      const chat = model.startChat({
        history: history.slice(0, -1),
        generationConfig: {
          temperature,
          maxOutputTokens: PROVIDER_CONFIGS.gemini.maxTokens
        }
      });

      const result = await chat.sendMessageStream(lastMessage.content);
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          yield chunkText;
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Gemini streaming error: ${error.message}`);
      }
      throw new Error('Unknown Gemini streaming error');
    }
  }

  async validateKey(): Promise<boolean> {
    try {
      const model = this.client.getGenerativeModel({ model: this.model });
      const result = await model.generateContent('Test');
      const response = await result.response;
      const text = response.text();
      return text.length > 0;
    } catch (error) {
      console.error('Gemini validation error:', error);
      return false;
    }
  }

  getSupportedModels(): string[] {
    return [...PROVIDER_CONFIGS.gemini.models];
  }

  private convertMessagesToGeminiFormat(messages: LLMMessage[], systemPrompt?: string) {
    const result: Array<{ role: 'user' | 'model'; parts: [{ text: string }] }> = [];
    
    // Add system prompt as first user message if provided
    if (systemPrompt) {
      result.push({
        role: 'user',
        parts: [{ text: `System: ${systemPrompt}` }]
      });
      result.push({
        role: 'model',
        parts: [{ text: 'Understood. I will follow these instructions.' }]
      });
    }

    for (const message of messages) {
      if (message.role === 'system') continue; // Already handled above
      
      result.push({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }]
      });
    }

    return result;
  }
}
