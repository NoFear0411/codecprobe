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
 * Render device information header
 * @param {Object} info - Device info object from detectDeviceInfo()
 */
function renderDeviceInfo(info) {
    const header = document.getElementById('device-info-summary');

    if (!header) return;

    let headerText = `${info.browser} ${info.browserVersion} • ${info.os} ${info.osVersion}`;

    if (info.deviceModel) {
        headerText += ` • ${info.deviceModel}`;
    }

    headerText += ` • ${info.screenWidth}×${info.screenHeight}`;

    if (info.screenHDR) {
        headerText += ` • <span>HDR Display</span>`;
    }

    // Add DRM info if available
    if (info.drm && !info.drm.timedOut && info.drm.emeAvailable) {
        const supportedDRM = Object.values(info.drm.systems)
            .filter(s => s.supported)
            .map(s => {
                const level = s.details?.securityLevel || '';
                return `${s.name}${level ? ` (${level})` : ''}`;
            });

        if (supportedDRM.length > 0) {
            headerText += ` • DRM: <span>${supportedDRM.join(', ')}</span>`;
        }
    }

    header.innerHTML = headerText;
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
                <span class="status-badge">${codec.support.toUpperCase()}</span>
                <span class="codec-name">${codec.name}
                    <span class="platform-badge">${codec.container}</span>
                </span>
                <div class="codec-summary">${codec.info}</div>
                <div class="codec-details">
                    <div class="codec-string"><strong>MIME Type:</strong> ${codec.codec}</div>
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
                    console.log('[UI] Codec card toggled:', codec.name, isExpanded);
                }
            };

            item.addEventListener('click', handleToggle);
            item.addEventListener('keydown', handleToggle);

            section.appendChild(item);
        });

        grid.appendChild(section);
    }

    // Hide loading indicator
    document.getElementById('loading').style.display = 'none';
}

/**
 * Setup filter buttons and search
 */
function setupFilters() {
    console.log('[UI] Setting up filter buttons...');
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
