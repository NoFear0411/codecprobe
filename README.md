# CodecProbe

**Multi-API codec testing for media server enthusiasts**

Ever wonder why Dolby Vision doesn't work on your LG TV through Jellyfin? Or why your iPad shows a green screen when playing certain files? CodecProbe reveals exactly what your browser can actually decode using three different browser APIs.

Built after discovering race conditions in webOS Jellyfin apps and Safari's deliberately hidden Dolby Vision support.

🔗 **[Live Demo](https://nofear0411.github.io/codecprobe/)**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![JavaScript](https://img.shields.io/badge/javascript-ES6+-yellow.svg)
![No Dependencies](https://img.shields.io/badge/dependencies-none-green.svg)
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

**DRM/EME Testing**:
- **Widevine** - Google DRM (Chrome/Android)
- **PlayReady** - Microsoft DRM (Edge/Xbox)
- **FairPlay** - Apple DRM (Safari/iOS)
- **Security levels** - Hardware (L1) vs Software (L3)
- **Persistent state** - Offline playback capability

Complete picture: decoder capability + DRM support for every platform.

### 📊 Designed for Media Server Users
- **80+ codec combinations** across MP4 and MKV containers
- **Dolby Vision profiles**: 5, 7, 8.1, 8.4 (the ones that matter for Jellyfin/Plex)
- **DTS family**: Core, Express, HD, Master Audio, DTS:X
- **spatialRendering flag**: Audio tested with/without (critical for Atmos/DTS:X)
- **Transfer functions**: Separate tests for PQ, HLG (reveals iPad green screen issue)

### 💾 Debug-Ready Export
- Export complete results as JSON with device fingerprint
- Perfect for Jellyfin/Plex/Emby bug reports
- Share capability matrix across your device fleet
- Includes user agent, OS version, hardware specs

### 🎨 Modern UI with Multi-Theme System
- **4 distinctive themes** - Dark OLED (default), Light, Brutalist, Retro Terminal
- Instant theme switching with localStorage persistence
- Responsive design (mobile/tablet/desktop/TV)
- **webOS TV optimized** - Larger touch targets, 18px base font for TV viewing distance
- Collapsible device info to reduce clutter
- Filter by support level, type, or search by name
- Keyboard shortcuts (/ for search, Esc to clear)
- Full accessibility (ARIA labels, skip links, reduced motion)
- Built with modern SCSS (compiles to vanilla CSS)

## Tested Codecs

### Video Codecs
- **HEVC/H.265**: Main, Main 10 (HDR10, HLG), 4K, 8K
- **Dolby Vision**: Profiles 5, 7, 8.1, 8.4 (all major variants)
- **AV1**: Main Profile (SDR/HDR10), High Profile, Film Grain
- **VP9**: Profile 0 (SDR), Profile 2 (HDR)
- **AVC/H.264**: High, Main, Baseline profiles

### Audio Codecs
- **Dolby**: AC-3, E-AC-3/Atmos, TrueHD, AC-4
- **DTS**: Core, Express, HD High-Res, HD Master Audio, DTS:X
- **Lossless**: FLAC, ALAC, PCM, Opus
- **Standard**: AAC (LC/HE/HEv2), MP3, Vorbis

## Usage

### Quick Start
1. Open `index.html` in any modern browser
2. Wait for automatic testing to complete (~2-5 seconds)
3. View results organized by codec category
4. Use filters to narrow results
5. Export to JSON for sharing

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
npm install          # Install SCSS compiler
npm run dev          # Start dev server + SCSS watcher
# Open http://localhost:8000
```

**Without building CSS:**
```bash
python -m http.server 8000  # Uses pre-compiled CSS
```

## Project Structure

```
codecprobe/
├── index.html                 # Main HTML file
├── css/
│   └── styles.css            # All styling
├── js/
│   ├── codec-database.js     # Comprehensive codec specifications
│   ├── device-detection.js   # Browser/OS/device detection
│   ├── codec-tester.js       # Multi-API testing logic
│   ├── ui-renderer.js        # Results display
│   └── main.js               # Initialization
├── docs/
│   └── SPECIFICATIONS.md     # Technical codec specifications
└── README.md                 # This file
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
- **PROBABLY** (Green): Full native support confirmed
- **MAYBE** (Yellow): Partial support or uncertain
- **UNSUPPORTED** (Gray): Not supported

### Container Significance
Many codecs show different support across containers:
- **MP4**: Broadest compatibility, streaming standard
- **MKV**: High-quality remux, less browser support
- **WebM**: Open format, Chrome/Firefox preferred

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

#### Android
- Highly fragmented support
- Dolby Vision varies by manufacturer
- Shows Widevine L1 (hardware) or L3 (software) capability

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
- **UI improvements**: Dark mode is sacred, but make it better

See [adding new codecs](#adding-new-codecs) below.

## Support & Community

- 🐛 [Report issues](https://github.com/nofear0411/codecprobe/issues)
- 💡 [Request features](https://github.com/nofear0411/codecprobe/issues)
- 💬 [Discussions](https://github.com/nofear0411/codecprobe/discussions)

**Found this useful?** Star the repo and share with your media server community!

---

### Adding New Codecs
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
                type: 'file',
                video: {
                    contentType: 'video/mp4; codecs="codec-string"',
                    width: 3840,
                    height: 2160,
                    bitrate: 25000000,
                    framerate: 24
                }
            }
        }
    ]
}
```

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
- **ISO/IEC 14496** (MPEG-4)
- **ISO/IEC 23008** (HEVC/HDR)
- **ISO/IEC 23090** (AV1)
- Dolby Vision Bitstream Specification
- DTS Technical Documentation
- Apple HLS Authoring Specification
- DASH-IF Implementation Guidelines

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
- Everyone who's filed a "why won't this play" bug report

## Contributing

- 🐛 [Report a bug](https://github.com/nofear0411/codecprobe/issues)
- 💡 [Request a feature](https://github.com/nofear0411/codecprobe/issues)

---

**Note**: This tool tests browser API responses, not actual file playback. Supported codecs still require properly encoded source files.
