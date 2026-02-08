/**
 * Device Detection Module
 * 
 * Detects browser, OS, device model, and hardware capabilities
 * with detailed version information
 */

function detectDeviceInfo() {
    const ua = navigator.userAgent;
    const info = {
        userAgent: ua,
        browser: 'Unknown',
        browserVersion: '',
        os: 'Unknown',
        osVersion: '',
        platform: navigator.platform,
        webOS: false,
        tvOS: false,
        iOS: false,
        android: false,
        vendor: navigator.vendor || 'Unknown',
        language: navigator.language,
        hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown',
        deviceMemory: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'Unknown'
    };

    let match;

    // ==================== BROWSER DETECTION ====================
    if ((match = ua.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/)) && !ua.includes('Edg')) {
        info.browser = 'Chrome';
        info.browserVersion = match[1];
    } else if ((match = ua.match(/Safari\/(\d+\.\d+)/)) && !ua.includes('Chrome')) {
        info.browser = 'Safari';
        const versionMatch = ua.match(/Version\/(\d+\.\d+\.\d+)/);
        info.browserVersion = versionMatch ? versionMatch[1] : match[1];
    } else if ((match = ua.match(/Firefox\/(\d+\.\d+)/))) {
        info.browser = 'Firefox';
        info.browserVersion = match[1];
    } else if ((match = ua.match(/Edg\/(\d+\.\d+\.\d+\.\d+)/))) {
        info.browser = 'Edge';
        info.browserVersion = match[1];
    } else if ((match = ua.match(/OPR\/(\d+\.\d+)/))) {
        info.browser = 'Opera';
        info.browserVersion = match[1];
    }

    // ==================== OS DETECTION ====================
    
    // webOS (LG TVs)
    if ((match = ua.match(/Web0S[/;\s]*([\d.]+)/i))) {
        info.os = 'webOS';
        info.webOS = true;
        info.osVersion = match[1];
        info.webOSVersion = match[1];
        
        // Extract TV model if available
        if ((match = ua.match(/LG[A-Z]+\d+/))) {
            info.deviceModel = match[0];
        }
    }
    // iOS / iPadOS
    else if (ua.includes('iPad') || ua.includes('iPhone') || ua.includes('iPod')) {
        info.iOS = true;
        const osMatch = ua.match(/OS (\d+)[_.](\d+)[_.]?(\d+)?/);
        if (osMatch) {
            info.osVersion = `${osMatch[1]}.${osMatch[2]}${osMatch[3] ? '.' + osMatch[3] : ''}`;
        }
        info.os = ua.includes('iPad') ? 'iPadOS' : 'iOS';
        
        // Detect device model
        if ((match = ua.match(/iPhone(\d+,\d+)/))) {
            info.deviceModel = match[0];
        } else if ((match = ua.match(/iPad(\d+,\d+)/))) {
            info.deviceModel = match[0];
        }
    }
    // macOS
    else if ((match = ua.match(/Mac OS X (\d+)[_.](\d+)[_.]?(\d+)?/))) {
        info.os = 'macOS';
        info.osVersion = `${match[1]}.${match[2]}${match[3] ? '.' + match[3] : ''}`;
    }
    // Windows
    else if ((match = ua.match(/Windows NT (\d+\.\d+)/))) {
        info.os = 'Windows';
        const winVersions = {
            '10.0': 'Windows 10/11',
            '6.3': 'Windows 8.1',
            '6.2': 'Windows 8',
            '6.1': 'Windows 7',
            '6.0': 'Windows Vista',
            '5.1': 'Windows XP'
        };
        info.osVersion = winVersions[match[1]] || match[1];
    }
    // Android
    else if ((match = ua.match(/Android (\d+(?:\.\d+)?)/))) {
        info.android = true;
        info.os = 'Android';
        info.osVersion = match[1];
        
        // Try to extract device model
        if ((match = ua.match(/;\s*([^;]+)\s+Build\//))) {
            info.deviceModel = match[1].trim();
        }
    }
    // tvOS (Apple TV)
    else if ((match = ua.match(/tvOS (\d+\.\d+)/))) {
        info.tvOS = true;
        info.os = 'tvOS';
        info.osVersion = match[1];
    }
    // Linux
    else if (ua.includes('Linux')) {
        info.os = 'Linux';
        if ((match = ua.match(/Ubuntu\/(\d+\.\d+)/))) {
            info.osVersion = `Ubuntu ${match[1]}`;
        }
    }

    // ==================== DISPLAY CAPABILITIES ====================
    
    // HDR support detection
    if (window.matchMedia) {
        info.screenHDR = window.matchMedia('(dynamic-range: high)').matches;
        info.wideGamut = window.matchMedia('(color-gamut: p3)').matches;
        info.rec2020 = window.matchMedia('(color-gamut: rec2020)').matches;
    }

    // Screen information
    info.screenWidth = screen.width;
    info.screenHeight = screen.height;
    info.pixelRatio = window.devicePixelRatio || 1;
    info.colorDepth = screen.colorDepth;

    // ==================== API SUPPORT DETECTION ====================
    
    info.apiSupport = {
        canPlayType: true,
        isTypeSupported: typeof MediaSource !== 'undefined' && typeof MediaSource.isTypeSupported === 'function',
        mediaCapabilities: typeof navigator.mediaCapabilities !== 'undefined' && 
                          typeof navigator.mediaCapabilities.decodingInfo === 'function',
        mediaSource: typeof MediaSource !== 'undefined',
        encryptedMedia: typeof navigator.requestMediaKeySystemAccess !== 'undefined',
        webRTC: typeof RTCPeerConnection !== 'undefined',
        webGL: (() => {
            try {
                const canvas = document.createElement('canvas');
                return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
            } catch (e) {
                return false;
            }
        })()
    };

    return info;
}
