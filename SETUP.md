# GitHub Pages Setup Guide

## Quick Deployment

### Method 1: Fork & Deploy (Easiest)
1. Click "Fork" button on this repository
2. Go to your forked repo's Settings
3. Navigate to "Pages" in the left sidebar
4. Under "Source", select `main` branch
5. Click "Save"
6. Wait 1-2 minutes for deployment
7. Access at: `https://YOUR_USERNAME.github.io/codecprobe/`

### Method 2: New Repository
1. Create a new repository on GitHub
2. Clone this repository locally:
   ```bash
   git clone https://github.com/ORIGINAL_OWNER/codecprobe.git
   cd codecprobe
   ```
3. Change remote to your new repo:
   ```bash
   git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```
4. Follow steps 2-7 from Method 1

## Development Setup

### Install Dependencies
```bash
npm install
```

This installs the SCSS compiler and build tools.

### Development Mode
```bash
npm run dev
```

This starts:
- Local server on `http://localhost:8000`
- SCSS watcher (auto-compiles on changes)

### Build CSS Only
```bash
npm run build:css
```

Compiles `scss/styles.scss` → `css/styles.css` (compressed)

## Local Testing (Without Building)

If you just want to test without modifying styles:

### Option 1: Python HTTP Server
```bash
cd codecprobe
python -m http.server 8000
# Open http://localhost:8000
```

### Option 2: Node.js HTTP Server
```bash
npm install -g http-server
cd codecprobe
http-server -p 8000
# Open http://localhost:8000
```

### Option 3: VS Code Live Server
1. Install "Live Server" extension
2. Open project folder in VS Code
3. Right-click `index.html` → "Open with Live Server"

## GitHub Actions Build Process

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically:
1. Installs Node.js dependencies
2. Compiles SCSS to CSS
3. Deploys to GitHub Pages

**This means:**
- You don't need to commit compiled CSS files
- CSS is built fresh on every push to `main`
- Themes are automatically compiled from SCSS source

## File Structure Requirements

For GitHub Pages to work, you MUST have:
- `index.html` in the root directory
- All paths relative to root
- No server-side code (PHP, etc.)
- `package.json` for npm dependencies
- SCSS source files in `scss/` directory

## Customization

### Update Repository Links
Edit `index.html` line 25:
```html
<a href="https://github.com/YOUR_USERNAME/codecprobe" target="_blank">GitHub</a>
```

### Update README Links
Edit `README.md`:
- Replace `nofear0411` with your GitHub username
- Update demo link
- Update contact information

### Custom Domain (Optional)
1. Purchase a domain
2. Add `CNAME` file to repository root with your domain:
   ```
   codecdetector.yourdomain.com
   ```
3. Configure DNS with your domain provider:
   - Type: `CNAME`
   - Name: `codecdetector` (or `@` for apex domain)
   - Value: `YOUR_USERNAME.github.io`
4. Enable "Enforce HTTPS" in GitHub Pages settings

## Troubleshooting

### Page Not Loading
- Check that `index.html` exists in root
- Verify GitHub Pages is enabled in Settings
- Clear browser cache
- Wait 5 minutes after enabling Pages

### 404 Error
- Ensure branch is set to `main` (not `master`)
- Check that files are committed and pushed
- Verify URL is correct

### Codecs Not Testing
- Open browser console (F12)
- Check for JavaScript errors
- Ensure all `.js` files loaded correctly
- Try a different browser

### Results Look Wrong
- Some browsers deliberately hide codec support
- Try on different device/browser
- Export JSON and compare with known device

## Browser Compatibility

Minimum versions for full functionality:
- Chrome/Edge: 88+
- Firefox: 90+
- Safari: 14+
- Opera: 74+

Older browsers may work with reduced functionality.

## Security Notes

- This tool runs entirely client-side
- No data is sent to any server
- No analytics or tracking
- Safe to use on any device

## Performance

- Initial load: < 500KB
- Test duration: 2-5 seconds
- Memory usage: < 50MB
- No background processes

## Updates

To pull latest changes from upstream:
```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/codecprobe.git
git fetch upstream
git merge upstream/main
git push origin main
```

## Support

If you encounter issues:
1. Check this guide
2. Search existing GitHub Issues
3. Open a new Issue with:
   - Browser/OS information
   - Console errors (F12)
   - Exported JSON results

---

**Ready to Deploy?** Follow Method 1 above and you'll be live in minutes!
