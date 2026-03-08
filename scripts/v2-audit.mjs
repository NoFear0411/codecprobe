#!/usr/bin/env node

/**
 * v2-audit.mjs — Full audit of the v2 codec database.
 *
 * Combines listing, validation, and coverage analysis in a single view.
 * For mutations use db-tool-v2.mjs; this tool is read-only.
 *
 * Usage:
 *   node scripts/v2-audit.mjs              Full audit (list + validate + stats)
 *   node scripts/v2-audit.mjs --quick      Stats + validation only (no per-codec listing)
 *   node scripts/v2-audit.mjs --group <k>  Audit a single group
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = import.meta.dirname ?? dirname(fileURLToPath(import.meta.url));
const DB_PATH = resolve(__dirname, '..', 'js', 'codec-database-v2.js');


// ── ANSI ──

const C = {
    reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
    green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m',
    cyan: '\x1b[36m', magenta: '\x1b[35m', gray: '\x1b[90m'
};


// ── Database loader ──

async function loadDatabase() {
    const url = pathToFileURL(DB_PATH).href;
    const mod = await import(url);
    return mod.codecSource;
}


// ── Education helpers ──

function hasOverview(edu) {
    return edu?.overview && edu.overview !== '';
}

function hasStreaming(edu) {
    return edu?.streaming && (edu.streaming.hls?.length > 0 || edu.streaming.dash?.length > 0);
}

function hasContainerNotes(edu) {
    return edu?.containerNotes && Object.keys(edu.containerNotes).length > 0;
}

function hasRefs(edu) {
    return edu?.references?.length > 0;
}

function hasBreakdown(edu) {
    return edu?.breakdown?.length > 0 && edu.breakdown.every(t => t.meaning && t.meaning !== '');
}

function oscrFlags(edu) {
    const o = hasOverview(edu) ? `${C.green}O${C.reset}` : `${C.dim}O${C.reset}`;
    const s = hasStreaming(edu) ? `${C.green}S${C.reset}` : `${C.dim}S${C.reset}`;
    const c = hasContainerNotes(edu) ? `${C.green}C${C.reset}` : `${C.dim}C${C.reset}`;
    const r = hasRefs(edu) ? `${C.green}R${C.reset}` : `${C.dim}R${C.reset}`;
    return `${o}${s}${c}${r}`;
}

function pctBar(count, total) {
    if (total === 0) return `${C.dim} -%${C.reset}`;
    const pct = Math.round(count / total * 100);
    const color = pct === 100 ? C.green : pct > 0 ? C.yellow : C.red;
    return `${color}${pct.toString().padStart(3)}%${C.reset}`;
}


// ── Validation ──

function validateDatabase(db) {
    const issues = [];
    const warnings = [];
    const gaps = [];
    const seenCodecs = new Map();

    for (const [key, group] of Object.entries(db)) {
        if (!group.category) issues.push(`${key}: missing category`);
        if (!group.type) issues.push(`${key}: missing type`);
        if (!group.codecs || !Array.isArray(group.codecs)) {
            issues.push(`${key}: missing or invalid codecs array`);
            continue;
        }

        for (const rec of group.codecs) {
            const prefix = `${key}/${rec.codec || '??'}`;

            if (!rec.codec) { issues.push(`${prefix}: missing codec`); continue; }
            if (!rec.name) issues.push(`${prefix}: missing name`);

            if (seenCodecs.has(rec.codec)) {
                issues.push(`${prefix}: duplicate (also in ${seenCodecs.get(rec.codec)})`);
            }
            seenCodecs.set(rec.codec, key);

            if (!rec.containers || !rec.containers.file) {
                issues.push(`${prefix}: missing containers.file`);
            }

            if (!rec.scenarios || rec.scenarios.length === 0) {
                issues.push(`${prefix}: no scenarios`);
            } else {
                const scenarioNames = new Set();
                for (const s of rec.scenarios) {
                    if (!s.name) {
                        issues.push(`${prefix}: scenario missing name`);
                    } else if (scenarioNames.has(s.name)) {
                        issues.push(`${prefix}: duplicate scenario name "${s.name}"`);
                    } else {
                        scenarioNames.add(s.name);
                    }

                    if (!s.bitrate) warnings.push(`${prefix}/${s.name || '?'}: missing bitrate`);

                    if (group.type === 'video') {
                        if (!s.width || !s.height) warnings.push(`${prefix}/${s.name || '?'}: missing width/height`);
                        if (!s.framerate) warnings.push(`${prefix}/${s.name || '?'}: missing framerate`);
                    } else {
                        if (!s.channels) warnings.push(`${prefix}/${s.name || '?'}: missing channels`);
                        if (!s.samplerate) warnings.push(`${prefix}/${s.name || '?'}: missing samplerate`);
                    }
                }
            }

            if (rec.education) {
                const edu = rec.education;
                if (!Array.isArray(edu.breakdown)) {
                    issues.push(`${prefix}: education.breakdown not an array`);
                } else {
                    for (const t of edu.breakdown) {
                        if (!t.token) issues.push(`${prefix}: breakdown token missing`);
                        if (!t.meaning) warnings.push(`${prefix}: empty meaning for token "${t.token || '?'}"`);
                    }
                }
                if (!hasOverview(edu)) warnings.push(`${prefix}: empty overview`);
                if (!hasStreaming(edu)) gaps.push(`${prefix}: no streaming entries`);
                if (!hasContainerNotes(edu)) gaps.push(`${prefix}: no containerNotes`);
                if (!hasRefs(edu)) gaps.push(`${prefix}: no references`);
            } else {
                gaps.push(`${prefix}: no education object`);
            }
        }
    }

    return { issues, warnings, gaps };
}


// ── Per-codec listing ──

function printCodecDetails(rec, index, mediaType) {
    const fileCt = rec.containers?.file || [];
    const streamCt = rec.containers?.stream || [];
    const ctCount = fileCt.length + streamCt.length;
    const flags = oscrFlags(rec.education);

    console.log(`  ${C.cyan}${index}.${C.reset} ${flags} ${C.bold}${rec.codec}${C.reset}`);
    console.log(`     ${C.dim}name:${C.reset} ${rec.name}`);
    console.log(`     ${C.dim}file:${C.reset} [${fileCt.join(', ')}]  ${C.dim}stream:${C.reset} [${streamCt.join(', ')}]  ${C.dim}(${ctCount} containers)${C.reset}`);

    if (rec.drm?.length) {
        console.log(`     ${C.dim}drm:${C.reset}  [${rec.drm.join(', ')}]`);
    }
    if (rec.flags?.length) {
        console.log(`     ${C.dim}flags:${C.reset} [${rec.flags.join(', ')}]`);
    }

    const scenarios = rec.scenarios || [];
    for (let si = 0; si < scenarios.length; si++) {
        const s = scenarios[si];
        const prefix = scenarios.length > 1 ? `${C.magenta}scenario ${si + 1}:${C.reset}` : `${C.dim}scenario:${C.reset}`;

        const parts = [];
        if (s.width && s.height) parts.push(`${s.width}x${s.height}`);
        if (s.framerate) parts.push(`${s.framerate}fps`);
        if (s.bitDepth) parts.push(`${s.bitDepth}-bit`);
        if (s.bitrate) parts.push(`${(s.bitrate / 1_000_000).toFixed(1)} Mbps`);
        if (s.chromaSubsampling) parts.push(s.chromaSubsampling);
        if (s.channels) parts.push(`${s.channels}ch`);
        if (s.samplerate) parts.push(`${s.samplerate}Hz`);
        if (s.spatial) parts.push('spatial');

        const hdr = [];
        if (s.transferFunction) hdr.push(`tf:${s.transferFunction}`);
        if (s.colorGamut) hdr.push(`gamut:${s.colorGamut}`);
        if (s.hdrFormat) hdr.push(`hdr:${s.hdrFormat}`);

        const scenarioLine = parts.join(' \u00b7 ') + (hdr.length ? `  ${C.dim}|${C.reset}  ${hdr.join(' \u00b7 ')}` : '');
        console.log(`     ${prefix} ${C.bold}${s.name}${C.reset} \u2014 ${scenarioLine}`);
    }
}


// ── Stats table ──

function printStats(db) {
    const header = `${'Group'.padEnd(24)} ${'Type'.padEnd(7)} ${'Recs'.padStart(5)} ${'Scen'.padStart(5)} ${'Slots'.padStart(7)} ${'Edu'.padStart(5)} ${'Strm'.padStart(5)} ${'Cntr'.padStart(5)} ${'Refs'.padStart(5)}`;
    console.log(`${C.dim}${header}${C.reset}`);
    console.log(`${C.dim}${'─'.repeat(header.length)}${C.reset}`);

    let tRecs = 0, tScen = 0, tSlots = 0, tEdu = 0, tStrm = 0, tCntr = 0, tRefs = 0;

    for (const [key, group] of Object.entries(db)) {
        const codecs = group.codecs || [];
        const recs = codecs.length;
        let scen = 0, slots = 0, edu = 0, strm = 0, cntr = 0, refs = 0;

        for (const rec of codecs) {
            const scenCount = rec.scenarios?.length || 0;
            const ctCount = (rec.containers?.file?.length || 0) + (rec.containers?.stream?.length || 0);
            scen += scenCount;
            slots += scenCount * ctCount;
            if (hasOverview(rec.education)) edu++;
            if (hasStreaming(rec.education)) strm++;
            if (hasContainerNotes(rec.education)) cntr++;
            if (hasRefs(rec.education)) refs++;
        }

        const recsStr = recs === 0 ? `${C.dim}${String(recs).padStart(5)}${C.reset}` : String(recs).padStart(5);

        console.log(
            `${key.padEnd(24)} ${group.type.padEnd(7)} ${recsStr} ` +
            `${String(scen).padStart(5)} ${String(slots).padStart(7)} ` +
            `${String(edu).padStart(5)} ${String(strm).padStart(5)} ${String(cntr).padStart(5)} ${String(refs).padStart(5)}  ` +
            `${pctBar(edu, recs)}`
        );

        tRecs += recs; tScen += scen; tSlots += slots;
        tEdu += edu; tStrm += strm; tCntr += cntr; tRefs += refs;
    }

    console.log(`${C.dim}${'─'.repeat(header.length)}${C.reset}`);
    console.log(
        `${'TOTAL'.padEnd(24)} ${''.padEnd(7)} ${String(tRecs).padStart(5)} ` +
        `${String(tScen).padStart(5)} ${String(tSlots).padStart(7)} ` +
        `${String(tEdu).padStart(5)} ${String(tStrm).padStart(5)} ${String(tCntr).padStart(5)} ${String(tRefs).padStart(5)}  ` +
        `${pctBar(tEdu, tRecs)}`
    );

    return { totalCodecs: tRecs, totalScenarios: tScen, totalSlots: tSlots };
}


// ── Main ──

const args = process.argv.slice(2);
const quick = args.includes('--quick');
const groupFilter = args.includes('--group') ? args[args.indexOf('--group') + 1] : null;

const db = await loadDatabase();

console.log(`\n${C.bold}CodecProbe v2 Database Audit${C.reset}\n`);

// ── 1. Per-codec listing (unless --quick) ──

if (!quick) {
    for (const [groupKey, group] of Object.entries(db)) {
        if (groupFilter && groupKey !== groupFilter) continue;

        const codecs = group.codecs || [];
        if (codecs.length === 0) {
            console.log(`${C.dim}${group.category} (${groupKey}) — empty${C.reset}`);
            continue;
        }

        console.log(`${C.bold}${group.category}${C.reset} ${C.dim}(${groupKey}, ${group.type})${C.reset} — ${codecs.length} codecs`);
        console.log('─'.repeat(80));

        for (let i = 0; i < codecs.length; i++) {
            printCodecDetails(codecs[i], i + 1, group.type);
        }
        console.log();
    }
}

// ── 2. Coverage stats ──

console.log(`${C.bold}Coverage${C.reset}\n`);
const { totalCodecs, totalScenarios, totalSlots } = printStats(db);

// ── 3. Validation ──

console.log(`\n${C.bold}Validation${C.reset}\n`);
const { issues, warnings, gaps } = validateDatabase(db);

if (issues.length > 0) {
    console.log(`  ${C.red}${issues.length} error(s):${C.reset}`);
    for (const msg of issues) console.log(`    ${C.red}✗${C.reset} ${msg}`);
}

if (warnings.length > 0) {
    console.log(`  ${C.yellow}${warnings.length} warning(s):${C.reset}`);
    for (const msg of warnings) console.log(`    ${C.yellow}⚠${C.reset} ${msg}`);
}

if (gaps.length > 0) {
    console.log(`  ${C.dim}${gaps.length} education gap(s):${C.reset}`);
    for (const msg of gaps) console.log(`    ${C.dim}·${C.reset} ${msg}`);
}

if (issues.length === 0 && warnings.length === 0) {
    console.log(`  ${C.green}✓${C.reset} All ${totalCodecs} codecs pass validation`);
}

// ── 4. Summary ──

console.log(`\n${'═'.repeat(80)}`);
console.log(`${C.bold}Summary:${C.reset} ${totalCodecs} codecs, ${totalScenarios} scenarios, ${totalSlots} test slots (scenarios × containers)`);
if (issues.length > 0) console.log(`         ${C.red}${issues.length} error(s)${C.reset}, ${C.yellow}${warnings.length} warning(s)${C.reset}, ${C.dim}${gaps.length} gap(s)${C.reset}`);
console.log('═'.repeat(80));
console.log();

process.exit(issues.length > 0 ? 1 : 0);
