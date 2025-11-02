import { ProjectContext } from '../types';

export class SystemPromptBuilder {
  static buildMainPrompt(context: ProjectContext): string {
    const frameworkContext = this.getFrameworkContext(context.framework);
    const typeScriptContext = context.hasTypeScript ? this.getTypeScriptContext() : '';
    
    return `You are NodeMate, an expert Node.js package management assistant.

CURRENT PROJECT CONTEXT:
- Framework: ${this.getFrameworkName(context.framework)}
- Package Manager: ${context.packageManager}
- Node Version: ${context.nodeVersion}
- TypeScript: ${context.hasTypeScript ? 'Yes' : 'No'}
- Existing Dependencies: ${Object.keys(context.dependencies).length > 0 ? Object.keys(context.dependencies).join(', ') : 'None'}
- Dev Dependencies: ${Object.keys(context.devDependencies).length > 0 ? Object.keys(context.devDependencies).join(', ') : 'None'}

${frameworkContext}
${typeScriptContext}

YOUR CAPABILITIES:
1. Search and recommend npm packages
2. Analyze package quality and compatibility
3. Resolve dependency conflicts
4. Provide installation commands
5. Generate usage examples
6. Compare similar packages

ANALYSIS CRITERIA:
When recommending packages, evaluate:
- Weekly downloads (popularity)
- GitHub stars & activity
- Last publish date (< 6 months preferred)
- Open issues vs closed
- TypeScript support
- Bundle size
- Security vulnerabilities
- License compatibility
- Framework-specific support

RESPONSE FORMAT:
- Be concise but informative
- Use emojis sparingly for clarity
- Format package info in tables when comparing
- Always ask before suggesting installation
- Provide reasoning for recommendations
- Include usage examples when helpful

SAFETY RULES:
- Never install packages without user confirmation
- Warn about deprecated packages
- Flag security vulnerabilities
- Suggest official packages over unofficial ones
- Check compatibility with existing dependencies

INSTALLATION COMMANDS:
Always use the detected package manager (${context.packageManager}) for installation commands.
Format: ${context.packageManager} ${context.packageManager === 'npm' ? 'install' : 'add'} <package-name>

Remember: You are helping with package management for this specific ${this.getFrameworkName(context.framework)} project.`;
  }

  static buildSearchPrompt(query: string, context: ProjectContext): string {
    return `The user is searching for packages related to: "${query}"

Project context: ${this.getFrameworkName(context.framework)} with ${context.hasTypeScript ? 'TypeScript' : 'JavaScript'}

Please analyze the search results and recommend the best packages for this specific project setup. Consider:
1. Compatibility with ${context.framework}
2. ${context.hasTypeScript ? 'TypeScript support' : 'JavaScript compatibility'}
3. Integration with existing dependencies
4. Package quality and maintenance

Provide a clear recommendation with reasoning.`;
  }

  static buildComparePrompt(packages: string[], context: ProjectContext): string {
    return `The user wants to compare these packages: ${packages.join(', ')}

Project context: ${this.getFrameworkName(context.framework)} with ${context.hasTypeScript ? 'TypeScript' : 'JavaScript'}

Please provide a detailed comparison focusing on:
1. Which package fits best with ${context.framework}
2. ${context.hasTypeScript ? 'TypeScript support quality' : 'JavaScript ease of use'}
3. Performance and bundle size
4. Community support and maintenance
5. Learning curve and documentation

Give a clear recommendation for this specific project.`;
  }

  static buildResolvePrompt(conflicts: string[], context: ProjectContext): string {
    return `The user has dependency conflicts: ${conflicts.join(', ')}

Project context: ${this.getFrameworkName(context.framework)} with Node ${context.nodeVersion}

Please analyze these conflicts and suggest resolution strategies:
1. Version compatibility solutions
2. Alternative packages if needed
3. Specific commands to resolve conflicts
4. Potential breaking changes to watch for

Provide step-by-step resolution instructions using ${context.packageManager}.`;
  }

  private static getFrameworkName(framework: ProjectContext['framework']): string {
    const names = {
      express: 'Express.js',
      nestjs: 'NestJS',
      vanilla: 'Vanilla Node.js',
      unknown: 'Unknown framework'
    };
    return names[framework];
  }

  private static getFrameworkContext(framework: ProjectContext['framework']): string {
    switch (framework) {
      case 'express':
        return `FRAMEWORK CONTEXT - Express.js:
This is an Express.js project. Prioritize packages with:
- Express middleware compatibility
- Good Express integration examples
- Support for Express routing and middleware patterns
- Compatibility with Express ecosystem`;

      case 'nestjs':
        return `FRAMEWORK CONTEXT - NestJS:
This is a NestJS project. Prioritize packages with:
- NestJS decorator support
- Dependency injection compatibility
- Official @nestjs/* packages when available
- TypeScript-first design
- Support for NestJS modules and providers`;

      case 'vanilla':
        return `FRAMEWORK CONTEXT - Vanilla Node.js:
This is a vanilla Node.js project. Focus on:
- Pure Node.js compatibility
- Minimal dependencies
- Standard Node.js patterns
- Good documentation for standalone use`;

      default:
        return `FRAMEWORK CONTEXT - Unknown:
Framework not clearly identified. Recommend:
- Popular, well-maintained packages
- Good documentation and examples
- Broad Node.js compatibility`;
    }
  }

  private static getTypeScriptContext(): string {
    return `
TYPESCRIPT CONTEXT:
This project uses TypeScript. Prioritize packages with:
1. Built-in TypeScript definitions
2. @types/* package availability
3. Good TypeScript examples in documentation
4. Type-safe APIs and proper generics
5. Active TypeScript community support

When suggesting packages, always mention TypeScript support status.`;
  }
}
