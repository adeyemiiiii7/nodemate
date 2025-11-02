import Groq from 'groq-sdk';
import { BaseLLMProvider } from './base-llm';
import { LLMMessage, LLMResponse } from '../../types';
import { PROVIDER_CONFIGS } from '../../constants/providers';

export class GroqProvider extends BaseLLMProvider {
  private client: Groq;

  constructor(apiKey: string, model: string = PROVIDER_CONFIGS.groq.defaultModel) {
    super(apiKey, model, 'groq');
    this.client = new Groq({ apiKey });
  }

  async chat(
    messages: LLMMessage[],
    systemPrompt?: string,
    temperature: number = 0.7
  ): Promise<LLMResponse> {
    try {
      this.validateMessages(messages);
      const formattedMessages = this.buildMessages(messages, systemPrompt);

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: formattedMessages.map(msg => ({
          role: msg.role as 'system' | 'user' | 'assistant',
          content: msg.content
        })),
        temperature,
        max_tokens: PROVIDER_CONFIGS.groq.maxTokens
      });

      const choice = response.choices[0];
      if (!choice?.message?.content) {
        throw new Error('No response content received from Groq');
      }

      return {
        content: choice.message.content,
        usage: response.usage ? {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens
        } : undefined
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Groq API error: ${error.message}`);
      }
      throw new Error('Unknown Groq API error');
    }
  }

  async *stream(
    messages: LLMMessage[],
    systemPrompt?: string,
    temperature: number = 0.7
  ): AsyncGenerator<string, void, unknown> {
    try {
      this.validateMessages(messages);
      const formattedMessages = this.buildMessages(messages, systemPrompt);

      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages: formattedMessages.map(msg => ({
          role: msg.role as 'system' | 'user' | 'assistant',
          content: msg.content
        })),
        temperature,
        max_tokens: PROVIDER_CONFIGS.groq.maxTokens,
        stream: true
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Groq streaming error: ${error.message}`);
      }
      throw new Error('Unknown Groq streaming error');
    }
  }

  async validateKey(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch (error) {
      return false;
    }
  }

  getSupportedModels(): string[] {
    return [...PROVIDER_CONFIGS.groq.models];
  }
}
