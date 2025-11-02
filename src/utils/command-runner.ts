import { spawn } from 'child_process';
import { promisify } from 'util';

export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export class CommandRunner {
  static async run(command: string, args: string[] = [], options: { cwd?: string; timeout?: number } = {}): Promise<CommandResult> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        cwd: options.cwd || process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      const timeout = options.timeout || 10000;
      const timer = setTimeout(() => {
        child.kill();
        reject(new Error(`Command timed out after ${timeout}ms`));
      }, timeout);

      child.on('close', (code) => {
        clearTimeout(timer);
        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: code || 0
        });
      });

      child.on('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });
    });
  }

  static async exists(command: string): Promise<boolean> {
    try {
      await this.run(command, ['--version'], { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}
