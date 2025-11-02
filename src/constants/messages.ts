export const WELCOME_MESSAGE = `
🤖 Welcome to NodeMate!
Your AI-powered Node.js package management assistant.

NodeMate helps you:
• Find and install the best packages for your project
• Resolve dependency conflicts
• Get AI-powered recommendations
• Compare similar packages
• Generate usage examples

Type 'chat' to start an interactive session or use --help for more options.
`;

export const FIRST_TIME_SETUP = `
🎉 Welcome to NodeMate!

It looks like this is your first time using NodeMate.
Let's set up your AI provider to get started.
`;

export const CONFIG_SUCCESS = `
✅ Configuration saved successfully!
You can now use NodeMate with your selected AI provider.

Try: nodemate chat
`;

export const CHAT_WELCOME = `
🤖 NodeMate Chat Mode

I'm here to help with your Node.js package management needs.
Ask me anything about packages, dependencies, or get recommendations!

Available commands:
• /help - Show all commands
• /config - View configuration  
• /exit - Exit chat mode

What can I help you with today?
`;

export const ERROR_MESSAGES = {
  NO_CONFIG: 'No configuration found. Please run: nodemate config',
  INVALID_API_KEY: 'Invalid API key. Please check your configuration.',
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  PROJECT_NOT_FOUND: 'No package.json found. Are you in a Node.js project?',
  PACKAGE_NOT_FOUND: 'Package not found in NPM registry.',
  INSTALL_FAILED: 'Package installation failed.',
  UNKNOWN_PROVIDER: 'Unknown AI provider. Supported: openai, claude, gemini, groq'
} as const;
