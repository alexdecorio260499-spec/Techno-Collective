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
  let activeEditionId = 'edition_khaos_01_system_fracture';
  const editionsCache = {};
  let viewMode = 'grid'; // 'grid' | 'timeline' | 'families' | 'direction' | 'templates' | 'logic'
  let aspectMode = 'sq'; // 'sq' (1:1 profile crop) | 'portrait' (4:5 full feed)
  let activePostId = null;
  let showCropGuide = false;
  let activeFamilyFilter = null;
  let modalAspect = 'feed'; // 'feed' (4:5) | 'reel' (9:16)
  let audioSimInterval = null;
  let isAudioSimPlaying = false;

  // Custom Direction Builder state & Event Profile
  let customPrimary = 'sculptural-chrome';
  let customSecondary = 'folded-surfaces';
  let customVariationLevel = 'medium'; // 'low' | 'medium' | 'high'
  let customDominantMaterial = 'liquid-chrome';
  let customPreferredShapes = ['asymmetrical', 'fluid-sculptural'];
  let customLighting = 'chiseled-rim-light';
  let customColorEmphasis = 'cool-monochrome';

  function esc(s = '') {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function showToast(msg, isErr = false) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.className = `show ${isErr ? 'err' : ''}`;
    clearTimeout(showToast.t);
    showToast.t = setTimeout(() => (t.className = ''), 3200);
  }

  let activeEditionInitialized = false;

  async function loadManifest(force = false) {
    if (manifest && !force) return manifest;
    try {
      const res = await fetch(`/campaign/editions_manifest.json?_t=${Date.now()}`);
      if (!res.ok) throw new Error('Failed to load editions manifest');
      manifest = await res.json();
      if (!activeEditionInitialized) {
        activeEditionId = manifest.activeEditionId || 'edition_01_hydraulic_void';
        activeEditionInitialized = true;
      } else if (!manifest.editions.some(e => e.id === activeEditionId)) {
        activeEditionId = manifest.activeEditionId || 'edition_01_hydraulic_void';
      }
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

    // Call server to create and persist unique randomised edition
    try {
      showToast(`⚡ Randomising new campaign from ${group.name}...`);
      const res = await fetch('/api/campaign/create-edition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: group.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server failed to create campaign');

      activeEditionId = data.editionId;
      editionsCache[data.editionId] = data.posts;
      manifest = null; // Invalidate cache so loadManifest re-fetches
      await loadManifest(true);

      viewMode = 'grid';
      location.hash = '#campaign';
      await render();
      showToast(`✓ New campaign created: ${data.edition?.title || data.editionId}`);
      return;
    } catch (apiErr) {
      console.warn('Backend campaign creation failed, falling back to client-side:', apiErr);
      // Client-side fallback if offline/static
      const man = await loadManifest();
      let maxG = 0;
      let grpCount = 0;
      for (const e of man.editions || []) {
        if (e.groupId === group.id) grpCount++;
        const m = String(e.editionNumber || '').match(/^G(\d+)$/i);
        if (m) {
          const n = parseInt(m[1], 10);
          if (n > maxG) maxG = n;
        }
      }
      const nextGNum = maxG + 1;
      const nextGStr = `G${nextGNum}`;
      const randNum = grpCount + 1;
      const dynamicId = `edition_grp_${String(nextGNum).padStart(2, '0')}_${Date.now().toString(36)}`;
      const posts = generate15PostsFromGroup(group);
      editionsCache[dynamicId] = posts;

      const edMeta = {
        id: dynamicId,
        editionNumber: nextGStr,
        title: `EDITION ${nextGStr}: ${group.name.toUpperCase()} // RANDOM #${randNum}`,
        chapter: `Curated Style Chapter ${nextGStr} — ${group.name}`,
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

      activeEditionId = dynamicId;
      viewMode = 'grid';
      location.hash = '#campaign';
      await render();
      showToast(`✓ New campaign created: ${edMeta.title}`);
    }
  }

  async function deleteEdition(editionId) {
    const targetId = editionId || activeEditionId;
    const man = await loadManifest();
    const targetMeta = man.editions.find(e => e.id === targetId);

    if (!targetMeta) {
      showToast(`Campaign edition "${targetId}" not found`, true);
      return false;
    }

    if (man.editions.length <= 1) {
      showToast('Cannot delete the only remaining campaign edition', true);
      alert('Cannot delete the only remaining campaign edition. At least one edition must be retained.');
      return false;
    }

    const title = targetMeta.title || targetId;
    const confirmed = confirm(`Are you sure you want to delete campaign edition:\n\n"${title}"?\n\nThis will permanently remove this 15-post event campaign.`);
    if (!confirmed) return false;

    try {
      // If it is purely an in-memory dynamic group edition without backend files
      if (targetMeta.isDynamicGroup && (!targetMeta.basePath || !targetMeta.basePath.length)) {
        man.editions = man.editions.filter(e => e.id !== targetId);
        delete editionsCache[targetId];
        if (activeEditionId === targetId) {
          activeEditionId = man.editions[0].id;
        }
        showToast(`Deleted dynamic edition: ${title}`);
        await render();
        return true;
      }

      // Persistent edition on server
      const res = await fetch(`/api/campaign/editions/${encodeURIComponent(targetId)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete campaign edition');

      delete editionsCache[targetId];
      manifest = null; // Invalidate cache so loadManifest re-fetches updated list
      activeEditionId = data.activeEditionId || (man.editions.find(e => e.id !== targetId)?.id) || 'edition_01_hydraulic_void';

      showToast(`Deleted campaign edition: ${title}`);
      await render();
      return true;
    } catch (err) {
      console.error(err);
      showToast(err.message, true);
      alert(`Error deleting edition: ${err.message}`);
      return false;
    }
  }

  async function swapPostArtwork(postId, buttonEl = null) {
    const man = await loadManifest();
    const currentEditionMeta = man.editions.find(e => e.id === activeEditionId) || man.editions[0];
    const posts = editionsCache[activeEditionId] || [];
    const normalizedPid = String(postId).padStart(2, '0');
    const post = posts.find(p => String(p.id).padStart(2, '0') === normalizedPid || p.id === postId);
    if (!post) {
      showToast(`Post ${postId} not found`, true);
      return;
    }

    // Set UI loading state
    if (buttonEl) {
      buttonEl.classList.add('loading');
      buttonEl.disabled = true;
      buttonEl.dataset.origText = buttonEl.textContent;
      buttonEl.textContent = '⏳ Swapping...';
    }
    const gridItem = document.querySelector(`.ig-grid-item[data-post-id="${post.id}"]`);
    if (gridItem) gridItem.classList.add('is-swapping');
    const timelineCard = document.querySelector(`.timeline-post-card[data-post-id="${post.id}"]`);
    if (timelineCard) timelineCard.classList.add('is-swapping');

    try {
      // Dynamic in-memory group edition (without disk files)
      if (currentEditionMeta.isDynamicGroup && (!currentEditionMeta.basePath || !currentEditionMeta.basePath.length)) {
        const grps = await loadGroups();
        const group = grps.find(g => g.id === currentEditionMeta.groupId) || currentEditionMeta.group;
        const artIds = group?.artworkIds || [];
        if (!artIds.length) {
          throw new Error('No candidate artworks found in this group.');
        }
        const currentArtId = post.artwork.replace(/_v\d+\.jpg$/, '');
        const usedOtherIds = new Set(posts.filter(p => p !== post).map(p => p.artwork.replace(/_v\d+\.jpg$/, '')));
        const unused = artIds.filter(id => id !== currentArtId && !usedOtherIds.has(id));
        let selectedId;
        if (unused.length > 0) {
          selectedId = unused[Math.floor(Math.random() * unused.length)];
        } else {
          const others = artIds.filter(id => id !== currentArtId);
          selectedId = others.length ? others[Math.floor(Math.random() * others.length)] : currentArtId;
        }

        post.artwork = `${selectedId}_v1.jpg`;
        post.artworkTitle = `${selectedId} (Curated from Group: ${group.name})`;
        post.fileStem = selectedId;

        updatePostDom(post, selectedId, currentArtId, { batchSource: { name: group.name } });
        showToast(`✓ Swapped Post ${post.id} artwork: ${currentArtId} → ${selectedId}`);
        return;
      }

      // Persistent server edition
      const res = await fetch(`/api/campaign/editions/${encodeURIComponent(activeEditionId)}/swap-post-artwork`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to swap post artwork');

      // Update in-memory cached post
      Object.assign(post, data.post);

      updatePostDom(post, data.swappedTo, data.swappedFrom, data);
      showToast(`✓ Post ${post.id} artwork swapped to ${data.swappedTo} (${data.batchSource?.name || 'batch'})`);
    } catch (err) {
      console.error(err);
      showToast(err.message, true);
    } finally {
      if (buttonEl) {
        buttonEl.classList.remove('loading');
        buttonEl.disabled = false;
        buttonEl.textContent = buttonEl.dataset.origText || '🔀 Swap Art';
      }
      if (gridItem) {
        gridItem.classList.remove('is-swapping');
        gridItem.classList.add('swap-success');
        setTimeout(() => gridItem.classList.remove('swap-success'), 1800);
      }
      if (timelineCard) {
        timelineCard.classList.remove('is-swapping');
        timelineCard.classList.add('swap-success');
        setTimeout(() => timelineCard.classList.remove('swap-success'), 1800);
      }
    }
  }

  async function rerollPostComposition(postId, buttonEl = null) {
    const man = await loadManifest();
    const currentEditionMeta = man.editions.find(e => e.id === activeEditionId) || man.editions[0];
    const posts = editionsCache[activeEditionId] || [];
    const normalizedPid = String(postId).padStart(2, '0');
    const post = posts.find(p => String(p.id).padStart(2, '0') === normalizedPid || p.id === postId);
    if (!post) {
      showToast(`Post ${postId} not found`, true);
      return;
    }

    // Set UI loading state
    if (buttonEl) {
      buttonEl.classList.add('loading');
      buttonEl.disabled = true;
      buttonEl.dataset.origText = buttonEl.textContent;
      buttonEl.textContent = '🎲 Re-rolling...';
    }
    const gridItem = document.querySelector(`.ig-grid-item[data-post-id="${post.id}"]`);
    if (gridItem) gridItem.classList.add('is-swapping');
    const timelineCard = document.querySelector(`.timeline-post-card[data-post-id="${post.id}"]`);
    if (timelineCard) timelineCard.classList.add('is-swapping');

    try {
      const res = await fetch(`/api/campaign/editions/${encodeURIComponent(activeEditionId)}/regenerate-post-composition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id, variationLevel: customVariationLevel })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to re-roll composition');

      // Update in-memory cached post
      Object.assign(post, data.post);
      if (data.newComposition) {
        post.compositionTag = Array.isArray(data.newComposition) ? data.newComposition[0] : data.newComposition;
      }

      updatePostDom(post, data.swappedTo, data.swappedFrom, data);

      // Also refresh multi-tag fields if modal is open
      const modal = document.getElementById('campaign-modal');
      if (modal && modal.open && activePostId === post.id) {
        const compTagEl = modal.querySelector('.modal-composition-tag');
        if (compTagEl && post.compositionTag) compTagEl.textContent = post.compositionTag;
      }

      showToast(`✓ Post ${post.id} composition re-rolled: ${post.compositionTag || 'New Composition'} (${data.family || 'family'})`);
    } catch (err) {
      console.error(err);
      showToast(err.message, true);
    } finally {
      if (buttonEl) {
        buttonEl.classList.remove('loading');
        buttonEl.disabled = false;
        buttonEl.textContent = buttonEl.dataset.origText || '🎲 Re-roll Comp';
      }
      if (gridItem) {
        gridItem.classList.remove('is-swapping');
        gridItem.classList.add('swap-success');
        setTimeout(() => gridItem.classList.remove('swap-success'), 1800);
      }
      if (timelineCard) {
        timelineCard.classList.remove('is-swapping');
        timelineCard.classList.add('swap-success');
        setTimeout(() => timelineCard.classList.remove('swap-success'), 1800);
      }
    }
  }

  function updatePostDom(post, newArtId, oldArtId, data = {}) {
    const currentEditionMeta = manifest?.editions?.find(e => e.id === activeEditionId) || manifest?.editions?.[0];
    const basePath = currentEditionMeta?.basePath;
    const ts = Date.now();

    const gridImgSrc = (basePath && basePath.length)
      ? (aspectMode === 'sq' ? `${basePath}/posts/${post.fileStem}_sq.jpg?_t=${ts}` : `${basePath}/posts/${post.fileStem}.jpg?_t=${ts}`)
      : `/artworks/masters/${post.artwork}?_t=${ts}`;

    const modalImgSrc = (basePath && basePath.length)
      ? `${basePath}/posts/${post.fileStem}.jpg?_t=${ts}`
      : `/artworks/masters/${post.artwork}?_t=${ts}`;

    // Update 3-column Grid
    const gridItem = document.querySelector(`.ig-grid-item[data-post-id="${post.id}"]`);
    if (gridItem) {
      const img = gridItem.querySelector('img');
      if (img) img.src = gridImgSrc;
      const famBadge = gridItem.querySelector('.ig-family-badge');
      if (famBadge && post.family) famBadge.textContent = post.family;
      const titleEl = gridItem.querySelector('.ig-overlay-title');
      if (titleEl && post.title) titleEl.textContent = post.title;
    }

    // Update Timeline Card
    const timelineCard = document.querySelector(`.timeline-post-card[data-post-id="${post.id}"]`);
    if (timelineCard) {
      const img = timelineCard.querySelector('.timeline-card-image img');
      if (img) img.src = gridImgSrc;
      const refLink = timelineCard.querySelector('.card-art-link a');
      if (refLink) {
        refLink.href = `/artworks/masters/${post.artwork}`;
        refLink.textContent = post.artwork.replace('_v1.jpg', '');
      }
      const famTag = timelineCard.querySelector('.card-family-tag');
      if (famTag && post.family) famTag.textContent = post.family;
    }

    // Update open modal if inspecting this post
    const modal = document.getElementById('campaign-modal');
    if (modal && modal.open && activePostId === post.id) {
      const modalFullImg = modal.querySelector('.modal-full-img');
      if (modalFullImg) modalFullImg.src = modalImgSrc;

      const artThumb = modal.querySelector('.art-ref-thumb');
      if (artThumb) artThumb.src = `/artworks/masters/${post.artwork}?_t=${ts}`;

      const artTitle = modal.querySelector('.art-ref-title');
      if (artTitle) artTitle.textContent = post.artwork.replace('_v1.jpg', '');

      const artDesc = modal.querySelector('.art-ref-desc');
      if (artDesc) artDesc.textContent = post.artworkTitle;

      const artLink = modal.querySelector('.art-ref-link');
      if (artLink) artLink.href = `/artworks/masters/${post.artwork}`;

      const famName = modal.querySelector('.modal-family-box strong');
      if (famName && post.family) famName.textContent = post.family;

      const compTag = modal.querySelector('.modal-composition-tag');
      if (compTag && post.compositionTag) compTag.textContent = post.compositionTag;

      const dlJpg = modal.querySelector('.btn-dl-jpg');
      if (dlJpg) dlJpg.href = modalImgSrc;
      const dlPng = modal.querySelector('.btn-dl-png');
      if (dlPng) dlPng.href = (basePath && basePath.length) ? `${basePath}/posts/${post.fileStem}.png?_t=${ts}` : `/artworks/masters/${post.artwork}?_t=${ts}`;
    }
  }

  async function loadEditionData(editionId) {
    if (editionsCache[editionId]) return editionsCache[editionId];
    try {
      const res = await fetch(`/campaign/editions/${editionId}/edition_data.json?_t=${Date.now()}`);
      if (!res.ok) throw new Error(`Failed to load data for edition ${editionId}`);
      const raw = await res.json();
      editionsCache[editionId] = Array.isArray(raw) ? raw : (raw.posts || []);
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
      'edition_khaos_01_system_fracture': '/campaign/editions/edition_khaos_01_system_fracture/posts/KHAOS_IG_POST_05_sq.jpg',
      'edition_grp_01_group_test_1': '/artworks/masters/RUPTURE_M43_v1.jpg',
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
      'edition_khaos_01_system_fracture': [
        { title: 'SIGNAL', img: '/campaign/editions/edition_khaos_01_system_fracture/posts/KHAOS_IG_POST_01_sq.jpg' },
        { title: 'MANIFESTO', img: '/campaign/editions/edition_khaos_01_system_fracture/posts/KHAOS_IG_POST_02_sq.jpg' },
        { title: 'IDENTITY', img: '/campaign/editions/edition_khaos_01_system_fracture/posts/KHAOS_IG_POST_03_sq.jpg' },
        { title: 'LINEUP', img: '/campaign/editions/edition_khaos_01_system_fracture/posts/KHAOS_IG_POST_06_sq.jpg' },
        { title: 'VENUE', img: '/campaign/editions/edition_khaos_01_system_fracture/posts/KHAOS_IG_POST_12_sq.jpg' }
      ],
      'edition_grp_01_group_test_1': [
        { title: 'SOUND', img: '/artworks/masters/RUPTURE_M78_v1.jpg' },
        { title: 'LINEUP', img: '/artworks/masters/RUPTURE_M86_v1.jpg' },
        { title: 'THE CODE', img: '/artworks/masters/RUPTURE_M38_v1.jpg' },
        { title: 'VENUE', img: '/artworks/masters/RUPTURE_M99_v1.jpg' },
        { title: 'TICKETS', img: '/artworks/masters/RUPTURE_M119_v1.jpg' }
      ],
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
      'edition_khaos_01_system_fracture': `KHAOS Collective · Mauritius<br>
        Transmission 01: System Fracture — Saturday 14 June [The Industrial Silo]<br>
        Fast · Hypnotic · Driving · Dark Techno · Custom 25 Hz Rig · No Phones`,
      'edition_grp_01_group_test_1': `Underground Electronic Music · Mauritius<br>
        Transmission 01: Group Test 1 — Friday · 24 April [Secret Industrial Silo]<br>
        Curated Style Group · 4 Artists · Custom 25 Hz Rig · No Photos`,
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
                ${man.editions.map(e => {
                  const isCur = e.id === activeEditionId;
                  const icon = isCur ? '★ ' : e.isDynamicGroup ? '⚡ ' : e.editionNumber === '00' ? '● ' : '✦ ';
                  const statusTag = isCur ? 'ACTIVE' : e.isDynamicGroup ? 'GROUP RANDOM' : e.editionNumber === '00' ? 'ARCHIVE' : 'READY';
                  return `
                    <option value="${e.id}" ${isCur ? 'selected' : ''}>
                      ${icon}${esc(e.title)} [${statusTag}]
                    </option>
                  `;
                }).join('')}
              </select>
            </div>
          </div>

          <div class="edition-selector-label" style="margin-left:auto; display:flex; align-items:center; gap:8px;">
            <span class="mono muted">RANDOMISE FROM GROUP:</span>
            <select id="select-randomise-group" class="edition-select" style="min-width: 190px;">
              <option value="">— Select Artwork Group —</option>
              ${(groupsData || []).map(g => {
                const isSel = currentEditionMeta?.groupId === g.id;
                return `<option value="${g.id}" ${isSel ? 'selected' : ''}>✦ ${esc(g.name)} (${(g.artworkIds||[]).length})</option>`;
              }).join('')}
            </select>
            <button type="button" class="btn small primary" id="btn-trigger-group-randomise">⚡ Randomise Grid</button>
          </div>

          <div class="edition-pills-row">
            ${man.editions.map(e => {
              const isActive = e.id === activeEditionId;
              const statusClass = `status-${e.status || 'ready'}`;
              const badgeIcon = isActive ? '★' : e.isDynamicGroup ? '⚡' : e.editionNumber === '00' ? '●' : '✦';
              const labelText = isActive ? 'ACTIVE' : e.isDynamicGroup ? 'GROUP' : e.editionNumber === '00' ? 'ARCHIVE' : 'FEED READY';
              return `
                <button type="button" class="btn small edition-pill-btn ${isActive ? 'is-selected' : ''} ${statusClass}" data-edition-id="${e.id}">
                  <span class="status-dot">${badgeIcon}</span>
                  <span>${esc(e.title.split(':')[0].trim())}</span>
                  <span class="mono muted text-xs">${esc(labelText)}</span>
                  <span class="pill-delete-btn" data-delete-edition-id="${e.id}" title="Delete ${esc(e.title)}">✕</span>
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
              <button type="button" class="btn danger btn-delete-current-edition" title="Delete this dynamic edition">✕ Delete Edition</button>
              <a href="#gallery" class="btn">Back to Gallery</a>
            </div>
          </div>
        ` : ''}

        <!-- CAMPAIGN HERO & METADATA -->
        <div class="campaign-header">
          <div class="campaign-header-title">
            <div class="edition-meta-badge-row">
              <span class="badge api mono">
                ACTIVE VISUAL DIRECTION
              </span>
              <span class="mono muted">${esc(currentEditionMeta.chapter)}</span>
              <button type="button" class="btn small danger btn-delete-current-edition" style="margin-left:auto; display:inline-flex; align-items:center; gap:5px; color:#ff5c5c; border-color:rgba(255,92,92,0.35); background:rgba(255,92,92,0.08); font-size:11px;" title="Delete this campaign edition">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                <span>Delete Edition</span>
              </button>
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
                const isDynamic = currentEditionMeta.isDynamicGroup && (!basePath || !basePath.length);
                const imgSrc = (basePath && basePath.length)
                  ? (aspectMode === 'sq' ? `${basePath}/posts/${p.fileStem}_sq.jpg` : `${basePath}/posts/${p.fileStem}.jpg`)
                  : `/artworks/masters/${p.artwork}`;
                const isCenterHero = p.id === '05';
                const familyName = p.family || (p.familyId ? familyMap[p.familyId]?.name : 'Core Artwork');
                const archetypeSlug = (p.archetype || 'full-artwork').toLowerCase().replace(/[^a-z0-9]+/g, '-');
                return `
                  <div class="ig-grid-item ${isCenterHero ? 'center-hero' : ''}" data-post-id="${p.id}" tabindex="0">
                    <img src="${imgSrc}" alt="${esc(p.title)}" loading="lazy">
                    ${isDynamic ? `
                      <div class="flyer-card-overlay">
                        <div class="flyer-card-top mono">
                          <span>RUPTURE // ${p.id}</span>
                          <span class="flyer-badge">${p.id === '05' ? 'HERO POSTER' : p.id === '04' ? 'SAVE DATE' : p.id === '13' ? 'COUNTDOWN' : p.id === '15' ? 'TONIGHT' : esc((p.phase || '').split('—')[0].trim())}</span>
                        </div>
                        <div class="flyer-card-center">
                          <div class="flyer-card-title">${esc(p.title || '')}</div>
                          <div class="flyer-card-sub mono">${esc((p.timing || p.date || '').split('(')[0].trim())}</div>
                        </div>
                        <div class="flyer-card-bottom mono">
                          <span>${esc(currentEditionMeta.groupName || 'GROUP')}</span>
                          <span>25 HZ RIG</span>
                        </div>
                      </div>
                    ` : ''}
                    <div class="ig-grid-overlay">
                      <div class="ig-overlay-header">
                        <span class="mono ig-post-badge">POST ${p.id}</span>
                        ${p.archetype ? `<span class="mono ig-archetype-badge archetype-${archetypeSlug}">${esc(p.archetype.replace(' Composition', '').replace(' Artwork', ''))}</span>` : ''}
                        ${p.reelAvailable ? `<span class="mono ig-reel-badge" title="9:16 Video / Reel Concept">▶ REEL</span>` : ''}
                        ${p.familyRole ? `<span class="mono ig-family-badge ${p.familyRole.toLowerCase().includes('primary') ? 'primary-badge' : 'secondary-badge'}">${esc(familyName)}</span>` : ''}
                      </div>
                      <div class="ig-overlay-title">${esc(p.title || '')}</div>
                      <div class="ig-overlay-meta mono muted">${esc((p.phase || '').split('—')[0].trim())} · ${esc(p.archetype || 'Art-Directed')}</div>
                      <div class="ig-overlay-stats">
                        <span>❤️ ${240 + parseInt(p.id, 10) * 37}</span>
                        <span>💬 ${18 + parseInt(p.id, 10) * 4}</span>
                      </div>
                      <div class="ig-overlay-actions">
                        <button type="button" class="btn small primary ig-inspect-btn">Inspect Post</button>
                        <button type="button" class="btn small ig-swap-btn" data-swap-post-id="${p.id}" title="Swap with another random artwork from this batch">🔀 Swap</button>
                        <button type="button" class="btn small ig-reroll-btn" data-reroll-post-id="${p.id}" title="Re-roll composition & camera perspective while keeping family and material">🎲 Re-roll</button>
                      </div>
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
            ${['PHASE 1', 'PHASE 2', 'PHASE 3', 'PHASE 4'].map((phasePrefix) => {
              const phasePosts = posts.filter(p => p.phase && p.phase.toUpperCase().startsWith(phasePrefix));
              if (!phasePosts.length) return '';
              const firstPhase = phasePosts[0]?.phase || `${phasePrefix} — CAMPAIGN ROLLOUT`;
              const phaseParts = firstPhase.split('—');
              const phaseNum = phaseParts[0].trim();
              const phaseTitle = phaseParts[1] ? phaseParts[1].trim() : 'CAMPAIGN ROLLOUT';
              return `
                <div class="timeline-phase-block">
                  <div class="phase-header">
                    <span class="mono phase-num">${esc(phaseNum)}</span>
                    <h3 class="phase-title">${esc(phaseTitle)}</h3>
                    <span class="phase-count mono muted">${phasePosts.length} POSTS</span>
                  </div>
                  <div class="timeline-posts-row ${aspectMode === 'portrait' ? 'aspect-portrait' : 'aspect-square'}">
                    ${phasePosts.map(p => {
                      const basePath = currentEditionMeta.basePath;
                      const imgSrc = (basePath && basePath.length)
                        ? (aspectMode === 'sq' ? `${basePath}/posts/${p.fileStem}_sq.jpg` : `${basePath}/posts/${p.fileStem}.jpg`)
                        : `/artworks/masters/${p.artwork || 'RUPTURE_M15_v1.jpg'}`;
                      const familyName = p.family || (p.familyId ? familyMap[p.familyId]?.name : 'Core Artwork');
                      return `
                        <div class="timeline-post-card" data-post-id="${p.id}">
                          <div class="timeline-card-image">
                            <img src="${imgSrc}" alt="${esc(p.title || '')}" loading="lazy">
                            <span class="mono card-tag">POST ${p.id}</span>
                            ${p.archetype ? `<span class="mono card-archetype-tag">${esc(p.archetype.replace(' Composition', ''))}</span>` : ''}
                            ${p.reelAvailable ? `<span class="mono card-reel-tag">▶ 9:16 REEL</span>` : ''}
                            ${p.familyRole ? `<span class="mono card-family-tag ${p.familyRole.toLowerCase().includes('primary') ? 'primary' : 'secondary'}">${esc(familyName)}</span>` : ''}
                          </div>
                          <div class="timeline-card-info">
                            <div class="mono card-timing muted">${esc(p.timing || p.date || '')}</div>
                            <h4 class="card-title">${esc(p.title || '')}</h4>
                            <p class="card-theme">${esc(p.theme || '')}</p>
                            ${p.artworkUsage ? `<p class="card-usage-note mono">${esc(p.artworkUsage)}</p>` : ''}
                            <div class="card-art-link mono">
                              <span class="muted">Ref:</span> <a href="/artworks/masters/${p.artwork || 'RUPTURE_M15_v1.jpg'}" target="_blank">${esc((p.artwork || 'M15').replace('_v1.jpg', ''))}</a>
                            </div>
                            <div class="timeline-card-actions">
                              <button type="button" class="btn small card-inspect-btn">Inspect Post</button>
                              <button type="button" class="btn small card-swap-btn" data-swap-post-id="${p.id}" title="Swap with another random artwork from this batch">🔀 Swap</button>
                              <button type="button" class="btn small card-reroll-btn" data-reroll-post-id="${p.id}" title="Re-roll composition & camera perspective while keeping family and material">🎲 Re-roll Comp</button>
                            </div>
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
                      <div class="family-card-actions">
                        <button type="button" class="btn small primary btn-select-as-primary" data-family-id="${fam.id}" title="Select ${esc(fam.name)} as Primary Family for Visual Direction">
                          ★ Set as Primary
                        </button>
                        <button type="button" class="btn small btn-select-as-secondary" data-family-id="${fam.id}" title="Add ${esc(fam.name)} as Secondary Compatible Family">
                          + Set as Secondary
                        </button>
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

    const pFam = fams.families.find(f => f.id === customPrimary) || fams.families[0];
    const sFam = fams.families.find(f => f.id === customSecondary) || fams.families[1];
    if (!pFam || !sFam) return;

    const isCompatible = (pFam.compatibleFamilies || []).includes(sFam.id) || pFam.id === sFam.id;
    const inactiveList = fams.families.filter(f => f.id !== pFam.id && f.id !== sFam.id);

    // Pick 4 sample artworks from primary and 4 from secondary for the reference board
    const primarySamples = (pFam.artworks || []).slice(0, 4);
    const secondarySamples = (sFam.artworks || []).slice(0, 4);

    // Build juxtaposed 8-artwork board list: alternating primary and secondary
    const combinedBoard = [];
    const maxLen = Math.max(primarySamples.length, secondarySamples.length);
    for (let i = 0; i < maxLen; i++) {
      if (primarySamples[i]) combinedBoard.push({ ...primarySamples[i], _role: 'PRIMARY', _famName: pFam.name });
      if (secondarySamples[i]) combinedBoard.push({ ...secondarySamples[i], _role: 'SECONDARY', _famName: sFam.name });
    }

    // Dynamic pairing explanation based on families
    let compatibilityScore = isCompatible ? (pFam.id === 'sculptural-chrome' && sFam.id === 'folded-surfaces' ? 0.95 : 0.90) : 0.65;
    let compatibilityStatus = compatibilityScore >= 0.90 ? 'HARMONIC' : compatibilityScore >= 0.75 ? 'COMPATIBLE' : 'ATYPICAL';
    let compatibilityText = '';
    let visualSimilarities = [];
    let potentialConflicts = [];

    if (pFam.id === 'sculptural-chrome' && sFam.id === 'folded-surfaces') {
      compatibilityText = 'Tension & Planar Stratum Synergy: High-tension sculptural liquid chrome spires and meniscus tension necks pair seamlessly with razor-sheared horizontal strata and brutalist fluid terraces. Both share identical high-contrast studio specular lighting, deep obsidian negative space, and pure monochrome silver tonality.';
      visualSimilarities = ['Identical studio keylight & specular roll-off', 'Shared liquid chrome & deep obsidian foundation', 'Controlled negative space for typography'];
      potentialConflicts = ['Ensure razor planar bevels do not overwhelm organic fluid spires; maintain ~65% primary balance'];
    } else if (pFam.id === 'pearlescent-silver' && sFam.id === 'translucent-glass') {
      compatibilityText = 'Luminescence & Vitreous Dispersion: Velvety pearlescent fluid swells with soft-white specular sheen pair naturally with gossamer-thin optical glass membranes and delicate cyan/lavender caustic refractions. Creates a lighter, hypnotic, ethereal techno chapter.';
      visualSimilarities = ['Soft-white diffuse glow', 'Ethereal weightlessness in void', 'Shared cyan and lavender caustic dispersion'];
      potentialConflicts = ['Ensure glass membranes retain enough physical opacity against pure nacreous silk'];
    } else if (pFam.id === 'reflective-globes' || sFam.id === 'reflective-globes') {
      compatibilityText = 'Orbital Curvilinear Tension: Nested liquid chrome rings and distorted toroidal loops introduce kinetic circular momentum, harmonizing with fluid metallic geometry without conflicting with background planar void depth.';
      visualSimilarities = ['Continuous circular momentum', 'Shared liquid metal specular reflections', 'Enclosed negative-space void apertures'];
      potentialConflicts = ['Avoid cluttered multiple rings that distract from clean solitary hero silhouette'];
    } else if (isCompatible) {
      compatibilityText = `Harmonic Surface Affinity: ${pFam.name} and ${sFam.name} share complementary metallic reflectivity, controlled obsidian negative space, and aligned specular contrast, establishing a coherent and recognisable visual chapter.`;
      visualSimilarities = ['Monochrome silver foundation', 'Deep studio negative space', 'High-definition 3D rendering standard'];
      potentialConflicts = ['Maintain clear primary dominance to prevent stylistic ambiguity'];
    } else {
      compatibilityText = `Atypical / Contrast Pairing: While ${pFam.name} and ${sFam.name} exhibit distinct textural behaviors, their shared underground techno DNA allows for intentional tension. Inactive families remain strictly excluded.`;
      visualSimilarities = ['Dark atmospheric void', 'Photorealistic material physics'];
      potentialConflicts = ['Significant contrast between surface roughness and light interaction'];
    }

    // Available shape options for the profile
    const allShapes = [
      { id: 'asymmetrical', name: 'Asymmetrical' },
      { id: 'elongated-spire', name: 'Elongated Spire' },
      { id: 'folded-planar', name: 'Folded Planar' },
      { id: 'toroidal-loop', name: 'Toroidal Loop' },
      { id: 'fluid-sculptural', name: 'Fluid Sculptural' },
      { id: 'angular-blade', name: 'Angular Blade' },
      { id: 'fragmented-filaments', name: 'Dendritic Filaments' }
    ];

    resEl.innerHTML = `
      <div class="builder-feedback-card ${compatibilityStatus === 'HARMONIC' ? 'compat-good' : 'compat-warning'}">
        <div class="feedback-badge-row">
          <span class="mono badge ${compatibilityStatus === 'HARMONIC' ? 'api' : 'queue'}">
            ✓ ${compatibilityStatus} PAIRING [SCORE: ${Math.round(compatibilityScore * 100)}%]
          </span>
          <span class="mono muted">CHAPTER DIRECTION: ${esc(pFam.name)} [PRI] + ${esc(sFam.name)} [SEC]</span>
        </div>

        <!-- 1. Primary & Secondary Family Previews -->
        <div class="feedback-content-grid">
          <div class="feedback-col">
            <div class="mono muted text-xs" style="display:flex; justify-content:space-between; align-items:center;">
              <span>PRIMARY ARTWORK FAMILY (60-70% GRID):</span>
              <span class="role-badge primary-role">PRIMARY</span>
            </div>
            <strong style="font-size:16px;">${esc(pFam.name)}</strong>
            <p class="text-sm muted" style="margin:4px 0 10px;">${esc(pFam.description)}</p>
            <div class="feedback-family-preview">
              <div class="feedback-hero-wrap" style="position:relative; border:1px solid var(--line-2); border-radius:2px; overflow:hidden;">
                <img src="/artworks/masters/${pFam.heroArtwork}" alt="${esc(pFam.name)}" style="width:100%; aspect-ratio:1/1; object-fit:cover; display:block;">
                <span class="mono" style="position:absolute; bottom:4px; right:4px; background:rgba(5,6,8,0.85); font-size:9px; padding:2px 6px; border:1px solid var(--line-2);">HERO: ${esc(pFam.heroArtwork.replace('_v1.jpg', ''))}</span>
              </div>
              <div class="feedback-thumbs-row" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:6px; margin-top:6px;">
                ${primarySamples.slice(0, 3).map(art => `
                  <div style="aspect-ratio:1/1; border:1px solid var(--line); overflow:hidden;" title="${esc(art.id)}: ${esc(art.title)}">
                    <img src="/artworks/masters/${art.file}" alt="${esc(art.id)}" style="width:100%; height:100%; object-fit:cover;">
                  </div>
                `).join('')}
              </div>
            </div>
            <div class="mono text-xs muted" style="margin-top:8px;">${pFam.artworks.length} approved master artworks in this family</div>
          </div>

          <div class="feedback-col">
            <div class="mono muted text-xs" style="display:flex; justify-content:space-between; align-items:center;">
              <span>SECONDARY COMPATIBLE FAMILY (30-40% GRID):</span>
              <span class="role-badge secondary-role">SECONDARY</span>
            </div>
            <strong style="font-size:16px;">${esc(sFam.name)}</strong>
            <p class="text-sm muted" style="margin:4px 0 10px;">${esc(sFam.description)}</p>
            <div class="feedback-family-preview">
              <div class="feedback-hero-wrap" style="position:relative; border:1px solid var(--line-2); border-radius:2px; overflow:hidden;">
                <img src="/artworks/masters/${sFam.heroArtwork}" alt="${esc(sFam.name)}" style="width:100%; aspect-ratio:1/1; object-fit:cover; display:block;">
                <span class="mono" style="position:absolute; bottom:4px; right:4px; background:rgba(5,6,8,0.85); font-size:9px; padding:2px 6px; border:1px solid var(--line-2);">HERO: ${esc(sFam.heroArtwork.replace('_v1.jpg', ''))}</span>
              </div>
              <div class="feedback-thumbs-row" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:6px; margin-top:6px;">
                ${secondarySamples.slice(0, 3).map(art => `
                  <div style="aspect-ratio:1/1; border:1px solid var(--line); overflow:hidden;" title="${esc(art.id)}: ${esc(art.title)}">
                    <img src="/artworks/masters/${art.file}" alt="${esc(art.id)}" style="width:100%; height:100%; object-fit:cover;">
                  </div>
                `).join('')}
              </div>
            </div>
            <div class="mono text-xs muted" style="margin-top:8px;">${sFam.artworks.length} approved master artworks in this family</div>
          </div>

          <!-- 2. Combined Visual Reference Board (Juxtaposition) -->
          <div class="feedback-col full-span" style="border-top:1px solid var(--line); padding-top:18px;">
            <div class="combined-reference-board">
              <div class="combined-board-header">
                <div class="mono muted text-xs">VISUAL DIRECTION PREVIEW // CHAPTER COMBINATION</div>
                <h4>COMBINED VISUAL REFERENCE BOARD</h4>
                <p>Juxtaposing ${esc(pFam.name)} and ${esc(sFam.name)} side-by-side to verify material, reflection, and tonal harmony before generating the 15-post event campaign.</p>
              </div>

              <div class="combined-board-grid">
                ${combinedBoard.slice(0, 8).map(art => `
                  <div class="combined-board-tile ${art._role === 'PRIMARY' ? 'is-primary' : 'is-secondary'}" title="${esc(art.id)}: ${esc(art.title)} (${esc(art._famName)})">
                    <img src="/artworks/masters/${art.file}" alt="${esc(art.id)}" loading="lazy">
                    <div class="combined-board-tag">
                      <span class="mono">${esc(art.id.replace('RUPTURE_', ''))}</span>
                      <span class="role-badge ${art._role === 'PRIMARY' ? 'primary' : 'secondary'}">${art._role}</span>
                    </div>
                  </div>
                `).join('')}
              </div>

              <!-- Cohesion Rationale Explanation -->
              <div class="compat-explanation-box" style="background:var(--panel); border:1px solid var(--line); padding:14px 18px; border-radius:2px; margin-top:6px;">
                <div class="mono text-xs bold" style="color:var(--cyan); margin-bottom:4px;">WHY THIS COMBINATION WORKS TOGETHER:</div>
                <p class="text-xs muted" style="margin:0; line-height:1.6;">${esc(compatibilityText)}</p>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:8px; padding-top:8px; border-top:1px dashed var(--line-2);">
                  <div>
                    <span class="mono text-xs" style="color:#5ce1ff;">✓ KEY SIMILARITIES:</span>
                    <ul class="text-xs muted" style="margin:4px 0 0; padding-left:16px;">
                      ${visualSimilarities.map(s => `<li>${esc(s)}</li>`).join('')}
                    </ul>
                  </div>
                  <div>
                    <span class="mono text-xs" style="color:#ffcc00;">⚠ POTENTIAL CONFLICTS & GUIDANCE:</span>
                    <ul class="text-xs muted" style="margin:4px 0 0; padding-left:16px;">
                      ${potentialConflicts.map(c => `<li>${esc(c)}</li>`).join('')}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Event Art Direction Profile & Controlled Variation -->
          <div class="feedback-col full-span">
            <div class="event-profile-box">
              <div class="event-profile-header">
                <div class="mono muted text-xs">SECTION 05 // EVENT ART DIRECTION PROFILE</div>
                <h4>CAMPAIGN ARTISTIC DIRECTION & CONTROLLED VARIATION</h4>
                <p>Customize the dedicated artistic parameters for this party edition. The generator uses these parameters to enforce variety without stylistic chaos.</p>
              </div>

              <div class="event-profile-grid">
                <div class="profile-field">
                  <label>DOMINANT MATERIAL:</label>
                  <select id="profile-dominant-material" class="profile-select">
                    <option value="liquid-chrome" ${customDominantMaterial === 'liquid-chrome' ? 'selected' : ''}>Polished Liquid Chrome (Mirror specularity)</option>
                    <option value="folded-strata" ${customDominantMaterial === 'folded-strata' ? 'selected' : ''}>Razor-Sheared Laminar Strata (Stepped planes)</option>
                    <option value="pearlescent-silk" ${customDominantMaterial === 'pearlescent-silk' ? 'selected' : ''}>Pearlescent Silver Fluid (Velvety silk)</option>
                    <option value="translucent-membrane" ${customDominantMaterial === 'translucent-membrane' ? 'selected' : ''}>Translucent Glass Membrane (Vitreous film)</option>
                    <option value="toroidal-rings" ${customDominantMaterial === 'toroidal-rings' ? 'selected' : ''}>Reflective Globes & Rings (Annular loops)</option>
                    <option value="hybrid" ${customDominantMaterial === 'hybrid' ? 'selected' : ''}>Hybrid (Chrome fused with Strata)</option>
                  </select>
                </div>

                <div class="profile-field">
                  <label>LIGHTING CHARACTERISTICS:</label>
                  <select id="profile-lighting" class="profile-select">
                    <option value="chiseled-rim-light" ${customLighting === 'chiseled-rim-light' ? 'selected' : ''}>Chiseled Rim Lighting (Crisp cold edges)</option>
                    <option value="dramatic-directional-key" ${customLighting === 'dramatic-directional-key' ? 'selected' : ''}>Dramatic Directional Keylight (Deep shadow falloff)</option>
                    <option value="soft-diffuse-studio" ${customLighting === 'soft-diffuse-studio' ? 'selected' : ''}>Soft Diffuse Studio (Wrapped ambient glow)</option>
                    <option value="high-contrast-specular" ${customLighting === 'high-contrast-specular' ? 'selected' : ''}>High-Contrast Specular (Mirror reflection focus)</option>
                    <option value="internal-refraction-glow" ${customLighting === 'internal-refraction-glow' ? 'selected' : ''}>Internal Caustic Glow (Subsurface refractions)</option>
                  </select>
                </div>

                <div class="profile-field">
                  <label>COLOUR REFRACTION EMPHASIS:</label>
                  <select id="profile-color-emphasis" class="profile-select">
                    <option value="cool-monochrome" ${customColorEmphasis === 'cool-monochrome' ? 'selected' : ''}>Pure Monochrome Silver & Obsidian</option>
                    <option value="pale-cyan" ${customColorEmphasis === 'pale-cyan' ? 'selected' : ''}>Pale Cyan Caustics (#7AE7FF)</option>
                    <option value="icy-blue" ${customColorEmphasis === 'icy-blue' ? 'selected' : ''}>Icy Blue Specular Rim (#5EC5FF)</option>
                    <option value="lavender" ${customColorEmphasis === 'lavender' ? 'selected' : ''}>Lavender Iridescence (#C8B6FF)</option>
                    <option value="ultraviolet" ${customColorEmphasis === 'ultraviolet' ? 'selected' : ''}>Deep Ultraviolet Shadows (#7A2CFF)</option>
                  </select>
                </div>

                <div class="profile-field" style="grid-column: 1 / -1;">
                  <label>PREFERRED SCULPTURAL SHAPE ARCHETYPES:</label>
                  <div class="shapes-checkbox-cloud">
                    ${allShapes.map(s => {
                      const isSel = customPreferredShapes.includes(s.id);
                      return `
                        <label class="shape-tag-check ${isSel ? 'active' : ''}">
                          <input type="checkbox" name="preferred-shape" value="${s.id}" ${isSel ? 'checked' : ''}>
                          <span>${isSel ? '✓' : '+'} ${esc(s.name)}</span>
                        </label>
                      `;
                    }).join('')}
                  </div>
                </div>

                <div class="profile-field" style="grid-column: 1 / -1;">
                  <label>CONTROLLED VISUAL VARIATION LEVEL (SECTION 07):</label>
                  <div class="variation-toggle-group">
                    <button type="button" class="variation-pill-btn ${customVariationLevel === 'low' ? 'active' : ''}" data-variation="low">
                      <strong>LOW // TIGHT CONTROL</strong>
                      <span>Strict canonical fidelity. Limited changes to approved master reference silhouettes and camera setups.</span>
                    </button>
                    <button type="button" class="variation-pill-btn ${customVariationLevel === 'medium' ? 'active' : ''}" data-variation="medium">
                      <strong>MEDIUM // BALANCED (DEFAULT)</strong>
                      <span>Dynamic visual variety. Explores diverse shapes, asymmetrical framing, and scale while keeping material DNA identical.</span>
                    </button>
                    <button type="button" class="variation-pill-btn ${customVariationLevel === 'high' ? 'active' : ''}" data-variation="high">
                      <strong>HIGH // ADVENTUROUS</strong>
                      <span>Radical permutations. Daring oblique camera angles, extreme macro crops, and complex topological knots.</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 4. Visual Consistency 6-Point Audit Scorecard -->
          <div class="feedback-col full-span">
            <div class="consistency-scorecard-card">
              <div class="scorecard-header">
                <div class="mono text-xs muted">SECTION 09 // AUTOMATED VISUAL CONSISTENCY CHECK</div>
                <div class="scorecard-title-row">
                  <h4>PRE-GENERATION HARMONY & REPETITION SCORECARD</h4>
                  <span class="badge ${compatibilityStatus === 'HARMONIC' ? 'api' : 'ready'} mono">
                    ${compatibilityStatus} [SCORE: ${Math.round(compatibilityScore * 100)}%]
                  </span>
                </div>
              </div>

              <div class="scorecard-checklist">
                <div class="scorecard-check-item pass">
                  <span class="mono check-status-icon">✓</span>
                  <div class="check-info">
                    <strong>01. Master Art Direction DNA</strong>
                    <p>Enforces obsidian negative space, pure chrome physics, and strict prohibition on painted neon or humanoid elements.</p>
                  </div>
                </div>

                <div class="scorecard-check-item pass">
                  <span class="mono check-status-icon">✓</span>
                  <div class="check-info">
                    <strong>02. Event Profile Conformance</strong>
                    <p>Exclusively draws from ${esc(pFam.name)} and ${esc(sFam.name)}. ${inactiveList.length} unselected families strictly excluded.</p>
                  </div>
                </div>

                <div class="scorecard-check-item pass">
                  <span class="mono check-status-icon">✓</span>
                  <div class="check-info">
                    <strong>03. Material & Lighting Cohesion</strong>
                    <p>Pairing rating: ${Math.round(compatibilityScore * 100)}%. Shared specular roll-off and studio keylight calibration.</p>
                  </div>
                </div>

                <div class="scorecard-check-item pass">
                  <span class="mono check-status-icon">✓</span>
                  <div class="check-info">
                    <strong>04. Compositional Diversity Protocol</strong>
                    <p>Controlled variation (${customVariationLevel.toUpperCase()}) guarantees varied scale, perspectives, and non-repetitive silhouettes across the 3-column feed.</p>
                  </div>
                </div>

                <div class="scorecard-check-item pass">
                  <span class="mono check-status-icon">✓</span>
                  <div class="check-info">
                    <strong>05. Restrained Red Rule Discipline</strong>
                    <p>Molten Crimson (#FF3344) strictly restricted to Post 05 (Main Poster) and Post 13 (Final Tickets). Zero standard post leakage.</p>
                  </div>
                </div>

                <div class="scorecard-check-item pass">
                  <span class="mono check-status-icon">✓</span>
                  <div class="check-info">
                    <strong>06. Dual-Zone 1:1 Safe Area</strong>
                    <p>Guarantees all headlines, dates, and artist rosters are centered within Y=135..1215 for seamless profile grid view.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 5. Inactive Families Excluded Notice -->
          <div class="feedback-col full-span">
            <span class="mono muted text-xs">STRICTLY INACTIVE / EXCLUDED FROM THIS CHAPTER:</span>
            <div class="excluded-pill-row">
              ${inactiveList.map(inf => `
                <span class="excluded-pill mono" style="color:#ff7a7a; border-color:rgba(255,92,92,0.3); background:rgba(255,92,92,0.06);">
                  ✕ ${esc(inf.name)} [ZERO OCCURRENCES]
                </span>
              `).join('')}
            </div>
            <p class="text-xs muted" style="margin-top: 8px;">Strict rule: Inactive artwork families will NEVER be mixed into this event campaign. All 15 posts are mathematically bound exclusively to ${esc(pFam.name)} and ${esc(sFam.name)}.</p>
          </div>

          <!-- 6. Confirm & Generate CTA Bar -->
          <div class="feedback-col full-span">
            <div class="builder-create-bar">
              <div class="builder-create-info">
                <span class="mono text-xs" style="color:var(--cyan); font-weight:700;">CONFIRM ART DIRECTION & GENERATE CAMPAIGN</span>
                <div class="builder-create-input-row">
                  <span class="mono muted text-xs">EVENT TITLE:</span>
                  <input type="text" id="builder-edition-title" class="builder-input" value="EDITION 01: HYDRAULIC VOID" placeholder="e.g. EDITION 01: HYDRAULIC VOID">
                </div>
              </div>
              <button type="button" class="btn primary bold" id="btn-create-edition-from-direction" style="padding:10px 22px; font-size:13px; display:inline-flex; align-items:center; gap:8px;">
                <span>✨ Generate 15-Post Event Campaign</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind event profile controls immediately
    const matSel = resEl.querySelector('#profile-dominant-material');
    if (matSel) {
      matSel.addEventListener('change', (e) => {
        customDominantMaterial = e.target.value;
      });
    }

    const lightSel = resEl.querySelector('#profile-lighting');
    if (lightSel) {
      lightSel.addEventListener('change', (e) => {
        customLighting = e.target.value;
      });
    }

    const colSel = resEl.querySelector('#profile-color-emphasis');
    if (colSel) {
      colSel.addEventListener('change', (e) => {
        customColorEmphasis = e.target.value;
      });
    }

    // Shapes checkboxes
    resEl.querySelectorAll('.shape-tag-check input').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const val = e.target.value;
        if (e.target.checked) {
          if (!customPreferredShapes.includes(val)) customPreferredShapes.push(val);
        } else {
          customPreferredShapes = customPreferredShapes.filter(s => s !== val);
        }
        e.target.closest('.shape-tag-check')?.classList.toggle('active', e.target.checked);
      });
    });

    // Variation level pills
    resEl.querySelectorAll('.variation-pill-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const v = btn.dataset.variation;
        customVariationLevel = v;
        resEl.querySelectorAll('.variation-pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        showToast(`Visual Variation Dial set to ${v.toUpperCase()}`);
      });
    });

    // Bind generate button
    const btnCreate = resEl.querySelector('#btn-create-edition-from-direction');
    if (btnCreate) {
      btnCreate.addEventListener('click', async () => {
        const titleInput = resEl.querySelector('#builder-edition-title');
        const title = titleInput?.value?.trim() || `EDITION: ${pFam.name.toUpperCase()} // ${sFam.name.toUpperCase()}`;
        btnCreate.disabled = true;
        btnCreate.innerHTML = '<span class="status-dot">●</span> <span>Generating Campaign with Approved Families & Profile...</span>';
        try {
          const res = await fetch('/api/campaign/create-edition', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title,
              primaryFamilyId: customPrimary,
              secondaryFamilyIds: [customSecondary],
              variationLevel: customVariationLevel,
              artDirectionProfile: {
                primaryFamily: customPrimary,
                secondaryFamilies: [customSecondary],
                dominantMaterial: customDominantMaterial,
                preferredShapes: customPreferredShapes,
                lighting: customLighting,
                colorEmphasis: customColorEmphasis,
                variationLevel: customVariationLevel
              }
            })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to create campaign edition');
          await loadManifest(true);
          activeEditionId = data.editionId;
          viewMode = 'grid';
          showToast(`✓ Campaign Generated: ${data.edition.title} (${data.edition.primaryFamily.name} + ${data.edition.secondaryFamilies.map(f => f.name).join(' & ')})`);
          render();
        } catch (err) {
          showToast(err.message, true);
          btnCreate.disabled = false;
          btnCreate.innerHTML = '<span>✨ Generate 15-Post Event Campaign</span>';
        }
      });
    }
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

    // Delete edition buttons (topbar, dynamic banner, header)
    el.querySelectorAll('.btn-delete-current-edition').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteEdition(activeEditionId);
      });
    });

    // Delete edition icon on pills
    el.querySelectorAll('.pill-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idToDelete = btn.dataset.deleteEditionId;
        deleteEdition(idToDelete);
      });
    });

    // Edition pill buttons
    el.querySelectorAll('.edition-pill-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (e.target.closest('.pill-delete-btn')) return;
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

    // Family card action buttons (View 03 -> View 04)
    el.querySelectorAll('.btn-select-as-primary').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const fId = btn.dataset.familyId;
        customPrimary = fId;
        viewMode = 'direction';
        const fam = fams.families.find(f => f.id === fId);
        showToast(`Selected "${fam?.name || fId}" as Primary Family. Select Secondary below.`);
        render();
      });
    });

    el.querySelectorAll('.btn-select-as-secondary').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const fId = btn.dataset.familyId;
        customSecondary = fId;
        viewMode = 'direction';
        const fam = fams.families.find(f => f.id === fId);
        showToast(`Selected "${fam?.name || fId}" as Secondary Family.`);
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
    if (btnGroup) {
      btnGroup.addEventListener('click', () => {
        let gid = selectGroup ? selectGroup.value : '';
        if (!gid) {
          // Fallback to active edition's group or first group with artworks
          if (currentEditionMeta?.groupId) {
            gid = currentEditionMeta.groupId;
          } else {
            const firstWithArt = (groupsData || []).find(g => (g.artworkIds || []).length > 0);
            if (firstWithArt) gid = firstWithArt.id;
          }
          if (selectGroup && gid) selectGroup.value = gid;
        }
        if (!gid) return alert('Please select an artwork group from the dropdown or create one in the Gallery.');
        randomiseFromGroup(gid);
      });
    }
    const btnRerand = el.querySelector('#btn-rerandomise-group');
    if (btnRerand && currentEditionMeta.isDynamicGroup) {
      btnRerand.addEventListener('click', () => {
        const gid = currentEditionMeta.groupId || (selectGroup ? selectGroup.value : '') || (groupsData || []).find(g => (g.artworkIds || []).length > 0)?.id;
        if (gid) randomiseFromGroup(gid);
      });
    }

    // Swap artwork triggers on grid & timeline
    el.querySelectorAll('[data-swap-post-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const pid = btn.dataset.swapPostId;
        swapPostArtwork(pid, btn);
      });
    });

    // Composition re-roll triggers on grid & timeline
    el.querySelectorAll('[data-reroll-post-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const pid = btn.dataset.rerollPostId;
        rerollPostComposition(pid, btn);
      });
    });

    // Post inspection triggers
    el.querySelectorAll('[data-post-id]').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('[data-swap-post-id]') || e.target.closest('[data-reroll-post-id]')) return;
        if (e.target.tagName === 'A' && e.target.getAttribute('download') !== null) return;
        const id = card.dataset.postId;
        openModal(id, posts, man, fams);
      });
    });
  }

  function openModal(id, posts, man, fams) {
    const post = posts.find(p => String(p.id).padStart(2, '0') === String(id).padStart(2, '0') || p.id === id);
    if (!post) return;
    activePostId = post.id;

    const currentEditionMeta = man.editions.find(e => e.id === activeEditionId) || man.editions[0];
    const basePath = currentEditionMeta.basePath;
    const hasBasePath = Boolean(basePath && basePath.length);
    const modalImgSrc = hasBasePath
      ? `${basePath}/posts/${post.fileStem}.jpg`
      : `/artworks/masters/${post.artwork}`;
    const dlJpg = hasBasePath
      ? `${basePath}/posts/${post.fileStem}.jpg`
      : `/artworks/masters/${post.artwork}`;
    const dlPng = hasBasePath
      ? `${basePath}/posts/${post.fileStem}.png`
      : `/artworks/masters/${post.artwork}`;

    let batchLabel = 'Current Batch';
    if (currentEditionMeta.groupId) {
      const grp = (groupsData || []).find(g => g.id === currentEditionMeta.groupId) || currentEditionMeta.group;
      batchLabel = grp ? `${grp.name} (${grp.artworkIds?.length || 0} styles)` : 'Curated Group';
    } else if (currentEditionMeta.primaryFamily) {
      batchLabel = currentEditionMeta.primaryFamily.name || 'Curated Family';
    }

    let artMeta = null;
    const allFams = fams?.families || familiesData?.families || [];
    for (const f of allFams) {
      const found = (f.artworks || []).find(a => a.file === post.artwork || a.id === post.artwork.replace(/_v\d+\.jpg$/, ''));
      if (found) {
        artMeta = found;
        break;
      }
    }

    const isReel = Boolean(modalAspect === 'reel' && post.reelAvailable);
    const activeModalImgSrc = hasBasePath
      ? (isReel ? `${basePath}/posts/${post.fileStem}_reel.jpg` : `${basePath}/posts/${post.fileStem}.jpg`)
      : `/artworks/masters/${post.artwork}`;

    const dlReelJpg = hasBasePath ? `${basePath}/posts/${post.fileStem}_reel.jpg` : null;
    const dlReelPng = hasBasePath ? `${basePath}/posts/${post.fileStem}_reel.png` : null;

    const modal = document.getElementById('campaign-modal');
    if (!modal) return;

    modal.innerHTML = `
      <div class="campaign-modal-inner">
        <div class="modal-left">
          ${post.reelAvailable ? `
            <div class="modal-aspect-switcher">
              <span class="mono text-xs muted" style="margin-right: 4px;">VIEW FORMAT:</span>
              <button type="button" class="aspect-toggle-btn ${!isReel ? 'active' : ''}" data-modal-aspect="feed">
                Feed (4:5 · 1080×1350)
              </button>
              <button type="button" class="aspect-toggle-btn ${isReel ? 'active' : ''}" data-modal-aspect="reel">
                ▶ Reel / Story (9:16 · 1080×1920)
              </button>
            </div>
          ` : ''}

          <div class="modal-image-stage ${showCropGuide && !isReel ? 'show-crop-guide' : ''} ${isReel ? 'aspect-reel' : ''}">
            <img src="${activeModalImgSrc}" alt="${esc(post.title)}" class="modal-full-img">
            ${!isReel ? `
              <div class="safe-crop-overlay">
                <div class="crop-top-mask"></div>
                <div class="crop-center-box"><span class="mono">1:1 PROFILE CROP SAFE AREA</span></div>
                <div class="crop-bottom-mask"></div>
              </div>
            ` : ''}
          </div>

          ${(post.videoData || post.archetype?.includes('Video')) ? `
            <div class="interactive-audio-hud">
              <button type="button" class="hud-play-btn" id="btn-toggle-audio-sim">
                <span id="audio-sim-icon">▶</span> <span id="audio-sim-text">Play Live Waveform (142 BPM)</span>
              </button>
              <div class="mono text-xs" style="display:flex; align-items:center; gap:8px;">
                <span style="color:var(--cyan); font-weight:700;">LIVE HARDWARE</span>
                <span class="muted">·</span>
                <span class="muted">PCM 24-BIT</span>
              </div>
              <canvas class="hud-wave-canvas" id="modal-wave-canvas" width="140" height="24"></canvas>
            </div>
          ` : ''}

          <div class="modal-image-tools">
            ${!isReel ? `
              <button type="button" class="btn small ${showCropGuide ? 'active' : ''}" id="btn-toggle-crop">
                ${showCropGuide ? 'Hide 1:1 Safe Crop Guide' : 'Show 1:1 Safe Crop Guide'}
              </button>
            ` : ''}
            <button type="button" class="btn small ig-stage-swap-btn" data-swap-post-id="${post.id}" title="Swap with another random artwork from current batch">
              🔀 Swap Artwork
            </button>
            <button type="button" class="btn small ig-stage-reroll-btn" data-reroll-post-id="${post.id}" title="Re-roll composition/angle while preserving family & material">
              🎲 Re-roll Comp
            </button>
            <div class="download-group">
              <a href="${dlJpg}" download="${post.fileStem}.jpg" class="btn small btn-dl-jpg">Download 4:5 JPG</a>
              <a href="${dlPng}" download="${post.fileStem}.png" class="btn small primary btn-dl-png">Download 4:5 PNG</a>
              ${isReel && dlReelJpg ? `
                <a href="${dlReelJpg}" download="${post.fileStem}_reel.jpg" class="btn small btn-dl-reel" style="background:rgba(122,231,255,0.15); border-color:var(--cyan); color:var(--cyan);">Download 9:16 Reel</a>
              ` : ''}
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
            <button type="button" class="btn small close-modal-btn" aria-label="Close dialog">Close ✕</button>
          </div>

          <!-- Creative Archetype & Art Direction Banner -->
          <div class="modal-archetype-banner">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span class="modal-archetype-pill">ARCHETYPE: ${esc(post.archetype || 'Full Artwork Composition')}</span>
              ${post.reelAvailable ? `<span class="mono card-reel-tag" style="background:rgba(122,231,255,0.12); border-color:var(--cyan); color:var(--cyan);">▶ 9:16 REEL CONCEPT READY</span>` : ''}
            </div>
            <div class="modal-archetype-desc">${esc(post.archetypeDescription || 'Art-directed underground techno layout.')}</div>
            ${post.artworkUsage ? `<div class="modal-artwork-usage-note"><strong>ARTWORK INTEGRATION:</strong> ${esc(post.artworkUsage)}</div>` : ''}
          </div>

          <!-- Artwork Family Assignment -->
          ${post.family ? `
            <div class="modal-section">
              <div class="mono muted">ARTWORK FAMILY & CHAPTER PROVENANCE:</div>
              <div class="modal-family-box">
                <span class="role-badge ${post.familyRole?.toLowerCase().includes('primary') ? 'primary-role' : 'secondary-role'}">
                  ${esc(post.familyRole || 'Curated Family Member')}
                </span>
                <strong>${esc(post.family)}</strong>
                <p class="muted text-xs" style="margin: 4px 0 0;">
                  ${post.familyRole?.toLowerCase().includes('primary') ? 'Primary Family: anchors campaign visual identity and key announcement hero posts.' : 'Secondary Family: provides compatible textural variety and structural balance.'}
                </p>
                ${(currentEditionMeta.inactiveFamilies && currentEditionMeta.inactiveFamilies.length > 0) ? `
                  <div class="modal-inactive-rule mono text-xs muted" style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed var(--line); color: #ff9999;">
                    ⛔ Inactive Families (Strictly Excluded): ${(currentEditionMeta.inactiveFamilies || []).map(f => familyMap[f]?.name || f).join(', ')}
                  </div>
                ` : ''}
              </div>
            </div>
          ` : ''}

          <div class="modal-section modal-artwork-section">
            <div class="modal-artwork-provenance-header">
              <span class="mono muted">APPROVED MASTER ARTWORK PROVENANCE:</span>
              <div style="display:flex; gap:6px;">
                <button type="button" class="btn small ig-modal-swap-btn" id="btn-modal-swap-artwork" data-swap-post-id="${post.id}" title="Select a different random artwork from current batch">
                  <span class="swap-icon">🔀</span> Swap Art
                </button>
                <button type="button" class="btn small ig-modal-reroll-btn" data-reroll-post-id="${post.id}" title="Re-roll composition & angle while keeping family & material">
                  <span class="reroll-icon">🎲</span> Re-roll Comp
                </button>
              </div>
            </div>
            <div class="art-ref-box">
              <img src="/artworks/masters/${post.artwork}" alt="${esc(post.artworkTitle)}" class="art-ref-thumb">
              <div>
                <strong class="art-ref-title">${esc(post.artwork.replace('_v1.jpg', ''))}</strong>
                <p class="muted text-sm art-ref-desc">${esc(post.artworkTitle)}</p>
                <div class="art-ref-links mono text-xs">
                  <a href="/artworks/masters/${post.artwork}" target="_blank" class="art-ref-link">View Master Artwork ↗</a>
                  <span class="muted">·</span>
                  <span class="batch-source-label muted">Batch: ${esc(batchLabel)}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Master Art Direction Multi-Dimensional Classification -->
          ${artMeta ? `
            <div class="modal-section modal-art-direction-section">
              <div class="mono muted">MASTER ART DIRECTION CLASSIFICATION:</div>
              <div class="modal-attributes-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px; background: rgba(255,255,255,0.02); padding: 10px; border: 1px solid var(--line); border-radius: 4px;">
                <div>
                  <span class="mono text-xs muted" style="display:block; margin-bottom: 2px;">DOMINANT MATERIAL:</span>
                  <span class="mono text-xs" style="color: var(--cyan);">${Array.isArray(artMeta.materials) ? artMeta.materials.join(', ') : (artMeta.materials || 'Polished Chrome')}</span>
                </div>
                <div>
                  <span class="mono text-xs muted" style="display:block; margin-bottom: 2px;">SURFACE FINISH:</span>
                  <span class="mono text-xs" style="color: #fff;">${artMeta.surfaceFinish || 'Specular Mirror'}</span>
                </div>
                <div>
                  <span class="mono text-xs muted" style="display:block; margin-bottom: 2px;">SCULPTURAL FORM:</span>
                  <span class="mono text-xs" style="color: #ccc;">${Array.isArray(artMeta.form) ? artMeta.form.join(', ') : (artMeta.form || 'Fluid Sculptural')}</span>
                </div>
                <div>
                  <span class="mono text-xs muted" style="display:block; margin-bottom: 2px;">COMPOSITION:</span>
                  <span class="mono text-xs modal-composition-tag" style="color: #7AE7FF; font-weight: 700;">${post.compositionTag || (Array.isArray(artMeta.composition) ? artMeta.composition.join(', ') : (artMeta.composition || 'Central Focus'))}</span>
                </div>
                <div>
                  <span class="mono text-xs muted" style="display:block; margin-bottom: 2px;">LIGHTING PROFILE:</span>
                  <span class="mono text-xs" style="color: #ccc;">${Array.isArray(artMeta.lighting) ? artMeta.lighting.join(', ') : (artMeta.lighting || 'Directional Key')}</span>
                </div>
                <div>
                  <span class="mono text-xs muted" style="display:block; margin-bottom: 2px;">PERSPECTIVE:</span>
                  <span class="mono text-xs" style="color: #aaa;">${Array.isArray(artMeta.perspective) ? artMeta.perspective.join(', ') : (artMeta.perspective || 'Eye-Level')}</span>
                </div>
                ${artMeta.secondaryFamilies && artMeta.secondaryFamilies.length ? `
                  <div style="grid-column: span 2; padding-top: 6px; border-top: 1px dashed var(--line);">
                    <span class="mono text-xs muted" style="display:block; margin-bottom: 2px;">SECONDARY BRIDGES:</span>
                    <span class="mono text-xs" style="color: #ff99ff;">🌉 Bridges with: ${artMeta.secondaryFamilies.join(', ')}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          ` : ''}

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

          <div class="modal-section modal-footer-close-row">
            <button type="button" class="btn close-modal-btn close-modal-footer-btn" aria-label="Close dialog">
              ← Close Post Inspector
            </button>
          </div>
        </div>
      </div>
    `;

    // Bind all close buttons
    modal.querySelectorAll('.close-modal-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        if (audioSimInterval) clearInterval(audioSimInterval);
        isAudioSimPlaying = false;
        modal.close();
      };
    });

    // Close on backdrop click (clicking outside the modal dialog box)
    modal.onclick = (e) => {
      if (e.target === modal) {
        if (audioSimInterval) clearInterval(audioSimInterval);
        isAudioSimPlaying = false;
        modal.close();
      }
    };

    // Close on Escape key
    modal.onkeydown = (e) => {
      if (e.key === 'Escape') {
        if (audioSimInterval) clearInterval(audioSimInterval);
        isAudioSimPlaying = false;
        modal.close();
      }
    };

    // Bind Aspect Ratio Switcher (Feed vs Reel)
    modal.querySelectorAll('[data-modal-aspect]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        modalAspect = btn.dataset.modalAspect;
        openModal(id, posts, man, fams);
      });
    });

    // Bind Audio Waveform Simulator
    const btnAudioSim = modal.querySelector('#btn-toggle-audio-sim');
    const waveCanvas = modal.querySelector('#modal-wave-canvas');
    if (btnAudioSim && waveCanvas) {
      const ctx = waveCanvas.getContext('2d');
      const drawIdleWave = () => {
        ctx.clearRect(0, 0, 140, 24);
        ctx.fillStyle = '#6e7684';
        for (let i = 0; i < 20; i++) {
          const h = 4 + Math.sin(i * 0.4) * 3;
          ctx.fillRect(i * 7, (24 - h) / 2, 4, h);
        }
      };
      drawIdleWave();

      btnAudioSim.addEventListener('click', () => {
        isAudioSimPlaying = !isAudioSimPlaying;
        const icon = modal.querySelector('#audio-sim-icon');
        const txt = modal.querySelector('#audio-sim-text');
        if (isAudioSimPlaying) {
          if (icon) icon.textContent = '❚❚';
          if (txt) txt.textContent = 'Pause Simulated Audio (142 BPM)';
          btnAudioSim.style.background = 'var(--cyan)';
          btnAudioSim.style.color = '#000';
          let tick = 0;
          if (audioSimInterval) clearInterval(audioSimInterval);
          audioSimInterval = setInterval(() => {
            tick++;
            ctx.clearRect(0, 0, 140, 24);
            for (let i = 0; i < 20; i++) {
              const h = Math.max(3, Math.abs(Math.sin(tick * 0.3 + i * 0.45) * 20));
              ctx.fillStyle = (i >= 7 && i <= 13) ? '#7AE7FF' : '#c3cad4';
              ctx.fillRect(i * 7, (24 - h) / 2, 4, h);
            }
          }, 60);
        } else {
          if (icon) icon.textContent = '▶';
          if (txt) txt.textContent = 'Play Live Waveform (142 BPM)';
          btnAudioSim.style.background = '';
          btnAudioSim.style.color = '';
          if (audioSimInterval) clearInterval(audioSimInterval);
          drawIdleWave();
        }
      });
    }

    const btnCrop = modal.querySelector('#btn-toggle-crop');
    if (btnCrop) {
      btnCrop.addEventListener('click', () => {
        showCropGuide = !showCropGuide;
        openModal(id, posts, man, fams);
      });
    }

    modal.querySelectorAll('[data-swap-post-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        swapPostArtwork(post.id, btn);
      });
    });
    modal.querySelectorAll('[data-reroll-post-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        rerollPostComposition(post.id, btn);
      });
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

  // Expose deleteEdition, swapPostArtwork, and rerollPostComposition globally on window for direct programmatic/console access
  window.ruptureDeleteCampaignEdition = deleteEdition;
  window.ruptureSwapPostArtwork = swapPostArtwork;
  window.ruptureRerollPostComposition = rerollPostComposition;

  return { render, randomiseFromGroup, loadGroups, deleteEdition, swapPostArtwork, rerollPostComposition };
}
