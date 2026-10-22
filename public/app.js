import { buildPrompt, randomiseSpec, newSeed } from '/src/prompt-engine.mjs';

// ---------- state ----------
let S = null; // server state
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const accentById = (id) => S.identity.accents.find((a) => a.id === id);
const treatmentById = (id) => S.identity.treatments.find((t) => t.id === id);
const collName = (id) => (id === 'X' ? 'Explorations' : S.collection.collections.find((c) => c.id === id)?.name || id);

async function api(path, opts = {}) {
  const res = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...opts, body: opts.body ? JSON.stringify(opts.body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

async function refresh() {
  S = await api('/api/state');
  renderChrome();
}

function toast(msg, err = false) {
  const t = $('#toast');
  t.textContent = msg;
  t.className = `show${err ? ' err' : ''}`;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => (t.className = ''), 3200);
}

/** All gallery items: collection slots + explorations. */
function items() {
  const fromCollection = S.collection.artworks.map((a) => ({ ...a, entry: S.manifest.artworks[a.id] }));
  const explorations = Object.values(S.manifest.artworks)
    .filter((e) => e.collection === 'X')
    .map((e) => {
      const spec = e.versions.at(-1)?.spec || e.spec || {};
      return {
        id: e.id,
        collection: 'X',
        pillars: ['liquid-geometry'],
        accent: spec.accent || 'pale-cyan',
        secondary: spec.secondary || null,
        treatment: spec.treatment || 'sculptural-chrome',
        brief: spec.brief || 'Free Liquid Geometry exploration',
        entry: e,
      };
    });
  return [...fromCollection, ...explorations];
}
const activeVersion = (e) => e?.versions.find((v) => v.v === e.activeVersion);
const imgUrl = (e) => { const v = activeVersion(e); return v ? `/${v.file}?v=${v.v}` : null; };
const masterEntry = () => {
  const m = S.collection.artworks.find((a) => a.collection === '00');
  return m && S.manifest.artworks[m.id];
};
const dotsFor = (it) => {
  const dots = [it.accent, it.secondary].filter(Boolean).map((aid) => accentById(aid)).filter(Boolean);
  return dots.map((a) => `<span class="dot" title="${esc(a.name)}" style="background:${a.hex}"></span>`).join('');
};

// ---------- chrome ----------
function renderChrome() {
  const m = $('#mode');
  m.className = `badge mono ${S.mode}`;
  m.textContent = S.mode === 'api' ? `API · ${S.model}` : 'Queue mode';
  m.title = S.mode === 'api' ? 'Generate calls the image API directly.' : 'No API key: generation requests are queued for the agent to fulfil.';
  const main = S.collection.artworks.filter((a) => a.collection !== '00');
  const approved = main.filter((a) => S.manifest.artworks[a.id]?.status === 'approved').length;
  const generated = main.filter((a) => S.manifest.artworks[a.id]?.versions.length).length;
  $('#progress').textContent = `${generated}/${main.length} generated · ${approved}/${main.length} approved`;
}

// ---------- SYSTEM ----------
function renderSystem() {
  const I = S.identity;
  const D = I.directionSpec || {};
  const p = I.pillars[0];
  $('#view-system').innerHTML = `
    <div class="hero">
      <div>
        <p class="eyebrow">Visual identity system · ${esc(I.location)} · ${esc(I.conceptTitle)}</p>
        <h1>Anomaly — Concept 3: Liquid Geometry</h1>
      </div>
      <div>
        <p>${esc(I.statement)}</p>
        <p class="quote">“${esc(I.principle)}”</p>
        <div class="rhythm" aria-label="Motion rhythm">${I.motionRhythm.map((r) => `<span>${esc(r)}</span>`).join('')}</div>
      </div>
    </div>

    <div class="concept-specs">
      <div>
        <p class="eyebrow">Artistic direction specification</p>
        <h2>${esc(I.conceptTitle)}</h2>
      </div>
      <div class="swatches" title="Dominant charcoal, silver & pearl foundation with restrained refracted accents">
        ${p.colors.map((c) => `<span style="background:${c}" title="${c}"></span>`).join('')}
      </div>
      <div class="spec-grid">
        <div class="spec-card">
          <span class="lbl">Core Material</span>
          <p>${esc(D.coreMaterial)}</p>
        </div>
        <div class="spec-card">
          <span class="lbl">Light</span>
          <p>${esc(D.light)}</p>
        </div>
        <div class="spec-card">
          <span class="lbl">Composition</span>
          <p>${esc(D.composition)}</p>
        </div>
        <div class="spec-card">
          <span class="lbl">Surface Quality</span>
          <p>${esc(D.surfaceQuality)}</p>
        </div>
        <div class="spec-card">
          <span class="lbl">Art Direction</span>
          <p>${esc(D.artDirection)}</p>
        </div>
        <div class="spec-card">
          <span class="lbl">Colour Discipline</span>
          <p>${esc(D.colourDiscipline)}</p>
        </div>
        <div class="spec-card full exclude">
          <span class="lbl">Exclude</span>
          <p>${esc(D.exclude)}</p>
        </div>
      </div>
    </div>

    <hr class="rule">
    <div class="section-head">
      <div><p class="eyebrow">Colour Discipline</p><h2>Dominant Silver &amp; Charcoal · Refracted Iridescent Light</h2></div>
      <p class="hint" style="max-width:52ch">Silver, pearl, white and charcoal are dominant. Use only one or two subtle iridescent accent colours in each artwork — appearing as light refracted through the material, never painted neon.</p>
    </div>
    <div class="colour-system">
      ${I.foundation.map((f) => `<div class="colour"><div class="sw" style="background:${f.hex};border-bottom:1px solid var(--line)"></div><strong>${esc(f.name)}</strong><p>${f.hex} · ${esc(f.role)}</p></div>`).join('')}
      ${I.accents.map((a) => `<div class="colour"><div class="sw" style="background:${a.id === 'chrome' ? 'linear-gradient(135deg,#26292e,#e9ecef 45%,#8e949b 70%,#f2f4f7)' : a.hex};border-bottom:1px solid var(--line)"></div><strong>${esc(a.name)}</strong><p>${a.hex} · ${esc(a.role)}</p></div>`).join('')}
    </div>

    <hr class="rule">
    <div class="two-col">
      <div><p class="eyebrow">Shared art direction</p><h2 style="margin-bottom:16px">Every artwork</h2>
        <ol class="numbered">${I.artDirection.map((x) => `<li>${esc(x)}</li>`).join('')}</ol></div>
      <div><p class="eyebrow">Strict exclusions</p><h2 style="margin-bottom:16px">Exclude</h2>
        <ol class="numbered never">${I.restrictions.map((x) => `<li>${esc(x)}</li>`).join('')}</ol></div>
    </div>

    <hr class="rule">
    <div class="references-head section-head">
      <div>
        <p class="eyebrow">Visual Inspiration &amp; Conditioning Library · ${(S.references || []).length} References</p>
        <h2>Reference Artworks &amp; Moodboards</h2>
      </div>
      <div class="actions">
        <button type="button" class="btn primary small" id="btn-upload-ref-system">+ Upload Reference Image</button>
      </div>
    </div>
    <p class="hint" style="max-width:65ch">Visual reference artworks and moodboards used to condition texture, fluid curvature, and lighting refraction for generation.</p>

    <div class="references-grid">
      ${(S.references || []).map((ref) => `
        <div class="ref-card">
          <div class="frame">
            <img src="/${ref.file}" alt="${esc(ref.name)}" loading="lazy">
            <span class="ref-badge ${ref.type === 'moodboard' ? 'mood' : 'user'}">${ref.type === 'moodboard' ? 'Moodboard' : 'Uploaded'}</span>
          </div>
          <div class="body">
            <h4>${esc(ref.name)}</h4>
            <p class="hint small" style="margin:0">${esc(ref.note || '')}</p>
            <div class="btn-row" style="margin-top:8px">
              <button type="button" class="btn small" data-use-ref="${ref.file}">Use in Generate</button>
              ${ref.type === 'user' ? `<button type="button" class="btn small muted" data-del-ref="${ref.id}" title="Remove reference">Delete</button>` : ''}
            </div>
          </div>
        </div>
      `).join('')}
      <button type="button" class="ref-card upload-card" id="card-upload-ref">
        <div class="frame upload-frame">
          <span class="upload-icon">+</span>
          <span class="upload-label">Upload New Reference</span>
          <span class="upload-sub">Drag &amp; drop or click to browse</span>
        </div>
      </button>
    </div>`;

  $('#btn-upload-ref-system')?.addEventListener('click', () => openUploadDialog('reference'));
  $('#card-upload-ref')?.addEventListener('click', () => openUploadDialog('reference'));
  $$('[data-use-ref]').forEach((btn) => btn.addEventListener('click', () => {
    G.references = [btn.dataset.useRef];
    location.hash = '#generate';
  }));
  $$('[data-del-ref]').forEach((btn) => btn.addEventListener('click', async () => {
    if (!confirm('Remove this uploaded reference?')) return;
    await api(`/api/references/${btn.dataset.delRef}`, { method: 'DELETE' });
    await refresh();
    toast('Reference removed');
    renderSystem();
  }));
}

// ---------- GENERATE ----------
const G = {
  target: '',
  useBrief: true,
  accent: 'pale-cyan',
  secondary: 'lavender',
  treatment: 'sculptural-chrome',
  composition: '',
  instructions: '',
  references: [],
  randomise: false,
  seed: newSeed(),
  edited: null,
  last: null,
};

function loadTarget(id) {
  G.target = id;
  G.edited = null;
  const art = S.collection.artworks.find((a) => a.id === id);
  if (!art) return;
  G.accent = art.accent || 'pale-cyan';
  G.secondary = art.secondary || null;
  G.treatment = art.treatment || 'sculptural-chrome';
  G.useBrief = true;
}

function currentSpec() {
  const art = S.collection.artworks.find((a) => a.id === G.target);
  let spec = {
    pillars: [{ id: 'liquid-geometry', weight: 1 }],
    accent: G.accent || undefined,
    secondary: G.secondary,
    treatment: G.treatment || undefined,
    instructions: G.instructions,
    references: G.references && G.references.length ? G.references : undefined,
  };
  if (art && G.useBrief) spec = { ...spec, brief: art.brief, space: art.space };
  else if (G.composition) spec.composition = G.composition;
  if (G.randomise) spec = randomiseSpec(S.identity, spec, G.seed);
  return spec;
}

function renderGenerate() {
  const I = S.identity;
  const art = S.collection.artworks.find((a) => a.id === G.target);
  const groups = S.collection.collections.map((c) => `<optgroup label="${esc(c.name)}">${S.collection.artworks.filter((a) => a.collection === c.id).map((a) => {
    const e = S.manifest.artworks[a.id];
    const st = e?.status === 'approved' ? ' ✓' : '';
    return `<option value="${a.id}" ${a.id === G.target ? 'selected' : ''}>${a.id}${st}</option>`;
  }).join('')}</optgroup>`).join('');

  $('#view-generate').innerHTML = `
    <div class="section-head">
      <div><p class="eyebrow">Generate · ${esc(I.conceptTitle)}</p><h2>Compose in Liquid Geometry</h2></div>
    </div>
    <div class="gen">
      <form id="gen-form" autocomplete="off">
        <fieldset>
          <legend>Active Concept</legend>
          <div class="concept-lock">
            <span class="name"><span class="dot" style="background:var(--cyan)"></span>${esc(I.conceptTitle)}</span>
            <span class="mono muted">Locked</span>
          </div>
        </fieldset>

        <fieldset>
          <legend>Target slot</legend>
          <select id="g-target" aria-label="Target slot">
            <option value="" ${!G.target ? 'selected' : ''}>New free exploration (RUPTURE_X…)</option>${groups}
          </select>
          ${art ? `<div class="brief-box">${esc(art.brief)}</div>
            <label class="chip" style="justify-self:start"><input type="checkbox" id="g-usebrief" ${G.useBrief ? 'checked' : ''}>Use slot brief as composition</label>` : ''}
        </fieldset>

        <fieldset>
          <legend>Core Material Focus</legend>
          <div class="chips">
            <label class="chip"><input type="radio" name="treatment" value="" ${!G.treatment ? 'checked' : ''}>All Core Materials</label>
            ${I.treatments.map((t) => `<label class="chip"><input type="radio" name="treatment" value="${t.id}" ${G.treatment === t.id ? 'checked' : ''}>${esc(t.name)}</label>`).join('')}
          </div>
        </fieldset>

        <fieldset>
          <legend>Primary Iridescent Refraction (1st accent)</legend>
          <div class="swatch-pick">${I.accents.map((a) => `<label><input type="radio" name="accent" value="${a.id}" ${G.accent === a.id ? 'checked' : ''}><span class="sw" style="background:${a.id === 'chrome' ? 'linear-gradient(135deg,#26292e,#e9ecef 45%,#8e949b)' : a.hex}"></span><span class="lbl">${esc(a.name)}</span></label>`).join('')}</div>
        </fieldset>

        <fieldset>
          <legend>Secondary Iridescent Refraction (optional 2nd accent)</legend>
          <div class="swatch-pick">
            <label class="none"><input type="radio" name="secondary" value="" ${!G.secondary ? 'checked' : ''}><span class="sw"></span><span class="lbl">None</span></label>
            ${I.accents.filter((a) => a.id !== G.accent).map((a) => `<label><input type="radio" name="secondary" value="${a.id}" ${G.secondary === a.id ? 'checked' : ''}><span class="sw" style="background:${a.id === 'chrome' ? 'linear-gradient(135deg,#26292e,#e9ecef 45%,#8e949b)' : a.hex}"></span><span class="lbl">${esc(a.name)}</span></label>`).join('')}
          </div>
        </fieldset>

        ${!art || !G.useBrief ? `<fieldset>
          <legend>Composition Formation</legend>
          <select id="g-comp" aria-label="Composition">
            <option value="">Default Liquid Geometry formation</option>
            ${I.compositions.map((c) => `<option value="${c.id}" ${G.composition === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
          </select>
        </fieldset>` : ''}

        <fieldset>
          <legend>Studio Variation</legend>
          <div class="inline">
            <label class="chip"><input type="checkbox" id="g-rand" ${G.randomise ? 'checked' : ''}>Randomise studio light, scale &amp; negative space</label>
            <button type="button" class="btn small" id="g-reseed">New seed</button>
          </div>
          <p class="hint">Selects controlled studio lighting, macro/sculptural scale and negative space balance from approved Liquid Geometry parameters. Seed <span class="mono">${G.seed}</span>.</p>
        </fieldset>

        <fieldset>
          <legend>Visual Reference Images (Conditioning)</legend>
          <p class="hint">Select reference images to condition texture, fluid curvature and lighting refraction for this generation.</p>
          <div class="ref-select-grid">
            ${(S.references || []).map((r) => {
              const checked = (G.references || []).includes(r.file);
              return `<label class="ref-chip ${checked ? 'active' : ''}">
                <input type="checkbox" name="ref-pick" value="${esc(r.file)}" ${checked ? 'checked' : ''}>
                <img src="/${r.file}" alt="${esc(r.name)}">
                <span class="name" title="${esc(r.name)}">${esc(r.name)}</span>
              </label>`;
            }).join('')}
          </div>
          <div class="inline" style="margin-top:10px">
            <button type="button" class="btn small" id="btn-upload-ref-gen">+ Upload Reference</button>
            <span class="hint">${(G.references || []).length} reference(s) selected</span>
          </div>
        </fieldset>

        <fieldset>
          <legend>Additional creative instructions</legend>
          <textarea id="g-instr" placeholder="e.g. emphasize translucent glass-like membrane on the upper curve, deeper charcoal void below">${esc(G.instructions)}</textarea>
        </fieldset>

        <button class="btn primary" type="submit" id="g-submit">${S.mode === 'api' ? 'Generate artwork' : 'Queue for generation'}</button>
      </form>

      <div class="gen-out">
        <div class="prompt-panel">
          <header><span class="mono muted">Prompt ${G.edited !== null ? '· edited' : '· Liquid Geometry engine'}</span>
            <button type="button" class="btn small" id="g-reset" ${G.edited === null ? 'disabled' : ''}>Reset to engine</button></header>
          <textarea id="g-prompt" aria-label="Prompt preview" spellcheck="false"></textarea>
        </div>
        <div id="g-result"></div>
        ${renderQueueList()}
      </div>
    </div>`;
  updatePrompt();
  renderResult();
  bindGenerate();
}

function updatePrompt() {
  const ta = $('#g-prompt');
  if (!ta) return;
  if (G.edited === null) ta.value = buildPrompt(S.identity, currentSpec());
}

function renderQueueList() {
  if (!S.queue.jobs.length) return '';
  return `<div><p class="eyebrow">Generation queue · ${S.queue.jobs.length}</p><div class="queue-list">
    ${S.queue.jobs.map((j) => `<div class="queue-item"><span class="mono">${esc(j.id)}</span><span class="muted">${new Date(j.createdAt).toLocaleString()}</span>
      <button class="btn small" data-dequeue="${j.jobId}">Remove</button></div>`).join('')}
  </div><p class="hint" style="margin-top:8px">Queue mode: ask the agent to <em>“process the RUPTURE queue”</em>. Images appear in the gallery automatically.</p></div>`;
}

function renderResult() {
  const box = $('#g-result');
  if (!box || !G.last) return;
  const r = G.last;
  if (r.mode === 'queue') {
    box.innerHTML = `<div class="queue-card"><span class="mono" style="color:var(--cyan)">Queued · ${esc(r.id)} · job ${esc(r.job.jobId)}</span>
      <p class="hint">No image API key is configured, so nothing has been generated yet. The exact prompt above was saved to <span class="mono">queue/jobs.json</span>${r.job.references?.length ? ` with ${r.job.references.length} approved master reference(s)` : ''}.</p>
      <code>node scripts/studio.mjs queue</code></div>`;
  } else {
    const e = S.manifest.artworks[r.id];
    box.innerHTML = `<div class="result"><div class="frame"><img src="${imgUrl(e)}" alt="Generated ${esc(r.id)}"></div>
      <div style="display:grid;gap:10px;align-content:start"><span class="mono">${esc(r.id)}</span>
      <div class="btn-row"><button class="btn" data-open="${esc(r.id)}">Review</button></div></div></div>`;
  }
}

function bindGenerate() {
  const form = $('#gen-form');
  const rerender = () => renderGenerate();
  $('#g-target').addEventListener('change', (e) => { if (e.target.value) loadTarget(e.target.value); else { G.target = ''; } rerender(); });
  $('#g-usebrief')?.addEventListener('change', (e) => { G.useBrief = e.target.checked; G.edited = null; rerender(); });
  form.addEventListener('change', (e) => {
    const t = e.target;
    if (t.name === 'accent') { G.accent = t.value; if (G.secondary === t.value) G.secondary = null; G.edited = null; return rerender(); }
    if (t.name === 'secondary') G.secondary = t.value || null;
    if (t.name === 'treatment') G.treatment = t.value;
    if (t.id === 'g-comp') G.composition = t.value;
    if (t.id === 'g-rand') G.randomise = t.checked;
    G.edited = null; updatePrompt();
    $('#g-reset').disabled = true;
  });
  $$('input[name="ref-pick"]').forEach((cb) => cb.addEventListener('change', () => {
    const val = cb.value;
    if (!G.references) G.references = [];
    if (cb.checked) {
      if (!G.references.includes(val)) G.references.push(val);
    } else {
      G.references = G.references.filter((x) => x !== val);
    }
    G.edited = null;
    updatePrompt();
    rerender();
  }));
  $('#btn-upload-ref-gen')?.addEventListener('click', () => openUploadDialog('reference'));
  $('#g-instr').addEventListener('input', (e) => { G.instructions = e.target.value; if (G.edited === null) updatePrompt(); });
  $('#g-reseed').addEventListener('click', () => { G.seed = newSeed(); G.randomise = true; G.edited = null; rerender(); });
  $('#g-prompt').addEventListener('input', (e) => { G.edited = e.target.value; $('#g-reset').disabled = false; });
  $('#g-reset').addEventListener('click', () => { G.edited = null; rerender(); });
  $$('[data-dequeue]').forEach((b) => b.addEventListener('click', async () => { await api(`/api/queue/${b.dataset.dequeue}`, { method: 'DELETE' }); await refresh(); rerender(); }));
  $('#g-result').addEventListener('click', (e) => { const o = e.target.closest('[data-open]'); if (o) openLightbox(o.dataset.open); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('#g-submit');
    btn.disabled = true; btn.textContent = S.mode === 'api' ? 'Generating…' : 'Queueing…';
    try {
      const spec = currentSpec();
      const prompt = $('#g-prompt').value;
      G.last = await api('/api/generate', { method: 'POST', body: { target: G.target || null, spec, prompt } });
      await refresh();
      if (G.last.mode === 'api') toast(`${G.last.id} generated`);
      else toast(`${G.last.id} queued`);
      if (G.randomise) G.seed = newSeed();
      renderGenerate();
    } catch (err) {
      toast(err.message, true);
      btn.disabled = false; btn.textContent = 'Retry';
    }
  });
}

// ---------- GALLERY ----------
const F = { collection: 'all', treatment: '', accent: '', status: 'all' };

function filtered() {
  return items().filter((it) => {
    if (F.collection !== 'all' && it.collection !== F.collection) return false;
    if (F.treatment && it.treatment !== F.treatment) return false;
    if (F.accent && it.accent !== F.accent && it.secondary !== F.accent) return false;
    const st = it.entry?.status || 'empty';
    if (F.status !== 'all' && st !== F.status) return false;
    return true;
  });
}

function card(it) {
  const e = it.entry;
  const src = imgUrl(e);
  const st = e?.status || 'empty';
  return `<button class="card" data-open="${it.id}" aria-label="Open ${it.id}">
    <div class="frame">
      ${src ? `<img src="${src}" alt="${esc(it.id)}" loading="lazy">` : `<div class="empty"><span class="tag">Not generated</span><span>${esc(it.brief)}</span></div>`}
      ${st === 'approved' ? '<span class="flag approved">Approved</span>' : e?.pending ? '<span class="flag pending">Queued</span>' : ''}
    </div>
    <div class="meta"><span class="id">${it.id.replace('RUPTURE_', '')}</span><span class="dots">${dotsFor(it)}</span></div>
  </button>`;
}

function renderGallery() {
  const I = S.identity;
  const list = filtered();
  const lanes = [
    {
      id: 'approved',
      title: 'Approved Artwork',
      subtitle: 'Verified & locked master deliverables · 1080 × 1920 portrait',
      badge: 'Approved Artwork',
      badgeClass: 'approved',
      items: list.filter((i) => i.entry?.status === 'approved'),
    },
    {
      id: 'draft',
      title: 'Unapproved artwork / awaiting review',
      subtitle: 'Generated master candidates · review in lightbox to approve or tweak',
      badge: 'Awaiting Review',
      badgeClass: 'draft',
      items: list.filter((i) => i.entry?.status === 'draft'),
    },
    {
      id: 'empty',
      title: 'Not yet generated artwork',
      subtitle: 'Queued or planned master slots awaiting synthesis',
      badge: 'Queued / Empty',
      badgeClass: 'empty',
      items: list.filter((i) => !i.entry || i.entry.status === 'empty'),
    },
  ];
  const hasX = items().some((i) => i.collection === 'X');
  const segBtn = (key, val, label) => `<button class="chip" data-f="${key}" data-v="${val}" aria-pressed="${F[key] === val}">${label}</button>`;
  $('#view-gallery').innerHTML = `
    <div class="section-head"><div><p class="eyebrow">Gallery · ${esc(I.conceptTitle)}</p><h2>Liquid Geometry Collection</h2></div></div>
    <div class="filters">
      <div class="row"><span class="mono">Collection</span>${segBtn('collection', 'all', 'All')}${S.collection.collections.map((c) => segBtn('collection', c.id, `${c.id === '00' ? '' : c.id + ' '}${c.name}`)).join('')}${hasX ? segBtn('collection', 'X', 'Explorations') : ''}</div>
      <div class="row"><span class="mono">Material</span>${segBtn('treatment', '', 'Any')}${I.treatments.map((t) => segBtn('treatment', t.id, esc(t.name))).join('')}</div>
      <div class="row"><span class="mono">Refraction</span>${segBtn('accent', '', 'Any')}${I.accents.map((a) => `<button class="chip" data-f="accent" data-v="${a.id}" aria-pressed="${F.accent === a.id}"><span class="dot" style="background:${a.hex}"></span>${esc(a.name)}</button>`).join('')}</div>
      <div class="row"><span class="mono">Status</span>${['all', 'approved', 'draft', 'empty'].map((s) => segBtn('status', s, { all: 'All', approved: 'Approved Artwork', draft: 'Unapproved / Review', empty: 'Not generated' }[s])).join('')}</div>
    </div>
    ${lanes.filter((l) => l.items.length).map((l) => `
      <section class="lane lane-${l.id}">
        <div class="lane-head">
          <div class="lane-title-group">
            <div class="lane-badge-row">
              <span class="lane-badge ${l.badgeClass}">${l.badge}</span>
              <span class="lane-count">${l.items.length} ${l.items.length === 1 ? 'artwork' : 'artworks'}</span>
            </div>
            <h3 class="lane-title">${esc(l.title)}</h3>
            <p class="lane-subtitle">${esc(l.subtitle)}</p>
          </div>
        </div>
        <div class="grid">${l.items.map(card).join('')}</div>
      </section>
    `).join('') || '<p class="muted">No artworks match these filters.</p>'}`;

  $$('[data-f]').forEach((b) => b.addEventListener('click', () => { F[b.dataset.f] = b.dataset.v; renderGallery(); }));
  $$('#view-gallery [data-open]').forEach((b) => b.addEventListener('click', () => openLightbox(b.dataset.open)));
}

// ---------- LIGHTBOX ----------
const LB = { id: null, safe: false };

function openLightbox(id) {
  LB.id = id;
  const dlg = $('#lightbox');
  renderLightbox();
  if (!dlg.open) dlg.showModal();
}

function renderLightbox() {
  const it = items().find((i) => i.id === LB.id);
  if (!it) return;
  const e = it.entry;
  const v = activeVersion(e);
  const src = imgUrl(e);
  const art = S.collection.artworks.find((a) => a.id === it.id);
  $('#lightbox').innerHTML = `<div class="lb">
    <div class="lb-stage">
      ${src ? `<img src="${src}" alt="${esc(it.id)}">` : `<div class="none"><div><p class="mono">Not generated yet</p><p class="hint">${esc(it.brief)}</p></div></div>`}
      ${LB.safe ? '<div class="safe" aria-hidden="true"><span style="top:6px">Instagram UI · top</span><span style="bottom:6px">Instagram UI · bottom</span></div>' : ''}
    </div>
    <div class="lb-side">
      <button class="btn small close" data-act="close" aria-label="Close preview">Close ✕</button>
      <div><p class="eyebrow">${esc(collName(it.collection))}</p><h2>${esc(it.id)}</h2></div>
      <div class="btn-row">
        ${e?.status === 'approved' ? '<button class="btn" data-act="unapprove">Unapprove</button>' : `<button class="btn approve" data-act="approve" ${src ? '' : 'disabled'}>Approve ✓</button>`}
        <button class="btn" data-act="export-png" ${src ? '' : 'disabled'}>Export PNG</button>
        <button class="btn" data-act="export-jpg" ${src ? '' : 'disabled'}>Export JPEG</button>
        <button class="btn" data-act="safe" aria-pressed="${LB.safe}">${LB.safe ? 'Hide' : 'Show'} safe zones</button>
      </div>
      <dl class="kv">
        <dt>Status</dt><dd><span class="status-txt ${e?.status || 'empty'}">${e?.status === 'draft' ? 'Unapproved' : e?.status || 'empty'}</span>${e?.pending ? ' · queued' : ''}</dd>
        <dt>Concept</dt><dd>${esc(S.identity.conceptTitle)}</dd>
        <dt>Refraction</dt><dd>${esc(accentById(it.accent)?.name || '—')}${it.secondary ? ` · ${esc(accentById(it.secondary)?.name)} (sparingly)` : ''}</dd>
        <dt>Material</dt><dd>${esc(treatmentById(it.treatment)?.name || it.treatment || '—')}</dd>
        <dt>Brief</dt><dd>${esc(it.brief)}</dd>
        ${art?.space ? `<dt>Type space</dt><dd>${esc(art.space)}</dd>` : ''}
        ${art?.motion ? `<dt>Motion cue</dt><dd>${esc(art.motion)}</dd>` : ''}
        ${v?.note ? `<dt>Note</dt><dd>${esc(v.note)}</dd>` : ''}
        ${v ? `<dt>Source</dt><dd class="mono">${esc(v.source)} · ${new Date(v.createdAt).toLocaleString()}</dd>` : ''}
      </dl>
      ${v ? `<details class="prompt"><summary>Prompt used</summary><pre>${esc(v.prompt)}</pre></details>` : ''}
      <fieldset>
        <legend>Regenerate this artwork only</legend>
        <textarea id="lb-instr" placeholder="Optional direction for the new version, e.g. more negative space in the upper third"></textarea>
        <label class="chip" style="justify-self:start"><input type="checkbox" id="lb-rand">Randomise studio light / scale / density</label>
        <div class="btn-row">
          <button class="btn primary" data-act="regen">${S.mode === 'api' ? 'Regenerate' : 'Queue regeneration'}</button>
          <button class="btn" data-act="tweak">Open in Generate</button>
        </div>
        <p class="hint">Regenerates this specific artwork.</p>
      </fieldset>
    </div>
  </div>`;
}

async function downloadExport(id, format) {
  const r = await api(`/api/export/${id}?format=${format}`, { method: 'POST' });
  const a = document.createElement('a');
  a.href = `/download/${r.file.split('/').pop()}`;
  a.download = r.file.split('/').pop();
  document.body.append(a); a.click(); a.remove();
  toast(`${a.download} · ${r.width}×${r.height}`);
  await refresh();
}

function bindLightbox() {
  const dlg = $('#lightbox');
  dlg.addEventListener('click', async (ev) => {
    if (ev.target === dlg) return dlg.close();
    const ver = ev.target.closest('[data-ver]');
    if (ver) { await api(`/api/activate/${LB.id}`, { method: 'POST', body: { v: Number(ver.dataset.ver) } }); await refresh(); return renderLightbox(); }
    const btn = ev.target.closest('[data-act]');
    if (!btn) return;
    const act = btn.dataset.act;
    try {
      if (act === 'close') return dlg.close();
      if (act === 'safe') { LB.safe = !LB.safe; return renderLightbox(); }
      if (act === 'approve' || act === 'unapprove') { await api(`/api/${act}/${LB.id}`, { method: 'POST' }); await refresh(); toast(`${LB.id} ${act}d`); renderLightbox(); return rerenderView(); }
      if (act === 'export-png') return downloadExport(LB.id, 'png');
      if (act === 'export-jpg') return downloadExport(LB.id, 'jpg');
      if (act === 'tweak') { if (S.collection.artworks.some((a) => a.id === LB.id)) loadTarget(LB.id); dlg.close(); location.hash = '#generate'; return; }
      if (act === 'regen') {
        btn.disabled = true; btn.textContent = S.mode === 'api' ? 'Generating…' : 'Queueing…';
        const body = { instructions: $('#lb-instr').value, randomise: $('#lb-rand').checked, seed: newSeed() };
        const it = items().find((i) => i.id === LB.id);
        if (it.collection === 'X') {
          const prev = activeVersion(it.entry)?.spec || it.entry.spec || {};
          body.spec = { ...prev };
        }
        const r = await api(`/api/regenerate/${LB.id}`, { method: 'POST', body });
        await refresh();
        toast(r.mode === 'api' ? `${LB.id} regenerated` : `${LB.id} queued for regeneration`);
        renderLightbox(); rerenderView();
      }
    } catch (err) { toast(err.message, true); renderLightbox(); }
  });
}

// ---------- EXPORT ----------
function renderExport() {
  const list = items();
  const exported = new Set(S.exports || []);
  $('#view-export').innerHTML = `
    <div class="section-head">
      <div><p class="eyebrow">Export · 1080 × 1920 · exact 9:16</p><h2>Deliverables</h2></div>
      <div class="btn-row">
        <button class="btn primary" data-all="png">Export all approved · PNG</button>
        <button class="btn" data-all="jpg">Export all approved · JPEG</button>
      </div>
    </div>
    <p class="hint" style="margin-bottom:16px">Files are written to <span class="mono">exports/</span> as <span class="mono">RUPTURE_XX_YY.png|jpg</span>. The source is centre-cropped to exact 9:16 (at most a few pixels) and resampled to 1080×1920. Download links appear only for files that exist on disk.</p>
    <table>
      <thead><tr><th></th><th>File name</th><th>Collection</th><th>Status</th><th>Version</th><th>Export</th><th>On disk</th></tr></thead>
      <tbody>
        ${list.map((it) => {
          const e = it.entry; const src = imgUrl(e);
          const files = ['png', 'jpg'].filter((x) => exported.has(`${it.id}.${x}`));
          return `<tr>
            <td>${src ? `<img class="thumb" src="${src}" alt="" loading="lazy">` : '<span class="thumb blank"></span>'}</td>
            <td class="mono" style="font-size:12px">${it.id}</td>
            <td class="muted">${esc(collName(it.collection))}</td>
            <td><span class="status-txt ${e?.status || 'empty'}">${e?.status === 'draft' ? 'unapproved' : e?.status || 'empty'}</span></td>
            <td class="mono muted">${e?.activeVersion ? 'v' + e.activeVersion : '—'}</td>
            <td><div class="btn-row"><button class="btn small" data-exp="${it.id}" data-fmt="png" ${src ? '' : 'disabled'}>PNG</button><button class="btn small" data-exp="${it.id}" data-fmt="jpg" ${src ? '' : 'disabled'}>JPEG</button></div></td>
            <td>${files.map((f) => `<a class="mono" href="/download/${it.id}.${f}" download>${it.id}.${f}</a>`).join('<br>') || '<span class="muted mono">—</span>'}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
  $$('[data-exp]').forEach((b) => b.addEventListener('click', async () => {
    b.disabled = true;
    try { await downloadExport(b.dataset.exp, b.dataset.fmt); renderExport(); } catch (err) { toast(err.message, true); b.disabled = false; }
  }));
  $$('[data-all]').forEach((b) => b.addEventListener('click', async () => {
    b.disabled = true; b.textContent = 'Exporting…';
    try {
      const r = await api(`/api/export-approved?format=${b.dataset.all}`, { method: 'POST' });
      await refresh(); toast(`${r.count} approved artwork(s) exported to exports/`); renderExport();
    } catch (err) { toast(err.message, true); renderExport(); }
  }));
}

// ---------- router ----------
const VIEWS = { system: renderSystem, gallery: renderGallery, generate: renderGenerate, export: renderExport };
const currentView = () => (VIEWS[location.hash.slice(1)] ? location.hash.slice(1) : 'system');
function rerenderView() { VIEWS[currentView()](); }

function route() {
  const v = currentView();
  for (const k of Object.keys(VIEWS)) $(`#view-${k}`).hidden = k !== v;
  $$('.tabs a').forEach((a) => (a.ariaCurrent = a.dataset.tab === v ? 'page' : null));
  VIEWS[v]();
  window.scrollTo({ top: 0 });
}

// Poll while jobs are queued so agent-ingested images appear without a reload.
setInterval(async () => {
  if (!S?.queue.jobs.length || document.hidden || $('#lightbox').open) return;
  const before = JSON.stringify(S.manifest);
  await refresh();
  if (JSON.stringify(S.manifest) !== before && currentView() !== 'generate') rerenderView();
}, 8000);

// ---------- UPLOAD DIALOG ----------
let UP = {
  items: [], // Array of { id, file, dataUrl, name, size, title, note, status, error }
  target: 'reference', // 'reference' | 'master'
  slot: 'NEW',
  accent: 'pale-cyan',
  secondary: 'lavender',
  treatment: 'sculptural-chrome',
  note: '',
  isUploading: false,
  progressText: '',
  progressPct: 0,
};

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function openUploadDialog(target = 'reference', slot = 'NEW') {
  UP.target = target;
  UP.slot = slot;
  UP.items = [];
  UP.note = '';
  UP.isUploading = false;
  UP.progressText = '';
  UP.progressPct = 0;
  renderUploadDialog();
  const dlg = $('#upload-dialog');
  if (dlg && !dlg.open) dlg.showModal();
}

function renderUploadDialog() {
  const dlg = $('#upload-dialog');
  if (!dlg) return;
  const masters = S.collection.artworks.filter((a) => a.collection === '00');
  const isMaster = UP.target === 'master';
  const hasItems = UP.items.length > 0;
  const totalBytes = UP.items.reduce((s, it) => s + (it.size || 0), 0);

  dlg.innerHTML = `
    <div class="upload-modal">
      <div class="upload-head">
        <div>
          <p class="eyebrow">Ingestion · Multi-Artwork Ingestion</p>
          <h2>Upload Artwork References &amp; Masters</h2>
        </div>
        <button type="button" class="btn small" id="up-close" ${UP.isUploading ? 'disabled' : ''}>Close ✕</button>
      </div>

      <p class="hint" style="margin:0">Upload one or multiple visual references found online to condition generation prompts, or promote them directly into the official Master Artworks collection.</p>

      <form id="up-form">
        <div class="dropzone ${hasItems ? 'compact' : ''}" id="up-dropzone">
          <input type="file" id="up-file-input" accept="image/png,image/jpeg,image/webp" multiple ${UP.isUploading ? 'disabled' : ''}>
          ${hasItems ? `
            <span class="icon">＋</span>
            <span class="txt">Add more artworks (drop or click to browse)</span>
            <span class="sub">${UP.items.length} artwork${UP.items.length > 1 ? 's' : ''} queued</span>
          ` : `
            <span class="icon">⇪</span>
            <span class="txt">Drop artwork image(s) here or click to browse</span>
            <span class="sub">Select single or multiple files (PNG, JPEG, WEBP · portrait recommended)</span>
          `}
        </div>

        ${hasItems ? `
          <div class="upload-queue-wrap" style="margin-top:14px">
            <div class="queue-head">
              <span class="eyebrow" style="margin:0">${UP.items.length} Artwork${UP.items.length > 1 ? 's' : ''} Queued (${formatBytes(totalBytes)})</span>
              <button type="button" class="btn small muted" id="up-clear-all" ${UP.isUploading ? 'disabled' : ''}>Clear All</button>
            </div>
            <div class="upload-queue-list">
              ${UP.items.map((item, idx) => {
                const slotLabel = isMaster
                  ? (UP.items.length === 1 && UP.slot !== 'NEW' ? UP.slot : `RUPTURE_M${String(masters.length + 1 + idx).padStart(2, '0')}`)
                  : null;
                return `
                  <div class="queue-item" data-idx="${idx}">
                    <img src="${item.dataUrl}" alt="${esc(item.name)}" class="queue-thumb">
                    <div class="queue-meta">
                      <div class="queue-title-row">
                        ${slotLabel ? `<span class="queue-slot-badge mono">${esc(slotLabel)}</span>` : ''}
                        <input type="text" class="queue-item-title" data-idx="${idx}" value="${esc(item.title)}" placeholder="Artwork title" ${UP.isUploading ? 'disabled' : ''}>
                      </div>
                      <div class="queue-sub mono small">${esc(item.name)} · ${formatBytes(item.size)}</div>
                    </div>
                    <div class="queue-status" id="queue-status-${idx}">
                      ${item.status === 'uploading' ? '<span class="badge mono cyan">Uploading…</span>' : ''}
                      ${item.status === 'done' ? '<span class="badge mono approved">Done ✓</span>' : ''}
                      ${item.status === 'error' ? `<span class="badge mono error" title="${esc(item.error || 'Failed')}">Error ✕</span>` : ''}
                      ${item.status === 'pending' && !UP.isUploading ? `<button type="button" class="queue-remove-btn" data-idx="${idx}" title="Remove this artwork">✕</button>` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        <div style="margin-top:16px">
          <label class="eyebrow" style="display:block;margin-bottom:8px">Destination</label>
          <div class="target-toggle">
            <label>
              <input type="radio" name="up-target" value="reference" ${!isMaster ? 'checked' : ''} ${UP.isUploading ? 'disabled' : ''}>
              <strong>Visual Reference</strong>
              <div class="muted small" style="font-size:11px;margin-top:4px">Add to Reference Library to condition textures &amp; lighting in generation</div>
            </label>
            <label>
              <input type="radio" name="up-target" value="master" ${isMaster ? 'checked' : ''} ${UP.isUploading ? 'disabled' : ''}>
              <strong>Master Artwork</strong>
              <div class="muted small" style="font-size:11px;margin-top:4px">Register directly into Master Collection as official 9:16 portrait deliverables</div>
            </label>
          </div>
        </div>

        ${isMaster ? `
          <div style="margin-top:14px;display:grid;gap:12px">
            ${UP.items.length <= 1 ? `
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div>
                  <label class="eyebrow" for="up-slot-select">Target Master Slot</label>
                  <select id="up-slot-select" style="width:100%;padding:8px;background:var(--ink);border:1px solid var(--line-2);border-radius:var(--radius)" ${UP.isUploading ? 'disabled' : ''}>
                    <option value="NEW" ${UP.slot === 'NEW' ? 'selected' : ''}>Create New Slot (RUPTURE_M${String(masters.length + 1).padStart(2, '0')})</option>
                    ${masters.map((m) => `<option value="${m.id}" ${UP.slot === m.id ? 'selected' : ''}>Replace / Version ${m.id} (${esc(m.brief.split(':')[0])})</option>`).join('')}
                  </select>
                </div>
                <div>
                  <label class="eyebrow" for="up-accent-select">Refraction Accent</label>
                  <select id="up-accent-select" style="width:100%;padding:8px;background:var(--ink);border:1px solid var(--line-2);border-radius:var(--radius)" ${UP.isUploading ? 'disabled' : ''}>
                    ${S.identity.accents.map((a) => `<option value="${a.id}" ${UP.accent === a.id ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}
                  </select>
                </div>
              </div>
            ` : `
              <div class="batch-slot-callout">
                Batch Master Allocation: Will create <strong>${UP.items.length} new master slots</strong> sequentially from <strong>RUPTURE_M${String(masters.length + 1).padStart(2, '0')}</strong> to <strong>RUPTURE_M${String(masters.length + UP.items.length).padStart(2, '0')}</strong> and auto-export each to 1080×1920 portrait PNG &amp; JPG.
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div>
                  <label class="eyebrow" for="up-accent-select">Default Refraction Accent</label>
                  <select id="up-accent-select" style="width:100%;padding:8px;background:var(--ink);border:1px solid var(--line-2);border-radius:var(--radius)" ${UP.isUploading ? 'disabled' : ''}>
                    ${S.identity.accents.map((a) => `<option value="${a.id}" ${UP.accent === a.id ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}
                  </select>
                </div>
                <div>
                  <label class="eyebrow" for="up-treatment-select">Material Treatment</label>
                  <select id="up-treatment-select" style="width:100%;padding:8px;background:var(--ink);border:1px solid var(--line-2);border-radius:var(--radius)" ${UP.isUploading ? 'disabled' : ''}>
                    ${S.identity.treatments.map((t) => `<option value="${t.id}" ${UP.treatment === t.id ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}
                  </select>
                </div>
              </div>
            `}
          </div>
        ` : `
          <div style="margin-top:14px">
            <label class="eyebrow" for="up-batch-note">Reference Notes &amp; Guidance (Optional)</label>
            <textarea id="up-batch-note" placeholder="Describe the material behaviour, fluid tension, or lighting highlights to guide generations..." style="width:100%;height:54px;padding:8px 12px;background:var(--ink);border:1px solid var(--line-2);border-radius:var(--radius)" ${UP.isUploading ? 'disabled' : ''}>${esc(UP.note)}</textarea>
          </div>
        `}

        <div class="upload-progress-wrap" id="up-progress-box" style="${!UP.isUploading ? 'display:none;margin-top:16px;' : 'margin-top:16px;'}">
          <div class="upload-progress-info">
            <span class="mono" id="up-progress-txt">${esc(UP.progressText || 'Uploading…')}</span>
            <span class="mono" id="up-progress-pct">${UP.progressPct}%</span>
          </div>
          <div class="upload-progress-bar">
            <div class="upload-progress-fill" id="up-progress-fill" style="width:${UP.progressPct}%"></div>
          </div>
        </div>

        <div class="btn-row" style="margin-top:20px;justify-content:flex-end">
          <button type="button" class="btn" id="up-cancel" ${UP.isUploading ? 'disabled' : ''}>Cancel</button>
          <button type="submit" class="btn primary" id="up-submit" ${!hasItems || UP.isUploading ? 'disabled' : ''}>
            ${!hasItems
              ? 'Select Artwork(s) to Upload'
              : (UP.items.length === 1
                ? `Upload 1 Artwork (${isMaster ? 'Master Collection' : 'Reference Library'})`
                : `Upload ${UP.items.length} Artworks (${isMaster ? 'Master Collection' : 'Reference Library'})`)}
          </button>
        </div>
      </form>
    </div>
  `;

  bindUploadEvents();
}

function bindUploadEvents() {
  const dlg = $('#upload-dialog');
  const form = $('#up-form');
  const fileInput = $('#up-file-input');
  const dropzone = $('#up-dropzone');
  const cancelBtn = $('#up-cancel');
  const closeBtn = $('#up-close');

  const close = () => { if (!UP.isUploading) dlg.close(); };
  cancelBtn?.addEventListener('click', close);
  closeBtn?.addEventListener('click', close);
  dlg.addEventListener('click', (e) => { if (e.target === dlg && !UP.isUploading) close(); });

  const addFiles = async (fileList) => {
    const rawFiles = Array.from(fileList || []);
    const valid = rawFiles.filter((f) => f && f.type.startsWith('image/'));
    if (!valid.length) {
      return toast('Please select valid image files (PNG, JPEG, WEBP)', true);
    }
    for (const file of valid) {
      await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          UP.items.push({
            id: 'item_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
            file,
            dataUrl: ev.target.result,
            name: file.name,
            size: file.size,
            title: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
            note: '',
            status: 'pending',
            error: null,
          });
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }
    renderUploadDialog();
  };

  fileInput?.addEventListener('change', (e) => {
    if (e.target.files?.length) {
      addFiles(e.target.files);
      e.target.value = '';
    }
  });

  if (dropzone) {
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
    });
  }

  $('#up-clear-all')?.addEventListener('click', () => {
    if (UP.isUploading) return;
    UP.items = [];
    renderUploadDialog();
  });

  $$('.queue-remove-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = Number(btn.dataset.idx);
      if (!isNaN(idx) && idx >= 0 && idx < UP.items.length) {
        UP.items.splice(idx, 1);
        renderUploadDialog();
      }
    });
  });

  $$('.queue-item-title').forEach((inp) => {
    inp.addEventListener('input', () => {
      const idx = Number(inp.dataset.idx);
      if (UP.items[idx]) UP.items[idx].title = inp.value;
    });
  });

  $$('input[name="up-target"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      UP.target = e.target.value;
      renderUploadDialog();
    });
  });

  $('#up-slot-select')?.addEventListener('change', (e) => { UP.slot = e.target.value; });
  $('#up-accent-select')?.addEventListener('change', (e) => { UP.accent = e.target.value; });
  $('#up-treatment-select')?.addEventListener('change', (e) => { UP.treatment = e.target.value; });
  $('#up-batch-note')?.addEventListener('input', (e) => { UP.note = e.target.value; });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!UP.items.length) return toast('Please select at least one image to upload', true);
    if (UP.isUploading) return;

    UP.isUploading = true;
    const subBtn = $('#up-submit');
    const pBox = $('#up-progress-box');
    const pTxt = $('#up-progress-txt');
    const pPct = $('#up-progress-pct');
    const pFill = $('#up-progress-fill');

    if (pBox) pBox.style.display = 'grid';
    if (subBtn) {
      subBtn.disabled = true;
      subBtn.textContent = 'Uploading…';
    }
    cancelBtn && (cancelBtn.disabled = true);
    closeBtn && (closeBtn.disabled = true);

    const total = UP.items.length;
    let successCount = 0;
    const registeredIds = [];

    for (let i = 0; i < total; i++) {
      const item = UP.items[i];
      item.status = 'uploading';
      const pct = Math.round((i / total) * 100);
      UP.progressPct = pct;
      UP.progressText = `Uploading ${i + 1} of ${total}: ${item.name}…`;
      if (pTxt) pTxt.textContent = UP.progressText;
      if (pPct) pPct.textContent = `${pct}%`;
      if (pFill) pFill.style.width = `${pct}%`;

      const statusEl = $(`#queue-status-${i}`);
      if (statusEl) statusEl.innerHTML = '<span class="badge mono cyan">Uploading…</span>';

      try {
        const payload = {
          data: item.dataUrl,
          name: item.name,
          title: item.title,
          note: item.note || UP.note,
          target: UP.target,
          slot: (UP.items.length === 1 && UP.slot !== 'NEW') ? UP.slot : null,
          accent: UP.accent,
          treatment: UP.treatment,
        };
        const res = await api('/api/upload', { method: 'POST', body: payload });
        item.status = 'done';
        successCount++;
        if (res.type === 'master' && res.id) registeredIds.push(res.id);
        if (statusEl) statusEl.innerHTML = '<span class="badge mono approved">Done ✓</span>';
      } catch (err) {
        console.error('Upload error for item', item.name, err);
        item.status = 'error';
        item.error = err.message;
        if (statusEl) statusEl.innerHTML = `<span class="badge mono error" title="${esc(err.message)}">Error ✕</span>`;
      }
    }

    UP.progressPct = 100;
    UP.progressText = `Completed! ${successCount} of ${total} artworks uploaded.`;
    if (pTxt) pTxt.textContent = UP.progressText;
    if (pPct) pPct.textContent = '100%';
    if (pFill) pFill.style.width = '100%';

    await refresh();

    setTimeout(() => {
      UP.isUploading = false;
      dlg.close();
      if (UP.target === 'master') {
        toast(`Uploaded ${successCount} artwork(s) to Master Collection: ${registeredIds.join(', ')}`);
        if (currentView() !== 'system') location.hash = '#system'; else renderSystem();
      } else {
        toast(`Uploaded ${successCount} artwork(s) to Reference Library`);
        if (currentView() === 'system') renderSystem();
        else if (currentView() === 'generate') renderGenerate();
      }
    }, 600);
  });
}

await refresh();
bindLightbox();
$('#btn-open-upload')?.addEventListener('click', () => openUploadDialog('reference'));
window.addEventListener('hashchange', route);
route();
