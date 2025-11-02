import Conf from 'conf';
import { DrNodeConfig, LLMProvider } from '../types';
import { DEFAULT_CONFIG, PROVIDER_CONFIGS } from '../constants/providers';

export class ConfigManager {
  private config: Conf<DrNodeConfig>;

  constructor() {
    this.config = new Conf<DrNodeConfig>({
      projectName: 'nodemate',
      defaults: {
        provider: DEFAULT_CONFIG.provider,
        apiKey: '',
        model: PROVIDER_CONFIGS[DEFAULT_CONFIG.provider].defaultModel,
        preferences: DEFAULT_CONFIG.preferences,
        providers: {
          openai: { model: PROVIDER_CONFIGS.openai.defaultModel },
          claude: { model: PROVIDER_CONFIGS.claude.defaultModel },
          gemini: { model: PROVIDER_CONFIGS.gemini.defaultModel },
          groq: { model: PROVIDER_CONFIGS.groq.defaultModel }
        }
      }
    });
  }

  hasConfig(): boolean {
    return this.config.has('apiKey') && this.config.get('apiKey') !== '';
  }

  getConfig(): DrNodeConfig {
    return this.config.store;
  }

  setProvider(provider: LLMProvider): void {
    this.config.set('provider', provider);
    this.config.set('model', PROVIDER_CONFIGS[provider].defaultModel);
  }

  setApiKey(provider: LLMProvider, apiKey: string): void {
    this.config.set('apiKey', apiKey);
    this.config.set(`providers.${provider}.apiKey`, apiKey);
  }

  setModel(provider: LLMProvider, model: string): void {
    this.config.set('model', model);
    this.config.set(`providers.${provider}.model`, model);
  }

  getApiKey(provider?: LLMProvider): string {
    const targetProvider = provider || this.config.get('provider');
    const providers = this.config.get('providers');
    return providers[targetProvider]?.apiKey || this.config.get('apiKey') || '';
  }

  getModel(provider?: LLMProvider): string {
    const targetProvider = provider || this.config.get('provider');
    const providers = this.config.get('providers');
    return providers[targetProvider]?.model || PROVIDER_CONFIGS[targetProvider].defaultModel;
  }

  getCurrentProvider(): LLMProvider {
    return this.config.get('provider');
  }

  setPreference<K extends keyof DrNodeConfig['preferences']>(
    key: K,
    value: DrNodeConfig['preferences'][K]
  ): void {
    const preferences = this.config.get('preferences');
    preferences[key] = value;
    this.config.set('preferences', preferences);
  }

  getPreference<K extends keyof DrNodeConfig['preferences']>(
    key: K
  ): DrNodeConfig['preferences'][K] {
    const preferences = this.config.get('preferences');
    return preferences[key];
  }

  reset(): void {
    this.config.clear();
  }

  getConfigPath(): string {
    return this.config.path;
  }
}

export const configManager = new ConfigManager();
