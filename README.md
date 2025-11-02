# 🤖 NodeMate

Your intelligent AI assistant for Node.js package management

NodeMate is an AI-powered CLI tool that revolutionizes how you discover, evaluate, and install packages from NPM. Say goodbye to dependency hell and hello to smart, context-aware package recommendations for Express, NestJS, and vanilla Node.js projects.

## 🚀 Installation

### Prerequisites
- Node.js 16.0.0 or higher
- AI API key (OpenAI, Claude, Gemini, or Groq)

### Install Globally
```bash
npm install -g nodemate
```

### Set Up API Key
```bash
nodemate config  # Interactive setup
```

## 📖 Usage

### Quick Start
Navigate to your Node.js project:

```bash
cd your-project
nodemate chat
```

Then ask NodeMate anything:

```
You > I need authentication for my Express app
AI > I'll help you find the best authentication package...

[AI analyzes your project and recommends options]

You > install passport
AI > Installing passport with compatibility checks...
✓ Package installed successfully!
```

### Command Reference
```bash
# Start interactive chat mode
nodemate chat

# Configure AI provider
nodemate config

# Get help
nodemate --help

# Check version
nodemate --version
```

### Interactive Commands
Inside chat mode, use these commands:

```
/help - Show available commands
/search <package> - Search for packages
/config - Show current configuration
/clear - Clear conversation history
/exit - Exit chat mode
```

## 💡 Examples

### Example 1: Finding a Package
```
You > I need a logging library for my TypeScript Express app
AI > Let me search for logging packages for you...

Found top candidates:
1. winston - Most popular logging library
   - Weekly Downloads: 8.2M
   - TypeScript Support: ✓
   - GitHub Stars: 22.1k

2. pino - High performance logger
   - Weekly Downloads: 2.1M  
   - TypeScript Support: ✓
   - GitHub Stars: 13.8k

Based on your Express TypeScript setup, I recommend winston for 
feature-rich logging or pino for high performance. Which would you prefer?
```

### Example 2: Resolving Conflicts
```
You > resolve my dependency conflicts
AI > Checking compatibility...

⚠ Detected issue: @types/node requires typescript ^4.0.0 
  but your project uses typescript ^5.2.0

Analyzing solutions...
✓ Solution found: Update @types/node to ^20.10.0

This version is compatible with TypeScript 5.2.0.

AI > Updating @types/node to ^20.10.0...
✓ Running npm install...
✓ Installation successful!
```

### Example 3: Getting Package Information
```
You > tell me about express-rate-limit
AI > Fetching information about express-rate-limit...

Package: express-rate-limit
Version: 7.1.5
Weekly Downloads: 1.2M
GitHub Stars: 2.8k

Description: Basic rate-limiting middleware for Express. 
Use to limit repeated requests to public APIs and/or endpoints.

Homepage: https://express-rate-limit.mintlify.app
Repository: https://github.com/express-rate-limit/express-rate-limit

Dependencies: None (0 dependencies)
TypeScript Support: ✓ Built-in types

AI > Would you like to install this package?
```

### Example 4: Comparing Packages
```
You > compare passport vs auth0 for authentication
AI > Comparing authentication solutions...

📊 Passport vs Auth0:

**Passport**
✓ Self-hosted, full control
✓ 500+ authentication strategies  
✓ Lightweight and flexible
✗ More setup required
✗ You handle security updates

**Auth0**
✓ Managed service, less maintenance
✓ Built-in security features
✓ Easy social login integration  
✗ External dependency
✗ Pricing for scale

For your Express app: Use Passport if you want full control 
and have security expertise. Use Auth0 if you prefer a 
managed solution with less maintenance overhead.
```

## 🤖 AI Providers

NodeMate supports multiple AI providers:

- **OpenAI**: GPT-4 Turbo, GPT-4, GPT-3.5 Turbo
- **Anthropic Claude**: Claude 3.5 Sonnet, Claude 3 Opus  
- **Google Gemini**: Gemini 2.5 Flash, Gemini 2.5 Pro
- **Groq**: Llama 3.3 70B, Llama 3.1 70B (Ultra-fast inference)

## 🎯 Smart Context Detection

NodeMate automatically analyzes your project:

- **Framework**: Express.js, NestJS, vanilla Node.js
- **Package Manager**: npm, pnpm, yarn
- **TypeScript**: Configuration and support
- **Dependencies**: Current packages and versions
- **Node Version**: Runtime compatibility

## 📝 License

MIT License

## 🐛 Issues

Report issues on GitHub: [Issues](https://github.com/your-repo/nodemate/issues)

