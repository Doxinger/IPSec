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
    const userAgent = navigator.userAgent;
    let browser, version, os;
    
    if (userAgent.includes('Firefox')) {
        browser = 'Mozilla Firefox';
        version = userAgent.match(/Firefox\/(\d+)/)[1];
    } else if (userAgent.includes('Edg')) {
        browser = 'Microsoft Edge';
        version = userAgent.match(/Edg\/(\d+)/)[1];
    } else if (userAgent.includes('Chrome')) {
        browser = 'Google Chrome';
        version = userAgent.match(/Chrome\/(\d+)/)[1];
    } else if (userAgent.includes('Safari')) {
        browser = 'Apple Safari';
        version = userAgent.match(/Version\/(\d+)/)[1];
    } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
        browser = 'Opera';
        version = userAgent.match(/(?:Opera|OPR)\/(\d+)/)[1];
    } else {
        browser = 'Неизвестный браузер';
        version = 'Неизвестно';
    }
    
    if (userAgent.includes('Windows')) {
        os = 'Windows';
    } else if (userAgent.includes('Mac')) {
        os = 'MacOS';
    } else if (userAgent.includes('Linux')) {
        os = 'Linux';
    } else if (userAgent.includes('Android')) {
        os = 'Android';
    } else if (userAgent.includes('iOS')) {
        os = 'iOS';
    } else {
        os = 'Неизвестная ОС';
    }
    
    $('#browser').text(browser);
    $('#browser-version').text(version);
    $('#os').text(os);
}

function detectDeviceInfo() {
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    $('#screen-resolution').text(`${screenWidth} × ${screenHeight}`);
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
        beforeSend: function() {
            $('#ip-address').html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Загрузка...');
        },
        success: function(data) {
            $('#ip-address').text(data.ip);
            getGeoInfo(data.ip);
        },
        error: function() {
            $('#ip-address').html('<span class="text-danger">Не удалось определить</span>');
            $('.refresh-btn').html('Обновить');
            getGeoInfo();
        }
    });
}

function getGeoInfo(ip) {
    const apis = [
        `https://ipapi.co/${ip || ''}/json/`,
        `https://ipwho.is/${ip || ''}`,
        'https://freeipapi.com/api/json'
    ];

    let currentApi = 0;

    const tryNextApi = function() {
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
            beforeSend: function() {
                $('#city, #country, #isp, #coordinates').html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Загрузка...');
            },
            success: function(data) {
                let city, country, isp, lat, lon;
                
                // Обработка разных апишек
                if (data.city !== undefined) {
                    city = data.city;
                    country = data.country_name || data.country;
                    isp = data.org || data.connection?.isp;
                    lat = data.latitude;
                    lon = data.longitude;
                } else if (data.ipName !== undefined) {
                    city = data.city;
                    country = data.countryName;
                    isp = data.isp;
                    lat = data.latitude;
                    lon = data.longitude;
                }

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
            error: function() {
                currentApi++;
                tryNextApi();
            }
        });
    };

    tryNextApi();
}

function showMap(lat, lng, city) {
    if (typeof map !== 'undefined') {
        map.remove();
    }
    
    const map = L.map('map').setView([lat, lng], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    L.marker([lat, lng]).addTo(map)
        .bindPopup(city || 'Ваше местоположение')
        .openPopup();
}

function updateLocalTime() {
    const now = new Date();
    $('#local-time').text(now.toLocaleString());
}

function checkBattery() {
    if ('getBattery' in navigator) {
        navigator.getBattery().then(function(battery) {
            const level = Math.round(battery.level * 100);
            $('#battery-level').text(`${level}%`);
            
            battery.addEventListener('levelchange', function() {
                const newLevel = Math.round(battery.level * 100);
                $('#battery-level').text(`${newLevel}%`);
            });
        });
    } else {
        $('#battery-level').text('Недоступно');
    }
}

function checkTelegram() {
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        $('#telegram-info').html('<span class="text-success">Обнаружено</span>');
        $('#telegram-data').removeClass('d-none');
        
        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            const user = tg.initDataUnsafe.user;
            $('#tg-user-id').text(user.id || 'Не указано');
            $('#tg-username').text(user.username ? `@${user.username}` : 'Не указано');
            $('#tg-first-name').text(user.first_name || 'Не указано');
            $('#tg-last-name').text(user.last_name || 'Не указано');
            $('#tg-language').text(tg.initDataUnsafe.user.language_code || 'Не указано');
        } else {
            $('#tg-user-id').text('Не доступно');
            $('#tg-username').text('Не доступно');
            $('#tg-first-name').text('Не доступно');
            $('#tg-last-name').text('Не доступно');
            $('#tg-language').text('Не доступно');
        }
    } else {
        $('#telegram-info').text('Не обнаружено');
    }
          }
