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

    // Header summary
    let headerText = `${info.browser} ${info.browserVersion} • ${info.os} ${info.osVersion}`;
    if (info.deviceModel) {
        headerText += ` • ${info.deviceModel}`;
    }
    headerText += ` • ${info.screenWidth}×${info.screenHeight}`;
    if (info.screenHDR) {
        headerText += ` • <span>HDR Display</span>`;
    }
    header.innerHTML = headerText;

    // Detailed grid
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
        <div class="device-info-item">
            <div class="device-info-label">canPlayType</div>
            <div class="device-info-value">${info.apiSupport.canPlayType ? 'YES' : 'NO'}</div>
        </div>
        <div class="device-info-item">
            <div class="device-info-label">isTypeSupported</div>
            <div class="device-info-value">${info.apiSupport.isTypeSupported ? 'YES' : 'NO'}</div>
        </div>
        <div class="device-info-item">
            <div class="device-info-label">mediaCapabilities</div>
            <div class="device-info-value">${info.apiSupport.mediaCapabilities ? 'YES' : 'NO'}</div>
        </div>
    `;

    // DRM info
    if (info.drm) {
        if (info.drm.timedOut) {
            gridHTML += `
                <div class="device-info-item full-width">
                    <div class="device-info-label">DRM/EME Support</div>
                    <div class="device-info-value" style="color: var(--orange);">Testing (may take a few seconds...)</div>
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
                    <div class="device-info-item full-width highlight">
                        <div class="device-info-label">DRM/EME Support</div>
                        <div class="device-info-value">${supportedDRM.join(' • ')}</div>
                    </div>
                `;
            } else {
                gridHTML += `
                    <div class="device-info-item full-width">
                        <div class="device-info-label">DRM/EME Support</div>
                        <div class="device-info-value" style="color: var(--text-dimmed);">No DRM systems detected</div>
                    </div>
                `;
            }
        } else {
            gridHTML += `
                <div class="device-info-item full-width">
                    <div class="device-info-label">DRM/EME Support</div>
                    <div class="device-info-value" style="color: var(--text-dimmed);">EME not available</div>
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
    let html = '<div class="api-results"><strong>Raw API Detection Results:</strong>';

    // canPlayType
    if (codec.apis.canPlayType) {
        const valueClass = codec.apis.canPlayType === 'probably' ? '' :
                          codec.apis.canPlayType === 'maybe' ? 'partial' : 'fail';
        html += `
            <div class="api-result-line">
                <span class="api-label">HTMLMediaElement.canPlayType():</span>
                <span class="api-value ${valueClass}">${codec.apis.canPlayType}</span>
            </div>
        `;
    }

    // isTypeSupported
    if (codec.apis.isTypeSupported) {
        const valueClass = codec.apis.isTypeSupported === 'probably' ? '' : 'fail';
        html += `
            <div class="api-result-line">
                <span class="api-label">MediaSource.isTypeSupported():</span>
                <span class="api-value ${valueClass}">${codec.apis.isTypeSupported}</span>
            </div>
        `;
    }
    
    // mediaCapabilities
    if (codec.apis.mediaCapabilities) {
        if (codec.apis.mediaCapabilities.error) {
            html += `
                <div class="api-result-line">
                    <span class="api-label">mediaCapabilities:</span>
                    <span class="api-value fail">error</span>
                </div>
            `;
        } else {
            const supported = codec.apis.mediaCapabilities.supported ? 'YES' : 'NO';
            const valueClass = codec.apis.mediaCapabilities.supported ? '' : 'fail';
            html += `
                <div class="api-result-line">
                    <span class="api-label">mediaCapabilities:</span>
                    <span class="api-value ${valueClass}">${supported} (smooth: ${codec.apis.mediaCapabilities.smooth}, efficient: ${codec.apis.mediaCapabilities.powerEfficient})</span>
                </div>
            `;
        }
    }
    
    // mediaCapabilities with spatialRendering (audio only)
    if (codec.apis.mediaCapabilitiesSpatial) {
        if (codec.apis.mediaCapabilitiesSpatial.error) {
            html += `
                <div class="api-result-line">
                    <span class="api-label">spatialRendering:</span>
                    <span class="api-value fail">error</span>
                </div>
            `;
        } else {
            const supported = codec.apis.mediaCapabilitiesSpatial.supported ? 'YES' : 'NO';
            const valueClass = codec.apis.mediaCapabilitiesSpatial.supported ? '' : 'fail';
            html += `
                <div class="api-result-line">
                    <span class="api-label">spatialRendering:</span>
                    <span class="api-value ${valueClass}">${supported} (smooth: ${codec.apis.mediaCapabilitiesSpatial.smooth}, efficient: ${codec.apis.mediaCapabilitiesSpatial.powerEfficient})</span>
                </div>
            `;
        }
    }
    
    html += '</div>';
    return html;
}

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
            if (state.currentFilter === 'supported' && codec.support !== 'probably' && codec.support !== 'maybe') return false;
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
        const supportedCount = filteredCodecs.filter(c => c.support === 'probably').length;
        const maybeCount = filteredCodecs.filter(c => c.support === 'maybe').length;

        // Create section
        const section = document.createElement('div');
        section.className = 'section';
        section.innerHTML = `
            <div class="section-header">
                ${group.category}
                <span class="support-count">${supportedCount} full / ${maybeCount} partial</span>
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
                    ${formatApiResults(codec)}
                    <button class="copy-result-btn" data-copy-json='${JSON.stringify(codec).replace(/'/g, "&apos;")}' aria-label="Copy full result">
                        Copy Full Result (JSON)
                    </button>
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

            // Setup copy buttons (prevent card toggle on button click)
            item.querySelectorAll('.copy-btn, .copy-result-btn').forEach(copyBtn => {
                copyBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const dataToCopy = copyBtn.dataset.copy || copyBtn.dataset.copyJson;

                    try {
                        await navigator.clipboard.writeText(dataToCopy);

                        // Visual feedback
                        const originalHTML = copyBtn.innerHTML;
                        copyBtn.innerHTML = copyBtn.classList.contains('copy-btn') ?
                            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>' :
                            '✓ Copied!';
                        copyBtn.classList.add('copied');

                        setTimeout(() => {
                            copyBtn.innerHTML = originalHTML;
                            copyBtn.classList.remove('copied');
                        }, 2000);
                    } catch (err) {
                        console.error('[UI] Copy failed:', err);
                        copyBtn.textContent = 'Failed';
                        setTimeout(() => {
                            copyBtn.innerHTML = originalHTML;
                        }, 2000);
                    }
                });
            });

            section.appendChild(item);
        });

        grid.appendChild(section);
    }

    // Hide loading indicator
    document.getElementById('loading').style.display = 'none';

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
            maybe: state.testResults.maybe,
            unsupported: state.testResults.unsupported,
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
