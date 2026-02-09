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

CodecProbe runs all three APIs side-by-side against 256 codec/container combinations so you can see what your device supports across every detection method.

## Real-World Issues This Catches

### API Disagreement on Dolby Vision

`canPlayType()` returns `""` for all Dolby Vision codec strings on Safari, even on devices with DV hardware. Badge 1 shows red while badge 3 shows green — `mediaCapabilities` with `transferFunction: 'pq'` reveals the actual HDR support that `canPlayType()` hides.

Media server apps that rely solely on `canPlayType()` will incorrectly decide to transcode DV content. CodecProbe makes this mismatch visible.

### HDR Reporting vs. Display Capability

A device can have HDR decode hardware but a display that cannot render PQ content. iPad panels below 1000 nits return `supported: false` for `transferFunction: 'pq'` even with DV Profile 5 hardware — the API correctly reflects the display limitation, not the SoC capability.

This is why the same codec string shows different `mediaCapabilities` results on devices with identical chips but different displays.

### Container Support vs. Codec Support

The same HEVC codec string returns supported in MP4 but unsupported in MKV on most browsers. This directly maps to whether a media server needs to remux (fast container swap) or transcode (slow re-encode). CodecProbe tests each codec across multiple containers so you can see exactly which combinations your device handles.

### MSE vs. Native Playback Gaps

`MediaSource.isTypeSupported()` (badge 2) can disagree with `canPlayType()` (badge 1) for the same codec string. MSE has stricter requirements — a codec may work in a `<video>` element but fail in adaptive streaming. CodecProbe surfaces these gaps, which matter for HLS/DASH playback in media server web clients.

## What It Tests

### Three Decoder APIs

- **`1` canPlayType()** — Codec string parsing against the browser's internal list
  - Returns `"probably"`, `"maybe"`, or `""`
  - Reliability: **Low** — returns "maybe" liberally, Safari hides DV entirely
- **`2` MediaSource.isTypeSupported()** — MSE/streaming codec support check
  - Returns `true` or `false`
  - Reliability: **Medium** — stricter than canPlayType, but no hardware capability info
- **`3` mediaCapabilities.decodingInfo()** — Hardware decode capability query
  - Returns `{ supported, smooth, powerEfficient }` with HDR transfer function awareness
  - Reliability: **High** — reflects actual hardware state, most accurate API

Each API result is shown with a numbered color-coded badge (**green**/yellow/red) so you can spot inconsistencies at a glance.

### DRM/EME Support

- **Widevine** (Chrome/Android) — security level L1 (hardware) or L3 (software)
- **PlayReady** (Edge/Xbox) — robustness levels
- **FairPlay** (Safari/iOS) — streaming key system
- **ClearKey** (W3C standard) — unencrypted key delivery

Tests `requestMediaKeySystemAccess()` with persistent state and robustness detection.

## Codec Coverage

**256 test entries** across 14 codec groups and 17 container MIME types.

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
- **Education & references** — codec string breakdowns, platform notes, and cited spec references for 129 entries

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
├── css/styles.css             # Compiled from SCSS (all themes)
├── scss/
│   ├── styles.scss            # Main stylesheet
│   └── _themes.scss           # Theme definitions
├── js/
│   ├── codec-database.js      # 256 codec tests · 131 education entries · 14 groups
│   ├── codec-tester.js        # Three-API testing with retry logic
│   ├── device-detection.js    # UAParser.js v2.x integration
│   ├── drm-detection.js       # DRM/EME system testing
│   ├── ui-renderer.js         # Card rendering, filters, search, education panel
│   ├── theme-manager.js       # Theme switching (Dark OLED / Light / Retro Terminal)
│   ├── url-state.js           # URL state management
│   ├── main.js                # Initialization orchestrator
│   └── vendor/
│       └── ua-parser.min.js   # Bundled UAParser.js v2.0.9
├── scripts/
│   ├── db-tool.mjs            # Database CLI — add, inspect, inject, patch, verify
│   └── lib/
│       ├── reader.mjs         # Database import and query functions
│       └── writer.mjs         # Source formatter, inject/replace/add operations
├── BUILD.md                   # Build system documentation
├── CLAUDE.md                  # AI assistant context
└── README.md
```

## Database CLI

The codec database is managed through `scripts/db-tool.mjs` — a CLI that handles validation, formatting, and source-level insertion. No manual editing of `codec-database.js` required.

```bash
node scripts/db-tool.mjs <command> [args]
```

| Command | Description |
|---------|-------------|
| `stats` | Group counts and education coverage with completion percentages |
| `list <group> [--missing\|--complete]` | List entries, filter by education status |
| `show <group> <name>` | Full entry details as JSON |
| `add <file> [--group <key>]` | Add new test entries with validation and auto group detection |
| `scaffold <group>` | Generate education template with pre-filled MIME, tokens, and spec refs |
| `inject <group> <file>` | Add education content to entries that lack it |
| `patch <group> <file>` | Deep-merge updates into existing education |
| `verify` | Syntax + import + structure check |

All write commands (`add`, `inject`, `patch`) support `--dry-run` and run syntax verification before writing.

### Adding new codec entries

The `add` command validates every field before touching the database:

- **MIME type** checked against 16 known types (`video/mp4`, `audio/x-matroska`, etc.)
- **Container** checked against 15 known values (`MP4`, `MKV`, `WebM`, `fMP4`, etc.)
- **Name uniqueness** verified across all 14 groups
- **contentType** must match the codec field exactly
- **Dimensions, bitrate, framerate** must be positive numbers
- **transferFunction** and **colorGamut** must be valid enum values if provided

Group detection is automatic from the codec string — `hvc1.*` routes to `video_hevc`, `av01.*` to `video_av1`, `ec-3` to `audio_dolby`, etc. Override with `--group <key>` when needed.

### Adding education content

```bash
# 1. Generate a template for all entries missing education
node scripts/db-tool.mjs scaffold video_av1 > /tmp/av1-edu.mjs

# 2. Edit the file — fill in token meanings and overviews

# 3. Preview what will change
node scripts/db-tool.mjs inject video_av1 /tmp/av1-edu.mjs --dry-run

# 4. Inject into the database
node scripts/db-tool.mjs inject video_av1 /tmp/av1-edu.mjs
```

The `scaffold` command pre-fills MIME types, codec string tokens, and spec references based on the group — you only need to write the human content (token meanings, overviews, platform notes).

## Known Limitations

**What the APIs report vs. reality:**
- `canPlayType()` returns "maybe" for codecs without hardware decoders — it checks codec string syntax, not capability
- Safari's `canPlayType()` returns `""` for Dolby Vision codec strings, even on devices with DV hardware. `mediaCapabilities` reveals the actual support
- Firefox does not expose Dolby or DTS codecs — these require proprietary licenses not included in the browser's media stack
- Chrome's `MediaSource.isTypeSupported()` results can differ from `<video>` element support because MSE has stricter codec requirements

**Platform-specific behavior:**
- iOS: Hardware capabilities exceed what APIs report. 500-nit iPad panels return `supported: false` for `transferFunction: 'pq'` even with DV Profile 5 hardware
- Android: Codec support varies across manufacturers, SoCs, and firmware versions — the same codec string can produce different results on different devices

**Scope:**
- Tests API responses, not actual file playback — "supported" means the API says yes, not that a specific file will play
- DRM tests check `requestMediaKeySystemAccess()` availability, not whether a license server will issue keys
- `mediaCapabilities` reports `smooth` and `powerEfficient` booleans but this tool does not benchmark actual decode performance

## Dependencies

**Runtime:** None. UAParser.js v2.x is bundled in `js/vendor/` (35.3 KB minified).

**Build tools:** `sass`, `terser`, `ua-parser-js`

## Technical References

Every education entry in the codec database cites its sources. 38 specifications across 6 standards bodies are referenced inline — linked where freely available, cited by number for paywalled specs.

| Standards Body | Specifications |
|---|---|
| **ITU-T** | H.264 (AVC), H.265 (HEVC), H.266 (VVC) |
| **ISO/IEC** | 14496-3 (AAC), 14496-15 (codec packaging), 23008-2 (HEVC), 23008-3 (MPEG-H 3D Audio), 23091-2 (AV1 registration), 23094-1 (VVC), 23000-19 (CMAF), 23009-1 (DASH), 13818-1 (MPEG-TS), 11172-3 (MP3) |
| **ETSI** | TS 102 114 (DTS), TS 102 366 (Dolby AC-3/E-AC-3), TS 103 572 (Dolby Vision) |
| **IETF** | RFC 6386 (VP8), RFC 6716 (Opus), RFC 8216 (HLS), RFC 9639 (FLAC) |
| **Industry** | AV1 Bitstream & Decoding Process, AV1 ISOBMFF Binding, VP9 Bitstream & Decoding Process, VP9 ISOBMFF Binding, Vorbis I Specification, DASH-IF Implementation Guidelines |
| **Vendor** | [Apple HLS Authoring Spec](https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices), [webOS TV AV Formats](https://webostv.developer.lge.com/develop/specifications/video-audio-250), [Android Supported Media Formats](https://developer.android.com/media/platform/supported-formats), [Android ExoPlayer DASH](https://developer.android.com/media/media3/exoplayer/dash), [Android ExoPlayer HLS](https://developer.android.com/media/media3/exoplayer/hls) |

## Contributing

Pull requests welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Adding new codec/container tests

Create a `.mjs` file exporting an array of entries, then use the CLI to validate and insert:

```javascript
// new-entries.mjs — video entry
export default [
    {
        name: "HEVC Main 10 (HDR10 4K WebM)",
        codec: 'video/webm; codecs="hvc1.2.4.L153.B0"',
        container: "WebM",
        info: "10-bit HDR10",
        mediaConfig: {
            type: 'file',
            video: {
                contentType: 'video/webm; codecs="hvc1.2.4.L153.B0"',
                width: 3840,
                height: 2160,
                bitrate: 25000000,
                framerate: 24,
                transferFunction: 'pq',
                colorGamut: 'rec2020'
            }
        }
    }
];
```

```javascript
// new-entries.mjs — audio entry
export default [
    {
        name: "Opus 5.1 (WebM)",
        codec: 'audio/webm; codecs="opus"',
        container: "WebM",
        info: "5.1 surround",
        mediaConfig: {
            type: 'file',
            audio: {
                contentType: 'audio/webm; codecs="opus"',
                channels: 6,
                bitrate: 256000,
                samplerate: 48000
            }
        }
    }
];
```

```bash
node scripts/db-tool.mjs add new-entries.mjs --dry-run  # preview
node scripts/db-tool.mjs add new-entries.mjs             # write to database
node scripts/db-tool.mjs verify                          # confirm integrity
```

The tool auto-detects the target group from the codec string (`hvc1` → `video_hevc`, `opus` → `audio_lossless`, etc.). Use `--group <key>` to override. Validation catches malformed fields before they reach the database.

### Adding education content

Generate a scaffold, fill in the content, inject:

```bash
node scripts/db-tool.mjs scaffold audio_dts > /tmp/dts-edu.mjs
```

The scaffold pre-fills MIME types, tokenized codec strings, and spec references. You fill in the `meaning` and `overview` fields:

```javascript
// dts-edu.mjs (scaffold output, edited)
export default {
    "DTS-HD Master Audio (MKV)": {
        codecBreakdown: {
            mime: 'audio/x-matroska',
            string: 'dtsl',
            parts: [
                { token: 'dtsl', meaning: 'DTS Lossless tag per ETSI TS 102 114. Bit-identical to studio master.' }
            ]
        },
        overview: 'DTS-HD MA in Matroska. Lossless decode requires a DTS-HD MA licensed decoder.',
        references: [
            { title: 'ETSI TS 102 114' }
        ]
    }
};
```

```bash
node scripts/db-tool.mjs inject audio_dts /tmp/dts-edu.mjs
```

To update existing education (add platform notes, new references):

```javascript
// dts-patch.mjs
export default {
    "DTS-HD Master Audio (MKV)": {
        platforms: {
            android: 'DTS passthrough via AudioTrack ENCODING_DTS_HD on supported hardware.'
        }
    }
};
```

```bash
node scripts/db-tool.mjs patch audio_dts /tmp/dts-patch.mjs
```

### Other contributions

- **Platform quirks** — document browser/device-specific behavior you've encountered
- **Bug fixes** — edge cases in detection, rendering, or export
- **UI/UX** — accessibility, responsive layout, theme improvements

If you have a device that reports unexpected results, [open an issue](https://github.com/nofear0411/codecprobe/issues) with your exported JSON — it helps expand coverage for everyone.

## License

AGPL-3.0-or-later — see [LICENSE](LICENSE).

If you modify CodecProbe and make it available over a network, you must share your source code under the same license. This protects the community-built codec database.

UAParser.js v2.x is bundled under the same AGPL-3.0 license.
