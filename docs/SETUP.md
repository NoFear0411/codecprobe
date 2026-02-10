# Setup

## Deploy to GitHub Pages

### Fork & Deploy

1. Fork this repository
2. Settings > Pages > Source: `main` branch > Save
3. Access at `https://YOUR_USERNAME.github.io/codecprobe/`

### From Scratch

1. Create a new repo on GitHub
2. Clone and re-point the remote:
   ```bash
   git clone https://github.com/nofear0411/codecprobe.git
   cd codecprobe
   git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
3. Enable Pages in Settings

## Development

### Install

```bash
npm install
```

Installs: sass, terser, ua-parser-js, npm-run-all.

### Dev Mode

```bash
npm run dev
```

Starts a local server on `http://localhost:8000` with SCSS auto-compilation.

### Build

```bash
npm run build
```

Compiles SCSS, minifies JS, bundles UAParser.js to `js/vendor/`, generates version manifest.

### Build CSS Only

```bash
npm run build:css
```

### Quick Test (No Build)

```bash
python -m http.server 8000
```

Works for JS-only changes. SCSS changes need `npm run build:css`.

## CI/CD

GitHub Actions (`.github/workflows/deploy.yml`) runs on push to main:

1. `npm install`
2. Compile SCSS
3. Minify JS + bundle UAParser.js
4. Generate version manifest
5. Inject version parameters into HTML
6. Deploy to GitHub Pages

Compiled CSS and bundled vendor files are committed to git so GitHub Pages works without a build step.

## File Structure

Required for GitHub Pages:
- `index.html` in root
- All paths relative to root
- `css/styles.css` committed (compiled)
- `js/vendor/ua-parser.min.js` committed (bundled)

## Custom Domain

1. Add `CNAME` file to root with your domain
2. DNS: CNAME record pointing to `YOUR_USERNAME.github.io`
3. Enable "Enforce HTTPS" in Pages settings

## Troubleshooting

**Page not loading**: Verify Pages is enabled, branch is `main`, files are pushed. Wait a few minutes after first enable.

**404**: Check branch name (`main` not `master`), verify files are committed.

**Console errors**: Open F12, check all `.js` files loaded. Try a different browser.

## Pulling Updates

```bash
git remote add upstream https://github.com/nofear0411/codecprobe.git
git fetch upstream
git merge upstream/main
git push origin main
```
