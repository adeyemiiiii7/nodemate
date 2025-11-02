import { Command } from 'commander';
import { configManager } from './utils/config-manager';
import { Logger } from './utils/logger';
import { WELCOME_MESSAGE, FIRST_TIME_SETUP } from './constants/messages';
import { configCommand } from './commands/config';
import { chatCommand } from './commands/chat';
import { updateCommand } from './commands/update';

const program = new Command();

async function main() {
  program
    .name('nodemate')
    .description('AI-powered CLI assistant for Node.js package management')
    .version('1.0.0');

  // Config command
  program
    .command('config')
    .description('Configure NodeMate with your AI provider')
    .action(async () => {
      await configCommand();
    });

  // Chat command
  program
    .command('chat')
    .description('Start interactive chat mode')
    .action(async () => {
      if (!configManager.hasConfig()) {
        Logger.error('No configuration found. Please run: nodemate config');
        process.exit(1);
      }
      await chatCommand();
    });

  // Update command
  program
    .command('update')
    .description('Update NodeMate to the latest version')
    .action(async () => {
      await updateCommand();
    });

  // Default action when no command is provided
  program.action(async () => {
    if (!configManager.hasConfig()) {
      console.log(FIRST_TIME_SETUP);
      await configCommand();
    } else {
      console.log(WELCOME_MESSAGE);
      Logger.info('Configuration found. Use "nodemate chat" to start or "nodemate --help" for more options.');
    }
  });

  // Parse command line arguments
  await program.parseAsync(process.argv);
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  Logger.error(`Uncaught exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  Logger.error(`Unhandled rejection: ${reason}`);
  process.exit(1);
});

// Run the CLI
main().catch((error) => {
  Logger.error(`Fatal error: ${error.message}`);
  process.exit(1);
});