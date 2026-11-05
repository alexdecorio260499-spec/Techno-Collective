// RUPTURE prompt engine — shared by the browser UI and the Node server.
// Dedicated to ANOMALY — CONCEPT 3: LIQUID GEOMETRY & MASTER ART DIRECTION 2.0.
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

// Controlled Visual Variation Taxonomies
export const VARIATION_TAXONOMY = {
  shapes: [
    { id: 'spherical', prompt: 'spherical curvature and continuous convex liquid tension' },
    { id: 'elongated', prompt: 'slender elongated fluid column and graceful vertical extension' },
    { id: 'twisted', prompt: 'helical twisted Möbius ribbon undergoing continuous torsional rotation' },
    { id: 'folded', prompt: 'crisp planar folded liquid terraces with sharp architectural bevels' },
    { id: 'tubular', prompt: 'continuous tubular fluid conduit with hollow interior aperture' },
    { id: 'fragmented', prompt: 'controlled dendritic fluid filaments branching into microscopic capillary droplets' },
    { id: 'organic', prompt: 'smooth organic meniscus spires with hanging fluid tension beads' },
    { id: 'angular', prompt: 'orthogonal razor-sheared chrome fins sliced at conflicting shear angles' },
    { id: 'asymmetrical', prompt: 'strikingly asymmetrical fluid sculpture with off-axis gravitational pull' },
    { id: 'layered', prompt: 'cascading multi-layer laminar fluid strata stacked in stepped terraces' },
    { id: 'fluid', prompt: 'curling tidal wave cresting in vacuum with dynamic forward momentum' },
    { id: 'sculptural', prompt: 'monumental chiseled liquid metal obelisk with faceted geometric planes' },
    { id: 'irregular', prompt: 'hyperbolic saddle surface in extreme topological tension' }
  ],
  compositions: [
    { id: 'centred', prompt: 'perfectly balanced central monumentality isolated in infinite void' },
    { id: 'off-centre', prompt: 'dynamic off-centre positioning with deliberate negative space breathing room' },
    { id: 'diagonal', prompt: 'sweeping diagonal trajectory cutting across the frame from corner to opposite edge' },
    { id: 'vertically-oriented', prompt: 'monolithic vertical orientation emphasizing towering height and tensile poise' },
    { id: 'horizontally-oriented', prompt: 'horizontal laminar strata sheared laterally across the wide focal plane' },
    { id: 'cropped-macro', prompt: 'dramatic macro crop slicing through the fluid contours, highlighting microscopic surface physics' },
    { id: 'floating-weightless', prompt: 'weightless zero-gravity suspension hovering freely in the central void' },
    { id: 'suspended-tensile', prompt: 'high-tension Rayleigh-Plateau pinch column stretching between opposing boundary nodes' },
    { id: 'multiple-overlapping', prompt: 'dual asymmetric fluid masses in close proximity mid-coalescence' },
    { id: 'single-dominant', prompt: 'one colossal solitary sculptural monolith commanding the entire visual field' },
    { id: 'monumental-close-up', prompt: 'towering low-angle close-up gazing upward at chiseled fluid ridges' },
    { id: 'negative-space-dominant', prompt: 'restrained minimal sculpture surrounded by 70% pure obsidian negative space' }
  ],
  perspectives: [
    { id: 'extreme-macro', prompt: 'extreme macro photography with razor-thin depth of field and crystalline specular roll-off' },
    { id: 'close-up-detail', prompt: 'intimate studio close-up showcasing micro-texture and fluid meniscus boundaries' },
    { id: 'medium-distance', prompt: 'medium-distance studio portrait framing the complete sculptural envelope' },
    { id: 'wide-composition', prompt: 'wide panoramic negative-space composition with generous room for technical typography' },
    { id: 'dramatic-perspective', prompt: 'dramatic low-angle heroic perspective accentuating monumental upward thrust' },
    { id: 'unusual-oblique', prompt: 'unusual 45-degree oblique perspective revealing topological depth' },
    { id: 'birds-eye-planar', prompt: 'high-angle top-down planar view inspecting topographic fluid contours' }
  ],
  materialEmphases: [
    { id: 'polished-mirror-chrome', prompt: 'mirror-polished liquid chrome with 100% specular reflectance and crisp studio edge definitions' },
    { id: 'satin-metallic-silver', prompt: 'satin metallic platinum with velvety diffuse sheen and subtle micro-grooves' },
    { id: 'viscous-liquid-mercury', prompt: 'dense viscous mercury with heavy cohesive surface tension and meniscus droplets' },
    { id: 'nacreous-pearlescent', prompt: 'luminous pearlescent silver with soft-white glow and subtle multi-chromatic sheen' },
    { id: 'translucent-optic-glass', prompt: 'gossamer-thin optical glass membrane with cyan/lavender caustic dispersion' },
    { id: 'subtle-iridescent-sheen', prompt: 'monochrome silver body catching whisper-faint refracted spectral highlights' },
    { id: 'hybrid-dual-material', prompt: 'interpenetrating chrome strata fused with translucent vitreous film boundaries' }
  ],
  lightingStates: [
    { id: 'dramatic-directional-key', prompt: 'high-contrast directional studio keylight casting razor-sharp specular highlights and deep velvety shadows' },
    { id: 'soft-diffuse-studio', prompt: 'large-source diffuse studio lighting wrapping gently around curved metallic contours' },
    { id: 'chiseled-rim-light', prompt: 'chiseled cold rim light tracing the outer fluid silhouettes against pitch-black void' },
    { id: 'high-contrast-specular', prompt: 'split specular studio lighting emphasizing mirror reflections and pure obsidian contrast' },
    { id: 'internal-refraction-glow', prompt: 'internal caustic light dispersion glowing softly through translucent material layers' },
    { id: 'deep-cavernous-shadows', prompt: 'low-key lighting with deep cavernous shadow crevices dissolving into pure void' }
  ]
};

/**
 * Fill unspecified fields of a spec with choices that stay strictly inside
 * Master Art Direction while enforcing Controlled Visual Variation (low, medium, high).
 */
export function randomiseSpec(identity, spec = {}, seed = newSeed()) {
  const r = rng(seed);
  const variationLevel = spec.variationLevel || 'medium'; // 'low' | 'medium' | 'high'
  const out = { ...spec, seed, variationLevel, pillars: [{ id: 'liquid-geometry', weight: 1 }] };

  // 1. Accent & Secondary color
  out.accent = spec.accent || pick(r, identity.accents).id;
  if (spec.secondary === undefined) {
    const others = identity.accents.filter((a) => a.id !== out.accent && a.id !== 'chrome' && a.id !== 'molten-red');
    out.secondary = others.length && r() < 0.65 ? pick(r, others).id : null;
  }

  // 2. Family & Treatment
  out.treatment = spec.treatment || (spec.primaryFamily ? spec.primaryFamily : pick(r, identity.treatments).id);

  // 3. Controlled Visual Variation selections based on level
  if (variationLevel === 'low') {
    // Tight adherence to reference: conservative centered or classic diagonal
    out.shape = spec.shape || pick(r, VARIATION_TAXONOMY.shapes.slice(0, 5)).id;
    out.composition = spec.composition || (r() < 0.6 ? 'centred' : 'diagonal');
    out.perspective = spec.perspective || 'medium-distance';
    out.lighting = spec.lighting || 'chiseled-rim-light';
  } else if (variationLevel === 'high') {
    // Adventurous, unexpected permutations
    out.shape = spec.shape || pick(r, VARIATION_TAXONOMY.shapes.slice(5)).id;
    out.composition = spec.composition || pick(r, [
      'off-centre', 'cropped-macro', 'diagonal', 'suspended-tensile', 'negative-space-dominant', 'monumental-close-up'
    ]);
    out.perspective = spec.perspective || pick(r, [
      'extreme-macro', 'dramatic-perspective', 'unusual-oblique', 'birds-eye-planar'
    ]);
    out.lighting = spec.lighting || pick(r, VARIATION_TAXONOMY.lightingStates).id;
  } else {
    // Medium (Default): Balanced variation
    out.shape = spec.shape || pick(r, VARIATION_TAXONOMY.shapes).id;
    out.composition = spec.composition || (spec.brief ? null : pick(r, VARIATION_TAXONOMY.compositions).id);
    out.perspective = spec.perspective || pick(r, VARIATION_TAXONOMY.perspectives).id;
    out.lighting = spec.lighting || pick(r, VARIATION_TAXONOMY.lightingStates).id;
  }

  out.scale = spec.scale || pick(r, identity.variation.scale);
  out.density = spec.density || pick(r, identity.variation.density);
  out.space = spec.space || pick(r, identity.variation.space);
  out.materialEmphasis = spec.materialEmphasis || pick(r, VARIATION_TAXONOMY.materialEmphases).id;

  return out;
}

/**
 * Re-roll ONLY the composition, perspective, and form silhouette of a spec
 * while strictly preserving its approved material, family, and lighting setup.
 */
export function regenerateCompositionSpec(baseSpec, seed = newSeed()) {
  const r = rng(seed);
  return {
    ...baseSpec,
    seed,
    shape: pick(r, VARIATION_TAXONOMY.shapes).id,
    composition: pick(r, VARIATION_TAXONOMY.compositions).id,
    perspective: pick(r, VARIATION_TAXONOMY.perspectives).id,
    space: pick(r, ['upper third', 'lower third', 'lower half']),
    brief: undefined // Clear explicit brief so new composition triggers
  };
}

/** Build the full layered prompt enforcing Master Art Direction and Controlled Variation. */
export function buildPrompt(identity, spec = {}) {
  const R = identity.promptRules;
  const parts = [R.base];

  // 1. Composition & Variation Directive
  const shapeDef = byId(VARIATION_TAXONOMY.shapes, spec.shape);
  const compDef = byId(VARIATION_TAXONOMY.compositions, spec.composition);
  const perspDef = byId(VARIATION_TAXONOMY.perspectives, spec.perspective);

  let compText = 'COMPOSITION & SCULPTURAL FORM: ';
  if (spec.brief) {
    compText += spec.brief;
  } else {
    compText += `One striking abstract formation featuring ${shapeDef ? shapeDef.prompt : 'organic fluid curves and minimal geometry'}. `;
    compText += `Framing: ${compDef ? compDef.prompt : 'sophisticated off-centre asymmetry with deliberate negative space'}. `;
    if (perspDef) compText += `Camera view: ${perspDef.prompt}. `;
  }
  parts.push(compText);

  // 2. Controlled Variation Directive
  const vLevel = spec.variationLevel || 'medium';
  if (vLevel === 'low') {
    parts.push('VARIATION PROTOCOL [LOW]: Strict loyalty to approved master reference geometry. Maintain tight canonical silhouette and controlled camera distance.');
  } else if (vLevel === 'high') {
    parts.push('VARIATION PROTOCOL [HIGH]: Adventurous topological exploration. Employ daring asymmetrical off-axis framing, dramatic negative space, and unexpected fluid permutations while strictly obeying Master Art Direction.');
  } else {
    parts.push('VARIATION PROTOCOL [MEDIUM]: Balanced creative variation. Deliver a distinct, unrepeated sculptural silhouette and dynamic camera angle while preserving identical material and lighting physics.');
  }

  // 3. Core Material & Material Emphasis
  let material = R.coreMaterial;
  if (spec.treatment) {
    const t = byId(identity.treatments, spec.treatment);
    if (t) material += ` ${t.prompt}.`;
  }
  const matEmphasis = byId(VARIATION_TAXONOMY.materialEmphases, spec.materialEmphasis);
  if (matEmphasis) {
    material += ` Surface finish: ${matEmphasis.prompt}.`;
  }
  parts.push(material);

  // 4. Lighting Setup
  let lightText = R.light;
  const lightDef = byId(VARIATION_TAXONOMY.lightingStates, spec.lighting);
  if (lightDef) {
    lightText += ` Setup: ${lightDef.prompt}.`;
  }
  parts.push(lightText);

  // 5. Colour Discipline (Strict rules against uncontrolled gradients)
  const acc = spec.accent && byId(identity.accents, spec.accent);
  const sec = spec.secondary && byId(identity.accents, spec.secondary);
  let colour = 'COLOUR DISCIPLINE: Silver, metallic grey, cool white and deep obsidian charcoal are dominant. ';
  if (acc) colour += `Primary iridescent reflection: ${acc.prompt}. `;
  if (sec && sec.id !== acc?.id) colour += `Secondary subtle refraction: ${sec.prompt}. `;
  colour += 'Colour must appear strictly as light refracted through the material, NEVER as painted neon or rainbow gradients.';
  parts.push(colour);

  // 6. Surface Quality + Variation Dials
  let surface = R.surfaceQuality;
  const dials = [spec.light, spec.scale, spec.density].filter(Boolean);
  if (dials.length) surface += ` Spatial scale: ${dials.join('; ')}.`;
  parts.push(surface);

  // 7. Art Direction & Negative Space Void
  parts.push(R.direction);
  parts.push(`${R.format}${spec.space ? ` Keep the ${spec.space} calm, dark and uncluttered as pure negative space for technical event typography.` : ''}`);

  if (Array.isArray(spec.references) && spec.references.length) {
    parts.push(`VISUAL REFERENCES: Condition material textures, fluid tension, and lighting behaviour on the selected reference image(s): ${spec.references.map((r) => r.split('/').pop()).join(', ')}.`);
  }

  if (spec.instructions && spec.instructions.trim()) {
    parts.push(`ADDITIONAL ART DIRECTION: ${spec.instructions.trim()}`);
  }

  // 8. Negative Exclusions
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
    variationLevel: art.variationLevel || 'medium'
  };
}

export const RUPTURE_ID = /^RUPTURE_(01_0[1-9]|M\d{2,3}|X\d{3,})$/;
