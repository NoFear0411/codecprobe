Apple HLS: Audio Codecs

+-----------------------+-------------------+-----------------------------------+
| Codec                 | Format Identifier | Description                       |
+-----------------------+-------------------+-----------------------------------+
| AAC-LC                | mp4a.40.2         | Standard AAC audio                |
| HE-AAC                | mp4a.40.5         | High-Efficiency AAC               |
| HE-AACv2              | mp4a.40.29        | High-Efficiency AAC v2            |
| xHE-AAC               | mp4a.40.42        | Extended HE-AAC                   |
| MP3                   | mp4a.40.34        | MPEG Layer III audio              |
| AC-3                  | ac-3              | Dolby Digital audio               |
| Enhanced AC-3 (EAC3)  | ec-3              | Dolby Digital Plus (Atmos support)|
| ALAC                  | alac              | Apple Lossless Audio Codec        |
| FLAC                  | fLaC              | Free Lossless Audio Codec         |
| Apple Positional      | apac              | Spatial audio (e.g., apac.31.00)  |
+-----------------------+-------------------+-----------------------------------+

Apple HLS: Video Codecs

+-----------------+-----------+-------------------------+-----------------+
| Codec           | Format ID | Description             | Status          |
+-----------------+-----------+-------------------------+-----------------+
| H.264 (AVC)     | avc1      | Advanced Video Coding   | Recommended     |
| H.264           | avc3      | Alternative AVC format  | Not recommended |
| HEVC (H.265)    | hvc1      | High-Efficiency Coding  | Recommended     |
| HEV             | hev1      | Alternative HEVC format | Not recommended |
| Dolby Vision    | dvh1      | Based on HEVC profiles  | Recommended     |
| Dolby Vision    | dvhe      | Alt Dolby Vision format | Not recommended |
| JPEG            | mjpg      | Image sequence support  | Limited use     |
+-----------------+-----------+-------------------------+-----------------+

Additional Formats
Plaintext

+-----------------------+-------------------+-----------------------------+
| Type                  | Format Identifier | Use                         |
+-----------------------+-------------------+-----------------------------+
| Subtitles (IMSC/TTML) | stpp.ttml.im1t    | Text-only subtitles         |
| WebVTT                | wvtt              | Web Video Text Tracks       |
+-----------------------+-------------------+-----------------------------+

Ref:https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices-appendixes
