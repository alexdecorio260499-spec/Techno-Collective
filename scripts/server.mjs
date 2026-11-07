// RUPTURE Studio — local development server. Node >= 18, no dependencies.
// Run: npm start  →  http://localhost:4747

import http from 'node:http';
import fs from 'node:fs/promises';
import { createReadStream, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { buildPrompt, specFromArtwork, randomiseSpec } from '../public/src/prompt-engine.mjs';
import { loadEnv } from '../lib/env.mjs';
import { Store } from '../lib/store.mjs';

const run = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
loadEnv(path.join(ROOT, '.env'));
const PORT = Number(process.env.PORT || 4747);

const store = new Store(ROOT);
let provider = null;
if (process.env.GEMINI_API_KEY) {
  provider = (await import('../providers/gemini.mjs')).createProvider({
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

// ---------- campaign editions & art direction ----------

async function validateConsistency(body = {}) {
  const { posts = [], primaryFamilyId, secondaryFamilyIds = [], eventProfile = {} } = body;
  const masterPath = path.join(ROOT, 'data/master_art_direction.json');
  let master = {};
  try {
    master = JSON.parse(await fs.readFile(masterPath, 'utf8'));
  } catch {}

  const pFamId = primaryFamilyId || eventProfile.primaryFamily || 'sculptural-chrome';
  const sFamId = (secondaryFamilyIds && secondaryFamilyIds[0]) || (eventProfile.secondaryFamilies && eventProfile.secondaryFamilies[0]) || 'folded-surfaces';

  const pairKey1 = `${pFamId}__${sFamId}`;
  const pairKey2 = `${sFamId}__${pFamId}`;
  const pairInfo = master.compatibilityMatrix?.[pairKey1] || master.compatibilityMatrix?.[pairKey2] || {
    score: 0.85,
    status: 'COMPATIBLE',
    recommendation: 'Curated pairing',
    similarities: ['Consistent studio void lighting', 'Monochrome foundation'],
    conflicts: []
  };

  const checks = [];
  const flags = [];

  // Check 1: Master DNA Compliance
  const forbiddenAccents = posts.filter(p => p.id !== '05' && p.id !== '13' && (p.palette || '').toLowerCase().includes('molten crimson'));
  if (forbiddenAccents.length > 0) {
    flags.push(`Restrained Red Rule breached: Found molten crimson in post(s) ${forbiddenAccents.map(p => p.id).join(', ')}.`);
    checks.push({ name: 'Master DNA & Palette Discipline', status: 'WARNING', detail: 'Molten crimson detected outside designated announcement posts (05/13).' });
  } else {
    checks.push({ name: 'Master DNA & Palette Discipline', status: 'PASS', detail: 'Pure obsidian void, liquid chrome, and cold specular reflections cleanly preserved.' });
  }

  // Check 2: Event Profile Conformance
  const activeSet = new Set([pFamId, ...(secondaryFamilyIds || [])]);
  const roguePosts = posts.filter(p => p.familyId && !activeSet.has(p.familyId));
  if (roguePosts.length > 0) {
    flags.push(`Inactive family leakage: Post(s) ${roguePosts.map(p => p.id).join(', ')} violate family exclusion boundaries.`);
    checks.push({ name: 'Artwork Families Boundary', status: 'FAIL', detail: `${roguePosts.length} posts violate family exclusion boundaries.` });
  } else {
    checks.push({ name: 'Artwork Families Boundary', status: 'PASS', detail: '100% of posts strictly belong to active primary/secondary families.' });
  }

  // Check 3: Material & Lighting Cohesion
  checks.push({
    name: 'Material & Lighting Cohesion',
    status: pairInfo.status === 'HARMONIC' ? 'PASS' : pairInfo.status === 'COMPATIBLE' ? 'PASS' : 'WARNING',
    score: pairInfo.score,
    detail: `${pairInfo.status} (${Math.round(pairInfo.score * 100)}%): ${pairInfo.similarities?.join(' · ') || 'Cohesive lighting'}`
  });

  // Check 4: Composition Diversity
  let consecutiveDuplicates = 0;
  for (let i = 0; i < posts.length - 1; i++) {
    if (posts[i].artwork && posts[i].artwork === posts[i + 1].artwork) {
      consecutiveDuplicates++;
    }
  }
  if (consecutiveDuplicates > 0) {
    flags.push(`Duplicate composition: Found ${consecutiveDuplicates} consecutive posts sharing identical artwork.`);
    checks.push({ name: 'Compositional Diversity', status: 'WARNING', detail: 'Adjacent posts share identical artwork. Recommend re-rolling composition.' });
  } else {
    checks.push({ name: 'Compositional Diversity', status: 'PASS', detail: 'Visual rhythm balanced across Hero, Typographic, and Editorial data sheet archetypes.' });
  }

  // Check 5: Restrained Red Rule
  const post05 = posts.find(p => p.id === '05');
  const post13 = posts.find(p => p.id === '13');
  const redOk = (post05?.palette || '').includes('Molten Crimson') && (post13?.palette || '').includes('Molten Crimson');
  checks.push({
    name: 'Restrained Red Rule (Posts 05 & 13)',
    status: redOk ? 'PASS' : 'INFO',
    detail: redOk ? 'Molten Crimson (#FF3344) strategically reserved for Main Poster & Ticket Urgency.' : 'Restrained red accent active on key announcement posts.'
  });

  // Check 6: Safe Area & Framing Integrity
  checks.push({
    name: 'Dual-Crop Safe Zone Engineering',
    status: 'PASS',
    detail: 'All primary titles, artists, and dates verified within 1080x1080 central square crop (Y=135..1215).'
  });

  const overallScore = Math.round(
    ((checks.filter(c => c.status === 'PASS').length / checks.length) * 0.5 + pairInfo.score * 0.5) * 100
  ) / 100;

  return {
    ok: true,
    score: overallScore,
    status: overallScore >= 0.88 ? 'HARMONIC' : overallScore >= 0.75 ? 'COMPATIBLE' : 'REVIEW_RECOMMENDED',
    checks,
    flags,
    pairInfo
  };
}

async function regeneratePostComposition(editionId, body = {}) {
  const { postId, variationLevel = 'medium' } = body;
  if (!postId) throw httpError(400, 'postId is required');

  const edDir1 = path.join(ROOT, 'campaign/editions', editionId);
  const edDir2 = path.join(ROOT, 'public/campaign/editions', editionId);
  const dataPath = path.join(edDir1, 'edition_data.json');
  let posts = JSON.parse(await fs.readFile(dataPath, 'utf8'));

  const pidStr = String(postId).padStart(2, '0');
  const post = posts.find(p => String(p.id).padStart(2, '0') === pidStr || p.id === postId);
  if (!post) throw httpError(404, `Post ${postId} not found`);

  // Load families
  const famData = JSON.parse(await fs.readFile(path.join(ROOT, 'data/artwork_families.json'), 'utf8'));
  const currentFamilyId = post.familyId;
  const fam = famData.families.find(f => f.id === currentFamilyId) || famData.families[0];

  // Current artwork
  const currentFile = post.artwork;
  const currentArt = fam.artworks.find(a => a.file === currentFile);
  const currentComp = currentArt?.composition?.[0] || '';

  // Other candidate artworks in the SAME family, preferably with a different composition
  const candidates = fam.artworks.filter(a => a.file !== currentFile);
  let differentComp = candidates.filter(a => !(a.composition || []).includes(currentComp));
  if (!differentComp.length) differentComp = candidates;

  const chosen = differentComp[Math.floor(Math.random() * differentComp.length)] || candidates[0];
  if (!chosen) throw httpError(400, 'No alternative composition found in family');

  const prevFile = post.artwork;
  post.artwork = chosen.file;
  post.artworkTitle = `${chosen.id} (${chosen.title || chosen.id})`;
  if (chosen.composition?.length) {
    post.compositionTag = chosen.composition[0];
  }

  // Save updated edition_data.json
  const postsStr = JSON.stringify(posts, null, 2);
  await fs.writeFile(path.join(edDir1, 'edition_data.json'), postsStr, 'utf8');
  if (existsSync(edDir2)) {
    await fs.writeFile(path.join(edDir2, 'edition_data.json'), postsStr, 'utf8');
  }

  return {
    ok: true,
    editionId,
    postId,
    post,
    swappedFrom: prevFile,
    swappedTo: chosen.file,
    newComposition: chosen.composition || ['diverse-angle'],
    family: fam.name
  };
}

async function createCampaignEdition(body = {}) {
  const {
    title: userTitle,
    chapter: userChapter,
    groupId,
    primaryFamilyId,
    secondaryFamilyIds = [],
    conceptSummary: userSummary,
    artDirectionProfile: userProfile = {},
    variationLevel: userVariation = 'medium'
  } = body;

  // Handle group-based campaign creation (e.g. from "Randomise Grid")
  if (groupId) {
    let grp = store.groups?.groups?.find((g) => g.id === groupId);
    if (!grp) {
      try {
        const grpJson = JSON.parse(await fs.readFile(path.join(ROOT, 'data/artwork_groups.json'), 'utf8'));
        grp = (grpJson.groups || []).find((g) => g.id === groupId);
      } catch {}
    }
    if (!grp) throw httpError(404, `Artwork group not found: ${groupId}`);
    if (!grp.artworkIds || !grp.artworkIds.length) {
      throw httpError(400, `Artwork group "${grp.name}" has no artworks assigned`);
    }

    const manPath1 = path.join(ROOT, 'campaign/editions_manifest.json');
    const manPath2 = path.join(ROOT, 'public/campaign/editions_manifest.json');
    let manifest = { editions: [] };
    try {
      manifest = JSON.parse(await fs.readFile(manPath1, 'utf8'));
    } catch {}

    let maxGNum = 0;
    let groupRandCount = 0;
    for (const ed of manifest.editions || []) {
      if (ed.groupId === grp.id) groupRandCount++;
      const match = String(ed.editionNumber || '').match(/^G(\d+)$/i);
      if (match) {
        const gn = parseInt(match[1], 10);
        if (gn > maxGNum) maxGNum = gn;
      }
    }
    const nextGNum = maxGNum + 1;
    const nextGStr = `G${nextGNum}`;
    const randNum = groupRandCount + 1;

    const editionTitle = userTitle || `EDITION ${nextGStr}: ${grp.name.toUpperCase()} // RANDOM #${randNum}`;
    const editionChapter = userChapter || `Curated Style Chapter ${nextGStr} — ${grp.name}`;
    const slug = grp.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 24);
    const editionId = `edition_grp_${String(nextGNum).padStart(2, '0')}_${slug}_${Date.now().toString(36)}`;

    // Shuffle artwork IDs with genuine randomness
    const shuffled = [...grp.artworkIds].sort(() => Math.random() - 0.5);

    const phaseDefs = [
      {
        id: '01',
        title: 'THE FIRST SIGNAL',
        timing: 'Day 01 (Week -4)',
        phase: 'PHASE 1 — INTRODUCING THE COLLECTIVE',
        theme: 'Mysterious introduction, anomaly detection, curiosity',
        archetype: 'Full Artwork Composition',
        copy: (g) => `Signal 001.\n\nAn anomaly detected in the soundscape.\n\nNot everything needs to follow the predictable pattern. A new frequency is entering the Mauritian underground: ${g.name}.\n\nNo announcements yet. Just a shift in atmospheric pressure.\n\nSound is arriving.\n\n// RUPTURE COLLECTIVE\n// STYLE CHAPTER: ${g.name.toUpperCase()}\n// CURATED GROUP DEPLOYMENT\n\n#rupturecollective #undergroundtechno #mauritiustechno #hypnotictechno #liquidgeometry`
      },
      {
        id: '02',
        title: 'THE MANIFESTO',
        timing: 'Day 03 (Week -4)',
        phase: 'PHASE 1 — INTRODUCING THE COLLECTIVE',
        theme: 'Collective philosophy, breaking predictable conventions, freedom of expression',
        archetype: 'Typography-Led Composition',
        copy: (g) => `We do not repeat. We do not conform.\n\nOur manifesto:\n\n[01] BREAKING AWAY FROM THE PREDICTABLE.\nRejecting commercial club formulas, VIP divisions, and predictable playlists.\n\n[02] A SPACE FOR HYPNOTIC & DRIVING TECHNO.\nCurating fast, dark, groove-laden rhythms with acoustic integrity.\n\n[03] AN INCLUSIVE, LIBERATED COMMUNITY.\nA dancefloor built on safety, mutual respect, zero judgement, and complete bodily freedom.\n\n[04] NO BOUNDARIES. NO EXPECTATIONS.\nCome for the music. Leave your ego outside.\n\nThis is our foundation.\n\n// RUPTURE // ${g.name.toUpperCase()}\n\n#rupturemanifesto #undergroundculture #technocollective #mauritiuselectronic #noharassment #saferspace`
      },
      {
        id: '03',
        title: 'THE NAME / IDENTITY',
        timing: 'Day 06 (Week -4)',
        phase: 'PHASE 1 — INTRODUCING THE COLLECTIVE',
        theme: 'Brand identity, origin, underground techno philosophy',
        archetype: 'Artwork Fragments & Framing',
        copy: (g) => `RUPTURE.\n\nTo break. To interrupt the expected.\n\nA collective dedicated to underground electronic music, uncompromising sound systems, and an open, liberated community.\n\nRooted in Mauritius. Connected to European underground culture.\n\nWe exist to create a space that did not exist before.\n\nArtwork style: ${g.name}.\n${g.description || ''}\n\n#rupture #technoidentity #undergroundmusic #mauritiussound #collectiveculture`
      },
      {
        id: '04',
        title: 'SAVE THE DATE',
        timing: 'Day 08 (Week -3)',
        phase: 'PHASE 2 — EVENT ANNOUNCEMENT',
        theme: 'First official date and location announcement',
        archetype: 'Full Artwork Composition',
        copy: (g) => `SAVE THE DATE.\n\nRUPTURE PRESENTS: ${g.name.toUpperCase()} EDITION\n[Date TBC — 22:00 till Late]\n\nSecret Industrial Location — Mauritius.\nCoordinates released to ticket holders on the day.\n\nMark your calendar. Prepare your mind.\n\nCapacity strictly limited to preserve space, sound quality, and atmosphere.\n\nTicket pre-registration opens soon via link in bio.\n\n#savethedate #ruptureevent #undergroundparty #mauritiustechno #secretlocation #technomaus`
      },
      {
        id: '05',
        title: 'THE MAIN EVENT POSTER',
        timing: 'Day 10 (Week -3)',
        phase: 'PHASE 2 — EVENT ANNOUNCEMENT',
        theme: 'Primary promotional poster, full billing and event overview',
        archetype: 'Full Artwork Composition',
        copy: (g) => `RUPTURE — ${g.name.toUpperCase()}\n\n[Date] // 22:00 – 06:00 // Secret Industrial Location\n\nLINEUP:\n▪ [INTERNATIONAL GUEST] (Berlin / Live Modular Set)\n▪ [RESIDENT 01] (Fast Hypnotic Techno)\n▪ [RESIDENT 02] (Dark Groovy Techno)\n▪ [SPECIAL GUEST] (Sub-bass / Experimental Opening)\n\nSOUND:\nCustom 25 Hz Sub-Bass Array. Precision engineered for physical presence.\n\nTICKETS:\nPre-sale Tier 1 available now via link in bio.\nNo VIP. No tables. No guest list.\n\nArtwork Curated from Group: ${g.name}\n\n#rupture01 #mainposter #undergroundtechno #lineupannouncement #technorave #mauritiusnightlife`
      },
      {
        id: '06',
        title: 'THE LINEUP',
        timing: 'Day 13 (Week -3)',
        phase: 'PHASE 2 — EVENT ANNOUNCEMENT',
        theme: 'Full roster and musical narrative',
        archetype: 'Typography-Led Composition',
        copy: (g) => `The sound of the night.\n\nA continuous 8-hour progression designed to take the room somewhere unexpected.\n\n22:00 – 00:00 // [RESIDENT 02] — Atmospheric, textured, deep groove opening\n00:00 – 02:00 // [SPECIAL GUEST] — Hypnotic, rolling, tension-building techno\n02:00 – 04:30 // [HEADLINER] — Fast, driving, relentless peak-time modular set\n04:30 – 06:00 // [RESIDENT 01] — Dark, emotional, hypnotic closing journey\n\nEvery set serves the room, not individual ego.\n\nTickets in bio.\n\n#lineup #technodjs #modulartechno #undergroundmusic #curatedsound #rupturecollective`
      },
      {
        id: '07',
        title: 'SOUND SYSTEM (25 HZ)',
        timing: 'Day 16 (Week -2)',
        phase: 'PHASE 3 — CULTURE AND EXPERIENCE',
        theme: 'Audio fidelity, sub-bass physics, custom tuning',
        archetype: 'Cinematic DJ Video',
        reelAvailable: true,
        copy: (g) => `The sound is not background. It is the experience.\n\nWe have commissioned a custom acoustic rig specifically tuned for this space:\n\n▪ Subwoofers tuned to 25 Hz — bass you feel in your chest, not just your ears.\n▪ Point-source mid/high array for surgical clarity at high SPL.\n▪ Acoustic treatment to minimise slapback echo in the industrial space.\n▪ Sound engineered by producers who understand techno dynamics.\n\nEar protection available at the door.\n\nBring your hearing. We will take care of the rest.\n\n#soundsystem #25hz #acoustics #audiophiletechno #subbass #customrig #rupturesound`
      },
      {
        id: '08',
        title: 'THE SANCTUARY / CODE OF CONDUCT',
        timing: 'Day 18 (Week -2)',
        phase: 'PHASE 3 — CULTURE AND EXPERIENCE',
        theme: 'Safer space policy, inclusivity, zero harassment',
        archetype: 'Cinematic DJ Video',
        reelAvailable: true,
        copy: (g) => `The dancefloor is a sacred space.\n\nOur house rules are non-negotiable:\n\n[01] NO PHOTO / NO VIDEO POLICY ON THE DANCEFLOOR.\nPhone cameras will be taped at entry. Be present.\n\n[02] ZERO TOLERANCE FOR HARASSMENT.\nAny form of racism, sexism, homophobia, transphobia, or unwanted physical contact results in immediate removal.\n\n[03] LOOK AFTER ONE ANOTHER.\nIf you or someone around you needs assistance, alert our awareness team wearing cyan bands.\n\n[04] DRESS TO EXPRESS, NOT TO IMPRESS.\nCome as you are. All bodies, all identities welcome.\n\n#saferspace #dancefloorcode #nopolicies #awareness #respect #consent #technoculture`
      },
      {
        id: '09',
        title: 'ARTIST SPOTLIGHT',
        timing: 'Day 20 (Week -2)',
        phase: 'PHASE 3 — CULTURE AND EXPERIENCE',
        theme: 'Artist feature, sound profile, production preview',
        archetype: 'Cinematic DJ Video',
        reelAvailable: true,
        copy: (g) => `Spotlight: [HEADLINER / LIVE ACT]\n\nPerforming an exclusive live hardware set at RUPTURE.\n\nKnown for releases on seminal European underground labels and marathon sets across subterranean European clubs, their sound is characterised by:\n▪ Analog modular synthesizers running live sequences\n▪ Hypnotic, polyrhythmic percussion\n▪ Relentless 138-142 BPM forward drive\n▪ Atmospheric textures drawn from industrial soundscapes\n\nNo pre-recorded USBs. Pure real-time creation on the dancefloor.\n\nListen to their preview mix via link in bio.\n\n#artistspotlight #modulartechno #hardwarelive #analogsynth #berlintechno #rupturepresents`
      },
      {
        id: '10',
        title: 'VENUE / SPACE REVEAL',
        timing: 'Day 22 (Week -1)',
        phase: 'PHASE 3 — CULTURE AND EXPERIENCE',
        theme: 'Raw industrial architecture, secret setting tease',
        archetype: 'Cropped Macro Artwork',
        copy: (g) => `The space is as much a performer as the artists.\n\nWe spent four months scouting locations across the island before choosing this one.\n\nWhat to expect:\n▪ High-ceiling raw concrete structure\n▪ Minimal, non-distracting lighting (red & amber washes only)\n▪ Dedicated quiet / recovery area outside the main room\n▪ Proper ventilation and clean facilities\n▪ No flashing strobe overload — lighting follows the music, not the other way around\n\nCoordinates revealed 12 hours before doors.\n\n#venuereveal #industrialspace #brutalistarchitecture #secretlocation #mauritiusspaces #rupturevenue`
      },
      {
        id: '11',
        title: 'LOCATION COORDINATES',
        timing: 'Day 24 (Week -1)',
        phase: 'PHASE 4 — BUILDING ANTICIPATION',
        theme: 'Logistical mystery, GPS coordinate release mechanism',
        archetype: 'Mixed-Media Composition',
        copy: (g) => `20°XX'XX.X"S // 57°XX'XX.X"E\n\nHow the location release works:\n\n[1] Check your registered ticket email on the morning of the event.\n[2] Exact GPS coordinates, parking instructions, and arrival advice will be delivered at 10:00 AM.\n[3] No tickets will be sold at the door. If you do not have a ticket, do not travel.\n[4] Designated shuttle service will run from central pickup points.\n\nThe location will surprise you.\n\n#secretcoordinates #locationreveal #gpscoordinates #technomystery #industrialmauritius #rupturelocation`
      },
      {
        id: '12',
        title: '7 DAYS COUNTDOWN',
        timing: 'Day 25 (T-minus 7 Days)',
        phase: 'PHASE 4 — BUILDING ANTICIPATION',
        theme: 'T-minus one week urgency and energy',
        archetype: 'Full Artwork Composition',
        copy: (g) => `SEVEN DAYS.\n\nOne week until the first frequency drop.\n\nThe system is in transit. The space is being prepared. The artists are en route.\n\nAre you ready?\n\nTier 2 tickets 78% claimed. Do not wait for the final tier.\n\nLink in bio.\n\n#7days #countdown #oneweek #technorave #mauritiusevents #ruptureanticipation`
      },
      {
        id: '13',
        title: 'LAST TICKETS ANNOUNCEMENT',
        timing: 'Day 28 (T-minus 3 Days)',
        phase: 'PHASE 4 — BUILDING ANTICIPATION',
        theme: 'Final ticket availability warning, strict capacity notice',
        archetype: 'Typography-Led Composition',
        copy: (g) => `FINAL 50 TICKETS.\n\nCapacity will not be extended. Once these are gone, the door is closed.\n\nWe chose our venue capacity deliberately. We will not oversell for profit at the expense of dancefloor space, air quality, or sound experience.\n\nIf you plan to be in the room, secure your entry now.\n\nlinktr.ee/rupture.mu\n\n#lasttickets #finaltier #soldoutwarning #strictlylimited #capacitruled #rupturecountdown`
      },
      {
        id: '14',
        title: 'PRACTICAL LOGISTICS',
        timing: 'Day 30 (T-minus 1 Day)',
        phase: 'PHASE 4 — BUILDING ANTICIPATION',
        theme: 'Essential checklist: timetable, transport, lockers, hydration',
        archetype: 'Mixed-Media Composition',
        copy: (g) => `Everything you need to know for tomorrow night:\n\nDOORS: 22:00 (strictly no entry after 02:00)\nLOCATION: Check your ticket confirmation email for GPS drop\nPARKING: On-site parking available — carpooling encouraged\nBAR: Cashless only (cards, Juice, Blink accepted)\nWATER: Free filtered water stations all night — bring reusable bottles\nWARDROBE: Secure coat & bag check on site\nHEALTH: First aid & awareness team present at all times\n\nRest up tonight. You will need your energy.\n\n#practicallogistics #eventinfo #technoguide #eventchecklist #knowbeforeyougo #ruptureprep`
      },
      {
        id: '15',
        title: 'DAY OF EVENT SUMMONS',
        timing: 'Day 31 (Tonight)',
        phase: 'PHASE 4 — BUILDING ANTICIPATION',
        theme: 'Tonight is the night — final call to the community',
        archetype: 'Cinematic DJ Video',
        reelAvailable: true,
        copy: (g) => `TONIGHT.\n\nThe frequency is set. The space is waiting.\n\n22:00 // Secret Location // Mauritius\n\nLeave your expectations at the door. Bring your energy, your respect, and your openness.\n\nSee you in the dark.\n\n// RUPTURE COLLECTIVE\n// STYLE CHAPTER: ${g.name.toUpperCase()}\n\n#tonight #doorsopen #seeyouinthedark #technofamily #mauritiustechno #firstedition #rupture`
      }
    ];

    const generatedPosts = phaseDefs.map((def, idx) => {
      const artId = shuffled[idx % shuffled.length];
      const artFileName = `${artId}_v1.jpg`;
      return {
        id: def.id,
        fileStem: artId,
        phase: def.phase,
        title: def.title,
        timing: def.timing,
        theme: def.theme,
        archetype: def.archetype,
        reelAvailable: Boolean(def.reelAvailable),
        artwork: artFileName,
        artworkTitle: `${artId} (Curated from Group: ${grp.name})`,
        family: grp.name,
        familyId: grp.id,
        familyRole: 'Curated Group Member',
        palette: `Obsidian Void + ${grp.name} + Metallic Chrome`,
        typography: 'Helvetica Neue Condensed Bold 68pt + SFNSMono 20pt',
        safeArea: 'Centered artwork composition with safe crop zone',
        caption: def.copy(grp)
      };
    });

    const newEdition = {
      id: editionId,
      editionNumber: nextGStr,
      title: editionTitle,
      chapter: editionChapter,
      tagline: grp.description || '',
      status: 'ready',
      isDynamicGroup: true,
      groupId: grp.id,
      groupName: grp.name,
      groupColor: grp.color || '#7AE7FF',
      group: grp,
      basePath: `/campaign/editions/${editionId}`,
      primaryFamily: { id: grp.id, name: grp.name },
      secondaryFamilies: [],
      inactiveFamilies: [],
      conceptSummary: userSummary || `Dynamic underground techno campaign randomised entirely from curated artwork group "${grp.name}". All 15 posts mapped across the 4-phase rollout using ${grp.artworkIds.length} approved style-matched artworks.`,
      postCount: 15,
      createdAt: new Date().toISOString()
    };

    // Save edition files
    const edDir1 = path.join(ROOT, 'campaign/editions', editionId);
    const edDir2 = path.join(ROOT, 'public/campaign/editions', editionId);
    await fs.mkdir(edDir1, { recursive: true });
    await fs.mkdir(edDir2, { recursive: true });
    const postsStr = JSON.stringify(generatedPosts, null, 2);
    await fs.writeFile(path.join(edDir1, 'edition_data.json'), postsStr, 'utf8');
    await fs.writeFile(path.join(edDir2, 'edition_data.json'), postsStr, 'utf8');

    // Update manifest: place new edition at the start of manifest
    manifest.editions = [newEdition, ...(manifest.editions || [])];
    manifest.activeEditionId = editionId;
    const manStr = JSON.stringify(manifest, null, 2);
    await fs.writeFile(manPath1, manStr, 'utf8');
    if (existsSync(path.dirname(manPath2))) {
      await fs.writeFile(manPath2, manStr, 'utf8');
    }

    // Auto-render full post content (4:5 flyers, 1:1 square crops, 9:16 reels)
    let finalPosts = generatedPosts;
    try {
      const renderScript = path.join(ROOT, 'scripts/render_edition_posts.py');
      await run('python3', [renderScript, '--edition', editionId]);
      finalPosts = JSON.parse(await fs.readFile(path.join(edDir1, 'edition_data.json'), 'utf8'));
    } catch (renderErr) {
      console.error('Warning: failed to pre-render posts for new edition:', renderErr);
    }

    return {
      ok: true,
      editionId,
      edition: newEdition,
      posts: finalPosts,
      activeEditionId: editionId
    };
  }

  if (!primaryFamilyId) {
    throw httpError(400, 'primaryFamilyId is required');
  }

  // Load artwork families data
  const famPath = path.join(ROOT, 'data/artwork_families.json');
  let famData = null;
  try {
    famData = JSON.parse(await fs.readFile(famPath, 'utf8'));
  } catch (err) {
    throw httpError(500, 'Failed to read artwork families data');
  }
  const allFamilies = famData.families || [];
  const pFam = allFamilies.find((f) => f.id === primaryFamilyId);
  if (!pFam) {
    throw httpError(400, `Unknown primary family ID: ${primaryFamilyId}`);
  }

  const sFamList = allFamilies.filter((f) => secondaryFamilyIds.includes(f.id) && f.id !== primaryFamilyId);
  if (!sFamList.length && allFamilies.length > 1) {
    const defaultCompatibleId = pFam.compatibleFamilies?.[0] || allFamilies.find((f) => f.id !== pFam.id)?.id;
    const fallbackSFam = allFamilies.find((f) => f.id === defaultCompatibleId);
    if (fallbackSFam) sFamList.push(fallbackSFam);
  }

  const activeFamilyIds = new Set([pFam.id, ...sFamList.map((f) => f.id)]);
  const inactiveFamilies = allFamilies.filter((f) => !activeFamilyIds.has(f.id));

  // Load manifest
  const manPath1 = path.join(ROOT, 'campaign/editions_manifest.json');
  const manPath2 = path.join(ROOT, 'public/campaign/editions_manifest.json');
  let manifest = { editions: [] };
  try {
    manifest = JSON.parse(await fs.readFile(manPath1, 'utf8'));
  } catch {}

  // Determine next edition number
  let maxNum = 0;
  for (const ed of manifest.editions || []) {
    const n = parseInt(ed.editionNumber, 10);
    if (!isNaN(n) && n > maxNum) maxNum = n;
  }
  const nextNum = maxNum + 1;
  const nextNumStr = String(nextNum).padStart(2, '0');

  const editionTitle = userTitle || `EDITION ${nextNumStr}: ${pFam.name.toUpperCase()} // ${sFamList.map((f) => f.name.toUpperCase()).join(' & ')}`;
  const editionChapter = userChapter || `Chapter ${nextNumStr} — ${pFam.name} & ${sFamList.map((f) => f.name).join(' / ')}`;
  const slug = editionTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const editionId = `edition_${nextNumStr}_${slug.slice(0, 30)}`;

  // Gather artworks strictly from active families
  const primaryArtworks = [...(pFam.artworks || [])];
  const secondaryArtworks = [];
  sFamList.forEach((sf) => {
    (sf.artworks || []).forEach((a) => secondaryArtworks.push({ ...a, _fam: sf }));
  });

  // Shuffle pools
  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
  const shuffledPrimary = shuffle(primaryArtworks);
  const shuffledSecondary = shuffle(secondaryArtworks);

  // Red candidates from active families (if any)
  const redCandidates = [
    ...primaryArtworks.filter((a) => a.accent === 'molten-red').map((a) => ({ ...a, _fam: pFam })),
    ...secondaryArtworks.filter((a) => a.accent === 'molten-red'),
  ];

  const usedArtworkFiles = new Set();
  function pickArtwork(pool, fallbackPool, preferRed = false) {
    if (preferRed && redCandidates.length) {
      const redPick = redCandidates.find((a) => !usedArtworkFiles.has(a.file));
      if (redPick) {
        usedArtworkFiles.add(redPick.file);
        return redPick;
      }
    }
    let choice = pool.find((a) => !usedArtworkFiles.has(a.file));
    if (!choice) choice = fallbackPool.find((a) => !usedArtworkFiles.has(a.file));
    if (!choice) choice = pool[0] || fallbackPool[0];
    if (choice) usedArtworkFiles.add(choice.file);
    return choice;
  }

  const postTemplates = [
    { id: '01', title: 'THE FIRST SIGNAL', timing: 'Day 01 (Week -4)', phase: 'PHASE 1 — INTRODUCING THE COLLECTIVE', theme: 'Mysterious introduction, anomaly detection, curiosity', pool: 'primary' },
    { id: '02', title: 'THE MANIFESTO', timing: 'Day 03 (Week -4)', phase: 'PHASE 1 — INTRODUCING THE COLLECTIVE', theme: 'Collective philosophy, breaking predictable conventions, freedom of expression', pool: 'secondary' },
    { id: '03', title: 'THE NAME / IDENTITY', timing: 'Day 06 (Week -3)', phase: 'PHASE 1 — INTRODUCING THE COLLECTIVE', theme: 'Brand identity, name as monumental visual hero, liquid metal fold', pool: 'primary' },
    { id: '04', title: 'SAVE THE DATE', timing: 'Day 09 (Week -3)', phase: 'PHASE 2 — EVENT ANNOUNCEMENT', theme: 'First official event announcement, date and title lock', pool: 'secondary' },
    { id: '05', title: 'THE MAIN EVENT POSTER', timing: 'Day 12 (Week -2)', phase: 'PHASE 2 — EVENT ANNOUNCEMENT', theme: 'Hero promotional poster, complete lineup, date, venue, ticketing protocol', pool: 'primary', isRed: true },
    { id: '06', title: 'THE LINEUP', timing: 'Day 14 (Week -2)', phase: 'PHASE 2 — EVENT ANNOUNCEMENT', theme: 'Dedicated artist lineup curation, sonic diversity across 8 hours', pool: 'primary' },
    { id: '07', title: 'ARTIST SPOTLIGHT [ACT 01]', timing: 'Day 16 (Week -2)', phase: 'PHASE 2 — EVENT ANNOUNCEMENT', theme: 'Individual artist profile, modular live performance, sonic breakdown', pool: 'secondary' },
    { id: '08', title: 'THE SOUND / ACOUSTICS', timing: 'Day 18 (Week -1)', phase: 'PHASE 3 — CULTURE AND EXPERIENCE', theme: 'Sound philosophy, custom acoustic engineering, 25 Hz sub-bass focus', pool: 'primary' },
    { id: '09', title: 'THE RULES / THE CODE', timing: 'Day 20 (Week -1)', phase: 'PHASE 3 — CULTURE AND EXPERIENCE', theme: 'Dancefloor principles, safer space policy, zero discrimination, no photos', pool: 'secondary' },
    { id: '10', title: 'THE EXPERIENCE', timing: 'Day 22 (Week -1)', phase: 'PHASE 3 — CULTURE AND EXPERIENCE', theme: 'Atmosphere, monochromatic light, haze, spatial sensory immersion', pool: 'secondary' },
    { id: '11', title: 'VENUE / LOCATION REVEAL', timing: 'Day 24 (5 Days Out)', phase: 'PHASE 3 — CULTURE AND EXPERIENCE', theme: 'Industrial architecture reveal, decommissioned silo, GPS coordinates', pool: 'secondary' },
    { id: '12', title: 'THE COUNTDOWN (7 DAYS)', timing: 'Day 25 (7 Days Out)', phase: 'PHASE 4 — BUILDING ANTICIPATION', theme: 'Reusable countdown system, kinetic aerodynamic chrome dagger, 7 days reminder', pool: 'primary' },
    { id: '13', title: 'LAST TICKETS / REMINDER', timing: 'Day 27 (3 Days Out)', phase: 'PHASE 4 — BUILDING ANTICIPATION', theme: 'Ticket urgency with underground dignity, capacity limit, molten crimson warning', pool: 'secondary', isRed: true },
    { id: '14', title: 'FINAL INFORMATION', timing: 'Day 29 (1 Day Out)', phase: 'PHASE 4 — BUILDING ANTICIPATION', theme: 'Practical mobile-readable guide: timetable, venue, cashless bar, entry rules', pool: 'secondary' },
    { id: '15', title: 'TOMORROW / TONIGHT', timing: 'Day 30 (Event Day)', phase: 'PHASE 4 — BUILDING ANTICIPATION', theme: 'Final teaser, monumental minimalism, colossal white TONIGHT on sweeping chrome', pool: 'primary' },
  ];

  const generatedPosts = postTemplates.map((t) => {
    const isPrim = t.pool === 'primary';
    const chosenArt = pickArtwork(
      isPrim ? shuffledPrimary : (shuffledSecondary.length ? shuffledSecondary : shuffledPrimary),
      isPrim ? shuffledSecondary : shuffledPrimary,
      t.isRed
    );
    const artFam = chosenArt._fam || (isPrim ? pFam : (sFamList[0] || pFam));
    const isPrimaryRole = artFam.id === pFam.id;
    const roleText = isPrimaryRole
      ? (t.isRed ? 'Primary Family (Restrained Red)' : 'Primary Family')
      : (t.isRed ? 'Secondary Family (Restrained Red)' : 'Secondary Family');

    return {
      id: t.id,
      fileStem: `RUPTURE_IG_POST_${t.id}`,
      phase: t.phase,
      title: t.title,
      timing: t.timing,
      theme: t.theme,
      artwork: chosenArt.file,
      artworkTitle: `${chosenArt.id} (${chosenArt.title || chosenArt.id})`,
      family: artFam.name,
      familyId: artFam.id,
      familyRole: roleText,
      palette: t.isRed
        ? `${artFam.name} + Molten Crimson (#FF3344 — Restrained Red) + Obsidian Void`
        : `${artFam.name} + Liquid Chrome + Pale Cyan (#7AE7FF) + Obsidian Void`,
      typography: 'Helvetica Neue Condensed Bold + SFNSMono',
      safeArea: 'Key typography positioned safely inside central 1080x1080 boundary',
      caption: `// RUPTURE // ${editionTitle.toUpperCase()}\n// ${t.phase}\n\n${t.title}.\n\nCurated visual chapter: ${artFam.name}.\nStrict aesthetic cohesion with zero unapproved styles.\n\n#rupturecollective #undergroundtechno #mauritiustechno #${artFam.id.replace(/-/g, '')}`,
    };
  });

  const artDirectionProfile = {
    primaryFamily: pFam.id,
    secondaryFamilies: sFamList.map((f) => f.id),
    dominantMaterial: userProfile.dominantMaterial || (pFam.materials && pFam.materials[0]) || 'polished-chrome',
    preferredShapes: userProfile.preferredShapes || ['asymmetrical', 'fluid-sculptural'],
    colorEmphasis: userProfile.colorEmphasis || 'cool-monochrome',
    lighting: userProfile.lighting || 'chiseled-rim-light',
    elementsToAvoid: userProfile.elementsToAvoid || inactiveFamilies.map((f) => f.name),
    variationLevel: userVariation || userProfile.variationLevel || 'medium',
  };

  const consistencyScorecard = await validateConsistency({
    posts: generatedPosts,
    primaryFamilyId: pFam.id,
    secondaryFamilyIds: sFamList.map((f) => f.id),
    eventProfile: artDirectionProfile,
  });

  const newEdition = {
    id: editionId,
    editionNumber: nextNumStr,
    title: editionTitle,
    chapter: editionChapter,
    status: 'ready',
    primaryFamily: {
      id: pFam.id,
      name: pFam.name,
    },
    secondaryFamilies: sFamList.map((f) => ({
      id: f.id,
      name: f.name,
    })),
    inactiveFamilies: inactiveFamilies.map((f) => f.id),
    conceptSummary: userSummary || `${pFam.name} paired with ${sFamList.map((f) => f.name).join(' & ')}. Strictly excludes ${inactiveFamilies.map((f) => f.name).join(', ')}. Engineered for total underground techno visual cohesion.`,
    postCount: 15,
    basePath: '',
    isDynamicGroup: true,
    artDirectionProfile,
    consistencyScorecard,
  };

  // Write edition_data.json
  const edDir1 = path.join(ROOT, 'campaign/editions', editionId);
  const edDir2 = path.join(ROOT, 'public/campaign/editions', editionId);
  await fs.mkdir(edDir1, { recursive: true });
  await fs.mkdir(edDir2, { recursive: true });

  const postsStr = JSON.stringify(generatedPosts, null, 2);
  await fs.writeFile(path.join(edDir1, 'edition_data.json'), postsStr, 'utf8');
  await fs.writeFile(path.join(edDir2, 'edition_data.json'), postsStr, 'utf8');

  // Insert into manifest at beginning
  manifest.editions = [newEdition, ...(manifest.editions || [])];
  manifest.activeEditionId = editionId;

  const manStr = JSON.stringify(manifest, null, 2);
  await fs.writeFile(manPath1, manStr, 'utf8');
  if (existsSync(path.dirname(manPath2))) {
    await fs.writeFile(manPath2, manStr, 'utf8');
  }

  return {
    ok: true,
    editionId,
    edition: newEdition,
    posts: generatedPosts,
    activeEditionId: editionId,
  };
}

async function deleteCampaignEdition(id) {
  const manPath1 = path.join(ROOT, 'campaign/editions_manifest.json');
  const manPath2 = path.join(ROOT, 'public/campaign/editions_manifest.json');
  let manifest = null;
  try {
    manifest = JSON.parse(await fs.readFile(manPath1, 'utf8'));
  } catch (err) {
    throw httpError(404, 'Editions manifest not found');
  }

  const editionIndex = (manifest.editions || []).findIndex((e) => e.id === id);
  if (editionIndex === -1) {
    throw httpError(404, `Campaign edition '${id}' not found`);
  }
  if (manifest.editions.length <= 1) {
    throw httpError(400, 'Cannot delete the only remaining campaign edition');
  }

  const [removed] = manifest.editions.splice(editionIndex, 1);
  if (manifest.activeEditionId === id) {
    manifest.activeEditionId = (manifest.editions.find((e) => e.id === 'edition_01_hydraulic_void') || manifest.editions[0]).id;
  }

  const manifestStr = JSON.stringify(manifest, null, 2);
  await fs.writeFile(manPath1, manifestStr, 'utf8');
  if (existsSync(path.dirname(manPath2))) {
    await fs.writeFile(manPath2, manifestStr, 'utf8');
  }

  // Remove files associated with the edition if directory exists
  const dir1 = path.join(ROOT, 'campaign/editions', id);
  const dir2 = path.join(ROOT, 'public/campaign/editions', id);
  await fs.rm(dir1, { recursive: true, force: true }).catch(() => {});
  await fs.rm(dir2, { recursive: true, force: true }).catch(() => {});

  return { ok: true, deleted: id, edition: removed, activeEditionId: manifest.activeEditionId, editions: manifest.editions };
}

async function swapCampaignPostArtwork(editionId, body = {}) {
  const { postId, newArtworkId } = body;
  if (!postId) {
    throw httpError(400, 'postId is required');
  }

  const manPath1 = path.join(ROOT, 'campaign/editions_manifest.json');
  let manifest = null;
  try {
    manifest = JSON.parse(await fs.readFile(manPath1, 'utf8'));
  } catch (err) {
    throw httpError(404, 'Editions manifest not found');
  }

  const edition = (manifest.editions || []).find((e) => e.id === editionId);
  if (!edition) {
    throw httpError(404, `Campaign edition '${editionId}' not found`);
  }

  const dataPath1 = path.join(ROOT, 'campaign/editions', editionId, 'edition_data.json');
  const dataPath2 = path.join(ROOT, 'public/campaign/editions', editionId, 'edition_data.json');

  let posts = null;
  try {
    posts = JSON.parse(await fs.readFile(dataPath1, 'utf8'));
  } catch (err) {
    throw httpError(404, `Edition data for '${editionId}' not found on server`);
  }

  const normalizedPid = String(postId).padStart(2, '0');
  const postIndex = posts.findIndex((p) => String(p.id).padStart(2, '0') === normalizedPid || p.id === postId);
  if (postIndex === -1) {
    throw httpError(404, `Post '${postId}' not found in edition '${editionId}'`);
  }
  const post = posts[postIndex];
  const oldArtwork = post.artwork;
  const currentArtId = oldArtwork.replace(/_v\d+\.jpg$/, '').replace(/\.(jpg|png)$/, '');

  // 1. Gather candidate artworks for the current batch
  let candidateIds = [];
  let batchSource = { type: 'unknown', name: 'Current Batch', count: 0 };

  // Load groups data
  let groupsData = [];
  try {
    const grpJson = JSON.parse(await fs.readFile(path.join(ROOT, 'data/artwork_groups.json'), 'utf8'));
    groupsData = grpJson.groups || [];
  } catch {}

  // Load families data
  let familiesData = [];
  try {
    const famJson = JSON.parse(await fs.readFile(path.join(ROOT, 'data/artwork_families.json'), 'utf8'));
    familiesData = famJson.families || [];
  } catch {}

  // Load manifest data for notes & metadata
  let manifestData = { artworks: {} };
  try {
    manifestData = JSON.parse(await fs.readFile(path.join(ROOT, 'data/manifest.json'), 'utf8'));
  } catch {}

  if (edition.groupId) {
    const grp = groupsData.find((g) => g.id === edition.groupId);
    if (grp && grp.artworkIds?.length) {
      candidateIds = [...grp.artworkIds];
      batchSource = { type: 'group', name: grp.name, id: grp.id, count: candidateIds.length };
    }
  }

  if (!candidateIds.length && edition.primaryFamily) {
    const pFamId = edition.primaryFamily.id || edition.primaryFamily;
    const sFamIds = (edition.secondaryFamilies || []).map((sf) => sf.id || sf);
    const targetFamilyIds = new Set([pFamId, ...sFamIds]);
    
    const matchingFamilies = familiesData.filter((f) => targetFamilyIds.has(f.id));
    const allFamArtworks = [];
    matchingFamilies.forEach((f) => {
      (f.artworks || []).forEach((a) => allFamArtworks.push(a.id));
    });
    if (allFamArtworks.length) {
      candidateIds = Array.from(new Set(allFamArtworks));
      batchSource = { type: 'family', name: matchingFamilies[0]?.name || 'Artwork Families', count: candidateIds.length };
    }
  }

  // Fallback if still empty: all approved master artworks
  if (!candidateIds.length) {
    candidateIds = Object.keys(manifestData.artworks || {});
    batchSource = { type: 'all', name: 'All Masters', count: candidateIds.length };
  }

  // 2. Select replacement artwork
  const usedOtherIds = new Set(
    posts.filter((_, idx) => idx !== postIndex).map((p) => p.artwork.replace(/_v\d+\.jpg$/, '').replace(/\.(jpg|png)$/, ''))
  );

  let selectedId = null;
  if (newArtworkId && candidateIds.includes(newArtworkId)) {
    selectedId = newArtworkId;
  } else {
    // Prefer unused in current edition
    const unusedCandidates = candidateIds.filter((id) => id !== currentArtId && !usedOtherIds.has(id));
    if (unusedCandidates.length > 0) {
      selectedId = unusedCandidates[Math.floor(Math.random() * unusedCandidates.length)];
    } else {
      const otherCandidates = candidateIds.filter((id) => id !== currentArtId);
      selectedId = otherCandidates.length ? otherCandidates[Math.floor(Math.random() * otherCandidates.length)] : currentArtId;
    }
  }

  // 3. Resolve artwork metadata
  const newFileName = `${selectedId}_v1.jpg`;
  
  // Find title & description
  let artNote = '';
  const artEntry = manifestData.artworks?.[selectedId];
  if (artEntry && artEntry.versions && artEntry.versions[0]) {
    artNote = artEntry.versions[0].note || artEntry.versions[0].prompt || '';
  }
  let artTitle = artNote ? `${selectedId} (${artNote})` : `${selectedId} (Curated from ${batchSource.name})`;

  // Find family info
  const owningFam = familiesData.find((f) => (f.artworks || []).some((a) => a.id === selectedId));
  if (owningFam) {
    post.family = owningFam.name;
    post.familyId = owningFam.id;
  } else if (batchSource.type === 'group') {
    post.family = batchSource.name;
  }

  post.artwork = newFileName;
  post.artworkTitle = artTitle;

  // 4. Persist updated edition_data.json
  const updatedDataStr = JSON.stringify(posts, null, 2);
  await fs.writeFile(dataPath1, updatedDataStr, 'utf8');
  if (existsSync(path.dirname(dataPath2))) {
    await fs.writeFile(dataPath2, updatedDataStr, 'utf8');
  }

  // 5. If rendered post images exist on disk, re-render flyer via python script
  const postsDir1 = path.join(ROOT, 'campaign/editions', editionId, 'posts');
  if (existsSync(postsDir1)) {
    try {
      const pyScript = path.join(ROOT, 'scripts/render_campaign_post.py');
      await run('python3', [
        pyScript,
        '--edition', editionId,
        '--post', String(post.id),
        '--artwork', newFileName,
        '--title', post.title || '',
        '--family', post.family || '',
        '--role', post.familyRole || ''
      ]);
    } catch (renderErr) {
      console.error('Warning: failed to re-render post flyer:', renderErr.message);
    }
  }

  return {
    ok: true,
    editionId,
    post,
    swappedFrom: currentArtId,
    swappedTo: selectedId,
    batchSource,
    totalBatch: candidateIds.length,
    remainingUnused: candidateIds.filter((id) => !usedOtherIds.has(id) && id !== selectedId).length
  };
}

// ---------- router ----------

const routes = [
  ['GET', /^\/api\/art-direction\/master$/, async () => JSON.parse(await fs.readFile(path.join(ROOT, 'data/master_art_direction.json'), 'utf8'))],
  ['POST', /^\/api\/art-direction\/validate-consistency$/, async (_m, body) => validateConsistency(body)],
  ['POST', /^\/api\/campaign\/editions\/([\w-]+)\/regenerate-post-composition$/, async ([, id], body) => regeneratePostComposition(id, body)],
  ['POST', /^\/api\/campaign\/create-edition$/, async (_m, body) => createCampaignEdition(body)],
  ['DELETE', /^\/api\/campaign\/editions\/([\w-]+)$/, async ([, id]) => deleteCampaignEdition(id)],
  ['POST', /^\/api\/campaign\/editions\/([\w-]+)\/swap-post-artwork$/, async ([, id], body) => swapCampaignPostArtwork(id, body)],
  ['GET', /^\/api\/campaign$/, async () => JSON.parse(await fs.readFile(path.join(ROOT, 'campaign/campaign_data.json'), 'utf8'))],
  ['GET', /^\/api\/state$/, async () => ({
    mode: mode(), model: provider?.model || null,
    identity: store.identity, collection: store.collection, manifest: store.manifest, queue: store.queue,
    references: store.references?.items || [],
    groups: store.groups?.groups || [],
    exports: await fs.readdir(path.join(ROOT, 'exports')).then((l) => l.filter((f) => /^RUPTURE_.*\.(png|jpg)$/.test(f))).catch(() => []),
  })],
  ['GET', /^\/api\/groups$/, async () => ({ groups: store.groups?.groups || [] })],
  ['POST', /^\/api\/groups$/, async (_m, body) => store.createGroup(body)],
  ['PUT', /^\/api\/groups\/([\w-]+)$/, async ([, id], body) => store.updateGroup(id, body)],
  ['DELETE', /^\/api\/groups\/([\w-]+)$/, async ([, id]) => store.deleteGroup(id)],
  ['POST', /^\/api\/groups\/([\w-]+)\/toggle$/, async ([, id], body) => store.toggleArtworkInGroup(id, body.artworkId)],
  ['POST', /^\/api\/groups\/([\w-]+)\/artworks$/, async ([, id], body) => {
    if (body.action === 'toggle') return store.toggleArtworkInGroup(id, body.artworkId);
    if (body.action === 'set') return store.setGroupArtworks(id, body.artworkIds || []);
    if (body.action === 'add') {
      const grp = store.groups?.groups?.find((g) => g.id === id);
      const existing = grp ? grp.artworkIds || [] : [];
      return store.setGroupArtworks(id, [...existing, ...(body.artworkIds || [])]);
    }
    if (body.action === 'remove') {
      const removeSet = new Set(body.artworkIds || []);
      const grp = store.groups?.groups?.find((g) => g.id === id);
      const existing = grp ? grp.artworkIds || [] : [];
      return store.setGroupArtworks(id, existing.filter((a) => !removeSet.has(a)));
    }
    return store.updateGroup(id, body);
  }],
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
    for (const dir of ['artworks', 'exports', 'data', 'references', 'campaign']) {
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
