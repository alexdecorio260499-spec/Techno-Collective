#!/usr/bin/env node
// Agent / CLI helpers for RUPTURE Studio.
//
//   node scripts/studio.mjs prompt RUPTURE_01_03          → print the engine prompt for an artwork
//   node scripts/studio.mjs queue                         → list pending generation jobs
//   node scripts/studio.mjs ingest RUPTURE_01_03 img.jpg  → add an image as a new version
//        [--note "text"] [--prompt-file p.txt] [--approve]
//   node scripts/studio.mjs approve RUPTURE_01_03

import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Store } from '../lib/store.mjs';
import { buildPrompt, specFromArtwork } from '../public/src/prompt-engine.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const store = new Store(ROOT);
await store.load();

const [cmd, id, file, ...rest] = process.argv.slice(2);
const flag = (name) => {
  const all = [file, ...rest];
  const i = all.indexOf(`--${name}`);
  return i === -1 ? undefined : all[i + 1] ?? true;
};

function promptFor(artId) {
  const job = store.queue.jobs.find((j) => j.id === artId);
  if (job) return { prompt: job.prompt, spec: job.spec, references: job.references };
  const art = store.collectionRecord(artId);
  if (!art) throw new Error(`Unknown artwork ${artId}`);
  const spec = specFromArtwork(art);
  return { prompt: buildPrompt(store.identity, spec), spec };
}

switch (cmd) {
  case 'prompt': {
    console.log(promptFor(id).prompt);
    break;
  }
  case 'queue': {
    if (!store.queue.jobs.length) console.log('Queue empty.');
    for (const j of store.queue.jobs) console.log(`${j.jobId}  ${j.id}  ${j.createdAt}  refs:${(j.references || []).length}`);
    break;
  }
  case 'ingest': {
    if (!id || !file) throw new Error('Usage: ingest <ID> <image> [--note text] [--prompt-file f] [--approve]');
    const pf = flag('prompt-file');
    const base = promptFor(id);
    const prompt = typeof pf === 'string' ? await fs.readFile(pf, 'utf8') : base.prompt;
    const v = await store.addVersion(id, { srcPath: path.resolve(file), prompt, spec: base.spec, source: 'agent', note: flag('note') });
    if (flag('approve')) await store.setStatus(id, 'approved');
    console.log(`${id} ← v${v.v} (${v.file})${flag('approve') ? ' [approved]' : ''}`);
    break;
  }
  case 'approve': {
    await store.setStatus(id, 'approved');
    console.log(`${id} approved`);
    break;
  }
  default:
    console.log('Commands: prompt <ID> | queue | ingest <ID> <image> [--note] [--prompt-file] [--approve] | approve <ID>');
}
