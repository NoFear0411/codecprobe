#!/usr/bin/env node

/**
 * CodecProbe Database Tool
 *
 * Usage:
 *   node scripts/db-tool.mjs <command> [args]
 *
 * Commands:
 *   stats                                  Show group counts and education coverage
 *   groups                                 List group keys
 *   list <group> [--missing|--complete]    List entries in a group
 *   show <group> <name>                    Show full entry details as JSON
 *   scaffold <group>                       Generate education template for missing entries
 *   inject <group> <file> [--dry-run]      Inject education into entries (from .mjs/.json)
 *   patch <group> <file> [--dry-run]       Patch existing education fields (deep merge)
 *   add <file> [--group <key>] [--dry-run]  Add new test entries (auto-detects group)
 *   verify                                 Syntax + structure check
 */

import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'url';
import { readFile as readFileAsync } from 'fs/promises';
import { loadDatabase, getStats, listEntries, getEntry, parseCodecField, tokenizeCodecString, DB_PATH } from './lib/reader.mjs';
import { readSource, writeSource, verifySyntax, injectEducation, replaceEducation, formatEducation, addEntry, formatEntry } from './lib/writer.mjs';

// --- ANSI colors ---
const C = {
    reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
    green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m',
    cyan: '\x1b[36m', gray: '\x1b[90m', magenta: '\x1b[35m'
};

// --- Reference presets by group and codec tag ---

const GROUP_REFS = {
    video_hevc:          [{ title: 'ISO/IEC 23008-2' }, { title: 'ISO/IEC 14496-15 Annex E' }],
    video_dolby_vision:  [{ title: 'ETSI TS 103 572' }],
    video_av1:           [{ title: 'AV1 Bitstream & Decoding Process Spec' }, { title: 'AV1 Codec ISO Media File Format Binding' }],
    video_vp9:           [{ title: 'VP9 Bitstream & Decoding Process Spec' }, { title: 'VP9 Codec ISO Media File Format Binding' }],
    video_avc:           [{ title: 'ITU-T H.264' }, { title: 'ISO/IEC 14496-15' }],
    video_vvc:           [{ title: 'ITU-T H.266' }, { title: 'ISO/IEC 14496-15:2022' }],
    video_vp8:           [{ title: 'RFC 6386' }],
    video_legacy:        [],
    audio_dolby:         [{ title: 'ETSI TS 102 366' }],
    audio_dts:           [{ title: 'ETSI TS 102 114' }],
    audio_lossless:      [],
    audio_standard:      [],
    audio_mpeg_h:        [{ title: 'ISO/IEC 23008-3' }],
    streaming_hls:       [{ title: 'RFC 8216' }],
};

const CODEC_TAG_REFS = {
    'fLaC': [{ title: 'RFC 9639' }],
    'flac': [{ title: 'RFC 9639' }],
    'alac': [{ title: 'Apple Lossless Audio Codec' }],
    'opus': [{ title: 'RFC 6716' }],
    'Opus': [{ title: 'RFC 6716' }],
    'vorbis': [{ title: 'Vorbis I Specification' }],
    'mp4a': [{ title: 'ISO/IEC 14496-3' }],
    'mp3':  [{ title: 'ISO/IEC 11172-3' }],
    'theora': [{ title: 'Theora Specification' }],
    'mp4v': [{ title: 'ISO/IEC 14496-2' }],
    'ac-3': [{ title: 'ETSI TS 102 366' }],
    'ec-3': [{ title: 'ETSI TS 102 366' }],
    'ac-4': [{ title: 'ETSI TS 103 190' }],
    'mlpa': [{ title: 'ETSI TS 102 366' }],
    'dtsc': [{ title: 'ETSI TS 102 114' }],
    'dtsh': [{ title: 'ETSI TS 102 114' }],
    'dtse': [{ title: 'ETSI TS 102 114' }],
    'dtsl': [{ title: 'ETSI TS 102 114' }],
    'dtsx': [{ title: 'ETSI TS 102 114' }],
    'mhm1': [{ title: 'ISO/IEC 23008-3' }],
    'mhm2': [{ title: 'ISO/IEC 23008-3' }],
};

function getRefsForEntry(groupKey, codecString) {
    if (codecString) {
        const tag = codecString.split('.')[0];
        if (CODEC_TAG_REFS[tag]) return [...CODEC_TAG_REFS[tag]];
    }
    return [...(GROUP_REFS[groupKey] || [])];
}

// --- Deep merge utility for patch command ---

function deepMerge(target, patch) {
    const result = { ...target };
    for (const key of Object.keys(patch)) {
        const tv = target[key], pv = patch[key];
        if (tv && pv && typeof tv === 'object' && typeof pv === 'object' && !Array.isArray(tv) && !Array.isArray(pv)) {
            result[key] = deepMerge(tv, pv);
        } else {
            result[key] = pv;
        }
    }
    return result;
}

// --- Data file loader (.json or .mjs) ---

async function loadDataFile(filePath) {
    const abs = resolve(filePath);
    if (filePath.endsWith('.json')) {
        const text = await readFileAsync(abs, 'utf-8');
        return JSON.parse(text);
    }
    const url = pathToFileURL(abs).href;
    const mod = await import(url);
    return mod.default;
}

// --- Entry validation ---

const VALID_CONTAINERS = new Set([
    'MP4', 'MKV', 'WebM', 'MOV', 'MPEG-TS', '3GP', 'OGG',
    'fMP4', 'CMAF', 'DASH',
    'FLAC', 'WAV', 'AIFF', 'AAC', 'MP3'
]);

const VALID_MIME_TYPES = new Set([
    'video/mp4', 'audio/mp4', 'video/quicktime', 'audio/quicktime',
    'video/x-matroska', 'audio/x-matroska', 'video/webm', 'audio/webm',
    'video/mp2t', 'video/3gpp',
    'video/ogg', 'audio/ogg',
    'audio/flac', 'audio/wav', 'audio/aiff', 'audio/aac', 'audio/mpeg'
]);

function validateEntry(entry, db) {
    const errors = [];

    // name
    if (!entry.name || typeof entry.name !== 'string') {
        errors.push('name: required string');
    } else if (entry.name.length < 3) {
        errors.push('name: too short (min 3 chars)');
    } else {
        for (const [key, group] of Object.entries(db)) {
            if (group.tests.some(t => t.name === entry.name)) {
                errors.push(`name: "${entry.name}" already exists in ${key}`);
            }
        }
    }

    // codec
    if (!entry.codec || typeof entry.codec !== 'string') {
        errors.push('codec: required string');
    } else {
        const { mime } = parseCodecField(entry.codec);
        if (!VALID_MIME_TYPES.has(mime)) {
            errors.push(`codec: unknown MIME type "${mime}". Valid: ${[...VALID_MIME_TYPES].join(', ')}`);
        }
    }

    // container
    if (!entry.container || typeof entry.container !== 'string') {
        errors.push('container: required string');
    } else if (!VALID_CONTAINERS.has(entry.container)) {
        errors.push(`container: "${entry.container}" not recognized. Valid: ${[...VALID_CONTAINERS].join(', ')}`);
    }

    // info
    if (!entry.info || typeof entry.info !== 'string') {
        errors.push('info: required string');
    }

    // mediaConfig
    if (!entry.mediaConfig || typeof entry.mediaConfig !== 'object') {
        errors.push('mediaConfig: required object');
    } else {
        if (!['file', 'media-source'].includes(entry.mediaConfig.type)) {
            errors.push("mediaConfig.type: must be 'file' or 'media-source'");
        }

        const hasVideo = !!entry.mediaConfig.video;
        const hasAudio = !!entry.mediaConfig.audio;

        if (!hasVideo && !hasAudio) {
            errors.push('mediaConfig: must contain video or audio sub-object');
        }

        if (hasVideo) {
            const v = entry.mediaConfig.video;
            if (typeof v !== 'object') {
                errors.push('mediaConfig.video: must be object');
            } else {
                if (!v.contentType) errors.push('mediaConfig.video.contentType: required');
                else if (v.contentType !== entry.codec) errors.push('mediaConfig.video.contentType: must match codec field');
                if (!Number.isInteger(v.width) || v.width <= 0) errors.push('mediaConfig.video.width: positive integer required');
                if (!Number.isInteger(v.height) || v.height <= 0) errors.push('mediaConfig.video.height: positive integer required');
                if (!Number.isInteger(v.bitrate) || v.bitrate <= 0) errors.push('mediaConfig.video.bitrate: positive integer required');
                if (typeof v.framerate !== 'number' || v.framerate <= 0) errors.push('mediaConfig.video.framerate: positive number required');
                if (v.transferFunction && !['pq', 'hlg', 'srgb'].includes(v.transferFunction)) {
                    errors.push("mediaConfig.video.transferFunction: must be 'pq', 'hlg', or 'srgb'");
                }
                if (v.colorGamut && !['rec2020', 'p3', 'srgb'].includes(v.colorGamut)) {
                    errors.push("mediaConfig.video.colorGamut: must be 'rec2020', 'p3', or 'srgb'");
                }
            }
        }

        if (hasAudio) {
            const a = entry.mediaConfig.audio;
            if (typeof a !== 'object') {
                errors.push('mediaConfig.audio: must be object');
            } else {
                if (!a.contentType) errors.push('mediaConfig.audio.contentType: required');
                else if (a.contentType !== entry.codec) errors.push('mediaConfig.audio.contentType: must match codec field');
                if (!Number.isInteger(a.channels) || a.channels <= 0) errors.push('mediaConfig.audio.channels: positive integer required');
                if (!Number.isInteger(a.bitrate) || a.bitrate <= 0) errors.push('mediaConfig.audio.bitrate: positive integer required');
                if (a.samplerate !== undefined && (!Number.isInteger(a.samplerate) || a.samplerate <= 0)) {
                    errors.push('mediaConfig.audio.samplerate: positive integer if provided');
                }
            }
        }
    }

    return errors;
}

// --- Group auto-detection from codec string ---

const CODEC_TAG_TO_GROUP = {
    // Video
    'hvc1': 'video_hevc', 'hev1': 'video_hevc',
    'dvh1': 'video_dolby_vision', 'dvhe': 'video_dolby_vision',
    'dva1': 'video_dolby_vision', 'dav1': 'video_dolby_vision', 'dvav': 'video_dolby_vision',
    'av01': 'video_av1',
    'vp09': 'video_vp9',
    'avc1': 'video_avc', 'avc3': 'video_avc',
    'vvc1': 'video_vvc', 'vvi1': 'video_vvc',
    'vp8': 'video_vp8', 'vp08': 'video_vp8',
    'mp4v': 'video_legacy', 'H263': 'video_legacy', 'theora': 'video_legacy',
    // Audio
    'ac-3': 'audio_dolby', 'ec-3': 'audio_dolby', 'ac-4': 'audio_dolby', 'mlpa': 'audio_dolby',
    'dtsc': 'audio_dts', 'dtsh': 'audio_dts', 'dtse': 'audio_dts', 'dtsl': 'audio_dts', 'dtsx': 'audio_dts',
    'fLaC': 'audio_lossless', 'flac': 'audio_lossless', 'alac': 'audio_lossless',
    'opus': 'audio_lossless', 'Opus': 'audio_lossless',
    'mp4a': 'audio_standard', 'mp3': 'audio_standard', 'vorbis': 'audio_standard',
    'mhm1': 'audio_mpeg_h', 'mhm2': 'audio_mpeg_h',
};

const MIME_TO_GROUP = {
    'audio/flac': 'audio_lossless',
    'audio/wav': 'audio_lossless',
    'audio/aiff': 'audio_lossless',
    'audio/ogg': 'audio_lossless',
    'audio/aac': 'audio_standard',
    'audio/mpeg': 'audio_standard',
    'video/ogg': 'video_legacy',
};

function detectGroup(entry) {
    // Streaming entries (media-source type) go to streaming group
    if (entry.mediaConfig?.type === 'media-source') return 'streaming_hls';

    const { mime, string } = parseCodecField(entry.codec);
    const tag = string ? string.split('.')[0] : '';

    // Codec tag lookup
    if (tag && CODEC_TAG_TO_GROUP[tag]) return CODEC_TAG_TO_GROUP[tag];

    // MIME fallback for native formats (audio/flac, audio/wav, etc.)
    if (MIME_TO_GROUP[mime]) return MIME_TO_GROUP[mime];

    return null;
}

// --- Command handlers ---

async function cmdStats() {
    const db = await loadDatabase();
    const { groups, totalEntries, totalWithEdu, totalMissing } = getStats(db);

    console.log(`\n${C.bold}CodecProbe Database Stats${C.reset}\n`);

    const header = `${'Group'.padEnd(22)} ${'Cat'.padEnd(14)} ${'Total'.padStart(5)} ${'Edu'.padStart(5)} ${'Miss'.padStart(5)} ${'Plat'.padStart(5)} ${'Refs'.padStart(5)}`;
    console.log(`${C.dim}${header}${C.reset}`);
    console.log(`${C.dim}${'─'.repeat(header.length)}${C.reset}`);

    for (const g of groups) {
        const pct = g.total > 0 ? Math.round(g.withEdu / g.total * 100) : 0;
        const color = pct === 100 ? C.green : pct > 0 ? C.yellow : C.red;
        const bar = `${color}${pct.toString().padStart(3)}%${C.reset}`;
        console.log(
            `${g.key.padEnd(22)} ${g.category.padEnd(14)} ${String(g.total).padStart(5)} ` +
            `${String(g.withEdu).padStart(5)} ${String(g.missing).padStart(5)} ` +
            `${String(g.withPlatforms).padStart(5)} ${String(g.withRefs).padStart(5)}  ${bar}`
        );
    }

    console.log(`${C.dim}${'─'.repeat(header.length)}${C.reset}`);
    console.log(`${'TOTAL'.padEnd(22)} ${''.padEnd(14)} ${String(totalEntries).padStart(5)} ${String(totalWithEdu).padStart(5)} ${String(totalMissing).padStart(5)}`);
    console.log();
}

async function cmdGroups() {
    const db = await loadDatabase();
    for (const key of Object.keys(db)) {
        console.log(key);
    }
}

async function cmdList(groupKey, filter) {
    const db = await loadDatabase();
    if (!db[groupKey]) {
        console.error(`${C.red}Group "${groupKey}" not found.${C.reset} Available: ${Object.keys(db).join(', ')}`);
        process.exit(1);
    }

    const entries = listEntries(db, groupKey, filter);
    const group = db[groupKey];
    console.log(`\n${C.bold}${group.category}${C.reset} (${groupKey}) — ${entries.length} entries${filter !== 'all' ? ` [${filter}]` : ''}\n`);

    for (const e of entries) {
        const icon = e.hasEducation ? `${C.green}✓${C.reset}` : `${C.red}✗${C.reset}`;
        const flags = [];
        if (e.hasPlatforms) flags.push('P');
        if (e.hasStreaming) flags.push('S');
        if (e.hasReferences) flags.push('R');
        const flagStr = flags.length ? `${C.dim}[${flags.join('')}]${C.reset}` : '';
        console.log(`  ${icon} ${e.name} ${flagStr} ${C.gray}${e.container}${C.reset}`);
    }
    console.log();
}

async function cmdShow(groupKey, name) {
    const db = await loadDatabase();
    if (!db[groupKey]) {
        console.error(`${C.red}Group "${groupKey}" not found.${C.reset}`);
        process.exit(1);
    }

    const entry = getEntry(db, groupKey, name);
    if (!entry) {
        console.error(`${C.red}Entry "${name}" not found in ${groupKey}.${C.reset}`);
        const entries = listEntries(db, groupKey);
        console.error(`Available: ${entries.map(e => e.name).join(', ')}`);
        process.exit(1);
    }

    console.log(JSON.stringify(entry, null, 2));
}

async function cmdScaffold(groupKey) {
    const db = await loadDatabase();
    if (!db[groupKey]) {
        console.error(`${C.red}Group "${groupKey}" not found.${C.reset}`);
        process.exit(1);
    }

    const missing = listEntries(db, groupKey, 'missing');
    if (missing.length === 0) {
        console.error(`All entries in ${groupKey} already have education.`);
        process.exit(0);
    }

    const lines = [];
    lines.push(`// Education data for ${groupKey} (${missing.length} entries)`);
    lines.push(`// Fill in 'meaning' fields and 'overview', then run:`);
    lines.push(`//   node scripts/db-tool.mjs inject ${groupKey} <this-file>`);
    lines.push('');
    lines.push('export default {');

    for (let mi = 0; mi < missing.length; mi++) {
        const entry = getEntry(db, groupKey, missing[mi].name);
        const { mime, string } = parseCodecField(entry.codec);
        const tokens = tokenizeCodecString(string);
        const refs = getRefsForEntry(groupKey, string);

        lines.push(`    ${JSON.stringify(entry.name)}: {`);
        lines.push(`        codecBreakdown: {`);
        lines.push(`            mime: '${mime}',`);
        lines.push(`            string: '${string}',`);
        lines.push(`            parts: [`);
        tokens.forEach((t, i) => {
            const comma = i < tokens.length - 1 ? ',' : '';
            lines.push(`                { token: '${t.token}', meaning: '' }${comma}`);
        });
        lines.push(`            ]`);
        lines.push(`        },`);
        lines.push(`        overview: '',`);
        if (refs.length > 0) {
            lines.push(`        references: [`);
            refs.forEach((r, i) => {
                const comma = i < refs.length - 1 ? ',' : '';
                if (r.url) {
                    lines.push(`            { title: '${r.title}', url: '${r.url}' }${comma}`);
                } else {
                    lines.push(`            { title: '${r.title}' }${comma}`);
                }
            });
            lines.push(`        ]`);
        }
        const entryComma = mi < missing.length - 1 ? ',' : '';
        lines.push(`    }${entryComma}`);
    }

    lines.push('};');
    console.log(lines.join('\n'));
}

async function cmdInject(groupKey, dataFile, dryRun) {
    const db = await loadDatabase();
    if (!db[groupKey]) {
        console.error(`${C.red}Group "${groupKey}" not found.${C.reset}`);
        process.exit(1);
    }

    const data = await loadDataFile(dataFile);
    let source = await readSource();

    let injected = 0, skipped = 0, notFound = 0;

    console.log(`\nInjecting education into ${C.bold}${groupKey}${C.reset}...\n`);

    for (const [name, edu] of Object.entries(data)) {
        const result = injectEducation(source, name, edu, groupKey);
        if (result.ok) {
            source = result.source;
            console.log(`  ${C.green}✓${C.reset} ${name}`);
            injected++;
        } else {
            const isSkip = result.reason.includes('already has');
            console.log(`  ${isSkip ? C.yellow + '⊘' : C.red + '✗'}${C.reset} ${name} — ${result.reason}`);
            if (isSkip) skipped++; else notFound++;
        }
    }

    console.log(`\n  Injected: ${injected}, Skipped: ${skipped}, Not found: ${notFound}`);

    if (injected === 0) return;

    if (dryRun) {
        console.log(`  ${C.yellow}(dry run — no changes written)${C.reset}`);
        return;
    }

    const syntaxResult = verifySyntax(source);
    if (syntaxResult !== true) {
        console.error(`  ${C.red}✗ Syntax error — NOT WRITTEN${C.reset}`);
        console.error(`  ${syntaxResult}`);
        process.exit(1);
    }

    await writeSource(source);
    console.log(`  ${C.green}✓ Written to disk${C.reset}`);
    console.log();
}

async function cmdPatch(groupKey, dataFile, dryRun) {
    const db = await loadDatabase();
    if (!db[groupKey]) {
        console.error(`${C.red}Group "${groupKey}" not found.${C.reset}`);
        process.exit(1);
    }

    const data = await loadDataFile(dataFile);
    let source = await readSource();

    let patched = 0, skipped = 0, notFound = 0;

    console.log(`\nPatching education in ${C.bold}${groupKey}${C.reset}...\n`);

    for (const [name, patchData] of Object.entries(data)) {
        const entry = getEntry(db, groupKey, name);
        if (!entry) {
            console.log(`  ${C.red}✗${C.reset} ${name} — not found in database`);
            notFound++;
            continue;
        }
        if (!entry.education) {
            console.log(`  ${C.yellow}⊘${C.reset} ${name} — no existing education to patch`);
            skipped++;
            continue;
        }

        const merged = deepMerge(entry.education, patchData);
        const result = replaceEducation(source, name, merged, groupKey);

        if (result.ok) {
            source = result.source;
            console.log(`  ${C.green}✓${C.reset} ${name}`);
            patched++;
        } else {
            console.log(`  ${C.red}✗${C.reset} ${name} — ${result.reason}`);
            notFound++;
        }
    }

    console.log(`\n  Patched: ${patched}, Skipped: ${skipped}, Not found: ${notFound}`);

    if (patched === 0) return;

    if (dryRun) {
        console.log(`  ${C.yellow}(dry run — no changes written)${C.reset}`);
        return;
    }

    const syntaxResult = verifySyntax(source);
    if (syntaxResult !== true) {
        console.error(`  ${C.red}✗ Syntax error — NOT WRITTEN${C.reset}`);
        console.error(`  ${syntaxResult}`);
        process.exit(1);
    }

    await writeSource(source);
    console.log(`  ${C.green}✓ Written to disk${C.reset}`);
    console.log();
}

async function cmdAdd(dataFile, groupOverride, dryRun) {
    const db = await loadDatabase();
    const data = await loadDataFile(dataFile);

    // Accept array or single entry
    const entries = Array.isArray(data) ? data : [data];
    let source = await readSource();
    let added = 0, failed = 0;

    console.log(`\nAdding ${entries.length} entry(es)...\n`);

    for (const entry of entries) {
        // Validate
        const errors = validateEntry(entry, db);
        if (errors.length > 0) {
            console.log(`  ${C.red}✗${C.reset} ${entry.name || '(unnamed)'}`);
            for (const err of errors) console.log(`    ${C.red}→${C.reset} ${err}`);
            failed++;
            continue;
        }

        // Detect or use explicit group
        const groupKey = groupOverride || detectGroup(entry);
        if (!groupKey) {
            console.log(`  ${C.red}✗${C.reset} ${entry.name} — could not detect group from codec "${entry.codec}". Use --group <key>`);
            failed++;
            continue;
        }
        if (!db[groupKey]) {
            console.log(`  ${C.red}✗${C.reset} ${entry.name} — group "${groupKey}" not found`);
            failed++;
            continue;
        }

        const result = addEntry(source, entry, groupKey);
        if (result.ok) {
            source = result.source;
            console.log(`  ${C.green}✓${C.reset} ${entry.name} → ${C.cyan}${groupKey}${C.reset}`);
            added++;
        } else {
            console.log(`  ${C.red}✗${C.reset} ${entry.name} — ${result.reason}`);
            failed++;
        }
    }

    console.log(`\n  Added: ${added}, Failed: ${failed}`);

    if (added === 0) return;

    if (dryRun) {
        console.log(`  ${C.yellow}(dry run — no changes written)${C.reset}`);
        return;
    }

    const syntaxResult = verifySyntax(source);
    if (syntaxResult !== true) {
        console.error(`  ${C.red}✗ Syntax error — NOT WRITTEN${C.reset}`);
        console.error(`  ${syntaxResult}`);
        process.exit(1);
    }

    await writeSource(source);
    console.log(`  ${C.green}✓ Written to disk${C.reset}`);
    console.log();
}

async function cmdVerify() {
    console.log(`\n${C.bold}Verifying codec-database.js${C.reset}\n`);

    // 1. Syntax check
    const source = await readSource();
    const syntaxResult = verifySyntax(source);
    if (syntaxResult !== true) {
        console.log(`  ${C.red}✗ Syntax error${C.reset}`);
        console.log(`  ${syntaxResult}`);
        process.exit(1);
    }
    console.log(`  ${C.green}✓${C.reset} Syntax OK`);

    // 2. Import check
    const db = await loadDatabase();
    const groupKeys = Object.keys(db);
    console.log(`  ${C.green}✓${C.reset} Module imports OK (${groupKeys.length} groups)`);

    // 3. Structure check
    let issues = 0;
    let totalEntries = 0;
    for (const [key, group] of Object.entries(db)) {
        if (!group.category) { console.log(`  ${C.red}✗${C.reset} ${key}: missing category`); issues++; }
        if (!group.tests || !Array.isArray(group.tests)) {
            console.log(`  ${C.red}✗${C.reset} ${key}: missing or invalid tests array`);
            issues++;
            continue;
        }

        for (const test of group.tests) {
            totalEntries++;
            const required = ['name', 'codec', 'container', 'info', 'mediaConfig'];
            for (const field of required) {
                if (!test[field]) {
                    console.log(`  ${C.red}✗${C.reset} ${key}/${test.name || '?'}: missing ${field}`);
                    issues++;
                }
            }

            if (test.education) {
                if (!test.education.codecBreakdown) {
                    console.log(`  ${C.yellow}⚠${C.reset} ${key}/${test.name}: education missing codecBreakdown`);
                }
                if (!test.education.overview && test.education.overview !== '') {
                    console.log(`  ${C.yellow}⚠${C.reset} ${key}/${test.name}: education missing overview`);
                }
            }
        }
    }

    console.log(`  ${C.green}✓${C.reset} Structure OK (${totalEntries} entries, ${issues} issues)`);
    console.log();

    if (issues > 0) process.exit(1);
}

// --- CLI dispatch ---

function usage() {
    console.log(`
${C.bold}CodecProbe Database Tool${C.reset}

${C.cyan}Usage:${C.reset}  node scripts/db-tool.mjs <command> [args]

${C.cyan}Commands:${C.reset}
  stats                                  Show group counts and education coverage
  groups                                 List group keys
  list <group> [--missing|--complete]    List entries in a group
  show <group> <name>                    Show full entry details as JSON
  scaffold <group>                       Generate education template for missing entries
  inject <group> <file> [--dry-run]      Inject education from .mjs/.json file
  patch <group> <file> [--dry-run]       Deep-merge patch into existing education
  add <file> [--group <key>] [--dry-run] Add new test entries (auto-detects group from codec)
  verify                                 Syntax + structure check

${C.cyan}Validation (add):${C.reset}
  Required: name, codec (valid MIME), container, info, mediaConfig.type + video{}/audio{}
  Auto-checks: duplicate names, contentType matches codec, MIME/container known,
               video dimensions/bitrate/framerate, audio channels/bitrate positive ints,
               transferFunction in {pq,hlg,srgb}, colorGamut in {rec2020,p3,srgb}

${C.cyan}Examples:${C.reset}
  node scripts/db-tool.mjs stats
  node scripts/db-tool.mjs list video_av1 --missing
  node scripts/db-tool.mjs scaffold video_av1 > /tmp/av1-edu.mjs
  node scripts/db-tool.mjs inject video_av1 /tmp/av1-edu.mjs --dry-run
  node scripts/db-tool.mjs inject video_av1 /tmp/av1-edu.mjs
  node scripts/db-tool.mjs patch video_av1 /tmp/av1-patch.mjs
  node scripts/db-tool.mjs add /tmp/new-entries.mjs --dry-run
  node scripts/db-tool.mjs add /tmp/new-entries.mjs --group video_hevc
  node scripts/db-tool.mjs verify
`);
}

const [,, command, ...args] = process.argv;
const dryRun = args.includes('--dry-run');

// Parse --group <value> flag (consumes both tokens)
const groupFlagIdx = args.indexOf('--group');
const groupOverride = groupFlagIdx !== -1 ? args[groupFlagIdx + 1] : null;

// Positional args = everything that's not a flag or a flag value
const positional = args.filter((a, i) => {
    if (a.startsWith('--')) return false;
    if (groupFlagIdx !== -1 && i === groupFlagIdx + 1) return false;
    return true;
});

const filter = args.includes('--missing') ? 'missing' : args.includes('--complete') ? 'complete' : 'all';

try {
    switch (command) {
        case 'stats':    await cmdStats(); break;
        case 'groups':   await cmdGroups(); break;
        case 'list':     await cmdList(positional[0], filter); break;
        case 'show':     await cmdShow(positional[0], positional.slice(1).join(' ')); break;
        case 'scaffold': await cmdScaffold(positional[0]); break;
        case 'inject':   await cmdInject(positional[0], positional[1], dryRun); break;
        case 'patch':    await cmdPatch(positional[0], positional[1], dryRun); break;
        case 'add':      await cmdAdd(positional[0], groupOverride, dryRun); break;
        case 'verify':   await cmdVerify(); break;
        default:         usage(); break;
    }
} catch (err) {
    console.error(`${C.red}Error:${C.reset} ${err.message}`);
    process.exit(1);
}
