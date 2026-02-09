# Contributing

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

## Adding Codecs

Edit `js/codec-database.js`. Follow existing structure:

```javascript
video_yourcodec: {
    category: "Category Name",
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
                    width: 1920,
                    height: 1080,
                    bitrate: 5000000,
                    framerate: 24
                }
            }
        }
    ]
}
```

Codec string formats:
- HEVC: `hvc1.x.x.Lxxx.Bx` (in-band) / `hev1` (out-of-band)
- AV1: `av01.0.xxM.xx`
- VP9: `vp09.xx.xx.xx`

Use the relevant spec or MDN for correct strings.

## Platform Quirks

If you find a new browser/platform quirk:

1. Add to README.md under platform notes
2. Add detection in `logNotableFindings()` if possible
3. Comment near the relevant test code

Known quirks: Safari hides DV in canPlayType, webOS has race conditions in capability detection, iOS hardware vs display mismatch.

## Testing

Test on at least 2 browsers before submitting. Check:

- Filter buttons and search
- Export generates valid JSON
- Console has no errors
- Keyboard shortcuts (/ for search, Ctrl+E expand, Esc to clear)

## Pull Requests

- One feature/fix per PR
- Describe what problem it solves
- Update docs if adding features

Title format: `Add:`, `Fix:`, `Update:`, `Refactor:`

## License

Contributions are licensed under MIT.
