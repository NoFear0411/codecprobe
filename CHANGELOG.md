# Changelog

All notable changes to CodecProbe will be documented in this file.

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
