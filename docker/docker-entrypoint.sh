#!/usr/bin/env sh
set -e

# Run migrations
node --run migration:run

# Run server via tini, as it can handle signals
exec /sbin/tini -- node server.js
