/**
 * Codec Test Database — 256 tests · 14 groups · 17 MIME types · 129 education entries
 *
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │ VIDEO CODECS                                                                   142 tests total   │
 * ├────────────────────┬───────┬────────┬──────────────┬──────────────────────────────┬──────────────┤
 * │ Group              │ Tests │   Line │ Category     │ Containers                   │ Edu / Platf. │
 * ├────────────────────┼───────┼────────┼──────────────┼──────────────────────────────┼──────────────┤
 * │ video_hevc         │    23 │     17 │ HEVC/H.265   │ MP4 · MKV · MOV              │ 23 │ A L G   │
 * │ video_dolby_vision │    33 │    659 │ Dolby Vision │ MP4 · MKV · MOV              │ 33 │ A L G   │
 * │ video_av1          │    26 │   1932 │ AV1          │ MP4 · MKV · WebM · MOV       │ 10 │ A L G   │
 * │ video_vp9          │    20 │   2595 │ VP9          │ WebM · MP4 · MKV             │  6 │ A L G   │
 * │ video_avc          │    20 │   3063 │ AVC/H.264    │ MP4 · MKV · MOV · WebM       │ 10 │         │
 * │ video_vvc          │     8 │   3566 │ VVC/H.266    │ MP4 · MKV                    │  3 │         │
 * │ video_vp8          │     5 │   6536 │ VP8          │ WebM · MKV                   │  1 │         │
 * │ video_legacy       │     9 │   6636 │ Legacy       │ OGG · MP4 · MKV · 3GP        │  4 │         │
 * ├────────────────────┴───────┴────────┴──────────────┴──────────────────────────────┴──────────────┤
 * │ STREAMING FORMATS                                                                25 tests total  │
 * ├────────────────────┬───────┬────────┬──────────────┬──────────────────────────────┬──────────────┤
 * │ streaming_hls      │    25 │   3764 │ HLS/DASH     │ fMP4 · CMAF · MPEG-TS · DASH │ 25 │ A L G   │
 * ├────────────────────┴───────┴────────┴──────────────┴──────────────────────────────┴──────────────┤
 * │ AUDIO CODECS                                                                    87 tests total   │
 * ├────────────────────┬───────┬────────┬──────────────┬──────────────────────────────┬──────────────┤
 * │ audio_dolby        │    17 │   5038 │ Dolby Audio  │ MP4 · MKV · MOV · fMP4       │  4 │         │
 * │ audio_dts          │    15 │   5361 │ DTS Audio    │ MP4 · MKV · fMP4             │  2 │         │
 * │ audio_lossless     │    27 │   5624 │ Lossless     │ MKV·MP4·FLAC·WAV·AIFF·OGG…   │  4 │         │
 * │ audio_standard     │    24 │   6093 │ Standard     │ MP4·MKV·AAC·MP3·OGG·MOV…     │  5 │         │
 * │ audio_mpeg_h       │     4 │   6845 │ MPEG-H 3D    │ MP4 · MKV                    │  1 │         │
 * └────────────────────┴───────┴────────┴──────────────┴──────────────────────────────┴──────────────┘
 *   Platforms: A = Apple (Safari/iOS/tvOS)  L = LG (webOS)  G = Android (Chrome/ExoPlayer)
 *
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │ CODEC VARIANTS TESTED                                                                            │
 * ├──────────────────┬───────────────────────────────────────────────────────────────────────────────┤
 * │ HEVC/H.265       │ Main, Main 10 (hvc1/hev1) · SDR, HDR10/PQ, HLG · 1080p–8K · L3.1–L6.1         │
 * │ Dolby Vision     │ Profiles 4/5/7/8.1/8.2/8.4/9/10 · dvh1/dvhe/dva1/dav1 · Supplemental RPU      │
 * │ AV1              │ Main/High/Professional · 8/10/12-bit · HDR10/HLG · L4.0–L6.1                  │
 * │ VP9              │ Profiles 0/2/3 · 8/10/12-bit · HDR · L1.0–L6.1                                │
 * │ AVC/H.264        │ Baseline/Main/High · L3.0–L5.1 · 4:2:0 8-bit                                  │
 * │ VVC/H.266        │ Main 10 (vvc1/vvi1) · L3.1–L6.2 · 4K–8K                                       │
 * │ VP8              │ 720p/1080p · WebM/MKV                                                         │
 * │ Legacy           │ Theora (OGG) · MPEG-4 Part 2 (mp4v) · H.263 (3GP)                             │
 * ├──────────────────┼───────────────────────────────────────────────────────────────────────────────┤
 * │ Dolby Audio      │ AC-3 (5.1) · E-AC-3/DD+ (7.1/Atmos JOC) · TrueHD (MLP) · AC-4 (IMS)           │
 * │ DTS Audio        │ Core (dtsc) · Express (dtse) · HD (dtsh) · HD MA (dtsl) · DTS:X (dtsx)        │
 * │ Lossless         │ FLAC (2ch/5.1/CD/Hi-Res) · ALAC · Opus · PCM 16/24-bit 44.1–192kHz            │
 * │ Standard         │ AAC-LC · HE-AAC v1/v2 · xHE-AAC · AAC-ELD · AAC-LD · MP3 · Vorbis             │
 * │ MPEG-H 3D        │ Baseline/LC profiles · Levels 1–5 · mhm1/mhm2                                 │
 * ├──────────────────┼───────────────────────────────────────────────────────────────────────────────┤
 * │ Streaming        │ HLS fMP4 · DASH · CMAF · MPEG-TS │ HEVC/H.264/AV1/VP9/DV/EAC3/AAC             │
 * └──────────────────┴───────────────────────────────────────────────────────────────────────────────┘
 *
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │ CONTAINER COVERAGE — 17 MIME types                                                               │
 * ├────────────────┬─────────────────────────────────────────────────────────────────────────────────┤
 * │ ISO BMFF       │ video/mp4 · audio/mp4 · video/quicktime · audio/quicktime                       │
 * │ Matroska       │ video/x-matroska · audio/x-matroska · video/webm · audio/webm                   │
 * │ Streaming      │ video/mp2t (MPEG-TS) · fMP4 (fragmented) · CMAF (ISO 23000-19)                  │
 * │ Native         │ audio/flac · audio/wav · audio/aiff · audio/aac · audio/mpeg                    │
 * │ Legacy         │ video/ogg · audio/ogg · video/3gpp                                              │
 * └────────────────┴─────────────────────────────────────────────────────────────────────────────────┘
 *
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │ REFERENCED SPECIFICATIONS — 36 sources across 6 standards bodies                                 │
 * ├────────────────┬─────────────────────────────────────────────────────────────────────────────────┤
 * │ ITU-T          │ H.264 (AVC) · H.266 (VVC) · H.263                                               │
 * │ ISO/IEC        │ 14496-2 (MPEG-4 Visual) · 14496-3 (AAC) · 14496-15 (NALU mapping)               │
 * │                │ 14496-15:2022 (VVC) · 23008-2 (HEVC) · 23008-3 (MPEG-H 3D Audio)                │
 * │                │ 23009-1 (DASH) · 23000-19 (CMAF) · 11172-3 (MP3) · 13818-1 (MPEG-TS)            │
 * │ ETSI           │ TS 102 366 (AC-3/E-AC-3) · TS 102 114 (DTS)                                     │
 * │                │ TS 103 572 (Dolby Vision) · TS 103 190 (AC-4)                                   │
 * │ IETF           │ RFC 6386 (VP8) · RFC 6716 (Opus) · RFC 8216 (HLS) · RFC 9639 (FLAC)             │
 * │ Industry       │ AV1 Bitstream Spec (AOMedia) · VP9 Bitstream Spec (WebM Project)                │
 * │                │ Dolby Vision HLS/DASH Specs · DASH-IF Interop Points                            │
 * │                │ Vorbis I Spec (Xiph.Org) · Theora Spec (Xiph.Org)                               │
 * │ Vendor         │ Apple HLS Authoring Spec (developer.apple.com)                                  │
 * │                │ webOS TV AV Formats (webostv.developer.lge.com)                                │
 * │                │ Android Supported Media Formats (developer.android.com)                        │
 * └────────────────┴─────────────────────────────────────────────────────────────────────────────────┘
 */

export const codecDatabase = {
    // ==================== VIDEO CODECS ====================

    video_hevc: {
        category: "HEVC/H.265",
        tests: [
            // SDR variants
            {
                name: "HEVC Main (SDR 1080p MP4)",
                codec: 'video/mp4; codecs="hvc1.1.6.L93.B0"',
                container: "MP4",
                info: "8-bit SDR",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="hvc1.1.6.L93.B0"',
                        width: 1920,
                        height: 1080,
                        bitrate: 5000000,
                        framerate: 24
                    }
                },
                                education: {
                    codecBreakdown: {
                        mime: 'video/mp4',
                        string: 'hvc1.1.6.L93.B0',
                        parts: [
                            { token: 'hvc1', meaning: 'HEVC with parameter sets in sample description (ISO 14496-15 Annex E). Parameter sets (VPS/SPS/PPS) stored once in the MP4 sample entry, not repeated in every access unit. Apple HLS requires hvc1 over hev1.' },
                            { token: '1', meaning: 'Main Profile (profile_idc=1). 8-bit 4:2:0 only. The workhorse profile — covers all SDR content. Equivalent to H.264 High Profile in capability.' },
                            { token: '6', meaning: 'Profile compatibility flags (general_profile_compatibility_flag). Bit 1 set = compatible with Main Profile decoders. Value 6 = bits 1+2 set (Main + Main 10 backward-compatible).' },
                            { token: 'L93', meaning: 'Level 3.1, Main Tier. L prefix = Main Tier (vs H for High Tier). 93 = level_idc (3.1 × 30 = 93). Supports up to 1080p@30fps, max bitrate 10 Mbps.' },
                            { token: 'B0', meaning: 'General constraint indicator flags. B0 = no additional constraints beyond the profile. Decoders use this to verify stream compatibility.' }
                        ]
                    },
                    overview: 'HEVC Main Profile is the baseline 8-bit SDR profile. It replaces H.264 High Profile with roughly 50% better compression at the same quality. Main Profile is universally supported on any device that supports HEVC at all — it is the safe default for SDR content.',
                    platforms: {
                        apple: 'Hardware decode on iPhone 6+ (A8), iPad Air 2+ (A8X), Mac 2015+ (Skylake iGPU) and all Apple Silicon. In HLS, Apple requires hvc1 tag and fMP4 container — MPEG-TS is not supported for HEVC. Main Profile content does not need VIDEO-RANGE attribute (SDR is the default).',
                        lg: 'Supported on all webOS versions (3.0+, 2016 TVs onward). Hardware decode via LG SoC. No codec licensing issues — HEVC license is built into the TV firmware. Both hvc1 and hev1 tags work.',
                        android: 'HEVC Main Profile hardware decode available on Android 5.0+ via MediaCodec, but actual support depends on SoC. Qualcomm Snapdragon 610+, Samsung Exynos 7420+, MediaTek Helio P20+ all include HEVC hardware decoders. Software fallback via platform codec is possible but too slow for real-time 1080p on older devices.'
                    },
                    references: [
                        { title: 'ISO/IEC 23008-2' },
                        { title: 'ISO/IEC 14496-15 Annex E' },
                        { title: 'Apple HLS Authoring Spec', url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices' },
                        { title: 'webOS TV AV Formats', url: 'https://webostv.developer.lge.com/develop/specifications/video-audio-250' },
                        { title: 'Android Supported Media Formats', url: 'https://developer.android.com/media/platform/supported-formats' }
                    ]
                }
            },
            {
                name: "HEVC Main (SDR 1080p MKV)",
                codec: 'video/x-matroska; codecs="hvc1.1.6.L93.B0"',
                container: "MKV",
                info: "8-bit SDR",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="hvc1.1.6.L93.B0"',
                        width: 1920,
                        height: 1080,
                        bitrate: 5000000,
                        framerate: 24
                    }
                },
                    education: {
                        codecBreakdown: {
                            mime: 'video/x-matroska',
                            string: 'hvc1.1.6.L93.B0',
                            parts: [
                                { token: 'hvc1', meaning: 'HEVC with parameter sets in the sample entry (hvcC box). Even in MKV, the codec string uses the MP4/ISOBMFF naming convention — the Matroska parser maps this to its own CodecPrivate element.' },
                                { token: '1', meaning: 'Main Profile (profile_idc=1). 8-bit 4:2:0 — the baseline SDR profile.' },
                                { token: '6', meaning: 'Profile compatibility flags. Bits 1+2 set = backward-compatible with Main and Main 10 decoders.' },
                                { token: 'L93', meaning: 'Level 3.1, Main Tier. 93 = 3.1 × 30. Max 1280×720@30fps or 1920×1080@30fps, 10 Mbps peak.' },
                                { token: 'B0', meaning: 'General constraint indicator flags — no additional constraints.' }
                            ]
                        },
                        overview: 'HEVC Main Profile in MKV (Matroska) container. MKV is the standard remux format for Blu-ray and media server libraries, but browser support for video/x-matroska is limited. Desktop browsers typically reject the MIME type regardless of HEVC capability. Android Chrome often accepts it because codec negotiation passes through the OS-level MediaCodec API, which handles Matroska natively. This entry isolates the container-support question from codec support — the same hvc1.1.6.L93.B0 string in MP4 may return supported while MKV returns unsupported.',
                        references: [
                            { title: 'ITU-T H.265' },
                            { title: 'ISO/IEC 14496-15 Annex E' }
                        ]
                    }
            },
            // HDR10 variants
            {
                name: "HEVC Main 10 (HDR10 4K MP4)",
                codec: 'video/mp4; codecs="hvc1.2.4.L153.B0"',
                container: "MP4",
                info: "10-bit HDR10",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="hvc1.2.4.L153.B0"',
                        width: 3840,
                        height: 2160,
                        bitrate: 25000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                                education: {
                    codecBreakdown: {
                        mime: 'video/mp4',
                        string: 'hvc1.2.4.L153.B0',
                        parts: [
                            { token: 'hvc1', meaning: 'HEVC with parameter sets in sample description. Same tag as Main Profile — the profile_idc field (next token) distinguishes Main from Main 10.' },
                            { token: '2', meaning: 'Main 10 Profile (profile_idc=2). Supports 8-bit and 10-bit 4:2:0. Required for all HDR content (HDR10, HLG, Dolby Vision base layer). The "10" means up to 10 bits per component, not that it must be 10-bit.' },
                            { token: '4', meaning: 'Profile compatibility flags. Value 4 = bit 2 set = Main 10 compatible. Differs from Main Profile (which uses 6 = bits 1+2). A Main 10 decoder can play Main Profile streams, but not vice versa.' },
                            { token: 'L153', meaning: 'Level 5.1, Main Tier. 153 = 5.1 × 30. Supports 4K@60fps (or 4K@30fps with higher bitrate headroom). Main Tier caps bitrate at 40 Mbps. This is the standard 4K level for streaming.' },
                            { token: 'B0', meaning: 'No additional constraint flags. For HDR10, the actual HDR signaling (PQ transfer function, BT.2020 primaries) is in the stream metadata and mediaCapabilities config, not in the codec string itself.' }
                        ]
                    },
                    overview: 'HEVC Main 10 Profile with HDR10 uses 10-bit color depth to support wide color gamut (BT.2020) and high dynamic range via PQ (Perceptual Quantizer) transfer function. This is the baseline HDR format, using static metadata (MaxCLL, MaxFALL) to define content characteristics. The codec string alone does not signal HDR — that comes from the transferFunction and colorGamut fields in mediaCapabilities, or VIDEO-RANGE=PQ in HLS.',
                    streaming: {
                        hls: {
                            m3u8: `#EXTM3U
#EXT-X-VERSION:6
#EXT-X-STREAM-INF:BANDWIDTH=25000000,CODECS="hvc1.2.4.L153.B0,mp4a.40.2",RESOLUTION=3840x2160,VIDEO-RANGE=PQ
hdr10_4k.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=8000000,CODECS="avc1.640028,mp4a.40.2",RESOLUTION=1920x1080
sdr_1080p.m3u8`,
                            notes: 'VIDEO-RANGE=PQ signals HDR10 content to iOS/tvOS. Codec string hvc1.2.4.L153.B0 breaks down as: hvc1 (HEVC in MP4), 2 (Main 10 profile), 4 (Main tier), L153 (Level 5.1 for 4K), B0 (no constraint flags). Always provide SDR fallback.'
                        },
                        dash: {
                            mpd: `<AdaptationSet mimeType="video/mp4" codecs="hvc1.2.4.L153.B0">
  <Representation bandwidth="25000000" width="3840" height="2160">
    <SegmentTemplate media="hdr10_$Number$.m4s" initialization="hdr10_init.mp4"/>
  </Representation>
</AdaptationSet>`,
                            notes: 'For HDR10, include SupplementalProperty with schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="16" (PQ) and "urn:mpeg:mpegB:cicp:ColourPrimaries" value="9" (BT.2020) for explicit signaling.'
                        }
                    },
                    platforms: {
                        apple: 'HEVC hardware acceleration available on: iPhone 7+ (A10), iPad Pro 2017+ (A10X), Mac 2018+ (T2 or Apple Silicon). Safari requires VIDEO-RANGE attribute in HLS. Use hvc1 tag for better compatibility than hev1.',
                        lg: 'Universal support on webOS 3.0+. Hardware decoding via LG SoC. HEVC licensing built-in, no browser-specific limitations. Supports both hvc1 and hev1 tags.',
                        android: 'HEVC Main 10 support requires Android 7.0+ with MediaCodec hardware decoder. Check capabilities via MediaCodecList. Samsung Exynos, Qualcomm Snapdragon 820+, and HiSilicon Kirin support HEVC. Software fallback available on Android 5.0+ but not performant for 4K.'
                    },
                    references: [
                        { title: 'ISO/IEC 23008-2' },
                        { title: 'ISO/IEC 14496-15 Annex E' },
                        { title: 'Apple HLS Authoring Spec', url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices' },
                        { title: 'webOS TV AV Formats', url: 'https://webostv.developer.lge.com/develop/specifications/video-audio-250' },
                        { title: 'Android Supported Media Formats', url: 'https://developer.android.com/media/platform/supported-formats' }
                    ]
                }
            },
            {
                name: "HEVC Main 10 (HDR10 4K MKV)",
                codec: 'video/x-matroska; codecs="hvc1.2.4.L153.B0"',
                container: "MKV",
                info: "10-bit HDR10",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="hvc1.2.4.L153.B0"',
                        width: 3840,
                        height: 2160,
                        bitrate: 25000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                    education: {
                        codecBreakdown: {
                            mime: 'video/x-matroska',
                            string: 'hvc1.2.4.L153.B0',
                            parts: [
                                { token: 'hvc1', meaning: 'HEVC, parameter sets in sample entry. In MKV, the hvcC-equivalent data lives in the CodecPrivate element of the Matroska track header.' },
                                { token: '2', meaning: 'Main 10 Profile (profile_idc=2). 10-bit 4:2:0 — required for HDR10 (PQ transfer function needs 10-bit to avoid banding).' },
                                { token: '4', meaning: 'Profile compatibility: bit 2 set = Main 10 compatible decoders only.' },
                                { token: 'L153', meaning: 'Level 5.1, Main Tier. 153 = 5.1 × 30. Max 3840×2160@60fps, 40 Mbps peak.' },
                                { token: 'B0', meaning: 'No additional constraints beyond Main 10 Profile.' }
                            ]
                        },
                        overview: 'HEVC Main 10 HDR10 in MKV — the standard format for 4K HDR Blu-ray remuxes. MKV carries the PQ transfer function and BT.2020 color primaries in the Colour element of the Matroska track header. The challenge for browsers is dual: they must parse the Matroska container AND support HDR10 tone mapping. Most browsers that support HEVC HDR10 in MP4 do not support the same content in MKV because the Matroska parser is missing, not the codec.',
                        references: [
                            { title: 'ITU-T H.265' },
                            { title: 'ISO/IEC 14496-15 Annex E' },
                            { title: 'SMPTE ST 2084' }
                        ]
                    }
            },
            {
                name: "HEVC Main 10 (hev1 tag)",
                codec: 'video/mp4; codecs="hev1.2.4.L153.B0"',
                container: "MP4",
                info: "Alternative HEVC tag",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="hev1.2.4.L153.B0"',
                        width: 3840,
                        height: 2160,
                        bitrate: 25000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                                education: {
                    codecBreakdown: {
                        mime: 'video/mp4',
                        string: 'hev1.2.4.L153.B0',
                        parts: [
                            { token: 'hev1', meaning: 'HEVC with parameter sets in-band (in the bitstream). Parameter sets (VPS/SPS/PPS) repeated in each access unit rather than stored once in the sample entry. Larger file size but more resilient to random access and stream switching.' },
                            { token: '2', meaning: 'Main 10 Profile — identical to hvc1.2, the profile is the same regardless of tag.' },
                            { token: '4', meaning: 'Profile compatibility flags — same value as the hvc1 variant.' },
                            { token: 'L153', meaning: 'Level 5.1, Main Tier — same capability as hvc1 at the same level.' },
                            { token: 'B0', meaning: 'No constraint flags — same as hvc1 variant.' }
                        ]
                    },
                    overview: 'The only difference between hev1 and hvc1 is where parameter sets are stored. hvc1 puts VPS/SPS/PPS in the MP4 sample entry (read once at init). hev1 puts them in-band (repeated in each sample). hev1 is more tolerant of mid-stream joins and adaptive bitrate switching, but Apple explicitly requires hvc1 in HLS — hev1 is listed as "use not recommended" in the Apple HLS authoring spec. Most browsers support both tags, but Safari on older iOS versions may reject hev1.',
                    platforms: {
                        apple: 'Apple HLS authoring spec marks hev1/dvhe as "use not recommended." Safari and AVFoundation prefer hvc1/dvh1 because the out-of-band parameter sets allow faster segment initialization. hev1 may work in practice but is not guaranteed across all Apple devices.',
                        lg: 'webOS accepts both hvc1 and hev1 without distinction. The built-in media pipeline handles both parameter set locations transparently.',
                        android: 'MediaCodec on Android handles both tags. The distinction matters more for the muxer (ffmpeg -tag:v hvc1 vs hev1) than for browser-side decoding. ExoPlayer treats both identically.'
                    },
                    references: [
                        { title: 'ISO/IEC 23008-2' },
                        { title: 'ISO/IEC 14496-15 Annex E' },
                        { title: 'Apple HLS Authoring Spec', url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices' },
                        { title: 'webOS TV AV Formats', url: 'https://webostv.developer.lge.com/develop/specifications/video-audio-250' },
                        { title: 'Android Supported Media Formats', url: 'https://developer.android.com/media/platform/supported-formats' }
                    ]
                }
            },
            // HLG variants
            {
                name: "HEVC Main 10 (HLG HDR)",
                codec: 'video/mp4; codecs="hvc1.2.4.L153.B0"',
                container: "MP4",
                info: "Hybrid Log-Gamma",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="hvc1.2.4.L153.B0"',
                        width: 3840,
                        height: 2160,
                        bitrate: 25000000,
                        framerate: 24,
                        transferFunction: 'hlg',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    overview: 'Same codec string as HDR10 (hvc1.2.4.L153.B0) — the HEVC bitstream is identical. The difference is the transfer function: HLG (Hybrid Log-Gamma, ARIB STD-B67) instead of PQ (SMPTE ST 2084). HLG is backward-compatible with SDR displays — an SDR display can show an HLG signal without tone-mapping, just slightly brighter midtones. PQ requires explicit tone-mapping. This is why the mediaCapabilities config uses transferFunction: "hlg" instead of "pq". In HLS, Apple uses VIDEO-RANGE=HLG. DASH uses CICP TransferCharacteristics value 18 (vs 16 for PQ).',
                    platforms: {
                        apple: 'HLG supported on iPhone 8+ (A11), iPad Pro 2018+ (A12X), Apple TV 4K, Mac with Apple Silicon. In HLS, Apple allows DV Profile 8.4 as a supplemental codec over HLG base: SUPPLEMENTAL-CODECS="dvh1.08.01/db4h" where db4h is the HLG-compatible DV brand. The codec string in CODECS uses hvc1.2.20000000.L150.B0 — the 20000000 compatibility flag signals HLG-aware decoders.',
                        lg: 'HLG supported on webOS 3.5+ (2017 OLED onward). LG TVs with built-in broadcast tuners use HLG for over-the-air HDR (DVB, ATSC 3.0). The display pipeline handles HLG natively without conversion to PQ.',
                        android: 'HLG support added in Android 10 (API 29) for MediaCodec. The Display.HdrCapabilities API reports HLG alongside HDR10. On devices that support HDR10 but not HLG, some SoCs convert HLG to PQ internally — the mediaCapabilities result may still return supported: true.'
                    },
                    references: [
                        { title: 'ISO/IEC 23008-2' },
                        { title: 'ISO/IEC 14496-15 Annex E' },
                        { title: 'Apple HLS Authoring Spec', url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices' },
                        { title: 'webOS TV AV Formats', url: 'https://webostv.developer.lge.com/develop/specifications/video-audio-250' },
                        { title: 'Android Supported Media Formats', url: 'https://developer.android.com/media/platform/supported-formats' }
                    ]
                }
            },
            // High frame rate
            {
                name: "HEVC Main 10 (4K 60fps)",
                codec: 'video/mp4; codecs="hvc1.2.4.L153.B0"',
                container: "MP4",
                info: "Level 5.1 High Tier",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="hvc1.2.4.L153.B0"',
                        width: 3840,
                        height: 2160,
                        bitrate: 40000000,
                        framerate: 60,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                    education: {
                        codecBreakdown: {
                            mime: 'video/mp4',
                            string: 'hvc1.2.4.L153.B0',
                            parts: [
                                { token: 'hvc1', meaning: 'HEVC, parameter sets in sample entry (hvcC box).' },
                                { token: '2', meaning: 'Main 10 Profile — 10-bit 4:2:0. Required for the wide color volume of 4K HDR content.' },
                                { token: '4', meaning: 'Profile compatibility: Main 10 decoders.' },
                                { token: 'L153', meaning: 'Level 5.1, Main Tier. 153 = 5.1 × 30. The minimum level for 4K@60fps — doubles the decode rate of Level 5.0 (30fps cap). Peak bitrate 40 Mbps.' },
                                { token: 'B0', meaning: 'No additional constraints.' }
                            ]
                        },
                        overview: 'HEVC Main 10 at Level 5.1 targeting 4K 60fps content. Level 5.1 is the key differentiator — it doubles the maximum decode rate from Level 5.0 (which caps at 4K@30fps). This matters for high frame rate content like sports broadcasts and gaming captures. Hardware decode at 4K60 requires a capable fixed-function decoder — software decode cannot sustain this throughput. The mediaConfig includes PQ transfer function, testing whether the device can combine high frame rate with HDR.',
                        references: [
                            { title: 'ITU-T H.265' },
                            { title: 'ISO/IEC 14496-15 Annex E' },
                            { title: 'SMPTE ST 2084' }
                        ]
                    }
            },
            // 8K variants
            {
                name: "HEVC Main 10 (8K Level 6.1)",
                codec: 'video/mp4; codecs="hvc1.2.4.L183.B0"',
                container: "MP4",
                info: "8K @ 60fps",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="hvc1.2.4.L183.B0"',
                        width: 7680,
                        height: 4320,
                        bitrate: 100000000,
                        framerate: 60,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                                education: {
                    codecBreakdown: {
                        mime: 'video/mp4',
                        string: 'hvc1.2.4.L183.B0',
                        parts: [
                            { token: 'hvc1', meaning: 'HEVC with parameter sets in sample description.' },
                            { token: '2', meaning: 'Main 10 Profile (10-bit).' },
                            { token: '4', meaning: 'Profile compatibility flags (Main 10).' },
                            { token: 'L183', meaning: 'Level 6.1, Main Tier. 183 = 6.1 × 30. The highest practical HEVC level — supports 8K (7680x4320) at 60fps. Main Tier max bitrate: 240 Mbps. Level 6.2 exists in the spec (8K@120fps) but no consumer hardware implements it.' },
                            { token: 'B0', meaning: 'No additional constraint flags.' }
                        ]
                    },
                    overview: 'Level 6.1 is 8K territory. The level number encodes resolution and framerate limits: the math is level_idc = major × 30 + minor × 3 (so 6.1 = 180 + 3 = 183). Compare: Level 5.1 (153) for 4K, Level 4.1 (123) for 1080p60, Level 3.1 (93) for 1080p30. Most browsers will report this as unsupported — 8K HEVC hardware decoders exist only on Samsung 8K TVs (Tizen), some LG 8K models, and recent Qualcomm Snapdragon 8 Gen 2+ SoCs.',
                    platforms: {
                        apple: 'No Apple device currently supports 8K HEVC decode. Apple Silicon M-series chips top out at Level 5.1 (4K60) for hardware decode. Software decode is theoretically possible but impractical for real-time 8K. Safari will report unsupported.',
                        lg: 'LG 8K TVs (88Z9/77ZX and newer QNED 8K models) support Level 6.1 hardware decode. Standard 4K webOS TVs do not — they cap at Level 5.1. The webOS browser may report unsupported even on 8K models if the web engine was not updated to reflect the SoC capability.',
                        android: '8K decode is available on Qualcomm Snapdragon 8 Gen 2+ and Samsung Exynos 2200+. Samsung Galaxy S23+ can hardware decode 8K HEVC. Most Android devices will report unsupported. The MediaCodecInfo.VideoCapabilities.isSizeSupported() API is the definitive check.'
                    },
                    references: [
                        { title: 'ISO/IEC 23008-2' },
                        { title: 'ISO/IEC 14496-15 Annex E' },
                        { title: 'Apple HLS Authoring Spec', url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices' },
                        { title: 'webOS TV AV Formats', url: 'https://webostv.developer.lge.com/develop/specifications/video-audio-250' },
                        { title: 'Android Supported Media Formats', url: 'https://developer.android.com/media/platform/supported-formats' }
                    ]
                }
            },
            // QuickTime/MOV container (Apple)
            {
                name: "HEVC Main 10 (QuickTime/MOV)",
                codec: 'video/quicktime; codecs="hvc1.2.4.L153.B0"',
                container: "MOV",
                info: "Apple QuickTime",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/quicktime; codecs="hvc1.2.4.L153.B0"',
                        width: 3840,
                        height: 2160,
                        bitrate: 25000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                                education: {
                    codecBreakdown: {
                        mime: 'video/quicktime',
                        string: 'hvc1.2.4.L153.B0',
                        parts: [
                            { token: 'hvc1', meaning: 'Same HEVC codec as in MP4 — the codec string is identical across containers. Only the MIME type changes.' },
                            { token: '2.4.L153.B0', meaning: 'Main 10 Profile, Level 5.1, Main Tier — identical parameters to the MP4 variant.' }
                        ]
                    },
                    overview: 'The QuickTime container (video/quicktime, .mov) is the ancestor of MP4 — ISO 14496-12 (ISOBMFF) is derived from the QuickTime file format. MOV and MP4 share the same box structure and atom layout, which is why ffmpeg can remux between them with no transcoding (ffmpeg -i input.mov -c copy output.mp4). The key difference: video/quicktime is the MIME type for native QuickTime, while video/mp4 is the ISO-standardized version. Safari supports both equally. Chrome/Firefox may reject video/quicktime while accepting the identical stream in video/mp4.',
                    platforms: {
                        apple: 'QuickTime is Apple-native — Safari, AVFoundation, and all Apple media APIs treat .mov as a first-class format. ProRes in MOV is the standard for professional video editing (Final Cut Pro, DaVinci Resolve). HEVC in MOV is how iPhone records video natively.',
                        lg: 'webOS has limited QuickTime/MOV support. The built-in browser may not recognize video/quicktime MIME type at all. Remuxing to MP4 (identical codec, different container) typically resolves playback issues on LG TVs.',
                        android: 'Android MediaPlayer supports MOV playback since early versions, but browser support for video/quicktime is inconsistent. Chrome on Android may reject the MIME type. Remux to MP4 for reliable browser playback.'
                    },
                    references: [
                        { title: 'ISO/IEC 23008-2' },
                        { title: 'ISO/IEC 14496-15 Annex E' },
                        { title: 'Apple HLS Authoring Spec', url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices' },
                        { title: 'webOS TV AV Formats', url: 'https://webostv.developer.lge.com/develop/specifications/video-audio-250' },
                        { title: 'Android Supported Media Formats', url: 'https://developer.android.com/media/platform/supported-formats' }
                    ]
                }
            },
            {
                name: "HEVC Main (SDR 1080p MOV)",
                codec: 'video/quicktime; codecs="hvc1.1.6.L120.B0"',
                container: "MOV",
                info: "8-bit SDR QuickTime",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/quicktime; codecs="hvc1.1.6.L120.B0"',
                        width: 1920,
                        height: 1080,
                        bitrate: 5000000,
                        framerate: 30
                    }
                },
                    education: {
                        codecBreakdown: {
                            mime: 'video/quicktime',
                            string: 'hvc1.1.6.L120.B0',
                            parts: [
                                { token: 'hvc1', meaning: 'HEVC, parameter sets in sample entry. MOV (QuickTime) was the original container for hvcC — the ISOBMFF spec inherited the structure from QuickTime.' },
                                { token: '1', meaning: 'Main Profile — 8-bit 4:2:0 SDR.' },
                                { token: '6', meaning: 'Profile compatibility: Main + Main 10 backward-compatible.' },
                                { token: 'L120', meaning: 'Level 4.0, Main Tier. 120 = 4.0 × 30. Max 2048×1080@30fps, 12 Mbps peak. The standard 1080p level for SDR content.' },
                                { token: 'B0', meaning: 'No additional constraints.' }
                            ]
                        },
                        overview: 'HEVC Main Profile in QuickTime MOV container. MOV is Apple\'s native container format and predates MP4 — the ISO BMFF spec (ISO/IEC 14496-12) is directly derived from QuickTime\'s atom structure. Safari accesses video/quicktime through AVFoundation, the same framework that handles MP4. Most non-Apple browsers do not register a handler for video/quicktime at all, making this a Safari/WebKit-specific test.',
                        references: [
                            { title: 'ITU-T H.265' },
                            { title: 'ISO/IEC 14496-15 Annex E' },
                            { title: 'Apple HLS Authoring Spec', url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices' }
                        ]
                    }
            },
            {
                name: "HEVC Main 10 (HLG MOV)",
                codec: 'video/quicktime; codecs="hvc1.2.4.L153.B0"',
                container: "MOV",
                info: "HLG HDR QuickTime",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/quicktime; codecs="hvc1.2.4.L153.B0"',
                        width: 3840,
                        height: 2160,
                        bitrate: 20000000,
                        framerate: 24,
                        transferFunction: 'hlg',
                        colorGamut: 'rec2020'
                    }
                },
                    education: {
                        codecBreakdown: {
                            mime: 'video/quicktime',
                            string: 'hvc1.2.4.L153.B0',
                            parts: [
                                { token: 'hvc1', meaning: 'HEVC, parameter sets in sample entry.' },
                                { token: '2', meaning: 'Main 10 Profile — 10-bit 4:2:0, required for HLG.' },
                                { token: '4', meaning: 'Profile compatibility: Main 10 decoders.' },
                                { token: 'L153', meaning: 'Level 5.1, Main Tier. 4K capable at up to 60fps.' },
                                { token: 'B0', meaning: 'No additional constraints.' }
                            ]
                        },
                        overview: 'HEVC Main 10 with HLG (Hybrid Log-Gamma) in QuickTime MOV. HLG is the backward-compatible HDR transfer function — designed so SDR displays can show a reasonable image without tone mapping. Unlike PQ (used by HDR10), HLG uses a relative luminance model. Apple supports HLG in their camera pipeline (iPhone 12+ shoots HLG natively), making MOV the natural container for HLG camera output. The video/quicktime MIME with HLG transfer function tests the intersection of Apple\'s container support and HDR capability.',
                        references: [
                            { title: 'ITU-T H.265' },
                            { title: 'ARIB STD-B67' },
                            { title: 'Apple HLS Authoring Spec', url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices' }
                        ]
                    }
            },
            // Additional HEVC levels and profiles
            {
                name: "HEVC Main (SDR 4K Level 5.0)",
                codec: 'video/mp4; codecs="hvc1.1.6.L150.B0"',
                container: "MP4",
                info: "8-bit 4K SDR",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="hvc1.1.6.L150.B0"',
                        width: 3840,
                        height: 2160,
                        bitrate: 15000000,
                        framerate: 30
                    }
                },
                    education: {
                        codecBreakdown: {
                            mime: 'video/mp4',
                            string: 'hvc1.1.6.L150.B0',
                            parts: [
                                { token: 'hvc1', meaning: 'HEVC, parameter sets in sample entry (hvcC box).' },
                                { token: '1', meaning: 'Main Profile — 8-bit 4:2:0. SDR-only, no HDR metadata.' },
                                { token: '6', meaning: 'Profile compatibility: Main + Main 10 backward-compatible.' },
                                { token: 'L150', meaning: 'Level 5.0, Main Tier. 150 = 5.0 × 30. Max 3840×2160@30fps, 25 Mbps peak. The base 4K level.' },
                                { token: 'B0', meaning: 'No additional constraints.' }
                            ]
                        },
                        overview: 'HEVC Main Profile at Level 5.0 for 4K SDR content. Main Profile (8-bit) at 4K is uncommon in practice — most 4K content uses Main 10 even for SDR because 10-bit encoding reduces banding in gradients regardless of HDR status. This entry tests whether the browser\'s HEVC decoder reports support for 4K resolution in 8-bit mode, which some implementations skip in favor of mandatory 10-bit at Level 5.0+.',
                        references: [
                            { title: 'ITU-T H.265' },
                            { title: 'ISO/IEC 14496-15 Annex E' }
                        ]
                    }
            },
            {
                name: "HEVC Main (SDR 1080p60 Level 4.1)",
                codec: 'video/mp4; codecs="hvc1.1.6.L123.B0"',
                container: "MP4",
                info: "8-bit 1080p@60fps",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="hvc1.1.6.L123.B0"',
                        width: 1920,
                        height: 1080,
                        bitrate: 8000000,
                        framerate: 60
                    }
                },
                    education: {
                        codecBreakdown: {
                            mime: 'video/mp4',
                            string: 'hvc1.1.6.L123.B0',
                            parts: [
                                { token: 'hvc1', meaning: 'HEVC, parameter sets in sample entry.' },
                                { token: '1', meaning: 'Main Profile — 8-bit 4:2:0 SDR.' },
                                { token: '6', meaning: 'Profile compatibility: Main + Main 10 backward-compatible.' },
                                { token: 'L123', meaning: 'Level 4.1, Main Tier. 123 = 4.1 × 30. Max 2048×1080@60fps, 20 Mbps peak. The 1080p@60fps level.' },
                                { token: 'B0', meaning: 'No additional constraints.' }
                            ]
                        },
                        overview: 'HEVC Main Profile at Level 4.1 for 1080p 60fps content. Level 4.1 doubles the frame rate ceiling of Level 4.0 (30fps → 60fps at 1080p). This is the target level for high frame rate 1080p streaming — gaming content, sports, and screen recordings. The distinction between Level 4.0 and 4.1 matters: some older hardware decoders support 4.0 but not 4.1, meaning they handle 1080p@30fps but not 1080p@60fps.',
                        references: [
                            { title: 'ITU-T H.265' },
                            { title: 'ISO/IEC 14496-15 Annex E' }
                        ]
                    }
            },
            {
                name: "HEVC Main 10 (SDR 1080p Level 4.0)",
                codec: 'video/mp4; codecs="hvc1.2.4.L120.B0"',
                container: "MP4",
                info: "10-bit SDR",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="hvc1.2.4.L120.B0"',
                        width: 1920,
                        height: 1080,
                        bitrate: 6000000,
                        framerate: 30
                    }
                },
                    education: {
                        codecBreakdown: {
                            mime: 'video/mp4',
                            string: 'hvc1.2.4.L120.B0',
                            parts: [
                                { token: 'hvc1', meaning: 'HEVC, parameter sets in sample entry.' },
                                { token: '2', meaning: 'Main 10 Profile — 10-bit 4:2:0.' },
                                { token: '4', meaning: 'Profile compatibility: Main 10 decoders.' },
                                { token: 'L120', meaning: 'Level 4.0, Main Tier. 120 = 4.0 × 30. Max 2048×1080@30fps, 12 Mbps peak.' },
                                { token: 'B0', meaning: 'No additional constraints.' }
                            ]
                        },
                        overview: 'HEVC Main 10 at Level 4.0 for 1080p SDR content using 10-bit encoding. This combination — 10-bit depth without HDR — is increasingly common because 10-bit encoding reduces banding artifacts in gradients (skies, fog, dark scenes) even when the source and display are SDR. Streaming services like Netflix encode SDR content in 10-bit HEVC for quality reasons. This entry tests whether the browser reports Main 10 support at 1080p without requiring HDR transfer functions.',
                        references: [
                            { title: 'ITU-T H.265' },
                            { title: 'ISO/IEC 14496-15 Annex E' }
                        ]
                    }
            },
            {
                name: "HEVC Main 10 (hev1 4K MKV)",
                codec: 'video/x-matroska; codecs="hev1.2.4.L153.B0"',
                container: "MKV",
                info: "Alternative HEVC tag in MKV",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="hev1.2.4.L153.B0"',
                        width: 3840,
                        height: 2160,
                        bitrate: 25000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                    education: {
                        codecBreakdown: {
                            mime: 'video/x-matroska',
                            string: 'hev1.2.4.L153.B0',
                            parts: [
                                { token: 'hev1', meaning: 'HEVC with parameter sets carried in-band (Annex B start codes). Unlike hvc1 where SPS/PPS/VPS are in the container header, hev1 repeats them in the bitstream at each random access point. Chrome/Android parse both; Safari/webOS require hvc1.' },
                                { token: '2', meaning: 'Main 10 Profile — 10-bit 4:2:0.' },
                                { token: '4', meaning: 'Profile compatibility: Main 10 decoders.' },
                                { token: 'L153', meaning: 'Level 5.1, Main Tier. 4K@60fps capable, 40 Mbps peak.' },
                                { token: 'B0', meaning: 'No additional constraints.' }
                            ]
                        },
                        overview: 'HEVC using the hev1 tag in MKV — a double compatibility challenge. The hev1 FourCC signals in-band parameter sets (SPS/PPS/VPS in the bitstream rather than the container header), and the MKV container adds its own parsing requirement. Safari rejects hev1 even in MP4 because AVFoundation reads codec configuration from the sample description, not the NAL stream. In MKV, the hev1 vs hvc1 distinction is less meaningful because Matroska stores the CodecPrivate data regardless, but the codec string still triggers different code paths in browser MIME matching.',
                        references: [
                            { title: 'ITU-T H.265' },
                            { title: 'ISO/IEC 14496-15 Annex E' }
                        ]
                    }
            },
            {
                name: "HEVC Main 10 (4K High Tier)",
                codec: 'video/mp4; codecs="hvc1.2.4.H153.B0"',
                container: "MP4",
                info: "High Tier higher bitrate cap",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="hvc1.2.4.H153.B0"',
                        width: 3840,
                        height: 2160,
                        bitrate: 50000000,
                        framerate: 60,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                                education: {
                    codecBreakdown: {
                        mime: 'video/mp4',
                        string: 'hvc1.2.4.H153.B0',
                        parts: [
                            { token: 'hvc1', meaning: 'HEVC with parameter sets in sample description.' },
                            { token: '2', meaning: 'Main 10 Profile.' },
                            { token: '4', meaning: 'Profile compatibility flags (Main 10).' },
                            { token: 'H153', meaning: 'Level 5.1, HIGH Tier. H prefix = High Tier (vs L for Main Tier). Same resolution/framerate limits as Main Tier but doubles the max bitrate: 160 Mbps vs 40 Mbps at Level 5.1. Used for UHD Blu-ray remuxes and studio masters where bitrate exceeds Main Tier caps.' },
                            { token: 'B0', meaning: 'No additional constraint flags.' }
                        ]
                    },
                    overview: 'Main Tier vs High Tier is purely a bitrate limit distinction — same resolution, same framerate, same codec features. High Tier doubles the allowed CPB (Coded Picture Buffer) size and max bitrate. Streaming services use Main Tier (40 Mbps cap at 5.1 is plenty for compressed content). UHD Blu-ray discs use High Tier because disc bitrates reach 80-100+ Mbps. If your media server serves Blu-ray remuxes, the browser must support High Tier or it will reject the codec string even though the decoder hardware is identical.',
                    platforms: {
                        apple: 'Apple HLS authoring spec states HEVC "must not exceed Main 10 Profile, Level 5.1, High Tier" overall. However, individual HLS variants should be "less than or equal to Main 10 Profile, Level 4.0, Main Tier" for adaptive streaming. High Tier is accepted for the top-quality variant only.',
                        lg: 'webOS hardware decoders support High Tier for local playback and USB media. For streaming via the built-in browser or apps, the bitrate is limited by network throughput rather than decoder capability.',
                        android: 'High Tier support depends on the SoC decoder. MediaCodecInfo.CodecCapabilities reports the max supported level — if it reports Level 5.1, it typically covers both tiers. But some budget SoCs only implement Main Tier at higher levels.'
                    },
                    references: [
                        { title: 'ISO/IEC 23008-2' },
                        { title: 'ISO/IEC 14496-15 Annex E' },
                        { title: 'Apple HLS Authoring Spec', url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices' },
                        { title: 'webOS TV AV Formats', url: 'https://webostv.developer.lge.com/develop/specifications/video-audio-250' },
                        { title: 'Android Supported Media Formats', url: 'https://developer.android.com/media/platform/supported-formats' }
                    ]
                }
            },
            {
                name: "HEVC Main Still Picture",
                codec: 'video/mp4; codecs="hvc1.3.E.L93.B0"',
                container: "MP4",
                info: "Profile 3 still image",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="hvc1.3.E.L93.B0"',
                        width: 1920,
                        height: 1080,
                        bitrate: 5000000,
                        framerate: 1
                    }
                },
                                education: {
                    codecBreakdown: {
                        mime: 'video/mp4',
                        string: 'hvc1.3.E.L93.B0',
                        parts: [
                            { token: 'hvc1', meaning: 'HEVC with parameter sets in sample description.' },
                            { token: '3', meaning: 'Main Still Picture Profile (profile_idc=3). A subset of Main Profile restricted to single-frame intra coding. Used for HEIF/HEIC image containers (iPhone photos since iOS 11).' },
                            { token: 'E', meaning: 'Profile compatibility flags. Hex value E = bits 1+2+3 set = compatible with Main, Main 10, and Main Still Picture decoders. This means any HEVC Main decoder can also decode a still picture — the profile is a strict subset.' },
                            { token: 'L93', meaning: 'Level 3.1, Main Tier. For still images, the level constrains the maximum picture size rather than framerate. Level 3.1 supports up to 1920x1080 single frames.' },
                            { token: 'B0', meaning: 'No additional constraint flags.' }
                        ]
                    },
                    overview: 'Main Still Picture is the profile behind HEIF/HEIC images. Apple adopted it for iPhone photos in iOS 11 (A9+). Since it is a strict subset of Main Profile, any HEVC video decoder can decode still pictures — but browsers rarely expose this through canPlayType because single-frame "video" is an unusual use case. This test checks whether the browser acknowledges the profile at all, not whether it would use HEVC for images (that is handled by the platform image decoder, not the video pipeline).',
                    platforms: {
                        apple: 'HEIF/HEIC is the default photo format since iOS 11. macOS 10.13+ can decode HEIF natively. However, Safari does not necessarily report this profile as supported via video codec APIs — the image decoder is a separate pipeline from HTMLMediaElement.',
                        lg: 'webOS does not typically use HEVC still picture in the browser context. LG TVs handle HEIF thumbnails through the built-in photo viewer app, not the web engine.',
                        android: 'HEIF support added in Android 8.0 (API 26). The MediaCodec HEVC decoder usually accepts Main Still Picture since it is a Main Profile subset. Gallery apps use the image decoder path, not MediaCodec.'
                    },
                    references: [
                        { title: 'ISO/IEC 23008-2' },
                        { title: 'ISO/IEC 14496-15 Annex E' },
                        { title: 'Apple HLS Authoring Spec', url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices' },
                        { title: 'webOS TV AV Formats', url: 'https://webostv.developer.lge.com/develop/specifications/video-audio-250' },
                        { title: 'Android Supported Media Formats', url: 'https://developer.android.com/media/platform/supported-formats' }
                    ]
                }
            },
            {
                name: "HEVC Main 10 (4K 120fps Level 5.2)",
                codec: 'video/mp4; codecs="hvc1.2.4.L156.B0"',
                container: "MP4",
                info: "Level 5.2 120fps",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="hvc1.2.4.L156.B0"',
                        width: 3840,
                        height: 2160,
                        bitrate: 60000000,
                        framerate: 120,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                                education: {
                    codecBreakdown: {
                        mime: 'video/mp4',
                        string: 'hvc1.2.4.L156.B0',
                        parts: [
                            { token: 'hvc1', meaning: 'HEVC with parameter sets in sample description.' },
                            { token: '2', meaning: 'Main 10 Profile (10-bit).' },
                            { token: '4', meaning: 'Profile compatibility flags (Main 10).' },
                            { token: 'L156', meaning: 'Level 5.2, Main Tier. 156 = 5.2 × 30 + 2 × 3. Supports 4K@120fps — the gaming and high-motion level. Main Tier max bitrate: 60 Mbps. Compare: Level 5.1 (153) caps at 4K@60fps.' },
                            { token: 'B0', meaning: 'No additional constraint flags.' }
                        ]
                    },
                    overview: 'Level 5.2 targets 4K@120fps — primarily used for gaming capture, sports, and high-frame-rate HDR content. HDMI 2.1 connections can carry 4K@120Hz HEVC. Few browsers support this because the use case is niche for web video. The jump from Level 5.1 (4K@60) to 5.2 (4K@120) doubles the required decoder throughput, which many hardware decoders cannot sustain.',
                    references: [
                        { title: 'ISO/IEC 23008-2' },
                        { title: 'ISO/IEC 14496-15 Annex E' }
                    ]
                }
            },
            {
                name: "HEVC Main 10 (HLG 4K MKV)",
                codec: 'video/x-matroska; codecs="hvc1.2.4.L153.B0"',
                container: "MKV",
                info: "HLG HDR in Matroska",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="hvc1.2.4.L153.B0"',
                        width: 3840,
                        height: 2160,
                        bitrate: 25000000,
                        framerate: 24,
                        transferFunction: 'hlg',
                        colorGamut: 'rec2020'
                    }
                },
                    education: {
                        codecBreakdown: {
                            mime: 'video/x-matroska',
                            string: 'hvc1.2.4.L153.B0',
                            parts: [
                                { token: 'hvc1', meaning: 'HEVC, parameter sets in sample entry.' },
                                { token: '2', meaning: 'Main 10 Profile — 10-bit 4:2:0, required for HLG.' },
                                { token: '4', meaning: 'Profile compatibility: Main 10 decoders.' },
                                { token: 'L153', meaning: 'Level 5.1, Main Tier. 4K capable.' },
                                { token: 'B0', meaning: 'No additional constraints.' }
                            ]
                        },
                        overview: 'HEVC Main 10 with HLG HDR in MKV container. HLG (Hybrid Log-Gamma) uses a scene-referred signal — it is backward-compatible with SDR displays that simply clip the highlights. MKV carries the HLG transfer characteristics (ID 18 per ITU-T H.273) in the Colour element. This combination tests three layers of support: MKV container parsing, HEVC Main 10 decode, and HLG transfer function handling. Most browsers fail at the first layer (MKV support).',
                        references: [
                            { title: 'ITU-T H.265' },
                            { title: 'ARIB STD-B67' }
                        ]
                    }
            },
            // MKV container coverage
            {
                name: "HEVC Main (SDR 4K MKV)",
                codec: 'video/x-matroska; codecs="hvc1.1.6.L150.B0"',
                container: "MKV",
                info: "8-bit 4K SDR in MKV",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="hvc1.1.6.L150.B0"',
                        width: 3840,
                        height: 2160,
                        bitrate: 15000000,
                        framerate: 30
                    }
                },
                    education: {
                        codecBreakdown: {
                            mime: 'video/x-matroska',
                            string: 'hvc1.1.6.L150.B0',
                            parts: [
                                { token: 'hvc1', meaning: 'HEVC, parameter sets in sample entry.' },
                                { token: '1', meaning: 'Main Profile — 8-bit 4:2:0 SDR.' },
                                { token: '6', meaning: 'Profile compatibility: Main + Main 10.' },
                                { token: 'L150', meaning: 'Level 5.0, Main Tier. 150 = 5.0 × 30. Max 3840×2160@30fps, 25 Mbps peak.' },
                                { token: 'B0', meaning: 'No additional constraints.' }
                            ]
                        },
                        overview: 'HEVC Main Profile 4K SDR in MKV. An uncommon combination in practice — 4K content is almost always encoded with Main 10 Profile for the banding reduction, even for SDR sources. This entry tests the edge case of 8-bit 4K HEVC in Matroska, which some hardware decoders may handle differently than 10-bit because the memory bandwidth requirement is lower (8-bit vs 10-bit surfaces).',
                        references: [
                            { title: 'ITU-T H.265' },
                            { title: 'ISO/IEC 14496-15 Annex E' }
                        ]
                    }
            },
            {
                name: "HEVC Main 10 (8K MKV)",
                codec: 'video/x-matroska; codecs="hvc1.2.4.L183.B0"',
                container: "MKV",
                info: "8K HDR in MKV",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="hvc1.2.4.L183.B0"',
                        width: 7680,
                        height: 4320,
                        bitrate: 100000000,
                        framerate: 60,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                    education: {
                        codecBreakdown: {
                            mime: 'video/x-matroska',
                            string: 'hvc1.2.4.L183.B0',
                            parts: [
                                { token: 'hvc1', meaning: 'HEVC, parameter sets in sample entry.' },
                                { token: '2', meaning: 'Main 10 Profile — 10-bit 4:2:0.' },
                                { token: '4', meaning: 'Profile compatibility: Main 10 decoders.' },
                                { token: 'L183', meaning: 'Level 6.1, Main Tier. 183 = 6.1 × 30. Max 7680×4320@60fps, 120 Mbps peak. The 8K broadcast level.' },
                                { token: 'B0', meaning: 'No additional constraints.' }
                            ]
                        },
                        overview: 'HEVC Main 10 at 8K resolution in MKV. Level 6.1 supports 7680×4320@60fps with a 120 Mbps bitrate cap. This is a forward-looking test — 8K HEVC decode requires dedicated hardware (Samsung 8K TVs use a custom MFC decoder). No current browser has both MKV support and 8K HEVC Level 6.x capability. The entry is useful for identifying false positives where a browser reports Level 6.1 support based on codec string parsing without actual hardware verification.',
                        references: [
                            { title: 'ITU-T H.265' },
                            { title: 'ISO/IEC 14496-15 Annex E' }
                        ]
                    }
            },
            {
                name: "HEVC Main 10 (SDR 1080p MKV)",
                codec: 'video/x-matroska; codecs="hvc1.2.4.L120.B0"',
                container: "MKV",
                info: "10-bit SDR in MKV",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="hvc1.2.4.L120.B0"',
                        width: 1920,
                        height: 1080,
                        bitrate: 6000000,
                        framerate: 30
                    }
                },
                    education: {
                        codecBreakdown: {
                            mime: 'video/x-matroska',
                            string: 'hvc1.2.4.L120.B0',
                            parts: [
                                { token: 'hvc1', meaning: 'HEVC, parameter sets in sample entry.' },
                                { token: '2', meaning: 'Main 10 Profile — 10-bit 4:2:0.' },
                                { token: '4', meaning: 'Profile compatibility: Main 10 decoders.' },
                                { token: 'L120', meaning: 'Level 4.0, Main Tier. 120 = 4.0 × 30. Max 2048×1080@30fps, 12 Mbps peak.' },
                                { token: 'B0', meaning: 'No additional constraints.' }
                            ]
                        },
                        overview: 'HEVC Main 10 at 1080p SDR in MKV. This is the most common format for HEVC remuxes of streaming content — 10-bit encoding in Matroska at 1080p. Media servers like Jellyfin and Plex frequently need to decide whether to direct-play or transcode this combination based on the client\'s MKV and Main 10 support. A browser reporting unsupported here while supporting the same codec in MP4 tells the server to remux to MP4 rather than transcode.',
                        references: [
                            { title: 'ITU-T H.265' },
                            { title: 'ISO/IEC 14496-15 Annex E' }
                        ]
                    }
            },
            {
                name: "HEVC Main 10 (4K High Tier MKV)",
                codec: 'video/x-matroska; codecs="hvc1.2.4.H153.B0"',
                container: "MKV",
                info: "High Tier Blu-ray remux",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="hvc1.2.4.H153.B0"',
                        width: 3840,
                        height: 2160,
                        bitrate: 50000000,
                        framerate: 60,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                    education: {
                        codecBreakdown: {
                            mime: 'video/x-matroska',
                            string: 'hvc1.2.4.H153.B0',
                            parts: [
                                { token: 'hvc1', meaning: 'HEVC, parameter sets in sample entry.' },
                                { token: '2', meaning: 'Main 10 Profile — 10-bit 4:2:0.' },
                                { token: '4', meaning: 'Profile compatibility: Main 10 decoders.' },
                                { token: 'H153', meaning: 'Level 5.1, HIGH Tier. H prefix = High Tier (vs L for Main Tier). Same resolution/framerate limits as Main Tier Level 5.1, but the peak bitrate cap is raised from 40 Mbps to 160 Mbps — designed for high-bitrate Blu-ray remuxes.' },
                                { token: 'B0', meaning: 'No additional constraints.' }
                            ]
                        },
                        overview: 'HEVC Main 10 High Tier in MKV — the target format for 4K UHD Blu-ray remuxes. High Tier quadruples the peak bitrate limit compared to Main Tier at the same level (160 Mbps vs 40 Mbps at Level 5.1). UHD Blu-ray discs commonly hit 80-100 Mbps peaks in complex scenes. Some hardware decoders report Level 5.1 support but only for Main Tier — the High Tier bitrate exceeds their buffer model. Combined with the MKV container, this is a demanding test that few browsers pass.',
                        references: [
                            { title: 'ITU-T H.265' },
                            { title: 'ISO/IEC 14496-15 Annex E' }
                        ]
                    }
            }
        ]
    },

    video_dolby_vision: {
        category: "Dolby Vision",
        tests: [
            // Profile 5 (IPT single layer)
            {
                name: "DV Profile 5 (dvh1 MP4)",
                codec: 'video/mp4; codecs="dvh1.05.06"',
                container: "MP4",
                info: "IPT-PQ Single Layer",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="dvh1.05.06"',
                        width: 3840,
                        height: 2160,
                        bitrate: 25000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                                education: {
                    codecBreakdown: {
                        mime: 'video/mp4',
                        string: 'dvh1.05.06',
                        parts: [
                            { token: 'dvh1', meaning: 'Dolby Vision based on HEVC, hvc1-style (parameter sets in sample description). The "dv" prefix marks it as DV, "h1" maps to hvc1. Parallel: dvhe maps to hev1. The container also carries a DOVIDecoderConfigurationRecord (dvcC/dvvC box) with the full DV config — profile, level, RPU flags, enhancement layer flags, and the bl_signal_compatibility_id.' },
                            { token: '05', meaning: 'Profile 5 — single-layer HEVC with IPT-PQ color space. Zero-padded to 2 digits per Dolby spec. IPT-PQ is Dolby\'s proprietary perceptual color space (Intensity, Protan, Tritan axes with PQ transfer). NOT backward-compatible with HDR10 — a non-DV decoder gets garbled colors because IPT-PQ cannot be interpreted as BT.2020.' },
                            { token: '06', meaning: 'Level 6 — supports 3840x2160 @ 24fps. DV levels differ from HEVC levels: DV Level 1 = 1280x720, Level 2 = 1280x720@60, Level 3 = 1920x1080, Level 4 = 1920x1080@60, Level 5 = 1920x1080@120, Level 6 = 3840x2160@24, Level 7 = 3840x2160@30, Level 9 = 3840x2160@60, Level 13 = 7680x4320@60.' }
                        ]
                    },
                    overview: 'Profile 5 was the original Dolby Vision for streaming — Apple TV+ and early Netflix DV content used it. It encodes in IPT-PQ color space, which is perceptually uniform (better for tone-mapping) but means the raw HEVC stream looks wrong on any non-DV decoder. This is why Profile 8 replaced it for most streaming: P8 uses standard BT.2020 PQ (backward-compatible with HDR10), while P5 is DV-only. Safari hides P5 support from canPlayType() — the deliberate API hiding that CodecProbe was built to expose.',
                    platforms: {
                        apple: 'Profile 5 hardware decode on A11+ (iPhone 8+), M1+ Macs, Apple TV 4K. HLS signaling: CODECS="dvh1.05.06" with VIDEO-RANGE=PQ in EXT-X-STREAM-INF. P5 CANNOT use SUPPLEMENTAL-CODECS because there is no HDR10 fallback — the IPT-PQ base layer is DV-only. This means the HLS manifest must serve P5 as a dedicated variant stream, not a supplemental enhancement of an HEVC stream. Apple TV+ catalog P5 content uses separate variant playlists per DV capability.',
                        dolby: 'Dolby\'s reference signaling for P5 differs from P8: in DASH MPD, P5 uses codecs="dvh1.05.06" directly on the AdaptationSet (not supplementalCodecs) because there is no backward-compatible base layer. Compare with P8.1 which uses codecs="hvc1.2.4.L153.B0" supplementalCodecs="dvh1.08.06" — the HEVC base layer serves non-DV clients. P5 cannot do this split because its IPT-PQ color space is unintelligible to standard HEVC decoders. Dolby recommends serving P5 content alongside a separate non-DV AdaptationSet for fallback.',
                        lg: 'webOS 4.0+ (2019 OLEDs) supports Profile 5 natively. The TV\'s DV decoder initializes via the DOVIDecoderConfigurationRecord (dvcC box) in the fMP4 init segment — dv_profile=5, rpu_present_flag=1, bl_present_flag=1, el_present_flag=0. For DASH, webOS reads the dvcC box from the init segment, not the MPD codec string. For HLS, webOS reads the codec string from the m3u8 manifest. webOS 25+ added MKV DV P5 support. The Luna IPC getHdrCapabilities call may return stale results if called before the DV firmware module initializes (the async race condition).',
                        android: 'Profile 5 requires dedicated Dolby Vision hardware — MediaCodec decoder "c2.dolby.dv_hevc.decoder" or "OMX.dolby.hevc.decoder". Available on Pixel 6+ (Tensor), Samsung S21+ (Exynos 2100+), Shield TV Pro. For DASH on Android, ExoPlayer reads the dvcC box from the init segment and the supplementalCodecs from the MPD. However, P5 has no supplementalCodecs path — ExoPlayer must see dvh1.05 in the main codecs field to activate the DV decoder. Devices with only HDR10 hardware cannot fall back because IPT-PQ is not a standard BT.2020 signal.'
                    },
                    references: [
                        { title: 'ETSI TS 103 572' },
                        { title: 'Apple HLS Authoring Spec', url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices' },
                        { title: 'webOS TV AV Formats', url: 'https://webostv.developer.lge.com/develop/specifications/video-audio-250' },
                        { title: 'Android Supported Media Formats', url: 'https://developer.android.com/media/platform/supported-formats' }
                    ]
                }
            },
            {
                name: "DV Profile 5 (dvhe MP4)",
                codec: 'video/mp4; codecs="dvhe.05.06"',
                container: "MP4",
                info: "IPT-PQ Single Layer",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="dvhe.05.06"',
                        width: 3840,
                        height: 2160,
                        bitrate: 25000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                                education: {
                    codecBreakdown: {
                        mime: 'video/mp4',
                        string: 'dvhe.05.06',
                        parts: [
                            { token: 'dvhe', meaning: 'Dolby Vision based on HEVC, hev1-style (parameter sets in-band). Same relationship as hvc1/hev1: dvh1 stores parameter sets in sample entry, dvhe repeats them in each access unit. Apple HLS authoring spec lists dvhe as "use not recommended" — same as hev1.' },
                            { token: '05', meaning: 'Profile 5 — identical DV profile regardless of dvh1 vs dvhe tag.' },
                            { token: '06', meaning: 'Level 6 — 3840x2160 @ 24fps.' }
                        ]
                    },
                    overview: 'The dvh1/dvhe distinction mirrors hvc1/hev1 exactly. Both carry the same DOVIDecoderConfigurationRecord in the container — the dvcC box is identical. The only difference is whether HEVC parameter sets (VPS/SPS/PPS) are stored once in the MP4 sample entry (dvh1) or repeated in-band in each sample (dvhe). Apple prefers dvh1 for HLS because out-of-band parameter sets allow faster segment initialization during adaptive bitrate switching.',
                    references: [
                        { title: 'ETSI TS 103 572' }
                    ]
                }
            },
            {
                name: "DV Profile 5 (MKV webOS 25+)",
                codec: 'video/x-matroska; codecs="dvh1.05.06"',
                container: "MKV",
                info: "LG webOS 25+ support",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="dvh1.05.06"',
                        width: 3840,
                        height: 2160,
                        bitrate: 25000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    "codecBreakdown": {
                        "mime": "video/x-matroska",
                        "string": "dvh1.05.06",
                        "parts": [
                            {
                                "token": "dvh1",
                                "meaning": "DV HEVC with hvc1-style parameter sets. In MKV, this codec string is declared in the CodecID/CodecPrivate fields. MKV stores DV RPU NALUs as BlockAdditions (side data) separate from the main HEVC NALUs — unlike MP4 which stores them inline. This storage difference is why remuxing MKV→fMP4 for HLS requires RPU re-injection into the HEVC bitstream."
                            },
                            {
                                "token": "05",
                                "meaning": "Profile 5 — single-layer IPT-PQ. Same DV profile as the MP4 variant. The MKV container adds BlockAdditionMapping entries with BlockAddIDType matching the dvcC configuration record."
                            },
                            {
                                "token": "06",
                                "meaning": "Level 6 — 3840x2160 @ 24fps maximum."
                            }
                        ]
                    },
                    "overview": "webOS 25 (2025 LG TVs) added MKV Dolby Vision support. Prior webOS versions required DV content in MP4 containers — MKV DV files would play as standard HEVC (losing DV metadata) or fail entirely. The MKV container stores DV RPU in BlockAdditions, which webOS 25 can now parse natively. For Jellyfin/Plex streaming to pre-webOS 25 TVs, the server must remux MKV→fMP4 for HLS delivery, extracting RPU from BlockAdditions and injecting them inline into the HEVC NAL stream.",
                    "platforms": {
                        "lg": "webOS 25+ reads DV configuration from MKV CodecPrivate data and BlockAdditionMapping. The DV decoder initializes from the dvcC record stored in the MKV header. For local USB playback, the built-in player handles this natively. For web app playback (Jellyfin webOS app), MSE processes the MKV-remuxed fMP4 segments. The browser canPlayType for video/x-matroska with dvh1 codec strings returns varying results depending on webOS version — CodecProbe exposes this gap.",
                        "apple": "Apple does not support MKV containers at all — Safari and AVPlayer reject video/x-matroska MIME types. DV P5 MKV files must be remuxed to MP4 or fMP4 for Apple playback.",
                        "android": "ExoPlayer can play DV MKV files on devices with DV hardware (Pixel 6+, Shield TV). MediaCodec extracts the dvcC configuration from MKV CodecPrivate. The c2.dolby.dv_hevc.decoder handles the IPT-PQ decoding."
                    },
                    references: [
                        { title: 'ETSI TS 103 572' }
                    ]
                }
            },
            // Profile 7 (Blu-ray dual layer)
            {
                name: "DV Profile 7 (MEL MP4)",
                codec: 'video/mp4; codecs="dvhe.07.06"',
                container: "MP4",
                info: "Full Enhancement Layer",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="dvhe.07.06"',
                        width: 3840,
                        height: 2160,
                        bitrate: 50000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                                education: {
                    codecBreakdown: {
                        mime: 'video/mp4',
                        string: 'dvhe.07.06',
                        parts: [
                            { token: 'dvhe', meaning: 'Dolby Vision HEVC, hev1-style. Profile 7 uses dvhe because the dual-layer structure requires in-band parameter set signaling for the enhancement layer. The DOVIDecoderConfigurationRecord carries el_present_flag=1, bl_present_flag=1.' },
                            { token: '07', meaning: 'Profile 7 — dual-layer HEVC with a separate Enhancement Layer (EL) track. The base layer (BL) is HDR10-compatible HEVC Main 10, the EL carries additional DV metadata and 12-bit precision data. The EL can be MEL (Minimum Enhancement Layer, ~10% BL bitrate) or FEL (Full Enhancement Layer, up to 100% BL bitrate).' },
                            { token: '06', meaning: 'Level 6 — 3840x2160 @ 24fps. Same DV level numbering as Profile 5.' }
                        ]
                    },
                    overview: 'Profile 7 is the UHD Blu-ray Dolby Vision profile. It stores two HEVC tracks in the container: a base layer (standard HDR10) and an enhancement layer (DV metadata + additional precision). Non-DV players ignore the EL and play the BL as HDR10. DV players combine both layers for the full 12-bit DV experience. The enhancement layer comes in two flavors: MEL (Minimum, ~1-3 Mbps extra) which carries only RPU metadata and minimal coefficients, and FEL (Full, up to 50 Mbps extra) which carries full 12-bit reconstruction data. MEL is more common in streaming rips; FEL is the original disc format. Browser support for Profile 7 is near-zero — it requires a dual-track MP4 parser, which MSE/MediaSource does not support.',
                    platforms: {
                        apple: 'Apple does NOT support Profile 7 in HLS or Safari — there is no way to deliver a dual-track stream over HLS. Profile 7 is for local/disc playback only. Apple TV 4K can play P7 from local files via Infuse or MrMC apps, not via the browser.',
                        lg: 'webOS supports Profile 7 for local USB playback on OLED models (webOS 4.0+). The built-in media player reads both BL and EL tracks from the MP4/MKV container. The browser/web engine does not support P7 — MSE has no mechanism for dual-track DV.',
                        android: 'Shield TV Pro supports Profile 7 via Kodi/Plex for local playback. Browser-based playback is not possible — MediaSource API cannot handle dual-track DV. The MediaCodec DV decoder expects single-track input when used via MSE.'
                    },
                    references: [
                        { title: 'ETSI TS 103 572' },
                        { title: 'Apple HLS Authoring Spec', url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices' },
                        { title: 'webOS TV AV Formats', url: 'https://webostv.developer.lge.com/develop/specifications/video-audio-250' },
                        { title: 'Android Supported Media Formats', url: 'https://developer.android.com/media/platform/supported-formats' }
                    ]
                }
            },
            {
                name: "DV Profile 7 (MEL MKV)",
                codec: 'video/x-matroska; codecs="dvhe.07.06"',
                container: "MKV",
                info: "Blu-ray remux",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="dvhe.07.06"',
                        width: 3840,
                        height: 2160,
                        bitrate: 50000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    "codecBreakdown": {
                        "mime": "video/x-matroska",
                        "string": "dvhe.07.06",
                        "parts": [
                            {
                                "token": "dvhe",
                                "meaning": "DV HEVC with hev1-style in-band parameter sets. Profile 7 uses dvhe because the dual-layer structure benefits from per-sample parameter set signaling for the enhancement layer."
                            },
                            {
                                "token": "07",
                                "meaning": "Profile 7 — dual-layer HEVC. Base layer is HDR10-compatible (BT.2020 PQ), enhancement layer carries DV RPU and additional precision. In MKV, the EL is stored as a separate track or as BlockAdditions depending on the muxer."
                            },
                            {
                                "token": "06",
                                "meaning": "Level 6 — 3840x2160 @ 24fps. UHD Blu-ray standard resolution."
                            }
                        ]
                    },
                    "overview": "Profile 7 MKV files are typically Blu-ray remuxes (disc rips). MKVToolNix stores the enhancement layer as a separate track linked to the base layer via TrackCombinePlanes. The EL can be MEL (Minimum Enhancement Layer, 1-3 Mbps) or FEL (Full Enhancement Layer, up to 50 Mbps). Browser support is zero — MSE cannot handle dual-track DV playback. Media server apps (Jellyfin, Plex) must either strip the EL and serve as P8 (losing DV precision) or transcode entirely.",
                    references: [
                        { title: 'ETSI TS 103 572' }
                    ]
                }
            },
            // Profile 8.1 (HDR10 compatible)
            {
                name: "DV Profile 8.1 (HDR10 base)",
                codec: 'video/mp4; codecs="dvh1.08.06"',
                container: "MP4",
                info: "Cross-compatible HDR10+DV",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="dvh1.08.06"',
                        width: 3840,
                        height: 2160,
                        bitrate: 25000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                                education: {
                    codecBreakdown: {
                        mime: 'video/mp4',
                        string: 'dvh1.08.06',
                        parts: [
                            { token: 'dvh1', meaning: 'Dolby Vision HEVC, hvc1-style. In the MP4 container, this maps to a dvcC (or dvvC) box containing the DOVIDecoderConfigurationRecord — a Dolby-specific binary config with: dv_profile, dv_level, rpu_present_flag, el_present_flag, bl_present_flag, and critically, dv_bl_signal_compatibility_id.' },
                            { token: '08', meaning: 'Profile 8 — single-layer HEVC with standard BT.2020 color space and DV RPU (Reference Processing Unit) NALUs embedded in the HEVC stream. The sub-profile (8.1, 8.2, 8.4) is NOT encoded in the codec string — it is determined by the dv_bl_signal_compatibility_id in the DOVIDecoderConfigurationRecord.' },
                            { token: '06', meaning: 'Level 6 — 3840x2160 @ 24fps. Note: the DV level in the codec string should match the DV level in the DOVIDecoderConfigurationRecord and be consistent with the resolution/framerate of the stream.' }
                        ]
                    },
                    overview: 'Profile 8 is the dominant DV format for streaming. The ".1" in "8.1" is the dv_bl_signal_compatibility_id from the DOVIDecoderConfigurationRecord — NOT part of the codec string. This ID tells the decoder what the base layer is compatible with: 1=HDR10 (PQ+BT.2020), 2=SDR (BT.709), 4=HLG. So P8.1 means the base layer is standard HDR10 that any HDR10 display can show, with optional DV RPU metadata for DV-capable displays. Three layers of signaling coexist: (1) the codec string for browser APIs, (2) the dvcC/dvvC box for hardware decoders, (3) Apple\'s SUPPLEMENTAL-CODECS for HLS adaptive fallback. Apple HLS requires fMP4 container — MPEG-TS is NOT supported for DV or HEVC.',
                    streaming: {
                        hls: {
                            m3u8: `#EXTM3U
#EXT-X-VERSION:7
#EXT-X-INDEPENDENT-SEGMENTS

# Option A: DV-only variant (DV-capable devices only)
#EXT-X-STREAM-INF:BANDWIDTH=15000000,CODECS="dvh1.08.06,mp4a.40.2",RESOLUTION=3840x2160,VIDEO-RANGE=PQ
stream_dv81.m3u8

# Option B: Supplemental codec (DV with HDR10 fallback)
#EXT-X-STREAM-INF:BANDWIDTH=15000000,CODECS="hvc1.2.4.L153.B0,mp4a.40.2",RESOLUTION=3840x2160,VIDEO-RANGE=PQ,SUPPLEMENTAL-CODECS="dvh1.08.06/db1p"
stream_dv81_compat.m3u8

# HDR10 fallback for non-DV devices
#EXT-X-STREAM-INF:BANDWIDTH=12000000,CODECS="hvc1.2.4.L153.B0,mp4a.40.2",RESOLUTION=3840x2160,VIDEO-RANGE=PQ
stream_hdr10.m3u8`,
                            notes: 'Apple HLS requires fMP4 segments (not MPEG-TS) for HEVC and DV. Use dvh1 tag (not dvhe). VIDEO-RANGE=PQ is mandatory for DV content. In SUPPLEMENTAL-CODECS, the /db1p brand means "Dolby Vision backward-compatible PQ" — it cross-checks with VIDEO-RANGE=PQ. The CODECS attribute carries the base layer codec (hvc1 for HDR10), and SUPPLEMENTAL-CODECS carries the DV enhancement. Older HLS clients ignore SUPPLEMENTAL-CODECS and play the HDR10 base.'
                        },
                        dash: {
                            mpd: `<AdaptationSet mimeType="video/mp4" codecs="dvh1.08.06">
  <SupplementalProperty schemeIdUri="urn:dvb:dash:dovi" value="08.06"/>
  <Representation bandwidth="15000000" width="3840" height="2160">
    <SegmentTemplate media="dv_$Number$.m4s" initialization="dv_init.mp4"/>
  </Representation>
</AdaptationSet>`,
                            notes: 'DASH uses urn:dvb:dash:dovi SupplementalProperty. The value "08.06" matches the profile.level from the codec string. DASH does not have an equivalent of Apple\'s SUPPLEMENTAL-CODECS — backward compatibility is handled by the client selecting between AdaptationSets.'
                        }
                    },
                    platforms: {
                        apple: 'Supported on iPhone 12+, iPad Pro M1+, Apple TV 4K (2021+). Apple HLS requires fMP4 container (styp box with msdh or msix brand). Safari hides DV from canPlayType() — returns "" for all dvh1.* strings. But mediaCapabilities with transferFunction:"pq" reveals actual hardware support. Use dvh1 tag exclusively — dvhe is "use not recommended" per Apple authoring spec.',
                        lg: 'webOS 5.0+ supports Profile 8.1 on OLED/QNED models. The DV decoder initializes from the DOVIDecoderConfigurationRecord in the dvcC box — it reads dv_profile=8, bl_signal_compatibility_id=1 to confirm HDR10-compatible base layer. webOS 6.0+ required for MKV DV (earlier versions reject video/x-matroska with dvh1 codecs). Known issue: getSupportedHdrProfiles() may return [] before Luna IPC completes on first page load.',
                        android: 'Requires Android 12+ with Dolby-licensed hardware. The DOVIDecoderConfigurationRecord is passed to MediaCodec via CSD (Codec-Specific Data) buffers during decoder init. MediaCodec reports DV support via the "c2.dolby.dv_hevc.decoder" or "OMX.dolby.hevc.decoder" codec name. Pixel 6+, Samsung S21+ (Exynos with Dolby license), and Shield TV Pro confirmed. ExoPlayer reads the dvcC box and routes to the DV decoder automatically.'
                    },
                    references: [
                        { title: 'ETSI TS 103 572' },
                        { title: 'Dolby Vision Streams Within the HTTP Live Streaming', url: 'https://professionalsupport.dolby.com/s/article/Dolby-Vision-Streams-Within-the-HTTP-Live-Streaming' },
                        { title: 'Dolby Vision Streams Within the MPEG-DASH', url: 'https://professionalsupport.dolby.com/s/article/Dolby-Vision-Streams-Within-the-MPEG-DASH' },
                        { title: 'Apple HLS Authoring Spec', url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices' },
                        { title: 'webOS TV AV Formats', url: 'https://webostv.developer.lge.com/develop/specifications/video-audio-250' },
                        { title: 'Android Supported Media Formats', url: 'https://developer.android.com/media/platform/supported-formats' }
                    ]
                }
            },
            {
                name: "DV Profile 8.1 (MKV)",
                codec: 'video/x-matroska; codecs="dvh1.08.06"',
                container: "MKV",
                info: "Cross-compatible",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="dvh1.08.06"',
                        width: 3840,
                        height: 2160,
                        bitrate: 25000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    "codecBreakdown": {
                        "mime": "video/x-matroska",
                        "string": "dvh1.08.06",
                        "parts": [
                            {
                                "token": "dvh1",
                                "meaning": "DV HEVC, hvc1-style. In MKV, the codec string signals the same DV configuration as the MP4 variant. The dvcC record is stored in MKV CodecPrivate."
                            },
                            {
                                "token": "08",
                                "meaning": "Profile 8 — single-layer HEVC with backward-compatible BT.2020 PQ base layer. Sub-profile 8.1 (bl_signal_compatibility_id=1) means the base layer is HDR10-compatible. Non-DV players decode as standard HDR10."
                            },
                            {
                                "token": "06",
                                "meaning": "Level 6 — 3840x2160 @ 24fps."
                            }
                        ]
                    },
                    "overview": "The most common DV profile in media libraries. MKV P8.1 files play as HDR10 on any HEVC-capable device, with DV enhancement on DV-capable devices. MKV stores the DV RPU in BlockAdditions (MKVToolNix v70+). When Jellyfin remuxes MKV→fMP4 for HLS streaming, FFmpeg extracts RPU from BlockAdditions and injects them inline. The m3u8 master playlist should signal CODECS=\"dvh1.08.06\" for DV-capable clients and CODECS=\"hvc1.2.4.L153.B0\" for HDR10 fallback — but Jellyfin currently signals only hvc1 for both, losing DV activation on client devices.",
                    "platforms": {
                        "lg": "webOS 6+ supports P8.1 MKV natively for local playback. For streaming via Jellyfin webOS app, the fMP4 HLS remux path applies. The m3u8 CODECS string determines whether webOS activates the DV or HDR10 decoder pipeline — wrong signaling means HDR10 playback despite DV data being present in the stream.",
                        "android": "ExoPlayer reads the dvcC record from MKV CodecPrivate and activates the DV decoder if available. Devices without DV hardware fall back to HDR10 using the backward-compatible base layer — this fallback is the entire point of Profile 8."
                    },
                    references: [
                        { title: 'ETSI TS 103 572' }
                    ]
                }
            },
            // Profile 8.4 (HLG compatible)
            {
                name: "DV Profile 8.4 (HLG base)",
                codec: 'video/mp4; codecs="dvhe.08.09"',
                container: "MP4",
                info: "HLG + DV enhancement",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="dvhe.08.09"',
                        width: 3840,
                        height: 2160,
                        bitrate: 25000000,
                        framerate: 24,
                        transferFunction: 'hlg',
                        colorGamut: 'rec2020'
                    }
                },
                                education: {
                    codecBreakdown: {
                        mime: 'video/mp4',
                        string: 'dvhe.08.09',
                        parts: [
                            { token: 'dvhe', meaning: 'Dolby Vision HEVC, hev1-style.' },
                            { token: '08', meaning: 'Profile 8 — single-layer with DV RPU. Sub-profile 8.4 is identified by dv_bl_signal_compatibility_id=4 in the DOVIDecoderConfigurationRecord, not in this codec string.' },
                            { token: '09', meaning: 'Level 9 — 3840x2160 @ 60fps. Higher level than P8.1 entries because HLG broadcast content often targets 50/60fps.' }
                        ]
                    },
                    overview: 'Profile 8.4 uses HLG as the base layer (dv_bl_signal_compatibility_id=4). Non-DV displays show standard HLG content; DV displays apply dynamic tone-mapping from the embedded RPU metadata. This is the broadcast-oriented DV profile — HLG is used for over-the-air HDR in DVB (Europe), ATSC 3.0 (US/Korea), and ISDB (Japan/Brazil). In Apple HLS, P8.4 is signaled as SUPPLEMENTAL-CODECS="dvh1.08.09/db4h" where db4h is the "Dolby Vision backward-compatible HLG" brand. The base CODECS attribute uses hvc1.2.20000000.L153.B0 — note the 20000000 compatibility flag which signals HLG-aware decoders (vs the standard 4 for Main 10).',
                    platforms: {
                        apple: 'Apple uses P8.4 for HLG+DV broadcast content. In HLS: CODECS="hvc1.2.20000000.L153.B0" with SUPPLEMENTAL-CODECS="dvh1.08.01/db4h" and VIDEO-RANGE=HLG. The db4h brand is the cross-check: "4" = HLG compatibility, "h" = HLG. Leaving out either db4h or VIDEO-RANGE=HLG is spec-non-compliant per Apple. Requires fMP4 container.',
                        lg: 'webOS 5.0+ supports P8.4. The LG SoC reads dv_bl_signal_compatibility_id=4 from the dvcC box and initializes the DV decoder in HLG-base mode. LG TVs with built-in DVB-T2 tuners use P8.4 for over-the-air DV broadcasts in supported markets.',
                        android: 'P8.4 support follows the same hardware requirements as P8.1 — the dv_bl_signal_compatibility_id determines base layer handling, not a separate hardware path. Android 13+ added explicit HLG DV support in MediaCodec. ExoPlayer maps P8.4 to the same DV decoder as P8.1.'
                    },
                    references: [
                        { title: 'ETSI TS 103 572' },
                        { title: 'Apple HLS Authoring Spec', url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices' },
                        { title: 'webOS TV AV Formats', url: 'https://webostv.developer.lge.com/develop/specifications/video-audio-250' },
                        { title: 'Android Supported Media Formats', url: 'https://developer.android.com/media/platform/supported-formats' }
                    ]
                }
            },
            // Multi-codec declaration
            {
                name: "DV P5 + HEVC (Multi-codec)",
                codec: 'video/mp4; codecs="hvc1.2.4.L153.B0, dvh1.05.07"',
                container: "MP4",
                info: "Dual codec string",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="hvc1.2.4.L153.B0, dvh1.05.07"',
                        width: 3840,
                        height: 2160,
                        bitrate: 25000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    "codecBreakdown": {
                        "mime": "video/mp4",
                        "string": "hvc1.2.4.L153.B0, dvh1.05.07",
                        "parts": [
                            {
                                "token": "hvc1.2.4.L153.B0",
                                "meaning": "HEVC Main 10, Level 5.1. This is the base HEVC codec declaration. In a multi-codec string, it tells the player the minimum HEVC capability required."
                            },
                            {
                                "token": "dvh1.05.07",
                                "meaning": "DV Profile 5, Level 7 (3840x2160 @ 30fps). Listed as a second codec in the same string. This multi-codec declaration is an alternative way to signal that the MP4 track is both HEVC-decodable and DV-enhanced."
                            }
                        ]
                    },
                    "overview": "Multi-codec strings list both the HEVC base and DV enhancement in a single codecs attribute. This is distinct from DASH supplementalCodecs (which separates them into different XML attributes). The multi-codec approach tests whether the browser can parse and accept both codec identifiers simultaneously. In practice, Profile 5 has NO backward-compatible base — the hvc1 string here is misleading because P5 IPT-PQ cannot be correctly decoded as standard HEVC. This test entry exists to check browser behavior when confronted with a dual codec declaration for a non-backward-compatible DV profile.",
                    references: [
                        { title: 'ETSI TS 103 572' }
                    ]
                }
            },
            // Profile 10 (AV1-based)
            {
                name: "DV Profile 10 (AV1 base)",
                codec: 'video/mp4; codecs="dva1.10.01"',
                container: "MP4",
                info: "Dolby Vision on AV1",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="dva1.10.01"',
                        width: 3840,
                        height: 2160,
                        bitrate: 15000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                                education: {
                    codecBreakdown: {
                        mime: 'video/mp4',
                        string: 'dva1.10.01',
                        parts: [
                            { token: 'dva1', meaning: 'Dolby Vision based on AV1. "dv" = Dolby Vision, "a1" = AV1. The alternative tag dav1 also exists (same relationship as dvh1/dvhe). The container carries a dvvC box (note: dvvC, not dvcC — the newer DV config box version for AV1 and HEVC profile 8+).' },
                            { token: '10', meaning: 'Profile 10 — single-layer AV1 with DV RPU metadata embedded as AV1 metadata OBUs. Similar architecture to P8 (single-layer, backward-compatible) but built on AV1 instead of HEVC. Sub-profiles: 10.1 = HDR10 base (PQ), 10.4 = HLG base — same dv_bl_signal_compatibility_id mapping as P8.' },
                            { token: '01', meaning: 'Level 1 — the DV level system for AV1 profiles is still being defined. Level 01 covers base configurations. In practice, the AV1 codec handles resolution/framerate limits independently via its own level system.' }
                        ]
                    },
                    overview: 'Profile 10 is the future of Dolby Vision — AV1 has no licensing fees (unlike HEVC), making DV+AV1 cheaper to deploy than DV+HEVC. Netflix began testing P10 in 2023. The architecture mirrors Profile 8: single-layer with RPU metadata, backward-compatible with standard AV1 HDR. DV RPU data is carried in AV1 Metadata OBUs (Open Bitstream Units) rather than HEVC NALUs. The dva1/dav1 tag distinction follows the same pattern as dvh1/dvhe: dva1 stores AV1 config in the sample entry, dav1 stores it in-band.',
                    platforms: {
                        apple: 'Profile 10 support is limited to Apple Silicon Macs (M3+) and Apple TV 4K (2022+) with AV1 hardware decode. Older Apple devices lack AV1 hardware entirely. In HLS, P10 would use SUPPLEMENTAL-CODECS="dva1.10.01/db1p" with an AV1 base layer in CODECS, but Apple has not yet published official HLS authoring guidance for DV+AV1.',
                        lg: 'webOS 23+ (2023 models) added AV1 hardware decode, but DV Profile 10 support depends on Dolby firmware updates. LG OLEDs with MediaTek MT9638+ SoCs have the hardware capability. Support is still rolling out — check webOS version specifically.',
                        android: 'Requires SoC with both AV1 hardware decode and Dolby DV license. Qualcomm Snapdragon 8 Gen 2+ and MediaTek Dimensity 9200+ qualify. Samsung Galaxy S24+ and Pixel 8 Pro are early adopters. The MediaCodec decoder name is "c2.dolby.dv_av1.decoder" or similar.'
                    },
                    references: [
                        { title: 'ETSI TS 103 572' },
                        { title: 'Apple HLS Authoring Spec', url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices' },
                        { title: 'webOS TV AV Formats', url: 'https://webostv.developer.lge.com/develop/specifications/video-audio-250' },
                        { title: 'Android Supported Media Formats', url: 'https://developer.android.com/media/platform/supported-formats' }
                    ]
                }
            },
            // Additional DV profiles and supplemental codecs
            {
                name: "DV Profile 4 (hev1 dual layer)",
                codec: 'video/mp4; codecs="dvhe.04.06"',
                container: "MP4",
                info: "Legacy Blu-ray dual layer",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="dvhe.04.06"',
                        width: 3840,
                        height: 2160,
                        bitrate: 50000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                                education: {
                    codecBreakdown: {
                        mime: 'video/mp4',
                        string: 'dvhe.04.06',
                        parts: [
                            { token: 'dvhe', meaning: 'Dolby Vision HEVC, hev1-style.' },
                            { token: '04', meaning: 'Profile 4 — dual-layer with HLG base. The original dual-layer DV format alongside Profile 7. P4 uses HLG transfer in the base layer (vs P7 which uses PQ). el_present_flag=1 in the DOVIDecoderConfigurationRecord. Effectively deprecated — replaced by single-layer Profile 8.4 for HLG content.' },
                            { token: '06', meaning: 'Level 6 — 3840x2160 @ 24fps.' }
                        ]
                    },
                    overview: 'Profile 4 is the legacy dual-layer HLG-based DV format. It required two HEVC tracks (base + enhancement), making it impractical for streaming. Profile 8.4 replaced it by putting the DV metadata into RPU NALUs within a single HEVC track. You will only encounter P4 in early DV Blu-ray discs and archival content. No browser or streaming platform supports P4 — it requires a dual-track container parser that MSE does not provide.',
                    references: [
                        { title: 'ETSI TS 103 572' }
                    ]
                }
            },
            {
                name: "DV Profile 8.2 (SDR base)",
                codec: 'video/mp4; codecs="dvh1.08.02"',
                container: "MP4",
                info: "SDR cross-compatible",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="dvh1.08.02"',
                        width: 3840,
                        height: 2160,
                        bitrate: 20000000,
                        framerate: 24
                    }
                },
                                education: {
                    codecBreakdown: {
                        mime: 'video/mp4',
                        string: 'dvh1.08.02',
                        parts: [
                            { token: 'dvh1', meaning: 'Dolby Vision HEVC, hvc1-style.' },
                            { token: '08', meaning: 'Profile 8 — single-layer with DV RPU metadata. The .2 sub-profile comes from dv_bl_signal_compatibility_id=2 in the DOVIDecoderConfigurationRecord.' },
                            { token: '02', meaning: 'Level 2 — 1280x720 @ 24fps. Note: this is also sometimes seen at higher levels (06, 09) for higher resolutions. The level in the codec string is often mismatched in practice — some encoders use the DV level while others use a generic level.' }
                        ]
                    },
                    overview: 'Profile 8.2 has dv_bl_signal_compatibility_id=2, meaning the base layer is SDR BT.709. Non-DV devices play standard SDR content; DV devices apply the RPU to reconstruct HDR from SDR. This is the "upgrade SDR to HDR" profile — useful for services that want a single encode that looks good on both SDR and HDR displays. Less common than P8.1 because most HDR-capable services already deliver HDR10 as the base layer. No transferFunction or colorGamut in mediaConfig because the base layer is SDR.',
                    references: [
                        { title: 'ETSI TS 103 572' }
                    ]
                }
            },
            {
                name: "DV Profile 8.4 (dvh1 HLG)",
                codec: 'video/mp4; codecs="dvh1.08.09"',
                container: "MP4",
                info: "HLG base with dvh1 tag",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="dvh1.08.09"',
                        width: 3840,
                        height: 2160,
                        bitrate: 25000000,
                        framerate: 24,
                        transferFunction: 'hlg',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    "codecBreakdown": {
                        "mime": "video/mp4",
                        "string": "dvh1.08.09",
                        "parts": [
                            {
                                "token": "dvh1",
                                "meaning": "DV HEVC, hvc1-style with out-of-band parameter sets. The dvh1 tag is the preferred tag for HLS streaming."
                            },
                            {
                                "token": "08",
                                "meaning": "Profile 8 — single-layer backward-compatible. Sub-profile 8.4 (bl_signal_compatibility_id=4) indicates the base layer uses HLG transfer function instead of PQ. HLG content is designed for live broadcast compatibility."
                            },
                            {
                                "token": "09",
                                "meaning": "Level 9 — 3840x2160 @ 60fps. Higher level than the PQ variant because HLG broadcast content often targets 50/60fps."
                            }
                        ]
                    },
                    "overview": "Profile 8.4 with the dvh1 tag. The difference from the dvhe variant (P8.4 dvhe) is parameter set storage only — dvh1 stores VPS/SPS/PPS in the sample entry, dvhe stores them in-band. For HLS delivery, dvh1 is preferred because out-of-band parameter sets allow the player to configure the decoder from the init segment before processing media segments. The HLG base layer means non-DV devices display HLG HDR (common on broadcast TVs) while DV devices apply the full Dolby Vision enhancement.",
                    references: [
                        { title: 'ETSI TS 103 572' }
                    ]
                }
            },
            {
                name: "DV Profile 8.1 (dvhe tag)",
                codec: 'video/mp4; codecs="dvhe.08.06"',
                container: "MP4",
                info: "Explicit BL+EL tag",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="dvhe.08.06"',
                        width: 3840,
                        height: 2160,
                        bitrate: 25000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    "codecBreakdown": {
                        "mime": "video/mp4",
                        "string": "dvhe.08.06",
                        "parts": [
                            {
                                "token": "dvhe",
                                "meaning": "DV HEVC, hev1-style with in-band parameter sets. The hev1 mapping means VPS/SPS/PPS are repeated in each sample. Some muxers (notably older FFmpeg versions) produce dvhe-tagged tracks by default."
                            },
                            {
                                "token": "08",
                                "meaning": "Profile 8 — single-layer backward-compatible. Sub-profile 8.1 (bl_signal_compatibility_id=1) = HDR10 base layer."
                            },
                            {
                                "token": "06",
                                "meaning": "Level 6 — 3840x2160 @ 24fps."
                            }
                        ]
                    },
                    "overview": "dvhe.08.06 and dvh1.08.06 carry identical DV content — the only difference is HEVC parameter set storage. dvhe is less common in streaming because in-band parameter sets add overhead to every fMP4 segment. Apple HLS strongly prefers dvh1. Some browsers accept dvh1 but reject dvhe, or vice versa — this test entry exposes that inconsistency. When Jellyfin produces fMP4 HLS output with -tag:v dvh1, it forces the dvh1 tag regardless of the source container's original tag.",
                    references: [
                        { title: 'ETSI TS 103 572' }
                    ]
                }
            },
            {
                name: "DV Profile 9 (AVC-based)",
                codec: 'video/mp4; codecs="dvav.09.06"',
                container: "MP4",
                info: "H.264 base layer DV",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="dvav.09.06"',
                        width: 1920,
                        height: 1080,
                        bitrate: 8000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                                education: {
                    codecBreakdown: {
                        mime: 'video/mp4',
                        string: 'dvav.09.06',
                        parts: [
                            { token: 'dvav', meaning: 'Dolby Vision based on AVC/H.264. "dv" = Dolby Vision, "av" = AVC. This is the only DV tag that uses an H.264 base layer instead of HEVC. The DOVIDecoderConfigurationRecord still uses a dvcC box, but the base layer decoder is H.264 instead of HEVC.' },
                            { token: '09', meaning: 'Profile 9 — dual-layer AVC with enhancement layer. The base is H.264 High Profile, the EL carries DV metadata. Limited to 1080p because H.264 cannot efficiently encode 4K. Designed for legacy devices that lack HEVC hardware.' },
                            { token: '06', meaning: 'Level 6 — capped at 1080p for AVC-based DV. Higher DV levels (7+) are only available with HEVC or AV1 base codecs.' }
                        ]
                    },
                    overview: 'Profile 9 is the AVC/H.264-based Dolby Vision — a niche format for devices with H.264 hardware but no HEVC decoder. It was briefly used on some early Android TV devices and low-end streaming boxes. Netflix used P9 for DV delivery on older Qualcomm SoCs that had Dolby licensing but only H.264 hardware decode. Resolution capped at 1080p. Effectively obsolete now that HEVC is universal on DV-capable hardware.',
                    references: [
                        { title: 'ETSI TS 103 572' }
                    ]
                }
            },
            // Supplemental codec strings (base + DV enhancement)
            {
                name: "DV P8.1 + HEVC (hvc1 supplemental)",
                codec: 'video/mp4; codecs="hvc1.2.4.L153.B0, dvh1.08.06"',
                container: "MP4",
                info: "HDR10 base + DV metadata",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="hvc1.2.4.L153.B0, dvh1.08.06"',
                        width: 3840,
                        height: 2160,
                        bitrate: 25000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                                education: {
                    codecBreakdown: {
                        mime: 'video/mp4',
                        string: 'hvc1.2.4.L153.B0, dvh1.08.06',
                        parts: [
                            { token: 'hvc1.2.4.L153.B0', meaning: 'The base layer codec — HEVC Main 10, Level 5.1. This is what non-DV decoders play as standard HDR10. The comma-separated dual-codec string tells the browser: "this stream contains both HEVC and DV."' },
                            { token: 'dvh1.08.06', meaning: 'The DV enhancement — Profile 8, Level 6. This tells DV-capable decoders to look for RPU NALUs in the HEVC bitstream and apply DV processing. The dual-codec format tests whether the browser can parse and route both codecs simultaneously.' }
                        ]
                    },
                    overview: 'The dual-codec string (base + DV) tests a different code path than the standalone DV string. Some browsers support "dvh1.08.06" alone but reject "hvc1..., dvh1..." because their codec parser cannot handle comma-separated codecs that reference the same track. In Apple HLS, this maps to the SUPPLEMENTAL-CODECS approach: CODECS="hvc1.2.4.L153.B0" declares the base, SUPPLEMENTAL-CODECS="dvh1.08.06/db1p" declares the DV enhancement with the db1p compatibility brand. The /db1p brand means "Dolby Vision backward-compatible PQ" — Apple requires it as a cross-check with VIDEO-RANGE=PQ. This three-part signaling (codec string + SUPPLEMENTAL-CODECS + VIDEO-RANGE) is Apple-specific — Dolby\'s own spec and DASH use simpler approaches.',
                    platforms: {
                        apple: 'Apple HLS uses SUPPLEMENTAL-CODECS="dvh1.08.06/db1p" instead of putting both codecs in CODECS. The browser API test with both codecs in a single string is NOT how Apple delivers DV — it is a direct codec capability query. Safari may reject this dual-string format even on DV-capable hardware.',
                        lg: 'webOS parses the dual-codec string from the container\'s DOVIDecoderConfigurationRecord, not from the codec string in the browser API. The browser test with dual codecs checks MSE/MediaSource parsing, which may differ from native media player behavior.',
                        android: 'ExoPlayer and Android MediaCodec handle dual-codec DV by reading the dvcC/dvvC box during track selection, then routing to the DV decoder. The dual-codec browser test checks whether the browser\'s MSE implementation can parse a comma-separated codec list — Chrome on Android typically handles this correctly.'
                    },
                    references: [
                        { title: 'ETSI TS 103 572' },
                        { title: 'Apple HLS Authoring Spec', url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices' },
                        { title: 'webOS TV AV Formats', url: 'https://webostv.developer.lge.com/develop/specifications/video-audio-250' },
                        { title: 'Android Supported Media Formats', url: 'https://developer.android.com/media/platform/supported-formats' }
                    ]
                }
            },
            {
                name: "DV P8.1 + HEVC (hev1 supplemental)",
                codec: 'video/mp4; codecs="hev1.2.4.L153.B0, dvh1.08.06"',
                container: "MP4",
                info: "hev1 base + DV metadata",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="hev1.2.4.L153.B0, dvh1.08.06"',
                        width: 3840,
                        height: 2160,
                        bitrate: 25000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    "codecBreakdown": {
                        "mime": "video/mp4",
                        "string": "hev1.2.4.L153.B0, dvh1.08.06",
                        "parts": [
                            {
                                "token": "hev1.2.4.L153.B0",
                                "meaning": "HEVC Main 10 Level 5.1, hev1-style (in-band parameter sets). The base layer codec declaration."
                            },
                            {
                                "token": "dvh1.08.06",
                                "meaning": "DV Profile 8.1, Level 6. The supplemental DV codec. Listed alongside the base HEVC codec to signal dual-decode capability."
                            }
                        ]
                    },
                    "overview": "Tests the hev1 base layer variant of the supplemental codec declaration. The hvc1 version (hvc1 + dvh1) is the more common pairing in production. Using hev1 as the base is less standard — most HLS and DASH implementations pair hvc1 with dvh1. This test checks if browsers treat hev1+dvh1 differently from hvc1+dvh1 in multi-codec parsing.",
                    references: [
                        { title: 'ETSI TS 103 572' }
                    ]
                }
            },
            {
                name: "DV Profile 10 (dav1 tag)",
                codec: 'video/mp4; codecs="dav1.10.01"',
                container: "MP4",
                info: "Alternative AV1 DV tag",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="dav1.10.01"',
                        width: 3840,
                        height: 2160,
                        bitrate: 15000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    "codecBreakdown": {
                        "mime": "video/mp4",
                        "string": "dav1.10.01",
                        "parts": [
                            {
                                "token": "dav1",
                                "meaning": "Dolby Vision AV1. The \"da\" prefix marks DV, \"v1\" maps to av01 (AV1). Parallel to dvh1/dvhe for HEVC — dav1 is the AV1-specific DV codec tag. The dvcC box in the container carries dv_profile=10 with the AV1 base layer configuration."
                            },
                            {
                                "token": "10",
                                "meaning": "Profile 10 — AV1-based Dolby Vision. Single-layer, backward-compatible with AV1 HDR10. The base layer uses BT.2020 PQ (like P8.1 for HEVC), so non-DV AV1 decoders produce HDR10 output."
                            },
                            {
                                "token": "01",
                                "meaning": "Level 1 — HD resolution @ 24fps. AV1 DV levels differ from HEVC DV levels. Currently only a few levels are defined for Profile 10."
                            }
                        ]
                    },
                    "overview": "dav1 is the alternative codec tag for AV1-based Dolby Vision (Profile 10). The primary tag is dva1 (which maps to av01 like dav1 maps differently in some implementations). The distinction parallels dvh1/dvhe — dav1 and dva1 may differ in parameter set handling, though the AV1 bitstream format makes this less relevant than for HEVC. Testing both tags reveals which browsers implement each variant of the AV1 DV codec registry.",
                    references: [
                        { title: 'ETSI TS 103 572' }
                    ]
                }
            },
            {
                name: "DV Profile 5 (Level 09 4K 60fps)",
                codec: 'video/mp4; codecs="dvh1.05.09"',
                container: "MP4",
                info: "IPT-PQ 60fps",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="dvh1.05.09"',
                        width: 3840,
                        height: 2160,
                        bitrate: 40000000,
                        framerate: 60,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    "codecBreakdown": {
                        "mime": "video/mp4",
                        "string": "dvh1.05.09",
                        "parts": [
                            {
                                "token": "dvh1",
                                "meaning": "DV HEVC, hvc1-style."
                            },
                            {
                                "token": "05",
                                "meaning": "Profile 5 — single-layer IPT-PQ. Same non-backward-compatible profile as Level 6, but at a higher framerate capability."
                            },
                            {
                                "token": "09",
                                "meaning": "Level 9 — 3840x2160 @ 60fps. This doubles the decode throughput requirement compared to Level 6 (@ 24fps). DV Level 9 demands significantly more processing power — some devices that support P5 L6 cannot sustain P5 L9 in hardware."
                            }
                        ]
                    },
                    "overview": "Tests DV Profile 5 at the high-framerate Level 9. Most DV P5 content is 24fps film (Level 6), but gaming captures and sports content may target 60fps. The level increase from 06→09 roughly doubles the pixel throughput. Devices that report P5 L6 support may fail L9 — this test distinguishes between \"supports DV P5\" and \"supports DV P5 at high framerates.\" Apple devices generally support L9 on A15+ chips; earlier A11-A14 chips max out at L6-L7.",
                    references: [
                        { title: 'ETSI TS 103 572' }
                    ]
                }
            },
            {
                name: "DV Profile 7 (dvh1 MEL MP4)",
                codec: 'video/mp4; codecs="dvh1.07.06"',
                container: "MP4",
                info: "MEL dual layer dvh1 tag",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="dvh1.07.06"',
                        width: 3840,
                        height: 2160,
                        bitrate: 30000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    "codecBreakdown": {
                        "mime": "video/mp4",
                        "string": "dvh1.07.06",
                        "parts": [
                            {
                                "token": "dvh1",
                                "meaning": "DV HEVC, hvc1-style. Profile 7 with the dvh1 tag (vs dvhe in the other P7 entry). The dvh1 tag indicates out-of-band parameter sets for the base layer."
                            },
                            {
                                "token": "07",
                                "meaning": "Profile 7 — dual-layer HEVC. MEL (Minimum Enhancement Layer) variant where the EL carries only RPU metadata and minimal reconstruction coefficients (~1-3 Mbps overhead)."
                            },
                            {
                                "token": "06",
                                "meaning": "Level 6 — 3840x2160 @ 24fps."
                            }
                        ]
                    },
                    "overview": "Tests the dvh1 tag variant of Profile 7. The other P7 entry uses dvhe.07.06 — this tests dvh1.07.06. Some Blu-ray remux tools produce dvh1-tagged P7 tracks while others produce dvhe. The practical difference is minimal for local playback, but browser API responses may differ. Browser support for P7 is near-zero in either tag variant because MSE cannot handle dual-track playback.",
                    references: [
                        { title: 'ETSI TS 103 572' }
                    ]
                }
            },
            {
                name: "DV P8.4 + HEVC (HLG supplemental MP4)",
                codec: 'video/mp4; codecs="hvc1.2.4.L153.B0, dvhe.08.09"',
                container: "MP4",
                info: "HLG base + DV enhancement",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="hvc1.2.4.L153.B0, dvhe.08.09"',
                        width: 3840,
                        height: 2160,
                        bitrate: 25000000,
                        framerate: 24,
                        transferFunction: 'hlg',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    overview: 'HLG+DV supplemental is the broadcast variant. In Apple HLS: CODECS="hvc1.2.20000000.L153.B0" (note the 20000000 compatibility flag for HLG) with SUPPLEMENTAL-CODECS="dvh1.08.01/db4h" and VIDEO-RANGE=HLG. The db4h brand means "Dolby Vision backward-compatible HLG" — the "4" maps to dv_bl_signal_compatibility_id=4, and "h" denotes HLG. This differs from the PQ variant which uses db1p (compatibility_id=1, PQ). Apple requires all three attributes (CODECS, SUPPLEMENTAL-CODECS with brand, VIDEO-RANGE) to be consistent — mismatches are spec violations.',
                    references: [
                        { title: 'ETSI TS 103 572' }
                    ]
                }
            },
            {
                name: "DV P10 + AV1 (supplemental MP4)",
                codec: 'video/mp4; codecs="av01.0.08M.10, dav1.10.01"',
                container: "MP4",
                info: "AV1 base + DV enhancement",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="av01.0.08M.10, dav1.10.01"',
                        width: 3840,
                        height: 2160,
                        bitrate: 20000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                                education: {
                    codecBreakdown: {
                        mime: 'video/mp4',
                        string: 'av01.0.08M.10, dav1.10.01',
                        parts: [
                            { token: 'av01.0.08M.10', meaning: 'AV1 Main Profile, Level 4.0, Main Tier, 10-bit. This is the base layer — standard AV1 HDR that any AV1 decoder can play. See the AV1 section for a full breakdown of the AV1 codec string format.' },
                            { token: 'dav1.10.01', meaning: 'Dolby Vision Profile 10, Level 1, using the dav1 tag (AV1 with in-band config, parallel to dvhe for HEVC). The DV RPU is carried in AV1 Metadata OBUs. dav1 vs dva1 follows the same in-band vs out-of-band pattern as dvhe vs dvh1.' }
                        ]
                    },
                    overview: 'DV+AV1 supplemental tests whether the browser can handle dual-codec AV1+DV strings. This is the newest DV delivery format — AV1 has no patent royalties (Alliance for Open Media), so DV+AV1 reduces per-stream licensing costs compared to DV+HEVC. Netflix and YouTube are the primary adopters. The DV RPU data rides in AV1 Metadata OBUs (type METADATA_TYPE_ITUT_T35 with Dolby country code), which is architecturally different from HEVC where RPUs are NALU type 62 (unregistered SEI).',
                    references: [
                        { title: 'ETSI TS 103 572' }
                    ]
                }
            },
            // MOV DV coverage (Apple QuickTime)
            {
                name: "DV Profile 5 (dvh1 MOV)",
                codec: 'video/quicktime; codecs="dvh1.05.06"',
                container: "MOV",
                info: "IPT-PQ in QuickTime",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/quicktime; codecs="dvh1.05.06"',
                        width: 3840,
                        height: 2160,
                        bitrate: 25000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    "codecBreakdown": {
                        "mime": "video/quicktime",
                        "string": "dvh1.05.06",
                        "parts": [
                            {
                                "token": "dvh1",
                                "meaning": "DV HEVC in QuickTime container. MOV and MP4 share the ISO BMFF structure, so the dvcC box and sample entry are identical. The MIME type difference (video/quicktime vs video/mp4) is the only distinction at the container level."
                            },
                            {
                                "token": "05",
                                "meaning": "Profile 5 — single-layer IPT-PQ."
                            },
                            {
                                "token": "06",
                                "meaning": "Level 6 — 3840x2160 @ 24fps."
                            }
                        ]
                    },
                    "overview": "DV Profile 5 in Apple QuickTime container. MOV is Apple's native container format and predates MP4 (which is derived from MOV). Safari and Apple native apps may prefer MOV over MP4 for local playback. For DV specifically, the container format (MOV vs MP4) makes no difference to the DV decoder — the dvcC box, RPU NALUs, and HEVC bitstream are identical. This test checks whether browsers that support DV P5 in MP4 also accept the QuickTime MIME type.",
                    references: [
                        { title: 'ETSI TS 103 572' }
                    ]
                }
            },
            {
                name: "DV Profile 8.1 (dvh1 MOV)",
                codec: 'video/quicktime; codecs="dvh1.08.06"',
                container: "MOV",
                info: "HDR10 base DV in QuickTime",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/quicktime; codecs="dvh1.08.06"',
                        width: 3840,
                        height: 2160,
                        bitrate: 25000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    "codecBreakdown": {
                        "mime": "video/quicktime",
                        "string": "dvh1.08.06",
                        "parts": [
                            {
                                "token": "dvh1",
                                "meaning": "DV HEVC in QuickTime container."
                            },
                            {
                                "token": "08",
                                "meaning": "Profile 8.1 — HDR10-compatible base layer."
                            },
                            {
                                "token": "06",
                                "meaning": "Level 6 — 3840x2160 @ 24fps."
                            }
                        ]
                    },
                    "overview": "DV Profile 8.1 in QuickTime/MOV container. iPhone camera recordings in Dolby Vision (iPhone 12+) are natively captured as MOV files with DV Profile 8.4 (HLG base). This test uses P8.1 (HDR10 base) in MOV — less common in practice but valid per the spec. The MOV container is relevant for iPhone-to-Mac workflows where files stay in Apple's ecosystem without remuxing to MP4.",
                    references: [
                        { title: 'ETSI TS 103 572' }
                    ]
                }
            },
            // MKV DV coverage
            {
                name: "DV Profile 8.4 (MKV)",
                codec: 'video/x-matroska; codecs="dvhe.08.09"',
                container: "MKV",
                info: "HLG DV in Matroska",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="dvhe.08.09"',
                        width: 3840,
                        height: 2160,
                        bitrate: 25000000,
                        framerate: 24,
                        transferFunction: 'hlg',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    "codecBreakdown": {
                        "mime": "video/x-matroska",
                        "string": "dvhe.08.09",
                        "parts": [
                            {
                                "token": "dvhe",
                                "meaning": "DV HEVC, hev1-style with in-band parameter sets. In MKV, the dvhe tag indicates the BlockAdditionMapping type for DV RPU storage."
                            },
                            {
                                "token": "08",
                                "meaning": "Profile 8 sub-profile 4 (bl_signal_compatibility_id=4) — HLG backward-compatible base layer. Non-DV players decode as HLG HDR."
                            },
                            {
                                "token": "09",
                                "meaning": "Level 9 — 3840x2160 @ 60fps. Higher level for broadcast-origin HLG content."
                            }
                        ]
                    },
                    "overview": "HLG-based DV Profile 8.4 in MKV container. This combination appears in broadcast recordings and some streaming rips where the source used HLG transfer function. The HLG base layer provides backward compatibility with broadcast HDR TVs (which widely support HLG), while the DV RPU adds dynamic metadata for scene-by-scene tone mapping on DV displays. Less common than P8.1 (HDR10 base) in media libraries.",
                    references: [
                        { title: 'ETSI TS 103 572' }
                    ]
                }
            },
            // MKV Dolby Vision coverage
            {
                name: "DV Profile 5 (dvhe MKV)",
                codec: 'video/x-matroska; codecs="dvhe.05.06"',
                container: "MKV",
                info: "IPT-PQ dvhe tag in MKV",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="dvhe.05.06"',
                        width: 3840,
                        height: 2160,
                        bitrate: 25000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    "codecBreakdown": {
                        "mime": "video/x-matroska",
                        "string": "dvhe.05.06",
                        "parts": [
                            {
                                "token": "dvhe",
                                "meaning": "DV HEVC, hev1-style. The dvhe tag in MKV indicates in-band parameter sets. Some MKV muxers default to dvhe when remuxing from sources that originally used hev1-style HEVC."
                            },
                            {
                                "token": "05",
                                "meaning": "Profile 5 — single-layer IPT-PQ."
                            },
                            {
                                "token": "06",
                                "meaning": "Level 6 — 3840x2160 @ 24fps."
                            }
                        ]
                    },
                    "overview": "Tests the dvhe tag variant of DV Profile 5 in MKV. The dvh1 MKV variant tests whether webOS 25+ recognizes dvh1-tagged MKV DV — this entry tests the dvhe tag. Some browsers and devices may accept one tag but not the other for the same profile in MKV. The dvh1/dvhe distinction is especially important for Jellyfin remux: when the source MKV uses dvhe but the fMP4 output is tagged dvh1 (via -tag:v dvh1), the RPU content is identical — only the parameter set delivery changes.",
                    references: [
                        { title: 'ETSI TS 103 572' }
                    ]
                }
            },
            {
                name: "DV Profile 8.1 (dvhe MKV)",
                codec: 'video/x-matroska; codecs="dvhe.08.06"',
                container: "MKV",
                info: "HDR10 base dvhe in MKV",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="dvhe.08.06"',
                        width: 3840,
                        height: 2160,
                        bitrate: 25000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    "codecBreakdown": {
                        "mime": "video/x-matroska",
                        "string": "dvhe.08.06",
                        "parts": [
                            {
                                "token": "dvhe",
                                "meaning": "DV HEVC, hev1-style in MKV container."
                            },
                            {
                                "token": "08",
                                "meaning": "Profile 8.1 — HDR10-compatible base layer."
                            },
                            {
                                "token": "06",
                                "meaning": "Level 6 — 3840x2160 @ 24fps."
                            }
                        ]
                    },
                    "overview": "P8.1 with dvhe tag in MKV. Tests the same DV profile as \"DV Profile 8.1 (MKV)\" (which uses dvh1) but with the alternate hev1-style tag. In practice, the DV decoder behavior is identical — the distinction only affects HEVC parameter set delivery. Comparing results between dvh1 and dvhe MKV entries reveals whether the browser's MKV parser treats these tags differently.",
                    references: [
                        { title: 'ETSI TS 103 572' }
                    ]
                }
            },
            {
                name: "DV Profile 8.2 (SDR MKV)",
                codec: 'video/x-matroska; codecs="dvh1.08.02"',
                container: "MKV",
                info: "SDR cross-compatible in MKV",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="dvh1.08.02"',
                        width: 3840,
                        height: 2160,
                        bitrate: 20000000,
                        framerate: 24
                    }
                },
                education: {
                    "codecBreakdown": {
                        "mime": "video/x-matroska",
                        "string": "dvh1.08.02",
                        "parts": [
                            {
                                "token": "dvh1",
                                "meaning": "DV HEVC, hvc1-style in MKV."
                            },
                            {
                                "token": "08",
                                "meaning": "Profile 8 sub-profile 2 (bl_signal_compatibility_id=2) — SDR backward-compatible base layer. Non-DV players decode as standard SDR BT.709. This is unique among P8 sub-profiles: the base layer is SDR, not HDR."
                            },
                            {
                                "token": "02",
                                "meaning": "Level 2 — 1280x720 @ 60fps. Lower level because SDR base content is typically lower resolution."
                            }
                        ]
                    },
                    "overview": "Profile 8.2 is the SDR-compatible DV variant. The base layer uses BT.709 SDR — completely standard definition color and transfer. The DV RPU carries metadata that allows DV displays to reconstruct a wider dynamic range image from the SDR base. This enables DV content delivery over SDR-only infrastructure (broadcast chains that strip HDR metadata). Rare in media libraries — mostly used in broadcast and cable TV applications.",
                    references: [
                        { title: 'ETSI TS 103 572' }
                    ]
                }
            },
            {
                name: "DV Profile 9 (AVC MKV)",
                codec: 'video/x-matroska; codecs="dvav.09.06"',
                container: "MKV",
                info: "H.264 DV in MKV",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="dvav.09.06"',
                        width: 1920,
                        height: 1080,
                        bitrate: 8000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    "codecBreakdown": {
                        "mime": "video/x-matroska",
                        "string": "dvav.09.06",
                        "parts": [
                            {
                                "token": "dvav",
                                "meaning": "Dolby Vision AVC (H.264-based). The \"dv\" prefix marks DV, \"av\" maps to AVC/H.264. This is the only DV profile based on AVC instead of HEVC or AV1."
                            },
                            {
                                "token": "09",
                                "meaning": "Profile 9 — AVC-based single-layer DV with backward-compatible SDR base layer (bl_signal_compatibility_id=2). The AVC base layer provides maximum device compatibility — virtually every device can decode H.264."
                            },
                            {
                                "token": "06",
                                "meaning": "Level 6 — 3840x2160 @ 24fps (constrained by AVC Level 5.1-5.2)."
                            }
                        ]
                    },
                    "overview": "DV Profile 9 in MKV uses AVC (H.264) as the base codec instead of HEVC. This provides the widest possible backward compatibility — any device that plays H.264 can show the SDR base layer. The DV RPU enhances the image on DV-capable displays. Profile 9 is rare: it sacrifices compression efficiency (AVC is ~50% less efficient than HEVC) for universal base-layer compatibility. Used in some early DV streaming experiments and cable TV deployments.",
                    references: [
                        { title: 'ETSI TS 103 572' }
                    ]
                }
            },
            {
                name: "DV Profile 10 (AV1 MKV)",
                codec: 'video/x-matroska; codecs="dva1.10.01"',
                container: "MKV",
                info: "AV1 DV in MKV",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="dva1.10.01"',
                        width: 3840,
                        height: 2160,
                        bitrate: 15000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    "codecBreakdown": {
                        "mime": "video/x-matroska",
                        "string": "dva1.10.01",
                        "parts": [
                            {
                                "token": "dva1",
                                "meaning": "Dolby Vision AV1, primary tag. dva1 is to AV1 what dvh1 is to HEVC — the DV codec tag for AV1-based content. The \"a1\" maps to AV1."
                            },
                            {
                                "token": "10",
                                "meaning": "Profile 10 — AV1-based single-layer DV with backward-compatible HDR10 base. The AV1 base layer uses BT.2020 PQ, providing HDR10 fallback on non-DV AV1 decoders."
                            },
                            {
                                "token": "01",
                                "meaning": "Level 1 — currently defined for HD resolution. AV1 DV level definitions are newer and less extensive than HEVC DV levels."
                            }
                        ]
                    },
                    "overview": "DV Profile 10 in MKV container using the dva1 tag. AV1-based DV is the newest DV profile, combining AV1's superior compression efficiency with DV dynamic metadata. The MKV container stores AV1 DV RPU similarly to HEVC DV — as BlockAdditions in modern MKVToolNix. Browser support depends on both AV1 decode capability and DV firmware — Chrome supports AV1 widely but DV activation requires platform-level DV hardware. Android TV devices with AV1 hardware decode (Chromecast with Google TV 4K) are early adopters.",
                    references: [
                        { title: 'ETSI TS 103 572' }
                    ]
                }
            },
            {
                name: "DV P8.1 + HEVC (supplemental MKV)",
                codec: 'video/x-matroska; codecs="hvc1.2.4.L153.B0, dvh1.08.06"',
                container: "MKV",
                info: "HDR10+DV dual codec in MKV",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="hvc1.2.4.L153.B0, dvh1.08.06"',
                        width: 3840,
                        height: 2160,
                        bitrate: 25000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    "codecBreakdown": {
                        "mime": "video/x-matroska",
                        "string": "hvc1.2.4.L153.B0, dvh1.08.06",
                        "parts": [
                            {
                                "token": "hvc1.2.4.L153.B0",
                                "meaning": "HEVC Main 10, Level 5.1. The backward-compatible HDR10 base layer codec, declared first in the multi-codec string."
                            },
                            {
                                "token": "dvh1.08.06",
                                "meaning": "DV Profile 8.1, Level 6. The DV enhancement, listed as a supplemental codec. In MKV, this multi-codec string tests whether the browser's Matroska parser supports dual-codec declarations."
                            }
                        ]
                    },
                    "overview": "Multi-codec declaration of P8.1 + HEVC base layer in MKV container. This parallels the MP4 supplemental entries but in Matroska. The practical test: does the browser accept a dual-codec string for video/x-matroska? Most browsers parse the codec string left-to-right — some accept only the first codec, others parse both. This reveals whether MKV DV content can use supplemental codec signaling or must rely on the container-level dvcC record for DV detection.",
                    references: [
                        { title: 'ETSI TS 103 572' }
                    ]
                }
            },
            {
                name: "DV Profile 5 (dvc1 deprecated)",
                codec: 'video/mp4; codecs="dvc1.05.06"',
                container: "MP4",
                info: "Early deprecated FourCC for DV Profile 5",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="dvc1.05.06"',
                        width: 3840,
                        height: 2160,
                        bitrate: 25000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: 'video/mp4',
                        string: 'dvc1.05.06',
                        parts: [
                            { token: 'dvc1', meaning: 'Dolby Vision HEVC — early deprecated FourCC from pre-standardization era (2017–2018). Predates the dvh1 (HVCC) / dvhe (Annex B) split that became the official naming convention.' },
                            { token: '05', meaning: 'Profile 5 — proprietary IPTPQc2 color space, no HDR10 fallback. Without the RPU metadata (NAL 62), colors render as unwatchable green/purple.' },
                            { token: '06', meaning: 'Level 06 — max 3840×2160@24fps, 36 Mbps peak bitrate.' }
                        ]
                    },
                    overview: "A deprecated FourCC for Dolby Vision Profile 5 from early implementations before Dolby finalized the dvh1/dvhe naming convention. The dvc1 tag appeared in prototype hardware and some 2017-era test content but was never widely adopted. No modern browser, player, or TV firmware recognizes this tag — it universally returns unsupported. Included to verify that browsers cleanly reject unknown codec tags rather than crashing or returning false positives.",
                    references: [
                        { title: 'ETSI TS 103 572' },
                        { title: 'Dolby Vision Streams Within the ISO BMFF' }
                    ]
                }
            },
            {
                name: "DV Profile 5 (dvhp OMAF/VR)",
                codec: 'video/mp4; codecs="dvhp.05.06"',
                container: "MP4",
                info: "Dolby Vision in OMAF (VR/360°)",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="dvhp.05.06"',
                        width: 3840,
                        height: 2160,
                        bitrate: 40000000,
                        framerate: 30,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: 'video/mp4',
                        string: 'dvhp.05.06',
                        parts: [
                            { token: 'dvhp', meaning: 'Dolby Vision HEVC for OMAF — Omnidirectional Media Format (ISO/IEC 23090-2). The "p" distinguishes this from standard dvh1/dvhe by signaling the sample entry includes projection and rotation metadata for VR/360° content.' },
                            { token: '05', meaning: 'Profile 5 — proprietary IPTPQc2 color space. In VR contexts, the per-pixel IPTPQc2 reshaping is critical because VR headsets have non-uniform brightness across the lens.' },
                            { token: '06', meaning: 'Level 06 — max 3840×2160@24fps. VR content often uses higher bitrates (40+ Mbps) due to equirectangular projection overhead.' }
                        ]
                    },
                    overview: "Dolby Vision carried in OMAF (Omnidirectional Media Format) for VR and 360° video. The dvhp FourCC signals DV-HEVC within ISO/IEC 23090-2 containers where the sample entry includes spatial metadata (projection type, rotation, region-of-interest) alongside the DV RPU. This is distinct from standard dvh1 because OMAF parsers expect additional boxes in the sample description. Extremely niche — limited to high-end VR production pipelines and Meta Quest Pro-class devices. No browser supports this tag.",
                    references: [
                        { title: 'ETSI TS 103 572' },
                        { title: 'ISO/IEC 23090-2' },
                        { title: 'Dolby Vision Streams Within the ISO BMFF' }
                    ]
                }
            }
        ]
    },

    video_av1: {
        category: "AV1",
        tests: [
            // SDR variants
            {
                name: "AV1 Main (SDR 1080p MP4)",
                codec: 'video/mp4; codecs="av01.0.05M.08"',
                container: "MP4",
                info: "8-bit SDR",
                                education: {
                    codecBreakdown: {
                        mime: 'video/mp4',
                        parts: [
                            { token: 'av01', meaning: 'AV1 codec in ISOBMFF container (ISO 14496-12 Annex E)' },
                            { token: '0', meaning: 'Profile 0 (Main) — 4:2:0 chroma subsampling, 8 or 10-bit' },
                            { token: '05M', meaning: 'Level 3.1 Main tier — up to 1920x1080 @ 30fps, 10 Mbps max' },
                            { token: '08', meaning: '8-bit color depth (luma and chroma sample bit depth)' }
                        ]
                    },
                    overview: 'AV1 uses a 4-token mandatory codec string: av01.{profile}.{levelTier}.{bitDepth}. Unlike HEVC which packs compatibility flags and constraints into the string, AV1 keeps the mandatory portion minimal. Optional tokens 5-10 can specify monochrome flag, chroma subsampling (110=4:2:0, 100=4:2:2, 000=4:4:4), color primaries, transfer characteristics, matrix coefficients, and full range flag per ISO 23091-2. Browsers accept the short 4-token form and infer defaults.',
                    platforms: {
                        apple: 'Hardware decode on A17 Pro+ (iPhone 15 Pro) and M3+ Macs. Software decode via VideoToolbox on M1/M2/A14-A16. Safari 17+ supports AV1 in MP4 and WebM. HLS AV1 requires fMP4 segments with CODECS="av01..." in the master playlist.',
                        android: 'Hardware decode varies by SoC: Snapdragon 8 Gen 1+ (2022), MediaTek Dimensity 1000+ (2020), Exynos 2200+ (2022). Software decode via dav1d library on Android 10+. MediaCodec.getCodecInfo() distinguishes hardware vs software decoders.',
                        lg: 'AV1 hardware decode on webOS 6.0+ (2021 TVs with MediaTek MT9638). Supports DASH and WebM containers for AV1 content. 4K AV1 decode on C1/G1 and newer models.'
                    },
                    references: [
                        { title: 'AV1 Bitstream & Decoding Process Spec', url: 'https://aomediacodec.github.io/av1-spec/' },
                        { title: 'AV1 Codec ISO Media File Format Binding', url: 'https://aomediacodec.github.io/av1-isobmff/' },
                        { title: 'Apple HLS Authoring Spec', url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices' },
                        { title: 'webOS TV AV Formats', url: 'https://webostv.developer.lge.com/develop/specifications/video-audio-250' },
                        { title: 'Android Supported Media Formats', url: 'https://developer.android.com/media/platform/supported-formats' }
                    ]
                },
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="av01.0.05M.08"',
                        width: 1920,
                        height: 1080,
                        bitrate: 3000000,
                        framerate: 24
                    }
                }
            },
            {
                name: "AV1 Main (SDR 1080p WebM)",
                codec: 'video/webm; codecs="av01.0.05M.08"',
                container: "WebM",
                info: "8-bit SDR",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/webm; codecs="av01.0.05M.08"',
                        width: 1920,
                        height: 1080,
                        bitrate: 3000000,
                        framerate: 24
                    }
                }
            },
            // HDR10 variants
            {
                name: "AV1 Main (HDR10 4K MP4)",
                codec: 'video/mp4; codecs="av01.0.08M.10"',
                container: "MP4",
                info: "10-bit HDR10",
                                education: {
                    codecBreakdown: {
                        mime: 'video/mp4',
                        parts: [
                            { token: 'av01', meaning: 'AV1 codec identifier' },
                            { token: '0', meaning: 'Profile 0 (Main) — 4:2:0, supports 8-bit and 10-bit' },
                            { token: '08M', meaning: 'Level 4.0 Main tier — up to 4096x2176 @ 30fps, 20 Mbps max' },
                            { token: '10', meaning: '10-bit depth — required for HDR10 (PQ/BT.2020)' }
                        ]
                    },
                    overview: 'HDR10 signaling in AV1 differs from HEVC: the codec string itself does not encode transfer function or color gamut. Instead, HDR metadata lives in the AV1 bitstream OBU (color_config in sequence_header) and in the mediaCapabilities API request via transferFunction and colorGamut parameters. The same codec string "av01.0.08M.10" is used for both SDR 10-bit and HDR10 — the browser distinguishes them based on the mediaConfig properties.',
                    platforms: {
                        apple: 'AV1 HDR10 decode on A17 Pro+ and M3+. Safari passes transferFunction:"pq" to mediaCapabilities correctly. QuickTime/MOV container support for AV1 HDR added in macOS Sonoma.',
                        android: 'HDR10 AV1 requires hardware decoder with HDR10 profile support. Check MediaCodecInfo.CodecCapabilities for HDR10 profile flag. Not all AV1-capable SoCs support the HDR10 profile.',
                        lg: 'webOS 6.0+ decodes AV1 HDR10 in DASH streams. HDR10 metadata (SMPTE ST 2086, MaxCLL/MaxFALL) passed through to display pipeline.'
                    },
                    references: [
                        { title: 'AV1 Bitstream & Decoding Process Spec', url: 'https://aomediacodec.github.io/av1-spec/' },
                        { title: 'AV1 Codec ISO Media File Format Binding', url: 'https://aomediacodec.github.io/av1-isobmff/' },
                        { title: 'Apple HLS Authoring Spec', url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices' },
                        { title: 'webOS TV AV Formats', url: 'https://webostv.developer.lge.com/develop/specifications/video-audio-250' },
                        { title: 'Android Supported Media Formats', url: 'https://developer.android.com/media/platform/supported-formats' }
                    ]
                },
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="av01.0.08M.10"',
                        width: 3840,
                        height: 2160,
                        bitrate: 15000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                }
            },
            {
                name: "AV1 Main (HDR10 4K MKV)",
                codec: 'video/x-matroska; codecs="av01.0.08M.10"',
                container: "MKV",
                info: "10-bit HDR10",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="av01.0.08M.10"',
                        width: 3840,
                        height: 2160,
                        bitrate: 15000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                }
            },
            {
                name: "AV1 Main (HDR10 4K WebM)",
                codec: 'video/webm; codecs="av01.0.08M.10"',
                container: "WebM",
                info: "10-bit HDR10",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/webm; codecs="av01.0.08M.10"',
                        width: 3840,
                        height: 2160,
                        bitrate: 15000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                }
            },
            // High profile/tier
            {
                name: "AV1 High (4K 60fps)",
                codec: 'video/mp4; codecs="av01.0.12M.10.0.110.09.16.09.0"',
                container: "MP4",
                info: "Level 5.1 High Tier",
                                education: {
                    codecBreakdown: {
                        mime: 'video/mp4',
                        parts: [
                            { token: 'av01', meaning: 'AV1 codec identifier' },
                            { token: '0', meaning: 'Profile 0 (Main)' },
                            { token: '12M', meaning: 'Level 5.0 Main tier — up to 4096x2176 @ 60fps' },
                            { token: '10', meaning: '10-bit depth' },
                            { token: '0', meaning: 'monochrome = 0 (color, not grayscale)' },
                            { token: '110', meaning: 'Chroma subsampling 4:2:0 (1=subsamplingX, 1=subsamplingY, 0=unused)' },
                            { token: '09', meaning: 'Color primaries = BT.2020 (ISO 23091-2 ColourPrimaries 9)' },
                            { token: '16', meaning: 'Transfer characteristics = PQ/SMPTE ST 2084 (ISO 23091-2 value 16)' },
                            { token: '09', meaning: 'Matrix coefficients = BT.2020 non-constant luminance (ISO 23091-2 value 9)' },
                            { token: '0', meaning: 'videoFullRangeFlag = 0 (limited/studio range 16-235)' }
                        ]
                    },
                    overview: 'This is the full 10-token AV1 codec string. Tokens 5-10 are optional and map directly to ISO 23091-2 (CICP) values — the same color description system used by HEVC, VP9, and VVC. When omitted, browsers assume defaults from the AV1 bitstream sequence_header OBU. Including them explicitly can help browsers make faster decode decisions without parsing the bitstream. The color primaries (09) and transfer characteristics (16) together define HDR10: BT.2020 gamut + Perceptual Quantizer.',
                    references: [
                        { title: 'AV1 Bitstream & Decoding Process Spec', url: 'https://aomediacodec.github.io/av1-spec/' },
                        { title: 'AV1 Codec ISO Media File Format Binding', url: 'https://aomediacodec.github.io/av1-isobmff/' }
                    ]
                },
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="av01.0.12M.10.0.110.09.16.09.0"',
                        width: 3840,
                        height: 2160,
                        bitrate: 20000000,
                        framerate: 60,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                }
            },
            // Film grain synthesis
            {
                name: "AV1 Film Grain (WebM)",
                codec: 'video/webm; codecs="av01.0.08M.10.0.110.01.01.01.0"',
                container: "WebM",
                info: "Grain synthesis metadata",
                                education: {
                    codecBreakdown: {
                        mime: 'video/webm',
                        parts: [
                            { token: 'av01', meaning: 'AV1 codec identifier' },
                            { token: '0', meaning: 'Profile 0 (Main)' },
                            { token: '08M', meaning: 'Level 4.0 Main tier' },
                            { token: '10', meaning: '10-bit depth' },
                            { token: '0', meaning: 'monochrome = 0 (color)' },
                            { token: '110', meaning: 'Chroma subsampling 4:2:0' },
                            { token: '01', meaning: 'Color primaries = BT.709 (SDR primaries despite 10-bit depth)' },
                            { token: '01', meaning: 'Transfer characteristics = BT.709' },
                            { token: '01', meaning: 'Matrix coefficients = BT.709' },
                            { token: '0', meaning: 'videoFullRangeFlag = 0 (limited range)' }
                        ]
                    },
                    overview: 'AV1 film grain synthesis is a unique codec feature: the encoder analyzes source grain patterns, strips them during encoding (improving compression), and embeds grain parameters in film_grain_params() OBU metadata. The decoder then re-synthesizes matching grain on playback. This is not signaled in the codec string — it is a bitstream-level feature all AV1 decoders must support. The BT.709 color values here (01.01.01) indicate SDR color space despite 10-bit depth, which is common for archival/film content where extra bit depth preserves grain detail rather than HDR range.',
                    references: [
                        { title: 'AV1 Bitstream & Decoding Process Spec', url: 'https://aomediacodec.github.io/av1-spec/' },
                        { title: 'AV1 Codec ISO Media File Format Binding', url: 'https://aomediacodec.github.io/av1-isobmff/' }
                    ]
                },
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/webm; codecs="av01.0.08M.10.0.110.01.01.01.0"',
                        width: 3840,
                        height: 2160,
                        bitrate: 15000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                }
            },
            {
                name: "AV1 Main (HLG 4K WebM)",
                codec: 'video/webm; codecs="av01.0.08M.10"',
                container: "WebM",
                info: "HLG HDR in WebM",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/webm; codecs="av01.0.08M.10"',
                        width: 3840,
                        height: 2160,
                        bitrate: 15000000,
                        framerate: 24,
                        transferFunction: 'hlg',
                        colorGamut: 'rec2020'
                    }
                }
            },
            {
                name: "AV1 Main (SDR 4K WebM)",
                codec: 'video/webm; codecs="av01.0.08M.08"',
                container: "WebM",
                info: "8-bit 4K SDR in WebM",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/webm; codecs="av01.0.08M.08"',
                        width: 3840,
                        height: 2160,
                        bitrate: 20000000,
                        framerate: 30
                    }
                }
            },
            {
                name: "AV1 High (4:4:4 10-bit WebM)",
                codec: 'video/webm; codecs="av01.1.08M.10"',
                container: "WebM",
                info: "Profile 1 in WebM",
                                education: {
                    codecBreakdown: {
                        mime: 'video/webm',
                        parts: [
                            { token: 'av01', meaning: 'AV1 codec identifier' },
                            { token: '1', meaning: 'Profile 1 (High) — 4:4:4 chroma, no subsampling, 8 or 10-bit' },
                            { token: '08M', meaning: 'Level 4.0 Main tier' },
                            { token: '10', meaning: '10-bit depth' }
                        ]
                    },
                    overview: 'Profile 1 (High) retains full chroma resolution — every pixel gets independent color values (4:4:4) instead of sharing chroma across pixel groups. This is critical for screen content (text, UI captures, graphics) where chroma subsampling causes color bleeding at sharp edges. It also matters for professional color grading workflows. Profile 1 decoders are rare in consumer hardware — most GPUs and SoCs only implement Profile 0 (Main). Software decode via dav1d handles all profiles.',
                    references: [
                        { title: 'AV1 Bitstream & Decoding Process Spec', url: 'https://aomediacodec.github.io/av1-spec/' },
                        { title: 'AV1 Codec ISO Media File Format Binding', url: 'https://aomediacodec.github.io/av1-isobmff/' }
                    ]
                },
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/webm; codecs="av01.1.08M.10"',
                        width: 3840,
                        height: 2160,
                        bitrate: 20000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                }
            },
            {
                name: "AV1 Professional (4:2:2 10-bit WebM)",
                codec: 'video/webm; codecs="av01.2.08M.10"',
                container: "WebM",
                info: "Profile 2 in WebM",
                                education: {
                    codecBreakdown: {
                        mime: 'video/webm',
                        parts: [
                            { token: 'av01', meaning: 'AV1 codec identifier' },
                            { token: '2', meaning: 'Profile 2 (Professional) — 4:2:2 or 4:4:4 chroma, up to 12-bit depth' },
                            { token: '08M', meaning: 'Level 4.0 Main tier' },
                            { token: '10', meaning: '10-bit depth' }
                        ]
                    },
                    overview: 'Profile 2 (Professional) supports 4:2:2 chroma subsampling — horizontal chroma is preserved while vertical is halved. This is the standard for broadcast and post-production (ProRes 422, DNxHR HQ). Profile 2 also uniquely supports 12-bit depth and can do 4:4:4 at 12-bit. Practically no consumer hardware decodes Profile 2 in real-time — it exists for professional encoding pipelines where the output is later transcoded to Profile 0 for distribution.',
                    references: [
                        { title: 'AV1 Bitstream & Decoding Process Spec', url: 'https://aomediacodec.github.io/av1-spec/' },
                        { title: 'AV1 Codec ISO Media File Format Binding', url: 'https://aomediacodec.github.io/av1-isobmff/' }
                    ]
                },
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/webm; codecs="av01.2.08M.10"',
                        width: 3840,
                        height: 2160,
                        bitrate: 20000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                }
            },
            {
                name: "AV1 Main (8K WebM)",
                codec: 'video/webm; codecs="av01.0.16M.10"',
                container: "WebM",
                info: "8K HDR in WebM",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/webm; codecs="av01.0.16M.10"',
                        width: 7680,
                        height: 4320,
                        bitrate: 80000000,
                        framerate: 30,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                }
            },
            // 8K
            {
                name: "AV1 Main (8K Level 6.0)",
                codec: 'video/mp4; codecs="av01.0.16M.10"',
                container: "MP4",
                info: "8K @ 30fps",
                                education: {
                    codecBreakdown: {
                        mime: 'video/mp4',
                        parts: [
                            { token: 'av01', meaning: 'AV1 codec identifier' },
                            { token: '0', meaning: 'Profile 0 (Main)' },
                            { token: '16M', meaning: 'Level 6.0 Main tier — up to 8192x4352 @ 30fps, 60 Mbps max' },
                            { token: '10', meaning: '10-bit depth' }
                        ]
                    },
                    overview: 'Level 6.0 (seq_level_idx=16) is the highest tier commonly referenced. It supports 8K resolution at 30fps with Main tier bitrate limits. Level 6.1 (idx 17) bumps to 60fps and 100 Mbps. No consumer hardware currently decodes 8K AV1 in real-time — this test verifies whether the browser/decoder advertises the capability even without hardware acceleration. YouTube serves 8K AV1 content and relies on software decode via dav1d for playback.',
                    references: [
                        { title: 'AV1 Bitstream & Decoding Process Spec', url: 'https://aomediacodec.github.io/av1-spec/' },
                        { title: 'AV1 Codec ISO Media File Format Binding', url: 'https://aomediacodec.github.io/av1-isobmff/' }
                    ]
                },
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="av01.0.16M.10"',
                        width: 7680,
                        height: 4320,
                        bitrate: 50000000,
                        framerate: 30,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                }
            },
            // Additional AV1 variants
            {
                name: "AV1 Main (HLG 4K MP4)",
                codec: 'video/mp4; codecs="av01.0.08M.10"',
                container: "MP4",
                info: "10-bit HLG HDR",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="av01.0.08M.10"',
                        width: 3840,
                        height: 2160,
                        bitrate: 15000000,
                        framerate: 24,
                        transferFunction: 'hlg',
                        colorGamut: 'rec2020'
                    }
                }
            },
            {
                name: "AV1 Main (SDR 4K MP4)",
                codec: 'video/mp4; codecs="av01.0.08M.08"',
                container: "MP4",
                info: "8-bit 4K SDR",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="av01.0.08M.08"',
                        width: 3840,
                        height: 2160,
                        bitrate: 10000000,
                        framerate: 30
                    }
                }
            },
            {
                name: "AV1 Main (SDR 1080p MKV)",
                codec: 'video/x-matroska; codecs="av01.0.05M.08"',
                container: "MKV",
                info: "8-bit SDR in Matroska",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="av01.0.05M.08"',
                        width: 1920,
                        height: 1080,
                        bitrate: 3000000,
                        framerate: 24
                    }
                }
            },
            {
                name: "AV1 Professional (4:2:2 10-bit)",
                codec: 'video/mp4; codecs="av01.2.08M.10"',
                container: "MP4",
                info: "Profile 2 chroma subsampling",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="av01.2.08M.10"',
                        width: 3840,
                        height: 2160,
                        bitrate: 20000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                }
            },
            {
                name: "AV1 High (4:4:4 10-bit)",
                codec: 'video/mp4; codecs="av01.1.08M.10"',
                container: "MP4",
                info: "Profile 1 full chroma",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="av01.1.08M.10"',
                        width: 3840,
                        height: 2160,
                        bitrate: 20000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                }
            },
            {
                name: "AV1 Main (SDR 720p Level 3.1)",
                codec: 'video/mp4; codecs="av01.0.04M.08"',
                container: "MP4",
                info: "8-bit 720p",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="av01.0.04M.08"',
                        width: 1280,
                        height: 720,
                        bitrate: 2000000,
                        framerate: 30
                    }
                }
            },
            {
                name: "AV1 Main (4K 120fps Level 5.3)",
                codec: 'video/mp4; codecs="av01.0.13M.10"',
                container: "MP4",
                info: "10-bit 120fps",
                                education: {
                    codecBreakdown: {
                        mime: 'video/mp4',
                        parts: [
                            { token: 'av01', meaning: 'AV1 codec identifier' },
                            { token: '0', meaning: 'Profile 0 (Main)' },
                            { token: '13M', meaning: 'Level 5.1 Main tier — up to 4096x2176 @ 120fps, 40 Mbps max' },
                            { token: '10', meaning: '10-bit depth' }
                        ]
                    },
                    overview: 'Level 5.1 (seq_level_idx=13) is the first level supporting 4K @ 120fps. The mediaCapabilities API tests this as a combined constraint: the decoder must handle both the resolution AND framerate simultaneously. Most hardware decoders support 4K@60 (Level 5.0) but not 4K@120. This test catches the gap — useful for gaming content and high-framerate HDR streaming where the server needs to know whether to offer 120fps or fall back to 60fps.',
                    references: [
                        { title: 'AV1 Bitstream & Decoding Process Spec', url: 'https://aomediacodec.github.io/av1-spec/' },
                        { title: 'AV1 Codec ISO Media File Format Binding', url: 'https://aomediacodec.github.io/av1-isobmff/' }
                    ]
                },
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="av01.0.13M.10"',
                        width: 3840,
                        height: 2160,
                        bitrate: 40000000,
                        framerate: 120,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                }
            },
            {
                name: "AV1 Main (HDR10 4K High Tier MP4)",
                codec: 'video/mp4; codecs="av01.0.09H.10"',
                container: "MP4",
                info: "High Tier 4K HDR10",
                                education: {
                    codecBreakdown: {
                        mime: 'video/mp4',
                        parts: [
                            { token: 'av01', meaning: 'AV1 codec identifier' },
                            { token: '0', meaning: 'Profile 0 (Main)' },
                            { token: '09H', meaning: 'Level 4.1 High tier — same resolution as Main but higher bitrate cap (50 Mbps vs 20 Mbps)' },
                            { token: '10', meaning: '10-bit depth' }
                        ]
                    },
                    overview: 'The tier flag (M or H) controls maximum bitrate at a given level. Main tier targets streaming (lower bitrates), High tier targets high-quality local playback (higher bitrates). Level 4.1 Main caps at 20 Mbps; Level 4.1 High caps at 50 Mbps. Hardware decoders that support a level at Main tier may not handle High tier bitrates — the decoder might accept the codec string but drop frames if the actual bitrate exceeds its processing capacity. This test reveals whether the browser distinguishes M from H.',
                    references: [
                        { title: 'AV1 Bitstream & Decoding Process Spec', url: 'https://aomediacodec.github.io/av1-spec/' },
                        { title: 'AV1 Codec ISO Media File Format Binding', url: 'https://aomediacodec.github.io/av1-isobmff/' }
                    ]
                },
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="av01.0.09H.10"',
                        width: 3840,
                        height: 2160,
                        bitrate: 40000000,
                        framerate: 30,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                }
            },
            {
                name: "AV1 Main (HDR10 4K MOV)",
                codec: 'video/quicktime; codecs="av01.0.08M.10"',
                container: "MOV",
                info: "Apple QuickTime AV1",
                                education: {
                    codecBreakdown: {
                        mime: 'video/quicktime',
                        parts: [
                            { token: 'av01', meaning: 'AV1 codec identifier' },
                            { token: '0', meaning: 'Profile 0 (Main)' },
                            { token: '08M', meaning: 'Level 4.0 Main tier' },
                            { token: '10', meaning: '10-bit depth' }
                        ]
                    },
                    overview: 'Apple added AV1 support to QuickTime/MOV containers in macOS Sonoma and iOS 17. The MOV container uses the same AV1CodecConfigurationRecord (av1C box) as MP4 — they share the ISO 14496-12 base. Safari reports AV1 in QuickTime via canPlayType but hardware decode requires A17 Pro or M3+. On older Apple Silicon, AV1 in MOV falls back to software decode which may not sustain 4K HDR playback.',
                    platforms: {
                        apple: 'AV1 in MOV supported since macOS Sonoma / iOS 17. Hardware decode requires M3+ or A17 Pro+. Safari uses the av1C sample entry box (same as MP4). AV1 in HLS still requires fMP4 segments, not MOV.',
                        lg: 'webOS does not support video/quicktime MIME type. AV1 content for LG TVs must use MP4 or WebM containers.',
                        android: 'Android does not natively support video/quicktime. ExoPlayer and other players may remux MOV to MP4 internally but the browser API will report unsupported.'
                    },
                    references: [
                        { title: 'AV1 Bitstream & Decoding Process Spec', url: 'https://aomediacodec.github.io/av1-spec/' },
                        { title: 'AV1 Codec ISO Media File Format Binding', url: 'https://aomediacodec.github.io/av1-isobmff/' },
                        { title: 'Apple HLS Authoring Spec', url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices' },
                        { title: 'webOS TV AV Formats', url: 'https://webostv.developer.lge.com/develop/specifications/video-audio-250' },
                        { title: 'Android Supported Media Formats', url: 'https://developer.android.com/media/platform/supported-formats' }
                    ]
                },
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/quicktime; codecs="av01.0.08M.10"',
                        width: 3840,
                        height: 2160,
                        bitrate: 15000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                }
            },
            // MKV AV1 coverage
            {
                name: "AV1 Main (SDR 4K MKV)",
                codec: 'video/x-matroska; codecs="av01.0.08M.08"',
                container: "MKV",
                info: "8-bit 4K SDR in MKV",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="av01.0.08M.08"',
                        width: 3840,
                        height: 2160,
                        bitrate: 10000000,
                        framerate: 30
                    }
                }
            },
            {
                name: "AV1 Main (HLG 4K MKV)",
                codec: 'video/x-matroska; codecs="av01.0.08M.10"',
                container: "MKV",
                info: "10-bit HLG in MKV",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="av01.0.08M.10"',
                        width: 3840,
                        height: 2160,
                        bitrate: 15000000,
                        framerate: 24,
                        transferFunction: 'hlg',
                        colorGamut: 'rec2020'
                    }
                }
            },
            {
                name: "AV1 Professional (4:2:2 MKV)",
                codec: 'video/x-matroska; codecs="av01.2.08M.10"',
                container: "MKV",
                info: "Profile 2 in MKV",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="av01.2.08M.10"',
                        width: 3840,
                        height: 2160,
                        bitrate: 20000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                }
            },
            {
                name: "AV1 High (4:4:4 MKV)",
                codec: 'video/x-matroska; codecs="av01.1.08M.10"',
                container: "MKV",
                info: "Profile 1 in MKV",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="av01.1.08M.10"',
                        width: 3840,
                        height: 2160,
                        bitrate: 20000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                }
            }
        ]
    },

    video_vp9: {
        category: "VP9",
        tests: [
            // Profile 0 (8-bit)
            {
                name: "VP9 Profile 0 (SDR WebM)",
                codec: 'video/webm; codecs="vp9"',
                container: "WebM",
                info: "8-bit SDR",
                                education: {
                    codecBreakdown: {
                        mime: 'video/webm',
                        parts: [
                            { token: 'vp9', meaning: 'VP9 codec — bare string form (Matroska/WebM legacy binding, no profile/level/depth)' }
                        ]
                    },
                    overview: 'The bare "vp9" codec string is the legacy WebM/Matroska form — it omits profile, level, and bit depth. Browsers infer Profile 0 (4:2:0, 8-bit) as the default. This form only works in WebM containers; MP4/ISOBMFF requires the full "vp09.PP.LL.DD" format per the VP Codec ISO Media File Format Binding. The bare form is what YouTube originally deployed and is widely supported, but it gives browsers no information about HDR capability or chroma subsampling.',
                    platforms: {
                        apple: 'Safari does not support VP9 in WebM. Apple has never implemented VP9 decode — they skipped directly from H.264 to HEVC and AV1. This test will show unsupported on all Apple devices.',
                        android: 'VP9 Profile 0 hardware decode on most Android devices since ~2015 (Snapdragon 800+ era). YouTube relies on VP9 as primary codec on Android Chrome.',
                        lg: 'webOS supports VP9 Profile 0 and 2 in WebM. Hardware decode on all webOS 3.0+ (2016+) TVs.'
                    },
                    references: [
                        { title: 'VP9 Bitstream & Decoding Process Spec' },
                        { title: 'VP9 Codec ISO Media File Format Binding', url: 'https://www.webmproject.org/vp9/mp4/' },
                        { title: 'Apple HLS Authoring Spec', url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices' },
                        { title: 'webOS TV AV Formats', url: 'https://webostv.developer.lge.com/develop/specifications/video-audio-250' },
                        { title: 'Android Supported Media Formats', url: 'https://developer.android.com/media/platform/supported-formats' }
                    ]
                },
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/webm; codecs="vp9"',
                        width: 1920,
                        height: 1080,
                        bitrate: 5000000,
                        framerate: 30
                    }
                }
            },
            {
                name: "VP9 Profile 0 (SDR MP4)",
                codec: 'video/mp4; codecs="vp09.00.10.08"',
                container: "MP4",
                info: "8-bit in MP4",
                                education: {
                    codecBreakdown: {
                        mime: 'video/mp4',
                        parts: [
                            { token: 'vp09', meaning: 'VP9 codec in ISOBMFF container (VP Codec ISO Media File Format Binding)' },
                            { token: '00', meaning: 'Profile 0 — 4:2:0 chroma, 8-bit only' },
                            { token: '10', meaning: 'Level 1.0 — format is MajorMinor (10=1.0, 31=3.1, 51=5.1)' },
                            { token: '08', meaning: '8-bit color depth' }
                        ]
                    },
                    overview: 'VP9 in MP4 requires the full "vp09" codec string — the bare "vp9" form is only valid in WebM. The 4-token format vp09.{profile}.{level}.{bitDepth} mirrors AV1 structure but levels use MajorMinor notation (not sequential index). Optional tokens 5-9 (chromaSubsampling, colorPrimaries, transferCharacteristics, matrixCoefficients, fullRange) use the same ISO 23091-2 CICP values as AV1. VP9 in MP4 was standardized later than WebM and has inconsistent browser support — Chrome accepts it, Firefox varies, Safari rejects it.',
                    references: [
                        { title: 'VP9 Bitstream & Decoding Process Spec' },
                        { title: 'VP9 Codec ISO Media File Format Binding', url: 'https://www.webmproject.org/vp9/mp4/' }
                    ]
                },
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="vp09.00.10.08"',
                        width: 1920,
                        height: 1080,
                        bitrate: 5000000,
                        framerate: 30
                    }
                }
            },
            // Profile 2 (10-bit HDR)
            {
                name: "VP9 Profile 2 (HDR10 WebM)",
                codec: 'video/webm; codecs="vp09.02.10.10.01.09.16.09.01"',
                container: "WebM",
                info: "10-bit HDR PQ",
                                education: {
                    codecBreakdown: {
                        mime: 'video/webm',
                        parts: [
                            { token: 'vp09', meaning: 'VP9 codec (ISOBMFF binding)' },
                            { token: '02', meaning: 'Profile 2 — 4:2:0 chroma, 10 or 12-bit depth' },
                            { token: '10', meaning: 'Level 1.0' },
                            { token: '10', meaning: '10-bit color depth' },
                            { token: '01', meaning: 'Chroma subsampling: 4:2:0 (chromaSubsampling code 01)' },
                            { token: '09', meaning: 'Color primaries = BT.2020 (ISO 23091-2 value 9)' },
                            { token: '16', meaning: 'Transfer characteristics = PQ/ST 2084 (ISO 23091-2 value 16)' },
                            { token: '09', meaning: 'Matrix coefficients = BT.2020 NCL (ISO 23091-2 value 9)' },
                            { token: '01', meaning: 'videoFullRangeFlag = 1 (full range 0-1023 for 10-bit)' }
                        ]
                    },
                    overview: 'This is the full 9-token VP9 codec string with explicit CICP color metadata. YouTube uses VP9 Profile 2 for HDR content on Chrome/Android where AV1 hardware decode is unavailable. The optional color tokens are identical to AV1 positions 5-10 (same ISO 23091-2 value space). VP9 Profile 2 HDR10 is the most widely deployed HDR web video format by volume, predating AV1 HDR adoption.',
                    platforms: {
                        apple: 'Not supported. Safari has no VP9 implementation. Apple devices use HEVC or AV1 for HDR content.',
                        android: 'VP9 Profile 2 hardware decode on Snapdragon 835+ (2017) and Exynos 9810+ (2018). YouTube HDR on Android primarily uses VP9 P2 with PQ transfer.',
                        lg: 'webOS supports VP9 Profile 2 HDR10 on webOS 4.0+ (2018+ TVs). HDR10 metadata passed through to panel. YouTube app uses VP9 P2 for HDR on older webOS models without AV1.'
                    },
                    references: [
                        { title: 'VP9 Bitstream & Decoding Process Spec' },
                        { title: 'VP9 Codec ISO Media File Format Binding', url: 'https://www.webmproject.org/vp9/mp4/' },
                        { title: 'Apple HLS Authoring Spec', url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices' },
                        { title: 'webOS TV AV Formats', url: 'https://webostv.developer.lge.com/develop/specifications/video-audio-250' },
                        { title: 'Android Supported Media Formats', url: 'https://developer.android.com/media/platform/supported-formats' }
                    ]
                },
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/webm; codecs="vp09.02.10.10.01.09.16.09.01"',
                        width: 3840,
                        height: 2160,
                        bitrate: 20000000,
                        framerate: 60,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                }
            },
            {
                name: "VP9 Profile 2 (HDR10 MP4)",
                codec: 'video/mp4; codecs="vp09.02.10.10"',
                container: "MP4",
                info: "10-bit in MP4",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="vp09.02.10.10"',
                        width: 3840,
                        height: 2160,
                        bitrate: 20000000,
                        framerate: 60,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                }
            },
            {
                name: "VP9 Profile 2 (HDR10 MKV)",
                codec: 'video/x-matroska; codecs="vp09.02.10.10"',
                container: "MKV",
                info: "10-bit HDR",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="vp09.02.10.10"',
                        width: 3840,
                        height: 2160,
                        bitrate: 20000000,
                        framerate: 60,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                }
            },
            // HLG variant
            {
                name: "VP9 Profile 2 (HLG)",
                codec: 'video/webm; codecs="vp09.02.10.10.01.09.18.09.01"',
                container: "WebM",
                info: "10-bit HLG",
                                education: {
                    codecBreakdown: {
                        mime: 'video/webm',
                        parts: [
                            { token: 'vp09', meaning: 'VP9 codec (ISOBMFF binding)' },
                            { token: '02', meaning: 'Profile 2 — 4:2:0, 10-bit' },
                            { token: '10', meaning: 'Level 1.0' },
                            { token: '10', meaning: '10-bit depth' },
                            { token: '01', meaning: 'Chroma subsampling 4:2:0' },
                            { token: '09', meaning: 'Color primaries = BT.2020' },
                            { token: '18', meaning: 'Transfer characteristics = HLG/ARIB STD-B67 (ISO 23091-2 value 18)' },
                            { token: '09', meaning: 'Matrix coefficients = BT.2020 NCL' },
                            { token: '01', meaning: 'Full range' }
                        ]
                    },
                    overview: 'HLG (Hybrid Log-Gamma) differs from PQ (HDR10) in transfer characteristic value: 18 vs 16. HLG is backward-compatible with SDR displays — the gamma curve maps to reasonable SDR brightness without tone mapping. PQ requires explicit tone mapping. YouTube uses HLG for live HDR broadcasts. The mediaCapabilities API tests this with transferFunction:"hlg" — some devices support PQ but not HLG, or vice versa.',
                    references: [
                        { title: 'VP9 Bitstream & Decoding Process Spec' },
                        { title: 'VP9 Codec ISO Media File Format Binding', url: 'https://www.webmproject.org/vp9/mp4/' }
                    ]
                },
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/webm; codecs="vp09.02.10.10.01.09.18.09.01"',
                        width: 3840,
                        height: 2160,
                        bitrate: 20000000,
                        framerate: 60,
                        transferFunction: 'hlg',
                        colorGamut: 'rec2020'
                    }
                }
            },
            // Additional VP9 profiles
            {
                name: "VP9 Profile 1 (8-bit 4:2:2 WebM)",
                codec: 'video/webm; codecs="vp09.01.10.08"',
                container: "WebM",
                info: "8-bit non-4:2:0 subsampling",
                                education: {
                    codecBreakdown: {
                        mime: 'video/webm',
                        parts: [
                            { token: 'vp09', meaning: 'VP9 codec (ISOBMFF binding)' },
                            { token: '01', meaning: 'Profile 1 — non-4:2:0 chroma (4:2:2 or 4:4:4), 8-bit only' },
                            { token: '10', meaning: 'Level 1.0' },
                            { token: '08', meaning: '8-bit depth' }
                        ]
                    },
                    overview: 'VP9 profiles map chroma subsampling and bit depth into a 2x2 matrix: Profile 0 (4:2:0/8-bit), Profile 1 (non-4:2:0/8-bit), Profile 2 (4:2:0/10-12-bit), Profile 3 (non-4:2:0/10-12-bit). Profile 1 preserves higher chroma resolution at 8-bit depth — used for screen content capture and graphics. Almost no consumer hardware decodes Profile 1; it falls back to software decode (libvpx). This test reveals whether the browser even advertises support for non-4:2:0 VP9.',
                    references: [
                        { title: 'VP9 Bitstream & Decoding Process Spec' },
                        { title: 'VP9 Codec ISO Media File Format Binding', url: 'https://www.webmproject.org/vp9/mp4/' }
                    ]
                },
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/webm; codecs="vp09.01.10.08"',
                        width: 1920,
                        height: 1080,
                        bitrate: 8000000,
                        framerate: 30
                    }
                }
            },
            {
                name: "VP9 Profile 3 (10-bit 4:4:4 WebM)",
                codec: 'video/webm; codecs="vp09.03.10.10"',
                container: "WebM",
                info: "10/12-bit non-4:2:0",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/webm; codecs="vp09.03.10.10"',
                        width: 1920,
                        height: 1080,
                        bitrate: 10000000,
                        framerate: 30,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                }
            },
            {
                name: "VP9 Profile 0 (4K SDR WebM)",
                codec: 'video/webm; codecs="vp9"',
                container: "WebM",
                info: "8-bit 4K SDR",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/webm; codecs="vp9"',
                        width: 3840,
                        height: 2160,
                        bitrate: 15000000,
                        framerate: 30
                    }
                }
            },
            {
                name: "VP9 Profile 0 (1080p WebM full string)",
                codec: 'video/webm; codecs="vp09.00.21.08"',
                container: "WebM",
                info: "Explicit codec string vs bare vp9",
                                education: {
                    codecBreakdown: {
                        mime: 'video/webm',
                        parts: [
                            { token: 'vp09', meaning: 'VP9 codec (ISOBMFF binding — explicit format)' },
                            { token: '00', meaning: 'Profile 0 — 4:2:0, 8-bit' },
                            { token: '21', meaning: 'Level 2.1 — up to 960x540 @ 60fps or 1920x1080 @ 30fps nominal' },
                            { token: '08', meaning: '8-bit depth' }
                        ]
                    },
                    overview: 'This tests the same Profile 0 capability as bare "vp9" but using the explicit vp09.PP.LL.DD format. Some browsers handle the two forms differently — canPlayType may return "probably" for bare "vp9" but "maybe" or empty for "vp09.00.21.08" in WebM, because the ISOBMFF binding form was not part of the original WebM specification. This discrepancy reveals whether the browser treats the two strings as equivalent or applies different parsing logic.',
                    references: [
                        { title: 'VP9 Bitstream & Decoding Process Spec' },
                        { title: 'VP9 Codec ISO Media File Format Binding', url: 'https://www.webmproject.org/vp9/mp4/' }
                    ]
                },
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/webm; codecs="vp09.00.21.08"',
                        width: 1920,
                        height: 1080,
                        bitrate: 5000000,
                        framerate: 30
                    }
                }
            },
            {
                name: "VP9 Profile 2 (4K SDR 10-bit WebM)",
                codec: 'video/webm; codecs="vp09.02.31.10"',
                container: "WebM",
                info: "10-bit SDR 4K in WebM",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/webm; codecs="vp09.02.31.10"',
                        width: 3840,
                        height: 2160,
                        bitrate: 20000000,
                        framerate: 30
                    }
                }
            },
            {
                name: "VP9 Profile 0 (SDR MKV)",
                codec: 'video/x-matroska; codecs="vp09.00.10.08"',
                container: "MKV",
                info: "8-bit SDR in Matroska",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="vp09.00.10.08"',
                        width: 1920,
                        height: 1080,
                        bitrate: 5000000,
                        framerate: 30
                    }
                }
            },
            {
                name: "VP9 Profile 2 (HLG MP4)",
                codec: 'video/mp4; codecs="vp09.02.10.10.01.09.18.09.01"',
                container: "MP4",
                info: "10-bit HLG in MP4",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="vp09.02.10.10.01.09.18.09.01"',
                        width: 3840,
                        height: 2160,
                        bitrate: 20000000,
                        framerate: 60,
                        transferFunction: 'hlg',
                        colorGamut: 'rec2020'
                    }
                }
            },
            {
                name: "VP9 Profile 0 (4K SDR MP4)",
                codec: 'video/mp4; codecs="vp09.00.31.08"',
                container: "MP4",
                info: "8-bit 4K SDR in MP4",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="vp09.00.31.08"',
                        width: 3840,
                        height: 2160,
                        bitrate: 20000000,
                        framerate: 30
                    }
                }
            },
            {
                name: "VP9 Profile 1 (8-bit 4:2:2 MP4)",
                codec: 'video/mp4; codecs="vp09.01.31.08"',
                container: "MP4",
                info: "Non-4:2:0 subsampling in MP4",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="vp09.01.31.08"',
                        width: 1920,
                        height: 1080,
                        bitrate: 8000000,
                        framerate: 30
                    }
                }
            },
            {
                name: "VP9 Profile 3 (10-bit 4:4:4 MP4)",
                codec: 'video/mp4; codecs="vp09.03.31.10"',
                container: "MP4",
                info: "10-bit non-4:2:0 in MP4",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="vp09.03.31.10"',
                        width: 1920,
                        height: 1080,
                        bitrate: 10000000,
                        framerate: 30,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                }
            },
            // MKV VP9 coverage
            {
                name: "VP9 Profile 0 (4K SDR MKV)",
                codec: 'video/x-matroska; codecs="vp09.00.10.08"',
                container: "MKV",
                info: "8-bit 4K SDR in MKV",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="vp09.00.10.08"',
                        width: 3840,
                        height: 2160,
                        bitrate: 15000000,
                        framerate: 30
                    }
                }
            },
            {
                name: "VP9 Profile 2 (HLG MKV)",
                codec: 'video/x-matroska; codecs="vp09.02.10.10.01.09.18.09.01"',
                container: "MKV",
                info: "10-bit HLG in MKV",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="vp09.02.10.10.01.09.18.09.01"',
                        width: 3840,
                        height: 2160,
                        bitrate: 20000000,
                        framerate: 60,
                        transferFunction: 'hlg',
                        colorGamut: 'rec2020'
                    }
                }
            },
            {
                name: "VP9 Profile 1 (8-bit 4:2:2 MKV)",
                codec: 'video/x-matroska; codecs="vp09.01.10.08"',
                container: "MKV",
                info: "Non-4:2:0 in MKV",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="vp09.01.10.08"',
                        width: 1920,
                        height: 1080,
                        bitrate: 8000000,
                        framerate: 30
                    }
                }
            },
            {
                name: "VP9 Profile 3 (10-bit 4:4:4 MKV)",
                codec: 'video/x-matroska; codecs="vp09.03.10.10"',
                container: "MKV",
                info: "10-bit non-4:2:0 in MKV",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="vp09.03.10.10"',
                        width: 1920,
                        height: 1080,
                        bitrate: 10000000,
                        framerate: 30,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                }
            }
        ]
    },

    video_avc: {
        category: "AVC/H.264",
        tests: [
            // High Profile
            {
                name: "H.264 High (1080p MP4)",
                codec: 'video/mp4; codecs="avc1.640033"',
                container: "MP4",
                info: "Level 5.1",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="avc1.640033"',
                        width: 1920,
                        height: 1080,
                        bitrate: 8000000,
                        framerate: 60
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: "video/mp4",
                        string: "avc1.640033",
                        parts: [
                            { token: "avc1", meaning: "AVC tag: H.264 in ISO BMFF (MP4). avc1 = parameter sets in sample entries (out-of-band). avc3 = in-band parameter sets (used in DASH/CMAF live). Decoders handle both identically — the difference is muxing, not decoding" },
                            { token: "64", meaning: "profile_idc: 0x64 = 100 = High Profile. Adds 8×8 transforms, custom quant matrices, and CABAC entropy coding over Main. Required for Blu-ray, broadcast, and most streaming. Other values: 42=Baseline, 4D=Main, 58=Extended, 6E=High10, 7A=High422, F4=High444PP" },
                            { token: "00", meaning: "constraint_set flags: Six constraint bits packed as hex. 0x00 = no constraints. When set: bit0 (0x80)=Baseline-compatible, bit1 (0x40)=Main-compatible, bit4+5 (0x0C)=Constrained High. Constraint flags restrict the bitstream to a subset of the profile's tools" },
                            { token: "33", meaning: "level_idc: 0x33 = 51 decimal = Level 5.1. Levels cap resolution, framerate, bitrate, and DPB size. Level 5.1 allows 1080p@60 or 4K@30 at up to 50 Mbps. Formula: level = hex_to_dec / 10, so 0x1E=30→3.0, 0x28=40→4.0, 0x33=51→5.1" }
                        ]
                    },
                    overview: "AVC codec strings are 6 hex characters — three bytes concatenated: profile_idc + constraint_flags + level_idc. Unlike AV1/VP9 (dot-separated decimal), AVC uses raw hex from the SPS NAL unit\n\nHigh Profile is the de facto standard for 1080p content. Netflix, YouTube, and Apple HLS all mandate High for HD streams. Baseline is reserved for low-latency videoconferencing and legacy mobile\n\nEvery browser and hardware decoder shipping since ~2012 supports High Profile Level 5.1. It's the safest codec string for maximum compatibility — if this fails, the device can't play H.264 at all",
                    references: [
                        { title: 'ITU-T H.264' },
                        { title: 'ISO/IEC 14496-15' }
                    ]
                }
            },
            {
                name: "H.264 High (1080p MKV)",
                codec: 'video/x-matroska; codecs="avc1.640033"',
                container: "MKV",
                info: "Level 5.1",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="avc1.640033"',
                        width: 1920,
                        height: 1080,
                        bitrate: 8000000,
                        framerate: 60
                    }
                }
            },
            {
                name: "H.264 High (1080p MOV)",
                codec: 'video/quicktime; codecs="avc1.640033"',
                container: "MOV",
                info: "Apple QuickTime",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/quicktime; codecs="avc1.640033"',
                        width: 1920,
                        height: 1080,
                        bitrate: 8000000,
                        framerate: 60
                    }
                }
            },
            {
                name: "H.264 Main (1080p MOV)",
                codec: 'video/quicktime; codecs="avc1.4d4028"',
                container: "MOV",
                info: "Main Profile QuickTime",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/quicktime; codecs="avc1.4d4028"',
                        width: 1920,
                        height: 1080,
                        bitrate: 5000000,
                        framerate: 30
                    }
                }
            },
            {
                name: "H.264 Baseline (720p MOV)",
                codec: 'video/quicktime; codecs="avc1.42E01E"',
                container: "MOV",
                info: "Baseline QuickTime",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/quicktime; codecs="avc1.42E01E"',
                        width: 1280,
                        height: 720,
                        bitrate: 2000000,
                        framerate: 30
                    }
                }
            },
            // Main Profile
            {
                name: "H.264 Main (1080p)",
                codec: 'video/mp4; codecs="avc1.4d4028"',
                container: "MP4",
                info: "Level 4.0",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="avc1.4d4028"',
                        width: 1920,
                        height: 1080,
                        bitrate: 5000000,
                        framerate: 30
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: "video/mp4",
                        string: "avc1.4d4028",
                        parts: [
                            { token: "avc1", meaning: "AVC tag: H.264 with out-of-band parameter sets" },
                            { token: "4d", meaning: "profile_idc: 0x4D = 77 = Main Profile. Adds CABAC entropy coding and B-frames over Baseline but lacks High's 8×8 transform and custom quant matrices. Was the standard for SD/HD broadcast before High displaced it" },
                            { token: "40", meaning: "constraint_set flags: 0x40 = constraint_set1_flag set (bit 1). This means the bitstream is Main-compatible — it won't use tools from higher profiles. Some encoders set this when targeting strict Main Profile compliance for broadcast" },
                            { token: "28", meaning: "level_idc: 0x28 = 40 = Level 4.0. The Blu-ray level: 1080p@30fps at up to 20 Mbps (High) or 25 Mbps (High with CABAC). Most streaming services target Level 4.0 for 1080p30 content" }
                        ]
                    },
                    overview: "Main Profile was the original 'good quality' profile — it adds CABAC (10-15% better compression than CAVLC) and B-frames (bidirectional prediction) over Baseline. High Profile then added 8×8 transforms on top\n\nThe constraint_set flags byte (middle hex pair) is often misunderstood. It's a bitfield where each bit declares compatibility with a lower profile. Setting constraint_set1 (0x40) in a Main string is redundant but valid — it just confirms Main compliance\n\nLevel 4.0 vs 5.1: Level 4.0 allows 1080p@30 (enough for most content). Level 5.1 doubles the macroblocks-per-second to allow 1080p@60 or 4K@30. Most encoders pick 4.0 for 30fps and 4.2 or 5.1 for 60fps",
                    references: [
                        { title: 'ITU-T H.264' },
                        { title: 'ISO/IEC 14496-15' }
                    ]
                }
            },
            // Baseline Profile
            {
                name: "H.264 Baseline (720p)",
                codec: 'video/mp4; codecs="avc1.42E01E"',
                container: "MP4",
                info: "Level 3.0",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="avc1.42E01E"',
                        width: 1280,
                        height: 720,
                        bitrate: 2000000,
                        framerate: 30
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: "video/mp4",
                        string: "avc1.42E01E",
                        parts: [
                            { token: "avc1", meaning: "AVC tag: H.264 with out-of-band parameter sets" },
                            { token: "42", meaning: "profile_idc: 0x42 = 66 = Baseline Profile. I-frames and P-frames only — no B-frames, no CABAC, no interlace. Lowest decode complexity of any H.264 profile, designed for real-time communication and embedded devices" },
                            { token: "E0", meaning: "constraint_set flags: 0xE0 = bits 0+1+2 set (constraint_set0 + set1 + set2). This triple constraint means the stream is simultaneously Baseline-compatible, Main-compatible, and Extended-compatible. Encoders targeting the widest possible playback set all three" },
                            { token: "1E", meaning: "level_idc: 0x1E = 30 = Level 3.0. Supports up to 720p@30fps at 10 Mbps. The standard level for video calling (WebRTC defaults to Baseline 3.0) and legacy mobile streaming" }
                        ]
                    },
                    overview: "Baseline's ban on B-frames means every frame can be decoded with only past reference frames — no future-frame dependencies. This gives minimal decode latency (one frame), critical for WebRTC and video conferencing\n\nThe 0xE0 constraint byte is common in the wild. Encoder tools like x264 set all compatible constraint bits automatically. A Baseline stream is always Main-compatible and Extended-compatible by definition (it uses a strict subset of their tools)\n\nLevel 3.0 maps to 40,500 macroblocks/sec — enough for 720p@30. For 720p@60, you need Level 3.1 (0x1F = 108,000 MB/s). The level_idc hex-to-level formula: 0x1E=30→3.0, 0x1F=31→3.1, 0x20=32→3.2",
                    references: [
                        { title: 'ITU-T H.264' },
                        { title: 'ISO/IEC 14496-15' }
                    ]
                }
            },
            // Constrained Baseline (HLS common)
            {
                name: "H.264 Constrained Baseline",
                codec: 'video/mp4; codecs="avc1.42C01E"',
                container: "MP4",
                info: "HLS/DASH common",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="avc1.42C01E"',
                        width: 1280,
                        height: 720,
                        bitrate: 2500000,
                        framerate: 30
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: "video/mp4",
                        string: "avc1.42C01E",
                        parts: [
                            { token: "avc1", meaning: "AVC tag: H.264 with out-of-band parameter sets" },
                            { token: "42", meaning: "profile_idc: 0x42 = 66 = Baseline Profile. Same profile_idc as regular Baseline — the 'Constrained' part is signaled entirely through constraint flags, not the profile byte" },
                            { token: "C0", meaning: "constraint_set flags: 0xC0 = bits 0+1 set (constraint_set0 + constraint_set1). The key difference from Baseline 0xE0: constraint_set1 (0x40) declares Main-compatible, which combined with Baseline profile_idc creates 'Constrained Baseline' — a profile that's the intersection of Baseline and Main" },
                            { token: "1E", meaning: "level_idc: 0x1E = 30 = Level 3.0. Standard 720p@30 level for adaptive streaming lowest rung" }
                        ]
                    },
                    overview: "Constrained Baseline is not a separate profile_idc — it's Baseline (0x42) with constraint_set1 (Main-compatible) set. This intersection means: I/P frames only (from Baseline) + no FMO/ASO (from Main). The result is the simplest possible H.264 that both Baseline and Main decoders accept\n\nApple's HLS Authoring Specification mandates Constrained Baseline 3.0 (avc1.42C01E) as the minimum rung in adaptive bitrate ladders. Every HLS player must handle this string. It's the 'universal fallback' codec for streaming\n\nCompare the constraint bytes: 42E01E (Baseline) vs 42C01E (Constrained Baseline). The only difference is 0xE0 vs 0xC0 — Baseline sets constraint_set2 (Extended-compatible) while Constrained Baseline doesn't. In practice both decode identically on every player",
                    references: [
                        { title: 'ITU-T H.264' },
                        { title: 'ISO/IEC 14496-15' }
                    ]
                }
            },
            // High 10 Profile (10-bit)
            {
                name: "H.264 High 10 (10-bit)",
                codec: 'video/mp4; codecs="avc1.6e0033"',
                container: "MP4",
                info: "10-bit support",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="avc1.6e0033"',
                        width: 1920,
                        height: 1080,
                        bitrate: 10000000,
                        framerate: 30
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: "video/mp4",
                        string: "avc1.6e0033",
                        parts: [
                            { token: "avc1", meaning: "AVC tag: H.264 with out-of-band parameter sets" },
                            { token: "6e", meaning: "profile_idc: 0x6E = 110 = High 10 Profile. Extends High Profile to 10-bit sample depth (1024 luma levels vs 256). Each profile extends the one below: Baseline → Main → High → High 10 → High 4:2:2 → High 4:4:4 Predictive" },
                            { token: "00", meaning: "constraint_set flags: 0x00 = no constraints. High 10 with no constraints uses the full toolset: 8×8 transforms, CABAC, B-frames, custom quant matrices, plus 10-bit sample precision" },
                            { token: "33", meaning: "level_idc: 0x33 = 51 = Level 5.1. Same level arithmetic as 8-bit — levels don't change based on bit depth, but 10-bit doubles the raw data per pixel so the effective bitrate ceiling matters more" }
                        ]
                    },
                    overview: "High 10 is infamous in the anime fansub community. x264's 10-bit mode reduces banding in gradient-heavy animation (common in anime's flat-shaded cel style) by encoding in 10-bit then dithering to 8-bit on display. The encoder gets more precision for quantization decisions even if the display is 8-bit\n\nHardware decode support is rare: no browser ships a High 10 H.264 hardware decoder. Chrome, Firefox, and Safari all report unsupported. The content exists overwhelmingly in MKV fansub releases played through VLC/mpv with software decode (libx264). Jellyfin/Plex must transcode these to 8-bit High for streaming\n\nThis is why HEVC Main 10 and AV1 Main exist — they made 10-bit the baseline profile instead of an extension. If you need 10-bit in a browser, use HEVC Main 10 (hev1.2.4.L153.B0) or AV1 Main (av01.0.08M.10)",
                    references: [
                        { title: 'ITU-T H.264' },
                        { title: 'ISO/IEC 14496-15' }
                    ]
                }
            },
            // Additional AVC levels and profiles
            {
                name: "H.264 High (Level 4.0 1080p)",
                codec: 'video/mp4; codecs="avc1.640028"',
                container: "MP4",
                info: "Level 4.0 1080p@30",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="avc1.640028"',
                        width: 1920,
                        height: 1080,
                        bitrate: 5000000,
                        framerate: 30
                    }
                }
            },
            {
                name: "H.264 High (Level 4.2 1080p60)",
                codec: 'video/mp4; codecs="avc1.64002A"',
                container: "MP4",
                info: "Level 4.2 1080p@60",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="avc1.64002A"',
                        width: 1920,
                        height: 1080,
                        bitrate: 10000000,
                        framerate: 60
                    }
                }
            },
            {
                name: "H.264 Constrained High (Level 4.0)",
                codec: 'video/mp4; codecs="avc1.640C28"',
                container: "MP4",
                info: "Constrained High Profile",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="avc1.640C28"',
                        width: 1920,
                        height: 1080,
                        bitrate: 5000000,
                        framerate: 30
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: "video/mp4",
                        string: "avc1.640C28",
                        parts: [
                            { token: "avc1", meaning: "AVC tag: H.264 with out-of-band parameter sets" },
                            { token: "64", meaning: "profile_idc: 0x64 = 100 = High Profile. Same profile byte as regular High — the 'Constrained' modifier lives entirely in the constraint flags" },
                            { token: "0C", meaning: "constraint_set flags: 0x0C = bits 4+5 set (constraint_set4 + constraint_set5). This specific combination on High Profile creates 'Constrained High' — a subset that prohibits certain coding tools to reduce decoder complexity. Added in the 2012 amendment to ITU-T H.264" },
                            { token: "28", meaning: "level_idc: 0x28 = 40 = Level 4.0. Blu-ray standard level for 1080p@30. Combined with Constrained High this is the Apple HLS recommended string for 1080p30 HD rungs" }
                        ]
                    },
                    overview: "Constrained High (constraint_set4+5) restricts High Profile by disabling: monochrome mode, scaling lists for 4:2:2/4:4:4, and some weighted prediction modes. The resulting subset is easier for hardware decoders to implement without sacrificing meaningful compression efficiency\n\nApple's HLS Authoring Specification recommends avc1.640028 (High 4.0) for general 1080p and avc1.640C28 (Constrained High 4.0) as an interop-safe alternative. The difference: 0x00 vs 0x0C constraint flags. Most hardware decoders treat them identically\n\nThe constraint_set4/5 flags (bits 4 and 5) were added later than the original set0-3 flags. They repurpose previously reserved bits in the SPS. Old decoders that predate the 2012 amendment ignore these bits, so Constrained High is backwards-compatible with regular High decoders",
                    references: [
                        { title: 'ITU-T H.264' },
                        { title: 'ISO/IEC 14496-15' }
                    ]
                }
            },
            {
                name: "H.264 High (4K Level 5.2)",
                codec: 'video/mp4; codecs="avc1.640034"',
                container: "MP4",
                info: "4K H.264 (rare)",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="avc1.640034"',
                        width: 3840,
                        height: 2160,
                        bitrate: 25000000,
                        framerate: 30
                    }
                }
            },
            {
                name: "H.264 Extended Profile (Level 3.0)",
                codec: 'video/mp4; codecs="avc1.58A01E"',
                container: "MP4",
                info: "Extended Profile streaming",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="avc1.58A01E"',
                        width: 1280,
                        height: 720,
                        bitrate: 3000000,
                        framerate: 30
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: "video/mp4",
                        string: "avc1.58A01E",
                        parts: [
                            { token: "avc1", meaning: "AVC tag: H.264 with out-of-band parameter sets" },
                            { token: "58", meaning: "profile_idc: 0x58 = 88 = Extended Profile. A side branch from Baseline: adds B-frames, SP/SI slices (switching pictures), and data partitioning for error resilience — but lacks CABAC and 8×8 transforms that Main/High have" },
                            { token: "A0", meaning: "constraint_set flags: 0xA0 = bits 0+2 set (constraint_set0 + constraint_set2). Constraint_set0 (Baseline-compatible) + constraint_set2 (Extended-compatible) — declares the stream can be decoded by both Baseline and Extended decoders" },
                            { token: "1E", meaning: "level_idc: 0x1E = 30 = Level 3.0. Standard 720p@30 level" }
                        ]
                    },
                    overview: "Extended Profile was designed for streaming with graceful degradation — its SP/SI slices allow switching between bitrate streams without I-frame alignment, and data partitioning lets a decoder recover from packet loss. In theory, ideal for mobile networks circa 2005\n\nIn practice, Extended Profile was dead on arrival. CABAC-based Main/High profiles gave better compression, adaptive bitrate (HLS/DASH) solved stream switching at the manifest level, and no major hardware vendor implemented Extended's SP/SI decoding. By the time streaming took off, Extended was irrelevant\n\nMost browsers report 'unsupported' for this string. It exists in the spec but has near-zero real-world content. If you see it reported as supported, the browser is likely accepting the Baseline-compatible subset (via constraint_set0) and ignoring the Extended-specific tools",
                    references: [
                        { title: 'ITU-T H.264' },
                        { title: 'ISO/IEC 14496-15' }
                    ]
                }
            },
            {
                name: "H.264 High 4:2:2 (Level 4.0 MP4)",
                codec: 'video/mp4; codecs="avc1.7A0028"',
                container: "MP4",
                info: "Professional 4:2:2 chroma",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="avc1.7A0028"',
                        width: 1920,
                        height: 1080,
                        bitrate: 20000000,
                        framerate: 30
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: "video/mp4",
                        string: "avc1.7A0028",
                        parts: [
                            { token: "avc1", meaning: "AVC tag: H.264 with out-of-band parameter sets" },
                            { token: "7A", meaning: "profile_idc: 0x7A = 122 = High 4:2:2 Profile. Extends High 10 with 4:2:2 chroma subsampling — double the color resolution of standard 4:2:0. Profile hierarchy: High (100) → High 10 (110) → High 4:2:2 (122) → High 4:4:4 Predictive (244)" },
                            { token: "00", meaning: "constraint_set flags: 0x00 = no constraints. Full High 4:2:2 toolset including 10-bit samples, 4:2:2 chroma, 8×8 transforms, CABAC, and B-frames" },
                            { token: "28", meaning: "level_idc: 0x28 = 40 = Level 4.0. At 4:2:2, the bitrate ceiling is 50% higher than 4:2:0 at the same level because there's 50% more chroma data per frame" }
                        ]
                    },
                    overview: "4:2:2 means chroma (Cb/Cr) is sampled at full horizontal resolution but half vertical — twice the color data of 4:2:0 (which halves both). Used in professional video where chroma keying (green screen) or color grading needs precise color edges. Consumer content is always 4:2:0\n\nNo browser supports High 4:2:2 decode. It's a production/editing codec — cameras (Sony XAVC, Canon C-Log) capture in 4:2:2, editors work in 4:2:2, then the final encode for distribution is 4:2:0 High Profile. Jellyfin/Plex will always transcode 4:2:2 H.264\n\nThe profile_idc values form an ascending chain: 66 (Baseline) → 77 (Main) → 88 (Extended) → 100 (High) → 110 (High10) → 122 (High422) → 244 (High444PP). Each adds capabilities; a decoder supporting N supports all profiles below N",
                    references: [
                        { title: 'ITU-T H.264' },
                        { title: 'ISO/IEC 14496-15' }
                    ]
                }
            },
            {
                name: "H.264 Main (720p Level 3.1 MP4)",
                codec: 'video/mp4; codecs="avc1.4d001f"',
                container: "MP4",
                info: "Standard web streaming",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="avc1.4d001f"',
                        width: 1280,
                        height: 720,
                        bitrate: 2500000,
                        framerate: 30
                    }
                }
            },
            {
                name: "H.264 High (WebM non-standard)",
                codec: 'video/webm; codecs="avc1.640033"',
                container: "WebM",
                info: "Non-standard container",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/webm; codecs="avc1.640033"',
                        width: 1920,
                        height: 1080,
                        bitrate: 8000000,
                        framerate: 30
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: "video/webm",
                        string: "avc1.640033",
                        parts: [
                            { token: "avc1", meaning: "AVC tag: H.264 codec identifier — same string regardless of container" },
                            { token: "64", meaning: "profile_idc: 0x64 = 100 = High Profile" },
                            { token: "00", meaning: "constraint_set flags: 0x00 = no constraints" },
                            { token: "33", meaning: "level_idc: 0x33 = 51 = Level 5.1" }
                        ]
                    },
                    overview: "WebM was created by Google specifically for VP8/VP9/AV1 — the container spec (a Matroska subset) was deliberately restricted to royalty-free codecs. H.264 in WebM violates the container specification and no conformant muxer will produce this combination\n\nThis test exists to probe browser behavior: does the browser validate the codec-container pairing, or does it just check codec support independently? Chrome may report 'probably' (it handles H.264 and ignores the container mismatch), while Firefox returns '' (it enforces WebM codec restrictions)\n\nIn media server context, this matters for DASH: some DASH manifests specify video/webm with H.264 codec strings (misconfigured). If the browser reports support, playback might work via MSE. If not, the server needs to re-mux to MP4 or re-encode to VP9",
                    references: [
                        { title: 'ITU-T H.264' },
                        { title: 'ISO/IEC 14496-15' }
                    ]
                }
            },
            // MKV AVC coverage
            {
                name: "H.264 Main (1080p MKV)",
                codec: 'video/x-matroska; codecs="avc1.4d4028"',
                container: "MKV",
                info: "Main Profile in MKV",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="avc1.4d4028"',
                        width: 1920,
                        height: 1080,
                        bitrate: 5000000,
                        framerate: 30
                    }
                }
            },
            {
                name: "H.264 Baseline (720p MKV)",
                codec: 'video/x-matroska; codecs="avc1.42E01E"',
                container: "MKV",
                info: "Baseline in MKV",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="avc1.42E01E"',
                        width: 1280,
                        height: 720,
                        bitrate: 2000000,
                        framerate: 30
                    }
                }
            },
            {
                name: "H.264 High 10 (10-bit MKV)",
                codec: 'video/x-matroska; codecs="avc1.6e0033"',
                container: "MKV",
                info: "10-bit anime common",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="avc1.6e0033"',
                        width: 1920,
                        height: 1080,
                        bitrate: 10000000,
                        framerate: 24
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: "video/x-matroska",
                        string: "avc1.6e0033",
                        parts: [
                            { token: "avc1", meaning: "AVC tag: H.264 codec identifier" },
                            { token: "6e", meaning: "profile_idc: 0x6E = 110 = High 10 Profile. 10-bit sample depth" },
                            { token: "00", meaning: "constraint_set flags: 0x00 = no constraints" },
                            { token: "33", meaning: "level_idc: 0x33 = 51 = Level 5.1" }
                        ]
                    },
                    overview: "This is the dominant format in anime fansub releases (MKV + H.264 High 10 + ASS subtitles + FLAC audio). The MKV container adds another layer of incompatibility — browsers barely support video/x-matroska even for 8-bit H.264, let alone 10-bit\n\nDouble unsupported: the combination of MKV container + High 10 profile means this will fail on every browser. Jellyfin/Plex must remux (MKV→MP4) AND transcode (10-bit→8-bit) — the slowest path possible. This is why anime libraries have the highest transcode load\n\nThe 24fps framerate reflects anime's standard production rate (23.976fps in practice, rounded here). Unlike live-action content which uses 30/60fps, anime at 24fps needs lower level limits — but encoders target Level 5.1 anyway for the higher bitrate ceiling",
                    references: [
                        { title: 'ITU-T H.264' },
                        { title: 'ISO/IEC 14496-15' }
                    ]
                }
            }
        ]
    },

    video_vvc: {
        category: "VVC/H.266",
        tests: [
            {
                name: "VVC Main 10 (4K HDR)",
                codec: 'video/mp4; codecs="vvc1.1.L123.CQ31.S10.T1.B1.H8"',
                container: "MP4",
                info: "Next-gen codec",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="vvc1.1.L123.CQ31.S10.T1.B1.H8"',
                        width: 3840,
                        height: 2160,
                        bitrate: 12000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    codecBreakdown: {
                        string: "vvc1.1.L123.CQ31.S10.T1.B1.H8",
                        parts: [
                            { token: "vvc1", meaning: "VVC tag: Versatile Video Coding in ISO BMFF (MP4). vvc1 = parameter sets in sample entries (out-of-band), like avc1/hvc1. vvi1 = in-band parameter sets, like avc3/hev1. ISO/IEC 14496-15 (2022 amendment) defines both" },
                            { token: "1", meaning: "profile: General profile: 1 = Main 10. VVC simplified the profile mess — Main 10 is the only profile for general video. It handles 8-bit and 10-bit natively (unlike H.264 which needed separate High and High 10 profiles)" },
                            { token: "L123", meaning: "level: L prefix + general_level_idc value. 123 = Level 4.1 (4K@60fps, ~50 Mbps). VVC levels use the formula: level = value / (3 × 10), so L123 = 123/30 = 4.1. Compare: L93=3.1, L153=5.1, L180=6.0" },
                            { token: "CQ31", meaning: "constraint flags: CQ prefix + hex-encoded general_constraint_info bytes. 0x31 encodes the active constraint flags. VVC has 12 constraint flag bytes but typically only the first few are non-zero. The constraint mechanism is more structured than H.264/HEVC" },
                            { token: "S10", meaning: "bit depth: S prefix + max bit depth. S10 = 10-bit samples. S8 would be 8-bit only. Unlike the HEVC profile approach, VVC signals bit depth explicitly in the codec string" },
                            { token: "T1", meaning: "chroma format: T prefix + max chroma format. T1 = 4:2:0 (standard video). T2 = 4:2:2, T3 = 4:4:4. VVC also makes chroma format an explicit parameter rather than hiding it in profile definitions" },
                            { token: "B1", meaning: "general_max_bitdepth_constraint: B prefix + bit depth constraint. B1 = 10-bit capable. Works with S field to define the decoder requirement" },
                            { token: "H8", meaning: "general_max_chroma_format_constraint: H prefix + additional chroma constraint. H8 = hex-encoded constraint value. These trailing fields let decoders quickly reject streams they can't handle without parsing the full bitstream header" }
                        ]
                    },
                    overview: "VVC's codec string is the most verbose of any video codec — 8 dot-separated fields with named prefixes (L, CQ, S, T, B, H). This was deliberate: after the ambiguity of HEVC's hex constraint bytes, the VVC committee made each parameter self-documenting with letter prefixes\n\nVVC claims ~50% bitrate reduction over HEVC at the same quality (and ~75% over H.264). It achieves this through affine motion compensation, geometric partitioning, adaptive loop filtering, and 64×64 CTU sizes. The decoder complexity roughly doubles vs HEVC\n\nAs of 2025, no browser ships VVC decode support. Safari has partial VVC in VideoToolbox (Apple Silicon), Chrome has no timeline. The first hardware decoders appeared in MediaTek Dimensity 9300 (2024) and Samsung Exynos 2400. VVC is 3-5 years from browser ubiquity — following the same adoption curve HEVC had from 2013-2018",
                    references: [
                        { title: 'ITU-T H.266' },
                        { title: 'ISO/IEC 14496-15:2022' }
                    ]
                }
            },
            {
                name: "VVC Main 10 (SDR 1080p)",
                codec: 'video/mp4; codecs="vvc1.1.L93.CQ31.S8.T1.B1.H8"',
                container: "MP4",
                info: "8-bit SDR",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="vvc1.1.L93.CQ31.S8.T1.B1.H8"',
                        width: 1920,
                        height: 1080,
                        bitrate: 2500000,
                        framerate: 24
                    }
                }
            },
            // Additional VVC variants
            {
                name: "VVC Main 10 (4K HDR MKV)",
                codec: 'video/x-matroska; codecs="vvc1.1.L123.CQ31.S10.T1.B1.H8"',
                container: "MKV",
                info: "VVC in Matroska",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="vvc1.1.L123.CQ31.S10.T1.B1.H8"',
                        width: 3840,
                        height: 2160,
                        bitrate: 12000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                }
            },
            {
                name: "VVC Main 10 (8K Level 6.0)",
                codec: 'video/mp4; codecs="vvc1.1.L180.CQ31.S10.T1.B1.H8"',
                container: "MP4",
                info: "8K next-gen",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="vvc1.1.L180.CQ31.S10.T1.B1.H8"',
                        width: 7680,
                        height: 4320,
                        bitrate: 30000000,
                        framerate: 30,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    codecBreakdown: {
                        string: "vvc1.1.L180.CQ31.S10.T1.B1.H8",
                        parts: [
                            { token: "vvc1", meaning: "VVC tag: VVC out-of-band parameter sets" },
                            { token: "1", meaning: "profile: Main 10 — the only general profile in VVC" },
                            { token: "L180", meaning: "level: L180 = Level 6.0 (180/30=6.0). The highest defined VVC level: 8K@60fps or 4K@120fps. Maximum bitrate: 800 Mbps (Main tier) or 1600 Mbps (High tier). Level 6.0 is the '8K broadcast' target — NHK's Super Hi-Vision spec" },
                            { token: "CQ31.S10.T1.B1.H8", meaning: "constraints: Same constraint set as the 4K entry — Main 10, 4:2:0, 10-bit. The level is the only difference between this and L123 (4K)" }
                        ]
                    },
                    overview: "VVC level arithmetic: divide by 30 to get major.minor. L93=3.1, L123=4.1, L153=5.1, L180=6.0. This differs from HEVC (divide by 30, multiply by... nothing, same formula) but the actual level values differ — HEVC L153=5.1 and VVC L153=5.1 have different capability limits\n\n8K VVC at Level 6.0 targets ~50% bitrate reduction over HEVC Level 6.0 at the same quality. That means 8K HDR10 at ~30 Mbps instead of ~60 Mbps — bringing 8K streaming into the range of residential broadband. NHK and ATSC 3.0 are the primary drivers\n\nNo consumer device decodes 8K VVC today. The first hardware decoders (MediaTek Dimensity 9300) max out at 4K@120fps (Level 5.1). 8K VVC will require next-generation SoCs targeting 2026-2027 — and by then, the question is whether 8K content will exist outside of NHK broadcasts and demo reels",
                    references: [
                        { title: 'ITU-T H.266' },
                        { title: 'ISO/IEC 14496-15:2022' }
                    ]
                }
            },
            {
                name: "VVC Main 10 (vvi1 tag)",
                codec: 'video/mp4; codecs="vvi1.1.L123.CQ31.S10.T1.B1.H8"',
                container: "MP4",
                info: "Alternative VVC tag",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="vvi1.1.L123.CQ31.S10.T1.B1.H8"',
                        width: 3840,
                        height: 2160,
                        bitrate: 12000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    codecBreakdown: {
                        string: "vvi1.1.L123.CQ31.S10.T1.B1.H8",
                        parts: [
                            { token: "vvi1", meaning: "VVC in-band tag: VVC with parameter sets (SPS/PPS) stored in the bitstream itself, not in the MP4 sample entry. Same relationship as hev1/hvc1 (HEVC) and avc3/avc1 (H.264). All three codec generations have this out-of-band vs in-band distinction" },
                            { token: "1.L123.CQ31.S10.T1.B1.H8", meaning: "parameters: Identical parameter fields to vvc1 — profile, level, constraints, bit depth, chroma, and constraint values. The tag is the only difference" }
                        ]
                    },
                    overview: "The tag pairs across codec generations: avc1/avc3 (H.264), hvc1/hev1 (HEVC), vvc1/vvi1 (VVC). Out-of-band (avc1/hvc1/vvc1) stores decoder config in the container; in-band (avc3/hev1/vvi1) includes it in every access unit. Out-of-band is more efficient; in-band is needed for live/broadcast where receivers join mid-stream\n\nFor DASH and HLS, vvc1 (out-of-band) is preferred — the init segment carries the decoder config once, and each media segment is pure coded data. vvi1 would repeat parameter sets in every segment, wasting bandwidth. In-band matters for MPEG-TS (no init segment concept) and broadcast DVB-VVC\n\nTesting both tags reveals whether a browser's VVC implementation (when it exists) handles both carriage modes. Early implementations often support only vvc1 since that's what MP4 demuxers expect. vvi1 support requires the demuxer to detect and strip in-band parameter sets",
                    references: [
                        { title: 'ITU-T H.266' },
                        { title: 'ISO/IEC 14496-15:2022' }
                    ]
                }
            },
            {
                name: "VVC Main 10 Still Picture",
                codec: 'video/mp4; codecs="vvc1.1.L93.CQ31.S10.T1.B1.H8"',
                container: "MP4",
                info: "VVC still image",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="vvc1.1.L93.CQ31.S10.T1.B1.H8"',
                        width: 1920,
                        height: 1080,
                        bitrate: 5000000,
                        framerate: 1
                    }
                }
            },
            // MKV VVC coverage
            {
                name: "VVC Main 10 (SDR 1080p MKV)",
                codec: 'video/x-matroska; codecs="vvc1.1.L93.CQ31.S8.T1.B1.H8"',
                container: "MKV",
                info: "VVC SDR in MKV",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="vvc1.1.L93.CQ31.S8.T1.B1.H8"',
                        width: 1920,
                        height: 1080,
                        bitrate: 2500000,
                        framerate: 24
                    }
                }
            },
            {
                name: "VVC Main 10 (8K MKV)",
                codec: 'video/x-matroska; codecs="vvc1.1.L180.CQ31.S10.T1.B1.H8"',
                container: "MKV",
                info: "VVC 8K in MKV",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="vvc1.1.L180.CQ31.S10.T1.B1.H8"',
                        width: 7680,
                        height: 4320,
                        bitrate: 30000000,
                        framerate: 30,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                }
            }
        ]
    },

    // ==================== STREAMING FORMATS ====================

    streaming_hls: {
        category: "HLS/DASH Streaming",
        tests: [
            // HLS fMP4 with HEVC
            {
                name: "HLS fMP4 HEVC (4K HDR)",
                codec: 'video/mp4; codecs="hvc1.2.4.L153.B0"',
                container: "fMP4",
                info: "Apple HLS fragmented",
                mediaConfig: {
                    type: 'media-source',
                    video: {
                        contentType: 'video/mp4; codecs="hvc1.2.4.L153.B0"',
                        width: 3840,
                        height: 2160,
                        bitrate: 25000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    overview: 'HLS (HTTP Live Streaming) with fragmented MP4 (fMP4) containers enables adaptive bitrate streaming for HEVC content. Unlike traditional MP4, fMP4 splits video into small segments (typically 2-10 seconds) allowing real-time streaming and bitrate adaptation. This test uses type: "media-source" to verify MSE (Media Source Extensions) API support, which Jellyfin/Plex/Emby require for in-browser transcoding and direct play.',
                    streaming: {
                        hls: {
                            m3u8: `#EXTM3U
#EXT-X-VERSION:6
#EXT-X-TARGETDURATION:10
#EXT-X-MEDIA-SEQUENCE:0

#EXTINF:10.0,
segment_0.m4s
#EXTINF:10.0,
segment_1.m4s
#EXTINF:10.0,
segment_2.m4s
#EXT-X-ENDLIST`,
                            notes: 'Media playlist (.m3u8) references .m4s segment files. Each segment is a self-contained fMP4 with moof+mdat boxes. Requires separate init segment (init.mp4) with moov box. EXT-X-VERSION:6 minimum per RFC 8216 Section 4.3.2.5 enables EXT-X-MAP for fMP4 init segments. Version 7 adds EXT-X-DATERANGE for SCTE-35 markers. Apple recommends Version 7 for all new fMP4 HLS deployments.'
                        },
                        dash: {
                            mpd: `<Period>
  <AdaptationSet mimeType="video/mp4" codecs="hvc1.2.4.L153.B0" segmentAlignment="true">
    <SegmentTemplate timescale="1000" initialization="init.mp4" media="segment_$Number$.m4s" startNumber="0">
      <SegmentTimeline>
        <S t="0" d="10000" r="2"/>
      </SegmentTimeline>
    </SegmentTemplate>
    <Representation bandwidth="25000000" width="3840" height="2160"/>
  </AdaptationSet>
</Period>`,
                            notes: 'DASH uses same fMP4 container as HLS (CMAF-compatible). SegmentTemplate with initialization specifies init segment, media template for numbered segments. timescale="1000" means milliseconds. DASH has better multi-codec support than HLS but less Apple ecosystem integration.'
                        }
                    },
                    platforms: {
                        apple: 'Safari/WebKit has native HLS support with fMP4 since iOS 10+/macOS 10.12+. MSE API support added in iOS 17.1+/macOS Sonoma for web apps. Native HLS playback (via video.src) bypasses MSE and uses system decoder, offering better battery efficiency. Web apps using MSE (like Jellyfin web) require iOS 17.1+.',
                        lg: 'webOS supports MSE + HLS fMP4 since webOS 3.0. Native media pipeline handles segment concatenation. Jellyfin app uses webOS Luna API (getAppInfo, mediacodec) for direct hardware decoding. Race condition in early app launch may cause false negatives in codec detection.',
                        android: 'Chrome on Android supports MSE + fMP4 since Android 7.0. ExoPlayer (used by many media apps) has excellent HLS support. Hardware HEVC decoding requires MediaCodec with HEVC profile support. Software decoding fallback available but not performant for 4K HDR. Widevine L1 required for protected content.'
                    },
                    references: [
                        { title: 'ISO/IEC 23008-2' },
                        { title: 'ISO/IEC 14496-15 Annex E' },
                        { title: 'RFC 8216', url: 'https://datatracker.ietf.org/doc/html/rfc8216' },
                        { title: 'Apple HLS Authoring Spec', url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices' },
                        { title: 'ISO/IEC 23009-1' },
                        { title: 'DASH-IF IOP', url: 'https://dashif.org/guidelines/' },
                        { title: 'webOS TV AV Formats', url: 'https://webostv.developer.lge.com/develop/specifications/video-audio-250' },
                        { title: 'Android Supported Media Formats', url: 'https://developer.android.com/media/platform/supported-formats' }
                    ]
                }
            },
            // HLS fMP4 with AVC
            {
                name: "HLS fMP4 H.264 (1080p)",
                codec: 'video/mp4; codecs="avc1.640033"',
                container: "fMP4",
                info: "HLS baseline",
                mediaConfig: {
                    type: 'media-source',
                    video: {
                        contentType: 'video/mp4; codecs="avc1.640033"',
                        width: 1920,
                        height: 1080,
                        bitrate: 5000000,
                        framerate: 30
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: 'video/mp4',
                        string: 'avc1.640033',
                        parts: [
                            { token: 'avc1', meaning: 'AVC/H.264 in ISO BMFF. For HLS fMP4, the same codec string as file-based H.264 — the delivery changes from single MP4 to fragmented segments' },
                            { token: '64', meaning: 'profile_idc 0x64 = High Profile' },
                            { token: '00', meaning: 'constraint_set flags: no additional constraints' },
                            { token: '33', meaning: 'level_idc 0x33 = Level 5.1. Supports up to 4K@30fps, though this test targets 1080p@30fps (level headroom for high bitrates)' }
                        ]
                    },
                    overview: "H.264 in HLS fMP4 is the universal fallback — every HLS-capable device supports it. Apple's HLS Authoring Specification requires at least one H.264 variant in every adaptive bitrate stream for backward compatibility with older Apple TVs, iPads, and third-party players\n\nfMP4 H.264 replaced MPEG-TS H.264 as Apple's preferred HLS container starting with HLS v7 (2017). The advantages: lower per-segment overhead (fMP4 headers are smaller than TS headers), byte-range addressing for trick play, CMAF compatibility for unified HLS/DASH delivery, and more precise seeking (sample-accurate vs PES-packet-accurate)\n\nFor Jellyfin/Plex, H.264 fMP4 is the safest transcode target when the client's HEVC/AV1 capability is unknown. Every MSE-capable browser can play H.264 fMP4 via Media Source Extensions",
                    streaming: {
                        hls: {
                            m3u8: `#EXTM3U
#EXT-X-VERSION:7
#EXT-X-TARGETDURATION:6
#EXT-X-MAP:URI="init_h264.mp4"

#EXTINF:6.006,
seg_h264_0.m4s
#EXTINF:6.006,
seg_h264_1.m4s
#EXTINF:6.006,
seg_h264_2.m4s
#EXT-X-ENDLIST`,
                            notes: 'H.264 HLS fMP4 media playlist: EXT-X-MAP references the init segment (moov box with avcC configuration). 6-second segments are the Apple-recommended duration for VOD. This playlist is referenced from the master playlist as the lowest-capability variant — players that cannot handle HEVC or AV1 variants select this one.'
                        }
                    },
                    references: [
                        { title: 'ITU-T H.264' },
                        { title: 'ISO/IEC 14496-15' },
                        { title: 'RFC 8216', url: 'https://datatracker.ietf.org/doc/html/rfc8216' },
                        { title: 'Apple HLS Authoring Spec', url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices' },
                        { title: 'ISO/IEC 23009-1' },
                        { title: 'DASH-IF IOP', url: 'https://dashif.org/guidelines/' }
                    ]
                }
            },
            // CMAF (Common Media Application Format)
            {
                name: "CMAF HEVC (4K)",
                codec: 'video/mp4; codecs="hvc1.2.4.L153.B0"',
                container: "CMAF",
                info: "HLS/DASH unified",
                mediaConfig: {
                    type: 'media-source',
                    video: {
                        contentType: 'video/mp4; codecs="hvc1.2.4.L153.B0"',
                        width: 3840,
                        height: 2160,
                        bitrate: 20000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    codecBreakdown: {
                        string: "hvc1.2.4.L153.B0",
                        parts: [
                            { token: "hvc1.2.4.L153.B0", meaning: "HEVC Main 10 L5.1: Same HEVC codec string as regular MP4 — CMAF doesn't change the codec, only the container constraints. CMAF (ISO/IEC 23000-19) is a profile of fMP4 that both HLS and DASH can consume from the same encoded segments" }
                        ]
                    },
                    overview: "CMAF solved the 'encode twice' problem. Before CMAF, HLS required MPEG-TS segments and DASH required fMP4 segments — CDNs had to store two copies of every video. CMAF defines a single fMP4 segment format that both HLS (via EXT-X-MAP) and DASH (via SegmentTemplate) can reference directly\n\nThe key CMAF constraints: fragmented MP4 only (no regular MP4), single-track fragments (video and audio in separate tracks), common encryption (CENC with cbcs mode). These restrictions ensure interop between Apple's HLS stack and DASH players like dash.js/Shaka\n\nThis test uses type: 'media-source' because CMAF segments are consumed via MSE (Media Source Extensions). The browser never sees a 'CMAF' MIME type — it's video/mp4 with fMP4 segments. The 'CMAF' container label here is informational — what matters is MSE support for HEVC fMP4",
                    streaming: {
                        hls: {
                            m3u8: `#EXTM3U
#EXT-X-VERSION:7
#EXT-X-INDEPENDENT-SEGMENTS

#EXT-X-STREAM-INF:BANDWIDTH=20000000,CODECS="hvc1.2.4.L153.B0",RESOLUTION=3840x2160,VIDEO-RANGE=PQ,FRAME-RATE=24.000
hevc_4k_hdr/playlist.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=8000000,CODECS="hvc1.2.4.L120.B0",RESOLUTION=1920x1080,FRAME-RATE=24.000
hevc_1080_sdr/playlist.m3u8`,
                            notes: 'CMAF + HLS: EXT-X-VERSION:7 per RFC 8216 — Version 6 (Section 4.3.2.5) enables EXT-X-MAP for fMP4 init segments, Version 7 adds EXT-X-DATERANGE. VIDEO-RANGE=PQ signals HDR10/DV to the player. CMAF\'s key benefit: one set of fMP4 segments serves both HLS and DASH — the CDN stores segments once, with different manifests (m3u8 vs MPD) pointing to the same media files.'
                        },
                        dash: {
                            mpd: `<AdaptationSet mimeType="video/mp4" codecs="hvc1.2.4.L153.B0"
    segmentAlignment="true" subsegmentAlignment="true">
  <SegmentTemplate timescale="24000"
    initialization="init_hevc_4k.mp4"
    media="seg_hevc_4k_$Number$.m4s"/>
  <Representation id="hevc_4k" bandwidth="20000000"
    width="3840" height="2160" frameRate="24000/1000"/>
</AdaptationSet>`,
                            notes: 'CMAF + DASH: Same init.mp4 and .m4s segments as HLS. subsegmentAlignment=true enables low-latency chunked transfer. The CMAF guarantee: identical fMP4 atoms between HLS and DASH — byte-for-byte the same segments on the CDN.'
                        }
                    },
                    platforms: {
                        apple: 'Apple adopted CMAF for HLS starting with HLS v7 (iOS 11, macOS High Sierra). Apple mandates cbcs encryption mode (AES-CBC with subsample patterns) — not cenc/ctr mode. This is the single biggest CMAF interop pain point: content encrypted with cenc/ctr for DASH will not play on Apple devices without re-encrypting. Apple also requires specific fMP4 brands (cmfc in the ftyp box), single-track fragments (video and audio in separate moof/mdat pairs), and EXT-X-MAP in the media playlist pointing to the init segment. The Apple HLS Authoring Specification adds constraints beyond ISO 23000-19: Apple mandates I-frame-only playlists (EXT-X-I-FRAME-STREAM-INF) for trick play, and VIDEO-RANGE=PQ/HLG for HDR signaling.',
                        dolby: 'Dolby\'s CMAF requirements center on DV metadata delivery. For CMAF DV Profile 8.1, the dvcC (Dolby Vision Codec Configuration) box must be present in the init segment\'s HEVC sample entry. The RPU NALUs are in-band (in each moof/mdat fragment). For dual-layer DV (Profile 7), Dolby specifies track group signaling via the trgr box — both the BL and EL tracks reference the same track group. Dolby\'s "Bitstreams Within the ISO Base Media File Format" specification defines these CMAF constraints. The key difference from plain HEVC CMAF: the init segment\'s stsd box contains additional DV config boxes that Apple, LG, and Android DV stacks each parse differently.',
                        lg: 'webOS 4.0+ (2019 TVs) supports CMAF playback. webOS reads the init segment natively — the dvcC box in the sample entry triggers DV decoding at the firmware level via the Luna media pipeline. Unlike browsers that rely on MSE + JS codec detection, webOS\' native CMAF parser bypasses web APIs entirely. webOS 6+ added cbcs encryption support (required for Apple-compatible CMAF). Before webOS 6, only cenc/ctr was supported — meaning pre-2021 LG TVs cannot play Apple-encrypted CMAF content. webOS 25+ improved CMAF chunk boundary handling for low-latency streaming (LL-HLS/LL-DASH with chunked transfer encoding).',
                        android: 'Android\'s CMAF support depends on the player layer. ExoPlayer (used by Jellyfin/Kodi Android) handles CMAF natively with both cbcs and cenc/ctr modes since ExoPlayer 2.12+. The underlying MediaCodec API doesn\'t know about CMAF — ExoPlayer demuxes fMP4 and feeds NALUs to the hardware decoder. For DV CMAF, ExoPlayer reads the dvcC box from the init segment and activates the DV decoder path if the SoC supports it (Snapdragon 865+, Dimensity 1000+). Android 12+ added platform-level cbcs support, fixing compatibility with Apple-encrypted CMAF on older ExoPlayer versions.'
                    },
                    references: [
                        { title: 'ISO/IEC 23008-2' },
                        { title: 'ISO/IEC 14496-15 Annex E' },
                        { title: 'ISO/IEC 23000-19' },
                        { title: 'RFC 8216', url: 'https://datatracker.ietf.org/doc/html/rfc8216' },
                        { title: 'Apple HLS Authoring Spec', url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices' },
                        { title: 'webOS TV AV Formats', url: 'https://webostv.developer.lge.com/develop/specifications/video-audio-250' },
                        { title: 'Android Supported Media Formats', url: 'https://developer.android.com/media/platform/supported-formats' }
                    ]
                }
            },
            // DASH with AV1
            {
                name: "DASH AV1 (4K HDR)",
                codec: 'video/mp4; codecs="av01.0.08M.10"',
                container: "DASH",
                info: "MPEG-DASH",
                mediaConfig: {
                    type: 'media-source',
                    video: {
                        contentType: 'video/mp4; codecs="av01.0.08M.10"',
                        width: 3840,
                        height: 2160,
                        bitrate: 15000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: 'video/mp4',
                        string: 'av01.0.08M.10',
                        parts: [
                            { token: 'av01', meaning: 'AV1 in ISO BMFF for DASH delivery' },
                            { token: '0', meaning: 'Main Profile: 4:2:0 chroma subsampling' },
                            { token: '08M', meaning: 'Level 4.0 Main Tier. 4K@30fps capable. M = Main Tier bitrate limits' },
                            { token: '10', meaning: '10-bit: Required for HDR10 PQ transfer function' }
                        ]
                    },
                    overview: "AV1 DASH with HDR10 is the format YouTube and Netflix use for 4K HDR on non-Apple devices. AV1's royalty-free status means no per-stream licensing fees — a major factor at YouTube/Netflix scale (billions of streams per day)\n\nDASH HDR signaling for AV1 uses SupplementalProperty with CICP codes, same as HEVC DASH. The AV1 bitstream also carries HDR metadata internally (OBU metadata with HDR_CLL and HDR_MDCV), but DASH players rely on the MPD properties for initial HDR pipeline activation before parsing the first segment",
                    references: [
                        { title: 'AV1 Bitstream & Decoding Process Spec', url: 'https://aomediacodec.github.io/av1-spec/' },
                        { title: 'AV1 Codec ISO Media File Format Binding', url: 'https://aomediacodec.github.io/av1-isobmff/' },
                        { title: 'ISO/IEC 23009-1' },
                        { title: 'DASH-IF IOP', url: 'https://dashif.org/guidelines/' }
                    ]
                }
            },
            // DASH with VP9
            {
                name: "DASH VP9 (4K HDR)",
                codec: 'video/webm; codecs="vp09.02.10.10"',
                container: "DASH",
                info: "WebM DASH",
                mediaConfig: {
                    type: 'media-source',
                    video: {
                        contentType: 'video/webm; codecs="vp09.02.10.10"',
                        width: 3840,
                        height: 2160,
                        bitrate: 20000000,
                        framerate: 60,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: 'video/webm',
                        string: 'vp09.02.10.10',
                        parts: [
                            { token: 'vp09', meaning: 'VP9 with full profile/level/depth string' },
                            { token: '02', meaning: 'Profile 2: 10-bit 4:2:0 HDR capable' },
                            { token: '10', meaning: 'Level 1.0: Covers up to 4K@30fps in VP9 level numbering' },
                            { token: '10', meaning: '10-bit depth: Required for PQ/HLG HDR' }
                        ]
                    },
                    overview: "VP9 HDR via DASH in WebM container is the YouTube legacy HDR format. Before AV1 hardware decode became widespread (2021+), VP9 Profile 2 was the only royalty-free way to stream 4K HDR. YouTube still serves VP9 HDR to devices that lack AV1 hardware decode\n\nThe WebM container in DASH uses Matroska-based segments (not ISO BMFF). This means VP9 WebM DASH and VP9 MP4 DASH have different segment formats despite carrying the same codec. Chrome supports both, Firefox supports both, Safari supports neither (no VP9). For Jellyfin, VP9 DASH is useful for Chrome/Firefox clients without HEVC support",
                    references: [
                        { title: 'VP9 Bitstream & Decoding Process Spec' },
                        { title: 'VP9 Codec ISO Media File Format Binding', url: 'https://www.webmproject.org/vp9/mp4/' },
                        { title: 'ISO/IEC 23009-1' },
                        { title: 'DASH-IF IOP', url: 'https://dashif.org/guidelines/' }
                    ]
                }
            },
            {
                name: "DASH VP9 (SDR 1080p WebM)",
                codec: 'video/webm; codecs="vp09.00.21.08"',
                container: "DASH",
                info: "SDR VP9 streaming",
                mediaConfig: {
                    type: 'media-source',
                    video: {
                        contentType: 'video/webm; codecs="vp09.00.21.08"',
                        width: 1920,
                        height: 1080,
                        bitrate: 5000000,
                        framerate: 30
                    }
                },
                education: {
                    "codecBreakdown": {
                        "mime": "video/webm",
                        "string": "vp09.00.21.08",
                        "parts": [
                            {
                                "token": "vp09",
                                "meaning": "VP9 codec in the full codec string format (vs bare \"vp9\"). The vp09 prefix enables profile/level/bitdepth specification."
                            },
                            {
                                "token": "00",
                                "meaning": "Profile 0 — 8-bit 4:2:0 YUV. The most widely supported VP9 profile."
                            },
                            {
                                "token": "21",
                                "meaning": "Level 2.1 — supports 1280x720 @ 60fps or 1920x1080 @ 30fps. Matches 1080p SDR content."
                            },
                            {
                                "token": "08",
                                "meaning": "8-bit color depth."
                            }
                        ]
                    },
                    "overview": "VP9 SDR in WebM container for DASH streaming. YouTube uses this exact configuration for 1080p SDR delivery — VP9 Profile 0 in WebM is the most widely deployed adaptive streaming codec on the web. MSE (MediaSource Extensions) has excellent VP9+WebM support in Chrome and Firefox. Safari does not support WebM containers, making this a Chrome/Firefox-only streaming path. For cross-browser DASH, MP4 containers with VP9 provide Safari compatibility.",
                    references: [
                        { title: 'VP9 Bitstream & Decoding Process Spec' },
                        { title: 'VP9 Codec ISO Media File Format Binding', url: 'https://www.webmproject.org/vp9/mp4/' },
                        { title: 'ISO/IEC 23009-1' },
                        { title: 'DASH-IF IOP', url: 'https://dashif.org/guidelines/' }
                    ]
                }
            },
            {
                name: "DASH AV1 (4K HDR WebM)",
                codec: 'video/webm; codecs="av01.0.08M.10"',
                container: "DASH",
                info: "AV1 in WebM container via DASH",
                mediaConfig: {
                    type: 'media-source',
                    video: {
                        contentType: 'video/webm; codecs="av01.0.08M.10"',
                        width: 3840,
                        height: 2160,
                        bitrate: 15000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    "codecBreakdown": {
                        "mime": "video/webm",
                        "string": "av01.0.08M.10",
                        "parts": [
                            {
                                "token": "av01",
                                "meaning": "AV1 codec identifier."
                            },
                            {
                                "token": "0",
                                "meaning": "Profile 0 (Main) — 8 or 10-bit 4:2:0."
                            },
                            {
                                "token": "08M",
                                "meaning": "Level 4.0, Main tier. Supports 2048x1536 @ 30fps or 4096x2160 @ 30fps."
                            },
                            {
                                "token": "10",
                                "meaning": "10-bit color depth for HDR content."
                            }
                        ]
                    },
                    "overview": "AV1 HDR in WebM container for DASH. This tests AV1 HDR delivery in Google's preferred container format. YouTube serves AV1 HDR in WebM for Chrome — the same codec in MP4 containers targets Safari and TV platforms. The WebM container supports AV1 natively (unlike HEVC, which WebM does not support). For DASH MPD signaling, WebM AV1 uses the same codec string as MP4 AV1 — only the container MIME type changes. This test reveals whether MSE implementations support AV1 HDR specifically in WebM (some support AV1 SDR in WebM but not HDR).",
                    references: [
                        { title: 'AV1 Bitstream & Decoding Process Spec', url: 'https://aomediacodec.github.io/av1-spec/' },
                        { title: 'AV1 Codec ISO Media File Format Binding', url: 'https://aomediacodec.github.io/av1-isobmff/' },
                        { title: 'ISO/IEC 23009-1' },
                        { title: 'DASH-IF IOP', url: 'https://dashif.org/guidelines/' }
                    ]
                }
            },
            // Additional streaming formats
            {
                name: "HLS fMP4 Dolby Vision P8.1",
                codec: 'video/mp4; codecs="dvh1.08.06"',
                container: "fMP4",
                info: "DV streaming via HLS",
                mediaConfig: {
                    type: 'media-source',
                    video: {
                        contentType: 'video/mp4; codecs="dvh1.08.06"',
                        width: 3840,
                        height: 2160,
                        bitrate: 20000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    codecBreakdown: {
                        string: "dvh1.08.06",
                        parts: [
                            { token: "dvh1", meaning: "DV HEVC tag: Dolby Vision HEVC with in-band RPU NALUs. For HLS streaming, dvh1 is required (not dvhe) because fMP4 segments must carry the DV metadata in-band — there's no init-segment-only path for RPU delivery" },
                            { token: "08", meaning: "profile: Profile 8 = HEVC single-layer with backward-compatible base layer. The dominant streaming profile: plays as HDR10 on non-DV devices, with DV enhancement on DV-capable displays" },
                            { token: "06", meaning: "level: Level 6 = 4K@60fps max. DV levels map loosely to resolution/framerate: 01=HD, 04=4K@24, 06=4K@60, 09=8K@24" }
                        ]
                    },
                    overview: "Apple HLS signaling: Uses VIDEO-RANGE=PQ in the EXT-X-STREAM-INF tag, CODECS=\"dvh1.08.06\", and REQ-VIDEO-LAYOUT for dual-layer. Apple requires the Dolby Vision codec string in the HLS manifest — if the manifest says hvc1 instead of dvh1, Apple devices decode as HDR10 only (ignoring DV RPU NALUs even if present in the stream)\n\nDolby's reference signaling: Dolby specifies supplemental_codecs in DASH MPD (e.g., supplementalCodecs=\"dvh1.08.06\" alongside codecs=\"hvc1.2.4.L153.B0\"). This lets non-DV players use the HEVC base layer while DV players activate enhancement. HLS has no supplemental_codecs equivalent — Apple uses the CODECS field directly\n\nLG webOS signaling: webOS uses a proprietary DV detection path via Luna IPC getHdrCapabilities. The browser's canPlayType may not reflect DV support — webOS checks firmware-level DV flags separate from web API results. webOS 6+ supports DV Profile 8.1 in MP4/MKV, webOS 25+ added MKV DV Profile 7. The Luna call is async, causing the race condition where early codec detection returns false negatives\n\nThe practical split: Apple devices need dvh1 in HLS manifests. Android/TV devices using ExoPlayer/Shaka interpret supplemental_codecs from DASH. LG webOS bypasses web APIs entirely for DV. Netflix uses separate manifests per platform — one HLS for Apple, one DASH for Android/TV. Jellyfin/Plex must replicate this: serving dvh1 manifests to Apple clients and hvc1+supplemental to DASH clients",
                    streaming: {
                        hls: {
                            m3u8: `#EXTM3U
#EXT-X-VERSION:7
#EXT-X-INDEPENDENT-SEGMENTS

#EXT-X-STREAM-INF:BANDWIDTH=20000000,CODECS="dvh1.08.06",RESOLUTION=3840x2160,VIDEO-RANGE=PQ,FRAME-RATE=24.000
dv_p81_4k/playlist.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=12000000,CODECS="hvc1.2.4.L153.B0",RESOLUTION=3840x2160,VIDEO-RANGE=PQ,FRAME-RATE=24.000
hdr10_4k/playlist.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=5000000,CODECS="avc1.640028",RESOLUTION=1920x1080,FRAME-RATE=24.000
sdr_1080/playlist.m3u8`,
                            notes: 'Apple HLS DV signaling: The DV variant uses CODECS="dvh1.08.06" — Apple devices select this when they detect DV capability. Non-DV devices fall back to the hvc1 (HDR10) or avc1 (SDR) variants. VIDEO-RANGE=PQ is required for Apple to activate the HDR pipeline. Note: no SUPPLEMENTAL-CODECS here — Apple uses separate variant streams, not codec supplementation.'
                        },
                        dash: {
                            mpd: `<AdaptationSet mimeType="video/mp4"
    codecs="hvc1.2.4.L153.B0"
    supplementalCodecs="dvh1.08.06"
    segmentAlignment="true">
  <SegmentTemplate timescale="24000"
    initialization="init_dv_p81.mp4"
    media="seg_dv_p81_$Number$.m4s"/>
  <Representation id="dv_4k" bandwidth="20000000"
    width="3840" height="2160"/>
</AdaptationSet>`,
                            notes: 'DASH DV signaling: codecs= declares the HEVC base layer (backward-compatible HDR10). supplementalCodecs= declares the DV enhancement. Non-DV players read codecs= only and play HEVC. DV players activate both. This is one AdaptationSet serving both audiences — unlike HLS which needs separate variant streams.'
                        }
                    },
                    references: [
                        { title: 'ETSI TS 103 572' },
                        { title: 'RFC 8216', url: 'https://datatracker.ietf.org/doc/html/rfc8216' },
                        { title: 'Apple HLS Authoring Spec', url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices' },
                        { title: 'ISO/IEC 23009-1' },
                        { title: 'DASH-IF IOP', url: 'https://dashif.org/guidelines/' }
                    ]
                }
            },
            {
                name: "HLS MPEG-TS H.264 (1080p)",
                codec: 'video/mp2t; codecs="avc1.640028"',
                container: "MPEG-TS",
                info: "Legacy HLS transport stream",
                mediaConfig: {
                    type: 'media-source',
                    video: {
                        contentType: 'video/mp2t; codecs="avc1.640028"',
                        width: 1920,
                        height: 1080,
                        bitrate: 5000000,
                        framerate: 30
                    }
                },
                education: {
                    codecBreakdown: {
                        string: "avc1.640028",
                        parts: [
                            { token: "avc1.640028", meaning: "H.264 High L4.0: Standard H.264 codec string inside an MPEG Transport Stream container (video/mp2t). The codec string is identical regardless of container — what changes is the MIME type and the segment structure" }
                        ]
                    },
                    overview: "MPEG-TS (MPEG Transport Stream, ISO/IEC 13818-1) was the original HLS container. When Apple introduced HLS in 2009, it chose MPEG-TS because it was already used in DVB broadcasting and supported mid-stream joining (no init segment needed — each .ts segment is self-contained)\n\nHLS versions 1-6 used .ts segments exclusively. HLS v7 (2017) added fMP4 support via the EXT-X-MAP tag. Apple now recommends fMP4 for new content (better seek precision, smaller overhead, CMAF compatibility) but MPEG-TS remains in production for backwards compatibility with older Apple TVs and iOS devices\n\nMSE support for video/mp2t is browser-specific: Safari supports it natively (required for HLS playback). Chrome supports it via the MSE Transmuxer (converts TS→fMP4 client-side). Firefox has limited TS support. For Jellyfin/Plex, this means H.264 in TS streams may work in Safari but need remuxing to fMP4 for Chrome",
                    streaming: {
                        hls: {
                            m3u8: `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-MEDIA-SEQUENCE:0

#EXTINF:10.0,
segment_000.ts
#EXTINF:10.0,
segment_001.ts
#EXTINF:10.0,
segment_002.ts
#EXT-X-ENDLIST`,
                            notes: 'Legacy MPEG-TS HLS: VERSION:3 (no fMP4 support needed). Each .ts segment is self-contained — no separate init segment required (unlike fMP4 which needs EXT-X-MAP). The MPEG-TS container includes PAT/PMT tables and PES headers in every segment, making segments joinable mid-stream but adding ~5% overhead vs fMP4. Jellyfin generates TS segments by default for HLS transcoding because ffmpeg TS muxing is faster than fMP4 muxing.'
                        }
                    },
                    references: [
                        { title: 'ITU-T H.264' },
                        { title: 'ISO/IEC 14496-15' },
                        { title: 'ISO/IEC 13818-1' },
                        { title: 'ISO/IEC 23009-1' },
                        { title: 'DASH-IF IOP', url: 'https://dashif.org/guidelines/' }
                    ]
                }
            },
            {
                name: "HLS MPEG-TS H.264 (720p Baseline)",
                codec: 'video/mp2t; codecs="avc1.42E01E"',
                container: "MPEG-TS",
                info: "Baseline TS for mobile HLS",
                mediaConfig: {
                    type: 'media-source',
                    video: {
                        contentType: 'video/mp2t; codecs="avc1.42E01E"',
                        width: 1280,
                        height: 720,
                        bitrate: 2000000,
                        framerate: 30
                    }
                },
                education: {
                    "codecBreakdown": {
                        "mime": "video/mp2t",
                        "string": "avc1.42E01E",
                        "parts": [
                            {
                                "token": "avc1",
                                "meaning": "H.264/AVC codec."
                            },
                            {
                                "token": "42",
                                "meaning": "profile_idc = 66 = Baseline Profile. No B-frames, no CABAC — maximum device compatibility at the cost of compression efficiency."
                            },
                            {
                                "token": "E0",
                                "meaning": "Constraint flags: constraint_set0_flag=1, constraint_set1_flag=1 (Constrained Baseline). The E0 byte indicates this is Constrained Baseline, which is a proper subset of both Baseline and Main profiles."
                            },
                            {
                                "token": "1E",
                                "meaning": "level_idc = 30 = Level 3.0. Supports 720x576 @ 25fps or 720x480 @ 30fps. Targets mobile devices and low-bandwidth HLS."
                            }
                        ]
                    },
                    "overview": "The mobile-friendly HLS baseline. MPEG-TS with H.264 Constrained Baseline is the lowest common denominator for HLS streaming — supported by every HLS-capable device. Apple originally required this as a mandatory fallback in HLS master playlists (the \"MUST\" variant for cellular). No B-frames means lower latency, and no CABAC means simpler hardware decoders. Modern HLS has relaxed the Baseline requirement, but many CDNs still include a Baseline 720p variant for maximum reach.",
                    "streaming": {
                        "hls": {
                            "m3u8": "#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:10\n#EXT-X-MEDIA-SEQUENCE:0\n#EXTINF:10.000,\nseg0.ts\n#EXTINF:10.000,\nseg1.ts\n#EXT-X-ENDLIST",
                            "notes": "MPEG-TS HLS uses EXT-X-VERSION:3 per RFC 8216 — no fMP4 features needed. Version 6+ enables EXT-X-MAP for fMP4 init segments (Section 4.3.2.5); TS playlists don't use EXT-X-MAP. Apple now recommends fMP4 (Version 7) over TS for new deployments, but TS Baseline 720p remains required for maximum device reach. Each .ts segment is self-contained with PAT/PMT tables — no separate init segment required."
                        }
                    },
                    references: [
                        { title: 'ITU-T H.264' },
                        { title: 'ISO/IEC 14496-15' },
                        { title: 'ISO/IEC 13818-1' }
                    ]
                }
            },
            {
                name: "MPEG-TS HEVC (4K HDR)",
                codec: 'video/mp2t; codecs="hvc1.2.4.L153.B0"',
                container: "MPEG-TS",
                info: "HEVC in transport stream",
                mediaConfig: {
                    type: 'media-source',
                    video: {
                        contentType: 'video/mp2t; codecs="hvc1.2.4.L153.B0"',
                        width: 3840,
                        height: 2160,
                        bitrate: 25000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    "codecBreakdown": {
                        "mime": "video/mp2t",
                        "string": "hvc1.2.4.L153.B0",
                        "parts": [
                            {
                                "token": "hvc1",
                                "meaning": "HEVC codec in MPEG Transport Stream. TS uses Annex B byte stream format for HEVC NALUs (start codes), unlike fMP4 which uses length-prefixed format. This is why FFmpeg uses -bsf:v hevc_mp4toannexb when outputting to MPEG-TS."
                            },
                            {
                                "token": "2",
                                "meaning": "profile_idc = 2 = Main 10 Profile. 10-bit depth for HDR content."
                            },
                            {
                                "token": "4",
                                "meaning": "Profile compatibility flags for Main 10."
                            },
                            {
                                "token": "L153",
                                "meaning": "Level 5.1 — supports 4096x2160 @ 60fps. The \"L\" prefix with level_idc*3 = 153."
                            },
                            {
                                "token": "B0",
                                "meaning": "Constraint indicator flags."
                            }
                        ]
                    },
                    "overview": "HEVC 4K HDR in MPEG Transport Stream. MPEG-TS was the original HLS segment format (before fMP4 was added in HLS version 7). HEVC in TS uses Annex B NAL unit format with start codes (0x00000001) — this is where the hevc_mp4toannexb BSF becomes necessary. For HLS, Apple now recommends fMP4 over TS for HEVC content because fMP4 supports the EXT-X-MAP init segment pattern needed for efficient adaptive bitrate switching. MPEG-TS HEVC HLS is still used by some IPTV systems and older streaming infrastructure.",
                    "streaming": {
                        "hls": {
                            "m3u8": "#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:6\n#EXT-X-MEDIA-SEQUENCE:0\n#EXTINF:6.006,\nseg0.ts\n#EXTINF:6.006,\nseg1.ts\n#EXT-X-ENDLIST",
                            "notes": "HEVC in MPEG-TS for HLS. EXT-X-VERSION:3 per RFC 8216 — no EXT-X-MAP needed (that requires Version 6+, Section 4.3.2.5). Each TS segment is self-contained with PAT/PMT/PES headers. The HEVC stream uses Annex B format with start codes (0x00000001). For HDR10, HEVC SEI messages (mastering display color volume, content light level) must repeat in every TS segment for random access — unlike fMP4 where they live once in the init segment."
                        }
                    },
                    references: [
                        { title: 'ISO/IEC 23008-2' },
                        { title: 'ISO/IEC 14496-15 Annex E' },
                        { title: 'ISO/IEC 13818-1' }
                    ]
                }
            },
            {
                name: "MPEG-TS AAC (Stereo)",
                codec: 'video/mp2t; codecs="mp4a.40.2"',
                container: "MPEG-TS",
                info: "AAC audio in TS",
                mediaConfig: {
                    type: 'media-source',
                    audio: {
                        contentType: 'video/mp2t; codecs="mp4a.40.2"',
                        channels: 2,
                        bitrate: 192000,
                        samplerate: 48000
                    }
                },
                education: {
                    "codecBreakdown": {
                        "mime": "video/mp2t",
                        "string": "mp4a.40.2",
                        "parts": [
                            {
                                "token": "mp4a",
                                "meaning": "MPEG-4 Audio object type identifier. Used for all AAC variants in codec strings."
                            },
                            {
                                "token": "40",
                                "meaning": "ObjectTypeIndication = 0x40 = Audio ISO/IEC 14496-3 (MPEG-4 Audio)."
                            },
                            {
                                "token": "2",
                                "meaning": "AudioObjectType = 2 = AAC-LC (Low Complexity). The most common AAC profile."
                            }
                        ]
                    },
                    "overview": "AAC-LC audio in MPEG Transport Stream. Note the MIME type is video/mp2t even though this is audio — MPEG-TS is a multiplexing container that uses the video MIME type regardless of content. AAC in TS is carried as ADTS (Audio Data Transport Stream) frames within PES packets. This is the standard audio format for HLS MPEG-TS segments. The mediaCapabilities API may reject this test because the AudioConfiguration uses a video/ MIME type — CodecProbe guards against this by skipping API 3 for MPEG-TS audio entries.",
                    references: [
                        { title: 'ISO/IEC 14496-3' },
                        { title: 'ISO/IEC 13818-1' }
                    ]
                }
            },
            {
                name: "MPEG-TS AC-3 (5.1)",
                codec: 'video/mp2t; codecs="ac-3"',
                container: "MPEG-TS",
                info: "Dolby Digital in TS",
                mediaConfig: {
                    type: 'media-source',
                    audio: {
                        contentType: 'video/mp2t; codecs="ac-3"',
                        channels: 6,
                        bitrate: 640000,
                        samplerate: 48000
                    }
                },
                education: {
                    "codecBreakdown": {
                        "mime": "video/mp2t",
                        "string": "ac-3",
                        "parts": [
                            {
                                "token": "ac-3",
                                "meaning": "Dolby Digital (AC-3) codec identifier. The hyphenated form \"ac-3\" is the IANA-registered codec string. Some implementations also accept \"ac3\" without the hyphen, but ac-3 is the standard form per RFC 6381."
                            }
                        ]
                    },
                    "overview": "Dolby Digital 5.1 surround sound in MPEG Transport Stream. AC-3 in TS is common in broadcast TV (ATSC, DVB) and HLS for Apple TV. The TS container carries AC-3 as a private stream within PES packets. For HLS, Apple requires AC-3/E-AC-3 audio to be declared in the master playlist with the AUDIO group-id and CODECS attribute. AC-3 5.1 in TS is the standard surround sound format for broadcast-origin HLS content — newer Atmos/spatial audio uses E-AC-3 JOC in fMP4 instead.",
                    references: [
                        { title: 'ETSI TS 102 366' },
                        { title: 'ISO/IEC 13818-1' }
                    ]
                }
            },
            {
                name: "CMAF AV1 (4K HDR)",
                codec: 'video/mp4; codecs="av01.0.08M.10"',
                container: "CMAF",
                info: "AV1 HLS/DASH unified",
                mediaConfig: {
                    type: 'media-source',
                    video: {
                        contentType: 'video/mp4; codecs="av01.0.08M.10"',
                        width: 3840,
                        height: 2160,
                        bitrate: 15000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: 'video/mp4',
                        string: 'av01.0.08M.10',
                        parts: [
                            { token: 'av01.0.08M.10', meaning: 'AV1 Main Profile L4.0 10-bit: Same codec string as regular AV1 in MP4. CMAF wraps AV1 in fMP4 segments consumable by both HLS and DASH. The av1C box in the init segment contains the AV1 codec configuration record (OBU sequence header)' }
                        ]
                    },
                    overview: "CMAF AV1 is the newest CMAF codec combination — standardized in 2020 by MPEG with AV1 in ISOBMFF (ISO/IEC 14496-12 Amd 2). AV1's royalty-free status makes it attractive for CMAF deployments where HEVC licensing costs are a concern\n\nThe CMAF AV1 profile requires the av1C configuration box in the init segment and AV1 temporal unit (TU) aligned fragments. AV1 Film Grain synthesis (if present) is signaled in the sequence header inside av1C — this is relevant because Film Grain can impact decode performance on some hardware decoders\n\nFor CMAF encryption, AV1 uses the same cbcs/cenc scheme as HEVC CMAF. The subsample encryption patterns differ though: AV1 OBUs have different NAL unit boundaries than HEVC, so the encryption byte ranges are codec-specific. Players must handle AV1 subsample mapping per CENC spec Annex G",
                    platforms: {
                        apple: 'Apple supports AV1 CMAF on A15+ (iPhone 15+), M1+ Macs, and Apple TV 4K 3rd gen. cbcs encryption required for FairPlay. AV1 CMAF uses the same fMP4 infrastructure as HEVC CMAF — the only difference is the codec-specific boxes (av1C vs hvcC) in the init segment.',
                        lg: 'webOS 6.0+ supports AV1 CMAF with the MediaTek MT5895 SoC. The native CMAF parser reads the av1C box from the init segment. AV1 CMAF encryption: webOS 6+ supports cbcs, enabling unified CMAF AV1 segments for both Apple and LG TVs.',
                        android: 'ExoPlayer supports AV1 CMAF on devices with hardware AV1 decode (Snapdragon 888+, Dimensity 9000+). Both cbcs and cenc encryption modes work on Android 12+. For Jellyfin, AV1 CMAF is the best future-proof option for new transcodes — royalty-free, excellent compression, growing hardware support.'
                    },
                    references: [
                        { title: 'AV1 Bitstream & Decoding Process Spec', url: 'https://aomediacodec.github.io/av1-spec/' },
                        { title: 'AV1 Codec ISO Media File Format Binding', url: 'https://aomediacodec.github.io/av1-isobmff/' },
                        { title: 'ISO/IEC 23000-19' },
                        { title: 'RFC 8216', url: 'https://datatracker.ietf.org/doc/html/rfc8216' },
                        { title: 'Apple HLS Authoring Spec', url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices' },
                        { title: 'webOS TV AV Formats', url: 'https://webostv.developer.lge.com/develop/specifications/video-audio-250' },
                        { title: 'Android Supported Media Formats', url: 'https://developer.android.com/media/platform/supported-formats' }
                    ]
                }
            },
            {
                name: "CMAF H.264 (1080p)",
                codec: 'video/mp4; codecs="avc1.640028"',
                container: "CMAF",
                info: "H.264 HLS/DASH unified",
                mediaConfig: {
                    type: 'media-source',
                    video: {
                        contentType: 'video/mp4; codecs="avc1.640028"',
                        width: 1920,
                        height: 1080,
                        bitrate: 5000000,
                        framerate: 30
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: 'video/mp4',
                        string: 'avc1.640028',
                        parts: [
                            { token: 'avc1.640028', meaning: 'H.264 High L4.0 in CMAF: Same codec string as regular H.264, wrapped in CMAF-compliant fMP4 segments. CMAF H.264 is the absolute lowest common denominator for unified streaming — every HLS and DASH player in existence supports it' }
                        ]
                    },
                    overview: "CMAF H.264 is the fallback-of-fallbacks. When HEVC CMAF fails (no hardware decode), AV1 CMAF fails (too new), DV CMAF fails (no DV support) — H.264 CMAF always works. The CMAF spec (ISO/IEC 23000-19) defines H.264 as the mandatory baseline codec\n\nThe practical value of CMAF H.264: a single set of H.264 fMP4 segments serves as the universal fallback for both HLS and DASH ABR ladders. CDN storage for the H.264 tier is shared across all client types. For Jellyfin, this means the transcode target for maximum compatibility (H.264 CMAF fMP4) produces segments usable by every client — Apple via HLS, Android/TV via DASH, desktop browsers via either",
                    references: [
                        { title: 'ITU-T H.264' },
                        { title: 'ISO/IEC 14496-15' },
                        { title: 'ISO/IEC 23000-19' },
                        { title: 'RFC 8216', url: 'https://datatracker.ietf.org/doc/html/rfc8216' },
                        { title: 'Apple HLS Authoring Spec', url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices' }
                    ]
                }
            },
            {
                name: "DASH H.264 (1080p)",
                codec: 'video/mp4; codecs="avc1.640028"',
                container: "DASH",
                info: "H.264 MPEG-DASH",
                mediaConfig: {
                    type: 'media-source',
                    video: {
                        contentType: 'video/mp4; codecs="avc1.640028"',
                        width: 1920,
                        height: 1080,
                        bitrate: 5000000,
                        framerate: 30
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: 'video/mp4',
                        string: 'avc1.640028',
                        parts: [
                            { token: 'avc1', meaning: 'AVC/H.264 in ISO BMFF. For DASH, the codec string is declared in the MPD AdaptationSet codecs= attribute' },
                            { token: '64', meaning: 'profile_idc 0x64 = High Profile. Standard for 1080p streaming' },
                            { token: '00', meaning: 'constraint_set flags: no additional constraints' },
                            { token: '28', meaning: 'level_idc 0x28 = Level 4.0. Supports 1080p@30fps, max bitrate 20 Mbps' }
                        ]
                    },
                    overview: "H.264 DASH is the universal baseline for adaptive streaming. Every MSE-capable browser supports H.264 in fMP4 via DASH — it's the one codec+container+protocol combination guaranteed to work everywhere. YouTube originally used H.264 DASH before migrating to VP9 and AV1\n\nFor Jellyfin/Plex, H.264 DASH is the safe fallback when the client doesn't support HEVC or AV1. DASH manifest generation is straightforward: one AdaptationSet with multiple Representations at different bitrates/resolutions. The Shaka Packager (Google's DASH/HLS tool) generates H.264 DASH from any H.264 source with zero transcoding (just remuxing to fMP4)",
                    streaming: {
                        dash: {
                            mpd: `<AdaptationSet mimeType="video/mp4" codecs="avc1.640028"
    segmentAlignment="true">
  <SegmentTemplate timescale="30000"
    initialization="h264_1080/init.mp4"
    media="h264_1080/seg_$Number$.m4s"/>
  <Representation id="1080p" bandwidth="5000000"
    width="1920" height="1080" frameRate="30000/1000"/>
  <Representation id="720p" bandwidth="2500000"
    width="1280" height="720" frameRate="30000/1000"/>
  <Representation id="480p" bandwidth="1000000"
    width="854" height="480" frameRate="30000/1000"/>
</AdaptationSet>`,
                            notes: 'H.264 DASH ABR ladder: Multiple Representations in one AdaptationSet. The DASH player (Shaka/dash.js) switches between Representations based on network bandwidth. All Representations share the same SegmentTemplate — only the init segment and segment content differ per resolution. segmentAlignment=true enables seamless switching between quality levels.'
                        }
                    },
                    references: [
                        { title: 'ITU-T H.264' },
                        { title: 'ISO/IEC 14496-15' },
                        { title: 'ISO/IEC 23009-1' },
                        { title: 'DASH-IF IOP', url: 'https://dashif.org/guidelines/' },
                        { title: 'RFC 8216', url: 'https://datatracker.ietf.org/doc/html/rfc8216' },
                        { title: 'Apple HLS Authoring Spec', url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices' }
                    ]
                }
            },
            {
                name: "DASH HEVC (4K HDR)",
                codec: 'video/mp4; codecs="hvc1.2.4.L153.B0"',
                container: "DASH",
                info: "HEVC MPEG-DASH",
                mediaConfig: {
                    type: 'media-source',
                    video: {
                        contentType: 'video/mp4; codecs="hvc1.2.4.L153.B0"',
                        width: 3840,
                        height: 2160,
                        bitrate: 25000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: 'video/mp4',
                        string: 'hvc1.2.4.L153.B0',
                        parts: [
                            { token: 'hvc1', meaning: 'HEVC in ISO BMFF. For DASH streaming, same codec string as file-based HEVC — the container is fMP4 segments instead of a single MP4 file' },
                            { token: '2.4.L153.B0', meaning: 'Main 10 Profile, Level 5.1, Main Tier. Standard 4K HDR HEVC for DASH delivery. PQ transfer function and BT.2020 gamut signaled in mediaConfig, not in the codec string' }
                        ]
                    },
                    overview: "HEVC DASH is the primary 4K HDR streaming format for non-Apple platforms. Netflix uses HEVC DASH for Android, smart TVs, and game consoles. The DASH MPD signals HDR via supplementary properties: urn:mpeg:mpegB:cicp:TransferCharacteristics (16=PQ, 18=HLG) and urn:mpeg:mpegB:cicp:ColourPrimaries (9=BT.2020)\n\nUnlike HLS where Apple's VIDEO-RANGE attribute is the only HDR signal, DASH has multiple ways to declare HDR: CICP properties, ContentProtection elements, and codec-specific boxes. This flexibility is both a strength (more expressive) and a weakness (more ways to get it wrong). The DASH-IF IOP v5.0 guidelines standardize the recommended signaling patterns",
                    streaming: {
                        dash: {
                            mpd: `<AdaptationSet mimeType="video/mp4" codecs="hvc1.2.4.L153.B0"
    segmentAlignment="true">
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:TransferCharacteristics" value="16"/>
  <SupplementalProperty schemeIdUri="urn:mpeg:mpegB:cicp:ColourPrimaries" value="9"/>
  <SegmentTemplate timescale="24000"
    initialization="hevc_4k/init.mp4"
    media="hevc_4k/seg_$Number$.m4s"/>
  <Representation id="4k_hdr" bandwidth="25000000"
    width="3840" height="2160" frameRate="24000/1000"/>
  <Representation id="1080_hdr" bandwidth="10000000"
    width="1920" height="1080" frameRate="24000/1000"/>
</AdaptationSet>`,
                            notes: 'DASH HEVC HDR signaling: SupplementalProperty with CICP codes — TransferCharacteristics=16 (PQ/ST.2084) and ColourPrimaries=9 (BT.2020). DASH players use these to activate the HDR rendering pipeline. Without CICP properties, some players display HDR content in SDR mode (washed out colors).'
                        }
                    },
                    references: [
                        { title: 'ISO/IEC 23008-2' },
                        { title: 'ISO/IEC 14496-15 Annex E' },
                        { title: 'ISO/IEC 23009-1' },
                        { title: 'DASH-IF IOP', url: 'https://dashif.org/guidelines/' },
                        { title: 'RFC 8216', url: 'https://datatracker.ietf.org/doc/html/rfc8216' },
                        { title: 'Apple HLS Authoring Spec', url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices' }
                    ]
                }
            },
            {
                name: "HLS fMP4 E-AC-3",
                codec: 'audio/mp4; codecs="ec-3"',
                container: "fMP4",
                info: "DD+ audio streaming",
                mediaConfig: {
                    type: 'media-source',
                    audio: {
                        contentType: 'audio/mp4; codecs="ec-3"',
                        channels: 6,
                        bitrate: 384000,
                        samplerate: 48000
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: 'audio/mp4',
                        string: 'ec-3',
                        parts: [
                            { token: 'ec-3', meaning: 'E-AC-3 (Enhanced AC-3, Dolby Digital Plus) in fMP4 for streaming. The codec tag is identical to non-streaming E-AC-3 — what changes is the container (fMP4 segments instead of continuous MP4) and the delivery method (MSE via Media Source Extensions)' }
                        ]
                    },
                    overview: "E-AC-3 is the dominant surround sound codec for streaming. Netflix, Disney+, Apple TV+, and Amazon all use E-AC-3 as their primary 5.1 audio track. The fMP4 container wraps E-AC-3 frames in moof/mdat atoms, enabling adaptive audio streaming alongside video segments\n\nFor HLS, E-AC-3 audio is declared as an alternate audio rendition via EXT-X-MEDIA with GROUP-ID. The video playlist references this audio group. This separation allows the player to switch audio tracks (stereo AAC vs 5.1 E-AC-3) without re-downloading video segments\n\nDolby Atmos (JOC — Joint Object Coding) is signaled as a special E-AC-3 substream. The codec tag stays ec-3 but the bitstream contains additional object metadata. The HLS manifest signals Atmos via CHANNELS=\"16/JOC\" in the EXT-X-MEDIA tag. Devices that don't support Atmos decode the 7.1 bed layer, falling back gracefully",
                    streaming: {
                        hls: {
                            m3u8: `#EXTM3U
#EXT-X-VERSION:7
#EXT-X-INDEPENDENT-SEGMENTS

#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="surround",NAME="English 5.1",DEFAULT=YES,CHANNELS="6",URI="audio_eac3/playlist.m3u8",CODECS="ec-3"

#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="stereo",NAME="English Stereo",DEFAULT=YES,CHANNELS="2",URI="audio_aac/playlist.m3u8",CODECS="mp4a.40.2"

#EXT-X-STREAM-INF:BANDWIDTH=25000000,CODECS="hvc1.2.4.L153.B0,ec-3",AUDIO="surround",RESOLUTION=3840x2160,VIDEO-RANGE=PQ
video_4k/playlist.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=5000000,CODECS="avc1.640028,mp4a.40.2",AUDIO="stereo",RESOLUTION=1920x1080
video_1080/playlist.m3u8`,
                            notes: 'HLS audio renditions: EXT-X-MEDIA declares audio tracks as separate groups. The STREAM-INF AUDIO= attribute selects which group plays with each video variant. CODECS includes both video and audio codec strings. CHANNELS="6" signals 5.1. For Atmos, Apple requires CHANNELS="16/JOC" — devices that support JOC get object audio, others fall back to 7.1 bed.'
                        }
                    },
                    platforms: {
                        apple: 'Apple devices decode E-AC-3 in hardware on iPhone 7+, iPad Pro 2017+, Apple TV 4K, and all Macs with T2/Apple Silicon. Safari reports E-AC-3 support via mediaCapabilities. For Atmos, Apple requires AirPods Pro/Max, HomePod, or HDMI passthrough to an Atmos-capable receiver. Apple mandates the CHANNELS="16/JOC" attribute in HLS for Atmos signaling — without it, even capable devices won\'t activate the Atmos decoder.',
                        lg: 'webOS has native E-AC-3 decode in all models since webOS 1.0 (2014). Atmos decode added in webOS 4.0+ (2019) via eARC or optical passthrough. webOS reports E-AC-3 support through its native media pipeline but may not expose it via browser canPlayType — the Jellyfin webOS app bypasses browser APIs and queries Luna IPC for audio codec support directly.',
                        android: 'E-AC-3 decode on Android requires hardware support from the SoC audio DSP. Most Snapdragon 600+ series chips include E-AC-3 decode. Android TV devices (Shield, Chromecast) support E-AC-3 passthrough via HDMI to AVRs. ExoPlayer detects E-AC-3 capability via MediaCodecInfo and falls back to AAC stereo when unavailable.'
                    },
                    references: [
                        { title: 'ETSI TS 102 366' },
                        { title: 'RFC 8216', url: 'https://datatracker.ietf.org/doc/html/rfc8216' },
                        { title: 'Apple HLS Authoring Spec', url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices' },
                        { title: 'ISO/IEC 23009-1' },
                        { title: 'DASH-IF IOP', url: 'https://dashif.org/guidelines/' },
                        { title: 'webOS TV AV Formats', url: 'https://webostv.developer.lge.com/develop/specifications/video-audio-250' },
                        { title: 'Android Supported Media Formats', url: 'https://developer.android.com/media/platform/supported-formats' }
                    ]
                }
            },
            {
                name: "HLS fMP4 AAC",
                codec: 'audio/mp4; codecs="mp4a.40.2"',
                container: "fMP4",
                info: "AAC audio streaming",
                mediaConfig: {
                    type: 'media-source',
                    audio: {
                        contentType: 'audio/mp4; codecs="mp4a.40.2"',
                        channels: 2,
                        bitrate: 192000,
                        samplerate: 48000
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: 'audio/mp4',
                        string: 'mp4a.40.2',
                        parts: [
                            { token: 'mp4a', meaning: 'MPEG-4 Audio in ISO BMFF container. The mp4a tag covers all MPEG-4 audio profiles — the .40.2 suffix specifies which one' },
                            { token: '40', meaning: 'objectTypeIndication 0x40 = Audio ISO/IEC 14496-3. This identifies the bitstream as MPEG-4 Audio (AAC family)' },
                            { token: '2', meaning: 'audioObjectType 2 = AAC-LC (Low Complexity). The universal streaming audio codec — every device that plays audio supports AAC-LC' }
                        ]
                    },
                    overview: "AAC-LC in fMP4 is the mandatory baseline audio for both HLS and DASH. Apple requires at least one AAC stereo rendition in every HLS stream as a universal fallback. Even when E-AC-3 5.1 or Atmos is the primary audio, AAC-LC stereo must be available for devices without surround decode\n\nIn fMP4 streaming, AAC frames are wrapped in moof/mdat atoms just like video segments. Audio segments are typically shorter than video (1-2 seconds vs 2-10 seconds) to enable faster audio switching and reduce latency. The init segment contains the AudioSpecificConfig in the esds box, which the decoder uses to configure itself\n\nFor CMAF, AAC-LC is the only universally supported audio codec across all platforms. E-AC-3 requires licensing (Dolby), Opus requires container support (not all platforms support Opus in fMP4), but AAC-LC works everywhere — making it the safe fallback for any streaming pipeline",
                    streaming: {
                        hls: {
                            m3u8: `#EXTM3U
#EXT-X-VERSION:7
#EXT-X-TARGETDURATION:4
#EXT-X-MAP:URI="init_aac.mp4"

#EXTINF:3.968,
audio_seg_0.m4s
#EXTINF:3.968,
audio_seg_1.m4s
#EXTINF:3.968,
audio_seg_2.m4s
#EXT-X-ENDLIST`,
                            notes: 'AAC media playlist: EXT-X-MAP points to the init segment containing the esds box with AudioSpecificConfig. Shorter segments (4s) than video enable faster track switching. This is a media playlist — the master playlist references it via EXT-X-MEDIA with GROUP-ID for audio rendition selection.'
                        }
                    },
                    references: [
                        { title: 'ISO/IEC 14496-3' },
                        { title: 'RFC 8216', url: 'https://datatracker.ietf.org/doc/html/rfc8216' },
                        { title: 'Apple HLS Authoring Spec', url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices' },
                        { title: 'ISO/IEC 23009-1' },
                        { title: 'DASH-IF IOP', url: 'https://dashif.org/guidelines/' }
                    ]
                }
            },
            {
                name: "HLS fMP4 AV1 (4K HDR)",
                codec: 'video/mp4; codecs="av01.0.08M.10"',
                container: "fMP4",
                info: "AV1 via HLS",
                mediaConfig: {
                    type: 'media-source',
                    video: {
                        contentType: 'video/mp4; codecs="av01.0.08M.10"',
                        width: 3840,
                        height: 2160,
                        bitrate: 15000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: 'video/mp4',
                        string: 'av01.0.08M.10',
                        parts: [
                            { token: 'av01', meaning: 'AV1 codec in ISO BMFF (MP4/fMP4). The av01 tag is used for both file-based and streaming AV1 — the container type (file vs media-source) determines the delivery method' },
                            { token: '0', meaning: 'Main Profile: 8-bit and 10-bit 4:2:0. The most widely supported AV1 profile for streaming' },
                            { token: '08M', meaning: 'Level 4.0 Main Tier. Supports 4K@30fps or 1080p@60fps. M = Main Tier (vs H for High Tier). Sufficient for most 4K streaming content' },
                            { token: '10', meaning: '10-bit depth. Required for HDR10 (PQ transfer) and wide color gamut (BT.2020). The transferFunction and colorGamut in mediaConfig signal HDR — the codec string itself just declares bit depth' }
                        ]
                    },
                    overview: "AV1 in HLS is relatively new — Apple added AV1 HLS support in iOS 16 and macOS Ventura (2022). Before that, AV1 was DASH-only for streaming. Apple's AV1 HLS uses the same fMP4 container as HEVC HLS, making the transition straightforward for CDN infrastructure\n\nAV1 offers roughly 30% better compression than HEVC at the same quality, with no patent licensing fees (AV1 is royalty-free via the Alliance for Open Media). This makes it attractive for services paying HEVC/MPEG-LA licensing. Netflix, YouTube, and Disney+ use AV1 for bandwidth savings on supported devices\n\nThe tradeoff: AV1 encode times are significantly slower than HEVC (5-10x slower for software encoding). Hardware AV1 encoders (Intel Arc, NVIDIA RTX 40+, AMD RDNA 3) close the gap but aren't yet ubiquitous. For Jellyfin/Plex, AV1 transcoding on-the-fly is impractical without hardware encoders — pre-encoded AV1 libraries with HEVC fallback is the practical approach",
                    streaming: {
                        hls: {
                            m3u8: `#EXTM3U
#EXT-X-VERSION:7
#EXT-X-INDEPENDENT-SEGMENTS

#EXT-X-STREAM-INF:BANDWIDTH=15000000,CODECS="av01.0.08M.10",RESOLUTION=3840x2160,VIDEO-RANGE=PQ,FRAME-RATE=24.000
av1_4k_hdr/playlist.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=20000000,CODECS="hvc1.2.4.L153.B0",RESOLUTION=3840x2160,VIDEO-RANGE=PQ,FRAME-RATE=24.000
hevc_4k_hdr/playlist.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=5000000,CODECS="avc1.640028",RESOLUTION=1920x1080,FRAME-RATE=24.000
h264_1080/playlist.m3u8`,
                            notes: 'AV1 HLS with codec fallback ladder: AV1 at lower bandwidth than HEVC for the same resolution (compression advantage). AV1-capable devices select the first variant. Non-AV1 devices fall through to HEVC, then H.264. VIDEO-RANGE=PQ on both AV1 and HEVC variants signals HDR. Apple requires AV1 hardware decode (A15+ chip, M1+ Mac) — older devices skip the AV1 variant automatically.'
                        },
                        dash: {
                            mpd: `<AdaptationSet mimeType="video/mp4" codecs="av01.0.08M.10"
    segmentAlignment="true">
  <SegmentTemplate timescale="24000"
    initialization="av1_4k/init.mp4"
    media="av1_4k/seg_$Number$.m4s"/>
  <Representation id="av1_4k" bandwidth="15000000"
    width="3840" height="2160" frameRate="24000/1000"/>
</AdaptationSet>`,
                            notes: 'DASH AV1: Standard AdaptationSet with AV1 codec string. DASH players (Shaka, dash.js, ExoPlayer) check device AV1 capability via MSE isTypeSupported before selecting this AdaptationSet. If AV1 is unsupported, the player falls back to an HEVC or H.264 AdaptationSet in the same Period.'
                        }
                    },
                    platforms: {
                        apple: 'AV1 hardware decode: iPhone 15+ (A15+ with AV1 decode block), iPad M1+, Mac M1+, Apple TV 4K 3rd gen (A15). Safari on older hardware does not support AV1 — no software fallback. In HLS, Apple treats AV1 like HEVC: VIDEO-RANGE=PQ for HDR, fMP4 segments with EXT-X-MAP. Apple TV+ started serving AV1 to capable devices in late 2023.',
                        lg: 'webOS AV1 support: webOS 6.0+ (2021 TVs with MediaTek MT5895 SoC) supports AV1 hardware decode up to 4K@60fps. Older webOS TVs have no AV1 support (no software fallback). webOS treats AV1 like any other fMP4 codec — the native pipeline reads the av01 sample entry from the init segment.',
                        android: 'AV1 hardware decode varies widely: Snapdragon 888+ (2021), Dimensity 9000+ (2022), Samsung Exynos 2200+ (2022), Tensor G2+ (Pixel 7). Software AV1 decode via dav1d is available on Android 10+ but too slow for 4K. ExoPlayer uses MediaCodec for hardware AV1 and falls back to dav1d for lower resolutions. For Jellyfin, this means AV1 direct play works on flagship devices from 2021+ — older devices need HEVC or H.264 transcoding.'
                    },
                    references: [
                        { title: 'AV1 Bitstream & Decoding Process Spec', url: 'https://aomediacodec.github.io/av1-spec/' },
                        { title: 'AV1 Codec ISO Media File Format Binding', url: 'https://aomediacodec.github.io/av1-isobmff/' },
                        { title: 'RFC 8216', url: 'https://datatracker.ietf.org/doc/html/rfc8216' },
                        { title: 'Apple HLS Authoring Spec', url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices' },
                        { title: 'ISO/IEC 23009-1' },
                        { title: 'DASH-IF IOP', url: 'https://dashif.org/guidelines/' },
                        { title: 'webOS TV AV Formats', url: 'https://webostv.developer.lge.com/develop/specifications/video-audio-250' },
                        { title: 'Android Supported Media Formats', url: 'https://developer.android.com/media/platform/supported-formats' }
                    ]
                }
            },
            {
                name: "CMAF VP9 (4K HDR)",
                codec: 'video/webm; codecs="vp09.02.10.10"',
                container: "CMAF",
                info: "VP9 HLS/DASH unified",
                mediaConfig: {
                    type: 'media-source',
                    video: {
                        contentType: 'video/webm; codecs="vp09.02.10.10"',
                        width: 3840,
                        height: 2160,
                        bitrate: 20000000,
                        framerate: 60,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: 'video/webm',
                        string: 'vp09.02.10.10',
                        parts: [
                            { token: 'vp09', meaning: 'VP9 codec with full codec string (vs bare "vp9" tag). The vp09 prefix signals that profile, level, and bit depth follow in dot-separated fields' },
                            { token: '02', meaning: 'Profile 2: 10-bit 4:2:0. Required for HDR10/HLG VP9 content' },
                            { token: '10', meaning: 'Level 1.0 (10 in decimal). Note: VP9 levels are confusingly numbered — Level 1.0 actually covers 4K@30fps' },
                            { token: '10', meaning: '10-bit depth. Enables PQ/HLG transfer functions and BT.2020 wide color gamut' }
                        ]
                    },
                    overview: "VP9 in CMAF is an unusual combination. VP9 was designed for the WebM container (Matroska-based), not ISO BMFF. Putting VP9 in fMP4 requires the VP Codec ISO Media File Format Binding specification (Google/WebM Project), which maps VP9 codec configuration to the vpcC box in the MP4 sample entry\n\nIn practice, VP9 CMAF is primarily used by YouTube for DASH delivery in MP4 containers (as opposed to WebM). The CMAF profile for VP9 uses the same fMP4 structure as HEVC/AV1 CMAF but with VP9-specific init segment boxes. Apple HLS does not support VP9 in any container — Safari has no VP9 decode. This limits VP9 CMAF to DASH-only deployments or Chrome/Firefox HLS implementations\n\nFor media servers, VP9 CMAF is niche — AV1 is the preferred royalty-free codec for new CMAF content, and HEVC CMAF has broader platform support. VP9 CMAF exists mainly for YouTube backward compatibility",
                    references: [
                        { title: 'VP9 Bitstream & Decoding Process Spec' },
                        { title: 'VP9 Codec ISO Media File Format Binding', url: 'https://www.webmproject.org/vp9/mp4/' },
                        { title: 'ISO/IEC 23000-19' },
                        { title: 'RFC 8216', url: 'https://datatracker.ietf.org/doc/html/rfc8216' },
                        { title: 'Apple HLS Authoring Spec', url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices' }
                    ]
                }
            },
            {
                name: "DASH DV Profile 8.1 (Streaming)",
                codec: 'video/mp4; codecs="dvh1.08.06"',
                container: "DASH",
                info: "DV via MPEG-DASH",
                mediaConfig: {
                    type: 'media-source',
                    video: {
                        contentType: 'video/mp4; codecs="dvh1.08.06"',
                        width: 3840,
                        height: 2160,
                        bitrate: 25000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    codecBreakdown: {
                        string: "dvh1.08.06",
                        parts: [
                            { token: "dvh1", meaning: "DV HEVC tag: Same DV Profile 8.1 string as HLS — the codec doesn't change between streaming protocols, only the manifest signaling differs" },
                            { token: "08", meaning: "profile: Profile 8 = single-layer backward-compatible HEVC" },
                            { token: "06", meaning: "level: Level 6 = 4K@60fps" }
                        ]
                    },
                    overview: "DASH uses supplementalCodecs in the MPD AdaptationSet: codecs=\"hvc1.2.4.L153.B0\" supplementalCodecs=\"dvh1.08.06\". The base codecs field declares HEVC (for backward compatibility); supplementalCodecs declares the DV enhancement. Non-DV players ignore supplementalCodecs and play HEVC. DV players use both\n\nThis dual-signaling is DASH's advantage over HLS for DV content. One manifest serves both DV and non-DV clients without platform-specific variants. HLS must choose: either dvh1 in CODECS (breaks non-DV players) or hvc1 in CODECS (DV players miss the enhancement on Apple devices)\n\nShaka Player and dash.js both support supplementalCodecs parsing. ExoPlayer (Android) reads it for DV activation. The DASH-IF Implementation Guidelines (IOP v5.0+) define the supplementalCodecs signaling. For Jellyfin, DASH with supplementalCodecs is the most compatible path for serving DV to mixed device populations",
                    streaming: {
                        dash: {
                            mpd: `<AdaptationSet mimeType="video/mp4"
    codecs="hvc1.2.4.L153.B0"
    supplementalCodecs="dvh1.08.06"
    segmentAlignment="true">
  <SegmentTemplate timescale="24000"
    initialization="init_dv_p81.mp4"
    media="seg_dv_$Number$.m4s"/>
  <Representation id="dv_4k" bandwidth="25000000"
    width="3840" height="2160" frameRate="24000/1000"/>
  <Representation id="dv_1080" bandwidth="8000000"
    width="1920" height="1080" frameRate="24000/1000"/>
</AdaptationSet>`,
                            notes: 'DASH-IF IOP v5.0+ defines supplementalCodecs for backward-compatible codec layering. Non-DV players read codecs= (HEVC base) and ignore supplementalCodecs=. DV players activate both layers. Multiple Representations provide adaptive bitrate without manifest duplication. The init segment (init_dv_p81.mp4) contains the dvcC box that triggers DV decoding on capable devices.'
                        }
                    },
                    platforms: {
                        apple: 'Apple devices do not support DASH natively — Safari has no MSE-based DASH playback. Jellyfin web on Safari uses HLS exclusively. If DASH DV content must reach Apple, Jellyfin transcodes/remuxes to HLS with dvh1 CODECS signaling. Apple TV+ uses separate HLS manifests for DV content rather than DASH supplementalCodecs.',
                        dolby: 'Dolby\'s reference implementation uses supplementalCodecs as the canonical DASH DV signaling. The init segment must contain the dvcC box in the HEVC sample entry (stsd > hvc1/hev1 > dvcC). Dolby Vision Streams Within the ISO BMFF specification defines the box layout. Dolby mandates that the RPU NALUs appear as in-band SEI messages in every access unit — the DV enhancement is not stored separately.',
                        lg: 'webOS DASH support uses the native media pipeline, not a JS DASH player. The webOS media framework reads the MPD and init segments directly. For DV, webOS checks the dvcC box from the init segment, then queries Luna IPC getHdrCapabilities to confirm hardware DV support. webOS 6+ supports P8.1 via DASH. The race condition (getHdrCapabilities returning before Luna IPC completes) can cause false negatives on first DASH playback — retry or delayed detection is the workaround.',
                        android: 'ExoPlayer parses supplementalCodecs from the DASH MPD since ExoPlayer 2.15+. When supplementalCodecs contains a DV tag, ExoPlayer checks if the device\'s MediaCodec supports the DV profile. Snapdragon 865+ and Dimensity 1000+ SoCs report DV capability via MediaCodecInfo. ExoPlayer then activates DV decoding by configuring the codec with the DV MIME type (video/dolby-vision) instead of video/hevc.'
                    },
                    references: [
                        { title: 'ETSI TS 103 572' },
                        { title: 'ISO/IEC 23009-1' },
                        { title: 'DASH-IF IOP', url: 'https://dashif.org/guidelines/' },
                        { title: 'RFC 8216', url: 'https://datatracker.ietf.org/doc/html/rfc8216' },
                        { title: 'Apple HLS Authoring Spec', url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices' },
                        { title: 'webOS TV AV Formats', url: 'https://webostv.developer.lge.com/develop/specifications/video-audio-250' },
                        { title: 'Android Supported Media Formats', url: 'https://developer.android.com/media/platform/supported-formats' }
                    ]
                }
            },
            {
                name: "CMAF DV Profile 8.1 (4K)",
                codec: 'video/mp4; codecs="dvh1.08.06"',
                container: "CMAF",
                info: "DV HLS/DASH unified",
                mediaConfig: {
                    type: 'media-source',
                    video: {
                        contentType: 'video/mp4; codecs="dvh1.08.06"',
                        width: 3840,
                        height: 2160,
                        bitrate: 25000000,
                        framerate: 24,
                        transferFunction: 'pq',
                        colorGamut: 'rec2020'
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: 'video/mp4',
                        string: 'dvh1.08.06',
                        parts: [
                            { token: 'dvh1', meaning: 'DV HEVC tag with in-band RPU NALUs. In CMAF, the fMP4 init segment contains both the HEVC sample entry (hvc1) and the DV config box (dvcC) — the dvh1 codec string signals that the stream carries DV enhancement data' },
                            { token: '08', meaning: 'Profile 8: Single-layer backward-compatible HEVC. The CMAF segment data is identical whether consumed by a DV or non-DV player — the RPU NALUs are ignored by HEVC-only decoders' },
                            { token: '06', meaning: 'Level 6: 4K@60fps. DV levels in CMAF follow the same constraints as regular DV — the container format does not change the level capabilities' }
                        ]
                    },
                    overview: "CMAF DV Profile 8.1 is the holy grail of streaming DV — one set of segments serving HLS (Apple), DASH (Android/TV), and both DV and non-DV devices simultaneously. The same init.mp4 + .m4s segments sit on the CDN, referenced by both HLS playlists and DASH MPDs\n\nThe catch: the manifest signaling differs. HLS uses CODECS=\"dvh1.08.06\" with VIDEO-RANGE=PQ to signal DV. DASH uses supplementalCodecs=\"dvh1.08.06\" alongside codecs=\"hvc1.2.4.L153.B0\". The CMAF segments themselves are byte-for-byte identical — only the manifests change per platform\n\nEncryption is the real divergence point. Apple mandates cbcs mode for CMAF DRM. Most DASH deployments use cenc/ctr. To serve both from the same segments, content must be encrypted with cbcs (Apple-compatible) and DASH players must support cbcs decryption. Android 12+ and recent Widevine CDMs support cbcs, but older Android devices do not — forcing dual-encrypted segments for universal reach",
                    streaming: {
                        hls: {
                            m3u8: `#EXTM3U
#EXT-X-VERSION:7
#EXT-X-INDEPENDENT-SEGMENTS

#EXT-X-STREAM-INF:BANDWIDTH=25000000,CODECS="dvh1.08.06",RESOLUTION=3840x2160,VIDEO-RANGE=PQ,FRAME-RATE=24.000
cmaf_dv/playlist.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=15000000,CODECS="hvc1.2.4.L153.B0",RESOLUTION=3840x2160,VIDEO-RANGE=PQ,FRAME-RATE=24.000
cmaf_hdr10/playlist.m3u8`,
                            notes: 'HLS pointing to CMAF segments: The media playlists reference the same .m4s segments as DASH. DV variant uses CODECS="dvh1.08.06" — Apple devices select this variant. HDR10 fallback uses CODECS="hvc1..." for non-DV Apple devices. Both playlists point to the same CMAF segment files on disk — zero storage duplication.'
                        },
                        dash: {
                            mpd: `<AdaptationSet mimeType="video/mp4"
    codecs="hvc1.2.4.L153.B0"
    supplementalCodecs="dvh1.08.06"
    segmentAlignment="true" subsegmentAlignment="true">
  <SegmentTemplate timescale="24000"
    initialization="cmaf_dv/init.mp4"
    media="cmaf_dv/seg_$Number$.m4s"/>
  <Representation id="dv_4k" bandwidth="25000000"
    width="3840" height="2160"/>
</AdaptationSet>`,
                            notes: 'DASH pointing to the same CMAF segments as HLS. The init.mp4 and seg_*.m4s paths are identical to what HLS references. supplementalCodecs signals DV enhancement. subsegmentAlignment=true enables byte-range addressing and low-latency chunked transfer.'
                        }
                    },
                    platforms: {
                        apple: 'Apple requires cbcs encryption for CMAF DV content. The HLS playlist must declare VIDEO-RANGE=PQ and use dvh1 in CODECS. Apple\'s AVPlayer reads the dvcC box from the CMAF init segment to activate the DV rendering pipeline. For DRM content, Apple requires FairPlay Streaming with cbcs — cenc/ctr encrypted CMAF segments will fail with a decryption error on Apple devices.',
                        dolby: 'Dolby\'s CMAF DV specification requires the dvcC box in the init segment\'s sample entry (stsd > hvc1 > dvcC). The RPU NALUs must be present as in-band SEI NAL units in every CMAF fragment. For CMAF DV Profile 8.1, Dolby specifies that the base layer HEVC must be independently decodable — the DV RPU is enhancement-only. This is what makes P8.1 CMAF work: strip the RPU NALUs and you have valid HEVC.',
                        lg: 'webOS reads CMAF init segments natively to detect DV. The dvcC box triggers the DV firmware path via Luna IPC. webOS 6+ supports cbcs-encrypted CMAF (required for Apple-compatible unified segments). Pre-webOS 6 TVs (2020 and earlier) only support cenc/ctr encryption — these cannot play Apple-encrypted CMAF DV content and require separate cenc-encrypted segments or unencrypted fallback.',
                        android: 'ExoPlayer handles CMAF DV by reading the dvcC box from the init segment. For DRM, ExoPlayer supports both cbcs and cenc/ctr on Android 12+ devices. On Android 10-11, cbcs support is SoC-dependent (Qualcomm Snapdragon 855+ supports it, older chips may not). This means Apple-encrypted CMAF DV works on newer Android but fails on older devices — Jellyfin should detect cbcs capability and fall back to cenc-encrypted segments when needed.'
                    },
                    references: [
                        { title: 'ETSI TS 103 572' },
                        { title: 'ISO/IEC 23000-19' },
                        { title: 'RFC 8216', url: 'https://datatracker.ietf.org/doc/html/rfc8216' },
                        { title: 'Apple HLS Authoring Spec', url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices' },
                        { title: 'webOS TV AV Formats', url: 'https://webostv.developer.lge.com/develop/specifications/video-audio-250' },
                        { title: 'Android Supported Media Formats', url: 'https://developer.android.com/media/platform/supported-formats' }
                    ]
                }
            },
            {
                name: "HLS fMP4 HEVC (SDR 1080p)",
                codec: 'video/mp4; codecs="hvc1.1.6.L120.B0"',
                container: "fMP4",
                info: "SDR HEVC via HLS",
                mediaConfig: {
                    type: 'media-source',
                    video: {
                        contentType: 'video/mp4; codecs="hvc1.1.6.L120.B0"',
                        width: 1920,
                        height: 1080,
                        bitrate: 5000000,
                        framerate: 24
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: 'video/mp4',
                        string: 'hvc1.1.6.L120.B0',
                        parts: [
                            { token: 'hvc1', meaning: 'HEVC with parameter sets in sample entry. Apple HLS mandates hvc1 over hev1' },
                            { token: '1', meaning: 'Main Profile (profile_idc=1). 8-bit 4:2:0 SDR — no HDR metadata' },
                            { token: '6', meaning: 'Profile compatibility: Main + Main 10 backward-compatible' },
                            { token: 'L120', meaning: 'Level 4.0, Main Tier. 120 = 4.0 x 30. Supports 1080p@60fps or 2K@30fps. Max bitrate 12 Mbps Main Tier' },
                            { token: 'B0', meaning: 'No additional constraint flags' }
                        ]
                    },
                    overview: "SDR HEVC via HLS fills the gap between H.264 (universal but lower compression) and HEVC HDR (higher quality but requires HDR display). For 1080p SDR content, HEVC Main Profile offers ~40% bitrate savings over H.264 High Profile at equivalent quality\n\nThis is the variant Apple TV+ uses for SDR catalog content on HEVC-capable devices. No VIDEO-RANGE attribute is needed in the HLS manifest (SDR is the default). The absence of transferFunction and colorGamut in mediaConfig means the browser's mediaCapabilities API evaluates this as pure SDR — no HDR pipeline activation, no tone mapping overhead",
                    references: [
                        { title: 'ISO/IEC 23008-2' },
                        { title: 'ISO/IEC 14496-15 Annex E' },
                        { title: 'RFC 8216', url: 'https://datatracker.ietf.org/doc/html/rfc8216' },
                        { title: 'Apple HLS Authoring Spec', url: 'https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices' }
                    ]
                }
            },
            {
                name: "DASH AV1 (SDR 1080p)",
                codec: 'video/mp4; codecs="av01.0.05M.08"',
                container: "DASH",
                info: "SDR AV1 streaming",
                mediaConfig: {
                    type: 'media-source',
                    video: {
                        contentType: 'video/mp4; codecs="av01.0.05M.08"',
                        width: 1920,
                        height: 1080,
                        bitrate: 4000000,
                        framerate: 30
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: 'video/mp4',
                        string: 'av01.0.05M.08',
                        parts: [
                            { token: 'av01', meaning: 'AV1 in ISO BMFF' },
                            { token: '0', meaning: 'Main Profile: 8-bit and 10-bit 4:2:0' },
                            { token: '05M', meaning: 'Level 3.1 Main Tier. Supports 1080p@30fps. M = Main Tier. Lower level than 4K variant (08M) — matching the 1080p resolution target' },
                            { token: '08', meaning: '8-bit depth. SDR content — no HDR metadata, no wide color gamut. Standard BT.709 color space' }
                        ]
                    },
                    overview: "SDR AV1 at 1080p is YouTube's default delivery codec for Chrome users. At 4 Mbps, AV1 SDR 1080p matches the visual quality of H.264 at 6-8 Mbps — a significant bandwidth saving at scale. Netflix uses SDR AV1 for mobile device streaming where bandwidth is constrained\n\nThe 08 bit depth (8-bit) distinguishes this from HDR AV1 (which uses 10). 8-bit AV1 is slightly faster to decode than 10-bit because there's no bit-depth upconversion. On devices with AV1 hardware decode, this difference is negligible. On software decode (dav1d), 8-bit 1080p is roughly 20% faster than 10-bit — enough to make the difference between real-time and stuttering on older mobile SoCs",
                    references: [
                        { title: 'AV1 Bitstream & Decoding Process Spec', url: 'https://aomediacodec.github.io/av1-spec/' },
                        { title: 'AV1 Codec ISO Media File Format Binding', url: 'https://aomediacodec.github.io/av1-isobmff/' },
                        { title: 'ISO/IEC 23009-1' },
                        { title: 'DASH-IF IOP', url: 'https://dashif.org/guidelines/' }
                    ]
                }
            }
        ]
    },

    // ==================== AUDIO CODECS ====================

    audio_dolby: {
        category: "Dolby Audio",
        tests: [
            // AC-3 (Dolby Digital)
            {
                name: "Dolby Digital (AC-3 MP4)",
                codec: 'audio/mp4; codecs="ac-3"',
                container: "MP4",
                info: "5.1 surround",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/mp4; codecs="ac-3"',
                        channels: 6,
                        bitrate: 640000,
                        samplerate: 48000
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: "audio/mp4",
                        string: "ac-3",
                        parts: [
                            { token: "ac-3", meaning: "Dolby Digital tag: ETSI TS 102 366 / ATSC A/52. AC-3 is the original Dolby Digital: perceptual coding with 5.1 channels at up to 640 kbps. The codec string is a bare tag — no profile/level parameters. All AC-3 decoders handle the full spec" }
                        ]
                    },
                    overview: "AC-3 has been the mandatory audio codec for DVD-Video since 1997 and ATSC digital TV since 1995. Every surround sound system and AV receiver made in the last 30 years decodes AC-3. It's the lowest common denominator for surround audio — if a device claims 5.1 support, it means AC-3\n\nBrowser support splits along platform lines: Safari/macOS decodes AC-3 natively (CoreAudio). Chrome on Windows uses the OS decoder (available since Windows 10). Chrome on Linux/ChromeOS generally does not support AC-3. Firefox doesn't support it on any platform (licensing). For Jellyfin, this means AC-3 passthrough works on Safari/Edge but needs transcoding to AAC for Firefox\n\nThe Dolby audio codec hierarchy: AC-3 (1992, lossy 5.1) → E-AC-3/DD+ (2004, lossy 7.1 + Atmos JOC) → TrueHD (2005, lossless 7.1 + Atmos) → AC-4 (2017, next-gen immersive). Each generation is backward-compatible: E-AC-3 streams carry an AC-3 core, TrueHD carries an AC-3 fallback on Blu-ray",
                    references: [
                        { title: 'ETSI TS 102 366' }
                    ]
                }
            },
            {
                name: "Dolby Digital (AC-3 MKV)",
                codec: 'audio/x-matroska; codecs="ac-3"',
                container: "MKV",
                info: "5.1 surround",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/x-matroska; codecs="ac-3"',
                        channels: 6,
                        bitrate: 640000,
                        samplerate: 48000
                    }
                }
            },
            // E-AC-3 (Dolby Digital Plus)
            {
                name: "Dolby Digital Plus (E-AC-3 MP4)",
                codec: 'audio/mp4; codecs="ec-3"',
                container: "MP4",
                info: "7.1 + Atmos",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/mp4; codecs="ec-3"',
                        channels: 8,
                        bitrate: 768000,
                        samplerate: 48000
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: "audio/mp4",
                        string: "ec-3",
                        parts: [
                            { token: "ec-3", meaning: "Dolby Digital Plus tag: Enhanced AC-3 (ETSI TS 102 366 Annex E). Doubles AC-3's channel count (7.1), triples bitrate ceiling (6.144 Mbps), and supports Dolby Atmos via Joint Object Coding (JOC). The codec string is bare — Atmos presence is signaled in the bitstream, not the MIME type" }
                        ]
                    },
                    overview: "E-AC-3 is the mandatory Dolby audio format for streaming services. Netflix, Disney+, Apple TV+, and Amazon all deliver Dolby Atmos over E-AC-3 JOC in fMP4 containers. The typical streaming Atmos bitrate is 768 kbps — vastly more efficient than TrueHD's 18+ Mbps lossless path on Blu-ray\n\nDolby Atmos in E-AC-3 uses Joint Object Coding: the 7.1 bed channels carry the spatial audio foundation, and additional metadata describes object positions. A non-Atmos decoder plays the 7.1 bed normally. An Atmos renderer uses the object metadata to place sounds in 3D space. Same bitstream, two decode paths\n\nThe E-AC-3 codec string 'ec-3' is identical whether the content is stereo, 5.1, 7.1, or Atmos. The browser's codec detection can't distinguish these — it reports E-AC-3 support generically. CodecProbe's API 3b spatial audio test (spatialRendering: true in mediaCapabilities) is the only way to detect Atmos rendering capability",
                    references: [
                        { title: 'ETSI TS 102 366' }
                    ]
                }
            },
            {
                name: "Dolby Digital Plus (E-AC-3 MKV)",
                codec: 'audio/x-matroska; codecs="ec-3"',
                container: "MKV",
                info: "7.1 + Atmos",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/x-matroska; codecs="ec-3"',
                        channels: 8,
                        bitrate: 768000,
                        samplerate: 48000
                    }
                }
            },
            // TrueHD
            {
                name: "Dolby TrueHD (MKV)",
                codec: 'audio/x-matroska; codecs="trhd"',
                container: "MKV",
                info: "Lossless 7.1 + Atmos",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/x-matroska; codecs="trhd"',
                        channels: 8,
                        bitrate: 18000000,
                        samplerate: 96000
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: "audio/x-matroska",
                        string: "trhd",
                        parts: [
                            { token: "trhd", meaning: "TrueHD tag: Dolby TrueHD (Meridian Lossless Packing). Bit-identical lossless audio with optional Dolby Atmos spatial metadata. MKV-only in the browser context — TrueHD on Blu-ray uses .m2ts containers, but rips are always MKV" }
                        ]
                    },
                    overview: "TrueHD is the lossless tier of the Dolby codec family. Bitrates range from 8-18 Mbps for 7.1 channels at 96kHz/24-bit — roughly 10-20× the size of E-AC-3 Atmos. The quality advantage is real (lossless vs lossy) but inaudible to most listeners on most equipment. It matters for archival and audiophile setups with calibrated speaker arrays\n\nNo browser decodes TrueHD. The codec is designed for hardware decode paths: Blu-ray players, AV receivers (HDMI bitstream passthrough), and media players like Kodi/VLC with libavcodec. Jellyfin/Plex handle TrueHD by either bitstream passthrough to a capable receiver or transcoding to E-AC-3/AAC\n\nThe 'mlp' codec tag (Meridian Lossless Packing) is an alternative registration for TrueHD. Both 'trhd' and 'mlp' refer to the same codec — trhd is the MP4RA-registered fourcc, mlp is the FFmpeg/Matroska name. Testing both reveals which tag a browser's demuxer recognizes",
                    references: [
                        { title: 'ETSI TS 102 366' }
                    ]
                }
            },
            {
                name: "Dolby TrueHD + Atmos (mlp)",
                codec: 'audio/x-matroska; codecs="mlp"',
                container: "MKV",
                info: "MLP codec variant",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/x-matroska; codecs="mlp"',
                        channels: 8,
                        bitrate: 18000000,
                        samplerate: 96000
                    }
                }
            },
            // AC-4 (Next-gen)
            {
                name: "Dolby AC-4",
                codec: 'audio/mp4; codecs="ac-4"',
                container: "MP4",
                info: "ATSC 3.0 Next-Gen",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/mp4; codecs="ac-4"',
                        channels: 8,
                        bitrate: 512000,
                        samplerate: 48000
                    }
                }
            },
            // Atmos in E-AC-3 Joint Object Coding
            {
                name: "Dolby Atmos (JOC in DD+)",
                codec: 'audio/mp4; codecs="ec-3"',
                container: "MP4",
                info: "Joint Object Coding",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/mp4; codecs="ec-3"',
                        channels: 8,  // FIXED: Changed from 16 to 8 (DD+ max)
                        bitrate: 768000,
                        samplerate: 48000
                    }
                }
            },
            // Additional Dolby variants
            {
                name: "Dolby Digital (AC-3 Stereo)",
                codec: 'audio/mp4; codecs="ac-3"',
                container: "MP4",
                info: "2.0 stereo downmix",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/mp4; codecs="ac-3"',
                        channels: 2,
                        bitrate: 192000,
                        samplerate: 48000
                    }
                }
            },
            {
                name: "Dolby Digital Plus (E-AC-3 Streaming)",
                codec: 'audio/mp4; codecs="ec-3"',
                container: "MP4",
                info: "MSE streaming",
                mediaConfig: {
                    type: 'media-source',
                    audio: {
                        contentType: 'audio/mp4; codecs="ec-3"',
                        channels: 6,
                        bitrate: 384000,
                        samplerate: 48000
                    }
                }
            },
            {
                name: "Dolby AC-4 IMS (Immersive)",
                codec: 'audio/mp4; codecs="ac-4.02.01.01"',
                container: "MP4",
                info: "AC-4 Immersive Stereo",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/mp4; codecs="ac-4.02.01.01"',
                        channels: 2,
                        bitrate: 256000,
                        samplerate: 48000
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: "audio/mp4",
                        string: "ac-4.02.01.01",
                        parts: [
                            { token: "ac-4", meaning: "AC-4 tag: Dolby AC-4 (ETSI TS 103 190). Next-generation Dolby codec designed for ATSC 3.0 broadcast and streaming. Unlike AC-3/E-AC-3 which use bare tags, AC-4 has a structured codec string" },
                            { token: "02", meaning: "bitstream_version: Bitstream version 2. Defines the feature set: v1 = base, v2 = adds IMS (Immersive Stereo), dialogue enhancement, and personalized rendering" },
                            { token: "01", meaning: "presentation_version: Presentation version 1. Identifies the content presentation type within the bitstream" },
                            { token: "01", meaning: "mdcompat: Metadata compatibility flag. Signals the minimum decoder version needed to properly handle the stream's metadata features" }
                        ]
                    },
                    overview: "AC-4 IMS (Immersive Stereo) renders spatial audio on stereo headphones without speaker arrays. It uses head-related transfer functions to simulate 3D positioning — Dolby's answer to Apple Spatial Audio and Sony 360 Reality Audio. The 'immersive' part is binaural rendering, not channel count\n\nAC-4 is Dolby's break from the AC-3 lineage. It's a clean-sheet codec with no backward compatibility to AC-3/E-AC-3 — a device must have an AC-4 decoder specifically. ATSC 3.0 mandates AC-4 support, but ATSC 1.0 (current US broadcast) doesn't. TV manufacturers shipping ATSC 3.0 tuners include AC-4 decoders\n\nBrowser support is near-zero. AC-4 targets embedded devices (TVs, set-top boxes, automotive) and native apps — not web browsers. The web ecosystem will likely skip AC-4 entirely and move from E-AC-3 to whatever comes next. Testing it here reveals early adopter platforms (some Samsung/LG TVs with ATSC 3.0)",
                    references: [
                        { title: 'ETSI TS 103 190' }
                    ]
                }
            },
            {
                name: "Dolby Digital Plus 7.1 (E-AC-3 MP4)",
                codec: 'audio/mp4; codecs="ec-3"',
                container: "MP4",
                info: "7.1 surround DD+",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/mp4; codecs="ec-3"',
                        channels: 8,
                        bitrate: 1536000,
                        samplerate: 48000
                    }
                }
            },
            {
                name: "Dolby Digital (AC-3 Streaming)",
                codec: 'audio/mp4; codecs="ac-3"',
                container: "fMP4",
                info: "AC-3 via MSE",
                mediaConfig: {
                    type: 'media-source',
                    audio: {
                        contentType: 'audio/mp4; codecs="ac-3"',
                        channels: 6,
                        bitrate: 640000,
                        samplerate: 48000
                    }
                }
            },
            {
                name: "Dolby Digital (AC-3 MOV)",
                codec: 'audio/quicktime; codecs="ac-3"',
                container: "MOV",
                info: "QuickTime AC-3",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/quicktime; codecs="ac-3"',
                        channels: 6,
                        bitrate: 640000,
                        samplerate: 48000
                    }
                }
            },
            {
                name: "Dolby Digital Plus (E-AC-3 MOV)",
                codec: 'audio/quicktime; codecs="ec-3"',
                container: "MOV",
                info: "DD+ in QuickTime",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/quicktime; codecs="ec-3"',
                        channels: 6,
                        bitrate: 640000,
                        samplerate: 48000
                    }
                }
            },
            // MKV Dolby audio coverage
            {
                name: "Dolby AC-4 (MKV)",
                codec: 'audio/x-matroska; codecs="ac-4"',
                container: "MKV",
                info: "Next-gen Dolby in MKV",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/x-matroska; codecs="ac-4"',
                        channels: 8,
                        bitrate: 512000,
                        samplerate: 48000
                    }
                }
            },
            {
                name: "Dolby AC-4 IMS (MKV)",
                codec: 'audio/x-matroska; codecs="ac-4.02.01.01"',
                container: "MKV",
                info: "AC-4 Immersive in MKV",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/x-matroska; codecs="ac-4.02.01.01"',
                        channels: 2,
                        bitrate: 256000,
                        samplerate: 48000
                    }
                }
            }
        ]
    },

    audio_dts: {
        category: "DTS Audio",
        tests: [
            // Core
            {
                name: "DTS Core (MP4)",
                codec: 'audio/mp4; codecs="dts-"',
                container: "MP4",
                info: "5.1 core",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/mp4; codecs="dts-"',
                        channels: 6,
                        bitrate: 1536000,
                        samplerate: 48000
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: "audio/mp4",
                        string: "dts-",
                        parts: [
                            { token: "dts-", meaning: "DTS Core tag: DTS Digital Surround core codec (ETSI TS 102 114). The trailing hyphen distinguishes it from the tag prefix — 'dts-' is the literal MP4RA-registered fourcc for DTS Core. Alternative registration: 'dtsc' (same codec, different tag)" }
                        ]
                    },
                    overview: "DTS uses a family of four-character codec tags, each mapping to a specific tier: dts-/dtsc (Core 5.1), dtse (Express/LBR), dtsh (HD High Resolution + HD Master Audio), dtsl (HD Lossless), dtsx (DTS:X object audio). Unlike Dolby's separate codec names (ac-3, ec-3, trhd), DTS uses the tag itself to signal the tier\n\nDTS Core (1536 kbps, 5.1) is the Blu-ray equivalent of AC-3 — the mandatory lossy surround format on many disc releases. Every AV receiver decodes DTS Core. Browser support is rare: no browser includes a DTS decoder by default. Safari on macOS can passthrough to the system's CoreAudio (if the system supports DTS), but Chrome and Firefox do not\n\nThe dual-tag situation (dts- vs dtsc) exists because the original MP4RA registration used 'dts-' but FFmpeg and some muxers use 'dtsc'. Testing both reveals which tag a browser's demuxer recognizes. Jellyfin/Plex typically passthrough DTS to capable AV receivers via HDMI — browser decode is not expected",
                    references: [
                        { title: 'ETSI TS 102 114' }
                    ]
                }
            },
            {
                name: "DTS Core (MKV)",
                codec: 'audio/x-matroska; codecs="dts-"',
                container: "MKV",
                info: "5.1 core",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/x-matroska; codecs="dts-"',
                        channels: 6,
                        bitrate: 1536000,
                        samplerate: 48000
                    }
                }
            },
            // Express (LBR)
            {
                name: "DTS Express (LBR MP4)",
                codec: 'audio/mp4; codecs="dtse"',
                container: "MP4",
                info: "Low bitrate",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/mp4; codecs="dtse"',
                        channels: 6,
                        bitrate: 128000,
                        samplerate: 48000
                    }
                }
            },
            {
                name: "DTS Express (LBR MKV)",
                codec: 'audio/x-matroska; codecs="dtse"',
                container: "MKV",
                info: "Low bitrate",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/x-matroska; codecs="dtse"',
                        channels: 6,
                        bitrate: 128000,
                        samplerate: 48000
                    }
                }
            },
            // HD High Resolution
            {
                name: "DTS-HD High Resolution",
                codec: 'audio/x-matroska; codecs="dtsh"',
                container: "MKV",
                info: "24-bit 7.1",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/x-matroska; codecs="dtsh"',
                        channels: 8,
                        bitrate: 6000000,
                        samplerate: 96000
                    }
                }
            },
            // HD Master Audio
            {
                name: "DTS-HD Master Audio",
                codec: 'audio/x-matroska; codecs="dtsh"',
                container: "MKV",
                info: "Lossless",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/x-matroska; codecs="dtsh"',
                        channels: 8,
                        bitrate: 18000000,  // FIXED: Reduced from 24.5 Mbps to 18 Mbps
                        samplerate: 96000   // FIXED: Reduced from 192 kHz to 96 kHz
                    }
                }
            },
            // DTS:X
            {
                name: "DTS:X (MKV)",
                codec: 'audio/x-matroska; codecs="dtsx"',
                container: "MKV",
                info: "Object-based audio",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/x-matroska; codecs="dtsx"',
                        channels: 12,
                        bitrate: 4096000,
                        samplerate: 48000
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: "audio/x-matroska",
                        string: "dtsx",
                        parts: [
                            { token: "dtsx", meaning: "DTS:X tag: DTS:X object-based spatial audio. The 'x' suffix distinguishes it from channel-based DTS tiers (dtsc/dtsh/dtsl/dtse). DTS:X is DTS's answer to Dolby Atmos — object metadata for height channels and spatial positioning" }
                        ]
                    },
                    overview: "DTS:X vs Dolby Atmos: both are object-based spatial audio competing for the same market. DTS:X has one key difference — it doesn't require a dedicated height channel bed. DTS:X renders objects adaptively to whatever speaker layout exists (5.1, 7.1, 7.1.4), while Atmos requires at least a 7.1 bed for object placement. In practice, content creators choose based on studio deals, not technical merit\n\nDTS:X Profile 2 is the streaming variant (lower bitrate, designed for online delivery). Profile 1 is the disc/broadcast variant. The 'dtsx' codec tag covers both profiles — the profile is signaled in the bitstream header. Most browser/streaming codec detection can't distinguish between profiles\n\nBrowser decode of DTS:X is effectively nonexistent. The codec targets AV receiver passthrough: Jellyfin/Plex detect DTS:X in the MKV track header and bitstream-pass it over HDMI to a DTS:X-capable receiver. If the client can't passthrough, the server transcodes to E-AC-3 or AAC stereo",
                    references: [
                        { title: 'ETSI TS 102 114' }
                    ]
                }
            },
            {
                name: "DTS:X Profile 2 (Streaming)",
                codec: 'audio/mp4; codecs="dtsx"',
                container: "MP4",
                info: "Streaming variant",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/mp4; codecs="dtsx"',
                        channels: 8,
                        bitrate: 768000,
                        samplerate: 48000
                    }
                }
            },
            // Additional DTS codec tags (MP4RA registered)
            {
                name: "DTS Core (dtsc MP4)",
                codec: 'audio/mp4; codecs="dtsc"',
                container: "MP4",
                info: "MP4RA registered Core tag",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/mp4; codecs="dtsc"',
                        channels: 6,
                        bitrate: 1536000,
                        samplerate: 48000
                    }
                }
            },
            {
                name: "DTS Core (dtsc MKV)",
                codec: 'audio/x-matroska; codecs="dtsc"',
                container: "MKV",
                info: "MP4RA registered Core tag",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/x-matroska; codecs="dtsc"',
                        channels: 6,
                        bitrate: 1536000,
                        samplerate: 48000
                    }
                }
            },
            {
                name: "DTS-HD Lossless (dtsl MKV)",
                codec: 'audio/x-matroska; codecs="dtsl"',
                container: "MKV",
                info: "HD Lossless extension",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/x-matroska; codecs="dtsl"',
                        channels: 8,
                        bitrate: 18000000,
                        samplerate: 96000
                    }
                }
            },
            {
                name: "DTS-HD Master Audio (MP4)",
                codec: 'audio/mp4; codecs="dtsh"',
                container: "MP4",
                info: "Lossless in MP4",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/mp4; codecs="dtsh"',
                        channels: 8,
                        bitrate: 18000000,
                        samplerate: 96000
                    }
                }
            },
            {
                name: "DTS-HD High Resolution (MP4)",
                codec: 'audio/mp4; codecs="dtsh"',
                container: "MP4",
                info: "24-bit 7.1 in MP4",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/mp4; codecs="dtsh"',
                        channels: 8,
                        bitrate: 6000000,
                        samplerate: 96000
                    }
                }
            },
            {
                name: "DTS-HD Lossless (dtsl MP4)",
                codec: 'audio/mp4; codecs="dtsl"',
                container: "MP4",
                info: "Lossless extension in MP4",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/mp4; codecs="dtsl"',
                        channels: 8,
                        bitrate: 18000000,
                        samplerate: 96000
                    }
                }
            },
            {
                name: "DTS:X (Streaming MP4)",
                codec: 'audio/mp4; codecs="dtsx"',
                container: "fMP4",
                info: "DTS:X via MSE",
                mediaConfig: {
                    type: 'media-source',
                    audio: {
                        contentType: 'audio/mp4; codecs="dtsx"',
                        channels: 8,
                        bitrate: 3000000,
                        samplerate: 48000
                    }
                }
            }
        ]
    },

    audio_lossless: {
        category: "Lossless Audio",
        tests: [
            // FLAC
            {
                name: "FLAC (MKV)",
                codec: 'audio/x-matroska; codecs="flac"',
                container: "MKV",
                info: "Open lossless",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/x-matroska; codecs="flac"',
                        channels: 2,
                        bitrate: 1411000,
                        samplerate: 96000
                    }
                }
            },
            {
                name: "FLAC (MP4 non-standard)",
                codec: 'audio/mp4; codecs="flac"',
                container: "MP4",
                info: "Experimental",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/mp4; codecs="flac"',
                        channels: 2,
                        bitrate: 1411000,
                        samplerate: 96000
                    }
                }
            },
            {
                name: "FLAC (Native .flac)",
                codec: 'audio/flac',
                container: "FLAC",
                info: "Native container",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/flac',
                        channels: 2,
                        bitrate: 1411000,
                        samplerate: 96000
                    }
                },
                education: {
                    codecBreakdown: {
                        string: "audio/flac",
                        parts: [
                            { token: "audio/flac", meaning: "FLAC MIME type: Native FLAC container — no codec parameter needed because the container IS the codec. Unlike MP4/MKV/WebM which are generic containers that need a codecs parameter, .flac files contain only FLAC audio. The MIME type alone identifies everything" }
                        ]
                    },
                    overview: "FLAC (Free Lossless Audio Codec) is the Xiph.Org Foundation's lossless codec — companion to Vorbis (lossy) and Opus (low-latency). It's the de facto standard for music archival: lossless compression typically achieves 50-60% of PCM size. Every music library tool (foobar2000, MusicBrainz Picard, beets) treats FLAC as the reference format\n\nFLAC in three containers: native .flac (this test), MKV (audio/x-matroska; codecs=\"flac\"), and MP4 (audio/mp4; codecs=\"flac\" — non-standard, added by Apple for ALAC competition). Native .flac has the broadest browser support because it's the simplest: no container overhead, just FLAC frames with a streaminfo header\n\nAll major browsers support FLAC: Chrome (since 56), Firefox (since 51), Safari (since 11), Edge (Chromium-based). This makes FLAC the only lossless codec with universal browser support — TrueHD, DTS-HD MA, and ALAC all have gaps. For Jellyfin/Plex, FLAC is the safest lossless format for web clients",
                    references: [
                        { title: 'RFC 9639', url: 'https://datatracker.ietf.org/doc/html/rfc9639' }
                    ]
                }
            },
            {
                name: "FLAC Multichannel 5.1 (Native)",
                codec: 'audio/flac',
                container: "FLAC",
                info: "5.1 native FLAC",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/flac',
                        channels: 6,
                        bitrate: 4608000,
                        samplerate: 48000
                    }
                }
            },
            {
                name: "FLAC CD Quality (16-bit/44.1kHz)",
                codec: 'audio/flac',
                container: "FLAC",
                info: "Standard CD rip quality",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/flac',
                        channels: 2,
                        bitrate: 1000000,
                        samplerate: 44100
                    }
                }
            },
            // ALAC
            {
                name: "ALAC (Apple Lossless MP4)",
                codec: 'audio/mp4; codecs="alac"',
                container: "MP4",
                info: "Apple format",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/mp4; codecs="alac"',
                        channels: 2,
                        bitrate: 1411000,
                        samplerate: 96000
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: "audio/mp4",
                        string: "alac",
                        parts: [
                            { token: "alac", meaning: "ALAC codec tag: Apple Lossless Audio Codec in MP4/M4A container. Unlike FLAC's native container, ALAC always lives inside ISO BMFF (MP4/MOV). The codec tag is bare — no profile/level parameters. Apple open-sourced ALAC in 2011 but it remains Apple-ecosystem-first" }
                        ]
                    },
                    overview: "ALAC and FLAC are functionally equivalent for music: both are lossless, both support up to 32-bit/384kHz, both achieve ~50-60% compression. The difference is ecosystem: ALAC is the native lossless format for iTunes, Apple Music, AirPlay, and HomeKit. Apple Music's 'Lossless' tier delivers ALAC, not FLAC\n\nSafari/macOS/iOS decode ALAC natively (CoreAudio). Chrome decodes ALAC on macOS (via VideoToolbox) and Windows (via Media Foundation on some versions). Firefox has limited ALAC support. The asymmetry means ALAC works perfectly in the Apple ecosystem but may need transcoding for non-Apple web clients\n\nFor Jellyfin/Plex music libraries: if the source is ALAC (.m4a) and the client is Safari, direct play works. For Chrome/Firefox clients, the server should transcode to FLAC (lossless-to-lossless, fast) or AAC (lossy but universal). Most media servers handle this automatically based on client codec support profiles",
                    references: [
                        { title: 'Apple Lossless Audio Codec', url: 'https://alac.macosforge.org' }
                    ]
                }
            },
            {
                name: "ALAC (MOV)",
                codec: 'audio/quicktime; codecs="alac"',
                container: "MOV",
                info: "QuickTime variant",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/quicktime; codecs="alac"',
                        channels: 2,
                        bitrate: 1411000,
                        samplerate: 96000
                    }
                }
            },
            // PCM
            {
                name: "PCM (WAV)",
                codec: 'audio/wav; codecs="1"',
                container: "WAV",
                info: "Uncompressed",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/wav; codecs="1"',
                        channels: 2,
                        bitrate: 1536000,
                        samplerate: 48000
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: "audio/wav",
                        string: "audio/wav; codecs=\"1\"",
                        parts: [
                            { token: "audio/wav", meaning: "WAV MIME type: RIFF WAVE container (Microsoft/IBM, 1991). The oldest digital audio container still in common use" },
                            { token: "1", meaning: "format tag: WAV format tag 1 = PCM (uncompressed linear). The codecs parameter for WAV is the wFormatTag from the WAVEFORMATEX header. 1=PCM, 3=IEEE float, 6=A-law, 7=mu-law, 85=MP3. Most browser implementations only handle tag 1 (PCM)" }
                        ]
                    },
                    overview: "PCM WAV is literally raw samples with a header — no compression, no transform, no entropy coding. Every sample is a fixed-point integer (16-bit CD, 24-bit pro audio). The bitrate is deterministic: channels × bit_depth × sample_rate. Stereo 16-bit 48kHz = 2 × 16 × 48000 = 1,536,000 bps\n\nEvery browser decodes PCM WAV — it's the simplest audio format possible. The Web Audio API uses PCM internally (32-bit float), so WAV playback is just reading samples into the audio buffer. There are no patents, no licensing, no codec complexity. WAV is the universal truth format for audio testing\n\nWAV's limitation is file size: a 3-minute stereo CD-quality track is ~30 MB (vs ~15 MB FLAC, ~4 MB AAC). For media servers, WAV is impractical for libraries but common as intermediate format — audio editors export to WAV, then encode to the target format. If a client reports WAV support, the server could skip audio transcoding entirely for lossless sources",
                    references: [
                        { title: 'IEC 60908' }
                    ]
                }
            },
            {
                name: "PCM Hi-Res (24-bit/96kHz WAV)",
                codec: 'audio/wav; codecs="1"',
                container: "WAV",
                info: "Hi-Res uncompressed",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/wav; codecs="1"',
                        channels: 2,
                        bitrate: 4608000,
                        samplerate: 96000
                    }
                }
            },
            // Opus
            {
                name: "Opus (WebM)",
                codec: 'audio/webm; codecs="opus"',
                container: "WebM",
                info: "Low-latency",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/webm; codecs="opus"',
                        channels: 2,
                        bitrate: 128000,
                        samplerate: 48000
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: "audio/webm",
                        string: "opus",
                        parts: [
                            { token: "opus", meaning: "Opus codec tag: Opus (RFC 6716/7845, IETF). Hybrid codec combining SILK (speech, low latency) and CELT (music, full bandwidth). Bare tag with no parameters — Opus adapts internally based on content type. Mandatory codec for WebRTC" }
                        ]
                    },
                    overview: "Opus is unique among audio codecs: it's both the best low-latency speech codec AND competitive with AAC for music quality. At 128 kbps stereo it matches or beats AAC-LC in listening tests. At 32 kbps mono it outperforms every speech codec. This versatility made it the mandatory audio codec for WebRTC (RFC 7874)\n\nOpus operates at 48 kHz internally regardless of input — it resamples everything to 48000 Hz. The samplerate in mediaConfig is always 48000 for Opus. This is a codec design choice: 48 kHz gives enough bandwidth for full music fidelity while keeping the sample rate a multiple of common frame sizes\n\nWebM is Opus's native container (Google developed both). Opus also works in OGG (audio/ogg; codecs=\"opus\") and MP4 (audio/mp4; codecs=\"opus\" — added later for CMAF/DASH compatibility). Browser support is universal for WebM Opus. For Jellyfin, Opus in WebM is the safest lossy format for web transcoding — better quality than AAC at the same bitrate, and no licensing issues",
                    references: [
                        { title: 'RFC 6716', url: 'https://datatracker.ietf.org/doc/html/rfc6716' }
                    ]
                }
            },
            {
                name: "Opus (MKV)",
                codec: 'audio/x-matroska; codecs="opus"',
                container: "MKV",
                info: "Low-latency",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/x-matroska; codecs="opus"',
                        channels: 2,
                        bitrate: 128000,
                        samplerate: 48000
                    }
                }
            },
            {
                name: "Opus (MP4)",
                codec: 'audio/mp4; codecs="opus"',
                container: "MP4",
                info: "MP4 container",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/mp4; codecs="opus"',
                        channels: 2,
                        bitrate: 128000,
                        samplerate: 48000
                    }
                }
            },
            {
                name: "Opus Multichannel 5.1 (MP4)",
                codec: 'audio/mp4; codecs="opus"',
                container: "MP4",
                info: "5.1 Opus in MP4",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/mp4; codecs="opus"',
                        channels: 6,
                        bitrate: 384000,
                        samplerate: 48000
                    }
                }
            },
            {
                name: "FLAC Multichannel 5.1 (MP4)",
                codec: 'audio/mp4; codecs="flac"',
                container: "MP4",
                info: "5.1 FLAC in MP4",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/mp4; codecs="flac"',
                        channels: 6,
                        bitrate: 4608000,
                        samplerate: 48000
                    }
                }
            },
            {
                name: "FLAC Hi-Res (24-bit/96kHz MP4)",
                codec: 'audio/mp4; codecs="flac"',
                container: "MP4",
                info: "Hi-Res lossless in MP4",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/mp4; codecs="flac"',
                        channels: 2,
                        bitrate: 4608000,
                        samplerate: 96000
                    }
                }
            },
            {
                name: "ALAC Hi-Res (24-bit/96kHz MP4)",
                codec: 'audio/mp4; codecs="alac"',
                container: "MP4",
                info: "Apple Lossless Hi-Res",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/mp4; codecs="alac"',
                        channels: 2,
                        bitrate: 4608000,
                        samplerate: 96000
                    }
                }
            },
            // Additional lossless/high-quality variants
            {
                name: "Opus (OGG native)",
                codec: 'audio/ogg; codecs="opus"',
                container: "OGG",
                info: "Native Ogg container",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/ogg; codecs="opus"',
                        channels: 2,
                        bitrate: 128000,
                        samplerate: 48000
                    }
                }
            },
            {
                name: "FLAC Hi-Res (24-bit/192kHz)",
                codec: 'audio/flac',
                container: "FLAC",
                info: "Hi-Res lossless",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/flac',
                        channels: 2,
                        bitrate: 6144000,
                        samplerate: 192000
                    }
                }
            },
            {
                name: "ALAC (MKV)",
                codec: 'audio/x-matroska; codecs="alac"',
                container: "MKV",
                info: "Apple Lossless in Matroska",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/x-matroska; codecs="alac"',
                        channels: 2,
                        bitrate: 1411000,
                        samplerate: 96000
                    }
                }
            },
            {
                name: "PCM AIFF (Apple)",
                codec: 'audio/aiff',
                container: "AIFF",
                info: "Apple uncompressed",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/aiff',
                        channels: 2,
                        bitrate: 1536000,
                        samplerate: 48000
                    }
                }
            },
            {
                name: "PCM AIFF Hi-Res (24-bit/96kHz)",
                codec: 'audio/aiff',
                container: "AIFF",
                info: "Hi-Res Apple uncompressed",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/aiff',
                        channels: 2,
                        bitrate: 4608000,
                        samplerate: 96000
                    }
                }
            },
            {
                name: "Opus Multichannel 5.1 (WebM)",
                codec: 'audio/webm; codecs="opus"',
                container: "WebM",
                info: "5.1 surround Opus",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/webm; codecs="opus"',
                        channels: 6,
                        bitrate: 384000,
                        samplerate: 48000
                    }
                }
            },
            {
                name: "Opus Streaming (MSE WebM)",
                codec: 'audio/webm; codecs="opus"',
                container: "WebM",
                info: "Opus via Media Source",
                mediaConfig: {
                    type: 'media-source',
                    audio: {
                        contentType: 'audio/webm; codecs="opus"',
                        channels: 2,
                        bitrate: 128000,
                        samplerate: 48000
                    }
                }
            },
            {
                name: "FLAC Multichannel 5.1 (MKV)",
                codec: 'audio/x-matroska; codecs="flac"',
                container: "MKV",
                info: "5.1 lossless FLAC",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/x-matroska; codecs="flac"',
                        channels: 6,
                        bitrate: 4233000,
                        samplerate: 96000
                    }
                }
            },
            // MKV lossless audio coverage
            {
                name: "Opus Multichannel 5.1 (MKV)",
                codec: 'audio/x-matroska; codecs="opus"',
                container: "MKV",
                info: "5.1 Opus in MKV",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/x-matroska; codecs="opus"',
                        channels: 6,
                        bitrate: 384000,
                        samplerate: 48000
                    }
                }
            },
            {
                name: "PCM (MKV S16LE)",
                codec: 'audio/x-matroska; codecs="A_PCM/INT/LIT"',
                container: "MKV",
                info: "Uncompressed PCM in MKV",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/x-matroska; codecs="A_PCM/INT/LIT"',
                        channels: 2,
                        bitrate: 1536000,
                        samplerate: 48000
                    }
                }
            },
            {
                name: "FLAC Hi-Res (24-bit/192kHz MKV)",
                codec: 'audio/x-matroska; codecs="flac"',
                container: "MKV",
                info: "Hi-Res lossless in MKV",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/x-matroska; codecs="flac"',
                        channels: 2,
                        bitrate: 6144000,
                        samplerate: 192000
                    }
                }
            }
        ]
    },

    audio_standard: {
        category: "Standard Audio",
        tests: [
            // AAC variants
            {
                name: "AAC-LC (MP4)",
                codec: 'audio/mp4; codecs="mp4a.40.2"',
                container: "MP4",
                info: "Standard AAC",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/mp4; codecs="mp4a.40.2"',
                        channels: 2,
                        bitrate: 192000,
                        samplerate: 48000
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: "audio/mp4",
                        string: "mp4a.40.2",
                        parts: [
                            { token: "mp4a", meaning: "MPEG-4 Audio tag: ISO/IEC 14496-3 audio in MP4 container. Covers the entire AAC family — LC, HE, HE v2, xHE/USAC, ELD, LD. The specific profile is identified by the third parameter" },
                            { token: "40", meaning: "objectTypeIndication: 0x40 = MPEG-4 Audio (ISO/IEC 14496-3). Same OTI for all AAC profiles — it identifies the codec family, not the specific profile. Compare: 0x20=MPEG-4 Visual (video), 0x69=MP3" },
                            { token: "2", meaning: "audioObjectType: AOT 2 = AAC-LC (Low Complexity). The default AAC profile: full-bandwidth audio without the spectral band replication (SBR) or parametric stereo (PS) tools. Other AOTs: 5=HE-AAC v1, 29=HE-AAC v2, 42=xHE-AAC/USAC, 23=ER AAC-LD, 39=AAC-ELD" }
                        ]
                    },
                    overview: "The mp4a.40.X numbering comes from ISO/IEC 14496-1 (Systems) and 14496-3 (Audio). The audioObjectType (third field) maps directly to the AOT table in 14496-3: 1=AAC Main, 2=AAC-LC, 3=AAC-SSR, 4=AAC-LTP, 5=SBR (HE-AAC), 29=PS (HE-AAC v2), 42=USAC (xHE-AAC). These are decimal, not hex\n\nAAC-LC at 192 kbps stereo is the de facto standard for streaming audio. YouTube, Spotify (on mobile), Apple Music (lossy tier), and every HLS/DASH stream use AAC-LC as the baseline audio codec. It's the audio equivalent of H.264 High Profile — the universal format every device handles\n\nEvery browser supports AAC-LC: Chrome, Firefox (since 22, via platform decoders), Safari, Edge. It's the only lossy audio codec with truly universal browser support (Opus is close but Safari added it later). For Jellyfin/Plex, AAC-LC is the safe fallback when the client can't handle the original audio codec",
                    references: [
                        { title: 'ISO/IEC 14496-3' }
                    ]
                }
            },
            {
                name: "AAC-LC (ADTS native)",
                codec: 'audio/aac',
                container: "AAC",
                info: "Native AAC",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/aac',
                        channels: 2,
                        bitrate: 192000,
                        samplerate: 48000
                    }
                }
            },
            {
                name: "AAC-HE v1 (ADTS native)",
                codec: 'audio/aac',
                container: "AAC",
                info: "HE-AAC native container",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/aac',
                        channels: 2,
                        bitrate: 64000,
                        samplerate: 44100
                    }
                }
            },
            {
                name: "AAC-HE v1 (HE-AAC)",
                codec: 'audio/mp4; codecs="mp4a.40.5"',
                container: "MP4",
                info: "High Efficiency",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/mp4; codecs="mp4a.40.5"',
                        channels: 2,
                        bitrate: 64000,
                        samplerate: 48000
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: "audio/mp4",
                        string: "mp4a.40.5",
                        parts: [
                            { token: "mp4a", meaning: "MPEG-4 Audio tag: Same tag family as AAC-LC" },
                            { token: "40", meaning: "objectTypeIndication: 0x40 = MPEG-4 Audio" },
                            { token: "5", meaning: "audioObjectType: AOT 5 = SBR (Spectral Band Replication) = HE-AAC v1. SBR reconstructs high frequencies from low-frequency content + side information. This lets HE-AAC deliver near-AAC-LC quality at half the bitrate (64 kbps vs 128 kbps)" }
                        ]
                    },
                    overview: "HE-AAC v1 works by encoding the low frequencies (0-8 kHz) with standard AAC-LC, then adding a small SBR payload that describes how to reconstruct the 8-20 kHz range from harmonics of the lower frequencies. A legacy AAC-LC decoder can play HE-AAC v1 — it just hears the low-frequency core (implicit backward compatibility)\n\nThe AOT numbering reveals the family tree: AOT 2 (AAC-LC) + AOT 5 (SBR) = HE-AAC v1. Then AOT 29 adds Parametric Stereo (PS) on top = HE-AAC v2. Each layer adds a bandwidth-saving tool. The decoder peels layers: USAC decoders handle all AOTs, HE v2 decoders handle v2/v1/LC, LC decoders handle only LC\n\nDAB+ digital radio in Europe mandates HE-AAC v1. It's also the standard for low-bitrate streaming on mobile networks — Spotify on 2G/3G connections uses HE-AAC at 48-96 kbps. At 64 kbps, HE-AAC v1 sounds noticeably better than AAC-LC at the same bitrate, but worse than AAC-LC at 128 kbps",
                    references: [
                        { title: 'ISO/IEC 14496-3' }
                    ]
                }
            },
            {
                name: "AAC-HE v2 (HE-AAC v2)",
                codec: 'audio/mp4; codecs="mp4a.40.29"',
                container: "MP4",
                info: "Parametric Stereo",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/mp4; codecs="mp4a.40.29"',
                        channels: 2,
                        bitrate: 48000,
                        samplerate: 48000
                    }
                }
            },
            {
                name: "xHE-AAC (USAC)",
                codec: 'audio/mp4; codecs="mp4a.40.42"',
                container: "MP4",
                info: "Extended HE-AAC",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/mp4; codecs="mp4a.40.42"',
                        channels: 2,
                        bitrate: 32000,
                        samplerate: 48000
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: "audio/mp4",
                        string: "mp4a.40.42",
                        parts: [
                            { token: "mp4a", meaning: "MPEG-4 Audio tag: Same tag family as AAC-LC/HE-AAC" },
                            { token: "40", meaning: "objectTypeIndication: 0x40 = MPEG-4 Audio" },
                            { token: "42", meaning: "audioObjectType: AOT 42 = USAC (Unified Speech and Audio Coding) = xHE-AAC. Combines MPEG-D DRC (loudness normalization), enhanced SBR, ACELP speech coding, and parametric stereo into a single codec. Operates from 12 kbps to 500+ kbps" }
                        ]
                    },
                    overview: "xHE-AAC is what Apple uses for Spatial Audio Lossless playback metadata and what Android uses for BLE Audio (Bluetooth LE Audio standard mandates LC3 which is USAC-derived). It's the most advanced AAC profile: it switches between speech coding (ACELP, like a phone codec) and music coding (MDCT, like AAC-LC) on a frame-by-frame basis\n\nThe AOT 42 number is notable — it's well above the original AAC AOTs (1-5) because USAC was standardized much later (ISO/IEC 23003-3, published 2012). The gap between AOT 29 (HE-AAC v2) and AOT 42 (USAC) spans a decade of MPEG audio research\n\nBrowser support is emerging: Safari supports xHE-AAC since iOS 15/macOS 12 (CoreAudio native). Chrome on Android supports it since Android 9 (via MediaCodec). Chrome on desktop and Firefox have limited support. Apple Music uses xHE-AAC for some low-bitrate adaptive streams (the codec switches between xHE and AAC-LC based on network conditions)",
                    references: [
                        { title: 'ISO/IEC 14496-3' }
                    ]
                }
            },
            // MP3
            {
                name: "MP3",
                codec: 'audio/mpeg',
                container: "MP3",
                info: "MPEG-1 Layer 3",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/mpeg',
                        channels: 2,
                        bitrate: 320000,
                        samplerate: 48000
                    }
                },
                education: {
                    codecBreakdown: {
                        string: "audio/mpeg",
                        parts: [
                            { token: "audio/mpeg", meaning: "MPEG audio MIME type: MPEG-1 Layer III (ISO/IEC 11172-3, 1993). Like native FLAC and WAV, the MIME type alone identifies the codec — no codecs parameter needed. The .mp3 file has no separate container; the MPEG audio frames are the entire file (optionally with ID3 tags prepended)" }
                        ]
                    },
                    overview: "MP3 was the codec that created digital music distribution. Developed at Fraunhofer IIS, it reduced CD audio from 1.4 Mbps to 128-320 kbps with acceptable quality. Napster (1999), iPod (2001), and iTunes Store (2003) all ran on MP3. Every significant patent expired by 2017, making it fully royalty-free\n\nAt 320 kbps, MP3 is transparent (indistinguishable from CD) for most listeners and content. At 128 kbps — the Napster-era standard — artifacts are audible on complex music (cymbals, reverb tails). AAC-LC at 128 kbps sounds better than MP3 at 128 kbps, which is why streaming services switched\n\nUniversal browser support — every browser that plays audio plays MP3. The HTML5 <audio> element was practically designed around MP3 compatibility. For media servers, MP3 is the 'just works' format: no transcoding needed, no compatibility checking, instant playback everywhere. Its only limitation is stereo-only (no surround) and lossy-only",
                    references: [
                        { title: 'ISO/IEC 11172-3' }
                    ]
                }
            },
            // Vorbis
            {
                name: "Vorbis (WebM)",
                codec: 'audio/webm; codecs="vorbis"',
                container: "WebM",
                info: "Open format",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/webm; codecs="vorbis"',
                        channels: 2,
                        bitrate: 192000,
                        samplerate: 48000
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: "audio/webm",
                        string: "vorbis",
                        parts: [
                            { token: "vorbis", meaning: "Vorbis codec tag: Xiph.Org Vorbis (2000). Open-source lossy audio codec, designed as a patent-free alternative to MP3 and AAC. Bare tag — no profile/level parameters. Supports mono through 255 channels, 8-192 kHz sample rate" }
                        ]
                    },
                    overview: "Vorbis was the audio companion to Theora (video) in the Xiph.Org open media stack. At comparable bitrates, Vorbis matches or slightly exceeds MP3 quality (especially at low bitrates like 96 kbps) but falls behind AAC-LC at higher bitrates. Opus has now superseded Vorbis for new content\n\nVorbis appears in three containers: OGG (native, audio/ogg; codecs=\"vorbis\"), WebM (Google adopted it for WebM audio before Opus existed), and MKV (Matroska supports any codec). OGG Vorbis was the Spotify format for years before they switched to AAC/Opus\n\nChrome and Firefox support Vorbis in both WebM and OGG. Safari added WebM Vorbis support in Safari 14.1 (alongside VP8). For new content, use Opus instead — it's Vorbis's spiritual successor with better quality at every bitrate. Vorbis matters for playing existing content in media libraries",
                    references: [
                        { title: 'Vorbis I Specification', url: 'https://xiph.org/vorbis/doc/Vorbis_I_spec.html' }
                    ]
                }
            },
            {
                name: "Vorbis Multichannel 5.1 (WebM)",
                codec: 'audio/webm; codecs="vorbis"',
                container: "WebM",
                info: "5.1 Vorbis in WebM",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/webm; codecs="vorbis"',
                        channels: 6,
                        bitrate: 384000,
                        samplerate: 48000
                    }
                }
            },
            {
                name: "Vorbis (MKV)",
                codec: 'audio/x-matroska; codecs="vorbis"',
                container: "MKV",
                info: "Open format",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/x-matroska; codecs="vorbis"',
                        channels: 2,
                        bitrate: 192000,
                        samplerate: 48000
                    }
                }
            },
            {
                name: "Vorbis (OGG)",
                codec: 'audio/ogg; codecs="vorbis"',
                container: "OGG",
                info: "Native container",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/ogg; codecs="vorbis"',
                        channels: 2,
                        bitrate: 192000,
                        samplerate: 48000
                    }
                }
            },
            // Additional standard audio variants
            {
                name: "AAC-LC (MKV)",
                codec: 'audio/x-matroska; codecs="mp4a.40.2"',
                container: "MKV",
                info: "AAC in Matroska",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/x-matroska; codecs="mp4a.40.2"',
                        channels: 2,
                        bitrate: 192000,
                        samplerate: 48000
                    }
                }
            },
            {
                name: "AAC-LC (MOV)",
                codec: 'audio/quicktime; codecs="mp4a.40.2"',
                container: "MOV",
                info: "AAC in QuickTime",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/quicktime; codecs="mp4a.40.2"',
                        channels: 2,
                        bitrate: 192000,
                        samplerate: 48000
                    }
                }
            },
            {
                name: "AAC-HE v1 (MOV)",
                codec: 'audio/quicktime; codecs="mp4a.40.5"',
                container: "MOV",
                info: "HE-AAC in QuickTime",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/quicktime; codecs="mp4a.40.5"',
                        channels: 2,
                        bitrate: 64000,
                        samplerate: 44100
                    }
                }
            },
            {
                name: "AAC Multichannel 5.1 (MP4)",
                codec: 'audio/mp4; codecs="mp4a.40.2"',
                container: "MP4",
                info: "AAC 5.1 surround",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/mp4; codecs="mp4a.40.2"',
                        channels: 6,
                        bitrate: 384000,
                        samplerate: 48000
                    }
                }
            },
            {
                name: "AAC-ELD (Enhanced Low Delay)",
                codec: 'audio/mp4; codecs="mp4a.40.39"',
                container: "MP4",
                info: "Low-delay communications",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/mp4; codecs="mp4a.40.39"',
                        channels: 2,
                        bitrate: 64000,
                        samplerate: 48000
                    }
                }
            },
            {
                name: "AAC-LC Streaming (MSE)",
                codec: 'audio/mp4; codecs="mp4a.40.2"',
                container: "fMP4",
                info: "AAC via Media Source",
                mediaConfig: {
                    type: 'media-source',
                    audio: {
                        contentType: 'audio/mp4; codecs="mp4a.40.2"',
                        channels: 2,
                        bitrate: 192000,
                        samplerate: 48000
                    }
                }
            },
            {
                name: "AAC-LD (Low Delay MP4)",
                codec: 'audio/mp4; codecs="mp4a.40.23"',
                container: "MP4",
                info: "Low latency conferencing",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/mp4; codecs="mp4a.40.23"',
                        channels: 2,
                        bitrate: 64000,
                        samplerate: 48000
                    }
                }
            },
            {
                name: "MP3 in MP4 (mp4a.6B)",
                codec: 'audio/mp4; codecs="mp3"',
                container: "MP4",
                info: "MPEG-1 Layer 3 in ISOBMFF",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/mp4; codecs="mp3"',
                        channels: 2,
                        bitrate: 320000,
                        samplerate: 44100
                    }
                }
            },
            {
                name: "Vorbis Multichannel 5.1 (OGG)",
                codec: 'audio/ogg; codecs="vorbis"',
                container: "OGG",
                info: "5.1 surround Vorbis",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/ogg; codecs="vorbis"',
                        channels: 6,
                        bitrate: 384000,
                        samplerate: 48000
                    }
                }
            },
            {
                name: "FLAC (OGG container)",
                codec: 'audio/ogg; codecs="flac"',
                container: "OGG",
                info: "FLAC in Ogg container",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/ogg; codecs="flac"',
                        channels: 2,
                        bitrate: 1411000,
                        samplerate: 44100
                    }
                }
            },
            // MKV standard audio coverage
            {
                name: "AAC-HE v1 (MKV)",
                codec: 'audio/x-matroska; codecs="mp4a.40.5"',
                container: "MKV",
                info: "HE-AAC in MKV",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/x-matroska; codecs="mp4a.40.5"',
                        channels: 2,
                        bitrate: 64000,
                        samplerate: 48000
                    }
                }
            },
            {
                name: "AAC-HE v2 (MKV)",
                codec: 'audio/x-matroska; codecs="mp4a.40.29"',
                container: "MKV",
                info: "HE-AAC v2 in MKV",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/x-matroska; codecs="mp4a.40.29"',
                        channels: 2,
                        bitrate: 48000,
                        samplerate: 48000
                    }
                }
            },
            {
                name: "Vorbis Multichannel 5.1 (MKV)",
                codec: 'audio/x-matroska; codecs="vorbis"',
                container: "MKV",
                info: "5.1 Vorbis in MKV",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/x-matroska; codecs="vorbis"',
                        channels: 6,
                        bitrate: 384000,
                        samplerate: 48000
                    }
                }
            }
        ]
    },

    // ==================== LEGACY VIDEO CODECS ====================

    video_vp8: {
        category: "VP8",
        tests: [
            {
                name: "VP8 (WebM)",
                codec: 'video/webm; codecs="vp8"',
                container: "WebM",
                info: "8-bit SDR",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/webm; codecs="vp8"',
                        width: 1920,
                        height: 1080,
                        bitrate: 5000000,
                        framerate: 30
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: "video/webm",
                        string: "vp8",
                        parts: [
                            { token: "vp8", meaning: "codec identifier: VP8 has no profile/level parameters in its codec string — just the bare identifier. VP8 predates the structured codec string conventions used by VP9 (vp09.PP.LL.DD) and AV1 (av01.P.LLT.DD). All VP8 streams have the same capabilities: 8-bit 4:2:0 only" }
                        ]
                    },
                    overview: "Google acquired On2 Technologies in 2010 and open-sourced VP8 as the video codec for WebM. It was Google's answer to H.264's patent licensing — a royalty-free alternative. The WebM project (VP8+Vorbis in Matroska) launched alongside Chrome 6\n\nVP8 has no profiles or levels because it has no feature tiers — every VP8 decoder must support the full spec. This simplicity comes at a cost: no 10-bit, no 4:4:4, no HDR. It targets a single use case: 8-bit 4:2:0 web video at up to ~4K resolution\n\nChrome and Firefox support VP8 universally. Safari added VP8 WebM playback in Safari 14.1 (macOS Big Sur / iOS 14.5). Apple's support was a concession to WebRTC — VP8 was mandatory in the WebRTC 1.0 spec for interop, so Safari had to add it for video calls",
                    references: [
                        { title: 'RFC 6386', url: 'https://datatracker.ietf.org/doc/html/rfc6386' }
                    ]
                }
            },
            {
                name: "VP8 (WebM 720p)",
                codec: 'video/webm; codecs="vp8"',
                container: "WebM",
                info: "8-bit 720p",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/webm; codecs="vp8"',
                        width: 1280,
                        height: 720,
                        bitrate: 2000000,
                        framerate: 30
                    }
                }
            },
            {
                name: "VP8 (4K WebM)",
                codec: 'video/webm; codecs="vp8"',
                container: "WebM",
                info: "VP8 4K capability test",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/webm; codecs="vp8"',
                        width: 3840,
                        height: 2160,
                        bitrate: 15000000,
                        framerate: 30
                    }
                }
            },
            {
                name: "VP8 (Streaming MSE WebM)",
                codec: 'video/webm; codecs="vp8"',
                container: "WebM",
                info: "VP8 via Media Source",
                mediaConfig: {
                    type: 'media-source',
                    video: {
                        contentType: 'video/webm; codecs="vp8"',
                        width: 1280,
                        height: 720,
                        bitrate: 2000000,
                        framerate: 30
                    }
                }
            },
            // MKV VP8 coverage
            {
                name: "VP8 (MKV)",
                codec: 'video/x-matroska; codecs="vp8"',
                container: "MKV",
                info: "VP8 in Matroska",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="vp8"',
                        width: 1920,
                        height: 1080,
                        bitrate: 5000000,
                        framerate: 30
                    }
                }
            }
        ]
    },

    video_legacy: {
        category: "Legacy Codecs",
        tests: [
            {
                name: "Theora (OGG)",
                codec: 'video/ogg; codecs="theora"',
                container: "OGG",
                info: "Open format legacy",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/ogg; codecs="theora"',
                        width: 1280,
                        height: 720,
                        bitrate: 3000000,
                        framerate: 30
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: "video/ogg",
                        string: "theora",
                        parts: [
                            { token: "theora", meaning: "codec identifier: Like VP8, Theora uses a bare identifier with no profile/level parameters. Theora's codec string in OGG containers is just 'theora'. The codec was based on On2's VP3, donated to the Xiph.Org Foundation in 2001" }
                        ]
                    },
                    overview: "Theora was the Xiph.Org Foundation's video codec — companion to Vorbis (audio) and OGG (container). It was the open-source community's answer to MPEG-4/H.264 licensing in the early 2000s. Wikipedia, Archive.org, and early YouTube considered it before H.264 won\n\nFirefox was the first browser to add native Theora support (Firefox 3.5, 2009) as part of the HTML5 <video> debate. The W3C considered mandating Theora as the baseline codec for HTML5 but Apple and Microsoft refused, leading to the current 'no mandatory codec' policy\n\nTheora is effectively dead for new content — VP8/VP9/AV1 surpassed it in every metric. Firefox still decodes it for backwards compatibility. Chrome supports it via the ffmpeg-based media pipeline. Safari does not support Theora at all. Its legacy is political: it proved open codecs were viable and paved the way for AV1",
                    references: [
                        { title: 'Theora Specification', url: 'https://theora.org/doc/Theora.pdf' }
                    ]
                }
            },
            {
                name: "Theora (OGG 480p)",
                codec: 'video/ogg; codecs="theora"',
                container: "OGG",
                info: "Standard definition Theora",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/ogg; codecs="theora"',
                        width: 640,
                        height: 480,
                        bitrate: 1000000,
                        framerate: 25
                    }
                }
            },
            {
                name: "MPEG-4 Part 2 (Simple Profile)",
                codec: 'video/mp4; codecs="mp4v.20.9"',
                container: "MP4",
                info: "ISO MPEG-4 Visual",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="mp4v.20.9"',
                        width: 720,
                        height: 480,
                        bitrate: 2000000,
                        framerate: 30
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: "video/mp4",
                        string: "mp4v.20.9",
                        parts: [
                            { token: "mp4v", meaning: "MPEG-4 Visual tag: MPEG-4 Part 2 (ISO/IEC 14496-2), also known as MPEG-4 Visual or MPEG-4 ASP. Not to be confused with MPEG-4 Part 10 which is H.264/AVC. The 'mp4v' tag covers all Part 2 profiles" },
                            { token: "20", meaning: "objectTypeIndication: 0x20 = MPEG-4 Visual (ISO/IEC 14496-2). This is the MPEG-4 Systems ObjectTypeIndication from ISO/IEC 14496-1 Table 5. Other values: 0x40=AAC audio, 0x60=MPEG-2 video, 0x69=MP3. It identifies the codec family, not the specific profile" },
                            { token: "9", meaning: "profile-level-id: Decimal value from the Visual Profile and Level Indication table. 9 = Simple Profile Level 0. Other values: 1=Simple L1, 2=Simple L2, 3=Simple L3, 240=Advanced Simple L0, 245=Advanced Simple L5. The numbering is non-sequential and defined in Annex G" }
                        ]
                    },
                    overview: "MPEG-4 Part 2 is the codec behind DivX and Xvid — the dominant video format of the early 2000s file-sharing era. Simple Profile restricts to I/P frames only (like H.264 Baseline), making it the lowest-complexity MPEG-4 Part 2 variant\n\nThe codec string format 'mp4v.20.X' uses three components: tag (mp4v), ObjectTypeIndication (20 = MPEG-4 Visual), and profile-level-id (specific profile). This is the ISO BMFF (MP4) registration — AVI DivX files used FourCC codes (DIVX, XVID, DX50) instead\n\nMost browsers still decode MPEG-4 Part 2 Simple Profile because it's cheap to support via hardware decoders that also handle H.264. The codec is everywhere in legacy content — early digital cameras, early smartphones, DVD rips from the 2000s. Jellyfin encounters it in old movie collections",
                    references: [
                        { title: 'ISO/IEC 14496-2' }
                    ]
                }
            },
            {
                name: "MPEG-4 Part 2 (Advanced Simple)",
                codec: 'video/mp4; codecs="mp4v.20.240"',
                container: "MP4",
                info: "ASP (DivX/Xvid compatible)",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/mp4; codecs="mp4v.20.240"',
                        width: 1920,
                        height: 1080,
                        bitrate: 4000000,
                        framerate: 24
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: "video/mp4",
                        string: "mp4v.20.240",
                        parts: [
                            { token: "mp4v", meaning: "MPEG-4 Visual tag: MPEG-4 Part 2 (ISO/IEC 14496-2)" },
                            { token: "20", meaning: "objectTypeIndication: 0x20 = MPEG-4 Visual codec family" },
                            { token: "240", meaning: "profile-level-id: 240 = Advanced Simple Profile Level 0. ASP adds B-frames, quarter-pel motion compensation, and global motion compensation over Simple Profile. DivX 4-6 and Xvid encode ASP. Level 0 is base; Level 5 (245) allows 720p@30" }
                        ]
                    },
                    overview: "Advanced Simple Profile is what people mean when they say 'DivX' or 'Xvid'. The DivX codec was a commercial ASP encoder; Xvid was the open-source equivalent. Both produce MPEG-4 Part 2 ASP bitstreams — the FourCC differs (DIVX vs XVID) but the codec is identical\n\nASP's B-frames were its killer feature over Simple Profile — 20-30% bitrate savings that made 700MB 'CD-rip' quality possible for feature-length movies. This was the lingua franca of file sharing from ~2002-2008 before H.264 displaced it\n\nBrowser support for ASP is inconsistent. Chrome/Edge may decode it via platform decoders (Windows Media Foundation on Windows, VideoToolbox on macOS). Firefox uses ffmpeg. Safari decodes it natively. The inconsistency matters for Jellyfin/Plex: some clients direct-play old DivX content, others need transcoding",
                    references: [
                        { title: 'ISO/IEC 14496-2' }
                    ]
                }
            },
            {
                name: "MPEG-4 Part 2 (3GP)",
                codec: 'video/3gpp; codecs="mp4v.20.9"',
                container: "3GP",
                info: "Mobile legacy format",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/3gpp; codecs="mp4v.20.9"',
                        width: 352,
                        height: 288,
                        bitrate: 384000,
                        framerate: 15
                    }
                }
            },
            {
                name: "H.263 (3GP)",
                codec: 'video/3gpp; codecs="h263"',
                container: "3GP",
                info: "Legacy mobile video",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/3gpp; codecs="h263"',
                        width: 352,
                        height: 288,
                        bitrate: 384000,
                        framerate: 15
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: "video/3gpp",
                        string: "h263",
                        parts: [
                            { token: "h263", meaning: "codec identifier: H.263 (ITU-T Recommendation H.263) was designed for video conferencing over ISDN and PSTN lines. Like VP8 and Theora, the codec string is a bare identifier with no profile/level parameters in the MIME type. H.263 profiles (Baseline through High Latency) are signaled in the bitstream, not the container" }
                        ]
                    },
                    overview: "H.263 was the predecessor to H.264 — developed by the ITU-T Video Coding Experts Group (VCEG) in 1995. It introduced half-pel motion compensation and variable-length coding that H.264 later refined. The resolution targets were CIF (352×288) and QCIF (176×144) — video phone sizes\n\n3GP (3GPP file format) was the mandatory container for H.263 on 2G/3G mobile networks. Every feature phone from ~2003-2010 could play H.263 in 3GP. MMS video messages used H.263+AMR-NB at QCIF resolution. 3GP is a simplified MP4 (ISO BMFF profile) with mobile-specific tracks\n\nH.263 support in modern browsers is disappearing. Chrome dropped it from Android, Safari never supported 3GP natively in the browser (though iOS can play it via the media framework), and Firefox removed it. If this test shows supported, the browser has legacy decoder paths — useful for playing old phone recordings in Jellyfin",
                    references: [
                        { title: 'ITU-T H.263' }
                    ]
                }
            },
            {
                name: "H.264 Baseline (3GP)",
                codec: 'video/3gpp; codecs="avc1.42E01E"',
                container: "3GP",
                info: "Modern H.264 in 3GP",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/3gpp; codecs="avc1.42E01E"',
                        width: 720,
                        height: 480,
                        bitrate: 1000000,
                        framerate: 30
                    }
                }
            },
            // MKV legacy codec coverage
            {
                name: "MPEG-4 Part 2 (MKV)",
                codec: 'video/x-matroska; codecs="mp4v.20.9"',
                container: "MKV",
                info: "MPEG-4 Visual in MKV",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="mp4v.20.9"',
                        width: 720,
                        height: 480,
                        bitrate: 2000000,
                        framerate: 30
                    }
                }
            },
            {
                name: "Theora (MKV)",
                codec: 'video/x-matroska; codecs="theora"',
                container: "MKV",
                info: "Theora in Matroska",
                mediaConfig: {
                    type: 'file',
                    video: {
                        contentType: 'video/x-matroska; codecs="theora"',
                        width: 1280,
                        height: 720,
                        bitrate: 3000000,
                        framerate: 30
                    }
                }
            }
        ]
    },

    // ==================== NEXT-GEN AUDIO ====================

    audio_mpeg_h: {
        category: "MPEG-H 3D Audio",
        tests: [
            {
                name: "MPEG-H 3D Audio LC (MP4)",
                codec: 'audio/mp4; codecs="mhm1.0x0D"',
                container: "MP4",
                info: "Low Complexity profile",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/mp4; codecs="mhm1.0x0D"',
                        channels: 8,
                        bitrate: 512000,
                        samplerate: 48000
                    }
                },
                education: {
                    codecBreakdown: {
                        mime: "audio/mp4",
                        string: "mhm1.0x0D",
                        parts: [
                            { token: "mhm1", meaning: "MPEG-H MHA tag: MPEG-H 3D Audio (ISO/IEC 23008-3) single-stream variant. mhm1 = single MHAS (MPEG-H Audio Stream) in the MP4 track. mhm2 = multi-stream variant with multiple MHAS payloads per track (for separate language/commentary streams)" },
                            { token: "0x0D", meaning: "profileLevelIndication: 0x0D = 13 = Low Complexity Profile Level 3. MPEG-H profiles: 0x0B=Baseline L3, 0x0C=LC L1, 0x0D=LC L3, 0x0E=LC L4. The hex prefix '0x' is part of the codec string — unlike other codecs that use plain decimal or hex, MPEG-H explicitly marks its profile-level as hexadecimal" }
                        ]
                    },
                    overview: "MPEG-H 3D Audio is the open standard competitor to Dolby Atmos and DTS:X. It combines channel-based audio (5.1/7.1 bed), object-based audio (positioned sounds), and scene-based audio (Higher Order Ambisonics/HOA) in a single codec. The listener can interactively adjust dialogue levels and select audio objects\n\nMPEG-H is mandated by ATSC 3.0 (US next-gen broadcast, alongside AC-4), DVB (European digital TV), and TTAS (Korean digital TV — Korea has been broadcasting MPEG-H since 2017 on terrestrial TV). Sony 360 Reality Audio is built on MPEG-H. It's the most deployed immersive audio standard in broadcast\n\nBrowser support is near-zero outside Samsung TVs (which include MPEG-H decoders for Korean broadcast content) and some Sony devices. No desktop browser ships an MPEG-H decoder. The codec competes with Dolby Atmos for streaming services — and Dolby's E-AC-3 JOC has the market locked down. MPEG-H's strength is broadcast, not OTT streaming",
                    references: [
                        { title: 'ISO/IEC 23008-3' }
                    ]
                }
            },
            {
                name: "MPEG-H 3D Audio (mhm2 MP4)",
                codec: 'audio/mp4; codecs="mhm2.0x0D"',
                container: "MP4",
                info: "Multi-stream variant",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/mp4; codecs="mhm2.0x0D"',
                        channels: 8,
                        bitrate: 768000,
                        samplerate: 48000
                    }
                }
            },
            {
                name: "MPEG-H Baseline (MP4)",
                codec: 'audio/mp4; codecs="mhm1.0x0B"',
                container: "MP4",
                info: "Baseline profile",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/mp4; codecs="mhm1.0x0B"',
                        channels: 2,
                        bitrate: 256000,
                        samplerate: 48000
                    }
                }
            },
            // MKV MPEG-H coverage
            {
                name: "MPEG-H 3D Audio LC (MKV)",
                codec: 'audio/x-matroska; codecs="mhm1.0x0D"',
                container: "MKV",
                info: "3D Audio in MKV",
                mediaConfig: {
                    type: 'file',
                    audio: {
                        contentType: 'audio/x-matroska; codecs="mhm1.0x0D"',
                        channels: 8,
                        bitrate: 512000,
                        samplerate: 48000
                    }
                }
            }
        ]
    }
};
