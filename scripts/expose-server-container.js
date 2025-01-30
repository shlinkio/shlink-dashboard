/**
 * Update generated server bundle so that it exports the serverContainer, in order to use it by the server.js script
 */
import { readFileSync, writeFileSync } from 'node:fs';

const serverBundle = 'build/server/index.js';
const serverBundleContent = readFileSync(serverBundle).toString();

// FIXME This logic is brittle. Would be better to use some kind of vite plugin
writeFileSync(
  serverBundle,
  serverBundleContent.replace(', routes };', ', routes, serverContainer };'),
);
