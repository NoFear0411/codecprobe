/**
 * Main Initialization Script
 * 
 * Orchestrates device detection, codec testing, and UI rendering
 */

async function initialize() {
    console.log('='.repeat(80));
    console.log('CodecProbe - Multi-API Codec Testing for Media Server Enthusiasts');
    console.log('='.repeat(80));
    
    // Step 1: Detect device information
    console.log('Step 1: Detecting device information...');
    const deviceInfo = detectDeviceInfo();
    renderDeviceInfo(deviceInfo);
    
    console.log('Device Info:', {
        browser: `${deviceInfo.browser} ${deviceInfo.browserVersion}`,
        os: `${deviceInfo.os} ${deviceInfo.osVersion}`,
        screen: `${deviceInfo.screenWidth}×${deviceInfo.screenHeight}`,
        hdr: deviceInfo.screenHDR
    });
    
    // Step 2: Setup UI controls
    console.log('Step 2: Setting up UI controls...');
    setupFilters();
    setupExport();
    
    // Step 3: Run comprehensive codec tests
    console.log('Step 3: Running comprehensive codec tests...');
    console.log('This will test all codecs using 3 APIs:');
    console.log('  - HTMLMediaElement.canPlayType()');
    console.log('  - MediaSource.isTypeSupported()');
    console.log('  - navigator.mediaCapabilities.decodingInfo()');
    console.log('');
    
    try {
        const results = await runCodecTests();
        
        // Step 4: Render results
        console.log('Step 4: Rendering results...');
        renderResults(results);
        
        console.log('='.repeat(80));
        console.log('TESTING COMPLETE');
        console.log('='.repeat(80));
        console.log(`Total codecs tested: ${results.supported + results.maybe + results.unsupported}`);
        console.log(`✓ Fully supported: ${results.supported}`);
        console.log(`⚠ Partially supported: ${results.maybe}`);
        console.log(`✗ Unsupported: ${results.unsupported}`);
        console.log(`⏱ Test duration: ${results.testDuration}ms`);
        console.log('='.repeat(80));
        
        // Log any notable findings
        logNotableFindings(results, deviceInfo);
        
    } catch (error) {
        console.error('Error during codec testing:', error);
        document.getElementById('loading').innerHTML = `
            <div style="color: var(--red);">
                <strong>Error during testing:</strong><br>
                ${error.message}
            </div>
        `;
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
    const dvSupported = dvCodecs.filter(c => c.support === 'probably');
    if (dvSupported.length > 0) {
        console.log(`✓ Dolby Vision: ${dvSupported.length}/${dvCodecs.length} profiles supported`);
        dvSupported.forEach(c => console.log(`  - ${c.name} (${c.container})`));
    } else {
        console.log('✗ Dolby Vision: No profiles supported');
    }
    
    // Check DTS support
    const dtsCodecs = results.tests.audio_dts?.codecs || [];
    const dtsSupported = dtsCodecs.filter(c => c.support === 'probably');
    if (dtsSupported.length > 0) {
        console.log(`✓ DTS Audio: ${dtsSupported.length}/${dtsCodecs.length} variants supported`);
    } else {
        console.log('✗ DTS Audio: No variants supported');
    }
    
    // Check AV1 support
    const av1Codecs = results.tests.video_av1?.codecs || [];
    const av1Supported = av1Codecs.filter(c => c.support === 'probably');
    if (av1Supported.length > 0) {
        console.log(`✓ AV1: ${av1Supported.length}/${av1Codecs.length} profiles supported`);
    } else {
        console.log('✗ AV1: No profiles supported');
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
    } else if (deviceInfo.android) {
        console.log('');
        console.log('🤖 Android Notes:');
        console.log('  - Codec support varies greatly by manufacturer and chipset');
        console.log('  - Widevine L1 required for DRM-protected content');
    }
    
    console.log('-'.repeat(80));
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}
