import { LLMMessage, LLMResponse, LLMProvider } from '../../types';

export abstract class BaseLLMProvider {
  protected apiKey: string;
  protected model: string;
  protected provider: LLMProvider;

  constructor(apiKey: string, model: string, provider: LLMProvider) {
    this.apiKey = apiKey;
    this.model = model;
    this.provider = provider;
  }

  abstract chat(
    messages: LLMMessage[],
    systemPrompt?: string,
    temperature?: number
  ): Promise<LLMResponse>;

  abstract stream(
    messages: LLMMessage[],
    systemPrompt?: string,
    temperature?: number
  ): AsyncGenerator<string, void, unknown>;

  abstract validateKey(): Promise<boolean>;

  abstract getSupportedModels(): string[];

  protected buildMessages(messages: LLMMessage[], systemPrompt?: string): LLMMessage[] {
    const result: LLMMessage[] = [];
    
    if (systemPrompt) {
      result.push({
        role: 'system',
        content: systemPrompt
      });
    }
    
    result.push(...messages);
    return result;
  }

  protected validateMessages(messages: LLMMessage[]): void {
    if (!messages || messages.length === 0) {
      throw new Error('Messages array cannot be empty');
    }

    for (const message of messages) {
      if (!message.role || !message.content) {
        throw new Error('Each message must have role and content');
      }
      
      if (!['system', 'user', 'assistant'].includes(message.role)) {
        throw new Error('Invalid message role. Must be system, user, or assistant');
      }
    }
  }

  getProvider(): LLMProvider {
    return this.provider;
  }

  getModel(): string {
    return this.model;
  }

  setModel(model: string): void {
    if (!this.getSupportedModels().includes(model)) {
      throw new Error(`Model ${model} is not supported by ${this.provider}`);
    }
    this.model = model;
  }
}
