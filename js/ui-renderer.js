/**
 * UI Renderer Module
 * 
 * Handles rendering of device info and codec test results
 */

let currentFilter = 'all';
let testResults = null;

/**
 * Render device information header
 * @param {Object} info - Device info object from detectDeviceInfo()
 */
function renderDeviceInfo(info) {
    const container = document.getElementById('device-info');
    
    let html = `
        <div class="device-info-item">
            <div class="device-info-label">Browser</div>
            <div class="device-info-value">${info.browser} ${info.browserVersion}</div>
        </div>
        <div class="device-info-item">
            <div class="device-info-label">OS</div>
            <div class="device-info-value">${info.os} ${info.osVersion}</div>
        </div>
    `;

    if (info.deviceModel) {
        html += `
            <div class="device-info-item">
                <div class="device-info-label">Device</div>
                <div class="device-info-value">${info.deviceModel}</div>
            </div>
        `;
    }

    html += `
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
        <div class="device-info-item full-width">
            <div class="device-info-label">User Agent</div>
            <div class="device-info-value" style="font-size: 0.7rem; word-break: break-all; color: #888; font-weight: normal;">${info.userAgent}</div>
        </div>
    `;

    container.innerHTML = html;
}

/**
 * Format API results for display
 * @param {Object} codec - Codec result object
 * @returns {string} HTML string
 */
function formatApiResults(codec) {
    let html = '<div class="api-results">';
    
    // canPlayType
    if (codec.apis.canPlayType) {
        const valueClass = codec.apis.canPlayType === 'probably' ? '' : 
                          codec.apis.canPlayType === 'maybe' ? 'partial' : 'fail';
        html += `
            <div class="api-result-line">
                <span class="api-label">canPlayType:</span>
                <span class="api-value ${valueClass}">${codec.apis.canPlayType}</span>
            </div>
        `;
    }
    
    // isTypeSupported
    if (codec.apis.isTypeSupported) {
        const valueClass = codec.apis.isTypeSupported === 'probably' ? '' : 'fail';
        html += `
            <div class="api-result-line">
                <span class="api-label">isTypeSupported:</span>
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
    testResults = results;
    const grid = document.getElementById('codec-grid');
    grid.innerHTML = '';
    grid.style.display = 'grid';

    for (const [groupKey, group] of Object.entries(results.tests)) {
        // Apply filter
        const filteredCodecs = group.codecs.filter(codec => {
            if (currentFilter === 'all') return true;
            if (currentFilter === 'supported') return codec.support === 'probably' || codec.support === 'maybe';
            if (currentFilter === 'video') return codec.type === 'video';
            if (currentFilter === 'audio') return codec.type === 'audio';
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
            
            item.innerHTML = `
                <span class="status-badge">${codec.support.toUpperCase()}</span>
                <span class="codec-name">${codec.name}
                    <span class="platform-badge">${codec.container}</span>
                </span>
                <span class="info-line">${codec.info}</span>
                <span class="codec-string">${codec.codec}</span>
                ${formatApiResults(codec)}
            `;
            
            section.appendChild(item);
        });

        grid.appendChild(section);
    }

    // Hide loading indicator
    document.getElementById('loading').style.display = 'none';
}

/**
 * Setup filter buttons
 */
function setupFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            
            if (testResults) {
                renderResults(testResults);
            }
        });
    });
}

/**
 * Export results to JSON file
 */
function exportResults() {
    if (!testResults) {
        alert('No test results available to export');
        return;
    }

    const deviceInfo = detectDeviceInfo();
    const exportData = {
        timestamp: new Date().toISOString(),
        device: deviceInfo,
        summary: {
            supported: testResults.supported,
            maybe: testResults.maybe,
            unsupported: testResults.unsupported,
            testDuration: testResults.testDuration
        },
        codecs: testResults.tests
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
    document.getElementById('export-btn').addEventListener('click', exportResults);
}
