#!/bin/bash
# MAISON Production Server Startup Script
# Uses supervisor.js for IPv6 proxy + auto-restart Next.js
# Usage: bash /home/z/my-project/start-maison.sh

# Kill any existing instances
fuser -k 3000/tcp 2>/dev/null
fuser -k 13000/tcp 2>/dev/null
sleep 1

cd /home/z/my-project

# Ensure production build exists
if [ ! -f ".next/standalone/server.js" ]; then
  echo "Building production bundle..."
  NODE_OPTIONS="--max-old-space-size=1024" npx next build
  cp -r .next/static .next/standalone/.next/static 2>/dev/null
  cp -r public .next/standalone/public 2>/dev/null
fi

# Start supervisor (detached from shell)
(trap '' HUP; exec node /home/z/my-project/supervisor.js </dev/null >>/tmp/supervisor.log 2>&1) &
disown

# Wait for proxy to be ready
for i in $(seq 1 15); do
  sleep 1
  if ss -tlnp 2>/dev/null | grep -q ":3000 "; then
    echo "MAISON server ready on port 3000"
    exit 0
  fi
done
echo "WARNING: Server may not have started properly"
exit 1