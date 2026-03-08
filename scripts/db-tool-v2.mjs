#!/usr/bin/env node

/**
 * CodecProbe v2 Database Tool — SQL verb-first dispatch
 *
 * Codec string = primary key. Verbs:
 *   select <codec> | --stats | --group <key>   Read
 *   create <codec> --name <n> [scenario opts]  Insert new record
 *   insert <codec> scenario|ref|hls|dash ...   Add to existing record
 *   update <codec> key=value                   Update field
 *   rename <codec> <new-codec>                 Rename PK
 *   delete <codec> scenario|ref <name>         Remove sub-item
 *   drop <codec> --confirm                     Delete entire record
 *   verify                                     Validate all records
 */

import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { execFileSync } from 'child_process';
import { tmpdir } from 'os';
import { join, resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = import.meta.dirname ?? dirname(fileURLToPath(import.meta.url));
const DB_PATH = resolve(__dirname, '../js/codec-database-v2.js');


// ==================== ANSI COLORS ====================

const C = {
    reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
    green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m',
    cyan: '\x1b[36m', gray: '\x1b[90m', magenta: '\x1b[35m'
};


// ==================== FILE I/O ====================

function readSource() {
    return readFileSync(DB_PATH, 'utf-8');
}

function writeSourceFile(source) {
    writeFileSync(DB_PATH, source, 'utf-8');
}

function verifySyntax(source) {
    const tmp = join(tmpdir(), `db-v2-verify-${Date.now()}.js`);
    writeFileSync(tmp, source);
    try {
        execFileSync('node', ['-c', tmp], { stdio: 'pipe' });
        return true;
    } catch (e) {
        return e.stderr?.toString() || 'Unknown syntax error';
    } finally {
        try { unlinkSync(tmp); } catch {}
    }
}

async function loadDatabase() {
    const url = pathToFileURL(DB_PATH).href;
    const mod = await import(url);
    return mod.codecSource;
}


// ==================== STRING QUOTING ====================

function q(str) {
    if (typeof str !== 'string') return String(str);
    let s = str.replace(/\\/g, '\\\\');
    if (!s.includes("'")) return `'${s}'`;
    if (!s.includes('"')) return `"${s}"`;
    return `'${s.replace(/'/g, "\\'")}'`;
}

function qBacktick(str) {
    const expanded = str.replace(/\\n/g, '\n');
    return '`' + expanded.replace(/`/g, '\\`').replace(/\$/g, '\\$') + '`';
}

/** Format number with underscore separators for values >= 1_000_000 */
function fmtNum(n) {
    if (n >= 1_000_000) {
        const s = String(n);
        let result = '';
        for (let i = s.length - 1, count = 0; i >= 0; i--, count++) {
            if (count > 0 && count % 3 === 0) result = '_' + result;
            result = s[i] + result;
        }
        return result;
    }
    return String(n);
}


// ==================== SOURCE TEXT NAVIGATION ====================

function skipString(source, startIdx) {
    const quote = source[startIdx];
    for (let i = startIdx + 1; i < source.length; i++) {
        if (source[i] === '\\') { i++; continue; }
        if (source[i] === quote) return i;
    }
    return source.length - 1;
}

function findMatchingBrace(source, openIdx) {
    let depth = 0;
    let i = openIdx;
    while (i < source.length) {
        const ch = source[i];
        if (ch === '"' || ch === "'" || ch === '`') {
            i = skipString(source, i) + 1;
            continue;
        }
        if (ch === '{') depth++;
        if (ch === '}') { depth--; if (depth === 0) return i; }
        i++;
    }
    return -1;
}

function findMatchingBracket(source, openIdx) {
    let depth = 0;
    let i = openIdx;
    while (i < source.length) {
        const ch = source[i];
        if (ch === '"' || ch === "'" || ch === '`') {
            i = skipString(source, i) + 1;
            continue;
        }
        if (ch === '[') depth++;
        if (ch === ']') { depth--; if (depth === 0) return i; }
        i++;
    }
    return -1;
}

function findGroupRange(source, groupKey) {
    const pattern = `    ${groupKey}: {`;
    const idx = source.indexOf(pattern);
    if (idx === -1) return null;
    const braceIdx = source.indexOf('{', idx + groupKey.length);
    const endIdx = findMatchingBrace(source, braceIdx);
    if (endIdx === -1) return null;
    return { start: braceIdx, end: endIdx };
}

/** Find a record by its codec string within source text */
function findRecordByCodec(source, codecString, groupStart = 0, groupEnd = source.length) {
    const patterns = [`codec: '${codecString}',`, `codec: "${codecString}",`];

    let codecIdx = -1;
    for (const p of patterns) {
        const idx = source.indexOf(p, groupStart);
        if (idx !== -1 && idx < groupEnd) { codecIdx = idx; break; }
    }
    if (codecIdx === -1) return null;

    // Walk backward to find entry opening {
    let entryStart = -1;
    for (let i = codecIdx - 1; i >= groupStart; i--) {
        if (source[i] === '{') {
            const lineStart = source.lastIndexOf('\n', i - 1) + 1;
            if (source.substring(lineStart, i).trim() === '') {
                entryStart = i;
                break;
            }
        }
    }
    if (entryStart === -1) return null;

    const entryEnd = findMatchingBrace(source, entryStart);
    if (entryEnd === -1 || entryEnd > groupEnd) return null;

    // Find comment header above (// ── codec ──)
    let commentStart = entryStart;
    const lineAbove = source.lastIndexOf('\n', entryStart - 1);
    if (lineAbove >= 0) {
        const twoLinesAbove = source.lastIndexOf('\n', lineAbove - 1);
        if (twoLinesAbove >= 0) {
            const commentLine = source.substring(twoLinesAbove + 1, lineAbove);
            if (commentLine.trim().startsWith('// ──')) {
                // Include blank line before comment
                const blankLine = source.lastIndexOf('\n', twoLinesAbove - 1);
                commentStart = blankLine >= 0 ? blankLine + 1 : twoLinesAbove + 1;
            }
        }
    }

    return { start: entryStart, end: entryEnd, commentStart, codecIdx };
}

/** Find the codecs: [...] array range within a group */
function findCodecsArray(source, groupStart, groupEnd) {
    const area = source.substring(groupStart, groupEnd);
    const match = area.match(/codecs:\s*\[/);
    if (!match) return null;
    const bracketStart = groupStart + match.index + match[0].length - 1;
    const bracketEnd = findMatchingBracket(source, bracketStart);
    if (bracketEnd === -1) return null;
    return { start: bracketStart, end: bracketEnd };
}

/** Find the scenarios: [...] array within a record range */
function findScenariosArray(source, entryStart, entryEnd) {
    const area = source.substring(entryStart, entryEnd);
    const match = area.match(/scenarios:\s*\[/);
    if (!match) return null;
    const bracketStart = entryStart + match.index + match[0].length - 1;
    const bracketEnd = findMatchingBracket(source, bracketStart);
    if (bracketEnd === -1 || bracketEnd > entryEnd) return null;
    return { start: bracketStart, end: bracketEnd };
}

/** Find a specific scenario by name within scenarios array */
function findScenarioByName(source, scenariosStart, scenariosEnd, scenarioName) {
    const patterns = [`name: '${scenarioName}',`, `name: "${scenarioName}",`];

    let nameIdx = -1;
    for (const p of patterns) {
        const idx = source.indexOf(p, scenariosStart);
        if (idx !== -1 && idx < scenariosEnd) { nameIdx = idx; break; }
    }
    if (nameIdx === -1) return null;

    // Walk backward to opening {
    let objStart = -1;
    for (let i = nameIdx - 1; i >= scenariosStart; i--) {
        if (source[i] === '{') {
            objStart = i;
            break;
        }
    }
    if (objStart === -1) return null;

    const objEnd = findMatchingBrace(source, objStart);
    if (objEnd === -1 || objEnd > scenariosEnd) return null;

    return { start: objStart, end: objEnd };
}

/** Find a field's value range within entry source */
function findFieldInEntry(source, entryStart, entryEnd, fieldName) {
    const area = source.substring(entryStart, entryEnd);
    const pattern = new RegExp(`(\\s+${fieldName}:\\s*)`);
    const match = pattern.exec(area);
    if (!match) return null;

    const absIdx = entryStart + match.index + match[0].length;
    const ch = source[absIdx];
    if (ch === '[') {
        const end = findMatchingBracket(source, absIdx);
        return { valueStart: absIdx, valueEnd: end };
    }
    if (ch === '{') {
        const end = findMatchingBrace(source, absIdx);
        return { valueStart: absIdx, valueEnd: end };
    }
    if (ch === "'" || ch === '"') {
        const end = skipString(source, absIdx);
        return { valueStart: absIdx, valueEnd: end };
    }
    // Number or identifier
    let end = absIdx;
    while (end < entryEnd && source[end] !== ',' && source[end] !== '\n') end++;
    return { valueStart: absIdx, valueEnd: end - 1 };
}


function findNestedField(source, entryStart, entryEnd, dotPath) {
    const parts = dotPath.split('.');
    let scopeStart = entryStart;
    let scopeEnd = entryEnd;

    // Navigate through parent objects
    for (let i = 0; i < parts.length - 1; i++) {
        const field = findFieldInEntry(source, scopeStart, scopeEnd, parts[i]);
        if (!field) {
            // Parent segment missing — return info for the caller to create it
            return { leaf: null, leafName: parts[parts.length - 1],
                missingFrom: i, missingSegments: parts.slice(i),
                parentStart: scopeStart, parentEnd: scopeEnd };
        }
        if (source[field.valueStart] !== '{') return null;
        scopeStart = field.valueStart;
        scopeEnd = field.valueEnd;
    }

    const leafName = parts[parts.length - 1];
    const leaf = findFieldInEntry(source, scopeStart, scopeEnd, leafName);

    return { leaf, leafName, parentStart: scopeStart, parentEnd: scopeEnd };
}

function indentAt(source, pos) {
    let lineStart = pos;
    while (lineStart > 0 && source[lineStart - 1] !== '\n') lineStart--;
    let indent = 0;
    while (lineStart + indent < source.length && source[lineStart + indent] === ' ') indent++;
    return indent;
}

function insertIntoObject(source, objStart, objEnd, key, formattedValue) {
    const innerIndent = indentAt(source, objEnd) + 4;
    const pad = ' '.repeat(innerIndent);
    const entry = `${pad}${key}: ${formattedValue}`;

    // Check if object is empty
    const inner = source.substring(objStart + 1, objEnd).trim();
    if (inner === '') {
        return source.substring(0, objStart + 1) + '\n' + entry + '\n' +
            ' '.repeat(indentAt(source, objEnd)) + '}' + source.substring(objEnd + 1);
    }

    // Non-empty: find last content before closing }
    let lastContent = objEnd - 1;
    while (lastContent > objStart && /\s/.test(source[lastContent])) lastContent--;
    const needsComma = source[lastContent] !== ',';
    const comma = needsComma ? ',' : '';

    return source.substring(0, lastContent + 1) + comma + '\n' + entry +
        source.substring(lastContent + 1);
}

/**
 * Find a codec record in both the live DB and source text.
 * Returns { group, groupKey, mediaType, record, sourceRecord } or { error }.
 */
function resolveRecord(source, db, codecString) {
    let groupKey = null;
    let dbRecord = null;
    for (const [key, group] of Object.entries(db)) {
        const rec = group.codecs.find(r => r.codec === codecString);
        if (rec) { groupKey = key; dbRecord = rec; break; }
    }
    if (!groupKey) return { error: `Record not found: ${codecString}` };

    const groupRange = findGroupRange(source, groupKey);
    if (!groupRange) return { error: `Group "${groupKey}" not found in source text` };

    const sourceRecord = findRecordByCodec(source, codecString, groupRange.start, groupRange.end);
    if (!sourceRecord) return { error: `Record not found in source text: ${codecString}` };

    return {
        groupKey,
        group: db[groupKey],
        mediaType: db[groupKey].type,
        record: dbRecord,
        sourceRecord,
        groupRange
    };
}

/**
 * Append a formatted item into an array in source text.
 * Handles empty arrays, trailing commas, and indentation.
 */
function spliceInsertIntoArray(source, arrStart, arrEnd, formattedItem, closingIndent) {
    const inner = source.substring(arrStart + 1, arrEnd).trim();
    if (inner === '') {
        return source.substring(0, arrStart + 1) + '\n' + formattedItem + '\n' +
            closingIndent + source.substring(arrEnd);
    }

    let lastContent = arrEnd - 1;
    while (lastContent > arrStart && /\s/.test(source[lastContent])) lastContent--;

    const needsComma = source[lastContent] !== ',' && source[lastContent] !== '[';
    const comma = needsComma ? ',' : '';

    return source.substring(0, lastContent + 1) + comma + '\n' + formattedItem +
        source.substring(lastContent + 1);
}


// ==================== CODEC TAG → GROUP MAPPING ====================

const CODEC_TAG_TO_GROUP = {
    hvc1: 'video_hevc', hev1: 'video_hevc',
    dvh1: 'video_dolby_vision', dvhe: 'video_dolby_vision',
    dva1: 'video_dolby_vision', dav1: 'video_dolby_vision', dvav: 'video_dolby_vision',
    dvc1: 'video_dolby_vision', dvhp: 'video_dolby_vision',
    av01: 'video_av1',
    vp09: 'video_vp9',
    avc1: 'video_avc', avc3: 'video_avc',
    vvc1: 'video_vvc', vvi1: 'video_vvc',
    vp8: 'video_vp8', vp08: 'video_vp8',
    mp4v: 'video_legacy', H263: 'video_legacy', theora: 'video_legacy',
    'ac-3': 'audio_dolby', 'ec-3': 'audio_dolby', 'ac-4': 'audio_dolby', mlpa: 'audio_dolby',
    dtsc: 'audio_dts', dtsh: 'audio_dts', dtse: 'audio_dts', dtsl: 'audio_dts', dtsx: 'audio_dts',
    fLaC: 'audio_lossless', flac: 'audio_lossless', alac: 'audio_lossless',
    opus: 'audio_lossless', Opus: 'audio_lossless',
    mp4a: 'audio_standard', mp3: 'audio_standard', vorbis: 'audio_standard',
    mhm1: 'audio_mpeg_h', mhm2: 'audio_mpeg_h',
};

function extractPrimaryTag(codecString) {
    // Handle tags with hyphens like ac-3, ec-3, ac-4
    const match = codecString.match(/^([a-zA-Z]+-\d|[a-zA-Z0-9]+)/);
    return match ? match[1] : codecString.split('.')[0];
}

function detectGroupFromCodec(codecString) {
    // Supplemental: "hvc1.2.4.L153.B0, dvh1.08.06" → route by dvh1
    const parts = codecString.split(', ');
    if (parts.length > 1) {
        const dvTag = extractPrimaryTag(parts[1]);
        if (CODEC_TAG_TO_GROUP[dvTag]) return CODEC_TAG_TO_GROUP[dvTag];
    }
    const tag = extractPrimaryTag(codecString);
    return CODEC_TAG_TO_GROUP[tag] || null;
}


// ==================== FAMILY DEFAULTS ====================

const FAMILY_DEFAULTS = {
    hvc1: { file: ['mp4', 'mkv', 'mov'], stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts'] },
    hev1: { file: ['mp4', 'mkv', 'mov'], stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts'] },
    dvh1: { file: ['mp4', 'mkv', 'mov'], stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts'] },
    dvhe: { file: ['mp4', 'mkv', 'mov'], stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts'] },
    dva1: { file: ['mp4', 'mkv', 'mov'], stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts'] },
    dav1: { file: ['mp4', 'mkv', 'mov'], stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts'] },
    dvav: { file: ['mp4', 'mkv', 'mov'], stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts'] },
    dvc1: { file: ['mp4', 'mkv', 'mov'], stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts'] },
    dvhp: { file: ['mp4', 'mkv', 'mov'], stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts'] },
    av01: { file: ['mp4', 'mkv', 'webm'], stream: ['fmp4', 'dash', 'cmaf'] },
    vp09: { file: ['mp4', 'mkv', 'webm'], stream: ['fmp4', 'dash'] },
    avc1: { file: ['mp4', 'mkv', 'mov', '3gp'], stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts'] },
    avc3: { file: ['mp4', 'mkv', 'mov'], stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts'] },
    vvc1: { file: ['mp4', 'mkv'], stream: ['fmp4', 'dash'] },
    vvi1: { file: ['mp4', 'mkv'], stream: ['fmp4', 'dash'] },
    vp8:  { file: ['webm'], stream: [] },
    vp08: { file: ['webm'], stream: [] },
    mp4v: { file: ['mp4', '3gp'], stream: [] },
    H263: { file: ['3gp'], stream: [] },
    theora: { file: ['ogg'], stream: [] },
    'ac-3': { file: ['mp4', 'mkv', 'mov'], stream: ['fmp4', 'mpegts'] },
    'ec-3': { file: ['mp4', 'mkv', 'mov'], stream: ['fmp4', 'mpegts'] },
    'ac-4': { file: ['mp4', 'mkv'], stream: ['fmp4'] },
    mlpa:   { file: ['mp4', 'mkv'], stream: [] },
    dtsc: { file: ['mp4', 'mkv'], stream: ['fmp4', 'mpegts'] },
    dtsh: { file: ['mp4', 'mkv'], stream: ['fmp4', 'mpegts'] },
    dtse: { file: ['mp4', 'mkv'], stream: ['fmp4', 'mpegts'] },
    dtsl: { file: ['mp4', 'mkv'], stream: ['fmp4'] },
    dtsx: { file: ['mp4', 'mkv'], stream: ['fmp4', 'mpegts'] },
    fLaC: { file: ['mp4', 'mkv', 'ogg'], stream: [] },
    flac: { file: ['mp4', 'mkv', 'ogg'], stream: [] },
    alac: { file: ['mp4', 'mkv', 'mov'], stream: [] },
    opus: { file: ['mp4', 'mkv', 'webm', 'ogg'], stream: ['fmp4'] },
    Opus: { file: ['ogg', 'webm'], stream: [] },
    mp4a: { file: ['mp4', 'mkv', 'mov'], stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts'] },
    mp3:  { file: ['mp4', 'mkv'], stream: ['mpegts'] },
    vorbis: { file: ['ogg', 'webm', 'mkv'], stream: [] },
    mhm1: { file: ['mp4', 'mkv'], stream: ['fmp4', 'dash'] },
    mhm2: { file: ['mp4', 'mkv'], stream: ['fmp4', 'dash'] },
};

const DEFAULT_DRM = ['widevine', 'playready', 'fairplay', 'clearkey'];

function getContainersForCodec(codecString) {
    const tag = extractPrimaryTag(codecString);
    return FAMILY_DEFAULTS[tag] || { file: ['mp4'], stream: ['fmp4'] };
}


// ==================== TOKENIZER ====================

/**
 * Tokenize a codec string into breakdown tokens.
 * Handles supplemental DV: "hvc1.2.4.L153.B0, dvh1.08.06" → 8 tokens.
 */
function tokenizeCodecString(codecString) {
    const parts = codecString.split(', ');
    const tokens = [];
    for (const part of parts) {
        for (const token of part.split('.')) {
            tokens.push({ token, meaning: '' });
        }
    }
    return tokens;
}


// ==================== FORMATTERS ====================

const I8  = ' '.repeat(8);
const I12 = ' '.repeat(12);
const I16 = ' '.repeat(16);
const I20 = ' '.repeat(20);
const I24 = ' '.repeat(24);
const I28 = ' '.repeat(28);

function formatStringArray(arr) {
    return `[${arr.map(s => q(s)).join(', ')}]`;
}

function formatScenario(scenario, mediaType, indent = I20) {
    const I = indent;
    const Isub = I + '    ';
    const lines = [];
    lines.push(`${I}{`);
    lines.push(`${Isub}name: ${q(scenario.name)},`);

    if (mediaType === 'video') {
        lines.push(`${Isub}width: ${scenario.width},`);
        lines.push(`${Isub}height: ${scenario.height},`);
        lines.push(`${Isub}framerate: ${scenario.framerate},`);
        lines.push(`${Isub}bitrate: ${fmtNum(scenario.bitrate)},`);
        if (scenario.bitDepth) lines.push(`${Isub}bitDepth: ${scenario.bitDepth},`);
        if (scenario.chromaSubsampling) lines.push(`${Isub}chromaSubsampling: ${q(scenario.chromaSubsampling)},`);
        if (scenario.transferFunction) lines.push(`${Isub}transferFunction: ${q(scenario.transferFunction)},`);
        if (scenario.colorGamut) lines.push(`${Isub}colorGamut: ${q(scenario.colorGamut)},`);
        if (scenario.hdrFormat) lines.push(`${Isub}hdrFormat: ${q(scenario.hdrFormat)},`);
        if (scenario.tier) lines.push(`${Isub}tier: ${q(scenario.tier)},`);
    } else {
        lines.push(`${Isub}channels: ${scenario.channels},`);
        lines.push(`${Isub}samplerate: ${fmtNum(scenario.samplerate)},`);
        lines.push(`${Isub}bitrate: ${fmtNum(scenario.bitrate)},`);
        if (scenario.bitDepth) lines.push(`${Isub}bitDepth: ${scenario.bitDepth},`);
        if (scenario.spatial) lines.push(`${Isub}spatial: true,`);
    }

    lines.push(`${I}}`);
    return lines.join('\n');
}

function formatRecord(record, mediaType) {
    const lines = [];

    // Comment header
    lines.push('');
    lines.push(`${I12}// ── ${record.codec} ──`);
    lines.push('');
    lines.push(`${I12}{`);
    lines.push(`${I16}codec: ${q(record.codec)},`);
    lines.push(`${I16}name: ${q(record.name)},`);

    // containers
    lines.push(`${I16}containers: {`);
    lines.push(`${I20}file: ${formatStringArray(record.containers.file)},`);
    if (record.containers.stream && record.containers.stream.length > 0) {
        lines.push(`${I20}stream: ${formatStringArray(record.containers.stream)}`);
    }
    lines.push(`${I16}},`);

    // drm
    if (record.drm && record.drm.length > 0) {
        lines.push(`${I16}drm: ${formatStringArray(record.drm)},`);
    }

    // flags
    if (record.flags && record.flags.length > 0) {
        lines.push(`${I16}flags: ${formatStringArray(record.flags)},`);
    }

    // scenarios
    if (record.scenarios.length === 1) {
        // Single scenario — compact [{...}] on one conceptual block
        lines.push(`${I16}scenarios: [${formatScenario(record.scenarios[0], mediaType, I16).trimStart()}],`);
    } else {
        lines.push(`${I16}scenarios: [`);
        record.scenarios.forEach((s, i) => {
            lines.push(formatScenario(s, mediaType, I20));
            if (i < record.scenarios.length - 1) {
                const lastLine = lines[lines.length - 1];
                lines[lines.length - 1] = lastLine + ',';
            }
        });
        lines.push(`${I16}],`);
    }

    // education skeleton
    lines.push(`${I16}education: {`);
    lines.push(`${I20}breakdown: [`);
    record.education.breakdown.forEach((t, i) => {
        const comma = i < record.education.breakdown.length - 1 ? ',' : '';
        lines.push(`${I24}{ token: ${q(t.token)}, meaning: ${q(t.meaning)} }${comma}`);
    });
    lines.push(`${I20}],`);
    lines.push(`${I20}overview: '',`);
    lines.push(`${I20}platforms: {},`);
    lines.push(`${I20}streaming: {},`);
    lines.push(`${I20}containerNotes: {},`);
    lines.push(`${I20}references: []`);
    lines.push(`${I16}}`);

    lines.push(`${I12}}`);
    return lines.join('\n');
}


// ==================== ARG PARSING ====================

function parseArgs(argv) {
    const result = {
        positional: [],
        flags: new Set(),
        options: {},
    };

    let i = 0;
    while (i < argv.length) {
        const arg = argv[i];
        if (arg.startsWith('--')) {
            const key = arg.substring(2);
            // Boolean flags
            if (['confirm', 'dry-run', 'missing', 'edu', 'spatial', 'stats'].includes(key)) {
                result.flags.add(key);
                i++;
                continue;
            }
            // key=value style
            if (key.includes('=')) {
                const eqIdx = key.indexOf('=');
                result.options[key.substring(0, eqIdx)] = key.substring(eqIdx + 1);
                i++;
                continue;
            }
            // --key value
            if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) {
                result.options[key] = argv[i + 1];
                i += 2;
                continue;
            }
            // Lone flag
            result.flags.add(key);
            i++;
        } else {
            result.positional.push(arg);
            i++;
        }
    }

    // Promote --spatial to options if set
    if (result.flags.has('spatial')) {
        result.options.spatial = 'true';
    }

    return result;
}


// ==================== SCENARIO BUILDER ====================

function buildScenarioFromArgs(opts, flags, mediaType) {
    const scenario = {};

    scenario.name = opts.sname;
    if (!scenario.name) return { error: '--sname (scenario name) is required' };

    if (mediaType === 'video') {
        if (!opts.width) return { error: '--width is required for video' };
        if (!opts.height) return { error: '--height is required for video' };
        if (!opts.fps) return { error: '--fps is required for video' };
        if (!opts.bitrate) return { error: '--bitrate is required for video' };

        scenario.width = parseInt(opts.width, 10);
        scenario.height = parseInt(opts.height, 10);
        scenario.framerate = parseFloat(opts.fps);
        scenario.bitrate = parseInt(opts.bitrate, 10);

        if (opts.depth) scenario.bitDepth = parseInt(opts.depth, 10);
        if (opts.chroma) {
            const raw = opts.chroma;
            scenario.chromaSubsampling = raw.includes(':') ? raw : `${raw[0]}:${raw[1]}:${raw[2]}`;
        }
        if (opts.transfer) scenario.transferFunction = opts.transfer;
        if (opts.gamut) scenario.colorGamut = opts.gamut;
        if (opts.hdr) scenario.hdrFormat = opts.hdr;
        if (opts.tier) scenario.tier = opts.tier;
    } else {
        if (!opts.channels) return { error: '--channels is required for audio' };
        if (!opts.samplerate) return { error: '--samplerate is required for audio' };
        if (!opts.bitrate) return { error: '--bitrate is required for audio' };

        scenario.channels = parseInt(opts.channels, 10);
        scenario.samplerate = parseInt(opts.samplerate, 10);
        scenario.bitrate = parseInt(opts.bitrate, 10);

        if (opts.depth) scenario.bitDepth = parseInt(opts.depth, 10);
        if (flags.has('spatial')) scenario.spatial = true;
    }

    return { scenario };
}


// ==================== COMMANDS: READ-ONLY ====================

function hasStreaming(edu) {
    return edu?.streaming && (edu.streaming.hls?.length > 0 || edu.streaming.dash?.length > 0);
}

function hasContainerNotes(edu) {
    return edu?.containerNotes && Object.keys(edu.containerNotes).length > 0;
}

function hasRefs(edu) {
    return edu?.references?.length > 0;
}

function hasOverview(edu) {
    return edu?.overview && edu.overview !== '';
}

function pctBar(count, total) {
    if (total === 0) return `${C.dim} -%${C.reset}`;
    const pct = Math.round(count / total * 100);
    const color = pct === 100 ? C.green : pct > 0 ? C.yellow : C.red;
    return `${color}${pct.toString().padStart(3)}%${C.reset}`;
}

// ==================== HANDLERS ====================

async function handleSelect(args) {
    if (args.flags.has('stats')) {
        const db = await loadDatabase();
        console.log(`\n${C.bold}CodecProbe v2 Database Stats${C.reset}\n`);

        const header = `${'Group'.padEnd(24)} ${'Type'.padEnd(7)} ${'Recs'.padStart(5)} ${'Edu'.padStart(5)} ${'Strm'.padStart(5)} ${'Cntr'.padStart(5)} ${'Refs'.padStart(5)}`;
        console.log(`${C.dim}${header}${C.reset}`);
        console.log(`${C.dim}${'─'.repeat(header.length)}${C.reset}`);

        let tRecs = 0, tEdu = 0, tStrm = 0, tCntr = 0, tRefs = 0;

        for (const [key, group] of Object.entries(db)) {
            const recs = group.codecs.length;
            let edu = 0, strm = 0, cntr = 0, refs = 0;
            for (const rec of group.codecs) {
                if (hasOverview(rec.education)) edu++;
                if (hasStreaming(rec.education)) strm++;
                if (hasContainerNotes(rec.education)) cntr++;
                if (hasRefs(rec.education)) refs++;
            }

            console.log(
                `${key.padEnd(24)} ${group.type.padEnd(7)} ${String(recs).padStart(5)} ` +
                `${String(edu).padStart(5)} ${String(strm).padStart(5)} ${String(cntr).padStart(5)} ${String(refs).padStart(5)}  ` +
                `${pctBar(edu, recs)}`
            );
            tRecs += recs; tEdu += edu; tStrm += strm; tCntr += cntr; tRefs += refs;
        }

        console.log(`${C.dim}${'─'.repeat(header.length)}${C.reset}`);
        console.log(
            `${'TOTAL'.padEnd(24)} ${''.padEnd(7)} ${String(tRecs).padStart(5)} ` +
            `${String(tEdu).padStart(5)} ${String(tStrm).padStart(5)} ${String(tCntr).padStart(5)} ${String(tRefs).padStart(5)}  ` +
            `${pctBar(tEdu, tRecs)}`
        );
        console.log();
        return { ok: true, display: true };
    }

    if (args.options.group) {
        const db = await loadDatabase();
        const groupFilter = args.options.group;
        const filter = args.flags.has('missing') ? 'missing' : args.flags.has('edu') ? 'edu' : 'all';

        for (const [key, group] of Object.entries(db)) {
            if (groupFilter && key !== groupFilter) continue;
            if (group.codecs.length === 0 && !groupFilter) continue;

            console.log(`\n${C.bold}${group.category}${C.reset} ${C.dim}(${key}, ${group.type})${C.reset}`);

            if (group.codecs.length === 0) {
                console.log(`  ${C.dim}(empty)${C.reset}`);
                continue;
            }

            for (const rec of group.codecs) {
                const edu = rec.education;
                const hasEdu = hasOverview(edu);
                if (filter === 'missing' && hasEdu) continue;
                if (filter === 'edu' && !hasEdu) continue;

                const flagO = hasOverview(edu) ? `${C.green}O${C.reset}` : `${C.dim}O${C.reset}`;
                const flagS = hasStreaming(edu) ? `${C.green}S${C.reset}` : `${C.dim}S${C.reset}`;
                const flagC = hasContainerNotes(edu) ? `${C.green}C${C.reset}` : `${C.dim}C${C.reset}`;
                const flagR = hasRefs(edu) ? `${C.green}R${C.reset}` : `${C.dim}R${C.reset}`;
                const flags = `${flagO}${flagS}${flagC}${flagR}`;

                const scenarios = rec.scenarios.length > 1 ? `${C.dim}(${rec.scenarios.length} scenarios)${C.reset}` : '';
                console.log(`  ${flags} ${C.cyan}${rec.codec}${C.reset}  ${rec.name} ${scenarios}`);
            }
        }
        console.log();
        return { ok: true, display: true };
    }

    // select <codec> — show single record
    const codecString = args.positional[0];
    if (!codecString) return { ok: false, error: 'select requires a codec string, --stats, or --group' };

    const db = await loadDatabase();
    const source = readSource();
    const resolved = resolveRecord(source, db, codecString);
    if (resolved.error) return { ok: false, error: resolved.error };

    showRecord(resolved.record, resolved.groupKey, resolved.mediaType);
    return { ok: true, display: true };
}

async function handleCreate(codecString, args) {
    const db = await loadDatabase();
    const source = readSource();

    for (const [key, group] of Object.entries(db)) {
        if (group.codecs.find(r => r.codec === codecString)) {
            return { ok: false, error: `Record already exists: ${codecString} (in ${key}). Use "insert" to add scenarios.` };
        }
    }

    return insertRecord(source, db, codecString, args, args.flags.has('dry-run'));
}

async function handleInsert(codecString, subcommand, args) {
    const db = await loadDatabase();
    const source = readSource();
    const resolved = resolveRecord(source, db, codecString);
    if (resolved.error) return { ok: false, error: resolved.error };

    switch (subcommand) {
        case 'scenario':
            return addScenario(source, resolved, args);
        case 'ref':
            return addReference(source, resolved, args);
        case 'hls':
            return addStreamingEntry(source, resolved, 'hls', args);
        case 'dash':
            return addStreamingEntry(source, resolved, 'dash', args);
    }
}

async function handleUpdate(codecString, args) {
    const db = await loadDatabase();
    const source = readSource();
    const resolved = resolveRecord(source, db, codecString);
    if (resolved.error) return { ok: false, error: resolved.error };

    if (args.options['edu-from']) {
        return importEducation(source, resolved, args);
    }

    return updateField(source, resolved, args);
}

async function handleDelete(codecString, subcommand, targetName, args) {
    const db = await loadDatabase();
    const source = readSource();
    const resolved = resolveRecord(source, db, codecString);
    if (resolved.error) return { ok: false, error: resolved.error };

    const dryRun = args.flags.has('dry-run');
    switch (subcommand) {
        case 'scenario':
            return removeScenario(source, resolved, targetName, dryRun);
        case 'ref':
            return removeReference(source, resolved, targetName, dryRun);
    }
}

async function handleDrop(codecString, args) {
    if (!args.flags.has('confirm'))
        return { ok: false, error: 'drop requires --confirm' };

    const db = await loadDatabase();
    const source = readSource();
    const resolved = resolveRecord(source, db, codecString);
    if (resolved.error) return { ok: false, error: resolved.error };

    return dropRecord(source, resolved, args.flags.has('dry-run'));
}

async function handleRename(oldCodec, newCodec, args) {
    const db = await loadDatabase();
    const source = readSource();
    const resolved = resolveRecord(source, db, oldCodec);
    if (resolved.error) return { ok: false, error: resolved.error };

    const { sourceRecord } = resolved;
    const dryRun = args.flags.has('dry-run');

    const rangeStart = sourceRecord.commentStart;
    const rangeEnd = sourceRecord.end;
    const slice = source.substring(rangeStart, rangeEnd + 1);
    let updated = slice.replaceAll(oldCodec, newCodec);

    // Update breakdown tokens if codec parts changed
    const oldTokens = oldCodec.split('.');
    const newTokens = newCodec.split('.');
    for (let i = 0; i < oldTokens.length && i < newTokens.length; i++) {
        if (oldTokens[i] !== newTokens[i]) {
            updated = updated.replaceAll(
                `token: ${q(oldTokens[i])}`,
                `token: ${q(newTokens[i])}`
            );
        }
    }

    const newSource = source.substring(0, rangeStart) + updated + source.substring(rangeEnd + 1);
    return commitWrite(newSource, dryRun, `RENAME ${oldCodec} → ${newCodec}`);
}

async function handleVerify() {
    console.log(`\n${C.bold}Verifying codec-database-v2.js${C.reset}\n`);

    const source = readSource();
    const syntaxResult = verifySyntax(source);
    if (syntaxResult !== true) {
        console.log(`  ${C.red}✗ Syntax error${C.reset}`);
        console.log(`  ${syntaxResult}`);
        return { ok: false, error: 'Syntax error' };
    }
    console.log(`  ${C.green}✓${C.reset} Syntax OK`);

    const db = await loadDatabase();
    const groupKeys = Object.keys(db);
    console.log(`  ${C.green}✓${C.reset} Module imports OK (${groupKeys.length} groups)`);

    let issues = 0, warnings = 0, gaps = 0;
    let totalCodecs = 0;
    const seenCodecs = new Map();

    for (const [key, group] of Object.entries(db)) {
        if (!group.category) { console.log(`  ${C.red}✗${C.reset} ${key}: missing category`); issues++; }
        if (!group.type) { console.log(`  ${C.red}✗${C.reset} ${key}: missing type`); issues++; }
        if (!group.codecs || !Array.isArray(group.codecs)) {
            console.log(`  ${C.red}✗${C.reset} ${key}: missing or invalid codecs array`);
            issues++;
            continue;
        }

        for (const rec of group.codecs) {
            totalCodecs++;

            if (!rec.codec) { console.log(`  ${C.red}✗${C.reset} ${key}/??: missing codec`); issues++; continue; }
            if (!rec.name) { console.log(`  ${C.red}✗${C.reset} ${key}/${rec.codec}: missing name`); issues++; }

            if (seenCodecs.has(rec.codec)) {
                console.log(`  ${C.red}✗${C.reset} ${key}/${rec.codec}: duplicate (also in ${seenCodecs.get(rec.codec)})`);
                issues++;
            }
            seenCodecs.set(rec.codec, key);

            if (!rec.containers || !rec.containers.file) {
                console.log(`  ${C.red}✗${C.reset} ${key}/${rec.codec}: missing containers.file`);
                issues++;
            }

            if (!rec.scenarios || rec.scenarios.length === 0) {
                console.log(`  ${C.red}✗${C.reset} ${key}/${rec.codec}: no scenarios`);
                issues++;
            } else {
                for (const s of rec.scenarios) {
                    if (!s.name) {
                        console.log(`  ${C.red}✗${C.reset} ${key}/${rec.codec}: scenario missing name`);
                        issues++;
                    }
                    if (group.type === 'video') {
                        if (!s.width || !s.height) {
                            console.log(`  ${C.yellow}⚠${C.reset} ${key}/${rec.codec}/${s.name}: missing width/height`);
                        }
                    } else {
                        if (!s.channels) {
                            console.log(`  ${C.yellow}⚠${C.reset} ${key}/${rec.codec}/${s.name}: missing channels`);
                        }
                    }
                }
            }

            if (rec.education) {
                const edu = rec.education;
                const prefix = `${key}/${rec.codec}`;

                if (!Array.isArray(edu.breakdown)) {
                    console.log(`  ${C.red}✗${C.reset} ${prefix}: education.breakdown not an array`);
                    issues++;
                } else {
                    for (const t of edu.breakdown) {
                        if (!t.token) { console.log(`  ${C.red}✗${C.reset} ${prefix}: breakdown token missing`); issues++; }
                        if (!t.meaning) { console.log(`  ${C.yellow}⚠${C.reset} ${prefix}: empty meaning for token "${t.token}"`); warnings++; }
                    }
                }

                if (!hasOverview(edu)) { console.log(`  ${C.yellow}⚠${C.reset} ${prefix}: empty overview`); warnings++; }

                if (edu.references?.length) {
                    for (const ref of edu.references) {
                        if (!ref.title) { console.log(`  ${C.red}✗${C.reset} ${prefix}: reference missing title`); issues++; }
                    }
                }

                if (!hasStreaming(edu)) { console.log(`  ${C.dim}·${C.reset} ${prefix}: no streaming entries`); gaps++; }
                if (!hasContainerNotes(edu)) { console.log(`  ${C.dim}·${C.reset} ${prefix}: no containerNotes`); gaps++; }
                if (!hasRefs(edu)) { console.log(`  ${C.dim}·${C.reset} ${prefix}: no references`); gaps++; }
            }
        }
    }

    console.log(`  ${C.green}✓${C.reset} Structure: ${totalCodecs} codecs, ${issues} issues`);
    if (warnings > 0) console.log(`  ${C.yellow}⚠${C.reset} ${warnings} warning(s)`);
    if (gaps > 0) console.log(`  ${C.dim}·${C.reset} ${gaps} education gap(s)`);

    if (issues > 0) {
        console.log(`\n  ${C.red}${issues} issue(s) found${C.reset}\n`);
        return { ok: false, error: `${issues} issue(s) found` };
    }
    console.log();
    return { ok: true, display: true };
}


// ==================== DISPLAY ====================

function showRecord(record, groupKey, mediaType) {
    console.log(`\n${C.bold}${record.codec}${C.reset} ${C.dim}(${groupKey})${C.reset}\n`);
    console.log(`  ${C.cyan}Name:${C.reset}       ${record.name}`);
    console.log(`  ${C.cyan}File:${C.reset}       ${record.containers.file.join(', ')}`);
    if (record.containers.stream?.length) {
        console.log(`  ${C.cyan}Stream:${C.reset}     ${record.containers.stream.join(', ')}`);
    }
    if (record.drm?.length) {
        console.log(`  ${C.cyan}DRM:${C.reset}        ${record.drm.join(', ')}`);
    }
    if (record.flags?.length) {
        console.log(`  ${C.cyan}Flags:${C.reset}      ${record.flags.join(', ')}`);
    }

    console.log(`\n  ${C.bold}Scenarios (${record.scenarios.length}):${C.reset}`);
    for (const s of record.scenarios) {
        if (mediaType === 'video') {
            const parts = [`${s.width}x${s.height}`, `${s.framerate}fps`, `${(s.bitrate / 1_000_000).toFixed(1)}Mbps`];
            if (s.bitDepth) parts.push(`${s.bitDepth}-bit`);
            if (s.hdrFormat) parts.push(s.hdrFormat.toUpperCase());
            console.log(`    ${C.green}•${C.reset} ${s.name} — ${parts.join(', ')}`);
        } else {
            const chMap = { 1: 'Mono', 2: 'Stereo', 6: '5.1', 8: '7.1' };
            const parts = [chMap[s.channels] || `${s.channels}ch`, `${s.samplerate / 1000}kHz`, `${(s.bitrate / 1000)}kbps`];
            if (s.bitDepth) parts.push(`${s.bitDepth}-bit`);
            if (s.spatial) parts.push('Spatial');
            console.log(`    ${C.green}•${C.reset} ${s.name} — ${parts.join(', ')}`);
        }
    }

    if (!record.education) {
        console.log(`\n  ${C.dim}No education data${C.reset}`);
        console.log();
        return;
    }

    const edu = record.education;
    console.log(`\n  ${C.bold}Education:${C.reset}`);

    // Breakdown tokens
    if (edu.breakdown?.length) {
        console.log(`\n  ${C.cyan}Breakdown:${C.reset}`);
        for (const t of edu.breakdown) {
            const meaning = t.meaning || `${C.dim}(empty)${C.reset}`;
            console.log(`    ${C.yellow}${t.token}${C.reset}  ${meaning}`);
        }
    }

    // Overview
    if (edu.overview) {
        console.log(`\n  ${C.cyan}Overview:${C.reset}   ${edu.overview}`);
    } else {
        console.log(`\n  ${C.cyan}Overview:${C.reset}   ${C.dim}(empty)${C.reset}`);
    }

    // Platforms
    if (edu.platforms && Object.keys(edu.platforms).length > 0) {
        console.log(`\n  ${C.cyan}Platforms:${C.reset}`);
        for (const [platform, note] of Object.entries(edu.platforms)) {
            console.log(`    ${C.magenta}${platform}:${C.reset} ${note}`);
        }
    }

    // Streaming
    if (edu.streaming && (edu.streaming.hls?.length || edu.streaming.dash?.length)) {
        console.log(`\n  ${C.cyan}Streaming:${C.reset}`);
        for (const entry of edu.streaming.hls || []) {
            console.log(`    ${C.green}HLS${C.reset}  ${entry.signal}`);
            if (entry.notes) console.log(`         ${C.dim}${entry.notes}${C.reset}`);
        }
        for (const entry of edu.streaming.dash || []) {
            console.log(`    ${C.green}DASH${C.reset} ${entry.signal}`);
            if (entry.notes) console.log(`         ${C.dim}${entry.notes}${C.reset}`);
        }
    }

    // Container notes
    if (edu.containerNotes && Object.keys(edu.containerNotes).length > 0) {
        console.log(`\n  ${C.cyan}Container Notes:${C.reset}`);
        for (const [container, note] of Object.entries(edu.containerNotes)) {
            console.log(`    ${C.magenta}${container}:${C.reset} ${note}`);
        }
    }

    // References
    if (edu.references?.length) {
        console.log(`\n  ${C.cyan}References:${C.reset}`);
        for (const ref of edu.references) {
            const url = ref.url ? ` ${C.dim}${ref.url}${C.reset}` : '';
            console.log(`    ${C.green}•${C.reset} ${ref.title}${url}`);
        }
    }

    console.log();
}

function insertRecord(source, db, codecString, args, dryRun) {
    if (!args.options.name) {
        return { ok: false, error: '--name is required for CREATE' };
    }

    const groupKey = args.options.group || detectGroupFromCodec(codecString);
    if (!groupKey) {
        return { ok: false, error: `Cannot detect group for "${codecString}". Use --group <key>` };
    }
    if (!db[groupKey]) {
        return { ok: false, error: `Group "${groupKey}" not found` };
    }

    const mediaType = db[groupKey].type;
    const scenarioResult = buildScenarioFromArgs(args.options, args.flags, mediaType);
    if (scenarioResult.error) {
        return { ok: false, error: scenarioResult.error };
    }

    const containers = getContainersForCodec(codecString);
    const record = {
        codec: codecString,
        name: args.options.name,
        containers,
        drm: DEFAULT_DRM,
        scenarios: [scenarioResult.scenario],
        education: {
            breakdown: tokenizeCodecString(codecString),
            overview: '',
            platforms: {},
            streaming: {},
            containerNotes: {},
            references: [],
        }
    };

    if (args.options.flags) {
        record.flags = args.options.flags.split(',');
    }

    const groupRange = findGroupRange(source, groupKey);
    if (!groupRange) {
        return { ok: false, error: `Group "${groupKey}" not found in source text` };
    }

    const codecsArr = findCodecsArray(source, groupRange.start, groupRange.end);
    if (!codecsArr) {
        return { ok: false, error: `No codecs array in "${groupKey}"` };
    }

    const formatted = formatRecord(record, mediaType);
    const newSource = spliceInsertIntoArray(source, codecsArr.start, codecsArr.end, formatted, I8);

    return commitWrite(newSource, dryRun, `INSERT ${codecString} → ${groupKey}`);
}

function addScenario(source, resolved, args) {
    const { mediaType, sourceRecord } = resolved;
    const dryRun = args.flags.has('dry-run');
    const scenarioResult = buildScenarioFromArgs(args.options, args.flags, mediaType);
    if (scenarioResult.error) {
        return { ok: false, error: scenarioResult.error };
    }

    const scenariosArr = findScenariosArray(source, sourceRecord.start, sourceRecord.end);
    if (!scenariosArr) {
        return { ok: false, error: `No scenarios array found for ${resolved.record.codec}` };
    }

    const formatted = formatScenario(scenarioResult.scenario, mediaType, I20);
    const newSource = spliceInsertIntoArray(source, scenariosArr.start, scenariosArr.end, formatted, I16);

    return commitWrite(newSource, dryRun, `INSERT scenario "${scenarioResult.scenario.name}" → ${resolved.record.codec}`);
}

function removeScenario(source, resolved, scenarioName, dryRun) {
    const { sourceRecord } = resolved;

    const scenariosArr = findScenariosArray(source, sourceRecord.start, sourceRecord.end);
    if (!scenariosArr) {
        return { ok: false, error: `No scenarios array for ${resolved.record.codec}` };
    }

    const scenarioRange = findScenarioByName(source, scenariosArr.start, scenariosArr.end, scenarioName);
    if (!scenarioRange) {
        return { ok: false, error: `Scenario "${scenarioName}" not found in ${resolved.record.codec}` };
    }

    const newSource = spliceRemoveFromArray(source, scenariosArr.start, scenariosArr.end,
        scenarioRange.start, scenarioRange.end);
    return commitWrite(newSource, dryRun, `DELETE scenario "${scenarioName}" from ${resolved.record.codec}`);
}

function coerceJsLiteral(rawValue) {
    if (rawValue.startsWith('[')) {
        const items = rawValue.slice(1, -1).split(',').map(s => q(s.trim()));
        return `[${items.join(', ')}]`;
    }
    if (rawValue === 'true' || rawValue === 'false') return rawValue;
    if (!isNaN(rawValue) && rawValue !== '') return fmtNum(parseInt(rawValue, 10));
    return q(rawValue);
}

function updateField(source, resolved, args) {
    const setArg = args.options.set || args.positional[0];
    if (!setArg) return { ok: false, error: 'update requires key=value' };

    const eqIdx = setArg.indexOf('=');
    if (eqIdx === -1) {
        return { ok: false, error: 'update requires key=value format' };
    }

    const fieldPath = setArg.substring(0, eqIdx);
    const rawValue = setArg.substring(eqIdx + 1);
    const dryRun = args.flags.has('dry-run');
    const { sourceRecord } = resolved;
    const codecString = resolved.record.codec;

    if (fieldPath === 'codec') {
        return { ok: false, error: 'Use "rename <old> <new>" to change codec string' };
    }

    const formattedValue = coerceJsLiteral(rawValue);
    let newSource;

    if (fieldPath.includes('.')) {
        const nested = findNestedField(source, sourceRecord.start, sourceRecord.end, fieldPath);
        if (!nested) {
            return { ok: false, error: `Path "${fieldPath}" not found — non-object in path` };
        }

        if (nested.missingSegments) {
            const segments = nested.missingSegments;
            const baseIndent = indentAt(source, nested.parentEnd) + 4;
            let innerValue = formattedValue;

            for (let i = segments.length - 1; i >= 1; i--) {
                const pad = ' '.repeat(baseIndent + (i * 4));
                innerValue = `{\n${pad}${segments[i]}: ${innerValue}\n${' '.repeat(baseIndent + ((i - 1) * 4))}}`;
            }
            newSource = insertIntoObject(source, nested.parentStart, nested.parentEnd,
                segments[0], innerValue);
        } else if (nested.leaf) {
            newSource = source.substring(0, nested.leaf.valueStart) + formattedValue +
                source.substring(nested.leaf.valueEnd + 1);
        } else {
            newSource = insertIntoObject(source, nested.parentStart, nested.parentEnd,
                nested.leafName, formattedValue);
        }
    } else {
        const field = findFieldInEntry(source, sourceRecord.start, sourceRecord.end, fieldPath);
        if (!field) {
            return { ok: false, error: `Field "${fieldPath}" not found in record` };
        }
        newSource = source.substring(0, field.valueStart) + formattedValue +
            source.substring(field.valueEnd + 1);
    }

    return commitWrite(newSource, dryRun, `UPDATE ${codecString}.${fieldPath} = ${rawValue}`);
}

function addReference(source, resolved, args) {
    const title = args.options.title;
    if (!title) {
        return { ok: false, error: '--title is required for INSERT ref' };
    }

    const { sourceRecord } = resolved;
    const dryRun = args.flags.has('dry-run');
    const nested = findNestedField(source, sourceRecord.start, sourceRecord.end, 'education.references');
    if (!nested) {
        return { ok: false, error: `Cannot locate education.references for ${resolved.record.codec}` };
    }

    const url = args.options.url;
    const refObj = url
        ? `{ title: ${q(title)}, url: ${q(url)} }`
        : `{ title: ${q(title)} }`;

    let newSource;
    if (nested.missingSegments) {
        newSource = insertIntoObject(source, nested.parentStart, nested.parentEnd,
            'references', `[\n${I24}${refObj}\n${I20}]`);
    } else if (nested.leaf && source[nested.leaf.valueStart] === '[') {
        newSource = spliceInsertIntoArray(source, nested.leaf.valueStart, nested.leaf.valueEnd,
            I24 + refObj, I20);
    } else {
        return { ok: false, error: `Cannot locate education.references for ${resolved.record.codec}` };
    }

    return commitWrite(newSource, dryRun, `INSERT ref "${title}" → ${resolved.record.codec}`);
}

/**
 * Remove an item from an array in source text, cleaning commas and whitespace.
 * Handles first, middle, and last items correctly.
 * @param {number} itemEnd - index of item closing } (inclusive — points AT the })
 */
function spliceRemoveFromArray(source, arrStart, arrEnd, itemStart, itemEnd) {
    let removeStart = itemStart;
    let removeEnd = itemEnd + 1; // past the closing }

    // Check for trailing comma
    let consumedTrailingComma = false;
    if (removeEnd < arrEnd && source[removeEnd] === ',') {
        removeEnd++;
        consumedTrailingComma = true;
    }

    // Consume whitespace/newlines after removal point (stop at next { or ])
    while (removeEnd < arrEnd && /\s/.test(source[removeEnd])) {
        if (source[removeEnd] === '{' || source[removeEnd] === ']') break;
        removeEnd++;
    }

    // If no trailing comma consumed, this is the last item — consume leading comma
    if (!consumedTrailingComma) {
        let prevNonWs = removeStart - 1;
        while (prevNonWs >= arrStart && /\s/.test(source[prevNonWs])) prevNonWs--;
        if (source[prevNonWs] === ',') {
            removeStart = prevNonWs;
            let prevContent = removeStart - 1;
            while (prevContent >= arrStart && /\s/.test(source[prevContent])) prevContent--;
            if (source[prevContent] === '}') {
                removeStart = prevContent + 1;
            }
        }
    }

    // Consume leading blank lines
    while (removeStart > arrStart + 1 && source[removeStart - 1] === '\n') {
        removeStart--;
    }

    return source.substring(0, removeStart) + source.substring(removeEnd);
}

function removeReference(source, resolved, title, dryRun) {
    if (!title) {
        return { ok: false, error: '--title is required for DELETE ref' };
    }

    const { sourceRecord } = resolved;
    const nested = findNestedField(source, sourceRecord.start, sourceRecord.end, 'education.references');
    if (!nested || !nested.leaf || source[nested.leaf.valueStart] !== '[') {
        return { ok: false, error: `No references array found for ${resolved.record.codec}` };
    }

    const arrStart = nested.leaf.valueStart;
    const arrEnd = nested.leaf.valueEnd;
    const area = source.substring(arrStart, arrEnd + 1);
    const titleEscaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const refPattern = new RegExp(`\\{[^}]*title:\\s*'${titleEscaped}'[^}]*\\}`);
    const refMatch = refPattern.exec(area);
    if (!refMatch) {
        return { ok: false, error: `Reference "${title}" not found in ${resolved.record.codec}` };
    }

    const matchStart = arrStart + refMatch.index;
    const matchEnd = matchStart + refMatch[0].length - 1;
    const newSource = spliceRemoveFromArray(source, arrStart, arrEnd, matchStart, matchEnd);
    return commitWrite(newSource, dryRun, `DELETE ref "${title}" from ${resolved.record.codec}`);
}

function addStreamingEntry(source, resolved, protocol, args) {
    const signal = args.options.signal;
    const manifestKey = protocol === 'hls' ? 'm3u8' : 'mpd';
    const manifest = args.options[manifestKey];
    const notes = args.options.notes || '';
    const dryRun = args.flags.has('dry-run');
    const { sourceRecord } = resolved;
    const codecString = resolved.record.codec;

    if (!signal) {
        return { ok: false, error: `--signal is required for INSERT ${protocol}` };
    }
    if (!manifest) {
        return { ok: false, error: `--${manifestKey} is required for INSERT ${protocol}` };
    }

    const entryLines = [
        `{`,
        `${I28}signal: ${q(signal)},`,
        `${I28}${manifestKey}: ${qBacktick(manifest)},`,
        `${I28}notes: ${q(notes)}`,
        `${I24}}`
    ];
    const entryText = entryLines.join('\n');

    const nested = findNestedField(source, sourceRecord.start, sourceRecord.end, `education.streaming`);
    if (!nested) {
        return { ok: false, error: `Cannot locate education.streaming for ${codecString}` };
    }

    let newSource;
    const streamingMissing = nested.missingSegments || (!nested.leaf);
    if (streamingMissing) {
        const parent = { start: nested.parentStart, end: nested.parentEnd };
        const inner = `{\n${I24}${protocol}: [\n${I24}${entryText}\n${I20}]\n${I20}}`;
        newSource = insertIntoObject(source, parent.start, parent.end, 'streaming', inner);
    } else if (nested.leaf && source[nested.leaf.valueStart] === '{') {
        const protoField = findFieldInEntry(source, nested.leaf.valueStart, nested.leaf.valueEnd, protocol);

        if (protoField && source[protoField.valueStart] === '[') {
            newSource = spliceInsertIntoArray(source, protoField.valueStart, protoField.valueEnd,
                I24 + entryText, I20);
        } else {
            newSource = insertIntoObject(source, nested.leaf.valueStart, nested.leaf.valueEnd,
                protocol, `[\n${I24}${entryText}\n${I20}]`);
        }
    } else {
        return { ok: false, error: `education.streaming is not an object for ${codecString}` };
    }

    const label = protocol.toUpperCase();
    return commitWrite(newSource, dryRun, `INSERT ${label} "${signal}" → ${codecString}`);
}

function formatEducationFromJson(edu, baseIndent) {
    const I = ' '.repeat(baseIndent);
    const I4 = ' '.repeat(baseIndent + 4);
    const I8 = ' '.repeat(baseIndent + 8);
    const I12 = ' '.repeat(baseIndent + 12);
    const lines = ['{'];

    // breakdown
    if (edu.breakdown?.length) {
        lines.push(`${I4}breakdown: [`);
        edu.breakdown.forEach((t, i) => {
            const comma = i < edu.breakdown.length - 1 ? ',' : '';
            lines.push(`${I8}{ token: ${q(t.token)}, meaning: ${q(t.meaning)} }${comma}`);
        });
        lines.push(`${I4}],`);
    }

    // overview
    lines.push(`${I4}overview: ${q(edu.overview || '')},`);

    // platforms
    if (edu.platforms && Object.keys(edu.platforms).length > 0) {
        lines.push(`${I4}platforms: {`);
        const entries = Object.entries(edu.platforms);
        entries.forEach(([k, v], i) => {
            const comma = i < entries.length - 1 ? ',' : '';
            lines.push(`${I8}${k}: ${q(v)}${comma}`);
        });
        lines.push(`${I4}},`);
    }

    // streaming
    if (edu.streaming && (edu.streaming.hls?.length || edu.streaming.dash?.length)) {
        lines.push(`${I4}streaming: {`);
        for (const proto of ['hls', 'dash']) {
            const arr = edu.streaming[proto];
            if (!arr?.length) continue;
            const manifestKey = proto === 'hls' ? 'm3u8' : 'mpd';
            lines.push(`${I8}${proto}: [`);
            arr.forEach((entry, i) => {
                lines.push(`${I8}{`);
                lines.push(`${I12}signal: ${q(entry.signal)},`);
                lines.push(`${I12}${manifestKey}: ${qBacktick(entry[manifestKey] || '')},`);
                lines.push(`${I12}notes: ${q(entry.notes || '')}`);
                const comma = i < arr.length - 1 ? ',' : '';
                lines.push(`${I8}}${comma}`);
            });
            lines.push(`${I8}],`);
        }
        // Remove trailing comma from last ]
        const lastLine = lines[lines.length - 1];
        if (lastLine.endsWith('],')) lines[lines.length - 1] = lastLine.slice(0, -1);
        lines.push(`${I4}},`);
    }

    // containerNotes
    if (edu.containerNotes && Object.keys(edu.containerNotes).length > 0) {
        lines.push(`${I4}containerNotes: {`);
        const entries = Object.entries(edu.containerNotes);
        entries.forEach(([k, v], i) => {
            const comma = i < entries.length - 1 ? ',' : '';
            lines.push(`${I8}${k}: ${q(v)}${comma}`);
        });
        lines.push(`${I4}},`);
    }

    // references
    if (edu.references?.length) {
        lines.push(`${I4}references: [`);
        edu.references.forEach((ref, i) => {
            const comma = i < edu.references.length - 1 ? ',' : '';
            const url = ref.url ? `, url: ${q(ref.url)}` : '';
            lines.push(`${I8}{ title: ${q(ref.title)}${url} }${comma}`);
        });
        lines.push(`${I4}]`);
    } else {
        lines.push(`${I4}references: []`);
    }

    lines.push(`${I}}`);
    // Remove trailing comma from last field before references/closing
    return lines.join('\n');
}

function importEducation(source, resolved, args) {
    const filePath = args.options['edu-from'];
    if (!filePath) {
        return { ok: false, error: '--edu-from <path> is required' };
    }

    let eduJson;
    try {
        const raw = readFileSync(resolve(filePath), 'utf-8');
        eduJson = JSON.parse(raw);
    } catch (err) {
        return { ok: false, error: `Cannot read/parse ${filePath}: ${err.message}` };
    }

    const { sourceRecord } = resolved;
    const dryRun = args.flags.has('dry-run');
    const eduField = findFieldInEntry(source, sourceRecord.start, sourceRecord.end, 'education');
    if (!eduField) {
        return { ok: false, error: `No education field found for ${resolved.record.codec}` };
    }

    const formatted = formatEducationFromJson(eduJson, 20);
    const newSource = source.substring(0, eduField.valueStart) + formatted + source.substring(eduField.valueEnd + 1);
    return commitWrite(newSource, dryRun, `IMPORT education from ${filePath} → ${resolved.record.codec}`);
}

function dropRecord(source, resolved, dryRun) {
    const { sourceRecord } = resolved;

    let removeStart = sourceRecord.commentStart;
    let removeEnd = sourceRecord.end + 1;

    // Trailing comma
    if (removeEnd < source.length && source[removeEnd] === ',') removeEnd++;

    // Trailing whitespace/newline
    while (removeEnd < source.length && (source[removeEnd] === ' ' || source[removeEnd] === '\n')) {
        if (source[removeEnd] === '\n') { removeEnd++; break; }
        removeEnd++;
    }

    const newSource = source.substring(0, removeStart) + source.substring(removeEnd);
    return commitWrite(newSource, dryRun, `DROP ${resolved.record.codec}`);
}


// ==================== WRITE RESULT ====================

/**
 * Verify syntax and write source to disk (or dry-run).
 * Returns { ok, message } — NEVER calls process.exit().
 */
function commitWrite(newSource, dryRun, label) {
    const syntaxResult = verifySyntax(newSource);
    if (syntaxResult !== true) {
        return { ok: false, error: `Syntax error after ${label}: ${syntaxResult}` };
    }

    if (dryRun) {
        return { ok: true, message: label, dryRun: true };
    }

    writeSourceFile(newSource);
    return { ok: true, message: label };
}



// ==================== CLI DISPATCH ====================

function usage() {
    console.log(`
${C.bold}CodecProbe v2 Database Tool${C.reset}

${C.cyan}Usage:${C.reset}  node scripts/db-tool-v2.mjs <command> [args]

${C.cyan}Read:${C.reset}
  select <codec>                              Show record details
  select --stats                              Coverage table
  select --group <key> [--missing|--edu]      List records in group

${C.cyan}Write:${C.reset}
  create <codec> --name <n> [scenario opts]   Insert new record
  insert <codec> scenario [scenario opts]     Add scenario to existing record
  insert <codec> ref --title <t> [--url <u>]  Add reference
  insert <codec> hls --signal <s> --m3u8 <m> [--notes <n>]   Add HLS entry
  insert <codec> dash --signal <s> --mpd <m> [--notes <n>]    Add DASH entry
  update <codec> key=value                    Update field (supports dot-paths)
  update <codec> --edu-from <path.json>       Replace education from JSON file
  rename <codec> <new-codec>                  Rename codec (PK + comments + tokens)
  delete <codec> scenario <name>              Remove scenario
  delete <codec> ref <title>                  Remove reference
  drop <codec> --confirm                      Delete entire record

${C.cyan}Validate:${C.reset}
  verify                                      Structure + education check

${C.cyan}Video scenario opts:${C.reset}
  --sname <name>     Scenario name (required)
  --width <n>        Width in pixels (required)
  --height <n>       Height in pixels (required)
  --fps <n>          Framerate (required)
  --bitrate <n>      Bitrate in bps (required)
  --depth <n>        Bit depth (optional)
  --chroma <str>     Chroma subsampling: 420 or 4:2:0 (optional)
  --transfer <str>   Transfer function: pq, hlg (optional)
  --gamut <str>      Color gamut: rec2020, p3 (optional)
  --hdr <str>        HDR format: hdr10, hlg, hdr10plus (optional)
  --tier <str>       Tier: main, high (optional)

${C.cyan}Audio scenario opts:${C.reset}
  --sname <name>     Scenario name (required)
  --channels <n>     Channel count (required)
  --samplerate <n>   Sample rate in Hz (required)
  --bitrate <n>      Bitrate in bps (required)
  --depth <n>        Bit depth (optional)
  --spatial           Spatial audio flag (optional)

${C.cyan}Options:${C.reset}
  --name <name>      Record display name (required for create)
  --group <key>      Override group detection
  --flags <a,b>      Codec flags (comma-separated)
  --dry-run          Preview without writing

${C.cyan}Examples:${C.reset}
  ${C.dim}# Read${C.reset}
  node scripts/db-tool-v2.mjs select --stats
  node scripts/db-tool-v2.mjs select --group video_hevc
  node scripts/db-tool-v2.mjs select hvc1.1.6.L93.B0

  ${C.dim}# Write${C.reset}
  node scripts/db-tool-v2.mjs create hvc1.2.4.L150.B0 --name "Main 10 4K" \\
    --sname "4K HDR10 24fps" --width 3840 --height 2160 --fps 24 \\
    --bitrate 25000000 --depth 10 --transfer pq --gamut rec2020
  node scripts/db-tool-v2.mjs insert hvc1.2.4.L150.B0 scenario \\
    --sname "4K 60fps" --width 3840 --height 2160 --fps 60 --bitrate 40000000
  node scripts/db-tool-v2.mjs update hvc1.2.4.L150.B0 name="Updated Name"
  node scripts/db-tool-v2.mjs rename avc1.4d001f avc1.4D001F
  node scripts/db-tool-v2.mjs delete hvc1.2.4.L150.B0 scenario "4K 60fps"
  node scripts/db-tool-v2.mjs drop hvc1.2.4.L150.B0 --confirm
  node scripts/db-tool-v2.mjs verify
`);
}

async function dispatch(verb, rawArgs) {
    const args = parseArgs(rawArgs);

    switch (verb) {
        case 'select':
            return handleSelect(args);

        case 'create': {
            const codecString = rawArgs[0];
            if (!codecString || codecString.startsWith('--'))
                return { ok: false, error: 'create requires a codec string' };
            args.positional.shift();
            return handleCreate(codecString, args);
        }

        case 'insert': {
            const codecString = rawArgs[0];
            if (!codecString || codecString.startsWith('--'))
                return { ok: false, error: 'insert requires a codec string' };
            const subcommand = rawArgs[1];
            if (!['scenario', 'ref', 'hls', 'dash'].includes(subcommand))
                return { ok: false, error: 'insert requires subcommand: scenario, ref, hls, dash' };
            const subArgs = parseArgs(rawArgs.slice(2));
            return handleInsert(codecString, subcommand, subArgs);
        }

        case 'update': {
            const codecString = rawArgs[0];
            if (!codecString || codecString.startsWith('--'))
                return { ok: false, error: 'update requires a codec string' };
            const subArgs = parseArgs(rawArgs.slice(1));
            return handleUpdate(codecString, subArgs);
        }

        case 'delete': {
            const codecString = rawArgs[0];
            if (!codecString || codecString.startsWith('--'))
                return { ok: false, error: 'delete requires a codec string' };
            const subcommand = rawArgs[1];
            if (!['scenario', 'ref'].includes(subcommand))
                return { ok: false, error: 'delete requires subcommand: scenario, ref' };
            const targetName = rawArgs[2];
            if (!targetName)
                return { ok: false, error: `delete ${subcommand} requires a name` };
            const subArgs = parseArgs(rawArgs.slice(3));
            return handleDelete(codecString, subcommand, targetName, subArgs);
        }

        case 'drop': {
            const codecString = rawArgs[0];
            if (!codecString || codecString.startsWith('--'))
                return { ok: false, error: 'drop requires a codec string' };
            const subArgs = parseArgs(rawArgs.slice(1));
            return handleDrop(codecString, subArgs);
        }

        case 'rename': {
            const oldCodec = rawArgs[0];
            const newCodec = rawArgs[1];
            if (!oldCodec || !newCodec)
                return { ok: false, error: 'rename requires <old-codec> <new-codec>' };
            const subArgs = parseArgs(rawArgs.slice(2));
            return handleRename(oldCodec, newCodec, subArgs);
        }

        case 'verify':
            return handleVerify();

        default:
            return { ok: false, error: `Unknown command: ${verb}` };
    }
}

const rawArgs = process.argv.slice(2);
if (rawArgs.length === 0) {
    usage();
    process.exit(0);
}

const verb = rawArgs[0];

try {
    const result = await dispatch(verb, rawArgs.slice(1));
    if (!result) process.exit(0);
    if (!result.ok) {
        console.error(`  ${C.red}✗ ${result.error}${C.reset}`);
        process.exit(1);
    }
    if (!result.display) {
        console.log(`  ${C.green}✓${C.reset} ${result.message}`);
        if (result.dryRun) {
            console.log(`  ${C.yellow}(dry run — no changes written)${C.reset}`);
        } else {
            console.log(`  ${C.green}✓ Written to disk${C.reset}`);
        }
    }
} catch (err) {
    console.error(`${C.red}Error:${C.reset} ${err.message}`);
    if (process.env.DEBUG) console.error(err.stack);
    process.exit(1);
}
