/**
 * Codec Testing Module
 * 
 * Tests codecs using three APIs:
 * 1. HTMLMediaElement.canPlayType()
 * 2. MediaSource.isTypeSupported()
 * 3. navigator.mediaCapabilities.decodingInfo()
 *    - For audio: tests both with and without spatialRendering: true
 */

const video = document.createElement('video');
const audio = document.createElement('audio');

// API availability
const API_METHODS = {
    canPlayType: true,
    isTypeSupported: typeof MediaSource !== 'undefined' && typeof MediaSource.isTypeSupported === 'function',
    mediaCapabilities: typeof navigator.mediaCapabilities !== 'undefined' && 
                      typeof navigator.mediaCapabilities.decodingInfo === 'function'
};

console.log('API Support Detection:', API_METHODS);

/**
 * Test a single codec using all available APIs
 * @param {Object} test - Codec test object from database
 * @param {string} type - 'audio' or 'video'
 * @returns {Promise<Object>} Test results
 */
async function testCodec(test, type) {
    const element = type === 'audio' ? audio : video;
    const result = {
        name: test.name,
        codec: test.codec,
        container: test.container,
        info: test.info,
        type: type,
        apis: {}
    };

    // ==================== TEST 1: canPlayType ====================
    if (API_METHODS.canPlayType) {
        try {
            const canPlay = element.canPlayType(test.codec) || "";
            result.apis.canPlayType = canPlay === "" ? "unsupported" : canPlay;
        } catch (e) {
            result.apis.canPlayType = "error";
            console.error(`canPlayType error for ${test.codec}:`, e);
        }
    }

    // ==================== TEST 2: isTypeSupported ====================
    if (API_METHODS.isTypeSupported) {
        try {
            result.apis.isTypeSupported = MediaSource.isTypeSupported(test.codec) ? "probably" : "unsupported";
        } catch (e) {
            result.apis.isTypeSupported = "error";
            console.error(`isTypeSupported error for ${test.codec}:`, e);
        }
    }

    // ==================== TEST 3: mediaCapabilities ====================
    if (API_METHODS.mediaCapabilities && test.mediaConfig) {
        try {
            // Clone the config to avoid mutations
            const config = JSON.parse(JSON.stringify(test.mediaConfig));
            
            const capResult = await navigator.mediaCapabilities.decodingInfo(config);
            result.apis.mediaCapabilities = {
                supported: capResult.supported,
                smooth: capResult.smooth,
                powerEfficient: capResult.powerEfficient
            };

            // For audio codecs, also test with spatialRendering: true
            if (type === 'audio' && config.audio) {
                const spatialConfig = JSON.parse(JSON.stringify(test.mediaConfig));
                spatialConfig.audio.spatialRendering = true;
                
                try {
                    const spatialResult = await navigator.mediaCapabilities.decodingInfo(spatialConfig);
                    result.apis.mediaCapabilitiesSpatial = {
                        supported: spatialResult.supported,
                        smooth: spatialResult.smooth,
                        powerEfficient: spatialResult.powerEfficient
                    };
                } catch (e) {
                    result.apis.mediaCapabilitiesSpatial = { error: e.message };
                }
            }
        } catch (e) {
            result.apis.mediaCapabilities = { error: e.message };
            console.error(`mediaCapabilities error for ${test.codec}:`, e);
        }
    }

    // ==================== DETERMINE OVERALL SUPPORT ====================
    // Use best result from any API
    const levels = [];
    
    if (result.apis.canPlayType && result.apis.canPlayType !== "error") {
        levels.push(result.apis.canPlayType);
    }
    
    if (result.apis.isTypeSupported && result.apis.isTypeSupported !== "error") {
        levels.push(result.apis.isTypeSupported);
    }
    
    if (result.apis.mediaCapabilities && result.apis.mediaCapabilities.supported) {
        levels.push("probably");
    }

    if (levels.includes("probably")) {
        result.support = "probably";
    } else if (levels.includes("maybe")) {
        result.support = "maybe";
    } else {
        result.support = "unsupported";
    }

    return result;
}

/**
 * Run comprehensive codec tests across all codecs in database
 * @returns {Promise<Object>} Complete test results
 */
async function runCodecTests() {
    const results = {
        supported: 0,
        maybe: 0,
        unsupported: 0,
        tests: {}
    };

    console.log('Starting comprehensive codec tests...');
    const startTime = performance.now();

    for (const [groupKey, group] of Object.entries(codecDatabase)) {
        results.tests[groupKey] = {
            category: group.category,
            codecs: []
        };

        const type = groupKey.startsWith('audio_') ? 'audio' : 'video';

        for (const test of group.tests) {
            const codecResult = await testCodec(test, type);
            
            // Update counts
            if (codecResult.support === "probably") {
                results.supported++;
            } else if (codecResult.support === "maybe") {
                results.maybe++;
            } else {
                results.unsupported++;
            }

            results.tests[groupKey].codecs.push(codecResult);
        }

        console.log(`Completed ${group.category}: ${results.tests[groupKey].codecs.length} codecs tested`);
    }

    const endTime = performance.now();
    results.testDuration = Math.round(endTime - startTime);
    
    console.log(`All tests completed in ${results.testDuration}ms`);
    console.log(`Summary: ${results.supported} supported, ${results.maybe} partial, ${results.unsupported} unsupported`);

    return results;
}
