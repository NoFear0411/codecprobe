# CodecProbe - AI Assistant Guide

## Project Overview

CodecProbe is a browser-based codec testing tool for media server users. It tests codec support using three different browser APIs to reveal discrepancies between what browsers claim to support vs. actual hardware capabilities.

**Key constraint**: Zero dependencies. Everything is vanilla JS/CSS/HTML.

## Architecture

### Module Structure

```
js/
├── codec-database.js    - 80+ codec test definitions
├── device-detection.js  - Browser/OS/hardware detection
├── drm-detection.js     - DRM/EME system testing
├── codec-tester.js      - Multi-API testing logic
├── ui-renderer.js       - Results display & filtering
└── main.js             - Initialization orchestrator
```

**Data flow**: main.js → detect device (with DRM) → run tests → render results

### State Management

UI state lives in `ui-renderer.js` as a const object:
```javascript
const state = {
    currentFilter: 'all',
    testResults: null,
    searchQuery: ''
};
```

Test results follow this structure:
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

**webOS (LG TVs)**:
- Race condition in Jellyfin app: getSupportedHdrProfiles() may return [] before Luna IPC completes
- webOS 25+ adds MKV DV support
- DTS detection logic changed in v25

**Android**:
- Highly fragmented
- Widevine L1 (hardware secure) or L3 (software) detected via EME API

### Codec String Format

HEVC example: `video/mp4; codecs="hvc1.2.4.L153.B0"`
- hvc1 = HEVC in MP4
- 2 = Main 10 profile
- 4 = Main 10 tier
- L153 = Level 5.1 (4K)
- B0 = constraint flags

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
                type: 'file',
                video: {
                    contentType: 'video/mp4; codecs="codec-string"',
                    width: 3840,
                    height: 2160,
                    bitrate: 25000000,
                    framerate: 24,
                    transferFunction: 'pq',  // optional: for HDR
                    colorGamut: 'rec2020'     // optional: for HDR
                }
            }
        }
    ]
}
```

For audio codecs, add `spatialRendering` tests (tested automatically in codec-tester.js).

### Modifying UI Layout

CSS lives in `css/styles.css`. Uses CSS custom properties for theming:

```css
--bg: #0a0a0a       /* Background */
--card: #141414     /* Card background */
--accent: #ff0080   /* Primary accent */
--green: #00ff88    /* Success states */
```

Grid layout is auto-fit with min 450px columns. Responsive breakpoints at 768px and 480px.

### Testing Changes

```bash
python -m http.server 8000
# Open http://localhost:8000
# Check browser console for errors
```

No build step. Changes are live on reload.

## Security Notes

- All HTML is template-generated from codec database (no user input)
- innerHTML usage is safe (internal data only)
- Export function creates client-side JSON blob
- No analytics, no external requests, no cookies

## Performance

- 80+ codecs tested in ~2-5 seconds
- mediaCapabilities tests are async (rate-limited by browser)
- Results render once all tests complete (no progressive rendering)

## Known Issues

**Browser limitations we can't fix**:
- Safari DV hiding is intentional (privacy/DRM)
- webOS race condition is in Jellyfin app, not our tool
- Android fragmentation means results vary by device

**Intentional choices**:
- No service worker yet (future enhancement)
- No result caching (tests are fast enough)
- No Web Workers (tests don't block UI significantly)

## Future Enhancements

Avoid over-engineering. Only add features if they solve real user problems:

- ✅ Search/filter (done)
- ✅ Keyboard shortcuts (done)
- ⏳ PWA service worker for offline use
- ⏳ Result caching in localStorage
- ⏳ Shareable result URLs
- ⏳ Progress indicator during testing

## Documentation Standards

**README.md**: User-facing documentation
**SETUP.md**: Deployment guide
**CLAUDE.md**: This file - for AI assistants working on the codebase
**CONTRIBUTING.md**: Contributor guidelines

Keep docs focused and practical. No generic "best practices" sections.
