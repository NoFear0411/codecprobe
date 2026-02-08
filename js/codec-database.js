/**
 * Comprehensive Codec Test Database
 *
 * Covers all major video and audio codecs across all container formats:
 * - ISO BMFF (MP4, fMP4, CMAF)
 * - Apple (HLS, MOV, QuickTime)
 * - Matroska (MKV, WebM)
 * - MPEG-DASH streaming
 * - webOS/LG TV specific variants
 *
 * Based on ISO/IEC 14496, ITU-T standards, Dolby, DTS, Apple, and MPEG specifications
 */

const codecDatabase = {
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
                    overview: 'HEVC Main 10 Profile with HDR10 uses 10-bit color depth to support wide color gamut (BT.2020) and high dynamic range via PQ (Perceptual Quantizer) transfer function. This is the baseline HDR format, using static metadata (MaxCLL, MaxFALL) to define content characteristics. Widely supported across all modern devices and streaming platforms.',
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
                    }
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
                    overview: "Dolby Vision Profile 8.1 is a single-layer format where Dolby Vision metadata is embedded alongside an HDR10 base layer. This allows backwards compatibility: non-DV devices see HDR10, DV-capable devices upgrade to full Dolby Vision with dynamic metadata and enhanced tone mapping. Most common format for streaming services like Netflix, Disney+, and Apple TV+.",
                    streaming: {
                        hls: {
                            m3u8: `#EXTM3U
#EXT-X-VERSION:6
#EXT-X-STREAM-INF:BANDWIDTH=15000000,CODECS="dvh1.08.06,mp4a.40.2",RESOLUTION=3840x2160,VIDEO-RANGE=PQ
stream_dv81.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=8000000,CODECS="hvc1.2.4.L153.B0,mp4a.40.2",RESOLUTION=3840x2160,VIDEO-RANGE=PQ
stream_hdr10.m3u8`,
                            notes: 'VIDEO-RANGE=PQ is REQUIRED for Dolby Vision on iOS/tvOS. Use supplemental codec string "dvh1" (cross-compatible) or "dvhe" (BL+EL explicit). Always provide HDR10 fallback stream for non-DV devices.'
                        },
                        dash: {
                            mpd: `<AdaptationSet mimeType="video/mp4" codecs="dvh1.08.06">
  <SupplementalProperty schemeIdUri="urn:dvb:dash:dovi" value="08.06"/>
  <Representation bandwidth="15000000" width="3840" height="2160">
    <SegmentTemplate media="dv_$Number$.m4s" initialization="dv_init.mp4"/>
  </Representation>
</AdaptationSet>`,
                            notes: 'SupplementalProperty with schemeIdUri="urn:dvb:dash:dovi" activates hardware decoders. Value must match codec profile (08.06 = Profile 8.1, Level 6).'
                        }
                    },
                    platforms: {
                        apple: 'Supported on iPhone 12+, iPad Pro M1+, Apple TV 4K (2021+). Requires VIDEO-RANGE=PQ in HLS master playlist. Safari deliberately hides DV support in canPlayType() but mediaCapabilities reveals it. Use "dvh1" codec string for maximum compatibility.',
                        lg: 'webOS 5.0+ supports Profile 8.1 on OLED/QNED models. webOS 6.0+ required for MKV containers. May show race condition on first load (getSupportedHdrProfiles() returns empty array before Luna IPC completes). Refresh page if DV shows unsupported initially.',
                        android: 'Highly fragmented. Requires: (1) Android 12+ for DASH support (2) Dolby Vision capable display (check DisplayManager.getDisplay().getHdrCapabilities()) (3) MediaCodec support (codec name "c2.dolby.dv.decoder" or "OMX.dolby.dv.decoder"). Pixel 6+, Samsung S21+, OnePlus 9+ confirmed working. Use Widevine L1 for DRM content.'
                    }
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
            // 8K
            {
                name: "AV1 Main (8K Level 6.0)",
                codec: 'video/mp4; codecs="av01.0.16M.10"',
                container: "MP4",
                info: "8K @ 30fps",
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
                            notes: 'Media playlist (.m3u8) references .m4s segment files. Each segment is a self-contained fMP4 with moof+mdat boxes. Requires separate init segment (init.mp4) with moov box. EXT-X-VERSION:6 enables fMP4 support (v5 and below use MPEG-TS).'
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
                    }
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
                        channels: 16,
                        bitrate: 768000,
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
                        bitrate: 24500000,
                        samplerate: 192000
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
            }
        ]
    }
};
