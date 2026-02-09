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

## JS Build Process (`build.js`)

1. Reads all `.js` files from `js/`
2. Minifies with Terser (strips console.logs and comments)
3. Outputs to `build/js/`
4. Copies `ua-parser.min.js` to `js/vendor/`
5. Generates `build/version-manifest.json` with MD5 hashes of 10 files

## Version Injection (`inject-versions.js`)

Reads the version manifest and appends `?v=abc123` to all asset references in `index.html`. Output goes to `deploy/index.html`.

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
