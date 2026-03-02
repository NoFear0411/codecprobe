// @ts-check
/**
 * Codec Testing Module
 *
 * Tests each codec record across all its containers using three APIs:
 *   1  — HTMLMediaElement.canPlayType()           (per container)
 *   2  — MediaSource.isTypeSupported()            (per container)
 *   3  — mediaCapabilities.decodingInfo()         (per container, file or media-source)
 *
 * DRM testing uses decodingInfo() + keySystemConfiguration (API 3 variant).
 *
 * Spatial audio tested automatically for codecs with any scenario.spatial = true.
 *
 * @typedef {import('./codec-database-v2.js').CodecRecord} CodecRecord
 * @typedef {import('./codec-database-v2.js').MediaType} MediaType
 * @typedef {import('./codec-database-v2.js').VideoScenario} VideoScenario
 * @typedef {import('./codec-database-v2.js').AudioScenario} AudioScenario
 */

/**
 * @typedef {Object} MediaCapResult
 * @property {boolean} supported
 * @property {boolean} [smooth]
 * @property {boolean} [powerEfficient]
 * @property {string} [error]
 */

/**
 * @typedef {Object} ScenarioResult
 * @property {MediaCapResult} mediaCapabilities
 * @property {MediaCapResult} [spatial]
 */

/**
 * @typedef {Object} ContainerTestResult
 * @property {string} mime - Full MIME string tested
 * @property {string} mode - 'file' or 'media-source'
 * @property {string} [canPlayType] - 'probably', 'maybe', 'unsupported', or 'error'
 * @property {string} [isTypeSupported] - 'probably', 'unsupported', or 'error'
 * @property {Record<string, ScenarioResult>} scenarios - API 3 results keyed by scenario name
 */

/**
 * @typedef {Object} DRMTestResult
 * @property {boolean} supported
 * @property {boolean} [smooth]
 * @property {boolean} [powerEfficient]
 * @property {string} [keySystem]
 * @property {string} [robustness]
 * @property {string} [securityLevel]
 * @property {string} [reason]
 * @property {boolean} [error] - true if exception was unexpected (timeout, etc.)
 * @property {Object} [config] - Full decodingInfo config for display
 */

/**
 * @typedef {Object} CodecTestResult
 * @property {string} codec - Bare codec string
 * @property {string} name
 * @property {MediaType} type
 * @property {string[]} flags
 * @property {(VideoScenario | AudioScenario)[]} scenarios
 * @property {import('./codec-database-v2.js').Education | null} education
 * @property {Record<string, ContainerTestResult>} containers
 * @property {Record<string, DRMTestResult> | null} drm
 * @property {'supported' | 'probably' | 'unsupported' | 'failed'} support
 * @property {string} [error]
 */

/**
 * @typedef {Object} TestResultGroup
 * @property {string} category
 * @property {MediaType} type
 * @property {CodecTestResult[]} codecs
 */

/**
 * @typedef {Object} TestResults
 * @property {number} supported
 * @property {number} unsupported
 * @property {number} failed
 * @property {Record<string, TestResultGroup>} tests
 * @property {number} [testDuration] - ms
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


// ==================== CONTAINER-LEVEL APIs (1 + 2) ====================

/**
 * Test a MIME string against APIs 1 (canPlayType) and 2 (isTypeSupported).
 * These depend only on the MIME string, not on scenario parameters.
 *
 * @param {string} mime - Full MIME string
 * @returns {{ canPlayType?: string, isTypeSupported?: string }}
 */
function testContainerAPIs(mime) {
    const element = mime.startsWith('video/') ? video : audio;
    /** @type {{ canPlayType?: string, isTypeSupported?: string }} */
    const apis = {};

    // ── Test 1: canPlayType ──
    if (API_METHODS.canPlayType) {
        try {
            const canPlay = element.canPlayType(mime) || '';
            apis.canPlayType = canPlay === '' ? 'unsupported' : canPlay;
        } catch (e) {
            apis.canPlayType = 'error';
            console.error(`canPlayType error for ${mime}:`, e);
        }
    }

    // ── Test 2: isTypeSupported ──
    if (API_METHODS.isTypeSupported) {
        try {
            apis.isTypeSupported = MediaSource.isTypeSupported(mime) ? 'probably' : 'unsupported';
        } catch (e) {
            apis.isTypeSupported = 'error';
            console.error(`isTypeSupported error for ${mime}:`, e);
        }
    }

    return apis;
}


// ==================== SCENARIO-LEVEL API (3) ====================

/**
 * Test a single scenario against API 3 (mediaCapabilities.decodingInfo).
 * Scenario parameters (width, height, framerate, HDR) affect the result.
 *
 * @param {VideoScenario | AudioScenario} scenario
 * @param {string} mime - Full MIME string
 * @param {MediaType} type
 * @param {'file' | 'media-source'} mcType
 * @param {boolean} testSpatial - Whether to test spatialRendering
 * @returns {Promise<ScenarioResult | null>} null if API unavailable or skipped
 */
async function testScenarioCapabilities(scenario, mime, type, mcType, testSpatial) {
    // Skip if audio contentType uses a video MIME (e.g. MPEG-TS audio = video/mp2t)
    // — the API rejects non-audio MIME types in AudioConfiguration
    const skipMC = type === 'audio' && mime.startsWith('video/');

    if (!API_METHODS.mediaCapabilities || skipMC) return null;

    const config = /** @type {MediaDecodingConfiguration} */ (buildMediaConfig(scenario, mime, type));
    config.type = mcType;

    /** @type {ScenarioResult} */
    const result = { mediaCapabilities: { supported: false } };

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
                result.spatial = { supported: false, error: e.message };
            }
        }
    } catch (e) {
        if (!e.message.includes('more than one codec')) {
            console.error(`mediaCapabilities error for ${mime}:`, e);
        }
        result.mediaCapabilities = { supported: false, error: e.message };
    }

    return result;
}


// ==================== DRM VIA DECODING INFO ====================

/**
 * Map robustness string to human-readable security level.
 * @param {string} robustness
 * @returns {string}
 */
function interpretSecurityLevel(robustness) {
    if (robustness.startsWith('HW_SECURE')) return 'Hardware (L1)';
    if (robustness.startsWith('SW_SECURE')) return 'Software (L3)';
    return robustness || 'Basic';
}

/**
 * Test DRM capability for a codec+scenario via decodingInfo + keySystemConfiguration.
 * Uses the same API as badge 3, adding DRM config to the request.
 *
 * @param {VideoScenario | AudioScenario} scenario
 * @param {string} mime - Full MIME string
 * @param {MediaType} type
 * @param {string} keySystem - Key system ID (e.g. 'com.widevine.alpha')
 * @returns {Promise<DRMTestResult>}
 */
async function testDRMCapabilities(scenario, mime, type, keySystem) {
    if (!API_METHODS.mediaCapabilities) {
        return { supported: false, reason: 'mediaCapabilities not available', error: true };
    }

    const config = /** @type {MediaDecodingConfiguration} */ (buildMediaConfig(scenario, mime, type));
    config.type = 'media-source';
    config.keySystemConfiguration = {
        keySystem,
        [type]: { contentType: mime }
    };

    try {
        const result = await Promise.race([
            navigator.mediaCapabilities.decodingInfo(config),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('DRM capability timeout')), 3000))
        ]);

        /** @type {DRMTestResult} */
        const drmResult = {
            supported: result.supported,
            smooth: result.smooth,
            powerEfficient: result.powerEfficient,
            keySystem,
            config
        };

        if (result.keySystemAccess) {
            const resolved = result.keySystemAccess.getConfiguration();
            const caps = resolved[`${type}Capabilities`] || [];
            drmResult.robustness = caps[0]?.robustness || '';
            drmResult.securityLevel = interpretSecurityLevel(drmResult.robustness);
        }

        return drmResult;
    } catch (e) {
        return {
            supported: false,
            keySystem,
            reason: e.name === 'NotSupportedError' ? 'Not supported' : e.message,
            error: e.name !== 'NotSupportedError',
            config
        };
    }
}


// ==================== CODEC RECORD TEST ====================

/**
 * Test a single codec record across all its containers and DRM systems.
 *
 * Container-level: APIs 1+2 run once per container (MIME-dependent only).
 * Scenario-level: API 3 runs per scenario per container (params-dependent).
 * DRM: API 3 + keySystemConfiguration, once per available key system.
 *
 * @param {CodecRecord} record
 * @param {MediaType} groupType
 * @param {import('./drm-detection.js').DRMInfo | null} deviceDRM
 * @returns {Promise<CodecTestResult>}
 */
async function testCodecRecord(record, groupType, deviceDRM) {
    const isSpatial = groupType === 'audio' &&
        record.scenarios.some(s => /** @type {AudioScenario} */ (s).spatial);

    /** @type {CodecTestResult} */
    const result = {
        codec: record.codec,
        name: record.name,
        type: groupType,
        flags: record.flags || [],
        scenarios: record.scenarios,
        education: record.education || null,
        containers: {},
        drm: null,
        support: 'unsupported'
    };

    /**
     * Test one container: APIs 1+2 once, API 3 per scenario.
     * @param {string} container
     * @param {'file' | 'media-source'} mode
     */
    const testOneContainer = async (container, mode) => {
        const mime = buildMime(record.codec, container, groupType);
        if (!mime) return;

        const apis = testContainerAPIs(mime);
        /** @type {ContainerTestResult} */
        const cr = { mime, mode, ...apis, scenarios: {} };

        for (const scenario of record.scenarios) {
            const scenarioResult = await testScenarioCapabilities(scenario, mime, groupType, mode, isSpatial);
            if (scenarioResult) {
                cr.scenarios[scenario.name] = scenarioResult;
            }
        }

        result.containers[container] = cr;
    };

    // ── File containers ──
    for (const container of (record.containers.file || [])) {
        await testOneContainer(container, 'file');
    }

    // ── Stream containers ──
    for (const container of (record.containers.stream || [])) {
        await testOneContainer(container, 'media-source');
    }

    // ── DRM via decodingInfo + keySystemConfiguration ──
    // Guard: requires mediaCapabilities, EME, and record.drm declaration
    if (API_METHODS.mediaCapabilities && deviceDRM?.emeAvailable && record.drm) {
        const availableSystems = record.drm.filter(
            system => deviceDRM.systems[system]?.supported
        );

        if (availableSystems.length > 0) {
            result.drm = {};
            const drmMime = buildMime(record.codec, 'fmp4', groupType);
            if (drmMime) {
                const scenario = record.scenarios[0];
                for (const system of availableSystems) {
                    const keySystemId = DRM_SYSTEMS[system];
                    if (!keySystemId) continue;
                    result.drm[system] = await testDRMCapabilities(
                        scenario, drmMime, groupType, keySystemId
                    );
                }
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
 * @param {CodecTestResult} result
 * @returns {'supported' | 'probably' | 'unsupported' | 'failed'}
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

        // API 3: check best scenario result across all scenarios in this container
        const scenarioEntries = Object.values(cr.scenarios || {});
        if (scenarioEntries.length > 0) {
            const anyScenarioSupported = scenarioEntries.some(
                sr => sr.mediaCapabilities && !sr.mediaCapabilities.error && sr.mediaCapabilities.supported
            );
            const anyScenarioTested = scenarioEntries.some(
                sr => sr.mediaCapabilities && !sr.mediaCapabilities.error
            );
            if (anyScenarioTested) {
                totalAPIs++;
                if (anyScenarioSupported) positiveAPIs++;
            }
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
 * @param {CodecRecord} record
 * @param {MediaType} groupType
 * @param {import('./drm-detection.js').DRMInfo | null} deviceDRM
 * @param {number} [maxRetries=2]
 * @param {number} [timeout=2000] - ms per attempt
 * @returns {Promise<CodecTestResult>}
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
    /** @type {CodecTestResult} */
    const failResult = {
        codec: record.codec,
        name: record.name,
        type: groupType,
        flags: record.flags || [],
        scenarios: record.scenarios,
        education: record.education || null,
        containers: {},
        drm: null,
        support: 'failed',
        error: failMsg
    };
    return failResult;
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
 * @param {((groupKey: string, codecResult: CodecTestResult) => void) | null} onProgress
 * @param {import('./drm-detection.js').DRMInfo | null} deviceDRM
 * @returns {Promise<TestResults>}
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
