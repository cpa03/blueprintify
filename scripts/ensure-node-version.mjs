#!/usr/bin/env node

/**
 * Ensures the current Node.js version meets the project requirement (>=22).
 * Used as a preinstall / postinstall check to provide clear error messages.
 *
 * Usage: node scripts/ensure-node-version.mjs
 */

const REQUIRED_MAJOR = 22;
const current = process.version; // e.g., "v20.20.2"
const major = parseInt(current.slice(1).split('.')[0], 10);

if (major < REQUIRED_MAJOR) {
  const message = [
    `❌ Node.js ${current} is too old.`,
    `   This project requires Node.js ${REQUIRED_MAJOR}+.`,
    `   Please upgrade using nvm, fnm, or your package manager:`,
    ``,
    `   nvm install ${REQUIRED_MAJOR}`,
    `   nvm use ${REQUIRED_MAJOR}`,
    ``,
    `   Or see .nvmrc / .node-version for the exact version.`,
  ].join('\n');

  console.error(message);
  process.exit(1);
}

console.log(`✅ Node.js ${current} meets minimum requirement (${REQUIRED_MAJOR}+)`);
