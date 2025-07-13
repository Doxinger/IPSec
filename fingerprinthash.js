function generateFingerprint() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    const getWebGLInfo = () => {
        if (!gl) return null;
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        return {
            renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : null,
            vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : null
        };
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

    const jsonString = JSON.stringify(components);
    let hash = 0;
    for (let i = 0; i < jsonString.length; i++) {
        hash = (hash << 5) - hash + jsonString.charCodeAt(i);
        hash |= 0;
    }
    
    return {
        hash: Math.abs(hash).toString(36).slice(0, 8),
        details: components
    };
}

function displayFingerprint() {
    const {hash, details} = generateFingerprint();
    document.getElementById('fingerprint-hash').textContent = `Hash: ${hash}`;
    
    const detailsContainer = document.getElementById('fingerprint-details');
    detailsContainer.innerHTML = '';
    
    for (const [key, value] of Object.entries(details)) {
        const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
        detailsContainer.innerHTML += `
            <div class="col-md-6 fingerprint-param">
                <strong>${key}:</strong> <span class="text-muted">${valueStr}</span>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', displayFingerprint);
document.getElementById('refresh-fingerprint').addEventListener('click', displayFingerprint); 
