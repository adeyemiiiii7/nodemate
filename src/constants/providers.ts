import { LLMProvider } from '../types';

/**
 * Configuration for all supported LLM providers
 * Updated November 2025 with latest model names
 */

export const PROVIDER_CONFIGS = {
  openai: {
    name: 'OpenAI',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    models: [
      'gpt-4-turbo-preview',
      'gpt-4',
      'gpt-3.5-turbo',
      'gpt-4o',
      'gpt-4o-mini'
    ],
    defaultModel: 'gpt-4-turbo-preview',
    keyFormat: 'sk-',
    maxTokens: 4096
  },
  
  claude: {
    name: 'Anthropic Claude',
    apiUrl: 'https://api.anthropic.com/v1/messages',
    models: [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307'
    ],
    defaultModel: 'claude-3-5-sonnet-20241022',
    keyFormat: 'sk-ant-',
    maxTokens: 4096
  },
  
  gemini: {
    name: 'Google Gemini',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta',
    // UPDATED: Current Gemini models (November 2025)
    models: [
      'gemini-2.5-flash',           // Latest stable, fast and efficient
      'gemini-2.5-flash-lite',      // Lightweight version
      'gemini-2.5-pro',             // Most powerful for complex tasks
      'gemini-2.0-flash-exp',       // Experimental 2.0 version
      'gemini-1.5-pro',             // Legacy (being phased out)
      'gemini-1.5-flash'            // Legacy (being phased out)
    ],
    defaultModel: 'gemini-2.5-flash', // UPDATED: Latest recommended model
    keyFormat: 'AI',
    maxTokens: 8192
  },
  
  groq: {
    name: 'Groq',
    apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
    models: [
      'llama-3.3-70b-versatile',
      'llama-3.1-70b-versatile',
      'llama-3.1-8b-instant',
      'mixtral-8x7b-32768',
      'gemma2-9b-it'
    ],
    defaultModel: 'llama-3.3-70b-versatile',
    keyFormat: 'gsk_',
    maxTokens: 8192
  }
} as const;

export const SUPPORTED_PROVIDERS: LLMProvider[] = [
  'openai',
  'claude',
  'gemini',
  'groq'
];

export const DEFAULT_CONFIG = {
  provider: 'openai' as LLMProvider,
  preferences: {
    packageManager: 'auto' as const,
    autoInstall: false,
    showThinking: true,
    colorOutput: true
  }
};

/**
 * Model recommendations based on use case
 */
export const MODEL_RECOMMENDATIONS = {
  fastest: {
    openai: 'gpt-3.5-turbo',
    claude: 'claude-3-5-haiku-20241022',
    gemini: 'gemini-2.5-flash-lite',
    groq: 'llama-3.1-8b-instant'
  },
  balanced: {
    openai: 'gpt-4-turbo-preview',
    claude: 'claude-3-5-sonnet-20241022',
    gemini: 'gemini-2.5-flash',
    groq: 'llama-3.3-70b-versatile'
  },
  powerful: {
    openai: 'gpt-4',
    claude: 'claude-3-opus-20240229',
    gemini: 'gemini-2.5-pro',
    groq: 'llama-3.3-70b-versatile'
  }
} as const;

/**
 * Important notes about models (November 2025):
 * 
 * GEMINI:
 * - Gemini 1.0 and 1.5 models are being retired
 * - Use Gemini 2.5 Flash for most use cases (fast, efficient)
 * - Use Gemini 2.5 Pro for complex reasoning tasks
 * - All Gemini 2.5 models support multimodal input
 * 
 * CLAUDE:
 * - Claude 3.5 Sonnet is the latest and most capable
 * - Claude 3.5 Haiku is fastest for simple tasks
 * 
 * OPENAI:
 * - GPT-4 Turbo is recommended for most cases
 * - GPT-4o offers multimodal capabilities
 * 
 * GROQ:
 * - Llama 3.3 70B is the latest and most powerful
 * - Extremely fast inference
 */
