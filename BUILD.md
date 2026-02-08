# Build Instructions

## Development Setup

### Install Dependencies

```bash
npm install
```

This installs:
- `sass` - SCSS compiler
- `terser` - JavaScript minification
- `ua-parser-js` - Browser detection library (bundled at build time)
- `npm-run-all` - Run multiple scripts in parallel

### Development Mode (Watch SCSS + Serve)

```bash
npm run dev
```

This runs:
1. Local server on http://localhost:8000
2. SCSS watcher (auto-compiles on changes)

### Build Everything

```bash
npm run build
```

This runs:
1. **CSS Build**: Compiles SCSS → compressed CSS
2. **JS Build**: Minifies JavaScript + bundles UAParser.js + generates version manifest

Output:
- `css/styles.css` - Compiled and compressed CSS
- `build/js/*.js` - Minified JavaScript (for production)
- `js/vendor/ua-parser.min.js` - Bundled UAParser.js v2.x
- `build/version-manifest.json` - MD5 hashes of all assets (for cache busting)

### Build for Deployment

```bash
npm run build:deploy
```

This runs:
1. **Full build** (CSS + JS + version manifest)
2. **Version injection** - Creates `deploy/index.html` with versioned asset URLs

Output:
- All build outputs (above)
- `deploy/index.html` - HTML with `?v=abc123` version parameters on all assets
- Ready for deployment to production

### Build CSS Only

```bash
npm run build:css
```

Compiles:
- `scss/styles.scss` → `css/styles.css` (compressed)
- `scss/_themes.scss` → imported into styles.css

### Build JS Only

```bash
npm run build:js
```

This runs `node build.js` which:
1. Minifies all JS files in `js/` directory using Terser
2. Removes console.log statements for production
3. Outputs to `build/js/`
4. **Bundles UAParser.js** from node_modules to `js/vendor/`
5. Reports file sizes and compression savings

### Watch CSS Only

```bash
npm run watch:css
```

Auto-compiles SCSS on file changes (dev mode)

## SCSS Structure

```
scss/
├── styles.scss      # Main stylesheet (imports _themes.scss)
└── _themes.scss     # Theme definitions (Dark OLED, Light, Retro Terminal)
```

**Variables:**
- Colors: `$accent`, `$blue`, `$yellow`, `$red`, etc.
- Spacing: `$spacing-xs` through `$spacing-xl`
- Typography: `$font-stack`, `$font-mono`

**Mixins:**
- `@include card` - Card styling
- `@include card-hover` - Hover effects

**Themes:**
- Dark OLED (default): Pure blacks for OLED displays
- Light: High contrast light mode
- Retro Terminal: CRT aesthetics with scanlines

Each theme defines its own color palette using CSS custom properties.

## JavaScript Build Process

The `build.js` script:
1. Reads all `.js` files from `js/` directory
2. Minifies with Terser (removes console.logs, comments)
3. Outputs to `build/js/` for production deployment
4. **Bundles UAParser.js v2.x** from node_modules to `js/vendor/`
5. **Generates version manifest** with MD5 hashes of all assets
6. Reports compression statistics

**UAParser.js Bundling:**
- Source: `node_modules/ua-parser-js/dist/ua-parser.min.js`
- Destination: `js/vendor/ua-parser.min.js` (35.3 KB)
- Bundled at build time for offline capability
- No CDN requests required

**Version Manifest Generation:**
- Creates `build/version-manifest.json` with MD5 hashes
- Hashes 10 files: 8 JS + 1 CSS + 1 vendor
- Used by `inject-versions.js` for cache busting
- Example: `{"timestamp": 1234567890, "hashes": {"main.js": "abc123", ...}}`

**Version Injection (`inject-versions.js`):**
- Reads version manifest and injects hashes into HTML
- Converts `<script src="js/main.js">` to `<script src="js/main.js?v=abc123">`
- Output: `deploy/index.html` with all versioned asset references
- Ensures browsers always fetch latest code after updates

## webOS Optimizations

The SCSS includes specific optimizations for LG webOS TVs:
- Larger text for TV viewing distance (18px base)
- Larger tap targets (min 48px, 56px for TV)
- Larger hover effects for remote control navigation
- Smooth transitions optimized for TV hardware
- 3px focus outlines for TV remote navigation

## Production Deployment

### GitHub Pages (Automatic)

The workflow automatically handles building and version injection:

1. **GitHub Actions** runs on push to main
2. Compiles SCSS if changed
3. Minifies JavaScript and bundles UAParser.js
4. **Generates version manifest** with MD5 hashes
5. **Injects version parameters** into HTML (`inject-versions.js`)
6. Deploys versioned `deploy/index.html` to GitHub Pages

**Cache Busting:**
- Assets load with `?v=abc123` query parameters
- `_headers` file sets cache-control:
  - HTML: `max-age=0, must-revalidate`
  - Assets: `max-age=31536000, immutable`
- No hard refresh needed

### Manual Deployment

1. Run `npm run build` to compile CSS, minify JS, and generate version manifest
2. Run `node inject-versions.js` to create versioned HTML
3. Commit source files (not build outputs)
4. Push to repository

**Files to commit:**
- `scss/*.scss` - Source SCSS
- `css/styles.css` - Compiled CSS
- `css/styles.css.map` - Source map
- `js/*.js` - Source JavaScript
- `js/vendor/ua-parser.min.js` - Bundled UAParser.js
- `inject-versions.js` - Version injection script
- `_headers` - Cache control headers

**Files NOT committed:**
- `build/` - Generated build outputs
- `deploy/` - Generated deployment directory

## Modifying Styles

1. Edit `scss/styles.scss` or `scss/_themes.scss`
2. Run `npm run watch:css` (auto-compiles on save)
3. Test changes in browser
4. Run `npm run build:css` for production
5. Commit both SCSS and compiled CSS

## Modifying Codec Database

1. Edit `js/codec-database.js`
2. Add new codecs following existing structure
3. No build step needed (vanilla JavaScript)
4. Test in browser immediately
5. Commit changes

## Adding New Themes

1. Edit `scss/_themes.scss`
2. Add new theme class with CSS custom properties
3. Update `js/theme-manager.js` with theme metadata
4. Run `npm run build:css` to compile
5. Test theme switching in browser

## Dependencies

**Runtime**: Zero external dependencies
- UAParser.js v2.x bundled at build time (AGPL-3.0)

**Development**:
- `sass@^1.70.0` - SCSS compilation
- `terser@^5.46.0` - JavaScript minification
- `ua-parser-js@^2.0.9` - Browser detection (bundled)
- `npm-run-all@^4.1.5` - Parallel script execution

## Troubleshooting

**SCSS not compiling:**
```bash
npm install sass --save-dev
npm run build:css
```

**UAParser.js not found:**
```bash
npm install
npm run build:js
```

**Build directory missing:**
- Build directory is created automatically by `build.js`
- Not committed to git (only source files)

**CSS changes not showing:**
- Clear browser cache
- Check `css/styles.css` was updated
- Verify SCSS compilation ran without errors
