import Anthropic from '@anthropic-ai/sdk';
import { BaseLLMProvider } from './base-llm';
import { LLMMessage, LLMResponse } from '../../types';
import { PROVIDER_CONFIGS } from '../../constants/providers';

export class ClaudeProvider extends BaseLLMProvider {
  private client: Anthropic;

  constructor(apiKey: string, model: string = PROVIDER_CONFIGS.claude.defaultModel) {
    super(apiKey, model, 'claude');
    this.client = new Anthropic({ apiKey });
  }

  async chat(
    messages: LLMMessage[],
    systemPrompt?: string,
    temperature: number = 0.7
  ): Promise<LLMResponse> {
    try {
      this.validateMessages(messages);
      
      // Claude API expects system prompt separately
      const systemMessage = systemPrompt || '';
      const userMessages = messages.filter(msg => msg.role !== 'system');

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: PROVIDER_CONFIGS.claude.maxTokens,
        temperature,
        system: systemMessage,
        messages: userMessages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      return {
        content: content.text,
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Claude API error: ${error.message}`);
      }
      throw new Error('Unknown Claude API error');
    }
  }

  async *stream(
    messages: LLMMessage[],
    systemPrompt?: string,
    temperature: number = 0.7
  ): AsyncGenerator<string, void, unknown> {
    try {
      this.validateMessages(messages);
      
      const systemMessage = systemPrompt || '';
      const userMessages = messages.filter(msg => msg.role !== 'system');

      const stream = await this.client.messages.create({
        model: this.model,
        max_tokens: PROVIDER_CONFIGS.claude.maxTokens,
        temperature,
        system: systemMessage,
        messages: userMessages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        stream: true
      });

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          yield chunk.delta.text;
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Claude streaming error: ${error.message}`);
      }
      throw new Error('Unknown Claude streaming error');
    }
  }

  async validateKey(): Promise<boolean> {
    try {
      // Test with a minimal request
      await this.client.messages.create({
        model: this.model,
        max_tokens: 1,
        messages: [{ role: 'user', content: 'Hi' }]
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  getSupportedModels(): string[] {
    return [...PROVIDER_CONFIGS.claude.models];
  }
}
