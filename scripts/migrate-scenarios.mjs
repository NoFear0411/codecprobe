#!/usr/bin/env node
/**
 * migrate-scenarios.mjs — Transform scenario (singular) to scenarios (array)
 * and move drm to record level.
 *
 * Reads codec-database-v2.js, transforms in-place.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import vm from 'vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = resolve(__dirname, '..', 'js', 'codec-database-v2.js');

const src = readFileSync(dbPath, 'utf-8');

// ── Parse codecSource ──
const startMarker = 'export const codecSource = {';
const startIdx = src.indexOf(startMarker);
const objStart = startIdx + 'export const codecSource = '.length;

let braceDepth = 0, inStr = false, strCh = '', endIdx = -1;
for (let i = objStart; i < src.length; i++) {
    const ch = src[i], prev = src[i - 1];
    if (inStr) { if (ch === strCh && prev !== '\\') inStr = false; continue; }
    if (ch === "'" || ch === '"' || ch === '`') { inStr = true; strCh = ch; continue; }
    if (ch === '{') braceDepth++;
    else if (ch === '}') { braceDepth--; if (braceDepth === 0) { endIdx = i + 1; break; } }
}

const objectSrc = src.slice(objStart, endIdx);
const codecSource = vm.runInNewContext(`(${objectSrc})`, { Set });

// ── Build scenario name from params ──
function scenarioName(s, type) {
    const parts = [];
    if (type === 'video') {
        // Resolution shorthand
        if (s.width >= 7680) parts.push('8K');
        else if (s.width >= 3840) parts.push('4K');
        else if (s.width >= 1920) parts.push('1080p');
        else if (s.width >= 1280) parts.push('720p');
        else parts.push(`${s.width}x${s.height}`);

        // HDR mode
        if (s.hdrFormat === 'hdr10') parts.push('HDR10');
        else if (s.hdrFormat === 'hlg') parts.push('HLG');
        else if (s.transferFunction === 'pq') parts.push('PQ');
        else parts.push('SDR');

        // Framerate
        parts.push(`${s.framerate}fps`);

        // Bit depth if notable
        if (s.bitDepth && s.bitDepth !== 10 && s.hdrFormat) parts.push(`${s.bitDepth}-bit`);
        else if (s.bitDepth === 8) parts.push('8-bit');
        else if (s.bitDepth) parts.push(`${s.bitDepth}-bit`);
    } else {
        // Audio
        const chMap = { 1: 'Mono', 2: 'Stereo', 6: '5.1', 8: '7.1' };
        if (s.channels) parts.push(chMap[s.channels] || `${s.channels}ch`);
        if (s.samplerate) parts.push(`${s.samplerate / 1000}kHz`);
        if (s.bitDepth) parts.push(`${s.bitDepth}-bit`);
        if (s.spatial) parts.push('Spatial');
    }
    return parts.join(' ');
}

// ── Transform data ──
// Group records by codec string within each group, merge scenarios
const transformed = {};

for (const [groupKey, group] of Object.entries(codecSource)) {
    const codecs = group.codecs || [];
    if (codecs.length === 0) {
        transformed[groupKey] = { category: group.category, type: group.type, description: group.description, codecs: [] };
        continue;
    }

    // Group by codec string
    const byCodec = new Map();
    for (const record of codecs) {
        const key = record.codec;
        if (!byCodec.has(key)) byCodec.set(key, []);
        byCodec.get(key).push(record);
    }

    const newCodecs = [];
    for (const [codecStr, records] of byCodec) {
        const first = records[0];
        const scenarios = records.map(r => {
            const s = { ...r.scenario };
            delete s.drm;
            s.name = scenarioName(s, group.type);
            return s;
        });

        // Use first record's name for multi-scenario, or derive a codec-level name
        let recordName;
        if (records.length > 1) {
            // Multi-scenario: use a codec-identity name
            // Try to derive from the codec string
            recordName = first.name.replace(/ (HDR10|HLG|SDR|PQ) /, ' ').replace(/ \d+fps/, '').trim();
            // Fallback: just use first name
            if (recordName === first.name) recordName = first.name;
        } else {
            recordName = first.name;
        }

        const drm = first.scenario?.drm || null;

        newCodecs.push({
            codec: codecStr,
            name: recordName,
            containers: first.containers,
            drm,
            scenarios,
            flags: first.flags || undefined,
            education: first.education || undefined
        });
    }

    transformed[groupKey] = {
        category: group.category,
        type: group.type,
        description: group.description,
        codecs: newCodecs
    };
}

// ── Serialize to JS source ──

function indent(depth) { return '    '.repeat(depth); }

function serializeValue(val, depth) {
    if (val === null || val === undefined) return 'null';
    if (typeof val === 'number') {
        // Use underscore separators for large numbers
        if (val >= 1_000_000) {
            const str = val.toString();
            // Add underscores for millions
            return str.replace(/\B(?=(\d{3})+(?!\d))/g, '_');
        }
        return String(val);
    }
    if (typeof val === 'boolean') return String(val);
    if (typeof val === 'string') {
        // Use template literal for multiline strings
        if (val.includes('\n')) {
            return '`' + val.replace(/`/g, '\\`').replace(/\$/g, '\\$') + '`';
        }
        return `'${val.replace(/'/g, "\\'")}'`;
    }
    if (Array.isArray(val)) {
        if (val.length === 0) return '[]';
        // Short arrays of primitives: inline
        if (val.every(v => typeof v === 'string') && val.length <= 6) {
            const items = val.map(v => `'${v}'`).join(', ');
            if (items.length < 80) return `[${items}]`;
        }
        // Array of objects: multiline
        const items = val.map(v => `${indent(depth + 1)}${serializeValue(v, depth + 1)}`);
        return `[\n${items.join(',\n')}\n${indent(depth)}]`;
    }
    if (typeof val === 'object') {
        const entries = Object.entries(val).filter(([, v]) => v !== undefined);
        if (entries.length === 0) return '{}';
        const lines = entries.map(([k, v]) => {
            const key = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `'${k}'`;
            return `${indent(depth + 1)}${key}: ${serializeValue(v, depth + 1)}`;
        });
        return `{\n${lines.join(',\n')}\n${indent(depth)}}`;
    }
    return String(val);
}

function serializeCodecSource(data) {
    const lines = [];
    lines.push('export const codecSource = {');

    const groupEntries = Object.entries(data);
    for (let gi = 0; gi < groupEntries.length; gi++) {
        const [groupKey, group] = groupEntries[gi];

        // Section comments
        if (groupKey === 'video_hevc') {
            lines.push('');
            lines.push('    // ── VIDEO: Base codec standard ───────────────────────────');
            lines.push('');
        } else if (groupKey === 'video_dolby_vision') {
            lines.push('');
            lines.push('    // ── VIDEO: Brand ─────────────────────────────────────────');
            lines.push('');
        } else if (groupKey === 'video_legacy') {
            lines.push('');
            lines.push('    // ── VIDEO: Legacy ────────────────────────────────────────');
            lines.push('');
        } else if (groupKey === 'audio_dolby') {
            lines.push('');
            lines.push('    // ── AUDIO: Brand ─────────────────────────────────────────');
            lines.push('');
        } else if (groupKey === 'audio_mpeg_h') {
            // no extra comment
        } else if (groupKey === 'audio_lossless') {
            lines.push('');
            lines.push('    // ── AUDIO: Quality tier ──────────────────────────────────');
            lines.push('');
        }

        lines.push(`    ${groupKey}: {`);
        lines.push(`        category: '${group.category}',`);
        lines.push(`        type: '${group.type}',`);
        lines.push(`        description: '${group.description.replace(/'/g, "\\'")}',`);

        if (group.codecs.length === 0) {
            lines.push('        codecs: []');
        } else {
            lines.push('        codecs: [');

            for (let ci = 0; ci < group.codecs.length; ci++) {
                const c = group.codecs[ci];

                // Comment header
                lines.push('');
                lines.push(`            // ── ${c.codec} ──`);
                lines.push('');

                lines.push('            {');
                lines.push(`                codec: '${c.codec}',`);
                lines.push(`                name: '${c.name.replace(/'/g, "\\'")}',`);

                // Containers
                const fileCt = c.containers.file?.map(v => `'${v}'`).join(', ') || '';
                const streamCt = c.containers.stream?.map(v => `'${v}'`).join(', ') || '';
                lines.push('                containers: {');
                lines.push(`                    file: [${fileCt}],`);
                if (streamCt) {
                    lines.push(`                    stream: [${streamCt}]`);
                }
                lines.push('                },');

                // DRM at record level
                if (c.drm && c.drm.length > 0) {
                    const drmStr = c.drm.map(v => `'${v}'`).join(', ');
                    lines.push(`                drm: [${drmStr}],`);
                }

                // Flags
                if (c.flags && c.flags.length > 0) {
                    const flagStr = c.flags.map(v => `'${v}'`).join(', ');
                    lines.push(`                flags: [${flagStr}],`);
                }

                // Scenarios
                if (c.scenarios.length === 1) {
                    const s = c.scenarios[0];
                    lines.push(`                scenarios: [{`);
                    serializeScenario(s, group.type, lines);
                    lines.push('                }],');
                } else {
                    lines.push('                scenarios: [');
                    for (let si = 0; si < c.scenarios.length; si++) {
                        const s = c.scenarios[si];
                        lines.push('                    {');
                        serializeScenario(s, group.type, lines, true);
                        lines.push(si < c.scenarios.length - 1 ? '                    },' : '                    }');
                    }
                    lines.push('                ],');
                }

                // Education
                if (c.education) {
                    const edu = c.education;
                    const hasContent = (edu.breakdown?.length > 0) || (edu.overview?.length > 0);
                    if (!hasContent) {
                        // Skeleton
                        lines.push('                education: {');
                        lines.push('                    breakdown: [],');
                        lines.push("                    overview: '',");
                        lines.push('                    platforms: {},');
                        lines.push('                    streaming: {},');
                        lines.push('                    containerNotes: {},');
                        lines.push('                    references: []');
                        lines.push('                }');
                    } else {
                        // Populated — serialize fully
                        const eduStr = serializeValue(edu, 4);
                        lines.push(`                education: ${eduStr}`);
                    }
                }

                lines.push(ci < group.codecs.length - 1 ? '            },' : '            }');
            }

            lines.push('');
            lines.push('        ]');
        }

        lines.push(gi < groupEntries.length - 1 ? '    },' : '    }');
    }

    lines.push('};');
    return lines.join('\n');
}

function serializeScenario(s, type, lines, deep = false) {
    const pad = deep ? '                        ' : '                    ';
    lines.push(`${pad}name: '${s.name}',`);

    if (type === 'video') {
        if (s.width) lines.push(`${pad}width: ${s.width},`);
        if (s.height) lines.push(`${pad}height: ${s.height},`);
        if (s.framerate) lines.push(`${pad}framerate: ${s.framerate},`);
        if (s.bitrate) {
            const br = s.bitrate >= 1_000_000
                ? s.bitrate.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '_')
                : s.bitrate;
            lines.push(`${pad}bitrate: ${br},`);
        }
        if (s.bitDepth) lines.push(`${pad}bitDepth: ${s.bitDepth},`);
        if (s.chromaSubsampling) lines.push(`${pad}chromaSubsampling: '${s.chromaSubsampling}',`);
        if (s.transferFunction) lines.push(`${pad}transferFunction: '${s.transferFunction}',`);
        if (s.colorGamut) lines.push(`${pad}colorGamut: '${s.colorGamut}',`);
        if (s.hdrFormat) lines.push(`${pad}hdrFormat: '${s.hdrFormat}'`);
        else if (s.tier) lines.push(`${pad}tier: '${s.tier}'`);
        // Remove trailing comma from last line
    } else {
        if (s.channels) lines.push(`${pad}channels: ${s.channels},`);
        if (s.samplerate) lines.push(`${pad}samplerate: ${s.samplerate},`);
        if (s.bitrate) {
            const br = s.bitrate >= 1_000_000
                ? s.bitrate.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '_')
                : s.bitrate;
            lines.push(`${pad}bitrate: ${br},`);
        }
        if (s.bitDepth) lines.push(`${pad}bitDepth: ${s.bitDepth},`);
        if (s.spatial) lines.push(`${pad}spatial: true`);
    }
}

const newSource = serializeCodecSource(transformed);

// ── Replace in file ──
const before = src.slice(0, startIdx);
const after = src.slice(endIdx);

// Check if there's a trailing semicolon after the object
const afterTrimmed = after.trimStart();
const skipSemicolon = afterTrimmed.startsWith(';') ? 1 + (after.length - afterTrimmed.length) : 0;

const newFile = before + newSource + after.slice(skipSemicolon);

writeFileSync(dbPath, newFile, 'utf-8');

// ── Summary ──
let totalCodecs = 0, totalScenarios = 0;
for (const group of Object.values(transformed)) {
    for (const c of (group.codecs || [])) {
        totalCodecs++;
        totalScenarios += c.scenarios.length;
    }
}

console.log(`Migration complete: ${totalCodecs} codec records, ${totalScenarios} scenarios`);
console.log('Changes:');
console.log('  - scenario (singular) → scenarios (array with name)');
console.log('  - drm moved from scenario to record level');

// Show merges
for (const [gk, group] of Object.entries(transformed)) {
    for (const c of (group.codecs || [])) {
        if (c.scenarios.length > 1) {
            console.log(`  - MERGED: ${c.codec} → ${c.scenarios.length} scenarios: ${c.scenarios.map(s => s.name).join(', ')}`);
        }
    }
}
