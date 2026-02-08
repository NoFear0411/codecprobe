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
            },
            // Additional VP9 profiles
            {
                name: "VP9 Profile 1 (8-bit 4:2:2 WebM)",
                codec: 'video/webm; codecs="vp09.01.10.08"',
                container: "WebM",
                info: "8-bit non-4:2:0 subsampling",
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
