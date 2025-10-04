#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const APP_DIR = path.resolve('.next/server/app');

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name === 'page_client-reference-manifest.js') {
      // existing manifest
    }
  }
}

function ensureForGroup(groupDir) {
  const manifestPath = path.join(groupDir, 'page_client-reference-manifest.js');
  if (fs.existsSync(manifestPath)) return;

  // find child manifests in subfolders
  const children = fs.readdirSync(groupDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .filter(name => fs.existsSync(path.join(groupDir, name, 'page_client-reference-manifest.js')))
    .map(name => `/( ${name} )`);

  // create a minimal placeholder manifest that won't break server-side lstat checks
  const content = `// Auto-generated placeholder manifest for ${path.relative(process.cwd(), groupDir)}\n`;
  try {
    fs.writeFileSync(manifestPath, content, { encoding: 'utf8' });
    console.log('Wrote placeholder manifest:', manifestPath);
  } catch (err) {
    console.error('Failed to write manifest', manifestPath, err);
  }
}

function main() {
  if (!fs.existsSync(APP_DIR)) return;
  const items = fs.readdirSync(APP_DIR, { withFileTypes: true });
  for (const item of items) {
    if (item.isDirectory()) {
      const dir = path.join(APP_DIR, item.name);
      ensureForGroup(dir);
    }
  }
}

main();
