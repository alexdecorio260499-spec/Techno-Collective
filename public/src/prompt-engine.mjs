// RUPTURE prompt engine — shared by the browser UI and the Node server.
// Dedicated to ANOMALY — CONCEPT 3: LIQUID GEOMETRY.
// Pure functions: identity data in, prompt text out. No DOM, no fs.

/** Deterministic PRNG so every randomised variation can be reproduced from its seed. */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const newSeed = () => Math.floor(Math.random() * 2 ** 31);

const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
const byId = (list = [], id) => list.find((x) => x.id === id);

/**
 * Fill unspecified fields of a spec with choices that stay strictly inside
 * ANOMALY — CONCEPT 3: LIQUID GEOMETRY. Explicit user choices are never overridden.
 */
export function randomiseSpec(identity, spec = {}, seed = newSeed()) {
  const r = rng(seed);
  const out = { ...spec, seed, pillars: [{ id: 'liquid-geometry', weight: 1 }] };
  out.accent = spec.accent || pick(r, identity.accents).id;
  if (spec.secondary === undefined) {
    const others = identity.accents.filter((a) => a.id !== out.accent && a.id !== 'chrome');
    out.secondary = others.length && r() < 0.65 ? pick(r, others).id : null;
  }
  out.treatment = spec.treatment || pick(r, identity.treatments).id;
  if (!spec.brief) out.composition = spec.composition || pick(r, identity.compositions).id;
  out.light = spec.light || pick(r, identity.variation.light);
  out.scale = spec.scale || pick(r, identity.variation.scale);
  out.density = spec.density || pick(r, identity.variation.density);
  out.space = spec.space || pick(r, identity.variation.space);
  return out;
}

/** Build the full layered prompt for ANOMALY — CONCEPT 3: LIQUID GEOMETRY. */
export function buildPrompt(identity, spec = {}) {
  const R = identity.promptRules;
  const parts = [R.base];

  // Composition
  if (spec.brief) {
    parts.push(`COMPOSITION: ${spec.brief}`);
  } else if (spec.composition) {
    const c = byId(identity.compositions, spec.composition);
    parts.push(`COMPOSITION: One striking abstract material formation — ${c ? c.prompt : spec.composition}. Combine organic fluidity with precise, minimal geometry. Use deliberate negative space and sophisticated asymmetry.`);
  } else {
    parts.push(`COMPOSITION: ${identity.directionSpec?.composition || 'One striking abstract material formation, with elegant flowing curves, folded liquid surfaces, reflective globes, distorted rings or fluid geometric structures. Combine organic fluidity with precise, minimal geometry. Use deliberate negative space and sophisticated asymmetry.'}`);
  }

  // Core Material + specific material formation treatment
  let material = R.coreMaterial;
  if (spec.treatment) {
    const t = byId(identity.treatments, spec.treatment);
    if (t) material += ` ${t.prompt}.`;
  }
  parts.push(material);

  // Light
  parts.push(R.light);

  // Colour Discipline
  const acc = spec.accent && byId(identity.accents, spec.accent);
  const sec = spec.secondary && byId(identity.accents, spec.secondary);
  let colour = 'COLOUR DISCIPLINE: Silver, pearl, white and charcoal are dominant.';
  if (acc) colour += ` Primary iridescent reflection: ${acc.prompt}.`;
  if (sec && sec.id !== acc?.id) colour += ` Secondary subtle refraction: ${sec.prompt}.`;
  colour += ' Use only one or two subtle iridescent accent colours, appearing strictly as light refracted through the material.';
  parts.push(colour);

  // Surface Quality + variation dials
  let surface = R.surfaceQuality;
  const dials = [spec.light, spec.scale, spec.density].filter(Boolean);
  if (dials.length) surface += ` Studio setup: ${dials.join('; ')}.`;
  parts.push(surface);

  // Art Direction
  parts.push(R.direction);

  // Framing & typography safe space
  parts.push(`${R.format}${spec.space ? ` Keep the ${spec.space} calm and dark as negative space for later typography.` : ''}`);

  if (Array.isArray(spec.references) && spec.references.length) {
    parts.push(`VISUAL REFERENCES: Condition material textures, fluid tension, and lighting behaviour on the selected reference image(s): ${spec.references.map((r) => r.split('/').pop()).join(', ')}.`);
  }

  if (spec.instructions && spec.instructions.trim()) {
    parts.push(`ADDITIONAL DIRECTION: ${spec.instructions.trim()}`);
  }

  // Exclude
  parts.push(R.negative);

  return parts.join('\n\n');
}

/** Spec for a collection artwork record from data/collection.json. */
export function specFromArtwork(art) {
  return {
    pillars: [{ id: 'liquid-geometry', weight: 1 }],
    accent: art.accent,
    secondary: art.secondary,
    treatment: art.treatment,
    brief: art.brief,
    space: art.space,
  };
}

export const RUPTURE_ID = /^RUPTURE_(01_0[1-9]|M06|X\d{3,})$/;
