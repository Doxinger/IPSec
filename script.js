$(document).ready(function() {
    initTheme();
    setupThemeToggle();
    detectBrowserAndOS();
    detectDeviceInfo();
    getIPAddress();
    updateLocalTime();
    checkBattery();
    checkTelegram();
    requestGeolocation();
    setInterval(updateLocalTime, 1000);
});

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    $('html').attr('data-bs-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function setupThemeToggle() {
    $('#theme-toggle').click(function() {
        const currentTheme = $('html').attr('data-bs-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        $('html').attr('data-bs-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const icon = theme === 'dark' ? 'bi-sun-fill' : 'bi-moon-fill';
    $('#theme-toggle i').attr('class', 'bi ' + icon);
}

function requestGeolocation() {
    if ("geolocation" in navigator) {
        $('#coordinates').html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Запрос разрешения...');
        
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                $('#coordinates').text(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
                showMap(lat, lon, "Ваше местоположение");
                getAddressFromCoords(lat, lon);
            },
            function(error) {
                let errorMessage = "Ошибка геолокации";
                $('#coordinates').html(`<span class="text-warning">${errorMessage}</span>`);
                getGeoInfo();
            },
            {enableHighAccuracy: true, timeout: 10000}
        );
    } else {
        $('#coordinates').html('<span class="text-warning">Геолокация не поддерживается</span>');
        getGeoInfo();
    }
}

function getAddressFromCoords(lat, lon) {
    $.ajax({
        url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        type: 'GET',
        success: function(data) {
            if (data.address) {
                $('#city').text(data.address.city || data.address.town || data.address.village || 'Неизвестно');
                $('#country').text(data.address.country || 'Неизвестно');
            }
        }
    });
}

function detectBrowserAndOS() {
    const ua = navigator.userAgent;
    let browser, version, os;

    if (/Android/.test(ua)) os = 'Android';
    else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS';
    else if (/Windows Phone/.test(ua)) os = 'Windows Mobile';
    else if (/Win/.test(ua)) os = 'Windows';
    else if (/Mac/.test(ua)) os = 'MacOS';
    else if (/Linux/.test(ua)) os = 'Linux';
    else os = 'Неизвестная ОС';

    if (/Firefox\//.test(ua)) {
        browser = 'Firefox';
        version = ua.match(/Firefox\/(\d+)/)[1];
    } else if (/Edg\//.test(ua)) {
        browser = 'Edge';
        version = ua.match(/Edg\/(\d+)/)[1];
    } else if (/Chrome\//.test(ua)) {
        browser = 'Chrome';
        version = ua.match(/Chrome\/(\d+)/)[1];
    } else if (/Safari\//.test(ua)) {
        browser = 'Safari';
        version = ua.match(/Version\/(\d+)/)[1];
    } else if (/OPR\//.test(ua)) {
        browser = 'Opera';
        version = ua.match(/OPR\/(\d+)/)[1];
    } else {
        browser = 'Неизвестный браузер';
        version = '?';
    }

    $('#browser').text(browser);
    $('#browser-version').text(version);
    $('#os').text(os);
}

function detectDeviceInfo() {
    $('#screen-resolution').text(`${screen.width} × ${screen.height}`);
    $('#language').text(navigator.language || navigator.userLanguage);
    $('#javascript-enabled').text('Да');
    $('#cookies-enabled').text(navigator.cookieEnabled ? 'Да' : 'Нет');
    $('#timezone').text(Intl.DateTimeFormat().resolvedOptions().timeZone);
}

function getIPAddress() {
    $.ajax({
        url: 'https://api.ipify.org?format=json',
        type: 'GET',
        beforeSend: () => $('#ip-address').html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Загрузка...'),
        success: (data) => {
            $('#ip-address').text(data.ip);
            getGeoInfo(data.ip);
        },
        error: () => $('#ip-address').html('<span class="text-danger">Не удалось определить</span>')
    });
}

function getGeoInfo(ip) {
    $.ajax({
        url: `https://ipapi.co/${ip||''}/json/`,
        type: 'GET',
        beforeSend: () => $('#city, #country, #isp').html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Загрузка...'),
        success: (data) => {
            $('#city').text(data.city || 'Неизвестно');
            $('#country').text(data.country_name || 'Неизвестно');
            $('#isp').text(data.org || 'Неизвестно');
            if (data.latitude && data.longitude) {
                showMap(data.latitude, data.longitude, data.city);
            }
        },
        error: () => $('#city, #country, #isp').html('<span class="text-danger">Не удалось определить</span>')
    });
}

function showMap(lat, lng, city) {
    if (typeof map !== 'undefined') map.remove();
    const map = L.map('map').setView([lat, lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    L.marker([lat, lng]).addTo(map).bindPopup(city || 'Ваше местоположение').openPopup();
}

function updateLocalTime() {
    $('#local-time').text(new Date().toLocaleString());
}

function checkBattery() {
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            $('#battery-level').text(`${Math.round(battery.level * 100)}%`);
            battery.addEventListener('levelchange', () => {
                $('#battery-level').text(`${Math.round(battery.level * 100)}%`);
            });
        });
    } else {
        $('#battery-level').text('Недоступно');
    }
}

function checkTelegram() {
    if (window.Telegram?.WebApp) {
        const tg = Telegram.WebApp;
        $('#telegram-info').html('<span class="text-success">Обнаружено</span>');
        $('#telegram-data').removeClass('d-none');
        if (tg.initDataUnsafe?.user) {
            const u = tg.initDataUnsafe.user;
            $('#tg-user-id').text(u.id || 'Не указано');
            $('#tg-username').text(u.username ? `@${u.username}` : 'Не указано');
            $('#tg-first-name').text(u.first_name || 'Не указано');
            $('#tg-last-name').text(u.last_name || 'Не указано');
            $('#tg-language').text(u.language_code || 'Не указано');
        }
    }
}
