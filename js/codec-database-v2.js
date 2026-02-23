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
                name: '1080p SDR 24fps 8-bit',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '1080p SDR 24fps 8-bit',
                    width: 1920,
                    height: 1080,
                    framerate: 24,
                    bitrate: 5_000_000,
                    bitDepth: 8,
                    chromaSubsampling: '4:2:0',
                }],
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
                            meaning: 'Level 3.1, Main Tier. L = Main Tier, 93 = level_idc (3.1 × 30). Supports up to 1080p@30fps, 10 Mbps peak bitrate.'
                        },
                        {
                            token: 'B0',
                            meaning: 'No additional constraint flags beyond the profile.'
                        }
                    ],
                    overview: 'HEVC Main Profile — baseline 8-bit SDR. Roughly 50% better compression than H.264 High Profile at the same quality. The safe default for SDR content on any HEVC-capable device.',
                    platforms: {
                        apple: 'Hardware decode on A8+ (iPhone 6), A8X+ (iPad Air 2), Mac 2015+ (Skylake), all Apple Silicon. HLS requires hvc1 tag + fMP4. SDR is the default VIDEO-RANGE.',
                        lg: 'All webOS 3.0+ (2016+). Hardware decode via SoC. Both hvc1 and hev1 tags accepted.',
                        android: 'Hardware decode on Android 5.0+ via MediaCodec (SoC-dependent: Snapdragon 610+, Exynos 7420+, Helio P20+). Software fallback too slow for real-time 1080p.'
                    },
                    streaming: {
                        hls: [
                            {
                                signal: 'Standard SDR',
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=5000000,CODECS="hvc1.1.6.L93.B0,mp4a.40.2",RESOLUTION=1920x1080
hevc_main_1080p.m3u8`,
                                notes: 'No VIDEO-RANGE needed — SDR is the default. Apple requires hvc1 tag. Segments must be fMP4 (MPEG-TS not supported for HEVC in HLS). fMP4 and CMAF segments share the same video/mp4 MIME as regular MP4 — the difference is internal structure (fragmented moof+mdat vs progressive moov). Browser APIs return the same codec support for both, but mediaCapabilities distinguishes file vs media-source playback.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'Standard SDR',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="hvc1.1.6.L93.B0">
  <Representation bandwidth="5000000" width="1920" height="1080" frameRate="24"/>
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
                }],
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
                }],
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
                    }
                ],
                education: {
                    breakdown: [],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
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
                }],
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
                name: '1080p Still Picture',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                scenarios: [{
                    name: '1080p SDR 1fps 8-bit',
                    width: 1920,
                    height: 1080,
                    framerate: 1,
                    bitrate: 5_000_000,
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
                            meaning: 'Level 3.1, Main Tier. For still images, the level constrains maximum picture size rather than framerate. Level 3.1 supports up to 1920×1080 single frames.'
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
                                m3u8: `#EXT-X-STREAM-INF:BANDWIDTH=5000000,CODECS="hvc1.3.E.L93.B0",RESOLUTION=1920x1080
hevc_still.m3u8`,
                                notes: 'Still Picture profile in HLS is unusual — single-frame HEVC content is not a streaming use case. Tests whether the browser API recognizes the profile_idc=3 codec string in a streaming context.'
                            }
                        ],
                        dash: [
                            {
                                signal: 'Still Picture',
                                mpd: `<AdaptationSet mimeType="video/mp4" codecs="hvc1.3.E.L93.B0">
  <Representation bandwidth="5000000" width="1920" height="1080" frameRate="1"/>
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
            // ── hvc1.2.4.L150.B0 ──,
            // ── hvc1.2.4.L150.B0 ──

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
                name: 'AV1 Main 720p SDR',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash', 'cmaf']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '720p SDR 30fps',
                    width: 1280,
                    height: 720,
                    framerate: 30,
                    bitrate: 2_000_000,
                    bitDepth: 8,
                }],
                education: {
                    breakdown: [
                        { token: 'av01', meaning: '' },
                        { token: '0', meaning: '' },
                        { token: '04M', meaning: '' },
                        { token: '08', meaning: '' }
                    ],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
                }
            },
            // ── av01.0.05M.08 ──

            {
                codec: 'av01.0.05M.08',
                name: 'AV1 Main 1080p SDR',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash', 'cmaf']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '1080p SDR 24fps',
                    width: 1920,
                    height: 1080,
                    framerate: 24,
                    bitrate: 3_000_000,
                    bitDepth: 8,
                }],
                education: {
                    breakdown: [
                        { token: 'av01', meaning: '' },
                        { token: '0', meaning: '' },
                        { token: '05M', meaning: '' },
                        { token: '08', meaning: '' }
                    ],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
                }
            },
            // ── av01.0.08M.08 ──

            {
                codec: 'av01.0.08M.08',
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
                    bitrate: 10_000_000,
                    bitDepth: 8,
                }],
                education: {
                    breakdown: [
                        { token: 'av01', meaning: '' },
                        { token: '0', meaning: '' },
                        { token: '08M', meaning: '' },
                        { token: '08', meaning: '' }
                    ],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
                }
            },
            // ── av01.0.08M.10 ──

            {
                codec: 'av01.0.08M.10',
                name: 'AV1 Main 4K HDR',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash', 'cmaf']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K HDR10 24fps',
                    width: 3840,
                    height: 2160,
                    framerate: 24,
                    bitrate: 15_000_000,
                    bitDepth: 10,
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10',
                },
                    {
                        name: '4K HLG 24fps',
                        width: 3840,
                        height: 2160,
                        framerate: 24,
                        bitrate: 15_000_000,
                        bitDepth: 10,
                        transferFunction: 'hlg',
                        colorGamut: 'rec2020',
                        hdrFormat: 'hlg',
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'av01', meaning: '' },
                        { token: '0', meaning: '' },
                        { token: '08M', meaning: '' },
                        { token: '10', meaning: '' }
                    ],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
                }
            },
            // ── av01.0.08M.10.0.110.01.01.01.0 ──

            {
                codec: 'av01.0.08M.10.0.110.01.01.01.0',
                name: 'AV1 Main 4K Film Grain',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash', 'cmaf']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K Film Grain 24fps',
                    width: 3840,
                    height: 2160,
                    framerate: 24,
                    bitrate: 15_000_000,
                    bitDepth: 10,
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10',
                }],
                education: {
                    breakdown: [
                        { token: 'av01', meaning: '' },
                        { token: '0', meaning: '' },
                        { token: '08M', meaning: '' },
                        { token: '10', meaning: '' },
                        { token: '0', meaning: '' },
                        { token: '110', meaning: '' },
                        { token: '01', meaning: '' },
                        { token: '01', meaning: '' },
                        { token: '01', meaning: '' },
                        { token: '0', meaning: '' }
                    ],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
                }
            },
            // ── av01.0.09H.10 ──

            {
                codec: 'av01.0.09H.10',
                name: 'AV1 Main 4K HDR10 High Tier',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash', 'cmaf']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K HDR10 High Tier 30fps',
                    width: 3840,
                    height: 2160,
                    framerate: 30,
                    bitrate: 40_000_000,
                    bitDepth: 10,
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10',
                    tier: 'high',
                }],
                education: {
                    breakdown: [
                        { token: 'av01', meaning: '' },
                        { token: '0', meaning: '' },
                        { token: '09H', meaning: '' },
                        { token: '10', meaning: '' }
                    ],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
                }
            },
            // ── av01.0.12M.10.0.110.09.16.09.0 ──

            {
                codec: 'av01.0.12M.10.0.110.09.16.09.0',
                name: 'AV1 Main 4K 60fps HDR10',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash', 'cmaf']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K HDR10 60fps',
                    width: 3840,
                    height: 2160,
                    framerate: 60,
                    bitrate: 20_000_000,
                    bitDepth: 10,
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10',
                }],
                education: {
                    breakdown: [
                        { token: 'av01', meaning: '' },
                        { token: '0', meaning: '' },
                        { token: '12M', meaning: '' },
                        { token: '10', meaning: '' },
                        { token: '0', meaning: '' },
                        { token: '110', meaning: '' },
                        { token: '09', meaning: '' },
                        { token: '16', meaning: '' },
                        { token: '09', meaning: '' },
                        { token: '0', meaning: '' }
                    ],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
                }
            },
            // ── av01.0.13M.10 ──

            {
                codec: 'av01.0.13M.10',
                name: 'AV1 Main 4K 120fps',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash', 'cmaf']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K HDR10 120fps',
                    width: 3840,
                    height: 2160,
                    framerate: 120,
                    bitrate: 40_000_000,
                    bitDepth: 10,
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10',
                }],
                education: {
                    breakdown: [
                        { token: 'av01', meaning: '' },
                        { token: '0', meaning: '' },
                        { token: '13M', meaning: '' },
                        { token: '10', meaning: '' }
                    ],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
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
                        { token: 'av01', meaning: '' },
                        { token: '0', meaning: '' },
                        { token: '16M', meaning: '' },
                        { token: '10', meaning: '' }
                    ],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
                }
            },
            // ── av01.1.08M.10 ──

            {
                codec: 'av01.1.08M.10',
                name: 'AV1 High 4:4:4',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash', 'cmaf']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K 4:4:4 HDR10 24fps',
                    width: 3840,
                    height: 2160,
                    framerate: 24,
                    bitrate: 20_000_000,
                    bitDepth: 10,
                    chromaSubsampling: '4:4:4',
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10',
                }],
                education: {
                    breakdown: [
                        { token: 'av01', meaning: '' },
                        { token: '1', meaning: '' },
                        { token: '08M', meaning: '' },
                        { token: '10', meaning: '' }
                    ],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
                }
            },
            // ── av01.2.08M.10 ──

            {
                codec: 'av01.2.08M.10',
                name: 'AV1 Professional 4:2:2',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash', 'cmaf']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K 4:2:2 HDR10 24fps',
                    width: 3840,
                    height: 2160,
                    framerate: 24,
                    bitrate: 20_000_000,
                    bitDepth: 10,
                    chromaSubsampling: '4:2:2',
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10',
                }],
                education: {
                    breakdown: [
                        { token: 'av01', meaning: '' },
                        { token: '2', meaning: '' },
                        { token: '08M', meaning: '' },
                        { token: '10', meaning: '' }
                    ],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
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
                        { token: 'vp9', meaning: '' }
                    ],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
                }
            },
            // ── vp09.00.10.08 ──

            {
                codec: 'vp09.00.10.08',
                name: 'VP9 Profile 0 SD',
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
                    bitrate: 5_000_000,
                }],
                education: {
                    breakdown: [
                        { token: 'vp09', meaning: '' },
                        { token: '00', meaning: '' },
                        { token: '10', meaning: '' },
                        { token: '08', meaning: '' }
                    ],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
                }
            },
            // ── vp09.00.21.08 ──

            {
                codec: 'vp09.00.21.08',
                name: 'VP9 Profile 0 480p',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '480p SDR',
                    width: 854,
                    height: 480,
                    framerate: 30,
                    bitrate: 2_000_000,
                }],
                education: {
                    breakdown: [
                        { token: 'vp09', meaning: '' },
                        { token: '00', meaning: '' },
                        { token: '21', meaning: '' },
                        { token: '08', meaning: '' }
                    ],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
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
                        name: '4K SDR',
                        width: 3840,
                        height: 2160,
                        framerate: 30,
                        bitrate: 15_000_000,
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'vp09', meaning: '' },
                        { token: '00', meaning: '' },
                        { token: '31', meaning: '' },
                        { token: '08', meaning: '' }
                    ],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
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
                        name: '1080p60 SDR',
                        width: 1920,
                        height: 1080,
                        framerate: 60,
                        bitrate: 12_000_000,
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'vp09', meaning: '' },
                        { token: '00', meaning: '' },
                        { token: '40', meaning: '' },
                        { token: '08', meaning: '' }
                    ],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
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
                }],
                education: {
                    breakdown: [
                        { token: 'vp09', meaning: '' },
                        { token: '00', meaning: '' },
                        { token: '50', meaning: '' },
                        { token: '08', meaning: '' }
                    ],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
                }
            },
            // ── vp09.01.10.08 ──

            {
                codec: 'vp09.01.10.08',
                name: 'VP9 Profile 1 SD',
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
                        { token: 'vp09', meaning: '' },
                        { token: '01', meaning: '' },
                        { token: '10', meaning: '' },
                        { token: '08', meaning: '' }
                    ],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
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
                        { token: 'vp09', meaning: '' },
                        { token: '01', meaning: '' },
                        { token: '40', meaning: '' },
                        { token: '08', meaning: '' }
                    ],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
                }
            },
            // ── vp09.02.10.10 ──

            {
                codec: 'vp09.02.10.10',
                name: 'VP9 Profile 2 SD',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K HDR10',
                    width: 3840,
                    height: 2160,
                    framerate: 24,
                    bitrate: 15_000_000,
                    bitDepth: 10,
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10',
                }],
                education: {
                    breakdown: [
                        { token: 'vp09', meaning: '' },
                        { token: '02', meaning: '' },
                        { token: '10', meaning: '' },
                        { token: '10', meaning: '' }
                    ],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
                }
            },
            // ── vp09.02.10.10.01.09.16.09.01 ──

            {
                codec: 'vp09.02.10.10.01.09.16.09.01',
                name: 'VP9 Profile 2 HDR10 (full range)',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K HDR10',
                    width: 3840,
                    height: 2160,
                    framerate: 60,
                    bitrate: 20_000_000,
                    bitDepth: 10,
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10',
                }],
                education: {
                    breakdown: [
                        { token: 'vp09', meaning: '' },
                        { token: '02', meaning: '' },
                        { token: '10', meaning: '' },
                        { token: '10', meaning: '' },
                        { token: '01', meaning: '' },
                        { token: '09', meaning: '' },
                        { token: '16', meaning: '' },
                        { token: '09', meaning: '' },
                        { token: '01', meaning: '' }
                    ],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
                }
            },
            // ── vp09.02.10.10.01.09.18.09.01 ──

            {
                codec: 'vp09.02.10.10.01.09.18.09.01',
                name: 'VP9 Profile 2 HLG (full range)',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K HLG',
                    width: 3840,
                    height: 2160,
                    framerate: 60,
                    bitrate: 20_000_000,
                    bitDepth: 10,
                    transferFunction: 'hlg',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hlg',
                }],
                education: {
                    breakdown: [
                        { token: 'vp09', meaning: '' },
                        { token: '02', meaning: '' },
                        { token: '10', meaning: '' },
                        { token: '10', meaning: '' },
                        { token: '01', meaning: '' },
                        { token: '09', meaning: '' },
                        { token: '18', meaning: '' },
                        { token: '09', meaning: '' },
                        { token: '01', meaning: '' }
                    ],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
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
                scenarios: [{
                    name: '4K SDR 10-bit',
                    width: 3840,
                    height: 2160,
                    framerate: 30,
                    bitrate: 20_000_000,
                    bitDepth: 10,
                }],
                education: {
                    breakdown: [
                        { token: 'vp09', meaning: '' },
                        { token: '02', meaning: '' },
                        { token: '31', meaning: '' },
                        { token: '10', meaning: '' }
                    ],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
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
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'vp09', meaning: '' },
                        { token: '02', meaning: '' },
                        { token: '50', meaning: '' },
                        { token: '10', meaning: '' }
                    ],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
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
                        { token: 'vp09', meaning: '' },
                        { token: '02', meaning: '' },
                        { token: '50', meaning: '' },
                        { token: '10', meaning: '' },
                        { token: '01', meaning: '' },
                        { token: '09', meaning: '' },
                        { token: '16', meaning: '' },
                        { token: '09', meaning: '' },
                        { token: '00', meaning: '' }
                    ],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
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
                        { token: 'vp09', meaning: '' },
                        { token: '02', meaning: '' },
                        { token: '50', meaning: '' },
                        { token: '10', meaning: '' },
                        { token: '01', meaning: '' },
                        { token: '09', meaning: '' },
                        { token: '18', meaning: '' },
                        { token: '09', meaning: '' },
                        { token: '00', meaning: '' }
                    ],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
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
                    }
                ],
                education: {
                    breakdown: [
                        { token: 'vp09', meaning: '' },
                        { token: '02', meaning: '' },
                        { token: '51', meaning: '' },
                        { token: '10', meaning: '' }
                    ],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
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
                        { token: 'vp09', meaning: '' },
                        { token: '02', meaning: '' },
                        { token: '50', meaning: '' },
                        { token: '12', meaning: '' }
                    ],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
                }
            },
            // ── vp09.03.10.10 ──

            {
                codec: 'vp09.03.10.10',
                name: 'VP9 Profile 3 SD',
                containers: {
                    file: ['mp4', 'mkv', 'webm'],
                    stream: ['fmp4', 'dash']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '1080p 4:4:4 HDR',
                    width: 1920,
                    height: 1080,
                    framerate: 30,
                    bitrate: 10_000_000,
                    bitDepth: 10,
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10',
                }],
                education: {
                    breakdown: [
                        { token: 'vp09', meaning: '' },
                        { token: '03', meaning: '' },
                        { token: '10', meaning: '' },
                        { token: '10', meaning: '' }
                    ],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
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
                        { token: 'vp09', meaning: '' },
                        { token: '03', meaning: '' },
                        { token: '50', meaning: '' },
                        { token: '10', meaning: '' }
                    ],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
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
                        { token: 'vp09', meaning: '' },
                        { token: '00', meaning: '' },
                        { token: '60', meaning: '' },
                        { token: '08', meaning: '' }
                    ],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
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
                }],
                education: {
                    breakdown: [],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
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
                    breakdown: [],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
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
                    breakdown: [],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
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
                }],
                education: {
                    breakdown: [],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
                }
            },

            // ── dvhe.08.09 ──

            {
                codec: 'dvhe.08.09',
                name: '4K DV Profile 8.4 24fps (HLG base, dvhe)',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
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
                }],
                education: {
                    breakdown: [],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
                }
            },

            // ── hvc1.2.4.L153.B0, dvh1.05.07 ──

            {
                codec: 'hvc1.2.4.L153.B0, dvh1.05.07',
                name: '4K DV Profile 5 + HEVC 24fps (supplemental)',
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
                    breakdown: [],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
                }
            },

            // ── dva1.10.01 ──

            {
                codec: 'dva1.10.01',
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
                    hdrFormat: 'hdr10'
                }],
                education: {
                    breakdown: [],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
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
                    breakdown: [],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
                }
            },

            // ── dvh1.08.02 ──

            {
                codec: 'dvh1.08.02',
                name: '4K DV Profile 8.2 24fps (SDR base)',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
                    name: '4K SDR 24fps 10-bit',
                    width: 3840,
                    height: 2160,
                    framerate: 24,
                    bitrate: 20_000_000,
                    bitDepth: 10,
                    chromaSubsampling: '4:2:0',
                }],
                education: {
                    breakdown: [],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
                }
            },

            // ── dvh1.08.09 ──

            {
                codec: 'dvh1.08.09',
                name: '4K DV Profile 8.4 24fps (HLG base, dvh1)',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
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
                }],
                education: {
                    breakdown: [],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
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
                    breakdown: [],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
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
                    breakdown: [],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
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
                    breakdown: [],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
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
                    breakdown: [],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
                }
            },

            // ── dav1.10.01 ──

            {
                codec: 'dav1.10.01',
                name: '4K DV Profile 10 24fps (AV1 base, dav1)',
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
                    hdrFormat: 'hdr10'
                }],
                education: {
                    breakdown: [],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
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
                }],
                education: {
                    breakdown: [],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
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
                    breakdown: [],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
                }
            },

            // ── hvc1.2.4.L153.B0, dvhe.08.09 ──

            {
                codec: 'hvc1.2.4.L153.B0, dvhe.08.09',
                name: '4K DV P8.4 + HEVC 24fps (HLG supplemental)',
                containers: {
                    file: ['mp4', 'mkv', 'mov'],
                    stream: ['fmp4', 'hls', 'dash', 'cmaf', 'mpegts']
                },
                drm: ['widevine', 'playready', 'fairplay', 'clearkey'],
                scenarios: [{
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
                }],
                education: {
                    breakdown: [],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
                }
            },

            // ── av01.0.08M.10, dav1.10.01 ──

            {
                codec: 'av01.0.08M.10, dav1.10.01',
                name: '4K DV P10 + AV1 24fps (supplemental)',
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
                    bitDepth: 10,
                    chromaSubsampling: '4:2:0',
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10'
                }],
                education: {
                    breakdown: [],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
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
                    breakdown: [],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
                }
            },

            // ── dvhp.05.06 ──

            {
                codec: 'dvhp.05.06',
                name: '4K DV Profile 5 30fps (OMAF/VR)',
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
                    bitrate: 40_000_000,
                    bitDepth: 10,
                    chromaSubsampling: '4:2:0',
                    transferFunction: 'pq',
                    colorGamut: 'rec2020',
                    hdrFormat: 'hdr10'
                }],
                education: {
                    breakdown: [],
                    overview: '',
                    platforms: {},
                    streaming: {},
                    containerNotes: {},
                    references: []
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
