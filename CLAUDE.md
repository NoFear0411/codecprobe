# CodecProbe - AI Assistant Guide

## Project Overview

CodecProbe is a browser-based codec testing tool for media server users. It tests codec support using three different browser APIs to reveal discrepancies between what browsers claim to support vs. actual hardware capabilities.

**Key constraint**: Zero runtime dependencies (UAParser.js v2.x bundled at build time).

## Architecture

### Module Structure (ES Modules)

```
js/
├── main.js              - Entry point, imports all modules, PWA install prompt
├── codec-database-v2.js - Normalized codec database (91 records, 13 groups)
├── device-detection.js  - UAParser.js v2.x integration (← drm-detection)
├── drm-detection.js     - DRM/EME system testing (leaf)
├── codec-tester.js      - Multi-API testing logic (← codec-database-v2)
├── ui-renderer.js       - Rendering, filtering, badges (← codec-database-v2, url-state, device-detection)
├── theme-manager.js     - Theme switching (leaf)
├── url-state.js         - URL state management (leaf)
└── vendor/
    └── ua-parser.min.js - Bundled UAParser.js v2.0.9 (35.3 KB, non-module global)
```

All JS files use ES module syntax (`import`/`export`). `index.html` loads ua-parser.min.js as a regular `defer` script (global), then `main.js` as `type="module"`. Eight `<link rel="modulepreload">` hints flatten the import chain so all modules download in parallel.

**Data flow**: main.js → detect device (async UAParser) → show iOS install hint if applicable → detect DRM → run tests → render results

### State Management

UI state lives in `ui-renderer.js` as a const object:
```javascript
const state = {
    currentFilter: 'all',
    testResults: null,
    searchQuery: ''
};
```

Test results structure:
```javascript
{
    supported: number,
    maybe: number,
    unsupported: number,
    tests: {
        [groupKey]: {
            category: string,
            codecs: Array<CodecResult>
        }
    }
}
```

### PWA Install

`main.js` handles two install paths:
- **Chrome/Edge (Android + desktop)**: Captures `beforeinstallprompt` event, shows an "Install" button in the header. Registered at module top-level (before `initialize()`) because the browser can fire the event early.
- **iOS/iPadOS (Safari)**: No `beforeinstallprompt` exists in WebKit. After `detectDeviceInfo()` resolves, checks `deviceInfo.iOS` (from UAParser.js — handles iPadOS-as-desktop) and shows a manual "Add to Home Screen" hint. Dismissible with localStorage persistence.

## Domain Knowledge

### The Three Decoder APIs

1. **canPlayType()** - Oldest API, returns "probably"/"maybe"/"". Least reliable.
2. **MediaSource.isTypeSupported()** - For MSE/streaming. More strict than canPlayType.
3. **mediaCapabilities.decodingInfo()** - Most accurate. Returns hardware capabilities.

**Visual API Badges**: Each API result shown with color-coded badge (1, 2, 3):
- Green = success/probably
- Yellow = maybe/partial
- Red = fail/unsupported (clean rejection)
- Purple = error (API threw exception or timed out)

This reveals API inconsistencies (e.g., Safari hiding DV in canPlayType).

### DRM/EME Testing

Two-tier architecture:
1. **Device-level** (`drm-detection.js`): `requestMediaKeySystemAccess()` at startup discovers available key systems
2. **Per-codec** (`codec-tester.js`): `decodingInfo()` + `keySystemConfiguration` tests each codec against device-confirmed systems only

Key systems tested:
- **Widevine** (com.widevine.alpha) - Google, Chrome/Android
- **PlayReady** (com.microsoft.playready) - Microsoft, Edge/Xbox
- **FairPlay** (com.apple.fps) - Apple, Safari/iOS
- **ClearKey** (org.w3.clearkey) - W3C standard

Per-codec DRM uses fMP4 container with `type: 'media-source'` and full scenario config (resolution, framerate, HDR). Returns `{ supported, smooth, powerEfficient }` plus resolved security level (L1/L3).

### Platform Quirks

**Safari/iOS**:
- Deliberately hides Dolby Vision in canPlayType() (returns "")
- iPad DV Profile 5 hardware exists but 500-nit displays can't do true PQ
- Green screen = IPT-PQ decoded as BT.2020
- Use mediaCapabilities for accurate HDR detection

**webOS (LG TVs)**:
- Race condition in Jellyfin app: getSupportedHdrProfiles() may return [] before Luna IPC completes
- webOS 25+ adds MKV DV support
- DTS detection logic changed in v25

**Android**:
- Highly fragmented
- Widevine L1 (hardware secure) or L3 (software) detected via EME API

**Browser Engines**:
- **Blink** (Chrome/Edge): Best overall codec support
- **WebKit** (Safari): Best HEVC/DV support, limited DTS
- **Gecko** (Firefox): Limited Dolby/DTS due to licensing

### Codec String Format

HEVC example: `video/mp4; codecs="hvc1.2.4.L153.B0"`
- hvc1 = HEVC in MP4
- 2 = Main 10 profile
- 4 = Main 10 tier
- L153 = Level 5.1 (4K)
- B0 = constraint flags

AV1 example: `video/mp4; codecs="av01.0.08M.10"`
- av01 = AV1
- 0 = Profile (Main)
- 08M = Level 4.0 Main tier
- 10 = 10-bit depth

### Streaming Formats

**HLS** (Apple HTTP Live Streaming):
- Uses fMP4 (fragmented MP4) containers
- `type: 'media-source'` for MSE testing
- Common codecs: HEVC (4K HDR), H.264 (baseline)

**DASH** (MPEG-DASH):
- Adaptive bitrate streaming
- Supports AV1, VP9, HEVC
- WebM and MP4 containers

**CMAF** (Common Media Application Format):
- Unified format for HLS and DASH
- ISO/IEC 23000-19 standard
- Low-latency streaming

## Code Style

**No AI slop**:
- No "comprehensive", "leverage", "ensure", "robust"
- No obvious comments like `// Create user`
- No generic variable names like `data`, `result`, `temp`
- Direct, specific code only

**Conventions**:
- 4-space indentation
- `const` for everything except actual mutations
- Template literals for HTML generation
- JSDoc only where it adds value (public APIs, complex logic)
- Async/await for asynchronous operations

## Common Tasks

### Adding a New Codec

All database mutations go through the CLI tool — never edit `codec-database-v2.js` directly.

```bash
# Validate the codec string first
python -m codec_resolve --decode "hvc1.2.4.L153.B0"

# Create a new record with its first scenario
node scripts/db-tool-v2.mjs create hvc1.2.4.L153.B0 \
  --name "HEVC Main 10 4K HDR10" \
  --sname "4K HDR10 24fps" \
  --width 3840 --height 2160 --fps 24 --bitrate 25000000 \
  --depth 10 --chroma 4:2:0 --transfer pq --gamut rec2020 --hdr hdr10

# Add more scenarios to an existing record
node scripts/db-tool-v2.mjs insert hvc1.2.4.L153.B0 scenario \
  --sname "4K HLG 60fps" \
  --width 3840 --height 2160 --fps 60 --bitrate 40000000 \
  --depth 10 --transfer hlg --gamut rec2020 --hdr hlg

# Verify after changes
node scripts/db-tool-v2.mjs verify
```

See `CONTRIBUTING.md` for full CLI reference.

### Modifying UI Layout

CSS lives in `scss/styles.scss` (compiled to `css/styles.css`). Uses CSS custom properties for theming:

```css
--bg: #0a0a0a       /* Background */
--card: #141414     /* Card background */
--accent: #00ff88   /* Primary accent (green) */
--blue: #00d4ff     /* Blue accent */
--yellow: #ffd700   /* Yellow (partial support) */
--red: #ff4444      /* Red (unsupported) */
```

Grid layout is auto-fit with min 500px columns. No media query breakpoints — only capability queries remain.

### Testing Changes

**With build step** (recommended for CSS changes):
```bash
npm run build        # Build CSS + bundle dependencies
npm run dev          # Start server + SCSS watcher
# Open http://localhost:8000
```

**Without build step** (JS changes only):
```bash
python -m http.server 8000
# Open http://localhost:8000
# Check browser console for errors
```

**Build process**:
- `npm run build:css` - Compile SCSS to CSS
- `npm run build:js` - Minify JS + bundle UAParser (`scripts/build.js`)
- `npm run build` - Both
- `npm run build:deploy` - Build + inject version hashes (`scripts/inject-versions.js`)

**Build scripts** live in `scripts/`:
- `scripts/build.js` - Terser minification, UAParser bundling, version manifest, SW cache version injection
- `scripts/inject-versions.js` - Appends `?v=hash` to asset references in HTML and ES module import paths in built JS

## Dependencies

**Runtime**: Zero external dependencies
- UAParser.js v2.x is bundled in `/js/vendor/` (AGPL-3.0 license, ~35.3 KB minified)
- Installed via npm as devDependency, bundled at build time to both `build/js/vendor/` and `js/vendor/`
- Uses advanced features: `withFeatureCheck()` (iPad detection) + `withClientHints()` (Chrome accuracy)
- No external network requests required

**Development**: sass, terser, ua-parser-js, npm-run-all (build tools only)

## License

CodecProbe is licensed under AGPL-3.0-or-later, matching UAParser.js v2.x (also AGPL-3.0). This means modifications must be shared under the same license, including network use (Section 13). UAParser is bundled at build time in `js/vendor/`.

## Security

**CSP** (via `<meta http-equiv="Content-Security-Policy">` in HTML):
- `default-src 'none'; script-src 'self' 'sha256-...'; style-src 'self' 'unsafe-inline'; img-src 'self'; manifest-src 'self'; worker-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'self'`
- `sha256` hash for the JSON-LD `<script>` is auto-injected by `scripts/inject-versions.js` at build time
- `frame-ancestors` not supported in meta CSP — `X-Frame-Options: DENY` in Cloudflare covers it
- `style-src 'unsafe-inline'` required — 14 inline style locations (1 HTML, 4 templates, 9 element.style in JS)

**Other headers** (Cloudflare Transform Rules):
- Permissions-Policy: camera, microphone, geolocation, payment, usb, accelerometer, gyroscope disabled. `encrypted-media` left at default (DRM detection needs it).
- X-Content-Type-Options: nosniff, X-Frame-Options: DENY, Referrer-Policy: strict-origin-when-cross-origin, COOP: same-origin
- COEP skipped (no SharedArrayBuffer benefit, fragile if external resources added)
- HSTS skipped (.dev preloaded, Cloudflare handles it)

**`_headers` file**: Cache-control rules + non-CSP security headers for CF Pages/Netlify portability. GitHub Pages ignores it.

**App-level**:
- All HTML template-generated from codec database (no user input)
- innerHTML usage safe (internal data only)
- Export creates client-side JSON blob
- No analytics, no external requests, no cookies
- UAParser.js bundled locally (no CDN)

## Performance

- 238 codecs tested in ~3-6 seconds
- mediaCapabilities tests are async (rate-limited by browser)
- Progressive rendering: PENDING cards appear instantly, update as tests complete
- UAParser.js detection is async (uses Client Hints API on Chromium)
- `<link rel="modulepreload">` for all 8 modules (flattens critical chain)
- `defer` on ua-parser vendor script (non-render-blocking)

## Service Worker

`sw.js` at root. Cache-first for static assets, network-first for navigation.
- `CACHE_VERSION` injected by build script from `package.json` version (e.g. `3.2.0`)
- Cache name: `codecprobe-v${CACHE_VERSION}` (was opaque timestamp before v3.2.0)
- `CORE_ASSETS` precaches all JS, CSS, icons, manifest
- `caches.match(request, { ignoreSearch: true })` — versioned URLs (`?v=hash`) match precached unversioned entries
- Old caches deleted on activate via prefix matching

## Version Management

`package.json` version is the single source of truth. Build pipeline propagates it:
1. `scripts/build.js` reads `pkg.version` → injects into `sw.js` CACHE_VERSION + `build/version-manifest.json`
2. `scripts/inject-versions.js` reads manifest → replaces `<span id="app-version">` + Schema.org `softwareVersion` in deploy HTML
3. File content hashes (`?v=abc123`) for cache-busting are separate and unchanged

## Known Issues

**Browser limitations we can't fix**:
- Safari DV hiding is intentional (privacy/DRM)
- webOS race condition is in Jellyfin app, not our tool
- Android fragmentation means results vary by device
- Firefox limited Dolby/DTS support (licensing)

**Intentional choices**:
- No result caching (tests are fast enough, fresh results every time)
- No Web Workers (tests don't block UI significantly)
- DRM tests via decodingInfo() + keySystemConfiguration (non-blocking with timeout)

## Themes

**3 themes available**:
1. **Dark OLED** (default): Pure blacks for OLED, battery-friendly
2. **Light**: High contrast light mode for daylight viewing
3. **Retro Terminal**: CRT aesthetics with scanlines and phosphor glow

**Brutalist theme removed** in v2.0.0 (hard to maintain, poor contrast).

Theme switching handled by `theme-manager.js` with localStorage persistence.

## CSS Pitfall: `hidden` attribute

Any element using the HTML `hidden` attribute must have `&[hidden] { display: none; }` in its SCSS if the base style sets `display: flex/block/grid/etc.` The user-agent stylesheet applies `display: none` without `!important`, so author CSS overrides it.

## Future Enhancements

Avoid over-engineering. Only add features if they solve real user problems:

- ✅ Search/filter (done)
- ✅ Keyboard shortcuts (done)
- ✅ URL state management (done)
- ✅ Dynamic API badges (done)
- ✅ UAParser v2.x integration (done)
- ✅ Progress indicator during testing (done)
- ✅ PWA service worker for offline use (done)
- ✅ PWA install prompt (done)
- ✅ Social preview / OG image (done)

## Documentation Standards

**README.md**: User-facing documentation
**docs/SETUP.md**: Deployment guide
**CLAUDE.md**: This file - for AI assistants working on the codebase
**CONTRIBUTING.md**: Contributor guidelines
**docs/BUILD.md**: Build system documentation
**CHANGELOG.md**: Version history

Keep docs focused and practical. No generic "best practices" sections.

## Tested Codecs Summary

**Video (149 tests)**: HEVC (25), Dolby Vision (33, P4/5/7/8.1/8.2/8.4/9/10 + supplemental), AV1 (26), VP9 (21), H.264/AVC (22), VVC/H.266 (8), VP8 (5), Legacy (9, MPEG-4 Part 2/H.263/Theora)
**Audio (89 tests)**: Dolby (18, AC-3/E-AC-3/TrueHD/AC-4/Atmos), DTS (15, Core/Express/HD/MA/Lossless/X), Lossless (27, FLAC/ALAC/Opus/PCM), Standard (25, AAC-LC/HE/xHE/ELD/LD/MP3/Vorbis), MPEG-H 3D Audio (4)
**Containers (17 MIME types)**: MP4, MKV, WebM, MOV, MPEG-TS, 3GP, OGG, fMP4, CMAF, FLAC, WAV, AIFF, AAC, MP3

**Total**: 238 codec/container combinations across 13 groups and 17 MIME types, validated against ISO/IEC/ITU/Apple/MPEG/DASH-IF specs.
