// @ts-check
/**
 * Codec Database v2
 *
 * The bare codec string is the single source of truth.
 * Full MIME strings are built at test time from codec + container + type.
 * No expansion layer — consumers (codec-tester, ui-renderer) import this directly.
 *
 * Test structure per codec card:
 *   1  — canPlayType()              (per container)
 *   2  — isTypeSupported()          (per container)
 *   3A — mediaCapabilities 'file'   (per file container)
 *   3B — mediaCapabilities 'stream' (per stream container)
 *   4  — DRM per-codec              (conditional on device DRM availability)
 *
 * Group organization:
 *   Video — by base codec standard (HEVC, AV1, VP9, AVC, VVC, VP8)
 *         — by technology/brand (Dolby Vision spans HEVC/AVC/AV1)
 *         — legacy catch-all (MPEG-4 Part 2, H.263, Theora)
 *   Audio — by brand (Dolby, DTS, MPEG-H)
 *         — by quality tier (Lossless, Standard)
 *
 * @module codec-database-v2
 */


// ==================== CONTAINER CONSTANTS ====================

/**
 * Maps container shorthand to base MIME type by media type.
 *
 * Streaming containers (fmp4, hls, dash, cmaf) use fragmented MP4 MIME.
 * MPEG-TS uses video/mp2t for both video and audio — no audio/mp2t exists.
 * Native containers (flac, aiff, aac, mp3) use bare MIME without codecs= parameter.
 *
 * audio/quicktime is not IANA-registered. Safari may accept it, others may not.
 * Testing it reveals real-world behavior — if it fails, that's informative.
 */
export const CONTAINER_MIME = {
    // ── File containers ──
    mp4:    { video: 'video/mp4',            audio: 'audio/mp4' },
    mkv:    { video: 'video/x-matroska',     audio: 'audio/x-matroska' },
    webm:   { video: 'video/webm',           audio: 'audio/webm' },
    mov:    { video: 'video/quicktime',       audio: 'audio/quicktime' },
    '3gp':  { video: 'video/3gpp' },
    ogg:    { video: 'video/ogg',            audio: 'audio/ogg' },

    // ── Streaming containers (fragmented MP4 / MPEG-TS) ──
    fmp4:   { video: 'video/mp4',            audio: 'audio/mp4' },
    hls:    { video: 'video/mp4',            audio: 'audio/mp4' },
    dash:   { video: 'video/mp4',            audio: 'audio/mp4' },
    cmaf:   { video: 'video/mp4',            audio: 'audio/mp4' },
    mpegts: { video: 'video/mp2t',           audio: 'video/mp2t' },

    // ── Native containers (bare MIME, no codecs= parameter) ──
    flac:   { audio: 'audio/flac' },
    wav:    { audio: 'audio/wav' },
    aiff:   { audio: 'audio/aiff' },
    aac:    { audio: 'audio/aac' },
    mp3:    { audio: 'audio/mpeg' }
};

/** Native containers where MIME has no codecs= parameter */
export const BARE_CONTAINERS = new Set(['flac', 'aiff', 'aac', 'mp3']);

/** Streaming containers — use type: 'media-source' for mediaCapabilities */
export const STREAM_CONTAINERS = new Set(['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']);

/** Display names for containers */
export const CONTAINER_DISPLAY = {
    mp4: 'MP4',        mkv: 'MKV',        webm: 'WebM',      mov: 'MOV',
    '3gp': '3GP',      ogg: 'OGG',
    fmp4: 'fMP4',      hls: 'HLS',        dash: 'DASH',      cmaf: 'CMAF',
    mpegts: 'MPEG-TS',
    flac: 'FLAC',      wav: 'WAV',        aiff: 'AIFF',      aac: 'AAC',
    mp3: 'MP3'
};


// ==================== DRM CONSTANTS ====================

/**
 * Key system identifiers for requestMediaKeySystemAccess().
 * Per-codec DRM tests only run when the device-level DRM check
 * (drm-detection.js) confirms the system is available on this device.
 */
export const DRM_SYSTEMS = {
    widevine:  'com.widevine.alpha',
    playready: 'com.microsoft.playready',
    fairplay:  'com.apple.fps',
    clearkey:  'org.w3.clearkey'
};


// ==================== MIME BUILDER ====================

/**
 * Build a full MIME string from a bare codec string + container + media type.
 *
 * @example buildMime('hvc1.1.6.L93.B0', 'mp4', 'video')
 *   // → 'video/mp4; codecs="hvc1.1.6.L93.B0"'
 *
 * @example buildMime('hvc1.2.4.L153.B0, dvh1.08.06', 'mp4', 'video')
 *   // → 'video/mp4; codecs="hvc1.2.4.L153.B0, dvh1.08.06"'
 *
 * @example buildMime('flac', 'flac', 'audio')
 *   // → 'audio/flac'  (bare — no codecs= parameter)
 *
 * @example buildMime('ac-3', 'mpegts', 'audio')
 *   // → 'video/mp2t; codecs="ac-3"'  (MPEG-TS audio uses video/mp2t)
 *
 * @example buildMime('1', 'wav', 'audio')
 *   // → 'audio/wav; codecs="1"'  (WAV PCM wFormatTag)
 *
 * @param {string} codecString - Bare codec string
 * @param {string} container - Container shorthand key from CONTAINER_MIME
 * @param {string} type - 'video' or 'audio'
 * @returns {string|null} Full MIME string, or null if container+type combo is invalid
 */
export function buildMime(codecString, container, type) {
    const mimeBase = CONTAINER_MIME[container]?.[type];
    if (!mimeBase) return null;

    if (BARE_CONTAINERS.has(container)) return mimeBase;

    return `${mimeBase}; codecs="${codecString}"`;
}


// ==================== INFO BUILDER ====================

/**
 * Build a human-readable info string from scenario parameters.
 *
 * Video: "3840x2160 @ 24fps, 25 Mbps, 10-bit 4:2:0, HDR10 PQ BT.2020, Main Tier"
 * Audio: "5.1 @ 48 kHz, 640 kbps, 24-bit, Spatial"
 *
 * @param {VideoScenario | AudioScenario} scenario
 * @param {MediaType} type
 * @returns {string}
 */
export function buildInfo(scenario, type) {
    const parts = [];

    if (type === 'video') {
        const vs = /** @type {VideoScenario} */ (scenario);
        if (vs.width && vs.height) {
            parts.push(`${vs.width}x${vs.height}`);
        }
        if (vs.framerate) {
            parts.push(`@ ${vs.framerate}fps`);
        }
        if (vs.bitrate) {
            const mbps = vs.bitrate / 1_000_000;
            parts.push(`${mbps % 1 === 0 ? mbps : mbps.toFixed(1)} Mbps`);
        }
        if (vs.bitDepth) {
            const chroma = vs.chromaSubsampling || '4:2:0';
            parts.push(`${vs.bitDepth}-bit ${chroma}`);
        }
        if (vs.hdrFormat) {
            const hdrLabels = {
                hdr10: 'HDR10',
                hdr10plus: 'HDR10+',
                hlg: 'HLG'
            };
            parts.push(hdrLabels[vs.hdrFormat] || vs.hdrFormat);
        }
        if (vs.transferFunction && vs.transferFunction !== 'srgb') {
            parts.push(vs.transferFunction.toUpperCase());
        }
        if (vs.colorGamut && vs.colorGamut !== 'srgb') {
            const gamutLabels = { rec2020: 'BT.2020', p3: 'Display P3' };
            parts.push(gamutLabels[vs.colorGamut] || vs.colorGamut);
        }
        if (vs.tier) {
            const tierLabels = { main: 'Main Tier', high: 'High Tier' };
            parts.push(tierLabels[vs.tier] || vs.tier);
        }
    } else {
        const as = /** @type {AudioScenario} */ (scenario);
        if (as.channels) {
            const channelMap = { 1: 'Mono', 2: 'Stereo', 6: '5.1', 8: '7.1' };
            parts.push(channelMap[as.channels] || `${as.channels}ch`);
        }
        if (as.samplerate) {
            parts.push(`@ ${as.samplerate / 1000} kHz`);
        }
        if (as.bitrate) {
            const kbps = as.bitrate / 1000;
            parts.push(`${kbps % 1 === 0 ? kbps : kbps.toFixed(1)} kbps`);
        }
        if (as.bitDepth) {
            parts.push(`${as.bitDepth}-bit`);
        }
        if (as.spatial) {
            parts.push('Spatial');
        }
    }

    return parts.join(', ');
}


// ==================== MEDIA CONFIG BUILDER ====================

/**
 * Build a mediaConfig object for navigator.mediaCapabilities.decodingInfo().
 *
 * Only includes fields the API accepts:
 *   Video: contentType, width, height, bitrate, framerate, transferFunction?, colorGamut?
 *   Audio: contentType, channels, bitrate, samplerate
 *
 * Display-only scenario fields (bitDepth, chromaSubsampling, tier, hdrFormat)
 * are NOT included — those are encoded in the codec string itself.
 *
 * @param {VideoScenario | AudioScenario} scenario
 * @param {string} mime - Full MIME string from buildMime()
 * @param {MediaType} type
 * @returns {{ video?: Object, audio?: Object }} Config object — caller sets .type to 'file' or 'media-source'
 */
export function buildMediaConfig(scenario, mime, type) {
    const config = {};

    if (type === 'video') {
        const vs = /** @type {VideoScenario} */ (scenario);
        config.video = {
            contentType: mime,
            width: vs.width || 1920,
            height: vs.height || 1080,
            bitrate: vs.bitrate || 5_000_000,
            framerate: vs.framerate || 24
        };
        if (vs.transferFunction) {
            config.video.transferFunction = vs.transferFunction;
        }
        if (vs.colorGamut) {
            config.video.colorGamut = vs.colorGamut;
        }
    } else {
        const as = /** @type {AudioScenario} */ (scenario);
        config.audio = {
            contentType: mime,
            channels: String(as.channels || 2),
            bitrate: as.bitrate || 128_000,
            samplerate: as.samplerate || 48_000
        };
    }

    return config;
}


// ==================== TYPE DEFINITIONS ====================

/**
 * @typedef {'video' | 'audio'} MediaType
 */

/**
 * @typedef {'nonstandard' | 'deprecated' | 'film-grain'} CodecFlag
 */

/**
 * @typedef {'widevine' | 'playready' | 'fairplay' | 'clearkey'} DRMSystemKey
 */

/**
 * @typedef {Object} ContainerMap
 * @property {string[]} file - File playback containers (e.g. ['mp4', 'mkv', 'mov'])
 * @property {string[]} [stream] - Stream containers (e.g. ['fmp4', 'hls', 'dash'])
 */

/**
 * @typedef {Object} VideoScenario
 * @property {string} name - Scenario label (e.g. '4K HDR10 24fps 10-bit')
 * @property {number} width
 * @property {number} height
 * @property {number} bitrate - In bps
 * @property {number} framerate
 * @property {8 | 10 | 12} [bitDepth]
 * @property {'4:2:0' | '4:2:2' | '4:4:4'} [chromaSubsampling]
 * @property {'main' | 'high'} [tier]
 * @property {'pq' | 'hlg' | 'srgb'} [transferFunction] - mediaCapabilities API param
 * @property {'rec2020' | 'p3' | 'srgb'} [colorGamut] - mediaCapabilities API param
 * @property {'hdr10' | 'hdr10plus' | 'hlg'} [hdrFormat] - Display metadata label
 */

/**
 * @typedef {Object} AudioScenario
 * @property {string} name - Scenario label (e.g. '5.1 48kHz 24-bit')
 * @property {1 | 2 | 6 | 8} channels
 * @property {number} bitrate - In bps
 * @property {number} samplerate - In Hz
 * @property {16 | 24 | 32} [bitDepth]
 * @property {boolean} [spatial] - Object/spatial audio capable
 */

/**
 * @typedef {Object} BreakdownToken
 * @property {string} token - Single token from the codec string
 * @property {string} meaning - What this token encodes
 */

/**
 * @typedef {Object} ObjectAudio
 * @property {string} base - Base channel bed (e.g. '7.1')
 * @property {string} technology - Tech name (e.g. 'JOC', 'DTS:X', 'IMS')
 * @property {number} maxObjects - Max simultaneous audio objects
 * @property {string} rendering - Rendering method description
 * @property {number} bitrate - Object audio bitrate in bps
 */

/**
 * @typedef {Object} DVConfig
 * @property {number} profile - DOVIDecoderConfigurationRecord dv_profile
 * @property {number} level - dv_level
 * @property {boolean} rpuPresent - Reference Processing Unit present
 * @property {boolean} elPresent - Enhancement Layer present
 * @property {boolean} blPresent - Base Layer present
 * @property {number} blSignalCompat - BL signal compatibility ID
 */

/**
 * @typedef {Object} StreamingVariantHLS
 * @property {string} signal - Signaling method name
 * @property {string} m3u8 - HLS manifest snippet
 * @property {string} notes
 */

/**
 * @typedef {Object} StreamingVariantDASH
 * @property {string} signal - Signaling method name
 * @property {string} mpd - DASH manifest snippet
 * @property {string} notes
 */

/**
 * @typedef {Object} Reference
 * @property {string} title
 * @property {string} [url]
 */

/**
 * @typedef {Object} Education
 * @property {BreakdownToken[]} breakdown - Codec string token-by-token
 * @property {string} overview - Short, precise description of this codec test
 * @property {ObjectAudio} [objectAudio] - Object-based audio metadata
 * @property {DVConfig} [dvConfig] - DOVIDecoderConfigurationRecord (dvcC/dvvC box)
 * @property {Record<string, string>} [platforms] - Platform-specific behavior notes
 * @property {{ hls?: StreamingVariantHLS[], dash?: StreamingVariantDASH[] }} [streaming]
 * @property {Record<string, string>} [containerNotes] - Per-container quirks
 * @property {Record<string, string>} [drm] - Per-DRM-system notes
 * @property {Reference[]} [references] - Spec citations
 */

/**
 * @typedef {Object} CodecRecord
 * @property {string} codec - Bare codec string (e.g. 'hvc1.2.4.L153.B0')
 * @property {string} name - Descriptive card title
 * @property {ContainerMap} containers
 * @property {DRMSystemKey[]} [drm] - DRM systems to test (record-level, not per-scenario)
 * @property {(VideoScenario | AudioScenario)[]} scenarios - Test scenarios (same codec, different params)
 * @property {CodecFlag[]} [flags]
 * @property {Education} [education]
 */

/**
 * @typedef {Object} CodecGroup
 * @property {string} category - Display name (e.g. 'HEVC/H.265')
 * @property {MediaType} type
 * @property {string} description - Group summary for UI tooltips
 * @property {CodecRecord[]} codecs
 */


// ==================== SOURCE DATABASE ====================

/**
 * Group keys follow the pattern: {type}_{codec_family}
 *
 * Group-level `type` determines media type for all codecs in the group.
 * The UI uses this for section placement — MPEG-TS audio (video/mp2t MIME)
 * belongs in audio sections because the group type is 'audio'.
 */
/** @type {Record<string, CodecGroup>} */
export const codecSource = {

    // ── VIDEO: Base codec standard ───────────────────────────

    video_hevc: {
        category: 'HEVC/H.265',
        type: 'video',
        description: 'Main, Main 10, Main Still Picture, High Tier. Levels 3.1–6.1. SDR, HDR10 (PQ), HLG.',
        codecs: [

            // ── hvc1.1.6.L93.B0 ──

            {
                codec: 'hvc1.1.6.L93.B0',
                name: '720p SDR 24fps 8-bit',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '720p SDR 24fps 8-bit',
                    width: 1280,
                    height: 720,
                    framerate: 24,
                    bitrate: 3_000_000,
                    bitDepth: 8,
                    chromaSubsampling: '4:2:0',
                },
                    {
                        name: '720p SDR 23.976fps 8-bit',
                        width: 1280,
                        height: 720,
                        framerate: 23.976,
                        bitrate: 3_000_000,
                    }
                ],
                education: {
                    breakdown: [
                        {
                            token: 'hvc1',
                            meaning: 'HEVC with parameter sets stored in the MP4 sample entry (out-of-band). VPS/SPS/PPS written once, not repeated per access unit. Required by Apple HLS.'
                        },
                        {
                            token: '1',
                            meaning: 'Main Profile (profile_idc=1). 8-bit 4:2:0 only. Baseline SDR profile — universally supported on HEVC-capable devices.'
                        },
                        {
                            token: '6',
                            meaning: 'Profile compatibility flags. Value 6 = bits 1+2 set, backward-compatible with Main and Main 10 decoders.'
                        },
                        {
                            token: 'L93',
                            meaning: 'Level 3.1, Main Tier. L = Main Tier, 93 = level_idc (3.1 × 30). max_luma_ps=983,040 (up to 1280×768). 10 Mbps peak bitrate.'
                        },
                        {
                            token: 'B0',
                            meaning: 'No additional constraint flags beyond the profile.'
                        }
                    ],
                    overview: 'HEVC Main Profile at Level 3.1 — baseline 8-bit SDR capped at 720p. Roughly 50% better compression than H.264 High Profile at the same quality. The safe default for SDR content on any HEVC-capable device.',
                    platforms: {
                        apple: 'Hardware decode on A8+ (iPhone 6), A8X+ (iPad Air 2), Mac 2015+ (Skylake), all Apple Silicon. HLS requires hvc1 tag + fMP4. SDR is the default VIDEO-RANGE.',
                        lg: 'All webOS 3.0+ (2016+). Hardware decode via SoC. Both hvc1 and hev1 tags accepted.',
                        android: 'Hardware decode on Android 5.0+ via MediaCodec (SoC-dependent: Snapdragon 610+, Exynos 7420+, Helio P20+). Software fallback too slow for real-time 1080p.'
                    },
                    streaming: {
                        hls: [
                            {
                                signal: 'Standard SDR',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=3000000,CODECS="hvc1.1.6.L93.B0,mp4a.40.2",RESOLUTION=1280x720
hevc_main_720p.m3u8`,
                                notes: 'No VIDEO-RANGE needed — SDR is the default. Apple requires hvc1 tag. Segments must be fMP4 (MPEG-TS not supported for HEVC in HLS). fMP4 and CMAF segments share the same video/mp4 MIME as regular MP4 — the difference is internal structure (fragmented moof+mdat vs progressive moov). Browser APIs return the same codec support for both, but mediaCapabilities distinguishes file vs media-source playback.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'Standard SDR',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="hvc1.1.6.L93.B0">
  <Representation bandwidth="3000000" width="1280" height="720" frameRate="24"/>
</AdaptationSet>`,
                                notes: 'No supplemental properties needed for SDR. DASH uses ISOBMFF (fMP4) segments exclusively. CMAF (ISO 23000-19) is a constrained fMP4 profile designed for dual HLS+DASH compatibility — same MIME, same codec string, interchangeable segments.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF — the universal HEVC container. Best browser support across all platforms. Used as the base for fMP4, CMAF, HLS, and DASH segments.',
                        mkv: 'Browser support for video/x-matroska is limited — desktop browsers typically reject the MIME type. Android Chrome may accept it via OS-level MediaCodec.',
                        mov: 'QuickTime container. Well-supported on Apple platforms, inconsistent elsewhere.',
                        fmp4: 'Fragmented MP4 — same MIME as MP4 (video/mp4) but with movie fragments (moof+mdat) instead of a single moov. The segment format for HLS and DASH.',
                        cmaf: 'Common Media Application Format (ISO 23000-19). Constrained fMP4 profile compatible with both HLS and DASH. Same MIME as MP4.',
                        mpegts: 'MPEG-TS — broadcast container (DVB-T2, ATSC 3.0) and legacy HLS segment format. HEVC in TS uses Annex B NAL format with start codes.'
                    },
                    references: [
                        {
                            title: 'ITU-T H.265 | ISO/IEC 23008-2',
                            url: 'https://www.itu.int/rec/T-REC-H.265'
                        },
                        {
                            title: 'ISO/IEC 14496-15 Annex E'
                        },
                        {
                            title: 'Apple HLS Authoring Spec',
                            url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices'
                        },
                        {
                            title: 'webOS TV AV Formats',
                            url: 'https://webostv.developer.lge.com/develop/specifications/video-audio-250'
                        },
                        {
                            title: 'Android Supported Media Formats',
                            url: 'https://developer.android.com/media/platform/supported-formats'
                        }
                    ]
                }
            },

            // ── hvc1.1.6.L120.B0 ──

            {
                codec: 'hvc1.1.6.L120.B0',
                name: '1080p SDR 30fps 8-bit',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [
                    {
                        name: '1080p SDR 24fps 8-bit',
                        width: 1920,
                        height: 1080,
                        framerate: 24,
                        bitrate: 5_000_000,
                        bitDepth: 8,
                        chromaSubsampling: '4:2:0',
                    },
                    {
                        name: '1080p SDR 30fps 8-bit',
                        width: 1920,
                        height: 1080,
                        framerate: 30,
                        bitrate: 5_000_000,
                        bitDepth: 8,
                        chromaSubsampling: '4:2:0',
                    },
                    {
                        name: '1080p SDR 23.976fps 8-bit',
                        width: 1920,
                        height: 1080,
                        framerate: 23.976,
                        bitrate: 8_000_000,
                    },
                    {
                        name: '1080p SDR 29.97fps 8-bit',
                        width: 1920,
                        height: 1080,
                        framerate: 29.97,
                        bitrate: 10_000_000,
                    }
                ],
                education: {
                    breakdown: [
                        {
                            token: 'hvc1',
                            meaning: 'HEVC with parameter sets in the sample entry (out-of-band). Required by Apple HLS.'
                        },
                        {
                            token: '1',
                            meaning: 'Main Profile (profile_idc=1). 8-bit 4:2:0 only. Baseline SDR profile.'
                        },
                        {
                            token: '6',
                            meaning: 'Profile compatibility flags. Bits 1+2 set — backward-compatible with Main and Main 10 decoders.'
                        },
                        {
                            token: 'L120',
                            meaning: 'Level 4.0, Main Tier. 120 = 4.0 × 30. Supports 1080p@30fps or 2048×1080@30fps. Peak bitrate 12 Mbps Main Tier.'
                        },
                        {
                            token: 'B0',
                            meaning: 'No additional constraint flags.'
                        }
                    ],
                    overview: 'HEVC Main Profile at Level 4.0 — the standard delivery level for 1080p SDR. Raises the bitrate ceiling to 12 Mbps (vs 10 Mbps at Level 3.1) and adds 2K resolution support. Apple TV+ uses this level for SDR catalog content. Some older HEVC decoders only implement Level 3.1, making Level 4.0 a useful compatibility boundary.',
                    platforms: {
                        apple: 'Hardware decode on A8+ (iPhone 6), all Apple Silicon. The standard HLS HEVC level for 1080p SDR. No VIDEO-RANGE attribute needed in the manifest.',
                        lg: 'All webOS 3.0+ (2016+). Level 4.0 widely supported across all HEVC-capable webOS SoCs.',
                        android: 'Hardware decode on Android 5.0+ via MediaCodec. Level 4.0 supported on all HEVC-capable SoCs (Snapdragon 610+, Exynos 7420+, Helio P20+).'
                    },
                    streaming: {
                        hls: [
                            {
                                signal: 'Standard SDR',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=5000000,CODECS="hvc1.1.6.L120.B0,mp4a.40.2",RESOLUTION=1920x1080,FRAME-RATE=30
hevc_main_1080p30.m3u8`,
                                notes: 'SDR is the default VIDEO-RANGE. Level 4.0 is the standard HLS HEVC level for 1080p SDR delivery. Segments must be fMP4 (MPEG-TS not supported for HEVC in HLS).'
                            }
                        ],
                        dash: [
                            {
                                signal: 'Standard SDR',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="hvc1.1.6.L120.B0">
  <Representation bandwidth="5000000" width="1920" height="1080" frameRate="30"/>
</AdaptationSet>`,
                                notes: 'No supplemental properties needed for SDR. DASH uses ISOBMFF (fMP4) segments.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF — universal HEVC container. Best browser support. Base format for fMP4, CMAF, HLS, and DASH segments.',
                        mkv: 'video/x-matroska — limited browser support. Desktop browsers typically reject the MIME. Android Chrome may accept via OS-level MediaCodec.',
                        mov: 'QuickTime container. Well-supported on Apple platforms, inconsistent elsewhere.',
                        fmp4: 'Fragmented MP4 — same video/mp4 MIME but with movie fragments (moof+mdat). The segment format for HLS and DASH.',
                        cmaf: 'CMAF (ISO 23000-19) — constrained fMP4 profile for dual HLS+DASH compatibility. Same video/mp4 MIME.',
                        mpegts: 'MPEG-TS — broadcast container (DVB-T2, ATSC 3.0) and legacy HLS segment format. HEVC in TS uses Annex B NAL format with start codes.'
                    },
                    references: [
                        {
                            title: 'ITU-T H.265 | ISO/IEC 23008-2',
                            url: 'https://www.itu.int/rec/T-REC-H.265'
                        },
                        {
                            title: 'ISO/IEC 14496-15 Annex E'
                        },
                        {
                            title: 'Apple HLS Authoring Spec',
                            url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices'
                        }
                    ]
                }
            },

            // ── hvc1.1.6.L123.B0 ──

            {
                codec: 'hvc1.1.6.L123.B0',
                name: '1080p SDR 60fps 8-bit',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '1080p SDR 60fps 8-bit',
                    width: 1920,
                    height: 1080,
                    framerate: 60,
                    bitrate: 8_000_000,
                    bitDepth: 8,
                    chromaSubsampling: '4:2:0',
                },
                    {
                        name: '1080p SDR 59.94fps 8-bit',
                        width: 1920,
                        height: 1080,
                        framerate: 59.94,
                        bitrate: 18_000_000,
                    }
                ],
                education: {
                    breakdown: [
                        {
                            token: 'hvc1',
                            meaning: 'HEVC with parameter sets in the sample entry (out-of-band). Required by Apple HLS.'
                        },
                        {
                            token: '1',
                            meaning: 'Main Profile (profile_idc=1). 8-bit 4:2:0 only. Baseline SDR profile.'
                        },
                        {
                            token: '6',
                            meaning: 'Profile compatibility flags. Bits 1+2 set — backward-compatible with Main and Main 10 decoders.'
                        },
                        {
                            token: 'L123',
                            meaning: 'Level 4.1, Main Tier. 123 = 4.1 × 30. Max 2048×1080@60fps, 20 Mbps peak. The 1080p high frame rate level.'
                        },
                        {
                            token: 'B0',
                            meaning: 'No additional constraint flags.'
                        }
                    ],
                    overview: 'HEVC Main Profile at Level 4.1 — doubles the frame rate ceiling from 30fps (Level 4.0) to 60fps at 1080p. Target level for high frame rate content: gaming streams, sports, screen recordings. The Level 4.0 → 4.1 boundary matters because some older hardware decoders handle 1080p@30 but not 1080p@60.',
                    platforms: {
                        apple: 'Hardware decode on A8+ (iPhone 6), all Apple Silicon. 60fps HEVC supported since iOS 11. HLS manifests should include FRAME-RATE=60 for proper variant selection.',
                        lg: 'All webOS 3.0+ (2016+). Level 4.1 supported on all HEVC-capable webOS SoCs. 60fps playback depends on display refresh rate.',
                        android: 'Hardware decode on Android 5.0+ via MediaCodec. Level 4.1 supported on Snapdragon 625+, Exynos 7885+. Some budget SoCs (Snapdragon 4xx) cap at Level 4.0 / 30fps.'
                    },
                    streaming: {
                        hls: [
                            {
                                signal: 'High Frame Rate SDR',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=8000000,CODECS="hvc1.1.6.L123.B0,mp4a.40.2",RESOLUTION=1920x1080,FRAME-RATE=60
hevc_main_1080p60.m3u8`,
                                notes: 'FRAME-RATE=60 in the manifest enables proper variant selection for HFR-capable displays. Without it, players may prefer a lower-resolution 30fps variant.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'High Frame Rate SDR',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="hvc1.1.6.L123.B0">
  <Representation bandwidth="8000000" width="1920" height="1080" frameRate="60"/>
</AdaptationSet>`,
                                notes: 'DASH MPD frameRate attribute enables bitrate ladder selection based on device frame rate capability.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF — universal HEVC container. Best browser support. Base format for fMP4, CMAF, HLS, and DASH segments.',
                        mkv: 'video/x-matroska — limited browser support. MKV is common for 60fps gaming captures (OBS output) but browsers rarely accept the MIME.',
                        mov: 'QuickTime container. 60fps MOV common from iPhone camera recordings.',
                        fmp4: 'Fragmented MP4 — same video/mp4 MIME but with movie fragments (moof+mdat). The segment format for HLS and DASH.',
                        cmaf: 'CMAF (ISO 23000-19) — constrained fMP4 profile for dual HLS+DASH compatibility. Same video/mp4 MIME.',
                        mpegts: 'MPEG-TS — broadcast container (DVB-T2, ATSC 3.0) and legacy HLS segment format. HEVC in TS uses Annex B NAL format with start codes.'
                    },
                    references: [
                        {
                            title: 'ITU-T H.265 | ISO/IEC 23008-2',
                            url: 'https://www.itu.int/rec/T-REC-H.265'
                        },
                        {
                            title: 'ISO/IEC 14496-15 Annex E'
                        },
                        {
                            title: 'Apple HLS Authoring Spec',
                            url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices'
                        }
                    ]
                }
            },

            // ── hvc1.1.6.L150.B0 ──

            {
                codec: 'hvc1.1.6.L150.B0',
                name: '4K SDR 30fps 8-bit',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K SDR 30fps 8-bit',
                    width: 3840,
                    height: 2160,
                    framerate: 30,
                    bitrate: 15_000_000,
                    bitDepth: 8,
                    chromaSubsampling: '4:2:0',
                },
                    {
                        name: '4K SDR 23.976fps 8-bit',
                        width: 3840,
                        height: 2160,
                        framerate: 23.976,
                        bitrate: 18_000_000,
                    },
                    {
                        name: '4K SDR 29.97fps 8-bit',
                        width: 3840,
                        height: 2160,
                        framerate: 29.97,
                        bitrate: 22_000_000,
                    }
                ],
                education: {
                    breakdown: [
                        {
                            token: 'hvc1',
                            meaning: 'HEVC with parameter sets in the sample entry (out-of-band). Required by Apple HLS.'
                        },
                        {
                            token: '1',
                            meaning: 'Main Profile (profile_idc=1). 8-bit 4:2:0 only. No HDR metadata.'
                        },
                        {
                            token: '6',
                            meaning: 'Profile compatibility flags. Bits 1+2 set — backward-compatible with Main and Main 10 decoders.'
                        },
                        {
                            token: 'L150',
                            meaning: 'Level 5.0, Main Tier. 150 = 5.0 × 30. Supports 3840×2160@30fps. Peak bitrate 25 Mbps Main Tier. The base 4K level.'
                        },
                        {
                            token: 'B0',
                            meaning: 'No additional constraint flags.'
                        }
                    ],
                    overview: 'HEVC Main Profile at Level 5.0 — 4K resolution in 8-bit SDR. Uncommon in practice because most 4K content uses Main 10 Profile (10-bit) even for SDR — 10-bit encoding reduces visible banding in gradients regardless of HDR status. Tests whether the browser HEVC decoder reports support for 4K at 8-bit, which some implementations skip in favor of mandatory 10-bit at Level 5.0+.',
                    platforms: {
                        apple: 'Hardware 4K decode on A10X+ (iPad Pro 2017), A11+ (iPhone X), Mac 2017+ (Kaby Lake), all Apple Silicon. 8-bit 4K SDR supported but rarely used — Apple prefers Main 10 for 4K content.',
                        lg: 'All webOS 3.0+ (2016+). 4K HEVC decode via SoC. 8-bit 4K SDR accepted but LG panels natively operate at 10-bit.',
                        android: 'Hardware 4K decode on flagship SoCs (Snapdragon 820+, Exynos 8890+). 8-bit 4K support depends on SoC — some only expose Main 10 for Level 5.0+.'
                    },
                    streaming: {
                        hls: [
                            {
                                signal: '4K SDR',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=15000000,CODECS="hvc1.1.6.L150.B0,mp4a.40.2",RESOLUTION=3840x2160,FRAME-RATE=30
hevc_main_4k.m3u8`,
                                notes: '4K SDR with Main Profile (8-bit). No VIDEO-RANGE needed. In practice, 4K HLS content almost always uses Main 10 for banding reduction.'
                            }
                        ],
                        dash: [
                            {
                                signal: '4K SDR',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="hvc1.1.6.L150.B0">
  <Representation bandwidth="15000000" width="3840" height="2160" frameRate="30"/>
</AdaptationSet>`,
                                notes: '4K SDR in DASH. No supplemental properties. Bandwidth 15 Mbps typical for 4K SDR.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF — universal HEVC container. 4K MP4 is the standard distribution format for SDR content.',
                        mkv: 'video/x-matroska — limited browser support. MKV is the dominant container for 4K SDR rips in media server libraries (Jellyfin, Plex).',
                        mov: 'QuickTime container. 4K MOV from professional cameras (ProRes + HEVC). Apple platforms handle it well.',
                        fmp4: 'Fragmented MP4 — same video/mp4 MIME but with movie fragments (moof+mdat). The segment format for HLS and DASH.',
                        cmaf: 'CMAF (ISO 23000-19) — constrained fMP4 profile for dual HLS+DASH compatibility. Same video/mp4 MIME.',
                        mpegts: 'MPEG-TS — broadcast container (DVB-T2, ATSC 3.0) and legacy HLS segment format. HEVC in TS uses Annex B NAL format with start codes.'
                    },
                    references: [
                        {
                            title: 'ITU-T H.265 | ISO/IEC 23008-2',
                            url: 'https://www.itu.int/rec/T-REC-H.265'
                        },
                        {
                            title: 'ISO/IEC 14496-15 Annex E'
                        },
                        {
                            title: 'Apple HLS Authoring Spec',
                            url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices'
                        }
                    ]
                }
            },

            // ── hvc1.2.4.L120.B0 ──

            {
                codec: 'hvc1.2.4.L120.B0',
                name: '1080p SDR 30fps 10-bit',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [
                    {
                        name: '1080p SDR 30fps 10-bit',
                        width: 1920,
                        height: 1080,
                        framerate: 30,
                        bitrate: 6_000_000,
                        bitDepth: 10,
                        chromaSubsampling: '4:2:0',
                    },
                    {
                        name: '1080p HDR10 30fps 10-bit',
                        width: 1920,
                        height: 1080,
                        framerate: 30,
                        bitrate: 8_000_000,
                        bitDepth: 10,
                        chromaSubsampling: '4:2:0',
                        transferFunction: 'pq',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hdr10',
                    },
                    {
                        name: '1080p HLG 30fps 10-bit',
                        width: 1920,
                        height: 1080,
                        framerate: 30,
                        bitrate: 8_000_000,
                        bitDepth: 10,
                        chromaSubsampling: '4:2:0',
                        transferFunction: 'hlg',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hlg',
                    },
                    {
                        name: '1080p SDR 23.976fps 10-bit',
                        width: 1920,
                        height: 1080,
                        framerate: 23.976,
                        bitrate: 8_000_000,
                    },
                    {
                        name: '1080p SDR 29.97fps 10-bit',
                        width: 1920,
                        height: 1080,
                        framerate: 29.97,
                        bitrate: 10_000_000,
                    }
                ],
                education: {
                    breakdown: [
                        {
                            token: 'hvc1',
                            meaning: 'HEVC with parameter sets in the sample entry (out-of-band). Required by Apple HLS.'
                        },
                        {
                            token: '2',
                            meaning: 'Main 10 Profile (profile_idc=2). Supports 8-bit and 10-bit 4:2:0. "10" means up to 10 bits per component, not that it must be 10-bit.'
                        },
                        {
                            token: '4',
                            meaning: 'Profile compatibility flags. Bit 2 set = Main 10 compatible. A Main 10 decoder can play Main Profile streams, but not vice versa.'
                        },
                        {
                            token: 'L120',
                            meaning: 'Level 4.0, Main Tier. 120 = 4.0 × 30. Supports 1080p@30fps or 2K@30fps. Peak bitrate 12 Mbps Main Tier.'
                        },
                        {
                            token: 'B0',
                            meaning: 'No additional constraint flags.'
                        }
                    ],
                    overview: 'HEVC Main 10 at Level 4.0 for 1080p SDR content in 10-bit. 10-bit encoding without HDR is increasingly common — Netflix and other streaming services encode SDR content in 10-bit HEVC because it reduces banding in gradients (skies, fog, dark scenes) even without HDR transfer functions. Tests whether the browser reports Main 10 support at 1080p without requiring HDR metadata.',
                    platforms: {
                        apple: 'Hardware decode on A8+ (iPhone 6), all Apple Silicon. Main 10 SDR is the preferred encoding for Apple TV+ SDR catalog content.',
                        lg: 'All webOS 3.0+ (2016+). LG panels natively operate at 10-bit, so Main 10 SDR is decoded without bit-depth conversion.',
                        android: 'Hardware decode on Android 5.0+ via MediaCodec. Main 10 requires HEVCProfileMain10 capability — all HEVC-capable SoCs support it.'
                    },
                    streaming: {
                        hls: [
                            {
                                signal: 'SDR 10-bit',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=6000000,CODECS="hvc1.2.4.L120.B0,mp4a.40.2",RESOLUTION=1920x1080,FRAME-RATE=30
hevc_main10_1080p.m3u8`,
                                notes: 'No VIDEO-RANGE needed — SDR is the default. The Main 10 codec string (profile 2) tells the player a 10-bit decoder is required, but the transfer function is still sRGB.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'SDR 10-bit',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="hvc1.2.4.L120.B0">
  <Representation bandwidth="6000000" width="1920" height="1080" frameRate="30"/>
</AdaptationSet>`,
                                notes: 'No CICP supplemental properties needed for SDR 10-bit. The codec string profile field signals the bit depth requirement.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF — universal HEVC container. Best browser support. Base format for fMP4, CMAF, HLS, and DASH segments.',
                        mkv: 'video/x-matroska — limited browser support. Common for media server libraries (Jellyfin, Plex) where 10-bit SDR encodes are popular for quality.',
                        mov: 'QuickTime container. Apple platforms handle Main 10 MOV well.',
                        fmp4: 'Fragmented MP4 — same video/mp4 MIME but with movie fragments (moof+mdat). The segment format for HLS and DASH.',
                        cmaf: 'CMAF (ISO 23000-19) — constrained fMP4 profile for dual HLS+DASH compatibility. Same video/mp4 MIME.',
                        mpegts: 'MPEG-TS — broadcast container (DVB-T2, ATSC 3.0) and legacy HLS segment format. HEVC in TS uses Annex B NAL format with start codes.'
                    },
                    references: [
                        {
                            title: 'ITU-T H.265 | ISO/IEC 23008-2',
                            url: 'https://www.itu.int/rec/T-REC-H.265'
                        },
                        {
                            title: 'ISO/IEC 14496-15 Annex E'
                        },
                        {
                            title: 'Apple HLS Authoring Spec',
                            url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices'
                        }
                    ]
                }
            },

            // ── hvc1.2.4.L123.B0 ──

            {
                codec: 'hvc1.2.4.L123.B0',
                name: '1080p HDR10 60fps 10-bit',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [
                    {
                        name: '1080p HDR10 60fps 10-bit',
                        width: 1920,
                        height: 1080,
                        framerate: 60,
                        bitrate: 12_000_000,
                        bitDepth: 10,
                        chromaSubsampling: '4:2:0',
                        transferFunction: 'pq',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hdr10',
                    },
                    {
                        name: '1080p HLG 60fps 10-bit',
                        width: 1920,
                        height: 1080,
                        framerate: 60,
                        bitrate: 12_000_000,
                        bitDepth: 10,
                        chromaSubsampling: '4:2:0',
                        transferFunction: 'hlg',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hlg',
                    },
                    {
                        name: '1080p HDR10 59.94fps 10-bit',
                        width: 1920,
                        height: 1080,
                        framerate: 59.94,
                        bitrate: 18_000_000,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020',
                    }
                ],
                education: {
                    breakdown: [
                        {
                            token: 'hvc1',
                            meaning: 'HEVC with parameter sets in the sample entry (out-of-band). Required by Apple HLS.'
                        },
                        {
                            token: '2',
                            meaning: 'Main 10 Profile (profile_idc=2). Supports 8-bit and 10-bit 4:2:0.'
                        },
                        {
                            token: '4',
                            meaning: 'Profile compatibility flags. Bit 2 set = Main 10 compatible.'
                        },
                        {
                            token: 'L123',
                            meaning: 'Level 4.1, Main Tier. 123 = 4.1 × 30. Supports 2048×1080@60fps. Peak bitrate 20 Mbps Main Tier.'
                        },
                        {
                            token: 'B0',
                            meaning: 'No additional constraint flags.'
                        }
                    ],
                    overview: 'HEVC Main 10 at Level 4.1 — the first level supporting 1080p@60fps. Level 4.0 caps at 30fps for 1080p, so HDR10/HLG content at higher frame rates requires 4.1. Common for live HDR sports and broadcast.',
                    platforms: {
                        apple: 'Hardware decode on A8+ (iPhone 6), all Apple Silicon. Level 4.1 is the minimum for 1080p HDR at 60fps in HLS.',
                        android: 'Hardware decode on Android 5.0+ via MediaCodec. Level 4.1 Main 10 is widely supported on HEVC-capable SoCs.'
                    },
                    streaming: {
                        hls: [
                            {
                                signal: 'HDR10 PQ 1080p60',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=12000000,CODECS="hvc1.2.4.L123.B0,mp4a.40.2",RESOLUTION=1920x1080,VIDEO-RANGE=PQ
hdr10_1080p60.m3u8`,
                                notes: 'VIDEO-RANGE=PQ signals HDR10 to iOS/tvOS. Level 4.1 is the minimum level for 1080p@60fps. Always provide an SDR fallback variant for non-HDR devices.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'HDR10 PQ with CICP',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="hvc1.2.4.L123.B0">
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="16"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <Representation bandwidth="12000000" width="1920" height="1080" frameRate="60"/>
</AdaptationSet>`,
                                notes: 'CICP TransferCharacteristics 16 = PQ (ST 2084). ColourPrimaries 9 = BT.2020. 1080p@60fps HDR10 for live broadcast and sports.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF — standard 1080p HDR10 container. HDR metadata (mastering display, content light level) in colr/mdcv/clli boxes.',
                        mkv: 'video/x-matroska — limited browser support. MKV is common for 1080p HDR10 content in media server libraries.',
                        mov: 'QuickTime — 1080p HDR10 MOV from professional workflows. Apple platforms handle it natively.',
                        fmp4: 'Fragmented MP4 — same video/mp4 MIME. The segment format for HLS and DASH 1080p HDR10 streaming.',
                        cmaf: 'CMAF (ISO 23000-19) — constrained fMP4 for dual HLS+DASH. Same video/mp4 MIME.',
                        mpegts: 'MPEG-TS — 1080p HDR10 in transport stream for broadcast (DVB-T2, ATSC 3.0). HEVC in TS uses Annex B NAL format.'
                    },
                    references: [
                        {
                            title: 'ITU-T H.265 | ISO/IEC 23008-2',
                            url: 'https://www.itu.int/rec/T-REC-H.265'
                        },
                        {
                            title: 'ISO/IEC 14496-15 Annex E'
                        }
                    ]
                }
            },

            // ── hvc1.2.4.L153.B0 ──

            {
                codec: 'hvc1.2.4.L153.B0',
                name: 'Main 10, Level 5.1',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [
                    {
                        name: '4K HDR10 24fps 10-bit',
                        width: 3840,
                        height: 2160,
                        framerate: 24,
                        bitrate: 25_000_000,
                        bitDepth: 10,
                        chromaSubsampling: '4:2:0',
                        transferFunction: 'pq',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hdr10'
                    },
                    {
                        name: '4K HLG 24fps 10-bit',
                        width: 3840,
                        height: 2160,
                        framerate: 24,
                        bitrate: 25_000_000,
                        bitDepth: 10,
                        chromaSubsampling: '4:2:0',
                        transferFunction: 'hlg',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hlg'
                    },
                    {
                        name: '4K HDR10 60fps 10-bit',
                        width: 3840,
                        height: 2160,
                        framerate: 60,
                        bitrate: 40_000_000,
                        bitDepth: 10,
                        chromaSubsampling: '4:2:0',
                        transferFunction: 'pq',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hdr10'
                    },
                    {
                        name: '4K HDR10 23.976fps 10-bit',
                        width: 3840,
                        height: 2160,
                        framerate: 23.976,
                        bitrate: 25_000_000,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020',
                    },
                    {
                        name: '4K HDR10 59.94fps 10-bit',
                        width: 3840,
                        height: 2160,
                        framerate: 59.94,
                        bitrate: 35_000_000,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020',
                    }
                ],
                education: {
                    breakdown: [
                        {
                            token: 'hvc1',
                            meaning: 'HEVC with parameter sets in the sample entry (out-of-band). Same tag as Main Profile — the profile_idc field (next token) distinguishes Main from Main 10.'
                        },
                        {
                            token: '2',
                            meaning: 'Main 10 Profile (profile_idc=2). Supports 8-bit and 10-bit 4:2:0. Required for all HDR content (HDR10, HLG, Dolby Vision base layer).'
                        },
                        {
                            token: '4',
                            meaning: 'Profile compatibility flags. Bit 2 set = Main 10 compatible. Differs from Main Profile (which uses 6 = bits 1+2).'
                        },
                        {
                            token: 'L153',
                            meaning: 'Level 5.1, Main Tier. 153 = 5.1 × 30. Supports 4K@60fps (or 4K@30fps with higher bitrate headroom). Peak bitrate 40 Mbps. The standard 4K streaming level.'
                        },
                        {
                            token: 'B0',
                            meaning: 'No additional constraint flags. HDR10 signaling (PQ transfer function, BT.2020 primaries) is in the stream metadata and mediaCapabilities config, not in the codec string.'
                        }
                    ],
                    overview: 'HEVC Main 10 with HDR10 — the baseline HDR format. Uses 10-bit color depth, PQ (Perceptual Quantizer, SMPTE ST 2084) transfer function, and BT.2020 wide color gamut. Static metadata (MaxCLL, MaxFALL) defines content brightness characteristics. The codec string alone does not signal HDR — that comes from transferFunction and colorGamut in mediaCapabilities, or VIDEO-RANGE=PQ in HLS.',
                    platforms: {
                        apple: 'Hardware decode on A10+ (iPhone 7), A10X+ (iPad Pro 2017), Mac 2018+ (T2 or Apple Silicon). Safari requires VIDEO-RANGE=PQ in HLS manifests. hvc1 tag required.',
                        lg: 'All webOS 3.0+ (2016+). Hardware decode via SoC. Both hvc1 and hev1 accepted. HEVC licensing built-in.',
                        android: 'Hardware decode requires Android 7.0+ with MediaCodec HEVCProfileMain10HDR10. Snapdragon 820+, Exynos 7420+. Software fallback not viable for 4K HDR.'
                    },
                    streaming: {
                        hls: [
                            {
                                signal: 'HDR10 PQ',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=25000000,CODECS="hvc1.2.4.L153.B0,mp4a.40.2",RESOLUTION=3840x2160,VIDEO-RANGE=PQ
hdr10_4k.m3u8`,
                                notes: 'VIDEO-RANGE=PQ signals HDR10 to iOS/tvOS. Always provide an SDR fallback variant. fMP4 segments required — MPEG-TS not recommended for HEVC HLS but technically supported by some players.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'HDR10 PQ with CICP',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="hvc1.2.4.L153.B0">
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="16"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <Representation bandwidth="25000000" width="3840" height="2160" frameRate="24"/>
</AdaptationSet>`,
                                notes: 'CICP TransferCharacteristics 16 = PQ (ST 2084). ColourPrimaries 9 = BT.2020. Explicit DASH signaling for HDR10.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF — the standard 4K HDR10 container. HDR metadata (mastering display, content light level) stored in colr/mdcv/clli boxes.',
                        mkv: 'video/x-matroska — dominant container for 4K HDR10 content in media server libraries. HDR metadata in Matroska colour elements.',
                        mov: 'QuickTime — Apple platforms. HDR10 MOV from professional workflows (DaVinci Resolve, Final Cut Pro).',
                        mpegts: 'MPEG Transport Stream — used for broadcast (DVB-T2, ATSC 3.0) and legacy HLS. HEVC uses Annex B NAL format with start codes. HDR SEI messages must repeat per segment for random access.',
                        fmp4: 'Fragmented MP4 — recommended for HEVC HLS/DASH. HDR metadata in the init segment, not repeated per fragment.',
                        cmaf: 'CMAF (ISO 23000-19) — constrained fMP4 for dual HLS+DASH. Same video/mp4 MIME, interchangeable segments.'
                    },
                    references: [
                        {
                            title: 'ITU-T H.265 | ISO/IEC 23008-2',
                            url: 'https://www.itu.int/rec/T-REC-H.265'
                        },
                        {
                            title: 'ISO/IEC 14496-15 Annex E'
                        },
                        {
                            title: 'SMPTE ST 2084 (PQ)'
                        },
                        {
                            title: 'Apple HLS Authoring Spec',
                            url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices'
                        },
                        {
                            title: 'webOS TV AV Formats',
                            url: 'https://webostv.developer.lge.com/develop/specifications/video-audio-250'
                        },
                        {
                            title: 'Android Supported Media Formats',
                            url: 'https://developer.android.com/media/platform/supported-formats'
                        }
                    ]
                }
            },

            // ── hvc1.2.4.H153.B0 ──

            {
                codec: 'hvc1.2.4.H153.B0',
                name: '4K HDR10 60fps High Tier',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K HDR10 60fps 10-bit',
                    width: 3840,
                    height: 2160,
                    framerate: 60,
                    bitrate: 50_000_000,
                    bitDepth: 10,
                    chromaSubsampling: '4:2:0',
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10'
                },
                    {
                        name: '4K HDR10 59.94fps High Tier',
                        width: 3840,
                        height: 2160,
                        framerate: 59.94,
                        bitrate: 80_000_000,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020',
                    }
                ],
                education: {
                    breakdown: [
                        {
                            token: 'hvc1',
                            meaning: 'HEVC with parameter sets in the sample entry (out-of-band).'
                        },
                        {
                            token: '2',
                            meaning: 'Main 10 Profile (profile_idc=2). 10-bit 4:2:0.'
                        },
                        {
                            token: '4',
                            meaning: 'Profile compatibility flags. Bit 2 set = Main 10 compatible.'
                        },
                        {
                            token: 'H153',
                            meaning: 'Level 5.1, HIGH Tier. H prefix = High Tier (vs L for Main Tier). Same resolution/framerate as Main Tier but doubles the max bitrate: 160 Mbps vs 40 Mbps at Level 5.1.'
                        },
                        {
                            token: 'B0',
                            meaning: 'No additional constraint flags.'
                        }
                    ],
                    overview: 'Main Tier vs High Tier is purely a bitrate limit distinction — same resolution, framerate, and codec features. High Tier doubles the CPB (Coded Picture Buffer) size and max bitrate. Streaming services use Main Tier (40 Mbps is plenty). UHD Blu-ray discs use High Tier because disc bitrates reach 80-100+ Mbps. If a media server serves Blu-ray remuxes, the browser must accept High Tier or it will reject the codec string even though the decoder hardware is identical.',
                    platforms: {
                        apple: 'Apple HLS authoring spec allows HEVC "up to Main 10, Level 5.1, High Tier" as the overall cap. Individual HLS variants should be "Main 10, Level 4.0, Main Tier" or below. High Tier is accepted for the top-quality variant only.',
                        lg: 'webOS hardware decoders support High Tier for local playback and USB media. For streaming, bitrate is limited by network throughput rather than decoder capability.',
                        android: 'High Tier support depends on SoC. MediaCodecInfo.CodecCapabilities reports max level — if Level 5.1 is listed, it typically covers both tiers. Some budget SoCs only implement Main Tier at higher levels.'
                    },
                    streaming: {
                        hls: [
                            {
                                signal: 'HDR10 High Tier',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=50000000,CODECS="hvc1.2.4.H153.B0,mp4a.40.2",RESOLUTION=3840x2160,FRAME-RATE=60,VIDEO-RANGE=PQ
hdr10_4k60_ht.m3u8`,
                                notes: 'High Tier codec string (H153 vs L153) in the CODECS attribute. Clients that only support Main Tier should fall back to a lower variant.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'HDR10 High Tier',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="hvc1.2.4.H153.B0">
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="16"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <Representation bandwidth="50000000" width="3840" height="2160" frameRate="60"/>
</AdaptationSet>`,
                                notes: 'High Tier in DASH. The codec string H prefix signals the higher bitrate ceiling to DASH clients.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF — High Tier MP4 common for UHD Blu-ray remuxes. Bitrates 50-100+ Mbps require fast storage I/O.',
                        mkv: 'video/x-matroska — the standard container for UHD Blu-ray remuxes. MKV allows chapter markers and multiple audio tracks.',
                        mov: 'QuickTime — High Tier MOV from professional mastering workflows.',
                        fmp4: 'Fragmented MP4 — High Tier streaming requires high bandwidth. Shorter segments help with adaptive switching.',
                        cmaf: 'CMAF (ISO 23000-19) — constrained fMP4 for dual HLS+DASH. Same video/mp4 MIME.',
                        mpegts: 'MPEG-TS — High Tier in transport stream for broadcast infrastructure carrying UHD Blu-ray quality content.'
                    },
                    references: [
                        {
                            title: 'ITU-T H.265 | ISO/IEC 23008-2',
                            url: 'https://www.itu.int/rec/T-REC-H.265'
                        },
                        {
                            title: 'ISO/IEC 14496-15 Annex E'
                        },
                        {
                            title: 'Apple HLS Authoring Spec',
                            url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices'
                        },
                        {
                            title: 'webOS TV AV Formats',
                            url: 'https://webostv.developer.lge.com/develop/specifications/video-audio-250'
                        },
                        {
                            title: 'Android Supported Media Formats',
                            url: 'https://developer.android.com/media/platform/supported-formats'
                        }
                    ]
                }
            },

            // ── hvc1.2.4.L156.B0 ──

            {
                codec: 'hvc1.2.4.L156.B0',
                name: '4K HDR10 120fps',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K HDR10 120fps 10-bit',
                    width: 3840,
                    height: 2160,
                    framerate: 120,
                    bitrate: 60_000_000,
                    bitDepth: 10,
                    chromaSubsampling: '4:2:0',
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10'
                }],
                education: {
                    breakdown: [
                        {
                            token: 'hvc1',
                            meaning: 'HEVC with parameter sets in the sample entry (out-of-band).'
                        },
                        {
                            token: '2',
                            meaning: 'Main 10 Profile (profile_idc=2). 10-bit 4:2:0.'
                        },
                        {
                            token: '4',
                            meaning: 'Profile compatibility flags. Bit 2 set = Main 10 compatible.'
                        },
                        {
                            token: 'L156',
                            meaning: 'Level 5.2, Main Tier. 156 = 5.2 × 30 + 2 × 3. Supports 4K@120fps. Peak bitrate 60 Mbps Main Tier. Compare: Level 5.1 (153) caps at 4K@60fps.'
                        },
                        {
                            token: 'B0',
                            meaning: 'No additional constraint flags.'
                        }
                    ],
                    overview: 'Level 5.2 targets 4K@120fps — primarily gaming capture, sports, and high-motion HDR content. HDMI 2.1 can carry 4K@120Hz HEVC. Few browsers support this because web video at 120fps is niche. The jump from Level 5.1 (4K@60) to 5.2 (4K@120) doubles the decoder throughput requirement.',
                    platforms: {
                        apple: 'No Apple device currently supports 4K@120 HEVC decode for video playback. ProMotion displays (120Hz) on iPhone 13 Pro+ and iPad Pro M1+ run at 120Hz but the HEVC decoder caps at Level 5.1.',
                        lg: '2020+ OLED TVs (CX and newer) support HDMI 2.1 4K@120Hz input. Whether the webOS browser reports Level 5.2 depends on the web engine version.',
                        android: 'Hardware decode on Snapdragon 8 Gen 1+, Dimensity 9000+. Most devices will report unsupported. Gaming phones (ROG, Red Magic) with 120Hz displays are the primary use case.'
                    },
                    streaming: {
                        hls: [
                            {
                                signal: 'HDR10 120fps',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=60000000,CODECS="hvc1.2.4.L156.B0,mp4a.40.2",RESOLUTION=3840x2160,FRAME-RATE=120,VIDEO-RANGE=PQ
hdr10_4k120.m3u8`,
                                notes: 'FRAME-RATE=120 for high frame rate HDR. 60 Mbps bandwidth requires a very fast connection. Few HLS players support 120fps content — most will fall back to a lower variant.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'HDR10 120fps with CICP',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="hvc1.2.4.L156.B0">
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="16"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <Representation bandwidth="60000000" width="3840" height="2160" frameRate="120"/>
</AdaptationSet>`,
                                notes: 'CICP TransferCharacteristics 16 = PQ. 120fps DASH is extremely niche — primarily gaming streaming services.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF — 4K@120 MP4 requires very high sustained read throughput (60+ Mbps).',
                        mkv: 'video/x-matroska — 4K@120 MKV from gaming captures (OBS, ShadowPlay).',
                        mov: 'QuickTime — 4K@120 MOV from high frame rate camera recordings.',
                        fmp4: 'Fragmented MP4 — same video/mp4 MIME. Short segment durations critical at 120fps for adaptive switching.',
                        cmaf: 'CMAF (ISO 23000-19) — constrained fMP4 for dual HLS+DASH. Same video/mp4 MIME.',
                        mpegts: 'MPEG-TS — 120fps in transport stream is extremely niche. No broadcast standard uses 4K@120. Tests browser API response to this edge case.'
                    },
                    references: [
                        {
                            title: 'ITU-T H.265 | ISO/IEC 23008-2',
                            url: 'https://www.itu.int/rec/T-REC-H.265'
                        },
                        {
                            title: 'ISO/IEC 14496-15 Annex E'
                        },
                        {
                            title: 'SMPTE ST 2084 (PQ)'
                        }
                    ]
                }
            },

            // ── hvc1.2.4.L183.B0 ──

            {
                codec: 'hvc1.2.4.L183.B0',
                name: '8K HDR10 60fps',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '8K HDR10 60fps 10-bit',
                    width: 7680,
                    height: 4320,
                    framerate: 60,
                    bitrate: 100_000_000,
                    bitDepth: 10,
                    chromaSubsampling: '4:2:0',
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10'
                }],
                education: {
                    breakdown: [
                        {
                            token: 'hvc1',
                            meaning: 'HEVC with parameter sets in the sample entry (out-of-band).'
                        },
                        {
                            token: '2',
                            meaning: 'Main 10 Profile (profile_idc=2). 10-bit 4:2:0.'
                        },
                        {
                            token: '4',
                            meaning: 'Profile compatibility flags. Bit 2 set = Main 10 compatible.'
                        },
                        {
                            token: 'L183',
                            meaning: 'Level 6.1, Main Tier. 183 = 6.1 × 30. Supports 8K (7680×4320) at 60fps. Peak bitrate 240 Mbps. The highest practical HEVC level — Level 6.2 (8K@120fps) exists in the spec but no consumer hardware implements it.'
                        },
                        {
                            token: 'B0',
                            meaning: 'No additional constraint flags.'
                        }
                    ],
                    overview: 'Level 6.1 is 8K territory. The level_idc formula: major × 30 + minor × 3 (6.1 = 180 + 3 = 183). Compare: Level 5.1 (153) for 4K, Level 4.1 (123) for 1080p@60, Level 3.1 (93) for 1080p@30. Most browsers will report unsupported — 8K HEVC hardware decoders exist only on Samsung 8K TVs, some LG 8K models, and Snapdragon 8 Gen 2+ SoCs.',
                    platforms: {
                        apple: 'No Apple device supports 8K HEVC decode. Apple Silicon M-series tops out at Level 5.1 (4K@60) for hardware decode. Safari will report unsupported.',
                        lg: 'LG 8K TVs (88Z9, 77ZX, QNED 8K) support Level 6.1 hardware decode. Standard 4K webOS TVs cap at Level 5.1. The webOS browser may report unsupported even on 8K models.',
                        android: '8K decode on Snapdragon 8 Gen 2+, Exynos 2200+. Samsung Galaxy S23+ can hardware decode 8K HEVC. Most Android devices will report unsupported.'
                    },
                    streaming: {
                        hls: [
                            {
                                signal: '8K HDR10',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=100000000,CODECS="hvc1.2.4.L183.B0,mp4a.40.2",RESOLUTION=7680x4320,FRAME-RATE=60,VIDEO-RANGE=PQ
hdr10_8k.m3u8`,
                                notes: '8K HLS is theoretical — no production HLS service delivers 8K. Tests whether the browser API acknowledges the codec string at this resolution.'
                            }
                        ],
                        dash: [
                            {
                                signal: '8K HDR10 with CICP',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="hvc1.2.4.L183.B0">
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="16"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <Representation bandwidth="100000000" width="7680" height="4320" frameRate="60"/>
</AdaptationSet>`,
                                notes: 'YouTube is the only platform that has experimented with 8K DASH streaming (using VP9/AV1, not HEVC). 8K HEVC DASH is theoretical.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF — 8K MP4 requires extreme sustained read throughput (100+ Mbps). Practical only from fast NVMe storage.',
                        mkv: 'video/x-matroska — 8K MKV exists for demo content and camera test footage.',
                        mov: 'QuickTime — 8K MOV from RED/Canon cinema cameras. Apple platforms cannot decode 8K HEVC.',
                        fmp4: 'Fragmented MP4 — same video/mp4 MIME. 8K streaming requires 100+ Mbps sustained throughput.',
                        cmaf: 'CMAF (ISO 23000-19) — constrained fMP4 for dual HLS+DASH. Same video/mp4 MIME.',
                        mpegts: 'MPEG-TS — 8K broadcast (NHK Japan Super Hi-Vision uses MPEG-TS for 8K, though with a custom profile). Tests browser API response.'
                    },
                    references: [
                        {
                            title: 'ITU-T H.265 | ISO/IEC 23008-2',
                            url: 'https://www.itu.int/rec/T-REC-H.265'
                        },
                        {
                            title: 'ISO/IEC 14496-15 Annex E'
                        }
                    ]
                }
            },

            // ── hev1.2.4.L153.B0 ──

            {
                codec: 'hev1.2.4.L153.B0',
                name: '4K HDR10 24fps (hev1)',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K HDR10 24fps 10-bit',
                    width: 3840,
                    height: 2160,
                    framerate: 24,
                    bitrate: 25_000_000,
                    bitDepth: 10,
                    chromaSubsampling: '4:2:0',
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10'
                },
                    {
                        name: '4K HDR10 23.976fps (hev1)',
                        width: 3840,
                        height: 2160,
                        framerate: 23.976,
                        bitrate: 25_000_000,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020',
                    }
                ],
                education: {
                    breakdown: [
                        {
                            token: 'hev1',
                            meaning: 'HEVC with parameter sets in-band (in the bitstream). VPS/SPS/PPS repeated in each access unit. Larger file size but more resilient to random access and stream switching.'
                        },
                        {
                            token: '2',
                            meaning: 'Main 10 Profile — identical to hvc1.2, the profile is the same regardless of the tag.'
                        },
                        {
                            token: '4',
                            meaning: 'Profile compatibility flags — same value as the hvc1 variant.'
                        },
                        {
                            token: 'L153',
                            meaning: 'Level 5.1, Main Tier — same capability as hvc1 at the same level.'
                        },
                        {
                            token: 'B0',
                            meaning: 'No additional constraint flags.'
                        }
                    ],
                    overview: 'The only difference between hev1 and hvc1 is where parameter sets are stored. hvc1 puts VPS/SPS/PPS in the MP4 sample entry (read once at init). hev1 puts them in-band (repeated in each sample). hev1 is more tolerant of mid-stream joins and adaptive bitrate switching. Apple explicitly requires hvc1 in HLS — hev1 is "not recommended" in the Apple HLS authoring spec. Most browsers support both tags, but older iOS Safari may reject hev1.',
                    platforms: {
                        apple: 'Apple HLS authoring spec marks hev1 as "not recommended." Safari and AVFoundation prefer hvc1 for faster segment initialization. hev1 may work in practice but is not guaranteed.',
                        lg: 'webOS accepts both hvc1 and hev1 without distinction. The media pipeline handles both parameter set locations transparently.',
                        android: 'MediaCodec handles both tags. The distinction matters more for the muxer (ffmpeg -tag:v hvc1 vs hev1) than for browser-side decoding. ExoPlayer treats both identically.'
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF — hev1 MP4 stores parameter sets both in hevC box and in each sample. Slightly larger file size than hvc1.',
                        mkv: 'video/x-matroska — MKV commonly uses hev1 because Matroska natively uses in-band parameter sets.',
                        mov: 'QuickTime — hev1 MOV works on most platforms but Apple prefers hvc1.',
                        fmp4: 'Fragmented MP4 — hev1 in fMP4 means parameter sets repeat per fragment. Useful for error recovery in unreliable networks.',
                        cmaf: 'CMAF (ISO 23000-19) — hev1 accepted but hvc1 is more common in CMAF workflows.',
                        mpegts: 'MPEG-TS — hev1 in-band parameter sets align naturally with Annex B NAL format since TS already expects in-band signaling per PES packet.'
                    },
                    streaming: {
                        hls: [
                            {
                                signal: 'HDR10 (hev1)',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=25000000,CODECS="hev1.2.4.L153.B0,mp4a.40.2",RESOLUTION=3840x2160,VIDEO-RANGE=PQ
hdr10_4k_hev1.m3u8`,
                                notes: 'Apple HLS authoring spec marks hev1 as "not recommended" — hvc1 is preferred. Testing hev1 in HLS reveals whether browsers actually reject it or silently accept it.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'HDR10 (hev1) with CICP',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="hev1.2.4.L153.B0">
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="16"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <Representation bandwidth="25000000" width="3840" height="2160" frameRate="24"/>
</AdaptationSet>`,
                                notes: 'DASH has no vendor preference between hev1 and hvc1. Both are equally valid in DASH manifests.'
                            }
                        ]
                    },
                    references: [
                        {
                            title: 'ITU-T H.265 | ISO/IEC 23008-2',
                            url: 'https://www.itu.int/rec/T-REC-H.265'
                        },
                        {
                            title: 'ISO/IEC 14496-15 Annex E'
                        },
                        {
                            title: 'Apple HLS Authoring Spec',
                            url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices'
                        },
                        {
                            title: 'webOS TV AV Formats',
                            url: 'https://webostv.developer.lge.com/develop/specifications/video-audio-250'
                        },
                        {
                            title: 'Android Supported Media Formats',
                            url: 'https://developer.android.com/media/platform/supported-formats'
                        }
                    ]
                }
            },

            // ── hvc1.3.E.L93.B0 ──

            {
                codec: 'hvc1.3.E.L93.B0',
                name: '720p Still Picture',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                scenarios: [{
                    name: '720p SDR 1fps 8-bit',
                    width: 1280,
                    height: 720,
                    framerate: 1,
                    bitrate: 3_000_000,
                    bitDepth: 8,
                    chromaSubsampling: '4:2:0',
                }],
                education: {
                    breakdown: [
                        {
                            token: 'hvc1',
                            meaning: 'HEVC with parameter sets in the sample entry (out-of-band).'
                        },
                        {
                            token: '3',
                            meaning: 'Main Still Picture Profile (profile_idc=3). A subset of Main Profile restricted to single-frame intra coding. The profile behind HEIF/HEIC images (iPhone photos since iOS 11).'
                        },
                        {
                            token: 'E',
                            meaning: 'Profile compatibility flags. Hex E = bits 1+2+3 set = compatible with Main, Main 10, and Main Still Picture decoders. Any HEVC Main decoder can decode a still picture — the profile is a strict subset.'
                        },
                        {
                            token: 'L93',
                            meaning: 'Level 3.1, Main Tier. For still images, the level constrains maximum picture size rather than framerate. max_luma_ps=983,040 (up to 1280×720 single frames).'
                        },
                        {
                            token: 'B0',
                            meaning: 'No additional constraint flags.'
                        }
                    ],
                    overview: 'Main Still Picture is the profile behind HEIF/HEIC images. Apple adopted it for iPhone photos in iOS 11 (A9+). Since it is a strict subset of Main Profile, any HEVC video decoder can decode still pictures — but browsers rarely expose this through canPlayType because single-frame "video" is an unusual use case. Tests whether the browser acknowledges the profile, not whether it uses HEVC for images (that is the platform image decoder, not the video pipeline).',
                    platforms: {
                        apple: 'HEIF/HEIC is the default photo format since iOS 11. macOS 10.13+ decodes HEIF natively. Safari does not necessarily report this profile as supported via video APIs — the image decoder is a separate pipeline from HTMLMediaElement.',
                        lg: 'webOS does not typically use HEVC still picture in the browser. LG TVs handle HEIF thumbnails through the built-in photo viewer, not the web engine.',
                        android: 'HEIF support in Android 8.0+ (API 26). MediaCodec HEVC decoder usually accepts Main Still Picture since it is a Main Profile subset. Gallery apps use the image decoder path, not MediaCodec.'
                    },
                    streaming: {
                        hls: [
                            {
                                signal: 'Still Picture',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=3000000,CODECS="hvc1.3.E.L93.B0",RESOLUTION=1280x720
hevc_still.m3u8`,
                                notes: 'Still Picture profile in HLS is unusual — single-frame HEVC content is not a streaming use case. Tests whether the browser API recognizes the profile_idc=3 codec string in a streaming context.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'Still Picture',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="hvc1.3.E.L93.B0">
  <Representation bandwidth="3000000" width="1280" height="720" frameRate="1"/>
</AdaptationSet>`,
                                notes: 'Main Still Picture in DASH. Tests API response to profile_idc=3 in a media-source context.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF — HEIF/HEIC uses ISOBMFF as the container (ISO/IEC 23008-12). The video/mp4 MIME test checks if the video decoder accepts the profile, not whether the platform supports HEIF images.',
                        mkv: 'video/x-matroska — Main Still Picture in MKV tests whether the Matroska MIME handler recognizes profile_idc=3.',
                        mov: 'QuickTime — Apple HEIF images use MOV-based ISOBMFF. Tests whether the video API path accepts the Still Picture profile.',
                        fmp4: 'Fragmented MP4 — same video/mp4 MIME. Tests profile_idc=3 recognition in a streaming container context.',
                        cmaf: 'CMAF (ISO 23000-19) — constrained fMP4. Tests profile_idc=3 recognition.',
                        mpegts: 'MPEG-TS — Still Picture in transport stream is not a real-world scenario. Tests browser API response to this edge case.'
                    },
                    references: [
                        {
                            title: 'ITU-T H.265 | ISO/IEC 23008-2',
                            url: 'https://www.itu.int/rec/T-REC-H.265'
                        },
                        {
                            title: 'ISO/IEC 23008-12 (HEIF)'
                        },
                        {
                            title: 'ISO/IEC 14496-15 Annex E'
                        }
                    ]
                }
            },
            // ── hvc1.2.4.L150.B0 ──

            {
                codec: 'hvc1.2.4.L150.B0',
                name: '4K HDR10 24fps 10-bit',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K HDR10 24fps 10-bit',
                    width: 3840,
                    height: 2160,
                    framerate: 24,
                    bitrate: 20_000_000,
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                },
                    {
                        name: '4K HDR10 23.976fps 10-bit',
                        width: 3840,
                        height: 2160,
                        framerate: 23.976,
                        bitrate: 18_000_000,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020',
                    },
                    {
                        name: '4K HDR10 29.97fps 10-bit',
                        width: 3840,
                        height: 2160,
                        framerate: 29.97,
                        bitrate: 22_000_000,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020',
                    }
                ],
                education: {
                    breakdown: [
                        {
                            token: 'hvc1',
                            meaning: 'HEVC with parameter sets in the sample entry (out-of-band). Required by Apple HLS.'
                        },
                        {
                            token: '2',
                            meaning: 'Main 10 Profile (profile_idc=2). Supports 8-bit and 10-bit 4:2:0. Required for HDR10 content.'
                        },
                        {
                            token: '4',
                            meaning: 'Profile compatibility flags. Bit 2 set = Main 10 compatible.'
                        },
                        {
                            token: 'L150',
                            meaning: 'Level 5.0, Main Tier. 150 = 5.0 × 30. Supports 3840×2160@30fps. Peak bitrate 25 Mbps Main Tier. The base 4K level.'
                        },
                        {
                            token: 'B0',
                            meaning: 'No additional constraint flags. HDR10 signaling is in stream metadata and mediaCapabilities config, not in the codec string.'
                        }
                    ],
                    overview: 'HEVC Main 10 at Level 5.0 — the standard 4K HDR10 streaming level. Netflix, Apple TV+, and Disney+ use this level for 4K HDR10 catalog content at film framerates (24/23.976fps). Level 5.1 adds 60fps capability, but most HDR10 streaming stays at L5.0 to maximize device compatibility.',
                    platforms: {
                        apple: 'Hardware decode on A10X+ (iPad Pro 2017), A11+ (iPhone X), all Apple Silicon. Level 5.0 Main 10 with PQ is the standard Apple TV 4K HDR10 decode path.',
                        lg: 'All webOS 3.0+ (2016+). Hardware decode via SoC. 4K HDR10 at Level 5.0 is the native playback configuration for streaming apps.',
                        android: 'Hardware decode on Android 7.0+ with MediaCodec HEVCProfileMain10HDR10. Snapdragon 820+, Exynos 7420+. The standard 4K HDR streaming level on Android TV.'
                    },
                    streaming: {
                        hls: [
                            {
                                signal: 'HDR10 PQ',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=20000000,CODECS="hvc1.2.4.L150.B0,mp4a.40.2",RESOLUTION=3840x2160,VIDEO-RANGE=PQ
hdr10_4k_24.m3u8`,
                                notes: 'VIDEO-RANGE=PQ signals HDR10 to iOS/tvOS. Level 5.0 is the standard 4K HDR10 level for film content (24fps). Always provide an SDR fallback variant.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'HDR10 PQ with CICP',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="hvc1.2.4.L150.B0">
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="16"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <Representation bandwidth="20000000" width="3840" height="2160" frameRate="24"/>
</AdaptationSet>`,
                                notes: 'CICP TransferCharacteristics 16 = PQ (ST 2084). ColourPrimaries 9 = BT.2020. The standard Netflix/Disney+ 4K HDR10 DASH configuration.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF — the standard 4K HDR10 container. HDR metadata (mastering display, content light level) stored in colr/mdcv/clli boxes.',
                        mkv: 'video/x-matroska — dominant container for 4K HDR10 content in media server libraries (Jellyfin, Plex). HDR metadata in Matroska colour elements.',
                        mov: 'QuickTime — Apple platforms. HDR10 MOV from professional workflows (DaVinci Resolve, Final Cut Pro).',
                        fmp4: 'Fragmented MP4 — same video/mp4 MIME. The segment format for HLS and DASH 4K HDR10 streaming.',
                        cmaf: 'CMAF (ISO 23000-19) — constrained fMP4 for dual HLS+DASH. Same video/mp4 MIME.',
                        mpegts: 'MPEG-TS — 4K HDR10 in transport stream for broadcast (DVB-T2 UHD, ATSC 3.0). HEVC in TS uses Annex B NAL format.'
                    },
                    references: [
                        {
                            title: 'ITU-T H.265 | ISO/IEC 23008-2',
                            url: 'https://www.itu.int/rec/T-REC-H.265'
                        },
                        {
                            title: 'ISO/IEC 14496-15 Annex E'
                        }
                    ]
                }
            },
            // ── hvc1.1.6.L153.B0 ──

            {
                codec: 'hvc1.1.6.L153.B0',
                name: '4K SDR 60fps 8-bit',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K SDR 60fps 8-bit',
                    width: 3840,
                    height: 2160,
                    framerate: 60,
                    bitrate: 25_000_000,
                },
                    {
                        name: '4K SDR 59.94fps 8-bit',
                        width: 3840,
                        height: 2160,
                        framerate: 59.94,
                        bitrate: 25_000_000,
                    }
                ],
                education: {
                    breakdown: [
                        {
                            token: 'hvc1',
                            meaning: 'HEVC with parameter sets in the sample entry (out-of-band). Required by Apple HLS.'
                        },
                        {
                            token: '1',
                            meaning: 'Main Profile (profile_idc=1). 8-bit 4:2:0 only. Baseline SDR profile — no HDR metadata.'
                        },
                        {
                            token: '6',
                            meaning: 'Profile compatibility flags. Bits 1+2 set — backward-compatible with Main and Main 10 decoders.'
                        },
                        {
                            token: 'L153',
                            meaning: 'Level 5.1, Main Tier. 153 = 5.1 × 30. Supports 3840×2160@60fps. Peak bitrate 40 Mbps Main Tier. Needed for 4K HFR content.'
                        },
                        {
                            token: 'B0',
                            meaning: 'No additional constraint flags beyond the profile.'
                        }
                    ],
                    overview: 'HEVC Main Profile at Level 5.1 — 4K SDR at 60fps for high-frame-rate content like sports and gaming. Level 5.0 caps at 30fps for 4K, so live sports broadcasts and game streaming at 4K@60 require Level 5.1. 8-bit SDR at this level is uncommon in streaming (most 4K uses Main 10) but relevant for game capture and live broadcast.',
                    platforms: {
                        apple: 'Hardware 4K@60 decode on A10X+ (iPad Pro 2017), A11+ (iPhone X), all Apple Silicon. 8-bit 4K@60 supported but uncommon — Apple prefers Main 10 for 4K content.',
                        lg: 'All webOS 3.0+ (2016+). 4K@60 HEVC decode via SoC. 8-bit 4K@60 for SDR gaming and sports streaming.',
                        android: 'Hardware 4K@60 decode on flagship SoCs (Snapdragon 845+, Exynos 9810+). Level 5.1 Main at 8-bit is the standard 4K gaming stream profile.'
                    },
                    streaming: {
                        hls: [
                            {
                                signal: '4K SDR 60fps',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=25000000,CODECS="hvc1.1.6.L153.B0,mp4a.40.2",RESOLUTION=3840x2160
hevc_main_4k_60.m3u8`,
                                notes: 'No VIDEO-RANGE needed — SDR is the default. Level 5.1 required for 4K@60fps. Most 4K HLS uses Main 10 instead, but Main Profile is valid for 8-bit SDR game streaming.'
                            }
                        ],
                        dash: [
                            {
                                signal: '4K SDR 60fps',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="hvc1.1.6.L153.B0">
  <Representation bandwidth="25000000" width="3840" height="2160" frameRate="60"/>
</AdaptationSet>`,
                                notes: 'No supplemental properties needed for SDR. 4K@60fps DASH for live sports and game streaming.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF — standard 4K container. 4K@60fps SDR at 25 Mbps requires sustained read throughput.',
                        mkv: 'video/x-matroska — limited browser support. MKV is common for 4K SDR game captures in media server libraries.',
                        mov: 'QuickTime — 4K MOV from professional cameras and Apple screen recording.',
                        fmp4: 'Fragmented MP4 — same video/mp4 MIME. The segment format for HLS and DASH 4K@60 streaming.',
                        cmaf: 'CMAF (ISO 23000-19) — constrained fMP4 for dual HLS+DASH. Same video/mp4 MIME.',
                        mpegts: 'MPEG-TS — 4K@60 SDR broadcast. DVB-T2 UHD and ATSC 3.0 support HEVC in transport stream.'
                    },
                    references: [
                        {
                            title: 'ITU-T H.265 | ISO/IEC 23008-2',
                            url: 'https://www.itu.int/rec/T-REC-H.265'
                        },
                        {
                            title: 'ISO/IEC 14496-15 Annex E'
                        }
                    ]
                }
            },
            // ── hvc1.2.4.L180.B0 ──

            {
                codec: 'hvc1.2.4.L180.B0',
                name: '8K HDR10 30fps 10-bit',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '8K HDR10 30fps 10-bit',
                    width: 7680,
                    height: 4320,
                    framerate: 30,
                    bitrate: 50_000_000,
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                }],
                education: {
                    breakdown: [
                        {
                            token: 'hvc1',
                            meaning: 'HEVC with parameter sets in the sample entry (out-of-band).'
                        },
                        {
                            token: '2',
                            meaning: 'Main 10 Profile (profile_idc=2). 10-bit 4:2:0. Required for HDR10.'
                        },
                        {
                            token: '4',
                            meaning: 'Profile compatibility flags. Bit 2 set = Main 10 compatible.'
                        },
                        {
                            token: 'L180',
                            meaning: 'Level 6.0, Main Tier. 180 = 6.0 × 30. Supports 7680×4320@30fps. Peak bitrate 60 Mbps Main Tier. Bridges Level 5.2 (4K@120fps) and Level 6.1 (8K@60fps).'
                        },
                        {
                            token: 'B0',
                            meaning: 'No additional constraint flags.'
                        }
                    ],
                    overview: 'Level 6.0 bridges the 4K and 8K tiers — it supports 8K at 30fps or 4K at very high framerates. Compared to Level 6.1 (8K@60fps, 120 Mbps Main), Level 6.0 is more conservative (60 Mbps). NHK Japan pioneered 8K broadcast using HEVC, though most consumer content uses AV1 for 8K.',
                    platforms: {
                        apple: 'No Apple device supports 8K HEVC decode. Apple Silicon tops out at Level 5.1 (4K@60) for hardware decode. Safari will report unsupported.',
                        lg: 'LG 8K TVs (88Z9, 77ZX, QNED 8K) may support Level 6.0 hardware decode. Standard 4K webOS TVs cap at Level 5.1.',
                        android: '8K decode on Snapdragon 8 Gen 2+, Exynos 2200+. Level 6.0 at 30fps is less demanding than Level 6.1 at 60fps. Most Android devices will report unsupported.'
                    },
                    streaming: {
                        hls: [
                            {
                                signal: '8K HDR10',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=50000000,CODECS="hvc1.2.4.L180.B0,mp4a.40.2",RESOLUTION=7680x4320,VIDEO-RANGE=PQ
hdr10_8k_30.m3u8`,
                                notes: '8K HLS is theoretical — no production HLS service delivers 8K HEVC. Tests browser API acknowledgment of Level 6.0.'
                            }
                        ],
                        dash: [
                            {
                                signal: '8K HDR10 with CICP',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="hvc1.2.4.L180.B0">
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="16"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <Representation bandwidth="50000000" width="7680" height="4320" frameRate="30"/>
</AdaptationSet>`,
                                notes: '8K HEVC DASH is theoretical. CICP TC=16 (PQ), CP=9 (BT.2020). Level 6.0 at 30fps vs Level 6.1 at 60fps.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF — 8K MP4 requires sustained read throughput of 50+ Mbps. Practical only from fast NVMe storage.',
                        mkv: 'video/x-matroska — 8K MKV exists for demo content and camera test footage.',
                        mov: 'QuickTime — 8K MOV from RED/Canon cinema cameras. Apple platforms cannot decode 8K HEVC.',
                        fmp4: 'Fragmented MP4 — same video/mp4 MIME. 8K streaming at 50 Mbps requires robust CDN delivery.',
                        cmaf: 'CMAF (ISO 23000-19) — constrained fMP4 for dual HLS+DASH. Same video/mp4 MIME.',
                        mpegts: 'MPEG-TS — 8K broadcast (NHK Japan Super Hi-Vision uses HEVC in transport stream for 8K). Tests browser API response.'
                    },
                    references: [
                        {
                            title: 'ITU-T H.265 | ISO/IEC 23008-2',
                            url: 'https://www.itu.int/rec/T-REC-H.265'
                        },
                        {
                            title: 'ISO/IEC 14496-15 Annex E'
                        }
                    ]
                }
            }
        ]
    },
    video_av1: {
        category: 'AV1',
        type: 'video',
        description: 'Main, High, Professional profiles. Levels 2.0–6.1. 8/10/12-bit. SDR, HDR10, HDR10+, HLG. Film grain.',
        codecs: [
            // ── av01.0.04M.08 ──

            {
                codec: 'av01.0.04M.08',
                name: 'AV1 Main 540p SDR',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash', 'cmaf']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [
                    {
                        name: '540p SDR 30fps',
                        width: 960,
                        height: 540,
                        framerate: 30,
                        bitrate: 2_000_000,
                        bitDepth: 8,
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'av01', meaning: 'AV1 codec identifier per AV1 Codec ISO Media File Format Binding.' },
                        { token: '0', meaning: 'Main Profile (seq_profile=0). 8-bit and 10-bit, 4:2:0 only.' },
                        { token: '04M', meaning: 'Level 3.0 (seq_level_idx=4), Main tier. Max 665,856 luma samples — suitable for 540p content.' },
                        { token: '08', meaning: '8-bit (BitDepth=8).' }
                    ],
                    overview: 'AV1 Main Profile at Level 3.0 — baseline SDR for 540p. Level 3.0 caps at 665,856 luma samples (960×694 max), too small for 720p. Used for adaptive streaming lower rungs.',
                    streaming: {
                        hls: [
                            {
                                signal: 'SDR 540p',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=2000000,CODECS="av01.0.04M.08,mp4a.40.2",RESOLUTION=960x540
av1_540p.m3u8`,
                                notes: 'AV1 in HLS requires fMP4 segments — no MPEG-TS support. Apple added AV1 HLS support in Safari 17 / iOS 17 (2023). No VIDEO-RANGE needed for SDR.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'SDR 540p',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="av01.0.04M.08">
  <Representation bandwidth="2000000" width="960" height="540" frameRate="30"/>
</AdaptationSet>`,
                                notes: 'Standard DASH signaling. No CICP supplemental properties needed for SDR. AV1 in DASH widely supported (YouTube, Netflix).'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF per AV1 ISOBMFF Binding. av1C box stores AV1CodecConfigurationRecord.',
                        mkv: 'Matroska with CodecID V_AV1. Common in media server libraries (Jellyfin, Plex).',
                        webm: 'WebM (Matroska subset) — native AV1 web container. Chrome and Firefox support video/webm with AV1.',
                        fmp4: 'Fragmented MP4 for DASH segments. Same video/mp4 MIME as regular MP4.',
                        cmaf: 'CMAF (ISO 23000-19) — constrained fMP4 for dual HLS+DASH delivery.'
                    },
                    references: [
                        { title: 'AV1 Bitstream & Decoding Process Specification', url: 'https://aomediacodec.github.io/av1-spec/' },
                        { title: 'AV1 Codec ISO Media File Format Binding', url: 'https://aomediacodec.github.io/av1-isobmff/' }
                    ]
                }
            },
            // ── av01.0.05M.08 ──

            {
                codec: 'av01.0.05M.08',
                name: 'AV1 Main 720p SDR',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash', 'cmaf']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [
                    {
                        name: '720p SDR 24fps',
                        width: 1280,
                        height: 720,
                        framerate: 24,
                        bitrate: 3_000_000,
                        bitDepth: 8,
                    },
                    {
                        name: '720p SDR 23.976fps',
                        width: 1280,
                        height: 720,
                        framerate: 23.976,
                        bitrate: 3_000_000,
                        bitDepth: 8,
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'av01', meaning: 'AV1 codec identifier per AV1 Codec ISO Media File Format Binding.' },
                        { token: '0', meaning: 'Main Profile (seq_profile=0). 8-bit and 10-bit, 4:2:0 only.' },
                        { token: '05M', meaning: 'Level 3.1 (seq_level_idx=5), Main tier. Max 1,065,024 luma samples — supports 720p content.' },
                        { token: '08', meaning: '8-bit (BitDepth=8).' }
                    ],
                    overview: 'AV1 Main Profile at Level 3.1 — SDR 720p. Level 3.1 caps at 1,065,024 luma samples, enough for 720p but not 1080p. Common in adaptive streaming mid-rungs.',
                    streaming: {
                        hls: [
                            {
                                signal: 'SDR 720p',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=3000000,CODECS="av01.0.05M.08,mp4a.40.2",RESOLUTION=1280x720
av1_720p.m3u8`,
                                notes: 'AV1 in HLS requires fMP4 segments. Available since Safari 17 / iOS 17 (2023). SDR default — no VIDEO-RANGE attribute needed.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'SDR 720p',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="av01.0.05M.08">
  <Representation bandwidth="3000000" width="1280" height="720" frameRate="24"/>
</AdaptationSet>`,
                                notes: 'Standard DASH signaling. Level 3.1 used for 720p SDR DASH segments.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF per AV1 ISOBMFF Binding. av1C box stores AV1CodecConfigurationRecord.',
                        mkv: 'Matroska with CodecID V_AV1. Common in media server libraries (Jellyfin, Plex).',
                        webm: 'WebM (Matroska subset) — native AV1 web container. Chrome and Firefox support video/webm with AV1.',
                        fmp4: 'Fragmented MP4 for DASH segments. Same video/mp4 MIME as regular MP4.',
                        cmaf: 'CMAF (ISO 23000-19) — constrained fMP4 for dual HLS+DASH delivery.'
                    },
                    references: [
                        { title: 'AV1 Bitstream & Decoding Process Specification', url: 'https://aomediacodec.github.io/av1-spec/' },
                        { title: 'AV1 Codec ISO Media File Format Binding', url: 'https://aomediacodec.github.io/av1-isobmff/' }
                    ]
                }
            },
            // ── av01.0.08M.08 ──

            {
                codec: 'av01.0.08M.08',
                name: 'AV1 Main 1080p SDR',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash', 'cmaf']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [
                    {
                        name: '1080p SDR 30fps',
                        width: 1920,
                        height: 1080,
                        framerate: 30,
                        bitrate: 8_000_000,
                        bitDepth: 8,
                    },
                    {
                        name: '1080p SDR 23.976fps',
                        width: 1920,
                        height: 1080,
                        framerate: 23.976,
                        bitrate: 8_000_000,
                        bitDepth: 8,
                    },
                    {
                        name: '1080p SDR 29.97fps',
                        width: 1920,
                        height: 1080,
                        framerate: 29.97,
                        bitrate: 8_000_000,
                        bitDepth: 8,
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'av01', meaning: 'AV1 codec identifier per AV1 Codec ISO Media File Format Binding.' },
                        { token: '0', meaning: 'Main Profile (seq_profile=0). 8-bit and 10-bit, 4:2:0 only.' },
                        { token: '08M', meaning: 'Level 4.0 (seq_level_idx=8), Main tier. Supports 4K@30fps. Main tier peak bitrate 12 Mbps.' },
                        { token: '08', meaning: '8-bit (BitDepth=8).' }
                    ],
                    overview: 'AV1 Main Profile at Level 4.0 — 1080p SDR in 8-bit. Level 4.0 supports up to 2,359,296 luma samples (enough for 1080p@30fps). The first level where High tier becomes available.',
                    streaming: {
                        hls: [
                            {
                                signal: 'SDR 1080p',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=8000000,CODECS="av01.0.08M.08,mp4a.40.2",RESOLUTION=1920x1080
av1_1080p_sdr.m3u8`,
                                notes: 'AV1 in HLS requires fMP4 segments and Safari 17+ / tvOS 17+. No VIDEO-RANGE needed for SDR.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'SDR 1080p',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="av01.0.08M.08">
  <Representation bandwidth="8000000" width="1920" height="1080" frameRate="30"/>
</AdaptationSet>`,
                                notes: 'Standard DASH signaling. AV1 Level 4.0 used for 1080p SDR DASH delivery.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF per AV1 ISOBMFF Binding. av1C box stores AV1CodecConfigurationRecord.',
                        mkv: 'Matroska with CodecID V_AV1. Common in media server libraries (Jellyfin, Plex).',
                        webm: 'WebM (Matroska subset) — native AV1 web container. Chrome and Firefox support video/webm with AV1.',
                        fmp4: 'Fragmented MP4 for DASH segments. Same video/mp4 MIME as regular MP4.',
                        cmaf: 'CMAF (ISO 23000-19) — constrained fMP4 for dual HLS+DASH delivery.'
                    },
                    references: [
                        { title: 'AV1 Bitstream & Decoding Process Specification', url: 'https://aomediacodec.github.io/av1-spec/' },
                        { title: 'AV1 Codec ISO Media File Format Binding', url: 'https://aomediacodec.github.io/av1-isobmff/' }
                    ]
                }
            },
            // ── av01.0.08M.10 ──

            {
                codec: 'av01.0.08M.10',
                name: 'AV1 Main 1080p HDR',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash', 'cmaf']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [
                    {
                        name: '1080p HDR10 24fps',
                        width: 1920,
                        height: 1080,
                        framerate: 24,
                        bitrate: 8_000_000,
                        bitDepth: 10,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hdr10',
                    },
                    {
                        name: '1080p HLG 24fps',
                        width: 1920,
                        height: 1080,
                        framerate: 24,
                        bitrate: 8_000_000,
                        bitDepth: 10,
                        transferFunction: 'hlg',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hlg',
                    },
                    {
                        name: '1080p HDR10 23.976fps',
                        width: 1920,
                        height: 1080,
                        framerate: 23.976,
                        bitrate: 8_000_000,
                        bitDepth: 10,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hdr10',
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'av01', meaning: 'AV1 codec identifier per AV1 Codec ISO Media File Format Binding.' },
                        { token: '0', meaning: 'Main Profile (seq_profile=0). 8-bit and 10-bit, 4:2:0 only.' },
                        { token: '08M', meaning: 'Level 4.0 (seq_level_idx=8), Main tier. Supports 4K@30fps. Main tier peak bitrate 12 Mbps.' },
                        { token: '10', meaning: '10-bit (BitDepth=10). Required for HDR10 (PQ) and HLG transfer functions.' }
                    ],
                    overview: 'AV1 Main Profile at Level 4.0 in 10-bit — 1080p HDR entry point. Short-form codec string with no color parameters; the decoder infers color config from the bitstream. Level 4.0 max 2,359,296 luma samples.',
                    streaming: {
                        hls: [
                            {
                                signal: 'HDR10 PQ',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=8000000,CODECS="av01.0.08M.10,mp4a.40.2",RESOLUTION=1920x1080,VIDEO-RANGE=PQ
av1_1080p_hdr10.m3u8`,
                                notes: 'VIDEO-RANGE=PQ signals HDR10 to Apple devices. AV1 HDR in HLS requires fMP4 segments and Safari 17+ / tvOS 17+. Always provide an SDR fallback variant.'
                            },
                            {
                                signal: 'HLG',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=8000000,CODECS="av01.0.08M.10,mp4a.40.2",RESOLUTION=1920x1080,VIDEO-RANGE=HLG
av1_1080p_hlg.m3u8`,
                                notes: 'VIDEO-RANGE=HLG for Hybrid Log-Gamma. HLG is backward-compatible with SDR displays. The player uses VIDEO-RANGE to enable HDR processing path.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'HDR10 PQ with CICP',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="av01.0.08M.10">
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="16"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <Representation bandwidth="8000000" width="1920" height="1080" frameRate="24"/>
</AdaptationSet>`,
                                notes: 'CICP TransferCharacteristics 16 = PQ (ST 2084). ColourPrimaries 9 = BT.2020. Short-form codec string — color signaling is in DASH supplemental properties, not in the codec string.'
                            },
                            {
                                signal: 'HLG with CICP',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="av01.0.08M.10">
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="18"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <Representation bandwidth="8000000" width="1920" height="1080" frameRate="24"/>
</AdaptationSet>`,
                                notes: 'CICP TransferCharacteristics 18 = HLG (ARIB STD-B67). ColourPrimaries 9 = BT.2020.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF per AV1 ISOBMFF Binding. av1C box stores AV1CodecConfigurationRecord. HDR metadata (MDCV/CLLI) stored in ISOBMFF boxes or AV1 metadata OBUs.',
                        mkv: 'Matroska with CodecID V_AV1. Colour element carries BT.2020/PQ or BT.2020/HLG color metadata and mastering display info.',
                        webm: 'WebM — AV1 HDR in WebM uses Matroska Colour element for CICP signaling. YouTube serves HDR AV1 via WebM DASH.',
                        fmp4: 'Fragmented MP4 for HLS/DASH segments. Color and HDR metadata in the init segment.',
                        cmaf: 'CMAF (ISO 23000-19) — constrained fMP4 for dual HLS+DASH HDR delivery. HDR metadata in init segment.'
                    },
                    references: [
                        { title: 'AV1 Bitstream & Decoding Process Specification', url: 'https://aomediacodec.github.io/av1-spec/' },
                        { title: 'AV1 Codec ISO Media File Format Binding', url: 'https://aomediacodec.github.io/av1-isobmff/' }
                    ]
                }
            },
            // ── av01.0.08M.10.0.110.01.01.01.0 ──

            {
                codec: 'av01.0.08M.10.0.110.01.01.01.0',
                name: 'AV1 Main 1080p Film Grain',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash', 'cmaf']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [
                    {
                        name: '1080p Film Grain 24fps',
                        width: 1920,
                        height: 1080,
                        framerate: 24,
                        bitrate: 8_000_000,
                        bitDepth: 10,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hdr10',
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'av01', meaning: 'AV1 codec identifier per AV1 Codec ISO Media File Format Binding.' },
                        { token: '0', meaning: 'Main Profile (seq_profile=0). 8-bit and 10-bit, 4:2:0 only.' },
                        { token: '08M', meaning: 'Level 4.0 (seq_level_idx=8), Main tier. Supports 4K@30fps.' },
                        { token: '10', meaning: '10-bit (BitDepth=10).' },
                        { token: '0', meaning: 'Not monochrome (mono_chrome=0). Color image.' },
                        { token: '110', meaning: 'Chroma subsampling 4:2:0 (subsampling_x=1, subsampling_y=1, chroma_sample_position=0).' },
                        { token: '01', meaning: 'Color primaries: BT.709 (color_primaries=1, ITU-T H.273).' },
                        { token: '01', meaning: 'Transfer characteristics: BT.709 (transfer_characteristics=1, ITU-T H.273).' },
                        { token: '01', meaning: 'Matrix coefficients: BT.709 (matrix_coefficients=1, ITU-T H.273).' },
                        { token: '0', meaning: 'Studio/limited range (color_range=0). Luma 16-235, chroma 16-240 for 8-bit.' }
                    ],
                    overview: 'AV1 Main Profile at Level 4.0 with explicit BT.709 color and film grain synthesis. The film_grain_params_present flag in the sequence header enables per-frame grain synthesis — grain is removed before encoding and re-applied at decode time, saving bitrate. Netflix uses this for live-action content.',
                    streaming: {
                        hls: [
                            {
                                signal: 'SDR Film Grain',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=8000000,CODECS="av01.0.08M.10.0.110.01.01.01.0,mp4a.40.2",RESOLUTION=1920x1080
av1_1080p_filmgrain.m3u8`,
                                notes: 'Extended codec string with explicit CICP in the CODECS attribute. BT.709 color (cp=1, tc=1, mc=1). HLS players must parse all 10 fields. fMP4 segments required.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'SDR Film Grain',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="av01.0.08M.10.0.110.01.01.01.0">
  <Representation bandwidth="8000000" width="1920" height="1080" frameRate="24"/>
</AdaptationSet>`,
                                notes: 'Extended codec string embeds CICP directly — no separate SupplementalProperty needed. BT.709 color primaries and transfer. Netflix uses this format for film grain AV1 DASH content.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF per AV1 ISOBMFF Binding. av1C box stores AV1CodecConfigurationRecord including chroma and color config. Film grain params carried in AV1 frame headers.',
                        mkv: 'Matroska with CodecID V_AV1. Film grain synthesis is decoder-side — no special container support needed.',
                        webm: 'WebM — film grain AV1 in WebM. Netflix original content uses AV1 film grain extensively.',
                        fmp4: 'Fragmented MP4 for DASH segments. Film grain params in each temporal unit.',
                        cmaf: 'CMAF (ISO 23000-19) — constrained fMP4 for dual HLS+DASH delivery.'
                    },
                    references: [
                        { title: 'AV1 Bitstream & Decoding Process Specification', url: 'https://aomediacodec.github.io/av1-spec/' },
                        { title: 'AV1 Codec ISO Media File Format Binding', url: 'https://aomediacodec.github.io/av1-isobmff/' },
                        { title: 'ITU-T H.273 (CICP)', url: 'https://www.itu.int/rec/T-REC-H.273' }
                    ]
                }
            },
            // ── av01.0.09H.10 ──

            {
                codec: 'av01.0.09H.10',
                name: 'AV1 Main 1080p HDR10 High Tier',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash', 'cmaf']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [
                    {
                        name: '1080p HDR10 High Tier 60fps',
                        width: 1920,
                        height: 1080,
                        framerate: 60,
                        bitrate: 20_000_000,
                        bitDepth: 10,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hdr10',
                        tier: 'high',
                    },
                    {
                        name: '1080p HDR10 High Tier 59.94fps',
                        width: 1920,
                        height: 1080,
                        framerate: 59.94,
                        bitrate: 20_000_000,
                        bitDepth: 10,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hdr10',
                        tier: 'high',
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'av01', meaning: 'AV1 codec identifier per AV1 Codec ISO Media File Format Binding.' },
                        { token: '0', meaning: 'Main Profile (seq_profile=0). 8-bit and 10-bit, 4:2:0 only.' },
                        { token: '09H', meaning: 'Level 4.1 (seq_level_idx=9), High tier. Supports 4K@60fps. High tier peak bitrate 50 Mbps.' },
                        { token: '10', meaning: '10-bit (BitDepth=10). Required for HDR10 PQ content.' }
                    ],
                    overview: 'AV1 Main Profile at Level 4.1, High tier — 1080p@60fps HDR with higher bitrate ceiling. High tier doubles the bitrate limit vs Main tier at the same level (50 Mbps vs 20 Mbps). Level 4.1 doubles the display rate of 4.0, enabling 60fps at 1080p.',
                    streaming: {
                        hls: [
                            {
                                signal: 'HDR10 High Tier',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=20000000,CODECS="av01.0.09H.10,mp4a.40.2",RESOLUTION=1920x1080,VIDEO-RANGE=PQ,FRAME-RATE=60
av1_1080p_hdr10_high.m3u8`,
                                notes: 'High tier (H suffix) in the codec string. VIDEO-RANGE=PQ signals HDR10. The H vs M tier distinction matters for decoder capability checks — High tier allows higher bitrates. fMP4 segments required.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'HDR10 High Tier with CICP',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="av01.0.09H.10">
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="16"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <Representation bandwidth="20000000" width="1920" height="1080" frameRate="60"/>
</AdaptationSet>`,
                                notes: 'CICP TC=16 (PQ) + CP=9 (BT.2020). High tier enables higher bitrates for demanding 60fps HDR content.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF per AV1 ISOBMFF Binding. High tier MP4 files have higher bitrate — 40+ Mbps requires fast storage I/O.',
                        mkv: 'Matroska with CodecID V_AV1. High tier MKV for premium quality AV1 encodes.',
                        webm: 'WebM — High tier AV1 in WebM. Larger segment sizes than Main tier.',
                        fmp4: 'Fragmented MP4 for DASH segments. High tier segments are larger — consider shorter segment duration for smoother ABR switching.',
                        cmaf: 'CMAF (ISO 23000-19) — constrained fMP4. High tier CMAF segments for premium HDR delivery.'
                    },
                    references: [
                        { title: 'AV1 Bitstream & Decoding Process Specification', url: 'https://aomediacodec.github.io/av1-spec/' },
                        { title: 'AV1 Codec ISO Media File Format Binding', url: 'https://aomediacodec.github.io/av1-isobmff/' }
                    ]
                }
            },
            // ── av01.0.12M.10.0.110.09.16.09.0 ──

            {
                codec: 'av01.0.12M.10.0.110.09.16.09.0',
                name: 'AV1 Main 4K HDR10',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash', 'cmaf']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [
                    {
                        name: '4K HDR10 30fps',
                        width: 3840,
                        height: 2160,
                        framerate: 30,
                        bitrate: 20_000_000,
                        bitDepth: 10,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hdr10',
                    },
                    {
                        name: '4K HDR10 29.97fps',
                        width: 3840,
                        height: 2160,
                        framerate: 29.97,
                        bitrate: 20_000_000,
                        bitDepth: 10,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hdr10',
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'av01', meaning: 'AV1 codec identifier per AV1 Codec ISO Media File Format Binding.' },
                        { token: '0', meaning: 'Main Profile (seq_profile=0). 8-bit and 10-bit, 4:2:0 only.' },
                        { token: '12M', meaning: 'Level 5.0 (seq_level_idx=12), Main tier. Max 8,912,896 luma samples — supports 4K@30fps. Main tier peak bitrate 30 Mbps.' },
                        { token: '10', meaning: '10-bit (BitDepth=10).' },
                        { token: '0', meaning: 'Not monochrome (mono_chrome=0). Color image.' },
                        { token: '110', meaning: 'Chroma subsampling 4:2:0 (subsampling_x=1, subsampling_y=1, chroma_sample_position=0).' },
                        { token: '09', meaning: 'Color primaries: BT.2020 (color_primaries=9, ITU-T H.273).' },
                        { token: '16', meaning: 'Transfer characteristics: SMPTE ST 2084 PQ (transfer_characteristics=16, ITU-T H.273).' },
                        { token: '09', meaning: 'Matrix coefficients: BT.2020 non-constant luminance (matrix_coefficients=9, ITU-T H.273).' },
                        { token: '0', meaning: 'Studio/limited range (color_range=0).' }
                    ],
                    overview: 'AV1 Main Profile at Level 5.0 with full CICP color signaling for HDR10. The explicit BT.2020 + PQ parameters in the codec string let the player configure HDR output before parsing the bitstream. Level 5.0 max display rate 267M samples/s — enough for 4K@30fps but not 4K@60fps.',
                    streaming: {
                        hls: [
                            {
                                signal: 'HDR10 PQ 4K',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=20000000,CODECS="av01.0.12M.10.0.110.09.16.09.0,mp4a.40.2",RESOLUTION=3840x2160,VIDEO-RANGE=PQ
av1_4k_hdr10.m3u8`,
                                notes: 'Extended codec string with full CICP in CODECS attribute. The player can verify BT.2020/PQ support from the codec string alone, without parsing the bitstream. VIDEO-RANGE=PQ required. fMP4 segments only.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'HDR10 PQ 4K',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="av01.0.12M.10.0.110.09.16.09.0">
  <Representation bandwidth="20000000" width="3840" height="2160" frameRate="30"/>
</AdaptationSet>`,
                                notes: 'Extended codec string already embeds CICP (cp=9, tc=16, mc=9) — no separate SupplementalProperty needed. The codec string and DASH properties are redundant-safe: explicit is preferred for player compatibility.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF per AV1 ISOBMFF Binding. av1C box stores AV1CodecConfigurationRecord. ColourInformationBox (colr) carries CICP values matching the codec string.',
                        mkv: 'Matroska with CodecID V_AV1. Colour element carries BT.2020 primaries + PQ transfer + mastering display metadata.',
                        webm: 'WebM — 4K AV1 HDR in WebM. Matroska Colour element for CICP signaling.',
                        fmp4: 'Fragmented MP4 for HLS/DASH segments. Color and HDR metadata in the init segment.',
                        cmaf: 'CMAF (ISO 23000-19) — constrained fMP4 for dual HLS+DASH HDR delivery.'
                    },
                    references: [
                        { title: 'AV1 Bitstream & Decoding Process Specification', url: 'https://aomediacodec.github.io/av1-spec/' },
                        { title: 'AV1 Codec ISO Media File Format Binding', url: 'https://aomediacodec.github.io/av1-isobmff/' },
                        { title: 'ITU-T H.273 (CICP)', url: 'https://www.itu.int/rec/T-REC-H.273' }
                    ]
                }
            },
            // ── av01.0.13M.10 ──

            {
                codec: 'av01.0.13M.10',
                name: 'AV1 Main 4K 60fps HDR10',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash', 'cmaf']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [
                    {
                        name: '4K HDR10 60fps',
                        width: 3840,
                        height: 2160,
                        framerate: 60,
                        bitrate: 35_000_000,
                        bitDepth: 10,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hdr10',
                    },
                    {
                        name: '4K HDR10 59.94fps',
                        width: 3840,
                        height: 2160,
                        framerate: 59.94,
                        bitrate: 35_000_000,
                        bitDepth: 10,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hdr10',
                    },
                    {
                        name: '4K HDR10 23.976fps',
                        width: 3840,
                        height: 2160,
                        framerate: 23.976,
                        bitrate: 20_000_000,
                        bitDepth: 10,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hdr10',
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'av01', meaning: 'AV1 codec identifier per AV1 Codec ISO Media File Format Binding.' },
                        { token: '0', meaning: 'Main Profile (seq_profile=0). 8-bit and 10-bit, 4:2:0 only.' },
                        { token: '13M', meaning: 'Level 5.1 (seq_level_idx=13), Main tier. Max display rate 534M samples/s — supports 4K@60fps. Main tier peak bitrate 40 Mbps.' },
                        { token: '10', meaning: '10-bit (BitDepth=10). Required for HDR10 PQ content.' }
                    ],
                    overview: 'AV1 Main Profile at Level 5.1 — 4K@60fps HDR. Level 5.1 doubles the display rate of 5.0 (534M vs 267M samples/s), enabling 60fps at 4K. Used for premium HDR sports and gaming streaming.',
                    streaming: {
                        hls: [
                            {
                                signal: 'HDR10 4K 60fps',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=35000000,CODECS="av01.0.13M.10,mp4a.40.2",RESOLUTION=3840x2160,VIDEO-RANGE=PQ,FRAME-RATE=60
av1_4k_hdr10_60fps.m3u8`,
                                notes: 'FRAME-RATE=60 attribute recommended for high frame rate variants so the player can filter by display capability. VIDEO-RANGE=PQ signals HDR10. fMP4 segments required.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'HDR10 4K 60fps with CICP',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="av01.0.13M.10">
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="16"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <Representation bandwidth="35000000" width="3840" height="2160" frameRate="60"/>
</AdaptationSet>`,
                                notes: 'CICP TC=16 (PQ) + CP=9 (BT.2020). 60fps at 4K doubles segment data vs 30fps — consider shorter segment durations for ABR stability.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF per AV1 ISOBMFF Binding. 4K@60fps MP4 at 35 Mbps requires sustained I/O from SSD or fast network storage.',
                        mkv: 'Matroska with CodecID V_AV1. 60fps MKV for gaming captures or sports content.',
                        webm: 'WebM — 4K 60fps AV1 HDR in WebM. High data rate, requires hardware AV1 decode.',
                        fmp4: 'Fragmented MP4 for DASH segments. 60fps doubles segment data vs 30fps — shorter segments recommended for ABR stability.',
                        cmaf: 'CMAF (ISO 23000-19) — constrained fMP4 for dual HLS+DASH 60fps HDR delivery.'
                    },
                    references: [
                        { title: 'AV1 Bitstream & Decoding Process Specification', url: 'https://aomediacodec.github.io/av1-spec/' },
                        { title: 'AV1 Codec ISO Media File Format Binding', url: 'https://aomediacodec.github.io/av1-isobmff/' }
                    ]
                }
            },
            // ── av01.0.16M.10 ──

            {
                codec: 'av01.0.16M.10',
                name: 'AV1 Main 8K HDR10',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash', 'cmaf']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '8K HDR10 30fps',
                    width: 7680,
                    height: 4320,
                    framerate: 30,
                    bitrate: 50_000_000,
                    bitDepth: 10,
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10',
                }],
                education: {
                    breakdown: [
                        { token: 'av01', meaning: 'AV1 codec identifier per AV1 Codec ISO Media File Format Binding.' },
                        { token: '0', meaning: 'Main Profile (seq_profile=0). 8-bit and 10-bit, 4:2:0 only.' },
                        { token: '16M', meaning: 'Level 6.0 (seq_level_idx=16), Main tier. Supports 8K@30fps. Main tier peak bitrate 60 Mbps.' },
                        { token: '10', meaning: '10-bit (BitDepth=10). Required for HDR10 PQ content.' }
                    ],
                    overview: 'AV1 Main Profile at Level 6.0 — 8K HDR. Level 6.0 is the first level supporting 8K (7680x4320). Hardware decode support is limited to recent SoCs (Samsung S928+, MediaTek Dimensity 9300+).',
                    streaming: {
                        hls: [
                            {
                                signal: 'HDR10 8K',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=50000000,CODECS="av01.0.16M.10,mp4a.40.2",RESOLUTION=7680x4320,VIDEO-RANGE=PQ
av1_8k_hdr10.m3u8`,
                                notes: '8K AV1 in HLS is theoretical — no consumer device supports 8K AV1 HLS playback. Tests API-level codec string recognition. fMP4 segments at 50+ Mbps require very high throughput.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'HDR10 8K with CICP',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="av01.0.16M.10">
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="16"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <Representation bandwidth="50000000" width="7680" height="4320" frameRate="30"/>
</AdaptationSet>`,
                                notes: 'CICP TC=16 (PQ) + CP=9 (BT.2020). 8K AV1 DASH exists in demo/test content from Samsung and NHK. Real-world streaming at 8K requires ~80-100+ Mbps sustained throughput.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF per AV1 ISOBMFF Binding. 8K MP4 at 50+ Mbps. Practical only from NVMe storage or high-bandwidth network.',
                        mkv: 'Matroska with CodecID V_AV1. 8K AV1 MKV exists for demo content and camera test footage.',
                        webm: 'WebM — 8K AV1 in WebM. YouTube has served limited 8K AV1 demo content via WebM DASH.',
                        fmp4: 'Fragmented MP4 for DASH segments. 8K segment sizes are very large — short segment durations may not be practical.',
                        cmaf: 'CMAF (ISO 23000-19) — 8K CMAF is theoretical. No production pipeline currently delivers 8K AV1 CMAF content.'
                    },
                    references: [
                        { title: 'AV1 Bitstream & Decoding Process Specification', url: 'https://aomediacodec.github.io/av1-spec/' },
                        { title: 'AV1 Codec ISO Media File Format Binding', url: 'https://aomediacodec.github.io/av1-isobmff/' }
                    ]
                }
            },
            // ── av01.1.08M.10 ──

            {
                codec: 'av01.1.08M.10',
                name: 'AV1 High 1080p 4:4:4',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash', 'cmaf']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [
                    {
                        name: '1080p 4:4:4 HDR10 24fps',
                        width: 1920,
                        height: 1080,
                        framerate: 24,
                        bitrate: 8_000_000,
                        bitDepth: 10,
                        chromaSubsampling: '4:4:4',
                        transferFunction: 'pq',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hdr10',
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'av01', meaning: 'AV1 codec identifier per AV1 Codec ISO Media File Format Binding.' },
                        { token: '1', meaning: 'High Profile (seq_profile=1). 8-bit and 10-bit, adds 4:4:4 chroma subsampling.' },
                        { token: '08M', meaning: 'Level 4.0 (seq_level_idx=8), Main tier. Supports 4K@30fps.' },
                        { token: '10', meaning: '10-bit (BitDepth=10).' }
                    ],
                    overview: 'AV1 High Profile at Level 4.0 — enables 4:4:4 chroma. High Profile adds full-resolution chroma channels, used for screen content and professional workflows. No consumer hardware decoder supports High Profile as of 2025.',
                    streaming: {
                        hls: [
                            {
                                signal: 'High Profile 4:4:4',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=8000000,CODECS="av01.1.08M.10,mp4a.40.2",RESOLUTION=1920x1080,VIDEO-RANGE=PQ
av1_high_444.m3u8`,
                                notes: 'High Profile (seq_profile=1) in HLS. No consumer device supports AV1 High Profile — this tests API-level codec string recognition. Apple HLS spec does not specifically address AV1 High Profile.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'High Profile 4:4:4 with CICP',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="av01.1.08M.10">
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="16"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <Representation bandwidth="8000000" width="1920" height="1080" frameRate="24"/>
</AdaptationSet>`,
                                notes: 'CICP TC=16 (PQ) + CP=9 (BT.2020). High Profile 4:4:4 in DASH is for professional/screen content workflows. No consumer DASH player supports High Profile decode.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF per AV1 ISOBMFF Binding. av1C box records chroma_subsampling_x=0, chroma_subsampling_y=0 for 4:4:4.',
                        mkv: 'Matroska with CodecID V_AV1. 4:4:4 MKV for screen capture and professional workflows.',
                        webm: 'WebM — 4:4:4 AV1 in WebM. Screen content encoding where full chroma resolution preserves text and UI clarity.',
                        fmp4: 'Fragmented MP4 — same MIME as regular MP4. 4:4:4 increases data rate ~50% vs 4:2:0 at equivalent quality.',
                        cmaf: 'CMAF (ISO 23000-19) — theoretical for 4:4:4 AV1. No production CMAF pipeline for High Profile.'
                    },
                    references: [
                        { title: 'AV1 Bitstream & Decoding Process Specification', url: 'https://aomediacodec.github.io/av1-spec/' },
                        { title: 'AV1 Codec ISO Media File Format Binding', url: 'https://aomediacodec.github.io/av1-isobmff/' }
                    ]
                }
            },
            // ── av01.2.08M.10 ──

            {
                codec: 'av01.2.08M.10',
                name: 'AV1 Professional 1080p 4:2:2',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash', 'cmaf']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [
                    {
                        name: '1080p 4:2:2 HDR10 24fps',
                        width: 1920,
                        height: 1080,
                        framerate: 24,
                        bitrate: 8_000_000,
                        bitDepth: 10,
                        chromaSubsampling: '4:2:2',
                        transferFunction: 'pq',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hdr10',
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'av01', meaning: 'AV1 codec identifier per AV1 Codec ISO Media File Format Binding.' },
                        { token: '2', meaning: 'Professional Profile (seq_profile=2). 8-12 bit, adds 4:2:2 and 12-bit 4:2:0/4:4:4.' },
                        { token: '08M', meaning: 'Level 4.0 (seq_level_idx=8), Main tier. Supports 4K@30fps.' },
                        { token: '10', meaning: '10-bit (BitDepth=10).' }
                    ],
                    overview: 'AV1 Professional Profile at Level 4.0 — enables 4:2:2 chroma and 12-bit depth. Used in professional post-production workflows. No consumer hardware decoder supports Professional Profile.',
                    streaming: {
                        hls: [
                            {
                                signal: 'Professional 4:2:2',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=8000000,CODECS="av01.2.08M.10,mp4a.40.2",RESOLUTION=1920x1080,VIDEO-RANGE=PQ
av1_pro_422.m3u8`,
                                notes: 'Professional Profile (seq_profile=2) in HLS. No consumer device supports AV1 Professional Profile — tests API recognition only. Not addressed in Apple HLS authoring spec.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'Professional 4:2:2 with CICP',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="av01.2.08M.10">
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="16"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <Representation bandwidth="8000000" width="1920" height="1080" frameRate="24"/>
</AdaptationSet>`,
                                notes: 'CICP TC=16 (PQ) + CP=9 (BT.2020). Professional Profile 4:2:2 in DASH — used in post-production streaming workflows. No consumer DASH player decodes this profile.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF per AV1 ISOBMFF Binding. av1C box records chroma_subsampling_x=1, chroma_subsampling_y=0 for 4:2:2.',
                        mkv: 'Matroska with CodecID V_AV1. Professional 4:2:2 MKV for post-production intermediate files.',
                        webm: 'WebM — 4:2:2 AV1 in WebM. Professional post-production format preserving full chroma bandwidth.',
                        fmp4: 'Fragmented MP4 — same MIME as regular MP4. 4:2:2 increases chroma data vs 4:2:0.',
                        cmaf: 'CMAF (ISO 23000-19) — theoretical for Professional Profile AV1. No production CMAF pipeline exists.'
                    },
                    references: [
                        { title: 'AV1 Bitstream & Decoding Process Specification', url: 'https://aomediacodec.github.io/av1-spec/' },
                        { title: 'AV1 Codec ISO Media File Format Binding', url: 'https://aomediacodec.github.io/av1-isobmff/' }
                    ]
                }
            },
            // ── av01.0.12M.08 ──

            {
                codec: 'av01.0.12M.08',
                name: 'AV1 Main 4K SDR',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash', 'cmaf']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K SDR 30fps',
                    width: 3840,
                    height: 2160,
                    framerate: 30,
                    bitrate: 20_000_000,
                    bitDepth: 8,
                },
                    {
                        name: '4K SDR 23.976fps',
                        width: 3840,
                        height: 2160,
                        framerate: 23.976,
                        bitrate: 20_000_000,
                        bitDepth: 8,
                    },
                    {
                        name: '4K SDR 29.97fps',
                        width: 3840,
                        height: 2160,
                        framerate: 29.97,
                        bitrate: 20_000_000,
                        bitDepth: 8,
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'av01', meaning: 'AV1 codec identifier per AV1 Codec ISO Media File Format Binding.' },
                        { token: '0', meaning: 'Main Profile (seq_profile=0). 8-bit and 10-bit, 4:2:0 only.' },
                        { token: '12M', meaning: 'Level 5.0 (seq_level_idx=12), Main tier. Max 8,912,896 luma samples — supports 4K@30fps. Main tier peak bitrate 30 Mbps.' },
                        { token: '08', meaning: '8-bit (BitDepth=8).' }
                    ],
                    overview: 'AV1 Main Profile at Level 5.0 — 4K SDR in 8-bit. Fills the 4K SDR gap after Level 4.0 records are capped at 1080p. YouTube and AV1-capable set-top boxes use Level 5.0 for 4K SDR delivery.',
                    streaming: {
                        hls: [
                            {
                                signal: 'SDR 4K',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=20000000,CODECS="av01.0.12M.08,mp4a.40.2",RESOLUTION=3840x2160
av1_4k_sdr.m3u8`,
                                notes: 'AV1 4K in HLS requires fMP4 segments and Safari 17+ / tvOS 17+. No VIDEO-RANGE needed for SDR.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'SDR 4K',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="av01.0.12M.08">
  <Representation bandwidth="20000000" width="3840" height="2160" frameRate="30"/>
</AdaptationSet>`,
                                notes: 'Standard DASH signaling. YouTube and Netflix use AV1 Level 5.0 for 4K SDR DASH delivery.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF per AV1 ISOBMFF Binding. av1C box stores AV1CodecConfigurationRecord. 4K SDR is the mainstream AV1 MP4 use case.',
                        mkv: 'Matroska with CodecID V_AV1. 4K AV1 MKV common in media server libraries (Jellyfin, Plex).',
                        webm: 'WebM — YouTube serves 4K AV1 as WebM via DASH.',
                        fmp4: 'Fragmented MP4 for DASH segments. Same video/mp4 MIME as regular MP4.',
                        cmaf: 'CMAF (ISO 23000-19) — constrained fMP4 for dual HLS+DASH delivery.'
                    },
                    references: [
                        { title: 'AV1 Bitstream & Decoding Process Specification', url: 'https://aomediacodec.github.io/av1-spec/' },
                        { title: 'AV1 Codec ISO Media File Format Binding', url: 'https://aomediacodec.github.io/av1-isobmff/' }
                    ]
                }
            }
        ]
    },
    video_vp9: {
        category: 'VP9',
        type: 'video',
        description: 'Profiles 0–3. Levels 1.0–6.1. 8-bit and 10-bit. 4:2:0, 4:2:2, 4:4:4. SDR and HDR10.',
        codecs: [
            // ── vp9 ──

            {
                codec: 'vp9',
                name: 'VP9 Legacy (bare)',
                containers: {
                    file: ['webm'],
                    stream: ['dash']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '1080p SDR',
                    width: 1920,
                    height: 1080,
                    framerate: 30,
                    bitrate: 5_000_000,
                },
                    {
                        name: '4K SDR',
                        width: 3840,
                        height: 2160,
                        framerate: 30,
                        bitrate: 15_000_000,
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'vp9', meaning: 'Bare VP9 codec tag without profile/level/depth parameters. Legacy format predating the vp09.PP.LL.DD binding.' }
                    ],
                    overview: 'Bare "vp9" tag — the original WebM codec string before the VP Codec ISO Media File Format Binding defined the structured vp09 format. Browser APIs must infer profile and level from the bitstream. Tests basic VP9 support detection.',
                    streaming: {
                        hls: [
                            {
                                signal: 'Legacy VP9',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=5000000,CODECS="vp9,opus",RESOLUTION=1920x1080
vp9_legacy.m3u8`,
                                notes: 'VP9 is not supported in Apple HLS — no Apple device plays VP9 in HLS manifests. Third-party MSE players (Shaka Player, hls.js) can handle VP9 on Chromium browsers.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'Legacy VP9',
                                mpd: `<AdaptationSet mimeType="video/webm" codecs="vp9">
  <Representation bandwidth="5000000" width="1920" height="1080" frameRate="30"/>
</AdaptationSet>`,
                                notes: 'Bare "vp9" tag in DASH — used by early YouTube VP9 DASH manifests before the structured vp09 format existed. Still accepted by all VP9-capable DASH players.'
                            }
                        ]
                    },
                    containerNotes: {
                        webm: 'WebM — the only container for bare "vp9" codec tag. WebM is a Matroska subset using CodecID V_VP9. YouTube originally served VP9 exclusively in WebM.'
                    },
                    references: [
                        { title: 'VP9 Bitstream Specification', url: 'https://www.webmproject.org/vp9/' },
                        { title: 'VP Codec ISO Media File Format Binding', url: 'https://www.webmproject.org/vp9/mp4/' }
                    ]
                }
            },
            // ── vp09.00.10.08 ──

            {
                codec: 'vp09.00.10.08',
                name: 'VP9 Profile 0 QCIF',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [
                    {
                        name: 'QCIF SDR 24fps',
                        width: 176,
                        height: 144,
                        framerate: 24,
                        bitrate: 150000,
                        bitDepth: 8,
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'vp09', meaning: 'VP9 codec identifier per VP Codec ISO Media File Format Binding.' },
                        { token: '00', meaning: 'Profile 0. 8-bit only, 4:2:0 chroma subsampling.' },
                        { token: '10', meaning: 'Level 1.0. Max 36,864 luma samples (192×192 max). Lowest defined level.' },
                        { token: '08', meaning: '8-bit (bitDepth=8).' }
                    ],
                    overview: 'VP9 Profile 0 at Level 1 — baseline profile detection at the minimum defined level. Level 1 caps at 36,864 luma samples (QCIF-class), testing whether the browser recognizes VP9 codec strings at all.',
                    streaming: {
                        hls: [
                            {
                                signal: 'SDR QCIF',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=150000,CODECS="vp09.00.10.08,opus",RESOLUTION=176x144
vp9_p0_l10.m3u8`,
                                notes: 'VP9 is not supported in Apple HLS. Third-party MSE players on Chromium can handle VP9 HLS via MediaSource Extensions.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'SDR QCIF',
                                mpd: `<AdaptationSet mimeType="video/webm" codecs="vp09.00.10.08">
  <Representation bandwidth="150000" width="176" height="144" frameRate="24"/>
</AdaptationSet>`,
                                notes: 'Structured VP9 codec string in DASH. WebM mimeType for WebM segments. Can also use video/mp4 when VP9 is in ISOBMFF per VP Codec ISO Media File Format Binding.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF per VP Codec ISO Media File Format Binding. vpcC box stores VP9 codec configuration.',
                        mkv: 'Matroska with CodecID V_VP9. Common for VP9 in media server libraries.',
                        webm: 'WebM (Matroska subset) — native VP9 container. YouTube serves VP9 exclusively in WebM.',
                        fmp4: 'Fragmented MP4 for DASH segments. VP9 in fMP4 per VP Codec ISO Media File Format Binding.',
                    },
                    references: [
                        { title: 'VP9 Bitstream Specification', url: 'https://www.webmproject.org/vp9/' },
                        { title: 'VP Codec ISO Media File Format Binding', url: 'https://www.webmproject.org/vp9/mp4/' }
                    ]
                }
            },
            // ── vp09.00.21.08 ──

            {
                codec: 'vp09.00.21.08',
                name: 'VP9 Profile 0 360p',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [
                    {
                        name: '360p SDR 30fps',
                        width: 640,
                        height: 360,
                        framerate: 30,
                        bitrate: 1_500_000,
                        bitDepth: 8,
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'vp09', meaning: 'VP9 codec identifier per VP Codec ISO Media File Format Binding.' },
                        { token: '00', meaning: 'Profile 0. 8-bit only, 4:2:0 chroma subsampling.' },
                        { token: '21', meaning: 'Level 2.1. Max 245,760 luma samples (dim ≤ 1344). Supports up to 360p resolution.' },
                        { token: '08', meaning: '8-bit (bitDepth=8).' }
                    ],
                    overview: 'VP9 Profile 0 at Level 2.1 — 360p SDR. Level 2.1 caps at 245,760 luma samples (640×384 max), suitable for 360p. Common as the lowest ABR rung in YouTube DASH manifests.',
                    streaming: {
                        hls: [
                            {
                                signal: 'SDR 360p',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=1500000,CODECS="vp09.00.21.08,opus",RESOLUTION=640x360
vp9_p0_360p.m3u8`,
                                notes: 'VP9 is not supported in Apple HLS. Third-party MSE players on Chromium can handle VP9 HLS.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'SDR 360p',
                                mpd: `<AdaptationSet mimeType="video/webm" codecs="vp09.00.21.08">
  <Representation bandwidth="1500000" width="640" height="360" frameRate="30"/>
</AdaptationSet>`,
                                notes: 'Level 2.1 in YouTube DASH — lowest ABR rung. YouTube uses video/webm mimeType with WebM segments for VP9 delivery.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF per VP Codec ISO Media File Format Binding. vpcC box stores VP9 codec configuration.',
                        mkv: 'Matroska with CodecID V_VP9.',
                        webm: 'WebM — native VP9 container. YouTube serves 480p VP9 as the lowest ABR rung.',
                        fmp4: 'Fragmented MP4 for DASH segments.',
                    },
                    references: [
                        { title: 'VP9 Bitstream Specification', url: 'https://www.webmproject.org/vp9/' },
                        { title: 'VP Codec ISO Media File Format Binding', url: 'https://www.webmproject.org/vp9/mp4/' }
                    ]
                }
            },
            // ── vp09.00.31.08 ──

            {
                codec: 'vp09.00.31.08',
                name: 'VP9 Profile 0 720p',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '720p SDR',
                    width: 1280,
                    height: 720,
                    framerate: 30,
                    bitrate: 5_000_000,
                },
                    {
                        name: '720p SDR 29.97fps',
                        width: 1280,
                        height: 720,
                        framerate: 29.97,
                        bitrate: 5_000_000,
                        bitDepth: 8,
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'vp09', meaning: 'VP9 codec identifier per VP Codec ISO Media File Format Binding.' },
                        { token: '00', meaning: 'Profile 0. 8-bit only, 4:2:0 chroma subsampling.' },
                        { token: '31', meaning: 'Level 3.1. Max 983,040 luma samples (dim ≤ 2752). Supports up to 720p resolution.' },
                        { token: '08', meaning: '8-bit (bitDepth=8).' }
                    ],
                    overview: 'VP9 Profile 0 at Level 3.1 — 720p SDR. Standard 720p delivery level for YouTube and DASH streaming.',
                    streaming: {
                        hls: [
                            {
                                signal: 'SDR 720p',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=5000000,CODECS="vp09.00.31.08,opus",RESOLUTION=1280x720
vp9_p0_720p.m3u8`,
                                notes: 'VP9 is not supported in Apple HLS. Third-party MSE players on Chromium can handle VP9 HLS.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'SDR 720p',
                                mpd: `<AdaptationSet mimeType="video/webm" codecs="vp09.00.31.08">
  <Representation bandwidth="5000000" width="1280" height="720" frameRate="30"/>
</AdaptationSet>`,
                                notes: 'Standard VP9 720p DASH signaling. YouTube uses Level 3.1 for 720p VP9 delivery.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF per VP Codec ISO Media File Format Binding. vpcC box stores VP9 codec configuration.',
                        mkv: 'Matroska with CodecID V_VP9. Common for 720p VP9 in media server libraries.',
                        webm: 'WebM — native VP9 container. YouTube 720p VP9 delivery in WebM.',
                        fmp4: 'Fragmented MP4 for DASH segments.',
                    },
                    references: [
                        { title: 'VP9 Bitstream Specification', url: 'https://www.webmproject.org/vp9/' },
                        { title: 'VP Codec ISO Media File Format Binding', url: 'https://www.webmproject.org/vp9/mp4/' }
                    ]
                }
            },
            // ── vp09.00.40.08 ──

            {
                codec: 'vp09.00.40.08',
                name: 'VP9 Profile 0 1080p',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '1080p SDR',
                    width: 1920,
                    height: 1080,
                    framerate: 30,
                    bitrate: 8_000_000,
                },
                    {
                        name: '1080p SDR 23.976fps',
                        width: 1920,
                        height: 1080,
                        framerate: 23.976,
                        bitrate: 8_000_000,
                        bitDepth: 8,
                    },
                    {
                        name: '1080p SDR 29.97fps',
                        width: 1920,
                        height: 1080,
                        framerate: 29.97,
                        bitrate: 8_000_000,
                        bitDepth: 8,
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'vp09', meaning: 'VP9 codec identifier per VP Codec ISO Media File Format Binding.' },
                        { token: '00', meaning: 'Profile 0. 8-bit only, 4:2:0 chroma subsampling.' },
                        { token: '40', meaning: 'Level 4.0. Supports up to 1080p resolution.' },
                        { token: '08', meaning: '8-bit (bitDepth=8).' }
                    ],
                    overview: 'VP9 Profile 0 at Level 4.0 — 1080p SDR. The primary 1080p delivery level. YouTube uses this for 1080p VP9 encodes in WebM containers.',
                    streaming: {
                        hls: [
                            {
                                signal: 'SDR 1080p',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=8000000,CODECS="vp09.00.40.08,opus",RESOLUTION=1920x1080
vp9_p0_1080p.m3u8`,
                                notes: 'VP9 is not supported in Apple HLS. Third-party MSE players on Chromium can handle VP9 HLS.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'SDR 1080p',
                                mpd: `<AdaptationSet mimeType="video/webm" codecs="vp09.00.40.08">
  <Representation bandwidth="8000000" width="1920" height="1080" frameRate="30"/>
</AdaptationSet>`,
                                notes: 'YouTube primary 1080p VP9 DASH delivery level. WebM segments with Opus audio.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF per VP Codec ISO Media File Format Binding. vpcC box stores VP9 codec configuration.',
                        mkv: 'Matroska with CodecID V_VP9. Common for 1080p VP9 in media server libraries (Jellyfin, Plex).',
                        webm: 'WebM — the primary VP9 1080p container. YouTube serves 1080p VP9 exclusively in WebM via DASH.',
                        fmp4: 'Fragmented MP4 for DASH segments. VP9 in fMP4 per VP Codec ISO Media File Format Binding.',
                    },
                    references: [
                        { title: 'VP9 Bitstream Specification', url: 'https://www.webmproject.org/vp9/' },
                        { title: 'VP Codec ISO Media File Format Binding', url: 'https://www.webmproject.org/vp9/mp4/' }
                    ]
                }
            },
            // ── vp09.00.50.08 ──

            {
                codec: 'vp09.00.50.08',
                name: 'VP9 Profile 0 4K',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K SDR',
                    width: 3840,
                    height: 2160,
                    framerate: 30,
                    bitrate: 15_000_000,
                },
                    {
                        name: '4K SDR 29.97fps',
                        width: 3840,
                        height: 2160,
                        framerate: 29.97,
                        bitrate: 20_000_000,
                        bitDepth: 8,
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'vp09', meaning: 'VP9 codec identifier per VP Codec ISO Media File Format Binding.' },
                        { token: '00', meaning: 'Profile 0. 8-bit only, 4:2:0 chroma subsampling.' },
                        { token: '50', meaning: 'Level 5.0. Supports up to 4K (3840x2160) resolution.' },
                        { token: '08', meaning: '8-bit (bitDepth=8).' }
                    ],
                    overview: 'VP9 Profile 0 at Level 5.0 — 4K SDR in 8-bit. YouTube serves 4K VP9 at this level. Chrome and Edge hardware-accelerate VP9 4K on supported GPUs.',
                    streaming: {
                        hls: [
                            {
                                signal: 'SDR 4K',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=15000000,CODECS="vp09.00.50.08,opus",RESOLUTION=3840x2160
vp9_p0_4k.m3u8`,
                                notes: 'VP9 is not supported in Apple HLS. Third-party MSE players on Chromium can handle VP9 4K HLS.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'SDR 4K',
                                mpd: `<AdaptationSet mimeType="video/webm" codecs="vp09.00.50.08">
  <Representation bandwidth="15000000" width="3840" height="2160" frameRate="30"/>
</AdaptationSet>`,
                                notes: 'YouTube 4K VP9 DASH delivery. Level 5.0 is the standard 4K SDR level. Chrome and Edge hardware-decode VP9 4K on supported GPUs.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF per VP Codec ISO Media File Format Binding. vpcC box stores VP9 codec configuration.',
                        mkv: 'Matroska with CodecID V_VP9. 4K VP9 MKV common in media server libraries.',
                        webm: 'WebM — YouTube serves 4K VP9 exclusively in WebM via DASH.',
                        fmp4: 'Fragmented MP4 for DASH segments. VP9 in fMP4 per VP Codec ISO Media File Format Binding.',
                    },
                    references: [
                        { title: 'VP9 Bitstream Specification', url: 'https://www.webmproject.org/vp9/' },
                        { title: 'VP Codec ISO Media File Format Binding', url: 'https://www.webmproject.org/vp9/mp4/' }
                    ]
                }
            },
            // ── vp09.01.10.08 ──

            {
                codec: 'vp09.01.10.08',
                name: 'VP9 Profile 1 QCIF',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [
                    {
                        name: 'QCIF 4:2:2 24fps',
                        width: 176,
                        height: 144,
                        framerate: 24,
                        bitrate: 150000,
                        bitDepth: 8,
                        chromaSubsampling: '4:2:2',
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'vp09', meaning: 'VP9 codec identifier per VP Codec ISO Media File Format Binding.' },
                        { token: '01', meaning: 'Profile 1. 8-bit, adds 4:2:2 and 4:4:4 chroma subsampling.' },
                        { token: '10', meaning: 'Level 1.0. Max 36,864 luma samples (192×192 max). Lowest defined level.' },
                        { token: '08', meaning: '8-bit (bitDepth=8).' }
                    ],
                    overview: 'VP9 Profile 1 at Level 1 — baseline 4:2:2 profile detection at the minimum level. Level 1 caps at 36,864 luma samples (QCIF-class). Tests whether the browser distinguishes Profile 1 from Profile 0.',
                    streaming: {
                        hls: [
                            {
                                signal: 'Profile 1 QCIF',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=150000,CODECS="vp09.01.10.08,opus",RESOLUTION=176x144
vp9_p1_422.m3u8`,
                                notes: 'VP9 is not supported in Apple HLS. Profile 1 adds no HLS-specific signaling. Tests API recognition of profile=01.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'Profile 1 QCIF',
                                mpd: `<AdaptationSet mimeType="video/webm" codecs="vp09.01.10.08">
  <Representation bandwidth="150000" width="176" height="144" frameRate="24"/>
</AdaptationSet>`,
                                notes: 'VP9 Profile 1 in DASH. Profile 1 (4:2:2/4:4:4) is not used by YouTube or mainstream DASH services. Tests decoder advertisement for non-standard chroma.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF per VP Codec ISO Media File Format Binding. vpcC box stores profile=1 configuration.',
                        mkv: 'Matroska with CodecID V_VP9. Profile 1 MKV for professional 4:2:2 workflows.',
                        webm: 'WebM — Profile 1 VP9 in WebM. Rarely used in practice.',
                        fmp4: 'Fragmented MP4 for DASH segments.',
                    },
                    references: [
                        { title: 'VP9 Bitstream Specification', url: 'https://www.webmproject.org/vp9/' },
                        { title: 'VP Codec ISO Media File Format Binding', url: 'https://www.webmproject.org/vp9/mp4/' }
                    ]
                }
            },
            // ── vp09.01.40.08 ──

            {
                codec: 'vp09.01.40.08',
                name: 'VP9 Profile 1 1080p',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '1080p 4:2:2',
                    width: 1920,
                    height: 1080,
                    framerate: 30,
                    bitrate: 8_000_000,
                }],
                education: {
                    breakdown: [
                        { token: 'vp09', meaning: 'VP9 codec identifier per VP Codec ISO Media File Format Binding.' },
                        { token: '01', meaning: 'Profile 1. 8-bit, adds 4:2:2 and 4:4:4 chroma subsampling.' },
                        { token: '40', meaning: 'Level 4.0. Supports up to 1080p resolution.' },
                        { token: '08', meaning: '8-bit (bitDepth=8).' }
                    ],
                    overview: 'VP9 Profile 1 at Level 4.0 — 1080p with 4:2:2/4:4:4 chroma in 8-bit. Profile 1 is rarely used in consumer content; screen capture and professional workflows may use it.',
                    streaming: {
                        hls: [
                            {
                                signal: 'Profile 1 1080p',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=8000000,CODECS="vp09.01.40.08,opus",RESOLUTION=1920x1080
vp9_p1_1080p.m3u8`,
                                notes: 'VP9 is not supported in Apple HLS. Profile 1 at 1080p level tests API recognition only.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'Profile 1 1080p',
                                mpd: `<AdaptationSet mimeType="video/webm" codecs="vp09.01.40.08">
  <Representation bandwidth="8000000" width="1920" height="1080" frameRate="30"/>
</AdaptationSet>`,
                                notes: 'VP9 Profile 1 at Level 4.0 in DASH. 4:2:2 chroma for screen content or professional capture. Not used by mainstream streaming services.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF per VP Codec ISO Media File Format Binding. vpcC box stores profile=1 configuration.',
                        mkv: 'Matroska with CodecID V_VP9. Profile 1 1080p MKV for screen capture workflows.',
                        webm: 'WebM — Profile 1 VP9 at 1080p. Screen content use case.',
                        fmp4: 'Fragmented MP4 for DASH segments.',
                    },
                    references: [
                        { title: 'VP9 Bitstream Specification', url: 'https://www.webmproject.org/vp9/' },
                        { title: 'VP Codec ISO Media File Format Binding', url: 'https://www.webmproject.org/vp9/mp4/' }
                    ]
                }
            },
            // ── vp09.02.10.10 ──

            {
                codec: 'vp09.02.10.10',
                name: 'VP9 Profile 2 QCIF',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [
                    {
                        name: 'QCIF 10-bit 24fps',
                        width: 176,
                        height: 144,
                        framerate: 24,
                        bitrate: 150000,
                        bitDepth: 10,
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'vp09', meaning: 'VP9 codec identifier per VP Codec ISO Media File Format Binding.' },
                        { token: '02', meaning: 'Profile 2. 10-bit or 12-bit, 4:2:0 chroma subsampling.' },
                        { token: '10', meaning: 'Level 1.0. Max 36,864 luma samples (192×192 max). Lowest defined level.' },
                        { token: '10', meaning: '10-bit (bitDepth=10). Required for HDR10 and HLG.' }
                    ],
                    overview: 'VP9 Profile 2 at Level 1 — baseline 10-bit profile detection at the minimum level. Short-form codec string without CICP parameters; tests whether the browser recognizes Profile 2 at the lowest level.',
                    streaming: {
                        hls: [
                            {
                                signal: 'Profile 2 QCIF',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=150000,CODECS="vp09.02.10.10,opus",RESOLUTION=176x144
vp9_p2_l1.m3u8`,
                                notes: 'VP9 is not supported in Apple HLS. Tests API recognition of VP9 Profile 2 at minimum level.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'Profile 2 QCIF',
                                mpd: `<AdaptationSet mimeType="video/webm" codecs="vp09.02.10.10">
  <Representation bandwidth="150000" width="176" height="144" frameRate="24"/>
</AdaptationSet>`,
                                notes: 'Short-form VP9 Profile 2 codec string in DASH. Level 1 QCIF scenario tests codec string recognition only.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF per VP Codec ISO Media File Format Binding. vpcC box stores profile=2, 10-bit config.',
                        mkv: 'Matroska with CodecID V_VP9. Colour element carries BT.2020/PQ metadata for HDR10.',
                        webm: 'WebM — VP9 HDR in WebM. YouTube serves VP9 HDR10 content in WebM via DASH.',
                        fmp4: 'Fragmented MP4 for DASH segments. HDR metadata in init segment.',
                    },
                    references: [
                        { title: 'VP9 Bitstream Specification', url: 'https://www.webmproject.org/vp9/' },
                        { title: 'VP Codec ISO Media File Format Binding', url: 'https://www.webmproject.org/vp9/mp4/' }
                    ]
                }
            },
            // ── vp09.02.10.10.01.09.16.09.01 ──

            {
                codec: 'vp09.02.10.10.01.09.16.09.01',
                name: 'VP9 Profile 2 QCIF HDR10 (full range)',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [
                    {
                        name: 'QCIF HDR10 24fps',
                        width: 176,
                        height: 144,
                        framerate: 24,
                        bitrate: 150000,
                        bitDepth: 10,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hdr10',
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'vp09', meaning: 'VP9 codec identifier per VP Codec ISO Media File Format Binding.' },
                        { token: '02', meaning: 'Profile 2. 10-bit or 12-bit, 4:2:0 chroma subsampling.' },
                        { token: '10', meaning: 'Level 1.0. Max 36,864 luma samples (192×192 max).' },
                        { token: '10', meaning: '10-bit (bitDepth=10).' },
                        { token: '01', meaning: 'Chroma subsampling: 4:2:0, colocated with luma (chromaSubsampling=1).' },
                        { token: '09', meaning: 'Color primaries: BT.2020 (colourPrimaries=9, ITU-T H.273).' },
                        { token: '16', meaning: 'Transfer characteristics: SMPTE ST 2084 PQ (transferCharacteristics=16, ITU-T H.273).' },
                        { token: '09', meaning: 'Matrix coefficients: BT.2020 non-constant luminance (matrixCoefficients=9, ITU-T H.273).' },
                        { token: '01', meaning: 'Full range (videoFullRangeFlag=1). Luma and chroma use the full 0-1023 range for 10-bit.' }
                    ],
                    overview: 'VP9 Profile 2 HDR10 with full-range signaling at Level 1. Full range (vs limited/studio) uses the complete code value space. Level 1 QCIF scenario tests browser handling of the extended codec string with videoFullRangeFlag.',
                    streaming: {
                        hls: [
                            {
                                signal: 'HDR10 Full Range QCIF',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=150000,CODECS="vp09.02.10.10.01.09.16.09.01,opus",RESOLUTION=176x144,VIDEO-RANGE=PQ
vp9_p2_hdr10_full.m3u8`,
                                notes: 'VP9 is not supported in Apple HLS. Extended codec string with full-range flag (videoFullRangeFlag=1) in CODECS attribute.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'HDR10 Full Range QCIF',
                                mpd: `<AdaptationSet mimeType="video/webm" codecs="vp09.02.10.10.01.09.16.09.01">
  <Representation bandwidth="150000" width="176" height="144" frameRate="24"/>
</AdaptationSet>`,
                                notes: 'Extended codec string embeds CICP (cp=9, tc=16, mc=9) + full range flag directly. No separate SupplementalProperty needed. Full range is uncommon for HDR10 delivery.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF per VP Codec ISO Media File Format Binding. vpcC box stores full-range color config.',
                        mkv: 'Matroska with CodecID V_VP9. Colour element carries BT.2020/PQ + full range flag.',
                        webm: 'WebM — VP9 HDR10 full-range in WebM. Full range uses 0-1023 for 10-bit (vs 64-940 for limited range).',
                        fmp4: 'Fragmented MP4 for DASH segments.',
                    },
                    references: [
                        { title: 'VP9 Bitstream Specification', url: 'https://www.webmproject.org/vp9/' },
                        { title: 'VP Codec ISO Media File Format Binding', url: 'https://www.webmproject.org/vp9/mp4/' },
                        { title: 'ITU-T H.273 (CICP)', url: 'https://www.itu.int/rec/T-REC-H.273' }
                    ]
                }
            },
            // ── vp09.02.10.10.01.09.18.09.01 ──

            {
                codec: 'vp09.02.10.10.01.09.18.09.01',
                name: 'VP9 Profile 2 QCIF HLG (full range)',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [
                    {
                        name: 'QCIF HLG 24fps',
                        width: 176,
                        height: 144,
                        framerate: 24,
                        bitrate: 150000,
                        bitDepth: 10,
                        transferFunction: 'hlg',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hlg',
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'vp09', meaning: 'VP9 codec identifier per VP Codec ISO Media File Format Binding.' },
                        { token: '02', meaning: 'Profile 2. 10-bit or 12-bit, 4:2:0 chroma subsampling.' },
                        { token: '10', meaning: 'Level 1.0. Max 36,864 luma samples (192×192 max).' },
                        { token: '10', meaning: '10-bit (bitDepth=10).' },
                        { token: '01', meaning: 'Chroma subsampling: 4:2:0, colocated with luma (chromaSubsampling=1).' },
                        { token: '09', meaning: 'Color primaries: BT.2020 (colourPrimaries=9, ITU-T H.273).' },
                        { token: '18', meaning: 'Transfer characteristics: ARIB STD-B67 HLG (transferCharacteristics=18, ITU-T H.273).' },
                        { token: '09', meaning: 'Matrix coefficients: BT.2020 non-constant luminance (matrixCoefficients=9, ITU-T H.273).' },
                        { token: '01', meaning: 'Full range (videoFullRangeFlag=1).' }
                    ],
                    overview: 'VP9 Profile 2 HLG with full-range signaling at Level 1. HLG (Hybrid Log-Gamma) is backward-compatible with SDR displays — no metadata required. Level 1 QCIF scenario tests browser handling of the extended HLG codec string.',
                    streaming: {
                        hls: [
                            {
                                signal: 'HLG Full Range QCIF',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=150000,CODECS="vp09.02.10.10.01.09.18.09.01,opus",RESOLUTION=176x144,VIDEO-RANGE=HLG
vp9_p2_hlg_full.m3u8`,
                                notes: 'VP9 is not supported in Apple HLS. VIDEO-RANGE=HLG shown for documentation — no Apple device processes VP9 HLG.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'HLG Full Range QCIF',
                                mpd: `<AdaptationSet mimeType="video/webm" codecs="vp09.02.10.10.01.09.18.09.01">
  <Representation bandwidth="150000" width="176" height="144" frameRate="24"/>
</AdaptationSet>`,
                                notes: 'Extended codec string embeds CICP (cp=9, tc=18 HLG, mc=9) + full range flag. No separate SupplementalProperty needed.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF per VP Codec ISO Media File Format Binding. vpcC box stores full-range HLG color config.',
                        mkv: 'Matroska with CodecID V_VP9. Colour element carries BT.2020/HLG + full range flag.',
                        webm: 'WebM — VP9 HLG full-range in WebM. HLG needs no static metadata — backward-compatible with SDR displays.',
                        fmp4: 'Fragmented MP4 for DASH segments.',
                    },
                    references: [
                        { title: 'VP9 Bitstream Specification', url: 'https://www.webmproject.org/vp9/' },
                        { title: 'VP Codec ISO Media File Format Binding', url: 'https://www.webmproject.org/vp9/mp4/' },
                        { title: 'ITU-T H.273 (CICP)', url: 'https://www.itu.int/rec/T-REC-H.273' }
                    ]
                }
            },
            // ── vp09.02.31.10 ──

            {
                codec: 'vp09.02.31.10',
                name: 'VP9 Profile 2 720p SDR',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [
                    {
                        name: '720p SDR 10-bit 30fps',
                        width: 1280,
                        height: 720,
                        framerate: 30,
                        bitrate: 5_000_000,
                        bitDepth: 10,
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'vp09', meaning: 'VP9 codec identifier per VP Codec ISO Media File Format Binding.' },
                        { token: '02', meaning: 'Profile 2. 10-bit or 12-bit, 4:2:0 chroma subsampling.' },
                        { token: '31', meaning: 'Level 3.1. Max 983,040 luma samples (dim ≤ 2752). Supports up to 720p resolution.' },
                        { token: '10', meaning: '10-bit (bitDepth=10).' }
                    ],
                    overview: 'VP9 Profile 2 at Level 3.1 — 10-bit SDR at 720p. 10-bit encoding without HDR reduces banding artifacts in gradients. Short-form codec string; color config inferred from bitstream.',
                    streaming: {
                        hls: [
                            {
                                signal: 'SDR 10-bit 720p',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=5000000,CODECS="vp09.02.31.10,opus",RESOLUTION=1280x720
vp9_p2_sdr10.m3u8`,
                                notes: 'VP9 is not supported in Apple HLS. 10-bit SDR (no HDR transfer function) — no VIDEO-RANGE needed.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'SDR 10-bit 720p',
                                mpd: `<AdaptationSet mimeType="video/webm" codecs="vp09.02.31.10">
  <Representation bandwidth="5000000" width="1280" height="720" frameRate="30"/>
</AdaptationSet>`,
                                notes: '10-bit SDR VP9 at 720p in DASH. Short-form codec string — no CICP supplemental properties for SDR. 10-bit reduces banding in gradients without requiring HDR display.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF per VP Codec ISO Media File Format Binding. vpcC box stores profile=2, 10-bit config.',
                        mkv: 'Matroska with CodecID V_VP9. 10-bit SDR MKV for gradient-sensitive content.',
                        webm: 'WebM — VP9 Profile 2 10-bit SDR in WebM.',
                        fmp4: 'Fragmented MP4 for DASH segments.',
                    },
                    references: [
                        { title: 'VP9 Bitstream Specification', url: 'https://www.webmproject.org/vp9/' },
                        { title: 'VP Codec ISO Media File Format Binding', url: 'https://www.webmproject.org/vp9/mp4/' }
                    ]
                }
            },
            // ── vp09.02.50.10 ──

            {
                codec: 'vp09.02.50.10',
                name: 'VP9 Profile 2 4K HDR',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K HDR10 30fps',
                    width: 3840,
                    height: 2160,
                    framerate: 30,
                    bitrate: 20_000_000,
                    bitDepth: 10,
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10',
                },
                    {
                        name: '4K HLG 30fps',
                        width: 3840,
                        height: 2160,
                        framerate: 30,
                        bitrate: 20_000_000,
                        bitDepth: 10,
                        transferFunction: 'hlg',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hlg',
                    },
                    {
                        name: '4K HDR10 29.97fps',
                        width: 3840,
                        height: 2160,
                        framerate: 29.97,
                        bitrate: 20_000_000,
                        bitDepth: 10,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hdr10',
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'vp09', meaning: 'VP9 codec identifier per VP Codec ISO Media File Format Binding.' },
                        { token: '02', meaning: 'Profile 2. 10-bit or 12-bit, 4:2:0 chroma subsampling.' },
                        { token: '50', meaning: 'Level 5.0. Supports up to 4K (3840x2160) resolution.' },
                        { token: '10', meaning: '10-bit (bitDepth=10). Required for HDR10 and HLG.' }
                    ],
                    overview: 'VP9 Profile 2 at Level 5.0 — 4K HDR. Short-form codec string without explicit CICP parameters. YouTube uses VP9 Profile 2 Level 5.0 for 4K HDR content in WebM.',
                    streaming: {
                        hls: [
                            {
                                signal: 'HDR10 4K',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=20000000,CODECS="vp09.02.50.10,opus",RESOLUTION=3840x2160,VIDEO-RANGE=PQ
vp9_p2_4k_hdr.m3u8`,
                                notes: 'VP9 is not supported in Apple HLS. Third-party MSE players on Chromium can handle VP9 HDR HLS.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'HDR10 4K with CICP',
                                mpd: `<AdaptationSet mimeType="video/webm" codecs="vp09.02.50.10">
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="16"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <Representation bandwidth="20000000" width="3840" height="2160" frameRate="30"/>
</AdaptationSet>`,
                                notes: 'CICP TC=16 (PQ) + CP=9 (BT.2020). Short-form codec string — CICP in DASH supplemental properties. YouTube 4K VP9 HDR delivery format.'
                            },
                            {
                                signal: 'HLG 4K with CICP',
                                mpd: `<AdaptationSet mimeType="video/webm" codecs="vp09.02.50.10">
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="18"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <Representation bandwidth="20000000" width="3840" height="2160" frameRate="30"/>
</AdaptationSet>`,
                                notes: 'CICP TC=18 (HLG) + CP=9 (BT.2020). Same short-form codec string — HLG vs PQ distinguished by CICP supplemental properties only.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF per VP Codec ISO Media File Format Binding. vpcC box stores profile=2, 10-bit config. HDR metadata in ColourInformationBox.',
                        mkv: 'Matroska with CodecID V_VP9. Colour element carries BT.2020/PQ or BT.2020/HLG metadata.',
                        webm: 'WebM — YouTube 4K VP9 HDR delivery container. Matroska Colour element for CICP signaling.',
                        fmp4: 'Fragmented MP4 for DASH segments. HDR metadata in init segment.',
                    },
                    references: [
                        { title: 'VP9 Bitstream Specification', url: 'https://www.webmproject.org/vp9/' },
                        { title: 'VP Codec ISO Media File Format Binding', url: 'https://www.webmproject.org/vp9/mp4/' }
                    ]
                }
            },
            // ── vp09.02.50.10.01.09.16.09.00 ──

            {
                codec: 'vp09.02.50.10.01.09.16.09.00',
                name: 'VP9 Profile 2 4K HDR10 (limited)',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K HDR10 30fps',
                    width: 3840,
                    height: 2160,
                    framerate: 30,
                    bitrate: 20_000_000,
                    bitDepth: 10,
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10',
                }],
                education: {
                    breakdown: [
                        { token: 'vp09', meaning: 'VP9 codec identifier per VP Codec ISO Media File Format Binding.' },
                        { token: '02', meaning: 'Profile 2. 10-bit or 12-bit, 4:2:0 chroma subsampling.' },
                        { token: '50', meaning: 'Level 5.0. Supports up to 4K (3840x2160) resolution.' },
                        { token: '10', meaning: '10-bit (bitDepth=10).' },
                        { token: '01', meaning: 'Chroma subsampling: 4:2:0, colocated with luma (chromaSubsampling=1).' },
                        { token: '09', meaning: 'Color primaries: BT.2020 (colourPrimaries=9, ITU-T H.273).' },
                        { token: '16', meaning: 'Transfer characteristics: SMPTE ST 2084 PQ (transferCharacteristics=16, ITU-T H.273).' },
                        { token: '09', meaning: 'Matrix coefficients: BT.2020 non-constant luminance (matrixCoefficients=9, ITU-T H.273).' },
                        { token: '00', meaning: 'Limited/studio range (videoFullRangeFlag=0). Standard for broadcast HDR10 delivery.' }
                    ],
                    overview: 'VP9 Profile 2 4K HDR10 with limited-range CICP signaling — the standard HDR10 delivery format. Limited range (16-235 for 8-bit equivalent) is the norm for HDR10 content.',
                    streaming: {
                        hls: [
                            {
                                signal: 'HDR10 Limited Range',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=20000000,CODECS="vp09.02.50.10.01.09.16.09.00,opus",RESOLUTION=3840x2160,VIDEO-RANGE=PQ
vp9_p2_4k_hdr10_limited.m3u8`,
                                notes: 'VP9 is not supported in Apple HLS. Extended codec string with limited-range flag (videoFullRangeFlag=0) — the standard HDR10 delivery format.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'HDR10 Limited Range',
                                mpd: `<AdaptationSet mimeType="video/webm" codecs="vp09.02.50.10.01.09.16.09.00">
  <Representation bandwidth="20000000" width="3840" height="2160" frameRate="30"/>
</AdaptationSet>`,
                                notes: 'Extended codec string embeds CICP (cp=9, tc=16, mc=9) + limited range flag. No separate SupplementalProperty needed. Limited range is the standard for HDR10 delivery.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF per VP Codec ISO Media File Format Binding. vpcC box stores limited-range HDR10 color config.',
                        mkv: 'Matroska with CodecID V_VP9. Colour element carries BT.2020/PQ + limited range (64-940 for 10-bit).',
                        webm: 'WebM — VP9 HDR10 limited-range in WebM. The standard HDR10 delivery format for VP9.',
                        fmp4: 'Fragmented MP4 for DASH segments.',
                    },
                    references: [
                        { title: 'VP9 Bitstream Specification', url: 'https://www.webmproject.org/vp9/' },
                        { title: 'VP Codec ISO Media File Format Binding', url: 'https://www.webmproject.org/vp9/mp4/' },
                        { title: 'ITU-T H.273 (CICP)', url: 'https://www.itu.int/rec/T-REC-H.273' }
                    ]
                }
            },
            // ── vp09.02.50.10.01.09.18.09.00 ──

            {
                codec: 'vp09.02.50.10.01.09.18.09.00',
                name: 'VP9 Profile 2 4K HLG (limited)',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K HLG 30fps',
                    width: 3840,
                    height: 2160,
                    framerate: 30,
                    bitrate: 20_000_000,
                    bitDepth: 10,
                    transferFunction: 'hlg',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hlg',
                }],
                education: {
                    breakdown: [
                        { token: 'vp09', meaning: 'VP9 codec identifier per VP Codec ISO Media File Format Binding.' },
                        { token: '02', meaning: 'Profile 2. 10-bit or 12-bit, 4:2:0 chroma subsampling.' },
                        { token: '50', meaning: 'Level 5.0. Supports up to 4K (3840x2160) resolution.' },
                        { token: '10', meaning: '10-bit (bitDepth=10).' },
                        { token: '01', meaning: 'Chroma subsampling: 4:2:0, colocated with luma (chromaSubsampling=1).' },
                        { token: '09', meaning: 'Color primaries: BT.2020 (colourPrimaries=9, ITU-T H.273).' },
                        { token: '18', meaning: 'Transfer characteristics: ARIB STD-B67 HLG (transferCharacteristics=18, ITU-T H.273).' },
                        { token: '09', meaning: 'Matrix coefficients: BT.2020 non-constant luminance (matrixCoefficients=9, ITU-T H.273).' },
                        { token: '00', meaning: 'Limited/studio range (videoFullRangeFlag=0).' }
                    ],
                    overview: 'VP9 Profile 2 4K HLG with limited-range CICP signaling. HLG uses a scene-referred transfer function — no static or dynamic metadata required. YouTube supports VP9 HLG for broadcast-origin HDR content.',
                    streaming: {
                        hls: [
                            {
                                signal: 'HLG Limited Range',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=20000000,CODECS="vp09.02.50.10.01.09.18.09.00,opus",RESOLUTION=3840x2160,VIDEO-RANGE=HLG
vp9_p2_4k_hlg_limited.m3u8`,
                                notes: 'VP9 is not supported in Apple HLS. Extended codec string with HLG transfer (tc=18) and limited-range flag.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'HLG Limited Range',
                                mpd: `<AdaptationSet mimeType="video/webm" codecs="vp09.02.50.10.01.09.18.09.00">
  <Representation bandwidth="20000000" width="3840" height="2160" frameRate="30"/>
</AdaptationSet>`,
                                notes: 'Extended codec string embeds CICP (cp=9, tc=18 HLG, mc=9) + limited range flag. YouTube supports VP9 HLG for broadcast-origin HDR content.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF per VP Codec ISO Media File Format Binding. vpcC box stores limited-range HLG color config.',
                        mkv: 'Matroska with CodecID V_VP9. Colour element carries BT.2020/HLG + limited range.',
                        webm: 'WebM — VP9 HLG limited-range in WebM. HLG needs no static metadata — backward-compatible with SDR displays.',
                        fmp4: 'Fragmented MP4 for DASH segments.',
                    },
                    references: [
                        { title: 'VP9 Bitstream Specification', url: 'https://www.webmproject.org/vp9/' },
                        { title: 'VP Codec ISO Media File Format Binding', url: 'https://www.webmproject.org/vp9/mp4/' },
                        { title: 'ITU-T H.273 (CICP)', url: 'https://www.itu.int/rec/T-REC-H.273' }
                    ]
                }
            },
            // ── vp09.02.51.10 ──

            {
                codec: 'vp09.02.51.10',
                name: 'VP9 Profile 2 4K60 HDR',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K HDR10 60fps',
                    width: 3840,
                    height: 2160,
                    framerate: 60,
                    bitrate: 40_000_000,
                    bitDepth: 10,
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10',
                },
                    {
                        name: '4K HLG 60fps',
                        width: 3840,
                        height: 2160,
                        framerate: 60,
                        bitrate: 40_000_000,
                        bitDepth: 10,
                        transferFunction: 'hlg',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hlg',
                    },
                    {
                        name: '4K HDR10 59.94fps',
                        width: 3840,
                        height: 2160,
                        framerate: 59.94,
                        bitrate: 35_000_000,
                        bitDepth: 10,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hdr10',
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'vp09', meaning: 'VP9 codec identifier per VP Codec ISO Media File Format Binding.' },
                        { token: '02', meaning: 'Profile 2. 10-bit or 12-bit, 4:2:0 chroma subsampling.' },
                        { token: '51', meaning: 'Level 5.1. Supports 4K@60fps with higher bitrate ceiling than Level 5.0.' },
                        { token: '10', meaning: '10-bit (bitDepth=10). Required for HDR10 and HLG.' }
                    ],
                    overview: 'VP9 Profile 2 at Level 5.1 — 4K@60fps HDR. Level 5.1 raises the decode rate above Level 5.0, enabling 60fps at 4K resolution. Used for high frame rate HDR streaming.',
                    streaming: {
                        hls: [
                            {
                                signal: 'HDR10 4K60',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=40000000,CODECS="vp09.02.51.10,opus",RESOLUTION=3840x2160,VIDEO-RANGE=PQ,FRAME-RATE=60
vp9_p2_4k60_hdr.m3u8`,
                                notes: 'VP9 is not supported in Apple HLS. FRAME-RATE=60 for high frame rate variant filtering.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'HDR10 4K60 with CICP',
                                mpd: `<AdaptationSet mimeType="video/webm" codecs="vp09.02.51.10">
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="16"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <Representation bandwidth="40000000" width="3840" height="2160" frameRate="60"/>
</AdaptationSet>`,
                                notes: 'CICP TC=16 (PQ) + CP=9 (BT.2020). Level 5.1 enables 4K@60fps. YouTube uses this for 4K60 HDR VP9 content.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF per VP Codec ISO Media File Format Binding. 4K@60fps VP9 at 40 Mbps requires fast storage I/O.',
                        mkv: 'Matroska with CodecID V_VP9. 4K@60fps VP9 MKV for high frame rate HDR content.',
                        webm: 'WebM — YouTube 4K60 VP9 HDR delivery container.',
                        fmp4: 'Fragmented MP4 for DASH segments. 60fps doubles segment data rate vs 30fps.',
                    },
                    references: [
                        { title: 'VP9 Bitstream Specification', url: 'https://www.webmproject.org/vp9/' },
                        { title: 'VP Codec ISO Media File Format Binding', url: 'https://www.webmproject.org/vp9/mp4/' }
                    ]
                }
            },
            // ── vp09.02.50.12 ──

            {
                codec: 'vp09.02.50.12',
                name: 'VP9 Profile 2 4K 12-bit',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K 12-bit HDR',
                    width: 3840,
                    height: 2160,
                    framerate: 30,
                    bitrate: 25_000_000,
                    bitDepth: 12,
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10',
                }],
                education: {
                    breakdown: [
                        { token: 'vp09', meaning: 'VP9 codec identifier per VP Codec ISO Media File Format Binding.' },
                        { token: '02', meaning: 'Profile 2. 10-bit or 12-bit, 4:2:0 chroma subsampling.' },
                        { token: '50', meaning: 'Level 5.0. Supports up to 4K (3840x2160) resolution.' },
                        { token: '12', meaning: '12-bit (bitDepth=12). Maximum depth supported by VP9.' }
                    ],
                    overview: 'VP9 Profile 2 at Level 5.0 — 4K in 12-bit. 12-bit depth provides 4096 levels per component vs 1024 for 10-bit. No consumer hardware decoder supports VP9 12-bit; tests software decode path.',
                    streaming: {
                        hls: [
                            {
                                signal: '12-bit 4K',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=25000000,CODECS="vp09.02.50.12,opus",RESOLUTION=3840x2160,VIDEO-RANGE=PQ
vp9_p2_4k_12bit.m3u8`,
                                notes: 'VP9 is not supported in Apple HLS. 12-bit VP9 tests API recognition only — no consumer hardware decoder supports 12-bit VP9.'
                            }
                        ],
                        dash: [
                            {
                                signal: '12-bit 4K with CICP',
                                mpd: `<AdaptationSet mimeType="video/webm" codecs="vp09.02.50.12">
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="16"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <Representation bandwidth="25000000" width="3840" height="2160" frameRate="30"/>
</AdaptationSet>`,
                                notes: 'CICP TC=16 (PQ) + CP=9 (BT.2020). 12-bit VP9 in DASH — professional/archival use case. Software decode only.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF per VP Codec ISO Media File Format Binding. vpcC box stores profile=2, 12-bit config.',
                        mkv: 'Matroska with CodecID V_VP9. 12-bit MKV for professional archival.',
                        webm: 'WebM — 12-bit VP9 in WebM. Professional/mastering use case.',
                        fmp4: 'Fragmented MP4 for DASH segments.',
                    },
                    references: [
                        { title: 'VP9 Bitstream Specification', url: 'https://www.webmproject.org/vp9/' },
                        { title: 'VP Codec ISO Media File Format Binding', url: 'https://www.webmproject.org/vp9/mp4/' }
                    ]
                }
            },
            // ── vp09.03.10.10 ──

            {
                codec: 'vp09.03.10.10',
                name: 'VP9 Profile 3 QCIF',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [
                    {
                        name: 'QCIF 4:4:4 10-bit 24fps',
                        width: 176,
                        height: 144,
                        framerate: 24,
                        bitrate: 150000,
                        bitDepth: 10,
                        chromaSubsampling: '4:4:4',
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'vp09', meaning: 'VP9 codec identifier per VP Codec ISO Media File Format Binding.' },
                        { token: '03', meaning: 'Profile 3. 10-bit or 12-bit, adds 4:2:2 and 4:4:4 chroma subsampling.' },
                        { token: '10', meaning: 'Level 1.0. Max 36,864 luma samples (192×192 max). Lowest defined level.' },
                        { token: '10', meaning: '10-bit (bitDepth=10).' }
                    ],
                    overview: 'VP9 Profile 3 at Level 1 — baseline 4:4:4 10-bit profile detection at the minimum level. Profile 3 combines high bit depth with full chroma resolution. No consumer hardware decoder supports Profile 3.',
                    streaming: {
                        hls: [
                            {
                                signal: 'Profile 3 QCIF',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=150000,CODECS="vp09.03.10.10,opus",RESOLUTION=176x144
vp9_p3_444.m3u8`,
                                notes: 'VP9 is not supported in Apple HLS. Profile 3 (10-bit 4:4:4) tests API recognition only — no consumer hardware decoder supports Profile 3.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'Profile 3 QCIF',
                                mpd: `<AdaptationSet mimeType="video/webm" codecs="vp09.03.10.10">
  <Representation bandwidth="150000" width="176" height="144" frameRate="24"/>
</AdaptationSet>`,
                                notes: 'VP9 Profile 3 (10-bit 4:4:4) in DASH. Level 1 QCIF scenario tests codec string recognition. No consumer DASH player supports Profile 3.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF per VP Codec ISO Media File Format Binding. vpcC box stores profile=3 config.',
                        mkv: 'Matroska with CodecID V_VP9. Profile 3 4:4:4 MKV for screen content.',
                        webm: 'WebM — VP9 Profile 3 4:4:4. Professional/screen content encoding.',
                        fmp4: 'Fragmented MP4 for DASH segments.',
                    },
                    references: [
                        { title: 'VP9 Bitstream Specification', url: 'https://www.webmproject.org/vp9/' },
                        { title: 'VP Codec ISO Media File Format Binding', url: 'https://www.webmproject.org/vp9/mp4/' }
                    ]
                }
            },
            // ── vp09.03.50.10 ──

            {
                codec: 'vp09.03.50.10',
                name: 'VP9 Profile 3 4K',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K 4:4:4 HDR',
                    width: 3840,
                    height: 2160,
                    framerate: 30,
                    bitrate: 25_000_000,
                    bitDepth: 10,
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10',
                }],
                education: {
                    breakdown: [
                        { token: 'vp09', meaning: 'VP9 codec identifier per VP Codec ISO Media File Format Binding.' },
                        { token: '03', meaning: 'Profile 3. 10-bit or 12-bit, adds 4:2:2 and 4:4:4 chroma subsampling.' },
                        { token: '50', meaning: 'Level 5.0. Supports up to 4K (3840x2160) resolution.' },
                        { token: '10', meaning: '10-bit (bitDepth=10).' }
                    ],
                    overview: 'VP9 Profile 3 at Level 5.0 — 4K with 10-bit 4:4:4 chroma. Full chroma resolution at 4K is a professional-grade configuration. No consumer hardware decoder supports Profile 3.',
                    streaming: {
                        hls: [
                            {
                                signal: 'Profile 3 4K 4:4:4',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=25000000,CODECS="vp09.03.50.10,opus",RESOLUTION=3840x2160,VIDEO-RANGE=PQ
vp9_p3_4k_444.m3u8`,
                                notes: 'VP9 is not supported in Apple HLS. Profile 3 4K 4:4:4 tests API recognition only.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'Profile 3 4K 4:4:4 with CICP',
                                mpd: `<AdaptationSet mimeType="video/webm" codecs="vp09.03.50.10">
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="16"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <Representation bandwidth="25000000" width="3840" height="2160" frameRate="30"/>
</AdaptationSet>`,
                                notes: 'CICP TC=16 (PQ) + CP=9 (BT.2020). 4K 4:4:4 VP9 in DASH — professional-grade. No consumer support.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF per VP Codec ISO Media File Format Binding. vpcC box stores profile=3 config.',
                        mkv: 'Matroska with CodecID V_VP9. 4K 4:4:4 MKV for professional workflows.',
                        webm: 'WebM — VP9 Profile 3 4K 4:4:4. Professional post-production format.',
                        fmp4: 'Fragmented MP4 for DASH segments. 4:4:4 increases data rate ~50% vs 4:2:0.',
                    },
                    references: [
                        { title: 'VP9 Bitstream Specification', url: 'https://www.webmproject.org/vp9/' },
                        { title: 'VP Codec ISO Media File Format Binding', url: 'https://www.webmproject.org/vp9/mp4/' }
                    ]
                }
            },
            // ── vp09.00.60.08 ──

            {
                codec: 'vp09.00.60.08',
                name: 'VP9 Profile 0 8K',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '8K SDR',
                    width: 7680,
                    height: 4320,
                    framerate: 30,
                    bitrate: 80_000_000,
                }],
                education: {
                    breakdown: [
                        { token: 'vp09', meaning: 'VP9 codec identifier per VP Codec ISO Media File Format Binding.' },
                        { token: '00', meaning: 'Profile 0. 8-bit only, 4:2:0 chroma subsampling.' },
                        { token: '60', meaning: 'Level 6.0. Supports up to 8K (7680x4320) resolution.' },
                        { token: '08', meaning: '8-bit (bitDepth=8).' }
                    ],
                    overview: 'VP9 Profile 0 at Level 6.0 — 8K SDR. Level 6.0 is the first VP9 level supporting 8K resolution. No browser hardware-accelerates VP9 at 8K; tests software decode capability.',
                    streaming: {
                        hls: [
                            {
                                signal: 'SDR 8K',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=80000000,CODECS="vp09.00.60.08,opus",RESOLUTION=7680x4320
vp9_p0_8k.m3u8`,
                                notes: 'VP9 is not supported in Apple HLS. 8K VP9 is theoretical — no consumer device supports 8K VP9 HLS playback.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'SDR 8K',
                                mpd: `<AdaptationSet mimeType="video/webm" codecs="vp09.00.60.08">
  <Representation bandwidth="80000000" width="7680" height="4320" frameRate="30"/>
</AdaptationSet>`,
                                notes: '8K VP9 in DASH is demo/test content only. YouTube has served limited 8K VP9 demo content. No browser hardware-accelerates VP9 at 8K resolution.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF per VP Codec ISO Media File Format Binding. 8K VP9 at 80 Mbps — practical only from NVMe storage.',
                        mkv: 'Matroska with CodecID V_VP9. 8K MKV for demo content.',
                        webm: 'WebM — 8K VP9 in WebM. YouTube 8K demo content.',
                        fmp4: 'Fragmented MP4 for DASH segments. Very large segment sizes at 8K.',
                    },
                    references: [
                        { title: 'VP9 Bitstream Specification', url: 'https://www.webmproject.org/vp9/' },
                        { title: 'VP Codec ISO Media File Format Binding', url: 'https://www.webmproject.org/vp9/mp4/' }
                    ]
                }
            },
            // ── vp09.00.41.08 ──

            {
                codec: 'vp09.00.41.08',
                name: 'VP9 Profile 0 1080p60',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '1080p60 SDR',
                    width: 1920,
                    height: 1080,
                    framerate: 60,
                    bitrate: 15_000_000,
                    bitDepth: 8,
                },
                    {
                        name: '1080p60 SDR 59.94fps',
                        width: 1920,
                        height: 1080,
                        framerate: 59.94,
                        bitrate: 15_000_000,
                        bitDepth: 8,
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'vp09', meaning: 'VP9 codec identifier per VP Codec ISO Media File Format Binding.' },
                        { token: '00', meaning: 'Profile 0. 8-bit only, 4:2:0 chroma subsampling.' },
                        { token: '41', meaning: 'Level 4.1. Max display rate 160,432,128 samples/s — supports 1080p@60fps. Max bitrate 30 Mbps.' },
                        { token: '08', meaning: '8-bit (bitDepth=8).' }
                    ],
                    overview: 'VP9 Profile 0 at Level 4.1 — 1080p@60fps SDR. Level 4.1 doubles the display rate of Level 4 (160M vs 83M samples/s), enabling 60fps at 1080p. YouTube uses this level for 1080p60 VP9 delivery.',
                    streaming: {
                        hls: [
                            {
                                signal: 'SDR 1080p60',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=15000000,CODECS="vp09.00.41.08,opus",RESOLUTION=1920x1080,FRAME-RATE=60
vp9_p0_1080p60.m3u8`,
                                notes: 'VP9 is not supported in Apple HLS. FRAME-RATE=60 attribute for high frame rate variant filtering. Third-party MSE players on Chromium can handle VP9 HLS.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'SDR 1080p60',
                                mpd: `<AdaptationSet mimeType="video/webm" codecs="vp09.00.41.08">
  <Representation bandwidth="15000000" width="1920" height="1080" frameRate="60"/>
</AdaptationSet>`,
                                notes: 'YouTube VP9 1080p60 DASH delivery. Level 4.1 is the standard YouTube level for 1080p@60fps VP9 content (sports, gaming).'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF per VP Codec ISO Media File Format Binding. vpcC box stores VP9 codec configuration.',
                        mkv: 'Matroska with CodecID V_VP9. 1080p60 VP9 MKV common in gaming captures.',
                        webm: 'WebM — native VP9 container. YouTube serves 1080p60 VP9 as WebM via DASH.',
                        fmp4: 'Fragmented MP4 for DASH segments. 60fps doubles segment data vs 30fps.',
                    },
                    references: [
                        { title: 'VP9 Bitstream Specification', url: 'https://www.webmproject.org/vp9/' },
                        { title: 'VP Codec ISO Media File Format Binding', url: 'https://www.webmproject.org/vp9/mp4/' }
                    ]
                }
            }
        ]
    },
    video_avc: {
        category: 'AVC/H.264',
        type: 'video',
        description: 'Baseline, Main, High, High 10, High 4:2:2, Constrained, Extended. Levels 3.0–5.2.',
        codecs: []
    },
    video_vvc: {
        category: 'VVC/H.266',
        type: 'video',
        description: 'Main 10 profile. Levels 3.1–6.1. 10-bit. SDR and HDR10. vvc1/vvi1 tags.',
        codecs: []
    },
    video_vp8: {
        category: 'VP8',
        type: 'video',
        description: 'VP8 in WebM, MKV, OGG. No profile/level system. SDR only.',
        codecs: []
    },

    // ── VIDEO: Brand ─────────────────────────────────────────

    video_dolby_vision: {
        category: 'Dolby Vision',
        type: 'video',
        description: 'Profiles 4, 5, 7, 8.1, 8.2, 8.4, 9, 10. Single-layer and dual-layer (base + RPU). Spans HEVC, AVC, AV1 base codecs.',
        codecs: [

            // ── dvh1.05.06 ──

            {
                codec: 'dvh1.05.06',
                name: '4K DV Profile 5 24fps',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K HDR10 24fps 10-bit',
                    width: 3840,
                    height: 2160,
                    framerate: 24,
                    bitrate: 25_000_000,
                    bitDepth: 10,
                    chromaSubsampling: '4:2:0',
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10'
                },
                    {
                        name: '4K HDR10 23.976fps 10-bit',
                        width: 3840,
                        height: 2160,
                        framerate: 23.976,
                        bitrate: 25_000_000,
                        bitDepth: 10,
                        chromaSubsampling: '4:2:0',
                        transferFunction: 'pq',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hdr10',
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'dvh1', meaning: 'Dolby Vision HEVC with parameter sets in the sample entry (out-of-band), like hvc1.' },
                        { token: '05', meaning: 'Profile 5. Single-layer HEVC, 10-bit 4:2:0. IPT-PQ color space internally. No backward-compatible base layer.' },
                        { token: '06', meaning: 'Level 06. Max 3840x2160@24fps per ETSI TS 103 572.' }
                    ],
                    overview: 'DV Profile 5 — single-layer HEVC without backward compatibility. Non-DV decoders cannot play the stream. Apple TV 4K and recent LG/Sony TVs support Profile 5. The dvh1 tag signals out-of-band parameter sets.',
                    streaming: {
                        hls: [
                            {
                                signal: 'DV Profile 5',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=25000000,CODECS="dvh1.05.06,mp4a.40.2",RESOLUTION=3840x2160,VIDEO-RANGE=PQ
dv_p5_4k.m3u8`,
                                notes: 'Apple requires dvh1 tag for DV HLS — dvhe is not recommended. VIDEO-RANGE=PQ always for Dolby Vision (DV uses IPT-PQ internally). fMP4 segments required. No backward-compatible fallback — non-DV devices cannot play this variant.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'DV Profile 5',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="dvh1.05.06">
  <SupplementalProperty schemeIdUri="urn:dolby:dash:codec_attributes:2014"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="16"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <Representation bandwidth="25000000" width="3840" height="2160" frameRate="24"/>
</AdaptationSet>`,
                                notes: 'Dolby DASH URN (urn:dolby:dash:codec_attributes:2014) signals DV-specific processing. CICP TC=16 (PQ) + CP=9 (BT.2020) for the HDR transfer.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF with DOVIDecoderConfigurationRecord in dvcC box. Profile 5 is single-layer — one HEVC track with RPU embedded.',
                        mkv: 'DV MKV support via MKVToolNix 67.0+ (2022). RPU stored as block additions. Shield TV and webOS 25+ support DV MKV.',
                        mov: 'QuickTime — Apple ecosystem. DV MOV from professional mastering workflows.',
                        fmp4: 'Fragmented MP4 for HLS/DASH segments. DOVIDecoderConfigurationRecord in init segment.',
                        mpegts: 'DV in MPEG-TS for broadcast (DVB). Profile 5 over transport stream is rare — broadcast typically uses Profile 8.',
                        cmaf: 'CMAF (ISO 23000-19) — constrained fMP4 for dual HLS+DASH DV delivery.'
                    },
                    references: [
                        { title: 'ETSI TS 103 572 (Dolby Vision)' },
                        { title: 'DOVI Configuration Record (DOVIDecoderConfigurationRecord)' }
                    ]
                }
            },

            // ── dvhe.05.06 ──

            {
                codec: 'dvhe.05.06',
                name: '4K DV Profile 5 24fps (dvhe)',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K HDR10 24fps 10-bit',
                    width: 3840,
                    height: 2160,
                    framerate: 24,
                    bitrate: 25_000_000,
                    bitDepth: 10,
                    chromaSubsampling: '4:2:0',
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10'
                }],
                education: {
                    breakdown: [
                        { token: 'dvhe', meaning: 'Dolby Vision HEVC with in-band parameter sets, like hev1. VPS/SPS/PPS repeated per access unit.' },
                        { token: '05', meaning: 'Profile 5. Single-layer HEVC, 10-bit 4:2:0. IPT-PQ color space internally.' },
                        { token: '06', meaning: 'Level 06. Max 3840x2160@24fps per ETSI TS 103 572.' }
                    ],
                    overview: 'DV Profile 5 with the dvhe tag (in-band parameter sets). Same Profile 5 content as dvh1.05.06 but with HEVC parameters repeated in the bitstream. Tests whether the browser distinguishes dvhe from dvh1.',
                    streaming: {
                        hls: [
                            {
                                signal: 'DV Profile 5 (dvhe)',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=25000000,CODECS="dvhe.05.06,mp4a.40.2",RESOLUTION=3840x2160,VIDEO-RANGE=PQ
dv_p5_4k_dvhe.m3u8`,
                                notes: 'Apple HLS authoring spec does NOT recommend dvhe — use dvh1 instead. This tests whether the browser accepts dvhe in HLS manifests. Some non-Apple players accept dvhe.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'DV Profile 5 (dvhe)',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="dvhe.05.06">
  <SupplementalProperty schemeIdUri="urn:dolby:dash:codec_attributes:2014"/>
  <Representation bandwidth="25000000" width="3840" height="2160" frameRate="24"/>
</AdaptationSet>`,
                                notes: 'DASH has no vendor preference between dvh1 and dvhe — both are valid. The dvhe vs dvh1 distinction matters only for HLS (Apple preference).'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF with DOVIDecoderConfigurationRecord in dvcC box. dvhe stores parameter sets in both sample entry and bitstream.',
                        mkv: 'DV MKV via MKVToolNix. In-band parameter sets align with Matroska NAL conventions.',
                        mov: 'QuickTime — dvhe MOV. Apple prefers dvh1 but QuickTime accepts dvhe.',
                        fmp4: 'Fragmented MP4 for HLS/DASH segments.',
                        mpegts: 'DV in MPEG-TS. In-band parameters (dvhe) natural for transport stream random access.',
                        cmaf: 'CMAF (ISO 23000-19) — DV with in-band parameter sets.'
                    },
                    references: [
                        { title: 'ETSI TS 103 572 (Dolby Vision)' },
                        { title: 'DOVI Configuration Record (DOVIDecoderConfigurationRecord)' }
                    ]
                }
            },

            // ── dvhe.07.06 ──

            {
                codec: 'dvhe.07.06',
                name: '4K DV Profile 7 24fps (MEL)',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K HDR10 24fps 10-bit',
                    width: 3840,
                    height: 2160,
                    framerate: 24,
                    bitrate: 50_000_000,
                    bitDepth: 10,
                    chromaSubsampling: '4:2:0',
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10'
                }],
                education: {
                    breakdown: [
                        { token: 'dvhe', meaning: 'Dolby Vision HEVC with in-band parameter sets.' },
                        { token: '07', meaning: 'Profile 7. Single-layer HEVC with MEL (Minimum Enhancement Layer) + RPU embedded in the HEVC NAL stream. 10-bit 4:2:0.' },
                        { token: '06', meaning: 'Level 06. Max 3840x2160@24fps per ETSI TS 103 572.' }
                    ],
                    overview: 'DV Profile 7 — single-layer HEVC with a small enhancement layer (MEL) embedded alongside the RPU. The MEL carries additional mapping data for improved DV rendering. Non-DV decoders ignore the MEL/RPU NAL units.',
                    streaming: {
                        hls: [
                            {
                                signal: 'DV Profile 7 MEL',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=50000000,CODECS="dvhe.07.06,mp4a.40.2",RESOLUTION=3840x2160,VIDEO-RANGE=PQ
dv_p7_mel.m3u8`,
                                notes: 'Profile 7 uses dvhe tag (in-band). Apple HLS prefers dvh1 — use dvh1.07.06 for Apple-targeted manifests. VIDEO-RANGE=PQ always for DV.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'DV Profile 7 MEL',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="dvhe.07.06">
  <SupplementalProperty schemeIdUri="urn:dolby:dash:codec_attributes:2014"/>
  <Representation bandwidth="50000000" width="3840" height="2160" frameRate="24"/>
</AdaptationSet>`,
                                notes: 'Dolby DASH URN signals DV processing. Profile 7 MEL provides richer DV metadata than Profile 5 RPU-only.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF with DOVIDecoderConfigurationRecord. Profile 7 MEL data embedded in HEVC NAL stream alongside the RPU.',
                        mkv: 'DV MKV via MKVToolNix. MEL+RPU stored as block additions.',
                        mov: 'QuickTime — DV Profile 7 MOV from mastering workflows.',
                        fmp4: 'Fragmented MP4 for HLS/DASH segments.',
                        mpegts: 'DV in MPEG-TS. MEL+RPU NAL units in the transport stream.',
                        cmaf: 'CMAF (ISO 23000-19) — DV Profile 7 in constrained fMP4.'
                    },
                    references: [
                        { title: 'ETSI TS 103 572 (Dolby Vision)' }
                    ]
                }
            },

            // ── dvh1.08.06 ──

            {
                codec: 'dvh1.08.06',
                name: '4K DV Profile 8.1 24fps (HDR10 base)',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K HDR10 24fps 10-bit',
                    width: 3840,
                    height: 2160,
                    framerate: 24,
                    bitrate: 25_000_000,
                    bitDepth: 10,
                    chromaSubsampling: '4:2:0',
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10'
                },
                    {
                        name: '4K HDR10 23.976fps 10-bit',
                        width: 3840,
                        height: 2160,
                        framerate: 23.976,
                        bitrate: 25_000_000,
                        bitDepth: 10,
                        chromaSubsampling: '4:2:0',
                        transferFunction: 'pq',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hdr10',
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'dvh1', meaning: 'Dolby Vision HEVC with parameter sets in the sample entry (out-of-band).' },
                        { token: '08', meaning: 'Profile 8. Single-layer HEVC with backward-compatible base layer + RPU. Sub-profile determined by base layer type (8.1=HDR10, 8.2=SDR, 8.4=HLG).' },
                        { token: '06', meaning: 'Level 06. Max 3840x2160@24fps per ETSI TS 103 572.' }
                    ],
                    overview: 'DV Profile 8.1 — backward-compatible with HDR10. Non-DV decoders play the HDR10 base layer (PQ + static metadata). DV-capable decoders apply the RPU for dynamic tone mapping. The most common DV profile for streaming (Netflix, Disney+).',
                    streaming: {
                        hls: [
                            {
                                signal: 'DV Profile 8.1 HDR10',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=25000000,CODECS="dvh1.08.06,mp4a.40.2",RESOLUTION=3840x2160,VIDEO-RANGE=PQ
dv_p81_hdr10.m3u8`,
                                notes: 'Apple requires dvh1 for DV HLS. VIDEO-RANGE=PQ for DV. Profile 8.1 is the most common DV profile in streaming manifests (Netflix, Disney+, Apple TV+). Always provide an HDR10 fallback variant for non-DV devices.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'DV Profile 8.1 HDR10',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="dvh1.08.06">
  <SupplementalProperty schemeIdUri="urn:dolby:dash:codec_attributes:2014"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="16"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <Representation bandwidth="25000000" width="3840" height="2160" frameRate="24"/>
</AdaptationSet>`,
                                notes: 'Dolby DASH URN + CICP TC=16 (PQ) + CP=9 (BT.2020). Profile 8.1 HDR10 base is the standard DV DASH delivery format.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF with DOVIDecoderConfigurationRecord in dvcC box. Profile 8 stores RPU alongside the HEVC base layer. HDR10 static metadata (MDCV/CLLI) in ISOBMFF boxes for non-DV fallback.',
                        mkv: 'DV MKV via MKVToolNix 67.0+. RPU as block additions. Shield TV, webOS 25+, and Kodi support Profile 8 DV MKV.',
                        mov: 'QuickTime — Profile 8.1 MOV. Apple platforms handle natively.',
                        fmp4: 'Fragmented MP4 for HLS/DASH segments. DOVIDecoderConfigurationRecord in init segment.',
                        mpegts: 'DV in MPEG-TS for broadcast. Profile 8 is the standard broadcast DV profile (DVB-T2).',
                        cmaf: 'CMAF (ISO 23000-19) — DV Profile 8.1 in constrained fMP4 for dual HLS+DASH delivery.'
                    },
                    references: [
                        { title: 'ETSI TS 103 572 (Dolby Vision)' }
                    ]
                }
            },

            // ── dvhe.08.09 ──

            {
                codec: 'dvhe.08.09',
                name: '4K DV Profile 8.4 60fps (HLG base, dvhe)',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K HLG 60fps 10-bit',
                    width: 3840,
                    height: 2160,
                    framerate: 60,
                    bitrate: 40_000_000,
                    bitDepth: 10,
                    chromaSubsampling: '4:2:0',
                    transferFunction: 'hlg',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hlg'
                },
                    {
                        name: '4K HLG 59.94fps 10-bit',
                        width: 3840,
                        height: 2160,
                        framerate: 59.94,
                        bitrate: 40_000_000,
                        bitDepth: 10,
                        chromaSubsampling: '4:2:0',
                        transferFunction: 'hlg',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hlg',
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'dvhe', meaning: 'Dolby Vision HEVC with in-band parameter sets.' },
                        { token: '08', meaning: 'Profile 8. Single-layer HEVC with backward-compatible base layer + RPU. Sub-profile 8.4 uses HLG base.' },
                        { token: '09', meaning: 'Level 09. Max 3840x2160@60fps per ETSI TS 103 572.' }
                    ],
                    overview: 'DV Profile 8.4 at Level 09 (4K@60fps) — backward-compatible with HLG. Non-DV decoders play the HLG base layer. Used for broadcast-origin content where HLG backward compatibility and high frame rate are needed alongside DV enhancement.',
                    streaming: {
                        hls: [
                            {
                                signal: 'DV Profile 8.4 HLG (dvhe)',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=40000000,CODECS="dvhe.08.09,mp4a.40.2",RESOLUTION=3840x2160,FRAME-RATE=60,VIDEO-RANGE=PQ
dv_p84_hlg_dvhe.m3u8`,
                                notes: 'Level 09 enables 4K@60fps. Apple HLS prefers dvh1 — use dvh1.08.09 for Apple manifests. VIDEO-RANGE=PQ for DV (not HLG, even though the base layer is HLG).'
                            }
                        ],
                        dash: [
                            {
                                signal: 'DV Profile 8.4 HLG (dvhe)',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="dvhe.08.09">
  <SupplementalProperty schemeIdUri="urn:dolby:dash:codec_attributes:2014"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="18"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <Representation bandwidth="40000000" width="3840" height="2160" frameRate="60"/>
</AdaptationSet>`,
                                notes: 'Level 09 (4K@60fps). CICP TC=18 (HLG) for the base layer transfer function. DV RPU provides dynamic tone mapping on top of the HLG base.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF with DOVIDecoderConfigurationRecord. Profile 8.4 HLG base layer metadata in ColourInformationBox.',
                        mkv: 'DV MKV via MKVToolNix. HLG base + DV RPU. Broadcast-to-streaming transcoding workflows.',
                        mov: 'QuickTime — Profile 8.4 HLG MOV for broadcast-origin content.',
                        fmp4: 'Fragmented MP4 for HLS/DASH segments.',
                        mpegts: 'DV in MPEG-TS. Profile 8.4 HLG is the standard for DV broadcast (DVB HLG + DV enhancement).',
                        cmaf: 'CMAF (ISO 23000-19) — DV Profile 8.4 in constrained fMP4.'
                    },
                    references: [
                        { title: 'ETSI TS 103 572 (Dolby Vision)' }
                    ]
                }
            },

            // ── hvc1.2.4.L153.B0, dvh1.05.07 ──

            {
                codec: 'hvc1.2.4.L153.B0, dvh1.05.07',
                name: '4K DV Profile 5 + HEVC 30fps (supplemental)',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K HDR10 30fps 10-bit',
                    width: 3840,
                    height: 2160,
                    framerate: 30,
                    bitrate: 30_000_000,
                    bitDepth: 10,
                    chromaSubsampling: '4:2:0',
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10'
                },
                    {
                        name: '4K HDR10 29.97fps 10-bit',
                        width: 3840,
                        height: 2160,
                        framerate: 29.97,
                        bitrate: 30_000_000,
                        bitDepth: 10,
                        chromaSubsampling: '4:2:0',
                        transferFunction: 'pq',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hdr10',
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'hvc1', meaning: 'HEVC base layer with out-of-band parameter sets.' },
                        { token: '2', meaning: 'Main 10 Profile (profile_idc=2). 10-bit 4:2:0.' },
                        { token: '4', meaning: 'Profile compatibility flags. Bit 2 set = Main 10.' },
                        { token: 'L153', meaning: 'Level 5.1, Main Tier. 153 = 51 × 3.' },
                        { token: 'B0', meaning: 'No additional constraint flags.' },
                        { token: 'dvh1', meaning: 'Dolby Vision HEVC enhancement layer (out-of-band).' },
                        { token: '05', meaning: 'DV Profile 5. Single-layer, 10-bit 4:2:0, IPT-PQ.' },
                        { token: '07', meaning: 'DV Level 07. Max 3840x2160@30fps per ETSI TS 103 572.' }
                    ],
                    overview: 'Supplemental DV codec string — declares both HEVC base (hvc1) and DV enhancement (dvh1) in one codecs= parameter. Level 07 targets 4K@30fps streaming. The comma-separated format lets the player check support for both layers simultaneously.',
                    streaming: {
                        hls: [
                            {
                                signal: 'DV P5 + HEVC Supplemental',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=30000000,CODECS="hvc1.2.4.L153.B0,dvh1.05.07,mp4a.40.2",RESOLUTION=3840x2160,FRAME-RATE=30,VIDEO-RANGE=PQ
dv_p5_hevc_supplemental.m3u8`,
                                notes: 'Comma-separated codecs in CODECS attribute — the player must support both HEVC Main 10 and DV P5 simultaneously. Apple uses this format to verify dual-layer capability in a single EXT-X-STREAM-INF.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'DV P5 + HEVC Supplemental',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="hvc1.2.4.L153.B0,dvh1.05.07">
  <SupplementalProperty schemeIdUri="urn:dolby:dash:codec_attributes:2014"/>
  <Representation bandwidth="30000000" width="3840" height="2160" frameRate="30"/>
</AdaptationSet>`,
                                notes: 'Dual codec string in DASH codecs attribute. Level 07 targets 4K@30fps. The player must parse both codec identifiers to determine support.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF with both hvcC (HEVC config) and dvcC (DV config) boxes. Supplemental codec strings declare both decoders needed.',
                        mkv: 'DV MKV — dual codec string tests browser parsing of comma-separated codec identifiers with Matroska MIME.',
                        mov: 'QuickTime — dual codec MOV from Apple professional workflows.',
                        fmp4: 'Fragmented MP4 — init segment carries both HEVC and DV configuration.',
                        mpegts: 'DV in MPEG-TS with supplemental signaling.',
                        cmaf: 'CMAF (ISO 23000-19) — dual codec CMAF for DV delivery.'
                    },
                    references: [
                        { title: 'ETSI TS 103 572 (Dolby Vision)' },
                        { title: 'ITU-T H.265 | ISO/IEC 23008-2', url: 'https://www.itu.int/rec/T-REC-H.265' }
                    ]
                }
            },

            // ── dva1.10.01 ──

            {
                codec: 'dva1.10.01',
                name: '720p DV Profile 10 24fps (AV1 base)',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '720p HDR10 24fps 10-bit',
                    width: 1280,
                    height: 720,
                    framerate: 24,
                    bitrate: 5_000_000,
                    bitDepth: 10,
                    chromaSubsampling: '4:2:0',
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10'
                }],
                education: {
                    breakdown: [
                        { token: 'dva1', meaning: 'Dolby Vision AV1-based. The dva1 tag indicates DV with AV1 as the base codec.' },
                        { token: '10', meaning: 'Profile 10. Single-layer AV1 with DV RPU metadata in OBU. 10-bit 4:2:0.' },
                        { token: '01', meaning: 'DV Level 01. Max 1280x720@24fps per ETSI TS 103 572.' }
                    ],
                    overview: 'DV Profile 10 at Level 01 (720p@24fps) with AV1 base — the next generation of DV delivery. AV1 offers ~30% better compression than HEVC. Level 01 tests baseline decoder capability. Profile 10 support is emerging on recent devices.',
                    streaming: {
                        hls: [
                            {
                                signal: 'DV Profile 10 AV1',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=5000000,CODECS="dva1.10.01,mp4a.40.2",RESOLUTION=1280x720,VIDEO-RANGE=PQ
dv_p10_av1.m3u8`,
                                notes: 'DV Profile 10 Level 01 (720p@24fps) in HLS. Requires both AV1 decode and DV RPU processing. fMP4 segments only. Support is emerging — few devices handle AV1+DV as of 2025.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'DV Profile 10 AV1',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="dva1.10.01">
  <SupplementalProperty schemeIdUri="urn:dolby:dash:codec_attributes:2014"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="16"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <Representation bandwidth="5000000" width="1280" height="720" frameRate="24"/>
</AdaptationSet>`,
                                notes: 'DV Profile 10 Level 01 (720p@24fps). AV1 + DV in DASH — next-generation delivery at baseline capability level.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF with DOVIDecoderConfigurationRecord. DV RPU embedded in AV1 OBU (Open Bitstream Units) format.',
                        mkv: 'Matroska with AV1 CodecID V_AV1 + DV RPU block additions. Emerging format.',
                        mov: 'QuickTime — DV Profile 10 AV1 MOV. Apple ecosystem support emerging.',
                        fmp4: 'Fragmented MP4 for HLS/DASH segments. AV1+DV init segment configuration.',
                        mpegts: 'AV1 in MPEG-TS is not standard. DV Profile 10 over transport stream is theoretical.',
                        cmaf: 'CMAF (ISO 23000-19) — AV1+DV CMAF for future dual HLS+DASH delivery.'
                    },
                    references: [
                        { title: 'ETSI TS 103 572 (Dolby Vision)' }
                    ]
                }
            },

            // ── dvhe.04.06 ──

            {
                codec: 'dvhe.04.06',
                name: '4K DV Profile 4 24fps (dual layer)',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K HDR10 24fps 10-bit',
                    width: 3840,
                    height: 2160,
                    framerate: 24,
                    bitrate: 50_000_000,
                    bitDepth: 10,
                    chromaSubsampling: '4:2:0',
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10'
                }],
                education: {
                    breakdown: [
                        { token: 'dvhe', meaning: 'Dolby Vision HEVC with in-band parameter sets.' },
                        { token: '04', meaning: 'Profile 4. Dual-layer HEVC — separate base layer (BL) and enhancement layer (EL). 12-bit 4:2:0 internal processing, cross-compatible.' },
                        { token: '06', meaning: 'Level 06. Max 3840x2160@24fps per ETSI TS 103 572.' }
                    ],
                    overview: 'DV Profile 4 — dual-layer HEVC. Two separate HEVC streams: a base layer and an enhancement layer. This is a studio/mastering profile, not used in consumer streaming. Tests whether the browser recognizes Profile 4.',
                    streaming: {
                        hls: [
                            {
                                signal: 'DV Profile 4 Dual-Layer',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=50000000,CODECS="dvhe.04.06,mp4a.40.2",RESOLUTION=3840x2160,VIDEO-RANGE=PQ
dv_p4_dual.m3u8`,
                                notes: 'Profile 4 (dual-layer, studio mastering) is not used in consumer HLS. Tests API recognition only. No consumer device plays Profile 4 content.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'DV Profile 4 Dual-Layer',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="dvhe.04.06">
  <SupplementalProperty schemeIdUri="urn:dolby:dash:codec_attributes:2014"/>
  <Representation bandwidth="50000000" width="3840" height="2160" frameRate="24"/>
</AdaptationSet>`,
                                notes: 'Profile 4 in DASH — studio mastering profile. No consumer DASH player supports dual-layer DV. Tests codec string recognition.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF with dual HEVC tracks — separate base layer (BL) and enhancement layer (EL). Studio mastering container format.',
                        mkv: 'DV MKV dual-layer. Dual HEVC streams in Matroska. Not supported by consumer players.',
                        mov: 'QuickTime — Profile 4 dual-layer MOV from DaVinci Resolve / Dolby Vision Professional workflows.',
                        fmp4: 'Fragmented MP4 — dual-layer segments. Studio/professional use only.',
                        mpegts: 'DV dual-layer in MPEG-TS is not a real-world scenario.',
                        cmaf: 'CMAF with dual-layer DV is theoretical.'
                    },
                    references: [
                        { title: 'ETSI TS 103 572 (Dolby Vision)' }
                    ]
                }
            },

            // ── dvh1.08.02 ──

            {
                codec: 'dvh1.08.02',
                name: '720p DV Profile 8.2 30fps (SDR base)',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '720p SDR 30fps 10-bit',
                    width: 1280,
                    height: 720,
                    framerate: 30,
                    bitrate: 5_000_000,
                    bitDepth: 10,
                    chromaSubsampling: '4:2:0',
                }],
                education: {
                    breakdown: [
                        { token: 'dvh1', meaning: 'Dolby Vision HEVC with parameter sets in the sample entry (out-of-band).' },
                        { token: '08', meaning: 'Profile 8. Single-layer HEVC with backward-compatible base layer + RPU. Sub-profile 8.2 uses SDR base.' },
                        { token: '02', meaning: 'DV Level 02. Max 1280x720@30fps per ETSI TS 103 572.' }
                    ],
                    overview: 'DV Profile 8.2 at Level 02 (720p@30fps) — backward-compatible with SDR. Non-DV decoders play the SDR base layer. DV-capable decoders apply the RPU to reconstruct HDR. Used for low-bandwidth DV delivery where SDR fallback is required.',
                    streaming: {
                        hls: [
                            {
                                signal: 'DV Profile 8.2 SDR Base',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=5000000,CODECS="dvh1.08.02,mp4a.40.2",RESOLUTION=1280x720,FRAME-RATE=30,VIDEO-RANGE=PQ
dv_p82_sdr.m3u8`,
                                notes: 'Level 02 caps at 720p@30fps. VIDEO-RANGE=PQ for DV (even though the base layer is SDR). The SDR base plays on non-DV devices. DV devices apply RPU for HDR reconstruction.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'DV Profile 8.2 SDR Base',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="dvh1.08.02">
  <SupplementalProperty schemeIdUri="urn:dolby:dash:codec_attributes:2014"/>
  <Representation bandwidth="5000000" width="1280" height="720" frameRate="30"/>
</AdaptationSet>`,
                                notes: 'Level 02 (720p@30fps). Profile 8.2 SDR-base — the DASH player falls back to SDR on non-DV devices.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF with DOVIDecoderConfigurationRecord. Profile 8.2 stores SDR HEVC + DV RPU in one track.',
                        mkv: 'DV MKV via MKVToolNix. SDR base + DV RPU as block additions.',
                        mov: 'QuickTime — Profile 8.2 SDR-base MOV.',
                        fmp4: 'Fragmented MP4 for HLS/DASH segments.',
                        mpegts: 'DV in MPEG-TS. SDR base layer is broadcast-friendly.',
                        cmaf: 'CMAF (ISO 23000-19) — DV Profile 8.2 in constrained fMP4.'
                    },
                    references: [
                        { title: 'ETSI TS 103 572 (Dolby Vision)' }
                    ]
                }
            },

            // ── dvh1.08.09 ──

            {
                codec: 'dvh1.08.09',
                name: '4K DV Profile 8.4 60fps (HLG base, dvh1)',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K HLG 60fps 10-bit',
                    width: 3840,
                    height: 2160,
                    framerate: 60,
                    bitrate: 40_000_000,
                    bitDepth: 10,
                    chromaSubsampling: '4:2:0',
                    transferFunction: 'hlg',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hlg'
                },
                    {
                        name: '4K HLG 59.94fps 10-bit',
                        width: 3840,
                        height: 2160,
                        framerate: 59.94,
                        bitrate: 40_000_000,
                        bitDepth: 10,
                        chromaSubsampling: '4:2:0',
                        transferFunction: 'hlg',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hlg',
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'dvh1', meaning: 'Dolby Vision HEVC with parameter sets in the sample entry (out-of-band).' },
                        { token: '08', meaning: 'Profile 8. Single-layer HEVC with backward-compatible base layer + RPU. Sub-profile 8.4 uses HLG base.' },
                        { token: '09', meaning: 'DV Level 09. Max 3840x2160@60fps per ETSI TS 103 572.' }
                    ],
                    overview: 'DV Profile 8.4 at Level 09 (4K@60fps) with dvh1 tag — backward-compatible with HLG. Same as dvhe.08.09 but with out-of-band parameter sets. Tests whether the browser distinguishes dvh1 from dvhe for Profile 8.4 at high frame rate.',
                    streaming: {
                        hls: [{
                            signal: '4K DV Profile 8.4 HLG — dvh1 tag',
                            m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=40000000,CODECS="dvh1.08.09,mp4a.40.2",RESOLUTION=3840x2160,FRAME-RATE=60,VIDEO-RANGE=PQ
dv_p84_hlg_dvh1.m3u8`,
                            notes: 'Level 09 enables 4K@60fps. Apple HLS mandates dvh1 (not dvhe). VIDEO-RANGE=PQ even though the base layer is HLG — DV always signals PQ. Non-DV clients fall back to HLG base layer.'
                        }],
                        dash: [{
                            signal: '4K DV Profile 8.4 HLG DASH',
                            mpd: `<AdaptationSet mimeType="video/mp4" codecs="dvh1.08.09">
  <SupplementalProperty schemeIdUri="urn:dolby:dash:codec_attributes:2014" value="dvh1.08.09"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="18"/>
  <Representation bandwidth="40000000" width="3840" height="2160" frameRate="60"/>
</AdaptationSet>`,
                            notes: 'Level 09 (4K@60fps). CICP TC=18 (HLG) describes the base layer transfer function. Non-DV DASH clients decode the HLG base layer.'
                        }]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF with DOVIDecoderConfigurationRecord in dvcC box. Base layer uses HLG transfer (ARIB STD-B67). RPU stored as enhancement layer NAL units.',
                        mkv: 'MKV DV requires MKVToolNix 67.0+. DV RPU stored as block additions. HLG base layer plays on non-DV players.',
                        fmp4: 'Fragmented MP4 for HLS/DASH segments. Each segment carries DV RPU alongside HLG base layer data.',
                        mpegts: 'DV Profile 8.4 HLG in MPEG-TS for DVB broadcast. Less common than Profile 8.1 HDR10 in broadcast deployments.'
                    },
                    references: [
                        { title: 'ETSI TS 103 572 (Dolby Vision)' }
                    ]
                }
            },

            // ── dvhe.08.06 ──

            {
                codec: 'dvhe.08.06',
                name: '4K DV Profile 8.1 24fps (HDR10 base, dvhe)',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K HDR10 24fps 10-bit',
                    width: 3840,
                    height: 2160,
                    framerate: 24,
                    bitrate: 25_000_000,
                    bitDepth: 10,
                    chromaSubsampling: '4:2:0',
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10'
                }],
                education: {
                    breakdown: [
                        { token: 'dvhe', meaning: 'Dolby Vision HEVC with in-band parameter sets.' },
                        { token: '08', meaning: 'Profile 8. Single-layer HEVC with backward-compatible base layer + RPU. Sub-profile 8.1 uses HDR10 base.' },
                        { token: '06', meaning: 'Level 06. Max 3840x2160@24fps per ETSI TS 103 572.' }
                    ],
                    overview: 'DV Profile 8.1 with dvhe tag (in-band parameter sets). Same Profile 8.1 HDR10-backward-compatible content as dvh1.08.06. Tests whether the browser handles dvhe differently from dvh1.',
                    streaming: {
                        hls: [{
                            signal: '4K DV Profile 8.1 HDR10 — dvhe tag',
                            m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=25000000,CODECS="dvhe.08.06,mp4a.40.2",RESOLUTION=3840x2160,VIDEO-RANGE=PQ
dv_p81_hdr10_dvhe.m3u8`,
                            notes: 'Apple HLS requires dvh1, not dvhe. Using dvhe in HLS manifests may fail on Apple devices. Android and smart TV platforms vary in dvhe recognition. This tests browser API handling of the non-preferred tag.'
                        }],
                        dash: [{
                            signal: '4K DV Profile 8.1 HDR10 DASH — dvhe tag',
                            mpd: `<AdaptationSet mimeType="video/mp4" codecs="dvhe.08.06">
  <SupplementalProperty schemeIdUri="urn:dolby:dash:codec_attributes:2014" value="dvhe.08.06"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="16"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <Representation bandwidth="25000000" width="3840" height="2160" frameRate="24"/>
</AdaptationSet>`,
                            notes: 'DASH has no Apple-imposed tag restriction — dvhe is valid alongside the Dolby URN. CICP TC=16 (PQ) and CP=9 (BT.2020) describe the HDR10 base layer.'
                        }]
                    },
                    containerNotes: {
                        mp4: 'Same ISOBMFF structure as dvh1.08.06 — DOVIDecoderConfigurationRecord in dvcC box with HDR10 (PQ + static metadata) base layer.',
                        mkv: 'MKV muxing identical to dvh1 variant. The hev1/dvhe vs hvc1/dvh1 distinction is a codec tag preference, not a container difference.',
                        fmp4: 'In-band parameter sets (dvhe) means VPS/SPS/PPS are repeated in each segment, increasing segment overhead slightly vs dvh1.',
                        mpegts: 'MPEG-TS DV transport uses the same PES structure regardless of dvh1 vs dvhe tag. The tag distinction applies to ISOBMFF signaling only.'
                    },
                    references: [
                        { title: 'ETSI TS 103 572 (Dolby Vision)' }
                    ]
                }
            },

            // ── dvav.09.06 ──

            {
                codec: 'dvav.09.06',
                name: '1080p DV Profile 9 24fps (AVC base)',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '1080p HDR10 24fps 10-bit',
                    width: 1920,
                    height: 1080,
                    framerate: 24,
                    bitrate: 8_000_000,
                    bitDepth: 10,
                    chromaSubsampling: '4:2:0',
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10'
                }],
                education: {
                    breakdown: [
                        { token: 'dvav', meaning: 'Dolby Vision AVC/H.264-based. The dvav tag indicates DV with AVC as the base codec.' },
                        { token: '09', meaning: 'Profile 9. Single-layer AVC with DV RPU. 10-bit 4:2:0. Limited to 1080p.' },
                        { token: '06', meaning: 'DV Level 06. Max 3840x2160@24fps per ETSI TS 103 572.' }
                    ],
                    overview: 'DV Profile 9 — AVC-based Dolby Vision for legacy devices. Limited to 1080p resolution. Used where HEVC is unavailable. Non-DV decoders play the AVC SDR base layer.',
                    streaming: {
                        hls: [{
                            signal: '1080p DV Profile 9 AVC-based',
                            m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=8000000,CODECS="dvav.09.06,mp4a.40.2",RESOLUTION=1920x1080,VIDEO-RANGE=PQ
dv_p9_avc.m3u8`,
                            notes: 'DV Profile 9 is AVC-based, limited to 1080p. VIDEO-RANGE=PQ even though the AVC base layer is SDR — DV processing uses IPT-PQ internally. Rarely used in production HLS; Profile 8.1 HEVC is preferred.'
                        }],
                        dash: [{
                            signal: '1080p DV Profile 9 AVC DASH',
                            mpd: `<AdaptationSet mimeType="video/mp4" codecs="dvav.09.06">
  <SupplementalProperty schemeIdUri="urn:dolby:dash:codec_attributes:2014" value="dvav.09.06"/>
  <Representation bandwidth="8000000" width="1920" height="1080" frameRate="24"/>
</AdaptationSet>`,
                            notes: 'AVC-based DV in DASH. Non-DV clients see the AVC SDR base layer. Profile 9 is a legacy format for devices without HEVC decode capability.'
                        }]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF with AVC base track + DV RPU stored in dvcC box. The AVC track uses standard avcC configuration box.',
                        mkv: 'MKV support for AVC-based DV follows the same block addition mechanism as HEVC DV. Requires MKVToolNix 67.0+.',
                        fmp4: 'Fragmented MP4 segments carry AVC NAL units + DV RPU. Non-DV clients decode the AVC SDR base layer.',
                        mpegts: 'Profile 9 in MPEG-TS uses AVC PES with DV RPU in supplemental enhancement information (SEI) NAL units.'
                    },
                    references: [
                        { title: 'ETSI TS 103 572 (Dolby Vision)' }
                    ]
                }
            },

            // ── hvc1.2.4.L153.B0, dvh1.08.06 ──

            {
                codec: 'hvc1.2.4.L153.B0, dvh1.08.06',
                name: '4K DV P8.1 + HEVC 24fps (hvc1 supplemental)',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K HDR10 24fps 10-bit',
                    width: 3840,
                    height: 2160,
                    framerate: 24,
                    bitrate: 25_000_000,
                    bitDepth: 10,
                    chromaSubsampling: '4:2:0',
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10'
                }],
                education: {
                    breakdown: [
                        { token: 'hvc1', meaning: 'HEVC base layer with out-of-band parameter sets.' },
                        { token: '2', meaning: 'Main 10 Profile (profile_idc=2). 10-bit 4:2:0.' },
                        { token: '4', meaning: 'Profile compatibility flags. Bit 2 set = Main 10.' },
                        { token: 'L153', meaning: 'Level 5.1, Main Tier. 153 = 51 × 3.' },
                        { token: 'B0', meaning: 'No additional constraint flags.' },
                        { token: 'dvh1', meaning: 'Dolby Vision HEVC enhancement layer (out-of-band).' },
                        { token: '08', meaning: 'DV Profile 8. Sub-profile 8.1 = HDR10 base layer.' },
                        { token: '06', meaning: 'DV Level 06. Max 3840x2160@24fps.' }
                    ],
                    overview: 'Supplemental codec string for DV Profile 8.1 with hvc1 HEVC base. The player checks both HEVC Main 10 and DV P8.1 support. Apple HLS uses this format to signal DV + HEVC fallback in a single EXT-X-STREAM-INF.',
                    streaming: {
                        hls: [{
                            signal: '4K DV P8.1 + HEVC supplemental (hvc1)',
                            m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=25000000,CODECS="hvc1.2.4.L153.B0,dvh1.08.06,mp4a.40.2",RESOLUTION=3840x2160,VIDEO-RANGE=PQ
dv_p81_hvc1_supplemental.m3u8`,
                            notes: 'Comma-separated CODECS declares both HEVC base and DV enhancement. Apple HLS Authoring Spec requires this format for DV content — the player selects the appropriate decoder chain based on device capability.'
                        }],
                        dash: [{
                            signal: '4K DV P8.1 + HEVC supplemental DASH',
                            mpd: `<AdaptationSet mimeType="video/mp4" codecs="hvc1.2.4.L153.B0,dvh1.08.06">
  <SupplementalProperty schemeIdUri="urn:dolby:dash:codec_attributes:2014" value="dvh1.08.06"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="16"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <Representation bandwidth="25000000" width="3840" height="2160" frameRate="24"/>
</AdaptationSet>`,
                            notes: 'Both codec strings in the codecs attribute. DASH clients use this to determine if they can decode the DV enhancement or should fall back to the HEVC HDR10 base layer.'
                        }]
                    },
                    containerNotes: {
                        mp4: 'Single MP4 file contains HEVC Main 10 video track with DV RPU. The dvcC and hvcC boxes coexist in the sample entry.',
                        mkv: 'MKV supplemental DV uses HEVC video track + DV RPU as block additions (CodecID V_MPEGH/ISO/HEVC). MKVToolNix 67.0+ required.',
                        fmp4: 'fMP4 segments carry the unified HEVC + DV stream. The client negotiates which layer to decode based on the supplemental codec string.',
                        mpegts: 'MPEG-TS carries a single HEVC PES with DV RPU embedded. The supplemental codec string is a signaling concept for manifests, not a container distinction.'
                    },
                    references: [
                        { title: 'ETSI TS 103 572 (Dolby Vision)' },
                        { title: 'Apple HLS Authoring Spec', url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices' }
                    ]
                }
            },

            // ── hev1.2.4.L153.B0, dvh1.08.06 ──

            {
                codec: 'hev1.2.4.L153.B0, dvh1.08.06',
                name: '4K DV P8.1 + HEVC 24fps (hev1 supplemental)',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K HDR10 24fps 10-bit',
                    width: 3840,
                    height: 2160,
                    framerate: 24,
                    bitrate: 25_000_000,
                    bitDepth: 10,
                    chromaSubsampling: '4:2:0',
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10'
                }],
                education: {
                    breakdown: [
                        { token: 'hev1', meaning: 'HEVC base layer with in-band parameter sets. VPS/SPS/PPS repeated per access unit.' },
                        { token: '2', meaning: 'Main 10 Profile (profile_idc=2). 10-bit 4:2:0.' },
                        { token: '4', meaning: 'Profile compatibility flags. Bit 2 set = Main 10.' },
                        { token: 'L153', meaning: 'Level 5.1, Main Tier. 153 = 51 × 3.' },
                        { token: 'B0', meaning: 'No additional constraint flags.' },
                        { token: 'dvh1', meaning: 'Dolby Vision HEVC enhancement layer (out-of-band).' },
                        { token: '08', meaning: 'DV Profile 8. Sub-profile 8.1 = HDR10 base layer.' },
                        { token: '06', meaning: 'DV Level 06. Max 3840x2160@24fps.' }
                    ],
                    overview: 'Supplemental codec string for DV P8.1 with hev1 HEVC base. Identical to the hvc1 variant but with in-band parameter sets. Tests whether the browser handles hev1 + DV differently from hvc1 + DV.',
                    streaming: {
                        hls: [{
                            signal: '4K DV P8.1 + HEVC supplemental (hev1)',
                            m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=25000000,CODECS="hev1.2.4.L153.B0,dvh1.08.06,mp4a.40.2",RESOLUTION=3840x2160,VIDEO-RANGE=PQ
dv_p81_hev1_supplemental.m3u8`,
                            notes: 'Uses hev1 (in-band parameter sets) instead of hvc1 for the HEVC base layer. Apple HLS prefers hvc1 — hev1 in supplemental strings tests whether the browser API distinguishes parameter set signaling in DV contexts.'
                        }],
                        dash: [{
                            signal: '4K DV P8.1 + HEVC supplemental DASH (hev1)',
                            mpd: `<AdaptationSet mimeType="video/mp4" codecs="hev1.2.4.L153.B0,dvh1.08.06">
  <SupplementalProperty schemeIdUri="urn:dolby:dash:codec_attributes:2014" value="dvh1.08.06"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="16"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <Representation bandwidth="25000000" width="3840" height="2160" frameRate="24"/>
</AdaptationSet>`,
                            notes: 'hev1 vs hvc1 in DASH codecs attribute. Most DASH clients treat them identically for decoder selection. The distinction matters for segment parsing — hev1 repeats parameter sets per access unit.'
                        }]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF sample entry uses hev1 box (in-band VPS/SPS/PPS) instead of hvc1. The DV dvcC box is present regardless of hev1 vs hvc1.',
                        mkv: 'MKV CodecID is V_MPEGH/ISO/HEVC for both hev1 and hvc1. The parameter set delivery distinction is an ISOBMFF concept, not a Matroska one.',
                        fmp4: 'In-band parameter sets (hev1) mean each fMP4 segment includes VPS/SPS/PPS, making segments independently decodable at the cost of slightly higher overhead.',
                        mpegts: 'MPEG-TS always carries parameter sets in-band via PES — the hev1 vs hvc1 distinction is irrelevant for transport stream delivery.'
                    },
                    references: [
                        { title: 'ETSI TS 103 572 (Dolby Vision)' },
                        { title: 'ITU-T H.265 | ISO/IEC 23008-2', url: 'https://www.itu.int/rec/T-REC-H.265' }
                    ]
                }
            },

            // ── dav1.10.01 ──

            {
                codec: 'dav1.10.01',
                name: '720p DV Profile 10 24fps (AV1 base, dav1)',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '720p HDR10 24fps 10-bit',
                    width: 1280,
                    height: 720,
                    framerate: 24,
                    bitrate: 5_000_000,
                    bitDepth: 10,
                    chromaSubsampling: '4:2:0',
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10'
                }],
                education: {
                    breakdown: [
                        { token: 'dav1', meaning: 'Dolby Vision AV1-based. Alternative FourCC tag to dva1 for DV with AV1 base codec.' },
                        { token: '10', meaning: 'Profile 10. Single-layer AV1 with DV RPU metadata in OBU. 10-bit 4:2:0.' },
                        { token: '01', meaning: 'DV Level 01. Max 1280x720@24fps per ETSI TS 103 572.' }
                    ],
                    overview: 'DV Profile 10 Level 01 (720p@24fps) with the dav1 tag — alternative FourCC to dva1. Both tags signal the same AV1-based DV Profile 10 content. Tests whether the browser recognizes dav1 in addition to dva1.',
                    streaming: {
                        hls: [{
                            signal: '4K DV Profile 10 AV1 — dav1 tag',
                            m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=5000000,CODECS="dav1.10.01,mp4a.40.2",RESOLUTION=1280x720,VIDEO-RANGE=PQ
dv_p10_av1_dav1.m3u8`,
                            notes: 'Level 01 (720p@24fps) with dav1 tag. Apple has not yet defined HLS requirements for DV+AV1 — this tests whether the browser API recognizes dav1 alongside dva1.'
                        }],
                        dash: [{
                            signal: '4K DV Profile 10 AV1 DASH — dav1 tag',
                            mpd: `<AdaptationSet mimeType="video/mp4" codecs="dav1.10.01">
  <SupplementalProperty schemeIdUri="urn:dolby:dash:codec_attributes:2014" value="dav1.10.01"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="16"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <Representation bandwidth="5000000" width="1280" height="720" frameRate="24"/>
</AdaptationSet>`,
                            notes: 'Level 01 (720p@24fps) with dav1 in DASH. Tests whether DASH clients differentiate between the two AV1 DV FourCC variants.'
                        }]
                    },
                    containerNotes: {
                        mp4: 'Same ISOBMFF structure as dva1.10.01 — AV1 video track with av1C box + DV RPU in dvcC box. The FourCC in the sample entry determines which tag is used.',
                        mkv: 'MKV uses CodecID V_AV1 with DV RPU as block additions. The dav1 vs dva1 distinction exists only in ISOBMFF signaling.',
                        fmp4: 'Fragmented MP4 segments carry AV1 OBUs + DV RPU metadata. Content is identical to dva1 — only the sample entry FourCC differs.'
                    },
                    references: [
                        { title: 'ETSI TS 103 572 (Dolby Vision)' }
                    ]
                }
            },

            // ── dvh1.05.09 ──

            {
                codec: 'dvh1.05.09',
                name: '4K DV Profile 5 60fps',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K HDR10 60fps 10-bit',
                    width: 3840,
                    height: 2160,
                    framerate: 60,
                    bitrate: 40_000_000,
                    bitDepth: 10,
                    chromaSubsampling: '4:2:0',
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10'
                },
                    {
                        name: '4K HDR10 59.94fps 10-bit',
                        width: 3840,
                        height: 2160,
                        framerate: 59.94,
                        bitrate: 40_000_000,
                        bitDepth: 10,
                        chromaSubsampling: '4:2:0',
                        transferFunction: 'pq',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hdr10',
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'dvh1', meaning: 'Dolby Vision HEVC with parameter sets in the sample entry (out-of-band).' },
                        { token: '05', meaning: 'Profile 5. Single-layer HEVC, 10-bit 4:2:0. IPT-PQ color space internally.' },
                        { token: '09', meaning: 'Level 09. Max 3840x2160@60fps per ETSI TS 103 572.' }
                    ],
                    overview: 'DV Profile 5 at Level 9 — 4K@60fps. Higher frame rate variant of dvh1.05.06. Used for sports and live content where 60fps is required alongside DV dynamic metadata.',
                    streaming: {
                        hls: [{
                            signal: '4K DV Profile 5 60fps',
                            m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=40000000,CODECS="dvh1.05.09,mp4a.40.2",RESOLUTION=3840x2160,FRAME-RATE=60,VIDEO-RANGE=PQ
dv_p5_60fps.m3u8`,
                            notes: 'Level 9 enables 4K@60fps. FRAME-RATE=60 is required in the EXT-X-STREAM-INF. Profile 5 is non-backward-compatible — no fallback for non-DV clients.'
                        }],
                        dash: [{
                            signal: '4K DV Profile 5 60fps DASH',
                            mpd: `<AdaptationSet mimeType="video/mp4" codecs="dvh1.05.09">
  <SupplementalProperty schemeIdUri="urn:dolby:dash:codec_attributes:2014" value="dvh1.05.09"/>
  <Representation bandwidth="40000000" width="3840" height="2160" frameRate="60"/>
</AdaptationSet>`,
                            notes: '60fps doubles the segment data rate vs 24fps. Profile 5 at Level 9 targets live sports and premium event streaming where high frame rate DV is required.'
                        }]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF with DOVIDecoderConfigurationRecord in dvcC box. 60fps increases I/O requirements — 40 Mbps at 4K needs fast storage.',
                        mkv: 'MKV DV at 60fps uses the same block addition structure. TimestampScale must accommodate 60fps intervals.',
                        fmp4: '60fps fMP4 segments at 40 Mbps produce ~5 MB per second of content. Segment duration choices affect buffer requirements.',
                        mpegts: 'Profile 5 60fps in MPEG-TS is uncommon. Broadcast deployments prefer Profile 8.1 for backward compatibility.'
                    },
                    references: [
                        { title: 'ETSI TS 103 572 (Dolby Vision)' }
                    ]
                }
            },

            // ── dvh1.07.06 ──

            {
                codec: 'dvh1.07.06',
                name: '4K DV Profile 7 24fps (MEL, dvh1)',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K HDR10 24fps 10-bit',
                    width: 3840,
                    height: 2160,
                    framerate: 24,
                    bitrate: 30_000_000,
                    bitDepth: 10,
                    chromaSubsampling: '4:2:0',
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10'
                }],
                education: {
                    breakdown: [
                        { token: 'dvh1', meaning: 'Dolby Vision HEVC with parameter sets in the sample entry (out-of-band).' },
                        { token: '07', meaning: 'Profile 7. Single-layer HEVC with MEL (Minimum Enhancement Layer) + RPU. 10-bit 4:2:0.' },
                        { token: '06', meaning: 'Level 06. Max 3840x2160@24fps per ETSI TS 103 572.' }
                    ],
                    overview: 'DV Profile 7 with dvh1 tag — same content as dvhe.07.06 but with out-of-band parameter sets. Tests whether the browser distinguishes dvh1 from dvhe for Profile 7.',
                    streaming: {
                        hls: [{
                            signal: '4K DV Profile 7 MEL — dvh1 tag',
                            m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=30000000,CODECS="dvh1.07.06,mp4a.40.2",RESOLUTION=3840x2160,VIDEO-RANGE=PQ
dv_p7_mel_dvh1.m3u8`,
                            notes: 'Profile 7 MEL (Minimum Enhancement Layer) with dvh1 tag. Apple HLS mandates dvh1. MEL adds minimal DV metadata on top of a Profile 5-like base — smaller enhancement overhead than full RPU.'
                        }],
                        dash: [{
                            signal: '4K DV Profile 7 MEL DASH',
                            mpd: `<AdaptationSet mimeType="video/mp4" codecs="dvh1.07.06">
  <SupplementalProperty schemeIdUri="urn:dolby:dash:codec_attributes:2014" value="dvh1.07.06"/>
  <Representation bandwidth="30000000" width="3840" height="2160" frameRate="24"/>
</AdaptationSet>`,
                            notes: 'Profile 7 MEL in DASH. The MEL provides a lightweight DV enhancement path — less metadata overhead than full Profile 5 RPU while still enabling dynamic tone mapping.'
                        }]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF with dvcC box signaling Profile 7. The MEL is stored as a minimal enhancement NAL unit alongside the base layer.',
                        mkv: 'MKV stores MEL data as block additions. Profile 7 MEL is less common in MKV — most MKV DV content uses Profile 5 or 8.1.',
                        fmp4: 'fMP4 segments include the MEL enhancement alongside the IPT-PQ base layer. Smaller enhancement overhead than Profile 5 full RPU.',
                        mpegts: 'Profile 7 in MPEG-TS is rare. Broadcast deployments prefer Profile 8.x for backward-compatible base layers.'
                    },
                    references: [
                        { title: 'ETSI TS 103 572 (Dolby Vision)' }
                    ]
                }
            },

            // ── hvc1.2.4.L153.B0, dvhe.08.09 ──

            {
                codec: 'hvc1.2.4.L153.B0, dvhe.08.09',
                name: '4K DV P8.4 + HEVC 60fps (HLG supplemental)',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K HLG 60fps 10-bit',
                    width: 3840,
                    height: 2160,
                    framerate: 60,
                    bitrate: 40_000_000,
                    bitDepth: 10,
                    chromaSubsampling: '4:2:0',
                    transferFunction: 'hlg',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hlg'
                }],
                education: {
                    breakdown: [
                        { token: 'hvc1', meaning: 'HEVC base layer with out-of-band parameter sets.' },
                        { token: '2', meaning: 'Main 10 Profile (profile_idc=2). 10-bit 4:2:0.' },
                        { token: '4', meaning: 'Profile compatibility flags. Bit 2 set = Main 10.' },
                        { token: 'L153', meaning: 'Level 5.1, Main Tier. 153 = 51 × 3.' },
                        { token: 'B0', meaning: 'No additional constraint flags.' },
                        { token: 'dvhe', meaning: 'Dolby Vision HEVC enhancement (in-band parameter sets).' },
                        { token: '08', meaning: 'DV Profile 8. Sub-profile 8.4 = HLG base layer.' },
                        { token: '09', meaning: 'DV Level 09. Max 3840x2160@60fps.' }
                    ],
                    overview: 'Supplemental codec string for DV Profile 8.4 HLG at Level 09 (4K@60fps) with HEVC base. Declares both HEVC Main 10 and DV P8.4 HLG in one codecs= parameter. Non-DV decoders play the HLG base layer.',
                    streaming: {
                        hls: [{
                            signal: '4K DV P8.4 HLG + HEVC supplemental',
                            m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=40000000,CODECS="hvc1.2.4.L153.B0,dvhe.08.09,mp4a.40.2",RESOLUTION=3840x2160,FRAME-RATE=60,VIDEO-RANGE=PQ
dv_p84_hlg_supplemental.m3u8`,
                            notes: 'Level 09 (4K@60fps) supplemental with HLG base. VIDEO-RANGE=PQ despite HLG base — DV internal processing is IPT-PQ. Non-DV clients fall back to HEVC HLG.'
                        }],
                        dash: [{
                            signal: '4K DV P8.4 HLG + HEVC supplemental DASH',
                            mpd: `<AdaptationSet mimeType="video/mp4" codecs="hvc1.2.4.L153.B0,dvhe.08.09">
  <SupplementalProperty schemeIdUri="urn:dolby:dash:codec_attributes:2014" value="dvhe.08.09"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="18"/>
  <Representation bandwidth="40000000" width="3840" height="2160" frameRate="60"/>
</AdaptationSet>`,
                            notes: 'Level 09 (4K@60fps). CICP TC=18 (HLG) for the base layer. The Dolby URN signals DV P8.4 enhancement. Non-DV DASH clients decode HEVC HLG.'
                        }]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF with hvcC + dvcC boxes. The HEVC base carries HLG transfer characteristics; DV RPU provides dynamic tone mapping on top.',
                        mkv: 'MKV supplemental DV HLG uses HEVC video track + DV RPU block additions. MKVToolNix 67.0+ required.',
                        fmp4: 'fMP4 segments carry unified HEVC HLG + DV stream. Client negotiates DV or HLG fallback based on supplemental codec string.',
                        mpegts: 'Single HEVC PES with embedded DV RPU. HLG base layer is broadcast-friendly (no metadata dependency for basic display).'
                    },
                    references: [
                        { title: 'ETSI TS 103 572 (Dolby Vision)' },
                        { title: 'ITU-T H.265 | ISO/IEC 23008-2', url: 'https://www.itu.int/rec/T-REC-H.265' }
                    ]
                }
            },

            // ── av01.0.08M.10, dav1.10.01 ──

            {
                codec: 'av01.0.08M.10, dav1.10.01',
                name: '720p DV P10 + AV1 24fps (supplemental)',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '720p HDR10 24fps 10-bit',
                    width: 1280,
                    height: 720,
                    framerate: 24,
                    bitrate: 5_000_000,
                    bitDepth: 10,
                    chromaSubsampling: '4:2:0',
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10'
                }],
                education: {
                    breakdown: [
                        { token: 'av01', meaning: 'AV1 base layer codec identifier.' },
                        { token: '0', meaning: 'AV1 Main Profile (seq_profile=0). 8-bit and 10-bit, 4:2:0.' },
                        { token: '08M', meaning: 'AV1 Level 4.0, Main tier.' },
                        { token: '10', meaning: '10-bit (BitDepth=10).' },
                        { token: 'dav1', meaning: 'Dolby Vision AV1 enhancement layer.' },
                        { token: '10', meaning: 'DV Profile 10. Single-layer AV1 with DV RPU in OBU.' },
                        { token: '01', meaning: 'DV Level 01. Max 1280x720@24fps.' }
                    ],
                    overview: 'Supplemental codec string for DV Profile 10 Level 01 (720p@24fps) with AV1 base. Declares both AV1 Main and DV P10 in one codecs= parameter. Tests browser support for the AV1 + DV combination at baseline capability.',
                    streaming: {
                        hls: [{
                            signal: '4K DV P10 + AV1 supplemental',
                            m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=5000000,CODECS="av01.0.08M.10,dav1.10.01,mp4a.40.2",RESOLUTION=1280x720,VIDEO-RANGE=PQ
dv_p10_av1_supplemental.m3u8`,
                            notes: 'Level 01 (720p@24fps) supplemental string declares both AV1 base and DV P10 enhancement. Tests forward-looking API recognition of AV1+DV at baseline capability.'
                        }],
                        dash: [{
                            signal: '4K DV P10 + AV1 supplemental DASH',
                            mpd: `<AdaptationSet mimeType="video/mp4" codecs="av01.0.08M.10,dav1.10.01">
  <SupplementalProperty schemeIdUri="urn:dolby:dash:codec_attributes:2014" value="dav1.10.01"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="16"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <Representation bandwidth="5000000" width="1280" height="720" frameRate="24"/>
</AdaptationSet>`,
                            notes: 'Level 01 (720p@24fps) AV1 + DV supplemental in DASH. Non-DV clients decode the AV1 HDR10 base layer.'
                        }]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF with av1C + dvcC boxes coexisting in the sample entry. AV1 OBUs carry the base layer; DV RPU is stored in a metadata OBU.',
                        mkv: 'MKV uses CodecID V_AV1 with DV RPU as block additions. The supplemental codec string is a manifest-level concept.',
                        fmp4: 'fMP4 segments carry AV1 OBUs + DV RPU metadata. Client uses the supplemental string to determine AV1+DV or AV1-only decode path.'
                    },
                    references: [
                        { title: 'ETSI TS 103 572 (Dolby Vision)' },
                        { title: 'AV1 Codec ISO Media File Format Binding', url: 'https://aomediacodec.github.io/av1-isobmff/' }
                    ]
                }
            },

            // ── dvc1.05.06 ──

            {
                codec: 'dvc1.05.06',
                name: '4K DV Profile 5 24fps (dvc1 deprecated)',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K HDR10 24fps 10-bit',
                    width: 3840,
                    height: 2160,
                    framerate: 24,
                    bitrate: 25_000_000,
                    bitDepth: 10,
                    chromaSubsampling: '4:2:0',
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10'
                }],
                education: {
                    breakdown: [
                        { token: 'dvc1', meaning: 'Deprecated Dolby Vision HEVC tag. Replaced by dvh1/dvhe in current spec revisions.' },
                        { token: '05', meaning: 'Profile 5. Single-layer HEVC, 10-bit 4:2:0, IPT-PQ.' },
                        { token: '06', meaning: 'Level 06. Max 3840x2160@24fps.' }
                    ],
                    overview: 'Deprecated DV Profile 5 tag — dvc1 was used in early DV implementations before the FourCC scheme was standardized. Modern content uses dvh1 or dvhe. Tests whether legacy tag recognition persists in browser APIs.',
                    streaming: {
                        hls: [{
                            signal: '4K DV Profile 5 — deprecated dvc1 tag',
                            m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=25000000,CODECS="dvc1.05.06,mp4a.40.2",RESOLUTION=3840x2160,VIDEO-RANGE=PQ
dv_p5_dvc1_legacy.m3u8`,
                            notes: 'Deprecated tag — no modern HLS implementation uses dvc1. Apple HLS requires dvh1. Tests whether browser APIs still recognize the legacy FourCC.'
                        }],
                        dash: [{
                            signal: '4K DV Profile 5 DASH — deprecated dvc1 tag',
                            mpd: `<AdaptationSet mimeType="video/mp4" codecs="dvc1.05.06">
  <SupplementalProperty schemeIdUri="urn:dolby:dash:codec_attributes:2014" value="dvc1.05.06"/>
  <Representation bandwidth="25000000" width="3840" height="2160" frameRate="24"/>
</AdaptationSet>`,
                            notes: 'dvc1 in DASH — tests legacy tag recognition. No production DASH service uses dvc1; modern content uses dvh1 or dvhe.'
                        }]
                    },
                    containerNotes: {
                        mp4: 'Early DV implementations used dvc1 as the sample entry FourCC. Modern ISOBMFF uses dvh1 (out-of-band) or dvhe (in-band).',
                        mkv: 'MKV DV does not use FourCC-based signaling — the dvc1 tag is an ISOBMFF/API concept only.',
                        fmp4: 'Legacy fMP4 content with dvc1 sample entries may exist in early DV test streams. Modern packaging tools emit dvh1 or dvhe.'
                    },
                    references: [
                        { title: 'ETSI TS 103 572 (Dolby Vision)' }
                    ]
                }
            },

            // ── dvhp.05.06 ──

            {
                codec: 'dvhp.05.06',
                name: '4K DV Profile 5 24fps (OMAF/VR)',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K HDR10 24fps 10-bit',
                    width: 3840,
                    height: 2160,
                    framerate: 24,
                    bitrate: 25_000_000,
                    bitDepth: 10,
                    chromaSubsampling: '4:2:0',
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10'
                }],
                education: {
                    breakdown: [
                        { token: 'dvhp', meaning: 'Dolby Vision HEVC for OMAF (Omnidirectional Media Application Format, ISO 23090-2). Used for VR/360 content.' },
                        { token: '05', meaning: 'Profile 5. Single-layer HEVC, 10-bit 4:2:0, IPT-PQ.' },
                        { token: '06', meaning: 'Level 06. Max 3840x2160@24fps per ETSI TS 103 572.' }
                    ],
                    overview: 'DV Profile 5 with the OMAF/VR tag — dvhp signals Dolby Vision HEVC packaged for omnidirectional media (ISO 23090-2). Used in VR headsets and 360-degree video. No browser supports OMAF natively; tests API recognition of the tag.',
                    streaming: {
                        hls: [{
                            signal: '4K DV Profile 5 OMAF/VR',
                            m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=25000000,CODECS="dvhp.05.06,mp4a.40.2",RESOLUTION=3840x2160,VIDEO-RANGE=PQ
dv_p5_omaf_vr.m3u8`,
                            notes: 'OMAF/VR DV — dvhp tag for omnidirectional media. No browser HLS implementation supports dvhp. VR headsets use proprietary players, not browser-based HLS.'
                        }],
                        dash: [{
                            signal: '4K DV Profile 5 OMAF/VR DASH',
                            mpd: `<AdaptationSet mimeType="video/mp4" codecs="dvhp.05.06">
  <SupplementalProperty schemeIdUri="urn:dolby:dash:codec_attributes:2014" value="dvhp.05.06"/>
  <Representation bandwidth="25000000" width="3840" height="2160" frameRate="24"/>
</AdaptationSet>`,
                            notes: 'OMAF DV in DASH uses the same Dolby URN. DASH-IF has OMAF extensions but browser-based DASH players do not implement them.'
                        }]
                    },
                    containerNotes: {
                        mp4: 'OMAF ISOBMFF extends standard MP4 with spatial metadata boxes (ProjectionHeader, CoverageInformation). dvhp sample entry signals DV + OMAF packaging.',
                        mkv: 'MKV has Matroska projection elements for 360 video but no standardized DV OMAF integration.',
                        fmp4: 'OMAF fMP4 segments include spatial metadata alongside DV RPU. 360-degree coverage requires higher spatial resolution for equivalent perceived quality.'
                    },
                    references: [
                        { title: 'ETSI TS 103 572 (Dolby Vision)' },
                        { title: 'ISO/IEC 23090-2 (OMAF)' }
                    ]
                }
            },
            // ── dvh1.05.03 ──

            {
                codec: 'dvh1.05.03',
                name: '1080p DV Profile 5 24fps',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '1080p HDR10 24fps 10-bit',
                    width: 1920,
                    height: 1080,
                    framerate: 24,
                    bitrate: 25_000_000,
                    bitDepth: 10,
                    chromaSubsampling: '4:2:0',
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10',
                },
                    {
                        name: '1080p HDR10 23.976fps 10-bit',
                        width: 1920,
                        height: 1080,
                        framerate: 23.976,
                        bitrate: 25_000_000,
                        bitDepth: 10,
                        chromaSubsampling: '4:2:0',
                        transferFunction: 'pq',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hdr10',
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'dvh1', meaning: 'Dolby Vision HEVC with parameter sets in the sample entry (out-of-band), like hvc1.' },
                        { token: '05', meaning: 'Profile 5. Single-layer HEVC, 10-bit 4:2:0. IPT-PQ color space internally. No backward-compatible base layer.' },
                        { token: '03', meaning: 'Level 03. Max 1920x1080@24fps per ETSI TS 103 572.' }
                    ],
                    overview: 'DV Profile 5 at Level 03 (1080p@24fps) — single-layer HEVC without backward compatibility. Tests DV support at HD resolution, where more devices qualify than at 4K levels.',
                    streaming: {
                        hls: [
                            {
                                signal: 'DV Profile 5 1080p',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=25000000,CODECS="dvh1.05.03,mp4a.40.2",RESOLUTION=1920x1080,VIDEO-RANGE=PQ
dv_p5_1080p.m3u8`,
                                notes: 'Apple requires dvh1 tag for DV HLS. VIDEO-RANGE=PQ always for Dolby Vision. Level 03 targets 1080p cinema content.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'DV Profile 5 1080p',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="dvh1.05.03">
  <SupplementalProperty schemeIdUri="urn:dolby:dash:codec_attributes:2014"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="16"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <Representation bandwidth="25000000" width="1920" height="1080" frameRate="24"/>
</AdaptationSet>`,
                                notes: 'Dolby DASH URN signals DV processing. CICP TC=16 (PQ) + CP=9 (BT.2020). Level 03 caps at 1080p@24fps.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF with DOVIDecoderConfigurationRecord in dvcC box. Profile 5 single-layer — one HEVC track with RPU embedded.',
                        mkv: 'DV MKV support via MKVToolNix 67.0+. RPU stored as block additions.',
                        fmp4: 'Fragmented MP4 for HLS/DASH segments. DOVIDecoderConfigurationRecord in init segment.'
                    },
                    references: [
                        { title: 'ETSI TS 103 572 (Dolby Vision)' }
                    ]
                }
            },
            // ── dvh1.05.07 ──

            {
                codec: 'dvh1.05.07',
                name: '4K DV Profile 5 30fps',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K HDR10 30fps 10-bit',
                    width: 3840,
                    height: 2160,
                    framerate: 30,
                    bitrate: 30_000_000,
                    bitDepth: 10,
                    chromaSubsampling: '4:2:0',
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10',
                },
                    {
                        name: '4K HDR10 29.97fps 10-bit',
                        width: 3840,
                        height: 2160,
                        framerate: 29.97,
                        bitrate: 30_000_000,
                        bitDepth: 10,
                        chromaSubsampling: '4:2:0',
                        transferFunction: 'pq',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hdr10',
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'dvh1', meaning: 'Dolby Vision HEVC with parameter sets in the sample entry (out-of-band), like hvc1.' },
                        { token: '05', meaning: 'Profile 5. Single-layer HEVC, 10-bit 4:2:0. IPT-PQ color space internally. No backward-compatible base layer.' },
                        { token: '07', meaning: 'Level 07. Max 3840x2160@30fps per ETSI TS 103 572.' }
                    ],
                    overview: 'DV Profile 5 at Level 07 (4K@30fps) — single-layer HEVC. Level 07 targets 4K streaming at 30fps, common for non-sports content on platforms that deliver above cinema framerate.',
                    streaming: {
                        hls: [
                            {
                                signal: 'DV Profile 5 4K 30fps',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=30000000,CODECS="dvh1.05.07,mp4a.40.2",RESOLUTION=3840x2160,FRAME-RATE=30,VIDEO-RANGE=PQ
dv_p5_4k_30fps.m3u8`,
                                notes: 'Level 07 enables 4K@30fps. FRAME-RATE=30 required in the EXT-X-STREAM-INF. No backward-compatible fallback — non-DV devices cannot play this variant.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'DV Profile 5 4K 30fps',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="dvh1.05.07">
  <SupplementalProperty schemeIdUri="urn:dolby:dash:codec_attributes:2014"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="16"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <Representation bandwidth="30000000" width="3840" height="2160" frameRate="30"/>
</AdaptationSet>`,
                                notes: 'Level 07 (4K@30fps). Dolby DASH URN + CICP TC=16 (PQ) + CP=9 (BT.2020).'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF with DOVIDecoderConfigurationRecord in dvcC box. Profile 5 single-layer — one HEVC track with RPU embedded.',
                        mkv: 'DV MKV support via MKVToolNix 67.0+. RPU stored as block additions.',
                        fmp4: 'Fragmented MP4 for HLS/DASH segments. DOVIDecoderConfigurationRecord in init segment.'
                    },
                    references: [
                        { title: 'ETSI TS 103 572 (Dolby Vision)' }
                    ]
                }
            },
            // ── dvh1.05.10 ──

            {
                codec: 'dvh1.05.10',
                name: '4K DV Profile 5 120fps',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K HDR10 120fps 10-bit',
                    width: 3840,
                    height: 2160,
                    framerate: 120,
                    bitrate: 80_000_000,
                    bitDepth: 10,
                    chromaSubsampling: '4:2:0',
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10',
                }],
                education: {
                    breakdown: [
                        { token: 'dvh1', meaning: 'Dolby Vision HEVC with parameter sets in the sample entry (out-of-band), like hvc1.' },
                        { token: '05', meaning: 'Profile 5. Single-layer HEVC, 10-bit 4:2:0. IPT-PQ color space internally. No backward-compatible base layer.' },
                        { token: '10', meaning: 'Level 10. Max 3840x2160@120fps per ETSI TS 103 572.' }
                    ],
                    overview: 'DV Profile 5 at Level 10 (4K@120fps) — the highest DV level. Targets gaming and cutting-edge HFR content. Very few devices support 120fps DV decode.',
                    streaming: {
                        hls: [
                            {
                                signal: 'DV Profile 5 4K 120fps',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=80000000,CODECS="dvh1.05.10,mp4a.40.2",RESOLUTION=3840x2160,FRAME-RATE=120,VIDEO-RANGE=PQ
dv_p5_4k_120fps.m3u8`,
                                notes: 'Level 10 enables 4K@120fps — highest DV capability tier. 80 Mbps bandwidth. FRAME-RATE=120 required. Targets gaming consoles and high-end displays.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'DV Profile 5 4K 120fps',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="dvh1.05.10">
  <SupplementalProperty schemeIdUri="urn:dolby:dash:codec_attributes:2014"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="16"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <Representation bandwidth="80000000" width="3840" height="2160" frameRate="120"/>
</AdaptationSet>`,
                                notes: 'Level 10 (4K@120fps). 80 Mbps requires robust network — primarily for wired or WiFi 6E connections.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF with DOVIDecoderConfigurationRecord. 120fps at 80 Mbps produces ~10 MB/s — fast storage required.',
                        mkv: 'DV MKV at 120fps. TimestampScale must accommodate 120fps intervals.',
                        fmp4: '120fps fMP4 segments at 80 Mbps. Short segment durations recommended to manage buffer sizes.'
                    },
                    references: [
                        { title: 'ETSI TS 103 572 (Dolby Vision)' }
                    ]
                }
            },
            // ── dvh1.08.03 ──

            {
                codec: 'dvh1.08.03',
                name: '1080p DV Profile 8.1 24fps (HDR10 base)',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '1080p HDR10 24fps 10-bit',
                    width: 1920,
                    height: 1080,
                    framerate: 24,
                    bitrate: 15_000_000,
                    bitDepth: 10,
                    chromaSubsampling: '4:2:0',
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10',
                },
                    {
                        name: '1080p HDR10 23.976fps 10-bit',
                        width: 1920,
                        height: 1080,
                        framerate: 23.976,
                        bitrate: 15_000_000,
                        bitDepth: 10,
                        chromaSubsampling: '4:2:0',
                        transferFunction: 'pq',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hdr10',
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'dvh1', meaning: 'Dolby Vision HEVC with parameter sets in the sample entry (out-of-band).' },
                        { token: '08', meaning: 'Profile 8. Single-layer HEVC with backward-compatible base layer + RPU. Sub-profile 8.1 uses HDR10 base.' },
                        { token: '03', meaning: 'Level 03. Max 1920x1080@24fps per ETSI TS 103 572.' }
                    ],
                    overview: 'DV Profile 8.1 at Level 03 (1080p@24fps) — backward-compatible with HDR10. Non-DV decoders play the HDR10 base layer. Tests DV Profile 8 support at HD resolution.',
                    streaming: {
                        hls: [
                            {
                                signal: 'DV Profile 8.1 1080p',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=15000000,CODECS="dvh1.08.03,mp4a.40.2",RESOLUTION=1920x1080,VIDEO-RANGE=PQ
dv_p81_1080p.m3u8`,
                                notes: 'Apple requires dvh1 for DV HLS. VIDEO-RANGE=PQ for DV. Level 03 targets 1080p cinema content. Always provide an HDR10 fallback variant.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'DV Profile 8.1 1080p',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="dvh1.08.03">
  <SupplementalProperty schemeIdUri="urn:dolby:dash:codec_attributes:2014"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="16"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <Representation bandwidth="15000000" width="1920" height="1080" frameRate="24"/>
</AdaptationSet>`,
                                notes: 'Level 03 (1080p@24fps). Dolby DASH URN + CICP TC=16 (PQ). Profile 8.1 HDR10 base provides backward compatibility.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF with DOVIDecoderConfigurationRecord in dvcC box. Profile 8 stores RPU alongside the HEVC base layer.',
                        mkv: 'DV MKV via MKVToolNix 67.0+. RPU as block additions. Shield TV, webOS 25+, and Kodi support Profile 8 DV MKV.',
                        fmp4: 'Fragmented MP4 for HLS/DASH segments. DOVIDecoderConfigurationRecord in init segment.'
                    },
                    references: [
                        { title: 'ETSI TS 103 572 (Dolby Vision)' }
                    ]
                }
            },
            // ── dvh1.08.07 ──

            {
                codec: 'dvh1.08.07',
                name: '4K DV Profile 8.1 30fps (HDR10 base)',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K HDR10 30fps 10-bit',
                    width: 3840,
                    height: 2160,
                    framerate: 30,
                    bitrate: 30_000_000,
                    bitDepth: 10,
                    chromaSubsampling: '4:2:0',
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10',
                },
                    {
                        name: '4K HDR10 29.97fps 10-bit',
                        width: 3840,
                        height: 2160,
                        framerate: 29.97,
                        bitrate: 30_000_000,
                        bitDepth: 10,
                        chromaSubsampling: '4:2:0',
                        transferFunction: 'pq',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hdr10',
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'dvh1', meaning: 'Dolby Vision HEVC with parameter sets in the sample entry (out-of-band).' },
                        { token: '08', meaning: 'Profile 8. Single-layer HEVC with backward-compatible base layer + RPU. Sub-profile 8.1 uses HDR10 base.' },
                        { token: '07', meaning: 'Level 07. Max 3840x2160@30fps per ETSI TS 103 572.' }
                    ],
                    overview: 'DV Profile 8.1 at Level 07 (4K@30fps) — backward-compatible with HDR10. Level 07 targets 4K streaming at 30fps. Non-DV decoders fall back to the HDR10 base layer.',
                    streaming: {
                        hls: [
                            {
                                signal: 'DV Profile 8.1 4K 30fps',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=30000000,CODECS="dvh1.08.07,mp4a.40.2",RESOLUTION=3840x2160,FRAME-RATE=30,VIDEO-RANGE=PQ
dv_p81_4k_30fps.m3u8`,
                                notes: 'Level 07 enables 4K@30fps. Apple requires dvh1 for DV HLS. Provide an HDR10 fallback variant for non-DV devices.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'DV Profile 8.1 4K 30fps',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="dvh1.08.07">
  <SupplementalProperty schemeIdUri="urn:dolby:dash:codec_attributes:2014"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="16"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <Representation bandwidth="30000000" width="3840" height="2160" frameRate="30"/>
</AdaptationSet>`,
                                notes: 'Level 07 (4K@30fps). Profile 8.1 HDR10-backward-compatible — the standard DV delivery format for streaming.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF with DOVIDecoderConfigurationRecord in dvcC box. Profile 8 HDR10 base layer with static metadata (MDCV/CLLI) for non-DV fallback.',
                        mkv: 'DV MKV via MKVToolNix 67.0+. RPU as block additions.',
                        fmp4: 'Fragmented MP4 for HLS/DASH segments. DOVIDecoderConfigurationRecord in init segment.'
                    },
                    references: [
                        { title: 'ETSI TS 103 572 (Dolby Vision)' }
                    ]
                }
            },
            // ── dvh1.08.10 ──

            {
                codec: 'dvh1.08.10',
                name: '4K DV Profile 8.1 120fps (HDR10 base)',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K HDR10 120fps 10-bit',
                    width: 3840,
                    height: 2160,
                    framerate: 120,
                    bitrate: 80_000_000,
                    bitDepth: 10,
                    chromaSubsampling: '4:2:0',
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10',
                }],
                education: {
                    breakdown: [
                        { token: 'dvh1', meaning: 'Dolby Vision HEVC with parameter sets in the sample entry (out-of-band).' },
                        { token: '08', meaning: 'Profile 8. Single-layer HEVC with backward-compatible base layer + RPU. Sub-profile 8.1 uses HDR10 base.' },
                        { token: '10', meaning: 'Level 10. Max 3840x2160@120fps per ETSI TS 103 572.' }
                    ],
                    overview: 'DV Profile 8.1 at Level 10 (4K@120fps) — the highest DV level with HDR10 backward compatibility. Targets gaming and HFR content. Non-DV decoders fall back to HDR10.',
                    streaming: {
                        hls: [
                            {
                                signal: 'DV Profile 8.1 4K 120fps',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=80000000,CODECS="dvh1.08.10,mp4a.40.2",RESOLUTION=3840x2160,FRAME-RATE=120,VIDEO-RANGE=PQ
dv_p81_4k_120fps.m3u8`,
                                notes: 'Level 10 enables 4K@120fps. 80 Mbps bandwidth. Profile 8.1 provides HDR10 fallback for non-DV devices — unlike Profile 5, backward compatibility is preserved even at 120fps.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'DV Profile 8.1 4K 120fps',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="dvh1.08.10">
  <SupplementalProperty schemeIdUri="urn:dolby:dash:codec_attributes:2014"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="16"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <Representation bandwidth="80000000" width="3840" height="2160" frameRate="120"/>
</AdaptationSet>`,
                                notes: 'Level 10 (4K@120fps). 80 Mbps requires robust network. Profile 8.1 backward compatibility means non-DV DASH clients still get HDR10.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF with DOVIDecoderConfigurationRecord. 120fps at 80 Mbps — fast storage required.',
                        mkv: 'DV MKV at 120fps. TimestampScale must accommodate 120fps intervals.',
                        fmp4: '120fps fMP4 segments at 80 Mbps. Short segment durations recommended to manage buffer sizes.'
                    },
                    references: [
                        { title: 'ETSI TS 103 572 (Dolby Vision)' }
                    ]
                }
            },
            // ── dva1.10.06 ──

            {
                codec: 'dva1.10.06',
                name: '4K DV Profile 10 24fps (AV1 base)',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K HDR10 24fps 10-bit',
                    width: 3840,
                    height: 2160,
                    framerate: 24,
                    bitrate: 15_000_000,
                    bitDepth: 10,
                    chromaSubsampling: '4:2:0',
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10',
                },
                    {
                        name: '4K HDR10 23.976fps 10-bit',
                        width: 3840,
                        height: 2160,
                        framerate: 23.976,
                        bitrate: 15_000_000,
                        bitDepth: 10,
                        chromaSubsampling: '4:2:0',
                        transferFunction: 'pq',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hdr10',
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'dva1', meaning: 'Dolby Vision AV1-based. The dva1 tag indicates DV with AV1 as the base codec.' },
                        { token: '10', meaning: 'Profile 10. Single-layer AV1 with DV RPU metadata in OBU. 10-bit 4:2:0.' },
                        { token: '06', meaning: 'Level 06. Max 3840x2160@24fps per ETSI TS 103 572.' }
                    ],
                    overview: 'DV Profile 10 at Level 06 (4K@24fps) with AV1 base — the primary 4K cinema variant for next-gen DV delivery. AV1 offers ~30% better compression than HEVC. Profile 10 support is emerging.',
                    streaming: {
                        hls: [
                            {
                                signal: 'DV Profile 10 AV1 4K',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=15000000,CODECS="dva1.10.06,mp4a.40.2",RESOLUTION=3840x2160,VIDEO-RANGE=PQ
dv_p10_av1_4k.m3u8`,
                                notes: 'DV Profile 10 Level 06 (4K@24fps) in HLS. Requires both AV1 decode and DV RPU processing. fMP4 segments only.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'DV Profile 10 AV1 4K',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="dva1.10.06">
  <SupplementalProperty schemeIdUri="urn:dolby:dash:codec_attributes:2014"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="16"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <Representation bandwidth="15000000" width="3840" height="2160" frameRate="24"/>
</AdaptationSet>`,
                                notes: 'Level 06 (4K@24fps). AV1 + DV in DASH — next-generation delivery combining AV1 compression with DV dynamic metadata.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF with DOVIDecoderConfigurationRecord. DV RPU embedded in AV1 OBU (Open Bitstream Units) format.',
                        mkv: 'Matroska with AV1 CodecID V_AV1 + DV RPU block additions. Emerging format.',
                        fmp4: 'Fragmented MP4 for HLS/DASH segments. AV1+DV init segment configuration.'
                    },
                    references: [
                        { title: 'ETSI TS 103 572 (Dolby Vision)' }
                    ]
                }
            },
            // ── dva1.10.09 ──

            {
                codec: 'dva1.10.09',
                name: '4K DV Profile 10 60fps (AV1 base)',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K HDR10 60fps 10-bit',
                    width: 3840,
                    height: 2160,
                    framerate: 60,
                    bitrate: 30_000_000,
                    bitDepth: 10,
                    chromaSubsampling: '4:2:0',
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10',
                },
                    {
                        name: '4K HDR10 59.94fps 10-bit',
                        width: 3840,
                        height: 2160,
                        framerate: 59.94,
                        bitrate: 30_000_000,
                        bitDepth: 10,
                        chromaSubsampling: '4:2:0',
                        transferFunction: 'pq',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hdr10',
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'dva1', meaning: 'Dolby Vision AV1-based. The dva1 tag indicates DV with AV1 as the base codec.' },
                        { token: '10', meaning: 'Profile 10. Single-layer AV1 with DV RPU metadata in OBU. 10-bit 4:2:0.' },
                        { token: '09', meaning: 'Level 09. Max 3840x2160@60fps per ETSI TS 103 572.' }
                    ],
                    overview: 'DV Profile 10 at Level 09 (4K@60fps) with AV1 base — high frame rate variant for sports and live content. Combines AV1 compression efficiency with DV dynamic metadata at 60fps.',
                    streaming: {
                        hls: [
                            {
                                signal: 'DV Profile 10 AV1 4K 60fps',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=30000000,CODECS="dva1.10.09,mp4a.40.2",RESOLUTION=3840x2160,FRAME-RATE=60,VIDEO-RANGE=PQ
dv_p10_av1_60fps.m3u8`,
                                notes: 'Level 09 enables 4K@60fps. AV1+DV at 60fps — next-gen HFR delivery. Few devices support this combination as of 2025.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'DV Profile 10 AV1 4K 60fps',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="dva1.10.09">
  <SupplementalProperty schemeIdUri="urn:dolby:dash:codec_attributes:2014"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="16"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <Representation bandwidth="30000000" width="3840" height="2160" frameRate="60"/>
</AdaptationSet>`,
                                notes: 'Level 09 (4K@60fps). AV1 + DV in DASH for high frame rate delivery.'
                            }
                        ]
                    },
                    containerNotes: {
                        mp4: 'ISOBMFF with DOVIDecoderConfigurationRecord. DV RPU embedded in AV1 OBU format. 60fps doubles I/O requirements vs 24fps.',
                        mkv: 'Matroska with AV1 CodecID V_AV1 + DV RPU block additions. 60fps TimestampScale considerations.',
                        fmp4: '60fps fMP4 segments at 30 Mbps. AV1+DV init segment configuration.'
                    },
                    references: [
                        { title: 'ETSI TS 103 572 (Dolby Vision)' }
                    ]
                }
            }
        ]
    },

    // ── VIDEO: Legacy ────────────────────────────────────────

    video_legacy: {
        category: 'Legacy Codecs',
        type: 'video',
        description: 'MPEG-4 Part 2 (Simple/Advanced Simple), H.263, Theora.',
        codecs: []
    },

    // ── AUDIO: Brand ─────────────────────────────────────────

    audio_dolby: {
        category: 'Dolby Audio',
        type: 'audio',
        description: 'AC-3, E-AC-3, E-AC-3 JOC (Atmos), AC-4, AC-4 IMS (Atmos), TrueHD. Stereo through 7.1 + objects.',
        codecs: []
    },
    audio_dts: {
        category: 'DTS Audio',
        type: 'audio',
        description: 'DTS Core, DTS-HD High Resolution, DTS-HD Master Audio, DTS Express, DTS Lossless, DTS:X.',
        codecs: []
    },
    audio_mpeg_h: {
        category: 'MPEG-H 3D Audio',
        type: 'audio',
        description: 'MPEG-H 3D Audio LC Profile Levels 1–3. Object-based immersive audio (ISO/IEC 23008-3).',
        codecs: []
    },

    // ── AUDIO: Quality tier ──────────────────────────────────

    audio_lossless: {
        category: 'Lossless Audio',
        type: 'audio',
        description: 'FLAC, ALAC, Opus, PCM. Native and container-wrapped variants. 16/24-bit.',
        codecs: []
    },
    audio_standard: {
        category: 'Standard Audio',
        type: 'audio',
        description: 'AAC-LC, HE-AAC v1/v2, xHE-AAC, AAC-ELD, AAC-LD, MP3, Vorbis.',
        codecs: []
    }
};
