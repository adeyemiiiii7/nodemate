import axios from 'axios';
import { PackageInfo, SearchResult } from '../types';

export class NPMService {
  private static readonly REGISTRY_URL = 'https://registry.npmjs.org';
  private static readonly SEARCH_URL = 'https://registry.npmjs.org/-/v1/search';
  private static readonly DOWNLOADS_URL = 'https://api.npmjs.org/downloads/point/last-week';

  async searchPackages(query: string, limit: number = 10): Promise<SearchResult> {
    try {
      const response = await axios.get(NPMService.SEARCH_URL, {
        params: {
          text: query,
          size: limit,
          quality: 0.65,
          popularity: 0.98,
          maintenance: 0.5
        },
        timeout: 10000
      });

      const packages = await Promise.all(
        response.data.objects.map(async (obj: any) => {
          const packageInfo = await this.getPackageInfo(obj.package.name);
          return packageInfo;
        })
      );

      return {
        packages: packages.filter(pkg => pkg !== null) as PackageInfo[],
        query,
        total: response.data.total
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`NPM search failed: ${error.message}`);
      }
      throw new Error('Unknown NPM search error');
    }
  }

  async getPackageInfo(packageName: string): Promise<PackageInfo | null> {
    try {
      const [registryResponse, downloadsResponse] = await Promise.all([
        axios.get(`${NPMService.REGISTRY_URL}/${packageName}`, { timeout: 10000 }),
        this.getDownloadStats(packageName)
      ]);

      const data = registryResponse.data;
      const latestVersion = data['dist-tags'].latest;
      const versionData = data.versions[latestVersion];

      // Check for TypeScript support
      const hasTypes = this.checkTypeScriptSupport(packageName, versionData);

      // Get GitHub info if available
      const githubInfo = await this.getGitHubInfo(data.repository?.url);

      return {
        name: packageName,
        version: latestVersion,
        description: versionData.description || 'No description available',
        weeklyDownloads: downloadsResponse,
        githubStars: githubInfo?.stars,
        lastPublish: data.time[latestVersion],
        maintainers: data.maintainers?.map((m: any) => m.name) || [],
        license: versionData.license || 'Unknown',
        hasTypes,
        homepage: data.homepage,
        repository: data.repository?.url
      };
    } catch (error) {
      console.error(`Failed to get package info for ${packageName}:`, error);
      return null;
    }
  }

  async getDownloadStats(packageName: string): Promise<number> {
    try {
      const response = await axios.get(`${NPMService.DOWNLOADS_URL}/${packageName}`, {
        timeout: 5000
      });
      return response.data.downloads || 0;
    } catch (error) {
      return 0;
    }
  }

  private checkTypeScriptSupport(packageName: string, versionData: any): boolean {
    // Check if package has built-in types
    if (versionData.types || versionData.typings) {
      return true;
    }

    // Check if @types package exists (we'll assume it does for popular packages)
    // In a real implementation, you might want to check the @types registry
    return false;
  }

  private async getGitHubInfo(repositoryUrl?: string): Promise<{ stars: number } | null> {
    if (!repositoryUrl) return null;

    try {
      // Extract GitHub repo from URL
      const match = repositoryUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) return null;

      const [, owner, repo] = match;
      const cleanRepo = repo.replace(/\.git$/, '');

      const response = await axios.get(`https://api.github.com/repos/${owner}/${cleanRepo}`, {
        timeout: 5000,
        headers: {
          'User-Agent': 'dr-node-cli'
        }
      });

      return {
        stars: response.data.stargazers_count || 0
      };
    } catch (error) {
      return null;
    }
  }

  async getPackageVersions(packageName: string): Promise<string[]> {
    try {
      const response = await axios.get(`${NPMService.REGISTRY_URL}/${packageName}`, {
        timeout: 10000
      });

      return Object.keys(response.data.versions).reverse(); // Latest first
    } catch (error) {
      throw new Error(`Failed to get versions for ${packageName}`);
    }
  }

  async checkPackageExists(packageName: string): Promise<boolean> {
    try {
      await axios.head(`${NPMService.REGISTRY_URL}/${packageName}`, {
        timeout: 5000
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async getLatestVersion(packageName: string): Promise<string | null> {
    try {
      const response = await axios.get(`${NPMService.REGISTRY_URL}/${packageName}/latest`, {
        timeout: 5000
      });
      return response.data.version;
    } catch (error) {
      return null;
    }
  }

  async getDependencies(packageName: string, version?: string): Promise<Record<string, string>> {
    try {
      const targetVersion = version || 'latest';
      const response = await axios.get(`${NPMService.REGISTRY_URL}/${packageName}/${targetVersion}`, {
        timeout: 10000
      });

      return response.data.dependencies || {};
    } catch (error) {
      return {};
    }
  }

  async getPeerDependencies(packageName: string, version?: string): Promise<Record<string, string>> {
    try {
      const targetVersion = version || 'latest';
      const response = await axios.get(`${NPMService.REGISTRY_URL}/${packageName}/${targetVersion}`, {
        timeout: 10000
      });

      return response.data.peerDependencies || {};
    } catch (error) {
      return {};
    }
  }
}
