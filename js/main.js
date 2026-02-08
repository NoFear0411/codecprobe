/**
 * Main Initialization Script
 * 
 * Orchestrates device detection, codec testing, and UI rendering
 */

async function initialize() {
    console.log('='.repeat(80));
    console.log('CodecProbe - Multi-API Codec Testing for Media Server Enthusiasts');
    console.log('='.repeat(80));

    // Step 0: Initialize theme system
    console.log('Step 0: Initializing theme system...');
    if (typeof initThemeSystem === 'function') {
        initThemeSystem();
    }

    // Step 0b: Initialize URL state
    console.log('Step 0b: Initializing URL state management...');
    if (typeof initURLState === 'function') {
        const urlState = initURLState();
        console.log('[Debug] URL state loaded:', urlState);
    }

    // Step 1: Detect device information (now async with UAParser v2.x)
    console.log('Step 1: Detecting device information...');
    const deviceInfo = await detectDeviceInfo();
    console.log('[Debug] Initial device info:', deviceInfo);
    renderDeviceInfo(deviceInfo);

    // Step 1b: Detect DRM support (non-blocking, can timeout on webOS)
    console.log('Step 1b: Testing DRM support (may take a few seconds)...');
    console.log('[Debug] detectDRMSupport function exists:', typeof detectDRMSupport !== 'undefined');

    if (typeof detectDRMSupport !== 'undefined') {
        try {
            const drmInfo = await detectDRMSupport();
            console.log('[Debug] DRM detection complete:', drmInfo);
            deviceInfo.drm = drmInfo;
            renderDeviceInfo(deviceInfo); // Re-render with DRM info
            if (drmInfo.timedOut) {
                console.log('⚠ DRM detection timed out (common on TV browsers)');
            }
        } catch (error) {
            console.error('⚠ DRM detection failed:', error);
            deviceInfo.drm = { emeAvailable: false, error: error.message };
            renderDeviceInfo(deviceInfo);
        }
    } else {
        console.error('[Debug] detectDRMSupport function not found!');
    }

    console.log('Device Info:', {
        browser: `${deviceInfo.browser} ${deviceInfo.browserVersion}`,
        os: `${deviceInfo.os} ${deviceInfo.osVersion}`,
        screen: `${deviceInfo.screenWidth}×${deviceInfo.screenHeight}`,
        hdr: deviceInfo.screenHDR,
        drm: deviceInfo.drm ? getDRMSummary(deviceInfo.drm) : 'Not tested'
    });
    
    // Step 2: Setup UI controls
    console.log('Step 2: Setting up UI controls...');
    setupFilters();
    setupExport();

    // Step 3: Render pending cards immediately
    console.log('Step 3: Rendering codec cards...');
    renderPendingCards();

    // Step 4: Run codec tests with progressive updates
    console.log('Step 4: Running codec tests in batches...');
    console.log('This will test all codecs using 3 APIs:');
    console.log('  - HTMLMediaElement.canPlayType()');
    console.log('  - MediaSource.isTypeSupported()');
    console.log('  - navigator.mediaCapabilities.decodingInfo()');
    console.log('');

    try {
        const results = await runCodecTests((groupKey, codecResult) => {
            updateCardState(groupKey, codecResult);
        });

        // Save results to state for export
        if (typeof state !== 'undefined') {
            state.testResults = results;
        }

        // Force remove any stuck PENDING cards
        const stuckCards = document.querySelectorAll('.codec-item.PENDING');
        if (stuckCards.length > 0) {
            console.warn(`[MAIN] ${stuckCards.length} stuck PENDING cards`);
            stuckCards.forEach(card => {
                card.classList.remove('PENDING');
                card.classList.add('FAILED');
                const badge = card.querySelector('.status-badge');
                if (badge) badge.textContent = 'FAILED';
            });
            updateAllSectionCounts();
        }

        setupEducationToggles();

        console.log('='.repeat(80));
        console.log('TESTING COMPLETE');
        console.log('='.repeat(80));
        const totalTested = results.supported + results.unsupported + results.failed;
        console.log(`Total codecs tested: ${totalTested}`);
        console.log(`✓ Supported: ${results.supported}`);
        console.log(`✗ Unsupported: ${results.unsupported}`);
        if (results.failed > 0) console.log(`⚠ Failed: ${results.failed}`);
        console.log(`⏱ Test duration: ${results.testDuration}ms`);
        console.log('='.repeat(80));

        logNotableFindings(results, deviceInfo);

        announceToScreenReader(`Testing complete. ${totalTested} codecs tested. ${results.supported} supported.`);
    } catch (error) {
        console.error('⚠ Codec testing failed:', error);
        const loadingEl = document.getElementById('loading');
        if (loadingEl) {
            loadingEl.style.display = 'block';
            loadingEl.textContent = '';

            const errorDiv = document.createElement('div');
            errorDiv.style.color = 'var(--red)';

            const errorTitle = document.createElement('p');
            errorTitle.textContent = '❌ Codec testing failed';

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

/**
 * Log notable findings based on device and results
 * @param {Object} results - Test results
 * @param {Object} deviceInfo - Device information
 */
function logNotableFindings(results, deviceInfo) {
    console.log('');
    console.log('Notable Findings:');
    console.log('-'.repeat(80));
    
    // Check Dolby Vision support
    const dvCodecs = results.tests.video_dolby_vision?.codecs || [];
    const dvSupported = dvCodecs.filter(c => c.support === 'supported' || c.support === 'probably');
    if (dvSupported.length > 0) {
        console.log(`✓ Dolby Vision: ${dvSupported.length}/${dvCodecs.length} profiles supported`);
        dvSupported.forEach(c => console.log(`  - ${c.name} (${c.container})`));
    } else {
        console.log('✗ Dolby Vision: No profiles supported');
    }
    
    // Check DTS support
    const dtsCodecs = results.tests.audio_dts?.codecs || [];
    const dtsSupported = dtsCodecs.filter(c => c.support === 'supported' || c.support === 'probably');
    if (dtsSupported.length > 0) {
        console.log(`✓ DTS Audio: ${dtsSupported.length}/${dtsCodecs.length} variants supported`);
    } else {
        console.log('✗ DTS Audio: No variants supported');
    }
    
    // Check AV1 support
    const av1Codecs = results.tests.video_av1?.codecs || [];
    const av1Supported = av1Codecs.filter(c => c.support === 'supported' || c.support === 'probably');
    if (av1Supported.length > 0) {
        console.log(`✓ AV1: ${av1Supported.length}/${av1Codecs.length} profiles supported`);
    } else {
        console.log('✗ AV1: No profiles supported');
    }
    
    // DRM support summary
    if (deviceInfo.drm && deviceInfo.drm.emeAvailable) {
        console.log('');
        console.log('DRM/EME Support:');
        for (const [id, system] of Object.entries(deviceInfo.drm.systems)) {
            if (system.supported && system.details) {
                console.log(`  ✓ ${system.name}: ${system.details.securityLevel}`);
                if (system.details.robustness) {
                    console.log(`    - Robustness: ${system.details.robustness}`);
                }
                if (system.details.persistentState !== 'not-allowed') {
                    console.log(`    - Persistent state: ${system.details.persistentState}`);
                }
            } else {
                console.log(`  ✗ ${system.name}: Not supported`);
            }
        }
    }

    // Platform-specific notes
    if (deviceInfo.webOS) {
        console.log('');
        console.log(`📺 webOS ${deviceInfo.osVersion} Notes:`);
        console.log('  - webOS 25+ supports Dolby Vision in MKV container');
        console.log('  - DTS passthrough may require audio receiver');
    } else if (deviceInfo.iOS) {
        console.log('');
        console.log(`📱 iOS ${deviceInfo.osVersion} Notes:`);
        console.log('  - Safari canPlayType() may not report Dolby Vision (API limitation)');
        console.log('  - Hardware may support DV even if APIs report unsupported');
        if (deviceInfo.drm?.systems?.fairplay?.supported) {
            console.log('  - FairPlay DRM available for protected content');
        }
    } else if (deviceInfo.android) {
        console.log('');
        console.log('🤖 Android Notes:');
        console.log('  - Codec support varies greatly by manufacturer and chipset');
        if (deviceInfo.drm?.systems?.widevine?.supported) {
            const level = deviceInfo.drm.systems.widevine.details.securityLevel;
            console.log(`  - Widevine ${level} available for protected content`);
        }
    }

    console.log('-'.repeat(80));
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}
