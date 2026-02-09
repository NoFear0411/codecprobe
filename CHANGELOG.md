# Changelog

All notable changes to CodecProbe will be documented in this file.

## [3.1.5] - 2026-02-10

### Changed

- **Card header compacted to 2 lines**: Status badge moved inline with codec name (right-aligned), summary and technical specs merged into a single line with `•` separators, container badge removed (already in name string), gear icon removed
- **Playback type in specs**: Cards now show `File` or `MSE` at the end of the specs line to indicate native vs streaming test mode
- **New favicon**: Play triangle + three result bars (green/yellow/red) replacing abstract vertical bars
- **PWA icons**: Added 192px, 512px, and 512px maskable PNGs for mobile install prompts and splash screens
- **Icons consolidated**: All icon files moved to `icons/` directory
- **Page load optimized**: `defer` on ua-parser.min.js, `modulepreload` hints for all 8 modules to flatten critical request chain (~450ms est. savings)
- **Contrast improved**: `--text-dimmed` bumped to pass WCAG AA 4.5:1 in dark OLED and retro terminal themes
- **Heading order fixed**: Footer headings changed from `h3` to `h2` for sequential descending order
- **theme-color aligned**: Meta tag and manifest both use `#0a0a0a`

### Removed

- `.platform-badge` — duplicate container info already present in codec name
- `.technical-specs` div and `⚙` gear icon — specs merged into summary line
- Version bump to 3.1.5

---

## [3.1.3] - 2026-02-09

### Fixed

- **Education overview font size**: Added `font-size: 0.85rem` to education panel paragraphs — was inheriting parent card size, now matches other secondary text
- **Removed stale comment**: Cleaned up redundant `// Ensure text wraps` comment in education paragraph styles

### Changed

- **README rewrite**: Streamlined project description, updated feature list and technical details
- Version bump to 3.1.3

---

## [3.1.2] - 2026-02-09

### Added

- **ExoPlayer/Media3 references**: 30 ExoPlayer DASH and HLS reference links added across all 25 streaming entries. DASH entries link to `developer.android.com/media/media3/exoplayer/dash`, HLS entries to `.../hls`, CMAF entries get both.

### Changed

- **Android platform notes updated**: 5 streaming entries updated with ExoPlayer/Media3 specifics — Widevine cenc (API 19+) / cbcs (API 25+) levels, DASH container support (fMP4, WebM, Matroska, no MPEG-TS), MediaCodecList API, c2.* vs OMX.* decoder prefix distinction, AV1 encoder mandatory from Android 14+.
- Reference count: 36 → 38 specifications

---

## [3.1.1] - 2026-02-09

### Fixed

- **MIME Type label wrapping**: Replaced `word-break: break-all` with `overflow-wrap: anywhere` on `.codec-string` and added `flex-shrink: 0` on the label — "MIME Type:" no longer breaks mid-word on narrow cards
- **Broken reference URLs**: LG webOS links updated from dead `supported-media-formats` to split pages (`video-audio-250`); Android links updated from `MediaCodec` API reference to `supported-formats` spec page. 52 references fixed across 26 education entries.

### Added

- **HEVC education content**: All 14 remaining HEVC entries now have codec string breakdowns, overviews, and spec references (23/23 complete)
- **2 niche Dolby Vision entries**: `dvc1.05.06` (deprecated FourCC) and `dvhp.05.06` (OMAF/VR) with full education content

### Changed

- **README overhaul**: Technical References table fixed (was broken markdown), Three Decoder APIs section reformatted as structured bullet lists, Contributing section expanded with database contribution call-to-action and issue link
- Updated reference titles: "webOS TV Developer Guide" → "webOS TV AV Formats", "Android MediaCodec Reference" → "Android Supported Media Formats"
- Test count: 254 → 256, education entries: 115 → 129

---

## [3.1.0] - 2026-02-09

### Added

- **Education references system**: Each education entry can now cite its sources via an `education.references` array. References render as compact pill-shaped chips below the education panel — linked titles open in a new tab, unlinked titles (paywalled ISO/ITU specs) render as plain text.
- **115 entries populated with spec references**: All existing education content now cites authoritative sources across 36 specifications from 6 standards bodies:
  - **ITU-T**: H.264, H.265, H.266
  - **ISO/IEC**: 14496-3 (AAC), 14496-15 (codec packaging), 23008-2 (HEVC), 23008-3 (MPEG-H), 23091-2 (AV1 registration), 23094-1 (VVC), 23000-19 (CMAF), 23009-1 (DASH), 13818-1 (MPEG-TS), 11172-3 (MP3)
  - **ETSI**: TS 102 114 (DTS), TS 102 366 (Dolby AC-3/E-AC-3), TS 103 572 (Dolby Vision)
  - **IETF**: RFC 6386 (VP8), RFC 6716 (Opus), RFC 8216 (HLS), RFC 9639 (FLAC)
  - **Industry**: AV1 Bitstream Spec, AV1 ISOBMFF Binding, VP9 Bitstream Spec, VP9 ISOBMFF Binding, Vorbis I Specification, DASH-IF IOP, Dolby Vision HLS/DASH specs
  - **Vendor**: Apple HLS Authoring Spec, webOS TV AV Formats, Android Supported Media Formats
- **Codec database ASCII table index**: Developer-facing TOC at the top of `codec-database.js` with box-drawing tables covering group index (test counts, line numbers, containers, education/platform coverage), codec variants tested, container coverage matrix, and referenced specifications by standards body. Stripped by Terser in production builds — zero runtime cost.

---

## [3.0.0] - 2026-02-09

### Changed

- **License: MIT → AGPL-3.0-or-later**. Protects the community-built codec database — modifications shared over a network must publish source under the same license. Aligns with bundled UAParser.js v2.x (also AGPL-3.0), resolving a compliance gap in v2.x where MIT + bundled AGPL was technically incorrect.

### Added

- **PWA service worker** (`sw.js`): Offline support via cache-first static assets, network-first navigation. All 14 core assets precached at install. Build system injects timestamp for cache versioning. `skipWaiting()` + `clients.claim()` for immediate activation (avoids stale SW on TV browsers).
- **Education content for 90 codec entries**: Codec string breakdowns, platform-specific notes (Apple cbcs, Dolby dvcC box, LG Luna IPC, Android ExoPlayer), streaming format details (HLS/DASH/CMAF). Covers HEVC, DV, AV1, VP9, AVC, VVC, VP8, legacy video, Dolby Audio, DTS, lossless, standard audio, MPEG-H, and 18 streaming entries.
- **CSS-only API details toggle**: Checkbox hack replaces JavaScript-driven expand/collapse for API detail rows. `attachApiToggleHandler()` stops event propagation to card handler.

### Fixed

- **Cross-platform UX**: Search bar sizing, touch/mobile interactions, safe area insets, custom scrollbar styling
- **Layout breakpoints removed**: All `@media 768px/480px` layout rules replaced by intrinsic CSS — only capability queries (`hover: hover`, `prefers-contrast`, `prefers-reduced-motion`) remain

---

## [2.3.0] - 2026-02-09

### Changed

- **Fluid responsive layout**: Replaced hardcoded `768px`/`480px` breakpoints with intrinsic CSS (`clamp()`, `min()`, `flex-wrap`, `auto-fit/minmax`)
  - Layout reflows based on available space, not device model
  - Body, canvas container, device header, controls, grid, footer all use fluid sizing
- **Theme switcher**: Removed `position: absolute` floating box with background/border — now inline flex row in header alongside title
  - Button sizes scale from 24px to 36px via `clamp(24px, 4vw, 36px)`
- **Controls section**: Search container uses `min(100%, 300px)` flex-basis (was `400px` — wider than phones)
  - Filter/action buttons: removed `min-width: 100px`, fluid padding/font-size/height via `clamp()`
  - Filter/action groups: `flex: 1 1 auto` lets them share rows or wrap naturally
- **Results grid**: Card minimum reduced from 500px to 400px — allows 2-column layout on tablets
- **Device header**: Flex row layout for h1 + theme switcher, subtitle drops to full width via `flex-basis: 100%`
- **Device info grid**: `minmax(min(100%, 180px), 1fr)` prevents overflow on narrow viewports (was `200px`)
- **Footer sections**: `flex: 1 1 min(100%, 250px)` prevents horizontal overflow

### Removed

- Layout rules from `@media (max-width: 768px)`: `flex-direction: column`, `grid-template-columns: 1fr`, `width: 100%` overrides — all handled by intrinsic sizing
- Layout rules from `@media (max-width: 480px)`: body padding, h1 font-size overrides — handled by `clamp()` in base styles
- Fixed `min-width: 250px` on search input, `min-width: 100px` on filter buttons
- Three nested `@media` blocks inside `_themes.scss` (theme switcher button sizes)

### Fixed

- **Touch device hover jank**: `.codec-item` hover transform wrapped in `@media (hover: hover)` — only fires with mouse/trackpad, not on touch screens

### Kept Unchanged

- `@media (max-width: 768px)` and `480px` API readability tweaks (font sizes, padding)
- webOS TV styles (`1280px–1920px`)
- `prefers-contrast: high` and `prefers-reduced-motion: reduce`

---

## [2.2.0] - 2026-02-09

### Changed

- **ES modules**: All JS files converted from global scripts to ES modules with `import`/`export`
  - `index.html` reduced from 8 `<script>` tags to 2 (vendor global + module entry point)
  - Explicit dependency graph replaces implicit global variable sharing
  - `url-state.js` circular dependency broken via callback parameter in `initURLState()`
- **Unified card rendering**: Single `createCardElement()` and `createDetailsHTML()` functions replace dual rendering paths
  - `createPendingCard()` (imperative DOM) and `renderResults()` (innerHTML templates) now produce identical card structure
  - `updateCardState()` uses same `createDetailsHTML()` for consistent details content
  - `attachCopyHandler()` extracted as shared utility
  - Cards from filter/search re-renders now have `data-group`, `data-name` attributes (were missing)
- **Production logging**: Terser changed from `drop_console: true` (strips ALL console methods) to `pure_funcs` targeting only `console.log`/`console.debug`
  - `console.warn` and `console.error` preserved in production builds
  - Dev logging reduced: removed step markers, per-batch progress, separator lines, debug dumps
- **Version injection**: `inject-versions.js` now versions ES module `import` paths in built JS files (cache busting for module dependencies)

### Fixed

- **Export button**: `exportResults()` was calling async `detectDeviceInfo()` without `await` (returned a Promise object instead of device info)

### Removed

- Dead code: `expandAllCards()`, `collapseAllCards()`, `expandCollapseState` (unused, `toggleAllCards()` handles both)
- `window.updateAllSectionCounts` global export (ES module export replaces it)
- ~200 lines of verbose console logging across 6 files

---

## [2.1.0] - 2026-02-09

### Changed

- **Support states reduced from 6 to 4**: SUPPORTED, PROBABLY, UNSUPPORTED, FAILED
  - Removed MAYBE (canPlayType "maybe" now counts as a pass in API consensus)
  - Removed ERROR (stuck PENDING cards marked FAILED instead)
- **Section counters**: "X full / Y partial" replaced with "X / Y supported" format
  - Shows testing progress: "3 supported (12 testing...)"
  - Shows failures: "3 / 30 supported (2 failed)"
- **Full-width layout**: Removed 1400px max-width, cards use full viewport
- **Theme switcher**: Moved from fixed viewport overlay to header top-right corner
- **Buttons enlarged**: 48px min-height, 0.95rem font for TV remote navigation
- **Footer redesigned**: Sections boxed with card styling, heading separators, unified 0.85rem text
- **DRM display**: Distinguishes "EME available, no key systems" from "EME not available"
- **Export JSON**: Uses `supported`/`unsupported`/`failed` counts (removed `maybe`)

### Added

- **API availability indicators**: Green/red dots in device header for each of the 3 APIs
- **Platform flags**: webOS, tvOS, iOS, Android shown in device info grid when detected
- **Spatial audio gating**: API 3b test only runs for E-AC-3, AC-4, DTS:X, MPEG-H 3D Audio
- **MPEG-TS audio guard**: mediaCapabilities skipped when audio contentType uses video/ MIME

### Fixed

- **Expand/Collapse button**: Was showing both states (wrong querySelector targeted icon span instead of .btn-text)
- **Card hover overlap**: Added z-index on hover to prevent visual overlap with adjacent cards
- **Console errors**: Eliminated "Invalid AudioConfiguration MIME type" for MPEG-TS audio entries
- **Counter duplication**: Consolidated updateSectionCounts/updateAllSectionCounts into single helper
- **Duplicate listener**: Removed expand/collapse handler in main.js (setupFilters already handles it)
- **Stuck card cleanup**: Simplified to mark FAILED without verbose DOM manipulation

### Removed

- `.MAYBE` CSS state styles (18 lines)
- `.ERROR` CSS state styles (26 lines)
- API YES/NO items from device info grid (replaced by availability dots)
- Redundant card state verification block in updateCardState

---

## [2.0.0] - 2026-02-08

### Added

- **Comprehensive Codec Database Expansion** (110+ total tests):
  - **NEW: Streaming Formats** (5 tests):
    - HLS fMP4: HEVC 4K HDR, H.264 1080p
    - CMAF: Common Media Application Format
    - DASH: AV1 4K HDR, VP9 4K HDR WebM
    - All use `type: 'media-source'` for proper MSE testing
  - **VVC/H.266** next-gen codec (2 tests)
  - **QuickTime/MOV containers**: HEVC, H.264, ALAC
  - **Dolby Vision Profile 10**: AV1-based Dolby Vision
  - **VP9 HLG**: HLG transfer function support
  - **H.264 variants**: Constrained Baseline (HLS), High 10 Profile
  - **Audio codecs**: xHE-AAC (USAC), Dolby Atmos JOC, native containers
  - **Native containers**: FLAC, AAC, OGG
  - Database size: 32.6 KB → 50.0 KB (+53% more tests)

- **UAParser.js v2.x Integration** for robust browser detection:
  - Advanced browser/OS/device detection with `withFeatureCheck()` and `withClientHints()`
  - **Rendering engine display**: Blink, WebKit, Gecko shown in header and device grid
  - **Device type classification**: Desktop, mobile, tablet
  - **CPU architecture detection**: x86, ARM, etc.
  - **iPad detection fix**: Correctly identifies iPadOS (was showing as macOS)
  - **Windows 10 vs 11**: Accurate OS version distinction
  - **Chrome Client Hints**: Better device info on Chromium browsers
  - Bundled to `js/vendor/ua-parser.min.js` (35.3 KB)

- **Dynamic API Badge Coloring**:
  - API badges (1, 2, 3, 3b) now color-coded by individual result
  - Green = success/probably, Yellow = maybe/partial, Red = fail/unsupported
  - New `getApiBadgeClass()` helper analyzes each API response separately
  - Visual clarity: instantly see which APIs report what for each codec
  - Reveals API inconsistencies (e.g., Safari hiding DV in canPlayType)

- **Educational Content System** (proof-of-concept with 3 codecs):
  - "Learn More" expandable sections on select codecs
  - Streaming format examples (HLS m3u8, DASH mpd)
  - Platform-specific initialization notes
  - Codec string breakdown and explanation
  - Currently covers: DV Profile 8.1, HEVC Main 10, HLS fMP4 HEVC

- **Cache Busting**:
  - MD5 hash versioning for all assets (10 files: 8 JS + 1 CSS + 1 vendor)
  - Version injection during build (`inject-versions.js`)
  - Assets load with `?v=abc123` query parameters
  - HTTP cache headers via `_headers` file (1 year assets, 0 HTML)
  - No hard refresh needed after updates
  - Cache hit rate: ~50% → ~95%

- **Batched Test Execution**:
  - Tests run in configurable batches (default: 10 per batch)
  - Parallel execution within batches (`Promise.all()`)
  - 50ms delay between batches
  - 110+ codec tests in 2-4 seconds (0-20% faster)
  - Progress callbacks for live UI updates
  - Configurable `BATCH_CONFIG` by device

- **Progressive UI Rendering**:
  - Cards appear in <100ms (was 2-5 seconds)
  - 95-98% faster first paint
  - Spinner animation in PENDING state
  - Live state transitions: PENDING → SUPPORTED/MAYBE/UNSUPPORTED
  - Section headers show "X full / Y partial (Z pending)"
  - Fade-in animation on state change
  - Search/filter work during testing
  - Cards clickable only after test completes

### Changed

- **Device info layout**: DRM/EME Support now inline with other capabilities (was full-width)
- **DRM display**: Shortened text ("Testing..." instead of "Testing (may take a few seconds...)")
- **Device detection**: Now async to support UAParser v2.x advanced features
- **Header display**: Shows "Browser Version • Engine • OS Version" format
- **Build process**:
  - Added UAParser.js bundling step
  - Added version manifest generation with MD5 hashing
  - Added automated HTML version injection
  - Two-step deployment: build → inject versions → deploy
- **Theme colors**: Improved contrast in all themes for platform badges
- **Test execution flow**: Changed from sequential to batched with progress callbacks
- **UI initialization**: Cards render immediately, then update progressively as tests complete

### Removed

- **Brutalist theme**: Removed entirely (hard to maintain, poor contrast)
- Remaining themes: Dark OLED (default), Light, Retro Terminal
- Cleaned up all brutalist-specific CSS overrides and JavaScript references

### Fixed

- **Educational content not showing**: `education` property now copied from codec definition to test result
- **UAParser warnings**: Added function existence checks for `withFeatureCheck()` and `withClientHints()`
- **DRM display**: Now shows "None" when no DRM systems supported (was blank)
- **Theme colors**: Platform badges readable across all themes
- **Brutalist theme removed**: Black-on-black text contrast issues eliminated
- **API badges**: Color-coded by individual result (was always green)
- **DRM layout**: Inline grid item instead of full-width

### Technical

- Updated `package.json` with `ua-parser-js@^2.0.9` dependency and `build:deploy` script
- Updated `build.js`:
  - Bundle UAParser.js to vendor directory
  - Generate version manifest with MD5 hashes (10 files)
  - `generateFileHash()` and `generateVersionManifest()` functions
- Created `inject-versions.js`: Automated version parameter injection into HTML
- Created `_headers`: HTTP cache-control directives for GitHub Pages/Cloudflare
- Updated `.github/workflows/deploy.yml`: Added version injection step before deployment
- Updated `js/codec-tester.js`:
  - Added `BATCH_CONFIG` for configurable batch execution
  - Refactored `runCodecTests()` to support batching and progress callbacks
  - Flattened codec list for efficient parallel processing
- Updated `js/ui-renderer.js`:
  - Added `renderPendingCards()`: Instant card rendering in PENDING state
  - Added `createPendingCard()`: Single card creation with spinner
  - Added `updateCardState()`: Progressive card updates as tests complete
  - Added `updateSectionCounts()`: Live section header count updates
- Updated `js/main.js`: Changed initialization to use progressive rendering flow
- Updated `scss/styles.scss`:
  - Added `.PENDING` state with loading spinner animation
  - Added `@keyframes spin` for spinner rotation
  - Added `@keyframes cardUpdate` for smooth state transitions
  - Added `.pending-count` for section header styling
- Updated `index.html` to load UAParser.js before device detection
- Converted `detectDeviceInfo()` to async function
- All codecs validated against ISO/IEC/ITU/Apple/MPEG/DASH-IF specifications
- Build output: 134.2 KB source → 73.9 KB minified (44.9% smaller) + 35.3 KB UAParser
- Deployment output: `deploy/index.html` with versioned asset references

---

## [1.2.0] - 2026-02-08

### Added
- **Production Build System**:
  - Automated console.log stripping for production deploys
  - Build size reporting in GitHub Actions
  - Conditional SCSS compilation (only rebuilds if SCSS changed)
  - .nojekyll file for faster GitHub Pages deployment
  - Deployment status badge in README
  - Node.js 24.13.0 (latest stable) in CI/CD
- **Visual Affordance**:
  - Chevron icons on codec cards (rotate on expand)
  - Enhanced hover effects (lift + shadow)
  - "Click for details" hint animation on first card
  - Smooth cubic-bezier transitions
- **URL State Management**:
  - Hash-based routing (#filter=video&search=hevc)
  - Shareable links to specific filter/search states
  - Browser back/forward support
  - URL updates automatically with state changes
- **Copy & Share Features**:
  - Copy button for MIME type strings
  - Copy full codec result as JSON
  - Visual feedback (checkmark animation)
  - Clipboard API integration
- **Bulk Actions**:
  - Expand All / Collapse All toggle button
  - Keyboard shortcut (Ctrl+E)
  - Staggered animation support
- **Accessibility Improvements**:
  - ARIA live region for screen reader announcements
  - Expansion state announcements
  - Test completion announcements
  - .sr-only utility class

### Changed
- Build process now deploys optimized JS (console.logs removed)
- Card interactions more discoverable with visual cues
- Better keyboard navigation with shortcuts documented

---

## [1.1.0] - 2026-02-08

### Added
- **Multi-Theme System** - 4 distinctive themes with instant switching
  - Dark OLED: Pure blacks for OLED displays (default)
  - Light: Professional light mode with high contrast
  - Brutalist: Raw, utilitarian design (REMOVED in v2.0.0)
  - Retro Terminal: Vintage computer aesthetic with CRT scanlines
  - Theme switcher UI with visual previews
  - LocalStorage persistence for theme preference
  - Smooth theme transitions
- **SCSS Build System** - Modern SCSS with variables, mixins
  - Responsive design with clamp() for fluid typography
  - TV-optimized UI (48px-56px touch targets, 18px base text)
  - Collapsible device info
  - Better visual hierarchy ($spacing-xs through $spacing-xl)
- **TV Browser Support**:
  - DRM detection timeout handling (3s per system, 8s overall)
  - Non-blocking DRM tests
  - Keyboard/remote control navigation
  - 3px focus outlines for TV remote navigation
- **Platform-Agnostic Logging**: Clean debug output with prefixes
- **DRM/EME Testing**:
  - Widevine, PlayReady, FairPlay, ClearKey
  - Security level (L1/L3), robustness, persistent state
- Search functionality with keyboard shortcuts (/, Esc)
- PWA support with manifest.json
- Favicon (SVG format)
- Accessibility improvements (ARIA, skip links, high contrast, reduced motion)
- SEO improvements (Open Graph, Twitter Card, Schema.org)
- GitHub Actions workflow with SCSS compilation
- Documentation: BUILD.md, CLAUDE.md, CONTRIBUTING.md, CHANGELOG.md

### Changed
- **Compact layout**: Reduced spacing by ~20%
- Improved state management in ui-renderer.js
- Removed AI slop from documentation
- Filter logic supports category and text search
- Grid layout uses `minmax(min(100%, 500px), 1fr)`
- All interactive buttons support keyboard navigation
- GitHub Actions compiles SCSS before deployment

### Fixed
- Variable scoping issues in ui-renderer.js
- Codec card overflow on TV browsers
- Button interaction with TV remote controls
- DRM detection timeout handling
- Focus styles for TV navigation

---

## [1.0.0] - Initial Release

### Added
- Multi-API codec testing (canPlayType, isTypeSupported, mediaCapabilities)
- 80+ codec test combinations
- Device detection and fingerprinting
- Export results as JSON
- Filter by codec type and support level
- Dark theme UI
- Zero dependencies (runtime)
