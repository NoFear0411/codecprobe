# Build Instructions

## Development Setup

### Install Dependencies

```bash
npm install
```

This installs:
- `sass` - SCSS compiler
- `npm-run-all` - Run multiple scripts in parallel

### Development Mode (Watch SCSS + Serve)

```bash
npm run dev
```

This runs:
1. Local server on http://localhost:8000
2. SCSS watcher (auto-compiles on changes)

### Build CSS Only

```bash
npm run build:css
```

Compiles `scss/styles.scss` → `css/styles.css` (compressed)

### Watch CSS Only

```bash
npm run watch:css
```

Auto-compiles SCSS on file changes

## SCSS Structure

```
scss/
└── styles.scss    # Main stylesheet with variables, mixins, components
```

**Variables:**
- Colors: `$accent`, `$green`, `$blue`, etc.
- Spacing: `$spacing-xs` through `$spacing-xl`
- Typography: `$font-stack`, `$font-mono`

**Mixins:**
- `@include card` - Card styling
- `@include card-hover` - Hover effects

## webOS Optimizations

The SCSS includes specific optimizations for LG webOS TVs:
- Larger text for TV viewing distance (18px base)
- Larger tap targets (min 48px, 56px for TV)
- Enhanced hover effects for remote control navigation
- Smooth transitions optimized for TV hardware

## Production Deployment

The compiled `css/styles.css` is committed to git, so GitHub Pages works without a build step. Users can:

1. **Just deploy** - `css/styles.css` is pre-compiled
2. **Or build locally** - Run `npm run build:css` before committing

## Modifying Styles

1. Edit `scss/styles.scss`
2. Run `npm run watch:css` (auto-compiles)
3. Test changes in browser
4. Commit both SCSS and compiled CSS
