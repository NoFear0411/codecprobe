#!/usr/bin/env node
/**
 * Version Injection Script
 *
 * Injects version hashes into HTML asset references for cache busting
 * Run after build.js to prepare deployment-ready HTML
 */

const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, 'build', 'version-manifest.json');
const htmlPath = path.join(__dirname, 'index.html');
const outputPath = path.join(__dirname, 'deploy', 'index.html');

// Verify manifest exists
if (!fs.existsSync(manifestPath)) {
    console.error('❌ Error: version-manifest.json not found. Run npm run build first.');
    process.exit(1);
}

// Load manifest and HTML
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
let html = fs.readFileSync(htmlPath, 'utf8');

console.log('📝 Injecting version hashes into HTML...');
console.log(`  Manifest timestamp: ${new Date(manifest.timestamp).toISOString()}`);

// Track replacements
let replacedCount = 0;

// Inject version hashes into asset references
Object.entries(manifest.hashes).forEach(([file, hash]) => {
    // CSS: href="css/styles.css" → href="css/styles.css?v=abc123"
    const cssPattern = new RegExp(`href="css/${file}"`, 'g');
    const cssMatches = html.match(cssPattern);
    if (cssMatches) {
        html = html.replace(cssPattern, `href="css/${file}?v=${hash}"`);
        replacedCount += cssMatches.length;
        console.log(`  ✓ Versioned css/${file} → ?v=${hash}`);
    }

    // JS: src="js/main.js" → src="js/main.js?v=abc123"
    const jsPattern = new RegExp(`src="js/${file}"`, 'g');
    const jsMatches = html.match(jsPattern);
    if (jsMatches) {
        html = html.replace(jsPattern, `src="js/${file}?v=${hash}"`);
        replacedCount += jsMatches.length;
        console.log(`  ✓ Versioned js/${file} → ?v=${hash}`);
    }

    // Vendor: src="js/vendor/ua-parser.min.js" → src="js/vendor/ua-parser.min.js?v=abc123"
    const vendorPattern = new RegExp(`src="js/vendor/${file}"`, 'g');
    const vendorMatches = html.match(vendorPattern);
    if (vendorMatches) {
        html = html.replace(vendorPattern, `src="js/vendor/${file}?v=${hash}"`);
        replacedCount += vendorMatches.length;
        console.log(`  ✓ Versioned js/vendor/${file} → ?v=${hash}`);
    }
});

// Ensure deploy directory exists
const deployDir = path.join(__dirname, 'deploy');
if (!fs.existsSync(deployDir)) {
    fs.mkdirSync(deployDir, { recursive: true });
}

// Write versioned HTML
fs.writeFileSync(outputPath, html);

console.log(`\n✅ Injected ${replacedCount} version parameters into HTML`);
console.log(`  Output: deploy/index.html`);
console.log(`\n💡 Deploy the contents of the deploy/ directory to production`);
