import fs from 'node:fs/promises';
import { cpSync, existsSync, rmSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

async function build() {
  console.log('🚀 Building RUPTURE Studio static site for Vercel...');

  // 1. Compile state.json
  const identityPath = path.join(ROOT, 'data/identity.json');
  const collectionPath = path.join(ROOT, 'data/collection.json');
  const manifestPath = path.join(ROOT, 'data/manifest.json');
  const referencesPath = path.join(ROOT, 'data/references.json');
  const queuePath = path.join(ROOT, 'queue/jobs.json');
  const exportsDir = path.join(ROOT, 'exports');

  const [identityRaw, collectionRaw, manifestRaw, referencesRaw, queueRaw, exportFiles] = await Promise.all([
    fs.readFile(identityPath, 'utf8').catch(() => '{}'),
    fs.readFile(collectionPath, 'utf8').catch(() => '{}'),
    fs.readFile(manifestPath, 'utf8').catch(() => '{}'),
    fs.readFile(referencesPath, 'utf8').catch(() => '{"items":[]}'),
    fs.readFile(queuePath, 'utf8').catch(() => '[]'),
    fs.readdir(exportsDir).then((l) => l.filter((f) => /^RUPTURE_.*\.(png|jpg)$/.test(f))).catch(() => []),
  ]);

  const identity = JSON.parse(identityRaw);
  const collection = JSON.parse(collectionRaw);
  const manifest = JSON.parse(manifestRaw);
  const references = JSON.parse(referencesRaw);
  const queue = JSON.parse(queueRaw);

  const state = {
    mode: 'queue',
    model: null,
    identity,
    collection,
    manifest,
    queue: Array.isArray(queue) ? queue : [],
    references: references.items || [],
    exports: exportFiles,
  };

  const stateJsonPath = path.join(ROOT, 'data/state.json');
  await fs.writeFile(stateJsonPath, JSON.stringify(state, null, 2), 'utf8');
  console.log(`✓ Compiled data/state.json (${exportFiles.length} exports, ${Object.keys(manifest.artworks || {}).length} artworks)`);

  // 2. Prepare clean dist/ folder
  if (existsSync(DIST)) {
    rmSync(DIST, { recursive: true, force: true });
  }
  mkdirSync(DIST, { recursive: true });

  // 3. Copy public assets directly into dist root
  cpSync(path.join(ROOT, 'public'), DIST, { recursive: true });
  console.log('✓ Copied public assets (index.html, styles.css, app.js, prompt-engine)');

  // 4. Copy data directory
  cpSync(path.join(ROOT, 'data'), path.join(DIST, 'data'), { recursive: true });
  console.log('✓ Copied data directory');

  // 5. Copy artwork masters
  cpSync(path.join(ROOT, 'artworks'), path.join(DIST, 'artworks'), { recursive: true });
  console.log('✓ Copied artworks directory');

  // 6. Copy exports
  cpSync(path.join(ROOT, 'exports'), path.join(DIST, 'exports'), { recursive: true });
  console.log('✓ Copied exports directory');

  // 7. Copy references
  cpSync(path.join(ROOT, 'references'), path.join(DIST, 'references'), { recursive: true });
  console.log('✓ Copied references directory');

  console.log('✨ Build complete! Static site ready in dist/ directory.');
}

build().catch((err) => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
