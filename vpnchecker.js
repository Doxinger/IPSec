function checkVPNProxy() {
    const statusElement = $('#vpn-status');
    const typeElement = $('#connection-type');
    statusElement.html('<span class="spinner-border spinner-border-sm"></span> Проверка...');
    typeElement.text('Определение...');

    const apis = [
        { url: 'https://ipapi.co/json/', key: 'org' },
        { url: 'https://ipwho.is/', key: 'connection.isp' },
        { url: 'https://ipinfo.io/json', key: 'org' },
        { url: 'https://geolocation-db.com/json/', key: 'organization' }
    ];

    let currentApi = 0;
    let detectedType = '';

    const detectProxyType = (isp) => {
        isp = isp.toLowerCase();
        if (isp.includes('vpn')) return 'VPN';
        if (isp.includes('proxy')) return 'Proxy';
        if (isp.includes('tor')) return 'Tor';
        if (isp.includes('anonymous')) return 'Анонимный';
        if (isp.includes('hosting') || isp.includes('datacenter')) return 'Хостинг';
        return 'Прямое соединение';
    };

    const tryApi = () => {
        if (currentApi >= apis.length) {
            statusElement.html(detectedType ? 
                `<span class="text-danger">${detectedType}</span>` : 
                '<span class="text-warning">Не удалось проверить</span>');
            return;
        }

        $.ajax({
            url: apis[currentApi].url,
            type: 'GET',
            dataType: 'json',
            success: (data) => {
                const ispPath = apis[currentApi].key.split('.');
                let isp = data;
                ispPath.forEach(key => isp = isp?.[key]);
                
                if (isp) {
                    const type = detectProxyType(isp);
                    if (type !== 'Прямое соединение') {
                        detectedType = `${type} (${isp})`;
                        statusElement.html(`<span class="text-danger">Обнаружено</span>`);
                        typeElement.text(detectedType);
                        return;
                    }
                }
                
                currentApi++;
                tryApi();
            },
            error: () => {
                currentApi++;
                tryApi();
            }
        });
    };

    tryApi();
}

$(document).ready(() => {
    $('#check-vpn-btn').click(checkVPNProxy);
    checkVPNProxy();
});
