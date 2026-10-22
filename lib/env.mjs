import { readFileSync, existsSync } from 'node:fs';

/** Minimal .env loader (KEY=value lines, # comments). Existing env vars win. */
export function loadEnv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!m || line.trim().startsWith('#')) continue;
    const value = m[2].replace(/^['"]|['"]$/g, '');
    if (value && process.env[m[1]] === undefined) process.env[m[1]] = value;
  }
}
