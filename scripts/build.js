#!/usr/bin/env node
/**
 * Production Build Script
 * Uses Terser for proper JavaScript minification
 */

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

const ROOT = path.join(__dirname, '..');
const JS_DIR = path.join(ROOT, 'js');
const BUILD_DIR = path.join(ROOT, 'build', 'js');

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const appVersion = pkg.version;

// Ensure build directory exists
if (!fs.existsSync(path.join(ROOT, 'build'))) {
    fs.mkdirSync(path.join(ROOT, 'build'));
}
if (!fs.existsSync(BUILD_DIR)) {
    fs.mkdirSync(BUILD_DIR, { recursive: true });
}

// Terser configuration
const terserOptions = {
    module: true,
    compress: {
        drop_console: false,
        pure_funcs: ['console.log', 'console.debug'],
        drop_debugger: true,
        passes: 2
    },
    mangle: false,
    format: {
        comments: false
    }
};

async function buildFiles() {
    const jsFiles = fs.readdirSync(JS_DIR).filter(file => file.endsWith('.js'));

    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;

    console.log('🔨 Building production JS files with Terser...\n');

    for (const file of jsFiles) {
        const filePath = path.join(JS_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');

        try {
            // Minify with Terser
            const result = await minify(content, terserOptions);

            if (result.error) {
                console.error(`❌ Error minifying ${file}:`, result.error);
                process.exit(1);
            }

            const buildPath = path.join(BUILD_DIR, file);
            fs.writeFileSync(buildPath, result.code, 'utf8');

            const originalSize = Buffer.byteLength(content, 'utf8');
            const optimizedSize = Buffer.byteLength(result.code, 'utf8');
            const saved = originalSize - optimizedSize;
            const savedPercent = ((saved / originalSize) * 100).toFixed(1);

            totalOriginalSize += originalSize;
            totalOptimizedSize += optimizedSize;

            console.log(`  ${file.padEnd(25)} ${formatBytes(originalSize)} → ${formatBytes(optimizedSize)} (${savedPercent}% smaller)`);
        } catch (error) {
            console.error(`❌ Error processing ${file}:`, error.message);
            process.exit(1);
        }
    }

    const totalSaved = totalOriginalSize - totalOptimizedSize;
    const totalSavedPercent = ((totalSaved / totalOriginalSize) * 100).toFixed(1);

    console.log('\n' + '─'.repeat(70));
    console.log(`  Total:                    ${formatBytes(totalOriginalSize)} → ${formatBytes(totalOptimizedSize)} (${totalSavedPercent}% smaller)`);
    console.log('─'.repeat(70));
    console.log(`\n✅ Production build complete! Saved ${formatBytes(totalSaved)} across ${jsFiles.length} files.\n`);

    // Bundle UAParser.js to build output + source vendor (dev server uses source)
    console.log('📦 Bundling UAParser.js...');
    const uaParserSource = fs.readFileSync(path.join(ROOT, 'node_modules/ua-parser-js/dist/ua-parser.min.js'), 'utf8');
    const uaParserSize = Buffer.byteLength(uaParserSource, 'utf8');

    for (const dir of [path.join(ROOT, 'build/js/vendor'), path.join(ROOT, 'js/vendor')]) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(path.join(dir, 'ua-parser.min.js'), uaParserSource);
    }
    console.log(`  ✓ Bundled ua-parser.min.js (${formatBytes(uaParserSize)})\n`);
}

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Generate file hash for cache busting
 */
function generateFileHash(filePath) {
    const crypto = require('crypto');
    const content = fs.readFileSync(filePath, 'utf8');
    return crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
}

/**
 * Generate version manifest for cache busting
 */
function generateVersionManifest() {
    const manifest = {
        version: appVersion,
        timestamp: Date.now(),
        hashes: {}
    };

    console.log('\n📝 Generating version manifest...');

    // Hash built JS files (read from build output, not hardcoded)
    const builtJsDir = path.join(ROOT, 'build', 'js');
    if (fs.existsSync(builtJsDir)) {
        fs.readdirSync(builtJsDir)
            .filter(f => f.endsWith('.js'))
            .forEach(file => {
                manifest.hashes[file] = generateFileHash(path.join(builtJsDir, file));
            });
    }

    // Hash CSS
    const cssPath = path.join(ROOT, 'css', 'styles.css');
    if (fs.existsSync(cssPath)) {
        manifest.hashes['styles.css'] = generateFileHash(cssPath);
    }

    // Hash vendor files
    const builtVendorDir = path.join(ROOT, 'build', 'js', 'vendor');
    if (fs.existsSync(builtVendorDir)) {
        fs.readdirSync(builtVendorDir)
            .filter(f => f.endsWith('.js'))
            .forEach(file => {
                manifest.hashes[file] = generateFileHash(path.join(builtVendorDir, file));
            });
    }

    // Ensure build directory exists
    const buildDir = path.join(ROOT, 'build');
    if (!fs.existsSync(buildDir)) {
        fs.mkdirSync(buildDir, { recursive: true });
    }

    // Write manifest
    const manifestPath = path.join(buildDir, 'version-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    console.log(`✓ Generated version manifest with hashes`);
    console.log(`  Timestamp: ${manifest.timestamp}`);
    console.log(`  Files hashed: ${Object.keys(manifest.hashes).length}`);

    return manifest;
}

/**
 * Inject semantic version into service worker cache version.
 * Replaces either the placeholder or a previously injected version string.
 */
function injectSWVersion() {
    const swPath = path.join(ROOT, 'sw.js');
    if (!fs.existsSync(swPath)) {
        console.log('\n⚠️  sw.js not found, skipping SW version injection');
        return;
    }

    const swContent = fs.readFileSync(swPath, 'utf8');
    const updated = swContent.replace(
        /const CACHE_VERSION = '([^']+)';/,
        `const CACHE_VERSION = '${appVersion}';`
    );
    fs.writeFileSync(swPath, updated, 'utf8');

    console.log(`\n🔧 Injected SW cache version: codecprobe-v${appVersion}`);
}

/**
 * Sync the version into the source index.html (footer + Schema.org softwareVersion),
 * so the committed file and the dev server match package.json. Same patterns as
 * inject-versions.js, which does this for the deploy copy in CI.
 */
function injectHtmlVersion() {
    const htmlPath = path.join(ROOT, 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    const updated = html
        .replace(/(<span id="app-version">)v[^<]+(<\/span>)/, `$1v${appVersion}$2`)
        .replace(/"softwareVersion":\s*"[^"]+"/, `"softwareVersion": "${appVersion}"`);

    if (updated !== html) {
        fs.writeFileSync(htmlPath, updated, 'utf8');
        console.log(`🔧 Synced index.html version: v${appVersion}`);
    }
}

buildFiles()
    .then(() => {
        const manifest = generateVersionManifest();
        injectSWVersion();
        injectHtmlVersion();
    })
    .catch(error => {
        console.error('Build failed:', error);
        process.exit(1);
    });
