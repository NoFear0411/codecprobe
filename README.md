# CodecProbe

**Multi-API codec testing for media server enthusiasts**

CodecProbe tests what your browser can actually decode by querying three different browser APIs and comparing their responses. It exposes the discrepancies between what browsers claim to support and what the hardware can handle — discrepancies that cause playback failures in Jellyfin, Plex, and Emby.

**[Live Demo](https://codecprobe.dev)**

![License](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)
![JavaScript](https://img.shields.io/badge/javascript-ES2020+-yellow.svg)
![Dependencies](https://img.shields.io/badge/runtime_deps-zero-green.svg)
![Deploy Status](https://github.com/nofear0411/codecprobe/actions/workflows/deploy.yml/badge.svg)

---

## Why This Exists

Browser codec detection is unreliable:

- `canPlayType()` returns "maybe" for codecs the hardware can't decode
- Safari hides Dolby Vision support from API responses entirely
- webOS apps have async race conditions that break capability detection
- `mediaCapabilities` is the most accurate API but rarely used

CodecProbe runs all three APIs side-by-side against 254 codec/container combinations so you can see what your device supports across every detection method.

## Real-World Issues This Catches

### webOS (LG TVs) — Race Condition

The Jellyfin webOS app calls `getSupportedHdrProfiles()` before the Luna IPC `getHdrCapabilities` call completes, returning an empty array. Dolby Vision randomly works or fails depending on timing.

CodecProbe shows `mediaCapabilities` accurately reflecting hardware state while `canPlayType()` returns inconsistent results.

### iOS/Safari — Hidden Dolby Vision

Safari's `canPlayType()` returns `""` for all Dolby Vision codec strings, even on A11+ chips with DV hardware. This is intentional behavior (privacy/DRM).

CodecProbe shows `mediaCapabilities` with `transferFunction: 'pq'` revealing actual PQ/HDR support.

### iPad — Green Screen on DV Content

iPad A16 has DV Profile 5 hardware but a 500-nit display. When servers send HEVC with DV RPU NALUs without proper signaling, VideoToolbox decodes IPT-PQ as BT.2020, producing a green tint.

CodecProbe shows `transferFunction: 'pq'` returning `supported: false` on 500-nit panels.

### webOS 25 — DTS Detection Change

webOS v25 changed the DTS detection path. The `canPlayDts()` check stops at `< 23`, causing false negatives on newer firmware.

## What It Tests

### Three Decoder APIs

| API | What It Does | Reliability |
|-----|-------------|-------------|
| `canPlayType()` | Codec string parsing against browser's internal list | Low — returns "maybe" liberally |
| `MediaSource.isTypeSupported()` | MSE/streaming codec support | Medium — stricter, but no hardware info |
| `mediaCapabilities.decodingInfo()` | Hardware decode capability, smoothness, power efficiency | High — reflects actual hardware state |

Each API result is shown with a color-coded badge (green/yellow/red) so you can spot inconsistencies at a glance.

### DRM/EME Support

- **Widevine** (Chrome/Android) — security level L1 (hardware) or L3 (software)
- **PlayReady** (Edge/Xbox) — robustness levels
- **FairPlay** (Safari/iOS) — streaming key system
- **ClearKey** (W3C standard) — unencrypted key delivery

Tests `requestMediaKeySystemAccess()` with persistent state and robustness detection.

## Codec Coverage

**254 test entries** across 14 codec groups and 17 container MIME types.

### Video (142 tests)

| Codec | Profiles/Variants Tested | Containers |
|-------|-------------------------|------------|
| HEVC/H.265 | Main, Main 10, Main Still Picture, High Tier, Levels 3.1–6.1, SDR/HDR10/HLG | MP4, MKV, MOV |
| Dolby Vision | Profiles 4, 5, 7, 8.1, 8.2, 8.4, 9 (AVC), 10 (AV1), supplemental dual-codec strings | MP4, MKV, MOV |
| AV1 | Main (P0), High (P1, 4:4:4), Professional (P2, 4:2:2), Film Grain, High Tier, Levels 3.1–6.0 | MP4, MKV, WebM, MOV |
| VP9 | Profile 0 (8-bit), P1 (4:2:2), P2 (10-bit HDR10/HLG), P3 (4:4:4), bare vs full codec strings | MP4, MKV, WebM |
| AVC/H.264 | Baseline, Main, High, High 10, High 4:2:2, Constrained, Extended, Levels 3.0–5.2 | MP4, MKV, WebM, MOV, 3GP |
| VVC/H.266 | Main 10, Still Picture, vvc1/vvi1 tags, Levels 3.1–6.0 | MP4, MKV |
| VP8 | SDR 720p/1080p/4K, MSE streaming | WebM, MKV |
| Legacy | MPEG-4 Part 2 (Simple/Advanced Simple), H.263, Theora | MP4, MKV, 3GP, OGG |

### Audio (87 tests)

| Codec | Variants Tested | Containers |
|-------|----------------|------------|
| Dolby | AC-3 (stereo/5.1), E-AC-3 (5.1/7.1/Atmos JOC), TrueHD, AC-4, AC-4 IMS | MP4, MKV, MOV, fMP4 |
| DTS | Core (dts-/dtsc), Express (dtse), HD High Resolution, HD Master Audio (dtsh), Lossless (dtsl), DTS:X (dtsx) | MP4, MKV, fMP4 |
| Lossless | FLAC (stereo/5.1/Hi-Res), ALAC (stereo/Hi-Res), Opus (stereo/5.1), PCM | MP4, MKV, WebM, MOV, OGG, FLAC, WAV, AIFF |
| Standard | AAC-LC, HE-AAC v1/v2, xHE-AAC (USAC), AAC-ELD, AAC-LD, MP3, Vorbis (stereo/5.1) | MP4, MKV, WebM, MOV, OGG, AAC, MP3 |
| MPEG-H | 3D Audio LC (mhm1), 3D Audio (mhm2), Baseline | MP4, MKV |

### Streaming (25 tests)

| Format | Codecs Tested |
|--------|--------------|
| HLS (fMP4) | HEVC SDR/HDR, H.264, AV1, Dolby Vision P8.1, E-AC-3, AAC |
| DASH | AV1 SDR/HDR, VP9 SDR/HDR, H.264, HEVC, DV P8.1 |
| CMAF | AV1, HEVC, H.264, VP9, DV P8.1 |
| MPEG-TS | H.264 (High/Baseline), HEVC 4K, AAC, AC-3 |

All streaming tests use `type: 'media-source'` for proper MSE validation.

### Container Matrix

| Container | MIME Type | Video | Audio | Total |
|-----------|-----------|-------|-------|-------|
| MP4 | `video/mp4`, `audio/mp4` | 81 | 38 | 119 |
| MKV | `video/x-matroska`, `audio/x-matroska` | 40 | 26 | 66 |
| WebM | `video/webm`, `audio/webm` | 25 | 5 | 30 |
| MOV | `video/quicktime`, `audio/quicktime` | 9 | 5 | 14 |
| MPEG-TS | `video/mp2t` | 5 | — | 5 |
| 3GP | `video/3gpp` | 3 | — | 3 |
| OGG | `video/ogg`, `audio/ogg` | 2 | 4 | 6 |
| Native | `audio/flac`, `audio/wav`, etc. | — | 11 | 11 |

## Features

- **Progressive testing** — cards render immediately, results fill in as tests complete
- **Batched execution** — 10 codecs tested in parallel per batch with retry logic
- **Search and filter** — filter by support level (all/supported/video/audio), search by name
- **JSON export** — full results with device fingerprint for bug reports
- **Three themes** — Dark OLED (default), Light, Retro Terminal with localStorage persistence
- **Keyboard shortcuts** — `/` to focus search, `Esc` to clear
- **Accessibility** — ARIA labels, skip links, screen reader announcements, reduced motion support
- **UAParser.js v2.x** — accurate device detection with Client Hints API and iPad detection
- **Offline PWA** — service worker precaches all assets, works without network after first visit
- **Zero runtime dependencies** — UAParser.js bundled at build time, no CDN requests
- **Fluid responsive** — intrinsic CSS layout with `clamp()`/`min()`/`auto-fit`, no hardcoded breakpoints (webOS TV optimized)
- **Education & references** — codec string breakdowns, platform notes, and cited spec references for 115 entries

## Understanding Results

### Support Levels

| Badge | Meaning |
|-------|---------|
| **SUPPORTED** (green) | All queried APIs confirm support |
| **PROBABLY** (green) | Most APIs confirm, at least one disagrees |
| **UNSUPPORTED** (gray) | No API reports support |
| **FAILED** (purple) | Test failed after retries (timeout or API error) |

### API Badges

Each codec card shows numbered badges (1, 2, 3) for the three APIs:
- **Green** — API reports supported/probably
- **Yellow** — API reports partial/maybe
- **Red** — API reports unsupported or error

Mismatched badges reveal detection inconsistencies (e.g., Safari showing red on badge 1 but green on badge 3 for Dolby Vision).

### Why Containers Matter

The same codec produces different results in different containers. HEVC in MP4 may show supported while HEVC in MKV shows unsupported — this directly maps to whether your media server needs to remux or transcode.

- **MP4** — broadest browser support, required for streaming
- **MKV** — remux format for high-quality archives, limited browser support
- **WebM** — Google's open container, Chrome/Firefox preferred
- **MOV** — Apple QuickTime, Safari/macOS optimized
- **fMP4/CMAF** — fragmented formats used by HLS and DASH

## Platform Notes

### webOS (LG TVs)
- Dolby Vision Profile 8.1 hardware decode on webOS 6+
- webOS 25+ added MKV Dolby Vision support
- Native DTS-HD passthrough to audio receivers
- DV detection may fail on first load due to async race condition

### iOS / Safari
- Dolby Vision Profile 5 hardware on A11+ (iPhone 8+)
- `canPlayType()` never reports DV support — use `mediaCapabilities` instead
- 500-nit displays tone-map HDR, `transferFunction: 'pq'` returns false
- HLS requires `VIDEO-RANGE=PQ` attribute for HDR content

### Android
- Codec support varies by manufacturer, SoC, and Android version
- Widevine level reported: L1 (hardware-backed) or L3 (software)
- HEVC Main 10 requires Android 7.0+ with MediaCodec hardware decoder

### Desktop Browsers
- **Chrome/Edge** (Blink) — widest codec support
- **Safari** (WebKit) — best HEVC/DV support, hidden from some APIs
- **Firefox** (Gecko) — limited Dolby/DTS due to licensing

## Usage

### Quick Start

Open [codecprobe.dev](https://codecprobe.dev) or serve locally:

```bash
python -m http.server 8000  # Uses pre-compiled CSS
# Open http://localhost:8000
```

### Development

```bash
git clone https://github.com/nofear0411/codecprobe.git
cd codecprobe
npm install        # Install build tools
npm run build      # Compile SCSS + minify JS + bundle deps
npm run dev        # Dev server + SCSS file watcher
```

### GitHub Pages Deployment

1. Fork the repository
2. Enable GitHub Pages → select `main` branch
3. GitHub Actions builds and deploys automatically
4. Access at `https://YOUR_USERNAME.github.io/codecprobe/`

## Project Structure

```
codecprobe/
├── index.html                 # Single-page application
├── sw.js                      # Service worker (offline PWA)
├── css/
│   └── styles.css             # Compiled from SCSS (all themes)
├── scss/
│   ├── styles.scss            # Main stylesheet
│   └── _themes.scss           # Theme definitions
├── js/
│   ├── codec-database.js      # 254 codec test definitions
│   ├── codec-tester.js        # Three-API testing with retry logic
│   ├── device-detection.js    # UAParser.js v2.x integration
│   ├── drm-detection.js       # DRM/EME system testing
│   ├── ui-renderer.js         # Card rendering, filters, search
│   ├── theme-manager.js       # Theme switching
│   ├── url-state.js           # URL state management
│   ├── main.js                # Initialization orchestrator
│   └── vendor/
│       └── ua-parser.min.js   # Bundled UAParser.js v2.0.9
├── BUILD.md                   # Build system documentation
├── CLAUDE.md                  # AI assistant context
└── README.md
```

## Adding Codecs

Add entries to `js/codec-database.js`:

```javascript
{
    name: "Codec Variant (Container)",        // Must be unique across all entries
    codec: 'video/mp4; codecs="codec-string"',
    container: "MP4",
    info: "Short description",
    mediaConfig: {
        type: 'file',                         // 'file' or 'media-source'
        video: {
            contentType: 'video/mp4; codecs="codec-string"',
            width: 3840,
            height: 2160,
            bitrate: 25000000,
            framerate: 24,
            transferFunction: 'pq',           // Optional: 'pq' or 'hlg'
            colorGamut: 'rec2020'             // Optional: 'rec2020' or 'p3'
        }
    }
}
```

Use `type: 'media-source'` for streaming format tests (HLS/DASH/CMAF).

The `name` field must be unique — it's used for card matching in the UI.

## Known Limitations

**Browser-imposed:**
- Safari hides DV support from `canPlayType()` intentionally
- Firefox lacks Dolby and DTS codec support (licensing)
- Chrome's MSE codec support differs from `<video>` element support

**Platform-specific:**
- webOS async race condition can cause false negatives on first load
- iOS hardware capabilities exceed what APIs report
- Android support varies by OEM, SoC, and firmware version

**Scope:**
- Tests API responses, not actual file playback
- Supported codecs still require properly encoded source files
- DRM tests check key system availability, not content license acquisition

## Dependencies

**Runtime:** None. UAParser.js v2.x is bundled in `js/vendor/` (35.3 KB minified).

**Build tools:** `sass`, `terser`, `ua-parser-js`

## Technical References

Every education entry in the codec database cites its sources. 36 specifications across 6 standards bodies are referenced inline — linked where freely available, cited by number for paywalled specs.
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Standards Body | Specifications                                                                                                                                                                                     |
|----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **ITU-T**      | H.264 (AVC), H.265 (HEVC), H.266 (VVC)                                                                                                                                                             |
| **ISO/IEC**    | 14496-3 (AAC), 14496-15 (codec packaging), 23008-2 (HEVC), 23008-3 (MPEG-H 3D Audio), 23091-2 (AV1 registration), 23094-1 (VVC), 23000-19 (CMAF), 23009-1 (DASH), 13818-1 (MPEG-TS), 11172-3 (MP3) |
| **ETSI**       | TS 102 114 (DTS), TS 102 366 (Dolby AC-3/E-AC-3), TS 103 572 (Dolby Vision)                                                                                                                        |
| **IETF**       | RFC 6386 (VP8), RFC 6716 (Opus), RFC 8216 (HLS), RFC 9639 (FLAC)                                                                                                                                   |
| **Industry**   | AV1 Bitstream & Decoding Process, AV1 ISOBMFF Binding, VP9 Bitstream & Decoding Process, VP9 ISOBMFF Binding, Vorbis I Specification, DASH-IF Implementation Guidelines                            |
| **Vendor**     | Apple HLS Authoring Specification, webOS TV Developer Guide, Android MediaCodec Reference                                                                                                          |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
## Contributing

Pull requests welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Areas that benefit from contributions:
- New codec entries with verified codec strings
- Platform-specific quirk documentation
- Bug fixes for edge cases
- UI/UX improvements

## License

AGPL-3.0-or-later — see [LICENSE](LICENSE).

This means if you modify CodecProbe and make it available over a network, you must share your source code under the same license. This protects the community-built codec database.

UAParser.js v2.x is bundled under the same AGPL-3.0 license.
