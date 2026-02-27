#!/usr/bin/env node
/**
 * Version Injection Script
 *
 * Injects version hashes into:
 * 1. HTML asset references (script src, stylesheet href)
 * 2. ES module import paths in built JS files
 *
 * Run after build.js to prepare deployment-ready output
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const manifestPath = path.join(ROOT, 'build', 'version-manifest.json');
const htmlPath = path.join(ROOT, 'index.html');
const outputPath = path.join(ROOT, 'deploy', 'index.html');
const buildJsDir = path.join(ROOT, 'build', 'js');

if (!fs.existsSync(manifestPath)) {
    console.error('version-manifest.json not found. Run npm run build first.');
    process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
let html = fs.readFileSync(htmlPath, 'utf8');

console.log('Injecting version hashes...');

let replacedCount = 0;

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 1. Version HTML asset references
Object.entries(manifest.hashes).forEach(([file, hash]) => {
    const escaped = escapeRegex(file);

    // CSS
    const cssPattern = new RegExp(`href="css/${escaped}"`, 'g');
    const cssMatches = html.match(cssPattern);
    if (cssMatches) {
        html = html.replace(cssPattern, `href="css/${file}?v=${hash}"`);
        replacedCount += cssMatches.length;
    }

    // JS (script src + modulepreload href)
    const jsPattern = new RegExp(`((?:src|href)="js/)${escaped}"`, 'g');
    const jsMatches = html.match(jsPattern);
    if (jsMatches) {
        html = html.replace(jsPattern, `$1${file}?v=${hash}"`);
        replacedCount += jsMatches.length;
    }

    // Vendor
    const vendorPattern = new RegExp(`src="js/vendor/${escaped}"`, 'g');
    const vendorMatches = html.match(vendorPattern);
    if (vendorMatches) {
        html = html.replace(vendorPattern, `src="js/vendor/${file}?v=${hash}"`);
        replacedCount += vendorMatches.length;
    }
});

// 2. Version ES module import paths in built JS files
if (fs.existsSync(buildJsDir)) {
    const jsFiles = fs.readdirSync(buildJsDir).filter(f => f.endsWith('.js'));

    jsFiles.forEach(jsFile => {
        const filePath = path.join(buildJsDir, jsFile);
        let content = fs.readFileSync(filePath, 'utf8');
        let fileChanged = false;

        Object.entries(manifest.hashes).forEach(([targetFile, hash]) => {
            // Match: from './codec-database.js' or from"./codec-database.js"
            const importPattern = new RegExp(
                `(from\\s*['"]\\.\\/)(${escapeRegex(targetFile)})(['"])`,
                'g'
            );
            const newContent = content.replace(importPattern, `$1$2?v=${hash}$3`);
            if (newContent !== content) {
                content = newContent;
                fileChanged = true;
                replacedCount++;
            }
        });

        if (fileChanged) {
            fs.writeFileSync(filePath, content);
        }
    });
}

// 3. Inject semantic version into HTML footer and Schema.org
if (manifest.version) {
    // Footer: <span id="app-version">v...</span>
    const versionFooterRe = /(<span id="app-version">)v[^<]+(<\/span>)/;
    const versionSchemaRe = /"softwareVersion":\s*"[^"]+"/;

    html = html.replace(versionFooterRe, `$1v${manifest.version}$2`);
    html = html.replace(versionSchemaRe, `"softwareVersion": "${manifest.version}"`);

    // Also update the source index.html so dev server stays in sync
    let sourceHtml = fs.readFileSync(htmlPath, 'utf8');
    const before = sourceHtml;
    sourceHtml = sourceHtml.replace(versionFooterRe, `$1v${manifest.version}$2`);
    sourceHtml = sourceHtml.replace(versionSchemaRe, `"softwareVersion": "${manifest.version}"`);
    if (sourceHtml !== before) {
        fs.writeFileSync(htmlPath, sourceHtml);
        console.log(`Updated source index.html to v${manifest.version}`);
    }

    console.log(`Injected app version: v${manifest.version}`);
}

// Ensure deploy directory exists
const deployDir = path.join(ROOT, 'deploy');
if (!fs.existsSync(deployDir)) {
    fs.mkdirSync(deployDir, { recursive: true });
}

fs.writeFileSync(outputPath, html);

// 4. Compute JSON-LD hash and inject into deploy/_headers CSP
const crypto = require('crypto');
const headersPath = path.join(ROOT, '_headers');

const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if (jsonLdMatch && fs.existsSync(headersPath)) {
    const jsonLdContent = jsonLdMatch[1];
    const hash = crypto.createHash('sha256').update(jsonLdContent, 'utf8').digest('base64');
    const cspHash = `'sha256-${hash}'`;

    let headers = fs.readFileSync(headersPath, 'utf8');
    headers = headers.replace(
        /script-src 'self'(?:\s+'sha256-[^']+')*/,
        `script-src 'self' ${cspHash}`
    );

    fs.writeFileSync(path.join(deployDir, '_headers'), headers);
    console.log(`Injected JSON-LD CSP hash: ${cspHash}`);
} else {
    // No JSON-LD or no _headers — copy as-is
    if (fs.existsSync(headersPath)) {
        fs.copyFileSync(headersPath, path.join(deployDir, '_headers'));
    }
}

console.log(`Injected ${replacedCount} version parameters (HTML + JS imports)`);
console.log(`Output: deploy/index.html`);
