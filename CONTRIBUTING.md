# Contributing to CodecProbe

Thanks for your interest! This project aims to help media server users understand codec support across browsers.

## Quick Start

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/codecprobe.git`
3. Create a branch: `git checkout -b your-feature`
4. Test locally: `python -m http.server 8000`
5. Make your changes
6. Push and create a PR

## Code Standards

### No Dependencies

This project uses vanilla JavaScript - no npm packages, no build step. Keep it that way.

### File Structure

- `js/codec-database.js` - Codec test definitions
- `js/device-detection.js` - Browser/OS detection
- `js/codec-tester.js` - API testing logic
- `js/ui-renderer.js` - Results rendering
- `js/main.js` - Initialization
- `css/styles.css` - All styling

### Style Guidelines

**JavaScript**:
- 4-space indentation
- Use `const` unless you need mutation
- Template literals for strings
- JSDoc for public functions only

**CSS**:
- Use CSS custom properties (see `:root` in styles.css)
- Mobile-first responsive design
- Dark theme only (no light mode needed)

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
