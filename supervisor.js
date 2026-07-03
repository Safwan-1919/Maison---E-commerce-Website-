const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const NEXT_PORT = 13000;
const PROXY_PORT = 3000;
const STANDALONE_DIR = path.join(__dirname, '.next', 'standalone');

let nextProcess = null;
let isRestarting = false;
let restartCount = 0;
const MAX_RESTARTS = 50;
let pendingRequests = [];

function startNext() {
  if (nextProcess) return;
  if (restartCount >= MAX_RESTARTS) {
    console.error(`[supervisor] Max restarts (${MAX_RESTARTS}) reached`);
    return;
  }
  restartCount++;
  isRestarting = false;

  nextProcess = spawn('node', ['--max-old-space-size=384', 'server.js'], {
    cwd: STANDALONE_DIR,
    env: {
      ...process.env,
      PORT: String(NEXT_PORT),
      NODE_ENV: 'production'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let bootOutput = '';
  const bootTimeout = setTimeout(() => {
    // Consider it booted after 5s regardless
  }, 5000);

  nextProcess.stdout.on('data', (d) => {
    const str = d.toString();
    process.stderr.write(`[next] ${str}`);
    if (str.includes('Ready')) {
      clearTimeout(bootTimeout);
      // Drain pending requests
      const pending = pendingRequests.splice(0);
      pending.forEach(({ req, res, opts }) => forwardRequest(req, res, opts));
    }
  });

  nextProcess.stderr.on('data', (d) => process.stderr.write(`[next:err] ${d.toString()}`));

  nextProcess.on('exit', (code, signal) => {
    clearTimeout(bootTimeout);
    nextProcess = null;
    console.error(`[supervisor] Next.js exited (code=${code} signal=${signal}), restart #${restartCount}`);
    if (!isRestarting) {
      isRestarting = true;
      setTimeout(startNext, 2000);
    }
  });
}

function forwardRequest(clientReq, clientRes, opts) {
  const req = http.request(opts, (serverRes) => {
    clientRes.writeHead(serverRes.statusCode, serverRes.headers);
    serverRes.pipe(clientRes);
  });

  req.on('error', () => {
    if (!clientRes.headersSent) {
      clientRes.statusCode = 502;
      clientRes.end('Next.js unavailable');
    }
  });

  // Set timeout to avoid hanging
  req.setTimeout(30000, () => {
    req.destroy();
    if (!clientRes.headersSent) {
      clientRes.statusCode = 504;
      clientRes.end('Gateway Timeout');
    }
  });

  clientReq.pipe(req);
}

function createProxy() {
  const proxy = http.createServer((clientReq, clientRes) => {
    const opts = {
      hostname: '127.0.0.1',
      port: NEXT_PORT,
      path: clientReq.url,
      method: clientReq.method,
      headers: {
        ...clientReq.headers,
        host: `localhost:${NEXT_PORT}`
      }
    };

    if (!nextProcess) {
      // Queue the request, will be forwarded when Next.js is ready
      if (pendingRequests.length < 10) {
        pendingRequests.push({ req: clientReq, res: clientRes, opts });
      } else {
        clientRes.statusCode = 503;
        clientRes.end('Server starting, please retry');
      }
      return;
    }

    forwardRequest(clientReq, clientRes, opts);
  });

  // Keep-alive settings
  proxy.keepAliveTimeout = 65000;
  proxy.headersTimeout = 30000;

  proxy.listen(PROXY_PORT, '::', () => {
    console.log(`[supervisor] Proxy on [::]:${PROXY_PORT} -> 127.0.0.1:${NEXT_PORT}`);
  });

  proxy.on('error', (e) => {
    console.error(`[supervisor] Proxy error: ${e.message}`);
    process.exit(1);
  });
}

// Start both
console.log(`[supervisor] Starting (pid=${process.pid})`);
startNext();
createProxy();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[supervisor] SIGTERM received, shutting down');
  if (nextProcess) nextProcess.kill('SIGTERM');
  setTimeout(() => process.exit(0), 1000);
});