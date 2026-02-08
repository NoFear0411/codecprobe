# CodecProbe - AI Assistant Guide

## Project Overview

CodecProbe is a browser-based codec testing tool for media server users. It tests codec support using three different browser APIs to reveal discrepancies between what browsers claim to support vs. actual hardware capabilities.

**Key constraint**: Zero runtime dependencies (UAParser.js v2.x bundled at build time).

## Architecture

### Module Structure

```
js/
├── codec-database.js    - 254 codec test definitions (all ISO/Apple/LG/HLS/DASH formats)
├── device-detection.js  - UAParser.js v2.x integration (async)
├── drm-detection.js     - DRM/EME system testing
├── codec-tester.js      - Multi-API testing logic
├── ui-renderer.js       - Results display, filtering, dynamic API badges
├── theme-manager.js     - Theme switching (3 themes)
├── url-state.js         - URL state management
├── main.js              - Initialization orchestrator (async)
└── vendor/
    └── ua-parser.min.js - Bundled UAParser.js v2.0.9 (35.3 KB)
```

**Data flow**: main.js → detect device (async UAParser) → detect DRM → run tests → render results

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

## Domain Knowledge

### The Three Decoder APIs

1. **canPlayType()** - Oldest API, returns "probably"/"maybe"/"". Least reliable.
2. **MediaSource.isTypeSupported()** - For MSE/streaming. More strict than canPlayType.
3. **mediaCapabilities.decodingInfo()** - Most accurate. Returns hardware capabilities.

**Visual API Badges**: Each API result shown with color-coded badge (1, 2, 3):
- Green = success/probably
- Yellow = maybe/partial
- Red = fail/unsupported

This reveals API inconsistencies (e.g., Safari hiding DV in canPlayType).

### DRM/EME Testing

Tests **requestMediaKeySystemAccess()** for encrypted content support:
- **Widevine** (com.widevine.alpha) - Google, Chrome/Android
- **PlayReady** (com.microsoft.playready) - Microsoft, Edge/Xbox
- **FairPlay** (com.apple.fps) - Apple, Safari/iOS
- **ClearKey** (org.w3.clearkey) - W3C standard

Returns security level (L1/L3), robustness, persistent state support.

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

Edit `js/codec-database.js`:

```javascript
video_newcodec: {
    category: "Codec Name",
    tests: [
        {
            name: "Variant Name",
            codec: 'video/mp4; codecs="codec-string"',
            container: "MP4",
            info: "Brief description",
            mediaConfig: {
                type: 'file',  // or 'media-source' for streaming
                video: {
                    contentType: 'video/mp4; codecs="codec-string"',
                    width: 3840,
                    height: 2160,
                    bitrate: 25000000,
                    framerate: 24,
                    transferFunction: 'pq',  // optional: pq, hlg
                    colorGamut: 'rec2020'     // optional: rec2020, p3
                }
            }
        }
    ]
}
```

**For streaming formats**, use `type: 'media-source'` instead of `'file'`.
**For audio codecs**, `spatialRendering` is tested automatically in codec-tester.js.

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

Grid layout is auto-fit with min 500px columns. Responsive breakpoints at 768px and 480px.

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
- `npm run build:js` - Minify JS + bundle UAParser
- `npm run build` - Both

## Dependencies

**Runtime**: Zero external dependencies
- UAParser.js v2.x is bundled in `/js/vendor/` (AGPL-3.0 license, ~35.3 KB minified)
- Installed via npm, bundled at build time
- Uses advanced features: `withFeatureCheck()` (iPad detection) + `withClientHints()` (Chrome accuracy)
- No external network requests required

**Development**: sass, terser, ua-parser-js (build tools only)

## License Note

CodecProbe uses UAParser.js v2.x (AGPL-3.0). Since CodecProbe is open-source (MIT), this is fully compliant. UAParser is bundled at build time and included in the repo.

## Security Notes

- All HTML is template-generated from codec database (no user input)
- innerHTML usage is safe (internal data only)
- Export function creates client-side JSON blob
- No analytics, no external requests, no cookies
- UAParser.js bundled locally (no CDN)

## Performance

- 254 codecs tested in ~3-6 seconds
- mediaCapabilities tests are async (rate-limited by browser)
- Results render once all tests complete (no progressive rendering)
- UAParser.js detection is async (uses Client Hints API on Chromium)

## Known Issues

**Browser limitations we can't fix**:
- Safari DV hiding is intentional (privacy/DRM)
- webOS race condition is in Jellyfin app, not our tool
- Android fragmentation means results vary by device
- Firefox limited Dolby/DTS support (licensing)

**Intentional choices**:
- No service worker yet (planned for offline support)
- No result caching (tests are fast enough)
- No Web Workers (tests don't block UI significantly)
- DRM tests inline (non-blocking with timeout)

## Themes

**3 themes available**:
1. **Dark OLED** (default): Pure blacks for OLED, battery-friendly
2. **Light**: High contrast light mode for daylight viewing
3. **Retro Terminal**: CRT aesthetics with scanlines and phosphor glow

**Brutalist theme removed** in v2.0.0 (hard to maintain, poor contrast).

Theme switching handled by `theme-manager.js` with localStorage persistence.

## Future Enhancements

Avoid over-engineering. Only add features if they solve real user problems:

- ✅ Search/filter (done)
- ✅ Keyboard shortcuts (done)
- ✅ URL state management (done)
- ✅ Dynamic API badges (done)
- ✅ UAParser v2.x integration (done)
- ⏳ PWA service worker for offline use
- ⏳ Result caching in localStorage
- ⏳ Progress indicator during testing

## Documentation Standards

**README.md**: User-facing documentation
**SETUP.md**: Deployment guide
**CLAUDE.md**: This file - for AI assistants working on the codebase
**CONTRIBUTING.md**: Contributor guidelines
**BUILD.md**: Build system documentation
**CHANGELOG.md**: Version history

Keep docs focused and practical. No generic "best practices" sections.

## Tested Codecs Summary

**Video (142 tests)**: HEVC, Dolby Vision (P4/5/7/8.1/8.2/8.4/9/10 + supplemental), AV1, VP9, H.264/AVC, VVC/H.266, VP8, MPEG-4 Part 2, H.263, Theora
**Audio (87 tests)**: Dolby (AC-3/E-AC-3/TrueHD/AC-4/Atmos), DTS (Core/Express/HD/MA/Lossless/X), lossless (FLAC/ALAC/Opus/PCM), standard (AAC-LC/HE/xHE/ELD/LD/MP3/Vorbis), MPEG-H 3D Audio
**Containers (17 MIME types)**: MP4, MKV, WebM, MOV, MPEG-TS, 3GP, OGG, fMP4, CMAF, FLAC, WAV, AIFF, AAC, MP3
**Streaming (25 tests)**: HLS fMP4, DASH, CMAF, MPEG-TS

**Total**: 254 codec/container combinations across 14 groups and 17 MIME types, validated against ISO/IEC/ITU/Apple/MPEG/DASH-IF specs.
