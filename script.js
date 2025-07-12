$(document).ready(function() {
    detectBrowserAndOS();
    detectDeviceInfo();
    getIPAddress();
    updateLocalTime();
    checkBattery();
    checkTelegram();
    setInterval(updateLocalTime, 1000);
    
    $('.card-header').append('<button class="btn btn-sm btn-light float-end refresh-btn">Обновить</button>');
    
    $(document).on('click', '.refresh-btn', function() {
        $(this).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Загрузка...');
        getIPAddress();
        checkBattery();
    });
});

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
        dataType: 'json',
        beforeSend: () => $('#ip-address').html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Загрузка...'),
        success: (data) => {
            $('#ip-address').text(data.ip);
            getGeoInfo(data.ip);
        },
        error: () => {
            $('#ip-address').html('<span class="text-danger">Не удалось определить</span>');
            $('.refresh-btn').html('Обновить');
            getGeoInfo();
        }
    });
}

function getGeoInfo(ip) {
    const apis = [
        `https://ipapi.co/${ip||''}/json/`,
        `https://ipwho.is/${ip||''}`,
        'https://freeipapi.com/api/json'
    ];

    let currentApi = 0;

    const tryNextApi = () => {
        if (currentApi >= apis.length) {
            $('#city, #country, #isp').html('<span class="text-danger">Не удалось определить</span>');
            $('#coordinates').html('<span class="text-danger">Не удалось определить</span>');
            $('.refresh-btn').html('Обновить');
            return;
        }

        $.ajax({
            url: apis[currentApi],
            type: 'GET',
            dataType: 'json',
            beforeSend: () => $('#city, #country, #isp, #coordinates').html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Загрузка...'),
            success: (data) => {
                const city = data.city || data.ipName;
                const country = data.country_name || data.countryName || data.country;
                const isp = data.org || data.connection?.isp || data.isp;
                const lat = data.latitude || data.lat;
                const lon = data.longitude || data.lon;

                $('#city').text(city || 'Неизвестно');
                $('#country').text(country || 'Неизвестно');
                $('#isp').text(isp || 'Неизвестно');
                
                if (lat && lon) {
                    $('#coordinates').text(`${lat}, ${lon}`);
                    showMap(lat, lon, city);
                } else {
                    $('#coordinates').html('<span class="text-warning">Координаты не найдены</span>');
                }
                $('.refresh-btn').html('Обновить');
            },
            error: () => {
                currentApi++;
                tryNextApi();
            }
        });
    };

    tryNextApi();
}

function showMap(lat, lng, city) {
    if (typeof map !== 'undefined') map.remove();
    
    const map = L.map('map').setView([lat, lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    
    L.marker([lat, lng]).addTo(map)
        .bindPopup(city || 'Ваше местоположение')
        .openPopup();
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
        } else {
            $('#tg-user-id, #tg-username, #tg-first-name, #tg-last-name, #tg-language').text('Не доступно');
        }
    } else {
        $('#telegram-info').text('Не обнаружено');
    }
}
