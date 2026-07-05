#!/bin/bash
# Production server wrapper with IPv6 support
# Caddy resolves localhost to ::1 (IPv6), so we need to listen on both IPv4 and IPv6

cd /home/z/my-project/.next/standalone

# Start Next.js standalone on 127.0.0.1:13000 (IPv4 only)
node server.js --port 13000 --hostname 127.0.0.1 &
NEXT_PID=$!
echo "Next.js PID: $NEXT_PID"

# Wait for Next.js to be ready
for i in $(seq 1 30); do
  sleep 1
  if curl -4 -s --connect-timeout 1 http://127.0.0.1:13000/ > /dev/null 2>&1; then
    echo "Next.js ready on 127.0.0.1:13000"
    break
  fi
  if ! kill -0 $NEXT_PID 2>/dev/null; then
    echo "Next.js failed to start"
    exit 1
  fi
done

# Start IPv6+IPv4 TCP proxy on port 3000
node -e "
const net = require('net');
const TARGET_HOST = '127.0.0.1';
const TARGET_PORT = 13000;
const LISTEN_PORT = 3000;

const proxy = net.createServer((client) => {
  const server = net.createConnection(TARGET_PORT, TARGET_HOST, () => {
    client.pipe(server);
    server.pipe(client);
  });
  server.on('error', () => client.destroy());
  client.on('error', () => server.destroy());
});

proxy.listen(LISTEN_PORT, '::', () => {
  console.log('TCP proxy listening on [::]:' + LISTEN_PORT + ' -> ' + TARGET_HOST + ':' + TARGET_PORT);
});

proxy.on('error', (err) => {
  console.error('Proxy error:', err.message);
  process.exit(1);
});

process.on('SIGTERM', () => {
  proxy.close();
  process.exit(0);
});
" &
PROXY_PID=$!
echo "Proxy PID: $PROXY_PID"

# Wait for either process to exit
wait -n $NEXT_PID $PROXY_PID
EXIT_CODE=$?
echo "Process exited with code $EXIT_CODE"
kill $NEXT_PID $PROXY_PID 2>/dev/null
exit $EXIT_CODE