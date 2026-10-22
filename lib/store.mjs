// File-backed state for RUPTURE Studio: manifest (artwork versions + approval) and the generation queue.
// Used by the server and by the CLI scripts, so state is re-read before every operation.

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const readJSON = async (file, fallback) => {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch (e) { if (e.code === 'ENOENT') return fallback; throw e; }
};

async function writeJSON(file, data) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, file);
}

export class Store {
  constructor(root) {
    this.root = root;
    this.files = {
      identity: path.join(root, 'data/identity.json'),
      collection: path.join(root, 'data/collection.json'),
      manifest: path.join(root, 'data/manifest.json'),
      queue: path.join(root, 'queue/jobs.json'),
      references: path.join(root, 'data/references.json'),
    };
    this.chain = Promise.resolve();
  }

  async load() {
    this.identity = await readJSON(this.files.identity);
    this.collection = await readJSON(this.files.collection);
    this.references = await readJSON(this.files.references, { items: [] });
    await this.refresh();
  }

  /** Re-read mutable state (the CLI or data files may have changed) and ensure every collection slot exists. */
  async refresh() {
    this.identity = await readJSON(this.files.identity, this.identity);
    this.collection = await readJSON(this.files.collection, this.collection);
    this.manifest = await readJSON(this.files.manifest, { artworks: {} });
    this.queue = await readJSON(this.files.queue, { jobs: [] });
    this.references = await readJSON(this.files.references, { items: [] });
    const validIds = new Set(this.collection.artworks.map((a) => a.id));
    for (const k of Object.keys(this.manifest.artworks)) {
      if (this.manifest.artworks[k].collection !== 'X' && !validIds.has(k)) delete this.manifest.artworks[k];
    }
    for (const a of this.collection.artworks) {
      this.manifest.artworks[a.id] ??= { id: a.id, collection: a.collection, status: 'empty', activeVersion: null, approvedVersion: null, versions: [] };
    }
  }

  /** Serialise all mutations so concurrent requests never interleave writes. */
  mutate(fn) {
    const next = this.chain.then(async () => {
      await this.refresh();
      const result = await fn();
      await writeJSON(this.files.collection, this.collection);
      await writeJSON(this.files.manifest, this.manifest);
      await writeJSON(this.files.queue, this.queue);
      await writeJSON(this.files.references, this.references);
      return result;
    });
    this.chain = next.catch(() => {});
    return next;
  }

  collectionRecord(id) { return this.collection.artworks.find((a) => a.id === id) || null; }

  entry(id) {
    const e = this.manifest.artworks[id];
    if (!e) throw Object.assign(new Error(`Unknown artwork ${id}`), { status: 404 });
    return e;
  }

  activeFile(id, { approvedOnly = false } = {}) {
    const e = this.manifest.artworks[id];
    if (!e || !e.activeVersion) return null;
    if (approvedOnly && e.status !== 'approved') return null;
    return e.versions.find((v) => v.v === e.activeVersion)?.file || null;
  }

  nextExplorationId() {
    const n = Object.keys(this.manifest.artworks).filter((k) => k.startsWith('RUPTURE_X')).length + 1;
    return `RUPTURE_X${String(n).padStart(3, '0')}`;
  }

  enqueue({ id, spec, prompt, references }) {
    return this.mutate(() => {
      this.manifest.artworks[id] ??= { id, collection: 'X', status: 'empty', activeVersion: null, approvedVersion: null, versions: [], spec };
      const job = { jobId: crypto.randomUUID().slice(0, 8), id, prompt, spec, references, createdAt: new Date().toISOString() };
      this.queue.jobs = this.queue.jobs.filter((j) => j.id !== id); // one pending job per artwork
      this.queue.jobs.push(job);
      this.manifest.artworks[id].pending = job.jobId;
      return job;
    });
  }

  dequeue(jobId) {
    return this.mutate(() => {
      const job = this.queue.jobs.find((j) => j.jobId === jobId);
      this.queue.jobs = this.queue.jobs.filter((j) => j.jobId !== jobId);
      if (job && this.manifest.artworks[job.id]) {
        const e = this.manifest.artworks[job.id];
        delete e.pending;
        // Drop exploration slots that never received an image.
        if (e.collection === 'X' && !e.versions.length) delete this.manifest.artworks[job.id];
      }
      return { removed: !!job };
    });
  }

  /** Store a new image version. Either `buffer` or `srcPath` must be given. New versions start as drafts. */
  addVersion(id, { buffer, srcPath, ext, prompt, spec, source, note }) {
    return this.mutate(async () => {
      const isMaster = id.startsWith('RUPTURE_M') || this.collection.artworks.some((a) => a.id === id && a.collection === '00');
      if (isMaster && !this.collection.artworks.some((a) => a.id === id)) {
        this.collection.artworks.push({
          id,
          collection: '00',
          pillars: ['liquid-geometry'],
          accent: spec?.accent || 'pale-cyan',
          secondary: spec?.secondary || 'lavender',
          treatment: spec?.treatment || 'sculptural-chrome',
          brief: `${note || prompt || id}: User uploaded reference master`,
          space: 'upper third',
        });
      }
      const e = this.manifest.artworks[id] ??= { id, collection: isMaster ? '00' : 'X', status: 'empty', activeVersion: null, approvedVersion: null, versions: [] };
      const v = (e.versions.at(-1)?.v || 0) + 1;
      const extension = (ext || path.extname(srcPath || '') || '.png').replace(/^\.?/, '.');
      const dir = e.collection === '00' ? 'artworks/masters' : 'artworks/raw';
      const rel = `${dir}/${id}_v${v}${extension}`;
      await fs.mkdir(path.join(this.root, dir), { recursive: true });
      if (buffer) await fs.writeFile(path.join(this.root, rel), buffer);
      else await fs.copyFile(srcPath, path.join(this.root, rel));
      const version = { v, file: rel, prompt, spec, source, note, createdAt: new Date().toISOString() };
      e.versions.push(version);
      e.activeVersion = v;
      e.status = 'draft';
      this.queue.jobs = this.queue.jobs.filter((j) => j.id !== id);
      delete e.pending;
      return version;
    });
  }

  setStatus(id, status) {
    return this.mutate(() => {
      const e = this.entry(id);
      if (!e.activeVersion) throw Object.assign(new Error('Nothing to approve yet'), { status: 400 });
      e.status = status;
      if (status === 'approved') e.approvedVersion = e.activeVersion;
      else if (e.approvedVersion === e.activeVersion) e.approvedVersion = null;
      return e;
    });
  }

  activate(id, v) {
    return this.mutate(() => {
      const e = this.entry(id);
      if (!e.versions.some((x) => x.v === v)) throw Object.assign(new Error(`No version ${v}`), { status: 404 });
      e.activeVersion = v;
      e.status = v === e.approvedVersion ? 'approved' : 'draft';
      return e;
    });
  }

  nextMasterId() {
    const existing = this.collection.artworks.filter((a) => a.collection === '00');
    let max = 0;
    for (const a of existing) {
      const m = /^RUPTURE_M(\d+)$/.exec(a.id);
      if (m) max = Math.max(max, Number(m[1]));
    }
    return `RUPTURE_M${String(max + 1).padStart(2, '0')}`;
  }

  addMasterSlot({ id, brief, accent = 'pale-cyan', secondary = 'lavender', treatment = 'sculptural-chrome', space = 'upper third' }) {
    if (!this.collection.artworks.some((a) => a.id === id)) {
      this.collection.artworks.push({
        id,
        collection: '00',
        pillars: ['liquid-geometry'],
        accent,
        secondary,
        treatment,
        brief,
        space,
      });
    }
  }

  addReference({ id, name, file, note = '', type = 'user' }) {
    return this.mutate(() => {
      this.references.items = (this.references.items || []).filter((r) => r.id !== id);
      const item = {
        id: id || `REF_${Date.now().toString(36).toUpperCase()}`,
        name: name || 'Uploaded Reference',
        file,
        type,
        note: note || '',
        createdAt: new Date().toISOString(),
      };
      this.references.items.unshift(item);
      return item;
    });
  }

  deleteReference(id) {
    return this.mutate(async () => {
      const items = this.references.items || [];
      const idx = items.findIndex((r) => r.id === id);
      if (idx === -1) return { removed: false };
      const [removed] = items.splice(idx, 1);
      if (removed?.file?.startsWith('references/user/')) {
        await fs.rm(path.join(this.root, removed.file), { force: true }).catch(() => {});
      }
      return { removed: true };
    });
  }
}

