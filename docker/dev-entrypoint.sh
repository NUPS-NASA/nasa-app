#!/bin/sh
set -e

if [ "$(id -u)" -eq 0 ]; then
  for dir in /workspace/.pnpm-store \
             /workspace/node_modules \
             /workspace/apps/server/node_modules \
             /workspace/apps/client/node_modules \
             /home/node/.local/share/pnpm; do
    if [ ! -d "$dir" ]; then
      mkdir -p "$dir"
    fi
    chown -R node:node "$dir"
  done

  exec su node -s /bin/sh -c 'exec "$@"' -- "$0" "$@"
fi

echo "Installing workspace dependencies with pnpm..."
pnpm install --frozen-lockfile

echo "Generating Prisma client..."
pnpm --filter @nups-nasa/server exec prisma generate

exec "$@"
