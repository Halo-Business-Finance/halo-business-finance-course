#!/usr/bin/env node
import { spawn } from 'child_process';

console.log('Starting FinPilot application with proxy...');

// Start Vite dev server on port 8080
console.log('Starting Vite dev server on port 8080...');
const viteProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

// Wait a moment for Vite to start, then start the proxy
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
  process.on('SIGQUIT', cleanup);

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
}, 2000);