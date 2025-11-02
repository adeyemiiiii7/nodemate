export interface DrNodeConfig {
  provider: LLMProvider;
  apiKey: string;
  model: string;
  preferences: UserPreferences;
  providers: ProviderConfigs;
}

export interface UserPreferences {
  packageManager: 'auto' | 'npm' | 'pnpm' | 'yarn';
  autoInstall: boolean;
  showThinking: boolean;
  colorOutput: boolean;
}

export interface ProviderConfigs {
  openai: ProviderConfig;
  claude: ProviderConfig;
  gemini: ProviderConfig;
  groq: ProviderConfig;
}

export interface ProviderConfig {
  apiKey?: string;
  model: string;
}

export type LLMProvider = 'openai' | 'claude' | 'gemini' | 'groq';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ProjectContext {
  framework: 'express' | 'nestjs' | 'vanilla' | 'unknown';
  packageManager: 'npm' | 'pnpm' | 'yarn';
  nodeVersion: string;
  hasTypeScript: boolean;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  projectPath: string;
  packageJsonPath: string;
}

export interface PackageInfo {
  name: string;
  version: string;
  description: string;
  weeklyDownloads: number;
  githubStars?: number;
  lastPublish: string;
  maintainers: string[];
  license: string;
  hasTypes: boolean;
  bundleSize?: string;
  vulnerabilities?: number;
  homepage?: string;
  repository?: string;
}

export interface SearchResult {
  packages: PackageInfo[];
  query: string;
  total: number;
}

export interface InstallRequest {
  packages: string[];
  isDev: boolean;
  confirmed: boolean;
}

export interface DependencyConflict {
  package: string;
  currentVersion: string;
  requiredVersion: string;
  conflictingPackages: string[];
}

export interface ChatCommand {
  command: string;
  description: string;
  handler: (args: string[]) => Promise<void>;
}

export interface AnalysisResult {
  recommendation: string;
  packages: PackageInfo[];
  reasoning: string;
  installCommand?: string;
  codeExample?: string;
}
