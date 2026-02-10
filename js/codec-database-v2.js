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
 * @param {Object} scenario
 * @param {string} type - 'video' or 'audio'
 * @returns {string}
 */
export function buildInfo(scenario, type) {
    const parts = [];

    if (type === 'video') {
        if (scenario.width && scenario.height) {
            parts.push(`${scenario.width}x${scenario.height}`);
        }
        if (scenario.framerate) {
            parts.push(`@ ${scenario.framerate}fps`);
        }
        if (scenario.bitrate) {
            const mbps = scenario.bitrate / 1_000_000;
            parts.push(`${mbps % 1 === 0 ? mbps : mbps.toFixed(1)} Mbps`);
        }
        if (scenario.bitDepth) {
            const chroma = scenario.chromaSubsampling || '4:2:0';
            parts.push(`${scenario.bitDepth}-bit ${chroma}`);
        }
        if (scenario.hdrFormat) {
            const hdrLabels = {
                hdr10: 'HDR10',
                hdr10plus: 'HDR10+',
                hlg: 'HLG'
            };
            parts.push(hdrLabels[scenario.hdrFormat] || scenario.hdrFormat);
        }
        if (scenario.transferFunction && scenario.transferFunction !== 'srgb') {
            parts.push(scenario.transferFunction.toUpperCase());
        }
        if (scenario.colorGamut && scenario.colorGamut !== 'srgb') {
            const gamutLabels = { rec2020: 'BT.2020', p3: 'Display P3' };
            parts.push(gamutLabels[scenario.colorGamut] || scenario.colorGamut);
        }
        if (scenario.tier) {
            const tierLabels = { main: 'Main Tier', high: 'High Tier' };
            parts.push(tierLabels[scenario.tier] || scenario.tier);
        }
    } else {
        if (scenario.channels) {
            const channelMap = { 1: 'Mono', 2: 'Stereo', 6: '5.1', 8: '7.1' };
            parts.push(channelMap[scenario.channels] || `${scenario.channels}ch`);
        }
        if (scenario.samplerate) {
            parts.push(`@ ${scenario.samplerate / 1000} kHz`);
        }
        if (scenario.bitrate) {
            const kbps = scenario.bitrate / 1000;
            parts.push(`${kbps % 1 === 0 ? kbps : kbps.toFixed(1)} kbps`);
        }
        if (scenario.bitDepth) {
            parts.push(`${scenario.bitDepth}-bit`);
        }
        if (scenario.spatial) {
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
 * @param {Object} scenario
 * @param {string} mime - Full MIME string from buildMime()
 * @param {string} type - 'video' or 'audio'
 * @returns {Object} Config object — caller sets .type to 'file' or 'media-source'
 */
export function buildMediaConfig(scenario, mime, type) {
    const config = {};

    if (type === 'video') {
        config.video = {
            contentType: mime,
            width: scenario.width || 1920,
            height: scenario.height || 1080,
            bitrate: scenario.bitrate || 5_000_000,
            framerate: scenario.framerate || 24
        };
        if (scenario.transferFunction) {
            config.video.transferFunction = scenario.transferFunction;
        }
        if (scenario.colorGamut) {
            config.video.colorGamut = scenario.colorGamut;
        }
    } else {
        config.audio = {
            contentType: mime,
            channels: String(scenario.channels || 2),
            bitrate: scenario.bitrate || 128_000,
            samplerate: scenario.samplerate || 48_000
        };
    }

    return config;
}


// ==================== TYPE DEFINITIONS ====================

/**
 * @typedef {Object} CodecRecord
 * @property {string} codec - Bare codec string (e.g. 'hvc1.2.4.L153.B0')
 *   Multi-codec for supplemental DV: 'hvc1.2.4.L153.B0, dvh1.08.06'
 * @property {string} name - Descriptive card title
 *   Video:  '{Resolution} {HDR} — {Profile} ({Tag})'
 *   Audio:  '{Codec} {Quality} {Channels} {Bitrate} ({Technology})'
 *   DV:     '{Resolution} DV P{N} — {Tag} {Description}'
 * @property {Object} containers
 * @property {string[]} containers.file - File playback containers (e.g. ['mp4', 'mkv', 'mov'])
 * @property {string[]} [containers.stream] - Stream containers (e.g. ['fmp4', 'hls', 'dash'])
 * @property {string[]} [flags] - UI labels: 'nonstandard', 'deprecated', 'film-grain'
 * @property {VideoScenario|AudioScenario} scenario
 * @property {Education} [education] - Populated incrementally
 */

/**
 * @typedef {Object} VideoScenario
 * @property {number} width
 * @property {number} height
 * @property {number} bitrate - In bps
 * @property {number} framerate
 * @property {number} [bitDepth] - 8, 10, or 12
 * @property {string} [chromaSubsampling] - '4:2:0', '4:2:2', or '4:4:4'
 * @property {string} [tier] - 'main' or 'high'
 * @property {string} [transferFunction] - 'pq', 'hlg', 'srgb' (mediaCapabilities API param)
 * @property {string} [colorGamut] - 'rec2020', 'p3', 'srgb' (mediaCapabilities API param)
 * @property {string} [hdrFormat] - 'hdr10', 'hdr10plus', 'hlg' (display metadata)
 * @property {string[]} [drm] - Systems to test: 'widevine', 'playready', 'fairplay', 'clearkey'
 */

/**
 * @typedef {Object} AudioScenario
 * @property {number} channels - 1, 2, 6, 8
 * @property {number} bitrate - In bps
 * @property {number} samplerate - In Hz
 * @property {number} [bitDepth] - 16, 24, 32
 * @property {boolean} [spatial] - Object/spatial audio capable
 * @property {string[]} [drm] - Systems to test
 */

/**
 * @typedef {Object} Education
 * @property {Array<{token: string, meaning: string}>} breakdown - Codec string token-by-token
 * @property {string} overview - Short, precise description of this codec test
 * @property {Object} [objectAudio] - Object-based audio metadata (Atmos JOC, DTS:X, AC-4 IMS, MPEG-H)
 * @property {string} objectAudio.base - Base channel bed (e.g. '7.1')
 * @property {string} objectAudio.technology - Tech name (e.g. 'JOC', 'DTS:X', 'IMS')
 * @property {number} objectAudio.maxObjects - Max simultaneous audio objects
 * @property {string} objectAudio.rendering - Rendering method description
 * @property {number} objectAudio.bitrate - Object audio bitrate in bps
 * @property {Object} [dvConfig] - DOVIDecoderConfigurationRecord (dvcC/dvvC box)
 * @property {number} dvConfig.profile
 * @property {number} dvConfig.level
 * @property {boolean} dvConfig.rpuPresent - Reference Processing Unit
 * @property {boolean} dvConfig.elPresent - Enhancement Layer
 * @property {boolean} dvConfig.blPresent - Base Layer
 * @property {number} dvConfig.blSignalCompat - BL signal compatibility ID
 * @property {Object} [platforms] - Platform-specific behavior notes
 * @property {string} [platforms.apple]
 * @property {string} [platforms.lg]
 * @property {string} [platforms.android]
 * @property {Object} [streaming] - Streaming manifest signaling variations
 * @property {Array<{signal: string, m3u8: string, notes: string}>} [streaming.hls]
 * @property {Array<{signal: string, mpd: string, notes: string}>} [streaming.dash]
 * @property {Object} [containerNotes] - Per-container quirks (e.g. { mkv: '...' })
 * @property {Object} [drm] - Per-DRM-system notes (e.g. { widevine: '...' })
 * @property {Array<{title: string, url: string}>} [references] - Spec citations
 */


// ==================== SOURCE DATABASE ====================

/**
 * Group keys follow the pattern: {type}_{codec_family}
 *
 * Group-level `type` determines media type for all codecs in the group.
 * The UI uses this for section placement — MPEG-TS audio (video/mp2t MIME)
 * belongs in audio sections because the group type is 'audio'.
 */
export const codecSource = {

    // ── VIDEO: Base codec standard ───────────────────────────

    video_hevc: {
        category: 'HEVC/H.265',
        type: 'video',
        description: 'Main, Main 10, Main Still Picture, High Tier. Levels 3.1\u20136.1. SDR, HDR10 (PQ), HLG.',
        codecs: []
    },

    video_av1: {
        category: 'AV1',
        type: 'video',
        description: 'Main, High, Professional profiles. Levels 2.0\u20136.1. 8/10/12-bit. SDR, HDR10, HDR10+, HLG. Film grain.',
        codecs: []
    },

    video_vp9: {
        category: 'VP9',
        type: 'video',
        description: 'Profiles 0\u20133. Levels 1.0\u20136.1. 8-bit and 10-bit. 4:2:0, 4:2:2, 4:4:4. SDR and HDR10.',
        codecs: []
    },

    video_avc: {
        category: 'AVC/H.264',
        type: 'video',
        description: 'Baseline, Main, High, High 10, High 4:2:2, Constrained, Extended. Levels 3.0\u20135.2.',
        codecs: []
    },

    video_vvc: {
        category: 'VVC/H.266',
        type: 'video',
        description: 'Main 10 profile. Levels 3.1\u20136.1. 10-bit. SDR and HDR10. vvc1/vvi1 tags.',
        codecs: []
    },

    video_vp8: {
        category: 'VP8',
        type: 'video',
        description: 'VP8 in WebM, MKV, OGG. No profile/level system. SDR only.',
        codecs: []
    },

    // ── VIDEO: Technology/brand ──────────────────────────────

    video_dolby_vision: {
        category: 'Dolby Vision',
        type: 'video',
        description: 'Profiles 4, 5, 7, 8.1, 8.2, 8.4, 9, 10. Single-layer and dual-layer (base + RPU). Spans HEVC, AVC, AV1 base codecs.',
        codecs: []
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
        description: 'MPEG-H 3D Audio LC Profile Levels 1\u20133. Object-based immersive audio (ISO/IEC 23008-3).',
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
