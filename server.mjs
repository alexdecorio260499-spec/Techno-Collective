// RUPTURE Studio — local server. Node >= 18, no dependencies.
// Run: npm start  →  http://localhost:4747

import http from 'node:http';
import fs from 'node:fs/promises';
import { createReadStream, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { buildPrompt, specFromArtwork, randomiseSpec } from './public/src/prompt-engine.mjs';
import { loadEnv } from './lib/env.mjs';
import { Store } from './lib/store.mjs';

const run = promisify(execFile);
const ROOT = path.dirname(fileURLToPath(import.meta.url));
loadEnv(path.join(ROOT, '.env'));
const PORT = Number(process.env.PORT || 4747);

const store = new Store(ROOT);
let provider = null;
if (process.env.GEMINI_API_KEY) {
  provider = (await import('./providers/gemini.mjs')).createProvider({
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash-image',
  });
}
const mode = () => (provider ? 'api' : 'queue');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2',
};

const json = (res, code, body) => {
  res.writeHead(code, { 'Content-Type': MIME['.json'], 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
};

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw httpError(400, 'Invalid JSON body'); }
}

function httpError(status, message) { return Object.assign(new Error(message), { status }); }

/** Resolve a URL path inside an allowed directory, refusing traversal. */
function safeJoin(base, urlPath) {
  const p = path.normalize(path.join(base, decodeURIComponent(urlPath)));
  if (!p.startsWith(base + path.sep) && p !== base) return null;
  return p;
}

async function serveFile(res, file, extraHeaders = {}) {
  try {
    const st = await fs.stat(file);
    if (!st.isFile()) throw new Error('not a file');
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Content-Length': st.size,
      'Cache-Control': 'no-cache',
      ...extraHeaders,
    });
    createReadStream(file).pipe(res);
  } catch {
    json(res, 404, { error: 'Not found' });
  }
}

// ---------- generation ----------

/** Resolve the spec + prompt for a generation request. */
function resolveRequest(body, target) {
  const art = target && store.collectionRecord(target);
  let spec = body.spec || (art ? specFromArtwork(art) : {});
  if (body.randomise) spec = randomiseSpec(store.identity, spec, body.seed);
  if (body.instructions) spec = { ...spec, instructions: body.instructions };
  const prompt = (body.prompt && body.prompt.trim()) || buildPrompt(store.identity, spec);
  return { spec, prompt };
}

/** Pick reference images: custom selected references or approved masters for the involved pillars (max 3). */
function referencesFor(spec) {
  if (Array.isArray(spec?.references) && spec.references.length) {
    return spec.references.filter((r) => typeof r === 'string' && r.length).slice(0, 3);
  }
  const ids = (spec?.pillars || []).map((p) => (typeof p === 'string' ? p : p.id));
  const masterByPillar = Object.fromEntries(
    store.collection.artworks.filter((a) => a.collection === '00').map((a) => [a.pillars[0], a.id]),
  );
  return ids
    .map((pid) => masterByPillar[pid])
    .filter(Boolean)
    .map((mid) => store.activeFile(mid, { approvedOnly: true }))
    .filter(Boolean)
    .slice(0, 3);
}

async function generate(target, body) {
  const id = target || store.nextExplorationId();
  const { spec, prompt } = resolveRequest(body, target);
  if (!provider) {
    const job = await store.enqueue({ id, spec, prompt, references: referencesFor(spec) });
    return { mode: 'queue', id, job };
  }
  const refs = referencesFor(spec).map((rel) => path.join(ROOT, rel));
  const { buffer, ext } = await provider.generate({ prompt, references: refs });
  const version = await store.addVersion(id, { buffer, ext, prompt, spec, source: `api:${provider.model}` });
  return { mode: 'api', id, version };
}

// ---------- export ----------

const EXPORT_W = 1080;
const EXPORT_H = 1920;

/** Centre-crop to exact 9:16, then resample to 1080×1920 with macOS sips. */
async function exportArtwork(id, format = 'png') {
  const rel = store.activeFile(id);
  if (!rel) throw httpError(404, `No image for ${id}`);
  const src = path.join(ROOT, rel);
  const fmt = format === 'jpg' || format === 'jpeg' ? 'jpeg' : 'png';
  const ext = fmt === 'jpeg' ? 'jpg' : 'png';
  const outDir = path.join(ROOT, 'exports');
  await fs.mkdir(outDir, { recursive: true });
  const tmp = path.join(outDir, `.tmp_${id}${path.extname(src)}`);
  const out = path.join(outDir, `${id}.${ext}`);

  const { stdout } = await run('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', src]);
  const w = Number(/pixelWidth: (\d+)/.exec(stdout)[1]);
  const h = Number(/pixelHeight: (\d+)/.exec(stdout)[1]);
  let cw = w, ch = h;
  if (w / h > 9 / 16) cw = Math.round((h * 9) / 16); else ch = Math.round((w * 16) / 9);

  await fs.copyFile(src, tmp);
  if (cw !== w || ch !== h) await run('sips', ['-c', String(ch), String(cw), tmp]);
  const args = ['-z', String(EXPORT_H), String(EXPORT_W), '-s', 'format', fmt];
  if (fmt === 'jpeg') args.push('-s', 'formatOptions', '95');
  await run('sips', [...args, tmp, '--out', out]);
  await fs.rm(tmp, { force: true });
  return { id, file: `exports/${id}.${ext}`, width: EXPORT_W, height: EXPORT_H, cropFrom: [w, h], cropTo: [cw, ch] };
}

async function handleUpload(body) {
  if (Array.isArray(body.items)) {
    const results = [];
    for (const item of body.items) {
      results.push(await processUploadItem(item));
    }
    return { ok: true, count: results.length, items: results };
  }
  return processUploadItem(body);
}

async function processUploadItem(body) {
  const { data, name, title, note, target, slot, accent, secondary, treatment } = body;
  if (!data) throw httpError(400, 'Missing image data');
  const match = /^data:(image\/[\w+]+);base64,(.+)$/.exec(data);
  const mime = match ? match[1] : 'image/png';
  const b64 = match ? match[2] : data;
  const buffer = Buffer.from(b64, 'base64');
  const ext = mime.includes('jpeg') ? '.jpg' : mime.includes('webp') ? '.webp' : '.png';
  const safeBase = (path.basename(name || 'upload', path.extname(name || '')).replace(/[^a-zA-Z0-9_-]/g, '_') || 'upload').slice(0, 40);

  if (target === 'master') {
    const masterId = (slot && slot !== 'NEW') ? slot : store.nextMasterId();
    const version = await store.addVersion(masterId, {
      buffer,
      ext,
      prompt: `Uploaded master reference: ${title || safeBase}`,
      spec: { pillars: [{ id: 'liquid-geometry', weight: 1 }], accent: accent || 'pale-cyan', secondary: secondary || 'lavender', treatment: treatment || 'sculptural-chrome' },
      source: 'user-upload',
      note: `${title || safeBase}${note ? ': ' + note : ''}`,
    });
    await exportArtwork(masterId, 'png').catch((e) => console.error('Export PNG error:', e));
    await exportArtwork(masterId, 'jpg').catch((e) => console.error('Export JPG error:', e));
    return { ok: true, type: 'master', id: masterId, version };
  }

  // Default: Visual Reference / Moodboard
  const refDir = path.join(ROOT, 'references/user');
  await fs.mkdir(refDir, { recursive: true });
  const refId = `REF_${Date.now().toString(36).toUpperCase()}_${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const relFile = `references/user/${refId}_${safeBase}${ext}`;
  await fs.writeFile(path.join(ROOT, relFile), buffer);
  const item = await store.addReference({
    id: refId,
    name: title || name || 'Uploaded Reference',
    file: relFile,
    note: note || '',
    type: 'user',
  });
  return { ok: true, type: 'reference', item };
}

// ---------- router ----------

const routes = [
  ['GET', /^\/api\/state$/, async () => ({
    mode: mode(), model: provider?.model || null,
    identity: store.identity, collection: store.collection, manifest: store.manifest, queue: store.queue,
    references: store.references?.items || [],
    exports: await fs.readdir(path.join(ROOT, 'exports')).then((l) => l.filter((f) => /^RUPTURE_.*\.(png|jpg)$/.test(f))).catch(() => []),
  })],
  ['POST', /^\/api\/upload$/, async (_m, body) => handleUpload(body)],
  ['DELETE', /^\/api\/references\/([\w-]+)$/, async ([, id]) => store.deleteReference(id)],
  ['POST', /^\/api\/prompt$/, async (_m, body) => resolveRequest(body, body.target)],
  ['POST', /^\/api\/generate$/, async (_m, body) => generate(body.target || null, body)],
  ['POST', /^\/api\/regenerate\/([\w]+)$/, async ([, id], body) => generate(id, body)],
  ['POST', /^\/api\/approve\/([\w]+)$/, async ([, id]) => store.setStatus(id, 'approved')],
  ['POST', /^\/api\/unapprove\/([\w]+)$/, async ([, id]) => store.setStatus(id, 'draft')],
  ['POST', /^\/api\/activate\/([\w]+)$/, async ([, id], body) => store.activate(id, Number(body.v))],
  ['DELETE', /^\/api\/queue\/([\w-]+)$/, async ([, jobId]) => store.dequeue(jobId)],
  ['POST', /^\/api\/export\/([\w]+)$/, async ([, id], body, q) => exportArtwork(id, q.get('format') || body.format)],
  ['POST', /^\/api\/export-approved$/, async (_m, body, q) => {
    const fmt = q.get('format') || body.format || 'png';
    const ids = Object.values(store.manifest.artworks).filter((a) => a.status === 'approved').map((a) => a.id);
    const results = [];
    for (const id of ids) results.push(await exportArtwork(id, fmt));
    return { count: results.length, results };
  }],
];

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const p = url.pathname;
  try {
    if (p.startsWith('/api/')) {
      await store.refresh();
      for (const [method, re, handler] of routes) {
        const m = re.exec(p);
        if (m && req.method === method) {
          const body = method === 'GET' ? {} : await readBody(req);
          return json(res, 200, await handler(m, body, url.searchParams));
        }
      }
      return json(res, 404, { error: 'Unknown route' });
    }
    // Real file downloads — the exported file on disk, served as an attachment.
    if (p.startsWith('/download/')) {
      const file = safeJoin(path.join(ROOT, 'exports'), p.slice('/download/'.length));
      if (!file || !existsSync(file)) return json(res, 404, { error: 'Export not found — export it first' });
      return serveFile(res, file, { 'Content-Disposition': `attachment; filename="${path.basename(file)}"` });
    }
    for (const dir of ['artworks', 'exports', 'data', 'references']) {
      if (p.startsWith(`/${dir}/`)) {
        const file = safeJoin(path.join(ROOT, dir), p.slice(dir.length + 2));
        return file ? serveFile(res, file) : json(res, 403, { error: 'Forbidden' });
      }
    }
    const file = safeJoin(path.join(ROOT, 'public'), p === '/' ? 'index.html' : p.slice(1));
    return file ? serveFile(res, file) : json(res, 403, { error: 'Forbidden' });
  } catch (err) {
    console.error(err);
    json(res, err.status || 500, { error: err.message });
  }
});

await store.load();
server.listen(PORT, () => {
  console.log(`RUPTURE Studio → http://localhost:${PORT}  [mode: ${mode()}${provider ? ` · ${provider.model}` : ''}]`);
});
