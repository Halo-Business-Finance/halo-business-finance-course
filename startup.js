#!/usr/bin/env node
import { spawn } from 'child_process';
import { createServer } from 'http';
import httpProxy from 'http-proxy';

console.log('Starting FinPilot application...');

// Create proxy server first
const proxy = httpProxy.createProxyServer({});
const proxyServer = createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  proxy.web(req, res, {
    target: 'http://localhost:8080',
    changeOrigin: true,
    ws: true
  });
});

// Handle WebSocket upgrades
proxyServer.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head, {
    target: 'ws://localhost:8080',
    changeOrigin: true
  });
});

// Handle proxy errors
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  if (!res.headersSent) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Proxy error occurred');
  }
});

// Start proxy server on port 5000
proxyServer.listen(5000, '0.0.0.0', () => {
  console.log('Proxy server running on port 5000, will forward to Vite on 8080');
  
  // Start Vite dev server after proxy is running
  console.log('Starting Vite dev server on port 8080...');
  const viteProcess = spawn('npx', ['vite', '--port', '8080', '--host', '0.0.0.0'], {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd()
  });

  // Handle process cleanup
  const cleanup = () => {
    console.log('Shutting down...');
    viteProcess.kill();
    proxyServer.close();
    process.exit(0);
  };

  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);

  viteProcess.on('exit', (code) => {
    console.log(`Vite process exited with code ${code}`);
    proxyServer.close();
    process.exit(code);
  });
});