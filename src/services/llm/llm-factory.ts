import { LLMProvider } from '../../types';
import { BaseLLMProvider } from './base-llm';
import { OpenAIProvider } from './openai-provider';
import { ClaudeProvider } from './claude-provider';
import { GeminiProvider } from './gemini-provider';
import { GroqProvider } from './groq-provider';
import { PROVIDER_CONFIGS } from '../../constants/providers';

export class LLMFactory {
  static create(provider: LLMProvider, apiKey: string, model?: string): BaseLLMProvider {
    if (!apiKey) {
      throw new Error(`API key is required for ${provider}`);
    }

    const defaultModel = model || PROVIDER_CONFIGS[provider].defaultModel;

    switch (provider) {
      case 'openai':
        return new OpenAIProvider(apiKey, defaultModel);
      
      case 'claude':
        return new ClaudeProvider(apiKey, defaultModel);
      
      case 'gemini':
        return new GeminiProvider(apiKey, defaultModel);
      
      case 'groq':
        return new GroqProvider(apiKey, defaultModel);
      
      default:
        throw new Error(`Unsupported LLM provider: ${provider}`);
    }
  }

  static getSupportedProviders(): LLMProvider[] {
    return ['openai', 'claude', 'gemini', 'groq'];
  }

  static getProviderConfig(provider: LLMProvider) {
    return PROVIDER_CONFIGS[provider];
  }

  static validateApiKeyFormat(provider: LLMProvider, apiKey: string): boolean {
    const config = PROVIDER_CONFIGS[provider];
    return apiKey.startsWith(config.keyFormat);
  }

  static async validateProvider(provider: LLMProvider, apiKey: string, model?: string): Promise<boolean> {
    try {
      const llmProvider = this.create(provider, apiKey, model);
      return await llmProvider.validateKey();
    } catch (error) {
      return false;
    }
  }
}
