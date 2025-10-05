#!/bin/sh
set -e

if [ ! -d "node_modules/.pnpm" ]; then
  pnpm install --frozen-lockfile=false --prefer-offline
fi

exec "$@"
