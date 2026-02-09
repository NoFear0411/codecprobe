# Contributing to CodecProbe

## Setup

1. Fork and clone
2. `npm install`
3. `git checkout -b your-feature`
4. `npm run dev` (server + SCSS watcher) or `python -m http.server 8000`
5. Make changes, `npm run build`, push, open PR

## Code Standards

### Dependencies

**Runtime**: Zero. UAParser.js v2.x is bundled at build time in `js/vendor/`.

**Dev only**: sass, terser, ua-parser-js, npm-run-all.

### Style

- 4-space indentation
- `const` unless mutation is needed
- Template literals for strings
- JSDoc only on public APIs
- Edit `scss/*.scss`, not `css/` directly
- Commit both SCSS source and compiled CSS

### Naming

- Functions/variables: `camelCase`
- True constants: `UPPER_CASE`
- Files: `kebab-case`

## Adding Codec / Container Tests

The codec database is managed through `scripts/db-tool.mjs` — a CLI that validates, formats, and writes entries at the source level. No manual editing of `codec-database.js` required.

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

### Validation

The `add` command validates every field before touching the database:

- **MIME type** checked against 16 known types (`video/mp4`, `audio/x-matroska`, etc.)
- **Container** checked against 15 known values (`MP4`, `MKV`, `WebM`, `fMP4`, etc.)
- **Name uniqueness** verified across all 14 groups
- **contentType** must match the codec field exactly
- **Dimensions, bitrate, framerate** must be positive numbers
- **transferFunction** and **colorGamut** must be valid enum values if provided

Group detection is automatic from the codec string — `hvc1.*` routes to `video_hevc`, `av01.*` to `video_av1`, `ec-3` to `audio_dolby`, etc. Override with `--group <key>` when needed.

### Codec string formats

- HEVC: `hvc1.{profile}.{compat}.L{level*3}.{constraints}` (in-band) / `hev1.*` (out-of-band)
- AV1: `av01.{profile}.{level}{tier}.{bitDepth}`
- VP9: `vp09.{profile}.{level}.{bitDepth}`
- VVC: `vvc1.{profile}.L{level*3}.CQ{x}.S{bits}` / `vvi1.*`
- Dolby Vision: `dvh1.{profile:02d}.{level:02d}` / `dvhe.*` / `dva1.*` / `dav1.*`
- DTS tags: `dtsc` (Core), `dtsh` (HD), `dtse` (Express), `dtsl` (Lossless), `dtsx` (DTS:X)

Use the relevant spec (ITU, ISO/IEC, ETSI) for correct strings. The education system cites 38 specifications — check existing entries for format examples.

## Adding Education Content

Each codec entry can have an `education` object with codec string breakdowns, platform notes, streaming details, and spec references. The database CLI handles scaffolding and injection.

### Scaffold → edit → inject

```bash
# 1. Generate a template for all entries missing education
node scripts/db-tool.mjs scaffold video_av1 > /tmp/av1-edu.mjs

# 2. Edit the file — fill in token meanings and overviews

# 3. Preview what will change
node scripts/db-tool.mjs inject video_av1 /tmp/av1-edu.mjs --dry-run

# 4. Inject into the database
node scripts/db-tool.mjs inject video_av1 /tmp/av1-edu.mjs
```

The scaffold pre-fills MIME types, tokenized codec strings, and spec references based on the group — you only need to write the human content (token meanings, overviews, platform notes).

### Education entry structure

```javascript
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

### Updating existing education

Use `patch` to deep-merge new fields into existing education entries (add platform notes, new references, streaming details):

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

### Education coverage

Run `node scripts/db-tool.mjs stats` to see which groups have incomplete education coverage. Run `node scripts/db-tool.mjs list <group> --missing` to find specific entries that need content.

## Platform Quirks

If you find a new browser/device-specific behavior:

1. Add to README.md under **Platform-Specific Behavior**
2. Add detection in `logNotableFindings()` if possible
3. Comment near the relevant test code

Known quirks worth documenting: Safari hiding DV in `canPlayType()`, webOS race conditions in capability detection, iOS hardware-vs-display mismatches, Android fragmentation across SoCs.

## Bug Fixes and UI/UX

- **Bug fixes** — edge cases in detection, rendering, or export
- **Accessibility** — ARIA improvements, screen reader behavior, keyboard navigation
- **Responsive layout** — intrinsic CSS issues, TV browser quirks
- **Theme improvements** — contrast, readability, new theme proposals

## Testing

Test on at least 2 browsers before submitting. Check:

- Filter buttons and search
- Export generates valid JSON
- Console has no errors
- Keyboard shortcuts (`/` for search, `Ctrl+E` expand, `Esc` to clear)
- Build completes: `npm run build`

## Pull Requests

- One feature/fix per PR
- Describe what problem it solves
- Update docs if adding features

Title format: `Add:`, `Fix:`, `Update:`, `Refactor:`

## License

Contributions are licensed under AGPL-3.0-or-later. See [LICENSE](LICENSE).
