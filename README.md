# CodecProbe

**Browser codec detection — three APIs, one card per codec, no guessing**

CodecProbe queries three browser APIs against each codec record across multiple containers (MP4, MKV, WebM, MOV) and streaming formats (HLS, DASH, CMAF) — then compares their responses side-by-side. The results reveal which codecs your device can actually decode, where the APIs disagree, and whether your media server needs to transcode or can direct-play.

Each tested codec includes education content explaining the codec string format, spec references, and platform-specific behavior — so the results are not just data, they're documentation.

> **v4.5.2**: 77 codec records (HEVC, Dolby Vision, AV1, VP9) with the normalized v2 database. Purple error badges distinguish API exceptions from clean rejections. DRM testing uses `decodingInfo()` + `keySystemConfiguration` with full scenario configs. AVC, VVC, VP8, Legacy video, and all audio codecs are being migrated from the v1 database (238 entries). Every codec string is validated against [codec-resolve](https://github.com/nofear0411/codec-resolve) before entering the test matrix.

**[Live Demo](https://codecprobe.dev)**

![License](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)
![JavaScript](https://img.shields.io/badge/javascript-ES2020+-yellow.svg)
![Dependencies](https://img.shields.io/badge/runtime_deps-zero-green.svg)
![Deploy Status](https://github.com/nofear0411/codecprobe/actions/workflows/pages/pages-build-deployment/badge.svg?branch=main)

---

## Why This Exists

Media servers decide whether to transcode based on browser codec API responses. The three browser APIs return different answers for the same codec string, containers affect results independently of the codec, and platform-level parser differences mean the same query can fail on one OS but succeed on another. CodecProbe tests all three APIs across multiple containers so you see where they disagree and why.

### The three APIs disagree

- `canPlayType()` matches codec strings against an internal list — `"maybe"` does not mean the device can decode it
- `MediaSource.isTypeSupported()` has stricter requirements than native `<video>` playback — a codec can work in a video element but fail in HLS/DASH streaming
- `mediaCapabilities.decodingInfo()` reports hardware decode capability, HDR transfer functions, and power efficiency — but most media server apps don't query it
- Safari's `canPlayType()` returns `""` for all Dolby Vision codec strings, even on devices with DV hardware — `mediaCapabilities` with `transferFunction: 'pq'` reveals the actual support that `canPlayType()` hides

### Display limits override hardware

A device can have HDR decode hardware but a display that cannot render PQ content. iPad panels below 1000 nits return `supported: false` for `transferFunction: 'pq'` even with DV Profile 5 hardware — the API reflects the display limitation, not the SoC. The same codec string produces different `mediaCapabilities` results on devices with identical chips but different displays.

### Container and codec parser differences

- The same HEVC codec string returns supported in MP4 but unsupported in MKV on most browsers — the difference between a fast remux and a slow transcode
- Chrome's media parser rejects `video/quicktime` (MOV) and `video/x-matroska` (MKV) MIME types entirely — the API returns unsupported before evaluating the codec string. Firefox and Safari parse those MIME types normally
- Even with `video/mp4`, Chrome on Linux rejects all Dolby Vision FourCC tags (`dvh1`, `dvhe`, `dvc1`, `dvhp`, `dav1`, `dvav`) and dual-codec supplemental strings (e.g. `hvc1.2.4.L153.B0, dvhe.08.09`) — its media stack has no DV parser on that platform
- These parser-level failures are distinct from decode-level failures: "the browser doesn't recognize this codec string" is a different problem from "the browser parsed it but can't decode it"

## What It Tests

### Three Decoder APIs

Each codec is tested against all three APIs. Results are shown as numbered color-coded badges (**green** = supported, **yellow** = maybe/partial, **red** = unsupported, **purple** = API threw exception/timed out) so disagreements are visible at a glance.

| Badge | API | Returns | What it actually checks |
|-------|-----|---------|------------------------|
| **1** | `canPlayType()` | `"probably"` / `"maybe"` / `""` | Codec string syntax against an internal list. No hardware awareness — `"maybe"` does not mean the device can decode it. |
| **2** | `MediaSource.isTypeSupported()` | `true` / `false` | Whether the codec can be fed through MSE for adaptive streaming. Stricter than badge 1, but still no hardware info. |
| **3** | `mediaCapabilities.decodingInfo()` | `{ supported, smooth, powerEfficient }` | Actual hardware decode capability, including HDR transfer function (`pq`/`hlg`) and color gamut (`rec2020`/`p3`). The most accurate API. |

When badges disagree, that's the signal. A red **1** with a green **3** means the oldest API is wrong. A green **1** with a red **2** means native playback works but MSE streaming won't.

### DRM/EME Support

Device-level DRM detection uses `requestMediaKeySystemAccess()` at startup to discover available key systems. Per-codec DRM tests then use `mediaCapabilities.decodingInfo()` with `keySystemConfiguration` — the same API as badge 3, extended with DRM config. Only device-confirmed systems are tested per codec.

| Key System | Typical Platform | What CodecProbe Reports |
|------------|------------------|-------------------------|
| **Widevine** | Chrome, Android | Security level (L1 hardware / L3 software) |
| **PlayReady** | Edge, Xbox | Robustness level |
| **FairPlay** | Safari, iOS | Key system availability |
| **ClearKey** | All (W3C standard) | Unencrypted key delivery support |

DRM results show the full `decodingInfo()` config including `keySystemConfiguration`, along with `{ supported, smooth, powerEfficient }` response and resolved security level.

## Codec Coverage

**77 codec records** across 4 codec groups. Each record tests against multiple containers (file + streaming) and all three APIs per container. Streaming scenarios use `type: 'media-source'` for MSE validation.

### Video (77 records — v2 database)

| Codec | Records | Profiles/Variants | Containers |
|-------|---------|-------------------|------------|
| HEVC/H.265 | 15 | Main, Main 10, Main Still Picture, High Tier, Levels 3.1–6.1, SDR/HDR10/HLG | MP4, MKV, MOV |
| Dolby Vision | 29 | Profiles 4, 5, 7, 8.1, 8.2, 8.4, 9 (AVC), 10 (AV1), Levels 01–10, film framerates, supplemental dual-codec strings | MP4, MKV, MOV |
| AV1 | 12 | Main (P0), High (P1), Professional (P2), Film Grain, High Tier, Levels 3.0–6.0, SDR/HDR10/HLG | MP4, MKV, WebM, MOV |
| VP9 | 21 | Profiles 0–3, Levels 1.0–6.0, 8/10/12-bit, SDR/HDR10/HLG, full and limited range | MP4, MKV, WebM |

### Pending Migration (from v1 — 238 entries)

The following codec groups are being migrated from the v1 flat database to v2's normalized schema. Each will gain per-container and per-scenario testing:

- **Video**: AVC/H.264, VVC/H.266, VP8, Legacy (MPEG-4 Part 2, H.263, Theora)
- **Audio**: Dolby (AC-3/E-AC-3/AC-4), DTS, Lossless (FLAC/ALAC/Opus/PCM), Standard (AAC/MP3/Vorbis), MPEG-H 3D Audio
- **Streaming**: HLS, DASH, CMAF scenarios integrated into each codec record

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
- **Design token system** — CSS custom properties for typography (1.25 scale), spacing (4px grid), and border-radius — any visual change is a single token edit
- **Education content** — codec string breakdowns, platform notes, and cited spec references

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
├── manifest.json              # PWA manifest
├── css/styles.css             # Compiled from SCSS (all themes)
├── scss/
│   ├── styles.scss            # Main stylesheet
│   └── _themes.scss           # Theme definitions
├── js/
│   ├── codec-database-v2.js   # v2 normalized database — 77 records, 4 groups (active)
│   ├── codec-database.js      # v1 flat database — 238 entries, 13 groups (reference)
│   ├── codec-tester.js        # Three-API testing with retry logic
│   ├── device-detection.js    # UAParser.js v2.x integration
│   ├── drm-detection.js       # DRM/EME system testing
│   ├── ui-renderer.js         # Card rendering, filters, search, education panel
│   ├── theme-manager.js       # Theme switching (Dark OLED / Light / Retro Terminal)
│   ├── url-state.js           # URL state management
│   ├── main.js                # Initialization orchestrator + PWA install
│   └── vendor/
│       └── ua-parser.min.js   # Bundled UAParser.js v2.0.9
├── icons/                     # Favicons + PWA icons (any + maskable)
├── screenshots/               # OG image + PWA install screenshots
├── scripts/
│   ├── build.js               # Terser minification + UAParser bundling
│   ├── inject-versions.js     # Cache-busting version hashes for deploy
│   ├── db-tool.mjs            # v1 database CLI — add, inspect, inject, patch, verify
│   ├── db-tool-v2.mjs         # v2 database CLI — record + education mutations
│   ├── migrate-scenarios.mjs  # v1→v2 migration helper
│   ├── v2-audit.mjs           # v2 database audit and validation
│   └── lib/
│       ├── reader.mjs         # v1 database import and query functions
│       └── writer.mjs         # v1 source formatter, inject/replace/add operations
├── docs/
│   ├── BUILD.md               # Build system documentation
│   └── SETUP.md               # Deployment guide
├── CLAUDE.md                  # AI assistant context
└── README.md
```

## Test Matrix Generation

Every codec string in the v2 database is validated against [**codec-resolve**](https://github.com/nofear0411/codec-resolve) before it enters the test matrix. codec-resolve is a bidirectional codec string resolver and validator — it can both generate codec strings from content parameters (resolution, HDR format, bit depth) and decode existing strings back into their constituent fields.

The migration workflow:

1. **Decode** — `python -m codec_resolve --decode hvc1.2.4.L153.B0` parses the string, validates profile/level/constraint relationships, and flags semantic errors (wrong tier for level, incompatible chroma for profile, etc.)
2. **Validate** — 145 automated tests across HEVC, AV1, VP9, VP8, and Dolby Vision confirm that every codec string follows its spec (ITU-T, ISO/IEC, IETF, VP9-ISOBMFF Binding)
3. **Insert** — only strings that pass validation are added to the v2 database via `scripts/db-tool-v2.mjs`

This prevents invalid or malformed codec strings from polluting the test matrix. When a browser reports "unsupported" for a CodecProbe test, it means the codec string is spec-correct and the browser genuinely lacks support — not that we sent a malformed string.

codec-resolve currently supports:
- **HEVC** — 13 profiles, constraint flag validation, tier/level cross-checks
- **Dolby Vision** — profiles 5/7/8/9/10/20, HEVC/AV1 hybrid cross-validation, HLS brand inference
- **AV1** — profiles 0/1/2, tier/level, color parameter validation
- **VP9** — profiles 0–3, 13 levels, chroma/depth orthogonality checks
- **VP8** — bare tag validation

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
- DRM tests check `decodingInfo()` with `keySystemConfiguration` for per-codec DRM capability, not whether a license server will issue keys
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
| **Companion** | [codec-resolve](https://github.com/nofear0411/codec-resolve) — codec string resolver and validator used to generate and validate the test matrix (145 tests across HEVC, DV, AV1, VP9, VP8) |

## Contributing

Pull requests welcome — codec database contributions especially. See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, code standards, CLI reference, and detailed guides for adding codec records and education content.

If you have a device that reports unexpected results, [open an issue](https://github.com/nofear0411/codecprobe/issues) with your exported JSON — it helps expand coverage for everyone.

## License

AGPL-3.0-or-later — see [LICENSE](LICENSE).

If you modify CodecProbe and make it available over a network, you must share your source code under the same license. This protects the community-built codec database.

UAParser.js v2.x is bundled under the same AGPL-3.0 license.
