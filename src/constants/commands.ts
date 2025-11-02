export const CHAT_COMMANDS = {
  HELP: '/help',
  CLEAR: '/clear',
  EXIT: '/exit',
  CONFIG: '/config',
  HISTORY: '/history',
  SEARCH: '/search',
  INSTALL: '/install',
  COMPARE: '/compare',
  RESOLVE: '/resolve'
} as const;

export const COMMAND_DESCRIPTIONS = {
  [CHAT_COMMANDS.HELP]: 'Show available commands',
  [CHAT_COMMANDS.CLEAR]: 'Clear chat history',
  [CHAT_COMMANDS.EXIT]: 'Exit Dr. Node',
  [CHAT_COMMANDS.CONFIG]: 'Show current configuration',
  [CHAT_COMMANDS.HISTORY]: 'Show chat history',
  [CHAT_COMMANDS.SEARCH]: 'Search for packages',
  [CHAT_COMMANDS.INSTALL]: 'Install packages',
  [CHAT_COMMANDS.COMPARE]: 'Compare packages',
  [CHAT_COMMANDS.RESOLVE]: 'Resolve dependency conflicts'
} as const;
