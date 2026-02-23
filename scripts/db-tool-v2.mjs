#!/usr/bin/env node

/**
 * CodecProbe v2 Database Tool
 *
 * Codec string = primary key. All mutations go through `db`:
 *
 *   db <codec-string>                          Show record
 *   db <codec-string> --scenario [opts]        Insert record (new) or add scenario (existing)
 *   db <codec-string> --set key=value          Update field
 *   db <codec-string> --rm-scenario <name>     Remove scenario
 *   db <codec-string> --drop --confirm         Drop entire record
 *
 * Read-only (no PK needed):
 *   stats                                      Overview table
 *   list [group] [--missing|--edu]             List records
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
            if (['confirm', 'dry-run', 'missing', 'edu', 'scenario', 'drop', 'spatial'].includes(key)) {
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

async function cmdStats() {
    const db = await loadDatabase();
    console.log(`\n${C.bold}CodecProbe v2 Database Stats${C.reset}\n`);

    const header = `${'Group'.padEnd(24)} ${'Type'.padEnd(7)} ${'Codecs'.padStart(6)} ${'Edu'.padStart(5)} ${'Miss'.padStart(5)}`;
    console.log(`${C.dim}${header}${C.reset}`);
    console.log(`${C.dim}${'─'.repeat(header.length)}${C.reset}`);

    let totalCodecs = 0, totalEdu = 0;

    for (const [key, group] of Object.entries(db)) {
        const codecs = group.codecs.length;
        let withEdu = 0;
        for (const rec of group.codecs) {
            if (rec.education && rec.education.breakdown && rec.education.breakdown.length > 0) {
                const hasContent = rec.education.overview !== '' ||
                    rec.education.breakdown.some(t => t.meaning !== '');
                if (hasContent) withEdu++;
            }
        }
        const missing = codecs - withEdu;
        const pct = codecs > 0 ? Math.round(withEdu / codecs * 100) : 0;
        const color = pct === 100 ? C.green : pct > 0 ? C.yellow : C.red;
        const bar = codecs > 0 ? `${color}${pct.toString().padStart(3)}%${C.reset}` : `${C.dim}  -%${C.reset}`;

        console.log(
            `${key.padEnd(24)} ${group.type.padEnd(7)} ${String(codecs).padStart(6)} ` +
            `${String(withEdu).padStart(5)} ${String(missing).padStart(5)}  ${bar}`
        );
        totalCodecs += codecs;
        totalEdu += withEdu;
    }

    console.log(`${C.dim}${'─'.repeat(header.length)}${C.reset}`);
    console.log(
        `${'TOTAL'.padEnd(24)} ${''.padEnd(7)} ${String(totalCodecs).padStart(6)} ` +
        `${String(totalEdu).padStart(5)} ${String(totalCodecs - totalEdu).padStart(5)}`
    );
    console.log();
}

async function cmdList(groupFilter, filter) {
    const db = await loadDatabase();

    for (const [key, group] of Object.entries(db)) {
        if (groupFilter && key !== groupFilter) continue;
        if (group.codecs.length === 0 && !groupFilter) continue;

        console.log(`\n${C.bold}${group.category}${C.reset} ${C.dim}(${key}, ${group.type})${C.reset}`);

        if (group.codecs.length === 0) {
            console.log(`  ${C.dim}(empty)${C.reset}`);
            continue;
        }

        for (const rec of group.codecs) {
            const hasEdu = rec.education && rec.education.overview !== '';
            if (filter === 'missing' && hasEdu) continue;
            if (filter === 'edu' && !hasEdu) continue;

            const icon = hasEdu ? `${C.green}✓${C.reset}` : `${C.dim}·${C.reset}`;
            const scenarios = rec.scenarios.length > 1 ? `${C.dim}(${rec.scenarios.length} scenarios)${C.reset}` : '';
            console.log(`  ${icon} ${C.cyan}${rec.codec}${C.reset}  ${rec.name} ${scenarios}`);
        }
    }
    console.log();
}

async function cmdVerify() {
    console.log(`\n${C.bold}Verifying codec-database-v2.js${C.reset}\n`);

    const source = readSource();
    const syntaxResult = verifySyntax(source);
    if (syntaxResult !== true) {
        console.log(`  ${C.red}✗ Syntax error${C.reset}`);
        console.log(`  ${syntaxResult}`);
        process.exit(1);
    }
    console.log(`  ${C.green}✓${C.reset} Syntax OK`);

    const db = await loadDatabase();
    const groupKeys = Object.keys(db);
    console.log(`  ${C.green}✓${C.reset} Module imports OK (${groupKeys.length} groups)`);

    let issues = 0;
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
                if (!Array.isArray(rec.education.breakdown)) {
                    console.log(`  ${C.yellow}⚠${C.reset} ${key}/${rec.codec}: education.breakdown not an array`);
                }
            }
        }
    }

    console.log(`  ${C.green}✓${C.reset} Structure: ${totalCodecs} codecs, ${issues} issues`);

    if (issues > 0) {
        console.log(`\n  ${C.red}${issues} issue(s) found${C.reset}\n`);
        process.exit(1);
    }
    console.log();
}


// ==================== COMMANDS: db (MUTATIONS) ====================

async function cmdDb(codecString, args) {
    const db = await loadDatabase();
    const source = readSource();

    // Find record in live DB
    let foundGroup = null;
    let foundRecord = null;
    for (const [key, group] of Object.entries(db)) {
        const rec = group.codecs.find(r => r.codec === codecString);
        if (rec) {
            foundGroup = key;
            foundRecord = rec;
            break;
        }
    }

    const hasScenarioFlag = args.flags.has('scenario');
    const hasDropFlag = args.flags.has('drop');
    const hasSetOpt = args.options.set !== undefined;
    const hasRmScenario = args.options['rm-scenario'] !== undefined;
    const dryRun = args.flags.has('dry-run');

    // ── Record exists ──

    if (foundRecord) {
        if (!hasScenarioFlag && !hasDropFlag && !hasSetOpt && !hasRmScenario) {
            return showRecord(foundRecord, foundGroup, db[foundGroup].type);
        }

        if (hasScenarioFlag) {
            return addScenario(source, codecString, foundGroup, db[foundGroup].type, args, dryRun);
        }

        if (hasSetOpt) {
            return updateField(source, codecString, foundGroup, args, dryRun);
        }

        if (hasRmScenario) {
            return removeScenario(source, codecString, foundGroup, args.options['rm-scenario'], dryRun);
        }

        if (hasDropFlag) {
            if (!args.flags.has('confirm')) {
                console.error(`${C.red}Drop requires --confirm${C.reset}`);
                process.exit(1);
            }
            return dropRecord(source, codecString, foundGroup, dryRun);
        }
    }

    // ── Record doesn't exist ──

    if (!foundRecord) {
        if (!hasScenarioFlag) {
            console.error(`${C.red}Record not found:${C.reset} ${codecString}`);
            console.error(`Use --scenario to insert a new record.`);
            process.exit(1);
        }

        return insertRecord(source, db, codecString, args, dryRun);
    }
}

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

    if (record.education) {
        const hasContent = record.education.overview !== '' ||
            (record.education.breakdown && record.education.breakdown.some(t => t.meaning !== ''));
        console.log(`\n  ${C.cyan}Education:${C.reset}  ${hasContent ? `${C.green}populated${C.reset}` : `${C.dim}skeleton${C.reset}`}`);
        if (record.education.breakdown?.length) {
            console.log(`  ${C.cyan}Tokens:${C.reset}     ${record.education.breakdown.map(t => t.token).join(' . ')}`);
        }
    }
    console.log();
}

function insertRecord(source, db, codecString, args, dryRun) {
    if (!args.options.name) {
        console.error(`${C.red}--name is required for INSERT${C.reset}`);
        process.exit(1);
    }

    const groupKey = args.options.group || detectGroupFromCodec(codecString);
    if (!groupKey) {
        console.error(`${C.red}Cannot detect group for "${codecString}". Use --group <key>${C.reset}`);
        process.exit(1);
    }
    if (!db[groupKey]) {
        console.error(`${C.red}Group "${groupKey}" not found${C.reset}`);
        process.exit(1);
    }

    const mediaType = db[groupKey].type;
    const scenarioResult = buildScenarioFromArgs(args.options, args.flags, mediaType);
    if (scenarioResult.error) {
        console.error(`${C.red}${scenarioResult.error}${C.reset}`);
        process.exit(1);
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
        console.error(`${C.red}Group "${groupKey}" not found in source text${C.reset}`);
        process.exit(1);
    }

    const codecsArr = findCodecsArray(source, groupRange.start, groupRange.end);
    if (!codecsArr) {
        console.error(`${C.red}No codecs array in "${groupKey}"${C.reset}`);
        process.exit(1);
    }

    const formatted = formatRecord(record, mediaType);

    // Find last non-whitespace before closing ]
    let lastContent = codecsArr.end - 1;
    while (lastContent > codecsArr.start && /\s/.test(source[lastContent])) lastContent--;

    let newSource;
    if (source[lastContent] === '[') {
        // Empty codecs array
        const before = source.substring(0, lastContent + 1);
        const after = source.substring(codecsArr.end);
        newSource = before + formatted + '\n' + I8 + after;
    } else {
        const needsComma = source[lastContent] !== ',';
        const comma = needsComma ? ',' : '';
        const before = source.substring(0, lastContent + 1);
        const after = source.substring(codecsArr.end);
        newSource = before + comma + formatted + '\n' + I8 + after;
    }

    return writeResult(newSource, dryRun, `INSERT ${codecString} → ${groupKey}`);
}

function addScenario(source, codecString, groupKey, mediaType, args, dryRun) {
    const scenarioResult = buildScenarioFromArgs(args.options, args.flags, mediaType);
    if (scenarioResult.error) {
        console.error(`${C.red}${scenarioResult.error}${C.reset}`);
        process.exit(1);
    }

    const groupRange = findGroupRange(source, groupKey);
    const record = findRecordByCodec(source, codecString, groupRange?.start || 0, groupRange?.end || source.length);
    if (!record) {
        console.error(`${C.red}Record not found in source: ${codecString}${C.reset}`);
        process.exit(1);
    }

    const scenariosArr = findScenariosArray(source, record.start, record.end);
    if (!scenariosArr) {
        console.error(`${C.red}No scenarios array found for ${codecString}${C.reset}`);
        process.exit(1);
    }

    const formatted = formatScenario(scenarioResult.scenario, mediaType, I20);

    // Find last non-whitespace before closing ]
    let lastContent = scenariosArr.end - 1;
    while (lastContent > scenariosArr.start && /\s/.test(source[lastContent])) lastContent--;

    const needsComma = source[lastContent] !== ',' && source[lastContent] !== '[';
    const comma = needsComma ? ',' : '';
    const before = source.substring(0, lastContent + 1);
    const after = source.substring(scenariosArr.end);
    const newSource = before + comma + '\n' + formatted + '\n' + I16 + after;

    return writeResult(newSource, dryRun, `ADD SCENARIO "${scenarioResult.scenario.name}" to ${codecString}`);
}

function removeScenario(source, codecString, groupKey, scenarioName, dryRun) {
    const groupRange = findGroupRange(source, groupKey);
    const record = findRecordByCodec(source, codecString, groupRange?.start || 0, groupRange?.end || source.length);
    if (!record) {
        console.error(`${C.red}Record not found in source: ${codecString}${C.reset}`);
        process.exit(1);
    }

    const scenariosArr = findScenariosArray(source, record.start, record.end);
    if (!scenariosArr) {
        console.error(`${C.red}No scenarios array for ${codecString}${C.reset}`);
        process.exit(1);
    }

    const scenarioRange = findScenarioByName(source, scenariosArr.start, scenariosArr.end, scenarioName);
    if (!scenarioRange) {
        console.error(`${C.red}Scenario "${scenarioName}" not found in ${codecString}${C.reset}`);
        process.exit(1);
    }

    let removeStart = scenarioRange.start;
    let removeEnd = scenarioRange.end + 1;

    // Handle trailing comma
    if (removeEnd < scenariosArr.end && source[removeEnd] === ',') removeEnd++;

    // Consume whitespace after
    while (removeEnd < scenariosArr.end && /[\s]/.test(source[removeEnd])) {
        if (source[removeEnd] === '{' || source[removeEnd] === ']') break;
        removeEnd++;
    }

    // Handle leading comma if not first element
    let prevNonWs = removeStart - 1;
    while (prevNonWs >= scenariosArr.start && /\s/.test(source[prevNonWs])) prevNonWs--;
    if (source[prevNonWs] === ',') {
        removeStart = prevNonWs;
        let prevContent = removeStart - 1;
        while (prevContent >= scenariosArr.start && /\s/.test(source[prevContent])) prevContent--;
        if (source[prevContent] === '}') {
            removeStart = prevContent + 1;
        }
    }

    // Consume leading blank lines
    while (removeStart > scenariosArr.start + 1 && source[removeStart - 1] === '\n') {
        removeStart--;
    }

    const newSource = source.substring(0, removeStart) + source.substring(removeEnd);
    return writeResult(newSource, dryRun, `REMOVE SCENARIO "${scenarioName}" from ${codecString}`);
}

function updateField(source, codecString, groupKey, args, dryRun) {
    const setArg = args.options.set;
    const eqIdx = setArg.indexOf('=');
    if (eqIdx === -1) {
        console.error(`${C.red}--set requires key=value format${C.reset}`);
        process.exit(1);
    }

    const fieldName = setArg.substring(0, eqIdx);
    const rawValue = setArg.substring(eqIdx + 1);

    const groupRange = findGroupRange(source, groupKey);
    const record = findRecordByCodec(source, codecString, groupRange?.start || 0, groupRange?.end || source.length);
    if (!record) {
        console.error(`${C.red}Record not found in source: ${codecString}${C.reset}`);
        process.exit(1);
    }

    const field = findFieldInEntry(source, record.start, record.end, fieldName);
    if (!field) {
        console.error(`${C.red}Field "${fieldName}" not found in record${C.reset}`);
        process.exit(1);
    }

    let formattedValue;
    if (rawValue.startsWith('[')) {
        const items = rawValue.slice(1, -1).split(',').map(s => q(s.trim()));
        formattedValue = `[${items.join(', ')}]`;
    } else if (rawValue === 'true' || rawValue === 'false') {
        formattedValue = rawValue;
    } else if (!isNaN(rawValue) && rawValue !== '') {
        formattedValue = fmtNum(parseInt(rawValue, 10));
    } else {
        formattedValue = q(rawValue);
    }

    const newSource = source.substring(0, field.valueStart) + formattedValue + source.substring(field.valueEnd + 1);
    return writeResult(newSource, dryRun, `UPDATE ${codecString}.${fieldName} = ${rawValue}`);
}

function dropRecord(source, codecString, groupKey, dryRun) {
    const groupRange = findGroupRange(source, groupKey);
    const record = findRecordByCodec(source, codecString, groupRange?.start || 0, groupRange?.end || source.length);
    if (!record) {
        console.error(`${C.red}Record not found in source: ${codecString}${C.reset}`);
        process.exit(1);
    }

    let removeStart = record.commentStart;
    let removeEnd = record.end + 1;

    // Trailing comma
    if (removeEnd < source.length && source[removeEnd] === ',') removeEnd++;

    // Trailing whitespace/newline
    while (removeEnd < source.length && (source[removeEnd] === ' ' || source[removeEnd] === '\n')) {
        if (source[removeEnd] === '\n') { removeEnd++; break; }
        removeEnd++;
    }

    const newSource = source.substring(0, removeStart) + source.substring(removeEnd);
    return writeResult(newSource, dryRun, `DROP ${codecString}`);
}


// ==================== WRITE RESULT ====================

function writeResult(newSource, dryRun, label) {
    const syntaxResult = verifySyntax(newSource);
    if (syntaxResult !== true) {
        console.error(`  ${C.red}✗ Syntax error — NOT WRITTEN${C.reset}`);
        console.error(`  ${syntaxResult}`);
        process.exit(1);
    }

    if (dryRun) {
        console.log(`  ${C.green}✓${C.reset} ${label}`);
        console.log(`  ${C.yellow}(dry run — no changes written)${C.reset}`);
        return;
    }

    writeSourceFile(newSource);
    console.log(`  ${C.green}✓${C.reset} ${label}`);
    console.log(`  ${C.green}✓ Written to disk${C.reset}`);
}


// ==================== CLI DISPATCH ====================

function usage() {
    console.log(`
${C.bold}CodecProbe v2 Database Tool${C.reset}

${C.cyan}Usage:${C.reset}  node scripts/db-tool-v2.mjs <command> [args]

${C.cyan}Mutations (codec string = primary key):${C.reset}
  db <codec>                                    Show record details
  db <codec> --name <n> --scenario [opts]       Insert new record + first scenario
  db <codec> --scenario --sname <n> [opts]      Add scenario to existing record
  db <codec> --set key=value                    Update field value
  db <codec> --rm-scenario <name>               Remove scenario by name
  db <codec> --drop --confirm                   Drop entire record

${C.cyan}Read-only:${C.reset}
  stats                                         Overview table
  list [group] [--missing|--edu]                List records
  verify                                        Validate all records

${C.cyan}Video scenario flags:${C.reset}
  --sname <name>     Scenario name (required)
  --width <n>        Width in pixels (required)
  --height <n>       Height in pixels (required)
  --fps <n>          Framerate (required)
  --bitrate <n>      Bitrate in bps (required)
  --depth <n>        Bit depth (optional)
  --chroma <str>     Chroma subsampling: 420/4:2:0 (optional)
  --transfer <str>   Transfer function: pq, hlg (optional)
  --gamut <str>      Color gamut: rec2020, p3 (optional)
  --hdr <str>        HDR format: hdr10, hlg, hdr10plus (optional)
  --tier <str>       Tier: main, high (optional)

${C.cyan}Audio scenario flags:${C.reset}
  --sname <name>     Scenario name (required)
  --channels <n>     Channel count (required)
  --samplerate <n>   Sample rate in Hz (required)
  --bitrate <n>      Bitrate in bps (required)
  --depth <n>        Bit depth (optional)
  --spatial           Spatial audio (optional flag)

${C.cyan}Options:${C.reset}
  --name <name>      Record display name (required for INSERT)
  --group <key>      Override group detection
  --flags <a,b>      Codec flags (comma-separated)
  --dry-run          Preview without writing

${C.cyan}Examples:${C.reset}
  node scripts/db-tool-v2.mjs stats
  node scripts/db-tool-v2.mjs list video_hevc
  node scripts/db-tool-v2.mjs list --missing
  node scripts/db-tool-v2.mjs db hvc1.1.6.L93.B0
  node scripts/db-tool-v2.mjs db hvc1.2.4.L150.B0 --name "4K HDR10 HFR" \\
    --scenario --sname "4K HDR10 120fps" --width 3840 --height 2160 \\
    --fps 120 --bitrate 40000000 --depth 10 --transfer pq --gamut rec2020 --hdr hdr10
  node scripts/db-tool-v2.mjs db hvc1.2.4.L150.B0 --scenario \\
    --sname "4K HLG 120fps" --width 3840 --height 2160 \\
    --fps 120 --bitrate 40000000 --depth 10 --transfer hlg --gamut rec2020 --hdr hlg
  node scripts/db-tool-v2.mjs db hvc1.2.4.L150.B0 --set name="Updated Name"
  node scripts/db-tool-v2.mjs db hvc1.2.4.L150.B0 --rm-scenario "4K HLG 120fps"
  node scripts/db-tool-v2.mjs db hvc1.2.4.L150.B0 --drop --confirm
  node scripts/db-tool-v2.mjs verify
`);
}

const rawArgs = process.argv.slice(2);
if (rawArgs.length === 0) {
    usage();
    process.exit(0);
}

const command = rawArgs[0];

try {
    switch (command) {
        case 'stats':
            await cmdStats();
            break;

        case 'list': {
            const listArgs = parseArgs(rawArgs.slice(1));
            const filter = listArgs.flags.has('missing') ? 'missing' : listArgs.flags.has('edu') ? 'edu' : 'all';
            await cmdList(listArgs.positional[0] || null, filter);
            break;
        }

        case 'verify':
            await cmdVerify();
            break;

        case 'db': {
            const codecString = rawArgs[1];
            if (!codecString || codecString.startsWith('--')) {
                console.error(`${C.red}db requires a codec string${C.reset}`);
                usage();
                process.exit(1);
            }
            const dbArgs = parseArgs(rawArgs.slice(2));
            await cmdDb(codecString, dbArgs);
            break;
        }

        default:
            console.error(`${C.red}Unknown command: ${command}${C.reset}`);
            usage();
            process.exit(1);
    }
} catch (err) {
    console.error(`${C.red}Error:${C.reset} ${err.message}`);
    if (process.env.DEBUG) console.error(err.stack);
    process.exit(1);
}
