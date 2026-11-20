# Setup

## Deploy Your Own Copy

Deployment runs through GitHub Actions (`.github/workflows/release.yml`), triggered by version tags.

1. Fork this repository
2. Settings > Pages > Source: **GitHub Actions**
3. Replace or delete `CNAME` (it points at codecprobe.dev)
4. Add a `## [X.Y.Z] - YYYY-MM-DD` section to `CHANGELOG.md`, commit, then tag and push:
   ```bash
   git tag -a vX.Y.Z -m "vX.Y.Z: Short description"
   git push origin vX.Y.Z
   ```
   Or run the **Release & Deploy** workflow manually with an existing tag.
5. Access at `https://YOUR_USERNAME.github.io/codecprobe/`

## Development

### Install

```bash
npm install
```

Installs the build tools: sass, terser, typescript, ua-parser-js, npm-run-all. Use Node 24 (CI runs the latest Node 24).

### Dev Mode

```bash
npm run dev
```

Serves the repo on `http://localhost:8000` (Python `http.server`) and recompiles SCSS on change.

### Build

```bash
npm run build
```

Typechecks the JSDoc types, compiles SCSS, minifies JS to `build/js/`, bundles UAParser.js to `js/vendor/`, writes `build/version-manifest.json`, and injects the `package.json` version into `sw.js` and `index.html`.

### Build CSS Only

```bash
npm run build:css
```

### Quick Test (No Build)

```bash
python -m http.server 8000
```

Serves the unminified source modules directly. Works for JS changes; SCSS changes need `npm run build:css`.

## CI/CD

`.github/workflows/release.yml` runs when a `v*` tag is pushed, or manually with a tag input:

1. `npm install` (no lockfile is committed, so versions resolve from the `package.json` ranges)
2. `npm run build`
3. `node scripts/inject-versions.js` — versioned asset URLs, app version, JSON-LD CSP hash, `deploy/index.html`
4. Assemble `deploy/` and upload it as the Pages artifact
5. Create or update the GitHub Release: notes from the matching `CHANGELOG.md` section, deploy zip attached
6. Deploy to GitHub Pages
7. Prune old deployments (keeps the last 3)

The tagged commit must already contain its `CHANGELOG.md` section, or the release page shows "No CHANGELOG entry found".

Committed build outputs: `css/styles.css`, `js/vendor/ua-parser.min.js`, and the `CACHE_VERSION` in `sw.js`. `build/`, `deploy/` and `css/*.map` are not committed.

## Custom Domain

1. Put your domain in the `CNAME` file at the repo root (the workflow copies it into the deploy)
2. DNS: CNAME record pointing to `YOUR_USERNAME.github.io`
3. Enable "Enforce HTTPS" in Pages settings

## Troubleshooting

**Workflow didn't run**: The tag must match `v*` and be pushed explicitly (`git push origin vX.Y.Z`).

**Deploy job fails**: Pages source must be set to GitHub Actions, not a branch.

**Console errors**: Open DevTools and check that every `.js` file loaded. `Failed to parse video contentType` warnings in Chromium are expected — see README → Known Limitations.

## Pulling Updates

```bash
git remote add upstream https://github.com/nofear0411/codecprobe.git
git fetch upstream
git merge upstream/main
git push origin main
```
