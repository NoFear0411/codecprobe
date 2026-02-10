/**
 * Codec Testing Module
 *
 * Tests each codec record across all its containers using four test types:
 *   1  — HTMLMediaElement.canPlayType()           (per container)
 *   2  — MediaSource.isTypeSupported()            (per container)
 *   3  — mediaCapabilities.decodingInfo()         (per container, file or media-source)
 *   4  — requestMediaKeySystemAccess()            (per codec, conditional on device DRM)
 *
 * Spatial audio tested automatically for codecs with scenario.spatial = true.
 */

import {
    codecSource, buildMime, buildMediaConfig, buildInfo,
    STREAM_CONTAINERS, DRM_SYSTEMS, CONTAINER_DISPLAY
} from './codec-database-v2.js';

const video = document.createElement('video');
const audio = document.createElement('audio');

export const API_METHODS = {
    canPlayType: true,
    isTypeSupported: typeof MediaSource !== 'undefined' && typeof MediaSource.isTypeSupported === 'function',
    mediaCapabilities: typeof navigator.mediaCapabilities !== 'undefined' &&
                      typeof navigator.mediaCapabilities.decodingInfo === 'function'
};

console.log('APIs:', Object.entries(API_METHODS).filter(([,v]) => v).map(([k]) => k).join(', '));

const SPATIAL_CODEC_IDS = ['ec-3', 'ac-4', 'dtsx', 'mhm1', 'mhm2'];


// ==================== SINGLE CONTAINER TEST ====================

/**
 * Test a single MIME string against APIs 1, 2, and 3.
 *
 * @param {string} mime - Full MIME string
 * @param {string} type - 'video' or 'audio'
 * @param {string} mcType - 'file' or 'media-source' for mediaCapabilities
 * @param {Object} scenario - Scenario parameters for building mediaConfig
 * @param {boolean} testSpatial - Whether to test spatialRendering
 * @returns {Promise<Object>} Container test result
 */
async function testContainer(mime, type, mcType, scenario, testSpatial) {
    const element = mime.startsWith('video/') ? video : audio;
    const result = {
        mime,
        mode: mcType
    };

    // ── Test 1: canPlayType ──
    if (API_METHODS.canPlayType) {
        try {
            const canPlay = element.canPlayType(mime) || '';
            result.canPlayType = canPlay === '' ? 'unsupported' : canPlay;
        } catch (e) {
            result.canPlayType = 'error';
            console.error(`canPlayType error for ${mime}:`, e);
        }
    }

    // ── Test 2: isTypeSupported ──
    if (API_METHODS.isTypeSupported) {
        try {
            result.isTypeSupported = MediaSource.isTypeSupported(mime) ? 'probably' : 'unsupported';
        } catch (e) {
            result.isTypeSupported = 'error';
            console.error(`isTypeSupported error for ${mime}:`, e);
        }
    }

    // ── Test 3: mediaCapabilities ──
    // Skip if audio contentType uses a video MIME (e.g. MPEG-TS audio = video/mp2t)
    // — the API rejects non-audio MIME types in AudioConfiguration
    const skipMC = type === 'audio' && mime.startsWith('video/');

    if (API_METHODS.mediaCapabilities && !skipMC) {
        const config = buildMediaConfig(scenario, mime, type);
        config.type = mcType;

        try {
            const capResult = await Promise.race([
                navigator.mediaCapabilities.decodingInfo(config),
                new Promise((_, reject) => setTimeout(() => reject(new Error('mediaCapabilities timeout')), 800))
            ]);

            result.mediaCapabilities = {
                supported: capResult.supported,
                smooth: capResult.smooth,
                powerEfficient: capResult.powerEfficient
            };

            // Spatial audio sub-test
            if (testSpatial && config.audio) {
                const spatialConfig = JSON.parse(JSON.stringify(config));
                spatialConfig.audio.spatialRendering = true;
                try {
                    const sr = await Promise.race([
                        navigator.mediaCapabilities.decodingInfo(spatialConfig),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('spatial audio timeout')), 800))
                    ]);
                    result.spatial = {
                        supported: sr.supported,
                        smooth: sr.smooth,
                        powerEfficient: sr.powerEfficient
                    };
                } catch (e) {
                    result.spatial = { error: e.message };
                }
            }
        } catch (e) {
            if (!e.message.includes('more than one codec')) {
                console.error(`mediaCapabilities error for ${mime}:`, e);
            }
            result.mediaCapabilities = { supported: false, error: e.message };
        }
    }

    return result;
}


// ==================== PER-CODEC DRM TEST ====================

/**
 * Test a specific DRM key system with a specific codec MIME string.
 *
 * @param {string} mime - Full MIME string for the codec
 * @param {string} type - 'video' or 'audio'
 * @param {string} keySystem - Key system ID (e.g. 'com.widevine.alpha')
 * @returns {Promise<Object>} DRM test result
 */
async function testCodecDRM(mime, type, keySystem) {
    if (!navigator.requestMediaKeySystemAccess) {
        return { supported: false, reason: 'EME not available' };
    }

    const capabilities = type === 'video'
        ? { videoCapabilities: [{ contentType: mime }] }
        : { audioCapabilities: [{ contentType: mime }] };

    const config = {
        initDataTypes: ['cenc', 'keyids'],
        ...capabilities,
        distinctiveIdentifier: 'optional',
        persistentState: 'optional'
    };

    try {
        const access = await Promise.race([
            navigator.requestMediaKeySystemAccess(keySystem, [config]),
            new Promise((_, reject) => setTimeout(() => reject(new Error('DRM test timeout')), 3000))
        ]);

        const resolvedConfig = access.getConfiguration();
        const caps = resolvedConfig.videoCapabilities || resolvedConfig.audioCapabilities || [];
        const robustness = caps[0]?.robustness || '';

        return {
            supported: true,
            keySystem,
            robustness,
            persistentState: resolvedConfig.persistentState
        };
    } catch (e) {
        return {
            supported: false,
            keySystem,
            reason: e.name === 'NotSupportedError' ? 'Not supported' : e.message
        };
    }
}


// ==================== CODEC RECORD TEST ====================

/**
 * Test a single codec record across all its containers and DRM systems.
 *
 * @param {Object} record - CodecRecord from codecSource
 * @param {string} groupType - 'video' or 'audio' from group.type
 * @param {Object|null} deviceDRM - Device DRM results from detectDRMSupport()
 * @returns {Promise<Object>} Full codec test result
 */
async function testCodecRecord(record, groupType, deviceDRM) {
    const isSpatial = groupType === 'audio' && record.scenario?.spatial;
    const result = {
        codec: record.codec,
        name: record.name,
        type: groupType,
        flags: record.flags || [],
        scenario: record.scenario,
        education: record.education || null,
        containers: {},
        drm: null,
        support: 'unsupported'
    };

    // ── File containers ──
    for (const container of (record.containers.file || [])) {
        const mime = buildMime(record.codec, container, groupType);
        if (!mime) continue;
        result.containers[container] = await testContainer(mime, groupType, 'file', record.scenario, isSpatial);
    }

    // ── Stream containers ──
    for (const container of (record.containers.stream || [])) {
        const mime = buildMime(record.codec, container, groupType);
        if (!mime) continue;
        result.containers[container] = await testContainer(mime, groupType, 'media-source', record.scenario, isSpatial);
    }

    // ── DRM per-codec (badge 4) ──
    // Only test systems that: (a) the record declares, (b) the device supports
    if (deviceDRM?.emeAvailable && record.scenario?.drm) {
        result.drm = {};

        // Use MP4 MIME for DRM testing (DRM systems use ISOBMFF)
        const drmMime = buildMime(record.codec, 'mp4', groupType);

        if (drmMime) {
            for (const system of record.scenario.drm) {
                // Only test if device has this DRM system
                if (!deviceDRM.systems[system]?.supported) continue;

                const keySystemId = DRM_SYSTEMS[system];
                if (!keySystemId) continue;

                result.drm[system] = await testCodecDRM(drmMime, groupType, keySystemId);
            }
        }
    }

    // ── Overall support ──
    result.support = determineOverallSupport(result);

    return result;
}


// ==================== SUPPORT CONSENSUS ====================

/**
 * Determine overall support level from per-container results.
 * Best container wins — if any container has full API consensus, the codec is supported.
 *
 * @param {Object} result - Codec test result with containers
 * @returns {string} 'supported', 'probably', 'unsupported', or 'failed'
 */
function determineOverallSupport(result) {
    const containerResults = Object.values(result.containers);
    if (containerResults.length === 0) return 'unsupported';

    let anyFullSupport = false;
    let anyPartialSupport = false;
    let anyTested = false;

    for (const cr of containerResults) {
        let totalAPIs = 0;
        let positiveAPIs = 0;

        if (cr.canPlayType && cr.canPlayType !== 'error') {
            totalAPIs++;
            if (cr.canPlayType === 'probably' || cr.canPlayType === 'maybe') positiveAPIs++;
        }

        if (cr.isTypeSupported && cr.isTypeSupported !== 'error') {
            totalAPIs++;
            if (cr.isTypeSupported === 'probably') positiveAPIs++;
        }

        if (cr.mediaCapabilities && !cr.mediaCapabilities.error) {
            totalAPIs++;
            if (cr.mediaCapabilities.supported) positiveAPIs++;
        }

        if (totalAPIs > 0) {
            anyTested = true;
            if (positiveAPIs === totalAPIs) anyFullSupport = true;
            else if (positiveAPIs > 0) anyPartialSupport = true;
        }
    }

    if (!anyTested) return 'unsupported';
    if (anyFullSupport) return 'supported';
    if (anyPartialSupport) return 'probably';
    return 'unsupported';
}


// ==================== RETRY WRAPPER ====================

/**
 * Test codec record with retry logic.
 *
 * @param {Object} record - CodecRecord from codecSource
 * @param {string} groupType - 'video' or 'audio'
 * @param {Object|null} deviceDRM - Device DRM results
 * @param {number} maxRetries - Max retry attempts (default 2)
 * @param {number} timeout - Timeout per attempt in ms (default 2000)
 * @returns {Promise<Object>} Test result or failed result
 */
export async function testCodecWithRetry(record, groupType, deviceDRM, maxRetries = 2, timeout = 2000) {
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Test timeout - codec API took too long')), timeout)
            );

            const testPromise = testCodecRecord(record, groupType, deviceDRM);
            return await Promise.race([testPromise, timeoutPromise]);
        } catch (error) {
            lastError = error;
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        }
    }

    // All retries exhausted
    console.error(`[TEST] All ${maxRetries} attempts failed for ${record.name}`);

    const failMsg = lastError?.message || `Test failed after ${maxRetries} retries`;
    return {
        codec: record.codec,
        name: record.name,
        type: groupType,
        flags: record.flags || [],
        scenario: record.scenario,
        education: record.education || null,
        containers: {},
        drm: null,
        support: 'failed',
        error: failMsg
    };
}


// ==================== BATCH EXECUTION ====================

/**
 * Batching configuration.
 * 10 codec records per batch — each record tests multiple containers,
 * so effective API calls per batch are higher than the old flat model.
 */
export const BATCH_CONFIG = {
    batchSize: 10,
    batchDelay: 50,
    parallelWithinBatch: true
};

/**
 * Run codec tests in batches with progressive updates.
 *
 * @param {Function|null} onProgress - Callback: (groupKey, codecResult) per completed record
 * @param {Object|null} deviceDRM - Device DRM results from detectDRMSupport()
 * @returns {Promise<Object>} Aggregated test results
 */
export async function runCodecTests(onProgress = null, deviceDRM = null) {
    const results = {
        supported: 0,
        unsupported: 0,
        failed: 0,
        tests: {}
    };

    const startTime = performance.now();

    // Initialize result groups and flatten for batching
    const allRecords = [];
    for (const [groupKey, group] of Object.entries(codecSource)) {
        results.tests[groupKey] = {
            category: group.category,
            type: group.type,
            codecs: []
        };

        for (const record of group.codecs) {
            allRecords.push({ groupKey, record, groupType: group.type });
        }
    }

    const totalRecords = allRecords.length;

    // Process in batches
    for (let i = 0; i < totalRecords; i += BATCH_CONFIG.batchSize) {
        const batch = allRecords.slice(i, i + BATCH_CONFIG.batchSize);

        const batchPromises = batch.map(({ groupKey, record, groupType }) =>
            testCodecWithRetry(record, groupType, deviceDRM, 2, 2000).then(codecResult => {
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

        if (BATCH_CONFIG.parallelWithinBatch) {
            await Promise.allSettled(batchPromises);
        } else {
            for (const promise of batchPromises) {
                await promise.catch(() => {});
            }
        }

        // Delay between batches
        if (i + BATCH_CONFIG.batchSize < totalRecords) {
            await new Promise(resolve => setTimeout(resolve, BATCH_CONFIG.batchDelay));
        }
    }

    results.testDuration = Math.round(performance.now() - startTime);
    return results;
}
