import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  target: 'node16',
  minify: false,
  bundle: true,
  external: [
    'chalk',
    'commander',
    'inquirer',
    'ora',
    'cli-table3',
    'conf',
    'axios',
    'fs-extra',
    'execa',
    'semver',
    'openai',
    '@anthropic-ai/sdk',
    '@google/generative-ai',
    'groq-sdk'
  ]
});
