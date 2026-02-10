// @ts-check
/**
 * UI Renderer Module
 *
 * Renders device info, codec test cards with per-container results,
 * education panels, filters, search, and export.
 *
 * Security note: All innerHTML usage renders content from the internal
 * codec database and device detection APIs — never from user input.
 * External text (codec strings, education) is escaped via escapeHtml().
 *
 * @typedef {import('./codec-database-v2.js').CodecRecord} CodecRecord
 * @typedef {import('./codec-database-v2.js').Education} Education
 * @typedef {import('./codec-database-v2.js').CodecFlag} CodecFlag
 * @typedef {import('./codec-tester.js').CodecTestResult} CodecTestResult
 * @typedef {import('./codec-tester.js').TestResults} TestResults
 * @typedef {import('./codec-tester.js').ContainerTestResult} ContainerTestResult
 */

import { codecSource, buildMime, buildInfo, buildMediaConfig, CONTAINER_DISPLAY, STREAM_CONTAINERS } from './codec-database-v2.js';
import { updateURLState } from './url-state.js';
import { detectDeviceInfo } from './device-detection.js';

/** @type {{ currentFilter: string, testResults: TestResults | null, searchQuery: string }} */
export const state = {
    currentFilter: 'all',
    testResults: null,
    searchQuery: ''
};

/** @param {string} message */
export function announceToScreenReader(message) {
    const announcer = document.getElementById('sr-announcements');
    if (announcer) {
        announcer.textContent = message;
        setTimeout(() => { announcer.textContent = ''; }, 1000);
    }
}

/**
 * Render device information header and grid.
 * All content from internal device detection APIs, not user input.
 */
export function renderDeviceInfo(info) {
    const header = document.getElementById('device-info-summary');
    const grid = document.getElementById('device-info-grid');

    if (!header || !grid) return;

    let headerText = `${info.browser} ${info.browserVersion} • ${info.engine} • ${info.os} ${info.osVersion}`;
    if (info.deviceModel && info.deviceModel !== 'Unknown') {
        headerText += ` • ${info.deviceModel}`;
    }
    headerText += ` • ${info.screenWidth}×${info.screenHeight}`;
    if (info.screenHDR) {
        headerText += ` • <span>HDR Display</span>`;
    }
    // Content from internal device detection, not user input
    header.innerHTML = headerText;

    const apiBox = document.getElementById('api-availability');
    if (apiBox) {
        // Content from internal API detection, not user input
        apiBox.innerHTML = `
            <div class="api-status-item ${info.apiSupport.canPlayType ? 'supported' : 'unavailable'}">
                <span class="api-status-indicator"></span>
                <span class="api-status-label">canPlayType()</span>
            </div>
            <div class="api-status-item ${info.apiSupport.isTypeSupported ? 'supported' : 'unavailable'}">
                <span class="api-status-indicator"></span>
                <span class="api-status-label">isTypeSupported()</span>
            </div>
            <div class="api-status-item ${info.apiSupport.mediaCapabilities ? 'supported' : 'unavailable'}">
                <span class="api-status-indicator"></span>
                <span class="api-status-label">mediaCapabilities()</span>
            </div>
        `;
    }

    // All values from internal device detection
    let gridHTML = `
        <div class="device-info-item">
            <div class="device-info-label">Browser</div>
            <div class="device-info-value">${info.browser} ${info.browserVersion}</div>
        </div>
        <div class="device-info-item">
            <div class="device-info-label">OS</div>
            <div class="device-info-value">${info.os} ${info.osVersion}</div>
        </div>
        <div class="device-info-item">
            <div class="device-info-label">Rendering Engine</div>
            <div class="device-info-value">${info.engine} ${info.engineVersion}</div>
        </div>
        <div class="device-info-item">
            <div class="device-info-label">Device Type</div>
            <div class="device-info-value">${info.deviceType}</div>
        </div>
        <div class="device-info-item">
            <div class="device-info-label">CPU Architecture</div>
            <div class="device-info-value">${info.cpuArchitecture}</div>
        </div>
        <div class="device-info-item">
            <div class="device-info-label">Screen</div>
            <div class="device-info-value">${info.screenWidth}×${info.screenHeight} @ ${info.pixelRatio}x DPR</div>
        </div>
        <div class="device-info-item">
            <div class="device-info-label">HDR Display</div>
            <div class="device-info-value">${info.screenHDR ? 'YES' : 'NO'}</div>
        </div>
        <div class="device-info-item">
            <div class="device-info-label">Color Gamut</div>
            <div class="device-info-value">${info.rec2020 ? 'Rec.2020' : info.wideGamut ? 'P3' : 'sRGB'}</div>
        </div>
        <div class="device-info-item">
            <div class="device-info-label">CPU Cores</div>
            <div class="device-info-value">${info.hardwareConcurrency}</div>
        </div>
        <div class="device-info-item">
            <div class="device-info-label">RAM</div>
            <div class="device-info-value">${info.deviceMemory}</div>
        </div>
    `;

    if (info.webOS) {
        gridHTML += `<div class="device-info-item highlight"><div class="device-info-label">Platform</div><div class="device-info-value">webOS ${info.osVersion || ''}</div></div>`;
    } else if (info.tvOS) {
        gridHTML += `<div class="device-info-item highlight"><div class="device-info-label">Platform</div><div class="device-info-value">tvOS</div></div>`;
    } else if (info.iOS) {
        gridHTML += `<div class="device-info-item highlight"><div class="device-info-label">Platform</div><div class="device-info-value">iOS ${info.osVersion || ''}</div></div>`;
    } else if (info.android) {
        gridHTML += `<div class="device-info-item highlight"><div class="device-info-label">Platform</div><div class="device-info-value">Android ${info.osVersion || ''}</div></div>`;
    }

    if (info.drm) {
        if (info.drm.timedOut) {
            gridHTML += `<div class="device-info-item"><div class="device-info-label">DRM/EME Support</div><div class="device-info-value" style="color: var(--orange);">Testing...</div></div>`;
        } else if (info.drm.emeAvailable) {
            const supportedDRM = Object.values(info.drm.systems)
                .filter(s => s.supported)
                .map(s => {
                    const level = s.details?.securityLevel || '';
                    return `${s.name}${level ? ` (${level})` : ''}`;
                });
            if (supportedDRM.length > 0) {
                gridHTML += `<div class="device-info-item highlight"><div class="device-info-label">DRM Key Systems</div><div class="device-info-value">${supportedDRM.join(', ')}</div></div>`;
            } else {
                gridHTML += `<div class="device-info-item"><div class="device-info-label">DRM Key Systems</div><div class="device-info-value" style="color: var(--text-secondary);">EME available, no key systems</div></div>`;
            }
        } else {
            gridHTML += `<div class="device-info-item"><div class="device-info-label">DRM/EME</div><div class="device-info-value" style="color: var(--text-dimmed);">Not available</div></div>`;
        }
    }

    grid.innerHTML = gridHTML;
}


// ==================== BADGE HELPERS ====================

function getResponseClass(value) {
    if (value === 'probably') return 'success';
    if (value === 'maybe') return 'partial';
    return 'fail';
}

function getApiBadgeClass(apiName, apiData) {
    if (!apiData || apiData === 'error') return 'fail';

    switch (apiName) {
        case 'canPlayType':
            if (apiData === 'probably') return 'success';
            if (apiData === 'maybe') return 'partial';
            return 'fail';
        case 'isTypeSupported':
            return apiData === 'probably' ? 'success' : 'fail';
        case 'mediaCapabilities':
            if (apiData.error) return 'fail';
            if (apiData.supported) return 'success';
            return 'fail';
        default:
            return 'fail';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


// ==================== CONTAINER RESULTS ====================

/**
 * Format per-container test results as a table with badges.
 * Each container gets its own row with badges 1, 2, 3.
 * All content from internal codec database and API results.
 *
 * @param {CodecTestResult} codec
 * @returns {string}
 */
function formatContainerResults(codec) {
    const containers = codec.containers;
    if (!containers || Object.keys(containers).length === 0) {
        return '<p style="color: var(--text-dimmed);">No container results available.</p>';
    }

    let html = '<details class="api-results">';
    html += '<summary class="api-toggle-label">';
    html += '<span class="api-section-title">Container Test Results</span>';
    html += '<span class="api-toggle-burger"><span></span><span></span><span></span></span>';
    html += '</summary>';
    html += '<div class="api-toggle-content">';

    for (const [containerKey, cr] of Object.entries(containers)) {
        const displayName = CONTAINER_DISPLAY[containerKey] || containerKey.toUpperCase();
        const isStream = STREAM_CONTAINERS.has(containerKey);
        const modeLabel = isStream ? 'Stream' : 'File';

        html += `<div class="container-result-block">`;
        html += `<div class="container-result-header">`;
        html += `<span class="container-label">${escapeHtml(displayName)}</span>`;
        html += `<span class="container-mode ${isStream ? 'stream' : 'file'}">${modeLabel}</span>`;
        html += `<code class="container-mime">${escapeHtml(cr.mime)}</code>`;
        html += `</div>`;

        html += `<div class="container-badges">`;

        // Badge 1: canPlayType
        if (cr.canPlayType) {
            const cls1 = getApiBadgeClass('canPlayType', cr.canPlayType);
            html += `<div class="badge-result">`;
            html += `<span class="api-number ${cls1}">1</span>`;
            html += `<span class="badge-label">canPlayType:</span>`;
            html += `<span class="response-value ${getResponseClass(cr.canPlayType)}">${escapeHtml(cr.canPlayType)}</span>`;
            html += `</div>`;
        }

        // Badge 2: isTypeSupported
        if (cr.isTypeSupported) {
            const cls2 = getApiBadgeClass('isTypeSupported', cr.isTypeSupported);
            html += `<div class="badge-result">`;
            html += `<span class="api-number ${cls2}">2</span>`;
            html += `<span class="badge-label">isTypeSupported:</span>`;
            html += `<span class="response-value ${cr.isTypeSupported === 'probably' ? 'success' : 'fail'}">${escapeHtml(cr.isTypeSupported)}</span>`;
            html += `</div>`;
        }

        // Badge 3: mediaCapabilities
        if (cr.mediaCapabilities) {
            const mc = cr.mediaCapabilities;
            const cls3 = getApiBadgeClass('mediaCapabilities', mc);
            html += `<div class="badge-result">`;
            html += `<span class="api-number ${cls3}">3</span>`;
            html += `<span class="badge-label">mediaCapabilities:</span>`;

            if (mc.error) {
                html += `<span class="response-value fail">${escapeHtml(mc.error)}</span>`;
            } else {
                html += `<span class="response-value ${mc.supported ? 'success' : 'fail'}">${mc.supported ? 'supported' : 'unsupported'}</span>`;
                if (mc.supported) {
                    html += `<span class="mc-detail">${mc.smooth ? 'smooth' : ''} ${mc.powerEfficient ? 'efficient' : ''}</span>`;
                }
            }
            html += `</div>`;

            // Spatial sub-result
            if (cr.spatial) {
                html += `<div class="badge-result spatial-result">`;
                html += `<span class="badge-label">Spatial:</span>`;
                if (cr.spatial.error) {
                    html += `<span class="response-value fail">${escapeHtml(cr.spatial.error)}</span>`;
                } else {
                    html += `<span class="response-value ${cr.spatial.supported ? 'success' : 'fail'}">${cr.spatial.supported ? 'Yes' : 'No'}</span>`;
                }
                html += `</div>`;
            }
        }

        html += `</div>`; // close container-badges
        html += `</div>`; // close container-result-block
    }

    // DRM results (badge 4)
    if (codec.drm && Object.keys(codec.drm).length > 0) {
        html += `<div class="drm-result-block">`;
        html += `<div class="container-result-header"><span class="container-label">DRM Per-Codec</span></div>`;
        html += `<div class="container-badges">`;

        for (const [system, drmResult] of Object.entries(codec.drm)) {
            const cls = drmResult.supported ? 'success' : 'fail';
            html += `<div class="badge-result">`;
            html += `<span class="api-number ${cls}">4</span>`;
            html += `<span class="badge-label">${escapeHtml(system)}:</span>`;
            html += `<span class="response-value ${cls}">${drmResult.supported ? 'supported' : escapeHtml(drmResult.reason || 'unsupported')}</span>`;
            if (drmResult.robustness) {
                html += `<span class="mc-detail">${escapeHtml(drmResult.robustness)}</span>`;
            }
            html += `</div>`;
        }

        html += `</div></div>`;
    }

    html += '</div>';
    html += '</details>';
    return html;
}


// ==================== TECHNICAL SPECS ====================

function buildTechnicalSpecs(codec) {
    if (!codec.scenario) return '';
    return buildInfo(codec.scenario, codec.type);
}


// ==================== COPY TEXT ====================

function buildCopyText(codec) {
    const lines = [];
    lines.push(`${codec.name} — ${codec.support.toUpperCase()}`);
    lines.push(`Codec: ${codec.codec}`);

    if (codec.flags && codec.flags.length > 0) {
        lines.push(`Flags: ${codec.flags.join(', ')}`);
    }

    lines.push('');

    for (const [containerKey, cr] of Object.entries(codec.containers || {})) {
        const displayName = CONTAINER_DISPLAY[containerKey] || containerKey;
        const isStream = STREAM_CONTAINERS.has(containerKey);
        lines.push(`── ${displayName} (${isStream ? 'Stream' : 'File'}) ──`);
        lines.push(`  MIME: ${cr.mime}`);
        lines.push(`  1 canPlayType: ${cr.canPlayType || 'N/A'}`);
        lines.push(`  2 isTypeSupported: ${cr.isTypeSupported || 'N/A'}`);

        if (cr.mediaCapabilities) {
            const mc = cr.mediaCapabilities;
            if (mc.error) {
                lines.push(`  3 mediaCapabilities: error — ${mc.error}`);
            } else {
                const caps = [mc.supported ? 'supported' : 'unsupported'];
                if (mc.smooth) caps.push('smooth');
                if (mc.powerEfficient) caps.push('efficient');
                lines.push(`  3 mediaCapabilities: ${caps.join(', ')}`);
            }
        }

        if (cr.spatial) {
            lines.push(`  Spatial: ${cr.spatial.error ? 'error' : cr.spatial.supported ? 'yes' : 'no'}`);
        }
    }

    if (codec.drm && Object.keys(codec.drm).length > 0) {
        lines.push('');
        lines.push('── DRM ──');
        for (const [system, dr] of Object.entries(codec.drm)) {
            lines.push(`  ${system}: ${dr.supported ? 'supported' : dr.reason || 'unsupported'}${dr.robustness ? ` (${dr.robustness})` : ''}`);
        }
    }

    return lines.join('\n');
}


// ==================== EDUCATION ====================

/**
 * Format educational content — v2 format.
 * breakdown[] is a flat array (not wrapped in codecBreakdown).
 * streaming uses arrays of signaling variants (not single objects).
 * All text content escaped via escapeHtml().
 *
 * @param {Education} education
 * @param {string} codecString
 * @returns {string}
 */
function formatEducationContent(education, codecString) {
    let html = '';

    if (education.breakdown) {
        html += `
        <section class="education-section">
            <h4>Codec String Breakdown</h4>
            ${formatCodecBreakdown(education.breakdown, codecString)}
        </section>`;
    }

    if (education.overview) {
        html += `
        <section class="education-section">
            <h4>Overview</h4>
            <p>${escapeHtml(education.overview)}</p>
        </section>`;
    }

    if (education.objectAudio) {
        html += `
        <section class="education-section">
            <h4>Object Audio</h4>
            ${formatObjectAudio(education.objectAudio)}
        </section>`;
    }

    if (education.dvConfig) {
        html += `
        <section class="education-section">
            <h4>Dolby Vision Configuration</h4>
            ${formatDvConfig(education.dvConfig)}
        </section>`;
    }

    if (education.streaming) {
        html += `
        <section class="education-section">
            <h4>HLS/DASH Signaling</h4>
            ${formatStreamingExamples(education.streaming)}
        </section>`;
    }

    if (education.containerNotes) {
        html += `
        <section class="education-section">
            <h4>Container Notes</h4>
            ${formatContainerNotes(education.containerNotes)}
        </section>`;
    }

    if (education.platforms) {
        html += `
        <section class="education-section">
            <h4>Platform-Specific Notes</h4>
            ${formatPlatformNotes(education.platforms)}
        </section>`;
    }

    if (education.drm) {
        html += `
        <section class="education-section">
            <h4>DRM Notes</h4>
            ${formatDrmNotes(education.drm)}
        </section>`;
    }

    if (education.references) {
        html += `
        <section class="education-section">
            <h4>References</h4>
            ${formatReferences(education.references)}
        </section>`;
    }

    return html;
}

function formatCodecBreakdown(breakdown, codecString) {
    const tokensHtml = breakdown.map((part, i) => {
        const separator = i > 0 ? '<span class="breakdown-dot">.</span>' : '';
        return `${separator}<span class="breakdown-token" data-index="${i}">${escapeHtml(part.token)}</span>`;
    }).join('');

    const descriptionsHtml = breakdown.map(part =>
        `<div class="breakdown-row">
            <code class="breakdown-token-label">${escapeHtml(part.token)}</code>
            <span class="breakdown-meaning">${escapeHtml(part.meaning)}</span>
        </div>`
    ).join('');

    return `<div class="codec-breakdown">
        <div class="breakdown-string"><code>${tokensHtml}</code></div>
        <div class="breakdown-details">${descriptionsHtml}</div>
    </div>`;
}

function formatObjectAudio(oa) {
    let html = '<div class="object-audio-grid">';
    if (oa.base) html += `<div><strong>Base:</strong> ${escapeHtml(oa.base)}</div>`;
    if (oa.technology) html += `<div><strong>Technology:</strong> ${escapeHtml(oa.technology)}</div>`;
    if (oa.maxObjects) html += `<div><strong>Max Objects:</strong> ${oa.maxObjects}</div>`;
    if (oa.rendering) html += `<div><strong>Rendering:</strong> ${escapeHtml(oa.rendering)}</div>`;
    if (oa.bitrate) html += `<div><strong>Object Bitrate:</strong> ${(oa.bitrate / 1000)} kbps</div>`;
    html += '</div>';
    return html;
}

function formatDvConfig(dv) {
    let html = '<div class="dv-config-grid">';
    html += `<div><strong>Profile:</strong> ${dv.profile}</div>`;
    html += `<div><strong>Level:</strong> ${dv.level}</div>`;
    html += `<div><strong>RPU:</strong> ${dv.rpuPresent ? 'Yes' : 'No'}</div>`;
    html += `<div><strong>Enhancement Layer:</strong> ${dv.elPresent ? 'Yes' : 'No'}</div>`;
    html += `<div><strong>Base Layer:</strong> ${dv.blPresent ? 'Yes' : 'No'}</div>`;
    html += `<div><strong>BL Signal Compat:</strong> ${dv.blSignalCompat}</div>`;
    html += '</div>';
    return html;
}

/**
 * Format streaming signaling variations — v2 format uses arrays.
 */
function formatStreamingExamples(streaming) {
    let html = '';

    if (streaming.hls && streaming.hls.length > 0) {
        for (const variant of streaming.hls) {
            html += `
            <div class="streaming-example">
                <div class="streaming-format-label">
                    <span class="format-badge">HLS</span>
                    <span class="file-extension">${escapeHtml(variant.signal)}</span>
                </div>
                <pre><code>${escapeHtml(variant.m3u8)}</code></pre>
                ${variant.notes ? `<p class="streaming-notes">${escapeHtml(variant.notes)}</p>` : ''}
            </div>`;
        }
    }

    if (streaming.dash && streaming.dash.length > 0) {
        for (const variant of streaming.dash) {
            html += `
            <div class="streaming-example">
                <div class="streaming-format-label">
                    <span class="format-badge">DASH</span>
                    <span class="file-extension">${escapeHtml(variant.signal)}</span>
                </div>
                <pre><code>${escapeHtml(variant.mpd)}</code></pre>
                ${variant.notes ? `<p class="streaming-notes">${escapeHtml(variant.notes)}</p>` : ''}
            </div>`;
        }
    }

    return html;
}

function formatContainerNotes(notes) {
    let html = '<div class="container-notes-grid">';
    for (const [container, note] of Object.entries(notes)) {
        const displayName = CONTAINER_DISPLAY[container] || container.toUpperCase();
        html += `<div class="container-note"><strong>${escapeHtml(displayName)}:</strong> ${escapeHtml(note)}</div>`;
    }
    html += '</div>';
    return html;
}

function formatPlatformNotes(platforms) {
    const icons = { apple: '🍎', lg: '📺', android: '🤖', windows: '🪟', linux: '🐧' };
    let html = '<div class="platform-notes-grid">';

    for (const [platform, note] of Object.entries(platforms)) {
        const icon = icons[platform] || '💻';
        const name = platform.charAt(0).toUpperCase() + platform.slice(1);
        html += `
        <div class="platform-note">
            <div class="platform-header">
                <span class="platform-icon">${icon}</span>
                <strong>${escapeHtml(name)}</strong>
            </div>
            <p>${escapeHtml(note)}</p>
        </div>`;
    }

    html += '</div>';
    return html;
}

function formatDrmNotes(drm) {
    let html = '<div class="drm-notes-grid">';
    for (const [system, note] of Object.entries(drm)) {
        const name = system.charAt(0).toUpperCase() + system.slice(1);
        html += `<div class="drm-note"><strong>${escapeHtml(name)}:</strong> ${escapeHtml(note)}</div>`;
    }
    html += '</div>';
    return html;
}

function formatReferences(references) {
    let html = '<ul class="reference-list">';
    for (const ref of references) {
        if (ref.url) {
            html += `<li><a href="${escapeHtml(ref.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(ref.title)}</a></li>`;
        } else {
            html += `<li>${escapeHtml(ref.title)}</li>`;
        }
    }
    html += '</ul>';
    return html;
}


// ==================== EDUCATION TOGGLE ====================

function setupEducationToggle(button) {
    if (button.hasAttribute('data-initialized')) return;
    button.setAttribute('data-initialized', 'true');

    button.addEventListener('click', (e) => {
        e.stopPropagation();
        const content = button.nextElementSibling;
        const expanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', !expanded);
        content.hidden = expanded;
        const chevron = button.querySelector('.chevron-icon');
        if (chevron) {
            chevron.style.transform = expanded ? 'rotate(0deg)' : 'rotate(180deg)';
        }
        announceToScreenReader(`Educational content ${!expanded ? 'expanded' : 'collapsed'}`);
    });
}

export function setupEducationToggles() {
    document.querySelectorAll('.education-toggle').forEach(button => {
        setupEducationToggle(button);
    });
}


// ==================== CARD BUILDING ====================

/**
 * Generate flags HTML (nonstandard, deprecated, film-grain badges).
 */
function formatFlags(flags) {
    if (!flags || flags.length === 0) return '';
    return flags.map(flag => {
        const labels = {
            'nonstandard': 'Non-Standard',
            'deprecated': 'Deprecated',
            'film-grain': 'Film Grain'
        };
        return `<span class="flag-badge flag-${escapeHtml(flag)}">${escapeHtml(labels[flag] || flag)}</span>`;
    }).join('');
}

/**
 * Generate details section HTML for a codec card.
 * All content from internal codec database — safe for innerHTML.
 *
 * @param {CodecTestResult} codec
 * @param {boolean} isPending
 * @returns {string}
 */
function createDetailsHTML(codec, isPending) {
    if (isPending) {
        return `
            <div class="codec-string"><strong>Codec:</strong> <code>${escapeHtml(codec.codec)}</code></div>
            <p style="color: var(--text-dimmed); font-style: italic;">Test in progress...</p>
        `;
    }

    const copyData = buildCopyText(codec).replace(/"/g, '&quot;');
    let html = `
        <div class="codec-string">
            <strong>Codec:</strong> <code>${escapeHtml(codec.codec)}</code>
            <button class="copy-btn" data-copy="${copyData}" aria-label="Copy card result" title="Copy result to clipboard">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                </svg>
            </button>
        </div>
    `;

    if (codec.education) {
        html += `
            <div class="codec-education">
                <button class="education-toggle" aria-expanded="false" type="button">
                    <svg class="chevron-icon" width="16" height="16" viewBox="0 0 16 16">
                        <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    Learn More: Initialization & Platform Support
                </button>
                <div class="education-content" hidden>
                    ${formatEducationContent(codec.education, codec.codec)}
                </div>
            </div>
        `;
    }

    html += formatContainerResults(codec);
    return html;
}

function attachCopyHandler(container) {
    const copyBtn = container.querySelector('.copy-btn');
    if (!copyBtn) return;

    copyBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(copyBtn.dataset.copy);
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            copyBtn.classList.add('copied');
            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
                copyBtn.classList.remove('copied');
            }, 1500);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    });
}

function attachApiToggleHandler(container) {
    const summary = container.querySelector('.api-toggle-label');
    if (summary) {
        summary.addEventListener('click', (e) => e.stopPropagation());
    }
}

/**
 * Create a codec card DOM element.
 * One card = one codec record with all container results inside.
 * Content from internal codec database — safe for innerHTML.
 *
 * @param {CodecTestResult} codec
 * @param {string} groupKey
 * @param {boolean} isPending
 * @returns {HTMLDivElement}
 */
function createCardElement(codec, groupKey, isPending) {
    const item = document.createElement('div');
    const supportClass = isPending ? 'PENDING' : (codec.support === 'failed' ? 'FAILED' : codec.support.toUpperCase());
    item.className = `codec-item ${supportClass}`;
    item.setAttribute('data-group', groupKey);
    item.setAttribute('data-codec', codec.codec);
    item.setAttribute('data-name', codec.name);
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-expanded', 'false');
    item.setAttribute('aria-label', isPending
        ? `${codec.name} - Testing in progress`
        : `${codec.name} - ${codec.support}`);

    const specsStr = isPending ? '' : buildTechnicalSpecs(codec);
    const flagsHtml = formatFlags(codec.flags);

    // All content from internal codec database
    item.innerHTML = `
        <div class="codec-card-header">
            <div>
                <div class="codec-header-line">
                    <span class="codec-name">${escapeHtml(codec.name)}</span>
                    ${flagsHtml}
                    <span class="status-badge">${isPending ? 'PENDING' : codec.support.toUpperCase()}</span>
                </div>
                <div class="codec-summary">${escapeHtml(specsStr)}</div>
            </div>
            <svg class="codec-chevron" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
        <div class="codec-details">
            ${createDetailsHTML(codec, isPending)}
        </div>
    `;

    const handleToggle = (e) => {
        if (e.type === 'click' || e.key === 'Enter' || e.key === ' ') {
            if (e.key === ' ') e.preventDefault();
            item.classList.toggle('expanded');
            item.setAttribute('aria-expanded', item.classList.contains('expanded').toString());
        }
    };
    item.addEventListener('click', handleToggle);
    item.addEventListener('keydown', handleToggle);

    if (!isPending) {
        attachCopyHandler(item);
        attachApiToggleHandler(item);
        const eduToggle = item.querySelector('.education-toggle');
        if (eduToggle) setupEducationToggle(eduToggle);
    }

    return item;
}


// ==================== PENDING CARDS ====================

/**
 * Render all codec cards in PENDING state immediately.
 * Uses codecSource directly — group.type for section placement,
 * so MPEG-TS audio (video/mp2t MIME) stays in audio sections.
 */
export function renderPendingCards() {
    const grid = document.getElementById('codec-grid');
    grid.innerHTML = '';
    grid.style.display = 'grid';

    document.getElementById('loading').style.display = 'none';

    for (const [groupKey, group] of Object.entries(codecSource)) {
        if (group.codecs.length === 0) continue;

        const section = document.createElement('div');
        section.className = 'section';

        const sectionHeader = document.createElement('div');
        sectionHeader.className = 'section-header';
        sectionHeader.textContent = group.category;

        const countSpan = document.createElement('span');
        countSpan.className = 'support-count pending-count';
        countSpan.textContent = 'Testing...';
        sectionHeader.appendChild(countSpan);

        section.appendChild(sectionHeader);

        for (const record of group.codecs) {
            const pendingCodec = /** @type {CodecTestResult} */ ({ ...record, type: group.type, containers: {}, drm: null, support: 'unsupported' });
            section.appendChild(createCardElement(pendingCodec, groupKey, true));
        }

        grid.appendChild(section);
    }
}


// ==================== PROGRESSIVE UPDATE ====================

/**
 * @param {string} groupKey
 * @param {CodecTestResult} codecResult
 */
export function updateCardState(groupKey, codecResult) {
    const grid = document.getElementById('codec-grid');
    const allCards = grid.querySelectorAll(`.codec-item[data-group="${groupKey}"]`);
    const card = /** @type {HTMLElement | undefined} */ (Array.from(allCards).find(c => /** @type {HTMLElement} */ (c).dataset.name === codecResult.name));

    if (!card) {
        console.error('[UI] Card not found:', codecResult.name);
        return;
    }

    card.classList.remove('PENDING');
    card.classList.add(codecResult.support === 'failed' ? 'FAILED' : codecResult.support.toUpperCase());
    card.classList.add('state-transition');
    card.setAttribute('aria-label', `${codecResult.name} - ${codecResult.support}`);

    const badge = card.querySelector('.status-badge');
    if (badge) badge.textContent = codecResult.support.toUpperCase();

    const summary = card.querySelector('.codec-summary');
    if (summary) {
        const specsStr = buildTechnicalSpecs(codecResult);
        if (specsStr) summary.textContent = specsStr;
    }

    // Replace details with completed content
    const detailsDiv = card.querySelector('.codec-details');
    if (detailsDiv) {
        detailsDiv.innerHTML = createDetailsHTML(codecResult, false);
        attachCopyHandler(card);
        attachApiToggleHandler(card);
        const eduToggle = card.querySelector('.education-toggle');
        if (eduToggle) setupEducationToggle(eduToggle);
    }

    updateSectionCounts(groupKey);
    setTimeout(() => card.classList.remove('state-transition'), 500);
}


// ==================== SECTION COUNTS ====================

function updateSectionCount(section) {
    const cards = section.querySelectorAll('.codec-item');
    const total = cards.length;
    let supportedCount = 0;
    let pendingCount = 0;
    let failedCount = 0;

    cards.forEach(card => {
        if (card.classList.contains('SUPPORTED') || card.classList.contains('PROBABLY')) supportedCount++;
        else if (card.classList.contains('PENDING')) pendingCount++;
        else if (card.classList.contains('FAILED')) failedCount++;
    });

    const countSpan = section.querySelector('.support-count');
    if (!countSpan) return;

    if (pendingCount > 0) {
        countSpan.textContent = `${supportedCount} supported (${pendingCount} testing...)`;
        countSpan.classList.add('pending-count');
    } else {
        let text = `${supportedCount} / ${total} supported`;
        if (failedCount > 0) text += ` (${failedCount} failed)`;
        countSpan.textContent = text;
        countSpan.classList.remove('pending-count');
    }
}

function updateSectionCounts(groupKey) {
    const grid = document.getElementById('codec-grid');
    const section = Array.from(grid.querySelectorAll('.section')).find(s =>
        s.querySelector(`[data-group="${groupKey}"]`)
    );
    if (section) updateSectionCount(section);
}

export function updateAllSectionCounts() {
    const grid = document.getElementById('codec-grid');
    grid.querySelectorAll('.section').forEach(updateSectionCount);
}


// ==================== RENDER RESULTS (filter/search) ====================

/** @param {TestResults} results */
export function renderResults(results) {
    state.testResults = results;
    const grid = document.getElementById('codec-grid');
    grid.innerHTML = '';
    grid.style.display = 'grid';

    for (const [groupKey, group] of Object.entries(results.tests)) {
        const filteredCodecs = group.codecs.filter(codec => {
            if (state.currentFilter === 'supported' && codec.support !== 'supported' && codec.support !== 'probably') return false;
            if (state.currentFilter === 'video' && codec.type !== 'video') return false;
            if (state.currentFilter === 'audio' && codec.type !== 'audio') return false;

            if (state.searchQuery) {
                const query = state.searchQuery.toLowerCase();
                const containers = Object.keys(codec.containers || {}).join(' ');
                const searchText = `${codec.name} ${codec.codec} ${containers}`.toLowerCase();
                if (!searchText.includes(query)) return false;
            }

            return true;
        });

        if (filteredCodecs.length === 0) continue;

        const supportedCount = filteredCodecs.filter(c => c.support === 'supported' || c.support === 'probably').length;
        const failedCount = filteredCodecs.filter(c => c.support === 'failed').length;
        const totalCount = filteredCodecs.length;

        let countText = `${supportedCount} / ${totalCount} supported`;
        if (failedCount > 0) countText += ` (${failedCount} failed)`;

        const section = document.createElement('div');
        section.className = 'section';
        // Category from internal codec database
        section.innerHTML = `
            <div class="section-header">
                ${escapeHtml(group.category)}
                <span class="support-count">${countText}</span>
            </div>
        `;

        filteredCodecs.forEach(codec => {
            section.appendChild(createCardElement(codec, groupKey, false));
        });

        grid.appendChild(section);
    }

    document.getElementById('loading').style.display = 'none';
    setupEducationToggles();

    const totalCodecs = Object.values(results.tests).reduce((sum, group) =>
        sum + group.codecs.length, 0);
    announceToScreenReader(`Testing complete. ${totalCodecs} codecs tested. ${results.supported} fully supported.`);
}


// ==================== EXPAND/COLLAPSE ALL ====================

function toggleAllCards(expand) {
    const cards = document.querySelectorAll('.codec-item');
    const toggleBtn = document.getElementById('expand-toggle-btn');

    cards.forEach(card => {
        if (expand) {
            card.classList.add('expanded');
            card.setAttribute('aria-expanded', 'true');
        } else {
            card.classList.remove('expanded');
            card.setAttribute('aria-expanded', 'false');
        }
    });

    if (toggleBtn) {
        const icon = toggleBtn.querySelector('.btn-icon');
        const text = toggleBtn.querySelector('.btn-text');
        if (expand) {
            toggleBtn.setAttribute('aria-label', 'Collapse all codec cards');
            toggleBtn.setAttribute('data-expanded', 'true');
            if (icon) icon.textContent = '⊖';
            if (text) text.textContent = 'Collapse All';
        } else {
            toggleBtn.setAttribute('aria-label', 'Expand all codec cards');
            toggleBtn.setAttribute('data-expanded', 'false');
            if (icon) icon.textContent = '⊕';
            if (text) text.textContent = 'Expand All';
        }
    }
}


// ==================== FILTERS & SEARCH ====================

export function setupFilters() {
    const expandToggleBtn = document.getElementById('expand-toggle-btn');
    if (expandToggleBtn) {
        let allExpanded = false;
        const handleToggle = (e) => {
            if (e.type === 'click' || e.key === 'Enter' || e.key === ' ') {
                if (e.key === ' ') e.preventDefault();
                allExpanded = !allExpanded;
                toggleAllCards(allExpanded);
            }
        };
        expandToggleBtn.addEventListener('click', handleToggle);
        expandToggleBtn.addEventListener('keydown', handleToggle);

        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'e') {
                e.preventDefault();
                allExpanded = !allExpanded;
                toggleAllCards(allExpanded);
            }
        });
    }

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.setAttribute('tabindex', '0');
        const handleActivation = (e) => {
            if (e.type === 'click' || e.key === 'Enter' || e.key === ' ') {
                if (e.key === ' ') e.preventDefault();
                document.querySelectorAll('.filter-btn').forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
                state.currentFilter = /** @type {HTMLElement} */ (btn).dataset.filter || 'all';
                updateURLState(state.currentFilter, state.searchQuery);
                if (state.testResults) renderResults(state.testResults);
            }
        };
        btn.addEventListener('click', handleActivation);
        btn.addEventListener('keydown', handleActivation);
    });

    const searchInput = /** @type {HTMLInputElement | null} */ (document.getElementById('search-input'));
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            state.searchQuery = searchInput.value;
            updateURLState(state.currentFilter, state.searchQuery);
            if (state.testResults) renderResults(state.testResults);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && /** @type {HTMLElement} */ (e.target).tagName !== 'INPUT') {
                e.preventDefault();
                searchInput.focus();
            }
            if (e.key === 'Escape' && document.activeElement === searchInput) {
                searchInput.value = '';
                state.searchQuery = '';
                if (state.testResults) renderResults(state.testResults);
            }
        });
    }
}


// ==================== EXPORT ====================

async function exportResults() {
    if (!state.testResults) {
        alert('No test results available to export');
        return;
    }

    const deviceInfo = await detectDeviceInfo();
    const exportData = {
        timestamp: new Date().toISOString(),
        device: deviceInfo,
        summary: {
            supported: state.testResults.supported,
            unsupported: state.testResults.unsupported,
            failed: state.testResults.failed,
            testDuration: state.testResults.testDuration
        },
        codecs: state.testResults.tests
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codec-report-${deviceInfo.os}-${deviceInfo.browser}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

export function setupExport() {
    const exportBtn = document.getElementById('export-btn');
    exportBtn.setAttribute('tabindex', '0');
    const handleExport = (e) => {
        if (e.type === 'click' || e.key === 'Enter' || e.key === ' ') {
            if (e.key === ' ') e.preventDefault();
            exportResults();
        }
    };
    exportBtn.addEventListener('click', handleExport);
    exportBtn.addEventListener('keydown', handleExport);
}
