/**
 * Codec Test Database
 *
 * Covers all major video and audio codecs with proper mediaCapabilities configurations
 * Based on ISO/IEC, Dolby, DTS, Apple HLS, and DASH specifications
 */

const codecDatabase = {
    // ==================== VIDEO CODECS ====================
    
    video_hevc: {
        category: "HEVC/H.265",
        tests: [
            {
                name: "HEVC Main (SDR 1080p)",
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
                name: "HEVC Main (SDR 1080p)",
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
            {
                name: "HEVC Main 10 (HDR10 4K)",
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
                }
            },
            {
                name: "HEVC Main 10 (HDR10 4K)",
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
                info: "Alternative tag",
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
            {
                name: "HEVC Main 10 8K (Level 6.1)",
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
            }
        ]
    },

    video_dolby_vision: {
        category: "Dolby Vision",
        tests: [
            {
                name: "DV Profile 5 (dvh1)",
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
                name: "DV Profile 5 (dvhe)",
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
                name: "DV Profile 5 (MKV)",
                codec: 'video/x-matroska; codecs="dvh1.05.06"',
                container: "MKV",
                info: "webOS 25+ only",
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
            {
                name: "DV Profile 7 (Blu-ray MEL)",
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
                name: "DV Profile 7 (MKV)",
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
            {
                name: "DV Profile 8.1 (Cross-Compatible)",
                codec: 'video/mp4; codecs="dvh1.08.06"',
                container: "MP4",
                info: "HDR10 base + DV",
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
                }
            },
            {
                name: "DV Profile 8.1 (MKV)",
                codec: 'video/x-matroska; codecs="dvh1.08.06"',
                container: "MKV",
                info: "HDR10 base + DV",
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
            {
                name: "DV P5 + HEVC base (Multi-codec)",
                codec: 'video/mp4; codecs="hvc1.2.4.L153.B0, dvh1.05.07"',
                container: "MP4",
                info: "Dual codec declaration",
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
            }
        ]
    },

    video_av1: {
        category: "AV1",
        tests: [
            {
                name: "AV1 Main Profile (SDR 1080p)",
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
                name: "AV1 Main Profile (HDR10 4K)",
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
                name: "AV1 Main Profile (HDR10 4K MKV)",
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
                name: "AV1 High Profile (4K 60fps)",
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
            {
                name: "AV1 Film Grain (WebM)",
                codec: 'video/webm; codecs="av01.0.08M.10.0.110.01.01.01.0"',
                container: "WebM",
                info: "With grain synthesis",
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
            }
        ]
    },

    video_vp9: {
        category: "VP9",
        tests: [
            {
                name: "VP9 Profile 0 (SDR)",
                codec: 'video/webm; codecs="vp9"',
                container: "WebM",
                info: "8-bit",
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
                name: "VP9 Profile 2 (HDR 4K)",
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
                name: "VP9 Profile 2 (MP4 - Non-standard)",
                codec: 'video/mp4; codecs="vp09.02.10.10"',
                container: "MP4",
                info: "Experimental",
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
            }
        ]
    },

    video_avc: {
        category: "AVC/H.264",
        tests: [
            {
                name: "H.264 High Profile (1080p)",
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
                name: "H.264 High Profile (1080p MKV)",
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
                name: "H.264 Main Profile",
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
            {
                name: "H.264 Baseline",
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
            }
        ]
    },

    // ==================== AUDIO CODECS ====================

    audio_dolby: {
        category: "Dolby Audio",
        tests: [
            {
                name: "Dolby Digital (AC-3)",
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
            {
                name: "Dolby Digital Plus (E-AC-3)",
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
            {
                name: "Dolby TrueHD",
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
                name: "Dolby TrueHD + Atmos (MLP)",
                codec: 'audio/x-matroska; codecs="mlp"',
                container: "MKV",
                info: "MLP codec",
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
            }
        ]
    },

    audio_dts: {
        category: "DTS Audio",
        tests: [
            {
                name: "DTS Core",
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
            {
                name: "DTS Express (LBR)",
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
            {
                name: "DTS:X",
                codec: 'audio/x-matroska; codecs="dtsx"',
                container: "MKV",
                info: "Object-based",
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
            {
                name: "FLAC",
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
                name: "FLAC (MP4 - Non-standard)",
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
                name: "ALAC (Apple Lossless)",
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
                name: "Opus",
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
            }
        ]
    },

    audio_standard: {
        category: "Standard Audio",
        tests: [
            {
                name: "AAC-LC",
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
                name: "AAC-HE v1",
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
                name: "AAC-HE v2",
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
            {
                name: "Vorbis",
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
            }
        ]
    }
};
