import Table from 'cli-table3';
import chalk from 'chalk';
import { PackageInfo } from '../types';

export class TableFormatter {
  static formatPackageComparison(packages: PackageInfo[]): string {
    const table = new Table({
      head: [
        chalk.bold('Package'),
        chalk.bold('Version'),
        chalk.bold('Downloads/week'),
        chalk.bold('Stars'),
        chalk.bold('Last Update'),
        chalk.bold('TypeScript'),
        chalk.bold('License')
      ],
      colWidths: [20, 12, 15, 8, 12, 12, 10]
    });

    packages.forEach(pkg => {
      table.push([
        chalk.cyan(pkg.name),
        pkg.version,
        this.formatNumber(pkg.weeklyDownloads),
        pkg.githubStars ? this.formatNumber(pkg.githubStars) : 'N/A',
        this.formatDate(pkg.lastPublish),
        pkg.hasTypes ? chalk.green('✓') : chalk.red('✗'),
        pkg.license
      ]);
    });

    return table.toString();
  }

  static formatPackageDetails(pkg: PackageInfo): string {
    const table = new Table({
      colWidths: [20, 50]
    });

    table.push(
      [chalk.bold('Name'), chalk.cyan(pkg.name)],
      [chalk.bold('Version'), pkg.version],
      [chalk.bold('Description'), pkg.description],
      [chalk.bold('Weekly Downloads'), this.formatNumber(pkg.weeklyDownloads)],
      [chalk.bold('GitHub Stars'), pkg.githubStars ? this.formatNumber(pkg.githubStars) : 'N/A'],
      [chalk.bold('Last Publish'), this.formatDate(pkg.lastPublish)],
      [chalk.bold('License'), pkg.license],
      [chalk.bold('TypeScript Support'), pkg.hasTypes ? chalk.green('Yes') : chalk.red('No')],
      [chalk.bold('Bundle Size'), pkg.bundleSize || 'Unknown'],
      [chalk.bold('Vulnerabilities'), pkg.vulnerabilities ? chalk.red(pkg.vulnerabilities.toString()) : chalk.green('0')]
    );

    if (pkg.homepage) {
      table.push([chalk.bold('Homepage'), pkg.homepage]);
    }

    if (pkg.repository) {
      table.push([chalk.bold('Repository'), pkg.repository]);
    }

    return table.toString();
  }

  static formatDependencies(dependencies: Record<string, string>, title: string): string {
    if (Object.keys(dependencies).length === 0) {
      return `${chalk.bold(title)}: None`;
    }

    const table = new Table({
      head: [chalk.bold('Package'), chalk.bold('Version')],
      colWidths: [30, 15]
    });

    Object.entries(dependencies).forEach(([name, version]) => {
      table.push([chalk.cyan(name), version]);
    });

    return `${chalk.bold(title)}:\n${table.toString()}`;
  }

  static formatCommands(commands: Record<string, string>): string {
    const table = new Table({
      head: [chalk.bold('Command'), chalk.bold('Description')],
      colWidths: [15, 50]
    });

    Object.entries(commands).forEach(([command, description]) => {
      table.push([chalk.yellow(command), description]);
    });

    return table.toString();
  }

  private static formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  private static formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)}w ago`;
    } else if (diffDays < 365) {
      return `${Math.floor(diffDays / 30)}m ago`;
    } else {
      return `${Math.floor(diffDays / 365)}y ago`;
    }
  }
}
