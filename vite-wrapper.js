#!/usr/bin/env node
import { spawn } from 'child_process';
import path from 'path';

// This wrapper intercepts the vite command and runs our full startup sequence
console.log('Starting FinPilot with proxy setup...');

// Check if this is being called with standard vite dev arguments
const args = process.argv.slice(2);
const isDevCommand = args.length === 0 || args.includes('--port') || args.includes('--host');

if (isDevCommand) {
  // Start Vite dev server on port 8080
  console.log('Starting Vite dev server on port 8080...');
  const viteProcess = spawn('node', ['./node_modules/vite/bin/vite.js'], {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd()
  });

  // Wait for Vite to start, then start the proxy
  setTimeout(() => {
    console.log('Starting proxy server on port 5000...');
    const proxyProcess = spawn('node', ['proxy-server.js'], {
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd()
    });

    // Handle process cleanup
    const cleanup = () => {
      console.log('Shutting down...');
      viteProcess.kill();
      proxyProcess.kill();
      process.exit(0);
    };

    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);

    viteProcess.on('exit', (code) => {
      console.log(`Vite process exited with code ${code}`);
      proxyProcess.kill();
      process.exit(code);
    });

    proxyProcess.on('exit', (code) => {
      console.log(`Proxy process exited with code ${code}`);
      viteProcess.kill();
      process.exit(code);
    });
  }, 3000);
} else {
  // For other vite commands (build, etc.), just pass through to real vite
  const viteProcess = spawn('node', ['./node_modules/vite/bin/vite.js', ...args], {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd()
  });
  
  viteProcess.on('exit', (code) => {
    process.exit(code);
  });
}