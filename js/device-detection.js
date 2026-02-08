/**
 * Device Detection Module (UAParser.js v2.x with advanced features)
 *
 * Uses withFeatureCheck() for runtime capability detection (iPad, Brave, etc)
 * Uses withClientHints() for accurate device info on Chromium browsers
 */

/**
 * Detect device info using UAParser v2.x with advanced features
 * @returns {Promise<Object>} Device information
 */
async function detectDeviceInfo() {
    const parser = new UAParser();
    const ua = navigator.userAgent;

    // Apply advanced detection methods for maximum accuracy
    // withFeatureCheck() - detects iPad, Brave browser, and runtime capabilities
    // withClientHints() - uses Chrome Client Hints API for better device data
    let result;
    try {
        result = await parser
            .withFeatureCheck()      // Runtime feature detection (iPad fix!)
            .withClientHints()       // Client Hints API (Chromium 85+)
            .getResult();
    } catch (e) {
        // Fallback to basic parsing if advanced features fail
        console.warn('[Device Detection] Advanced features failed, using basic parsing:', e);
        result = parser.getResult();
    }

    // Special handling for webOS LG TVs (preserve existing logic)
    let deviceModel = result.device.model || 'Unknown';
    const webOSMatch = ua.match(/Web0S[/;\s]*([\d.]+)/i);
    if (webOSMatch) {
        const lgModel = ua.match(/LG[^;)]*(?:OLED|UHD|NanoCell|QNED)[^;)]*/i);
        if (lgModel) {
            deviceModel = lgModel[0].trim();
        }
    }

    // Build device info object
    const info = {
        userAgent: ua,
        browser: result.browser.name || 'Unknown',
        browserVersion: result.browser.version || 'Unknown',
        os: result.os.name || 'Unknown',
        osVersion: result.os.version || 'Unknown',
        engine: result.engine.name || 'Unknown',
        engineVersion: result.engine.version || 'Unknown',
        deviceType: result.device.type || 'desktop',
        deviceModel: deviceModel,
        deviceVendor: result.device.vendor || 'Unknown',
        cpuArchitecture: result.cpu.architecture || 'Unknown',

        // Legacy flags for compatibility
        webOS: (result.os.name || '').toLowerCase().includes('webos'),
        iOS: (result.os.name || '').toLowerCase().includes('ios'),
        android: (result.os.name || '').toLowerCase().includes('android'),
        tvOS: (result.os.name || '').toLowerCase().includes('tvos'),

        // Browser metadata
        platform: navigator.platform,
        vendor: navigator.vendor || 'Unknown',
        language: navigator.language,

        // Hardware detection
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        pixelRatio: window.devicePixelRatio || 1,
        colorDepth: window.screen.colorDepth,
        screenHDR: window.matchMedia('(dynamic-range: high)').matches,
        wideGamut: window.matchMedia('(color-gamut: p3)').matches,
        rec2020: window.matchMedia('(color-gamut: rec2020)').matches,
        hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown',
        deviceMemory: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'Unknown',

        // API support detection
        apiSupport: {
            canPlayType: true,
            isTypeSupported: typeof MediaSource !== 'undefined' && typeof MediaSource.isTypeSupported === 'function',
            mediaCapabilities: typeof navigator.mediaCapabilities !== 'undefined' &&
                              typeof navigator.mediaCapabilities.decodingInfo === 'function',
            mediaSource: typeof MediaSource !== 'undefined',
            eme: typeof navigator.requestMediaKeySystemAccess === 'function',
            webrtc: typeof RTCPeerConnection !== 'undefined',
            webgl: (() => {
                try {
                    const canvas = document.createElement('canvas');
                    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
                } catch (e) {
                    return false;
                }
            })()
        }
    };

    // Preserve webOS-specific version info
    if (info.webOS && webOSMatch) {
        info.webOSVersion = webOSMatch[1];
    }

    return info;
}

/**
 * Detect device info with DRM support (async version)
 * @returns {Promise<Object>} Complete device information including DRM
 */
async function detectDeviceInfoWithDRM() {
    const info = await detectDeviceInfo();

    // Add DRM detection if available
    if (typeof detectDRMSupport === 'function') {
        info.drm = await detectDRMSupport();
    }

    return info;
}
