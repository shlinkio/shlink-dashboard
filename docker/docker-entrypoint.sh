#!/usr/bin/env sh
set -e

# Run migrations
node --run migration:run

exec node server.js
