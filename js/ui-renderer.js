/**
 * UI Renderer Module
 *
 * Handles rendering of device info and codec test results
 */

const state = {
    currentFilter: 'all',
    testResults: null,
    searchQuery: ''
};

/**
 * Announce message to screen readers
 * @param {string} message - Message to announce
 */
function announceToScreenReader(message) {
    const announcer = document.getElementById('sr-announcements');
    if (announcer) {
        announcer.textContent = message;
        // Clear after announcement
        setTimeout(() => {
            announcer.textContent = '';
        }, 1000);
    }
}

/**
 * Render device information header and grid
 * @param {Object} info - Device info object from detectDeviceInfo()
 */
function renderDeviceInfo(info) {
    const header = document.getElementById('device-info-summary');
    const grid = document.getElementById('device-info-grid');

    if (!header || !grid) return;

    // Header summary with engine info
    let headerText = `${info.browser} ${info.browserVersion} • ${info.engine} • ${info.os} ${info.osVersion}`;
    if (info.deviceModel && info.deviceModel !== 'Unknown') {
        headerText += ` • ${info.deviceModel}`;
    }
    headerText += ` • ${info.screenWidth}×${info.screenHeight}`;
    if (info.screenHDR) {
        headerText += ` • <span>HDR Display</span>`;
    }
    // Note: header content is from internal device detection, not user input - safe for innerHTML
    header.innerHTML = headerText;

    // API availability indicators (data from internal API detection, not user input)
    const apiBox = document.getElementById('api-availability');
    if (apiBox) {
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

    // Detailed grid (all values from internal device detection)
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

    // DRM info
    if (info.drm) {
        if (info.drm.timedOut) {
            gridHTML += `
                <div class="device-info-item">
                    <div class="device-info-label">DRM/EME Support</div>
                    <div class="device-info-value" style="color: var(--orange);">Testing...</div>
                </div>
            `;
        } else if (info.drm.emeAvailable) {
            const supportedDRM = Object.values(info.drm.systems)
                .filter(s => s.supported)
                .map(s => {
                    const level = s.details?.securityLevel || '';
                    return `${s.name}${level ? ` (${level})` : ''}`;
                });

            if (supportedDRM.length > 0) {
                gridHTML += `
                    <div class="device-info-item highlight">
                        <div class="device-info-label">DRM/EME Support</div>
                        <div class="device-info-value">${supportedDRM.join(', ')}</div>
                    </div>
                `;
            } else {
                gridHTML += `
                    <div class="device-info-item">
                        <div class="device-info-label">DRM/EME Support</div>
                        <div class="device-info-value" style="color: var(--text-dimmed);">None</div>
                    </div>
                `;
            }
        } else {
            gridHTML += `
                <div class="device-info-item">
                    <div class="device-info-label">DRM/EME Support</div>
                    <div class="device-info-value" style="color: var(--text-dimmed);">Not available</div>
                </div>
            `;
        }
    }

    grid.innerHTML = gridHTML;
}

/**
 * Format API results for display
 * @param {Object} codec - Codec result object
 * @returns {string} HTML string
 */
function formatApiResults(codec) {
    let html = '<div class="api-results">';
    html += '<div class="api-section-title">API Test Results</div>';

    // API 1: canPlayType
    html += `
        <div class="api-test-block">
            <div class="api-test-header">
                <span class="api-number ${getApiBadgeClass('canPlayType', codec.apis.canPlayType)}">1</span>
                <span class="api-name">HTMLMediaElement.canPlayType()</span>
            </div>
            <div class="api-test-content">
                <div class="api-request">
                    <strong>Request:</strong>
                    <code>${codec.codec}</code>
                </div>
                <div class="api-response">
                    <strong>Response:</strong>
                    <span class="response-value ${getResponseClass(codec.apis.canPlayType)}">${codec.apis.canPlayType || '""'}</span>
                </div>
                <div class="api-explanation">
                    Tests basic container format compatibility. Returns "probably", "maybe", or "" (empty string).
                </div>
            </div>
        </div>
    `;

    // API 2: isTypeSupported
    html += `
        <div class="api-test-block">
            <div class="api-test-header">
                <span class="api-number ${getApiBadgeClass('isTypeSupported', codec.apis.isTypeSupported)}">2</span>
                <span class="api-name">MediaSource.isTypeSupported()</span>
            </div>
            <div class="api-test-content">
                <div class="api-request">
                    <strong>Request:</strong>
                    <code>${codec.codec}</code>
                </div>
                <div class="api-response">
                    <strong>Response:</strong>
                    <span class="response-value ${codec.apis.isTypeSupported === 'probably' ? 'success' : 'fail'}">${codec.apis.isTypeSupported}</span>
                </div>
                <div class="api-explanation">
                    Tests Media Source Extensions (MSE) support for adaptive streaming. Returns "probably" or "unsupported".
                </div>
            </div>
        </div>
    `;

    // API 3: mediaCapabilities
    if (codec.apis.mediaCapabilities) {
        const mc = codec.apis.mediaCapabilities;

        html += `
            <div class="api-test-block">
                <div class="api-test-header">
                    <span class="api-number ${getApiBadgeClass('mediaCapabilities', codec.apis.mediaCapabilities)}">3</span>
                    <span class="api-name">navigator.mediaCapabilities.decodingInfo()</span>
                </div>
                <div class="api-test-content">
                    <div class="api-request">
                        <strong>Request:</strong>
                        <pre class="config-json">${buildMediaConfigDisplay(codec)}</pre>
                    </div>
                    <div class="api-response">
                        <strong>Response:</strong>
                        ${mc.error ? `<span class="response-value fail">Error: ${mc.error}</span>` : `
                        <div class="capability-grid">
                            <div class="capability-item">
                                <span class="capability-label">Supported:</span>
                                <span class="response-value ${mc.supported ? 'success' : 'fail'}">${mc.supported ? 'Yes' : 'No'}</span>
                            </div>
                            <div class="capability-item">
                                <span class="capability-label">Smooth Playback:</span>
                                <span class="response-value ${mc.smooth ? 'success' : 'fail'}">${mc.smooth ? 'Yes' : 'No'}</span>
                            </div>
                            <div class="capability-item">
                                <span class="capability-label">Power Efficient:</span>
                                <span class="response-value ${mc.powerEfficient ? 'success' : 'fail'}">${mc.powerEfficient ? 'Yes' : 'No'}</span>
                            </div>
                        </div>
                        `}
                    </div>
                    <div class="api-explanation">
                        Tests actual hardware decoding capabilities including performance and power efficiency.
                    </div>
                </div>
            </div>
        `;
    }

    // Spatial rendering for audio
    if (codec.apis.mediaCapabilitiesSpatial) {
        const mcs = codec.apis.mediaCapabilitiesSpatial;

        html += `
            <div class="api-test-block">
                <div class="api-test-header">
                    <span class="api-number ${getApiBadgeClass('mediaCapabilitiesSpatial', codec.apis.mediaCapabilitiesSpatial)}">3b</span>
                    <span class="api-name">Spatial Audio Rendering Test</span>
                </div>
                <div class="api-test-content">
                    <div class="api-request">
                        <strong>Request:</strong>
                        <code>spatialRendering: true</code>
                    </div>
                    <div class="api-response">
                        <strong>Response:</strong>
                        ${mcs.error ? `<span class="response-value fail">Error: ${mcs.error}</span>` : `
                        <div class="capability-grid">
                            <div class="capability-item">
                                <span class="capability-label">Supported:</span>
                                <span class="response-value ${mcs.supported ? 'success' : 'fail'}">${mcs.supported ? 'Yes' : 'No'}</span>
                            </div>
                            <div class="capability-item">
                                <span class="capability-label">Smooth:</span>
                                <span class="response-value ${mcs.smooth ? 'success' : 'fail'}">${mcs.smooth ? 'Yes' : 'No'}</span>
                            </div>
                            <div class="capability-item">
                                <span class="capability-label">Efficient:</span>
                                <span class="response-value ${mcs.powerEfficient ? 'success' : 'fail'}">${mcs.powerEfficient ? 'Yes' : 'No'}</span>
                            </div>
                        </div>
                        `}
                    </div>
                    <div class="api-explanation">
                        Tests multi-channel spatial audio rendering (surround sound, Atmos, etc).
                    </div>
                </div>
            </div>
        `;
    }

    html += '</div>';
    return html;
}

/**
 * Escape HTML entities for safe rendering
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Format educational content section
 * @param {Object} education - Education object from codec definition
 * @returns {string} HTML string
 */
function formatEducationContent(education) {
    let html = '';

    // Overview section
    if (education.overview) {
        html += `
        <section class="education-section">
            <h4>Overview</h4>
            <p>${education.overview}</p>
        </section>`;
    }

    // Streaming initialization
    if (education.streaming) {
        html += `
        <section class="education-section">
            <h4>HLS/DASH Initialization</h4>
            ${formatStreamingExamples(education.streaming)}
        </section>`;
    }

    // Platform notes
    if (education.platforms) {
        html += `
        <section class="education-section">
            <h4>Platform-Specific Notes</h4>
            ${formatPlatformNotes(education.platforms)}
        </section>`;
    }

    return html;
}

/**
 * Format streaming initialization examples
 * @param {Object} streaming - Streaming object with HLS/DASH examples
 * @returns {string} HTML string
 */
function formatStreamingExamples(streaming) {
    let html = '';

    if (streaming.hls) {
        html += `
        <div class="streaming-example">
            <div class="streaming-format-label">
                <span class="format-badge">HLS</span>
                <span class="file-extension">.m3u8 master playlist</span>
            </div>
            <pre><code>${escapeHtml(streaming.hls.m3u8)}</code></pre>
            ${streaming.hls.notes ? `<p class="streaming-notes">${streaming.hls.notes}</p>` : ''}
        </div>`;
    }

    if (streaming.dash) {
        html += `
        <div class="streaming-example">
            <div class="streaming-format-label">
                <span class="format-badge">DASH</span>
                <span class="file-extension">.mpd manifest</span>
            </div>
            <pre><code>${escapeHtml(streaming.dash.mpd)}</code></pre>
            ${streaming.dash.notes ? `<p class="streaming-notes">${streaming.dash.notes}</p>` : ''}
        </div>`;
    }

    return html;
}

/**
 * Format platform-specific implementation notes
 * @param {Object} platforms - Platform notes object
 * @returns {string} HTML string
 */
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
                <strong>${name}</strong>
            </div>
            <p>${note}</p>
        </div>`;
    }

    html += '</div>';
    return html;
}

/**
 * Setup event listener for a single education toggle
 */
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

/**
 * Setup event listeners for all educational content toggles
 */
function setupEducationToggles() {
    document.querySelectorAll('.education-toggle').forEach(button => {
        setupEducationToggle(button);
    });
}

function getResponseClass(value) {
    if (value === 'probably') return 'success';
    if (value === 'maybe') return 'partial';
    return 'fail';
}

/**
 * Determine CSS class for API badge based on result
 * @param {string} apiName - Name of the API
 * @param {*} apiData - API result data
 * @returns {string} CSS class name ('success', 'partial', or 'fail')
 */
function getApiBadgeClass(apiName, apiData) {
    if (!apiData || apiData === 'error') return 'fail';

    switch(apiName) {
        case 'canPlayType':
            if (apiData === 'probably') return 'success';
            if (apiData === 'maybe') return 'partial';
            return 'fail';

        case 'isTypeSupported':
            return apiData === 'probably' ? 'success' : 'fail';

        case 'mediaCapabilities':
        case 'mediaCapabilitiesSpatial':
            if (apiData.error) return 'fail';
            if (apiData.supported) return 'success';
            if (apiData.smooth || apiData.powerEfficient) return 'partial';
            return 'fail';

        default:
            return 'fail';
    }
}

function buildMediaConfigDisplay(codec) {
    if (!codec.mediaConfig) {
        return JSON.stringify({ type: 'file', [codec.type]: { contentType: codec.codec } }, null, 2);
    }

    return JSON.stringify(codec.mediaConfig, null, 2);
}

function buildTechnicalSpecs(codec) {
    if (!codec.mediaConfig) return '';

    const specs = [];
    const config = codec.mediaConfig.video || codec.mediaConfig.audio;

    if (!config) return '';

    // Resolution
    if (config.width && config.height) {
        specs.push(`${config.width}×${config.height}`);
    }

    // Framerate
    if (config.framerate) {
        specs.push(`${config.framerate}fps`);
    }

    // Bitrate
    if (config.bitrate) {
        const mbps = (config.bitrate / 1000000).toFixed(1);
        specs.push(`${mbps}Mbps`);
    }

    // HDR metadata
    if (config.transferFunction === 'pq') {
        specs.push('HDR10/PQ');
    } else if (config.transferFunction === 'hlg') {
        specs.push('HLG');
    }

    if (config.colorGamut === 'rec2020') {
        specs.push('BT.2020');
    }

    // Audio-specific
    if (config.channels) {
        specs.push(`${config.channels}ch`);
    }

    if (config.samplerate) {
        const khz = (config.samplerate / 1000).toFixed(1);
        specs.push(`${khz}kHz`);
    }

    if (specs.length === 0) return '';

    return `<div class="technical-specs">${specs.join(' • ')}</div>`;
}

/**
 * Render all codec cards in PENDING state immediately
 */
function renderPendingCards() {
    const grid = document.getElementById('codec-grid');
    grid.innerHTML = '';
    grid.style.display = 'grid';

    document.getElementById('loading').style.display = 'none';

    for (const [groupKey, group] of Object.entries(codecDatabase)) {
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

        const type = groupKey.startsWith('audio_') ? 'audio' : 'video';

        group.tests.forEach(test => {
            const item = createPendingCard(groupKey, test, type);
            section.appendChild(item);
        });

        grid.appendChild(section);
    }

    console.log('[UI] Rendered all cards in PENDING state');
}

/**
 * Create a single pending card
 */
function createPendingCard(groupKey, test, type) {
    const item = document.createElement('div');
    item.className = 'codec-item PENDING';
    item.setAttribute('data-group', groupKey);
    item.setAttribute('data-codec', test.codec);
    item.setAttribute('data-name', test.name);
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-expanded', 'false');
    item.setAttribute('aria-label', `${test.name} - Testing in progress`);

    const header = document.createElement('div');
    header.className = 'codec-card-header';

    const headerContent = document.createElement('div');

    const badge = document.createElement('span');
    badge.className = 'status-badge';
    badge.textContent = 'PENDING';

    const name = document.createElement('span');
    name.className = 'codec-name';
    name.textContent = test.name;

    const containerBadge = document.createElement('span');
    containerBadge.className = 'platform-badge';
    containerBadge.textContent = test.container;
    name.appendChild(containerBadge);

    const summary = document.createElement('div');
    summary.className = 'codec-summary';
    summary.textContent = test.info;

    headerContent.appendChild(badge);
    headerContent.appendChild(name);
    headerContent.appendChild(summary);

    const chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    chevron.setAttribute('class', 'codec-chevron');
    chevron.setAttribute('width', '20');
    chevron.setAttribute('height', '20');
    chevron.setAttribute('viewBox', '0 0 20 20');
    chevron.setAttribute('fill', 'none');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M5 7.5L10 12.5L15 7.5');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    chevron.appendChild(path);

    header.appendChild(headerContent);
    header.appendChild(chevron);

    const details = document.createElement('div');
    details.className = 'codec-details';

    const codecString = document.createElement('div');
    codecString.className = 'codec-string';
    const strong = document.createElement('strong');
    strong.textContent = 'MIME Type: ';
    codecString.appendChild(strong);
    codecString.appendChild(document.createTextNode(test.codec));

    const pendingMsg = document.createElement('p');
    pendingMsg.style.color = 'var(--text-dimmed)';
    pendingMsg.style.fontStyle = 'italic';
    pendingMsg.textContent = 'Test in progress...';

    details.appendChild(codecString);
    details.appendChild(pendingMsg);

    item.appendChild(header);
    item.appendChild(details);

    const handleToggle = (e) => {
        // Allow expanding even when PENDING to see what's happening
        if (e.type === 'click' || e.key === 'Enter' || e.key === ' ') {
            if (e.key === ' ') e.preventDefault();
            item.classList.toggle('expanded');
            const isExpanded = item.classList.contains('expanded');
            item.setAttribute('aria-expanded', isExpanded.toString());
        }
    };

    item.addEventListener('click', handleToggle);
    item.addEventListener('keydown', handleToggle);

    return item;
}

/**
 * Update a specific card with test results
 */
function updateCardState(groupKey, codecResult) {
    const grid = document.getElementById('codec-grid');

    // Find card by data-name (unique) within the group
    const allCards = grid.querySelectorAll(`.codec-item[data-group="${groupKey}"]`);
    const card = Array.from(allCards).find(c => c.dataset.name === codecResult.name);

    if (!card) {
        console.error('[UI] Card not found for update:', {
            groupKey,
            name: codecResult.name,
            availableCards: allCards.length
        });
        return;
    }

    card.classList.remove('PENDING');

    if (codecResult.support === 'failed') {
        card.classList.add('FAILED');
    } else {
        card.classList.add(codecResult.support.toUpperCase());
    }

    card.classList.add('state-transition');
    card.setAttribute('aria-label', `${codecResult.name} - ${codecResult.support}`);

    const badge = card.querySelector('.status-badge');
    if (badge) {
        badge.textContent = codecResult.support.toUpperCase();
    }

    const detailsDiv = card.querySelector('.codec-details');
    if (detailsDiv) {
        detailsDiv.textContent = '';

        const codecStringDiv = document.createElement('div');
        codecStringDiv.className = 'codec-string';
        const strong = document.createElement('strong');
        strong.textContent = 'MIME Type: ';
        codecStringDiv.appendChild(strong);
        codecStringDiv.appendChild(document.createTextNode(codecResult.codec));

        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.setAttribute('data-copy', codecResult.codec);
        copyBtn.setAttribute('aria-label', 'Copy MIME type');
        copyBtn.setAttribute('title', 'Copy to clipboard');
        copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path></svg>';

        copyBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
                await navigator.clipboard.writeText(codecResult.codec);
                const originalHTML = copyBtn.innerHTML;
                copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                copyBtn.classList.add('copied');
                setTimeout(() => {
                    copyBtn.innerHTML = originalHTML;
                    copyBtn.classList.remove('copied');
                }, 1500);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        });

        codecStringDiv.appendChild(copyBtn);
        detailsDiv.appendChild(codecStringDiv);

        if (codecResult.education) {
            const eduDiv = document.createElement('div');
            eduDiv.className = 'codec-education';
            eduDiv.innerHTML = `
                <button class="education-toggle" aria-expanded="false" type="button">
                    <svg class="chevron-icon" width="16" height="16" viewBox="0 0 16 16">
                        <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    Learn More: Initialization & Platform Support
                </button>
                <div class="education-content" hidden>
                    ${formatEducationContent(codecResult.education)}
                </div>
            `;
            detailsDiv.appendChild(eduDiv);
        }

        const apiDiv = document.createElement('div');
        apiDiv.innerHTML = formatApiResults(codecResult);
        detailsDiv.appendChild(apiDiv);
    }

    updateSectionCounts(groupKey);

    // Setup education toggle for this card
    const eduToggle = card.querySelector('.education-toggle');
    if (eduToggle) {
        setupEducationToggle(eduToggle);
    }

    setTimeout(() => {
        card.classList.remove('state-transition');
    }, 500);
}

/**
 * Update counter for a single section element
 */
function updateSectionCount(section) {
    const cards = section.querySelectorAll('.codec-item');
    const total = cards.length;
    let supportedCount = 0;
    let pendingCount = 0;
    let failedCount = 0;

    cards.forEach(card => {
        if (card.classList.contains('SUPPORTED') || card.classList.contains('PROBABLY')) {
            supportedCount++;
        } else if (card.classList.contains('PENDING')) {
            pendingCount++;
        } else if (card.classList.contains('FAILED')) {
            failedCount++;
        }
    });

    const countSpan = section.querySelector('.support-count');
    if (!countSpan) return;

    if (pendingCount > 0) {
        countSpan.textContent = `${supportedCount} supported (${pendingCount} testing...)`;
        countSpan.classList.add('pending-count');
    } else {
        let text = `${supportedCount} / ${total} supported`;
        if (failedCount > 0) {
            text += ` (${failedCount} failed)`;
        }
        countSpan.textContent = text;
        countSpan.classList.remove('pending-count');
    }
}

/**
 * Update section header counts as tests complete
 */
function updateSectionCounts(groupKey) {
    const grid = document.getElementById('codec-grid');
    const section = Array.from(grid.querySelectorAll('.section')).find(s =>
        s.querySelector(`[data-group="${groupKey}"]`)
    );
    if (section) updateSectionCount(section);
}

/**
 * Update ALL section counts (called after force cleanup or bulk updates)
 */
function updateAllSectionCounts() {
    const grid = document.getElementById('codec-grid');
    grid.querySelectorAll('.section').forEach(updateSectionCount);
}

// Export for use in main.js
window.updateAllSectionCounts = updateAllSectionCounts;

/**
 * Render codec test results
 * @param {Object} results - Test results from runCodecTests()
 */
function renderResults(results) {
    state.testResults = results;
    const grid = document.getElementById('codec-grid');
    grid.innerHTML = '';
    grid.style.display = 'grid';

    for (const [groupKey, group] of Object.entries(results.tests)) {
        // Apply filter and search
        const filteredCodecs = group.codecs.filter(codec => {
            // Filter type
            if (state.currentFilter === 'supported' && codec.support !== 'supported' && codec.support !== 'probably') return false;
            if (state.currentFilter === 'video' && codec.type !== 'video') return false;
            if (state.currentFilter === 'audio' && codec.type !== 'audio') return false;

            // Search
            if (state.searchQuery) {
                const query = state.searchQuery.toLowerCase();
                const searchText = `${codec.name} ${codec.codec} ${codec.info} ${codec.container}`.toLowerCase();
                if (!searchText.includes(query)) return false;
            }

            return true;
        });

        if (filteredCodecs.length === 0) continue;

        // Count support levels
        const supportedCount = filteredCodecs.filter(c => c.support === 'supported' || c.support === 'probably').length;
        const failedCount = filteredCodecs.filter(c => c.support === 'failed').length;
        const totalCount = filteredCodecs.length;

        let countText = `${supportedCount} / ${totalCount} supported`;
        if (failedCount > 0) countText += ` (${failedCount} failed)`;

        // Create section (all data from internal codec database, not user input)
        const section = document.createElement('div');
        section.className = 'section';
        section.innerHTML = `
            <div class="section-header">
                ${group.category}
                <span class="support-count">${countText}</span>
            </div>
        `;

        // Add codec items
        filteredCodecs.forEach(codec => {
            const item = document.createElement('div');
            item.className = `codec-item ${codec.support.toUpperCase()}`;
            item.setAttribute('tabindex', '0');
            item.setAttribute('role', 'button');
            item.setAttribute('aria-expanded', 'false');
            item.setAttribute('aria-label', `${codec.name} - Click to see details`);

            item.innerHTML = `
                <div class="codec-card-header">
                    <div>
                        <span class="status-badge">${codec.support.toUpperCase()}</span>
                        <span class="codec-name">${codec.name}
                            <span class="platform-badge">${codec.container}</span>
                        </span>
                        <div class="codec-summary">${codec.info}</div>
                        ${buildTechnicalSpecs(codec)}
                    </div>
                    <svg class="codec-chevron" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <div class="codec-details">
                    <div class="codec-string">
                        <strong>MIME Type:</strong> ${codec.codec}
                        <button class="copy-btn" data-copy="${codec.codec}" aria-label="Copy MIME type" title="Copy to clipboard">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                            </svg>
                        </button>
                    </div>
                    ${codec.education ? `
                    <div class="codec-education">
                        <button class="education-toggle" aria-expanded="false" type="button">
                            <svg class="chevron-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Learn More: Initialization & Platform Support
                        </button>
                        <div class="education-content" hidden>
                            ${formatEducationContent(codec.education)}
                        </div>
                    </div>
                    ` : ''}
                    ${formatApiResults(codec)}
                </div>
            `;

            // Toggle details on click
            const handleToggle = (e) => {
                if (e.type === 'click' || e.key === 'Enter' || e.key === ' ') {
                    if (e.key === ' ') e.preventDefault();
                    item.classList.toggle('expanded');
                    const isExpanded = item.classList.contains('expanded');
                    item.setAttribute('aria-expanded', isExpanded.toString());

                    // Announce to screen readers
                    announceToScreenReader(`${codec.name} details ${isExpanded ? 'expanded' : 'collapsed'}`);

                    console.log('[UI] Codec card toggled:', codec.name, isExpanded);
                }
            };

            item.addEventListener('click', handleToggle);
            item.addEventListener('keydown', handleToggle);

            // Setup copy button (prevent card toggle on button click)
            const copyBtn = item.querySelector('.copy-btn');
            if (copyBtn) {
                copyBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const dataToCopy = copyBtn.dataset.copy;

                    try {
                        await navigator.clipboard.writeText(dataToCopy);

                        // Visual feedback
                        const originalHTML = copyBtn.innerHTML;
                        copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                        copyBtn.classList.add('copied');

                        setTimeout(() => {
                            copyBtn.innerHTML = originalHTML;
                            copyBtn.classList.remove('copied');
                        }, 2000);
                    } catch (err) {
                        console.error('[UI] Copy failed:', err);
                        const originalHTML = copyBtn.innerHTML;
                        copyBtn.textContent = 'Failed';
                        setTimeout(() => {
                            copyBtn.innerHTML = originalHTML;
                        }, 2000);
                    }
                });
            }

            section.appendChild(item);
        });

        grid.appendChild(section);
    }

    // Hide loading indicator
    document.getElementById('loading').style.display = 'none';

    // Setup educational content toggles
    setupEducationToggles();

    // Announce completion
    const totalCodecs = Object.values(results.tests).reduce((sum, group) =>
        sum + group.codecs.length, 0);
    announceToScreenReader(`Testing complete. ${totalCodecs} codecs tested. ${results.supported} fully supported.`);
}

/**
 * Toggle all codec cards expanded/collapsed
 */
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

    // Update button state
    if (toggleBtn) {
        const icon = toggleBtn.querySelector('svg');
        const text = toggleBtn.querySelector('span');

        if (expand) {
            toggleBtn.setAttribute('aria-label', 'Collapse all codec cards');
            toggleBtn.setAttribute('title', 'Collapse All (Ctrl+E)');
            text.textContent = 'Collapse All';
            icon.innerHTML = '<polyline points="17 11 12 6 7 11"></polyline><polyline points="17 18 12 13 7 18"></polyline>';
        } else {
            toggleBtn.setAttribute('aria-label', 'Expand all codec cards');
            toggleBtn.setAttribute('title', 'Expand All (Ctrl+E)');
            text.textContent = 'Expand All';
            icon.innerHTML = '<polyline points="7 13 12 18 17 13"></polyline><polyline points="7 6 12 11 17 6"></polyline>';
        }
    }
}

/**
 * Setup filter buttons and search
 */
function setupFilters() {
    console.log('[UI] Setting up filter buttons...');

    // Setup expand/collapse toggle
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

        // Keyboard shortcut: Ctrl+E
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'e') {
                e.preventDefault();
                allExpanded = !allExpanded;
                toggleAllCards(allExpanded);
            }
        });
    }
    document.querySelectorAll('.filter-btn').forEach(btn => {
        // Make buttons keyboard/remote accessible
        btn.setAttribute('tabindex', '0');

        const handleActivation = (e) => {
            // Support both click and Enter/Space for webOS remote
            if (e.type === 'click' || e.key === 'Enter' || e.key === ' ') {
                if (e.key === ' ') e.preventDefault();

                console.log('[UI] Filter button activated:', btn.dataset.filter);

                document.querySelectorAll('.filter-btn').forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
                state.currentFilter = btn.dataset.filter;

                // Update URL
                updateURLState(state.currentFilter, state.searchQuery);

                if (state.testResults) {
                    renderResults(state.testResults);
                }
            }
        };

        btn.addEventListener('click', handleActivation);
        btn.addEventListener('keydown', handleActivation);
    });

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            state.searchQuery = e.target.value;

            // Update URL
            updateURLState(state.currentFilter, state.searchQuery);

            if (state.testResults) {
                renderResults(state.testResults);
            }
        });

        // Keyboard shortcut: / to focus search
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && e.target.tagName !== 'INPUT') {
                e.preventDefault();
                searchInput.focus();
            }
            // Escape to clear search
            if (e.key === 'Escape' && document.activeElement === searchInput) {
                searchInput.value = '';
                state.searchQuery = '';
                if (state.testResults) {
                    renderResults(state.testResults);
                }
            }
        });
    }
}

/**
 * Export results to JSON file
 */
function exportResults() {
    if (!state.testResults) {
        alert('No test results available to export');
        return;
    }

    const deviceInfo = detectDeviceInfo();
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

/**
 * Setup export button
 */
function setupExport() {
    const exportBtn = document.getElementById('export-btn');
    exportBtn.setAttribute('tabindex', '0');

    const handleExport = (e) => {
        if (e.type === 'click' || e.key === 'Enter' || e.key === ' ') {
            if (e.key === ' ') e.preventDefault();
            console.log('[UI] Export button activated');
            exportResults();
        }
    };

    exportBtn.addEventListener('click', handleExport);
    exportBtn.addEventListener('keydown', handleExport);
}

// Track expand/collapse state
const expandCollapseState = {
    expandedCards: new Set()
};

/**
 * Expand all codec cards
 */
function expandAllCards() {
    const cards = document.querySelectorAll('.codec-item');
    cards.forEach(card => {
        if (!card.classList.contains('expanded')) {
            card.classList.add('expanded');
            card.setAttribute('aria-expanded', 'true');

            expandCollapseState.expandedCards.add(card.dataset.codec);
        }
    });

    console.log('[UI] Expanded all cards');
}

/**
 * Collapse all codec cards
 */
function collapseAllCards() {
    const cards = document.querySelectorAll('.codec-item');
    cards.forEach(card => {
        if (card.classList.contains('expanded')) {
            card.classList.remove('expanded');
            card.setAttribute('aria-expanded', 'false');

            expandCollapseState.expandedCards.delete(card.dataset.codec);
        }
    });

    console.log('[UI] Collapsed all cards');
}

// Export functions
window.expandAllCards = expandAllCards;
window.collapseAllCards = collapseAllCards;
