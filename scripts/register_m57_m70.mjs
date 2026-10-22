import fs from "fs";

const newItems = [
  {
    id: "RUPTURE_M57",
    grid: "R1C2",
    accent: "molten-red",
    secondary: "chrome",
    treatment: "sculptural-chrome",
    brief: "Monumental hyperbolic catenoid fluid hourglass with an ultra-thin Rayleigh-Plateau pinch neck and molten crimson throat (inspired by moodboard R1C2)",
    prompt: "A monumental hyperbolic catenoid fluid hourglass of molten platinum and liquid chrome stretching vertically between two dark fluid anchors in zero gravity. The waist tapers to an ultra-thin Rayleigh-Plateau fluid pinch neck on the verge of bifurcation, with molten crimson caustics glowing inside the narrow throat and razor-sharp chrome specular highlights along the flared bells. Pure pitch-black negative space void. Exclude: No spheres, no orbs, no floating balls, no pedestal, no plinth, no floor, no text, no typography, no painted neon. High resolution, 9:16 portrait composition.",
    isGenerated: true
  },
  {
    id: "RUPTURE_M58",
    grid: "R1C6",
    accent: "icy-blue",
    secondary: "molten-red",
    treatment: "folded-surfaces",
    brief: "Asymmetrical non-orientable fluid Möbius strip of mirror platinum with icy-blue edges and molten crimson core (inspired by moodboard R1C6)",
    prompt: "A single-sided non-orientable fluid Möbius strip of mirror liquid platinum twisting continuously through itself in zero gravity. Asymmetrical helical ribbon with knife-sharp fluid bevels catching icy-blue rim highlights on the outer curl, and a hidden interior fold glowing with subtle molten crimson caustics into pitch-black void. Pure pitch-black negative space void. Exclude: No spheres, no orbs, no floating balls, no pedestal, no plinth, no floor, no text, no typography, no painted neon. High resolution, 9:16 portrait composition.",
    isGenerated: true
  },
  {
    id: "RUPTURE_M59",
    grid: "R2C4",
    accent: "lavender",
    secondary: "pale-cyan",
    treatment: "sculptural-chrome",
    brief: "Concentric circular capillary standing wave ripples inside a liquid mercury impact crater (inspired by moodboard R2C4)",
    prompt: "A vertical perspective of a deep fluid impact crater in sculptural liquid mercury, with concentric circular capillary standing wave ripples radiating outward under zero gravity. Razor-thin liquid silver wave crests with ethereal lavender iridescence and pale-cyan specular glints along the concentric crest rings, receding into pitch-black negative space void. Exclude: No spheres, no orbs, no floating balls, no pedestal, no plinth, no floor, no text, no typography, no painted neon. High resolution, 9:16 portrait composition.",
    isGenerated: true
  },
  {
    id: "RUPTURE_M60",
    grid: "R2C6",
    accent: "ultraviolet",
    secondary: "molten-red",
    treatment: "sculptural-chrome",
    brief: "Monolithic chevron prism of chiseled liquid chrome and dark obsidian fluid with diagonal bifurcation shear (inspired by moodboard R2C6)",
    prompt: "A monolithic chevron prism of chiseled liquid chrome and crystalline dark obsidian fluid suspended at an angle in pitch-black void. Razor-sharp angular fluid facets catching ultraviolet rim reflections along the outer edges, with a deep diagonal bifurcation shear glowing with molten crimson caustics. Pure pitch-black negative space void. Exclude: No spheres, no orbs, no floating balls, no pedestal, no plinth, no floor, no text, no typography, no painted neon. High resolution, 9:16 portrait composition.",
    isGenerated: false
  },
  {
    id: "RUPTURE_M61",
    grid: "R3C1",
    accent: "pale-cyan",
    secondary: "molten-red",
    treatment: "sculptural-chrome",
    brief: "Intertwined fluid double-helix spiral with translucent connecting meniscus rungs and molten crimson core (inspired by moodboard R3C1)",
    prompt: "A monumental intertwined fluid double-helix spiral of mirror liquid platinum ascending vertically through pitch-black space. Delicate translucent liquid glass meniscus rungs connecting the two helical fluid strands, with razor-sharp pale-cyan specular highlights along the outer spiral blades and glowing molten crimson caustics trapped inside the connecting rungs. Pure pitch-black negative space void. Exclude: No spheres, no orbs, no floating balls, no pedestal, no plinth, no floor, no text, no typography, no painted neon. High resolution, 9:16 portrait composition.",
    isGenerated: false
  },
  {
    id: "RUPTURE_M62",
    grid: "R3C5",
    accent: "molten-red",
    secondary: "lavender",
    treatment: "folded-surfaces",
    brief: "Diaphanous undulating fluid acoustic Chladni plate with nodal vibration lines and standing wave crests (inspired by moodboard R3C5)",
    prompt: "A suspended geometric fluid membrane and undulating liquid platinum Chladni plate frozen in harmonic acoustic resonance in zero gravity. Concentric nodal vibration lines and standing wave crests catching lavender iridescence across the gossamer metallic film, with incandescent molten crimson fluid pooling in the stationary acoustic nodes against pitch-black void. Pure pitch-black negative space void. Exclude: No spheres, no orbs, no floating balls, no pedestal, no plinth, no floor, no text, no typography, no painted neon. High resolution, 9:16 portrait composition.",
    isGenerated: false
  },
  {
    id: "RUPTURE_M63",
    grid: "R4C3",
    accent: "chrome",
    secondary: "icy-blue",
    treatment: "sculptural-chrome",
    brief: "Tiered cascading laminar chrome canopy and fluid parasol sheets shedding weightless mercury runoff (inspired by moodboard R4C3)",
    prompt: "A tiered architectural canopy of curved laminar liquid chrome sheets and undulating fluid parasol surfaces cascading downwards in zero gravity. Paper-thin metallic fluid eaves catching cold icy-blue rim highlights, with microscopic droplets shedding weightless into pure pitch-black negative space void. Pure mirror silver reflections. Exclude: No spheres, no orbs, no floating balls, no pedestal, no plinth, no floor, no text, no typography, no painted neon. High resolution, 9:16 portrait composition.",
    isGenerated: false
  },
  {
    id: "RUPTURE_M64",
    grid: "R4C6",
    accent: "molten-red",
    secondary: "ultraviolet",
    treatment: "sculptural-chrome",
    brief: "Asymmetrical fluid vortex funnel and swirling liquid platinum sinkhole draining into infinite void (inspired by moodboard R4C6)",
    prompt: "A monumental asymmetrical fluid vortex funnel of heavy liquid platinum swirling downward into an abyssal gravitational throat in pitch-black void. Concentric spiral fluid striations catching ultraviolet rim sheen on the outer rim, with intense molten crimson caustics illuminating the subterranean vortex interior. Pure pitch-black negative space void. Exclude: No spheres, no orbs, no floating balls, no pedestal, no plinth, no floor, no text, no typography, no painted neon. High resolution, 9:16 portrait composition.",
    isGenerated: false
  },
  {
    id: "RUPTURE_M65",
    grid: "R5C1",
    accent: "icy-blue",
    secondary: "lavender",
    treatment: "sculptural-chrome",
    brief: "Segmented biomorphic exoskeleton ribcage arch of polished liquid chrome vertebrae in zero gravity (inspired by moodboard R5C1)",
    prompt: "An arched sculptural fluid cage of segmented biomorphic liquid chrome ribs and vertebrae curving gracefully in zero gravity. Interlocking metallic joints with translucent fluid webs catching icy-blue specular gleams and soft lavender iridescence along the outer skeletal spine into pitch-black void. Pure pitch-black negative space void. Exclude: No spheres, no orbs, no floating balls, no pedestal, no plinth, no floor, no text, no typography, no painted neon. High resolution, 9:16 portrait composition.",
    isGenerated: false
  },
  {
    id: "RUPTURE_M66",
    grid: "R5C4",
    accent: "molten-red",
    secondary: "chrome",
    treatment: "sculptural-chrome",
    brief: "Opposing horizontal tectonic fluid strike-slip fault planes with an incandescent rift cleavage (inspired by moodboard R5C4)",
    prompt: "Two opposing horizontal tectonic planes of heavy liquid obsidian chrome shearing past each other under extreme fluid tension in zero gravity. Razor-sharp sheared fluid terraces with mirror chrome reflections, separated by a deep horizontal fault rift glowing with incandescent molten crimson light into pitch-black void. Pure pitch-black negative space void. Exclude: No spheres, no orbs, no floating balls, no pedestal, no plinth, no floor, no text, no typography, no painted neon. High resolution, 9:16 portrait composition.",
    isGenerated: false
  },
  {
    id: "RUPTURE_M67",
    grid: "R5C7",
    accent: "lavender",
    secondary: "molten-red",
    treatment: "sculptural-chrome",
    brief: "Interlocking liquid mercury toroid rings and fluid chain links suspended without contact in zero gravity (inspired by moodboard R5C7)",
    prompt: "A chain of interlocking sculptural liquid mercury toroid rings and hollow fluid ellipses suspended in zero gravity without touching. Asymmetrical fluid wall thickness with ethereal lavender specular sheen along the curved perimeter, and warm molten crimson refraction glowing inside the interior aperture loops into pitch-black void. Pure pitch-black negative space void. Exclude: No spheres, no orbs, no floating balls, no pedestal, no plinth, no floor, no text, no typography, no painted neon. High resolution, 9:16 portrait composition.",
    isGenerated: false
  },
  {
    id: "RUPTURE_M68",
    grid: "R6C4",
    accent: "pale-cyan",
    secondary: "ultraviolet",
    treatment: "sculptural-chrome",
    brief: "Dendritic branching fractal tree of molten platinum capillary veins spreading vertically into pitch-black void (inspired by moodboard R6C4)",
    prompt: "A vertical dendritic fractal arbor of molten platinum fluid veins and branching liquid chrome capillaries spreading upwards through pitch-black void under high voltage capillary tension. Razor-thin bifurcating fluid tendrils with pale-cyan specular edge lines and deep ultraviolet glow nestled between the branch forks. Pure pitch-black negative space void. Exclude: No spheres, no orbs, no floating balls, no pedestal, no plinth, no floor, no text, no typography, no painted neon. High resolution, 9:16 portrait composition.",
    isGenerated: false
  },
  {
    id: "RUPTURE_M69",
    grid: "R7C3",
    accent: "molten-red",
    secondary: "icy-blue",
    treatment: "sculptural-chrome",
    brief: "Monumental curving parabolic fluid scythe and razor crescent blade slicing through deep vacuum (inspired by moodboard R7C3)",
    prompt: "A monumental razor-thin parabolic fluid scythe of polished liquid chrome sweeping dynamically across the vertical frame. Knife-sharp tapering fluid edge catching icy-blue specular gleams, with an internal molten crimson fluid vein flowing inside the thick spine of the metallic crescent into pitch-black void. Pure pitch-black negative space void. Exclude: No spheres, no orbs, no floating balls, no pedestal, no plinth, no floor, no text, no typography, no painted neon. High resolution, 9:16 portrait composition.",
    isGenerated: false
  },
  {
    id: "RUPTURE_M70",
    grid: "R7C6",
    accent: "ultraviolet",
    secondary: "pale-cyan",
    treatment: "sculptural-chrome",
    brief: "Polyhedral cat's cradle of taut liquid chrome filaments intersecting at luminous tension pinch nodes (inspired by moodboard R7C6)",
    prompt: "A geometric polyhedral cat's cradle of taut liquid chrome filaments and high-tension fluid platinum strings intersecting in three-dimensional space. Luminous fluid pinch nodes glowing with pale-cyan and ultraviolet caustics where the filaments cross, suspended in pure pitch-black negative space void. Exclude: No spheres, no orbs, no floating balls, no pedestal, no plinth, no floor, no text, no typography, no painted neon. High resolution, 9:16 portrait composition.",
    isGenerated: false
  }
];

// Update collection.json
const collPath = "data/collection.json";
const coll = JSON.parse(fs.readFileSync(collPath, "utf-8"));

for (const item of newItems) {
  if (!coll.artworks.some(a => a.id === item.id)) {
    coll.artworks.push({
      id: item.id,
      collection: "00",
      pillars: ["liquid-geometry"],
      accent: item.accent,
      secondary: item.secondary,
      treatment: item.treatment,
      brief: item.brief,
      space: "full bleed portrait"
    });
  }
}
fs.writeFileSync(collPath, JSON.stringify(coll, null, 2), "utf-8");
console.log("Updated collection.json! Total artworks:", coll.artworks.length);

// Update manifest.json
const manifestPath = "data/manifest.json";
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

for (const item of newItems) {
  if (item.isGenerated) {
    manifest.artworks[item.id] = {
      id: item.id,
      collection: "00",
      status: "draft",
      activeVersion: 1,
      approvedVersion: null,
      versions: [
        {
          v: 1,
          file: `artworks/masters/${item.id}_v1.jpg`,
          prompt: item.prompt,
          spec: {
            pillars: [{ id: "liquid-geometry", weight: 1 }],
            accent: item.accent,
            secondary: item.secondary,
            treatment: item.treatment,
            gridCoordinate: item.grid
          },
          source: "gemini-3.1-flash-image",
          note: item.brief,
          createdAt: new Date().toISOString()
        }
      ]
    };
  } else {
    manifest.artworks[item.id] = {
      id: item.id,
      collection: "00",
      status: "draft",
      activeVersion: null,
      approvedVersion: null,
      versions: [],
      plannedSpec: {
        gridCoordinate: item.grid,
        prompt: item.prompt,
        accent: item.accent,
        secondary: item.secondary,
        treatment: item.treatment,
        note: item.brief,
        createdAt: new Date().toISOString()
      }
    };
  }
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
console.log("Updated manifest.json! Total items:", Object.keys(manifest.artworks).length);
