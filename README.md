# CodecProbe

**Browser codec detection — three APIs, 256 tests, no guessing**

CodecProbe queries three browser APIs against 256 codec/container combinations and compares their responses side-by-side. The results reveal which codecs your device can actually decode, where the APIs disagree, and whether your media server needs to transcode or can direct-play.

Each tested codec includes education content explaining the codec string format, spec references, and platform-specific behavior — so the results are not just data, they're documentation.

**[Live Demo](https://codecprobe.dev)**

![License](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)
![JavaScript](https://img.shields.io/badge/javascript-ES2020+-yellow.svg)
![Dependencies](https://img.shields.io/badge/runtime_deps-zero-green.svg)
![Deploy Status](https://github.com/nofear0411/codecprobe/actions/workflows/release.yml/badge.svg)

---

## Why This Exists

The three browser codec APIs return different answers for the same codec string:

- `canPlayType()` returns `"maybe"` for codecs without hardware decoders — it checks syntax, not capability
- `MediaSource.isTypeSupported()` has stricter requirements than native `<video>` playback
- `mediaCapabilities.decodingInfo()` is the only API that reports hardware decode, HDR transfer functions, and power efficiency — but most apps don't use it
- The same codec string can return different results depending on the container, the API, and the device

Media servers decide whether to transcode based on these API responses. When the APIs are wrong or incomplete, you get unnecessary transcoding or failed playback. CodecProbe makes the full picture visible.

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

Each codec is tested against all three APIs. Results are shown as numbered color-coded badges (**green** = supported, **yellow** = maybe/partial, **red** = unsupported) so disagreements are visible at a glance.

| Badge | API | Returns | What it actually checks |
|-------|-----|---------|------------------------|
| **1** | `canPlayType()` | `"probably"` / `"maybe"` / `""` | Codec string syntax against an internal list. No hardware awareness — `"maybe"` does not mean the device can decode it. |
| **2** | `MediaSource.isTypeSupported()` | `true` / `false` | Whether the codec can be fed through MSE for adaptive streaming. Stricter than badge 1, but still no hardware info. |
| **3** | `mediaCapabilities.decodingInfo()` | `{ supported, smooth, powerEfficient }` | Actual hardware decode capability, including HDR transfer function (`pq`/`hlg`) and color gamut (`rec2020`/`p3`). The most accurate API. |

When badges disagree, that's the signal. A red **1** with a green **3** means the oldest API is wrong. A green **1** with a red **2** means native playback works but MSE streaming won't.

### DRM/EME Support

Tests `requestMediaKeySystemAccess()` for encrypted content playback:

| Key System | Typical Platform | What CodecProbe Reports |
|------------|------------------|-------------------------|
| **Widevine** | Chrome, Android | Security level (L1 hardware / L3 software) |
| **PlayReady** | Edge, Xbox | Robustness level |
| **FairPlay** | Safari, iOS | Key system availability |
| **ClearKey** | All (W3C standard) | Unencrypted key delivery support |

Results include persistent state support and robustness strings. DRM detection runs in parallel with codec tests and times out gracefully if the key system is unavailable.

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

- **Progressive testing** — cards appear immediately with PENDING status, results fill in as each test completes
- **Batched execution** — 10 codecs tested in parallel per batch, 2 retries with 1s timeout per test
- **Search and filter** — filter by support level (all/supported/video/audio), search by codec name or description
- **JSON export** — full results with device fingerprint, DRM info, and all three API responses per codec
- **Three themes** — Dark OLED (default), Light, Retro Terminal — persisted in localStorage
- **Keyboard shortcuts** — `/` to focus search, `Esc` to clear, standard navigation
- **Accessibility** — ARIA labels, skip links, screen reader announcements, `prefers-reduced-motion` support
- **Device detection** — UAParser.js v2.x with Client Hints API (Chromium) and iPad-specific detection via `withFeatureCheck()`
- **Offline PWA** — service worker precaches all assets, works without network after first visit
- **Zero runtime dependencies** — everything bundled at build time, no CDN or external requests
- **Fluid layout** — CSS intrinsic sizing with `clamp()`/`min()`/`auto-fit`, no hardcoded breakpoints
- **Education content** — codec string breakdowns, platform notes, and cited spec references for 131 entries across 38 specifications

## Understanding Results

### Support Levels

| Badge | Meaning |
|-------|---------|
| **SUPPORTED** (green) | All queried APIs confirm support |
| **PROBABLY** (green) | Most APIs confirm, at least one disagrees |
| **UNSUPPORTED** (gray) | No API reports support |
| **FAILED** (purple) | Test threw an error or timed out after retries |

### Reading the Badges

Each codec card shows three numbered badges matching the API table above. When they agree, the result is clear. When they disagree, click the card to expand API details — the response from each API is shown individually so you can see exactly which one differs and why.

Common patterns:
- **1** red, **3** green — `canPlayType()` doesn't recognize the codec string, but hardware decode is available
- **1** green, **2** red — native `<video>` playback works, but the codec can't be used in MSE/adaptive streaming
- **1** yellow — `"maybe"` response, which means the browser parsed the codec string but makes no guarantee about playback

## Platform-Specific Behavior

Codec support varies across platforms. These are factual observations from API responses, not judgments about platform quality.

### webOS (LG TVs)
- Dolby Vision Profile 8.1 hardware decode on webOS 6+
- webOS 25+ added MKV Dolby Vision support
- Native DTS-HD passthrough to audio receivers

### iOS / Safari
- Dolby Vision Profile 5 hardware on A11+ chips (iPhone 8 and later)
- `canPlayType()` returns `""` for DV codec strings — `mediaCapabilities` reflects actual support
- Panels below 1000 nits: `transferFunction: 'pq'` returns `supported: false` (API reflects display capability, not SoC)
- HLS HDR requires `VIDEO-RANGE=PQ` in the master playlist

### Android
- Codec support varies by manufacturer, SoC, and Android version
- Widevine level detected: L1 (hardware-backed) or L3 (software-only)
- HEVC Main 10 requires Android 7.0+ with a MediaCodec hardware decoder

### Desktop Browsers
- **Chrome/Edge** (Blink) — broadest codec and container coverage
- **Safari** (WebKit) — strongest HEVC and Dolby Vision support; `canPlayType()` results differ from `mediaCapabilities` for DV strings
- **Firefox** (Gecko) — Dolby and DTS codecs unavailable (requires proprietary licenses not included in the open-source media stack)

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

Pull requests welcome — codec database contributions especially. See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, code standards, and detailed guides for adding codecs, education content, and platform quirks.

If you have a device that reports unexpected results, [open an issue](https://github.com/nofear0411/codecprobe/issues) with your exported JSON — it helps expand coverage for everyone.

## License

AGPL-3.0-or-later — see [LICENSE](LICENSE).

If you modify CodecProbe and make it available over a network, you must share your source code under the same license. This protects the community-built codec database.

UAParser.js v2.x is bundled under the same AGPL-3.0 license.
