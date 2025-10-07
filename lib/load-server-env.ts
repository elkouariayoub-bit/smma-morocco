import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

const GLOBAL_FLAG = '__SMMA_ENV_LOADED__';

export function loadServerEnv() {
  if (typeof process === 'undefined' || process.release?.name !== 'node') {
    return;
  }

  const scope = globalThis as Record<string, unknown>;
  if (scope[GLOBAL_FLAG]) {
    return;
  }

  const projectRoot = process.cwd();
  const defaultPath = path.join(projectRoot, '.env');
  const localPath = path.join(projectRoot, '.env.local');

  if (fs.existsSync(defaultPath)) {
    dotenv.config({ path: defaultPath, override: false });
  }

  if (fs.existsSync(localPath)) {
    dotenv.config({ path: localPath, override: true });
  }

  scope[GLOBAL_FLAG] = true;
}
