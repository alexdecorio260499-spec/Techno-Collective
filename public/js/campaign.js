// RUPTURE Studio — Instagram Campaign View Module
// Implements interactive 3-column Instagram profile feed, chronological rollout timeline,
// reusable templates showcase, safe-area toggles, full-resolution inspection modal, and caption copy tools.

export function createCampaignView(app) {
  let campaignData = null;
  let viewMode = 'grid'; // 'grid' | 'timeline' | 'templates' | 'logic'
  let aspectMode = 'sq'; // 'sq' (1:1 profile crop) | 'portrait' (4:5 full feed)
  let activePostId = null;
  let showCropGuide = false;

  async function loadData() {
    if (campaignData) return campaignData;
    try {
      const res = await fetch('/campaign/campaign_data.json');
      if (!res.ok) throw new Error('Failed to load campaign data');
      campaignData = await res.json();
    } catch (err) {
      console.error(err);
      campaignData = [];
    }
    return campaignData;
  }

  function esc(s = '') {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  async function render() {
    const el = document.getElementById('view-campaign');
    if (!el) return;
    const posts = await loadData();

    // Instagram Profile sequence: latest post (Post 15) first, down to Post 01 at the bottom-right.
    const profileSequence = [...posts].reverse();

    el.innerHTML = `
      <div class="campaign-container">
        <!-- Campaign Header & View Controls -->
        <div class="campaign-header">
          <div class="campaign-header-title">
            <div class="mono muted">EVENT LAUNCH CAMPAIGN // MAURITIUS UNDERGROUND</div>
            <h2>RUPTURE // INSTAGRAM GRID</h2>
            <p class="campaign-tagline">15-post promotional campaign for Edition 01: Hydraulic Void, derived entirely from approved master artworks.</p>
          </div>
          <div class="campaign-controls">
            <div class="control-group">
              <span class="mono muted">VIEW:</span>
              <div class="pill-buttons" role="tablist">
                <button type="button" class="btn small ${viewMode === 'grid' ? 'active' : ''}" data-view="grid">01 Profile Feed (3-Col)</button>
                <button type="button" class="btn small ${viewMode === 'timeline' ? 'active' : ''}" data-view="timeline">02 Chronological Flow</button>
                <button type="button" class="btn small ${viewMode === 'templates' ? 'active' : ''}" data-view="templates">03 Reusable Templates</button>
                <button type="button" class="btn small ${viewMode === 'logic' ? 'active' : ''}" data-view="logic">04 Design Logic</button>
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

        <!-- VIEW 1: INSTAGRAM PROFILE GRID (3-COL) -->
        ${viewMode === 'grid' ? `
          <div class="ig-profile-wrapper">
            <!-- Simulated Instagram Profile Header -->
            <div class="ig-profile-header">
              <div class="ig-avatar-wrap">
                <div class="ig-avatar-ring">
                  <img src="/artworks/masters/RUPTURE_M15_v1.jpg" alt="RUPTURE profile" class="ig-avatar-img">
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
                    Fast · Hypnotic · Driving · Dark Groove<br>
                    Edition 01: Hydraulic Void — [Date / Secret Industrial Silo]<br>
                    4 Artists · 8 Hours · Custom Multi-Point Acoustics
                  </div>
                  <a href="#campaign" class="ig-bio-link">linktr.ee/rupture.mu</a>
                </div>
              </div>
            </div>

            <!-- Story Highlights -->
            <div class="ig-highlights">
              <div class="highlight-item">
                <div class="highlight-ring"><img src="/artworks/masters/RUPTURE_M49_v1.jpg" alt="Sound"></div>
                <span class="mono">SOUND</span>
              </div>
              <div class="highlight-item">
                <div class="highlight-ring"><img src="/artworks/masters/RUPTURE_M28_v1.jpg" alt="Lineup"></div>
                <span class="mono">LINEUP</span>
              </div>
              <div class="highlight-item">
                <div class="highlight-ring"><img src="/artworks/masters/RUPTURE_M80_v1.jpg" alt="The Code"></div>
                <span class="mono">THE CODE</span>
              </div>
              <div class="highlight-item">
                <div class="highlight-ring"><img src="/artworks/masters/RUPTURE_M85_v1.jpg" alt="Location"></div>
                <span class="mono">VENUE</span>
              </div>
              <div class="highlight-item">
                <div class="highlight-ring"><img src="/artworks/masters/RUPTURE_M138_v1.jpg" alt="Tickets"></div>
                <span class="mono">TICKETS</span>
              </div>
            </div>

            <!-- Profile Grid Header Tab -->
            <div class="ig-feed-tabs">
              <div class="ig-feed-tab active">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h7v7H3zm11 0h7v7h-7zm-11 11h7v7H3zm11 0h7v7h-7z"/></svg>
                <span class="mono">POSTS (15)</span>
              </div>
            </div>

            <!-- 3-Column Profile Grid (5 rows x 3 cols) -->
            <div class="ig-grid ${aspectMode === 'portrait' ? 'aspect-portrait' : 'aspect-square'}">
              ${profileSequence.map((p, idx) => {
                const imgSrc = aspectMode === 'sq' ? `/campaign/posts/${p.fileStem}_sq.jpg` : `/campaign/posts/${p.fileStem}.jpg`;
                const rowNum = Math.floor(idx / 3) + 1;
                const colNum = (idx % 3) + 1;
                const isCenterHero = p.id === '05';
                const hasRedCaustic = p.id === '05' || p.id === '13';
                return `
                  <div class="ig-grid-item ${hasRedCaustic ? 'has-red-accent' : ''} ${isCenterHero ? 'center-hero' : ''}" data-post-id="${p.id}" tabindex="0">
                    <img src="${imgSrc}" alt="${esc(p.title)}" loading="lazy">
                    <div class="ig-grid-overlay">
                      <div class="ig-overlay-header">
                        <span class="mono ig-post-badge">POST ${p.id}</span>
                        ${hasRedCaustic ? `<span class="mono ig-red-dot" title="Molten Crimson Restrained Accent">● RED ACCENT</span>` : ''}
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

        <!-- VIEW 2: CHRONOLOGICAL CAMPAIGN FLOW -->
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
                      const imgSrc = aspectMode === 'sq' ? `/campaign/posts/${p.fileStem}_sq.jpg` : `/campaign/posts/${p.fileStem}.jpg`;
                      return `
                        <div class="timeline-post-card" data-post-id="${p.id}">
                          <div class="timeline-card-image">
                            <img src="${imgSrc}" alt="${esc(p.title)}" loading="lazy">
                            <span class="mono card-tag">POST ${p.id}</span>
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

        <!-- VIEW 3: REUSABLE TEMPLATES SHOWCASE -->
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
                <p>A high-velocity countdown visual framework based on the razor-sharp aerodynamic fluid dagger (RUPTURE_M58). The giant condensed numerals can be dynamically updated (7 Days, 5 Days, 3 Days, 24 Hours) while preserving kinetic tension.</p>
              </div>
              <div class="template-grid">
                <div class="template-card">
                  <img src="/campaign/posts/RUPTURE_IG_POST_12.jpg" alt="7 Days">
                  <div class="template-meta">
                    <div class="mono bold">7 DAYS COUNTDOWN (POST 12)</div>
                    <div class="mono muted">T-Minus 1 Week Anticipation Phase</div>
                    <a href="/campaign/posts/RUPTURE_IG_POST_12.png" download class="btn small">Download PNG</a>
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
                <p>A data-sheet layout engineered specifically for mobile screen readability. Utilizes four distinct technical data brackets (Timetable, Venue, Entry, Amenities) with high contrast against an obsidian backing panel, flanked by the vertical tensile pinch of RUPTURE_M97.</p>
              </div>
              <div class="template-grid single-col">
                <div class="template-card large">
                  <img src="/campaign/posts/RUPTURE_IG_POST_14.jpg" alt="Practical Guide">
                  <div class="template-meta">
                    <div class="mono bold">PRACTICAL EVENT GUIDE ARCHITECTURE (POST 14)</div>
                    <p class="muted">Modular content sections that can be configured for every future event edition. Ensures essential logistics are readable without straining on mobile displays.</p>
                    <a href="/campaign/posts/RUPTURE_IG_POST_14.png" download class="btn small primary">Download High-Res 1080×1350 PNG</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- VIEW 4: DESIGN LOGIC & SYSTEM -->
        ${viewMode === 'logic' ? `
          <div class="logic-wrapper">
            <div class="logic-grid">
              <div class="logic-card">
                <div class="mono logic-num">01</div>
                <h4>Grid Rhythm & Layout Balance</h4>
                <p>In Instagram's 3-column profile layout, neighboring posts can easily blend into a monotonous smear if not balanced. The RUPTURE campaign interlaces three distinct visual archetypes:</p>
                <ul>
                  <li><strong>Hero Artworks</strong> (Posts 01, 03, 05, 10, 15): Monumental liquid chrome sculptures floating in deep void with minimal typography.</li>
                  <li><strong>Typographic Statements</strong> (Posts 02, 06, 08, 09): Dense, authoritative European-style grids with high-contrast rules and structured manifesto points.</li>
                  <li><strong>Editorial Data Sheets</strong> (Posts 04, 07, 11, 12, 13, 14): Precise technical framing, GPS coordinates, timetable brackets, and urgency badges.</li>
                </ul>
                <p>In any 3-post row, you will never see two identical archetypes adjacent to one another.</p>
              </div>

              <div class="logic-card">
                <div class="mono logic-num">02</div>
                <h4>The Restrained Red Rule</h4>
                <p>Consistent with the RUPTURE brand guidelines, Molten Crimson (#FF3344) is strictly restrained across the entire 15-post suite to exactly <strong>two strategic moments</strong>:</p>
                <ul>
                  <li><strong>Post 05 (Main Event Poster)</strong>: A razor-thin molten crimson caustic slit runs horizontally beneath the colossal "HYDRAULIC VOID" title, establishing the hero poster as the emotional epicenter of the entire campaign. In the 3-column grid, Post 05 sits dead-center in Row 4!</li>
                  <li><strong>Post 13 (Last Tickets)</strong>: An electric molten red indicator and status border signals capacity urgency without resorting to vulgar discount marketing graphics.</li>
                </ul>
                <p>Every other post strictly obeys the Pure Chrome, Liquid Slate, Icy Blue, Pale Cyan, and Lavender spectrum.</p>
              </div>

              <div class="logic-card">
                <div class="mono logic-num">03</div>
                <h4>Safe Zone & Dual-Crop Engineering</h4>
                <p>Instagram displays posts in <strong>1:1 square crop</strong> in the profile feed, but in <strong>4:5 portrait (1080×1350)</strong> when opened in the feed. Our layout system enforces a strict dual-zone geometry:</p>
                <ul>
                  <li><strong>Central Safe Zone (Y=135 to Y=1215)</strong>: 1080×1080 pixels. All primary headlines, event dates, artist lineups, manifesto texts, and central sculptural focal points are positioned securely inside this boundary. Nothing essential is ever cropped in the profile view.</li>
                  <li><strong>Outer Technical Margins (Y < 135 and Y > 1215)</strong>: Contains hairline registration marks, corner brackets, GPS coordinates, frequency identifiers, and technical archival stamps that reward the viewer when inspecting the post full-screen.</li>
                </ul>
              </div>

              <div class="logic-card">
                <div class="mono logic-num">04</div>
                <h4>Underground Copywriting Tone</h4>
                <p>The campaign deliberately excludes commercial nightlife clichés ("Get ready for an epic night!", "Don't miss out!"). Instead, the tone is confident, philosophical, and uncompromising:</p>
                <ul>
                  <li>Direct, declarative statements: <em>"We do not repeat. We do not conform."</em></li>
                  <li>Sonic precision: <em>"No shortcuts. No compromises. Just the sound."</em></li>
                  <li>Sacred dancefloor culture: <em>"Leave your ego outside. The dancefloor is a shared sanctuary."</em></li>
                  <li>Technical authority: <em>"Custom-tuned multi-point acoustic reinforcement down to 25 Hz."</em></li>
                </ul>
              </div>
            </div>
          </div>
        ` : ''}

      </div>
    `;

    // Bind event listeners
    bindEvents(el, posts);
  }

  function bindEvents(el, posts) {
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

    // Post inspection triggers
    el.querySelectorAll('[data-post-id]').forEach(card => {
      card.addEventListener('click', (e) => {
        // Prevent click if clicking an anchor link inside card
        if (e.target.tagName === 'A' && e.target.getAttribute('download') !== null) return;
        const id = card.dataset.postId;
        openModal(id, posts);
      });
    });
  }

  function openModal(id, posts) {
    const post = posts.find(p => p.id === id);
    if (!post) return;
    activePostId = id;

    const modal = document.getElementById('campaign-modal');
    if (!modal) return;

    modal.innerHTML = `
      <div class="campaign-modal-inner">
        <div class="modal-left">
          <div class="modal-image-stage ${showCropGuide ? 'show-crop-guide' : ''}">
            <img src="/campaign/posts/${post.fileStem}.jpg" alt="${esc(post.title)}" class="modal-full-img">
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
              <a href="/campaign/posts/${post.fileStem}.jpg" download="${post.fileStem}.jpg" class="btn small">Download JPG</a>
              <a href="/campaign/posts/${post.fileStem}.png" download="${post.fileStem}.png" class="btn small primary">Download PNG (1080×1350)</a>
            </div>
          </div>
        </div>

        <div class="modal-right">
          <div class="modal-header-row">
            <div>
              <span class="mono muted">${esc(post.phase)} · ${esc(post.timing)}</span>
              <h3>POST ${post.id} // ${esc(post.title)}</h3>
            </div>
            <button type="button" class="btn small close-modal-btn" aria-label="Close dialog">✕</button>
          </div>

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
      openModal(id, posts);
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

  return { render };
}
