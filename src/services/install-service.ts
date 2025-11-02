import { CommandRunner } from '../utils/command-runner';
import { ProjectContext, InstallRequest } from '../types';
import { Logger } from '../utils/logger';
import { spinner } from '../utils/spinner';

export class InstallService {
  async installPackages(
    packages: string[],
    context: ProjectContext,
    isDev: boolean = false
  ): Promise<boolean> {
    try {
      const { packageManager } = context;
      const command = this.getInstallCommand(packageManager, isDev);
      
      spinner.start(`Installing ${packages.join(', ')} with ${packageManager}...`);
      
      const result = await CommandRunner.run(
        packageManager,
        [...command, ...packages],
        { 
          cwd: context.projectPath,
          timeout: 120000 // 2 minutes
        }
      );

      if (result.exitCode === 0) {
        spinner.succeed(`Successfully installed ${packages.join(', ')}`);
        return true;
      } else {
        spinner.fail('Installation failed');
        Logger.error(`Installation error: ${result.stderr}`);
        return false;
      }
    } catch (error) {
      spinner.fail('Installation failed');
      Logger.error(`Installation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  async uninstallPackages(
    packages: string[],
    context: ProjectContext
  ): Promise<boolean> {
    try {
      const { packageManager } = context;
      const command = this.getUninstallCommand(packageManager);
      
      spinner.start(`Uninstalling ${packages.join(', ')} with ${packageManager}...`);
      
      const result = await CommandRunner.run(
        packageManager,
        [...command, ...packages],
        { 
          cwd: context.projectPath,
          timeout: 60000
        }
      );

      if (result.exitCode === 0) {
        spinner.succeed(`Successfully uninstalled ${packages.join(', ')}`);
        return true;
      } else {
        spinner.fail('Uninstallation failed');
        Logger.error(`Uninstallation error: ${result.stderr}`);
        return false;
      }
    } catch (error) {
      spinner.fail('Uninstallation failed');
      Logger.error(`Uninstallation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  private getInstallCommand(packageManager: string, isDev: boolean): string[] {
    switch (packageManager) {
      case 'npm':
        return ['install', ...(isDev ? ['--save-dev'] : [])];
      case 'pnpm':
        return ['add', ...(isDev ? ['--save-dev'] : [])];
      case 'yarn':
        return ['add', ...(isDev ? ['--dev'] : [])];
      default:
        return ['install'];
    }
  }

  private getUninstallCommand(packageManager: string): string[] {
    switch (packageManager) {
      case 'npm':
        return ['uninstall'];
      case 'pnpm':
        return ['remove'];
      case 'yarn':
        return ['remove'];
      default:
        return ['uninstall'];
    }
  }

  formatInstallCommand(
    packages: string[],
    packageManager: string,
    isDev: boolean = false
  ): string {
    const command = this.getInstallCommand(packageManager, isDev);
    return `${packageManager} ${command.join(' ')} ${packages.join(' ')}`;
  }

  async checkInstallationStatus(
    packageName: string,
    context: ProjectContext
  ): Promise<{ installed: boolean; version?: string }> {
    try {
      const result = await CommandRunner.run(
        context.packageManager,
        ['list', packageName, '--depth=0'],
        { 
          cwd: context.projectPath,
          timeout: 10000
        }
      );

      if (result.exitCode === 0 && result.stdout.includes(packageName)) {
        // Extract version from output (this is a simplified approach)
        const versionMatch = result.stdout.match(new RegExp(`${packageName}@([\\d\\.]+)`));
        return {
          installed: true,
          version: versionMatch?.[1]
        };
      }

      return { installed: false };
    } catch (error) {
      return { installed: false };
    }
  }
}
