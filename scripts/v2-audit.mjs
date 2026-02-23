#!/usr/bin/env node
/**
 * v2-audit.mjs — List all codecs in the v2 database with their test scenarios.
 *
 * Usage: node scripts/v2-audit.mjs
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import vm from 'vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = resolve(__dirname, '..', 'js', 'codec-database-v2.js');

const src = readFileSync(dbPath, 'utf-8');

// Extract the codecSource object literal
const startMarker = 'export const codecSource = {';
const startIdx = src.indexOf(startMarker);
if (startIdx === -1) {
    console.error('Could not find codecSource in', dbPath);
    process.exit(1);
}

// Find the matching closing brace
let braceDepth = 0;
let inString = false;
let stringChar = '';
let endIdx = -1;

for (let i = startIdx + startMarker.length - 1; i < src.length; i++) {
    const ch = src[i];
    const prev = src[i - 1];

    if (inString) {
        if (ch === stringChar && prev !== '\\') inString = false;
        continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
        inString = true;
        stringChar = ch;
        continue;
    }
    if (ch === '{') braceDepth++;
    else if (ch === '}') {
        braceDepth--;
        if (braceDepth === 0) { endIdx = i + 1; break; }
    }
}

if (endIdx === -1) {
    console.error('Could not find end of codecSource object');
    process.exit(1);
}

const objectSrc = src.slice(startIdx + 'export const codecSource = '.length, endIdx);
const codecSource = vm.runInNewContext(`(${objectSrc})`, { Set });

// ── Display ──

const B = '\x1b[1m', D = '\x1b[2m', R = '\x1b[0m';
const GRN = '\x1b[32m', CYN = '\x1b[36m', YEL = '\x1b[33m', MAG = '\x1b[35m';

let totalCodecs = 0;
let totalScenarios = 0;
let totalContainers = 0;

for (const [groupKey, group] of Object.entries(codecSource)) {
    const codecs = group.codecs || [];
    if (codecs.length === 0) {
        console.log(`\n${D}${group.category} (${groupKey}) — empty${R}`);
        continue;
    }

    console.log(`\n${B}${group.category}${R} ${D}(${groupKey}, ${group.type})${R} — ${codecs.length} codecs`);
    console.log('─'.repeat(80));

    for (let i = 0; i < codecs.length; i++) {
        const c = codecs[i];
        totalCodecs++;

        const fileCt = c.containers?.file || [];
        const streamCt = c.containers?.stream || [];
        const ctCount = fileCt.length + streamCt.length;

        const scenarios = c.scenarios || [];
        totalScenarios += scenarios.length;
        totalContainers += ctCount * scenarios.length;

        // Codec header
        console.log(`  ${CYN}${i + 1}.${R} ${B}${c.codec}${R}`);
        console.log(`     ${D}name:${R} ${c.name}`);
        console.log(`     ${D}file:${R} [${fileCt.join(', ')}]  ${D}stream:${R} [${streamCt.join(', ')}]  ${D}(${ctCount} containers)${R}`);

        // DRM at record level
        if (c.drm?.length) {
            console.log(`     ${D}drm:${R}  [${c.drm.join(', ')}]`);
        }

        // Scenarios
        for (let si = 0; si < scenarios.length; si++) {
            const s = scenarios[si];
            const prefix = scenarios.length > 1 ? `${MAG}scenario ${si + 1}:${R}` : `${D}scenario:${R}`;

            const parts = [];
            if (s.width && s.height) parts.push(`${s.width}x${s.height}`);
            if (s.framerate) parts.push(`${s.framerate}fps`);
            if (s.bitDepth) parts.push(`${s.bitDepth}-bit`);
            if (s.bitrate) parts.push(`${(s.bitrate / 1_000_000).toFixed(0)} Mbps`);
            if (s.chromaSubsampling) parts.push(s.chromaSubsampling);
            if (s.channels) parts.push(`${s.channels}ch`);
            if (s.samplerate) parts.push(`${s.samplerate}Hz`);
            if (s.spatial) parts.push('spatial');

            const hdr = [];
            if (s.transferFunction) hdr.push(`tf:${s.transferFunction}`);
            if (s.colorGamut) hdr.push(`gamut:${s.colorGamut}`);
            if (s.hdrFormat) hdr.push(`hdr:${s.hdrFormat}`);

            const scenarioLine = parts.join(' · ') + (hdr.length ? `  ${D}|${R}  ${hdr.join(' · ')}` : '');
            console.log(`     ${prefix} ${B}${s.name}${R} — ${scenarioLine}`);
        }

        // Education status
        const edu = c.education || {};
        const filled = (edu.breakdown?.length > 0) && (edu.overview?.length > 0);
        console.log(`     ${D}education:${R} ${filled ? `${GRN}populated${R}` : `${YEL}skeleton${R}`}`);
    }
}

console.log('\n' + '═'.repeat(80));
console.log(`${B}Total:${R} ${totalCodecs} codecs, ${totalScenarios} scenarios, ${totalContainers} test slots (scenarios × containers)`);
console.log('═'.repeat(80));
