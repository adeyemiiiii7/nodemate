import inquirer from 'inquirer';
import { configManager } from '../utils/config-manager';
import { Logger } from '../utils/logger';
import { spinner } from '../utils/spinner';
import { LLMFactory } from '../services/llm/llm-factory';
import { NPMService } from '../services/npm-service';
import { ProjectContextService } from '../services/project-context';
import { SystemPromptBuilder } from '../prompts/system-prompt';
import { TableFormatter } from '../utils/table-formatter';
import { CHAT_WELCOME } from '../constants/messages';
import { CHAT_COMMANDS, COMMAND_DESCRIPTIONS } from '../constants/commands';
import { LLMMessage, ProjectContext } from '../types';

export async function chatCommand(): Promise<void> {
  try {
    // Initialize services
    const config = configManager.getConfig();
    const llmProvider = LLMFactory.create(
      config.provider,
      configManager.getApiKey(),
      configManager.getModel()
    );
    const npmService = new NPMService();
    const contextService = new ProjectContextService();

    // Detect project context
    spinner.start('Analyzing project context...');
    let projectContext: ProjectContext;
    
    try {
      projectContext = await contextService.detectContext();
      spinner.succeed('Project context detected');
      
      if (config.preferences.showThinking) {
        console.log(contextService.generateContextSummary(projectContext));
      }
    } catch (error) {
      spinner.warn('Could not detect project context - using defaults');
      projectContext = {
        framework: 'unknown',
        packageManager: 'npm',
        nodeVersion: 'unknown',
        hasTypeScript: false,
        dependencies: {},
        devDependencies: {},
        projectPath: process.cwd(),
        packageJsonPath: ''
      };
    }

    // Build system prompt
    const systemPrompt = SystemPromptBuilder.buildMainPrompt(projectContext);
    
    // Chat history
    const chatHistory: LLMMessage[] = [];

    console.log(CHAT_WELCOME);

    // Main chat loop
    while (true) {
      const { userInput } = await inquirer.prompt([
        {
          type: 'input',
          name: 'userInput',
          message: '💬',
          validate: (input: string) => {
            if (!input.trim()) {
              return 'Please enter a message';
            }
            return true;
          }
        }
      ]);

      const input = userInput.trim();

      // Handle chat commands
      if (input.startsWith('/')) {
        const handled = await handleChatCommand(input, projectContext, npmService);
        if (handled === 'exit') {
          break;
        }
        continue;
      }

      // Add user message to history
      chatHistory.push({
        role: 'user',
        content: input
      });

      try {
        // Show thinking if enabled
        if (config.preferences.showThinking) {
          spinner.start('Dr. Node is thinking...');
        }

        // Get AI response
        const response = await llmProvider.chat(chatHistory, systemPrompt);
        
        if (config.preferences.showThinking) {
          spinner.stop();
        }

        // Display response
        Logger.ai(response.content);

        // Add assistant response to history
        chatHistory.push({
          role: 'assistant',
          content: response.content
        });

        // Keep chat history manageable (last 10 exchanges)
        if (chatHistory.length > 20) {
          chatHistory.splice(0, chatHistory.length - 20);
        }

      } catch (error) {
        if (config.preferences.showThinking) {
          spinner.fail('Error getting AI response');
        }
        Logger.error(`AI Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    Logger.info('Thanks for using Dr. Node! 👋');

  } catch (error) {
    Logger.error(`Chat error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleChatCommand(
  command: string, 
  context: ProjectContext, 
  npmService: NPMService
): Promise<string | void> {
  const [cmd, ...args] = command.split(' ');

  switch (cmd) {
    case CHAT_COMMANDS.HELP:
      console.log('\n📋 Available Commands:');
      console.log(TableFormatter.formatCommands(COMMAND_DESCRIPTIONS));
      break;

    case CHAT_COMMANDS.CLEAR:
      console.clear();
      console.log(CHAT_WELCOME);
      break;

    case CHAT_COMMANDS.EXIT:
      return 'exit';

    case CHAT_COMMANDS.CONFIG:
      const config = configManager.getConfig();
      console.log(`
🔧 Current Configuration:
• Provider: ${config.provider}
• Model: ${config.model}
• Package Manager: ${config.preferences.packageManager}
• Show Thinking: ${config.preferences.showThinking}
• Color Output: ${config.preferences.colorOutput}
      `.trim());
      break;

    case CHAT_COMMANDS.SEARCH:
      if (args.length === 0) {
        Logger.warning('Usage: /search <package-name>');
        break;
      }
      
      const query = args.join(' ');
      spinner.start(`Searching for "${query}"...`);
      
      try {
        const results = await npmService.searchPackages(query, 5);
        spinner.succeed(`Found ${results.packages.length} packages`);
        
        if (results.packages.length > 0) {
          console.log(TableFormatter.formatPackageComparison(results.packages));
        } else {
          Logger.warning('No packages found');
        }
      } catch (error) {
        spinner.fail('Search failed');
        Logger.error(`Search error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      break;

    case CHAT_COMMANDS.RESOLVE:
      Logger.info('Dependency conflict resolution coming soon...');
      break;

    default:
      Logger.warning(`Unknown command: ${cmd}`);
      Logger.info('Type /help for available commands');
  }
}
