function generateFingerprint() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    const getWebGLInfo = () => {
        if (!gl) return null;
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        return debugInfo ? {
            renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
            vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
        } : null;
    };

    const getCanvasFingerprint = () => {
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('Fingerprint', 2, 15);
        return canvas.toDataURL().slice(-32);
    };

    const components = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        cores: navigator.hardwareConcurrency,
        memory: navigator.deviceMemory,
        resolution: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        webgl: getWebGLInfo(),
        canvas: getCanvasFingerprint(),
        fonts: Array.from(document.fonts).map(f => f.family).join(',').slice(0, 50),
        touch: 'ontouchstart' in window,
        cookies: navigator.cookieEnabled,
        dnt: navigator.doNotTrack
    };

    const hash = Array.from(JSON.stringify(components)).reduce((h, c) => Math.imul(31, h) + c.charCodeAt(0) | 0, 0);
    
    return {
        hash: Math.abs(hash).toString(36).slice(0, 8),
        details: components
    };
}

function displayFingerprint() {
    const {hash, details} = generateFingerprint();
    const hashElement = document.getElementById('fingerprint-hash');
    const detailsContainer = document.getElementById('fingerprint-details');
    
    if (hashElement) hashElement.textContent = `Hash: ${hash}`;
    if (!detailsContainer) return;
    
    detailsContainer.innerHTML = Object.entries(details).map(([key, value]) => {
        const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
        return `
            <div class="col-md-6 mb-2">
                <div class="fingerprint-param p-2 bg-light rounded">
                    <strong class="d-block text-truncate">${key}:</strong>
                    <span class="text-muted small">${valueStr}</span>
                </div>
            </div>
        `;
    }).join('');
}

function initFingerprint() {
    document.addEventListener('DOMContentLoaded', displayFingerprint);
    const refreshButton = document.getElementById('refresh-fingerprint');
    if (refreshButton) refreshButton.addEventListener('click', displayFingerprint);
}

initFingerprint();
