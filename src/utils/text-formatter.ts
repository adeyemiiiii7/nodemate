import chalk from 'chalk';

export class TextFormatter {
  private static readonly TERMINAL_WIDTH = process.stdout.columns || 80;
  private static readonly MAX_WIDTH = Math.min(this.TERMINAL_WIDTH - 4, 100);

  /**
   * Format AI response text for better terminal readability
   */
  static formatAIResponse(text: string): string {
    const lines = text.split('\n');
    const formattedLines: string[] = [];
    let inCodeBlock = false;

    for (let line of lines) {
      // Handle code blocks with simpler formatting
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          // Starting code block
          const language = line.slice(3).trim();
          inCodeBlock = true;
          formattedLines.push('');
          formattedLines.push(chalk.cyan(`--- ${language || 'Code'} ---`));
        } else {
          // Ending code block
          inCodeBlock = false;
          formattedLines.push(chalk.cyan('--- End ---'));
          formattedLines.push('');
        }
        continue;
      }

      if (inCodeBlock) {
        // Format code lines with simple indentation
        formattedLines.push(chalk.green('  ' + line));
        continue;
      }

      // Handle headers with simpler formatting
      if (line.startsWith('# ')) {
        formattedLines.push('');
        formattedLines.push(chalk.bold.blue('=== ' + line.slice(2).toUpperCase() + ' ==='));
        formattedLines.push('');
        continue;
      }

      if (line.startsWith('## ')) {
        formattedLines.push('');
        formattedLines.push(chalk.bold.cyan('>> ' + line.slice(3)));
        continue;
      }

      if (line.startsWith('### ')) {
        formattedLines.push(chalk.bold.white('  * ' + line.slice(4)));
        continue;
      }

      // Handle lists with simple bullets
      if (line.match(/^\s*[-*+]\s/)) {
        const indent = line.match(/^\s*/)?.[0] || '';
        const content = line.replace(/^\s*[-*+]\s/, '');
        formattedLines.push(indent + chalk.yellow('• ') + content);
        continue;
      }

      // Handle numbered lists
      if (line.match(/^\s*\d+\.\s/)) {
        const match = line.match(/^(\s*)(\d+)\.\s(.*)$/);
        if (match) {
          const [, indent, number, content] = match;
          formattedLines.push(indent + chalk.yellow(`${number}. `) + content);
          continue;
        }
      }

      // Handle inline code with simpler formatting
      line = line.replace(/`([^`]+)`/g, (_, code) => chalk.cyan(`[${code}]`));

      // Handle bold text
      line = line.replace(/\*\*([^*]+)\*\*/g, (_, text) => chalk.bold(text));

      // Handle emphasis
      line = line.replace(/\*([^*]+)\*/g, (_, text) => chalk.italic(text));

      // Add the line as-is (with any formatting applied)
      formattedLines.push(line);
    }

    return formattedLines.join('\n');
  }

  /**
   * Wrap text to specified width while preserving formatting
   */
  private static wrapText(text: string, width: number): string[] {
    if (text.length <= width) {
      return [text];
    }

    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      // Remove ANSI codes for length calculation
      const cleanCurrentLine = currentLine.replace(/\u001b\[[0-9;]*m/g, '');
      const cleanWord = word.replace(/\u001b\[[0-9;]*m/g, '');

      if (cleanCurrentLine.length + cleanWord.length + 1 <= width) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * Format package information in a clean table-like format
   */
  static formatPackageInfo(packages: Array<{name: string, version?: string, description?: string, downloads?: string}>) {
    const lines: string[] = [];
    
    packages.forEach((pkg, index) => {
      lines.push('');
      lines.push(chalk.bold.green(`${index + 1}. ${pkg.name}`) + (pkg.version ? chalk.gray(` v${pkg.version}`) : ''));
      
      if (pkg.description) {
        const wrapped = this.wrapText(`   ${pkg.description}`, this.MAX_WIDTH);
        lines.push(...wrapped.map(line => chalk.gray(line)));
      }
      
      if (pkg.downloads) {
        lines.push(chalk.blue(`   📊 ${pkg.downloads} weekly downloads`));
      }
    });

    return lines.join('\n');
  }

  /**
   * Create a separator line
   */
  static separator(char: string = '-', width?: number): string {
    const w = width || Math.min(this.TERMINAL_WIDTH - 4, 60);
    return chalk.gray(char.repeat(w));
  }

  /**
   * Format error messages with better visibility
   */
  static formatError(message: string): string {
    const lines = [
      '',
      chalk.red('=== ERROR ==='),
      chalk.red(message),
      chalk.red('============='),
      ''
    ];
    return lines.join('\n');
  }
}
