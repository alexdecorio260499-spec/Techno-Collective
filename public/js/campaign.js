// RUPTURE Studio — Instagram Campaign View Module
// Implements:
// 1. Multi-Edition / Generation Selector (Edition 01: Hydraulic Void, Edition 02: Vitreous Resonance, Edition 03: Toroidal Flux, Edition 00: Omni-Spectrum Archive).
// 2. Artwork Families Library: Catalog of the 5 approved families with hero previews, characteristics, member galleries, and pairing compatibility.
// 3. Event Visual Direction: Curation specification, compatibility rationale, juxtaposed reference board, and custom direction builder.
// 4. Interactive 3-column Instagram profile feed & chronological timeline across ALL editions.
// 5. Reusable campaign templates (Artist Spotlight, Countdown System, Practical Guide).
// 6. Safe-area toggles, full-resolution inspection modal, caption copy tools, and direct download links.

export function createCampaignView(app) {
  let manifest = null;
  let familiesData = null;
  let groupsData = null;
  let activeEditionId = 'edition_01_hydraulic_void';
  const editionsCache = {};
  let viewMode = 'grid'; // 'grid' | 'timeline' | 'families' | 'direction' | 'templates' | 'logic'
  let aspectMode = 'sq'; // 'sq' (1:1 profile crop) | 'portrait' (4:5 full feed)
  let activePostId = null;
  let showCropGuide = false;
  let activeFamilyFilter = null;

  // Custom Direction Builder state
  let customPrimary = 'sculptural-chrome';
  let customSecondary = 'folded-surfaces';

  function esc(s = '') {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  async function loadManifest() {
    if (manifest) return manifest;
    try {
      const res = await fetch('/campaign/editions_manifest.json');
      if (!res.ok) throw new Error('Failed to load editions manifest');
      manifest = await res.json();
    } catch (err) {
      console.error(err);
      manifest = { activeEditionId: 'edition_01_hydraulic_void', editions: [] };
    }
    return manifest;
  }

  async function loadFamilies() {
    if (familiesData) return familiesData;
    try {
      const res = await fetch('/data/artwork_families.json');
      if (!res.ok) throw new Error('Failed to load artwork families');
      familiesData = await res.json();
    } catch (err) {
      console.error(err);
      familiesData = { families: [] };
    }
    return familiesData;
  }

  async function loadGroups() {
    try {
      const res = await fetch('/api/groups');
      if (!res.ok) throw new Error('Failed to load groups');
      const data = await res.json();
      groupsData = data.groups || [];
    } catch (err) {
      console.error(err);
      groupsData = [];
    }
    return groupsData;
  }

  function generate15PostsFromGroup(group) {
    const artIds = [...(group.artworkIds || [])];
    if (!artIds.length) return [];

    // Shuffle artIds randomly
    const shuffled = [...artIds].sort(() => Math.random() - 0.5);

    const phaseDefs = [
      {
        id: '01',
        title: 'THE FIRST SIGNAL',
        timing: 'Day 01 (Week -4)',
        phase: 'PHASE 1 — INTRODUCING THE COLLECTIVE',
        theme: 'Mysterious introduction, anomaly detection, curiosity',
        copy: (g) => `Signal 001.\n\nAn anomaly detected in the soundscape.\n\nNot everything needs to follow the predictable pattern. A new frequency is entering the Mauritian underground: ${g.name}.\n\nNo announcements yet. Just a shift in atmospheric pressure.\n\nSound is arriving.\n\n// RUPTURE COLLECTIVE\n// STYLE CHAPTER: ${g.name.toUpperCase()}\n// CURATED GROUP DEPLOYMENT\n\n#rupturecollective #undergroundtechno #mauritiustechno #hypnotictechno #liquidgeometry`
      },
      {
        id: '02',
        title: 'THE MANIFESTO',
        timing: 'Day 03 (Week -4)',
        phase: 'PHASE 1 — INTRODUCING THE COLLECTIVE',
        theme: 'Collective philosophy, breaking predictable conventions, freedom of expression',
        copy: (g) => `We do not repeat. We do not conform.\n\nOur manifesto:\n\n[01] BREAKING AWAY FROM THE PREDICTABLE.\nRejecting commercial club formulas, VIP divisions, and predictable playlists.\n\n[02] A SPACE FOR HYPNOTIC & DRIVING TECHNO.\nCurating fast, dark, groove-laden rhythms with acoustic integrity.\n\n[03] AN INCLUSIVE, LIBERATED COMMUNITY.\nA dancefloor built on safety, mutual respect, zero judgement, and complete bodily freedom.\n\n[04] NO BOUNDARIES. NO EXPECTATIONS.\nCome for the music. Leave your ego outside.\n\nThis is our foundation.\n\n// RUPTURE // ${g.name.toUpperCase()}\n\n#rupturemanifesto #undergroundculture #technocollective #mauritiuselectronic #noharassment #saferspace`
      },
      {
        id: '03',
        title: 'THE NAME / IDENTITY',
        timing: 'Day 06 (Week -4)',
        phase: 'PHASE 1 — INTRODUCING THE COLLECTIVE',
        theme: 'Brand identity, origin, underground techno philosophy',
        copy: (g) => `RUPTURE.\n\nTo break. To interrupt the expected.\n\nA collective dedicated to underground electronic music, uncompromising sound systems, and an open, liberated community.\n\nRooted in Mauritius. Connected to European underground culture.\n\nWe exist to create a space that did not exist before.\n\nArtwork style: ${g.name}.\n${g.description}\n\n#rupture #technoidentity #undergroundmusic #mauritiussound #collectiveculture`
      },
      {
        id: '04',
        title: 'SAVE THE DATE',
        timing: 'Day 08 (Week -3)',
        phase: 'PHASE 2 — EVENT ANNOUNCEMENT',
        theme: 'First official date and location announcement',
        copy: (g) => `SAVE THE DATE.\n\nRUPTURE PRESENTS: ${g.name.toUpperCase()} EDITION\n[Date TBC — 22:00 till Late]\n\nSecret Industrial Location — Mauritius.\nCoordinates released to ticket holders on the day.\n\nMark your calendar. Prepare your mind.\n\nCapacity strictly limited to preserve space, sound quality, and atmosphere.\n\nTicket pre-registration opens soon via link in bio.\n\n#savethedate #ruptureevent #undergroundparty #mauritiustechno #secretlocation #technomaus`
      },
      {
        id: '05',
        title: 'THE MAIN EVENT POSTER',
        timing: 'Day 10 (Week -3)',
        phase: 'PHASE 2 — EVENT ANNOUNCEMENT',
        theme: 'Primary promotional poster, full billing and event overview',
        copy: (g) => `RUPTURE — ${g.name.toUpperCase()}\n\n[Date] // 22:00 – 06:00 // Secret Industrial Location\n\nLINEUP:\n▪ [INTERNATIONAL GUEST] (Berlin / Live Modular Set)\n▪ [RESIDENT 01] (Fast Hypnotic Techno)\n▪ [RESIDENT 02] (Dark Groovy Techno)\n▪ [SPECIAL GUEST] (Sub-bass / Experimental Opening)\n\nSOUND:\nCustom 25 Hz Sub-Bass Array. Precision engineered for physical presence.\n\nTICKETS:\nPre-sale Tier 1 available now via link in bio.\nNo VIP. No tables. No guest list.\n\nArtwork Curated from Group: ${g.name}\n\n#rupture01 #mainposter #undergroundtechno #lineupannouncement #technorave #mauritiusnightlife`
      },
      {
        id: '06',
        title: 'THE LINEUP',
        timing: 'Day 13 (Week -3)',
        phase: 'PHASE 2 — EVENT ANNOUNCEMENT',
        theme: 'Full roster and musical narrative',
        copy: (g) => `The sound of the night.\n\nA continuous 8-hour progression designed to take the room somewhere unexpected.\n\n22:00 – 00:00 // [RESIDENT 02] — Atmospheric, textured, deep groove opening\n00:00 – 02:00 // [SPECIAL GUEST] — Hypnotic, rolling, tension-building techno\n02:00 – 04:30 // [HEADLINER] — Fast, driving, relentless peak-time modular set\n04:30 – 06:00 // [RESIDENT 01] — Dark, emotional, hypnotic closing journey\n\nEvery set serves the room, not individual ego.\n\nTickets in bio.\n\n#lineup #technodjs #modulartechno #undergroundmusic #curatedsound #rupturecollective`
      },
      {
        id: '07',
        title: 'SOUND SYSTEM (25 HZ)',
        timing: 'Day 16 (Week -2)',
        phase: 'PHASE 3 — CULTURE AND EXPERIENCE',
        theme: 'Audio fidelity, sub-bass physics, custom tuning',
        copy: (g) => `The sound is not background. It is the experience.\n\nWe have commissioned a custom acoustic rig specifically tuned for this space:\n\n▪ Subwoofers tuned to 25 Hz — bass you feel in your chest, not just your ears.\n▪ Point-source mid/high array for surgical clarity at high SPL.\n▪ Acoustic treatment to minimise slapback echo in the industrial space.\n▪ Sound engineered by producers who understand techno dynamics.\n\nEar protection available at the door.\n\nBring your hearing. We will take care of the rest.\n\n#soundsystem #25hz #acoustics #audiophiletechno #subbass #customrig #rupturesound`
      },
      {
        id: '08',
        title: 'THE SANCTUARY / CODE OF CONDUCT',
        timing: 'Day 18 (Week -2)',
        phase: 'PHASE 3 — CULTURE AND EXPERIENCE',
        theme: 'Safer space policy, inclusivity, zero harassment',
        copy: (g) => `The dancefloor is a sacred space.\n\nOur house rules are non-negotiable:\n\n[01] NO PHOTO / NO VIDEO POLICY ON THE DANCEFLOOR.\nPhone cameras will be taped at entry. Be present.\n\n[02] ZERO TOLERANCE FOR HARASSMENT.\nAny form of racism, sexism, homophobia, transphobia, or unwanted physical contact results in immediate removal.\n\n[03] LOOK AFTER ONE ANOTHER.\nIf you or someone around you needs assistance, alert our awareness team wearing cyan bands.\n\n[04] DRESS TO EXPRESS, NOT TO IMPRESS.\nCome as you are. All bodies, all identities welcome.\n\n#saferspace #dancefloorcode #nopolicies #awareness #respect #consent #technoculture`
      },
      {
        id: '09',
        title: 'ARTIST SPOTLIGHT',
        timing: 'Day 20 (Week -2)',
        phase: 'PHASE 3 — CULTURE AND EXPERIENCE',
        theme: 'Artist feature, sound profile, production preview',
        copy: (g) => `Spotlight: [HEADLINER / LIVE ACT]\n\nPerforming an exclusive live hardware set at RUPTURE.\n\nKnown for releases on seminal European underground labels and marathon sets across subterranean European clubs, their sound is characterised by:\n▪ Analog modular synthesizers running live sequences\n▪ Hypnotic, polyrhythmic percussion\n▪ Relentless 138-142 BPM forward drive\n▪ Atmospheric textures drawn from industrial soundscapes\n\nNo pre-recorded USBs. Pure real-time creation on the dancefloor.\n\nListen to their preview mix via link in bio.\n\n#artistspotlight #modulartechno #hardwarelive #analogsynth #berlintechno #rupturepresents`
      },
      {
        id: '10',
        title: 'VENUE / SPACE REVEAL',
        timing: 'Day 22 (Week -1)',
        phase: 'PHASE 3 — CULTURE AND EXPERIENCE',
        theme: 'Raw industrial architecture, secret setting tease',
        copy: (g) => `The space is as much a performer as the artists.\n\nWe spent four months scouting locations across the island before choosing this one.\n\nWhat to expect:\n▪ High-ceiling raw concrete structure\n▪ Minimal, non-distracting lighting (red & amber washes only)\n▪ Dedicated quiet / recovery area outside the main room\n▪ Proper ventilation and clean facilities\n▪ No flashing strobe overload — lighting follows the music, not the other way around\n\nCoordinates revealed 12 hours before doors.\n\n#venuereveal #industrialspace #brutalistarchitecture #secretlocation #mauritiusspaces #rupturevenue`
      },
      {
        id: '11',
        title: 'LOCATION COORDINATES',
        timing: 'Day 24 (Week -1)',
        phase: 'PHASE 4 — BUILDING ANTICIPATION',
        theme: 'Logistical mystery, GPS coordinate release mechanism',
        copy: (g) => `20°XX'XX.X"S // 57°XX'XX.X"E\n\nHow the location release works:\n\n[1] Check your registered ticket email on the morning of the event.\n[2] Exact GPS coordinates, parking instructions, and arrival advice will be delivered at 10:00 AM.\n[3] No tickets will be sold at the door. If you do not have a ticket, do not travel.\n[4] Designated shuttle service will run from central pickup points.\n\nThe location will surprise you.\n\n#secretcoordinates #locationreveal #gpscoordinates #technomystery #industrialmauritius #rupturelocation`
      },
      {
        id: '12',
        title: '7 DAYS COUNTDOWN',
        timing: 'Day 25 (T-minus 7 Days)',
        phase: 'PHASE 4 — BUILDING ANTICIPATION',
        theme: 'T-minus one week urgency and energy',
        copy: (g) => `SEVEN DAYS.\n\nOne week until the first frequency drop.\n\nThe system is in transit. The space is being prepared. The artists are en route.\n\nAre you ready?\n\nTier 2 tickets 78% claimed. Do not wait for the final tier.\n\nLink in bio.\n\n#7days #countdown #oneweek #technorave #mauritiusevents #ruptureanticipation`
      },
      {
        id: '13',
        title: 'LAST TICKETS ANNOUNCEMENT',
        timing: 'Day 28 (T-minus 3 Days)',
        phase: 'PHASE 4 — BUILDING ANTICIPATION',
        theme: 'Final ticket availability warning, strict capacity notice',
        copy: (g) => `FINAL 50 TICKETS.\n\nCapacity will not be extended. Once these are gone, the door is closed.\n\nWe chose our venue capacity deliberately. We will not oversell for profit at the expense of dancefloor space, air quality, or sound experience.\n\nIf you plan to be in the room, secure your entry now.\n\nlinktr.ee/rupture.mu\n\n#lasttickets #finaltier #soldoutwarning #strictlylimited #capacitruled #rupturecountdown`
      },
      {
        id: '14',
        title: 'PRACTICAL LOGISTICS',
        timing: 'Day 30 (T-minus 1 Day)',
        phase: 'PHASE 4 — BUILDING ANTICIPATION',
        theme: 'Essential checklist: timetable, transport, lockers, hydration',
        copy: (g) => `Everything you need to know for tomorrow night:\n\nDOORS: 22:00 (strictly no entry after 02:00)\nLOCATION: Check your ticket confirmation email for GPS drop\nPARKING: On-site parking available — carpooling encouraged\nBAR: Cashless only (cards, Juice, Blink accepted)\nWATER: Free filtered water stations all night — bring reusable bottles\nWARDROBE: Secure coat & bag check on site\nHEALTH: First aid & awareness team present at all times\n\nRest up tonight. You will need your energy.\n\n#practicallogistics #eventinfo #technoguide #eventchecklist #knowbeforeyougo #ruptureprep`
      },
      {
        id: '15',
        title: 'DAY OF EVENT SUMMONS',
        timing: 'Day 31 (Tonight)',
        phase: 'PHASE 4 — BUILDING ANTICIPATION',
        theme: 'Tonight is the night — final call to the community',
        copy: (g) => `TONIGHT.\n\nThe frequency is set. The space is waiting.\n\n22:00 // Secret Location // Mauritius\n\nLeave your expectations at the door. Bring your energy, your respect, and your openness.\n\nSee you in the dark.\n\n// RUPTURE COLLECTIVE\n// STYLE CHAPTER: ${g.name.toUpperCase()}\n\n#tonight #doorsopen #seeyouinthedark #technofamily #mauritiustechno #firstedition #rupture`
      }
    ];

    return phaseDefs.map((def, idx) => {
      const artId = shuffled[idx % shuffled.length];
      const artFileName = `${artId}_v1.jpg`;
      return {
        id: def.id,
        fileStem: artId,
        phase: def.phase,
        title: def.title,
        timing: def.timing,
        theme: def.theme,
        artwork: artFileName,
        artworkTitle: `${artId} (Curated from Group: ${group.name})`,
        family: group.name,
        familyId: group.id,
        familyRole: 'Curated Group Member',
        palette: `Obsidian Void + ${group.name} + Accents`,
        typography: 'Helvetica Neue Condensed Bold 68pt + SFNSMono 20pt',
        safeArea: 'Centered artwork composition with safe crop zone',
        caption: def.copy(group)
      };
    });
  }

  async function randomiseFromGroup(groupId) {
    const grps = await loadGroups();
    const group = grps.find(g => g.id === groupId);
    if (!group || !group.artworkIds || !group.artworkIds.length) {
      alert('This group has no artworks yet. Please assign artworks in the Gallery first.');
      return;
    }

    const dynamicId = `group_edition_${group.id}`;
    const posts = generate15PostsFromGroup(group);
    editionsCache[dynamicId] = posts;

    const man = await loadManifest();
    let edMeta = man.editions.find(e => e.id === dynamicId);
    if (!edMeta) {
      edMeta = {
        id: dynamicId,
        editionNumber: 'GRP',
        title: `GROUP: ${group.name.toUpperCase()}`,
        chapter: `CURATED STYLE GROUP // ${group.artworkIds.length} ARTWORKS`,
        tagline: group.description,
        conceptSummary: `Dynamic underground techno campaign randomised entirely from curated artwork group "${group.name}". All 15 posts are mapped across the 4-phase rollout using ${group.artworkIds.length} approved style-matched artworks.`,
        status: 'ready',
        isDynamicGroup: true,
        groupId: group.id,
        groupName: group.name,
        groupColor: group.color || '#7AE7FF',
        group: group,
        basePath: '',
        primaryFamily: { id: group.id, name: group.name },
        secondaryFamilies: [],
        inactiveFamilies: []
      };
      man.editions.unshift(edMeta);
    } else {
      edMeta.title = `GROUP: ${group.name.toUpperCase()}`;
      edMeta.tagline = group.description;
      edMeta.groupColor = group.color || '#7AE7FF';
      edMeta.group = group;
    }

    activeEditionId = dynamicId;
    viewMode = 'grid';
    location.hash = '#campaign';
    await render();
  }

  async function loadEditionData(editionId) {
    if (editionsCache[editionId]) return editionsCache[editionId];
    try {
      const res = await fetch(`/campaign/editions/${editionId}/edition_data.json`);
      if (!res.ok) throw new Error(`Failed to load data for edition ${editionId}`);
      editionsCache[editionId] = await res.json();
    } catch (err) {
      console.error(err);
      editionsCache[editionId] = [];
    }
    return editionsCache[editionId];
  }

  async function render() {
    const el = document.getElementById('view-campaign');
    if (!el) return;

    const [man, fams, grps] = await Promise.all([loadManifest(), loadFamilies(), loadGroups()]);
    const currentEditionMeta = man.editions.find(e => e.id === activeEditionId) || man.editions[0];
    const posts = await loadEditionData(activeEditionId);

    // Profile sequence: newest first (Post 15 down to Post 01)
    const profileSequence = [...posts].reverse();

    // Map family ID to family object for easy reference
    const familyMap = {};
    (fams.families || []).forEach(f => { familyMap[f.id] = f; });

    // Edition-specific profiles & highlights
    const editionAvatars = {
      'edition_01_hydraulic_void': '/artworks/masters/RUPTURE_M15_v1.jpg',
      'edition_02_vitreous_resonance': '/artworks/masters/RUPTURE_M35_v1.jpg',
      'edition_03_toroidal_flux': '/artworks/masters/RUPTURE_M08_v1.jpg',
      'edition_04_tectonic_shear': '/artworks/masters/RUPTURE_M34_v1.jpg',
      'edition_05_caustic_wave': '/artworks/masters/RUPTURE_M40_v1.jpg',
      'edition_06_orbital_annulus': '/artworks/masters/RUPTURE_M11_v1.jpg',
      'edition_07_chromatic_strata': '/artworks/masters/RUPTURE_M54_v1.jpg',
      'edition_08_ultraviolet_rift': '/artworks/masters/RUPTURE_M35_v1.jpg',
      'edition_09_cryogenic_void': '/artworks/masters/RUPTURE_M08_v1.jpg',
      'edition_10_spectrum_mutation': '/artworks/masters/RUPTURE_M68_v1.jpg',
      'edition_11_vertical_columns': '/artworks/masters/RUPTURE_M43_v1.jpg',
      'edition_12_acid_emerald': '/artworks/masters/RUPTURE_M80_v1.jpg',
      'edition_13_solar_copper': '/artworks/masters/RUPTURE_M119_v1.jpg',
      'edition_14_bipolar_duotone': '/artworks/masters/RUPTURE_M72_v1.jpg',
      'edition_15_inverted_monolith': '/artworks/masters/RUPTURE_M54_v1.jpg',
      'edition_16_vitreous_chrome': '/artworks/masters/RUPTURE_M06_v1.jpg',
      'edition_17_nacreous_strata': '/artworks/masters/RUPTURE_M35_v1.jpg',
      'edition_18_toroidal_fault': '/artworks/masters/RUPTURE_M08_v1.jpg',
      'edition_19_nacreous_annulus': '/artworks/masters/RUPTURE_M71_v1.jpg',
      'edition_20_tectonic_membrane': '/artworks/masters/RUPTURE_M21_v1.jpg',
      'edition_00_omni': '/artworks/masters/RUPTURE_M49_v1.jpg'
    };

    const editionHighlights = {
      'edition_01_hydraulic_void': [
        { title: 'SOUND', img: '/artworks/masters/RUPTURE_M54_v1.jpg' },
        { title: 'LINEUP', img: '/artworks/masters/RUPTURE_M28_v1.jpg' },
        { title: 'THE CODE', img: '/artworks/masters/RUPTURE_M80_v1.jpg' },
        { title: 'VENUE', img: '/artworks/masters/RUPTURE_M85_v1.jpg' },
        { title: 'TICKETS', img: '/artworks/masters/RUPTURE_M138_v1.jpg' }
      ],
      'edition_02_vitreous_resonance': [
        { title: 'SOUND', img: '/artworks/masters/RUPTURE_M71_v1.jpg' },
        { title: 'LINEUP', img: '/artworks/masters/RUPTURE_M24_v1.jpg' },
        { title: 'THE CODE', img: '/artworks/masters/RUPTURE_M39_v1.jpg' },
        { title: 'VENUE', img: '/artworks/masters/RUPTURE_M42_v1.jpg' },
        { title: 'TICKETS', img: '/artworks/masters/RUPTURE_M128_v1.jpg' }
      ],
      'edition_03_toroidal_flux': [
        { title: 'SOUND', img: '/artworks/masters/RUPTURE_M61_v1.jpg' },
        { title: 'LINEUP', img: '/artworks/masters/RUPTURE_M28_v1.jpg' },
        { title: 'THE CODE', img: '/artworks/masters/RUPTURE_M88_v1.jpg' },
        { title: 'VENUE', img: '/artworks/masters/RUPTURE_M52_v1.jpg' },
        { title: 'TICKETS', img: '/artworks/masters/RUPTURE_M98_v1.jpg' }
      ],
      'edition_04_tectonic_shear': [
        { title: 'SOUND', img: '/artworks/masters/RUPTURE_M34_v1.jpg' },
        { title: 'LINEUP', img: '/artworks/masters/RUPTURE_M60_v1.jpg' },
        { title: 'THE CODE', img: '/artworks/masters/RUPTURE_M80_v1.jpg' },
        { title: 'VENUE', img: '/artworks/masters/RUPTURE_M45_v1.jpg' },
        { title: 'TICKETS', img: '/artworks/masters/RUPTURE_M142_v1.jpg' }
      ],
      'edition_05_caustic_wave': [
        { title: 'SOUND', img: '/artworks/masters/RUPTURE_M40_v1.jpg' },
        { title: 'LINEUP', img: '/artworks/masters/RUPTURE_M94_v1.jpg' },
        { title: 'THE CODE', img: '/artworks/masters/RUPTURE_M06_v1.jpg' },
        { title: 'VENUE', img: '/artworks/masters/RUPTURE_M132_v1.jpg' },
        { title: 'TICKETS', img: '/artworks/masters/RUPTURE_M140_v1.jpg' }
      ],
      'edition_06_orbital_annulus': [
        { title: 'SOUND', img: '/artworks/masters/RUPTURE_M11_v1.jpg' },
        { title: 'LINEUP', img: '/artworks/masters/RUPTURE_M39_v1.jpg' },
        { title: 'THE CODE', img: '/artworks/masters/RUPTURE_M24_v1.jpg' },
        { title: 'VENUE', img: '/artworks/masters/RUPTURE_M84_v1.jpg' },
        { title: 'TICKETS', img: '/artworks/masters/RUPTURE_M87_v1.jpg' }
      ],
      'edition_07_chromatic_strata': [
        { title: 'SOUND', img: '/artworks/masters/RUPTURE_M54_v1.jpg' },
        { title: 'LINEUP', img: '/artworks/masters/RUPTURE_M43_v1.jpg' },
        { title: 'THE CODE', img: '/artworks/masters/RUPTURE_M23_v1.jpg' },
        { title: 'VENUE', img: '/artworks/masters/RUPTURE_M38_v1.jpg' },
        { title: 'TICKETS', img: '/artworks/masters/RUPTURE_M119_v1.jpg' }
      ],
      'edition_08_ultraviolet_rift': [
        { title: 'SOUND', img: '/artworks/masters/RUPTURE_M35_v1.jpg' },
        { title: 'LINEUP', img: '/artworks/masters/RUPTURE_M73_v1.jpg' },
        { title: 'THE CODE', img: '/artworks/masters/RUPTURE_M100_v1.jpg' },
        { title: 'VENUE', img: '/artworks/masters/RUPTURE_M108_v1.jpg' },
        { title: 'TICKETS', img: '/artworks/masters/RUPTURE_M127_v1.jpg' }
      ],
      'edition_09_cryogenic_void': [
        { title: 'SOUND', img: '/artworks/masters/RUPTURE_M08_v1.jpg' },
        { title: 'LINEUP', img: '/artworks/masters/RUPTURE_M17_v1.jpg' },
        { title: 'THE CODE', img: '/artworks/masters/RUPTURE_M28_v1.jpg' },
        { title: 'VENUE', img: '/artworks/masters/RUPTURE_M58_v1.jpg' },
        { title: 'TICKETS', img: '/artworks/masters/RUPTURE_M83_v1.jpg' }
      ],
      'edition_10_spectrum_mutation': [
        { title: 'SOUND', img: '/artworks/masters/RUPTURE_M68_v1.jpg' },
        { title: 'LINEUP', img: '/artworks/masters/RUPTURE_M43_v1.jpg' },
        { title: 'THE CODE', img: '/artworks/masters/RUPTURE_M80_v1.jpg' },
        { title: 'VENUE', img: '/artworks/masters/RUPTURE_M108_v1.jpg' },
        { title: 'TICKETS', img: '/artworks/masters/RUPTURE_M138_v1.jpg' }
      ],
      'edition_11_vertical_columns': [
        { title: 'SOUND', img: '/artworks/masters/RUPTURE_M43_v1.jpg' },
        { title: 'LINEUP', img: '/artworks/masters/RUPTURE_M35_v1.jpg' },
        { title: 'THE CODE', img: '/artworks/masters/RUPTURE_M15_v1.jpg' },
        { title: 'VENUE', img: '/artworks/masters/RUPTURE_M38_v1.jpg' },
        { title: 'TICKETS', img: '/artworks/masters/RUPTURE_M128_v1.jpg' }
      ],
      'edition_12_acid_emerald': [
        { title: 'SOUND', img: '/artworks/masters/RUPTURE_M80_v1.jpg' },
        { title: 'LINEUP', img: '/artworks/masters/RUPTURE_M68_v1.jpg' },
        { title: 'THE CODE', img: '/artworks/masters/RUPTURE_M119_v1.jpg' },
        { title: 'VENUE', img: '/artworks/masters/RUPTURE_M100_v1.jpg' },
        { title: 'TICKETS', img: '/artworks/masters/RUPTURE_M55_v1.jpg' }
      ],
      'edition_13_solar_copper': [
        { title: 'SOUND', img: '/artworks/masters/RUPTURE_M119_v1.jpg' },
        { title: 'LINEUP', img: '/artworks/masters/RUPTURE_M141_v1.jpg' },
        { title: 'THE CODE', img: '/artworks/masters/RUPTURE_M38_v1.jpg' },
        { title: 'VENUE', img: '/artworks/masters/RUPTURE_M100_v1.jpg' },
        { title: 'TICKETS', img: '/artworks/masters/RUPTURE_M138_v1.jpg' }
      ],
      'edition_14_bipolar_duotone': [
        { title: 'SOUND', img: '/artworks/masters/RUPTURE_M72_v1.jpg' },
        { title: 'LINEUP', img: '/artworks/masters/RUPTURE_M24_v1.jpg' },
        { title: 'THE CODE', img: '/artworks/masters/RUPTURE_M132_v1.jpg' },
        { title: 'VENUE', img: '/artworks/masters/RUPTURE_M80_v1.jpg' },
        { title: 'TICKETS', img: '/artworks/masters/RUPTURE_M98_v1.jpg' }
      ],
      'edition_15_inverted_monolith': [
        { title: 'SOUND', img: '/artworks/masters/RUPTURE_M54_v1.jpg' },
        { title: 'LINEUP', img: '/artworks/masters/RUPTURE_M15_v1.jpg' },
        { title: 'THE CODE', img: '/artworks/masters/RUPTURE_M119_v1.jpg' },
        { title: 'VENUE', img: '/artworks/masters/RUPTURE_M80_v1.jpg' },
        { title: 'TICKETS', img: '/artworks/masters/RUPTURE_M138_v1.jpg' }
      ],
      'edition_16_vitreous_chrome': [
        { title: 'SOUND', img: '/artworks/masters/RUPTURE_M06_v1.jpg' },
        { title: 'LINEUP', img: '/artworks/masters/RUPTURE_M15_v1.jpg' },
        { title: 'THE CODE', img: '/artworks/masters/RUPTURE_M103_v1.jpg' },
        { title: 'VENUE', img: '/artworks/masters/RUPTURE_M119_v1.jpg' },
        { title: 'TICKETS', img: '/artworks/masters/RUPTURE_M138_v1.jpg' }
      ],
      'edition_17_nacreous_strata': [
        { title: 'SOUND', img: '/artworks/masters/RUPTURE_M35_v1.jpg' },
        { title: 'LINEUP', img: '/artworks/masters/RUPTURE_M23_v1.jpg' },
        { title: 'THE CODE', img: '/artworks/masters/RUPTURE_M40_v1.jpg' },
        { title: 'VENUE', img: '/artworks/masters/RUPTURE_M119_v1.jpg' },
        { title: 'TICKETS', img: '/artworks/masters/RUPTURE_M138_v1.jpg' }
      ],
      'edition_18_toroidal_fault': [
        { title: 'SOUND', img: '/artworks/masters/RUPTURE_M08_v1.jpg' },
        { title: 'LINEUP', img: '/artworks/masters/RUPTURE_M61_v1.jpg' },
        { title: 'THE CODE', img: '/artworks/masters/RUPTURE_M141_v1.jpg' },
        { title: 'VENUE', img: '/artworks/masters/RUPTURE_M119_v1.jpg' },
        { title: 'TICKETS', img: '/artworks/masters/RUPTURE_M138_v1.jpg' }
      ],
      'edition_19_nacreous_annulus': [
        { title: 'SOUND', img: '/artworks/masters/RUPTURE_M71_v1.jpg' },
        { title: 'LINEUP', img: '/artworks/masters/RUPTURE_M24_v1.jpg' },
        { title: 'THE CODE', img: '/artworks/masters/RUPTURE_M12_v1.jpg' },
        { title: 'VENUE', img: '/artworks/masters/RUPTURE_M119_v1.jpg' },
        { title: 'TICKETS', img: '/artworks/masters/RUPTURE_M138_v1.jpg' }
      ],
      'edition_20_tectonic_membrane': [
        { title: 'SOUND', img: '/artworks/masters/RUPTURE_M21_v1.jpg' },
        { title: 'LINEUP', img: '/artworks/masters/RUPTURE_M38_v1.jpg' },
        { title: 'THE CODE', img: '/artworks/masters/RUPTURE_M106_v1.jpg' },
        { title: 'VENUE', img: '/artworks/masters/RUPTURE_M119_v1.jpg' },
        { title: 'TICKETS', img: '/artworks/masters/RUPTURE_M138_v1.jpg' }
      ],
      'edition_00_omni': [
        { title: 'SOUND', img: '/artworks/masters/RUPTURE_M49_v1.jpg' },
        { title: 'LINEUP', img: '/artworks/masters/RUPTURE_M28_v1.jpg' },
        { title: 'THE CODE', img: '/artworks/masters/RUPTURE_M80_v1.jpg' },
        { title: 'VENUE', img: '/artworks/masters/RUPTURE_M85_v1.jpg' },
        { title: 'TICKETS', img: '/artworks/masters/RUPTURE_M138_v1.jpg' }
      ]
    };

    const editionBios = {
      'edition_01_hydraulic_void': `Fast · Hypnotic · Driving · Dark Groove<br>
        Edition 01: Hydraulic Void — [Date / Secret Industrial Silo]<br>
        Sculptural Chrome + Folded Surfaces · Custom 25 Hz Rig`,
      'edition_02_vitreous_resonance': `Hypnotic · Ethereal · Optical Waves · Deep Groove<br>
        Edition 02: Vitreous Resonance — [Date / Secret Coastal Hangar]<br>
        Pearlescent Silver + Translucent Glass Membrane`,
      'edition_03_toroidal_flux': `Relentless · Orbital · Kinetic · Sub-Bass Intensity<br>
        Edition 03: Toroidal Flux — [Date / Secret Industrial Quarry]<br>
        Reflective Globes & Rings + Sculptural Chrome`,
      'edition_04_tectonic_shear': `Percussive · Brutalist · Obsidian Strata · High Velocity<br>
        Edition 04: Tectonic Shear — [Date / Secret Industrial Fault]<br>
        Folded Liquid Surfaces + Sculptural Chrome · Relentless Raw Pressure`,
      'edition_05_caustic_wave': `Diaphanous · Prismatic · Nacreous Drift · Sub-Bass Hypnosis<br>
        Edition 05: Caustic Wave — [Date / Secret Coastal Void]<br>
        Translucent Glass Membrane + Pearlescent Silver Fluid · Pure Optical Sound`,
      'edition_06_orbital_annulus': `Toroidal · Polyrhythmic · Liquid Mercury · Spatial Suspension<br>
        Edition 06: Orbital Annulus — [Date / Secret Offshore Platform]<br>
        Reflective Globes & Rings + Translucent Glass Membrane · Concentric Acceleration`,
      'edition_07_chromatic_strata': `Tiered Chromatic Strata · Multi-Spectral Energy<br>
        Edition 07: Chromatic Strata — [Date / Secret Industrial Quarry]<br>
        Horizontal Spectrum: Silver · Red · Cyan · Purple · Amber`,
      'edition_08_ultraviolet_rift': `Acid Violet · Deep Orchid · Electric Blacklight Void<br>
        Edition 08: Ultraviolet Rift — [Date / Secret Industrial Warehouse]<br>
        Translucent Glass + Pearlescent Silver · Laser Lavender Frequencies`,
      'edition_09_cryogenic_void': `Sub-Zero Cyan · Deep Cobalt · Arctic Ice Precision<br>
        Edition 09: Cryogenic Void — [Date / Secret Coastal Hangar]<br>
        Reflective Globes + Sculptural Chrome · Clinical 25 Hz Impact`,
      'edition_10_spectrum_mutation': `Randomized Multi-Chromatic Mutation & Duotones<br>
        Edition 10: Spectrum Mutation — [Date / Secret Industrial Site]<br>
        Toxic Emerald · Crimson · Cobalt · Ultraviolet · Gold`,
      'edition_11_vertical_columns': `3-Column Vertical Chromatic Architecture<br>
        Edition 11: Vertical Monolith — [Date / Secret Silo Shaft]<br>
        Left: Silver · Center: Molten Crimson · Right: Ultraviolet`,
      'edition_12_acid_emerald': `Bio-Luminescent Acid Green & Obsidian Void<br>
        Edition 12: Acid Emerald — [Date / Secret Industrial Plant]<br>
        Radioactive Emerald + High-Tension Fluid Chrome`,
      'edition_13_solar_copper': `Burnished Bronze, Molten Amber & Volcanic Heat<br>
        Edition 13: Solar Copper — [Date / Secret Smelting Facility]<br>
        Molten Amber + Burnished Copper · Sub-Bass Radiance`,
      'edition_14_bipolar_duotone': `Alternating Split-Tone Duotones<br>
        Edition 14: Bipolar Duotone — [Date / Secret Transmission Vault]<br>
        Violet/Cyan Duotone × Molten Crimson/Solar Amber Duotone`,
      'edition_15_inverted_monolith': `Inverted High-Contrast Platinum Mercury<br>
        Edition 15: Inverted Platinum — [Date / Secret Terminal Bunker]<br>
        Inverted Platinum + Obsidian Void · Stark Monolithic Impact`,
      'edition_16_vitreous_chrome': `Vitreous Membranes & Liquid Platinum Hydraulics<br>
        Edition 16: Prismatic Chrome — [Date / Secret Industrial Silo]<br>
        Translucent Glass Membrane + Sculptural Liquid Chrome`,
      'edition_17_nacreous_strata': `Topographic Faults & Nacreous Silk<br>
        Edition 17: Nacreous Strata — [Date / Secret Industrial Quarry]<br>
        Folded Liquid Surfaces + Pearlescent Silver Fluid`,
      'edition_18_toroidal_fault': `Kinetic Annuli & Sheared Tectonic Terraces<br>
        Edition 18: Toroidal Fault — [Date / Secret Terminal Fault]<br>
        Reflective Globes & Rings + Folded Liquid Surfaces`,
      'edition_19_nacreous_annulus': `Opaline Toroids & Soft-Luster Kinetic Loops<br>
        Edition 19: Nacreous Annulus — [Date / Secret Coastal Void]<br>
        Pearlescent Silver Fluid + Reflective Globes & Rings`,
      'edition_20_tectonic_membrane': `Planar Faults & Vitreous Dispersion<br>
        Edition 20: Tectonic Membrane — [Date / Secret Subterranean Plant]<br>
        Folded Liquid Surfaces + Translucent Glass Membrane`,
      'edition_00_omni': `Underground Electronic Music · Mauritius<br>
        Edition 00: Omni-Spectrum Prototype — Exploratory Generation<br>
        Multi-Family Survey (77 Approved Masters)`
    };

    const currentAvatar = currentEditionMeta.isDynamicGroup
      ? `/artworks/masters/${posts[4]?.artwork || posts[0]?.artwork || 'RUPTURE_M15_v1.jpg'}`
      : (editionAvatars[activeEditionId] || '/artworks/masters/RUPTURE_M15_v1.jpg');

    const currentHighlights = currentEditionMeta.isDynamicGroup ? [
      { title: 'STYLE', img: `/artworks/masters/${posts[0]?.artwork || 'RUPTURE_M15_v1.jpg'}` },
      { title: 'LINEUP', img: `/artworks/masters/${posts[5]?.artwork || 'RUPTURE_M28_v1.jpg'}` },
      { title: 'THE CODE', img: `/artworks/masters/${posts[7]?.artwork || 'RUPTURE_M80_v1.jpg'}` },
      { title: 'SOUND', img: `/artworks/masters/${posts[6]?.artwork || 'RUPTURE_M54_v1.jpg'}` },
      { title: 'TICKETS', img: `/artworks/masters/${posts[12]?.artwork || 'RUPTURE_M138_v1.jpg'}` }
    ] : (editionHighlights[activeEditionId] || editionHighlights['edition_01_hydraulic_void']);

    const currentBio = currentEditionMeta.isDynamicGroup
      ? `Underground Electronic Music · Mauritius<br>
        Curated Style Group: ${esc(currentEditionMeta.groupName || 'Custom Style')}<br>
        Randomized Campaign · ${esc(currentEditionMeta.tagline || '')}`
      : (editionBios[activeEditionId] || editionBios['edition_01_hydraulic_void']);

    el.innerHTML = `
      <div class="campaign-container">
        <!-- TOPBAR: EDITION & GENERATION SELECTOR -->
        <div class="edition-selector-bar">
          <div class="edition-selector-label">
            <span class="mono muted">CAMPAIGN GENERATION / EDITION:</span>
            <div class="edition-dropdown-wrap">
              <select id="select-edition" class="edition-select">
                ${man.editions.map(e => `
                  <option value="${e.id}" ${e.id === activeEditionId ? 'selected' : ''}>
                    ${e.isDynamicGroup ? '★ ' : e.status === 'active' ? '★ ' : e.status === 'ready' ? '✦ ' : '● '}
                    ${esc(e.title)} [${e.isDynamicGroup ? 'GROUP RANDOM' : e.status.toUpperCase()}]
                  </option>
                `).join('')}
              </select>
            </div>
          </div>

          <div class="edition-selector-label" style="margin-left:auto; display:flex; align-items:center; gap:8px;">
            <span class="mono muted">RANDOMISE FROM GROUP:</span>
            <select id="select-randomise-group" class="edition-select" style="min-width: 190px;">
              <option value="">— Select Artwork Group —</option>
              ${(groupsData || []).map(g => `<option value="${g.id}">✦ ${esc(g.name)} (${(g.artworkIds||[]).length})</option>`).join('')}
            </select>
            <button type="button" class="btn small primary" id="btn-trigger-group-randomise">⚡ Randomise Grid</button>
          </div>

          <div class="edition-pills-row">
            ${man.editions.map(e => {
              const isActive = e.id === activeEditionId;
              const statusClass = e.status;
              const badgeIcon = e.isDynamicGroup ? '⚡' : e.status === 'active' ? '★' : e.status === 'ready' ? '✦' : '●';
              return `
                <button type="button" class="btn small edition-pill-btn ${isActive ? 'active' : ''} ${statusClass}" data-edition-id="${e.id}">
                  <span class="status-dot">${badgeIcon}</span>
                  <span>${esc(e.title.split(':')[0].trim())}</span>
                  <span class="mono muted text-xs">${esc(e.isDynamicGroup ? 'GROUP' : e.editionNumber === '00' ? 'ARCHIVE' : e.editionNumber === '01' ? 'ACTIVE' : 'FEED READY')}</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        ${currentEditionMeta.isDynamicGroup ? `
          <div class="campaign-dynamic-group-banner">
            <div class="campaign-dynamic-title">
              <span class="group-color-dot" style="background:${currentEditionMeta.groupColor || '#7AE7FF'}; width:14px; height:14px;"></span>
              <div>
                <strong>CAMPAIGN RANDOMIZED FROM: ${esc(currentEditionMeta.groupName || 'GROUP')}</strong>
                <div class="mono muted text-xs">${posts.length} posts generated from ${currentEditionMeta.group?.artworkIds?.length || 0} style-matched group artworks</div>
              </div>
            </div>
            <div class="campaign-dynamic-controls">
              <button type="button" class="btn primary" id="btn-rerandomise-group">⚡ Re-Randomise Grid</button>
              <a href="#gallery" class="btn">Back to Gallery</a>
            </div>
          </div>
        ` : ''}

        <!-- CAMPAIGN HERO & METADATA -->
        <div class="campaign-header">
          <div class="campaign-header-title">
            <div class="edition-meta-badge-row">
              <span class="badge ${currentEditionMeta.status === 'active' ? 'api' : 'queue'} mono">
                ${currentEditionMeta.status === 'active' ? 'ACTIVE VISUAL DIRECTION' : currentEditionMeta.status.toUpperCase()}
              </span>
              <span class="mono muted">${esc(currentEditionMeta.chapter)}</span>
            </div>
            <h2>${esc(currentEditionMeta.title)}</h2>
            <p class="campaign-tagline">${esc(currentEditionMeta.conceptSummary)}</p>

            <!-- Family pairing banner -->
            ${currentEditionMeta.primaryFamily ? `
              <div class="active-families-banner">
                <span class="mono muted">ACTIVE FAMILIES:</span>
                <span class="family-tag primary" title="Primary Family">
                  <span class="role-badge">PRIMARY</span> ${esc(currentEditionMeta.primaryFamily.name)}
                </span>
                ${(currentEditionMeta.secondaryFamilies || []).map(sf => `
                  <span class="family-tag secondary" title="Secondary Compatible Family">
                    <span class="role-badge">SECONDARY</span> ${esc(sf.name)}
                  </span>
                `).join('')}
                ${(currentEditionMeta.inactiveFamilies && currentEditionMeta.inactiveFamilies.length > 0) ? `
                  <span class="family-tag inactive" title="Strictly prohibited for this edition">
                    <span class="role-badge">INACTIVE</span> ${currentEditionMeta.inactiveFamilies.length} Families Excluded
                  </span>
                ` : ''}
              </div>
            ` : ''}
          </div>

          <div class="campaign-controls">
            <div class="control-group">
              <span class="mono muted">VIEW:</span>
              <div class="pill-buttons" role="tablist">
                <button type="button" class="btn small ${viewMode === 'grid' ? 'active' : ''}" data-view="grid">01 Profile Feed (3-Col)</button>
                <button type="button" class="btn small ${viewMode === 'timeline' ? 'active' : ''}" data-view="timeline">02 Chronological Flow</button>
                <button type="button" class="btn small ${viewMode === 'families' ? 'active' : ''}" data-view="families">03 Artwork Families (5)</button>
                <button type="button" class="btn small ${viewMode === 'direction' ? 'active' : ''}" data-view="direction">04 Visual Direction</button>
                <button type="button" class="btn small ${viewMode === 'templates' ? 'active' : ''}" data-view="templates">05 Reusable Templates</button>
                <button type="button" class="btn small ${viewMode === 'logic' ? 'active' : ''}" data-view="logic">06 Design Logic</button>
              </div>
            </div>
            ${viewMode === 'grid' || viewMode === 'timeline' ? `
            <div class="control-group">
              <span class="mono muted">FRAME:</span>
              <div class="pill-buttons">
                <button type="button" class="btn small ${aspectMode === 'sq' ? 'active' : ''}" data-aspect="sq">1:1 Profile Crop</button>
                <button type="button" class="btn small ${aspectMode === 'portrait' ? 'active' : ''}" data-aspect="portrait">4:5 Full Feed</button>
              </div>
            </div>` : ''}
          </div>
        </div>

        <!-- ========================================== -->
        <!-- VIEW 1: INSTAGRAM PROFILE GRID (3-COL)     -->
        <!-- ========================================== -->
        ${viewMode === 'grid' ? `
          <div class="ig-profile-wrapper">
            <!-- Simulated Instagram Profile Header -->
            <div class="ig-profile-header">
              <div class="ig-avatar-wrap">
                <div class="ig-avatar-ring">
                  <img src="${currentAvatar}" alt="RUPTURE profile" class="ig-avatar-img">
                </div>
              </div>
              <div class="ig-profile-info">
                <div class="ig-username-row">
                  <h1 class="ig-username">rupture.mu</h1>
                  <span class="ig-badge" title="Underground Collective">UNDERGROUND</span>
                  <div class="ig-actions">
                    <button type="button" class="btn small primary ig-follow-btn">Follow</button>
                    <button type="button" class="btn small ig-msg-btn">Message</button>
                  </div>
                </div>
                <div class="ig-stats-row">
                  <span><strong>15</strong> posts</span>
                  <span><strong>4,850</strong> followers</span>
                  <span><strong>42</strong> following</span>
                </div>
                <div class="ig-bio">
                  <div class="ig-bio-name">RUPTURE</div>
                  <div class="ig-bio-category mono muted">Underground Techno Collective · Mauritius</div>
                  <div class="ig-bio-desc">
                    ${currentBio}
                  </div>
                  <a href="#campaign" class="ig-bio-link">linktr.ee/rupture.mu</a>
                </div>
              </div>
            </div>

            <!-- Story Highlights -->
            <div class="ig-highlights">
              ${currentHighlights.map(h => `
                <div class="highlight-item">
                  <div class="highlight-ring"><img src="${h.img}" alt="${h.title}"></div>
                  <span class="mono">${h.title}</span>
                </div>
              `).join('')}
            </div>

            <!-- Feed Tabs -->
            <div class="ig-feed-tabs">
              <div class="ig-feed-tab active">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h7v7H3zm11 0h7v7h-7zm-11 11h7v7H3zm11 0h7v7h-7z"/></svg>
                <span class="mono">POSTS (${posts.length})</span>
              </div>
            </div>

            <!-- 3-Column Profile Grid (5 rows x 3 cols) -->
            <div class="ig-grid ${aspectMode === 'portrait' ? 'aspect-portrait' : 'aspect-square'}">
              ${profileSequence.map((p) => {
                const basePath = currentEditionMeta.basePath;
                const imgSrc = currentEditionMeta.isDynamicGroup
                  ? `/artworks/masters/${p.artwork}`
                  : (aspectMode === 'sq' ? `${basePath}/posts/${p.fileStem}_sq.jpg` : `${basePath}/posts/${p.fileStem}.jpg`);
                const isCenterHero = p.id === '05';
                const hasRedCaustic = p.id === '05' || p.id === '13';
                const familyName = p.family || (p.familyId ? familyMap[p.familyId]?.name : 'Core Artwork');
                return `
                  <div class="ig-grid-item ${hasRedCaustic ? 'has-red-accent' : ''} ${isCenterHero ? 'center-hero' : ''}" data-post-id="${p.id}" tabindex="0">
                    <img src="${imgSrc}" alt="${esc(p.title)}" loading="lazy">
                    <div class="ig-grid-overlay">
                      <div class="ig-overlay-header">
                        <span class="mono ig-post-badge">POST ${p.id}</span>
                        ${p.familyRole ? `<span class="mono ig-family-badge ${p.familyRole.toLowerCase().includes('primary') ? 'primary-badge' : 'secondary-badge'}">${esc(familyName)}</span>` : ''}
                        ${hasRedCaustic ? `<span class="mono ig-red-dot" title="Molten Crimson Restrained Accent">● RED</span>` : ''}
                      </div>
                      <div class="ig-overlay-title">${esc(p.title)}</div>
                      <div class="ig-overlay-meta mono muted">${esc(p.phase.split('—')[0].trim())}</div>
                      <div class="ig-overlay-stats">
                        <span>❤️ ${240 + parseInt(p.id, 10) * 37}</span>
                        <span>💬 ${18 + parseInt(p.id, 10) * 4}</span>
                      </div>
                      <button type="button" class="btn small primary ig-inspect-btn">Inspect Post</button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        <!-- ========================================== -->
        <!-- VIEW 2: CHRONOLOGICAL CAMPAIGN FLOW       -->
        <!-- ========================================== -->
        ${viewMode === 'timeline' ? `
          <div class="timeline-wrapper">
            ${['PHASE 1 — INTRODUCING THE COLLECTIVE', 'PHASE 2 — EVENT ANNOUNCEMENT', 'PHASE 3 — CULTURE AND EXPERIENCE', 'PHASE 4 — BUILDING ANTICIPATION'].map((phaseName) => {
              const phasePosts = posts.filter(p => p.phase === phaseName);
              return `
                <div class="timeline-phase-block">
                  <div class="phase-header">
                    <span class="mono phase-num">${phaseName.split('—')[0].trim()}</span>
                    <h3 class="phase-title">${esc(phaseName.split('—')[1].trim())}</h3>
                    <span class="phase-count mono muted">${phasePosts.length} POSTS</span>
                  </div>
                  <div class="timeline-posts-row ${aspectMode === 'portrait' ? 'aspect-portrait' : 'aspect-square'}">
                    ${phasePosts.map(p => {
                      const basePath = currentEditionMeta.basePath;
                      const imgSrc = currentEditionMeta.isDynamicGroup
                        ? `/artworks/masters/${p.artwork}`
                        : (aspectMode === 'sq' ? `${basePath}/posts/${p.fileStem}_sq.jpg` : `${basePath}/posts/${p.fileStem}.jpg`);
                      const familyName = p.family || (p.familyId ? familyMap[p.familyId]?.name : 'Core Artwork');
                      return `
                        <div class="timeline-post-card" data-post-id="${p.id}">
                          <div class="timeline-card-image">
                            <img src="${imgSrc}" alt="${esc(p.title)}" loading="lazy">
                            <span class="mono card-tag">POST ${p.id}</span>
                            ${p.familyRole ? `<span class="mono card-family-tag ${p.familyRole.toLowerCase().includes('primary') ? 'primary' : 'secondary'}">${esc(familyName)}</span>` : ''}
                          </div>
                          <div class="timeline-card-info">
                            <div class="mono card-timing muted">${esc(p.timing)}</div>
                            <h4 class="card-title">${esc(p.title)}</h4>
                            <p class="card-theme">${esc(p.theme)}</p>
                            <div class="card-art-link mono">
                              <span class="muted">Ref:</span> <a href="/artworks/masters/${p.artwork}" target="_blank">${esc(p.artwork.replace('_v1.jpg', ''))}</a>
                            </div>
                            <button type="button" class="btn small card-inspect-btn">Inspect & Copy Caption</button>
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : ''}

        <!-- ========================================== -->
        <!-- VIEW 3: ARTWORK FAMILIES LIBRARY (5)       -->
        <!-- ========================================== -->
        ${viewMode === 'families' ? `
          <div class="families-library-wrapper">
            <div class="library-intro">
              <div class="mono muted">ONE ARTISTIC UNIVERSE // FIVE DISTINCT CHAPTERS</div>
              <h3>THE APPROVED ARTWORK FAMILIES</h3>
              <p>While all 77 approved master artworks share the same core artistic DNA, they naturally partition into 5 distinct textural and morphological families. Each event campaign selects a harmonious combination of primary and compatible secondary families rather than mixing all styles indiscriminately.</p>
            </div>

            <div class="families-cards-list">
              ${fams.families.map((fam, fIndex) => {
                const isPrimaryInActive = currentEditionMeta.primaryFamily?.id === fam.id;
                const isSecondaryInActive = (currentEditionMeta.secondaryFamilies || []).some(sf => sf.id === fam.id);
                const isInactiveInActive = (currentEditionMeta.inactiveFamilies || []).includes(fam.id);

                return `
                  <div class="family-card ${isPrimaryInActive ? 'is-primary' : isSecondaryInActive ? 'is-secondary' : 'is-inactive'}" id="family-${fam.id}">
                    <div class="family-card-sidebar">
                      <div class="family-hero-img-wrap">
                        <img src="/artworks/masters/${fam.heroArtwork}" alt="${esc(fam.name)}" class="family-hero-img">
                        <span class="mono family-hero-badge">HERO: ${esc(fam.heroArtwork.replace('_v1.jpg', ''))}</span>
                      </div>
                      <div class="family-edition-status">
                        ${isPrimaryInActive ? `<span class="badge primary mono">PRIMARY (${esc(currentEditionMeta.title.split(':')[0])})</span>` :
                          isSecondaryInActive ? `<span class="badge secondary mono">SECONDARY (${esc(currentEditionMeta.title.split(':')[0])})</span>` :
                          `<span class="badge muted mono">INACTIVE IN CURRENT CAMPAIGN</span>`}
                      </div>
                    </div>

                    <div class="family-card-main">
                      <div class="family-header-row">
                        <div class="family-index mono">FAMILY 0${fIndex + 1}</div>
                        <h4 class="family-title">${esc(fam.name)}</h4>
                        <div class="family-tagline mono muted">${esc(fam.tagline)}</div>
                      </div>

                      <p class="family-description">${esc(fam.description)}</p>

                      <div class="family-characteristics-block">
                        <span class="mono bold text-xs">VISUAL CHARACTERISTICS & SURFACE BEHAVIOR:</span>
                        <ul class="characteristics-list">
                          ${fam.characteristics.map(c => `<li>${esc(c)}</li>`).join('')}
                        </ul>
                      </div>

                      <div class="family-compat-row">
                        <span class="mono muted text-xs">COMPATIBLE PAIRINGS:</span>
                        <div class="compat-tags">
                          ${fam.compatibleFamilies.map(cfId => {
                            const pairedFam = familyMap[cfId];
                            return `<span class="compat-pill mono">${esc(pairedFam?.name || cfId)}</span>`;
                          }).join('')}
                        </div>
                      </div>

                      <!-- Member Artworks Gallery -->
                      <div class="family-members-block">
                        <div class="members-header">
                          <span class="mono bold text-xs">AVAILABLE APPROVED MASTER ARTWORKS (${fam.artworks.length}):</span>
                        </div>
                        <div class="members-grid">
                          ${fam.artworks.map(art => `
                            <div class="member-thumb-item" title="${esc(art.id)}: ${esc(art.title)}">
                              <img src="/artworks/masters/${art.file}" alt="${esc(art.id)}" loading="lazy">
                              <span class="mono member-id">${esc(art.id.replace('RUPTURE_', ''))}</span>
                            </div>
                          `).join('')}
                        </div>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        <!-- ========================================== -->
        <!-- VIEW 4: VISUAL DIRECTION SPECIFICATION     -->
        <!-- ========================================== -->
        ${viewMode === 'direction' ? `
          <div class="direction-wrapper">
            <div class="direction-header">
              <div class="mono muted">EVENT VISUAL DIRECTION SPECIFICATION</div>
              <h3>${esc(currentEditionMeta.title)}</h3>
              <p>${esc(currentEditionMeta.conceptSummary)}</p>
            </div>

            <!-- Direction Pairing Matrix -->
            <div class="direction-matrix-grid">
              ${currentEditionMeta.primaryFamily ? `
                <div class="direction-matrix-card active-card">
                  <div class="matrix-card-tag mono primary">PRIMARY FAMILY</div>
                  <h4>${esc(currentEditionMeta.primaryFamily.name)}</h4>
                  <p>${esc(familyMap[currentEditionMeta.primaryFamily.id]?.description || '')}</p>
                  <div class="matrix-thumbs-row">
                    <img src="/artworks/masters/${familyMap[currentEditionMeta.primaryFamily.id]?.heroArtwork}" alt="Hero">
                  </div>
                </div>
              ` : ''}

              ${(currentEditionMeta.secondaryFamilies && currentEditionMeta.secondaryFamilies.length > 0) ? `
                <div class="direction-matrix-card active-card">
                  <div class="matrix-card-tag mono secondary">SECONDARY COMPATIBLE FAMILY</div>
                  <h4>${esc(currentEditionMeta.secondaryFamilies[0].name)}</h4>
                  <p>${esc(familyMap[currentEditionMeta.secondaryFamilies[0].id]?.description || '')}</p>
                  <div class="matrix-thumbs-row">
                    <img src="/artworks/masters/${familyMap[currentEditionMeta.secondaryFamilies[0].id]?.heroArtwork}" alt="Hero">
                  </div>
                </div>
              ` : ''}

              <div class="direction-matrix-card inactive-card">
                <div class="matrix-card-tag mono muted">INACTIVE / EXCLUDED FAMILIES</div>
                <h4>Zero Permitted Occurrences</h4>
                <p class="muted">To ensure absolute aesthetic cohesion, inactive families are strictly excluded from this campaign chapter.</p>
                <div class="excluded-list">
                  ${(currentEditionMeta.inactiveFamilies || []).map(infId => `
                    <div class="excluded-item">
                      <strong>${esc(familyMap[infId]?.name || infId)}:</strong> Strictly prohibited for this edition.
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Compatibility Rationale Deep Dive -->
            <div class="rationale-box">
              <div class="mono muted">COHESION RATIONALE</div>
              <h4>Why This Chapter Maintains Strict Brand Cohesion</h4>
              <div class="rationale-points">
                <div class="rationale-point">
                  <div class="mono point-num">01</div>
                  <strong>Consistent Brand Identity:</strong> Typography (Archivo, Helvetica Neue, JetBrains Mono), the RUPTURE logotype, grid registration marks, and technical metadata remain 100% constant across every edition.
                </div>
                <div class="rationale-point">
                  <div class="mono point-num">02</div>
                  <strong>Material Nuance per Event:</strong> Each edition introduces its own tactile atmosphere — heavy chrome and tectonic plates for Edition 01, nacreous silk and optical glass for Edition 02, and orbital kinetic rings for Edition 03.
                </div>
                <div class="rationale-point">
                  <div class="mono point-num">03</div>
                  <strong>Restrained Accent Discipline:</strong> Across all editions, Molten Crimson (#FF3344) is strictly isolated to the Main Event Poster and the Last Tickets announcement.
                </div>
              </div>
            </div>

            <!-- Interactive Custom Direction Builder -->
            <div class="builder-box">
              <div class="builder-header">
                <div class="mono muted">INTERACTIVE CAMPAIGN EXPERIMENTATION</div>
                <h4>Visual Direction Pairing Simulator</h4>
                <p class="muted">Test alternative family combinations for future event editions. Observe pairing compatibility, shared tonal range, and prohibited styles.</p>
              </div>

              <div class="builder-form-row">
                <div class="builder-field">
                  <label class="mono muted text-xs">SELECT PRIMARY FAMILY:</label>
                  <select id="builder-primary" class="builder-select">
                    ${fams.families.map(f => `
                      <option value="${f.id}" ${f.id === customPrimary ? 'selected' : ''}>${esc(f.name)}</option>
                    `).join('')}
                  </select>
                </div>

                <div class="builder-operator">⟷</div>

                <div class="builder-field">
                  <label class="mono muted text-xs">SELECT SECONDARY FAMILY:</label>
                  <select id="builder-secondary" class="builder-select">
                    ${fams.families.map(f => `
                      <option value="${f.id}" ${f.id === customSecondary ? 'selected' : ''}>${esc(f.name)}</option>
                    `).join('')}
                  </select>
                </div>
              </div>

              <div class="builder-preview-result" id="builder-result">
                <!-- Rendered dynamically -->
              </div>
            </div>
          </div>
        ` : ''}

        <!-- ========================================== -->
        <!-- VIEW 5: REUSABLE TEMPLATES SHOWCASE       -->
        <!-- ========================================== -->
        ${viewMode === 'templates' ? `
          <div class="templates-showcase">
            <div class="template-section">
              <div class="template-header">
                <span class="mono muted">DELIVERABLE 04</span>
                <h3>01 / Reusable Artist Announcement Template</h3>
                <p>Designed for individual artist announcements across subsequent events, residency announcements, and podcast mixes. Features structured artist typography, audio genre specifications, live format slots, and modular background caustics derived from approved fluid ribbons.</p>
              </div>
              <div class="template-grid">
                <div class="template-card">
                  <img src="/campaign/templates/ARTIST_SPOTLIGHT_ACT_02.jpg" alt="Act 02">
                  <div class="template-meta">
                    <div class="mono bold">[ARTIST 02] — HYPNOTIC & DRIVING</div>
                    <div class="mono muted">Format: Vinyl Set // Slot: 02:30 — 04:30</div>
                    <a href="/campaign/templates/ARTIST_SPOTLIGHT_ACT_02.png" download class="btn small">Download PNG</a>
                  </div>
                </div>
                <div class="template-card">
                  <img src="/campaign/templates/ARTIST_SPOTLIGHT_ACT_03.jpg" alt="Act 03">
                  <div class="template-meta">
                    <div class="mono bold">[ARTIST 03] — RAW INDUSTRIAL GROOVE</div>
                    <div class="mono muted">Format: 144 BPM // Slot: 04:30 — 06:00</div>
                    <a href="/campaign/templates/ARTIST_SPOTLIGHT_ACT_03.png" download class="btn small">Download PNG</a>
                  </div>
                </div>
                <div class="template-card">
                  <img src="/campaign/templates/ARTIST_SPOTLIGHT_ACT_04.jpg" alt="Act 04">
                  <div class="template-meta">
                    <div class="mono bold">[ARTIST 04] — CLOSING RITUAL</div>
                    <div class="mono muted">Format: Kinetic Sub-Bass // Sunrise Set</div>
                    <a href="/campaign/templates/ARTIST_SPOTLIGHT_ACT_04.png" download class="btn small">Download PNG</a>
                  </div>
                </div>
              </div>
            </div>

            <div class="template-section">
              <div class="template-header">
                <span class="mono muted">DELIVERABLE 05</span>
                <h3>02 / Reusable Countdown Visual System</h3>
                <p>A high-velocity countdown visual framework. The giant condensed numerals can be dynamically updated (7 Days, 5 Days, 3 Days, 24 Hours) while preserving kinetic tension.</p>
              </div>
              <div class="template-grid">
                <div class="template-card">
                  <img src="${currentEditionMeta.basePath}/posts/RUPTURE_IG_POST_12.jpg" alt="7 Days">
                  <div class="template-meta">
                    <div class="mono bold">7 DAYS COUNTDOWN (POST 12)</div>
                    <div class="mono muted">T-Minus 1 Week Anticipation Phase</div>
                    <a href="${currentEditionMeta.basePath}/posts/RUPTURE_IG_POST_12.png" download class="btn small">Download PNG</a>
                  </div>
                </div>
                <div class="template-card">
                  <img src="/campaign/templates/COUNTDOWN_3_DAYS.jpg" alt="3 Days">
                  <div class="template-meta">
                    <div class="mono bold">3 DAYS COUNTDOWN VARIANT</div>
                    <div class="mono muted">Mid-Week Urgency Pulse</div>
                    <a href="/campaign/templates/COUNTDOWN_3_DAYS.png" download class="btn small">Download PNG</a>
                  </div>
                </div>
                <div class="template-card">
                  <img src="/campaign/templates/COUNTDOWN_1_DAY.jpg" alt="1 Day">
                  <div class="template-meta">
                    <div class="mono bold">1 DAY COUNTDOWN VARIANT</div>
                    <div class="mono muted">Eve of Event Call to Arms</div>
                    <a href="/campaign/templates/COUNTDOWN_1_DAY.png" download class="btn small">Download PNG</a>
                  </div>
                </div>
              </div>
            </div>

            <div class="template-section">
              <div class="template-header">
                <span class="mono muted">DELIVERABLE 06</span>
                <h3>03 / Reusable Practical Event Information Template</h3>
                <p>A data-sheet layout engineered specifically for mobile screen readability. Utilizes four distinct technical data brackets (Timetable, Venue, Entry, Amenities) with high contrast against an obsidian backing panel.</p>
              </div>
              <div class="template-grid single-col">
                <div class="template-card large">
                  <img src="${currentEditionMeta.basePath}/posts/RUPTURE_IG_POST_14.jpg" alt="Practical Guide">
                  <div class="template-meta">
                    <div class="mono bold">PRACTICAL EVENT GUIDE ARCHITECTURE (POST 14)</div>
                    <p class="muted">Modular content sections that can be configured for every future event edition. Ensures essential logistics are readable without straining on mobile displays.</p>
                    <a href="${currentEditionMeta.basePath}/posts/RUPTURE_IG_POST_14.png" download class="btn small primary">Download High-Res 1080×1350 PNG</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- ========================================== -->
        <!-- VIEW 6: DESIGN LOGIC & SYSTEM ARCHITECTURE -->
        <!-- ========================================== -->
        ${viewMode === 'logic' ? `
          <div class="logic-wrapper">
            <div class="logic-grid">
              <div class="logic-card">
                <div class="mono logic-num">01</div>
                <h4>Grid Rhythm & Layout Balance</h4>
                <p>In Instagram's 3-column profile layout, neighboring posts can easily blend into a monotonous smear if not balanced. The RUPTURE campaign interlaces three distinct visual archetypes:</p>
                <ul>
                  <li><strong>Hero Artworks</strong> (Posts 01, 03, 05, 10, 15): Monumental sculptures floating in deep void with minimal typography.</li>
                  <li><strong>Typographic Statements</strong> (Posts 02, 06, 08, 09): Dense, authoritative European-style grids with high-contrast rules and structured manifesto points.</li>
                  <li><strong>Editorial Data Sheets</strong> (Posts 04, 07, 11, 12, 13, 14): Precise technical framing, GPS coordinates, timetable brackets, and urgency badges.</li>
                </ul>
                <p>In any 3-post row, you will never see two identical archetypes adjacent to one another.</p>
              </div>

              <div class="logic-card">
                <div class="mono logic-num">02</div>
                <h4>Artwork Families Separation Rule</h4>
                <p>The collective's 77 approved artworks fall into 5 distinct families. Each campaign uses <strong>only two compatible families</strong> (one primary, one secondary), strictly excluding the other three. This produces a recognisable visual chapter per event rather than a discordant moodboard.</p>
                <ul>
                  <li><strong>Edition 01:</strong> Sculptural Liquid Chrome + Folded Liquid Surfaces. Heavy metallic mass and tectonic plates.</li>
                  <li><strong>Edition 02:</strong> Pearlescent Silver Fluid + Translucent Glass Membrane. Ethereal silk and caustic refractions.</li>
                  <li><strong>Edition 03:</strong> Reflective Globes & Rings + Sculptural Chrome. Kinetic orbits and fluid mercury loops.</li>
                </ul>
              </div>

              <div class="logic-card">
                <div class="mono logic-num">03</div>
                <h4>The Restrained Red Rule</h4>
                <p>Consistent with the RUPTURE brand guidelines, Molten Crimson (#FF3344) is strictly restrained across the entire 15-post suite to exactly <strong>two strategic moments</strong>:</p>
                <ul>
                  <li><strong>Post 05 (Main Event Poster)</strong>: A razor-thin molten crimson caustic slit runs horizontally beneath the title.</li>
                  <li><strong>Post 13 (Last Tickets)</strong>: An electric molten red indicator and status border signals capacity urgency.</li>
                </ul>
                <p>Every other post strictly obeys the Pure Chrome, Liquid Slate, Icy Blue, Pale Cyan, and Lavender spectrum.</p>
              </div>

              <div class="logic-card">
                <div class="mono logic-num">04</div>
                <h4>Safe Zone & Dual-Crop Engineering</h4>
                <p>Instagram displays posts in <strong>1:1 square crop</strong> in the profile feed, but in <strong>4:5 portrait (1080×1350)</strong> when opened in the feed. Our layout system enforces a strict dual-zone geometry:</p>
                <ul>
                  <li><strong>Central Safe Zone (Y=135 to Y=1215)</strong>: 1080×1080 pixels. All primary headlines, event dates, artist lineups, manifesto texts, and central sculptural focal points are positioned securely inside this boundary. Nothing essential is ever cropped in the profile view.</li>
                  <li><strong>Outer Technical Margins (Y < 135 and Y > 1215)</strong>: Contains hairline registration marks, corner brackets, GPS coordinates, frequency identifiers, and technical archival stamps that reward the viewer when inspecting the post full-screen.</li>
                </ul>
              </div>
            </div>
          </div>
        ` : ''}

      </div>
    `;

    // Render builder result if in direction view
    if (viewMode === 'direction') {
      updateBuilderResult(fams);
    }

    // Bind event listeners
    bindEvents(el, posts, man, fams);
  }

  function updateBuilderResult(fams) {
    const resEl = document.getElementById('builder-result');
    if (!resEl) return;

    const pFam = fams.families.find(f => f.id === customPrimary);
    const sFam = fams.families.find(f => f.id === customSecondary);
    if (!pFam || !sFam) return;

    const isCompatible = pFam.compatibleFamilies.includes(sFam.id) || pFam.id === sFam.id;
    const inactiveList = fams.families.filter(f => f.id !== pFam.id && f.id !== sFam.id);

    resEl.innerHTML = `
      <div class="builder-feedback-card ${isCompatible ? 'compat-good' : 'compat-warning'}">
        <div class="feedback-badge-row">
          <span class="mono badge ${isCompatible ? 'api' : 'queue'}">
            ${isCompatible ? '✓ COMPATIBLE HARMONIC DIRECTION' : '⚠ ATYPICAL PAIRING'}
          </span>
          <span class="mono muted">PAIRING: ${esc(pFam.name)} + ${esc(sFam.name)}</span>
        </div>

        <div class="feedback-content-grid">
          <div class="feedback-col">
            <span class="mono muted text-xs">PRIMARY FORM:</span>
            <strong>${esc(pFam.name)}</strong>
            <p class="text-sm muted">${esc(pFam.description)}</p>
            <div class="feedback-thumbs">
              <img src="/artworks/masters/${pFam.heroArtwork}" alt="${esc(pFam.name)}">
            </div>
          </div>

          <div class="feedback-col">
            <span class="mono muted text-xs">SECONDARY FORM:</span>
            <strong>${esc(sFam.name)}</strong>
            <p class="text-sm muted">${esc(sFam.description)}</p>
            <div class="feedback-thumbs">
              <img src="/artworks/masters/${sFam.heroArtwork}" alt="${esc(sFam.name)}">
            </div>
          </div>

          <div class="feedback-col full-span">
            <span class="mono muted text-xs">EXCLUDED FROM THIS CHAPTER:</span>
            <div class="excluded-pill-row">
              ${inactiveList.map(inf => `
                <span class="excluded-pill mono">✕ ${esc(inf.name)}</span>
              `).join('')}
            </div>
            <p class="text-xs muted" style="margin-top: 8px;">Enforcing family boundaries ensures this edition maintains a coherent textural chapter rather than an uncurated amalgam.</p>
          </div>
        </div>
      </div>
    `;
  }

  function bindEvents(el, posts, man, fams) {
    // Edition selector dropdown
    const selectEdition = el.querySelector('#select-edition');
    if (selectEdition) {
      selectEdition.addEventListener('change', (e) => {
        activeEditionId = e.target.value;
        render();
      });
    }

    // Edition pill buttons
    el.querySelectorAll('.edition-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeEditionId = btn.dataset.editionId;
        render();
      });
    });

    // View mode switchers
    el.querySelectorAll('[data-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        viewMode = btn.dataset.view;
        render();
      });
    });

    // Aspect ratio switchers
    el.querySelectorAll('[data-aspect]').forEach(btn => {
      btn.addEventListener('click', () => {
        aspectMode = btn.dataset.aspect;
        render();
      });
    });

    // Direction builder selects
    const bPrimary = el.querySelector('#builder-primary');
    const bSecondary = el.querySelector('#builder-secondary');
    if (bPrimary && bSecondary) {
      bPrimary.addEventListener('change', (e) => {
        customPrimary = e.target.value;
        updateBuilderResult(fams);
      });
      bSecondary.addEventListener('change', (e) => {
        customSecondary = e.target.value;
        updateBuilderResult(fams);
      });
    }

    // Group randomisation triggers
    const selectGroup = el.querySelector('#select-randomise-group');
    const btnGroup = el.querySelector('#btn-trigger-group-randomise');
    if (btnGroup && selectGroup) {
      btnGroup.addEventListener('click', () => {
        const gid = selectGroup.value;
        if (!gid) return alert('Please select an artwork group from the dropdown.');
        randomiseFromGroup(gid);
      });
    }
    const btnRerand = el.querySelector('#btn-rerandomise-group');
    if (btnRerand && currentEditionMeta.isDynamicGroup) {
      btnRerand.addEventListener('click', () => {
        randomiseFromGroup(currentEditionMeta.groupId);
      });
    }

    // Post inspection triggers
    el.querySelectorAll('[data-post-id]').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' && e.target.getAttribute('download') !== null) return;
        const id = card.dataset.postId;
        openModal(id, posts, man, fams);
      });
    });
  }

  function openModal(id, posts, man, fams) {
    const post = posts.find(p => p.id === id);
    if (!post) return;
    activePostId = id;

    const currentEditionMeta = man.editions.find(e => e.id === activeEditionId) || man.editions[0];
    const basePath = currentEditionMeta.basePath;
    const modalImgSrc = currentEditionMeta.isDynamicGroup
      ? `/artworks/masters/${post.artwork}`
      : `${basePath}/posts/${post.fileStem}.jpg`;
    const dlJpg = currentEditionMeta.isDynamicGroup
      ? `/artworks/masters/${post.artwork}`
      : `${basePath}/posts/${post.fileStem}.jpg`;
    const dlPng = currentEditionMeta.isDynamicGroup
      ? `/artworks/masters/${post.artwork}`
      : `${basePath}/posts/${post.fileStem}.png`;

    const modal = document.getElementById('campaign-modal');
    if (!modal) return;

    modal.innerHTML = `
      <div class="campaign-modal-inner">
        <div class="modal-left">
          <div class="modal-image-stage ${showCropGuide ? 'show-crop-guide' : ''}">
            <img src="${modalImgSrc}" alt="${esc(post.title)}" class="modal-full-img">
            <div class="safe-crop-overlay">
              <div class="crop-top-mask"></div>
              <div class="crop-center-box"><span class="mono">1:1 PROFILE CROP SAFE AREA</span></div>
              <div class="crop-bottom-mask"></div>
            </div>
          </div>
          <div class="modal-image-tools">
            <button type="button" class="btn small ${showCropGuide ? 'active' : ''}" id="btn-toggle-crop">
              ${showCropGuide ? 'Hide 1:1 Safe Crop Guide' : 'Show 1:1 Safe Crop Guide'}
            </button>
            <div class="download-group">
              <a href="${dlJpg}" download="${post.fileStem}.jpg" class="btn small">Download JPG</a>
              <a href="${dlPng}" download="${post.fileStem}.png" class="btn small primary">Download ${currentEditionMeta.isDynamicGroup ? 'Artwork' : 'PNG (1080×1350)'}</a>
            </div>
          </div>
        </div>

        <div class="modal-right">
          <div class="modal-header-row">
            <div>
              <span class="mono muted">${esc(post.phase)} · ${esc(post.timing)}</span>
              <h3>POST ${post.id} // ${esc(post.title)}</h3>
              <div class="modal-edition-badge mono muted text-xs">
                CAMPAIGN: ${esc(currentEditionMeta.title)}
              </div>
            </div>
            <button type="button" class="btn small close-modal-btn" aria-label="Close dialog">✕</button>
          </div>

          <!-- Artwork Family Assignment -->
          ${post.family ? `
            <div class="modal-section">
              <div class="mono muted">ARTWORK GROUP / FAMILY ASSIGNMENT:</div>
              <div class="modal-family-box">
                <span class="role-badge ${post.familyRole?.toLowerCase().includes('primary') ? 'primary-role' : 'secondary-role'}">
                  ${esc(post.familyRole || 'Curated Group Member')}
                </span>
                <strong>${esc(post.family)}</strong>
                <p class="muted text-xs" style="margin: 4px 0 0;">Matched against curated artwork group specifications.</p>
              </div>
            </div>
          ` : ''}

          <div class="modal-section">
            <div class="mono muted">APPROVED MASTER ARTWORK PROVENANCE:</div>
            <div class="art-ref-box">
              <img src="/artworks/masters/${post.artwork}" alt="${esc(post.artworkTitle)}" class="art-ref-thumb">
              <div>
                <strong>${esc(post.artwork.replace('_v1.jpg', ''))}</strong>
                <p class="muted text-sm">${esc(post.artworkTitle)}</p>
                <a href="/artworks/masters/${post.artwork}" target="_blank" class="mono text-sm">View Master Artwork ↗</a>
              </div>
            </div>
          </div>

          <div class="modal-section">
            <div class="mono muted">COLOR & TYPOGRAPHY SPECIFICATIONS:</div>
            <div class="spec-detail-box">
              <div><span class="mono muted">PALETTE:</span> ${esc(post.palette)}</div>
              <div><span class="mono muted">TYPOGRAPHY:</span> ${esc(post.typography)}</div>
              <div><span class="mono muted">SAFE AREA:</span> ${esc(post.safeArea)}</div>
            </div>
          </div>

          <div class="modal-section">
            <div class="caption-header-row">
              <span class="mono muted">INSTAGRAM CAPTION & HASHTAGS:</span>
              <button type="button" class="btn small" id="btn-copy-caption">Copy Caption</button>
            </div>
            <pre class="caption-text-box" id="caption-content">${esc(post.caption)}</pre>
          </div>
        </div>
      </div>
    `;

    // Bind modal buttons
    modal.querySelector('.close-modal-btn').addEventListener('click', () => modal.close());
    modal.querySelector('#btn-toggle-crop').addEventListener('click', () => {
      showCropGuide = !showCropGuide;
      openModal(id, posts, man, fams);
    });
    modal.querySelector('#btn-copy-caption').addEventListener('click', () => {
      navigator.clipboard.writeText(post.caption).then(() => {
        const btn = modal.querySelector('#btn-copy-caption');
        btn.textContent = 'Copied ✓';
        setTimeout(() => { btn.textContent = 'Copy Caption'; }, 2000);
      });
    });

    if (!modal.open) modal.showModal();
  }

  return { render, randomiseFromGroup, loadGroups };
}
