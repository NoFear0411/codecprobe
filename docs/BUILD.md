# Build

## Commands

| Command | What it does |
|---------|-------------|
| `npm install` | Install dev dependencies |
| `npm run dev` | Server + SCSS watcher |
| `npm run build` | Full build (CSS + JS + vendor + manifest) |
| `npm run build:css` | SCSS to compressed CSS |
| `npm run build:js` | Minify JS + bundle UAParser + version manifest |
| `npm run build:deploy` | Full build + version injection for production |
| `npm run watch:css` | Auto-compile SCSS on change |

## Build Output

| Source | Output |
|--------|--------|
| `scss/styles.scss` + `scss/_themes.scss` | `css/styles.css` (compressed) |
| `js/*.js` | `build/js/*.js` (minified, console.logs stripped) |
| `node_modules/ua-parser-js/dist/` | `js/vendor/ua-parser.min.js` (35.3 KB) |
| All assets | `build/version-manifest.json` (MD5 hashes) |
| `index.html` + manifest | `deploy/index.html` (versioned asset URLs) |

## SCSS Structure

```
scss/
├── styles.scss      # Main stylesheet
└── _themes.scss     # Theme definitions (Dark OLED, Light, Retro Terminal)
```

Variables: `$accent`, `$blue`, `$yellow`, `$red`, `$spacing-xs` through `$spacing-xl`, `$font-stack`, `$font-mono`.

Mixins: `@include card`, `@include card-hover`.

## JS Build Process (`scripts/build.js`)

1. Reads all `.js` ES modules from `js/`
2. Minifies with Terser (`module: true`, strips `console.log`/`console.debug`, preserves `console.warn`/`console.error`)
3. Outputs to `build/js/`
4. Bundles `ua-parser.min.js` to `build/js/vendor/` and `js/vendor/`
5. Generates `build/version-manifest.json` with MD5 hashes (dynamic file list)

## Version Injection (`scripts/inject-versions.js`)

1. Appends `?v=abc123` to asset references in `index.html` (CSS, JS entry point, vendor)
2. Appends `?v=abc123` to ES module `import` paths in `build/js/*.js`
3. Output goes to `deploy/index.html` (built JS files are modified in-place)

Cache headers (`_headers` file):
- HTML: `max-age=0, must-revalidate`
- Assets: `max-age=31536000, immutable`

## Dependencies

**Runtime**: None. UAParser.js v2.x (AGPL-3.0) is bundled at build time.

**Dev**:
- `sass` -- SCSS compilation
- `terser` -- JS minification
- `ua-parser-js` -- browser detection (bundled, not loaded at dev time)
- `npm-run-all` -- parallel script execution

## What to Commit

Commit: `scss/*.scss`, `css/styles.css`, `css/styles.css.map`, `js/*.js`, `js/vendor/ua-parser.min.js`

Do not commit: `build/`, `deploy/`, `node_modules/`

## Troubleshooting

**SCSS not compiling**: `npm install sass --save-dev && npm run build:css`

**UAParser.js not found**: `npm install && npm run build:js`

**CSS changes not showing**: Clear browser cache, verify `css/styles.css` was updated.
