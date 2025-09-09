import http from 'http';
import httpProxy from 'http-proxy';

// Create a proxy server
const proxy = httpProxy.createProxyServer({});

// Create the server that listens on port 5000
const server = http.createServer((req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Proxy to Vite dev server on port 8080
  proxy.web(req, res, {
    target: 'http://localhost:8080',
    changeOrigin: true,
    ws: true
  });
});

// Handle WebSocket upgrades for hot reload
server.on('upgrade', (req, socket, head) => {
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

const PORT = 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Proxy server running on port ${PORT}, forwarding to Vite on 8080`);
});