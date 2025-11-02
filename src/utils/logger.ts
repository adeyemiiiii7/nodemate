import chalk from 'chalk';

export class Logger {
  private static colorOutput = true;

  static setColorOutput(enabled: boolean) {
    this.colorOutput = enabled;
  }

  static info(message: string) {
    const output = this.colorOutput ? chalk.blue('ℹ ') + message : `ℹ ${message}`;
    console.log(output);
  }

  static success(message: string) {
    const output = this.colorOutput ? chalk.green('✅ ') + message : `✅ ${message}`;
    console.log(output);
  }

  static warning(message: string) {
    const output = this.colorOutput ? chalk.yellow('⚠️ ') + message : `⚠️ ${message}`;
    console.log(output);
  }

  static error(message: string) {
    const output = this.colorOutput ? chalk.red('❌ ') + message : `❌ ${message}`;
    console.error(output);
  }

  static debug(message: string) {
    if (process.env.DEBUG) {
      const output = this.colorOutput ? chalk.gray('🐛 ') + message : `🐛 ${message}`;
      console.log(output);
    }
  }

  static thinking(message: string) {
    const output = this.colorOutput ? chalk.magenta('🤔 ') + message : `🤔 ${message}`;
    console.log(output);
  }

  static ai(message: string) {
    const output = this.colorOutput ? chalk.cyan('🤖 ') + message : `🤖 ${message}`;
    console.log(output);
  }

  static user(message: string) {
    const output = this.colorOutput ? chalk.white('👤 ') + message : `👤 ${message}`;
    console.log(output);
  }

  static package(name: string, version?: string) {
    const packageStr = version ? `${name}@${version}` : name;
    const output = this.colorOutput ? chalk.green('📦 ') + chalk.bold(packageStr) : `📦 ${packageStr}`;
    console.log(output);
  }

  static command(command: string) {
    const output = this.colorOutput ? chalk.gray('$ ') + chalk.italic(command) : `$ ${command}`;
    console.log(output);
  }
}
