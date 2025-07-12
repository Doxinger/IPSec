function checkWebGLInfo() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const statusElement = $('#webgl-status');
    const rendererElement = $('#webgl-renderer');
    const vendorElement = $('#webgl-vendor');

    if (!gl) {
        statusElement.html('<span class="text-danger">Не поддерживается</span>');
        return;
    }

    statusElement.html('<span class="text-success">Поддерживается</span>');

    try {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            rendererElement.text(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
            vendorElement.text(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
        } else {
            rendererElement.text('Недоступно (требуется расширение)');
            vendorElement.text('Недоступно');
        }
    } catch (e) {
        rendererElement.text('Ошибка доступа');
        vendorElement.text('Ошибка доступа');
    }
}

$(document).ready(function() {
    checkWebGLInfo();
});
