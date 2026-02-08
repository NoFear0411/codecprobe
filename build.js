#!/usr/bin/env node
/**
 * Production Build Script
 * Strips console.log statements from JavaScript files
 */

const fs = require('fs');
const path = require('path');

const JS_DIR = './js';
const BUILD_DIR = './build/js';

// Ensure build directory exists
if (!fs.existsSync('./build')) {
    fs.mkdirSync('./build');
}
if (!fs.existsSync(BUILD_DIR)) {
    fs.mkdirSync(BUILD_DIR, { recursive: true });
}

// Get all JS files
const jsFiles = fs.readdirSync(JS_DIR).filter(file => file.endsWith('.js'));

let totalOriginalSize = 0;
let totalOptimizedSize = 0;

console.log('🔨 Building production JS files...\n');

jsFiles.forEach(file => {
    const filePath = path.join(JS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // Strip console.log, console.debug, console.info
    const optimized = content
        .replace(/console\.(log|debug|info)\([^)]*\);?\n?/g, '')
        .replace(/console\.(log|debug|info)\([^)]*\);?\s*/g, '');

    const buildPath = path.join(BUILD_DIR, file);
    fs.writeFileSync(buildPath, optimized, 'utf8');

    const originalSize = Buffer.byteLength(content, 'utf8');
    const optimizedSize = Buffer.byteLength(optimized, 'utf8');
    const saved = originalSize - optimizedSize;
    const savedPercent = ((saved / originalSize) * 100).toFixed(1);

    totalOriginalSize += originalSize;
    totalOptimizedSize += optimizedSize;

    console.log(`  ${file.padEnd(25)} ${formatBytes(originalSize)} → ${formatBytes(optimizedSize)} (${savedPercent}% smaller)`);
});

const totalSaved = totalOriginalSize - totalOptimizedSize;
const totalSavedPercent = ((totalSaved / totalOriginalSize) * 100).toFixed(1);

console.log('\n' + '─'.repeat(70));
console.log(`  Total:                    ${formatBytes(totalOriginalSize)} → ${formatBytes(totalOptimizedSize)} (${totalSavedPercent}% smaller)`);
console.log('─'.repeat(70));
console.log(`\n✅ Production build complete! Saved ${formatBytes(totalSaved)} across ${jsFiles.length} files.\n`);

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
