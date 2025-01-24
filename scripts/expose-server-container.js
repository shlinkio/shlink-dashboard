/**
 * Update generated server bundle so that it exports the serverContainer, in order to use it by the server.js script
 */
import { readFileSync, writeFileSync } from 'node:fs';

const serverBundle = 'build/server/index.js';
const [lastLine, prevToLastLine, ...allLines] = readFileSync(serverBundle).toString().split('\n').reverse();

// Last two lines are the closing curly braces, and an empty line. We need to insert the export of the serverContainer
// right before the curly brace

writeFileSync(
  serverBundle,
  Buffer.from([...allLines.reverse(), '  ,serverContainer,', prevToLastLine, lastLine].join('\n')),
);
