#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if we're in development mode
const isDev = process.env.NODE_ENV === 'development';

if (isDev) {
  // In development, run the TypeScript source directly
  const tsxPath = join(__dirname, '..', 'node_modules', '.bin', 'tsx');
  const srcPath = join(__dirname, '..', 'src', 'index.ts');
  
  const child = spawn('node', [tsxPath, srcPath, ...process.argv.slice(2)], {
    stdio: 'inherit',
    cwd: join(__dirname, '..')
  });
  
  child.on('exit', (code) => {
    process.exit(code);
  });
} else {
  // In production, run the compiled JavaScript
  const distPath = join(__dirname, '..', 'dist', 'index.js');
  await import(distPath);
}
