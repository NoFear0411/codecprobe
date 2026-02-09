/**
 * Database reader — import & query codec-database.js
 */

import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'url';

const __dirname = import.meta.dirname ?? dirname(fileURLToPath(import.meta.url));
export const DB_PATH = resolve(__dirname, '../../js/codec-database.js');

let _cache = null;

export async function loadDatabase() {
    if (_cache) return _cache;
    const url = pathToFileURL(DB_PATH).href;
    const mod = await import(url);
    _cache = mod.codecDatabase;
    return _cache;
}

export function getStats(db) {
    const groups = [];
    let totalEntries = 0, totalWithEdu = 0;

    for (const [key, group] of Object.entries(db)) {
        let total = 0, withEdu = 0, withPlatforms = 0, withRefs = 0;
        for (const test of group.tests) {
            total++;
            if (test.education) {
                withEdu++;
                if (test.education.platforms) withPlatforms++;
                if (test.education.references) withRefs++;
            }
        }
        groups.push({ key, category: group.category, total, withEdu, withPlatforms, withRefs, missing: total - withEdu });
        totalEntries += total;
        totalWithEdu += withEdu;
    }

    return { groups, totalEntries, totalWithEdu, totalMissing: totalEntries - totalWithEdu };
}

export function listEntries(db, groupKey, filter = 'all') {
    const group = db[groupKey];
    if (!group) return null;

    return group.tests
        .filter(t => {
            if (filter === 'missing') return !t.education;
            if (filter === 'complete') return !!t.education;
            return true;
        })
        .map(t => ({
            name: t.name,
            codec: t.codec,
            container: t.container,
            hasEducation: !!t.education,
            hasPlatforms: !!t.education?.platforms,
            hasStreaming: !!t.education?.streaming,
            hasReferences: !!t.education?.references
        }));
}

export function getEntry(db, groupKey, name) {
    const group = db[groupKey];
    if (!group) return null;
    return group.tests.find(t => t.name === name) || null;
}

/** Extract MIME type and codec string from a codec field like 'video/mp4; codecs="hvc1.1.6.L93.B0"' */
export function parseCodecField(codec) {
    // Values are already parsed JS strings — no outer quote stripping needed
    const semiIdx = codec.indexOf(';');
    const mime = semiIdx === -1 ? codec.trim() : codec.substring(0, semiIdx).trim();
    const codecsMatch = codec.match(/codecs="([^"]+)"/);
    const string = codecsMatch ? codecsMatch[1] : '';
    return { mime, string };
}

/** Split codec string into tokens (by dots) */
export function tokenizeCodecString(codecString) {
    if (!codecString) return [];
    return codecString.split('.').map(token => ({ token, meaning: '' }));
}
