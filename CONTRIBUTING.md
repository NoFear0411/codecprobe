# Contributing to CodecProbe

## Setup

1. Fork and clone
2. `npm install`
3. `git checkout -b your-feature`
4. `npm run dev` (server + SCSS watcher) or `npx http-server -p 8000 -c-1`
5. `npm run typecheck` to check for type errors
6. Make changes, `npm run build`, push, open PR

## Code Standards

### Dependencies

**Runtime**: Zero. UAParser.js v2.x is bundled at build time in `js/vendor/`.

**Dev only**: sass, terser, typescript, ua-parser-js, npm-run-all.

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

## Adding Codec Records

The v2 database (`js/codec-database-v2.js`) uses bare codec strings as primary keys. Full MIME strings are built at test time by `buildMime(codec, container, type)`. All mutations go through the CLI tool — no manual editing of the database file.

### Codec String Validation

Every codec string **must** be validated before insertion using [codec-resolve](https://github.com/nofear0411/codec-resolve):

```bash
python -m codec_resolve --decode "hvc1.2.4.L153.B0"
# ✓ HEVC Main 10, Level 5.1, Main Tier

python -m codec_resolve --decode "av01.0.12M.10"
# ✓ AV1 Main Profile, Level 5.0 Main tier, 10-bit
```

codec-resolve currently supports: HEVC, AVC/H.264, AV1, VP9, VP8, Dolby Vision.

Groups that require a new decoder before migration can proceed:
- VVC/H.266 — needs `vvc/` module
- Legacy (Theora, H.263, MPEG-4 Part 2) — needs `theora/`, `h263/`, `mp4v/` modules
- All audio groups — needs audio decoders

### CREATE a new record

Provide the codec string, display name, and first scenario:

**Video example:**

```bash
node scripts/db-tool-v2.mjs create hvc1.2.4.L153.B0 \
  --name "HEVC Main 10 4K HDR10" \
  --sname "4K HDR10 24fps" \
  --width 3840 --height 2160 --fps 24 --bitrate 25000000 \
  --depth 10 --chroma 4:2:0 --transfer pq --gamut rec2020 --hdr hdr10
```

**Audio example:**

```bash
node scripts/db-tool-v2.mjs create opus \
  --name "Opus" \
  --sname "Stereo 48kHz" \
  --channels 2 --samplerate 48000 --bitrate 128000
```

### INSERT a scenario

Add another scenario to an existing record:

```bash
node scripts/db-tool-v2.mjs insert hvc1.2.4.L153.B0 scenario \
  --sname "4K HLG 60fps" \
  --width 3840 --height 2160 --fps 60 --bitrate 40000000 \
  --depth 10 --transfer hlg --gamut rec2020 --hdr hlg
```

### UPDATE, DELETE, RENAME, DROP

```bash
# Update a field
node scripts/db-tool-v2.mjs update hvc1.2.4.L153.B0 name="New Display Name"

# Rename a codec string (PK + comments + breakdown tokens)
node scripts/db-tool-v2.mjs rename avc1.4d001f avc1.4D001F

# Delete a scenario by name
node scripts/db-tool-v2.mjs delete hvc1.2.4.L153.B0 scenario "4K HLG 60fps"

# Drop an entire record (requires --confirm)
node scripts/db-tool-v2.mjs drop hvc1.2.4.L153.B0 --confirm
```

All mutations support `--dry-run` for preview. Every write is validated with `node -c` before hitting disk.

### Auto-population

When inserting a record, the tool automatically populates:

- **Containers** — file and stream arrays based on codec family defaults (e.g., HEVC gets mp4, mkv, mov, webm for file; fmp4, hls, dash, cmaf for stream)
- **DRM** — `['widevine', 'playready', 'fairplay', 'clearkey']`
- **Education skeleton** — tokenized `breakdown` with empty meanings, empty `overview`, placeholder objects for `platforms`, `streaming`, `containerNotes`, `references`
- **Group** — auto-detected from codec string (override with `--group <key>`)

### Always verify after changes

```bash
node scripts/db-tool-v2.mjs verify
```

This runs five-tier validation: syntax check, module import, group structure, record fields, and scenario fields (media-type-specific). It also detects duplicate codec strings across groups.

### Codec string formats

- HEVC: `hvc1.{profile}.{compat}.L{level*3}.{constraints}` / `hev1.*`
- AV1: `av01.{profile}.{level:02d}{tier}.{bitDepth}`
- VP9: `vp09.{profile:02d}.{level:02d}.{bitDepth}`
- VP8: `vp8` / `vp08.{profile}.{level}.{bitDepth}`
- VVC: `vvc1.{profile}.L{level*3}.CQ{x}.S{bits}` / `vvi1.*`
- Dolby Vision: `dvh1.{profile:02d}.{level:02d}` / `dvhe.*` / `dva1.*` / `dav1.*` / `dvav.*`
- Supplemental DV: `hvc1.2.4.L153.B0, dvh1.08.06` (comma-separated, HEVC base + DV enhancement)
- DTS tags: `dtsc` (Core), `dtsh` (HD), `dtse` (Express), `dtsl` (Lossless), `dtsx` (DTS:X)
- Hyphenated audio: `ac-3`, `ec-3`, `ac-4`

Use the relevant spec (ITU, ISO/IEC, ETSI) for correct strings. Check existing entries in the database for format examples.

## Adding Education Content

Each codec record has an `education` object. The INSERT command auto-creates a skeleton — you fill in the content using CLI education commands. All mutations go through the CLI tool.

### v2 education structure

```javascript
education: {
    breakdown: [
        { token: 'hvc1', meaning: 'HEVC with out-of-band parameter sets. Required by Apple HLS.' },
        { token: '2', meaning: 'Main 10 Profile (profile_idc=2). 8/10-bit 4:2:0.' },
        { token: '4', meaning: 'Profile compatibility flags. Bit 2 set — Main 10 tier.' },
        { token: 'L153', meaning: 'Level 5.1 (153 = 51 × 3). Supports 4K @ 60fps.' },
        { token: 'B0', meaning: 'General constraint flags. B0 = no constraints beyond profile.' }
    ],
    overview: 'HEVC Main 10 at Level 5.1. Supports 10-bit 4:2:0 for HDR content in MP4/MKV.',
    platforms: {
        apple: 'Hardware decode on A8+ and all Apple Silicon. HLS requires hvc1 tag + fMP4.',
        android: 'Hardware decode on Snapdragon 820+ and Exynos 8890+ via MediaCodec.'
    },
    streaming: {
        hls: [
            {
                signal: '4K HDR10',
                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=25000000,...,VIDEO-RANGE=PQ\nvariant.m3u8`,
                notes: 'Apple HLS requires hvc1 tag. Segments must be fMP4.'
            }
        ],
        dash: [
            {
                signal: '4K HDR10',
                mpd: `<Representation codecs="hvc1.2.4.L153.B0" .../>`,
                notes: 'DASH uses ISOBMFF (fMP4) segments exclusively.'
            }
        ]
    },
    containerNotes: {
        mp4: 'ISOBMFF — universal HEVC container with hvcC sample entry box.',
        mkv: 'Browser support for video/x-matroska is limited. Android Chrome may accept it.'
    },
    references: [
        { title: 'ITU-T H.265', url: 'https://www.itu.int/rec/T-REC-H.265' }
    ]
}
```

Key differences from v1: `breakdown` is a flat array of `{token, meaning}` objects — not nested under `codecBreakdown.parts[]`.

### What the skeleton looks like

After INSERT, the tool generates a skeleton with tokenized breakdown (empty meanings) and empty fields:

```javascript
education: {
    breakdown: [
        { token: 'av01', meaning: '' },
        { token: '0', meaning: '' },
        { token: '08M', meaning: '' },
        { token: '10', meaning: '' }
    ],
    overview: '',
    platforms: {},
    streaming: {},
    containerNotes: {},
    references: []
}
```

Fill in the `meaning` for each token and write the `overview`. The other fields (`platforms`, `streaming`, `containerNotes`, `references`) are optional but encouraged.

### Quality guidelines

- **1-3 sentences per field**. Factual, cite specs where relevant.
- **Token meanings**: Explain what the value means in the codec standard. Include the spec field name (e.g., `profile_idc=2`).
- **Overview**: What this codec configuration is for. Don't repeat what the tokens already say.
- No filler language. No "comprehensive", "robust", "ensures". Direct and specific.

### Editing via CLI

Use dot-path `update` to modify individual education fields:

```bash
# Set overview
node scripts/db-tool-v2.mjs update hvc1.2.4.L153.B0 \
  education.overview="HEVC Main 10 at Level 5.1."

# Set a platform note
node scripts/db-tool-v2.mjs update hvc1.2.4.L153.B0 \
  education.platforms.apple="Hardware decode on A8+ and all Apple Silicon."

# Set a container note
node scripts/db-tool-v2.mjs update hvc1.2.4.L153.B0 \
  education.containerNotes.mp4="ISOBMFF with hvcC sample entry box."
```

Manage references:

```bash
# Add a reference
node scripts/db-tool-v2.mjs insert hvc1.2.4.L153.B0 ref \
  --title "ITU-T H.265" --url "https://www.itu.int/rec/T-REC-H.265"

# Remove a reference by title
node scripts/db-tool-v2.mjs delete hvc1.2.4.L153.B0 ref "ITU-T H.265"
```

Add streaming entries (HLS/DASH):

```bash
# Add an HLS entry
node scripts/db-tool-v2.mjs insert hvc1.2.4.L153.B0 hls \
  --signal "4K HDR10" \
  --m3u8 "#EXT-X-STREAM-INF:BANDWIDTH=25000000,...,VIDEO-RANGE=PQ\nvariant.m3u8" \
  --notes "Apple HLS requires hvc1 tag."

# Add a DASH entry
node scripts/db-tool-v2.mjs insert hvc1.2.4.L153.B0 dash \
  --signal "4K HDR10" \
  --mpd "<Representation codecs=\"hvc1.2.4.L153.B0\" .../>" \
  --notes "DASH uses ISOBMFF segments."
```

Bulk-import education from a JSON file:

```bash
node scripts/db-tool-v2.mjs update hvc1.2.4.L153.B0 --edu-from education.json
```

The JSON file should match the education structure above. This replaces the entire education object for the record.

### Checking coverage

```bash
# Coverage table — shows Recs, Edu, Strm, Cntr, Refs per group
node scripts/db-tool-v2.mjs select --stats

# List records with OSCR flags (Overview, Streaming, ContainerNotes, References)
# Green = populated, dim = missing
node scripts/db-tool-v2.mjs select --group video_hevc

# Filter to records missing education overview
node scripts/db-tool-v2.mjs select --group video_hevc --missing

# Filter to records with education overview
node scripts/db-tool-v2.mjs select --group video_hevc --edu

# Verify structure + education completeness (reports errors, warnings, gaps)
node scripts/db-tool-v2.mjs verify
```

## CLI Reference

All commands run via `node scripts/db-tool-v2.mjs <verb> [args]`.

### Read

| Command | Description |
|---------|-------------|
| `select <codec>` | Show full record details including education content |
| `select --stats` | Coverage table with Recs, Edu, Strm, Cntr, Refs columns per group |
| `select --group <key> [--missing\|--edu]` | List records with OSCR flags |

### Write

| Command | Description |
|---------|-------------|
| `create <codec> --name <n> [scenario opts]` | Insert new record with first scenario |
| `insert <codec> scenario [scenario opts]` | Add scenario to existing record |
| `insert <codec> ref --title <t> [--url <u>]` | Add a reference entry |
| `insert <codec> hls --signal <s> --m3u8 <m> [--notes <n>]` | Add HLS streaming entry |
| `insert <codec> dash --signal <s> --mpd <m> [--notes <n>]` | Add DASH streaming entry |
| `update <codec> key=value` | Update field (supports dot-paths like `education.overview`) |
| `update <codec> --edu-from <path.json>` | Replace education from JSON file |
| `rename <codec> <new-codec>` | Rename codec (PK + comments + breakdown tokens) |
| `delete <codec> scenario <name>` | Remove a scenario by name |
| `delete <codec> ref <title>` | Remove reference by title |
| `drop <codec> --confirm` | Drop entire record |

### Validate

| Command | Description |
|---------|-------------|
| `verify` | Structure validation + education completeness (errors, warnings, gaps) |

### Flags

**Video scenario**: `--sname` (required), `--width`, `--height`, `--fps`, `--bitrate` (required), `--depth`, `--chroma`, `--transfer`, `--gamut`, `--hdr`, `--tier` (optional)

**Audio scenario**: `--sname` (required), `--channels`, `--samplerate`, `--bitrate` (required), `--depth`, `--spatial` (optional)

**Options**: `--name <name>` (required for create), `--group <key>` (override auto-detection), `--flags <a,b>` (codec flags), `--dry-run` (preview)

## Database Coverage

91 records across 5 populated groups. Each group requires codec-resolve decoder support before records can be added.

| Group | Records | Status |
|-------|---------|--------|
| video_hevc | 15 | Complete (15 edu, 15 strm, 15 cntr, 15 refs) |
| video_dolby_vision | 29 | Complete (29 edu, 29 strm, 29 cntr, 29 refs) |
| video_av1 | 12 | Complete (12 edu, 12 strm, 12 cntr, 12 refs) |
| video_vp9 | 21 | Complete (21 edu, 21 strm, 21 cntr, 21 refs) |
| video_avc | 14 | Complete (14 edu, 14 strm, 14 cntr, 14 refs) |
| video_vvc | 0 | Blocked — needs codec-resolve `vvc/` decoder |
| video_vp8 | 0 | Blocked — needs codec-resolve `vp8/` decoder |
| video_legacy | 0 | Blocked — needs codec-resolve `theora/`, `h263/`, `mp4v/` decoders |
| audio_dolby | 0 | Blocked — needs codec-resolve audio decoders |
| audio_dts | 0 | Blocked — needs codec-resolve audio decoders |
| audio_lossless | 0 | Blocked — needs codec-resolve audio decoders |
| audio_standard | 0 | Blocked — needs codec-resolve audio decoders |
| audio_mpegh | 0 | Blocked — needs codec-resolve audio decoders |

Contributing a new codec-resolve decoder directly unblocks a group.

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
