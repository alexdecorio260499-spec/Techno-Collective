import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function buildStaticState() {
  console.log('Building static state snapshot for Vercel deployment...');

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

  const outPath = path.join(ROOT, 'data/state.json');
  await fs.writeFile(outPath, JSON.stringify(state, null, 2), 'utf8');

  console.log(`✓ Static state written to data/state.json (${exportFiles.length} exports recorded, ${Object.keys(manifest.artworks || {}).length} artworks compiled)`);
}

buildStaticState().catch((err) => {
  console.error('Failed to build static state:', err);
  process.exit(1);
});
