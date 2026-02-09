/**
 * Main Initialization Script
 *
 * Orchestrates device detection, codec testing, and UI rendering
 */

import { initThemeSystem } from './theme-manager.js';
import { initURLState } from './url-state.js';
import { detectDeviceInfo } from './device-detection.js';
import { detectDRMSupport } from './drm-detection.js';
import { runCodecTests } from './codec-tester.js';
import {
    state, renderDeviceInfo, renderPendingCards, updateCardState,
    updateAllSectionCounts, setupFilters, setupExport,
    setupEducationToggles, renderResults, announceToScreenReader
} from './ui-renderer.js';

async function initialize() {
    console.log('CodecProbe — starting');

    initThemeSystem();
    initURLState((urlState) => {
        state.currentFilter = urlState.filter;
        state.searchQuery = urlState.search;
        if (state.testResults) renderResults(state.testResults);
    });

    const deviceInfo = await detectDeviceInfo();
    renderDeviceInfo(deviceInfo);

    try {
        const drmInfo = await detectDRMSupport();
        deviceInfo.drm = drmInfo;
        renderDeviceInfo(deviceInfo);
        if (drmInfo.timedOut) {
            console.warn('DRM detection timed out (common on TV browsers)');
        }
    } catch (error) {
        console.error('DRM detection failed:', error);
        deviceInfo.drm = { emeAvailable: false, error: error.message };
        renderDeviceInfo(deviceInfo);
    }

    setupFilters();
    setupExport();
    renderPendingCards();

    try {
        const results = await runCodecTests((groupKey, codecResult) => {
            updateCardState(groupKey, codecResult);
        });

        state.testResults = results;

        // Mark any stuck PENDING cards as FAILED
        const stuckCards = document.querySelectorAll('.codec-item.PENDING');
        if (stuckCards.length > 0) {
            console.warn(`${stuckCards.length} stuck PENDING cards`);
            stuckCards.forEach(card => {
                card.classList.remove('PENDING');
                card.classList.add('FAILED');
                const badge = card.querySelector('.status-badge');
                if (badge) badge.textContent = 'FAILED';
            });
            updateAllSectionCounts();
        }

        setupEducationToggles();

        const totalTested = results.supported + results.unsupported + results.failed;
        console.log(`Testing complete: ${totalTested} codecs in ${results.testDuration}ms — ${results.supported} supported, ${results.unsupported} unsupported${results.failed ? `, ${results.failed} failed` : ''}`);

        logNotableFindings(results, deviceInfo);
        announceToScreenReader(`Testing complete. ${totalTested} codecs tested. ${results.supported} supported.`);
    } catch (error) {
        console.error('Codec testing failed:', error);
        const loadingEl = document.getElementById('loading');
        if (loadingEl) {
            loadingEl.style.display = 'block';
            loadingEl.textContent = '';

            const errorDiv = document.createElement('div');
            errorDiv.style.color = 'var(--red)';

            const errorTitle = document.createElement('p');
            errorTitle.textContent = 'Codec testing failed';

            const errorMsg = document.createElement('p');
            errorMsg.style.fontSize = '0.9rem';
            errorMsg.textContent = error.message;

            const retryBtn = document.createElement('button');
            retryBtn.textContent = 'Retry';
            retryBtn.style.cssText = 'margin-top: 10px; padding: 8px 16px; background: var(--accent); color: var(--bg); border: none; border-radius: 4px; cursor: pointer;';
            retryBtn.onclick = () => location.reload();

            errorDiv.appendChild(errorTitle);
            errorDiv.appendChild(errorMsg);
            errorDiv.appendChild(retryBtn);
            loadingEl.appendChild(errorDiv);
        }
    }
}

function logNotableFindings(results, deviceInfo) {
    const findings = [];

    const dvCodecs = results.tests.video_dolby_vision?.codecs || [];
    const dvSupported = dvCodecs.filter(c => c.support === 'supported' || c.support === 'probably');
    findings.push(`DV: ${dvSupported.length}/${dvCodecs.length}`);

    const dtsCodecs = results.tests.audio_dts?.codecs || [];
    const dtsSupported = dtsCodecs.filter(c => c.support === 'supported' || c.support === 'probably');
    findings.push(`DTS: ${dtsSupported.length}/${dtsCodecs.length}`);

    const av1Codecs = results.tests.video_av1?.codecs || [];
    const av1Supported = av1Codecs.filter(c => c.support === 'supported' || c.support === 'probably');
    findings.push(`AV1: ${av1Supported.length}/${av1Codecs.length}`);

    if (deviceInfo.drm?.emeAvailable) {
        const drmNames = Object.values(deviceInfo.drm.systems)
            .filter(s => s.supported)
            .map(s => s.name);
        findings.push(`DRM: ${drmNames.length > 0 ? drmNames.join(', ') : 'none'}`);
    }

    console.log('Notable:', findings.join(' | '));
}

// ES modules execute after DOM parsing (like defer), so DOMContentLoaded is guaranteed
initialize();

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .catch(err => console.warn('SW registration failed:', err));
}
