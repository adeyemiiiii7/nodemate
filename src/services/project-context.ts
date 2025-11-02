import { readFile, access } from 'fs/promises';
import { join, dirname } from 'path';
import { ProjectContext } from '../types';
import { CommandRunner } from '../utils/command-runner';

export class ProjectContextService {
  async detectContext(projectPath: string = process.cwd()): Promise<ProjectContext> {
    const packageJsonPath = join(projectPath, 'package.json');
    
    try {
      await access(packageJsonPath);
    } catch (error) {
      throw new Error('No package.json found. Are you in a Node.js project?');
    }

    const packageJson = await this.readPackageJson(packageJsonPath);
    const framework = this.detectFramework(packageJson);
    const packageManager = await this.detectPackageManager(projectPath);
    const nodeVersion = await this.getNodeVersion();
    const hasTypeScript = this.detectTypeScript(packageJson, projectPath);

    return {
      framework,
      packageManager,
      nodeVersion,
      hasTypeScript,
      dependencies: packageJson.dependencies || {},
      devDependencies: packageJson.devDependencies || {},
      projectPath,
      packageJsonPath
    };
  }

  private async readPackageJson(packageJsonPath: string): Promise<any> {
    try {
      const content = await readFile(packageJsonPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error('Failed to read or parse package.json');
    }
  }

  private detectFramework(packageJson: any): ProjectContext['framework'] {
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    // Check for Next.js (should be checked before React)
    if (dependencies['next']) {
      return 'nextjs';
    }
    
    // Check for React
    if (dependencies['react']) {
      return 'react';
    }
    
    // Check for NestJS
    if (dependencies['@nestjs/core'] || dependencies['@nestjs/common']) {
      return 'nestjs';
    }
    
    // Check for Express
    if (dependencies['express']) {
      return 'express';
    }
    
    // Check for other Node.js frameworks
    if (dependencies['fastify'] || dependencies['koa'] || dependencies['hapi']) {
      return 'vanilla'; // Treat other frameworks as vanilla for now
    }
    
    return 'vanilla';
  }

  private async detectPackageManager(projectPath: string): Promise<ProjectContext['packageManager']> {
    try {
      // Check for lock files
      const lockFiles = [
        { file: 'pnpm-lock.yaml', manager: 'pnpm' as const },
        { file: 'yarn.lock', manager: 'yarn' as const },
        { file: 'package-lock.json', manager: 'npm' as const }
      ];

      for (const { file, manager } of lockFiles) {
        try {
          await access(join(projectPath, file));
          return manager;
        } catch {
          continue;
        }
      }

      // Check which package manager is available
      const managers = ['pnpm', 'yarn', 'npm'];
      for (const manager of managers) {
        try {
          await CommandRunner.run(manager, ['--version'], { timeout: 5000 });
          return manager as ProjectContext['packageManager'];
        } catch {
          continue;
        }
      }

      return 'npm'; // Default fallback
    } catch (error) {
      return 'npm';
    }
  }

  private async getNodeVersion(): Promise<string> {
    try {
      const result = await CommandRunner.run('node', ['--version'], { timeout: 5000 });
      return result.stdout;
    } catch (error) {
      return 'unknown';
    }
  }

  private detectTypeScript(packageJson: any, projectPath: string): boolean {
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    // Check for TypeScript in dependencies
    if (dependencies['typescript'] || dependencies['@types/node']) {
      return true;
    }

    // Check for tsconfig.json
    try {
      require.resolve(join(projectPath, 'tsconfig.json'));
      return true;
    } catch {
      return false;
    }
  }

  async getInstalledPackages(projectPath: string): Promise<Record<string, string>> {
    try {
      const packageJsonPath = join(projectPath, 'package.json');
      const packageJson = await this.readPackageJson(packageJsonPath);
      
      return {
        ...packageJson.dependencies || {},
        ...packageJson.devDependencies || {}
      };
    } catch (error) {
      return {};
    }
  }

  async checkPackageInstalled(packageName: string, projectPath: string): Promise<boolean> {
    const installedPackages = await this.getInstalledPackages(projectPath);
    return packageName in installedPackages;
  }

  async getPackageVersion(packageName: string, projectPath: string): Promise<string | null> {
    const installedPackages = await this.getInstalledPackages(projectPath);
    return installedPackages[packageName] || null;
  }

  generateContextSummary(context: ProjectContext): string {
    const frameworkName = {
      express: 'Express.js',
      nestjs: 'NestJS',
      react: 'React.js',
      nextjs: 'Next.js',
      vanilla: 'Vanilla Node.js',
      unknown: 'Unknown framework'
    }[context.framework];

    const dependencyCount = Object.keys(context.dependencies).length;
    const devDependencyCount = Object.keys(context.devDependencies).length;

    return `
📋 Project Context:
• Framework: ${frameworkName}
• Package Manager: ${context.packageManager}
• Node Version: ${context.nodeVersion}
• TypeScript: ${context.hasTypeScript ? 'Yes' : 'No'}
• Dependencies: ${dependencyCount} production, ${devDependencyCount} development
• Project Path: ${context.projectPath}
    `.trim();
  }

  async validateProjectStructure(context: ProjectContext): Promise<string[]> {
    const issues: string[] = [];

    // Check Node version
    if (context.nodeVersion === 'unknown') {
      issues.push('Could not detect Node.js version');
    }

    // Check for common issues
    const packageJson = await this.readPackageJson(context.packageJsonPath);
    
    if (!packageJson.name) {
      issues.push('package.json is missing a name field');
    }

    if (!packageJson.version) {
      issues.push('package.json is missing a version field');
    }

    // Framework-specific checks
    if (context.framework === 'express' && !context.dependencies['express']) {
      issues.push('Express framework detected but express is not in dependencies');
    }

    if (context.framework === 'nestjs' && !context.dependencies['@nestjs/core']) {
      issues.push('NestJS framework detected but @nestjs/core is not in dependencies');
    }

    // TypeScript checks
    if (context.hasTypeScript && !context.devDependencies['typescript']) {
      issues.push('TypeScript detected but typescript is not in devDependencies');
    }

    return issues;
  }
}
