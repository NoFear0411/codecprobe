# Changelog

## [1.1.0] - 2026-02-08

### Added
- **Multi-Theme System** - 4 distinctive themes with instant switching
  - Dark OLED: Pure blacks for OLED displays (default)
  - Light: Professional light mode with high contrast
  - Brutalist: Raw, utilitarian design with extreme contrast and bold typography
  - Retro Terminal: Vintage computer aesthetic with CRT scanlines and phosphor glow
  - Theme switcher UI with visual previews
  - LocalStorage persistence for theme preference
  - Smooth theme transitions
- **SCSS Build System** - Modern SCSS with variables, mixins, and better organization
  - Responsive design with clamp() for fluid typography
  - TV-optimized UI (larger touch targets 48px-56px, 18px base text for viewing distance)
  - Collapsible device info to reduce clutter
  - Better visual hierarchy and spacing system ($spacing-xs through $spacing-xl)
- **TV Browser Support** - Improved compatibility with TV platforms (webOS, etc.)
  - DRM detection timeout handling (3s per system, 8s overall)
  - Non-blocking DRM tests (page loads even if DRM times out)
  - Keyboard/remote control navigation (Enter/Space key support)
  - 3px focus outlines for TV remote navigation
- **Platform-Agnostic Logging** - Clean debug output
  - `[Debug]` - General debugging
  - `[DRM]` - DRM detection events
  - `[UI]` - User interaction events
- **DRM/EME Testing** - Test encrypted media extensions support:
  - Widevine (Google) - Shows L1 (hardware) vs L3 (software) security level
  - PlayReady (Microsoft) - For Edge/Xbox platforms
  - FairPlay (Apple) - For Safari/iOS platforms
  - ClearKey (W3C) - Standard unencrypted key system
  - Security level, robustness, and persistent state detection
  - DRM info displayed in device information section
- Search functionality to filter codecs by name, container, or codec string
- Keyboard shortcuts:
  - `/` to focus search input
  - `Esc` to clear search
- PWA support with manifest.json
- Favicon (SVG format)
- Accessibility improvements:
  - ARIA labels on all interactive elements
  - Skip-to-content link for keyboard navigation
  - Proper role attributes for semantic HTML
  - High contrast mode support
  - Reduced motion support
- SEO improvements:
  - Open Graph meta tags
  - Twitter Card meta tags
  - Schema.org structured data
  - Canonical URL
- GitHub Actions workflow for automatic deployment
- Documentation:
  - CLAUDE.md for AI assistant context
  - CONTRIBUTING.md with contribution guidelines
  - CHANGELOG.md (this file)
- Project configuration:
  - .gitignore
  - package.json
  - .editorconfig

### Changed
- Improved state management in ui-renderer.js (const object vs let variables)
- Reduced overuse of "comprehensive" in user-facing text
- Enhanced filter logic to support both category filters and text search
- Updated README with new features
- Grid layout now uses `minmax(min(100%, 500px), 1fr)` for proper responsive behavior
- All interactive buttons now support keyboard navigation (tabindex, Enter/Space keys)

### Fixed
- Variable scoping issues in ui-renderer.js
- Codec card overflow on TV browsers (cards now constrain to viewport width)
- Button interaction with TV remote controls (added keyboard event handlers)
- DRM detection showing incomplete results (added proper timeout handling and error logging)
- Focus styles for TV navigation (3px visible outlines)

## [1.0.0] - Initial Release

### Added
- Multi-API codec testing (canPlayType, isTypeSupported, mediaCapabilities)
- 80+ codec test combinations
- Device detection and fingerprinting
- Export results as JSON
- Filter by codec type and support level
- Dark theme UI
- Zero dependencies
