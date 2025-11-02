import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { Logger } from '../utils/logger';
import { spinner } from '../utils/spinner';

export async function updateCommand(): Promise<void> {
  try {
    // Find the nodemate installation directory
    const installPath = findNodeMateInstallPath();
    
    if (!installPath) {
      Logger.error('Could not find NodeMate installation directory. Please reinstall from source.');
      return;
    }

    Logger.info(`Found NodeMate installation at: ${installPath}`);
    
    // Check if it's a git repository
    if (!existsSync(path.join(installPath, '.git'))) {
      Logger.error('NodeMate installation is not a git repository. Please reinstall from source.');
      return;
    }

    // Check current version/commit
    const currentCommit = getCurrentCommit(installPath);
    Logger.info(`Current version: ${currentCommit}`);

    // Fetch latest changes
    spinner.start('Checking for updates...');
    
    try {
      execSync('git fetch origin', { 
        cwd: installPath, 
        stdio: 'pipe' 
      });
      
      const latestCommit = getLatestCommit(installPath);
      
      if (currentCommit === latestCommit) {
        spinner.succeed('NodeMate is already up to date! 🎉');
        return;
      }

      spinner.succeed('Updates available!');
      
      // Show what's new
      showChangelog(installPath, currentCommit, latestCommit);
      
      // Pull latest changes
      spinner.start('Downloading updates...');
      execSync('git pull origin main', { 
        cwd: installPath, 
        stdio: 'pipe' 
      });
      spinner.succeed('Downloaded latest changes');

      // Install dependencies
      spinner.start('Installing dependencies...');
      execSync('npm install', { 
        cwd: installPath, 
        stdio: 'pipe' 
      });
      spinner.succeed('Dependencies updated');

      // Build project
      spinner.start('Building NodeMate...');
      execSync('npm run build', { 
        cwd: installPath, 
        stdio: 'pipe' 
      });
      spinner.succeed('Build completed');

      // Reinstall globally
      spinner.start('Installing globally...');
      execSync('npm install -g . --force', { 
        cwd: installPath, 
        stdio: 'pipe' 
      });
      spinner.succeed('NodeMate updated successfully! 🚀');

      const newCommit = getCurrentCommit(installPath);
      Logger.success(`Updated from ${currentCommit.slice(0, 7)} to ${newCommit.slice(0, 7)}`);
      Logger.info('Restart your terminal or run `nodemate --version` to verify the update.');

    } catch (error) {
      spinner.fail('Update failed');
      throw error;
    }

  } catch (error) {
    Logger.error(`Update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    Logger.info('You can manually update by running:');
    Logger.command('cd nodemate && git pull && npm run build && npm install -g . --force');
  }
}

function findNodeMateInstallPath(): string | null {
  try {
    // Try to find the source installation
    const possiblePaths = [
      // Common development locations
      path.join(process.env.HOME || '', 'Desktop', 'nodemate'),
      path.join(process.env.HOME || '', 'Documents', 'nodemate'),
      path.join(process.env.HOME || '', 'Projects', 'nodemate'),
      path.join(process.env.HOME || '', 'nodemate'),
      path.join(process.env.HOME || '', 'dev', 'nodemate'),
      path.join(process.env.HOME || '', 'Development', 'nodemate'),
      // Current directory if user is in nodemate folder
      process.cwd(),
      // Try to find via npm global installation
      ...findViaGlobalInstall(),
    ];

    for (const testPath of possiblePaths) {
      if (existsSync(testPath) && 
          existsSync(path.join(testPath, 'package.json')) &&
          existsSync(path.join(testPath, '.git'))) {
        
        // Verify it's actually nodemate by checking package.json
        try {
          const packageJsonContent = readFileSync(path.join(testPath, 'package.json'), 'utf8');
          const packageJson = JSON.parse(packageJsonContent);
          
          if (packageJson.name === 'nodemate' || 
              packageJson.name === '@adeyemi05/nodemate' ||
              packageJson.name === '@adeyemi05/node-ai-mate') {
            return testPath;
          }
        } catch {
          continue;
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

function getCurrentCommit(installPath: string): string {
  try {
    return execSync('git rev-parse HEAD', { 
      cwd: installPath, 
      encoding: 'utf8' 
    }).trim();
  } catch {
    return 'unknown';
  }
}

function getLatestCommit(installPath: string): string {
  try {
    return execSync('git rev-parse origin/main', { 
      cwd: installPath, 
      encoding: 'utf8' 
    }).trim();
  } catch {
    return 'unknown';
  }
}

function showChangelog(installPath: string, currentCommit: string, latestCommit: string): void {
  try {
    const changelog = execSync(`git log --oneline ${currentCommit}..${latestCommit}`, {
      cwd: installPath,
      encoding: 'utf8'
    }).trim();

    if (changelog) {
      Logger.info('📋 What\'s new:');
      console.log('');
      changelog.split('\n').forEach(line => {
        if (line.trim()) {
          Logger.info(`  • ${line.trim()}`);
        }
      });
      console.log('');
    }
  } catch {
    Logger.info('📋 New updates available (changelog unavailable)');
  }
}

function findViaGlobalInstall(): string[] {
  try {
    // Try to find where npm installed the global package
    const globalPaths: string[] = [];
    
    // Check common npm global locations
    const npmRoot = execSync('npm root -g', { encoding: 'utf8' }).trim();
    if (npmRoot) {
      // Look for the source directory that might be linked
      const possibleSourcePaths = [
        path.join(npmRoot, '..', 'lib', 'node_modules', 'nodemate'),
        path.join(npmRoot, 'nodemate'),
      ];
      globalPaths.push(...possibleSourcePaths);
    }
    
    return globalPaths;
  } catch {
    return [];
  }
}
