function analyzeStorage() {
    const cookies = document.cookie.split(';');
    $('#cookies-count').text(cookies.filter(c => c.trim() !== '').length);
    let localStorageCount = 0;
    if (window.localStorage) {
        localStorageCount = Object.keys(localStorage).length;
        $('#local-storage-count').text(localStorageCount);
    }
    let sessionStorageCount = 0;
    if (window.sessionStorage) {
        sessionStorageCount = Object.keys(sessionStorage).length;
        $('#session-storage-count').text(sessionStorageCount);
    }
    if (window.indexedDB) {
        $('#indexeddb-status').html('<span class="text-success">Поддерживается</span>');
    } else {
        $('#indexeddb-status').html('<span class="text-danger">Не поддерживается</span>');
    }
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => {
            $('#service-worker-count').text(regs.length);
        });
    }
}

$(document).ready(function() {
    analyzeStorage();
    $('#refresh-storage-btn').click(analyzeStorage);
});
