/**
 * Database writer — format education objects as source code, inject/replace in source text
 *
 * Formatting targets the codec-database.js layout:
 *   - Test properties at 16 spaces (name, codec, education)
 *   - Education sub-properties at 20 spaces
 *   - Nested values at 24 spaces
 *   - Deepest nesting at 28 spaces
 *   - Single quotes by default, double quotes for strings containing apostrophes
 */

import { readFile, writeFile, writeFileSync, unlinkSync } from 'fs';
import { execFileSync } from 'child_process';
import { tmpdir } from 'os';
import { join } from 'path';
import { DB_PATH } from './reader.mjs';

export { DB_PATH };

// --- Indentation levels ---
const I0 = ' '.repeat(16);  // education: {
const I1 = ' '.repeat(20);  // codecBreakdown: {
const I2 = ' '.repeat(24);  // mime: '...'
const I3 = ' '.repeat(28);  // { token: '...', meaning: '...' }

// --- String quoting (single-quote convention, matching codebase) ---

export function q(str) {
    if (typeof str !== 'string') return String(str);
    let s = str.replace(/\\/g, '\\\\');
    // Prefer single quotes (codebase convention)
    if (!s.includes("'")) return `'${s}'`;
    // Fall back to double quotes if string has apostrophes
    if (!s.includes('"')) return `"${s}"`;
    // Both — use single quotes, escape inner singles
    return `'${s.replace(/'/g, "\\'")}'`;
}

// --- Education formatter ---

export function formatEducation(edu) {
    const lines = [];
    lines.push(`${I0}education: {`);

    // Determine section order for trailing comma logic
    const sections = [];
    if (edu.codecBreakdown) sections.push('codecBreakdown');
    if (edu.overview !== undefined) sections.push('overview');
    if (edu.platforms) sections.push('platforms');
    if (edu.streaming) sections.push('streaming');
    if (edu.references) sections.push('references');

    const trailingComma = (section) => sections.indexOf(section) < sections.length - 1 ? ',' : '';

    // codecBreakdown
    if (edu.codecBreakdown) {
        const cb = edu.codecBreakdown;
        lines.push(`${I1}codecBreakdown: {`);
        lines.push(`${I2}mime: ${q(cb.mime)},`);
        lines.push(`${I2}string: ${q(cb.string)},`);
        lines.push(`${I2}parts: [`);
        cb.parts.forEach((p, i) => {
            const comma = i < cb.parts.length - 1 ? ',' : '';
            lines.push(`${I3}{ token: ${q(p.token)}, meaning: ${q(p.meaning)} }${comma}`);
        });
        lines.push(`${I2}]`);
        lines.push(`${I1}}${trailingComma('codecBreakdown')}`);
    }

    // overview
    if (edu.overview !== undefined) {
        lines.push(`${I1}overview: ${q(edu.overview)}${trailingComma('overview')}`);
    }

    // platforms
    if (edu.platforms) {
        lines.push(`${I1}platforms: {`);
        const keys = Object.keys(edu.platforms);
        keys.forEach((k, i) => {
            const comma = i < keys.length - 1 ? ',' : '';
            lines.push(`${I2}${k}: ${q(edu.platforms[k])}${comma}`);
        });
        lines.push(`${I1}}${trailingComma('platforms')}`);
    }

    // streaming
    if (edu.streaming) {
        lines.push(`${I1}streaming: {`);
        const keys = Object.keys(edu.streaming);
        keys.forEach((k, i) => {
            const comma = i < keys.length - 1 ? ',' : '';
            lines.push(`${I2}${k}: ${q(edu.streaming[k])}${comma}`);
        });
        lines.push(`${I1}}${trailingComma('streaming')}`);
    }

    // references
    if (edu.references) {
        lines.push(`${I1}references: [`);
        edu.references.forEach((ref, i) => {
            const comma = i < edu.references.length - 1 ? ',' : '';
            if (ref.url) {
                lines.push(`${I2}{ title: ${q(ref.title)}, url: ${q(ref.url)} }${comma}`);
            } else {
                lines.push(`${I2}{ title: ${q(ref.title)} }${comma}`);
            }
        });
        lines.push(`${I1}]`);
    }

    lines.push(`${I0}}`);
    return lines.join('\n');
}

// --- Source text navigation (string-aware brace matching) ---

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
        if (ch === '}') {
            depth--;
            if (depth === 0) return i;
        }
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

function findEntryByName(source, name, groupStart = 0, groupEnd = source.length) {
    const patterns = [`name: "${name}",`, `name: '${name}',`];

    let nameIdx = -1;
    for (const p of patterns) {
        const idx = source.indexOf(p, groupStart);
        if (idx !== -1 && idx < groupEnd) { nameIdx = idx; break; }
    }
    if (nameIdx === -1) return null;

    // Walk backwards to find entry opening { (alone on its line)
    let entryStart = -1;
    for (let i = nameIdx - 1; i >= groupStart; i--) {
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

    return { start: entryStart, end: entryEnd, nameIdx };
}

function findEducationInEntry(source, entryStart, entryEnd) {
    const area = source.substring(entryStart, entryEnd);
    const match = area.match(/education:\s*\{/);
    if (!match) return null;

    const eduKeyIdx = entryStart + match.index;
    const braceStart = source.indexOf('{', eduKeyIdx + 'education'.length);
    const braceEnd = findMatchingBrace(source, braceStart);
    if (braceEnd === -1) return null;

    let lineStart = eduKeyIdx;
    while (lineStart > 0 && source[lineStart - 1] !== '\n') lineStart--;

    return { lineStart, keyIdx: eduKeyIdx, braceStart, braceEnd };
}

// --- File I/O ---

export async function readSource() {
    return new Promise((resolve, reject) => {
        readFile(DB_PATH, 'utf-8', (err, data) => err ? reject(err) : resolve(data));
    });
}

export async function writeSource(source) {
    return new Promise((resolve, reject) => {
        writeFile(DB_PATH, source, 'utf-8', (err) => err ? reject(err) : resolve());
    });
}

export function verifySyntax(source) {
    const tmp = join(tmpdir(), `db-verify-${Date.now()}.js`);
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

// --- Inject education (entry must NOT already have education) ---

export function injectEducation(source, entryName, edu, groupKey) {
    let groupStart = 0, groupEnd = source.length;
    if (groupKey) {
        const range = findGroupRange(source, groupKey);
        if (!range) return { ok: false, reason: `Group "${groupKey}" not found in source` };
        groupStart = range.start;
        groupEnd = range.end;
    }

    const entry = findEntryByName(source, entryName, groupStart, groupEnd);
    if (!entry) return { ok: false, reason: `Entry "${entryName}" not found` };

    const existing = findEducationInEntry(source, entry.start, entry.end);
    if (existing) return { ok: false, reason: 'already has education' };

    const formatted = formatEducation(edu);

    // Find last non-whitespace char before entry closing brace
    let lastContent = entry.end - 1;
    while (lastContent > entry.start && /\s/.test(source[lastContent])) lastContent--;

    const comma = source[lastContent] !== ',' ? ',' : '';
    const before = source.substring(0, lastContent + 1);
    const after = source.substring(entry.end);

    return { ok: true, source: before + comma + '\n' + formatted + '\n' + ' '.repeat(12) + after };
}

// --- Bracket matching (for tests: [...] arrays) ---

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
        if (ch === ']') {
            depth--;
            if (depth === 0) return i;
        }
        i++;
    }
    return -1;
}

// --- Entry formatter (complete test entry → source code) ---

export function formatEntry(entry) {
    const E = ' '.repeat(12);  // entry braces
    const P = ' '.repeat(16);  // properties
    const M = ' '.repeat(20);  // mediaConfig sub-properties
    const V = ' '.repeat(24);  // video/audio properties

    const lines = [];
    lines.push(`${E}{`);
    lines.push(`${P}name: ${q(entry.name)},`);
    lines.push(`${P}codec: ${q(entry.codec)},`);
    lines.push(`${P}container: ${q(entry.container)},`);
    lines.push(`${P}info: ${q(entry.info)},`);
    lines.push(`${P}mediaConfig: {`);
    lines.push(`${M}type: ${q(entry.mediaConfig.type)},`);

    if (entry.mediaConfig.video) {
        const v = entry.mediaConfig.video;
        const props = [
            `contentType: ${q(v.contentType)}`,
            `width: ${v.width}`,
            `height: ${v.height}`,
            `bitrate: ${v.bitrate}`,
            `framerate: ${v.framerate}`
        ];
        if (v.transferFunction) props.push(`transferFunction: ${q(v.transferFunction)}`);
        if (v.colorGamut) props.push(`colorGamut: ${q(v.colorGamut)}`);

        lines.push(`${M}video: {`);
        props.forEach((p, i) => lines.push(`${V}${p}${i < props.length - 1 ? ',' : ''}`));
        lines.push(`${M}}`);
    }

    if (entry.mediaConfig.audio) {
        const a = entry.mediaConfig.audio;
        const props = [
            `contentType: ${q(a.contentType)}`,
            `channels: ${a.channels}`,
            `bitrate: ${a.bitrate}`
        ];
        if (a.samplerate) props.push(`samplerate: ${a.samplerate}`);

        lines.push(`${M}audio: {`);
        props.forEach((p, i) => lines.push(`${V}${p}${i < props.length - 1 ? ',' : ''}`));
        lines.push(`${M}}`);
    }

    // Close mediaConfig — comma if education follows
    lines.push(`${P}}${entry.education ? ',' : ''}`);

    if (entry.education) {
        lines.push(formatEducation(entry.education));
    }

    lines.push(`${E}}`);
    return lines.join('\n');
}

// --- Add new entry to a group's tests array ---

export function addEntry(source, entry, groupKey) {
    const range = findGroupRange(source, groupKey);
    if (!range) return { ok: false, reason: `Group "${groupKey}" not found` };

    const area = source.substring(range.start, range.end);
    const testsMatch = area.match(/tests:\s*\[/);
    if (!testsMatch) return { ok: false, reason: `No tests array in "${groupKey}"` };

    const bracketStart = range.start + testsMatch.index + testsMatch[0].length - 1;
    const bracketEnd = findMatchingBracket(source, bracketStart);
    if (bracketEnd === -1) return { ok: false, reason: 'Could not find end of tests array' };

    const formatted = formatEntry(entry);

    // Find last non-whitespace before closing ]
    let lastContent = bracketEnd - 1;
    while (lastContent > bracketStart && /\s/.test(source[lastContent])) lastContent--;

    if (source[lastContent] === '[') {
        // Empty array
        const before = source.substring(0, lastContent + 1);
        const after = source.substring(bracketEnd);
        return { ok: true, source: before + '\n' + formatted + '\n' + ' '.repeat(8) + after };
    }

    // Append after last entry, add comma if needed
    const needsComma = source[lastContent] !== ',';
    const before = source.substring(0, lastContent + 1);
    const comma = needsComma ? ',' : '';
    const after = source.substring(bracketEnd);

    return { ok: true, source: before + comma + '\n' + formatted + '\n' + ' '.repeat(8) + after };
}

// --- Replace education (entry MUST already have education) ---

export function replaceEducation(source, entryName, edu, groupKey) {
    let groupStart = 0, groupEnd = source.length;
    if (groupKey) {
        const range = findGroupRange(source, groupKey);
        if (!range) return { ok: false, reason: `Group "${groupKey}" not found in source` };
        groupStart = range.start;
        groupEnd = range.end;
    }

    const entry = findEntryByName(source, entryName, groupStart, groupEnd);
    if (!entry) return { ok: false, reason: `Entry "${entryName}" not found` };

    const existing = findEducationInEntry(source, entry.start, entry.end);
    if (!existing) return { ok: false, reason: 'no existing education to replace' };

    const formatted = formatEducation(edu);
    const before = source.substring(0, existing.lineStart);
    const after = source.substring(existing.braceEnd + 1);

    return { ok: true, source: before + formatted + after };
}
