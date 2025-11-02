import inquirer from 'inquirer';
import { configManager } from '../utils/config-manager';
import { Logger } from '../utils/logger';
import { spinner } from '../utils/spinner';
import { LLMFactory } from '../services/llm/llm-factory';
import { PROVIDER_CONFIGS, SUPPORTED_PROVIDERS } from '../constants/providers';
import { CONFIG_SUCCESS, ERROR_MESSAGES } from '../constants/messages';
import { LLMProvider } from '../types';

export async function configCommand(): Promise<void> {
  try {
    Logger.info('Setting up NodeMate configuration...');
    
    // Show current config if it exists
    if (configManager.hasConfig()) {
      const currentConfig = configManager.getConfig();
      Logger.info(`Current provider: ${currentConfig.provider}`);
      
      const { shouldReconfigure } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldReconfigure',
          message: 'Configuration already exists. Do you want to reconfigure?',
          default: false
        }
      ]);
      
      if (!shouldReconfigure) {
        return;
      }
    }

    // Select provider
    const { provider } = await inquirer.prompt([
      {
        type: 'list',
        name: 'provider',
        message: 'Select your AI provider:',
        choices: SUPPORTED_PROVIDERS.map(p => ({
          name: `${PROVIDER_CONFIGS[p].name} (${p})`,
          value: p
        }))
      }
    ]);

    // Get API key
    const providerConfig = PROVIDER_CONFIGS[provider as LLMProvider];
    const { apiKey } = await inquirer.prompt([
      {
        type: 'password',
        name: 'apiKey',
        message: `Enter your ${providerConfig.name} API key:`,
        validate: (input: string) => {
          if (!input.trim()) {
            return 'API key is required';
          }
          if (!LLMFactory.validateApiKeyFormat(provider, input.trim())) {
            return `Invalid API key format. Expected format: ${providerConfig.keyFormat}...`;
          }
          return true;
        }
      }
    ]);

    // Select model
    const { model } = await inquirer.prompt([
      {
        type: 'list',
        name: 'model',
        message: `Select ${providerConfig.name} model:`,
        choices: providerConfig.models.map(m => ({
          name: m === providerConfig.defaultModel ? `${m} (recommended)` : m,
          value: m
        })),
        default: providerConfig.defaultModel
      }
    ]);

    // Validate API key
    spinner.start(`Validating ${providerConfig.name} API key...`);
    
    try {
      const isValid = await LLMFactory.validateProvider(provider, apiKey.trim(), model);
      
      if (!isValid) {
        spinner.fail('API key validation failed');
        Logger.error('Invalid API key or insufficient permissions');
        return;
      }
      
      spinner.succeed('API key validated successfully');
    } catch (error) {
      spinner.fail('API key validation failed');
      Logger.error(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return;
    }

    // Configure preferences
    const preferences = await inquirer.prompt([
      {
        type: 'list',
        name: 'packageManager',
        message: 'Preferred package manager:',
        choices: [
          { name: 'Auto-detect (recommended)', value: 'auto' },
          { name: 'npm', value: 'npm' },
          { name: 'pnpm', value: 'pnpm' },
          { name: 'yarn', value: 'yarn' }
        ],
        default: 'auto'
      },
      {
        type: 'confirm',
        name: 'showThinking',
        message: 'Show AI thinking process?',
        default: true
      },
      {
        type: 'confirm',
        name: 'colorOutput',
        message: 'Enable colored output?',
        default: true
      }
    ]);

    // Save configuration
    configManager.setProvider(provider);
    configManager.setApiKey(provider, apiKey.trim());
    configManager.setModel(provider, model);
    
    configManager.setPreference('packageManager', preferences.packageManager);
    configManager.setPreference('showThinking', preferences.showThinking);
    configManager.setPreference('colorOutput', preferences.colorOutput);

    // Update logger color setting
    Logger.setColorOutput(preferences.colorOutput);

    Logger.success(CONFIG_SUCCESS);
    Logger.info(`Configuration saved to: ${configManager.getConfigPath()}`);
    
  } catch (error) {
    Logger.error(`Configuration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function showConfig(): Promise<void> {
  if (!configManager.hasConfig()) {
    Logger.warning('No configuration found. Run: nodemate config');
    return;
  }

  const config = configManager.getConfig();
  const providerConfig = PROVIDER_CONFIGS[config.provider];

  console.log(`
📋 NodeMate Configuration:

Provider: ${providerConfig.name} (${config.provider})
Model: ${config.model}
API Key: ${config.apiKey.substring(0, 8)}...

Preferences:
• Package Manager: ${config.preferences.packageManager}
• Show Thinking: ${config.preferences.showThinking ? 'Yes' : 'No'}
• Color Output: ${config.preferences.colorOutput ? 'Yes' : 'No'}

Config Path: ${configManager.getConfigPath()}
  `.trim());
}
