# CodecProbe

**Multi-API codec testing for media server enthusiasts**

Ever wonder why Dolby Vision doesn't work on your LG TV through Jellyfin? Or why your iPad shows a green screen when playing certain files? CodecProbe reveals exactly what your browser can actually decode using three different browser APIs.

Built after discovering race conditions in webOS Jellyfin apps and Safari's deliberately hidden Dolby Vision support.

🔗 **[Live Demo](https://codecprobe.dev)**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![JavaScript](https://img.shields.io/badge/javascript-ES6+-yellow.svg)
![Dependencies](https://img.shields.io/badge/runtime-zero--deps-green.svg)
![Deploy Status](https://github.com/nofear0411/codecprobe/actions/workflows/deploy.yml/badge.svg)

---

## Why This Exists

Browser codec detection is a mess:
- `canPlayType()` returns "maybe" for everything
- Safari deliberately hides Dolby Vision support
- webOS apps have race conditions that break capability detection
- `mediaCapabilities` exists but nobody uses it

CodecProbe tests **all three APIs** side-by-side so you can see what your device *actually* supports, not what browsers claim to support.

## Real World Issues This Catches

### webOS (LG TVs) - Race Condition Bug
The Jellyfin webOS app has an async race condition where `getSupportedHdrProfiles()` returns an empty array because the Luna IPC call to `getHdrCapabilities` hasn't completed yet. This causes Dolby Vision to randomly work/fail.

**CodecProbe shows**: `mediaCapabilities` accurately reflects hardware state while `canPlayType()` returns inconsistent results.

### iOS/Safari - Deliberately Hidden DV Support
Safari's `canPlayType()` **always** returns `""` for Dolby Vision codecs, even on A11+ chips with DV hardware. This is intentional (privacy/DRM reasons).

**CodecProbe shows**: `mediaCapabilities` with `transferFunction: 'pq'` reveals actual PQ/HDR support.

### iPad Green Screen Issue
iPad A16 has DV Profile 5 hardware but a 500-nit display that can't do true PQ HDR. When servers send HEVC with DV RPU NALUs but no proper signaling, VideoToolbox decodes IPT-PQ colorspace as BT.2020 → green tint.

**CodecProbe shows**: `transferFunction: 'pq'` returns `supported: false` on 500-nit displays, revealing why.

### DTS on webOS 25
webOS changed DTS detection in v25. The `canPlayDts()` check stops at `< 23`, causing false negatives.

**CodecProbe shows**: All three APIs + container variants for complete picture.

## Features

### 🎯 Multi-API Testing
CodecProbe goes beyond basic codec detection:

**Decoder Testing (3 APIs)**:
- **canPlayType()** - What browsers claim to support
- **isTypeSupported()** - What Media Source Extensions supports
- **mediaCapabilities** - What hardware can *actually* decode smoothly

**Visual API State Indicators**:
- **Color-coded badges** (1, 2, 3) - Green=success, Yellow=partial, Red=fail
- Each API result shown separately to reveal inconsistencies
- Instantly see which APIs report what for each codec

**DRM/EME Testing**:
- **Widevine** - Google DRM (Chrome/Android)
- **PlayReady** - Microsoft DRM (Edge/Xbox)
- **FairPlay** - Apple DRM (Safari/iOS)
- **Security levels** - Hardware (L1) vs Software (L3)
- **Persistent state** - Offline playback capability

Complete picture: decoder capability + DRM support for every platform.

### 📊 Comprehensive Codec Coverage

**110+ codec/container combinations** tested across:
- **Video codecs**: HEVC, Dolby Vision, AV1, VP9, H.264/AVC, VVC/H.266
- **Audio codecs**: Dolby (AC-3/E-AC-3/TrueHD/AC-4/Atmos), DTS family, lossless, standard
- **Containers**: MP4, MKV, WebM, MOV, fMP4, CMAF, native formats
- **Streaming formats**: HLS, DASH, CMAF for adaptive streaming
- **Transfer functions**: Separate tests for PQ, HLG (reveals HDR capability)

### 🎬 Streaming Format Support

**NEW in v2.0**: Full HLS/DASH/CMAF testing
- **HLS fMP4**: Apple HTTP Live Streaming with fragmented MP4
- **DASH**: MPEG-DASH for adaptive bitrate streaming
- **CMAF**: Common Media Application Format (unified HLS/DASH)
- Tests `type: 'media-source'` for proper MSE compatibility
- Critical for Jellyfin/Plex/Emby streaming workflows

### 🔍 Advanced Browser Detection

**UAParser.js v2.x integration** provides:
- **Rendering engine** detection (Blink, WebKit, Gecko)
- **Device type** classification (desktop, mobile, tablet)
- **CPU architecture** detection (x86, ARM, etc.)
- **Advanced features**: iPad detection fix, Chrome Client Hints API
- Accurate Windows 10 vs 11 distinction
- Consistent version formatting across all browsers

### 💾 Debug-Ready Export
- Export complete results as JSON with device fingerprint
- Perfect for Jellyfin/Plex/Emby bug reports
- Share capability matrix across your device fleet
- Includes user agent, OS version, hardware specs, rendering engine

### 🎨 Modern UI with Multi-Theme System
- **3 distinctive themes** - Dark OLED (default), Light, Retro Terminal
- Instant theme switching with localStorage persistence
- Responsive design (mobile/tablet/desktop/TV)
- **webOS TV optimized** - Larger touch targets, 18px base font for TV viewing distance
- Filter by support level, type, or search by name
- Keyboard shortcuts (/ for search, Ctrl+E for expand all, Esc to clear)
- Full accessibility (ARIA labels, skip links, reduced motion)
- Built with modern SCSS (compiles to vanilla CSS)

### ⚡ Performance

**NEW in v2.0**: Fast loading and automatic cache invalidation

**Progressive UI**:
- Cards appear in <100ms (was 2-5 seconds)
- PENDING state shows spinner while testing
- Updates live as each test completes
- Search/filter work during testing

**Batched Execution**:
- Tests run 10 codecs at a time in parallel
- 110+ codecs tested in 2-4 seconds
- Configurable batch size

**Cache Busting**:
- Content-hash versioning on all assets (`?v=abc123`)
- No hard refresh needed after updates
- Assets cached 1 year, HTML never cached
- 95% cache hit rate

## Tested Codecs

### Video Codecs (50+ tests)
- **HEVC/H.265**: Main, Main 10 (HDR10, HLG), 4K @ 60fps, 8K Level 6.1
- **Dolby Vision**: Profiles 5, 7, 8.1, 8.4, 10 (AV1-based) - all major variants
- **AV1**: Main Profile (SDR/HDR10), High Profile, Film Grain, 8K support
- **VP9**: Profile 0 (SDR), Profile 2 (HDR10/HLG)
- **AVC/H.264**: Baseline, Main, High, High 10, Constrained Baseline
- **VVC/H.266**: Main 10 (next-gen codec)

### Streaming Formats (5 tests)
- **HLS**: fMP4 HEVC (4K HDR), fMP4 H.264 (1080p)
- **CMAF**: Common Media Application Format with HEVC
- **DASH**: AV1 (4K HDR), VP9 (4K HDR WebM)

### Audio Codecs (55+ tests)
- **Dolby**: AC-3, E-AC-3/Atmos, TrueHD, AC-4, Atmos JOC
- **DTS**: Core, Express, HD High-Res, HD Master Audio, DTS:X (Profile 2)
- **Lossless**: FLAC (MKV/MP4/native), ALAC (MP4/MOV), Opus (WebM/MKV/MP4), PCM
- **Standard**: AAC-LC/HE/HEv2/xHE-AAC, MP3, Vorbis (WebM/MKV/OGG)

### Container Coverage
- **ISO BMFF**: MP4, fMP4, CMAF (Common Media Application Format)
- **Matroska**: MKV, WebM
- **Apple**: QuickTime/MOV (macOS/iOS optimized)
- **Native**: FLAC, AAC, MP3, WAV, OGG

## Usage

### Quick Start
1. Open `index.html` in any modern browser
2. Wait for automatic testing to complete (~2-5 seconds)
3. View results organized by codec category
4. Click any codec card to see detailed API results
5. Use filters to narrow results
6. Export to JSON for sharing

### For GitHub Pages
1. Fork this repository
2. Enable GitHub Pages in repository settings
3. Select `main` branch as source
4. GitHub Actions will automatically build and deploy
5. Access at `https://YOUR_USERNAME.github.io/codecprobe/`

### Local Development
```bash
git clone https://github.com/nofear0411/codecprobe.git
cd codecprobe
npm install          # Install SCSS compiler + dev tools
npm run build        # Build CSS and bundle dependencies
npm run dev          # Start dev server + SCSS watcher
# Open http://localhost:8000
```

**Without building:**
```bash
python -m http.server 8000  # Uses pre-compiled CSS
```

## Project Structure

```
codecprobe/
├── index.html                 # Main HTML file
├── css/
│   └── styles.css            # Compiled CSS (all themes)
├── scss/
│   ├── styles.scss           # Main SCSS file
│   └── _themes.scss          # Theme definitions
├── js/
│   ├── codec-database.js     # 110+ codec specifications
│   ├── device-detection.js   # UAParser.js v2.x integration
│   ├── drm-detection.js      # DRM/EME testing
│   ├── codec-tester.js       # Multi-API testing logic
│   ├── ui-renderer.js        # Results display
│   ├── theme-manager.js      # Theme switching
│   ├── url-state.js          # URL state management
│   ├── main.js               # Initialization
│   └── vendor/
│       └── ua-parser.min.js  # Bundled UAParser.js v2.x
├── docs/
│   └── apple.md              # Apple-specific codec notes
├── BUILD.md                   # Build instructions
├── CLAUDE.md                  # AI assistant context
└── README.md                  # This file
```

## API Methods Explained

### 1. HTMLMediaElement.canPlayType()
- **Most widely supported** API
- Returns: `"probably"`, `"maybe"`, or `""` (unsupported)
- Based on codec string parsing
- May not reflect actual hardware capabilities

### 2. MediaSource.isTypeSupported()
- Tests **Media Source Extensions** support
- Returns: `true` or `false`
- Used for adaptive streaming (HLS, DASH)
- More strict than `canPlayType()`

### 3. navigator.mediaCapabilities.decodingInfo()
- **Most detailed** API
- Returns detailed capability object:
  - `supported`: Can decode the media
  - `smooth`: Can play back smoothly
  - `powerEfficient`: Hardware-accelerated
- For audio: tested with and without `spatialRendering: true`

## Understanding Results

### Support Levels
- **SUPPORTED** (Green): Full native support confirmed
- **MAYBE** (Yellow): Partial support or uncertain
- **UNSUPPORTED** (Gray): Not supported

### API Badge Colors
- **Green (1, 2, 3)**: API reports success/probably
- **Yellow**: API reports partial/maybe support
- **Red**: API reports failure/unsupported
- **Each badge independent**: Reveals API inconsistencies

### Container Significance
Many codecs show different support across containers:
- **MP4**: Broadest compatibility, streaming standard
- **MKV**: High-quality remux, less browser support
- **WebM**: Open format, Chrome/Firefox preferred
- **MOV**: Apple QuickTime, Safari/macOS optimized
- **fMP4/CMAF**: Streaming formats for HLS/DASH

### Platform-Specific Notes

#### webOS (LG TVs)
- Excellent Dolby Vision Profile 8.1 support (webOS 6+)
- **webOS 25+**: MKV Dolby Vision support added
- Native DTS-HD passthrough
- Race condition: DV may report incorrectly on first load

#### iOS/Safari
- Dolby Vision Profile 5 hardware on A11+ chips
- `canPlayType()` **never reports** DV support (API limitation)
- 500-nit displays tone-map HDR
- Requires `VIDEO-RANGE=PQ` in HLS for DV
- Use `mediaCapabilities` for accurate detection

#### Android
- Highly fragmented support
- Dolby Vision varies by manufacturer
- Shows Widevine L1 (hardware) or L3 (software) capability

#### Desktop Browsers
- **Chrome/Edge**: Blink engine, excellent codec support
- **Firefox**: Gecko engine, limited Dolby/DTS (licensing)
- **Safari**: WebKit engine, best HEVC/DV support

## Use Cases

### For Jellyfin/Plex/Emby Users
1. **Debug playback issues**: "Why won't Dolby Vision work on my LG TV?"
2. **Configure transcoding**: Know exactly what needs transcoding vs direct play
3. **Client profiles**: Build accurate device profiles for your server
4. **Validate setup**: Confirm your HDR/Atmos passthrough actually works

### For Developers
1. **Bug reports**: Attach JSON export showing exact codec support state
2. **CI testing**: Automate codec capability detection across browsers
3. **Feature detection**: Don't guess - know what users' devices support
4. **Compatibility matrices**: Build device databases for QA

### For Content Creators
1. **Encode validation**: Verify target devices can play your encode settings
2. **Format decisions**: See which codecs have widest support
3. **ABR ladder**: Test which profiles browsers can smoothly decode

## Contributing

Pull requests welcome! Especially for:

- **New codecs**: Add to `js/codec-database.js`
- **Platform quirks**: Document in README
- **Bug fixes**: Race conditions, edge cases
- **UI improvements**: Make it better while keeping it fast

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Support & Community

- 🐛 [Report issues](https://github.com/nofear0411/codecprobe/issues)
- 💡 [Request features](https://github.com/nofear0411/codecprobe/issues)
- 💬 [Discussions](https://github.com/nofear0411/codecprobe/discussions)

**Found this useful?** Star the repo and share with your media server community!

---

## Adding New Codecs

Edit `js/codec-database.js`:

```javascript
video_new_codec: {
    category: "New Codec Family",
    tests: [
        {
            name: "Codec Variant Name",
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
                    colorGamut: 'rec2020'    // optional: rec2020, p3
                }
            }
        }
    ]
}
```

For streaming formats, use `type: 'media-source'` to test MSE compatibility.

## Known Issues

### Browser Limitations
- **Safari**: Deliberately hides DV support in `canPlayType()` for privacy
- **Firefox**: Limited Dolby/DTS support due to licensing
- **Chrome**: MSE codec support differs from `<video>` tag

### Platform Quirks
- **webOS**: Async race condition can cause false negatives
- **iOS**: Hardware capabilities don't match API responses
- **Android**: Varies drastically by OEM and chipset

## Technical References

Codec specifications based on:
- **ISO/IEC 14496** (MPEG-4 / MP4)
- **ISO/IEC 23008** (HEVC/HDR)
- **ISO/IEC 23090** (AV1)
- **ISO/IEC 23094** (VVC/H.266)
- Dolby Vision Bitstream Specification
- DTS Technical Documentation
- Apple HLS Authoring Specification
- DASH-IF Implementation Guidelines
- CMAF Specification (ISO/IEC 23000-19)

## Dependencies

**Runtime**: Zero external dependencies
- UAParser.js v2.x bundled in `js/vendor/` (35.3 KB minified)
- No CDN requests, works fully offline

**Development**:
- `sass` - SCSS compilation
- `terser` - JavaScript minification
- `ua-parser-js` - Browser detection (bundled at build time)

## License

MIT License - see [LICENSE](LICENSE) file

## Credits

Built by media server enthusiasts, for media server enthusiasts.

**Inspired by**:
- Countless hours debugging Jellyfin Dolby Vision playback
- The Jellyfin, Plex, and Emby communities
- Discovering webOS race conditions the hard way
- MDN Web Docs for being an amazing resource

**Special thanks**:
- Dolby, DTS, and codec standards organizations for specifications
- Browser vendors for (eventually) implementing mediaCapabilities API
- UAParser.js maintainers for excellent browser detection
- Everyone who's filed a "why won't this play" bug report

---

**Note**: This tool tests browser API responses, not actual file playback. Supported codecs still require properly encoded source files.
