/**
 * DRM/EME Detection Module
 *
 * Tests support for Encrypted Media Extensions and various DRM systems:
 * - Widevine (Google - Chrome/Android)
 * - PlayReady (Microsoft - Edge/Xbox)
 * - FairPlay (Apple - Safari/iOS)
 */

const DRM_SYSTEMS = {
    widevine: {
        name: 'Widevine',
        keySystems: [
            'com.widevine.alpha'
        ],
        vendor: 'Google'
    },
    playready: {
        name: 'PlayReady',
        keySystems: [
            'com.microsoft.playready',
            'com.microsoft.playready.recommendation',
            'com.microsoft.playready.software',
            'com.microsoft.playready.hardware'
        ],
        vendor: 'Microsoft'
    },
    fairplay: {
        name: 'FairPlay',
        keySystems: [
            'com.apple.fps',
            'com.apple.fps.1_0',
            'com.apple.fps.2_0',
            'com.apple.fps.3_0'
        ],
        vendor: 'Apple'
    },
    clearkey: {
        name: 'ClearKey',
        keySystems: [
            'org.w3.clearkey'
        ],
        vendor: 'W3C'
    }
};

/**
 * Test a specific DRM key system with timeout
 * @param {string} keySystem - Key system identifier
 * @param {string} drmName - Friendly name for logging
 * @returns {Promise<Object>} DRM capability info
 */
async function testKeySystem(keySystem, drmName) {
    if (!navigator.requestMediaKeySystemAccess) {
        return { supported: false, reason: 'EME not available' };
    }

    // Timeout promise - webOS can hang on this
    const timeout = new Promise((resolve) => {
        setTimeout(() => resolve({ supported: false, reason: 'Timeout' }), 3000);
    });

    const videoCapabilities = [
        {
            contentType: 'video/mp4; codecs="avc1.42E01E"',
            robustness: 'SW_SECURE_CRYPTO'
        },
        {
            contentType: 'video/mp4; codecs="avc1.42E01E"',
            robustness: 'SW_SECURE_DECODE'
        },
        {
            contentType: 'video/mp4; codecs="avc1.42E01E"',
            robustness: 'HW_SECURE_CRYPTO'
        },
        {
            contentType: 'video/mp4; codecs="avc1.42E01E"',
            robustness: 'HW_SECURE_DECODE'
        },
        {
            contentType: 'video/mp4; codecs="avc1.42E01E"',
            robustness: 'HW_SECURE_ALL'
        },
        {
            contentType: 'video/mp4; codecs="avc1.42E01E"'
        }
    ];

    const audioCapabilities = [
        {
            contentType: 'audio/mp4; codecs="mp4a.40.2"',
            robustness: 'SW_SECURE_CRYPTO'
        },
        {
            contentType: 'audio/mp4; codecs="mp4a.40.2"'
        }
    ];

    const config = {
        initDataTypes: ['cenc', 'keyids', 'webm'],
        videoCapabilities: videoCapabilities,
        audioCapabilities: audioCapabilities,
        distinctiveIdentifier: 'optional',
        persistentState: 'optional',
        sessionTypes: ['temporary', 'persistent-license']
    };

    try {
        const accessPromise = navigator.requestMediaKeySystemAccess(keySystem, [config]);
        const result = await Promise.race([accessPromise, timeout]);

        if (!result || result.reason === 'Timeout') {
            return { supported: false, reason: 'Timeout' };
        }

        const access = result;
        const configuration = access.getConfiguration();

        // Determine security level from robustness
        let securityLevel = 'Unknown';
        const videoRobustness = configuration.videoCapabilities?.[0]?.robustness || '';

        if (videoRobustness.includes('HW_SECURE')) {
            securityLevel = 'Hardware (L1)';
        } else if (videoRobustness.includes('SW_SECURE')) {
            securityLevel = 'Software (L3)';
        } else if (videoRobustness === '') {
            securityLevel = 'Basic';
        }

        return {
            supported: true,
            keySystem: keySystem,
            securityLevel: securityLevel,
            robustness: videoRobustness || 'none',
            persistentState: configuration.persistentState,
            distinctiveIdentifier: configuration.distinctiveIdentifier,
            sessionTypes: configuration.sessionTypes || [],
            videoCapabilities: configuration.videoCapabilities?.length || 0,
            audioCapabilities: configuration.audioCapabilities?.length || 0
        };
    } catch (error) {
        return {
            supported: false,
            keySystem: keySystem,
            reason: error.name === 'NotSupportedError' ? 'Not supported' : error.message
        };
    }
}

/**
 * Test all DRM systems with overall timeout
 * @returns {Promise<Object>} Complete DRM support results
 */
async function detectDRMSupport() {
    console.log('[DRM] detectDRMSupport called');

    const results = {
        emeAvailable: typeof navigator.requestMediaKeySystemAccess === 'function',
        systems: {},
        timedOut: false
    };

    console.log('[DRM] EME available:', results.emeAvailable);

    if (!results.emeAvailable) {
        console.log('EME (Encrypted Media Extensions) not available');
        return results;
    }

    console.log('Testing DRM systems...');

    // Overall timeout for all DRM tests - don't block UI on webOS
    const overallTimeout = new Promise((resolve) => {
        setTimeout(() => {
            results.timedOut = true;
            resolve(results);
        }, 8000);
    });

    const testPromise = (async () => {

    for (const [systemId, system] of Object.entries(DRM_SYSTEMS)) {
        results.systems[systemId] = {
            name: system.name,
            vendor: system.vendor,
            supported: false,
            details: null
        };

        // Try each key system variant
        for (const keySystem of system.keySystems) {
            const result = await testKeySystem(keySystem, system.name);

            if (result.supported) {
                results.systems[systemId].supported = true;
                results.systems[systemId].details = result;
                console.log(`✓ ${system.name}: ${result.securityLevel}`);
                break;
            }
        }

        if (!results.systems[systemId].supported) {
            console.log(`✗ ${system.name}: Not supported`);
        }
    }

    return results;
    })();

    return Promise.race([testPromise, overallTimeout]);
}

/**
 * Get friendly description of DRM support
 * @param {Object} drmResults - Results from detectDRMSupport()
 * @returns {string} Human-readable summary
 */
function getDRMSummary(drmResults) {
    if (!drmResults.emeAvailable) {
        return 'EME not available';
    }

    const supported = Object.values(drmResults.systems)
        .filter(s => s.supported)
        .map(s => s.name);

    if (supported.length === 0) {
        return 'No DRM systems detected';
    }

    return supported.join(', ');
}
