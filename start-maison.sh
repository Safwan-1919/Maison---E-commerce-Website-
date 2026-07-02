#!/bin/bash
# MAISON Production Server Startup Script
# Direct Next.js standalone on port 3000 (Caddy handles IPv6 proxy on port 81)
# Usage: bash /home/z/my-project/start-maison.sh

# Kill any existing instances
fuser -k 3000/tcp 2>/dev/null
fuser -k 13000/tcp 2>/dev/null
sleep 1

cd /home/z/my-project

# Ensure production build exists and is fresh
echo "Checking production build..."
if [ ! -f ".next/standalone/server.js" ] || [ ".next/static/chunks" -nt ".next/standalone/.next/static/chunks" ]; then
  echo "Building production bundle..."
  rm -rf .next/standalone
  NODE_OPTIONS="--max-old-space-size=1024" npx next build
  cp -r .next/static .next/standalone/.next/static 2>/dev/null
  cp -r public .next/standalone/public 2>/dev/null
fi

# Start Next.js directly on port 3000 (detached from shell)
cd .next/standalone
(trap '' HUP; exec node server.js </dev/null >>/tmp/next-direct.log 2>&1) &
disown
cd /home/z/my-project

# Wait for server to be ready
for i in $(seq 1 15); do
  sleep 1
  if curl -s -o /dev/null -w "" http://127.0.0.1:3000/ 2>/dev/null; then
    SIZE=$(curl -s http://127.0.0.1:3000/ 2>/dev/null | wc -c)
    echo "MAISON server ready on port 3000 (${SIZE} bytes homepage)"
    exit 0
  fi
done
echo "WARNING: Server may not have started properly"
exit 1