# 🚀 NodeMate Development Setup

## Quick Development Setup

### 1. Clone and Install
```bash
git clone <repository>
cd nodemate
npm install
```

### 2. Set Up Environment
```bash
# Copy environment template
cp .env.example .env

# Add your API keys to .env
# Get keys from:
# - OpenAI: https://platform.openai.com/api-keys
# - Claude: https://console.anthropic.com/
# - Gemini: https://aistudio.google.com/app/apikey
# - Groq: https://console.groq.com/keys
```

### 3. Development Commands
```bash
# Run in development mode
npm run dev config  # Configure
npm run dev chat    # Start chat

# Build and test
npm run build
npm test
npm run lint
```

## Testing the CLI

### Configuration Test
```bash
npm run dev config
# Select provider → Enter API key → Choose model → Set preferences
```

### Chat Mode Test
```bash
npm run dev chat

# Try these commands:
💬 I need authentication for my Express app
💬 /search winston
💬 /help
💬 /exit
```

## Project Structure

```
dr-node/
├── src/
│   ├── commands/          # CLI command handlers
│   ├── services/          # Business logic
│   │   ├── llm/          # AI provider implementations
│   │   └── npm-service.ts # NPM integration
│   ├── utils/            # Utilities (logger, config, etc.)
│   └── types/           # TypeScript definitions
├── bin/dr-node.js        # CLI entry point
└── tests/               # Unit tests
```

## Available Scripts

```bash
npm run dev        # Development mode with tsx
npm run build      # Build TypeScript to dist/
npm run test       # Run Jest tests
npm run lint       # ESLint code checking
npm start          # Run built version
```

## Configuration

Development config is stored in:
- `~/.config/nodemate/config.json` (user config)
- `.env` (development environment variables)

## Troubleshooting

### Build Issues
```bash
rm -rf dist node_modules
npm install
npm run build
```

### API Key Issues
- Check `.env` file has correct format
- Verify API key permissions and quota
- Test with `npm run dev config`

### TypeScript Errors
```bash
npm run lint  # Check for linting issues
npx tsc --noEmit  # Type check without building
```

---

**Ready to contribute to NodeMate! 🤖**
