# Build

## Commands

| Command | What it does |
|---------|-------------|
| `npm install` | Install dev dependencies |
| `npm run dev` | Server + SCSS watcher |
| `npm run build` | Full build (typecheck + CSS + JS + vendor + manifest + SW version) |
| `npm run typecheck` | `tsc --noEmit` over the JSDoc types in `js/` |
| `npm run build:css` | SCSS to compressed CSS |
| `npm run build:js` | Minify JS + bundle UAParser + version manifest |
| `npm run build:deploy` | Full build + version injection for production |
| `npm run watch:css` | Auto-compile SCSS on change |

## Build Output

| Source | Output |
|--------|--------|
| `scss/styles.scss` + `scss/_themes.scss` | `css/styles.css` (compressed) |
| `js/*.js` | `build/js/*.js` (minified, console.logs stripped) |
| `node_modules/ua-parser-js/dist/` | `js/vendor/ua-parser.min.js` (36.0 KB) |
| All assets | `build/version-manifest.json` (MD5 hashes) |
| `package.json` version | `CACHE_VERSION` in `sw.js`, version strings in `index.html` |
| `index.html` + manifest | `deploy/index.html` (versioned asset URLs) |

## SCSS Structure

```
scss/
├── styles.scss      # Main stylesheet
└── _themes.scss     # Theme definitions (Dark OLED, Light, Retro Terminal)
```

Design tokens (typography, spacing, radius, animation, grid minimums, `--font-mono`) are CSS custom properties in the `:root` block of `styles.scss`. Theme colors are per-theme custom properties in `_themes.scss`. Rules use `var(--token)`; SCSS color variables compile to hardcoded hex and break theme switching.

Mixins: `@include card`, `@include card-hover`.

## JS Build Process (`scripts/build.js`)

1. Reads all `.js` ES modules from `js/`
2. Minifies with Terser (`module: true`, strips `console.log`/`console.debug`, preserves `console.warn`/`console.error`)
3. Outputs to `build/js/`
4. Bundles `ua-parser.min.js` to `build/js/vendor/` and `js/vendor/`
5. Generates `build/version-manifest.json` with MD5 hashes (dynamic file list)
6. Writes the `package.json` version into `CACHE_VERSION` in `sw.js`
7. Syncs the version into `index.html` (footer `app-version` + Schema.org `softwareVersion`)

## Version Injection (`scripts/inject-versions.js`)

1. Appends `?v=abc123` to asset references in `index.html` (CSS, JS entry point, vendor)
2. Appends `?v=abc123` to ES module `import` paths in `build/js/*.js`
3. Injects the app version (footer + Schema.org `softwareVersion`), also syncing it into the source `index.html`
4. Hashes the JSON-LD block and adds the `sha256-...` to the CSP `script-src`
5. Output goes to `deploy/index.html` (built JS files are modified in-place); copies `_headers` to `deploy/`

Runs in CI (`release.yml`). Locally it is part of `npm run build:deploy`.

Cache headers (`_headers` file):
- HTML: `max-age=0, must-revalidate`
- Assets: `max-age=31536000, immutable`

## Screenshots (`scripts/capture-screenshots.mjs`)

```bash
node scripts/capture-screenshots.mjs              # overwrite screenshots/
node scripts/capture-screenshots.mjs --out /tmp/x # write elsewhere
```

Regenerates the PWA install screenshots (Dark OLED, Light, Retro Terminal at 2560x1237) and `og-image.png` (1200x630). Serves the repo itself and drives the first Chrome/Chromium on `PATH` (or `CHROME=/path`) over the DevTools protocol — no npm dependencies, Node 22+. Results come from headless Chrome, which has no GPU decode, so HEVC and Dolby Vision show as unsupported.

## Dependencies

**Runtime**: None. UAParser.js v2.x (AGPL-3.0) is bundled at build time.

**Dev**:
- `sass` -- SCSS compilation
- `terser` -- JS minification
- `typescript` -- typecheck only (`tsc --noEmit`), no TS sources
- `ua-parser-js` -- browser detection (bundled, not loaded at dev time)
- `npm-run-all` -- parallel script execution

## What to Commit

Commit: `scss/*.scss`, `css/styles.css`, `js/*.js`, `js/vendor/ua-parser.min.js`, plus `sw.js` and `index.html` after the build updates their version strings

Do not commit: `build/`, `deploy/`, `node_modules/`, `css/*.map` (gitignored; CI regenerates the map for the deploy)

## Troubleshooting

**SCSS not compiling**: `npm install sass --save-dev && npm run build:css`

**UAParser.js not found**: `npm install && npm run build:js`

**CSS changes not showing**: Clear browser cache, verify `css/styles.css` was updated.
