# Contributing to CodecProbe

Thanks for your interest! This project aims to help media server users understand codec support across browsers.

## Quick Start

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/codecprobe.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b your-feature`
5. Start dev mode: `npm run dev` (or `python -m http.server 8000`)
6. Make your changes
7. Build if needed: `npm run build`
8. Push and create a PR

## Code Standards

### Dependencies

**Runtime**: Zero external dependencies
- UAParser.js v2.x bundled at build time (in `js/vendor/`)
- Works fully offline

**Development** (build tools only):
- `sass` - SCSS compilation
- `terser` - JavaScript minification
- `ua-parser-js` - Browser detection (bundled)

Keep runtime dependencies at zero - only add dev dependencies for build tools.

### File Structure

**JavaScript**:
- `js/codec-database.js` - 110+ codec test definitions
- `js/device-detection.js` - UAParser.js v2.x integration (async)
- `js/drm-detection.js` - DRM/EME testing
- `js/codec-tester.js` - Multi-API testing logic
- `js/ui-renderer.js` - Results rendering, dynamic API badges
- `js/theme-manager.js` - Theme switching
- `js/url-state.js` - URL state management
- `js/main.js` - Initialization (async)
- `js/vendor/ua-parser.min.js` - Bundled browser detection

**Styles**:
- `scss/styles.scss` - Main stylesheet (source)
- `scss/_themes.scss` - Theme definitions
- `css/styles.css` - Compiled CSS (committed to git)

### Style Guidelines

**JavaScript**:
- 4-space indentation
- Use `const` unless you need mutation
- Template literals for strings
- JSDoc for public functions only

**SCSS/CSS**:
- Edit `scss/styles.scss` or `scss/_themes.scss` (not compiled CSS directly)
- Use CSS custom properties for theming
- Mobile-first responsive design
- Build with `npm run build:css` before committing
- Commit both SCSS source and compiled CSS

**Themes**:
- Dark OLED (default), Light, Retro Terminal
- Each theme uses CSS custom properties
- No inline styles - use theme variables

**Naming**:
- Functions: `camelCase` (renderResults, testCodec)
- Variables: `camelCase` (codecResult, deviceInfo)
- Constants: `UPPER_CASE` only for true constants (API_METHODS)
- Files: `kebab-case` (codec-database.js)

## Adding New Codecs

Edit `js/codec-database.js`:

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

**Codec string format matters**:
- HEVC: `hvc1.x.x.Lxxx.Bx` (in-band params) or `hev1` (out-of-band)
- AV1: `av01.0.xxM.xx`
- VP9: `vp09.xx.xx.xx.xx`

Check MDN or codec specifications for correct strings.

## Platform-Specific Quirks

If you discover new browser/platform quirks:

1. Add to README.md under "Platform-Specific Notes"
2. Add console log in `js/main.js` `logNotableFindings()` if detection is possible
3. Document in code comments near relevant test

Example platforms with quirks:
- Safari: Hides DV support in canPlayType()
- webOS: Race conditions in capability detection
- iOS: Hardware vs display capabilities mismatch

## Testing

### Manual Testing

Test on multiple browsers:
- Chrome/Edge (Chromium)
- Firefox
- Safari (macOS/iOS)
- webOS if possible

Check:
- All filter buttons work
- Search works (try partial matches)
- Export generates valid JSON
- Console has no errors
- Keyboard shortcuts work (/ for search, Esc to clear)

### Test Codec Strings

Use these online validators:
- MP4Box.js online: https://gpac.github.io/mp4box.js/test/filereader.html
- Can I Use: https://caniuse.com/

## Pull Request Process

1. **Describe the change**: What problem does it solve?
2. **Test locally**: Verify it works in at least 2 browsers
3. **Keep it focused**: One feature/fix per PR
4. **Update docs**: If you add features, update README.md

### PR Title Format

- `Add: [feature name]` - New features
- `Fix: [issue]` - Bug fixes
- `Update: [what]` - Documentation or minor improvements
- `Refactor: [what]` - Code cleanup

### What Gets Merged

✅ New codec tests with correct strings
✅ Bug fixes with clear reproduction steps
✅ Performance improvements (with benchmarks)
✅ UI improvements that maintain dark theme
✅ Platform quirk documentation

❌ Dependencies (npm packages, frameworks)
❌ Build tools (webpack, babel, etc.)
❌ Light mode (not planned)
❌ Backend features (stays client-side only)

## Questions?

- 🐛 [Open an issue](https://github.com/nofear0411/codecprobe/issues)
- 💬 [Start a discussion](https://github.com/nofear0411/codecprobe/discussions)

## License

By contributing, you agree your contributions will be licensed under the MIT License.
