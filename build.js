#!/usr/bin/env node
/**
 * Production Build Script
 * Uses Terser for proper JavaScript minification
 */

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

const JS_DIR = './js';
const BUILD_DIR = './build/js';

// Ensure build directory exists
if (!fs.existsSync('./build')) {
    fs.mkdirSync('./build');
}
if (!fs.existsSync(BUILD_DIR)) {
    fs.mkdirSync(BUILD_DIR, { recursive: true });
}

// Terser configuration
const terserOptions = {
    compress: {
        drop_console: true,  // Remove console.* calls
        drop_debugger: true,
        passes: 2
    },
    mangle: false,  // Don't mangle names (keep readable for debugging)
    format: {
        comments: false  // Remove comments
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

    // Bundle UAParser.js
    console.log('📦 Bundling UAParser.js...');
    const uaParserSource = fs.readFileSync('./node_modules/ua-parser-js/dist/ua-parser.min.js', 'utf8');
    const vendorDir = './js/vendor';
    const uaParserDest = path.join(vendorDir, 'ua-parser.min.js');

    if (!fs.existsSync(vendorDir)) {
        fs.mkdirSync(vendorDir, { recursive: true });
    }

    fs.writeFileSync(uaParserDest, uaParserSource);
    const uaParserSize = Buffer.byteLength(uaParserSource, 'utf8');
    console.log(`  ✓ Copied ua-parser.min.js (${formatBytes(uaParserSize)}) to js/vendor/\n`);
}

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

buildFiles().catch(error => {
    console.error('Build failed:', error);
    process.exit(1);
});
