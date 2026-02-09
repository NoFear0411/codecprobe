/**
 * Codec Testing Module
 *
 * Tests codecs using three APIs:
 * 1. HTMLMediaElement.canPlayType()
 * 2. MediaSource.isTypeSupported()
 * 3. navigator.mediaCapabilities.decodingInfo()
 *    - For audio: tests both with and without spatialRendering: true
 */

import { codecDatabase } from './codec-database.js';

const video = document.createElement('video');
const audio = document.createElement('audio');

export const API_METHODS = {
    canPlayType: true,
    isTypeSupported: typeof MediaSource !== 'undefined' && typeof MediaSource.isTypeSupported === 'function',
    mediaCapabilities: typeof navigator.mediaCapabilities !== 'undefined' && 
                      typeof navigator.mediaCapabilities.decodingInfo === 'function'
};

console.log('APIs:', Object.entries(API_METHODS).filter(([,v]) => v).map(([k]) => k).join(', '));

/**
 * Test codec with retry logic
 * @param {Object} test - Codec test definition
 * @param {string} type - 'audio' or 'video'
 * @param {number} maxRetries - Maximum retry attempts (default 2)
 * @param {number} timeout - Timeout per attempt in ms (default 1000)
 * @returns {Promise<Object>} Test result or failed result
 */
export async function testCodecWithRetry(test, type, maxRetries = 2, timeout = 1000) {
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Test timeout - codec API took too long')), timeout)
            );

            const testPromise = testCodec(test, type);
            const result = await Promise.race([testPromise, timeoutPromise]);
            return result;

        } catch (error) {
            lastError = error;
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        }
    }

    // All retries exhausted - return FAILED result
    console.error(`[TEST] All ${maxRetries} attempts failed for ${test.name} - codec likely unsupported or browser API hung`);

    return {
        name: test.name,
        codec: test.codec,
        container: test.container,
        info: test.info,
        type,
        support: 'failed',
        apis: {
            canPlayType: 'failed',
            isTypeSupported: 'failed',
            mediaCapabilities: {
                error: lastError?.message || `Test failed after ${maxRetries} retries (timeout: ${timeout}ms each)`,
                attempts: maxRetries
            }
        }
    };
}

/**
 * Test a single codec using all available APIs
 * @param {Object} test - Codec test object from database
 * @param {string} type - 'audio' or 'video'
 * @returns {Promise<Object>} Test results
 */
export async function testCodec(test, type) {
    const element = type === 'audio' ? audio : video;
    const result = {
        name: test.name,
        codec: test.codec,
        container: test.container,
        info: test.info,
        type: type,
        mediaConfig: test.mediaConfig || null,
        education: test.education || null,
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
    // Skip if audio contentType uses a video MIME (e.g. video/mp2t for TS audio)
    // — the API rejects non-audio MIME types in AudioConfiguration
    const audioContentType = test.mediaConfig?.audio?.contentType || '';
    const invalidAudioMime = test.mediaConfig?.audio && audioContentType.startsWith('video/');

    if (API_METHODS.mediaCapabilities && test.mediaConfig && !invalidAudioMime) {
        try {
            const config = JSON.parse(JSON.stringify(test.mediaConfig));

            // Wrap in timeout to prevent hanging
            const capPromise = navigator.mediaCapabilities.decodingInfo(config);
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('mediaCapabilities timeout')), 800)
            );

            const capResult = await Promise.race([capPromise, timeoutPromise]);
            result.apis.mediaCapabilities = {
                supported: capResult.supported,
                smooth: capResult.smooth,
                powerEfficient: capResult.powerEfficient
            };
        } catch (e) {
            // Error = browser cannot handle this configuration
            // This is a valid result, not a test failure
            result.apis.mediaCapabilities = {
                supported: false,
                error: e.message
            };

            // Only log unexpected errors (not multi-codec errors)
            if (!e.message.includes('more than one codec')) {
                console.error(`mediaCapabilities error for ${test.codec}:`, e);
            }
        }

        // Only test spatial rendering for object-based audio formats
        // EC-3 = Dolby Atmos (JOC), AC-4 = Dolby AC-4 IMS, dtsx = DTS:X, mhm1/mhm2 = MPEG-H 3D
        const SPATIAL_CODEC_IDS = ['ec-3', 'ac-4', 'dtsx', 'mhm1', 'mhm2'];
        const codecLower = test.codec.toLowerCase();
        const supportsSpatial = SPATIAL_CODEC_IDS.some(id => codecLower.includes(id));

        if (type === 'audio' && test.mediaConfig.audio && supportsSpatial) {
            const spatialConfig = JSON.parse(JSON.stringify(test.mediaConfig));
            spatialConfig.audio.spatialRendering = true;

            try {
                // Wrap in timeout to prevent hanging
                const spatialPromise = navigator.mediaCapabilities.decodingInfo(spatialConfig);
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('spatial audio timeout')), 800)
                );

                const spatialResult = await Promise.race([spatialPromise, timeoutPromise]);
                result.apis.mediaCapabilitiesSpatial = {
                    supported: spatialResult.supported,
                    smooth: spatialResult.smooth,
                    powerEfficient: spatialResult.powerEfficient
                };
            } catch (e) {
                result.apis.mediaCapabilitiesSpatial = { error: e.message };
            }
        }
    }

    // ==================== DETERMINE OVERALL SUPPORT ====================
    // Count positive results from all APIs to determine consensus
    let totalAPIs = 0;
    let positiveAPIs = 0;

    // Check canPlayType
    if (result.apis.canPlayType && result.apis.canPlayType !== "error") {
        totalAPIs++;
        if (result.apis.canPlayType === "probably" || result.apis.canPlayType === "maybe") {
            positiveAPIs++;
        }
    }

    // Check isTypeSupported
    if (result.apis.isTypeSupported && result.apis.isTypeSupported !== "error") {
        totalAPIs++;
        if (result.apis.isTypeSupported === "probably") {
            positiveAPIs++;
        }
    }

    // Check mediaCapabilities
    if (result.apis.mediaCapabilities && !result.apis.mediaCapabilities.error) {
        totalAPIs++;
        if (result.apis.mediaCapabilities.supported) {
            positiveAPIs++;
        }
    }

    // Determine overall support level based on API consensus
    if (totalAPIs === 0) {
        result.support = "unsupported";
    } else if (positiveAPIs === totalAPIs) {
        result.support = "supported";  // All APIs agree it's supported
    } else if (positiveAPIs > 0) {
        result.support = "probably";   // Mixed results - some support
    } else {
        result.support = "unsupported"; // All APIs say no
    }

    return result;
}

/**
 * Configuration for test batching
 * User preference: 10 codecs per batch (recommended - balanced performance)
 */
export const BATCH_CONFIG = {
    batchSize: 10,
    batchDelay: 50,
    parallelWithinBatch: true
};

/**
 * Run codec tests in batches with progressive updates
 * @param {Function} onProgress - Callback for each completed test (groupKey, codecResult)
 * @returns {Promise<Object>} Test results
 */
export async function runCodecTests(onProgress = null) {
    const results = {
        supported: 0,
        unsupported: 0,
        failed: 0,
        tests: {}
    };

    const startTime = performance.now();

    const allCodecs = [];
    for (const [groupKey, group] of Object.entries(codecDatabase)) {
        results.tests[groupKey] = {
            category: group.category,
            codecs: []
        };

        const type = groupKey.startsWith('audio_') ? 'audio' : 'video';

        group.tests.forEach(test => {
            allCodecs.push({ groupKey, test, type, group });
        });
    }

    const totalCodecs = allCodecs.length;

    // Process in batches
    for (let i = 0; i < totalCodecs; i += BATCH_CONFIG.batchSize) {
        const batch = allCodecs.slice(i, i + BATCH_CONFIG.batchSize);

        const batchPromises = batch.map(({ groupKey, test, type }) =>
            testCodecWithRetry(test, type, 2, 1000).then(codecResult => {
                // Update counts
                if (codecResult.support === 'supported' || codecResult.support === 'probably') {
                    results.supported++;
                } else if (codecResult.support === 'failed') {
                    results.failed++;
                } else {
                    results.unsupported++;
                }

                results.tests[groupKey].codecs.push(codecResult);

                if (onProgress) {
                    try {
                        onProgress(groupKey, codecResult);
                    } catch (uiError) {
                        console.error('[TEST] UI update failed:', uiError);
                    }
                }

                return codecResult;
            })
        );

        // Wait for batch to complete
        if (BATCH_CONFIG.parallelWithinBatch) {
            await Promise.allSettled(batchPromises);
        } else {
            for (const promise of batchPromises) {
                await promise.catch(() => {});
            }
        }

        // Delay between batches to prevent browser overload
        if (i + BATCH_CONFIG.batchSize < totalCodecs) {
            await new Promise(resolve => setTimeout(resolve, BATCH_CONFIG.batchDelay));
        }
    }

    results.testDuration = Math.round(performance.now() - startTime);

    return results;
}
