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

const manifestPath = path.join(__dirname, 'build', 'version-manifest.json');
const htmlPath = path.join(__dirname, 'index.html');
const outputPath = path.join(__dirname, 'deploy', 'index.html');
const buildJsDir = path.join(__dirname, 'build', 'js');

if (!fs.existsSync(manifestPath)) {
    console.error('version-manifest.json not found. Run npm run build first.');
    process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
let html = fs.readFileSync(htmlPath, 'utf8');

console.log('Injecting version hashes...');

let replacedCount = 0;

// 1. Version HTML asset references
Object.entries(manifest.hashes).forEach(([file, hash]) => {
    // CSS
    const cssPattern = new RegExp(`href="css/${file}"`, 'g');
    const cssMatches = html.match(cssPattern);
    if (cssMatches) {
        html = html.replace(cssPattern, `href="css/${file}?v=${hash}"`);
        replacedCount += cssMatches.length;
    }

    // JS (entry point)
    const jsPattern = new RegExp(`src="js/${file}"`, 'g');
    const jsMatches = html.match(jsPattern);
    if (jsMatches) {
        html = html.replace(jsPattern, `src="js/${file}?v=${hash}"`);
        replacedCount += jsMatches.length;
    }

    // Vendor
    const vendorPattern = new RegExp(`src="js/vendor/${file}"`, 'g');
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
                `(from\\s*['"]\\.\\/)(${targetFile.replace('.', '\\.')})(['"])`,
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

// Ensure deploy directory exists
const deployDir = path.join(__dirname, 'deploy');
if (!fs.existsSync(deployDir)) {
    fs.mkdirSync(deployDir, { recursive: true });
}

fs.writeFileSync(outputPath, html);

console.log(`Injected ${replacedCount} version parameters (HTML + JS imports)`);
console.log(`Output: deploy/index.html`);
